/* eslint-env mocha */

const should = require('should')
const { version } = require('../../../api/models/docker')
const devnull = require('dev-null')

describe('models', () => {
  describe('docker', function () {
    this.timeout(10000)
    it('Make sure the docker lineup container can display a version', (done) => {
      version(devnull(), (err, data) => {
        if (!err) {
          should(data).containEql({ StatusCode: 0 })
          done()
        }
      })
    })
  })
})
