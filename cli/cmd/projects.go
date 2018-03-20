package cmd

import (
	"github.com/spf13/cobra"
)

var projectsCmd = &cobra.Command{
	Use:   "projects",
	Short: "List existing projects",
	Long: `
	Lists existing projects
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		_ = get("/projects", true)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(projectsCmd)
}
