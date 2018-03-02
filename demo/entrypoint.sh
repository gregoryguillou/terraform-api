#!/usr/bin/env bash

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
