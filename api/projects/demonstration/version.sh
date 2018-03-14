#!/usr/bin/env bash

WORKSPACE=${WORKSPACE:-staging}

RED='\033[0;31m'
GREEN='\033[1;32m'
NC='\033[0m'
i=0
while true; do
  VERSION=$(curl --silent http://consul:8500/v1/kv/environment/${WORKSPACE}/version\?raw\=true 2>/dev/null)
  if [[ -z "$VERSION" ]]; then
    printf "${RED}.${NC}"
  elif [[ "$VERSION" == "v0.0.2" ]]; then
    printf "${RED}${VERSION}.${NC}"
  else
    printf "${GREEN}${VERSION}.${NC}"
  fi
  sleep 1
  if [[ "$i" -gt 256 ]]; then
    i=0
    printf "\n"
  fi
  i=$(($i + 1))
done
