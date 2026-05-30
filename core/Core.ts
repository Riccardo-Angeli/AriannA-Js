/**
 * @module    Core
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * The zero-dependency kernel of AriannA.
 * Loaded first. All other modules depend on this.
 *
 * Responsibilities:
 *   - UUID generation
 *   - Prototype chain introspection
 *   - Immutable property descriptor scopes (Scopes)
 *   - Global namespace registry (html / svg / mathML / x3d / custom)
 *   - DOM MutationObserver (custom element lifecycle)
 *   - Static DOM event bus (Events.On / Off / Fire)
 *   - Type descriptor registry (GetDescriptor / Define)
 *   - SetDescriptors — freezes modules after init
 *   - version — SemVer version object (major / minor / patch / string)
 *   - use(plugin) — lazy plugin registration, idempotent
 *   - plugins() — list of installed plugin names
 *
 * Design notes for future contributors:
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  Core ← Namespace ← Real ← Virtual ← Component            │
 *   │        ↑           ↑                                        │
 *   │       Observable  State                                     │
 *   │        ↑                                                    │
 *   │       Sheet ← Rule                                          │
 *   │        ↑                                                    │
 *   │       Stylesheet                                            │
 *   │        ↑                                                    │
 *   │       Context ← Directive                                   │
 *   └─────────────────────────────────────────────────────────────┘
 *
 *   Core intentionally has NO import statements.
 *   If you need to add a utility here, ask: "could this live in
 *   a module that imports Core instead?" If yes, put it there.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** Property descriptor scopes used across all AriannA modules. */
export interface Scope
{
    configurable : boolean;
    enumerable   : boolean;
    writable     : boolean;
}

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
     * Class names to apply to every instance via `node.classList.add(...)` so
     * that ancestor styles (e.g. `.Card1o`) match alongside the own class
     * style (e.g. `.A1o`). Computed at registration time by walking the
     * iface prototype chain; native interfaces (HTML*Element, SVG*Element,
     * MathML*Element) are excluded. See STYLE_CONVENTIONS.md §6.5.
     */
    AncestorCssClasses? : string[];
    /** The factory built by Namespace.Define — `new`-able to produce an instance. */
    Factory?    : new (...args: unknown[]) => Element;
    /** Called by Core.Observer when an element is added via markup. */
    Update?     : (element: Element) => void;
}

/** Namespace functions for creating / patching elements. */
export interface NamespaceFunctions
{
    create : (tag: string | (new () => Element)) => Element | false;
    patch  : (constructor: string) => void;
}

/** Full namespace descriptor (html / svg / mathML / x3d / custom). */
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
    functions     : Partial<NamespaceFunctions>;
    documentation : { w3c: string };
}

/** MutationObserver event detail shape. */
export interface NodeLifecycleDetail
{
    node       : Node;
    descriptor : TypeDescriptor | false;
    state      : { loading: boolean; loaded: boolean; name: string };
}

// ── UUID ──────────────────────────────────────────────────────────────────────

/**
 * Generates a UUID v4-style identifier.
 * Used as a unique key for listeners, nodes, and instances.
 *
 * @example
 *   Core.Uuid  // "a3f1bc-7d2-e94-f05-8c2b3a1d"
 */
export function uuid(): string
{
    const b: string[] = [];
    for (let i = 0; i < 9; i++)
        b.push((Math.floor(1 + Math.random() * 0x10000)).toString(16).slice(1));
    return `${b[1]}${b[2]}-${b[3]}-${b[4]}-${b[5]}-${b[6]}${b[7]}${b[8]}`;
}

// ── Version ───────────────────────────────────────────────────────────────────

/**
 * AriannA framework version.
 * Follows SemVer: MAJOR.MINOR.PATCH
 *
 * Modules can check this to guard against API incompatibilities:
 *   if (Core.version.major < 1) throw new Error('AriannA ≥ 1.0 required');
 *
 * @example
 *   Core.version.string   // "1.0.0"
 *   Core.version.major    // 1
 *   Core.version.minor    // 0
 *   Core.version.patch    // 0
 */
export const version = Object.freeze(
{
    major  : 1,
    minor  : 0,
    patch  : 0,
    get string() { return `${this.major}.${this.minor}.${this.patch}`; },
});

// ── Scopes ────────────────────────────────────────────────────────────────────

/**
 * Reusable Object.defineProperty descriptor templates.
 * Use these instead of writing { configurable, enumerable, writable } inline.
 *
 * @example
 *   Object.defineProperty(obj, 'key', { ...Core.Scopes.Readonly, value: 42 });
 */
export const Scopes: Readonly<Record<string, Scope>> = Object.freeze(
{
    Private      : { configurable: false, enumerable: false, writable: false },
    Readonly     : { configurable: false, enumerable: true,  writable: false },
    Writable     : { configurable: false, enumerable: true,  writable: true  },
    Configurable : { configurable: true,  enumerable: true,  writable: false },
});

// ── Prototype chain ───────────────────────────────────────────────────────────

/**
 * Returns the complete prototype chain of an object or constructor as an
 * array of constructor names — useful for debugging and type introspection.
 *
 * @example
 *   Core.GetPrototypeChain(document.createElement('input'))
 *   // → ["HTMLInputElement","HTMLElement","Element","Node","EventTarget","Object"]
 */
