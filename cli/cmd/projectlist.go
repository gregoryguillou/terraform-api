package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var projectListCmd = &cobra.Command{
	Use:   "list",
	Short: "Lists all projects",
	Long: `
	Lists all the available for the API.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("project list called")
	},
}

func init() {
	projectCmd.AddCommand(projectListCmd)
}
