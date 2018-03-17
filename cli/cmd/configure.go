package cmd

import (
	"bufio"
	"fmt"
	"net/http"
	"io"
	"io/ioutil"
	"encoding/json"
	"os"
	"path"
	"strings"
	
	"github.com/spf13/cobra"
)

type config struct {
	endpoint string
  apikey string
}

func readConfiguration() config {

	endpoint := ""
	fmt.Print("Deck Endpoint (default: http://localhost:10010): ")
	fmt.Scanln(&endpoint)
	if endpoint == "" {
		endpoint = "http://localhost:10010"
	}
	lastCharacter := endpoint[len(endpoint)-1:]
  if lastCharacter == "/" {
		endpoint = endpoint[:len(endpoint)-1]
	}

	fmt.Print("Deck API Key: ")
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

	if _, err := os.Stat(path.Join(home, ".deck")); os.IsNotExist(err) {
		os.Mkdir(path.Join(home, ".deck"), 0700)
	}

	d1 := []byte("endpoint=\"" + cfg.endpoint + "\"\napikey=\"" + cfg.apikey + "\"\n")
	err := ioutil.WriteFile(
		path.Join(home, ".deck", "credentials"), d1, 0600)
	return err
}

func trimQuotes(s string) string {
	if len(s) >= 2 {
			if s[0] == '"' && s[len(s)-1] == '"' {
					return s[1 : len(s)-1]
			}
	}
	return s
}

func loadConfiguration() (config, error) {

	home := os.Getenv("HOME")
	if home == "" {
		home = os.Getenv("HOMEPATH")
	}
	
	filename := path.Join(home, ".deck", "credentials")
	cfg := config{endpoint: "", apikey: ""}

	if len(filename) == 0 {
			return cfg, nil
	}

	file, err := os.Open(filename)
	if err != nil {
			return cfg, err
	}
	defer file.Close()

	reader := bufio.NewReader(file)

	for {
			line, err := reader.ReadString('\n')
			if equal := strings.Index(line, "="); equal >= 0 {
					if key := strings.TrimSpace(line[:equal]); len(key) > 0 {
							value := ""
							if len(line) > equal {
									value = strings.TrimSpace(line[equal+1:])
							}
							if key == "endpoint" { 
								cfg.endpoint = trimQuotes(value)
  						} else if key == "apikey" { 
								cfg.apikey = trimQuotes(value)
							}
					}
			}
			if err == io.EOF {
					break
			}
			if err != nil {
					return cfg, err
			}
	}
  return cfg, nil
}

func testConfiguration(cfg config) (string, error) {
	token, err := connectAPI(cfg)
	client := &http.Client{
		CheckRedirect: nil,
	}
	req, err := http.NewRequest("GET", "http://localhost:10010/user", nil)
	if err != nil { return "", err }

	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", token)

	resp, err := client.Do(req)
	if err != nil { return "", err }

	data, err := ioutil.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil { return "", err }

	var dat map[string]interface{}
	if err = json.Unmarshal(data, &dat); err != nil { return "", err }

	username := fmt.Sprintf("%s", dat["username"])
	return username, nil
}

func connectAPI(cfg config) (string, error) {

	client := &http.Client{
		CheckRedirect: nil,
	}
	req, err := http.NewRequest("GET", cfg.endpoint + "/login", nil)
	if err != nil { return "", err }

	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", "Key "+ cfg.apikey)

	resp, err := client.Do(req)
	if err != nil { return "", err }

	data, err := ioutil.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil { return "", err }

	var dat map[string]interface{}

	if err = json.Unmarshal(data, &dat); err != nil { return "", err }

	token := fmt.Sprintf("Bearer %s", dat["token"])
  return token, nil

}

var configureCmd = &cobra.Command{
	Use:   "configure",
	Short: "Configures deck",
	Long: `
	Configures deck with an API token and endpoint.
`,
	Run: func(cmd *cobra.Command, args []string) {

		cfg := readConfiguration()
		username, err := testConfiguration(cfg)
		if err != nil {
			fmt.Println("ERROR: Cannot connect to the API, make sure the endpoint and api keys are valid...")
		} else {
			fmt.Println(fmt.Sprintf("SUCCESS: You are connected as %s...", username))
			err = saveConfiguration(cfg)
			if err != nil {panic(err)}	
		}
	},
}

func init() {
	rootCmd.AddCommand(configureCmd)
}
