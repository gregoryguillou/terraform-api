package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var workspaceCmd = &cobra.Command{
	Use:   "workspace",
	Short: "Manages lineup workspaces",
	Long: `
	Lists, shows details lineup workspaces. This command also set the
	default workspace.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("workspace called")
	},
}

func init() {
	rootCmd.AddCommand(workspaceCmd)
}
