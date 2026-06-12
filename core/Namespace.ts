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
import Core, { type NamespaceDescriptor, type TypeDescriptor } from './Core.ts';

/**
 * Wrap a user constructor into a real `extends <baseClass>` class so that, on
 * construction, `super()` builds a genuine DOM element and the user's logic runs
 * on THAT element (not on a plain object). This is the known wrapping technique:
 *
 *   class Wrapper extends baseClass { constructor(){ super(); custom.apply(this); } }
 *
 * `.apply` only works for a FUNCTION body. An ES6 CLASS constructor cannot be
 * invoked via `.apply` ("Class constructor cannot be invoked without 'new'"), so
 * for a class we recompile the source to `class Name extends baseClass {
 * constructor(...a){ super(); …original body } }` — the same effect (super() builds
 * the element, the body runs on it) by a route JS permits. Either way the result
 * is a constructable class extending baseClass; `Reflect.construct` then yields a
 * real, body-initialised element. `baseClass` MUST be constructable (a patched /
 * registered interface) — `super()` on a raw, unregistered native still throws
 * "Illegal constructor". Prototype members are copied so methods survive.
 */
function createDynamicWrapper(
    customConstructor: Function,
    baseClass        : new (...args: unknown[]) => Element,
): new (...args: unknown[]) => Element
{
    const src     = (() => { try { return Function.prototype.toString.call(customConstructor); } catch { return ''; } })();
    const isClass = /^class[\s{]/.test(src);
    const name    = customConstructor.name || '_AriannaAnon';

    // Free-standing, super-less constructor body. Used in TWO places:
    //   • inside the genuine class below, applied on `this` right after super() — so the
    //     create path's `Reflect.construct(thisClass, args, newTarget)` runs it on the
    //     real element;
    //   • exposed as __ariannaBody for the markup-upgrade path (Update), applied on the
    //     live node where neither `new` nor `super()` is callable.
    let bodyFn: ((this: Element, ...a: unknown[]) => void) | null = null;
    if (isClass)
    {
        const _cm = /\bconstructor\s*\(([^)]*)\)\s*\{/.exec(src);
        if (_cm)
        {
            let _i = _cm.index + _cm[0].length;
            let _depth = 1;
            const _start = _i;
            for (; _i < src.length && _depth > 0; _i++)
            {
                const _ch = src[_i];
                if (_ch === '{') { _depth++; }
                else if (_ch === '}') { _depth--; }
            }
            const _body = src.slice(_start, _i - 1);
            try { bodyFn = new Function(_cm[1], _body) as (this: Element, ...a: unknown[]) => void; }
            catch { /* private fields / CSP — no free-standing body */ }
        }
    }

    // EMULATE EXTENDS: a GENUINE `class extends <interface>` (interface captured as a
    // closure variable — NO `new Function` for the structure, CSP-safe). `super(...)`
    // therefore ALWAYS runs and lets the interface build a REAL element with the native
    // internal slots, so `this.style` is accessible — exactly the third-argument /
    // Reflect.construct shape the old model used. The original constructor body then runs
    // on that real element right after super(). `new.target` propagates through super(),
    // so constructing this class with a subclass as the third argument lands the element
    // on the subclass prototype.
    const Wrapper = class extends (baseClass as new (...a: unknown[]) => Element)
    {
        constructor(...args: unknown[])
        {
            super(...args);
            if (bodyFn)
            {
                try { bodyFn.apply(this as unknown as Element, args); }
                catch (e) { console.warn(`[arianna] <${name}> body failed:`, e); }
            }
        }
    } as unknown as new (...args: unknown[]) => Element;

    try { Object.defineProperty(Wrapper, 'name', { value: name, configurable: true }); } catch { /* resists */ }

    if (bodyFn)
    {
        try { Object.defineProperty(Wrapper, '__ariannaBody', { value: bodyFn, configurable: true }); } catch { /* resists */ }
    }

    // Carry the original class's prototype methods onto the genuine derived class (the
    // `extends` only inherits the interface's prototype otherwise).
    const propertyNames = Object.getOwnPropertyNames(customConstructor.prototype);
    for (const prop of propertyNames)
    {
        if (prop !== 'constructor')
        {
            const descriptor = Object.getOwnPropertyDescriptor(customConstructor.prototype, prop);
            if (descriptor) { try { Object.defineProperty(Wrapper.prototype, prop, descriptor); } catch { /* read-only */ } }
        }
    }

    return Wrapper;
}

/**
 * Auxiliary types for Namespace, grouped under the class via declaration merging
 * (CODING_CONVENTIONS §4). Declared as a sibling namespace (same name, same scope)
 * — NOT the class nested inside, like Property/Events — because Namespace is
 * instantiated directly at module level (`new Namespace('html', …)`), so the class
 * must stay the constructable value. Types are referenced as `Options` etc.
 */
export namespace Namespace
{
    /** Options accepted by the Namespace constructor. */
    export interface Options
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

    export class Namespace
    {
        // ── Private static helpers (CSS apply / fragile-proxy / shadow / stub / flags) ──

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
        private static readonly _cssPropertyMap: Map<string, string> = (() => {
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
        private static applyRulesToStyle(
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
                const camel = Namespace._cssPropertyMap.get(Key.toLowerCase());
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


        private static readonly _FRAGILE_INNER = new WeakMap<Element, Element>();

        private static _installFragileProxy(outer: Element, spec: { tag: string; props: readonly string[]; methods: readonly string[] }): void
        {
            if (Namespace._FRAGILE_INNER.has(outer)) return;   // idempotent

            // Create the real native inner element (real <input>, <select>, ...)
            const inner = document.createElement(spec.tag);
            Namespace._FRAGILE_INNER.set(outer, inner);

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
                        return Namespace._attachAriannaShadow(this, mode);
                    },
                });
            } catch { /* shadow already defined elsewhere */ }
        }

        private static readonly SHADOW_ROOT = Symbol.for('arianna.shadow.root');

        private static _getAriannaShadowRoot(el: Element): ShadowRoot | null
        {
            return ((el as unknown as Record<symbol, unknown>)[Namespace.SHADOW_ROOT] as ShadowRoot | undefined)
                ?? ((el as HTMLElement).shadowRoot ?? null);
        }

        private static _attachAriannaShadow(el: Element, mode: 'open' | 'closed' = 'closed'): ShadowRoot | null
        {
            const existing = Namespace._getAriannaShadowRoot(el);
            if (existing) return existing;
            try {
                const root = (el as HTMLElement).attachShadow({ mode });
                Object.defineProperty(el, Namespace.SHADOW_ROOT, { value: root, enumerable: false, configurable: false, writable: false });
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
        private static readonly _FRAGILE_PROXY_SPEC: Record<string, { tag: string; props: readonly string[]; methods: readonly string[] }> = {
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
        private static _stubDescriptor(name: string, tags: string[]): TypeDescriptor
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
                Native      : false,
                Chain       : new Map<string, unknown>(),
            };
        }


        /** Marker symbol — set on patched native constructors to avoid double-patching. */
        private static readonly PATCHED_FLAG = Symbol.for('arianna.native.patched');

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


        constructor(name: string, options: Options = {})
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
                    // Q1(a): freeze the canonical W3C Tags array — these tables are the
                    // authoritative native-interface map and must never be mutated at runtime.
                    const tags = Object.freeze(options.Standard[ifaceName].Tags ?? []) as string[];
                    stdInterfaces[ifaceName] = Namespace._stubDescriptor(ifaceName, tags);
                }
            }

            this.Standard = { Interfaces: stdInterfaces, Tags: {} };
            this.Custom   = { Interfaces: {},            Tags: {} };

            // Creating a Namespace IS registering it: auto-register into Core.Namespaces
            // and self-initialise (native patching + Supported back-fill). No external
            // Core.RegisterNamespace / .Initialize() ceremony.
            Core.Namespaces[this.Name] = this.toDescriptor();
            this.Initialize();
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
                //
                // EXCEPTION — fragile interfaces (HTMLInputElement, HTMLCanvasElement,
                // HTMLSelectElement, ...): these are composed via _installFragileProxy,
                // which attachShadow()s the OUTER element and nests a real native
                // inside. A real <canvas>/<input> outer cannot attachShadow (throws
                // "Unable to attach ShadowDOM"). So for fragile bases we KEEP the
                // custom tag (an autonomous element that CAN attachShadow) — exactly
                // what the factory (`new A1a()`) does. This keeps Create/Real/markup
                // consistent with the constructor path.
                const fragile = !!Namespace._FRAGILE_PROXY_SPEC[ifaceName];
                if (baseTag && ifaceName && ifaceName !== 'HTMLElement' && !fragile) wireTag = baseTag;
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
            ctor          : new (...a: never[]) => Element,
            baseInterface?: new (...a: never[]) => Element,
            style?        : Record<string, string>,
        ): new (...a: unknown[]) => Element
        {
            const _tag       = tag.toLowerCase();
            // The base MUST be a constructor with a prototype. A bad base (undefined,
            // a string, an undefined-named stub) would otherwise flow into the chain
            // splices below as `_interface.prototype === undefined` →
            // "Object.setPrototypeOf: got undefined", aborting the whole upgrade and
            // leaving the element unmounted. Fall back to this namespace's base instead.
            //
            // ── Implicit base inference for the CLASS form ───────────────────────
            // A class already carries its base via `extends` (e.g.
            // `class X extends HTMLDivElement`), so callers may omit the explicit
            // baseInterface and pass the style as the 3rd arg:
            //   Core.Define('custom', class X extends HTMLDivElement {…}, { Background })
            // In that call `baseInterface` is the STYLE object, NOT a constructor.
            // Detect a non-constructor in the base slot and, for a class, recover the
            // real base from the constructor's [[Prototype]] (its `extends` target),
            // re-routing the mis-placed arg into `style`. Without this the base falls
            // back to the namespace base (HTMLElement) and the StyleMap is dropped.
            if
            (
                baseInterface !== undefined
                && !(typeof baseInterface === 'function' && !!(baseInterface as { prototype?: object }).prototype)
                && /^class[\s{]/.test(ctor.toString())
            )
            {
                const _classSuper = Object.getPrototypeOf(ctor) as unknown;
                if (style === undefined) style = baseInterface as unknown as typeof style;
                baseInterface =
                    (
                        typeof _classSuper === 'function'
                        && !!(_classSuper as { prototype?: object }).prototype
                        && _classSuper !== (Function.prototype as unknown)
                    )
                        ? (_classSuper as typeof baseInterface)
                        : undefined;
            }
            let _interface = baseInterface ?? this.base;
            if (typeof _interface !== 'function' || !(_interface as { prototype?: object }).prototype) {
                console.warn(`[arianna] Define <${_tag}>: base is not a constructor — falling back to ${(this.base as { name?: string })?.name ?? 'the namespace base'}.`);
                _interface = this.base;
            }
            // The style arg may be a Rule instance — e.g.
            //   Core.Define('case-1b', fn, HTMLElement, new Rule(':host', { Background: '…' }))
            // — not a plain props record. A Rule keeps its declarations behind private
            // fields, so iterating it yields zero enumerable keys and applyInlineStyle
            // would no-op. Detect it by duck-typing (string Selector + object
            // Properties) and use its flat, already-normalised camelCase .Properties.
            // A Rule must NEVER be routed anywhere near CssState — that constructor
            // expects (element, eventName, …), and feeding it a props bag is exactly
            // the "eventName should be a string" / "can't convert undefined to object"
            // failure mode.
            const _ruleLike  = style as unknown as { Selector?: unknown; Properties?: Record<string, string> };
            const _style: Record<string, string> =
                (
                    _ruleLike
                    && typeof _ruleLike.Selector === 'string'
                    && _ruleLike.Properties
                    && typeof _ruleLike.Properties === 'object'
                )
                    ? { ..._ruleLike.Properties }
                    : ((style as Record<string, string>) ?? {});
            const isClass    = /^class[\s{]/.test(ctor.toString());

            // ── WRAP no-extends declarations (the piece the original lacked) ─────
            // A no-extends CLASS builds a plain object on construction → `this.style`
            // throws. We adapt it (and, uniformly, a declarative FUNCTION) into a real
            // `class extends <interface> { constructor(){ super(); …body } }` via
            // createDynamicWrapper, so super() builds a genuine element and the body
            // runs on it. A class that ALREADY extends something (a native, a
            // Component(...) bound class, or a user base) is LEFT UNTOUCHED — it owns
            // its super chain, and rewrapping it to <interface> would flatten the
            // chain. Functions keep their existing createElement + ctor.apply path
            // (which already runs the body without needing super), so we only wrap the
            // no-extends CLASS here; `_RealClass` is what we construct & register.
            const _isNoExtendsClass = isClass && Object.getPrototypeOf(ctor) === Function.prototype;
            const _RealClass: new (...a: unknown[]) => Element = _isNoExtendsClass
                ? createDynamicWrapper(ctor as unknown as Function, _interface as new (...a: unknown[]) => Element)
                : (ctor as unknown as new (...a: unknown[]) => Element);

            // ── EXTENDS-class upgrade body ───────────────────────────────────────
            // A no-extends class gets its __ariannaBody from createDynamicWrapper. An
            // EXTENDS class (`class X extends HTMLDivElement { constructor(){ super(); … } }`)
            // does NOT pass through that adapter, so on the markup-upgrade path — where the
            // node already exists and neither `new` nor `super()` is callable — its
            // constructor setup would never run (only the create path, via Reflect.construct,
            // ran it). Extract the constructor body MINUS its leading `super(...)` call as a
            // free-standing function and stash it as __ariannaBody, so Namespace.Update can
            // apply it on the live node exactly like a no-extends class. Best-effort: private
            // fields / a non-leading super / CSP simply leave no upgrade body (create path
            // still runs it).
            if (isClass && !_isNoExtendsClass
                && !(_RealClass as { __ariannaBody?: unknown }).__ariannaBody)
            {
                try
                {
                    const _src = ctor.toString();
                    const _cm  = /\bconstructor\s*\(([^)]*)\)\s*\{/.exec(_src);
                    if (_cm)
                    {
                        let _i = _cm.index + _cm[0].length;
                        let _depth = 1;
                        const _start = _i;
                        for (; _i < _src.length && _depth > 0; _i++)
                        {
                            const _ch = _src[_i];
                            if (_ch === '{') { _depth++; }
                            else if (_ch === '}') { _depth--; }
                        }
                        let _body = _src.slice(_start, _i - 1);
                        // Strip the leading super(...) call — a free-standing function may not
                        // contain `super`. Only the first occurrence (the constructor's chain-up).
                        _body = _body.replace(/\bsuper\s*\([^)]*\)\s*;?/, '');
                        const _bodyFn = new Function(_cm[1], _body);
                        Object.defineProperty(_RealClass, '__ariannaBody', { value: _bodyFn, configurable: true });
                    }
                }
                catch { /* private fields / nested super / CSP — no upgrade body */ }
            }

            // ── Prototype chain: the legacy Component.js model ───────────────────
            // The OLD Component.js Define NEVER touches the user constructor's
            // prototype. It builds a fresh factory (window[Class.name]) and chains
            // the FACTORY's prototype to the interface:
            //   setPrototypeOf(factory, interface)
            //   setPrototypeOf(factory.prototype, interface.prototype)
            // Elements are spliced onto factory.prototype, so they inherit the
            // native API via the interface — without ever mutating ctor.prototype.
            //
            // We follow that exactly (see the factory + the two setPrototypeOf calls
            // after it, below). We deliberately do NOT call Core.Extends(ctor, iface):
            // mutating ctor.prototype across playground re-runs / patched native
            // bases throws "can't set prototype: it would cause a prototype chain
            // cycle" — which, being caught, silently leaves the chain on HTMLElement.

            // ── No native customElements registration ────────────────────────────
            // AriannA components are NOT conforming autonomous custom elements: their
            // construction returns a composed / prototype-spliced element rather than
            // `this`. Registering them via customElements.define() hands `<tag>` upgrade
            // to the browser, which then runs `new ctor()` and rejects the result with
            // "Custom element constructor returned a wrong element" / "this does not
            // implement interface HTMLElement". AriannA always runs its OWN upgrade
            // (Reflect.construct / factory / Namespace.Update), so we never register
            // natively. `native` stays false in the descriptor.
            const native = false;

            // Full prototype chain captured at registration — a DAO-style bag
            // (name → constructor) so tests can compare it against a live element's
            // chain. Eager (not lazy): the chain is frozen at Define time.
            const chain = new Map<string, unknown>();
            for (let c: unknown = _RealClass; typeof c === 'function' && c !== Function.prototype; c = Object.getPrototypeOf(c))
                if ((c as { name?: string }).name) chain.set((c as { name: string }).name, c);

            // Resolve base tag from interface descriptor (e.g. 'input' for HTMLInputElement)
            const ifaceDesc = this.Standard.Interfaces[_interface.name] ?? this.Custom.Interfaces[_interface.name];
            const _baseTag  = (ifaceDesc as { Tags?: string[] } | undefined)?.Tags?.[0] ?? _tag;
            const _URI      = this.URI;

            // Decide whether to auto-call Component(el) on construction.
            // Triggers: tag starts with 'arianna-', or ctor body calls Component(this)
            const ctorSrc        = ctor.toString();
            const wantsAutoComp  =
                _tag.startsWith('arianna-') ||
                (ctor as { __ariannaComponent?: boolean }).__ariannaComponent === true ||
                ((globalThis as { __ariannaComponentTags?: Set<string> }).__ariannaComponentTags?.has(_tag) === true) ||
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
            const fragileSpec = Namespace._FRAGILE_PROXY_SPEC[_interface.name];
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
                // DUAL-CALLABLE (Context-Aware): a `new`/Create() call (new.target set)
                // CREATES a fresh element; calling `factory.apply(existingNode)` — no
                // new.target, `this` already an Element — UPGRADES that node in place.
                // `new.target` is the discriminator: `this instanceof Element` alone is
                // ambiguous, because under `new` the fresh `this` already chains to the
                // interface prototype (→ Element). The shared dressing below (Component
                // facilities, default style, FUNCTION body, build()) then runs for BOTH
                // routes, so an Observer/markup upgrade and a programmatic create
                // converge on the identical element shape.
                const _isUpgrade = !(new.target) && (this instanceof Element);
                let el: Element;

                if (_isUpgrade) {
                    el = this as Element;

                    // Idempotent: a node already dressed by this factory is left alone
                    // (re-installing the fragile proxy / re-running the body would be
                    // wrong). build() stays guarded by __isBuilt below regardless.
                    if ((el as Element & { __ariannaUpgraded?: boolean }).__ariannaUpgraded) {
                        return el;
                    }

                    // Splice the correct prototype onto the pre-existing node: the user
                    // CLASS prototype (via _RealClass) for a class, the factory prototype
                    // for a function. A CLASS constructor body cannot be invoked on a
                    // live node, so a class's per-instance setup must live in build()
                    // (run below) — the AriannA authoring rule. A FUNCTION body is run on
                    // the node by the shared `ctor.apply(el)` step below.
                    const _wantProto = isClass
                        ? (_RealClass as { prototype: object }).prototype
                        : (_factory   as { prototype: object }).prototype;
                    if (Object.getPrototypeOf(el) !== _wantProto) {
                        try { Object.setPrototypeOf(el, _wantProto); }
                        catch { /* non-extensible — leave as-is */ }
                    }
                }
                else if (isClass) {
                    // CREATE (class) — Reflect.construct(TARGET, args, newTarget). The TARGET
                    // is whatever actually builds a real DOM node; newTarget only supplies the
                    // prototype. `_ntC` is the ACTUAL ctor under construction — `new.target`
                    // when a subclass reached the factory via super(), else the registered
                    // class — so the element lands on the right prototype ([Y, <Name>, …]).
                    const _ntC = (new.target && (new.target as unknown) !== (_factory as unknown))
                        ? (new.target as unknown as new (...a: unknown[]) => Element)
                        : _RealClass;

                    if (_isNoExtendsClass) {
                        // Emulated extends: _RealClass is a GENUINE `class extends _interface`.
                        // Reflect.construct(_RealClass, args, _ntC) → super(_interface) builds a
                        // REAL element (style accessible) on `_ntC`'s prototype (the THIRD arg:
                        // the subclass under construction, else the class), and the constructor
                        // body runs on it right after super(). If `super` is rejected (raw native
                        // not constructable with an unregistered newTarget → "Illegal
                        // constructor"), fall back to a real createElement + splice + body.
                        try {
                            el = Reflect.construct(_RealClass, args, _ntC);
                        } catch (e) {
                            console.warn(`[arianna] <${_tag}>: emulated-extends construct fell back to createElement:`, e);
                            el = _URI
                                ? document.createElementNS(_URI, _tag)
                                : document.createElement(_tag);
                            try { Object.setPrototypeOf(el, (_ntC as { prototype: object }).prototype); }
                            catch { /* non-extensible */ }
                            const _body = (_RealClass as { __ariannaBody?: (this: Element, ...a: unknown[]) => void }).__ariannaBody;
                            if (typeof _body === 'function') {
                                try { _body.apply(el, args); }
                                catch (e2) { console.warn(`[arianna] <${_tag}> body failed:`, e2); }
                            }
                        }
                    } else {
                        // Extends class: HERE _RealClass's own [[Prototype]] IS the
                        // `HTML[Something]Element` (it literally `extends` it), so _RealClass is
                        // the legitimate TARGET — super() reaches the native and the class's
                        // own body runs. newTarget = the subclass, for its prototype.
                        try {
                            el = Reflect.construct(_RealClass, args, _ntC);
                        } catch (e) {
                            console.warn(`[arianna] <${_tag}>: construct failed (interface not constructable?) — element created without running the class body:`, e);
                            el = _URI
                                ? document.createElementNS(_URI, _tag)
                                : document.createElement(_tag);
                            try { Object.setPrototypeOf(el, (_ntC as { prototype: object }).prototype); }
                            catch { /* non-extensible */ }
                        }
                    }
                } else {
                    // CREATE (function) — we own element creation. Splice the prototype of
                    // the ACTUAL ctor under construction: a subclass `class Y extends
                    // window.<Name>` (=== the factory for FUNCTION form) reaches here via
                    // super() with new.target=Y → splice Y.prototype ([Y, <Name>, Interface,
                    // …]); a direct create (new.target === the factory) splices the factory
                    // prototype. This is the upstream subclass fix for the FUNCTION path.
                    const _ntProto = (new.target && (new.target as unknown) !== (_factory as unknown))
                        ? (new.target as { prototype: object }).prototype
                        : (_factory as { prototype: object }).prototype;
                    el = _URI
                        ? document.createElementNS(_URI, _tag)
                        : document.createElement(_tag);
                    try { Object.setPrototypeOf(el, _ntProto); }
                    catch { /* native non-extensible — fall through */ }
                }

                // For fragile native interfaces (HTMLInputElement, HTMLSelectElement,
                // HTMLCanvasElement, etc.), compose a real native element inside
                // the custom-tag and install property descriptors that forward to
                // it. Visible markup remains <custom-input-class> — no `is=` —
                // while inst.value, inst.checked, inst.focus(), etc. Just Work.
                if (isFragile) {
                    Namespace._installFragileProxy(el, fragileSpec);
                }

                // Apply default _style inline using the Golem v1 pattern via
                // applyRulesToStyle(). The browser's CSSStyleDeclaration is the
                // source of truth for which PascalCase keys translate to which
                // camelCase property names. No regex, no custom mapping table.
                const applyInlineStyle = () => {
                    if (!Object.keys(_style).length) return;
                    const style = (el as HTMLElement).style;
                    if (!style) return;
                    Namespace.applyRulesToStyle(style, _style);
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

            // FUNCTION-form only: also chain the USER ctor's own prototype to the
            // interface prototype. The factory (captured as `const A1a = Core.Define(…)`)
            // already produces [A1a, Interface, …]; but if code instantiates the bare
            // user function directly — `new A1a()` where A1a is the function, not the
            // captured factory — JS builds `this` from the function's own prototype,
            // which otherwise chains straight to Object, giving the broken
            // [A1a, Object] chain. Splicing ctor.prototype → interface.prototype makes
            // that path yield [A1a, Interface, …] too, matching every other path.
            //
            // Cycle-safe: only when ctor.prototype is still un-chained (its proto is
            // Object.prototype). A re-defined function gets a fresh prototype each run,
            // so this never re-mutates an already-chained prototype (which is what
            // produced the old "prototype chain cycle"). CLASS form is skipped — its
            // chain is fixed by `extends`.
            if (!isClass) {
                const _cp = (ctor as { prototype?: object }).prototype;
                const _ip = (_interface as { prototype?: object }).prototype;
                if (_cp && _ip && _cp !== _ip && Object.getPrototypeOf(_cp) === Object.prototype) {
                    try { Object.setPrototypeOf(_cp, _ip); }
                    catch { /* native/non-extensible — leave as-is */ }
                }
            }

            // Reuse the legacy descriptor (shape with types.custom etc.) — other
            // modules expect descriptor.Namespace to have that shape, not the
            // PascalCase class instance.
            const legacyDesc = this.toDescriptor();

            const descriptor: TypeDescriptor = {
                Name        : ctor.name,
                Tags        : [_tag],
                Namespace   : legacyDesc,
                Constructor : _RealClass  as TypeDescriptor['Constructor'],
                Interface   : _interface as TypeDescriptor['Interface'],
                Prototype   : (isClass
                    ? (_RealClass as { prototype: object }).prototype
                    : (_factory   as { prototype: object }).prototype),
                Supported   : true,
                Defined     : true,
                Declaration : isClass ? 'CLASS' : 'FUNCTION',
                Native      : native,
                Chain       : chain,
                Type        : 'CUSTOM',
                Standard    : false,
                Custom      : true,
                Style       : _style,
                // Factory exposed on descriptor for advanced access
                Factory     : _factory,
                // Markup-upgrade hook. Single source of truth is the Namespace.Update
                // METHOD — Core routes every markup upgrade through d.Namespace.Update
                // (the method exposed by toDescriptor()), so this descriptor-level hook
                // exists only for the Core.Upgrade `else if (d.Update)` fallback. It
                // delegates so the two can never diverge. (It previously held a 65-line
                // twin that spliced _factory.prototype while the method splices
                // ctor.prototype — dead AND divergent.)
                Update: (el: Element) => this.Update(el, descriptor),
            };

            this.Custom.Interfaces[ctor.name] = descriptor;
            this.Custom.Tags[_tag]            = descriptor;
            this.tags[_tag]                    = descriptor;

            // Apply default CSS as a stylesheet rule for the tag.
            //
            // Supports every style form the public API accepts:
            //   • flat   { Prop: 'val', … }                  → scoped to the tag
            //   • nested { selector: { Prop: 'val' }, … }    → one rule per selector
            //   • Rule / Stylesheet instances               → their serialized .Text
            //     (duck-typed via `.Text` so Namespace needs no import of those
            //      classes — avoids a Stylesheet→Namespace import cycle)
            //
            // Authored `:host` selectors (the natural scope for component CSS) are
            // rewritten to the TAG selector for this head <style>, so the rules also
            // style LIGHT-DOM (no-shadow) components — a head stylesheet cannot use
            // :host to reach a light-DOM element. Shadow components additionally get
            // :host styling inside their shadow (Step 7 / _applySheet); the head copy
            // simply also matches the host element by tag, which is harmless.
            {
                const _hostToTag = (css: string): string =>
                    css
                        .replace(/:host\(([^)]*)\)/g, `${_tag}$1`)
                        .replace(/:host\b/g, _tag);

                const emitCss = (): string | null => {
                    const s = _style as unknown;
                    if (!s) return null;

                    // Rule / Stylesheet instances expose a serialized `.Text`.
                    const asText = (s as { Text?: unknown }).Text;
                    if (typeof asText === 'string' && asText.trim()) {
                        return _hostToTag(asText);
                    }

                    if (typeof s === 'object') {
                        const obj  = s as Record<string, unknown>;
                        const keys = Object.keys(obj);
                        if (!keys.length) return null;

                        // Nested form: any value is itself an object → {selector:{props}}.
                        const nested = keys.some((k) => obj[k] !== null && typeof obj[k] === 'object');
                        if (nested) {
                            const parts: string[] = [];
                            for (const sel of keys) {
                                const props = obj[sel];
                                if (!props || typeof props !== 'object') continue;
                                const probe = document.createElement('style').style;
                                Namespace.applyRulesToStyle(probe, props as Record<string, string>);
                                if (probe.cssText) parts.push(`${_hostToTag(sel)}{${probe.cssText}}`);
                            }
                            return parts.length ? parts.join('\n') : null;
                        }

                        // Flat form → scope to the tag (dual selector: bare tag + is=).
                        const probe = document.createElement('style').style;
                        Namespace.applyRulesToStyle(probe, obj as Record<string, string>);
                        return probe.cssText ? `${_tag},[is="${_tag}"]{${probe.cssText}}` : null;
                    }
                    return null;
                };

                try {
                    const css = typeof document !== 'undefined' ? emitCss() : null;
                    if (css) {
                        const styleEl = document.createElement('style');
                        styleEl.textContent = css;
                        styleEl.setAttribute('data-arianna-tag-style', _tag);
                        (document.head ?? document.documentElement).appendChild(styleEl);
                    }
                } catch { /* DOM not ready, skip */ }
            }

            // Fire 'arianna-wip:defined' for listeners
            if (typeof document !== 'undefined') {
                document.dispatchEvent(new CustomEvent('arianna-wip:defined', {
                    detail: { tag: _tag, descriptor },
                }));
            }

            // ── Legacy parity (Component.js Define/Extends ~6100): install the
            // constructor as the GLOBAL binding under the ctor name —
            // `window[Class.name] = …`. For a FUNCTION it's the factory (createElement
            // + body); for a CLASS it's `_RealClass` (the createDynamicWrapper — super()
            // allocates a real element, the body runs on it). With this, where
            // `CustomElement` resolves to the global, `new CustomElement()` builds a
            // REAL element instead of a plain object whose `this.style` throws.
            //
            // RESOLUTION CAVEAT (ES scoping, NOT a framework choice): this only takes
            // effect where `CustomElement` resolves to the GLOBAL binding — code at
            // global scope, or `new window.CustomElement()`. A `class CustomElement {}`
            // (or a function) declared in a local/eval scope creates a LEXICAL binding
            // that SHADOWS the global, so `new CustomElement()` there still hits the
            // lexical declaration. The robust pattern is to capture the return
            // (`const CustomElement = Core.Define(…)`) or use Core.Create('custom').
            //
            // Skipped for the clean form (ctor === interface) so a native interface
            // global (HTMLElement, HTMLDivElement, …) is never clobbered.
            if ((ctor as unknown) !== (_interface as unknown) && ctor.name)
            {
                const _win = (typeof window !== 'undefined' ? window : globalThis) as Record<string, unknown>;
                // UNIFORM (the upstream fix): install the dual-callable FACTORY for BOTH
                // functions and classes. Then EVERY construction route converges on the
                // factory's correct-order build:
                //   • `new window.<Name>()`            → factory (new.target = factory)
                //   • `class Y extends window.<Name>`  → super() → factory (new.target = Y)
                //     → the factory splices Y's prototype, so the subclass is in the chain
                //       ([Y, <Name>, Interface, …]) — for functions AND classes alike.
                // A no-extends class's _RealClass is NOT a constructable element factory
                // (it has no real super()), so installing IT here would make `new
                // window.<Name>()` build an empty {} — the factory must front it.
                // The Update repoint stays correct: it re-points only to a candidate whose
                // prototype chain actually contains desc.Constructor, and the factory's
                // prototype (chained straight to the interface) fails that test, so it is
                // never mistaken for the user class.
                try { _win[ctor.name] = _factory; }
                catch { /* frozen / non-writable global — leave as-is */ }
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
                const currentCtor = desc.Constructor as Function;

                // (1) EXPLICIT BINDING — the old Component.js way: use the bound
                //     class directly. Component.Define (clean form) sets desc.Class,
                //     and the first `new` captures it via new.target. No global hunt.
                const bound = desc.Class as Function | null | undefined;
                if (typeof bound === 'function' && bound !== currentCtor) {
                    (desc as { Constructor: Function }).Constructor = bound;
                    (desc as { Prototype: object }).Prototype      = (bound as { prototype: object }).prototype;
                    cachedDesc.__userResolved = true;
                } else {
                    const tag = desc.Tags[0] ?? '';

                    // Verify a candidate transitively extends the current Bound,
                    // then re-point the descriptor to it. Caches ONLY on success,
                    // so an upgrade that runs before the class is registered can
                    // still resolve on a later pass (no poisoning).
                    const tryRepoint = (candidate: unknown): boolean => {
                        if (typeof candidate !== 'function' || candidate === currentCtor) return false;
                        let proto = (candidate as Function).prototype;
                        let extendsBound = false;
                        while (proto && proto !== Object.prototype) {
                            if (proto === currentCtor.prototype) { extendsBound = true; break; }
                            proto = Object.getPrototypeOf(proto);
                        }
                        if (!extendsBound) return false;
                        (desc as { Constructor: Function }).Constructor = candidate as Function;
                        (desc as { Prototype: object }).Prototype       = (candidate as { prototype: object }).prototype;
                        cachedDesc.__userResolved = true;
                        return true;
                    };

                    // (1b) REGISTRY — Component.Define(tag, subclass) records the
                    //      binding in this shared map, so resolution does NOT depend
                    //      on a global window.<PascalCase> export.
                    const reg = (globalThis as { __ariannaSubclassByTag?: Map<string, Function> }).__ariannaSubclassByTag;
                    if (!tryRepoint(reg?.get(tag))) {
                        // (2) FALLBACK — globally-exposed class window.<PascalCase>.
                        const win = (typeof window !== 'undefined' ? window : globalThis) as Record<string, unknown>;
                        const pretty = tag
                            .replace(/^arianna-/, '')
                            .replace(/-(.)/g, (_, c: string) => c.toUpperCase())
                            .replace(/^./, c => c.toUpperCase());
                        tryRepoint(win[pretty]);
                    }
                }
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

                // FUNCTION-form elements are spliced IN PLACE (exactly like the
                // factory `new A1a()` does): they carry the interface in their
                // prototype chain via desc.Prototype without needing a real native
                // element. Coercing them to <canvas>/<button>/… would create a
                // replacement and orphan the original markup node (so a reference
                // taken before upgrade — e.g. querySelector('#id') or a stashed
                // createElement('custom') — would still point at the un-upgraded
                // element, reading as HTMLUnknownElement). Only CLASS forms whose
                // interface TRULY needs native internals — the FRAGILE interfaces
                // (HTMLInputElement, HTMLCanvasElement, HTMLVideoElement, …) — are
                // coerced to a real native element. A generic base like
                // HTMLDivElement needs no native internals: splicing its prototype
                // onto the existing <custom> node gives the full chain in place
                // WITHOUT orphaning the caller's reference. The fragility gate below
                // is the check this condition was missing (the comment always said
                // "only forms that truly need native internals", but the test never
                // enforced it — so every class on a non-HTMLElement base was being
                // replaced, breaking markup/Observer upgrade for the common case).
                const fragile = !!Namespace._FRAGILE_PROXY_SPEC[ifaceName];
                if (desc.Declaration !== 'FUNCTION' && fragile
                    && !matchesInterface && baseTag && ifaceName !== 'HTMLElement' && node.tagName.toLowerCase() !== baseTag) {
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

            // Step 1: splice the registered prototype onto the node.
            // Legacy model: desc.Prototype is already chained to the interface
            // (the factory prototype for FUNCTION form, or the user subclass
            // prototype — which natively `extends` the base — for CLASS form). We
            // splice THAT and never mutate ctor.prototype: doing so threw
            // "prototype chain cycle" on re-runs / patched native bases and left
            // the chain stuck on HTMLElement.
            try {
                const proto = (desc.Prototype ?? (ctor as { prototype: object }).prototype) as object;
                // Don't flatten an already-more-derived node: if `proto` is already
                // in the node's prototype chain (e.g. the node is a `new Subclass()`
                // instance whose chain passes through the registered prototype),
                // re-splicing would drop the subclass layer. Splice only when it
                // ADDS the registered prototype (the normal raw-element upgrade).
                if (!Object.prototype.isPrototypeOf.call(proto, node)) {
                    Object.setPrototypeOf(node, proto);
                }
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
            const spec      = Namespace._FRAGILE_PROXY_SPEC[ifaceName];
            if (spec) {
                try { Namespace._installFragileProxy(node, spec); }
                catch (e) { console.warn(`[arianna] fragile proxy install failed on <${desc.Tags[0]}>:`, e); }
            }

            // Step 3: apply default CSS inline (Golem v1 pattern)
            const styleRules = (desc.Style ?? {}) as Record<string, string>;
            if (Object.keys(styleRules).length > 0) {
                const style = (node as HTMLElement).style;
                if (style) Namespace.applyRulesToStyle(style, styleRules);
            }

            // Step 4: optional Component(this) auto-install
            const win = (typeof window !== 'undefined' ? window : globalThis) as unknown as { Component?: (el: Element) => Element };
            const ctorSrc = (() => { try { return ctor.toString(); } catch { return ''; } })();
            const wantsAutoComponent =
                (desc.Tags[0]?.startsWith('arianna-') ?? false) ||
                ((globalThis as { __ariannaComponentTags?: Set<string> }).__ariannaComponentTags?.has(desc.Tags[0] ?? '') === true) ||
                (ctor as { __ariannaComponent?: boolean }).__ariannaComponent === true ||
                /\bComponent\s*\(\s*this\s*\)/.test(ctorSrc);

            if (wantsAutoComponent && typeof win.Component === 'function') {
                try { win.Component(node); }
                catch (e) { console.warn(`[arianna] Component(el) failed for <${desc.Tags[0]}>`, e); }
            }

            // Snapshot authored markup content BEFORE the body/build run, so
            // content written between the tags wins over a default the body or
            // build() assigns (mirrors the component path in _installFacilities).
            // Pure-whitespace children (indentation) don't count.
            const _authoredNodes = Array.from(node.childNodes);
            const _hasAuthored   = _authoredNodes.some((n) =>
                n.nodeType === 1
                || (n.nodeType === 3 && (n.textContent ?? '').trim() !== ''));

            // Step 5: run the user's body for FUNCTION form only.
            // CLASS form CANNOT have its constructor body invoked here — class
            // constructors require `new`. Users who want setup logic on
            // markup-instantiated classes must put it in `build()` below.
            //
            // Guard: `ctor` is only callable as a plain function when it is a
            // genuine user function. For class-form / decorator registrations
            // whose base is a NATIVE constructor (HTMLDivElement, …) or whose
            // resolved ctor is a `class`, calling it as a function throws
            // ("Illegal constructor" / "cannot be invoked without 'new'"). Those
            // have no free-standing body to run here — their setup is build()
            // (Step 6) — so skip them instead of logging a spurious failure.
            if (desc.Declaration === 'FUNCTION') {
                const src = typeof ctor === 'function' ? Function.prototype.toString.call(ctor) : '';
                const isCallableBody = !!src && !/^\s*class\b/.test(src) && !src.includes('[native code]');
                if (isCallableBody) {
                    try { (ctor as unknown as (this: Element) => void).call(node); }
                    catch (e) { console.warn(`[arianna] FUNCTION ctor body failed for <${desc.Tags[0]}>`, e); }
                }
            }
            else {
                // CLASS form: a class constructor can't be invoked on an existing
                // element, but createDynamicWrapper attached the constructor's body as
                // a super-less function (__ariannaBody) for exactly this path. Present
                // only for a wrapped NO-EXTENDS class; an extends class has none, so it
                // keeps the original behaviour (body runs only on construction / build).
                const bodyFn = (ctor as { __ariannaBody?: (this: Element) => void }).__ariannaBody;
                if (typeof bodyFn === 'function') {
                    try { bodyFn.call(node); }
                    catch (e) { console.warn(`[arianna] CLASS body failed for <${desc.Tags[0]}>`, e); }
                }
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

            // Authored markup content overrides whatever the body / build() set.
            if (_hasAuthored) {
                try { (node as unknown as { replaceChildren: (...n: Node[]) => void }).replaceChildren(..._authoredNodes); }
                catch { /* ignore — keep body/build output */ }
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

            // Retrieve def (shadow / attrs). Component() sets it via the factory;
            // FUNCTION-form sets it via Core.Define's __ariannaDef stamp. After
            // descriptor repoint, ctor is the resolved user class/function.
            const ctorWithDef = ctor as unknown as { __ariannaDef?: Record<string, unknown> };
            const def         = ctorWithDef.__ariannaDef ?? {};
            const defShadow   = def.shadow;
            const hasTemplate = !!hostWithTpl.template && !hostWithTpl.__templateRendered;

            // Shadow mode. Templates default to closed; a no-template body
            // (this.textContent / light-DOM children) only gets a shadow when one
            // is EXPLICITLY requested, so plain light-DOM components (no def.shadow,
            // e.g. case-1a…1d) keep rendering directly in the light DOM.
            let shadowMode: 'open' | 'closed' | false = false;
            if (defShadow === false)                               shadowMode = false;
            else if (defShadow === 'open')                         shadowMode = 'open';
            else if (defShadow === 'closed' || defShadow === true) shadowMode = 'closed';
            else if (hasTemplate && defShadow === undefined)       shadowMode = 'closed';

            if (hasTemplate)
            {
                hostWithTpl.__templateRendered = true;
                const tpl = hostWithTpl.template!;

                // Find or create the render target.
                let renderTarget: ParentNode = node;
                if (shadowMode !== false) {
                    const sr = Namespace._attachAriannaShadow(node, shadowMode);
                    if (sr) renderTarget = sr;
                    else {
                        // attachShadow can fail for elements that don't support it
                        // (e.g. <img>, customized built-ins on certain interfaces).
                        // Fall back to light DOM.
                        console.warn(`[arianna] attachShadow failed for <${desc.Tags[0]}>, falling back to light DOM.`);
                        renderTarget = node;
                    }
                }

                const signals = hostWithTpl.__attrSignals ?? {};

                try {
                    if (typeof tpl.attach === 'function') {
                        // v3 API
                        tpl.attach(renderTarget, node, signals);
                    } else if (typeof tpl.mount === 'function') {
                        // v2 legacy fallback
                        tpl.mount(renderTarget as Element, node);
                    }
                } catch (e) {
                    console.warn(`[arianna] template render failed for <${desc.Tags[0]}>:`, e);
                }
            }
            else if (shadowMode !== false)
            {
                // No template, but an explicit shadow was requested — e.g. a
                // FUNCTION-form `def: { shadow: 'open' }` (case-1e…1h, 1l). Attach
                // the shadow and insert a default <slot> so the body's light-DOM
                // content (this.textContent / authored markup) projects through —
                // the same contract the Component() shadow examples use. The
                // component's CSS (a light-DOM tag-selector rule) still styles the
                // :host box. Without this, def.shadow on a textContent-style body
                // would silently render nothing inside the shadow.
                const sr = Namespace._attachAriannaShadow(node, shadowMode);
                if (sr && !(sr as unknown as ParentNode).querySelector?.('slot')) {
                    sr.appendChild(document.createElement('slot'));
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
                    !(native as unknown as Record<symbol, boolean | undefined>)[Namespace.PATCHED_FLAG])
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
                        // Walk UP the constructor chain to the nearest registered Custom in
                        // this NS. The most-derived ctor of a subclass — e.g.
                        // `class Y extends CustomElement {}` — is itself unregistered, so a
                        // direct GetDescriptor(Y) misses and the element would be built under
                        // the native interface tag ('div'). Its registered ancestor
                        // (CustomElement) carries the real custom tag, so we climb until we
                        // find it and create under THAT tag.
                        let c: unknown = userCtor;
                        while (c && typeof c === 'function'
                            && c !== (wrapped as unknown) && c !== (native as unknown)) {
                            const custom = self.GetDescriptor(c as new () => Element);
                            if (custom && custom.Custom && custom.Tags && custom.Tags[0]) {
                                // Only use the custom tag as nodeName for HTML namespace.
                                // SVG/MathML/X3D need the native base tag for the engine
                                // to actually render the element.
                                if (!useNS) tagToCreate = custom.Tags[0];
                                break;
                            }
                            c = Object.getPrototypeOf(c);
                        }
                        if (userCtor.prototype) userProto = userCtor.prototype;
                    }
                } catch { /* fall through to base */ }

                // ── Lazy subclass capture for native-base components ──────────
                //  `class X extends Component(tag, NativeBase, …)` cannot pass X
                //  at registration (X is defined AFTER the Component(…) call), so
                //  desc.Class stays null and the markup / Core.Create / Real paths
                //  splice the base factory prototype — chain headed by the base,
                //  not X. The first `new X()` is the earliest point X is known and
                //  it lands HERE (X's super is this patched native ctor).
                //
                //  Two things happen here, once per class (cached on it):
                //   1. Bind X to its component descriptor (desc.Class = X) so the
                //      Update repoint / Core.Create splice X.prototype ([X, Base, …]).
                //   2. Switch tagToCreate to X's component tag so the element enters
                //      the upgrade pipeline (Update → facilities → build()/CSS). Left
                //      as the bare base tag, the parser/Update treat it as a plain
                //      native element and skip styling and build().
                //
                //  Binding picks the most-recently-registered still-unbound component
                //  tag for this base (Set preserves insertion order; a class is
                //  defined right after its Component(…) call). Ambiguous orderings
                //  can use the explicit Component.Define(tag, X).
                try {
                    const sub = this.constructor as (new (...a: unknown[]) => Element)
                        & { __ariannaBoundTag?: string };
                    if (typeof sub === 'function'
                        && (sub as unknown) !== (wrapped as unknown)
                        && (sub as unknown) !== (native as unknown))
                    {
                        if (!sub.__ariannaBoundTag) {
                            const superCtor = Object.getPrototypeOf(sub) as unknown;
                            const tags = (globalThis as { __ariannaComponentTags?: Set<string> }).__ariannaComponentTags;
                            if (tags && superCtor) {
                                let match: TypeDescriptor | null = null;
                                for (const t of tags) {
                                    const d = self.GetDescriptor(t);
                                    if (d && d.Custom && !d.Class && (d.Constructor as unknown) === superCtor) {
                                        match = d; // last (most recent) unbound match wins
                                    }
                                }
                                if (match) {
                                    (match as { Class: (new (...a: unknown[]) => Element) | null }).Class = sub;
                                    sub.__ariannaBoundTag = (match as { Tags: string[] }).Tags[0];
                                }
                            }
                        }
                        // Create under the component tag so the upgrade pipeline runs,
                        // AND so an HTMLElement-based component is never created under
                        // the HTMLElement interface's misleading base tag ('address',
                        // the first generic tag mapped to HTMLElement). Sources, in
                        // order: lazy-bound clean-form tag, then the decorator/explicit
                        // Component.Define tag stamped on the class.
                        const customTag = sub.__ariannaBoundTag
                            ?? (sub as { __ariannaTag?: string }).__ariannaTag;
                        if (!useNS && customTag) tagToCreate = customTag;
                    }
                } catch { /* non-fatal: fall back to Component.Define */ }

                // 2. Create the element with the correct namespace
                const el = useNS && URI
                    ? document.createElementNS(URI, tagToCreate) as unknown as Element
                    : document.createElement(tagToCreate);

                // Rename nodeName to the resolved tag (Component.js parity): for a
                // subclass built above under its registered ancestor's custom tag, the
                // node must report that custom tag, not the native interface's.
                if (!useNS && tagToCreate !== baseTag) {
                    try { Object.defineProperty(el, 'nodeName', { value: tagToCreate.toUpperCase(), configurable: true }); }
                    catch { /* read-only in this engine — leave as-is */ }
                }

                // 3. Splice the user prototype onto the element
                return Object.setPrototypeOf(el, userProto);
            };

            Object.defineProperty(wrapped, 'name', { value: ifaceName });
            (wrapped as unknown as { prototype: object }).prototype             = nativeProto;
            (wrapped as unknown as { prototype: { constructor?: unknown } }).prototype.constructor = wrapped;
            (wrapped as unknown as Record<symbol, boolean>)[Namespace.PATCHED_FLAG]  = true;

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
        // Returns the `NamespaceDescriptor` shape (lowercase 'types') that
        // Core.GetDescriptor and other modules expect. Create / Update / Define are
        // exposed directly on the descriptor (no `functions` indirection); we keep the
        // modern PascalCase API (Standard, Custom, …) while exposing this view.

        toDescriptor(): NamespaceDescriptor
        {
            const self = this;
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
    //  since Namespace+Supported are auto-populated by Namespace.Initialize().
    //
    //  DO NOT add or remove entries based on guesswork — these tables come from
    //  the W3C IDL definitions and reflect the canonical native interface map.
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Install the built-in namespaces (html / svg / mathML / x3d). Each `new Namespace`
     * auto-registers into Core.Namespaces via its constructor (§6); Install() makes that
     * registration an explicit, ordered boot step — loader sequence:
     *   Core.Initialize()  ->  Namespace.Install()  ->  Core.Bootstrap()
     * — instead of an import-time side-effect. Merged onto the class as Namespace.Install().
     */
    export function Install(): { html: Namespace; svg: Namespace; mathML: Namespace; x3d: Namespace }
    {
        const html   = new Namespace('html', {
    URI    : 'http://www.w3.org/1999/xhtml',
    NS     : false,
    base   : HTMLElement,
    schema : 'http://www.w3.org/1999/xhtml',
    documentation: { w3c: 'https://html.spec.whatwg.org/' },
    Standard: {
        HTMLElement              : { Tags: [
            'address','article','footer','header','section','nav','dd','dt',
            'figcaption','figure','main','abbr','b','bdi','bdo','cite','code',
            'dfn','em','i','mark','rt','rtc','ruby','s','samp','small','strong',
            'sub','sup','u','var','wbr','area','noscript','noembed','plaintext',
            'strike','tt','summary','acronym','basefont','big','center',
        ] },
        HTMLUnknownElement       : { Tags: ['isindex','spacer','menuitem','decorator','applet','blink','keygen'] },
        HTMLHtmlElement          : { Tags: ['html'] },
        HTMLBaseElement          : { Tags: ['base'] },
        HTMLHeadElement          : { Tags: ['head'] },
        HTMLLinkElement          : { Tags: ['link'] },
        HTMLMetaElement          : { Tags: ['meta'] },
        HTMLStyleElement         : { Tags: ['style'] },
        HTMLTitleElement         : { Tags: ['title'] },
        HTMLPreElement           : { Tags: ['pre','listing','xmp'] },
        HTMLHeadingElement       : { Tags: ['h1','h2','h3','h4','h5','h6'] },
        HTMLDivElement           : { Tags: ['div'] },
        HTMLDListElement         : { Tags: ['dl'] },
        HTMLHRElement            : { Tags: ['hr'] },
        HTMLLIElement            : { Tags: ['li'] },
        HTMLOListElement         : { Tags: ['ol'] },
        HTMLParagraphElement     : { Tags: ['p'] },
        HTMLUListElement         : { Tags: ['ul'] },
        HTMLAnchorElement        : { Tags: ['a'] },
        HTMLBRElement            : { Tags: ['br'] },
        HTMLQuoteElement         : { Tags: ['quote'] },
        HTMLSpanElement          : { Tags: ['span'] },
        HTMLAudioElement         : { Tags: ['audio'] },
        HTMLImageElement         : { Tags: ['img'] },
        HTMLMapElement           : { Tags: ['map'] },
        HTMLTrackElement         : { Tags: ['track'] },
        HTMLVideoElement         : { Tags: ['video'] },
        HTMLEmbedElement         : { Tags: ['embed'] },
        HTMLIFrameElement        : { Tags: ['iframe'] },
        HTMLObjectElement        : { Tags: ['object'] },
        HTMLParamElement         : { Tags: ['param'] },
        HTMLSourceElement        : { Tags: ['source'] },
        HTMLCanvasElement        : { Tags: ['canvas'] },
        HTMLScriptElement        : { Tags: ['script'] },
        HTMLModElement           : { Tags: ['ins','del'] },
        HTMLTableCaptionElement  : { Tags: ['caption'] },
        HTMLTableColElement      : { Tags: ['col','colgroup'] },
        HTMLTableElement         : { Tags: ['table'] },
        HTMLTableSectionElement  : { Tags: ['tbody','thead','tfoot'] },
        HTMLTableCellElement     : { Tags: ['td','th'] },
        HTMLTableRowElement      : { Tags: ['tr'] },
        HTMLButtonElement        : { Tags: ['button'] },
        HTMLDataListElement      : { Tags: ['datalist'] },
        HTMLFieldSetElement      : { Tags: ['fieldset'] },
        HTMLFormElement          : { Tags: ['form'] },
        HTMLInputElement         : { Tags: ['input'] },
        HTMLLabelElement         : { Tags: ['label'] },
        HTMLLegendElement        : { Tags: ['legend'] },
        HTMLOptGroupElement      : { Tags: ['optgroup'] },
        HTMLOptionElement        : { Tags: ['option'] },
        HTMLProgressElement      : { Tags: ['progress'] },
        HTMLSelectElement        : { Tags: ['select'] },
        HTMLTextAreaElement      : { Tags: ['textarea'] },
        HTMLMenuElement          : { Tags: ['menu'] },
        HTMLDirectoryElement     : { Tags: ['dir'] },
        HTMLFrameElement         : { Tags: ['frame'] },
        HTMLFrameSetElement      : { Tags: ['frameset'] },
    },
});
        const svg    = new Namespace('svg', {
    URI    : 'http://www.w3.org/2000/svg',
    NS     : true,
    base   : SVGElement,
    schema : 'http://www.w3.org/2000/svg',
    documentation: { w3c: 'https://www.w3.org/TR/SVG2/' },
    Standard: {
        SVGAElement                         : { Tags: ['a'] },
        SVGAltGlyphDefElement               : { Tags: ['altglyph'] },
        SVGAltGlyphElement                  : { Tags: ['altglyph'] },
        SVGAltGlyphItemElement              : { Tags: ['altglyph'] },
        SVGAnimateColorElement              : { Tags: ['animatecolor'] },
        SVGAnimateElement                   : { Tags: ['animate'] },
        SVGAnimateMotionElement             : { Tags: ['animatemotion'] },
        SVGAnimateTransformElement          : { Tags: ['animatetransform'] },
        SVGAnimationElement                 : { Tags: ['animate','animatemotion','animatetransform'] },
        SVGCircleElement                    : { Tags: ['circle'] },
        SVGClipPathElement                  : { Tags: ['clippath'] },
        SVGCursorElement                    : { Tags: ['cursor'] },
        SVGDefsElement                      : { Tags: ['defs'] },
        SVGDescElement                      : { Tags: ['desc'] },
        SVGEllipseElement                   : { Tags: ['ellipse'] },
        SVGFEBlendElement                   : { Tags: ['feblend'] },
        SVGFEColorMatrixElement             : { Tags: ['fecolormatrix'] },
        SVGFEComponentTransferElement       : { Tags: ['fecomponenttransfer'] },
        SVGFECompositeElement               : { Tags: ['fecomposite'] },
        SVGFEConvolveMatrixElement          : { Tags: ['feconvolvematrix'] },
        SVGFEDiffuseLightingElement         : { Tags: ['fediffuselighting'] },
        SVGFEDisplacementMapElement         : { Tags: ['fedispatchmap'] },
        SVGForeignObjectElement             : { Tags: ['foreignobject'] },
        SVGGElement                         : { Tags: ['g'] },
        SVGGlyphElement                     : { Tags: ['glyph'] },
        SVGGlyphRefElement                  : { Tags: ['glyphref'] },
        SVGGradientElement                  : { Tags: ['lineargradient','radialgradient'] },
        SVGHKernElement                     : { Tags: ['hkern'] },
        SVGImageElement                     : { Tags: ['image'] },
        SVGLinearGradientElement            : { Tags: ['lineargradient'] },
        SVGLineElement                      : { Tags: ['line'] },
        SVGMarkerElement                    : { Tags: ['marker'] },
        SVGMaskElement                      : { Tags: ['mask'] },
        SVGMetadataElement                  : { Tags: ['metadata'] },
        SVGMissingGlyphElement              : { Tags: ['missing-glyph'] },
        SVGMPathElement                     : { Tags: ['mpath'] },
        SVGPathElement                      : { Tags: ['path'] },
        SVGPolygonElement                   : { Tags: ['polygon'] },
        SVGPolylineElement                  : { Tags: ['polyline'] },
        SVGRadialGradientElement            : { Tags: ['radialgradient'] },
        SVGRectElement                      : { Tags: ['rect'] },
        SVGScriptElement                    : { Tags: ['script'] },
        SVGSetElement                       : { Tags: ['set'] },
        SVGStopElement                      : { Tags: ['stop'] },
        SVGStyleElement                     : { Tags: ['style'] },
        SVGSVGElement                       : { Tags: ['svg'] },
        SVGSwitchElement                    : { Tags: ['switch'] },
        SVGSymbolElement                    : { Tags: ['symbol'] },
        SVGTextContentElement               : { Tags: ['text','tspan','tref','altglyph','textpath'] },
        SVGTextElement                      : { Tags: ['text'] },
        SVGTextPathElement                  : { Tags: ['textpath'] },
        SVGTextPositioningElement           : { Tags: ['altglyph','text','tspan'] },
        SVGTitleElement                     : { Tags: ['title'] },
        SVGTRefElement                      : { Tags: ['tref'] },
        SVGTSpanElement                     : { Tags: ['tspan'] },
        SVGUseElement                       : { Tags: ['use'] },
        SVGViewElement                      : { Tags: ['view'] },
        SVGVKernElement                     : { Tags: ['vkern'] },
    },
});

// ─────────────────────────────────────────────────────────────────────────────
//  MathML namespace — reconstructed in the same compact form as HTML/SVG above.
//  MathML 3 specification reference: https://www.w3.org/TR/MathML3/
// ─────────────────────────────────────────────────────────────────────────────
        const mathML = new Namespace('mathML', {
    URI    : 'http://www.w3.org/1998/Math/MathML',
    NS     : true,
    base   : (typeof MathMLElement !== 'undefined' ? MathMLElement : HTMLElement) as new (...a: never[]) => Element,
    schema : 'http://www.w3.org/1998/Math/MathML',
    documentation: { w3c: 'https://www.w3.org/TR/MathML3/' },
    Standard: {
        MathMLElement: { Tags: [
            'math','mi','mo','mn','ms','mspace','mtext',
            'mfrac','msqrt','mroot','mstyle','merror','mpadded','mphantom',
            'mrow','mfenced','menclose',
            'msub','msup','msubsup','munder','mover','munderover','mmultiscripts',
            'mtable','mtr','mtd','mlabeledtr',
            'maction',
        ] },
    },
});

// ─────────────────────────────────────────────────────────────────────────────
//  X3D namespace — reconstructed in the same compact form. X3D has no
//  pre-registered native interface in browsers; the namespace is reserved
//  for plugin-style registration via `new Namespace(...)` at runtime.
//  Specification reference: https://www.web3d.org/specifications/x3d-4.0/
// ─────────────────────────────────────────────────────────────────────────────
        const x3d    = new Namespace('x3d', {
    URI    : 'http://www.web3d.org/specifications/x3d-namespace',
    NS     : true,
    base   : HTMLElement,
    schema : 'http://www.web3d.org/specifications/x3d-namespace',
    documentation: { w3c: 'https://www.web3d.org/specifications/x3d-4.0/' },
    Standard: {},
});

        return { html, svg, mathML, x3d };
    }
}

export default Namespace;
