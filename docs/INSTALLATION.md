# Installation Guide

Terraform Deck relies on the local docker daemon. This limits the number of
container instances it can start and its ability to scale. It also prevents it
from running several instances of the API. On the other hand, it makes its 
configuration very easy as explained below.

> **Note**: Future releases of Terraform Deck might support docker
  orchestration platforms, like Kubernetes.  

## Building containers

```shell
cd stack
npm install
LINEUP_CONTAINER=deck-service npx run build
LINEUP_CONTAINER=deck-terraform npx run build
```

## Docker Compose

- Mount the docker socket in the API 
However, this configuration make it easy to run on
a simple laptop.


```shell
cd stack
docker-compose up -d
```

## Other considerations

Installing the Terraform Deck on other Cloud Provider or on-premises should
not be too difficult. 

Remarks:
- Mind the memory/cpu to avoid OOM
- Make sure you enforce the API with a SSL certificate