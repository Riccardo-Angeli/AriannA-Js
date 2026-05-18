/**
 * @module    core/Observable
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * # AriannA Reactive Core — Unified Engine
 *
 * Single reactive engine based on Proxy + WeakMap dependency graph.
 * Replaces the legacy getter/setter recursion previously used here.
 *
 *   ┌─────────────────────────────────────────────────────────────────────┐
 *   │  reactive(obj)         → returns Proxy with track/trigger semantics  │
 *   │  Observable<T>         → class wrapper, .Value = reactive proxy      │
 *   │  State<T>              → extends Observable, snapshots + history     │
 *   │  signal/effect/computed→ functional primitives, share the dep graph  │
 *   │  deepWatch(obj, cb)    → opt-in subtree observer                     │
 *   │  toRaw / isProxy       → utilities                                   │
 *   └─────────────────────────────────────────────────────────────────────┘
 *
 * # Hierarchy
 *
 *   Observable (base)
 *     └─ State (extends Observable, adds snapshots/history)
 *        └─ Context (decoupled, lives in Context.ts)
 *           └─ Component (consumer, lives in Component.ts)
 *
 * # Identity semantics
 *
 *   effect(() => obs.Value.user)         reruns on user reassignment only
 *   effect(() => obs.Value.user.name)    reruns on name change OR user replace
 *
 * No implicit deep bubbling. Use deepWatch() as explicit opt-in.
 * See REACTIVE-SEMANTICS-SPEC.js for the full contract (16 tests).
 *
 * # API surface preserved from v1
 *
 *   - signal, signalMono, sinkText, sinkClass, effect, computed, batch, untrack, uuid
 *   - Signal, SignalMono, ReadonlySignal, AriannAEvent types
 *   - class Observable with .value (alias of .Value)
 *   - class AriannATemplate (untouched)
 *   - events 'change-before' / 'change-after' / '<key>-change-before' / '<key>-change-after'
 */

// ─────────────────────────────────────────────────────────────────────────────
//  Type definitions (preserved from v1)
// ─────────────────────────────────────────────────────────────────────────────

export interface AriannAEvent
{
    Type: string;
    [k: string]: unknown;
}

export interface ListenerOptions
{
    Passive? : boolean;
    Capture? : boolean;
    Once?    : boolean;
    Signal?  : AbortSignal;
    Phase?   : 'bubble' | 'capture';
}

export interface DomEventTypeDescriptor
{
    Name      : string;
    Interface : abstract new (...a: never[]) => Event;
}

export interface DomEventInterfaceDescriptor
{
    Name  : string;
    Types : Record<string, DomEventTypeDescriptor>;
}

export interface ListenerRecord
{
    Id      : string;
    Type    : string;
    Handler : EventListener;
    Target  : EventTarget;
    Options : ListenerOptions;
}

export interface ChangeEvent extends AriannAEvent
{
    Target : object;
    Path   : (string | symbol)[];
    Key    : string | symbol;
    Old    : unknown;
    New    : unknown;
    Kind   : 'set' | 'delete' | 'mutate';
}


// ─────────────────────────────────────────────────────────────────────────────
//  uuid — small RFC4122-like v4 generator
// ─────────────────────────────────────────────────────────────────────────────

export function uuid(): string
{
    const b: string[] = [];
    for (let i = 0; i < 9; i++)
        b.push((Math.floor(1 + Math.random() * 0x10000)).toString(16).slice(1));
    return `${b[1]}${b[2]}-${b[3]}-${b[4]}-${b[5]}-${b[6]}${b[7]}${b[8]}`;
}


// ═════════════════════════════════════════════════════════════════════════════
//  THE DEPENDENCY GRAPH — single source of truth for reactivity
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Effect: an object that re-runs when any of its tracked dependencies changes.
 * Stored in Set<Effect> bins indexed by (target, key) in DEP_GRAPH.
 */
interface Effect
{
    run(): void;
    deps: Set<Set<Effect>>;
    cleanups: Array<() => void>;
    active: boolean;
}

/**
 * The currently executing effect — set during run(), used by track().
 */
