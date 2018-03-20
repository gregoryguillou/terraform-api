package cmd

import (
	"errors"
	"fmt"

	"github.com/spf13/cobra"
)

var statusCmd = &cobra.Command{
	Use:   "status",
	Short: "Runs quickcheck and display status",
	Long: `
	Run quickcheck and display status. It is useful to undestand
	the current status of a workspace and display the result of
	a check action.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if workspace == "" || project == "" {
			return errors.New("You must set the project and workspace")
		}
		_ = get(fmt.Sprintf("/projects/%s/workspaces/%s/status", project, workspace), true)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(statusCmd)
	statusCmd.Flags().StringVarP(&workspace, "workspace", "w", "", "workspace to show")
	statusCmd.Flags().StringVarP(&project, "project", "p", "", "project to show")
}
