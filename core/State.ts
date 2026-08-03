/**
 * @module    core/State
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * State<T> — Reactive + named snapshots + mutation history.
 *
 * Built on top of Reactivity.Reactive: shares the same reactive Proxy engine.
 *
 *   .Value   — preferred (Reactive parent)
 *   .State   — alias of .Value (backward compatibility)
 *   .States  — Map of named snapshots
 *   .History — Array of every mutation, with ts + path
 *   addState/removeState — snapshot management
 *
 * # Hierarchy
 *
 *   Reactivity.Reactive (reactive base)
 *     └─ State              (snapshots + history)
 *
 * # API preservation
 *
 * legacy using `state.State.name = 'X'` continues to work — .State is
 * an alias of .Value (the proxy).  Event listeners via on()/off()/fire() are
 * inherited from Reactivity.Reactive. StateEvent type is preserved.
 */

import { Reactivity } from './Reactive.ts';
type ChangeEvent       = Reactivity.Interfaces.ChangeEvent;
type Signal<T>         = Reactivity.Signal<T>;
type SignalMono<T>     = Reactivity.Signal<T>;
type ReadonlySignal<T> = Reactivity.ReadonlySignal<T>;
import type { Events } from './Events.ts';
import { Core } from "./Core.ts";

export type { Signal, SignalMono, ReadonlySignal };

export namespace States
{
    export class State<T extends object = object> extends Reactivity.Reactive<T>
    {
        static
        {
            if (typeof window !== 'undefined') {
                Object.defineProperty(window, 'State', {
                    enumerable: true, configurable: false, writable: false, value: State,
                });
            }
        }

        readonly #states   : Map<string, Partial<T>> = new Map();
        readonly #history2 : Array<{ key: Reactivity.Types.Key; old: unknown; new: unknown; ts: number }> = [];

        // ── Static fine-grain API (re-exported from Reactivity) ───────────────────
        static signal     = Reactivity.CreateSignal;
        static signalMono = Reactivity.CreateSignal;
        static sinkText   = Reactivity.BindText;
        static effect     = Reactivity.CreateEffect;
        static computed   = Reactivity.Computed;
        static batch      = Reactivity.API.Runtime.RunBatch;
        static untrack    = Reactivity.Untrack;

        constructor(source: T)
        {
            super(source);   // State owns its own history
            this.#history2.push({ key: '__init__', old: undefined, new: source, ts: Date.now() });

            super.On
            (
                'change-after',
                (event: Reactivity.Interfaces.ChangeEvent | CustomEvent<Reactivity.Interfaces.ChangeEvent>) =>
                {
                    const e =
                        'detail' in event && event.detail
                            ? event.detail
                            : event as Reactivity.Interfaces.ChangeEvent;

                    this.#history2.push
                    (
                        {
                            key : e.Key,
                            old : e.Old,
                            new : e.New,
                            ts  : e.Timestamp
                        }
                    );

                    this.#emitStateEvents(e);
                }
            );
        }

        /** Alias of .Value — backward-compatible legacy accessor. */
        get State(): T { return this.Value; }

        /** Named snapshots map.  Use addState(name, snap) to populate. */
        get States(): Map<string, Partial<T>> { return this.#states; }

        /** Full mutation history (older first). */
        get History(): Array<{ key: Reactivity.Types.Key; old: unknown; new: unknown; ts: number }>
        { return this.#history2; }

        /** Register a named snapshot.  Useful for save/restore patterns. */
        addState(name: string, snapshot: Partial<T>): this
        { this.#states.set(name, snapshot); return this; }

        /** Remove a named snapshot. */
        removeState(name: string): this
        { this.#states.delete(name); return this; }

        /**
         * Emit the legacy State-* events that older code expects:
         *   - State-Changing
         *   - State-<key>-Changing
         *   - State-<key>-Changed
         *   - State-Changed
         *   - State-Reached  (if a snapshot matches the new value)
         */
        #emitStateEvents(e: ChangeEvent): void
        {
            const k = String(e.Key);
            const stateEv: StateEvent = {
                Type     : '',
                Target   : e.Target,
                State    : this as unknown as State<object>,
                Property : { Name: e.Key, Old: e.Old, New: e.New },
            };

            const stages: string[] = [
                'State-Changing',
                `State-${k}-Changing`,
                `State-${k}-Changed`,
                'State-Changed',
            ];
            for (const t of stages) {
                stateEv.Type = t;
                super.Fire(t, { Path: e.Path, Key: e.Key, Old: e.Old, New: e.New, Kind: e.Kind });
            }

            // Snapshot match → State-Reached
            if (this.#states.size > 0) {
                for (const snap of this.#states.values()) {
                    if ((snap as Record<string, unknown>)[k] === e.New) {
                        stateEv.Type = 'State-Reached';
                        super.Fire('State-Reached', { Path: e.Path, Key: e.Key, Old: e.Old, New: e.New, Kind: e.Kind });
                        stateEv.Type = `State-${k}-Reached`;
                        super.Fire(`State-${k}-Reached`, { Path: e.Path, Key: e.Key, Old: e.Old, New: e.New, Kind: e.Kind });
                    }
                }
            }
        }
    }

    /** Legacy state-change event shape, still emitted for backward compat. */
    export interface StateEvent extends Events.EventDescriptor
    {
        Target   : object;
        State    : State<object>;
        Property : { Name: Reactivity.Types.Key; Old: unknown; New: unknown };
    }

    /** @name        stateService
     *  @private
     *  @description Registers the 'state' service: build a State (Reactive + snapshots + history).
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license)
     */
    export const Service = new Core.Services.Service
    (
        'state',
        {
            /** Build a State from a source object. */
            make<T extends object>(source: T): State<T> { return new State<T>(source); },
        }
    );
}

export import State = States.State;
/** Namespace-merge on the class alias so `State.StateEvent` resolves for consumers
 *  (e.g. the barrel's `export type StateEvent = State.StateEvent`). Type-only. */
export namespace State { export type StateEvent = States.StateEvent; }

export default States.State;
// ── Top-level type re-export (barrel imports StateEvent by name). ──
export type StateEvent = States.StateEvent;