let ACTIVE_EFFECT: Effect | null = null;

/**
 * Batching state — when > 0, triggers queue effects instead of running them.
 */
let BATCH_DEPTH = 0;
const PENDING_EFFECTS = new Set<Effect>();

/**
 * The dependency graph: for each reactive target object, map property keys
 * to the set of effects that depend on that (target, key) pair.
 *
 *   WeakMap< target → Map< key → Set<Effect> > >
 *
 * Using WeakMap on `target` allows the GC to reclaim entries when no other
 * references to the target exist.
 */
const DEP_GRAPH: WeakMap<object, Map<string | symbol, Set<Effect>>> = new WeakMap();

/**
 * Special symbol for tracking iteration deps (Object.keys, for-of, etc.).
 */
const ITERATE_KEY = Symbol('iterate');

/**
 * Register: ACTIVE_EFFECT depends on (target, key).
 * Called by Proxy get traps.
 */
function track(target: object, key: string | symbol): void
{
    if (!ACTIVE_EFFECT) return;
    let m = DEP_GRAPH.get(target);
    if (!m) DEP_GRAPH.set(target, m = new Map());
    let s = m.get(key);
    if (!s) m.set(key, s = new Set());
    if (!s.has(ACTIVE_EFFECT)) {
        s.add(ACTIVE_EFFECT);
        ACTIVE_EFFECT.deps.add(s);
    }
}

/**
 * Trigger: re-run all effects that depend on (target, key).
 * Called by Proxy set/deleteProperty traps and array mutators.
 *
 * When batching: queue effects, flush at batch end.
 * Re-entrancy guard: an effect cannot re-trigger itself within the same call stack.
 */
function trigger(target: object, key: string | symbol): void
{
    const m = DEP_GRAPH.get(target);
    if (!m) return;
    const s = m.get(key);
    if (!s || s.size === 0) return;

    // Snapshot to allow safe iteration even if effects mutate the set
    const toRun = [...s];

    if (BATCH_DEPTH > 0) {
        for (const e of toRun) PENDING_EFFECTS.add(e);
        return;
    }

    for (const e of toRun) {
        if (e === ACTIVE_EFFECT) continue;     // re-entrancy guard
        if (e.active) e.run();
    }
}


// ═════════════════════════════════════════════════════════════════════════════
//  PROXY MACHINERY — reactive() factory
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Cache: raw object → its single Proxy.  Identity stability.
 */
const RAW_TO_PROXY: WeakMap<object, object> = new WeakMap();

/**
 * Cache: Proxy → its raw object.  toRaw() lookup.
 */
const PROXY_TO_RAW: WeakMap<object, object> = new WeakMap();

/**
 * Symbol slot used to detect "is this a proxy?" without triggering get traps.
 */
const PROXY_FLAG = Symbol.for('arianna.proxy');

/**
 * Array methods that mutate without changing length.
 * Their proxy wrapper batches per-index triggers + a final length trigger.
 */
const ARRAY_NO_LENGTH_MUTATORS = new Set<string>(['sort', 'reverse', 'fill', 'copyWithin']);

/**
 * Array methods that mutate AND change length.
 */
const ARRAY_LENGTH_MUTATORS = new Set<string>(['push', 'pop', 'shift', 'unshift', 'splice']);

/**
 * All mutating array methods (union of the above).
 */
const ARRAY_MUTATORS = new Set<string>([...ARRAY_NO_LENGTH_MUTATORS, ...ARRAY_LENGTH_MUTATORS]);

/**
 * Array methods that READ many indices — they must register an ITERATE_KEY dep.
 */
const ARRAY_ITERATORS = new Set<string>([
    'forEach', 'map', 'filter', 'reduce', 'reduceRight',
    'find', 'findIndex', 'findLast', 'findLastIndex',
    'every', 'some', 'includes', 'indexOf', 'lastIndexOf',
    'join', 'concat', 'slice', 'flat', 'flatMap',
    'entries', 'keys', 'values',
]);

