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
  release/dist/arianna-runtime.min.js \
  ../arianna-benchmarks/js-framework-benchmark/frameworks/keyed/arianna/src/arianna.min.js \
  ../arianna-benchmarks/js-framework-benchmark/frameworks/non-keyed/arianna/src/arianna.min.js

echo "== compiled benchmark templates =="
grep -n "__AR_TEMPLATE_" ../arianna-benchmarks/js-framework-benchmark/frameworks/keyed/arianna/src/Main.js | head -5
grep -n "__AR_TEMPLATE_" ../arianna-benchmarks/js-framework-benchmark/frameworks/non-keyed/arianna/src/Main.js | head -5

echo "== IR runtime exclusion =="
if grep -qE "NativeAddress|arianna\.web\.real|arianna\.real\." release/dist/arianna-runtime.min.js; then
  echo "ERROR: build-time Logos/Web-LIR leaked into runtime bundle"
  exit 1
fi

echo "== pass-2 marker sanity =="
grep -o "ar:e" release/dist/arianna.js | wc -l

echo "BUILD CHECK COMPLETE"
