package cmd

import (
	"fmt"
	"net/http"
	"log"
	"io/ioutil"
	"encoding/json"
	
	"github.com/spf13/cobra"
)

func applyService() {
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

var applyCmd = &cobra.Command{
	Use:   "apply",
	Short: "Builds or changes terraform resources",
	Long: `
	Builds or changes terraform resources accordingly to the current
	workspace settings.

	The infrastructure and its targeted state are determined by the
	project repository and directory. It also depends on the workspace
	name, parameters and the selected tag or branch. Apply set the
	correct state on the server based on those values and relies on
	terraform apply command to build or change the infrastructure.
`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("apply called")
	},
}

func init() {
	rootCmd.AddCommand(applyCmd)
}