export function GetPrototypeChain(obj: object | (new () => object)): string[]
{
    const chain: string[] = [];
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

// ── SetDescriptors ────────────────────────────────────────────────────────────

/**
 * Applies a property descriptor scope to all own properties of an object,
 * optionally recursing into nested objects.
 *
 * Called at the end of each module's IIFE to freeze the public API.
 * This is the mechanism that makes `Real.Define`, `Core.Events` etc.
 * immutable after initialization.
 *
 * @param target  - Object to freeze
 * @param scope   - Descriptor scope (typically Scopes.Readonly)
 * @param recurse - Whether to recurse into nested plain objects
 *
 * @example
 *   Core.SetDescriptors(MyModule, Core.Scopes.Readonly, true);
 */
export function SetDescriptors(
    target  : Record<string, unknown>,
    scope   : Scope,
    recurse = false,
): void
{
    const d: PropertyDescriptor = { ...scope };
    for (const key of Object.keys(target))
    {
        d.value = target[key];
        try
        {
            Object.defineProperty(target, key, d);
        } catch { /* already frozen — skip */ }
        if (recurse && target[key] && typeof target[key] === 'object'
                && !Array.isArray(target[key]))
                {
            SetDescriptors(
                target[key] as Record<string, unknown>,
                scope,
                true,
            );
        }
    }
}

// ── Namespace registry ────────────────────────────────────────────────────────
// Populated by Namespace.ts at load time.
// Real, Virtual, Component all read from here — NOT from Real.Namespaces.

export const Namespaces: Record<string, NamespaceDescriptor> = {};

/**
 * Register a new namespace (e.g. html, svg, mathML, x3d, custom).
 * Called by Namespace.ts — not called directly by user code.
 *
 * @example
 *   Core.RegisterNamespace('svg', { name:'svg', schema:'http://www.w3.org/2000/svg', ... });
 */
export function RegisterNamespace(key: string, ns: NamespaceDescriptor): void
{
    if (Namespaces[key])
    {
        console.warn(`Core.RegisterNamespace: '${key}' already registered — skipping.`);
        return;
    }
    Namespaces[key] = ns;

    // Populate fast-lookup indexes (Map/WeakMap) so GetDescriptor becomes O(1)
    // regardless of namespace + interface count.
    const std = ns.types?.standard;
    const cst = ns.types?.custom;
    if (std) {
        for (const ifaceName of Object.keys(std.interfaces ?? {})) {
            _indexInterface(ifaceName, std.interfaces[ifaceName]);
        }
        for (const tag of Object.keys(std.tags ?? {})) {
            _indexTag(tag, std.tags[tag]);
        }
    }
    if (cst) {
        for (const ifaceName of Object.keys(cst.interfaces ?? {})) {
            _indexInterface(ifaceName, cst.interfaces[ifaceName]);
        }
        for (const tag of Object.keys(cst.tags ?? {})) {
            _indexTag(tag, cst.tags[tag]);
        }
    }
}

// ── Fast-lookup indexes (Map/WeakMap) ─────────────────────────────────────────
//
// Three indexes used by GetDescriptor for O(1) lookups, populated by
// RegisterNamespace (for standard interfaces) and IndexCustom (called from
// Namespace.Define when a Custom descriptor is registered).
//
// • _tagIndex   — Map<lowercase tag, descriptor>
// • _nameIndex  — Map<interface name (any case), descriptor>
// • _ctorIndex  — WeakMap<Function, descriptor>
//
// WeakMap keys are constructors — they can be GC'd if user code drops its
// references to a custom class, freeing the descriptor too. Good for hot
// module reload.

const _tagIndex  : Map<string, TypeDescriptor>       = new Map();
const _nameIndex : Map<string, TypeDescriptor>       = new Map();
const _ctorIndex : WeakMap<Function, TypeDescriptor> = new WeakMap();

function _indexInterface(ifaceName: string, d: TypeDescriptor): void
{
    if (!d) return;
    // Constructor key is descriptor-specific (each Custom has its own unique
    // generated class via Component(...)), so set unconditionally.
    if (d.Constructor) _ctorIndex.set(d.Constructor as Function, d);

    // Interface key (e.g. HTMLElement, SVGSVGElement) is SHARED across many
    // descriptors: every Custom registered with `extends Component(tag,
    // HTMLElement, …)` has `d.Interface === HTMLElement`. Last-write-wins
    // here would corrupt the global index — a subsequent
    // GetDescriptor(HTMLElement) would return the latest registered Custom
    // descriptor instead of the standard HTMLElement one. Standard
    // descriptors are registered first by RegisterNamespace at namespace
    // creation, so a "first-write-wins" check on _ctorIndex protects them
    // from being clobbered by Custom registrations.
    //
    // For _nameIndex the same logic applies: 'HTMLElement' string key
    // belongs to the standard descriptor, not to any Custom that happens
    // to use HTMLElement as its iface.
    if (d.Interface && d.Interface !== d.Constructor && !_ctorIndex.has(d.Interface as Function)) {
        _ctorIndex.set(d.Interface as Function, d);
    }
    if (!_nameIndex.has(ifaceName)) {
        _nameIndex.set(ifaceName, d);
        _nameIndex.set(ifaceName.toLowerCase(), d);
    }
    for (const t of (d.Tags ?? [])) _tagIndex.set(t.toLowerCase(), d);
}

function _indexTag(tag: string, d: TypeDescriptor): void
{
    if (!d) return;
    _tagIndex.set(tag.toLowerCase(), d);
}

/**
 * Index a freshly-created Custom descriptor. Called by Namespace.Define
 * immediately after the descriptor is added to namespace.Custom.{Interfaces,Tags}.
 * Keeps Core's fast-lookup indexes in sync so GetDescriptor stays O(1).
 */
export function IndexCustom(d: TypeDescriptor): void
{
    if (!d) return;
    if (d.Name) _indexInterface(d.Name, d);
    for (const t of (d.Tags ?? [])) _indexTag(t, d);
}

/**
 * Index a user subclass captured on first `new Subclass()` against its own
 * descriptor. The factory registers the descriptor under the shared Component
 * class (Constructor) and Name 'Component', so GetDescriptor(Subclass) would
 * miss until now. After this, `Core.Define('case-1o', A1o, Card1o)` resolves
 * Card1o as the Custom base it is — instead of failing the lookup and falling
 * back to a standard/HTMLElement guess. Self-contained: drop this function and
 * its single call site to roll back.
 */
export function IndexClass(ctor: Function, d: TypeDescriptor): void
{
    if (!ctor || !d) return;
    _ctorIndex.set(ctor, d);                              // GetDescriptor(Card1o) → desc
    const n = (ctor as { name?: string }).name;
    if (n && !_nameIndex.has(n)) {                        // GetDescriptor('Card1o') → desc
        _nameIndex.set(n, d);
        _nameIndex.set(n.toLowerCase(), d);
    }
}

/**
 * Look up a type descriptor by tag name, constructor name, or Node instance.
 * Searches all registered namespaces (standard + custom).
 *
 * Returns false if not found.
 *
 * @example
 *   Core.GetDescriptor('input')         // HTML standard descriptor
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

    // ── Fast-path lookups via Map / WeakMap (O(1)) ────────────────────────
    if (t === 'string') {
        const k = (obj as string).toLowerCase();
        const hit = _tagIndex.get(k) ?? _nameIndex.get(k);
        if (hit) return hit;
    }
    else if (t === 'function') {
        const ctorHit = _ctorIndex.get(obj as Function);
        if (ctorHit) return ctorHit;
        const name = (obj as { name?: string }).name;
        if (name) {
            const nameHit = _nameIndex.get(name) ?? _nameIndex.get(name.toLowerCase());
            if (nameHit) return nameHit;
        }
    }
    else if (obj instanceof Node) {
        const el = obj as Element;
        const keys = [
            el.getAttribute?.('data-arianna-tag'),
            el.getAttribute?.('is'),
            el.nodeName?.toLowerCase(),
        ].filter(Boolean) as string[];
        for (const key of keys) {
            const hit = _tagIndex.get(key.toLowerCase());
            if (hit) return hit;
        }
    }

    // ── Slow-path fallback (scan all namespaces) ──────────────────────────
    // Used when an interface isn't yet in the indexes (very early bootstrap)
    // or for plain objects with a Tag property.
    let key: string;
    if (t === 'string') {
        key = (obj as string).toLowerCase();
    } else if (t === 'function') {
        key = (obj as { name: string }).name.toLowerCase();
    } else if (obj instanceof Node)
    {
        const el = obj as Element;
        key = (
            el.getAttribute?.('data-arianna-tag') ||
            el.getAttribute?.('is') ||
            el.nodeName
        ).toLowerCase();
    } else
    {
        const o = obj as Record<string, unknown>;
        const tagKey = Object.keys(o).find(k => k.toUpperCase() === 'TAG');
        if (!tagKey) return false;
        key = String(o[tagKey]).toLowerCase();
    }

    for (const nsKey of Object.keys(Namespaces))
    {
        const ns  = Namespaces[nsKey];
        const std = ns.types.standard;
        const cst = ns.types.custom;

        const found =
            std.tags[key]        ??
            std.interfaces[key]  ??
            cst.tags[key]        ??
            cst.interfaces[key];

        if (found) return found;

        if (typeof obj === 'function') {
            for (const k of Object.keys(std.interfaces))
            {
                const d = std.interfaces[k];
                if (k.toLowerCase() === key || d.Constructor === obj || d.Interface === obj) return d;
            }
            for (const k of Object.keys(cst.interfaces))
            {
                const d = cst.interfaces[k];
                if (k.toLowerCase() === key || d.Constructor === obj || d.Interface === obj) return d;
            }
        }
    }
    return false;
}

// ── Convenience query helpers (mirror Golem v1 Component.Types.Get*) ──────────

/**
 * Returns `descriptor.Type`: "STANDARD" | "CUSTOM" | "INVALID".
 * Mirrors `Component.Types.GetType` from the v1 Golem sources.
 */
export function GetType(obj: Parameters<typeof GetDescriptor>[0]): string
{
    const d = GetDescriptor(obj);
    return d ? (d.Type ?? 'INVALID') : 'INVALID';
}

/**
 * Returns `descriptor.Constructor` — the user's class/function for Custom types,
 * or the native IDL interface (HTMLDivElement, SVGSVGElement…) for Standard.
 * Mirrors `Component.Types.GetConstructor`.
 */
export function GetConstructor(obj: Parameters<typeof GetDescriptor>[0]): (new (...a: never[]) => Element) | undefined
{
    const d = GetDescriptor(obj);
    return d && d.Constructor ? d.Constructor as new (...a: never[]) => Element : undefined;
}

/**
 * Returns `descriptor.Interface` — the first native IDL super class
 * (e.g. HTMLDivElement for a custom <my-div>).
 * Mirrors `Component.Types.GetInterface`.
 */
export function GetInterface(obj: Parameters<typeof GetDescriptor>[0]): (new (...a: never[]) => Element) | undefined
{
    const d = GetDescriptor(obj);
    return d && d.Interface ? d.Interface as new (...a: never[]) => Element : undefined;
}

/**
 * Returns `descriptor.Tags` — every tag name that resolves to this type.
 * Mirrors `Component.Types.GetTags`.
 */
export function GetTags(obj: Parameters<typeof GetDescriptor>[0]): string[]
{
    const d = GetDescriptor(obj);
    return d && d.Tags ? d.Tags : [];
}

/**
 * Returns the descriptor's owning Namespace descriptor.
 *
 * When called with a namespace key string ('html', 'svg', 'mathML', 'x3d')
 * directly, returns that namespace by key. Otherwise it resolves to a
 * descriptor first and then returns descriptor.Namespace.
 * Mirrors `Component.Types.GetNamespace`.
 */
export function GetNamespace(obj: Parameters<typeof GetDescriptor>[0]): NamespaceDescriptor | undefined
{
    if (typeof obj === 'string' && Namespaces[obj]) return Namespaces[obj];
    const d = GetDescriptor(obj);
    return d && d.Namespace ? d.Namespace : undefined;
}

/**
 * Register a custom element type descriptor in the appropriate namespace.
 *
 * Works with ALL namespaces: html, svg, mathML, x3d, and custom.
 * Never throws — mirrors the original Real.js approach of scanning all
 * registered namespaces to find the right one from the base constructor,
 * with a silent html-namespace fallback when nothing matches.
 *
 * @param tag         - Hyphenated custom element tag (e.g. 'my-button', 'my-icon')
 * @param constructor - Class or function constructor
 * @param base        - Interface to extend (default: HTMLElement).
 *                      Can be any registered constructor: HTMLDivElement,
 *                      SVGSVGElement, SVGPathElement, MathMLElement, etc.
 * @param style       - Optional default CSS properties object
 *
 * @example
 *   // HTML custom element
 *   Core.Define('my-button', MyButton, HTMLButtonElement, { background: 'blue' });
 *
 *   // SVG custom element — pass any SVG interface as base
 *   Core.Define('my-icon', MyIcon, SVGSVGElement);
 *
 *   // MathML custom element
 *   Core.Define('my-formula', MyFormula, MathMLElement);
 */
export function Define(
    tag         : string,
    constructor : new (...args: unknown[]) => Element,
    base        : new (...args: unknown[]) => Element = HTMLElement,
    style       : Record<string, string> = {},
): new (...args: unknown[]) => Element
{
    const ct = tag.toLowerCase();

    // ── Slide-args: tolerant 3-arg form ───────────────────────────────────
    // Allow Core.Define(tag, ctor, style)  AND  Core.Define(tag, ctor, null, def).
    // When the 3rd argument isn't a constructor function (e.g. plain object,
    // Rule, Stylesheet, null, undefined), treat it as the style/def and
    // default base to HTMLElement — the `extends Y` introspection below will
    // then promote it to the right native interface if the user wrote
    // `class X extends HTMLDivElement` (or SVGSVGElement, MathMLElement, …).
    //
    // Concretely accepted runtime forms:
    //   Core.Define('case-3a', A3a)                                  base=auto
    //   Core.Define('case-3a', A3a, { Background: 'red' })           base=auto, style=arg3
    //   Core.Define('case-3a', A3a, null)                            base=auto
    //   Core.Define('case-3a', A3a, null, { shadow: 'closed' })      base=auto, def=arg4
    //   Core.Define('case-3a', A3a, HTMLDivElement, { ... })         classic typed form
    {
        const baseAny = base as unknown;
        if (baseAny === null || baseAny === undefined)
        {
            base = HTMLElement;
        }
        else if (typeof baseAny !== 'function')
        {
            // 3rd arg is actually style/def — slide it.
            style = baseAny as Record<string, string>;
            base  = HTMLElement;
        }
    }

    // ── Introspect base from `class X extends Y { ... }` ─────────────────
    // When the user omits the base argument, scan the ctor body for an
    // `extends Y` clause. If Y is a known native interface (HTMLDivElement,
    // SVGSVGElement, …) in any registered namespace, promote it to `base`.
    //
    // This makes the call site clean:
    //   class FormC extends HTMLDivElement { ... }
    //   Core.Define('form-c', FormC);             // base auto-resolved
    //
    // Equivalent to:
    //   Core.Define('form-c', FormC, HTMLDivElement);
    //
    // Without this, the factory falls back to baseTag='address' (the first
    // tag mapped to HTMLElement) and the prototype chain loses the user's
    // intended interface.
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
                    // Verify it's a registered native interface in some namespace
                    const desc = GetDescriptor(candidate as new (...a: unknown[]) => Element);
                    if (desc && desc.Standard) {
                        base = candidate as new (...args: unknown[]) => Element;
                    }
                }
            }
        } catch { /* introspection is best-effort */ }
    }

    // Already registered? Update mutable slots in place and reuse Factory.
    //
    // This is the hot-reload contract: a second Core.Define('case-1b', A1b_new,
    // base, ruleInstance_new) does NOT create a new Factory (avoids memory
    // leaks, broken prototype chains, double-define on the same tag), but it
    // DOES update the descriptor's mutable fields so that the next markup
    // upgrade and the next factory call see the new style / constructor.
    //
    // Mutable slots: Style (CSS rules / Rule / Stylesheet), Constructor (user
    // class or function body). Interface / Tags / Name / Factory / Standard
    // are immutable — they identify the registration itself.
    //
    // The factory closure in Namespace.Define must read these slots from
    // `descriptor.Style` and `descriptor.Constructor` rather than capturing
    // them as locals, otherwise the update is silent.
    const existing = GetDescriptor(ct);
    if (existing && existing.Factory)
    {
        // Update mutable slots — never replace Factory or Interface.
        if (typeof style !== 'undefined') existing.Style = style;
        if (typeof constructor === 'function') existing.Constructor = constructor;
        return existing.Factory;
    }

    // ── Locate the correct namespace ───────────────────────────────────────────
    //
    // Strategy:
    //   1. Try GetDescriptor(base) — fast path for known tag/interface names
    //   2. Scan all NS: check if ns.base === base (catches SVGElement, MathMLElement)
    //   3. Scan all NS interfaces for matching Constructor or Interface reference
    //   4. Fallback to html namespace — never throws
    //
    let ns: NamespaceDescriptor | null = null;

    // O(1) fast path — _ctorIndex / _nameIndex / _tagIndex via GetDescriptor.
    // Covers every registered native interface and every Custom descriptor
    // (Namespace.Define calls Core.IndexCustom on register, so the WeakMap is
    // pre-populated for both standard ancestors and user Components).
    const baseDsc = GetDescriptor(base);
    if (baseDsc && baseDsc.Namespace) ns = baseDsc.Namespace;

    // ── First-use registration for unregistered user-class bases ──────────
    //
    // The base may be a user class that extends a registered class but is
    // not itself in any index. Three idiomatic patterns:
    //
    //   class Card extends Component('arianna-card', HTMLDivElement, …) { }
    //   class SvgBase extends SVGSVGElement { }
    //   class MathBase extends MathMLElement { }
    //
    // None of these user classes appear in _ctorIndex / _nameIndex / the
    // namespace interfaces — only their ancestors do. Walk
    // Object.getPrototypeOf(base) ONCE to find the first registered
    // ancestor, then register the user class against the same descriptor
    // so every subsequent Core.Define / GetDescriptor call hits the O(1)
    // Map lookup. The walk is bounded by the inheritance depth (typically
    // 1–3 steps) and happens at most once per user-class lifetime.
    if (!ns)
    {
        let ancestor: object | null = Object.getPrototypeOf(base);
        let hitDesc : TypeDescriptor | null = null;
        while (ancestor && ancestor !== Function.prototype && ancestor !== Object.prototype)
        {
            // Fast path: ancestor itself is indexed (Component-returned class,
            // native interface like SVGSVGElement).
            const aDsc = _ctorIndex.get(ancestor as Function);
            if (aDsc && aDsc.Namespace) { ns = aDsc.Namespace; hitDesc = aDsc; break; }
            // Slow path: scan standard interfaces (covers SVGSVGElement →
            // SVGGraphicsElement → SVGElement when the WeakMap was missed,
            // and namespace.base equality).
            for (const nsKey of Object.keys(Namespaces))
            {
                const candidate = Namespaces[nsKey];
                if (candidate.base === ancestor) { ns = candidate; break; }
                for (const k of Object.keys(candidate.types.standard.interfaces))
                {
                    const d = candidate.types.standard.interfaces[k];
                    if (d.Constructor === ancestor || d.Interface === ancestor)
                    {
                        ns      = candidate;
                        hitDesc = d;
                        break;
                    }
                }
                if (ns) break;
            }
            if (ns) break;
            ancestor = Object.getPrototypeOf(ancestor);
        }
        // Memoize: register base against its ancestor's descriptor so the
        // next call is O(1). Without a descriptor we can't memoize (no
        // payload to store), but that path also doesn't take the walk
        // route, so no extra cost.
        if (hitDesc) _ctorIndex.set(base as Function, hitDesc);
    }

    if (!ns)
    {
        ns = Namespaces['html'] ?? Object.values(Namespaces)[0];
        console.warn(`Core.Define: base '${base.name}' not found in any registered namespace — defaulting to html.`);
    }

    // ── Delegate to the Namespace's Define ─────────────────────────────────
    // The Namespace descriptor exposes a `Define` bridge that delegates to
    // the live Namespace instance (set up in Namespace.toDescriptor()).
    // This avoids relying on window.Core which may not be ready yet during
    // bootstrap.
    const nsAny = ns as NamespaceDescriptor & { Define?: typeof Define };

    if (nsAny.Define && typeof nsAny.Define === 'function')
    {
        return nsAny.Define(ct, constructor, base, style);
    }

    // Fallback: construct a minimal descriptor and register manually
    // (shouldn't happen in practice — included for robustness)
    console.warn(`Core.Define: namespace '${ns.name}' has no Define() method — using fallback.`);
    const isClass = /^class[\s{]/.test(constructor.toString());
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
    };
    ns.types.custom.interfaces[constructor.name] = descriptor;
    ns.types.custom.tags[ct]                     = descriptor;
    document.dispatchEvent(new CustomEvent('arianna-wip:defined', { detail: { tag: ct, descriptor } }));
    return constructor;
}


