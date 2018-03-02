# A step-by-step demonstration of Lineup with Consul

HashiCorp Consul is easy to run on a laptop with docker. In dev mode, it consumes
only few resources. It is a perfect match for terraform as it can both be used to
store its state and as a target environment. This tutorial will guide you through
the steps to configuring and using `lineup` on a laptop:

1. make sure your laptop matches the system pre-requisites
2. start consul for demonstration purpose
3. create your terraform project to provide environments to your users
4. build and test the `lineup-terraform` container with your terraform project
5. start and configure `lineup` to run locally
6. demonstrate how to use `lineup` web API to create/destroy project environments
7. package `lineup` in a container to run it on a server
8. develop `lineup` from the environment you've just built

> **Important**: `lineup` is a tool for developers who want to get access to
  resources from a simple command. It does not support to run tests, neither
  it does integrate a CI/CD pipeline. If that is what you want to do, there are
  better ways.

This tutorial presents many aspects of `Lineup` for 4 reasons:

- So that you can have a working environment to demonstrate it
- So that you understand how pieces work together and make Lineup work
- So that you understand the requirements and guideline for your terraform
  project to be integrated in lineup
- So that you have an environment you can use to 

## Checking your system pre-requisites and cloning the project

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

> **Note:** There might be some additional dependencies like the `realpath` command.
  If you are running MacOS or Windows and are facing some issues, let us know.

To start with this tutorial, you will clone the git repository as shown below:

```shell
git clone https://github.com/gregoryguillou/lineup.git
cd lineup
```

In the remaining sections of this tutorial we will assume the base directory of our
work is the project home. 

## Using Consul as a stack example

The `stack` directory of the project contains a `docker-compose.yml` file that
references all the artefacts needed to run and test `lineup`. Consul is part of
it. You should just run that container from there with the command below:

```shell
cd stack
docker-compose up -d consul
```

To make sure Consul is working, you could, run `docker-compose ps` or `docker ps`
command like below:

```shell
docker-compose ps consul
docker ps -f "label=lineup.role=consul" -f status=running --format "{{.ID}}"
```

Once you've made sure it was up and running, you could query the HTTP api with
some commands like the one below:

```shell
curl --silent 0.0.0.0:8500/v1/catalog/nodes | jq -r '.[0].Node'
```

> **Note:** Lets assume the CONSUL_DOCKER variable includes Consul Docker
  Identifier. Run this command to set the variable:
  `export CONSUL_DOCKER=$(docker ps -f "label=lineup.role=consul" -f status=running --format "{{.ID}}")`.

Before we move on, we will discover the network GATEWAY that should be used to access
Consul container. In order to do that :

- get the Bridge Name that is used by the Consul container
- get the Network IP Gateway Address to access that Bridge
- Test accessing the consul container through that Network IP Gateway

The script below execute those 3 steps:


```shell
export CONSUL_DOCKER=$(docker ps -f "label=lineup.role=consul" -f status=running --format "{{.ID}}")
export CONSUL_BRIDGE=$(docker inspect ${CONSUL_DOCKER} | jq -r ".[0].NetworkSettings.Networks | to_entries | .[0].key")
CONSUL_GATEWAY=$(docker inspect ${CONSUL_DOCKER} | jq -r ".[0].NetworkSettings.Networks.${CONSUL_BRIDGE}.Gateway")
curl --silent ${CONSUL_GATEWAY}:8500/v1/catalog/nodes | jq
```

## Developing a Terraform project

We've created a very simple stack made of one-only a Consul Key in 
the `demo/terraform/starter` directory. It's content look like below.

### A single resource

The `key.tf` file contains a single resource that has a single key:

```hcl
resource "consul_key_prefix" "myapp_config" {
  path_prefix = "environment/${terraform.workspace}/"

  subkeys = {
    "alive" = "yes"
  }
}
```

In the current model, it is important to prevent resource collision between
workspace. If that were the case, it could happen that the creation of an environment
would destroy resources from another. In the case above, we are using the 
${terraform.workspace} variable to prevent that. For more details on the subjet, refer
to the [Development Guidelines](GUIDELINES.md).

### A connection to the targeted environment

The directory also includes the declaration of the provider used to create resources:

 ```hcl
 provider "consul" {
  address    = "consul:8500"
  datacenter = "dc1"
  version = "1.0.0"
}
```

> **Important:**  In order for that configuration to work on your laptop, you will need
  the `consul` alias to resolve to the `${CONSUL_GATEWAY}` IP. Register the associated alias
  in the `/etc/hosts` file of your laptop after you've made sure there is no existing alias
  already (test with `grep consul /etc/hosts`). The command below, assuming, 
  `${CONSUL_GATEWAY}` is set creates that alias as `root`. The command that follows test
  it to make sure it works as expected:

  ```shell
  echo "${CONSUL_GATEWAY} consul" | sudo tee -a /etc/hosts
  curl consul:8500/v1/catalog/nodes | jq
  ```

### A connection to the backend that stores terraform State:

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

### Testing terraform Project

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

## Building a container to manage your Terraform project

A full description of how the container that embed the feature of `terraform` is out of the
scope of this tutorial. You should review the scripts and the
[Development Guidelines](GUIDELINES.md). For more details. However, you can build the
container with the script below:

```shell
cd stack
npm install
LINEUP_CONTAINER=lineup-terraform npx run build
```

Again, you should be able to see the how the container is working to manage those terraform
stacks. 

```shell
docker run -it --rm -e CONSUL_IP=${CONSUL_GATEWAY} lineup-terraform -c apply -w qa
docker run -it --rm -e CONSUL_IP=${CONSUL_GATEWAY} lineup-terraform -c list -w qa
docker run -it --rm -e CONSUL_IP=${CONSUL_GATEWAY} lineup-terraform -c destroy -w qa
```

## Running the `lineup` service locally

`lineup` is a Node API based on Swagger/Express. You can start it with the command below:

```shell
cd api
npm start
```

If you want to test it, you shoud simply run the command below:

```shell
npm test
```

## Using the `lineup` API to work with your environment

## Packaging the `lineup` API in a container

## Developing `lineup` from your environment

