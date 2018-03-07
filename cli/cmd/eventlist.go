package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var eventlistCmd = &cobra.Command{
	Use:   "list",
	Short: "Lists events",
	Long: `
	Lists events for the current workspace.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("eventslist called")
	},
}

func init() {
	eventCmd.AddCommand(eventlistCmd)
}
