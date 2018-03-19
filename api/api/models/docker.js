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
    callback(err, data)
  })
}

function command (command, config, callback) {
  if (!config || !config.project || !config.workspace || !config.event) {
    return callback(new Error('Cannot run docker; you need the workspace and the event id'), null)
  }
  const stdout = new EchoStream(config.event)
  projects.forEach(project => {
    if (project.name === config.project && project.git) {
      env.push(`GITHUB_USERNAME=${project.git.login}`)
      env.push(`GITHUB_PASSWORD=${project.git.password}`)
    }
  })
  createoptions = {env}
  let args = ['-c', command, '-w', config.workspace]
  if (command === 'apply' && config.ref) {
    args.push('-r')
    args.push(config.ref)
  }
  docker.run('deck-terraform', args, stdout, createoptions, startoptions, (err, data) => {
    if (err) {
      logger.error(`docker deck-terraform has failed with ${err.error}`)
      return callback(err, data)
    }
    callback(null, data)
  })
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