/**
 * Per-instance callback used to emit ChangeEvents on the owning Observable.
 * Stored on the raw object via this WeakMap.  Nested objects inherit the
 * root's callback when wrapped (see reactive()).
 */
const TARGET_EMIT: WeakMap<object, (e: ChangeEvent) => void> = new WeakMap();

/**
 * Determines if a value is wrappable.  Primitives and special builtins are not.
 */
function _isReactiveTarget(v: unknown): v is object
{
    if (v === null || typeof v !== 'object') return false;
    if (v instanceof Date)     return false;
    if (v instanceof RegExp)   return false;
    if (v instanceof Promise)  return false;
    if (v instanceof Node)     return false;   // DOM nodes never wrapped
    if (v instanceof Error)    return false;
    return true;
}

/**
 * Emit a ChangeEvent on the Observable that owns this raw target (if any).
 * Direct lookup: TARGET_EMIT is propagated to nested objects when they get
 * wrapped (see reactive() below).
 */
function _emitChange(
    target  : object,
    path    : (string | symbol)[],
    key     : string | symbol,
    old     : unknown,
    nw      : unknown,
    kind    : 'set' | 'delete' | 'mutate',
): void
{
    const emit = TARGET_EMIT.get(target);
    if (!emit) return;

    const ev: ChangeEvent = {
        Type   : '',
        Target : target,
        Path   : path,
        Key    : key,
        Old    : old,
        New    : nw,
        Kind   : kind,
    };
    const k = String(key);
    ev.Type = `${k}-change-before`;  emit(ev);
    ev.Type = 'change-before';        emit(ev);
    ev.Type = `${k}-change-after`;    emit(ev);
    ev.Type = 'change-after';         emit(ev);
}


/**
 * Common ProxyHandler builder.  Returns a handler tailored to whether the
 * raw target is an Array, Map, Set, or plain object.
 */
function _buildHandler(
    rawRoot : object,
    path    : (string | symbol)[],
): ProxyHandler<object>
{
    return {
        get(target, key, receiver) {
            // PROXY_FLAG probe — quick "is this a proxy?" check without triggering
            if (key === PROXY_FLAG) return true;

            // Array mutator methods get a special wrapper
            if (Array.isArray(target) && typeof key === 'string' && ARRAY_MUTATORS.has(key)) {
                return _arrayMutatorWrapper(target, key, path);
            }

            // Array iterator methods register an ITERATE_KEY dep
            if (Array.isArray(target) && typeof key === 'string' && ARRAY_ITERATORS.has(key)) {
                track(target, 'length');
                track(target, ITERATE_KEY);
                const fn = Reflect.get(target, key, receiver);
                return typeof fn === 'function' ? fn.bind(receiver) : fn;
            }

            const result = Reflect.get(target, key, receiver);

            // Skip tracking for symbol keys we don't care about (Symbol.iterator etc.)
            // — but DO track string keys and numeric-string array indices.
            if (typeof key === 'symbol' && key !== ITERATE_KEY) {
                return result;
            }

            track(target, key);

            // Recursively wrap nested objects on access (lazy)
            if (_isReactiveTarget(result)) {
                return reactive(result, [...path, key], rawRoot);
            }
            return result;
        },

        set(target, key, value, receiver) {
            const old = Reflect.get(target, key, receiver);
            // Unwrap value if it's a proxy — we never store proxies in raws
            const rawValue = isProxy(value) ? toRaw(value as object) : value;

            if (Object.is(old, rawValue)) return true;

            const had = Array.isArray(target) ? (Number(key) < target.length) : Object.prototype.hasOwnProperty.call(target, key);
            const lengthBefore = Array.isArray(target) ? target.length : -1;

            const ok = Reflect.set(target, key, rawValue, receiver);
            if (!ok) return false;

            const lengthAfter = Array.isArray(target) ? target.length : -1;

            // Trigger the specific key
            trigger(target, key);

            // If this is an array index assignment that extended length
            if (Array.isArray(target) && lengthAfter !== lengthBefore) {
                trigger(target, 'length');
            }

            // If we ADDED a new key on a plain object, iteration deps must re-run
            if (!had && !Array.isArray(target)) {
                trigger(target, ITERATE_KEY);
            }

            _emitChange(target, path, key, old, rawValue, 'set');
            return true;
        },

        deleteProperty(target, key) {
            const had = Object.prototype.hasOwnProperty.call(target, key);
            const old = (target as Record<string | symbol, unknown>)[key];
            const ok  = Reflect.deleteProperty(target, key);
            if (!ok || !had) return ok;

            trigger(target, key);
            if (!Array.isArray(target)) trigger(target, ITERATE_KEY);

            _emitChange(target, path, key, old, undefined, 'delete');
            return true;
        },

        has(target, key) {
            const ok = Reflect.has(target, key);
            if (typeof key !== 'symbol' || key === ITERATE_KEY) track(target, key);
            return ok;
        },

        ownKeys(target) {
            track(target, ITERATE_KEY);
            return Reflect.ownKeys(target);
        },
    };
}


