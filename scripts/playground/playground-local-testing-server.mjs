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
    return path.resolve(start, '..', '..'); // fallback: scripts/playground/ → root
}

const projectRoot = findProjectRoot(__dirname);
const port = Number(process.argv[2] ?? 8080);
// Host override (HOST=localhost). Safari validates the TLS cert against the host:
// if you serve on 127.0.0.1 the cert must carry an IP SAN for 127.0.0.1, otherwise
// use HOST=localhost so the localhost-* cert matches. Default keeps prior behaviour.
const host = process.env.HOST ?? '127.0.0.1';
const root = projectRoot;
const startPath = '/devtools/playground/playground.html?bundle=/release/dist/';

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

// Safari is strict about Content-Type: media served as application/octet-stream
// will NOT play. Exact types for the formats the Audio/Video components use, plus
// fonts (Safari refuses cross-typed font payloads).
const mime = {
    // documents / scripts
    '.html':  'text/html; charset=utf-8',
    '.js':    'text/javascript; charset=utf-8',
    '.mjs':   'text/javascript; charset=utf-8',
    '.ts':    'text/javascript; charset=utf-8',
    '.css':   'text/css; charset=utf-8',
    '.json':  'application/json; charset=utf-8',
    '.map':   'application/json; charset=utf-8',
    '.wasm':  'application/wasm',
    // images
    '.svg':   'image/svg+xml',
    '.png':   'image/png',
    '.jpg':   'image/jpeg',
    '.jpeg':  'image/jpeg',
    '.gif':   'image/gif',
    '.webp':  'image/webp',
    '.avif':  'image/avif',
    '.ico':   'image/x-icon',
    // video — Safari wants the precise type
    '.mp4':   'video/mp4',
    '.m4v':   'video/mp4',
    '.mov':   'video/quicktime',
    '.webm':  'video/webm',
    '.ogv':   'video/ogg',
    // audio
    '.mp3':   'audio/mpeg',
    '.m4a':   'audio/mp4',
    '.aac':   'audio/aac',
    '.oga':   'audio/ogg',
    '.ogg':   'audio/ogg',
    '.opus':  'audio/ogg',
    '.wav':   'audio/wav',
    '.flac':  'audio/flac',
    // fonts
    '.woff':  'font/woff',
    '.woff2': 'font/woff2',
    '.ttf':   'font/ttf',
    '.otf':   'font/otf',
    '.eot':   'application/vnd.ms-fontobject',
};

function contentType(file) {
    return mime[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
}

const server = https.createServer({
    key:  fs.readFileSync(keyFile),
    cert: fs.readFileSync(certFile),
}, (req, res) => {
    const method = req.method ?? 'GET';
    if (method !== 'GET' && method !== 'HEAD') {
        res.writeHead(405, { 'Allow': 'GET, HEAD' });
        return res.end('Method Not Allowed');
    }

    const url = new URL(req.url ?? '/', `https://${host}:${port}`);
    const pathname = url.pathname === '/' ? startPath.split('?')[0] : url.pathname;
    const file = path.normalize(path.join(root, decodeURIComponent(pathname)));

    if (!file.startsWith(root)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    fs.stat(file, (err, stat) => {
        if (err || !stat.isFile()) {
            console.warn(`[playground] 404  ${pathname}  ->  ${file}`);
            res.writeHead(404);
            return res.end('Not found');
        }

        const type  = contentType(file);
        const total = stat.size;

        // Accept-Ranges advertises byte-serving — Safari checks for this before it
        // will load <video>/<audio> media at all.
        const baseHeaders = {
            'Content-Type':  type,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'no-store',
        };

        // ── Range request → 206 Partial Content (Safari media playback) ──────
        const range = req.headers.range;
        if (range) {
            const m = /^bytes=(\d*)-(\d*)$/.exec(String(range).trim());

            // A well-formed, non-empty single range. Malformed/multi ranges fall
            // through to a normal 200 (per RFC 7233 a bad Range is ignored).
            if (m && !(m[1] === '' && m[2] === '')) {
                let start;
                let end;

                if (m[1] === '') {
                    // suffix range "bytes=-N" → final N bytes
                    const n = parseInt(m[2], 10);
                    start = Math.max(0, total - n);
                    end   = total - 1;
                } else {
                    start = parseInt(m[1], 10);
                    end   = m[2] === '' ? total - 1 : Math.min(parseInt(m[2], 10), total - 1);
                }

                if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= total) {
                    res.writeHead(416, { ...baseHeaders, 'Content-Range': `bytes */${total}` });
                    return res.end();
                }

                const chunkSize = end - start + 1;
                res.writeHead(206, {
                    ...baseHeaders,
                    'Content-Range':  `bytes ${start}-${end}/${total}`,
                    'Content-Length': chunkSize,
                });
                if (method === 'HEAD') return res.end();
                return fs.createReadStream(file, { start, end }).pipe(res);
            }
        }

        // ── Full response ───────────────────────────────────────────────────
        res.writeHead(200, { ...baseHeaders, 'Content-Length': total });
        if (method === 'HEAD') return res.end();
        fs.createReadStream(file).pipe(res);
    });
});

server.listen(port, host, () => {
    const url = `https://${host}:${port}${startPath}`;
    console.log(`Local server : https://${host}:${port}/`);
    console.log(`Project root : ${projectRoot}`);
    console.log(`Serving dist : ${path.join(projectRoot, 'release', 'dist')}  exists=${fs.existsSync(path.join(projectRoot,'release','dist'))}`);
    console.log(`Playground   : ${url}`);
    console.log('Safari note  : trust the self-signed cert in Keychain (it must cover this host),');
    console.log('               then media <video>/<audio> works via 206 Range responses.');

    // Open Safari on macOS by default; override with BROWSER (e.g. BROWSER="Google Chrome").
    const browser = process.env.BROWSER;
    const opener =
        process.platform === 'darwin' ? ['open', ['-a', browser ?? 'Safari', url]] :
        process.platform === 'win32'  ? ['cmd', ['/c', 'start', '', browser ?? 'msedge', url]] :
                                        ['xdg-open', [url]];
    try { spawn(opener[0], opener[1], { detached: true, stdio: 'ignore' }).unref(); }
    catch { /* best-effort */ }
});
