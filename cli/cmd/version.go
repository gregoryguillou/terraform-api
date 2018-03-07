package cmd

import (
	"fmt"
	"net/http"
	"io/ioutil"
	"log"
	"github.com/spf13/cobra"
)

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Displays lineup versions",
	Long: `
	Displays lineup versions on the client and on the server.
`,
	Run: func(cmd *cobra.Command, args []string) {
		client := &http.Client{
			CheckRedirect: nil,
		}
		req, err := http.NewRequest("GET", "http://localhost:10010/login", nil)
		if err != nil {
			log.Fatal(err)
		}
		req.Header.Add("Accept", "application/json")
		req.Header.Add("Authorization", "Key bm9wcXJzdHV2d3h5ego=")
		resp, err := client.Do(req)
		if err != nil {
			log.Fatal(err)
		}
		data, err := ioutil.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			log.Fatal(err)
		}
		fmt.Printf("%s", data)
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
}
