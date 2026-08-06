/**
 * @module    core/Namespace
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 *
 * # Namespace — distributed CustomElementRegistry of AriannA
 *
 * Unlike the W3C `CustomElementRegistry` (singleton, define-once, hardcoded
 * to 3 namespaces), AriannA's `Namespace` is an **instantiable class**:
 *
 *   const html   = new Namespace('html',   { URI: 'http://www.w3.org/1999/xhtml',      NS: false, ... });
 *   const svg    = new Namespace('svg',    { URI: 'http://www.w3.org/2000/svg',        NS: true,  ... });
 *   const mathML = new Namespace('mathML', { URI: 'http://www.w3.org/1998/Math/MathML', NS: true,  ... });
 *   const x3d    = new Namespace('x3d',    { URI: 'http://www.web3d.org/...',           NS: true,  ... });
 *
 * # The data root (v2)
 *
 * In v2 `Namespace` is the **import-free data root** of the framework: it owns
 * the type model and nothing it depends on points back up to it.
 *
 *   - Namespace.Descriptors — runtime registry shapes (`Type`, `Namespace`): the
 *                             records stored in the live registry maps and read
 *                             on the hot path.
 *   - Namespace.IR          — the serializable IR model (Node, Style, Binding,
 *                             EventBinding, …) that Real/Virtual materialize.
 *
 * `Element`, `Map`, `Record` are ambient (lib.dom / lib.es), so the module
 * imports nothing — the invariant that keeps the dependency graph acyclic.
 *
 * Each instance owns:
 *   - Standard.{Interfaces, Tags} — pre-registered native interfaces + tags
 *   - Custom.{Interfaces, Tags}   — user-defined custom elements (mutable)
 *   - Create(tag)                  — createElement vs createElementNS (per NS flag)
 *   - Define(tag, ctor, base, css) — registers a new Custom descriptor
 *   - GetDescriptor(query)         — lookup by tag, ctor, or instance
 *   - Update(node)                 — called by Core.Observer on every upgrade
 *
 * # Orthogonal concerns via IoC (v2)
 *
 * Behaviour that is not "data" no longer lives in Namespace; it is injected as a
 * service so the data root stays import-free and single-responsibility:
 *
 *   - CSS apply / emit    — provided by Rule / Stylesheet
 *   - Shadow attach / get — provided by Shadow; `Type` carries a `Shadow` ref,
 *                           just as it carries its `Namespace`
 *   - Fragile install     — provided by Real, driven by descriptor data
 *   - Native patching      — performed by Core at boot (see below)
 *
 * Services are registered at boot into a `Namespace.Services` slot; the factory
 * and Update paths call the injected service, never an imported implementation.
 *
 * # Fragile forms — data, not a hardcoded table (v2)
 *
 * Native interfaces with internal slots (input, select, textarea, canvas, img,
 * video, …) cannot be prototype-spliced reliably. Instead of a hardcoded proxy
 * spec keyed by interface name, each descriptor carries the forwarding data:
 *
 *   - Slot       — 'Internal' (backing native isolated in a shadow root) or
 *                  'External' (backing native in light DOM, for form/label/AOM)
 *   - Properties — property names forwarded to the inner native element
 *   - Methods    — method names forwarded to the inner native element
 *
 * The install logic (compose inner native + forward) lives in Real / an IoC
 * installer; Namespace only declares the data. A descriptor also carries two
 * independent status axes: `State` (the descriptor's own construction outcome)
 * and `Supported`/`Defined` (the type's standing within its namespace).
 *
 * # Why we don't (necessarily) use customElements
 *
 *   - customElements locks you into 3 namespaces; we want any number
 *   - customElements.define is one-shot; we allow redefine, mutation, removal
 *   - customElements requires `extends:'div'` for native-extension; we patch
 *     the native constructors so `extends HTMLDivElement` works directly
 *   - customElements lifecycle (connectedCallback etc.) is browser-imposed;
 *     ours flows through Core.Observer which YOU control
 *   - customElements requires the constructor body to be empty during super();
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
 *   4. If descriptor.Custom: optionally call the Component(node) installer
 *   5. Run the user's constructor body bound to the node
 *
 * Shadow attachment, CSS application and fragile forwarding in this path go
 * through the injected services, not through helpers owned by Namespace.
 *
 * # Native constructor patching — a Core boot concern (v2)
 *
 * Making `class FormC extends HTMLDivElement { constructor() { super(); ... } }`
 * work without customElements.define requires the native constructors to be
 * patched so `super()` yields a real element from the right namespace. In v2
 * this is an **operational** step performed by **Core at boot**, driven by the
 * descriptor data Namespace owns — not by the data root itself. For every
 * standard interface (HTMLDivElement, HTMLInputElement, SVGCircleElement, …)
 * Core:
 *
 *   1. Reads window[ifaceName] — the native browser constructor
 *   2. Wraps it in a function that, when invoked via `super()`, produces a real
 *      DOM element from THIS namespace (createElement / createElementNS) with
 *      the user's class prototype spliced in front
 *   3. Reinstalls the wrapper at window[ifaceName]
 */
import { Namespaces }    from "./Namespaces.ts";
import type { Observers } from './Observer.ts';

/**
 * @namespace Core
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description Type-only contracts for the Namespace data root: the runtime
 *              registry descriptors (`Namespace.Descriptors`) and the
 *              serializable IR model (`Namespace.IR`).
 *
 *              The data root imports nothing — `Element`, `Map`, `Record` are
 *              ambient (lib.dom / lib.es), so the "Namespace imports nothing"
 *              invariant holds. Both sub-namespaces contain only types and
 *              therefore erase at compile time (zero runtime footprint); never
 *              place a `const` or function here, or TypeScript will emit the
 *              namespace object.
 */
export namespace Core
{
    /** Constants Block */

    /** @name        Scopes
     *  @public
     *  @type        {Readonly<Record<string, { configurable: boolean; enumerable: boolean; writable: boolean }>>}
     *  @description Reusable `Object.defineProperty` descriptor templates (sealed by default):
     *               `Private`, `Readonly`, `Writable`, `Configurable`. Spread one into a descriptor
     *               and add the `value`.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     *  @example     Object.defineProperty(obj, 'k', { ...Core.Scopes.Readonly, value: 42 });
     */
    export const Scopes: Readonly<Record<string,
        {
            configurable : boolean;
            enumerable   : boolean;
            writable     : boolean
        } >> = Object.freeze
    (
        {
            Private      : { configurable: false, enumerable: false, writable: false },
            Readonly     : { configurable: false, enumerable: true,  writable: false },
            Writable     : { configurable: false, enumerable: true,  writable: true  },
            Configurable : { configurable: true,  enumerable: true,  writable: false },
        }
    );

    /** Namespaces Block */

    /** @namespace   Services
     *  @memberof    Core
     *  @description The service registry — the single "quasi zero-import" seam of the kernel. Holds a
     *               private `services` Map, the operations over it (Register / Resolve / Has / Revoke /
     *               Providers / Call), the `Service` class producers instantiate to self-register, the
     *               structural service SHAPE types (`Types.CssService` / `EventService` / `ObservableService`),
     *               and the lazy accessor getters (`Events` / `Observables` / `Css`). Feature modules
     *               (Events.ts, Observables.ts, Css.ts) register their container here at namespace init
     *               and resolve one another THROUGH this registry — never importing each other directly.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export namespace Services
    {
        /** @name        services
         *  @private
         *  @constant
         *  @memberof    Core.Services
         *  @type        {Map<string, Record<string, unknown>>}
         *  @description The registry backing store — the single source of truth for all registered service
         *               containers, keyed by name. Deliberately PRIVATE to the namespace: every read and
         *               write goes through the exported operations (`Register` / `Resolve` / `Has` /
         *               `Revoke` / `Providers` / `Call`) and the lazy accessor getters, never by touching
         *               the Map directly. This encapsulation is what lets the storage change (e.g. to a
         *               different structure) without breaking a single call site.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        const services = new Map<string, Record<string, unknown>>();

        /* Services Types  */

