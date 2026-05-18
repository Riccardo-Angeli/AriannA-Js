/**
 * @module    core/Template
 * @author    Riccardo Angeli
 * @version   1.0.0
 * @copyright Riccardo Angeli 2012-2026
 *
 * # AriannA Template — tagged-template DSL with Vue-style directives
 *
 * Lit-inspired tagged template literal with full Vue directive set on top
 * of AriannA's reactive engine (Signal / Observable / State). Templates are
 * parsed ONCE per call site (WeakMap cache on the TemplateStringsArray)
 * and instantiated cheaply per mount.
 *
 * ## Quick start
 *
 *   import { html, css } from './Template.ts';
 *
 *   class MyCard extends Component('arianna-my-card', HTMLDivElement) {
 *     build(opts) {
 *       this.template = html`
 *         <h3 class="title">{{ opts.title }}</h3>
 *         <p a-if="opts.body">{{ opts.body }}</p>
 *         <ul>
 *           <li a-for="item in items">{{ item.name }}</li>
 *         </ul>
 *         <button @click="onClick">Click me</button>
 *       `;
 *     }
 *     onClick(e) { console.log('clicked'); }
 *   }
 *
 * ## Reactivity
 *
 * Every `{{ expr }}` and every directive value runs inside an `effect()`.
 * Reading a Signal (`count.get()`), an Observable proxy (`state.foo`), or a
 * State property (`this.State.bar`) tracks dependencies automatically.
 * When dependencies change, the binding re-renders without re-parsing.
 *
 * ## Directives
 *
 *   a-if="expr"           — conditional render (also a-else-if, a-else on siblings)
 *   a-for="x in xs"       — list rendering: also "(x, i) in xs", "x of xs"
 *   a-show="expr"         — style.display toggle (keeps node in tree)
 *   a-text="expr"         — textContent
 *   a-html="expr"         — innerHTML (caller responsible for sanitization)
 *   a-class="k:expr; ..." — class toggles
 *   a-style="p:expr; ..." — style properties
 *   a-model="path"        — two-way bind on input/select/textarea/checkbox
 *
 * ## Aliases
 *
 *   :foo="expr"           — attribute / property binding (same as a-bind:foo)
 *   @click="handler"      — event listener      (same as a-on:click)
 *   .prop="expr"          — force property binding (skip attribute)
 *   ?disabled="expr"      — boolean attribute toggle
 *
 * ## Scope resolution
 *
 * Expressions are evaluated against, in priority order:
 *   1. this           — the Component instance
 *   2. this.State?.Value (or this.State) — if the component has a State<T>
 *   3. window globals  — fallback for top-level names
 *
 * ## Caching
 *
 * Tagged template strings have stable identity (same array literal returns
 * the same TemplateStringsArray). We cache CompiledTemplate per array, so
 * `html\`...\`` invoked 1000 times parses ONCE. Per-mount work is just
 * cloning the parsed `<template>.content` and re-binding the holes.
 */

import {
    effect, batch,
    type Signal,
} from './Observable.ts';

export type { Signal };


// ─────────────────────────────────────────────────────────────────────────────
//  Marker constants
//
//  We embed cheap, unique placeholders into the raw template source before
//  letting the HTML parser swallow it. After parsing, we walk the DOM and
//  identify the placeholders to wire up bindings.
//
//  Strategy: text holes become text markers; attribute holes become attribute
//  markers (suffix on the value). The markers contain a numeric index that
//  maps back to the original `values[]` slot of the tagged template.
// ─────────────────────────────────────────────────────────────────────────────

const MARK_PREFIX     = '\u200b\u200barianna-hole-';      // zero-width space x2 + tag
const MARK_RX         = /\u200b\u200barianna-hole-(\d+)/g;
const ATTR_MARK_RX    = /\u200b\u200barianna-hole-(\d+)/;
const TEXT_INTERP_RX  = /\{\{\s*([^}]+?)\s*\}\}/g;


// ─────────────────────────────────────────────────────────────────────────────
//  Expression evaluator with cache
//
//  We compile each expression text into a Function ONCE and cache the result.
//  The function takes the scope keys as parameters; we call it with the
//  corresponding values. Reading reactive sources (Signals, Observable
//  proxies, State.Value props) auto-tracks dependencies when invoked inside
//  effect().
// ─────────────────────────────────────────────────────────────────────────────

const _exprCache = new Map<string, (scope: Record<string, unknown>) => unknown>();

// ─────────────────────────────────────────────────────────────────────────────
//  Safe expression evaluator (used by html.safe`...`)
//
//  Mini Pratt parser. NO Function constructor, NO `with`, NO arbitrary JS.
//  Allowed grammar (loosely):
//    expr  := ternary
//    tern  := log ('?' expr ':' expr)?
//    log   := cmp (('&&'|'||') cmp)*
//    cmp   := add (('==='|'!=='|'=='|'!='|'<'|'>'|'<='|'>=') add)*
//    add   := mul (('+'|'-') mul)*
//    mul   := unary (('*'|'/'|'%') unary)*
//    unary := '!' unary | '-' unary | postfix
//    postfix := primary ('.'IDENT | '['expr']' | '|'IDENT)*    -- filters via `|`
//    primary := NUMBER | STRING | 'true' | 'false' | 'null' | IDENT | '('expr')'
// ─────────────────────────────────────────────────────────────────────────────

/** Registry of safe-mode filters available in templates. */
export const SAFE_FILTERS: Record<string, (input: unknown, ...args: unknown[]) => unknown> = {
    upper      : (v) => String(v ?? '').toUpperCase(),
    lower      : (v) => String(v ?? '').toLowerCase(),
    capitalize : (v) => { const s = String(v ?? ''); return s.charAt(0).toUpperCase() + s.slice(1); },
    trim       : (v) => String(v ?? '').trim(),
    length     : (v) => Array.isArray(v) || typeof v === 'string' ? (v as { length: number }).length : 0,
    json       : (v) => { try { return JSON.stringify(v); } catch { return ''; } },
    number     : (v) => Number(v),
    string     : (v) => String(v ?? ''),
    default    : (v, fallback) => v == null || v === '' ? fallback : v,
};

interface SafeToken { type: string; value: string | number; pos: number; }

function tokenizeSafe(code: string): SafeToken[]
{
    const out: SafeToken[] = [];
    let i = 0;
    while (i < code.length) {
        const c = code[i];
        if (/\s/.test(c)) { i++; continue; }
        // String
        if (c === "'" || c === '"') {
            const q = c; let j = i + 1; let s = '';
            while (j < code.length && code[j] !== q) {
                if (code[j] === '\\' && j + 1 < code.length) { s += code[j + 1]; j += 2; continue; }
                s += code[j++];
            }
            out.push({ type: 'string', value: s, pos: i });
            i = j + 1; continue;
        }
        // Number
        if (/\d/.test(c) || (c === '.' && /\d/.test(code[i + 1] ?? ''))) {
            let j = i;
            while (j < code.length && /[\d.]/.test(code[j])) j++;
            out.push({ type: 'number', value: parseFloat(code.slice(i, j)), pos: i });
            i = j; continue;
        }
        // Identifier
        if (/[a-zA-Z_$]/.test(c)) {
            let j = i;
            while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++;
            const word = code.slice(i, j);
            const kw = word === 'true' || word === 'false' || word === 'null' || word === 'undefined';
            out.push({ type: kw ? 'kw' : 'ident', value: word, pos: i });
            i = j; continue;
        }
        // Multi-char operators
        const next2 = code.slice(i, i + 2);
        const next3 = code.slice(i, i + 3);
        if (next3 === '===' || next3 === '!==') { out.push({ type: 'op', value: next3, pos: i }); i += 3; continue; }
        if (['==', '!=', '<=', '>=', '&&', '||'].includes(next2)) { out.push({ type: 'op', value: next2, pos: i }); i += 2; continue; }
        if ('+-*/%<>!?:|.,()[]'.includes(c)) { out.push({ type: 'op', value: c, pos: i }); i++; continue; }
        throw new Error(`Unexpected char "${c}" at ${i}`);
    }
    out.push({ type: 'eof', value: '', pos: code.length });
    return out;
}

