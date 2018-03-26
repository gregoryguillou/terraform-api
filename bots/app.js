const app = require('express')()
const bodyParser = require('body-parser')
const multer = require('multer')
const upload = multer()
require('dotenv').config()
const YAML = require('yamljs')
const param = YAML.load('config/settings.yaml').bots

const { response } = require('./model/slack')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

param.forEach(element => {
  if (element.type === 'slack') {
    app.post(`/slack/${element.name}`, upload.array(), function (req, res, next) {
      if (!req.body.token || req.body.token !== element.slack.app_token) {
        return res.status(401).json({})
      }
      if (req.body.challenge) {
        return res.json({challenge: req.body.challenge})
      }
      if (req.body.event && req.body.event.channel && req.body.event.user) {
        let command = req.body.event.text.split(' ').map(v => v.toLowerCase())
        let props = element
        props.conversationId = req.body.event.channel
        props.userId = req.body.event.user
        response(props, command)
        return res.json({})
      }
      res.json({})
    })
  }
})

app.get('/status', function (req, res, next) {
  res.json({status: 'OK'})
})

const server = app.listen(8080, '0.0.0.0', function () {
  console.log('Started Deck Bots on port 8080...')
})

module.exports = server
