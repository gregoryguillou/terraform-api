'use strict'

const jwt = require('jsonwebtoken')
const params = require('../models/jwt')

function token (req, res) {
  const token = jwt.sign({username: req.user.username}, params.secretOrKey, {expiresIn: 120})
  res.json({token, message: 'Authenticated'})
}

function user (req, res) {
  res.json({ username: req.user.username })
}

module.exports = {
  login_user: user,
  login_token: token
}
