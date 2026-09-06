/**
 * @module      additionals/Network
 * @description AriannA network abstraction layer. HTTP, SSE, WebSockets, GraphQL protocol helpers,
 *              diagnostics and browser network analysis are composed here without duplicating Core transports.
 * @author      Riccardo Angeli
 * @version     2.0.0
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 */

import
{
    Services,
    Reactivity,
    WebSockets,
    GraphQL
}
from '../core/index.ts';

/** @namespace Network */
export namespace Network
{
    export namespace Types
    {
        export type Protocol = 'HTTP' | 'SSE' | 'WebSocket' | 'GraphQL';
        export type ErrorKind = 'Abort' | 'Timeout' | 'HTTP' | 'Socket' | 'Protocol' | 'Parse' | 'Worker' | 'Unknown';
        export type GraphQLOperation = 'query' | 'mutation' | 'subscription';
    }

    export namespace Interfaces
    {
        export interface Retry
        {
            Count?: number;
            Base?: number;
            Maximum?: number;
            Factor?: number;
            Jitter?: number;
            Statuses?: number[];
        }

        export interface Options
        {
            Base?: string | URL;
            Headers?: Record<string, string>;
            Timeout?: number;
            Retry?: number | Retry;
            Secure?: boolean;
            Diagnostics?: boolean;
        }

        export interface RequestOptions extends RequestInit
        {
            Retry?: number | Retry;
            Timeout?: number;
            Parse?: 'response' | 'json' | 'text' | 'arrayBuffer' | 'blob';
        }

        export interface SSEOptions
        {
            Headers?: Record<string, string>;
            Signal?: AbortSignal;
            Retry?: number | Retry;
            WithCredentials?: boolean;
            LastEventId?: string;
        }

        export interface SSEEvent<T = string>
        {
            Event: string;
            Data: T;
            Id: string;
            Retry?: number;
            Raw: string;
        }

        export interface Diagnostic
        {
            Id: string;
            Protocol: Types.Protocol;
            Method?: string;
            Url: string;
            Start: number;
            End?: number;
            Duration?: number;
            Status?: number;
            BytesIn: number;
            BytesOut: number;
            Retry: number;
            TTFB?: number;
            WorkerTime?: number;
            WasmTime?: number;
            ParseTime?: number;
            Error?: unknown;
            Meta?: Record<string, unknown>;
        }

        export interface Analysis
        {
            Count: number;
            Failures: number;
            BytesIn: number;
            BytesOut: number;
            AverageDuration: number;
            ByProtocol: Record<string, number>;
        }

        export interface GraphQLOperation
        {
            Kind: Types.GraphQLOperation;
            Name: string | null;
            Start: number;
            End: number;
            Source: string;
        }
    }

    type WorkerLike = GraphQL.WorkerLike;

    /** @class Client @description Unified AriannA network abstraction and diagnostics recorder. */
    export class Client
    {
        readonly Timeline$ = Reactivity.CreateSignal<Interfaces.Diagnostic[]>([], { Name: 'Network.Timeline' });

        #base = '';
        #headers: Record<string, string> = {};
        #timeout = 15_000;
        #secure = false;
        #diagnostics = true;
        #retry: Required<Interfaces.Retry> =
        {
            Count: 2,
            Base: 250,
            Maximum: 5_000,
            Factor: 2,
            Jitter: 0.2,
            Statuses: [408, 425, 429, 500, 502, 503, 504]
        };
        #worker: WorkerLike | null = null;
        #workerOptions: Parameters<WebSockets.Socket['Worker']>[1] = {};

        constructor(options: Interfaces.Options = {})
        {
            if(options.Base) this.Base(options.Base);
            if(options.Headers) this.Headers(options.Headers);
            if(options.Timeout !== undefined) this.Timeout(options.Timeout);
            if(options.Retry !== undefined) this.Retry(options.Retry);
            if(options.Secure !== undefined) this.Secure(options.Secure);
            if(options.Diagnostics !== undefined) this.Diagnostics(options.Diagnostics);
        }

        static Create(options?: Interfaces.Options): Client { return new Client(options); }

