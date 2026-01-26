#!/bin/bash
# Setup git authentication for private GitHub repos
# This script is run during Vercel build to configure git to use GITHUB_TOKEN

set -e

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
  
  # Also set GIT_SSH_COMMAND to prevent SSH usage
  export GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no"
  
  echo "Git configuration applied successfully" >&2
  echo "Verifying git config:" >&2
  git config --global --get-regexp url >&2
  
  # Test the URL rewriting
  echo "Testing URL rewriting:" >&2
  echo "  ssh://git@github.com/test -> $(git config --global --get-regexp 'url.*ssh://git@github.com' || echo 'not mapped')" >&2
else
  echo "ERROR: GITHUB_TOKEN not set. Private repo access will fail." >&2
  exit 1
fi
