/* eslint-env mocha */

const should = require('should')
const request = require('supertest')
const server = require('../../../app')
const { feedWorkspace } = require('../../../api/models/couchbase')
const YAML = require('yamljs')
const apikey = YAML.load('config/settings.yaml').users[0].apikey

let token = ''

let i = 0

function queryWorkspace (callback) {
  setTimeout(function () {
    i++
    if (i < 60) {
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
            i = 60
          }
        })
    } else {
      should.fail('finish', 'ongoing')
      callback()
    }
  }, 1000)
}

describe('controllers', function () {
  describe('JSON Web Token', () => {
    it('GET /projects/{project} should return 401 when unauthenticated', (done) => {
      request(server)
        .get('/projects/demonstration')
        .set('Accept', 'application/json')
        .expect(401)
        .end((err, res) => {
          should.not.exist(err)
          done()
        })
    })

    it('GET /events should return 401 when unauthenticated', (done) => {
      request(server)
        .get('/events')
        .set('Accept', 'application/json')
        .expect(401)
        .end((err, res) => {
          should.not.exist(err)
          done()
        })
    })

    it('GET /version should return 401 when unauthenticated', (done) => {
      request(server)
        .get('/version')
        .set('Accept', 'application/json')
        .expect(401)
        .end((err, res) => {
          should.not.exist(err)
          done()
        })
    })
  })
})

