package main

import (
	"github.com/gregoryguillou/terraform-api/cli/cmd"
)

var version string

func main() {
	cmd.Execute(version)
}
