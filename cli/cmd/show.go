package cmd

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/hokaccha/go-prettyjson"
	"github.com/spf13/cobra"
)

func workspaceShow(project string, workspace string) (map[string]interface{}, error) {
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

	req, err := http.NewRequest("GET", fmt.Sprintf("%s/projects/%s/workspaces/%s", cfg.endpoint, project, workspace), nil)
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

var workspace, project string

var showCmd = &cobra.Command{
	Use:   "show",
	Short: "Shows properties of a workspace",
	Long: `
	Shows properties of a workspace.
`,
	Run: func(cmd *cobra.Command, args []string) {
		dat, _ := workspaceShow(project, workspace)
		s, _ := prettyjson.Marshal(dat)
		fmt.Println(string(s))
	},
}

func init() {
	rootCmd.AddCommand(showCmd)
	showCmd.Flags().StringVarP(&workspace, "workspace", "w", "", "workspace to show")
	showCmd.Flags().StringVarP(&project, "project", "p", "", "project to show")
}
