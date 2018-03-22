#!/usr/bin/env bash

set -e

PROJECT_DIR=$(dirname $(realpath -s $0))/../..

cd ${PROJECT_DIR}
export CONSUL=$(node projects/demonstration/consul.js)

printf "CONSUL=${CONSUL}"
