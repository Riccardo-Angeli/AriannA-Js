/**
 * @module    Core
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * The zero-dependency kernel of AriannA. Loaded first; every other module
 * depends on this and Core imports nothing.
 *
 * Responsibilities:
 *   - UUID generation
 *   - Prototype-chain introspection
 *   - Property-descriptor scope templates (Scopes)
 *   - Global namespace registry (html / svg / mathML / x3d / custom)
 *   - Type-descriptor registry + O(1) lookup indexes (GetDescriptor / Define)
 *   - Element creation + upgrade (Create / Upgrade)
 *   - DOM lifecycle watcher: class Observer (auto-registers into Observers);
 *     Core.Observer = running global instance, Core.Observers = registry
 *   - Two-phase boot: Initialize() (buffering) → Bootstrap() (flush + live)
 *   - Static DOM event bus (Events.On / Off / Fire)
 *   - Configuration (version + future runtime config, JSON-exportable)
 *   - Property — enhanced reactive property descriptor (one self-contained
 *     class: private-static helpers, nested Property.* types)
 *
 * Extracted out of Core (see derived file):
 *   - Plugin    → ./Plugin.ts     (Plugin class + static registry)
 *
 * Dependency order:
 *   Core ← Namespace ← Real ← Virtual ← Component
 *         ↑           ↑
 *        Observable  State
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** Shape of a type descriptor stored in the namespace registry. */
export interface TypeDescriptor
{
    Name        : string;
    Tags        : string[];
    Namespace   : NamespaceDescriptor;
    Constructor : (new (...args: unknown[]) => Element) | null;
    Interface   : (new (...args: unknown[]) => Element) | null;
    Prototype   : object | null;
    Supported   : boolean;
    Defined     : boolean;
    Declaration : 'FUNCTION' | 'CLASS' | 'CUSTOM';
    Type        : 'STANDARD' | 'CUSTOM';
    Standard    : boolean;
    Custom      : boolean;
    Style       : Record<string, string>;
    /**
     * Registration path of the tag:
     *   true  → registered via the browser-native `customElements.define`
     *   false → registered via AriannA's `Core.Define` / namespace registry
     */
    Native?     : boolean;
    /** Prototype chain captured at registration (name → constructor). */
    Chain?      : Map<string, unknown>;
    /**
     * User subclass bound after registration — set by Component.Define for the
     * clean form `Component(tag, base, css, def)`, or captured lazily from
     * new.target on the first `new`. Namespace.Update prefers this over the
     * window.<PascalCase> lookup, matching the old Component.js behaviour where
     * the bound class is used directly.
     */
    Class?      : (new (...args: unknown[]) => Element) | null;
    /** Factory built by Namespace.Define — `new`-able to produce an instance. */
    Factory?    : new (...args: unknown[]) => Element;
    /** Called when an element is added via markup. */
    Update?     : (element: Element) => void;
}

/**
 * Full namespace descriptor (html / svg / mathML / x3d / custom).
 *
 * The Create / Update / Define methods are exposed directly on the descriptor
 * by Namespace.toDescriptor() — there is no `functions` indirection. Core calls
 * them straight: ns.Create(tag), ns.Update(el, hint), ns.Define(tag, …).
 */
export interface NamespaceDescriptor
{
    name          : string;
    schema        : string;
    state         : 'enabled' | 'disabled';
    enabled       : boolean;
    disabled      : boolean;
    base          : (new (...args: unknown[]) => Element) | null;
    tags          : Record<string, TypeDescriptor>;
    types         :
    {
        standard : { interfaces: Record<string, TypeDescriptor>; tags: Record<string, TypeDescriptor> };
        custom   : { interfaces: Record<string, TypeDescriptor>; tags: Record<string, TypeDescriptor> };
    };
    documentation : { w3c: string };

    /** Create an element in this namespace (createElement / createElementNS). */
    Create?  : (tag: string) => Element | null;
    /** Synchronously upgrade an element (prototype splice + build). */
    Update?  : (element: Element, hint?: TypeDescriptor) => void;
    /** Register a custom element type in this namespace. */
    Define?  : (
        tag: string,
        constructor: new (...args: unknown[]) => Element,
        base?: new (...args: unknown[]) => Element,
        style?: Record<string, string>,
    ) => new (...args: unknown[]) => Element;
}

// ── UUID ──────────────────────────────────────────────────────────────────────

/**
 * Generates a UUID v4-style identifier.
 * @example Core.Uuid()  // "a3f1bc-7d2-e94-f05-8c2b3a1d"
 */
export function UUID(): string
{
    const b: string[] = [];
    for (let i = 0; i < 9; i++)
        b.push((Math.floor(1 + Math.random() * 0x10000)).toString(16).slice(1));
    return `${b[1]}${b[2]}-${b[3]}-${b[4]}-${b[5]}-${b[6]}${b[7]}${b[8]}`;
}

// ── Configuration ─────────────────────────────────────────────────────────────

/**
 * Runtime configuration of the Core. Holds the SemVer version and is the home
 * for future load-time settings (enabled namespaces, module manifest, …).
 * `toJSON()` makes it serialisable to a .json / .yml config file.
 *
 * @example
 *   Core.Configuration.version.string   // "1.0.0"
 *   JSON.stringify(Core.Configuration)   // '{"version":"1.0.0"}'
 */
/** Fluent accessor for a nested object on a target. Returned by `Real.sub` / `VirtualNode.sub`. */
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

/** Read a value from `target` following a dotted `path` (e.g. "style.background"). */
export function readDottedPath(target: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let cur: unknown = target;
    for (const p of parts) {
        if (cur === null || cur === undefined) return undefined;
        cur = (cur as Record<string, unknown>)[p];
    }
    return cur;
}

/** Write `value` into `target` following a dotted `path`; auto-creates plain-object segments, never clobbers a non-object/DOM ancestor. */
export function writeDottedPath(target: Record<string, unknown>, path: string, value: unknown): void {
    const parts = path.split('.');
    let cur: Record<string, unknown> = target;
    for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        const next = cur[p];
        if (next === null || next === undefined || typeof next !== 'object') {
            if (next === undefined) { const o: Record<string, unknown> = {}; cur[p] = o; cur = o; continue; }
            return;
        }
        cur = next as Record<string, unknown>;
    }
    cur[parts[parts.length - 1]] = value;
}

/** Build a {@link SubAccessor} bound to `rootTarget` at `basePath`; `end()` returns `owner`. */
export function makeSubAccessor(rootTarget: Record<string, unknown>, basePath: string, owner: unknown): SubAccessor {
    const accessor: SubAccessor = {
        set(key, value) { writeDottedPath(rootTarget, basePath + '.' + key, value); return accessor; },
        get(key)        { return readDottedPath(rootTarget, basePath + '.' + key); },
        sub(key)        { return makeSubAccessor(rootTarget, basePath + '.' + key, owner); },
        unwrap()        { return readDottedPath(rootTarget, basePath); },
        end<T = unknown>(): T { return owner as T; },
    };
    return accessor;
}

/** camelCase / PascalCase → kebab-case (e.g. "BackgroundColor" → "-background-color"). */
export function toKebab(s: string): string {
    return s.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
}

