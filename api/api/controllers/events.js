'use strict'
const { showEvent } = require('../models/couchbase')

function describe (req, res) {
  var pevent = req.swagger.params.event.value
  showEvent(pevent, (err, data) => {
    let payload = data
    if (err) {
      res.status(500).json({"message": "Exception occured"})
    } else if (data) {
      delete payload.type
      res.json(payload)
    } else {
      res.status(404).json({"message": `Event ${pevent} not found`})
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
