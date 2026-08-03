/**
 * @module    AriannAWorkers
 * @author    Riccardo Angeli
 * @version   0.2.0
 * @copyright Riccardo Angeli 2026 All Rights Reserved
 *
 * WebWorker abstraction, parallel computation.
 * Includes: WorkerPool, SharedState, OffscreenCanvas, ComputeShader bridge.
 *
 * ── SIGNAL BRIDGE ─────────────────────────────────────────────────────────────
 * Workers.sharedSignal(key, initial) → Signal<T> sincronizzato cross-thread
 * via SharedArrayBuffer + Atomics (ove disponibile) o postMessage fallback.
 *
 * Il Signal creato è identico a State.signal() — stessa API .get()/.set()/.peek().
 * Gli Effect nel thread main reagiscono normalmente.
 * Quando il worker chiama postMessage({ type: 'signal', key, value }),
 * il thread main aggiorna il Signal corrispondente → tutti gli Effect reagiscono.
 *
 * @example
 *   const Workers = Core.use(WorkersPlugin);
 *
 *   // Thread main
 *   const progress = Workers.sharedSignal('progress', 0);
 *   State.effect(() => { progressBar.style('width', `${progress.get()}%`); });
 *
 *   // Worker (via postMessage protocol)
 *   for (let i = 0; i <= 100; i++) {
 *     self.postMessage({ type: 'arianna:signal', key: 'progress', value: i });
 *     await sleep(10);
 *   }
 */

import { Core } from './Core.ts';
import { Reactivity } from './Reactive.ts';

/** @namespace Workers @description Type contracts (merged with the class). */
export namespace Workers
{
    export interface WorkerTask<T = unknown>
    {
        fn     : (...args: unknown[]) => T;
        args   : unknown[];
        resolve: (v: T) => void;
        reject : (e: unknown) => void;
    }

    /**
     * Pool di Worker riusabili — evita il costo di spawn per ogni task.
     *
     * @example
     *   const pool = new WorkerPool(4, './worker.js');
     *   const result = await pool.run((a, b) => a + b, [1, 2]);
     */
    export class WorkerPool
    {
        #workers : globalThis.Worker[]     = [];
        #queue   : Workers.WorkerTask[] = [];
        #idle    : globalThis.Worker[]     = [];

        constructor(size: number, url: string | URL)
        {
            for (let i = 0; i < size; i++) {
                const w = new globalThis.Worker(url, { type: 'module' });
                w.onmessage = (e) => this.#onResult(w, e.data);
                w.onerror   = (e) => this.#onError(w, e);
                this.#workers.push(w);
                this.#idle.push(w);
            }
        }

        /**
         * Esegue fn in un worker del pool.
         * Il worker deve esporre un handler che risponde a { fn, args }.
         */
        run<T>(fn: (...args: unknown[]) => T, args: unknown[] = []): Promise<T>
        {
            return new Promise((resolve, reject) => {
                const task: Workers.WorkerTask<T> = { fn, args, resolve, reject };
                const worker = this.#idle.pop();
                if (worker) this.#dispatch(worker, task as Workers.WorkerTask);
                else this.#queue.push(task as Workers.WorkerTask);
            });
        }

        /** Termina tutti i worker del pool. */
        terminate(): void
        {
            this.#workers.forEach(w => w.terminate());
            this.#workers = []; this.#idle = []; this.#queue = [];
        }

        #dispatch(worker: globalThis.Worker, task: Workers.WorkerTask): void
        {
            (worker as unknown as Record<string, unknown>)['__task__'] = task;
            worker.postMessage({ fn: task.fn.toString(), args: task.args });
        }

        #onResult(worker: globalThis.Worker, data: unknown): void
        {
            const task = (worker as unknown as Record<string, unknown>)['__task__'] as Workers.WorkerTask | undefined;
            task?.resolve(data);
            const next = this.#queue.shift();
            if (next) this.#dispatch(worker, next);
            else this.#idle.push(worker);
        }

