/* eslint-env mocha */

const should = require('should')
const request = require('supertest')
const server = require('../../../app')
const { workspaceEndRequest } = require('../../../api/models/couchbase')
let token = ''

let i = 0

function queryWorkspace (callback) {
  setTimeout(function () {
    i++
    if (i < 15) {
      request(server)
      .get('/projects/demonstration/workspaces/staging')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        if (res.body['request']) {
          queryWorkspace(callback)
        } else {
          callback()
          i = 15
        }
      })
    } else {
      should.fail('finish', 'ongoing')
      callback()
    }
  }, 1000)
}

describe('controllers', function () {
  this.timeout(20000)
  describe('workspace', () => {
    before((done) => {
      request(server)
      .get('/login')
      .set('Accept', 'application/json')
      .set('Authorization', 'Key bm9wcXJzdHV2d3h5ego=')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        token = 'Bearer ' + res.body['token']
        res.body.should.containEql({message: 'Authenticated'})
        done()
      })
    })

    describe('GET /projects/{project}/workspaces/{workspace}', () => {
      it('should describe the detail of a given workspace', (done) => {
        request(server)
          .get('/projects/demonstration/workspaces/staging')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            res.body.should.containEql({
              project: 'demonstration',
              workspace: 'staging'
            })
            done()
          })
      })

      it('should fail with 404 in case of a query to an non-existing workspace', (done) => {
        request(server)
          .get('/projects/demonstration/workspace/doesnotexist')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(404)
          .end((err, res) => {
            should.not.exist(err)
            done()
          })
      })

      it('should fail with 404 in case of a query to an non-existing project', (done) => {
        request(server)
          .get('/projects/doesnotexist/workspace/staging')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(404)
          .end((err, res) => {
            should.not.exist(err)
            done()
          })
      })
    })

    describe('GET /projects/{project}/workspaces/{workspace}/events', () => {
      it('should list events associated with a project', (done) => {
        request(server)
          .get('/projects/demonstration/workspaces/staging/events')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            res.body.should.containEql({
              description: 'The environment has been registered',
              reference: '/projects/demonstration/workspace/staging',
              time: '1970-01-01 00:00:00'
            })
            done()
          })
      })
    })

    describe('POST /projects/{project}/workspaces/{workspace} with {action: "apply"}', () => {
      it('Remove pending action on demonstration/staging', (done) => {
        workspaceEndRequest({project: 'demonstration', workspace: 'staging'}, 'applied', (err, data) => {
          should.not.exist(err)
          should.not.exist(data['ws:demonstration:staging']['request'])
          done()
        })
      })

      it('should succeed HTTP-201 when project/workspace exists, action is apply and no pending action', (done) => {
        request(server)
          .post('/projects/demonstration/workspaces/staging')
          .send({'action': 'apply'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(201)
          .end((err, res) => {
            should.not.exist(err)
            should.exist(res.body.event)
            done()
          })
      })

      it('Wait up to 15s before the creation is considered failed', (done) => {
        queryWorkspace(() => {
          done()
        })
      })

      it('should succeed HTTP-201 when project/workspace exists, action is apply and no pending action', (done) => {
        request(server)
          .post('/projects/demonstration/workspaces/staging')
          .send({'action': 'apply'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(201)
          .end((err, res) => {
            should.not.exist(err)
            should.exist(res.body.event)
            done()
          })
      })

      it('should fail HTTP-409 when project/workspace exists, action in apply and pending action', (done) => {
        request(server)
          .post('/projects/demonstration/workspaces/staging')
          .send({'action': 'apply'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(409)
          .end((err, res) => {
            should.not.exist(err)
            done()
          })
      })

      it('Wait up to 15s before the creation is considered failed', (done) => {
        i = 0
        queryWorkspace(() => {
          done()
        })
      })

      it('should fail with HTTP-400 when project/workspace exists and action not in [apply, destroy]', (done) => {
        request(server)
          .post('/projects/demonstration/workspaces/staging')
          .send({'action': 'doesnotexist'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(400)
          .end((err, res) => {
            should.not.exist(err)
            done()
          })
      })

      it('should fail with HTTP-404 when project/workspace doesn\'t exist', (done) => {
        request(server)
          .post('/projects/doesnotexist/workspaces/staging')
          .send({'action': 'apply'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(404)
          .end((err, res) => {
            should.not.exist(err)
            done()
          })
      })

      it.skip('should succeed HTTP-201 when project/workspace exists, action is apply, no pending action and tag', (done) => {
        request(server)
          .post('/projects/demonstration/workspaces/staging')
          .send({'action': 'apply', 'ref': 'tag:v0.0.1'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(201)
          .end((err, res) => {
            should.not.exist(err)
            should.exist(res.body.event)
            done()
          })
      })

      it.skip('Wait up to 15s before the creation is considered failed', (done) => {
        queryWorkspace(() => {
          done()
        })
      })

    })

    describe('POST /projects/{project}/workspaces/{workspace} with {action: "destroy"}', () => {
      it('should succeed HTTP-201 when project/workspace exists, action in [apply, destroy] and no pending action', (done) => {
        request(server)
          .post('/projects/demonstration/workspaces/staging')
          .send({'action': 'destroy'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(201)
          .end((err, res) => {
            should.not.exist(err)
            should.exist(res.body.event)
            done()
          })
      })

      it('Wait up to 15s before the destruction is considered failed', (done) => {
        i = 0
        queryWorkspace(() => {
          done()
        })
      })

      it('should succeed HTTP-201 when project/workspace exists, action in [apply, destroy] and no pending action', (done) => {
        request(server)
          .post('/projects/demonstration/workspaces/staging')
          .send({'action': 'destroy'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(201)
          .end((err, res) => {
            should.not.exist(err)
            should.exist(res.body.event)
            done()
          })
      })

      it('should fail HTTP-409 when project/workspace exists, action in [apply, destroy] and pending action', (done) => {
        request(server)
          .post('/projects/demonstration/workspaces/staging')
          .send({'action': 'apply'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(409)
          .end((err, res) => {
            should.not.exist(err)
            done()
          })
      })

      it('Wait up to 15s before the destruction is considered failed', (done) => {
        i = 0
        queryWorkspace(() => {
          done()
        })
      })
    })

    describe('GET /projects/{project}/workspaces/{workspace}/status', () => {
      it('should succeed HTTP-404 when project/workspace exists and is not running', (done) => {
        request(server)
          .get('/projects/demonstration/workspaces/staging/status')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(404)
          .end((err, res) => {
            should.not.exist(err)
            done()
          })
      })

      it('should fail HTTP-409 when project/workspace exists, action is apply and no pending action', (done) => {
        request(server)
          .post('/projects/demonstration/workspaces/staging')
          .send({'action': 'apply'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(201)
          .end((err, res) => {
            should.not.exist(err)
            done()
          })
      })

      it('Wait up to 15s before the creation is considered failed', (done) => {
        i = 0
        queryWorkspace(() => {
          done()
        })
      })

      it('should succeed HTTP-200 when project/workspace exists and is running', (done) => {
        request(server)
          .get('/projects/demonstration/workspaces/staging/status')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            done()
          })
      })

    })
  })
})
