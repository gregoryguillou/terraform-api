'use strict'

const { ExtractJwt } = require('passport-jwt')
const YAML = require('yamljs')
const secretOrKey = YAML.load('config/settings.yaml').jwt.secretOrKey

const params = {
  secretOrKey,
  jwtFromRequest: ExtractJwt.versionOneCompatibility({authScheme: 'Bearer'})
}

module.exports = params
