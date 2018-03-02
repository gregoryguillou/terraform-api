'use strict'

function describe (req, res) {
  var pevent = req.swagger.params.event.value
  res.status(200).json({id: pevent})
}

function logs (req, res) {
  // var pevent = req.swagger.params.event.value
  res.status(200).json([{message: 'This is an awesome log...'}])
}

module.exports = {
  event_describe: describe,
  event_logs: logs
}
