#!/usr/bin/env bash

set -e

yum install -y docker
systemctl start docker
sleep 10

export COMPOSE_VERSION=1.20.1
export REPOSITORY=https://raw.githubusercontent.com/gregoryguillou/terraform-deck

mkdir -p /opt/terraform-deck && cd /opt/terraform-deck
curl -L https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-Linux-x86_64 \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
mkdir -p /mnt/couchbase/data

docker pull gregoryguillou/terraform-deck:v0.1.4
docker pull gregoryguillou/terraform-deck:v0.1.4-demo
docker pull consul:1.0.6
docker pull couchbase:community-5.0.1

curl -LO $REPOSITORY/master/stack/docker/couchbase-setup.sh
curl -LO $REPOSITORY/master/stack/docker/docker-compose.yml
curl -L $REPOSITORY/master/api/config/settings-template.yaml -o settings.yaml
chmod +x couchbase-setup.sh

sed -i 's/\$PWD.*template\.yaml/\/opt\/terraform-deck\/settings.yaml/' docker-compose.yml
sed -i '/couchbase-server\"/a\ \ \ \ volumes:\n\ \ \ \ \ \ - \"\/mnt\/couchbase\/data:\/opt\/couchbase\/var\/lib\/couchbase\/data\"' \
  docker-compose.yml

