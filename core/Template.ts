/**
 * @module    core/Template
 * @author    Riccardo Angeli
 * @version   3.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * # Template — Shadow-DOM-native reactive template system
 *
 * ## Design principles
 *
 * 1. **Native shadow DOM** — every Component attaches a real ShadowRoot
 *    (closed by default; opt-in to open via `def.shadow: 'open'`). Slots use
 *    the browser's native `<slot>` projection — zero custom code.
 *
 * 2. **Native `<template>` element** — parse once at class level, clone
 *    `template.content` (a DocumentFragment) per instance. O(1) instantiation
 *    backed by browser-native cloneNode.
 *
 * 3. **Vue-style directives**:
 *       :attr="expr"      — attribute binding (objects auto-applied for style/class)
 *       @event="expr"     — event listener (auto-binds to instance methods)
 *       a-if="expr"       — conditional render
 *       a-for="x in xs"   — list render
 *       {{ expr }}        — text interpolation
 *
 * 4. **`this` = component instance** — directive expressions evaluate with
 *    `this` bound to the host element (the component instance). Identifier
 *    lookup also falls through to `signals` via a `with` block so attribute
 *    signals can be referenced bare (`ratio` resolves to `signals.ratio`).
 *
 * 5. **Reactivity via effect()** — every directive registers a reactive
 *    effect. Touching a signal during evaluation auto-subscribes. Effects
 *    are disposed on unmount.
 *
 * 6. **No `new Function` magic on user code paths** — expression compilation
 *    happens ONCE per unique expression string, cached at class-level.
 *
 * ## Usage
 *
 *   const tpl = html`
 *       <div :style="this.style()" @click="this.onClick">
 *           <slot name="title"></slot>
 *           {{ this.label }}
 *       </div>
 *   `;
 *
 *   class MyComp extends Component('my-comp', HTMLElement, { ... }) {
 *       build() {
 *           this.template = tpl;     // Optional: per-instance override
 *       }
 *   }
 *
 *   // Or set at class def level (recommended):
 *   class MyComp extends Component('my-comp', HTMLElement, {}, {
 *       template: tpl,
 *       shadow: 'closed',
 *   }) { ... }
 */

import { effect } from './Observable.ts';

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * The result of html`...`. Holds the parsed <template> + binding descriptors.
 * Cloned and bound per instance via .attach(host, instance).
 */
export class Template
{
    /** Native <template> element holding the cloneable content. */
    readonly Node: HTMLTemplateElement;
    /** Compiled binding descriptors with path-from-root traversal info. */
    readonly Bindings: readonly BindingDesc[];
    /** The original source string (for debugging). */
    readonly Source: string;

    constructor(source: string)
    {
        this.Source = source;
        const node = document.createElement('template');
        node.innerHTML = source;
        // Walk + extract bindings once at parse time. Mutates node to strip
        // directive attributes (the browser would otherwise warn about them).
        const bindings: BindingDesc[] = [];
        walk(node.content, [], bindings);
        this.Node = node;
        this.Bindings = bindings;
    }

    /**
     * Attach this template to a host element. Default behavior:
     *   - If `host` already has a shadowRoot, render into it
     *   - Otherwise, return a DocumentFragment that the caller injects
     *     (used for non-shadow hosts as a fallback)
     *
     * `instance` is the value bound to `this` inside expressions. For
     * Components this is the host element itself.
     *
     * `signals` is an optional bag of identifiers exposed bare in expressions
     * via `with(signals){…}`. Components pass their attrSignals proxy here.
     */
    attach(host: ParentNode, instance: object, signals?: Record<string, unknown>): TemplateInstance
    {
        const inst = new TemplateInstance(this, instance, signals ?? {});
        inst.mount(host);
        return inst;
    }
}


