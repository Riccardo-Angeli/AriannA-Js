/**
 * @module    Real
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * Real — canonical DOM engine of AriannA, with an eager fluent facade.
 *
 * `Real` is the single AriannA authority for real-DOM mutation. static DOM primitives on `Real`
 * expose the minimal compiler/Template/Virtual-facing mutation surface; the `Real`
 * class is the fluent user-facing facade over the same engine. Every fluent mutation
 * commits through the same authority and returns `this` for chaining. Reactive binding methods (`text`, `attr`, `cls`,
 * `prop`, `style`) accept a getter that runs inside an `effect`, so reads of
 * signals subscribe automatically; a static value works too (it's wrapped via
 * `Real.#AsGetter`). Constructor and child types are inlined at their use
 * sites (no top-level aliases); `sub()` builds a private accessor under-the-hood.
 * See `REAL_VIRTUAL.md` for the conceptual overview.
 */
import type { Css }   from './Css.ts';
import { Events }     from '../reactivity/Events.ts';
import { Namespaces } from './Namespaces.ts';
import { Reactivity } from '../reactivity/Reactivity.ts';

import { Services }   from '../kernel/Services.ts';
import { Primitives } from './Primitives.ts';

import type { Types }      from '../definitions/Types.ts';
import type { Interfaces } from '../definitions/Interfaces.ts';

