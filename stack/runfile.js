const { run, help } = require('runjs')
const util = require('util')

const containers = {
  'lineup-service': {
    name: 'lineup-service',
    version: 'alpha1',
    path: '../api'
  },
  'lineup-terraform': {
    name: 'lineup-terraform',
    version: 'beta',
    path: '../demo'
  }
}

const container = process.env.LINEUP_CONTAINER || 'lineup-service'
const version = process.env.LINEUP_VERSION || containers[container]['version']
const path = containers[container]['path']

function build () {
  process.chdir(path)
  run(util.format('docker build -t %s:%s .', container, version))
  run(util.format('docker build -t %s:latest .', container))
}

function clean () {
  process.chdir(path)
  run(util.format('docker rmi %s:%s', container, version))
  run(util.format('docker build -t %s:latest .', container))
}

help(build, {
  description: 'Build the docker containers',
  examples: `
    LINEUP_CONTAINER=lineup-service npx run build
    LINEUP_CONTAINER=lineup-terraform npx run build
  `
})

module.exports = {
  build,
  clean
}
