/**
 * @module    core/Component
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * Component — dual-callable class + namespace. ♡ Arianna.
 *
 * A real class `Component` (hard-`#`-private state) made callable through a single Proxy
 * (`Component.Callable`). The Proxy's `apply` trap dispatches `Component(...)` by argument
 * shape to two private-static handlers; `new Component(...)` bypasses the trap and hits the
 * native constructor (the Layer-2 instance owning Real + Virtual). One public callable surface,
 * everything else `#`-private.
 *
 * # The three forms
 *
 *   Component(el) | Component(this) | Component('#sel')          → #Static      (install / wrap)
 *   @Component({ … }) | @Component('tag', css, def?)             → #Decorator  (decorator)
 *   const c = new Component(elOrTag, opts?)                      → constructor  (Layer-2 instance)
 *
 * Dispatch is unambiguous by shape:
 *   · Element                                  → #Static
 *   · length 1 && string                       → #Static      (CSS selector)
 *   · string && args[1] is a function          → error (removed factory form)
 *   · else                                     → #Decorator
 */

import { Css }        from '../dom/Css.ts';
import { Namespaces } from '../dom/Namespaces.ts';
import { Reactivity } from '../reactivity/Reactivity.ts';
import Real           from '../dom/Real.ts';
import { Services }   from '../kernel/Services.ts';
import Virtual        from './Virtual.ts';

import type { Types }      from '../definitions/Types.ts';
import type { Interfaces } from '../definitions/Interfaces.ts';

