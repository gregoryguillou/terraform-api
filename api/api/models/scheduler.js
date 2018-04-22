const redis = require('redis')
const uuid = require('uuid/v4')
const logger = require('./logger')

const manageMessage = () => {
  const subClient = redis.createClient({url: 'redis://redis:6379'})
  subClient.on('pmessage', function (pattern, channel, message) {
    console.log(`message is actually: ${message}`)
  })
  subClient.psubscribe('tfapi-notify')
}

const subscribeDelayedMessage = () => {
  const delayingClient = redis.createClient({url: 'redis://redis:6379'})

  delayingClient.on('pmessage', function (pattern, channel, expiredKey) {
    if (expiredKey.match(/^tfapi-timer:/)) {
      const messageKey = expiredKey.replace(/^tfapi-timer:/, 'tfapi-message:')
      const messageClient = redis.createClient({url: 'redis://redis:6379'})
      messageClient.get(messageKey, (err1, res1) => {
        if (err1) { throw err1 }
        messageClient.publish('tfapi-notify', res1, (err2, res2) => {
          if (err2) { throw err2 }
          messageClient.del(messageKey, (err3, res3) => {
            if (err3) { throw err3 }
            messageClient.quit()
          })
        })
      })
    } else {
      logger.warn(`${expiredKey} has expired... ignore`)
    }
  })
  delayingClient.config('SET', 'notify-keyspace-events', 'Ex')
  delayingClient.psubscribe('__keyevent@0__:expired')
}

const sendMessageWithDelay = (message, timeSecs) => {
  const key = uuid()
  const schedQueueClient = redis.createClient({url: 'redis://redis:6379'})
  schedQueueClient.set(`tfapi-message:${key}`, JSON.stringify(message), (err1, res1) => {
    if (err1) { throw err1 }
    schedQueueClient.set(`tfapi-timer:${key}`, '', 'EX', timeSecs, (err2, res2) => {
      if (err2) { throw err2 }
      schedQueueClient.quit((err3, res3) => {
        if (err3) { throw err3 }
      })
    })
  })
}

const sendMessageNoDelay = (message) => {
  const messageClient = redis.createClient({url: 'redis://redis:6379'})
  messageClient.publish('tfapi-notify', JSON.stringify(message), (err, res) => {
    if (err) { throw err }
  })
}

module.exports = {
  manageMessage,
  sendMessageNoDelay,
  sendMessageWithDelay,
  subscribeDelayedMessage
}
