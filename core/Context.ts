/**
 * @module    core/Context
 * @author    Riccardo Angeli
 * @version   3.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Context runtime. Context removes property drilling while remaining a first-class bridge
 *              between State, Reactivity, Workers and the DOM provider tree. It supports both
 *              `Contexts.Context.Create(key, value)` and `new Contexts.Context(key, value)`.
 */

import { Core }       from './Core.ts';
import { Reactivity } from './Reactive.ts';
import { States }     from './State.ts';

import type { Types as SchemaTypes }           from './schema/Types.ts';
import type { Interfaces as SchemaInterfaces } from './schema/Interfaces.ts';

/** @name        Contexts
 *  @public
 *  @type        {namespace}
 *  @description Groups the Contexts contracts and runtime surface.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Contexts
{
    /** @name        Scope
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Scope.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Scope                = SchemaTypes.Context.Scope;
    /** @name        SourceKind
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for SourceKind.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type SourceKind           = SchemaTypes.Context.SourceKind;
    /** @name        Options
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Options.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Options              = SchemaInterfaces.Context.Options;
    /** @name        ChangeEvent
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ChangeEvent.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ChangeEvent<T>       = SchemaInterfaces.Context.ChangeEvent<T>;
    /** @name        Consumer
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Consumer.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Consumer<T>          = SchemaInterfaces.Context.Consumer<T>;
    /** @name        WorkerBridge
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for WorkerBridge.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type WorkerBridge         = SchemaInterfaces.Context.WorkerBridge;
    /** @name        StateBridge
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for StateBridge.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type StateBridge<T>       = SchemaInterfaces.Context.StateBridge<T>;
    /** @name        RecordContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for RecordContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type RecordContract<T>    = SchemaInterfaces.Context.Record<T>;
    /** @name        ServiceContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ServiceContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ServiceContract      = SchemaInterfaces.Context.Service;

    /** @class       Context
     *  @public
     *  @template    T
     *  @description Named contextual value backed by a canonical Signal and optionally bound to a State. Context
     *               records are shared by key and scope, while each instance owns its provider/consumer handles.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Context<T = unknown> extends EventTarget
    {
        /** @name        #Registry
         *  @private
         *  @static
         *  @type        {Map<string, RecordContract<unknown>>}
         *  @description Canonical context registry keyed by scope and context key.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly #Registry =
            new Map<string, RecordContract<unknown>>();

        /** @name        #key
         *  @private
         *  @type        {string}
         *  @description Context key.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #key: string;

        /** @name        #scope
         *  @private
         *  @type        {Scope}
         *  @description Context registry scope.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #scope: Scope;

        /** @name        #record
         *  @private
         *  @type        {RecordContract<T>}
         *  @description Shared record for this key and scope.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #record: RecordContract<T>;

        /** @name        #state
         *  @private
         *  @type        {StateBridge<T> | null}
         *  @description Optional State bridge used as the Context source of truth.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #state: StateBridge<T> | null = null;

        /** @name        constructor
         *  @public
         *  @param       {string} key Context key.
         *  @param       {T | StateBridge<T>} [source] Initial value or State bridge.
         *  @param       {Options} [options] Context options.
         *  @description Build or attach to a context record. Passing a State binds Context and State
         *               bidirectionally without introducing a dependency from State back to Context.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor
        (
            key      : string,
            source?  : T | StateBridge<T>,
            options? : Options
        )
        {
            super();

            this.#key    = key;
            this.#scope  = options?.Scope ?? 'application';
            this.#record = Context.#Get<T>(key, this.#scope);

            if(Context.#IsState<T>(source))
            {
                this.Bind(source);
            }
            else if(source !== undefined)
            {
                this.Set(source);
            }
        }

        /** @name        Key
         *  @public
         *  @readonly
         *  @type        {string}
         *  @description Context key.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Key(): string
        {
            return this.#key;
        }

        /** @name        Scope
         *  @public
         *  @readonly
         *  @type        {Scope}
         *  @description Context scope.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Scope(): Scope
        {
            return this.#scope;
        }

        /** @name        Value
         *  @public
         *  @type        {T | undefined}
         *  @description Current contextual value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Value(): T | undefined
        {
            return this.#record.Signal.Get();
        }

        set Value(value: T | undefined)
        {
            if(value !== undefined)
            {
                this.Set(value);
            }
        }

        /** @name        Signal
         *  @public
         *  @readonly
         *  @type        {Reactivity.Signal<T | undefined>}
         *  @description Canonical Context Signal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Signal(): Reactivity.Signal<T | undefined>
        {
            return this.#record.Signal;
        }

        /** @name        Create
         *  @public
         *  @static
         *  @template    T
         *  @param       {string} key Context key.
         *  @param       {T | StateBridge<T>} [source] Initial value or State.
         *  @param       {Options} [options] Context options.
         *  @returns     {Context<T>} A Context.
         *  @description Static factory equivalent of `new Contexts.Context(...)`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Create<T>
        (
            key      : string,
            source?  : T | StateBridge<T>,
            options? : Options
        ): Context<T>
        {
            return new Context<T>(key, source, options);
        }

        /** @name        Keys
         *  @public
         *  @static
         *  @returns     {string[]} Registered keys.
         *  @description Return all canonical registry keys.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Keys(): string[]
        {
            return Array.from(Context.#Registry.keys());
        }

        /** @name        Has
         *  @public
         *  @static
         *  @param       {string} key Context key.
         *  @param       {Scope} [scope='application'] Context scope.
         *  @returns     {boolean} Whether the record exists.
         *  @description Test the canonical registry.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Has
        (
            key   : string,
            scope : Scope = 'application'
        ): boolean
        {
            return Context.#Registry.has(Context.#Id(key, scope));
        }

        /** @name        Set
         *  @public
         *  @param       {T} value New contextual value.
         *  @returns     {Context<T>} This Context.
         *  @description Update the Context and an attached State while suppressing redundant writes.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Set(value: T): this
        {
            const previous =
                this.#record.Signal.Peek();

            if(Object.is(previous, value))
            {
                return this;
            }

            this.#record.Signal.Set(value);

            if(this.#state && !Object.is(this.#state.Peek(), value))
            {
                this.#state.Set(value);
            }

            this.#Emit(previous, value);

            return this;
        }

        /** @name        Update
         *  @public
         *  @param       {(value: T | undefined) => T} updater Context updater.
         *  @returns     {Context<T>} This Context.
         *  @description Compute and store a new value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Update(updater: (value: T | undefined) => T): this
        {
            return this.Set(updater(this.#record.Signal.Peek()));
        }

        /** @name        Bind
         *  @public
         *  @param       {StateBridge<T>} state State bridge.
         *  @returns     {Context<T>} This Context.
         *  @description Bind a State as the Context source of truth.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Bind(state: StateBridge<T>): this
        {
            this.#state = state;
            this.#record.Source = 'state';
            this.#record.Signal.Set(state.Peek());

            state.OnChange
            (
                event =>
                {
                    if(!Object.is(this.#record.Signal.Peek(), event.Value))
                    {
                        const previous =
                            this.#record.Signal.Peek();

                        this.#record.Signal.Set(event.Value);
                        this.#Emit(previous, event.Value);
                    }
                }
            );

            return this;
        }

        /** @name        Provide
         *  @public
         *  @param       {EventTarget} provider Provider target.
         *  @returns     {Context<T>} This Context.
         *  @description Register a provider and answer bubbling `arianna:context-request` events.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Provide(provider: EventTarget): this
        {
            this.#record.Providers.add(provider);

            provider.addEventListener
            (
                'arianna:context-request',
                event =>
                {
                    const request =
                        event as CustomEvent<{
                            Key     : string;
                            Scope   : Scope;
                            Resolve : (value: T | undefined) => void;
                        }>;

                    if
                    (
                        request.detail.Key !== this.#key ||
                        request.detail.Scope !== this.#scope
                    )
                    {
                        return;
                    }

                    request.stopPropagation();
                    request.detail.Resolve(this.#record.Signal.Peek());
                }
            );

            return this;
        }

        /** @name        Consume
         *  @public
         *  @param       {EventTarget} consumer Consumer target.
         *  @returns     {Consumer<T>} Consumer handle.
         *  @description Resolve the nearest DOM provider while retaining the canonical Signal fallback.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Consume(consumer: EventTarget): Consumer<T>
        {
            let resolved = false;

            consumer.dispatchEvent
            (
                new CustomEvent
                (
                    'arianna:context-request',
                    {
                        bubbles  : true,
                        composed : true,
                        detail   :
                        {
                            Key     : this.#key,
                            Scope   : this.#scope,
                            Resolve : (value: T | undefined) =>
                            {
                                if(!resolved)
                                {
                                    resolved = true;

                                    if(value !== undefined)
                                    {
                                        this.#record.Signal.Set(value);
                                    }
                                }
                            }
                        }
                    }
                )
            );

            this.#record.Consumers.add(consumer);

            const handle: Consumer<T> =
            {
                get Value()
                {
                    return thisContext.#record.Signal.Get();
                },

                Signal()
                {
                    return thisContext.#record.Signal;
                },

                Detach()
                {
                    thisContext.#record.Consumers.delete(consumer);
                }
            };

            const thisContext = this;

            return handle;
        }

        /** @name        Send
         *  @public
         *  @param       {WorkerBridge} worker Worker or WorkerPool.
         *  @param       {string} [message='Context'] Nominal message.
         *  @returns     {Context<T>} This Context.
         *  @description Send the Context value through Workers without importing Workers.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Send
        (
            worker  : WorkerBridge,
            message : string = 'Context'
        ): this
        {
            worker
                .Send(message)
                .With
                (
                    {
                        Key    : this.#key,
                        Scope  : this.#scope,
                        Source : this.#record.Source,
                        Value  : this.#record.Signal.Peek()
                    }
                )
                .Post();

            return this;
        }

        

        /** @name        Dispose
         *  @public
         *  @returns     {void}
         *  @description Detach providers, consumers and this record from the canonical registry.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Dispose(): void
        {
            this.#record.Providers.clear();
            this.#record.Consumers.clear();
            Context.#Registry.delete(Context.#Id(this.#key, this.#scope));
            this.#state = null;
        }

        /** @name        #Get
         *  @private
         *  @static
         *  @template    T
         *  @param       {string} key Context key.
         *  @param       {Scope} scope Context scope.
         *  @returns     {RecordContract<T>} Canonical record.
         *  @description Get or create a canonical Context record.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #Get<T>
        (
            key   : string,
            scope : Scope
        ): RecordContract<T>
        {
            const id =
                Context.#Id(key, scope);

            let record =
                Context.#Registry.get(id);

            if(!record)
            {
                record =
                {
                    Key       : key,
                    Scope     : scope,
                    Source    : 'value',
                    Signal    : new Reactivity.Signal<unknown>(undefined),
                    Providers : new Set<EventTarget>(),
                    Consumers : new Set<EventTarget>()
                };

                Context.#Registry.set(id, record);
            }

            return record as RecordContract<T>;
        }

        /** @name        #Id
         *  @private
         *  @static
         *  @param       {string} key Context key.
         *  @param       {Scope} scope Context scope.
         *  @returns     {string} Registry identifier.
         *  @description Build a deterministic scope/key identifier.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #Id
        (
            key   : string,
            scope : Scope
        ): string
        {
            return `${scope}:${key}`;
        }

        /** @name        #IsState
         *  @private
         *  @static
         *  @template    T
         *  @param       {unknown} value Candidate State.
         *  @returns     {value is StateBridge<T>} Whether value implements the bridge.
         *  @description Structural State guard.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #IsState<T>(value: unknown): value is StateBridge<T>
        {
            return Boolean
            (
                value &&
                typeof value === 'object' &&
                'Peek' in value &&
                'Set' in value &&
                'OnChange' in value
            );
        }

        

        /** @name        #Emit
         *  @private
         *  @param       {T | undefined} previous Previous value.
         *  @param       {T} value New value.
         *  @returns     {void}
         *  @description Emit a canonical Context change event.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #Emit
        (
            previous : T | undefined,
            value    : T
        ): void
        {
            const detail: ChangeEvent<T> =
            {
                Type      : 'Context-Changed',
                Key       : this.#key,
                Scope     : this.#scope,
                Previous  : previous,
                Value     : value,
                Timestamp : Date.now()
            };

            this.dispatchEvent
            (
                new CustomEvent<ChangeEvent<T>>
                (
                    detail.Type,
                    {
                        detail
                    }
                )
            );
        }
    }

    /** @class       Service
     *  @public
     *  @implements  {ServiceContract}
     *  @description Core Context service.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const Service = new Core.Services.Service<ServiceContract>
    (
        'context',
        {
            Create<T>
            (
                key      : string,
                source?  : T | StateBridge<T>,
                options? : Options
            ): Context<T>
            { return Context.Create(key, source, options); },

            Has
            (
                key   : string,
                scope : Scope = 'application'
            ): boolean
            { return Context.Has(key, scope); },

            Keys(): string[]
            { return Context.Keys(); }
        }
    );
}

export default Contexts.Context;
