/* ============================================================================
 * AriannA — JSX.ts
 * ----------------------------------------------------------------------------
 * Single home for every JSX / hyperscript / component interface AriannA speaks.
 * Three sections, swappable in place over time:
 *
 *   §1  AriannA native       — re-export of the built-in h()/jsx runtime.
 *   §2  Snabbdom-compatible  — h(sel, data, children) + patch(old, new).
 *   §3  React-compatible     — class ReactComponent { render/state/props/setState } + createRoot.
 *
 * All three render to real DOM. §2/§3 are self-contained (own vnode + diff /
 * own component base) so they do not depend on AriannA internals that may move.
 * ========================================================================== */

/* eslint-disable @typescript-eslint/no-explicit-any */

import Real                     from './Real.ts';
import Virtual, { VirtualNode } from './Virtual.ts';
import Core                     from './Core.ts';
import type { VAttrs }          from './Virtual.ts';

// ─────────────────────────────────────────────────────────────────────────────
// §1 — AriannA native JSX runtime (re-export)
// ─────────────────────────────────────────────────────────────────────────────
// The native factory: h(tag, props, ...children) → Real | VirtualNode.
// Props become attributes via .set(); events via $x / onX; children via .add().
// Merged in from the former ./jsx/jsx-runtime.ts (folder eliminated). The native
// hyperscript is `hyperscript`; the public Snabbdom `h` is defined in §2 below.

// ── Types ──────────────────────────────────────────────────────────────────────

/** Props passed to a JSX element. */
export type JSXProps = Record<string, unknown> & {
    children?: JSXNode | JSXNode[];
};

/**
 * A node returned by h() — either a Real instance, a VirtualNode,
 * a Fragment, a primitive, or null/undefined (both are silently skipped).
 */
export type JSXNode =
    | Real
    | VirtualNode
    | AriannAFragment
    | string
    | number
    | boolean
    | null
    | undefined;

/** A fragment in Virtual mode — wraps children without a real DOM tag. */
export interface AriannAFragment
{
    readonly __arianna_fragment : true;
    readonly children           : JSXNode[];
}

/** Intrinsic element map — all HTML/SVG tags are valid JSX elements. */
export interface IntrinsicElements
{
    [tag: string]: JSXProps;
}

// ── Runtime mode ──────────────────────────────────────────────────────────────

/** Runtime mode — controlled by arianna.config.ts or a per-file pragma. */
export type JSXRuntime = 'real' | 'virtual';

// ── Internal helpers ──────────────────────────────────────────────────────────

const EVENT_DOLLAR = /^\$/;         // $click, $mouseenter
const EVENT_ON     = /^on([A-Z])/;  // onClick, onMouseenter
const FRAGMENT_TAG = Symbol('AriannAFragment');

/**
 * Determine whether a prop name encodes an event listener.
 * Returns the lowercase event type string, or `null` for plain attributes.
 *
 * @param key - Prop name to inspect.
 * @internal
 */
function resolveEventType(key: string): string | null
{
    if (EVENT_DOLLAR.test(key)) return key.slice(1).toLowerCase();
    const m = EVENT_ON.exec(key);
    if (m) return (m[1].toLowerCase() + key.slice(m[0].length)).toLowerCase();
    return null;
}

/**
 * Resolve a JSX type to a lowercase tag string.
 *
 * - `string`         → used as-is (`'div'`, `'my-card'`)
 * - `function/class` → looked up in `Core.GetDescriptor` → `Tags[0]`
 * - fallback         → kebab-case of the constructor name
 *
 * @param type - JSX element type.
 * @internal
 */
function resolveTag(type: string | (new (...a: unknown[]) => unknown)): string
{
    if (typeof type === 'string') return type;

    const d = Core.GetDescriptor(type as never);
    if (d && d.Tags?.length) return d.Tags[0];

    // Fallback: convert PascalCase class/function name to kebab-case
    const name = (type as { name?: string }).name ?? 'div';
    return name
        .replace(/([A-Z])/g, (c, i) => (i > 0 ? '-' : '') + c.toLowerCase())
        .replace(/^-/, '');
}

