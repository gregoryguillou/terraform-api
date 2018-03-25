const app = require('express')()
const bodyParser = require('body-parser')
const multer = require('multer')
const process = require('process')
const upload = multer()
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}
const { response } = require('./model/slack')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/slack/action', upload.array(), function (req, res, next) {
  if (!req.body.token || req.body.token !== process.env.APP_TOKEN) {
    res.status(401).json({})
  } else if (req.body.event && req.body.event.channel && req.body.event.user) {
    let command = req.body.event.text.split(' ')
    response(req.body.event.channel, req.body.event.user, command)
    res.json({})
  } else if (req.body.challenge) {
    res.json({challenge: req.body.challenge})
  } else {
    res.json({})
  }
})

app.get('/status', function (req, res, next) {
  res.json({status: 'OK'})
})

app.listen(8080, function () {
  console.log('Started Deck Slack bot on port 8080...')
})
