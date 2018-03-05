#!/usr/bin/env bash

PROJECT_DIR=$(realpath $(dirname ${BASH_SOURCE[0]})/..)
WORKSPACE=${WORKSPACE:-default}
export PATH=/app:$PATH

$PROJECT_DIR/bin/git-sync.sh
cd /github/repository/demo/terraform/starter

terraform init -get-plugins=true >/dev/null 2>&1 || \
  (printf "Error with terraform initialization\n"; exit 1)

terraform workspace select $WORKSPACE >/dev/null 2>&1 || \
  terraform workspace new $WORKSPACE >/dev/null 2>&1

terraform plan -detailed-exitcode
RETURN=$?

terraform workspace select default >/dev/null

exit ${RETURN}