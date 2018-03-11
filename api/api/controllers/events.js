'use strict'

function describe (req, res) {
  var pevent = req.swagger.params.event.value
  res.json({event: pevent})
}

function logs (req, res) {
  // var pevent = req.swagger.params.event.value
  res.json([{message: 'This is an awesome log...'}])
}

module.exports = {
  event_describe: describe,
  event_logs: logs
}
