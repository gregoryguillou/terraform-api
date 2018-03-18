#!/usr/bin/env bash

PROJECT_DIR="$(git rev-parse --show-toplevel)"
cd cli
make all
