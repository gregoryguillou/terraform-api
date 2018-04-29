/* eslint-env mocha */

const should = require('should')
const request = require('supertest')
const server = require('../../../app')
const YAML = require('yamljs')
const apikey = YAML.load('config/settings.yaml').users[0].apikey

let token = ''

describe('projects', function () {
  this.timeout(10000)

  before(function (done) {
    if (process.env.SKIP === 'TRUE') { this.skip() }
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
          res.body['projects'].should.containEql({
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

  describe('GET /projects/{project}/branches, /projects/{project}/tags and /projects/{project}/workspaces', () => {
    it('should list branches associated with a project', (done) => {
      request(server)
        .get('/projects/demonstration/branches')
        .set('Accept', 'application/json')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          should.not.exist(err)
          res.body['branches'].should.containEql({name: 'master'})
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
          res.body['tags'].should.containEql({name: 'v0.0.1'})
          res.body['tags'].should.containEql({name: 'v0.0.2'})
          done()
        })
    })

    it('should list workspaces associated with a project', (done) => {
      request(server)
        .get('/projects/demonstration/workspaces')
        .set('Accept', 'application/json')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          should.not.exist(err)
          res.body['workspaces'].should.containEql({name: 'staging'})
          done()
        })
    })
  })

  describe('POST /projects/{project} with {action: "action"}', () => {
    it('should succeed when project exists and action in [reserve, release]', (done) => {
      request(server)
        .post('/projects/demonstration')
        .send({'action': 'reserve'})
        .set('Accept', 'application/json')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          should.not.exist(err)
          done()
        })
    })

    it('should fail with HTTP-400 when project exists and action not in [reserve, release]', (done) => {
      request(server)
        .post('/projects/demonstration')
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

    it('should fail with HTTP-404 when project doesn\'t exist', (done) => {
      request(server)
        .post('/projects/doesnotexist')
        .send({'action': 'reserve'})
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