/**
 * Flatten a mixed children array — handles nested arrays, AriannAFragments,
 * and plain primitives. Filters `null`, `undefined`, and `false`.
 *
 * @param children - Raw children array from JSX props or positional args.
 * @internal
 */
function flattenChildren(children: unknown[]): JSXNode[]
{
    const out: JSXNode[] = [];

    for (const c of children)
    {
        if (c === null || c === undefined || c === false) continue;

        if (Array.isArray(c))
        {
            out.push(...flattenChildren(c));
        }
        else if (typeof c === 'object' && (c as AriannAFragment).__arianna_fragment)
        {
            out.push(...flattenChildren((c as AriannAFragment).children));
        }
        else
        {
            out.push(c as JSXNode);
        }
    }

    return out;
}

// ── Real-mode factory ──────────────────────────────────────────────────────────

/**
 * Create a `Real` instance from JSX.
 *
 * - Props → `.set()` for attributes, `.on()` for events (`$x` or `onX`).
 * - `$` event props take precedence over `on`-prefix duplicates.
 * - Children → `.add()` for strings/nodes.
 *
 * @param type  - Tag string or component constructor.
 * @param props - Merged props object (attributes + events + children).
 * @param args  - Additional positional children.
 * @internal
 */
function hReal(
    type    : string | (new (...a: unknown[]) => unknown),
    props   : JSXProps | null,
    ...args : unknown[]
): Real | AriannAFragment | DocumentFragment
{
    // ── Fragment ───────────────────────────────────────────────────────────────
    if ((type as unknown) === FRAGMENT_TAG || type === '')
    {
        const frag = document.createDocumentFragment();

        for (const child of flattenChildren(args))
        {
            if      (child instanceof Real)   frag.appendChild(child.render());
            else if (child instanceof Node)   frag.appendChild(child);
            else if (typeof child === 'string' || typeof child === 'number')
                frag.appendChild(document.createTextNode(String(child)));
        }

        return frag as unknown as AriannAFragment;
    }

    // ── Element ────────────────────────────────────────────────────────────────
    const tag    = resolveTag(type);
    const r      = new Real(tag);
    const events = new Map<string, EventListener>();
    const attrs  = new Map<string, string>();

    // $ props first — they take precedence over on-prefix duplicates
    const entries     = Object.entries(props ?? {});
    const dollarFirst = [
        ...entries.filter(([k]) =>  EVENT_DOLLAR.test(k)),
        ...entries.filter(([k]) => !EVENT_DOLLAR.test(k)),
    ];

    for (const [key, val] of dollarFirst)
    {
        if (key === 'children') continue;

        const evType = resolveEventType(key);
        if (evType)
        {
            if (!events.has(evType))
                events.set(evType, val as EventListener);
        }
        else
        {
            attrs.set(key, val == null ? '' : String(val));
        }
    }

    // Apply attributes then events
    for (const [k, v] of attrs)   r.set(k, v);
    for (const [t, fn] of events) r.on(t, fn);

    // Apply children
    const kids = flattenChildren([
        ...(props?.children !== undefined ? [props.children] : []),
        ...args,
    ]);

    for (const child of kids)
    {
        if      (child instanceof Real)        r.add(child.render());
        else if (child instanceof VirtualNode) r.add(child.render());
        else if (child instanceof Node)        r.add(child);
        else if (typeof child === 'string' || typeof child === 'number')
            r.add(String(child));
    }

    return r;
}

// ── Virtual-mode factory ───────────────────────────────────────────────────────

/**
 * Create a `VirtualNode` from JSX.
 *
 * - Attributes → plain `VAttrs` object passed to `Virtual.Create()`.
 * - Events (`$x` / `onX`) → registered via `.on()` after node creation.
 * - Children → `VirtualNode` children or text strings.
 *
 * @param type  - Tag string or component constructor.
 * @param props - Merged props object (attributes + events + children).
 * @param args  - Additional positional children.
 * @internal
 */
