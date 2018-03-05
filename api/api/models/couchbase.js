const couchbase = require('couchbase')
const stream = require('stream')

const cluster = new couchbase.Cluster('couchbase://127.0.0.1')
var bucket = cluster.openBucket('default')

function test (callback) {
  bucket.upsert('testdoc', { name: 'Frank' }, function (err, result) {
    if (err) throw err

    bucket.get('testdoc', function (err, result) {
      if (err) throw err

      console.log(result.value)
    })

    callback()
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