/**
 * Create an element by tag, applying the registered descriptor's upgrade
 * **synchronously** before returning. The JS-side equivalent of writing
 * the tag in markup — but you don't have to wait for the MutationObserver
 * microtask to inspect/manipulate the upgraded element.
 *
 * Use this whenever you need a custom-tag element programmatically and want
 * outerHTML / style / facilities to be ready immediately. For higher-level
 * fluent chains use `new Real(tag)`.
 *
 * @example
 *   Core.Define('my-card', function() { this.textContent = 'Hello'; },
 *               HTMLDivElement, { Background: 'crimson', Padding: '12px' });
 *
 *   const el = Core.Create('my-card');
 *   el.outerHTML;
 *   // → '<my-card style="background: crimson; padding: 12px;">Hello</my-card>'
 *
 *   document.body.appendChild(el);
 */
export function Create(tag: string): Element | null
{
    const ct = tag.toLowerCase();
    const d  = GetDescriptor(ct);

    // Unknown tag — fall back to plain createElement.
    if (!d || !d.Namespace) {
        try { return document.createElement(ct); } catch { return null; }
    }

    const ns = d.Namespace as NamespaceDescriptor & {
        Create?: (tag: string) => Element | null;
        Update?: (el: Element, hint?: TypeDescriptor) => void;
    };

    // Create via the owning namespace so SVG/MathML/X3D use createElementNS.
    let el: Element | null = null;
    if (typeof ns.Create === 'function') {
        el = ns.Create(ct);
    } else {
        try { el = document.createElement(ct); } catch { /* SSR */ }
    }
    if (!el) return null;

    // Run the namespace's Update synchronously for Custom tags. Idempotent via
    // the descriptor's __ariannaUpgraded flag, so a subsequent DOM insertion
    // (which triggers Core.Observer) won't re-process this element.
    if (d.Custom && typeof ns.Update === 'function') {
        try { ns.Update(el, d); }
        catch (e) { console.warn('[arianna] Core.Create: Update failed:', e); }
    }
    return el;
}

