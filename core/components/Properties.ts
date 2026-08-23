import type { Types }      from '../definitions/Types.ts';
import type { Interfaces } from '../definitions/Interfaces.ts';
import { Reals } from '../dom/Real.ts';

/** @namespace   Properties
 *  @memberof    Core
 *  @description Enhanced property subsystem. A single grammar `Descriptor` (declaration keys all
 *               lowercase; `native` is the ES5 PropertyDescriptor) drives runtime `type`
 *               (`Types.Type`) / `validate` filtering, `transform`/`prefix`/`suffix`, the
 *               `observable` lifecycle (before/changing/changed/after events), declarative custom
 *               `event`s, inter-object `bindings` (one/two-way), and `functions` (before/after run
 *               hooks). All emission goes through `Events`. Replaces the legacy Grammar/Parse
 *               engine and the former Options/BindSpec/ObservableSpec/*Detail interfaces.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license)
 *
 *  @test        Smoke Test — whole Syntax (native/type/observable/event/bindings two-way/functions)
 *               const p = new Core.Properties.Property<number>
 *               (
 *                   'Volume',
 *                   {
 *                      native: { value: 50, enumerable: true },
 *                      type: 'integer', validate: v => v >= 0 && v <= 100,
 *                      observable: { changed: 'VolumeChanged' },
 *                      event: { type: 'VolumePeak', arguments: { threshold: 90 } },
 *                      bindings: { grid: { ways: 'TwO', targets: [], attributes: ['data-volume'] } },
 *                      functions:
 *                      {
 *                          start: { point: 'before', run: b => { void b.Count; return true; } },
 *                          end: { point: 'after', run: () => {} }
 *                      },
 *                    }
 *                );
 *
 *                p.OnChanged(c => { void `${c.Value.Old}->${c.Value.New}`; });
 *                p.Install([{}, {}]).Fire({ ts: Date.now() });
 */
export namespace Properties
{
    /** @name        Primitive
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Primitive.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Primitive             = Types.Properties.Primitive;
    /** @name        Type
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Type.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Type                  = Types.Properties.Type;
    /** @name        Ways
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Ways.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Ways                  = Types.Properties.Ways;
    /** @name        Bindings
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Bindings.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Bindings              = Types.Properties.Bindings;
    /** @name        Functions
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Functions.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Functions             = Types.Properties.Functions;
    /** @name        Hosts
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Hosts.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Hosts                 = Types.Properties.Hosts;
    /** @name        Change
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Change.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Change<T = unknown>   = Interfaces.Properties.Change<T>;
    /** @name        Batch
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Batch.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Batch<T = unknown>    = Interfaces.Properties.Batch<T>;
    /** @name        Signal
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Signal.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Signal<T>             = Interfaces.Properties.Signal<T>;
    /** @name        Reactive
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Reactive.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Reactive              = Interfaces.Properties.Reactive;
    /** @name        Native
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Native.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Native<T = unknown>   = Interfaces.Properties.Native<T>;
    /** @name        Observable
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Observable.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Observable            = Interfaces.Properties.Observable;
    /** @name        EventDescriptor
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for EventDescriptor.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type EventDescriptor       = Interfaces.Properties.Event;
    /** @name        Binding
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Binding.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Binding               = Interfaces.Properties.Binding;
    /** @name        Hook
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for Hook.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type Hook                  = Interfaces.Properties.Hook;
    /** @name        PropertyDescriptor
     *  @public
     *  @type        {type alias}
     *  @description Canonical type alias for PropertyDescriptor.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export type PropertyDescriptor<T = unknown> = Interfaces.Properties.PropertyDescriptor<T>;

    // ── The Property class ───────────────────────────────────────────────────────
    /** @class Property
     *  @memberof Core.Properties
     *  @template T
     *  @classdesc Grammar-driven enhanced property. Build with a Descriptor,
     *             Install on one host or a list (before → per-host changing/commit/changed → after).
     *             Emits via Events, fires sealed custom events, keeps bindings in sync (one/two-way).
     *  @author    Riccardo Angeli
     *  @copyright Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license   MIT / Commercial (dual license) */
    export class Property<T = unknown>
    {
        /** @name        #reactive
         *  @private
         *  @static
         *  @type        {Reactive | null}
         *  @description Optional reactive backend used by bindings configured with `Signal`, `Observable`, or
         *               `Proxy`. It remains `null` until an addon explicitly registers a provider.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static #provider: Reactive | null = null;

        /** @name        UseReactive
         *  @public
         *  @static
         *  @param       {Reactive} provider Reactive backend implementation.
         *  @returns     {typeof Property} The Property constructor.
         *  @description Register the optional reactive backend used by every Property instance. The method returns
         *               the constructor to preserve a fluent static configuration API.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static UseReactive(provider: Reactive): typeof Property
        {
            Property.#provider = provider; // <- QUI

            return Property;
        }

        /** @name        HasReactive
         *  @public
         *  @static
         *  @returns     {boolean} Whether a reactive backend has been registered.
         *  @description Report whether reactive Property bindings are currently available.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static HasReactive(): boolean
        {
            return Property.#provider !== null;
        }

        // ── Optional Core dependencies, resolved at RUNTIME (no static import → avoids the
        //    Core↔Properties circular dependency). Each falls back so Properties stays independent:
        //    Events → native DOM events; Core.Scopes.Readonly → a standalone descriptor. ──
        /** @name #Core @private @static @description The kernel, if present on the global (else undefined). */
        static get #Core(): { Events?: { Event?: { Fire?: (t: unknown, e: unknown) => boolean; On?: (t: EventTarget, ty: string, cb: EventListener) => unknown } }; Scopes?: { Readonly?: globalThis.PropertyDescriptor } } | undefined
        { return (globalThis as { Core?: unknown }).Core as never; }

