import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const port = Number(process.argv[2] ?? 8080);
const root = projectRoot;
const startPath = '/devtools/playground/playground.html?bundle=/release/dist/';

const keyFile = path.join(projectRoot, 'scripts/certs/localhost-key.pem');
const certFile = path.join(projectRoot, 'scripts/certs/localhost-cert.pem');

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
    const pathname = url.pathname === '/' ? startPath : url.pathname;
    const file = path.normalize(path.join(root, decodeURIComponent(pathname)));

    if (!file.startsWith(root)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    fs.stat(file, (err, stat) => {
        if (err || !stat.isFile()) {
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
    console.log(`Local server: https://127.0.0.1:${port}/`);

    spawn('open', ['-a', 'Firefox', url], {
        detached: true,
        stdio: 'ignore'
    }).unref();
});