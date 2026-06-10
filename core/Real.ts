/**
 * Real.ts — eager, fluent wrapper over a live DOM Element.
 *
 * `Real` is the imperative half of AriannA's DOM API (the lazy half is
 * `Virtual`). Every method mutates a real Element *immediately* and returns
 * `this` for chaining. Reactive binding methods (`text`, `attr`, `cls`,
 * `prop`, `style`) accept a getter that runs inside an `effect`, so reads of
 * signals subscribe automatically; a static value works too (it's wrapped via
 * `asGetter`). See `REAL_VIRTUAL.md` for the conceptual overview.
 */
import Core, { type TypeDescriptor, type SubAccessor } from './Core.ts';
import { VirtualNode } from './Virtual.ts';
import { signal, signalMono, sinkText, effect, type Signal, type SignalMono, type ReadonlySignal } from './Observable.ts';
import Rule, { type ShadowState, type ShadowMode, type ShadowOptions, type ShadowLayer } from './Rule.ts';
import { Stylesheet } from './Stylesheet.ts';
/** Shadow value types re-exported from Rule (their canonical home). */
export type { ShadowState, ShadowMode, ShadowOptions, ShadowLayer } from './Rule.ts';
export type { Signal, SignalMono, ReadonlySignal };
// SubAccessor's canonical home is Core; re-exported here for the barrel.
// (Dotted-path get/set/sub is inlined in the methods below — no shared helper.)
export type { SubAccessor } from './Core.ts';

//---------------------------- Questo Blocco va rimosso! Trova il modo, namespace o meglio embed private in Real class-----------------------------------------
/** Anything `new Real(...)` accepts: selector, Element, constructor, VirtualNode, plain def, or another Real. */
export type RealTarget = string | Element | (new (...a: unknown[]) => Element) | VirtualNode | RealDef | Real;
/** Plain object element definition: `{ Tag, Attributes, Style }`. */
export interface RealDef { Tag?: string; Attributes?: Record<string, string>; Style?: Record<string, string>; }
type Getter<T> = () => T;

type NodeInput = RealTarget | Node | null;  // RealTarget already covers string/Element/VirtualNode/Real/def
//---------------------------------------------------------------------

/**
 * Eager, fluent wrapper around a single live DOM Element.
 *
 * Constructed with `new`, it creates/wraps an Element immediately and offers a
 * chainable API for tree mutation (`append/add/remove/...`), attribute &
 * property access (`set/get/sub`), reactive bindings (`text/attr/cls/prop/style`),
 * events (`on/off/fire`), visibility (`show/hide`), and scoped CSS (`Sheet`).
 */
export class Real
{
    #el: Element; #mode: boolean; #descriptor: TypeDescriptor | false; #value: unknown; #effects: Array<() => void> = [];
    #sheet: Stylesheet | null = null; #styleNode: HTMLStyleElement | null = null; #instanceId: string = ''; #sheetSync: (() => void) | null = null;
    /** Every `new Real(...)` instance, in creation order (used for auto-id allocation). */
    static readonly Instances: Real[] = [];
    /** The Core namespace registry (passthrough to `Core.Namespaces`). */
    static get Namespaces() { return Core.Namespaces; }

    /** Coerce a value-or-getter into a getter, so binding methods accept both forms. */
    private static _asGetter<T>(g: Getter<T> | T): Getter<T> { return typeof g === 'function' ? (g as Getter<T>) : () => g; }

    /** Normalise a mixed list of child inputs into concrete DOM Nodes. */
    private static _toNodes(items: NodeInput[]): Node[] {
        return items.flatMap(item => {
            if (!item) return [];
            if (item instanceof Node) return [item];
            if (item instanceof Real) return [item.render()];
            if (item instanceof VirtualNode) return [item.render()];
            if (typeof item === 'string') { const t = document.createElement('template'); t.innerHTML = item; return Array.from(t.content.childNodes); }
            if (typeof item === 'object' && 'Tag' in item) { const el = document.createElement((item as RealDef).Tag ?? 'div'); if ((item as RealDef).Attributes) for (const [k,v] of Object.entries((item as RealDef).Attributes!)) el.setAttribute(k,v); return [el]; }
            return [];
        });
    }