/**
 * Array mutator wrapper: when arr.push/pop/splice/sort/etc. is called,
 * batch the triggers so effects re-run once per call.
 */
function _arrayMutatorWrapper(
    target : unknown[],
    method : string,
    path   : (string | symbol)[],
): (...args: unknown[]) => unknown
{
    return function (this: unknown, ...args: unknown[]) {
        const lengthBefore = target.length;
        const before = target.slice();
        // Unwrap any proxy args before passing to native method
        const rawArgs = args.map(a => isProxy(a) ? toRaw(a as object) : a);

        let result: unknown;

        BATCH_DEPTH++;
        try {
            const fn = (target as unknown as Record<string, (...a: unknown[]) => unknown>)[method];
            result = fn.apply(target, rawArgs);

            // Figure out which indices changed
            const lengthAfter = target.length;
            const len = Math.max(lengthBefore, lengthAfter);

            for (let i = 0; i < len; i++) {
                if (!Object.is(before[i], target[i])) {
                    trigger(target, String(i));
                }
            }
            if (lengthBefore !== lengthAfter && !ARRAY_NO_LENGTH_MUTATORS.has(method)) {
                trigger(target, 'length');
            }
            trigger(target, ITERATE_KEY);

            _emitChange(target, path, method, before, target.slice(), 'mutate');
        } finally {
            BATCH_DEPTH--;
            if (BATCH_DEPTH === 0) _flushPending();
        }

        return result;
    };
}


// ─────────────────────────────────────────────────────────────────────────────
//  reactive() — public factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wrap `obj` in a reactive Proxy.  Returns the same proxy on subsequent calls
 * with the same raw object (identity stability).
 *
 * Primitives, Date, RegExp, Promise, DOM nodes, and Errors are returned as-is.
 *
 * @example
 *   const s = reactive({ a: 1 })
 *   effect(() => console.log(s.a))   // logs 1
 *   s.a = 2                           // logs 2
 *
 * @example
 *   const arr = reactive(['a','b'])
 *   effect(() => console.log(arr.length))  // logs 2
 *   arr.push('c')                           // logs 3
 */
export function reactive<T extends object>(raw: T, path: (string | symbol)[] = [], inheritEmit?: object): T
{
    if (!_isReactiveTarget(raw)) return raw;
    if (isProxy(raw)) return raw;  // already a proxy, return as-is

    const cached = RAW_TO_PROXY.get(raw);
    if (cached) return cached as T;

    const handler = _buildHandler(raw, path);
    const proxy   = new Proxy(raw, handler);

    RAW_TO_PROXY.set(raw, proxy);
    PROXY_TO_RAW.set(proxy, raw);

    // Inherit the emit callback from the root (so deep mutations bubble events
    // to the owning Observable, but NOT through the dep graph — only events).
    if (inheritEmit) {
        const rootEmit = TARGET_EMIT.get(inheritEmit);
        if (rootEmit && !TARGET_EMIT.has(raw)) TARGET_EMIT.set(raw, rootEmit);
    }

    return proxy as T;
}


