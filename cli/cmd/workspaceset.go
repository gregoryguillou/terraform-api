package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var workspacesetCmd = &cobra.Command{
	Use:   "set",
	Short: "Sets the current workspace",
	Long: `
	Sets the current workspace for the current project.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("workspace set called")
	},
}

func init() {
	workspaceCmd.AddCommand(workspacesetCmd)
}
