/* eslint-env mocha */

const should = require('should')
const request = require('supertest')
const server = require('../../../app')
const YAML = require('yamljs')
const apikey = YAML.load('config/settings.yaml').users[0].apikey
const { backgroundAdd } = require('../../../api/controllers/messages')

let token = ''

describe('messages', function () {
  this.timeout(10000)
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

  it('GET /messages list empty message list', (done) => {
    request(server)
      .get('/messages')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.containEql({ messages: [] })
        done()
      })
  })

  let messageId = ''

  it('Write a message down to Couchbase', (done) => {
    backgroundAdd('channels:1/channel1', 'You rock channel1', (err, data) => {
      if (err) { throw err }
      messageId = data.id
      data.should.containEql({
        channel: 'channel1',
        text: 'You rock channel1'
      })
      done()
    })
  })

  it('DELETE /messages/{message} for messageId', (done) => {
    request(server)
      .del(`/messages/${messageId}`)
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect(204)
      .end((err, res) => {
        should.not.exist(err)
        done()
      })
  })

  it('GET /messages list empty message list', (done) => {
    request(server)
      .get('/messages')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.containEql({ messages: [] })
        done()
      })
  })
})
