const couchbase = require('couchbase')
const couchnode = require('couchnode')
const process = require('process')
const stream = require('stream')
const YAML = require('yamljs')
const couchparam = YAML.load('config/settings.yaml').couchbase
const projects = YAML.load('config/settings.yaml').projects
const users = YAML.load('config/settings.yaml').users
const uuidv4 = require('uuid/v4')
const logger = require('./logger')

const cluster = new couchbase.Cluster(couchparam['url'])
cluster.authenticate(couchparam['username'], couchparam['password'])

let bucket
let logs

function testConnection (i, callback) {
  setTimeout(
    () => {
      cluster.openBucket(
        couchparam.log_bucket,
        couchparam['bucket-password'],
        (err) => {
          if (err) {
            logger.info(`Connect to couchbase bucket ${couchparam.log_bucket} failed. Retrying... (${i})`)
            if (i > 0) {
              const j = i - 1
              return testConnection(j, callback)
            }
            process.exit(1)
          }
          bucket = couchnode.wrap(cluster.openBucket(couchparam['data_bucket'], couchparam['bucket-password'], (err) => {
            if (err) {
              logger.fatal('Cannot open couchbase bucket for data')
              process.exit(1)
            }
            logs = couchnode.wrap(cluster.openBucket(couchparam['log_bucket'], couchparam['bucket-password'], (err) => {
              if (err) {
                logger.fatal('Cannot open couchbase bucket for data')
                process.exit(1)
              }
              callback()
            }))
          }))
        })
    },
    1000
  )
}

const lastCheckedRequest = (state, request) => {
  const date = Date.now()
  const ref = request ? request.ref : undefined
  return state => ({ date, ref, state })
}

class EchoStream extends stream.Writable {
  constructor (event, ...params) {
    super(...params)
    this.key = `logs:${event}`
    this.log = { [this.key]: {logs: [], type: 'logs'} }
    this.line = 0
    this.logs = couchnode.wrap(cluster.openBucket(couchparam['log_bucket'], couchparam['bucket-password'], (err) => {
      if (err) {
        logger.fatal('Cannot open couchbase bucket for data')
        process.exit(1)
      }
    }))
  }

  _final (callback) {
    this.logs.bucket.disconnect()
    callback()
  }

  _write (chunk, enc, next) {
    let lines = chunk.toString().split('\n')
    for (var i = 0, size = lines.length; i < size; i++) {
      this.line++
      this.log[this.key].logs.push({line: this.line, date: Date.now(), text: lines[i]})
    }
    this.logs.upsert(this.log, function (err, result) {
      if (err) throw err
      next()
    })
  }
}

class ActionError extends Error {
  constructor (code = 401, ...params) {
    super(...params)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ActionError)
    }
    this.code = code
  }
}

function channelDescribe (user, channel, callback) {
  bucket.get(`channels:${user}/${channel}`, (err1, data1) => {
    if (err1) {
      throw err1
    }
    if (data1 && data1[`channels:${user}/${channel}`]) {
      return callback(null, data1[`channels:${user}/${channel}`])
    }
    if (channel === 'default') {
      return callback(null, {})
    }
    callback(null, null)
  })
}

function channelList (user, callback) {
  bucket.get(`channels:${user}`, (err1, data1) => {
    if (err1) {
      throw err1
    }
    let channels = []
    if (data1 && data1[`channels:${user}`]) {
      Object.keys(data1[`channels:${user}`]).forEach((key) => {
        channels.push({name: key.slice(`channels:${user}`.length + 1)})
      })
      if (!data1[`channels:${user}`][`channels:${user}/default`]) {
        channels.push({name: 'default'})
      }
    } else {
      channels.push({name: 'default'})
    }
    callback(null, {channels})
  })
}

function channelRemove (user, channel, callback) {
  bucket.get(`channels:${user}`, (err1, data1) => {
    if (err1) {
      throw err1
    }
    let channels = {}
    let channellist = {}
    if (data1 && data1[`channels:${user}`]) {
      channels = data1[`channels:${user}`]
      delete channels[`channels:${user}/${channel}`]
    }
    channellist[`channels:${user}`] = channels
    bucket.upsert(channellist, (err2, data2) => {
      if (err2) {
        throw err2
      }
      bucket.remove(`channels:${user}/${channel}`, (err3, cas, misses) => {
        if (err3) {
          throw err3
        }
        callback(null)
      })
    })
  })
}

