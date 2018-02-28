terraform {
  backend "consul" {
    address = "consul:8500"
    path    = "terraform/starter"
  }
}
