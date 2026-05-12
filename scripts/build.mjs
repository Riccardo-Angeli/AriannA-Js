#!/usr/bin/env node
/**
 * AriannA build script
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * Usage:
 *   node scripts/build.mjs                  (full build: plain + minified + gz)
 *   node scripts/build.mjs --watch          (esbuild watch mode, no minify/gz)
 *   node scripts/build.mjs --skip-min       (skip the minify+gzip step)
 *   node scripts/build.mjs --skip-meta      (don't copy package.json / README / LICENSE)
 *   node scripts/build.mjs --skip-types     (don't generate .d.ts files)
 *   node scripts/build.mjs --skip-single    (don't generate the AriannA.ts single-file aggregator)
 *
 * What it produces in release/dist/, for each of the three bundles
 * (arianna · arianna-components · arianna-additionals):
 *
 *   <name>.js                  (plain ESM bundle)
 *   <name>.js.gz               (gzipped plain)
 *   <name>.min.js              (terser-minified)
 *   <name>.min.js.gz           (gzipped minified)
 *   <name>.min.js.map          (source map for the minified)
 *
 * Plus:
 *   • types/dist/**.d.ts                  (auto-generated declarations from tsc)
 *   • release/dist/AriannA.ts             (single-file source aggregator — drop-in TS)
 *   • release/dist/package.json + README + LICENSE + CHANGELOG (publish-ready)
 *
 * The hand-written declaration files in `types/` (arianna.d.ts +
 * arianna-globals.d.ts) live there as the package's permanent declaration
 * surface — they are NOT copied into release/dist/. The tsc-generated
 * declarations live next to them under types/dist/. release/dist/ is
 * reserved for compiled bundles and the AriannA.ts aggregator; everything
 * type-related sits in types/.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync,
         readdirSync, statSync, rmSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { resolve, dirname, relative, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import * as esbuild from 'esbuild';
import { minify as terserMinify } from 'terser';

// ── CLI flags ─────────────────────────────────────────────────────────────────
const args       = process.argv.slice(2);
const watch      = args.includes('--watch');
const skipMin    = args.includes('--skip-min')    || watch;
const skipMeta   = args.includes('--skip-meta')   || watch;
const skipTypes  = args.includes('--skip-types')  || watch;
const skipSingle = args.includes('--skip-single') || watch;

// ── Paths ─────────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot  = resolve(__dirname, '..');
const outDir    = resolve(repoRoot, 'release', 'dist');
// tsc-generated .d.ts files live under types/dist/ (alongside the hand-written
// types/arianna.d.ts and types/arianna-globals.d.ts). release/dist/ is reserved
// for compiled JS bundles, their gzipped twins, and the AriannA.ts aggregator.
const typesOut  = resolve(repoRoot, 'types', 'dist');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// ── Bundles ───────────────────────────────────────────────────────────────────
//
// `external` keeps cross-bundle imports as runtime imports so each file stays
// independent. components and additionals both depend on the core kernel,
// and reference `arianna` so consumers must also load `arianna.js` first.

const bundles = [
    {
        name    : 'arianna',
        entry   : 'core/index.ts',
        external: ['@tauri-apps/*'],
    },
    {
        name    : 'arianna-components',
        entry   : 'components/index.ts',
        external: ['arianna', '@tauri-apps/*'],
    },
    {
        name    : 'arianna-additionals',
        entry   : 'additionals/index.ts',
        external: ['arianna', '@tauri-apps/*'],
    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const sizeOf = (file) => {
    try { return statSync(file).size; } catch { return 0; }
};
const fmtSize = (n) => {
    if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(2) + ' MB';
    if (n >= 1024)        return (n / 1024).toFixed(1)        + ' KB';
    return n + ' B';
};

const writeGzip = (srcPath) => {
    const data    = readFileSync(srcPath);
    const gzipped = gzipSync(data, { level: 9 });
    writeFileSync(srcPath + '.gz', gzipped);
    return gzipped.length;
};

/** Recursively list every .ts file under `dir`, ignoring node_modules and
 *  build outputs. Returns absolute paths sorted deterministically so the
 *  AriannA.ts aggregator and the tsc input list don't reshuffle between
 *  runs (helpful for diff stability and gzip ratio). */
const listTsFiles = (dir, acc = []) => {
    if (!existsSync(dir)) return acc;
    for (const name of readdirSync(dir).sort()) {
        if (name === 'node_modules' || name === 'release' || name.startsWith('.')) continue;
        const full = join(dir, name);
        const st   = statSync(full);
        if (st.isDirectory()) listTsFiles(full, acc);
        else if (name.endsWith('.ts') && !name.endsWith('.d.ts')) acc.push(full);
    }
    return acc;
};

