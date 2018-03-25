# Terraform-deck step-by-step with Consul

HashiCorp Consul is easy to run on a laptop with docker. In dev mode, it consumes
only few resources. It is a perfect match for terraform as it can both be used to
store its state and as a target environment. This tutorial will guide you through
the steps to configuring and using `deck` on a laptop:

1. make sure your laptop matches the system pre-requisites
2. start consul for demonstration purpose
3. create your terraform project to provide environments to your users
4. build and test a container with terraform and your project
5. start and configure `deck` to run locally
6. demonstrate how to use `deck` to create/destroy project environments
7. package `deck` in a container to run it on a server
8. develop `deck` from our laptop

> **Important**: `deck` is a tool for developers who want to get access to
  resources from a simple command. It does not support to run tests, neither
  it does integrate a CI/CD pipeline.

This tutorial has several goals:

- It helps you building a working environment to exercice and demonstrate 
  `deck`
- It digs into the various components so that you can understand how pieces
  work together
- It describes a simple terraform project that can easily be integrated with
  deck
- It provides an environment you can use to update the project code

---
# 1. Checking your system pre-requisites

To deploy a working stack, all you would need is docker and docker-compose for Linux. 
However, for this tutorial, we will assume you will have the following components
installed:

- Bash 4+ and JQ
- Git
- NodeJS 9.x+ and NPM 5.3+
- Terraform 0.11+
- An Internet access
- Docker and Docker-Compose
- A text editor like vim, vcode to write your code and modify the configuration
- Curl or another tool to perform http calls
- A github.com account

> **Note:** There might be some additional dependencies like the `realpath` command.
  If you are running MacOS or Windows and are facing some issues, let us know.

To start with this tutorial, you will clone the git repository as shown below:

```shell
git clone https://github.com/gregoryguillou/terraform-deck.git
cd terraform-deck
```

In the remaining sections of this tutorial we will assume the base directory of our
work is the project home. 

---
# 2. Using Consul as a stack example

The `stack` directory of the project contains a `docker-compose.yml` file that
references all the artefacts needed to run and test `deck`. Consul is part of
it. You should just run that container from there with the command below:

```shell
cd stack
docker-compose up -d consul
```

To make sure Consul is working, you could, run `docker-compose ps` or `docker ps`
command like below:

```shell
docker-compose ps consul
docker ps -f "label=deck.role=consul" -f status=running --format "{{.ID}}"
```

Once you've made sure it was up and running, you could query the HTTP api with
some commands like the one below:

```shell
curl --silent 0.0.0.0:8500/v1/catalog/nodes | jq -r '.[0].Node'
```

> **Note:** Lets assume the CONSUL_DOCKER variable includes Consul Docker
  Identifier. Run this command to set the variable:
  `export CONSUL_DOCKER=$(docker ps -f "label=deck.role=consul" -f status=running --format "{{.ID}}")`.

Before we move on, we will discover the network GATEWAY that should be used to access
Consul container. In order to do that :

- get the Bridge Name that is used by the Consul container
- get the Network IP Gateway Address to access that Bridge
- Test accessing the consul container through that Network IP Gateway

The script below execute those 3 steps:

```shell
export CONSUL_DOCKER=$(docker ps -f "label=deck.role=consul" \
                              -f status=running --format "{{.ID}}")
export CONSUL_BRIDGE=$(docker inspect ${CONSUL_DOCKER} | \
    jq -r ".[0].NetworkSettings.Networks | to_entries | .[0].key")
CONSUL_IP=$(docker inspect ${CONSUL_DOCKER} | \
    jq -r ".[0].NetworkSettings.Networks.${CONSUL_BRIDGE}.Gateway")
curl --silent ${CONSUL_IP}:8500/v1/catalog/nodes | jq
```

---
# 3. Developing a Terraform project

We've created a very simple stack made of two Consul keys in the
`demo/terraform/starter` directory. It's content look like below.

## A single resource

The `key.tf` file contains a single resource that has 2 keys:

```hcl
resource "consul_key_prefix" "myapp_config" {
  path_prefix = "environment/${terraform.workspace}/"

  subkeys = {
    "alive" = "yes"
    "version" = "v0.0.3"
  }
}
```

In the current model, it is important to prevent resource collision between
workspaces. If that were the case, it could happen that the creation of an environment
would destroy resources from another. In the case above, we are using the 
${terraform.workspace} variable to prevent that. For more details on the subjet, refer
to the [Development Guidelines](GUIDELINES.md).

