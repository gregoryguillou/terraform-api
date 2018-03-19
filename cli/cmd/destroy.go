package cmd

import (
	"errors"
	"fmt"

	"github.com/spf13/cobra"
)

var destroyCmd = &cobra.Command{
	Use:   "destroy",
	Short: "Destroys terraform resources",
	Long: `
	Destroys terraform resources for the current workspace.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if workspace == "" || project == "" {
			return errors.New("You must set the project and workspace")
		}
		payload := map[string]string{"action": "destroy"}
		_, err := post(fmt.Sprintf("/projects/%s/workspaces/%s", project, workspace), payload)
		return err
	},
}

func init() {
	rootCmd.AddCommand(destroyCmd)
	destroyCmd.Flags().StringVarP(&workspace, "workspace", "w", "", "workspace to show")
	destroyCmd.Flags().StringVarP(&project, "project", "p", "", "project to show")
}
