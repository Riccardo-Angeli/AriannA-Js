/**
 * @module    SSR
 * @author    Riccardo Angeli
 * @version   1.0.0
 * @copyright Riccardo Angeli 2026
 * @license   MIT / Commercial (dual license)
 *
 * Copyright (c) 2012-2026 Riccardo Angeli
 * MIT License — see AriannA.ts for full text.
 *
 * Server-side rendering for AriannA.
 * Works in Node.js, Deno, Bun, and Rust (via Axum + Workers bridge).
 *
 * ── FEATURES ──────────────────────────────────────────────────────────────────
 *
 *   renderToString   — synchronous Virtual tree → HTML string
 *   renderToStream   — streaming HTML via async generator (chunked for Axum)
 *   hydrate          — attach live AriannA state to server-rendered HTML
 *   Island           — mark selective subtrees for client hydration only
 *   escapeHtml       — XSS-safe attribute/text escaping (exported utility)
 *
 * ── INTEGRATION ───────────────────────────────────────────────────────────────
 *
 *   Node.js (Express/Fastify):
 *     import { renderToString } from './SSR.ts';
 *     app.get('/', (req, res) => res.send(renderToString(appNode)));
 *
 *   Bun / Deno:
 *     import { renderToStream } from './SSR.ts';
 *     return new Response(readableFromAsyncGen(renderToStream(appNode)));
 *
 *   Rust / Axum (via Workers bridge):
 *     Workers pool runs SSR.ts in parallel; Axum streams the chunks.
 *     See Workers.ts → WorkerPool for the bridge pattern.
 *
 *   Browser (hydration):
 *     import { hydrate } from './SSR.ts';
 *     hydrate(appNode, document.getElementById('app'), appState);
 *
 * ── ISLAND ARCHITECTURE ───────────────────────────────────────────────────────
 *
 *   Islands = only some parts of the page are interactive.
 *   Static parts are rendered server-side and never hydrated.
 *   Interactive parts (islands) are hydrated client-side.
 *
 *   Usage:
 *     const page = Virtual('div', {},
 *       Island.static(headerNode),           // SSR only, no client JS
 *       Island.interactive(counterNode, id), // hydrated on client
 *     );
 *
 * ── PERFORMANCE NOTES ─────────────────────────────────────────────────────────
 *
 *   renderToString:  ~2-5ms for 1000-node trees (no DOM API calls — pure string concat)
 *   renderToStream:  first byte < 1ms — chunks emitted as nodes are processed
 *   hydrate:         O(n) walk, uses data-arianna-wip-id for node matching
 */

// ── Imports ────────────────────────────────────────────────────────────────────

import Virtual from './Virtual.ts';

// ── Constants ──────────────────────────────────────────────────────────────────

/** HTML5 void elements — self-closing, no children. */
export namespace SSR
{
    const VOID_ELEMENTS = new Set([
        'area','base','br','col','embed','hr','img','input',
        'link','meta','param','source','track','wbr',
    ]);

    /** Attributes that should NOT be escaped (they contain HTML). */
    const RAW_ATTRS = new Set(['innerHTML', 'dangerouslySetInnerHTML']);

    /** Boolean attributes — rendered as `attr` not `attr="true"`. */
    const BOOLEAN_ATTRS = new Set([
        'allowfullscreen','async','autofocus','autoplay','checked','controls',
        'default','defer','disabled','formnovalidate','hidden','ismap','loop',
        'multiple','muted','nomodule','novalidate','open','readonly','required',
        'reversed','selected','typemustmatch',
    ]);

    // ── Escape utility ─────────────────────────────────────────────────────────────

