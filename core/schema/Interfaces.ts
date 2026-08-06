/**
 * @module schema/Interfaces
 * @description AriannA level-0 structural contracts. Type-only: emits no runtime JavaScript.
 */

import type { Types }       from './Types.ts';

/** @name        Interfaces
 *  @public
 *  @type        {namespace}
 *  @description Groups the Interfaces contracts and runtime surface.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Interfaces
{
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
                /** @name        initial
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the initial value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                initial?: T
            ): Components.Binding<T>;

            attributeSignal
            (
                /** @name        name
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the name value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                name: string
            ): Reactivity.Signal<string | null>;

            /** @name        render
             *  @private
             *  @type        {unknown}
             *  @description Stores the render value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            render(): globalThis.Element;

            fire
            (
                /** @name        event
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the event value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                event : string | Event,
                /** @name        init
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the init value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                init? : CustomEventInit
            ): this;

            /** @name        Sheet
             *  @private
             *  @type        {unknown}
             *  @description Stores the Sheet value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Sheet    : unknown | null;
            /** @name        template
             *  @private
             *  @type        {unknown}
             *  @description Stores the template value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            template : unknown;

            /** @name        onConnected
             *  @private
             *  @type        {unknown}
             *  @description Stores the onConnected value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            onConnected?(): void;

            /** @name        onDisconnected
             *  @private
             *  @type        {unknown}
             *  @description Stores the onDisconnected value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            onDisconnected?(): void;

            /** @name        onAdopted
             *  @private
             *  @type        {unknown}
             *  @description Stores the onAdopted value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            onAdopted?(): void;

            onAttributeChanged?
            (
                /** @name        name
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the name value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                name     : string,
                /** @name        oldValue
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the oldValue value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                oldValue : string | null,
                /** @name        value
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the value value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                value    : string | null
            ): void;
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
            /** @name        from
             *  @private
             *  @type        {unknown}
             *  @description Stores the from value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            from(source?: unknown): Binding<T>;
            /** @name        to
             *  @private
             *  @type        {unknown}
             *  @description Stores the to value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            to(target?: unknown): Binding<T>;
            /** @name        host
             *  @private
             *  @type        {unknown}
             *  @description Stores the host value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            host(host?: unknown): Binding<T>;
            /** @name        owner
             *  @private
             *  @type        {unknown}
             *  @description Stores the owner value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            owner(owner?: unknown): Binding<T>;
            /** @name        sub
             *  @private
             *  @type        {unknown}
             *  @description Stores the sub value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            sub(key: string): Binding<T>;
            /** @name        up
             *  @private
             *  @type        {unknown}
             *  @description Stores the up value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            up(): Binding<T>;
            /** @name        attribute
             *  @private
             *  @type        {unknown}
             *  @description Stores the attribute value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            attribute(name: string): Reactivity.Signal<string | null>;
            /** @name        value
             *  @private
             *  @type        {unknown}
             *  @description Stores the value value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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

            <
                T extends abstract new (...arguments_: any[]) => object
            >
            (
                /** @name        specification
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the specification value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                specification: object
            ):
                (
                    /** @name        target
                     *  @private
                     *  @type        {unknown}
                     *  @description Stores the target value used by this owner.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    target   : T,
                    /** @name        context
                     *  @private
                     *  @type        {unknown}
                     *  @description Stores the context value used by this owner.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    context? : ClassDecoratorContext<T>
                ) => T | void;

            <
                T extends abstract new (...arguments_: any[]) => object
            >
            (
                /** @name        tag
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the tag value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                tag         : string,
                /** @name        css
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the css value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                css         : unknown,
                /** @name        definition
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the definition value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                definition? : unknown
            ):
                (
                    /** @name        target
                     *  @private
                     *  @type        {unknown}
                     *  @description Stores the target value used by this owner.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    target   : T,
                    /** @name        context
                     *  @private
                     *  @type        {unknown}
                     *  @description Stores the context value used by this owner.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    context? : ClassDecoratorContext<T>
                ) => T | void;

            new
            (
                /** @name        argument
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the argument value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                argument : globalThis.Element | string,
                /** @name        options
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the options value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                options? : Record<string, unknown>
            ): unknown;
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
        /** @name        Definition
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Definition.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Definition
        {
            /** @name        Tag
             *  @private
             *  @type        {unknown}
             *  @description Stores the Tag value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Tag?        : string;
            /** @name        Attributes
             *  @private
             *  @type        {unknown}
             *  @description Stores the Attributes value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Attributes? : Record<string, string>;
            /** @name        Style
             *  @private
             *  @type        {unknown}
             *  @description Stores the Style value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Style?      : Record<string, string>;
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
                /** @name        target
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the target value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                target: Types.Reals.Target
            ): Types.Reals.Default;

            From
            (
                /** @name        target
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the target value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                target:
                    Types.Reals.Target |
                    Types.Reals.Default
            ): Types.Reals.Default;
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
            /** @name        Tag
             *  @private
             *  @type        {unknown}
             *  @description Stores the Tag value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Tag?        : string;
            /** @name        Text
             *  @private
             *  @type        {unknown}
             *  @description Stores the Text value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Text?       : string;
            /** @name        Attributes
             *  @private
             *  @type        {unknown}
             *  @description Stores the Attributes value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Attributes? : Types.DOM.Attributes;
            /** @name        Children
             *  @private
             *  @type        {unknown}
             *  @description Stores the Children value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Children?   : Types.Virtuals.Child[];
            /** @name        Root
             *  @private
             *  @type        {unknown}
             *  @description Stores the Root value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Root?       : Element | null;
            /** @name        Parent
             *  @private
             *  @type        {unknown}
             *  @description Stores the Parent value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Parent?     : Types.Virtuals.Default | null;
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
            /** @name        Nodes
             *  @private
             *  @type        {unknown}
             *  @description Stores the Nodes value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Nodes: Readonly<Record<string, Types.Virtuals.Default>>;

            /** @name        Instances
             *  @private
             *  @type        {unknown}
             *  @description Stores the Instances value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Instances: readonly Types.Virtuals.Default[];

            Create
            (
                /** @name        definition
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the definition value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                definition  : Types.Virtuals.Target,
                /** @name        attributes
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the attributes value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                attributes? : Types.DOM.Attributes,
                ...children : Types.Virtuals.Child[]
            ): Types.Virtuals.Default;

            From
            (
                /** @name        source
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the source value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                source: Types.Virtuals.Target
            ): Types.Virtuals.Default;

            Resolve
            (
                /** @name        id
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the id value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                id: string
            ): Types.Virtuals.Default | undefined;

            Has
            (
                /** @name        id
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the id value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                id: string
            ): boolean;

            Render
            (
                /** @name        source
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the source value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                source: Types.Virtuals.Target
            ): Element;

            Mount
            (
                /** @name        source
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the source value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                source  : Types.Virtuals.Target,
                /** @name        parent
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the parent value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                parent? :
                    string |
                    Element |
                    Types.Virtuals.Default |
                    null
            ): Types.Virtuals.Default;

            Destroy
            (
                /** @name        source
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the source value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                source:
                    Types.Virtuals.Default |
                    string
            ): boolean;

            Template
            (
                /** @name        source
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the source value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                source: string
            ): import('../Template.ts').Templates.Template;
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
            /** @name        fn
             *  @private
             *  @type        {unknown}
             *  @description Stores the fn value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            fn: Types.Workers.TaskFunction<T>;
            /** @name        args
             *  @private
             *  @type        {unknown}
             *  @description Stores the args value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            args: unknown[];
            /** @name        resolve
             *  @private
             *  @type        {unknown}
             *  @description Stores the resolve value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            resolve(value: T): void;
            /** @name        reject
             *  @private
             *  @type        {unknown}
             *  @description Stores the reject value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            reject(error: unknown): void;
        }
        /** Configuration shared by `Workers.Create(...)` and `new Workers.Worker(...)`. */
        export interface WorkerOptions
        {
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name?    : string;
            /** @name        Type
             *  @private
             *  @type        {unknown}
             *  @description Stores the Type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Type?    : Types.Workers.WorkerType;
            /** @name        Timeout
             *  @private
             *  @type        {unknown}
             *  @description Stores the Timeout value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Timeout? : number;
            /** @name        Retry
             *  @private
             *  @type        {unknown}
             *  @description Stores the Retry value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Retry?   : number;
        }

        /** Configuration accepted by `Workers.Pool(...)` and `new Workers.WorkerPool(...)`. */
        export interface PoolOptions extends WorkerOptions
        {
            /** @name        Size
             *  @private
             *  @type        {unknown}
             *  @description Stores the Size value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Size?  : number;
            /** @name        Queue
             *  @private
             *  @type        {unknown}
             *  @description Stores the Queue value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Queue? : number;
        }

        /** Fluent task request passed from TaskBuilder to a Worker or WorkerPool. */
        export interface TaskRequest
        {
            /** @name        Id
             *  @private
             *  @type        {unknown}
             *  @description Stores the Id value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Id       : string;
            /** @name        Type
             *  @private
             *  @type        {unknown}
             *  @description Stores the Type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Type     : 'Task';
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name     : string;
            /** @name        Payload
             *  @private
             *  @type        {unknown}
             *  @description Stores the Payload value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Payload  : unknown;
            /** @name        Transfer
             *  @private
             *  @type        {unknown}
             *  @description Stores the Transfer value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Transfer : Transferable[];
            /** @name        Timeout
             *  @private
             *  @type        {unknown}
             *  @description Stores the Timeout value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Timeout? : number;
            /** @name        Retry
             *  @private
             *  @type        {unknown}
             *  @description Stores the Retry value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Retry?   : number;
        }

        /** Fluent fire-and-forget request passed from MessageBuilder to a Worker or WorkerPool. */
        export interface MessageRequest
        {
            /** @name        Id
             *  @private
             *  @type        {unknown}
             *  @description Stores the Id value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Id       : string;
            /** @name        Type
             *  @private
             *  @type        {unknown}
             *  @description Stores the Type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Type     : 'Message';
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name     : string;
            /** @name        Payload
             *  @private
             *  @type        {unknown}
             *  @description Stores the Payload value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Payload  : unknown;
            /** @name        Transfer
             *  @private
             *  @type        {unknown}
             *  @description Stores the Transfer value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Transfer : Transferable[];
        }

        /** Common wire shape routed across the main-thread/Worker boundary. */
        export interface ProtocolMessage
        {
            /** @name        Id
             *  @private
             *  @type        {unknown}
             *  @description Stores the Id value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Id?      : string;
            /** @name        Type
             *  @private
             *  @type        {unknown}
             *  @description Stores the Type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Type     : Types.Workers.ProtocolType;
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name?    : string;
            /** @name        Payload
             *  @private
             *  @type        {unknown}
             *  @description Stores the Payload value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Payload? : unknown;
            /** @name        Value
             *  @private
             *  @type        {unknown}
             *  @description Stores the Value value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Value?   : unknown;
            /** @name        Error
             *  @private
             *  @type        {unknown}
             *  @description Stores the Error value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Error?   : unknown;
            /** @name        Key
             *  @private
             *  @type        {unknown}
             *  @description Stores the Key value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Key?     : string;
            /** @name        Detail
             *  @private
             *  @type        {unknown}
             *  @description Stores the Detail value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Detail?  : unknown;
        }

        /** Successful task response. */
        export interface ResultMessage extends ProtocolMessage
        {
            /** @name        Id
             *  @private
             *  @type        {unknown}
             *  @description Stores the Id value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Id    : string;
            /** @name        Type
             *  @private
             *  @type        {unknown}
             *  @description Stores the Type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Type  : 'Result';
            /** @name        Value
             *  @private
             *  @type        {unknown}
             *  @description Stores the Value value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Value : unknown;
        }

        /** Failed task response. */
        export interface ErrorMessage extends ProtocolMessage
        {
            /** @name        Id
             *  @private
             *  @type        {unknown}
             *  @description Stores the Id value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Id?  : string;
            /** @name        Type
             *  @private
             *  @type        {unknown}
             *  @description Stores the Type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Type : 'Error';
            /** @name        Error
             *  @private
             *  @type        {unknown}
             *  @description Stores the Error value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Error:
                {
                    /** @name        Message
                     *  @private
                     *  @type        {unknown}
                     *  @description Stores the Message value used by this owner.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    Message : string;
                    /** @name        Name
                     *  @private
                     *  @type        {unknown}
                     *  @description Stores the Name value used by this owner.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    Name?   : string;
                    /** @name        Stack
                     *  @private
                     *  @type        {unknown}
                     *  @description Stores the Stack value used by this owner.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    Stack?  : string;
                };
        }

        /** Shared Signal update emitted from a Worker. */
        export interface SignalMessage extends ProtocolMessage
        {
            /** @name        Type
             *  @private
             *  @type        {unknown}
             *  @description Stores the Type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Type  : 'Signal';
            /** @name        Key
             *  @private
             *  @type        {unknown}
             *  @description Stores the Key value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Key   : string;
            /** @name        Value
             *  @private
             *  @type        {unknown}
             *  @description Stores the Value value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Value : unknown;
        }

        /** Nominal event emitted from a Worker. */
        export interface EventMessage extends ProtocolMessage
        {
            /** @name        Type
             *  @private
             *  @type        {unknown}
             *  @description Stores the Type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Type   : 'Event';
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name   : string;
            /** @name        Detail
             *  @private
             *  @type        {unknown}
             *  @description Stores the Detail value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Detail : unknown;
        }

        /** Worker readiness notification. */
        export interface ReadyMessage extends ProtocolMessage
        {
            /** @name        Type
             *  @private
             *  @type        {unknown}
             *  @description Stores the Type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Type: 'Ready';
        }

        /** Executor consumed by TaskBuilder. */
        export interface TaskExecutor
        {
            /** @name        Execute
             *  @private
             *  @type        {unknown}
             *  @description Stores the Execute value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Execute<T>(request: TaskRequest): Promise<T>;
        }

        /** Sender consumed by MessageBuilder. */
        export interface MessageSender
        {
            /** @name        Post
             *  @private
             *  @type        {unknown}
             *  @description Stores the Post value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Post(request: MessageRequest): void;
        }

        /** Main-thread bookkeeping for one pending task. */
        export interface PendingTask
        {
            /** @name        Resolve
             *  @private
             *  @type        {unknown}
             *  @description Stores the Resolve value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Resolve : (value: unknown) => void;
            /** @name        Reject
             *  @private
             *  @type        {unknown}
             *  @description Stores the Reject value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Reject  : (error: unknown) => void;
            /** @name        Timer
             *  @private
             *  @type        {unknown}
             *  @description Stores the Timer value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Timer?  : ReturnType<typeof setTimeout>;
        }

        /** WorkerPool queue record. */
        export interface QueuedTask
        {
            /** @name        Request
             *  @private
             *  @type        {unknown}
             *  @description Stores the Request value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Request : TaskRequest;
            /** @name        Resolve
             *  @private
             *  @type        {unknown}
             *  @description Stores the Resolve value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Resolve : (value: unknown) => void;
            /** @name        Reject
             *  @private
             *  @type        {unknown}
             *  @description Stores the Reject value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Reject  : (error: unknown) => void;
        }

        /** Signature of a named Worker-side task or message handler. */
        export interface Handler
        {
            (
                /** @name        payload
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the payload value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                payload : unknown,
                /** @name        message
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the message value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                message : ProtocolMessage
            ): unknown | Promise<unknown>;
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
                /** @name        url
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the url value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                url      : string | URL,
                /** @name        options
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the options value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                options? : WorkerOptions
            ): unknown;

            Pool
            (
                /** @name        url
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the url value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                url      : string | URL,
                /** @name        options
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the options value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                options? : PoolOptions
            ): unknown;

            /** @name        Handle
             *  @private
             *  @type        {unknown}
             *  @description Stores the Handle value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Handle(handlers: Handlers): void;

            SharedSignal<T>
            (
                /** @name        key
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the key value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                key     : string,
                /** @name        initial
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the initial value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                initial : T
            ): unknown;

            PostSignal
            (
                /** @name        key
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the key value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                key   : string,
                /** @name        value
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the value value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                value : unknown
            ): void;

            PostEvent
            (
                /** @name        name
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the name value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                name   : string,
                /** @name        detail
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the detail value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                detail : unknown
            ): void;
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
            /** @name        Url
             *  @private
             *  @type        {unknown}
             *  @description Stores the Url value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Url        : string;
            /** @name        Path
             *  @private
             *  @type        {unknown}
             *  @description Stores the Path value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Path       : string;
            /** @name        RouteName
             *  @private
             *  @type        {unknown}
             *  @description Stores the RouteName value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            RouteName? : string;
            /** @name        Query
             *  @private
             *  @type        {unknown}
             *  @description Stores the Query value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Query      : Record<string, string>;
            /** @name        Parameters
             *  @private
             *  @type        {unknown}
             *  @description Stores the Parameters value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Parameters : Record<string, string>;
            /** @name        Status
             *  @private
             *  @type        {unknown}
             *  @description Stores the Status value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Status     : Types.Router.Status;
            /** @name        Data
             *  @private
             *  @type        {unknown}
             *  @description Stores the Data value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Data?      : unknown;
            /** @name        Result
             *  @private
             *  @type        {unknown}
             *  @description Stores the Result value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Result?    : unknown;
            /** @name        Timestamp
             *  @private
             *  @type        {unknown}
             *  @description Stores the Timestamp value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Timestamp  : number;
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
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name     : string;
            /** @name        Path
             *  @private
             *  @type        {unknown}
             *  @description Stores the Path value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Path     : string;
            /** @name        Method
             *  @private
             *  @type        {unknown}
             *  @description Stores the Method value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Method?  : Types.Router.Method;
            /** @name        Guards
             *  @private
             *  @type        {unknown}
             *  @description Stores the Guards value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Guards?  : Guard[];
            /** @name        Loader
             *  @private
             *  @type        {unknown}
             *  @description Stores the Loader value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Loader?  : Loader;
            /** @name        Handler
             *  @private
             *  @type        {unknown}
             *  @description Stores the Handler value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Handler? : (navigation: Navigation) => unknown | Promise<unknown>;
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
            /** @name        Route
             *  @private
             *  @type        {unknown}
             *  @description Stores the Route value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Route      : Route;
            /** @name        Parameters
             *  @private
             *  @type        {unknown}
             *  @description Stores the Parameters value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Parameters : Record<string, string>;
            /** @name        Query
             *  @private
             *  @type        {unknown}
             *  @description Stores the Query value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Query      : Record<string, string>;
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
            /** @name        With
             *  @private
             *  @type        {unknown}
             *  @description Stores the With value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            With(payload: unknown): WorkerTaskBuilder;
            /** @name        Run
             *  @private
             *  @type        {unknown}
             *  @description Stores the Run value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Task
             *  @private
             *  @type        {unknown}
             *  @description Stores the Task value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Base
             *  @private
             *  @type        {unknown}
             *  @description Stores the Base value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Base?     : string;
            /** @name        Mode
             *  @private
             *  @type        {unknown}
             *  @description Stores the Mode value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Mode?     : Types.Router.Mode;
            /** @name        NotFound
             *  @private
             *  @type        {unknown}
             *  @description Stores the NotFound value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            NotFound? : (navigation: Navigation) => unknown | Promise<unknown>;
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
            /** @name        Create
             *  @private
             *  @type        {unknown}
             *  @description Stores the Create value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Create(options?: Options): unknown;
        }
    }

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
            /** @name        Css
             *  @private
             *  @type        {unknown}
             *  @description Stores the Css value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Css?: unknown;
            /** @name        Attrs
             *  @private
             *  @type        {unknown}
             *  @description Stores the Attrs value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Attrs?: string[];
            /** @name        Shadow
             *  @private
             *  @type        {unknown}
             *  @description Stores the Shadow value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Shadow?: Types.Shadow.Mode | false;
            /** @name        Bus
             *  @private
             *  @type        {unknown}
             *  @description Stores the Bus value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Bus?: string;
            /** @name        Render
             *  @private
             *  @type        {unknown}
             *  @description Stores the Render value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Render?: Types.DOM.RenderMode;
            /** @name        Template
             *  @private
             *  @type        {unknown}
             *  @description Stores the Template value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Template?: unknown;
            /** @name        Slot
             *  @private
             *  @type        {unknown}
             *  @description Stores the Slot value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Slot?: Types.DOM.SlotPlacement;
            /** @name        Component
             *  @private
             *  @type        {unknown}
             *  @description Stores the Component value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Component?: boolean;
            [key: string]: unknown;
        }

        /** @name        ObserverService
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ObserverService.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ObserverService
        {
            /** @name        Observe
             *  @private
             *  @type        {unknown}
             *  @description Stores the Observe value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Observe?(target?: Node): unknown;
            /** @name        Drain
             *  @private
             *  @type        {unknown}
             *  @description Stores the Drain value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Drain?(): unknown;
            /** @name        DrainAll
             *  @private
             *  @type        {unknown}
             *  @description Stores the DrainAll value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            DrainAll?(): unknown;
            /** @name        Update
             *  @private
             *  @type        {unknown}
             *  @description Stores the Update value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Update?(node: Element): unknown;
        }

        /** @name        EventService
         *  @public
         *  @type        {interface}
         *  @description Structural contract for EventService.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface EventService
        {
            /** @name        On
             *  @private
             *  @type        {unknown}
             *  @description Stores the On value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            On(target: Events.Target, types: string, listener: EventListenerOrEventListenerObject, options?: unknown): unknown;
            /** @name        Off
             *  @private
             *  @type        {unknown}
             *  @description Stores the Off value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Off(target: Events.Target, types?: string, listener?: EventListenerOrEventListenerObject, options?: unknown): unknown;
            /** @name        Fire
             *  @private
             *  @type        {unknown}
             *  @description Stores the Fire value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Fire(target: EventTarget, event: string | Events.EventDescriptor): unknown;
        }

        /** @name        ReactivityService
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ReactivityService.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ReactivityService
        {
            /** @name        signal
             *  @private
             *  @type        {unknown}
             *  @description Stores the signal value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            signal?<T>(value: T): unknown;
            /** @name        effect
             *  @private
             *  @type        {unknown}
             *  @description Stores the effect value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            effect?(run: () => void): unknown;
            /** @name        reactive
             *  @private
             *  @type        {unknown}
             *  @description Stores the reactive value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            reactive?<T extends object>(value: T): T;
            [key: string]: unknown;
        }

        /** @name        CssService
         *  @public
         *  @type        {interface}
         *  @description Structural contract for CssService.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface CssService
        {
            /** @name        compile
             *  @private
             *  @type        {unknown}
             *  @description Stores the compile value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            compile?(css: unknown, descriptor?: Namespaces.Type): unknown;
            /** @name        inject
             *  @private
             *  @type        {unknown}
             *  @description Stores the inject value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            inject?(css: unknown, target?: ParentNode): unknown;
            [key: string]: unknown;
        }

        /** @name        RealService
         *  @public
         *  @type        {interface}
         *  @description Structural contract for RealService.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface RealService { create(arg: unknown): unknown; }
        /** @name        VirtualService
         *  @public
         *  @type        {interface}
         *  @description Structural contract for VirtualService.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface VirtualService { make(arg: unknown): unknown; }
        /** @name        ShadowService
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ShadowService.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ShadowService { shadow(node: Element, opts: { def?: Record<string, unknown>; tag?: string }): void; }
        /** @name        TemplatesService
         *  @public
         *  @type        {interface}
         *  @description Structural contract for TemplatesService.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface TemplatesService { [key: string]: unknown; }
        /** @name        StateService
         *  @public
         *  @type        {interface}
         *  @description Structural contract for StateService.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface StateService { make<T extends object>(source: T): unknown; }
        /** @name        ContextService
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ContextService.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ContextService { [key: string]: unknown; }
        /** @name        DirectivesService
         *  @public
         *  @type        {interface}
         *  @description Structural contract for DirectivesService.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface DirectivesService { [key: string]: unknown; }
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
                     *  @type        {{ Interfaces: Record<string, Namespaces.Type>; Tags: Record<string, Namespaces.Type> }}
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
                     *  @type        {{ Interfaces: Record<string, Namespaces.Type>; Tags: Record<string, Namespaces.Type> }}
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
             *               customs have `Component: false`. The Component decorator marks the committed
             *               descriptor after synchronous Define; no deferred constructor discovery is involved.
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

        /** @name        Seed
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Seed.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Seed
        {
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name: string;
            /** @name        Uri
             *  @private
             *  @type        {unknown}
             *  @description Stores the Uri value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Uri: string;
            /** @name        NS
             *  @private
             *  @type        {unknown}
             *  @description Stores the NS value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            NS: boolean;
            /** @name        Base
             *  @private
             *  @type        {unknown}
             *  @description Stores the Base value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Base: Types.DOM.IDL | null;
            /** @name        Schema
             *  @private
             *  @type        {unknown}
             *  @description Stores the Schema value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Schema: string;
            /** @name        Documentation
             *  @private
             *  @type        {unknown}
             *  @description Stores the Documentation value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Documentation: { w3c: string };
            /** @name        Types
             *  @private
             *  @type        {unknown}
             *  @description Stores the Types value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Types:
            {
                /** @name        Standard
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the Standard value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Standard: { Interfaces: Record<string, { Tags: string[] }>; Tags: Record<string, string> };
                /** @name        Custom
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the Custom value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Custom: { Interfaces: Record<string, { Tags: string[] }>; Tags: Record<string, string> };
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
            /** @name        Interfaces
             *  @private
             *  @type        {unknown}
             *  @description Stores the Interfaces value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Interfaces       : Map<string, Type>;
            /** @name        SchemaInterfaces
             *  @private
             *  @type        {unknown}
             *  @description Stores the SchemaInterfaces value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            SchemaInterfaces : Map<string, Type>;
            /** @name        Tags
             *  @private
             *  @type        {unknown}
             *  @description Stores the Tags value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Tags             : Map<string, Type>;
            /** @name        entries
             *  @private
             *  @type        {unknown}
             *  @description Stores the entries value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            entries()        : MapIterator<[string, Type]>;
            /** @name        get
             *  @private
             *  @type        {unknown}
             *  @description Stores the get value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            get(key: string) : Type | undefined;
            /** @name        set
             *  @private
             *  @type        {unknown}
             *  @description Stores the set value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            set(key: string, value: Type): RegistryBucket;
            /** @name        values
             *  @private
             *  @type        {unknown}
             *  @description Stores the values value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            values()         : MapIterator<Type>;
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
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name       : string;
            /** @name        Interface
             *  @private
             *  @type        {unknown}
             *  @description Stores the Interface value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Interface  : string;
            /** @name        Domain
             *  @private
             *  @type        {unknown}
             *  @description Stores the Domain value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Domain     : string;
            /** @name        Category
             *  @private
             *  @type        {unknown}
             *  @description Stores the Category value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Category   : string;
            /** @name        State
             *  @private
             *  @type        {unknown}
             *  @description Stores the State value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            State      : string;
            /** @name        Lifecycle
             *  @private
             *  @type        {unknown}
             *  @description Stores the Lifecycle value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Lifecycle? : boolean;
            /** @name        CE
             *  @private
             *  @type        {unknown}
             *  @description Stores the CE value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            CE?        : string | false;
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
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name     : string;
            /** @name        Current
             *  @private
             *  @type        {unknown}
             *  @description Stores the Current value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Current  : Types.Events.Target;
            /** @name        Previous
             *  @private
             *  @type        {unknown}
             *  @description Stores the Previous value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Previous : Types.Events.Target;
            /** @name        Next
             *  @private
             *  @type        {unknown}
             *  @description Stores the Next value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Next     : Types.Events.Target;
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
            /** @name        Type
             *  @private
             *  @type        {unknown}
             *  @description Stores the Type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Type         : string;
            /** @name        Cancelable
             *  @private
             *  @type        {unknown}
             *  @description Stores the Cancelable value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Cancelable?  : boolean;
            /** @name        Propagation
             *  @private
             *  @type        {unknown}
             *  @description Stores the Propagation value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Propagation? : boolean;
            /** @name        Detail
             *  @private
             *  @type        {unknown}
             *  @description Stores the Detail value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Detail?      : Record<string, unknown>;
            /** @name        Targets
             *  @private
             *  @type        {unknown}
             *  @description Stores the Targets value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Targets?     : Types.Events.Target;
            /** @name        Path
             *  @private
             *  @type        {unknown}
             *  @description Stores the Path value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Path?        : string[];
            /** @name        Broker
             *  @private
             *  @type        {unknown}
             *  @description Stores the Broker value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Broker?      : string;
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
            /** @name        Id
             *  @private
             *  @type        {unknown}
             *  @description Stores the Id value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Id           : string;
            /** @name        Listeners
             *  @private
             *  @type        {unknown}
             *  @description Stores the Listeners value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Listeners    : ListenerDescriptor[];
            /** @name        Node
             *  @private
             *  @type        {unknown}
             *  @description Stores the Node value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Node?        : EventTarget;
            /** @name        Parent
             *  @private
             *  @type        {unknown}
             *  @description Stores the Parent value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Parent?      : EventTargetDescriptor;
            /** @name        Brokers
             *  @private
             *  @type        {unknown}
             *  @description Stores the Brokers value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Brokers?     : Record<string, EventTargetDescriptor>;
            /** @name        Intercepted
             *  @private
             *  @type        {unknown}
             *  @description Stores the Intercepted value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Intercepted? : Map<string, EventListener>;
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
            /** @name        UUID
             *  @private
             *  @type        {unknown}
             *  @description Stores the UUID value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            UUID      : string;
            /** @name        Type
             *  @private
             *  @type        {unknown}
             *  @description Stores the Type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Type      : string;
            /** @name        Target
             *  @private
             *  @type        {unknown}
             *  @description Stores the Target value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Target    : EventTarget | string;
            /** @name        Handler
             *  @private
             *  @type        {unknown}
             *  @description Stores the Handler value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Handler   : EventListener;
            /** @name        Phase
             *  @private
             *  @type        {unknown}
             *  @description Stores the Phase value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Phase     : Types.Events.Phase;
            /** @name        Brokers
             *  @private
             *  @type        {unknown}
             *  @description Stores the Brokers value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Brokers?  : string[];
            /** @name        Once
             *  @private
             *  @type        {unknown}
             *  @description Stores the Once value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Once      : boolean;
            /** @name        Passive
             *  @private
             *  @type        {unknown}
             *  @description Stores the Passive value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Passive   : boolean;
            /** @name        Untrusted
             *  @private
             *  @type        {unknown}
             *  @description Stores the Untrusted value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Untrusted : boolean;
            /** @name        Json
             *  @private
             *  @type        {unknown}
             *  @description Stores the Json value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Json      : Json;
            /** @name        XML
             *  @private
             *  @type        {unknown}
             *  @description Stores the XML value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            XML?      : XML;
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
            /** @name        id
             *  @private
             *  @type        {unknown}
             *  @description Stores the id value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id            : string;
            /** @name        event
             *  @private
             *  @type        {unknown}
             *  @description Stores the event value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            event         : string;
            /** @name        observer
             *  @private
             *  @type        {unknown}
             *  @description Stores the observer value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            observer      : string;
            /** @name        target
             *  @private
             *  @type        {unknown}
             *  @description Stores the target value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            target        : string;
            /** @name        handler
             *  @private
             *  @type        {unknown}
             *  @description Stores the handler value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            handler       : string | EventListener;
            /** @name        phase
             *  @private
             *  @type        {unknown}
             *  @description Stores the phase value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            phase         : Types.Events.Phase;
            /** @name        brokers
             *  @private
             *  @type        {unknown}
             *  @description Stores the brokers value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            brokers?      : string[];
            /** @name        path
             *  @private
             *  @type        {unknown}
             *  @description Stores the path value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            path?         : string[];
            /** @name        propagate
             *  @private
             *  @type        {unknown}
             *  @description Stores the propagate value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            propagate     : boolean;
            /** @name        defaultAction
             *  @private
             *  @type        {unknown}
             *  @description Stores the defaultAction value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            defaultAction : string;
            /** @name        namespace
             *  @private
             *  @type        {unknown}
             *  @description Stores the namespace value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            namespace     : string;
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
            /** @name        UUID
             *  @private
             *  @type        {unknown}
             *  @description Stores the UUID value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            UUID?         : string;
            /** @name        Type
             *  @private
             *  @type        {unknown}
             *  @description Stores the Type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Type?         : string;
            /** @name        Target
             *  @private
             *  @type        {unknown}
             *  @description Stores the Target value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Target?       : string;
            /** @name        Handler
             *  @private
             *  @type        {unknown}
             *  @description Stores the Handler value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Handler?      : string;
            /** @name        Phase
             *  @private
             *  @type        {unknown}
             *  @description Stores the Phase value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Phase?        : Types.Events.Phase;
            /** @name        Brokers
             *  @private
             *  @type        {unknown}
             *  @description Stores the Brokers value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Brokers?      : string;
            /** @name        Once
             *  @private
             *  @type        {unknown}
             *  @description Stores the Once value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Once?         : boolean;
            /** @name        Passive
             *  @private
             *  @type        {unknown}
             *  @description Stores the Passive value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Passive?      : boolean;
            /** @name        Untrusted
             *  @private
             *  @type        {unknown}
             *  @description Stores the Untrusted value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Untrusted?    : boolean;
            [key: string] : unknown;
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
                /** @name        target
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the target value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                target : Types.Events.Target,
                /** @name        event
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the event value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                event  : string | EventDescriptor
            ): boolean;

            On
            (
                /** @name        target
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the target value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                target   : Types.Events.Target,
                /** @name        types
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the types value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                types    : string,
                /** @name        handler
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the handler value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                handler  : EventListener,
                /** @name        options
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the options value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                options? : AddEventListenerOptions &
                    {
                        /** @name        phase
                         *  @private
                         *  @type        {unknown}
                         *  @description Stores the phase value used by this owner.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        phase?   : Types.Events.Phase;
                        /** @name        brokers
                         *  @private
                         *  @type        {unknown}
                         *  @description Stores the brokers value used by this owner.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        brokers? : string[];
                    }
            ): ListenerDescriptor[];

            Off
            (
                /** @name        target
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the target value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                target  : Types.Events.Target,
                /** @name        types
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the types value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                types   : string,
                /** @name        handler
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the handler value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                handler : EventListener
            ): void;

            /** @name        GetInterface
             *  @private
             *  @type        {unknown}
             *  @description Stores the GetInterface value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            GetInterface(type: string): string | undefined;
            /** @name        GetCategory
             *  @private
             *  @type        {unknown}
             *  @description Stores the GetCategory value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            GetCategory(type: string): string | undefined;
            /** @name        GetState
             *  @private
             *  @type        {unknown}
             *  @description Stores the GetState value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            Type    : string;

            /** @member      Name
             *  @public
             *  @type        {string}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description The identifier of a named @-rule — the `@keyframes <Name>`, `@counter-style <Name>`, or
             *               the prefix bound by `@namespace <Name> url(…)`.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name?   : string;

            /** @member      Value
             *  @public
             *  @type        {string}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description The literal value of a value-carrying @-rule — the encoding of `@charset "<Value>"` or
             *               the string payload of a simple prelude.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Value?  : string;

            /** @member      Media
             *  @public
             *  @type        {string}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description The media query text attached to the prelude — the trailing `screen and (…)` of an
             *               `@import` or the query list of an `@media` given in flat string form.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Media?  : string;

            /** @member      Url
             *  @public
             *  @type        {string}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description The target URL of a URL-carrying @-rule — the `url(…)` of an `@import` or an
             *               `@namespace`.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Url?    : string;

            /** @member      Prefix
             *  @public
             *  @type        {string}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description The namespace prefix declared by `@namespace <Prefix> url(…)`, bound to the following
             *               URL for prefixed type selectors.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Prefix? : string;

            /** @member      Domain
             *  @public
             *  @type        {string}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description A domain matcher of `@document` — the argument of its `domain(…)` / `url(…)` predicate
             *               that scopes the contained rules to a site.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Domain? : string;

            /** @member      Regex
             *  @public
             *  @type        {string}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description A regexp matcher of `@document` — the argument of its `regexp("…")` predicate that
             *               scopes the contained rules by URL pattern.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Regex?  : string;

            /** @member      Right
             *  @public
             *  @type        {boolean}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description Page-box side flag for `@page` — selects the `:right` margin context when the margin
             *               boxes are built.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Right?  : boolean;

            /** @member      Left
             *  @public
             *  @type        {boolean}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description Page-box side flag for `@page` — selects the `:left` margin context when the margin
             *               boxes are built.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Left?   : boolean;

            /** @member      And
             *  @public
             *  @type        {Record<string, unknown>}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description Conjunction node of a condition tree — the `and (…)` branch of an `@media` / `@supports`
             *               prelude, holding the further feature tests all of which must hold.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            And?    : Record<string, unknown>;

            /** @member      Or
             *  @public
             *  @type        {Record<string, unknown>}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description Disjunction node of a condition tree — the `or (…)` branch of an `@media` / `@supports`
             *               prelude, holding the alternative feature tests any of which may hold.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Or?     : Record<string, unknown>;

            /** @member      Not
             *  @public
             *  @type        {Record<string, unknown>}
             *  @memberof    Core.Css.Interfaces.SelectorInterface
             *  @description Negation node of a condition tree — the `not (…)` branch of an `@media` / `@supports`
             *               prelude, holding the single feature test that must not hold.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Not?    : Record<string, unknown>;

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
            Selector  : string | SelectorInterface;

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
            Contents? : string | Record<string, unknown>;

            /** @member      Content
             *  @public
             *  @type        {string | Record<string, unknown>}
             *  @memberof    Core.Css.Interfaces.RuleInterface
             *  @description The rule body — a Golem alias of `Contents`, accepted for authoring convenience. Same
             *               shape (CSS string or property object) and same treatment; supply only one body key.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Content?  : string | Record<string, unknown>;

            /** @member      Body
             *  @public
             *  @type        {string | Record<string, unknown>}
             *  @memberof    Core.Css.Interfaces.RuleInterface
             *  @description The rule body — a Golem alias of `Contents`, accepted for authoring convenience. Same
             *               shape (CSS string or property object) and same treatment; supply only one body key.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Body?     : string | Record<string, unknown>;

            /** @member      Rule
             *  @public
             *  @type        {string | Record<string, unknown>}
             *  @memberof    Core.Css.Interfaces.RuleInterface
             *  @description The rule body — a Golem alias of `Contents`, accepted for authoring convenience. Same
             *               shape (CSS string or property object) and same treatment; supply only one body key.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Rule?     : string | Record<string, unknown>;

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
            Rules?    : Record<string, RuleInterface | Record<string, string>> | RuleInterface[];
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
            [selector: string] : RuleInterface | Record<string, string>;
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
            /** @name        Selector
             *  @private
             *  @type        {unknown}
             *  @description Stores the Selector value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Selector?: unknown;
            /** @name        Declarations
             *  @private
             *  @type        {unknown}
             *  @description Stores the Declarations value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Declarations?: Record<string, unknown>;
            /** @name        cssText
             *  @private
             *  @type        {unknown}
             *  @description Stores the cssText value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Rules
             *  @private
             *  @type        {unknown}
             *  @description Stores the Rules value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Rules?: readonly RuleLike[];
            /** @name        cssText
             *  @private
             *  @type        {unknown}
             *  @description Stores the cssText value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Type
             *  @private
             *  @type        {unknown}
             *  @description Stores the Type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Type: string;
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name?: string;
            /** @name        Value
             *  @private
             *  @type        {unknown}
             *  @description Stores the Value value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Value?: unknown;
            /** @name        Media
             *  @private
             *  @type        {unknown}
             *  @description Stores the Media value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Media?: unknown;
            /** @name        Url
             *  @private
             *  @type        {unknown}
             *  @description Stores the Url value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Url?: string;
            /** @name        Prefix
             *  @private
             *  @type        {unknown}
             *  @description Stores the Prefix value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Prefix?: string;
            /** @name        Domain
             *  @private
             *  @type        {unknown}
             *  @description Stores the Domain value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Domain?: string;
            /** @name        Regex
             *  @private
             *  @type        {unknown}
             *  @description Stores the Regex value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Regex?: string;
            /** @name        And
             *  @private
             *  @type        {unknown}
             *  @description Stores the And value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            And?: unknown;
            /** @name        Or
             *  @private
             *  @type        {unknown}
             *  @description Stores the Or value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Or?: unknown;
            /** @name        Not
             *  @private
             *  @type        {unknown}
             *  @description Stores the Not value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Selector
             *  @private
             *  @type        {unknown}
             *  @description Stores the Selector value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Selector?: string | Selector;
            /** @name        Style
             *  @private
             *  @type        {unknown}
             *  @description Stores the Style value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Style?: Record<string, unknown>;
            /** @name        Declarations
             *  @private
             *  @type        {unknown}
             *  @description Stores the Declarations value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Type
             *  @private
             *  @type        {unknown}
             *  @description Stores the Type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Type      : string;
            /** @name        Target
             *  @private
             *  @type        {unknown}
             *  @description Stores the Target value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Target    : object;
            /** @name        Root
             *  @private
             *  @type        {unknown}
             *  @description Stores the Root value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Root      : object;
            /** @name        Path
             *  @private
             *  @type        {unknown}
             *  @description Stores the Path value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Path      : Types.Reactivity.Path;
            /** @name        Key
             *  @private
             *  @type        {unknown}
             *  @description Stores the Key value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Key       : Types.Reactivity.Key;
            /** @name        Old
             *  @private
             *  @type        {unknown}
             *  @description Stores the Old value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Old       : unknown;
            /** @name        New
             *  @private
             *  @type        {unknown}
             *  @description Stores the New value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            New       : unknown;
            /** @name        Kind
             *  @private
             *  @type        {unknown}
             *  @description Stores the Kind value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Kind      : Types.Reactivity.ChangeKind;
            /** @name        Version
             *  @private
             *  @type        {unknown}
             *  @description Stores the Version value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Version   : number;
            /** @name        Timestamp
             *  @private
             *  @type        {unknown}
             *  @description Stores the Timestamp value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Timestamp : number;
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
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name?   : string;
            /** @name        Equals
             *  @private
             *  @type        {unknown}
             *  @description Stores the Equals value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Equals? : Types.Reactivity.Equality<T>;
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
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name?     : string;
            /** @name        Schedule
             *  @private
             *  @type        {unknown}
             *  @description Stores the Schedule value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Schedule? : Types.Reactivity.Schedule;
            /** @name        Defer
             *  @private
             *  @type        {unknown}
             *  @description Stores the Defer value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Defer?    : boolean;
            /** @name        Priority
             *  @private
             *  @type        {unknown}
             *  @description Stores the Priority value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Priority? : number;
            /** @name        OnError
             *  @private
             *  @type        {unknown}
             *  @description Stores the OnError value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            OnError?  : (error: unknown) => void;
            /** @name        Signal
             *  @private
             *  @type        {unknown}
             *  @description Stores the Signal value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Signal?   : AbortSignal;
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
            /** @name        Immediate
             *  @private
             *  @type        {unknown}
             *  @description Stores the Immediate value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Immediate? : boolean;
            /** @name        Deep
             *  @private
             *  @type        {unknown}
             *  @description Stores the Deep value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Deep?      : boolean;
            /** @name        Equals
             *  @private
             *  @type        {unknown}
             *  @description Stores the Equals value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Equals?    : Types.Reactivity.Equality<T>;
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
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name?     : string;
            /** @name        Shallow
             *  @private
             *  @type        {unknown}
             *  @description Stores the Shallow value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Shallow?  : boolean;
            /** @name        Readonly
             *  @private
             *  @type        {unknown}
             *  @description Stores the Readonly value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Readonly? : boolean;
            /** @name        Events
             *  @private
             *  @type        {unknown}
             *  @description Stores the Events value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Events?   : boolean;
        }

        /** @name        ResourceOptions
         *  @public
         *  @type        {interface}
         *  @description Structural contract for ResourceOptions.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ResourceOptions<T>
        {
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name?         : string;
            /** @name        Initial
             *  @private
             *  @type        {unknown}
             *  @description Stores the Initial value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Initial?      : T;
            /** @name        Immediate
             *  @private
             *  @type        {unknown}
             *  @description Stores the Immediate value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Immediate?    : boolean;
            /** @name        KeepPrevious
             *  @private
             *  @type        {unknown}
             *  @description Stores the KeepPrevious value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            KeepPrevious? : boolean;
            /** @name        Schedule
             *  @private
             *  @type        {unknown}
             *  @description Stores the Schedule value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Schedule?     : Types.Reactivity.Schedule;
            /** @name        OnError
             *  @private
             *  @type        {unknown}
             *  @description Stores the OnError value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            OnError?      : (error: unknown) => void;
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
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Name  : string;
            /** @name        Value
             *  @private
             *  @type        {unknown}
             *  @description Stores the Value value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Value : T;

            /** @name        Get
             *  @private
             *  @type        {unknown}
             *  @description Stores the Get value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Get(): T;

            /** @name        Peek
             *  @private
             *  @type        {unknown}
             *  @description Stores the Peek value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Peek(): T;

            Subscribe
            (
                /** @name        handler
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the handler value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                handler  : (value: T, previous: T) => void,
                /** @name        options
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the options value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                options? : EffectOptions
            ): Types.Reactivity.Stop;
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
            /** @name        Value
             *  @private
             *  @type        {unknown}
             *  @description Stores the Value value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Value: T;

            Set
            (
                /** @name        value
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the value value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                value:
                    T |
                    ((previous: T) => T)
            ): T;

            Update
            (
                /** @name        updater
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the updater value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                updater: (previous: T) => T
            ): T;

            /** @name        Touch
             *  @private
             *  @type        {unknown}
             *  @description Stores the Touch value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Touch(): void;

            /** @name        Readonly
             *  @private
             *  @type        {unknown}
             *  @description Stores the Readonly value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Dirty
             *  @private
             *  @type        {unknown}
             *  @description Stores the Dirty value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Dirty: boolean;

            /** @name        Recompute
             *  @private
             *  @type        {unknown}
             *  @description Stores the Recompute value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Name       : string;
            /** @name        Value
             *  @private
             *  @type        {unknown}
             *  @description Stores the Value value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Value      : T | undefined;
            /** @name        Latest
             *  @private
             *  @type        {unknown}
             *  @description Stores the Latest value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Latest     : T | undefined;
            /** @name        Error
             *  @private
             *  @type        {unknown}
             *  @description Stores the Error value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Error      : unknown;
            /** @name        Loading
             *  @private
             *  @type        {unknown}
             *  @description Stores the Loading value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Loading    : boolean;
            /** @name        State
             *  @private
             *  @type        {unknown}
             *  @description Stores the State value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly State      : Types.Reactivity.ResourceState;
            /** @name        Source
             *  @private
             *  @type        {unknown}
             *  @description Stores the Source value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Source     : S | undefined;
            /** @name        Promise
             *  @private
             *  @type        {unknown}
             *  @description Stores the Promise value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Promise    : Promise<T> | null;
            /** @name        Controller
             *  @private
             *  @type        {unknown}
             *  @description Stores the Controller value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Controller : AbortController | null;

            /** @name        Refetch
             *  @private
             *  @type        {unknown}
             *  @description Stores the Refetch value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Refetch(source?: S): Promise<T | undefined>;

            Mutate
            (
                /** @name        value
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the value value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                value:
                    T |
                    ((previous: T | undefined) => T)
            ): T;

            /** @name        Abort
             *  @private
             *  @type        {unknown}
             *  @description Stores the Abort value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Abort(reason?: unknown): void;

            /** @name        Clear
             *  @private
             *  @type        {unknown}
             *  @description Stores the Clear value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Clear(): void;

            /** @name        Dispose
             *  @private
             *  @type        {unknown}
             *  @description Stores the Dispose value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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

            /** @name        Value
             *  @private
             *  @type        {unknown}
             *  @description Stores the Value value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Active
             *  @private
             *  @type        {unknown}
             *  @description Stores the Active value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Active: boolean;

            /** @name        Track
             *  @private
             *  @type        {unknown}
             *  @description Stores the Track value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Track(read: () => void): void;

            /** @name        Dispose
             *  @private
             *  @type        {unknown}
             *  @description Stores the Dispose value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Effects
             *  @private
             *  @type        {unknown}
             *  @description Stores the Effects value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Effects    : number;
            /** @name        Signals
             *  @private
             *  @type        {unknown}
             *  @description Stores the Signals value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Signals    : number;
            /** @name        Proxies
             *  @private
             *  @type        {unknown}
             *  @description Stores the Proxies value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Proxies    : number;
            /** @name        Scheduled
             *  @private
             *  @type        {unknown}
             *  @description Stores the Scheduled value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Scheduled  : number;
            /** @name        BatchDepth
             *  @private
             *  @type        {unknown}
             *  @description Stores the BatchDepth value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly BatchDepth : number;
            /** @name        Version
             *  @private
             *  @type        {unknown}
             *  @description Stores the Version value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Version    : number;
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
            /** @name        Parent
             *  @private
             *  @type        {unknown}
             *  @description Stores the Parent value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Parent   : Owner | null;
            /** @name        Owned
             *  @private
             *  @type        {unknown}
             *  @description Stores the Owned value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Owned    : Set<Computation>;
            /** @name        Cleanups
             *  @private
             *  @type        {unknown}
             *  @description Stores the Cleanups value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Cleanups : Types.Reactivity.Cleanup[];
            /** @name        Context
             *  @private
             *  @type        {unknown}
             *  @description Stores the Context value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Context  : Map<unknown, unknown> | null;
            /** @name        Disposed
             *  @private
             *  @type        {unknown}
             *  @description Stores the Disposed value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Disposed : boolean;
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name     : string;
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
            /** @name        Id
             *  @private
             *  @type        {unknown}
             *  @description Stores the Id value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Id           : number;
            /** @name        Fn
             *  @private
             *  @type        {unknown}
             *  @description Stores the Fn value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Fn           : () => unknown;
            /** @name        Dependencies
             *  @private
             *  @type        {unknown}
             *  @description Stores the Dependencies value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Dependencies : Set<Types.Reactivity.Dependency>;
            /** @name        Active
             *  @private
             *  @type        {unknown}
             *  @description Stores the Active value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Active       : boolean;
            /** @name        Running
             *  @private
             *  @type        {unknown}
             *  @description Stores the Running value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Running      : boolean;
            /** @name        Pending
             *  @private
             *  @type        {unknown}
             *  @description Stores the Pending value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Pending      : boolean;
            /** @name        Paused
             *  @private
             *  @type        {unknown}
             *  @description Stores the Paused value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Paused       : boolean;
            /** @name        Schedule
             *  @private
             *  @type        {unknown}
             *  @description Stores the Schedule value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Schedule     : Types.Reactivity.Schedule;
            /** @name        Priority
             *  @private
             *  @type        {unknown}
             *  @description Stores the Priority value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Priority     : number;
            /** @name        OnError
             *  @private
             *  @type        {unknown}
             *  @description Stores the OnError value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            OnError?     : (error: unknown) => void;

            /** @name        Run
             *  @private
             *  @type        {unknown}
             *  @description Stores the Run value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Run(): void;

            /** @name        Notify
             *  @private
             *  @type        {unknown}
             *  @description Stores the Notify value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Notify(): void;

            /** @name        Dispose
             *  @private
             *  @type        {unknown}
             *  @description Stores the Dispose value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Root
             *  @private
             *  @type        {unknown}
             *  @description Stores the Root value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Root     : object;
            /** @name        Path
             *  @private
             *  @type        {unknown}
             *  @description Stores the Path value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Path     : Types.Reactivity.Path;
            /** @name        Shallow
             *  @private
             *  @type        {unknown}
             *  @description Stores the Shallow value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Shallow  : boolean;
            /** @name        Readonly
             *  @private
             *  @type        {unknown}
             *  @description Stores the Readonly value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Readonly : boolean;
            /** @name        Emit
             *  @private
             *  @type        {unknown}
             *  @description Stores the Emit value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Emit?    : (event: ChangeEvent) => void;
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
            /** @name        Target
             *  @private
             *  @type        {unknown}
             *  @description Stores the Target value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Target : object;
            /** @name        Key
             *  @private
             *  @type        {unknown}
             *  @description Stores the Key value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Key    : Types.Reactivity.Key;
            /** @name        Had
             *  @private
             *  @type        {unknown}
             *  @description Stores the Had value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Had    : boolean;
            /** @name        Old
             *  @private
             *  @type        {unknown}
             *  @description Stores the Old value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Old    : unknown;
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
            /** @name        Scope
             *  @private
             *  @type        {unknown}
             *  @description Stores the Scope value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Type
             *  @private
             *  @type        {unknown}
             *  @description Stores the Type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Type      : 'Context-Changed';
            /** @name        Key
             *  @private
             *  @type        {unknown}
             *  @description Stores the Key value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Key       : string;
            /** @name        Scope
             *  @private
             *  @type        {unknown}
             *  @description Stores the Scope value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Scope     : Types.Context.Scope;
            /** @name        Previous
             *  @private
             *  @type        {unknown}
             *  @description Stores the Previous value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Previous  : T | undefined;
            /** @name        Value
             *  @private
             *  @type        {unknown}
             *  @description Stores the Value value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Value     : T;
            /** @name        Timestamp
             *  @private
             *  @type        {unknown}
             *  @description Stores the Timestamp value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Timestamp : number;
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
            /** @name        Peek
             *  @private
             *  @type        {unknown}
             *  @description Stores the Peek value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Peek(): T;
            /** @name        Set
             *  @private
             *  @type        {unknown}
             *  @description Stores the Set value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Set(value: T | ((previous: T) => T)): unknown;
            /** @name        OnChange
             *  @private
             *  @type        {unknown}
             *  @description Stores the OnChange value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            OnChange(handler: (event: { Value: T }) => void): unknown;
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
            /** @name        With
             *  @private
             *  @type        {unknown}
             *  @description Stores the With value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            With(payload: unknown): WorkerMessageBuilder;
            /** @name        Post
             *  @private
             *  @type        {unknown}
             *  @description Stores the Post value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Send
             *  @private
             *  @type        {unknown}
             *  @description Stores the Send value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Send(name: string): WorkerMessageBuilder;
        }

        /** @name        Consumer
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Consumer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Consumer<T>
        {
            /** @name        Value
             *  @private
             *  @type        {unknown}
             *  @description Stores the Value value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Value: T | undefined;
            /** @name        Signal
             *  @private
             *  @type        {unknown}
             *  @description Stores the Signal value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Signal(): import('../Reactive.ts').Reactivity.Signal<T | undefined>;
            /** @name        Detach
             *  @private
             *  @type        {unknown}
             *  @description Stores the Detach value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Key
             *  @private
             *  @type        {unknown}
             *  @description Stores the Key value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Key       : string;
            /** @name        Scope
             *  @private
             *  @type        {unknown}
             *  @description Stores the Scope value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Scope     : Types.Context.Scope;
            /** @name        Source
             *  @private
             *  @type        {unknown}
             *  @description Stores the Source value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Source    : Types.Context.SourceKind;
            /** @name        Signal
             *  @private
             *  @type        {unknown}
             *  @description Stores the Signal value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Signal    : import('../Reactive.ts').Reactivity.Signal<T | undefined>;
            /** @name        Providers
             *  @private
             *  @type        {unknown}
             *  @description Stores the Providers value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Providers : Set<EventTarget>;
            /** @name        Consumers
             *  @private
             *  @type        {unknown}
             *  @description Stores the Consumers value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Consumers : Set<EventTarget>;
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
                /** @name        key
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the key value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                key      : string,
                /** @name        source
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the source value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                source?  : T | StateBridge<T>,
                /** @name        options
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the options value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                options? : Options
            ): unknown;

            Has
            (
                /** @name        key
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the key value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                key    : string,
                /** @name        scope
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the scope value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                scope? : Types.Context.Scope
            ): boolean;

            /** @name        Keys
             *  @private
             *  @type        {unknown}
             *  @description Stores the Keys value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Keys(): string[];
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
            /** @name        mounted
             *  @private
             *  @type        {unknown}
             *  @description Stores the mounted value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            mounted?(element: Element, value?: unknown): void;
            /** @name        unmounted
             *  @private
             *  @type        {unknown}
             *  @description Stores the unmounted value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        tag
             *  @private
             *  @type        {unknown}
             *  @description Stores the tag value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            tag: string;
            /** @name        template
             *  @private
             *  @type        {unknown}
             *  @description Stores the template value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            template?: unknown;
            /** @name        style
             *  @private
             *  @type        {unknown}
             *  @description Stores the style value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            style?: unknown;
            /** @name        shadow
             *  @private
             *  @type        {unknown}
             *  @description Stores the shadow value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            shadow?: Types.Shadow.Mode | boolean;
            /** @name        attrs
             *  @private
             *  @type        {unknown}
             *  @description Stores the attrs value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            attrs?: string[];
            [key: string]: unknown;
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
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name       : string;
            /** @name        Value
             *  @private
             *  @type        {unknown}
             *  @description Stores the Value value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Value      :
            {
                /** @name        Old
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the Old value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Old : T;
                /** @name        New
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the New value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                New : T;
            };
            /** @name        Override
             *  @private
             *  @type        {unknown}
             *  @description Stores the Override value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Override?  : T;
            /** @name        Descriptor
             *  @private
             *  @type        {unknown}
             *  @description Stores the Descriptor value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Descriptor : PropertyDescriptor<T>;
            /** @name        Object
             *  @private
             *  @type        {unknown}
             *  @description Stores the Object value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Object?    : object;
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
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name       : string;
            /** @name        Hosts
             *  @private
             *  @type        {unknown}
             *  @description Stores the Hosts value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Hosts      : readonly object[];
            /** @name        Count
             *  @private
             *  @type        {unknown}
             *  @description Stores the Count value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Count      : number;
            /** @name        Descriptor
             *  @private
             *  @type        {unknown}
             *  @description Stores the Descriptor value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Descriptor : PropertyDescriptor<T>;
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
            /** @name        get
             *  @private
             *  @type        {unknown}
             *  @description Stores the get value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            get(): T;

            /** @name        set
             *  @private
             *  @type        {unknown}
             *  @description Stores the set value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            set(value: T): void;

            subscribe
            (
                /** @name        handler
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the handler value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                handler: (value: T) => void
            ): () => void;
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
            /** @name        signal
             *  @private
             *  @type        {unknown}
             *  @description Stores the signal value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            signal<T>(initial: T): Signal<T>;

            /** @name        effect
             *  @private
             *  @type        {unknown}
             *  @description Stores the effect value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            effect(run: () => void): () => void;

            /** @name        reactive
             *  @private
             *  @type        {unknown}
             *  @description Stores the reactive value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        value
             *  @private
             *  @type        {unknown}
             *  @description Stores the value value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            value?        : T;
            /** @name        get
             *  @private
             *  @type        {unknown}
             *  @description Stores the get value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            get?          : () => T;
            /** @name        set
             *  @private
             *  @type        {unknown}
             *  @description Stores the set value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            set?          : (value: T) => void;
            /** @name        enumerable
             *  @private
             *  @type        {unknown}
             *  @description Stores the enumerable value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            enumerable?   : boolean;
            /** @name        configurable
             *  @private
             *  @type        {unknown}
             *  @description Stores the configurable value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            configurable? : boolean;
            /** @name        writable
             *  @private
             *  @type        {unknown}
             *  @description Stores the writable value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            writable?     : boolean;
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
            /** @name        target
             *  @private
             *  @type        {unknown}
             *  @description Stores the target value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            target?      : EventTarget;
            /** @name        cancelable
             *  @private
             *  @type        {unknown}
             *  @description Stores the cancelable value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cancelable?  : boolean;
            /** @name        propagation
             *  @private
             *  @type        {unknown}
             *  @description Stores the propagation value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            propagation? : boolean;
            /** @name        before
             *  @private
             *  @type        {unknown}
             *  @description Stores the before value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            before?      : string;
            /** @name        changing
             *  @private
             *  @type        {unknown}
             *  @description Stores the changing value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            changing?    : string;
            /** @name        changed
             *  @private
             *  @type        {unknown}
             *  @description Stores the changed value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            changed?     : string;
            /** @name        after
             *  @private
             *  @type        {unknown}
             *  @description Stores the after value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            after?       : string;
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
            /** @name        type
             *  @private
             *  @type        {unknown}
             *  @description Stores the type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            type         : string;
            /** @name        propagation
             *  @private
             *  @type        {unknown}
             *  @description Stores the propagation value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            propagation? : boolean;
            /** @name        cancelable
             *  @private
             *  @type        {unknown}
             *  @description Stores the cancelable value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cancelable?  : boolean;
            /** @name        arguments
             *  @private
             *  @type        {unknown}
             *  @description Stores the arguments value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            arguments?   : Record<string, unknown>;
            /** @name        targets
             *  @private
             *  @type        {unknown}
             *  @description Stores the targets value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            targets?     : object[];
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
            /** @name        ways
             *  @private
             *  @type        {unknown}
             *  @description Stores the ways value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            ways?       : Types.Properties.Ways;
            /** @name        target
             *  @private
             *  @type        {unknown}
             *  @description Stores the target value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            target?     : object;
            /** @name        targets
             *  @private
             *  @type        {unknown}
             *  @description Stores the targets value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            targets?    : object[];
            /** @name        attribute
             *  @private
             *  @type        {unknown}
             *  @description Stores the attribute value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            attribute?  : string;
            /** @name        attributes
             *  @private
             *  @type        {unknown}
             *  @description Stores the attributes value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            attributes? : string[] | Record<string, string>;
            /** @name        property
             *  @private
             *  @type        {unknown}
             *  @description Stores the property value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            property?   : string;
            /** @name        properties
             *  @private
             *  @type        {unknown}
             *  @description Stores the properties value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            properties? : string[] | Record<string, string>;
            /** @name        reactive
             *  @private
             *  @type        {unknown}
             *  @description Stores the reactive value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            reactive?   : 'Signal' | 'Observable' | 'Proxy';
            /** @name        functions
             *  @private
             *  @type        {unknown}
             *  @description Stores the functions value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            functions?  : Types.Properties.Functions;
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
            /** @name        point
             *  @private
             *  @type        {unknown}
             *  @description Stores the point value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            point?     : 'before' | 'after';
            /** @name        run
             *  @private
             *  @type        {unknown}
             *  @description Stores the run value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            run        :
            (
                /** @name        context
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the context value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                context:
                {
                    /** @name        Name
                     *  @private
                     *  @type        {unknown}
                     *  @description Stores the Name value used by this owner.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    Name  : string;
                    /** @name        Hosts
                     *  @private
                     *  @type        {unknown}
                     *  @description Stores the Hosts value used by this owner.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    Hosts : readonly object[];
                    /** @name        Count
                     *  @private
                     *  @type        {unknown}
                     *  @description Stores the Count value used by this owner.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    Count : number;
                }
            ) => void | boolean;
            /** @name        arguments
             *  @private
             *  @type        {unknown}
             *  @description Stores the arguments value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            arguments? : unknown[];
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
            /** @name        native
             *  @private
             *  @type        {unknown}
             *  @description Stores the native value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            native?     : Native<T>;
            /** @name        type
             *  @private
             *  @type        {unknown}
             *  @description Stores the type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            type?       : Types.Properties.Type;
            /** @name        validate
             *  @private
             *  @type        {unknown}
             *  @description Stores the validate value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            validate?   : (value: T) => boolean;
            /** @name        transform
             *  @private
             *  @type        {unknown}
             *  @description Stores the transform value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            transform?  : (value: T) => T;
            /** @name        prefix
             *  @private
             *  @type        {unknown}
             *  @description Stores the prefix value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            prefix?     : string;
            /** @name        suffix
             *  @private
             *  @type        {unknown}
             *  @description Stores the suffix value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            suffix?     : string;
            /** @name        observable
             *  @private
             *  @type        {unknown}
             *  @description Stores the observable value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            observable? : boolean | Observable;
            /** @name        event
             *  @private
             *  @type        {unknown}
             *  @description Stores the event value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            event?      : Event | Event[];
            /** @name        bindings
             *  @private
             *  @type        {unknown}
             *  @description Stores the bindings value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            bindings?   : Types.Properties.Bindings;
            /** @name        functions
             *  @private
             *  @type        {unknown}
             *  @description Stores the functions value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            functions?  : Types.Properties.Functions;
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
            /** @name        Mode
             *  @private
             *  @type        {unknown}
             *  @description Stores the Mode value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Mode?           : Types.Shadow.Mode;
            /** @name        Backend
             *  @private
             *  @type        {unknown}
             *  @description Stores the Backend value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Backend?        : Types.Shadow.Backend;
            /** @name        DelegatesFocus
             *  @private
             *  @type        {unknown}
             *  @description Stores the DelegatesFocus value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            DelegatesFocus? : boolean;
            /** @name        Projection
             *  @private
             *  @type        {unknown}
             *  @description Stores the Projection value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Projection?     : Types.Shadow.Projection;
            /** @name        Sandbox
             *  @private
             *  @type        {unknown}
             *  @description Stores the Sandbox value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Sandbox?        : string;
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
            /** @name        Root
             *  @private
             *  @type        {unknown}
             *  @description Stores the Root value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Root   : ShadowRoot | Element | Document;
            /** @name        Iframe
             *  @private
             *  @type        {unknown}
             *  @description Stores the Iframe value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Iframe : HTMLIFrameElement | null;
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
                /** @name        host
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the host value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                host     : Element,
                /** @name        options
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the options value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                options? : Options
            ): unknown;
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
            /** @name        Kind
             *  @private
             *  @type        {unknown}
             *  @description Stores the Kind value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Kind       : Types.Template.BindingKind;
            /** @name        Path
             *  @private
             *  @type        {unknown}
             *  @description Stores the Path value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Path       : readonly number[];
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name?      : string;
            /** @name        Expression
             *  @private
             *  @type        {unknown}
             *  @description Stores the Expression value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Expression : string;
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
            /** @name        Owner
             *  @private
             *  @type        {unknown}
             *  @description Stores the Owner value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Nodes
             *  @private
             *  @type        {unknown}
             *  @description Stores the Nodes value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Nodes   : readonly Node[];
            /** @name        Dispose
             *  @private
             *  @type        {unknown}
             *  @description Stores the Dispose value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Dispose : () => void;
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
            /** @name        Compile
             *  @private
             *  @type        {unknown}
             *  @description Stores the Compile value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Compile(source: string): unknown;
            /** @name        Html
             *  @private
             *  @type        {unknown}
             *  @description Stores the Html value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Html(strings: TemplateStringsArray, ...values: unknown[]): unknown;
            /** @name        Css
             *  @private
             *  @type        {unknown}
             *  @description Stores the Css value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Css(strings: TemplateStringsArray, ...values: unknown[]): unknown;
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
            /** @name        __ariannaFragment
             *  @private
             *  @type        {unknown}
             *  @description Stores the __ariannaFragment value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly __ariannaFragment : true;
            /** @name        Children
             *  @private
             *  @type        {unknown}
             *  @description Stores the Children value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Children          : readonly Types.Jsx.Node[];
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
            /** @name        Current
             *  @private
             *  @type        {unknown}
             *  @description Stores the Current value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Current: T | null;
        }

        /** @name        Ref
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Ref.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Ref<T = unknown> =
            RefObject<T> |
            ((value: T | null) => void) |
            null;

        /** @name        Component
         *  @public
         *  @type        {interface}
         *  @description Structural contract for Component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Component<P = Types.Jsx.Props>
        {
            /** @name        Props
             *  @private
             *  @type        {unknown}
             *  @description Stores the Props value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Props: Readonly<P>;
            /** @name        Render
             *  @private
             *  @type        {unknown}
             *  @description Stores the Render value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Render(): Types.Jsx.Children;
            /** @name        Mounted
             *  @private
             *  @type        {unknown}
             *  @description Stores the Mounted value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Mounted?(): void;
            /** @name        Updated
             *  @private
             *  @type        {unknown}
             *  @description Stores the Updated value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Updated?(): void;
            /** @name        Unmounted
             *  @private
             *  @type        {unknown}
             *  @description Stores the Unmounted value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Container
             *  @private
             *  @type        {unknown}
             *  @description Stores the Container value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Container : Element;
            /** @name        Mounted
             *  @private
             *  @type        {unknown}
             *  @description Stores the Mounted value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Mounted   : boolean;
            /** @name        Render
             *  @private
             *  @type        {unknown}
             *  @description Stores the Render value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Render(node: Types.Jsx.Children): Root;
            /** @name        Update
             *  @private
             *  @type        {unknown}
             *  @description Stores the Update value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Update(node: Types.Jsx.Children): Root;
            /** @name        Unmount
             *  @private
             *  @type        {unknown}
             *  @description Stores the Unmount value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        RuntimeImport
             *  @private
             *  @type        {unknown}
             *  @description Stores the RuntimeImport value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            RuntimeImport? : string;
            /** @name        Mode
             *  @private
             *  @type        {unknown}
             *  @description Stores the Mode value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Mode?          : Types.Jsx.Mode;
            /** @name        ComponentBase
             *  @private
             *  @type        {unknown}
             *  @description Stores the ComponentBase value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            ComponentBase? : string;
            /** @name        Strict
             *  @private
             *  @type        {unknown}
             *  @description Stores the Strict value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Strict?        : boolean;
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
            /** @name        Source
             *  @private
             *  @type        {unknown}
             *  @description Stores the Source value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Source   : string;
            /** @name        Warnings
             *  @private
             *  @type        {unknown}
             *  @description Stores the Warnings value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Warnings : readonly string[];
            /** @name        Mode
             *  @private
             *  @type        {unknown}
             *  @description Stores the Mode value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Mode     : Types.Jsx.Mode;
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
            /** @name        Mode
             *  @private
             *  @type        {unknown}
             *  @description Stores the Mode value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Mode(mode?: Types.Jsx.Mode): Types.Jsx.Mode;
            /** @name        H
             *  @private
             *  @type        {unknown}
             *  @description Stores the H value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            H(type: Types.Jsx.ElementType, props?: Types.Jsx.Props | null, ...children: Types.Jsx.Children[]): Types.Jsx.Node;
            /** @name        CreateRoot
             *  @private
             *  @type        {unknown}
             *  @description Stores the CreateRoot value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            CreateRoot(container: Element | string): Root;
            /** @name        Render
             *  @private
             *  @type        {unknown}
             *  @description Stores the Render value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Render(node: Types.Jsx.Children, container: Element | string): Root;
            /** @name        ConvertReact
             *  @private
             *  @type        {unknown}
             *  @description Stores the ConvertReact value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            ConvertReact(source: string, options?: ConvertOptions): ConvertResult;
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
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Name     : 'AriannA API';
            /** @name        Version
             *  @private
             *  @type        {unknown}
             *  @description Stores the Version value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Version  : string;
            /** @name        Services
             *  @private
             *  @type        {unknown}
             *  @description Stores the Services value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Services : readonly string[];
            /** @name        HasService
             *  @private
             *  @type        {unknown}
             *  @description Stores the HasService value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            HasService(name: string): boolean;
            /** @name        Resolve
             *  @private
             *  @type        {unknown}
             *  @description Stores the Resolve value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Resolve<T extends object = object>(name: string): T | undefined;
            /** @name        Call
             *  @private
             *  @type        {unknown}
             *  @description Stores the Call value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Name         : Types.Plugins.Name;
            /** @name        Version
             *  @private
             *  @type        {unknown}
             *  @description Stores the Version value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Version?     : string;
            /** @name        Description
             *  @private
             *  @type        {unknown}
             *  @description Stores the Description value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Description? : string;
            /** @name        Dependencies
             *  @private
             *  @type        {unknown}
             *  @description Stores the Dependencies value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Dependencies?: readonly Types.Plugins.Name[];
            /** @name        Install
             *  @private
             *  @type        {unknown}
             *  @description Stores the Install value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Install      : Types.Plugins.Installer;
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
            /** @name        Definition
             *  @private
             *  @type        {unknown}
             *  @description Stores the Definition value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Definition : Definition;
            /** @name        State
             *  @private
             *  @type        {unknown}
             *  @description Stores the State value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            State               : Types.Plugins.State;
            /** @name        Options
             *  @private
             *  @type        {unknown}
             *  @description Stores the Options value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Options             : Types.Plugins.Options;
            /** @name        Cleanup
             *  @private
             *  @type        {unknown}
             *  @description Stores the Cleanup value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Cleanup             : Types.Plugins.Cleanup | null;
            /** @name        Error
             *  @private
             *  @type        {unknown}
             *  @description Stores the Error value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Error               : unknown;
            /** @name        InstalledAt
             *  @private
             *  @type        {unknown}
             *  @description Stores the InstalledAt value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            InstalledAt         : number | null;
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
            /** @name        API
             *  @private
             *  @type        {unknown}
             *  @description Stores the API value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly API: AriannAAPI;
            /** @name        Register
             *  @private
             *  @type        {unknown}
             *  @description Stores the Register value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Register(definition: Definition): unknown;
            /** @name        Install
             *  @private
             *  @type        {unknown}
             *  @description Stores the Install value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Install(name: string, options?: Types.Plugins.Options): Promise<unknown>;
            /** @name        Use
             *  @private
             *  @type        {unknown}
             *  @description Stores the Use value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Use(definition: Definition, options?: Types.Plugins.Options): Promise<unknown>;
            /** @name        Uninstall
             *  @private
             *  @type        {unknown}
             *  @description Stores the Uninstall value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Uninstall(name: string): Promise<boolean>;
            /** @name        Enable
             *  @private
             *  @type        {unknown}
             *  @description Stores the Enable value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Enable(name: string): Promise<boolean>;
            /** @name        Disable
             *  @private
             *  @type        {unknown}
             *  @description Stores the Disable value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Disable(name: string): Promise<boolean>;
            /** @name        Has
             *  @private
             *  @type        {unknown}
             *  @description Stores the Has value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Has(name: string): boolean;
            /** @name        Get
             *  @private
             *  @type        {unknown}
             *  @description Stores the Get value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Get(name: string): Record | undefined;
            /** @name        List
             *  @private
             *  @type        {unknown}
             *  @description Stores the List value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            List(): readonly Record[];
        }
    }

    /** @name        Props
     *  @public
     *  @type        {interface}
     *  @description Structural contract for Props.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface Props
    {
        /** @name        children
         *  @private
         *  @type        {unknown}
         *  @description Stores the children value used by this owner.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        children?: Node | readonly Node[];
        [key: string]: unknown;
    }

    /** @name        ComponentType
     *  @public
     *  @type        {interface}
     *  @description Structural contract for ComponentType.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface ComponentType<P>
    {
        (props: P): Node;
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
        /** @name        Render
         *  @private
         *  @type        {unknown}
         *  @description Stores the Render value used by this owner.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Render(node: Node): void;
        /** @name        Unmount
         *  @private
         *  @type        {unknown}
         *  @description Stores the Unmount value used by this owner.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
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
        /** @name        RuntimeImport
         *  @private
         *  @type        {unknown}
         *  @description Stores the RuntimeImport value used by this owner.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        RuntimeImport? : string;
        /** @name        Mode
         *  @private
         *  @type        {unknown}
         *  @description Stores the Mode value used by this owner.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Mode?          : Types.Jsx.Mode;
        /** @name        ComponentBase
         *  @private
         *  @type        {unknown}
         *  @description Stores the ComponentBase value used by this owner.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        ComponentBase? : string;
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
        /** @name        Source
         *  @private
         *  @type        {unknown}
         *  @description Stores the Source value used by this owner.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Source   : string;
        /** @name        Warnings
         *  @private
         *  @type        {unknown}
         *  @description Stores the Warnings value used by this owner.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Warnings : readonly string[];
        /** @name        Mode
         *  @private
         *  @type        {unknown}
         *  @description Stores the Mode value used by this owner.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Mode     : Types.Jsx.Mode;
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
        H
        (
            /** @name        type
             *  @private
             *  @type        {unknown}
             *  @description Stores the type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            type     : string | ComponentType<Props> | unknown,
            /** @name        props
             *  @private
             *  @type        {unknown}
             *  @description Stores the props value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            props    : Props | null,
            ...input : Node[]
        ): Node;

        /** @name        CreateRoot
         *  @private
         *  @type        {unknown}
         *  @description Stores the CreateRoot value used by this owner.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        CreateRoot(container: Element): unknown;

        ConvertReact
        (
            /** @name        source
             *  @private
             *  @type        {unknown}
             *  @description Stores the source value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            source   : string,
            /** @name        options
             *  @private
             *  @type        {unknown}
             *  @description Stores the options value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            options? : ConvertOptions
        ): ConvertResult;
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
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name?         : string;
            /** @name        HistoryLimit
             *  @private
             *  @type        {unknown}
             *  @description Stores the HistoryLimit value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            HistoryLimit? : number;
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
            /** @name        Kind
             *  @private
             *  @type        {unknown}
             *  @description Stores the Kind value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Kind      : Types.State.HistoryKind;
            /** @name        Previous
             *  @private
             *  @type        {unknown}
             *  @description Stores the Previous value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Previous  : T | undefined;
            /** @name        Value
             *  @private
             *  @type        {unknown}
             *  @description Stores the Value value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Value     : T;
            /** @name        Snapshot
             *  @private
             *  @type        {unknown}
             *  @description Stores the Snapshot value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Snapshot? : string;
            /** @name        Timestamp
             *  @private
             *  @type        {unknown}
             *  @description Stores the Timestamp value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Timestamp : number;
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
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name      : string;
            /** @name        Value
             *  @private
             *  @type        {unknown}
             *  @description Stores the Value value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Value     : T;
            /** @name        Timestamp
             *  @private
             *  @type        {unknown}
             *  @description Stores the Timestamp value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Timestamp : number;
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
            /** @name        Type
             *  @private
             *  @type        {unknown}
             *  @description Stores the Type value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Type      : 'State-Changed';
            /** @name        Name
             *  @private
             *  @type        {unknown}
             *  @description Stores the Name value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Name      : string;
            /** @name        Previous
             *  @private
             *  @type        {unknown}
             *  @description Stores the Previous value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Previous  : T;
            /** @name        Value
             *  @private
             *  @type        {unknown}
             *  @description Stores the Value value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Value     : T;
            /** @name        Kind
             *  @private
             *  @type        {unknown}
             *  @description Stores the Kind value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Kind      : Types.State.HistoryKind;
            /** @name        Snapshot
             *  @private
             *  @type        {unknown}
             *  @description Stores the Snapshot value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Snapshot? : string;
            /** @name        Timestamp
             *  @private
             *  @type        {unknown}
             *  @description Stores the Timestamp value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Timestamp : number;
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
            /** @name        Format
             *  @private
             *  @type        {unknown}
             *  @description Stores the Format value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Format: Types.State.Format;

            Serialize
            (
                /** @name        value
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the value value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                value   : unknown,
                /** @name        pretty
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the pretty value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                pretty? : boolean
            ): string;

            /** @name        Deserialize
             *  @private
             *  @type        {unknown}
             *  @description Stores the Deserialize value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        With
             *  @private
             *  @type        {unknown}
             *  @description Stores the With value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            With(payload: unknown): WorkerMessageBuilder;
            /** @name        Post
             *  @private
             *  @type        {unknown}
             *  @description Stores the Post value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Send
             *  @private
             *  @type        {unknown}
             *  @description Stores the Send value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
                /** @name        source
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the source value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                source   : T,
                /** @name        options
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the options value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                options? : Options
            ): unknown;

            Parse<T>
            (
                /** @name        source
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the source value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                source   : string,
                format?  : Types.State.Format,
                /** @name        options
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the options value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                options? : Options
            ): unknown;

            /** @name        RegisterSerializer
             *  @private
             *  @type        {unknown}
             *  @description Stores the RegisterSerializer value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            RegisterSerializer(serializer: Serializer): Service;
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
        export interface Service {
            Create
            (
                /** @name        callback
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the callback value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                callback?: MutationCallback,
                /** @name        configuration
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the configuration value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                configuration?: Partial<MutationObserverInit>,
                /** @name        element
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the element value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                element?: Node
            ): unknown

            /** @name        DrainAll
             *  @private
             *  @type        {unknown}
             *  @description Stores the DrainAll value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            DrainAll(): void
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
            /** @name        Tag
             *  @private
             *  @type        {unknown}
             *  @description Stores the Tag value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Tag?        : string;
            /** @name        Attributes
             *  @private
             *  @type        {unknown}
             *  @description Stores the Attributes value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Attributes? : Record<string, unknown>;
            /** @name        Children
             *  @private
             *  @type        {unknown}
             *  @description Stores the Children value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Children?   : Node[];
            /** @name        Text
             *  @private
             *  @type        {unknown}
             *  @description Stores the Text value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Text?       : string;
            /** @name        Html
             *  @private
             *  @type        {unknown}
             *  @description Stores the Html value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Html?       : string;
            /** @name        Id
             *  @private
             *  @type        {unknown}
             *  @description Stores the Id value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Id?         : string;
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
            /** @name        Hydration
             *  @private
             *  @type        {unknown}
             *  @description Stores the Hydration value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Hydration? : boolean;
            /** @name        Indent
             *  @private
             *  @type        {unknown}
             *  @description Stores the Indent value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Indent?    : number;
            /** @name        Doctype
             *  @private
             *  @type        {unknown}
             *  @description Stores the Doctype value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Doctype?   : boolean;
            /** @name        State
             *  @private
             *  @type        {unknown}
             *  @description Stores the State value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            State?     : boolean;
            /** @name        Context
             *  @private
             *  @type        {unknown}
             *  @description Stores the Context value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Context?   : boolean;
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
            /** @name        Selector
             *  @private
             *  @type        {unknown}
             *  @description Stores the Selector value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Selector? : string;
            /** @name        State
             *  @private
             *  @type        {unknown}
             *  @description Stores the State value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            State?    : string;
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
            /** @name        With
             *  @private
             *  @type        {unknown}
             *  @description Stores the With value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            With(payload: unknown): WorkerTaskBuilder;
            /** @name        Run
             *  @private
             *  @type        {unknown}
             *  @description Stores the Run value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Task
             *  @private
             *  @type        {unknown}
             *  @description Stores the Task value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            /** @name        Node
             *  @private
             *  @type        {unknown}
             *  @description Stores the Node value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Node    : Node;
            /** @name        State
             *  @private
             *  @type        {unknown}
             *  @description Stores the State value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            State?  : unknown;
            /** @name        Context
             *  @private
             *  @type        {unknown}
             *  @description Stores the Context value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Context?: unknown;
            /** @name        Url
             *  @private
             *  @type        {unknown}
             *  @description Stores the Url value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Url?    : string;
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
            /** @name        Html
             *  @private
             *  @type        {unknown}
             *  @description Stores the Html value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Html    : string;
            /** @name        State
             *  @private
             *  @type        {unknown}
             *  @description Stores the State value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            State   : string | null;
            /** @name        Context
             *  @private
             *  @type        {unknown}
             *  @description Stores the Context value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Context : unknown;
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
            /** @name        Create
             *  @private
             *  @type        {unknown}
             *  @description Stores the Create value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Create(options?: RenderOptions): unknown;
            RenderToString
            (
                /** @name        node
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the node value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                node     : SSR.Node | import('../SSR.ts').SSR.Island,
                /** @name        options
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the options value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                options? : RenderOptions
            ): string;
            Hydrate
            (
                /** @name        node
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the node value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                node     : SSR.Node | import('../SSR.ts').SSR.Island,
                /** @name        root
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the root value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                root     : ParentNode,
                /** @name        options
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the options value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                options? : HydrateOptions
            ): void;
            EscapeHtml
            (
                /** @name        value
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the value value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                value: string
            ): string
        }
    }

    /** @name        Directive
     *  @public
     *  @type        {namespace}
     *  @description Groups the Directive contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Directive
    {
        /** @name        Source
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Source.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Source<T> =
            T |
            (() => T) |
            {
                /** @name        Get
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the Get value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
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
            /** @name        Scope
             *  @private
             *  @type        {unknown}
             *  @description Stores the Scope value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
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
            Create
            (
                /** @name        name
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the name value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                name  : string,
                /** @name        apply
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the apply value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                apply : (element: Element, value: unknown, options?: Options) => () => void
            ): unknown;

            Bootstrap
            (
                /** @name        root
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the root value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                root?    : ParentNode,
                /** @name        options
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the options value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                options? : Options
            ): () => void;
        }
    }
}
