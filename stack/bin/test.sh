#!/usr/bin/env bash

set -e

PROJECT_DIR="$(git rev-parse --show-toplevel)"

TEST=$(grep -i "^test:" ${PROJECT_DIR}/stack/.ci.yml | grep "enabled" | wc -l)

if [[ "$TEST" -ne 1 ]]; then
   printf "Integration tests are not enabled: Skipping..\n"
   printf "  Add \"test: enabled\" to stack/.ci.yml\n"
   exit 0
fi

cd ${PROJECT_DIR}/stack/docker

echo "VERSION=latest" >.env
printf "Starting docker-compose stack...\n"
docker-compose up -d consul couchbase couchbase-setup

printf "Checking couchbase is available...\n"
for i in {1..60}; do
  curl -L --fail --silent http://0.0.0.0:8091/ >/dev/null 2>&1 && break || true
  sleep 1
  printf "."
done
sleep 10

printf "\nStarting tests...\n"
docker-compose run deck npm test

printf "Test succeeded, cleaning docker-compose stack...\n"

docker-compose kill
docker-compose rm -f

printf "Thank you for your concern...\n"
