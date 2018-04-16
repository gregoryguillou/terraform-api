resource "aws_instance" "terraformapi" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  ami                         = "${var.ami}"
  instance_type               = "t2.micro"
  vpc_security_group_ids      = ["${aws_security_group.terraformapi_security_group.id}"]
  iam_instance_profile        = "${aws_iam_instance_profile.terraformapi_profile.id}"
  subnet_id                   = "${var.subnet}"
  associate_public_ip_address = "false"
  key_name                    = "${var.keypair}"
  user_data                   = "${data.template_file.terraformapi-template.rendered}"

  tags {
    CostCenter  = "infrastructure"
    Environment = "${var.environment}"
    Name        = "${var.environment}-terraformapi"
  }
}

data "template_file" "terraformapi-template" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  template = "${file("${path.module}/terraform-api.tpl")}"

  vars {
    configbucket = "${var.configbucket}"
    configfile   = "${var.configfile}"
    device       = "/dev/xvdh"
    images       = "${var.images}"
  }
}

resource "aws_iam_instance_profile" "terraformapi_profile" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  name = "${var.environment}terraformapiProfile"
  role = "${aws_iam_role.ec2_terraformapi_role.name}"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_iam_role" "ec2_terraformapi_role" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  name = "${var.environment}terraformapiEC2Role"

  assume_role_policy = <<EOF
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": [ 
          "ec2.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_iam_role_policy_attachment" "ec2_role_attachment" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  role       = "${aws_iam_role.ec2_terraformapi_role.name}"
  policy_arn = "${aws_iam_policy.ec2_policy.arn}"
}

resource "aws_iam_role_policy_attachment" "ssm_role_attachment" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  role       = "${aws_iam_role.ec2_terraformapi_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2RoleforSSM"
}

resource "aws_iam_policy" "ec2_policy" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  name        = "${var.environment}terraformapiEC2RolePolicy"
  path        = "/"
  description = "Policy used to access Configuration"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:DescribeAlarms",
        "cloudwatch:PutMetricAlarm",
        "cloudwatch:PutMetricData",
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:ListMetrics",
        "iam:ListSSHPublicKeys",
        "iam:GetSSHPublicKey",
        "iam:ListUsers"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:GetRepositoryPolicy",
        "ecr:DescribeRepositories",
        "ecr:ListImages",
        "ecr:DescribeImages",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::${var.configbucket}/*"
    }
  ]
}
EOF
}

resource "aws_ebs_volume" "terraformapi" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  availability_zone = "${var.availabilityzone}"
  size              = "20"
  type              = "gp2"

  tags {
    CostCenter  = "infrastructure"
    Environment = "${var.environment}"
    Name        = "${var.environment}-terraformapi"
  }
}

resource "aws_volume_attachment" "terraformapi" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  device_name  = "/dev/xvdh"
  force_detach = "true"
  instance_id  = "${aws_instance.terraformapi.id}"
  volume_id    = "${aws_ebs_volume.terraformapi.id}"
}

resource "aws_security_group" "terraformapi_security_group" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  name        = "${var.environment}-terraformapi"
  description = "Allow incoming SSH and HTTP connections"
  vpc_id      = "${var.vpc}"

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 10010
    to_port     = 10010
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
