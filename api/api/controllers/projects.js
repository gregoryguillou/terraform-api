'use strict'

const util = require('util')
const YAML = require('yamljs')
const projects = YAML.load('config/settings.yaml')['projects']

function list (req, res) {
  let output = []
  for (var i = 0, size = projects.length; i < size; i++) {
    output.push({type: projects[i].type, name: projects[i].name, description: projects[i].description})
  }
  res.status(200).json(output)
}

function description (req, res) {
  var pproject = req.swagger.params.project.value
  let project = {}
  for (var i = 0, size = projects.length; i < size; i++) {
    if (projects[i].name === pproject) {
      project = {type: projects[i].type, name: projects[i].name, description: projects[i].description, workspaces: []}
      for (var j = 0, wsize = projects[i].workspaces.length; j < wsize; j++) {
        project['workspaces'].push({name: projects[i].workspaces[j], status: 'stopped'})
      }
    }
  }
  if (project.name) {
    res.status(200).json(project)
  } else {
    res.status(404).json({message: util.format('Project {%s} not found', pproject)})
  }
}

function workspace (req, res) {
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
    res.status(200).json(workspace)
  } else {
    res.status(404).json({message: util.format('Project/Workspace {%s/%s} not found', pproject, pworkspace)})
  }
}

function action (req, res) {
  var pproject = req.swagger.params.project.value
  var pworkspace = req.swagger.params.workspace.value
  var paction = req.swagger.params.action.value
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

module.exports = {
  projects_list: list,
  project_description: description,
  project_workspace: workspace,
  workspace_action: action
}
