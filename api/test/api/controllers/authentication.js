/* eslint-env mocha */

const should = require('should')
const request = require('supertest')
const server = require('../../../app')
const scheduler = require('../../../api/models/scheduler')
const YAML = require('yamljs')
const apikey = YAML.load('config/settings.yaml').users[0].apikey
let token = ''

describe('authentication', function () {
  this.timeout(60000)

  before((done) => {
    scheduler.boot()
    server.on('apiStarted', () => {
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
  })

  describe('GET /login', () => {
    it('should connect to the API with a right API key', (done) => {
      request(server)
        .get('/login')
        .set('Accept', 'application/json')
        .set('Authorization', `Key ${apikey}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          should.not.exist(err)
          res.body.should.containEql({message: 'Authenticated'})
          done()
        })
    })

    it('should not connect to the API with a wrong API key and get HTTP-401', (done) => {
      request(server)
        .get('/login')
        .set('Accept', 'application/json')
        .set('Authorization', 'Key abcd')
        .expect(401)
        .end((err, res) => {
          should.not.exist(err)
          done()
        })
    })
  })

  describe('GET /user', () => {
    it('should connect to the API with a JWT token and get {username: "gregory"}', (done) => {
      request(server)
        .get('/user')
        .set('Accept', 'application/json')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          should.not.exist(err)
          res.body.should.containEql({username: 'gregory'})
          done()
        })
    })

    it('should connect to the API with a wrong JWT token and get HTTP-401', (done) => {
      request(server)
        .get('/user')
        .set('Accept', 'application/json')
        .set('Authorization', 'abc')
        .expect(401)
        .end((err, res) => {
          should.not.exist(err)
          done()
        })
    })
  })
})
