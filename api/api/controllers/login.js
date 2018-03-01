'use strict'

const jwt = require('jsonwebtoken')
const params = require('../models/jwt')

function token (req, res) {
  const token = jwt.sign({username: req.user.username}, params['secretOrKey'], {expiresIn: 120})
  res.status(200).json({message: 'Authenticated', token: token})
}

function user (req, res) {
  res.status(200).json({ username: req.user.username })
}

module.exports = {
  login_user: user,
  login_token: token
}
