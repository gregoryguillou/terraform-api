package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var projectCmd = &cobra.Command{
	Use:   "project",
	Short: "Manages lineup projects",
	Long: `
	Lists, shows details lineup projects. This command also set the
	default project.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("project called")
	},
}

func init() {
	rootCmd.AddCommand(projectCmd)
}
