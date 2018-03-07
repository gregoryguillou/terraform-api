package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var checkCmd = &cobra.Command{
	Use:   "check",
	Short: "Verifies the infrastructure state",
	Long: `
	Verifies the infrastructure state matches the targeted terraform
	state and provides some extra-informations. It includes the status
	returned by the quick check as well as the last apply or destroy
	command and its result.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("check called")
	},
}

func init() {
	rootCmd.AddCommand(checkCmd)
}
