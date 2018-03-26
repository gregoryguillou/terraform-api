const { WebClient } = require('@slack/client')
const logger = require('./logger')
const request = require('request')

const message = (props, text) => {
  const web = new WebClient(props.slack.userbot_token)
  web.chat.postMessage({
    channel: props.conversationId,
    text: text,
    mrkdwn: true })
    .then((res) => {
      logger.info(`Message sent back to ${props.userId}`)
    })
    .catch(console.error)
}

const authenticate = (props, callback) => {
  const options = {
    url: `${props.apiurl}/login`,
    headers: {Authorization: `Key ${props.apikey}`}
  }
  request.get(options, (err, data) => {
    if (err) {
      message(props, `Error connecting to the API:\n${err.text}`)
      if (callback) { callback(err, null) }
    } else {
      const token = JSON.parse(data.body).token
      if (callback) { callback(null, {token}) }
    }
  })
}

const get = (props, url, callback) => {
  authenticate(props, (err, data) => {
    if (err) { throw err }
    const options = {
      url: `${props.apiurl}${url}`,
      headers: {Authorization: `Bearer ${data.token}`}
    }
    request.get(options, (err, data) => {
      if (err) {
        message(props, `Error connecting to the API:\n${err.text}`)
        if (callback) { callback(err, null) }
      } else {
        if (callback) { callback(null, JSON.parse(data.body)) }
      }
    })
  })
}

const post = (props, url, payload, callback) => {
  authenticate(props, (err, data) => {
    if (err) { throw err }
    const options = {
      url: `${props.apiurl}${url}`,
      headers: {Authorization: `Bearer ${data.token}`},
      json: payload
    }
    request.post(options, (err, response, data) => {
      if (err) {
        message(props, `Error connecting to the API:\n${err.text}`)
        if (callback) { callback(err, null, null) }
      } else {
        if (callback) { callback(null, response, null) }
      }
    })
  })
}

const show = (props, callback) => {
  get(props, `/projects/${props.project}/workspaces/${props.workspace}`, (err, data) => {
    if (err) {
      message(
        props,
        'Error detected:\n'
          .concat(err.text)
      )
      return
    }
    message(
      props,
      'You are working on:\n'
        .concat(`\`\`\``)
        .concat(`project:   ${data.project}\n`)
        .concat(`workspace: ${data.workspace}\n`)
        .concat(`ref:       ${data.ref}\n`)
        .concat(`state:     ${data.state}\n`)
        .concat(`\`\`\``)
    )
  })
}

const tags = (props, callback) => {
  get(props, `/projects/${props.project}/tags`, (err, data) => {
    if (err) {
      message(
        props,
        'Error detected:\n'
          .concat(err.text)
      )
      return
    }
    let tagList = ''
    data.tags.forEach(element => {
      tagList = `${tagList}- ${element.name}\n`
    })
    message(
      props,
      `*tags* for project *${props.project}* are:\n`
        .concat(`\`\`\``)
        .concat(`${tagList}`)
        .concat(`\`\`\``)
    )
  })
}

const branches = (props, callback) => {
  get(props, `/projects/${props.project}/branches`, (err, data) => {
    if (err) {
      message(
        props,
        'Error detected:\n'
          .concat(err.text)
      )
      return
    }
    let branchesList = ''
    data.branches.forEach(element => {
      branchesList = `${branchesList}- ${element.name}\n`
    })
    message(
      props,
      `*tags* for project *${props.project}* are:\n`
        .concat(`\`\`\``)
        .concat(`${branchesList}`)
        .concat(`\`\`\``)
    )
  })
}

const quickcheck = (props, callback) => {
  get(props, `/projects/${props.project}/workspaces/${props.workspace}/status`, (err, data) => {
    if (err) {
      message(
        props,
        'Error detected:\n'
          .concat(err.text)
      )
      return
    }
    const statusMessage = (data.quickCheck === 'failure' ? '*failed* :skull_and_crossbones:' : '*passed* :heart_eyes:')
    message(
      props,
      `I've checked *${props.project}*/*${props.workspace}* and quickcheck has returned ${statusMessage}\n`)
  })
}

