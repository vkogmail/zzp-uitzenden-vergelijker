#!/bin/bash
# Setup git authentication for private GitHub repos
# This script is run during Vercel build to configure git to use GITHUB_TOKEN

set -e  # Exit on error

echo "=== Git Auth Setup Script ==="
echo "GITHUB_TOKEN is set: $([ -n "$GITHUB_TOKEN" ] && echo 'YES' || echo 'NO')"

if [ -n "$GITHUB_TOKEN" ]; then
  echo "Configuring git to use GITHUB_TOKEN for GitHub access"
  git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"
  git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "ssh://git@github.com/"
  git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "git@github.com:"
  echo "Git configuration applied successfully"
  git config --global --get-regexp url
else
  echo "ERROR: GITHUB_TOKEN not set. Private repo access will fail."
  echo "Please set GITHUB_TOKEN in Vercel environment variables."
  exit 1
fi
