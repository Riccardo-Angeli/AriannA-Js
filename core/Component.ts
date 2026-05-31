/**
 * @module    core/Component
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * Component — dual-callable function + namespace. ♡ Arianna.
 *
 * Reimplements the legacy Golem Component logic (Component.js, 12421 LOC)
 * in modern TypeScript, leveraging the existing Core / Namespace / Real /
 * Virtual primitives.  Distilled from the canonical Define algorithm:
 *
 *   1) GetDescriptor(Interface) — must be Standard, throws otherwise
 *   2) Build window[Class.name] as a FACTORY:
 *        const el = namespace.Create(_tag);
 *        if (componentMarker) Component(el);   // install AriannA facilities
 *        if (isFunction)      Class.apply(el, args);
 *        return Object.setPrototypeOf(el, this.constructor.prototype);
 *   3) Splice the prototype chain:
 *        Object.setPrototypeOf(window[Class.name], _interface);
 *        Object.setPrototypeOf(window[Class.name].prototype, _interface.prototype);
 *        window[Class.name].prototype.constructor = window[Class.name];
 *   4) Register the descriptor in namespace.Custom.{interfaces,tags}
 *
 * Result: `new MyCustom()` and `<my-custom>` markup both produce DOM
 * elements with identical prototype chains — without DFS / MutationObserver
 * tricks.  Core.Observer only handles markup-instantiated elements via the
 * descriptor.Update(el) callback already present in Core.Define.
 *
 * # The five forms (all equivalent in final DOM)
 *
 *   A) function MyFn() { /* no Component(this); raw tag * / }
 *      Core.Define('my-fn', MyFn);
 *
 *   B) class MyB { constructor() { Component(this); } }
 *      Core.Define('my-b', MyB);
 *
 *   C) class MyC extends HTMLDivElement {
 *          constructor() { super(); Component(this); }
 *      }
 *      Core.Define('my-c', MyC);
 *
 *   D) class MyD extends SVGCircleElement {
 *          constructor() { super(); Component(this); }
 *      }
 *      Core.Define('my-d', MyD);
 *
 *   E) class MyE extends Component('arianna-e', HTMLButtonElement) {
 *          build() { /* user code * / }
 *      }
 *
 * # Component factory signatures
 *
 *   Component(el)                                   // instance form
 *   Component(tag, Base)                            // 2 args
 *   Component(tag, Base, css)                       // 3 args — pure CSS
 *   Component(tag, Base, css, def)                  // 4 args — split form
 *   Component(tag, Base, { ...css, ...def })        // 3 args — compact mixed
 */

import Core, {
    Define as CoreDefine,
    GetDescriptor,
    GetPrototypeChain,
    Namespaces,
} from './Core.ts';
import { signal, effect, type Signal } from './Observable.ts';
import { Stylesheet } from './Stylesheet.ts';
import type { SheetObjectDef } from './Stylesheet.ts';
import Rule from './Rule.ts';
import { readDottedPath, writeDottedPath, makeSubAccessor, type SubAccessor } from './Real.ts';
import Real from './Real.ts';
import Virtual, { VirtualNode } from './Virtual.ts';
import {
    AttachAriannaShadow,
    RenderIntoAriannaShadow,
    IsAriannaShadow,
    IsIframeBackend,
    type AriannaShadow,
    type AriannaShadowOptions,
} from './Shadow.ts';

