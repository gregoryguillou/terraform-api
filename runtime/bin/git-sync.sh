#!/usr/bin/env bash

set -e

PROJECT_DIR=$(realpath "$(dirname "${BASH_SOURCE[0]}")/..")

echo "machine github.com" >~/.netrc
echo "login ${GITHUB_USERNAME}" >>~/.netrc
echo "password ${GITHUB_PASSWORD}" >>~/.netrc
chmod 600 ~/.netrc

# Optimisation...
# We should try to implement the 2 ideas below to speed up the
# sync process. The best would be to perform the 2 alltogether:
#  - Sync only a directory in the repository
#     git init <repo>
#     cd <repo>
#     git remote add -f origin ${GITHUB_REPOSITORY}
#     git config core.sparseCheckout true
#     echo "${GITHUB_DIRECTORY}" >> .git/info/sparse-checkout
#
#     - to follow you can do that:
#     git pull origin master
#     - you might even be able to do:
#     git fetch -unf origin v0.1.8:refs/tags/v0.1.8
#     git checkout v0.1.8
#
# - Another way would be to do what Travis CI does
# git clone --depth=10 --branch=v0.1.8 ${GITHUB_REPOSITORY} <repo>

if [[ -d "/github/repository" ]]; then
  cd /github/repository
  git pull
else
  git clone "${GITHUB_REPOSITORY}" /github/repository
  cd /github/repository
fi

git fetch --all --tags --prune

if [[ -n "$TAG" ]]; then
  git checkout -b "${TAG}" "tags/${TAG}"
elif [[ -n "$BRANCH" && "$BRANCH" != "master" ]]; then
  git checkout -b "${BRANCH}" "origin/${BRANCH}"
fi

rm -f ~/.netrc
cd "$PROJECT_DIR"
