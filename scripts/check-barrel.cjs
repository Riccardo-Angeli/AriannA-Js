#!/usr/bin/env node
/* check-barrel — verifica che ogni named import runtime verso AriannA Core esista nel barrel.
 *
 * tsc NON intercetta questo errore: risolve sui sorgenti Architecture 2.0 (`core/**`),
 * mentre il bundler riscrive l'import verso il bundle `arianna`, che espone solo gli export
 * di core/index.ts. Un binding assente esplode a runtime nel loader ESM:
 *     "Importing binding name 'X' is not found."
 *
 * Uso:
 *   node check-barrel.cjs                         # trova la root da solo, risalendo dalla cwd
 *   node check-barrel.cjs /path/root              # root esplicita
 *   node check-barrel.cjs --ignore devtools/legacy --ignore vendor
 * Esclusioni anche da un file `.barrelignore` nella root (una per riga, # = commento).
 * Exit code 1 se trova import a rischio (utile in CI).
 */
const fs = require('fs'), path = require('path');

/* Root = prima cartella, risalendo, che contiene core/index.ts */
function findRoot(start) {
    let d = path.resolve(start);
    for (;;) {
        if (fs.existsSync(path.join(d, 'core', 'index.ts'))) return d;
        const up = path.dirname(d);
        if (up === d) return null;
        d = up;
    }
}

/* --ignore ripetibile + argomento posizionale per la root */
const argv = process.argv.slice(2);
const ignores = [];
let rootArg = null;
for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--ignore') { if (argv[++i]) ignores.push(argv[i]); }
    else if (!rootArg) rootArg = argv[i];
}

const root = rootArg ? path.resolve(rootArg) : findRoot(process.cwd());
if (!root || !fs.existsSync(path.join(root, 'core', 'index.ts'))) {
    console.error('✗ core/index.ts non trovato. Lancialo dentro il repo, o passa la root:\n' +
                  '  node check-barrel.cjs /percorso/della/root');
    process.exit(2);
}
/* .barrelignore nella root */
const ignFile = path.join(root, '.barrelignore');
if (fs.existsSync(ignFile))
    for (const l of fs.readFileSync(ignFile, 'utf8').split('\n')) {
        const t = l.trim();
        if (t && !t.startsWith('#')) ignores.push(t);
    }

/* Normalizza a separatori POSIX per confrontare su qualunque OS */
const norm    = p => p.split(path.sep).join('/');
const ignored = rel => ignores.some(i => norm(rel) === i || norm(rel).startsWith(i.replace(/\/$/, '') + '/'));

console.log('root: ' + root);
if (ignores.length) console.log('escluse: ' + ignores.join(', '));

/* Export del barrel */
const barrel = fs.readFileSync(path.join(root, 'core', 'index.ts'), 'utf8')
                 .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const exp = new Set();
for (const m of barrel.matchAll(/export\s+(?:declare\s+)?(?:const|class|function|type|namespace|let)\s+([A-Za-z_]\w*)/g))
    exp.add(m[1]);
for (const m of barrel.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g))
    for (let n of m[1].split(',')) {
        n = n.trim(); if (!n) continue;
        const as = n.match(/\bas\s+([A-Za-z_]\w*)/);
        exp.add(as ? as[1] : n.replace(/^(?:type|default)\s+/, '').trim());
    }

/* Tutti i .ts del repo TRANNE core/ e node_modules */
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', 'core']);
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => {
    if (SKIP.has(e.name)) return [];
    const f = path.join(d, e.name);
    return e.isDirectory() ? walk(f) : (/\.tsx?$/.test(e.name) ? [f] : []);
});

let bad = 0, scanned = 0, skipped = 0;
for (const f of walk(root)) {
    const rel = path.relative(root, f);
    if (ignored(rel)) { skipped++; continue; }
    const src = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    scanned++;
    for (const m of src.matchAll(/import\s+(type\s+)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g)) {
        const typeOnly = !!m[1];
        const specifier = m[3];

        let resolved = null;

        if (specifier.startsWith('.')) {
            resolved = path.resolve(path.dirname(f), specifier);
        } else if (specifier.startsWith('/')) {
            resolved = path.resolve(specifier);
        } else if (specifier === 'arianna') {
            resolved = path.join(root, 'core', 'index.ts');
        }

        if (!resolved) continue;

        const coreRoot = path.resolve(root, 'core');
        const normalizedResolved = path.resolve(resolved);

        const pointsToCore =
            specifier === 'arianna' ||
            normalizedResolved === coreRoot ||
            normalizedResolved.startsWith(coreRoot + path.sep);

        if (!pointsToCore) continue;

        for (let n of m[2].split(',')) {
            let raw = n.trim(); if (!raw) continue;
            const isTypeMember = /^type\s+/.test(raw);
            n = raw.replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim();

            if (!n || exp.has(n)) continue;
            if (typeOnly || isTypeMember) continue;          // elisi dal bundler

            console.log
            (
                `✗ ${rel}\n` +
                `    { ${n} } da '${specifier}' — NON esportato da core/index.ts`
            );

            bad++;
        }
    }
}

console.log(`\n${scanned} file analizzati${skipped ? ` · ${skipped} esclusi` : ''} · ${exp.size} export nel barrel`);
if (bad) { console.log(`${bad} import a rischio nel bundle.`); process.exit(1); }
console.log('✓ Tutti gli import verso il core esistono nel barrel.');