/** @name        Reals
 *  @public
 *  @type        {namespace}
 *  @description Groups the Reals contracts and runtime surface.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Reals
{
    /** @name        Target
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Target.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Target            = Types.Reals.Target;
    /** @name        Child
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Child.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Child             = Types.Reals.Child;
    /** @name        Definition
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Definition.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Definition        = Interfaces.Reals.Definition;
    /** @name        ServiceContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ServiceContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ServiceContract   = Interfaces.Reals.Service;
    /** @name        Signal
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Signal.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Signal<T>         = Reactivity.Signal<T>;
    /** @name        SignalMono
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for SignalMono.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type SignalMono<T>     = Reactivity.Mono<T>;
    /** @name        ReadonlySignal
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ReadonlySignal.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ReadonlySignal<T> = Reactivity.ReadonlySignal<T>;
    /** @name        Rule
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Rule.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Rule              = Css.Rule;
    /** @name        Stylesheet
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Stylesheet.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Stylesheet        = Css.Stylesheet;




    /** @class       Real
     *  @classdesc   Eager, fluent wrapper around a single live DOM Element. Constructed with `new`, it
     *               creates/wraps an Element immediately and offers a chainable API for tree mutation
     *               (`append/add/remove/…`), attribute & property access (`set/get/sub`), reactive
     *               bindings (`text/attr/cls/prop/style`), events (`on/off/fire`), visibility
     *               (`show/hide`), and scoped CSS (`Sheet`).
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export class Real
    {
        /** @name        #el
         *  @private
         *  @type        {Element}
         *  @description The underlying live DOM Element.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #el: Element;
        /** @name        #mode
         *  @private
         *  @type        {boolean}
         *  @description `true` when constructed with `new` (create/wrap), `false` in call/lookup mode.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #mode: boolean;
        /** @name        #descriptor
         *  @private
         *  @type        {Core.Type | false}
         *  @description Resolved type descriptor for the element, or `false` when none.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #descriptor: Interfaces.Namespaces.Type | false;
        /** @name        #value
         *  @private
         *  @type        {unknown}
         *  @description Lookup/registration result in call mode; the Real itself in `new` mode.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #value: unknown;
        /** @name        #effects
         *  @private
         *  @type        {Array<() => void>}
         *  @description Disposers for reactive effects, drained by `destroy()`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #effects: Array<() => void> = [];
        /** @name        #sheet
         *  @private
         *  @type        {Stylesheet | null}
         *  @description Scoped Stylesheet attached to this instance, or null.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #sheet: Stylesheet | null = null;
        /** @name        #styleNode
         *  @private
         *  @type        {HTMLStyleElement | null}
         *  @description The installed `<style>` for the scoped Sheet, or null.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #styleNode: HTMLStyleElement | null = null;
        /** @name        #instanceId
         *  @private
         *  @type        {string}
         *  @description Stable per-instance id used to scope Sheet rules.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #instanceId: string = '';
        /** @name        #sheetSync
         *  @private
         *  @type        {(() => void) | null}
         *  @description Re-flush handler bound to the Sheet's `Sheet-Changed` event, or null.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #sheetSync: (() => void) | null = null;

        /** @name        Instances
         *  @public
         *  @static
         *  @readonly
         *  @type        {Real[]}
         *  @description Every `new Real(...)` instance, in creation order (used for auto-id allocation).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static readonly Instances: Real[] = [];


        /** @name        DOM primitives
         *  @public
         *  @static
         *  @description Canonical low-level DOM engine operations. Template, Virtual, Compiler output and the
         *               fluent Real facade all commit real-DOM mutations through these static methods.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static IsRenderable(value: unknown): value is Interfaces.Reals.Renderable
        {
            return !!value && typeof value === 'object' && typeof (value as { render?: unknown }).render === 'function';
        }

        static Create(tag: string): Element
        {
            const descriptor = Namespaces.Namespace.Resolve(tag);

            if (descriptor && (descriptor as { Custom?: boolean }).Custom && typeof Namespaces.Namespace.Create === 'function')
            {
                return Namespaces.Namespace.Create(tag) || document.createElement(tag);
            }

            return descriptor && typeof Namespaces.Namespace.Namespaces[descriptor.Namespace]?.Create === 'function'
                ? (Namespaces.Namespace.Namespaces[descriptor.Namespace].Create(tag) || document.createElement(tag))
                : document.createElement(tag);
        }

        static CreateText(value = ''): Text
        {
            return Primitives.CreateText(value);
        }

        static CreateComment(value = ''): Comment
        {
            return Primitives.CreateComment(value);
        }

        static CreateFragment(): DocumentFragment
        {
            return Primitives.CreateFragment();
        }

        static CreateTemplate(): HTMLTemplateElement
        {
            return Primitives.CreateTemplate();
        }

        static Append(parent: Node, node: Node): Node
        {
            return Primitives.Append(parent, node);
        }

        static Before(parent: Node, node: Node, anchor: Node | null): Node
        {
            return Primitives.Before(parent, node, anchor);
        }

        static Insert(parent: Node, node: Node, index: number): Node
        {
            return Primitives.Insert(parent, node, index);
        }

        static Move(parent: Node, node: Node, index: number): Node
        {
            return Primitives.Move(parent, node, index);
        }

        static Remove(node: Node): void
        {
            Primitives.Remove(node);
        }

        /** @name        Replace
         *  @public
         *  @static
         *  @param       {Node | null | undefined} target Node to replace.
         *  @param       {string | Node | null | undefined} replacement Replacement node or markup.
         *  @returns     {Node | undefined} Inserted node or undefined for invalid input.
         *  @description Canonical real-DOM replacement primitive. String replacements are parsed through a
         *               template and Node replacements are detached before insertion.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Replace
        (
            target      : Node | null | undefined,
            replacement : string | Node | null | undefined
        ): Node | undefined
        {
            if(!target || !(target instanceof Node) || !target.parentNode)
            {
                return undefined;
            }

            if(replacement === null || replacement === undefined)
            {
                return undefined;
            }

            let next: Node | null = null;

            if(typeof replacement === 'string')
            {
                const template = Real.CreateTemplate();
                Real.Html(template, replacement);
                next = template.content.firstElementChild ?? template.content.firstChild;
            }
            else if(replacement instanceof Node)
            {
                next = replacement;
            }

            if(!next)
            {
                return undefined;
            }

            if(next.parentNode)
            {
                Real.Remove(next);
            }

            target.parentNode.replaceChild(next, target);

            return next;
        }

        static Clear(node: Node): void
        {
            Primitives.Clear(node);
        }

        static Text(node: Text, value: string): void
        {
            Primitives.Text(node, value);
        }

        static Content(node: Node, value: string): void
        {
            Primitives.Content(node, value);
        }

        static Html(element: Element, value: string): void
        {
            Primitives.Html(element, value);
        }

        static AttachShadow(host: Element, init: ShadowRootInit): ShadowRoot
        {
            return Primitives.AttachShadow(host, init);
        }

        static Attribute(element: Element, name: string, value: string | null): void
        {
            Primitives.Attribute(element, name, value);
        }

        static Property(element: Element, name: string, value: unknown): void
        {
            Primitives.Property(element, name, value);
        }

        static Class(element: Element, name: string, enabled: boolean): void
        {
            Primitives.Class(element, name, enabled);
        }

        static Style(element: HTMLElement, name: string, value: string | null): void
        {
            Primitives.Style(element, name, value);
        }

        static CssText(element: HTMLElement, value: string): void
        {
            Primitives.CssText(element, value);
        }

        static NormalizeChildren(items: Reals.Child[]): Node[]
        {
            return items.flatMap(item =>
            {
                if (!item) return [];
                if (item instanceof Node) return [item];
                if (item instanceof Real) return [item.render()];
                if (Real.IsRenderable(item)) return [item.render()];

                if (typeof item === 'string')
                {
                    const template = document.createElement('template');
                    template.innerHTML = item;
                    return Array.from(template.content.childNodes);
                }

                if (typeof item === 'object' && 'Tag' in item)
                {
                    const definition = item as Reals.Definition;
                    const element = Real.Create(definition.Tag ?? 'div');

                    if (definition.Attributes)
                    {
                        for (const [name, value] of Object.entries(definition.Attributes))
                        {
                            Real.Attribute(element, name, value);
                        }
                    }

                    return [element];
                }

                return [];
            });
        }

        /** @name        Namespaces
         *  @public
         *  @static
         *  @readonly
         *  @type        {typeof Core.Namespaces}
         *  @description The Core namespace registry (passthrough to `Core.Namespaces`).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static get Namespaces()
        { return Namespaces.Namespace.Namespaces; }

        /** @name        #AsGetter
         *  @private
         *  @static
         *  @description Coerce a value-or-getter into a getter, so binding methods accept both forms.
         *  @template    T
         *  @param       {(() => T) | T} g Value or getter.
         *  @returns     {(() => T)}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #AsGetter<T>(g: (() => T) | T): (() => T)
        { return typeof g === 'function' ? (g as (() => T)) : () => g; }

        /** @name        #Effect
         *  @private
         *  @memberof    Reals.Real
         *  @param       {() => void} run Reactive effect body.
         *  @returns     {void}
         *  @description Create an Effect and register its disposer in this Real's lifecycle. Every internal
         *               reactive binding and the public `effect()` method use this single ownership path.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #Effect(run: () => void): void
        {
            const instance =
                new Reactivity.Effect(run);

            this.#effects.push
            (
                () =>
                    instance.Dispose()
            );
        }

        /** @name        #ToNodes
         *  @private
         *  @static
         *  @description Normalise a mixed list of child inputs into concrete DOM Nodes.
         *  @param       {(string|Element|ctor|Virtual|def|Real|Node|null)[]} items Mixed child inputs.
         *  @returns     {Node[]}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #ToNodes(items: Reals.Child[]): Node[]
        {
            return Real.NormalizeChildren(items);
        }

        /** @name        constructor
         *  @public
         *  @description Create (or wrap) an Element. When called with `new` and a string tag, the element
         *               is created (and, for a registered Custom tag, upgraded) and auto-assigned an id +
         *               matching class. Other inputs (Element, Real, Virtual, template, `{Tag,…}` def)
         *               are wrapped/materialised. See {@link Real.#init} for the per-input behaviour.
         *  @param       {string|Element|ctor|Virtual|def|Real} arg0 Selector, Element, constructor, Virtual, def, or Real.
         *  @param       {Record<string, unknown> | (new (...a: unknown[]) => Element)=} arg1 Options, or a base class.
         *  @param       {(new (...a: unknown[]) => Element)=} arg2 Base interface (definition form).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        constructor(arg0: string | Element | (new (...a: unknown[]) => Element) |
                        Interfaces.Reals.Renderable |
                        {
                            Tag?: string;
                            Attributes?: Record<string, string>;
                            Style?: Record<string, string>
                        } |
                        Real,
                    arg1?: Record<string, unknown> |
                        (new (...a: unknown[]) => Element),
                    arg2?: new (...a: unknown[]) => Element)
        {
            this.#mode       = new.target !== undefined;
            this.#el         = Real.Create('div');
            this.#descriptor = false;
            this.#value      = this;
            this.#init(arg0, arg1, arg2);

            // Auto-assign the instance id ONLY. `Real-Instance-N` is an IDENTIFIER,
            // not a class: the class of a type is the constructor name, written by
            // the upgrade so that the stylesheet Define compiles (`.MyCtor { … }`)
            // actually matches. The previous form here was
            //     this.#el.setAttribute('class', autoId);
            // which REPLACES the whole class attribute and therefore wiped the type
            // class on every `new Real(tag)` — the element upgraded correctly but
            // rendered unstyled, with no error anywhere. Never write `class` here.
            if (this.#mode)
            {
                Real.Instances.push(this);
                if (!this.#el.id)
                {
                    this.#el.id = `Real-Instance-${Real.Instances.length}`;
                }
            }
        }

        /** @name        #init
         *  @private
         *  @description Resolve the constructor arguments into `#el`/`#descriptor`/`#value`. Non-`new` (call)
         *               mode is a lookup/registration helper; `new` mode actually creates or wraps the element.
         *               For a registered Custom string tag it delegates to `Core.Create`, which runs the namespace
         *               Update synchronously (prototype splice + one-shot post-upgrade hook), so the returned element is live and
         *               upgraded — not a bare, un-upgraded node.
         *  @param       {string|Element|ctor|Virtual|def|Real} arg0 The primary input.
         *  @param       {Record<string, unknown> | (new (...a: unknown[]) => Element)=} arg1 Options, or a base class.
         *  @param       {(new (...a: unknown[]) => Element)=} arg2 Base interface (definition form).
         *  @returns     {void}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #init(arg0: string | Element | (new (...a: unknown[]) => Element) | Interfaces.Reals.Renderable | { Tag?: string; Attributes?: Record<string, string>; Style?: Record<string, string> } | Real, arg1?: Record<string, unknown> | (new (...a: unknown[]) => Element), arg2?: new (...a: unknown[]) => Element): void
        {
            if (!this.#mode)
            {
                if (typeof arg0 === 'string')
                {
                    if (arg1 && typeof arg1 === 'function')
                    {
                        Namespaces.Namespace.Define(arg0, arg1 as new () => Element, (arg2 ?? HTMLElement) as new () => Element);
                        this.#value = arg1;
                        return;
                    }

                    const d = Namespaces.Namespace.Resolve(arg0);
                    if (d)
                    {
                        this.#descriptor = d;
                        this.#value      = d.Constructor ?? d.Interface;
                        return;
                    }

                    const el = document.querySelector(arg0);
                    if (el)
                    {
                        this.#el         = el;
                        this.#descriptor = Namespaces.Namespace.Resolve(el);
                        this.#value      = new Real(el);
                    }
                    return;
                }

                if (typeof arg0 === 'function')
                {
                    const d = Namespaces.Namespace.Resolve(arg0 as new () => Element);
                    if (d) { this.#descriptor = d; this.#value = d.Interface ?? arg0; }
                    return;
                }

                if (arg0 instanceof Element)
                {
                    this.#el         = arg0;
                    this.#descriptor = Namespaces.Namespace.Resolve(arg0);
                    this.#value      = new Real(arg0);
                    this.#mode       = true;
                    return;
                }
                return;
            }

            if (typeof arg0 === 'string')
            {
                // Single line: d.Namespace.Create() (direct on the descriptor) — handles
                // every case (CLASS via Reflect.construct, FUNCTION via createElement
                // + Update, plain native tags). Real has no upgrade logic of its
                // own; it asks Core to create an UPGRADED element. For a registered
                // Custom tag Core.Create runs the namespace Update synchronously —
                // splicing the user subclass into the prototype chain and calling
                // constructor/body initialization — so `new Real('case-4b')` / `new Component(tag).Real`
                // produce a live, built element (not a bare, un-upgraded one).
                const d = Namespaces.Namespace.Resolve(arg0);

                this.#el = Real.Create(arg0);

                if (d) this.#descriptor = d;
            }
            else if (arg0 instanceof Element)     { this.#el = arg0; this.#descriptor = Namespaces.Namespace.Resolve(arg0); }
            else if (arg0 instanceof Real)        { this.#el = arg0.render(); }
            else if (Real.IsRenderable(arg0)) { this.#el = arg0.render(); }
            else if (typeof arg0 === 'object' && 'Tag' in (arg0 as object))
            {
                const def = arg0 as { Tag?: string; Attributes?: Record<string, string>; Style?: Record<string, string> };
                this.#el = Real.Create(def.Tag ?? 'div');
                if (def.Attributes)
                    for (const [k, v] of Object.entries(def.Attributes)) Real.Attribute(this.#el, k, v);
            }

            if (arg1 && typeof arg1 === 'object' && typeof arg1 !== 'function')
            {
                const opts = arg1 as Record<string, unknown>;
                if (opts.id) this.#el.id = String(opts.id);
                if (opts.class || opts.className)
                    Real.Attribute(this.#el, 'class', String(opts.class ?? opts.className));
            }
        }

        /** @name        render
         *  @public
         *  @description The underlying live Element.
         *  @returns     {Element}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        render(): Element { return this.#el; }
        /** @name        valueOf
         *  @public
         *  @description Coercion hook — returns the underlying Element (so `el == real` etc. work).
         *  @returns     {Element}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        valueOf(): Element { return this.#el; }
        /** @name        log
         *  @public
         *  @description `console.log` the given value (or the element) and return `this`.
         *  @param       {unknown=} v Value to log.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        log(v?: unknown): this { console.log(v ?? this.#el); return this; }

        /** @name        on
         *  @public
         *  @description Add an event listener (`addEventListener`).
         *  @param       {string} type Event type.
         *  @param       {EventListener} cb Handler.
         *  @param       {AddEventListenerOptions | boolean=} opts Options.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        on(type: string, cb: EventListener, opts?: AddEventListenerOptions | boolean): this
        { Events.Event.On(this.#el, type, cb, typeof opts === 'boolean' ? { capture: opts } : opts); return this; }
        /** @name        off
         *  @public
         *  @description Remove an event listener (`removeEventListener`).
         *  @param       {string} type Event type.
         *  @param       {EventListener} cb Handler.
         *  @param       {EventListenerOptions | boolean=} opts Options.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        off(type: string, cb: EventListener, opts?: EventListenerOptions | boolean): this
        { void opts; Events.Event.Off(this.#el, type, cb); return this; }
        /** @name        fire
         *  @public
         *  @description Dispatch an Event, or a CustomEvent built from a string name + init.
         *  @param       {Event | string} event Event or name.
         *  @param       {CustomEventInit=} init Init for the string form.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        fire(event: Event | string, init?: CustomEventInit): this { this.#el.dispatchEvent(typeof event === 'string' ? new CustomEvent(event, init) : event); return this; }

        /** @name        append
         *  @public
         *  @description Append THIS element as a child of `parent` (selector / Element / Real / Virtual).
         *  @param       {string | Element | Real | Interfaces.Reals.Renderable | null} parent The parent.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        append(parent: string | Element | Real | Interfaces.Reals.Renderable | null): this
        {
            const p = typeof parent === 'string' ? document.querySelector(parent)
                : parent instanceof Real         ? parent.render()
                    : Real.IsRenderable(parent) ? parent.render()
                        : parent;
            if (p) Real.Append(p, this.#el);
            return this;
        }

        /** @name        add
         *  @public
         *  @description Insert children at an index (trailing number = index; default = end). Mixed inputs are
         *               normalised via {@link Real.#ToNodes}.
         *  @param       {(string|Element|ctor|Virtual|def|Real|Node|null | number)[]} args Child inputs, optional trailing index.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        add(...args: ((string | Element | (new (...a: unknown[]) => Element) | Interfaces.Reals.Renderable | { Tag?: string; Attributes?: Record<string, string>; Style?: Record<string, string> } | Real | Node | null) | number)[]): this
        {
            const last  = args[args.length - 1];
            const items = (typeof last === 'number' ? args.slice(0, -1) : args) as (string | Element | (new (...a: unknown[]) => Element) | Interfaces.Reals.Renderable | { Tag?: string; Attributes?: Record<string, string>; Style?: Record<string, string> } | Real | Node | null)[];
            const index = typeof last === 'number' ? last : this.#el.childNodes.length;
            const nodes = Real.#ToNodes(items);
            const frag  = Real.CreateFragment();
            nodes.forEach(n => Real.Append(frag, n));
            Real.Insert(this.#el, frag, index);
            return this;
        }

        /** @name        push
         *  @public
         *  @description Append children to the end (alias of {@link Real#add} with no index).
         *  @param       {...(string|Element|ctor|Virtual|def|Real|Node|null)} nodes Children.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        push(...nodes: (string | Element | (new (...a: unknown[]) => Element) | Interfaces.Reals.Renderable | { Tag?: string; Attributes?: Record<string, string>; Style?: Record<string, string> } | Real | Node | null)[]): this { return this.add(...nodes); }
        /** @name        unshift
         *  @public
         *  @description Prepend children to the start (alias of {@link Real#add} at index 0).
         *  @param       {...(string|Element|ctor|Virtual|def|Real|Node|null)} nodes Children.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        unshift(...nodes: (string | Element | (new (...a: unknown[]) => Element) | Interfaces.Reals.Renderable | { Tag?: string; Attributes?: Record<string, string>; Style?: Record<string, string> } | Real | Node | null)[]): this { return this.add(...nodes, 0); }

        /** @name        remove
         *  @public
         *  @description Remove specific children by index, selector, Real, or Node.
         *  @param       {(string | Node | Real | number)[]} targets Children to remove.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        remove(...targets: (string | Node | Real | number)[]): this
        {
            for (const t of targets)
            {
                let node: Node | null = null;
                if      (typeof t === 'number') node = this.#el.childNodes[t] ?? null;
                else if (typeof t === 'string') node = this.#el.querySelector(t);
                else if (t instanceof Real)     node = t.render();
                else if (t instanceof Node)     node = t;
                if (node && this.#el.contains(node)) Real.Remove(node);
            }
            return this;
        }

        /** @name        shift
         *  @public
         *  @description Remove `n` children from the front (default 1).
         *  @param       {number} [n=1] Count.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        shift(n = 1): this { for (let i = 0; i < n && this.#el.firstChild; i++) Real.Remove(this.#el.firstChild); return this; }
        /** @name        pop
         *  @public
         *  @description Remove `n` children from the end (default 1).
         *  @param       {number} [n=1] Count.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        pop(n = 1): this { for (let i = 0; i < n && this.#el.lastChild; i++) Real.Remove(this.#el.lastChild); return this; }

        /** @name        get
         *  @public
         *  @description Read an attribute or property by name (case-insensitive). Supports a dotted path
         *               (e.g. `"dataset.id"`). Returns the value as a string, or `undefined` when absent.
         *  @param       {string} name Attribute/property name or dotted path.
         *  @returns     {string | undefined}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        get(name: string): string | undefined
        {
            if (name.indexOf('.') !== -1)
            {
                let cur: unknown = this.#el;
                for (const p of name.split('.'))
                {
                    if (cur == null) return undefined;
                    cur = (cur as Record<string, unknown>)[p];
                }
                return cur === undefined ? undefined : (typeof cur === 'string' ? cur : String(cur));
            }

            const u = name.toUpperCase();
            for (let i = 0; i < this.#el.attributes.length; i++)
            {
                const a = this.#el.attributes.item(i)!;
                if (a.name.toUpperCase() === u) return a.value;
            }

            const rec = this.#el as unknown as Record<string, unknown>;
            for (const k of Object.keys(rec)) if (k.toUpperCase() === u) return String(rec[k]);
            return undefined;
        }

        /** @name        set
         *  @public
         *  @description Set an attribute or property (smart routing, case-insensitive): an existing attribute →
         *               `setAttribute`; else an existing property → assign; else `setAttribute(name.toLowerCase(), …)`.
         *               Dotted paths (e.g. `"dataset.id"`) traverse/create nested objects inline.
         *  @param       {string} name Attribute/property name or dotted path.
         *  @param       {unknown} value The value to set.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        set(name: string, value: unknown): this
        {
            if (name.indexOf('.') !== -1)
            {
                const parts = name.split('.');
                let cur = this.#el as unknown as Record<string, unknown>;
                for (let i = 0; i < parts.length - 1; i++)
                {
                    const k  = parts[i];
                    const nx = cur[k];
                    if (nx == null || typeof nx !== 'object')
                    {
                        if (nx === undefined) { const o: Record<string, unknown> = {}; cur[k] = o; cur = o; continue; }
                        return this;
                    }
                    cur = nx as Record<string, unknown>;
                }
                cur[parts[parts.length - 1]] = value;
                return this;
            }

            const u = name.toUpperCase();
            for (let i = 0; i < this.#el.attributes.length; i++)
            {
                const a = this.#el.attributes.item(i)!;
                if (a.name.toUpperCase() === u) { Real.Attribute(this.#el, a.name, String(value)); return this; }
            }

            const rec = this.#el as unknown as Record<string, unknown>;
            for (const k of Object.keys(rec)) if (k.toUpperCase() === u) { rec[k] = value; return this; }

            Real.Attribute(this.#el, name.toLowerCase(), String(value));
            return this;
        }

        /** @name        #read
         *  @private
         *  @description Read the raw value at a dotted path from the element (no stringification —
         *               unlike `get`, so nested objects like `style` come back as objects).
         *  @param       {string} path Dotted path.
         *  @returns     {unknown}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #read(path: string): unknown
        {
            let c: unknown = this.#el;
            for (const k of path.split('.')) { if (c == null) return undefined; c = (c as Record<string, unknown>)[k]; }
            return c;
        }

        /** @name        #write
         *  @private
         *  @description Write a value at a dotted path on the element, creating intermediate plain
         *               objects as needed; aborts on a non-object, non-undefined intermediate.
         *  @param       {string} path Dotted path.
         *  @param       {unknown} value Value to write.
         *  @returns     {void}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #write(path: string, value: unknown): void
        {
            const ps = path.split('.');
            let c = this.#el as unknown as Record<string, unknown>;
            for (let i = 0; i < ps.length - 1; i++)
            {
                const k = ps[i], nx = c[k];
                if (nx == null || typeof nx !== 'object') { if (nx === undefined) { const o: Record<string, unknown> = {}; c[k] = o; c = o; continue; } return; }
                c = nx as Record<string, unknown>;
            }
            c[ps[ps.length - 1]] = value;
        }

        /** @name        #sub
         *  @private
         *  @description Build the fluent nested accessor bound to `base` (chains via `set`/`sub`,
         *               reads raw via `get`/`unwrap`, returns to the Real via `end`). Fully internal:
         *               its shape is inferred, so no accessor type or class is exposed.
         *  @param       {string} base Current dotted base.
         *  @returns     {object} The fluent accessor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        #sub(base: string)
        {
            const self = this;
            return {
                set(key: string, value: unknown) { self.#write(`${base}.${key}`, value); return self.#sub(base); },
                get(key: string)                 { return self.#read(`${base}.${key}`); },
                sub(key: string)                 { return self.#sub(`${base}.${key}`); },
                unwrap()                         { return self.#read(base); },
                end<T = unknown>(): T            { return self as unknown as T; },
            };
        }

        /** @name        sub
         *  @public
         *  @description Returns a fluent sub-property accessor for a nested object on this element:
         *
         *                 new Real('div').sub('style').set('background', 'orange').set('color', 'white');
         *                 new Real('div').sub('style').get('background');     // 'orange'
         *                 new Real('div').sub('style').sub('transform');      // further nesting
         *
         *               The returned object exposes `.set(key, value)`, `.get(key)`, `.sub(key)`,
         *               `.unwrap()` (the underlying object) and `.end()` (back to the Real). The
         *               accessor is built under-the-hood by `#sub` — no exposed accessor type/class.
         *  @param       {string} path Dotted path to the nested object.
         *  @returns     {object} A fluent nested accessor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        sub(path: string)
        { return this.#sub(path); }

        /** @name        show
         *  @public
         *  @description Show the element (`display = ''`).
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        show(): this { Real.Style(this.#el as HTMLElement, 'display', ''); return this; }
        /** @name        hide
         *  @public
         *  @description Hide the element (`display = 'none'`).
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        hide(): this { Real.Style(this.#el as HTMLElement, 'display', 'none'); return this; }

        /** @name        contains
         *  @public
         *  @description True if ALL given nodes (Node / Real / selector) are descendants of this element.
         *  @param       {(Node | Real | string)[]} nodes The nodes to test.
         *  @returns     {boolean}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        contains(...nodes: (Node | Real | string)[]): boolean
        {
            for (const n of nodes)
            {
                const el = typeof n === 'string' ? this.#el.querySelector(n) : n instanceof Real ? n.render() : n;
                if (!el || !this.#el.contains(el)) return false;
            }
            return true;
        }

        /** @name        child
         *  @public
         *  @description Walk a path of child indices: `child([0,2,1])` → `childNodes[0].childNodes[2].childNodes[1]`.
         *  @param       {number[]} path Child indices.
         *  @returns     {Node}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        child(path: number[]): Node { let n: Node = this.#el; for (const i of path) n = n.childNodes[i]!; return n; }
        /** @name        shadow
         *  @public
         *  @memberof    Real
         *  @param       {Shadows.ShadowMode} [mode='open'] Shadow root mode — `'open'` or `'closed'`.
         *  @param       {Shadows.AriannaShadowOptions} [options={}] Backend + projection options (light / iframe).
         *  @returns     {Shadows.AriannaShadow} The attached AriannaShadow for this element.
         *  @description Attach a shadow DOM to this Real's element via the Shadow service. Delegates to
         *               `AttachAriannaShadow`, which is idempotent (returns the existing shadow if one is already
         *               attached). Use this to give the element an encapsulated shadow root — distinct from CSS
         *               `box-shadow`. Populate it afterwards through the returned AriannaShadow's contract.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        shadow(mode: Types.Shadow.Mode = 'open', options: Interfaces.Shadow.Options = {}): Interfaces.Shadow.Runtime
        {
            const service = Services.Resolve<Interfaces.Shadow.Service>('shadow');
            if (!service) throw new Error('[arianna] Shadow service is not registered.');
            return service.Create(this.#el, { ...options, Mode: mode });
        }

        /** @name        signal
         *  @public
         *  @memberof    Reals.Real
         *  @template    T
         *  @param       {T} value Initial value.
         *  @returns     {Signal<T>} A writable reactive Signal.
         *  @description Create a writable Signal associated with this Real's reactive workflow. The Signal is
         *               returned directly because it is the value produced by the operation; effects created
         *               through `effect()` remain owned and disposed by this Real.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        signal<T>(value: T): Signal<T>
        {
            return new Reactivity.Signal(value);
        }

        /** @name        mono
         *  @public
         *  @memberof    Reals.Real
         *  @template    T
         *  @param       {T} value Initial value.
         *  @returns     {SignalMono<T>} An allocation-light monomorphic Signal.
         *  @description Create a monomorphic reactive value for hot paths associated with this Real instance.
         *               The created primitive is returned directly because it is the operation's result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        mono<T>(value: T): SignalMono<T>
        {
            return new Reactivity.Mono(value);
        }

        /** @name        effect
         *  @public
         *  @memberof    Reals.Real
         *  @param       {() => void} fn Reactive effect body.
         *  @returns     {this} This Real.
         *  @description Create a reactive Effect and bind its disposer to this Real's lifecycle. Destroying the
         *               Real disposes every Effect created through this method.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        effect(fn: () => void): this
        {
            this.#Effect(fn);

            return this;
        }

        /** @name        computed
         *  @public
         *  @memberof    Reals.Real
         *  @template    T
         *  @param       {() => T} fn Reactive derivation.
         *  @returns     {ReadonlySignal<T>} A memoised read-only reactive value.
         *  @description Create a memoised derivation through Reactivity. The computed value is returned directly;
         *               its dependencies and invalidation are owned by the Reactivity runtime.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        computed<T>(fn: () => T): ReadonlySignal<T>
        {
            return new Reactivity.Memo(fn);
        }

        /** @name        text
         *  @public
         *  @description Append a reactive text node bound to `getter` (or a static string). Re-runs on signal change.
         *  @param       {(() => string) | string} getter The text source.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        text(getter: (() => string) | string): this
        {
            const g = Real.#AsGetter(getter);
            const node = Real.CreateText(g());
            Real.Append(this.#el, node);
            this.#Effect
            (
                () =>
                {
                    Real.Text(node, g());
                }
            );
            return this;
        }

        /** @name        textMono
         *  @public
         *  @description Bind a {@link SignalMono} to a Text node via the zero-alloc `sinkText` fast path (creating the node if omitted).
         *  @param       {SignalMono<string>} s The mono signal.
         *  @param       {Text=} node Optional existing text node.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        textMono(s : Reactivity.Mono<string>, node?: Text): this
        {
            node ??= Real.CreateText('');

            if (!node.parentNode)
            {
                Real.Append(this.#el, node);
            }

            return s.BindText(node), this;
        }

        /** @name        attr
         *  @public
         *  @description Reactively bind an attribute; `null` removes it. Re-runs on signal change.
         *  @param       {string} name Attribute name.
         *  @param       {(() => string | null) | string | null} getter The value source.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        attr(name: string, getter: (() => string | null) | string | null): this
        {
            const g  = Real.#AsGetter(getter);
            const el = this.#el;
            this.#Effect
            (
                () =>
                {
                    const value = g();

                    if(value === null)
                    {
                        Real.Attribute(el, name, null);
                    }
                    else
                    {
                        Real.Attribute(el, name, value);
                    }
                }
            );
            return this;
        }

        /** @name        cls
         *  @public
         *  @description Reactively toggle a class on/off from a boolean getter.
         *  @param       {string} name Class name.
         *  @param       {(() => boolean) | boolean} getter The boolean source.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        cls(name: string, getter: (() => boolean) | boolean): this
        {
            const g  = Real.#AsGetter(getter);
            const el = this.#el;
            this.#Effect
            (
                () =>
                {
                    Real.Class(el, name, g());
                }
            );
            return this;
        }

        /** @name        clsMono
         *  @public
         *  @description Return a plain toggler `(on: boolean) => void` for a class — no effect, no tracking.
         *  @param       {string} name Class name.
         *  @returns     {(v: boolean) => void}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        clsMono(name: string): (v: boolean) => void
        {
            const el = this.#el;
            return (v: boolean) => { Real.Class(el, name, v); };
        }

        /** @name        prop
         *  @public
         *  @description Reactively assign a JS property on the element from `getter`.
         *  @param       {string} name Property name.
         *  @param       {(() => unknown) | unknown} getter The value source.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        prop(name: string, getter: (() => unknown) | unknown): this
        {
            const g   = Real.#AsGetter(getter);
            const rec = this.#el as unknown as Record<string, unknown>;
            this.#Effect
            (
                () =>
                {
                    rec[name] = g();
                }
            );
            return this;
        }

        /** @name        style
         *  @public
         *  @description Reactively set one inline style property (camelCase accepted, normalised to kebab-case).
         *  @param       {string} prop Style property.
         *  @param       {(() => string) | string} getter The value source.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        style(prop: string, getter: (() => string) | string): this
        {
            const g       = Real.#AsGetter(getter);
            const el      = this.#el as HTMLElement;
            const cssProp = prop.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
            this.#Effect
            (
                () =>
                {
                    Real.Style(el, cssProp, g());
                }
            );
            return this;
        }

        /** @name        bind
         *  @public
         *  @description Two-way bind the element's `value`: reactive read from `getter`, optional write-back on `input`.
         *  @param       {(() => string)} getter The value source.
         *  @param       {(v: string) => void=} setter Optional write-back.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        bind(getter: (() => string), setter?: (v: string) => void): this
        {
            this.prop('value', getter);
            if (setter) this.#el.addEventListener('input', e => setter((e.target as HTMLInputElement).value));
            return this;
        }

        /** @name        destroy
         *  @public
         *  @description Dispose all tracked effects and detach the scoped Sheet. Call when discarding the Real.
         *  @returns     {this}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        destroy(): this
        {
            this.#effects.forEach(s => s());
            this.#effects = [];
            this.Sheet = null;
            return this;
        }

        /** @name        Sheet
         *  @public
         *  @type        {Stylesheet | null}
         *  @description Scoped Sheet for this Real instance (get).
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        get Sheet(): Stylesheet | null { return this.#sheet; }

        /** @name        Sheet
         *  @public
         *  @description Scoped Sheet for this Real instance (set). Assigning a Sheet attaches it to the host
         *               element: each rule's `:root` selector (and `&`) is rewritten to target THIS element via
         *               an auto-generated class (`__real-…`) — or `:host` when a shadow root is present. The
         *               resulting `<style>` is appended to `document.head` (light DOM) or to the shadow root, and
         *               tracked so subsequent `Sheet.Rules.add/remove/…` mutations re-flush automatically.
         *               Assigning `null` removes the installed `<style>` and detaches the Sheet (the Sheet itself
         *               is preserved — only this Real disconnects).
         *
         *                 const button = new Real('div').set('class','Fancy').append(stage);
         *                 button.Sheet = new Stylesheet(new Rule(':root', { background: 'yellow' }));
         *                 button.Sheet.Rules.add(new Rule(':root:hover', { transform: 'scale(1.05)' }));
         *  @param       {Stylesheet | null} next The Sheet to attach, or null to detach.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        set Sheet(next: Stylesheet | null)
        {
            // Detach previous
            if (this.#sheet && this.#sheetSync)                 this.#sheet.off('Sheet-Changed', this.#sheetSync);
            if (this.#styleNode && this.#styleNode.parentNode)  Real.Remove(this.#styleNode);

            this.#styleNode = null;
            this.#sheetSync = null;
            this.#sheet     = next;
            if (!next) return;

            if (!this.#instanceId) this.#instanceId = 'real-' + Math.random().toString(36).slice(2, 10);

            const el        = this.#el;
            const useShadow = !!(el as Element & { shadowRoot?: ShadowRoot | null }).shadowRoot;
            let   replace   : string;
            if (useShadow) replace = ':host';
            else
            {
                const cls = '__' + this.#instanceId;
                Real.Class(el, cls, true);
                replace = '.' + cls;
            }

            const apply = () =>
            {
                if (!this.#sheet) return;
                let css = '';
                for (const r of this.#sheet.Rules)
                {
                    const scoped = r.Text.replace(/(^|,\s*|\s)(:root|&)(?![\w-])/g, (_m, pre: string) => pre + replace);
                    css += scoped + '\n';
                }
                if (!this.#styleNode)
                {
                    this.#styleNode = Real.Create('style') as HTMLStyleElement;
                    Real.Attribute(this.#styleNode, 'data-arianna-sheet', el.tagName.toLowerCase());
                    Real.Attribute(this.#styleNode, 'data-arianna-instance', this.#instanceId);
                    if (useShadow)
                        Real.Append((el as Element & { shadowRoot: ShadowRoot }).shadowRoot, this.#styleNode);
                    else
                        Real.Append(document.head ?? document.documentElement, this.#styleNode);
                }
                Real.Content(this.#styleNode, css);
            };

            apply();
            this.#sheetSync = apply;
            next.on('Sheet-Changed', apply);
        }

        /** @name        #Build
         *  @private @static
         *  @description Pin the constructor name and expose the class on `window`. The bundler renames the local
         *               binding (e.g. `_Real`) to dodge the global, so `constructor.name` / GetPrototypeChain would
         *               report the mangled name — `#Build` forces it back. Runs once at class-eval via the static
         *               block below; uses `this` so it survives any bundler rename.
         *  @returns     {void}
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license)
         */
        static #Build(): void
        {
            try { Object.defineProperty(this, 'name', { value: 'Real', configurable: true }); } catch { /* frozen */ }
            /* Window publication removed by AriannA 2 conventions. */
        }

        static
        {
            this.#Build();
        }

    }

    /** @name        Service
     *  @private
     *  @constant
     *  @memberof    Reals
     *  @type        {Services.Service<ServiceContract>}
     *  @description Registers the canonical Real service. Construction and normalization remain implemented by
     *               `Real`; the service only exposes the structural contract declared in Schema.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const Service = new Services.Service<ServiceContract>
    (
        'real',
        {
            Create(target: Target): Real
            {
                return new Real(target);
            },

            From(target: Target | Real): Real
            {
                return target instanceof Real
                    ? target
                    : new Real(target);
            }
        }
    );
}

export default Reals.Real;
