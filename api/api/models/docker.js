const Docker = require('dockerode')
var docker = new Docker({socketPath: '/var/run/docker.sock'})
const YAML = require('yamljs')
const projects = YAML.load('config/settings.yaml')['projects']
const { EchoStream } = require('./couchbase')
const logger = require('./logger')
const { exec } = require('child_process')
// const RegExp = require('regexp')

let env = [ 'CONSUL_IP=172.28.0.1' ]
let createoptions = {}
let startoptions = {}

function version (name, callback) {
  const project = projects.find(p => p.name === name)

  const stdout = new EchoStream('version')
  docker.run(project['docker-image'], ['-v'], stdout, createoptions, startoptions, (err, data) => {
    callback(err, data)
  })
}

var workspace = {project: 'demonstration', workspace: 'staging'}

function getenv (command, workspace, callback) {
  const project = projects.find(p => p.name === workspace.project)

  let populatedEnv = { }
  let envs = [ ]
  exec(
    project.lifecycle.getenv[0].replace(/{{deck\.WORKSPACE}}/, workspace.workspace),
    {cwd: project.lifecycle.cwd},
    (err, stdout, stderr) => {
      if (err) {
        return err
      }
      const val = stdout.split('\n')
      for (var i in val) {
        const prop = val[i].split('=')
        populatedEnv[prop[0]] = prop[1]
      }
      project.lifecycle.setenv.forEach(element => {
        var changedElement = element
        for (var ev in populatedEnv) {
          var reg = new RegExp(`{{env.${ev}}}`, 'g')
          changedElement = changedElement.replace(reg, populatedEnv[`${ev}`])
        }
        envs.push(changedElement)
      })
      if (project.git && project.git.login) {
        env.push(`GITHUB_USERNAME=${project.git.login}`)
        env.push(`GITHUB_PASSWORD=${project.git.password}`)
      }
    }
  )
  console.log(`docker ${command} ${workspace.workspace} ${JSON.stringify(envs)}`)
  //callback(command, workspace, envs)
}

const test = apply(workspace, () => {
  console.log('This is over!!!')
})

function command (command, config, env, callback) {
  if (!config || !config.project || !config.workspace || !config.event) {
    return callback(new Error('Cannot run docker; you need the workspace and the event id'), null)
  }
  const stdout = new EchoStream(config.event)
  const project = projects.find(p => p.name === config.project)

  createoptions = {env}
  let args = ['-c', command, '-w', config.workspace]
  if (command === 'apply' && config.ref) {
    args.push('-r')
    args.push(config.ref)
  }
  docker.run(project['docker-image'], args, stdout, createoptions, startoptions, (err, data) => {
    if (err) {
      logger.error(`docker ${project['docker-image']} has failed with ${err.error}`)
      return callback(err, data)
    }
    callback(null, data)
  })
}

function apply (config, callback) {
  getenv('apply', workspace, (command, workspace, envs) => {
    command('apply', config, callback)
  })
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
