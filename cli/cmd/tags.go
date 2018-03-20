package cmd

import (
	"errors"
	"fmt"

	"github.com/spf13/cobra"
)

var tagsCmd = &cobra.Command{
	Use:   "tags",
	Short: "Lists project tags",
	Long: `
	Lists tags that can be used to run the apply command.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if project == "" {
			return errors.New("You must set the project")
		}
		_ = get(fmt.Sprintf("/projects/%s/tags", project), true)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(tagsCmd)
	tagsCmd.Flags().StringVarP(&project, "project", "p", "", "project to show")
}
