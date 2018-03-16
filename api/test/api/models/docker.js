/* eslint-env mocha */

const should = require('should')
const { version, apply, check, destroy } = require('../../../api/models/docker')
// const devnull = require('dev-null')

describe('models', () => {
  describe('docker', function () {
    this.timeout(60000)
    it('Make sure the docker lineup container can display a version', (done) => {
      version((err, data) => {
        if (!err) {
          should(data).containEql({ StatusCode: 0 })
          done()
        }
      })
    })

    it('Run `terraform apply` from docker', (done) => {
      apply({project: 'demonstration', workspace: 'staging', event: 'test-apply'}, (err, data) => {
        if (!err) {
          should(data).containEql({ StatusCode: 0 })
          done()
        }
      })
    })

    it('Check the terraform stack from docker', (done) => {
      check({project: 'demonstration', workspace: 'staging', event: 'test-check1'}, (err, data) => {
        if (!err) {
          should(data).containEql({ StatusCode: 0 })
          done()
        }
      })
    })

    it('Run `terraform destroy` from docker', (done) => {
      destroy({project: 'demonstration', workspace: 'staging', event: 'test-destroy'}, (err, data) => {
        if (!err) {
          should(data).containEql({ StatusCode: 0 })
          done()
        }
      })
    })

    it('Check the terraform stack from docker', (done) => {
      check({project: 'demonstration', workspace: 'staging', event: 'test-check2'}, (err, data) => {
        if (!err) {
          should(data).containEql({ StatusCode: 2 })
          done()
        }
      })
    })

    it('Run `terraform apply` from docker with a non existing branch', (done) => {
      apply({project: 'demonstration', workspace: 'staging', ref: 'branch:doesnotexist', event: 'test-destroy'}, (err, data) => {
        if (!err) {
          should(data).containEql({ StatusCode: 128 })
          done()
        }
      })
    })
  })
})
