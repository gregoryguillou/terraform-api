#!/usr/bin/env bash

set -e

PROJECT_DIR=$(realpath $(dirname ${BASH_SOURCE[0]})/..)
WORKSPACE=${WORKSPACE:-default}
export PATH=/app:$PATH

$PROJECT_DIR/bin/git-sync.sh
cd /github/repository/${GITHUB_DIRECTORY}

terraform init -get-plugins=true >/dev/null 2>&1 || \
  (printf "Error with terraform initialization\n"; exit 1)

terraform workspace select $WORKSPACE >/dev/null || \
  terraform workspace new $WORKSPACE >/dev/null

terraform destroy -force

terraform workspace select default >/dev/null
