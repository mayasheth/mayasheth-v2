#!/bin/sh
set -e
echo "$SUBMODULE_DEPLOY_KEY" > /tmp/submodule_deploy.key
chmod 600 /tmp/submodule_deploy.key
eval $(ssh-agent -s)
ssh-add /tmp/submodule_deploy.key
git submodule update --init --remote