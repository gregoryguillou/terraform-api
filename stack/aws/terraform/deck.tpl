#!/bin/bash

systemctl enable awslogs
systemctl start awslogs
systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent

vgchange -ay || true
DEVICE_FS=$(blkid -o value -s TYPE ${device})

if [ "$(echo -n "$DEVICE_FS")" == "" ] ; then
        pvcreate ${device}
        vgcreate deck ${device}
        lvcreate --name deckvol -l 100%FREE deck
        mkfs.ext4 /dev/deck/deckvol
fi
mkdir -p /mnt/couchbase/data
sed -i '/couchbase/d' /etc/fstab
echo "/dev/deck/deckvol /mnt/couchbase/data ext4 defaults 0 0" >> /etc/fstab
mount /mnt/couchbase/data
sysctl -w vm.max_map_count=262144

cd /opt/terraform-deck
rm -f /opt/terraform-deck/api/settings.yaml
rm -f /opt/terraform-deck/bots/settings.yaml
aws s3 cp s3://${configbucket}${configfile} /opt/terraform-deck/api/settings.yaml
aws s3 cp s3://${configbucket}${botsfile} /opt/terraform-deck/bots/settings.yaml

aws ecr get-login --no-include-email |sh

for image in ${images}; do
  docker pull "$image"
done

docker-compose up -d
