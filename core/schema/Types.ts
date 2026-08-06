/**
 * @module schema/Types
 * @description AriannA level-0 type aliases. Type-only: emits no runtime JavaScript.
 */

import type { Interfaces } from './Interfaces.ts';

/** @name        Types
 *  @public
 *  @type        {namespace}
 *  @description Groups the Types contracts and runtime surface.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Types
{
    /** @name        Common
     *  @public
     *  @type        {namespace}
     *  @description Groups the Common contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Common
    {
        /** @name        Primitive
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Primitive.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Primitive = 'string' | 'number' | 'boolean' | 'function' | 'object' | 'symbol';
        /** @name        Validation
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Validation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Validation = Primitive | 'integer' | 'array' | 'any' | ((value: unknown) => boolean);
        /** @name        Nullable
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Nullable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Nullable<T> = T | null;
        /** @name        Optional
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Optional.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Optional<T> = T | undefined;
        /** @name        Maybe
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Maybe.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Maybe<T> = T | null | undefined;
        /** @name        AnyFunction
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for AnyFunction.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type AnyFunction = (...args: unknown[]) => unknown;
        /** @name        AnyRecord
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for AnyRecord.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type AnyRecord = Record<PropertyKey, unknown>;
        /** @name        UUID
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for UUID.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type UUID = string;
        /** @name        URI
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for URI.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type URI = string;
        /** @name        Path
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Path.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Path = string;
        /** @name        Tag
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Tag.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Tag = string;
        /** @name        Packages
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Packages.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Packages =
            | string
            | readonly string[]
            | {
                /** @name        base
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the base value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                base?: string;
                /** @name        core
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the core value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                core?: boolean | string;
                /** @name        additionals
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the additionals value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                additionals?: boolean | string;
                /** @name        components
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the components value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                components?: boolean | string;
                /** @name        bundles
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the bundles value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                bundles?: readonly string[];
                /** @name        mirror
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the mirror value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                mirror?: boolean;
            };
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
        /** @name        Constructor
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Constructor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Constructor =
            | (new (...args: unknown[]) => unknown)
            | ((...args: unknown[]) => unknown);

        /** @name        ElementConstructor
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for ElementConstructor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type ElementConstructor = new (...args: unknown[]) => Element;
        /** @name        IDL
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for IDL.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type IDL = ElementConstructor;
        /** @name        Base
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Base.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Base = IDL | symbol | Constructor;
        /** @name        Native
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Native.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Native = Common.Primitive | 'class' | 'idl' | 'idl-patched' | Constructor;
        /** @name        Declaration
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Declaration.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Declaration = 'CLASS' | 'FUNCTION' | 'IDL';
        /** @name        NamespaceKind
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for NamespaceKind.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type NamespaceKind = 'html' | 'svg' | 'mathML' | 'x3d' | (string & {});
        /** @name        RenderMode
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for RenderMode.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type RenderMode = 'real' | 'virtual';
        /** @name        SlotPlacement
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for SlotPlacement.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type SlotPlacement = 'Internal' | 'External';
        /** @name        AttributeValue
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for AttributeValue.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type AttributeValue = string | number | boolean | null;
        /** @name        Attributes
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Attributes.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Attributes = Record<string, AttributeValue>;
        /** @name        Child
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Child.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Child = Node | string | number | boolean | null | undefined;
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
        /** @name        Tag
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Tag.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Tag = Common.Tag;
        /** @name        Decorator
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Decorator.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Decorator = (target: unknown) => unknown;
        /** @name        Callable
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Callable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Callable = Interfaces.Components.ComponentInterface;
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
        /** @name        NativeEvent
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for NativeEvent.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type NativeEvent = globalThis.Event;
        /** @name        Target
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Target.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Target = EventTarget | string | readonly EventTarget[];
        /** @name        Phase
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Phase.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Phase = 'capture' | 'bubble' | 'broker';
        /** @name        Listener
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Listener.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Listener = EventListenerOrEventListenerObject;
        /** @name        Handler
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Handler.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Handler<E extends globalThis.Event = globalThis.Event> = (event: E) => unknown;
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
        /** @name        RuleArguments
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for RuleArguments.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type RuleArguments = Interfaces.Css.RuleLike | CSSRule | string;
        /** @name        StylesheetArguments
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for StylesheetArguments.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type StylesheetArguments =
            | import('../Css.ts').Css.Stylesheet
            | import('../Css.ts').Css.Rule
            | Interfaces.Css.StylesheetLike
            | CSSStyleSheet
            | CSSRuleList
            | HTMLLinkElement
            | CSSRule[]
            | Interfaces.Css.RuleLike[]
            | Interfaces.Css.RuleLike
            | Interfaces.Css.StylesheetObject
            | Interfaces.Css.StylesheetObjectInterface
            | string;
        /** @name        StyleValue
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for StyleValue.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type StyleValue = string | number | boolean | null | undefined;
        /** @name        DeclarationMap
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for DeclarationMap.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type DeclarationMap = Record<string, StyleValue>;
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
        /** @name        Key
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Key.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Key = PropertyKey;
        /** @name        Path
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Path.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Path = readonly Key[];
        /** @name        ChangeKind
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for ChangeKind.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type ChangeKind = 'set' | 'add' | 'delete' | 'clear' | 'mutate';
        /** @name        Schedule
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Schedule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Schedule = 'sync' | 'microtask' | 'animation-frame' | 'idle';
        /** @name        Equality
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Equality.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Equality<T> = false | ((previous: T, next: T) => boolean);
        /** @name        Cleanup
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Cleanup.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Cleanup = () => void;
        /** @name        Stop
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Stop.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Stop = (() => void) &
        {
            /** @name        Active
             *  @private
             *  @type        {unknown}
             *  @description Stores the Active value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly Active: boolean;
            /** @name        Pause
             *  @private
             *  @type        {unknown}
             *  @description Stores the Pause value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Pause(): void;
            /** @name        Resume
             *  @private
             *  @type        {unknown}
             *  @description Stores the Resume value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Resume(run?: boolean): void;
            /** @name        Run
             *  @private
             *  @type        {unknown}
             *  @description Stores the Run value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Run(): void;
        };
        /** @name        WatchHandler
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for WatchHandler.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type WatchHandler<T> =
            (value: T, previous: T | undefined, OnCleanup: (cleanup: Cleanup) => void) => void;
        /** @name        ResourceState
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for ResourceState.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type ResourceState = 'idle' | 'pending' | 'ready' | 'refreshing' | 'error' | 'aborted';
        /** @name        ResourceFetcher
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for ResourceFetcher.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type ResourceFetcher<T, S = unknown> =
            (
                /** @name        source
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the source value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                source: S | undefined,
                /** @name        context
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the context value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                context:
                {
                    /** @name        Previous
                     *  @private
                     *  @type        {unknown}
                     *  @description Stores the Previous value used by this owner.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    Previous: T | undefined;
                    /** @name        Signal
                     *  @private
                     *  @type        {unknown}
                     *  @description Stores the Signal value used by this owner.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    Signal: AbortSignal;
                    /** @name        Refetching
                     *  @private
                     *  @type        {unknown}
                     *  @description Stores the Refetching value used by this owner.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    Refetching: boolean;
                }
            ) => T | Promise<T>;
        /** @name        Dependency
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Dependency.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Dependency = Set<Interfaces.Reactivity.Computation>;

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
        /** @name        Mode
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Mode.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Mode = 'open' | 'closed';
        /** @name        Backend
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Backend.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Backend = 'native' | 'light' | 'iframe';
        /** @name        Projection
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Projection.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Projection = 'adopt' | 'clone';
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
        /** @name        Condition
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Condition.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Condition = boolean | (() => boolean);
        /** @name        Content
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Content.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Content = string | Element | DocumentFragment | null | undefined;
        /** @name        Render
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Render.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Render<T> = (item: T, index: number) => string | Element;
        /** @name        ObjectRender
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for ObjectRender.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type ObjectRender = (key: string, value: unknown, index: number) => string | Element;
        /** @name        Update
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Update.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Update = () => void;
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
        /** @name        Mode
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Mode.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Mode = 'real' | 'virtual';
        /** @name        Key
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Key.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Key = string | number;
        /** @name        Primitive
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Primitive.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Primitive = string | number | boolean | null | undefined;
        /** @name        ElementType
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for ElementType.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type ElementType = string | symbol | Interfaces.Jsx.ComponentType<any>;
        /** @name        Node
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Node.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Node =
            /** @name        import
             *  @private
             *  @type        {unknown}
             *  @description Stores the import value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            import('../Real.ts').Reals.Real |
            /** @name        import
             *  @private
             *  @type        {unknown}
             *  @description Stores the import value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            import('../Virtual.ts').Virtuals.Virtual |
            globalThis.Node |
            Interfaces.Jsx.Fragment |
            Primitive;
        /** @name        Children
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Children.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Children = Node | readonly Children[];
        /** @name        Props
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Props.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Props = Record<string, unknown> &
            {
                /** @name        children
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the children value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                children? : Children;
                /** @name        key
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the key value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                key?      : Key;
                /** @name        ref
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the ref value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                ref?      : Interfaces.Jsx.Ref;
            };
        /** @name        ComponentClass
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for ComponentClass.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type ComponentClass<P = Props> = new (props: P) => Interfaces.Jsx.Component<P>;
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
        /** @name        Name
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Name.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Name = string;
        /** @name        State
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for State.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type State = 'registered' | 'installing' | 'installed' | 'disabled' | 'failed' | 'uninstalled';
        /** @name        Options
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Options.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Options = Readonly<Record<string, unknown>>;
        /** @name        Cleanup
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Cleanup.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Cleanup = () => void | Promise<void>;
        /** @name        Installer
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Installer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Installer =
            (
                /** @name        api
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the api value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                api     : Interfaces.Plugins.AriannAAPI,
                /** @name        options
                 *  @private
                 *  @type        {unknown}
                 *  @description Stores the options value used by this owner.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                options : Options
            ) => void | Cleanup | Promise<void | Cleanup>;
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
        /** @name        Primitive
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Primitive.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Primitive =
            'string'   |
            'number'   |
            'boolean'  |
            'function' |
            'object';

        /** @name        Type
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Type.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Type =
            Primitive |
            'integer' |
            'array'   |
            'any'     |
            ((value: unknown) => boolean);

        /** @name        Ways
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Ways.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Ways =
            1 |
            2 |
            'One' |
            'Two' |
            (string & {});

        /** @name        Bindings
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Bindings.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Bindings =
            Record<string, Interfaces.Properties.Binding>;

        /** @name        Functions
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Functions.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Functions =
            Record<string, Interfaces.Properties.Hook>;

        /** @name        Hosts
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Hosts.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Hosts =
            object |
            readonly object[] |
            ArrayLike<object>;
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
        /** @name        BindingKind
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for BindingKind.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type BindingKind = 'text' | 'attribute' | 'event' | 'if';
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
        /** @name        IslandMode
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for IslandMode.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type IslandMode = 'static' | 'interactive' | 'lazy';
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
        /** @name        Format
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Format.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Format =
            'json' |
            'xml';

        /** @name        HistoryKind
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for HistoryKind.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type HistoryKind =
            'create'  |
            'set'     |
            'update'  |
            'restore';
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
        /** Worker script mode accepted by the native Worker constructor. */
        export type WorkerType =
            'classic' |
            'module';

        /** Lifecycle of one AriannA Worker wrapper. */
        export type WorkerState =
            'Created'  |
            'Starting' |
            'Running'  |
            'Stopping' |
            'Stopped'  |
            'Failed'   |
            'Disposed';

        /** Lifecycle of one AriannA WorkerPool. */
        export type PoolState =
            'Created'  |
            'Starting' |
            'Ready'    |
            'Draining' |
            'Stopped'  |
            'Disposed';

        /** Lifecycle of a nominal Worker task. */
        export type TaskState =
            'Queued'    |
            'Running'   |
            'Completed' |
            'Failed'    |
            'Cancelled' |
            'TimedOut';

        /** Message discriminator used by the AriannA Worker protocol. */
        export type ProtocolType =
            'Task'    |
            'Message' |
            'Result'  |
            'Error'   |
            'Signal'  |
            'Event'   |
            'Ready';

        /** @name        TaskFunction
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for TaskFunction.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type TaskFunction<T = unknown> = (...args: unknown[]) => T;
        /** @name        SignalMessage
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for SignalMessage.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type SignalMessage = { type: 'arianna:signal'; key: string; value: unknown };
        /** @name        OffscreenMessage
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for OffscreenMessage.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type OffscreenMessage = { type: 'arianna:offscreen'; canvas: OffscreenCanvas };
    }

    // Canonical flat aliases used by kernel hot paths. They remain schema-owned
    // and erase completely from emitted JavaScript.
    /** @name        Primitive
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Primitive.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Primitive   = Common.Primitive;
    /** @name        Constructor
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Constructor.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Constructor = DOM.Constructor;
    /** @name        Type
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Type.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Type        = Common.Validation;
    /** @name        IDL
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for IDL.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type IDL         = DOM.IDL;
    /** @name        Native
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Native.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Native      = DOM.Native;
    /** @name        Base
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Base.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Base        = DOM.Base;
    /** @name        Declaration
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Declaration.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Declaration = DOM.Declaration;
    /** @name        Packages
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Packages.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Packages    = Common.Packages;
    /** @name        TypeOptions
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for TypeOptions.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type TypeOptions = Interfaces.Core.TypeOptions;

    /** @name        Context
     *  @public
     *  @type        {namespace}
     *  @description Groups the Context contracts and runtime surface.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Context
    {
        /** @name        Scope
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Scope.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Scope =
            'application' |
            'request'     |
            'route'       |
            'component'   |
            'worker';

        /** @name        SourceKind
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for SourceKind.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type SourceKind =
            'value' |
            'state';
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
        /** @name        Kind
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Kind.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Kind = 'if' | 'show' | 'bind' | 'model' | 'for' | 'context' | 'custom';
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
        /** @name        Method
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Method.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
        /** @name        Status
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Status.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Status = 'idle' | 'loading' | 'ready' | 'blocked' | 'not-found' | 'error';
        /** @name        Mode
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Mode.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Mode = 'history' | 'hash' | 'memory';
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
        /** @name        Mode
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Mode.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Mode = 'create' | 'lookup';
        /** @name        Default
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Default.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Default =
            /** @name        import
             *  @private
             *  @type        {unknown}
             *  @description Stores the import value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            import('../Real.ts').Reals.Real;

        /** @name        Child
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Child.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Child =
            string |
            Element |
            Node |
            Default |
            /** @name        import
             *  @private
             *  @type        {unknown}
             *  @description Stores the import value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            import('../Virtual.ts').Virtuals.Virtual |
            Interfaces.Reals.Definition |
            null;

        /** @name        Target
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Target.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Target =
            string |
            Element |
            (new (...args: unknown[]) => Element) |
            /** @name        import
             *  @private
             *  @type        {unknown}
             *  @description Stores the import value used by this owner.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            import('../Virtual.ts').Virtuals.Virtual |
            Interfaces.Reals.Definition |
            Default;
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
        /** @name        NodeType
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for NodeType.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type NodeType    = 1 | 3;
        /** @name        Attributes
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Attributes.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Attributes  = Types.DOM.Attributes;
        /** @name        Default
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Default.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Default     = import('../Virtual.ts').Virtuals.Virtual;
        /** @name        Definition
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Definition.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Definition  = import('./Interfaces.ts').Interfaces.Virtuals.Definition;
        /** @name        Definitions
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Definitions.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Definitions = readonly Definition[];
        /** @name        Child
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Child.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Child       =
            | import('../Virtual.ts').Virtuals.Virtual
            | string
            | number
            | boolean
            | null
            | undefined;
        /** @name        Target
         *  @public
         *  @type        {type alias}
         *  @description Canonical type alias for Target.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Target      =
            | Definition
            | string
            | Node
            | Element
            | HTMLTemplateElement
            | import('../Template.ts').Templates.Template
            | import('../Real.ts').default
            | import('../Virtual.ts').Virtuals.Virtual;

    }
}

