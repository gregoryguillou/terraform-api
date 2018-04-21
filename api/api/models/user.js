'use strict'

const {getUsers} = require('./couchbase')

// TODO return an error, or just one argument
function findByAPIKey (key, callback) {
  getUsers((err, users) => {
    if (err) {
      return callback(err, null)
    }
    const username = users.users.find(user => key.apikey === user.apikey)

    if (username) {
      return callback(null, username)
    }
    callback(null, null)
  })
}

function findIdByUsername (username, callback) {
  if (username) {
    getUsers((err, users) => {
      if (err) {
        return callback(err, null)
      }
      const myuser = users.users.find(user => username === user.username)

      if (myuser) {
        return callback(null, myuser.userid)
      }
      callback(null, null)
    })
  } else {
    callback()
  }
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
  findByToken,
  findIdByUsername
}
