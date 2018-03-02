#!/usr/bin/env bash

# This command the the container that act as consul in our docker compose stack
# docker ps -f "label=lineup.role=consul" -f status=running --format "{{.ID}}"

# This commands get the network named used by container 8924a37d125a
# docker inspect 8924a37d125a | jq -r ".[0].NetworkSettings.Networks | to_entries | .[0].key"
# export BRIDGE=stack_default
# CONSUL=$(docker inspect 8924a37d125a | jq -r ".[0].NetworkSettings.Networks.${BRIDGE}.Gateway")
# curl ${CONSUL}:8500/v1/catalog/nodes

if [[ -n "${CONSUL_IP}" ]]; then
  echo "${CONSUL_IP} consul >> /etc/hosts"
fi

sleep 3600