function hVirtual(
    type    : string | (new (...a: unknown[]) => unknown),
    props   : JSXProps | null,
    ...args : unknown[]
): VirtualNode | AriannAFragment
{
    // ── Fragment ───────────────────────────────────────────────────────────────
    if ((type as unknown) === FRAGMENT_TAG || type === '')
    {
        return {
            __arianna_fragment : true,
            children           : flattenChildren(args),
        } as AriannAFragment;
    }

    // ── Element ────────────────────────────────────────────────────────────────
    const tag        = resolveTag(type);
    const vAttrs     : VAttrs                           = {};
    const events     = new Map<string, (e: Event) => void>();

    // $ props first — they take precedence over on-prefix duplicates
    const entries     = Object.entries(props ?? {});
    const dollarFirst = [
        ...entries.filter(([k]) =>  EVENT_DOLLAR.test(k)),
        ...entries.filter(([k]) => !EVENT_DOLLAR.test(k)),
    ];

    for (const [key, val] of dollarFirst)
    {
        if (key === 'children') continue;

        const evType = resolveEventType(key);
        if (evType)
        {
            if (!events.has(evType))
                events.set(evType, val as (e: Event) => void);
        }
        else
        {
            vAttrs[key] = val as string | number | boolean | null;
        }
    }

    // Build children list
    const kids = flattenChildren([
        ...(props?.children !== undefined ? [props.children] : []),
        ...args,
    ]);

    const vChildren = kids.map(child =>
    {
        if      (child instanceof VirtualNode)                        return child;
        if      (child instanceof Real)                               return child.render();  // bridge Real → DOM
        if      (typeof child === 'string' || typeof child === 'number') return String(child);
        return String(child);
    });

    const node = new VirtualNode(tag, vAttrs as Record<string,string>, ...(vChildren as never[])) as VirtualNode;

    // Register event listeners — fired via Observable when node is mounted
    for (const [evType, fn] of events) node.on(evType, fn as never);

    return node;
}

// ── Global default runtime ────────────────────────────────────────────────────

/**
 * Global default JSX runtime mode.
 * Can be overridden per-file via the `@dom-render` pragma,
 * or set globally in `arianna.config.ts`.
 *
 * @internal
 */
let _defaultRuntime: JSXRuntime = 'real';

/**
 * Set the global default JSX runtime.
 * Called by the AriannA bundler or `arianna.config.ts` at build time.
 *
 * @param mode - Runtime mode: `'real'` or `'virtual'`.
 *
 * @example
 *   // arianna.config.ts
 *   setDefaultRuntime('virtual');
 */
export function setDefaultRuntime(mode: JSXRuntime): void
{
    _defaultRuntime = mode;
}

/**
 * Get the current global default JSX runtime.
 *
 * @returns The active runtime mode.
 */
export function getDefaultRuntime(): JSXRuntime
{
    return _defaultRuntime;
}

// ── h() — public JSX factory ───────────────────────────────────────────────────

/**
 * AriannA JSX element factory.
 *
 * TypeScript / esbuild call this for every JSX element.
 * The runtime (`real` | `virtual`) is determined by:
 *   1. Per-call `_runtime` prop (internal — set by the build transform).
 *   2. Global default set via `setDefaultRuntime()`.
 *
 * @param type  - Tag string (`'div'`) or component constructor (`MyCard`).
 * @param props - Props object — attributes + events (`$x` / `onX`) + children.
 * @param args  - Additional positional children.
 *
 * @example
 *   // Implicit real mode
 *   const el = h('div', { class: 'box' }, 'Hello');
 *
 * @example
 *   // Explicit virtual mode via internal prop
 *   const el = h('div', { class: 'box', _runtime: 'virtual' }, 'Hello');
 */
