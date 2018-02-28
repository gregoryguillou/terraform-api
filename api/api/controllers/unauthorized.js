'use strict'

function unauthorized (req, res) {
  res.json({message: 'Unauthorized Access'})
}

module.exports = {
  unauthorized: unauthorized
}