class SafeParser
{
    #t: SafeToken[];
    #i = 0;
    constructor(t: SafeToken[]) { this.#t = t; }

    #peek(): SafeToken { return this.#t[this.#i]; }
    #eat(): SafeToken { return this.#t[this.#i++]; }
    #match(type: string, value?: string): boolean {
        const t = this.#peek();
        return t.type === type && (value === undefined || t.value === value);
    }
    #expect(type: string, value?: string): SafeToken {
        const t = this.#eat();
        if (t.type !== type || (value !== undefined && t.value !== value))
            throw new Error(`Expected ${type}${value ? ' "' + value + '"' : ''}, got ${t.type} "${t.value}"`);
        return t;
    }

    parseExpr(): (scope: Record<string, unknown>) => unknown { return this.parseTern(); }

    parseTern(): (scope: Record<string, unknown>) => unknown {
        const cond = this.parseLog();
        if (this.#match('op', '?')) {
            this.#eat();
            const a = this.parseExpr();
            this.#expect('op', ':');
            const b = this.parseExpr();
            return (s) => cond(s) ? a(s) : b(s);
        }
        return cond;
    }

    parseLog(): (scope: Record<string, unknown>) => unknown {
        let left = this.parseCmp();
        while (this.#match('op', '&&') || this.#match('op', '||')) {
            const op = this.#eat().value as string;
            const right = this.parseCmp();
            const L = left;
            left = op === '&&' ? (s) => L(s) && right(s) : (s) => L(s) || right(s);
        }
        return left;
    }

    parseCmp(): (scope: Record<string, unknown>) => unknown {
        let left = this.parseAdd();
        while (true) {
            const t = this.#peek();
            if (t.type !== 'op') break;
            const op = t.value as string;
            if (!['===','!==','==','!=','<','>','<=','>='].includes(op)) break;
            this.#eat();
            const right = this.parseAdd();
            const L = left;
            left = (s) => {
                const a = L(s) as never, b = right(s) as never;
                switch (op) {
                    case '===': return a === b;
                    case '!==': return a !== b;
                    case '==':  return a == b;
                    case '!=':  return a != b;
                    case '<':   return a < b;
                    case '>':   return a > b;
                    case '<=':  return a <= b;
                    case '>=':  return a >= b;
                }
                return false;
            };
        }
        return left;
    }

    parseAdd(): (scope: Record<string, unknown>) => unknown {
        let left = this.parseMul();
        while (this.#match('op', '+') || this.#match('op', '-')) {
            const op = this.#eat().value as string;
            const right = this.parseMul();
            const L = left;
            left = op === '+' ? (s) => (L(s) as number) + (right(s) as number) : (s) => (L(s) as number) - (right(s) as number);
        }
        return left;
    }

    parseMul(): (scope: Record<string, unknown>) => unknown {
        let left = this.parseUnary();
        while (this.#match('op', '*') || this.#match('op', '/') || this.#match('op', '%')) {
            const op = this.#eat().value as string;
            const right = this.parseUnary();
            const L = left;
            left = op === '*' ? (s) => (L(s) as number) * (right(s) as number)
                 : op === '/' ? (s) => (L(s) as number) / (right(s) as number)
                 :              (s) => (L(s) as number) % (right(s) as number);
        }
        return left;
    }

    parseUnary(): (scope: Record<string, unknown>) => unknown {
        if (this.#match('op', '!')) { this.#eat(); const e = this.parseUnary(); return (s) => !e(s); }
        if (this.#match('op', '-')) { this.#eat(); const e = this.parseUnary(); return (s) => -(e(s) as number); }
        return this.parsePost();
    }

    parsePost(): (scope: Record<string, unknown>) => unknown {
        let val = this.parsePrim();
        while (true) {
            if (this.#match('op', '.')) {
                this.#eat();
                const id = this.#expect('ident').value as string;
                const V = val;
                val = (s) => { const v = V(s) as Record<string, unknown> | null | undefined; return v == null ? undefined : v[id]; };
                continue;
            }
            if (this.#match('op', '[')) {
                this.#eat();
                const idx = this.parseExpr();
                this.#expect('op', ']');
                const V = val;
                val = (s) => { const v = V(s) as Record<string | number, unknown> | null | undefined; return v == null ? undefined : v[idx(s) as never]; };
                continue;
            }
            if (this.#match('op', '|')) {
                this.#eat();
                const name = this.#expect('ident').value as string;
                // Optional ( args ) for filters
                const args: Array<(scope: Record<string, unknown>) => unknown> = [];
                if (this.#match('op', '(')) {
                    this.#eat();
                    if (!this.#match('op', ')')) {
                        args.push(this.parseExpr());
                        while (this.#match('op', ',')) { this.#eat(); args.push(this.parseExpr()); }
                    }
                    this.#expect('op', ')');
                }
                const V = val;
                val = (s) => {
                    const f = SAFE_FILTERS[name];
                    if (typeof f !== 'function') return undefined;
                    const evaled = args.map(a => a(s));
                    return f(V(s), ...evaled);
                };
                continue;
            }
            break;
        }
        return val;
    }

    parsePrim(): (scope: Record<string, unknown>) => unknown {
        const t = this.#eat();
        if (t.type === 'number') { const v = t.value as number; return () => v; }
        if (t.type === 'string') { const v = t.value as string; return () => v; }
        if (t.type === 'kw') {
            const kw = t.value as string;
            return () => kw === 'true' ? true : kw === 'false' ? false : null;
        }
        if (t.type === 'ident') {
            const name = t.value as string;
            return (s) => s[name];
        }
        if (t.type === 'op' && t.value === '(') {
            const e = this.parseExpr();
            this.#expect('op', ')');
            return e;
        }
        throw new Error(`Unexpected token ${t.type} "${t.value}" at ${t.pos}`);
    }
}

const _safeCache = new Map<string, (scope: Record<string, unknown>) => unknown>();

function compileSafeExpr(code: string): (scope: Record<string, unknown>) => unknown
{
    const cached = _safeCache.get(code);
    if (cached) return cached;
    let fn: (scope: Record<string, unknown>) => unknown;
    try {
        const parser = new SafeParser(tokenizeSafe(code));
        fn = parser.parseExpr();
    } catch (e) {
        console.warn(`[arianna] html.safe: parse error in "${code}":`, e);
        fn = () => undefined;
    }
    _safeCache.set(code, fn);
    return fn;
}


/**
 * Compile + cache a JS expression into a function `(scope) => result`.
 * The expression has access to all keys in `scope` as variables.
 *
 * For example, with scope = { count, items, this: comp }:
 *   "count + items.length"  →  count + items.length
 *   "this.label"            →  this.label
 *
 * We use `with(scope)` semantics simulated by destructuring the scope
 * keys (since `with` is forbidden in strict-mode modules). At runtime the
 * scope is the *flattened* lookup chain assembled by `buildScope()`.
 */
function compileExpr(code: string, safe = false): (scope: Record<string, unknown>) => unknown
{
    if (safe) return compileSafeExpr(code);

    const cached = _exprCache.get(code);
    if (cached) return cached;

    let fn: (scope: Record<string, unknown>) => unknown;
    try {
        fn = new Function('__scope__', `with(__scope__){return (${code});}`) as never;
    } catch (e) {
        console.warn(`[arianna] Template: failed to compile expression "${code}":`, e);
        fn = () => undefined;
    }
    _exprCache.set(code, fn);
    return fn;
}

/** Evaluate an expression in a scope, returning undefined on any error. */
function evalExpr(code: string, scope: Record<string, unknown>, safe = false): unknown
{
    try { return compileExpr(code, safe || CURRENT_SAFE)(scope); }
    catch (e) {
        console.warn(`[arianna] Template: expression "${code}" threw:`, e);
        return undefined;
    }
}

/**
 * Module-level safe-mode flag. Set during a TemplateInstance mount when the
 * Template was created via html.safe`...`. All evalExpr calls inside that
 * mount path read this flag and route through compileSafeExpr instead of
 * compileExpr. Reset to false at the end of the mount path.
 *
 * Important: this is single-threaded JS — there's no concurrent mount.
 */
let CURRENT_SAFE = false;


// ─────────────────────────────────────────────────────────────────────────────
//  Scope builder
//
//  Templates evaluate against a layered scope. From highest to lowest priority:
//    1. local       — directive-injected vars (a-for loop variable, etc)
//    2. this        — `this` of the Component instance
//    3. State.Value — if `this.State` is a State<T> instance, its proxy
//    4. window      — global names as fallback
//
//  We merge into a single object so `with()` finds all keys.
// ─────────────────────────────────────────────────────────────────────────────

function buildScope(host: object, locals?: Record<string, unknown>, values?: unknown[]): Record<string, unknown>
{
    // We use a Proxy-based scope so identifier lookups inside `with(__scope__){...}`
    // resolve dynamically against the live host. This is important because:
    //  - Some HTMLElement keys (title, id, className, hidden, dir, slot, lang, ...)
    //    are NOT own enumerable on the instance — they're inherited as setters
    //    on the prototype chain. Snapshotting via Object.keys() misses them.
    //  - Reading a State.Value property via the host's getter triggers the
    //    reactive proxy and registers a dependency on the active effect.
    //  - The user can mutate `this.foo` after mount and the next read sees it.
    //
    // Lookup order:
    //   1. locals          — directive locals (a-for item, i, ...)
    //   2. host[key]       — instance / prototype chain (covers both own and inherited)
    //   3. host.State.Value[key] (if State present)
    //   4. globalThis[key] — Math, JSON, Array, etc.
    //
    // The `has` trap MUST return true for native names referenced inside `with()`
    // even when they don't exist anywhere — `with` consults `has` to decide
    // whether to use the scope value or the outer scope. We return true for any
    // key that's a string (not symbol) and not a forbidden built-in proxy trap.

    const state = (host as { State?: { Value?: object } }).State;
    const stateValue = (state && typeof state === 'object' && 'Value' in state ? state.Value : state) as object | undefined;

    const localKeys = locals ? Object.keys(locals) : [];

    const target: Record<string, unknown> = Object.create(null);
    // Expose a stable `this` reference (Vue-like)
    Object.defineProperty(target, 'this', { value: host, enumerable: false, configurable: true, writable: false });
    if (values) Object.defineProperty(target, '__values__', { value: values, enumerable: false, configurable: true, writable: false });
    if (locals) Object.assign(target, locals);

    const scope = new Proxy(target, {
        has(_t, key) {
            if (typeof key === 'symbol') return false;
            if (key === 'this') return true;
            if (key === '__values__') return key in target;
            if (localKeys.indexOf(key as string) !== -1) return true;
            // Anything else: claim it exists so `with(__scope__){return expr}` uses
            // our `get` trap rather than the outer scope (which would only have
            // globalThis bindings and would silently produce ReferenceError-only
            // for truly missing names).
            return true;
        },
        get(_t, key) {
            if (typeof key === 'symbol') return undefined;
            if (key === 'this') return host;
            if (key in target) return (target as Record<string, unknown>)[key as string];
            // host instance / prototype chain — catches HTMLElement.title, custom fields, methods, etc.
            try {
                const v = (host as Record<string, unknown>)[key as string];
                if (v !== undefined) return v;
            } catch { /* getter throw — fall through */ }
            // State.Value reactive proxy
            if (stateValue && typeof stateValue === 'object') {
                try {
                    const v = (stateValue as Record<string, unknown>)[key as string];
                    if (v !== undefined) return v;
                } catch { /* */ }
            }
            // Global fallback
            if (typeof globalThis !== 'undefined' && key in (globalThis as Record<string, unknown>)) {
                return (globalThis as Record<string, unknown>)[key as string];
            }
            return undefined;
        },
        set(_t, key, value) {
            // Two-way bindings (a-model) write to a path like `state.State.email`.
            // For SIMPLE identifiers, we route the write to the host so component
            // fields stay in sync. Locals are immutable for the duration of the
            // binding (a-for item changes only via re-render).
            if (typeof key === 'symbol') return false;
            if (localKeys.indexOf(key as string) !== -1) {
                (target as Record<string, unknown>)[key as string] = value;
                return true;
            }
            try {
                (host as Record<string, unknown>)[key as string] = value;
                return true;
            } catch {
                (target as Record<string, unknown>)[key as string] = value;
                return true;
            }
        },
    });

    return scope as unknown as Record<string, unknown>;
}


// ─────────────────────────────────────────────────────────────────────────────
//  Tagged template entry points: html`…` and css`…`
// ─────────────────────────────────────────────────────────────────────────────

interface RawTemplate
{
    strings : TemplateStringsArray;
    values  : unknown[];
    safe?   : boolean;
}

/**
 * Tagged template literal — entry point for component templates.
 *
 *   this.template = html`<h3>{{ title }}</h3>`;
 *
 * The result is a `Template` instance. Assigning it to `this.template` on
 * a Component will mount it into the host element automatically (the
 * Component setter is in Component.ts).
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): Template
{
    return new Template({ strings, values, safe: false });
}

/**
 * Safe-mode tagged template — for templates loaded from untrusted sources
 * (e.g. Daedalus user-authored templates, remote JSON content). Expression
 * evaluator is restricted to path access + a small filter library, with NO
 * arbitrary JS execution.
 *
 * Allowed:
 *   - identifiers + property paths : `user.name`, `items[0].title`
 *   - the `|` filter pipeline       : `price | currency('EUR')`
 *   - safe primitives               : numbers, strings, true/false/null
 *   - comparison operators          : `a === b`, `n > 3`
 *   - logical ops                   : `a && b`, `a || b`, `!a`
 *   - ternary                       : `a ? b : c`
 *
 * Disallowed:
 *   - function CALLS (other than registered filters)
 *   - assignment (`=`, `+=`, etc.)
 *   - `new`, `delete`, `typeof`, `instanceof`
 *   - arbitrary JS execution via `new Function`, `eval`, etc.
 *
 * The restriction is enforced by a tiny expression parser (no `with` / no
 * Function constructor). Use this exclusively for content you do not control.
 *
 * @example
 *   const tpl = html.safe`<p>{{ user.name | upper }}</p>`;
 */
function htmlSafe(strings: TemplateStringsArray, ...values: unknown[]): Template
{
    return new Template({ strings, values, safe: true });
}
html.safe = htmlSafe;

/**
 * Tagged template literal for CSS — returns a string. Currently a pass-through
 * with template interpolation; the result is suitable for assignment to
 * `this.Sheet = Sheet.parse(cssText)` or for `<style>.textContent`.
 *
 * NOTE: This is intentionally minimal — full reactive CSS bindings should
 * use the Sheet/Rule API directly with Signals.
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


// ─────────────────────────────────────────────────────────────────────────────
//  CompiledTemplate
//
//  Parsing happens once per call site (cached on the TemplateStringsArray).
//  The output is a frozen <template> element + a list of BindingDesc objects
//  describing where each hole / directive sits in the DOM.
// ─────────────────────────────────────────────────────────────────────────────

type Segment =
    | { kind: 'literal'; text: string }
    | { kind: 'expr';    code: string };

type BindingDesc =
    | { kind: 'text';      path: number[]; segments: Segment[] }
    | { kind: 'attr';      path: number[]; name: string; segments: Segment[] }
    | { kind: 'directive'; path: number[]; name: string; arg?: string; expr: string }
    | { kind: 'event';     path: number[]; type: string; expr: string; modifiers: string[] }
    | { kind: 'prop';      path: number[]; name: string; expr: string }
    | { kind: 'boolAttr';  path: number[]; name: string; expr: string };

interface CompiledTemplate
{
    template : HTMLTemplateElement;
    bindings : BindingDesc[];
    safe     : boolean;
}

const _compiledCache: WeakMap<TemplateStringsArray, CompiledTemplate> = new WeakMap();

/** Compile a raw tagged template into a frozen, reusable structure. */
function compile(raw: RawTemplate): CompiledTemplate
{
    const cached = _compiledCache.get(raw.strings);
    if (cached) return cached;

    // ── Stitch raw strings + value markers into a single HTML source ─────────
    // Static values get inlined into the HTML directly (they were known at
    // tag-evaluation time anyway). Markers only appear for things the runtime
    // must wire to. Since `${}` in tagged templates is positional, we treat
    // every `${}` as a *value hole*; the developer can pass a sub-Template,
    // a string, a function, a Signal, etc. For these we inject a marker so
    // the runtime can install the right binding at the right place.
    let src = '';
    for (let i = 0; i < raw.strings.length; i++) {
        src += raw.strings[i];
        if (i < raw.values.length) {
            // Inline marker — the parser preserves it as text or attribute value.
            src += MARK_PREFIX + i;
        }
    }

    // ── Parse via the browser's HTML parser ──────────────────────────────────
    const tmpl = document.createElement('template');
    tmpl.innerHTML = src;

    // ── Walk the parsed tree, collect bindings ───────────────────────────────
    const bindings: BindingDesc[] = [];
    walk(tmpl.content, [], bindings, raw.values);

    const out: CompiledTemplate = { template: tmpl, bindings, safe: !!raw.safe };
    _compiledCache.set(raw.strings, out);
    return out;
}


/** Recursive DOM walker — discovers and records bindings. */
function walk(node: Node, path: number[], out: BindingDesc[], values: unknown[]): void
{
    // ── Text nodes — extract {{ }} interpolations + value markers ────────────
    if (node.nodeType === Node.TEXT_NODE) {
        const text = (node as Text).data;
        const segments: Segment[] = [];

        // Combine: split on either {{ expr }} or marker, in source order.
        // We do two passes: first split on markers, then split each piece on {{ }}.
        const pieces = text.split(MARK_RX);
        // pieces alternate: [text, idx, text, idx, ...]
        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];
            if (i % 2 === 1) {
                // It's a marker index — the user passed `${expr}` here. We
                // represent it as a fake expression that reads from values[i].
                segments.push({ kind: 'expr', code: `__values__[${piece}]` });
                continue;
            }
            // Split on {{ }} interpolations
            let last = 0;
            piece.replace(TEXT_INTERP_RX, (m, expr: string, offset: number) => {
                if (offset > last) segments.push({ kind: 'literal', text: piece.slice(last, offset) });
                segments.push({ kind: 'expr', code: expr.trim() });
                last = offset + m.length;
                return m;
            });
            if (last < piece.length) segments.push({ kind: 'literal', text: piece.slice(last) });
        }

        // Only emit a binding if there's at least one expr (else it's pure literal).
        if (segments.some(s => s.kind === 'expr')) {
            out.push({ kind: 'text', path: [...path], segments });
        }
        return;
    }

    // ── Element nodes — inspect attributes for directives + bindings ─────────
    if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;

        // ── a-for special-case ───────────────────────────────────────────────
        // The element with a-for is a TEMPLATE for items. Its children must NOT
        // be walked here: their bindings depend on the loop-local scope (item, i)
        // which doesn't exist at compile time. The for directive itself clones
        // this sub-tree per item at runtime and runs rebindSubtree() against a
        // scope enriched with the locals.
        const forExpr = el.getAttribute('a-for');
        if (forExpr !== null) {
            el.removeAttribute('a-for');
            const expr = unmark(forExpr, values);
            out.push({ kind: 'directive', path: [...path], name: 'a-for', expr });
            return;
        }

        // Iterate a snapshot of attrs (we remove directive attrs to keep DOM clean)
        const attrs = Array.from(el.attributes);
        for (const attr of attrs) {
            const name = attr.name;
            const val  = attr.value;

            // @event="handler" or a-on:event
            if (name.startsWith('@') || name.startsWith('a-on:')) {
                const evtSpec = name.startsWith('@') ? name.slice(1) : name.slice(5);
                const [evtName, ...modifiers] = evtSpec.split('.');
                const expr = unmark(val, values);
                el.removeAttribute(name);
                out.push({ kind: 'event', path: [...path], type: evtName, expr, modifiers });
                continue;
            }
            // .prop="expr"
            if (name.startsWith('.')) {
                const propName = name.slice(1);
                const expr = unmark(val, values);
                el.removeAttribute(name);
                out.push({ kind: 'prop', path: [...path], name: propName, expr });
                continue;
            }
            // ?boolAttr="expr"
            if (name.startsWith('?')) {
                const attrName = name.slice(1);
                const expr = unmark(val, values);
                el.removeAttribute(name);
                out.push({ kind: 'boolAttr', path: [...path], name: attrName, expr });
                continue;
            }
            // :attr="expr" or a-bind:attr
            if (name.startsWith(':') || name.startsWith('a-bind:')) {
                const attrName = name.startsWith(':') ? name.slice(1) : name.slice(7);
                const expr = unmark(val, values);
                el.removeAttribute(name);
                out.push({ kind: 'directive', path: [...path], name: 'a-bind', arg: attrName, expr });
                continue;
            }
            // a-if / a-else-if / a-else / a-for / a-show / a-text / a-html / a-model / a-class / a-style
            if (name.startsWith('a-')) {
                const expr = unmark(val, values);
                el.removeAttribute(name);
                out.push({ kind: 'directive', path: [...path], name, expr });
                continue;
            }
            // Static attribute with value markers or {{ }} interpolation
            if (val.indexOf(MARK_PREFIX) !== -1 || TEXT_INTERP_RX.test(val)) {
                TEXT_INTERP_RX.lastIndex = 0;
                const segments: Segment[] = parseAttrValue(val);
                if (segments.some(s => s.kind === 'expr')) {
                    out.push({ kind: 'attr', path: [...path], name, segments });
                    el.setAttribute(name, '');   // placeholder — will be filled by effect
                }
            }
        }

        // Recurse children
        const children = el.childNodes;
        for (let i = 0; i < children.length; i++) {
            walk(children[i], [...path, i], out, values);
        }
        return;
    }

    // Other node types (Comment, Document, etc.) — recurse children
    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
        walk(children[i], [...path, i], out, values);
    }
}


