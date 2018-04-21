'use strict'

const {findIdByUsername} = require('../models/user')
const {channelStore} = require('../models/couchbase')

function describe (req, res) {
  const channel = req.swagger.params.channel.value
  if (channel === 'default') {
    const p = {
      project: 'demonstration',
      workspace: 'staging',
      name: channel
    }
    return res.json(p)
  }
  return res.status(404).json({message: `Channel ${channel} not found`})
}

function list (req, res) {
  res.json({channels: [{name: 'default'}]})
}

function create (req, res) {
  const channel = req.swagger.params.channel.value
  const content = req.swagger.params.content.value
  findIdByUsername(req.user.username, (err, userid) => {
    console.log(`userid is: ${userid} on ${channel}`)
    if (err) {
      return res.status(500).json(content)
    }
    channelStore(`${userid}/${channel}`, content, (err, data) => {
      if (err) {
        return res.status(500).json(content)
      }
      if (data) {
        return res.status(201).json(data)
      }
      return res.status(201).json({})
    })
  })
}

function remove (req, res) {
  const channel = req.swagger.params.channel.value
  console.log(channel)
  res.status(204).json()
}

module.exports = {
  channel_create: create,
  channel_delete: remove,
  channel_describe: describe,
  channels_list: list
}