/** @name        Components
 *  @public
 *  @type        {namespace}
 *  @description Groups the Components contracts and runtime surface.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Components
{
    /** @name        Callable
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Callable.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Callable       = Interfaces.Components.ComponentInterface;
    /** @name        Constructor
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Constructor.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Constructor    = Types.DOM.Constructor;
    /** @name        TypeDescriptor
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for TypeDescriptor.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type TypeDescriptor = Interfaces.Namespaces.Type;
    /** @name        Template
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Template.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Template       = Interfaces.Template.Binding;

    /** @name        Binding
     *  @public
     *  @class
     *  @template    T
     *  @description Fluent component binding builder. Navigation remains on the builder; terminal methods return
     *               canonical Reactivity signals.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Binding<T = unknown>
    {
        #initial : T | undefined;
        #source  : Element | undefined;
        #target  : Element | undefined;
        #owner   : Element | undefined;
        #path    : string[] = [];

        constructor(initial?: T, owner?: Element)
        {
            this.#initial = initial;
            this.#owner   = owner;
            this.#source  = owner;
            this.#target  = owner;
        }

        from(source?: unknown): this
        {
            this.#source =
                Component.ResolveTarget(source) ??
                this.#source;

            return this;
        }

        to(target?: unknown): this
        {
            this.#target =
                Component.ResolveTarget(target) ??
                this.#target;

            return this;
        }

        host(host?: unknown): this
        {
            return this.from(host);
        }

        owner(owner?: unknown): this
        {
            this.#owner =
                Component.ResolveTarget(owner) ??
                this.#owner;

            return this;
        }

        sub(key: string): this
        {
            this.#path.push(key);

            return this;
        }

        up(): this
        {
            this.#path.pop();

            return this;
        }

        attribute(name: string): Reactivity.Signal<string | null>
        {
            return Component.AttributeSignal
            (
                this.#host(),
                name,
                this.#initial
            );
        }

        value<V = unknown>(): Reactivity.Signal<V>
        {
            let current: unknown =
                this.#initial;

            for(const key of this.#path)
            {
                current =
                    current == null
                        ? undefined
                        : (current as Record<string, unknown>)[key];
            }

            return new Reactivity.Signal<V>(current as V);
        }

        property(_name: string): never
        {
            return this.#pending('property');
        }

        style(_name: string): never
        {
            return this.#pending('style');
        }

        text(): never
        {
            return this.#pending('text');
        }

        dataset(_name: string): never
        {
            return this.#pending('dataset');
        }

        class(_name: string): never
        {
            return this.#pending('class');
        }

        event(_name: string): never
        {
            return this.#pending('event');
        }

        #pending(name: string): never
        {
            throw new Error
            (
                `[arianna] signal().${name}() is not implemented yet. ` +
                'Available terminals: attribute(), value().'
            );
        }

        #host(): Element
        {
            const host =
                this.#source ??
                this.#owner ??
                Component.CurrentHost();

            if(!host)
            {
                throw new TypeError
                (
                    '[arianna] signal().attribute(): no host is available. ' +
                    'Use .from(element) or call it from a component instance.'
                );
            }

            return host;
        }
    }

    /** @name        Component
     *  @public
     *  @type        {typeof Component}
     *  @description Runtime class responsible for the Component capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Component
    {
        static readonly #realFacets  = new WeakMap<Element, Real>();
        static readonly #templates= new WeakMap<Element, unknown>();
        static readonly #attributeSignals =
            new WeakMap<Element, Map<string, Reactivity.Signal<string | null>>>();
        static readonly #hostStack: Element[] = [];
        static readonly #typeOptionKeys = new Map<string, string>
        (
            [
                ['css',        'Css'],
                ['attributes', 'Attributes'],
                ['shadow',     'Shadow'],
                ['bus',        'Bus'],
                ['render',     'Render'],
                ['template',   'Template'],
                ['slot',       'Slot'],
                ['component',  'Component']
            ]
        );

        /** @name        EnterHost
         *  @public
         *  @static
         *  @param       {Element} host Component host entering synchronous construction.
         *  @returns     {void}
         *  @description Push a host onto the synchronous construction stack.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static EnterHost(host: Element): void
        {
            Component.#hostStack.push(host);
        }

        /** @name        LeaveHost
         *  @public
         *  @static
         *  @returns     {void}
         *  @description Remove the most recently entered component host.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static LeaveHost(): void
        {
            Component.#hostStack.pop();
        }

        static CurrentHost(): Element | undefined
        {
            return Component.#hostStack[Component.#hostStack.length - 1];
        }

        static ResolveTarget(target: unknown): Element | undefined
        {
            if(target instanceof Element)
            {
                return target;
            }

            if(typeof target === 'string' && typeof document !== 'undefined')
            {
                return document.querySelector(target) ?? undefined;
            }

            return undefined;
        }

        static RealFacet(host: Element): Real
        {
            const existing =
                Component.#realFacets.get(host);

            if(existing)
            {
                return existing;
            }

            const real =
                new Real(host);

            Component.#realFacets.set(host, real);

            return real;
        }

        static Signal<T>(initial?: T, owner?: Element): Binding<T>
        {
            return new Binding<T>(initial, owner);
        }

        static AttributeSignal
        (
            host     : Element,
            name     : string,
            initial? : unknown
        ): Reactivity.Signal<string | null>
        {
            let map =
                Component.#attributeSignals.get(host);

            if(!map)
            {
                map = new Map();
                Component.#attributeSignals.set(host, map);
            }

            const existing =
                map.get(name);

            if(existing)
            {
                return existing;
            }

            const present =
                host.getAttribute(name);

            const seed =
                present !== null
                    ? present
                    : initial === undefined
                        ? null
                        : String(initial);

            const created =
                new Reactivity.Signal<string | null>(seed);

            map.set(name, created);

            return created;
        }

        static NotifyAttribute
        (
            host  : Element,
            name  : string,
            value : string | null
        ): void
        {
            Component.#attributeSignals
                .get(host)
                ?.get(name)
                ?.Set(value);
        }

        static Signals(host: Element): Readonly<Record<string, unknown>>
        {
            const map =
                Component.#attributeSignals.get(host);

            if(!map)
            {
                return Object.freeze({});
            }

            const output =
                Object.create(null) as Record<string, unknown>;

            for(const [name, signal] of map)
            {
                output[name] = signal;
            }

            return Object.freeze(output);
        }

        static NormalizeBag
        (
            source : Record<string, unknown>,
            extra  : ReadonlyMap<string, string> = new Map()
        ): Record<string, unknown>
        {
            const normalized: Record<string, unknown> = {};
            const assigned = new Set<string>();

            for(const [key, value] of Object.entries(source))
            {
                const lower =
                    key.toLowerCase();

                const canonical =
                    extra.get(lower) ??
                    Component.#typeOptionKeys.get(lower) ??
                    key;

                if(assigned.has(canonical))
                {
                    throw new TypeError
                    (
                        `[arianna] Duplicate option '${canonical}' supplied with different casing.`
                    );
                }

                assigned.add(canonical);
                normalized[canonical] = value;
            }

            return normalized;
        }

        static InstallPrototypeSurface(Target: Function): void
        {
            const prototype =
                (Target as { prototype: HTMLElement }).prototype;

            const define =
                (
                    name       : PropertyKey,
                    descriptor : PropertyDescriptor
                ): void =>
                {
                    if(name in prototype)
                    {
                        return;
                    }

                    Object.defineProperty
                    (
                        prototype,
                        name,
                        {
                            configurable : true,
                            enumerable   : false,
                            ...descriptor
                        }
                    );
                };

            define
            (
                'signal',
                {
                    writable : true,
                    value<T>(this: HTMLElement, initial?: T): Binding<T>
                    {
                        return Component.Signal(initial, this);
                    }
                }
            );

            define
            (
                'attributeSignal',
                {
                    writable : true,
                    value(this: HTMLElement, name: string): Reactivity.Signal<string | null>
                    {
                        return Component.AttributeSignal(this, name);
                    }
                }
            );

            define
            (
                'render',
                {
                    writable : true,
                    value(this: HTMLElement): HTMLElement
                    {
                        return this;
                    }
                }
            );

            define
            (
                'fire',
                {
                    writable : true,
                    value(this: HTMLElement, event: string | Event, init?: CustomEventInit): HTMLElement
                    {
                        this.dispatchEvent
                        (
                            typeof event === 'string'
                                ? new CustomEvent(event, init)
                                : event
                        );

                        return this;
                    }
                }
            );

            define
            (
                'Sheet',
                {
                    get(this: HTMLElement): Css.Stylesheet | null
                    {
                        return Component.RealFacet(this).Sheet;
                    },
                    set(this: HTMLElement, value: Css.Stylesheet | null)
                    {
                        Component.RealFacet(this).Sheet = value;
                    }
                }
            );

            define
            (
                'template',
                {
                    get(this: HTMLElement): unknown
                    {
                        return Component.#templates.get(this);
                    },
                    set(this: HTMLElement, value: unknown)
                    {
                        Component.#templates.set(this, value);
                    }
                }
            );
        }

        /** @member      {Real} #real       The Real facet (backing native element) owned by this instance. */
        readonly #real    : Real;
        /** @member      {Virtual|null} #virtual   Lazily-built Virtual facet; null until first `.Virtual` access. */
        #virtual          : Virtual | null = null;
        /** @member      {Element} #element  The concrete DOM element this instance wraps. */
        readonly #element : Element;
        /** @member      {string} #tag       The element's tag (localName, or the string it was built from). */
        readonly #tag     : string;

        /** @name        constructor
         *  @public
         *  @param       {Element|string} arg  An existing element, or a tag/selector to build one.
         *  @param       {Record<string, unknown>=} opts  Initial properties forwarded to the Real facet.
         *  @description Layer-2 instance `new Component(elOrTag, opts?)` owning the Real + Virtual facets
         *               over one element. Reads the element's definition (attributes/shadow/render/css) off the
         *               Core descriptor, and best-effort applies each `opts` entry through Real.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Component
         *  @namespace   Core
         */
        constructor(arg: Element | string, opts?: Record<string, unknown>)
        {
            this.#real    = new Real(arg);
            this.#element = this.#real.render();
            this.#tag     = typeof arg === 'string' ? arg : arg.localName;

            if (opts && typeof opts === 'object')
            {
                for (const [k, v] of Object.entries(opts))
                { try { this.#real.set(k, v); } catch { /* best-effort */ } }
            }
        }

        /** @name element  @public @returns {Element} The wrapped DOM element. */
        get element(): Element { return this.#element; }
        /** @name tag      @public @returns {string} The element's tag. */
        get tag()    : string  { return this.#tag; }
        /** @name Real     @public @returns {Real} The Real facet. */
        get Real()   : Real    { return this.#real; }
        /** @name Virtual  @public @returns {Virtual} The Virtual facet, built lazily on first access. */
        get Virtual(): Virtual
        {
            if (this.#virtual) return this.#virtual;
            try   { this.#virtual = new (Virtual as unknown as new (a: unknown) => Virtual)(this.#element); }
            catch { this.#virtual = new (Virtual as unknown as new (a: unknown) => Virtual)(this.#tag); }
            return this.#virtual;
        }

        /** @name render   @public @returns {Element} The wrapped element (facet-agnostic accessor). */
        render() : Element { return this.#element; }
        /** @name valueOf  @public @returns {Element} The wrapped element, for coercion contexts. */
        valueOf(): Element { return this.#element; }

        /** @name        #Static
         *  @private @static
         *  @param       {...unknown} args `(el)`, `(this)`, or a single CSS-selector string `('#sel')`.
         *  @returns     {unknown} The wrapped/installed element, or null when the selector matches nothing.
         *  @description Install form `Component(el)` / `Component(this)` / `Component('#sel')`. Resolves a
         *               single string as a document selector; an Element is used as-is. Attaches AriannA
         *               facilities to an existing node — never stamps a new type, never registers a tag.
         *               STUB: resolve + capture only; wrapping not yet implemented. MUST NOT throw — it is
         *               reached by `Service.install` and by every `Component(this)`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Component
         *  @namespace   Core
         */
        static #Static(...args: unknown[]): unknown
        {
            const a0 = args[0];

            /* resolve to a concrete element: Element as-is, or a single selector string */
            const el = a0 instanceof Element
                ? a0
                : (typeof a0 === 'string' && typeof document !== 'undefined' ? document.querySelector(a0) : null);
            if (!el) return null;

            /* install AriannA facilities over the existing node via the Real facet — the same wrap the
               Layer-2 constructor performs (`new Real(arg)`). Legacy parity: Component.js ran the whole
               instance constructor here (Append/states/data/Virtual/event-wiring); in v2 that surface
               lives in Real/Virtual, so #Static bridges to it rather than re-implementing it.
               NOTE: in-place attachment for the `constructor(){ Component(this); }` marker pattern needs
               the Real primitive that mutates an existing element in place — wired here once Real.ts
               exposes it; today we wrap and return the (possibly re-rendered) element. */
            return Component.RealFacet(el).render();
        }

        /** @name        #Decorator
         *  @private @static
         *  @param       {...unknown} args `({ tag, ... })` object form, or `(tag, css, def?)` positional
         *                                 (positional requires length ≥ 2 — a bare string is #Static).
         *  @returns     {(Target: unknown) => unknown} The class decorator.
         *  @description Decorator form `@Component({...})` / `@Component('tag', css, def?)`. The class IS the
         *               decorated Target — it already exists, so no bridge, no deferral: register via the
         *               PUBLIC `owner.Define` synchronously, then mint direct `new X()` through a per-class
         *               Proxy whose construct trap returns the element produced by Namespace.Create.
         *
         *               The options bag is case-insensitive and normalized once into canonical TypeOptions
         *               (`Css`, `Attributes`, `Shadow`, `Render`, `Bus`, `Template`, `Slot`). CSS remains raw:
         *               Component never parses it; Namespace.Reserve delegates to Css.Compile.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Component
         *  @namespace   Core
         */
        static #Decorator
        (
            ...args: unknown[]
        ):
            <
                T extends abstract new (...arguments_: any[]) => object
            >
            (
                Target   : T,
                context? : ClassDecoratorContext<T>
            ) => T | void
        {
            const first = args[0];
            const objectForm = typeof first === 'object' && first !== null;

            const DecoratorKeys = new Map<string, string>
            (
                [
                    ['tag', 'Tag'],
                    ['def', 'Def']
                ]
            );

            const spec = objectForm
                ? Component.NormalizeBag(first as Record<string, unknown>, DecoratorKeys)
                : null;

            const tag = objectForm ? spec?.Tag : first;

            if(typeof tag !== 'string' || !tag.trim())
            {
                throw new TypeError
                (
                    '[arianna] Component decorator requires a non-empty tag.'
                );
            }

            const rawCss = objectForm ? spec?.Css : args[1];

            /* An empty plain object means no stylesheet. */
            const css =
                rawCss &&
                typeof rawCss === 'object' &&
                !Array.isArray(rawCss) &&
                Object.getPrototypeOf(rawCss) === Object.prototype &&
                Object.keys(rawCss as object).length === 0
                    ? undefined
                    : rawCss;

            const positionalDefinition =
                !objectForm &&
                args[2] &&
                typeof args[2] === 'object'
                    ? Component.NormalizeBag(args[2] as Record<string, unknown>)
                    : {};

            const objectDefinition =
                objectForm &&
                spec?.Def &&
                typeof spec.Def === 'object'
                    ? Component.NormalizeBag(spec.Def as Record<string, unknown>)
                    : {};

            const explicitOptions = objectForm && spec
                ? Object.fromEntries
                  (
                      Object.entries(spec).filter(([key]) => key !== 'Tag' && key !== 'Def')
                  )
                : {};

            const options =
            {
                ...(objectForm ? objectDefinition : positionalDefinition),
                ...explicitOptions,
                ...(css === undefined ? {} : { Css: css })
            } as Interfaces.Core.TypeOptions;

            const tg = tag.trim().toLowerCase();

            return <
                T extends abstract new (...arguments_: any[]) => object
            >
            (
                Target   : T,
                _context?: ClassDecoratorContext<T>
            ): T | void =>
            {

                Component.InstallPrototypeSurface(Target);


                const parentConstructor =
                    Object.getPrototypeOf(Target);

                const base =
                    typeof parentConstructor === 'function' &&
                    parentConstructor !== Function.prototype &&
                    typeof
                        (
                            parentConstructor as
                                {
                                    prototype?: unknown;
                                }
                        ).prototype === 'object'
                        ? parentConstructor as new (...a: unknown[]) => Element
                        : HTMLElement as unknown as new (...a: unknown[]) => Element;

                /*
                 * Find the nearest STANDARD native interface in the constructor chain.
                 */
                let nb: unknown =
                    base;

                while(typeof nb === 'function')
                {
                    const descriptor =
                        Namespaces.Namespace.Resolve
                        (
                            nb as Parameters<typeof Namespaces.Namespace.Resolve>[0]
                        );

                    if(descriptor && descriptor?.Standard)
                    {
                        break;
                    }

                    nb =
                        Object.getPrototypeOf(nb);
                }

                if(typeof nb !== 'function')
                {
                    nb = base;
                }

                const owner =
                    Namespaces.Namespace.Owner
                    (
                        nb as Parameters<typeof Namespaces.Namespace.Owner>[0]
                    );

                if(!owner)
                {
                    throw new TypeError
                    (
                        `[arianna] No namespace owns the native base for <${tg}>.`
                    );
                }

                const descriptor =
                    owner.Define
                    (
                        tg,
                        Target as unknown as Constructor,
                        nb as Constructor,
                        options
                    );

                if(!descriptor)
                {
                    throw new TypeError
                    (
                        `[arianna] Definition failed for <${tg}>.`
                    );
                }

                const record =
                    Namespaces.Namespace.Resolve(tg);

                if(record !== false)
                {
                    record.Component = true;
                }

                let constructing =
                    false;

                const proxy:
                    new (...a: unknown[]) => Element =
                    new Proxy
                    (
                        Target as unknown as new (...arguments_: unknown[]) => Element,
                        {
                            construct
                            (
                                target,
                                constructorArgs,
                                newTarget
                            ): object
                            {
                                if
                                (
                                    newTarget ===
                                    (proxy as unknown as Function) &&
                                    !constructing
                                )
                                {
                                    constructing = true;

                                    try
                                    {
                                        const element =
                                            owner.Create(tg);

                                        if(element)
                                        {
                                            return element;
                                        }
                                    }
                                    finally
                                    {
                                        constructing = false;
                                    }
                                }

                                return Reflect.construct
                                (
                                    target,
                                    constructorArgs,
                                    newTarget
                                );
                            }
                        }
                    ) as unknown as new (...a: unknown[]) => Element;

                return proxy as unknown as T;
            };
        }

        /** @name        Callable
         *  @public @static @readonly
         *  @type        {ComponentContract & typeof Component}
         *  @description The single public callable surface: a Proxy over `Component` whose `apply` trap —
         *               lexically inside the class body, so it can reach the `#` statics — dispatches
         *               `Component(...)` by argument shape:
         *                 · Element                          → #Static      (install / wrap)
         *                 · length 1 && string               → #Static      (CSS selector)
         *                 · string && args[1] is a function  → explicit migration error (factory removed)
         *                 · else                             → #Decorator  (decorator)
         *               `new Component(...)` bypasses `apply` (no construct trap) and hits the native
         *               constructor → the Layer-2 instance. Zero hot-path overhead on construction.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Component
         *  @namespace   Core
         */
        static readonly Callable: Callable &
        typeof Component = new Proxy
        (
            Component,
            {
                apply(_t, _thisArg, args): unknown
                {
                    const a0 = args[0];
                    if (a0 instanceof Element)                                    return Component.#Static(...args);
                    if (args.length === 1 && typeof a0 === 'string')             return Component.#Static(...args);
                    if (typeof a0 === 'string' && typeof args[1] === 'function')
                    {
                        throw new TypeError
                        (
                            "[arianna] Component(tag, Base, css?, def?) was removed. " +
                            "Use @Component(tag, css, def?) on a class that extends Base, " +
                            "or Namespace.Define(tag, Constructor, Base, options)."
                        );
                    }
                        return Component.#Decorator(...args);
                    }
            }
        ) as unknown as Callable & typeof Component;

        /** @name        (window self-install)
         *  @global @static
         *  @description Publishes the callable Proxy as the global `Component` at class initialization
         *               (module load), guarded by `typeof window` so the module stays safe under SSR /
         *               Worker / Node. Installed writable:false + configurable:false — reassignment is a
         *               no-op, redefinition/deletion throws; enumerable:true to match Real/Virtual/Observer.
         *               Not idempotent by design: a second evaluation in the same realm throws at
         *               defineProperty, surfacing a duplicate-module bug loudly.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Component
         *  @namespace   Core
         */

    }

    /** @name        Service
     *  @private
     *  @constant
     *  @type        {Services.Service}
     *  @description Registers the canonical Component service while all implementation remains owned by
     *               `Components.Component`.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const Service = new Services.Service
    (
        'component',
        {
            Install(node: Element): void
            {
                Component.Callable(node);
            },

            Signal<T>(initial?: T, owner?: Element): Binding<T>
            {
                return Component.Signal(initial, owner);
            },

            AttributeSignal
            (
                host     : Element,
                name     : string,
                initial? : unknown
            ): Reactivity.Signal<string | null>
            {
                return Component.AttributeSignal(host, name, initial);
            },

            Signals(node: Element): Readonly<Record<string, unknown>>
            {
                return Component.Signals(node);
            },

            AttributeChanged
            (
                node  : Element,
                name  : string,
                old   : string | null,
                value : string | null
            ): void
            {
                Component.NotifyAttribute(node, name, value);

                (
                    node as
                    {
                        onAttributeChanged?:
                        (
                            name  : string,
                            old   : string | null,
                            value : string | null
                        ) => void;
                    }
                ).onAttributeChanged?.(name, old, value);
            },

            Connected(node: Element): void
            {
                const descriptor =
                    Namespaces.Namespace.Resolve(node);

                if
                (
                    descriptor !== false &&
                    descriptor.Component
                )
                {
                    const host =
                        node as
                            Element &
                            Interfaces.DOM.Element;

                    if
                    (
                        descriptor.Template != null &&
                        host.template == null
                    )
                    {
                        host.template =
                            typeof descriptor.Template === 'string'
                                ? Services.Call
                            (
                                'template',
                                'Compile',
                                descriptor.Template
                            ) ?? descriptor.Template
                                : descriptor.Template;
                    }

                    const shadowDefinition =
                        descriptor.Shadow;

                    const shadow =
                        Services.Call
                        (
                            'shadow',
                            'Create',
                            node,
                            {
                                Backend:
                                    shadowDefinition?.Setting === false
                                        ? 'light'
                                        : 'native',

                                Mode:
                                    shadowDefinition?.Mode ??
                                    'closed',

                                DelegatesFocus:
                                    shadowDefinition?.DelegatesFocus ??
                                    false
                            }
                        ) as
                            | {
                            Template
                            (
                                template : unknown,
                                scope?   : Record<string, unknown>
                            ): unknown;
                        }
                            | undefined;

                    if
                    (
                        shadow &&
                        host.template != null
                    )
                    {
                        shadow.Template
                        (
                            host.template,
                            host as unknown as Record<string, unknown>
                        );
                    }
                }

                (
                    node as
                        {
                            onConnected?: () => void;
                        }
                ).onConnected?.();
            },

            Disconnected(node: Element): void
            {
                (
                    node as
                    {
                        onDisconnected?: () => void;
                    }
                ).onDisconnected?.();
            },

            Adopted(node: Element): void
            {
                (
                    node as
                    {
                        onAdopted?: () => void;
                    }
                ).onAdopted?.();
            }
        }
    );
}

export default Components.Component.Callable;
