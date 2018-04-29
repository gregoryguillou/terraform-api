'use strict'

const {findIdByUsername} = require('../models/user')
const {messageAdd, messageDelete, messageDescribe, messageList} = require('../models/couchbase')

function backgroundAdd (channel, text, callback) {
  const user = channel.slice('channels:'.length, channel.search(/\//))
  messageAdd(user, {channel: channel.slice(channel.search(/\//) + 1), text: text}, (err, data) => {
    if (err) {
      callback(err, null)
    } else {
      callback(null, data)
    }
  })
}

function describe (req, res) {
  const id = req.swagger.params.message.value
  messageDescribe(id, (err2, data2) => {
    if (data2) {
      return res.status(200).json(data2)
    } else {
      return res.status(404).json({})
    }
  })
}

function remove (req, res) {
  const id = req.swagger.params.message.value
  messageDelete(id, (err2, data2) => {
    if (data2) {
      return res.status(204).json(data2)
    } else {
      return res.status(404).json({})
    }
  })
}

function list (req, res) {
  findIdByUsername(req.user.username, (err, userid) => {
    if (err) {
      return res.status(500).json({})
    }
    messageList(userid, (err, data) => {
      if (err) {
        return res.status(500).json({})
      }
      return res.status(200).json(data)
    })
  })
}

module.exports = {
  backgroundAdd: backgroundAdd,
  message_delete: remove,
  message_describe: describe,
  messages_list: list
}
