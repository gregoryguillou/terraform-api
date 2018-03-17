package cmd

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/hokaccha/go-prettyjson"
	"github.com/spf13/cobra"
)

func workspaceShow() (map[string]interface{}, error) {
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

	req, err := http.NewRequest("GET", fmt.Sprintf("%s/projects/demonstration/workspaces/staging", cfg.endpoint), nil)
	if err != nil {
		panic(err)
	}

	var dat map[string]interface{}
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

var workspaceshowCmd = &cobra.Command{
	Use:   "show",
	Short: "Shows properties of a workspace",
	Long: `
	Shows properties of a workspace for a project or for the current
	project.
`,
	Run: func(cmd *cobra.Command, args []string) {
		dat, _ := workspaceShow()
		s, _ := prettyjson.Marshal(dat)
		fmt.Println(string(s))
	},
}

func init() {
	workspaceCmd.AddCommand(workspaceshowCmd)
}