/** Extract the raw expression for a directive value (handle bare markers). */
function unmark(val: string, _values: unknown[]): string
{
    const m = val.match(ATTR_MARK_RX);
    if (m && val === m[0]) {
        // Pure ${} placeholder — treat as expression that reads values[idx]
        return `__values__[${m[1]}]`;
    }
    // Otherwise, the value IS the expression text (Vue convention: a-if="count > 0")
    return val;
}


function parseAttrValue(text: string): Segment[]
{
    const segments: Segment[] = [];
    const pieces = text.split(MARK_RX);
    for (let i = 0; i < pieces.length; i++) {
        const piece = pieces[i];
        if (i % 2 === 1) {
            segments.push({ kind: 'expr', code: `__values__[${piece}]` });
            continue;
        }
        let last = 0;
        piece.replace(TEXT_INTERP_RX, (m, expr: string, offset: number) => {
            if (offset > last) segments.push({ kind: 'literal', text: piece.slice(last, offset) });
            segments.push({ kind: 'expr', code: expr.trim() });
            last = offset + m.length;
            return m;
        });
        if (last < piece.length) segments.push({ kind: 'literal', text: piece.slice(last) });
    }
    return segments;
}


// ─────────────────────────────────────────────────────────────────────────────
//  Template + TemplateInstance — clear separation
//
//  Template       = immutable descriptor (raw strings + values).
//  TemplateInstance = a single concrete mount: DocumentFragment + effects +
//                     anchors + slot projection map. Multiple instances of the
//                     same Template can co-exist on different hosts.
//
//  The setter `this.template = html\`...\`` on a Component creates a fresh
//  instance, mounts it, stores it. Re-assigning calls .unmount() on the
//  previous instance first.
// ─────────────────────────────────────────────────────────────────────────────

