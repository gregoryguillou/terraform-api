'use strict'

function version (req, res) {
  res.status(200).json({ version: '0.0.1' })
}

module.exports = {
  version: version
}
