const couchbase = require('couchbase')
const couchnode = require('couchnode')
const stream = require('stream')
const YAML = require('yamljs')
const couchparam = YAML.load('config/settings.yaml')['couchbase']
const projects = YAML.load('config/settings.yaml')['projects']
const uuidv4 = require('uuid/v4')
const logger = require('./logger')

const cluster = new couchbase.Cluster(couchparam['url'])
cluster.authenticate(couchparam['username'], couchparam['password'])
const bucket = couchnode.wrap(cluster.openBucket(couchparam['data_bucket'], couchparam['bucket-password']))
const logs = couchnode.wrap(cluster.openBucket(couchparam['log_bucket'], couchparam['bucket-password']))

class EchoStream extends stream.Writable {
  constructor (event, ...params) {
    super(...params)
    this.key = `logs:${this.event}`
    this.log = { }
    this.log[key] = [ ]
    this.line = 0
  }
  _write (chunk, enc, next) {
    let lines = chunk.toString().split("\n")
    for (var i = 0, size = lines.length ; i < size ; i++) {
      this.line++
      this.log[key].push({line: this.line, text: lines[i]})
    }
    logs.upsert(this.log, function (err, result) {
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

function test (callback) {
  bucket.upsert({'testdoc': { name: 'Gregory' }}, function (err, result) {
    if (err) throw err

    bucket.get('testdoc', function (err, result) {
      if (err) {
        callback(err, null)
      } else {
        callback(null, result)
      }
    })
  })
}

function verifyWorkspace (workspace) {
  for (var i = 0, size = projects.length; i < size; i++) {
    if (!projects[i].name) {
      return false
    }
    if (projects[i].name === workspace['project']) {
      for (var j = 0, wsize = projects[i]['workspaces'].length; j < wsize; j++) {
        if (projects[i]['workspaces'][j] === workspace['workspace']) {
          return true
        }
      }
    }
  }
  return false
}

function actionWorkspace (workspace, request, callback) {
  const key = `ws:${workspace['project']}:${workspace['workspace']}`
  const event = uuidv4()
  const eventKey = `evt:${event}`
  const eventDate = Date.now()
  let eventPayload = {}
  eventPayload[eventKey] = {
    type: 'event',
    project: workspace['project'],
    workspace: workspace['workspace'],
    creation: eventDate,
    action: request['action'],
    status: 'requested'
  }

  if (request['ref']) {
    eventPayload[eventKey]['ref'] = request['ref']
  }
  logger.info(`${workspace['project']}:${workspace['workspace']}[${event}] requests ${request['action']}`)

  if (!verifyWorkspace(workspace)) {
    callback(new Error(`Workspace/Project does not exist. Check ${workspace['project']}/${workspace['workspace']}`), null)
    return
  }

  bucket.get(key, function (err, data) {
    if (err) {
      callback(err, null)
    } else if (!data || !data[key]) {
      let payload = {}
      payload[key] = {
        type: 'workspace',
        project: workspace['project'],
        workspace: workspace['workspace'],
        state: 'new',
        creation: eventDate,
        request: {
          date: eventDate,
          action: request['action'],
          event: event
        },
        lastEvents: [ event ]
      }

      if (request['ref']) {
        payload[key].request.ref = request['ref']
      }

      bucket.insert(payload, (err, cas, existing) => {
        if (err) {
          callback(err, null)
        } else {
          bucket.upsert(eventPayload, (err, data) => {
            if (err) {
              logger.error('Error inserting the following key in bucket', eventPayload)
            }
          })
          callback(null, payload)
        }
      })
    } else if (data[key] && data[key]['request'] && data[key]['request']['action']) {
      const pendingAction = new ActionError(409, 'There is already one pending action on the workspace')
      callback(pendingAction, null)
    } else {
      let payload = data
      payload[key].request = {
        date: eventDate,
        action: request['action'],
        event: event
      }
      if (request['ref']) {
        payload[key].request.ref = request['ref']
      }
      payload[key]['lastEvents'] = data[key]['lastEvents']
      if (payload[key]['lastEvents']) {
        payload[key]['lastEvents'].unshift(event)
        payload[key]['lastEvents'] = payload[key]['lastEvents'].slice(0,20)
      } else {
        payload[key]['lastEvents'] = [ event ]
      }
      bucket.upsert(payload, (err, data) => {
        if (err) {
          callback(err, null)
        } else {
          bucket.upsert(eventPayload, (err, data) => {
            if (err) {
              logger.error('Error inserting the following key in bucket', eventPayload)
            }
          })
          callback(null, payload)
        }
      })
    }
  })
}

function deleteWorkspace (workspace, callback) {
  if (!verifyWorkspace(workspace)) {
    callback(new Error(`Workspace/Project does not exist. Check ${workspace['project']}/${workspace['workspace']}`), null)
    return
  }
  const key = `ws:${workspace['project']}:${workspace['workspace']}`
  bucket.remove(key, (err, cas, misses) => {
    if (err) {
      callback(err, null)
    } else {
      callback(null, null)
    }
  })
}

function showEvent (event, callback) {
  const key = `evt:${event}`
  bucket.get(key, (err, results, cas, misses) => {
    if (err) {
      callback(err, null)
    } else if (results && results[key]) {
      callback(null, results[key])
    } else {
      callback(null, null)
    }
  })
}

function showWorkspace (workspace, callback) {
  const key = `ws:${workspace['project']}:${workspace['workspace']}`
  const eventDate = Date.now()
  bucket.get(key, (err, results, cas, misses) => {
    if (err) {
      callback(err, null)
    } else if (results && results[key]) {
      callback(null, results)
    } else {
      let payload = {}
      payload[key] = {
        type: 'workspace',
        project: workspace['project'],
        workspace: workspace['workspace'],
        ref: 'branch:master',
        state: 'new',
        creation: eventDate,
        lastEvents: []
      }

      bucket.insert(payload, (err, cas, existing) => {
        if (err) {
          callback(err, null)
        } else {
          callback(null, payload)
        }
      })
    }
  })
}

function feedWorkspace (workspace, result, callback) {
  const key = `ws:${workspace['project']}:${workspace['workspace']}`
  bucket.get(key, function (err, data) {
    if (err) {
      callback(err, null)
    } else if (data && data[key]) {
      logger.info(`${workspace['project']}:${workspace['workspace']}[${data[key]['lastEvents'][0]}] returns (${(data[key].request ? data[key].request.action : "undefined")}->${result.status})`)
      let payload = data
      let request = { }
      if (payload[key].request) {
        request = {
          action: payload[key].request.action,
          ref: (payload[key].request.ref ? payload[key].request.ref : (payload[key].ref ? payload[key].ref : 'unknown')),
          event: payload[key].request.event
        }
        delete payload[key].request
      }
      switch (result.status) {
        case 'clean':
          payload[key]['lastChecked'] = {
            date: Date.now(),
            state: 'cleaned'
          }
          break
        case 'differ':
          if (request.action === 'check') {
            payload[key]['lastChecked'] = {
              date: Date.now(),
              state: (results.status === 'differs'),
              ref: request.ref 
            }
          } else {
            logger.error(`${workspace['project']}:${workspace['workspace']} should not differ with action = ${request.action}`)
            payload[key]['lastChecked'] = {
              date: Date.now(),
              state: (result.status === 'error'),
              ref: request.ref 
            }              
          }
          break
        case 'succeed':
          switch (request.action) {
            case 'apply':
              payload[key]['lastChecked'] = {
                date: Date.now(),
                state: 'applied',
                ref: request.ref
              }
              payload[key].state = 'applied'
              break
            case 'destroy':
              payload[key]['lastChecked'] = {
                date: Date.now(),
                state: 'destroyed',
                ref: request.ref 
              }
              payload[key].state = 'destroyed'
              break
            case 'check':
              payload[key]['lastChecked'] = {
                date: Date.now(),
                state: 'checked',
                ref: request.ref 
              }
              break
            default:
              logger.error(`${workspace['project']}:${workspace['workspace']} error with (${request.action}->${result.status})`)
              break
          }
          break           
        case 'fail':
          switch (request.action) {
            case 'apply':
              payload[key]['lastChecked'] = {
                date: Date.now(),
                state: 'failed',
                ref: request.ref 
              }
              payload[key].state = 'apply - failed'
              logger.info(`${workspace['project']}:${workspace['workspace']}, action = ${request.action} failed'`)
              break
            case 'destroy':
              payload[key]['lastChecked'] = {
                date: Date.now(),
                state: 'failed',
                ref: request.ref 
              }
              payload[key].state = 'destroy - failed'
              logger.info(`${workspace['project']}:${workspace['workspace']}, action = ${request.action} destroyed'`)
              break
            case 'check':
              payload[key]['lastChecked'] = {
                date: Date.now(),
                state: 'failed',
                ref: request.ref 
              }
              logger.info(`${workspace['project']}:${workspace['workspace']}, action = ${request.action} checked'`)
              break
            default:
              logger.info(`${workspace['project']}:${workspace['workspace']}, action = ${request.action} should not be managed'`)
              break
          }
          break
        default:
          logger.error(`Sorry, we are out of range action = ${request.action} ; result = ${result.status}`)
          break
      }
      bucket.upsert(payload, (err, data) => {
        if (err) callback(err, null)
        else if (result.status != 'clean') {
          const evtkey = `evt:${request.event}`
          bucket.get(evtkey, (err, data) => {
            if (err) callback(err, null)
            else {
              let event = data
              event[evtkey].status = (result.status == 'succeed' ? "succeeded" :
                result.status == 'fail' ? "failed" : result.status)
              event[evtkey].end = Date.now()
              bucket.upsert(event, (err, data) => {
                if (err) callback(err, null)
                else {
                  callback(null, payload)
                }
              })
            }
          })
        } else {
          callback(null, payload)
        }
      })
    } else {
      logger.error(`ERROR: Cannot find workspace ${key}`)
      callback(null, null)
    }
  })
}

module.exports = {
  EchoStream: EchoStream,
  test: test,
  ActionError: ActionError,
  actionWorkspace: actionWorkspace,
  feedWorkspace: feedWorkspace,
  deleteWorkspace: deleteWorkspace,
  showEvent: showEvent,
  showWorkspace: showWorkspace
}
