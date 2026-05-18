/**
 * @module    core/State
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * State<T> — Observable + named snapshots + mutation history.
 *
 * Built on top of Observable: shares the same reactive Proxy engine.
 *
 *   .Value   — preferred (Observable parent)
 *   .State   — alias of .Value (backward compatibility)
 *   .States  — Map of named snapshots
 *   .History — Array of every mutation, with ts + path
 *   addState/removeState — snapshot management
 *
 * # Hierarchy
 *
 *   Observable (reactive base)
 *     └─ State    (snapshots + history)
 *
 * # API preservation
 *
 * legacy using `state.State.name = 'X'` continues to work — .State is
 * an alias of .Value (the proxy).  Event listeners via on()/off()/fire() are
 * inherited from Observable.  StateEvent type is preserved.
 */

import {
    Observable,
    signal, signalMono, sinkText, effect, computed, batch, untrack, uuid,
    type ChangeEvent, type Signal, type SignalMono, type ReadonlySignal, type AriannAEvent,
} from './Observable.ts';

export type { Signal, SignalMono, ReadonlySignal };


// ─────────────────────────────────────────────────────────────────────────────
//  StateEvent — legacy shape, still emitted for backward compat
// ─────────────────────────────────────────────────────────────────────────────

export interface StateEvent extends AriannAEvent
{
    Target   : object;
    State    : State<object>;
    Property : { Name: string | symbol; Old: unknown; New: unknown };
}


// ─────────────────────────────────────────────────────────────────────────────
//  State<T> class
// ─────────────────────────────────────────────────────────────────────────────

export interface StateOptions
{
    /**
     * Track every mutation in `.History` (older→newer).
     * - true        : track all mutations (default, kept for back-compat)
     * - false       : skip history entirely (lower memory for large objects)
     * - { max:N }   : track at most N most recent entries (circular)
     *
     * For large objects or hot mutation paths, switching to `false` or
     * `{ max: 100 }` removes hidden cost.
     */
    history? : boolean | { max: number };
}

export class State<T extends object = object> extends Observable<T>
{
    readonly #states   : Map<string, Partial<T>> = new Map();
    readonly #history2 : Array<{ key: string | symbol; old: unknown; new: unknown; ts: number }> = [];
    readonly #historyEnabled: boolean;
    readonly #historyMax: number;

    // ── Static fine-grain API (re-exported from Observable) ───────────────────
    static signal     = signal;
    static signalMono = signalMono;
    static sinkText   = sinkText;
    static effect     = effect;
    static computed   = computed;
    static batch      = batch;
    static untrack    = untrack;

    constructor(source: T, opts: StateOptions = {})
    {
        super(source, { history: false });   // we manage our own history

        const histOpt = opts.history ?? true;
        if (histOpt === false) {
            this.#historyEnabled = false;
            this.#historyMax     = 0;
        } else if (histOpt === true) {
            this.#historyEnabled = true;
            this.#historyMax     = Number.POSITIVE_INFINITY;
        } else {
            this.#historyEnabled = true;
            this.#historyMax     = Math.max(1, histOpt.max);
        }

        if (this.#historyEnabled) {
            this.#history2.push({ key: '__init__', old: undefined, new: source, ts: Date.now() });
        }

        // Wire 'change-after' to populate history + emit legacy StateEvents.
        // Events are always emitted; only history list write is opt-out.
        super.on('change-after', (e: ChangeEvent) => {
            if (this.#historyEnabled) {
                this.#history2.push({ key: e.Key, old: e.Old, new: e.New, ts: Date.now() });
                if (this.#history2.length > this.#historyMax) {
                    this.#history2.splice(0, this.#history2.length - this.#historyMax);
                }
            }
            this.#emitStateEvents(e);
        });
    }

    /** Alias of .Value — backward-compatible legacy accessor. */
    get State(): T { return this.Value; }

    /** Named snapshots map.  Use addState(name, snap) to populate. */
    get States(): Map<string, Partial<T>> { return this.#states; }

    /** Full mutation history (older first). */
    get History(): Array<{ key: string | symbol; old: unknown; new: unknown; ts: number }>
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
            super.fire(t, { Path: e.Path, Key: e.Key, Old: e.Old, New: e.New, Kind: e.Kind });
        }

        // Snapshot match → State-Reached
        if (this.#states.size > 0) {
            for (const snap of this.#states.values()) {
                if ((snap as Record<string, unknown>)[k] === e.New) {
                    stateEv.Type = 'State-Reached';
                    super.fire('State-Reached', { Path: e.Path, Key: e.Key, Old: e.Old, New: e.New, Kind: e.Kind });
                    stateEv.Type = `State-${k}-Reached`;
                    super.fire(`State-${k}-Reached`, { Path: e.Path, Key: e.Key, Old: e.Old, New: e.New, Kind: e.Kind });
                }
            }
        }
    }
}


// ─────────────────────────────────────────────────────────────────────────────
//  Module side-effects + default
// ─────────────────────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'State', {
        enumerable: true, configurable: false, writable: false, value: State,
    });
}

export default State;
