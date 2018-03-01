/* eslint-env mocha */

const should = require('should')
const request = require('supertest')
const server = require('../../../app')
let token = ''

describe('controllers', () => {
  describe('authentication', () => {
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

    describe('GET /login', () => {
      it('should connect to the API with a right API key', (done) => {
        request(server)
          .get('/login')
          .set('Accept', 'application/json')
          .set('Authorization', 'Key bm9wcXJzdHV2d3h5ego=')
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
})