/**
 * Returns the raw object backing a proxy.  Idempotent on non-proxies.
 *
 * @example
 *   const raw = { a: 1 }
 *   const obs = new Observable(raw)
 *   assert(toRaw(obs.Value) === raw)
 */
export function toRaw<T>(value: T): T
{
    if (value === null || typeof value !== 'object') return value;
    const raw = PROXY_TO_RAW.get(value as object);
    return (raw ?? value) as T;
}


/**
 * Boolean check: is this value a reactive proxy?
 */
export function isProxy(value: unknown): boolean
{
    if (value === null || typeof value !== 'object') return false;
    try { return (value as Record<symbol, unknown>)[PROXY_FLAG] === true; }
    catch { return false; }
}


// ═════════════════════════════════════════════════════════════════════════════
//  signal / signalMono / effect / computed / batch / untrack
// ═════════════════════════════════════════════════════════════════════════════

export interface Signal<T>
{
    get(): T;
    set(v: T): void;
    peek(): T;
    readonly(): ReadonlySignal<T>;
}
export interface ReadonlySignal<T>
{
    get(): T;
    peek(): T;
}

/**
 * Atomic value cell.  Multiple effects can subscribe.
 */
export function signal<T>(value: T): Signal<T>
{
    const subs = new Set<Effect>();
    const holder = {};   // weak target for trigger() — gives us per-signal keying

    const wrapped = {
        get(): T {
            if (ACTIVE_EFFECT && !subs.has(ACTIVE_EFFECT)) {
                subs.add(ACTIVE_EFFECT);
                ACTIVE_EFFECT.deps.add(subs);
            }
            return value;
        },
        set(v: T): void {
            if (Object.is(v, value)) return;
            value = v;
            // Trigger all subscribers
            const toRun = [...subs];
            if (BATCH_DEPTH > 0) {
                for (const e of toRun) PENDING_EFFECTS.add(e);
                return;
            }
            for (const e of toRun) {
                if (e === ACTIVE_EFFECT) continue;
                if (e.active) e.run();
            }
        },
        peek(): T { return value; },
        readonly(): ReadonlySignal<T> {
            return {
                get : () => wrapped.get(),
                peek: () => value,
            };
        },
    };
    return wrapped;
}


/**
 * Single-slot signal optimised for 1:1 TextNode binding.
 * Zero Set allocations.  Used by compiled templates.
 */
export interface SignalMono<T>
{
    get(): T;
    set(v: T): void;
    peek(): T;
    _sub: (() => void) | null;
}

export function signalMono<T>(value: T): SignalMono<T>
{
    const s: SignalMono<T> = {
        _sub : null,
        get(): T  { return value; },
        set(v: T) { if (!Object.is(v, value)) { value = v; s._sub?.(); } },
        peek(): T { return value; },
    };
    return s;
}


/**
 * Bind a SignalMono to a TextNode — node.nodeValue is updated on signal change.
 */
export function sinkText(s: SignalMono<string>, node: Text): void
{
    node.nodeValue = s.peek();
    s._sub = () => { node.nodeValue = s.peek(); };
}


/**
 * Bind a getter to a class toggle on an Element.  Returns an updater fn.
 */
export function sinkClass(el: Element, cls: string, getter: () => boolean): () => void
{
    const update = () => { if (getter()) el.classList.add(cls); else el.classList.remove(cls); };
    update();
    return update;
}


/**
 * Run fn now and re-run whenever any of its tracked dependencies change.
 * Returns a stop function that detaches the effect from all deps.
 *
 * The fn may receive an `onCleanup` argument — register a cleanup callback
 * to run BEFORE the next re-run and on stop().
 *
 * @example
 *   const stop = effect(onCleanup => {
 *       const timer = setInterval(...)
 *       onCleanup(() => clearInterval(timer))
 *   })
 */