/**
 * Returns true when AriannA has already upgraded an Element via Namespace.Update().
 * Uses the same flag as Namespace.Update/Core.Create, so checks are O(1).
 */
export function IsUpgraded(node: unknown): boolean
{
    return !!(node && typeof node === 'object'
        && (node as { __ariannaUpgraded?: boolean }).__ariannaUpgraded === true);
}

/**
 * Upgrade a single Element using the AriannA namespace registry.
 * This is intentionally single-node and O(1): descriptor lookup by tag/namespace,
 * then Namespace.Update(). It does not walk descendants.
 */
export function Upgrade(node: Node | Element | null | undefined): Element | null
{
    if (!(node instanceof Element)) return null;
    if (IsUpgraded(node)) return node;

    const d = GetDescriptor(node);
    if (!d || !d.Custom || !d.Constructor) return node;

    const ns = d.Namespace as unknown as { Update?: (el: Element, hint?: TypeDescriptor) => void };
    if (ns && typeof ns.Update === 'function') {
        try { ns.Update(node, d); }
        catch (e) { console.warn('[Core.Upgrade] namespace.Update failed:', e); }
    } else if (d.Update) {
        try { d.Update(node); }
        catch (e) { console.warn('[Core.Upgrade] descriptor.Update failed:', e); }
    }
    return node;
}

/**
 * Explicit escape hatch for precomposed markup/fragments/SSR hydration tests.
 * The default Markup IR path remains MutationObserver + O(1) single-node Upgrade().
 * This method performs a lightweight DFS and calls Upgrade() per Element.
 */
