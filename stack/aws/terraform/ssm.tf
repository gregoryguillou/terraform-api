resource "aws_ssm_document" "terraformapi" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  name          = "TerraformAPISshAccessGrant"
  document_type = "Command"

  content = <<DOC
    {
        "schemaVersion": "2.2",
        "description": "Grant an SSH access to an Instance based on the IAM registered SSH public keys",
        "parameters":{
            "username": {
                "type": "String",
                "description": "IAM username to connect to an EC2 Instance "
            }
        },
        "mainSteps":[
            {
                "action": "aws:runShellScript",
                "name": "sshkey",
                "precondition": {
                    "StringEquals": [
                        "platformType",
                        "Linux"
                    ]
                },
                "inputs":{
                    "id":"0.aws:runShellScript",
                    "runCommand":[
                       "USERNAME=$(echo \"{{username}}\" | tr -d '.')",
                       "for i in $(aws iam list-ssh-public-keys --user-name {{username}} --query 'SSHPublicKeys[].SSHPublicKeyId' --output text); do",
                       "   PUBKEY=$(aws iam get-ssh-public-key --user-name={{username}} --ssh-public-key-id=$${i} --encoding=SSH --query='SSHPublicKey.SSHPublicKeyBody' --output text)",
                       "   DISPLAYKEY=$(echo $${PUBKEY} | tr -d '\n')",
                       "   groupadd $${USERNAME} 2>/dev/null",
                       "   useradd -m -s /bin/bash -g $${USERNAME} $${USERNAME} 2>/dev/null",
                       "   mkdir -p /home/$${USERNAME}/.ssh",
                       "   touch /home/$${USERNAME}/.ssh/authorized_keys",
                       "   sed -i \"/$${i}/d\" /home/$${USERNAME}/.ssh/authorized_keys",
                       "   echo \"$${DISPLAYKEY} $${i}\" >>/home/$${USERNAME}/.ssh/authorized_keys",
                       "   chown -R $${USERNAME}:$${USERNAME} /home/$${USERNAME}/.ssh",
                       "   chmod 700 /home/$${USERNAME}/.ssh",
                       "   chmod 600 /home/$${USERNAME}/.ssh/authorized_keys",
                       "   ls -l /home/$${USERNAME}/.ssh/authorized_keys",
                       "   sed -i \"/$${USERNAME}/d\" /etc/sudoers.d/90-cloud-init-users",
                       "   echo \"$${USERNAME} ALL=(ALL) NOPASSWD:ALL\" >> /etc/sudoers.d/90-cloud-init-users",
                       "done",
                       "echo; echo \"list root accesses:\"",
                       "cat /etc/sudoers.d/90-cloud-init-users"
                    ]
                }
            }
        ]
    }
DOC
}
