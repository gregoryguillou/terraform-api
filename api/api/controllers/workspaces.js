'use strict'

const util = require('util')
const YAML = require('yamljs')
const projects = YAML.load('config/settings.yaml')['projects']
const { showWorkspace } = require('../models/couchbase')

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
  var pproject = req.swagger.params.project.value
  var pworkspace = req.swagger.params.workspace.value
  let workspace = {}
  for (var i = 0, size = projects.length; i < size; i++) {
    if (projects[i].name === pproject) {
      for (var j = 0, wsize = projects[i].workspaces.length; j < wsize; j++) {
        if (projects[i].workspaces[j] === pworkspace) {
          workspace = {name: projects[i].workspaces[j], status: 'stopped'}
        }
      }
    }
  }
  if (workspace.name) {
    res.status(201).json()
  } else {
    res.status(404).json({message: util.format('Project/Workspace {%s/%s} not found', pproject, pworkspace)})
  }
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
