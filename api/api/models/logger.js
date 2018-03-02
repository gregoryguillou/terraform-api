const Logger = require('bunyan')
const log = new Logger({ name: 'lineup', level: 'warn' })

module.exports = log
