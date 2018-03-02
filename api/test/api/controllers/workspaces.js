/* eslint-env mocha */

const should = require('should')
const request = require('supertest')
const server = require('../../../app')
let token = ''

describe('controllers', function () {
  this.timeout(10000)
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
              name: 'staging',
              status: 'stopped'
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

    describe('POST /projects/{project}/workspaces/{workspace} with {action: "action"}', () => {
      it('should succeed when project/workspace exists and action in [apply, destroy]', (done) => {
        request(server)
          .post('/projects/demonstration/workspaces/staging')
          .send({'action': 'apply'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(201)
          .end((err, res) => {
            should.not.exist(err)
            done()
          })
      })

      it('should fail with HTTP-400 when project/workspace exists and action not in [apply, destroy]', (done) => {
        request(server)
          .post('/projects/demonstration/workspaces/staging')
          .send({'action': 'doesnotexist'})
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect('Content-Type', /json/)
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
  })
})
