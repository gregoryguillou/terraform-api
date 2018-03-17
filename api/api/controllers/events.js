'use strict'
const { showEvent } = require('../models/couchbase')

function describe (req, res) {
  var pevent = req.swagger.params.event.value
  showEvent(pevent, (err, data) => {
    if (err) {
      res.sendStatus(404)
    } else {
      res.json(data)
    }
  })
}

function logs (req, res) {
  // var pevent = req.swagger.params.event.value
  res.json([{message: 'This is an awesome log...'}])
}

module.exports = {
  event_describe: describe,
  event_logs: logs
}
