import Core, { type TypeDescriptor } from './Core.ts';
import { VirtualNode } from './Virtual.ts';
import { signal, signalMono, sinkText, effect, computed, batch, untrack, AriannATemplate, type Signal, type SignalMono, type ReadonlySignal } from './Observable.ts';
import Rule from './Rule.ts';
import { Stylesheet } from './Stylesheet.ts';

export type { Signal, SignalMono, ReadonlySignal };

// ─── Dotted-path access helpers ──────────────────────────────────────────
// Shared between Real, Virtual and Component.
// Supports paths like "style.background", "dataset.foo", "classList.0", etc.
// Auto-creates intermediate object literals when writing nested paths into
// plain dictionaries. Refuses to overwrite DOM ancestors with literals.

export function readDottedPath(target: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let cur: unknown = target;
    for (const p of parts) {
        if (cur === null || cur === undefined) return undefined;
        cur = (cur as Record<string, unknown>)[p];
    }
    return cur;
}

export function writeDottedPath(target: Record<string, unknown>, path: string, value: unknown): void {
    const parts = path.split('.');
    let cur: Record<string, unknown> = target;
    for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        const next = cur[p];
        if (next === null || next === undefined || typeof next !== 'object') {
            // Auto-create only on plain dictionaries; never overwrite a non-object DOM ancestor with `{}`.
            if (next === undefined) {
                const o: Record<string, unknown> = {};
                cur[p] = o;
                cur = o;
                continue;
            }
            // Non-object existing value (e.g. number, string). Cannot descend.
            return;
        }
        cur = next as Record<string, unknown>;
    }
    cur[parts[parts.length - 1]] = value;
}

/**
 * Fluent accessor for a nested object on a target. Returned by `.sub(path)`.
 */
export interface SubAccessor {
    /** Set a key (or dotted sub-key) on this sub-object. */
    set(key: string, value: unknown): SubAccessor;
    /** Get a key (or dotted sub-key) from this sub-object. */
    get(key: string): unknown;
    /** Descend further into a nested key — returns a sub-accessor for it. */
    sub(key: string): SubAccessor;
    /** The underlying object at this path (or undefined if it's a primitive). */
    unwrap(): unknown;
    /** Return the original owner (Real / VirtualNode / Element) for chaining. */
    end<T = unknown>(): T;
}

export function makeSubAccessor(rootTarget: Record<string, unknown>, basePath: string, owner: unknown): SubAccessor {
    const accessor: SubAccessor = {
        set(key: string, value: unknown): SubAccessor {
            writeDottedPath(rootTarget, basePath + '.' + key, value);
            return accessor;
        },
        get(key: string): unknown {
            return readDottedPath(rootTarget, basePath + '.' + key);
        },
        sub(key: string): SubAccessor {
            return makeSubAccessor(rootTarget, basePath + '.' + key, owner);
        },
        unwrap(): unknown {
            return readDottedPath(rootTarget, basePath);
        },
        end<T = unknown>(): T {
            return owner as T;
        },
    };
    return accessor;
}

export type ShadowState = 'open' | 'close';
export type ShadowMode  = 'drop' | 'inset' | 'glow' | 'layered';
export interface ShadowOptions { color?: string; blur?: number; spread?: number; x?: number; y?: number; }
export interface ShadowLayer extends ShadowOptions { inset?: boolean; }
function _alpha(color: string, a: number): string {
    const rgba = color.match(/rgba?\(([^)]+)\)/); if (rgba) { const p = rgba[1].split(',').map(s => s.trim()); if (p.length >= 3) return `rgba(${p[0]},${p[1]},${p[2]},${a})`; }
    const hex = color.match(/^#([0-9a-fA-F]{3,8})$/); if (hex) { const h = hex[1]; const r = parseInt(h.length >= 6 ? h.slice(0,2) : h[0]+h[0], 16); const g = parseInt(h.length >= 6 ? h.slice(2,4) : h[1]+h[1], 16); const b = parseInt(h.length >= 6 ? h.slice(4,6) : h[2]+h[2], 16); return `rgba(${r},${g},${b},${a})`; }
    return color;
}
function _preset(mode: ShadowMode, o: ShadowOptions): string {
    const color = o.color ?? 'rgba(0,0,0,0.25)', blur = o.blur ?? 8, spread = o.spread ?? 0, x = o.x ?? 0;
    switch (mode) {
        case 'drop':    return `${x}px ${o.y ?? 4}px ${blur}px ${spread}px ${color}`;
        case 'inset':   return `inset ${x}px ${o.y ?? 0}px ${blur}px ${spread}px ${color}`;
        case 'glow':    return `0 0 ${blur}px ${spread+2}px ${color}, 0 0 ${blur*2}px ${spread}px ${_alpha(color, 0.5)}`;
        case 'layered': { const y = o.y ?? 4; return `${x}px ${y}px ${blur}px ${color}, ${x}px ${y*2}px ${blur*2}px ${_alpha(color, 0.15)}`; }
    }
}
function _layerCSS(l: ShadowLayer): string { return `${l.inset ? 'inset ' : ''}${l.x ?? 0}px ${l.y ?? 4}px ${l.blur ?? 8}px ${l.spread ?? 0}px ${l.color ?? 'rgba(0,0,0,0.25)'}`; }
function _shadowCSS(state: ShadowState, mode: ShadowMode | ShadowLayer[] | Rule | Stylesheet = 'drop', opts: ShadowOptions = {}): string {
    if (state === 'close') return 'none';
    if (mode instanceof Rule)  { const v = mode.Properties['boxShadow'] ?? mode.Properties['box-shadow']; return v ?? _preset('drop', opts); }
    if (mode instanceof Stylesheet) { for (const r of mode.Rules) { const v = r.Properties['boxShadow'] ?? r.Properties['box-shadow']; if (v) return v; } return _preset('drop', opts); }
    if (Array.isArray(mode)) return mode.map(_layerCSS).join(', ');
    return _preset(mode, opts);
}
export type RealTarget = string | Element | AriannATemplate | (new (...a: unknown[]) => Element) | VirtualNode | RealDef | Real;
export interface RealDef { Tag?: string; Attributes?: Record<string, string>; Style?: Record<string, string>; }
type Getter<T> = () => T;

