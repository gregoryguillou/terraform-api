package cmd

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/hokaccha/go-prettyjson"
	"github.com/spf13/cobra"
)

func workspaces(project string) (map[string]interface{}, error) {
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

	req, err := http.NewRequest("GET", fmt.Sprintf("%s/projects/%s/workspaces", cfg.endpoint, project), nil)
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

var workspacesCmd = &cobra.Command{
	Use:   "workspaces",
	Short: "Manages deck workspaces",
	Long: `
	Lists, shows details deck workspaces. This command also set the
	default workspace.
`,
	Run: func(cmd *cobra.Command, args []string) {
		dat, _ := workspaces(project)
		s, _ := prettyjson.Marshal(dat)
		fmt.Println(string(s))
	},
}

func init() {
	rootCmd.AddCommand(workspacesCmd)
	workspacesCmd.Flags().StringVarP(&project, "project", "p", "", "project to show")
}
