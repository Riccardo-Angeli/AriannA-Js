/**
 * @module    Context
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026
 *
 * Scoped DOM Context — eliminates prop drilling, with nearest-provider
 * resolution via DOM ancestry.
 *
 * # Model
 *
 *   const ThemeCtx = new Context<{ primary: string }>('theme');
 *
 *   // Provider — owns a value, exposes it to descendants:
 *   ThemeCtx.provide(parentEl, { primary: '#1f6feb' });
 *
 *   // Consumer — finds nearest ancestor that provides this key:
 *   const handle = ThemeCtx.consume(childEl);
 *   handle.value;         // { primary: '#1f6feb' }
 *   handle.signal();      // Signal<T | undefined> — reactive
 *
 *   // Mutate at provider:
 *   ThemeCtx.update(parentEl, { primary: '#ff3aa1' });
 *
 * # Important changes from v1
 *
 * v1 Context used a GLOBAL registry keyed by string. Two parts of the page
 * with the same `key` would collide.
 *
 * v2 Context stores values PER-PROVIDER on the provider Element itself (via
 * WeakMap<Element, Map<key, value>>). Consumers walk the DOM ancestor chain
 * to find the NEAREST provider for the requested key.
 *
 * The legacy `new Context('key', value)` global form still works for code
 * that does not need scoping — it falls back to a single window-rooted
 * provider.
 */

import { uuid, signal } from './Observable.ts';
import type { Signal } from './Observable.ts';

export interface ContextEvent<T = unknown>
{
    Type  : string;
    Key   : string;
    Value : T;
    Old   : T | undefined;
}

interface ConsumerHandle<T>
{
    readonly value : T | undefined;
    /** Reactive Signal — updated automatically by Context.update(). */
    signal(): Signal<T | undefined>;
    on(types: string, cb: (e: ContextEvent<T>) => void): ConsumerHandle<T>;
    off(type: string, cb: (e: ContextEvent<T>) => void): ConsumerHandle<T>;
    detach(): void;
}

interface ProviderRecord<T>
{
    value     : T | undefined;
    $signal   : Signal<T | undefined>;
    consumers : Set<ConsumerRecord<T>>;
}

interface ConsumerRecord<T>
{
    id      : string;
    element : Element;
    events  : Map<string, Set<(e: ContextEvent<T>) => void>>;
    provider: Element | null;
}

const PROVIDER_MAP: WeakMap<Element, Map<string, ProviderRecord<unknown>>> = new WeakMap();
const GLOBAL_RECORDS: Map<string, ProviderRecord<unknown>> = new Map();

function _ensureProviderMap(provider: Element): Map<string, ProviderRecord<unknown>>
{
    let m = PROVIDER_MAP.get(provider);
    if (!m) { m = new Map(); PROVIDER_MAP.set(provider, m); }
    return m;
}

function _makeRecord<T>(): ProviderRecord<T>
{
    return {
        value     : undefined,
        $signal   : signal<T | undefined>(undefined),
        consumers : new Set(),
    };
}

function _globalRec<T>(key: string): ProviderRecord<T>
{
    if (!GLOBAL_RECORDS.has(key)) GLOBAL_RECORDS.set(key, _makeRecord());
    return GLOBAL_RECORDS.get(key) as ProviderRecord<T>;
}

function _findProvider(consumer: Element, key: string): { provider: Element | null; rec: ProviderRecord<unknown> | null }
{
    let cur: Element | null = consumer;
    while (cur) {
        const m = PROVIDER_MAP.get(cur);
        const r = m?.get(key);
        if (r) return { provider: cur, rec: r };
        cur = cur.parentElement;
    }
    return { provider: null, rec: null };
}

function _fire<T>(record: ProviderRecord<T>, key: string, nv: T, old: T | undefined): void
{
    record.$signal.set(nv);
    const ev: ContextEvent<T> = { Type: 'Context-Changed', Key: key, Value: nv, Old: old };
    for (const c of record.consumers) {
        const bucket = c.events.get('Context-Changed');
        if (bucket) for (const cb of bucket) cb(ev);
    }
}


export class Context<T = unknown>
{
    readonly #key : string;
    #boundProvider: Element | null = null;

    constructor(key: string, value?: T)
    {
        this.#key = key;
        if (value !== undefined) {
            const rec = _globalRec<T>(key);
            rec.value = value;
            rec.$signal.set(value);
        }
    }

