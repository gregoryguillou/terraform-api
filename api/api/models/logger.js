const Logger = require('bunyan')
const log = new Logger({ name: 'lineup', level: 'info' })
if (process.env.NODE_ENV === 'unit') {
  log.level('warn')
}

module.exports = log
