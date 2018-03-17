package cmd

import (
  "testing"
)

func TestWorkspaceShow(t *testing.T) {
  p := "demonstration"
	w := "staging"
	data, err:=workspaceShow(p, w)

  if err != nil {
    t.Error("Unexpected error")
  }
  if data["project"] != "demonstration" {
    t.Error("Expected demonstration project")
	}
	if data["workspace"] != "staging" {
    t.Error("Expected staging workspace")
  }
}
