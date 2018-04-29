/* eslint-env mocha */

const should = require('should')
const request = require('supertest')
const server = require('../../../app')
const YAML = require('yamljs')
const apikey = YAML.load('config/settings.yaml').users[0].apikey

let token = ''

let i = 0

function queryWorkspace4DeletedChannel (callback) {
  setTimeout(function () {
    i++
    if (i < 1) {
      queryWorkspace4DeletedChannel(callback)
    } else if (i < 60) {
      request(server)
        .get('/projects/demonstration/workspaces/staging')
        .set('Accept', 'application/json')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          should.not.exist(err)
          if (res.body['channels'] && res.body['channels'].leaders && res.body['channels'].leaders.length > 0) {
            queryWorkspace4DeletedChannel(callback)
          } else {
            i = 0
            return callback()
          }
        })
    } else {
      should.fail('finish', 'channels')
      callback()
    }
  }, 1000)
}

describe('channels', function () {
  this.timeout(90000)
  before(function (done) {
    if (process.env.SKIP === 'TRUE') { this.skip() }
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

  it('GET /channels/default to describe the default channel', (done) => {
    request(server)
      .get('/channels/default')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
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

  it('GET /channels to all channels', (done) => {
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
            {name: 'default'},
            {name: 'user1'}
          ]
        })
        done()
      })
  })

  it('GET /channels/{channel} to describe an existing channel', (done) => {
    request(server)
      .get('/channels/user1')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        done()
      })
  })

  it('GET /channels/{channel} to describe an non-existing channel', (done) => {
    request(server)
      .get('/channels/user2')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(404)
      .end((err, res) => {
        should.not.exist(err)
        done()
      })
  })

  it('PUT /channels/{channel} to update a channel with project/workspace', (done) => {
    request(server)
      .put('/channels/user1')
      .send({
        project: 'demonstration',
        workspace: 'staging'
      })
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

  it('GET /channels/{channel} to describe a channel with a project/workspace', (done) => {
    request(server)
      .get('/channels/user1')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.containEql({
          project: 'demonstration',
          workspace: 'staging'
        })
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

  it('DELETE /channels/default deletes the default channel', (done) => {
    request(server)
      .del('/channels/default')
      .set('Content-Type', 'application/json')
      .set('Authorization', token)
      .expect(204)
      .end((err, res) => {
        should.not.exist(err)
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

  it('PUT /channels/{channel} to create a new channel with project/workspace', (done) => {
    request(server)
      .put('/channels/channel1')
      .send({
        project: 'demonstration',
        workspace: 'staging'
      })
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

  it('POST on /projects/{project}/workspaces/{workspaces} to change for lease', (done) => {
    request(server)
      .post('/projects/demonstration/workspaces/staging')
      .send({
        action: 'update',
        channels: {
          duration: 'lease'
        }
      })
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(201)
      .end((err, res) => {
        should.not.exist(err)
        done()
      })
  })

  it('GET on /projects/{project}/workspaces/{workspaces} to review workspace', (done) => {
    request(server)
      .get('/projects/demonstration/workspaces/staging')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.containEql({
          project: 'demonstration',
          workspace: 'staging',
          channels: {
            duration: 'lease'
          }
        })
        done()
      })
  })

  it('PUT /channels/{channel} to update the channel with project/workspace', (done) => {
    const currentDate = (new Date()).getTime()
    request(server)
      .put('/channels/channel1')
      .send({
        project: 'demonstration',
        workspace: 'staging',
        appliedFor: 'lease',
        until: (new Date(currentDate + 30000)).toISOString()
      })
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

  it('Wait up to 60s before the automatic deletion to be considered as failed', (done) => {
    i = 0
    queryWorkspace4DeletedChannel(() => {
      done()
    })
  })

  it('GET on /projects/{project}/workspaces/{workspaces} to review workspace', (done) => {
    request(server)
      .get('/projects/demonstration/workspaces/staging')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.containEql({
          project: 'demonstration',
          workspace: 'staging',
          channels: {
            duration: 'lease',
            leaders: []
          }
        })
        done()
      })
  })

  it('DELETE /channels/{channel} to delete the channel from project/workspace', (done) => {
    request(server)
      .del('/channels/channel1')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Authorization', token)
      .expect(204)
      .end((err, res) => {
        should.not.exist(err)
        done()
      })
  })

  it('POST on /projects/{project}/workspaces/{workspaces} to change for request', (done) => {
    request(server)
      .post('/projects/demonstration/workspaces/staging')
      .send({
        action: 'update',
        channels: {
          duration: 'request'
        }
      })
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(201)
      .end((err, res) => {
        should.not.exist(err)
        done()
      })
  })

  it('GET on /projects/{project}/workspaces/{workspaces} to review workspace', (done) => {
    request(server)
      .get('/projects/demonstration/workspaces/staging')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err)
        res.body.should.containEql({
          project: 'demonstration',
          workspace: 'staging',
          channels: {
            duration: 'request'
          }
        })
        done()
      })
  })

  it('GET /channels/{channel} to describe a channel with a project/workspace', (done) => {
    request(server)
      .get('/channels/channel1')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(404)
      .end((err, res) => {
        should.not.exist(err)
        done()
      })
  })
})
