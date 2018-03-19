package cmd

import (
	"errors"
	"fmt"

	"github.com/spf13/cobra"
)

var applyCmd = &cobra.Command{
	Use:   "apply",
	Short: "Builds or changes terraform resources",
	Long: `
	Builds or changes terraform resources accordingly to the current
	workspace settings.

	The infrastructure and its targeted state are determined by the
	project repository and directory. It also depends on the workspace
	name, parameters and the selected tag or branch. Apply set the
	correct state on the server based on those values and relies on
	terraform apply command to build or change the infrastructure.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if workspace == "" || project == "" {
			return errors.New("You must set the project and workspace")
		}
		payload := map[string]string{"action": "apply"}
		_, err := post(fmt.Sprintf("/projects/%s/workspaces/%s", project, workspace), payload)
		return err
	},
}

func init() {
	rootCmd.AddCommand(applyCmd)
	applyCmd.Flags().StringVarP(&workspace, "workspace", "w", "", "workspace to show")
	applyCmd.Flags().StringVarP(&project, "project", "p", "", "project to show")
}