// ── 1. esbuild ────────────────────────────────────────────────────────────────
async function buildBundle(bundle) {
    const entry = resolve(repoRoot, bundle.entry);
    if (!existsSync(entry)) {
        console.log(`⚠  ${bundle.entry} not found — skipping ${bundle.name}`);
        return;
    }

    const outfile = resolve(outDir, `${bundle.name}.js`);

    const esbuildOpts = {
        entryPoints  : [entry],
        bundle       : true,
        format       : 'esm',
        platform     : 'browser',
        target       : 'es2022',
        outfile,
        external     : bundle.external,
        sourcemap    : false,
        legalComments: 'eof',
        absWorkingDir: repoRoot,
    };

    if (watch) {
        const ctx = await esbuild.context(esbuildOpts);
        await ctx.watch();
        console.log(`👀 watching → ${outfile}`);
        return;
    }

    await esbuild.build(esbuildOpts);
    console.log(`✓ esbuild → release/dist/${bundle.name}.js  (${fmtSize(sizeOf(outfile))})`);

    if (skipMin) return;

    // ── 2. terser ────────────────────────────────────────────────────────────
    const code   = readFileSync(outfile, 'utf8');
    const minOut = resolve(outDir, `${bundle.name}.min.js`);
    const mapOut = resolve(outDir, `${bundle.name}.min.js.map`);

    const result = await terserMinify(code, {
        ecma     : 2022,
        module   : true,
        compress : { passes: 2 },
        mangle   : true,
        sourceMap: {
            filename: `${bundle.name}.min.js`,
            url     : `${bundle.name}.min.js.map`,
        },
        format   : { comments: false },
    });

    if (result.error) {
        console.error(`❌ terser failed for ${bundle.name}:`, result.error);
        throw result.error;
    }

    writeFileSync(minOut, result.code);
    if (result.map) writeFileSync(mapOut, result.map);

    console.log(`✓ terser  → release/dist/${bundle.name}.min.js  (${fmtSize(sizeOf(minOut))})`);

    // ── 3. gzip ──────────────────────────────────────────────────────────────
    const plainGzSize = writeGzip(outfile);
    const minGzSize   = writeGzip(minOut);
    console.log(`✓ gzip    → release/dist/${bundle.name}.js.gz       (${fmtSize(plainGzSize)})`);
    console.log(`✓ gzip    → release/dist/${bundle.name}.min.js.gz   (${fmtSize(minGzSize)})`);
}

// ── 4. Generate per-module .d.ts via `tsc --emitDeclarationOnly` ─────────────
// Produces release/dist/types/<sourcePath>.d.ts mirroring the source layout.
// This complements the hand-written types/*.d.ts which stay the primary
// entrypoint declared in package.json. Failures here don't kill the build
// (declarations are nice-to-have for IDE intellisense; the bundles work
// regardless).
function generateDeclarations() {
    if (skipTypes) return;
    console.log('');
    console.log('── declarations ─────────────────────────────────────');

    // Clean previous emission to avoid stale .d.ts left over from removed files.
    if (existsSync(typesOut)) {
        try { rmSync(typesOut, { recursive: true, force: true }); } catch {}
    }
    mkdirSync(typesOut, { recursive: true });

    // Collect all .ts entry points. We pass them on the CLI so this works
    // even in repos that don't have a tsconfig.json with `include` set.
    const tsFiles = [
        ...listTsFiles(resolve(repoRoot, 'core')),
        ...listTsFiles(resolve(repoRoot, 'components')),
        ...listTsFiles(resolve(repoRoot, 'additionals')),
    ];
    if (tsFiles.length === 0) {
        console.log('⚠  no .ts sources found — skipping declaration generation');
        return;
    }

    const tscArgs = [
        '--declaration',
        '--emitDeclarationOnly',
        '--declarationDir', typesOut,
        '--rootDir',        repoRoot,
        '--target',         'es2022',
        '--module',         'esnext',
        '--moduleResolution', 'bundler',
        '--allowImportingTsExtensions',
        '--strict', 'false',          // be lenient — declarations only need to type-check loosely
        '--skipLibCheck',
        '--noEmitOnError', 'false',
        ...tsFiles.map(f => relative(repoRoot, f)),
    ];

    const res = spawnSync('npx', ['--no-install', 'tsc', ...tscArgs], {
        cwd     : repoRoot,
        stdio   : ['ignore', 'pipe', 'pipe'],
        encoding: 'utf8',
        shell   : true,
    });

    if (res.status !== 0) {
        // Show a brief tail of tsc output so the user can see what went wrong
        // without losing the rest of the build. tsc still emits .d.ts files
        // for the parts it could process, so we keep what's there.
        const out = (res.stdout || '') + (res.stderr || '');
        const tail = out.split('\n').slice(-15).join('\n');
        console.log('⚠  tsc reported issues during declaration emit (build continues):');
        console.log(tail.replace(/^/gm, '   '));
    }

    // Count emitted .d.ts files
    const emitted = listTsFiles(typesOut, []).length // listTsFiles only picks .ts (not .d.ts)
        + readdirSync(typesOut, { recursive: true }).filter(f => typeof f === 'string' && f.endsWith('.d.ts')).length;
    console.log(`✓ tsc     → types/dist/*.d.ts  (${emitted} files)`);

    // Note: the hand-written types/arianna.d.ts and types/arianna-globals.d.ts
    // are NOT copied here. They live permanently in types/ as the public API
    // declaration surface for the package; release/dist/ is reserved for the
    // JS bundles (+ .gz) and the AriannA.ts single-file aggregator.
}

