/**
 * @module    core/Namespace
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * # Namespace — distributed CustomElementRegistry of AriannA
 *
 * Unlike the W3C `CustomElementRegistry` (singleton, define-once, hardcoded
 * to 3 namespaces), AriannA's `Namespace` is an **instantiable class**:
 *
 *   const html   = new Namespace('html',   { URI: 'http://www.w3.org/1999/xhtml',     NS: false, ... });
 *   const svg    = new Namespace('svg',    { URI: 'http://www.w3.org/2000/svg',        NS: true,  ... });
 *   const mathML = new Namespace('mathML', { URI: 'http://www.w3.org/1998/Math/MathML', NS: true, ... });
 *   const x3d    = new Namespace('x3d',    { URI: 'http://www.web3d.org/...',          NS: true, ... });
 *
 * Each instance owns:
 *   - Standard.{Interfaces, Tags} — pre-registered native interfaces+tags
 *   - Custom.{Interfaces, Tags}   — user-defined custom elements (mutable)
 *   - Create(tag)                  — createElement vs createElementNS
 *   - Define(tag, ctor, base, css) — registers a new Custom descriptor
 *   - GetDescriptor(query)         — lookup by tag, ctor, or instance
 *   - Update(node)                 — called by Core.Observer on every upgrade
 *   - Initialize()                 — bootstrap: patches window.HTMLDivElement etc.
 *                                    so `class X extends HTMLDivElement` works
 *
 * # Why we don't (necessarily) use customElements
 *
 *   - customElements lockes you into 3 namespaces; we want any number
 *   - customElements.define is one-shot; we allow redefine, mutation, removal
 *   - customElements requires `extends:'div'` for native-extension; we patch
 *     the native constructors so `extends HTMLDivElement` works directly
 *   - customElements lifecycle (connectedCallback etc.) is browser-imposed;
 *     ours flows through Core.Observer which YOU control
 *   - customElements requires constructor body to be empty during super();
 *     ours allows arbitrary code (Component(this), .add(), .set(), etc.)
 *
 * # Update(node) — the heart of upgrade
 *
 * Core.Observer iterates m.addedNodes and, for each Element, calls
 * `descriptor.Update(node)` which delegates to `namespace.Update(node)`.
 * The Namespace.Update logic:
 *
 *   1. Find the matching descriptor (Standard or Custom) by node.tagName
 *   2. setPrototypeOf(node, descriptor.Constructor.prototype)
 *   3. setPrototypeOf(descriptor.Constructor.prototype, descriptor.Interface.prototype)
 *   4. If descriptor.Custom: optionally call Component(node) installer
 *   5. Run the user's constructor body bound to the node
 *
 * # Initialize() — native constructor patching
 *
 * Called once at boot for each Namespace. For every standard interface
 * (HTMLDivElement, HTMLInputElement, SVGCircleElement, ...) it:
 *
 *   1. Reads window[ifaceName] — the native browser constructor
 *   2. Wraps it in a function that, when invoked via `super()`, produces a
 *      real DOM element from THIS namespace (createElement / createElementNS)
 *      with the user's class prototype spliced in front
 *   3. Reinstalls the wrapper at window[ifaceName]
 *
 * This is what makes `class FormC extends HTMLDivElement { constructor() {
 * super(); ... } }` work without customElements.define.
 */

import Core, {
    type NamespaceDescriptor,
    type NamespaceFunctions,
    type TypeDescriptor,
} from './Core.ts';


// ─────────────────────────────────────────────────────────────────────────────
//  Options shape for the Namespace constructor
// ─────────────────────────────────────────────────────────────────────────────

export interface NamespaceOptions
{
    /** URI used by createElementNS when NS=true (e.g. 'http://www.w3.org/2000/svg'). */
    URI?      : string;
    /** When true, elements are created via createElementNS(URI, tag). When false, createElement(tag). */
    NS?       : boolean;
    /** Base native constructor (HTMLElement, SVGElement, MathMLElement, …). */
    base?     : new (...a: never[]) => Element;
    /** Pre-registered standard interfaces map: { HTMLDivElement: {Tags: ['div']}, … }. */
    Standard? : Record<string, { Tags: string[] }>;
    /** Schema URL for documentation purposes. */
    schema?   : string;
    /** Documentation URL (W3C spec etc.). */
    documentation?: { w3c?: string };
}


// ─────────────────────────────────────────────────────────────────────────────
//  CSS PascalCase → camelCase property mapping (Golem v1 pattern)
//
//  In Golem, Css.GetContents iterates `document.createElement("STYLE").style`
//  to enumerate every valid CSS property the browser supports, then matches
//  the user's PascalCase keys case-insensitively. The browser's
//  CSSStyleDeclaration is the authority for valid camelCase property names —
//  no regex, no custom mapping table that could go stale across browsers.
//
//  We do the same once at module load, caching the lowercase→camelCase map
//  in a Map for O(1) lookup. Subsequent applyInlineStyle calls reuse it.
// ─────────────────────────────────────────────────────────────────────────────

const _cssPropertyMap: Map<string, string> = (() => {
    const m = new Map<string, string>();
    if (typeof document === 'undefined') return m;
    try {
        const probe = document.createElement('style').style as unknown as Record<string, unknown>;
        for (const P in probe) {
            if (typeof P !== 'string') continue;
            // Skip numeric indexes ("0","1",...) and kebab-case mirrors ("background-color")
            if (P.indexOf('-') !== -1) continue;
            if (!isNaN(Number(P))) continue;
            m.set(P.toLowerCase(), P);
        }
    } catch { /* SSR / non-DOM environment */ }
    return m;
})();

/**
 * Apply a PascalCase rules object to a CSSStyleDeclaration via bracket notation,
 * using the browser's own camelCase property names (looked up case-insensitively).
 *
 * This mirrors Css.GetContents from Golem v1: no regex conversion, no kebab-case
 * computation — the browser does the kebab translation natively when we use the
 * camelCase property names it exposes on CSSStyleDeclaration.
 *
 * Example:
 *   applyRulesToStyle(el.style, { Background: 'red', FontWeight: '700', BorderRadius: '6px' });
 *   // Internally:
 *   //   el.style.background  = 'red'
 *   //   el.style.fontWeight  = '700'
 *   //   el.style.borderRadius = '6px'
 *   // The browser then materialises:
 *   //   <el style="background: red; font-weight: 700; border-radius: 6px">
 */
function applyRulesToStyle(
    style: CSSStyleDeclaration,
    rules: Record<string, string>,
): void
{
    if (!style || !rules) return;
    const styleRecord = style as unknown as Record<string, string>;
    for (const Key in rules) {
        if (!Object.prototype.hasOwnProperty.call(rules, Key)) continue;
        const value = rules[Key];
        if (typeof value !== 'string') continue;
        // Map: user's PascalCase key → browser's exact camelCase property name.
        const camel = _cssPropertyMap.get(Key.toLowerCase());
        if (!camel) continue;   // unknown property — silently skip (Golem v1 behaviour)
        try { styleRecord[camel] = value; }
        catch { /* setter refused (read-only / unsupported value) */ }
    }
}


// ─────────────────────────────────────────────────────────────────────────────
//  Fragile-interface proxy wrapper
//
//  Native HTML interfaces with C++ internal slots (HTMLInputElement.value,
//  HTMLCanvasElement.getContext, HTMLVideoElement.play, ...) can't be
//  prototype-spliced onto an HTMLUnknownElement — the slot setters/getters
//  throw "Illegal invocation". The W3C answer was the `is="..."` attribute,
//  which we refuse to use because it leaks implementation into markup.
//
//  Our answer: compose. The outer element is a real custom tag
//  (<custom-input-class>, HTMLUnknownElement, no `is=`). Inside it lives a
//  real `<input>` (or <select>, <canvas>, ...) that handles all the native
//  semantics. We then install property descriptors on the outer element
//  that delegate to the inner — so inst.value, inst.focus(), inst.checked
//  all work just like on a real <input>.
//
//  The inner element lives in an open shadow root by default so user CSS on
//  the outer element doesn't bleed into it unexpectedly. Users can override
//  via .shadow('closed') before any rendering happens.
// ─────────────────────────────────────────────────────────────────────────────

interface FragileSpec {
    tag     : string;
    props   : readonly string[];
    methods : readonly string[];
}

const _FRAGILE_INNER = new WeakMap<Element, Element>();

