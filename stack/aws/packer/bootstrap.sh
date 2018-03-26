#!/usr/bin/env bash

set -e

yum install -y docker
systemctl enable docker
systemctl start docker
yum install -y awslogs amazon-ssm-agent

export COMPOSE_VERSION=1.20.1
export REPOSITORY=https://raw.githubusercontent.com/gregoryguillou/terraform-deck

mkdir -p /opt/terraform-deck && cd /opt/terraform-deck
curl -L https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-Linux-x86_64 \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
mkdir -p /mnt/couchbase/data
mkdir -p /opt/terraform-deck/api
mkdir -p /opt/terraform-deck/bots


docker pull gregoryguillou/terraform-deck:v0.1.5
docker pull gregoryguillou/terraform-deck:v0.1.5-demo
docker pull gregoryguillou/terraform-deck:v0.1.5-bots
docker pull consul:1.0.6
docker pull couchbase:community-5.0.1

curl -LO $REPOSITORY/master/stack/docker/couchbase-setup.sh
curl -LO $REPOSITORY/master/stack/docker/docker-compose.yml
curl -L $REPOSITORY/master/api/config/settings-template.yaml -o api/settings.yaml
curl -L $REPOSITORY/master/bots/config/settings-template.yaml -o bots/settings.yaml
chmod +x couchbase-setup.sh

sed -i 's/\$PWD.*api.*settings\.yaml\:/\/opt\/terraform-deck\/api\/settings.yaml:/' docker-compose.yml
sed -i 's/\$PWD.*bots.*settings\.yaml\:/\/opt\/terraform-deck\/bots\/settings.yaml:/' docker-compose.yml
sed -i '/couchbase-server\"/a\ \ \ \ volumes:\n\ \ \ \ \ \ - \"\/mnt\/couchbase\/data:\/opt\/couchbase\/var\/lib\/couchbase\/data\"' \
  docker-compose.yml

