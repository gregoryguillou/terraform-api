#!/usr/bin/env bash

function usage() {
  echo "Usage: $0 [(-c|--command) command] [(-r|--reference) reference] \\"
  echo "             [(-w|--workspace) workspace]  [((-t|--tag) tag | (-b|--branch) branch)] \\"
  echo "             [-h|--help] [-v|--version]"
  exit 1
}

function version() {
  echo "terraform-api version 0.1.8"
  exit 0
}

COMMAND=list
WORKSPACE=default
REF=branch:master
HELP=false
VERSION=false

TEMP=$(getopt -o c:w:r:t:b:hv --long command:,workspace:,reference:,tag:,branch:,help,version -n 'terraform-api' -- "$@")
eval set -- "$TEMP"

while true ; do
  case "$1" in
    -b|--branch) TAG=$2 ; shift 2;;
    -c|--command) COMMAND=$2 ; shift 2 ;;
    -h|--help) HELP=true ; shift ;;
    -r|--reference) REF=$2; shift 2 ;;
    -t|--tag) TAG=$2 ; shift 2;;
    -v|--version) VERSION=true ; shift ;;
    -w|--workspace) WORKSPACE=$2 ; shift 2 ;;
    --) shift ; break ;;
    *) echo usage ; exit 1 ;;
  esac
done

if [[ -n "$CONSUL_IP" ]]; then echo "${CONSUL_IP} consul" >> /etc/hosts; fi

# do something with the variables -- in this case the lamest possible one :-)
if [[ "$HELP" == "true" ]]; then
  usage
elif [[ "$VERSION" == "true" ]]; then
  version
elif [[ "$COMMAND" == "apply" || "$COMMAND" == "destroy" || "$COMMAND" == "list" || "$COMMAND" == "check" ]]; then
  if [[ -n "$REF" && -z "$TAG" && -z "$BRANCH" ]]; then
    TYPREF=$(echo "$REF" | cut -d':' -f1)
    LABREF=$(echo "$REF" | cut -d':' -f2)
    if [[ "$TYPREF" == "tag" ]]; then
      export TAG="$LABREF"
    elif [[ "$TYPREF" == "branch" ]]; then
      export BRANCH="$LABREF"
    fi
  fi
  WORKSPACE=${WORKSPACE} TAG=${TAG} BRANCH=${BRANCH} bin/"${COMMAND}".sh
else
  usage
fi
