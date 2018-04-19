'use strict'

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
  console.log(channel)
  if (content) {
    return res.status(201).json(content)
  }
  return res.status(201).json({})
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
