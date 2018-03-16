/* eslint-env mocha */

const should = require('should')
const { test, actionWorkspace, deleteWorkspace, feedWorkspace } = require('../../../api/models/couchbase')

describe.skip('models', () => {
  describe('couchbase', function () {
    it('Test connectivity to Couchbase', (done) => {
      test((err, data) => {
        should.not.exist(err)
        should(data).containEql({ testdoc: { name: 'Gregory' } })
        done()
      })
    })

    it('Access a non-existing workspace/project combination should fail', (done) => {
      actionWorkspace({project: 'doesnotexist', workspace: 'doesnotexist'}, {action: 'apply'}, (err, data) => {
        should.exist(err)
        done()
      })
    })

    it('Update an empty workspace with an action', (done) => {
      actionWorkspace({project: 'demonstration', workspace: 'qa'}, {action: 'apply'}, (err, data) => {
        should.not.exist(err)
        should(data['ws:demonstration:qa']['request']).containEql({ action: 'apply' })
        done()
      })
    })

    it('End current request on workspace', (done) => {
        // TODO : Change signature
        feedWorkspace({project: 'demonstration', workspace: 'qa'}, {status: 'succeed'}, (err, data) => {
        should.not.exist(err)
        should.not.exist(data['ws:demonstration:qa']['request'])
        should(data['ws:demonstration:qa']['state']).containEql('applied')
        done()
      })
    })

    it('Request an action to an existing workspace', (done) => {
      actionWorkspace({project: 'demonstration', workspace: 'qa'}, {action: 'apply'}, (err, data) => {
        should.not.exist(err)
        should(data['ws:demonstration:qa']['request']).containEql({ action: 'apply' })
        done()
      })
    })

    it('Request a second action to an existing workspace', (done) => {
      actionWorkspace({project: 'demonstration', workspace: 'qa'}, {action: 'apply'}, (err, data) => {
        should.exist(err)
        done()
      })
    })

    it('Delete Workspace after it has been used', (done) => {
      deleteWorkspace({project: 'demonstration', workspace: 'qa'}, (err, data) => {
        should.not.exist(err)
        done()
      })
    })
  })
})
