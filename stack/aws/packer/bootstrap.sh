#!/usr/bin/env bash

set -e

yum install -y docker
systemctl enable docker
systemctl start docker
yum install -y awslogs amazon-ssm-agent

export COMPOSE_VERSION=1.20.1
export REPOSITORY=https://raw.githubusercontent.com/gregoryguillou/terraform-api

mkdir -p /opt/terraform-api && cd /opt/terraform-api
curl -L https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-Linux-x86_64 \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
mkdir -p /mnt/data/couchbase
mkdir -p /mnt/data/redis
mkdir -p /opt/terraform-api/api


docker pull gregoryguillou/terraform-api:v0.2.0
docker pull gregoryguillou/terraform-api:v0.2.0-runtime
docker pull consul:1.0.7
docker pull couchbase:community-5.0.1

curl -LO $REPOSITORY/master/stack/docker/couchbase-setup.sh
curl -LO $REPOSITORY/master/stack/docker/docker-compose.yml
curl -L $REPOSITORY/master/api/config/settings-template.yaml -o api/settings.yaml
chmod +x couchbase-setup.sh

# shellcheck disable=SC2016
sed -i 's/\$PWD.*api.*settings\.yaml\:/\/opt\/terraform-api\/api\/settings.yaml:/' docker-compose.yml
sed -i '/couchbase-server\"/a\ \ \ \ volumes:\n\ \ \ \ \ \ - \"\/mnt\/data\/couchbase:\/opt\/couchbase\/var\/lib\/couchbase\/data\"' \
  docker-compose.yml
sed -i '/redis-server\"/a\ \ \ \ volumes:\n\ \ \ \ \ \ - \"\/mnt\/data\/redis:\/data\"' \
  docker-compose.yml
