FROM debian:stretch

RUN DEBIAN_FRONTEND=noninteractive apt-get update && \
    apt-get install -y curl unzip git

ARG TERRAFORM_VERSION=0.11.4

WORKDIR /app
RUN curl -L -o terraform.zip https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip

RUN cd /usr/local/bin && \
    unzip /app/terraform.zip && \
    rm -f /app/terraform.zip && \
    mkdir /github

COPY terraform /app/terraform
COPY bin /app/bin
COPY entrypoint.sh /app/entrypoint.sh
ENTRYPOINT [ "/app/entrypoint.sh" ]

ARG GITHUB_REPOSITORY 
ARG GITHUB_USERNAME 
ARG GITHUB_PASSWORD
ARG CACHEBUST=1

RUN echo "machine github.com" >~/.netrc && \
    echo "login ${GITHUB_USERNAME}" >>~/.netrc && \
    echo "password ${GITHUB_PASSWORD}" >>~/.netrc && \
    chmod 600 ~/.netrc && \
    git clone ${GITHUB_REPOSITORY} /github/repository && \
    rm -f ~/.netrc
