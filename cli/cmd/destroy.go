package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var destroyCmd = &cobra.Command{
	Use:   "destroy",
	Short: "Destroys terraform resources",
	Long: `
	Destroys terraform resources for the current workspace.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("destroy called")
	},
}

func init() {
	rootCmd.AddCommand(destroyCmd)
}
