/* eslint-env mocha */

const fs = require('fs')
const should = require('should')
const { getTags, getBranches } = require('../../../api/models/git')

describe('models', () => {
  describe('git', () => {
    it('Check git clone/fetch has worked as expected', (done) => {
      var stats = fs.statSync('/tmp/demonstration')
      should(stats.isDirectory()).be.eql(true)
      done()
    }
  )

    it('Check tags exists and can be accessed', (done) => {
      getTags(
        {name: 'demonstration'},
        (tags) => {
          tags.should.containEql('v0.0.1')
          done()
        }
      )
    })

    it('Check branches exists and can be accessed', (done) => {
      getBranches(
        {name: 'demonstration'},
        (branches) => {
          branches.should.containEql('master')
          done()
        }
      )
    })
  })
})
