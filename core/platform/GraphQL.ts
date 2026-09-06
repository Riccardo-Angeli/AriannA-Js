/**
 * @module    core/GraphQL
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description Thin GraphQL protocol client for AriannA. It deliberately does not parse GraphQL documents:
 *              query parsing/introspection tooling belongs to the Network additional. HTTP query/mutation,
 *              graphql-transport-ws subscriptions, persisted operations and hydration-safe cache snapshots live here.
 */

import type { Types }      from '../definitions/Types.ts';
import type { Interfaces } from '../definitions/Interfaces.ts';

import { Services } from '../kernel/Services.ts';

/** @namespace GraphQL */
export namespace GraphQL
{
    export type OperationKind    = Types.GraphQL.OperationKind;
    export type Variables        = Interfaces.GraphQL.Variables;
    export type ErrorShape       = Interfaces.GraphQL.Error;
    export type Response<T>      = Interfaces.GraphQL.Response<T>;
    export type OperationOptions = Interfaces.GraphQL.OperationOptions;
    export type ClientOptions    = Interfaces.GraphQL.ClientOptions;
    export type Subscription<T>  = Interfaces.GraphQL.Subscription<T>;
    export type WorkerLike       = Interfaces.WebSockets.WorkerLike;
    export type ServiceContract  = Interfaces.GraphQL.Service;

    type SocketLike = EventTarget &
    {
        Protocols(...protocols: string[]): SocketLike;
        Worker(worker: WorkerLike | null, options?: Interfaces.WebSockets.WorkerOptions): SocketLike;
        WaitOpen(): Promise<SocketLike>;
        Send(data: string | ArrayBufferLike | Blob | ArrayBufferView): SocketLike;
        Close(code?: number, reason?: string): SocketLike;
        Dispose(): void;
    };

    interface SocketService
    {
        Create(url: string | URL, options?: Interfaces.WebSockets.SocketOptions): SocketLike;
    }

    type CacheRecord = Record<string, unknown>;

    /** @class Client @description GraphQL HTTP + subscription client with a small hydration-aware response cache. */
    export class Client
    {
        readonly Endpoint: string;

        #headers: Record<string, string> = {};
        #fetch: typeof fetch | null = typeof fetch === 'function' ? fetch.bind(globalThis) : null;
        #socketEndpoint: string | null = null;
        #connectionParams: unknown = undefined;
        #worker: WorkerLike | null = null;
        #workerOptions: Interfaces.WebSockets.WorkerOptions = {};
        #cacheEnabled = true;
        #cache = new Map<string, unknown>();
        #persisted = new Map<string, string>();

        constructor(endpoint: string | URL, options: ClientOptions = {})
        {
            this.Endpoint = String(endpoint);
            this.#headers = { ...(options.Headers ?? {}) };
            this.#fetch = options.Fetch ?? this.#fetch;
            this.#socketEndpoint = options.SocketEndpoint ? String(options.SocketEndpoint) : null;
            this.#connectionParams = options.ConnectionParams;
            this.#cacheEnabled = options.Cache ?? true;
            if(options.Worker) this.Worker(options.Worker, options.WorkerOptions);
            if(options.Persisted) for(const [name, id] of Object.entries(options.Persisted)) this.#persisted.set(name, id);
        }

        static Create(endpoint: string | URL, options?: ClientOptions): Client
        {
            return new Client(endpoint, options);
        }

        Headers(headers: Record<string, string>): this
        {
            this.#headers = { ...this.#headers, ...headers };
            return this;
        }

        Socket(endpoint: string | URL, connectionParams?: unknown): this
        {
            this.#socketEndpoint = String(endpoint);
            if(arguments.length > 1) this.#connectionParams = connectionParams;
            return this;
        }

        Worker(worker: WorkerLike | null, options: Interfaces.WebSockets.WorkerOptions = {}): this
        {
            this.#worker = worker;
            this.#workerOptions = { ...options };
            return this;
        }

        Cache(enabled: boolean): this
        {
            this.#cacheEnabled = enabled;
            if(!enabled) this.#cache.clear();
            return this;
        }

