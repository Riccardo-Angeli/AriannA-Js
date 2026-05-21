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
import Rule from './Rule.ts';
import { readDottedPath, writeDottedPath, makeSubAccessor, type SubAccessor } from './Real.ts';
import Real from './Real.ts';
import Virtual, { VirtualNode } from './Virtual.ts';

// ─────────────────────────────────────────────────────────────────────────────
//  Public types
// ─────────────────────────────────────────────────────────────────────────────

export type ShadowSetting = false | true | 'open' | 'close' | 'drop' | 'inset' | 'glow' | 'layered';
export type RenderMode    = 'real' | 'virtual';

export interface ComponentDef
{
    attrs?  : string[];
    shadow? : ShadowSetting;
    render? : RenderMode;
    bus?    : string;
    css?    : Record<string, string>;
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


function _getShadowRoot(el: Element): ShadowRoot | null
{
    return ((el as unknown as Record<symbol, unknown>)[SHADOW_ROOT] as ShadowRoot | undefined)
        ?? ((el as HTMLElement).shadowRoot ?? null);
}

function _attachAriannaShadow(el: Element, mode: 'open' | 'closed' = 'closed'): ShadowRoot | null
{
    const existing = _getShadowRoot(el);
    if (existing) return existing;
    try {
        const root = (el as HTMLElement).attachShadow({ mode });
        Object.defineProperty(el, SHADOW_ROOT, {
            value: root, enumerable: false, configurable: false, writable: false,
        });
        return root;
    } catch (e) {
        console.warn('[arianna] attachShadow failed — element type does not support Shadow DOM:', e);
        return null;
    }
}

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
    stash.__instanceId  = 'c' + Math.random().toString(36).slice(2, 10);
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

