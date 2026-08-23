/**
 * @module    core/Services
 * @version   2.0.0
 * @description Canonical AriannA service registry. Runtime behavior only; all service contracts live in definitions/Interfaces.ts.
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 */
import type { Interfaces } from "../definitions/Interfaces.ts";

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
export namespace Services {
    /** @name        services
     *  @private
     *  @constant
     *  @memberof    Services
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
    /* Services Static Services Properties */
    /** @name        Object.defineProperties (service accessors)
     *  @public
     *  @memberof    Services
     *  @description Installs the three lazy service accessors — `Events`, `Observables`, `Css` —
     *               as getter properties on the `Services` namespace object. Each getter reads the
     *               registry AT ACCESS TIME via `Resolve`, never caching: a service registered
     *               later by its own module (Events.ts / Observables.ts / Css.ts, each `new
     *               Services.Service(...)` at its namespace init) is therefore always seen. A
     *               plain `const` snapshot would freeze `undefined` while the registry is still
     *               empty at load; a getter re-reads on every access instead. Consumers write
     *               `Services.Events?.Fire(...)`, `Services.Observables?.make(...)`,
     *               `Services.Css?.compile(...)` — the `?.` guards the window before the
     *               producing module has registered (SSR / early boot). This is the "quasi
     *               zero-import" seam: producers self-register, consumers resolve through the
     *               registry, and no feature module imports another directly.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    Object.defineProperties(Services, {
        Namespaces: {
            get(): Interfaces.Services.NamespacesService | undefined { return Services.Resolve<Interfaces.Services.NamespacesService>('namespaces'); },
            enumerable: false, configurable: true,
        },
        Observer: {
            get(): Interfaces.Services.ObserverService | undefined { return Services.Resolve<Interfaces.Services.ObserverService>('observer'); },
            enumerable: false, configurable: true,
        },
        /** @name        Events
         *  @public
         *  @readonly
         *  @memberof    Services
         *  @type        {Interfaces.Services.EventService | undefined}
         *  @description Lazy accessor for the 'events' service container (registered by Events.ts).
         *               Resolved per access; `undefined` until the producer registers.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Events: {
            get(): Interfaces.Services.EventService | undefined { return Services.Resolve<Interfaces.Services.EventService>('events'); },
            enumerable: false, configurable: true,
        },
        /** @name        Observables
         *  @public
         *  @readonly
         *  @memberof    Services
         *  @type        {Services.ObservableService | undefined}
         *  @description Lazy accessor for the 'observable' service container (registered by
         *               Observables.ts). Resolved per access; `undefined` until registered.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Reactive: {
            get(): Interfaces.Services.ReactivityService | undefined { return Services.Resolve<Interfaces.Services.ReactivityService>('reactivity'); },
            enumerable: false, configurable: true,
        },
        /** @name        Css
         *  @public
         *  @readonly
         *  @memberof    Services
         *  @type        {Interfaces.Services.CssService | undefined}
         *  @description Lazy accessor for the 'css' service container (registered by Css.ts).
         *               Resolved per access; `undefined` until registered.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Css: {
            get(): Interfaces.Services.CssService | undefined { return Services.Resolve<Interfaces.Services.CssService>('css'); },
            enumerable: false, configurable: true,
        },
        /** @name Real
         *  @public
         *  @readonly
         *  @memberof Services
         *  @type {Interfaces.Services.RealService | undefined}
         *  @description Lazy accessor for the 'real' service; resolved per access, undefined until registered.
         *  @author Riccardo Angeli
         *  @copyright Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license MIT / Commercial (dual license) */
        Real: {
            get(): Interfaces.Services.RealService | undefined { return Services.Resolve<Interfaces.Services.RealService>('real'); },
            enumerable: false, configurable: true,
        },
        /** @name        Shadow
         *  @public
         *  @readonly
         *  @memberof    Services
         *  @type        {Interfaces.Services.ShadowService | undefined}
         *  @description Lazy accessor for the 'shadow' service — resolved from the registry on every
         *               access (never cached), so a provider registered after this file loads is still
         *               seen; `undefined` until the Shadow module registers it.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Shadow: {
            get(): Interfaces.Services.ShadowService | undefined { return Services.Resolve<Interfaces.Services.ShadowService>('shadow'); },
            enumerable: false, configurable: true,
        },
        /** @name        State
         *  @public
         *  @readonly
         *  @memberof    Services
         *  @type        {Interfaces.Services.StateService | undefined}
         *  @description Lazy accessor for the 'state' service — resolved from the registry on every
         *               access (never cached), so a provider registered after this file loads is still
         *               seen; `undefined` until the State module registers it.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        State: {
            get(): Interfaces.Services.StateService | undefined { return Services.Resolve<Interfaces.Services.StateService>('state'); },
            enumerable: false, configurable: true,
        },
        /** @name        Virtual
         *  @public
         *  @readonly
         *  @memberof    Services
         *  @type        {Interfaces.Services.VirtualService | undefined}
         *  @description Lazy accessor for the 'virtual' service — resolved from the registry on every
         *               access (never cached), so a provider registered after this file loads is still
         *               seen; `undefined` until the Virtual module registers it.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Virtual: {
            get(): Interfaces.Services.VirtualService | undefined { return Services.Resolve<Interfaces.Services.VirtualService>('virtual'); },
            enumerable: false, configurable: true,
        },
        /** @name        Templates
         *  @public
         *  @readonly
         *  @memberof    Services
         *  @type        {Interfaces.Services.TemplatesService | undefined}
         *  @description Lazy accessor for the 'templates' service — resolved from the registry on every
         *               access (never cached), so a provider registered after this file loads is still
         *               seen; `undefined` until the Templates module registers it.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Templates: {
            get(): Interfaces.Services.TemplatesService | undefined { return Services.Resolve<Interfaces.Services.TemplatesService>('templates'); },
            enumerable: false, configurable: true,
        },
        /** @name        Context
         *  @public
         *  @readonly
         *  @memberof    Services
         *  @type        {Interfaces.Services.ContextService | undefined}
         *  @description Lazy accessor for the 'context' service — resolved from the registry on every
         *               access (never cached), so a provider registered after this file loads is still
         *               seen; `undefined` until the Context module registers it.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Context: {
            get(): Interfaces.Services.ContextService | undefined { return Services.Resolve<Interfaces.Services.ContextService>('context'); },
            enumerable: false, configurable: true,
        },
        /** @name        Directives
         *  @public
         *  @readonly
         *  @memberof    Services
         *  @type        {Interfaces.Services.DirectivesService | undefined}
         *  @description Lazy accessor for the 'directives' service — resolved from the registry on every
         *               access (never cached), so a provider registered after this file loads is still
         *               seen; `undefined` until the Directives module registers it.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        Directives: {
            get(): Interfaces.Services.DirectivesService | undefined { return Services.Resolve<Interfaces.Services.DirectivesService>('directives'); },
            enumerable: false, configurable: true,
        }
    });
    export declare const Namespaces: Interfaces.Services.NamespacesService | undefined;
    export declare const Observer: Interfaces.Services.ObserverService | undefined;
    /** @name        Events
     *  @public
     *  @readonly
     *  @memberof    Services
     *  @type        {Interfaces.Services.EventService | undefined}
     *  @description Ambient type declaration for the runtime getter installed above — lets TypeScript
     *               see `Services.Events` (the `defineProperties` getter supplies the value).
     *               `declare` emits no code, so there is no conflict with the runtime definition.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Events: Interfaces.Services.EventService | undefined;
    /** @name        Observables
     *  @public
     *  @readonly
     *  @memberof    Services
     *  @type        {Services.ObservableService | undefined}
     *  @description Ambient type declaration for the runtime getter installed above — lets TypeScript
     *               see `Services.Observables`. `declare` emits no code.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Reactivity: Interfaces.Services.ReactivityService | undefined;
    /** @name        Css
     *  @public
     *  @readonly
     *  @memberof    Services
     *  @type        {Interfaces.Services.CssService | undefined}
     *  @description Ambient type declaration for the runtime getter installed above — lets TypeScript
     *               see `Services.Css`. `declare` emits no code.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Css: Interfaces.Services.CssService | undefined;
    /** @name        Real
     *  @public
     *  @readonly
     *  @memberof    Services
     *  @type        {Interfaces.Services.RealService | undefined}
     *  @description Ambient type declaration for the runtime `Real` getter installed via
     *               `Object.defineProperties` above — it lets TypeScript see `Services.Real`
     *               while the getter supplies the value at run time (`declare` emits no code, so there
     *               is no conflict with the runtime definition). Resolves the `'real'` service lazily
     *               on every access; `undefined` until the Real module registers it.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Real: Interfaces.Services.RealService | undefined;
    /** @name        Shadow
     *  @public
     *  @readonly
     *  @memberof    Services
     *  @type        {Interfaces.Services.ShadowService | undefined}
     *  @description Ambient declaration for the runtime Shadow getter installed via
     *               `Object.defineProperties` — lets TypeScript see `Services.Shadow` while the
     *               getter supplies the value at run time (`declare` emits no code). Resolves the
     *               'shadow' service lazily; `undefined` until registered.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Shadow: Interfaces.Services.ShadowService | undefined;
    /** @name        State
     *  @public
     *  @readonly
     *  @memberof    Services
     *  @type        {Interfaces.Services.StateService | undefined}
     *  @description Ambient declaration for the runtime State getter installed via
     *               `Object.defineProperties` — lets TypeScript see `Services.State` while the
     *               getter supplies the value at run time (`declare` emits no code). Resolves the
     *               'state' service lazily; `undefined` until registered.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const State: Interfaces.Services.StateService | undefined;
    /** @name        Virtual
     *  @public
     *  @readonly
     *  @memberof    Services
     *  @type        {Interfaces.Services.VirtualService | undefined}
     *  @description Ambient declaration for the runtime Virtual getter installed via
     *               `Object.defineProperties` — lets TypeScript see `Services.Virtual` while the
     *               getter supplies the value at run time (`declare` emits no code). Resolves the
     *               'state' service lazily; `undefined` until registered.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Virtual: Interfaces.Services.VirtualService | undefined;
    /** @name        Templates
     *  @public
     *  @readonly
     *  @memberof    Services
     *  @type        {Interfaces.Services.TemplatesService | undefined}
     *  @description Ambient declaration for the runtime Templates getter installed via
     *               `Object.defineProperties` — lets TypeScript see `Services.Templates` while the
     *               getter supplies the value at run time (`declare` emits no code). Resolves the
     *               'state' service lazily; `undefined` until registered.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Templates: Interfaces.Services.TemplatesService | undefined;
    /** @name        Context
     *  @public
     *  @readonly
     *  @memberof    Services
     *  @type        {Interfaces.Services.ContextService | undefined}
     *  @description Ambient declaration for the runtime Context getter installed via
     *               `Object.defineProperties` — lets TypeScript see `Services.Context` while the
     *               getter supplies the value at run time (`declare` emits no code). Resolves the
     *               'state' service lazily; `undefined` until registered.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Context: Interfaces.Services.ContextService | undefined;
    /** @name        Directives
     *  @public
     *  @readonly
     *  @memberof    Services
     *  @type        {Interfaces.Services.DirectivesService | undefined}
     *  @description Ambient declaration for the runtime Directives getter installed via
     *               `Object.defineProperties` — lets TypeScript see `Services.Directives` while the
     *               getter supplies the value at run time (`declare` emits no code). Resolves the
     *               'state' service lazily; `undefined` until registered.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export declare const Directives: Interfaces.Services.DirectivesService | undefined;
    /* Services Static Namespace Functions */
    /** @name        Register
     *  @public
     *  @function
     *  @memberof    Services
     *  @param       {string} name Non-empty registry key.
     *  @param       {object} container Capability container.
     *  @returns     {void}
     *  @description Register (or override, last-write-wins) a named container in the registry.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export function Register(name: string, container: object): void { services.set(name, container as Record<string, unknown>); }
    /** @name        Resolve
     *  @public
     *  @function
     *  @memberof    Services
     *  @template    T
     *  @param       {string} name Registry key.
     *  @returns     {T | undefined} The container, or `undefined` when unregistered.
     *  @description Resolve a registered container by name. The primary lookup used by the lazy
     *               accessors and by consumers reaching services through the registry.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export function Resolve<T extends object = object>(name: string): T | undefined { return services.get(name) as T | undefined; }
    /** @name        Provides
     *  @public
     *  @function
     *  @memberof    Services
     *  @param       {string} name Registry key.
     *  @returns     {boolean} True if a container is registered under `name`.
     *  @description Membership test against the registry.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export function Provides(name: string): boolean { return services.has(name); }
    /** @name        Revoke
     *  @public
     *  @static
     *  @memberof    Services.Service
     *  @param       {string} name Registry key.
     *  @returns     {boolean} True if a container was present and removed.
     *  @description Remove a registered container from the registry.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export function Revoke(name: string): boolean { return services.delete(name); }
    /** @name        Providers
     *  @public
     *  @static
     *  @memberof    Services.Service
     *  @returns     {string[]} The names of all registered containers.
     *  @description Enumerate every registry key currently registered.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export function Providers(): string[] { return [...services.keys()]; }
    /** @name        Call
     *  @public
     *  @static
     *  @memberof    Services.Service
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
    export function Call<R = unknown>(name: string, method: string, ...args: unknown[]): R | undefined {
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
    export class Service<T extends object = object> {
        static {
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
        public readonly Name: string;
        /** @name Container @public @readonly @type {Record<string, unknown>} @description The registered container. @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        public readonly Container: T;
        /** @name constructor @public @description Validate, store, and register the container into the shared Services map (last-write-wins). @param {string} name Non-empty key. @param {Record<string, unknown>} container Capability container. @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        constructor(name: string, container: T) {
            if (!name || typeof name !== 'string')
                throw new TypeError('Service: name must be a non-empty string.');
            if (!container || typeof container !== 'object')
                throw new TypeError('Service: container must be an object.');
            this.Name = name;
            this.Container = container;
            Services.Register(name, container as Record<string, unknown>);
        }
    }
}
export default Services;
