'use strict'

function describe (req, res) {
  const session = req.swagger.params.session.value
  if (session === '00000000-0000-0000-0000-000000000000') {
    const p = {
      project: 'demonstration',
      workspace: 'default',
      id: session
    }
    return res.json(p)
  }
  return res.status(404).json({message: `Session ${session} not found`})
}

function list (req, res) {
  res.json({sessions: [{id: '00000000-0000-0000-0000-000000000000'}]})
}

module.exports = {
  session_describe: describe,
  sessions_list: list
}
