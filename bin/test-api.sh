#!/usr/bin/env bash

set -e

PROJECT_DIR="$(git rev-parse --show-toplevel)"
"${PROJECT_DIR}/stack/bin/test.sh"