/**
 * Tagged template factory: `` html`<div>...</div>` ``
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): Template
{
    // Reassemble source. Values are interpolated as strings — for reactive
    // values, use a directive (`:attr` / `@event` / `{{ }}`) instead.
    let src = '';
    for (let i = 0; i < strings.length; i++) {
        src += strings[i];
        if (i < values.length) src += String(values[i] ?? '');
    }
    // Cache by reassembled source. Templates with the same shape share parse.
    const cached = _templateCache.get(src);
    if (cached) return cached;
    const t = new Template(src);
    _templateCache.set(src, t);
    return t;
}

const _templateCache = new Map<string, Template>();


/**
 * Tagged template literal for CSS strings. Concatenates strings and values
 * and returns a plain string — components use this to build CSS programmatically
 * for inlined `<style>` tags or for passing to Rule/Stylesheet.
 *
 *   const sheet = css`
 *       :host { display: flex; }
 *       .item { color: ${primary}; }
 *   `;
 */
export function css(strings: TemplateStringsArray, ...values: unknown[]): string
{
    let out = '';
    for (let i = 0; i < strings.length; i++) {
        out += strings[i];
        if (i < values.length) out += String(values[i] ?? '');
    }
    return out;
}


// ─── Binding descriptors ─────────────────────────────────────────────────────

type BindingDesc =
    | { kind: 'attr';     path: number[]; name: string; expr: string }
    | { kind: 'event';    path: number[]; name: string; expr: string; modifiers: string[] }
    | { kind: 'text';     path: number[]; segments: TextSegment[] }
    | { kind: 'if';       path: number[]; expr: string }
    | { kind: 'for';      path: number[]; iter: string; expr: string };

type TextSegment =
    | { kind: 'literal'; text: string }
    | { kind: 'expr';    code: string };


// ─── Parser ──────────────────────────────────────────────────────────────────

const TEXT_INTERP_RX = /\{\{\s*([\s\S]+?)\s*\}\}/g;

function walk(node: Node, path: number[], out: BindingDesc[]): void
{
    if (node.nodeType === Node.TEXT_NODE) {
        const text = (node as Text).data;
        if (TEXT_INTERP_RX.test(text)) {
            TEXT_INTERP_RX.lastIndex = 0;
            const segments = parseTextInterp(text);
            if (segments.some(s => s.kind === 'expr')) {
                out.push({ kind: 'text', path: [...path], segments });
            }
        }
        return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
        return;
    }

    // Tracks whether we found an `a-for` on THIS element. If so, we must NOT
    // descend into its children during this pass — they will be walked later,
    // per-iteration, by `applyForBinding`, with the iterator variable in scope.
    // Otherwise child bindings like `:src="item.url"` would be evaluated here
    // with the parent's signals, where `item` doesn't exist → ReferenceError.
    let stopDescent = false;

    if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const attrs = Array.from(el.attributes);
        for (const attr of attrs) {
            const name = attr.name;
            const val  = attr.value;

            // Event binding: @click, @mousedown.prevent, etc.
            if (name.startsWith('@')) {
                const spec = name.slice(1);
                const [evtName, ...modifiers] = spec.split('.');
                out.push({ kind: 'event', path: [...path], name: evtName, expr: val, modifiers });
                el.removeAttribute(name);
                continue;
            }

            // Attribute binding: :style, :class, :src, etc.
            if (name.startsWith(':')) {
                const attrName = name.slice(1);
                out.push({ kind: 'attr', path: [...path], name: attrName, expr: val });
                el.removeAttribute(name);
                continue;
            }

            // a-if conditional
            if (name === 'a-if') {
                out.push({ kind: 'if', path: [...path], expr: val });
                el.removeAttribute(name);
                continue;
            }

            // a-for list rendering
            if (name === 'a-for') {
                const m = val.match(/^\s*(\S+)\s+in\s+(.+)$/);
                if (m) {
                    out.push({ kind: 'for', path: [...path], iter: m[1], expr: m[2] });
                    el.removeAttribute(name);
                    stopDescent = true;
                    continue;
                }
            }
        }
    }

    if (stopDescent) return;

    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
        walk(children[i], [...path, i], out);
    }
}

