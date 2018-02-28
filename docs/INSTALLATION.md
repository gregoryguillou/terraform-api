# Installation Guide

Terraform Lineup relies on the local docker daemon. It limits the number of
container instances it can start, its ability to scale and prevents it from 
running with loadbalancing. On the other hand, it makes its configuration
very simple:

- Mount the docker socket in the API 
However, this configuration make it easy to run on
a simple laptop.

> **Note**: Future releases of Terraform Lineup might support docker
  orchestration platforms, like Kubernetes or or FaaS. 

```shell
cd stack
docker-compose up -d
```

Remarks:
- Mind the memory/cpu to avoid OOM


```
cd stack
docker-compose up -d
```
