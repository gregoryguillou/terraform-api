'use strict'

const util = require('util')
const YAML = require('yamljs')
const projects = YAML.load('config/settings.yaml')['projects']
const { getTags, getBranches } = require('../models/git')

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
  for (var i = 0, size = projects.length; i < size; i++) {
    if (projects[i].name === pproject) {
      getBranches(
        {name: pproject},
        (branches) => {
          let list = []
          for (let j = 0, wsize = branches.length; j < wsize; j++) {
            list.push({name: branches[j]})
          }
          if (list.length > 0) {
            res.json({branches: list})
          } else {
            res.status(400).json({message: util.format('No branch found for {%s}', pproject)})
          }
        }
      )
    }
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
    res.json(project)
  } else {
    res.status(404).json({message: util.format('Project {%s} not found', pproject)})
  }
}

function list (req, res) {
  let output = []
  for (var i = 0, size = projects.length; i < size; i++) {
    output.push({type: projects[i].type, name: projects[i].name, description: projects[i].description})
  }
  res.json(output)
}

function tags (req, res) {
  var pproject = req.swagger.params.project.value
  for (var i = 0, size = projects.length; i < size; i++) {
    if (projects[i].name === pproject) {
      getTags(
        {name: pproject},
        (tags) => {
          let list = []
          for (let j = 0, wsize = tags.length; j < wsize; j++) {
            list.push({name: tags[j]})
          }
          if (list.length > 0) {
            res.json({tags: list})
          } else {
            res.status(400).json({message: util.format('No tag found for {%s}', pproject)})
          }
        }
      )
    }
  }
}

module.exports = {
  project_action: action,
  project_branches: branches,
  project_describe: describe,
  projects_list: list,
  project_tags: tags
}
