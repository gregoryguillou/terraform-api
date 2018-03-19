package cmd

import (
	"errors"
	"fmt"

	"github.com/spf13/cobra"
)

// cleanCmd represents the clean command
var cleanCmd = &cobra.Command{
	Use:   "clean",
	Short: "Cleans a workspace",
	Long: `Cleans a workspace, when one of the previous apply or 
	destroy has failed and its state remains pending to avoid
	concurrent access.
	`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if workspace == "" || project == "" {
			return errors.New("You must set the project and workspace")
		}
		payload := map[string]string{"action": "clean"}
		_, err := post(fmt.Sprintf("/projects/%s/workspaces/%s", project, workspace), payload)
		return err
	},
}

func init() {
	rootCmd.AddCommand(cleanCmd)
	cleanCmd.Flags().StringVarP(&workspace, "workspace", "w", "", "workspace to show")
	cleanCmd.Flags().StringVarP(&project, "project", "p", "", "project to show")
}
