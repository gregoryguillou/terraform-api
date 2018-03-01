const util = require('util')
const git = require('simple-git/promise')
const YAML = require('yamljs')
const projects = YAML.load('config/settings.yaml')['projects']
const fs = require('fs')

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
    console.log(util.format('Start cloning https://%s...', gitProps['repository']))
    git().silent(true)
      .clone(remote, localProject)
      .then(() => {
        console.log(util.format('Finish cloning https://%s with success!', gitProps['repository']))
        callback()
      })
      .catch((err) => console.error(util.format('Error cloning https://%s:\n', gitProps['repository']), err))
  } else {
    console.log(util.format('Start updating https://%s...', gitProps['repository']))
    git(localProject)
      .fetch(
        remote,
        'master',
        { '--prune': null }
      )
      .then(() => {
        console.log(util.format('Finish updating https://%s with success!', gitProps['repository']))
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

module.exports = {
  updateAll: updateAll
}
