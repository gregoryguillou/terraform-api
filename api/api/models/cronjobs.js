const CronJob = require('cron').CronJob
const logger = require('./logger')

let job

const sayHi = () => {
  logger.error('Start logging messages...')
  job = new CronJob(
    '* * * * * *',
    () => {
      logger.error('You will see this message every second')
    },
    null,
    true,
    'Europe/Paris'
  )
}

const isRunning = () => {
  return job.running
}

module.exports = {
  sayHi,
  isRunning
}
