package cmd

import (
	"bytes"
	"fmt"
	"net/http"
	"encoding/json"
	"io/ioutil"

	"github.com/hokaccha/go-prettyjson"
	"github.com/spf13/cobra"
)

func apply(project string, workspace string) (map[string]interface{}, error) {
	cfg, err := loadConfiguration()
	if err != nil {
		panic(err)
	}

	token, err := connectAPI(cfg)
	if err != nil {
		panic(err)
	}

	client := &http.Client{
		CheckRedirect: nil,
	}

	payload := map[string]string{"action": "apply"}
	jsonPayload, _ := json.Marshal(payload)

	req, err := http.NewRequest("POST",
		fmt.Sprintf("%s/projects/%s/workspaces/%s", cfg.endpoint, project, workspace), 
		bytes.NewReader(jsonPayload))
		if err != nil {
		  panic(err)
	  }

	var dat map[string]interface{}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", token)
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	data, err := ioutil.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil {
		panic(err)
	}

	if err := json.Unmarshal(data, &dat); err != nil {
		panic(err)
	}

	return dat, nil
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
		dat, _ := apply(project, workspace)
		s, _ := prettyjson.Marshal(dat)
    fmt.Println(string(s))
	},
}

func init() {
	rootCmd.AddCommand(applyCmd)
	applyCmd.Flags().StringVarP(&workspace, "workspace", "w", "", "workspace to show")
	applyCmd.Flags().StringVarP(&project, "project", "p", "", "project to show")
}
