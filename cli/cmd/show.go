package cmd

import (
	"errors"
	"fmt"

	"github.com/spf13/cobra"
)

var workspace, project string

var showCmd = &cobra.Command{
	Use:   "show",
	Short: "Shows properties of a workspace",
	Long: `
	Shows properties of a workspace.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if workspace == "" || project == "" {
			return errors.New("You must set the project and workspace")
		}
		_ = get(fmt.Sprintf("/projects/%s/workspaces/%s", project, workspace), true)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(showCmd)
	showCmd.Flags().StringVarP(&workspace, "workspace", "w", "", "workspace to show")
	showCmd.Flags().StringVarP(&project, "project", "p", "", "project to show")
}
