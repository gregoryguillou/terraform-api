package main

import (
	"github.com/gregoryguillou/terraform-lineup/cli/cmd"
)

var version string

func main() {
	cmd.Execute(version)
}
