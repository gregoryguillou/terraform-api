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

module.exports = {
  channel_describe: describe,
  channels_list: list
}
