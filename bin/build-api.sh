#!/usr/bin/env bash

set -e

PROJECT_DIR="$(git rev-parse --show-toplevel)"

TEST=$(grep -i "^build:" ${PROJECT_DIR}/stack/.ci.yml | grep "enabled" | wc -l)

if [[ "$TEST" -ne 1 ]]; then
   printf "Docker builds are not enabled: Skipping..\n"
   printf "  Add \"build: enabled\" to stack/.ci.yml\n"
   exit 0
fi

cd ${PROJECT_DIR}/stack
npm install
npx run build
