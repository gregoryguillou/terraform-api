/* eslint-env mocha */

const should = require('should')
const request = require('supertest')
const server = require('../../../app')
const { checkEventLogs } = require('../../../api/models/couchbase')
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
      it('Insert event/logs into Couchbase for testing', (done) => {
        checkEventLogs((err, data) => {
          should.not.exist(err)
          done()
        })
      })

      it('Should describe an existing event when it exists', (done) => {
        request(server)
          .get('/events/00000000-0000-0000-0000-000000000000')
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
          })
      })

      it('Should fail with HTTP-404 when event does not exist', (done) => {
        request(server)
          .get('/events/00000000-0000-0000-0000-000000000001')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect(404)
          .end((err, res) => {
            should.not.exist(err)
            done()
          })
      })

      it('should list logs for a given event', (done) => {
        request(server)
          .get('/events/00000000-0000-0000-0000-000000000000/logs')
          .set('Accept', 'application/json')
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err)
            console.log(res.body)
            res.body.should.containEql({
              logs: [
                { line: 1, text: 'output log: line 1' },
                { line: 2, text: 'output log: line 2' }
              ]
            })
            done()
          })
      })
    })
  })
})
