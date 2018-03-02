const util = require('util')
const git = require('simple-git/promise')
const YAML = require('yamljs')
const projects = YAML.load('config/settings.yaml')['projects']
const fs = require('fs')
const log = require('./logger')

function update (project, callback) {
  let gitProps = project['git']
  const localProject = '/tmp/' + project['name']
  let remote = ''
  if (gitProps['login']) {
    remote = util.format('https://%s:%s@%s', gitProps['login'], gitProps['password'], gitProps['repository'])
  } else {
    remote = util.format('https://%s', gitProps['repository'])
  }

  var stats = fs.statSync(localProject)
  if (!stats.isDirectory()) {
    log.info('Start cloning https://%s...', gitProps['repository'])
    git().silent(true)
      .clone(remote, localProject)
      .then(() => {
        log.info('Finish cloning https://%s with success!', gitProps['repository'])
        callback()
      })
      .catch((err) => console.error(util.format('Error cloning https://%s:\n', gitProps['repository']), err))
  } else {
    log.info('Start updating https://%s...', gitProps['repository'])
    git(localProject)
      .fetch(
        remote,
        'master',
        { '--prune': null }
      )
      .then(() => {
        log.info('Finish updating https://%s with success!', gitProps['repository'])
        callback()
      })
      .catch((err) => console.error(util.format('Error cloning https://%s:\n', gitProps['repository']), err))
  }
}

function updateAll (callback) {
  let nbProjects = projects.length
  for (var i = 0, size = projects.length; i < size; i++) {
    update(
      projects[i],
      () => {
        nbProjects--
        if (nbProjects === 0) {
          callback()
        }
      }
    )
  }
}

function getTags (project, callback) {
  const localProject = '/tmp/' + project['name']
  require('simple-git')(localProject)
    .tags((err, tags) => {
      if (!err) {
        callback(tags['all'])
      }
    })
}

function getBranches (project, callback) {
  const localProject = '/tmp/' + project['name']
  require('simple-git')(localProject)
    .branch((err, branches) => {
      let list = []
      if (!err) {
        const re = /remotes\/origin\//
        for (var i = 0, size = branches['all'].length; i < size; i++) {
          if (branches['all'][i].match(re)) {
            list.push(branches['all'][i].replace(/remotes\/origin\/(.*)/, '$1'))
          }
        }
        callback(list)
      }
    })
}

module.exports = {
  getBranches: getBranches,
  getTags: getTags,
  updateAll: updateAll
}