export function UpgradeTree(root: Node | Element | Document | DocumentFragment | null | undefined): number
{
    if (!root) return 0;
    let count = 0;

    const visit = (node: Node): void => {
        if (node instanceof Element) {
            const before = IsUpgraded(node);
            Upgrade(node);
            if (!before && IsUpgraded(node)) count++;
            for (let child = node.firstElementChild; child; child = child.nextElementSibling)
                visit(child);
            return;
        }
        for (let child = node.firstChild; child; child = child.nextSibling)
            visit(child);
    };

    visit(root as Node);
    return count;
}

// ── DOM Events static bus ─────────────────────────────────────────────────────

/**
 * Static DOM event utilities — thin wrappers around addEventListener /
 * removeEventListener / dispatchEvent with multi-target and multi-type support.
 *
 * These are the synchronous DOM event helpers.
 * For the AriannA pub/sub bus, use Observable.
 *
 * @example
 *   Core.Events.On(element, 'click', handler);
 *   Core.Events.On('.btn', 'click mouseenter', handler);
 *   Core.Events.Fire(element, 'click', { bubbles: true });
 *   Core.Events.Off(element, 'click', handler);
 */
export const Events = Object.freeze(
{

    /**
     * Add a DOM event listener to one or more targets.
     * Prefer `Observable.On` for full listener shipments and registry.
     * @example
     *   Core.Events.On(element, 'click', handler);
     *   Core.Events.On('.btn', 'click mouseenter', handler, { passive: true });
     */
    On(
        target   : EventTarget | string | EventTarget[],
        types    : string,
        callback : EventListener,
        options? : AddEventListenerOptions,
    ): void
    {
        _resolveTargets(target).forEach(el =>
            _splitTypes(types).forEach(t => el.addEventListener(t, callback, options)));
    },

    /**
     * Remove a DOM event listener from one or more targets.
     * @example
     *   Core.Events.Off(element, 'click', handler);
     */
    Off(
        target   : EventTarget | string | EventTarget[],
        types    : string,
        callback : EventListener,
        options? : boolean | EventListenerOptions,
    ): void
    {
        _resolveTargets(target).forEach(el =>
            _splitTypes(types).forEach(t => el.removeEventListener(t, callback, options)));
    },

    /**
     * Dispatch a CustomEvent on one or more targets.
     * @example
     *   Core.Events.Fire(button, 'click', { detail: { value: 42 } });
     */
    Fire(
        target  : EventTarget | string | EventTarget[],
        type    : string,
        init?   : CustomEventInit,
    ): void
    {
        const ev = new CustomEvent(type, { bubbles: true, composed: true, ...init });
        _resolveTargets(target).forEach(el => el.dispatchEvent(ev));
    },
});

function _resolveTargets(t: EventTarget | string | EventTarget[]): EventTarget[]
{
    if (typeof t === 'string')
        return Array.from(document.querySelectorAll<Element>(t)) as EventTarget[];
    return Array.isArray(t) ? t : [t];
}

function _splitTypes(s: string): string[]
{
    return s.split(/\s+|,|\|/g).filter(Boolean);
}

// ── MutationObserver — custom element lifecycle ───────────────────────────────

/**
 * The global DOM watcher.
 * Fires 'arianna-wip:nodeadding' / 'arianna-wip:nodeadded' / 'arianna-wip:noderemoved'
 * on the document, and calls descriptor.Update() on custom elements
 * when they are inserted into the DOM.
 *
 * Initialized automatically when Core is imported.
 * Can be stopped via Core.Observer.disconnect().
 *
 * @example
 *   document.addEventListener('arianna-wip:nodeadded', e => console.log(e.detail));
 */
export const Observer = new MutationObserver((mutations: MutationRecord[]) => {
    // ── Listener-error isolation ─────────────────────────────────────────
    // The DOM contract is that an exception thrown by an event listener is
    // reported asynchronously as an uncaught error attributed to the
    // dispatchEvent site — NOT propagated to the caller. A try/catch around
    // dispatchEvent does NOT catch the listener's throw. The only reliable
    // way to isolate a misbehaving listener (in a component, in the
    // playground, anywhere) is to call dispatchEvent inside an explicit
    // try/catch within the Observer body itself.
    //
    // Without this guard, an "Illegal constructor" (or any other listener
    // throw) from a component or extension surfaces with a single-frame
    // stack pointing at this Observer loop — which is the symptom the
    // playground hit at boot, with the throw misattributed to an unrelated
    // source line in the host HTML.
    const safeDispatch = (target: EventTarget, ev: Event): void => {
        try { target.dispatchEvent(ev); }
        catch (e) { console.warn('[arianna] Observer dispatchEvent listener threw:', e); }
    };

    for (const m of mutations)
    {
        // Attribute change → dispatch {tagname}-change event on the element
        if (m.type === 'attributes' && m.target instanceof Element) {
            const attr = m.target.attributes.getNamedItem(m.attributeName ?? '');
            if (attr)
            {
                const evName = /^(\w+)/.exec(attr.name)?.[1]?.toLowerCase() ?? attr.name;
                safeDispatch(m.target, new CustomEvent(`${evName}-change`, {
                    detail: { element: m.target, attribute: attr },
                }));
            }
        }

        // Child list change → lifecycle events + Update() for custom elements
        if (m.type === 'childList') {
            for (const node of Array.from(m.addedNodes))
            {
                const d = node instanceof Element ? GetDescriptor(node) : false;
                const detail: NodeLifecycleDetail = {
                    node, descriptor: d, state: { loading: true, loaded: false, name: 'Loading' },
                };

                if (node instanceof Element)
                    safeDispatch(node, new CustomEvent('arianna-wip:nodeadding', { detail }));

                if (node instanceof Element) {
                    try { Upgrade(node); }
                    catch (e) { console.warn('[arianna] Observer Upgrade threw:', e); }
                }

                detail.state = { loading: false, loaded: true, name: 'Loaded' };
                safeDispatch(document, new CustomEvent('arianna-wip:nodeadded', { detail }));
            }

            for (const node of Array.from(m.removedNodes))
            {
                const d = node instanceof Element ? GetDescriptor(node) : false;
                safeDispatch(document, new CustomEvent('arianna-wip:noderemoved', {
                    detail: { node, descriptor: d },
                }));
            }
        }
    }
});

// Start observing as soon as Core is imported.
// Only start if we are in a browser context.
if (typeof document !== 'undefined') {
    Observer.observe(document.documentElement, {
        childList         : true,
        subtree           : true,
        attributes        : true,
        attributeOldValue : true,
    });
}

// ── Plugin system ─────────────────────────────────────────────────────────────

/**
 * Shape of an AriannA plugin.
 *
 * A plugin is any object (or class instance) that exposes an `install` method.
 * `install` receives the Core singleton and the options passed to `Core.use()`.
 *
 * Plugins are idempotent: installing the same plugin twice is a no-op.
 *
 * @example
 *   // Define a plugin
 *   const RouterPlugin = {
 *     name: 'router',
 *     install(core, opts) {
 *       core.Namespaces;                       // access namespace registry
 *       core.Events.On(window, 'popstate', opts.handler);
 *       Object.defineProperty(window, 'Router', { value: opts.routes });
 *     }
 *   };
 *
 *   // Register it
 *   Core.use(RouterPlugin, { handler: myHandler, routes: myRoutes });
 *
 *   // Core.plugins lists all installed plugin names
 *   Core.plugins  // ['router']
 */
export interface CorePlugin
{
    /** Unique name used to prevent double-installation. */
    name    : string;
    /** Called once when the plugin is first installed. */
    install : (core: typeof _coreApi, options?: Record<string, unknown>) => void;
}

// Internal installed-plugin registry
const _installedPlugins = new Set<string>();

/**
 * Install a plugin into Core.
 * Idempotent — calling twice with the same plugin name is silently ignored.
 *
 * @example
 *   Core.use(MyPlugin);
 *   Core.use(MyPlugin, { option: 'value' });
 */