const apply = (props, callback) => {
  post(props, `/projects/${props.project}/workspaces/${props.workspace}`, {action: 'apply'}, (err, response, data) => {
    if (err) {
      message(
        props,
        'Error detected:\n'
          .concat(err.text)
      )
      return
    }
    let respMessage = 'request succeeded :heart_eyes:'
    if (response.statusCode === 209) {
      respMessage = 'change pending, please wait :sweat_smile:'
    } else if (response.statusCode !== 201) {
      respMessage = 'ough, it has failed :skull_and_crossbones:'
    }
    message(
      props,
      `I've submitted your request and I got: ${respMessage}\n`)
  })
}

const destroy = (props, callback) => {
  post(props, `/projects/${props.project}/workspaces/${props.workspace}`, {action: 'destroy'}, (err, response, data) => {
    if (err) {
      message(
        props,
        'Error detected:\n'
          .concat(err.text)
      )
      return
    }
    let respMessage = 'request succeeded :heart_eyes:'
    if (response.statusCode === 209) {
      respMessage = 'change pending, please wait :sweat_smile:'
    } else if (response.statusCode !== 201) {
      respMessage = 'ough, it has failed :skull_and_crossbones:'
    }
    message(
      props,
      `I've submitted your request and I got: ${respMessage}\n`)
  })
}

const helpList = [
  { key: 'apply',
    description: 'creates or updates the current project/workspace' },
  { key: 'destroy',
    description: 'destroys the current project/workspace' },
  { key: 'branches',
    description: 'lists the branches associated with the current project' },
  { key: 'help',
    description: 'lists the available commands; use *help command* to get help for a specific command' },
  { key: 'quickcheck',
    description: 'Performs a quickcheck of the workspace deployment and returns its status' },
  { key: 'show',
    description: 'provides some details about the workspace currently managed' },
  { key: 'tags',
    description: 'lists the tags associated with the current project' }]

const response = (props, msg) => {
  var helpString = ''
  for (var i = 0, size = helpList.length; i < size; i++) {
    if (i === 0) {
      helpString = `*${helpList[i].key}*`
    } else if (i < size - 1) {
      helpString = `${helpString}, *${helpList[i].key}*`
    } else {
      helpString = `${helpString} or *${helpList[i].key}*`
    }
  }

  logger.info(`${JSON.stringify(msg)}`)
  const verb = msg[0]
  let parameter = msg[1]

  if (verb === 'show') {
    return show(props, null)
  }
  if (verb === 'tags') {
    return tags(props, null)
  }

  if (verb === 'quickcheck') {
    return quickcheck(props, null)
  }

  if (verb === 'branches') {
    return branches(props, null)
  }

  if (verb === 'help') {
    if (parameter) {
      const help = helpList.find(p => p.key === parameter)
      if (help) {
        return message(props, `*${help.key}* ${help.description}`)
      }
      return message(props, `Command ${parameter} not found, type ${helpString}`)
    }
    return message(props, `The list of command you can use is ${helpString}`)
  }

  if (verb === 'apply') {
    return apply(props, null)
  }

  if (verb === 'destroy') {
    return destroy(props, null)
  }

  const sentence = Math.floor(Math.random() * 15)
  const formula = [
    `Hi <@${props.userId}>, so glad you need me...`,
    `Hey, where have you been?`,
    `Hello, sunshine! type one of ${helpString}`,
    `Howdy, partner!`,
    `Hey, howdy, hi! try ${helpString}`,
    `What’s kickin’, little chicken?`,
    `Peek-a-boo <@${props.userId}>! Yoo-hu`,
    `Howdy-doody!`,
    `Hey there, freshman!`,
    `My name's Terraform-Bot, and I'm a bad guy.`,
    `Hi, mister! try ${helpString}`,
    `I come in peace!`,
    `Put that cookie down!`,
    `Ahoy, matey! the words you are looking for are ${helpString}`,
    `Hiya <@${props.userId}>!`
  ]
  message(props, formula[sentence])
}

module.exports = {
  response: response
}