function parseTextInterp(text: string): TextSegment[]
{
    const segments: TextSegment[] = [];
    let last = 0;
    text.replace(TEXT_INTERP_RX, (m, expr, offset: number) => {
        if (offset > last) segments.push({ kind: 'literal', text: text.slice(last, offset) });
        segments.push({ kind: 'expr', code: expr.trim() });
        last = offset + m.length;
        return m;
    });
    if (last < text.length) segments.push({ kind: 'literal', text: text.slice(last) });
    return segments;
}


// ─── Expression compilation ──────────────────────────────────────────────────
//
// Each unique expression string is compiled once into:
//
//     function(this: instance, signals) { with (signals) { return (expr); } }
//
// The `this` binding is established by the caller via .call(instance, signals).
// `with (signals)` exposes signal-like properties as bare identifiers, so
// users can write `:style="{width: ratio*100+'%'}"` and `ratio` resolves to
// `signals.ratio` (the attrSignal proxy).

type CompiledExpr = (this: object, signals: Record<string, unknown>) => unknown;

const _exprCache = new Map<string, CompiledExpr>();

function compile(code: string): CompiledExpr
{
    const cached = _exprCache.get(code);
    if (cached) return cached;

    let fn: CompiledExpr;
    try {
        // Note: `with` is allowed in sloppy mode only. We do NOT prefix
        // 'use strict' here, and the Function constructor creates a sloppy
        // function regardless of the enclosing module mode. This is
        // intentional — we trade strict-mode for the ergonomic identifier
        // fall-through to the signals bag.
        fn = new Function('signals', `with (signals) { return (${code}); }`) as CompiledExpr;
    } catch (e) {
        console.warn(`[arianna] Template: failed to compile expression "${code}":`, e);
        fn = function() { return undefined; };
    }
    _exprCache.set(code, fn);
    return fn;
}

function evalExpr(code: string, instance: object, signals: Record<string, unknown>): unknown
{
    try {
        return compile(code).call(instance, signals);
    } catch (e) {
        console.warn(`[arianna] Template: expression "${code}" threw:`, e);
        return undefined;
    }
}


// ─── TemplateInstance ────────────────────────────────────────────────────────
//
// One per (template × host) pair. Tracks effects + listeners for clean
// unmount.

export class TemplateInstance
{
    readonly Template: Template;
    readonly Instance: object;
    readonly Signals: Record<string, unknown>;

    #host: ParentNode | null = null;
    #disposers: Array<() => void> = [];

    constructor(tpl: Template, instance: object, signals: Record<string, unknown>)
    {
        this.Template = tpl;
        this.Instance = instance;
        this.Signals  = signals;
    }

    mount(host: ParentNode): void
    {
        this.#host = host;
        const frag = this.Template.Node.content.cloneNode(true) as DocumentFragment;

        // Apply bindings to the cloned fragment BEFORE inserting into the DOM.
        // This avoids flash of unstyled content.
        for (const b of this.Template.Bindings) {
            const node = resolvePath(frag, b.path);
            if (!node) continue;
            const disposer = applyBinding(b, node, this.Instance, this.Signals);
            if (disposer) this.#disposers.push(disposer);
        }

        host.appendChild(frag);
    }

    unmount(): void
    {
        for (const d of this.#disposers) {
            try { d(); } catch (e) { console.warn('[arianna] Template: disposer threw:', e); }
        }
        this.#disposers = [];
        this.#host = null;
    }

    /** Re-run all bindings (rarely needed — effects handle changes automatically). */
    forceUpdate(): void
    {
        // No-op for now; bindings reactivity is handled by effect().
    }
}


// ─── Path resolution ─────────────────────────────────────────────────────────

function resolvePath(root: Node, path: number[]): Node | null
{
    let n: Node = root;
    for (const i of path) {
        const child: Node | undefined = n.childNodes[i];
        if (!child) return null;
        n = child;
    }
    return n;
}


// ─── Binding application ────────────────────────────────────────────────────