    // Apply def-driven features stored on the constructor.
    const ctor = el.constructor as unknown as { __ariannaDef?: ComponentDef };
    const def  = ctor.__ariannaDef ?? {};

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
        const style = (el as HTMLElement).style as unknown as Record<string, string>;
        for (const k of Object.keys(def.css)) {
            const camelKey = k[0].toLowerCase() + k.slice(1);
            try { style[camelKey] = def.css[k]; }
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
    //                   def.shadow === 'open' → open
    //                   anything else         → closed (default)
    // ─────────────────────────────────────────────────────────────────────
    {
        const ctorWithDef = (el as Element).constructor as unknown as {
            __ariannaDef?: { shadow?: 'open' | 'closed' | boolean };
        };
        const def       = ctorWithDef.__ariannaDef ?? {};
        const defShadow = def.shadow;
        const mode: 'open' | 'closed' | false =
            defShadow === false ? false :
            defShadow === 'open' ? 'open' :
            'closed';
        if (mode !== false) _attachAriannaShadow(el, mode);
    }

    // Call build() synchronously now that facilities are installed.
    // For classes that `extends Component(tag, Base)`, this is the only place
    // build() can be invoked automatically — the patched native constructor
    // (HTMLDivElement, etc.) can't see the user's body, and a microtask
    // schedule would fail the contract of test 3.1 which reads `trace` SYNC
    // right after `new MyComp(opts)`.
    //
    // Args: read from el.__buildArgs which the Bound constructor stashed
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
            const renderTarget: ParentNode =
                (elHasTpl.shadowRoot as ParentNode | undefined) ?? (el as ParentNode);
            const signals = elHasTpl.__attrSignals ?? {};
            try {
                if (typeof elHasTpl.template.attach === 'function') {
                    elHasTpl.template.attach(renderTarget, el as unknown as object, signals);
                } else if (typeof elHasTpl.template.mount === 'function') {
                    elHasTpl.template.mount(renderTarget as Element, el as unknown as object);
                }
            } catch (e) {
                console.warn('[arianna] template attach failed:', e);
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

    const tag       = el.tagName.toLowerCase();
    const shadowRoot = _getShadowRoot(el);
    const useShadow  = !!shadowRoot;
    const replace    = useShadow ? ':host' : tag;

    let css = '';
    for (const r of next.Rules) {
        // Rewrite host selectors:
        //   :root and &  — legacy v1/v2 conventions
        //   :host        — shadow-DOM standard (post-migration default in v3)
        //   :host(X)     — host with attribute/pseudo X (rewrite the wrapper
        //                  away in light DOM; keep as-is in shadow DOM)
        let scoped = r.Text;
        if (useShadow) {
            // In shadow DOM, :root/& should become :host. :host stays.
            scoped = scoped.replace(/(^|,\s*|\s)(:root|&)(?![\w-])/g, (_m, pre: string) => pre + ':host');
        } else {
            // In light DOM, every host-selector form becomes the tag selector.
            //   :host([direction="vertical"])  →  arianna-splitter[direction="vertical"]
            //   :host(:not([direction]))       →  arianna-splitter:not([direction])
            //   :host                           →  arianna-splitter
            //   :root / &                       →  arianna-splitter
            //
            // We rewrite :host(...) with a balanced-paren scan because the
            // inner expression itself may contain parens (e.g. :not(...)).
            scoped = rewriteHostWithArgs(scoped, replace);
            scoped = scoped.replace(/(^|,\s*|\s)(:root|:host|&)(?![\w-])/g, (_m, pre: string) => pre + replace);
        }
        css += scoped + '\n';
    }

    const styleEl = document.createElement('style');
    styleEl.textContent = css;
    styleEl.setAttribute('data-arianna-sheet',    tag);
    styleEl.setAttribute('data-arianna-instance', stash.__instanceId);

    if (useShadow && shadowRoot) shadowRoot.appendChild(styleEl);
    else {
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
    (tag: string, base: new (...a: unknown[]) => Element, css: Record<string, string>): new (...a: unknown[]) => AriannaElement;
    (tag: string, base: new (...a: unknown[]) => Element, css: Record<string, string>, def: ComponentDef): new (...a: unknown[]) => AriannaElement;
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

    // Factory form: Component(tag, Base, ...)
    const tag  = args[0];
    const base = args[1];
    if (typeof tag !== 'string' || typeof base !== 'function')
        throw new Error('Component(...) expects (Element) | (tag, Base, [css|def], [def]).');

    const arg3 = args[2];
    const arg4 = args[3];

    let css: Record<string, string> = {};
    let def: ComponentDef            = {};

    if (arg3 !== undefined) {
        if (_isMixedDef(arg3)) {
            def = arg3 as ComponentDef;
            css = (arg3 as ComponentDef & Record<string, string>).css ?? {};
        } else {
            css = arg3 as Record<string, string>;
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
    // The args are stashed on the element under __buildArgs for the microtask
    // scheduler in _installFacilities to pick up.
    //
    // NOTE on descriptor identity: Component(tag, Base, ...) registers `Bound`
    // in the descriptor, but the actual user class (e.g. `_CodeEditor extends
    // Component(...)`) lives one level deeper. Namespace.Update repoints the
    // descriptor to the most-derived user class on first call (via the
    // window.<PascalCase> convention) — that's where markup-instantiated
    // elements have their user methods spliced from.
    const Bound = class extends (base as new () => HTMLElement) {
        constructor(...args: unknown[]) {
            super();
            (this as unknown as { __buildArgs?: unknown[] }).__buildArgs = args;
            ComponentFn.call(null, this);
        }
    };
    (Bound as unknown as { __ariannaComponent: boolean }).__ariannaComponent = true;
    (Bound as unknown as { __ariannaDef: ComponentDef }).__ariannaDef         = def;

    const pretty = tag
        .replace(/^arianna-/, '')
        .replace(/-(.)/g, (_, c: string) => c.toUpperCase())
        .replace(/^./, c => c.toUpperCase());
    try { Object.defineProperty(Bound, 'name', { value: pretty }); } catch { /* native */ }

    // Register the tag via Core.Define (terminal — does NOT return a factory).
    // What `extends Component('my-tag', HTMLDivElement)` extends is the Bound
    // class declared above. The user's class chain:
    //
    //   UserClass -> Bound -> HTMLDivElement -> HTMLElement -> ...
    //
    // When the user creates the element via markup (<my-tag>),
    // document.createElement, or Core.Create, the Observer/Update path
    // splices the user's prototype + applies CSS + runs body.
    CoreDefine(
        tag,
        Bound as unknown as new (...a: unknown[]) => Element,
        base as unknown as new (...a: unknown[]) => Element,
        css,
    );
    return Bound as unknown as new (...a: unknown[]) => Element;
}

Object.defineProperty(ComponentFn, 'name', { value: 'Component' });

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
