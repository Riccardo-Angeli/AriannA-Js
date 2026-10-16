/** Device companion bundles. Import from scripts/build.mjs. */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import * as esbuild from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outdir = resolve(root, 'release/dist');
const watch = process.argv.includes('--watch');
const skipMin = watch || process.argv.includes('--skip-min');
const entries = {
    'arianna-device-mobile': 'components/mobile/index.ts',
    'arianna-device-watch': 'components/watch/index.ts',
    'arianna-device-tv': 'components/tv/index.ts',
    'arianna-device-services': 'additionals/mobile/index.ts'
};
for (const entry of Object.values(entries)) {
    if (!existsSync(resolve(root, entry))) throw new Error(`Device build: missing ${entry}`);
}
mkdirSync(outdir, {recursive:true});

const core = {
    name: 'device-canonical-core',
    setup(build) {
        build.onResolve({filter:/core\/index\.ts$/}, () => ({path:'./arianna.js', external:true}));
    }
};
const artifacts = {
    name: 'device-artifacts',
    setup(build) {
        build.onEnd(async result => {
            if (result.errors.length) return;
            const outputs = Object.keys(result.metafile.outputs).map(file => resolve(root, file));
            const live = new Set(outputs.map(file => file.split(/[\\/]/).pop()));
            // Remove only stale chunk files owned by this build; preserve all main bundles.
            for (const name of readdirSync(outdir)) {
                if (/^device-chunk-[A-Z0-9]+\.js(?:\.gz)?$/.test(name) && !live.has(name.replace(/\.gz$/, ''))) {
                    rmSync(resolve(outdir, name));
                }
            }
            for (const file of outputs) {
                if (!file.endsWith('.js')) continue;
                const code = readFileSync(file, 'utf8');
                writeFileSync(file + '.gz', gzipSync(code));
                if (!skipMin && Object.keys(entries).some(name => file.endsWith('/' + name + '.js') || file.endsWith('\\' + name + '.js'))) {
                    // Minified entry points retain imports to the shared canonical chunks.
                    const minified = await esbuild.transform(code, {minify:true, format:'esm', target:'es2022'});
                    const minfile = file.replace(/\.js$/, '.min.js');
                    writeFileSync(minfile, minified.code);
                    writeFileSync(minfile + '.gz', gzipSync(minified.code));
                }
            }
            console.log(`✓ devices → release/dist (${outputs.length} ESM files; Mobile, Watch, TV, services)`);
        });
    }
};
const options = {
    absWorkingDir:root,
    entryPoints:Object.fromEntries(Object.entries(entries).map(([name, entry]) => [name, resolve(root, entry)])),
    outdir,
    bundle:true,
    splitting:true,
    format:'esm',
    platform:'browser',
    target:'es2022',
    chunkNames:'device-chunk-[hash]',
    metafile:true,
    ignoreAnnotations:true,
    external:['@tauri-apps/*'],
    plugins:[core, artifacts]
};
if (watch) {
    const context = await esbuild.context(options);
    await context.watch();
} else {
    await esbuild.build(options);
}
