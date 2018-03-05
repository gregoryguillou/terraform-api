const couchbase = require('couchbase')
var couchnode = require('couchnode')
const stream = require('stream')
const YAML = require('yamljs')
const couchparam = YAML.load('config/settings.yaml')['couchbase']

const cluster = new couchbase.Cluster(couchparam['url'])
cluster.authenticate(couchparam['username'], couchparam['password'])

const bucket = couchnode.wrap(cluster.openBucket(couchparam['bucket'], couchparam['bucket-password']))

function test (callback) {
  bucket.upsert('testdoc', { name: 'Gregory' }, function (err, result) {
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

module.exports = {
  'stdout': out,
  test: test
}