/** kebab-case → camelCase, lowercasing the first char (e.g. "Background-color" → "backgroundColor"). */
export function toCamel(s: string): string {
    const lc = s.charAt(0).toLowerCase() + s.slice(1);
    return lc.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

export const Configuration =
{
    version:
    {
        major  : 1,
        minor  : 0,
        patch  : 0,
        get string() { return `${this.major}.${this.minor}.${this.patch}`; },
    },
    toJSON() { return { version: this.version.string }; },
};

// ── Scopes ────────────────────────────────────────────────────────────────────

/**
 * Reusable Object.defineProperty descriptor templates.
 * @example Object.defineProperty(obj, 'k', { ...Core.Scopes.Readonly, value: 42 });
 */
export const Scopes: Readonly<Record<string, { configurable: boolean; enumerable: boolean; writable: boolean }>> = Object.freeze(
{
    Private      : { configurable: false, enumerable: false, writable: false },
    Readonly     : { configurable: false, enumerable: true,  writable: false },
    Writable     : { configurable: false, enumerable: true,  writable: true  },
    Configurable : { configurable: true,  enumerable: true,  writable: false },
});

// ── Prototype chain ───────────────────────────────────────────────────────────

/**
 * Returns the complete prototype chain of an object or constructor as an
 * array of constructor names.
 * @example
 *   Core.GetPrototypeChain(document.createElement('input'))
 *   // → ["HTMLInputElement","HTMLElement","Element","Node","EventTarget","Object"]
 */
export function GetPrototypeChain(obj: object | (new () => object) | null | undefined): string[]
{
    // EAGER: flush any pending DOM mutations synchronously so a node added on
    // this same tick (e.g. createElement + appendChild) is ALREADY upgraded —
    // prototype spliced and, for FUNCTION form, its constructor body run on the
    // node — before we read its chain. The MutationObserver is otherwise async,
    // so without this drain the chain would still read the un-upgraded base.
    try { Observer.drainAll(); } catch { /* pre-Initialize / non-DOM */ }
    const chain: string[] = [];
    // A null/undefined target (e.g. a querySelector that found nothing) has no
    // chain. Return empty instead of letting Object.getPrototypeOf(null) throw
    // "can't convert null to object".
    if (obj === null || obj === undefined) return chain;
    let proto: object | null =
        typeof obj === 'function'
            ? (obj as { prototype: object }).prototype
            : Object.getPrototypeOf(obj);

    while (proto !== null)
    {
        const ctor = (proto as { constructor?: { name?: string } }).constructor;
        if (ctor?.name) chain.push(ctor.name);
        proto = Object.getPrototypeOf(proto);
    }
    return chain;
}

// ── Namespace registry ────────────────────────────────────────────────────────
// Module-private. Each namespace auto-registers itself here from its own
// constructor in Namespace.ts (writing through Core.Namespaces). Read via Core.
const namespaces: Record<string, NamespaceDescriptor> = {};


// ── Type-descriptor registry ──────────────────────────────────────────────────

/**
 * Look up a type descriptor by tag name, constructor, or Node instance.
 * Returns false if not found.
 * @example
 *   Core.GetDescriptor('input')          // HTML standard descriptor
 *   Core.GetDescriptor(HTMLInputElement) // same, via constructor
 *   Core.GetDescriptor(myElement)        // same, via Node instance
 *   Core.GetDescriptor('my-widget')      // custom element descriptor
 */
export function GetDescriptor(
    obj: string | (new (...args: unknown[]) => Element) | Node | object,
): TypeDescriptor | false
{
    if (!obj) return false;

    const t = typeof obj;

    // ── Scan the namespace registry ───────────────────────────────────────
    let key: string;
    if (t === 'string') {
        key = (obj as string).toLowerCase();
    } else if (t === 'function') {
        key = (obj as { name: string }).name.toLowerCase();
    } else if (obj instanceof Node) {
        const el = obj instanceof Element ? obj : null;
        key = String(el?.getAttribute?.('data-arianna-tag') || el?.getAttribute?.('is') || obj.nodeName).toLowerCase();
    } else {
        const o = obj as Record<string, unknown>;
        const tagKey = Object.keys(o).find(k => k.toUpperCase() === 'TAG');
        if (!tagKey) return false;
        key = String(o[tagKey]).toLowerCase();
    }

    for (const nsKey of Object.keys(namespaces))
    {
        const ns  = namespaces[nsKey];
        const std = ns.types.standard;
        const cst = ns.types.custom;

        const found = std.tags[key] ?? std.interfaces[key] ?? cst.tags[key] ?? cst.interfaces[key];
        if (found) return found;

        if (typeof obj === 'function') {
            for (const k of Object.keys(std.interfaces)) {
                const d = std.interfaces[k];
                if (k.toLowerCase() === key || d.Constructor === obj || d.Interface === obj) return d;
            }
            for (const k of Object.keys(cst.interfaces)) {
                const d = cst.interfaces[k];
                if (k.toLowerCase() === key || d.Constructor === obj || d.Interface === obj) return d;
            }
        }
    }
    return false;
}

// ── Convenience query helpers ─────────────────────────────────────────────────

/** Returns descriptor.Type: "STANDARD" | "CUSTOM" | "INVALID". */
export function GetType(obj: Parameters<typeof GetDescriptor>[0]): string
{
    const d = GetDescriptor(obj);
    return d ? (d.Type ?? 'INVALID') : 'INVALID';
}

/** Returns descriptor.Constructor (user class for Custom, native IDL for Standard). */
export function GetConstructor(obj: Parameters<typeof GetDescriptor>[0]): (new (...a: never[]) => Element) | undefined
{
    const d = GetDescriptor(obj);
    return d && d.Constructor ? d.Constructor as new (...a: never[]) => Element : undefined;
}

/** Returns descriptor.Interface (first native IDL super class). */
export function GetInterface(obj: Parameters<typeof GetDescriptor>[0]): (new (...a: never[]) => Element) | undefined
{
    const d = GetDescriptor(obj);
    return d && d.Interface ? d.Interface as new (...a: never[]) => Element : undefined;
}

/** Returns descriptor.Tags — every tag name that resolves to this type. */
export function GetTags(obj: Parameters<typeof GetDescriptor>[0]): string[]
{
    const d = GetDescriptor(obj);
    return d && d.Tags ? d.Tags : [];
}

/**
 * Returns the descriptor's owning Namespace descriptor (or the namespace by key
 * when passed 'html' / 'svg' / 'mathML' / 'x3d' directly).
 */
export function GetNamespace(obj: Parameters<typeof GetDescriptor>[0]): NamespaceDescriptor | undefined
{
    if (typeof obj === 'string' && namespaces[obj]) return namespaces[obj];
    const d = GetDescriptor(obj);
    return d && d.Namespace ? d.Namespace : undefined;
}

/**
 * Register a custom element type descriptor in the appropriate namespace.
 * Works with all namespaces (html / svg / mathML / x3d / custom). Never throws:
 * scans namespaces to find the right one from the base constructor, with a
 * silent html-namespace fallback.
 *
 * @param tag         - Hyphenated custom element tag (e.g. 'my-button')
 * @param constructor - Class or function constructor
 * @param base        - Interface to extend (default HTMLElement). Any registered
 *                      native interface works: HTMLDivElement, SVGSVGElement, …
 * @param style       - Optional default CSS properties object
 */
export function Define(
    tag         : string,
    constructor : new (...args: unknown[]) => Element,
    base        : new (...args: unknown[]) => Element = HTMLElement,
    style       : Record<string, string> = {},
): new (...args: unknown[]) => Element
{
    const ct = tag.toLowerCase();

    // 3-arg form: the STYLE was passed in the base slot because the class already
    // carries its base via `extends` — Core.Define('custom', class extends X {…},
    // { …style }). Here `base` is a style object / Rule / Stylesheet, not a
    // constructor. Re-route it into `style` and reset `base` so the `extends`
    // introspection below recovers the real base. Without this, `base` stays the
    // style object, the namespace lookup fails, and Define emits the noisy
    // "base 'undefined' not found" warning before defaulting to html.
    if (base !== HTMLElement && !(typeof base === 'function' && !!(base as { prototype?: object }).prototype))
    {
        if (!style || (typeof style === 'object' && Object.keys(style as object).length === 0))
        {
            style = base as unknown as Record<string, string>;
        }
        base = HTMLElement;
    }

    // Introspect base from `class X extends Y {}` when base is omitted.
    if (base === HTMLElement)
    {
        try {
            const src = constructor.toString();
            const m = src.match(/extends\s+([A-Z][A-Za-z0-9_]*)/);
            if (m) {
                const ifaceName = m[1];
                const win = (typeof window !== 'undefined' ? window : globalThis) as Record<string, unknown>;
                const candidate = win[ifaceName];
                if (typeof candidate === 'function' && candidate !== HTMLElement) {
                    // Use the `extends` target even when it isn't registered as a
                    // Standard descriptor yet (e.g. the eager native patch /
                    // registration isn't live in this realm). Without this, `base`
                    // stays HTMLElement, the namespace lookup below can't place it,
                    // and Define emits the noisy "base 'undefined'" warning while
                    // defaulting the base wrongly to HTMLElement.
                    base = candidate as new (...args: unknown[]) => Element;
                }
            }
        } catch { /* introspection is best-effort */ }
    }

    // Already registered? Return existing factory (idempotent).
    const existing = GetDescriptor(ct);
    if (existing && existing.Factory) return existing.Factory;

    // Locate the correct namespace.
    let ns: NamespaceDescriptor | null = null;
    const baseDsc = GetDescriptor(base);
    if (baseDsc && baseDsc.Namespace) {
        ns = baseDsc.Namespace;
    } else {
        for (const nsKey of Object.keys(namespaces)) {
            const candidate = namespaces[nsKey];
            if (candidate.base === base) { ns = candidate; break; }
            for (const k of Object.keys(candidate.types.standard.interfaces)) {
                const d = candidate.types.standard.interfaces[k];
                if (d.Constructor === base || d.Interface === base || k === (base as { name?: string }).name) { ns = candidate; break; }
            }
            if (ns) break;
        }
    }
    if (!ns) {
        ns = namespaces['html'] ?? Object.values(namespaces)[0];
        console.warn(`Core.Define: base '${(base as { name?: string } | null | undefined)?.name ?? 'undefined'}' not found in any namespace — defaulting to html.`);
    }

    // Delegate to the namespace's own Define.
    if (ns && typeof ns.Define === 'function') return ns.Define(ct, constructor, base, style);

    // Fallback: minimal descriptor (robustness — shouldn't happen in practice).
    console.warn(`Core.Define: namespace '${ns.name}' has no Define() — using fallback.`);
    const isClass = /^class[\s{]/.test(constructor.toString());
    // Capture the constructor prototype chain (name → constructor) so every
    // TypeDescriptor — defined or fallback — carries a consistent Chain Map.
    const chain = new Map<string, unknown>();
    for (let c: unknown = constructor; typeof c === 'function' && c !== Function.prototype; c = Object.getPrototypeOf(c))
        if ((c as { name?: string }).name) chain.set((c as { name: string }).name, c);
    const descriptor: TypeDescriptor = {
        Name        : constructor.name,
        Tags        : [ct],
        Namespace   : ns,
        Constructor : constructor,
        Interface   : base,
        Prototype   : constructor.prototype,
        Supported   : true,
        Defined     : true,
        Declaration : isClass ? 'CLASS' : 'FUNCTION',
        Type        : 'CUSTOM',
        Standard    : false,
        Custom      : true,
        Style       : style,
        Native      : false,
        Chain       : chain,
    };
    ns.types.custom.interfaces[constructor.name] = descriptor;
    ns.types.custom.tags[ct]                     = descriptor;
    return constructor;
}

/**
 * Create an element by tag, applying the registered descriptor's upgrade
 * SYNCHRONOUSLY before returning — the JS-side equivalent of writing the tag
 * in markup, without waiting for the MutationObserver microtask.
 * @example const el = Core.Create('my-card');  // already upgraded
 */
export function Create(tag: string): Element | null
{
    const ct = tag.toLowerCase();
    const d  = GetDescriptor(ct);

    if (!d || !d.Namespace) {
        try { return document.createElement(ct); } catch { return null; }
    }

    const ns = d.Namespace;

    // Factory-first (legacy model): the registered factory is the SAME new-able
    // function that `new A1a()` uses — it creates the element, splices the factory
    // prototype (chained to the interface) and runs the body. Routing Create through
    // it guarantees Core.Create / Real produce an element identical to the
    // constructor path, instead of a separate createElement+Update path that can
    // diverge. Falls back to Create+Update when no factory is registered.
    if (d.Custom && typeof d.Factory === 'function') {
        try {
            const made = new (d.Factory as new () => Element)();
            if (made instanceof Element) {
                // When a user subclass is bound to this tag (Component.Define /
                // @Component on `class X extends Base`), the registered factory was
                // built for the BASE (e.g. HTMLDivElement) — so it produces a chain
                // headed by the base, not by X. Splice the bound subclass prototype
                // so Create / Real match `new X()` ([X, Base, ...]) instead of
                // ([Base, Base, ...]).
                const bound = (d as { Class?: (new (...a: unknown[]) => Element) | null }).Class;
                // Only splice when it ADDS the bound layer (made is not yet an
                // instance of it). If `made` is ALREADY an instance of `bound` —
                // i.e. the factory produced an equal-or-more-derived chain
                // (`new X()` where X extends the bound class) — splicing would
                // FLATTEN it back to the bound prototype and drop X from the chain.
                // Guard with `!(made instanceof bound)` so the most-derived
                // prototype the factory built is preserved.
                if (typeof bound === 'function' && bound !== d.Constructor && bound.prototype
                    && !(made instanceof (bound as new (...a: unknown[]) => Element))) {
                    try { Object.setPrototypeOf(made, bound.prototype); }
                    catch { /* fragile/native base: keep factory prototype */ }
                }
                return made;
            }
        }
        catch (e) { console.warn('[arianna] Core.Create: factory failed, falling back:', e); }
    }

    let el: Element | null = null;
    if (typeof ns.Create === 'function') el = ns.Create(ct);
    else { try { el = document.createElement(ct); } catch { /* SSR */ } }
    if (!el) return null;

    if (d.Custom && typeof ns.Update === 'function') {
        try {
            // Update may COERCE the node to its native base (e.g. <case-x> → <div
            // is="case-x">) and return the replacement. Use the returned element so
            // callers (Real, the factory, user code) get the upgraded node, not the
            // stale original.
            const upgraded: unknown = (ns.Update as (e: Element, d?: unknown) => unknown)(el, d);
            if (upgraded instanceof Element) el = upgraded;
        }
        catch (e) { console.warn('[arianna] Core.Create: Update failed:', e); }
    }
    return el;
}

/** True when AriannA has already upgraded an Element via Namespace.Update(). */
export function IsUpgraded(node: unknown): boolean
{
    return !!(node && typeof node === 'object'
        && (node as { __ariannaUpgraded?: boolean }).__ariannaUpgraded === true);
}

/**
 * Upgrade a single Element via the namespace registry. Single-node, O(1):
 * descriptor lookup then Namespace.Update(). Does not walk descendants.
 */
export function Upgrade(node: Node | Element | null | undefined): Element | null
{
    if (!(node instanceof Element)) return null;
    if (IsUpgraded(node)) return node;

    const d = GetDescriptor(node);
    if (!d || !d.Custom || !d.Constructor) return node;

    const ns = d.Namespace;
    if (ns && typeof ns.Update === 'function') {
        try { ns.Update(node, d); }
        catch (e) { console.warn('[Core.Upgrade] namespace.Update failed:', e); }
    } else if (d.Update) {
        try { d.Update(node); }
        catch (e) { console.warn('[Core.Upgrade] descriptor.Update failed:', e); }
    }
    return node;
}

// ── DOM Events static bus ─────────────────────────────────────────────────────

/**
 * `Events` and its types under one `namespace Events`. Synchronous, multi-target,
 * multi-type DOM event helpers as static methods on the `Events` class. A preflight
 * map (`Events.Types`, the canonical W3C-Level-3 keyword → interface table ported
 * from the legacy engine) validates keywords in On/Off and lets Fire construct the
 * correct Event subtype. For the AriannA pub/sub bus use Observable.
 */
export namespace Events
{
    /**
     * AriannA lifecycle event names — the SINGLE source of truth. Anything that
     * fires or listens for an upgrade/lifecycle event references these constants
     * instead of hard-coding an `'arianna:…'` string (kills the scattered literals).
     */
    export const Lifecycle = Object.freeze({
        Ready:        'arianna:ready',
        NodeAdding:   'arianna:nodeadding',
        NodeAdded:    'arianna:nodeadded',
        NodeRemoved:  'arianna:noderemoved',
        SlotChange:   'arianna:slotchange',
        Connected:    'arianna:connected',
        Disconnected: 'arianna:disconnected',
    });

    /** A target the bus accepts: an EventTarget, a CSS selector, or a list of targets. */
    export type Target = EventTarget | string | EventTarget[];

    /** A preflight entry: canonical event name + the name of its DOM Event interface. */
    export interface TypeSpec { Name: string; Interface: string; }

    /** @example Core.Events.On('.btn', 'click mouseenter', handler); */
    export class Events
    {
        /**
         * Preflight table of every W3C-Level-3 event keyword → its canonical name and
         * the *name* of its DOM Event interface (kept as a string so a missing/non-
         * constructable interface, e.g. the deprecated MutationEvent, can never break
         * the build or the runtime). Used to validate keywords (On/Off) and to build
         * the right Event subtype (Fire). Ported from the legacy Component.Events.Types.
         */
        static readonly Types: Readonly<Record<string, TypeSpec>> = Object.freeze({
            click:                           { Name: 'click', Interface: 'MouseEvent' },
            dblclick:                        { Name: 'dblclick', Interface: 'MouseEvent' },
            mouseenter:                      { Name: 'mouseenter', Interface: 'MouseEvent' },
            mouseleave:                      { Name: 'mouseleave', Interface: 'MouseEvent' },
            mousemove:                       { Name: 'mousemove', Interface: 'MouseEvent' },
            mouseout:                        { Name: 'mouseout', Interface: 'MouseEvent' },
            mouseover:                       { Name: 'mouseover', Interface: 'MouseEvent' },
            mouseup:                         { Name: 'mouseup', Interface: 'MouseEvent' },
            mousedown:                       { Name: 'mousedown', Interface: 'MouseEvent' },
            mousewheel:                      { Name: 'mousewheel', Interface: 'MouseEvent' },
            contextmenu:                     { Name: 'contextmenu', Interface: 'MouseEvent' },
            drag:                            { Name: 'drag', Interface: 'DragEvent' },
            dragend:                         { Name: 'dragend', Interface: 'DragEvent' },
            dragenter:                       { Name: 'dragenter', Interface: 'DragEvent' },
            dragleave:                       { Name: 'dragleave', Interface: 'DragEvent' },
            dragover:                        { Name: 'dragover', Interface: 'DragEvent' },
            dragstart:                       { Name: 'dragstart', Interface: 'DragEvent' },
            drop:                            { Name: 'drop', Interface: 'DragEvent' },
            dragdrop:                        { Name: 'dragdrop', Interface: 'DragEvent' },
            dragexit:                        { Name: 'dragexit', Interface: 'DragEvent' },
            draggesture:                     { Name: 'draggesture', Interface: 'DragEvent' },
            wheel:                           { Name: 'wheel', Interface: 'WheelEvent' },
            keypress:                        { Name: 'keypress', Interface: 'KeyboardEvent' },
            keydown:                         { Name: 'keydown', Interface: 'KeyboardEvent' },
            keyup:                           { Name: 'keyup', Interface: 'KeyboardEvent' },
            animationstart:                  { Name: 'animationstart', Interface: 'AnimationEvent' },
            animationend:                    { Name: 'animationend', Interface: 'AnimationEvent' },
            animationiteration:              { Name: 'animationiteration', Interface: 'AnimationEvent' },
            abort:                           { Name: 'abort', Interface: 'UIEvent' },
            DOMActivate:                     { Name: 'DOMActivate', Interface: 'UIEvent' },
            error:                           { Name: 'error', Interface: 'UIEvent' },
            load:                            { Name: 'load', Interface: 'UIEvent' },
            resize:                          { Name: 'resize', Interface: 'UIEvent' },
            scroll:                          { Name: 'scroll', Interface: 'UIEvent' },
            select:                          { Name: 'select', Interface: 'UIEvent' },
            unload:                          { Name: 'unload', Interface: 'UIEvent' },
            MozScrolledAreaChanged:          { Name: 'MozScrolledAreaChanged', Interface: 'UIEvent' },
            overflow:                        { Name: 'overflow', Interface: 'UIEvent' },
            underflow:                       { Name: 'underflow', Interface: 'UIEvent' },
            DOMFocusIn:                      { Name: 'DOMFocusIn', Interface: 'FocusEvent' },
            DOMFocusOut:                     { Name: 'DOMFocusOut', Interface: 'FocusEvent' },
            focusin:                         { Name: 'focusin', Interface: 'FocusEvent' },
            focusout:                        { Name: 'focusout', Interface: 'FocusEvent' },
            DOMAttrModified:                 { Name: 'DOMAttrModified', Interface: 'MutationEvent' },
            DOMCharacterDataModified:        { Name: 'DOMCharacterDataModified', Interface: 'MutationEvent' },
            DOMNodeInserted:                 { Name: 'DOMNodeInserted', Interface: 'MutationEvent' },
            DOMNodeInsertedIntoDocument:     { Name: 'DOMNodeInsertedIntoDocument', Interface: 'MutationEvent' },
            DOMNodeRemoved:                  { Name: 'DOMNodeRemoved', Interface: 'MutationEvent' },
            DOMNodeRemovedFromDocument:      { Name: 'DOMNodeRemovedFromDocument', Interface: 'MutationEvent' },
            DOMSubtreeModified:              { Name: 'DOMSubtreeModified', Interface: 'MutationEvent' },
            cut:                             { Name: 'cut', Interface: 'ClipboardEvent' },
            copy:                            { Name: 'copy', Interface: 'ClipboardEvent' },
            paste:                           { Name: 'paste', Interface: 'ClipboardEvent' },
            compositionstart:                { Name: 'compositionstart', Interface: 'CompositionEvent' },
            compositionupdate:               { Name: 'compositionupdate', Interface: 'CompositionEvent' },
            compositionend:                  { Name: 'compositionend', Interface: 'CompositionEvent' },
            afterprint:                      { Name: 'afterprint', Interface: 'Event' },
            beforeprint:                     { Name: 'beforeprint', Interface: 'Event' },
            cached:                          { Name: 'cached', Interface: 'Event' },
            canplay:                         { Name: 'canplay', Interface: 'Event' },
            canplaythrough:                  { Name: 'canplaythrough', Interface: 'Event' },
            change:                          { Name: 'change', Interface: 'Event' },
            chargingchange:                  { Name: 'chargingchange', Interface: 'Event' },
            chargingtimechange:              { Name: 'chargingtimechange', Interface: 'Event' },
            dischargingtimechange:           { Name: 'dischargingtimechange', Interface: 'Event' },
            DOMContentLoaded:                { Name: 'DOMContentLoaded', Interface: 'Event' },
            checking:                        { Name: 'checking', Interface: 'Event' },
            downloading:                     { Name: 'downloading', Interface: 'Event' },
            durationchange:                  { Name: 'durationchange', Interface: 'Event' },
            emptied:                         { Name: 'emptied', Interface: 'Event' },
            ended:                           { Name: 'ended', Interface: 'Event' },
            fullscreenchange:                { Name: 'fullscreenchange', Interface: 'Event' },
            fullscreenerror:                 { Name: 'fullscreenerror', Interface: 'Event' },
            input:                           { Name: 'input', Interface: 'Event' },
            invalid:                         { Name: 'invalid', Interface: 'Event' },
            languagechange:                  { Name: 'languagechange', Interface: 'Event' },
            levelchange:                     { Name: 'levelchange', Interface: 'Event' },
            loadeddata:                      { Name: 'loadeddata', Interface: 'Event' },
            loadedmetadata:                  { Name: 'loadedmetadata', Interface: 'Event' },
            noupdate:                        { Name: 'noupdate', Interface: 'Event' },
            obsolete:                        { Name: 'obsolete', Interface: 'Event' },
            offline:                         { Name: 'offline', Interface: 'Event' },
            online:                          { Name: 'online', Interface: 'Event' },
            open:                            { Name: 'open', Interface: 'Event' },
            orientationchange:               { Name: 'orientationchange', Interface: 'Event' },
            pause:                           { Name: 'pause', Interface: 'Event' },
            pointerlockchange:               { Name: 'pointerlockchange', Interface: 'Event' },
            pointerlockerror:                { Name: 'pointerlockerror', Interface: 'Event' },
            play:                            { Name: 'play', Interface: 'Event' },
            playing:                         { Name: 'playing', Interface: 'Event' },
            ratechange:                      { Name: 'ratechange', Interface: 'Event' },
            readystatechange:                { Name: 'readystatechange', Interface: 'Event' },
            reset:                           { Name: 'reset', Interface: 'Event' },
            seeked:                          { Name: 'seeked', Interface: 'Event' },
            seeking:                         { Name: 'seeking', Interface: 'Event' },
            stalled:                         { Name: 'stalled', Interface: 'Event' },
            submit:                          { Name: 'submit', Interface: 'Event' },
            success:                         { Name: 'success', Interface: 'Event' },
            suspend:                         { Name: 'suspend', Interface: 'Event' },
            timeupdate:                      { Name: 'timeupdate', Interface: 'Event' },
            updateready:                     { Name: 'updateready', Interface: 'Event' },
            visibilitychange:                { Name: 'visibilitychange', Interface: 'Event' },
            volumechange:                    { Name: 'volumechange', Interface: 'Event' },
            waiting:                         { Name: 'waiting', Interface: 'Event' },
            afterscriptexecute:              { Name: 'afterscriptexecute', Interface: 'Event' },
            beforescriptexecute:             { Name: 'beforescriptexecute', Interface: 'Event' },
            MozAudioAvailable:               { Name: 'MozAudioAvailable', Interface: 'Event' },
            hashchange:                      { Name: 'hashchange', Interface: 'Event' },
            gamepadconnected:                { Name: 'gamepadconnected', Interface: 'Event' },
            gamepaddisconnected:             { Name: 'gamepaddisconnected', Interface: 'Event' },
            loadend:                         { Name: 'loadend', Interface: 'Event' },
            loadstart:                       { Name: 'loadstart', Interface: 'Event' },
            progress:                        { Name: 'progress', Interface: 'Event' },
            timeout:                         { Name: 'timeout', Interface: 'Event' },
            uploadprogress:                  { Name: 'uploadprogress', Interface: 'Event' },
            alerting:                        { Name: 'alerting', Interface: 'Event' },
            busy:                            { Name: 'busy', Interface: 'Event' },
            callschanged:                    { Name: 'callschanged', Interface: 'Event' },
            connected:                       { Name: 'connected', Interface: 'Event' },
            connecting:                      { Name: 'connecting', Interface: 'Event' },
            dialing:                         { Name: 'dialing', Interface: 'Event' },
            held:                            { Name: 'held', Interface: 'Event' },
            holding:                         { Name: 'holding', Interface: 'Event' },
            incoming:                        { Name: 'incoming', Interface: 'Event' },
            resuming:                        { Name: 'resuming', Interface: 'Event' },
            statechange:                     { Name: 'statechange', Interface: 'Event' },
            disconnecting:                   { Name: 'disconnecting', Interface: 'Event' },
            disconnected:                    { Name: 'disconnected', Interface: 'Event' },
            delivered:                       { Name: 'delivered', Interface: 'Event' },
            received:                        { Name: 'received', Interface: 'Event' },
            sent:                            { Name: 'sent', Interface: 'Event' },
            compassneedscalibration:         { Name: 'compassneedscalibration', Interface: 'Event' },
            touchcancel:                     { Name: 'touchcancel', Interface: 'Event' },
            touchend:                        { Name: 'touchend', Interface: 'Event' },
            touchenter:                      { Name: 'touchenter', Interface: 'Event' },
            touchleave:                      { Name: 'touchleave', Interface: 'Event' },
            touchmove:                       { Name: 'touchmove', Interface: 'Event' },
            touchstart:                      { Name: 'touchstart', Interface: 'Event' },
            transitionend:                   { Name: 'transitionend', Interface: 'Event' },
            pagehide:                        { Name: 'pagehide', Interface: 'Event' },
            pageshow:                        { Name: 'pageshow', Interface: 'Event' },
            SVGAbort:                        { Name: 'SVGAbort', Interface: 'Event' },
            SVGError:                        { Name: 'SVGError', Interface: 'Event' },
            SVGLoad:                         { Name: 'SVGLoad', Interface: 'Event' },
            SVGResize:                       { Name: 'SVGResize', Interface: 'Event' },
            SVGScroll:                       { Name: 'SVGScroll', Interface: 'Event' },
            SVGUnload:                       { Name: 'SVGUnload', Interface: 'Event' },
            SVGZoom:                         { Name: 'SVGZoom', Interface: 'Event' },
            storage:                         { Name: 'storage', Interface: 'Event' },
            beginEvent:                      { Name: 'beginEvent', Interface: 'Event' },
            endEvent:                        { Name: 'endEvent', Interface: 'Event' },
            repeatEvent:                     { Name: 'repeatEvent', Interface: 'Event' },
            popstate:                        { Name: 'popstate', Interface: 'Event' },
            message:                         { Name: 'message', Interface: 'Event' },
            upgradeneeded:                   { Name: 'upgradeneeded', Interface: 'Event' },
            versionchange:                   { Name: 'versionchange', Interface: 'Event' },
            cardstatechange:                 { Name: 'cardstatechange', Interface: 'Event' },
            connectionInfoUpdate:            { Name: 'connectionInfoUpdate', Interface: 'Event' },
            cfstatechange:                   { Name: 'cfstatechange', Interface: 'Event' },
            datachange:                      { Name: 'datachange', Interface: 'Event' },
            dataerror:                       { Name: 'dataerror', Interface: 'Event' },
            DOMMouseScroll:                  { Name: 'DOMMouseScroll', Interface: 'Event' },
            icccardlockerror:                { Name: 'icccardlockerror', Interface: 'Event' },
            iccinfochange:                   { Name: 'iccinfochange', Interface: 'Event' },
            localized:                       { Name: 'localized', Interface: 'Event' },
            MozBeforeResize:                 { Name: 'MozBeforeResize', Interface: 'Event' },
            mozbrowserclose:                 { Name: 'mozbrowserclose', Interface: 'Event' },
            mozbrowsercontextmenu:           { Name: 'mozbrowsercontextmenu', Interface: 'Event' },
            mozbrowsererror:                 { Name: 'mozbrowsererror', Interface: 'Event' },
            mozbrowsericonchange:            { Name: 'mozbrowsericonchange', Interface: 'Event' },
            mozbrowserlocationchange:        { Name: 'mozbrowserlocationchange', Interface: 'Event' },
            mozbrowserloadend:               { Name: 'mozbrowserloadend', Interface: 'Event' },
            mozbrowserloadstart:             { Name: 'mozbrowserloadstart', Interface: 'Event' },
            mozbrowseropenwindow:            { Name: 'mozbrowseropenwindow', Interface: 'Event' },
            mozbrowsersecuritychange:        { Name: 'mozbrowsersecuritychange', Interface: 'Event' },
            mozbrowsershowmodalprompt:       { Name: 'mozbrowsershowmodalprompt', Interface: 'Event' },
            mozbrowsertitlechange:           { Name: 'mozbrowsertitlechange', Interface: 'Event' },
            MozGamepadButtonDown:            { Name: 'MozGamepadButtonDown', Interface: 'Event' },
            MozGamepadButtonUp:              { Name: 'MozGamepadButtonUp', Interface: 'Event' },
            MozMousePixelScroll:             { Name: 'MozMousePixelScroll', Interface: 'Event' },
            MozOrientation:                  { Name: 'MozOrientation', Interface: 'Event' },
            moztimechange:                   { Name: 'moztimechange', Interface: 'Event' },
            MozTouchDown:                    { Name: 'MozTouchDown', Interface: 'Event' },
            MozTouchMove:                    { Name: 'MozTouchMove', Interface: 'Event' },
            MozTouchUp:                      { Name: 'MozTouchUp', Interface: 'Event' },
            disabled:                        { Name: 'disabled', Interface: 'Event' },
            enabled:                         { Name: 'enabled', Interface: 'Event' },
            statuschange:                    { Name: 'statuschange', Interface: 'Event' },
            smartcardInsert:                 { Name: 'smartcard-insert', Interface: 'Event' },
            smartcardRemove:                 { Name: 'smartcard-remove', Interface: 'Event' },
            stkcommand:                      { Name: 'stkcommand', Interface: 'Event' },
            stksessionend:                   { Name: 'stksessionend', Interface: 'Event' },
            text:                            { Name: 'text', Interface: 'Event' },
            ussdreceived:                    { Name: 'ussdreceived', Interface: 'Event' },
            voicechange:                     { Name: 'voicechange', Interface: 'Event' },
            broadcast:                       { Name: 'broadcast', Interface: 'Event' },
            CheckboxStateChange:             { Name: 'CheckboxStateChange', Interface: 'Event' },
            command:                         { Name: 'command', Interface: 'Event' },
            commandupdate:                   { Name: 'commandupdate', Interface: 'Event' },
            DOMMenuItemActive:               { Name: 'DOMMenuItemActive', Interface: 'Event' },
            DOMMenuItemInactive:             { Name: 'DOMMenuItemInactive', Interface: 'Event' },
            RadioStateChange:                { Name: 'RadioStateChange', Interface: 'Event' },
            ValueChange:                     { Name: 'ValueChange', Interface: 'Event' },
            MozSwipeGesture:                 { Name: 'MozSwipeGesture', Interface: 'Event' },
            MozMagnifyGestureStart:          { Name: 'MozMagnifyGestureStart', Interface: 'Event' },
            MozMagnifyGestureUpdate:         { Name: 'MozMagnifyGestureUpdate', Interface: 'Event' },
            MozMagnifyGesture:               { Name: 'MozMagnifyGesture', Interface: 'Event' },
            MozRotateGestureStart:           { Name: 'MozRotateGestureStart', Interface: 'Event' },
            MozRotateGestureUpdate:          { Name: 'MozRotateGestureUpdate', Interface: 'Event' },
            MozRotateGesture:                { Name: 'MozRotateGesture', Interface: 'Event' },
            MozTapGesture:                   { Name: 'MozTapGesture', Interface: 'Event' },
            MozPressTapGesture:              { Name: 'MozPressTapGesture', Interface: 'Event' },
            MozEdgeUIGesture:                { Name: 'MozEdgeUIGesture', Interface: 'Event' },
            MozAfterPaint:                   { Name: 'MozAfterPaint', Interface: 'Event' },
            DOMPopupBlocked:                 { Name: 'DOMPopupBlocked', Interface: 'Event' },
            DOMWindowCreated:                { Name: 'DOMWindowCreated', Interface: 'Event' },
            DOMWindowClose:                  { Name: 'DOMWindowClose', Interface: 'Event' },
            DOMTitleChanged:                 { Name: 'DOMTitleChanged', Interface: 'Event' },
            DOMLinkAdded:                    { Name: 'DOMLinkAdded', Interface: 'Event' },
            DOMLinkRemoved:                  { Name: 'DOMLinkRemoved', Interface: 'Event' },
            DOMMetaAdded:                    { Name: 'DOMMetaAdded', Interface: 'Event' },
            DOMMetaRemoved:                  { Name: 'DOMMetaRemoved', Interface: 'Event' },
            DOMWillOpenModalDialog:          { Name: 'DOMWillOpenModalDialog', Interface: 'Event' },
            DOMModalDialogClosed:            { Name: 'DOMModalDialogClosed', Interface: 'Event' },
            DOMAutoComplete:                 { Name: 'DOMAutoComplete', Interface: 'Event' },
            DOMFrameContentLoaded:           { Name: 'DOMFrameContentLoaded', Interface: 'Event' },
            AlertActive:                     { Name: 'AlertActive', Interface: 'Event' },
            MozEnteredDomFullscreen:         { Name: 'MozEnteredDomFullscreen', Interface: 'Event' },
            SSWindowClosing:                 { Name: 'SSWindowClosing', Interface: 'Event' },
            SSTabClosing:                    { Name: 'SSTabClosing', Interface: 'Event' },
            SSTabRestoring:                  { Name: 'SSTabRestoring', Interface: 'Event' },
            SSTabRestored:                   { Name: 'SSTabRestored', Interface: 'Event' },
            SSWindowStateReady:              { Name: 'SSWindowStateReady', Interface: 'Event' },
            SSWindowStateBusy:               { Name: 'SSWindowStateBusy', Interface: 'Event' },
            tabviewsearchenabled:            { Name: 'tabviewsearchenabled', Interface: 'Event' },
            tabviewsearchdisabled:           { Name: 'tabviewsearchdisabled', Interface: 'Event' },
            tabviewframeinitialized:         { Name: 'tabviewframeinitialized', Interface: 'Event' },
            tabviewshown:                    { Name: 'tabviewshown', Interface: 'Event' },
            tabviewhidden:                   { Name: 'tabviewhidden', Interface: 'Event' },
            TabOpen:                         { Name: 'TabOpen', Interface: 'Event' },
            TabClose:                        { Name: 'TabClose', Interface: 'Event' },
            TabSelect:                       { Name: 'TabSelect', Interface: 'Event' },
            TabShow:                         { Name: 'TabShow', Interface: 'Event' },
            TabHide:                         { Name: 'TabHide', Interface: 'Event' },
            TabPinned:                       { Name: 'TabPinned', Interface: 'Event' },
            TabUnpinned:                     { Name: 'TabUnpinned', Interface: 'Event' },
            CssRuleViewRefreshed:            { Name: 'CssRuleViewRefreshed', Interface: 'Event' },
            CssRuleViewChanged:              { Name: 'CssRuleViewChanged', Interface: 'Event' },
            MSFullscreenChange:              { Name: 'MSFullscreenChange', Interface: 'Event' },
            MSFullscreenError:               { Name: 'MSFullscreenError', Interface: 'Event' },
            MSGestureChange:                 { Name: 'MSGestureChange', Interface: 'Event' },
            MSGestureEnd:                    { Name: 'MSGestureEnd', Interface: 'Event' },
            MSGestureHold:                   { Name: 'MSGestureHold', Interface: 'Event' },
            MSGestureStart:                  { Name: 'MSGestureStart', Interface: 'Event' },
            MSGestureTap:                    { Name: 'MSGestureTap', Interface: 'Event' },
            MSInertiaStart:                  { Name: 'MSInertiaStart', Interface: 'Event' },
            MSManipulationStateChanged:      { Name: 'MSManipulationStateChanged', Interface: 'Event' },
            mssitemodejumplistitemremoved:   { Name: 'mssitemodejumplistitemremoved', Interface: 'Event' },
            MSContentZoom:                   { Name: 'MSContentZoom', Interface: 'Event' },
            gotpointercapture:               { Name: 'gotpointercapture', Interface: 'Event' },
            lostpointercapture:              { Name: 'lostpointercapture', Interface: 'Event' },
            MSPointerHover:                  { Name: 'MSPointerHover', Interface: 'Event' },
            pointercancel:                   { Name: 'pointercancel', Interface: 'Event' },
            pointerdown:                     { Name: 'pointerdown', Interface: 'Event' },
            pointerenter:                    { Name: 'pointerenter', Interface: 'Event' },
            pointerleave:                    { Name: 'pointerleave', Interface: 'Event' },
            pointermove:                     { Name: 'pointermove', Interface: 'Event' },
            pointerout:                      { Name: 'pointerout', Interface: 'Event' },
            pointerover:                     { Name: 'pointerover', Interface: 'Event' },
            pointerup:                       { Name: 'pointerup', Interface: 'Event' },
            msthumbnailclick:                { Name: 'msthumbnailclick', Interface: 'Event' },
            deactivate:                      { Name: 'deactivate', Interface: 'Event' },
            transitionstart:                 { Name: 'transitionstart', Interface: 'Event' },
            beforecopy:                      { Name: 'beforecopy', Interface: 'Event' },
            beforecut:                       { Name: 'beforecut', Interface: 'Event' },
            beforeeditfocus:                 { Name: 'beforeeditfocus', Interface: 'Event' },
            beforepaste:                     { Name: 'beforepaste', Interface: 'Event' },
            beforeupdate:                    { Name: 'beforeupdate', Interface: 'Event' },
            cellchange:                      { Name: 'cellchange', Interface: 'Event' },
            controlselect:                   { Name: 'controlselect', Interface: 'Event' },
            dataavailable:                   { Name: 'dataavailable', Interface: 'Event' },
            datasetchanged:                  { Name: 'datasetchanged', Interface: 'Event' },
            datasetcomplete:                 { Name: 'datasetcomplete', Interface: 'Event' },
            errorupdate:                     { Name: 'errorupdate', Interface: 'Event' },
            help:                            { Name: 'help', Interface: 'Event' },
            layoutcomplete:                  { Name: 'layoutcomplete', Interface: 'Event' },
            losecapture:                     { Name: 'losecapture', Interface: 'Event' },
            move:                            { Name: 'move', Interface: 'Event' },
            moveend:                         { Name: 'moveend', Interface: 'Event' },
            movestart:                       { Name: 'movestart', Interface: 'Event' },
            propertychange:                  { Name: 'propertychange', Interface: 'Event' },
            resizeend:                       { Name: 'resizeend', Interface: 'Event' },
            resizestart:                     { Name: 'resizestart', Interface: 'Event' },
            rowenter:                        { Name: 'rowenter', Interface: 'Event' },
            rowexit:                         { Name: 'rowexit', Interface: 'Event' },
            rowsdelete:                      { Name: 'rowsdelete', Interface: 'Event' },
            rowsinserted:                    { Name: 'rowsinserted', Interface: 'Event' },
            selectionchange:                 { Name: 'selectionchange', Interface: 'Event' },
            selectstart:                     { Name: 'selectstart', Interface: 'Event' },
            storagecommit:                   { Name: 'storagecommit', Interface: 'Event' },
            webglcontextlost:                { Name: 'webglcontextlost', Interface: 'WebGLContextEvent' },
            webglcontextrestored:            { Name: 'webglcontextrestored', Interface: 'WebGLContextEvent' },
            webglcontextcreationerror:       { Name: 'webglcontextcreationerror', Interface: 'WebGLContextEvent' },
        });

        /** Add `callback` for one or more space/comma/pipe-separated `types` on every resolved target. */
        static On(target: Target, types: string, callback: EventListener, options?: AddEventListenerOptions): void
        {
            Events._resolveTargets(target).forEach(el =>
                Events._splitTypes(types).forEach(t => { Events._preflight(t); el.addEventListener(t, callback, options); }));
        }

        /** Remove `callback` for the given `types` from every resolved target. */
        static Off(target: Target, types: string, callback: EventListener, options?: boolean | EventListenerOptions): void
        {
            Events._resolveTargets(target).forEach(el =>
                Events._splitTypes(types).forEach(t => { Events._preflight(t); el.removeEventListener(t, callback, options); }));
        }

        /** Dispatch `type` on every resolved target, using the correct Event interface when known. */
        static Fire(target: Target, type: string, init?: CustomEventInit): void
        {
            Events._preflight(type);
            const ev = Events._build(type, init);
            Events._resolveTargets(target).forEach(el => el.dispatchEvent(ev));
        }

        // ── private static helpers ────────────────────────────────────────────

        /** Warn on a likely-typo keyword: unknown, and neither namespaced (`ns:evt`) nor hyphenated (`my-evt`). Custom events stay valid. */
        private static _preflight(type: string): void
        {
            if (!Events.Types[type] && !type.includes(':') && !type.includes('-'))
                console.warn(`[arianna] Events: unknown event keyword "${type}" — not a W3C Level-3 type. Custom events are fine; otherwise check for a typo.`);
        }

        /** Construct the right Event subtype for `type` (e.g. MouseEvent), falling back to CustomEvent. */
        private static _build(type: string, init?: CustomEventInit): Event
        {
            const spec = Events.Types[type];
            if (spec && typeof window !== 'undefined') {
                const Ctor = (window as unknown as Record<string, unknown>)[spec.Interface];
                if (typeof Ctor === 'function') {
                    try { return new (Ctor as new (t: string, i?: unknown) => Event)(type, { bubbles: true, composed: true, ...init }); }
                    catch { /* not constructable (e.g. MutationEvent) — fall back to CustomEvent */ }
                }
            }
            return new CustomEvent(type, { bubbles: true, composed: true, ...init });
        }

        private static _resolveTargets(t: Target): EventTarget[]
        {
            if (typeof t === 'string') return Array.from(document.querySelectorAll<Element>(t)) as EventTarget[];
            return Array.isArray(t) ? t : [t];
        }

        private static _splitTypes(s: string): string[]
        {
            return s.split(/\s+|,|\|/g).filter(Boolean);
        }
    }
}


// ── Observer — DOM custom-element lifecycle watcher (lifted from legacy) ───────
//
// A stateful MutationObserver wrapper carried over from the legacy
// Component.Observer: Connect / Disconnect / Connected / Disconnected / State /
// Configuration / Element. Two-phase upgrade driven by Initialize()/Bootstrap():
//   • buffering (default): custom tags whose definition is not yet loaded are
//     deferred to the static Observer.Stack; definable nodes upgrade immediately.
//   • live (after Bootstrap): every added subtree upgrades immediately.
//
// Every `new Observer()` AUTO-REGISTERS into the `Observers` registry — exactly
// like Namespace.ts registers itself on Core. The running global observer is the
// first entry, created by Initialize() and exposed read-only as Core.Observer;
// the registry is Core.Observers. The actual upgrade is routed through Upgrade()
// (→ Namespace.Update), NOT the legacy inline prototype splice.

/**
 * Registry of every live Observer. The running global observer is the first
 * entry (added by Initialize()); further observers add themselves on `new
 * Observer()`. Exposed as Core.Observers.
 */
const observers: Set<Observer> = new Set();

export class Observer
{
    /** Pending custom nodes deferred during buffering; drained by Bootstrap() → flush(). */
    static readonly Stack: Set<Element> = new Set();

    /** Boot phase: false = buffering (defer unknown custom tags), true = live. */
    static live = false;

    readonly #mo   : MutationObserver;
    #connected     = false;
    #element       : Node;
    #configuration : MutationObserverInit;

    constructor(configuration?: Partial<MutationObserverInit>)
    {
        this.#element       = typeof document !== 'undefined' ? document.documentElement : (null as unknown as Node);
        this.#configuration = { childList: true, subtree: true, attributes: true, attributeOldValue: true, ...configuration };
        this.#mo            = new MutationObserver((mutations) => this.#handle(mutations));
        observers.add(this);                                   // auto-register (first entry = the global)
    }

    // ── Legacy lifecycle properties ───────────────────────────────────────────

    /** Start observing. `element` defaults to <html>; `configuration` to the current one. */
    Connect(element?: Node, configuration?: Partial<MutationObserverInit>): this
    {
        if (element instanceof Node) this.#element = element;
        if (configuration && typeof configuration === 'object') Object.assign(this.#configuration, configuration);
        this.#mo.observe(this.#element, this.#configuration);
        this.#connected = true;
        return this;
    }

    /** Stop observing. */
    Disconnect(): this
    {
        this.#mo.disconnect();
        this.#connected = false;
        return this;
    }

    get Connected(): boolean { return this.#connected; }
    set Connected(v: boolean) { if (typeof v === 'boolean' && v !== this.#connected) (v ? this.Connect() : this.Disconnect()); }

    get Disconnected(): boolean { return !this.#connected; }
    set Disconnected(v: boolean) { if (typeof v === 'boolean' && v !== !this.#connected) (v ? this.Disconnect() : this.Connect()); }

    get State(): 'Connected' | 'Disconnected' { return this.#connected ? 'Connected' : 'Disconnected'; }
    set State(s: string)
    {
        const v = String(s).toUpperCase();
        if (v === 'CONNECTED' && !this.#connected)        this.Connect();
        else if (v === 'DISCONNECTED' && this.#connected) this.Disconnect();
    }

    get Configuration(): MutationObserverInit { return this.#configuration; }
    set Configuration(c: MutationObserverInit)
    {
        if (c && typeof c === 'object') {
            this.#configuration = { ...c };
            if (this.#connected) { this.#mo.disconnect(); this.#mo.observe(this.#element, this.#configuration); }
        }
    }

    get Element(): Node { return this.#element; }
    set Element(el: Node)
    {
        if (el instanceof Node) {
            this.#element = el;
            if (this.#connected) { this.#mo.disconnect(); this.#mo.observe(this.#element, this.#configuration); }
        }
    }

    /** Convenience accessor for the shared deferred stack (same Set as Observer.Stack). */
    get Stack(): Set<Element> { return Observer.Stack; }

    // ── Upgrade pipeline ──────────────────────────────────────────────────────

    /** Sweep an existing subtree with the current phase rule (used at Initialize). */
    sweep(root: Node = this.#element): void { Observer.#visit(root); }

    /** EAGER pump: synchronously process THIS observer's queued mutation records
     *  (upgrade + lifecycle dispatch + FUNCTION-form constructor body) instead of
     *  waiting for the asynchronous MutationObserver microtask. */
    drain(): void { this.#handle(this.#mo.takeRecords()); }

    #handle(mutations: MutationRecord[]): void
    {
        for (const m of mutations) {
            // Attribute change → {prefix}-change event on the element.
            if (m.type === 'attributes' && m.target instanceof Element) {
                const attr = m.target.attributes.getNamedItem(m.attributeName ?? '');
                if (attr) {
                    const evName = /^(\w+)/.exec(attr.name)?.[1]?.toLowerCase() ?? attr.name;
                    m.target.dispatchEvent(new CustomEvent(`${evName}-change`, { detail: { element: m.target, attribute: attr } }));
                }
            }
            // Child list change → lifecycle events + upgrade.
            if (m.type === 'childList') {
                for (const node of Array.from(m.addedNodes)) {
                    if (!(node instanceof Element)) continue;
                    const descriptor = GetDescriptor(node);
                    node.dispatchEvent(new CustomEvent(Events.Lifecycle.NodeAdding, { detail: { node, descriptor } }));
                    Observer.#visit(node);                    // upgrade-or-defer (the MO already stacks pending nodes)
                    document.dispatchEvent(new CustomEvent(Events.Lifecycle.NodeAdded, { detail: { node, descriptor } }));
                }
                for (const node of Array.from(m.removedNodes)) {
                    if (!(node instanceof Element)) continue;
                    document.dispatchEvent(new CustomEvent(Events.Lifecycle.NodeRemoved, { detail: { node, descriptor: GetDescriptor(node) } }));
                }
            }
        }
    }

    /** Buffering visit: upgrade definable nodes now; defer unknown custom tags. */
    static #visit(node: Node): void
    {
        if (node instanceof Element) {
            if (!IsUpgraded(node)) {
                Upgrade(node);                                          // no-op unless descriptor known + Custom
                if (!IsUpgraded(node) && node.localName.includes('-'))
                    Observer.Stack.add(node);                           // custom tag, definition not loaded yet → defer
            }
            for (let c = node.firstElementChild; c; c = c.nextElementSibling) Observer.#visit(c);
            return;
        }
        for (let c = node.firstChild; c; c = c.nextSibling) Observer.#visit(c);
    }

    /** Flush the deferred stack (definitions now loaded) and flip to live. */
    static flush(): void
    {
        for (const el of Observer.Stack) { if (el.isConnected) Upgrade(el); }
        Observer.Stack.clear();
        Observer.live = true;
    }

    /** EAGER: drain every registered observer's pending records synchronously,
     *  so introspection (GetPrototypeChain) and same-tick reads reflect the
     *  upgraded DOM without waiting for the async MutationObserver. */
    static drainAll(): void { for (const o of observers) o.drain(); }

    /** Self-register on window so `new Observer()` is reachable globally (like Real / State). */
    static
    {
        if (typeof window !== 'undefined' && !Object.prototype.hasOwnProperty.call(window, 'Observer'))
            Object.defineProperty(window, 'Observer', { enumerable: true, configurable: false, writable: false, value: Observer });
    }
}

// ── Boot: Initialize() + Bootstrap() ──────────────────────────────────────────

/**
 * Argument to {@link Bootstrap}. Declares which definition-bearing bundles to
 * dynamically import before flipping the buffered Observer live — so the whole
 * page boot is a single `<head>` line. Forms:
 *
 *   • a keyword            'components'                       → <base>arianna-components.js
 *   • an explicit URL      '/cdn/arianna.js'                  → used as-is
 *   • an array of either   ['additionals', 'components']
 *   • a config object      { additionals: true, components: true }
 *
 * Keyword → URL: 'core' → '<base>arianna.js', otherwise '<base>arianna-<kw>.js'.
 * A token with '/', a leading '.', 'http(s):' or a '.js' suffix is treated as a URL.
 */
export type BootSpec =
    | string
    | readonly string[]
    | {
        /** Base URL for keyword resolution. Default '/release/dist/'. */
        base?: string;
        /** Load core: `true` → keyword, `string` → explicit URL. */
        core?: boolean | string;
        /** Load additionals: `true` → keyword, `string` → explicit URL. */
        additionals?: boolean | string;
        /** Load components: `true` → keyword, `string` → explicit URL. */
        components?: boolean | string;
        /** Extra explicit bundle keywords / URLs. */
        bundles?: readonly string[];
        /** Mirror the loaded modules' exports onto window. Default `true`. */
        mirror?: boolean;
    };

/**
 * Boot owner. The two phase flags are #-private static — runtime-hard-private,
 * so no stray module code can read or flip them; the ONLY mutators are
 * Initialize() / Bootstrap(). The outside world reads them through the sealed,
 * read-only Core.Initialized / Core.Booted getters.
 */
class Boot
{
    static #initialized = false;
    static #booted      = false;

    /** Resolvers for callers awaiting Ready() before Bootstrap() has flipped #booted. */
    static #readyResolvers: Array<() => void> = [];

    static get initialized(): boolean { return Boot.#initialized; }
    static get booted():      boolean { return Boot.#booted; }

    /**
     * Resolves when the page is fully booted (Bootstrap() has run). Resolves
     * synchronously if already booted; otherwise on the next Bootstrap() completion.
     * Lets a consumer do `await Core.Ready()` instead of hand-rolling an
     * `arianna:ready` listener + already-booted guard in every page.
     */
    static Ready(): Promise<void>
    {
        if (Boot.#booted) return Promise.resolve();
        return new Promise<void>(resolve => { Boot.#readyResolvers.push(resolve); });
    }

    /**
     * Phase 1 — synchronous, runs as soon as Core is imported (head, blocking).
     *
     *   • exposes window.Core early (so a head bootstrap can use it during load);
     *   • creates the global Observer in BUFFERING mode (auto-registered in Observers),
     *     so future custom tags without a loaded definition defer to Observer.Stack;
     *   • sweeps the DOM already present at import time with the same rule — so load
     *     order is irrelevant for markup parsed before Core ran.
     *
     * Idempotent. Loading the component ESM modules is the caller's job; when those
     * resolve, call Bootstrap().
     */
    static Initialize(root: Document | Element = document): void
    {
        if (typeof document === 'undefined' || Boot.#initialized) return;
        Boot.#initialized = true;

        if (typeof window !== 'undefined' && !Object.prototype.hasOwnProperty.call(window, 'Core')) {
            Object.defineProperty(window, 'Core', { enumerable: true, configurable: false, writable: false, value: Core });
        }

        // The global observer registers itself as the first entry of `observers`.
        new Observer().Connect(document.documentElement).sweep(root as Node);
    }

    /**
     * Phase 2 — call once the modules that DEFINE the buffered tags have loaded.
     *
     *   • Observer.flush(): upgrades every deferred element + flips the observer LIVE;
     *   • fires `arianna:ready` on the document (once).
     *
     * Idempotent. Trigger it from the loader when the definition-bearing modules
     * (Namespace + the components a page uses) have resolved — NOT merely after Core.
     */
    static async Bootstrap(spec?: BootSpec): Promise<void>
    {
        if (typeof document === 'undefined') return;

        // (1) Optionally load the definition-bearing bundles first, so a single
        //     head line is the whole boot. Failures are isolated (one bad bundle
        //     must not abort the flush). No spec → no await → flush stays synchronous,
        //     keeping legacy fire-and-forget `Bootstrap()` callers unchanged.
        if (spec !== undefined) {
            const { urls, mirror } = Boot.#resolveSpec(spec);
            const mods = await Promise.all(urls.map(u =>
                import(/* @vite-ignore */ u)
                    .catch((e: unknown) => { console.warn('[arianna] Bootstrap: import failed for', u, e); return null; })
            ));
            if (mirror) for (const m of mods) if (m) Boot.#mirror(m as Record<string, unknown>);
        }

        // (2) Upgrade every deferred element + flip the buffered Observer LIVE.
        Observer.flush();

        // (3) Fire arianna:ready once, and release any Ready() awaiters.
        if (!Boot.#booted) {
            Boot.#booted = true;
            const resolvers = Boot.#readyResolvers;
            Boot.#readyResolvers = [];
            for (const resolve of resolvers) resolve();
            document.dispatchEvent(new CustomEvent(Events.Lifecycle.Ready, { detail: { version: Configuration.version.string } }));
        }
    }

    /** Resolve a {@link BootSpec} into concrete bundle URLs + the mirror flag. */
    static #resolveSpec(spec: BootSpec): { urls: string[]; mirror: boolean }
    {
        // Default base honours a ?bundle= override (the dev-server convention),
        // falling back to '/release/dist/'. So the single head line never reads it.
        const DEFAULT_BASE =
            (typeof location !== 'undefined' && new URLSearchParams(location.search).get('bundle')) || '/release/dist/';
        const toURL = (token: string, base: string): string =>
            /^https?:|^\.|\/|\.js$/.test(token)
                ? token
                : base + (token === 'core' ? 'arianna.js' : `arianna-${token}.js`);

        if (typeof spec === 'string')   return { urls: [toURL(spec, DEFAULT_BASE)], mirror: true };
        if (Array.isArray(spec))        return { urls: (spec as readonly string[]).map(s => toURL(s, DEFAULT_BASE)), mirror: true };

        const o      = spec as Exclude<BootSpec, string | readonly string[]>;
        const base   = o.base ?? DEFAULT_BASE;
        const tokens = [...(o.bundles ?? [])];
        for (const kw of ['core', 'additionals', 'components'] as const) {
            const v = o[kw];
            if (v === true)                 tokens.push(kw);
            else if (typeof v === 'string') tokens.push(v);
        }
        return { urls: tokens.map(t => toURL(t, base)), mirror: o.mirror ?? true };
    }

    /** Mirror a module's exports onto window, prefixing built-ins so globals survive. */
    static #mirror(mod: Record<string, unknown>): void
    {
        if (typeof window === 'undefined') return;
        const win = window as unknown as Record<string, unknown>;
        for (const key of Object.keys(mod)) {
            const name = Boot.#BUILTIN_GLOBALS.has(key) ? 'Arianna' + key : key;
            try { Object.defineProperty(win, name, { value: mod[key], writable: false, configurable: true, enumerable: true }); }
            catch { /* read-only / sealed global — skip */ }
        }
    }

    /** Global identifiers a bundle export must not clobber (gets an 'Arianna' prefix). */
    static readonly #BUILTIN_GLOBALS = new Set<string>([
        'Math', 'Date', 'Number', 'String', 'Boolean', 'Symbol', 'BigInt', 'Object', 'Array', 'Map',
        'Set', 'WeakMap', 'WeakSet', 'Promise', 'JSON', 'RegExp', 'Error', 'TypeError', 'RangeError',
        'SyntaxError', 'Proxy', 'Reflect', 'Function', 'Infinity', 'NaN', 'undefined', 'globalThis',
        'console', 'window', 'document', 'navigator', 'location', 'history', 'localStorage',
        'sessionStorage', 'fetch', 'XMLHttpRequest', 'WebSocket', 'Worker', 'Audio',
    ]);
}

/** Phase 1 boot — thin wrapper over Boot.Initialize (the export name is the public API). */
export function Initialize(root: Document | Element = document): void { Boot.Initialize(root); }

/**
 * Phase 2 boot — thin wrapper over Boot.Bootstrap. With no argument it just flushes
 * the buffered Observer (legacy, synchronous). With a {@link BootSpec} it ALSO loads
 * the definition-bearing bundles first, so the whole page boot is one head line:
 *
 *   <script type="module">
 *     import { Bootstrap } from '/release/dist/arianna.js';
 *     Bootstrap({ additionals: true, components: true });
 *   </script>
 */
export function Bootstrap(spec?: BootSpec): Promise<void> { return Boot.Bootstrap(spec); }

/**
 * AriannA(spec?) — the one-call boot. Equivalent to Bootstrap() but with the
 * full default spec, so a page only needs:  `import { AriannA } from '…/arianna.js'; AriannA()`.
 * Pass a spec to override (e.g. AriannA({ core: true }) for core-only).
 */
export function AriannA(spec?: BootSpec): Promise<void>
{
    return Boot.Bootstrap(spec ?? { core: true, additionals: true, components: true });
}

/** Resolves once the page is booted (immediately if already booted). See Boot.Ready. */
export function Ready(): Promise<void> { return Boot.Ready(); }

// ── Helpers — generic object / value utilities ────────────────────────────────

/**
 * Checks whether `value` satisfies all the given type tags.
 * @example Core.Is(class A {}, 'class')  // true
 */
export function Is(
    value: unknown,
    ...types: ('string' | 'number' | 'boolean' | 'symbol' | 'function' | 'object' | 'class' | (new (...args: never[]) => unknown))[]
): boolean
{
// Legacy short-circuit: falsy subject or zero types → true (skip checks).
    if (!value || types.length === 0) return true;

    const native = new Set(['string', 'number', 'boolean', 'symbol', 'function', 'object']);
    for (const t of types) {
        if (typeof t === 'string') {
            if (t === 'class') {
                // New robustness: must be a function, via Function.prototype.toString + \b.
                if (typeof value !== 'function' || !/^class\b/.test(Function.prototype.toString.call(value))) return false;
            } else if (native.has(t)) {
                if (typeof value !== t) return false;
            }
        } else if (typeof t === 'function') {
            if (!(value instanceof t)) return false;
        }
    }
    return true;
}

/**
 * Deep equality across primitives, plain objects, arrays, regex, dates, and
 * class instances. Pass 2+ args or a single array.
 * @example Core.Equals({a:1}, {a:1})  // true
 */
export function Equals(...args: unknown[]): boolean
{
    let elements = args;
    if (args.length === 1 && Array.isArray(args[0])) elements = args[0] as unknown[];
    if (elements.length < 2) return true;

    for (let i = elements.length - 1; i > 0; i--) {
        const x = elements[i];
        const y = elements[i - 1];
        if (Object.is(x, y)) continue;
        if ((x === null || x === undefined) && (y === null || y === undefined)) continue;
        if (x === null || y === null || x === undefined || y === undefined) return false;

        const tx = typeof x, ty = typeof y;
        if (tx !== ty) return false;

        if (tx === 'object') {
            if (x instanceof Date && y instanceof Date) { if (x.getTime() !== y.getTime()) return false; continue; }
            if (x instanceof RegExp && y instanceof RegExp) { if (x.toString() !== y.toString()) return false; continue; }
            if (Array.isArray(x) || Array.isArray(y)) {
                if (!Array.isArray(x) || !Array.isArray(y)) return false;
                if (x.length !== y.length) return false;
                for (let k = 0; k < x.length; k++) if (!Equals(x[k], y[k])) return false;
                continue;
            }
            const xo = x as Record<string, unknown>;
            const yo = y as Record<string, unknown>;
            const xk = Object.keys(xo);
            const yk = Object.keys(yo);
            if (xk.length !== yk.length) return false;
            for (const k of xk) {
                if (!Object.prototype.hasOwnProperty.call(yo, k)) return false;
                if (!Equals(xo[k], yo[k])) return false;
            }
            continue;
        }
        if (tx === 'function') {
            if ((x as () => unknown).toString() !== (y as () => unknown).toString()) return false;
            continue;
        }
        return false;
    }
    return true;
}

/** True when an object has no own enumerable properties. Non-objects → true. */
export function Empty(value: unknown): boolean
{
    if (value === null || value === undefined || typeof value !== 'object') return true;
    for (const _ in value as object) return false;
    return true;
}

/**
 * Checks if `target` has all the specified members. For HTMLElement, members
 * are checked against attributes; otherwise against own properties.
 */
export function Has(target: object | null | undefined, ...members: string[]): boolean
{
    if (!target || typeof target !== 'object') return false;
    if (members.length === 0) return true;
    const isElement = typeof HTMLElement !== 'undefined' && target instanceof HTMLElement;
    for (const m of members) {
        if (isElement) { if ((target as HTMLElement).getAttribute(m) === null) return false; }
        else           { if (!(m in (target as Record<string, unknown>))) return false; }
    }
    return true;
}

/** Deep-clone a value (primitives, Date, RegExp, Array, plain Object, Node, function). */
export function Clone<T>(value: T): T
{
    if (value === null || value === undefined) return value;
    const t = typeof value;
    if (t === 'string' || t === 'number' || t === 'boolean' || t === 'symbol' || t === 'bigint') return value;

    if (t === 'function') {
        const fn = value as unknown as () => unknown;
        const out = new Function('return ' + fn.toString())() as () => unknown;
        const fnRec = fn as unknown as Record<string, unknown>;
        const outRec = out as unknown as Record<string, unknown>;
        for (const k of Object.keys(fnRec)) outRec[k] = fnRec[k];
        return out as unknown as T;
    }
    if (typeof Node !== 'undefined' && value instanceof Node) return value.cloneNode(true) as unknown as T;
    if (value instanceof Date)   return new Date(value.getTime()) as unknown as T;
    if (value instanceof RegExp) return new RegExp(value.source, value.flags) as unknown as T;
    if (Array.isArray(value))    return value.map(v => Clone(v)) as unknown as T;
    if (t === 'object') {
        const obj = value as Record<string, unknown>;
        const out: Record<string, unknown> = {};
        for (const k of Object.keys(obj)) out[k] = Clone(obj[k]);
        return out as unknown as T;
    }
    return value;
}

/**
 * Mixes own enumerable properties from sources into target. Special-cases ES
 * classes (copies prototype methods onto target.prototype). Returns target.
 */
export function Assign<T extends object>(target: T, ...sources: unknown[]): T
{
    if (target === null || target === undefined) throw new TypeError('Cannot convert first argument to object');
    const to = Object(target) as Record<string, unknown>;
    for (const source of sources) {
        if (source === null || source === undefined) continue;
        if (typeof source === 'function' && Is(source, 'class')) {
            const ctor = source as new () => object;
            const targetCtor = target as unknown as { prototype?: Record<string, unknown> };
            if (!targetCtor.prototype) continue;
            for (const k of Object.getOwnPropertyNames(ctor.prototype)) {
                if (k !== 'constructor') targetCtor.prototype[k] = (ctor.prototype as Record<string, unknown>)[k];
            }
            try {
                const instance = new ctor() as Record<string, unknown>;
                const proto = Object.getPrototypeOf(targetCtor.prototype) as Record<string, unknown> | null;
                if (proto) for (const k of Object.getOwnPropertyNames(instance)) if (k !== 'constructor') proto[k] = instance[k];
            } catch { /* class with required ctor args — skip */ }
            continue;
        }
        const src = Object(source) as Record<string, unknown>;
        for (const k of Object.keys(src)) {
            const desc = Object.getOwnPropertyDescriptor(src, k);
            if (desc?.enumerable) to[k] = src[k];
        }
    }
    return target;
}

/**
 * Replaces an Element's outerHTML (single-root). Returns the new node, or
 * undefined if input was invalid.
 */
export function Replace(target: Node | null | undefined, replacement: string | Node | null | undefined): Node | undefined
{
    if (!target || !(target instanceof Node) || !target.parentNode) return undefined;
    if (replacement === null || replacement === undefined) return undefined;
    let next: Node | null = null;
    if (typeof replacement === 'string') {
        const tpl = document.createElement('template');
        tpl.innerHTML = replacement;
        next = tpl.content.firstElementChild ?? tpl.content.firstChild;
    } else if (replacement instanceof Node) {
        next = replacement;
    }
    if (!next) return undefined;
    if (next.parentNode) next.parentNode.removeChild(next);
    target.parentNode.replaceChild(next, target);
    return next;
}

/**
 * Mixin-style runtime class extension. Variadic: Extends(A, B, C) makes A
 * extend B, B extend C (left-to-right). SSR-safe.
 * @example Core.Extends(A, B);  // A inherits B's prototype
 */
export function Extends(...classes: unknown[]): unknown
{
    if (classes.length < 2) return classes[0];
    for (let i = 0; i < classes.length - 1; i++) {
        const Sub = classes[i];
        const Super = classes[i + 1];
        if (typeof Sub !== 'function' || typeof Super !== 'function') continue;
        const SubF = Sub as unknown as { prototype: object };
        const SuperF = Super as unknown as { prototype: object };
        if (!SubF.prototype || !SuperF.prototype) continue;
        try {
            Object.setPrototypeOf(SubF.prototype, SuperF.prototype);
            Object.setPrototypeOf(SubF, SuperF);
        } catch { /* native built-ins may resist — skip */ }
    }
    return classes[0];
}

// ── Property — enhanced reactive property descriptor ──────────────────────────

/**
 * `Property` and its types live under one `namespace Property`: the option /
 * detail interfaces and the `Property` class itself are grouped together. The
 * class's validation / DOM-resolution helpers are `private static` members.
 */
export namespace Property
{
    /** Type marker for runtime validation: a built-in tag or a predicate. */
    export type Type =
        | 'string' | 'number' | 'boolean' | 'integer'
        | 'function' | 'object' | 'array' | 'any'
        | ((v: unknown) => boolean);

    /**
     * Sync target for `bind` (two-way) or `bound` (one-way mirror).
     * - attribute(s)        — DOM attribute(s) on the host element (or host.element)
     * - property/properties — sibling JS properties on the host object
     */
    export interface BindSpec
    {
        attribute?  : string;
        attributes? : string[];
        property?   : string;
        properties? : string[];
    }

    /**
     * Event emission settings. Defaults: private internal EventTarget,
     * cancelable changing, no propagation.
     */
    export interface ObservableSpec
    {
        target?         : EventTarget | null;
        propagation?    : boolean;
        cancelable?     : boolean;
        changingEvent?  : string;
        changedEvent?   : string;
    }

    /** Constructor options for `Property`. */
    export interface Options
    {
        initial?      : unknown;
        enumerable?   : boolean;
        configurable? : boolean;
        type?         : Type;
        validate?     : (v: unknown) => boolean;
        transform?    : (v: unknown) => unknown;
        bind?         : BindSpec;
        bound?        : BindSpec;
        observable?   : ObservableSpec;
        silent?       : boolean;
    }

    export interface ChangingDetail
    {
        name     : string;
        oldValue : unknown;
        newValue : unknown;
        /** Set this in a listener to override the value being committed. */
        override?: unknown;
    }

    export interface ChangedDetail
    {
        name     : string;
        oldValue : unknown;
        newValue : unknown;
        bind     : BindSpec | undefined;
        bound    : BindSpec | undefined;
    }

    /**
     * `Property` — enhanced JavaScript property descriptor. Wraps
     * Object.defineProperty and adds runtime `type` validation, value
     * `transform`, `bind` / `bound` two-way / one-way sync to attributes and
     * sibling properties, a cancelable `${name}Changing` event (preventDefault
     * aborts the set; listeners may override via `event.detail.override`), and a
     * post-set `${name}Changed` event.
     *
     * Install on a host with `descriptor.install(host)`. Reading host[name]
     * returns the current value; writing host[name] = x routes through every
     * layer. The instance is the registry for runtime state, so multiple
     * installs mirror the same value across hosts.
     *
     * @example
     *   const vol = new Core.Property('volume', {
     *       initial: 50, type: 'number',
     *       validate: v => v >= 0 && v <= 100,
     *       bind: { attribute: 'data-volume' },
     *   });
     *   vol.install(strip).onChanged(d => console.log('vol →', d.newValue));
     *   strip.volume = 80;     // event fired, attribute updated
     *   strip.volume = 999;    // rejected by validator, no event
     */
    export class Property<T = unknown>
    {
        public  readonly name : string;
        public  readonly opts : Readonly<Options>;
        private _value        : T;
        private _hosts        : Set<object> = new Set();
        private _eventTarget  : EventTarget;
        private _changingEvt  : string;
        private _changedEvt   : string;
        private _silent       : boolean;

        constructor(name: string, options: Options = {})
        {
            this.name         = name;
            this.opts         = Object.freeze({ ...options });
            this._value       = options.initial as T;
            this._silent      = options.silent ?? false;
            const obs         = options.observable ?? {};
            this._eventTarget = obs.target ?? new EventTarget();
            this._changingEvt = obs.changingEvent ?? `${name}Changing`;
            this._changedEvt  = obs.changedEvent  ?? `${name}Changed`;
        }

        /** Direct read of the current value. */
        get(): T { return this._value; }

        /**
         * Direct write through transform → type check → validate → changing event
         * → commit → sync → changed event. Returns true if applied, false if
         * rejected (by type / validator / listener preventDefault).
         */
        set(value: T): boolean
        {
            const opts = this.opts;
            const old  = this._value;

            let next: T = value;
            if (opts.transform) next = opts.transform(next) as T;

            if (opts.type !== undefined && !Property._matchesType(next, opts.type)) return false;
            if (opts.validate && !opts.validate(next))                              return false;
            if (Object.is(old, next))                                               return true;

            if (!this._silent)
            {
                const detail: ChangingDetail = { name: this.name, oldValue: old, newValue: next };
                const cancelable = opts.observable?.cancelable ?? true;
                const ev = new CustomEvent(this._changingEvt, { detail, cancelable, bubbles: opts.observable?.propagation ?? false });
                const ok = this._eventTarget.dispatchEvent(ev);
                if (!ok && cancelable) return false;
                if (detail.override !== undefined) next = detail.override as T;
            }

            this._value = next;
            for (const host of this._hosts) this._sync(host, next);

            if (!this._silent)
            {
                const detail: ChangedDetail = {
                    name: this.name, oldValue: old, newValue: next, bind: opts.bind, bound: opts.bound,
                };
                const ev = new CustomEvent(this._changedEvt, { detail, cancelable: false, bubbles: opts.observable?.propagation ?? false });
                this._eventTarget.dispatchEvent(ev);
            }
            return true;
        }

        /**
         * Install this Property as a real getter/setter on `host` via
         * Object.defineProperty. Multiple hosts share the same value. Chainable.
         */
        install(host: object): this
        {
            const self = this;
            Object.defineProperty(host, this.name, {
                enumerable  : this.opts.enumerable   ?? true,
                configurable: this.opts.configurable ?? true,
                get(): T { return self._value; },
                set(v: T): void { self.set(v); },
            });
            this._hosts.add(host);
            this._sync(host, this._value);
            return this;
        }

        /** Subscribe to the cancelable changing event. Chainable. */
        onChanging(cb: (detail: ChangingDetail, ev: Event) => void): this
        {
            this._eventTarget.addEventListener(this._changingEvt, ((ev: Event) =>
                cb((ev as CustomEvent<ChangingDetail>).detail, ev)) as EventListener);
            return this;
        }

        /** Subscribe to the post-set changed event. Chainable. */
        onChanged(cb: (detail: ChangedDetail, ev: Event) => void): this
        {
            this._eventTarget.addEventListener(this._changedEvt, ((ev: Event) =>
                cb((ev as CustomEvent<ChangedDetail>).detail, ev)) as EventListener);
            return this;
        }

        /** The internal EventTarget — for advanced subscription patterns. */
        get target(): EventTarget { return this._eventTarget; }

        private _sync(host: object, value: T): void
        {
            const dom = Property._resolveDomElement(host);

            const apply = (spec: BindSpec | undefined) =>
            {
                if (!spec) return;

                if (dom)
                {
                    const attrs: string[] = [];
                    if (spec.attribute)  attrs.push(spec.attribute);
                    if (spec.attributes) attrs.push(...spec.attributes);
                    for (const a of attrs)
                    {
                        const str = value === null || value === undefined ? '' : String(value);
                        if (dom.getAttribute(a) !== str) dom.setAttribute(a, str);
                    }
                }

                const props: string[] = [];
                if (spec.property)   props.push(spec.property);
                if (spec.properties) props.push(...spec.properties);
                for (const p of props)
                {
                    const cur = (host as Record<string, unknown>)[p];
                    if (!Object.is(cur, value)) (host as Record<string, unknown>)[p] = value;
                }
            };
            apply(this.opts.bind);
            apply(this.opts.bound);
        }

        // ── private static helpers ────────────────────────────────────────────

        /** Runtime type check against a Type tag or predicate. */
        private static _matchesType(v: unknown, t: Type): boolean
        {
            if (typeof t === 'function') return t(v);
            switch (t)
            {
                case 'string'   : return typeof v === 'string';
                case 'number'   : return typeof v === 'number' && !Number.isNaN(v);
                case 'integer'  : return typeof v === 'number' && Number.isInteger(v);
                case 'boolean'  : return typeof v === 'boolean';
                case 'function' : return typeof v === 'function';
                case 'object'   : return typeof v === 'object' && v !== null && !Array.isArray(v);
                case 'array'    : return Array.isArray(v);
                case 'any'      : return true;
            }
        }

        /**
         * Resolve the DOM element associated with a host: an HTMLElement directly,
         * or any Real-like wrapper exposing `.element`. SSR-safe (null off-DOM).
         */
        private static _resolveDomElement(host: object): HTMLElement | null
        {
            if (typeof HTMLElement === 'undefined') return null;
            if (host instanceof HTMLElement) return host;
            const wrapper = host as { element?: unknown };
            if (wrapper.element instanceof HTMLElement) return wrapper.element;
            return null;
        }
    }
}

// ── Core public API ───────────────────────────────────────────────────────────

/**
 * The Core singleton — frozen at build. The internal observer / boot state is
 * module-scoped (not properties of this object), so freezing the API surface
 * does not prevent Initialize()/Bootstrap() from mutating runtime state.
 *
 * @example
 *   import Core from './Core.ts';
 *   Core.GetDescriptor('div');
 *   Core.Define('my-btn', MyBtn, HTMLButtonElement);
 *   Core.Bootstrap();                 // after component modules load
 *   Core.Configuration.version.string // "1.0.0"
 */
const Core = Object.freeze({
    Configuration,
    get version() { return Configuration.version; },   // back-compat alias
    UUID             : UUID,
    GetPrototypeChain,
    Scopes,
    Namespaces: namespaces,
    GetDescriptor,
    GetType,
    GetConstructor,
    GetInterface,
    GetTags,
    GetNamespace,
    Define,
    Create,
    IsUpgraded,
    Upgrade,
    Initialize,
    Bootstrap,
    Ready,
    get Initialized() { return Boot.initialized; },  // true once Initialize() has run
    get Booted()      { return Boot.booted; },       // true once Bootstrap() has run
    Events: Events.Events,
    get Observer() { return [...observers][0] ?? null; },   // running global Observer (first registered)
    Observers: observers,                 // registry of all Observer instances
    Is,
    Equals,
    Empty,
    Has,
    Clone,
    Assign,
    Replace,
    Extends,
    Property: Property.Property,
    get Root() { return typeof document !== 'undefined' ? document.documentElement : null; },
});

// Auto-Initialize on import (browser only). Bootstrap() is called by the loader
// once the definition-bearing modules have resolved.
if (typeof document !== 'undefined') Initialize();

export default Core;