function channelStore (user, channel, content, callback) {
  bucket.get(`channels:${user}`, (err1, data1) => {
    if (err1) {
      throw err1
    }
    let channels = {}
    let channellist = {}
    if (data1 && data1[`channels:${user}`]) {
      channels = data1[`channels:${user}`]
    }
    channels[`channels:${user}/default`] = true
    channels[`channels:${user}/${channel}`] = true
    channellist[`channels:${user}`] = channels
    bucket.upsert(channellist, (err2, data2) => {
      if (err2) {
        throw err2
      }
      let message = {}
      message[`channels:${user}/${channel}`] = content
      bucket.upsert(message, (err3, data3) => {
        if (err3) {
          throw err3
        }
        callback(null, data3)
      })
    })
  })
}

function checkConnectivity (callback) {
  bucket.upsert({'tst:1': { status: 'OK' }}, function (err, result) {
    if (err) {
      throw err
    }
    bucket.get('tst:1', function (err, result) {
      if (err) {
        return callback(err, null)
      }
      callback(null, result)
    })
  })
}

function checkEventLogs (callback) {
  bucket.upsert({
    'evt:00000000-0000-0000-0000-000000000000': {
      type: 'event',
      project: 'demonstration',
      workspace: 'staging',
      creation: 1521288520083,
      action: 'apply',
      status: 'succeeded',
      ref: 'branch:master',
      end: 1521288527721
    }
  }, (err, result) => {
    if (err) {
      return callback(err, null)
    }
    const log = {
      'logs:00000000-0000-0000-0000-000000000000': {
        logs: [
          { line: 1, text: 'output log: line 1' },
          { line: 2, text: 'output log: line 2' }
        ],
        type: 'logs'
      }
    }
    logs.upsert(log, (err, result) => {
      if (err) {
        return callback(err, null)
      }
      callback()
    }
    )
  })
}

function verifyWorkspace (workspace) {
  for (var i = 0, size = projects.length; i < size; i++) {
    if (!projects[i].name) {
      return false
    }
    if (projects[i].name === workspace.project) {
      for (var j = 0, wsize = projects[i].workspaces.length; j < wsize; j++) {
        if (projects[i].workspaces[j] === workspace.workspace) {
          return true
        }
      }
    }
  }
  return false
}

function actionWorkspace (workspace, request, callback) {
  const key = `ws:${workspace.project}:${workspace.workspace}`
  const event = uuidv4()
  const eventKey = `evt:${event}`
  const eventDate = Date.now()
  let eventPayload = {}
  eventPayload[eventKey] = {
    type: 'event',
    project: workspace.project,
    workspace: workspace.workspace,
    creation: eventDate,
    action: request.action,
    status: 'requested'
  }

  if (request.ref) {
    eventPayload[eventKey].ref = request.ref
  }

  if (request.channels) {
    eventPayload[eventKey].channels = request.channels
  }
  logger.info(`${workspace.project}:${workspace.workspace}[${event}] requests ${request.action}`)

  if (!verifyWorkspace(workspace)) {
    callback(new Error(`Workspace/Project does not exist. Check ${workspace.project}/${workspace.workspace}`), null)
    return
  }

  bucket.get(key, function (err, data) {
    if (err) {
      return callback(err, null)
    }
    if (!data || !data[key]) {
      let payload = {}
      payload[key] = {
        type: 'workspace',
        project: workspace.project,
        workspace: workspace.workspace,
        state: 'new',
        creation: eventDate,
        request: {
          event,
          action: request.action,
          date: eventDate
        },
        lastEvents: [ event ]
      }

      if (request.ref) {
        payload[key].request.ref = request.ref
      }

      if (request.channels) {
        payload[key].request.channels = request.channels
      }

      bucket.insert(payload, (err, cas, existing) => {
        if (err) {
          return callback(err, null)
        }
        bucket.upsert(eventPayload, (err, data) => {
          if (err) {
            logger.error('Error inserting the following key in bucket', eventPayload)
          }
        })
        callback(null, payload)
      })
    } else if (data[key] && data[key].request && data[key].request.action) {
      const pendingAction = new ActionError(409, 'There is already one pending action on the workspace')
      callback(pendingAction, null)
    } else {
      let payload = data
      payload[key].request = {
        event,
        action: request.action,
        date: eventDate
      }
      payload[key].request.ref = request.ref
      if (request.channels) {
        payload[key].request.channels = request.channels
      }
      payload[key].lastEvents = data[key].lastEvents || []
      payload[key].lastEvents.unshift(event)
      payload[key].lastEvents = payload[key].lastEvents.slice(0, 20)
      bucket.upsert(payload, (err, data) => {
        if (err) {
          return callback(err, null)
        }
        bucket.upsert(eventPayload, (err, data) => {
          if (err) {
            logger.error('Error inserting the following key in bucket', eventPayload)
          }
        })
        callback(null, payload)
      })
    }
  })
}

