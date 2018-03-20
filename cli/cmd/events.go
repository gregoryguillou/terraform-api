package cmd

import (
	"errors"
	"fmt"

	"github.com/spf13/cobra"
)

var event string

var eventsCmd = &cobra.Command{
	Use:   "events",
	Short: "Lists and details deck events",
	Long: `
	Lists and details deck events.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if event == "" {
			return errors.New("You must set an event")
		}
		_ = get(fmt.Sprintf("/events/%s", event), true)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(eventsCmd)
	eventsCmd.Flags().StringVarP(&event, "event", "e", "", "event to query")
}
