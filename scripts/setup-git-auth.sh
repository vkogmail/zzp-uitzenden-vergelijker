#!/bin/bash
# Setup git authentication for private GitHub repos
# This script is run during Vercel build to configure git to use GITHUB_TOKEN

set -e

echo "=== Git Auth Setup Script ===" >&2
echo "GITHUB_TOKEN is set: $([ -n "$GITHUB_TOKEN" ] && echo 'YES' || echo 'NO')" >&2

if [ -n "$GITHUB_TOKEN" ]; then
  echo "Configuring git to use GITHUB_TOKEN for GitHub access" >&2
  git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"
  git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "ssh://git@github.com/"
  git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "git@github.com:"
  echo "Git configuration applied successfully" >&2
  git config --global --get-regexp url >&2
else
  echo "ERROR: GITHUB_TOKEN not set. Private repo access will fail." >&2
  exit 1
fi
