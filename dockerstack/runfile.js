const { run } = require('runjs')
const util = require('util')

const containers = {
  'lineup-service': {
    name: 'lineup-service',
    version: 'alpha1',
    path: '../api'
  },
  'lineup-terraform': {
    name: 'lineup-terraform',
    version: 'alpha1',
    path: '../demo'
  }
}

const container = process.env.LINEUP_CONTAINER || 'lineup-service'
const version = process.env.LINEUP_VERSION || containers[container]['version']
const path = containers[container]['path']

function build () {
  process.chdir(path)
  run(util.format('docker build -t %s:%s .', container, version))
}

function clean () {
  process.chdir(path)
  run(util.format('docker rmi %s:%s', container, version))
}

module.exports = {
  build,
  clean
}
