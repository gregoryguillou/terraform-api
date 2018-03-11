/* eslint-env mocha */

const should = require('should')
const { test, updateWorkspace, deleteWorkspace, workspaceEndRequest } = require('../../../api/models/couchbase')

describe('models', () => {
  describe('couchbase', function () {
    it('Test connectivity to Couchbase', (done) => {
      test((err, data) => {
        should.not.exist(err)
        should(data).containEql({ testdoc: { name: 'Gregory' } })
        done()
      })
    })

    it('Access a non-existing workspace/project combination should fail', (done) => {
      updateWorkspace({project: 'doesnotexist', workspace: 'doesnotexist'}, {action: 'apply'}, (err, data) => {
        should.exist(err)
        done()
      })
    })

    it('Update an empty workspace with an action', (done) => {
      updateWorkspace({project: 'demonstration', workspace: 'qa'}, {action: 'apply'}, (err, data) => {
        should.not.exist(err)
        should(data['ws:demonstration:qa']['request']).containEql({ action: 'apply' })
        done()
      })
    })

    it('End current request on workspace', (done) => {
      workspaceEndRequest({project: 'demonstration', workspace: 'qa'}, 'Applied', (err, data) => {
        should.not.exist(err)
        should.not.exist(data['ws:demonstration:qa']['request'])
        should(data['ws:demonstration:qa']['state']).containEql('Applied')
        done()
      })
    })

    it('Request an action to an existing workspace', (done) => {
      updateWorkspace({project: 'demonstration', workspace: 'qa'}, {action: 'apply'}, (err, data) => {
        should.not.exist(err)
        should(data['ws:demonstration:qa']['request']).containEql({ action: 'apply' })
        done()
      })
    })

    it('Request a second action to an existing workspace', (done) => {
      updateWorkspace({project: 'demonstration', workspace: 'qa'}, {action: 'apply'}, (err, data) => {
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
