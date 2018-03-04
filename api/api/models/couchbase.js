const stream = require('stream')

/* below is a set of documents explaining how to manage logs:
   * https://stackoverflow.com/questions/22032172/how-to-use-couchbase-as-fifo-queue
   * https://groups.google.com/forum/#!topic/mobile-couchbase/nd239vdkTcE
*/

class EchoStream extends stream.Writable {
  _write (chunk, enc, next) {
    console.log(chunk.toString().toUpperCase())
    next()
  }
}

const out = new EchoStream()

module.exports = {
  'stdout': out
}
