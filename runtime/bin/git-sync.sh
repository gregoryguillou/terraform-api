#!/usr/bin/env bash

set -e

PROJECT_DIR=$(realpath $(dirname ${BASH_SOURCE[0]})/..)

echo "machine github.com" >~/.netrc
echo "login ${GITHUB_USERNAME}" >>~/.netrc
echo "password ${GITHUB_PASSWORD}" >>~/.netrc
chmod 600 ~/.netrc

if [[ -d "/github/repository" ]]; then
  cd /github/repository
  git pull
else
  git clone ${GITHUB_REPOSITORY} /github/repository
  cd /github/repository
fi

git fetch --all --tags --prune

if [[ -n "$TAG" ]]; then
  git checkout -b ${TAG} tags/${TAG}
elif [[ -n "$BRANCH" && "$BRANCH" != "master" ]]; then
  git checkout -b ${BRANCH} origin/${BRANCH}
fi

rm -f ~/.netrc
cd $PROJECT_DIR
