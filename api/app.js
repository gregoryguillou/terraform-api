'use strict'

const SwaggerExpress = require('swagger-express-mw')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const { ExtractJwt, Strategy } = require('passport-jwt')
const { HeaderAPIKeyStrategy } = require('passport-headerapikey')
const app = require('express')()
const user = require('./api/models/user')
const secretOrKey = process.env.SECRETORKEY || 'secret'

const config = {
  appRoot: __dirname
}

const params = {
  secretOrKey: secretOrKey,
  jwtFromRequest: ExtractJwt.versionOneCompatibility({authScheme: 'Bearer'})
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
  '/auth',
  passport.authenticate(
    'headerapikey', { session: false, failureRedirect: '/unauthorized' }),
    (req, res, next) => {
      const token = jwt.sign({username: req.user.username}, params['secretOrKey'], {expiresIn: 120})
      res.json({ message: 'Authenticated', token: token })
    }
  )

app.use(
    '/user',
    passport.authenticate(
      'jwt', { session: false, failureRedirect: '/unauthorized' }),
      (req, res, next) => {
        res.json({ message: 'Authenticated', username: req.user.username })
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
