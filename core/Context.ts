/**
 * @module    Context
 * @author    Riccardo Angeli
 * @version   1.2.0
 * @copyright Riccardo Angeli 2012-2026
 *
 * Context per AriannA — elimina il property drilling.
 * Signal integrati — ctx.asSignal() reagisce automaticamente a ctx.update().
 */

import { Core } from './Core.ts';
import { Events } from './Events.ts';
import { Reactivity } from './Reactive.ts';

/** @namespace Context @description Public + internal type contracts for Context (merged with the class). */
export namespace Context
{
    export class Context<T = unknown>
    {
        static
        {
            if (typeof window !== 'undefined')
            {
                Object.defineProperty
                (
                    window,
                    'Context',
                    {
                        enumerable: true,
                        configurable: false,
                        writable: false,
                        value: Context
                    }
                );
            }
        }

        /** @name #registry @private @static @description Per-key context store (SOT). */
        static #registry = new Map<string, Context.ContextRecord<unknown>>();

        /** @name #get @private @static @description Get-or-create the record for a key. */
        static #get<T>(key: string): Context.ContextRecord<T>
        {
            if (!Context.#registry.has(key))
            {
                Context.#registry.set
                (
                    key,
                    {
                        value     : undefined,
                        $signal   : new Reactivity.Signal<any>(undefined),
                        providers : new Set(),
                        consumers : new Set()
                    }
                );
            }
            return Context.#registry.get(key) as Context.ContextRecord<T>;
        }

        /** @name #fire @private @static @description Notify consumers of a context value change. */
        static #fire<T>(record: Context.ContextRecord<T>, key: string, nv: T, old: T | undefined): void
        {
            record.$signal.Set(nv);
            const ev: Context.ContextEvent<T> = { Type: 'Context-Changed', Key: key, Value: nv, Old: old };
            for (const c of record.consumers) {
                const bucket = c.events.get('Context-Changed');
                if (bucket) for (const cb of bucket) cb(ev);
            }
        }
        readonly #key : string;
        readonly #rec : Context.ContextRecord<T>;

        constructor(key: string, value?: T)
        {
            this.#key = key;
            this.#rec = Context.#get<T>(key);
            if (value !== undefined) { this.#rec.value = value; this.#rec.$signal.Set(value); }
        }

        get key(): string          { return this.#key; }
        get value(): T | undefined { return this.#rec.value; }

        /**
         * Espone il valore come Signal reattivo.
         * Gli Effect che lo leggono reagiscono automaticamente a update().
         * @example
         *   const $theme = ThemeCtx.asSignal();
         *   real.style('background', () => $theme.get()?.primary ?? 'gray');
         */
        asSignal(): Reactivity.Signal<T | undefined> { return this.#rec.$signal; }

        provide(element: Element): this
        {
            this.#rec.providers.add(element);
            Events.Event.On(element, Events.Types.AriannA.ContextRequest.Name, (e: Event) => {
                const ce = e as CustomEvent<{ key: string; resolve: (v: unknown) => void }>;
                if (ce.detail.key === this.#key) { ce.stopPropagation(); ce.detail.resolve(this.#rec.value); }
            });
            return this;
        }

        update(value: T): this
        {
            const old = this.#rec.value;
            if (Object.is(old, value)) return this;
            this.#rec.value = value;
            Context.#fire(this.#rec, this.#key, value, old);
            return this;
        }

        destroy(): void
        { this.#rec.providers.clear(); this.#rec.consumers.clear(); Context.#registry.delete(this.#key); }

        static consume<T>(key: string, element: Element): Context.ConsumerHandle<T>
        {
            const rec = Context.#get<T>(key);
            const cr: Context.ConsumerRecord<T> = { element, events: new Map() };
            rec.consumers.add(cr);

            let resolved = false;
            Events.Event.Fire(element, {
                Type: Events.Types.AriannA.ContextRequest.Name,
                Propagation: true,
                Detail: { key, resolve: (v: unknown) => { if (!resolved) { resolved = true; rec.value = v as T; rec.$signal.Set(v as T); } } },
            });

            const handle: Context.ConsumerHandle<T> = {
                get value() { return rec.value; },
                signal()    { return rec.$signal; },
                on(types, cb) { types.split(/\s+|,|\|/g).filter(Boolean).forEach(t => { const b = cr.events.get(t) ?? new Set(); b.add(cb); cr.events.set(t, b); }); return handle; },
                off(type, cb) { cr.events.get(type)?.delete(cb); return handle; },
                detach() { rec.consumers.delete(cr); },
            };
            return handle;
        }

        static has(key: string, element: Element): boolean
        {
            let found = false;
            Events.Event.Fire(element, { Type: Events.Types.AriannA.ContextRequest.Name, Propagation: true, Detail: { key, resolve: () => { found = true; } } });
            return found;
        }

        static keys(): string[] { return Array.from(Context.#registry.keys()); }
    }

    /** The context-changed event shape. */
    export interface ContextEvent<T = unknown>
    { Type: string; Key: string; Value: T; Old: T | undefined; }
    /** A consumer's handle: reactive signal + on/off + detach. */
    export interface ConsumerHandle<T>
    { readonly value: T | undefined; signal(): Reactivity.Signal<T | undefined>; on(types: string, cb: (e: ContextEvent<T>) => void): ConsumerHandle<T>; off(type: string, cb: (e: ContextEvent<T>) => void): ConsumerHandle<T>; detach(): void; }
    /** Per-key store record. */
    export interface ContextRecord<T>
    { value: T | undefined; $signal: Reactivity.Signal<T | undefined>; providers: Set<Element>; consumers: Set<ConsumerRecord<T>>; }
    /** Per-consumer record. */
    export interface ConsumerRecord<T>
    { element: Element; events: Map<string, Set<(e: ContextEvent<T>) => void>>; }

    /** @name        contextService
     *  @private
     *  @description Registers the 'context' service: create / consume / query contexts through the
     *               kernel registry instead of importing Context directly.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export const contextService = new Core.Services.Service
    (
        'context',
        {
            /** Create or get a context by key (optionally seeding a value). */
            make(key: string, value?: unknown): Context { return new Context(key, value); },
            /** Consume a context from an element (event-based resolution). */
            consume(key: string, element: Element): ConsumerHandle<unknown> { return Context.consume(key, element); },
            /** True if a context for `key` is provided above `element`. */
            has(key: string, element: Element): boolean { return Context.has(key, element); },
            /** All registered context keys. */
            keys(): string[] { return Context.keys(); },
        }
    );
}

export default Context;


