const couchbase = require('couchbase')
var couchnode = require('couchnode')
const stream = require('stream')
const YAML = require('yamljs')
const couchparam = YAML.load('config/settings.yaml')['couchbase']
const uuidv4 = require('uuid/v4')

const cluster = new couchbase.Cluster(couchparam['url'])
cluster.authenticate(couchparam['username'], couchparam['password'])

const bucket = couchnode.wrap(cluster.openBucket(couchparam['bucket'], couchparam['bucket-password']))

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

class EchoStream extends stream.Writable {
  _write (chunk, enc, next) {
    console.log(chunk.toString().toUpperCase())
    next()
  }
}

const out = new EchoStream()

function workspacePost (workspace, request, callback) {
  // TODO: Checks the workspace exists
  const key = `ws:${workspace['project']}:${workspace['workspace']}`
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
      callback(null, data)
      // TODO: manage when there is a need for 409 because there is already a query pending
    } else {
      console.log('sectio 4')
      let payload = data
      payload[key].request = {
        date: Date.now(),
        action: request['action']
      }
      payload[key]['events'] = data[key]['events'].unshift(
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

function workspaceEndRequest (workspace, callback) {
  const key = `ws:${workspace['project']}:${workspace['workspace']}`
  bucket.get(key, function (err, data) {
    if (err) {
      callback(err, null)
    } else if (data && data[key]) {
      let payload = data
      delete payload[key].request
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
  workspaceDelete: workspaceDelete,
  workspaceEndRequest: workspaceEndRequest,
  workspacePost: workspacePost
}
