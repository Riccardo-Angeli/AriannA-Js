/**
 * @module    core/reactivity/Reactive
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA minimal reactive kernel. Only base Signals, direct invalidation and Array structural reactivity live here.
 *              Full object reactivity, Memo/Watch/Resource/ownership live in Reactivity.ts.
 */

import type { Types } from '../definitions/Types.ts';
import type { Interfaces } from '../definitions/Interfaces.ts';
import { Services } from '../kernel/Services.ts';

export namespace Reactive
{
    export type Key = PropertyKey;
    export type Equality<T> = false | ((previous: T, next: T) => boolean);
    export type DirectInvalidator = (key?: PropertyKey) => void;

    export enum Durability
    {
        Low = 0,
        Normal = 1,
        High = 2,
        Static = 3
    }

    export interface SignalOptions<T>
    {
        Equals?: Equality<T>;
        Durability?: Durability;
    }

    export interface Signal<T>
    {
        Value: T;
        readonly Durability: Durability;
        Get(): T;
        Peek(): T;
        Set(value: T | ((previous: T) => T)): T;
        Subscribe(handler: (value: T, previous: T) => void): () => void;
    }

    export interface ArrayOptions
    {
        /** Optional FULL-reactivity element reader. The kernel never proxies row objects itself. */
        Read?: (value: unknown, key: PropertyKey) => unknown;
        Normalize?: (value: unknown) => unknown;
        Readonly?: boolean;
        /** Called immediately before a structural mutation. FULL Reactivity uses this for transactional snapshots. */
        BeforeMutate?: (target: unknown[]) => void;
    }

    export interface EffectHandle
    {
        Active: boolean;
        Run(): void;
        Dispose(): void;
        Stop(): void;
    }

    export interface ReactionHandle extends EffectHandle
    {
        Track(operation: () => void): void;
    }

    export type ArrayOperation = Types.Reactivity.ArrayOperation;

    /** Direct imperative array consumer. No event/oplog object is allocated. */
    export type ArraySink = Interfaces.Reactivity.ArraySink;


    class Source
    {
        private One: DirectInvalidator | null = null;
        private Many: Set<DirectInvalidator> | null = null;

        Add(value: DirectInvalidator): void
        {
            if(this.Many)
            {
                this.Many.add(value);
                return;
            }
            if(!this.One)
            {
                this.One = value;
                return;
            }
            if(this.One === value) return;
            this.Many = new Set([this.One, value]);
            this.One = null;
        }

        Delete(value: DirectInvalidator): void
        {
            const many = this.Many;
            if(many)
            {
                many.delete(value);
                if(many.size === 1)
                {
                    this.One = many.values().next().value ?? null;
                    this.Many = null;
                }
                return;
            }
            if(this.One === value) this.One = null;
        }

        Emit(key?: PropertyKey): void
        {
            const one = this.One;
            if(one)
            {
                one(key);
                return;
            }
            const many = this.Many;
            if(!many) return;
            for(const subscriber of many) subscriber(key);
        }
    }

    let ActiveObserver: DirectInvalidator | null = null;
    let ActiveDependencies: Set<Source> | null = null;

    const RawToProxy = new WeakMap<object, object>();
    const ProxyToRaw = new WeakMap<object, object>();
    const ProxyOptions = new WeakMap<object, ArrayOptions>();
    const Sources = new WeakMap<object, Source>();
    const ArraySinks = new WeakMap<object, ArraySink | Set<ArraySink>>();

    const Revisions = new Uint32Array(4);

    const Empty: readonly unknown[] = Object.freeze([] as unknown[]);

    function Raw<T>(value: T): T
    {
        return (value && (typeof value === 'object' || typeof value === 'function'))
            ? ((ProxyToRaw.get(value as object) as T | undefined) ?? value)
            : value;
    }

    function Normalize(owner: unknown, value: unknown): unknown
    {
        const options = owner && typeof owner === 'object'
            ? ProxyOptions.get(owner as object)
            : undefined;
        return options?.Normalize ? options.Normalize(value) : Raw(value);
    }

