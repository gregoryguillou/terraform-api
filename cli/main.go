package main

import (
	"github.com/gregoryguillou/terraform-deck/cli/cmd"
)

var version string

func main() {
	cmd.Execute(version)
}
