package cmd

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"github.com/spf13/cobra"
)

func versionService() {
	cfg, err:=loadConfiguration()
	if err == nil {
		token, err:=connectAPI(cfg)
		if err == nil {
			client := &http.Client{
				CheckRedirect: nil,
			}
			req, err := http.NewRequest("GET", fmt.Sprintf("%s/version", cfg.endpoint), nil)
			if err != nil {
				log.Fatal(err)
			}
			var dat map[string]interface{}
			req.Header.Add("Accept", "application/json")
			req.Header.Add("Authorization", token)
			resp, err := client.Do(req)
			if err != nil {
				log.Fatal(err)
			}
			data, err := ioutil.ReadAll(resp.Body)
			
			resp.Body.Close()
			if err != nil {
				log.Fatal(err)
			}
	
			if err := json.Unmarshal(data, &dat); err != nil {
				panic(err)
			}

			fmt.Println("Client:", version)
			fmt.Println("Server:", fmt.Sprintf("%s", dat["version"]))
			
		}
	}
}
var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Displays deck versions",
	Long: `
	Displays deck versions on the client and on the server.
`,
	Run: func(cmd *cobra.Command, args []string) {
		  versionService()
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
}
