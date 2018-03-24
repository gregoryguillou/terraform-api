# Terraform-deck for AWS

This stack is deployment model for `terraform-deck` on AWS. It consists in:

- A packer template that creates an AMI with the project preinstalled on it
- A terraform module that can be used with the AMI to deploy `terraform-deck`

## Building a terraform-deck AMI

The project provides a packer template to build an AMI with terraform-deck. In
order to make it work, you should setup an AWS access/secret keys pair in the
default profile or set the `AWS_DEFAULT_PROFILE` variable. You should also 
create a file with the VPC and a public subnet so that it can be used to build
the AMI:

```shell
cd stack/aws
cat >.env.json <<EOF
{
  "vpc": "<YOUR VPC_ID>",
  "subnet": "<YOUR SUBNET_ID>",
  "region": "eu-west-1"
}
EOF
```

Once you've done it, you should be able to build and list the AMI from the 
project Makefile:

```shell
make ami
make list
```

## Deploying `terraform-deck`

Once we have built the AMI, you should be able to deploy it. We will assume a
few things:
- There is a pre-existing VPC with a subnet you can use to host your service
- There is a pre-existing application loadbalancer (ALB) in the VPC that will
  be able to forward API calls to the EC2 instance. We shall be able to use 
  a forward rule base on a hostname
- There is a network alias that references the ALB listener for `terraform-deck`
  specific use.
- There is a bucket with `terraform-deck` configuration file. The instance will
  be able to pull from it at startup.


The module parameters should look like the one below:
- `vpc`:
- `subnet`:
- `loadbalancer`:
- `hostname`:
- `ruleno`:
- `bucket`:
- `configfile`:
