/**
 * @module schema/Interfaces
 * @description AriannA level-0 structural contracts. Type-only: emits no runtime JavaScript.
 */
import type { Types } from './Types.ts';

/** @name        Interfaces
 *  @public
 *  @type        {namespace}
 *  @description Groups the Interfaces contracts and runtime surface.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Interfaces
{
    /** @name        Core
     *  @public
     *  @type        {namespace}
     *  @description Groups the Core contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Core
    {
        /** @name        TypeOptions
         *  @public
         *  @type        {interface}
         *  @description Structural contract for TypeOptions.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface TypeOptions
        {
            Css?: unknown;
            Attrs?: string[];
            Shadow?: Types.Shadow.Mode | false;
            Bus?: string;
            Render?: Types.DOM.RenderMode;
            Template?: unknown;
            Slot?: Types.DOM.SlotPlacement;
            Component?: boolean;
            [key: string]: unknown;
        }
    }
    /** @name        Services
     *  @public
     *  @type        {namespace}
     *  @description Canonical structural contracts for the Services registry and registered service surfaces.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Services
    {
        /** Canonical structural contract for the `ObserverService` service. */
        export type ObserverService = Observers.Service;

        /** Canonical structural contract for the `EventService` service. */
        export interface EventService
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

        }

        /** Canonical structural contract for the `ReactivityService` service. */
        export interface ReactivityService
        {
            CreateSignal?<T>(value: T, options?: unknown): Reactivity.Signal<T>;
            CreateEffect?(fn: () => void, options?: unknown): unknown;
            CreateReaction?(invalidate: () => void, options?: unknown): { Track(fn: () => void): void; Dispose(): void };
            ReactiveObject?<T extends object>(raw: T, options?: unknown): T;
            ToRaw?<T>(value: T): T;

            /* Compatibility facade names retained for author-facing FULL Reactivity. */
            make?(value: object): object;
            signal?<T>(value: T): { Value: T };
            reactive?<T extends object>(raw: T): T;
            effect?(fn: (onCleanup?: (cb: () => void) => void) => void): unknown;
            computed?<T>(fn: () => T): { readonly Value: T };
        }

        /** Canonical structural contract for the `NamespacesService` service. */
        export interface NamespacesService
        {
            Has(name: string): boolean;
            Resolve(value: unknown): Namespaces.Type | false;
            Create(name: string, descriptor: Partial<Namespaces.Namespace>): Namespaces.Runtime;
            Upgrade(node: Element, descriptor: Namespaces.Type): Element | false;
            FindStandard(name: string): Namespaces.Type | undefined;
        }

        /** Canonical structural contract for the `CssService` service. */
        export interface CssService
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

        }

        /** Canonical structural contract for the `RealService` service. */
        export interface RealService
        {
            create(arg: unknown): object
        }

        /** Canonical structural contract for the `VirtualService` service. */
        export type VirtualService = Virtuals.Service;

        /** Canonical structural contract for the `ShadowService` service. */
        export interface ShadowService
        {

            shadow
            (node: Element, opts:
            { def?: Record<string, unknown>; tag?: string }): void

        }

        /** Canonical structural contract for the `TemplatesService` service. */
        export type TemplatesService = Template.Service;

        /** Canonical State service contract. */
        export type StateService = State.Service;

        /** Canonical structural contract for the `ContextService` service. */
        export type ContextService = Context.Service;

        /** Canonical structural contract for the `DirectivesService` service. */
        export type DirectivesService = Directives.Service;

    }
    /** @name        DOM
     *  @public
     *  @type        {namespace}
     *  @description Groups the DOM contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace DOM
    {
        /** @name        Element
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Element.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Element
        {
            signal<T>
            (
            initial?: T): Components.Binding<T>;
            attributeSignal
            (
            name: string): Reactivity.Signal<string | null>;
            render(): globalThis.Element;
            fire
            (
            event: string | Event,
            init?: CustomEventInit): this;
            Sheet: unknown | null;
            template: unknown;
            onConnected?(): void;
            onDisconnected?(): void;
            onAdopted?(): void;
            onAttributeChanged?
            (
            name: string,
            oldValue: string | null,
            value: string | null): void;
        }
    }
    /** @name        Components
     *  @public
     *  @type        {namespace}
     *  @description Groups the Components contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Components
    {
        /** @name        Binding
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Binding.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Binding<T>
        {
            from(source?: unknown): Binding<T>;
            to(target?: unknown): Binding<T>;
            host(host?: unknown): Binding<T>;
            owner(owner?: unknown): Binding<T>;
            sub(key: string): Binding<T>;
            up(): Binding<T>;
            attribute(name: string): Reactivity.Signal<string | null>;
            value<V = unknown>(): Reactivity.Signal<V>;
        }
        /** @name        ComponentInterface
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ComponentInterface.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ComponentInterface
        {
            (element: globalThis.Element): unknown;
            (selector: string): unknown;
            <T extends abstract new (...arguments_: any[]) => object>
            (
            specification: object):
            (
            target: T,
            context?: ClassDecoratorContext<T>) => T | void;
            <T extends abstract new (...arguments_: any[]) => object>
            (
            tag: string,
            css: unknown,
            definition?: unknown):
            (
            target: T,
            context?: ClassDecoratorContext<T>) => T | void;
            new
            (
            argument: globalThis.Element | string,
            options?: Record<string, unknown>): unknown;
        }
    }
    /** @name        Events
     *  @public
     *  @type        {namespace}
     *  @description Groups the Events contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Events
    {
        /** @name        Target
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Target.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Target = Types.Events.Target;
        /** @name        EventType
         *  @public
         *  @type        {interface}
         *  @description Structural contract for EventType.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface EventType
        {
            Name: string;
            Interface: string;
            Domain: string;
            Category: string;
            State: string;
            Lifecycle?: boolean;
            CE?: string | false;
        }
        /** @name        Broker
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Broker.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Broker
        {
            Name: string;
            Current: Types.Events.Target;
            Previous: Types.Events.Target;
            Next: Types.Events.Target;
        }
        /** @name        EventDescriptor
         *  @public
         *  @type        {interface}
         *  @description Structural contract for EventDescriptor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface EventDescriptor
        {
            Type: string;
            Cancelable?: boolean;
            Propagation?: boolean;
            Detail?: Record<string, unknown>;
            Targets?: Types.Events.Target;
            Path?: string[];
            Broker?: string;
        }
        /** @name        EventTargetDescriptor
         *  @public
         *  @type        {interface}
         *  @description Structural contract for EventTargetDescriptor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface EventTargetDescriptor
        {
            Id: string;
            Listeners: ListenerDescriptor[];
            Node?: EventTarget;
            Parent?: EventTargetDescriptor;
            Brokers?: Record<string, EventTargetDescriptor>;
            Intercepted?: Map<string, EventListener>;
        }
        /** @name        ListenerDescriptor
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ListenerDescriptor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ListenerDescriptor
        {
            UUID: string;
            Type: string;
            Target: EventTarget | string;
            Handler: EventListener;
            Phase: Types.Events.Phase;
            Brokers?: string[];
            Once: boolean;
            Passive: boolean;
            Untrusted: boolean;
            Json: Json;
            XML?: XML;
        }
        /** @name        Json
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Json.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Json
        {
            id: string;
            event: string;
            observer: string;
            target: string;
            handler: string | EventListener;
            phase: Types.Events.Phase;
            brokers?: string[];
            path?: string[];
            propagate: boolean;
            defaultAction: string;
            namespace: string;
        }
        /** @name        XML
         *  @public
         *  @type        {interface}
         *  @description Structural contract for XML.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface XML
        {
            UUID?: string;
            Type?: string;
            Target?: string;
            Handler?: string;
            Phase?: Types.Events.Phase;
            Brokers?: string;
            Once?: boolean;
            Passive?: boolean;
            Untrusted?: boolean;
            [key: string]: unknown;
        }
        /** @name        Service
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Service.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Service
        {
            Fire
            (
            target: Types.Events.Target,
            event: string | EventDescriptor): boolean;
            On
            (
            target: Types.Events.Target,
            types: string,
            handler: EventListener,
            options?: AddEventListenerOptions &
            {
                
                phase?: Types.Events.Phase;
                
                brokers?: string[];
            }): ListenerDescriptor[];
            Off
            (
            target: Types.Events.Target,
            types: string,
            handler: EventListener): void;
            GetInterface(type: string): string | undefined;
            GetCategory(type: string): string | undefined;
            GetState(type: string): string | undefined;
        }
    }
    /** @name        Css
     *  @public
     *  @type        {namespace}
     *  @description Groups the Css contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Css
    {
        /** @name        SelectorInterface
         *  @public
         *  @interface
         *  @memberof    Core.Css.Interfaces
         *  @description Structured object selector, the object form of an @-rule prelude (the Golem Css model).
         *               `Type` is the @-rule keyword (`@media`, `@supports`, `@import`, …); the remaining keys
         *               are rule-specific — `Name` / `Value` for `@charset` & friends, `Media` / `Url` for
         *               `@import`, `Prefix` / `Domain` / `Regex` for `@namespace` & `@document`, and the
         *               `And` / `Or` / `Not` condition trees for `@media` / `@supports`. The index signature
         *               keeps it open for rule-specific extras.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface SelectorInterface
        {
            /** @member      Type
             *  @public
             *  @type        {string}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description The @-rule keyword that names the rule — `@media`, `@supports`, `@import`, `@charset`,
             *               `@namespace`, `@page`, `@document`, `@keyframes`, `@font-face`, … The one required key;
             *               every other field is rule-specific and read according to it.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Type: string;
            /** @member      Name
             *  @public
             *  @type        {string}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description The identifier of a named @-rule — the `@keyframes <Name>`, `@counter-style <Name>`, or
             *               the prefix bound by `@namespace <Name> url(…)`.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name?: string;
            /** @member      Value
             *  @public
             *  @type        {string}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description The literal value of a value-carrying @-rule — the encoding of `@charset "<Value>"` or
             *               the string payload of a simple prelude.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Value?: string;
            /** @member      Media
             *  @public
             *  @type        {string}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description The media query text attached to the prelude — the trailing `screen and (…)` of an
             *               `@import` or the query list of an `@media` given in flat string form.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Media?: string;
            /** @member      Url
             *  @public
             *  @type        {string}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description The target URL of a URL-carrying @-rule — the `url(…)` of an `@import` or an
             *               `@namespace`.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Url?: string;
            /** @member      Prefix
             *  @public
             *  @type        {string}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description The namespace prefix declared by `@namespace <Prefix> url(…)`, bound to the following
             *               URL for prefixed type selectors.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Prefix?: string;
            /** @member      Domain
             *  @public
             *  @type        {string}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description A domain matcher of `@document` — the argument of its `domain(…)` / `url(…)` predicate
             *               that scopes the contained rules to a site.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Domain?: string;
            /** @member      Regex
             *  @public
             *  @type        {string}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description A regexp matcher of `@document` — the argument of its `regexp("…")` predicate that
             *               scopes the contained rules by URL pattern.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Regex?: string;
            /** @member      Right
             *  @public
             *  @type        {boolean}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description Page-box side flag for `@page` — selects the `:right` margin context when the margin
             *               boxes are built.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Right?: boolean;
            /** @member      Left
             *  @public
             *  @type        {boolean}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description Page-box side flag for `@page` — selects the `:left` margin context when the margin
             *               boxes are built.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Left?: boolean;
            /** @member      And
             *  @public
             *  @type        {Record<string, unknown>}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description Conjunction node of a condition tree — the `and (…)` branch of an `@media` / `@supports`
             *               prelude, holding the further feature tests all of which must hold.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            And?: Record<string, unknown>;
            /** @member      Or
             *  @public
             *  @type        {Record<string, unknown>}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description Disjunction node of a condition tree — the `or (…)` branch of an `@media` / `@supports`
             *               prelude, holding the alternative feature tests any of which may hold.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Or?: Record<string, unknown>;
            /** @member      Not
             *  @public
             *  @type        {Record<string, unknown>}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description Negation node of a condition tree — the `not (…)` branch of an `@media` / `@supports`
             *               prelude, holding the single feature test that must not hold.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Not?: Record<string, unknown>;
            /** @member      [key: string]
             *  @public
             *  @type        {unknown}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description Index signature keeping the selector open for rule-specific keys beyond the named ones,
             *               so a novel @-rule prelude can carry its own fields without a type change.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            [key: string]: unknown;
        }
        /** @name        RuleInterface
         *  @public
         *  @interface
         *  @memberof    Core.Css.Interfaces
         *  @description Object-literal rule definition accepted by the Rule constructor. `Selector` is a
         *               selector string or a structured SelectorInterface; the body arrives under any one of
         *               the legacy Golem aliases — `Contents` / `Content` / `Body` / `Rule` — as a CSS string
         *               or a property object; `Rules` holds a nested selector→definition map for grouping
         *               rules. Property keys may be PascalCase (`Width`) or camelCase (`width`); the statics
         *               normalise them.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface RuleInterface
        {
            /** @member      Selector
             *  @public
             *  @type        {string | Interfaces.SelectorInterface}
             *  @memberof    Core.Css.Interfaces.RuleInterface
             *  @description The rule's selector — a plain selector string (`.card`, `#id > a`) or a structured
             *               SelectorInterface for the @-rules, whose `Type` names the keyword and whose remaining
             *               keys carry the prelude. The one required field; every other key holds the body.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Selector: string | SelectorInterface;
            /** @member      Contents
             *  @public
             *  @type        {string | Record<string, unknown>}
             *  @memberof    Core.Css.Interfaces.RuleInterface
             *  @description The rule body, primary form — a raw CSS declaration string or a property object. The
             *               first of the four interchangeable Golem body aliases (`Contents` / `Content` / `Body` /
             *               `Rule`); the statics read whichever one is present.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Contents?: string | Record<string, unknown>;
            /** @member      Content
             *  @public
             *  @type        {string | Record<string, unknown>}
             *  @memberof    Core.Css.Interfaces.RuleInterface
             *  @description The rule body — a Golem alias of `Contents`, accepted for authoring convenience. Same
             *               shape (CSS string or property object) and same treatment; supply only one body key.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Content?: string | Record<string, unknown>;
            /** @member      Body
             *  @public
             *  @type        {string | Record<string, unknown>}
             *  @memberof    Core.Css.Interfaces.RuleInterface
             *  @description The rule body — a Golem alias of `Contents`, accepted for authoring convenience. Same
             *               shape (CSS string or property object) and same treatment; supply only one body key.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Body?: string | Record<string, unknown>;
            /** @member      Rule
             *  @public
             *  @type        {string | Record<string, unknown>}
             *  @memberof    Core.Css.Interfaces.RuleInterface
             *  @description The rule body — a Golem alias of `Contents`, accepted for authoring convenience. Same
             *               shape (CSS string or property object) and same treatment; supply only one body key.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Rule?: string | Record<string, unknown>;
            /** @member      Rules
             *  @public
             *  @type        {Record<string, RuleInterface | Record<string, string>>}
             *  @memberof    Core.Css.Interfaces.RuleInterface
             *  @description Nested child rules for a grouping @-rule (`@media`, `@supports`, `@document`) — a
             *               selector→definition map whose each value is a full RuleInterface or a bare property
             *               object, built into child Rules under this rule.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Rules?: Record<string, RuleInterface | Record<string, string>> | RuleInterface[];
        }
        /** @name        StylesheetObjectInterface
         *  @public
         *  @interface
         *  @memberof    Core.Css.Interfaces
         *  @description Object-map form of a whole stylesheet: each key is a selector, each value its rule —
         *               either a full RuleInterface or a bare property object (format E). Consumed by the
         *               Stylesheet constructor / `parse` to build one Rule per entry.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface StylesheetObjectInterface
        {
            /** @member      [selector]
             *  @public
             *  @type        {RuleInterface | Record<string, string>}
             *  @memberof    Core.Css.Interfaces.StylesheetObjectInterface
             *  @description One entry per rule: the key is the selector, the value is either a full
             *               RuleInterface or a bare property object (format E). An index signature and
             *               nothing else — this interface describes a MAP of rules, not a rule; the
             *               Stylesheet constructor and `parse` walk it with Object.entries and build one
             *               Rule per entry, taking the selector from the key.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            [selector: string]: RuleInterface | Record<string, string>;
        }
        /** @name        RuleLike
         *  @public
         *  @type        {interface}
         *  @description Structural contract for RuleLike.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface RuleLike
        {
            Selector?: unknown;
            Declarations?: Record<string, unknown>;
            cssText?: string;
            [key: string]: unknown;
        }
        /** @name        StylesheetLike
         *  @public
         *  @type        {interface}
         *  @description Structural contract for StylesheetLike.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface StylesheetLike
        {
            Rules?: readonly RuleLike[];
            cssText?: string;
            [key: string]: unknown;
        }
        /** @name        Selector
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Selector.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Selector
        {
            Type: string;
            Name?: string;
            Value?: unknown;
            Media?: unknown;
            Url?: string;
            Prefix?: string;
            Domain?: string;
            Regex?: string;
            And?: unknown;
            Or?: unknown;
            Not?: unknown;
            [key: string]: unknown;
        }
        /** @name        Rule
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Rule
        {
            Selector?: string | Selector;
            Style?: Record<string, unknown>;
            Declarations?: Record<string, unknown>;
            [key: string]: unknown;
        }
        /** @name        StylesheetObject
         *  @public
         *  @type        {interface}
         *  @description Structural contract for StylesheetObject.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface StylesheetObject
        {
            [selector: string]: Record<string, unknown> | Rule | unknown;
        }
        /** @name        Service
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Service.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Service
        {
        }
    }
    /** @name        Reactivity
     *  @public
     *  @type        {namespace}
     *  @description Groups the Reactivity contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Reactivity
    {
        /** @name        ChangeEvent
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ChangeEvent.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ChangeEvent extends Omit<Events.EventDescriptor, 'Path'>
        {
            Type: string;
            Target: object;
            Root: object;
            Path: Types.Reactivity.Path;
            Key: Types.Reactivity.Key;
            Old: unknown;
            New: unknown;
            Kind: Types.Reactivity.ChangeKind;
            Version: number;
            Timestamp: number;
        }
        /** @name        SignalOptions
         *  @public
         *  @type        {interface}
         *  @description Structural contract for SignalOptions.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface SignalOptions<T>
        {
            Name?: string;
            Equals?: Types.Reactivity.Equality<T>;
            /** Compiled/core revision lane. Numeric to keep level-0 contracts runtime-free. */
            Durability?: 0 | 1 | 2 | 3;
        }
        /** @name        EffectOptions
         *  @public
         *  @type        {interface}
         *  @description Structural contract for EffectOptions.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface EffectOptions
        {
            Name?: string;
            Schedule?: Types.Reactivity.Schedule;
            Defer?: boolean;
            Priority?: number;
            OnError?: (error: unknown) => void;
            Signal?: AbortSignal;
        }
        /** @name        WatchOptions
         *  @public
         *  @type        {interface}
         *  @description Structural contract for WatchOptions.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface WatchOptions<T> extends EffectOptions
        {
            Immediate?: boolean;
            Deep?: boolean;
            Equals?: Types.Reactivity.Equality<T>;
        }
        /** @name        ReactiveOptions
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ReactiveOptions.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ReactiveOptions
        {
            Name?: string;
            Shallow?: boolean;
            Readonly?: boolean;
            Events?: boolean;
        }

        /** Direct imperative Array mutation sink used by compiled lists. */
        export type ArraySink =
        (
            operation   : Types.Reactivity.ArrayOperation,
            index       : number,
            deleteCount : number,
            added       : readonly unknown[],
            removed     : readonly unknown[]
        ) => void;
        /** @name        ResourceOptions
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ResourceOptions.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ResourceOptions<T>
        {
            Name?: string;
            Initial?: T;
            Immediate?: boolean;
            KeepPrevious?: boolean;
            Schedule?: Types.Reactivity.Schedule;
            OnError?: (error: unknown) => void;
        }
        /** @name        ReadonlySignal
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ReadonlySignal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ReadonlySignal<T>
        {
            readonly Name: string;
            readonly Value: T;
            Get(): T;
            Peek(): T;
            Subscribe
            (
            handler: (value: T, previous: T) => void,
            options?: EffectOptions): Types.Reactivity.Stop;
        }
        /** @name        Signal
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Signal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Signal<T> extends ReadonlySignal<T>
        {
            Value: T;
            Set
            (
            value: T | ((previous: T) => T)): T;
            Update
            (
            updater: (previous: T) => T): T;
            Touch(): void;
            Readonly(): ReadonlySignal<T>;
        }
        /** @name        Memo
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Memo.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Memo<T> extends ReadonlySignal<T>
        {
            readonly Dirty: boolean;
            Recompute(): T;
        }
        /** @name        Resource
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Resource.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Resource<T, S = unknown>
        {
            readonly Name: string;
            readonly Value: T | undefined;
            readonly Latest: T | undefined;
            readonly Error: unknown;
            readonly Loading: boolean;
            readonly State: Types.Reactivity.ResourceState;
            readonly Source: S | undefined;
            readonly Promise: Promise<T> | null;
            readonly Controller: AbortController | null;
            Refetch(source?: S): Promise<T | undefined>;
            Mutate
            (
            value: T | ((previous: T | undefined) => T)): T;
            Abort(reason?: unknown): void;
            Clear(): void;
            Dispose(): void;
        }
        /** @name        Selector
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Selector.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Selector<T, K = T>
        {
            (key: K): boolean;
            readonly Value: T;
        }
        /** @name        Reaction
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Reaction.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Reaction
        {
            readonly Active: boolean;
            Track(read: () => void): void;
            Dispose(): void;
        }
        /** @name        Snapshot
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Snapshot.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Snapshot
        {
            readonly Effects: number;
            readonly Signals: number;
            readonly Proxies: number;
            readonly Scheduled: number;
            readonly BatchDepth: number;
            readonly Version: number;
        }
        /** @name        Owner
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Owner.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Owner
        {
            Parent: Owner | null;
            Owned: Set<Computation>;
            Cleanups: Types.Reactivity.Cleanup[];
            Context: Map<unknown, unknown> | null;
            Disposed: boolean;
            Name: string;
        }
        /** @name        SignalSource
         *  @public
         *  @type        {interface}
         *  @description Shared dependency-source contract implemented by scalar Signal storage and Proxy property/index slots.
         *               The source owns subscription and propagation only; scheduling, ownership, cleanup, transactions
         *               and event semantics remain responsibilities of higher layers.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface SignalSource
        {
            Subscribe(subscriber: Computation): void;
            Unsubscribe(subscriber: Computation): void;
            Has(subscriber: Computation): boolean;
            readonly Size: number;
            Notify(): void;
        }
        /** @name        Computation
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Computation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Computation extends Owner
        {
            Id: number;
            Fn: () => unknown;
            Dependencies: Types.Reactivity.Dependency[];
            Active: boolean;
            Running: boolean;
            Pending: boolean;
            Paused: boolean;
            Schedule: Types.Reactivity.Schedule;
            Priority: number;
            OnError?: (error: unknown) => void;
            Run(): void;
            Notify(): void;
            Dispose(): void;
        }
        /** @name        ProxyMeta
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ProxyMeta.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ProxyMeta
        {
            Root: object;
            Path: Types.Reactivity.Path;
            Shallow: boolean;
            Readonly: boolean;
            Emit?: (event: ChangeEvent) => void;
        }
        /** @name        TransactionEntry
         *  @public
         *  @type        {interface}
         *  @description Structural contract for TransactionEntry.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface TransactionEntry
        {
            Target: object;
            Key: Types.Reactivity.Key;
            Had: boolean;
            Old: unknown;
        }
    }
    /** @name        State
     *  @public
     *  @type        {namespace}
     *  @description Groups the State contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace State
    {
        /** @name        Options
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Options.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Options
        {
            Name?: string;
            HistoryLimit?: number;
        }
        /** @name        HistoryEntry
         *  @public
         *  @type        {interface}
         *  @description Structural contract for HistoryEntry.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface HistoryEntry<T>
        {
            Kind: Types.State.HistoryKind;
            Previous: T | undefined;
            Value: T;
            Snapshot?: string;
            Timestamp: number;
        }
        /** @name        Snapshot
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Snapshot.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Snapshot<T>
        {
            Name: string;
            Value: T;
            Timestamp: number;
        }
        /** @name        ChangeEvent
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ChangeEvent.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ChangeEvent<T>
        {
            Type: 'State-Changed';
            Name: string;
            Previous: T;
            Value: T;
            Kind: Types.State.HistoryKind;
            Snapshot?: string;
            Timestamp: number;
        }
        /** @name        Serializer
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Serializer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Serializer
        {
            readonly Format: Types.State.Format;
            Serialize
            (
            value: unknown,
            pretty?: boolean): string;
            Deserialize<T>(source: string): T;
        }
        /** @name        WorkerMessageBuilder
         *  @public
         *  @type        {interface}
         *  @description Structural contract for WorkerMessageBuilder.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface WorkerMessageBuilder
        {
            With(payload: unknown): WorkerMessageBuilder;
            Post(): void;
        }
        /** @name        WorkerBridge
         *  @public
         *  @type        {interface}
         *  @description Structural contract for WorkerBridge.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface WorkerBridge
        {
            Send(name: string): WorkerMessageBuilder;
        }
        /** @name        Service
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Service.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Service
        {
            Create<T>
            (
            source: T,
            options?: Options): unknown;
            Parse<T>
            (
            source: string, format?: Types.State.Format,
            options?: Options): unknown;
            RegisterSerializer(serializer: Serializer): Service;
        }
    }
    /** @name        Template
     *  @public
     *  @type        {namespace}
     *  @description Groups the Template contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Template
    {
        /** @name        Binding
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Binding.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Binding
        {
            Kind: Types.Template.BindingKind;
            Path: readonly number[];
            Name?: string;
            Expression: string;
        }
        /** @name        Scope
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Scope.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Scope
        {
            [key: string]: unknown;
        }
        /** @name        Options
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Options.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Options
        {
            Owner?: object;
        }
        /** @name        Mount
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Mount.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Mount
        {
            Nodes: readonly Node[];
            Dispose: () => void;
        }
        /** @name        Service
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Service.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Service
        {
            Compile(source: string): unknown;
            Html(strings: TemplateStringsArray, ...values: unknown[]): unknown;
            Css(strings: TemplateStringsArray, ...values: unknown[]): unknown;
        }
    }
    /** @name        Shadow
     *  @public
     *  @type        {namespace}
     *  @description Groups the Shadow contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Shadow
    {
        /** @name        Options
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Options.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Options
        {
            Mode?: Types.Shadow.Mode;
            Backend?: Types.Shadow.Backend;
            DelegatesFocus?: boolean;
            Projection?: Types.Shadow.Projection;
            Sandbox?: string;
            Src?: string | URL;
            CSP?: string;
            TargetOrigin?: string;
        }
        /** @name        Root
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Root.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Root
        {
            Root: ShadowRoot | Element | Document;
            Iframe: HTMLIFrameElement | null;
        }
        /** Runtime structural contract for an AriannA Shadow instance. */
        export interface Runtime
        {
            readonly Host: Element;
            readonly Root: ShadowRoot | Element | Document;
            readonly Backend: Types.Shadow.Backend;
            Template(template: import('../dom/Template.ts').Templates.Template, scope?: import('../dom/Template.ts').Templates.Scope): this;
            Css(css: string | CSSStyleSheet): this;
            Slot(name?: string): readonly Node[];
            Send(message: unknown, timeoutMs?: number): Promise<unknown>;
            Dispose(): void;
        }

        /** @name        Service
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Service.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Service
        {
            Create
            (
            host: Element,
            options?: Options): Runtime;
        }
    }
    /** @name        Directives
     *  @public
     *  @type        {namespace}
     *  @description Groups the Directives contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Directives
    {
        /** @name        CustomDirectiveHooks
         *  @public
         *  @type        {interface}
         *  @description Structural contract for CustomDirectiveHooks.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface CustomDirectiveHooks
        {
            mounted?(element: Element, value?: unknown): void;
            unmounted?(element: Element): void;
        }
        /** @name        ComponentMeta
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ComponentMeta.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ComponentMeta
        {
            tag: string;
            template?: unknown;
            style?: unknown;
            shadow?: Types.Shadow.Mode | boolean;
            attrs?: string[];
            [key: string]: unknown;
        }
        /** @name        Source
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Source.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Source<T> = T | (() => T) |
        {
            Get(): T;
        };
        /** @name        Renderer
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Renderer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Renderer<T>
        {
            (item: T, index: number): Node | string;
        }
        /** @name        Options
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Options.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Options
        {
            Scope?: Record<string, unknown>;
        }
        /** @name        Service
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Service.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Service
        {
            Attribute
            (
                element : Element,
                name    : string,
                value   : unknown
            ): void;

            Create
            (
            name: string,
            apply: (element: Element, value: unknown, options?: Options) => () => void): unknown;
            Bootstrap
            (
            root?: ParentNode,
            options?: Options): () => void;
        }
    }
    /** @name        Observers
     *  @public
     *  @type        {namespace}
     *  @description Groups the Observers contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Observers
    {
        /** @name        Service
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Service.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Service
        {
            Create
            (
            callback?: MutationCallback,
            configuration?: Partial<MutationObserverInit>,
            element?: Node): unknown;
            DrainAll(): void;
        }
    }
    /** @name        Namespaces
     *  @public
     *  @type        {namespace}
     *  @description Groups the Namespaces contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Namespaces
    {
        /** Runtime structural contract for a materialized Namespace instance. */
        export interface Runtime
        {
            Name: string;
            Types:
            {
                Standard:
                {
                    Interfaces: Map<string, Type>;
                    Tags: Map<string, Type>;
                };
                Custom:
                {
                    Interfaces: Map<string, Type>;
                    Tags: Map<string, Type>;
                };
            };
            Upgrade(node: Element, descriptor?: Type): Element | false;
        }

        /** URL definitions/spec (in html coincide con Uri) */
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
            Name: string;
            /** @name        Uri
             *  @public
             *  @type        {string}
             *  @description URI used by `createElementNS` (e.g.
             *               'http://www.w3.org/2000/svg').
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Uri: string;
            /** @name        NS
             *  @public
             *  @type        {boolean}
             *  @description Namespaced flag: `true` → `createElementNS(Uri, tag)`,
             *               `false` → `createElement` (html).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            NS: boolean;
            /** @name        Base
             *  @public
             *  @type        {(new (...args: unknown[]) => Element) | null}
             *  @description Native base constructor (HTMLElement, SVGElement,
             *               MathMLElement, …); `null` when none applies.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Base: (new (...args: unknown[]) => Element) | null;
            /** @name        Schema
             *  @public
             *  @type        {string}
             *  @description Schema/spec URL (coincides with `Uri` for html).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Schema: string;
            /** @name        Documentation
             *  @public
             *  @type        {{ w3c: string }}
             *  @description Reference documentation links for the namespace.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Documentation:
            {
                w3c: string;
            };
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
            Types:
            {
                /** @name        Standard
                 *  @public
                 *  @namespace   Descriptor
                 *  @memberOf    Namespace
                 *  @type        {{ Interfaces: Record<string, Namespaces.Type>; Tags: Record<string, Namespaces.Type> }}
                 *  @description Built-in namespace interfaces, materialized at construction
                 *               from the descriptor seed. `Interfaces`: interface name →
                 *               descriptor; `Tags`: tag → descriptor.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                Standard:
                {
                    Interfaces: Record<string,
                    {
                        Tags: string[];
                    }>;
                    Tags: Record<string, string>;
                };
                /** @name        Custom
                 *  @public
                 *  @namespace   Descriptor
                 *  @memberOf    Namespace
                 *  @type        {{ Interfaces: Record<string, Namespaces.Type>; Tags: Record<string, Namespaces.Type> }}
                 *  @description User-defined types registered at runtime via Define. Empty
                 *               at construction; same shape as `Standard`.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license)
                 */
                Custom:
                {
                    Constructors: Record<string,
                    {
                        Tags: string[];
                    }>;
                    Tags: Record<string, string>;
                };
            };
            /** @name        Enabled
             *  @public
             *  @type        {boolean}
             *  @description Operational flag: the namespace is active and serving Create/Update/Define.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Enabled: boolean;
            /** @name        Disabled
             *  @public
             *  @type        {boolean}
             *  @description Operational flag: the namespace is inactive. Inverse of `Enabled`.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Disabled: boolean;
            /** @name        State
             *  @public
             *  @type        {boolean}
             *  @description Validity of the namespace descriptor itself (`true` = healthy/usable),
             *               analogous to `Type.State`; distinct from the operational `Enabled`/`Disabled`.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            State: boolean;
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
            Loading: boolean;
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
            Loaded: boolean;
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
            Root: Window | null;
        }
        /** @author    Riccardo Angeli
         *  @copyright Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license MIT / Commercial (dual license)
         *  @interface Type
         *  @memberof  Schema.Interfaces.Namespaces
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
            Name: string;
            /** @name        Tags
             *  @public
             *  @type        {string[]}
             *  @description Tags that instantiate this type. A type may own several
             *               (e.g. `h1`…`h6` all map to HTMLHeadingElement).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Tags: string[];
            /** @name        Namespace
             *  @public
             *  @type        {Namespace}
             *  @description Owning namespace (identity: html / svg / mathML / x3d / …).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Namespace: string;
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
            Constructor: Types.DOM.Constructor | null;
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
            Interface: Types.DOM.Constructor | false | null;
            /** @name        Base
             *  @public
             *  @type        {Types.Core.Constructor | false | null}
             *  @description The base as DECLARED at Define time, which is not always the native
             *               `Interface`. When the declared super is a user class — `class Base
             *               extends HTMLDivElement`, or a multi-level L1→L2→L3 chain — the two
             *               diverge: `Interface` is the first patched IDL found by climbing
             *               (what the element is minted from, since only a native tag can be
             *               created), while `Base` is the constructor the user actually named
             *               (what the prototype must be grafted onto).
             *
             *               They were the same field before, and `Promote` grafted a FUNCTION
             *               constructor straight onto `Interface.prototype` — skipping every
             *               intermediate user class, so their methods silently vanished from the
             *               element. A CLASS was unaffected, since its own chain already carries
             *               them and `Prototype` records it whole.
             *
             *               `false`/`null` when the declared base IS the native interface, in
             *               which case `Interface` alone is the answer.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Base: Types.DOM.Constructor | false | null;
            /** @name        Prototype
             *  @public
             *  @type        {object | null}
             *  @description Prototype captured at registration, used for the prototype
             *               splice during upgrade; `null` when not available.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Prototype: object | null;
            /** @name        Supported
             *  @public
             *  @type        {boolean}
             *  @description Type status within the namespace: the native interface is
             *               supported by the environment.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Supported: boolean;
            /** @name        Defined
             *  @public
             *  @type        {boolean}
             *  @description Type status within the namespace: the type is registered /
             *               defined.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Defined: boolean;
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
            Patched: boolean;
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
            Upgraded: boolean;
            /** @name        Declaration
             *  @public
             *  @type        {'FUNCTION' | 'CLASS' | 'CUSTOM'}
             *  @description Declaration form: function, class with `extends`, or custom
             *               element.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Declaration: Types.DOM.Declaration;
            /** @name        Type
             *  @public
             *  @type        {'STANDARD' | 'CUSTOM'}
             *  @description Type category: a namespace standard or a user custom type.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Type: 'STANDARD' | 'CUSTOM';
            /** @name        Standard
             *  @public
             *  @type        {boolean}
             *  @description Convenience boolean: `true` for a namespace standard
             *               (mirrors `Type === 'STANDARD'`).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Standard: boolean;
            /** @name        Custom
             *  @public
             *  @type        {boolean}
             *  @description Convenience boolean: `true` for a user custom type (mirrors
             *               `Type === 'CUSTOM'`).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Custom: boolean;
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
             *               customs have `Component: false`. The Component decorator marks the committed
             *               descriptor after synchronous Define; no deferred constructor discovery is involved.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Component: boolean;
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
            Stylesheet: string | null;
            /** @name        Methods
             *  @public
             *  @type        {string[]=}
             *  @description Names of methods forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Shadow?:
            {
                Mode: 'open' | 'closed';
                Setting?: any;
                Css?: boolean;
                DelegatesFocus?: boolean;
            };
            /** @name        Methods
             *  @public
             *  @type        {string[]=}
             *  @description Names of methods forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Template?:
            {
                Ref?: string;
                Html?: string;
                Mode?: 'clone' | 'compile';
            } | null;
            /** @name        Native
             *  @public
             *  @type        {boolean}
             *  @description Registration path: `true` via the browser-native
             *               `customElements.define`, `false` via the AriannA registry.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Native: boolean;
            /** @name        Chain
             *  @public
             *  @type        {Map<string, unknown>}
             *  @description Prototype chain captured at registration (name → constructor).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Chain?: string[];
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
            Slot?: 'Internal' | 'External' | null;
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
            State: 'Fail' | 'Warn' | 'Success' | 'Pending' | null;
            /** @name        Properties
             *  @public
             *  @type        {string[]=}
             *  @description Names of properties forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Attributes?: string[] | null;
            /** @name        Properties
             *  @public
             *  @type        {string[]=}
             *  @description Names of properties forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Render?: string[] | null;
            /** @name        Properties
             *  @public
             *  @type        {string[]=}
             *  @description Names of properties forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Properties?: string[] | null;
            /** @name        Methods
             *  @public
             *  @type        {string[]=}
             *  @description Names of methods forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Methods?: string[] | null;
            /** @name        Properties
             *  @public
             *  @type        {string[]=}
             *  @description Names of properties forwarded to the inner native element
             *               (fragile forms only).
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license)
             */
            Brokers?: string[] | null;
        }
        /** @name        Seed
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Seed.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Seed
        {
            Name: string;
            Uri: string;
            NS: boolean;
            Base: Types.DOM.IDL | null;
            Schema: string;
            Documentation:
            {
                w3c: string;
            };
            Types:
            {
                
                Standard:
                {
                    Interfaces: Record<string,
                    {
                        Tags: string[];
                    }>;
                    Tags: Record<string, string>;
                };
                
                Custom:
                {
                    Interfaces: Record<string,
                    {
                        Tags: string[];
                    }>;
                    Tags: Record<string, string>;
                };
            };
        }
        /** @name        RegistryBucket
         *  @public
         *  @type        {interface}
         *  @description Structural contract for RegistryBucket.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface RegistryBucket
        {
            Interfaces: Map<string, Type>;
            SchemaInterfaces: Map<string, Type>;
            Tags: Map<string, Type>;
            entries(): MapIterator<[
                string,
                Type
            ]>;
            get(key: string): Type | undefined;
            set(key: string, value: Type): RegistryBucket;
            values(): MapIterator<Type>;
        }
    }
    /** @name        Reals
     *  @public
     *  @type        {namespace}
     *  @description Groups the Reals contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Reals
    {
        /** @name        Renderable
         *  @public
         *  @type        {interface}
         *  @description Minimal structural bridge accepted by the Real DOM engine for higher-level representations such as Virtual, compiled adapters and foreign wrappers.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Renderable
        {
            /** @name        render
             *  @public
             *  @type        {function}
             *  @returns     {Element} Materialized DOM element owned by Real after resolution.
             *  @description Materializes the higher-level representation into a DOM Element.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            render(): Element;
        }

        /** @name        Definition
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Definition.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Definition
        {
            Tag?: string;
            Attributes?: Record<string, string>;
            Style?: Record<string, string>;
        }
        /** @name        Service
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Service.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Service
        {
            Create
            (
            target: Types.Reals.Target): Types.Reals.Default;
            From
            (
            target: Types.Reals.Target | Types.Reals.Default): Types.Reals.Default;
        }
    }
    /** @name        Virtuals
     *  @public
     *  @type        {namespace}
     *  @description Groups the Virtuals contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Virtuals
    {
        /** @name        Definition
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Definition.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Definition
        {
            Tag?: string;
            Text?: string;
            Attributes?: Types.DOM.Attributes;
            Children?: Types.Virtuals.Child[];
            Root?: Element | null;
            Parent?: Types.Virtuals.Default | null;
        }
        /** @name        Service
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Service.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Service
        {
            readonly Nodes: Readonly<Record<string, Types.Virtuals.Default>>;
            readonly Instances: readonly Types.Virtuals.Default[];
            Create
            (
            definition: Types.Virtuals.Target,
            attributes?: Types.DOM.Attributes, ...children: Types.Virtuals.Child[]): Types.Virtuals.Default;
            From
            (
            source: Types.Virtuals.Target): Types.Virtuals.Default;
            Resolve
            (
            id: string): Types.Virtuals.Default | undefined;
            Has
            (
            id: string): boolean;
            Render
            (
            source: Types.Virtuals.Target): Element;
            Mount
            (
            source: Types.Virtuals.Target,
            parent?: string | Element | Types.Virtuals.Default | null): Types.Virtuals.Default;
            Destroy
            (
            source: Types.Virtuals.Default | string): boolean;
            Template
            (
            source: string): import('../dom/Template.ts').Templates.Template;
        }
    }
    /** @name        Context
     *  @public
     *  @type        {namespace}
     *  @description Groups the Context contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Context
    {
        /** @name        Options
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Options.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Options
        {
            Scope?: Types.Context.Scope;
        }
        /** @name        ChangeEvent
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ChangeEvent.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ChangeEvent<T>
        {
            Type: 'Context-Changed';
            Key: string;
            Scope: Types.Context.Scope;
            Previous: T | undefined;
            Value: T;
            Timestamp: number;
        }
        /** @name        StateBridge
         *  @public
         *  @type        {interface}
         *  @description Structural contract for StateBridge.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface StateBridge<T>
        {
            Peek(): T;
            Set(value: T | ((previous: T) => T)): unknown;
            OnChange(handler: (event:
            {
                Value: T;
            }) => void): unknown;
        }
        /** @name        WorkerMessageBuilder
         *  @public
         *  @type        {interface}
         *  @description Structural contract for WorkerMessageBuilder.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type WorkerMessageBuilder = State.WorkerMessageBuilder;
        /** @name        WorkerBridge
         *  @public
         *  @type        {interface}
         *  @description Structural contract for WorkerBridge.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type WorkerBridge = State.WorkerBridge;
        /** @name        Consumer
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Consumer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Consumer<T>
        {
            readonly Value: T | undefined;
            Signal(): import('../reactivity/Reactivity.ts').Reactivity.Signal<T | undefined>;
            Detach(): void;
        }
        /** @name        Record
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Record.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Record<T>
        {
            Key: string;
            Scope: Types.Context.Scope;
            Source: Types.Context.SourceKind;
            Signal: import('../reactivity/Reactivity.ts').Reactivity.Signal<T | undefined>;
            Providers: Set<EventTarget>;
            Consumers: Set<EventTarget>;
        }
        /** @name        Service
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Service.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Service
        {
            Create<T>
            (
            key: string,
            source?: T | StateBridge<T>,
            options?: Options): unknown;
            Has
            (
            key: string,
            scope?: Types.Context.Scope): boolean;
            Keys(): string[];
        }
    }
    /** @name        Workers
     *  @public
     *  @type        {namespace}
     *  @description Groups the Workers contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Workers
    {
        /** @name        WorkerTask
         *  @public
         *  @type        {interface}
         *  @description Structural contract for WorkerTask.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface WorkerTask<T = unknown>
        {
            fn: Types.Workers.TaskFunction<T>;
            args: unknown[];
            resolve(value: T): void;
            reject(error: unknown): void;
        }
        /** Configuration shared by `Workers.Create(...)` and `new Workers.Worker(...)`. */
        export interface WorkerOptions
        {
            Name?: string;
            Type?: Types.Workers.WorkerType;
            Timeout?: number;
            Retry?: number;
        }
        /** Configuration accepted by `Workers.Pool(...)` and `new Workers.WorkerPool(...)`. */
        export interface PoolOptions extends WorkerOptions
        {
            Size?: number;
            Queue?: number;
        }
        /** Fluent task request passed from TaskBuilder to a Worker or WorkerPool. */
        export interface TaskRequest
        {
            Id: string;
            Type: 'Task';
            Name: string;
            Payload: unknown;
            Transfer: Transferable[];
            Timeout?: number;
            Retry?: number;
        }
        /** Fluent fire-and-forget request passed from MessageBuilder to a Worker or WorkerPool. */
        export interface MessageRequest
        {
            Id: string;
            Type: 'Message';
            Name: string;
            Payload: unknown;
            Transfer: Transferable[];
        }
        /** Common wire shape routed across the main-thread/Worker boundary. */
        export interface ProtocolMessage
        {
            Id?: string;
            Type: Types.Workers.ProtocolType;
            Name?: string;
            Payload?: unknown;
            Value?: unknown;
            Error?: unknown;
            Key?: string;
            Detail?: unknown;
        }
        /** Successful task response. */
        export interface ResultMessage extends ProtocolMessage
        {
            Id: string;
            Type: 'Result';
            Value: unknown;
        }
        /** Failed task response. */
        export interface ErrorMessage extends ProtocolMessage
        {
            Id?: string;
            Type: 'Error';
            Error:
            {
                
                Message: string;
                
                Name?: string;
                
                Stack?: string;
            };
        }
        /** Shared Signal update emitted from a Worker. */
        export interface SignalMessage extends ProtocolMessage
        {
            Type: 'Signal';
            Key: string;
            Value: unknown;
        }
        /** Nominal event emitted from a Worker. */
        export interface EventMessage extends ProtocolMessage
        {
            Type: 'Event';
            Name: string;
            Detail: unknown;
        }
        /** Worker readiness notification. */
        export interface ReadyMessage extends ProtocolMessage
        {
            Type: 'Ready';
        }
        /** Executor consumed by TaskBuilder. */
        export interface TaskExecutor
        {
            Execute<T>(request: TaskRequest): Promise<T>;
        }
        /** Sender consumed by MessageBuilder. */
        export interface MessageSender
        {
            Post(request: MessageRequest): void;
        }
        /** Main-thread bookkeeping for one pending task. */
        export interface PendingTask
        {
            Resolve: (value: unknown) => void;
            Reject: (error: unknown) => void;
            Timer?: ReturnType<typeof setTimeout>;
        }
        /** WorkerPool queue record. */
        export interface QueuedTask
        {
            Request: TaskRequest;
            Resolve: (value: unknown) => void;
            Reject: (error: unknown) => void;
        }
        /** Signature of a named Worker-side task or message handler. */
        export interface Handler
        {
            (
            payload: unknown,
            message: ProtocolMessage): unknown | Promise<unknown>;
        }
        /** Nominal Worker-side handler table consumed by `Workers.Handle(...)`. */
        export interface Handlers
        {
            [name: string]: Handler;
        }
        /** Structural Core service contract for the Workers module. */
        export interface Service
        {
            Create
            (
            url: string | URL,
            options?: WorkerOptions): unknown;
            Pool
            (
            url: string | URL,
            options?: PoolOptions): unknown;
            Handle(handlers: Handlers): void;
            SharedSignal<T>
            (
            key: string,
            initial: T): unknown;
            PostSignal
            (
            key: string,
            value: unknown): void;
            PostEvent
            (
            name: string,
            detail: unknown): void;
        }
    }
    /** @name        Router
     *  @public
     *  @type        {namespace}
     *  @description Groups the Router contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Router
    {
        /** @name        Navigation
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Navigation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Navigation
        {
            Id: number;
            Signal: AbortSignal;
            Url: string;
            Path: string;
            RouteName?: string;
            Query: Record<string, string>;
            Parameters: Record<string, string>;
            Status: Types.Router.Status;
            Data?: unknown;
            Result?: unknown;
            Timestamp: number;
        }
        /** @name        Route
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Route.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Route
        {
            Name: string;
            Path: string;
            Method?: Types.Router.Method;
            Guards?: Guard[];
            Loader?: Loader;
            Handler?: (navigation: Navigation) => unknown | Promise<unknown>;
        }
        /** @name        Match
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Match.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Match
        {
            Route: Route;
            Parameters: Record<string, string>;
            Query: Record<string, string>;
        }
        /** @name        Guard
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Guard.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Guard
        {
            (navigation: Navigation): boolean | Promise<boolean>;
        }
        /** @name        Loader
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Loader.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Loader
        {
            (navigation: Navigation): unknown | Promise<unknown>;
        }
        /** @name        WorkerTaskBuilder
         *  @public
         *  @type        {interface}
         *  @description Structural contract for WorkerTaskBuilder.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface WorkerTaskBuilder
        {
            With(payload: unknown): WorkerTaskBuilder;
            Run<T = unknown>(): Promise<T>;
        }
        /** @name        WorkerBridge
         *  @public
         *  @type        {interface}
         *  @description Structural contract for WorkerBridge.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface WorkerBridge
        {
            Task(name: string): WorkerTaskBuilder;
        }
        /** @name        Options
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Options.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Options
        {
            Base?: string;
            Mode?: Types.Router.Mode;
            NotFound?: (navigation: Navigation) => unknown | Promise<unknown>;
        }
        /** @name        Service
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Service.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Service
        {
            Create(options?: Options): unknown;
        }
    }
    /** @name        SSR
     *  @public
     *  @type        {namespace}
     *  @description Groups the SSR contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace SSR
    {
        /** @name        Node
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Node.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Node
        {
            Tag?: string;
            Attributes?: Record<string, unknown>;
            Children?: Node[];
            Text?: string;
            Html?: string;
            Id?: string;
        }
        /** @name        RenderOptions
         *  @public
         *  @type        {interface}
         *  @description Structural contract for RenderOptions.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface RenderOptions
        {
            Hydration?: boolean;
            Indent?: number;
            Doctype?: boolean;
            State?: boolean;
            Context?: boolean;
            Signal?: AbortSignal;
            IdentifierPrefix?: string;
        }
        /** @name        HydrateOptions
         *  @public
         *  @type        {interface}
         *  @description Structural contract for HydrateOptions.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface HydrateOptions
        {
            Selector?: string;
            State?: string;
        }
        /** @name        WorkerTaskBuilder
         *  @public
         *  @type        {interface}
         *  @description Structural contract for WorkerTaskBuilder.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type WorkerTaskBuilder = Router.WorkerTaskBuilder;
        /** @name        WorkerBridge
         *  @public
         *  @type        {interface}
         *  @description Structural contract for WorkerBridge.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface WorkerBridge
        {
            Task<T = unknown>(name: string): WorkerTaskBuilder;
        }
        /** @name        Application
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Application.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Application
        {
            Node: Node;
            State?: unknown;
            Context?: unknown;
            Url?: string;
        }
        /** @name        RenderResult
         *  @public
         *  @type        {interface}
         *  @description Structural contract for RenderResult.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface RenderResult
        {
            Html: string;
            State: string | null;
            Context: unknown;
        }
        /** @name        Service
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Service.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Service
        {
            Create(options?: RenderOptions): unknown;
            RenderToString
            (
            node: SSR.Node | import('../platform/SSR.ts').SSR.Island,
            options?: RenderOptions): string;
            Hydrate
            (
            node: SSR.Node | import('../platform/SSR.ts').SSR.Island,
            root: ParentNode,
            options?: HydrateOptions): void;
            EscapeHtml
            (
            value: string): string;
        }
    }
    /** @name        Jsx
     *  @public
     *  @type        {namespace}
     *  @description Groups the Jsx contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Jsx
    {
        /** @name        Fragment
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Fragment.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Fragment
        {
            readonly __ariannaFragment: true;
            readonly Children: readonly Types.Jsx.Node[];
        }
        /** @name        RefObject
         *  @public
         *  @type        {interface}
         *  @description Structural contract for RefObject.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface RefObject<T = unknown>
        {
            Current: T | null;
        }
        /** @name        Ref
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Ref.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Ref<T = unknown> = RefObject<T> | ((value: T | null) => void) | null;
        /** @name        Component
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Component<P = Types.Jsx.Props>
        {
            readonly Props: Readonly<P>;
            Render(): Types.Jsx.Children;
            Mounted?(): void;
            Updated?(): void;
            Unmounted?(): void;
        }
        /** @name        ComponentType
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ComponentType.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ComponentType<P = Types.Jsx.Props>
        {
            (props: P): Types.Jsx.Children;
        }
        /** @name        Root
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Root.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Root
        {
            readonly Container: Element;
            readonly Mounted: boolean;
            Render(node: Types.Jsx.Children): Root;
            Update(node: Types.Jsx.Children): Root;
            Unmount(): void;
        }
        /** @name        ConvertOptions
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ConvertOptions.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ConvertOptions
        {
            RuntimeImport?: string;
            Mode?: Types.Jsx.Mode;
            ComponentBase?: string;
            Strict?: boolean;
        }
        /** @name        ConvertResult
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ConvertResult.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ConvertResult
        {
            Source: string;
            Warnings: readonly string[];
            Mode: Types.Jsx.Mode;
        }
        /** @name        Service
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Service.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Service
        {
            Mode(mode?: Types.Jsx.Mode): Types.Jsx.Mode;
            H(type: Types.Jsx.ElementType, props?: Types.Jsx.Props | null, ...children: Types.Jsx.Children[]): Types.Jsx.Node;
            CreateRoot(container: Element | string): Root;
            Render(node: Types.Jsx.Children, container: Element | string): Root;
            ConvertReact(source: string, options?: ConvertOptions): ConvertResult;
        }
        //If single interface needs to be in global, means to be moved in Core.
        // Else each interface needs to be moved in appropriate namespace.
        // This comment must be deleted after reorganizing types.
        /** @name        Props
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Props.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Props
        {
            children?: Node | readonly Node[];
            [key: string]: unknown;
        }
    }
    /** @name        Plugins
     *  @public
     *  @type        {namespace}
     *  @description Groups the Plugins contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Plugins
    {
        /** @name        AriannAAPI
         *  @public
         *  @type        {interface}
         *  @description Structural contract for AriannAAPI.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface AriannAAPI
        {
            readonly Name: 'AriannA API';
            readonly Version: string;
            readonly Services: readonly string[];
            HasService(name: string): boolean;
            Resolve<T extends object = object>(name: string): T | undefined;
            Call<R = unknown>(name: string, method: string, ...args: unknown[]): R | undefined;
        }
        /** @name        Definition
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Definition.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Definition
        {
            readonly Name: Types.Plugins.Name;
            readonly Version?: string;
            readonly Description?: string;
            readonly Dependencies?: readonly Types.Plugins.Name[];
            readonly Install: Types.Plugins.Installer;
        }
        /** @name        Record
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Record.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Record
        {
            readonly Definition: Definition;
            State: Types.Plugins.State;
            Options: Types.Plugins.Options;
            Cleanup: Types.Plugins.Cleanup | null;
            Error: unknown;
            InstalledAt: number | null;
        }
        /** @name        Service
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Service.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Service
        {
            readonly API: AriannAAPI;
            Register(definition: Definition): unknown;
            Install(name: string, options?: Types.Plugins.Options): Promise<unknown>;
            Use(definition: Definition, options?: Types.Plugins.Options): Promise<unknown>;
            Uninstall(name: string): Promise<boolean>;
            Enable(name: string): Promise<boolean>;
            Disable(name: string): Promise<boolean>;
            Has(name: string): boolean;
            Get(name: string): Record | undefined;
            List(): readonly Record[];
        }
    }
    /** @name        Properties
     *  @public
     *  @type        {namespace}
     *  @description Groups the Properties contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Properties
    {
        /** @name        Change
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Change<T = unknown>
        {
            Name: string;
            Value:
            {
                
                Old: T;
                
                New: T;
            };
            Override?: T;
            Descriptor: PropertyDescriptor<T>;
            Object?: object;
        }
        /** @name        Batch
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Batch.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Batch<T = unknown>
        {
            Name: string;
            Hosts: readonly object[];
            Count: number;
            Descriptor: PropertyDescriptor<T>;
        }
        /** @name        Signal
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Signal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Signal<T>
        {
            get(): T;
            set(value: T): void;
            subscribe
            (
            handler: (value: T) => void): () => void;
        }
        /** @name        Reactive
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Reactive.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Reactive
        {
            signal<T>(initial: T): Signal<T>;
            effect(run: () => void): () => void;
            reactive<T extends object>(value: T): T;
        }
        /** @name        Native
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Native.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Native<T = unknown>
        {
            value?: T;
            get?: () => T;
            set?: (value: T) => void;
            enumerable?: boolean;
            configurable?: boolean;
            writable?: boolean;
        }
        /** @name        Observable
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Observable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Observable
        {
            target?: EventTarget;
            cancelable?: boolean;
            propagation?: boolean;
            before?: string;
            changing?: string;
            changed?: string;
            after?: string;
        }
        /** @name        Event
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Event.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Event
        {
            type: string;
            propagation?: boolean;
            cancelable?: boolean;
            arguments?: Record<string, unknown>;
            targets?: object[];
        }
        /** @name        Binding
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Binding.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Binding
        {
            ways?: Types.Properties.Ways;
            target?: object;
            targets?: object[];
            attribute?: string;
            attributes?: string[] | Record<string, string>;
            property?: string;
            properties?: string[] | Record<string, string>;
            reactive?: 'Signal' | 'Observable' | 'Proxy';
            functions?: Types.Properties.Functions;
        }
        /** @name        Hook
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Hook.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Hook
        {
            point?: 'before' | 'after';
            run:
            (
            context:
            {
                
                Name: string;
                
                Hosts: readonly object[];
                
                Count: number;
            }) => void | boolean;
            arguments?: unknown[];
        }
        /** @name        PropertyDescriptor
         *  @public
         *  @type        {interface}
         *  @description Structural contract for PropertyDescriptor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface PropertyDescriptor<T = unknown>
        {
            native?: Native<T>;
            type?: Types.Properties.Type;
            validate?: (value: T) => boolean;
            transform?: (value: T) => T;
            prefix?: string;
            suffix?: string;
            observable?: boolean | Observable;
            event?: Event | Event[];
            bindings?: Types.Properties.Bindings;
            functions?: Types.Properties.Functions;
        }
    }
}
