'use strict'
const { showEvent, showLogs } = require('../models/couchbase')

function describe (req, res) {
  var pevent = req.swagger.params.event.value
  showEvent(pevent, (err, data) => {
    let payload = data
    if (err) {
      res.status(500).json({message: 'Exception occured'})
    } else if (data) {
      delete payload.type
      res.json(payload)
    } else {
      res.status(404).json({message: `Event ${pevent} not found`})
    }
  })
}

function logs (req, res) {
  var pevent = req.swagger.params.event.value
  showLogs(pevent, (err, data) => {
    if (err) {
      res.status(500).json({message: 'Exception occured'})
    } else if (data) {
      res.json(data)
    } else {
      res.status(404).json({message: `Logs for ${pevent} not found`})
    }
  })
}

module.exports = {
  event_describe: describe,
  event_logs: logs
}
