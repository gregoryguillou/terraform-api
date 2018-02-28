'use strict'

const YAML = require('yamljs')
const keys = YAML.load('config/settings.yaml')['api-keys']

console.log(keys)

function findbyapikey (key, callback) {
  let username = null
  for (var i = 0, size = keys.length; i < size; i++) {
    if (key['apikey'] === keys[i]['apikey']) {
      username = keys[i]['username']
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
