const { run, help } = require('runjs')
const util = require('util')
const dotenv = require('dotenv')

const containers = {
  'deck-api': {
    name: 'deck-api',
    version: 'alpha1',
    path: '../api'
  },
  'deck-terraform': {
    name: 'deck-terraform',
    version: 'beta',
    path: '../demo'
  }
}

const container = process.env.LINEUP_CONTAINER || 'deck-terraform'
const version = process.env.LINEUP_VERSION || containers[container]['version']
const path = containers[container]['path']

function build () {
  dotenv.config()
  process.chdir(path)
  if (container === 'deck-api') {
    run(util.format('docker build --build-arg CACHEBUST=$(date +%s) -t %s:%s -t %s:latest .', '%s', container, container, version))
  } else {
    run(util.format('docker build --build-arg CACHEBUST=$(date +%s) --build-arg GITHUB_REPOSITORY=%s  --build-arg GITHUB_USERNAME=%s --build-arg GITHUB_PASSWORD=%s -t %s:latest -t %s:%s .',
      '%s', process.env.GITHUB_REPOSITORY, process.env.GITHUB_USERNAME, process.env.GITHUB_PASSWORD, container, container, version))
  }
}

function clean () {
  process.chdir(path)
  run(util.format('docker rmi %s:%s', container, version))
  run(util.format('docker build -t %s:latest .', container))
}

function doc () {
  process.chdir('..')
  run('docker run --rm -v $(pwd):/opt swagger2markup/swagger2markup convert -i /opt/api/api/swagger/swagger.yaml -f /opt/docs/REFERENCE -c /opt/api/api/swagger/config.properties')
}

help(build, {
  description: 'Build the docker containers',
  examples: `
    LINEUP_CONTAINER=deck-api npx run build
    LINEUP_CONTAINER=deck-terraform npx run build
  `
})

module.exports = {
  build,
  clean,
  doc
}
