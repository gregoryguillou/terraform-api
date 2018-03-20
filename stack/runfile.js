const { run, help } = require('runjs')
const dotenv = require('dotenv')

const containers = {
  'terraform-deck': {
    name: 'gregoryguillou/terraform-deck',
    version: 'latest',
    path: '../api'
  },
  demo: {
    name: 'gregoryguillou/terraform-deck',
    version: 'latest-demo',
    path: '../demo'
  }
}

function build () {
  dotenv.config()
  process.chdir(containers['terraform-deck'].path)
  run(`docker build -t ${containers['terraform-deck'].name}:${containers['terraform-deck'].version} .`)
  process.chdir(containers.demo.path)
  run(`docker build --build-arg CACHEBUST=$(date +%s) --build-arg GITHUB_REPOSITORY=${process.env.GITHUB_REPOSITORY} -t ${containers.demo.name}:${containers.demo.version} .`)
}

function clean () {
  run(`docker rmi ${containers['terraform-deck'].name}:${containers['terraform-deck'].version}`)
  run(`docker rmi ${containers.demo.name}:${containers.demo.version}`)
}

function doc () {
  process.chdir('..')
  run('docker run --rm -v $(pwd):/opt swagger2markup/swagger2markup convert -i /opt/api/api/swagger/swagger.yaml -f /opt/docs/REFERENCE -c /opt/api/api/swagger/config.properties')
}

help(build, {
  description: 'Build the docker containers',
  examples: `
    npx run build
  `
})

module.exports = {
  build,
  clean,
  doc
}
