import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// scripts/playground/  → project root is TWO levels up.
const projectRoot = path.resolve(here, '..', '..');

export default {
    port: 8080,
    // Safari validates the TLS cert against the host. Use 'localhost' so the
    // localhost-* cert matches without an IP SAN; switch to '127.0.0.1' only if
    // your cert carries an IP SAN for it.
    host: process.env.HOST ?? 'localhost',
    root: path.join(projectRoot, 'devtools', 'playground'),
    index: 'playground.html',

    // Default browser to open. Override with BROWSER (e.g. "Google Chrome").
    browser: process.env.BROWSER ?? 'Safari',

    https: {
        key:  path.join(projectRoot, 'scripts', 'certs', 'localhost-key.pem'),
        cert: path.join(projectRoot, 'scripts', 'certs', 'localhost-cert.pem'),
    },

    // Safari refuses to play media / load fonts served with the wrong type, so
    // the map is explicit for every media + font format the playground may serve.
    mime: {
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
        // video
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
    },

    // Safari requires byte-serving (HTTP Range → 206) before it will play
    // <video>/<audio>. The server reads this to advertise Accept-Ranges: bytes.
    ranges: true,
};