    function SourceOf(target: object): Source
    {
        let source = Sources.get(target);
        if(!source) Sources.set(target, source = new Source());
        return source;
    }

    function TrackSource(source: Source): void
    {
        if(!ActiveObserver || !ActiveDependencies) return;
        source.Add(ActiveObserver);
        ActiveDependencies.add(source);
    }

    function Touch(tier: Durability): void
    {
        for(let index = 0; index <= tier; index++) Revisions[index]++;
    }

    function EmitArray
    (
        target      : object,
        operation   : ArrayOperation,
        index       : number,
        deleteCount : number,
        added       : readonly unknown[] = Empty,
        removed     : readonly unknown[] = Empty
    ): void
    {
        const slot = ArraySinks.get(target);
        if(!slot) return;
        if(slot instanceof Set)
        {
            for(const sink of slot) sink(operation, index, deleteCount, added, removed);
            return;
        }
        slot(operation, index, deleteCount, added, removed);
    }

    function BeforeMutate(receiver: object, target: unknown[]): void
    {
        ProxyOptions.get(receiver)?.BeforeMutate?.(target);
    }

    const ArrayMethods: Record<string, Function> =
    {
        /**
         * Identity searches are the only non-mutating Array methods specialized here.
         *
         * The backing Array stores raw values while indexed reads may expose reactive
         * wrappers. Normalizing the searched value preserves Array identity semantics
         * without routing ordinary object reactivity through this core.
         */
        includes(this: unknown[], value: unknown, fromIndex?: number): boolean
        {
            const target = Raw(this);
            const needle = Normalize(this, value);

            if(Array.prototype.includes.call(target, needle, fromIndex)) return true;
            if(needle === null || (typeof needle !== 'object' && typeof needle !== 'function')) return false;

            const length = target.length;
            let index = Number(fromIndex ?? 0);
            if(Number.isNaN(index)) index = 0;
            if(index < 0) index = Math.max(length + Math.trunc(index), 0);
            else index = Math.trunc(index);

            for(; index < length; index++)
            {
                if(Object.is(Normalize(this, target[index]), needle)) return true;
            }
            return false;
        },

        indexOf(this: unknown[], value: unknown, fromIndex?: number): number
        {
            const target = Raw(this);
            const needle = Normalize(this, value);
            const direct = Array.prototype.indexOf.call(target, needle, fromIndex);
            if(direct >= 0) return direct;
            if(needle === null || (typeof needle !== 'object' && typeof needle !== 'function')) return -1;

            const length = target.length;
            let index = Number(fromIndex ?? 0);
            if(Number.isNaN(index)) index = 0;
            if(index < 0) index = Math.max(length + Math.trunc(index), 0);
            else index = Math.trunc(index);

            for(; index < length; index++)
            {
                if(Normalize(this, target[index]) === needle) return index;
            }
            return -1;
        },

        lastIndexOf(this: unknown[], value: unknown, fromIndex?: number): number
        {
            const target = Raw(this);
            const needle = Normalize(this, value);
            const direct = fromIndex === undefined
                ? Array.prototype.lastIndexOf.call(target, needle)
                : Array.prototype.lastIndexOf.call(target, needle, fromIndex);
            if(direct >= 0) return direct;
            if(needle === null || (typeof needle !== 'object' && typeof needle !== 'function')) return -1;

            const length = target.length;
            let index = fromIndex === undefined ? length - 1 : Number(fromIndex);
            if(Number.isNaN(index)) index = 0;
            index = Math.trunc(index);
            if(index < 0) index = length + index;
            else index = Math.min(index, length - 1);

            for(; index >= 0; index--)
            {
                if(Normalize(this, target[index]) === needle) return index;
            }
            return -1;
        },

        push(this: unknown[], ...values: unknown[]): number
        {
            const target = Raw(this);
            BeforeMutate(this, target);
            const index = target.length;
            const added = values.map(value => Normalize(this, value));
            const result = Array.prototype.push.apply(target, added);
            Touch(Durability.Normal);
            SourceOf(target).Emit('length');
            EmitArray(target, 'push', index, 0, added);
            return result;
        },

        pop(this: unknown[]): unknown
        {
            const target = Raw(this);
            BeforeMutate(this, target);
            if(target.length === 0) return undefined;
            const index = target.length - 1;
            const value = Array.prototype.pop.call(target);
            Touch(Durability.Normal);
            SourceOf(target).Emit('length');
            EmitArray(target, 'pop', index, 1, Empty, [value]);
            return value;
        },

        shift(this: unknown[]): unknown
        {
            const target = Raw(this);
            BeforeMutate(this, target);
            if(target.length === 0) return undefined;
            const value = Array.prototype.shift.call(target);
            Touch(Durability.Normal);
            SourceOf(target).Emit('length');
            EmitArray(target, 'shift', 0, 1, Empty, [value]);
            return value;
        },

        unshift(this: unknown[], ...values: unknown[]): number
        {
            const target = Raw(this);
            BeforeMutate(this, target);
            const added = values.map(value => Normalize(this, value));
            const result = Array.prototype.unshift.apply(target, added);
            Touch(Durability.Normal);
            SourceOf(target).Emit('length');
            EmitArray(target, 'unshift', 0, 0, added);
            return result;
        },

        splice(this: unknown[], start: number, deleteCount?: number, ...values: unknown[]): unknown[]
        {
            const target = Raw(this);
            BeforeMutate(this, target);
            const length = target.length;
            const index = start < 0 ? Math.max(length + start, 0) : Math.min(start, length);
            const count = deleteCount === undefined ? length - index : Math.max(0, Math.min(deleteCount, length - index));
            const added = values.map(value => Normalize(this, value));
            const removed = Array.prototype.splice.apply(target, [index, count, ...added]) as unknown[];
            Touch(Durability.Normal);
            SourceOf(target).Emit('length');
            EmitArray(target, 'splice', index, count, added, removed);
            return removed;
        },

        reverse(this: unknown[]): unknown[]
        {
            const target = Raw(this);
            BeforeMutate(this, target);
            Array.prototype.reverse.call(target);
            Touch(Durability.Normal);
            SourceOf(target).Emit();
            EmitArray(target, 'reverse', 0, 0);
            return this;
        },

        sort(this: unknown[], compare?: (a: unknown, b: unknown) => number): unknown[]
        {
            const target = Raw(this);
            BeforeMutate(this, target);
            Array.prototype.sort.call(target, compare);
            Touch(Durability.Normal);
            SourceOf(target).Emit();
            EmitArray(target, 'sort', 0, 0);
            return this;
        },

        fill(this: unknown[], value: unknown, start?: number, end?: number): unknown[]
        {
            const target = Raw(this);
            BeforeMutate(this, target);
            Array.prototype.fill.call(target, Normalize(this, value), start, end);
            Touch(Durability.Normal);
            SourceOf(target).Emit();
            EmitArray(target, 'fill', start ?? 0, 0, [Normalize(this, value)]);
            return this;
        },

        copyWithin(this: unknown[], targetIndex: number, start: number, end?: number): unknown[]
        {
            const target = Raw(this);
            BeforeMutate(this, target);
            Array.prototype.copyWithin.call(target, targetIndex, start, end);
            Touch(Durability.Normal);
            SourceOf(target).Emit();
            EmitArray(target, 'copyWithin', targetIndex, 0);
            return this;
        }
    };

