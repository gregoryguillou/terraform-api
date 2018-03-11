'use strict'

const util = require('util')
const YAML = require('yamljs')
const projects = YAML.load('config/settings.yaml')['projects']
const { showWorkspace, actionWorkspace, workspaceEndRequest } = require('../models/couchbase')
const { apply } = require('../models/docker')
const logger = require('../models/logger')

function describe (req, res) {
  const workspace = {
    project: req.swagger.params.project.value,
    workspace: req.swagger.params.workspace.value
  }
  const key = `ws:${workspace['project']}:${workspace['workspace']}`
  showWorkspace(workspace, (err, data) => {
    if (err) {
      res.status(404).json({ message: `(${workspace['project']}/${workspace['workspace']} not found` })
    } else {
      res.json(data[key])
    }
  })
}

function action (req, res) {
  const workspace = {
    project: req.swagger.params.project.value,
    workspace: req.swagger.params.workspace.value
  }
  const key = `ws:${workspace['project']}:${workspace['workspace']}`
  actionWorkspace(workspace, {action: req.swagger.params.action.value['action']}, (err, data) => {
    if (err) {
      if (err.code && (err.code === 409)) {
        res.status(409).json({ message: `(${workspace['project']}/${workspace['workspace']} has a pending action` })
      } else {
        res.status(404).json({ message: `(${workspace['project']}/${workspace['workspace']} not found` })
      }
    } else {
      if (req.swagger.params.action.value['action'] === 'apply') {
        apply({project: workspace['project'], workspace: workspace['workspace'], event: data[key].request.event}, (err, data) => {
          let msg = 'applied'
          if (err) {
            msg = 'error'
          }
          workspaceEndRequest({project: workspace['project'], workspace: workspace['workspace']}, msg, (err, data) => {
            if (err) {
              logger.error(`${workspace['project']}/${workspace['workspace']} failed to register ${msg}`)
            } else {
              logger.info(`${workspace['project']}/${workspace['workspace']} has successfully registered ${msg}`)
            }
          })
        })
      }
      res.status(201).json({event: data[key].request.event})
    }
  })
}

function events (req, res) {
  var pproject = req.swagger.params.project.value
  var pworkspace = req.swagger.params.workspace.value

  let event = {}
  for (var i = 0, size = projects.length; i < size; i++) {
    if (projects[i].name === pproject) {
      for (var j = 0, wsize = projects[i].workspaces.length; j < wsize; j++) {
        if (projects[i].workspaces[j] === pworkspace) {
          event = {time: '1970-01-01 00:00:00', description: 'The environment has been registered', reference: util.format('/projects/%s/workspace/%s', pproject, pworkspace)}
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
  workspace_events: events
}