        /** @namespace   Types
         *  @memberof    Core.Services
         *  @description Structural SHAPE types for the registered service containers. Each type describes
         *               only the surface a consumer calls — typed structurally (no `import` of Css / Events
         *               / Observables) so Core stays free of feature-module dependencies. A lookup returns
         *               `T | undefined`; the absence lives at the call site, not in the type.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export namespace Types
        {
            /** @name        ObserverService
             *  @public
             *  @memberof    Core.Services.Types
             *  @type        {object}
             *  @description Structural contract of the 'observer' service. Two members and no more: `Create`
             *               hands back the OBJECT, and everything an observer can do is on it — connecting,
             *               reconfiguring, draining, sweeping. Re-exporting those through the registry would
             *               keep the same API alive in two places, with the worse signature of the two: a
             *               method turned into a function taking its own receiver, an accessor turned into a
             *               read/write call. `DrainAll` is here because it is the one operation that has no
             *               instance to hang from.
             *
             *               Everything is `unknown` on purpose: naming the class would put back the import
             *               the service exists to remove. Callers holding the real type cast on their side.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            export type ObserverService =
            {
                /** @name        Create
                 *  @public
                 *  @memberof    Core.Services.Types.ObserverService
                 *  @param       {MutationCallback} [callback] Reports each batch the browser delivers; the
                 *               default is kept when omitted.
                 *  @param       {Partial<MutationObserverInit>} [configuration] Merged OVER the defaults,
                 *               never substituted — `{ attributes: false }` narrows them, whereas a
                 *               single-key config would read as childList off too and the observer would
                 *               silently report nothing.
                 *  @param       {Node} [element] The root to watch. Passing it CONNECTS; it comes last
                 *               because everything before it configures, and adding a root starts the watch.
                 *  @returns     {unknown} The Observer — connected only when `element` was given.
                 *  @description Build an observer. The only entry point: what comes back carries the whole
                 *               surface, so the registry does not have to.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                Create(callback?: MutationCallback, configuration?: Partial<MutationObserverInit>, element?: Node): unknown;

                /** @name        DrainAll
                 *  @public
                 *  @memberof    Core.Services.Types.ObserverService
                 *  @returns     {void}
                 *  @description Flush EVERY live observer synchronously. Static by nature — it acts on the
                 *               registry, not on one instance — which is why it survives here while the
                 *               per-observer `drain` stays on the object.
                 *
                 *               Diagnostic in intent: it also flushes observers the kernel does not own, and
                 *               running someone else's callback at a moment they did not choose is a real
                 *               cost. The kernel drains only its own, through `AriannA.Drain`.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                DrainAll(): void;
            };

            /** @name        EventService
             *  @public
             *  @memberof    Core.Services.Types
             *  @description Shape of the 'events' service. Fire / On / Off over DOM targets or a
             *               selector string, typed structurally so Core needs no import from Events.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            export type EventService =
            {
                Fire
                (
                    target: EventTarget | string | readonly EventTarget[],
                    event: string |
                        {
                            Type         : string;
                            Detail?      : unknown;
                            Cancelable?  : boolean;
                            Propagation? : boolean;
                            Path?        : string[];
                            Broker?      : string;
                        }
                ): boolean;
                On
                (
                    target: EventTarget | string | readonly EventTarget[],
                    types: string,
                    handler: EventListener,
                    options?: AddEventListenerOptions & { phase?: 'capture' | 'bubble' | 'broker'; brokers?: string[] },
                ): unknown[];
                Off
                (
                    target: EventTarget | string | readonly EventTarget[],
                    types: string,
                    handler: EventListener,
                ): void;
            };

            /** @name        ObservableService
             *  @public
             *  @memberof    Core.Services.Types
             *  @description Shape of the 'observable' service. make / signal / reactive / effect /
             *               computed, typed structurally so Core needs no import from Observables.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            export type ReactivityService =
            {
                make(value: object): object;
                signal<T>(value: T): { Value: T; value: T };
                reactive<T extends object>(raw: T): T;
                effect(fn: (onCleanup?: (cb: () => void) => void) => void): () => void;
                computed<T>(fn: () => T): { readonly Value: T; readonly value: T };
            };

            /** @name        CssService
             *  @public
             *  @memberof    Core.Services.Types
             *  @description Shape of the 'css' service. Rule / Stylesheet static surfaces, typed
             *               structurally so Core needs no import from Css.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            export type CssService =
            {
                Compile
                (
                    input: unknown,
                    selector?: string
                ): string | false;
                readonly Rule:
                {
                    GetObject(text: string): Record<string, unknown>;
                    GetText(rule: object): string;
                    GetText(rule: object, selector:string): string;
                    GetContents(rule: object): Record<string, unknown>;
                    GetType(rule: object): string;
                    GetSelector(rule: object): string;
                    From(rule: object): object;
                    Parse(text: string): object[];
                };
                readonly Stylesheet:
                {
                    ToString(source: unknown): string;
                    Parse(text: string): object;
                    ToArray(text: string): object[];
                    Less(text: string): string;
                    readonly Sheets: object[];
                    readonly Links: HTMLLinkElement[];
                    readonly Paths: string[];
                };
                readonly Types:
                {
                    readonly Rule       : 'Rule';
                    readonly Stylesheet : 'Stylesheet';
                };
            };

            /** @name        RealService
             *  @private
             *  @memberof    Core.Services.Types
             *  @type        {{ create(arg: unknown): Real }}
             *  @description Local shape of the `'real'` service as consumed here: `create` builds a Real primitive
             *               from an element or tag. Mirrors `Core.Services.Types.RealService` (typed structurally
             *               in Core to avoid importing Real); here `Real` is in scope, so the return is concrete.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            export type RealService =
            { create(arg: unknown): object };

            /** @name        VirtualService
             *  @public
             *  @memberof    Core.Services.Types
             *  @description Shape of the 'virtual' service (Virtual DOM / virtual-node backend). STUB — the
             *               surface will be defined when the Virtual module lands; empty for now so the
             *               accessor and registry wiring can exist ahead of the implementation.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            export type VirtualService =
            {  };

            /** @name        ShadowService
             *  @public
             *  @memberof    Core.Services.Types
             *  @description Shape of the 'shadow' service (registered by the Shadow module): `shadow`
             *               renders a component's template / shadow root for a node. Typed structurally
             *               (node/opts kept loose) so Core needs no import from the Shadow module.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            export type ShadowService =
            {
                shadow(node: Element, opts:
                { def?: Record<string, unknown>; tag?: string }): void
            };

            /** @name        TemplatesService
             *  @public
             *  @memberof    Core.Services.Types
             *  @description Shape of the 'templates' service (template compilation / instantiation). STUB —
             *               surface TBD when the Template module lands; empty for now so the accessor and
             *               registry wiring can exist ahead of the implementation.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            export type TemplatesService =
            {  };

            /** @name        StateService
             *  @public
             *  @memberof    Core.Services.Types
             *  @description Shape of the 'state' service (registered by the State module): `make` builds a
             *               State (Observable + named snapshots + mutation history) from a source object.
             *               Typed structurally (returns `object`) so Core needs no import from the State module.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            export type StateService =
            { make(source: object): object };

            /** @name        ContextService
             *  @public
             *  @memberof    Core.Services.Types
             *  @description Shape of the 'context' service (dependency/context propagation across the tree).
             *               STUB — surface TBD when the Context module lands; empty for now so the accessor
             *               and registry wiring can exist ahead of the implementation.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            export type ContextService =
            { };

            /** @name        DirectivesService
             *  @public
             *  @memberof    Core.Services.Types
             *  @description Shape of the 'directives' service (attribute/behavioural directives registry).
             *               STUB — surface TBD when the Directives module lands; empty for now so the accessor
             *               and registry wiring can exist ahead of the implementation.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            export type DirectivesService =
            {  };
        }

        /* Services Static Services Properties */

        /** @name        Object.defineProperties (service accessors)
         *  @public
         *  @memberof    Core.Services
         *  @description Installs the three lazy service accessors — `Events`, `Observables`, `Css` —
         *               as getter properties on the `Services` namespace object. Each getter reads the
         *               registry AT ACCESS TIME via `Resolve`, never caching: a service registered
         *               later by its own module (Events.ts / Observables.ts / Css.ts, each `new
         *               Core.Services.Service(...)` at its namespace init) is therefore always seen. A
         *               plain `const` snapshot would freeze `undefined` while the registry is still
         *               empty at load; a getter re-reads on every access instead. Consumers write
         *               `Core.Services.Events?.Fire(...)`, `Core.Services.Observables?.make(...)`,
         *               `Core.Services.Css?.compile(...)` — the `?.` guards the window before the
         *               producing module has registered (SSR / early boot). This is the "quasi
         *               zero-import" seam: producers self-register, consumers resolve through the
         *               registry, and no feature module imports another directly.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Object.defineProperties
        (
            Services,
            {
                Observer:
                {
                    get(): Services.Types.ObserverService | undefined
                    { return Services.Resolve<Services.Types.ObserverService>('observer'); },
                    enumerable: false, configurable: true,
                },
                /** @name        Events
                 *  @public
                 *  @readonly
                 *  @memberof    Core.Services
                 *  @type        {Services.Types.EventService | undefined}
                 *  @description Lazy accessor for the 'events' service container (registered by Events.ts).
                 *               Resolved per access; `undefined` until the producer registers.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                Events:
                {
                    get(): Services.Types.EventService | undefined
                    { return Services.Resolve<Services.Types.EventService>('events'); },
                    enumerable: false, configurable: true,
                },
                /** @name        Observables
                 *  @public
                 *  @readonly
                 *  @memberof    Core.Services
                 *  @type        {Services.Types.ObservableService | undefined}
                 *  @description Lazy accessor for the 'observable' service container (registered by
                 *               Observables.ts). Resolved per access; `undefined` until registered.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                Reactive:
                {
                    get(): Services.Types.ReactivityService | undefined
                    { return Services.Resolve<Services.Types.ReactivityService>('reactive'); },
                    enumerable: false, configurable: true,
                },
                /** @name        Css
                 *  @public
                 *  @readonly
                 *  @memberof    Core.Services
                 *  @type        {Services.Types.CssService | undefined}
                 *  @description Lazy accessor for the 'css' service container (registered by Css.ts).
                 *               Resolved per access; `undefined` until registered.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                Css:
                {
                    get(): Services.Types.CssService | undefined
                    { return Services.Resolve<Services.Types.CssService>('css'); },
                    enumerable: false, configurable: true,
                },
                /** @name Real
                 *  @public
                 *  @readonly
                 *  @memberof Core.Services
                 *  @type {Services.Types.RealService | undefined}
                 *  @description Lazy accessor for the 'real' service; resolved per access, undefined until registered.
                 *  @author Riccardo Angeli
                 *  @copyright Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license MIT / Commercial (dual license) */
                Real:
                {
                    get(): Services.Types.RealService | undefined
                    { return Services.Resolve<Services.Types.RealService>('real'); },
                    enumerable: false, configurable: true,
                },
                /** @name        Shadow
                 *  @public
                 *  @readonly
                 *  @memberof    Core.Services
                 *  @type        {Services.Types.ShadowService | undefined}
                 *  @description Lazy accessor for the 'shadow' service — resolved from the registry on every
                 *               access (never cached), so a provider registered after this file loads is still
                 *               seen; `undefined` until the Shadow module registers it.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                Shadow:
                {
                    get(): Services.Types.ShadowService | undefined
                    { return Services.Resolve<Services.Types.ShadowService>('shadow'); },
                    enumerable: false, configurable: true,
                },
                /** @name        State
                 *  @public
                 *  @readonly
                 *  @memberof    Core.Services
                 *  @type        {Services.Types.StateService | undefined}
                 *  @description Lazy accessor for the 'state' service — resolved from the registry on every
                 *               access (never cached), so a provider registered after this file loads is still
                 *               seen; `undefined` until the State module registers it.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                State:
                {
                    get(): Services.Types.StateService | undefined
                    { return Services.Resolve<Services.Types.StateService>('state'); },
                    enumerable: false, configurable: true,
                },
                /** @name        Virtual
                 *  @public
                 *  @readonly
                 *  @memberof    Core.Services
                 *  @type        {Services.Types.VirtualService | undefined}
                 *  @description Lazy accessor for the 'virtual' service — resolved from the registry on every
                 *               access (never cached), so a provider registered after this file loads is still
                 *               seen; `undefined` until the Virtual module registers it.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                Virtual:
                {
                    get(): Services.Types.VirtualService | undefined
                    { return Services.Resolve<Services.Types.VirtualService>('virtual'); },
                    enumerable: false, configurable: true,
                },
                /** @name        Templates
                 *  @public
                 *  @readonly
                 *  @memberof    Core.Services
                 *  @type        {Services.Types.TemplatesService | undefined}
                 *  @description Lazy accessor for the 'templates' service — resolved from the registry on every
                 *               access (never cached), so a provider registered after this file loads is still
                 *               seen; `undefined` until the Templates module registers it.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                Templates:
                {
                    get(): Services.Types.TemplatesService | undefined
                    { return Services.Resolve<Services.Types.TemplatesService>('templates'); },
                    enumerable: false, configurable: true,
                },
                /** @name        Context
                 *  @public
                 *  @readonly
                 *  @memberof    Core.Services
                 *  @type        {Services.Types.ContextService | undefined}
                 *  @description Lazy accessor for the 'context' service — resolved from the registry on every
                 *               access (never cached), so a provider registered after this file loads is still
                 *               seen; `undefined` until the Context module registers it.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                Context:
                {
                    get(): Services.Types.ContextService | undefined
                    { return Services.Resolve<Services.Types.ContextService>('context'); },
                    enumerable: false, configurable: true,
                },
                /** @name        Directives
                 *  @public
                 *  @readonly
                 *  @memberof    Core.Services
                 *  @type        {Services.Types.DirectivesService | undefined}
                 *  @description Lazy accessor for the 'directives' service — resolved from the registry on every
                 *               access (never cached), so a provider registered after this file loads is still
                 *               seen; `undefined` until the Directives module registers it.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                Directives:
                {
                    get(): Services.Types.DirectivesService | undefined
                    { return Services.Resolve<Services.Types.DirectivesService>('directives'); },
                    enumerable: false, configurable: true,
                }
            }
        );

        export declare const Observer:    Services.Types.ObserverService   | undefined;
        /** @name        Events
         *  @public
         *  @readonly
         *  @memberof    Core.Services
         *  @type        {Services.Types.EventService | undefined}
         *  @description Ambient type declaration for the runtime getter installed above — lets TypeScript
         *               see `Core.Services.Events` (the `defineProperties` getter supplies the value).
         *               `declare` emits no code, so there is no conflict with the runtime definition.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export declare const Events:      Services.Types.EventService      | undefined;
        /** @name        Observables
         *  @public
         *  @readonly
         *  @memberof    Core.Services
         *  @type        {Services.Types.ObservableService | undefined}
         *  @description Ambient type declaration for the runtime getter installed above — lets TypeScript
         *               see `Core.Services.Observables`. `declare` emits no code.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export declare const Reactivity:  Services.Types.ReactivityService | undefined;
        /** @name        Css
         *  @public
         *  @readonly
         *  @memberof    Core.Services
         *  @type        {Services.Types.CssService | undefined}
         *  @description Ambient type declaration for the runtime getter installed above — lets TypeScript
         *               see `Core.Services.Css`. `declare` emits no code.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export declare const Css:         Services.Types.CssService        | undefined;
        /** @name        Real
         *  @public
         *  @readonly
         *  @memberof    Core.Services
         *  @type        {Services.Types.RealService | undefined}
         *  @description Ambient type declaration for the runtime `Real` getter installed via
         *               `Object.defineProperties` above — it lets TypeScript see `Core.Services.Real`
         *               while the getter supplies the value at run time (`declare` emits no code, so there
         *               is no conflict with the runtime definition). Resolves the `'real'` service lazily
         *               on every access; `undefined` until the Real module registers it.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export declare const Real:        Services.Types.RealService       | undefined;
        /** @name        Shadow
         *  @public
         *  @readonly
         *  @memberof    Core.Services
         *  @type        {Services.Types.ShadowService | undefined}
         *  @description Ambient declaration for the runtime Shadow getter installed via
         *               `Object.defineProperties` — lets TypeScript see `Core.Services.Shadow` while the
         *               getter supplies the value at run time (`declare` emits no code). Resolves the
         *               'shadow' service lazily; `undefined` until registered.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export declare const Shadow:      Services.Types.ShadowService     | undefined;
        /** @name        State
         *  @public
         *  @readonly
         *  @memberof    Core.Services
         *  @type        {Services.Types.StateService | undefined}
         *  @description Ambient declaration for the runtime State getter installed via
         *               `Object.defineProperties` — lets TypeScript see `Core.Services.State` while the
         *               getter supplies the value at run time (`declare` emits no code). Resolves the
         *               'state' service lazily; `undefined` until registered.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export declare const State:       Services.Types.StateService      | undefined;
        /** @name        Virtual
         *  @public
         *  @readonly
         *  @memberof    Core.Services
         *  @type        {Services.Types.VirtualService | undefined}
         *  @description Ambient declaration for the runtime Virtual getter installed via
         *               `Object.defineProperties` — lets TypeScript see `Core.Services.Virtual` while the
         *               getter supplies the value at run time (`declare` emits no code). Resolves the
         *               'state' service lazily; `undefined` until registered.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export declare const Virtual:     Services.Types.VirtualService    | undefined;
        /** @name        Templates
         *  @public
         *  @readonly
         *  @memberof    Core.Services
         *  @type        {Services.Types.TemplatesService | undefined}
         *  @description Ambient declaration for the runtime Templates getter installed via
         *               `Object.defineProperties` — lets TypeScript see `Core.Services.Templates` while the
         *               getter supplies the value at run time (`declare` emits no code). Resolves the
         *               'state' service lazily; `undefined` until registered.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export declare const Templates:   Services.Types.TemplatesService  | undefined;
        /** @name        Context
         *  @public
         *  @readonly
         *  @memberof    Core.Services
         *  @type        {Services.Types.ContextService | undefined}
         *  @description Ambient declaration for the runtime Context getter installed via
         *               `Object.defineProperties` — lets TypeScript see `Core.Services.Context` while the
         *               getter supplies the value at run time (`declare` emits no code). Resolves the
         *               'state' service lazily; `undefined` until registered.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export declare const Context:     Services.Types.ContextService    | undefined;
        /** @name        Directives
         *  @public
         *  @readonly
         *  @memberof    Core.Services
         *  @type        {Services.Types.DirectivesService | undefined}
         *  @description Ambient declaration for the runtime Directives getter installed via
         *               `Object.defineProperties` — lets TypeScript see `Core.Services.Directives` while the
         *               getter supplies the value at run time (`declare` emits no code). Resolves the
         *               'state' service lazily; `undefined` until registered.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export declare const Directives:  Services.Types.DirectivesService | undefined;

        /* Services Static Namespace Functions */