function applyBinding(b: BindingDesc, node: Node, instance: object, signals: Record<string, unknown>): (() => void) | null
{
    // Text bindings legitimately target Text nodes; everything else targets
    // an Element. Guard against accidentally calling Element-only methods
    // (removeAttribute, setAttribute, classList…) on Text/Comment nodes,
    // which happens when path resolution lands on a re-parented Text after
    // a list re-render. Without this we get `el.removeAttribute is not a function`.
    if (b.kind !== 'text' && node.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }
    switch (b.kind) {
        case 'attr':  return applyAttrBinding(b, node as Element, instance, signals);
        case 'event': return applyEventBinding(b, node as Element, instance, signals);
        case 'text':  return applyTextBinding(b, node as Text,    instance, signals);
        case 'if':    return applyIfBinding(b, node as Element,   instance, signals);
        case 'for':   return applyForBinding(b, node as Element,  instance, signals);
    }
}


// ─── :attr — attribute binding (with style/class object handling) ───────────

function applyAttrBinding(
    b: { name: string; expr: string },
    el: Element,
    instance: object,
    signals: Record<string, unknown>,
): () => void
{
    const name = b.name;

    if (name === 'style') {
        return effect(() => {
            const v = evalExpr(b.expr, instance, signals);
            applyStyleValue(el as HTMLElement, v);
        });
    }

    if (name === 'class') {
        return effect(() => {
            const v = evalExpr(b.expr, instance, signals);
            applyClassValue(el, v);
        });
    }

    // Generic attribute / property binding
    return effect(() => {
        const v = evalExpr(b.expr, instance, signals);
        if (v == null || v === false) {
            el.removeAttribute(name);
            return;
        }
        if (v === true) {
            el.setAttribute(name, '');
            return;
        }
        el.setAttribute(name, String(v));
    });
}

function applyStyleValue(el: HTMLElement, v: unknown): void
{
    if (v == null || v === false) {
        el.removeAttribute('style');
        return;
    }
    if (typeof v === 'string') {
        el.setAttribute('style', v);
        return;
    }
    if (typeof v === 'object') {
        // Guard: some legacy/SVG elements may not expose `style` as
        // CSSStyleDeclaration. Fall back to a plain inline string in that
        // case so the binding doesn't blow up the whole template.
        const style = el.style;
        if (!style) {
            const parts: string[] = [];
            for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
                if (val == null || val === false) continue;
                parts.push(`${k}: ${String(val)}`);
            }
            el.setAttribute('style', parts.join('; '));
            return;
        }
        for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
            if (val == null || val === false) {
                if (k.indexOf('-') !== -1) style.removeProperty(k);
                else (style as unknown as Record<string, unknown>)[k] = '';
                continue;
            }
            const sv = String(val);
            if (k.indexOf('-') !== -1) style.setProperty(k, sv);
            else (style as unknown as Record<string, unknown>)[k] = sv;
        }
        return;
    }
    el.setAttribute('style', String(v));
}

function applyClassValue(el: Element, v: unknown): void
{
    if (v == null || v === false) { el.removeAttribute('class'); return; }
    if (typeof v === 'string') { el.setAttribute('class', v); return; }
    if (Array.isArray(v)) {
        el.setAttribute('class', v.filter(Boolean).join(' '));
        return;
    }
    if (typeof v === 'object') {
        const active: string[] = [];
        for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
            if (val) active.push(k);
        }
        el.setAttribute('class', active.join(' '));
        return;
    }
    el.setAttribute('class', String(v));
}


// ─── @event — event listener ────────────────────────────────────────────────
//
// The expression can be:
//   - A method reference: @click="this.onClick"  → invoke directly
//   - An expression:      @click="this.count++"  → eval on every event
//
// We detect the simple reference case heuristically: a single identifier or
// dotted chain ending in a function value is taken as a callable; anything
// else is treated as a statement-style expression.

