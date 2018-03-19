'use strict'

const YAML = require('yamljs')
const projects = YAML.load('config/settings.yaml')['projects']
const { getTags, getBranches } = require('../models/git')

function action (req, res) {
  const name = req.swagger.params.project.value
  const project = projects.find(p => p.name === name)
  if (!project) {
    return res.status(404).json({message: `Project ${name} not found`})
  }
  res.status(201).json()
}

function branches (req, res) {
  const name = req.swagger.params.project.value
  const project = projects.find(p => p.name === name)
  if (!project) {
    return res.status(404).json({message: `Project ${name} not found`})
  }
  getBranches({name}, branches => {
    if (branches.length) {
      return res.json({branches: branches.map(name => ({name}))})
    }
    res.status(400).json({message: `No branch found for ${name}`})
  })
}

function describe (req, res) {
  const name = req.swagger.params.project.value
  const project = projects.find(p => p.name === name)
  if (!project) {
    return res.status(404).json({message: `Project ${name} not found`})
  }
  const p = {
    description: project.description,
    name: project.name,
    type: project.type,
    workspaces: project.workspaces.map(name => ({ name, status: 'stopped' }))
  }
  return res.json(p)
}

function list (req, res) {
  res.json({projects: projects.map(p => ({
    description: p.description,
    name: p.name,
    type: p.type
  }))})
}

function tags (req, res) {
  const name = req.swagger.params.project.value
  const project = projects.find(p => p.name === name)
  if (!project) {
    return res.status(404).json({message: `Project ${name} not found`})
  }
  getTags({name}, tags => {
    if (tags.length) {
      return res.json({tags: tags.map(name => ({name}))})
    }
    res.status(404).json({message: `No tag found for ${name}`})
  })
}

function workspaces (req, res) {
  const name = req.swagger.params.project.value
  const project = projects.find(p => p.name === name)
  if (!project) {
    return res.status(404).json({message: `Project ${name} not found`})
  }
  if (project.workspaces.length) {
    return res.json({workspaces: project.workspaces.map(name => ({name}))})
  }
  res.status(404).json({message: `No workspaces found for ${name}`})
}

module.exports = {
  project_action: action,
  project_branches: branches,
  project_describe: describe,
  projects_list: list,
  project_tags: tags,
  project_workspaces: workspaces
}
