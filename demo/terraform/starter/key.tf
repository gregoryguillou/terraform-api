resource "consul_keys" "alive" {
  key {
    name    = "alive"
    path    = "environment/${terraform.workspace}"
    default = "true"
  }
}