        /** @name #Readonly @private @static @description `Core.Scopes.Readonly` if present, else a standalone equivalent. */
        static get #Readonly(): globalThis.PropertyDescriptor
        { return Property.#Core?.Scopes?.Readonly ?? { configurable: false, enumerable: true, writable: false }; }

        /** @name #Fire @private @static @description Emit via `Events` (single SOT channel) when present, else native `dispatchEvent` per target. */
        static #Fire(target: EventTarget | EventTarget[], type: string, detail: Record<string, unknown>, cancelable: boolean, bubbles: boolean): boolean
        {
            const F = Property.#Core?.Events?.Event?.Fire;
            if (F) { try { return F(target, { Type: type, Detail: detail, Cancelable: cancelable, Propagation: bubbles }); } catch { /* fall back to native */ } }
            const list = Array.isArray(target) ? target : [target];
            let ok = true;
            for (const t of list) if (t && typeof t.dispatchEvent === 'function') ok = t.dispatchEvent(new CustomEvent(type, { detail, cancelable, bubbles })) && ok;
            return ok;
        }

        /** @name #On @private @static @description Subscribe via `Events` when present, else native `addEventListener`. */
        static #On(target: EventTarget, type: string, cb: EventListener): void
        {
            const O = Property.#Core?.Events?.Event?.On;
            if (O) { try { O(target, type, cb); return; } catch { /* fall back to native */ } }
            target.addEventListener(type, cb);
        }
        /** @name Name @public @readonly @type {string} @description Accessor key + base of the event names. @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        readonly Name       : string;
        /** @name Descriptor @public @readonly @type {Readonly<Descriptor<T>>} @description Frozen descriptor sealed at declaration. @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        readonly Descriptor : Readonly<PropertyDescriptor<T>>;

        #value   : T;
        #hosts                 = new Set<WeakRef<object>>();
        #index      = new WeakMap<object, WeakRef<object>>();
        #finalizer = new FinalizationRegistry<WeakRef<object>>
        (ref => { this.#hosts.delete(ref); });
        #target  : EventTarget;
        #names   : { before: string; changing: string; changed: string; after: string };
        #syncing = false;                                   // re-entrancy guard for two-way

        /** @name constructor @public @description Seal the descriptor, seed the value from native.value/get, resolve the event target + four event names. @param {string} name Property name. @param {Descriptor<T>} descriptor Grammar descriptor. @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        constructor(name: string, descriptor: PropertyDescriptor<T> = {})
        {
            this.Name       = name;
            this.Descriptor = Object.freeze({ ...descriptor });
            this.#value     = (descriptor.native?.value ?? descriptor.native?.get?.()) as T;
            const o         = typeof descriptor.observable === 'object' ? descriptor.observable : {};
            this.#target    = o.target ?? new EventTarget();
            this.#names     = { before: o.before ?? `Before${name}Changing`, changing: o.changing ?? `${name}Changing`, changed: o.changed ?? `${name}Changed`, after: o.after ?? `After${name}Changed` };
        }

        /** @name Get @public @description Read the current value. @returns {T} The value. @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        Get(): T { return this.#value; }

        /** @name Set @public @description transform → prefix/suffix → type → validate → changing (cancelable) → commit → bindings → changed. @param {T} value Candidate. @returns {boolean} Applied or rejected. @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        Set(value: T): boolean
        {
            const d = this.Descriptor, old = this.#value;
            let next: T = value;
            if (d.transform) next = d.transform(next);
            if (d.prefix !== undefined || d.suffix !== undefined) next = ((d.prefix ?? '') + String(next) + (d.suffix ?? '')) as unknown as T;
            if (d.type !== undefined && !Property.#matches(next, d.type)) return false;
            if (d.validate && !d.validate(next)) return false;
            if (Object.is(old, next)) return true;

            if (d.observable) {
                const change: Change<T> = { Name: this.Name, Value: { Old: old, New: next }, Descriptor: d };
                if (!this.#emit(this.#names.changing, change, this.#cancelable, this.#propagation) && this.#cancelable) return false;
                if (change.Override !== undefined) next = change.Override;
            }

            this.#value = next;
            for (const ref of this.#hosts)
            {
                const h = ref.deref();
                if (h === undefined) {
                    this.#hosts.delete(ref);
                    continue;
                }
                this.#sync(h, next);
            }

            if (d.observable)
                this.#emit(this.#names.changed, { Name: this.Name, Value: { Old: old, New: next }, Descriptor: d } as Change<T>, false, this.#propagation);
            return true;
        }

        /** @name Install @public @description Apply to one host OR a list/array: before (once) → per-host → after (once). @param {Hosts} hosts Host(s). @returns {this} @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        Install(hosts: Hosts): this
        {
            const list: object[] = Property.#toArray(hosts);
            const batch: Batch<T> = { Name: this.Name, Hosts: list, Count: list.length, Descriptor: this.Descriptor };

            if (this.#hooks('before', batch) === false) return this;
            this.#emit(this.#names.before, batch, false, false);

            for (const host of list) this.#installOne(host);

            this.#emit(this.#names.after, batch, false, false);
            this.#hooks('after', batch);
            return this;
        }

        /** @name Fire @public @description Dispatch the declared custom event(s) via Events, sealing declared arguments as readonly detail props. @param {Record<string, unknown>=} extra Extra mutable detail. @returns {this} @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        Fire(extra?: Record<string, unknown>): this
        {
            const events = this.Descriptor.event ? (Array.isArray(this.Descriptor.event) ? this.Descriptor.event : [this.Descriptor.event]) : [];
            for (const ev of events)
            {
                const detail: Record<string, unknown> = { Name: this.Name, Value: this.#value, ...extra };
                for (const k of Object.keys(ev.arguments ?? {})) Object.defineProperty(detail, k, { value: ev.arguments![k], ...Property.#Readonly });
                const targets = (ev.targets && ev.targets.length ? ev.targets : [this.#target]) as unknown as EventTarget[];
                Property.#Fire(targets, ev.type, detail, ev.cancelable ?? false, ev.propagation ?? false);
            }
            return this;
        }

        /** @name OnChanging @public @description Subscribe to the pre-assign (cancelable) changing event. @param {(change: { Name: string; Value: { Old: T; New: T } }, ev: NativeEvent) => void} cb Listener. @returns {this} @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        OnChanging(cb: (change: Change<T>, ev: Event) => void): this { return this.#on(this.#names.changing, cb); }
        /** @name OnChanged @public @description Subscribe to the post-assign changed event. @param {(change: { Name: string; Value: { Old: T; New: T } }, ev: NativeEvent) => void} cb Listener. @returns {this} @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        OnChanged(cb: (change: Change<T>, ev: Event) => void): this { return this.#on(this.#names.changed, cb); }

        /** @name Target @public @readonly @type {EventTarget} @description Internal EventTarget for advanced subscription. @author Riccardo Angeli @copyright Riccardo Angeli 2012-2026 All Rights Reserved @license MIT / Commercial (dual license) */
        get Target(): EventTarget { return this.#target; }

        // ── private ─────────────────────────────────────────────────────────────
        get #cancelable(): boolean  { const o = this.Descriptor.observable; return typeof o === 'object' ? (o.cancelable ?? true) : true; }
        get #propagation(): boolean { const o = this.Descriptor.observable; return typeof o === 'object' ? (o.propagation ?? false) : false; }

        #installOne(host: object): void
        {
            const self = this, n = this.Descriptor.native ?? {};
            Object.defineProperty(host, this.Name, {
                enumerable  : n.enumerable   ?? true,
                configurable: n.configurable ?? true,
                get: n.get ?? ((): T => self.#value),
                set: n.set ?? ((v: T): void => { self.Set(v); }),
            });
            if (!this.#index.has(host)) {          // dedup by host identity — one WeakRef per live host
                const ref = new WeakRef(host);
                this.#index.set(host, ref);
                this.#hosts.add(ref);
                this.#finalizer.register(host, ref);
            }
            this.#sync(host, this.#value);
        }

        #on(type: string, cb: (change: Change<T>, ev: Event) => void): this
        { Property.#On(this.#target, type, ((e: Event) => cb((e as CustomEvent<Change<T>>).detail, e)) as EventListener); return this; }

        /** Emit via Events (single channel) + local dispatch for cancel semantics. */
        #emit(type: string, detail: unknown, cancelable: boolean, bubbles: boolean): boolean
        {
            const F = Property.#Core?.Events?.Event?.Fire;
            if (F) { try { F(this.#target, { Type: type, Detail: detail as Record<string, unknown>, Cancelable: cancelable, Propagation: bubbles }); } catch { /* native dispatch below */ } }
            return this.#target.dispatchEvent(new CustomEvent(type, { detail, cancelable, bubbles }));
        }

        #hooks(point: 'before' | 'after', batch: Batch<T>): void | boolean
        {
            const fns = this.Descriptor.functions;
            if (!fns) return;
            for (const key of Object.keys(fns)) {
                const h = fns[key];
                if ((h.point ?? 'before') !== point) continue;
                if (h.run({ Name: batch.Name, Hosts: batch.Hosts, Count: batch.Count }) === false && point === 'before') return false;
            }
        }

        #sync(host: object, value: T): void
        {
            const bindings = this.Descriptor.bindings;
            if (!bindings) return;
            const provider = Property.#provider;
            for (const key of Object.keys(bindings)) {
                const b = bindings[key];
                if (b.reactive && provider) { this.#reactive(provider, host, value, b); continue; }
                this.#direct(host, value, b);
            }
        }

        /** DEFAULT: direct wrapping — host→targets, and (two-way) target→host with guards. */
        #direct(host: object, value: T, b: Binding): void
        {
            const targets = b.targets ?? (b.target ? [b.target] : []);
            const twoWay  = Property.#ways(b.ways) === 2;
            const attrs   = b.attribute ? [b.attribute] : (Array.isArray(b.attributes) ? b.attributes : Object.keys(b.attributes ?? {}));
            const props   = b.property  ? [b.property]  : (Array.isArray(b.properties) ? b.properties : Object.keys(b.properties ?? {}));
            const str     = value === null || value === undefined ? '' : String(value);

            for (const t of targets) {
                // host → target
                this.#syncing = true;
                if (typeof (t as Element).setAttribute === 'function') for (const a of attrs) { if ((t as Element).getAttribute(a) !== str) Reals.Real.Attribute(t as Element, a, str); }
                for (const p of props) { const r = t as Record<string, unknown>; if (!Object.is(r[p], value)) r[p] = value; }
                this.#syncing = false;

                // two-way: target → host (wrap once per target/property)
                if (twoWay) this.#wrap(host, t, attrs, props);
            }
        }

        /** Wrap a target's setAttribute / property setters once, to propagate its changes back to the host. */
        #wrap(host: object, target: object, attrs: string[], props: string[]): void
        {
            const mark = Symbol.for(`arianna:bound:${this.Name}`);
            const rec  = target as Record<PropertyKey, unknown>;
            if (rec[mark]) return;                 // guard: already wrapped
            rec[mark] = true;

            const hostRef = new WeakRef(host);     // weak capture: the target must not keep the host alive

            if (attrs.length && typeof (target as Element).setAttribute === 'function') {
                const el = target as Element;
                const original = el.setAttribute.bind(el);
                el.setAttribute = (name: string, val: string): void => {
                    original(name, val);
                    const h = hostRef.deref();
                    if (h !== undefined && !this.#syncing && attrs.includes(name)) (h as Record<string, unknown>)[this.Name] = val as unknown;
                };
            }
            for (const p of props) {
                const desc = Object.getOwnPropertyDescriptor(target, p);
                const originalSet = desc?.set;
                let store = (target as Record<string, unknown>)[p];
                Object.defineProperty(target, p, {
                    configurable: true, enumerable: true,
                    get: desc?.get ?? ((): unknown => store),
                    set: (val: unknown): void => { store = val; originalSet?.call(target, val); const h = hostRef.deref(); if (h !== undefined && !this.#syncing) (h as Record<string, unknown>)[this.Name] = val; },
                });
            }
        }

        #reactive(provider: Reactive, host: object, value: T, b: Binding): void
        {
            if (b.reactive === 'Proxy') { provider.reactive(host); return; }
            const s = provider.signal(value);
            for (const t of (b.targets ?? (b.target ? [b.target] : []))) s.subscribe(v => { void [t, v]; });
        }

        static #ways(w: Ways | undefined): 1 | 2 { return w === 2 || String(w).toLowerCase() === 'two' ? 2 : 1; }

        static #toArray(h: Hosts): object[]
        {
            if (h === null || h === undefined) return [];
            if (Array.isArray(h)) return h as object[];
            if (typeof (h as ArrayLike<object>).length === 'number' && typeof h !== 'function') return Array.from(h as ArrayLike<object>);
            return [h as object];
        }

        static #matches(v: unknown, t: Type): boolean
        {
            if (typeof t === 'function') return t(v);
            switch (t) {
                case 'string'  : return typeof v === 'string';
                case 'number'  : return typeof v === 'number' && !Number.isNaN(v);
                case 'boolean' : return typeof v === 'boolean';
                case 'function': return typeof v === 'function';
                case 'integer' : return typeof v === 'number' && Number.isInteger(v);
                case 'object'  : return typeof v === 'object' && v !== null && !Array.isArray(v);
                case 'array'   : return Array.isArray(v);
                case 'any'     : return true;
                default        : return false;
            }
        }
    }
}

export default Properties;
