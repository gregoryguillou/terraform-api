# Installation Guides

Terraform API can be deployed in many configurations. It is up to you to
decide what best fit your needs. You'll find below 3 installations procedure:

- A [`docker-compose` deployment](INSTALL/COMPOSE.md) that relies on the
  github repository can be used both for a demonstration and to develop
- An [`AWS` deployment](INSTALL/AWS.md). This deployment provides a packer
  template and a terraform module to quickly deploy the project.
- The [installation and configuration of Bots with Slack](INSTALL/BOTS.md)

## Configuration

The whole API configuration is stored in a file named 
`api/config/settings.yaml`. Depending on the deployment the procedure to create
the file might differ. However, it is very important you do not leave the default
settings and modify the following values:

- Request a github token and add it to the `password` in the git section of the project
- Set your github username to monitor the API access to github too
- Change the JWT secretOrKey and make sure it cannot be access
- Change the username and apikey in the user section of the file
- Remove the existing the username apikey from the file
- Change the couchbase `username`, `password` and `bucket-password`
