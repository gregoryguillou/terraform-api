'use strict'

const Docker = require('dockerode')
const docker = new Docker({socketPath: '/var/run/docker.sock'})
const request = require('request')

var listOpts = {
  limit: 12,
  filters: {label: ["deck.role=consul"]}
};

docker.listContainers(listOpts, function(err, data){
  if(err) {
    return res.status(500).apiResponse('error fetching recent deployments', err.message);
  }
  let bridge = ''
  for (var key in data[0].NetworkSettings.Networks) {
    bridge = key
  }
  const gateway = data[0].NetworkSettings.Networks[key].Gateway
  console.log(gateway)
})
