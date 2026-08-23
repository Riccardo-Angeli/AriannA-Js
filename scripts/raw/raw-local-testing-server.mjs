import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Find the project root robustly ──────────────────────────────────────────
// Walk UP from this file until we find a folder that contains release/dist.
function findProjectRoot(start) {
    let dir = start;
    for (let i = 0; i < 8; i++) {
        if (fs.existsSync(path.join(dir, 'release', 'dist'))) return dir;
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    return path.resolve(start, '..', '..'); // fallback: scripts/raw/ → root
}

const projectRoot = findProjectRoot(__dirname);
const port = Number(process.argv[2] ?? 8081);
const root = projectRoot;
const startPath = '/devtools/raw/raw.html?bundle=/release/dist/';

function findCert(name) {
    const tries = [
        path.join(projectRoot, 'scripts', 'certs', name),
        path.join(projectRoot, 'certs', name),
        path.join(__dirname, 'certs', name),
    ];
    return tries.find(p => fs.existsSync(p)) ?? tries[0];
}
const keyFile  = findCert('localhost-key.pem');
const certFile = findCert('localhost-cert.pem');

const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.ts': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.wasm': 'application/wasm',
    '.map': 'application/json; charset=utf-8'
};

const server = https.createServer({
    key: fs.readFileSync(keyFile),
    cert: fs.readFileSync(certFile)
}, (req, res) => {
    const url = new URL(req.url ?? '/', `https://127.0.0.1:${port}`);
    const pathname = url.pathname === '/' ? startPath.split('?')[0] : url.pathname;
    const file = path.normalize(path.join(root, decodeURIComponent(pathname)));

    if (!file.startsWith(root)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    fs.stat(file, (err, stat) => {
        if (err || !stat.isFile()) {
            console.warn(`[raw] 404  ${pathname}  ->  ${file}`);
            res.writeHead(404);
            return res.end('Not found');
        }
        res.writeHead(200, {
            'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream',
            'Cache-Control': 'no-store'
        });
        fs.createReadStream(file).pipe(res);
    });
});

server.listen(port, '127.0.0.1', () => {
    const url = `https://127.0.0.1:${port}${startPath}`;
    console.log(`Local server : https://127.0.0.1:${port}/`);
    console.log(`Project root : ${projectRoot}`);
    console.log(`Serving dist : ${path.join(projectRoot, 'release', 'dist')}  exists=${fs.existsSync(path.join(projectRoot,'release','dist'))}`);
    console.log(`Raw page     : ${url}`);

    const opener =
        process.platform === 'darwin' ? ['open', ['-a', 'Safari', url]] :
        process.platform === 'win32'  ? ['cmd', ['/c', 'start', 'safari', url]] :
                                        ['xdg-open', [url]];
    try { spawn(opener[0], opener[1], { detached: true, stdio: 'ignore' }).unref(); }
    catch { /* best-effort */ }
});
