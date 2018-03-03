#!/usr/bin/env bash

set -e

if [[ "${NODE_ENV}" == "test" ]]; then
   printf "Starting in test mode..."
   mv config/settings-template.yaml config/settings.yaml
fi

if [[ -n "$CONSUL_IP" ]]; then echo "${CONSUL_IP} consul" >> /etc/hosts; fi

npm start