// ─────────────────────────────────────────────────────────────────────────────
//  Public types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shadow mode setting. See SHADOW.md for the architectural model.
 *   - 'open' / 'closed' → native attachShadow with given mode; falls back to
 *                         AriannaShadow (light backend) on failure
 *   - 'iframe'          → AriannaShadow with iframe backend (hard isolation)
 *   - 'arianna'         → AriannaShadow with light backend, forced even when
 *                         native would work (useful for testing the polyfill)
 *   - true              → same as 'closed'
 *   - false             → no shadow (template renders into host's light DOM)
 *   - 'drop'/'inset'/'glow'/'layered' → legacy v1 values, treated as 'closed'
 */
export type ShadowSetting = false | true | 'open' | 'closed' | 'iframe' | 'arianna' | 'drop' | 'inset' | 'glow' | 'layered';
export type RenderMode    = 'real' | 'virtual';

export interface ComponentDef
{
    attrs?  : string[];
    shadow? : ShadowSetting;
    /** Options for the AriannaShadow iframe backend (used when shadow === 'iframe').
     *  See AriannaShadowOptions in Shadow.ts: sandbox, bridgeEvents, projection, width, height, autoResize. */
    iframe? : AriannaShadowOptions;
    render? : RenderMode;
    bus?    : string;
    css?    : ComponentStyleInput;
}

export type ComponentStyleInput =
    | Stylesheet
    | Rule
    | Rule[]
    | string
    | Record<string, unknown>;

export interface ComponentStyleMap
{
    [publicName: string]: string;
}

/**
 * Public surface of an AriannA component instance.
 *
 * Every class produced by `Component('arianna-x', HTMLElement, …)` is a
 * `HTMLElement` at runtime AND additionally exposes the methods/properties
 * installed by `_installFacilities()` on construction. This interface is
 * the canonical type for those extras — subclasses pick it up automatically
 * because the factory's return type is `new (...a) => AriannaElement`.
 *
 * Notes:
 *   • `attrSignal(name)` returns a non-null Signal for any attribute
 *     declared in the component's `attrs` list (runtime guarantee). Use
 *     `attr-fallback ?? undefined` if you need to feed it into a typed
 *     `string | undefined` slot.
 *   • Lifecycle hooks are declared as optional — only override the ones
 *     your subclass needs.
 *   • `_children` is populated automatically by `bus`-coupled child
 *     components (see `ComponentDef.bus`).
 */
export interface AriannaElement extends HTMLElement
{
    /** Reactive Signal for a declared component attribute. */
    attrSignal(name: string): Signal<string | null>;

    /** Dispatch a CustomEvent of the given type. */
    fire(type: string, init?: CustomEventInit): void;

    /** Resolve the rendered host element (light DOM or shadow root). */
    render(): HTMLElement;

    /** Current Stylesheet for this component. Assigning replaces it. */
    Sheet: Stylesheet | null;

    /** Public render-root facade for closed Shadow DOM. */
    readonly Shadow: { readonly Root: ShadowRoot | null };
    readonly RenderRoot: ShadowRoot | Element;

    /** Reactive template (Vue-style DSL via core/Template.ts). */
    template: unknown;

    /** Lifecycle hooks — override as needed. */
    onCreated?      (): void;
    onBeforeMount?  (): void;
    onMount?        (): void;
    onBeforeUpdate? (): void;
    onUpdate?       (): void;
    onBeforeUnmount?(): void;
    onUnmount?      (): void;

    /** Marker injected by the factory's `_installFacilities`. */
    readonly __ariannaComponent?: boolean;

    /** Children collected via the component bus (set when `bus` is configured). */
    readonly _children?: HTMLElement[];

    /** Fluent sugar mirroring Real (set/get/add/push/append/remove/find/…). */
    set(name: string, value: unknown): this;
    get(name: string): unknown;
    /**
     * Fluent sub-property accessor for nested objects (e.g. `style`, `dataset`).
     *
     *   this.sub('style').set('background', 'orange').set('color', 'white');
     *   this.sub('style').get('background');     // 'orange'
     *   this.sub('style').sub('transform');      // further nesting
     */
    sub(path: string): SubAccessor;
}

// ── Private flags & registries ──────────────────────────────────────────────

const FACILITY_FLAG = Symbol.for('arianna.component.installed');
const SHADOW_ROOT   = Symbol.for('arianna.shadow.root');
const BUSES: Record<string, Signal<unknown[]>> = {};
const DEF_KEYS = new Set(['attrs', 'shadow', 'render', 'bus', 'css']);


function _getShadowRoot(el: Element): ShadowRoot | AriannaShadow | null
{
    return ((el as unknown as Record<symbol, unknown>)[SHADOW_ROOT] as (ShadowRoot | AriannaShadow) | undefined)
        ?? ((el as HTMLElement).shadowRoot ?? null);
}

/**
 * Attach a shadow root to `el` according to the requested mode. Implements the
 * escalation policy documented in SHADOW.md §0.3–§0.4 and §8:
 *
 *   - 'iframe'  → AriannaShadow with iframe backend (hard isolation)
 *   - 'arianna' → AriannaShadow with light backend (force polyfill)
 *   - 'open'    → THE DEFAULT. Try native attachShadow({mode:'open'}); if it
 *                 throws (HTMLUnknownElement / non-standard tag), fall back to
 *                 the AriannaShadow LIGHT backend (also open/inspectable).
 *                 This is the only mode that accepts non-standard tags.
 *   - 'closed'  → OPT-IN EXCEPTION. Native attachShadow({mode:'closed'}) ONLY.
 *                 Requires a standard, attachShadow-capable element. Does NOT
 *                 fall back to an AriannA backend (no silent downgrade to open).
 *   - false     → no shadow (caller checks before calling this)
 *
 * The returned value is one of:
 *   - native ShadowRoot (open or closed)
 *   - AriannaShadow (light backend, always open)
 *   - AriannaShadow (iframe backend)
 *   - null (closed on an incapable element, or every attempt failed)
 *
 * All non-null types are stored under `el[Symbol.for('arianna.shadow.root')]`.
 * Use `IsAriannaShadow()` to distinguish from native, and `shadow.Backend`
 * (or `IsIframeBackend()`) to distinguish the polyfill backend. There is NO
 * separate IframeShadow type — the iframe is a backend of AriannaShadow.
 */
function _attachAriannaShadow(
    el: Element,
    mode: 'open' | 'closed' | 'iframe' | 'arianna' = 'open',
    iframeOpts?: AriannaShadowOptions,
): ShadowRoot | AriannaShadow | null
{
    const existing = _getShadowRoot(el);
    if (existing) return existing;

    // ── Mode: 'iframe' → AriannaShadow with iframe backend ──────────────
    if (mode === 'iframe') {
        try {
            return AttachAriannaShadow(el, 'closed', { ...iframeOpts, backend: 'iframe' });
        } catch (e) {
            console.warn('[arianna] AriannaShadow (iframe backend) failed:', e);
            return null;
        }
    }

    // ── Mode: 'arianna' → force light backend ───────────────────────────
    if (mode === 'arianna') {
        try {
            return AttachAriannaShadow(el, 'closed', { backend: 'light' });
        } catch (e) {
            console.warn('[arianna] AriannaShadow (light backend, forced) failed:', e);
            return null;
        }
    }

    // ── Mode: 'open' / 'closed' → native attachShadow ──────────────────────
    //
    // Policy (SHADOW.md §0.3–§0.4, §8):
    //   • 'open'   → try native open; on failure (HTMLUnknownElement / non-
    //                standard tag) fall back to the AriannaShadow LIGHT backend,
    //                which is ALSO open/inspectable. This is the default and the
    //                only mode that accepts non-standard tags.
    //   • 'closed' → native CLOSED shadow via attachShadow. Requires a native
    //                attachShadow-capable element (standard tag). Does NOT fall
    //                back to an AriannA backend: a silent downgrade from native-
    //                closed to light-open would violate the author's intent.
    //
    // NOTE on customElements.define (policy §0.4): closed is the ONLY mode that
    // should ever touch the native registry. `attachShadow({mode:'closed'})`
    // already gives a real, browser-managed CLOSED root on any HTMLElement, so
    // closed encapsulation works here WITHOUT define. A full `customElements.
    // define` for closed (to also get native UPGRADE lifecycle) requires the
    // defined class to BE the AriannA bridge AND the manual upgrade path
    // (Namespace.Update / Core.Observer) to SKIP natively-defined tags — neither
    // coordination exists yet. Until that is built and tested, we deliberately
    // do NOT call define here: doing so would make the browser upgrade <tag> to
    // a class that conflicts with AriannA's prototype-splice. See _registerClosed
    // CustomElement below (kept, unused) for the registration primitive.
    const nativeMode = mode === 'open' ? 'open' : 'closed';
    try {
        const root = (el as HTMLElement).attachShadow({ mode: nativeMode });
        Object.defineProperty(el, SHADOW_ROOT, {
            value: root, enumerable: false, configurable: false, writable: false,
        });
        // Autonomous components (super is HTMLElement) have no native rendering
        // of their light DOM: a closed/open shadow with no <slot> hides anything
        // build() writes via this.textContent / this.innerHTML. Insert a default
        // <slot> so light-DOM content projects through. ONLY for HTMLElement-
        // based tags — concrete native bases (HTMLDivElement, HTMLButtonElement,
        // …) render their own content and must be left untouched. A user
        // template later replaces this default slot (it renders into the same
        // root; the slot is harmless fallback until then).
        try {
            // Autonomous = a registered Custom (AriannA) tag: it derives from
            // HTMLElement (possibly through a multi-level user chain like
            // L3_4n → … → HTMLElement) and renders no native content of its own,
            // so it needs a default <slot> to project build()'s light DOM.
            // Native-base concrete elements (button/input/…) render their own
            // content and are left untouched. Descriptor-only, no prototype walk.
            const desc = GetDescriptor(el) as { Custom?: boolean } | false;
            const isAutonomous = !!desc && desc.Custom === true;
            if (isAutonomous && root instanceof ShadowRoot && root.childNodes.length === 0) {
                root.appendChild(document.createElement('slot'));
            }
        } catch { /* slot projection best-effort */ }
        return root;
    } catch (e) {
        if (mode === 'closed') {
            // Per SHADOW.md graceful-degrade policy: native closed shadow needs a
            // standard, attachShadow-capable element. When the tag can't host it
            // (non-standard AriannA tag, or a native tag like <button> that won't
            // accept shadow), DEGRADE to the AriannA light backend (open/
            // inspectable) instead of returning null — so build()'s content still
            // renders and the sheet still applies. Warn so the downgrade is visible.
            console.warn(
                '[arianna] shadow:\'closed\' not supported on this element; ' +
                'degrading to light backend (open). Use a standard custom-element ' +
                'tag for native closed, or \'iframe\' for isolation.', e,
            );
            // fall through to the light-backend attach below
        }
        // 'open' or degraded 'closed': native failed → AriannA light backend.
    }
    try {
        return AttachAriannaShadow(el, 'open', { backend: 'light' });
    } catch (e) {
        console.warn('[arianna] AriannaShadow (light backend) failed:', e);
        return null;
    }
}

// ── Closed-mode native registration primitive (NOT yet wired — see note above)
//
// Per policy §0.4, customElements.define must be used ONLY for shadow:'closed'.
// This primitive registers `tag` as an autonomous custom element exactly once,
// rejecting non-standard tags. It is intentionally NOT called yet: wiring it
// requires coordinating with the manual upgrade path so the two upgrade
// mechanisms don't collide (the defined class must delegate to AriannA, and
// Namespace.Update must skip natively-defined tags). Kept here so that work has
// a single, correct registration point when it is built and testable.
const _closedDefined = new Set<string>();
function _registerClosedCustomElement(tag: string): boolean
{
    if (_closedDefined.has(tag)) return true;
    if (typeof customElements === 'undefined' || !customElements) return false;
    const valid = /^[a-z][a-z0-9._]*-[a-z0-9._-]*$/.test(tag);
    if (!valid) return false;
    try { if (customElements.get(tag)) { _closedDefined.add(tag); return true; } } catch { /* ignore */ }
    try {
        const ClosedElement = class extends HTMLElement {};
        Object.defineProperty(ClosedElement, 'name', { value: 'AriannaClosed_' + tag });
        customElements.define(tag, ClosedElement);
        _closedDefined.add(tag);
        return true;
    } catch (e) {
        console.warn('[arianna] customElements.define failed for closed tag <' + tag + '>:', e);
        return false;
    }
}
void _registerClosedCustomElement;

function _bus(parentTag: string): Signal<unknown[]>
{
    if (!BUSES[parentTag]) BUSES[parentTag] = signal<unknown[]>([]);
    return BUSES[parentTag];
}

function _isMixedDef(obj: unknown): boolean
{
    if (!obj || typeof obj !== 'object') return false;
    for (const k of Object.keys(obj as Record<string, unknown>))
        if (DEF_KEYS.has(k)) return true;
    return false;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Component(el) — install AriannA facilities on a live DOM element
// ─────────────────────────────────────────────────────────────────────────────

function _installFacilities(el: Element): Element
{
    const flagged = el as Element & { [FACILITY_FLAG]?: boolean };
    if (flagged[FACILITY_FLAG]) return el;
    flagged[FACILITY_FLAG] = true;

    const stash = el as Element & {
        __effects?     : Array<() => void>;
        __attrSignals? : Record<string, Signal<string | null>>;
        __sheet?       : Stylesheet | null;
        __styleNode?   : HTMLStyleElement | null;
        __instanceId?  : string;
        __isMounted?   : boolean;
        __isBuilt?     : boolean;
        __disposers?   : Array<() => void>;
        __mountFns?    : Array<() => void>;
        __unmountFns?  : Array<() => void>;
    };
    stash.__effects     = [];
    stash.__attrSignals = {};
    stash.__sheet       = null;
    stash.__styleNode   = null;
    stash.__instanceId  = stash.__instanceId || ('c' + Math.random().toString(36).slice(2, 10));
    stash.__isMounted   = false;
    stash.__isBuilt     = false;
    stash.__disposers   = [];
    stash.__mountFns    = [];
    stash.__unmountFns  = [];

    // Methods defined once as a frozen pool, then attached per-element with the
    // bound element captured in `this`.
    Object.defineProperties(el, {
        // ── Fluent sugar (Real mirror) ─────────────────────────────────────
        set: { configurable: true, writable: false, value(this: Element, name: string, value: unknown) {
            if (name.indexOf('.') !== -1) {
                writeDottedPath(this as unknown as Record<string, unknown>, name, value);
                return this;
            }
            this.setAttribute(name, String(value)); return this;
        }},
        get: { configurable: true, writable: false, value(this: Element, name: string) {
            if (name.indexOf('.') !== -1) {
                const v = readDottedPath(this as unknown as Record<string, unknown>, name);
                return v === undefined ? null : v;
            }
            return this.getAttribute(name);
        }},
        sub: { configurable: true, writable: false, value(this: Element, path: string) {
            return makeSubAccessor(this as unknown as Record<string, unknown>, path, this);
        }},
        add: { configurable: true, writable: false, value(this: Element, ...args: (Node | string | number)[]) {
            const last  = args[args.length - 1];
            const items = typeof last === 'number' ? args.slice(0, -1) : args;
            const idx   = typeof last === 'number' ? (last as number) : this.childNodes.length;
            const ref   = this.childNodes[idx] ?? null;
            const frag  = document.createDocumentFragment();
            for (const it of items as (Node | string)[])
                frag.appendChild(typeof it === 'string' ? document.createTextNode(it) : it);
            this.insertBefore(frag, ref);
            return this;
        }},
        push:    { configurable: true, writable: false, value(this: Element, ...n: (Node | string)[]) {
            return (this as unknown as { add: (...a: unknown[]) => Element }).add(...n);
        }},
        unshift: { configurable: true, writable: false, value(this: Element, ...n: (Node | string)[]) {
            return (this as unknown as { add: (...a: unknown[]) => Element }).add(...n, 0);
        }},
        append:  { configurable: true, writable: false, value(this: Element, parent: string | Element | null) {
            const p = typeof parent === 'string' ? document.querySelector(parent) : parent;
            if (p) p.appendChild(this);
            return this;
        }},
        remove:  { configurable: true, writable: false, value(this: Element, ...targets: (string | Node | number)[]) {
            for (const t of targets) {
                let n: Node | null = null;
                if (typeof t === 'number')      n = this.childNodes[t] ?? null;
                else if (typeof t === 'string') n = this.querySelector(t);
                else                            n = t;
                if (n && this.contains(n)) this.removeChild(n);
            }
            return this;
        }},
        show:    { configurable: true, writable: false, value(this: Element) { (this as HTMLElement).style.display = '';     return this; }},
        hide:    { configurable: true, writable: false, value(this: Element) { (this as HTMLElement).style.display = 'none'; return this; }},

        // ── Reactive sinks ──────────────────────────────────────────────────
        text:   { configurable: true, writable: false, value(this: Element, getter: () => string) {
            const n = document.createTextNode(getter());
            this.appendChild(n);
            stash.__effects!.push(effect(() => { n.nodeValue = getter(); }));
            return this;
        }},
        attr:   { configurable: true, writable: false, value(this: Element, name: string, getter: () => string | null) {
            stash.__effects!.push(effect(() => {
                const v = getter();
                if (v === null) this.removeAttribute(name);
                else            this.setAttribute(name, v);
            }));
            return this;
        }},
        cls:    { configurable: true, writable: false, value(this: Element, name: string, getter: () => boolean) {
            stash.__effects!.push(effect(() => {
                if (getter()) this.classList.add(name);
                else          this.classList.remove(name);
            }));
            return this;
        }},
        prop:   { configurable: true, writable: false, value(this: Element, name: string, getter: () => unknown) {
            stash.__effects!.push(effect(() => {
                (this as unknown as Record<string, unknown>)[name] = getter();
            }));
            return this;
        }},
        // NOTE: NOT named `style` — that would shadow the native CSSStyleDeclaration
        // accessor (el.style.background = 'crimson' would set a property on this
        // function instead of triggering the real CSS setter). The reactive
        // single-property binder lives on `styleSignal` instead.
        styleSignal:  { configurable: true, writable: false, value(this: Element, prop: string, getter: () => string) {
            const css = prop.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
            stash.__effects!.push(effect(() => {
                (this as HTMLElement).style.setProperty(css, getter());
            }));
            return this;
        }},
        bind:   { configurable: true, writable: false, value(this: Element, getter: () => string, setter?: (v: string) => void) {
            stash.__effects!.push(effect(() => {
                (this as unknown as Record<string, unknown>).value = getter();
            }));
            if (setter) this.addEventListener('input', e => setter((e.target as HTMLInputElement).value));
            return this;
        }},
        effectFn: { configurable: true, writable: false, value(this: Element, fn: () => void) {
            stash.__effects!.push(effect(fn));
            return this;
        }},

        // ── fire(type, init?) — dispatch a CustomEvent on this element ───
        // Convenience helper used pervasively by components to emit DOM
        // events (e.g. CodeEditor's `change` on input, Splitter's
        // `arianna:resize` on drag). Declared on AriannaElement; installed
        // here so every upgraded element has it.
        fire: { configurable: true, writable: false, value(this: Element, type: string, init?: CustomEventInit) {
            this.dispatchEvent(new CustomEvent(type, init));
            return this;
        }},

        // ── Sheet — assignment of a Stylesheet instance triggers scoping
        //         and inserts a <style> tag in the document head (light DOM)
        //         or the host's shadowRoot. Property NAME is 'Sheet' (not
        //         'Stylesheet'): the class is `Stylesheet`, the instance
        //         field is `.Sheet`. Every component writes `this.Sheet = ...`
        Sheet: {
            configurable: true,
            get(this: Element): Stylesheet | null { return stash.__sheet ?? null; },
            set(this: Element, next: Stylesheet | null) { _applySheet(this, next); },
        },
        Css: {
            configurable: true,
            get(this: Element): string { return stash.__sheet ? stash.__sheet.toString() : ''; },
        },

        // ── render() / valueOf() ─────────────────────────────────────────
        // Many component constructors call `self.render()` to grab the host
        // element. Without these installed at facility-time, the call fails
        // synchronously inside super() chains. Returning `this` is the
        // correct semantics: the element IS its own render target.
        render: {
            configurable: true, writable: false,
            value(this: Element): Element { return this; },
        },
        valueOf: {
            configurable: true, writable: false,
            value(this: Element): Element { return this; },
        },

        // ── style() — multi-form CSS application ─────────────────────────
        // Five forms:
        //   .style(prop, getter)   → reactive single-prop binding (legacy)
        //   .style(rule)           → apply Rule as scoped Sheet
        //   .style(sheet)          → assign Stylesheet directly to this.Sheet
        //   .style({ a: 'b' })     → build Rule(':host', obj), apply as Sheet
        //   .style('button {...}') → parse CSS text → Stylesheet, apply
        // Returns `this` for chaining.
        style: {
            configurable: true, writable: false,
            value(this: Element, a: unknown, b?: unknown): Element {
                // Form 1: (prop, getter) — reactive single-prop binding
                if (typeof a === 'string' && typeof b === 'function') {
                    const el = this as HTMLElement;
                    const cssProp = a.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
                    const eff = effect(() => { el.style.setProperty(cssProp, (b as () => string)()); });
                    stash.__effects = stash.__effects ?? [];
                    stash.__effects.push(eff as unknown as () => void);
                    return this;
                }
                // Form 2: Rule instance
                if (a instanceof Rule) {
                    _applySheet(this, new Stylesheet([a]));
                    return this;
                }
                // Form 3: Stylesheet instance
                if (a instanceof Stylesheet) {
                    _applySheet(this, a);
                    return this;
                }
                // Form 4: string — parse as CSS text if it looks like CSS,
                // otherwise apply as inline style attribute.
                if (typeof a === 'string') {
                    if (a.indexOf('{') !== -1) {
                        // CSS text — parse into Rules. Very small parser:
                        // splits on `}`, each chunk is `selector { props }`.
                        const rules: Rule[] = [];
                        for (const chunk of a.split('}')) {
                            const i = chunk.indexOf('{');
                            if (i === -1) continue;
                            const selector = chunk.slice(0, i).trim();
                            const body     = chunk.slice(i + 1).trim();
                            if (!selector || !body) continue;
                            const props: Record<string, string> = {};
                            for (const decl of body.split(';')) {
                                const c = decl.indexOf(':');
                                if (c === -1) continue;
                                const k = decl.slice(0, c).trim();
                                const v = decl.slice(c + 1).trim();
                                if (k && v) props[k] = v;
                            }
                            if (Object.keys(props).length) rules.push(new Rule(selector, props));
                        }
                        if (rules.length) _applySheet(this, new Stylesheet(rules));
                    } else {
                        // Bare CSS — apply as inline style attribute (set)
                        (this as HTMLElement).setAttribute('style',
                            ((this as HTMLElement).getAttribute('style') ?? '') + ';' + a);
                    }
                    return this;
                }
                // Form 5: plain object → Rule(':host', obj)
                if (a && typeof a === 'object') {
                    _applySheet(this, new Stylesheet([new Rule(':host', a as Record<string, string>)]));
                    return this;
                }
                return this;
            },
        },


        // ── Shadow facade ──────────────────────────────────────────────────
        // Closed ShadowRoot is not reachable through native .shadowRoot.
        // AriannA exposes it through el.Shadow.Root for framework internals,
        // tests, and trusted component/subclass authoring.
        Shadow: {
            configurable: true,
            get(this: Element): { readonly Root: ShadowRoot | AriannaShadow | null } {
                const host = this;
                return Object.freeze({
                    get Root(): ShadowRoot | AriannaShadow | null { return _getShadowRoot(host); },
                });
            },
        },
        RenderRoot: {
            configurable: true,
            get(this: Element): ShadowRoot | AriannaShadow | Element { return _getShadowRoot(this) ?? this; },
        },

        // ── attrSignal accessor ────────────────────────────────────────────
        attrSignal: { configurable: true, writable: false, value(this: Element, name: string) {
            return stash.__attrSignals?.[name];
        }},

        // ── _children (sub-component bus) ──────────────────────────────────
        _children: {
            configurable: true,
            get(this: Element): Element[] {
                const tag = this.tagName.toLowerCase();
                const b   = BUSES[tag];
                return b ? (b.get() as Element[]) : [];
            },
        },

        // ── Lifecycle ────────────────────────────────────────────────────
        // mount()       Called by Core.Observer when element enters the DOM.
        //               Idempotent: a second call while already mounted is
        //               a no-op (prevents double mount when element is moved
        //               within the DOM). Fires onMount() if user defined it,
        //               then runs registered __mountFns in order.
        // unmount()     Called by Core.Observer when element leaves the DOM.
        //               Runs all __disposers (effects from build, registered
        //               cleanups), then __unmountFns, then onUnmount() user hook.
        //               Sets __isMounted = false so a later remount works.
        // isMounted     Boolean readonly accessor.
        // addDisposer() Register a cleanup fn invoked on unmount.
        // onMount/onUnmount  User-overridable instance methods. If the user
        //               defines them on their class, mount/unmount calls them.
        mount: { configurable: true, writable: false, value(this: Element & typeof stash) {
            if (this.__isMounted) return this;
            this.__isMounted = true;
            // Run onMount user hook if defined on the prototype chain
            const userHook = (this as unknown as { onMount?: () => void }).onMount;
            if (typeof userHook === 'function') {
                try { userHook.call(this); }
                catch (e) { console.warn('[arianna] onMount threw:', e); }
            }
            // Run any registered __mountFns
            for (const fn of (this.__mountFns ?? [])) {
                try { fn(); }
                catch (e) { console.warn('[arianna] mountFn threw:', e); }
            }
            return this;
        }},
        unmount: { configurable: true, writable: false, value(this: Element & typeof stash) {
            if (!this.__isMounted) return this;
            this.__isMounted = false;
            // Run disposers in reverse registration order (LIFO)
            const ds = this.__disposers ?? [];
            for (let i = ds.length - 1; i >= 0; i--) {
                try { ds[i](); }
                catch (e) { console.warn('[arianna] disposer threw:', e); }
            }
            ds.length = 0;
            // Run unmount fns
            for (const fn of (this.__unmountFns ?? [])) {
                try { fn(); }
                catch (e) { console.warn('[arianna] unmountFn threw:', e); }
            }
            // User hook last
            const userHook = (this as unknown as { onUnmount?: () => void }).onUnmount;
            if (typeof userHook === 'function') {
                try { userHook.call(this); }
                catch (e) { console.warn('[arianna] onUnmount threw:', e); }
            }
            return this;
        }},
        isMounted: {
            configurable: true,
            get(this: Element & typeof stash): boolean { return !!this.__isMounted; },
        },
        addDisposer: { configurable: true, writable: false, value(this: Element & typeof stash, fn: () => void) {
            if (typeof fn === 'function') (this.__disposers ??= []).push(fn);
            return this;
        }},
        // .shadow(mode?) — attach (or return existing) Shadow DOM root.
        // Default is closed, matching AriannA 2.0 component policy.
        // Closed roots are stored privately on a Symbol so runtime/tests can use
        // this method instead of the browser's el.shadowRoot property.
        shadow: { configurable: true, writable: false, value(this: Element, mode: 'open' | 'closed' = 'closed') {
            return _attachAriannaShadow(this, mode);
        }},
    });

    // Apply def-driven features. The def is PER-TAG, stored on the descriptor
    // (keyed by the element's tag), NOT on the constructor — because the
    // Component class link is shared across all tags with the same base.
    // Descriptor is the single source of truth (anti-rot rule 3).
    // Resolve the element's descriptor the clean way: GetDescriptor(el) reads
    // data-arianna-tag / is / nodeName via the registry (Component.js model).
    const _desc  = GetDescriptor(el) as { Tags?: string[]; Def?: ComponentDef; __ariannaSheetDefault?: Stylesheet } | false;
    const _elTag = (_desc && _desc.Tags && _desc.Tags[0]) ? _desc.Tags[0].toLowerCase() : el.tagName.toLowerCase();
    const def    = (_desc && _desc.Def) ? _desc.Def : {};

    if (def.attrs && def.attrs.length) _wireAttrs(el, def.attrs);
    if (def.bus) {
        const b = _bus(def.bus);
        const list = b.peek();
        if (!list.includes(el)) b.set([...list, el]);
    }
    if (def.css && Object.keys(def.css).length) {
        // CSS-only convenience: forward to inline style.
        // Use the browser's CSSStyleDeclaration via bracket notation
        // (camelCase) — same Golem v1 pattern as Namespace.applyRulesToStyle.
        // The browser handles the kebab translation internally.
        //
        // def.css is typed as ComponentStyleInput (union of Stylesheet | Rule |
        // Rule[] | string | Record<string, unknown>); only the record-shape is
        // iterable as a flat key-value map here, so narrow explicitly.
        const cssMap = def.css as Record<string, unknown>;
        const style = (el as HTMLElement).style as unknown as Record<string, string>;
        for (const k of Object.keys(cssMap)) {
            const camelKey = k[0].toLowerCase() + k.slice(1);
            const v = cssMap[k];
            if (typeof v !== 'string') continue;
            try { style[camelKey] = v; }
            catch { /* unsupported property — skip */ }
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Auto shadow-DOM attachment (BEFORE build()).
    //
    //  Components default to shadow:'closed'. Without this step, when an
    //  element is created via `new MyComp()` (rather than via markup /
    //  document.createElement), the Namespace.Update path doesn't run
    //  Step 7 — so the shadow root never exists, and DefaultSheet rules
    //  that target `:host` / `.inner-class` are applied as light-DOM rules
    //  injected into `<head>`. Those rules don't reach the inner template
    //  (which is in the future shadow root) — the component renders styled
    //  only on its host box, missing all internal styling.
    //
    //  Fix: install the shadow root NOW. _applySheet (called by build()'s
    //  `this.Sheet = X` assignment) then detects shadowRoot and injects the
    //  <style> there, so internal selectors work. Step 7 (markup path) still
    //  guards `if (!hostWithTpl.shadowRoot)` so it is a no-op for these.
    //
    //  Mode resolution: def.shadow === false  → skip (light DOM opt-out)
    //                   def.shadow === 'closed' → closed (native customElements; opt-in exception)
    //                   anything else (incl. undefined) → 'open' (the DEFAULT, §0.3)
    // ─────────────────────────────────────────────────────────────────────
    {
        // Shadow mode from the same per-tag descriptor def resolved above.
        const defShadow = (def as { shadow?: ShadowSetting }).shadow;
        const iframeOpts = (def as { iframe?: AriannaShadowOptions }).iframe;
        // Resolve to one of: false | 'open' | 'closed' | 'iframe' | 'arianna'.
        // DEFAULT IS 'open' (COMPONENTS.md §0.3 / SHADOW.md §0.3): open is what
        // lets AriannA accept non-standard tags via its own upgrade + light
        // backend fallback, and keeps Shadow.Root inspectable. 'closed' is the
        // explicit opt-in exception (native customElements; standard tag only).
        const mode: false | 'open' | 'closed' | 'iframe' | 'arianna' =
            defShadow === false                ? false       :
            defShadow === 'closed'             ? 'closed'    :
            defShadow === 'iframe'             ? 'iframe'    :
            defShadow === 'arianna'            ? 'arianna'   :
            // 'open', true, undefined, and legacy v1 values (drop/inset/glow/
            // layered) all resolve to the default: 'open'.
            'open';
        if (mode !== false) _attachAriannaShadow(el, mode, iframeOpts);
    }

    // Apply the class-level default sheet BEFORE build(). This is the AriannA
    // 2.0 styling contract: Component(tag, Base, css, def) seeds the instance
    // Sheet.Current. build() may add behaviour/state, but should not be the
    // place where the structural component stylesheet first appears.
    {
        // Default sheet from the per-tag descriptor (resolved above as _desc).
        const sheetDefault = _desc ? _desc.__ariannaSheetDefault : undefined;
        if (sheetDefault && !stash.__sheet) {
            _applySheet(el, new Stylesheet(sheetDefault));
        }
    }

    // Call build() synchronously now that facilities are installed.
    // For classes that `extends Component(tag, Base)`, this is the only place
    // build() can be invoked automatically — the patched native constructor
    // (HTMLDivElement, etc.) can't see the user's body, and a microtask
    // schedule would fail the contract of test 3.1 which reads `trace` SYNC
    // right after `new MyComp(opts)`.
    //
    // Args: read from el.__buildArgs which the Component constructor stashed
    // before delegating to ComponentFn. Falls back to [] (markup / Core.Create
    // path: no constructor args available).
    //
    // Guarded by __isBuilt — runs once per element lifetime.
    if (!stash.__isBuilt) {
        const userBuild = (el as unknown as { build?: (...a: unknown[]) => void }).build;
        if (typeof userBuild === 'function') {
            stash.__isBuilt = true;
            const args = (el as unknown as { __buildArgs?: unknown[] }).__buildArgs ?? [];
            try { userBuild.apply(el, args); }
            catch (e) { console.warn('[arianna] build() threw:', e); }
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Render the @Component DECORATOR's template STRING.
    //
    //  The decorator form `@Component('tag', style, { template })` (and the
    //  object form `@Component({ tag, template, style })`) stashes `template`
    //  as a STRING on the descriptor's Def. Unlike build()'s `this.template`
    //  (a compiled Template object), this string has no .attach/.mount, so the
    //  auto-attach block below skips it. Render it here: into the shadow root
    //  when present, else the host's light DOM. The style is already applied
    //  via __ariannaSheetDefault by the sheet path above.
    {
        const elTpl = el as unknown as { template?: unknown; __templateRendered?: boolean };
        const defObj = (_desc && (_desc as { Def?: { template?: string; style?: string; css?: string } }).Def)
            ? (_desc as { Def?: { template?: string; style?: string; css?: string } }).Def!
            : undefined;
        const defTpl   = defObj ? defObj.template : undefined;
        const defStyle = defObj ? (defObj.style ?? defObj.css) : undefined;
        const root = _getShadowRoot(el);

        // (1) Decorator STYLE → native shadow. Covers BOTH the no-template
        // positional form and the templated forms. For light/iframe backends
        // the _applySheet path handles the style, so inject here only for a
        // native ShadowRoot (where :host styles the host element directly).
        if (typeof defStyle === 'string' && defStyle
            && root && !IsAriannaShadow(root)) {
            const sr = root as ShadowRoot;
            if (!sr.querySelector('style[data-arianna-decorator]')) {
                const st = document.createElement('style');
                st.setAttribute('data-arianna-decorator', '');
                st.textContent = defStyle;
                sr.appendChild(st);
            }
        }

        // (2) Decorator TEMPLATE string → shadow / light.
        if (typeof defTpl === 'string' && defTpl && !elTpl.template && !elTpl.__templateRendered) {
            elTpl.__templateRendered = true;
            if (root && !IsAriannaShadow(root)) {
                // Native shadow: drop the default <slot>, then inject template.
                const sr = root as ShadowRoot;
                const ds = Array.from(sr.childNodes).find(
                    n => (n as Element).tagName === 'SLOT' && !(n as Element).hasAttribute?.('name'),
                );
                if (ds) sr.removeChild(ds);
                const t = document.createElement('template');
                t.innerHTML = defTpl;
                sr.appendChild(t.content.cloneNode(true));
            } else if (IsAriannaShadow(root)) {
                const t = document.createElement('template');
                t.innerHTML = defTpl;
                RenderIntoAriannaShadow(root as AriannaShadow, t.content);
            } else if (!el.children.length) {
                (el as HTMLElement).innerHTML = defTpl;
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    //  Auto-attach `this.template` (set by build()) to the shadow root.
    //
    //  Step 7 of Namespace.Update would do this, but only when the element
    //  enters the DOM via the Observer. Direct JS-creation (`new MyComp()`)
    //  doesn't pass through Observer until the user appends the element
    //  manually — and even then, Observer's Update may run AFTER the user
    //  inspects/uses the element. Attaching here makes the template active
    //  immediately, so `new MyComp()` produces a fully-rendered element.
    //
    //  Skipped if shadowRoot already has content (Step 7 already ran).
    // ─────────────────────────────────────────────────────────────────────
    {
        const elHasTpl = el as unknown as {
            template?: {
                attach?: (host: ParentNode, instance: object, signals?: Record<string, unknown>) => unknown;
                mount?:  (host: Element,    scope: unknown) => unknown;
            };
            __templateRendered?: boolean;
            __attrSignals?: Record<string, unknown>;
            shadowRoot?: ShadowRoot | null;
        };
        if (elHasTpl.template && !elHasTpl.__templateRendered) {
            elHasTpl.__templateRendered = true;
            const root = _getShadowRoot(el);
            const signals = elHasTpl.__attrSignals ?? {};
            try {
                if (IsAriannaShadow(root)) {
                    // AriannaShadow (either backend — light or iframe): render the
                    // template into a transient fragment, then pass it to
                    // RenderIntoAriannaShadow. The function branches internally on
                    // shadow.Backend: 'light' projects into host light DOM,
                    // 'iframe' imports into the iframe contentDocument. We don't
                    // distinguish backends here — that's the whole point of having
                    // a single shadow type with a Backend field.
                    const ariannaShadow = root as AriannaShadow;
                    const tmpHost = document.createDocumentFragment();
                    if (typeof elHasTpl.template.attach === 'function') {
                        elHasTpl.template.attach(tmpHost as unknown as ParentNode, el as unknown as object, signals);
                    } else if (typeof elHasTpl.template.mount === 'function') {
                        elHasTpl.template.mount(tmpHost as unknown as Element, el as unknown as object);
                    }
                    RenderIntoAriannaShadow(ariannaShadow, tmpHost);
                } else {
                    // Native ShadowRoot or no shadow at all: render directly
                    // into the target (existing behaviour).
                    const renderTarget: ParentNode = (root as ParentNode | null) ?? (el as ParentNode);
                    // Remove the auto-inserted default <slot> (added for
                    // autonomous components so build()'s light DOM projects):
                    // a real template supersedes it. Note _applySheet may have
                    // already inserted a <style> into the shadow, so we can't
                    // assume the slot is the sole child — find and remove the
                    // unnamed default slot specifically.
                    if (root instanceof ShadowRoot) {
                        const defaultSlot = Array.from(root.childNodes).find(
                            n => (n as Element).tagName === 'SLOT'
                                && !(n as Element).hasAttribute?.('name'),
                        );
                        if (defaultSlot) root.removeChild(defaultSlot);
                    }
                    if (typeof elHasTpl.template.attach === 'function') {
                        elHasTpl.template.attach(renderTarget, el as unknown as object, signals);
                    } else if (typeof elHasTpl.template.mount === 'function') {
                        elHasTpl.template.mount(renderTarget as Element, el as unknown as object);
                    }
                }
            } catch (e) {
                console.warn('[arianna] template attach failed:', e);
            }
        } else if (!elHasTpl.template && !elHasTpl.__templateRendered) {
            // NO template (build() wrote this.textContent / innerHTML directly).
            // For the iframe backend this content lives in the HOST light DOM,
            // but the scoped <style> (html{…}) lives INSIDE the iframe — so the
            // host content is unstyled. Project it INTO the iframe via a default
            // <slot>, where the iframe's html-scoped rules reach it.
            const root = _getShadowRoot(el);
            if (IsAriannaShadow(root) && (root as AriannaShadow).Backend === 'iframe') {
                elHasTpl.__templateRendered = true;
                try {
                    const frag = document.createDocumentFragment();
                    frag.appendChild(document.createElement('slot'));
                    RenderIntoAriannaShadow(root as AriannaShadow, frag);
                } catch (e) {
                    console.warn('[arianna] iframe default-slot projection failed:', e);
                }
            }
        }
    }

    return el;
}

// ── attribute → Signal bridge ────────────────────────────────────────────────

function _wireAttrs(el: Element, attrs: string[]): void
{
    const stash = el as Element & {
        __attrSignals? : Record<string, Signal<string | null>>;
        __effects?     : Array<() => void>;
    };
    if (!stash.__attrSignals) stash.__attrSignals = {};
    if (!stash.__effects)     stash.__effects     = [];

    for (const name of attrs)
    {
        const sig = signal<string | null>(el.getAttribute(name));
        stash.__attrSignals[name] = sig;

        const evName = name.split(/[-_]/)[0].toLowerCase() + '-change';
        el.addEventListener(evName, () => { sig.set(el.getAttribute(name)); });

        stash.__effects.push(effect(() => {
            const v = sig.get();
            if (v === null) { if (el.hasAttribute(name)) el.removeAttribute(name); }
            else if (el.getAttribute(name) !== v) { el.setAttribute(name, v); }
        }));
    }
}

// ── Stylesheet application (auto-scope :root/&, shadow-aware) ─────────────────────

/**
 * Rewrite every occurrence of `:host(<balanced>)` in a CSS selector string
 * to `<replace><balanced>`, scanning parens manually so nested forms like
 * `:host(:not([direction]))` are handled correctly. Used to scope component
 * stylesheets when there's no shadow DOM.
 */
function rewriteHostWithArgs(src: string, replace: string): string
{
    let out = '';
    let i = 0;
    while (i < src.length) {
        const idx = src.indexOf(':host(', i);
        if (idx < 0) { out += src.slice(i); break; }

        // Append everything up to :host
        out += src.slice(i, idx);

        // Find the matching close paren for :host(...)
        let depth = 0;
        let j = idx + ':host'.length; // points at '('
        for (; j < src.length; j++) {
            const ch = src[j];
            if (ch === '(') depth++;
            else if (ch === ')') {
                depth--;
                if (depth === 0) break;
            }
        }
        if (depth !== 0) {
            // Unbalanced — bail out, emit rest verbatim
            out += src.slice(idx);
            break;
        }
        // Inner contents (between the parens)
        const inner = src.slice(idx + ':host('.length, j);
        out += replace + inner;
        i = j + 1; // past the ')'
    }
    return out;
}



function _normaliseComponentSheet(input: ComponentStyleInput | undefined): Stylesheet | undefined
{
    if (!input) return undefined;
    if (input instanceof Stylesheet) return new Stylesheet(input);
    if (input instanceof Rule) return new Stylesheet([input]);
    if (Array.isArray(input)) return new Stylesheet(input as Rule[]);
    if (typeof input === 'string') return new Stylesheet(input);
    if (typeof input === 'object') return new Stylesheet(input as SheetObjectDef);
    return undefined;
}

function _escapeRegExp(src: string): string
{
    return src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function _rewriteShadowFacadeSelector(selectorText: string, el: Element): string
{
    const tag = el.tagName.toLowerCase();
    const ctor = el.constructor as unknown as { StyleMap?: ComponentStyleMap };
    const styleMap = ctor.StyleMap ?? {};
    let selector = selectorText;

    // Inside Shadow DOM, component-local styles may be authored as if they were
    // normal page CSS:
    //   s-button { ... }              -> :host { ... }
    //   s-button[variant="x"] { ... } -> :host([variant="x"]) { ... }
    //   s-button::label { ... }       -> .ar-btn__label { ... }
    //   s-button::button { ... }      -> .ar-btn__native { ... }
    // The compiled result is still a normal Rule/Stylesheet injected into the
    // retained Shadow.Root.
    selector = selector.replace(
        new RegExp(`(^|,\\s*)${_escapeRegExp(tag)}(::[a-zA-Z][\\w-]*)`, 'g'),
        (_m, pre: string, pseudo: string) => {
            const key = pseudo.slice(2);
            return pre + (styleMap[key] ?? pseudo);
        },
    );

    selector = selector.replace(
        new RegExp(`(^|,\\s*)${_escapeRegExp(tag)}(\\[[^\\]]+\\]|:[a-zA-Z-]+(?:\\([^)]*\\))?)*`, 'g'),
        (_m, pre: string, suffix: string = '') => pre + (suffix ? `:host(${suffix})` : ':host'),
    );

    return selector;
}

function _applySheet(el: Element, next: Stylesheet | null): void
{
    const stash = el as Element & {
        __sheet?     : Stylesheet | null;
        __styleNode? : HTMLStyleElement | null;
        __instanceId?: string;
    };

    if (stash.__styleNode && stash.__styleNode.parentNode)
        stash.__styleNode.parentNode.removeChild(stash.__styleNode);
    stash.__styleNode = null;
    stash.__sheet     = next;
    if (!next) return;
    if (!stash.__instanceId) stash.__instanceId = 'c' + Math.random().toString(36).slice(2, 10);

    // Resolve the element's tag via the registry (Component.js model):
    // GetDescriptor(el) reads data-arianna-tag / is / nodeName. Falls back to
    // the live tagName for native-based components.
    const _sheetDesc = GetDescriptor(el) as { Tags?: string[] } | false;
    const tag = (_sheetDesc && _sheetDesc.Tags && _sheetDesc.Tags[0])
        ? _sheetDesc.Tags[0].toLowerCase()
        : el.tagName.toLowerCase();
    const shadowRoot = _getShadowRoot(el);
    // Distinguish three rendering targets:
    //   - nativeShadow: a real ShadowRoot (CSS encapsulated via browser boundary)
    //   - iframeShadow: an AriannaShadow using the iframe backend (CSS encapsulated inside the iframe document)
    //   - everything else (AriannaShadow light backend or no shadow): light DOM, scoped via instance-id
    const iframeShadow = IsIframeBackend(shadowRoot) ? (shadowRoot as AriannaShadow) : null;
    const nativeShadow = shadowRoot && !IsAriannaShadow(shadowRoot) ? (shadowRoot as ShadowRoot) : null;
    const useShadow    = !!nativeShadow || !!iframeShadow;
    // Selector rewrite target depends on the mode:
    //   - native:    :host stays as :host (browser handles)
    //   - iframe:    :host becomes html (the iframe document's root IS the host scope)
    //   - light DOM: :host becomes the tag selector SCOPED to this instance
    // In light DOM mode (no shadow boundary of any kind), the host must carry
    // the instance attribute so that scoped selectors like
    //   button[data-arianna-instance="cabc123"] { ... }
    // target THIS specific instance without bleeding to every same-tag element
    // (or, with a bare `tag`, matching unpredictably). This is the fix for
    // closed-shadow-on-a-shadow-incapable-host (e.g. <button>): attachShadow
    // throws, we fall back to light DOM, and the sheet must still be scoped.
    if (!useShadow) {
        try { el.setAttribute('data-arianna-instance', stash.__instanceId); } catch { /* ignore */ }
        try { el.setAttribute('data-arianna-tag', tag); } catch { /* ignore */ }
    }
    // Light-DOM scope must match the element's ACTUAL DOM tag. For autonomous
    // components the live tagName is the generic base (e.g. 'address') while the
    // logical tag is 'case-4a' — so scope on the live tagName + instance id
    // (the node we are styling), not the logical tag, or the selector won't
    // match the rendered element.
    const liveTagName = el.tagName.toLowerCase();
    const replace      = iframeShadow
        ? 'html'
        : (nativeShadow ? ':host' : `${liveTagName}[data-arianna-instance="${stash.__instanceId}"]`);

    let css = '';
    for (const r of next.Rules) {
        // Rewrite host selectors:
        //   :root and &  — legacy v1/v2 conventions
        //   :host        — shadow-DOM standard (post-migration default in v3)
        //   :host(X)     — host with attribute/pseudo X (rewrite differently per mode)
        let scoped = r.Text;
        if (nativeShadow) {
            // In native shadow DOM, :root/& should become :host. :host stays.
            // Also compile the AriannA facade selectors declared by the
            // component's static StyleMap so users can author component-local
            // sheets with normal-looking selectors.
            scoped = _rewriteShadowFacadeSelector(scoped, el);
            scoped = scoped.replace(/(^|,\s*|\s)(:root|&)(?![\w-])/g, (_m, pre: string) => pre + ':host');
        } else if (iframeShadow) {
            // In iframe shadow, :host rewrites to `html` because the iframe's
            // document root IS the component scope. :host(X) → html(X) is
            // invalid CSS, so we attach the X as an attribute selector on html.
            //   :host([dark])         →  html[dark]
            //   :host                  →  html
            //   :root / &              →  html
            scoped = rewriteHostWithArgs(scoped, 'html');
            scoped = scoped.replace(/(^|,\s*|\s)(:root|:host|&)(?![\w-])/g, (_m, pre: string) => pre + 'html');
        } else {
            // In light DOM, host-selector forms become the instance-scoped tag
            // selector, and OTHER selectors (bare descendants like
            // `.ar-btn__native`) are scoped UNDER the instance so they match only
            // this component's subtree and don't leak globally.
            const hadHost = /(^|,\s*|\s)(:root|:host|&)(?![\w-])/.test(scoped);
            scoped = rewriteHostWithArgs(scoped, replace);
            scoped = scoped.replace(/(^|,\s*|\s)(:root|:host|&)(?![\w-])/g, (_m, pre: string) => pre + replace);
            if (!hadHost) {
                // bare selector: prefix only the SELECTOR part (before '{').
                const braceAt = scoped.indexOf('{');
                if (braceAt > 0) {
                    const selPart  = scoped.slice(0, braceAt);
                    const bodyPart = scoped.slice(braceAt);
                    const scopedSel = selPart.split(',').map(s => `${replace} ${s.trim()}`).join(', ');
                    scoped = scopedSel + bodyPart;
                }
            }
        }
        css += scoped + '\n';
    }

    const styleEl = document.createElement('style');
    styleEl.textContent = css;
    styleEl.setAttribute('data-arianna-sheet',    tag);
    styleEl.setAttribute('data-arianna-instance', stash.__instanceId);

    if (nativeShadow) {
        nativeShadow.appendChild(styleEl);
    } else if (iframeShadow) {
        // Inject into the iframe document's <head>. We must create the <style>
        // element from the iframe's document so it belongs to the right realm.
        // The iframe srcdoc loads ASYNCHRONOUSLY: the contentDocument present
        // now is the initial doc that gets REPLACED on load, wiping anything we
        // inject. So inject now (covers already-loaded) AND on the load event
        // (covers the srcdoc swap) — same deferral pattern as content render.
        const inject = () => {
            const iframeDoc = iframeShadow.document;
            if (!iframeDoc) return;
            const head = iframeDoc.head ?? iframeDoc.documentElement;
            if (!head) return;
            const prev = head.querySelector(
                `style[data-arianna-sheet="${tag}"][data-arianna-instance="${stash.__instanceId}"]`,
            );
            if (prev) prev.remove();
            const iframeStyle = iframeDoc.createElement('style');
            iframeStyle.textContent = css;
            iframeStyle.setAttribute('data-arianna-sheet',    tag);
            iframeStyle.setAttribute('data-arianna-instance', stash.__instanceId);
            head.appendChild(iframeStyle);
            stash.__styleNode = iframeStyle as unknown as HTMLStyleElement;
        };
        inject();
        const ifr = (iframeShadow as unknown as { iframe?: HTMLIFrameElement }).iframe;
        if (ifr) ifr.addEventListener('load', inject, { once: true });
        return;
    } else {
        const head = document.head ?? document.documentElement;
        const existing = head.querySelector<HTMLStyleElement>(
            `style[data-arianna-sheet="${tag}"][data-arianna-instance="${stash.__instanceId}"]`,
        );
        if (existing) existing.remove();
        head.appendChild(styleEl);
    }
    stash.__styleNode = styleEl;
}


// ─────────────────────────────────────────────────────────────────────────────
//  REMOVED in v2: _define()
//  The factory-building logic now lives in Namespace.Define(). Core.Define
//  is the public entry that resolves the namespace and delegates there.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
//  ComponentWrapper — the SUM view returned by `new Component(tag, opts?)`.
//
//  Exposes the same underlying element through two facets:
//
//    wrapper.Real     →  Real wrapper (live DOM, eager — created on construct)
//    wrapper.Virtual  →  Virtual wrapper (virtual node, lazy — created on first
//                        access, shares the underlying Element via its render() output)
//
//  Both facets share the same Element. Mutations through either view land on
//  the same DOM node. Use cases:
//
//    const pluto = new Component('arianna-counter', { initial: 5 });
//    pluto.Real.set('variant', 'primary').append('#app');
//    pluto.Virtual.append('#app');      // attaches the same element
//
//  When `opts` is provided, every key/value is applied as an attribute on the
//  newly created element (case-insensitive, like Real#set). This mirrors the
//  ergonomics of `new Real(tag, opts, ...)`.
// ─────────────────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ComponentWrapper
{
    /** The underlying live element. */
    public readonly element: Element;

    /** The tag used to create the element. */
    public readonly tag: string;

    // Eager Real facet (cheap — Real is a thin wrapper).
    private readonly _real: any;

    // Lazy Virtual facet — built only on first access.
    private _virtual: any | null = null;

    constructor(tag: string, opts?: Record<string, unknown>)
    {
        this.tag     = tag;
        // Build the live element via Real and stash it.
        this._real   = new (Real as any)(tag);
        this.element = this._real.render();

        // Apply initial opts as attributes/properties (case-insensitive, like Real#set).
        if (opts && typeof opts === 'object') {
            for (const [k, v] of Object.entries(opts)) {
                try { this._real.set(k, v); }
                catch { /* swallow — best-effort */ }
            }
        }
    }

    /** Live-DOM facet (eager). */
    get Real(): any { return this._real; }

    /** Virtual-node facet (lazy). Wraps the SAME underlying Element. */
    get Virtual(): any {
        if (this._virtual) return this._virtual;
        // Virtual(el) wraps an existing element; produces a VirtualNode whose
        // render() returns the underlying Element rather than re-creating it.
        try {
            this._virtual = new (Virtual as any)(this.element);
        } catch {
            // Fallback: wrap as fresh Virtual with same tag — keeps the
            // wrapper usable even if Virtual's constructor doesn't accept Element.
            this._virtual = new (Virtual as any)(this.tag);
        }
        return this._virtual;
    }

    /** Convenience accessor — same as `.element`. */
    valueOf(): Element { return this.element; }
    render():  Element { return this.element; }
}
/* eslint-enable @typescript-eslint/no-explicit-any */


// ─────────────────────────────────────────────────────────────────────────────
//  The dual-form Component callable
// ─────────────────────────────────────────────────────────────────────────────

interface ComponentCallable
{
    /* ── Existing forms ─────────────────────────────────────────────────── */

    /** Install AriannA facilities on an existing element. */
    (el: Element): AriannaElement;

    /** Define a custom element by extending the returned class. */
    (tag: string, base: new (...a: unknown[]) => Element): new (...a: unknown[]) => AriannaElement;
    (tag: string, base: new (...a: unknown[]) => Element, css: ComponentStyleInput): new (...a: unknown[]) => AriannaElement;
    (tag: string, base: new (...a: unknown[]) => Element, css: ComponentStyleInput, def: ComponentDef): new (...a: unknown[]) => AriannaElement;
    (tag: string, base: new (...a: unknown[]) => Element, mixed: ComponentDef & Record<string, string>): new (...a: unknown[]) => AriannaElement;

    /* ── New v2 form — `new Component(tag, opts?)` ──────────────────────────
     *
     * Constructor-call form. Produces a `ComponentWrapper` exposing the SAME
     * underlying element through TWO views: `.Real` (live DOM) and `.Virtual`
     * (virtual node, lazily mirrored). Both expose the full fluent API
     * (set/get/sub/on/off/fire/add/append/push/unshift/remove/css/show/hide/
     * signal/effect/computed/text/textMono/Sheet …).
     *
     *   const pluto = new Component('arianna-counter', { initial: 5 });
     *   pluto.Real.set('variant', 'primary').append('#app');
     *   pluto.Virtual.append('#app');     // same underlying element
     */
    new (tag: string, opts?: Record<string, unknown>): ComponentWrapper;

    /**
     * Component.Boot() — populate descriptor.Class for every registered tag
     * whose subclass has been defined but never instantiated via `new`.
     *
     * See SHADOW.md / COMPONENTS.md §3.4 for the rationale. Call once at
     * app entry, after all component modules have been imported.
     */
    Boot(): void;

    /**
     * Component.Define(tag, subclass) — explicitly bind a user subclass to its
     * tag without instantiating it. Call once at module load, right after the
     * class declaration:
     *
     *   class CodeEditor extends Component('arianna-code-editor', HTMLElement, …) { … }
     *   Component.Define('arianna-code-editor', CodeEditor);
     *
     * Needed because subclasses of HTMLElement that aren't registered via native
     * customElements throw on `new`, so the lazy `new.target` capture never runs.
     */
    Define(tag: string, subclass: Function): void;
}

function ComponentFn(this: unknown, ...args: unknown[]): unknown
{
    // ─────────────────────────────────────────────────────────────────────
    //  Construct form: `new Component(tag, opts?)`  →  ComponentWrapper
    //
    //  When invoked with `new` and a string tag, we DON'T go through the
    //  factory path (which returns a class). Instead, we instantiate a
    //  wrapper that exposes the same underlying element via `.Real` (live
    //  DOM, eager) and `.Virtual` (virtual node, lazy). Both views share
    //  the same Element instance.
    //
    //  Detection rule:
    //    - `new.target` is set ⇒ caller used `new`
    //    - first arg is a non-empty string
    //    - second arg is either undefined or a plain object (opts)
    //  (Constructor function targets pass `function` for arg1, so the
    //   string check naturally excludes them.)
    // ─────────────────────────────────────────────────────────────────────
    if (new.target && typeof args[0] === 'string'
        && (args[1] === undefined || (typeof args[1] === 'object' && args[1] !== null && !((args[1] as object) instanceof Element))))
    {
        return new ComponentWrapper(args[0] as string, args[1] as Record<string, unknown> | undefined);
    }

    // Instance form: Component(el)
    if (args.length === 1 && args[0] instanceof Element)
        return _installFacilities(args[0]);

    // ── Decorator form ────────────────────────────────────────────────────
    //
    //   @Component('arianna-x', css, def)            ← positional
    //   class A extends HTMLElement { ... }
    //
    //   @Component({ tag: 'arianna-x', style, attrs, ... })  ← object-style
    //   class A extends HTMLElement { ... }
    //
    // The decorator is detected when:
    //   - args[0] is a string (positional) AND args[1] is NOT a constructor
    //     function (it's css | object | Rule | Stylesheet | null | undefined)
    //   - OR args[0] is a plain object with a `tag` key (object-style)
    //
    // The returned function is a class decorator that:
    //   1. Receives the user's class as `target`
    //   2. Reads its superclass from Object.getPrototypeOf(target.prototype).constructor
    //   3. Registers the tag in CUSTOM with descriptor.Class = target
    //   4. Returns `target` unchanged so the class identity is preserved
    //
    // Object-style accepts keys: tag, base, css, style, template, shadow,
    // attrs, bus, render. style and css are aliases.
    {
        const isPositionalDecorator =
            typeof args[0] === 'string'
            && typeof args[1] !== 'function';

        const isObjectStyleDecorator =
            typeof args[0] === 'object'
            && args[0] !== null
            && !(args[0] instanceof Element)
            && typeof (args[0] as { tag?: unknown }).tag === 'string';

        if (isPositionalDecorator || isObjectStyleDecorator) {
            let dTag: string;
            let dCss: ComponentStyleInput | undefined;
            let dDef: ComponentDef = {};
            let dBaseHint: Function | undefined;

            if (isObjectStyleDecorator) {
                const opts = args[0] as {
                    tag: string;
                    base?: Function;
                    css?: ComponentStyleInput;
                    style?: ComponentStyleInput;
                    template?: string;
                    shadow?: 'open' | 'closed' | boolean;
                    attrs?: string[];
                    bus?: string;
                    render?: 'real' | 'virtual';
                };
                dTag = opts.tag;
                dCss = opts.css ?? opts.style;
                dBaseHint = opts.base;
                if (opts.shadow   !== undefined) dDef.shadow   = opts.shadow as ComponentDef['shadow'];
                if (opts.attrs    !== undefined) dDef.attrs    = opts.attrs;
                if (opts.bus      !== undefined) dDef.bus      = opts.bus;
                if (opts.render   !== undefined) dDef.render   = opts.render;
                if (opts.template !== undefined) (dDef as { template?: string }).template = opts.template;
            } else {
                dTag = args[0] as string;
                const dArg2 = args[1];
                const dArg3 = args[2];
                if (dArg2 !== undefined && dArg2 !== null) {
                    if (_isMixedDef(dArg2)) {
                        dDef = dArg2 as ComponentDef;
                        dCss = (dArg2 as ComponentDef).css;
                    } else {
                        dCss = dArg2 as ComponentStyleInput;
                        if (dArg3) dDef = dArg3 as ComponentDef;
                    }
                } else if (dArg3 !== undefined) {
                    dDef = dArg3 as ComponentDef;
                }
            }

            // Expose the style as a CSS string on the Def so the facilities
            // decorator-style block can inject it into a native shadow root
            // (covers the no-template positional form). Rule/Stylesheet expose
            // .Text; plain objects still flow via __ariannaSheetDefault below.
            if (typeof dCss === 'string') {
                (dDef as { css?: string }).css = dCss;
            } else if (dCss && typeof (dCss as { Text?: string }).Text === 'string') {
                (dDef as { css?: string }).css = (dCss as { Text?: string }).Text;
            }

            // Return the actual decorator function.
            //
            // This function is meant to be invoked ONLY as a class decorator —
            // either via `@Component(...)` (TC39 stage 3 / TypeScript legacy
            // decorator), or by a build tool's decorator transformer.
            //
            // The programmatic invocation form
            //     Component('tag', css, def)(class extends Base { ... })
            // is DEPRECATED in AriannA 2.0 and will throw. Use the factory form:
            //     class A extends Component('tag', Base, css, def) { build() {...} }
            // or the standard decorator:
            //     @Component('tag', css, def)
            //     class A extends Base { ... }
            //
            // The heuristic to detect programmatic invocation: anonymous classes
            // (target.name === '' or '_default') passed at the decorator call
            // site are nearly always the result of `Component(...)(class { ... })`
            // because user-written decorators receive named classes.
            return function decorator(target: Function, _context?: unknown): Function {
                if (typeof target !== 'function') {
                    throw new TypeError(
                        '[arianna] @Component decorator expects a class; got: ' + typeof target,
                    );
                }
                // Programmatic form detection — reject with a migration message.
                if (!target.name || target.name === '_default') {
                    throw new Error(
                        "[arianna] Component('" + dTag + "', css, def)(class { ... }) " +
                        'is the deprecated programmatic-decorator form and is removed ' +
                        'in AriannA 2.0. Use the factory form:\n' +
                        "  class MyClass extends Component('" + dTag + "', Base, css, def) { build() {...} }\n" +
                        'or the standard class decorator:\n' +
                        "  @Component('" + dTag + "', css, def)\n" +
                        '  class MyClass extends Base { ... }',
                    );
                }

                // Read the superclass from the class's prototype chain
                const superCtor = dBaseHint
                    ?? (Object.getPrototypeOf(target.prototype)?.constructor as Function | undefined)
                    ?? HTMLElement;

                // Register the tag in CUSTOM
                CoreDefine(
                    dTag,
                    target as new (...a: unknown[]) => Element,
                    superCtor as new (...a: unknown[]) => Element,
                    {},
                );

                // Stash def + sheet on the user class (so build() can read them)
                const desc = GetDescriptor(dTag) as {
                    Class?       : Function | null;
                    Constructor? : Function | null;
                    Prototype?   : object   | null;
                    Def?         : ComponentDef;
                    __ariannaSheetDefault?: Stylesheet;
                } | false;
                if (desc) {
                    desc.Class       = target;
                    desc.Constructor = target;
                    desc.Prototype   = (target as { prototype: object }).prototype;
                    desc.Def         = dDef;
                    desc.__ariannaSheetDefault = _normaliseComponentSheet(dCss);
                }
                (target as unknown as { __ariannaDef: ComponentDef }).__ariannaDef = dDef;
                (target as unknown as { __ariannaSheetDefault?: Stylesheet }).__ariannaSheetDefault = _normaliseComponentSheet(dCss);
                // Fix B — explicit flag for Namespace.Update wantsAutoComponent
                (target as unknown as { __ariannaComponent: boolean }).__ariannaComponent = true;

                return target;
            };
        }
    }

    // Factory form: Component(tag, Base, ...)
    const tag  = args[0];
    const base = args[1];
    if (typeof tag !== 'string' || typeof base !== 'function')
        throw new Error('Component(...) expects (Element) | (tag, Base, [css|def], [def]).');

    const arg3 = args[2];
    const arg4 = args[3];

    let css: ComponentStyleInput | undefined = undefined;
    let def: ComponentDef = {};

    if (arg3 !== undefined) {
        if (_isMixedDef(arg3)) {
            def = arg3 as ComponentDef;
            css = (arg3 as ComponentDef).css;
        } else {
            css = arg3 as ComponentStyleInput;
            if (arg4) def = arg4 as ComponentDef;
        }
    }

    // Build the bound class that the user will `extends`.  Constructor body
    // is intentionally trivial — Component(this) is called explicitly so the
    // factory's introspection picks it up.  The factory below replaces this
    // class entirely; what the user `extends` is the factory.
    //
    // We forward the user's constructor arguments to ComponentFn so that
    // build(opts) receives whatever the user passed to `new MyComp(opts)`.
    // The args are stashed on the element under __buildArgs for the
    // _installFacilities pipeline to pick up.
    //
    // ── What the factory returns: the shared `Component` class ──────────────
    //
    // `Component(tag, base, css, def)` returns the shared, per-base `Component`
    // class (see _resolveComponentClassForBase). The user writes:
    //
    //     class Cuore extends Component('papa', HTMLDivElement, css, def) {
    //         build() { ... }
    //     }
    //
    // which makes the chain `Cuore → Component → HTMLDivElement → HTMLElement`.
    // `Component` is a NAMED class (not an anonymous `Bound`), shared across
    // all tags that share a base, so `Core.GetPrototypeChain(node)` reports
    // "Component" — the architectural invariant (COMPONENTS.md §1).
    //
    // Inside the Component constructor, after `super(...)`, `new.target` is the
    // most-derived class — the user's class (Cuore). The first `new Cuore()`
    // captures it and populates the descriptor's Class / Constructor / Prototype
    // (keyed by the element's live tag). From that point markup-instantiated
    // <papa> nodes are upgraded by the MutationObserver by splicing
    // `descriptor.Prototype` (= Cuore.prototype) onto them — exactly the way
    // `customElements.define('papa', Cuore)` would, but registry-mediated.
    //
    // PER-TAG data (def, default sheet) is NOT stored on the shared Component
    // class (that would collide across tags). It lives on the descriptor, keyed
    // by tag — the single source of truth. _installFacilities reads it from
    // GetDescriptor(el.tagName), never from the constructor.
    //
    // For the markup-only case (component placed in HTML before any `new Sub()`
    // ran), `Component.Boot()` or the Namespace fallback lookup populates
    // descriptor.Class once; thereafter Update uses Sub.prototype directly.
    // ── ROOT-CAUSE FIX (28/05/2026) ──────────────────────────────────────
    // The 22/05 baseline called CoreDefine(tag, Bound, base, {}) where Bound
    // was the per-tag user-builder class. The current revision had degraded
    // to CoreDefine(tag, base, base, {}) — registering the descriptor with
    // Constructor === Interface === wrapped (the patched native). In the
    // window between that registration and the post-hoc overwrite at line
    // 1530, three things ran with an inconsistent ctor:
    //   • Core.Extends(wrapped, wrapped) — cycle (mitigated by the Extends
    //     wouldCycle guard in Core.ts, but the underlying mismatch remained)
    //   • Namespace.Define's internal _factory was built around ctor=wrapped
    //   • the `arianna-wip:defined` event fired with a descriptor whose
    //     Constructor pointed at the patched native — any listener that
    //     later instantiated through it constructed the native as if it
    //     were the custom ctor, surfacing as async "Illegal constructor".
    //
    // Fix: resolve the shared ComponentClass FIRST and pass it to CoreDefine.
    // The descriptor is now coherent from the moment of registration; the
    // subsequent assignments at line 1530 below remain (they set per-tag
    // statics on the descriptor — Class/Def/__ariannaSheetDefault — that
    // were never part of CoreDefine's contract).
    const ComponentClass = _resolveComponentClassForBase(base, null);

    CoreDefine(
        tag,
        ComponentClass as unknown as new (...a: unknown[]) => Element,
        base           as unknown as new (...a: unknown[]) => Element,
        {},
    );
    const descriptor = GetDescriptor(tag) as {
        Class?       : Function | null;
        Constructor? : Function | null;
        Prototype?   : object   | null;
        Style?       : Record<string, string>;
        Def?         : ComponentDef;
        __ariannaSheetDefault? : Stylesheet;
    } | false;

    // ─── The interposed class IS `Component` (not an anonymous `Bound`) ──────
    //
    // The chain we want for every component instance is:
    //
    //     Subclass → Component → [HTML(X)Element] → HTMLElement → …
    //
    // `Component` is ONE shared class per base interface. We cache it in
    // `_componentClassByBase` so that all `arianna-*` tags sharing a base
    // (almost always HTMLElement) reuse the SAME `Component` link in the
    // chain — no proliferation, no per-tag anonymous wrappers. This is the
    // single most important architectural rule (COMPONENTS.md §1, §2, anti-rot
    // rule 5: "No wrappers between user subclass and Component").
    //
    // The class is a NAMED class expression `class Component extends base`,
    // so `Core.GetPrototypeChain(node)` reports "Component" — not "Bound",
    // not "" (anonymous). The constructor holds the shared facility-install
    // logic and captures `new.target` (the user subclass) on first `new`.
    //
    // `Component` is also a callable dispatcher (ComponentFn). The class link
    // and the dispatcher are two faces of the same symbol exported as
    // `Component`: the dispatcher handles `Component(el)`, `Component('#id')`,
    // `Component(tag, base, css, def)`; the class handles `extends Component(...)`
    // and `new Subclass()`. They are NOT the same object instance here (the
    // dispatcher is `ComponentFn`, the per-base link is this cached class), but
    // they share the name `Component` and the dispatcher delegates instance
    // installation to the class via `ComponentFn.call(null, this)`.

    if (descriptor) {
        descriptor.Class               = null;          // populated lazily on first `new Subclass()`
        descriptor.Prototype           = (ComponentClass as { prototype: object }).prototype;
        descriptor.Def                 = def;
        descriptor.__ariannaSheetDefault = _normaliseComponentSheet(css);
    }

    (ComponentClass as unknown as { __ariannaComponent: boolean }).__ariannaComponent = true;

    // ─── Per-tag BRIDGE (Option A, descriptor-resolved — legacy parity) ──────
    // The user writes `class A4a extends Component('case-4a', …)`. We return a
    // thin per-tag bridge `class extends Component {}` and register it as the
    // tag's descriptor.Constructor. The chain becomes
    //     A4a → Component (bridge, case-4a) → Component (shared) → base
    // and at `new A4a()` the constructor resolves its tag purely via
    // descriptors: GetDescriptor(Object.getPrototypeOf(new.target)).Tags[0]
    // → 'case-4a', DETERMINISTIC and unambiguous across the dozens of
    // HTMLElement-based tags (no shared-class ambiguity, no FIFO queue).
    const Bridge = class Component extends (ComponentClass as new (...a: unknown[]) => HTMLElement) {};
    (Bridge as unknown as { __ariannaComponent: boolean }).__ariannaComponent = true;
    if (descriptor) {
        descriptor.Constructor = Bridge as unknown as Function;   // GetDescriptor(Bridge).Tags → [tag]
        descriptor.Prototype   = (Bridge as { prototype: object }).prototype;
    }
    // Index the bridge under this tag's descriptor so GetDescriptor(Bridge)
    // resolves (by constructor identity) → its Tags.
    try { Core.IndexClass(Bridge as unknown as Function, descriptor as unknown as never); } catch { /* best-effort */ }

    return Bridge as unknown as new (...a: unknown[]) => Element;
}

// ─── Per-base Component class cache ──────────────────────────────────────────
//
// One `Component` class per base interface. `arianna-button` and any other
// HTMLElement-based tag share the SAME Component class — the chain link is
// identical, only the descriptor (keyed by tag) differs. This keeps the chain
// `Subclass → Component → base` with a single shared Component per base.
const _componentClassByBase = new WeakMap<Function, Function>();

function _resolveComponentClassForBase(
    base: Function,
    _descriptor: unknown | null,
): Function
{
    const cached = _componentClassByBase.get(base);
    if (cached) return cached;

    // Named class expression: the name `Component` is what shows up in the
    // prototype chain. The constructor:
    //   1. super() — chains to the base (HTMLElement / HTMLDivElement / …)
    //   2. captures new.target (the user subclass) into the tag's descriptor
    //   3. stashes constructor args for build()
    //   4. installs facilities (shadow / sheet / attrs / build / template)
    //
    // The descriptor lookup at construction time is keyed by the element's
    // tag (resolved inside _installFacilities / via the live tagName), NOT by
    // a closed-over descriptor — because this class is shared across tags.
    const Component = class Component extends (base as new () => HTMLElement) {
        constructor(...args: unknown[]) {
            super();
            const ctor = new.target as unknown as Function | undefined;
            if (ctor) {
                const bridge   = Object.getPrototypeOf(ctor) as Function;
                const bDesc    = GetDescriptor(bridge as new (...a: unknown[]) => Element) as { Tags?: string[] } | false;
                const liveTag  = (bDesc && bDesc.Tags && bDesc.Tags[0]?.toLowerCase())
                    || (this as Element).tagName?.toLowerCase?.() || '';

                // ── Legacy-faithful element creation (Component.js 5737-5751) ──
                // `super()` on a custom-tag subclass that isn't natively
                // registered yields a bare element with the WRONG tag and a
                // prototype chain flattened to HTMLElement. So we create the REAL
                // element via Core.Create(liveTag) — which runs the namespace's
                // Update (correct tag, prototype splice, data-arianna-tag stamp,
                // classes, facilities, build) — bind the subclass into the
                // descriptor first, set its prototype on top, and RETURN it.
                // Returning an object from a constructor overrides `this`
                // (ECMA-262 §9.2.2), exactly as legacy did.
                if (liveTag) {
                    const d0 = GetDescriptor(liveTag) as { Class?: Function | null; Constructor?: Function; Prototype?: object; Interface?: unknown } | false;
                    if (d0 && !d0.Class) { d0.Class = ctor; d0.Constructor = ctor; d0.Prototype = (ctor as { prototype: object }).prototype; }

                    // Use Core.Create ONLY for autonomous components, where super()
                    // produced a bare/wrong element (flattened chain). For a
                    // concrete native base (HTMLButtonElement, HTMLInputElement, …)
                    // super() already built the correct REAL element (a real
                    // <button> with working native setters like .type) — routing
                    // through Core.Create would instead make a <case-4j> custom
                    // tag that is NOT a real button, so this.type would throw
                    // 'Illegal invocation'. Detect native base: desc.Interface is
                    // an HTMLElement subclass other than HTMLElement itself.
                    const iface = d0 ? d0.Interface as (Function | undefined) : undefined;
                    const ifaceName = (iface as { name?: string } | undefined)?.name ?? '';
                    // Native base = a built-in element interface (HTMLButtonElement,
                    // HTMLInputElement, SVGSVGElement, …), NOT plain HTMLElement and
                    // NOT a user class (A4n, L3_4n never match this pattern).
                    const isNativeBase = /^(HTML|SVG|MathML)[A-Za-z]*Element$/.test(ifaceName)
                        && ifaceName !== 'HTMLElement';

                    if (!isNativeBase && (this as Element).tagName?.toLowerCase?.() !== liveTag) {
                        const real = Core.Create(liveTag) as Element | null;
                        if (real) {
                            try {
                                if (Object.getPrototypeOf(real) !== (ctor as { prototype: object }).prototype) {
                                    Object.setPrototypeOf(real, (ctor as { prototype: object }).prototype);
                                }
                            } catch { /* frozen */ }
                            (real as unknown as { __buildArgs?: unknown[] }).__buildArgs = args;
                            return real as unknown as this;
                        }
                    }

                    // Native-base this-path (e.g. <button> from super()): the real
                    // element has no is=/data-arianna-tag, so GetDescriptor(this)
                    // would resolve the STANDARD tag's descriptor (plain 'button')
                    // instead of the custom one — losing the default sheet. Stamp
                    // the custom identity, exactly as Namespace.Update does for
                    // markup, so _installFacilities resolves the right descriptor.
                    if (isNativeBase && (this as Element).tagName?.toLowerCase?.() !== liveTag) {
                        try {
                            (this as Element).setAttribute('is', liveTag);
                            (this as Element).setAttribute('data-arianna-tag', liveTag);
                        } catch { /* ignore */ }
                    }
                }
            }
            (this as unknown as { __buildArgs?: unknown[] }).__buildArgs = args;
            ComponentFn.call(null, this);
        }
    };

    _componentClassByBase.set(base, Component);
    return Component;
}

Object.defineProperty(ComponentFn, 'name', { value: 'Component' });

/**
 * Component.Boot — close the markup-only gap.
 *
 * The descriptor's `Class` field is populated the first time `new Subclass()`
 * runs (via super-propagated `new.target` in the Component constructor). For
 * applications that only use markup (no programmatic `new Button()` ever),
 * `Class` stays null and Namespace.Update has to fall back to a global lookup.
 *
 * `Component.Boot()` makes the population explicit. It walks every registered
 * custom descriptor whose `Class` is null and tries to find the user subclass
 * via the convention that every component module does
 *   `Object.defineProperty(window, '<Name>', { value: <Name> })`
 * at module load. If found, it calls `new Subclass()` once to trigger the
 * `descriptor.Class = new.target` capture inside the Component constructor, then
 * discards the throwaway instance.
 *
 * Idempotent — only descriptors with `Class === null` are touched. Safe to
 * call multiple times (subsequent calls do nothing).
 *
 * Recommended call site: after all component imports at app entry.
 *   import './components/inputs/Button.ts';
 *   import './components/inputs/Input.ts';
 *   Component.Boot();
 */
/**
 * Component.Define(tag, subclass) — explicit, reliable registration of a user
 * subclass for a tag, WITHOUT instantiating it.
 *
 * Why this exists: the factory returns a SHARED `Component`-per-base class and
 * cannot see the user subclass, so `descriptor.Class` is normally populated
 * lazily by `new.target` on the first `new Subclass()`. But for components that
 * extend `HTMLElement` and are NOT registered via native `customElements`,
 * `new Subclass()` throws "Illegal constructor" — so the lazy capture never
 * runs, `descriptor.Class` stays null, and markup-upgrade cannot find the right
 * subclass (it may even pick a different class that shares the same base —
 * exactly the <arianna-code-editor> → ArrayModifierElement bug).
 *
 * `Component.Define('arianna-code-editor', CodeEditor)` sets the descriptor's
 * Class/Constructor/Prototype directly. Call it once at module load, right
 * after the class declaration. No `new`, no throw, no global scan, no ambiguity.
 */
(ComponentFn as unknown as { Define: (tag: string, subclass: Function) => void }).Define =
function Define(tag: string, subclass: Function): void
{
    if (!tag || typeof subclass !== 'function') return;
    const desc = GetDescriptor(tag.toLowerCase()) as {
        Class?: Function | null; Constructor?: Function; Prototype?: object; Custom?: boolean;
    } | false;
    if (!desc) {
        console.warn(`[arianna] Component.Define: no descriptor for <${tag}> — was Component('${tag}', …) called first?`);
        return;
    }
    desc.Class       = subclass;
    desc.Prototype   = (subclass as { prototype: object }).prototype;
    // DO NOT overwrite desc.Constructor.
    //
    // The markup-upgrade path (Namespace.Update) uses desc.Class / desc.Prototype
    // to prototype-splice the node — that is all that is needed to bind the
    // subclass to markup-created elements.
};

(ComponentFn as unknown as { Boot: () => void }).Boot = function Boot(): void
{
    const globalScope = (typeof window !== 'undefined' ? window : globalThis) as unknown as Record<string, unknown>;
    const namespaces  = Namespaces as Record<string, { Custom?: { Tags?: Record<string, unknown> } }>;

    for (const nsKey of Object.keys(namespaces)) {
        const ns = namespaces[nsKey];
        const tags = ns?.Custom?.Tags;
        if (!tags) continue;

        for (const tag of Object.keys(tags)) {
            const desc = tags[tag] as {
                Class?       : Function | null;
                Constructor? : Function;
                Tags?        : string[];
                Custom?      : boolean;
            };
            if (!desc || !desc.Custom) continue;
            if (desc.Class) continue;   // already known
            const baseCtor = desc.Constructor;
            if (!baseCtor) continue;

            // Walk global scope for a constructor whose prototype chain
            // contains this tag's bridge prototype.
            const targetTag = desc.Tags?.[0] ?? tag;
            const baseProto = (baseCtor as { prototype?: object }).prototype;
            if (!baseProto) continue;

            for (const key of Object.keys(globalScope)) {
                const candidate = globalScope[key];
                if (typeof candidate !== 'function') continue;
                if (candidate === baseCtor) continue;
                const candidateProto = (candidate as { prototype?: object }).prototype;
                if (!candidateProto) continue;
                // Check chain inclusion.
                let p: object | null = Object.getPrototypeOf(candidateProto);
                let found = false;
                while (p) {
                    if (p === baseProto) { found = true; break; }
                    p = Object.getPrototypeOf(p);
                }
                if (!found) continue;
                // Found a subclass on the global scope whose chain includes this
                // tag's bridge — instantiate once to populate desc.Class.
                try {
                    // The new instance is thrown away. Its only purpose is to
                    // trigger the Component constructor's `descriptor.Class = new.target` capture.
                    const throwaway = new (candidate as new (...a: unknown[]) => Element)();
                    // If the throwaway was inserted anywhere (shouldn't be, but defensive), remove it.
                    if ((throwaway as Element).parentNode) {
                        (throwaway as Element).parentNode!.removeChild(throwaway as Element);
                    }
                } catch (e) {
                    console.warn(`[arianna] Component.Boot: failed to instantiate ${(candidate as { name?: string }).name} for tag <${targetTag}>:`, e);
                }
                break;   // moved on to next descriptor
            }
        }
    }
};

// NOTE: Component.Types is intentionally REMOVED in v2.
// Use Core.Define(tag, ctor, Base, css) instead — it auto-resolves the
// namespace from the Base interface and delegates to Namespace.Define.
//
// Migration:
//   Component.Types.Define(tag, ctor, Base, css)   → Core.Define(tag, ctor, Base, css)
//   Component.Types.GetPrototypeChain(el)          → Core.GetPrototypeChain(el)
//   Component.Types.GetDescriptor(query)           → Core.GetDescriptor(query)
//   Component.Types.Namespaces                      → Core.Namespaces

export const Component = ComponentFn as ComponentCallable;
export default Component;

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Component', {
        value: Component, writable: false, enumerable: true, configurable: false,
    });
}


// ─────────────────────────────────────────────────────────────────────────────
//  M2 STEP 1 — Lifecycle wiring to Core.Observer
//
//  Core.Observer already emits:
//    - 'arianna-wip:nodeadded'   on document   when a node enters the DOM
//    - 'arianna-wip:noderemoved' on document   when a node leaves the DOM
//
//  We hook these to call mount()/unmount() on elements with facilities installed.
//  No changes to Core.ts needed.
//
//  Anti-double-mount: mount()/unmount() are themselves idempotent (check
//  __isMounted), so MutationObserver fires on element movement won't double
//  fire user hooks.
//
//  Subtree walk: when a parent enters the DOM, every descendant element that
//  has facilities also gets mount() called. This handles off-tree subtree
//  construction (build card off-DOM, then attach — descendants need mount).
// ─────────────────────────────────────────────────────────────────────────────

if (typeof document !== 'undefined')
{
    const callMountRecursive = (root: Element) => {
        const stash = root as Element & { __isMounted?: boolean; mount?: () => void };
        if (typeof stash.mount === 'function' && !stash.__isMounted) {
            try { stash.mount(); }
            catch (e) { console.warn('[arianna] mount() failed:', e); }
        }
        // Walk descendants
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
        let n: Element | null = walker.nextNode() as Element | null;
        while (n) {
            const ns = n as Element & { __isMounted?: boolean; mount?: () => void };
            if (typeof ns.mount === 'function' && !ns.__isMounted) {
                try { ns.mount(); }
                catch (e) { console.warn('[arianna] mount() failed:', e); }
            }
            n = walker.nextNode() as Element | null;
        }
    };

    const callUnmountRecursive = (root: Element) => {
        // Walk descendants first (LIFO unmount order — children before parent)
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
        const descendants: Element[] = [];
        let n: Element | null = walker.nextNode() as Element | null;
        while (n) { descendants.push(n); n = walker.nextNode() as Element | null; }

        for (let i = descendants.length - 1; i >= 0; i--) {
            const ns = descendants[i] as Element & { __isMounted?: boolean; unmount?: () => void };
            if (typeof ns.unmount === 'function' && ns.__isMounted) {
                try { ns.unmount(); }
                catch (e) { console.warn('[arianna] unmount() failed:', e); }
            }
        }
        const stash = root as Element & { __isMounted?: boolean; unmount?: () => void };
        if (typeof stash.unmount === 'function' && stash.__isMounted) {
            try { stash.unmount(); }
            catch (e) { console.warn('[arianna] unmount() failed:', e); }
        }
    };

    document.addEventListener('arianna-wip:nodeadded', (e: Event) => {
        const ce = e as CustomEvent<{ node: Node }>;
        const node = ce.detail?.node;
        if (node instanceof Element) callMountRecursive(node);
    });

    document.addEventListener('arianna-wip:noderemoved', (e: Event) => {
        const ce = e as CustomEvent<{ node: Node }>;
        const node = ce.detail?.node;
        if (node instanceof Element) callUnmountRecursive(node);
    });
}
