package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var logCmd = &cobra.Command{
	Use:   "log",
	Short: "Queries lineup logs",
	Long: `
	Queries lineup logs associated with events and previously executed
	commands.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("log called")
	},
}

func init() {
	rootCmd.AddCommand(logCmd)
}
