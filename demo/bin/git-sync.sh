#!/usr/bin/env bash

PROJECT_DIR=$(realpath $(dirname ${BASH_SOURCE[0]})/..)

echo "machine github.com" >~/.netrc
echo "login ${GITHUB_USERNAME}" >>~/.netrc
echo "password ${GITHUB_PASSWORD}" >>~/.netrc
chmod 600 ~/.netrc
cd /github/repository
git pull
git fetch --all --tags --prune

if [ -n "$TAG" ]; then
  git checkout -b ${TAG} tags/${TAG}
elif [ -n "$BRANCH" ]; then
  git checkout -b ${BRANCH} origin/${BRANCH}
fi

rm -f ~/.netrc
cd $PROJECT_DIR
