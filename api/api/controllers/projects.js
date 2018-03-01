'use strict'

const util = require('util')
const YAML = require('yamljs')
const projects = YAML.load('config/settings.yaml')['projects']

function action (req, res) {
  var pproject = req.swagger.params.project.value
  let project = {}
  for (var i = 0, size = projects.length; i < size; i++) {
    if (projects[i].name === pproject) {
      project = {name: projects[i].name}
    }
  }
  if (project.name) {
    res.status(201).json()
  } else {
    res.status(404).json({message: util.format('Project {%s} not found', pproject)})
  }
}

function branches (req, res) {
  var pproject = req.swagger.params.project.value
  let branch = {}
  for (var i = 0, size = projects.length; i < size; i++) {
    if (projects[i].name === pproject) {
      branch = {name: 'master'}
    }
  }

  if (branch.name) {
    res.status(200).json([branch])
  } else {
    res.status(404).json({message: util.format('Project {%s} not found', pproject)})
  }
}

function describe (req, res) {
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

function events (req, res) {
  var pproject = req.swagger.params.project.value
  let event = {}
  for (var i = 0, size = projects.length; i < size; i++) {
    if (projects[i].name === pproject) {
      event = {time: '1970-01-01 00:00:00', description: 'The environment has been registered', reference: util.format('/projects/%s/workspace/staging', pproject)}
    }
  }

  if (event.time) {
    res.status(200).json([event])
  } else {
    res.status(404).json({message: util.format('Project {%s} not found', pproject)})
  }
}

function list (req, res) {
  let output = []
  for (var i = 0, size = projects.length; i < size; i++) {
    output.push({type: projects[i].type, name: projects[i].name, description: projects[i].description})
  }
  res.status(200).json(output)
}

function tags (req, res) {
  var pproject = req.swagger.params.project.value
  let tag = {}
  for (var i = 0, size = projects.length; i < size; i++) {
    if (projects[i].name === pproject) {
      tag = {name: 'v0.0.1'}
    }
  }

  if (tag.name) {
    res.status(200).json([tag])
  } else {
    res.status(404).json({message: util.format('Project {%s} not found', pproject)})
  }
}

module.exports = {
  project_action: action,
  project_branches: branches,
  project_describe: describe,
  project_events: events,
  projects_list: list,
  project_tags: tags
}