    get key(): string { return this.#key; }

    /**
     * Read scoped to a consumer location. Walks ancestors to find nearest
     * provider for this key. If none, returns undefined unless a legacy
     * global value was set.
     */
    valueFor(consumer?: Element): T | undefined
    {
        if (consumer) {
            const { rec } = _findProvider(consumer, this.#key);
            if (rec) return rec.value as T | undefined;
        }
        return _globalRec<T>(this.#key).value;
    }

    /** Legacy accessor — most recent globally-set value. */
    get value(): T | undefined { return _globalRec<T>(this.#key).value; }

    /**
     * Global reactive Signal. For scoped reactivity, use `Context.consume(child).signal()`.
     */
    asSignal(): Signal<T | undefined> { return _globalRec<T>(this.#key).$signal; }

    /**
     * Provide a scoped value rooted at `element`. Descendant consumers will
     * resolve this value (unless a closer ancestor also provides the same key).
     */
    provide(element: Element, value?: T): this
    {
        this.#boundProvider = element;
        const m = _ensureProviderMap(element);
        let rec = m.get(this.#key);
        if (!rec) { rec = _makeRecord<T>() as ProviderRecord<unknown>; m.set(this.#key, rec); }
        if (value !== undefined) {
            const old = rec.value as T | undefined;
            rec.value = value;
            (rec as ProviderRecord<T>).$signal.set(value);
            if (!Object.is(old, value)) _fire(rec as ProviderRecord<T>, this.#key, value, old);
            const g = _globalRec<T>(this.#key);
            g.value = value;
            g.$signal.set(value);
        }
        return this;
    }

    update(value: T, element?: Element): this
    {
        const target = element ?? this.#boundProvider;
        if (target) {
            const m = _ensureProviderMap(target);
            let rec = m.get(this.#key);
            if (!rec) { rec = _makeRecord<T>() as ProviderRecord<unknown>; m.set(this.#key, rec); }
            const old = rec.value as T | undefined;
            if (Object.is(old, value)) return this;
            rec.value = value;
            (rec as ProviderRecord<T>).$signal.set(value);
            _fire(rec as ProviderRecord<T>, this.#key, value, old);
        }
        const g = _globalRec<T>(this.#key);
        const oldG = g.value as T | undefined;
        if (!Object.is(oldG, value)) {
            g.value = value;
            g.$signal.set(value);
            _fire(g as ProviderRecord<T>, this.#key, value, oldG);
        }
        return this;
    }

    destroy(): void
    {
        if (this.#boundProvider) {
            const m = PROVIDER_MAP.get(this.#boundProvider);
            if (m) m.delete(this.#key);
        }
        GLOBAL_RECORDS.delete(this.#key);
    }

    /**
     * Consume a context from a child element's perspective. Walks DOM
     * ancestors to find the nearest provider.
     */
    static consume<T>(key: string, element: Element, opts?: { closest?: boolean }): ConsumerHandle<T>
    {
        const closest = opts?.closest !== false;
        const { provider, rec: scoped } = _findProvider(element, key);
        const rec = (scoped ?? (closest ? null : _globalRec<T>(key))) as ProviderRecord<T> | null;
        const cr: ConsumerRecord<T> = { id: uuid(), element, events: new Map(), provider };
        if (rec) rec.consumers.add(cr);

        const handle: ConsumerHandle<T> = {
            get value() { return rec ? rec.value : undefined; },
            signal()    { return (rec ?? _globalRec<T>(key)).$signal; },
            on(types, cb) {
                types.split(/\s+|,|\|/g).filter(Boolean).forEach(t => {
                    const b = cr.events.get(t) ?? new Set();
                    b.add(cb);
                    cr.events.set(t, b);
                });
                return handle;
            },
            off(type, cb) {
                cr.events.get(type)?.forEach(l => l === cb && cr.events.get(type)!.delete(l));
                return handle;
            },
            detach() { if (rec) rec.consumers.delete(cr); },
        };
        return handle;
    }

    static has(key: string, element?: Element): boolean
    {
        if (element) {
            const { rec } = _findProvider(element, key);
            if (rec) return true;
        }
        return GLOBAL_RECORDS.has(key);
    }

    static keys(): string[] { return Array.from(GLOBAL_RECORDS.keys()); }
}

if (typeof window !== 'undefined')
    Object.defineProperty(window, 'Context', { enumerable: true, configurable: false, writable: false, value: Context });

export default Context;
