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
    rules: Record<string, string> | unknown,
): void
{
    if (!style || !rules) return;
    // ── Duck-type support for Rule / Stylesheet instances ─────────────────
    // Some callers pass `new Rule(':host', { Background: 'red' })` or a
    // Stylesheet as the 4th arg of Core.Define. Their CSS data is stored
    // in private (#) slots, invisible to for…in. Extract them here so the
    // remainder of this function (and every legacy call site) keeps the
    // same plain-object contract.
    if (typeof rules === 'object' && rules !== null) {
        const r = rules as { Selector?: unknown; Properties?: unknown; Rules?: unknown };
        if (Array.isArray(r.Rules)) {
            for (const sub of r.Rules) applyRulesToStyle(style, sub);
            return;
        }
        if (typeof r.Selector === 'string' && r.Properties && typeof r.Properties === 'object') {
            rules = r.Properties as Record<string, string>;
        }
    }
    const styleRecord = style as unknown as Record<string, string>;
    const rulesRec = rules as Record<string, unknown>;
    for (const Key in rulesRec) {
        if (!Object.prototype.hasOwnProperty.call(rulesRec, Key)) continue;
        const value = rulesRec[Key];
        // ── Nested CSS support ────────────────────────────────────────────
        // `{ ':host': { Background: 'red' }, ':host:hover': {…} }`
        // For inline-style apply we descend ONLY into `:host` / `:scope` /
        // `&` — those properties belong on the host element directly.
        // Pseudo-class variants (`:host:hover`, `:host .inner`, …) need a
        // real stylesheet to take effect; skipping them here is the correct
        // no-op for inline rendering. The <style>-head injection path
        // handles them via applyNestedRulesToCss below.
        if (value !== null && typeof value === 'object') {
            const kt = Key.trim();
            if (kt === ':host' || kt === ':scope' || kt === '&') {
                applyRulesToStyle(style, value);
            }
            continue;
        }
        if (typeof value !== 'string') continue;
        // Map: user's PascalCase key → browser's exact camelCase property name.
        const camel = _cssPropertyMap.get(Key.toLowerCase());
        if (!camel) continue;   // unknown property — silently skip (Golem v1 behaviour)
        try { styleRecord[camel] = value; }
        catch { /* setter refused (read-only / unsupported value) */ }
    }
}


/**
 * Detect whether a rules object is "nested" — i.e. has at least one key
 * whose value is a plain object (selector → properties), as opposed to a
 * flat `{ Background: 'red', Padding: '4px' }` map.
 *
 * Rule and Stylesheet instances are NOT considered nested even though
 * they're objects with non-string properties — they expose Selector +
 * Properties getters and are handled by the duck-type path in
 * applyRulesToStyle and the probe path in generateNestedCss / the
 * <style>-head injection block below.
 */
function isNestedRules(rules: unknown): boolean
{
    if (!rules || typeof rules !== 'object') return false;
    // Rule instance? Skip — its Properties getter returns a flat object.
    const ruleLike = rules as { Selector?: unknown; Properties?: unknown; Rules?: unknown };
    if (typeof ruleLike.Selector === 'string' && ruleLike.Properties) return false;
    if (Array.isArray(ruleLike.Rules)) return false;
    // Look for any value that's a plain object (i.e. nested selector block).
    const rec = rules as Record<string, unknown>;
    for (const k in rec) {
        if (!Object.prototype.hasOwnProperty.call(rec, k)) continue;
        const v = rec[k];
        if (v !== null && typeof v === 'object' && !Array.isArray(v)) return true;
    }
    return false;
}


/**
 * Generate browser-normalised CSS text for a NESTED rules object, scoped
 * to a tag name. Splits the input into one CSS block per selector, with
 * `:host`-pseudoselectors translated to the dual selector that hits both
 * markup-instantiated and factory-built variants of the tag.
 *
 * Input shape:
 *   {
 *     ':host':         { Display: 'block', Background: '#fff3cd' },
 *     ':host:hover':   { Background: '#ffecb3' },
 *     ':host .inner':  { Color: 'crimson', FontWeight: 'bold' },
 *     // flat keys (no nested object) collected into :host
 *     Padding: '4px',
 *   }
 *
 * Output:
 *   '<tag>,[is="<tag>"]{display:block;background:#fff3cd;padding:4px}
 *    <tag>:hover,[is="<tag>"]:hover{background:#ffecb3}
 *    <tag> .inner,[is="<tag>"] .inner{color:crimson;font-weight:bold}'
 *
 * Returns an empty string if the input yields no CSS.
 */
