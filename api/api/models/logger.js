const Logger = require('bunyan')
const logger = new Logger({ name: 'lineup', level: 'info' })
if (process.env.NODE_ENV === 'unit') {
  logger.level('warn')
}

module.exports = logger
