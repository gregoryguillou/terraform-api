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

    describe('GET /projects/{project}/branches, /projects/{project}/events and /projects/{project}/tags', () => {
      it('should list branches associated with a project', (done) => {
        request(server)
          .get('/projects/demonstration/branches')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            res.body.should.containEql({
              name: 'master'
            })
            done()
          })
      })
      it('should list events associated with a project', (done) => {
        request(server)
          .get('/projects/demonstration/events')
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
      it('should list tags associated with a project', (done) => {
        request(server)
          .get('/projects/demonstration/tags')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            res.body.should.containEql({
              name: 'v0.0.1'
            })
            done()
          })
      })
    })
  })
})
