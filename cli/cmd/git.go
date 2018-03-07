package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var gitCmd = &cobra.Command{
	Use:   "git",
	Short: "Lists project branches and tags",
	Long: `
	Lists project branches and tags that can be used to run the apply
	command.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("git called")
	},
}

func init() {
	rootCmd.AddCommand(gitCmd)
}
