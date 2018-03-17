package cmd

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/hokaccha/go-prettyjson"
	"github.com/spf13/cobra"
)

func tags(project string) (map[string]interface{}, error) {
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

	req, err := http.NewRequest("GET", fmt.Sprintf("%s/projects/%s/tags", cfg.endpoint, project), nil)
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
  fmt.Println(string(data[:]))
	if err := json.Unmarshal(data, &dat); err != nil {
		panic(err)
	}

	return dat, nil
}

var tagsCmd = &cobra.Command{
	Use:   "tags",
	Short: "Lists project tags",
	Long: `
	Lists tags that can be used to run the apply command.
`,
	Run: func(cmd *cobra.Command, args []string) {
		dat, _ := tags(project)
		s, _ := prettyjson.Marshal(dat)
		fmt.Println(string(s))
	},
}

func init() {
	rootCmd.AddCommand(tagsCmd)
	tagsCmd.Flags().StringVarP(&project, "project", "p", "", "project to show")
}
