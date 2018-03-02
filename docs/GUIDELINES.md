# Guidelines to develop and deploy Terraform scripts for Lineup

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

## Avoiding resource collision

- Multiple accounts
- ${terraform.workspace}
- How to pass parameters and variable in ways that depend from the
  workspace ?

## Building a container

the interface is 
- -c, 
- -w and 
- -r with branch: or tag: