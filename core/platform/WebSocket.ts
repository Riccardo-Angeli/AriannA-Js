/**
 * @module    core/WebSocket
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description Isomorphic-safe AriannA WebSocket primitive. The runtime owns lifecycle, reconnect,
 *              heartbeat, backpressure, async iteration and optional Worker transforms. It does not
 *              impose channels, topics, GraphQL or any application protocol.
 */

import type { Types }      from '../definitions/Types.ts';
import type { Interfaces } from '../definitions/Interfaces.ts';

import { Services }   from '../kernel/Services.ts';
import { Reactivity } from '../reactivity/Reactivity.ts';

/** @namespace WebSockets */
export namespace WebSockets
{
    export type State          = Types.WebSockets.State;
    export type Direction      = Types.WebSockets.Direction;
    export type BinaryType     = Types.WebSockets.BinaryType;
    export type RetryOptions   = Interfaces.WebSockets.RetryOptions;
    export type Heartbeat      = Interfaces.WebSockets.HeartbeatOptions;
    export type WorkerOptions  = Interfaces.WebSockets.WorkerOptions;
    export type WorkerLike     = Interfaces.WebSockets.WorkerLike;
    export type SocketOptions  = Interfaces.WebSockets.SocketOptions;
    export type Metrics        = Interfaces.WebSockets.Metrics;
    export type ServiceContract = Interfaces.WebSockets.Service;

    type Queued =
    {
        Data    : string | ArrayBufferLike | Blob | ArrayBufferView;
        Resolve?: () => void;
        Reject? : (error: unknown) => void;
    };

    type IteratorWaiter =
    {
        Resolve(value: IteratorResult<unknown>): void;
        Reject(error: unknown): void;
    };

    /** @class Socket @description Fluent resilient wrapper around the native WebSocket transport. */
    export class Socket extends EventTarget
    {
        static #Sequence = 0;

        readonly Url: string;

        readonly State$     = Reactivity.CreateSignal<State>('Created', { Name: 'WebSocket.State' });
        readonly Connected$ = Reactivity.CreateSignal(false, { Name: 'WebSocket.Connected' });
        readonly Latency$   = Reactivity.CreateSignal<number | null>(null, { Name: 'WebSocket.Latency' });
        readonly Buffered$  = Reactivity.CreateSignal(0, { Name: 'WebSocket.Buffered' });
        readonly Error$     = Reactivity.CreateSignal<unknown>(undefined, { Name: 'WebSocket.Error' });
        readonly Metrics$   = Reactivity.CreateSignal<Metrics>
        (
            {
                Opens         : 0,
                Reconnects    : 0,
                MessagesIn    : 0,
                MessagesOut   : 0,
                BytesIn       : 0,
                BytesOut      : 0,
                LastOpenAt    : null,
                LastCloseAt   : null,
                LastMessageAt : null,
                HeartbeatRtt  : null
            },
            { Name: 'WebSocket.Metrics' }
        );

        #protocols: string[] = [];
        #binaryType: BinaryType = 'arraybuffer';
        #timeout = 10_000;
        #highWaterMark = 1_048_576;
        #retry: Required<RetryOptions> =
        {
            Count      : Infinity,
            Base       : 500,
            Maximum    : 30_000,
            Factor     : 2,
            Jitter     : 0.2,
            Codes      : []
        };
        #heartbeat: Required<Heartbeat> | null = null;
        #socket: globalThis.WebSocket | null = null;
        #openPromise: Promise<this> | null = null;
        #openResolve: ((value: this) => void) | null = null;
        #openReject: ((reason?: unknown) => void) | null = null;
        #openTimer: ReturnType<typeof setTimeout> | null = null;
        #reconnectTimer: ReturnType<typeof setTimeout> | null = null;
        #heartbeatTimer: ReturnType<typeof setInterval> | null = null;
        #heartbeatSentAt = 0;
        #attempt = 0;
        #manualClose = false;
        #disposed = false;
        #queue: Queued[] = [];
        #messages: unknown[] = [];
        #waiters: IteratorWaiter[] = [];
        #worker: WorkerLike | null = null;
        #workerOptions: Required<WorkerOptions> =
        {
            Direction       : 'in',
            InboundHandler  : 'WebSocketMessage',
            OutboundHandler : 'WebSocketSend',
            Required        : false,
            Transfer        : false
        };

