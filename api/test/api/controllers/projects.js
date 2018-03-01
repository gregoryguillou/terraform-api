/* eslint-env mocha */

const should = require('should')
const request = require('supertest')
const server = require('../../../app')
let token = ''

describe('controllers', () => {
  describe('projects', () => {
    before(() => {
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
        })
    })

    describe('GET /projects and GET /projects/{project}', () => {
      it('should list all the projects and include one with {name: "demonstration"...', (done) => {
        request(server)
          .get('/projects')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            res.body.should.containEql({
              type: 'terraform',
              name: 'demonstration',
              description: 'A demonstration project that relies on Terraform/Consul'
            })
            done()
          })
      })

      it('should describe the detail of the demonstration project', (done) => {
        request(server)
          .get('/projects/demonstration')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            res.body.should.containEql({
              type: 'terraform',
              name: 'demonstration',
              description: 'A demonstration project that relies on Terraform/Consul'
            })
            done()
          })
      })

      it('should fail with 404 in case of a query to an non-existing project', (done) => {
        request(server)
          .get('/projects/doesnotexit')
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