    /**
     * Create (or wrap) an Element. When called with `new` and a string tag,
     * the element is created (and, for a registered Custom tag, upgraded) and
     * auto-assigned an id + matching class. Other inputs (Element, Real,
     * VirtualNode, template, `{Tag,...}` def) are wrapped/materialised. See
     * {@link Real.#init} for the per-input behaviour.
     */
    constructor(arg0: RealTarget, arg1?: Record<string, unknown> | (new (...a: unknown[]) => Element), arg2?: new (...a: unknown[]) => Element) {
        this.#mode = new.target !== undefined; this.#el = document.createElement('div'); this.#descriptor = false; this.#value = this;
        this.#init(arg0, arg1, arg2);
        // Auto-assign id + class. SVG/MathML elements have `className` as a
        // read-only SVGAnimatedString — we can only mutate the class via
        // setAttribute('class', …), which is also the universally correct
        // form for HTML. So we always use setAttribute here.
        if (this.#mode)
        {
            Real.Instances.push(this); if (!this.#el.id)
            {
                const autoId = `Real-Instance-${Real.Instances.length}`;
                this.#el.id = autoId; this.#el.setAttribute('class', autoId);
            }
        }
    }

    /**
     * Resolve the constructor arguments into `#el`/`#descriptor`/`#value`.
     * Non-`new` (call) mode is a lookup/registration helper; `new` mode
     * actually creates or wraps the element. For a registered Custom string
     * tag it delegates to `Core.Create`, which runs the namespace Update
     * synchronously (prototype splice + `build()`), so the returned element is
     * live and upgraded — not a bare, un-upgraded node.
     */
    #init(arg0: RealTarget, arg1?: Record<string, unknown> | (new (...a: unknown[]) => Element), arg2?: new (...a: unknown[]) => Element): void {
        if (!this.#mode) {
            if (typeof arg0 === 'string') { if (arg1 && typeof arg1 === 'function') { Core.Define(arg0, arg1 as new () => Element, (arg2 ?? HTMLElement) as new () => Element); this.#value = arg1; return; } const d = Core.GetDescriptor(arg0); if (d) { this.#descriptor = d; this.#value = d.Constructor ?? d.Interface; return; } const el = document.querySelector(arg0); if (el) { this.#el = el; this.#descriptor = Core.GetDescriptor(el); this.#value = new Real(el); } return; }
            if (typeof arg0 === 'function') { const d = Core.GetDescriptor(arg0 as new () => Element); if (d) { this.#descriptor = d; this.#value = d.Interface ?? arg0; } return; }
            if (arg0 instanceof Element) { this.#el = arg0; this.#descriptor = Core.GetDescriptor(arg0); this.#value = new Real(arg0); this.#mode = true; return; }
            return;
        }
        if (typeof arg0 === 'string') {
            // Single line: d.Namespace.Create() (direct on the descriptor) — handles
            // every case (CLASS via Reflect.construct, FUNCTION via createElement
            // + Update, plain native tags). Real has no upgrade logic of its
            // own; it asks Core to create an UPGRADED element. For a registered
            // Custom tag Core.Create runs the namespace Update synchronously —
            // splicing the user subclass into the prototype chain and calling
            // build() — so `new Real('case-4b')` / `new Component(tag).Real`
            // produce a live, built element (not a bare, un-upgraded one).
            const d = Core.GetDescriptor(arg0);
            if (d && (d as { Custom?: boolean }).Custom && typeof Core.Create === 'function') {
                this.#el = (Core.Create(arg0) as Element) ?? document.createElement(arg0);
            } else {
                this.#el = (d && typeof d.Namespace?.Create === 'function')
                    ? (d.Namespace.Create(arg0) ?? document.createElement(arg0))
                    : document.createElement(arg0);
            }
            if (d) this.#descriptor = d;
        }
        else if (arg0 instanceof Element) { this.#el = arg0; this.#descriptor = Core.GetDescriptor(arg0); }
        else if (arg0 instanceof Real) { this.#el = arg0.render(); }
        else if (arg0 instanceof VirtualNode) { this.#el = arg0.render(); }
        else if (typeof arg0 === 'object' && 'Tag' in (arg0 as object)) { const def = arg0 as RealDef; this.#el = document.createElement(def.Tag ?? 'div'); if (def.Attributes) for (const [k,v] of Object.entries(def.Attributes)) this.#el.setAttribute(k,v); }
        if (arg1 && typeof arg1 === 'object' && typeof arg1 !== 'function') { const opts = arg1 as Record<string, unknown>; if (opts.id) this.#el.id = String(opts.id); if (opts.class || opts.className) this.#el.setAttribute('class', String(opts.class ?? opts.className)); }
    }

    /** The underlying live Element. */
    render(): Element { return this.#el; }
    /** Coercion hook — returns the underlying Element (so `el == real` etc. work). */
    valueOf(): Element { return this.#el; }
    /** `console.log` the given value (or the element) and return `this` for chaining. */
    log(v?: unknown): this { console.log(v ?? this.#el); return this; }

    /** Add an event listener (`addEventListener`). */
    on(type: string, cb: EventListener, opts?: AddEventListenerOptions | boolean): this { this.#el.addEventListener(type, cb, opts); return this; }
    /** Remove an event listener (`removeEventListener`). */
    off(type: string, cb: EventListener, opts?: EventListenerOptions | boolean): this { this.#el.removeEventListener(type, cb, opts); return this; }
    /** Dispatch an Event, or a CustomEvent built from a string name + init. */
    fire(event: Event | string, init?: CustomEventInit): this { this.#el.dispatchEvent(typeof event === 'string' ? new CustomEvent(event, init) : event); return this; }

    /** Append THIS element as a child of `parent` (selector / Element / Real / VirtualNode). */
    append(parent: string | Element | Real | VirtualNode | null): this { const p = typeof parent === 'string' ? document.querySelector(parent) : parent instanceof Real ? parent.render() : parent instanceof VirtualNode ? parent.render() : parent; if (p) p.appendChild(this.#el); return this; }
    /** Insert children at an index (trailing number = index; default = end). Mixed inputs are normalised via {@link toNodes}. */
    add(...args: (NodeInput | number)[]): this { const last = args[args.length-1]; const items = typeof last === 'number' ? args.slice(0,-1) as NodeInput[] : args as NodeInput[]; const index = typeof last === 'number' ? last : this.#el.childNodes.length; const nodes = Real._toNodes(items); const ref = this.#el.childNodes[index] ?? null; const frag = document.createDocumentFragment(); nodes.forEach(n => frag.appendChild(n)); this.#el.insertBefore(frag, ref); return this; }
    /** Append children to the end (alias of {@link add} with no index). */
    push(...nodes: NodeInput[]): this    { return this.add(...nodes); }
    /** Prepend children to the start (alias of {@link add} at index 0). */
    unshift(...nodes: NodeInput[]): this { return this.add(...nodes, 0); }
    /** Remove specific children by index, selector, Real, or Node. */
    remove(...targets: (string | Node | Real | number)[]): this { for (const t of targets) { let node: Node | null = null; if (typeof t === 'number') node = this.#el.childNodes[t] ?? null; else if (typeof t === 'string') node = this.#el.querySelector(t); else if (t instanceof Real) node = t.render(); else if (t instanceof Node) node = t; if (node && this.#el.contains(node)) this.#el.removeChild(node); } return this; }
    /** Remove `n` children from the front (default 1). */
    shift(n = 1): this { for (let i = 0; i < n && this.#el.firstChild; i++) this.#el.removeChild(this.#el.firstChild); return this; }
    /** Remove `n` children from the end (default 1). */
    pop(n = 1): this   { for (let i = 0; i < n && this.#el.lastChild;  i++) this.#el.removeChild(this.#el.lastChild);  return this; }

    /**
     * Read an attribute or property by name (case-insensitive). Supports a
     * dotted path (e.g. `"dataset.id"`). Returns the value as a string, or
     * `undefined` when absent.
     */
    get(name: string): string | undefined { if (name.indexOf('.') !== -1) { let cur: unknown = this.#el; for (const p of name.split('.')) { if (cur == null) return undefined; cur = (cur as Record<string, unknown>)[p]; } return cur === undefined ? undefined : (typeof cur === 'string' ? cur : String(cur)); } const u = name.toUpperCase(); for (let i = 0; i < this.#el.attributes.length; i++) { const a = this.#el.attributes.item(i)!; if (a.name.toUpperCase() === u) return a.value; } const rec = this.#el as unknown as Record<string, unknown>; for (const k of Object.keys(rec)) if (k.toUpperCase() === u) return String(rec[k]); return undefined; }

    /**
     * Set an attribute or property (smart routing, case-insensitive): an
     * existing attribute → `setAttribute`; else an existing property → assign;
     * else `setAttribute(name.toLowerCase(), …)`. Dotted paths
     * (e.g. `"dataset.id"`) traverse/create nested objects inline.
     */
    set(name: string, value: unknown): this { if (name.indexOf('.') !== -1) { const parts = name.split('.'); let cur = this.#el as unknown as Record<string, unknown>; for (let i = 0; i < parts.length - 1; i++) { const k = parts[i]; const nx = cur[k]; if (nx == null || typeof nx !== 'object') { if (nx === undefined) { const o: Record<string, unknown> = {}; cur[k] = o; cur = o; continue; } return this; } cur = nx as Record<string, unknown>; } cur[parts[parts.length - 1]] = value; return this; } const u = name.toUpperCase(); for (let i = 0; i < this.#el.attributes.length; i++) { const a = this.#el.attributes.item(i)!; if (a.name.toUpperCase() === u) { this.#el.setAttribute(a.name, String(value)); return this; } } const rec = this.#el as unknown as Record<string, unknown>; for (const k of Object.keys(rec)) if (k.toUpperCase() === u) { rec[k] = value; return this; } this.#el.setAttribute(name.toLowerCase(), String(value)); return this; }

    /**
     * Returns a fluent sub-property accessor for a nested object on this element.
     *
     *   new Real('div').sub('style').set('background', 'orange').set('color', 'white');
     *   new Real('div').sub('style').get('background');     // 'orange'
     *   new Real('div').sub('style').sub('transform');      // further nesting
     *
     * The returned object exposes `.set(key, value)`, `.get(key)`, `.sub(key)`,
     * `.unwrap()` (the underlying object) and `.end()` (back to the Real).
     */
    sub(path: string): SubAccessor {
        const root = this.#el as unknown as Record<string, unknown>;
        const owner = this;
        const read = (pth: string): unknown => { let c: unknown = root; for (const k of pth.split('.')) { if (c == null) return undefined; c = (c as Record<string, unknown>)[k]; } return c; };
        const write = (pth: string, v: unknown): void => { const ps = pth.split('.'); let c = root; for (let i = 0; i < ps.length - 1; i++) { const k = ps[i]; const nx = c[k]; if (nx == null || typeof nx !== 'object') { if (nx === undefined) { const o: Record<string, unknown> = {}; c[k] = o; c = o; continue; } return; } c = nx as Record<string, unknown>; } c[ps[ps.length - 1]] = v; };
        const make = (base: string): SubAccessor => ({
            set(key, value) { write(base + '.' + key, value); return make(base); },
            get(key)        { return read(base + '.' + key); },
            sub(key)        { return make(base + '.' + key); },
            unwrap()        { return read(base); },
            end<T = unknown>(): T { return owner as unknown as T; },
        });
        return make(path);
    }

    /** Show the element (`display = ''`). */
    show(): this { (this.#el as HTMLElement).style.display = ''; return this; }
    /** Hide the element (`display = 'none'`). */
    hide(): this { (this.#el as HTMLElement).style.display = 'none'; return this; }
    /** True if ALL given nodes (Node / Real / selector) are descendants of this element. */
    contains(...nodes: (Node | Real | string)[]): boolean { for (const n of nodes) { const el = typeof n === 'string' ? this.#el.querySelector(n) : n instanceof Real ? n.render() : n; if (!el || !this.#el.contains(el)) return false; } return true; }
    /** Walk a path of child indices: `child([0,2,1])` → `childNodes[0].childNodes[2].childNodes[1]`. */
    child(path: number[]): Node { let n: Node = this.#el; for (const i of path) n = n.childNodes[i]!; return n; }
    /** Apply a `box-shadow` from a preset / layer array / Rule / Stylesheet, or clear it (`state==='close'`). */
    shadow(state: ShadowState, mode: ShadowMode | ShadowLayer[] | Rule | Stylesheet = 'drop', opts: ShadowOptions = {}): this { (this.#el as HTMLElement).style.boxShadow = Stylesheet.boxShadow(state, mode, opts); return this; }

    /** Create a writable {@link Signal} (convenience passthrough to `signal`). */
    signal<T>(value: T): Signal<T>         { return signal(value); }
    /** Create an allocation-light single-subscriber {@link SignalMono}. */
    signalMono<T>(value: T): SignalMono<T> { return signalMono(value); }
    /** Register an `effect` whose disposer is tracked and cleaned up by {@link destroy}. */
    effect(fn: () => void): this { this.#effects.push(effect(fn)); return this; }
    /** Derived read-only signal: re-runs `fn` in a tracked effect; disposer tracked by {@link destroy}. */
    computed<T>(fn: () => T): ReadonlySignal<T> { const s = signal<T>(undefined as T); this.#effects.push(effect(() => s.set(fn()))); return s.readonly(); }

    /** Append a reactive text node bound to `getter` (or a static string). Re-runs on signal change. */
    text(getter: Getter<string> | string): this { const g = Real._asGetter(getter); const node = document.createTextNode(g()); this.#el.appendChild(node); this.#effects.push(effect(() => { node.nodeValue = g(); })); return this; }
    /** Bind a {@link SignalMono} to a Text node via the zero-alloc `sinkText` fast path (creating the node if omitted). */
    textMono(s: SignalMono<string>, node?: Text): this { if (!node) { node = document.createTextNode(s.peek()); this.#el.appendChild(node); } sinkText(s, node); return this; }
    /** Reactively bind an attribute; `null` removes it. Re-runs on signal change. */
    attr(name: string, getter: Getter<string | null> | string | null): this { const g = Real._asGetter(getter); const el = this.#el; this.#effects.push(effect(() => { const v = g(); if (v === null) el.removeAttribute(name); else el.setAttribute(name, v); })); return this; }
    /** Reactively toggle a class on/off from a boolean getter. */
    cls(name: string, getter: Getter<boolean> | boolean): this { const g = Real._asGetter(getter); const el = this.#el; this.#effects.push(effect(() => { if (g()) el.classList.add(name); else el.classList.remove(name); })); return this; }
    /** Return a plain toggler `(on: boolean) => void` for a class — no effect, no tracking. */
    clsMono(name: string): (v: boolean) => void { const el = this.#el; return (v: boolean) => { if (v) el.classList.add(name); else el.classList.remove(name); }; }
    /** Reactively assign a JS property on the element from `getter`. */
    prop(name: string, getter: Getter<unknown> | unknown): this { const g = Real._asGetter(getter); const rec = this.#el as unknown as Record<string, unknown>; this.#effects.push(effect(() => { rec[name] = g(); })); return this; }
    /** Reactively set one inline style property (camelCase accepted, normalised to kebab-case). */
    style(prop: string, getter: Getter<string> | string): this { const g = Real._asGetter(getter); const el = this.#el as HTMLElement; const cssProp = prop.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`); this.#effects.push(effect(() => { el.style.setProperty(cssProp, g()); })); return this; }
    /** Two-way bind the element's `value`: reactive read from `getter`, optional write-back on `input`. */
    bind(getter: Getter<string>, setter?: (v: string) => void): this { this.prop('value', getter); if (setter) this.#el.addEventListener('input', e => setter((e.target as HTMLInputElement).value)); return this; }
    /** Dispose all tracked effects and detach the scoped Sheet. Call when discarding the Real. */
    destroy(): this { this.#effects.forEach(s => s()); this.#effects = []; this.Sheet = null; return this; }

    /**
     * Scoped Sheet for this Real instance.
     *
     * Assigning a Sheet attaches it to the host element. Each rule's
     * `:root` selector (and `&`) is rewritten to target THIS element via
     * an auto-generated class (`__real-…`) — or `:host` when a shadow
     * root is present. The resulting `<style>` is appended to
     * `document.head` (light DOM) or to the shadow root, and tracked so
     * subsequent `Sheet.Rules.add/remove/...` mutations re-flush
     * automatically.
     *
     * Assigning `null` removes the installed `<style>` and detaches the
     * Sheet (the Sheet itself is preserved — only this Real disconnects).
     *
     *   const button = new Real('div').set('class','Fancy').append(stage);
     *   button.Sheet = new Stylesheet(new Rule(':root', { background: 'yellow' }));
     *   button.Sheet.Rules.add(new Rule(':root:hover', { transform: 'scale(1.05)' }));
     */
    get Sheet(): Stylesheet | null { return this.#sheet; }
    set Sheet(next: Stylesheet | null)
    {
        // Detach previous
        if (this.#sheet && this.#sheetSync)
            this.#sheet.off('Sheet-Changed', this.#sheetSync);
        if (this.#styleNode && this.#styleNode.parentNode)
            this.#styleNode.parentNode.removeChild(this.#styleNode);
        this.#styleNode = null;
        this.#sheetSync = null;
        this.#sheet     = next;
        if (!next) return;

        if (!this.#instanceId)
            this.#instanceId = 'real-' + Math.random().toString(36).slice(2, 10);

        const el        = this.#el;
        const useShadow = !!(el as Element & { shadowRoot?: ShadowRoot | null }).shadowRoot;
        let   replace   : string;
        if (useShadow) replace = ':host';
        else {
            const cls = '__' + this.#instanceId;
            el.classList.add(cls);
            replace = '.' + cls;
        }

        const apply = () => {
            if (!this.#sheet) return;
            let css = '';
            for (const r of this.#sheet.Rules)
            {
                const scoped = r.Text.replace(/(^|,\s*|\s)(:root|&)(?![\w-])/g, (_m, pre: string) => pre + replace);
                css += scoped + '\n';
            }
            if (!this.#styleNode) {
                this.#styleNode = document.createElement('style');
                this.#styleNode.setAttribute('data-arianna-sheet',    el.tagName.toLowerCase());
                this.#styleNode.setAttribute('data-arianna-instance', this.#instanceId);
                if (useShadow)
                    (el as Element & { shadowRoot: ShadowRoot }).shadowRoot.appendChild(this.#styleNode);
                else
                    (document.head ?? document.documentElement).appendChild(this.#styleNode);
            }
            this.#styleNode.textContent = css;
        };

        apply();
        this.#sheetSync = apply;
        next.on('Sheet-Changed', apply);
    }

    // ── Global registration ───────────────────────────────────────────────
    // Pin the constructor name and expose the class on `window`. The bundler
    // renames the local binding (e.g. `_Real`) to dodge the global, so
    // `constructor.name` / GetPrototypeChain would report the mangled name —
    // Build() forces it back. Runs once at class-eval via the static block
    // below; uses `this` so it survives any bundler rename.
    static #Build(): void
    {
        try { Object.defineProperty(this, 'name', { value: 'Real', configurable: true }); } catch { /* frozen */ }
        if (typeof window !== 'undefined' && !Object.prototype.hasOwnProperty.call(window, 'Real'))
            Object.defineProperty(window, 'Real', { enumerable: true, configurable: false, writable: false, value: this });
    }

    static { this.#Build(); }

}

export default Real;
