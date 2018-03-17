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
      it('Should describe an existing event when it exists', (done) => {
        request(server)
          .get('/events/0c26b2b3-af6f-4dac-a1af-42c7498c120c')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            res.body.should.containEql({
              workspace: 'staging'
            })
            done()
          }
        )
      })

      it('Should fail with HTTP-404 when event does not exist', (done) => {
        request(server)
          .get('/events/0c26b2b3-af6f-4dac-a1af-42c7498c120d')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(404)
          .end((err, res) => {
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
