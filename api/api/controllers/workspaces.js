'use strict'

const util = require('util')
const YAML = require('yamljs')
const projects = YAML.load('config/settings.yaml').projects
const {
  actionWorkspace,
  feedWorkspace,
  showWorkspace
} = require('../models/couchbase')
const { apply, check, destroy, reference } = require('../models/docker')
const logger = require('../models/logger')
const { exec } = require('child_process')

function sh (cmd, options, callback) {
  exec(cmd, options, (err, stdout, stderr) => {
    if (err) {
      return callback(err)
    }
    callback(null, 'OK')
  })
}

function describe (req, res) {
  const workspace = {
    project: req.swagger.params.project.value,
    workspace: req.swagger.params.workspace.value
  }
  const key = `ws:${workspace.project}:${workspace.workspace}`
  showWorkspace(workspace, (err, data) => {
    if (err) {
      return res.status(404).json({
        message: `(${workspace.project}/${workspace.workspace} not found`
      })
    }
    res.json(data[key])
  })
}

function quickcheck (req, res) {
  const workspace = {
    project: req.swagger.params.project.value,
    workspace: req.swagger.params.workspace.value
  }
  const key = `ws:${workspace.project}:${workspace.workspace}`
  const project = workspace.project
  let cwd = ''
  let command = [ ]
  for (var i = 0, size = projects.length; i < size; i++) {
    if (projects[i].name === project) {
      cwd = projects[i].lifecycle.cwd || 'projects/demonstration'
      for (var j = 0, wsize = projects[i].lifecycle.status.length; j < wsize; j++) {
        command.push(
          projects[i].lifecycle.status[j].replace(/{{deck\.WORKSPACE}}/,
            workspace.workspace
          )
        )
      }
    }
  }
  showWorkspace(workspace, (err, wk) => {
    if (err) {
      return res.status(500).json({message: 'Unexpected error'})
    }
    if (!wk) {
      return res.status(404).json({message: `${workspace.project}:${workspace.workspace} Not Found`})
    }
    sh(command[0], {cwd: cwd}, (err, data) => {
      if (!err) {
        return res.json({
          quickCheck: 'success',
          lastChecked: wk[key].lastChecked,
          ref: wk[key].ref,
          state: wk[key].state
        })
      }
      if (err.code !== 1 || err.killed) {
        res.status(500).json({message: 'Fatal Error'})
      }
      res.status(404).json({
        quickCheck: 'failure',
        lastChecked: wk[key].lastChecked,
        ref: wk[key].ref,
        state: wk[key].state
      })
    })
  })
}

