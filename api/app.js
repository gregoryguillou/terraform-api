'use strict'

const SwaggerExpress = require('swagger-express-mw')
const passport = require('passport')
const params = require('./api/models/jwt')
const { Strategy } = require('passport-jwt')
const { HeaderAPIKeyStrategy } = require('passport-headerapikey')
const app = require('express')()
const user = require('./api/models/user')

const config = {
  appRoot: __dirname
}

passport.use(new HeaderAPIKeyStrategy(
  { header: 'Authorization', prefix: 'Key ' },
  false,
  (apikey, done) => {
    user.findbyapikey(
      { apikey: apikey },
      (err, user) => {
        if (err) { return done(err) }
        if (!user) { return done(null, false) }
        return done(null, user)
      }
    )
  }
))

passport.use(new Strategy(
  params,
  (payload, done) => {
    user.findbytoken(
      payload,
      (err, user) => {
        if (err) { return done(err) }
        if (!user) { return done(null, false) }
        return done(null, user)
      }
    )
  }
))

app.use(passport.initialize())
app.use(
  '/login',
  passport.authenticate(
    'headerapikey', { session: false }),
    (req, res, next) => {
      next()
    }
  )

app.use(
    '/user',
    passport.authenticate(
      'jwt', { session: false }),
      (req, res, next) => {
        next()
      }
    )

SwaggerExpress.create(config, (err, swaggerExpress) => {
  if (err) { throw err }
  swaggerExpress.register(app)
  const port = process.env.PORT || 10010
  app.listen(port)
  console.log('Connected to http://127.0.0.1:' + port)
})

module.exports = app
