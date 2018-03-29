const util = require('util')
const git = require('simple-git/promise')
const YAML = require('yamljs')
const projects = YAML.load('config/settings.yaml')['projects']
const fs = require('fs')
const logger = require('./logger')

function update (project, callback) {
  let gitProps = project.git
  const localProject = '/tmp/' + project.name
  let remote
  if (gitProps.login) {
    remote = util.format('https://%s:%s@%s', gitProps.login, gitProps.password, gitProps.repository)
  } else {
    remote = util.format('https://%s', gitProps.repository)
  }

  if (!fs.existsSync(localProject)) {
    logger.info('Start cloning https://%s...', gitProps.repository)
    return git().silent(true).clone(remote, localProject)
      .then(() => {
        logger.info('Finish cloning https://%s with success!', gitProps.repository)
        callback()
      })
      .catch((err) => {
        logger.error(util.format('Error cloning https://%s:\n', gitProps.repository), err)
      })
  }
  logger.info('Start updating https://%s...', gitProps.repository)
  git(localProject).fetch(remote, 'master', { '--prune': null, '--tags': null })
    .then(() => {
      logger.info('Finish updating https://%s with success!', gitProps.repository)
      callback()
    })
    .catch(err => {
      logger.error(util.format('Error cloning https://%s:\n', gitProps['repository']), err)
    })
}

function updateAll (callback) {
  projects.forEach((project, index) => {
    update(project, () => {
      if (index === (projects.length - 1)) {
        callback()
      }
    })
  })
}

function getTags (project, callback) {
  const localProject = '/tmp/' + project.name
  require('simple-git')(localProject).listRemote(['--tags'], (err, tags) => {
    if (!err) {
      let output = []
      tags.split('\n').forEach(p => {
        if (p && p.split('\t')[1].match(/^refs\/tags\//)) {
          output.push(p.split('\t')[1].replace(/^refs\/tags\//, ''))
        }
      })
      callback(output)
    }
  })
}

function getBranches (project, callback) {
  const localProject = '/tmp/' + project.name
  require('simple-git')(localProject).listRemote(['--heads'], (err, heads) => {
    if (!err) {
      let output = []
      heads.split('\n').forEach(p => {
        if (p && p.split('\t')[1].match(/^refs\/heads\//)) {
          output.push(p.split('\t')[1].replace(/^refs\/heads\//, ''))
        }
      })
      callback(output)
    }
  })
}

module.exports = {
  getBranches,
  getTags,
  updateAll
}
