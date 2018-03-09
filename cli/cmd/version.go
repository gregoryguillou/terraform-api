package cmd

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

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
		var dat map[string]interface{}

		if err := json.Unmarshal(data, &dat); err != nil {
			panic(err)
		}
		req, err = http.NewRequest("GET", "http://localhost:10010/user", nil)
		if err != nil {
			log.Fatal(err)
		}
		req.Header.Add("Accept", "application/json")
		req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", dat["token"]))

		resp, err = client.Do(req)
		if err != nil {
			log.Fatal(err)
		}
		data, err = ioutil.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			log.Fatal(err)
		}

		if err := json.Unmarshal(data, &dat); err != nil {
			panic(err)
		}
		fmt.Println("Client:", version)
		fmt.Println("Server:", dat["username"])
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
}
