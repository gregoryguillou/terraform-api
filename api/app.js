'use strict'

const SwaggerExpress = require('swagger-express-mw')
const passport = require('passport')
const params = require('./api/models/jwt')
const { Strategy } = require('passport-jwt')
const { HeaderAPIKeyStrategy } = require('passport-headerapikey')
const app = require('express')()
const user = require('./api/models/user')
const logger = require('./api/models/logger')
const { updateAll } = require('./api/models/git')
const { testConnection } = require('./api/models/couchbase')
const { sayHi } = require('./api/models/cronjobs')

const config = {
  appRoot: __dirname
}

let scheduler = false

process.argv.forEach((val, index) => {
  if (val === '-scheduler' || val === '-scheduler') {
    scheduler = true
  }
})

const jwtAuth = () => passport.authenticate('jwt', { session: false })
const goNext = (req, res, next) => next()

passport.use(new HeaderAPIKeyStrategy({ header: 'Authorization', prefix: 'Key ' }, false, (apikey, done) => {
  user.findByAPIKey({ apikey }, (err, user) => {
    if (err) {
      return done(err)
    }
    if (!user) {
      return done(null, false)
    }
    done(null, user)
  })
}))

passport.use(new Strategy(params, (payload, done) => {
  user.findByToken(payload, (err, user) => {
    if (err) {
      return done(err)
    }
    if (!user) {
      return done(null, false)
    }
    done(null, user)
  })
}))

app.use(passport.initialize())
app.use('/login', passport.authenticate('headerapikey', { session: false }), goNext)
app.use('/user', jwtAuth(), goNext)
app.use('/events', jwtAuth(), goNext)
app.use('/projects', jwtAuth(), goNext)
app.use('/channels', jwtAuth(), goNext)
app.use('/version', jwtAuth(), goNext)

if (scheduler) {
  sayHi()
} else {
  updateAll(() => {
    testConnection(60, () => {
      SwaggerExpress.create(config, (err, swaggerExpress) => {
        if (err) {
          throw err
        }
        if (err) { throw err }
        swaggerExpress.register(app)
        const port = process.env.PORT || 10010
        app.listen(port, '0.0.0.0', () => {
          logger.info('Listening on http://0.0.0.0:%d', port)
          app.emit('apiStarted')
        })
      })
    })
  })
}

module.exports = app
