package cmd

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/hokaccha/go-prettyjson"
	"github.com/spf13/cobra"
)

func logsShow(event string) (map[string]interface{}, error) {
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

	req, err := http.NewRequest("GET", fmt.Sprintf("%s/events/%s/logs", cfg.endpoint, event), nil)
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
	if resp.StatusCode == 200 {
		if err := json.Unmarshal(data, &dat); err != nil {		
			panic(err)
		}
		return dat, nil
	}
	if resp.StatusCode == 404 {
		err := fmt.Errorf(fmt.Sprintf("Event %s not found", event))
		return nil, err
	} 
	err = fmt.Errorf(fmt.Sprintf("Unknown error %d", resp.StatusCode))
	return nil, err
}

var textOutput bool

var logsCmd = &cobra.Command{
	Use:   "logs",
	Short: "Queries deck logs",
	Long: `
	Queries deck logs associated with events and previously executed
	commands.
`,
	Run: func(cmd *cobra.Command, args []string) {
		dat, err := logsShow(event)
		if err != nil {
			panic(err)
		}
		if !textOutput {
			s, _ := prettyjson.Marshal(dat)
			fmt.Println(string(s))
		} else {
			var x map[string]interface{}
			for v := range dat["logs"].([]interface{}) {
				x = dat["logs"].([]interface{})[v].(map[string]interface{})
				fmt.Println(x["text"])
			}
		}
	},
}

func init() {
	rootCmd.AddCommand(logsCmd)
	logsCmd.Flags().StringVarP(&event, "event", "e", "", "event to query logs from")
	logsCmd.Flags().BoolVarP(&textOutput, "text", "t", false, "Display as a text")
}
