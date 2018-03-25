const process = require('process')
const { WebClient } = require('@slack/client')

const message = (conversationId, text) => {
  web.chat.postMessage({
    channel: conversationId,
    text: text,
    mrkdwn: true })
    .then((res) => {
      console.log('Message sent: ', res.ts)
    })
    .catch(console.error)
}

const web = new WebClient(process.env.USERBOT_TOKEN)
let workspace = `staging`
let status = `destroyed`
let ref = 'branch:master'

const reply = (callback, target) => {
  setTimeout(callback, Math.floor(Math.random() * 10 + 5) * 1000, target)
}

const response = (conversationId, userId, msg) => {
  const verb = msg[0].toLowerCase()
  let parameter = msg[1]
  if (parameter) { parameter = parameter.toLowerCase() }

  if (verb === 'show') {
    message(conversationId, `You are working on:\n\`\`\`project:   demonstration\nworkspace: ${workspace}\nref:       ${ref}\nstatus:    ${status}\n\`\`\``)
  } else if (verb === 'tag') {
    if (['v0.0.1', 'v0.0.2', 'v0.1.1'].includes(parameter)) {
      ref = `tag:${parameter}`
      message(conversationId, `I've changed the current reference to *${ref}*`)
      message(conversationId, `You are working on:\n\`\`\`project:   demonstration\nworkspace: ${workspace}\nref:       ${ref}\nstatus:    ${status}\n\`\`\``)
    } else {
      if (parameter) {
        message(conversationId, `Sorry <@${userId}>, *${parameter}* does not seem to be a valid tag; try one of:\n\`\`\`- v0.0.1\n- v0.0.2\n- v0.1.1\n\`\`\``)
      } else {
        message(conversationId, `You must type \`tag [tag]\` with one of the tag below:\n\`\`\`- v0.0.1\n- v0.0.2\n- v0.1.1\n\`\`\``)
      }
    }
  } else if (verb === 'branch') {
    if (['master', 'feature/google-cloud-platform', 'feature/amazon-web-service', 'feature/kubernetes'].includes(parameter)) {
      ref = `branch:${parameter}`
      message(conversationId, `I've changed the current reference to *${ref}*`)
      message(conversationId, `You are working on:\n\`\`\`project:   demonstration\nworkspace: ${workspace}\nref:       ${ref}\nstatus:    ${status}\n\`\`\``)
    } else {
      if (parameter) {
        message(conversationId, `Sorry <@${userId}>, *${parameter}* does not seem to be a valid branch; try one of:\n\`\`\`- master\n- feature/google-cloud-platform\n- feature/amazon-web-service\n- feature/kubernetes\n\`\`\``)
      } else {
        message(conversationId, `You must type \`branch [branch]\` with one of the branch below:\n\`\`\`- master\n- feature/google-cloud-platform\n- feature/amazon-web-service\n- feature/kubernetes\n\`\`\``)
      }
    }
  } else if (verb === 'help') {
    message(conversationId, `I'll work the stack for you, choose one of the following keywords: *apply*, *branch*, *destroy*, *info*, *help*, *quickcheck*, *show*, *tag* or *workspace*`)
  } else if (verb === 'quickcheck') {
    let quickcheck = '*failed* :skull_and_crossbones:'
    if (status === 'applied') { quickcheck = '*passed* :heart_eyes:' }
    message(conversationId, `Quickcheck ${quickcheck} for the stack below:\n\`\`\`project:   demonstration\nworkspace: ${workspace}\nref:       ${ref}\nstatus:    ${status}\n\`\`\``)
  } else if (verb === 'info') {
    message(conversationId, `Your profile is the following:\`\`\`- timezone: Europe/Paris\`\`\``)
  } else if (verb === 'workspace') {
    if (['staging', 'qualification', 'test1', 'test2', 'dev1', 'dev2'].includes(parameter)) {
      workspace = parameter
      message(conversationId, `I've changed the current workspace to *${workspace}*`)
      message(conversationId, `You are working on:\n\`\`\`project:   demonstration\nworkspace: ${workspace}\nref:       ${ref}\nstatus:    ${status}\n\`\`\``)
    } else {
      if (parameter) {
        message(conversationId, `Sorry <@${userId}>, *${parameter}* does not seem to be a valid workspace; try one of:\n\`\`\`- staging\n- qualification\n- test1\n- test2\n- dev1\n- dev2\n\`\`\``)
      } else {
        message(conversationId, `You must type \`workspace [workspace]\` with one of the workspace below:\n\`\`\`- staging\n- qualification\n- test1\n- test2\n- dev1\n- dev2\n\`\`\``)
      }
    }
  } else if (verb === 'apply') {
    message(conversationId, `Okay <@${userId}>, I'll create the stack for you`)
    reply((target) => {
      message(conversationId, `I've ${target} the changes. The current stack is:\n\`\`\`project:   demonstration\nworkspace: ${workspace}\nref:       ${ref}\nstatus:    ${target}\n\`\`\``)
      status = 'applied'
    },
    'applied')
  } else if (verb === 'destroy') {
    message(conversationId, `Okay, <@${userId}>, I'll destroy the stack for you`)
    reply((target) => {
      message(conversationId, `I've ${target} the changes. The current stack is:\n\`\`\`project:   demonstration\nworkspace: ${workspace}\nref:       ${ref}\nstatus:    ${target}\n\`\`\``)
      status = 'destroyed'
    },
    'destroyed')
  } else {
    const sentence = Math.floor(Math.random() * 15)
    const formula = [
      `Hi <@${userId}>, so glad you need me...`,
      `Hey, where have you been?`,
      `Hello, sunshine! type one of *apply*, *branch*, *destroy*, *info*, *help*, *quickcheck*, *show*, *tag* or *workspace*`,
      `Howdy, partner!`,
      `Hey, howdy, hi! try *apply*, *branch*, *destroy*, *info*, *help*, *quickcheck*, *show*, *tag* or *workspace*`,
      `What’s kickin’, little chicken?`,
      `Peek-a-boo <@${userId}>! Yoo-hu *apply*, *branch*, *destroy*, *info*, *help*, *quickcheck*, *show*, *tag* or *workspace*`,
      `Howdy-doody!`,
      `Hey there, freshman!`,
      `My name's Terraform-Bot, and I'm a bad guy.`,
      `Hi, mister! try *apply*, *branch*, *destroy*, *info*, *help*, *quickcheck*, *show*, *tag* or *workspace*`,
      `I come in peace!`,
      `Put that cookie down!`,
      `Ahoy, matey! the words you are looking for are *apply*, *branch*, *destroy*, *info*, *help*, *quickcheck*, *show*, *tag* or *workspace*`,
      `Hiya <@${userId}>!`
    ]
    message(conversationId, formula[sentence])
  }
}

module.exports = {
  response: response
}
