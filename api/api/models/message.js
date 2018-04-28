const redis = require('redis')
const uuid4 = require('uuid/v4')
const client = redis.createClient('redis://redis:6379/')

const executeAt = (name, args, epochMs, callback) => {
  const uuid = uuid4()
  if (epochMs) {
    client.zadd('tf-zset', epochMs, JSON.stringify({uuid: uuid, name: name, args: args}), (err, data) => {
      if (err) { callback(err, null) }
      callback(null, uuid)
    })
  }
}

module.exports = {
  executeAt
}
