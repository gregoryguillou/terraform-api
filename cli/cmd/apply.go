package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var applyCmd = &cobra.Command{
	Use:   "apply",
	Short: "Builds or changes terraform resources",
	Long: `
	Builds or changes terraform resources accordingly to the current
	workspace settings.

	The infrastructure and its targeted state are determined by the
	project repository and directory. It also depends on the workspace
	name, parameters and the selected tag or branch. Apply set the
	correct state on the server based on those values and relies on
	terraform apply command to build or change the infrastructure.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("apply called")
	},
}

func init() {
	rootCmd.AddCommand(applyCmd)
}
