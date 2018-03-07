package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var planCmd = &cobra.Command{
	Use:   "plan",
	Short: "Plans terraform resources",
	Long: `
	Plans terraform resources changes that are required to the infrastructure
	accordingly to the current workspace settings.

	The infrastructure and its targeted state are determined by the 
	project repository and directory. It also depends on the workspace
	name, parameters and the selected tag or branch. Plan relies on the 
	terraform apply command to evaluates the changes that are required 
	to the infrastructure.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("plan called")
	},
}

func init() {
	rootCmd.AddCommand(planCmd)
}
