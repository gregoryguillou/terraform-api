package main

import (
	"os"
	"fmt"
	"../.."
)

// https://github.com/spf13/cobra
// https://mycodesmells.com/post/building-cli-tools-in-go-with-cobra

func main() {
	if err := hello.RootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
  }
}
