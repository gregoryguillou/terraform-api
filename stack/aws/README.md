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

### Configuration

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


To use the project, you can simply add a module like the one below in your
project:

```hcl
module "terraform-deck" {
  source = "github.com/gregoryguillou/terraform-deck//stack/aws/terraform"

  deploy           = "true"
  availabilityzone = "<Availability Zone>"
  configbucket     = "<Bucket>"
  configfile       = "<Config File>"
  environment      = "<Environment>"
  hostname         = "<FQDN>"
  keypair          = "<SSH Key Pair Name>"
  listener         = "<Listener ARN>"
  subnet           = "<Subnet>"
  vpc              = "<VPC>"
}
```

The parameters are the following:

- `deploy` contains the "true" or "false" string and defines if the API is
  deployed. It is useful because you cannot add `count` in a module
- `availabilityzone` defines the Availability that will store the API data
- `configbucket` is the bucket that will be used to store the API configuration
  data
- `configfile` is the configuration file path and name in the bucket
- `environment` is used to prefix resource name and avoid naming conflicts
- `hostname` is the fully qualified name with the domain that will forward to
  the API. Note that the declaration of that name in the DNS is not provided
  by the module; However, the registration in a target group is.
- `keypair` a SSH key registered in EC2 and deployed in the ec2-user account at
   startup
- `listener` the ARN of the listener that is used as a loadbalancer
- `subnet` the subnet that will host the EC2 instance
- `vpc` the VPC that will host the EC2 instance and the listener

### About the AMI

COPY the AMI for 2 reasons:
- It is only availabe on eu-west-1
- It might be deleted

The best would be in fact to rebuild your AMI to make sure it 

### Configure the application

In order to configure the application, you must:

- copy and modify the `api/config/settings-template.yaml` file according to your
  needs
- upload the file on a bucket that is secured and cannot be accessed except for
  the AWS instance
- Add the bucket name and bucket key in the deployment module parameters

Assuming you've copied the file to `settings.yaml` before you've modified it and
you have set `configbucket` and `configfile` to reference the bucket and the key
you will use to reference the file, you should be able to copy the file with the
command below:

```shell
aws s3 cp api/config/settings.yaml s3://${configbucket}${configfile}
```

### Configure your stack
