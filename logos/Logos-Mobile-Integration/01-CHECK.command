#!/bin/zsh
set -e
cd "$(dirname "$0")"
node install.mjs check
