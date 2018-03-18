#!/usr/bin/env bash

curl -L -s https://github.com/golang/dep/releases/download/v0.4.1/dep-linux-amd64 \
  -o $GOPATH/bin/dep

chmod +x $GOPATH/bin/dep

PROJECT_DIR="$(git rev-parse --show-toplevel)"

cd ${PROJECT_DIR}/cli
mkdir -p build
dep ensure

make all
