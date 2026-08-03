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
 * shape to three private-static handlers; `new Component(...)` bypasses the trap and hits the
 * native constructor (the Layer-2 instance owning Real + Virtual). One public callable surface,
 * everything else `#`-private.
 *
 * # The four forms
 *
 *   Component(el) | Component(this) | Component('#sel')          → #Static      (install / wrap)
 *   class X extends Component('tag', Base, css?, def?) { … }     → #Constructor (factory; Base required)
 *   @Component({ … }) | @Component('tag', css, def?)             → #Decorator  (decorator)
 *   const c = new Component(elOrTag, opts?)                      → constructor  (Layer-2 instance)
 *
 * Dispatch is unambiguous by shape:
 *   · Element                                  → #Static
 *   · length 1 && string                       → #Static      (CSS selector)
 *   · string && args[1] is a function          → #Constructor (Base is mandatory — a bare
 *                                                 `Component('tag')` is never a factory, which
 *                                                 keeps the multi-namespace / IR model intact)
 *   · else                                     → #Decorator
 */

import { Core } from './Core.ts';
import { Css } from './Css.ts';
import Virtual from './Virtual.ts';

import type { Real } from './Real.ts';
import { Reactivity } from './Reactive.ts';
import type { Template } from './Template.ts';
import {Namespaces} from "./Namespaces.ts";

export namespace Components
{
    import TypeOptions = Core.Types.TypeOptions;
    export const { Rule, Stylesheet } = Css;

    /** @interface   ComponentInstance
     *  @description Runtime facilities present on every AriannA component produced by the factory form
     *               (attached during upgrade) but absent from the bare `Base` structural type. Merged into
     *               the factory return type so `class X extends Component('x', HTMLElement, …)` sees
     *               `attrSignal` / `template` / `build`.
     *  @memberof    Components
     */
    export interface ComponentInstance
    {
        /** Reactive view over an observed attribute; `.get()` yields the current string value (or null). */
        attributeSignal(name: string): Reactivity.Signal<string | null>;
        /** Declarative markup for the element; assign an `html`…`` Template. */
        template: Template;
        /** Optional lifecycle hook run after upgrade (Core invokes `build()` when present). */
        build?(): void;
    }

    /** @interface   ComponentInterface
     *  @description The callable + constructable surface of `Component` exposed through `Callable`. Call
     *               signatures mirror the four dispatch forms; the construct signature is the Layer-2 instance.
     *  @memberof    Components
     */
    export interface ComponentInterface
    {
        (el: Element): unknown;                                                                                 // #Static (el / this)
        (selector: string): unknown;                                                                           // #Static (selector, length 1)
        (tag: string, base: new (...a: unknown[]) => Element, css?: unknown, def?: unknown): new (...a: unknown[]) => HTMLElement & ComponentInstance;  // #Constructor
        (spec: object): (target: unknown) => unknown;                                                          // #Decorator (object)
        (tag: string, css: unknown, def?: unknown): (target: unknown) => unknown;                              // #Decorator (positional, length ≥ 2)
        new (arg: Element | string, opts?: Record<string, unknown>): Component;
    }

    /** CSS input accepted by the component factory / decorator (sugar form). */
    type CssArguments = Css.Stylesheet | Css.Rule | Css.Rule[] | string | Record<string, unknown>;
    type RealService  = { create(arg: unknown): Real };
    /** Argument tuples of the factory form `Component(tag, Base, …)`. Type-only — no runtime cost.
     *  css/def are distinguished by ARITY (read with if/else in #Constructor), never by key-sniffing.
     *  Not exported: private to this module. */
    type Arguments =
        | [tag: string, base: new (...a: unknown[]) => Element]
        | [tag: string, base: new (...a: unknown[]) => Element, css: CssArguments]
        | [tag: string, base: new (...a: unknown[]) => Element, css: CssArguments, def: Record<string, unknown>];

    export class Component
    {
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
         *               over one element. Reads the element's definition (attrs/shadow/render/css) off the
         *               Core descriptor, and best-effort applies each `opts` entry through Real.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Component
         *  @namespace   Core
         */
        constructor(arg: Element | string, opts?: Record<string, unknown>)
        {
            this.#real    = Core.Services.Real?.create(arg) as Real;
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
            const real = (Core.Services.Resolve('real') as RealService | undefined)?.create(el) as Real;
            return real.render();
        }