export function use(
    plugin  : CorePlugin,
    options : Record<string, unknown> = {},
): void
{
    if (_installedPlugins.has(plugin.name))
    {
        console.warn(`Core.use: plugin '${plugin.name}' is already installed.`);
        return;
    }
    plugin.install(_coreApi, options);
    _installedPlugins.add(plugin.name);
}

/**
 * Returns the names of all currently installed plugins.
 *
 * @example
 *   Core.plugins   // ['router', 'i18n']
 */
export function plugins(): string[]
{
    return Array.from(_installedPlugins);
}

// ── Helpers — generic object/value utilities ─────────────────────────────────

/**
 * Type tag accepted by `Is`. Either a JS primitive type tag, a special tag
 * 'class' that matches ES class syntax, or a constructor function for
 * `instanceof` checks.
 */
export type IsType =
    | 'string' | 'number' | 'boolean' | 'symbol'
    | 'function' | 'object' | 'class'
    | (new (...args: never[]) => unknown);

/**
 * Checks whether the first argument satisfies all the given type tags.
 *
 * Supports JS primitive type tags ('string', 'number', ...), the special
 * 'class' tag (which matches only true ES class declarations), and
 * constructor functions for instanceof checks.
 *
 * @example
 *   Core.Is(42, 'number')                  // true
 *   Core.Is(class A {}, 'class')           // true
 *   Core.Is(function A() {}, 'class')      // false
 *   Core.Is(new Date(), Date)              // true
 *   Core.Is(arr, 'object', Array)          // true
 */
export function Is(value: unknown, ...types: IsType[]): boolean
{
    if (value === null || value === undefined || types.length === 0) return false;

    const native = new Set(['string', 'number', 'boolean', 'symbol', 'function', 'object']);

    for (const t of types)
    {
        if (typeof t === 'string')
        {
            if (t === 'class')
            {
                if (typeof value !== 'function' || !/^class\b/.test(Function.prototype.toString.call(value))) return false;
            }
            else if (native.has(t))
            {
                if (typeof value !== t) return false;
            }
        }
        else if (typeof t === 'function')
        {
            if (!(value instanceof t)) return false;
        }
    }
    return true;
}

/**
 * Deep equality across primitives, plain objects, arrays, regex, dates,
 * and class instances (by enumerable own property shape).
 *
 * Pass either two or more arguments (`Equals(a, b, c)`), or a single array
 * (`Equals([a, b, c])`).
 *
 * @example
 *   Core.Equals({a:1}, {a:1})            // true
 *   Core.Equals([1,2,3], [1,2,3])        // true
 *   Core.Equals(new Date(0), new Date(0))// true
 */
