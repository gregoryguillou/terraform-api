package cmd

import (
	"github.com/spf13/cobra"
)

var infoCmd = &cobra.Command{
	Use:   "info",
	Short: "Provides API settings",
	Long: `
	Provides API settings for the current user.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		_ = get("/user", true)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(infoCmd)
}
