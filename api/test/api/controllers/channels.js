/* eslint-env mocha */

const should = require('should')
const request = require('supertest')
const server = require('../../../app')
const YAML = require('yamljs')
const apikey = YAML.load('config/settings.yaml').users[0].apikey

let token = ''

describe('channels', function () {
  before((done) => {
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

  it('GET /channels to list the default channel', (done) => {
    request(server)
      .get('/channels')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.containEql({
          channels: [
            {name: 'default'}
          ]
        })
        done()
      })
  })

  it('PUT /channels/{channel} creates or update a channel', (done) => {
    request(server)
      .put('/channels/user1')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', token)
      .expect(201)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.containEql({})
        done()
      })
  })

  it('DELETE /channels/{channel} deletes an existing channel', (done) => {
    request(server)
      .del('/channels/user1')
      .set('Content-Type', 'application/json')
      .set('Authorization', token)
      .expect(204)
      .end((err, res) => {
        should.not.exist(err)
        done()
      })
  })
})
