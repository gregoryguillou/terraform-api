/* eslint-env mocha */

const consulIp = require('../../../api/models/consul')

describe('models', () => {
  describe('Consul', () => {
    it('Checkout Consul Container assuming it is running', (done) => {
      consulIp(done)
    })
  })
})