function generateNestedCss(rules: unknown, tag: string): string
{
    if (!rules || typeof rules !== 'object') return '';
    const rec = rules as Record<string, unknown>;
    const propBlocks: Array<{ selector: string; props: unknown }> = [];
    const hostBlock: Record<string, string> = {};

    for (const Key in rec) {
        if (!Object.prototype.hasOwnProperty.call(rec, Key)) continue;
        const value = rec[Key];
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            propBlocks.push({ selector: Key, props: value });
        }
        else if (typeof value === 'string') {
            hostBlock[Key] = value;
        }
    }
    if (Object.keys(hostBlock).length > 0) {
        propBlocks.unshift({ selector: ':host', props: hostBlock });
    }

    let css = '';
    for (const block of propBlocks) {
        const probe = document.createElement('style').style;
        applyRulesToStyle(probe, block.props);
        const inner = probe.cssText.trim();
        if (!inner) continue;
        const sel = block.selector.trim();
        let realSel: string;
        if (sel === ':host') {
            realSel = `${tag},[is="${tag}"]`;
        }
        else if (sel.indexOf(':host') === 0) {
            const suffix = sel.slice(5);
            realSel = `${tag}${suffix},[is="${tag}"]${suffix}`;
        }
        else {
            realSel = sel;
        }
        css += `${realSel}{${inner}}`;
    }
    return css;
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
            value(this: Element, mode: 'open' | 'closed' = 'closed') {
                return _attachAriannaShadow(this, mode);
            },
        });
    } catch { /* shadow already defined elsewhere */ }
}


const SHADOW_ROOT = Symbol.for('arianna.shadow.root');

function _getAriannaShadowRoot(el: Element): ShadowRoot | null
{
    return ((el as unknown as Record<symbol, unknown>)[SHADOW_ROOT] as ShadowRoot | undefined)
        ?? ((el as HTMLElement).shadowRoot ?? null);
}

/**
 * Standalone helper backing the `el.shadow('open'|'closed')` convenience
 * method (defined above). This is NOT the framework's template-mount shadow
 * path — that lives entirely in Component.ts (_installFacilities →
 * _attachAriannaShadow → Shadow.ts backends). This helper only does a native
 * attachShadow attempt for users who manually call `el.shadow()` and want a
 * raw ShadowRoot. It deliberately does not pull in the AriannaShadow polyfill
 * or the iframe backend (that would create a Namespace→Component dependency).
 * For full shadow semantics, use `def.shadow` on the component, not this.
 */
