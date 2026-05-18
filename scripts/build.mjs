#!/usr/bin/env node
/**
 * AriannA build script — v2 (clean external resolution)
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
 * ── KEY DESIGN: 3 lightweight bundles, no duplicated core ─────────────────
 *
 * Sources use relative imports like `'../../core/Component.ts'`. esbuild's
 * `external` array only matches bare specifiers (e.g. `'arianna'`), so we
 * cannot rely on it alone to externalize core. Instead we install an
 * onResolve plugin that intercepts ANY import whose final path lands
 * inside `<root>/core/` and rewrites it to a runtime-relative
 * `./arianna.js` import marked external.
 *
 * Result:
 *   arianna-components.js starts with:
 *      import { Component, Real, signal, effect, Sheet, Rule, … } from './arianna.js';
 *   and contains zero copies of core.
 *
 * Same plugin is applied to arianna-additionals.js even though it doesn't
 * currently import core — defensive in case it grows a dependency later.
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
const typesOut  = resolve(repoRoot, 'types', 'dist');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// ── External-core plugin ──────────────────────────────────────────────────────
//
// Intercept any import whose path resolves inside `<repoRoot>/core/` and
// replace it with a runtime-relative `./arianna.js` import marked external.
// This is the ONLY way to externalize relative imports — esbuild's `external`
// array works on specifiers, not on resolved paths.
//
// Also handles the bare specifier `'arianna'` for downstream consumers
// that use it explicitly.

const coreDir = resolve(repoRoot, 'core');

const externalizeCore = {
    name: 'externalize-core',
    setup(build) {
        // Bare specifier 'arianna' → ./arianna.js (external)
        build.onResolve({ filter: /^arianna$/ }, () => ({
            path: './arianna.js',
            external: true,
        }));

        // Any relative or absolute import that lands under <repoRoot>/core/
        // → ./arianna.js (external). Filter matches '/core/' segments to
        // pre-filter; we confirm with a resolved-path check.
        build.onResolve({ filter: /(^|\/)core\// }, args => {
            if (args.kind === 'entry-point') return null;
            // Resolve the absolute path the import would land on
            let abs;
            if (args.path.startsWith('.')) {
                abs = resolve(dirname(args.importer), args.path);
            } else if (args.path.startsWith('/')) {
                abs = args.path;
            } else {
                return null;
            }
            // Strip extension/.ts/.js for the directory check
            const noExt = abs.replace(/\.(ts|js|mjs|cjs|tsx|jsx)$/, '');
            if (noExt.startsWith(coreDir + sep) || noExt === coreDir) {
                return { path: './arianna.js', external: true };
            }
            return null;
        });
    },
};

// ── Bundles ───────────────────────────────────────────────────────────────────
//
// arianna.js is the kernel — no externals (everything inlined).
// arianna-components.js + arianna-additionals.js use the plugin above to
// externalize core. additionals doesn't import core today but we apply the
// plugin defensively in case that changes.

const bundles = [
    {
        name    : 'arianna',
        entry   : 'core/index.ts',
        external: ['@tauri-apps/*'],
        plugins : [],
    },
    {
        name    : 'arianna-components',
        entry   : 'components/index.ts',
        external: ['@tauri-apps/*'],
        plugins : [externalizeCore],
    },
    {
        name    : 'arianna-additionals',
        entry   : 'additionals/index.ts',
        external: ['@tauri-apps/*'],
        plugins : [externalizeCore],
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
        plugins      : bundle.plugins,
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
function generateDeclarations() {
    if (skipTypes) return;
    console.log('');
    console.log('── declarations ─────────────────────────────────────');

    if (existsSync(typesOut)) {
        try { rmSync(typesOut, { recursive: true, force: true }); } catch {}
    }
    mkdirSync(typesOut, { recursive: true });

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
        '--strict', 'false',
        '--skipLibCheck',
        '--noEmitOnError', 'false',
        ...tsFiles.map(f => relative(repoRoot, f)),
    ];

    // ── Path resolution for tsc ─────────────────────────────────────────
    // We avoid `shell: true` because the repo path may contain spaces
    // (e.g. "RA Software Projects") and the shell would split the command.
    // Instead we resolve tsc explicitly from node_modules/.bin so spawnSync
    // can invoke it directly with the argv array preserving spaces.
    const isWin   = process.platform === 'win32';
    const tscBin  = resolve(repoRoot, 'node_modules', '.bin', isWin ? 'tsc.cmd' : 'tsc');
    const tscCmd  = existsSync(tscBin) ? tscBin : 'tsc';

    const res = spawnSync(tscCmd, tscArgs, {
        cwd     : repoRoot,
        stdio   : ['ignore', 'pipe', 'pipe'],
        encoding: 'utf8',
        shell   : false,   // critical: spaces in repoRoot must not be split
    });

    if (res.status !== 0) {
        const out = (res.stdout || '') + (res.stderr || '');
        const tail = out.split('\n').slice(-15).join('\n');
        console.log('⚠  tsc reported issues during declaration emit (build continues):');
        console.log(tail.replace(/^/gm, '   '));
    }

    const emitted = readdirSync(typesOut, { recursive: true })
        .filter(f => typeof f === 'string' && f.endsWith('.d.ts')).length;
    console.log(`✓ tsc     → types/dist/*.d.ts  (${emitted} files)`);
}

// ── 5. Generate AriannA.ts single-file aggregator ────────────────────────────
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
