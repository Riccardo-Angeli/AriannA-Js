#!/usr/bin/env bash
set -euo pipefail

node --check scripts/arianna-compile.mjs
node --check scripts/build.mjs

node scripts/build.mjs --skip-types --skip-single

echo "== Main.js must contain compiled template and no TS interfaces =="
grep -n "__AR_TEMPLATE_" release/benchmark/keyed/arianna/src/Main.js | head -3
grep -n "__AR_TEMPLATE_" release/benchmark/non-keyed/arianna/src/Main.js | head -3

if grep -nE '^[[:space:]]*(interface|type)[[:space:]]+[A-Za-z_$]' release/benchmark/keyed/arianna/src/Main.js; then
  echo "ERROR: keyed Main.js still contains TypeScript declarations"
  exit 1
fi

if grep -nE '^[[:space:]]*(interface|type)[[:space:]]+[A-Za-z_$]' release/benchmark/non-keyed/arianna/src/Main.js; then
  echo "ERROR: non-keyed Main.js still contains TypeScript declarations"
  exit 1
fi

node --check release/benchmark/keyed/arianna/src/Main.js
node --check release/benchmark/non-keyed/arianna/src/Main.js

echo "✅ JS OUTPUT CHECK COMPLETE"
