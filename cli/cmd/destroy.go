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

func destroy(project string, workspace string) (map[string]interface{}, error) {
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

	payload := map[string]string{"action": "destroy"}
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

var destroyCmd = &cobra.Command{
	Use:   "destroy",
	Short: "Destroys terraform resources",
	Long: `
	Destroys terraform resources for the current workspace.
`,
	Run: func(cmd *cobra.Command, args []string) {
		dat, _ := destroy(project, workspace)
		s, _ := prettyjson.Marshal(dat)
    fmt.Println(string(s))
	},
}

func init() {
	rootCmd.AddCommand(destroyCmd)
	destroyCmd.Flags().StringVarP(&workspace, "workspace", "w", "", "workspace to show")
	destroyCmd.Flags().StringVarP(&project, "project", "p", "", "project to show")
}