        /** @name        #Constructor
         *  @private @static
         *  @param       {...Arguments} args `(tag, Base)` | `(tag, Base, css)` | `(tag, Base, css, def)`.
         *  @returns     {new (...a: unknown[]) => Element} Rebound — a Proxy-constructor over `Base`.
         *  @description Factory form `class X extends Component('tag', Base, css?, def?)`. It runs INSIDE
         *               the `extends` clause, before X exists: `Rebound` (a Proxy over `Base`) is a valid
         *               constructor, so `extends` works. `Base` is MANDATORY — a bare `Component('tag')`
         *               would require a tag→interface lookup and an implicit default, nailing the component
         *               to HTML and defeating the multi-namespace / IR model (SVG, MathML, custom bases).
         *
         *               At the first `new` (or mint via Core.Create) X is `new.target`: the tag is
         *               registered once through the PUBLIC `owner.Define(tag, X, Base)` — Compose
         *               (#Reserve + #Promote) in a single call — then the upgraded element is minted.
         *               #Reserve/#Promote stay private on Namespace; the Adopt path is not needed.
         *
         *               css/def are split by arity: 4 → (css, def); 3 → (css); 2 → neither.
         *
         *               CSS is passed RAW through `TypeOptions.Css`. Component performs no parsing,
         *               serialisation or Rule/Stylesheet discrimination: `Css.Compile`, reached by
         *               Namespace.Reserve through the css service, is the single source of truth.
         *
         *               KNOWN LIMIT (unchanged from v1): pure markup-first is not covered — the tag reaches
         *               customElements only inside Define, which fires on the first new/create.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Component
         *  @namespace   Core
         */
        static #Constructor(...args: Arguments): new (...a: unknown[]) => Element
        {
            const tag  = args[0];
            const Base = args[1];

            let css: CssArguments | undefined;
            let def: Record<string, unknown> = {};

            if(args.length === 4)
            {
                css = args[2];
                def = args[3];
            }
            else if(args.length === 3)
            {
                css = args[2];
            }

            /*
             * Find the nearest STANDARD native interface in Base's constructor chain.
             * Base itself may already be an AriannA custom constructor.
             */
            let nb: unknown = Base;

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
                nb = Base;
            }

            const tg =
                tag.trim().toLowerCase();

            const nativeBase =
                nb as Core.Types.Base;

            const owner =
                Namespaces.Namespace.Owner(nativeBase);

            if(!owner)
            {
                throw new TypeError
                (
                    `[arianna] No namespace owns the native base for <${tg}>.`
                );
            }

            /*
             * Explicit css argument wins over any Css accidentally present in def.
             * Component passes it untouched; Reserve delegates to Css.Compile.
             */
            const opts =
                {
                    ...def,
                    Css: css
                } as Core.Types.TypeOptions;

            let done = false;

            const Rebound =
                new Proxy
                (
                    Base,
                    {
                        construct(_target, constructorArgs, newTarget): object
                        {
                            const isDerivedConstructor =
                                typeof newTarget === 'function' &&
                                newTarget !==
                                (Rebound as unknown as Function);

                            if(!done && isDerivedConstructor)
                            {
                                const constructor =
                                    newTarget as unknown as Core.Types.Constructor;

                                const base =
                                    nb as Core.Types.Constructor;

                                try
                                {
                                    const descriptor =
                                        owner.Define
                                        (
                                            tg,
                                            constructor,
                                            base,
                                            opts
                                        );

                                    if(!descriptor)
                                    {
                                        throw new TypeError
                                        (
                                            `[arianna] Definition failed for <${tg}>.`
                                        );
                                    }

                                    done = true;
                                }
                                catch(error)
                                {
                                    done = false;
                                    throw error;
                                }
                            }

                            return Reflect.construct
                            (
                                Base,
                                constructorArgs,
                                newTarget
                            );
                        }
                    }
                ) as unknown as new (...a: unknown[]) => Element;

