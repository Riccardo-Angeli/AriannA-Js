#!/usr/bin/env node
/**
 * @module      scripts/arianna-compile
 * @description AriannA compiler CLI and Node build adapter. The actual compiler implementation lives only in
 *              core/compiler/Compiler.ts under the Compilers namespace; this script transpiles that source for Node,
 *              loads it once, and delegates compilation to Compilers.Compiler.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const compilerSource = resolve(repoRoot, 'core', 'compiler', 'Compiler.ts');

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
                    '[arianna] core/compiler/Compiler.ts did not export Compilers.Compiler.'
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

    /*
     * CompileSource intentionally preserves the source language because the
     * build plugin hands result.Code back to esbuild with the original loader.
     *
     * CompileFile is different: its destination can be a real .js file
     * (benchmarks generate src/Main.js from src/Main.ts). Therefore the
     * compiler output must be transpiled before it is written, otherwise
     * TypeScript-only syntax such as interfaces and type annotations leaks
     * into JavaScript.
     */
    const extension =
        extname(input).toLowerCase();

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

    const transpiled =
        await esbuild.transform
        (
            result.Code,
            {
                loader,
                format    : 'esm',
                target    : 'es2022',
                sourcemap : false,
                sourcefile: options.FileName ?? input
            }
        );

    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, transpiled.code, 'utf8');

    return {
        ...result,
        Code: transpiled.code
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
