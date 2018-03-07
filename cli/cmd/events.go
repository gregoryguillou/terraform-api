package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var eventCmd = &cobra.Command{
	Use:   "event",
	Short: "Lists and details lineup events",
	Long: `
	Lists and details lineup events.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("events called")
	},
}

func init() {
	rootCmd.AddCommand(eventCmd)
}