    export function ToRaw<T>(value: T): T { return Raw(value); }

    export function Revision(tier: Durability = Durability.Normal): number
    {
        return Revisions[tier];
    }

    export function RevisionUnchanged(tier: Durability, snapshot: number): boolean
    {
        return Revisions[tier] === snapshot;
    }

    export function AttachDirectInvalidator(target: object, invalidator: DirectInvalidator): () => void
    {
        const raw = Raw(target);
        const source = SourceOf(raw);
        source.Add(invalidator);
        return () => source.Delete(invalidator);
    }

    export const RegisterDirectInvalidator = AttachDirectInvalidator;

    export function DetachDirectInvalidator(target: object, invalidator: DirectInvalidator): void
    {
        Sources.get(Raw(target))?.Delete(invalidator);
    }

    /** FULL Reactivity calls this after a normal object property mutation. */
    export function NotifyDirect(target: object, key?: PropertyKey): boolean
    {
        const source = Sources.get(Raw(target));
        if(!source) return false;
        source.Emit(key);
        return true;
    }

    /** Compatibility names used by the compiled Template fast path. */
    export type CollectionPrimitiveSink = ArraySink;

    export function RegisterCollectionInvalidator(target: object, sink: ArraySink): () => void
    {
        const raw = Raw(target);
        const current = ArraySinks.get(raw);
        if(!current) ArraySinks.set(raw, sink);
        else if(current instanceof Set) current.add(sink);
        else if(current !== sink) ArraySinks.set(raw, new Set([current, sink]));

        return () =>
        {
            const slot = ArraySinks.get(raw);
            if(!slot) return;
            if(slot instanceof Set)
            {
                slot.delete(sink);
                if(slot.size === 0) ArraySinks.delete(raw);
                else if(slot.size === 1) ArraySinks.set(raw, slot.values().next().value!);
            }
            else if(slot === sink) ArraySinks.delete(raw);
        };
    }