export function effect(fn: (onCleanup?: (cb: () => void) => void) => void): () => void
{
    const runner: Effect = {
        active   : true,
        deps     : new Set(),
        cleanups : [],
        run() {
            if (!runner.active) return;
            // Run pending cleanups from the previous run
            for (const c of runner.cleanups) { try { c(); } catch (e) { console.warn('[effect cleanup]', e); } }
            runner.cleanups.length = 0;

            // Clear stale deps
            for (const d of runner.deps) d.delete(runner);
            runner.deps.clear();

            const prev = ACTIVE_EFFECT;
            ACTIVE_EFFECT = runner;
            try {
                fn(cb => runner.cleanups.push(cb));
            } finally {
                ACTIVE_EFFECT = prev;
            }
        },
    };
    runner.run();
    return () => {
        runner.active = false;
        for (const c of runner.cleanups) { try { c(); } catch { /* ignore */ } }
        runner.cleanups.length = 0;
        for (const d of runner.deps) d.delete(runner);
        runner.deps.clear();
    };
}


/**
 * Lazy + cached derived signal.  Recomputes when any read dep changes.
 * Downstream effects only re-run when the computed VALUE changes (short-circuit).
 *
 * @example
 *   const a = signal(1)
 *   const dbl = computed(() => a.get() * 2)
 *   effect(() => console.log(dbl.get()))   // 2
 *   a.set(5)                                // 10
 */
export function computed<T>(fn: () => T): ReadonlySignal<T>
{
    const s = signal<T>(undefined as T);
    effect(() => {
        const v = fn();
        // s.set is a no-op when Object.is(old, new) — short-circuits downstream
        s.set(v);
    });
    return s.readonly();
}


/**
 * Run fn.  All triggers inside fn are queued and flushed once at the end,
 * so each unique effect re-runs at most once.
 */
export function batch(fn: () => void): void
{
    BATCH_DEPTH++;
    try { fn(); }
    finally {
        BATCH_DEPTH--;
        if (BATCH_DEPTH === 0) _flushPending();
    }
}

function _flushPending(): void
{
    if (PENDING_EFFECTS.size === 0) return;
    const toRun = [...PENDING_EFFECTS];
    PENDING_EFFECTS.clear();
    for (const e of toRun) {
        if (e === ACTIVE_EFFECT) continue;
        if (e.active) e.run();
    }
}


/**
 * Run fn without tracking reads as deps of the active effect.
 *
 * @example
 *   effect(() => {
 *       const u = untrack(() => state.Value.user)   // no dep on user
 *       console.log(state.Value.user.name)           // dep on user.name
 *   })
 */
export function untrack<T>(fn: () => T): T
{
    const prev = ACTIVE_EFFECT;
    ACTIVE_EFFECT = null;
    try { return fn(); } finally { ACTIVE_EFFECT = prev; }
}


// ═════════════════════════════════════════════════════════════════════════════
//  deepWatch — opt-in subtree observer
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Watch ALL mutations inside an object subtree.  Returns a stop function.
 *
 * WARNING: expensive.  Use for persistence/logging/devtools, NOT rendering.
 *
 * @param target  reactive proxy (or raw — will be wrapped)
 * @param cb      called as (path, oldValue, newValue) on every mutation
 *
 * @example
 *   const obs = new Observable({ user: { name: 'Anna', age: 30 } })
 *   const stop = deepWatch(obs.Value.user, (path, old, neu) => {
 *       console.log(path.join('.'), old, '→', neu)
 *   })
 *   obs.Value.user.name = 'Bea'   // logs: name Anna → Bea
 *   stop()                         // detach
 */
export function deepWatch<T extends object>(
    target : T,
    cb     : (path: (string | symbol)[], oldVal: unknown, newVal: unknown) => void,
): () => void
{
    const raw = toRaw(target) as object;
    let active = true;

    // Subscribe via the emit channel — every mutation emits change-after.
    // We hook a temporary emit relay onto the raw's chain.
    const existing = TARGET_EMIT.get(raw);
    const relay = (e: ChangeEvent) => {
        if (!active) return;
        // Forward existing listeners
        if (existing) existing(e);
        // Only fire user cb once per mutation (use 'change-after' as the canonical pass)
        if (e.Type === 'change-after') {
            cb([...e.Path, e.Key], e.Old, e.New);
        }
    };
    TARGET_EMIT.set(raw, relay);

    return () => {
        active = false;
        if (existing) TARGET_EMIT.set(raw, existing);
        else          TARGET_EMIT.delete(raw);
    };
}


