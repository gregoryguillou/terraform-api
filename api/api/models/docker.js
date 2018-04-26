const Docker = require('dockerode')
var docker = new Docker({socketPath: '/var/run/docker.sock'})
const YAML = require('yamljs')
const projects = YAML.load('config/settings.yaml')['projects']
const { EchoStream } = require('./couchbase')
const { exec } = require('child_process')

function version (name, callback) {
  const createoptions = {}
  const startoptions = {}
  const project = projects.find(p => p.name === name)

  const stdout = new EchoStream('version')
  docker.run(project['docker-image'], ['-v'], stdout, createoptions, startoptions, (err, data, container) => {
    if (err) { throw err }
    callback(err, data)
  })
}

function getenv (state, workspace, callback) {
  const project = projects.find(p => p.name === workspace.project)

  let populatedEnv = { }
  let envs = [ ]
  exec(
    project.lifecycle.getenv[0].replace(/{{terraform-api\.WORKSPACE}}/, workspace.workspace),
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
      if (project.git) {
        envs.push(`GITHUB_REPOSITORY=https://${project.git.repository}`)
        if (project.git.directory) {
          envs.push(`GITHUB_DIRECTORY=${project.git.directory}`)
        } else {
          envs.push('GITHUB_DIRECTORY=.')
        }
        if (project.git.login) {
          envs.push(`GITHUB_USERNAME=${project.git.login}`)
          envs.push(`GITHUB_PASSWORD=${project.git.password}`)
        }
      }
      command(state, workspace, envs, (err, data) => {
        if (err) { throw err }
        callback(err, data)
      })
    }
  )
}

function command (state, config, env, callback) {
  let createoptions = {}
  let startoptions = {}
  if (!config || !config.project || !config.workspace || !config.event) {
    return callback(new Error('Cannot run docker; you need the workspace and the event id'), null)
  }
  const stdout = new EchoStream(config.event)
  const project = projects.find(p => p.name === config.project)

  createoptions = {env}
  let args = ['-c', state, '-w', config.workspace]
  if (state === 'apply' && config.ref) {
    args.push('-r')
    args.push(config.ref)
  }
  docker.run(project['docker-image'], args, stdout, createoptions, startoptions, (err, data, container) => {
    if (err) { throw err }
    callback(err, data)
  })
}

function apply (config, callback) {
  getenv('apply', config, (err, data) => {
    callback(err, data)
  })
}

function reference (config, callback) {
  callback(null, {
    ref: config.ref,
    project: config.project,
    statusCode: 0,
    workspace: config.workspace
  })
}

function destroy (config, callback) {
  getenv('destroy', config, (err, data) => {
    callback(err, data)
  })
}

function check (config, callback) {
  getenv('check', config, (err, data) => {
    callback(err, data)
  })
}

module.exports = {
  apply,
  check,
  destroy,
  reference,
  version
}
