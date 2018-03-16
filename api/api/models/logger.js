const process = require('process')
const Logger = require('bunyan')
var level = process.env.BUNYAN_LOG_LEVEL || 'info';
const logger = new Logger({ name: 'lineup', level: level })

module.exports = logger