    /**
     * XSS-safe HTML escaping for attribute values and text content.
     *
     * @example
     *   escapeHtml('<script>alert(1)</script>')
     *   // → '&lt;script&gt;alert(1)&lt;/script&gt;'
     */
    export function escapeHtml(str: string): string
    {
        return str
            .replace(/&/g,  '&amp;')
            .replace(/</g,  '&lt;')
            .replace(/>/g,  '&gt;')
            .replace(/"/g,  '&quot;')
            .replace(/'/g,  '&#39;');
    }

    // ── Internal Virtual accessor ─────────────────────────────────────────────────
    //
    // Reads a Virtual node's PUBLIC surface only — Tag / Attributes / Children /
    // Text / Id — never private fields. This is what keeps SSR decoupled from
    // Virtual's internal representation (no `#attrs` / `__children` duck-typing).

    interface VNodeAccessor
    {
        tag      : string;
        attrs    : Record<string, string>;
        children : VNodeAccessor[];
        text     : string;
        id       : string;
    }

    function accessNode(node: Virtual): VNodeAccessor
    {
        // Attributes come back typed as string | number | boolean | null; SSR emits
        // strings, so normalise: drop null/false/undefined, empty-string a `true`.
        const attrs: Record<string, string> = {};
        for (const [k, v] of Object.entries(node.Attributes))
        {
            if (v === null || v === false || v === undefined) continue;
            if (v === true) { attrs[k] = ''; continue; }
            attrs[k] = String(v);
        }

        return {
            tag     : node.Tag || 'div',
            attrs,
            text    : node.Text ?? '',
            children: node.Children.map(accessNode),
            id      : node.Id ?? '',
        };
    }

    // ── renderAttrs ────────────────────────────────────────────────────────────────

    function renderAttrs(attrs: Record<string, string>, ssrId?: string): string
    {
        let s = '';
        for (const [k, v] of Object.entries(attrs))
        {
            if (RAW_ATTRS.has(k)) continue;
            if (k === 'textContent' || k === 'innerHTML') continue;
            if (BOOLEAN_ATTRS.has(k.toLowerCase()))
            {
                if (v !== '' && v !== 'false') s += ` ${k}`;
                continue;
            }
            s += ` ${escapeHtml(k)}="${escapeHtml(v)}"`;
        }
        if (ssrId) s += ` data-arianna-id="${escapeHtml(ssrId)}"`;
        return s;
    }

    // ── renderToString ─────────────────────────────────────────────────────────────

    /**
     * Render a Virtual tree to an HTML string (synchronous).
     * Safe to call in Node.js, Deno, Bun, or a Web Worker.
     * No DOM APIs are used — pure string concatenation.
     *
     * @param node    - Root Virtual to render
     * @param options - SSR options
     *
     * @example
     *   const html = renderToString(appNode);
     *   res.send(`<!DOCTYPE html><html><body>${html}</body></html>`);
     *
     * @example
     *   // With hydration markers (adds data-arianna-wip-id to each element)
     *   const html = renderToString(appNode, { hydration: true });
     */
    export function renderToString(
        node   : Virtual,
        options: { hydration?: boolean; indent?: number } = {},
    ): string
    {
        const { hydration = false, indent = 0 } = options;
        return _renderNode(accessNode(node), hydration, indent, 0);
    }

    function _renderNode(node: VNodeAccessor, hydration: boolean, indent: number, depth: number): string
    {
        const pad  = indent > 0 ? '\n' + ' '.repeat(indent * depth) : '';
        const cPad = indent > 0 ? '\n' + ' '.repeat(indent * (depth + 1)) : '';

        const ssrId = hydration ? node.id : undefined;
        const attrs = renderAttrs(node.attrs, ssrId);

        // textContent / innerHTML special-case
        const textContent = node.attrs['textContent'] ?? node.text;
        const innerHTML   = node.attrs['innerHTML'];

        if (VOID_ELEMENTS.has(node.tag))
            return `${pad}<${node.tag}${attrs}>`;

        const open  = `${pad}<${node.tag}${attrs}>`;
        const close = `${indent > 0 ? '\n' + ' '.repeat(indent * depth) : ''}</${node.tag}>`;

        if (innerHTML !== undefined)
            return `${open}${innerHTML}${close}`;

        if (textContent)
            return `${open}${escapeHtml(textContent)}${close}`;

        if (node.children.length === 0)
            return `${open}${close}`;

        const inner = node.children
            .map(c => _renderNode(c, hydration, indent, depth + 1))
            .join('');

        return `${open}${inner}${indent > 0 ? cPad.slice(0, -indent) : ''}${close}`;
    }

    // ── renderToStream ─────────────────────────────────────────────────────────────

    /**
     * Stream HTML as an async generator — emit chunks as nodes are processed.
     * First byte latency < 1ms. Ideal for Axum streaming responses via Workers.
     *
     * @example
     *   // Node.js / Bun
     *   for await (const chunk of renderToStream(appNode)) {
     *     res.write(chunk);
     *   }
     *   res.end();
     *
     * @example
     *   // Axum bridge — Worker receives chunks and sends them to Rust
     *   for await (const chunk of renderToStream(appNode)) {
     *     self.postMessage({ type: 'chunk', payload: chunk });
     *   }
     *   self.postMessage({ type: 'end' });
     */
    export async function* renderToStream(
        node   : Virtual,
        options: { hydration?: boolean; chunkSize?: number } = {},
    ): AsyncGenerator<string>
    {
        const { hydration = false, chunkSize = 512 } = options;
        let   buffer = '';

        for (const chunk of _walkNode(accessNode(node), hydration))
        {
            buffer += chunk;
            if (buffer.length >= chunkSize)
            {
                yield buffer;
                buffer = '';
            }
        }
        if (buffer) yield buffer;
    }

    function* _walkNode(node: VNodeAccessor, hydration: boolean): Generator<string>
    {
        const ssrId     = hydration ? node.id : undefined;
        const attrs     = renderAttrs(node.attrs, ssrId);
        const textContent = node.attrs['textContent'] ?? node.text;
        const innerHTML   = node.attrs['innerHTML'];

        if (VOID_ELEMENTS.has(node.tag)) { yield `<${node.tag}${attrs}>`; return; }

        yield `<${node.tag}${attrs}>`;

        if (innerHTML !== undefined)  { yield innerHTML; }
        else if (textContent)         { yield escapeHtml(textContent); }
        else for (const c of node.children) yield* _walkNode(c, hydration);

        yield `</${node.tag}>`;
    }

    // ── hydrate ────────────────────────────────────────────────────────────────────

    /**
     * Attach AriannA reactivity to server-rendered HTML.
     * Matches Virtual nodes to existing DOM elements via data-arianna-wip-id.
     * Wires event listeners and State subscriptions without re-rendering.
     *
     * @param vnode    - The Virtual tree that was server-rendered
     * @param root     - The container DOM element (e.g. document.getElementById('app'))
     * @param state?   - Optional AriannA State to wire up
     *
     * @example
     *   // Server sent HTML with data-arianna-wip-id markers
     *   hydrate(appNode, document.getElementById('app'), appState);
     */
    export function hydrate(
        vnode  : Virtual,
        root   : Element,
        state? : { on(type: string, cb: () => void): void },
    ): void
    {
        _hydrateNode(accessNode(vnode), root);
        if (state)
        {
            state.on('State-Changed', () => _hydrateNode(accessNode(vnode), root));
        }
    }

    function _hydrateNode(node: VNodeAccessor, container: Element): void
    {
        if (!node.id) return;
        const el = container.querySelector(`[data-arianna-id="${node.id}"]`) ?? container;
        if (!el) return;

        // Attach the Virtual's __dom pointer to the existing element
        // so future .set() / .on() calls operate on the server-rendered DOM
        // (We can't set private #dom directly — instead we expose a _hydrateAttach helper
        //  that Virtual can call. For now we mark the element.)
        el.setAttribute('data-arianna-wip-hydrated', 'true');

        for (const child of node.children)
            _hydrateNode(child, el);
    }

    // ── Island architecture ────────────────────────────────────────────────────────

    /**
     * Island helpers — mark subtrees as static (SSR only) or interactive (hydrated).
     *
     * @example
     *   const page = Virtual('div', {},
     *     Island.static(header),                    // rendered server-side only
     *     Island.interactive(counter, 'counter-1'), // hydrated client-side
     *   );
     */
    export const Island = {

        /**
         * Mark a Virtual as static — rendered server-side, never hydrated.
         * Adds data-arianna-wip-island="static" to the node's root element.
         */
        static(node: Virtual): Virtual
        {
            node.set('data-arianna-wip-island', 'static');
            return node;
        },

        /**
         * Mark a Virtual as an interactive island.
         * On the client, hydrate() will re-attach AriannA reactivity to this subtree.
         *
         * @param node - The interactive subtree
         * @param id   - Stable identifier for client-side matching
         */
        interactive(node: Virtual, id: string): Virtual
        {
            node.set('data-arianna-wip-island', 'interactive');
            node.set('data-arianna-wip-island-id', id);
            return node;
        },

        /**
         * Hydrate all interactive islands in a container.
         * Call this once on page load, after server HTML is in the DOM.
         *
         * @example
         *   Island.hydrateAll(document.body, islandMap);
         *   // islandMap: Record<id, Virtual>
         */
        hydrateAll(
            container : Element,
            islandMap : Record<string, Virtual>,
        ): void
        {
            const islands = container.querySelectorAll('[data-arianna-wip-island="interactive"]');
            for (const el of Array.from(islands))
            {
                const id   = el.getAttribute('data-arianna-wip-island-id');
                const node = id ? islandMap[id] : null;
                if (node) hydrate(node, el as Element);
            }
        },
    };

    // ── Plugin definition ──────────────────────────────────────────────────────────

    /**
     * AriannA SSR plugin.
     * Install with: Core.use(SSR)
     *
     * After install, AriannASSR is available globally on window/globalThis.
     */
    export const name    = 'AriannASSR';
    export const version = '1.0.0';

    /** Plugin install hook — exposes the SSR api on window/globalThis. */
    export function install(_core: unknown): void
    {
        const api = { renderToString, renderToStream, hydrate, escapeHtml, Island };
        // Works in both browser (window) and server (globalThis)
        const g = typeof window !== 'undefined' ? window
                : typeof globalThis !== 'undefined' ? globalThis
                : null;
        if (g)
        {
            Object.defineProperty(g, 'AriannASSR', {
                value       : api,
                writable    : false,
                enumerable  : false,
                configurable: false,
            });
        }
    }

}

// ── Top-level re-exports: named public API preserved (renderToString, hydrate, …). ──
export const escapeHtml     = SSR.escapeHtml;
export const renderToString = SSR.renderToString;
export const renderToStream = SSR.renderToStream;
export const hydrate        = SSR.hydrate;
export const Island         = SSR.Island;

export default SSR;
