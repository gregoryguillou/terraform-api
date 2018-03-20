package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Displays deck versions",
	Long: `
	Displays deck versions on the client and on the server.
`,
	RunE: func(cmd *cobra.Command, args []string) error {
		data := get("/version", false)
		fmt.Println(fmt.Sprintf("client: %s", version))
		fmt.Println(fmt.Sprintf("server: %s", data["version"]))
		return nil
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
}
