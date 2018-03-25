resource "aws_alb_target_group" "terraformdeck_target_group" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  name     = "${var.environment}-terraformdeck"
  port     = 10010
  protocol = "HTTP"
  vpc_id   = "${var.vpc}"

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/version"
    matcher             = "401"
  }
}

resource "aws_alb_listener_rule" "collector_listener_rule" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  listener_arn = "${var.listener}"
  priority     = "${var.ruleno}"

  action {
    type             = "forward"
    target_group_arn = "${aws_alb_target_group.terraformdeck_target_group.arn}"
  }

  condition {
    field  = "host-header"
    values = ["${var.hostname}"]
  }
}

resource "aws_lb_target_group_attachment" "deck" {
  count = "${(var.deploy == "true" ? 1 : 0)}"

  target_group_arn = "${aws_lb_target_group.terraformdeck_target_group.arn}"
  target_id        = "${aws_instance.deck.id}"
  port             = 10010
}
