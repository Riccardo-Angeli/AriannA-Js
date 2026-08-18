/**
 * @module    core/Reactive
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * # AriannA Reactivity — Fine-Grained Universal Runtime
 *
 * One graph, one ownership model and one event surface for every reactive form:
 *
 *   - Signal / Memo / Effect / Watch / Reaction
 *   - deep, shallow and readonly Proxy state
 *   - Array, Map and Set structural tracking
 *   - batching, transactions and rollback
 *   - synchronous, microtask, animation-frame and idle scheduling
 *   - roots, scopes, cleanup, pause/resume and deterministic disposal
 *   - async Resources with cancellation, stale-result protection and refetch
 *   - selectors, deferred values, external producers and DOM sinks
 *   - Reactive<T>, the evented object facade using Events as the event SoT
 *
 * Reactivity owns dependency propagation only. Listener storage, dispatch rules,
 * phases and DOM mirroring belong to Core.Events through the `events` service.
 */

import { Core }   from './Core.ts';
import { Events } from './Events.ts';

import type { Types as SchemaTypes }           from './schema/Types.ts';
import type { Interfaces as SchemaInterfaces } from './schema/Interfaces.ts';

/** @name        Reactivity
 *  @public
 *  @type        {namespace}
 *  @description Groups the Reactivity contracts and runtime surface.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Reactivity
{
    /** @name        Key
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Key.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Key                            = SchemaTypes.Reactivity.Key;
    /** @name        Path
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Path.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Path                           = SchemaTypes.Reactivity.Path;
    /** @name        ChangeKind
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ChangeKind.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ChangeKind                     = SchemaTypes.Reactivity.ChangeKind;

    /** @name        CollectionOperation
     *  @public
     *  @type        {type alias}
     *  @description Semantic collection operations emitted through Core.Events. Low-level Proxy traps remain
     *               responsible for dependency tracking; this vocabulary describes the author-visible mutation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type CollectionOperation =
        'set' | 'add' | 'delete' | 'clear' | 'update' |
        'push' | 'pop' | 'shift' | 'unshift' | 'splice' |
        'sort' | 'reverse' | 'fill' | 'copyWithin' | 'truncate';

    /** @name        CollectionChangeEvent
     *  @public
     *  @type        {interface}
     *  @description Canonical semantic collection mutation transported by the registered AriannA
     *               CollectionChanging / CollectionChanged events.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface CollectionChangeEvent
    {
        Type         : 'CollectionChanging' | 'CollectionChanged';
        Target       : object;
        Root         : object;
        Path         : Path;
        Collection   : 'Array' | 'Map' | 'Set';
        Operation    : CollectionOperation;
        Key?         : Key;
        Index?       : number;
        DeleteCount? : number;
        Added        : unknown[];
        Removed      : unknown[];
        Args         : unknown[];
        LengthBefore?: number;
        LengthAfter? : number;
        Version      : number;
        Timestamp    : number;
    }

    /** @name        Schedule
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Schedule.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Schedule                       = SchemaTypes.Reactivity.Schedule;
    /** @name        Equality
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Equality.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Equality<T>                    = SchemaTypes.Reactivity.Equality<T>;
    /** @name        Cleanup
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Cleanup.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Cleanup                        = SchemaTypes.Reactivity.Cleanup;
    /** @name        Stop
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Stop.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Stop                           = SchemaTypes.Reactivity.Stop;
    /** @name        WatchHandler
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for WatchHandler.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type WatchHandler<T>                = SchemaTypes.Reactivity.WatchHandler<T>;
    /** @name        ResourceState
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ResourceState.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ResourceState                  = SchemaTypes.Reactivity.ResourceState;
    /** @name        ResourceFetcher
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ResourceFetcher.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ResourceFetcher<T, S = unknown> = SchemaTypes.Reactivity.ResourceFetcher<T, S>;
    /** @name        ChangeEvent
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ChangeEvent.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ChangeEvent                    = SchemaInterfaces.Reactivity.ChangeEvent;
    /** @name        SignalOptions
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for SignalOptions.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type SignalOptions<T>               = SchemaInterfaces.Reactivity.SignalOptions<T>;
    /** @name        EffectOptions
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for EffectOptions.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type EffectOptions                  = SchemaInterfaces.Reactivity.EffectOptions;
    /** @name        WatchOptions
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for WatchOptions.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type WatchOptions<T>                = SchemaInterfaces.Reactivity.WatchOptions<T>;
    /** @name        ReactiveOptions
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ReactiveOptions.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ReactiveOptions                = SchemaInterfaces.Reactivity.ReactiveOptions;
    /** @name        ResourceOptions
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ResourceOptions.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ResourceOptions<T>             = SchemaInterfaces.Reactivity.ResourceOptions<T>;
    /** @name        SignalContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for SignalContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type SignalContract<T>              = SchemaInterfaces.Reactivity.Signal<T>;
    /** @name        ReadonlySignalContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ReadonlySignalContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ReadonlySignalContract<T>      = SchemaInterfaces.Reactivity.ReadonlySignal<T>;
    /** @name        MemoContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for MemoContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type MemoContract<T>                = SchemaInterfaces.Reactivity.Memo<T>;
    /** @name        ResourceContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ResourceContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ResourceContract<T, S = unknown> = SchemaInterfaces.Reactivity.Resource<T, S>;
    /** @name        SelectorContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for SelectorContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type SelectorContract<T, K = T>     = SchemaInterfaces.Reactivity.Selector<T, K>;
    /** @name        ReactionContract
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ReactionContract.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ReactionContract               = SchemaInterfaces.Reactivity.Reaction;
    /** @name        Snapshot
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Snapshot.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Snapshot                       = SchemaInterfaces.Reactivity.Snapshot;
    /** @name        Subscriber
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Subscriber.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Subscriber                     = SchemaInterfaces.Reactivity.Computation;
    /** @name        Dependency
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Dependency.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Dependency                     = SchemaTypes.Reactivity.Dependency;
    /** @name        Owner
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Owner.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Owner                          = SchemaInterfaces.Reactivity.Owner;
    /** @name        Computation
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Computation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Computation                    = SchemaInterfaces.Reactivity.Computation;
    /** @name        ProxyMeta
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for ProxyMeta.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type ProxyMeta                      = SchemaInterfaces.Reactivity.ProxyMeta;
    /** @name        TransactionEntry
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for TransactionEntry.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type TransactionEntry               = SchemaInterfaces.Reactivity.TransactionEntry;

    /** Shared dependency primitive used identically by scalar Signals and Proxy slots.
     *  The overwhelmingly common case is one subscriber, so storage is a compact array:
     *  no Set allocation, no Set iterator and no `.values().next()` in the hot path. */
    class Source implements SchemaInterfaces.Reactivity.SignalSource
    {
        private readonly Subscribers: Computation[] = [];

        Subscribe(subscriber: Computation): void
        {
            const subscribers = this.Subscribers;
            if(subscribers.length === 0)
            {
                subscribers.push(subscriber);
                return;
            }

            if(subscribers.length === 1)
            {
                if(subscribers[0] !== subscriber) subscribers.push(subscriber);
                return;
            }

            if(subscribers.indexOf(subscriber) < 0) subscribers.push(subscriber);
        }

        Unsubscribe(subscriber: Computation): void
        {
            const subscribers = this.Subscribers;
            if(subscribers.length === 0) return;

            if(subscribers.length === 1)
            {
                if(subscribers[0] === subscriber) subscribers.length = 0;
                return;
            }

            const index = subscribers.indexOf(subscriber);
            if(index >= 0)
            {
                const last = subscribers.length - 1;
                if(index !== last) subscribers[index] = subscribers[last];
                subscribers.pop();
            }
        }

        Has(subscriber: Computation): boolean
        {
            const subscribers = this.Subscribers;
            return subscribers.length === 1
                ? subscribers[0] === subscriber
                : subscribers.indexOf(subscriber) >= 0;
        }

        get Size(): number { return this.Subscribers.length; }

        Each(callback: (subscriber: Computation) => void): void
        {
            const subscribers = this.Subscribers;
            for(let index = 0; index < subscribers.length; index++)
                callback(subscribers[index]);
        }

        Notify(): void
        {
            const subscribers = this.Subscribers;
            const length = subscribers.length;

            if(length === 0) return;
            if(length === 1)
            {
                subscribers[0].Notify();
                return;
            }

            // A synchronous computation may detach/re-subscribe while it runs.
            // Snapshot only for real fan-out; the normal one-subscriber path allocates nothing.
            const snapshot = subscribers.slice();
            for(let index = 0; index < snapshot.length; index++)
                snapshot[index].Notify();
        }
    }

    const Graph = new WeakMap<object, Map<Key, Source>>();
    /** @name        RawToProxy
     *  @private
     *  @type        {WeakMap<object, Map<string, object>>}
     *  @description Mode-aware proxy cache. A raw value may legitimately have distinct deep, shallow,
     *               readonly and shallow-readonly facades; sharing one proxy across those modes breaks
     *               readonly guarantees and nested wrapping semantics.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    const RawToProxy = new WeakMap<object, Map<string, object>>();
    const ProxyToRaw = new WeakMap<object, object>();
    const ProxyMetadata = new WeakMap<object, ProxyMeta>();
    const MarkedRaw = new WeakSet<object>();
    /*
     * Signal dependency nodes must never be strongly retained by diagnostics.
     * Graph is already a WeakMap; keeping the same nodes in a Set defeated that
     * design and made every signal created by an application immortal.
     */
    const SignalNodes = new WeakSet<object>();
    const Computations = new Set<Computation>();
    let SignalSequence = 0;

    const IterateKey = Symbol('AriannA.Reactivity.Iterate');
    const MapKeyIterateKey = Symbol('AriannA.Reactivity.MapKeys');
    const ProxyFlag = Symbol.for('arianna.reactive');
    const RawFlag = Symbol.for('arianna.raw');

    let Active: Computation | null = null;
    let CurrentOwner: Owner | null = null;
    let Tracking = true;
    let BatchDepth = 0;
    let Version = 0;
    let Sequence = 0;
    let TransactionDepth = 0;
    let RollingBack = false;

    const Pending = new Set<Computation>();
    const Microtasks = new Set<Computation>();
    const Frames = new Set<Computation>();
    const Idles = new Set<Computation>();
    const TransactionLog: TransactionEntry[] = [];
    let TransactionSeen = new WeakMap<object, Set<Key>>();

    let MicrotaskPending = false;
    let FramePending = false;
    let IdlePending = false;

    // ═════════════════════════════════════════════════════════════════════════
    //  SHARED HELPERS
    // ═════════════════════════════════════════════════════════════════════════

    const Equal = <T>(equals: Equality<T> | undefined, previous: T, next: T): boolean =>
        equals === false ? false : (equals ?? Object.is)(previous, next);

    const IsObject = (value: unknown): value is object =>
        value !== null && (typeof value === 'object' || typeof value === 'function');

    const IsIntegerKey = (key: Key): boolean =>
        typeof key === 'string' && key !== 'NaN' && key[0] !== '-' && String(parseInt(key, 10)) === key;

    const IsWrappable = (value: unknown): value is object =>
    {
        if(!IsObject(value) || MarkedRaw.has(value)) return false;
        if(typeof Node !== 'undefined' && value instanceof Node) return false;
        if(value instanceof Date || value instanceof RegExp || value instanceof Promise || value instanceof Error) return false;
        if(value instanceof WeakMap || value instanceof WeakSet || value instanceof ArrayBuffer) return false;
        return true;
    };

    const ProxyMode = (meta: ProxyMeta): string =>
        meta.Readonly
            ? (meta.Shallow ? 'readonly:shallow' : 'readonly:deep')
            : (meta.Shallow ? 'mutable:shallow' : 'mutable:deep');

    const GetEvents = () => Core.Services.Resolve<
        {
            Fire(target: unknown, event: { Type: string; Detail?: unknown; Cancelable?: boolean }): boolean;
            On(target: unknown, types: string, handler: EventListener, options?: AddEventListenerOptions): unknown[];
            Off(target: unknown, types: string, handler: EventListener): void;
        }>('events');

    const CollectionTarget = 'arianna-collection';

    let CollectionMutationDepth = 0;

    /** Shared empty collection payload. Consumers must treat collection event arrays as readonly. */
    const EmptyCollectionValues: readonly unknown[] = Object.freeze([] as unknown[]);

    function EmitCollection
    (
        meta      : ProxyMeta,
        target    : object,
        phase     : 'CollectionChanging' | 'CollectionChanged',
        collection: 'Array' | 'Map' | 'Set',
        operation : CollectionOperation,
        fields    : Partial<CollectionChangeEvent> = {}
    ): void
    {
        // Do not build collection event payloads for an unobserved phase. Template listens
        // to CollectionChanged, while CollectionChanging remains available to applications
        // that explicitly register for it. This preserves semantics and removes the normal
        // pre-mutation event allocation/dispatch cost completely when unused.
        if(!Events.Event.Has(phase)) return;

        const detail: CollectionChangeEvent =
        {
            Type         : phase,
            Target       : target,
            Root         : meta.Root,
            Path         : fields.Path ?? meta.Path,
            Collection   : collection,
            Operation    : operation,
            Added        : (fields.Added ?? EmptyCollectionValues) as unknown[],
            Removed      : (fields.Removed ?? EmptyCollectionValues) as unknown[],
            Args         : (fields.Args ?? EmptyCollectionValues) as unknown[],
            Version,
            Timestamp    : Date.now(),
            Key          : fields.Key,
            Index        : fields.Index,
            DeleteCount  : fields.DeleteCount,
            LengthBefore : fields.LengthBefore,
            LengthAfter  : fields.LengthAfter,
        };

        Events.Event.Fire
        (
            Events.CollectionTarget,
            {
                Type       : phase,
                Detail     : detail as unknown as Record<string, unknown>,
                Cancelable : false
            }
        );
    }

    function Warn(code: string, error: unknown): void
    {
        const core = Core as unknown as { warn?: (code: string, ...args: unknown[]) => void };
        if(typeof core.warn === 'function') core.warn(code, error);
        else if(Core.AriannA.Configuration?.debug) console.warn(`[arianna:${code}]`, error);
    }

    function CleanupOwner(owner: Owner): void
    {
        const count = owner.Cleanups.length;
        if(count === 0) return;

        const cleanups = owner.Cleanups.splice(0, count);
        for(let index = 0; index < cleanups.length; index++)
        {
            try { cleanups[index](); }
            catch(error) { Warn('reactivity-cleanup', error); }
        }
    }

    function DisposeOwner(owner: Owner): void
    {
        if(owner.Disposed) return;
        owner.Disposed = true;
        for(const child of [...owner.Owned]) child.Dispose();
        owner.Owned.clear();
        CleanupOwner(owner);
    }

    function Detach(computation: Computation): void
    {
        const dependencies = computation.Dependencies;
        for(let index = 0; index < dependencies.length; index++)
            dependencies[index].Unsubscribe(computation);
        dependencies.length = 0;
    }

    function SourceFor(target: object, key: Key, create = false): Source | undefined
    {
        let targetMap = Graph.get(target);
        if(!targetMap)
        {
            if(!create) return undefined;
            Graph.set(target, targetMap = new Map());
        }

        let source = targetMap.get(key);
        if(!source && create) targetMap.set(key, source = new Source());
        return source;
    }

    function TrackSource(source: Source): void
    {
        if(!Tracking || !Active || !Active.Active || Active.Paused) return;
        if(source.Has(Active)) return;
        source.Subscribe(Active);
        Active.Dependencies.push(source);
    }

    function Track(target: object, key: Key): void
    {
        if(!Tracking || !Active || !Active.Active || Active.Paused) return;
        TrackSource(SourceFor(target, key, true)!);
    }

    function Notify(target: object, key: Key): void
    {
        Version++;
        SourceFor(target, key)?.Notify();
    }

    function NotifyKeys(target: object, keys: readonly Key[]): void
    {
        Version++;
        const map = Graph.get(target);
        if(!map) return;

        // Direct O(1) slot lookup. No graph scan, no sorting, no temporary Set.
        // The tiny duplicate guard only matters when one Computation subscribes to
        // more than one structural slot changed by the same atomic mutation.
        if(keys.length === 1)
        {
            map.get(keys[0])?.Notify();
            return;
        }

        const notified = new Set<Computation>();
        for(let keyIndex = 0; keyIndex < keys.length; keyIndex++)
        {
            const source = map.get(keys[keyIndex]);
            if(!source) continue;

            source.Each((subscriber) =>
            {
                if(notified.has(subscriber)) return;
                notified.add(subscriber);
                subscriber.Notify();
            });
        }
    }

    function ScheduleComputation(computation: Computation): void
    {
        if(!computation.Active || computation.Paused || computation === Active) return;
        if(computation.Pending) return;
        computation.Pending = true;

        if(BatchDepth > 0)
        {
            Pending.add(computation);
            return;
        }

        const queue = computation.Schedule === 'microtask'
            ? Microtasks
            : computation.Schedule === 'animation-frame'
                ? Frames
                : computation.Schedule === 'idle'
                    ? Idles
                    : null;

        if(!queue)
        {
            computation.Pending = false;
            computation.Run();
            return;
        }

        queue.add(computation);
        RequestFlush(computation.Schedule);
    }

    function Trigger(target: object, keys: readonly Key[]): void
    {
        if(keys.length === 1) Notify(target, keys[0]);
        else NotifyKeys(target, keys);
    }

    function FlushQueue(queue: Set<Computation>): void
    {
        const work = [...queue].sort((a, b) => b.Priority - a.Priority || a.Id - b.Id);
        queue.clear();
        for(const computation of work)
        {
            computation.Pending = false;
            computation.Run();
        }
    }

    function RequestFlush(schedule: Schedule): void
    {
        if(schedule === 'microtask' && !MicrotaskPending)
        {
            MicrotaskPending = true;
            queueMicrotask(() =>
            {
                MicrotaskPending = false;
                FlushQueue(Microtasks);
            });
        }
        else if(schedule === 'animation-frame' && !FramePending)
        {
            FramePending = true;
            const frame = typeof requestAnimationFrame === 'function'
                ? requestAnimationFrame
                : (callback: FrameRequestCallback) => setTimeout(() => callback(Date.now()), 16) as unknown as number;
            frame(() =>
            {
                FramePending = false;
                FlushQueue(Frames);
            });
        }
        else if(schedule === 'idle' && !IdlePending)
        {
            IdlePending = true;
            const idle = (globalThis as unknown as
                {
                    requestIdleCallback?: (callback: () => void) => number;
                }).requestIdleCallback;
            (idle ?? ((callback: () => void) => setTimeout(callback, 1) as unknown as number))(() =>
            {
                IdlePending = false;
                FlushQueue(Idles);
            });
        }
    }

    function FlushPending(): void
    {
        if(BatchDepth > 0 || Pending.size === 0) return;
        const work = [...Pending].sort((a, b) => b.Priority - a.Priority || a.Id - b.Id);
        Pending.clear();
        for(const computation of work)
        {
            computation.Pending = false;
            ScheduleComputation(computation);
        }
    }

    function CreateOwner(name: string, parent: Owner | null = CurrentOwner): Owner
    {
        return {
            Parent: parent,
            Owned: new Set(),
            Cleanups: [],
            Context: null,
            Disposed: false,
            Name: name,
        };
    }

    function CreateComputation(fn: () => unknown, options: EffectOptions = {}): Computation
    {
        const owner = CreateOwner(options.Name ?? `Effect${Sequence + 1}`);
        const computation: Computation = Object.assign(owner,
            {
                Id: ++Sequence,
                Fn: fn,
                Dependencies: [] as Dependency[],
                Active: true,
                Running: false,
                Pending: false,
                Paused: false,
                Schedule: options.Schedule ?? 'sync',
                Priority: options.Priority ?? 0,
                OnError: options.OnError,
                Run(): void
                {
                    if(!computation.Active || computation.Paused || computation.Running) return;
                    computation.Running = true;
                    computation.Pending = false;
                    CleanupOwner(computation);
                    Detach(computation);

                    const previousEffect = Active;
                    const previousOwner = CurrentOwner;
                    Active = computation;
                    CurrentOwner = computation;

                    try { computation.Fn(); }
                    catch(error)
                    {
                        if(computation.OnError) computation.OnError(error);
                        else Warn('reactivity-effect', error);
                    }
                    finally
                    {
                        Active = previousEffect;
                        CurrentOwner = previousOwner;
                        computation.Running = false;
                    }
                },
                Notify(): void { ScheduleComputation(computation); },
                Dispose(): void
                {
                    if(!computation.Active) return;
                    computation.Active = false;
                    computation.Pending = false;
                    Pending.delete(computation);
                    Microtasks.delete(computation);
                    Frames.delete(computation);
                    Idles.delete(computation);
                    Detach(computation);
                    DisposeOwner(computation);
                    computation.Parent?.Owned.delete(computation);
                    Computations.delete(computation);
                },
            }) as Computation;

        computation.Parent?.Owned.add(computation);
        Computations.add(computation);

        if(options.Signal)
        {
            if(options.Signal.aborted) computation.Dispose();
            else options.Signal.addEventListener('abort', () => computation.Dispose(), { once: true });
        }

        return computation;
    }

    function MakeStop(computation: Computation): Stop
    {
        const stop = (() => computation.Dispose()) as Stop;
        Object.defineProperty(stop, 'Active', { get: () => computation.Active });
        stop.Pause = () => { computation.Paused = true; };
        stop.Resume = (run = false) =>
        {
            computation.Paused = false;
            if(run) computation.Run();
        };
        stop.Run = () => computation.Run();
        return stop;
    }

    function RecordTransaction(target: object, key: Key, had: boolean, old: unknown): void
    {
        if(TransactionDepth === 0 || RollingBack) return;
        let seen = TransactionSeen.get(target);
        if(!seen) TransactionSeen.set(target, seen = new Set());
        if(seen.has(key)) return;
        seen.add(key);
        TransactionLog.push({ Target: target, Key: key, Had: had, Old: old });
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  CHANGE EVENTS — EVENTS IS THE ONLY LISTENER/DISPATCH ENGINE
    // ═════════════════════════════════════════════════════════════════════════

    function Emit(meta: ProxyMeta, target: object, key: Key, old: unknown, next: unknown, kind: ChangeKind): void
    {
        if(!meta.Emit) return;
        const event: ChangeEvent =
            {
                Type: '',
                Target: target,
                Root: meta.Root,
                Path: [...meta.Path, key],
                Key: key,
                Old: old,
                New: next,
                Kind: kind,
                Version,
                Timestamp: Date.now(),
            };

        const name = String(key);
        for(const type of [`${name}-change`, 'change'])
        {
            event.Type = `${type}-before`;
            meta.Emit(event);
            event.Type = `${type}-after`;
            meta.Emit(event);
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  PROXY REACTIVITY
    // ═════════════════════════════════════════════════════════════════════════

    const ArrayMutators = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin']);


    /**
     * Identity search on reactive Arrays must compare raw identities.
     * Indexed reads expose cached Proxy wrappers, while the backing Array
     * intentionally stores raw values.
     */
    const ArrayIdentityMethods =
        new Set(['includes', 'indexOf', 'lastIndexOf']);

    function Wrap<T>(value: T, meta: ProxyMeta): T
    {
        if(!IsWrappable(value)) return value;
        return ReactiveProxy(value as object, meta) as T;
    }

    function CollectionMethod(target: Map<unknown, unknown> | Set<unknown>, key: Key, meta: ProxyMeta): unknown
    {
        const isMap = target instanceof Map;

        if(key === 'size')
        {
            Track(target, IterateKey);
            return target.size;
        }

        if(key === 'get' && isMap)
        {
            return (mapKey: unknown) =>
            {
                const rawKey = ToRaw(mapKey);
                Track(target, rawKey as Key);
                return Wrap(target.get(rawKey), { ...meta, Path: [...meta.Path, rawKey as Key] });
            };
        }

        if(key === 'has')
        {
            return (value: unknown) =>
            {
                const rawValue = ToRaw(value);
                Track(target, rawValue as Key);
                return target.has(rawValue);
            };
        }

        if(key === 'set' && isMap)
        {
            return (mapKey: unknown, value: unknown) =>
            {
                if(meta.Readonly) throw new TypeError('Readonly reactive Map.');
                const rawKey = ToRaw(mapKey);
                const rawValue = ToRaw(value);
                const had = target.has(rawKey);
                const old = target.get(rawKey);
                if(had && Object.is(old, rawValue)) return ProxyFor(target);
                RecordTransaction(target, rawKey as Key, had, old);
                EmitCollection(meta, target, 'CollectionChanging', 'Map', had ? 'set' : 'add',
                    { Key: rawKey as Key, Added: [rawValue], Removed: had ? [old] : [], Args: [rawKey, rawValue] });
                target.set(rawKey, rawValue);
                Trigger(target, [rawKey as Key, IterateKey, MapKeyIterateKey]);
                Emit(meta, target, rawKey as Key, old, rawValue, had ? 'set' : 'add');
                EmitCollection(meta, target, 'CollectionChanged', 'Map', had ? 'set' : 'add',
                    { Key: rawKey as Key, Added: [rawValue], Removed: had ? [old] : [], Args: [rawKey, rawValue] });
                return ProxyFor(target);
            };
        }

        if(key === 'add' && !isMap)
        {
            return (value: unknown) =>
            {
                if(meta.Readonly) throw new TypeError('Readonly reactive Set.');
                const rawValue = ToRaw(value);
                if(target.has(rawValue)) return ProxyFor(target);
                EmitCollection(meta, target, 'CollectionChanging', 'Set', 'add',
                    { Key: rawValue as Key, Added: [rawValue], Args: [rawValue] });
                target.add(rawValue);
                Trigger(target, [rawValue as Key, IterateKey]);
                Emit(meta, target, rawValue as Key, undefined, rawValue, 'add');
                EmitCollection(meta, target, 'CollectionChanged', 'Set', 'add',
                    { Key: rawValue as Key, Added: [rawValue], Args: [rawValue] });
                return ProxyFor(target);
            };
        }

        if(key === 'delete')
        {
            return (value: unknown) =>
            {
                if(meta.Readonly) throw new TypeError('Readonly reactive collection.');
                const rawValue = ToRaw(value);
                const had = target.has(rawValue);
                const old = isMap ? target.get(rawValue) : rawValue;
                if(!had) return false;
                RecordTransaction(target, rawValue as Key, true, old);
                EmitCollection(meta, target, 'CollectionChanging', isMap ? 'Map' : 'Set', 'delete',
                    { Key: rawValue as Key, Removed: [old], Args: [rawValue] });
                const result = target.delete(rawValue);
                Trigger(target, [rawValue as Key, IterateKey, MapKeyIterateKey]);
                Emit(meta, target, rawValue as Key, old, undefined, 'delete');
                EmitCollection(meta, target, 'CollectionChanged', isMap ? 'Map' : 'Set', 'delete',
                    { Key: rawValue as Key, Removed: [old], Args: [rawValue] });
                return result;
            };
        }

        if(key === 'clear')
        {
            return () =>
            {
                if(meta.Readonly) throw new TypeError('Readonly reactive collection.');
                if(target.size === 0) return;
                const old = isMap ? new Map(target) : new Set(target);
                const removed = isMap
                    ? Array.from((target as Map<unknown, unknown>).entries())
                    : Array.from(target.values());
                EmitCollection(meta, target, 'CollectionChanging', isMap ? 'Map' : 'Set', 'clear',
                    { Removed: removed, Args: [] });
                target.clear();
                Trigger(target, [IterateKey, MapKeyIterateKey]);
                Emit(meta, target, IterateKey, old, target, 'clear');
                EmitCollection(meta, target, 'CollectionChanged', isMap ? 'Map' : 'Set', 'clear',
                    { Removed: removed, Args: [] });
            };
        }

        if(key === 'keys') Track(target, MapKeyIterateKey);
        else if(key === Symbol.iterator || key === 'entries' || key === 'values' || key === 'forEach') Track(target, IterateKey);

        const member = Reflect.get(target, key, target);
        if(typeof member !== 'function') return member;

        if(key === 'forEach')
        {
            return (callback: (...args: unknown[]) => void, thisArg?: unknown) =>
                target.forEach((value, mapKey) => callback.call(thisArg, Wrap(value, meta), Wrap(mapKey, meta), ProxyFor(target)));
        }

        return member.bind(target);
    }

    function ReactiveProxy(raw: object, meta: ProxyMeta): object
    {
        if(IsProxy(raw)) return raw;
        const mode = ProxyMode(meta);
        const cache = RawToProxy.get(raw);
        const cached = cache?.get(mode);
        if(cached)
        {
            const existing = ProxyMetadata.get(cached);
            if(existing && meta.Emit && !existing.Emit) existing.Emit = meta.Emit;
            return cached;
        }

        const proxy = new Proxy(raw,
            {
                get(target, key, receiver)
                {
                    if(key === ProxyFlag) return true;
                    if(key === RawFlag) return target;

                    if(target instanceof Map || target instanceof Set)
                        return CollectionMethod(target, key, meta);

                    if
                    (
                        Array.isArray(target) &&
                        typeof key === 'string' &&
                        ArrayIdentityMethods.has(key)
                    )
                    {
                        const method =
                            Reflect.get(target, key, target) as (...args: unknown[]) => unknown;

                        return (...input: unknown[]) =>
                        {
                            Track(target, IterateKey);

                            const args = input.slice();

                            if(args.length)
                            {
                                args[0] = ToRaw(args[0]);
                            }

                            return Reflect.apply(method, target, args);
                        };
                    }

                    if(Array.isArray(target) && typeof key === 'string' && ArrayMutators.has(key))
                    {
                        const method = Reflect.get(target, key, target) as (...args: unknown[]) => unknown;

                        return (...input: unknown[]) =>
                        {
                            if(meta.Readonly) throw new TypeError(`Readonly reactive array method: ${key}.`);

                            const args = input.map(ToRaw);
                            const lengthBefore = target.length;
                            let index: number | undefined;
                            let deleteCount: number | undefined;
                            let added: unknown[] = [];
                            let removed: unknown[] = [];

                            if(key === 'push')
                            {
                                index = lengthBefore;
                                added = args;
                                deleteCount = 0;
                            }
                            else if(key === 'pop')
                            {
                                index = Math.max(0, lengthBefore - 1);
                                deleteCount = lengthBefore ? 1 : 0;
                                if(lengthBefore) removed = [target[lengthBefore - 1]];
                            }
                            else if(key === 'shift')
                            {
                                index = 0;
                                deleteCount = lengthBefore ? 1 : 0;
                                if(lengthBefore) removed = [target[0]];
                            }
                            else if(key === 'unshift')
                            {
                                index = 0;
                                deleteCount = 0;
                                added = args;
                            }
                            else if(key === 'splice')
                            {
                                const requested = Number(args[0] ?? 0);
                                index = requested < 0 ? Math.max(lengthBefore + requested, 0) : Math.min(requested, lengthBefore);
                                deleteCount = args.length === 0
                                    ? 0
                                    : args.length === 1
                                        ? lengthBefore - index
                                        : Math.max(0, Math.min(Number(args[1]) || 0, lengthBefore - index));
                                added = args.slice(2);
                                removed = target.slice(index, index + deleteCount);
                            }
                            else if(key === 'fill')
                            {
                                const requested = Number(args[1] ?? 0);
                                index = requested < 0 ? Math.max(lengthBefore + requested, 0) : Math.min(requested, lengthBefore);
                                const requestedEnd = Number(args[2] ?? lengthBefore);
                                const end = requestedEnd < 0 ? Math.max(lengthBefore + requestedEnd, 0) : Math.min(requestedEnd, lengthBefore);
                                deleteCount = Math.max(0, end - index);
                                removed = target.slice(index, end);
                            }
                            else if(key === 'copyWithin')
                            {
                                const requested = Number(args[0] ?? 0);
                                index = requested < 0 ? Math.max(lengthBefore + requested, 0) : Math.min(requested, lengthBefore);
                                const requestedStart = Number(args[1] ?? 0);
                                const from = requestedStart < 0 ? Math.max(lengthBefore + requestedStart, 0) : Math.min(requestedStart, lengthBefore);
                                const requestedEnd = Number(args[2] ?? lengthBefore);
                                const to = requestedEnd < 0 ? Math.max(lengthBefore + requestedEnd, 0) : Math.min(requestedEnd, lengthBefore);
                                deleteCount = Math.max(0, Math.min(to - from, lengthBefore - index));
                                removed = target.slice(index, index + deleteCount);
                            }
                            else
                            {
                                index = 0;
                                deleteCount = lengthBefore;
                                removed = target.slice();
                            }

                            EmitCollection(meta, target, 'CollectionChanging', 'Array', key as CollectionOperation,
                            {
                                Index: index, DeleteCount: deleteCount, Added: added, Removed: removed, Args: args,
                                LengthBefore: lengthBefore, LengthAfter: lengthBefore
                            });

                            // Transactions remain a higher-level concern. Only an active transaction pays
                            // for rollback bookkeeping; the ordinary Proxy mutation path pays nothing.
                            if(TransactionDepth > 0 && !RollingBack)
                            {
                                RecordTransaction(target, 'length', true, lengthBefore);
                                const first = index ?? 0;
                                for(let cursor = first; cursor < lengthBefore; cursor++)
                                {
                                    const property = String(cursor);
                                    RecordTransaction(target, property, Object.prototype.hasOwnProperty.call(target, property), target[cursor]);
                                }
                            }

                            // Atomic raw mutation: native Array internals never re-enter Proxy set/delete traps.
                            const result = Reflect.apply(method, target, args);
                            const lengthAfter = target.length;

                            if(key === 'sort' || key === 'reverse') added = target.slice();
                            else if(key === 'fill' || key === 'copyWithin')
                            {
                                const count = deleteCount ?? 0;
                                added = typeof index === 'number' ? target.slice(index, index + count) : [];
                            }

                            // Structural dependency is a single pre-registered slot. Array index reads also
                            // subscribe to it, so shifts/splices remain correct without scanning Graph.
                            Trigger(target, [IterateKey]);

                            EmitCollection(meta, target, 'CollectionChanged', 'Array', key as CollectionOperation,
                            {
                                Index: index, DeleteCount: deleteCount, Added: added, Removed: removed, Args: args,
                                LengthBefore: lengthBefore, LengthAfter: lengthAfter
                            });

                            // Methods returning the mutated array preserve Proxy identity.
                            if(result === target) return receiver;
                            return meta.Shallow ? result : Wrap(result, meta);
                        };
                    }

                    const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
                    if(descriptor && descriptor.configurable === false)
                    {
                        if('value' in descriptor && descriptor.writable === false) return descriptor.value;
                        if(!('value' in descriptor) && descriptor.get === undefined) return undefined;
                    }

                    const result = Reflect.get(target, key, receiver);
                    Track(target, key);
                    if(Array.isArray(target) && (IsIntegerKey(key) || key === 'length')) Track(target, IterateKey);
                    if(meta.Shallow || !IsWrappable(result)) return result;

                    const cachedChild = RawToProxy.get(result)?.get(ProxyMode(meta));
                    if(cachedChild) return cachedChild;

                    return ReactiveProxy(result, { ...meta, Path: [...meta.Path, key] });
                },

                set(target, key, value, receiver)
                {
                    if(meta.Readonly) throw new TypeError(`Readonly reactive property: ${String(key)}.`);
                    const old = Reflect.get(target, key, receiver);
                    const rawValue = ToRaw(value);
                    if(Object.is(old, rawValue)) return true;

                    const had = Object.prototype.hasOwnProperty.call(target, key);

                    if(TransactionDepth > 0) RecordTransaction(target, key, had, old);
                    const oldLength = Array.isArray(target) ? target.length : 0;
                    const arrayIndex =
                        Array.isArray(target) && IsIntegerKey(key)
                            ? Number(key)
                            : undefined;
                    const semanticArraySet =
                        Array.isArray(target) &&
                        CollectionMutationDepth === 0 &&
                        (
                            typeof arrayIndex === 'number' ||
                            key === 'length'
                        );
                    const truncated =
                        semanticArraySet &&
                        key === 'length' &&
                        Number(rawValue) < oldLength
                            ? target.slice(Number(rawValue))
                            : [];

                    if(semanticArraySet)
                    {
                        EmitCollection
                        (
                            meta,
                            target,
                            'CollectionChanging',
                            'Array',
                            key === 'length' && Number(rawValue) === 0
                                ? 'clear'
                                : (key === 'length' ? 'truncate' : (had ? 'set' : 'add')),
                            {
                                Key          : key,
                                Index        : arrayIndex,
                                DeleteCount  :
                                    key === 'length' && Number(rawValue) < oldLength
                                        ? oldLength - Number(rawValue)
                                        : (had ? 1 : 0),
                                Added        : key === 'length' ? [] : [rawValue],
                                Removed      : key === 'length' ? truncated : (had ? [old] : []),
                                Args         : [rawValue],
                                LengthBefore : oldLength,
                                LengthAfter  :
                                    key === 'length'
                                        ? Number(rawValue)
                                        : Math.max(oldLength, (arrayIndex ?? -1) + 1)
                            }
                        );
                    }


                    const own = Reflect.getOwnPropertyDescriptor(target, key);
                    const result =
                        own && 'value' in own && own.writable
                            ? Reflect.set(target, key, rawValue, target)
                            : Reflect.set(target, key, rawValue, receiver);
                    if(!result) return false;

                    const keys: Key[] = [key];
                    if(!had) keys.push(IterateKey);
                    if(Array.isArray(target) && IsIntegerKey(key) && target.length !== oldLength) keys.push('length');

                    const semanticClear =
                        semanticArraySet && key === 'length' && Number(rawValue) === 0;

                    if(semanticClear)
                    {
                        EmitCollection
                        (
                            meta, target, 'CollectionChanged', 'Array', 'clear',
                            {
                                Key: key, Index: arrayIndex, DeleteCount: truncated.length,
                                Added: [], Removed: truncated, Args: [rawValue],
                                LengthBefore: oldLength, LengthAfter: target.length
                            }
                        );
                    }

                    Trigger(target, keys);
                    Emit(meta, target, key, old, rawValue, had ? 'set' : 'add');

                    /*
                     * Nested object mutation inside a reactive Array.
                     *
                     * Simple compiled list records intentionally own no Effect;
                     * route only the owning row index through the semantic
                     * collection channel. This restores fine-grained DOM
                     * correctness without reconciling the full list.
                     */
                    if
                    (
                        target !== meta.Root &&
                        Array.isArray(meta.Root) &&
                        meta.Path.length > 0 &&
                        Events.Event.Has('CollectionChanged')
                    )
                    {
                        const root =
                            meta.Root as unknown[];

                        const candidate =
                            typeof meta.Path[0] === 'number'
                                ? meta.Path[0] as number
                                : Number(meta.Path[0]);

                        const index =
                            Number.isInteger(candidate) &&
                            candidate >= 0 &&
                            candidate < root.length &&
                            root[candidate] === target
                                ? candidate
                                : root.indexOf(target);

                        if(index >= 0)
                        {
                            EmitCollection
                            (
                                meta,
                                meta.Root,
                                'CollectionChanged',
                                'Array',
                                'update',
                                {
                                    Index   : index,
                                    Key     : key,
                                    Added   : [target],
                                    Removed : [target],
                                    Args    : [rawValue],
                                    Path    : [index, ...meta.Path.slice(1), key]
                                }
                            );
                        }
                    }

                    if(semanticArraySet && !semanticClear)
                    {
                        EmitCollection
                        (
                            meta, target, 'CollectionChanged', 'Array',
                            key === 'length' ? 'truncate' : (had ? 'set' : 'add'),
                            {
                                Key          : key,
                                Index        : arrayIndex,
                                DeleteCount  :
                                    key === 'length' && Number(rawValue) < oldLength
                                        ? oldLength - Number(rawValue)
                                        : (had ? 1 : 0),
                                Added        : key === 'length' ? [] : [rawValue],
                                Removed      : key === 'length' ? truncated : (had ? [old] : []),
                                Args         : [rawValue],
                                LengthBefore : oldLength,
                                LengthAfter  : target.length
                            }
                        );
                    }

                    return true;
                },

                deleteProperty(target, key)
                {
                    if(meta.Readonly) throw new TypeError(`Readonly reactive property: ${String(key)}.`);
                    const had = Object.prototype.hasOwnProperty.call(target, key);
                    if(!had) return true;
                    const old = Reflect.get(target, key);
                    if(TransactionDepth > 0) RecordTransaction(target, key, true, old);
                    const result = Reflect.deleteProperty(target, key);
                    if(result)
                    {
                        Trigger(target, [key, IterateKey]);
                        Emit(meta, target, key, old, undefined, 'delete');
                    }
                    return result;
                },

                has(target, key)
                {
                    Track(target, key);
                    return Reflect.has(target, key);
                },

                ownKeys(target)
                {
                    Track(target, Array.isArray(target) ? 'length' : IterateKey);
                    return Reflect.ownKeys(target);
                },

                defineProperty(target, key, descriptor)
                {
                    if(meta.Readonly) throw new TypeError(`Readonly reactive property: ${String(key)}.`);
                    const had = Object.prototype.hasOwnProperty.call(target, key);
                    const old = Reflect.get(target, key);
                    if(TransactionDepth > 0) RecordTransaction(target, key, had, old);
                    const result = Reflect.defineProperty(target, key, descriptor);
                    if(result)
                    {
                        Trigger(target, [key, ...(had ? [] : [IterateKey])]);
                        Emit(meta, target, key, old, descriptor.value, had ? 'set' : 'add');
                    }
                    return result;
                },
            });

        const proxies = RawToProxy.get(raw) ?? new Map<string, object>();
        proxies.set(mode, proxy);
        RawToProxy.set(raw, proxies);
        ProxyToRaw.set(proxy, raw);
        ProxyMetadata.set(proxy, meta);
        return proxy;
    }

    function ProxyFor(raw: object): object
    {
        const proxies = RawToProxy.get(raw);
        return proxies?.get('mutable:deep') ?? proxies?.values().next().value ?? raw;
    }

    export function ReactiveObject<T extends object>(source: T, options: ReactiveOptions = {}): T
    {
        if(!IsWrappable(source)) return source;
        return ReactiveProxy(source,
            {
                Root: source,
                Path: [],
                Shallow: options.Shallow ?? false,
                Readonly: options.Readonly ?? false,
            }) as T;
    }

    export function Shallow<T extends object>(source: T): T
    {
        return ReactiveObject(source, { Shallow: true });
    }

    export function Readonly<T extends object>(source: T): Readonly<T>
    {
        return ReactiveObject(source, { Readonly: true }) as Readonly<T>;
    }

    export function MarkRaw<T extends object>(source: T): T
    {
        MarkedRaw.add(source);
        return source;
    }

    export function IsProxy(value: unknown): boolean
    {
        return IsObject(value) && ProxyToRaw.has(value as object);
    }

    export function IsReactive(value: unknown): boolean
    {
        if(!IsProxy(value)) return false;
        return !ProxyMetadata.get(value as object)?.Readonly;
    }

    export function IsReadonly(value: unknown): boolean
    {
        return IsProxy(value) && ProxyMetadata.get(value as object)?.Readonly === true;
    }

    export function ToRaw<T>(value: T): T
    {
        if(!IsObject(value)) return value;
        return (ProxyToRaw.get(value as object) ?? value) as T;
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  SIGNALS AND MEMOS
    // ═════════════════════════════════════════════════════════════════════════

    export function CreateSignal<T>(initial: T, options: SignalOptions<T> = {}): SignalContract<T>
    {
        const node = new Source();
        SignalNodes.add(node);
        const sequence = ++SignalSequence;
        let value = initial;
        const name = options.Name ?? `Signal${sequence}`;

        const signal: SignalContract<T> =
            {
                Name: name,
                get Value(): T { return signal.Get(); },
                set Value(next: T) { signal.Set(next); },
                Get(): T
                {
                    TrackSource(node);
                    return value;
                },
                Peek(): T { return value; },
                Set(next: T | ((previous: T) => T)): T
                {
                    const resolved = typeof next === 'function'
                        ? (next as (previous: T) => T)(value)
                        : next;
                    if(Equal(options.Equals, value, resolved)) return value;
                    value = resolved;
                    Version++; node.Notify();
                    return value;
                },
                Update(updater: (previous: T) => T): T { return signal.Set(updater); },
                Touch(): void { Version++; node.Notify(); },
                Readonly(): ReadonlySignalContract<T>
                {
                    return {
                        Name: signal.Name,
                        get Value(): T { return signal.Get(); },
                        Get: signal.Get,
                        Peek: signal.Peek,
                        Subscribe: signal.Subscribe,
                    };
                },
                Subscribe(handler: (value: T, previous: T) => void, effectOptions: EffectOptions = {}): Stop
                {
                    let previous = value;
                    return CreateEffectPrimitive(() =>
                    {
                        const next = signal.Get();
                        if(!Object.is(next, previous))
                        {
                            const old = previous;
                            previous = next;
                            Untrack(() => handler(next, old));
                        }
                    }, { ...effectOptions, Defer: true });
                },
            };

        return signal;
    }

    export function CreateMemo<T>(derive: () => T, options: SignalOptions<T> & EffectOptions = {}): MemoContract<T>
    {
        const node = new Source();
        SignalNodes.add(node);
        SignalSequence++;
        let value!: T;
        let dirty = true;
        let initialized = false;

        const computation = CreateComputation(() =>
        {
            const next = derive();
            dirty = false;
            if(!initialized)
            {
                value = next;
                initialized = true;
            }
            else if(!Equal(options.Equals, value, next))
            {
                value = next;
                Version++; node.Notify();
            }
        }, { ...options, Schedule: 'sync' });

        computation.Notify = () =>
        {
            if(dirty) return;
            dirty = true;
            Version++; node.Notify();
        };

        const memo: MemoContract<T> =
            {
                Name: options.Name ?? `Memo${computation.Id}`,
                get Value(): T { return memo.Get(); },
                get Dirty(): boolean { return dirty; },
                Get(): T
                {
                    TrackSource(node);
                    if(dirty) computation.Run();
                    return value;
                },
                Peek(): T
                {
                    if(dirty) Untrack(() => computation.Run());
                    return value;
                },
                Recompute(): T
                {
                    dirty = true;
                    computation.Run();
                    return value;
                },
                Subscribe(handler: (value: T, previous: T) => void, effectOptions: EffectOptions = {}): Stop
                {
                    let previous = memo.Peek();
                    return CreateEffectPrimitive(() =>
                    {
                        const next = memo.Get();
                        if(!Object.is(previous, next))
                        {
                            const old = previous;
                            previous = next;
                            Untrack(() => handler(next, old));
                        }
                    }, { ...effectOptions, Defer: true });
                },
            };

        return memo;
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  EFFECTS, ROOTS, WATCHERS AND OWNERSHIP
    // ═════════════════════════════════════════════════════════════════════════

    function CreateEffectPrimitive(fn: (OnCleanup: (cleanup: Cleanup) => void) => void, options: EffectOptions = {}): Stop
    {
        const computation = CreateComputation(() => fn(OnCleanup), options);
        if(!options.Defer) computation.Run();
        else queueMicrotask(() => computation.Run());
        return MakeStop(computation);
    }

    export function Computed(fn: () => void, options: Omit<EffectOptions, 'Schedule'> = {}): Stop
    {
        return CreateEffectPrimitive(() => fn(), { ...options, Schedule: 'sync' });
    }

    function CreateReactionPrimitive(invalidate: () => void, options: EffectOptions = {}): ReactionContract
    {
        let tracker: Computation | null = null;
        return {
            Track(read: () => void): void
            {
                tracker?.Dispose();
                tracker = CreateComputation(read, options);
                tracker.Notify = () =>
                {
                    tracker?.Dispose();
                    tracker = null;
                    Untrack(invalidate);
                };
                tracker.Run();
            },
            Dispose(): void { tracker?.Dispose(); tracker = null; },
            get Active(): boolean { return tracker?.Active ?? false; },
        };
    }

    function CreateWatchPrimitive<T>(source: () => T, handler: (value: T, previous: T | undefined, OnCleanup: (cleanup: Cleanup) => void) => void, options: WatchOptions<T> = {}): Stop
    {
        let initialized = false;
        let previous: T | undefined;

        return CreateEffectPrimitive(OnCleanup =>
        {
            const value = source();
            if(options.Deep) Traverse(value);

            const changed = !initialized || !Equal(options.Equals, previous as T, value);
            if(changed && (initialized || options.Immediate))
                Untrack(() => handler(value, previous, OnCleanup));

            previous = value;
            initialized = true;
        }, options);
    }

    export function WatchEffect(fn: (OnCleanup: (cleanup: Cleanup) => void) => void, options: EffectOptions = {}): Stop
    {
        return CreateEffectPrimitive(fn, options);
    }

    function CreateRootPrimitive<T>(fn: (Dispose: Cleanup) => T, name = 'Root'): T
    {
        const owner = CreateOwner(name, CurrentOwner);
        const previous = CurrentOwner;
        CurrentOwner = owner;
        try { return fn(() => DisposeOwner(owner)); }
        finally { CurrentOwner = previous; }
    }

    function RunScopePrimitive<T>(fn: () => T, owner: Owner | null = CurrentOwner): T
    {
        const previous = CurrentOwner;
        CurrentOwner = owner;
        try { return fn(); }
        finally { CurrentOwner = previous; }
    }

    export function GetOwner(): unknown { return CurrentOwner; }

    export function OnCleanup(cleanup: Cleanup): void
    {
        if(!CurrentOwner) throw new Error('OnCleanup requires an active reactive owner.');
        CurrentOwner.Cleanups.push(cleanup);
    }

    export function OnError(handler: (error: unknown) => void): void
    {
        if(!CurrentOwner || !('OnError' in CurrentOwner)) throw new Error('OnError requires an active computation.');
        (CurrentOwner as Computation).OnError = handler;
    }

    export function Provide<T>(key: unknown, value: T): T
    {
        if(!CurrentOwner) throw new Error('Provide requires an active owner.');
        (CurrentOwner.Context ??= new Map()).set(key, value);
        return value;
    }

    export function Inject<T>(key: unknown, fallback?: T): T | undefined
    {
        for(let owner = CurrentOwner; owner; owner = owner.Parent)
            if(owner.Context?.has(key)) return owner.Context.get(key) as T;
        return fallback;
    }

    export function Traverse(value: unknown, seen = new Set<object>()): void
    {
        if(!IsObject(value) || seen.has(value)) return;
        seen.add(value);
        if(value instanceof Map || value instanceof Set)
            for(const item of value.values()) Traverse(item, seen);
        else
            for(const key of Reflect.ownKeys(value)) Traverse(Reflect.get(value, key), seen);
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  EXECUTION CONTROL
    // ═════════════════════════════════════════════════════════════════════════

    function RunBatch<T>(fn: () => T): T
    {
        BatchDepth++;
        try { return fn(); }
        finally
        {
            BatchDepth--;
            if(BatchDepth === 0) FlushPending();
        }
    }

    function RunTransaction<T>(fn: () => T): T
    {
        TransactionDepth++;
        BatchDepth++;
        const start = TransactionLog.length;

        try { return fn(); }
        catch(error)
        {
            RollingBack = true;
            try
            {
                for(let i = TransactionLog.length - 1; i >= start; i--)
                {
                    const entry = TransactionLog[i];
                    if(entry.Target instanceof Map)
                    {
                        if(entry.Had) entry.Target.set(entry.Key, entry.Old);
                        else entry.Target.delete(entry.Key);
                    }
                    else if(entry.Target instanceof Set)
                    {
                        if(entry.Had) entry.Target.add(entry.Old);
                        else entry.Target.delete(entry.Key);
                    }
                    else if(entry.Had) Reflect.set(entry.Target, entry.Key, entry.Old);
                    else Reflect.deleteProperty(entry.Target, entry.Key);
                }
            }
            finally { RollingBack = false; }
            throw error;
        }
        finally
        {
            TransactionLog.splice(start);
            TransactionDepth--;
            BatchDepth--;
            if(TransactionDepth === 0)
            {
                TransactionSeen = new WeakMap<object, Set<Key>>();
                TransactionLog.length = 0;
            }
            if(BatchDepth === 0) FlushPending();
        }
    }

    export function Untrack<T>(fn: () => T): T
    {
        const previous = Tracking;
        Tracking = false;
        try { return fn(); }
        finally { Tracking = previous; }
    }

    export function Flush(): void
    {
        // Deterministic consistency barrier. A computation flushed from one queue may
        // enqueue work into another queue (or back into Pending), so a single pass is
        // not sufficient as a public DOM/state consistency guarantee.
        do
        {
            FlushPending();
            FlushQueue(Microtasks);
            FlushQueue(Frames);
            FlushQueue(Idles);
        }
        while
        (
            BatchDepth === 0 &&
            (
                Pending.size   !== 0 ||
                Microtasks.size !== 0 ||
                Frames.size     !== 0 ||
                Idles.size      !== 0
            )
        );
    }

    export function NextTick(): Promise<void>
    {
        return new Promise(resolve =>
            queueMicrotask(() =>
            {
                Flush();
                resolve();
            })
        );
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  DERIVED UTILITIES
    // ═════════════════════════════════════════════════════════════════════════

    export function CreateSelector<T, K = T>(source: () => T, equals: (key: K, value: T) => boolean = Object.is as (key: K, value: T) => boolean): SelectorContract<T, K>
    {
        const value = CreateMemo(source);
        const selector = ((key: K) => equals(key, value.Get())) as unknown as SelectorContract<T, K>;
        Object.defineProperty(selector, 'Value', { get: () => value.Get() });
        return selector;
    }

    function CreateDeferredPrimitive<T>(source: () => T, timeout = 0): ReadonlySignalContract<T>
    {
        const result = CreateSignal(source());
        let handle: ReturnType<typeof setTimeout> | undefined;
        CreateEffectPrimitive(() =>
        {
            const next = source();
            clearTimeout(handle);
            handle = setTimeout(() => result.Set(next), timeout);
            OnCleanup(() => clearTimeout(handle));
        });
        return result.Readonly();
    }

    export function From<T>(producer: ((set: (value: T) => void) => void | Cleanup) | { subscribe(handler: (value: T) => void): void | Cleanup | { unsubscribe(): void } }, initial?: T): ReadonlySignalContract<T | undefined>
    {
        const result = CreateSignal<T | undefined>(initial);
        CreateRootPrimitive(() =>
        {
            const subscription = typeof producer === 'function'
                ? producer(value => result.Set(value))
                : producer.subscribe(value => result.Set(value));

            if(typeof subscription === 'function') OnCleanup(subscription);
            else if(subscription && typeof subscription.unsubscribe === 'function') OnCleanup(() => subscription.unsubscribe());
        }, 'ExternalSource');
        return result.Readonly();
    }

    function CreateLinkedSignalPrimitive<T>(source: () => T, write: (value: T) => void, options: SignalOptions<T> = {}): SignalContract<T>
    {
        const read = CreateMemo(source, options);
        return {
            Name: options.Name ?? read.Name,
            get Value(): T { return read.Get(); },
            set Value(value: T) { write(value); },
            Get: () => read.Get(),
            Peek: () => read.Peek(),
            Set(value)
            {
                const next = typeof value === 'function' ? (value as (previous: T) => T)(read.Peek()) : value;
                write(next);
                return next;
            },
            Update(updater) { return this.Set(updater); },
            Touch() { read.Recompute(); },
            Readonly: () => read,
            Subscribe: (handler, effectOptions) => read.Subscribe(handler, effectOptions),
        };
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  ASYNC RESOURCES
    // ═════════════════════════════════════════════════════════════════════════

    function CreateResourcePrimitive<T, S = unknown>(fetcher: (source: S | undefined, context: { Previous: T | undefined; Signal: AbortSignal; Refetching: boolean }) => T | Promise<T>, source?: () => S, options: ResourceOptions<T> = {}): ResourceContract<T, S>
    {
        const value = CreateSignal<T | undefined>(options.Initial, { Name: `${options.Name ?? 'Resource'}.Value` });
        const latest = CreateSignal<T | undefined>(options.Initial);
        const error = CreateSignal<unknown>(undefined);
        const loading = CreateSignal(false);
        const state = CreateSignal<Resource<T, S>['State']>('idle');
        let controller: AbortController | null = null;
        let promise: Promise<T> | null = null;
        let request = 0;
        let currentSource: S | undefined;
        let disposed = false;

        const resource: ResourceContract<T, S> =
            {
                Name: options.Name ?? 'Resource',
                get Value() { return value.Get(); },
                get Latest() { return latest.Get(); },
                get Error() { return error.Get(); },
                get Loading() { return loading.Get(); },
                get State() { return state.Get(); },
                get Source() { return currentSource; },
                get Promise() { return promise; },
                get Controller() { return controller; },
                async Refetch(nextSource?: S): Promise<T | undefined>
                {
                    if(disposed) return value.Peek();
                    const id = ++request;
                    controller?.abort('superseded');
                    controller = new AbortController();
                    currentSource = arguments.length ? nextSource : source?.();
                    const previous = latest.Peek();
                    const refetching = previous !== undefined;

                    RunBatch(() =>
                    {
                        error.Set(undefined);
                        loading.Set(true);
                        state.Set(refetching ? 'refreshing' : 'pending');
                        if(!options.KeepPrevious && !refetching) value.Set(undefined);
                    });

                    promise = Promise.resolve(fetcher(currentSource,
                        {
                            Previous: previous,
                            Signal: controller.signal,
                            Refetching: refetching,
                        }));

                    try
                    {
                        const result = await promise;
                        if(disposed || id !== request || controller.signal.aborted) return value.Peek();
                        RunBatch(() =>
                        {
                            value.Set(result);
                            latest.Set(result);
                            loading.Set(false);
                            state.Set('ready');
                        });
                        return result;
                    }
                    catch(reason)
                    {
                        if(disposed || id !== request) return value.Peek();
                        if(controller.signal.aborted)
                        {
                            loading.Set(false);
                            state.Set('aborted');
                            return value.Peek();
                        }
                        RunBatch(() =>
                        {
                            error.Set(reason);
                            loading.Set(false);
                            state.Set('error');
                        });
                        options.OnError?.(reason);
                        return value.Peek();
                    }
                },
                Mutate(next)
                {
                    const result = typeof next === 'function'
                        ? (next as (previous: T | undefined) => T)(value.Peek())
                        : next;
                    RunBatch(() => { value.Set(result); latest.Set(result); state.Set('ready'); });
                    return result;
                },
                Abort(reason?: unknown): void
                {
                    controller?.abort(reason);
                    loading.Set(false);
                    state.Set('aborted');
                },
                Clear(): void
                {
                    resource.Abort('clear');
                    RunBatch(() =>
                    {
                        value.Set(undefined);
                        latest.Set(undefined);
                        error.Set(undefined);
                        state.Set('idle');
                    });
                },
                Dispose(): void
                {
                    disposed = true;
                    resource.Abort('dispose');
                    stop?.();
                },
            };

        const stop = source
            ? CreateWatchPrimitive(source, next => { void resource.Refetch(next); }, { Immediate: options.Immediate ?? true, Schedule: options.Schedule })
            : undefined;

        if(!source && (options.Immediate ?? true)) void resource.Refetch();
        return resource;
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  NOMINAL FLUENT PUBLIC SURFACE
    // ═════════════════════════════════════════════════════════════════════════

    /** @name        ReadonlySignal
     *  @public
     *  @type        {typeof ReadonlySignal}
     *  @description Runtime class responsible for the ReadonlySignal capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class ReadonlySignal<T>
    {
        protected readonly Source: ReadonlySignalContract<T>;

        constructor(source: ReadonlySignalContract<T>)
        {
            this.Source = source;
        }

        get Name(): string { return this.Source.Name; }
        get Value(): T { return this.Source.Value; }
        Get(): T { return this.Source.Get(); }
        Peek(): T { return this.Source.Peek(); }

        Subscribe(handler: (value: T, previous: T) => void, options: EffectOptions = {}): Effect
        {
            return new Effect(() =>
            {
                let previous = this.Peek();
                const value = this.Value;
                if(!Object.is(value, previous))
                {
                    const old = previous;
                    previous = value;
                    Untrack(() => handler(value, old));
                }
            }, { ...options, Defer: true });
        }

        Map<U>(derive: (value: T) => U, options: SignalOptions<U> & EffectOptions = {}): Memo<U>
        {
            return new Memo(() => derive(this.Value), options);
        }

        Effect(run: (value: T, OnCleanup: (cleanup: Cleanup) => void) => void, options: EffectOptions = {}): Effect
        {
            return new Effect(cleanup => run(this.Value, cleanup), options);
        }

        Watch(handler: WatchHandler<T>, options: WatchOptions<T> = {}): Watch<T>
        {
            return new Watch(() => this.Value, handler, options);
        }

        BindText(node: Text): this
        {
            BindText(() => this.Value, node);
            return this;
        }

        BindAttribute(element: Element, name: string): this
        {
            BindAttribute(() => this.Value, element, name);
            return this;
        }

        BindProperty<O extends object, K extends keyof O>(target: O, key: K): this
        {
            BindProperty(() => this.Value as unknown as O[K], target, key);
            return this;
        }
    }

    /** @name        Signal
     *  @public
     *  @type        {typeof Signal}
     *  @description Runtime class responsible for the Signal capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Signal<T> extends ReadonlySignal<T>
    {
        protected declare readonly Source: SignalContract<T>;

        constructor(value: T, options: SignalOptions<T> = {})
        {
            super(CreateSignal(value, options));
        }

        get Value(): T { return this.Source.Value; }
        set Value(value: T) { this.Source.Value = value; }

        Set(value: T | ((previous: T) => T)): this
        {
            this.Source.Set(value);
            return this;
        }

        Update(updater: (previous: T) => T): this
        {
            this.Source.Update(updater);
            return this;
        }

        Mutate(mutation: (value: T) => void): this
        {
            RunBatch(() =>
            {
                mutation(this.Source.Peek());
                this.Source.Touch();
            });
            return this;
        }

        Touch(): this
        {
            this.Source.Touch();
            return this;
        }

        Readonly(): ReadonlySignal<T>
        {
            return new ReadonlySignal(this.Source.Readonly());
        }
    }

    /** @name        Mono
     *  @public
     *  @type        {typeof Mono}
     *  @description Runtime class responsible for the Mono capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Mono<T>
    {
        #value: T;
        #subscriber: (() => void) | null = null;

        constructor(value: T)
        {
            this.#value = value;
        }

        get Value(): T
        {
            return this.#value;
        }

        set Value(value: T)
        {
            this.Set(value);
        }

        Get(): T
        {
            return this.#value;
        }

        Peek(): T
        {
            return this.#value;
        }

        Set(value: T): this
        {
            if(!Object.is(value, this.#value))
            {
                this.#value = value;
                this.#subscriber?.();
            }

            return this;
        }

        Update
        (
            updater: (value: T) => T
        ): this
        {
            return this.Set
            (
                updater(this.#value)
            );
        }

        Subscribe
        (
            subscriber: (() => void) | null
        ): this
        {
            this.#subscriber = subscriber;
            return this;
        }

        BindText
        (
            node: Text
        ): this
        {
            node.nodeValue =
                String(this.#value ?? '');

            this.#subscriber =
                () =>
                {
                    node.nodeValue =
                        String(this.#value ?? '');
                };

            return this;
        }

        Dispose(): void
        {
            this.#subscriber = null;
        }
    }

    /** @name        Memo
     *  @public
     *  @type        {typeof Memo}
     *  @description Runtime class responsible for the Memo capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Memo<T> extends ReadonlySignal<T>
    {
        protected declare readonly Source: MemoContract<T>;

        constructor(derive: () => T, options: SignalOptions<T> & EffectOptions = {})
        {
            super(CreateMemo(derive, options));
        }

        get Dirty(): boolean { return this.Source.Dirty; }

        Recompute(): this
        {
            this.Source.Recompute();
            return this;
        }
    }

    /** @name        Effect
     *  @public
     *  @type        {typeof Effect}
     *  @description Runtime class responsible for the Effect capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Effect
    {
        readonly #stop: Stop;

        constructor(run: (OnCleanup: (cleanup: Cleanup) => void) => void, options: EffectOptions = {})
        {
            this.#stop = CreateEffectPrimitive(run, options);
        }

        get Active(): boolean { return this.#stop.Active; }
        Run(): this { this.#stop.Run(); return this; }
        Pause(): this { this.#stop.Pause(); return this; }
        Resume(run = true): this { this.#stop.Resume(run); return this; }
        Dispose(): void { this.#stop(); }
        Stop(): void { this.Dispose(); }
    }

    /** @name        Watch
     *  @public
     *  @type        {typeof Watch}
     *  @description Runtime class responsible for the Watch capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Watch<T>
    {
        readonly #stop: Stop;

        constructor(source: () => T, handler: WatchHandler<T>, options: WatchOptions<T> = {})
        {
            this.#stop = CreateWatchPrimitive(source, handler, options);
        }

        get Active(): boolean { return this.#stop.Active; }
        Run(): this { this.#stop.Run(); return this; }
        Pause(): this { this.#stop.Pause(); return this; }
        Resume(run = true): this { this.#stop.Resume(run); return this; }
        Dispose(): void { this.#stop(); }
        Stop(): void { this.Dispose(); }
    }

    /** @name        Reaction
     *  @public
     *  @type        {typeof Reaction}
     *  @description Runtime class responsible for the Reaction capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Reaction
    {
        readonly #reaction: ReactionContract;

        constructor(invalidate: () => void, options: EffectOptions = {})
        {
            this.#reaction = CreateReactionPrimitive(invalidate, options);
        }

        get Active(): boolean { return this.#reaction.Active; }
        Track(read: () => void): this { this.#reaction.Track(read); return this; }
        Dispose(): void { this.#reaction.Dispose(); }
    }

    /** @name        Resource
     *  @public
     *  @type        {typeof Resource}
     *  @description Runtime class responsible for the Resource capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Resource<T, S = unknown>
    {
        readonly #resource: ResourceContract<T, S>;

        constructor(fetcher: ResourceFetcher<T, S>, source?: () => S, options: ResourceOptions<T> = {})
        {
            this.#resource = CreateResourcePrimitive(fetcher, source, options);
        }

        get Name(): string { return this.#resource.Name; }
        get Value(): T | undefined { return this.#resource.Value; }
        get Latest(): T | undefined { return this.#resource.Latest; }
        get Error(): unknown { return this.#resource.Error; }
        get Loading(): boolean { return this.#resource.Loading; }
        get State(): ResourceState { return this.#resource.State; }
        get Source(): S | undefined { return this.#resource.Source; }
        get Promise(): Promise<T> | null { return this.#resource.Promise; }
        get Controller(): AbortController | null { return this.#resource.Controller; }

        Refetch(source?: S): Promise<T | undefined> { return this.#resource.Refetch(source); }
        Mutate(value: T | ((previous: T | undefined) => T)): this { this.#resource.Mutate(value); return this; }
        Abort(reason?: unknown): this { this.#resource.Abort(reason); return this; }
        Clear(): this { this.#resource.Clear(); return this; }
        Effect(run: (resource: this, OnCleanup: (cleanup: Cleanup) => void) => void, options: EffectOptions = {}): Effect
        { return new Effect(cleanup => run(this, cleanup), options); }
        Dispose(): void { this.#resource.Dispose(); }
    }

    /** @name        Batch
     *  @public
     *  @type        {typeof Batch}
     *  @description Runtime class responsible for the Batch capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Batch
    {
        readonly #operations: Array<() => unknown> = [];

        Add(operation: () => unknown): this { this.#operations.push(operation); return this; }
        Run(): this
        {
            RunBatch(() => { for(const operation of this.#operations) operation(); });
            return this;
        }
        Clear(): this { this.#operations.length = 0; return this; }
        static Run<T>(operation: () => T): T { return RunBatch(operation); }
    }

    /** @name        Transaction
     *  @public
     *  @type        {typeof Transaction}
     *  @description Runtime class responsible for the Transaction capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Transaction
    {
        readonly #operations: Array<() => unknown> = [];
        #committed = false;

        Add(operation: () => unknown): this
        {
            if(this.#committed) throw new Error('Cannot add operations to a committed Transaction.');
            this.#operations.push(operation);
            return this;
        }
        Commit(): this
        {
            RunTransaction(() => { for(const operation of this.#operations) operation(); });
            this.#committed = true;
            return this;
        }
        Rollback(): this
        {
            if(this.#committed) throw new Error('A committed Transaction can only rollback by throwing inside Commit.');
            this.#operations.length = 0;
            return this;
        }
        Clear(): this { this.#operations.length = 0; this.#committed = false; return this; }
        static Run<T>(operation: () => T): T { return RunTransaction(operation); }
    }

    /** @name        Root
     *  @public
     *  @type        {typeof Root}
     *  @description Runtime class responsible for the Root capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Root<T = unknown>
    {
        readonly Value: T;
        #dispose: Cleanup = () => undefined;

        constructor(run: (Dispose: Cleanup) => T, name = 'Root')
        {
            this.Value = CreateRootPrimitive(dispose => { this.#dispose = dispose; return run(dispose); }, name);
        }

        Dispose(): void { this.#dispose(); }
        static Run<T>(run: (Dispose: Cleanup) => T, name = 'Root'): T { return CreateRootPrimitive(run, name); }
    }

    /** @name        Scope
     *  @public
     *  @type        {typeof Scope}
     *  @description Runtime class responsible for the Scope capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Scope<T = unknown>
    {
        readonly Value: T;
        constructor(run: () => T, owner: unknown = GetOwner())
        {
            this.Value = RunScopePrimitive(run, owner as Owner | null);
        }
        static Run<T>(run: () => T, owner: unknown = GetOwner()): T
        { return RunScopePrimitive(run, owner as Owner | null); }
    }

    /** @name        Selector
     *  @public
     *  @type        {typeof Selector}
     *  @description Runtime class responsible for the Selector capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Selector<T, K = T>
    {
        readonly #selector: SelectorContract<T, K>;
        constructor(source: () => T, equals: (key: K, value: T) => boolean = Object.is as (key: K, value: T) => boolean)
        { this.#selector = CreateSelector(source, equals); }
        get Value(): T { return this.#selector.Value; }
        Is(key: K): boolean { return this.#selector(key); }
    }

    /** @name        Deferred
     *  @public
     *  @type        {typeof Deferred}
     *  @description Runtime class responsible for the Deferred capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Deferred<T> extends ReadonlySignal<T>
    {
        constructor(source: () => T, timeout = 0)
        { super(CreateDeferredPrimitive(source, timeout)); }
    }

    /** @name        LinkedSignal
     *  @public
     *  @type        {typeof LinkedSignal}
     *  @description Runtime class responsible for the LinkedSignal capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class LinkedSignal<T> extends ReadonlySignal<T>
    {
        protected declare readonly Source: SignalContract<T>;
        constructor(source: () => T, write: (value: T) => void, options: SignalOptions<T> = {})
        { super(CreateLinkedSignalPrimitive(source, write, options)); }
        get Value(): T { return this.Source.Value; }
        set Value(value: T) { this.Source.Value = value; }
        Set(value: T | ((previous: T) => T)): this { this.Source.Set(value); return this; }
        Update(updater: (previous: T) => T): this { this.Source.Update(updater); return this; }
        Touch(): this { this.Source.Touch(); return this; }
        Readonly(): ReadonlySignal<T> { return new ReadonlySignal(this.Source.Readonly()); }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  DOM SINKS
    // ═════════════════════════════════════════════════════════════════════════

    export function BindText(source: ReadonlySignalContract<unknown> | (() => unknown), node: Text): Stop
    {
        const read = typeof source === 'function' ? source : () => source.Get();
        return CreateEffectPrimitive(() => { node.nodeValue = String(read() ?? ''); });
    }

    export function BindProperty<T extends object, K extends keyof T>(source: ReadonlySignalContract<T[K]> | (() => T[K]), target: T, key: K): Stop
    {
        const read = typeof source === 'function' ? source : () => source.Get();
        return CreateEffectPrimitive(() => { target[key] = read(); });
    }

    export function BindAttribute(source: ReadonlySignalContract<unknown> | (() => unknown), element: Element, name: string): Stop
    {
        const read = typeof source === 'function' ? source : () => source.Get();
        return CreateEffectPrimitive(() =>
        {
            const value = read();
            if(value === false || value == null) element.removeAttribute(name);
            else element.setAttribute(name, value === true ? '' : String(value));
        });
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  EVENTED REACTIVE FACADE
    // ═════════════════════════════════════════════════════════════════════════

    /** @name        Reactive
     *  @public
     *  @type        {typeof Reactive}
     *  @description Runtime class responsible for the Reactive capability.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export class Reactive<T extends object = object> extends EventTarget
    {
        readonly #raw: T;
        readonly #value: T;
        readonly #name: string;

        constructor(source: T, options: ReactiveOptions = {})
        {
            super();
            if(!IsObject(source)) throw new TypeError('Reactive requires an object source.');
            this.#raw = source;
            this.#name = options.Name ?? source.constructor?.name ?? 'Reactive';

            this.#value = ReactiveProxy(source,
                {
                    Root: source,
                    Path: [],
                    Shallow: options.Shallow ?? false,
                    Readonly: options.Readonly ?? false,
                    Emit: options.Events === false ? undefined : event => this.Fire(event),
                }) as T;
        }

        get Name(): string { return this.#name; }
        get Value(): T { return this.#value; }
        get Raw(): T { return this.#raw; }
        get Version(): number { return Version; }

        On(types: string, handler: (event: ChangeEvent) => void, options?: AddEventListenerOptions): this
        {
            const events = GetEvents();
            if(events) events.On(this, types, handler as unknown as EventListener, options);
            else for(const type of types.split(/[\s,|]+/).filter(Boolean)) this.addEventListener(type, handler as unknown as EventListener, options);
            return this;
        }

        Once(types: string, handler: (event: ChangeEvent) => void, options: AddEventListenerOptions = {}): this
        {
            return this.On(types, handler, { ...options, once: true });
        }

        Off(types: string, handler: (event: ChangeEvent) => void): this
        {
            const events = GetEvents();
            if(events) events.Off(this, types, handler as unknown as EventListener);
            else for(const type of types.split(/[\s,|]+/).filter(Boolean)) this.removeEventListener(type, handler as unknown as EventListener);
            return this;
        }

        Fire(event: ChangeEvent | string, detail: Partial<ChangeEvent> = {}): this
        {
            const descriptor: ChangeEvent = typeof event === 'string'
                ? {
                    Type: event,
                    Target: this.#raw,
                    Root: this.#raw,
                    Path: detail.Path ?? [],
                    Key: detail.Key ?? '',
                    Old: detail.Old,
                    New: detail.New,
                    Kind: detail.Kind ?? 'set',
                    Version,
                    Timestamp: Date.now(),
                }
                : event;

            const events = GetEvents();
            if(events) events.Fire(this, { Type: descriptor.Type, Detail: descriptor, Cancelable: false });
            else
            {
                const CE = globalThis.CustomEvent;
                if(typeof CE === 'function') this.dispatchEvent(new CE(descriptor.Type, { detail: descriptor }));
                else this.dispatchEvent(new Event(descriptor.Type));
            }
            return this;
        }

        Set<K extends keyof T>(key: K, value: T[K]): this
        {
            this.#value[key] = value;
            return this;
        }

        Patch(patch: Partial<T>): this
        {
            RunBatch(() => Object.assign(this.#value, patch));
            return this;
        }

        Update(mutation: (value: T) => void): this
        {
            RunBatch(() => mutation(this.#value));
            return this;
        }

        Select<K>(selector: (value: T) => K, options: SignalOptions<K> & EffectOptions = {}): Memo<K>
        {
            return new Memo(() => selector(this.#value), options);
        }

        Watch<K>(source: (value: T) => K, handler: WatchHandler<K>, options: WatchOptions<K> = {}): Watch<K>
        {
            return new Watch(() => source(this.#value), handler, options);
        }

        Effect(fn: (value: T, OnCleanup: (cleanup: Cleanup) => void) => void, options: EffectOptions = {}): Effect
        {
            return new Effect(cleanup => fn(this.#value, cleanup), options);
        }

        Batch(fn: (value: T) => unknown): this
        {
            RunBatch(() => fn(this.#value));
            return this;
        }

        Transaction(fn: (value: T) => unknown): this
        {
            RunTransaction(() => fn(this.#value));
            return this;
        }

        static #Build(): void
        {
            try { Object.defineProperty(this, 'name', { value: 'Reactive', configurable: true }); }
            catch { /* frozen constructor */ }

            if(typeof window !== 'undefined' && !Object.prototype.hasOwnProperty.call(window, 'Reactive'))
                Object.defineProperty(window, 'Reactive', { value: this, enumerable: true, writable: false, configurable: false });
        }

        static { this.#Build(); }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  FUNCTIONAL FACTORIES — OPTIONAL COMPLEMENT TO THE NOMINAL API
    // ═════════════════════════════════════════════════════════════════════════

    export function CreateReactive<T extends object>(source: T, options: ReactiveOptions = {}): Reactive<T>
    { return new Reactive(source, options); }

    export function CreateEffect(run: (OnCleanup: (cleanup: Cleanup) => void) => void, options: EffectOptions = {}): Effect
    { return new Effect(run, options); }

    export function CreateWatch<T>(source: () => T, handler: WatchHandler<T>, options: WatchOptions<T> = {}): Watch<T>
    { return new Watch(source, handler, options); }

    export function CreateReaction(invalidate: () => void, options: EffectOptions = {}): Reaction
    { return new Reaction(invalidate, options); }

    export function CreateResource<T, S = unknown>(fetcher: ResourceFetcher<T, S>, source?: () => S, options: ResourceOptions<T> = {}): Resource<T, S>
    { return new Resource(fetcher, source, options); }

    // ═════════════════════════════════════════════════════════════════════════
    //  DIAGNOSTICS AND SERVICE REGISTRATION
    // ═════════════════════════════════════════════════════════════════════════

    export function Inspect(): Snapshot
    {
        return {
            Effects: Computations.size,
            Signals: SignalSequence,
            Proxies: 0, // WeakMaps are intentionally non-enumerable.
            Scheduled: Pending.size + Microtasks.size + Frames.size + Idles.size,
            BatchDepth,
            Version,
        };
    }

    export const API = Object.freeze(
        {
            /* Nominal constructors */
            Reactive,
            Signal,
            ReadonlySignal,
            Memo,
            Effect,
            Watch,
            Reaction,
            Resource,
            Batch,
            Transaction,
            Root,
            Scope,
            Selector,
            Deferred,
            LinkedSignal,

            /* Optional functional factories */
            CreateReactive,
            CreateSignal,
            CreateMemo,
            CreateEffect,
            CreateWatch,
            CreateReaction,
            CreateResource,

            Proxy: Object.freeze(
                {
                    Create: ReactiveObject,
                    Shallow,
                    Readonly,
                    MarkRaw,
                    IsProxy,
                    IsReactive,
                    IsReadonly,
                    ToRaw,
                }),

            Runtime: Object.freeze(
                {
                    RunBatch,
                    RunTransaction,
                    Untrack,
                    Flush,
                    NextTick,
                    GetOwner,
                    OnCleanup,
                    OnError,
                    Computed,
                    WatchEffect,
                }),

            Ownership: Object.freeze(
                {
                    Provide,
                    Inject,
                    Traverse,
                }),

            Bind: Object.freeze(
                {
                    Text: BindText,
                    Property: BindProperty,
                    Attribute: BindAttribute,
                }),

            Interop: Object.freeze(
                {
                    From,
                }),

            Inspect,
        });

    new Core.Services.Service('reactivity', API);

    if(typeof window !== 'undefined' && !Object.prototype.hasOwnProperty.call(window, 'Reactivity'))
        Object.defineProperty(window, 'Reactivity', { value: Reactivity, writable: false, enumerable: false, configurable: false });
}

export import Reactive = Reactivity.Reactive;
export default Reactive;
