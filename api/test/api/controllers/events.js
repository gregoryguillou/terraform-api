/* eslint-env mocha */

const should = require('should')
const request = require('supertest')
const server = require('../../../app')
let token = ''

describe('controllers', function () {
  this.timeout(10000)
  describe('events', () => {
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

    describe('GET /events/{event} and GET /events/{event}/logs', () => {
      it('should describe a given event', (done) => {
        request(server)
          .get('/events/1234')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            res.body.should.be.eql({
              id: '1234'
            })
            done()
          }
        )
      })

      it('should list logs for a given event', (done) => {
        request(server)
          .get('/events/1234/logs')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            res.body.should.containEql({
              message: 'This is an awesome log...'
            })
            done()
          }
        )
      })
    })
  })
})