function _installFragileProxy(outer: Element, spec: FragileSpec): void
{
    if (_FRAGILE_INNER.has(outer)) return;   // idempotent

    // Create the real native inner element (real <input>, <select>, ...)
    const inner = document.createElement(spec.tag);
    _FRAGILE_INNER.set(outer, inner);

    // Attach an open shadow root by default — keeps inner styling isolated.
    // The user can call outer.shadow('closed') BEFORE the first DOM insert
    // to choose closed mode; after that the choice is locked by the browser.
    let root: ShadowRoot | Element = outer;
    try {
        if (typeof (outer as HTMLElement).attachShadow === 'function') {
            root = (outer as HTMLElement).attachShadow({ mode: 'open' });
        }
    } catch { /* element type rejects shadow — fall back to direct append */ }
    (root as ShadowRoot | Element).appendChild(inner);

    // Install property descriptors on the outer element that forward to the
    // inner. Getters return the native value; setters write through; methods
    // are bound delegates. Each descriptor is configurable so user code or
    // a future plugin can replace it if needed.
    for (const prop of spec.props)
    {
        try {
            Object.defineProperty(outer, prop, {
                configurable: true,
                enumerable  : true,
                get() { return (inner as unknown as Record<string, unknown>)[prop]; },
                set(value: unknown) { (inner as unknown as Record<string, unknown>)[prop] = value; },
            });
        } catch { /* property is non-configurable on outer prototype — skip */ }
    }

    for (const method of spec.methods)
    {
        try {
            Object.defineProperty(outer, method, {
                configurable: true,
                writable    : true,
                value(...args: unknown[]) {
                    const fn = (inner as unknown as Record<string, unknown>)[method];
                    if (typeof fn === 'function') {
                        return (fn as (...a: unknown[]) => unknown).apply(inner, args);
                    }
                },
            });
        } catch { /* method already defined non-configurably — skip */ }
    }

    // Forward common HTML attributes set on the outer element to the inner one,
    // so `<custom-input-class type="checkbox" value="x">` in markup works.
    // We do this once on install (for attributes already present) and via a
    // local MutationObserver (so later setAttribute calls propagate too).
    const forwardAttrs = ['type','name','value','placeholder','disabled','required',
                          'readonly','min','max','step','pattern','checked',
                          'multiple','accept','src','alt','autocomplete','autofocus',
                          'rows','cols','wrap','size','maxlength','minlength'];
    for (const a of forwardAttrs) {
        if (outer.hasAttribute(a)) {
            try { inner.setAttribute(a, outer.getAttribute(a) ?? ''); } catch { /* */ }
        }
    }
    try {
        const mo = new MutationObserver(records => {
            for (const r of records) {
                if (r.type !== 'attributes' || !r.attributeName) continue;
                const n = r.attributeName;
                if (!forwardAttrs.includes(n)) continue;
                const v = outer.getAttribute(n);
                if (v === null) inner.removeAttribute(n);
                else            inner.setAttribute(n, v);
            }
        });
        mo.observe(outer, { attributes: true, attributeFilter: forwardAttrs });
    } catch { /* MutationObserver unavailable */ }

    // .shadow('open' | 'closed') — explicit shadow-mode opt-in helper.
    // Re-attaching a shadow root is only possible if one isn't already on the
    // element, so this is most useful when the user calls it BEFORE the proxy
    // installs. We expose it idempotently anyway.
    try {
        Object.defineProperty(outer, 'shadow', {
            configurable: true,
            writable    : false,
            value(this: Element, mode: 'open' | 'closed' = 'open') {
                if ((this as HTMLElement).shadowRoot) return (this as HTMLElement).shadowRoot;
                try { return (this as HTMLElement).attachShadow({ mode }); }
                catch { return null; }
            },
        });
    } catch { /* shadow already defined elsewhere */ }
}


// ─────────────────────────────────────────────────────────────────────────────
//  Fragile-interface specification map (module-level)
//
//  IDL properties and methods to forward from the outer custom-tag element
//  to the inner real native element. Both Namespace.Define (factory path)
//  and Namespace.Update (Observer / Core.Create path) consult this table.
//
//  Sourced from the W3C HTML Living Standard IDL definitions.
// ─────────────────────────────────────────────────────────────────────────────

const _FRAGILE_PROXY_SPEC: Record<string, FragileSpec> = {
    HTMLInputElement: {
        tag    : 'input',
        props  : ['value','defaultValue','checked','defaultChecked','indeterminate',
                  'type','name','placeholder','disabled','readOnly','required',
                  'min','max','step','pattern','maxLength','minLength','size',
                  'autocomplete','autofocus','multiple','accept','src','alt',
                  'form','formAction','formMethod','formNoValidate','formTarget',
                  'list','files','valueAsDate','valueAsNumber',
                  'selectionStart','selectionEnd','selectionDirection',
                  'validity','validationMessage','willValidate'],
        methods: ['focus','blur','select','setSelectionRange','setRangeText',
                  'click','stepUp','stepDown','checkValidity','reportValidity',
                  'setCustomValidity'],
    },
    HTMLSelectElement: {
        tag    : 'select',
        props  : ['value','selectedIndex','selectedOptions','options','length',
                  'name','disabled','required','multiple','size','form',
                  'autocomplete','autofocus','validity','validationMessage','willValidate'],
        methods: ['add','remove','item','namedItem','focus','blur',
                  'checkValidity','reportValidity','setCustomValidity'],
    },
    HTMLTextAreaElement: {
        tag    : 'textarea',
        props  : ['value','defaultValue','textLength','placeholder','disabled',
                  'readOnly','required','rows','cols','wrap','maxLength','minLength',
                  'name','autocomplete','autofocus','form',
                  'selectionStart','selectionEnd','selectionDirection',
                  'validity','validationMessage','willValidate'],
        methods: ['focus','blur','select','setSelectionRange','setRangeText',
                  'checkValidity','reportValidity','setCustomValidity'],
    },
    HTMLOptionElement: {
        tag    : 'option',
        props  : ['value','text','label','selected','defaultSelected','disabled',
                  'index','form'],
        methods: [],
    },
    HTMLCanvasElement: {
        tag    : 'canvas',
        props  : ['width','height'],
        methods: ['getContext','toDataURL','toBlob','captureStream','transferControlToOffscreen'],
    },
    HTMLImageElement: {
        tag    : 'img',
        props  : ['src','srcset','sizes','alt','width','height','naturalWidth',
                  'naturalHeight','complete','currentSrc','loading','decoding',
                  'crossOrigin','referrerPolicy','useMap','isMap'],
        methods: ['decode'],
    },
    HTMLVideoElement: {
        tag    : 'video',
        props  : ['src','currentSrc','currentTime','duration','paused','ended',
                  'playbackRate','volume','muted','autoplay','loop','controls',
                  'poster','width','height','videoWidth','videoHeight',
                  'readyState','networkState','buffered','seekable','played',
                  'crossOrigin','preload','playsInline'],
        methods: ['play','pause','load','canPlayType','addTextTrack',
                  'requestPictureInPicture','requestVideoFrameCallback'],
    },
    HTMLAudioElement: {
        tag    : 'audio',
        props  : ['src','currentSrc','currentTime','duration','paused','ended',
                  'playbackRate','volume','muted','autoplay','loop','controls',
                  'readyState','networkState','buffered','seekable','played',
                  'crossOrigin','preload'],
        methods: ['play','pause','load','canPlayType','addTextTrack'],
    },
    HTMLMediaElement: {
        tag    : 'video',   // fallback — abstract base
        props  : ['src','currentSrc','currentTime','duration','paused','ended',
                  'playbackRate','volume','muted','readyState','networkState'],
        methods: ['play','pause','load','canPlayType'],
    },
    HTMLIFrameElement: {
        tag    : 'iframe',
        props  : ['src','srcdoc','name','sandbox','allow','allowFullscreen',
                  'width','height','referrerPolicy','loading',
                  'contentDocument','contentWindow'],
        methods: ['getSVGDocument'],
    },
    HTMLProgressElement: {
        tag    : 'progress',
        props  : ['value','max','position','labels'],
        methods: [],
    },
    HTMLMeterElement: {
        tag    : 'meter',
        props  : ['value','min','max','low','high','optimum','labels'],
        methods: [],
    },
};


// ─────────────────────────────────────────────────────────────────────────────
//  Internal helper: stub for a TypeDescriptor before init() back-fills it
// ─────────────────────────────────────────────────────────────────────────────

function _stubDescriptor(name: string, tags: string[]): TypeDescriptor
{
    return {
        Name        : name,
        Tags        : tags,
        Namespace   : null as unknown as NamespaceDescriptor,
        Constructor : null,
        Interface   : null,
        Prototype   : null,
        Supported   : false,
        Defined     : false,
        Declaration : 'FUNCTION',
        Type        : 'STANDARD',
        Standard    : true,
        Custom      : false,
        Style       : {},
    };
}


