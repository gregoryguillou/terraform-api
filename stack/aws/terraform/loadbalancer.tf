resource "aws_alb_target_group" "terraformapi_target_group" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  name     = "${var.environment}-terraformapi"
  port     = 10010
  protocol = "HTTP"
  vpc_id   = "${var.vpc}"

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/status"
    matcher             = "200"
  }
}

resource "aws_alb_target_group" "webapp_target_group" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  name     = "${var.environment}-terraformapi-app"
  port     = 8000
  protocol = "HTTP"
  vpc_id   = "${var.vpc}"

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/status"
    matcher             = "200"
  }
}

resource "aws_alb_listener_rule" "collector_listener_rule" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  listener_arn = "${var.listener}"
  priority     = "${var.ruleno}"

  action {
    type             = "forward"
    target_group_arn = "${aws_alb_target_group.terraformapi_target_group.arn}"
  }

  condition {
    field  = "host-header"
    values = ["${var.hostname}"]
  }
}

resource "aws_alb_listener_rule" "webapp_listener_rule" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  listener_arn = "${var.listener}"
  priority     = "${var.webapp_ruleno}"

  action {
    type             = "forward"
    target_group_arn = "${aws_alb_target_group.webapp_target_group.arn}"
  }

  condition {
    field  = "host-header"
    values = ["${var.webapp}"]
  }
}

resource "aws_alb_target_group_attachment" "terraformapi" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  target_group_arn = "${aws_alb_target_group.terraformapi_target_group.arn}"
  target_id        = "${aws_instance.terraformapi.id}"
  port             = 10010
}

resource "aws_alb_target_group_attachment" "webapp" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  target_group_arn = "${aws_alb_target_group.webapp_target_group.arn}"
  target_id        = "${aws_instance.terraformapi.id}"
  port             = 8000
}
