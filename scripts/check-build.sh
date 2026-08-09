#!/usr/bin/env bash
set -euo pipefail

echo "== syntax =="
node --check scripts/arianna-compile.mjs
node --check scripts/build.mjs

echo "== compiler cli =="
node scripts/arianna-compile.mjs --help

echo "== full runtime build =="
node scripts/build.mjs --skip-types --skip-single

echo "== generated runtime =="
test -f release/dist/arianna.min.js
ls -lh release/dist/arianna.js release/dist/arianna.min.js

echo "== benchmark runtime hashes =="
shasum -a 256 \
  release/dist/arianna.min.js \
  release/benchmark/keyed/arianna/src/arianna.min.js \
  release/benchmark/non-keyed/arianna/src/arianna.min.js

echo "== compiled benchmark templates =="
grep -n "__AR_TEMPLATE_" release/benchmark/keyed/arianna/src/Main.js | head -5
grep -n "__AR_TEMPLATE_" release/benchmark/non-keyed/arianna/src/Main.js | head -5

echo "== pass-2 marker sanity =="
grep -o "ar:e" release/dist/arianna.js | wc -l

echo "BUILD CHECK COMPLETE"
