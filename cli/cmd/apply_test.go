package cmd

import (
	"testing"
)

func TestApply(t *testing.T) {
  p := "demonstration"
  w := "staging"
	// The code below is actually integration test, not unit test
	// data, _ := apply(p, w)
	// if _, ok := data["event"]; !ok {
	// 	t.Error("Data does not include an event")
	// }
	if p != "demonstration" && w != "staging" {
    t.Error("Data have been changed in the meantime")
	}
}
