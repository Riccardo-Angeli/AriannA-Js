#!/usr/bin/env bash
#
# AriannA — build dist artefacts into release/dist/
# ──────────────────────────────────────────────────────────────────────────────
#
# What this does:
#   1. cd into the repo root (one level up from this script's location).
#   2. For each bundle source produce, inside release/dist/:
#         <name>.js          .. plain ES bundle
#         <name>.js.gz       .. gzipped plain bundle
#         <name>.min.js      .. terser-minified
#         <name>.min.js.gz   .. gzipped minified
#         <name>.min.js.map  .. source map for the minified
#   3. Copy the dist-flavoured package.json + README + LICENSE + CHANGELOG
#      into release/dist/ so the folder is publishable as-is via:
#         npm publish release/dist
#
# Run:
#   bash scripts/build-dist.sh
#   # or, after wiring into package.json:
#   npm run build

set -euo pipefail

# ── Locate paths ─────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
OUT_DIR="${REPO_ROOT}/release/dist"

cd "${REPO_ROOT}"

mkdir -p "${OUT_DIR}"

# ── Bundles to build ─────────────────────────────────────────────────────────
#
# Each entry:   "<output-name>:<source-file>"
#
# The source can be either a .ts (will be transpiled with tsc) or a .js
# (will be copied as-is). For arianna-components we expect the bundle
# to already exist (produced by your tsc/rollup pipeline) — if it doesn't,
# the script skips it gracefully instead of erroring out.

BUNDLES=(
    "arianna:AriannA.ts"
    "arianna-components:release/dist/arianna-components.js"
)

# ── Build each bundle ────────────────────────────────────────────────────────
for entry in "${BUNDLES[@]}"; do
    name="${entry%%:*}"
    src="${entry#*:}"

    if [ ! -f "${src}" ]; then
        echo "⚠  ${src} not found — skipping ${name}"
        continue
    fi

    echo ""
    echo "── ${name} ──────────────────────────────────────────────────────"

    plain="${OUT_DIR}/${name}.js"
    minified="${OUT_DIR}/${name}.min.js"

    # ── Step 1: produce the plain JS bundle ─────────────────────────────────
    case "${src}" in
        *.ts)
            echo "→ transpile ${src} → ${plain}"
            # AriannA.ts is a single-file bundle (no imports) so tsc with
            # --outFile works directly. If there are imports, swap this for
            # a rollup/esbuild call.
            tmp_outdir="${OUT_DIR}/.tmp-${name}"
            mkdir -p "${tmp_outdir}"
            npx tsc "${src}" \
                --target ES2022 \
                --module ES2022 \
                --moduleResolution bundler \
                --lib ES2022,DOM \
                --strict \
                --skipLibCheck \
                --removeComments true \
                --declaration false \
                --outDir "${tmp_outdir}"
            # Rename emitted file to the desired output name
            emitted="${tmp_outdir}/$(basename "${src%.*}").js"
            mv "${emitted}" "${plain}"
            rm -rf "${tmp_outdir}"
            ;;
        *.js)
            # Source already a JS bundle — only re-process if it's NOT the
            # output we're about to write to (avoid copying onto itself).
            if [ "$(realpath "${src}")" = "$(realpath "${plain}")" ]; then
                echo "→ ${plain} already in place — keeping as-is"
            else
                echo "→ copy ${src} → ${plain}"
                cp "${src}" "${plain}"
            fi
            ;;
        *)
            echo "✗ unsupported source extension: ${src}"
            exit 1
            ;;
    esac

    # ── Step 2: minify with terser ─────────────────────────────────────────
    echo "→ minify → ${minified}"
    npx terser "${plain}" \
        -o "${minified}" \
        -c passes=2 \
        -m \
        --source-map "url='${name}.min.js.map'"

    # ── Step 3: gzip both versions ─────────────────────────────────────────
    # -9 = max compression, -k = keep originals, -f = overwrite previous .gz
    echo "→ gzip ${plain}"
    gzip -9 -k -f "${plain}"

    echo "→ gzip ${minified}"
    gzip -9 -k -f "${minified}"
done

# ── Copy publishable meta files into release/dist ───────────────────────────
#
# Looks in this order:
#   1. release/package.json     (preferred — separate dist meta)
#   2. dist-package.json        (legacy location at repo root)
#   3. package.json             (fallback — repo root)

echo ""
echo "── meta files ──────────────────────────────────────────────────────"

copy_first_found() {
    local dst_name="$1"; shift
    local src
    for src in "$@"; do
        if [ -f "${src}" ]; then
            echo "→ ${dst_name} ← ${src}"
            cp "${src}" "${OUT_DIR}/${dst_name}"
            return 0
        fi
    done
    echo "⚠  ${dst_name} not found in any candidate path"
    return 1
}

copy_first_found "package.json" \
    "${REPO_ROOT}/release/package.json" \
    "${REPO_ROOT}/dist-package.json" \
    "${REPO_ROOT}/package.json" || true

copy_first_found "README.md" \
    "${REPO_ROOT}/release/README.md" \
    "${REPO_ROOT}/dist-README.md" \
    "${REPO_ROOT}/README.md" || true

copy_first_found "LICENSE" \
    "${REPO_ROOT}/release/LICENSE" \
    "${REPO_ROOT}/LICENSE" || true

copy_first_found "CHANGELOG.md" \
    "${REPO_ROOT}/release/CHANGELOG.md" \
    "${REPO_ROOT}/CHANGELOG.md" || true

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "── output ─────────────────────────────────────────────────────────"
echo "  ${OUT_DIR}"
echo ""
( cd "${OUT_DIR}" && ls -la ) | tail -n +2 | awk 'NF >= 9 && $NF != "." && $NF != ".." { printf "  %8s  %s\n", $5, $NF }'

echo ""
echo "✓ release/dist build complete"
echo "  → publish with:    npm publish ${OUT_DIR#${REPO_ROOT}/}"
