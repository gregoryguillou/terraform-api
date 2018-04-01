const process = require('process')
const Logger = require('bunyan')
const level = process.env.BUNYAN_LOG_LEVEL || 'info'
const logger = new Logger({ level, name: 'terraform-api' })

module.exports = logger
