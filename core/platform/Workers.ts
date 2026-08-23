/**
 * @module    core/Workers
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Worker runtime. The `Workers` namespace exposes only the two public runtime classes
 *              (`Worker`, `WorkerPool`) and optional type shortcuts imported from Schema. Every variable,
 *              helper, builder, protocol function and lifecycle implementation is owned by one of those
 *              classes; no operational code is scattered in the namespace.
 */

import type { Types }      from '../definitions/Types.ts';
import type { Interfaces } from '../definitions/Interfaces.ts';

import { Core }       from '../kernel/Core.ts';
import { Services }   from '../kernel/Services.ts';
import { Reactivity } from '../reactivity/Reactivity.ts';

/** @name        Workers
 *  @public
 *  @type        {namespace}
 *  @description Groups the Workers contracts and runtime surface.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Workers
{
    /** @name        WorkerState
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for WorkerState.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type WorkerState      = Types.Workers.WorkerState;
    /** @name        PoolState
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for PoolState.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type PoolState        = Types.Workers.PoolState;
    /** @name        WorkerType
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for WorkerType.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type WorkerType       = Types.Workers.WorkerType;

    /** @name        WorkerOptions
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for WorkerOptions.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type WorkerOptions    = Interfaces.Workers.WorkerOptions;
    /** @name        PoolOptions
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for PoolOptions.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type PoolOptions      = Interfaces.Workers.PoolOptions;
    /** @name        TaskExecutor
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for TaskExecutor.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type TaskExecutor     = Interfaces.Workers.TaskExecutor;
    /** @name        MessageSender
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for MessageSender.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type MessageSender    = Interfaces.Workers.MessageSender;
    /** @name        PendingTask
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for PendingTask.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type PendingTask      = Interfaces.Workers.PendingTask;
    /** @name        Handlers
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Handlers.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Handlers         = Interfaces.Workers.Handlers;
    /** @name        ReadyMessage
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ReadyMessage.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ReadyMessage     = Interfaces.Workers.ReadyMessage;
    /** @name        TaskRequest
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for TaskRequest.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type TaskRequest      = Interfaces.Workers.TaskRequest;
    /** @name        MessageRequest
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for MessageRequest.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type MessageRequest   = Interfaces.Workers.MessageRequest;
    /** @name        ProtocolMessage
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ProtocolMessage.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ProtocolMessage  = Interfaces.Workers.ProtocolMessage;
    /** @name        ResultMessage
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ResultMessage.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ResultMessage    = Interfaces.Workers.ResultMessage;
    /** @name        ErrorMessage
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ErrorMessage.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ErrorMessage     = Interfaces.Workers.ErrorMessage;
    /** @name        SignalMessage
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for SignalMessage.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type SignalMessage    = Interfaces.Workers.SignalMessage;
    /** @name        EventMessage
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for EventMessage.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type EventMessage     = Interfaces.Workers.EventMessage;
    /** @name        QueuedTask
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for QueuedTask.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type QueuedTask       = Interfaces.Workers.QueuedTask;
    /** @name        ServiceContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ServiceContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ServiceContract  = Interfaces.Workers.Service;

    /** @class       Worker
     *  @public
     *  @description Fluent wrapper around one native Dedicated Worker. Supports both
     *               `Workers.Worker.Create(url)` and `new Workers.Worker(url)`, named tasks,
     *               fire-and-forget messages, transferables, shared Signals, OffscreenCanvas,
     *               retries, timeouts and a complete lifecycle.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Worker implements TaskExecutor, MessageSender
    {
        /** @name        #SharedSignals
         *  @private
         *  @static
         *  @type        {Map<string, Reactivity.Signal<unknown>>}
         *  @description Canonical cross-thread Signal registry. One Signal exists for each key.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly #SharedSignals = new Map<string, Reactivity.Signal<unknown>>();

        /** @name        #Sequence
         *  @private
         *  @static
         *  @type        {number}
         *  @description Monotonic request sequence used by #Identifier.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #Sequence = 0;

        /** @name        TaskBuilder
         *  @public
         *  @static
         *  @description Fluent named-task builder owned by Worker. `Run` is the terminal operation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly TaskBuilder = class TaskBuilder<T = unknown>
        {
            /** @name        #name
             *  @private
             *  @type        {string}
             *  @description Nominal Worker handler name.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly #name: string;

            /** @name        #executor
             *  @private
             *  @type        {TaskExecutor}
             *  @description Worker execution endpoint used by Run.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly #executor: TaskExecutor;

            /** @name        #payload
             *  @private
             *  @type        {unknown}
             *  @description Structured-clone task payload.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            #payload: unknown = undefined;

            /** @name        #transfer
             *  @private
             *  @type        {Transferable[]}
             *  @description Transferables moved with the task.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            #transfer: Transferable[] = [];

            /** @name        #timeout
             *  @private
             *  @type        {number | undefined}
             *  @description Optional per-task timeout.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            #timeout: number | undefined;

            /** @name        #retry
             *  @private
             *  @type        {number | undefined}
             *  @description Optional per-task retry override.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            #retry: number | undefined;

            /** @name        constructor
             *  @public
             *  @param       {string} name Nominal handler name.
             *  @param       {TaskExecutor} executor Worker executor.
             *  @description Build a task draft without posting anything.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            constructor
            (
                name     : string,
                executor : TaskExecutor
            )
            {
                this.#name     = name;
                this.#executor = executor;
            }

            /** @name        With
             *  @public
             *  @param       {unknown} payload Structured-clone task payload.
             *  @returns     {this} This builder.
             *  @description Set the task payload.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            With(payload: unknown): this
            {
                this.#payload = payload;

                return this;
            }

            /** @name        Transfer
             *  @public
             *  @param       {...Transferable} values Transferables moved with the task.
             *  @returns     {this} This builder.
             *  @description Append transferables.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Transfer(...values: Transferable[]): this
            {
                this.#transfer.push(...values);

                return this;
            }

            /** @name        Timeout
             *  @public
             *  @param       {number} milliseconds Timeout in milliseconds.
             *  @returns     {this} This builder.
             *  @description Override the Worker default timeout.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Timeout(milliseconds: number): this
            {
                this.#timeout = Math.max(0, milliseconds);

                return this;
            }

            /** @name        Retry
             *  @public
             *  @param       {number} count Retry count.
             *  @returns     {this} This builder.
             *  @description Override the Worker default retry count.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Retry(count: number): this
            {
                this.#retry = Math.max(0, Math.floor(count));

                return this;
            }

            /** @name        Run
             *  @public
             *  @returns     {Promise<T>} Named task result.
             *  @description Terminal operation. Build and execute the task request.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Run(): Promise<T>
            {
                return this.#executor.Execute<T>
                (
                    {
                        Id       : Worker.#Identifier(),
                        Type     : 'Task',
                        Name     : this.#name,
                        Payload  : this.#payload,
                        Transfer : [...this.#transfer],
                        Timeout  : this.#timeout,
                        Retry    : this.#retry
                    }
                );
            }
        };

        /** @name        MessageBuilder
         *  @public
         *  @static
         *  @description Fluent fire-and-forget message builder owned by Worker. `Post` is terminal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly MessageBuilder = class MessageBuilder
        {
            /** @name        #name
             *  @private
             *  @type        {string}
             *  @description Nominal message handler name.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly #name: string;

            /** @name        #sender
             *  @private
             *  @type        {MessageSender}
             *  @description Worker message endpoint used by Post.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            readonly #sender: MessageSender;

            /** @name        #payload
             *  @private
             *  @type        {unknown}
             *  @description Structured-clone message payload.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            #payload: unknown = undefined;

            /** @name        #transfer
             *  @private
             *  @type        {Transferable[]}
             *  @description Transferables moved with the message.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            #transfer: Transferable[] = [];

            /** @name        constructor
             *  @public
             *  @param       {string} name Nominal message name.
             *  @param       {MessageSender} sender Worker message sender.
             *  @description Build a message draft.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            constructor
            (
                name   : string,
                sender : MessageSender
            )
            {
                this.#name   = name;
                this.#sender = sender;
            }

            /** @name        With
             *  @public
             *  @param       {unknown} payload Structured-clone message payload.
             *  @returns     {this} This builder.
             *  @description Set the message payload.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            With(payload: unknown): this
            {
                this.#payload = payload;

                return this;
            }

            /** @name        Transfer
             *  @public
             *  @param       {...Transferable} values Transferables moved with the message.
             *  @returns     {this} This builder.
             *  @description Append transferables.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Transfer(...values: Transferable[]): this
            {
                this.#transfer.push(...values);

                return this;
            }

            /** @name        Post
             *  @public
             *  @returns     {void}
             *  @description Terminal operation. Post the named message.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Post(): void
            {
                this.#sender.Post
                (
                    {
                        Id       : Worker.#Identifier(),
                        Type     : 'Message',
                        Name     : this.#name,
                        Payload  : this.#payload,
                        Transfer : [...this.#transfer]
                    }
                );
            }
        };

        /** @name        #url
         *  @private
         *  @type        {string | URL}
         *  @description Native Worker URL.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #url: string | URL;

        /** @name        #options
         *  @private
         *  @type        {WorkerOptions}
         *  @description Fluent Worker configuration.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #options: WorkerOptions;

        /** @name        #worker
         *  @private
         *  @type        {globalThis.Worker | null}
         *  @description Native Worker after Start.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #worker: globalThis.Worker | null = null;

        /** @name        #state
         *  @private
         *  @type        {WorkerState}
         *  @description Current lifecycle state.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #state: WorkerState = 'Created';

        /** @name        #pending
         *  @private
         *  @type        {Map<string, PendingTask>}
         *  @description Pending task map.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #pending = new Map<string, PendingTask>();

        /** @name        #events
         *  @private
         *  @type        {Map<string, Set<(detail: unknown) => void>>}
         *  @description Named Worker event handlers.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #events = new Map<string, Set<(detail: unknown) => void>>();

        /** @name        #errors
         *  @private
         *  @type        {Set<(error: Error) => void>}
         *  @description Worker error subscribers.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        readonly #errors = new Set<(error: Error) => void>();

        /** @name        constructor
         *  @public
         *  @param       {string | URL} url Worker URL.
         *  @param       {WorkerOptions} [options] Initial options.
         *  @description Build a Worker wrapper without starting the native Worker.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor
        (
            url      : string | URL,
            options? : WorkerOptions
        )
        {
            this.#url = url;

            this.#options =
            {
                Name    : options?.Name,
                Type    : options?.Type ?? 'module',
                Timeout : options?.Timeout ?? 0,
                Retry   : options?.Retry ?? 0
            };
        }

        /** @name        State
         *  @public
         *  @readonly
         *  @type        {WorkerState}
         *  @description Current Worker lifecycle state.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get State(): WorkerState
        {
            return this.#state;
        }

        /** @name        Native
         *  @public
         *  @readonly
         *  @type        {globalThis.Worker | null}
         *  @description Native Worker or null.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get Native(): globalThis.Worker | null
        {
            return this.#worker;
        }

        /** @name        Create
         *  @public
         *  @static
         *  @param       {string | URL} url Worker URL.
         *  @param       {WorkerOptions} [options] Initial options.
         *  @returns     {Worker} A new Worker wrapper.
         *  @description Static factory equivalent of `new Workers.Worker(...)`.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Create
        (
            url      : string | URL,
            options? : WorkerOptions
        ): Worker
        {
            return new Worker(url, options);
        }

        /** @name        SharedSignal
         *  @public
         *  @static
         *  @template    T
         *  @param       {string} key Signal key.
         *  @param       {T} initial Initial value.
         *  @returns     {Reactivity.Signal<T>} Canonical Signal.
         *  @description Create or retrieve a cross-thread Signal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static SharedSignal<T>
        (
            key     : string,
            initial : T
        ): Reactivity.Signal<T>
        {
            const existing = Worker.#SharedSignals.get(key);

            if(existing)
            {
                return existing as Reactivity.Signal<T>;
            }

            const signal = new Reactivity.Signal<T>(initial);

            Worker.#SharedSignals.set
            (
                key,
                signal as Reactivity.Signal<unknown>
            );

            return signal;
        }

        /** @name        PostSignal
         *  @public
         *  @static
         *  @param       {string} key Signal key.
         *  @param       {unknown} value Signal value.
         *  @returns     {void}
         *  @description Worker-side Signal protocol helper.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static PostSignal
        (
            key   : string,
            value : unknown
        ): void
        {
            const scope =
                globalThis as unknown as
                {
                    postMessage?: (message: unknown) => void;
                    document?: Document;
                };

            if(scope.document || typeof scope.postMessage !== 'function')
            {
                throw new TypeError
                (
                    '[arianna] Worker.PostSignal() is available only inside a Worker.'
                );
            }

            scope.postMessage
            (
                {
                    Type  : 'Signal',
                    Key   : key,
                    Value : value
                } satisfies SignalMessage
            );
        }

        /** @name        PostEvent
         *  @public
         *  @static
         *  @param       {string} name Event name.
         *  @param       {unknown} detail Event detail.
         *  @returns     {void}
         *  @description Worker-side nominal event helper.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static PostEvent
        (
            name   : string,
            detail : unknown
        ): void
        {
            const scope =
                globalThis as unknown as
                {
                    postMessage?: (message: unknown) => void;
                    document?: Document;
                };

            if(scope.document || typeof scope.postMessage !== 'function')
            {
                throw new TypeError
                (
                    '[arianna] Worker.PostEvent() is available only inside a Worker.'
                );
            }

            scope.postMessage
            (
                {
                    Type   : 'Event',
                    Name   : name,
                    Detail : detail
                } satisfies EventMessage
            );
        }

        /** @name        Handle
         *  @public
         *  @static
         *  @param       {Handlers} handlers Named handlers.
         *  @returns     {void}
         *  @description Install the Worker-side task/message router.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static Handle
        (
            handlers: Handlers
        ): void
        {
            const scope =
                globalThis as unknown as
                {
                    addEventListener
                    (
                        type     : 'message',
                        listener : (event: MessageEvent) => void
                    ): void;

                    postMessage(message: unknown): void;

                    document?: Document;
                };

            if(scope.document)
            {
                throw new TypeError
                (
                    '[arianna] Worker.Handle() is available only inside a Worker.'
                );
            }

            scope.addEventListener
            (
                'message',
                async event =>
                {
                    const message =
                        event.data as ProtocolMessage;

                    if
                    (
                        !message ||
                        typeof message.Name !== 'string'
                    )
                    {
                        return;
                    }

                    const id =
                        message.Id;

                    if
                    (
                        message.Type === 'Task' &&
                        typeof id !== 'string'
                    )
                    {
                        scope.postMessage
                        (
                            {
                                Type  : 'Error',
                                Error :
                                {
                                    Message:
                                        `[arianna] Worker task '${message.Name}' has no valid Id.`
                                }
                            } satisfies ErrorMessage
                        );

                        return;
                    }

                    const handler =
                        handlers[message.Name];

                    if(typeof handler !== 'function')
                    {
                        if(message.Type === 'Task')
                        {
                            scope.postMessage
                            (
                                {
                                    Id    : id,
                                    Type  : 'Error',
                                    Error :
                                    {
                                        Message:
                                            `[arianna] Unknown Worker handler '${message.Name}'.`
                                    }
                                } satisfies ErrorMessage
                            );
                        }

                        return;
                    }

                    try
                    {
                        const result =
                            await handler(message.Payload, message);

                        if(message.Type === 'Task')
                        {
                            const taskId = message.Id;

                            if(typeof taskId !== 'string')
                            {
                                return;
                            }

                            scope.postMessage
                            (
                                {
                                    Id    : taskId,
                                    Type  : 'Result',
                                    Value : result
                                } satisfies ResultMessage
                            );
                        }
                    }
                    catch(error)
                    {
                        if(message.Type === 'Task')
                        {
                            scope.postMessage
                            (
                                {
                                    Id    : id,
                                    Type  : 'Error',
                                    Error :
                                    {
                                        Message:
                                            Worker.#ErrorFrom(error).message
                                    }
                                } satisfies ErrorMessage
                            );
                        }
                    }
                }
            );

            scope.postMessage
            (
                {
                    Type: 'Ready'
                } satisfies ReadyMessage
            );
        }

        /** @name        Module
         *  @public
         *  @returns     {this} This Worker.
         *  @description Configure module mode before Start.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Module(): this
        {
            this.#AssertConfigurable();
            this.#options.Type = 'module';

            return this;
        }

        /** @name        Classic
         *  @public
         *  @returns     {this} This Worker.
         *  @description Configure classic mode before Start.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Classic(): this
        {
            this.#AssertConfigurable();
            this.#options.Type = 'classic';

            return this;
        }

        /** @name        Name
         *  @public
         *  @param       {string} value Worker name.
         *  @returns     {this} This Worker.
         *  @description Configure the native Worker name before Start.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Name(value: string): this
        {
            this.#AssertConfigurable();
            this.#options.Name = value;

            return this;
        }

        /** @name        Timeout
         *  @public
         *  @param       {number} milliseconds Default timeout.
         *  @returns     {this} This Worker.
         *  @description Configure the default task timeout.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Timeout(milliseconds: number): this
        {
            this.#options.Timeout = Math.max(0, milliseconds);

            return this;
        }

        /** @name        Retry
         *  @public
         *  @param       {number} count Default retry count.
         *  @returns     {this} This Worker.
         *  @description Configure the default retry count.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Retry(count: number): this
        {
            this.#options.Retry = Math.max(0, Math.floor(count));

            return this;
        }

        /** @name        On
         *  @public
         *  @param       {string} name Nominal event name.
         *  @param       {(detail: unknown) => void} handler Event handler.
         *  @returns     {this} This Worker.
         *  @description Register a named event listener.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        On
        (
            name    : string,
            handler : (detail: unknown) => void
        ): this
        {
            let handlers = this.#events.get(name);

            if(!handlers)
            {
                handlers = new Set();
                this.#events.set(name, handlers);
            }

            handlers.add(handler);

            return this;
        }

        /** @name        OnError
         *  @public
         *  @param       {(error: Error) => void} handler Error handler.
         *  @returns     {this} This Worker.
         *  @description Register a Worker error subscriber.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        OnError(handler: (error: Error) => void): this
        {
            this.#errors.add(handler);

            return this;
        }

        /** @name        Start
         *  @public
         *  @returns     {this} This Worker.
         *  @description Create the native Worker once.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Start(): this
        {
            if(this.#worker)
            {
                return this;
            }

            if(this.#state === 'Disposed')
            {
                throw new Error
                (
                    '[arianna] Cannot restart a disposed Worker.'
                );
            }

            this.#state = 'Starting';

            try
            {
                this.#worker = new globalThis.Worker
                (
                    this.#url,
                    {
                        type : this.#options.Type,
                        name : this.#options.Name
                    }
                );

                this.#worker.addEventListener
                (
                    'message',
                    event => this.#Route(event.data)
                );

                this.#worker.addEventListener
                (
                    'error',
                    event => this.#NativeError(event)
                );

                this.#worker.addEventListener
                (
                    'messageerror',
                    event => this.#NativeError(event)
                );

                this.#state = 'Running';
            }
            catch(error)
            {
                this.#state = 'Failed';
                this.#EmitError(Worker.#ErrorFrom(error));

                throw error;
            }

            return this;
        }

        /** @name        Task
         *  @public
         *  @template    T
         *  @param       {string} name Nominal task handler.
         *  @returns     {InstanceType<typeof Worker.TaskBuilder<T>>} A fluent task builder.
         *  @description Open a named task chain.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Task<T = unknown>(name: string)
        {
            return new Worker.TaskBuilder<T>(name, this);
        }

        /** @name        Send
         *  @public
         *  @param       {string} name Nominal message handler.
         *  @returns     {InstanceType<typeof Worker.MessageBuilder>} A fluent message builder.
         *  @description Open a fire-and-forget message chain.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Send(name: string)
        {
            return new Worker.MessageBuilder(name, this);
        }

        /** @name        SharedSignal
         *  @public
         *  @template    T
         *  @param       {string} key Signal key.
         *  @param       {T} initial Initial value.
         *  @returns     {Reactivity.Signal<T>} Canonical Signal.
         *  @description Instance convenience over Worker.SharedSignal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        SharedSignal<T>
        (
            key     : string,
            initial : T
        ): Reactivity.Signal<T>
        {
            return Worker.SharedSignal(key, initial);
        }

        /** @name        Offscreen
         *  @public
         *  @param       {HTMLCanvasElement} canvas Canvas to transfer.
         *  @returns     {this} This Worker.
         *  @description Transfer canvas control and post it to the `Offscreen` handler.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Offscreen(canvas: HTMLCanvasElement): this
        {
            if(!('transferControlToOffscreen' in canvas))
            {
                throw new Error
                (
                    '[arianna] OffscreenCanvas is not supported in this browser.'
                );
            }

            const offscreen =
                (
                    canvas as unknown as
                    {
                        transferControlToOffscreen(): OffscreenCanvas;
                    }
                ).transferControlToOffscreen();

            this
                .Send('Offscreen')
                .With(offscreen)
                .Transfer(offscreen as unknown as Transferable)
                .Post();

            return this;
        }

        /** @name        Execute
         *  @public
         *  @template    T
         *  @param       {TaskRequest} request Task request.
         *  @returns     {Promise<T>} Task result.
         *  @description TaskExecutor implementation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Execute<T>
        (
            request: TaskRequest
        ): Promise<T>
        {
            this.Start();

            return this.#Attempt<T>
            (
                request,
                request.Retry ?? this.#options.Retry ?? 0
            );
        }

        /** @name        Post
         *  @public
         *  @param       {MessageRequest} request Message request.
         *  @returns     {void}
         *  @description MessageSender implementation.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Post
        (
            request: MessageRequest
        ): void
        {
            this.Start();

            this.#worker?.postMessage
            (
                {
                    Id      : request.Id,
                    Type    : request.Type,
                    Name    : request.Name,
                    Payload : request.Payload
                } satisfies ProtocolMessage,
                request.Transfer
            );
        }

        /** @name        Stop
         *  @public
         *  @param       {unknown} [reason] Pending-task rejection reason.
         *  @returns     {this} This Worker.
         *  @description Stop the native Worker and reject pending tasks.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Stop(reason?: unknown): this
        {
            if(this.#worker)
            {
                this.#state = 'Stopping';
                this.#worker.terminate();
                this.#worker = null;
            }

            const error =
                Worker.#ErrorFrom
                (
                    reason ??
                    '[arianna] Worker stopped before completing pending tasks.'
                );

            for(const task of this.#pending.values())
            {
                if(task.Timer !== undefined)
                {
                    clearTimeout(task.Timer);
                }

                task.Reject(error);
            }

            this.#pending.clear();

            if(this.#state !== 'Disposed')
            {
                this.#state = 'Stopped';
            }

            return this;
        }

        /** @name        Dispose
         *  @public
         *  @returns     {void}
         *  @description Permanently stop and clear this Worker.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        Dispose(): void
        {
            this.Stop('[arianna] Worker disposed.');

            this.#events.clear();
            this.#errors.clear();
            this.#state = 'Disposed';
        }

        /** @name        #Identifier
         *  @private
         *  @static
         *  @returns     {string} Unique protocol identifier.
         *  @description Mint a transport-safe identifier.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #Identifier(): string
        {
            Worker.#Sequence += 1;

            return [
                'arianna',
                Date.now().toString(36),
                Worker.#Sequence.toString(36),
                Math.random().toString(36).slice(2)
            ].join('-');
        }

        /** @name        #ErrorFrom
         *  @private
         *  @static
         *  @param       {unknown} value Error-like value.
         *  @returns     {Error} Normalised Error.
         *  @description Convert transported or thrown values to Error.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #ErrorFrom(value: unknown): Error
        {
            if(value instanceof Error)
            {
                return value;
            }

            if
            (
                value &&
                typeof value === 'object' &&
                'Message' in value
            )
            {
                return new Error
                (
                    String
                    (
                        (value as { Message?: unknown }).Message ??
                        'Unknown Worker error'
                    )
                );
            }

            return new Error(String(value ?? 'Unknown Worker error'));
        }

        /** @name        #Attempt
         *  @private
         *  @template    T
         *  @param       {TaskRequest} request Task request.
         *  @param       {number} retries Remaining retries.
         *  @returns     {Promise<T>} Task result.
         *  @description Post one task attempt and retry failures when configured.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #Attempt<T>
        (
            request : TaskRequest,
            retries : number
        ): Promise<T>
        {
            return new Promise<T>
            (
                (resolve, reject) =>
                {
                    const timeout =
                        request.Timeout ??
                        this.#options.Timeout ??
                        0;

                    const pending: PendingTask =
                    {
                        Resolve : resolve as (value: unknown) => void,
                        Reject  : error =>
                        {
                            if(retries > 0)
                            {
                                this.#Attempt<T>
                                (
                                    {
                                        ...request,
                                        Id: Worker.#Identifier()
                                    },
                                    retries - 1
                                )
                                    .then(resolve)
                                    .catch(reject);

                                return;
                            }

                            reject(error);
                        },
                        Timer: undefined
                    };

                    if(timeout > 0)
                    {
                        pending.Timer = globalThis.setTimeout
                        (
                            () =>
                            {
                                this.#pending.delete(request.Id);

                                pending.Reject
                                (
                                    new Error
                                    (
                                        `[arianna] Worker task '${request.Name}' timed out after ${timeout}ms.`
                                    )
                                );
                            },
                            timeout
                        );
                    }

                    this.#pending.set(request.Id, pending);

                    this.#worker?.postMessage
                    (
                        {
                            Id      : request.Id,
                            Type    : request.Type,
                            Name    : request.Name,
                            Payload : request.Payload
                        } satisfies ProtocolMessage,
                        request.Transfer
                    );
                }
            );
        }

        /** @name        #Route
         *  @private
         *  @param       {unknown} raw Raw Worker message.
         *  @returns     {void}
         *  @description Route results, errors, Signals, events and readiness.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #Route(raw: unknown): void
        {
            if(!raw || typeof raw !== 'object')
            {
                return;
            }

            const message =
                raw as ProtocolMessage;

            switch(message.Type)
            {
                case 'Result':
                {
                    const pending =
                        this.#pending.get(message.Id ?? '');

                    if(!pending)
                    {
                        return;
                    }

                    this.#pending.delete(message.Id ?? '');

                    if(pending.Timer !== undefined)
                    {
                        clearTimeout(pending.Timer);
                    }

                    pending.Resolve(message.Value);

                    break;
                }

                case 'Error':
                {
                    const pending =
                        this.#pending.get(message.Id ?? '');

                    const error =
                        Worker.#ErrorFrom(message.Error);

                    if(pending)
                    {
                        this.#pending.delete(message.Id ?? '');

                        if(pending.Timer !== undefined)
                        {
                            clearTimeout(pending.Timer);
                        }

                        pending.Reject(error);
                    }

                    this.#EmitError(error);

                    break;
                }

                case 'Signal':
                {
                    if(message.Key)
                    {
                        Worker.#SharedSignals
                            .get(message.Key)
                            ?.Set(message.Value);
                    }

                    break;
                }

                case 'Event':
                {
                    if(message.Name)
                    {
                        for
                        (
                            const handler of
                            this.#events.get(message.Name) ?? []
                        )
                        {
                            handler(message.Detail);
                        }
                    }

                    break;
                }

                case 'Ready':
                {
                    this.#state = 'Running';

                    break;
                }
            }
        }

        /** @name        #NativeError
         *  @private
         *  @param       {ErrorEvent | MessageEvent} event Native error event.
         *  @returns     {void}
         *  @description Enter Failed state and notify subscribers.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #NativeError(event: ErrorEvent | MessageEvent): void
        {
            this.#state = 'Failed';

            const error =
                event instanceof ErrorEvent
                    ? Worker.#ErrorFrom(event.error ?? event.message)
                    : new Error
                    (
                        '[arianna] Worker message could not be deserialised.'
                    );

            this.#EmitError(error);
        }

        /** @name        #EmitError
         *  @private
         *  @param       {Error} error Normalised error.
         *  @returns     {void}
         *  @description Notify Worker error subscribers.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #EmitError(error: Error): void
        {
            for(const handler of this.#errors)
            {
                handler(error);
            }
        }

        /** @name        #AssertConfigurable
         *  @private
         *  @returns     {void}
         *  @description Reject structural configuration changes after Start.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #AssertConfigurable(): void
        {
            if(this.#worker)
            {
                throw new Error
                (
                    '[arianna] Worker configuration is immutable after Start().'
                );
            }
        }
    }

    /** @class       WorkerPool
     *  @public
     *  @description Fluent reusable pool. The pool owns its own task/message builders, queue,
     *               lifecycle and scheduling state; no pool implementation detail is stored in
     *               the Workers namespace.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class WorkerPool implements TaskExecutor, MessageSender
    {
        /** @name        TaskBuilder
         *  @public
         *  @static
         *  @description Fluent pool task builder owned by WorkerPool.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly TaskBuilder = class TaskBuilder<T = unknown>
        {
            readonly #name     : string;
            readonly #executor : TaskExecutor;
            #payload           : unknown = undefined;
            #transfer          : Transferable[] = [];
            #timeout           : number | undefined;
            #retry             : number | undefined;

            /** @name        constructor
             *  @public
             *  @param       {string} name Nominal task handler.
             *  @param       {TaskExecutor} executor Pool executor.
             *  @description Build a pool task draft.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            constructor
            (
                name     : string,
                executor : TaskExecutor
            )
            {
                this.#name     = name;
                this.#executor = executor;
            }

            With(payload: unknown): this
            {
                this.#payload = payload;

                return this;
            }

            Transfer(...values: Transferable[]): this
            {
                this.#transfer.push(...values);

                return this;
            }

            Timeout(milliseconds: number): this
            {
                this.#timeout = Math.max(0, milliseconds);

                return this;
            }

            Retry(count: number): this
            {
                this.#retry = Math.max(0, Math.floor(count));

                return this;
            }

            Run(): Promise<T>
            {
                return this.#executor.Execute<T>
                (
                    {
                        Id       : WorkerPool.#Identifier(),
                        Type     : 'Task',
                        Name     : this.#name,
                        Payload  : this.#payload,
                        Transfer : [...this.#transfer],
                        Timeout  : this.#timeout,
                        Retry    : this.#retry
                    }
                );
            }
        };

        /** @name        MessageBuilder
         *  @public
         *  @static
         *  @description Fluent pool message builder owned by WorkerPool.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static readonly MessageBuilder = class MessageBuilder
        {
            readonly #name   : string;
            readonly #sender : MessageSender;
            #payload         : unknown = undefined;
            #transfer        : Transferable[] = [];

            /** @name        constructor
             *  @public
             *  @param       {string} name Nominal message handler.
             *  @param       {MessageSender} sender Pool sender.
             *  @description Build a pool message draft.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            constructor
            (
                name   : string,
                sender : MessageSender
            )
            {
                this.#name   = name;
                this.#sender = sender;
            }

            With(payload: unknown): this
            {
                this.#payload = payload;

                return this;
            }

            Transfer(...values: Transferable[]): this
            {
                this.#transfer.push(...values);

                return this;
            }

            Post(): void
            {
                this.#sender.Post
                (
                    {
                        Id       : WorkerPool.#Identifier(),
                        Type     : 'Message',
                        Name     : this.#name,
                        Payload  : this.#payload,
                        Transfer : [...this.#transfer]
                    }
                );
            }
        };

        static #Sequence = 0;

        readonly #url            : string | URL;
        readonly #options        : PoolOptions;
        readonly #workers        : Worker[] = [];
        readonly #idle           : Worker[] = [];
        readonly #queue          : QueuedTask[] = [];
        readonly #drainResolvers = new Set<() => void>();

        #state  : PoolState = 'Created';
        #active : number    = 0;

        /** @name        constructor
         *  @public
         *  @param       {string | URL} url Worker URL.
         *  @param       {PoolOptions} [options] Pool options.
         *  @description Build a pool without spawning Workers.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        constructor
        (
            url      : string | URL,
            options? : PoolOptions
        )
        {
            this.#url = url;

            this.#options =
            {
                Size    : options?.Size ?? 1,
                Queue   : options?.Queue ?? Number.POSITIVE_INFINITY,
                Type    : options?.Type ?? 'module',
                Name    : options?.Name,
                Timeout : options?.Timeout ?? 0,
                Retry   : options?.Retry ?? 0
            };
        }

        get State(): PoolState
        {
            return this.#state;
        }

        static Create
        (
            url      : string | URL,
            options? : PoolOptions
        ): WorkerPool
        {
            return new WorkerPool(url, options);
        }

        Size(value: number): this
        {
            const size = Math.max(1, Math.floor(value));

            if(this.#state === 'Ready')
            {
                return this.Resize(size);
            }

            this.#options.Size = size;

            return this;
        }

        Module(): this
        {
            this.#AssertConfigurable();
            this.#options.Type = 'module';

            return this;
        }

        Classic(): this
        {
            this.#AssertConfigurable();
            this.#options.Type = 'classic';

            return this;
        }

        Name(value: string): this
        {
            this.#AssertConfigurable();
            this.#options.Name = value;

            return this;
        }

        Queue(maximum: number): this
        {
            this.#options.Queue =
                Math.max(0, Math.floor(maximum));

            return this;
        }

        Timeout(milliseconds: number): this
        {
            this.#options.Timeout =
                Math.max(0, milliseconds);

            return this;
        }

        Retry(count: number): this
        {
            this.#options.Retry =
                Math.max(0, Math.floor(count));

            return this;
        }

        Start(): this
        {
            if(this.#state === 'Ready')
            {
                return this;
            }

            if(this.#state === 'Disposed')
            {
                throw new Error
                (
                    '[arianna] Cannot restart a disposed WorkerPool.'
                );
            }

            this.#state = 'Starting';

            for(let index = 0; index < (this.#options.Size ?? 1); index += 1)
            {
                this.#AppendWorker(index);
            }

            this.#state = 'Ready';

            return this;
        }

        Task<T = unknown>(name: string)
        {
            return new WorkerPool.TaskBuilder<T>(name, this);
        }

        Send(name: string)
        {
            return new WorkerPool.MessageBuilder(name, this);
        }

        Execute<T>
        (
            request: TaskRequest
        ): Promise<T>
        {
            this.Start();

            return new Promise<T>
            (
                (resolve, reject) =>
                {
                    const task: QueuedTask =
                    {
                        Request : request,
                        Resolve : resolve as (value: unknown) => void,
                        Reject  : reject
                    };

                    const worker =
                        this.#idle.shift();

                    if(worker)
                    {
                        this.#Dispatch(worker, task);

                        return;
                    }

                    if
                    (
                        this.#queue.length >=
                        (this.#options.Queue ?? Number.POSITIVE_INFINITY)
                    )
                    {
                        reject
                        (
                            new Error
                            (
                                '[arianna] WorkerPool queue capacity exceeded.'
                            )
                        );

                        return;
                    }

                    this.#queue.push(task);
                }
            );
        }

        Post
        (
            request: MessageRequest
        ): void
        {
            this.Start();

            const worker =
                this.#idle[0] ??
                this.#workers[0];

            if(!worker)
            {
                throw new Error
                (
                    '[arianna] WorkerPool has no members.'
                );
            }

            worker.Post(request);
        }

        SharedSignal<T>
        (
            key     : string,
            initial : T
        ): Reactivity.Signal<T>
        {
            return Worker.SharedSignal(key, initial);
        }

        Resize(value: number): this
        {
            const size = Math.max(1, Math.floor(value));

            this.#options.Size = size;

            while(this.#workers.length < size)
            {
                this.#AppendWorker(this.#workers.length);
            }

            while
            (
                this.#workers.length > size &&
                this.#idle.length > 0
            )
            {
                const worker =
                    this.#idle.pop();

                if(worker)
                {
                    worker.Dispose();

                    const index =
                        this.#workers.indexOf(worker);

                    if(index >= 0)
                    {
                        this.#workers.splice(index, 1);
                    }
                }
            }

            return this;
        }

        Cancel(id: string): boolean
        {
            const index =
                this.#queue.findIndex
                (
                    item => item.Request.Id === id
                );

            if(index < 0)
            {
                return false;
            }

            const [task] =
                this.#queue.splice(index, 1);

            task.Reject
            (
                new Error
                (
                    `[arianna] WorkerPool task '${id}' was cancelled.`
                )
            );

            this.#ResolveDrain();

            return true;
        }

        Drain(): Promise<void>
        {
            if
            (
                this.#queue.length === 0 &&
                this.#active === 0
            )
            {
                return Promise.resolve();
            }

            this.#state = 'Draining';

            return new Promise<void>
            (
                resolve =>
                {
                    this.#drainResolvers.add(resolve);
                }
            );
        }

        Stop(reason?: unknown): this
        {
            const error =
                reason instanceof Error
                    ? reason
                    : new Error
                    (
                        String
                        (
                            reason ??
                            '[arianna] WorkerPool stopped.'
                        )
                    );

            for(const task of this.#queue.splice(0))
            {
                task.Reject(error);
            }

            for(const worker of this.#workers)
            {
                worker.Stop(error);
            }

            this.#workers.length = 0;
            this.#idle.length    = 0;
            this.#active         = 0;

            if(this.#state !== 'Disposed')
            {
                this.#state = 'Stopped';
            }

            this.#ResolveDrain();

            return this;
        }

        Dispose(): void
        {
            this.Stop('[arianna] WorkerPool disposed.');
            this.#state = 'Disposed';
        }

        static #Identifier(): string
        {
            WorkerPool.#Sequence += 1;

            return [
                'arianna-pool',
                Date.now().toString(36),
                WorkerPool.#Sequence.toString(36),
                Math.random().toString(36).slice(2)
            ].join('-');
        }

        #AppendWorker(index: number): void
        {
            const worker =
                new Worker
                (
                    this.#url,
                    {
                        Type    : this.#options.Type,
                        Name    : this.#options.Name
                            ? `${this.#options.Name}-${index}`
                            : undefined,
                        Timeout : this.#options.Timeout,
                        Retry   : this.#options.Retry
                    }
                );

            worker.Start();

            this.#workers.push(worker);
            this.#idle.push(worker);
        }

        #Dispatch
        (
            worker : Worker,
            task   : QueuedTask
        ): void
        {
            this.#active += 1;

            worker
                .Execute(task.Request)
                .then(task.Resolve)
                .catch(task.Reject)
                .finally
                (
                    () =>
                    {
                        this.#active -= 1;

                        const next =
                            this.#queue.shift();

                        if(next)
                        {
                            this.#Dispatch(worker, next);
                        }
                        else
                        {
                            this.#idle.push(worker);
                            this.#ResolveDrain();
                        }
                    }
                );
        }

        #ResolveDrain(): void
        {
            if
            (
                this.#queue.length > 0 ||
                this.#active > 0
            )
            {
                return;
            }

            for(const resolve of this.#drainResolvers)
            {
                resolve();
            }

            this.#drainResolvers.clear();

            if(this.#state === 'Draining')
            {
                this.#state = 'Ready';
            }
        }

        #AssertConfigurable(): void
        {
            if
            (
                this.#state !== 'Created' &&
                this.#state !== 'Stopped'
            )
            {
                throw new Error
                (
                    '[arianna] WorkerPool configuration is immutable after Start().'
                );
            }
        }
    }

    /** @name        Service
     *  @private
     *  @type        {Services.Service}
     *  @description Workers service registration. The service delegates to the two public classes and does not
     *               duplicate their fluent instance API.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const Service = new Services.Service<ServiceContract>
    (
        'workers',
        {
            Create       : Workers.Worker.Create,
            Pool         : Workers.WorkerPool.Create,
            Handle       : Workers.Worker.Handle,
            SharedSignal : Workers.Worker.SharedSignal,
            PostSignal   : Workers.Worker.PostSignal,
            PostEvent    : Workers.Worker.PostEvent
        }
    );
}

export default Workers;