describe('controllers', function () {
  this.timeout(90000)
  describe('workspace', () => {
    before((done) => {
      request(server)
        .get('/login')
        .set('Accept', 'application/json')
        .set('Authorization', `Key ${apikey}`)
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
      before((done) => {
        request(server)
          .get('/login')
          .set('Accept', 'application/json')
          .set('Authorization', `Key ${apikey}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            token = 'Bearer ' + res.body['token']
            res.body.should.containEql({message: 'Authenticated'})
            done()
          })
      })

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
              workspace: 'staging',
              channels: {
                duration: 'request',
                managementType: 'shared'
              }
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

    describe('POST /projects/{project}/workspaces/{workspace} with {status: "clean"}', () => {
      before((done) => {
        request(server)
          .get('/login')
          .set('Accept', 'application/json')
          .set('Authorization', `Key ${apikey}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            token = 'Bearer ' + res.body['token']
            res.body.should.containEql({message: 'Authenticated'})
            done()
          })
      })

      it('Remove pending action on demonstration/staging', (done) => {
        feedWorkspace({project: 'demonstration', workspace: 'staging'}, {status: 'clean'}, (err, data) => {
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

      it('Wait up to 60s before the creation is considered failed', (done) => {
        i = 0
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

      it('Wait up to 60s before the creation is considered failed', (done) => {
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
    })

    describe('POST /projects/{project}/workspaces/{workspace} with {action: "apply"} and different tags', () => {
      before((done) => {
        request(server)
          .get('/login')
          .set('Accept', 'application/json')
          .set('Authorization', `Key ${apikey}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            token = 'Bearer ' + res.body['token']
            res.body.should.containEql({message: 'Authenticated'})
            done()
          })
      })

      it('should succeed HTTP-201 when project/workspace exists, action is apply with tag v0.0.2', (done) => {
        request(server)
          .post('/projects/demonstration/workspaces/staging')
          .send({'action': 'apply', 'ref': 'tag:v0.0.2'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(201)
          .end((err, res) => {
            should.not.exist(err)
            should.exist(res.body.event)
            done()
          })
      })

      it('Wait up to 60s before the creation is considered failed', (done) => {
        i = 0
        queryWorkspace(() => {
          done()
        })
      })

      it('Should display the v0.0.2 with the version.sh script', (done) => {
        request(server)
          .get('/projects/demonstration/workspaces/staging/version')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(200)
          .end((err, res) => {
            res.body.should.containEql({ appVersion: 'v0.0.2', state: 'applied' })
            should.not.exist(err)
            done()
          })
      })

      it('Wait up to 5s to let people verify the stack status', (done) => {
        setTimeout(() => {
          done()
        },
        5000
        )
      })

      it('should succeed HTTP-201 when project/workspace exists, action is apply with tag v0.0.3', (done) => {
        request(server)
          .post('/projects/demonstration/workspaces/staging')
          .send({'action': 'apply', 'ref': 'tag:v0.0.3'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(201)
          .end((err, res) => {
            should.not.exist(err)
            should.exist(res.body.event)
            done()
          })
      })

      it('Wait up to 60s before the creation is considered failed', (done) => {
        i = 0
        queryWorkspace(() => {
          done()
        })
      })

      it('Should display the v0.0.3 with the version.sh script', (done) => {
        request(server)
          .get('/projects/demonstration/workspaces/staging/version')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(200)
          .end((err, res) => {
            res.body.should.containEql({ appVersion: 'v0.0.3', state: 'applied' })
            should.not.exist(err)
            done()
          })
      })

      it('should succeed HTTP-201 when project/workspace exists, action is apply with branch master', (done) => {
        request(server)
          .post('/projects/demonstration/workspaces/staging')
          .send({'action': 'apply', 'ref': 'branch:master'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(201)
          .end((err, res) => {
            should.not.exist(err)
            should.exist(res.body.event)
            done()
          })
      })

      it('Wait up to 60s before the creation is considered failed', (done) => {
        i = 0
        queryWorkspace(() => {
          done()
        })
      })

      it('should succeed HTTP-201 when project/workspace exists, action is apply with non-existing branch', (done) => {
        request(server)
          .post('/projects/demonstration/workspaces/staging')
          .send({'action': 'apply', 'ref': 'branch:doesnotexist'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(201)
          .end((err, res) => {
            should.not.exist(err)
            should.exist(res.body.event)
            done()
          })
      })

      it('Wait up to 60s before the creation is considered failed', (done) => {
        i = 0
        queryWorkspace(() => {
          done()
        })
      })
    })

    describe('POST /projects/{project}/workspaces/{workspace} with {action: "update", ref: "tag:v0.0.1"} and different tags', () => {
      before((done) => {
        request(server)
          .get('/login')
          .set('Accept', 'application/json')
          .set('Authorization', `Key ${apikey}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            token = 'Bearer ' + res.body['token']
            res.body.should.containEql({message: 'Authenticated'})
            done()
          })
      })

      it('should succeed HTTP-201 when project/workspace exists, action is apply with tag v0.0.1', (done) => {
        request(server)
          .post('/projects/demonstration/workspaces/staging')
          .send({'action': 'update', 'ref': 'tag:v0.0.1'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(201)
          .end((err, res) => {
            should.not.exist(err)
            should.exist(res.body.event)
            done()
          })
      })

      it('Wait up to 60s before the creation is considered failed', (done) => {
        i = 0
        queryWorkspace(() => {
          done()
        })
      })

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
              workspace: 'staging',
              ref: 'tag:v0.0.1'
            })
            done()
          })
      })

      it('should succeed HTTP-201 when project/workspace exists, action is apply with branch master', (done) => {
        request(server)
          .post('/projects/demonstration/workspaces/staging')
          .send({'action': 'update', 'ref': 'branch:master'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(201)
          .end((err, res) => {
            should.not.exist(err)
            should.exist(res.body.event)
            done()
          })
      })

      it('Wait up to 60s before the creation is considered failed', (done) => {
        i = 0
        queryWorkspace(() => {
          done()
        })
      })

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
              workspace: 'staging',
              ref: 'branch:master'
            })
            done()
          })
      })
    })

    describe('POST /projects/{project}/workspaces/{workspace} with {action: "destroy"}', () => {
      before((done) => {
        request(server)
          .get('/login')
          .set('Accept', 'application/json')
          .set('Authorization', `Key ${apikey}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            token = 'Bearer ' + res.body['token']
            res.body.should.containEql({message: 'Authenticated'})
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

      it('Wait up to 60s before the destruction is considered failed', (done) => {
        i = 0
        queryWorkspace(() => {
          done()
        })
      })

      it('Should display undefined with the version.sh script', (done) => {
        request(server)
          .get('/projects/demonstration/workspaces/staging/version')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(404)
          .end((err, res) => {
            res.body.should.containEql({ appVersion: 'undefined', state: 'destroyed' })
            should.not.exist(err)
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

      it('Wait up to 60s before the destruction is considered failed', (done) => {
        i = 0
        queryWorkspace(() => {
          done()
        })
      })
    })

    describe('GET /projects/{project}/workspaces/{workspace}/status', () => {
      before((done) => {
        request(server)
          .get('/login')
          .set('Accept', 'application/json')
          .set('Authorization', `Key ${apikey}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            token = 'Bearer ' + res.body['token']
            res.body.should.containEql({message: 'Authenticated'})
            done()
          })
      })

      it('should succeed HTTP-404 when project/workspace exists and is not running', (done) => {
        request(server)
          .get('/projects/demonstration/workspaces/staging/status')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(404)
          .end((err, res) => {
            res.body.should.containEql({ quickCheck: 'failure', state: 'destroyed' })
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

      it('Wait up to 60s before the creation is considered failed', (done) => {
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
            res.body.should.containEql({ quickCheck: 'success', state: 'applied' })
            should.not.exist(err)
            done()
          })
      })
    })
  })
})
