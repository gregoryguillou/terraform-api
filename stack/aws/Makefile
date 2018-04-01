SHELL = /bin/bash
MAKEFLAGS = "-s"

PACKER_VERSION = 1.2.1
TEMPLATE = terraform-api

TOOLS_DIR = $(abspath ../tools)

ifndef PACKER
PACKER = $(abspath $(TOOLS_DIR)/packer_$(PACKER_VERSION))
endif

ami:
	@$(PACKER) build -var 'name=$(TEMPLATE)' -var-file=.env.json packer/$(TEMPLATE).json ;
	AMI=$$(cat /tmp/packer.json | jq -r ".builds[0].artifact_id" | cut -d':' -f2); \
	rm -f /tmp/packer.json : echo $$AMI

list:
	@aws ec2 describe-images \
	   --filters "Name=tag-key,Values=Template" "Name=tag-value,Values=terraform-api" \
	   --query='Images[*].{Name: Name,ImageId: ImageId}' --output=json \
	   | jq -r ' map("\(.Name)(\(.ImageId))") | .[]'

.PHONY: ami list
