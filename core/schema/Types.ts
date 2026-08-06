/**
 * @module schema/Types
 * @description AriannA level-0 type aliases. Type-only: emits no runtime JavaScript.
 */

import type { Interfaces } from './Interfaces.ts';

export namespace Types
{
    export namespace Common
    {
        export type Primitive = 'string' | 'number' | 'boolean' | 'function' | 'object' | 'symbol';
        export type Validation = Primitive | 'integer' | 'array' | 'any' | ((value: unknown) => boolean);
        export type Nullable<T> = T | null;
        export type Optional<T> = T | undefined;
        export type Maybe<T> = T | null | undefined;
        export type AnyFunction = (...args: unknown[]) => unknown;
        export type AnyRecord = Record<PropertyKey, unknown>;
        export type UUID = string;
        export type URI = string;
        export type Path = string;
        export type Tag = string;
        export type Packages =
            | string
            | readonly string[]
            | {
                base?: string;
                core?: boolean | string;
                additionals?: boolean | string;
                components?: boolean | string;
                bundles?: readonly string[];
                mirror?: boolean;
            };
    }

    export namespace DOM
    {
        export type Constructor =
            | (new (...args: unknown[]) => unknown)
            | ((...args: unknown[]) => unknown);

        export type ElementConstructor = new (...args: unknown[]) => Element;
        export type IDL = ElementConstructor;
        export type Base = IDL | symbol | Constructor;
        export type Native = Common.Primitive | 'class' | 'idl' | 'idl-patched' | Constructor;
        export type Declaration = 'CLASS' | 'FUNCTION' | 'IDL';
        export type NamespaceKind = 'html' | 'svg' | 'mathML' | 'x3d' | (string & {});
        export type RenderMode = 'real' | 'virtual';
        export type SlotPlacement = 'Internal' | 'External';
        export type AttributeValue = string | number | boolean | null;
        export type Attributes = Record<string, AttributeValue>;
        export type Child = Node | string | number | boolean | null | undefined;
    }

    export namespace Components
    {
        export type Tag = Common.Tag;
        export type Decorator = (target: unknown) => unknown;
        export type Callable = Interfaces.Components.ComponentInterface;
    }

    export namespace Events
    {
        export type NativeEvent = globalThis.Event;
        export type Target = EventTarget | string | readonly EventTarget[];
        export type Phase = 'capture' | 'bubble' | 'broker';
        export type Listener = EventListenerOrEventListenerObject;
        export type Handler<E extends globalThis.Event = globalThis.Event> = (event: E) => unknown;
    }

    export namespace Css
    {
        export type RuleArguments = Interfaces.Css.RuleLike | CSSRule | string;
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
        export type StyleValue = string | number | boolean | null | undefined;
        export type DeclarationMap = Record<string, StyleValue>;
    }

    export namespace Reactivity
    {
        export type Key = PropertyKey;
        export type Path = readonly Key[];
        export type ChangeKind = 'set' | 'add' | 'delete' | 'clear' | 'mutate';
        export type Schedule = 'sync' | 'microtask' | 'animation-frame' | 'idle';
        export type Equality<T> = false | ((previous: T, next: T) => boolean);
        export type Cleanup = () => void;
        export type Stop = (() => void) &
        {
            readonly Active: boolean;
            Pause(): void;
            Resume(run?: boolean): void;
            Run(): void;
        };
        export type WatchHandler<T> =
            (value: T, previous: T | undefined, OnCleanup: (cleanup: Cleanup) => void) => void;
        export type ResourceState = 'idle' | 'pending' | 'ready' | 'refreshing' | 'error' | 'aborted';
        export type ResourceFetcher<T, S = unknown> =
            (
                source: S | undefined,
                context:
                {
                    Previous: T | undefined;
                    Signal: AbortSignal;
                    Refetching: boolean;
                }
            ) => T | Promise<T>;
        export type Dependency = Set<Interfaces.Reactivity.Computation>;

    }

    export namespace Shadow
    {
        export type Mode = 'open' | 'closed';
        export type Backend = 'native' | 'light' | 'iframe';
        export type Projection = 'adopt' | 'clone';
    }

    export namespace Directives
    {
        export type Condition = boolean | (() => boolean);
        export type Content = string | Element | DocumentFragment | null | undefined;
        export type Render<T> = (item: T, index: number) => string | Element;
        export type ObjectRender = (key: string, value: unknown, index: number) => string | Element;
        export type Update = () => void;
    }