export interface MountOptions {
    /**
     * Projection behaviour for the host's PRE-EXISTING light DOM children:
     *  - 'replace'  : (default) light children are projected into matching <slot>
     *                 elements in the template; unmatched light children go to
     *                 the default <slot>; if no <slot> exists, they are removed.
     *  - 'append'   : keep all existing host children in place, append the
     *                 template fragment after them. No slot projection.
     *  - 'prepend'  : keep existing children, prepend the template fragment.
     */
    mode? : 'replace' | 'append' | 'prepend';
    /**
     * Forced projection backend. By default AriannA picks 'shadow' if the host
     * has a Shadow.Root attached (open or closed), else 'light'.
     */
    backend? : 'light' | 'shadow' | 'auto';
}

/**
 * A concrete mounted instance of a Template. Owns:
 *  - the resolved DocumentFragment (post-projection)
 *  - the effect disposers (text/attr/event bindings, sub-directives)
 *  - the slot projection map (which light-DOM nodes went where)
 *  - the host reference for unmount
 *
 * Multiple instances of the same Template can co-exist. Each is independently
 * unmountable. Reassigning `this.template = html\`...\`` on a Component
 * creates a new instance after unmounting the previous one.
 */
export class TemplateInstance
{
    /** The originating Template (descriptor). */
    readonly Template: Template;

