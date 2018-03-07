package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var projectSetCmd = &cobra.Command{
	Use:   "set",
	Short: "Sets the current project",
	Long: `
	Sets the current project for the API.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("project set called")
	},
}

func init() {
	projectCmd.AddCommand(projectSetCmd)
}
