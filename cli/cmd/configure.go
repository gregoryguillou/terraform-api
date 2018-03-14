package cmd

import (
	"fmt"
	"net/http"
	"io/ioutil"
	"encoding/json"
	"os"
	"path"

	"github.com/spf13/cobra"
)

type config struct {
	endpoint string
  apikey string
}

func readConfiguration() config {

	endpoint := ""
	fmt.Print("Lineup Endpoint (default: http://localhost:10010): ")
	fmt.Scanln(&endpoint)
	if endpoint == "" {
		endpoint = "http://localhost:10010"
	}
	lastCharacter := endpoint[len(endpoint)-1:]
  if lastCharacter == "/" {
		endpoint = endpoint[:len(endpoint)-1]
	}

	fmt.Print("Lineup API Key: ")
	apikey := ""
	fmt.Scanln(&apikey)
	cfg := config{endpoint: endpoint, apikey: apikey}

	return cfg
}

func saveConfiguration(cfg config) error {

	home := os.Getenv("HOME")
	if home == "" {
		home = os.Getenv("HOMEPATH")
	}

	if _, err := os.Stat(path.Join(home, ".lineup")); os.IsNotExist(err) {
		os.Mkdir(path.Join(home, ".lineup"), 0700)
	}

	d1 := []byte("endpoint=\"" + cfg.endpoint + "\"\nkey=\"" + cfg.apikey + "\"\n")
	err := ioutil.WriteFile(
		path.Join(home, ".lineup", "credentials"), d1, 0600)
	return err
}

func testConfiguration(cfg config) error {
	client := &http.Client{
		CheckRedirect: nil,
	}
	req, err := http.NewRequest("GET", cfg.endpoint + "/login", nil)
	if err != nil { return err }

	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", "Key "+ cfg.apikey)
	resp, err := client.Do(req)
	if err != nil { return err }

	data, err := ioutil.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil { return err }

	var dat map[string]interface{}

	if err = json.Unmarshal(data, &dat); err != nil { return err }
	req, err = http.NewRequest("GET", "http://localhost:10010/user", nil)
	if err != nil { return err }

	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", dat["token"]))

	resp, err = client.Do(req)
	if err != nil { return err }

	data, err = ioutil.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil { return err }

	if err := json.Unmarshal(data, &dat); err != nil { return err }

	return nil
}

var configureCmd = &cobra.Command{
	Use:   "configure",
	Short: "Configures lineup",
	Long: `
	Configures lineup with an API token and endpoint.
`,
	Run: func(cmd *cobra.Command, args []string) {

		cfg := readConfiguration()
		err := testConfiguration(cfg)
		if err != nil {
			fmt.Println("ERROR: Cannot connect to the API, make sure the endpoint and api keys are valid...")
		} else {
			err = saveConfiguration(cfg)
			if err != nil {panic(err)}	
		}
	},
}

func init() {
	rootCmd.AddCommand(configureCmd)
}
