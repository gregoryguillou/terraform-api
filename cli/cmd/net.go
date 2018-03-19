package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/hokaccha/go-prettyjson"
)

func get(url string, display bool) (map[string]interface{}, error) {
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

	req, err := http.NewRequest("GET", fmt.Sprintf("%s%s", cfg.endpoint, url), nil)
	if err != nil {
		panic(err)
	}

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
		var dat map[string]interface{}
		if err := json.Unmarshal(data, &dat); err != nil {
			panic(err)
		}

		if display {
			s, _ := prettyjson.Marshal(dat)
			fmt.Println(string(s))
		}
		return dat, nil
	} 
	fmt.Println(string(data))
	return nil, nil
}

func post(url string, payload map[string]string) (map[string]interface{}, error) {
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

	jsonPayload, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST",
		fmt.Sprintf("%s%s", cfg.endpoint, url),
		bytes.NewReader(jsonPayload))
	if err != nil {
		panic(err)
	}

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

  if resp.StatusCode == 201 {
		var dat map[string]interface{}
		if err := json.Unmarshal(data, &dat); err != nil {
			panic(err)
		}

		s, _ := prettyjson.Marshal(dat)
		fmt.Println(string(s))
		return dat, nil
	}
	fmt.Println(string(data))
	return nil, nil
}
