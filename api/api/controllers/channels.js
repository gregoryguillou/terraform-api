'use strict'

const uuidv4 = require('uuid/v4')
const {findIdByUsername} = require('../models/user')
const {channelDescribe, channelList, channelUpdate, channelDelete} = require('../models/couchbase')
const { apply } = require('../models/docker')

function describe (req, res) {
  const channel = req.swagger.params.channel.value
  findIdByUsername(req.user.username, (err, userid) => {
    if (err) {
      return res.status(500).json({})
    }
    channelDescribe(`${userid}`, `${channel}`, (err, data) => {
      if (err) {
        return res.status(500).json({})
      }
      if (data) {
        return res.status(200).json(data)
      }
      return res.status(404).json()
    })
  })
}

function list (req, res) {
  findIdByUsername(req.user.username, (err, userid) => {
    if (err) {
      return res.status(500).json({})
    }
    channelList(`${userid}`, (err, data) => {
      if (err) {
        return res.status(500).json({})
      }
      return res.status(200).json(data)
    })
  })
}

function create (req, res) {
  const channel = req.swagger.params.channel.value
  const content = req.swagger.params.content.value
  findIdByUsername(req.user.username, (err, userid) => {
    if (err) {
      return res.status(500).json(content)
    }
    channelUpdate(`${userid}`, `${channel}`, content, (err, data) => {
      if (err) {
        return res.status(500).json(content)
      }
      if (data) {
        if (content && content.workspace) {
          apply({workspace: content.workspace, project: content.project, event: uuidv4()}, (err2, data2) => {
            if (err2) { throw err2 }
            return res.status(201).json(data)
          })
        } else {
          return res.status(201).json(data)
        }
      } else {
        return res.status(201).json({})
      }
    })
  })
}

function remove (req, res) {
  const channel = req.swagger.params.channel.value
  findIdByUsername(req.user.username, (err, userid) => {
    if (err) {
      return res.status(500).json({})
    }
    channelDelete(`${userid}`, `${channel}`, (err, cas, misses) => {
      if (err) {
        return res.status(500).json({})
      }
      res.status(204).json()
    })
  })
}

module.exports = {
  channel_create: create,
  channel_delete: remove,
  channel_describe: describe,
  channels_list: list
}
