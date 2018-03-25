# Command Line Interface

`Terraform-deck` provides a command line interface written with go to interact
with the API. The CLI can be downloaded from the 
[project release page](https://github.com/gregoryguillou/terraform-deck/releases).
To know more about it, run one of the commands below:

```shell
deck help
deck <command> help
```

> **Note:** For obvious reasons, Terraform-deck requires you connect to the API. In order
  to to that you must have an API key as well as the API endpoint. Assuming you
  want to store those informations in the $HOME/.deck directory, you can run
  `deck configure` to do it.