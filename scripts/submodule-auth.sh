#!/bin/sh
set -e

# Start ssh-agent and add the key
echo "$SUBMODULE_DEPLOY_KEY" > /tmp/submodule_deploy.key
chmod 600 /tmp/submodule_deploy.key
eval "$(ssh-agent -s)"
ssh-add /tmp/submodule_deploy.key

# Use the key for all git submodule operations (with verbose output)
export GIT_SSH_COMMAND="ssh -v -i /tmp/submodule_deploy.key -o IdentitiesOnly=yes -o StrictHostKeyChecking=no"
git submodule update --init --recursive

echo "Listing vault-content directory contents:"
ls -al src/vault-content



