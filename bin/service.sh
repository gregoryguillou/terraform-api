#!/usr/bin/env bash
set -e

PROJECT_DIR="$(git rev-parse --show-toplevel)"
cd ${PROJECT_DIR}
CURRENT_COMMIT="$(git rev-parse HEAD)"

if [[ "$(git branch --list master | wc -l)" == "1" ]]; then
  MASTER_BASE_COMMIT=$(git merge-base master "$(git rev-parse HEAD)")
else
  REMOTE_MASTER_COMMIT=$(git ls-remote 2>/dev/null | grep "refs/heads/master" | awk '{print $1}')
  git fetch origin master 2>/dev/null
  git branch remote_master_branch "$REMOTE_MASTER_COMMIT" 2>/dev/null
  MASTER_BASE_COMMIT=$(git merge-base remote_master_branch "$(git rev-parse HEAD)")
  git branch -D remote_master_branch >/dev/null 2>&1
fi

if [[ "$CURRENT_COMMIT" == "$MASTER_BASE_COMMIT" ]]; then
  # Only because we force "SQUASH AND MERGE" on master
  MASTER_BASE_COMMIT=$(git rev-parse HEAD^1)
fi

ROOT_CHANGES=$(git diff --name-status "$CURRENT_COMMIT" "$MASTER_BASE_COMMIT" | awk '{print $2}' \
  | cut -d'/' -f1 | sort | uniq)

for i in $(find . -maxdepth 2 -name '.ci.yml' | cut -d'/' -f2); do
  echo "$ROOT_CHANGES" | grep "^${i}$" || true
done