        Persist(name: string, sha256: string): this
        {
            this.#persisted.set(name, sha256);
            return this;
        }

        Snapshot(): CacheRecord
        {
            return Object.fromEntries(this.#cache.entries());
        }

        Hydrate(snapshot: CacheRecord): this
        {
            for(const [key, value] of Object.entries(snapshot ?? {})) this.#cache.set(key, value);
            return this;
        }

        Clear(): this
        {
            this.#cache.clear();
            return this;
        }

        Query<T = unknown>
        (
            document  : string,
            variables : Variables = {},
            options   : OperationOptions = {}
        ): Promise<T>
        {
            return this.#Execute<T>('query', document, variables, options);
        }

        Mutation<T = unknown>
        (
            document  : string,
            variables : Variables = {},
            options   : OperationOptions = {}
        ): Promise<T>
        {
            return this.#Execute<T>('mutation', document, variables, { ...options, Cache: false });
        }

        async #Execute<T>
        (
            kind      : OperationKind,
            document  : string,
            variables : Variables,
            options   : OperationOptions
        ): Promise<T>
        {
            const fetcher = this.#fetch;
            if(!fetcher) throw new Error('[arianna] GraphQL HTTP transport requires fetch().');

            const cacheKey = options.CacheKey ?? Client.#CacheKey(kind, document, variables, options.OperationName);
            const useCache = options.Cache ?? (kind === 'query' && this.#cacheEnabled);
            if(useCache && this.#cache.has(cacheKey)) return this.#cache.get(cacheKey) as T;

            const persisted = options.PersistedId ?? (options.OperationName ? this.#persisted.get(options.OperationName) : undefined);
            const body: Record<string, unknown> =
            {
                query         : document,
                variables,
                operationName : options.OperationName
            };

            if(persisted)
            {
                body.extensions =
                {
                    persistedQuery:
                    {
                        version    : 1,
                        sha256Hash : persisted
                    }
                };
            }

            const response = await fetcher
            (
                this.Endpoint,
                {
                    method  : 'POST',
                    headers :
                    {
                        'content-type': 'application/json',
                        'accept': 'application/graphql-response+json, application/json',
                        ...this.#headers,
                        ...(options.Headers ?? {})
                    },
                    body   : JSON.stringify(body),
                    signal : options.Signal
                }
            );

            if(!response.ok)
                throw new Error(`[arianna] GraphQL HTTP ${response.status} ${response.statusText}.`);

            const payload = await response.json() as Response<T>;
            if(payload.errors?.length)
            {
                const error = new Error(payload.errors.map(item => item.message).join('; '));
                Object.assign(error, { GraphQL: payload.errors, Extensions: payload.extensions });
                throw error;
            }

            if(!('data' in payload)) throw new Error('[arianna] GraphQL response contains no data.');
            const data = payload.data as T;
            if(useCache) this.#cache.set(cacheKey, data);
            return data;
        }

        Subscribe<T = unknown>
        (
            document  : string,
            variables : Variables = {},
            options   : OperationOptions = {}
        ): Subscription<T>
        {
            const sockets = Services.Resolve<SocketService>('websockets');
            if(!sockets)
                throw new Error('[arianna] GraphQL subscriptions require the WebSockets Core service.');

            const endpoint = this.#socketEndpoint ?? Client.#SocketEndpoint(this.Endpoint);
            const socket = sockets.Create(endpoint, { Protocols: ['graphql-transport-ws'] });
            socket.Protocols('graphql-transport-ws');
            if(this.#worker) socket.Worker(this.#worker, this.#workerOptions);

            const id = Client.#Identifier();
            const queue: T[] = [];
            const waiters: Array<{ resolve(value: IteratorResult<T>): void; reject(reason: unknown): void }> = [];
            let done = false;
            let started = false;
            let terminalError: unknown = null;

            const push = (value: T): void =>
            {
                const waiter = waiters.shift();
                if(waiter) waiter.resolve({ done: false, value });
                else queue.push(value);
            };

            const finish = (error?: unknown): void =>
            {
                if(done) return;
                done = true;
                terminalError = error ?? null;
                for(const waiter of waiters.splice(0))
                {
                    if(error) waiter.reject(error);
                    else waiter.resolve({ done: true, value: undefined as T });
                }
                socket.Close(1000, 'GraphQL subscription complete');
            };

            const onMessage = (event: Event): void =>
            {
                const detail = (event as CustomEvent<{ Data?: unknown }>).detail;
                const raw = detail?.Data;
                if(typeof raw !== 'string') return;

                let message: { id?: string; type?: string; payload?: Response<T> };
                try { message = JSON.parse(raw); }
                catch { return; }

                if(message.type === 'connection_ack' && !started)
                {
                    started = true;
                    const persisted = options.PersistedId ?? (options.OperationName ? this.#persisted.get(options.OperationName) : undefined);
                    const payload: Record<string, unknown> = { query: document, variables, operationName: options.OperationName };
                    if(persisted)
                        payload.extensions = { persistedQuery: { version: 1, sha256Hash: persisted } };
                    socket.Send(JSON.stringify({ id, type: 'subscribe', payload }));
                    return;
                }

                if(message.id !== id) return;

                if(message.type === 'next')
                {
                    if(message.payload?.errors?.length)
                    {
                        const error = new Error(message.payload.errors.map(item => item.message).join('; '));
                        Object.assign(error, { GraphQL: message.payload.errors });
                        finish(error);
                        return;
                    }
                    if(message.payload && 'data' in message.payload) push(message.payload.data as T);
                }
                else if(message.type === 'error')
                {
                    finish(new Error('[arianna] GraphQL subscription failed.'));
                }
                else if(message.type === 'complete') finish();
            };

            socket.addEventListener('message', onMessage);
            void socket.WaitOpen().then(() =>
            {
                socket.Send(JSON.stringify({ type: 'connection_init', payload: this.#connectionParams }));
            }).catch(finish);

            return {
                Id: id,
                Cancel(): void
                {
                    if(done) return;
                    try { socket.Send(JSON.stringify({ id, type: 'complete' })); } catch {}
                    finish();
                },
                [Symbol.asyncIterator](): AsyncIterator<T>
                {
                    return {
                        next(): Promise<IteratorResult<T>>
                        {
                            if(queue.length) return Promise.resolve({ done: false, value: queue.shift()! });
                            if(done)
                            {
                                if(terminalError) return Promise.reject(terminalError);
                                return Promise.resolve({ done: true, value: undefined as T });
                            }
                            return new Promise<IteratorResult<T>>((resolve, reject) => waiters.push({ resolve, reject }));
                        },
                        return(): Promise<IteratorResult<T>>
                        {
                            if(!done)
                            {
                                try { socket.Send(JSON.stringify({ id, type: 'complete' })); } catch {}
                                finish();
                            }
                            return Promise.resolve({ done: true, value: undefined as T });
                        }
                    };
                }
            };
        }

        static #CacheKey(kind: OperationKind, document: string, variables: Variables, operationName?: string): string
        {
            return `${kind}:${operationName ?? ''}:${Client.#Hash(document)}:${Client.#Hash(JSON.stringify(variables))}`;
        }

        static #Hash(value: string): string
        {
            let hash = 2166136261;
            for(let i = 0; i < value.length; i++)
            {
                hash ^= value.charCodeAt(i);
                hash = Math.imul(hash, 16777619);
            }
            return (hash >>> 0).toString(36);
        }

        static #SocketEndpoint(endpoint: string): string
        {
            const url = new URL(endpoint, typeof location !== 'undefined' ? location.href : 'http://localhost');
            url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
            return url.toString();
        }

        static #Identifier(): string
        {
            return `arianna-gql-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
        }
    }

    const Service = new Services.Service<ServiceContract>
    (
        'graphql',
        {
            Create(endpoint: string | URL, options?: ClientOptions): Client
            {
                return Client.Create(endpoint, options);
            }
        }
    );
}

export default GraphQL.Client;