function action (req, res) {
  const params = req.swagger.params
  const actionValue = params.action.value
  const workspace = {
    project: params.project.value,
    workspace: params.workspace.value
  }
  if (actionValue.action === 'clean') {
    feedWorkspace({project: workspace.project, workspace: workspace.workspace}, {status: 'clean'}, (err, data) => {
      if (err) {
        logger.error(`${workspace.project}/${workspace.workspace} failed to clean`)
      }
    })
    return res.status(201).json({event: 'none'})
  }

  actionWorkspace(workspace, {action: actionValue.action, ref: actionValue.ref}, (err, data) => {
    const key = `ws:${workspace.project}:${workspace.workspace}`
    if (err) {
      if (err.code && (err.code === 409)) {
        res.status(409).json({
          message: `(${workspace.project}/${workspace.workspace} has a pending action`
        })
      } else {
        res.status(404).json({ message: `(${workspace.project}/${workspace.workspace} not found` })
      }
    } else {
      if (actionValue.action === 'apply') {
        let request = {
          project: workspace.project,
          workspace: workspace.workspace,
          ref: (actionValue.ref ? actionValue.ref : (data[key].ref ? data[key].ref : 'branch:master')),
          event: data[key].request.event
        }
        apply(request, (err, data) => {
          let status = 'succeed'
          if (err) {
            logger.error(`${workspace.project}/${workspace.workspace} failed to check ${status}`)
            status = 'fail'
          } else if (data.StatusCode !== 0) {
            logger.error(`${workspace.project}/${workspace.workspace} docker has failed with code: ${data.StatusCode} - ${status}`)
            status = 'fail'
          }
          feedWorkspace({project: workspace.project, workspace: workspace.workspace}, {status: status}, (err, data) => {
            if (err) {
              logger.error(`${workspace.project}/${workspace.workspace} failed store check ${status}`)
            }
          })
        })
        res.status(201).json({event: data[key].request.event})
      } else if (actionValue.action === 'reference') {
        let request = {
          project: workspace.project,
          workspace: workspace.workspace,
          ref: (actionValue.ref ? actionValue.ref : (data[key].ref ? data[key].ref : 'branch:master')),
          event: data[key].request.event
        }
        reference(request, (err, data) => {
          if (err) { throw err }
          let status = 'changed'
          feedWorkspace({project: workspace.project, workspace: workspace.workspace}, {status: status}, (err, data) => {
            if (err) {
              logger.error(`${workspace.project}/${workspace.workspace} error referencing ${request.ref}`)
            }
          })
        })
        res.status(201).json({event: data[key].request.event})
      } else if (actionValue.action === 'destroy') {
        destroy({project: workspace.project, workspace: workspace.workspace, event: data[key].request.event}, (err, data) => {
          let status = 'succeed'
          if (err) {
            logger.error(`${workspace.project}/${workspace.workspace} failed to check ${status}`)
            status = 'fail'
          } else if (data.StatusCode !== 0) {
            logger.error(`${workspace.project}/${workspace.workspace} docker has failed with code: ${data.StatusCode} - ${status}`)
            status = 'fail'
          }
          feedWorkspace({project: workspace.project, workspace: workspace.workspace}, {status: status}, (err, data) => {
            if (err) {
              logger.error(`${workspace.project}/${workspace.workspace} failed store check ${status}`)
            }
          })
        })
        res.status(201).json({event: data[key].request.event})
      } else if (actionValue.action === 'check') {
        check({project: workspace.project, workspace: workspace.workspace, event: data[key].request.event}, (err, data) => {
          let status = 'succeed'
          if (err) {
            logger.error(`${workspace.project}/${workspace.workspace} failed to check ${status}`)
            status = 'fail'
          } else if (data.StatusCode === 2) {
            logger.error(`${workspace.project}/${workspace.workspace} docker has failed with code: ${data.StatusCode} - ${status}`)
            status = 'differ'
          } else if (data.StatusCode !== 0) {
            logger.error(`${workspace.project}/${workspace.workspace} docker has failed with code: ${data.StatusCode} - ${status}`)
            status = 'fail'
          }
          feedWorkspace({project: workspace.project, workspace: workspace.workspace}, {status: status}, (err, data) => {
            if (err) {
              logger.error(`${workspace.project}/${workspace.workspace} failed store check ${status}`)
            }
          })
        })
        res.status(201).json({event: data[key].request.event})
      }
    }
  }
  )
}

function events (req, res) {
  var pproject = req.swagger.params.project.value
  var pworkspace = req.swagger.params.workspace.value

  let event = {}
  for (var i = 0, size = projects.length; i < size; i++) {
    if (projects[i].name === pproject) {
      for (var j = 0, wsize = projects[i].workspaces.length; j < wsize; j++) {
        if (projects[i].workspaces[j] === pworkspace) {
          event = {
            time: '1970-01-01 00:00:00',
            description: 'The environment has been registered',
            reference: util.format('/projects/%s/workspace/%s',
              pproject,
              pworkspace
            )
          }
        }
      }
    }
  }

  if (event.time) {
    res.json([event])
  } else {
    res.status(404).json({message: util.format('Project {%s} not found', pproject)})
  }
}

module.exports = {
  workspace_action: action,
  workspace_describe: describe,
  workspace_events: events,
  workspace_status: quickcheck
}
