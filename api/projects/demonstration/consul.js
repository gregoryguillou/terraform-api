'use strict'

const Docker = require('dockerode')
const docker = new Docker({socketPath: '/var/run/docker.sock'})

var listOpts = {
  limit: 12,
  filters: {label: ['terraform-api.role=consul']}
}

docker.listContainers(listOpts, function (err, data) {
  if (err) {
    throw err
  }
  let bridge = ''
  for (var key in data[0].NetworkSettings.Networks) {
    bridge = key
  }
  const gateway = data[0].NetworkSettings.Networks[bridge].Gateway
  console.log(gateway)
})