// ── 5. Generate AriannA.ts single-file aggregator ────────────────────────────
// Concatenates every source .ts file (sorted core → components → additionals)
// into a single drop-in TypeScript bundle. Useful for:
//   • Embedding the whole framework into a single <script type="module">
//     when a bundler isn't available.
//   • Producing a paste-into-Playground snapshot for reproductions.
//   • Auditing the entire surface from one place.
//
// Each file is preceded by a header comment that records its original
// repo-relative path, mirroring how esbuild's own output is annotated.
function generateAriannATs() {
    if (skipSingle) return;
    console.log('');
    console.log('── single-file aggregator ───────────────────────────');

    const orderedRoots = ['core', 'components', 'additionals'];
    const files = [];
    for (const root of orderedRoots) {
        files.push(...listTsFiles(resolve(repoRoot, root)));
    }
    if (files.length === 0) {
        console.log('⚠  no .ts sources found — skipping AriannA.ts');
        return;
    }

    const header = `/**
 * AriannA.ts — single-file source aggregator
 * Auto-generated by scripts/build.mjs at ${new Date().toISOString()}
 *
 * Concatenates every .ts source under core/, components/ and additionals/
 * in deterministic order, preceded by a banner comment with the original
 * repository-relative path. Drop-in TypeScript with no external imports
 * outside what each file already declares.
 *
 * DO NOT EDIT — this file is regenerated on every build.
 */

`;

    let body = '';
    for (const file of files) {
        const rel = relative(repoRoot, file).split(sep).join('/');
        const src = readFileSync(file, 'utf8');
        body += `\n// ═══════════════════════════════════════════════════════════════════════\n`;
        body += `// ${rel}\n`;
        body += `// ═══════════════════════════════════════════════════════════════════════\n\n`;
        body += src;
        if (!src.endsWith('\n')) body += '\n';
    }

    const outFile = resolve(outDir, 'AriannA.ts');
    writeFileSync(outFile, header + body);
    console.log(`✓ aggregate → release/dist/AriannA.ts  (${fmtSize(sizeOf(outFile))}, ${files.length} files)`);
}

// ── 6. Copy publish-ready meta files ─────────────────────────────────────────
function copyMetaFiles() {
    if (skipMeta) return;

    const candidates = [
        ['package.json',  ['release/package.json', 'dist-package.json', 'package.json']],
        ['README.md',     ['release/README.md',    'dist-README.md',    'README.md']],
        ['LICENSE',       ['release/LICENSE',      'LICENSE']],
        ['CHANGELOG.md',  ['release/CHANGELOG.md', 'CHANGELOG.md']],
    ];

    console.log('');
    for (const [dstName, srcCandidates] of candidates) {
        const src = srcCandidates.find(p => existsSync(resolve(repoRoot, p)));
        if (!src) {
            console.log(`⚠  ${dstName} not found in any candidate path`);
            continue;
        }
        copyFileSync(resolve(repoRoot, src), resolve(outDir, dstName));
        console.log(`✓ meta    → release/dist/${dstName}  (from ${src})`);
    }
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
    const t0 = Date.now();
    console.log(`⚡ Building AriannA${watch ? ' (watch)' : skipMin ? ' (no minify)' : ''}...`);
    console.log(`  out: ${outDir}`);
    console.log('');

    try {
        for (const bundle of bundles) {
            console.log(`── ${bundle.name} ───────────────────────────────────────`);
            await buildBundle(bundle);
            console.log('');
        }

        // Type declarations + single-file aggregator only in non-watch mode.
        if (!watch) {
            generateDeclarations();
            generateAriannATs();
        }

        copyMetaFiles();

        if (!watch) {
            const ms = Date.now() - t0;
            console.log('');
            console.log(`✓ release/dist build complete in ${ms} ms`);
            console.log(`  → publish with:    npm publish release/dist`);
        }
    } catch (err) {
        console.error('');
        console.error('❌ Build failed:', err?.message || err);
        process.exit(1);
    }
})();