// ─────────────────────────────────────────────────────────────────────────────
//  class Namespace — instantiable, mutable, plural
// ─────────────────────────────────────────────────────────────────────────────

/** Marker symbol — set on patched native constructors to avoid double-patching. */
const PATCHED_FLAG = Symbol.for('arianna.native.patched');

export class Namespace
{
    /** Short identifier — 'html', 'svg', 'mathML', 'x3d', 'latex', … */
    readonly Name: string;

    /** Schema/URI string used by createElementNS (and for docs). */
    readonly URI: string;

    /** True → use createElementNS; false → use createElement. */
    readonly NS: boolean;

    /** Root native constructor of this namespace (HTMLElement, SVGElement, …). */
    readonly base: new (...a: never[]) => Element;

    /** Live registry (Standard interfaces + tags, Custom interfaces + tags). */
    readonly Standard: { Interfaces: Record<string, TypeDescriptor>; Tags: Record<string, TypeDescriptor> };
    readonly Custom  : { Interfaces: Record<string, TypeDescriptor>; Tags: Record<string, TypeDescriptor> };

    /** Schema URL (e.g. 'http://www.w3.org/1999/xhtml'). */
    readonly schema: string;

    /** Documentation pointers. */
    readonly documentation: { w3c?: string };

    /** State flags (kept for legacy compatibility). */
    readonly enabled  = true;
    readonly disabled = false;
    readonly state    = 'enabled' as const;

    /** Mirrors of Standard.Tags + Custom.Tags for fast lookup. */
    readonly tags: Record<string, TypeDescriptor> = {};

    /** True after Initialize() has run. */
    private _initialized = false;


    constructor(name: string, options: NamespaceOptions = {})
    {
        this.Name           = name;
        this.URI            = options.URI    ?? '';
        this.NS             = options.NS     ?? false;
        this.base           = options.base   ?? HTMLElement;
        this.schema         = options.schema ?? options.URI ?? '';
        this.documentation  = options.documentation ?? {};

        // Build standard interfaces as live TypeDescriptor stubs
        const stdInterfaces: Record<string, TypeDescriptor> = {};
        if (options.Standard) {
            for (const ifaceName of Object.keys(options.Standard)) {
                const tags = options.Standard[ifaceName].Tags ?? [];
                stdInterfaces[ifaceName] = _stubDescriptor(ifaceName, tags);
            }
        }

        this.Standard = { Interfaces: stdInterfaces, Tags: {} };
        this.Custom   = { Interfaces: {},            Tags: {} };
    }


    // ── Create —————————————————————————————————————————————————————————————
    //
    // Produces a fresh DOM element belonging to this namespace.
    // Accepts a tag string, or a constructor (resolved via GetDescriptor).

    /**
     * Create an upgraded element for a tag. Single entry-point used by Real,
     * Virtual, Core.Create, and any other instantiation path.
     *
     * Three code paths, all standards-compliant JS:
     *
     *   1. **Custom CLASS** (e.g. `class FormC extends HTMLDivElement {...}`)
     *      → `Reflect.construct(ctor, args, ctor)`. JS runs the user's class
     *        body natively. `super()` ends up in the patched native (which we
     *        installed via _patchNative) — it creates a real DOM element with
     *        the correct tag and namespace, splices the user prototype, and
     *        returns it. The body then runs with `this = element`. No regex,
     *        no Function-string evaluation.
     *
     *   2. **Custom FUNCTION** (e.g. `function FormA() { this.style.x = … }`)
     *      → createElement / createElementNS + Update(el). Update applies the
     *        prototype splice, the default CSS, and the FUNCTION body via
     *        `ctor.call(el)` (legal because FUNCTIONs can be invoked without
     *        `new` — unlike class constructors).
     *
     *   3. **Standard tag** (e.g. 'div', 'svg')
     *      → plain createElement / createElementNS. No upgrade needed.
     *
     * For SVG / MathML / X3D custom tags the wire-level nodeName is the
     * BASE tag (e.g. 'svg' for SVGSVGElement), not the custom tag — because
     * the browser layout engine only renders nodes whose nodeName is in the
     * recognised W3C tag set for that namespace. The custom prototype is
     * still spliced on, preserving identity.
     *
     * @param tag   string tag name OR a constructor (resolved to its tag)
     * @param args  optional constructor arguments forwarded to Reflect.construct
     */
    Create(
        tag : string | (new () => Element),
        args: unknown[] = [],
    ): Element | false
    {
        let t: string | undefined;
        let desc: TypeDescriptor | false = false;

        if (typeof tag === 'string') {
            t = tag.toLowerCase();
            desc = this.GetDescriptor(t);
        } else if (typeof tag === 'function') {
            desc = this.GetDescriptor(tag);
            if (desc && desc.Tags && desc.Tags[0]) t = desc.Tags[0];
            else {
                const g = Core.GetDescriptor(tag);
                if (g && g.Tags && g.Tags[0]) { t = g.Tags[0]; desc = g; }
            }
        }

        if (!t) return false;

        // ── Path 1: Custom CLASS — Reflect.construct ─────────────────────────
        if (desc && desc.Custom && desc.Declaration === 'CLASS' && desc.Constructor) {
            try {
                const ctor = desc.Constructor as unknown as new (...a: unknown[]) => Element;
                const el   = Reflect.construct(ctor, args, ctor);
                // Mark upgraded so Observer / markup-Update is a no-op when
                // this element later enters the DOM (factory path already did
                // the work natively via super → patched).
                (el as Element & { __ariannaUpgraded?: boolean }).__ariannaUpgraded = true;
                return el;
            } catch (e) {
                console.warn(`[arianna] Reflect.construct failed for <${t}>:`, e);
                // fall through to the FUNCTION/plain path
            }
        }

        // ── Path 2/3: createElement (custom or native) + maybe Update ────────
        //
        // For SVG / MathML / X3D customs, swap the wire-level tag to the base
        // interface tag (e.g. 'svg') so the layout engine renders it.
        let wireTag = t;
        if (this.NS && desc && desc.Custom && desc.Interface) {
            const baseDesc = this.Standard.Interfaces[(desc.Interface as { name?: string }).name ?? ''];
            const baseTag = (baseDesc as { Tags?: string[] } | undefined)?.Tags?.[0];
            if (baseTag) wireTag = baseTag;
        }

        const el = this.NS && this.URI
            ? document.createElementNS(this.URI, wireTag) as unknown as Element
            : document.createElement(wireTag);

        // For custom tags (FUNCTION-form here, since CLASS is handled above),
        // synchronously run the upgrade — Update applies prototype splice,
        // style, runs FUNCTION body, installs Component, fires build().
        if (desc && desc.Custom) {
            try { this.Update(el, desc); }
            catch (e) { console.warn(`[arianna] Update failed for <${t}>:`, e); }
        }

        return el;
    }


    // ── GetDescriptor ——————————————————————————————————————————————————————
    //
    // Resolve a descriptor by tag string, by constructor, or by Element instance.

    GetDescriptor(query: string | (new () => Element) | Element): TypeDescriptor | false
    {
        if (!query) return false;

        let key: string;

        if (typeof query === 'string') {
            key = query.toLowerCase();
        } else if (query instanceof Node) {
            key = (query as Element).tagName?.toLowerCase() ?? '';
        } else if (typeof query === 'function') {
            const nameKey = (query as { name?: string }).name?.toLowerCase() ?? '';
            // Search Custom interfaces by name first (most common case for app code)
            for (const k of Object.keys(this.Custom.Interfaces)) {
                const d = this.Custom.Interfaces[k];
                if (k.toLowerCase() === nameKey ||
                    d.Constructor === query ||
                    d.Interface   === query)
                    return d;
            }
            for (const k of Object.keys(this.Standard.Interfaces)) {
                const d = this.Standard.Interfaces[k];
                if (k.toLowerCase() === nameKey ||
                    d.Constructor === query ||
                    d.Interface   === query)
                    return d;
            }
            return false;
        } else {
            return false;
        }

        return this.Standard.Tags[key]
            ?? this.Custom.Tags[key]
            ?? this.Standard.Interfaces[key]
            ?? this.Custom.Interfaces[key]
            ?? false;
    }


