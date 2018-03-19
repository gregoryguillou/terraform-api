const Docker = require('dockerode')
var docker = new Docker({socketPath: '/var/run/docker.sock'})
const YAML = require('yamljs')
const projects = YAML.load('config/settings.yaml')['projects']
const { EchoStream } = require('./couchbase')
const logger = require('./logger')

let env = [ 'CONSUL_IP=172.28.0.1' ]
let createoptions = {}
let startoptions = {}

function version (callback) {
  const stdout = new EchoStream('version')
  docker.run('deck-terraform', ['-v'], stdout, createoptions, startoptions, (err, data) => {
    if (err) {
      return callback(err, data)
    }
  })
}

function command (command, config, callback) {
  if (!config || !config['project'] || !config['workspace'] || !config['event']) {
    callback(new Error('Cannot run docker; you need the workspace and the event id'), null)
  } else {
    const stdout = new EchoStream(config['event'])
    for (var i = 0, size = projects.length; i < size; i++) {
      if (projects[i].name === config['project']) {
        if (projects[i]['git']) {
          env.push(`GITHUB_USERNAME=${projects[i]['git']['login']}`)
          env.push(`GITHUB_PASSWORD=${projects[i]['git']['password']}`)
        }
      }
    }
    createoptions = {env: env}
    let args = ['-c', command, '-w', config['workspace']]
    if (command === 'apply' && config['ref']) {
      args.push('-r')
      args.push(config['ref'])
    }
    docker.run('deck-terraform', args, stdout, createoptions, startoptions, function (err, data, container) {
      if (!err) {
        callback(null, data)
      } else {
        logger.error(`docker deck-terraform has failed with ${err.error}`)
        callback(err, data)
      }
    })
  }
}

function apply (config, callback) {
  command('apply', config, callback)
}

function destroy (config, callback) {
  command('destroy', config, callback)
}

function check (config, callback) {
  command('check', config, callback)
}

module.exports = {
  apply,
  check,
  destroy,
  version
}