export function Equals(...args: unknown[]): boolean
{
    let elements = args;
    if (args.length === 1 && Array.isArray(args[0])) elements = args[0] as unknown[];
    if (elements.length < 2) return true;

    for (let i = elements.length - 1; i > 0; i--)
    {
        const x = elements[i];
        const y = elements[i - 1];
        if (Object.is(x, y)) continue;

        if ((x === null || x === undefined) && (y === null || y === undefined)) continue;
        if (x === null || y === null || x === undefined || y === undefined) return false;

        const tx = typeof x, ty = typeof y;
        if (tx !== ty) return false;

        if (tx === 'object')
        {
            if (x instanceof Date && y instanceof Date)
            {
                if (x.getTime() !== y.getTime()) return false;
                continue;
            }
            if (x instanceof RegExp && y instanceof RegExp)
            {
                if (x.toString() !== y.toString()) return false;
                continue;
            }
            if (Array.isArray(x) || Array.isArray(y))
            {
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
            for (const k of xk)
            {
                if (!Object.prototype.hasOwnProperty.call(yo, k)) return false;
                if (!Equals(xo[k], yo[k])) return false;
            }
            continue;
        }

        if (tx === 'function')
        {
            if ((x as () => unknown).toString() !== (y as () => unknown).toString()) return false;
            continue;
        }

        return false;
    }
    return true;
}

/**
 * Returns true when an object has no own enumerable properties.
 * Non-objects always return true.
 *
 * @example
 *   Core.Empty({})           // true
 *   Core.Empty({a: 1})       // false
 *   Core.Empty([])           // true
 */
export function Empty(value: unknown): boolean
{
    if (value === null || value === undefined || typeof value !== 'object') return true;
    for (const _ in value as object) return false;
    return true;
}

/**
 * Checks if `target` has all the specified members.
 *
 * For HTMLElement, members are checked against attributes.
 * For other objects, members are checked against own properties.
 *
 * @example
 *   Core.Has(obj, 'name', 'value')           // checks both keys
 *   Core.Has(divElement, 'data-id')          // checks attribute
 */
export function Has(target: object | null | undefined, ...members: string[]): boolean
{
    if (!target || typeof target !== 'object') return false;
    if (members.length === 0) return true;
    const isElement = typeof HTMLElement !== 'undefined' && target instanceof HTMLElement;

    for (const m of members)
    {
        if (isElement)
        {
            if ((target as HTMLElement).getAttribute(m) === null) return false;
        }
        else
        {
            if (!(m in (target as Record<string, unknown>))) return false;
        }
    }
    return true;
}

/**
 * Deep-clone a value. Handles primitives, Date, Array, plain Object, and
 * Node (via `cloneNode(true)`). Functions are cloned via `new Function`.
 *
 * @example
 *   const clone = Core.Clone({a: 1, b: [2,3]});
 */
export function Clone<T>(value: T): T
{
    if (value === null || value === undefined) return value;

    const t = typeof value;
    if (t === 'string' || t === 'number' || t === 'boolean' || t === 'symbol' || t === 'bigint') return value;

    if (t === 'function')
    {
        const fn = value as unknown as () => unknown;
        const out = new Function('return ' + fn.toString())() as () => unknown;
        const fnRec = fn as unknown as Record<string, unknown>;
        const outRec = out as unknown as Record<string, unknown>;
        for (const k of Object.keys(fnRec)) outRec[k] = fnRec[k];
        return out as unknown as T;
    }

    if (typeof Node !== 'undefined' && value instanceof Node)
    {
        return value.cloneNode(true) as unknown as T;
    }

    if (value instanceof Date) return new Date(value.getTime()) as unknown as T;
    if (value instanceof RegExp) return new RegExp(value.source, value.flags) as unknown as T;

    if (Array.isArray(value))
    {
        return value.map(v => Clone(v)) as unknown as T;
    }

    if (t === 'object')
    {
        const obj = value as Record<string, unknown>;
        const out: Record<string, unknown> = {};
        for (const k of Object.keys(obj)) out[k] = Clone(obj[k]);
        return out as unknown as T;
    }

    return value;
}

/**
 * Mixes own enumerable properties from sources into target.
 *
 * Special-cases ES classes: when a source is a class (per `Is(s, 'class')`),
 * its prototype methods (excluding `constructor`) are copied onto
 * `target.prototype`, and a fresh instance's own keys are mirrored on
 * `target.prototype.__proto__`. This preserves the legacy AriannA pattern
 * for adding mixin classes to constructors.
 *
 * Returns the mutated target.
 *
 * @example
 *   Core.Assign(myObj, {a: 1}, {b: 2});                    // {a:1, b:2}
 *   Core.Assign(MyClass, MixinClass);                      // mixin install
 */
export function Assign<T extends object>(target: T, ...sources: unknown[]): T
{
    if (target === null || target === undefined) throw new TypeError('Cannot convert first argument to object');
    const to = Object(target) as Record<string, unknown>;

    for (const source of sources)
    {
        if (source === null || source === undefined) continue;

        if (typeof source === 'function' && Is(source, 'class'))
        {
            const ctor = source as new () => object;
            const targetCtor = target as unknown as { prototype?: Record<string, unknown> };
            if (!targetCtor.prototype) continue;

            for (const k of Object.getOwnPropertyNames(ctor.prototype))
            {
                if (k !== 'constructor')
                {
                    targetCtor.prototype[k] = (ctor.prototype as Record<string, unknown>)[k];
                }
            }

            try
            {
                const instance = new ctor() as Record<string, unknown>;
                const proto = Object.getPrototypeOf(targetCtor.prototype) as Record<string, unknown> | null;
                if (proto)
                {
                    for (const k of Object.getOwnPropertyNames(instance))
                    {
                        if (k !== 'constructor') proto[k] = instance[k];
                    }
                }
            }
            catch { /* class with required ctor args — skip instance copy */ }
            continue;
        }

        const src = Object(source) as Record<string, unknown>;
        for (const k of Object.keys(src))
        {
            const desc = Object.getOwnPropertyDescriptor(src, k);
            if (desc?.enumerable) to[k] = src[k];
        }
    }
    return target;
}

/**
 * Replaces an Element's outerHTML preserving its currently-attached event
 * listeners (when `Core.Events.GetListeners` is available).
 *
 * Note: replacement parses the input HTML; only single-root replacements
 * are supported. Returns the new node, or undefined if input was invalid.
 *
 * @example
 *   const next = Core.Replace(divEl, '<section>new</section>');
 */
export function Replace(target: Node | null | undefined, replacement: string | Node | null | undefined): Node | undefined
{
    if (!target || !(target instanceof Node) || !target.parentNode) return undefined;
    if (replacement === null || replacement === undefined) return undefined;

    let next: Node | null = null;
    if (typeof replacement === 'string')
    {
        const tpl = document.createElement('template');
        tpl.innerHTML = replacement;
        next = tpl.content.firstElementChild ?? tpl.content.firstChild;
    }
    else if (replacement instanceof Node)
    {
        next = replacement;
    }
    if (!next) return undefined;

    if (next.parentNode) next.parentNode.removeChild(next);
    target.parentNode.replaceChild(next, target);
    return next;
}

// ── Extends — runtime class extension utility ────────────────────────────────

/**
 * Mixin-style class extension: sets `Sub` to extend `Super` at runtime,
 * preserving `Sub`'s own prototype methods. Variadic: `Extends(A, B, C, D)`
 * makes A extend B, B extend C, C extend D in left-to-right pairs.
 *
 * Useful when classes are constructed dynamically and `extends` keyword
 * cannot be used. SSR-safe: bails out gracefully on non-class inputs.
 *
 * @example
 *   class A {}
 *   class B { foo() {} }
 *   Core.Extends(A, B);
 *   const a = new A();
 *   a.foo();                  // inherited from B
 *
 *   // Chain:
 *   Core.Extends(A, B, C);    // A -> B -> C
 */
export function Extends(...classes: unknown[]): unknown
{
    if (classes.length < 2) return classes[0];

    for (let i = 0; i < classes.length - 1; i++)
    {
        const Sub = classes[i];
        const Super = classes[i + 1];

        if (typeof Sub !== 'function' || typeof Super !== 'function') continue;
        const SubF = Sub as unknown as { prototype: object };
        const SuperF = Super as unknown as { prototype: object };
        if (!SubF.prototype || !SuperF.prototype) continue;

        // ── Cycle guard ──────────────────────────────────────────────────
        // setPrototypeOf throws "TypeError: can't set prototype: it would
        // cause a prototype chain cycle" when the target is already in the
        // source's chain — most commonly when Sub === Super (e.g.
        // ComponentFn calls Define(tag, base, base) → Extends(base, base)).
        // Skip any stitch that would close a cycle; do each independently.
        const wouldCycle = (child: object, parent: object): boolean =>
        {
            let p: object | null = parent;
            while (p)
            {
                if (p === child) return true;
                p = Object.getPrototypeOf(p);
            }
            return false;
        };

        try
        {
            if (SubF.prototype !== SuperF.prototype &&
                Object.getPrototypeOf(SubF.prototype) !== SuperF.prototype &&
                !wouldCycle(SubF.prototype, SuperF.prototype))
            {
                Object.setPrototypeOf(SubF.prototype, SuperF.prototype);
            }
            if ((SubF as object) !== (SuperF as object) &&
                Object.getPrototypeOf(SubF as object) !== (SuperF as object) &&
                !wouldCycle(SubF as object, SuperF as object))
            {
                Object.setPrototypeOf(SubF, SuperF);
            }

            // ── Function-Sub + registered-component Super (Extends.js parity) ──
            // When Sub is a plain FUNCTION (no `extends`) and Super is a
            // registered Custom (e.g. Core.Extends(A1o, Card1o)), the prototype
            // splices above are not enough: `new A1o()` would run A1o's body on
            // a plain object, so `this.innerHTML = …` throws "called on an
            // object that does not implement interface Element". Legacy
            // Extends.js (function-Sub branch) replaces window[Sub.name] with a
            // wrapper that (1) builds a real Super element, (2) applies Sub's
            // body on it ("the good old call"), (3) reprototypes. Mirror that
            // so `new A1o()` returns a live, body-applied element.
            const subIsClass   = /^class[\s{]/.test(Function.prototype.toString.call(Sub));
            const superTag     = GetTags(Super as Parameters<typeof GetTags>[0])[0];
            const win          = (typeof window !== 'undefined' ? window : globalThis) as Record<string, unknown>;
            if (!subIsClass && superTag)
            {
                const SubFn = Sub as (this: Element, ...a: unknown[]) => void;
                const subName = (Sub as { name?: string }).name || 'AriannaSub';
                const wrapper = function (this: unknown, ...args: unknown[]): Element | undefined
                {
                    const el = Create(superTag);            // real, upgraded Super element
                    if (!el) return undefined;
                    try { SubFn.apply(el, args); } catch { /* body best-effort */ }
                    const proto = (new.target ? (new.target as { prototype: object }).prototype
                                              : (wrapper as { prototype: object }).prototype);
                    return Object.setPrototypeOf(el, proto);
                };
                try { Object.defineProperty(wrapper, 'name', { value: subName }); } catch { /* frozen */ }
                wrapper.prototype = (Sub as { prototype: object }).prototype;
                (wrapper.prototype as { constructor: unknown }).constructor = wrapper;
                Object.setPrototypeOf(wrapper, Super as object);
                win[subName] = wrapper;                      // `new A1o()` resolves to this
                classes[i] = wrapper;                        // returned/threaded to caller
            }
        }
        catch { /* native built-ins may resist — skip */ }
    }
    return classes[0];
}

// ── Property — enhanced property descriptor ──────────────────────────────────

/**
 * Type marker for runtime validation in `Property`.
 * Either a built-in tag, or a custom predicate that returns true if the
 * value is acceptable.
 */
export type PropertyType =
    | 'string' | 'number' | 'boolean' | 'integer'
    | 'function' | 'object' | 'array' | 'any'
    | ((v: unknown) => boolean);

/**
 * Sync target for `bind` (two-way) or `bound` (one-way mirror).
 * - attribute(s) — DOM attribute(s) on the host element (or host.element)
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
 * Event emission settings for a Property.
 * Defaults: private internal EventTarget, cancelable changing, no propagation.
 */
export interface ObservableSpec
{
    target?         : EventTarget | null;
    propagation?    : boolean;
    cancelable?     : boolean;
    changingEvent?  : string;
    changedEvent?   : string;
}

/**
 * Constructor options for `Property`.
 *
 * @example
 *   new Core.Property('volume', {
 *     initial: 0, type: 'number',
 *     validate: v => v >= -120 && v <= 24,
 *     transform: v => Math.round(v * 10) / 10,
 *     bind: { attribute: 'data-volume' },
 *   }).install(host);
 */
export interface PropertyOptions
{
    initial?      : unknown;
    enumerable?   : boolean;
    configurable? : boolean;
    type?         : PropertyType;
    validate?     : (v: unknown) => boolean;
    transform?    : (v: unknown) => unknown;
    bind?         : BindSpec;
    bound?        : BindSpec;
    observable?   : ObservableSpec;
    silent?       : boolean;
}

export interface PropertyChangingDetail
{
    name     : string;
    oldValue : unknown;
    newValue : unknown;
    /** Set this in a listener to override the value being committed. */
    override?: unknown;
}

export interface PropertyChangedDetail
{
    name     : string;
    oldValue : unknown;
    newValue : unknown;
    bind     : BindSpec | undefined;
    bound    : BindSpec | undefined;
}

function _propertyMatchesType(v: unknown, t: PropertyType): boolean
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
 * Resolve the DOM element associated with a host object, if any.
 * Accepts an HTMLElement directly, or any Real-like wrapper that
 * exposes `.element` returning an HTMLElement.
 *
 * SSR-safe: returns null in environments without `HTMLElement`.
 */
function _propertyResolveDomElement(host: object): HTMLElement | null
{
    if (typeof HTMLElement === 'undefined') return null;
    if (host instanceof HTMLElement) return host;
    const wrapper = host as { element?: unknown };
    if (wrapper.element instanceof HTMLElement) return wrapper.element;
    return null;
}

/**
 * `Property` — enhanced JavaScript property descriptor.
 *
 * Wraps `Object.defineProperty` and adds:
 *   - runtime `type` validation (built-in tags + custom predicates)
 *   - `transform` to normalise incoming values
 *   - `bind` / `bound` two-way / one-way sync to attributes and sibling
 *     properties on the host (or its `.element` if it's a Real-like)
 *   - cancelable `${name}Changing` event (preventDefault aborts the set;
 *     listeners may override via `event.detail.override`)
 *   - post-set `${name}Changed` event with rich detail
 *
 * Install on a host with `descriptor.install(host)`. Reading host[name]
 * returns the current value; writing host[name] = x routes through all
 * the layers above.
 *
 * The class is the registry for runtime state (current value, listeners,
 * installed hosts), so multiple installs of the same Property mirror the
 * same value across hosts.
 *
 * @example
 *   const vol = new Core.Property('volume', {
 *       initial: 50,
 *       type: 'number',
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
    public  readonly opts : Readonly<PropertyOptions>;
    private _value        : T;
    private _hosts        : Set<object> = new Set();
    private _eventTarget  : EventTarget;
    private _changingEvt  : string;
    private _changedEvt   : string;
    private _silent       : boolean;

    constructor(name: string, options: PropertyOptions = {})
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
     * rejected (by type/validator/listener preventDefault).
     */
    set(value: T): boolean
    {
        const opts = this.opts;
        const old  = this._value;

        let next: T = value;
        if (opts.transform) next = opts.transform(next) as T;

        if (opts.type !== undefined && !_propertyMatchesType(next, opts.type)) return false;
        if (opts.validate && !opts.validate(next))                             return false;
        if (Object.is(old, next))                                              return true;

        if (!this._silent)
        {
            const detail: PropertyChangingDetail =
                { name: this.name, oldValue: old, newValue: next };
            const cancelable = opts.observable?.cancelable ?? true;
            const ev = new CustomEvent(this._changingEvt, {
                detail, cancelable,
                bubbles: opts.observable?.propagation ?? false,
            });
            const ok = this._eventTarget.dispatchEvent(ev);
            if (!ok && cancelable) return false;
            if (detail.override !== undefined) next = detail.override as T;
        }

        this._value = next;

        for (const host of this._hosts) this._sync(host, next);

        if (!this._silent)
        {
            const detail: PropertyChangedDetail = {
                name: this.name, oldValue: old, newValue: next,
                bind: opts.bind, bound: opts.bound,
            };
            const ev = new CustomEvent(this._changedEvt, {
                detail, cancelable: false,
                bubbles: opts.observable?.propagation ?? false,
            });
            this._eventTarget.dispatchEvent(ev);
        }
        return true;
    }

    /**
     * Install this Property as a real getter/setter on `host` via
     * `Object.defineProperty`. Multiple hosts share the same value.
     * Returns `this` for chaining.
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
    onChanging(cb: (detail: PropertyChangingDetail, ev: Event) => void): this
    {
        this._eventTarget.addEventListener(this._changingEvt, ((ev: Event) =>
        {
            cb((ev as CustomEvent<PropertyChangingDetail>).detail, ev);
        }) as EventListener);
        return this;
    }

    /** Subscribe to the post-set changed event. Chainable. */
    onChanged(cb: (detail: PropertyChangedDetail, ev: Event) => void): this
    {
        this._eventTarget.addEventListener(this._changedEvt, ((ev: Event) =>
        {
            cb((ev as CustomEvent<PropertyChangedDetail>).detail, ev);
        }) as EventListener);
        return this;
    }

    /** The internal EventTarget — for advanced subscription patterns. */
    get target(): EventTarget { return this._eventTarget; }

    private _sync(host: object, value: T): void
    {
        const dom = _propertyResolveDomElement(host);

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
                if (!Object.is(cur, value))
                {
                    (host as Record<string, unknown>)[p] = value;
                }
            }
        };
        apply(this.opts.bind);
        apply(this.opts.bound);
    }
}

