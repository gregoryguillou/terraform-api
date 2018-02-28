'use strict'

const util = require('util')

function hello (req, res) {
  var name = req.swagger.params.name.value || 'stranger'
  var hello = util.format('Hello, %s!', name)

  res.json(hello)
}

module.exports = {
  hello: hello
}
