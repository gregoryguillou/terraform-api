'use strict'

const app = require('../../../package.json')

function version (req, res) {
  res.json({ version: `v${app.version}` })
}

module.exports = {version}