export function hyperscript(
    type    : string | (new (...a: unknown[]) => unknown),
    props   : JSXProps | null,
    ...args : unknown[]
): JSXNode
{
    const mode: JSXRuntime =
        (props as { _runtime?: JSXRuntime } | null)?._runtime ?? _defaultRuntime;

    // Strip internal prop before forwarding to mode factories
    if (props && '_runtime' in props)
    {
        const { _runtime: _, ...rest } = props as { _runtime?: JSXRuntime } & JSXProps;
        props = rest;
    }

    return (mode === 'virtual'
        ? hVirtual(type, props, ...args)
        : hReal(type, props, ...args)) as unknown as JSXNode;
}

// ── Fragment ───────────────────────────────────────────────────────────────────

/**
 * JSX Fragment symbol — `<>...</>` syntax.
 *
 * - Real mode    → `DocumentFragment`
 * - Virtual mode → `AriannAFragment` (array wrapper)
 */
export const Fragment = FRAGMENT_TAG as unknown as string;

// ── react-jsx compat exports ───────────────────────────────────────────────────

/**
 * `jsx()` — called by the TypeScript compiler for single-child elements.
 * Alias of `h()` — provided for `react-jsx` compatibility.
 */
export const jsx = hyperscript;

/**
 * `jsxs()` — called by the TypeScript compiler for multi-child elements.
 * Alias of `h()` — provided for `react-jsx` compatibility.
 */
export const jsxs = hyperscript;

/**
 * `jsxDEV()` — called in development builds with extra source-location info.
 * Drops the extra debug arguments and delegates to `h()`.
 *
 * @param type      - Tag string or constructor.
 * @param props     - Props object.
 * @param _key      - React-compat key (unused).
 * @param _isStatic - React-compat static flag (unused).
 * @param _source   - Babel source-location object (unused).
 * @param _self     - Babel self reference (unused).
 */
export function jsxDEV(
    type       : string | (new (...a: unknown[]) => unknown),
    props      : JSXProps | null,
    _key?      : string,
    _isStatic? : boolean,
    _source?   : unknown,
    _self?     : unknown,
): JSXNode
{
    return hyperscript(type, props);
}

// ── Window registration ────────────────────────────────────────────────────────

if (typeof window !== 'undefined')
{
    Object.defineProperty(window, 'AriannAJSX', {
        value       : { h: hyperscript, jsx, jsxs, jsxDEV, Fragment, setDefaultRuntime, getDefaultRuntime },
        writable    : false,
        enumerable  : true,
        configurable: false,
    });
}


// ═════════════════════════════════════════════════════════════════════════════
// §2 — Snabbdom-compatible interface
// ═════════════════════════════════════════════════════════════════════════════
// Mirrors the Snabbdom API used by Vue's vdom layer:
//
//   const vnode = h('div#id.a.b', { on:{click}, props:{href}, attrs:{}, style:{}, class:{} }, [
//       h('span', { style:{fontWeight:'bold'} }, 'bold'),
//       ' plain text',
//       h('a', { props:{href:'/foo'} }, 'link'),
//   ]);
//   patch(container, vnode);        // mount into an empty element
//   patch(vnode, newVnode);         // diff + update in place
//
// The vnode is a lightweight plain object; patch() does keyed-ish child diffing
// against the live DOM element stored on vnode.elm.

export interface SnabbdomData {
    on?    : Record<string, (e: Event) => void>;
    props? : Record<string, unknown>;          // assigned as DOM properties (el[k] = v)
    attrs? : Record<string, string | number | boolean | null>;
    style? : Record<string, string>;
    class? : Record<string, boolean>;
    key?   : string | number;
    dataset?: Record<string, string>;
}

export interface VNode {
    sel      : string | undefined;   // 'div#id.a.b' (full selector as written)
    tag      : string;               // 'div'
    id       : string | undefined;
    classes  : string[];             // from selector
    data     : SnabbdomData;
    children : Array<VNode | string>;
    text     : string | undefined;
    elm      : Node | undefined;     // live DOM node after patch
    key      : string | number | undefined;
}

const isVNode = (x: unknown): x is VNode =>
    !!x && typeof x === 'object' && 'sel' in (x as any) && 'data' in (x as any);