Once deployed, you can access Consul resource with `curl`. Below is an example
for the `staging` workspace:

```shell
curl --silent http://${CONSUL_IP}:8500/v1/kv/environment/staging/?recurse=true \
  | jq -r '.[] | {Value: .Value, Key: .Key}'
```

## A connection to the targeted environment

The directory also includes the declaration of the provider used to create resources:

 ```hcl
 provider "consul" {
  address    = "consul:8500"
  datacenter = "dc1"
  version = "1.0.0"
}
```

## A backend to store Terraform State:

In our simple example, we also use a `backend.tf` file that reference the state

```hcl
terraform {
  backend "consul" {
    address = "consul:8500"
    path    = "terraform/starter"
  }
}
```

> **Important:** One of the challenges to this approach is to differentiate parameters
  and variables depending upon the environment you are working on. In this case, it is
  very simple because the configuration does not have any secret.

## Testing terraform Project

The set of commands below show it is quite easy to create environment this way. You can
simply change the value for WORKSPACE to create N environment in parallel:

```shell
export WORKSPACE=qa
cd demo/terraform/starter

terraform init -get-plugins=true

terraform workspace select ${WORKSPACE} ||
  terraform workspace create ${WORKSPACE}

terraform apply -auto-approve

terraform state show

terraform destroy -force

terraform state show

terraform workspace select default
```

> **Note:** the project also provide a simple set of scripts in `demo/bin` that encapsulate
  the commands above and help with providing a simple set of containers.

---
# 4. Building a container to manage your Terraform project

