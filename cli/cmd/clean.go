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

func clean(project string, workspace string) (map[string]interface{}, error) {
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

	payload := map[string]string{"action": "clean"}
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

// cleanCmd represents the clean command
var cleanCmd = &cobra.Command{
	Use:   "clean",
	Short: "Cleans a workspace",
	Long: `Cleans a workspace, when one of the previous apply or 
	destroy has failed and its state remains pending to avoid
	concurrent access.
	`,
	Run: func(cmd *cobra.Command, args []string) {
		dat, _ := clean(project, workspace)
		s, _ := prettyjson.Marshal(dat)
    fmt.Println(string(s))
	},
}

func init() {
	rootCmd.AddCommand(cleanCmd)
	cleanCmd.Flags().StringVarP(&workspace, "workspace", "w", "", "workspace to show")
	cleanCmd.Flags().StringVarP(&project, "project", "p", "", "project to show")
}
