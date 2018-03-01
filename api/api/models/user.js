'use strict'

const YAML = require('yamljs')
let users = YAML.load('config/settings.yaml')['users']

function findbyapikey (key, callback) {
  let username = null
  for (var i = 0, size = users.length; i < size; i++) {
    if (key['apikey'] === users[i]['apikey']) {
      username = users[i]['username']
    }
  }

  if (username) {
    callback(null, {username: username})
  } else {
    callback(null, null)
  }
}

function findbytoken (payload, callback) {
  if (payload['username']) {
    callback(null, {username: payload['username']})
  } else {
    callback(null, null)
  }
}

module.exports = {
  findbyapikey: findbyapikey,
  findbytoken: findbytoken
}
