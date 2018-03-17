package cmd

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/hokaccha/go-prettyjson"
	"github.com/spf13/cobra"
)

func eventsShow(event string) (map[string]interface{}, error) {
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

	req, err := http.NewRequest("GET", fmt.Sprintf("%s/events/%s", cfg.endpoint, event), nil)
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

var event string

var eventsCmd = &cobra.Command{
	Use:   "events",
	Short: "Lists and details deck events",
	Long: `
	Lists and details deck events.
`,
	Run: func(cmd *cobra.Command, args []string) {
		dat, _ := eventsShow(event)
		s, _ := prettyjson.Marshal(dat)
		fmt.Println(string(s))
	},
}

func init() {
	rootCmd.AddCommand(eventsCmd)
	eventsCmd.Flags().StringVarP(&event, "event", "e", "", "event to query")
}
