resource "consul_key_prefix" "myapp_config" {
  path_prefix = "environment/${terraform.workspace}/"

  subkeys = {
    "alive"   = "yes"
    "version" = "v0.0.3"
  }
}
