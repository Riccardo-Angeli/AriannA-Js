import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..');

export default {
    port: 8080,
    root: path.join(projectRoot, 'devtools', 'playground'),
    index: 'playground.html',

    https: {
        key: path.join(projectRoot, 'scripts', 'certs', 'localhost-key.pem'),
        cert: path.join(projectRoot, 'scripts', 'certs', 'localhost-cert.pem'),
    },

    mime: {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.mjs': 'text/javascript; charset=utf-8',
        '.ts': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.wasm': 'application/wasm',
        '.map': 'application/json; charset=utf-8',
    },
};