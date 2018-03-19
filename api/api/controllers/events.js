'use strict'
const { showEvent, showLogs } = require('../models/couchbase')

function describe (req, res) {
  var pevent = req.swagger.params.event.value
  showEvent(pevent, (err, data) => {
    if (err) {
      return res.status(500).json({message: 'Exception occured'})
    }
    if (data) {
      let payload = data
      delete payload.type
      return res.json(payload)
    }
    res.status(404).json({message: `Event ${pevent} not found`})
  })
}

function logs (req, res) {
  var pevent = req.swagger.params.event.value
  showLogs(pevent, (err, data) => {
    if (err) {
      return res.status(500).json({message: 'Exception occured'})
    }
    if (data) {
      return res.json(data)
    }
    res.status(404).json({message: `Logs for ${pevent} not found`})
  })
}

module.exports = {
  event_describe: describe,
  event_logs: logs
}
