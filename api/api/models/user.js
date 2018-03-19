'use strict'

const YAML = require('yamljs')
const users = YAML.load('config/settings.yaml').users

// TODO return an error, or just one argument
function findByAPIKey (key, callback) {
  const username = users.find(user => key.apikey === user.apikey)

  if (username) {
    return callback(null, {username})
  }
  callback()
}

// TODO return an error, or just one argument
function findByToken (payload, callback) {
  if (payload.username) {
    return callback(null, {username: payload.username})
  }
  callback()
}

module.exports = {
  findByAPIKey,
  findByToken
}
