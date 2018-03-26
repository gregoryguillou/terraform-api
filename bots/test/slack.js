/* eslint-env mocha */

const should = require('should')
const request = require('supertest')
const YAML = require('yamljs')
const bot = YAML.load('config/settings.yaml').bots[0]

const server = require('../app')

describe('Slack Bot', function () {
  this.timeout(10000)
  describe('Challenge tests', () => {
    it('Report the applicaton status', (done) => {
      request(server)
        .get('/status')
        .expect(200)
        .end((err, res) => {
          should.not.exist(err)
          res.body.should.containEql({status: 'OK'})
          done()
        })
    })

    it('Send a challenge to the Slack Bot', (done) => {
      request(server)
        .post(`/slack/${bot.name}`)
        .send({token: bot.slack.app_token, challenge: 'abcd'})
        .set('Accept', 'application/json')
        .expect(200)
        .end((err, res) => {
          should.not.exist(err)
          should.exist(res.body.challenge)
          res.body.should.containEql({challenge: 'abcd'})
          done()
        })
    })

    it('Send a challenge with a wrong token should return 401', (done) => {
      request(server)
        .post(`/slack/${bot.name}`)
        .send({token: 'abcd', challenge: 'abcd'})
        .set('Accept', 'application/json')
        .expect(401)
        .end((err, res) => {
          should.exist(err)
          done()
        })
    })

    after((done) => {
      server.close()
      done()
    })
  })
})