        /** @name        Register
         *  @public
         *  @function
         *  @memberof    Core.Services
         *  @param       {string} name Non-empty registry key.
         *  @param       {object} container Capability container.
         *  @returns     {void}
         *  @description Register (or override, last-write-wins) a named container in the registry.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function  Register(name: string, container: object): void
        { services.set(name, container as Record<string, unknown>); }
        /** @name        Resolve
         *  @public
         *  @function
         *  @memberof    Core.Services
         *  @template    T
         *  @param       {string} name Registry key.
         *  @returns     {T | undefined} The container, or `undefined` when unregistered.
         *  @description Resolve a registered container by name. The primary lookup used by the lazy
         *               accessors and by consumers reaching services through the registry.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function  Resolve<T extends object = object>(name: string): T | undefined
        { return services.get(name) as T | undefined; }
        /** @name        Provides
         *  @public
         *  @function
         *  @memberof    Core.Services
         *  @param       {string} name Registry key.
         *  @returns     {boolean} True if a container is registered under `name`.
         *  @description Membership test against the registry.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function  Provides(name: string): boolean
        { return services.has(name); }
        /** @name        Revoke
         *  @public
         *  @static
         *  @memberof    Core.Services.Service
         *  @param       {string} name Registry key.
         *  @returns     {boolean} True if a container was present and removed.
         *  @description Remove a registered container from the registry.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function  Revoke(name: string): boolean
        { return services.delete(name); }
        /** @name        Providers
         *  @public
         *  @static
         *  @memberof    Core.Services.Service
         *  @returns     {string[]} The names of all registered containers.
         *  @description Enumerate every registry key currently registered.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function  Providers(): string[]
        { return [...services.keys()]; }
        /** @name        Call
         *  @public
         *  @static
         *  @memberof    Core.Services.Service
         *  @template    R
         *  @param       {string} name Registry key.
         *  @param       {string} method Method name on the container.
         *  @param       {...unknown} args Arguments forwarded to the method.
         *  @returns     {R | undefined} The method's result, or `undefined` if the service is
         *               unregistered or the member is not a function.
         *  @description Resolve a container and invoke `container[method](...args)` in one call —
         *               a convenience over `Resolve(name)?.[method](...)`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function Call<R = unknown>
        (
            name   : string,
            method : string,
            ...args: unknown[]
        ): R | undefined
        {
            const container =
                services.get(name);

            const candidate =
                container?.[method];

            if
            (
                !container ||
                typeof candidate !== 'function'
            )
            {
                return undefined;
            }

            return (
                candidate as
                    (
                        this: Record<string, unknown>,
                        ...values: unknown[]
                    ) => R
            )
            .apply(container, args);
        }

        export class Service<T extends object = object>
        {
            static
            {
                if (typeof window !== 'undefined' && !Object.prototype.hasOwnProperty.call(window, 'Service'))
                {
                    Object.defineProperty
                    (
                        window,
                        'Service',
                        {
                            enumerable: true,
                            configurable: false,
                            writable: false,
                            value: Service
                        }
                    );
                }
            }

            /**
             * @name Name
             * @public
             * @readonly
             * @type {string}
             * @description Registry key.
             * @author Riccardo Angeli
             * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
             * @license MIT / Commercial (dual license)
             * */
            public readonly Name : string;
            /** @name Container @public @readonly @type {Record<string, unknown>} @description The registered container. @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
            public readonly Container : Record<string, unknown>;

            /** @name constructor @public @description Validate, store, and register the container into the shared Services map (last-write-wins). @param {string} name Non-empty key. @param {Record<string, unknown>} container Capability container. @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
            constructor(name: string, container: Record<string, unknown>)
            {
                if (!name || typeof name !== 'string')          throw new TypeError('Service: name must be a non-empty string.');
                if (!container || typeof container !== 'object') throw new TypeError('Service: container must be an object.');
                this.Name = name; this.Container = container;
                Services.Register(name, container);
            }
        }
    }

    /** @namespace   Types
     *  @memberof    Core
     *  @description Shared structural type aliases used across the kernel — the
     *               constructor/interface shapes that the descriptors and `Define`
     *               rely on. Names are distinct from the descriptor's field names
     *               (`Constructor`/`Interface`) to avoid self-referential overlap.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export namespace Types
    {
        /** @name        Primitive
         *  @public
         *  @type        {'string' | 'number' | 'boolean' | 'function' | 'object'}
         *  @memberof    Core.Types
         *  @namespace   Core
         *  @description The `typeof`-checkable primitive tags shared by `Is()` and
         *               `Property` — the true common denominator of the two validators.
         *               Composed into `Type` and `Native` instead of being repeated.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export type Primitive   = 'string' | 'number' | 'boolean' | 'function' | 'object' | 'symbol';

        /** @name        Constructor
         *  @public
         *  @type        {(new (...args: unknown[]) => unknown) | ((...args: unknown[]) => unknown)}
         *  @memberof    Core.Types
         *  @namespace   Core
         *  @description A user-supplied constructor: a class (construct-style) or a
         *               function constructor / factory (call-style). Its return is
         *               NOT necessarily an `Element` — it may yield a wrapper, a
         *               Real, any object. Superset of `IDLInterface` (an IDL
         *               interface is also a valid `Ctor`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export type Constructor = (new (...args: unknown[]) => unknown) | ((...args: unknown[]) => unknown);

        /** @name        Type
         *  @public
         *  @type        {Primitive | 'integer' | 'array' | 'any' | ((v: unknown) => boolean)}
         *  @memberof    Core.Types
         *  @namespace   Core
         *  @description Runtime validation marker used by `Property`: the primitive tags
         *               plus `integer` / `array` / `any`, or a user predicate. Matches
         *               exactly the cases of `Property._matchesType` (exhaustive switch).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export type Type        = Primitive | 'integer' | 'array' | 'any' | ((v: unknown) => boolean);

        /** @name        IDL
         *  @public
         *  @type        {new (...args: unknown[]) => Element}
         *  @memberof    Core.Types
         *  @namespace   Core
         *  @description The constructor of a native DOM interface — `HTMLElement`,
         *               `HTMLDivElement`, `SVGSVGElement`, `MathMLElement`, and every
         *               other built-in whose instances are `Element`s. A CONSTRUCTOR
         *               type (`.prototype`, `.name`, callable with `new`), NOT the
         *               `Element` instance it produces: the two are duals, and the
         *               distinction matters wherever a type is consumed by reference
         *               (a `Base` to extend, a value to splice) rather than by instance.
         *               Named as a domain concept so `Base`, `IsNative`, and friends read
         *               in terms of "native interface" instead of a bare constructor
         *               signature — and so a non-DOM target can redefine what a native
         *               interface IS in one place, without the DOM leaking into every
         *               signature. Distinct from `Native` (the string tags `Is()` tests)
         *               and from `Declaration === 'NATIVE'` (how a type was declared):
         *               `IDL` is the constructor's TYPE, the other two are a tag set and
         *               a registry value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export type IDL         = new (...args: unknown[]) => Element;

        /** @name        Native
         *  @public
         *  @type        { Primitive | 'symbol' | 'class' | 'idl' | Constructor }
         *  @memberof    Core.Types
         *  @namespace   Core
         *  @description Type tags accepted by `Is()`: the primitive tags plus `symbol`,
         *               `class` (function whose source starts with `class`), or a
         *               `Constructor` to test with `instanceof`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export type Native      = Primitive | 'class' | 'idl' | 'idl-patched' | Constructor;

        /** @name        Base
         *  @public
         *  @type        {IDL | symbol | Function}
         *  @memberof    Core.Types
         *  @namespace   Core
         *  @description The base a Custom type extends. Accepts three shapes: a native
         *               DOM IDL constructor (`HTMLElement`, `SVGSVGElement`, … — the
         *               usual case), a `symbol` (a registered/branded base looked up in
         *               the type registry rather than passed by reference), or a plain
         *               `Function` (a user constructor/factory serving as base). Broader
         *               than `IDL` — it does not require the base to be construct-style or
         *               to yield an `Element` — and orthogonal to `Constructor`, which is
         *               the implementation being defined, not what it extends.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export type Base        = IDL | symbol | Constructor

        /** @name        Declaration
         *  @public
         *  @type        {'CLASS' | 'FUNCTION' | 'IDL'}
         *  @memberof    Core.Types
         *  @namespace   Core
         *  @description Declaration form of a type's backing value — how it was written,
         *               independent of what it extends. `'CLASS'` is a `class` (construct-
         *               style, its constructor runs on `new`); `'FUNCTION'` is a plain
         *               function constructor / factory (call-style, its body runs via
         *               apply on the node); `'IDL'` is a native DOM interface constructor
         *               (`HTMLDivElement`, `SVGSVGElement`, …). `GetDeclaration` resolves
         *               all three from a live constructor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export type Declaration = 'CLASS' | 'FUNCTION' | 'IDL';

        /** @name        Packages
         *  @public
         *  @memberof    Core
         *  @type        {string | readonly string[] | { base?: string; core?: boolean | string; additionals?: boolean | string; components?: boolean | string; bundles?: readonly string[]; mirror?: boolean }}
         *  @description Boot spec accepted by `Bootstrap` / `AriannA`. A single keyword/URL string, a list
         *               of them, or an object selecting the standard bundles (`core` / `additionals` /
         *               `components`) plus extra `bundles`, a resolution `base`, and a `mirror` flag.
         *               Keywords resolve to `${base}arianna.js` (core) or `${base}arianna-<kw>.js`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export type Packages =
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

        /** @name        TypeOptions
         *  @public
         *  @type        {{ Css?: string; Attrs?: string[]; Shadow?: 'open'|'closed'|false; Bus?: string; Render?: 'real'|'virtual'; Template?: {...}; Slot?: 'Internal'|'External' }}
         *  @memberof    Core.Types
         *  @namespace   Core
         *  @description The optional configuration a caller hands to Reserve/Define for a Custom
         *               type. These are the AUTHORING shapes (a `shadow` string, a single `bus`
         *               name), which Reserve normalizes into the descriptor's richer runtime
         *               shapes (a `Shadow` object, a `Brokers` array). Every field is optional;
         *               an omitted field leaves its descriptor counterpart at the empty default.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export interface TypeOptions
        {
            /** Scoped CSS for the type, as a raw string (compiled by the css service at use). */
            Css?      : string;
            /** Observed attribute names → become the descriptor's `Attributes`. */
            Attrs?    : string[];
            /** Shadow projection: 'open'/'closed' attaches a shadow root; false opts out (light DOM). */
            Shadow?   : 'open' | 'closed' | false;
            /** Event-bus name for parent/child registration → wrapped into the descriptor's `Brokers`. */
            Bus?      : string;
            /** JSX render mode for this type → wrapped into the descriptor's `Render`. */
            Render?   : 'real' | 'virtual';
            /** Declarative template spec, passed through to the descriptor's `Template`. */
            Template? : { Ref?: string; Html?: string; Mode?: 'clone' | 'compile' };
            /** Backing-node slotting for form/label/AOM cases, passed through to `Slot`. */
            Slot?     : 'Internal' | 'External';
        }
    }

    /** @namespace Descriptors
     *  @memberof  Namespace
     *  @author    Riccardo Angeli
     *  @copyright Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license MIT / Commercial (dual license)
     *  @description Runtime registry descriptors — the shapes stored in the live
     *               registry maps and read on the hot path.
     */
    export namespace Descriptors
    {
        /** URL schema/spec (in html coincide con Uri) */
        export interface Namespace
        {
            /** @name        Name
             *  @public
             *  @type        {string}
             *  @description Namespace name: 'html' | 'svg' | 'mathML' | 'x3d' | ….
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Name          : string;
            /** @name        Uri
             *  @public
             *  @type        {string}
             *  @description URI used by `createElementNS` (e.g.
             *               'http://www.w3.org/2000/svg').
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Uri           : string;
            /** @name        NS
             *  @public
             *  @type        {boolean}
             *  @description Namespaced flag: `true` → `createElementNS(Uri, tag)`,
             *               `false` → `createElement` (html).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            NS            : boolean;
            /** @name        Base
             *  @public
             *  @type        {(new (...args: unknown[]) => Element) | null}
             *  @description Native base constructor (HTMLElement, SVGElement,
             *               MathMLElement, …); `null` when none applies.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Base          : (new (...args: unknown[]) => Element) | null;
            /** @name        Schema
             *  @public
             *  @type        {string}
             *  @description Schema/spec URL (coincides with `Uri` for html).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Schema        : string;
            /** @name        Documentation
             *  @public
             *  @type        {{ w3c: string }}
             *  @description Reference documentation links for the namespace.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Documentation : { w3c: string };
            /** @name        Types
             *  @public
             *  @type        {{ Standard: Record<string, { Tags: string[] }>; Custom: Record<string, { Tags: string[] }> }}
             *  @description Declarative seed of the namespace's types, split in two: `Standard`
             *               (pre-registered native interfaces → their tags, e.g.
             *               { HTMLDivElement: { Tags: ['div'] }, … }) and `Custom` (user-defined
             *               types, empty at seed time). Serializable config/identity — the live
             *               materialized registry (Interfaces/Tags of descriptors) lives on the
             *               Namespace class, not here.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Types         :
            {
                /** @name        Standard
                 *  @public
                 *  @namespace   Descriptor
                 *  @memberOf    Namespace
                 *  @type        {{ Interfaces: Record<string, Descriptors.Type>; Tags: Record<string, Descriptors.Type> }}
                 *  @description Built-in namespace interfaces, materialized at construction
                 *               from the descriptor seed. `Interfaces`: interface name →
                 *               descriptor; `Tags`: tag → descriptor.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                Standard : { Interfaces: Record<string, { Tags : string[] } >; Tags: Record<string, string> };
                /** @name        Custom
                 *  @public
                 *  @namespace   Descriptor
                 *  @memberOf    Namespace
                 *  @type        {{ Interfaces: Record<string, Descriptors.Type>; Tags: Record<string, Descriptors.Type> }}
                 *  @description User-defined types registered at runtime via Define. Empty
                 *               at construction; same shape as `Standard`.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                Custom   : { Constructors: Record<string, { Tags : string[] } >; Tags: Record<string, string> };
            };
            /** @name        Enabled
             *  @public
             *  @type        {boolean}
             *  @description Operational flag: the namespace is active and serving Create/Update/Define.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Enabled       : boolean,
            /** @name        Disabled
             *  @public
             *  @type        {boolean}
             *  @description Operational flag: the namespace is inactive. Inverse of `Enabled`.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Disabled      : boolean,
            /** @name        State
             *  @public
             *  @type        {boolean}
             *  @description Validity of the namespace descriptor itself (`true` = healthy/usable),
             *               analogous to `Type.State`; distinct from the operational `Enabled`/`Disabled`.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            State         : boolean,
            /** @name        Loading
             *  @public
             *  @type        {boolean}
             *  @description Async-load status — `true` while this namespace's deferred
             *               resources (e.g. its component ESM modules) are being
             *               fetched and registered. The *in-progress* edge: pairs with
             *               `Loaded` (the *completed* edge). Both are `false` before any
             *               load starts. Orthogonal to `Enabled` (operational/serving).
             *  @default     false
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Loading     : boolean;
            /** @name        Loaded
             *  @public
             *  @type        {boolean}
             *  @description Async-load status — `true` once this namespace's deferred
             *               resources have finished loading and registering. The
             *               *completed* edge, distinct from `Loading` (in progress).
             *               Also distinct from `Enabled`: a namespace can be `Loaded`
             *               yet `Disabled` (loaded but not serving Create/Upgrade/Define).
             *  @default     false
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Loaded      : boolean;
            /** @name        Root
             *  @public
             *  @type        {Element | null}
             *  @description Root element under which this namespace mounts and observes
             *               its elements; `null` when unbound (e.g. SSR before attach,
             *               or document-wide observation). Per-namespace — distinct from
             *               the facade's `Core.Root`, which is the whole document root
             *               (`document.documentElement`).
             *  @default     null
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Root        : Window | null
        }

        /** @author    Riccardo Angeli
         *  @copyright Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license MIT / Commercial (dual license)
         *  @interface Type
         *  @memberof  Core.Descriptors
         *  @description Descriptor of a type in the namespace registry (formerly
         *               `TypeDescriptor`).
         *
         *               It carries two independent, complementary status axes:
         *               `State` concerns the descriptor itself — the outcome of its
         *               construction/registration (intact, degraded, unusable) — while
         *               `Supported`/`Defined` concern the type relative to its
         *               namespace (native interface present in the environment / type
         *               registered).
         *
         *               The optional triplet `Slot`/`Properties`/`Methods` appears only
         *               for fragile native forms (those with internal slots) and
         *               travels together: the presence of any one marks the type as
         *               fragile; their absence means a direct native extension.
         */
        export interface Type
        {
            /** @name        Name
             *  @public
             *  @type        {string}
             *  @description Identifying name of the type — the DOM interface name for
             *               standard types, the custom name otherwise.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Name        : string,
            /** @name        Tags
             *  @public
             *  @type        {string[]}
             *  @description Tags that instantiate this type. A type may own several
             *               (e.g. `h1`…`h6` all map to HTMLHeadingElement).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Tags        : string[],
            /** @name        Namespace
             *  @public
             *  @type        {Namespace}
             *  @description Owning namespace (identity: html / svg / mathML / x3d / …).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Namespace   : string,
            /** @name        Constructor
             *  @public
             *  @type        {Constructor | null}
             *  @description Effective constructor used to instantiate the type — a class
             *               or a function. Its return is NOT necessarily an `Element`
             *               (it may yield a wrapper, a Real, any object). `null` when
             *               unresolved.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Constructor : Types.Constructor | null,
            /** @name        Interface
             *  @public
             *  @type        {Interface | null}
             *  @description Reference native DOM interface (HTMLDivElement, SVGSVGElement,
             *               …) — always an `Element` constructor. `null` when absent from
             *               the environment.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Interface   : Types.Constructor | false |null,
            /** @name        Base
             *  @public
             *  @type        {Types.Constructor | false | null}
             *  @description The base as DECLARED at Define time. Differs from `Interface` when the
             *               declared super is a user class: `Interface` is the first patched IDL
             *               found by climbing (what the element is minted from), `Base` is the
             *               constructor the user named (what the prototype is grafted onto).
             *               `false`/`null` when the two coincide. Kept in sync with
             *               `Namespaces.Descriptors.Type`.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Base        : Types.Constructor | false | null,
            /** @name        Prototype
             *  @public
             *  @type        {object | null}
             *  @description Prototype captured at registration, used for the prototype
             *               splice during upgrade; `null` when not available.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Prototype   : object | null,
            /** @name        Supported
             *  @public
             *  @type        {boolean}
             *  @description Type status within the namespace: the native interface is
             *               supported by the environment.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Supported   : boolean,
            /** @name        Defined
             *  @public
             *  @type        {boolean}
             *  @description Type status within the namespace: the type is registered /
             *               defined.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Defined     : boolean,
            /** @name        Patched
             *  @public
             *  @type        {boolean}
             *  @description Whether this type's native constructor has been wrapped by
             *               `_patchNative` (super()-capable). Distinct from `Defined`,
             *               which only marks the type as registered and is `true` for
             *               every supported native regardless of patching — so it can't
             *               gate the patch. Idempotency marker: the patch pass skips a
             *               native whose `Patched` is already `true`. Live runtime field,
             *               not emitted by the serializer.
             *  @default     false
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Patched     : boolean,
            /** @name        Upgraded
             *  @public
             *  @type        {boolean}
             *  @description Whether this type's native constructor has been wrapped by
             *               `_patchNative` (super()-capable). Distinct from `Defined`,
             *               which only marks the type as registered and is `true` for
             *               every supported native regardless of patching — so it can't
             *               gate the patch. Idempotency marker: the patch pass skips a
             *               native whose `Patched` is already `true`. Live runtime field,
             *               not emitted by the serializer.
             *  @default     false
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Upgraded    : boolean,
            /** @name        Declaration
             *  @public
             *  @type        {'FUNCTION' | 'CLASS' | 'CUSTOM'}
             *  @description Declaration form: function, class with `extends`, or custom
             *               element.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Declaration : Types.Declaration,
            /** @name        Type
             *  @public
             *  @type        {'STANDARD' | 'CUSTOM'}
             *  @description Type category: a namespace standard or a user custom type.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Type        : 'STANDARD' | 'CUSTOM',
            /** @name        Standard
             *  @public
             *  @type        {boolean}
             *  @description Convenience boolean: `true` for a namespace standard
             *               (mirrors `Type === 'STANDARD'`).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Standard    : boolean,
            /** @name        Custom
             *  @public
             *  @type        {boolean}
             *  @description Convenience boolean: `true` for a user custom type (mirrors
             *               `Type === 'CUSTOM'`).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Custom      : boolean,
            /** @name        Component
             *  @public
             *  @type        {boolean}
             *  @description Convenience boolean: `true` when this custom type was defined through the
             *               Component (Layer 2) decorator/registration surface. Orthogonal to both `Type` and `Declaration`:
             *               a Component is `Type: 'CUSTOM'`, `Declaration: 'CLASS'`, `Component: true`
             *               — the flag carries the layer distinction WITHOUT extending either enum
             *               (no `'COMPONENT'` Type value, no Component Declaration form, mirroring how
             *               a class is a `Declaration` not a `Type`). COEXISTS with `Custom`: a
             *               Component descriptor has BOTH `Custom: true` and `Component: true`; plain
             *               customs have `Component: false`. The Component decorator marks the descriptor
             *               after synchronous registration; no deferred constructor discovery is involved.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Component   : boolean,
            /** @name        Css
             *  @public
             *  @type        {string}
             *  @description Compiled CSS for this type — the single source of truth for its
             *               styling (replaces the former flat `Style` map). Holds everything:
             *               flat declarations, `@media`, `@keyframes`, pseudo-states, nested
             *               selectors. Applied by injecting a `<style>` block. `''` when the
             *               type has no style (standard natives fall back to UA styles). The
             *               merge of base + custom styles happens upstream in `Define`, before
             *               compilation, so the descriptor always holds the final fused text.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Stylesheet  : string | null;
            /** @name        Methods
             *  @public
             *  @type        {string[]=}
             *  @description Names of methods forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Shadow?     : { Mode: 'open'|'closed', Setting?: any, Css?: boolean, DelegatesFocus?: boolean },
            /** @name        Methods
             *  @public
             *  @type        {string[]=}
             *  @description Names of methods forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Template?   : { Ref?: string, Html?: string, Mode?: 'clone'|'compile' } | null,
            /** @name        Native
             *  @public
             *  @type        {boolean}
             *  @description Registration path: `true` via the browser-native
             *               `customElements.define`, `false` via the AriannA registry.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Native      : boolean,
            /** @name        Chain
             *  @public
             *  @type        {Map<string, unknown>}
             *  @description Prototype chain captured at registration (name → constructor).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Chain?      : string[],
            /** @name        Slot
             *  @public
             *  @type        {'Internal' | 'External'=}
             *  @description Placement of the backing native for forms with internal
             *               slots: `Internal` → inside a shadow root (isolated;
             *               presentational: canvas/img/video/audio), `External` → in
             *               light DOM (participates in form/label/AOM:
             *               input/select/textarea). Absent ⟹ the type is not fragile
             *               (it extends the native directly). The install logic
             *               (compose inner native + forward) lives in Real / an IoC
             *               installer, not here.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Slot?       : 'Internal' | 'External' | null,
            /** @name        State
             *  @public
             *  @type        {'Fail' | 'Warn' | 'Success'}
             *  @description Status of the descriptor itself (construction/registration
             *               outcome): `Success` intact, `Warn` degraded but usable,
             *               `Fail` unusable. Orthogonal to `Supported`/`Defined`, which
             *               describe the type within its namespace.
             *  @default     'Success'
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            State       : 'Fail' | 'Warn' | 'Success' | 'Pending' | null,
            /** @name        Properties
             *  @public
             *  @type        {string[]=}
             *  @description Names of properties forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Attributes? : string[] | null,
            /** @name        Properties
             *  @public
             *  @type        {string[]=}
             *  @description Names of properties forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Render?     : string[] | null,
            /** @name        Properties
             *  @public
             *  @type        {string[]=}
             *  @description Names of properties forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Properties? : string[] | null,
            /** @name        Methods
             *  @public
             *  @type        {string[]=}
             *  @description Names of methods forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Methods?    : string[] | null
            /** @name        Properties
             *  @public
             *  @type        {string[]=}
             *  @description Names of properties forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Brokers?    : string[] | null,
        }
    }

    export namespace Text
    {
        /** @name        toKebab
         *  @public
         *  @description camelCase / PascalCase → kebab-case (each uppercase letter becomes `-` + its
         *               lowercase form).
         *  @param       {string} s Source identifier.
         *  @returns     {string} Kebab-cased string (e.g. `"BackgroundColor"` → `"-background-color"`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toKebab(s: string): string
        {
            return s.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
        }

        /** @name        toCamel
         *  @public
         *  @description kebab-case → camelCase, lowercasing the first character.
         *  @param       {string} s Source identifier.
         *  @returns     {string} Camel-cased string (e.g. `"Background-color"` → `"backgroundColor"`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toCamel(s: string): string {
            const lc = s.charAt(0).toLowerCase() + s.slice(1);
            return lc.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
        }

        /** @name        toPascal
         *  @public
         *  @description Converts a single string identifier (kebab/snake/spaces/camel) to PascalCase.
         *  @param       {string} s Source identifier.
         *  @returns     {string} Pascal-cased string.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toPascal(s: string): string;

        /** @name        toPascal
         *  @public
         *  @description Converts an array of word strings into a single concatenated PascalCase string.
         *  @param       {readonly string[]} words Array of words.
         *  @returns     {string} Pascal-cased string.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toPascal(words: readonly string[]): string;

        /** @name        toPascal
         *  @public
         *  @description Converts multiple string arguments into a single concatenated PascalCase string.
         *  @param       {...string} words Multiple word arguments.
         *  @returns     {string} Pascal-cased string.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toPascal(...words: string[]): string;

        /** @name        toPascal
         *  @public
         *  @description Core implementation handling all 3 overloads with uppercase phonetics split.
         *  @param       {string | readonly string[]} first First identifier or array of words.
         *  @param       {...string} rest Remaining variadic string components.
         *  @returns     {string} Concatenated PascalCase string.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toPascal(first: string | readonly string[], ...rest: string[]): string {
            let tokens: string[] = [];

            if (Array.isArray(first)) {
                tokens = first;
            } else if (rest.length > 0) {
                tokens = [first as string, ...rest];
            } else if (typeof first === 'string' && first) {
                tokens = first
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/[-_\s]+/g, ' ')
                    .trim()
                    .split(/\s+/);
            } else {
                return '';
            }

            return tokens
                .filter(Boolean)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join('');
        }

        /** @name        toSnake
         *  @public
         *  @description camelCase / PascalCase → snake_case (each uppercase letter becomes `_` + its
         *               lowercase form).
         *  @param       {string} s Source identifier.
         *  @returns     {string} Snake-cased string (e.g. `"BackgroundColor"` → `"_background-color"`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toSnake(s: string): string {
            return s.replace(/([A-Z])/g, c => `_${c.toLowerCase()}`);
        }

        /** @name        toScreamingSnake
         *  @public
         *  @description camelCase / PascalCase → SCREAMING_SNAKE_CASE (each uppercase letter becomes `_`
         *               + its uppercase form, and the rest is capitalized).
         *  @param       {string} s Source identifier.
         *  @returns     {string} Screaming-snake-cased string (e.g. `"BackgroundColor"` → `"_BACKGROUND_COLOR"`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toScreamingSnake(s: string): string {
            return s.replace(/([A-Z])/g, c => `_${c}`).toUpperCase();
        }

        /** @name        toTrain
         *  @public
         *  @description camelCase / PascalCase → Train-Case (each uppercase letter becomes `-` + its
         *               uppercase form).
         *  @param       {string} s Source identifier.
         *  @returns     {string} Train-cased string (e.g. `"backgroundColor"` → `"background-Color"`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toTrain(s: string): string {
            return s.replace(/([A-Z])/g, c => `-${c}`);
        }

        /** @name        toFlat
         *  @public
         *  @description camelCase / PascalCase / separated → flatcase (removes all separators
         *               and converts everything to lowercase).
         *  @param       {string} s Source identifier.
         *  @returns     {string} Flat-cased string (e.g. `"Background-Color"` → `"backgroundcolor"`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toFlat(s: string): string {
            return s.replace(/[-_\s]/g, '').toLowerCase();
        }

        /** @name        toUpperFlat
         *  @public
         *  @description camelCase / PascalCase / separated → UPPERFLATCASE (removes all separators
         *               and converts everything to uppercase).
         *  @param       {string} s Source identifier.
         *  @returns     {string} Upper-flat-cased string (e.g. `"Background-Color"` → `"BACKGROUNDCOLOR"`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function toUpperFlat(s: string): string {
            return s.replace(/[-_\s]/g, '').toUpperCase();
        }
    }

    export namespace Debug
    {
        /** @name        warn
         *  @public
         *  @memberof    Core
         *  @description Coded diagnostic sink for otherwise-silent recovery `catch` blocks.
         *               No-op unless `Configuration.debug` is `true`; never throws, never
         *               alters control flow. Callers keep running their fallback afterwards.
         *  @param       {string} code Short stable diagnostic code (e.g. `'SET_ATTR'`).
         *  @param       {...unknown} args Contextual payload (error object, tag, …).
         *  @returns     {void}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        export function warn(code: string, ...args: unknown[]): void
        {
            if (AriannA.Configuration.debug && typeof console !== 'undefined')
                console.warn(`[arianna:${code}]`, ...args);
        }
    }

    /** Classes Block */

    /** @namespace   Boot
     *  @memberof    Core
     *  @description Boot subsystem (replaces the former `Boot` class). Groups the boot state and the
     *               multi-mode bundle loader. State lives in two `Property` instances (`Initialized`,
     *               `Booted`) — hard-private inside the Property, exposed read-only via
     *               `Core.Initialized` / `Core.Booted`, and transitioned only by `AriannA()`. The
     *               single entry `AriannA(mode)` folds the old two-phase boot; `Ready()` awaits the
     *               `Booted` flag. Lifecycle notifications ride the `arianna-ready` DOM event,
     *               fired through the `'events'` service registry (no direct Events import).
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export class AriannA
    {
        /** @name        Configuration
         *  @public
         *  @description Static framework configuration: the semantic version and its JSON projection.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Configuration =
        {
            /** @name        version
             *  @public
             *  @memberof    Core.Configuration
             *  @type        {{ major: number; minor: number; patch: number; string: string }}
             *  @description Semantic version components plus a computed `string` accessor.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            version:
            {
                /** @name        major
                 *  @public
                 *  @memberof    Core.Configuration.version
                 *  @type        {number}
                 *  @description Major version component.
                 *  @default     1
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                major  : 1,
                /** @name        minor
                 *  @public
                 *  @memberof    Core.Configuration.version
                 *  @type        {number}
                 *  @description Minor version component.
                 *  @default     0
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                minor  : 0,
                /** @name        patch
                 *  @public
                 *  @memberof    Core.Configuration.version
                 *  @type        {number}
                 *  @description Patch version component.
                 *  @default     0
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                patch  : 0,
                /** @name        string
                 *  @public
                 *  @readonly
                 *  @memberof    Core.Configuration.version
                 *  @type        {string}
                 *  @description Computed `"major.minor.patch"` version string.
                 *  @returns     {string} The dotted version.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                get string() { return `${this.major}.${this.minor}.${this.patch}`; },
            },
            /** @name        nativePatch
             *  @public
             *  @memberof    Core.Configuration
             *  @type        {boolean}
             *  @description Feature-flag: when `true` (default) the framework wraps native
             *               element constructors (`window.HTMLDivElement`, `SVGElement`, …) in
             *               `Namespace.Initialize()`, so `super()` inside an AriannA subclass
             *               returns a real, correctly-tagged element. Set to `false` to leave
             *               the global native constructors untouched (opt-out for hosts that
             *               forbid monkey-patching, or for SSR / spec-only runs).
             *  @default     true
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            nativePatch: true,
            /** @name        debug
             *  @public
             *  @memberof    Core.Configuration
             *  @type        {boolean}
             *  @description Feature-flag: when `true`, otherwise-silent recovery `catch`
             *               blocks emit a coded diagnostic via `Core.warn(code, …)`. Default
             *               `false` keeps production quiet; flip on in development to surface
             *               swallowed failures. Does not change control flow.
             *  @default     false
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            debug: false,
            /** @name        toJSON
             *  @public
             *  @memberof    Core.Configuration
             *  @description Serializer — projects the configuration to a plain `{ version }` object.
             *  @returns     {{ version: string }} JSON projection.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            get JSON() { return { version: this.version.string }; },
            load(json: object){}
        };

        /** @name        #ready
         *  @private
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @type        {Promise<void> | null}
         *  @description The one boot promise, memoised. `Ready` hands this back rather than building a new
         *               Promise per read — two reads would otherwise mean two promises and two listeners,
         *               and neither would be the one `Boot()` actually produced, so a boot that threw would
         *               leave every waiter hanging instead of rejecting. Null until the first read or the
         *               first construction, whichever comes first.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #ready       : Promise<void> | null = null;

        /** @name        #initialized
         *  @private
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @type        {boolean}
         *  @description True once `Initialize()` has completed. A REPORT, not a guard — what actually keeps
         *               initialization idempotent is `#observer`, because it names the thing that must exist
         *               rather than asserting that it does. Read through `Initialized`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #initialized : boolean              = false;

        /** @name        #booted
         *  @private
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @type        {boolean}
         *  @description True once `Boot()` has started pulling the optional bundles. Set BEFORE the first
         *               `await`, not after: two callers landing in the same tick would both clear a flag
         *               raised afterwards, and both would import. Read through `Booted`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #booted      : boolean              = false;

        /** @name        #observer
         *  @private
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @type        {Observer | null}
         *  @description The observer this class put on the document, and the only guard that decides whether
         *               `Initialize()` has work left. Private on purpose: the previous guard counted entries
         *               in the shared observer registry, which ANY observer created for any reason
         *               satisfies — so the second boot path read the count, concluded the job was done, and
         *               silently skipped the wiring it was carrying. A field nobody else can set cannot be
         *               satisfied by accident.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #observer    : Observers.Observer | null      = null;

        /** @name        #globals
         *  @private
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @type        {Set<string>}
         *  @description Global names a mirrored export must not clobber. Anything in here is published
         *               prefixed — a bundle exporting `Math` lands on `AriannAMath`, not over the runtime's.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static readonly #globals                   = new Set<string>([ 'Math', 'Date', /* … */ ]);

        /** @name        constructor
         *  @public
         *  @memberof    Core.Boot.AriannA
         *  @param       {Types.Packages} [packages={}] Which optional bundles to pull and whether to mirror
         *               their exports. Left out, it reaches `#packages` as `{}` — the same thing a bare
         *               `new AriannA()` asks for, which today resolves to no URLs at all.
         *  @description Bring the framework up: seed the namespaces and start the observer synchronously,
         *               then let the bundles load in the background. Two phases and not one, because the
         *               observer has to be watching while the imports are still in flight — everything
         *               added in that window would otherwise never be promoted.
         *
         *               Repeating it is free. Every step guards on its own static, so a second `new` finds
         *               the observer already placed and the boot already started, and hands back an instance
         *               whose `Ready` is the SAME promise the first one got. That is what `??=` buys: not a
         *               shortcut, but the guarantee that every caller waits on the boot that actually
         *               happened, errors included.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor(packages?: Types.Packages)
        {
            AriannA.Initialize();
            AriannA.#ready ??= AriannA.Boot(packages);
        }

        /** @name        Ready
         *  @public
         *  @readonly
         *  @memberof    Core.Boot.AriannA
         *  @returns     {Promise<void>} The boot promise — the same one every caller gets.
         *  @description Await the boot from an instance. Hands back the memoised promise rather than
         *               building a fresh one per read, which matters for two reasons: two reads would mean
         *               two promises and two listeners, and neither would be the promise `Boot()` actually
         *               returned — so a boot that threw would leave every waiter hanging instead of
         *               rejecting. Reading it without ever having constructed starts the boot, which is the
         *               sensible reading of "are you ready?" asked of something nobody has started.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Ready(): Promise<void>
        {
            return AriannA.#ready ??= AriannA.Boot();
        }

        /** @name        #packages
         *  @private
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @param       {Types.Packages} spec The package specification.
         *  @returns     {{ urls: string[]; mirror: boolean }} Module URLs to import, and whether to mirror.
         *  @description Resolve a package spec to a list of bundle URLs. STUB: returns no URLs at all, so
         *               `Boot` currently imports nothing and `#mirror` never runs.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #packages(spec: Types.Packages): { urls: string[]; mirror: boolean }
        {
            void spec;

            return { urls: [], mirror: true };
        }

        /** @name        #mirror
         *  @private
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @param       {Record<string, unknown>} mod A loaded bundle's exports.
         *  @returns     {void}
         *  @description Publish a bundle's exports onto the global scope, prefixing anything that would
         *               shadow a built-in. STUB: computes the name and defines nothing.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #mirror(mod: Record<string, unknown>): void
        {
            if (typeof window === 'undefined') return;

            for (const k of Object.keys(mod))
            {
                const name = AriannA.#globals.has(k) ? 'AriannA' + k : k;

                void name; /* defineProperty… */
            }
        }

        /** @name        Initialized
         *  @public
         *  @static
         *  @readonly
         *  @memberof    Core.Boot.AriannA
         *  @returns     {boolean} True once `Initialize()` has completed.
         *  @description Whether phase one has run: namespaces seeded, observer placed. A report for
         *               diagnostics, not something to branch on — `Initialize()` guards itself on
         *               `#observer`, and code that gates on this flag instead is how two boot paths end up
         *               each trusting the other.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static get Initialized() { return this.#initialized; }

        /** @name        Booted
         *  @public
         *  @static
         *  @readonly
         *  @memberof    Core.Boot.AriannA
         *  @returns     {boolean} True once `Boot()` has started pulling the optional bundles.
         *  @description Whether phase two has begun. Note STARTED, not finished: the flag is raised before
         *               the first `await`, so that two callers in the same tick cannot both get past it. To
         *               wait for completion, await `Ready` — this is a probe, not a barrier.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static get Booted()      { return this.#booted; }

        /** @name        Ready
         *  @public
         *  @static
         *  @readonly
         *  @memberof    Core.Boot.AriannA
         *  @returns     {Promise<void>} The boot promise — the same one the instance accessor returns.
         *  @description Await the boot without holding an instance. Same promise, same memo: `AriannA.Ready`
         *               and `new AriannA().Ready` are interchangeable by construction, so a caller that only
         *               ever imported the class is never waiting on a different boot than the one that ran.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static get Ready(): Promise<void>
        {
            return AriannA.#ready ??= AriannA.Boot();
        }

        /** @name        Boot
         *  @public
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @param       {Types.Packages} [spec] Which optional bundles to pull and whether to mirror their
         *               exports onto the global scope.
         *  @returns     {Promise<void>} Settles once the bundles are in and 'arianna-ready' has fired.
         *  @description Phase two: pull the optional bundles and announce readiness. Runs at most once.
         *               `Initialize()` is called FIRST and synchronously, before the first `await` — the
         *               observer has to be live while the imports are still in flight, not after them, or
         *               every node added in between is missed. The flag is set BEFORE the await too: two
         *               callers arriving in the same tick would otherwise both pass the guard and import.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static async Boot(spec?: Types.Packages): Promise<void>
        {
            AriannA.Initialize();

            if (AriannA.#booted || typeof document === 'undefined') return;

            AriannA.#booted = true;

            const { urls, mirror } = AriannA.#packages(spec ?? {});
            const mods             = await Promise.all
            (
                urls.map(u => import(/* @vite-ignore */ u).catch(() => null))
            );

            if (mirror)
            {
                for (const m of mods)
                {
                    if (m) AriannA.#mirror(m as Record<string, unknown>);
                }
            }

            Core.Services.Events?.Fire
            (
                document,
                {
                    Type   : 'arianna-ready',
                    Detail : { version: AriannA.Configuration.version.string },
                }
            );
        }

        /** @name        Initialize
         *  @public
         *  @static
         *  @memberof    Core.Boot.AriannA
         *  @returns     {void}
         *  @description Phase one, synchronous: seed the standard namespaces and put the single global
         *               observer on the document, so define and upgrade run eagerly from the first tick.
         *               Idempotent through `#observer`, a field this class OWNS — a count over the shared
         *               observer registry is satisfied by anyone's observer, which is how two boot paths
         *               end up each believing the other did the work.
         *
         *               Observed root is `document.body`, never `documentElement`: `<head>` is where every
         *               Promote injects its scoped `<style>` and where every `new Css.Stylesheet` appends a
         *               `<link>` and a `<style>` from its own constructor, so watching it feeds the
         *               framework's own CSS writes straight back into this callback.
         *
         *               The upgrade rides the observer callback and NOT the 'NodeAdded' event, so it needs
         *               neither bubbling nor a listener. It runs BEFORE the original callback, so whoever
         *               does listen receives a node already promoted. Order is load-bearing: the `Callback`
         *               setter only re-binds the live MutationObserver when the observer is already
         *               connected, so Connect comes first and the callback second — the other way round the
         *               swap is silently ignored. The sweep comes last, into a pipeline already whole.
         *
         *               The guard is `instanceof HTMLUnknownElement` and nothing else, because it is the
         *               only native interface that STOPS matching once the type prototype is spliced on: it
         *               switches itself off. `HTMLElement` and `SVGElement` stay true after promotion and
         *               would re-patch the same node forever.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Initialize(): void
        {
            if (typeof document === 'undefined') return;

            if (!Namespaces.Namespace.Namespaces['html']) AriannA.Install();

            if (typeof globalThis !== 'undefined')
            {
                (globalThis as { Core?: unknown }).Core ??= Core;
            }

            if (AriannA.#observer) return;

            const service = Core.Services.Observer;

            if (!service) return;

            const stage    = document.body ?? document.documentElement;
            const observer = Services.Observer?.Create() as Observers.Observer;
            const base     = observer.Callback!;

            observer?.connect(stage);

            observer.Callback = function (mutations: MutationRecord[], observer: MutationObserver): void
            {
                for (const m of mutations)
                {
                    if (m.type !== 'childList') continue;

                    for (const node of m.addedNodes)
                    {
                        if (!(node instanceof Element)) continue;

                        const d = Namespaces.Namespace.Resolve(node);

                        if (!d || !d.Custom || !d.Defined) continue;
                        if (Object.getPrototypeOf(node) === d.Prototype) continue;

                        const n = Namespaces.Namespace.Namespaces[d.Namespace];

                        if (n) n.Upgrade(node, d);
                    }
                }

                base.call(this, mutations, observer);
            };

            observer.sweep(stage);

            AriannA.#observer    = observer as Observers.Observer;
            AriannA.#initialized = true;
        }

        /** @name        Install
         *  @public
         *  @memberof    Core
         *  @description Install the built-in namespaces (html / svg / mathML / x3d). Each `new Namespace`
         *               auto-registers into `Core.Namespaces` via its constructor (§6); `Install()` makes that
         *               registration an explicit, ordered boot step —
         *               `Core.Initialize() → Namespace.Install() → Core.Bootstrap()` — instead of an
         *               import-time side-effect. Merged onto the class as `Namespace.Install()`.
         *  @returns     {{ html: Namespace; svg: Namespace; mathML: Namespace; x3d: Namespace }} The four
         *               built-in namespace instances.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static Install():
        {
            html:   Namespaces.Namespace;
            svg:    Namespaces.Namespace;
            mathML: Namespaces.Namespace;
            x3d:    Namespaces.Namespace
        }
        {
            const html   = new Namespaces.Namespace
            (
                'html',
                {
                    Uri: 'http://www.w3.org/1999/xhtml',
                    NS: false,
                    Base: HTMLElement,
                    Schema: 'http://www.w3.org/1999/xhtml',
                    Documentation: { w3c: 'https://html.spec.whatwg.org/' },
                    Types :
                        {
                            Standard :
                                {
                                    Interfaces :
                                        {
                                            HTMLElement: {
                                                Tags: [
                                                    'address', 'article', 'footer', 'header', 'section', 'nav', 'dd', 'dt',
                                                    'figcaption', 'figure', 'main', 'abbr', 'b', 'bdi', 'bdo', 'cite', 'code',
                                                    'dfn', 'em', 'i', 'mark', 'rt', 'rtc', 'ruby', 's', 'samp', 'small', 'strong',
                                                    'sub', 'sup', 'u', 'var', 'wbr', 'area', 'noscript', 'noembed', 'plaintext',
                                                    'strike', 'tt', 'summary', 'acronym', 'basefont', 'big', 'center',
                                                ]
                                            },
                                            HTMLUnknownElement: {Tags: ['isindex', 'spacer', 'menuitem', 'decorator', 'applet', 'blink', 'keygen']},
                                            HTMLHtmlElement: {Tags: ['html']},
                                            HTMLBaseElement: {Tags: ['base']},
                                            HTMLHeadElement: {Tags: ['head']},
                                            HTMLLinkElement: {Tags: ['link']},
                                            HTMLMetaElement: {Tags: ['meta']},
                                            HTMLStyleElement: {Tags: ['style']},
                                            HTMLTitleElement: {Tags: ['title']},
                                            HTMLPreElement: {Tags: ['pre', 'listing', 'xmp']},
                                            HTMLHeadingElement: {Tags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']},
                                            HTMLDivElement: {Tags: ['div']},
                                            HTMLDListElement: {Tags: ['dl']},
                                            HTMLHRElement: {Tags: ['hr']},
                                            HTMLLIElement: {Tags: ['li']},
                                            HTMLOListElement: {Tags: ['ol']},
                                            HTMLParagraphElement: {Tags: ['p']},
                                            HTMLUListElement: {Tags: ['ul']},
                                            HTMLAnchorElement: {Tags: ['a']},
                                            HTMLBRElement: {Tags: ['br']},
                                            HTMLQuoteElement: {Tags: ['quote']},
                                            HTMLSpanElement: {Tags: ['span']},
                                            HTMLAudioElement: {Tags: ['audio']},
                                            HTMLImageElement: {Tags: ['img']},
                                            HTMLMapElement: {Tags: ['map']},
                                            HTMLTrackElement: {Tags: ['track']},
                                            HTMLVideoElement: {Tags: ['video']},
                                            HTMLEmbedElement: {Tags: ['embed']},
                                            HTMLIFrameElement: {Tags: ['iframe']},
                                            HTMLObjectElement: {Tags: ['object']},
                                            HTMLParamElement: {Tags: ['param']},
                                            HTMLSourceElement: {Tags: ['source']},
                                            HTMLCanvasElement: {Tags: ['canvas']},
                                            HTMLScriptElement: {Tags: ['script']},
                                            HTMLModElement: {Tags: ['ins', 'del']},
                                            HTMLTableCaptionElement: {Tags: ['caption']},
                                            HTMLTableColElement: {Tags: ['col', 'colgroup']},
                                            HTMLTableElement: {Tags: ['table']},
                                            HTMLTableSectionElement: {Tags: ['tbody', 'thead', 'tfoot']},
                                            HTMLTableCellElement: {Tags: ['td', 'th']},
                                            HTMLTableRowElement: {Tags: ['tr']},
                                            HTMLButtonElement: {Tags: ['button']},
                                            HTMLDataListElement: {Tags: ['datalist']},
                                            HTMLFieldSetElement: {Tags: ['fieldset']},
                                            HTMLFormElement: {Tags: ['form']},
                                            HTMLInputElement: {Tags: ['input']},
                                            HTMLLabelElement: {Tags: ['label']},
                                            HTMLLegendElement: {Tags: ['legend']},
                                            HTMLOptGroupElement: {Tags: ['optgroup']},
                                            HTMLOptionElement: {Tags: ['option']},
                                            HTMLProgressElement: {Tags: ['progress']},
                                            HTMLSelectElement: {Tags: ['select']},
                                            HTMLTextAreaElement: {Tags: ['textarea']},
                                            HTMLMenuElement: {Tags: ['menu']},
                                            HTMLDirectoryElement: {Tags: ['dir']},
                                            HTMLFrameElement: {Tags: ['frame']},
                                            HTMLFrameSetElement: {Tags: ['frameset']}
                                        },
                                    Tags : {}

                                },
                            Custom   : { Constructors : {}, Tags : {} },
                        }
                }
            );

            const svg    = new Namespaces.Namespace
            (
                'svg',
                {
                    Uri: 'http://www.w3.org/2000/svg',
                    NS: true,
                    Base: SVGElement,
                    Schema: 'http://www.w3.org/2000/svg',
                    Documentation: {w3c: 'https://www.w3.org/TR/SVG2/'},
                    Types :
                        {
                            Standard:
                                {
                                    Interfaces :
                                        {
                                            SVGAElement: {Tags: ['a']},
                                            SVGAltGlyphDefElement: {Tags: ['altglyph']},
                                            SVGAltGlyphElement: {Tags: ['altglyph']},
                                            SVGAltGlyphItemElement: {Tags: ['altglyph']},
                                            SVGAnimateColorElement: {Tags: ['animatecolor']},
                                            SVGAnimateElement: {Tags: ['animate']},
                                            SVGAnimateMotionElement: {Tags: ['animatemotion']},
                                            SVGAnimateTransformElement: {Tags: ['animatetransform']},
                                            SVGAnimationElement: {Tags: ['animate', 'animatemotion', 'animatetransform']},
                                            SVGCircleElement: {Tags: ['circle']},
                                            SVGClipPathElement: {Tags: ['clippath']},
                                            SVGCursorElement: {Tags: ['cursor']},
                                            SVGDefsElement: {Tags: ['defs']},
                                            SVGDescElement: {Tags: ['desc']},
                                            SVGEllipseElement: {Tags: ['ellipse']},
                                            SVGFEBlendElement: {Tags: ['feblend']},
                                            SVGFEColorMatrixElement: {Tags: ['fecolormatrix']},
                                            SVGFEComponentTransferElement: {Tags: ['fecomponenttransfer']},
                                            SVGFECompositeElement: {Tags: ['fecomposite']},
                                            SVGFEConvolveMatrixElement: {Tags: ['feconvolvematrix']},
                                            SVGFEDiffuseLightingElement: {Tags: ['fediffuselighting']},
                                            SVGFEDisplacementMapElement: {Tags: ['fedispatchmap']},
                                            SVGForeignObjectElement: {Tags: ['foreignobject']},
                                            SVGGElement: {Tags: ['g']},
                                            SVGGlyphElement: {Tags: ['glyph']},
                                            SVGGlyphRefElement: {Tags: ['glyphref']},
                                            SVGGradientElement: {Tags: ['lineargradient', 'radialgradient']},
                                            SVGHKernElement: {Tags: ['hkern']},
                                            SVGImageElement: {Tags: ['image']},
                                            SVGLinearGradientElement: {Tags: ['lineargradient']},
                                            SVGLineElement: {Tags: ['line']},
                                            SVGMarkerElement: {Tags: ['marker']},
                                            SVGMaskElement: {Tags: ['mask']},
                                            SVGMetadataElement: {Tags: ['metadata']},
                                            SVGMissingGlyphElement: {Tags: ['missing-glyph']},
                                            SVGMPathElement: {Tags: ['mpath']},
                                            SVGPathElement: {Tags: ['path']},
                                            SVGPolygonElement: {Tags: ['polygon']},
                                            SVGPolylineElement: {Tags: ['polyline']},
                                            SVGRadialGradientElement: {Tags: ['radialgradient']},
                                            SVGRectElement: {Tags: ['rect']},
                                            SVGScriptElement: {Tags: ['script']},
                                            SVGSetElement: {Tags: ['set']},
                                            SVGStopElement: {Tags: ['stop']},
                                            SVGStyleElement: {Tags: ['style']},
                                            SVGSVGElement: {Tags: ['svg']},
                                            SVGSwitchElement: {Tags: ['switch']},
                                            SVGSymbolElement: {Tags: ['symbol']},
                                            SVGTextContentElement: {Tags: ['text', 'tspan', 'tref', 'altglyph', 'textpath']},
                                            SVGTextElement: {Tags: ['text']},
                                            SVGTextPathElement: {Tags: ['textpath']},
                                            SVGTextPositioningElement: {Tags: ['altglyph', 'text', 'tspan']},
                                            SVGTitleElement: {Tags: ['title']},
                                            SVGTRefElement: {Tags: ['tref']},
                                            SVGTSpanElement: {Tags: ['tspan']},
                                            SVGUseElement: {Tags: ['use']},
                                            SVGViewElement: {Tags: ['view']},
                                            SVGVKernElement: {Tags: ['vkern']}
                                        },
                                    Tags : {}
                                    ,
                                },
                            Custom: { Constructors : {}, Tags : {} }
                        }
                }
            );


            const mathML = new Namespaces.Namespace
            (
                'mathML',
                {
                    Uri: 'http://www.w3.org/1998/Math/MathML',
                    NS: true,
                    Base: (typeof MathMLElement !== 'undefined' ? MathMLElement : HTMLElement),
                    Schema: 'http://www.w3.org/1998/Math/MathML',
                    Documentation: {w3c: 'https://www.w3.org/TR/MathML3/'},
                    Types :
                        {
                            Standard:
                                {
                                    Interfaces :
                                        {
                                            MathMLElement:
                                                {
                                                    Tags:
                                                        [
                                                            'math', 'mi', 'mo', 'mn', 'ms', 'mspace', 'mtext',
                                                            'mfrac', 'msqrt', 'mroot', 'mstyle', 'merror', 'mpadded', 'mphantom',
                                                            'mrow', 'mfenced', 'menclose',
                                                            'msub', 'msup', 'msubsup', 'munder', 'mover', 'munderover', 'mmultiscripts',
                                                            'mtable', 'mtr', 'mtd', 'mlabeledtr',
                                                            'maction',
                                                        ]
                                                },
                                        },
                                    Tags : {}
                                },
                            Custom: { Constructors : {}, Tags : {} }
                        }
                });

            const x3d    = new Namespaces.Namespace
            (
                'x3d',
                {
                    Uri: 'http://www.web3d.org/specifications/x3d-namespace',
                    NS: true,
                    Base: HTMLElement,
                    Schema: 'http://www.web3d.org/specifications/x3d-namespace',
                    Documentation: {w3c: 'https://www.web3d.org/specifications/x3d-4.0/'},
                    Types :
                        {
                            Standard:
                                {
                                    Interfaces : {},
                                    Tags : {}
                                },
                            Custom: { Constructors : {}, Tags : {} }
                        }
                }
            );

            return { html, svg, mathML, x3d };
        }
    }

    /** Functions Block */

    export const Initialize = AriannA.Initialize;

    /** @name        UUID
     *  @public
     *  @memberof    Core
     *  @returns     {string} A fresh identifier.
     *  @description Generate an RFC-shaped identifier. A FUNCTION and not a property, unlike the accessor
     *               it replaces: every call returns a different value, and `Core.UUID()` says that out
     *               loud while `Core.UUID` read like a stable field and invited being used as one.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export function UUID(): string
    {
        const b : string[] = [];

        for (let i = 0; i < 9; i++)
        {
            b.push((Math.floor(1 + Math.random() * 0x10000)).toString(16).slice(1));
        }

        return `${b[1]}${b[2]}-${b[3]}-${b[4]}-${b[5]}-${b[6]}${b[7]}${b[8]}`;
    }

    /** @name        Root
     *  @public
     *  @memberof    Core
     *  @returns     {Element | null} The document's root element, or `null` off-DOM.
     *  @description The DOCUMENT root — `<html>` — not the observed one: the observer watches
     *               `document.body`, because `<head>` is where the framework injects its own stylesheets
     *               and watching it would feed those writes back into its own callback.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export function Root(): Element | null
    {
        return typeof document !== 'undefined' ? document.documentElement : null;
    }

    /** @name        Is
     *  @public
     *  @description Checks whether `value` satisfies the supplied native type tags or constructors.
     *               Variadic matches use AND semantics, while a single array of matches uses OR
     *               semantics. An empty match list returns `false`. Primitive type tags are tested
     *               using `typeof`. The `'class'` tag recognizes JavaScript class constructors whose
     *               source begins with the `class` keyword. The `'idl'` tag recognizes native DOM
     *               element constructors belonging to the `Element` inheritance chain. Constructor
     *               matches are resolved through the constructor names returned by
     *               `GetPrototypeChain`.
     *  @param       value Value, object or constructor to inspect.
     *  @param       {...Types.Native} matches Native type tags, constructors, or a single array of
     *               alternatives to test against `value`.
     *  @returns     {boolean} `true` when every variadic match succeeds, or when at least one match
     *               succeeds in the single-array OR form; otherwise `false`.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     *  @example     Core.Is(class A {}, 'class')                    // true
     *  @example     Core.Is(1, 'number', Number)                    // true
     *  @example     Core.Is([], [Array, Object])                    // true
     *  @example     Core.Is(globalThis.HTMLElement, 'idl')          // true
     */
    export function Is(value: unknown, ...matches: string[] | Array<Types.Native> | readonly Types.Base[]): boolean
    {
        if (matches.length === 0) { return false }

        const form   = matches.length === 1 && Array.isArray(matches[0]);
        const types = (form ? matches[0] : matches) as readonly  Types.Native[];
        const chain   = GetPrototypeChain(value as any);

        for (const t of types)
        {
            let match = false;
            if (typeof t === 'string')
            {
                const upper = t.toUpperCase();
                if(typeof value === 'function')
                {
                    const d = Function.prototype.toString.call(value);

                    if (upper === 'CLASS')
                    {
                        try { match = /^\s*class[\s{]/.test(d); }
                        catch (e){ }
                    }
                    else if (upper === 'IDL')
                    {
                        try
                        {
                            const n  = /\[native code\]/.test(d);
                            const e = globalThis.Element;
                            match = n && (value === e || chain.includes(e.name));
                        }
                        catch (e){ }
                    }
                    else if (upper === 'IDL-PATCHED')
                    {
                        try
                        {
                            const e      = globalThis.Element;
                            const native = /\[native code\]/.test(d) && (value === e || chain.includes(e.name));
                            const g      = globalThis as Record<string, unknown>;
                            const nm     = (value as { name?: string }).name ?? '';
                            let   rec: { Standard?: boolean; Patched?: boolean } | undefined;

                            if (nm && typeof g[nm] === 'function')
                            {
                                for (const ns of Object.values(Namespaces.Namespace.Namespaces))
                                {
                                    const r = ns?.Types?.Standard?.Interfaces?.get(nm);
                                    if (r && r.Standard) { rec = r; break; }
                                }
                            }
                            match = upper === 'IDL-PATCHED'
                                ? !!(rec && rec.Patched)
                                : native || !!rec;
                        }
                        catch (e){ }
                    }
                }
                else { match = (typeof value === t); }
            }
            else if (typeof t === 'function')
            {
                if(value !== t)
                {
                    try { match = !!t.name && chain.includes(t.name); }
                    catch { /* false */ }
                }
                else { match = true; }
            }

            if (form && match) return true;
            if (!form && !match) return false;
        }

        return !form;
    }

    /** @name        Equals
     *  @public
     *  @description Deep equality across primitives, plain objects, arrays, RegExp, Date, and class
     *               instances. Pass 2+ arguments, or a single array of elements. Objects compare by
     *               own enumerable keys; functions by source string.
     *  @param       {...unknown} args Elements to compare (or one array of elements).
     *  @returns     {boolean} `true` when all elements are deeply equal.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     *  @example     Core.Equals({a:1}, {a:1})  // true
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

    /** @name        Empty
     *  @public
     *  @description True when an object has no own enumerable properties. Non-objects
     *               (null / undefined / primitives) → `true`.
     *  @param       {unknown} value Subject under test.
     *  @returns     {boolean} `true` when empty (or not an object).
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export function Empty(value: unknown): boolean
    {
        if (value === null || value === undefined || typeof value !== 'object') return true;
        for (const _ in value as object) return false;
        return true;
    }

    /** @name        Has
     *  @public
     *  @description Check whether `target` has all the specified members. For an HTMLElement the
     *               members are checked against attributes (`getAttribute`); otherwise against `in`
     *               (own or inherited). An empty member list → `true`; a non-object target → `false`.
     *  @param       {object | null | undefined} target Subject.
     *  @param       {...string} members Member / attribute names required.
     *  @returns     {boolean} `true` when all members are present.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
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

    /** @name        Clone
     *  @public
     *  @template    T
     *  @description Deep-clone a value: primitives (string / number / boolean / symbol / bigint)
     *               return as-is; functions are re-created from source with own keys copied; a Node
     *               is `cloneNode(true)`; Date / RegExp / Array / plain Object are cloned recursively.
     *  @param       {T} value Value to clone.
     *  @returns     {T} The clone.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
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

    /** @name        Assign
     *  @public
     *  @template    T
     *  @description Mix own enumerable properties from `sources` into `target`. Special-cases ES
     *               classes: copies prototype methods onto `target.prototype` (skipping `constructor`),
     *               and, when the class is constructable with no args, its instance fields onto the
     *               prototype's parent. `null` / `undefined` sources are skipped.
     *  @param       {T} target Destination object.
     *  @param       {...unknown} sources Sources (plain objects or ES classes).
     *  @returns     {T} The mutated `target`.
     *  @throws      {TypeError} When `target` is `null` / `undefined`.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
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

    /** @name        Replace
     *  @public
     *  @description Replace an Element in the DOM (single-root). A string replacement is parsed via a
     *               `<template>` (first element/child taken); a Node replacement is detached from its
     *               current parent first. No-op returning `undefined` when input is invalid.
     *  @param       {Node | null | undefined} target Node to replace (must have a parent).
     *  @param       {string | Node | null | undefined} replacement New content.
     *  @returns     {Node | undefined} The inserted node, or `undefined` when input was invalid.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
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

    /** @name        Extends
     *  @public
     *  @description Mixin-style runtime class extension. Variadic: `Extends(A, B, C)` makes `A` extend
     *               `B` and `B` extend `C` (left-to-right), via `setPrototypeOf` on both the prototype
     *               and the constructor. SSR-safe; native built-ins that resist re-parenting are
     *               skipped. Fewer than 2 args returns the first (or `undefined`).
     *  @param       {...unknown} classes Constructors, from subclass to superclass.
     *  @returns     {unknown} The first (most-derived) class.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     *  @example     Core.Extends(A, B);  // A inherits B's prototype
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

    /** @name        GetPrototypeChain
     *  @public
     *  @description Return the complete prototype chain of an object or constructor as an ordered
     *               array (most-derived first). The `mode` selects the element type:
     *                 • `'s'`/`'STRINGS'` (default) — constructor names; an anonymous constructor
     *                   (`name === ""`) is reported as the placeholder `"[Anonymous]"`.
     *                 • `'f'`/`'FUNCTIONS'` — the constructor functions themselves; anonymous ones are
     *                   kept (identity, not name, is what matters).
     *                 • `'y'`/`'SYMBOLS'` — `Symbol.for(name)` global symbols; anonymous constructors
     *                   are SKIPPED (every one would collapse onto `Symbol.for("")`).
     *               Because 'y' skips anonymous links while 's'/'f' keep them, the symbols array can be
     *               SHORTER than the other two for the same input — the three modes are index-aligned
     *               only when no anonymous constructor appears in the chain. A `null` / `undefined`
     *               target yields `[]` (of the requested element type) instead of throwing.
     *  @param       {object | (new () => object) | null | undefined} value  Subject (instance or constructor).
     *  @param       {'s' | 'STRINGS' | 'f' | 'FUNCTIONS' | 'y' | 'SYMBOLS'} [mode='s']  Output element type.
     *  @returns     {string[] | Function[] | symbol[]}  Chain in the requested representation, most-derived first.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     *  @example
     *   Core.GetPrototypeChain(document.createElement('input'))
     *   // → ["HTMLInputElement","HTMLElement","Element","Node","EventTarget","Object"]
     *  @example
     *   Core.GetPrototypeChain(HTMLInputElement, 'f')
     *   // → [HTMLInputElement, HTMLElement, Element, Node, EventTarget, Object]
     *  @example
     *   Core.GetPrototypeChain(el, 'y')
     *   // → [Symbol.for("HTMLInputElement"), Symbol.for("HTMLElement"), …]
     */
    export function GetPrototypeChain(value: object | (new () => object) | null | undefined, mode?: 's' | 'STRINGS'): string[];
    export function GetPrototypeChain(value: object | (new () => object) | null | undefined, mode: 'f' | 'FUNCTIONS'): Function[];
    export function GetPrototypeChain(value: object | (new () => object) | null | undefined, mode: 'y' | 'SYMBOLS'): symbol[];
    export function GetPrototypeChain
    (
        value: object | (new () => object) | null | undefined,
        mode: 's' | 'STRINGS' | 'f' | 'FUNCTIONS' | 'y' | 'SYMBOLS' = 's',
    ): string[] | Function[] | symbol[]
    {
        const m = (mode as string).toLowerCase();
        const f = (m === 'f' || m === 'functions');
        const s = (m === 'y' || m === 'symbols');

        const strings   : string[]   = [];
        const functions : Function[] = [];
        const symbols   : symbol[]    = [];

        /*  A null/undefined target (e.g. a querySelector that found nothing) has no chain. Return empty
            instead of letting Object.getPrototypeOf(null) throw "can't convert null to object". The empty
            result still honors `mode`, so the return type matches the overload the caller resolved to.*/
        if (value === null || value === undefined) { return f ? functions : s ? symbols : strings; }

        const prototype     = (value as { prototype: object }).prototype;
        let   proto: object | null = typeof value === 'function' ? prototype : Object.getPrototypeOf(value);

        while (proto !== null)
        {
            const c = (proto as { constructor?: { name?: string } }).constructor;
            if (c)
            {
                /*  One walk, three projections. Anonymous constructors (name === "") differ by mode:
                    • 'f' keeps them — a distinct function reference, comparable by identity.
                    • 's' keeps them, labelled "[Anonymous]" — readable, and keeps strings length-aligned
                       with 'f'; the brackets distinguish it from a class actually named "Anonymous".
                    • 'y' skips them — Symbol.for("") is information-free and would merge all anonymous types.*/
                if (f)      { functions.push(c as Function); }
                else if (s) { if (c.name) { symbols.push(Symbol.for(c.name)); } }
                else        { strings.push(c.name || '[Anonymous]'); }
            }
            proto = Object.getPrototypeOf(proto);
        }

        /* Return the one array the chosen mode populated (the other two stay empty).*/
       return f ? functions : s ? symbols : strings;
   }
}

export default Core;