// ═════════════════════════════════════════════════════════════════════════════
//  AriannATemplate — HTMLTemplateElement engine (preserved untouched)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * AriannATemplate — clone-based template engine, zero JSX, zero runtime parser.
 *
 *   1. new AriannATemplate(html) → browser parses HTML once into <template>.content
 *   2. tpl.clone()                → cloneNode O(1), C++ native, zero JS parsing
 *   3. tpl.walk(el, [0,0])        → O(1) descend via childNodes[i] chain
 *
 * Equivalent to Vue's hoisted vnodes or Solid's compiled templates, but with
 * an explicit walk API instead of compiler-generated refs.
 *
 * @example
 *   const tpl = new AriannATemplate(
 *     '<tr data-id=""><td class="col-md-1"></td>' +
 *     '<td class="col-md-4"><a class="lbl"></a></td>' +
 *     '<td class="col-md-6"></td></tr>'
 *   );
 *   const tr       = tpl.clone() as HTMLTableRowElement;
 *   const idTxt    = tpl.walk(tr, [0, 0]) as Text;
 *   const labelTxt = tpl.walk(tr, [1, 0, 0]) as Text;
 *   const $label = signalMono('hello'); sinkText($label, labelTxt);
 */
export class AriannATemplate
{
    readonly #tpl: HTMLTemplateElement;

    constructor(html: string)
    {
        this.#tpl           = document.createElement('template');
        this.#tpl.innerHTML = html;
    }

    /** Clone the first root element of the template — O(1) in C++. */
    clone(): Element
    {
        return this.#tpl.content.firstElementChild!.cloneNode(true) as Element;
    }

    /** Clone the entire content as a DocumentFragment (multi-root templates). */
    cloneAll(): DocumentFragment
    {
        return this.#tpl.content.cloneNode(true) as DocumentFragment;
    }

    /** O(1) descent via childNodes index path.  Avoids querySelector. */
    walk(root: Node, path: number[]): Node
    {
        let n: Node = root;
        for (const i of path) n = n.childNodes[i];
        return n;
    }

    /** Batch walk — descend to multiple nodes in one call. */
    walkAll(root: Node, ...paths: number[][]): Node[]
    {
        return paths.map(p => this.walk(root, p));
    }
}


// ═════════════════════════════════════════════════════════════════════════════
//  Observable<T> class — evented reactive wrapper
// ═════════════════════════════════════════════════════════════════════════════

export interface ObservableOptions
{
    /** When true, mutations are recorded into a history stack for undo(). */
    history?: boolean;
    /** Maximum history entries kept (default 100). */
    historyLimit?: number;
}

interface InstanceListener
{
    Id      : string;
    Handler : (e: ChangeEvent) => void;
    Target  : object;
    Once?   : boolean;
}

/**
 * Observable<T> — base reactive wrapper.  Adds event listener API on top of
 * the dep graph.  The reactive Proxy is exposed via .Value (preferred) or
 * .value (deprecated alias).
 *
 * Mutations through .Value trigger:
 *   - effect() reruns via the dep graph
 *   - 'change-before' / 'change-after' / '<key>-change-before' / '<key>-change-after' events
 *
 * Mutating the raw object directly does NOT trigger.
 *
 * @example
 *   const obs = new Observable({ items: ['a', 'b'] })
 *   obs.on('change-after', e => console.log(e.Path, e.Old, '→', e.New))
 *   obs.Value.items.push('c')   // triggers and emits change-after
 */
export class Observable<T extends object = object>
{
    readonly #listeners : Map<string, Set<InstanceListener>> = new Map();
    readonly #raw       : T;
    readonly #proxy     : T;
    readonly #opts      : ObservableOptions;
    readonly #history   : Array<{ key: string | symbol; old: unknown; nw: unknown; ts: number }> = [];