            return Rebound;
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
         *               Public lowercase object keys are normalized once into canonical TypeOptions
         *               (`Css`, `Attrs`, `Shadow`, `Render`, `Bus`, `Template`, `Slot`). CSS remains raw:
         *               Component never parses it; Namespace.Reserve delegates to Css.Compile.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Component
         *  @namespace   Core
         */
        static #Decorator(...args: unknown[]): (Target: unknown) => unknown
        {
            const first =
                args[0];

            const objectForm =
                typeof first === 'object' &&
                first !== null;

            const spec =
                objectForm
                    ? first as Record<string, unknown>
                    : null;

            const tag =
                objectForm
                    ? spec?.tag
                    : first;

            if(typeof tag !== 'string' || !tag.trim())
            {
                throw new TypeError
                (
                    '[arianna] Component decorator requires a non-empty tag.'
                );
            }

            const css =
                objectForm
                    ? spec?.css ?? spec?.style
                    : args[1];

            const positionalDefinition =
                !objectForm &&
                args[2] &&
                typeof args[2] === 'object'
                    ? args[2] as Record<string, unknown>
                    : {};

            /*
             * Object form may optionally carry a canonical `def` object.
             * It is applied first; explicit public fields below take precedence.
             */
            const objectDefinition =
                objectForm &&
                spec?.def &&
                typeof spec.def === 'object'
                    ? spec.def as Record<string, unknown>
                    : {};

            const definition =
                objectForm
                    ? objectDefinition
                    : positionalDefinition;

            const options: Core.Types.TypeOptions =
                objectForm
                    ? {
                        ...definition,

                        Css:
                        css,

                        Attrs:
                            spec?.attrs ??
                            definition.Attrs,

                        Shadow:
                            spec?.shadow ??
                            definition.Shadow,

                        Render:
                            spec?.render ??
                            definition.Render,

                        Bus:
                            spec?.bus ??
                            definition.Bus,

                        Template:
                            spec?.template ??
                            definition.Template,

                        Slot:
                            spec?.slot ??
                            definition.Slot
                    } as Core.Types.TypeOptions
                    : {
                        ...definition,
                        Css: css
                    } as Core.Types.TypeOptions;

            const tg =
                tag.trim().toLowerCase();

            return (Target: unknown): unknown =>
            {
                if(typeof Target !== 'function')
                {
                    return Target;
                }

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
                        Target as unknown as Core.Types.Constructor,
                        nb as Core.Types.Constructor,
                        options
                    );

                if(!descriptor)
                {
                    throw new TypeError
                    (
                        `[arianna] Definition failed for <${tg}>.`
                    );
                }

                let constructing =
                    false;

                const proxy:
                    new (...a: unknown[]) => Element =
                    new Proxy
                    (
                        Target as new (...a: unknown[]) => Element,
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

                return proxy;
            };
        }

        /** @name        Callable
         *  @public @static @readonly
         *  @type        {ComponentInterface & typeof Component}
         *  @description The single public callable surface: a Proxy over `Component` whose `apply` trap —
         *               lexically inside the class body, so it can reach the `#` statics — dispatches
         *               `Component(...)` by argument shape:
         *                 · Element                          → #Static      (install / wrap)
         *                 · length 1 && string               → #Static      (CSS selector)
         *                 · string && args[1] is a function  → #Constructor (factory; Base required)
         *                 · else                             → #Decorator  (decorator)
         *               `new Component(...)` bypasses `apply` (no construct trap) and hits the native
         *               constructor → the Layer-2 instance. Zero hot-path overhead on construction.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         *  @memberof    Component
         *  @namespace   Core
         */
        static readonly Callable = new Proxy(Component, {
            apply(_t, _thisArg, args): unknown
            {
                const a0 = args[0];
                if (a0 instanceof Element)                                    return Component.#Static(...args);
                if (args.length === 1 && typeof a0 === 'string')             return Component.#Static(...args);
                if (typeof a0 === 'string' && typeof args[1] === 'function') return Component.#Constructor(...(args as Arguments));
                return Component.#Decorator(...args);
            },
        }) as unknown as ComponentInterface & typeof Component;

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
        static
        {
            if (typeof window !== 'undefined')
            {
                Object.defineProperty
                (
                    window,
                    'Component',
                    {
                        value: Component.Callable,
                        writable: false,
                        enumerable: true,
                        configurable: false
                    }
                );

                /** @name        Service
                 *  @public @const
                 *  @description The 'component' service registered in the Core `Services` registry. Its `install`
                 *               entry routes an element through the PUBLIC callable (`Component.Callable(node)`),
                 *               which dispatches to `#Static` — never calling a private handler across the class
                 *               boundary. Consumed by Core's upgrade path.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 *  @memberof    Components
                 *  @namespace   Core
                 */
                const Service = new Core.Services.Service
                (
                    'component',
                    {
                        install(node: Element): void
                        { (Component.Callable as unknown as (n: Element) => unknown)(node); }
                    }
                );
            }
        }
    }
}

/* Public module surface: the callable Proxy under the single name `Component`. The real class stays
   `Components.Component`; the world only ever sees the Proxy. */
export const Component = Components.Component.Callable;
export default Component;
