'use strict'

const fs = require('fs')

function version (req, res) {
  fs.readFile('package.json', 'utf8', function (err, data) {
    if (err) throw err
    const obj = JSON.parse(data)
    res.json({ version: `v${obj['version']}` })
  })
}

module.exports = {version}