/** Parse a Snabbdom selector `div#id.a.b` → { tag, id, classes }. */
function parseSel(sel: string): { tag: string; id?: string; classes: string[] } {
    let tag = 'div';
    let id: string | undefined;
    const classes: string[] = [];
    // split on # and . while remembering which marker preceded each token
    const re = /([#.]?)([^#.]+)/g;
    let m: RegExpExecArray | null;
    let first = true;
    while ((m = re.exec(sel))) {
        const [, marker, name] = m;
        if (marker === '#') id = name;
        else if (marker === '.') classes.push(name);
        else if (first) tag = name;          // leading token with no marker = tag
        first = false;
    }
    return { tag, id, classes };
}

/**
 * Snabbdom `h()`. Overloads:
 *   h(sel)
 *   h(sel, data)
 *   h(sel, children)
 *   h(sel, data, children)
 */
export function h(sel: string, b?: SnabbdomData | VNode | string | Array<VNode | string>, c?: VNode | string | Array<VNode | string>): VNode {
    let data: SnabbdomData = {};
    let children: Array<VNode | string> = [];
    let text: string | undefined;

    // normalise (b, c) into (data, children/text)
    let childArg: VNode | string | Array<VNode | string> | undefined;
    if (c !== undefined) { data = (b as SnabbdomData) ?? {}; childArg = c; }
    else if (b !== undefined) {
        if (Array.isArray(b) || isVNode(b) || typeof b === 'string') childArg = b as any;
        else data = b as SnabbdomData;
    }

    if (Array.isArray(childArg)) children = childArg;
    else if (isVNode(childArg)) children = [childArg];
    else if (typeof childArg === 'string') text = childArg;

    const { tag, id, classes } = parseSel(sel);
    const vnode: VNode = { sel, tag, id, classes, data: data ?? {}, children, text, elm: undefined, key: data?.key };
    // Deferred-mount marker — lets `new Virtual(vnode).append(container)` be the
    // single entry point. On (re)mount into the same container, patch in place:
    // first call mounts, subsequent calls diff against the container's last vnode
    // (form B — `new Virtual(newVnode).append(container)` updates in place).
    Object.defineProperty(vnode, '__ariannaMount', {
        enumerable: false,
        value: (container: Element): Node | undefined => {
            const slot = container as Element & { __ariannaLastVNode?: VNode };
            if (slot.__ariannaLastVNode) {
                patch(slot.__ariannaLastVNode, vnode);   // diff + update in place
            } else {
                patch(container, vnode);                 // first mount
            }
            slot.__ariannaLastVNode = vnode;
            return vnode.elm;
        },
    });
    return vnode;
}

/** Create a real DOM node from a vnode and store it on vnode.elm. */
function createElm(vnode: VNode): Node {
    const el = document.createElement(vnode.tag);
    if (vnode.id) el.id = vnode.id;
    for (const c of vnode.classes) el.classList.add(c);
    applyData(el, undefined, vnode.data);
    if (vnode.text !== undefined) {
        el.textContent = vnode.text;
    } else {
        for (const child of vnode.children) {
            if (typeof child === 'string') el.appendChild(document.createTextNode(child));
            else el.appendChild(createElm(child));
        }
    }
    vnode.elm = el;
    return el;
}

/** Apply / diff a vnode's data (attrs, props, style, class, events) onto an element. */
function applyData(el: HTMLElement, oldData: SnabbdomData | undefined, data: SnabbdomData): void {
    const od = oldData ?? {};
    // attrs
    const oa = od.attrs ?? {}, na = data.attrs ?? {};
    for (const k in oa) if (!(k in na)) el.removeAttribute(k);
    for (const k in na) { const v = na[k]; if (v === false || v == null) el.removeAttribute(k); else el.setAttribute(k, v === true ? '' : String(v)); }
    // props (DOM properties)
    const op = od.props ?? {}, np = data.props ?? {};
    for (const k in op) if (!(k in np)) try { (el as any)[k] = undefined; } catch { /* ignore */ }
    for (const k in np) try { (el as any)[k] = np[k]; } catch { /* ignore */ }
    // style
    const os = od.style ?? {}, ns = data.style ?? {};
    for (const k in os) if (!(k in ns)) (el.style as any)[k] = '';
    for (const k in ns) (el.style as any)[k] = ns[k];
    // class toggles
    const oc = od.class ?? {}, nc = data.class ?? {};
    for (const k in oc) if (!(k in nc)) el.classList.remove(k);
    for (const k in nc) { if (nc[k]) el.classList.add(k); else el.classList.remove(k); }
    // dataset
    const odd = od.dataset ?? {}, ndd = data.dataset ?? {};
    for (const k in odd) if (!(k in ndd)) delete el.dataset[k];
    for (const k in ndd) el.dataset[k] = ndd[k];
    // events — remove old, add new (simple replace by type)
    const oe = od.on ?? {}, ne = data.on ?? {};
    for (const t in oe) if (oe[t] !== ne[t]) el.removeEventListener(t, oe[t]);
    for (const t in ne) if (oe[t] !== ne[t]) el.addEventListener(t, ne[t]);
}

function sameVNode(a: VNode | string, b: VNode | string): boolean {
    if (typeof a === 'string' || typeof b === 'string') return a === b;
    return a.tag === b.tag && a.id === b.id && a.key === b.key;
}

/** Diff and patch children of `parent` from oldCh → newCh. */
function patchChildren(parent: Node, oldCh: Array<VNode | string>, newCh: Array<VNode | string>): void {
    const max = Math.max(oldCh.length, newCh.length);
    for (let i = 0; i < max; i++) {
        const o = oldCh[i], n = newCh[i];
        const existing = parent.childNodes[i] as Node | undefined;
        if (o === undefined && n !== undefined) {
            // append new
            parent.appendChild(typeof n === 'string' ? document.createTextNode(n) : createElm(n));
        } else if (n === undefined && o !== undefined) {
            // remove surplus
            if (existing) parent.removeChild(existing);
        } else if (o !== undefined && n !== undefined) {
            if (typeof o === 'string' || typeof n === 'string') {
                if (o !== n && existing) {
                    const repl = typeof n === 'string' ? document.createTextNode(n) : createElm(n);
                    parent.replaceChild(repl, existing);
                }
            } else if (sameVNode(o, n)) {
                patchVNode(o, n);
            } else if (existing) {
                parent.replaceChild(createElm(n), existing);
            }
        }
    }
}

/** Patch oldVNode → newVNode in place (newVNode.elm reused from oldVNode.elm). */
function patchVNode(oldV: VNode, newV: VNode): void {
    const el = oldV.elm as HTMLElement;
    newV.elm = el;
    if (!el) { createElm(newV); return; }
    // id / classes from selector
    if (newV.id && newV.id !== oldV.id) el.id = newV.id;
    for (const c of oldV.classes) if (!newV.classes.includes(c)) el.classList.remove(c);
    for (const c of newV.classes) el.classList.add(c);
    applyData(el, oldV.data, newV.data);
    if (newV.text !== undefined) {
        if (newV.text !== oldV.text) el.textContent = newV.text;
    } else {
        if (oldV.text !== undefined) el.textContent = '';
        patchChildren(el, oldV.text !== undefined ? [] : oldV.children, newV.children);
    }
}

/**
 * Snabbdom `patch`. Two modes:
 *   patch(emptyDomElement, vnode)  → mount vnode into the element.
 *   patch(oldVnode, newVnode)      → diff and update in place.
 * Returns the new vnode (with .elm wired), as Snabbdom does.
 */
export function patch(oldVnodeOrElm: VNode | Element, vnode: VNode): VNode {
    if (isVNode(oldVnodeOrElm)) {
        patchVNode(oldVnodeOrElm, vnode);
    } else {
        // mount into a real element (Snabbdom replaces the element; we mount inside it
        // when it is an empty container, matching the common "#container" usage).
        const container = oldVnodeOrElm;
        const node = createElm(vnode);
        container.appendChild(node);
    }
    return vnode;
}


// ═════════════════════════════════════════════════════════════════════════════
// §3 — React-compatible interface
// ═════════════════════════════════════════════════════════════════════════════
// A minimal React-class surface backed by the §2 vnode + patch engine:
//
//   class Clock extends ReactComponent {
//       constructor(props){ super(props); this.state = { date: new Date() }; }
//       componentDidMount(){ this.timer = setInterval(()=>this.tick(),1000); }
//       componentWillUnmount(){ clearInterval(this.timer); }
//       tick(){ this.setState({ date: new Date() }); }
//       render(){ return createElement('div', null,
//           createElement('h1', null, 'Hello'),
//           createElement('h2', null, 'It is ' + this.state.date.toLocaleTimeString())); }
//   }
//   createRoot(document.getElementById('root')).render(createElement(Clock, null));
//
// createElement returns a React-style element descriptor; the root renders it
// through the vnode engine and re-renders on setState (componentDidUpdate fires).

export interface ReactElement {
    type     : string | (new (props: any) => ReactComponent<any, any>);
    props    : Record<string, any>;
    children : Array<ReactElement | string>;
    key      : string | number | null;
}

const isReactEl = (x: unknown): x is ReactElement =>
    !!x && typeof x === 'object' && 'type' in (x as any) && 'props' in (x as any) && 'children' in (x as any);

/** React.createElement(type, props, ...children). */
export function createElement(
    type: string | (new (props: any) => ReactComponent<any, any>),
    props: Record<string, any> | null,
    ...children: Array<ReactElement | string | number | null | undefined>
): ReactElement {
    const flat: Array<ReactElement | string> = [];
    const walk = (c: any) => {
        if (c == null || c === false) return;
        if (Array.isArray(c)) { c.forEach(walk); return; }
        if (typeof c === 'number') { flat.push(String(c)); return; }
        flat.push(c);
    };
    children.forEach(walk);
    const element: ReactElement = {
        type,
        props: props ?? {},
        children: flat,
        key: (props && (props.key as string | number)) ?? null,
    };
    // Deferred-mount marker — `new Virtual(<Clock/>).mount(container)` compiles to
    // this. createRoot owns the persistent root + setState re-render loop, so
    // mounting a React element through Virtual behaves exactly like
    // createRoot(container).render(element).
    Object.defineProperty(element, '__ariannaMount', {
        enumerable: false,
        value: (container: Element): Node | undefined => {
            const slot = container as Element & { __ariannaReactRoot?: Root };
            if (!slot.__ariannaReactRoot) slot.__ariannaReactRoot = createRoot(container);
            slot.__ariannaReactRoot.render(element);
            return container.firstChild ?? undefined;
        },
    });
    return element;
}

/** React-compatible base component. */
export class ReactComponent<P = Record<string, any>, S = Record<string, any>> {
    props : P;
    state : S;
    // wiring filled in by the renderer:
    _host?    : { rerender: () => void };
    _mounted? : boolean;

    constructor(props?: P) {
        this.props = props ?? ({} as P);
        this.state = {} as S;
    }

    setState(partial: Partial<S> | ((s: S, p: P) => Partial<S>)): void {
        const next = typeof partial === 'function'
            ? (partial as (s: S, p: P) => Partial<S>)(this.state, this.props)
            : partial;
        this.state = { ...(this.state as any), ...(next as any) };
        if (this._host) this._host.rerender();
    }

    forceUpdate(): void { if (this._host) this._host.rerender(); }

    // lifecycle (no-ops unless overridden)
    componentDidMount(): void {}
    componentWillUnmount(): void {}
    componentDidUpdate(_prevProps: P, _prevState: S): void {}

    // must be overridden
    render(): ReactElement | string | null { return null; }
}

/** Convert a React element (or component) tree into a §2 vnode. */
function reactToVNode(
    node: ReactElement | string | null,
    instances: ReactComponent[],
    cache: Map<string, ReactComponent>,
    path: string,
): VNode | string | null {
    if (node == null) return null;
    if (typeof node === 'string') return node;

    // Class component → REUSE the instance for this path if present (so state
    // survives re-renders, like React), else instantiate. Then render + recurse.
    if (typeof node.type === 'function') {
        const Ctor = node.type as new (p: any) => ReactComponent;
        const key = path + '/' + (Ctor.name || 'C') + (node.key != null ? '#' + node.key : '');
        let inst = cache.get(key);
        if (inst instanceof Ctor) {
            // reconcile props on the existing instance
            (inst as any).props = { ...node.props, children: node.children };
        } else {
            inst = new Ctor({ ...node.props, children: node.children });
            cache.set(key, inst);
        }
        instances.push(inst);
        const rendered = inst.render();
        const v = reactToVNode(rendered as any, instances, cache, key);
        if (v && typeof v !== 'string') (v as any).__reactInstance = inst;
        return v;
    }

    // Host element
    const tag = node.type as string;
    const data: SnabbdomData = { attrs: {}, on: {}, props: {}, style: {} };
    for (const k in node.props) {
        if (k === 'children' || k === 'key') continue;
        const v = node.props[k];
        if (/^on[A-Z]/.test(k) && typeof v === 'function') {
            data.on![k.slice(2).toLowerCase()] = v;       // onClick → click
        } else if (k === 'style' && v && typeof v === 'object') {
            data.style = v as Record<string, string>;
        } else if (k === 'className') {
            data.attrs!['class'] = String(v);
        } else {
            data.attrs![k] = v as any;
        }
    }
    const kids = node.children
        .map((c, i) => reactToVNode(c as any, instances, cache, path + '.' + tag + ':' + i))
        .filter((c): c is VNode | string => c !== null);
    const vnode = h(tag, data, kids);
    return vnode;
}

export interface Root {
    render(element: ReactElement): void;
    unmount(): void;
}

/** ReactDOM.createRoot(container). */
export function createRoot(container: Element): Root {
    let currentVNode: VNode | null = null;
    let mountedInstances: ReactComponent[] = [];
    // Persistent instance cache keyed by render-path — lets setState accumulate
    // across re-renders instead of re-instantiating (and resetting) each time.
    const cache = new Map<string, ReactComponent>();

    function doRender(element: ReactElement) {
        const prevInstances = mountedInstances;
        const instances: ReactComponent[] = [];
        const v = reactToVNode(element, instances, cache, 'root');
        mountedInstances = instances;

        if (v && typeof v !== 'string') {
            // give each instance a rerender hook bound to this root
            for (const inst of instances) {
                inst._host = { rerender: () => doRender(element) };
            }
            if (currentVNode == null) {
                patch(container, v);
            } else {
                patch(currentVNode, v);
            }
            currentVNode = v;

            // lifecycle: mount once, update thereafter
            for (const inst of instances) {
                if (!inst._mounted) { inst._mounted = true; inst.componentDidMount(); }
                else inst.componentDidUpdate(inst.props, inst.state);
            }
            // unmount instances that disappeared
            for (const old of prevInstances) {
                if (!instances.includes(old) && old._mounted) {
                    old._mounted = false;
                    old.componentWillUnmount();
                    // drop stale cache entries pointing at this instance
                    for (const [k, vInst] of cache) if (vInst === old) cache.delete(k);
                }
            }
        }
    }

    return {
        render(element: ReactElement) { doRender(element); },
        unmount() {
            for (const inst of mountedInstances) {
                if (inst._mounted) { inst._mounted = false; inst.componentWillUnmount(); }
            }
            container.textContent = '';
            currentVNode = null;
            mountedInstances = [];
            cache.clear();
        },
    };
}

// React namespace convenience (so `React.createElement` / `React.ReactComponent` work).
export const React = { createElement, Component: ReactComponent, createRoot };