        Base(value: string | URL): this
        {
            this.#base = String(value).replace(/\/$/, '');
            return this;
        }

        Headers(value: Record<string, string>): this
        {
            this.#headers = { ...this.#headers, ...value };
            return this;
        }

        Timeout(milliseconds: number): this
        {
            this.#timeout = Math.max(0, Math.floor(milliseconds));
            return this;
        }

        Retry(options: number | Interfaces.Retry): this
        {
            if(typeof options === 'number')
            {
                this.#retry.Count = Math.max(0, Math.floor(options));
                return this;
            }
            this.#retry =
            {
                Count: Math.max(0, Math.floor(options.Count ?? this.#retry.Count)),
                Base: Math.max(0, options.Base ?? this.#retry.Base),
                Maximum: Math.max(0, options.Maximum ?? this.#retry.Maximum),
                Factor: Math.max(1, options.Factor ?? this.#retry.Factor),
                Jitter: Math.max(0, Math.min(1, options.Jitter ?? this.#retry.Jitter)),
                Statuses: [...(options.Statuses ?? this.#retry.Statuses)]
            };
            return this;
        }

        Secure(value = true): this
        {
            this.#secure = value;
            return this;
        }

        Diagnostics(value = true): this
        {
            this.#diagnostics = value;
            return this;
        }

        Worker(worker: WorkerLike | null, options: Parameters<WebSockets.Socket['Worker']>[1] = {}): this
        {
            this.#worker = worker;
            this.#workerOptions = options ?? {};
            return this;
        }

        Socket(url: string | URL, options: WebSockets.SocketOptions = {}): WebSockets.Socket
        {
            const target = this.#Url(url, true);
            const socket = new WebSockets.Socket(target, options);
            if(this.#worker) socket.Worker(this.#worker, this.#workerOptions);

            const diagnostic = this.#Begin('WebSocket', target);
            socket.addEventListener('open', () => this.#Mark(diagnostic, { Meta: { State: 'Open' } }));
            socket.addEventListener('reconnect', (event: Event) =>
            {
                diagnostic.Retry += 1;
                const detail = (event as CustomEvent).detail;
                diagnostic.Meta = { ...(diagnostic.Meta ?? {}), Reconnect: detail };
                this.#Commit();
            });
            socket.addEventListener('close', () => this.#End(diagnostic));
            socket.addEventListener('socketerror', (event: Event) => this.#End(diagnostic, undefined, (event as CustomEvent).detail?.Error));
            return socket;
        }

        GraphQL(endpoint: string | URL, options: GraphQL.ClientOptions = {}): GraphQL.Client
        {
            const target = this.#Url(endpoint, false);
            const client = new GraphQL.Client(target, options);
            if(this.#worker) client.Worker(this.#worker, this.#workerOptions);
            return client;
        }

        async Request<T = Response>(input: string | URL, options: Interfaces.RequestOptions = {}): Promise<T>
        {
            const url = this.#Url(input, false);
            const method = String(options.method ?? 'GET').toUpperCase();
            const retry = Client.#Retry(options.Retry ?? this.#retry, this.#retry);
            const timeout = options.Timeout ?? this.#timeout;
            const parse = options.Parse ?? 'response';
            const diagnostic = this.#Begin('HTTP', url, method);
            let lastError: unknown;

            for(let attempt = 0; attempt <= retry.Count; attempt++)
            {
                diagnostic.Retry = attempt;
                const controller = new AbortController();
                const external = options.signal;
                const abort = (): void => controller.abort(external?.reason);
                external?.addEventListener('abort', abort, { once: true });
                const timer = timeout > 0 ? setTimeout(() => controller.abort(new DOMException('Network timeout.', 'TimeoutError')), timeout) : null;

                try
                {
                    const started = performance.now();
                    const response = await fetch
                    (
                        url,
                        {
                            ...options,
                            signal: controller.signal,
                            headers: { ...this.#headers, ...(options.headers as Record<string, string> | undefined) }
                        }
                    );
                    diagnostic.TTFB = performance.now() - started;
                    diagnostic.Status = response.status;
                    this.#ResourceTiming(url, diagnostic);

                    if(!response.ok && retry.Statuses.includes(response.status) && attempt < retry.Count)
                    {
                        await Client.#Sleep(Client.#Delay(retry, attempt));
                        continue;
                    }

                    if(!response.ok)
                        throw Object.assign(new Error(`[arianna] HTTP ${response.status} ${response.statusText}.`), { Response: response });

                    let value: unknown = response;
                    const parseStart = performance.now();
                    if(parse === 'json') value = await response.json();
                    else if(parse === 'text') value = await response.text();
                    else if(parse === 'arrayBuffer') value = await response.arrayBuffer();
                    else if(parse === 'blob') value = await response.blob();
                    diagnostic.ParseTime = performance.now() - parseStart;
                    diagnostic.BytesIn += Client.#ContentLength(response, value);
                    diagnostic.BytesOut += Client.#BodySize(options.body);
                    this.#End(diagnostic, response.status);
                    return value as T;
                }
                catch(error)
                {
                    lastError = error;
                    if(attempt >= retry.Count || !Client.#Retryable(error))
                    {
                        this.#End(diagnostic, diagnostic.Status, error);
                        throw Client.#NetworkError(error, url, method, diagnostic);
                    }
                    await Client.#Sleep(Client.#Delay(retry, attempt));
                }
                finally
                {
                    external?.removeEventListener('abort', abort);
                    if(timer) clearTimeout(timer);
                }
            }

            this.#End(diagnostic, diagnostic.Status, lastError);
            throw Client.#NetworkError(lastError, url, method, diagnostic);
        }

        Get<T = Response>(url: string | URL, options: Interfaces.RequestOptions = {}): Promise<T>
        { return this.Request<T>(url, { ...options, method: 'GET' }); }

        Post<T = Response>(url: string | URL, body?: BodyInit | null, options: Interfaces.RequestOptions = {}): Promise<T>
        { return this.Request<T>(url, { ...options, method: 'POST', body }); }

        Put<T = Response>(url: string | URL, body?: BodyInit | null, options: Interfaces.RequestOptions = {}): Promise<T>
        { return this.Request<T>(url, { ...options, method: 'PUT', body }); }

        Patch<T = Response>(url: string | URL, body?: BodyInit | null, options: Interfaces.RequestOptions = {}): Promise<T>
        { return this.Request<T>(url, { ...options, method: 'PATCH', body }); }

        Delete<T = Response>(url: string | URL, options: Interfaces.RequestOptions = {}): Promise<T>
        { return this.Request<T>(url, { ...options, method: 'DELETE' }); }

        /** Auth/header-capable SSE implemented over fetch + ReadableStream, not EventSource. */
        SSE<T = string>(input: string | URL, options: Interfaces.SSEOptions = {}): AsyncIterable<Interfaces.SSEEvent<T>>
        {
            const self = this;
            const url = this.#Url(input, false);
            return {
                async *[Symbol.asyncIterator](): AsyncIterator<Interfaces.SSEEvent<T>>
                {
                    const retry = Client.#Retry(options.Retry ?? self.#retry, self.#retry);
                    let reconnect = 0;
                    let lastId = options.LastEventId ?? '';
                    let serverDelay = retry.Base;

                    while(!options.Signal?.aborted)
                    {
                        const diagnostic = self.#Begin('SSE', url, 'GET');
                        diagnostic.Retry = reconnect;
                        try
                        {
                            const response = await fetch(url,
                            {
                                headers:
                                {
                                    accept: 'text/event-stream',
                                    ...self.#headers,
                                    ...options.Headers,
                                    ...(lastId ? { 'last-event-id': lastId } : {})
                                },
                                signal: options.Signal,
                                credentials: options.WithCredentials ? 'include' : undefined
                            });

                            diagnostic.Status = response.status;
                            if(!response.ok || !response.body)
                                throw new Error(`[arianna] SSE HTTP ${response.status} ${response.statusText}.`);

                            const reader = response.body.getReader();
                            const decoder = new TextDecoder();
                            let buffer = '';

                            while(true)
                            {
                                const chunk = await reader.read();
                                if(chunk.done) break;
                                diagnostic.BytesIn += chunk.value.byteLength;
                                buffer += decoder.decode(chunk.value, { stream: true });
                                let boundary: number;
                                while((boundary = Client.#EventBoundary(buffer)) >= 0)
                                {
                                    const raw = buffer.slice(0, boundary);
                                    buffer = buffer.slice(boundary).replace(/^(?:\r?\n){2}/, '');
                                    const event = Client.#ParseSSE<T>(raw);
                                    if(event.Id) lastId = event.Id;
                                    if(event.Retry !== undefined) serverDelay = event.Retry;
                                    if(raw.trim()) yield event;
                                }
                            }
                            self.#End(diagnostic, response.status);
                        }
                        catch(error)
                        {
                            self.#End(diagnostic, diagnostic.Status, error);
                            if(options.Signal?.aborted) return;
                            if(reconnect >= retry.Count) throw Client.#NetworkError(error, url, 'SSE', diagnostic);
                        }

                        reconnect += 1;
                        await Client.#Sleep(Math.max(serverDelay, Client.#Delay(retry, reconnect - 1)), options.Signal);
                    }
                }
            };
        }

        Entries(): readonly Interfaces.Diagnostic[] { return this.Timeline$.Peek(); }

        ClearDiagnostics(): this
        {
            this.Timeline$.Set([]);
            return this;
        }

        Analyze(): Interfaces.Analysis
        {
            const entries = this.Timeline$.Peek();
            const byProtocol: Record<string, number> = {};
            let failures = 0, bytesIn = 0, bytesOut = 0, duration = 0, durationCount = 0;
            for(const item of entries)
            {
                byProtocol[item.Protocol] = (byProtocol[item.Protocol] ?? 0) + 1;
                if(item.Error) failures += 1;
                bytesIn += item.BytesIn;
                bytesOut += item.BytesOut;
                if(item.Duration !== undefined) { duration += item.Duration; durationCount += 1; }
            }
            return {
                Count: entries.length,
                Failures: failures,
                BytesIn: bytesIn,
                BytesOut: bytesOut,
                AverageDuration: durationCount ? duration / durationCount : 0,
                ByProtocol: byProtocol
            };
        }

        /** Lightweight GraphQL document parser. Core GraphQL intentionally has no parser dependency. */
        static ParseGraphQL(document: string): Interfaces.GraphQLOperation[]
        {
            const clean = Client.#StripGraphQL(document);
            const operations: Interfaces.GraphQLOperation[] = [];
            const re = /\b(query|mutation|subscription)\b(?:\s+([_A-Za-z][_0-9A-Za-z]*))?/g;
            let match: RegExpExecArray | null;

            while((match = re.exec(clean)))
            {
                const kind = match[1] as Types.GraphQLOperation;
                const name = match[2] ?? null;
                const brace = clean.indexOf('{', re.lastIndex);
                if(brace < 0) break;
                const end = Client.#BalancedGraphQL(clean, brace);
                if(end < 0) break;
                operations.push({ Kind: kind, Name: name, Start: match.index, End: end + 1, Source: document.slice(match.index, end + 1) });
                re.lastIndex = end + 1;
            }

            if(operations.length === 0)
            {
                const brace = clean.indexOf('{');
                if(brace >= 0)
                {
                    const end = Client.#BalancedGraphQL(clean, brace);
                    if(end >= 0) operations.push({ Kind: 'query', Name: null, Start: brace, End: end + 1, Source: document.slice(brace, end + 1) });
                }
            }
            return operations;
        }

        #Begin(protocol: Types.Protocol, url: string, method?: string): Interfaces.Diagnostic
        {
            const item: Interfaces.Diagnostic =
            {
                Id: `net-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
                Protocol: protocol,
                Method: method,
                Url: url,
                Start: performance.now(),
                BytesIn: 0,
                BytesOut: 0,
                Retry: 0
            };
            if(this.#diagnostics) this.Timeline$.Update(current => [...current, item]);
            return item;
        }

        #Mark(item: Interfaces.Diagnostic, patch: Partial<Interfaces.Diagnostic>): void
        {
            Object.assign(item, patch);
            this.#Commit();
        }

        #End(item: Interfaces.Diagnostic, status?: number, error?: unknown): void
        {
            item.End = performance.now();
            item.Duration = item.End - item.Start;
            if(status !== undefined) item.Status = status;
            if(error !== undefined) item.Error = error;
            this.#Commit();
        }

        #Commit(): void
        {
            if(this.#diagnostics) this.Timeline$.Touch();
        }

        #ResourceTiming(url: string, item: Interfaces.Diagnostic): void
        {
            try
            {
                const entries = performance.getEntriesByName(url, 'resource') as PerformanceResourceTiming[];
                const entry = entries.at(-1);
                if(!entry) return;
                item.Meta =
                {
                    ...(item.Meta ?? {}),
                    DNS: Math.max(0, entry.domainLookupEnd - entry.domainLookupStart),
                    Connect: Math.max(0, entry.connectEnd - entry.connectStart),
                    TLS: entry.secureConnectionStart > 0 ? Math.max(0, entry.connectEnd - entry.secureConnectionStart) : undefined,
                    TransferSize: entry.transferSize,
                    EncodedBodySize: entry.encodedBodySize,
                    DecodedBodySize: entry.decodedBodySize
                };
            }
            catch {}
        }

        #Url(input: string | URL, socket: boolean): string
        {
            let raw = String(input);
            if(this.#base && !/^[a-z][a-z\d+.-]*:/i.test(raw)) raw = `${this.#base}/${raw.replace(/^\//, '')}`;
            const url = new URL(raw, typeof location !== 'undefined' ? location.href : 'http://localhost');
            if(socket && (url.protocol === 'http:' || url.protocol === 'https:')) url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
            if(this.#secure && typeof location !== 'undefined' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1')
            {
                if(socket && url.protocol !== 'wss:') throw new Error('[arianna] Network Secure mode requires wss:.');
                if(!socket && url.protocol !== 'https:') throw new Error('[arianna] Network Secure mode requires https:.');
            }
            return url.toString();
        }

        static #Retry(source: number | Interfaces.Retry, fallback: Required<Interfaces.Retry>): Required<Interfaces.Retry>
        {
            if(typeof source === 'number') return { ...fallback, Count: Math.max(0, Math.floor(source)) };
            return {
                Count: Math.max(0, Math.floor(source.Count ?? fallback.Count)),
                Base: Math.max(0, source.Base ?? fallback.Base),
                Maximum: Math.max(0, source.Maximum ?? fallback.Maximum),
                Factor: Math.max(1, source.Factor ?? fallback.Factor),
                Jitter: Math.max(0, Math.min(1, source.Jitter ?? fallback.Jitter)),
                Statuses: [...(source.Statuses ?? fallback.Statuses)]
            };
        }

        static #Delay(retry: Required<Interfaces.Retry>, attempt: number): number
        {
            const base = Math.min(retry.Maximum, retry.Base * Math.pow(retry.Factor, Math.max(0, attempt)));
            return Math.max(0, Math.round(base + base * retry.Jitter * ((Math.random() * 2) - 1)));
        }

        static #Sleep(milliseconds: number, signal?: AbortSignal): Promise<void>
        {
            if(signal?.aborted) return Promise.reject(signal.reason);
            return new Promise((resolve, reject) =>
            {
                const timer = setTimeout(resolve, milliseconds);
                signal?.addEventListener('abort', () => { clearTimeout(timer); reject(signal.reason); }, { once: true });
            });
        }

        static #Retryable(error: unknown): boolean
        {
            if(error instanceof DOMException && error.name === 'AbortError') return false;
            return true;
        }

        static #NetworkError(error: unknown, url: string, method: string, diagnostic: Interfaces.Diagnostic): Error
        {
            const cause = error instanceof Error ? error : new Error(String(error ?? 'Unknown network error'));
            const kind: Types.ErrorKind =
                cause.name === 'AbortError' ? 'Abort' :
                cause.name === 'TimeoutError' ? 'Timeout' :
                diagnostic.Status ? 'HTTP' : 'Unknown';
            return Object.assign(cause,
            {
                Network:
                {
                    Kind: kind,
                    Protocol: diagnostic.Protocol,
                    Method: method,
                    Url: url,
                    Status: diagnostic.Status,
                    Retryable: kind !== 'Abort',
                    OperationId: diagnostic.Id,
                    Timestamp: Date.now()
                }
            });
        }

        static #BodySize(body: BodyInit | null | undefined): number
        {
            if(typeof body === 'string') return new TextEncoder().encode(body).byteLength;
            if(body instanceof ArrayBuffer) return body.byteLength;
            if(ArrayBuffer.isView(body)) return body.byteLength;
            if(typeof Blob !== 'undefined' && body instanceof Blob) return body.size;
            return 0;
        }

        static #ContentLength(response: Response, value: unknown): number
        {
            const header = Number(response.headers.get('content-length'));
            if(Number.isFinite(header) && header >= 0) return header;
            if(typeof value === 'string') return new TextEncoder().encode(value).byteLength;
            if(value instanceof ArrayBuffer) return value.byteLength;
            if(typeof Blob !== 'undefined' && value instanceof Blob) return value.size;
            return 0;
        }

        static #EventBoundary(buffer: string): number
        {
            const unix = buffer.indexOf('\n\n');
            const win = buffer.indexOf('\r\n\r\n');
            if(unix < 0) return win;
            if(win < 0) return unix;
            return Math.min(unix, win);
        }

        static #ParseSSE<T>(raw: string): Interfaces.SSEEvent<T>
        {
            let event = 'message', id = '', retry: number | undefined;
            const data: string[] = [];
            for(const line of raw.split(/\r?\n/))
            {
                if(!line || line.startsWith(':')) continue;
                const colon = line.indexOf(':');
                const field = colon < 0 ? line : line.slice(0, colon);
                const value = colon < 0 ? '' : line.slice(colon + 1).replace(/^ /, '');
                if(field === 'event') event = value || 'message';
                else if(field === 'data') data.push(value);
                else if(field === 'id') id = value;
                else if(field === 'retry' && /^\d+$/.test(value)) retry = Number(value);
            }
            const text = data.join('\n');
            let value: unknown = text;
            if(text && /^[\[{]/.test(text.trim()))
            {
                try { value = JSON.parse(text); } catch {}
            }
            return { Event: event, Data: value as T, Id: id, Retry: retry, Raw: raw };
        }

        static #StripGraphQL(source: string): string
        {
            let out = '', i = 0;
            while(i < source.length)
            {
                if(source[i] === '#')
                {
                    while(i < source.length && source[i] !== '\n') { out += ' '; i++; }
                    continue;
                }
                if(source.startsWith('"""', i))
                {
                    out += '   '; i += 3;
                    while(i < source.length && !source.startsWith('"""', i)) { out += source[i] === '\n' ? '\n' : ' '; i++; }
                    if(i < source.length) { out += '   '; i += 3; }
                    continue;
                }
                if(source[i] === '"')
                {
                    out += ' '; i++;
                    while(i < source.length)
                    {
                        if(source[i] === '\\') { out += '  '; i += 2; continue; }
                        if(source[i] === '"') { out += ' '; i++; break; }
                        out += source[i] === '\n' ? '\n' : ' '; i++;
                    }
                    continue;
                }
                out += source[i++];
            }
            return out;
        }

        static #BalancedGraphQL(source: string, brace: number): number
        {
            let depth = 0;
            for(let i = brace; i < source.length; i++)
            {
                if(source[i] === '{') depth += 1;
                else if(source[i] === '}' && --depth === 0) return i;
            }
            return -1;
        }
    }

    export const Plugin =
    {
        name: 'network',
        install(): void
        {
            if(typeof globalThis !== 'undefined' && !('AriannANetwork' in globalThis))
            {
                Object.defineProperty(globalThis, 'AriannANetwork',
                {
                    value: Network,
                    writable: false,
                    enumerable: false,
                    configurable: true
                });
            }
        }
    };

    const Service = new Services.Service
    (
        'network',
        {
            Create(options?: Interfaces.Options): Client { return Client.Create(options); },
            ParseGraphQL: Client.ParseGraphQL
        }
    );
}

export default Network;
