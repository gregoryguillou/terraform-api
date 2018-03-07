package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var workspacelistCmd = &cobra.Command{
	Use:   "list",
	Short: "Lists all workspaces",
	Long: `
	Lists all workspaces for the selected project.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("workspace list called")
	},
}

func init() {
	workspaceCmd.AddCommand(workspacelistCmd)
}
