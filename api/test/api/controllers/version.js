/* eslint-env mocha */

const should = require('should')
const request = require('supertest')
const server = require('../../../app')
const fs = require('fs');
let token = ''

describe('version', function () {
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

  describe('GET /version', () => {
    it('should match the version from package.json', (done) => {
      request(server)
        .get('/version')
        .set('Accept', 'application/json')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          const obj = JSON.parse(fs.readFileSync('package.json', 'utf8'))
          version = obj['version']
          should.not.exist(err)
          res.body.should.containEql({version: version})
          done()
        })
    })

    it('should only work with authentication', (done) => {
      request(server)
        .get('/version')
        .set('Accept', 'application/json')
        .expect(401)
        .end((err, res) => {
          should.not.exist(err)
          done()
        })
    })
  })
})
