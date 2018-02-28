/* eslint-env mocha */
const should = require('should')
const request = require('supertest')
const server = require('../../../app')

describe('controllers', () => {
  describe('auth', () => {
    describe('GET /auth', () => {
      it('should connect to the API with a right API key', (done) => {
        request(server)
          .get('/auth')
          .set('Accept', 'application/json')
          .set('Authorization', 'Key bm9wcXJzdHV2d3h5ego=')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            res.body.should.be.eql({ message: 'Authenticated' })
            done()
          })
      })

      it('should not connect to the API with a wrong API key', (done) => {
        request(server)
          .get('/auth')
          .set('Accept', 'application/json')
          .set('Authorization', 'Key abcd')
          .expect(302)
          .end((err, res) => {
            should.not.exist(err)
            res.header['location'].should.be.equal('/unauthorized')
            done()
          })
      })
    })
  })
})
