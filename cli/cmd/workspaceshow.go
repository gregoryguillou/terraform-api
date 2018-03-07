package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var workspaceshowCmd = &cobra.Command{
	Use:   "show",
	Short: "Shows properties of a workspace",
	Long: `
	Shows properties of a workspace for a project or for the current
	project.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("workspace show called")
	},
}

func init() {
	workspaceCmd.AddCommand(workspaceshowCmd)
}