    export namespace Jsx
    {
        export type Mode = 'real' | 'virtual';
        export type Key = string | number;
        export type Primitive = string | number | boolean | null | undefined;
        export type ElementType = string | symbol | Interfaces.Jsx.ComponentType<any>;
        export type Node =
            import('../Real.ts').Reals.Real |
            import('../Virtual.ts').Virtuals.Virtual |
            globalThis.Node |
            Interfaces.Jsx.Fragment |
            Primitive;
        export type Children = Node | readonly Children[];
        export type Props = Record<string, unknown> &
            {
                children? : Children;
                key?      : Key;
                ref?      : Interfaces.Jsx.Ref;
            };
        export type ComponentClass<P = Props> = new (props: P) => Interfaces.Jsx.Component<P>;
    }

    export namespace Plugins
    {
        export type Name = string;
        export type State = 'registered' | 'installing' | 'installed' | 'disabled' | 'failed' | 'uninstalled';
        export type Options = Readonly<Record<string, unknown>>;
        export type Cleanup = () => void | Promise<void>;
        export type Installer =
            (
                api     : Interfaces.Plugins.AriannAAPI,
                options : Options
            ) => void | Cleanup | Promise<void | Cleanup>;
    }

    export namespace Properties
    {
        export type Primitive =
            'string'   |
            'number'   |
            'boolean'  |
            'function' |
            'object';

        export type Type =
            Primitive |
            'integer' |
            'array'   |
            'any'     |
            ((value: unknown) => boolean);

        export type Ways =
            1 |
            2 |
            'One' |
            'Two' |
            (string & {});

        export type Bindings =
            Record<string, Interfaces.Properties.Binding>;

        export type Functions =
            Record<string, Interfaces.Properties.Hook>;

        export type Hosts =
            object |
            readonly object[] |
            ArrayLike<object>;
    }

    export namespace Template
    {
        export type BindingKind = 'text' | 'attribute' | 'event' | 'if';
    }

    export namespace SSR
    {
        export type IslandMode = 'static' | 'interactive' | 'lazy';
    }

    export namespace State
    {
        export type Format =
            'json' |
            'xml';

        export type HistoryKind =
            'create'  |
            'set'     |
            'update'  |
            'restore';
    }

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

        export type TaskFunction<T = unknown> = (...args: unknown[]) => T;
        export type SignalMessage = { type: 'arianna:signal'; key: string; value: unknown };
        export type OffscreenMessage = { type: 'arianna:offscreen'; canvas: OffscreenCanvas };
    }

    // Canonical flat aliases used by kernel hot paths. They remain schema-owned
    // and erase completely from emitted JavaScript.
    export type Primitive   = Common.Primitive;
    export type Constructor = DOM.Constructor;
    export type Type        = Common.Validation;
    export type IDL         = DOM.IDL;
    export type Native      = DOM.Native;
    export type Base        = DOM.Base;
    export type Declaration = DOM.Declaration;
    export type Packages    = Common.Packages;
    export type TypeOptions = Interfaces.Core.TypeOptions;

    export namespace Context
    {
        export type Scope =
            'application' |
            'request'     |
            'route'       |
            'component'   |
            'worker';

        export type SourceKind =
            'value' |
            'state';
    }

    export namespace Directive
    {
        export type Kind = 'if' | 'show' | 'bind' | 'model' | 'for' | 'context' | 'custom';
    }

    export namespace Router
    {
        export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
        export type Status = 'idle' | 'loading' | 'ready' | 'blocked' | 'not-found' | 'error';
        export type Mode = 'history' | 'hash' | 'memory';
    }

    export namespace Reals
    {
        export type Mode = 'create' | 'lookup';
        export type Default =
            import('../Real.ts').Reals.Real;

        export type Child =
            string |
            Element |
            Node |
            Default |
            import('../Virtual.ts').Virtuals.Virtual |
            Interfaces.Reals.Definition |
            null;

        export type Target =
            string |
            Element |
            (new (...args: unknown[]) => Element) |
            import('../Virtual.ts').Virtuals.Virtual |
            Interfaces.Reals.Definition |
            Default;
    }

    export namespace Virtuals
    {
        export type NodeType    = 1 | 3;
        export type Attributes  = Types.DOM.Attributes;
        export type Default     = import('../Virtual.ts').Virtuals.Virtual;
        export type Definition  = import('./Interfaces.ts').Interfaces.Virtuals.Definition;
        export type Definitions = readonly Definition[];
        export type Child       =
            | import('../Virtual.ts').Virtuals.Virtual
            | string
            | number
            | boolean
            | null
            | undefined;
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

