package cmd

import (
	"github.com/spf13/cobra"
)

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Displays deck versions",
	Long: `
	Displays deck versions on the client and on the server.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		_, err := get("/version", true)
		return err
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
}