function deleteWorkspace (workspace, callback) {
  if (!verifyWorkspace(workspace)) {
    return callback(
      new Error(`Workspace/Project does not exist. Check ${workspace.project}/${workspace.workspace}`),
      null
    )
  }
  const key = `ws:${workspace.project}:${workspace.workspace}`
  bucket.remove(key, (err, cas, misses) => {
    if (err) {
      return callback(err, null)
    }
    callback()
  })
}

function showEvent (event, callback) {
  const key = `evt:${event}`
  bucket.get(key, (err, results, cas, misses) => {
    if (err) {
      return callback(err)
    }
    if (results && results[key]) {
      return callback(null, results[key])
    }
    callback()
  })
}

function showLogs (event, callback) {
  const key = `logs:${event}`
  logs.get(key, (err, results, cas, misses) => {
    if (err) {
      return callback(err)
    }
    if (results && results[key]) {
      return callback(null, results[key])
    }
    callback()
  })
}

function showWorkspace (workspace, callback) {
  const key = `ws:${workspace.project}:${workspace.workspace}`
  const eventDate = Date.now()

  bucket.get(key, (err, results, cas, misses) => {
    if (err) {
      return callback(err)
    }
    if (results && results[key]) {
      if (!results[key]['channels']) {
        let message = results[key]
        message['channels'] = {
          duration: 'request',
          managementType: 'shared'
        }
        return callback(null, { [key]: message })
      }
      return callback(null, results)
    }
    const payload = {
      [key]: {
        type: 'workspace',
        project: workspace.project,
        workspace: workspace.workspace,
        ref: 'branch:master',
        state: 'new',
        creation: eventDate,
        lastEvents: [],
        channels: {
          duration: 'request',
          managementType: 'shared'
        }
      }
    }

    bucket.insert(payload, (err, cas, existing) => {
      if (err) {
        callback(err, null)
      } else {
        callback(null, payload)
      }
    })
  })
}

