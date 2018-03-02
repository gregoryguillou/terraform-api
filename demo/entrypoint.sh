#!/usr/bin/env bash

# This command the the container that act as consul in our docker compose stack
# docker ps -f "label=lineup.role=consul" -f status=running --format "{{.ID}}"

# This commands get the network named used by container 8924a37d125a
# docker inspect 8924a37d125a | jq -r ".[0].NetworkSettings.Networks | to_entries | .[0].key"
# export BRIDGE=stack_default
# CONSUL=$(docker inspect 8924a37d125a | jq -r ".[0].NetworkSettings.Networks.${BRIDGE}.Gateway")
# curl ${CONSUL}:8500/v1/catalog/nodes

function usage() {
  echo "Usage: $0 [(-c|--command) command] [(-r|--reference) reference] \\"
  echo "             [(-w|--workspace) workspace] [-h|--help] [-v|--version]"
	exit 1
}

function version() {
  echo "lineup-terraform version 0.0.1"
	exit 0
}

COMMAND=list
WORKSPACE=default
REF=branch:master
HELP=false
VERSION=false

TEMP=`getopt -o c:w:r:hv --long command:,workspace:,reference:,help,version -n 'lineup' -- "$@"`
eval set -- "$TEMP"

while true ; do
  case "$1" in
    -c|--command) COMMAND=$2 ; shift 2 ;;
    -w|--workspace) WORKSPACE=$2 ; shift 2 ;;
    -r|--reference) REF=$2; shift 2 ;;
    -h|--help) HELP=true ; shift ;;
    -v|--version) VERSION=true ; shift ;;
    --) shift ; break ;;
    *) echo usage ; exit 1 ;;
  esac
done

if [[ -n $CONSUL_IP ]]; then echo "${CONSUL_IP} consul" >> /etc/hosts; fi

# do something with the variables -- in this case the lamest possible one :-)
if [[ "$HELP" == "true" ]]; then 
  usage 
elif [[ "$VERSION" == "true" ]]; then
  version 
elif [[ "$COMMAND" == "apply" || "$COMMAND" == "destroy" || "$COMMAND" == "list" ]]; then
  WORKSPACE=${WORKSPACE} bin/${COMMAND}.sh
fi
