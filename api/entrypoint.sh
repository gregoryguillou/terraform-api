#!/usr/bin/env bash

set -e

if [[ "${NODE_ENV}" == "test" ]]; then
   printf "Starting in test mode..."
   mv config/settings-template.yaml config/settings.yaml
fi

npm start