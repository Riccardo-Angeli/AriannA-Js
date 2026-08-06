/** @namespace   Services
 *  @memberof    Core
 *  @description The service registry — the single "quasi zero-import" seam of the kernel. Holds a
 *               private `services` Map, the operations over it (Register / Resolve / Has / Revoke /
 *               Providers / Call), the `Service` class producers instantiate to self-register, the
 *               structural service SHAPE types (`CssService` / `EventService` / `ObservableService`),
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
                 *  @memberof    Core.Services.ObserverService
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
                 *  @memberof    Core.Services.ObserverService
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
         *               from an element or tag. Mirrors `Core.Services.RealService` (typed structurally
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

    /** @name        ObserverService
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ObserverService.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ObserverService   = Types.ObserverService;
    /** @name        EventService
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for EventService.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type EventService      = Types.EventService;
    /** @name        ReactivityService
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ReactivityService.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ReactivityService = Types.ReactivityService;
    /** @name        CssService
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for CssService.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type CssService        = Types.CssService;
    /** @name        RealService
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for RealService.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type RealService       = Types.RealService;
    /** @name        ShadowService
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ShadowService.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ShadowService     = Types.ShadowService;
    /** @name        StateService
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for StateService.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type StateService      = Types.StateService;
    /** @name        VirtualService
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for VirtualService.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type VirtualService    = Types.VirtualService;
    /** @name        TemplatesService
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for TemplatesService.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type TemplatesService  = Types.TemplatesService;
    /** @name        ContextService
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ContextService.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ContextService    = Types.ContextService;
    /** @name        DirectivesService
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for DirectivesService.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type DirectivesService = Types.DirectivesService;

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
                    get(): Services.ObserverService | undefined
                    { return Services.Resolve<Services.ObserverService>('observer'); },
                    enumerable: false, configurable: true,
                },
            /** @name        Events
             *  @public
             *  @readonly
             *  @memberof    Core.Services
             *  @type        {Services.EventService | undefined}
             *  @description Lazy accessor for the 'events' service container (registered by Events.ts).
             *               Resolved per access; `undefined` until the producer registers.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Events:
                {
                    get(): Services.EventService | undefined
                    { return Services.Resolve<Services.EventService>('events'); },
                    enumerable: false, configurable: true,
                },
            /** @name        Observables
             *  @public
             *  @readonly
             *  @memberof    Core.Services
             *  @type        {Services.ObservableService | undefined}
             *  @description Lazy accessor for the 'observable' service container (registered by
             *               Observables.ts). Resolved per access; `undefined` until registered.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Reactive:
                {
                    get(): Services.ReactivityService | undefined
                    { return Services.Resolve<Services.ReactivityService>('reactive'); },
                    enumerable: false, configurable: true,
                },
            /** @name        Css
             *  @public
             *  @readonly
             *  @memberof    Core.Services
             *  @type        {Services.CssService | undefined}
             *  @description Lazy accessor for the 'css' service container (registered by Css.ts).
             *               Resolved per access; `undefined` until registered.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Css:
                {
                    get(): Services.CssService | undefined
                    { return Services.Resolve<Services.CssService>('css'); },
                    enumerable: false, configurable: true,
                },
            /** @name Real
             *  @public
             *  @readonly
             *  @memberof Core.Services
             *  @type {Services.RealService | undefined}
             *  @description Lazy accessor for the 'real' service; resolved per access, undefined until registered.
             *  @author Riccardo Angeli
             *  @copyright Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license MIT / Commercial (dual license) */
            Real:
                {
                    get(): Services.RealService | undefined
                    { return Services.Resolve<Services.RealService>('real'); },
                    enumerable: false, configurable: true,
                },
            /** @name        Shadow
             *  @public
             *  @readonly
             *  @memberof    Core.Services
             *  @type        {Services.ShadowService | undefined}
             *  @description Lazy accessor for the 'shadow' service — resolved from the registry on every
             *               access (never cached), so a provider registered after this file loads is still
             *               seen; `undefined` until the Shadow module registers it.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Shadow:
                {
                    get(): Services.ShadowService | undefined
                    { return Services.Resolve<Services.ShadowService>('shadow'); },
                    enumerable: false, configurable: true,
                },
            /** @name        State
             *  @public
             *  @readonly
             *  @memberof    Core.Services
             *  @type        {Services.StateService | undefined}
             *  @description Lazy accessor for the 'state' service — resolved from the registry on every
             *               access (never cached), so a provider registered after this file loads is still
             *               seen; `undefined` until the State module registers it.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            State:
                {
                    get(): Services.StateService | undefined
                    { return Services.Resolve<Services.StateService>('state'); },
                    enumerable: false, configurable: true,
                },
            /** @name        Virtual
             *  @public
             *  @readonly
             *  @memberof    Core.Services
             *  @type        {Services.VirtualService | undefined}
             *  @description Lazy accessor for the 'virtual' service — resolved from the registry on every
             *               access (never cached), so a provider registered after this file loads is still
             *               seen; `undefined` until the Virtual module registers it.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Virtual:
                {
                    get(): Services.VirtualService | undefined
                    { return Services.Resolve<Services.VirtualService>('virtual'); },
                    enumerable: false, configurable: true,
                },
            /** @name        Templates
             *  @public
             *  @readonly
             *  @memberof    Core.Services
             *  @type        {Services.TemplatesService | undefined}
             *  @description Lazy accessor for the 'templates' service — resolved from the registry on every
             *               access (never cached), so a provider registered after this file loads is still
             *               seen; `undefined` until the Templates module registers it.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Templates:
                {
                    get(): Services.TemplatesService | undefined
                    { return Services.Resolve<Services.TemplatesService>('templates'); },
                    enumerable: false, configurable: true,
                },
            /** @name        Context
             *  @public
             *  @readonly
             *  @memberof    Core.Services
             *  @type        {Services.ContextService | undefined}
             *  @description Lazy accessor for the 'context' service — resolved from the registry on every
             *               access (never cached), so a provider registered after this file loads is still
             *               seen; `undefined` until the Context module registers it.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Context:
                {
                    get(): Services.ContextService | undefined
                    { return Services.Resolve<Services.ContextService>('context'); },
                    enumerable: false, configurable: true,
                },
            /** @name        Directives
             *  @public
             *  @readonly
             *  @memberof    Core.Services
             *  @type        {Services.DirectivesService | undefined}
             *  @description Lazy accessor for the 'directives' service — resolved from the registry on every
             *               access (never cached), so a provider registered after this file loads is still
             *               seen; `undefined` until the Directives module registers it.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Directives:
                {
                    get(): Services.DirectivesService | undefined
                    { return Services.Resolve<Services.DirectivesService>('directives'); },
                    enumerable: false, configurable: true,
                }
        }
    );

    export declare const Observer:    Services.ObserverService   | undefined;
    /** @name        Events
     *  @public
     *  @readonly
     *  @memberof    Core.Services
     *  @type        {Services.EventService | undefined}
     *  @description Ambient type declaration for the runtime getter installed above — lets TypeScript
     *               see `Core.Services.Events` (the `defineProperties` getter supplies the value).
     *               `declare` emits no code, so there is no conflict with the runtime definition.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Events:      Services.EventService      | undefined;
    /** @name        Observables
     *  @public
     *  @readonly
     *  @memberof    Core.Services
     *  @type        {Services.ObservableService | undefined}
     *  @description Ambient type declaration for the runtime getter installed above — lets TypeScript
     *               see `Core.Services.Observables`. `declare` emits no code.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Reactivity:  Services.ReactivityService | undefined;
    /** @name        Css
     *  @public
     *  @readonly
     *  @memberof    Core.Services
     *  @type        {Services.CssService | undefined}
     *  @description Ambient type declaration for the runtime getter installed above — lets TypeScript
     *               see `Core.Services.Css`. `declare` emits no code.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Css:         Services.CssService        | undefined;
    /** @name        Real
     *  @public
     *  @readonly
     *  @memberof    Core.Services
     *  @type        {Services.RealService | undefined}
     *  @description Ambient type declaration for the runtime `Real` getter installed via
     *               `Object.defineProperties` above — it lets TypeScript see `Core.Services.Real`
     *               while the getter supplies the value at run time (`declare` emits no code, so there
     *               is no conflict with the runtime definition). Resolves the `'real'` service lazily
     *               on every access; `undefined` until the Real module registers it.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Real:        Services.RealService       | undefined;
    /** @name        Shadow
     *  @public
     *  @readonly
     *  @memberof    Core.Services
     *  @type        {Services.ShadowService | undefined}
     *  @description Ambient declaration for the runtime Shadow getter installed via
     *               `Object.defineProperties` — lets TypeScript see `Core.Services.Shadow` while the
     *               getter supplies the value at run time (`declare` emits no code). Resolves the
     *               'shadow' service lazily; `undefined` until registered.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Shadow:      Services.ShadowService     | undefined;
    /** @name        State
     *  @public
     *  @readonly
     *  @memberof    Core.Services
     *  @type        {Services.StateService | undefined}
     *  @description Ambient declaration for the runtime State getter installed via
     *               `Object.defineProperties` — lets TypeScript see `Core.Services.State` while the
     *               getter supplies the value at run time (`declare` emits no code). Resolves the
     *               'state' service lazily; `undefined` until registered.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const State:       Services.StateService      | undefined;
    /** @name        Virtual
     *  @public
     *  @readonly
     *  @memberof    Core.Services
     *  @type        {Services.VirtualService | undefined}
     *  @description Ambient declaration for the runtime Virtual getter installed via
     *               `Object.defineProperties` — lets TypeScript see `Core.Services.Virtual` while the
     *               getter supplies the value at run time (`declare` emits no code). Resolves the
     *               'state' service lazily; `undefined` until registered.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Virtual:     Services.VirtualService    | undefined;
    /** @name        Templates
     *  @public
     *  @readonly
     *  @memberof    Core.Services
     *  @type        {Services.TemplatesService | undefined}
     *  @description Ambient declaration for the runtime Templates getter installed via
     *               `Object.defineProperties` — lets TypeScript see `Core.Services.Templates` while the
     *               getter supplies the value at run time (`declare` emits no code). Resolves the
     *               'state' service lazily; `undefined` until registered.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Templates:   Services.TemplatesService  | undefined;
    /** @name        Context
     *  @public
     *  @readonly
     *  @memberof    Core.Services
     *  @type        {Services.ContextService | undefined}
     *  @description Ambient declaration for the runtime Context getter installed via
     *               `Object.defineProperties` — lets TypeScript see `Core.Services.Context` while the
     *               getter supplies the value at run time (`declare` emits no code). Resolves the
     *               'state' service lazily; `undefined` until registered.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Context:     Services.ContextService    | undefined;
    /** @name        Directives
     *  @public
     *  @readonly
     *  @memberof    Core.Services
     *  @type        {Services.DirectivesService | undefined}
     *  @description Ambient declaration for the runtime Directives getter installed via
     *               `Object.defineProperties` — lets TypeScript see `Core.Services.Directives` while the
     *               getter supplies the value at run time (`declare` emits no code). Resolves the
     *               'state' service lazily; `undefined` until registered.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Directives:  Services.DirectivesService | undefined;

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
    export function  Call<R = unknown>(name: string, method: string, ...args: unknown[]): R | undefined
    {
        const fn = services.get(name)?.[method];
        return typeof fn === 'function' ? (fn as (...a: unknown[]) => R)(...args) : undefined;
    }

    /** @name        Service
     *  @public
     *  @type        {typeof Service}
     *  @description Runtime class responsible for the Service capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Service<T extends object = object>
    {
        static
        {
            /* Window publication removed by AriannA 2 conventions. */
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
        public readonly Container : T;

        /** @name constructor @public @description Validate, store, and register the container into the shared Services map (last-write-wins). @param {string} name Non-empty key. @param {Record<string, unknown>} container Capability container. @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        constructor(name: string, container: T)
        {
            if (!name || typeof name !== 'string')          throw new TypeError('Service: name must be a non-empty string.');
            if (!container || typeof container !== 'object') throw new TypeError('Service: container must be an object.');
            this.Name = name; this.Container = container;
            Services.Register(name, container as Record<string, unknown>);
        }
    }
}

export default Services;