    export const RegisterCollectionPrimitive = RegisterCollectionInvalidator;

    export function CreateSignal<T>(initial: T, options: SignalOptions<T> = {}): Signal<T>
    {
        let value = initial;
        const source = new Source();
        const equals = options.Equals;
        const durability = options.Durability ?? Durability.Normal;
        const subscribers = new Set<(value: T, previous: T) => void>();

        const signal: Signal<T> =
        {
            get Value(): T { return signal.Get(); },
            set Value(next: T) { signal.Set(next); },
            Durability: durability,
            Get(): T
            {
                TrackSource(source);
                return value;
            },
            Peek(): T { return value; },
            Set(next: T | ((previous: T) => T)): T
            {
                const resolved = typeof next === 'function'
                    ? (next as (previous: T) => T)(value)
                    : next;
                const same = equals === false ? false : (equals ?? Object.is)(value, resolved);
                if(same) return value;
                const previous = value;
                value = resolved;
                Touch(durability);
                source.Emit();
                for(const subscriber of subscribers) subscriber(value, previous);
                return value;
            },
            Subscribe(handler: (value: T, previous: T) => void): () => void
            {
                subscribers.add(handler);
                return () => subscribers.delete(handler);
            }
        };
        return signal;
    }

    function CreateTrackedEffect(operation: () => void, defer: boolean): EffectHandle
    {
        let active = true;
        let running = false;
        let dependencies = new Set<Source>();
        const notify = (): void => { if(active && !running) handle.Run(); };
        const handle: EffectHandle =
        {
            get Active(): boolean { return active; },
            set Active(value: boolean) { active = value; },
            Run(): void
            {
                if(!active || running) return;
                running = true;
                for(const source of dependencies) source.Delete(notify);
                dependencies = new Set<Source>();
                const previousObserver = ActiveObserver;
                const previousDependencies = ActiveDependencies;
                ActiveObserver = notify;
                ActiveDependencies = dependencies;
                try { operation(); }
                finally
                {
                    ActiveObserver = previousObserver;
                    ActiveDependencies = previousDependencies;
                    running = false;
                }
            },
            Dispose(): void
            {
                if(!active) return;
                active = false;
                for(const source of dependencies) source.Delete(notify);
                dependencies.clear();
            },
            Stop(): void { handle.Dispose(); }
        };
        if(!defer) handle.Run();
        return handle;
    }

    export function CreateEffect(operation: () => void): EffectHandle
    {
        return CreateTrackedEffect(operation, false);
    }

