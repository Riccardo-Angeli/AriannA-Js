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

const sourceRoots =
[
    resolve(repoRoot, 'core'),
    resolve(repoRoot, 'components'),
    resolve(repoRoot, 'additionals')
];

const isProjectSource =
    file =>
        sourceRoots.some
        (
            root =>
                file === root ||
                file.startsWith(root + sep)
        );

function AriannaCompiler(bundleName)
{
    let compiledFiles = 0;
    let compiledTemplates = 0;
    let promotedTemplates = 0;
    let dynamicTemplates = 0;

    return {
        name: 'arianna-compiler',

        setup(build)
        {
            build.onStart
            (
                () =>
                {
                    compiledFiles = 0;
                    compiledTemplates = 0;
                    promotedTemplates = 0;
                    dynamicTemplates = 0;
                }
            );

            build.onLoad
            (
                { filter: /\.[cm]?[jt]sx?$/ },
                async args =>
                {
                    if(!isProjectSource(args.path))
                    {
                        return null;
                    }

                    /*
                     * Compiler.ts is the build-time compiler itself. Compiling
                     * the compiler through itself would recurse.
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

                    compiledTemplates += result.Compiled ?? 0;
                    promotedTemplates += result.Promoted ?? 0;
                    dynamicTemplates += result.Dynamic ?? 0;

                    if(result.Code === source)
                    {
                        return null;
                    }

                    compiledFiles++;

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
                        contents   : result.Code,
                        loader,
                        resolveDir : dirname(args.path)
                    };
                }
            );

            build.onEnd
            (
                result =>
                {
                    if(result.errors.length)
                    {
                        return;
                    }

                    console.log
                    (
                        `✓ compiler → ${bundleName}: ${compiledTemplates} compiled template(s)` +
                        ` in ${compiledFiles} transformed file(s)` +
                        `${promotedTemplates ? ` · ${promotedTemplates} promoted` : ''}` +
                        `${dynamicTemplates ? ` · ${dynamicTemplates} dynamic fallback` : ''}`
                    );
                }
            );
        }
    };
}

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
        plugins  : [AriannaCompiler('arianna')]
    },
    {
        name     : 'arianna-components',
        entry    : 'components/index.ts',
        external : ['@tauri-apps/*'],
        plugins  : [AriannaCompiler('arianna-components'), externalizeCore]
    },
    {
        name     : 'arianna-additionals',
        entry    : 'additionals/index.ts',
        external : ['@tauri-apps/*'],
        plugins  : [AriannaCompiler('arianna-additionals'), externalizeCore]
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

async function syncBenchmarks()
{
    if(watch || skipMin)
    {
        return;
    }

    const runtime =
        resolve(outDir, 'arianna.min.js');

    if(!existsSync(runtime))
    {
        throw new Error
        (
            '[arianna] release/dist/arianna.min.js was not produced.'
        );
    }

    const benchmarks =
    [
        resolve(repoRoot, 'release', 'benchmark', 'keyed', 'arianna', 'src'),
        resolve(repoRoot, 'release', 'benchmark', 'non-keyed', 'arianna', 'src')
    ];

    console.log('');
    console.log('── benchmark sync ─────────────────────────────────────');

    for(const directory of benchmarks)
    {
        if(!existsSync(directory))
        {
            console.log
            (
                `⚠  benchmark source not found — skipping ${relative(repoRoot, directory)}`
            );

            continue;
        }

        const runtimeTarget =
            resolve(directory, 'arianna.min.js');

        copyFileSync(runtime, runtimeTarget);

        const mainTs =
            resolve(directory, 'Main.ts');

        const mainJs =
            resolve(directory, 'Main.js');

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

        console.log
        (
            `✓ runtime   → ${relative(repoRoot, runtimeTarget)}`
        );
    }
}

function generateDeclarations()
{
    if(skipTypes)
    {
        return;
    }

    console.log('');
    console.log('── declarations ─────────────────────────────────────');

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

    if(tsFiles.length === 0)
    {
        console.log
        (
            '⚠  no .ts sources found — skipping declaration generation'
        );

        return;
    }

    const tscArgs = [
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

    const result =
        spawnSync
        (
            tscCommand,
            tscArgs,
            {
                cwd      : repoRoot,
                stdio    : ['ignore', 'pipe', 'pipe'],
                encoding : 'utf8',
                shell    : false
            }
        );

    if(result.status !== 0)
    {
        const output =
            (result.stdout || '') +
            (result.stderr || '');

        const tail =
            output
                .split('\n')
                .slice(-15)
                .join('\n');

        console.log
        (
            '⚠  tsc reported issues during declaration emit (build continues):'
        );

        console.log
        (
            tail.replace(/^/gm, '   ')
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
            await syncBenchmarks();
            generateDeclarations();
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
