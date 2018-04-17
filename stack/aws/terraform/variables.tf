variable "ami" {
  type        = "string"
  description = "The AZ the storage will be kept in"
}

variable "availabilityzone" {
  type        = "string"
  description = "The AZ the storage will be kept in"
}

variable "configbucket" {
  type        = "string"
  description = "The bucket with the configuration file"
}

variable "configfile" {
  type        = "string"
  description = "The key of configuration file in the S3 bucket"
}

variable "deploy" {
  type        = "string"
  default     = "true"
  description = "Allows to use the module but actually not deploy the resources"
}

variable "environment" {
  type        = "string"
  description = "An environment identifier to distinguish between stack. This is a prefix in the resource name"
}

variable "hostname" {
  type        = "string"
  description = "The FQDN of the hostname that serves the API"
}

variable "images" {
  type        = "string"
  description = "A list separated by spaces of docker images to pull at startup"
  default     = ""
}

variable "keypair" {
  type        = "string"
  description = "The name of the key used to provision the instance"
}

variable "listener" {
  type        = "string"
  description = "The ALB that will server the API"
}

variable "ruleno" {
  type        = "string"
  default     = 87
  description = "The rule number as seen by the ALB listener"
}

variable "subnet" {
  type        = "string"
  description = "The Subnet in which the EC2 instance will be deployed"
}

variable "vpc" {
  type        = "string"
  description = "The VPC in which the EC2 instance will be deployed"
}

variable "webapp_ruleno" {
  type        = "string"
  default     = 88
  description = "The rule number as seen by the ALB listener"
}

variable "webapp" {
  type        = "string"
  description = "The FQDN of the hostname that checks the vestion in consul"
}
