package cmd

import (
	"errors"
	"fmt"

	"github.com/spf13/cobra"
)

var workspacesCmd = &cobra.Command{
	Use:   "workspaces",
	Short: "Manages Terraform API workspaces",
	Long: `
	Lists, shows details Terraform API workspaces. This command also set the
	default workspace.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if project == "" {
			return errors.New("You must set the project")
		}
		_ = get(fmt.Sprintf("/projects/%s/workspaces", project), true)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(workspacesCmd)
	workspacesCmd.Flags().StringVarP(&project, "project", "p", "", "project to show")
}
