package cmd

import (
  "testing"
)

func TestVersionCmd(t *testing.T) {
  v := version
  if v != "undefined" {
    t.Error("Expected undefined version")
  }
}
