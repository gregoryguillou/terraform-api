# Guidelines to develop and deploy a project management automation script

Terraform API allows to create, update, destroy and check environments on-demand. In
order to do that, it requires you build a project artefact. These guidelines
go from a general overview to the principles of developing the project
automation. The last section digs into some principles associated with
the terraform specific implementation.

## General principles

Avoid collision so that one fail does not impact others
- Multiple accounts
- ${terraform.workspace}

## Managing the artefact

- Building the artefact
- Deploy and configure the artefact
- Test the artefact

### Create a project artefact

A project artefact is made of 2 parts:

- The container that embeds terraform and contains the logic
- A set of script that are available on the 

#### Create the project container

the interface is 
- -c or --command
  - apply
  - destroy
  - list
  - check
- -w or --workspace
- -r or --reference
  the reference can contain a with branch: or tag:

- commands are :

#### Create the project extra-scripts

 for now only a status script. It usually reference the {{terraform-api.WORKSPACE}}
 for now but we could imagine to enrich it later on

### Deploy and configure a project artefact

This section should describe the project configuration like the one available
in settings-template.yaml

It should also describe the variable that are accessible:

- terraform-api.WORKSPACE
- env.[VARIABLE]

### Test the project

## Managing a prohect with Terraform

It should be possible to create project with tools others that Terraform


The configuration should be as simple as `terraform apply` and
`terraform destroy`. In order to get to that, there are a few
development Guidelines to follow:

- Do not store your state in a file, instead, prefer using a
  remote backend like S3 so that your application do not
  store any critical data
- Implement a locking mecanism
- Create `<file>.auto.tfvars` files in the directory and use
  the `pre-start` lifecycle script to pull data from a remote
  location like Vault or S3
- Version your S3 buckets
- Think speed and cost. Consolidate resources like VPC or 
  loadbalancers if it makes sense
- Use *.domainname certificate and name with a - like in
  api-staging.example.com and api-development.example.com
- Anonymize environment, example animals, colors or simply
  a key

- How to pass parameters and variable in ways that depend from the
  workspace ?
