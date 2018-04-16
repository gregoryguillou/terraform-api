package cmd

import (
	"errors"
	"fmt"

	"github.com/spf13/cobra"
)

var appversionCmd = &cobra.Command{
	Use:   "appversion",
	Short: "Displays the project/workspace version",
	Long: `
	Run the version script and display it. It is actually not
	linked to terraform but helps to figure out what is running
	in real on the workspace.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if workspace == "" || project == "" {
			return errors.New("You must set the project and workspace")
		}
		_ = get(fmt.Sprintf("/projects/%s/workspaces/%s/version", project, workspace), true)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(appversionCmd)
	appversionCmd.Flags().StringVarP(&workspace, "workspace", "w", "", "workspace to show")
	appversionCmd.Flags().StringVarP(&project, "project", "p", "", "project to show")
}
