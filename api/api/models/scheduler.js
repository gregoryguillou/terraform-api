const redis = require('redis')
const uuid4 = require('uuid/v4')
const client = redis.createClient('redis://redis:6379/')
const cron = require('node-cron')
const logger = require('./logger')
const subscriber = redis.createClient('redis://redis:6379/')
const { channelDelete, channelDescribe } = require('./couchbase')
const { destroy } = require('./docker')

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

const poll = (callback) => {
  client.zrange('tf-zset', 0, 0, 'withscores', (err, data) => {
    if (err) { callback(err, null) }
    if (data && data[1] <= (new Date()).getTime()) {
      client.publish('tf-list', data[0])
      client.zrem('tf-zset', data[0])
      poll(callback)
    }
    callback(null, null)
  })
}

const boot = () => {
  logger.info('Starting Subscriber...')
  subscriber.on('message', (channel, message) => {
    const m = JSON.parse(message)
    logger.info(`Message ${m.uuid}!`)
    if (m.name === 'channelDelete') {
      channelDescribe(m.args[0], m.args[1], (err1, data1) => {
        if (err1) { throw err1 }
        destroy({project: data1.project, workspace: data1.workspace, event: m.uuid}, (err2, data2) => {
          if (err2) { throw err2 }
          channelDelete(m.args[0], m.args[1], (err3, data3) => {
            if (err3) { throw err3 }
          })
        })
      })
    }
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
  execute
}
