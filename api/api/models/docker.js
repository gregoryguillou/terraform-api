const Docker = require('dockerode')
var docker = new Docker({socketPath: '/var/run/docker.sock'})

const createoptions = {env: [ 'CONSUL_IP=172.28.0.1' ]}
const startoptions = {}

function version (stdout, callback) {
  docker.run('lineup-terraform', ['-v'], stdout, createoptions, startoptions, function (err, data, container) {
    if (!err) {
      callback(null, data)
    } else {
      callback(err, data)
    }
  })
}

module.exports = { version }
