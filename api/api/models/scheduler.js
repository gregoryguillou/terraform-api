const redis = require('redis')
const uuid4 = require('uuid/v4')
const client = redis.createClient('redis://redis:6379/')
const cron = require('node-cron')
const logger = require('./logger')
const subscriber = redis.createClient('redis://redis:6379/')

const execute = (name, args, delay = 0, callback) => {
  const uuid = uuid4()
  if (delay > 0) {
    const mytime = (new Date()).getTime()
    client.zadd('tf-zset', mytime + 1000 * delay, JSON.stringify({uuid: uuid, name: name, args: args}), (err, data) => {
      logger.info(`Managing in ${delay}s ${uuid}!`)
      if (err) { callback(err, null) }
      callback(null, uuid)
    })
  } else {
    logger.info(`Managing ${uuid}!`)
    client.publish('tf-list', JSON.stringify({uuid: uuid, name: name, args: args}))
    callback(null, uuid)
  }
}

const executeAt = (name, args, epochMs, callback) => {
  const uuid = uuid4()
  if (epochMs) {
    const mytime = (new Date()).getTime()
    client.zadd('tf-zset', epochMs, JSON.stringify({uuid: uuid, name: name, args: args}), (err, data) => {
      logger.info(`Manage in ${epochMs / 1000 - mytime}s ${uuid}!`)
      if (err) { callback(err, null) }
      callback(null, uuid)
    })
  }
}

const poll = (callback) => {
  client.zrange('tf-zset', 0, 0, 'withscores', (err, data) => {
    if (err) { callback(err, null) }
    if (data && data[1] <= (new Date()).getTime()) {
      client.publish('tf-list', data[0])
      client.zrem('tf-zset', data[0])
      logger.info(`Managing ${JSON.parse(data[0]).uuid}!`)
      poll(callback)
    }
    callback(null, null)
  })
}

const boot = () => {
  logger.info('Starting Subscriber...')
  subscriber.on('message', (channel, message) => {
    logger.info(`Message ${JSON.parse(message).uuid}!`)
  })
  subscriber.subscribe('tf-list')

  logger.info('Starting Scheduler...')
  cron.schedule('* * * * * *', () => {
    poll(() => {
      return ''
    })
  })
}

module.exports = {
  boot,
  execute,
  executeAt
}
