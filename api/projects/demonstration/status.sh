#!/usr/bin/env bash

WORKSPACE=default

TEMP=$(getopt -o w: --long workspace: -n 'status' -- "$@")
eval set -- "$TEMP"

while true ; do
  case "$1" in
    -w|--workspace) WORKSPACE=$2 ; shift 2 ;;
    --) shift ; break ;;
    *) echo usage ; exit 1 ;;
  esac
done

OUTPUT=$(curl --silent "consul:8500/v1/kv/environment/${WORKSPACE}/version?raw=true" 2>/dev/null || true)

if [[ -n "${OUTPUT}" ]]; then
  printf "Environnement %s is running..." "${WORKSPACE}"
  exit 0
else
  printf "Environnement %s is stopped..." "${WORKSPACE}"
  exit 1
fi
