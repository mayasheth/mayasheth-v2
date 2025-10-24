#!/bin/sh
set -ex

# Start ssh-agent and add the key
echo "$SUBMODULE_DEPLOY_KEY" > /tmp/submodule_deploy.key
chmod 600 /tmp/submodule_deploy.key
eval "$(ssh-agent -s)"
ssh-add /tmp/submodule_deploy.key

# Use the key for all git submodule operations (with verbose output)
export GIT_SSH_COMMAND="ssh -v -i /tmp/submodule_deploy.key -o IdentitiesOnly=yes -o StrictHostKeyChecking=no"
git submodule update --init --recursive

# Fetch latest main branch from remote for your submodule
cd src/vault-content
git fetch origin main
git checkout main
git pull origin main
cd ../..
