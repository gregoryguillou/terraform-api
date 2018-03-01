'use strict'

const Docker = require('dockerode')
const fs = require('fs')

var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock'
var stats = fs.statSync(socket)

if (!stats.isSocket()) {
  throw new Error('Are you sure the docker is running?')
}

const docker = new Docker({socketPath: socket})

function list (req, res) {
  docker.listContainers(
    {all: true},
    (err, containers) => {
      if (err) {
        res.status(500).json({message: 'Cannot read docker socket'})
      } else {
        let output = []
        for (var i = 0, size = containers.length; i < size; i++) {
          console.log(containers[i].Id)
          output.push({identifier: containers[i].Id, name: containers[i].Names[0], image: containers[i].Image})
        }
        res.status(200).json(output)
      }
    }
  )
}

module.exports = {
  list: list
}
