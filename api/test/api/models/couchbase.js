/* eslint-env mocha */

const should = require('should')
const { test } = require('../../../api/models/couchbase')

describe('models', () => {
  describe('couchbase', function () {
    it('Test connectivity to Couchbase', (done) => {
      test((err, data) => {
        should.not.exist(err)
        should(data).containEql({ testdoc: { name: 'Gregory' } })
        done()
      })
    })
  })
})
