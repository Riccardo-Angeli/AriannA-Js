#!/usr/bin/env node
/**
 * @module      scripts/build
 * @description AriannA distribution build with the Template compiler integrated as an esbuild onLoad stage.
 *              Compiler implementation is loaded from core/Compiler.ts through scripts/arianna-compile.mjs.
 */

import {
    existsSync,
    mkdirSync,
    readFileSync,
    writeFileSync,
    copyFileSync,
    readdirSync,
    statSync,
    rmSync
} from 'node:fs';

import { gzipSync } from 'node:zlib';
import { resolve, dirname, relative, join, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import * as esbuild from 'esbuild';
import { minify as terserMinify } from 'terser';
import { CompileSource, CompileFile } from './arianna-compile.mjs';

const args       = process.argv.slice(2);
const watch      = args.includes('--watch');
const skipMin    = args.includes('--skip-min')    || watch;
const skipMeta   = args.includes('--skip-meta')   || watch;
const skipTypes  = args.includes('--skip-types')  || watch;
const skipSingle = args.includes('--skip-single') || watch;

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot  = resolve(__dirname, '..');
const outDir    = resolve(repoRoot, 'release', 'dist');
const typesOut  = resolve(repoRoot, 'types', 'dist');
const coreDir   = resolve(repoRoot, 'core');
const compilerFile = resolve(coreDir, 'Compiler.ts');

if(!existsSync(outDir))
{
    mkdirSync(outDir, { recursive: true });
}

const AriannaCompiler = {
    name: 'arianna-compiler',

    setup(build)
    {
        build.onLoad
        (
            { filter: /\.[cm]?[jt]sx?$/ },
            async args =>
            {
                /*
                 * Compiler.ts is the build-time compiler itself. Compiling the
                 * compiler through itself is unnecessary and would recurse.
                 */
                if(resolve(args.path) === compilerFile)
                {
                    return null;
                }

                const source =
                    readFileSync(args.path, 'utf8');

                const result =
                    await CompileSource
                    (
                        source,
                        {
                            FileName    : args.path,
                            TemplateRef : 'Templates.Template'
                        }
                    );

                const extension =
                    extname(args.path).toLowerCase();

                const loader =
                    extension === '.tsx'
                        ? 'tsx'
                        : extension === '.jsx'
                            ? 'jsx'
                            : extension === '.js' ||
                              extension === '.mjs' ||
                              extension === '.cjs'
                                ? 'js'
                                : 'ts';

                return {
                    contents : result.Code,
                    loader
                };
            }
        );
    }
};

const externalizeCore = {
    name: 'externalize-core',

    setup(build)
    {
        build.onResolve
        (
            { filter: /^arianna$/ },
            () =>
            ({
                path     : './arianna.js',
                external : true
            })
        );

        build.onResolve
        (
            { filter: /(^|\/)core\// },
            args =>
            {
                if(args.kind === 'entry-point')
                {
                    return null;
                }

                let absolute;

                if(args.path.startsWith('.'))
                {
                    absolute =
                        resolve
                        (
                            dirname(args.importer),
                            args.path
                        );
                }
                else if(args.path.startsWith('/'))
                {
                    absolute = args.path;
                }
                else
                {
                    return null;
                }

                const noExtension =
                    absolute.replace
                    (
                        /\.(ts|js|mjs|cjs|tsx|jsx)$/,
                        ''
                    );

                if
                (
                    noExtension.startsWith(coreDir + sep) ||
                    noExtension === coreDir
                )
                {
                    return {
                        path     : './arianna.js',
                        external : true
                    };
                }

                return null;
            }
        );
    }
};

const bundles = [
    {
        name     : 'arianna',
        entry    : 'core/index.ts',
        external : ['@tauri-apps/*'],
        plugins  : [AriannaCompiler]
    },
    {
        name     : 'arianna-components',
        entry    : 'components/index.ts',
        external : ['@tauri-apps/*'],
        plugins  : [AriannaCompiler, externalizeCore]
    },
    {
        name     : 'arianna-additionals',
        entry    : 'additionals/index.ts',
        external : ['@tauri-apps/*'],
        plugins  : [AriannaCompiler, externalizeCore]
    }
];

const sizeOf = file =>
{
    try
    {
        return statSync(file).size;
    }
    catch
    {
        return 0;
    }
};

const fmtSize = value =>
{
    if(value >= 1024 * 1024)
    {
        return (value / 1024 / 1024).toFixed(2) + ' MB';
    }

    if(value >= 1024)
    {
        return (value / 1024).toFixed(1) + ' KB';
    }

    return value + ' B';
};

const writeGzip = source =>
{
    const data = readFileSync(source);
    const gzipped = gzipSync(data, { level: 9 });

    writeFileSync(source + '.gz', gzipped);

    return gzipped.length;
};

const listTsFiles = (directory, accumulator = []) =>
{
    if(!existsSync(directory))
    {
        return accumulator;
    }

    for(const name of readdirSync(directory).sort())
    {
        if
        (
            name === 'node_modules' ||
            name === 'release' ||
            name.startsWith('.')
        )
        {
            continue;
        }

        const full = join(directory, name);
        const state = statSync(full);

        if(state.isDirectory())
        {
            listTsFiles(full, accumulator);
        }
        else if
        (
            name.endsWith('.ts') &&
            !name.endsWith('.d.ts')
        )
        {
            accumulator.push(full);
        }
    }

    return accumulator;
};

async function buildBundle(bundle)
{
    const entry =
        resolve(repoRoot, bundle.entry);

    if(!existsSync(entry))
    {
        console.log
        (
            `⚠  ${bundle.entry} not found — skipping ${bundle.name}`
        );

        return;
    }

    const outfile =
        resolve(outDir, `${bundle.name}.js`);

    const options =
    {
        entryPoints       : [entry],
        bundle            : true,
        format            : 'esm',
        platform          : 'browser',
        target            : 'es2022',
        outfile,
        external          : bundle.external,
        plugins           : bundle.plugins,
        sourcemap         : false,
        legalComments     : 'eof',
        absWorkingDir     : repoRoot,
        ignoreAnnotations : true
    };

    if(watch)
    {
        const context =
            await esbuild.context(options);

        await context.watch();

        console.log(`👀 watching → ${outfile}`);

        return;
    }

    await esbuild.build(options);

    console.log
    (
        `✓ esbuild → release/dist/${bundle.name}.js  (${fmtSize(sizeOf(outfile))})`
    );

    if(skipMin)
    {
        return;
    }

    const code = readFileSync(outfile, 'utf8');
    const minOut = resolve(outDir, `${bundle.name}.min.js`);
    const mapOut = resolve(outDir, `${bundle.name}.min.js.map`);

    const result =
        await terserMinify
        (
            code,
            {
                ecma     : 2022,
                module   : true,
                compress : { passes: 2 },
                mangle   : true,
                sourceMap:
                {
                    filename : `${bundle.name}.min.js`,
                    url      : `${bundle.name}.min.js.map`
                },
                format:
                {
                    comments: false
                }
            }
        );

    if(result.error)
    {
        throw result.error;
    }

    writeFileSync(minOut, result.code);

    if(result.map)
    {
        writeFileSync(mapOut, result.map);
    }

    console.log
    (
        `✓ terser  → release/dist/${bundle.name}.min.js  (${fmtSize(sizeOf(minOut))})`
    );

    const plainGzip = writeGzip(outfile);
    const minGzip   = writeGzip(minOut);

    console.log
    (
        `✓ gzip    → release/dist/${bundle.name}.js.gz       (${fmtSize(plainGzip)})`
    );

    console.log
    (
        `✓ gzip    → release/dist/${bundle.name}.min.js.gz   (${fmtSize(minGzip)})`
    );
}

function generateDeclarations()
{
    if(skipTypes)
    {
        return;
    }

    console.log('');
    console.log('── declarations ─────────────────────────────────────');

    /*
     * 1. Keep the normal source declaration graph under types/dist for the
     *    repository/package type tree.
     */
    if(existsSync(typesOut))
    {
        try
        {
            rmSync
            (
                typesOut,
                {
                    recursive : true,
                    force     : true
                }
            );
        }
        catch {}
    }

    mkdirSync(typesOut, { recursive: true });

    const tsFiles = [
        ...listTsFiles(resolve(repoRoot, 'core')),
        ...listTsFiles(resolve(repoRoot, 'components')),
        ...listTsFiles(resolve(repoRoot, 'additionals'))
    ];

    const isWindows =
        process.platform === 'win32';

    const tscBin =
        resolve
        (
            repoRoot,
            'node_modules',
            '.bin',
            isWindows ? 'tsc.cmd' : 'tsc'
        );

    const tscCommand =
        existsSync(tscBin)
            ? tscBin
            : 'tsc';

    if(tsFiles.length > 0)
    {
        const sourceArgs = [
            '--declaration',
            '--emitDeclarationOnly',
            '--declarationDir', typesOut,
            '--rootDir', repoRoot,
            '--target', 'es2022',
            '--module', 'esnext',
            '--moduleResolution', 'bundler',
            '--allowImportingTsExtensions',
            '--strict', 'false',
            '--skipLibCheck',
            '--noEmitOnError', 'false',
            ...tsFiles.map
            (
                file => relative(repoRoot, file)
            )
        ];

        const sourceResult =
            spawnSync
            (
                tscCommand,
                sourceArgs,
                {
                    cwd      : repoRoot,
                    stdio    : ['ignore', 'pipe', 'pipe'],
                    encoding : 'utf8',
                    shell    : false
                }
            );

        if(sourceResult.status !== 0)
        {
            const output =
                (sourceResult.stdout || '') +
                (sourceResult.stderr || '');

            console.log
            (
                '⚠  tsc reported issues during source declaration emit (build continues):'
            );

            console.log
            (
                output
                    .split('\n')
                    .slice(-15)
                    .join('\n')
                    .replace(/^/gm, '   ')
            );
        }

        const emitted =
            readdirSync
            (
                typesOut,
                {
                    recursive: true
                }
            )
            .filter
            (
                file =>
                    typeof file === 'string' &&
                    file.endsWith('.d.ts')
            )
            .length;

        console.log
        (
            `✓ tsc     → types/dist/*.d.ts  (${emitted} files)`
        );
    }

    /*
     * 2. Generate the PORTABLE declaration directly from the already-bundled
     *    AriannA ESM runtime.
     *
     *    This intentionally avoids dts-bundle-generator / API Extractor and
     *    therefore avoids a second traversal of AriannA's source declaration
     *    graph. The input is one file (arianna.js), so the emitted declaration
     *    is one file and has no local ./types dependency.
     */
    const runtime =
        resolve(outDir, 'arianna.js');

    if(!existsSync(runtime))
    {
        throw new Error
        (
            'Portable declaration generation requires release/dist/arianna.js'
        );
    }

    const portableTemp =
        resolve(outDir, '.portable-types');

    if(existsSync(portableTemp))
    {
        rmSync
        (
            portableTemp,
            {
                recursive : true,
                force     : true
            }
        );
    }

    mkdirSync
    (
        portableTemp,
        {
            recursive: true
        }
    );

    const portableArgs = [
        '--allowJs',
        '--checkJs', 'false',
        '--declaration',
        '--emitDeclarationOnly',
        '--outDir', portableTemp,
        '--target', 'es2022',
        '--module', 'esnext',
        '--moduleResolution', 'bundler',
        '--skipLibCheck',
        '--noEmitOnError', 'false',
        runtime
    ];

    const portableResult =
        spawnSync
        (
            tscCommand,
            portableArgs,
            {
                cwd      : repoRoot,
                stdio    : ['ignore', 'pipe', 'pipe'],
                encoding : 'utf8',
                shell    : false
            }
        );

    const generated =
        resolve(portableTemp, 'arianna.d.ts');

    if(!existsSync(generated))
    {
        const output =
            (portableResult.stdout || '') +
            (portableResult.stderr || '');

        throw new Error
        (
            'Portable declaration generation failed.\n' +
            output.split('\n').slice(-25).join('\n')
        );
    }

    const portable =
        readFileSync(generated, 'utf8');

    if
    (
        /(?:from|import)\s*["']\.\/types\//.test(portable) ||
        /reference\s+path=["'][^"']*types\//.test(portable)
    )
    {
        throw new Error
        (
            'Generated arianna.d.ts is not portable: local ./types dependency detected.'
        );
    }

    const declarationOut =
        resolve(outDir, 'arianna.d.ts');

    const minDeclarationOut =
        resolve(outDir, 'arianna.min.d.ts');

    writeFileSync
    (
        declarationOut,
        portable
    );

    writeFileSync
    (
        minDeclarationOut,
        portable
    );

    rmSync
    (
        portableTemp,
        {
            recursive : true,
            force     : true
        }
    );

    console.log
    (
        `✓ dts     → release/dist/arianna.d.ts      (${fmtSize(sizeOf(declarationOut))})`
    );

    console.log
    (
        `✓ dts     → release/dist/arianna.min.d.ts  (${fmtSize(sizeOf(minDeclarationOut))})`
    );
}

async function syncBenchmarks()
{
    if(watch || skipMin)
    {
        return;
    }

    console.log('');
    console.log('── benchmark sync ───────────────────────────────────');

    const runtime =
        resolve(outDir, 'arianna.min.js');

    const declaration =
        resolve(outDir, 'arianna.min.d.ts');

    if(!existsSync(runtime))
    {
        throw new Error
        (
            'Benchmark sync requires release/dist/arianna.min.js'
        );
    }

    if(!skipTypes && !existsSync(declaration))
    {
        throw new Error
        (
            'Benchmark sync requires release/dist/arianna.min.d.ts'
        );
    }

    const benchmarkRoots = [
        resolve
        (
            repoRoot,
            '..',
            'arianna-benchmarks',
            'js-framework-benchmark',
            'frameworks',
            'keyed',
            'arianna',
            'src'
        ),
        resolve
        (
            repoRoot,
            '..',
            'arianna-benchmarks',
            'js-framework-benchmark',
            'frameworks',
            'non-keyed',
            'arianna',
            'src'
        )
    ];

    for(const srcDir of benchmarkRoots)
    {
        if(!existsSync(srcDir))
        {
            console.log
            (
                `⚠  benchmark not found — skipping ${relative(repoRoot, srcDir)}`
            );

            continue;
        }

        const mainTs =
            resolve(srcDir, 'Main.ts');

        const mainJs =
            resolve(srcDir, 'Main.js');

        copyFileSync
        (
            runtime,
            resolve(srcDir, 'arianna.min.js')
        );

        if(!skipTypes)
        {
            copyFileSync
            (
                declaration,
                resolve(srcDir, 'arianna.min.d.ts')
            );

        }

        console.log
        (
            `✓ runtime → ${relative(repoRoot, resolve(srcDir, 'arianna.min.js'))}`
        );

        if(!skipTypes)
        {
            console.log
            (
                `✓ types   → ${relative(repoRoot, resolve(srcDir, 'arianna.min.d.ts'))}`
            );
        }

        if(existsSync(mainTs))
        {
            const result =
                await CompileFile
                (
                    mainTs,
                    mainJs,
                    {
                        TemplateRef: 'Templates.Template'
                    }
                );

            console.log
            (
                `✓ benchmark → ${relative(repoRoot, mainJs)}` +
                ` (${result.Compiled} compiled, ${result.Promoted} promoted, ${result.Dynamic} dynamic)`
            );
        }
    }
}

function generateAriannATs()
{
    if(skipSingle)
    {
        return;
    }

    console.log('');
    console.log('── single-file aggregator ───────────────────────────');

    const orderedRoots =
        ['core', 'components', 'additionals'];

    const files = [];

    for(const sourceRoot of orderedRoots)
    {
        files.push
        (
            ...listTsFiles
            (
                resolve(repoRoot, sourceRoot)
            )
        );
    }

    if(files.length === 0)
    {
        console.log
        (
            '⚠  no .ts sources found — skipping AriannA.ts'
        );

        return;
    }

    const header =
`/**
 * AriannA.ts — single-file source aggregator
 * Auto-generated by scripts/build.mjs at ${new Date().toISOString()}
 *
 * DO NOT EDIT — this file is regenerated on every build.
 */

`;

    let body = '';

    for(const file of files)
    {
        const sourcePath =
            relative(repoRoot, file)
                .split(sep)
                .join('/');

        const source =
            readFileSync(file, 'utf8');

        body +=
            '\n// ═══════════════════════════════════════════════════════════════════════\n' +
            `// ${sourcePath}\n` +
            '// ═══════════════════════════════════════════════════════════════════════\n\n' +
            source;

        if(!source.endsWith('\n'))
        {
            body += '\n';
        }
    }

    const output =
        resolve(outDir, 'AriannA.ts');

    writeFileSync
    (
        output,
        header + body
    );

    console.log
    (
        `✓ aggregate → release/dist/AriannA.ts  (${fmtSize(sizeOf(output))}, ${files.length} files)`
    );
}

function copyMetaFiles()
{
    if(skipMeta)
    {
        return;
    }

    const candidates = [
        ['package.json',  ['release/package.json', 'dist-package.json', 'package.json']],
        ['README.md',     ['release/README.md', 'dist-README.md', 'README.md']],
        ['LICENSE',       ['release/LICENSE', 'LICENSE']],
        ['CHANGELOG.md',  ['release/CHANGELOG.md', 'CHANGELOG.md']]
    ];

    console.log('');

    for(const [destinationName, sourceCandidates] of candidates)
    {
        const source =
            sourceCandidates.find
            (
                candidate =>
                    existsSync
                    (
                        resolve(repoRoot, candidate)
                    )
            );

        if(!source)
        {
            console.log
            (
                `⚠  ${destinationName} not found in any candidate path`
            );

            continue;
        }

        copyFileSync
        (
            resolve(repoRoot, source),
            resolve(outDir, destinationName)
        );

        console.log
        (
            `✓ meta    → release/dist/${destinationName}  (from ${source})`
        );
    }
}

(async () =>
{
    const start = Date.now();

    console.log
    (
        `⚡ Building AriannA${watch ? ' (watch)' : skipMin ? ' (no minify)' : ''}...`
    );

    console.log(`  out: ${outDir}`);
    console.log('');

    try
    {
        for(const bundle of bundles)
        {
            console.log
            (
                `── ${bundle.name} ───────────────────────────────────────`
            );

            await buildBundle(bundle);

            console.log('');
        }

        if(!watch)
        {
            generateDeclarations();
            await syncBenchmarks();
            generateAriannATs();
        }

        copyMetaFiles();

        if(!watch)
        {
            const milliseconds =
                Date.now() - start;

            console.log('');
            console.log
            (
                `✓ release/dist build complete in ${milliseconds} ms`
            );

            console.log
            (
                '  → publish with:    npm publish release/dist'
            );
        }
    }
    catch(error)
    {
        console.error('');
        console.error
        (
            '❌ Build failed:',
            error?.message || error
        );

        process.exit(1);
    }
})();
