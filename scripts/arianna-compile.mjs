#!/usr/bin/env node
/**
 * @module      scripts/arianna-compile
 * @description AriannA compiler CLI and Node build adapter. The actual compiler implementation lives only in
 *              core/Compiler.ts under the Compilers namespace; this script transpiles that source for Node,
 *              loads it once, and delegates compilation to Compilers.Compiler.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const compilerSource = resolve(repoRoot, 'core', 'Compiler.ts');

let compilerPromise = null;

export async function LoadCompiler()
{
    if(compilerPromise)
    {
        return compilerPromise;
    }

    compilerPromise =
        (async () =>
        {
            const result = await esbuild.build
            ({
                entryPoints   : [compilerSource],
                bundle        : true,
                write         : false,
                format        : 'esm',
                platform      : 'node',
                target        : 'node22',
                sourcemap     : false,
                packages      : 'external',
                logLevel      : 'silent'
            });

            /*
             * Load the generated compiler from a real file URL instead of a
             * data: URL. Node can then resolve external packages such as
             * `typescript` normally from the AriannA project node_modules.
             */
            const cacheDirectory =
                resolve(repoRoot, '.arianna-cache');

            const cacheFile =
                resolve(cacheDirectory, 'Compiler.mjs');

            await mkdir
            (
                cacheDirectory,
                {
                    recursive: true
                }
            );

            await writeFile
            (
                cacheFile,
                result.outputFiles[0].text,
                'utf8'
            );

            const module =
                await import
                (
                    pathToFileURL(cacheFile).href +
                    `?v=${Date.now()}`
                );

            if(!module?.Compilers?.Compiler)
            {
                throw new Error
                (
                    '[arianna] core/Compiler.ts did not export Compilers.Compiler.'
                );
            }

            return module.Compilers.Compiler;
        })();

    return compilerPromise;
}

export async function CompileSource
(
    source,
    options = {}
)
{
    const Compiler = await LoadCompiler();

    return Compiler.Compile
    (
        source,
        {
            FileName    : options.FileName,
            TemplateRef : options.TemplateRef
        }
    );
}

export async function CompileFile
(
    input,
    output,
    options = {}
)
{
    const source =
        await readFile(input, 'utf8');

    const result =
        await CompileSource
        (
            source,
            {
                ...options,
                FileName: options.FileName ?? input
            }
        );

    await mkdir(dirname(output), { recursive: true });

    /*
     * The AriannA compiler transforms templates but intentionally preserves
     * the surrounding source language. When a TypeScript input is explicitly
     * requested as a .js output (the benchmark Main.ts -> Main.js path),
     * perform the final syntax lowering here so the produced file is real
     * JavaScript rather than TypeScript stored under a .js extension.
     */
    const inputExtension =
        extname(input).toLowerCase();

    const outputExtension =
        extname(output).toLowerCase();

    let code =
        result.Code;

    if
    (
        (inputExtension === '.ts' || inputExtension === '.tsx') &&
        (outputExtension === '.js' || outputExtension === '.mjs' || outputExtension === '.cjs')
    )
    {
        const transformed =
            await esbuild.transform
            (
                code,
                {
                    loader    : inputExtension === '.tsx' ? 'tsx' : 'ts',
                    format    : 'esm',
                    target    : 'es2022',
                    sourcemap : false,
                    legalComments : 'none'
                }
            );

        code =
            transformed.code;
    }

    await writeFile(output, code, 'utf8');

    return {
        ...result,
        Code: code
    };
}

function DefaultOutput(input)
{
    const extension = extname(input);

    if(!extension)
    {
        return input + '.compiled';
    }

    return (
        input.slice(0, -extension.length) +
        '.compiled' +
        extension
    );
}

async function Main()
{
    const args = process.argv.slice(2);

    if(args.includes('--help') || args.includes('-h'))
    {
        console.log
        (
            'usage: arianna-compile <input.ts|js> [-o output] [--template-ref path]'
        );

        return;
    }

    const input = args[0];

    if(!input)
    {
        console.error
        (
            'usage: arianna-compile <input.ts|js> [-o output] [--template-ref path]'
        );

        process.exit(2);
    }

    const outputIndex = args.indexOf('-o');
    const templateIndex = args.indexOf('--template-ref');

    const output =
        outputIndex >= 0
            ? args[outputIndex + 1]
            : DefaultOutput(input);

    const templateRef =
        templateIndex >= 0
            ? args[templateIndex + 1]
            : 'Templates.Template';

    const result =
        await CompileFile
        (
            resolve(input),
            resolve(output),
            {
                TemplateRef: templateRef
            }
        );

    console.log
    (
        JSON.stringify
        (
            {
                input,
                output,
                compiledTemplates : result.Compiled,
                promotedTemplates : result.Promoted,
                dynamicTemplates  : result.Dynamic,
                templateRef
            },
            null,
            2
        )
    );
}

if
(
    process.argv[1] &&
    pathToFileURL(resolve(process.argv[1])).href === import.meta.url
)
{
    Main().catch
    (
        error =>
        {
            console.error(error);
            process.exit(1);
        }
    );
}
