'use strict'

const Docker = require('dockerode')
const fs = require('fs')

const YAML = require('yamljs')
let dockerconf = YAML.load('config/settings.yaml')['docker']

if (dockerconf['socketPath']) {
  var stats = fs.statSync(dockerconf['socketPath'])

  if (!stats.isSocket()) {
    throw new Error('Are you sure the docker is running?')
  }
}

const docker = new Docker(dockerconf)

function list (req, res) {
  docker.listContainers(
    {all: true},
    (err, containers) => {
      if (err) {
        res.status(500).json({message: 'Cannot read docker socket'})
      } else {
        let output = []
        for (var i = 0, size = containers.length; i < size; i++) {
          output.push({identifier: containers[i].Id, name: containers[i].Names[0], image: containers[i].Image})
        }
        res.status(200).json(output)
      }
    }
  )
}

module.exports = {
  pools_list: list
}
