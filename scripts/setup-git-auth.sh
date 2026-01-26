#!/bin/bash
# Setup git authentication for private GitHub repos
# This script is run during Vercel build to configure git to use GITHUB_TOKEN

# Don't exit on error - we want to see what happens
set +e

echo "=== Git Auth Setup Script ===" >&2
echo "GITHUB_TOKEN is set: $([ -n "$GITHUB_TOKEN" ] && echo 'YES' || echo 'NO')" >&2
echo "Current directory: $(pwd)" >&2
echo "Script location: $0" >&2

if [ -n "$GITHUB_TOKEN" ]; then
  echo "Configuring git to use GITHUB_TOKEN for GitHub access" >&2
  git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"
  git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "ssh://git@github.com/"
  git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "git@github.com:"
  echo "Git configuration applied successfully" >&2
  git config --global --get-regexp url >&2
else
  echo "WARNING: GITHUB_TOKEN not set. Private repo access may fail." >&2
  echo "Please set GITHUB_TOKEN in Vercel environment variables." >&2
  # Don't exit - let npm try anyway
fi