    constructor(source: T, options: ObservableOptions = {})
    {
        if (source === undefined || source === null || typeof source !== 'object')
            throw new TypeError('Observable requires an object source.');

        this.#opts = options;
        this.#raw  = source;

        // Register the emit callback BEFORE wrapping, so nested children
        // wrapped via reactive() can inherit it during their lazy access.
        TARGET_EMIT.set(source, (e: ChangeEvent) => this.#dispatch(e));

        this.#proxy = reactive(source);
    }

    /** The reactive Proxy.  All mutations through this trigger reactivity. */
    get Value(): T { return this.#proxy; }

    /** @deprecated  Use .Value instead.  Kept for backward compatibility. */
    get value(): T { return this.#proxy; }

    /** The raw, unwrapped object.  Mutations through this are INVISIBLE. */
    get raw(): T { return this.#raw; }

    /** Read-only history (only populated if options.history === true). */
    get history(): ReadonlyArray<{ key: string | symbol; old: unknown; nw: unknown; ts: number }>
    { return this.#history; }

    /** Register an event listener.  Types space/comma/pipe separated. */
    on(types: string, cb: (e: ChangeEvent) => void): this
    {
        const ls: InstanceListener = { Id: uuid(), Handler: cb, Target: this };
        types.split(/[\s,|]+/g).filter(Boolean).forEach(t => {
            const b = this.#listeners.get(t) ?? new Set<InstanceListener>();
            b.add(ls); this.#listeners.set(t, b);
        });
        return this;
    }

    /** Remove an event listener by callback ref. */
    off(type: string, cb: (e: ChangeEvent) => void): this
    {
        const bucket = this.#listeners.get(type);
        if (bucket) for (const l of bucket) if (l.Handler === cb) bucket.delete(l);
        return this;
    }

    /**
     * Manually fire an event.  Two signatures supported:
     *
     *   fire(type: string, detail?: Partial<ChangeEvent>)
     *   fire(event: AriannAEvent)   // legacy: pass full event object with .Type
     */
    fire(typeOrEvent: string | AriannAEvent, detail: Partial<ChangeEvent> = {}): this
    {
        let ev: ChangeEvent;
        if (typeof typeOrEvent === 'string') {
            ev = {
                Type   : typeOrEvent,
                Target : this.#raw,
                Path   : detail.Path ?? [],
                Key    : detail.Key  ?? '',
                Old    : detail.Old  ?? undefined,
                New    : detail.New  ?? undefined,
                Kind   : detail.Kind ?? 'set',
            };
        } else {
            // Legacy single-arg call: take type from object, copy rest
            const e = typeOrEvent as Record<string, unknown>;
            ev = {
                Type   : String(e.Type ?? ''),
                Target : (e.Target as object) ?? this.#raw,
                Path   : (e.Path as (string|symbol)[]) ?? [],
                Key    : (e.Key as string | symbol) ?? '',
                Old    : e.Old,
                New    : e.New,
                Kind   : (e.Kind as 'set'|'delete'|'mutate') ?? 'set',
                ...e,   // copy any extra fields (Sheet, Detail, etc.)
            };
        }
        this.#dispatch(ev);
        return this;
    }

    #dispatch(e: ChangeEvent): void
    {
        const bucket = this.#listeners.get(e.Type);
        if (!bucket) return;
        for (const l of [...bucket]) {
            try { l.Handler.call(l.Target, e); }
            catch (err) { console.warn('[Observable listener]', err); }
            if (l.Once) bucket.delete(l);
        }
        // History recording (only on canonical 'change-after')
        if (this.#opts.history && e.Type === 'change-after') {
            this.#history.push({ key: e.Key, old: e.Old, nw: e.New, ts: Date.now() });
            const limit = this.#opts.historyLimit ?? 100;
            if (this.#history.length > limit) this.#history.splice(0, this.#history.length - limit);
        }
    }
}


// ═════════════════════════════════════════════════════════════════════════════
//  Module side-effects + default export
// ═════════════════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Observable', {
        enumerable: true, configurable: false, writable: false, value: Observable,
    });
}

export default Observable;
