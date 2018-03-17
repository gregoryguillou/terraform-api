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

func check(project string, workspace string) (map[string]interface{}, error) {
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

	payload := map[string]string{"action": "check"}
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

var checkCmd = &cobra.Command{
	Use:   "check",
	Short: "Verifies the infrastructure state",
	Long: `
	Verifies the infrastructure state matches the targeted terraform
	state and provides some extra-informations. It includes the status
	returned by the quick check as well as the last apply or destroy
	command and its result.
`,
	Run: func(cmd *cobra.Command, args []string) {
		dat, _ := check(project, workspace)
		s, _ := prettyjson.Marshal(dat)
    fmt.Println(string(s))
	},
}

func init() {
	rootCmd.AddCommand(checkCmd)
	checkCmd.Flags().StringVarP(&workspace, "workspace", "w", "", "workspace to show")
	checkCmd.Flags().StringVarP(&project, "project", "p", "", "project to show")
}
