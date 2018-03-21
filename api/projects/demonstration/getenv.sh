#!/usr/bin/env bash

set -e

PROJECT_DIR="$(git rev-parse --show-toplevel)"
cd ${PROJECT_DIR}/api
export CONSUL=$(node projects/demonstration/consul.js)

printf "CONSUL=${CONSUL}"