// Accept a getter OR a static value. The fluent binding methods (text, attr,
// cls, prop, style) run their argument inside an effect; a non-function value
// (e.g. .text("XYZ")) used to throw "getter is not a function". Wrap statics so
// both forms work: .text(() => name())  AND  .text("Hello").
function asGetter<T>(g: Getter<T> | T): Getter<T> {
    return typeof g === 'function' ? (g as Getter<T>) : () => g;
}
type NodeInput = RealTarget | string | Element | Node | VirtualNode | Real | null;
function toNodes(items: NodeInput[]): Node[] {
    return items.flatMap(item => {
        if (!item) return [];
        if (item instanceof Node) return [item];
        if (item instanceof Real) return [item.render()];
        if (item instanceof VirtualNode) return [item.render()];
        if (item instanceof AriannATemplate) return [item.clone()];
        if (typeof item === 'string') { const t = document.createElement('template'); t.innerHTML = item; return Array.from(t.content.childNodes); }
        if (typeof item === 'object' && 'Tag' in item) { const el = document.createElement((item as RealDef).Tag ?? 'div'); if ((item as RealDef).Attributes) for (const [k,v] of Object.entries((item as RealDef).Attributes!)) el.setAttribute(k,v); return [el]; }
        return [];
    });
}
export class Real {
    #el: Element; #mode: boolean; #descriptor: TypeDescriptor | false; #value: unknown; #effects: Array<() => void> = [];
    #sheet: Stylesheet | null = null; #styleNode: HTMLStyleElement | null = null; #instanceId: string = ''; #sheetSync: (() => void) | null = null;
    static readonly Instances: Real[] = [];
    static get Namespaces() { return Core.Namespaces; }
    constructor(arg0: RealTarget, arg1?: Record<string, unknown> | (new (...a: unknown[]) => Element), arg2?: new (...a: unknown[]) => Element) {
        this.#mode = new.target !== undefined; this.#el = document.createElement('div'); this.#descriptor = false; this.#value = this;
        this.#init(arg0, arg1, arg2);
        // Auto-assign id + class. SVG/MathML elements have `className` as a
        // read-only SVGAnimatedString — we can only mutate the class via
        // setAttribute('class', …), which is also the universally correct
        // form for HTML. So we always use setAttribute here.
        if (this.#mode) { Real.Instances.push(this); if (!this.#el.id) { const autoId = `Real-Instance-${Real.Instances.length}`; this.#el.id = autoId; this.#el.setAttribute('class', autoId); } }
    }
    #init(arg0: RealTarget, arg1?: Record<string, unknown> | (new (...a: unknown[]) => Element), arg2?: new (...a: unknown[]) => Element): void {
        if (arg0 instanceof AriannATemplate) { this.#el = arg0.clone(); this.#mode = true; return; }
        if (!this.#mode) {
            if (typeof arg0 === 'string') { if (arg1 && typeof arg1 === 'function') { Core.Define(arg0, arg1 as new () => Element, (arg2 ?? HTMLElement) as new () => Element); this.#value = arg1; return; } const d = Core.GetDescriptor(arg0); if (d) { this.#descriptor = d; this.#value = d.Constructor ?? d.Interface; return; } const el = document.querySelector(arg0); if (el) { this.#el = el; this.#descriptor = Core.GetDescriptor(el); this.#value = new Real(el); } return; }
            if (typeof arg0 === 'function') { const d = Core.GetDescriptor(arg0 as new () => Element); if (d) { this.#descriptor = d; this.#value = d.Interface ?? arg0; } return; }
            if (arg0 instanceof Element) { this.#el = arg0; this.#descriptor = Core.GetDescriptor(arg0); this.#value = new Real(arg0); this.#mode = true; return; }
            return;
        }
        if (typeof arg0 === 'string') {
            // Single line: namespace.Create() — via functions.create — handles
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
                this.#el = (d && d.Namespace?.functions?.create)
                    ? d.Namespace.functions.create(arg0) as Element
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
    render(): Element { return this.#el; }
    valueOf(): Element { return this.#el; }
    log(v?: unknown): this { console.log(v ?? this.#el); return this; }
    on(type: string, cb: EventListener, opts?: AddEventListenerOptions | boolean): this { this.#el.addEventListener(type, cb, opts); return this; }
    off(type: string, cb: EventListener, opts?: EventListenerOptions | boolean): this { this.#el.removeEventListener(type, cb, opts); return this; }
    fire(event: Event | string, init?: CustomEventInit): this { this.#el.dispatchEvent(typeof event === 'string' ? new CustomEvent(event, init) : event); return this; }
    append(parent: string | Element | Real | VirtualNode | null): this { const p = typeof parent === 'string' ? document.querySelector(parent) : parent instanceof Real ? parent.render() : parent instanceof VirtualNode ? parent.render() : parent; if (p) p.appendChild(this.#el); return this; }
    add(...args: (NodeInput | number)[]): this { const last = args[args.length-1]; const items = typeof last === 'number' ? args.slice(0,-1) as NodeInput[] : args as NodeInput[]; const index = typeof last === 'number' ? last : this.#el.childNodes.length; const nodes = toNodes(items); const ref = this.#el.childNodes[index] ?? null; const frag = document.createDocumentFragment(); nodes.forEach(n => frag.appendChild(n)); this.#el.insertBefore(frag, ref); return this; }
    push(...nodes: NodeInput[]): this    { return this.add(...nodes); }
    unshift(...nodes: NodeInput[]): this { return this.add(...nodes, 0); }
    remove(...targets: (string | Node | Real | number)[]): this { for (const t of targets) { let node: Node | null = null; if (typeof t === 'number') node = this.#el.childNodes[t] ?? null; else if (typeof t === 'string') node = this.#el.querySelector(t); else if (t instanceof Real) node = t.render(); else if (t instanceof Node) node = t; if (node && this.#el.contains(node)) this.#el.removeChild(node); } return this; }
    shift(n = 1): this { for (let i = 0; i < n && this.#el.firstChild; i++) this.#el.removeChild(this.#el.firstChild); return this; }
    pop(n = 1): this   { for (let i = 0; i < n && this.#el.lastChild;  i++) this.#el.removeChild(this.#el.lastChild);  return this; }
    get(name: string): string | undefined { if (name.indexOf('.') !== -1) { const v = readDottedPath(this.#el as unknown as Record<string, unknown>, name); return v === undefined ? undefined : (typeof v === 'string' ? v : String(v)); } const u = name.toUpperCase(); for (let i = 0; i < this.#el.attributes.length; i++) { const a = this.#el.attributes.item(i)!; if (a.name.toUpperCase() === u) return a.value; } const rec = this.#el as unknown as Record<string, unknown>; for (const k of Object.keys(rec)) if (k.toUpperCase() === u) return String(rec[k]); return undefined; }
    set(name: string, value: unknown): this { if (name.indexOf('.') !== -1) { writeDottedPath(this.#el as unknown as Record<string, unknown>, name, value); return this; } const u = name.toUpperCase(); for (let i = 0; i < this.#el.attributes.length; i++) { const a = this.#el.attributes.item(i)!; if (a.name.toUpperCase() === u) { this.#el.setAttribute(a.name, String(value)); return this; } } const rec = this.#el as unknown as Record<string, unknown>; for (const k of Object.keys(rec)) if (k.toUpperCase() === u) { rec[k] = value; return this; } this.#el.setAttribute(name.toLowerCase(), String(value)); return this; }

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
    sub(path: string): SubAccessor { return makeSubAccessor(this.#el as unknown as Record<string, unknown>, path, this); }

    show(): this { (this.#el as HTMLElement).style.display = ''; return this; }
    hide(): this { (this.#el as HTMLElement).style.display = 'none'; return this; }
    contains(...nodes: (Node | Real | string)[]): boolean { for (const n of nodes) { const el = typeof n === 'string' ? this.#el.querySelector(n) : n instanceof Real ? n.render() : n; if (!el || !this.#el.contains(el)) return false; } return true; }
    child(path: number[]): Node { let n: Node = this.#el; for (const i of path) n = n.childNodes[i]!; return n; }
    shadow(state: ShadowState, mode: ShadowMode | ShadowLayer[] | Rule | Stylesheet = 'drop', opts: ShadowOptions = {}): this { (this.#el as HTMLElement).style.boxShadow = _shadowCSS(state, mode, opts); return this; }
    signal<T>(value: T): Signal<T>         { return signal(value); }
    signalMono<T>(value: T): SignalMono<T> { return signalMono(value); }
    effect(fn: () => void): this { this.#effects.push(effect(fn)); return this; }
    computed<T>(fn: () => T): ReadonlySignal<T> { const s = signal<T>(undefined as T); this.#effects.push(effect(() => s.set(fn()))); return s.readonly(); }
    text(getter: Getter<string> | string): this { const g = asGetter(getter); const node = document.createTextNode(g()); this.#el.appendChild(node); this.#effects.push(effect(() => { node.nodeValue = g(); })); return this; }
    textMono(s: SignalMono<string>, node?: Text): this { if (!node) { node = document.createTextNode(s.peek()); this.#el.appendChild(node); } sinkText(s, node); return this; }
    attr(name: string, getter: Getter<string | null> | string | null): this { const g = asGetter(getter); const el = this.#el; this.#effects.push(effect(() => { const v = g(); if (v === null) el.removeAttribute(name); else el.setAttribute(name, v); })); return this; }
    cls(name: string, getter: Getter<boolean> | boolean): this { const g = asGetter(getter); const el = this.#el; this.#effects.push(effect(() => { if (g()) el.classList.add(name); else el.classList.remove(name); })); return this; }
    clsMono(name: string): (v: boolean) => void { const el = this.#el; return (v: boolean) => { if (v) el.classList.add(name); else el.classList.remove(name); }; }
    prop(name: string, getter: Getter<unknown> | unknown): this { const g = asGetter(getter); const rec = this.#el as unknown as Record<string, unknown>; this.#effects.push(effect(() => { rec[name] = g(); })); return this; }
    style(prop: string, getter: Getter<string> | string): this { const g = asGetter(getter); const el = this.#el as HTMLElement; const cssProp = prop.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`); this.#effects.push(effect(() => { el.style.setProperty(cssProp, g()); })); return this; }
    bind(getter: Getter<string>, setter?: (v: string) => void): this { this.prop('value', getter); if (setter) this.#el.addEventListener('input', e => setter((e.target as HTMLInputElement).value)); return this; }
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

    static tpl(html: string): AriannATemplate { return new AriannATemplate(html); }
    static Define(tag: string, ctor: new (...a: unknown[]) => Element, base: new (...a: unknown[]) => Element = HTMLElement, style: Record<string, string> = {}): new (...a: unknown[]) => Element { return Core.Define(tag, ctor, base, style); }
    static GetDescriptor = Core.GetDescriptor;
    static Render(obj: RealDef | VirtualNode | Element | Real | AriannATemplate): Element | null { if (obj instanceof Element) return obj; if (obj instanceof Real) return obj.render(); if (obj instanceof VirtualNode) return obj.render(); if (obj instanceof AriannATemplate) return obj.clone(); if (typeof obj === 'object' && 'Tag' in obj) { const el = document.createElement((obj as RealDef).Tag ?? 'div'); if ((obj as RealDef).Attributes) for (const [k,v] of Object.entries((obj as RealDef).Attributes!)) el.setAttribute(k,v); return el; } return null; }
    static signal     = signal;
    static signalMono = signalMono;
    static sinkText   = sinkText;
    static effect     = effect;
    static computed   = computed;
    static batch      = batch;
    static untrack    = untrack;
    static template   = (html: string) => new AriannATemplate(html);
}
// Pin the constructor name: the bundler renames the local binding to `_Real`
// to avoid colliding with the global `Real` defined just below, which makes
// `constructor.name` (and GetPrototypeChain) report `_Real`. Force it back.
try { Object.defineProperty(Real, 'name', { value: 'Real', configurable: true }); } catch { /* frozen */ }
if (typeof window !== 'undefined') Object.defineProperty(window, 'Real', { enumerable: true, configurable: false, writable: false, value: Real });
export default Real;
