const { run, help } = require('runjs')
const dotenv = require('dotenv')
const fs = require('fs')
const os = require('os')
const request = require('request-promise')
const unzip = require('unzip')

const containers = {
  'terraform-api': {
    name: 'gregoryguillou/terraform-api',
    version: 'latest',
    path: '../api'
  },
  runtime: {
    name: 'gregoryguillou/terraform-api',
    version: 'latest-runtime',
    path: '../runtime'
  }
}

const terraformVersion = '0.11.5'
const packerVersion = '1.2.1'

function build () {
  dotenv.config()
  process.chdir(containers['terraform-api'].path)
  run(`docker build -t ${containers['terraform-api'].name}:${containers['terraform-api'].version} .`)
  process.chdir(containers.runtime.path)
  run(`docker build -t ${containers.runtime.name}:${containers.runtime.version} .`)
}

function clean () {
  run(`docker rmi ${containers['terraform-api'].name}:${containers['terraform-api'].version}`)
  run(`docker rmi ${containers.runtime.name}:${containers.runtime.version}`)
}

function doc () {
  process.chdir('..')
  run('docker run --rm -v $(pwd):/opt swagger2markup/swagger2markup convert -i /opt/api/api/swagger/swagger.yaml -f /opt/docs/REFERENCE -c /opt/api/api/swagger/config.properties')
}

function terraform () {
  const zipFile = `terraform_${terraformVersion}_${os.platform()}_amd64.zip`
  const target = {
    zipFile: zipFile,
    zipUrl: `https://releases.hashicorp.com/terraform/${terraformVersion}/${zipFile}`,
    zipContent: 'terraform',
    file: `terraform_${terraformVersion}`,
    alias: 'terraform'
  }
  tool(target)
}

function packer () {
  const zipFile = `packer_${packerVersion}_${os.platform()}_amd64.zip`
  const target = {
    zipFile: zipFile,
    zipUrl: `https://releases.hashicorp.com/packer/${packerVersion}/${zipFile}`,
    zipContent: 'packer',
    file: `packer_${packerVersion}`,
    alias: 'packer'
  }
  tool(target)
}

function tool (target) {
  if (!fs.existsSync('tools')) {
    fs.mkdirSync('tools', 0o755)
  }

  if (!fs.existsSync(`tools/${target.file}`)) {
    const options = {
      url: target.zipUrl,
      encoding: null
    }

    request.get(options)
      .then(function (res) {
        const buffer = Buffer.from(res, 'utf8')
        const tempfile = `tools/${target.file}.download`
        fs.writeFileSync(tempfile, buffer)

        fs.createReadStream(`${tempfile}`)
          .pipe(unzip.Parse())
          .on('entry', function (entry) {
            var fileName = entry.path
            if (fileName === target.zipContent) {
              entry.pipe(fs.createWriteStream(`tools/${target.file}`, { mode: 0o755 }))
            }
          })
          .on('finish', function () {
            fs.unlinkSync(`${tempfile}`)
            fs.symlinkSync(fs.realpathSync(`tools/${target.file}`), `tools/${target.alias}`)
          })
      })
  }
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
  doc,
  packer,
  terraform
}
