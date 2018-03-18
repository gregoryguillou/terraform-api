# Installation Guide

Terraform deck relies on the local docker daemon. This limits the number of
container instances it can start and its ability to scale. It also prevents it
from running several instances of the API. On the other hand, it makes its 
configuration very easy as explained below.

> **Note**: Future releases of Terraform--deck might support docker
  orchestration platforms, like Kubernetes. However, for now, you can
  only run on a single server with docker-compose

## Building containers

```shell
cd api
npm install
cd ../stack
npm install
DECK_CONTAINER=deck-api npx run build
DECK_CONTAINER=deck-terraform npx run build
```

## Create a settings.yaml file

The whole configuration is stored in the `api/config/settings.yaml`
file. Create one from `api/config/settings-template.yaml` and modify
the following values:

- Request a github token and add it to the `password` in the git section of the project
- Set your github username to monitor the API access to github too
- Change the JWT secretOrKey and make sure it cannot be access
- Change the username and apikey in the user section of the file
- Remove the existing the username apikey from the file
- Change the couchbase `username`, `password` and `bucket-password`

## Docker Compose

To run the API, you should configure 

```shell
cd stack
docker-compose up -d
```

## Other considerations

Installing the Terraform-deck on other Cloud Provider or on-premises should
not be too difficult. 

Remarks:
- Mind the memory/cpu to avoid OOM
- Make sure you enforce the API with a SSL certificate
