package cmd

import (
	"errors"
	"fmt"
	"github.com/spf13/cobra"
)

var textOutput bool

var logsCmd = &cobra.Command{
	Use:   "logs",
	Short: "Queries deck logs",
	Long: `
	Queries deck logs associated with events and previously executed
	commands.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		if event == "" {
			return errors.New("You must set an event")
		}
		dat, err := get(fmt.Sprintf("/events/%s/logs", event), !textOutput)
		if !textOutput {
			var x map[string]interface{}
			for v := range dat["logs"].([]interface{}) {
				x = dat["logs"].([]interface{})[v].(map[string]interface{})
				fmt.Println(x["text"])
			}
		}
		return err
	},
}

func init() {
	rootCmd.AddCommand(logsCmd)
	logsCmd.Flags().StringVarP(&event, "event", "e", "", "event to query logs from")
	logsCmd.Flags().BoolVarP(&textOutput, "text", "t", false, "Display as a text")
}