A full description of how the container that embed the feature of 
`terraform` is out of the scope of this tutorial. You should review the scripts
and the [Development Guidelines](https://github.com/gregoryguillou/terraform-deck/blob/master/docs/GUIDELINES.md). 
For more details. However, in order to build the container, you will need to
add your github repository, username and token to an `.env` file in `stack`.
You can use `.env.template` as a template for this `.env` file. Once done, you
should be able to build the container with the script below:

```shell
cd stack
npm install
DECK_CONTAINER=deck-terraform npx run build
```

Again, you should be able to see the how the container is working to manage those terraform
stacks. 

```shell
docker run -it --rm -e CONSUL_IP=${CONSUL_IP} --env-file .env deck-terraform -c apply -w qa
docker run -it --rm -e CONSUL_IP=${CONSUL_IP} --env-file .env deck-terraform -c list -w qa
docker run -it --rm -e CONSUL_IP=${CONSUL_IP} --env-file .env deck-terraform -c destroy -w qa
docker run -it --rm -e CONSUL_IP=${CONSUL_IP} --env-file .env deck-terraform -c check -w qa
```

---
# 5. Running the `deck` service locally

## Create a configuration

In order to start the API, you must create a file named `settings.yaml` in the `api/config`
directory; in order to proceed, copy the `settings-template.yaml` file:

```shell
cd api/config
cp settings-template.yaml settings.yaml
```

You should then change the following:

- Request a github token and replace the `password` in the git section of the project
- Set your github username to monitor the API access to github too
- **Important** Change the JWT secretOrKey and make sure it cannot be access
- **Important** Change the username and apikey in the user section of the file
- **Important** Remove the existing the username apikey from the file
- **Important** Change the couchbase `username`, `password` and `bucket-password`

>  Note: tests rely on the default credentials for now.

## Testing the API

`deck` is a Node API based on Swagger/Express. It stores it data in a `couchbase`
for now. It also assumes it has 2 buckets, one for the data and one for the logs.
the command below should start a couchbase and configure it with the buckets:

```shell
cd stack
docker-compose up -d couchbase couchbase-setup
```

To test the API, you need a consul configuration; we also provide it as part of the
stack:

```
cd stack
docker-compose up -d consul
```

We also need the `deck-terraform:latest` image built:
```shell
cd stack
docker images deck-terraform:latest
```

Assuming you've create a configuration with the default credentials, the test should
pass:

```shell
cd api
npm install
npm test
```

## Installing the API

Change the `settings.yaml` file according to your needs. Startin the API
should be as simple as running the command below:

```shell
cd api
npm start
```

>  **Important**: If you plan to use the API, you should enable SSL on Express
   or put it behind a SSL enabled webserver/loadbalancer.

---
# 6. Using `deck`

There are many ways to use `deck`. We will explore the CLI and REST API below.
## Accessing deck with the CLI

The easiest way to use deck should be from the CLI. You can build it like
below:

```
cd cli
dep ensure
make build
```

We will assume you've renamed the CLI to `deck` and it is in your PATH. 
To setup the CLI, run `deck configure`. It will ask for the endpoint and
an API key as configured in the `settings.yaml` file. This creates a file
in the `${HOME}/.deck` directory. You should then be able to run the API: 

```shell
deck help
deck version
deck projects
deck workspaces -p demonstration
deck show -p demonstration -w qa
deck apply -p demonstration -w qa
EVENT=$(deck show -p demonstration -w staging | jq -r '.lastEvents[0]')
deck events -e ${EVENT}
deck logs -t -e ${EVENT}
deck destroy -p demonstration -w qa
```

## Accessing deck using the REST API

The REST API is an OPEN API implemented with Swagger. For details about how
to use it, see the [Reference Guide](https://github.com/gregoryguillou/terraform-deck/blob/master/docs/REFERENCE.adoc).
This section details how to connect. Assuming you rely on the default APIKEY,
this is a simple set of commands that connects, applies and destroys the `qa`
workspace.

```shell
curl -H 'Authorization: Key notsosecretadminkey' localhost:10010/login
JWT_TOKEN=$(curl --silent -H 'Authorization: Key notsosecretadminkey' \
               localhost:10010/login | jq -r '.token')
curl -H "Authorization: Bearer ${JWT_TOKEN}" \
     localhost:10010/user
curl -H "Authorization: Bearer ${JWT_TOKEN}" \
     localhost:10010/version
curl -H "Authorization: Bearer ${JWT_TOKEN}" \
     localhost:10010/projects
curl -H "Authorization: Bearer ${JWT_TOKEN}" \
     localhost:10010/projects/demonstration
curl -H "Authorization: Bearer ${JWT_TOKEN}" \
     localhost:10010/projects/demonstration/workspaces
curl -H "Authorization: Bearer ${JWT_TOKEN}" \
    localhost:10010/projects/demonstration/workspaces/qa

curl -H "Authorization: Bearer ${JWT_TOKEN}" \
     -H "Content-Type: application/json" \
     -XPOST localhost:10010/projects/demonstration/workspaces/qa \
     -d'{"action": "apply"}'
EVENT=$(curl --silent -H "Authorization: Bearer ${JWT_TOKEN}" \
     localhost:10010/projects/demonstration/workspaces/qa | \
     jq -r '.lastEvents[0]')

curl --silent -H "Authorization: Bearer ${JWT_TOKEN}" \
     localhost:10010/events/${EVENT} 
curl --silent -H "Authorization: Bearer ${JWT_TOKEN}" \
     localhost:10010/events/${EVENT}/logs
curl --silent -H "Authorization: Bearer ${JWT_TOKEN}" \
     localhost:10010/events/${EVENT}/logs | \
     jq -r '.logs[] | .text'

curl -H "Authorization: Bearer ${JWT_TOKEN}" \
     -H "Content-Type: application/json" \
     -XPOST localhost:10010/projects/demonstration/workspaces/qa \
     -d'{"action": "destroy"}'
EVENT=$(curl --silent -H "Authorization: Bearer ${JWT_TOKEN}" \
     localhost:10010/projects/demonstration/workspaces/qa | \
     jq -r '.lastEvents[0]')
curl --silent -H "Authorization: Bearer ${JWT_TOKEN}" \
     localhost:10010/events/${EVENT}/logs | \
     jq -r '.logs[] | .text'
```

> Note: the JWT Token is 120 seconds. If you get a message saying you are 
  `Unauthorized`, renew it from the APIKEY.

---
# 7. Packaging the `deck` API in a container

You can run the `deck` API from docker, in order to proceed, run the
following command:

```shell
cd stack
DECK_CONTAINER=deck-api npx run build
docker-compose up -d
```

You should then be able to work with the CLI and the REST API from
anywhere. Note that this is the prefered way to install `deck`. It also
suppose you change all the passwords/keys and you configure the
`api/config/settings.yaml` file as you should.

---
# 8. Developing `deck` from your environment

If you want to contribute to the code, fork the project:

- The API is fully based on Node and Javascript; as a result, there is not much
  to know, you can just correct the code and restart it
- The CLI is a golang project. We assume we work with 
  [go dep](https://github.com/golang/dep) so you should install it and run
  `dep ensure` from the CLI directory. If you plan to modify the files in
  `cmd`, you should reference your fork in the `main.go` file to test
- Create Pull Request from the branch you have created on your fork
