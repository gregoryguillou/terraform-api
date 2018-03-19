package cmd

import (
	"errors"
	"fmt"

	"github.com/spf13/cobra"
)

var checkCmd = &cobra.Command{
	Use:   "check",
	Short: "Requests a check on the workspace",
	Long: `
	Requests the check action to be executed on the workspace so that
	we can make sure it is applied and there is no difference between
	what was requested and what is current working.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if workspace == "" || project == "" {
			return errors.New("You must set the project and workspace")
		}
		payload := map[string]string{"action": "check"}
		_, err := post(fmt.Sprintf("/projects/%s/workspaces/%s", project, workspace), payload)
		return err
	},
}

func init() {
	rootCmd.AddCommand(checkCmd)
	checkCmd.Flags().StringVarP(&workspace, "workspace", "w", "", "workspace to show")
	checkCmd.Flags().StringVarP(&project, "project", "p", "", "project to show")
}