    /** Effects + projection disposers — called by .unmount(). */
    #disposers: Array<() => void> = [];

    /** Host element this instance is mounted into (null when unmounted). */
    #host: Element | null = null;

    /** The rendered top-level fragment (children of the host post-mount). */
    #topNodes: Node[] = [];

    /** Slot projection map — for diagnostics / introspection. */
    Slots: Map<string, Node[]> = new Map();

    constructor(tpl: Template)
    {
        this.Template = tpl;
    }

    /** Called by Template.mount; not for user code. */
    _internalMount(host: Element, scope: object, opts: MountOptions, raw: RawTemplate): void
    {
        const mode    = opts.mode    ?? 'replace';
        const backend = resolveBackend(host, opts.backend ?? 'auto');

        // Activate safe-mode for the duration of this mount path. compileExpr
        // and evalExpr will route through the restricted parser if true. The
        // previous value is saved/restored so nested mounts inherit correctly.
        const prevSafe = CURRENT_SAFE;
        CURRENT_SAFE = !!raw.safe;
        try {
            this.#doInternalMount(host, scope, opts, raw, mode, backend);
        } finally {
            CURRENT_SAFE = prevSafe;
        }
    }

    #doInternalMount(host: Element, scope: object, opts: MountOptions, raw: RawTemplate, mode: 'replace' | 'append' | 'prepend', backend: 'light' | 'shadow'): void
    {
        void opts;

        // ── Capture light children BEFORE we touch the host ────────────────
        // Snapshot the existing host children for slot projection. Move (not
        // clone) semantics preserves identity / listeners / sub-components.
        const lightChildren = mode === 'replace' ? Array.from(host.childNodes) : [];

        // Bucket by `slot` attribute. Elements without `slot=""` go to the
        // default bucket. Text/Comment nodes also go to default.
        const buckets: Map<string, Node[]> = new Map();
        const DEFAULT_SLOT = '';
        for (const n of lightChildren) {
            let key = DEFAULT_SLOT;
            if (n.nodeType === Node.ELEMENT_NODE) {
                const attr = (n as Element).getAttribute('slot');
                if (attr) key = attr;
            }
            const arr = buckets.get(key);
            if (arr) arr.push(n);
            else buckets.set(key, [n]);
        }

        // Remove from current parent (we'll re-insert at projection sites).
        for (const n of lightChildren) {
            if (n.parentNode) n.parentNode.removeChild(n);
        }

        // ── Compile + clone the template fragment ──────────────────────────
        const compiled = compile(raw);
        const cloned = compiled.template.content.cloneNode(true) as DocumentFragment;
        const accessScope = buildScope(scope, undefined, raw.values);

        // ── Project light children into <slot> placeholders ────────────────
        // We walk the cloned fragment, find every <slot> element, replace it
        // with the matching bucket of light children (MOVING, not cloning).
        // Unmatched light children remaining in `buckets` after the walk are
        // discarded for backend='light' (mirrors Web Component fallback).
        //
        // For backend='shadow', we DO NOT do manual projection — we just let
        // the native ShadowRoot handle <slot> elements via browser semantics.
        // The light children stay in the host's lightDOM, and the shadow tree
        // contains the template (with native <slot> markers).
        const slotsRender: Map<string, Node[]> = new Map();
        if (backend === 'light' && mode === 'replace') {
            const slotEls = Array.from(cloned.querySelectorAll('slot'));
            for (const slotEl of slotEls) {
                const name = slotEl.getAttribute('name') ?? DEFAULT_SLOT;
                const bucket = buckets.get(name) ?? [];
                buckets.delete(name);
                slotsRender.set(name, bucket);
                if (bucket.length > 0) {
                    const parent = slotEl.parentNode!;
                    for (const n of bucket) parent.insertBefore(n, slotEl);
                    parent.removeChild(slotEl);
                } else {
                    // Fallback: keep <slot> contents (W3C spec compliance —
                    // <slot>...fallback...</slot> default content).
                    const parent = slotEl.parentNode!;
                    while (slotEl.firstChild) parent.insertBefore(slotEl.firstChild, slotEl);
                    parent.removeChild(slotEl);
                }
            }
            // Anything in `buckets` left over is unmatched — drop (no host left).
        }
        this.Slots = slotsRender;

        // ── Apply bindings — each effect returns a disposer ────────────────
        for (const b of compiled.bindings) {
            const node = resolvePath(cloned, b.path);
            if (!node) continue;
            const disposer = applyBinding(b, node, accessScope, scope);
            if (disposer) this.#disposers.push(disposer);
        }

        // ── Insert into host (light) or shadow root (shadow) ───────────────
        let mountTarget: Element | ShadowRoot;
        if (backend === 'shadow') {
            const shadowRef = (host as Element & { Shadow?: { Root: ShadowRoot | null } }).Shadow;
            const root = shadowRef?.Root ?? host.shadowRoot;
            if (!root) {
                // Should not happen since resolveBackend checked, but guard.
                mountTarget = host;
            } else {
                mountTarget = root;
                // For shadow mode: light children stay in host light DOM and
                // are projected by native <slot> elements automatically.
                if (mode === 'replace') {
                    for (const n of lightChildren) host.appendChild(n);
                }
            }
        } else {
            mountTarget = host;
        }

        // Track top-level nodes so unmount can target precisely
        this.#topNodes = Array.from(cloned.childNodes);

        switch (mode) {
            case 'replace':
                if (backend === 'shadow') {
                    // Shadow root: replace shadow content with the template
                    (mountTarget as ShadowRoot).replaceChildren(cloned);
                } else {
                    // Light: host already cleared above when we removed lightChildren
                    (mountTarget as Element).appendChild(cloned);
                }
                break;
            case 'append':
                mountTarget.appendChild(cloned);
                break;
            case 'prepend':
                mountTarget.insertBefore(cloned, mountTarget.firstChild);
                break;
        }

        this.#host = host;
    }

    /** Remove the instance from its host. Effects disposed, nodes detached. */
    unmount(): void
    {
        for (const d of this.#disposers) {
            try { d(); } catch (e) { console.warn('[arianna] Template disposer threw:', e); }
        }
        this.#disposers = [];
        for (const n of this.#topNodes) {
            if (n.parentNode) n.parentNode.removeChild(n);
        }
        this.#topNodes = [];
        this.Slots.clear();
        this.#host = null;
    }