function _attachAriannaShadow(el: Element, mode: 'open' | 'closed' = 'closed'): ShadowRoot | null
{
    const existing = _getAriannaShadowRoot(el);
    if (existing) return existing;
    try {
        const root = (el as HTMLElement).attachShadow({ mode });
        Object.defineProperty(el, SHADOW_ROOT, { value: root, enumerable: false, configurable: false, writable: false });
        return root;
    } catch { return null; }
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
        if (desc && desc.Custom && desc.Interface) {
            const ifaceName = (desc.Interface as { name?: string }).name ?? '';
            const baseDesc  = this.Standard.Interfaces[ifaceName];
            const baseTag   = (baseDesc as { Tags?: string[] } | undefined)?.Tags?.[0];

            // AriannA supports semantic/custom vocabulary tags such as <papa>
            // without browser-level custom-element registration. When the user
            // declares a concrete native base (HTMLDivElement, HTMLButtonElement,
            // SVGSVGElement, ...), the wire-level element must be that base tag
            // so browser internals (including attachShadow support) are valid.
            // Plain HTMLElement remains autonomous and keeps the declared tag.
            if (baseTag && ifaceName && ifaceName !== 'HTMLElement') wireTag = baseTag;
        }

        const el = this.NS && this.URI
            ? document.createElementNS(this.URI, wireTag) as unknown as Element
            : document.createElement(wireTag);

        if (desc && desc.Custom && wireTag !== t && el instanceof HTMLElement) {
            el.setAttribute('is', t);
            el.setAttribute('data-arianna-tag', t);
        }

        // For custom tags (FUNCTION-form here, since CLASS is handled above),
        // synchronously run the upgrade — Update applies prototype splice,
        // style, runs FUNCTION body, installs Component, fires build().
        if (desc && desc.Custom) {
            try {
                const updated = this.Update(el, desc);
                if (updated instanceof Element) return updated;
            }
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
        ctor          : new (...a: unknown[]) => Element,
        baseInterface?: new (...a: unknown[]) => Element,
        style?        : Record<string, string>,
    ): new (...a: unknown[]) => Element
    {
        const _tag       = tag.toLowerCase();
        const _interface = baseInterface ?? this.base;
        const _style     = style ?? {};
        const isClass    = /^class[\s{]/.test(ctor.toString());

        // ── Hot-reload anchor: liveDesc points to THIS registration's descriptor
        // once it's created (see end of Namespace.Define). It exists to let the
        // factory and Update closures read mutable slots (Style, Constructor)
        // through the descriptor rather than capturing them as locals — so that
        // a second Core.Define('case-1b', A1b_new, base, ruleInstance_new) call
        // (which the Core-level idempotent guard handles by updating the
        // descriptor's Style/Constructor in-place) actually takes effect on
        // the next factory call or markup upgrade. Without this, the closure
        // captures the FIRST registration's style forever.
        let liveDesc: TypeDescriptor | null = null;
        const liveStyle = () => (liveDesc?.Style ?? _style) as Record<string, string>;
        const liveCtor  = () => (liveDesc?.Constructor ?? ctor) as new (...args: unknown[]) => Element;

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

            // Apply default style. Now supports plain object, Rule instance,
            // and Stylesheet instance — applyRulesToStyle duck-types the input
            // and extracts the relevant CSS properties before applying inline.
            // Read via liveStyle() so a Core.Define hot-reload takes effect.
            {
                const curStyle = liveStyle();
                if (curStyle) {
                    const elStyle = (el as HTMLElement).style;
                    if (elStyle) applyRulesToStyle(elStyle, curStyle);
                }
            }

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
            // ran the body inside Reflect.construct above. Read via liveCtor()
            // so a Core.Define hot-reload uses the new function body.
            if (!isClass) {
                try { (liveCtor() as unknown as (this: Element, ...a: unknown[]) => void).apply(el, args); }
                catch (e) { console.warn(`[arianna] ${_tag} FUNCTION body failed:`, e); }
            }

            // Re-apply style AFTER body, idempotent — restores anything the
            // body may have accidentally cleared.
            {
                const curStyle = liveStyle();
                if (curStyle) {
                    const elStyle2 = (el as HTMLElement).style;
                    if (elStyle2) applyRulesToStyle(elStyle2, curStyle);
                }
            }

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
                // applyRulesToStyle duck-types Rule / Stylesheet, so we MUST NOT
                // guard with Object.keys(_style).length > 0 — on a Rule instance
                // Object.keys returns [] because the data lives in #properties
                // (private), and the check would falsely skip valid Rule input.
                // applyRulesToStyle itself handles the empty-input no-op case.
                // Read via liveStyle() for Core.Define hot-reload support.
                {
                    const curStyle = liveStyle();
                    if (curStyle) {
                        const style = (el as HTMLElement).style;
                        if (style) applyRulesToStyle(style, curStyle);
                    }
                }

                if (wantsAutoComp && typeof win.Component === 'function') {
                    try { win.Component(el); }
                    catch (e) { console.warn(`[arianna] Component(el) on markup-upgrade failed for <${_tag}>:`, e); }
                }
                if (!isClass) {
                    // FUNCTION form — safely run the body with `this = el`.
                    // liveCtor() returns the most recent Core.Define-registered
                    // function (hot-reload).
                    try { (liveCtor() as unknown as (this: Element) => void).call(el); }
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

        // Hot-reload anchor: now that the descriptor exists, point liveDesc at
        // it so the factory and Update closures (created above but yet to run)
        // read Style/Constructor via the descriptor — which Core.Define mutates
        // in-place on every subsequent register call for the same tag.
        liveDesc = descriptor;

        // Apply default CSS as a stylesheet rule for the tag.
        //
        // Generates the rule text by applying _style to a probe
        // CSSStyleDeclaration (same Golem v1 pattern as applyRulesToStyle)
        // and reading back the browser-normalised cssText — which already
        // contains valid kebab-case property names. No regex.
        //
        // NB: we DELIBERATELY do NOT pre-guard with Object.keys(_style).length —
        // on a Rule instance the data lives in #private slots, so Object.keys
        // returns [] and the check would falsely skip valid CSS. Instead we
        // POST-guard on probe.cssText: if applyRulesToStyle (which duck-types
        // Rule / Stylesheet) yields any CSS text, inject the <style>; if not,
        // skip silently (no empty rulesets polluting head).
        try {
            if (isNestedRules(_style)) {
                // Nested CSS path: multi-selector blocks for `:host`,
                // `:host:hover`, `:host .inner`, etc.
                const css = generateNestedCss(_style, _tag);
                if (css.trim().length > 0) {
                    const styleEl = document.createElement('style');
                    styleEl.textContent = css;
                    styleEl.setAttribute('data-arianna-tag-style', _tag);
                    (document.head ?? document.documentElement).appendChild(styleEl);
                }
            }
            else {
                // Original path: flat object / Rule / Stylesheet via probe.
                const styleEl = document.createElement('style');
                const probe = document.createElement('style').style;
                applyRulesToStyle(probe, _style);
                const cssText = probe.cssText;
                if (cssText && cssText.trim().length > 0) {
                    styleEl.textContent = `${_tag},[is="${_tag}"]{${cssText}}`;
                    styleEl.setAttribute('data-arianna-tag-style', _tag);
                    (document.head ?? document.documentElement).appendChild(styleEl);
                }
            }
        } catch { /* DOM not ready, skip */ }

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

    Update(node: Element, hint?: TypeDescriptor): Element | void
    {
        if (!(node instanceof Element)) return;

        const desc = hint ?? this.GetDescriptor(node);
        if (!desc || !desc.Custom || !desc.Constructor) return;

        // ── USER SUBCLASS LOOKUP ─────────────────────────────────────────
        // The factory `Component(tag, base, css, def)` registered the tag
        // with Class=null. The user subclass is captured at the first
        // `new <subclass>()` call via super() propagation of `new.target`
        // inside the anonymous constructor returned by the factory.
        //
        // If desc.Class is still null here, no `new <subclass>()` has ever
        // run — the user has placed <arianna-button> in markup but never
        // instantiated Button in JS. We try a heuristic global lookup:
        // scan `window` for any constructor whose prototype chain includes
        // the factory `Bound` (which is `desc.Constructor`) AND whose
        // `__ariannaTag` matches our tag. This catches the common case where
        // the component file imports & defines `class Button extends
        // Component('arianna-button', ...)` then assigns `window.Button =
        // Button` — that side-effect makes the subclass globally findable.
        let userClass = (desc as TypeDescriptor & { Class?: Function | null }).Class;
        if (!userClass) {
            const targetTag = desc.Tags?.[0];
            const baseCtor  = desc.Constructor;
            const globalScope = (typeof window !== 'undefined' ? window : globalThis) as unknown as Record<string, unknown>;

            // ── helper: ensure candidate extends baseCtor ────────────────
            const extendsBase = (candidate: Function): boolean => {
                if (candidate === baseCtor) return false;
                const cp = (candidate as { prototype?: object }).prototype;
                const bp = (baseCtor as { prototype?: object }).prototype;
                if (!cp || !bp) return true;
                let p: object | null = Object.getPrototypeOf(cp);
                while (p) {
                    if (p === bp) return true;
                    p = Object.getPrototypeOf(p);
                }
                return false;
            };

            // ── STRATEGY 0: PascalCase-from-tag direct lookup ──────────────
            // Components are registered on window with a PascalCase key derived
            // from the kebab tag, with the namespace prefix stripped:
            //   arianna-button         → window.Button
            //   arianna-code-editor    → window.CodeEditor
            //   arianna-keyframe-editor→ window.KeyframeEditor
            //   papa                   → window.Papa
            //   my-comp                → window.MyComp
            //
            // This is fast (O(1)), unambiguous, and works for any component
            // that follows the convention — even when __ariannaTag was never
            // stamped (which is the common case, since Component.Define() is
            // an opt-in API most user code does NOT call).
            if (targetTag) {
                const parts = targetTag.split('-').filter(Boolean);
                const start = parts[0] === 'arianna' ? 1 : 0;
                const pretty = parts.slice(start).map(seg =>
                    seg.charAt(0).toUpperCase() + seg.slice(1)
                ).join('');
                if (pretty) {
                    const direct = globalScope[pretty];
                    if (typeof direct === 'function' && extendsBase(direct as Function)) {
                        userClass = direct as Function;
                    }
                }
            }

            // ── STRATEGY 1 (STRICT): __ariannaTag scan ─────────────────────
            // Accept ONLY a candidate whose __ariannaTag equals our target
            // tag. This is the reliable signal — multiple components share
            // the same base (all `extends Component(tag, HTMLElement)`), so
            // "extends the same base" is NOT sufficient to disambiguate.
            // Picking the first base-matching class is exactly the bug that
            // reprototyped <arianna-code-editor> to ArrayModifierElement.
            //
            // NOTE on enumerable-vs-non-enumerable: components register on
            // window with `enumerable: false`, so `Object.keys(window)` does
            // NOT see them — `Object.getOwnPropertyNames` is required.
            if (!userClass) {
                for (const key of Object.getOwnPropertyNames(globalScope)) {
                    const candidate = globalScope[key];
                    if (typeof candidate !== 'function') continue;
                    if (candidate === baseCtor) continue;
                    const candidateTag = (candidate as { __ariannaTag?: string }).__ariannaTag;
                    if (!candidateTag || !targetTag) continue;          // need a tag to match on
                    if (candidateTag !== targetTag) continue;           // must match exactly
                    if (!extendsBase(candidate as Function)) continue;  // sanity: extends declared base
                    userClass = candidate as Function;
                    break;
                }
            }
            // NOTE: deliberately NO permissive base-only pass. If no class
            // matches by PascalCase name AND no class carries a matching
            // __ariannaTag, leave userClass null and fall through to the
            // base Constructor. Reprototyping the node to the WRONG component
            // (any class that merely extends the same base) is worse than
            // leaving it on the base: a wrong prototype silently breaks
            // build()/Value/etc., which is precisely the failure this avoids.
            if (userClass) {
                (desc as { Class?: Function | null }).Class = userClass;
            }
        }
        if (userClass) {
            (desc as { Constructor: Function }).Constructor = userClass;
            (desc as { Prototype: object }).Prototype      = (userClass as { prototype: object }).prototype;
        }

        const ctor  = desc.Constructor;
        const iface = desc.Interface;
        if (!ctor || !iface) return;

        // Markup can legally use an AriannA vocabulary tag that is not a
        // browser custom-element name, for example:
        //
        //   class Cuore extends Component('papa', HTMLDivElement, ...)
        //   <papa>Papa</papa>
        //
        // The DOM parser creates <papa> as HTMLUnknownElement. AriannA must not
        // force users to rename it to a dashed tag. Instead, Namespace.Update()
        // coerces the wire-level node to the declared native base (here <div>)
        // and preserves the public vocabulary via is="papa" and
        // data-arianna-tag="papa". This keeps attachShadow, native slots, and
        // element internals valid while preserving AriannA's vocabulary model.
        {
            const ifaceName = (iface as { name?: string }).name ?? '';
            const baseDesc  = this.Standard.Interfaces[ifaceName];
            const baseTag   = (baseDesc as { Tags?: string[] } | undefined)?.Tags?.[0];
            const declaredTag = desc.Tags?.[0] ?? node.tagName.toLowerCase();
            let matchesInterface = true;
            try { matchesInterface = node instanceof (iface as unknown as typeof Element); }
            catch { matchesInterface = true; }

            if (!matchesInterface && baseTag && ifaceName !== 'HTMLElement' && node.tagName.toLowerCase() !== baseTag) {
                const replacement = this.NS && this.URI
                    ? document.createElementNS(this.URI, baseTag) as unknown as Element
                    : document.createElement(baseTag);

                for (const attr of Array.from(node.attributes)) {
                    try { replacement.setAttribute(attr.name, attr.value); } catch { /* ignore */ }
                }
                try { replacement.setAttribute('is', declaredTag); } catch { /* ignore */ }
                try { replacement.setAttribute('data-arianna-tag', declaredTag); } catch { /* ignore */ }

                while (node.firstChild) replacement.appendChild(node.firstChild);
                if (node.parentNode) node.parentNode.replaceChild(replacement, node);
                node = replacement;
            }
        }

        // Idempotency guard — Core.Observer may call Update multiple times for
        // the same node (e.g. when it's moved between parents), and Core.Create
        // calls Update before returning. The factory path also marks the node;
        // skipping here keeps body / build / proxy install from running twice.
        const tagged = node as Element & { __ariannaUpgraded?: boolean };
        if (tagged.__ariannaUpgraded) return node;
        tagged.__ariannaUpgraded = true;

        // Step 1: ensure prototype chain.
        //
        // FUNCTION form: ctor.prototype.[[Prototype]] defaults to Object.prototype
        // (plain functions have no extends), so splice the iface in.
        //
        // CLASS form: native `class A3p extends SvgBase3p` already wired the
        // full chain. Forcing iface.prototype here would OVERWRITE that chain
        // (e.g. replacing SVGSVGElement with HTMLElement when base auto-
        // resolution defaulted), breaking the SVG/MathML nature of the
        // element. So for CLASS we leave ctor.prototype's [[Prototype]] alone
        // and only splice node → ctor.prototype.
        try {
            if (desc.Declaration !== 'CLASS') {
                Object.setPrototypeOf(ctor.prototype, (iface as { prototype: object }).prototype);
            }
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

        // Step 3: apply default CSS inline (Golem v1 pattern).
        //
        // NB: we MUST NOT guard with `Object.keys(styleRules).length > 0` —
        // on a Rule instance (`new Rule(':host', {...})`) Object.keys returns
        // `[]` because the data lives in #private slots, and the check would
        // falsely skip a perfectly valid CSS source. applyRulesToStyle itself
        // handles the empty-plain-object no-op case AND duck-types Rule /
        // Stylesheet instances (extracts .Properties before iterating).
        if (desc.Style) {
            const style = (node as HTMLElement).style;
            if (style) applyRulesToStyle(style, desc.Style);
        }

        // Step 4: Component(this) auto-install — THE single facility installer.
        //
        // This calls _installFacilities(node), which is the ONE place that does:
        //   - shadow attachment (native / AriannaShadow light / iframe backend)
        //   - default sheet application
        //   - reactive attribute signal wiring
        //   - build() invocation
        //   - template mount (this.template → shadow root, with slot projection)
        //
        // Namespace.Update MUST NOT duplicate any of that work. Its job is
        // purely: resolve the descriptor, fix the prototype chain (Steps 1-3
        // above), then hand off to the facility installer. Everything after
        // the prototype is fixed is Component's responsibility — one source of
        // truth (see COMPONENTS.md §36, anti-rot rule 4: "Update reads, never
        // invents"). The old Step 5 (FUNCTION body), Step 6 (build), and
        // Step 7 (template mount) were removed: they duplicated
        // _installFacilities and raced with it, setting __templateRendered
        // before the correct mount could run.
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
        else if (desc.Declaration === 'FUNCTION') {
            // ── FUNCTION-body execution (non-Component path) ─────────────────
            //
            // The refactor that consolidated everything under _installFacilities
            // (the "Component(this) auto-install" branch above) covers EVERY
            // arianna-* tag and any tag whose ctor explicitly opts in. It does
            // NOT cover the legitimate non-arianna FUNCTION-form path used by
            // `Core.Define('case-1a', A1a, HTMLElement, { … })` style tests
            // and by user code that registers plain function constructors for
            // tags outside the arianna-* namespace.
            //
            // For those, the body of `function A1a() { this.textContent = … }`
            // must still be invoked with `this = node` once the prototype is
            // spliced (Step 1 above). Without this branch the body is silently
            // skipped — the element shows up with its inline default CSS
            // applied (the `_style` argument to Core.Define) but with NO
            // textContent, NO event listeners, NO state set by the ctor body.
            // That is the "barra bianca" symptom: visible because of the CSS
            // default, empty because the body never ran.
            //
            // CLASS-form ctors cannot be invoked here — a class constructor
            // can only run via `new`, and we already have the element from
            // the HTML parser / createElement path. Users wanting setup logic
            // on markup-instantiated CLASS-form components must put it in
            // `build()` (handled by _installFacilities when wantsAutoComponent
            // is true).
            try { (ctor as unknown as (this: Element) => void).call(node); }
            catch (e) { console.warn(`[arianna] FUNCTION body failed for <${desc.Tags[0]}>:`, e); }
        }
        else if (desc.Declaration === 'CLASS') {
            // ── CLASS-form build() execution (non-Component path) ────────────
            //
            // A class ctor cannot be invoked on an existing element — but
            // user-defined `build()` methods can and SHOULD run on markup
            // upgrade. The wantsAutoComponent branch above handles arianna-*
            // tags via _installFacilities; this branch handles every other
            // CLASS registration (e.g. case-2a, case-2b, …).
            //
            // Idempotency: mark __isBuilt so a later run doesn't fire twice.
            const stash = node as Element & { __isBuilt?: boolean };
            if (!stash.__isBuilt) {
                stash.__isBuilt = true;
                const userBuild = (node as unknown as { build?: () => void }).build;
                if (typeof userBuild === 'function') {
                    try { userBuild.call(node); }
                    catch (e) { console.warn(`[arianna] build() on markup-upgrade failed for <${desc.Tags[0]}>:`, e); }
                }
            }
        }

        return node;
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
            // 1. Resolve the wire-level tag.
            //
            //    AriannA's `Component(tag, Base, ...)` lets users declare semantic
            //    tags like `papa`, `cuore`, `mio-elemento` on top of any native
            //    interface (HTMLDivElement, HTMLButtonElement, etc.). The browser
            //    parser produces HTMLUnknownElement for any tag it doesn't know,
            //    and HTMLUnknownElement does NOT support attachShadow.
            //
            //    Strategy — mirrors Namespace.Update:1027-1051 (markup path):
            //
            //      (a) If interface IS HTMLElement (autonomous custom element):
            //          no native base tag exists. Use the custom tag directly.
            //          The result is HTMLUnknownElement. Shadow support depends
            //          on AriannaShadow polyfill (separate fix).
            //
            //      (b) If interface has a concrete native base tag (HTMLDivElement
            //          → 'div', HTMLButtonElement → 'button', etc.) AND we're in
            //          the HTML namespace: produce the NATIVE element and decorate
            //          with is="<customTag>" + data-arianna-tag="<customTag>".
            //          Result: real <div is="papa">, real layout, attachShadow OK,
            //          internal slots intact for fragile interfaces.
            //
            //      (c) SVG / MathML / X3D namespaces: always use the base tag, no
            //          `is=` attribute. The layout engine rejects custom tags
            //          inside non-HTML namespaces, so identity is preserved only
            //          via prototype splicing.
            //
            //    The user prototype is spliced onto the element regardless.
            let tagToCreate    = baseTag;
            let customTagAlias = '';
            let userProto: object = nativeProto;
            try {
                const userCtor = this.constructor as { name?: string; prototype?: object };
                if (userCtor && userCtor !== (wrapped as unknown as { constructor: unknown })) {
                    const custom = self.GetDescriptor(userCtor as new () => Element);
                    if (custom && custom.Custom && custom.Tags && custom.Tags[0]) {
                        const customTag = custom.Tags[0];
                        if (useNS) {
                            // (c) SVG / MathML / X3D — always native base tag, no is=.
                            tagToCreate = baseTag;
                        } else if (baseTag && ifaceName !== 'HTMLElement') {
                            // (b) HTML with concrete native base (div, button, …).
                            //     Use the native base tag + is="<customTag>" pattern.
                            tagToCreate    = baseTag;
                            customTagAlias = customTag;
                        } else {
                            // (a) HTML with HTMLElement (autonomous custom element).
                            //     No native base tag — use the custom tag directly.
                            tagToCreate = customTag;
                        }
                    }
                    if (userCtor.prototype) userProto = userCtor.prototype;
                }
            } catch { /* fall through to base */ }

            // 2. Create the element with the correct namespace.
            const el = useNS && URI
                ? document.createElementNS(URI, tagToCreate) as unknown as Element
                : document.createElement(tagToCreate);

            // 3. Decorate with is= + data-arianna-tag when we swapped to baseTag.
            //    These two attributes make the element queryable as the semantic
            //    custom tag while keeping the native nodeName for layout/shadow.
            if (customTagAlias && el instanceof HTMLElement) {
                try { el.setAttribute('is',               customTagAlias); } catch { /* ignore */ }
                try { el.setAttribute('data-arianna-tag', customTagAlias); } catch { /* ignore */ }
            }

            // 4. Splice the user prototype onto the element.
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
                ctor: new (...a: unknown[]) => Element,
                baseInterface?: new (...a: unknown[]) => Element,
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
