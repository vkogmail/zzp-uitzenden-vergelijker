#!/bin/bash
# Setup git authentication for private GitHub repos
# This script is run during Vercel build to configure git to use GITHUB_TOKEN

# Don't use set -e here because we want to continue even if some configs fail
set +e

echo "=== Git Auth Setup Script ===" >&2
echo "GITHUB_TOKEN is set: $([ -n "$GITHUB_TOKEN" ] && echo 'YES' || echo 'NO')" >&2

if [ -n "$GITHUB_TOKEN" ]; then
  echo "Configuring git to use GITHUB_TOKEN for GitHub access" >&2
  TOKEN_URL="https://${GITHUB_TOKEN}@github.com/"
  
  # Configure all possible GitHub URL formats - order matters!
  # Map SSH URLs first, then HTTPS
  git config --global url."${TOKEN_URL}".insteadOf "ssh://git@github.com/"
  git config --global url."${TOKEN_URL}".insteadOf "git+ssh://git@github.com/"
  git config --global url."${TOKEN_URL}".insteadOf "git@github.com:"
  git config --global url."${TOKEN_URL}".insteadOf "https://github.com/"
  
  echo "Git configuration applied successfully" >&2
  echo "Verifying git config:" >&2
  git config --global --get-regexp url >&2
  
  # Also write to a file that can be sourced by npm install
  echo "export GITHUB_TOKEN=\"${GITHUB_TOKEN}\"" > /tmp/git-env.sh
  echo "export GIT_SSH_COMMAND=\"ssh -o StrictHostKeyChecking=no\"" >> /tmp/git-env.sh
  
  # Configure .npmrc with token for GitHub packages
  echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc
  echo "//github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc
else
  echo "ERROR: GITHUB_TOKEN not set. Private repo access will fail." >&2
  exit 1
fi
