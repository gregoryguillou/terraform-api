'use strict'

const app = require('../../package.json')

function version (req, res) {
  res.json({ version: `v${app.version}` })
}

function status (req, res) {
  res.json({ message: 'Listener is okay' })
}

module.exports = {
  status,
  version
}
