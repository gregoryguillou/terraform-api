package cmd

import (
	"errors"
	"fmt"

	"github.com/spf13/cobra"
)

var branchesCmd = &cobra.Command{
	Use:   "branches",
	Short: "Lists project branches",
	Long: `
	Lists branches that can be used to run the apply command.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if project == "" {
			return errors.New("You must set the project")
		}
		_ = get(fmt.Sprintf("/projects/%s/branches", project), true)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(branchesCmd)
	branchesCmd.Flags().StringVarP(&project, "project", "p", "", "project to show")
}