        #onError(worker: globalThis.Worker, e: ErrorEvent): void
        {
            const task = (worker as unknown as Record<string, unknown>)['__task__'] as Workers.WorkerTask | undefined;
            task?.reject(e.error ?? e.message);
            this.#idle.push(worker);
        }
    }

// ── SharedState — Signal bridge cross-thread ──────────────────────────────────

    /** @class Worker @description Worker utilities: shared signals synced via postMessage, OffscreenCanvas
     *  bridge, and the plugin installer. All state/helpers embedded as static # — nothing scattered. */
    export class Worker
    {
        /** @name PluginName @public @static @readonly */
        static readonly PluginName = 'AriannAWorkers';
        /** @name PluginVersion @public @static @readonly */
        static readonly PluginVersion = '0.2.0';

        /** @name #sharedSignals @private @static @description Active shared signals, keyed by name (SOT). */
        static #sharedSignals = new Map<string, Reactivity.Signal<unknown>>();

        /** @name sharedSignal @public @static @description Create/get a Signal synced with Workers via postMessage
         *  (`{ type: 'arianna:signal', key, value }`). */
        static sharedSignal<T>(key: string, initial: T): Reactivity.Signal<T>
        {
            if (Worker.#sharedSignals.has(key)) return Worker.#sharedSignals.get(key) as Reactivity.Signal<T>;
            const s = new Reactivity.Signal<T>(initial);
            Worker.#sharedSignals.set(key, s as Reactivity.Signal<unknown>);
            return s;
        }

        /** @name offscreen @public @static @description Transfer a canvas to a Worker for off-thread rendering. */
        static offscreen(canvas: HTMLCanvasElement, worker: globalThis.Worker): void
        {
            if (!('transferControlToOffscreen' in canvas)) {
                console.warn('[AriannA Workers] OffscreenCanvas not supported in this browser');
                return;
            }
            const offscreenCanvas = (canvas as unknown as { transferControlToOffscreen(): OffscreenCanvas }).transferControlToOffscreen();
            worker.postMessage({ type: 'arianna:offscreen', canvas: offscreenCanvas }, [offscreenCanvas as unknown as Transferable]);
        }

        /** @name #installWorkerListener @private @static @description Global handler for messages FROM Workers.
         *  The `message` event is the worker TRANSPORT (postMessage) → stays native, not the Core.Events bus. */
        static #installWorkerListener(): void
        {
            if (typeof window === 'undefined') return;
            window.addEventListener('message', (e: MessageEvent) => {
                const { type, key, value } = e.data ?? {};
                if (type === 'arianna:signal' && Worker.#sharedSignals.has(key)) {
                    (Worker.#sharedSignals.get(key) as Reactivity.Signal<unknown>).Set(value);
                }
            });
        }

        /** @name install @public @static @description Plugin install: wires the worker listener + exposes the API. */
        static install(_core: typeof Core, _opts?: unknown): void
        {
            Worker.#installWorkerListener();
            const API = {
                WorkerPool,
                sharedSignal: Worker.sharedSignal,
                offscreen: Worker.offscreen,
                get signals() { return Worker.#sharedSignals; },
            };
            Object.defineProperty(window, 'AriannAWorkers', {
                value: API, writable: false, enumerable: false, configurable: false,
            });
        }
    }

    /** @name        workersService
     *  @private
     *  @description Registers the 'workers' service: worker pool + shared signals + offscreen transfer.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    const Service = new Core.Services.Service
    (
        'workers',
        {
            /** Create a reusable Worker pool. */
            pool(size: number, url: string | URL): Workers.WorkerPool
            { return new Workers.WorkerPool(size, url); },
            /** Create/get a cross-thread shared Signal. */
            sharedSignal: Workers.Worker.sharedSignal,
            /** Transfer a canvas to a Worker for off-thread rendering. */
            offscreen: Workers.Worker.offscreen,
        }
    );
}



export default Workers;

// ── Top-level re-exports (barrel imports WorkerPool / WorkerTask by name). ──
export import WorkerPool = Workers.WorkerPool;
export type WorkerTask<T = unknown> = Workers.WorkerTask<T>;
