const couchbase = require('couchbase')
var couchnode = require('couchnode')
const stream = require('stream')

const cluster = new couchbase.Cluster('127.0.0.1:8091')
cluster.authenticate('admin', 'couchbase')

const bucket = couchnode.wrap(cluster.openBucket('bucket', 'couchbase'))

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
