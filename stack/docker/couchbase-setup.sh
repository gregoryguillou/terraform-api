#!/usr/bin/env bash

COUCHBASE_BASEURL=${COUCHBASE_BASEURL:-couchbase}
COUCHBASE_ADMINISTRATOR_USERNAME=${COUCHBASE_ADMINISTRATOR_USERNAME:-admin}
COUCHBASE_ADMINISTRATOR_PASSWORD=${COUCHBASE_ADMINISTRATOR_PASSWORD:-couchbase}
COUCHBASE_BUCKET_1=${COUCHBASE_BUCKET:-data}
COUCHBASE_BUCKET_2=${COUCHBASE_BUCKET:-logs}
COUCHBASE_BUCKET_PASSWORD=${COUCHBASE_BUCKET_PASSWORD:-couchbase}

printf "Kicking off couchbase script...\\n"
for ((i = 0 ; i < 60 ; i++ )); do
  if curl -L --fail --silent http://"${COUCHBASE_BASEURL}":8091/ >/dev/null 2>&1; then break; fi
  sleep 1
  printf ".\\n"
done
sleep 1

printf "Running setup commands...\\n"

set -e

curl -X POST --silent http://"${COUCHBASE_BASEURL}":8091/pools/default \
     -d memoryQuota=512 -d indexMemoryQuota=512 \
     >/dev/null 2>&1

curl --silent http://"${COUCHBASE_BASEURL}":8091/node/controller/setupServices \
     -d services=kv%2cn1ql%2Cindex \
     >/dev/null 2>&1

curl --silent http://"${COUCHBASE_BASEURL}":8091/settings/web -d port=8091 \
     -d username="$COUCHBASE_ADMINISTRATOR_USERNAME" \
     -d password="$COUCHBASE_ADMINISTRATOR_PASSWORD" \
     >/dev/null 2>&1

curl --silent -u "$COUCHBASE_ADMINISTRATOR_USERNAME":"$COUCHBASE_ADMINISTRATOR_PASSWORD" \
     -X POST http://"${COUCHBASE_BASEURL}":8091/settings/indexes \
     -d 'storageMode=memory_optimized' \
     >/dev/null 2>&1

curl --silent -u "$COUCHBASE_ADMINISTRATOR_USERNAME":"$COUCHBASE_ADMINISTRATOR_PASSWORD" \
     -X POST http://"${COUCHBASE_BASEURL}":8091/pools/default/buckets \
     -d name="$COUCHBASE_BUCKET_1" -d bucketType=couchbase \
     -d ramQuotaMB=128 -d authType=sasl \
     -d saslPassword="$COUCHBASE_BUCKET_PASSWORD" \
     >/dev/null 2>&1

curl --silent -u "$COUCHBASE_ADMINISTRATOR_USERNAME":"$COUCHBASE_ADMINISTRATOR_PASSWORD" \
     -X POST http://"${COUCHBASE_BASEURL}":8091/pools/default/buckets \
     -d name="$COUCHBASE_BUCKET_2" -d bucketType=couchbase \
     -d ramQuotaMB=128 -d authType=sasl \
     -d saslPassword="$COUCHBASE_BUCKET_PASSWORD" \
     >/dev/null 2>&1

printf "Setup script successfully executed... Exiting now\\n"
