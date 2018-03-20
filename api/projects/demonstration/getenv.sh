#!/usr/bin/env bash

PROJECT_DIR="$(git rev-parse --show-toplevel)"
cd ${PROJECT_DIR}/api
export CONSUL=$(node projects/demonstration/consul.js)

echo "CONSUL=${CONSUL}"
