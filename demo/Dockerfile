FROM debian:stretch

ARG TERRAFORM_VERSION=0.11.5
ARG GITHUB_REPOSITORY=https://github.com/gregoryguillou/terraform-deck.git

RUN DEBIAN_FRONTEND=noninteractive apt-get update && \
    apt-get install -y curl unzip git && \ 
    curl -L -o /opt/terraform.zip https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
    cd /usr/local/bin && unzip /opt/terraform.zip && rm -f /opt/terraform.zip && \
    mkdir /github

COPY . /app

ENTRYPOINT [ "/app/entrypoint.sh" ]

ARG CACHEBUST=1

RUN git clone ${GITHUB_REPOSITORY} /github/repository