    export function CreateReaction(invalidate: () => void): ReactionHandle
    {
        let tracked: (() => void) | null = null;
        const effect = CreateTrackedEffect(() => tracked?.(), true);
        const reaction = effect as ReactionHandle;
        reaction.Track = (operation: () => void): void =>
        {
            tracked = operation;
            effect.Run();
        };
        const baseRun = effect.Run.bind(effect);
        let first = true;
        effect.Run = (): void =>
        {
            if(first)
            {
                first = false;
                baseRun();
                return;
            }
            invalidate();
        };
        reaction.Track = (operation: () => void): void =>
        {
            tracked = operation;
            first = true;
            effect.Run();
        };
        return reaction;
    }

    function IsArrayIndex(key: PropertyKey): boolean
    {
        return typeof key === 'string' && /^\d+$/.test(key);
    }

    /**
     * Kernel reactivity is intentionally Array-only. Objects are returned unchanged.
     * FULL Reactivity may provide Read() so indexed rows are wrapped by its normal object layer.
     */
    export function ReactiveObject<T extends object>(source: T, options: ArrayOptions = {}): T
    {
        const raw = Raw(source);
        if(!Array.isArray(raw)) return source;

        const cached = RawToProxy.get(raw);
        if(cached)
        {
            const current = ProxyOptions.get(cached) ?? {};
            if(options.Read) current.Read = options.Read;
            if(options.Normalize) current.Normalize = options.Normalize;
            if(options.Readonly) current.Readonly = true;
            if(options.BeforeMutate) current.BeforeMutate = options.BeforeMutate;
            ProxyOptions.set(cached, current);
            return cached as T;
        }

        const proxy = new Proxy(raw,
        {
            get(target, key, receiver)
            {
                if(typeof key === 'string' && key in ArrayMethods)
                    return Reflect.get(ArrayMethods, key).bind(receiver);

                const value = Reflect.get(target, key, receiver);
                if(IsArrayIndex(key))
                {
                    const read = ProxyOptions.get(receiver as object)?.Read;
                    return read ? read(value, key) : value;
                }
                if(key === 'length') TrackSource(SourceOf(target));
                return value;
            },

            set(target, key, next, receiver)
            {
                if(ProxyOptions.get(receiver as object)?.Readonly)
                    throw new TypeError(`Readonly reactive Array property: ${String(key)}.`);

                BeforeMutate(receiver as object, target);
                const previous = Reflect.get(target, key, target);
                const value = Normalize(receiver, next);
                if(Object.is(previous, value)) return true;
                const oldLength = target.length;
                const result = Reflect.set(target, key, value, target);
                if(!result) return false;

                Touch(Durability.Normal);
                SourceOf(target).Emit(key);

                if(key === 'length')
                {
                    const length = Number(value);
                    if(length < oldLength) EmitArray(target, length === 0 ? 'clear' : 'truncate', length, oldLength - length);
                }
                else if(IsArrayIndex(key))
                {
                    const index = Number(key);
                    EmitArray(target, previous === undefined ? 'add' : 'set', index, previous === undefined ? 0 : 1, [value], previous === undefined ? Empty : [previous]);
                }
                return true;
            },

            deleteProperty(target, key)
            {
                if(!Reflect.has(target, key)) return true;
                const proxy = RawToProxy.get(target);
                if(proxy) BeforeMutate(proxy, target);
                const previous = Reflect.get(target, key);
                const result = Reflect.deleteProperty(target, key);
                if(!result) return false;
                Touch(Durability.Normal);
                SourceOf(target).Emit(key);
                if(IsArrayIndex(key)) EmitArray(target, 'delete', Number(key), 1, Empty, [previous]);
                return true;
            }
        });

        RawToProxy.set(raw, proxy);
        ProxyToRaw.set(proxy, raw);
        ProxyOptions.set(proxy, { ...options });
        return proxy as T;
    }

    export const API = Object.freeze({
        Durability,
        CreateSignal,
        CreateEffect,
        CreateReaction,
        ReactiveObject,
        ToRaw,
        AttachDirectInvalidator,
        DetachDirectInvalidator,
        NotifyDirect,
        RegisterDirectInvalidator,
        RegisterCollectionInvalidator,
        Revision,
        RevisionUnchanged
    });

    new Services.Service('reactive', API);
}

export default Reactive;
