const process = require('process')
const Logger = require('bunyan')
var level = process.env.BUNYAN_LOG_LEVEL || 'info';
const logger = new Logger({ name: 'deck', level: level })

module.exports = logger