    // ── Define ——————————————————————————————————————————————————————————————
    //
    // Registers a new Custom descriptor in this namespace. Builds the same
    // descriptor shape the legacy Component.js produced (Component.js #5715).
    //
    // ── Define ————————————————————————————————————————————————————————————
    //
    // Signature: Define(tag, ctor, baseInterface?, style?)
    //   - tag:           lowercase string (e.g. 'custom-class')
    //   - ctor:          user constructor (class or function)
    //   - baseInterface: native interface this extends (HTMLDivElement, …);
    //                    if omitted, defaults to this.base
    //   - style:         optional CSS style object (PascalCase keys allowed)
    //
    // Returns: the FACTORY — a `new`-able function that produces a real DOM
    //          element of the right kind, with the user's class prototype
    //          spliced in front, Component facilities installed (if requested),
    //          the user's constructor body executed, and build(opts) called.
    //
    // The factory uses the INTERFACE'S baseTag (e.g. 'input' for
    // HTMLInputElement) so the browser produces a real HTMLInputElement
    // (not HTMLUnknownElement), then setPrototypeOf splices the user class
    // in front while preserving the C++ internal slot.

    Define(
        tag           : string,
        ctor          : new (...a: never[]) => Element,
        baseInterface?: new (...a: never[]) => Element,
        style?        : Record<string, string>,
    ): new (...a: unknown[]) => Element
    {
        const _tag       = tag.toLowerCase();
        const _interface = baseInterface ?? this.base;
        const _style     = style ?? {};
        const isClass    = /^class[\s{]/.test(ctor.toString());

        // ── Cement the prototype chain: ctor → _interface ────────────────────
        // Core.Extends(Sub, Super) sets:
        //   Object.setPrototypeOf(Sub.prototype, Super.prototype)
        //   Object.setPrototypeOf(Sub, Super)
        // For CLASS-form constructors that DO use `extends Y` natively, this is
        // a no-op (JS has already done the setup). For FUNCTIONs and for
        // classes without `extends`, it stitches the interface in so that
        // instances inherit the native API.
        //
        // After this call, `Reflect.construct(ctor, [], ctor)` from
        // Namespace.Create will produce an element whose prototype chain
        // includes the native base interface — even if the user wrote
        // `class FormB { ... }` without an explicit `extends`.
        try { Core.Extends(ctor, _interface); }
        catch { /* base may be unextendable on some hosts */ }

        // Resolve base tag from interface descriptor (e.g. 'input' for HTMLInputElement)
        const ifaceDesc = this.Standard.Interfaces[_interface.name] ?? this.Custom.Interfaces[_interface.name];
        const _baseTag  = (ifaceDesc as { Tags?: string[] } | undefined)?.Tags?.[0] ?? _tag;
        const _useNS    = !!this.NS;
        const _URI      = this.URI;

        // Decide whether to auto-call Component(el) on construction.
        // Triggers: tag starts with 'arianna-', or ctor body calls Component(this)
        const ctorSrc        = ctor.toString();
        const wantsAutoComp  =
            _tag.startsWith('arianna-') ||
            (ctor as { __ariannaComponent?: boolean }).__ariannaComponent === true ||
            /\bComponent\s*\(\s*this\s*\)/.test(ctorSrc);

        // ── Native interfaces with INTERNAL SLOTS — proxy-wrapper strategy ─
        //
        // Some native HTML interfaces have C++ internal slots that the browser
        // checks when their property setters/getters run. HTMLInputElement.value,
        // HTMLSelectElement.options, HTMLCanvasElement.getContext, HTMLVideoElement.play,
        // etc. — these will throw "Illegal invocation" if called on a
        // prototype-spliced HTMLUnknownElement.
        //
        // AriannA solves this **without `is="..."`** by composing a real native
        // element inside a shadow root and installing property descriptors on
        // the outer custom-tag element that forward to the inner native. The
        // visible markup stays clean (<custom-input-class>), the user code
        // (inst.value = 'x') Just Works, and native semantics (form submission,
        // focus, etc.) are preserved because the inner element IS a real
        // <input> / <button> / <select> / ...
        //
        // FRAGILE_PROXY map lives at module level (_FRAGILE_PROXY_SPEC, below
        // _installFragileProxy) so both this factory and the Update method can
        // look up the same table without duplication.
        const fragileSpec = _FRAGILE_PROXY_SPEC[_interface.name];
        const isFragile   = !!fragileSpec;

        // ── Build the factory ─────────────────────────────────────────────
        const win = (typeof window !== 'undefined' ? window : globalThis) as unknown as
            { Component?: (el: Element) => Element };

        const _factory = function (this: unknown, ...args: unknown[]): Element
        {
            // Two paths, both **standards-compliant** JavaScript — no regex,
            // no Function-string evaluation, no patched body execution.
            //
            //   FUNCTION form  (function FormA() { this.x = 1 })
            //     We create the element, then invoke the function on it with
            //     ctor.apply(el, args). The body runs with `this = el`.
            //
            //   CLASS form     (class FormD extends SVGSVGElement { constructor(){...} })
            //     We let JavaScript itself invoke the class via Reflect.construct.
            //     The user's `super()` call ends up in the patched native
            //     SVGSVGElement / HTMLDivElement / ... (set up by Initialize()
            //     in this Namespace) — which creates an element of the
            //     registered custom tag, splices the prototype, and returns it.
            //     The constructor body then runs with `this = that element`
            //     exactly as the class author intended.
            let el: Element;

            if (isClass) {
                // The patched native constructor (HTMLDivElement, SVGSVGElement
                // etc.) reads `this.constructor` to find the user's custom tag
                // in its Custom map. So Reflect.construct must pass the user's
                // constructor as newTarget (3rd arg) for that lookup to work.
                el = Reflect.construct(
                    ctor as unknown as new (...a: unknown[]) => Element,
                    args,
                    ctor as unknown as new (...a: unknown[]) => Element,
                );
            } else {
                // Function form — we own element creation
                el = _useNS && _URI
                    ? document.createElementNS(_URI, _tag)
                    : document.createElement(_tag);
                // splice the user prototype on
                try { Object.setPrototypeOf(el, (ctor as { prototype: object }).prototype); }
                catch { /* native non-extensible — fall through */ }
            }

            // For fragile native interfaces (HTMLInputElement, HTMLSelectElement,
            // HTMLCanvasElement, etc.), compose a real native element inside
            // the custom-tag and install property descriptors that forward to
            // it. Visible markup remains <custom-input-class> — no `is=` —
            // while inst.value, inst.checked, inst.focus(), etc. Just Work.
            if (isFragile) {
                _installFragileProxy(el, fragileSpec);
            }

            // Apply default _style inline using the Golem v1 pattern via
            // applyRulesToStyle(). The browser's CSSStyleDeclaration is the
            // source of truth for which PascalCase keys translate to which
            // camelCase property names. No regex, no custom mapping table.
            const applyInlineStyle = () => {
                if (!Object.keys(_style).length) return;
                const style = (el as HTMLElement).style;
                if (!style) return;
                applyRulesToStyle(style, _style);
            };
            applyInlineStyle();

            // Install Component facilities if requested. For CLASS form this is
            // ALREADY done by the class body itself if it calls Component(this);
            // calling it twice is harmless (Component(el) is idempotent on
            // re-install). For FUNCTION form we do it explicitly before
            // invoking the body so this.set / this.Sheet / ... are available.
            if (wantsAutoComp && typeof win.Component === 'function') {
                try { win.Component(el); }
                catch (e) { console.warn(`[arianna] Component(el) failed for <${_tag}>:`, e); }
            }

            // Run user's constructor body for FUNCTION form. CLASS form already
            // ran the body inside Reflect.construct above.
            if (!isClass) {
                try { (ctor as unknown as (this: Element, ...a: unknown[]) => void).apply(el, args); }
                catch (e) { console.warn(`[arianna] ${_tag} FUNCTION body failed:`, e); }
            }

            // Re-apply style AFTER body, idempotent — restores anything the
            // body may have accidentally cleared.
            applyInlineStyle();

            // Mark as upgraded so markup-upgrade path (Update) doesn't re-run
            // the body when the same factory-instantiated element is appended
            // to the DOM (which fires Core.Observer.addedNodes → ns.Update).
            (el as Element & { __ariannaUpgraded?: boolean }).__ariannaUpgraded = true;

            // M2 Step 1 — call build(opts) ONCE if user defined it
            if (wantsAutoComp) {
                const stash = el as Element & { __isBuilt?: boolean };
                if (!stash.__isBuilt) {
                    stash.__isBuilt = true;
                    const userBuild = (el as unknown as { build?: (...a: unknown[]) => void }).build;
                    if (typeof userBuild === 'function') {
                        try { userBuild.apply(el, args); }
                        catch (e) { console.warn(`[arianna] build() threw for <${_tag}>:`, e); }
                    }
                }
            }

            return el;
        } as unknown as new (...a: unknown[]) => Element;

        // Factory name for devtools
        try { Object.defineProperty(_factory, 'name', { value: ctor.name }); } catch { /* may resist */ }

        // Splice prototype chains: factory.prototype → interface.prototype
        Object.setPrototypeOf(_factory, _interface);
        Object.setPrototypeOf(
            (_factory as { prototype: object }).prototype,
            (_interface as { prototype: object }).prototype,
        );
        (_factory as { prototype: { constructor?: unknown } }).prototype.constructor = _factory;

        // Reuse the legacy descriptor (shape with types.custom etc.) — other
        // modules expect descriptor.Namespace to have that shape, not the
        // PascalCase class instance.
        const legacyDesc = this.toDescriptor();

        const descriptor: TypeDescriptor = {
            Name        : ctor.name,
            Tags        : [_tag],
            Namespace   : legacyDesc,
            Constructor : ctor,
            Interface   : _interface,
            Prototype   : (_factory as { prototype: object }).prototype,
            Supported   : true,
            Defined     : true,
            Declaration : isClass ? 'CLASS' : 'FUNCTION',
            Type        : 'CUSTOM',
            Standard    : false,
            Custom      : true,
            Style       : _style,
            // Factory exposed on descriptor for advanced access
            Factory     : _factory,
            // Update is called by Core.Observer when an element is added to the
            // DOM via markup (NOT via new). It mirrors the factory's work.
            Update: (el: Element) => {
                // If element was already upgraded via the factory path
                // (`new MyFactory()`), skip — the body has already run, the
                // prototype is already spliced, build() has already fired.
                // Re-running here would duplicate the rendering.
                const tagged = el as Element & { __ariannaUpgraded?: boolean };
                if (tagged.__ariannaUpgraded) return;
                tagged.__ariannaUpgraded = true;

                Object.setPrototypeOf(el, (_factory as { prototype: object }).prototype);

                // Install the fragile proxy (inner native element + property
                // descriptors) for markup-instantiated elements too. Otherwise
                // `<custom-input-class>` written directly in HTML would have
                // a working prototype chain but a broken inst.value setter.
                if (isFragile) {
                    _installFragileProxy(el, fragileSpec);
                }

                // Apply inline style as a robust fallback (same as factory path).
                // Uses the Golem v1 pattern: applyRulesToStyle.
                if (Object.keys(_style).length > 0) {
                    const style = (el as HTMLElement).style;
                    if (style) applyRulesToStyle(style, _style);
                }

                if (wantsAutoComp && typeof win.Component === 'function') {
                    try { win.Component(el); }
                    catch (e) { console.warn(`[arianna] Component(el) on markup-upgrade failed for <${_tag}>:`, e); }
                }
                if (!isClass) {
                    // FUNCTION form — safely run the body with `this = el`
                    try { (ctor as unknown as (this: Element) => void).call(el); }
                    catch (e) { console.warn(`[arianna] FUNCTION body on markup-upgrade failed for <${_tag}>:`, e); }
                }
                // CLASS form on markup-upgrade: we CANNOT run the constructor
                // body — a class constructor can only be invoked with `new`,
                // and we already have the element from the HTML parser. Users
                // who want setup logic on markup-instantiated classes must put
                // it in `build()` (called below) rather than the constructor.

                // build() hook on markup upgrade too (with no args)
                if (wantsAutoComp) {
                    const stash = el as Element & { __isBuilt?: boolean };
                    if (!stash.__isBuilt) {
                        stash.__isBuilt = true;
                        const userBuild = (el as unknown as { build?: () => void }).build;
                        if (typeof userBuild === 'function') {
                            try { userBuild.call(el); }
                            catch (e) { console.warn(`[arianna] build() on markup-upgrade threw for <${_tag}>:`, e); }
                        }
                    }
                }
            },
        };

        this.Custom.Interfaces[ctor.name] = descriptor;
        this.Custom.Tags[_tag]            = descriptor;
        this.tags[_tag]                    = descriptor;

        // Apply default CSS as a stylesheet rule for the tag.
        //
        // Generates the rule text by applying _style to a probe
        // CSSStyleDeclaration (same Golem v1 pattern as applyRulesToStyle)
        // and reading back the browser-normalised cssText — which already
        // contains valid kebab-case property names. No regex.
        if (Object.keys(_style).length > 0) {
            try {
                const styleEl = document.createElement('style');
                const probe = document.createElement('style').style;
                applyRulesToStyle(probe, _style);
                const cssText = probe.cssText;   // → 'background: red; font-weight: 700; ...'
                // Dual selector: matches both <my-tag> (markup-instantiated,
                // HTMLUnknownElement) and <baseTag is="my-tag"> (factory-built).
                styleEl.textContent = `${_tag},[is="${_tag}"]{${cssText}}`;
                styleEl.setAttribute('data-arianna-tag-style', _tag);
                (document.head ?? document.documentElement).appendChild(styleEl);
            } catch { /* DOM not ready, skip */ }
        }

        // Fire 'arianna-wip:defined' for listeners
        if (typeof document !== 'undefined') {
            document.dispatchEvent(new CustomEvent('arianna-wip:defined', {
                detail: { tag: _tag, descriptor },
            }));
        }

        return _factory;
    }


    // ── Update ———————————————————————————————————————————————————————————
    //
    // Called by Core.Observer for every Element added to the DOM that this
    // namespace owns (matched via node.tagName). Performs:
    //
    //   1. Find the matching descriptor (Custom takes precedence over Standard)
    //   2. setPrototypeOf the node — element becomes an instance of the user class
    //   3. If Custom & Component(this) was in the body — auto-install facilities
    //   4. Run the user's constructor body bound to the element

    Update(node: Element, hint?: TypeDescriptor): void
    {
        if (!(node instanceof Element)) return;

        const desc = hint ?? this.GetDescriptor(node);
        if (!desc || !desc.Custom || !desc.Constructor) return;

        // ── REPOINT DESCRIPTOR TO MOST-DERIVED USER CLASS ─────────────────
        // Component(tag, Base, ...) registers an intermediate empty `Bound`
        // class in the descriptor. The actual user class (the one that
        // `extends Component(...)`) lives on global scope (window.<PascalCase>)
        // after the bundle exports it. Without this repoint, setPrototypeOf
        // below would splice Bound.prototype (empty) onto the node, losing
        // all user methods.
        //
        // This scan runs ONCE per tag (cached on desc.__userResolved). It
        // looks for a globally-exposed class whose prototype chain includes
        // the current descriptor.Constructor and walks down to the leaf.
        const cachedDesc = desc as TypeDescriptor & { __userResolved?: boolean };
        if (!cachedDesc.__userResolved) {
            cachedDesc.__userResolved = true;
            const win = (typeof window !== 'undefined' ? window : globalThis) as Record<string, unknown>;
            const currentCtor = desc.Constructor as Function;
            // Derive the PascalCase name from the tag: arianna-code-editor → CodeEditor
            const tag = desc.Tags[0] ?? '';
            const pretty = tag
                .replace(/^arianna-/, '')
                .replace(/-(.)/g, (_, c: string) => c.toUpperCase())
                .replace(/^./, c => c.toUpperCase());
            const candidate = win[pretty];
            if (typeof candidate === 'function' && candidate !== currentCtor) {
                // Verify it extends the current Bound (transitively)
                let proto = (candidate as Function).prototype;
                let extendsBound = false;
                while (proto && proto !== Object.prototype) {
                    if (proto === currentCtor.prototype) { extendsBound = true; break; }
                    proto = Object.getPrototypeOf(proto);
                }
                if (extendsBound) {
                    // Re-point: descriptor now refers to the user class
                    (desc as { Constructor: Function }).Constructor = candidate;
                    (desc as { Prototype: object }).Prototype      = (candidate as { prototype: object }).prototype;
                }
            }
        }

        // Idempotency guard — Core.Observer may call Update multiple times for
        // the same node (e.g. when it's moved between parents), and Core.Create
        // calls Update before returning. The factory path also marks the node;
        // skipping here keeps body / build / proxy install from running twice.
        const tagged = node as Element & { __ariannaUpgraded?: boolean };
        if (tagged.__ariannaUpgraded) return;
        tagged.__ariannaUpgraded = true;

        const ctor  = desc.Constructor;
        const iface = desc.Interface;
        if (!ctor || !iface) return;

        // Step 1: ensure prototype chain
        try {
            Object.setPrototypeOf(ctor.prototype, (iface as { prototype: object }).prototype);
            Object.setPrototypeOf(node, (ctor as { prototype: object }).prototype);
        } catch { /* setPrototypeOf can fail on some hosts */ }

        // Step 2: install the fragile-interface proxy wrapper if the user
        // extended HTMLInputElement, HTMLSelectElement, HTMLCanvasElement,
        // etc. — these have internal C++ slots that throw "Illegal invocation"
        // when their setters/getters are called on a prototype-spliced
        // HTMLUnknownElement. The proxy composes a real native element inside
        // a shadow root and forwards .value / .checked / .focus() / etc.
        //
        // FRAGILE_PROXY is defined inside Define() — we re-declare the
        // small lookup here so this Update path is self-contained.
        const ifaceName = (iface as { name?: string }).name ?? '';
        const spec      = _FRAGILE_PROXY_SPEC[ifaceName];
        if (spec) {
            try { _installFragileProxy(node, spec); }
            catch (e) { console.warn(`[arianna] fragile proxy install failed on <${desc.Tags[0]}>:`, e); }
        }

        // Step 3: apply default CSS inline (Golem v1 pattern)
        const styleRules = (desc.Style ?? {}) as Record<string, string>;
        if (Object.keys(styleRules).length > 0) {
            const style = (node as HTMLElement).style;
            if (style) applyRulesToStyle(style, styleRules);
        }

        // Step 4: optional Component(this) auto-install
        const win = (typeof window !== 'undefined' ? window : globalThis) as unknown as { Component?: (el: Element) => Element };
        const ctorSrc = (() => { try { return ctor.toString(); } catch { return ''; } })();
        const wantsAutoComponent =
            (desc.Tags[0]?.startsWith('arianna-') ?? false) ||
            (ctor as { __ariannaComponent?: boolean }).__ariannaComponent === true ||
            /\bComponent\s*\(\s*this\s*\)/.test(ctorSrc);

        if (wantsAutoComponent && typeof win.Component === 'function') {
            try { win.Component(node); }
            catch (e) { console.warn(`[arianna] Component(el) failed for <${desc.Tags[0]}>`, e); }
        }

        // Step 5: run the user's body for FUNCTION form only.
        // CLASS form CANNOT have its constructor body invoked here — class
        // constructors require `new`. Users who want setup logic on
        // markup-instantiated classes must put it in `build()` below.
        if (desc.Declaration === 'FUNCTION') {
            try { (ctor as unknown as (this: Element) => void).call(node); }
            catch (e) { console.warn(`[arianna] FUNCTION ctor body failed for <${desc.Tags[0]}>`, e); }
        }

        // Step 6: build() hook (once per element, guarded by __isBuilt)
        if (wantsAutoComponent) {
            const stash = node as Element & { __isBuilt?: boolean };
            if (!stash.__isBuilt) {
                const userBuild = (node as unknown as { build?: () => void }).build;
                if (typeof userBuild === 'function') {
                    stash.__isBuilt = true;
                    try { userBuild.call(node); }
                    catch (e) { console.warn(`[arianna] build() threw for <${desc.Tags[0]}>:`, e); }
                }
            }
        }

        // Step 7: render `this.template` via shadow DOM (default closed)
        //
        // The Component(...) convention is for build() to assign
        //     this.template = html`<div>...</div>`
        // which yields a Template (v3 reactive template) instance.
        //
        // Shadow DOM is closed by default. Components can opt-in to open
        // shadow via `def.shadow: 'open'` (useful for libraries that need
        // external CSS to reach in). Components that explicitly disable
        // shadow via `def.shadow: false` render into the light DOM and
        // forfeit slot semantics — they should not use <slot> in that case.
        //
        // The `template.attach(host, instance, signals)` call:
        //   - clones the parsed <template> content
        //   - applies all bindings (`:attr`, `@event`, `a-if`, etc.) with
        //     `this = instance` for expression evaluation
        //   - inserts into the shadow root (or host directly if light DOM)
        //   - relies on native `<slot>` projection — zero custom slot code
        const hostWithTpl = node as unknown as {
            template?: {
                attach?: (host: ParentNode, instance: object, signals?: Record<string, unknown>) => unknown;
                // Legacy v2 API — supported as fallback
                mount?:  (host: Element,    scope: unknown) => unknown;
            };
            __templateRendered?: boolean;
            __attrSignals?: Record<string, unknown>;
            shadowRoot?: ShadowRoot | null;
            attachShadow?: (init: ShadowRootInit) => ShadowRoot;
        };

        if (hostWithTpl.template && !hostWithTpl.__templateRendered)
        {
            hostWithTpl.__templateRendered = true;

            // Retrieve def from the constructor (set by Component factory).
            // After descriptor repoint, ctor is the user class (e.g. _Splitter);
            // __ariannaDef is inherited via static prototype chain from Bound.
            const ctorWithDef = ctor as unknown as { __ariannaDef?: Record<string, unknown> };
            const def = ctorWithDef.__ariannaDef ?? {};

            // Determine shadow mode. Default: closed.
            const defShadow = def.shadow;
            let shadowMode: 'open' | 'closed' | false;
            if (defShadow === false)        shadowMode = false;
            else if (defShadow === 'open')  shadowMode = 'open';
            else if (defShadow === 'closed' || defShadow === undefined || defShadow === true) shadowMode = 'closed';
            else shadowMode = 'closed';

            // Find or create the render target.
            let renderTarget: ParentNode = node;
            if (shadowMode !== false) {
                if (!hostWithTpl.shadowRoot) {
                    try {
                        const sr = (node as unknown as { attachShadow: (init: ShadowRootInit) => ShadowRoot })
                            .attachShadow({ mode: shadowMode });
                        renderTarget = sr;
                    } catch (e) {
                        // attachShadow can fail for elements that don't support it
                        // (e.g. <img>, customized built-ins on certain interfaces).
                        // Fall back to light DOM.
                        console.warn(`[arianna] attachShadow failed for <${desc.Tags[0]}>, falling back to light DOM:`, e);
                        renderTarget = node;
                    }
                } else {
                    renderTarget = hostWithTpl.shadowRoot;
                }
            }

            const signals = hostWithTpl.__attrSignals ?? {};

            try {
                if (typeof hostWithTpl.template.attach === 'function') {
                    // v3 API
                    hostWithTpl.template.attach(renderTarget, node, signals);
                } else if (typeof hostWithTpl.template.mount === 'function') {
                    // v2 legacy fallback
                    hostWithTpl.template.mount(renderTarget as Element, node);
                }
            } catch (e) {
                console.warn(`[arianna] template render failed for <${desc.Tags[0]}>:`, e);
            }
        }
    }


    // ── Initialize ———————————————————————————————————————————————————————
    //
    // Patches every standard native constructor (window.HTMLDivElement, etc.)
    // so that `class X extends HTMLDivElement { constructor() { super(); } }`
    // works without customElements.define.
    //
    // After Initialize:
    //   - super() in the user class calls our wrapped factory
    //   - the factory creates an element via this.Create(tagOfBase)
    //   - returns it with `this.constructor.prototype` set
    //   - the user's body runs with `this = real DOM element`

    Initialize(): void
    {
        if (this._initialized) return;
        this._initialized = true;
        if (typeof window === 'undefined') return;

        // The legacy NamespaceDescriptor that Component.ts and Real.ts expect
        // when they walk descriptor.Namespace.types.custom etc. We build it
        // ONCE here and reuse it for every standard interface back-fill.
        const legacyDesc = this.toDescriptor();

        const win = window as unknown as Record<string, unknown>;

        for (const ifaceName of Object.keys(this.Standard.Interfaces))
        {
            const descriptor = this.Standard.Interfaces[ifaceName];
            const native     = win[ifaceName] as (new () => Element) | undefined;

            // Back-fill the descriptor with real native references
            if (native && typeof native === 'function') {
                descriptor.Supported   = true;
                descriptor.Defined     = true;
                descriptor.Constructor = native;
                descriptor.Interface   = native;
                descriptor.Prototype   = (native as { prototype: object }).prototype;
                descriptor.Namespace   = legacyDesc;
            }

            // Index the tag-side of the registry
            for (const tag of descriptor.Tags) {
                this.Standard.Tags[tag] = descriptor;
                this.tags[tag]           = descriptor;
            }

            // Patch the native constructor (idempotent)
            if (native && typeof native === 'function' &&
                !(native as { [PATCHED_FLAG]?: boolean })[PATCHED_FLAG])
            {
                this._patchNative(ifaceName, descriptor);
            }
        }
    }


    // ── _patchNative ———————————————————————————————————————————————————————
    //
    // Wraps a native constructor (e.g. window.HTMLDivElement) so that calling
    // it via super() from a subclass produces a real DOM element of the
    // correct kind. The wrapper:
    //
    //   1. Checks `this.constructor` (the user's class, e.g. FormC)
    //   2. If user class has a registered Custom descriptor with a tag,
    //      creates an element of THAT tag (so <form-c> becomes a real <div>
    //      wrapped as <form-c>); else creates one of the base tag (e.g. 'div')
    //   3. setPrototypeOf(el, this.constructor.prototype) — splices user class
    //   4. Returns el — JavaScript's `new` makes it `this` for the user body
    //
    // Bound to the namespace via arrow + closure so `this` resolution and the
    // URI / NS settings come from THIS namespace instance.

    private _patchNative(ifaceName: string, descriptor: TypeDescriptor): void
    {
        const win = window as unknown as Record<string, unknown>;
        const native = win[ifaceName] as (new () => Element);
        const nativeProto = (native as { prototype: object }).prototype;

        // The base tag for this interface (e.g. 'div' for HTMLDivElement)
        const baseTag = descriptor.Tags[0];
        if (!baseTag) return;

        // Capture our namespace's URI/NS in the closure
        const useNS = this.NS;
        const URI   = this.URI;
        const self  = this;

        const wrapped = function (this: Element): Element {
            // 1. Figure out what tag to actually create
            //    - If the user class is a registered Custom in this NS, use its tag
            //    - Otherwise, use the native interface's base tag
            //
            // EXCEPTION for non-HTML namespaces (SVG / MathML / X3D): the browser
            // layout engine only renders elements whose nodeName is in the W3C-
            // recognised tag set for that namespace. <form-d> inside SVG namespace
            // is not renderable — must be <svg>. So for those namespaces we use
            // the BASE tag (e.g. 'svg' for SVGSVGElement) regardless of the custom
            // tag registered. The custom prototype is still spliced on so the
            // class identity is preserved.
            let tagToCreate = baseTag;
            let userProto: object = nativeProto;
            try {
                const userCtor = this.constructor as { name?: string; prototype?: object };
                if (userCtor && userCtor !== (wrapped as unknown as { constructor: unknown })) {
                    const custom = self.GetDescriptor(userCtor as new () => Element);
                    if (custom && custom.Custom && custom.Tags && custom.Tags[0]) {
                        // Only use the custom tag as nodeName for HTML namespace.
                        // SVG/MathML/X3D need the native base tag for the engine
                        // to actually render the element.
                        if (!useNS) {
                            tagToCreate = custom.Tags[0];
                        }
                    }
                    if (userCtor.prototype) userProto = userCtor.prototype;
                }
            } catch { /* fall through to base */ }

            // 2. Create the element with the correct namespace
            const el = useNS && URI
                ? document.createElementNS(URI, tagToCreate) as unknown as Element
                : document.createElement(tagToCreate);

            // 3. Splice the user prototype onto the element
            return Object.setPrototypeOf(el, userProto);
        };

        Object.defineProperty(wrapped, 'name', { value: ifaceName });
        (wrapped as unknown as { prototype: object }).prototype             = nativeProto;
        (wrapped as unknown as { prototype: { constructor?: unknown } }).prototype.constructor = wrapped;
        (wrapped as unknown as { [PATCHED_FLAG]: boolean })[PATCHED_FLAG]  = true;

        try {
            Object.defineProperty(window, ifaceName, {
                value: wrapped, writable: true, configurable: true, enumerable: true,
            });
        } catch {
            try { win[ifaceName] = wrapped; }
            catch (e2) { console.warn('[arianna] could not patch', ifaceName, e2); }
        }
    }


    // ── toDescriptor —————————————————————————————————————————————————————
    //
    // Returns the legacy `NamespaceDescriptor` shape (lowercase 'types',
    // 'functions') that Core.GetDescriptor and other modules expect.
    // We keep the modern PascalCase API (Standard, Custom, Create, Define,
    // Update, Initialize) while exposing the legacy view via this method.

    toDescriptor(): NamespaceDescriptor
    {
        const self = this;
        const functions: NamespaceFunctions = {
            create: (tag) => self.Create(tag as never) || false,
            patch : () => { /* covered by Initialize() */ },
        };
        const desc = {
            name          : this.Name,
            schema        : this.schema,
            state         : this.state,
            enabled       : this.enabled,
            disabled      : this.disabled,
            base          : this.base,
            tags          : this.tags,
            types         : {
                standard : { interfaces: this.Standard.Interfaces, tags: this.Standard.Tags },
                custom   : { interfaces: this.Custom.Interfaces,   tags: this.Custom.Tags },
            },
            functions     : functions,
            documentation : this.documentation,
            // Modern hook — Core.Observer reads d.Namespace.Update when calling
            // upgrade. This bridges from the legacy descriptor shape to the
            // class-instance API. Bound so `this` resolution always reaches
            // the Namespace instance.
            Update        : (node: Element, hint?: TypeDescriptor) => self.Update(node, hint),
            // ─── Define — bridge from descriptor to instance ───────────────
            // Core.Define reads `ns.Define` from the descriptor; we bind it
            // to the live Namespace instance so the factory-building logic
            // (which lives on the instance) gets invoked correctly.
            Define        : (
                tag: string,
                ctor: new (...a: never[]) => Element,
                baseInterface?: new (...a: never[]) => Element,
                style?: Record<string, string>,
            ) => self.Define(tag, ctor, baseInterface, style),
        };
        return desc as unknown as NamespaceDescriptor;
    }
}


// ─────────────────────────────────────────────────────────────────────────────
//  Build the four built-in namespaces
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
//  Standard.Interfaces tables — verbatim from the Golem v1 sources for HTML
//  and SVG namespaces. The structure matches the original
//  { Namespace, Tags, Supported } shape but stored compactly as `_Iface(Tags)`
//  since Namespace+Supported are auto-populated by Namespace.Initialize().
//
//  DO NOT add or remove entries based on guesswork — these tables come from
//  the W3C IDL definitions and reflect the canonical native interface map.
// ─────────────────────────────────────────────────────────────────────────────

const _Iface = (Tags: string[]) => ({ Tags });

export const html = new Namespace('html', {
    URI    : 'http://www.w3.org/1999/xhtml',
    NS     : false,
    base   : HTMLElement,
    schema : 'http://www.w3.org/1999/xhtml',
    documentation: { w3c: 'https://html.spec.whatwg.org/' },
    Standard: {
        HTMLElement              : _Iface([
            'address','article','footer','header','section','nav','dd','dt',
            'figcaption','figure','main','abbr','b','bdi','bdo','cite','code',
            'dfn','em','i','mark','rt','rtc','ruby','s','samp','small','strong',
            'sub','sup','u','var','wbr','area','noscript','noembed','plaintext',
            'strike','tt','summary','acronym','basefont','big','center',
        ]),
        HTMLUnknownElement       : _Iface(['isindex','spacer','menuitem','decorator','applet','blink','keygen']),
        HTMLHtmlElement          : _Iface(['html']),
        HTMLBaseElement          : _Iface(['base']),
        HTMLHeadElement          : _Iface(['head']),
        HTMLLinkElement          : _Iface(['link']),
        HTMLMetaElement          : _Iface(['meta']),
        HTMLStyleElement         : _Iface(['style']),
        HTMLTitleElement         : _Iface(['title']),
        HTMLPreElement           : _Iface(['pre','listing','xmp']),
        HTMLHeadingElement       : _Iface(['h1','h2','h3','h4','h5','h6']),
        HTMLDivElement           : _Iface(['div']),
        HTMLDListElement         : _Iface(['dl']),
        HTMLHRElement            : _Iface(['hr']),
        HTMLLIElement            : _Iface(['li']),
        HTMLOListElement         : _Iface(['ol']),
        HTMLParagraphElement     : _Iface(['p']),
        HTMLUListElement         : _Iface(['ul']),
        HTMLAnchorElement        : _Iface(['a']),
        HTMLBRElement            : _Iface(['br']),
        HTMLQuoteElement         : _Iface(['quote']),
        HTMLSpanElement          : _Iface(['span']),
        HTMLAudioElement         : _Iface(['audio']),
        HTMLImageElement         : _Iface(['img']),
        HTMLMapElement           : _Iface(['map']),
        HTMLTrackElement         : _Iface(['track']),
        HTMLVideoElement         : _Iface(['video']),
        HTMLEmbedElement         : _Iface(['embed']),
        HTMLIFrameElement        : _Iface(['iframe']),
        HTMLObjectElement        : _Iface(['object']),
        HTMLParamElement         : _Iface(['param']),
        HTMLSourceElement        : _Iface(['source']),
        HTMLCanvasElement        : _Iface(['canvas']),
        HTMLScriptElement        : _Iface(['script']),
        HTMLModElement           : _Iface(['ins','del']),
        HTMLTableCaptionElement  : _Iface(['caption']),
        HTMLTableColElement      : _Iface(['col','colgroup']),
        HTMLTableElement         : _Iface(['table']),
        HTMLTableSectionElement  : _Iface(['tbody','thead','tfoot']),
        HTMLTableCellElement     : _Iface(['td','th']),
        HTMLTableRowElement      : _Iface(['tr']),
        HTMLButtonElement        : _Iface(['button']),
        HTMLDataListElement      : _Iface(['datalist']),
        HTMLFieldSetElement      : _Iface(['fieldset']),
        HTMLFormElement          : _Iface(['form']),
        HTMLInputElement         : _Iface(['input']),
        HTMLLabelElement         : _Iface(['label']),
        HTMLLegendElement        : _Iface(['legend']),
        HTMLOptGroupElement      : _Iface(['optgroup']),
        HTMLOptionElement        : _Iface(['option']),
        HTMLProgressElement      : _Iface(['progress']),
        HTMLSelectElement        : _Iface(['select']),
        HTMLTextAreaElement      : _Iface(['textarea']),
        HTMLMenuElement          : _Iface(['menu']),
        HTMLDirectoryElement     : _Iface(['dir']),
        HTMLFrameElement         : _Iface(['frame']),
        HTMLFrameSetElement      : _Iface(['frameset']),
    },
});

export const svg = new Namespace('svg', {
    URI    : 'http://www.w3.org/2000/svg',
    NS     : true,
    base   : SVGElement,
    schema : 'http://www.w3.org/2000/svg',
    documentation: { w3c: 'https://www.w3.org/TR/SVG2/' },
    Standard: {
        SVGAElement                         : _Iface(['a']),
        SVGAltGlyphDefElement               : _Iface(['altglyph']),
        SVGAltGlyphElement                  : _Iface(['altglyph']),
        SVGAltGlyphItemElement              : _Iface(['altglyph']),
        SVGAnimateColorElement              : _Iface(['animatecolor']),
        SVGAnimateElement                   : _Iface(['animate']),
        SVGAnimateMotionElement             : _Iface(['animatemotion']),
        SVGAnimateTransformElement          : _Iface(['animatetransform']),
        SVGAnimationElement                 : _Iface(['animate','animatemotion','animatetransform']),
        SVGCircleElement                    : _Iface(['circle']),
        SVGClipPathElement                  : _Iface(['clippath']),
        SVGCursorElement                    : _Iface(['cursor']),
        SVGDefsElement                      : _Iface(['defs']),
        SVGDescElement                      : _Iface(['desc']),
        SVGEllipseElement                   : _Iface(['ellipse']),
        SVGFEBlendElement                   : _Iface(['feblend']),
        SVGFEColorMatrixElement             : _Iface(['fecolormatrix']),
        SVGFEComponentTransferElement       : _Iface(['fecomponenttransfer']),
        SVGFECompositeElement               : _Iface(['fecomposite']),
        SVGFEConvolveMatrixElement          : _Iface(['feconvolvematrix']),
        SVGFEDiffuseLightingElement         : _Iface(['fediffuselighting']),
        SVGFEDisplacementMapElement         : _Iface(['fedispatchmap']),
        SVGForeignObjectElement             : _Iface(['foreignobject']),
        SVGGElement                         : _Iface(['g']),
        SVGGlyphElement                     : _Iface(['glyph']),
        SVGGlyphRefElement                  : _Iface(['glyphref']),
        SVGGradientElement                  : _Iface(['lineargradient','radialgradient']),
        SVGHKernElement                     : _Iface(['hkern']),
        SVGImageElement                     : _Iface(['image']),
        SVGLinearGradientElement            : _Iface(['lineargradient']),
        SVGLineElement                      : _Iface(['line']),
        SVGMarkerElement                    : _Iface(['marker']),
        SVGMaskElement                      : _Iface(['mask']),
        SVGMetadataElement                  : _Iface(['metadata']),
        SVGMissingGlyphElement              : _Iface(['missing-glyph']),
        SVGMPathElement                     : _Iface(['mpath']),
        SVGPathElement                      : _Iface(['path']),
        SVGPolygonElement                   : _Iface(['polygon']),
        SVGPolylineElement                  : _Iface(['polyline']),
        SVGRadialGradientElement            : _Iface(['radialgradient']),
        SVGRectElement                      : _Iface(['rect']),
        SVGScriptElement                    : _Iface(['script']),
        SVGSetElement                       : _Iface(['set']),
        SVGStopElement                      : _Iface(['stop']),
        SVGStyleElement                     : _Iface(['style']),
        SVGSVGElement                       : _Iface(['svg']),
        SVGSwitchElement                    : _Iface(['switch']),
        SVGSymbolElement                    : _Iface(['symbol']),
        SVGTextContentElement               : _Iface(['text','tspan','tref','altglyph','textpath']),
        SVGTextElement                      : _Iface(['text']),
        SVGTextPathElement                  : _Iface(['textpath']),
        SVGTextPositioningElement           : _Iface(['altglyph','text','tspan']),
        SVGTitleElement                     : _Iface(['title']),
        SVGTRefElement                      : _Iface(['tref']),
        SVGTSpanElement                     : _Iface(['tspan']),
        SVGUseElement                       : _Iface(['use']),
        SVGViewElement                      : _Iface(['view']),
        SVGVKernElement                     : _Iface(['vkern']),
    },
});

// ─────────────────────────────────────────────────────────────────────────────
//  MathML namespace — reconstructed in the same compact form as HTML/SVG above.
//  MathML 3 specification reference: https://www.w3.org/TR/MathML3/
// ─────────────────────────────────────────────────────────────────────────────

export const mathML = new Namespace('mathML', {
    URI    : 'http://www.w3.org/1998/Math/MathML',
    NS     : true,
    base   : (typeof MathMLElement !== 'undefined' ? MathMLElement : HTMLElement) as new (...a: never[]) => Element,
    schema : 'http://www.w3.org/1998/Math/MathML',
    documentation: { w3c: 'https://www.w3.org/TR/MathML3/' },
    Standard: {
        MathMLElement: _Iface([
            'math','mi','mo','mn','ms','mspace','mtext',
            'mfrac','msqrt','mroot','mstyle','merror','mpadded','mphantom',
            'mrow','mfenced','menclose',
            'msub','msup','msubsup','munder','mover','munderover','mmultiscripts',
            'mtable','mtr','mtd','mlabeledtr',
            'maction',
        ]),
    },
});

// ─────────────────────────────────────────────────────────────────────────────
//  X3D namespace — reconstructed in the same compact form. X3D has no
//  pre-registered native interface in browsers; the namespace is reserved
//  for plugin-style registration via Core.RegisterNamespace at runtime.
//  Specification reference: https://www.web3d.org/specifications/x3d-4.0/
// ─────────────────────────────────────────────────────────────────────────────

export const x3d = new Namespace('x3d', {
    URI    : 'http://www.web3d.org/specifications/x3d-namespace',
    NS     : true,
    base   : HTMLElement,
    schema : 'http://www.web3d.org/specifications/x3d-namespace',
    documentation: { w3c: 'https://www.web3d.org/specifications/x3d-4.0/' },
    Standard: {},
});


// ─────────────────────────────────────────────────────────────────────────────
//  Register into Core.Namespaces + run Initialize() for each
// ─────────────────────────────────────────────────────────────────────────────

Core.RegisterNamespace('html',   html.toDescriptor());
Core.RegisterNamespace('svg',    svg.toDescriptor());
Core.RegisterNamespace('mathML', mathML.toDescriptor());
Core.RegisterNamespace('x3d',    x3d.toDescriptor());

// Patch native constructors so super() works in user subclasses
html.Initialize();
svg.Initialize();
mathML.Initialize();
x3d.Initialize();


// ─────────────────────────────────────────────────────────────────────────────
//  RegisterNamespace — public API for runtime registration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Register a fully custom namespace at runtime. After registration, elements
 * in this namespace are resolved automatically by Real, Virtual.Create, and
 * Core.GetDescriptor.
 */
export function RegisterNamespace(
    key : string,
    ns  : Namespace | (Omit<NamespaceDescriptor, 'tags'> & { tags?: Record<string, TypeDescriptor> }),
): void
{
    if (ns instanceof Namespace) {
        Core.RegisterNamespace(key, ns.toDescriptor());
        ns.Initialize();
    } else {
        const full: NamespaceDescriptor = { tags: {}, ...ns } as NamespaceDescriptor;
        Core.RegisterNamespace(key, full);
        // Legacy-shape descriptors don't get auto-initialised — that's the
        // caller's responsibility (matches the old behaviour).
    }
}


// ─────────────────────────────────────────────────────────────────────────────
//  Default export — for compatibility with existing imports
// ─────────────────────────────────────────────────────────────────────────────

export default { html, svg, mathML, x3d };