    /** True while between mount() and unmount(). */
    get isMounted(): boolean { return this.#host !== null; }

    /** Active host (null after unmount). */
    get Host(): Element | null { return this.#host; }
}

function resolveBackend(host: Element, hint: 'light' | 'shadow' | 'auto'): 'light' | 'shadow'
{
    if (hint === 'light')  return 'light';
    if (hint === 'shadow') return 'shadow';
    const shadowRef = (host as Element & { Shadow?: { Root: ShadowRoot | null } }).Shadow;
    if (shadowRef?.Root) return 'shadow';
    if ((host as Element).shadowRoot) return 'shadow';
    return 'light';
}

/**
 * Immutable Template descriptor — produced by `html\`...\``. The descriptor
 * itself does nothing; call `.mount(host, scope, opts)` to instantiate.
 *
 * The same Template can be mounted into multiple hosts independently — each
 * mount produces a separate TemplateInstance.
 */
export class Template
{
    readonly #raw: RawTemplate;

    /**
     * The most-recently created instance (mostly for the
     * `this.template = html\`...\`` sugar in Component). For multiple-host
     * scenarios, prefer calling .mount() directly and keep your own refs.
     */
    LastInstance: TemplateInstance | null = null;

    constructor(raw: RawTemplate)
    {
        this.#raw = raw;
    }

    /**
     * Create a new TemplateInstance and mount it into the host. Returns the
     * instance for further reference (unmount, slot inspection, ...).
     */
    mount(host: Element, scope: object, opts: MountOptions = {}): TemplateInstance
    {
        const inst = new TemplateInstance(this);
        inst._internalMount(host, scope, opts, this.#raw);
        this.LastInstance = inst;
        return inst;
    }

    /**
     * Convenience: unmount the LastInstance only. For multi-mount use cases,
     * unmount each instance directly.
     */
    unmount(): void
    {
        if (this.LastInstance) this.LastInstance.unmount();
    }
}


// ─────────────────────────────────────────────────────────────────────────────
//  Apply bindings — runtime per-binding wiring
// ─────────────────────────────────────────────────────────────────────────────

/** Resolve a path of childNode indices into a node, starting from root. */
function resolvePath(root: Node, path: number[]): Node | null
{
    let n: Node | null = root;
    for (const i of path) {
        if (!n) return null;
        n = n.childNodes[i] ?? null;
    }
    return n;
}

/**
 * Apply a binding to its node. Returns a disposer for cleanup.
 *
 * Each binding wraps its update logic in `effect()` so reactive reads
 * (Signal.get(), Observable proxy, State.Value props) auto-track.
 */
function applyBinding(b: BindingDesc, node: Node, scope: Record<string, unknown>, host: object): (() => void) | null
{
    switch (b.kind)
    {
        case 'text':
            return applyTextBinding(b, node as Text, scope);
        case 'attr':
            return applyAttrBinding(b, node as Element, scope);
        case 'event':
            return applyEventBinding(b, node as Element, scope, host);
        case 'prop':
            return applyPropBinding(b, node as Element, scope);
        case 'boolAttr':
            return applyBoolAttrBinding(b, node as Element, scope);
        case 'directive':
            return applyDirectiveBinding(b, node as Element, scope, host);
    }
}


function renderSegments(segments: Segment[], scope: Record<string, unknown>): string
{
    let out = '';
    for (const s of segments) {
        if (s.kind === 'literal') { out += s.text; continue; }
        const v = evalExpr(s.code, scope);
        out += v == null ? '' : String(v);
    }
    return out;
}


function applyTextBinding(b: BindingDesc & { kind: 'text' }, node: Text, scope: Record<string, unknown>): () => void
{
    return effect(() => {
        node.nodeValue = renderSegments(b.segments, scope);
    });
}


function applyAttrBinding(b: BindingDesc & { kind: 'attr' }, el: Element, scope: Record<string, unknown>): () => void
{
    return effect(() => {
        const v = renderSegments(b.segments, scope);
        if (v === '' || v === 'null' || v === 'undefined') el.removeAttribute(b.name);
        else el.setAttribute(b.name, v);
    });
}


function applyEventBinding(b: BindingDesc & { kind: 'event' }, el: Element, scope: Record<string, unknown>, host: object): () => void
{
    const handler = (e: Event) => {
        // Modifiers: stop / prevent / self / once / capture / passive
        const mods = b.modifiers;
        if (mods.includes('stop'))    e.stopPropagation();
        if (mods.includes('prevent')) e.preventDefault();
        if (mods.includes('self') && e.target !== el) return;

        // Evaluate the expr — if it's a function, call it with the event.
        // If it's a method name reference, look it up on host. If it's a call
        // expression like `doThing(item)`, evaluate it directly.
        const exprText = b.expr.trim();

        // Heuristic: identifier-only → treat as method reference
        if (/^[a-zA-Z_$][\w$]*$/.test(exprText)) {
            const fn = (host as Record<string, unknown>)[exprText];
            if (typeof fn === 'function') (fn as (e: Event) => void).call(host, e);
            else evalExpr(exprText, { ...scope, $event: e });
        } else {
            evalExpr(exprText, { ...scope, $event: e });
        }
    };

    const opts: AddEventListenerOptions = {};
    if (b.modifiers.includes('once'))    opts.once    = true;
    if (b.modifiers.includes('capture')) opts.capture = true;
    if (b.modifiers.includes('passive')) opts.passive = true;

    el.addEventListener(b.type, handler, opts);
    return () => el.removeEventListener(b.type, handler, opts);
}


function applyPropBinding(b: BindingDesc & { kind: 'prop' }, el: Element, scope: Record<string, unknown>): () => void
{
    const rec = el as unknown as Record<string, unknown>;
    return effect(() => { rec[b.name] = evalExpr(b.expr, scope); });
}


function applyBoolAttrBinding(b: BindingDesc & { kind: 'boolAttr' }, el: Element, scope: Record<string, unknown>): () => void
{
    return effect(() => {
        const v = evalExpr(b.expr, scope);
        if (v) el.setAttribute(b.name, '');
        else el.removeAttribute(b.name);
    });
}


function applyDirectiveBinding(b: BindingDesc & { kind: 'directive' }, el: Element, scope: Record<string, unknown>, host: object): (() => void) | null
{
    switch (b.name) {
        case 'a-bind':   return applyBindDirective(b, el, scope);
        case 'a-if':     return applyIfDirective(b, el, scope, host);
        case 'a-else-if':
        case 'a-else':   return null;          // handled by sibling a-if
        case 'a-for':    return applyForDirective(b, el, scope, host);
        case 'a-show':   return applyShowDirective(b, el, scope);
        case 'a-text':   return applyATextDirective(b, el, scope);
        case 'a-html':   return applyAHtmlDirective(b, el, scope);
        case 'a-model':  return applyModelDirective(b, el, scope);
        case 'a-class':  return applyClassDirective(b, el, scope);
        case 'a-style':  return applyStyleDirective(b, el, scope);
        default:
            console.warn(`[arianna] Template: unknown directive "${b.name}"`);
            return null;
    }
}


// ─── a-bind:attr ─────────────────────────────────────────────────────────────
//
// Handles `:foo="expr"` and `a-bind:foo="expr"`. For most attributes we
// stringify the value and call setAttribute, but two special cases get
// Vue-style object handling:
//
//   :style="this.paneAStyle()"        where paneAStyle() returns { width:'50%' }
//   :class="this.classMap()"          where classMap() returns { active: true }
//
// Without this special-casing, returning an object from a getter results in
// `setAttribute('style', '[object Object]')`, which the browser silently
// ignores — components like Splitter, NodeEditor, VideoPlayer would render
// their template but layout would collapse because the size styles never
// reach the DOM.

function applyBindDirective(b: BindingDesc & { kind: 'directive' }, el: Element, scope: Record<string, unknown>): () => void
{
    const attrName = b.arg ?? '';

    if (attrName === 'style') {
        return effect(() => {
            const v = evalExpr(b.expr, scope);
            const style = (el as HTMLElement).style;
            if (v == null || v === false) {
                el.removeAttribute('style');
                return;
            }
            if (typeof v === 'string') {
                el.setAttribute('style', v);
                return;
            }
            if (typeof v === 'object') {
                // Apply each key on the style declaration. CamelCase keys
                // (paddingLeft) are accepted directly; kebab-case keys
                // (padding-left) go via setProperty.
                for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
                    if (val == null || val === false) {
                        if (k.indexOf('-') !== -1) style.removeProperty(k);
                        else (style as unknown as Record<string, unknown>)[k] = '';
                        continue;
                    }
                    const sv = typeof val === 'number' ? String(val) : String(val);
                    if (k.indexOf('-') !== -1) style.setProperty(k, sv);
                    else (style as unknown as Record<string, unknown>)[k] = sv;
                }
                return;
            }
            el.setAttribute('style', String(v));
        });
    }

    if (attrName === 'class') {
        return effect(() => {
            const v = evalExpr(b.expr, scope);
            if (v == null || v === false) { el.removeAttribute('class'); return; }
            if (typeof v === 'string') { el.setAttribute('class', v); return; }
            if (Array.isArray(v)) {
                el.setAttribute('class', v.filter(Boolean).join(' '));
                return;
            }
            if (typeof v === 'object') {
                // Object form: { className: boolean }
                const active: string[] = [];
                for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
                    if (val) active.push(k);
                }
                el.setAttribute('class', active.join(' '));
                return;
            }
            el.setAttribute('class', String(v));
        });
    }

    return effect(() => {
        const v = evalExpr(b.expr, scope);
        if (v == null || v === false) el.removeAttribute(attrName);
        else el.setAttribute(attrName, String(v));
    });
}


// ─── a-if + a-else-if + a-else ──────────────────────────────────────────────
function applyIfDirective(b: BindingDesc & { kind: 'directive' }, el: Element, scope: Record<string, unknown>, host: object): () => void
{
    // Walk siblings to find chained else-if / else
    const chain: { el: Element; expr: string | null }[] = [{ el, expr: b.expr }];
    let sib: Element | null = el.nextElementSibling;
    while (sib) {
        const attrIf   = sib.getAttribute('a-else-if');
        const hasElse  = sib.hasAttribute('a-else');
        if (attrIf !== null) {
            chain.push({ el: sib, expr: attrIf });
            sib.removeAttribute('a-else-if');
            sib = sib.nextElementSibling;
            continue;
        }
        if (hasElse) {
            chain.push({ el: sib, expr: null });
            sib.removeAttribute('a-else');
            break;
        }
        break;
    }

    // Create anchor placeholders to remember positions
    const anchors: Comment[] = chain.map(c => {
        const a = document.createComment(' a-if ');
        c.el.parentNode?.insertBefore(a, c.el);
        return a;
    });
    const present: boolean[] = chain.map(c => c.el.parentNode !== null);
    chain.forEach(c => c.el.parentNode?.removeChild(c.el));

    return effect(() => {
        let chosen = -1;
        for (let i = 0; i < chain.length; i++) {
            const expr = chain[i].expr;
            if (expr === null) { chosen = i; break; }     // a-else
            if (evalExpr(expr, scope)) { chosen = i; break; }
        }
        for (let i = 0; i < chain.length; i++) {
            const should = i === chosen;
            if (should && !present[i]) {
                anchors[i].parentNode?.insertBefore(chain[i].el, anchors[i].nextSibling);
                present[i] = true;
            } else if (!should && present[i]) {
                chain[i].el.parentNode?.removeChild(chain[i].el);
                present[i] = false;
            }
        }
        // Reference host to silence unused-param warnings (compiler-visible scope).
        void host;
    });
}


// ─── a-for="item in items" / "(item, i) in items" / "item of items" ────────
function applyForDirective(b: BindingDesc & { kind: 'directive' }, el: Element, scope: Record<string, unknown>, host: object): () => void
{
    // Parse the loop expression
    const m = b.expr.match(/^\s*(?:\(\s*([\w$]+)(?:\s*,\s*([\w$]+))?\s*\)|([\w$]+))\s+(?:in|of)\s+(.+)$/);
    if (!m) {
        console.warn(`[arianna] Template: invalid a-for expression "${b.expr}"`);
        return () => {};
    }
    const valVar    = m[1] ?? m[3];
    const idxVar    = m[2] ?? null;
    const listExpr  = m[4];

    // Anchor + remove template element
    const anchor = document.createComment(' a-for ');
    el.parentNode?.insertBefore(anchor, el);
    el.parentNode?.removeChild(el);

    const rendered: Array<{ el: Element; disposers: Array<() => void> }> = [];

    const dispose = effect(() => {
        const listVal = evalExpr(listExpr, scope) as unknown[] | undefined | null;
        const list = Array.isArray(listVal) ? listVal : (listVal && typeof listVal === 'object' ? Object.entries(listVal) : []);

        // Cheap key-less reconciliation: trim or extend.
        // Trim
        while (rendered.length > list.length) {
            const last = rendered.pop()!;
            for (const d of last.disposers) try { d(); } catch {}
            last.el.parentNode?.removeChild(last.el);
        }
        // Update + extend
        for (let i = 0; i < list.length; i++) {
            const itemValue = list[i];
            if (i < rendered.length) {
                // Re-evaluate sub-bindings with updated locals (handled by re-running
                // the entry's effects — see below). For the simple impl, we just
                // refresh the locals scope here; sub-bindings already track via effect.
                // Trick: replace the dom in-place is overkill; instead we tear down
                // and rebuild this entry's effects.
                for (const d of rendered[i].disposers) try { d(); } catch {}
                rendered[i].disposers = [];
                const subScope = { ...scope };
                subScope[valVar] = itemValue;
                if (idxVar) subScope[idxVar] = i;
                rebindSubtree(rendered[i].el, subScope, host, rendered[i].disposers);
                continue;
            }
            // New entry — clone the template element + apply sub-bindings
            const clone = el.cloneNode(true) as Element;
            const subScope = { ...scope };
            subScope[valVar] = itemValue;
            if (idxVar) subScope[idxVar] = i;
            const subDisposers: Array<() => void> = [];
            rebindSubtree(clone, subScope, host, subDisposers);
            anchor.parentNode?.insertBefore(clone, anchor);
            rendered.push({ el: clone, disposers: subDisposers });
        }
    });

    return () => {
        dispose();
        for (const r of rendered) {
            for (const d of r.disposers) try { d(); } catch {}
            r.el.parentNode?.removeChild(r.el);
        }
        rendered.length = 0;
        anchor.parentNode?.removeChild(anchor);
    };
}


/**
 * Re-walk a sub-tree and apply bindings for each {{ }} / directive found.
 * Used by a-for to re-bind cloned children with new loop locals.
 *
 * NOTE: This is a simplified implementation. A full Vue-style reconciler
 * would key the bindings to the parsed template and re-execute them with the
 * new scope. For correctness here, we re-parse the clone's text nodes and
 * attributes inline. Sub-directives (a-if, a-for inside a-for) work because
 * each level installs its own effect.
 */
function rebindSubtree(root: Element, scope: Record<string, unknown>, host: object, disposers: Array<() => void>): void
{
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let node: Node | null = walker.currentNode;
    do {
        if (!node) break;

        if (node.nodeType === Node.TEXT_NODE) {
            const t = (node as Text).data;
            if (TEXT_INTERP_RX.test(t)) {
                TEXT_INTERP_RX.lastIndex = 0;
                const segments = parseAttrValue(t);
                if (segments.some(s => s.kind === 'expr')) {
                    const textNode = node as Text;
                    const d = effect(() => { textNode.nodeValue = renderSegments(segments, scope); });
                    disposers.push(d);
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;

            // Handle nested a-for first — collapse it to a directive binding,
            // then skip walking its children (the inner for handles them).
            const innerFor = el.getAttribute('a-for');
            if (innerFor !== null) {
                el.removeAttribute('a-for');
                const bd: BindingDesc = { kind: 'directive', path: [], name: 'a-for', expr: innerFor };
                const d = applyDirectiveBinding(bd, el, scope, host);
                if (d) disposers.push(d);
                // Skip descendants of this nested-for element
                let skip = node;
                while (walker.currentNode && (walker.currentNode === skip || (skip as Element).contains(walker.currentNode))) {
                    if (!walker.nextSibling()) {
                        // climb up
                        if (!walker.parentNode()) { node = null; break; }
                        skip = walker.currentNode;
                    }
                }
                if (node === null) break;
                continue;
            }

            const attrs = Array.from(el.attributes);
            for (const attr of attrs) {
                const name = attr.name;
                const val  = attr.value;

                // @event or a-on:event
                if (name.startsWith('@') || name.startsWith('a-on:')) {
                    const evtSpec = name.startsWith('@') ? name.slice(1) : name.slice(5);
                    const [evtName, ...modifiers] = evtSpec.split('.');
                    el.removeAttribute(name);
                    const handler = (e: Event) => {
                        if (modifiers.includes('stop'))    e.stopPropagation();
                        if (modifiers.includes('prevent')) e.preventDefault();
                        if (modifiers.includes('self') && e.target !== el) return;
                        const exprText = val.trim();
                        if (/^[a-zA-Z_$][\w$]*$/.test(exprText)) {
                            const fn = (host as Record<string, unknown>)[exprText];
                            if (typeof fn === 'function') (fn as (e: Event) => void).call(host, e);
                            else evalExpr(exprText, { ...scope, $event: e });
                        } else {
                            evalExpr(exprText, { ...scope, $event: e });
                        }
                    };
                    const opts: AddEventListenerOptions = {};
                    if (modifiers.includes('once'))    opts.once    = true;
                    if (modifiers.includes('capture')) opts.capture = true;
                    if (modifiers.includes('passive')) opts.passive = true;
                    el.addEventListener(evtName, handler, opts);
                    disposers.push(() => el.removeEventListener(evtName, handler, opts));
                    continue;
                }
                // :attr / a-bind:attr
                if (name.startsWith(':') || name.startsWith('a-bind:')) {
                    const attrName = name.startsWith(':') ? name.slice(1) : name.slice(7);
                    el.removeAttribute(name);
                    const bd: BindingDesc = { kind: 'directive', path: [], name: 'a-bind', arg: attrName, expr: val };
                    const d = applyDirectiveBinding(bd, el, scope, host);
                    if (d) disposers.push(d);
                    continue;
                }
                // .prop
                if (name.startsWith('.')) {
                    const propName = name.slice(1);
                    el.removeAttribute(name);
                    const bd: BindingDesc = { kind: 'prop', path: [], name: propName, expr: val };
                    const d = applyPropBinding(bd, el, scope);
                    if (d) disposers.push(d);
                    continue;
                }
                // ?attr
                if (name.startsWith('?')) {
                    const attrName = name.slice(1);
                    el.removeAttribute(name);
                    const bd: BindingDesc = { kind: 'boolAttr', path: [], name: attrName, expr: val };
                    const d = applyBoolAttrBinding(bd, el, scope);
                    if (d) disposers.push(d);
                    continue;
                }
                // a-* directives (text/html/show/class/style/model/if)
                if (name === 'a-if' || name === 'a-show' || name === 'a-text' || name === 'a-html' || name === 'a-class' || name === 'a-style' || name === 'a-model') {
                    el.removeAttribute(name);
                    const bd: BindingDesc = { kind: 'directive', path: [], name, expr: val };
                    const d = applyDirectiveBinding(bd, el, scope, host);
                    if (d) disposers.push(d);
                    continue;
                }
                // Static attr with {{ }} interp
                if (TEXT_INTERP_RX.test(val) || val.indexOf(MARK_PREFIX) !== -1) {
                    TEXT_INTERP_RX.lastIndex = 0;
                    const segments = parseAttrValue(val);
                    if (segments.some(s => s.kind === 'expr')) {
                        const d = effect(() => {
                            const v = renderSegments(segments, scope);
                            if (v === '' || v === 'null' || v === 'undefined') el.removeAttribute(name);
                            else el.setAttribute(name, v);
                        });
                        disposers.push(d);
                    }
                }
            }
        }
        node = walker.nextNode();
    } while (node);
}


// ─── a-show ─────────────────────────────────────────────────────────────────
function applyShowDirective(b: BindingDesc & { kind: 'directive' }, el: Element, scope: Record<string, unknown>): () => void
{
    return effect(() => {
        (el as HTMLElement).style.display = evalExpr(b.expr, scope) ? '' : 'none';
    });
}


// ─── a-text ─────────────────────────────────────────────────────────────────
function applyATextDirective(b: BindingDesc & { kind: 'directive' }, el: Element, scope: Record<string, unknown>): () => void
{
    return effect(() => {
        const v = evalExpr(b.expr, scope);
        el.textContent = v == null ? '' : String(v);
    });
}


// ─── a-html ─────────────────────────────────────────────────────────────────
function applyAHtmlDirective(b: BindingDesc & { kind: 'directive' }, el: Element, scope: Record<string, unknown>): () => void
{
    return effect(() => {
        const v = evalExpr(b.expr, scope);
        el.innerHTML = v == null ? '' : String(v);
    });
}


// ─── a-model — two-way binding ──────────────────────────────────────────────
function applyModelDirective(b: BindingDesc & { kind: 'directive' }, el: Element, scope: Record<string, unknown>): () => void
{
    const path = b.expr.trim();
    // Compile a setter as a separate Function — accepts (scope, value) and
    // assigns scope.<path> = value.
    let setter: ((scope: Record<string, unknown>, value: unknown) => void) | null = null;
    try {
        setter = new Function('__scope__', '__value__', `with(__scope__){${path} = __value__;}`) as ((scope: Record<string, unknown>, value: unknown) => void);
    } catch (e) {
        console.warn(`[arianna] Template a-model: invalid path "${path}":`, e);
    }

    const input = el as HTMLInputElement;
    const tag   = input.tagName.toLowerCase();
    const type  = input.type;

    let listener: EventListener;

    if (tag === 'input' && (type === 'checkbox' || type === 'radio')) {
        listener = () => { if (setter) setter(scope, input.checked); };
        input.addEventListener('change', listener);
        const eff = effect(() => {
            input.checked = !!evalExpr(path, scope);
        });
        return () => { eff(); input.removeEventListener('change', listener); };
    }

    if (tag === 'select') {
        listener = () => { if (setter) setter(scope, input.value); };
        input.addEventListener('change', listener);
        const eff = effect(() => {
            const v = evalExpr(path, scope);
            input.value = v == null ? '' : String(v);
        });
        return () => { eff(); input.removeEventListener('change', listener); };
    }

    // Default: text-like input/textarea, listen on 'input'
    listener = () => {
        if (!setter) return;
        const v: unknown = type === 'number' || type === 'range' ? Number(input.value) : input.value;
        setter(scope, v);
    };
    input.addEventListener('input', listener);
    const eff = effect(() => {
        const v = evalExpr(path, scope);
        const s = v == null ? '' : String(v);
        if (input.value !== s) input.value = s;
    });
    return () => { eff(); input.removeEventListener('input', listener); };
}


// ─── a-class="active:isActive; large:size==='lg'" ───────────────────────────
function applyClassDirective(b: BindingDesc & { kind: 'directive' }, el: Element, scope: Record<string, unknown>): () => void
{
    // Two accepted shapes:
    //   "key:expr; key:expr"   — Vue-style micro-DSL
    //   "{ key: expr, ... }"   — JS object literal (evaluated as one expression)
    //
    // Heuristic: starts with '{' → eval as object.
    const text = b.expr.trim();
    if (text.startsWith('{')) {
        return effect(() => {
            const obj = evalExpr(text, scope) as Record<string, unknown> | null;
            if (!obj || typeof obj !== 'object') return;
            for (const [k, v] of Object.entries(obj)) {
                if (v) el.classList.add(k); else el.classList.remove(k);
            }
        });
    }

    // Vue-style "key:expr; key:expr"
    const pairs = text.split(';').map(s => s.trim()).filter(Boolean).map(p => {
        const idx = p.indexOf(':');
        if (idx === -1) return null;
        return { key: p.slice(0, idx).trim(), expr: p.slice(idx + 1).trim() };
    }).filter((x): x is { key: string; expr: string } => x !== null);

    return effect(() => {
        for (const { key, expr } of pairs) {
            if (evalExpr(expr, scope)) el.classList.add(key);
            else el.classList.remove(key);
        }
    });
}


// ─── a-style="prop:expr; prop:expr" ─────────────────────────────────────────
function applyStyleDirective(b: BindingDesc & { kind: 'directive' }, el: Element, scope: Record<string, unknown>): () => void
{
    const text = b.expr.trim();
    const elStyle = (el as HTMLElement).style;

    if (text.startsWith('{')) {
        return effect(() => {
            const obj = evalExpr(text, scope) as Record<string, unknown> | null;
            if (!obj || typeof obj !== 'object') return;
            for (const [k, v] of Object.entries(obj)) {
                const cssProp = k.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
                elStyle.setProperty(cssProp, v == null ? '' : String(v));
            }
        });
    }

    const pairs = text.split(';').map(s => s.trim()).filter(Boolean).map(p => {
        const idx = p.indexOf(':');
        if (idx === -1) return null;
        return { prop: p.slice(0, idx).trim(), expr: p.slice(idx + 1).trim() };
    }).filter((x): x is { prop: string; expr: string } => x !== null);

    return effect(() => {
        for (const { prop, expr } of pairs) {
            const v = evalExpr(expr, scope);
            const cssProp = prop.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
            elStyle.setProperty(cssProp, v == null ? '' : String(v));
        }
    });
}


// ─────────────────────────────────────────────────────────────────────────────
//  Re-exports + window exposure
// ─────────────────────────────────────────────────────────────────────────────

export { batch };

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'html',     { value: html,     writable: false, enumerable: false, configurable: false });
    Object.defineProperty(window, 'css',      { value: css,      writable: false, enumerable: false, configurable: false });
    Object.defineProperty(window, 'Template', { value: Template, writable: false, enumerable: false, configurable: false });
}

export default Template;
