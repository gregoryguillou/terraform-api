'use strict'

function version (req, res) {
  res.json({ version: '0.0.1' })
}

module.exports = {
  version: version
}