function feedWorkspace (workspace, result, callback) {
  const key = `ws:${workspace.project}:${workspace.workspace}`
  bucket.get(key, (err, data) => {
    if (err) {
      return callback(err, null)
    }
    if (!data || !data[key]) {
      logger.error(`ERROR: Cannot find workspace ${key}`)
      return callback()
    }
    logger.info(`${workspace.project}:${workspace.workspace}[${data[key].lastEvents[0]}] returns (${(data[key].request ? data[key].request.action : 'undefined')}->${result.status})`)
    let payload = data
    let request = { }
    if (payload[key].request) {
      request = {
        action: payload[key].request.action,
        ref: (payload[key].request.ref ? payload[key].request.ref : (payload[key].ref ? payload[key].ref : undefined)),
        channels: (payload[key].request.channels ? payload[key].request.channels : undefined),
        event: payload[key].request.event
      }
      delete payload[key].request
    }
    const lastChecked = lastCheckedRequest(request)
    switch (result.status) {
      case 'clean':
        payload[key].lastChecked = lastChecked('cleaned')
        break
      case 'differ':
        if (request.action === 'check') {
          payload[key].lastChecked = lastChecked('differs')
        } else {
          logger.error(`${workspace.project}:${workspace.workspace} should not differ with action = ${request.action}`)
          payload[key].lastChecked = lastChecked((result.status === 'error'))
        }
        break
      case 'changed':
        if (request.action === 'update' && request.ref && !request.channels) {
          payload[key].lastChecked = lastChecked('changed')
          if (request.ref) {
            payload[key].ref = request.ref
          }
        } else if (request.action === 'update' && request.channels) {
          payload[key].lastChecked = lastChecked('changed')
          payload[key].channels = request.channels
        } else {
          logger.error(`${workspace.project}:${workspace.workspace} should not differ with action = ${request.action}`)
          payload[key].lastChecked = lastChecked((result.status === 'error'))
        }
        break
      case 'succeed':
        switch (request.action) {
          case 'apply':
            payload[key].lastChecked = lastChecked('applied')
            payload[key].state = 'applied'
            if (request.ref) {
              payload[key].ref = request.ref
            }
            break
          case 'destroy':
            payload[key].lastChecked = lastChecked('destroyed')
            payload[key].state = 'destroyed'
            break
          case 'check':
            payload[key].lastChecked = lastChecked('checked')
            if (request.ref) {
              payload[key].ref = request.ref
            }
            break
          default:
            logger.error(`${workspace.project}:${workspace.workspace} error with (${request.action}->${result.status})`)
            break
        }
        break
      case 'fail':
        switch (request.action) {
          case 'apply':
            payload[key].lastChecked = lastChecked('failed')
            payload[key].state = 'apply - failed'
            if (request.ref) {
              payload[key].ref = request.ref
            }
            logger.info(`${workspace.project}:${workspace.workspace}, action = ${request.action} failed'`)
            break
          case 'destroy':
            payload[key].lastChecked = lastChecked('failed')
            payload[key].state = 'destroy - failed'
            logger.info(`${workspace.project}:${workspace.workspace}, action = ${request.action} destroyed'`)
            break
          case 'check':
            payload[key].lastChecked = lastChecked('failed')
            logger.info(`${workspace.project}:${workspace.workspace}, action = ${request.action} checked'`)
            if (request.ref) {
              payload[key].ref = request.ref
            }
            break
          default:
            logger.info(`${workspace.project}:${workspace.workspace}, action = ${request.action} should not be managed'`)
            break
        }
        break
      default:
        logger.error(`Sorry, we are out of range action = ${request.action} ; result = ${result.status}`)
        break
    }
    bucket.upsert(payload, (err, data) => {
      if (err) {
        return callback(err, null)
      }
      if (result.status === 'clean') {
        return callback(null, payload)
      }
      const evtkey = `evt:${request.event}`
      bucket.get(evtkey, (err, data) => {
        if (err) {
          return callback(err, null)
        }
        let event = data
        event[evtkey].status = result.status === 'succeed' ? 'succeeded'
          : (result.status === 'fail' ? 'failed' : result.status)
        event[evtkey].end = Date.now()
        bucket.upsert(event, (err, data) => {
          if (err) {
            return callback(err, null)
          }
          callback(null, payload)
        })
      })
    })
  })
}

function getUsers (callback) {
  const key = 'users'
  bucket.get(key, (err, data) => {
    if (err) {
      return callback(err, null)
    }
    if (!data || !data[key]) {
      logger.error(`Users are currently undefined. Create them from the settings.xml file`)
      let allusers = []
      let i = 0
      users.forEach((element) => {
        i++
        allusers.push({
          userid: i,
          username: element.username,
          apikey: element.apikey,
          role: element.role
        })
      })
      bucket.upsert({users: allusers}, function (err, result) {
        if (err) {
          throw err
        }
        return callback(null, {users: allusers})
      })
    } else {
      return callback(null, data)
    }
  })
}

function updateChannels (config, callback) {
  const key = `ws:${config.project}:${config.workspace}`
  bucket.get(key, (err, data) => {
    if (err) { throw err }
    if (data.channels && data.channels.leaders && data.channels.duration && data.channels.leaders.length() !== 0 && data.channels.duration !== config.channels.duration) {
      return callback(null, {
        channels: config.channels,
        project: config.project,
        statusCode: 409,
        workspace: config.workspace
      })
    }
    callback(null, {
      channels: config.channels,
      project: config.project,
      statusCode: 0,
      workspace: config.workspace
    })
  })
}

module.exports = {
  ActionError,
  actionWorkspace,
  channelDescribe,
  channelList,
  channelRemove,
  channelStore,
  checkConnectivity,
  checkEventLogs,
  deleteWorkspace,
  EchoStream,
  feedWorkspace,
  getUsers,
  showEvent,
  showLogs,
  showWorkspace,
  testConnection,
  updateChannels
}
