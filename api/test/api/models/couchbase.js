/* eslint-env mocha */

const should = require('should')
const { test, workspacePost, workspaceDelete, workspaceEndRequest } = require('../../../api/models/couchbase')

describe('models', () => {
  describe('couchbase', function () {
    it('Test connectivity to Couchbase', (done) => {
      test((err, data) => {
        should.not.exist(err)
        should(data).containEql({ testdoc: { name: 'Gregory' } })
        done()
      })
    })

    it('Update an empty workspace with an action', (done) => {
      workspacePost({project: 'demonstration', workspace: 'qa'}, {action: 'apply'}, (err, data) => {
        should.not.exist(err)
        should(data['ws:demonstration:qa']['request']).containEql({ action: 'apply' })
        done()
      })
    })

    it('End current request on workspace', (done) => {
      workspaceEndRequest({project: 'demonstration', workspace: 'qa'}, (err, data) => {
        should.not.exist(err)
        should.not.exist(data['ws:demonstration:qa']['request'])
        done()
      })
    })

    it('Request an action to an existing workspace', (done) => {
      workspacePost({project: 'demonstration', workspace: 'qa'}, {action: 'apply'}, (err, data) => {
        should.not.exist(err)
        console.log(data)
        should(data['ws:demonstration:qa']['request']).containEql({ action: 'apply' })
        done()
      })
    })

    it('Delete Workspace after it has been used', (done) => {
      workspaceDelete({project: 'demonstration', workspace: 'qa'}, (err, data) => {
        should.not.exist(err)
        done()
      })
    })
  })
})
