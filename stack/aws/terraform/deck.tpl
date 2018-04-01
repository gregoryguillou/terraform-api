#!/bin/bash

systemctl enable awslogs
systemctl start awslogs
systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent

vgchange -ay || true
DEVICE_FS=$(blkid -o value -s TYPE ${device})

if [ "$(echo -n "$DEVICE_FS")" == "" ] ; then
        pvcreate ${device}
        vgcreate terraformapi ${device}
        lvcreate --name terraformapivol -l 100%FREE terraformapi
        mkfs.ext4 /dev/terraformapi/terraformapivol
fi
mkdir -p /mnt/couchbase/data
sed -i '/couchbase/d' /etc/fstab
echo "/dev/terraformapi/terraformapivol /mnt/couchbase/data ext4 defaults 0 0" >> /etc/fstab
mount /mnt/couchbase/data
sysctl -w vm.max_map_count=262144

cd /opt/terraform-api
rm -f /opt/terraform-api/api/settings.yaml
rm -f /opt/terraform-api/bots/settings.yaml
aws s3 cp s3://${configbucket}${configfile} /opt/terraform-api/api/settings.yaml
aws s3 cp s3://${configbucket}${botsfile} /opt/terraform-api/bots/settings.yaml

AWS_DEFAULT_REGION=$(curl --silent 169.254.169.254/latest/meta-data/placement/availability-zone \
                       | sed 's/.$//')
export AWS_DEFAULT_REGION

aws ecr get-login --no-include-email |sh

for image in ${images}; do
  docker pull "$image"
done

docker-compose up -d

