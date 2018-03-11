const couchbase = require('couchbase')
const couchnode = require('couchnode')
const stream = require('stream')
const YAML = require('yamljs')
const couchparam = YAML.load('config/settings.yaml')['couchbase']
const projects = YAML.load('config/settings.yaml')['projects']
const uuidv4 = require('uuid/v4')

const cluster = new couchbase.Cluster(couchparam['url'])
cluster.authenticate(couchparam['username'], couchparam['password'])
const bucket = couchnode.wrap(cluster.openBucket(couchparam['bucket'], couchparam['bucket-password']))

class EchoStream extends stream.Writable {
  _write (chunk, enc, next) {
    console.log(chunk.toString().toUpperCase())
    next()
  }
}

const out = new EchoStream()

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

function updateWorkspace (workspace, request, callback) {
  const key = `ws:${workspace['project']}:${workspace['workspace']}`
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
        state: 'New',
        creation: Date.now(),
        request: {
          date: Date.now(),
          action: request['action']
        },
        events: [ {event: uuidv4()} ]
      }

      bucket.insert(payload, (err, cas, existing) => {
        if (err) {
          callback(err, null)
        } else {
          callback(null, payload)
        }
      })
    } else if (data[key] && data[key]['request'] && data[key]['request']['action']) {
      const pendingAction = new Error('There is already one pending action on the workspace')
      callback(pendingAction, null)
    } else {
      let payload = data
      payload[key].request = {
        date: Date.now(),
        action: request['action']
      }
      payload[key]['events'] = data[key]['events']
      payload[key]['events'].unshift(
        {event: uuidv4()}
      )
      bucket.upsert(payload, (err, data) => {
        if (err) {
          callback(err, null)
        } else {
          callback(null, payload)
        }
      })
    }
  })
}

function workspaceDelete (workspace, callback) {
  const key = `ws:${workspace['project']}:${workspace['workspace']}`
  bucket.remove(key, (err, cas, misses) => {
    if (err) {
      callback(err, null)
    } else {
      callback(null, null)
    }
  })
}

function workspaceEndRequest (workspace, state, callback) {
  const key = `ws:${workspace['project']}:${workspace['workspace']}`
  bucket.get(key, function (err, data) {
    if (err) {
      callback(err, null)
    } else if (data && data[key]) {
      let payload = data
      delete payload[key].request
      if (state) {
        payload[key]['state'] = state
      }
      bucket.upsert(payload, (err, data) => {
        if (err) callback(err, null)
        else callback(null, payload)
      })
    }
  })
}

module.exports = {
  'stdout': out,
  test: test,
  updateWorkspace: updateWorkspace,
  workspaceDelete: workspaceDelete,
  workspaceEndRequest: workspaceEndRequest
}