function applyEventBinding(
    b: { name: string; expr: string; modifiers: string[] },
    el: Element,
    instance: object,
    signals: Record<string, unknown>,
): () => void
{
    const handler = (e: Event) => {
        if (b.modifiers.includes('stop'))    e.stopPropagation();
        if (b.modifiers.includes('prevent')) e.preventDefault();
        if (b.modifiers.includes('self') && e.target !== el) return;

        // First try: evaluate the expression. If the result is a function,
        // call it with the event. Otherwise the eval was the action itself.
        const augmented = { ...signals, $event: e };
        try {
            const result = compile(b.expr).call(instance, augmented);
            if (typeof result === 'function') {
                result.call(instance, e);
            }
        } catch (err) {
            console.warn(`[arianna] Template: event expression "${b.expr}" threw:`, err);
        }
    };

    const opts: AddEventListenerOptions = {};
    if (b.modifiers.includes('once'))    opts.once    = true;
    if (b.modifiers.includes('capture')) opts.capture = true;
    if (b.modifiers.includes('passive')) opts.passive = true;

    el.addEventListener(b.name, handler, opts);
    return () => el.removeEventListener(b.name, handler, opts);
}


// ─── {{ expr }} — text interpolation ────────────────────────────────────────

function applyTextBinding(
    b: { segments: TextSegment[] },
    node: Text,
    instance: object,
    signals: Record<string, unknown>,
): () => void
{
    return effect(() => {
        let out = '';
        for (const s of b.segments) {
            if (s.kind === 'literal') {
                out += s.text;
            } else {
                const v = evalExpr(s.code, instance, signals);
                out += v == null ? '' : String(v);
            }
        }
        node.nodeValue = out;
    });
}


// ─── a-if — conditional render ──────────────────────────────────────────────

function applyIfBinding(
    b: { expr: string },
    el: Element,
    instance: object,
    signals: Record<string, unknown>,
): () => void
{
    const placeholder = document.createComment(`a-if ${b.expr}`);
    let mounted = true;

    return effect(() => {
        const v = Boolean(evalExpr(b.expr, instance, signals));
        if (v && !mounted) {
            placeholder.parentNode?.replaceChild(el, placeholder);
            mounted = true;
        } else if (!v && mounted) {
            el.parentNode?.replaceChild(placeholder, el);
            mounted = false;
        }
    });
}


// ─── a-for — list rendering ─────────────────────────────────────────────────
//
// Minimal implementation: re-renders the whole list on any change. Future
// upgrade: keyed diff. The element gets cloned, with each clone bound to a
// per-iteration scope (signals + iter variable).

function applyForBinding(
    b: { iter: string; expr: string },
    el: Element,
    instance: object,
    signals: Record<string, unknown>,
): () => void
{
    const parent = el.parentNode;
    if (!parent) return () => {};
    const anchor = document.createComment(`a-for ${b.iter} in ${b.expr}`);
    parent.replaceChild(anchor, el);
    el.removeAttribute('a-for');

    let renderedClones: Node[] = [];
    let cloneDisposers: Array<() => void> = [];

    const disposeClones = () => {
        for (const d of cloneDisposers) {
            try { d(); } catch { /* swallow */ }
        }
        cloneDisposers = [];
        for (const c of renderedClones) {
            if (c.parentNode) c.parentNode.removeChild(c);
        }
        renderedClones = [];
    };

    const renderDisposer = effect(() => {
        disposeClones();
        const list = evalExpr(b.expr, instance, signals);
        if (!list || !(Symbol.iterator in Object(list))) return;
        const items = Array.from(list as Iterable<unknown>);
        const insertBeforeNode = anchor;
        for (const item of items) {
            const clone = el.cloneNode(true) as Element;
            const localSignals = { ...signals, [b.iter]: item };
            // Walk the clone to apply its directives in this iteration's scope
            const itemBindings: BindingDesc[] = [];
            walk(clone, [], itemBindings);
            for (const ib of itemBindings) {
                const node = resolvePath(clone, ib.path);
                if (!node) continue;
                const d = applyBinding(ib, node, instance, localSignals);
                if (d) cloneDisposers.push(d);
            }
            parent.insertBefore(clone, insertBeforeNode);
            renderedClones.push(clone);
        }
    });

    return () => {
        renderDisposer();
        disposeClones();
        if (anchor.parentNode) anchor.parentNode.replaceChild(el, anchor);
    };
}
