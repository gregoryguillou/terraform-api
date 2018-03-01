/* eslint-env mocha */

const fs = require('fs')
const should = require('should')

describe('models', () => {
  describe('git', () => {
    it('Check git clone/fetch has worked as expected', (done) => {
      var stats = fs.statSync('/tmp/demonstration')
      should(stats.isDirectory()).be.eql(true)
      done()
    })
  })
})
