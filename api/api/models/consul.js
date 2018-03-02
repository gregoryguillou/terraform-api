'use strict'

const Docker = require('dockerode')
const fs = require('fs')
const log = require('./logger')

const YAML = require('yamljs')
let dockerconf = YAML.load('config/settings.yaml')['docker']

if (dockerconf['socketPath']) {
  var stats = fs.statSync(dockerconf['socketPath'])

  if (!stats.isSocket()) {
    throw new Error('Are you sure the docker is running?')
  }
}

const docker = new Docker(dockerconf)

function consulIp (callback) {
  docker.listContainers(
    { filters: { label: [ 'lineup.role=consul' ], status: [ 'running' ] } },
    (err, containers) => {
      if (err) {
        log.warn({message: 'Cannot read docker socket'})
      } else {
        if (containers) {
          console.log(containers[0].Id)
        }
      }
    }
  )
}

module.exports = consulIp