// Forward declaration — _coreApi is assigned after the const block below.
// eslint-disable-next-line prefer-const
let _coreApi: ReturnType<typeof _buildCore>;

function _buildCore()
{
    return {
        version,
        Uuid             : uuid,
        GetPrototypeChain,
        SetDescriptors,
        Scopes,
        Namespaces,
        RegisterNamespace,
        GetDescriptor,
        GetType,
        GetConstructor,
        GetInterface,
        GetTags,
        GetNamespace,
        IndexCustom,
        IndexClass,
        Define,
        Create,
        IsUpgraded,
        Upgrade,
        UpgradeTree,
        Events,
        Observer,
        Property,
        // Helpers
        Is,
        Equals,
        Empty,
        Has,
        Clone,
        Assign,
        Replace,
        Extends,
        use,
        plugins,
        Root: typeof document !== 'undefined' ? document.documentElement : null,
    } as const;
}

// ── Core public API object ────────────────────────────────────────────────────

/**
 * The Core singleton — frozen after creation.
 *
 * Usage:
 *   import Core from './Core.ts';
 *   Core.GetDescriptor('div');
 *   Core.Define('my-btn', MyBtn, HTMLButtonElement);
 *   Core.Events.On(el, 'click', handler);
 *   Core.use(MyPlugin, { option: true });
 *   Core.version.string   // "1.0.0"
 *
 *   // Enhanced property descriptors:
 *   const vol = new Core.Property('volume', { type: 'number', initial: 50 });
 *   vol.install(myObject);
 *
 * Or (browser global):
 *   window.Core.version.string
 *   window.Core.plugins()   // ['router', ...]
 */
const Core = Object.freeze(_buildCore());

// Wire the forward reference so plugins installed during `use()` get the
// fully-frozen Core object, not a partially-constructed one.
_coreApi = Core;

// ── Window registration ───────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Core', {
        enumerable: true, configurable: false, writable: false, value: Core,
    });
}

export default Core;
