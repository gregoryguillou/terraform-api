package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var projectShowCmd = &cobra.Command{
	Use:   "show",
	Short: "Shows properties of a project",
	Long: `
	Shows properties of a  project for the API.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("project show called")
	},
}

func init() {
	projectCmd.AddCommand(projectShowCmd)
}