        constructor(url: string | URL, options: SocketOptions = {})
        {
            super();
            this.Url = String(url);

            if(options.Protocols) this.#protocols = [...options.Protocols];
            if(options.BinaryType) this.#binaryType = options.BinaryType;
            if(options.Timeout !== undefined) this.Timeout(options.Timeout);
            if(options.HighWaterMark !== undefined) this.HighWaterMark(options.HighWaterMark);
            if(options.Retry !== undefined) this.Retry(options.Retry);
            if(options.Heartbeat !== undefined) this.Heartbeat(options.Heartbeat);
            if(options.Worker) this.Worker(options.Worker, options.WorkerOptions);
        }

        static Create(url: string | URL, options?: SocketOptions): Socket
        {
            return new Socket(url, options);
        }

        get Native(): globalThis.WebSocket | null { return this.#socket; }
        get State(): State { return this.State$.Peek(); }
        get BufferedAmount(): number { return this.#socket?.bufferedAmount ?? 0; }
        get Protocol(): string { return this.#socket?.protocol ?? ''; }
        get Extensions(): string { return this.#socket?.extensions ?? ''; }

        Protocols(...protocols: string[]): this
        {
            this.#AssertConfigurable();
            this.#protocols = protocols.flatMap(value => value.split(',')).map(value => value.trim()).filter(Boolean);
            return this;
        }

        Binary(type: BinaryType): this
        {
            this.#binaryType = type;
            if(this.#socket) this.#socket.binaryType = type;
            return this;
        }

        Timeout(milliseconds: number): this
        {
            this.#timeout = Math.max(0, Math.floor(milliseconds));
            return this;
        }

        HighWaterMark(bytes: number): this
        {
            this.#highWaterMark = Math.max(1, Math.floor(bytes));
            return this;
        }

        Retry(options: number | RetryOptions): this
        {
            if(typeof options === 'number')
            {
                this.#retry.Count = Math.max(0, Math.floor(options));
                return this;
            }

            this.#retry =
            {
                Count   : options.Count   ?? this.#retry.Count,
                Base    : Math.max(0, options.Base ?? this.#retry.Base),
                Maximum : Math.max(0, options.Maximum ?? this.#retry.Maximum),
                Factor  : Math.max(1, options.Factor ?? this.#retry.Factor),
                Jitter  : Math.max(0, Math.min(1, options.Jitter ?? this.#retry.Jitter)),
                Codes   : [...(options.Codes ?? this.#retry.Codes)]
            };
            return this;
        }

        Heartbeat(options: number | Heartbeat | false): this
        {
            this.#StopHeartbeat();
            if(options === false)
            {
                this.#heartbeat = null;
                return this;
            }

            const source: Heartbeat = typeof options === 'number' ? { Interval: options } : options;
            this.#heartbeat =
            {
                Interval : Math.max(250, source.Interval ?? 15_000),
                Payload  : source.Payload ?? 'ping',
                Reply    : source.Reply ?? 'pong',
                Timeout  : Math.max(0, source.Timeout ?? 10_000)
            };
            if(this.State === 'Open') this.#StartHeartbeat();
            return this;
        }

        /** Optional off-main-thread transform. Actual Workers.Worker/WorkerPool satisfy this structurally. */
        Worker(worker: WorkerLike | null, options: WorkerOptions = {}): this
        {
            this.#worker = worker;
            this.#workerOptions =
            {
                Direction       : options.Direction ?? 'in',
                InboundHandler  : options.InboundHandler ?? 'WebSocketMessage',
                OutboundHandler : options.OutboundHandler ?? 'WebSocketSend',
                Required        : options.Required ?? false,
                Transfer        : options.Transfer ?? false
            };
            return this;
        }

        Open(): this
        {
            void this.WaitOpen();
            return this;
        }

        WaitOpen(): Promise<this>
        {
            if(this.#disposed) return Promise.reject(new Error('[arianna] WebSocket disposed.'));
            if(this.State === 'Open') return Promise.resolve(this);
            if(this.#openPromise) return this.#openPromise;

            if(typeof globalThis.WebSocket !== 'function')
                return Promise.reject(new Error('[arianna] WebSocket is not available in this runtime.'));

            this.#manualClose = false;
            this.State$.Set(this.#attempt > 0 ? 'Reconnecting' : 'Connecting');

            this.#openPromise = new Promise<this>((resolve, reject) =>
            {
                this.#openResolve = resolve;
                this.#openReject  = reject;
            });

            try
            {
                const native = this.#protocols.length
                    ? new globalThis.WebSocket(this.Url, this.#protocols)
                    : new globalThis.WebSocket(this.Url);

                native.binaryType = this.#binaryType;
                native.addEventListener('open', this.#OnOpen);
                native.addEventListener('message', this.#OnMessage);
                native.addEventListener('error', this.#OnError);
                native.addEventListener('close', this.#OnClose);
                this.#socket = native;

                if(this.#timeout > 0)
                {
                    this.#openTimer = setTimeout(() =>
                    {
                        const error = new Error(`[arianna] WebSocket connection timed out after ${this.#timeout} ms.`);
                        this.Error$.Set(error);
                        this.#RejectOpen(error);
                        try { native.close(4000, 'Connection timeout'); } catch {}
                    }, this.#timeout);
                }
            }
            catch(error)
            {
                this.Error$.Set(error);
                this.State$.Set('Failed');
                this.#RejectOpen(error);
                this.#ScheduleReconnect();
            }

            return this.#openPromise;
        }

        Send(data: string | ArrayBufferLike | Blob | ArrayBufferView): this
        {
            void this.#Send(data, false);
            return this;
        }

        SendAsync(data: string | ArrayBufferLike | Blob | ArrayBufferView): Promise<void>
        {
            return this.#Send(data, true);
        }

        async Drain(): Promise<void>
        {
            while(this.#queue.length > 0 || this.BufferedAmount > 0)
            {
                this.Buffered$.Set(this.BufferedAmount);
                await new Promise(resolve => setTimeout(resolve, 8));
            }
            this.Buffered$.Set(0);
        }

        Close(code = 1000, reason = ''): this
        {
            this.#manualClose = true;
            this.#ClearReconnect();
            this.#StopHeartbeat();
            this.State$.Set('Closing');
            if(this.#socket && this.#socket.readyState < globalThis.WebSocket.CLOSING)
            {
                try { this.#socket.close(code, reason); } catch {}
            }
            else
            {
                this.#FinishClose(code, reason, true);
            }
            return this;
        }

        Dispose(): void
        {
            if(this.#disposed) return;
            this.#disposed = true;
            this.Close(1000, 'Disposed');
            this.State$.Set('Disposed');
            const error = new Error('[arianna] WebSocket disposed.');
            for(const item of this.#queue.splice(0)) item.Reject?.(error);
            for(const waiter of this.#waiters.splice(0)) waiter.Resolve({ done: true, value: undefined });
        }

        /** Async stream of decoded/Worker-transformed message payloads. */
        Messages<T = unknown>(): AsyncIterable<T>
        {
            const self = this;
            return {
                [Symbol.asyncIterator](): AsyncIterator<T>
                {
                    return {
                        next(): Promise<IteratorResult<T>>
                        {
                            if(self.#messages.length > 0)
                                return Promise.resolve({ done: false, value: self.#messages.shift() as T });
                            if(self.#disposed)
                                return Promise.resolve({ done: true, value: undefined as T });
                            return new Promise<IteratorResult<T>>((resolve, reject) =>
                            {
                                self.#waiters.push({ Resolve: resolve as (value: IteratorResult<unknown>) => void, Reject: reject });
                            });
                        },
                        return(): Promise<IteratorResult<T>>
                        {
                            return Promise.resolve({ done: true, value: undefined as T });
                        }
                    };
                }
            };
        }

        async #Send(data: string | ArrayBufferLike | Blob | ArrayBufferView, wait: boolean): Promise<void>
        {
            if(this.#disposed) throw new Error('[arianna] WebSocket disposed.');

            let payload: string | ArrayBufferLike | Blob | ArrayBufferView = data;
            if(this.#worker && (this.#workerOptions.Direction === 'out' || this.#workerOptions.Direction === 'both'))
            {
                payload = await this.#WorkerTransform(payload, this.#workerOptions.OutboundHandler) as typeof payload;
            }

            if(this.State !== 'Open' || !this.#socket || this.#socket.readyState !== globalThis.WebSocket.OPEN)
            {
                await new Promise<void>((resolve, reject) =>
                {
                    this.#queue.push({ Data: payload, Resolve: wait ? resolve : undefined, Reject: wait ? reject : undefined });
                    if(!wait) resolve();
                    void this.WaitOpen().catch(reject);
                });
                return;
            }

            await this.#Backpressure();
            this.#socket.send(payload as string | ArrayBufferLike | Blob | ArrayBufferView);
            this.#RecordOut(payload);
        }

        async #Backpressure(): Promise<void>
        {
            while(this.#socket && this.#socket.bufferedAmount > this.#highWaterMark)
            {
                this.Buffered$.Set(this.#socket.bufferedAmount);
                await new Promise(resolve => setTimeout(resolve, 8));
            }
            this.Buffered$.Set(this.#socket?.bufferedAmount ?? 0);
        }

        #OnOpen = (): void =>
        {
            this.#ClearOpenTimer();
            this.State$.Set('Open');
            this.Connected$.Set(true);
            this.#attempt = 0;
            this.Metrics$.Update(current => ({ ...current, Opens: current.Opens + 1, LastOpenAt: Date.now() }));
            this.#ResolveOpen();
            this.dispatchEvent(new Event('open'));
            this.#StartHeartbeat();
            void this.#FlushQueue();
        };

        #OnMessage = (event: MessageEvent): void =>
        {
            void this.#HandleMessage(event);
        };

        async #HandleMessage(event: MessageEvent): Promise<void>
        {
            let data: unknown = event.data;
            const bytes = Socket.#Size(event.data);
            this.Metrics$.Update(current => ({ ...current, MessagesIn: current.MessagesIn + 1, BytesIn: current.BytesIn + bytes, LastMessageAt: Date.now() }));

            if(this.#heartbeat && Socket.#Equal(data, this.#heartbeat.Reply))
            {
                const rtt = this.#heartbeatSentAt ? Math.max(0, performance.now() - this.#heartbeatSentAt) : null;
                this.Latency$.Set(rtt);
                this.Metrics$.Update(current => ({ ...current, HeartbeatRtt: rtt }));
            }

            if(this.#worker && (this.#workerOptions.Direction === 'in' || this.#workerOptions.Direction === 'both'))
            {
                try { data = await this.#WorkerTransform(data, this.#workerOptions.InboundHandler); }
                catch(error)
                {
                    this.dispatchEvent(Socket.#Custom('workererror', { Error: error, Data: event.data }));
                    if(this.#workerOptions.Required) return;
                    data = event.data;
                }
            }

            this.#PushMessage(data);
            this.dispatchEvent(Socket.#Custom('message', { Data: data, Raw: event }));
        }

        #OnError = (event: Event): void =>
        {
            this.Error$.Set(event);
            this.dispatchEvent(Socket.#Custom('socketerror', { Error: event }));
        };

        #OnClose = (event: CloseEvent): void =>
        {
            this.#DetachNative();
            this.#FinishClose(event.code, event.reason, event.wasClean);
            if(!this.#manualClose && !this.#disposed && this.#ShouldReconnect(event.code))
                this.#ScheduleReconnect();
        };

        #FinishClose(code: number, reason: string, clean: boolean): void
        {
            this.#ClearOpenTimer();
            this.#StopHeartbeat();
            this.Connected$.Set(false);
            if(this.State !== 'Disposed') this.State$.Set(this.#manualClose ? 'Closed' : 'Closed');
            this.Metrics$.Update(current => ({ ...current, LastCloseAt: Date.now() }));
            this.#RejectOpen(new Error(`[arianna] WebSocket closed (${code})${reason ? `: ${reason}` : ''}`));
            this.dispatchEvent(Socket.#Custom('close', { Code: code, Reason: reason, Clean: clean }));
        }

        #ShouldReconnect(code: number): boolean
        {
            if(this.#retry.Count <= 0) return false;
            if(this.#retry.Codes.length === 0) return code !== 1000;
            return this.#retry.Codes.includes(code);
        }

        #ScheduleReconnect(): void
        {
            if(this.#disposed || this.#manualClose || this.#reconnectTimer) return;
            if(this.#attempt >= this.#retry.Count)
            {
                this.State$.Set('Failed');
                return;
            }

            this.#attempt += 1;
            const base = Math.min(this.#retry.Maximum, this.#retry.Base * Math.pow(this.#retry.Factor, this.#attempt - 1));
            const jitter = base * this.#retry.Jitter * ((Math.random() * 2) - 1);
            const delay = Math.max(0, Math.round(base + jitter));
            this.State$.Set('Reconnecting');
            this.Metrics$.Update(current => ({ ...current, Reconnects: current.Reconnects + 1 }));
            this.dispatchEvent(Socket.#Custom('reconnect', { Attempt: this.#attempt, Delay: delay }));
            this.#reconnectTimer = setTimeout(() =>
            {
                this.#reconnectTimer = null;
                this.#openPromise = null;
                void this.WaitOpen();
            }, delay);
        }

        async #FlushQueue(): Promise<void>
        {
            while(this.State === 'Open' && this.#queue.length > 0)
            {
                const item = this.#queue.shift()!;
                try
                {
                    await this.#Backpressure();
                    this.#socket?.send(item.Data as string | ArrayBufferLike | Blob | ArrayBufferView);
                    this.#RecordOut(item.Data);
                    item.Resolve?.();
                }
                catch(error) { item.Reject?.(error); }
            }
        }

        #RecordOut(data: unknown): void
        {
            const bytes = Socket.#Size(data);
            this.Metrics$.Update(current => ({ ...current, MessagesOut: current.MessagesOut + 1, BytesOut: current.BytesOut + bytes }));
            this.Buffered$.Set(this.BufferedAmount);
        }

        #StartHeartbeat(): void
        {
            this.#StopHeartbeat();
            if(!this.#heartbeat || this.State !== 'Open') return;
            this.#heartbeatTimer = setInterval(() =>
            {
                if(this.State !== 'Open') return;
                this.#heartbeatSentAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
                this.Send(this.#heartbeat!.Payload as string | ArrayBufferLike | Blob | ArrayBufferView);
                if(this.#heartbeat!.Timeout > 0)
                {
                    const sentAt = this.#heartbeatSentAt;
                    setTimeout(() =>
                    {
                        if(this.#heartbeatSentAt === sentAt && this.State === 'Open' && this.Latency$.Peek() === null)
                            this.dispatchEvent(Socket.#Custom('heartbeat-timeout', { Timeout: this.#heartbeat!.Timeout }));
                    }, this.#heartbeat!.Timeout);
                }
            }, this.#heartbeat.Interval);
        }

        #StopHeartbeat(): void
        {
            if(this.#heartbeatTimer) clearInterval(this.#heartbeatTimer);
            this.#heartbeatTimer = null;
        }

        async #WorkerTransform(data: unknown, handler: string): Promise<unknown>
        {
            const worker = this.#worker;
            if(!worker) return data;

            const transfer: Transferable[] = [];
            if(this.#workerOptions.Transfer && data instanceof ArrayBuffer) transfer.push(data);

            if(typeof worker.Execute === 'function')
            {
                return worker.Execute
                ({
                    Id       : Socket.#Identifier(),
                    Type     : 'Task',
                    Name     : handler,
                    Payload  : data,
                    Transfer : transfer
                });
            }

            if(typeof worker.Post === 'function')
            {
                worker.Post
                ({
                    Id       : Socket.#Identifier(),
                    Type     : 'Message',
                    Name     : handler,
                    Payload  : data,
                    Transfer : transfer
                });
                return data;
            }

            throw new TypeError('[arianna] Socket.Worker() requires an AriannA Worker-like Execute() or Post() surface.');
        }

        #PushMessage(data: unknown): void
        {
            const waiter = this.#waiters.shift();
            if(waiter) waiter.Resolve({ done: false, value: data });
            else this.#messages.push(data);
        }

        #ResolveOpen(): void
        {
            const resolve = this.#openResolve;
            this.#openResolve = null;
            this.#openReject = null;
            this.#openPromise = null;
            resolve?.(this);
        }

        #RejectOpen(reason: unknown): void
        {
            const reject = this.#openReject;
            this.#openResolve = null;
            this.#openReject = null;
            this.#openPromise = null;
            reject?.(reason);
        }

        #ClearOpenTimer(): void
        {
            if(this.#openTimer) clearTimeout(this.#openTimer);
            this.#openTimer = null;
        }

        #ClearReconnect(): void
        {
            if(this.#reconnectTimer) clearTimeout(this.#reconnectTimer);
            this.#reconnectTimer = null;
        }

        #DetachNative(): void
        {
            const native = this.#socket;
            if(!native) return;
            native.removeEventListener('open', this.#OnOpen);
            native.removeEventListener('message', this.#OnMessage);
            native.removeEventListener('error', this.#OnError);
            native.removeEventListener('close', this.#OnClose);
            this.#socket = null;
        }

        #AssertConfigurable(): void
        {
            if(this.State === 'Connecting' || this.State === 'Open' || this.State === 'Reconnecting')
                throw new Error('[arianna] WebSocket protocols are immutable while active.');
        }

        static #Identifier(): string
        {
            Socket.#Sequence += 1;
            return `arianna-socket-${Date.now().toString(36)}-${Socket.#Sequence.toString(36)}`;
        }

        static #Size(data: unknown): number
        {
            if(typeof data === 'string') return new TextEncoder().encode(data).byteLength;
            if(data instanceof ArrayBuffer) return data.byteLength;
            if(ArrayBuffer.isView(data)) return data.byteLength;
            if(typeof Blob !== 'undefined' && data instanceof Blob) return data.size;
            return 0;
        }

        static #Equal(a: unknown, b: unknown): boolean
        {
            if(Object.is(a, b)) return true;
            if(typeof a === 'string' && typeof b !== 'string')
            {
                try { return a === JSON.stringify(b); } catch { return false; }
            }
            return false;
        }

        static #Custom(type: string, detail: unknown): Event
        {
            if(typeof CustomEvent === 'function') return new CustomEvent(type, { detail });
            const event = new Event(type) as Event & { detail?: unknown };
            event.detail = detail;
            return event;
        }
    }

    const Service = new Services.Service<ServiceContract>
    (
        'websockets',
        {
            Create(url: string | URL, options?: SocketOptions): Socket
            {
                return Socket.Create(url, options);
            }
        }
    );
}

export default WebSockets.Socket;
