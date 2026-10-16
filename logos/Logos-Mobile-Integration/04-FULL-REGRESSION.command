#!/bin/zsh
set -e
cd "$(dirname "$0")/../.."
npm run logos:mobile:check
npm run logos:mobile:audit
npm run typecheck
npm run build
node logos/Logos-Mobile-Integration/install.mjs check
