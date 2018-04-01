# Command Line Interface

`Terraform API` provides a command line interface written with go to interact
with the API. The CLI can be downloaded from the 
[project release page](https://github.com/gregoryguillou/terraform-api/releases).
To know more about it, run one of the commands below:

```shell
terraform-api help
terraform-api <command> help
```

> **Note:** For obvious reasons, cli requires you connect to the API. In order
  to to that you must have an API key as well as the API endpoint. Assuming you
  want to store those informations in the $HOME/.terraform-api directory, you can run
  `terraform-api configure` to do it.