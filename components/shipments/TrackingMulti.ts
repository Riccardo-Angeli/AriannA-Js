/**
 * @module    components/shipments/TrackingMulti
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA TrackingMulti component module.
 */


import { DHLTracker } from './DHLTracker.ts';
import { UPSTracker } from './UPSTracker.ts';
import { FedExTracker } from './FedExTracker.ts';
import { BRTTracker } from './BRTTracker.ts';
import type { TrackingEvent } from './Tracker.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

import { MountShipmentTemplate } from './Base.ts';
declare const Component: any;
declare const Components: any;
declare namespace Components { type Binding<T> = any; }
declare const Css: any;
declare namespace Css { type Rule = any; type Stylesheet = any; }
declare const Reactivity: any;
declare namespace Reactivity { type Signal<T> = any; type Effect = any; }
declare const Templates: any;


/** @namespace   TrackingMulti
 *  @public
 *  @description Namespace containing TrackingMulti contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace TrackingMulti
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Signal
         *  @public
         *  @type        {SchemaInterfaces.Reactivity.Signal<T>}
         *  @description Type alias for Signal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;

        /** @name        Rule
         *  @public
         *  @type        {Css.Rule}
         *  @description Type alias for Rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Rule = Css.Rule;

        /** @name        Stylesheet
         *  @public
         *  @type        {Css.Stylesheet}
         *  @description Type alias for Stylesheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Stylesheet = Css.Stylesheet;

        /** @name        CarrierId
         *  @public
         *  @type        {'dhl' | 'ups' | 'fedex' | 'brt'}
         *  @description Type alias for CarrierId.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type CarrierId = 'dhl' | 'ups' | 'fedex' | 'brt';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   CarrierEntry
         *  @public
         *  @description CarrierEntry contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface CarrierEntry
        {
            /** @name        id
             *  @public
             *  @type        {TrackingMulti.Types.CarrierId}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: Types.CarrierId;

            /** @name        name
             *  @public
             *  @type        {string}
             *  @description Component member for name.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            name: string;

            /** @name        pattern
             *  @public
             *  @type        {RegExp}
             *  @description Component member for pattern.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            pattern: RegExp;

            /** @name        make
             *  @public
             *  @type        {() => HTMLElement & {
                setTrackingNumber(n: string): unknown;
                setEvents(events: TrackingEvent[]): unknown;
            }}
             *  @description Component member for make.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            make: () => HTMLElement & {
                /** @name        setTrackingNumber
                 *  @public
                 *  @type        {unknown}
                 *  @description Component member for set Tracking Number.
                 *  @param       {string} n Parameter.
                 *  @returns     {unknown} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                setTrackingNumber(n: string): unknown;

                /** @name        setEvents
                 *  @public
                 *  @type        {unknown}
                 *  @description Component member for set Events.
                 *  @param       {TrackingEvent[]} events Parameter.
                 *  @returns     {unknown} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                setEvents(events: TrackingEvent[]): unknown;
            };
        }

        /** @interface   TrackingMultiOptions
         *  @public
         *  @description TrackingMultiOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface TrackingMultiOptions
        {
            /** @name        trackingNumber
             *  @public
             *  @type        {string}
             *  @description Component member for tracking Number.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            trackingNumber?: string;

            /** @name        carrier
             *  @public
             *  @type        {TrackingMulti.Types.CarrierId}
             *  @description Component member for carrier.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            carrier?: Types.CarrierId;

            /** @name        showInput
             *  @public
             *  @type        {boolean}
             *  @description Component member for show Input.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            showInput?: boolean;

            /** @name        locale
             *  @public
             *  @type        {string}
             *  @description Component member for locale.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            locale?: string;

            /** @name        events
             *  @public
             *  @type        {TrackingEvent[]}
             *  @description Component member for events.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            events?: TrackingEvent[];
        }
    }
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    /** @name        signal
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned signal value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const signal = Reactivity.CreateSignal as <T = unknown>(initial?: T) => any;

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;

    /** @name        CARRIERS
     *  @public
     *  @type        {TrackingMulti.Interfaces.CarrierEntry[]}
     *  @description Namespace-owned CARRIERS value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const CARRIERS: Interfaces.CarrierEntry[] = [
        { id: 'ups', name: 'UPS', pattern: /^1Z[0-9A-Z]{16}$/i, make: () => new UPSTracker.UPSTracker() as unknown as Interfaces.CarrierEntry['make'] extends () => infer R ? R : never },
        { id: 'fedex', name: 'FedEx', pattern: /^(\d{12}|\d{15}|\d{20})$/, make: () => new FedExTracker.FedExTracker() as unknown as Interfaces.CarrierEntry['make'] extends () => infer R ? R : never },
        { id: 'dhl', name: 'DHL', pattern: /^(\d{10,11}|[A-Z]{3}\d{7})$/i, make: () => new DHLTracker.DHLTracker() as unknown as Interfaces.CarrierEntry['make'] extends () => infer R ? R : never },
        { id: 'brt', name: 'BRT', pattern: /^\d{10,12}$/, make: () => new BRTTracker.BRTTracker() as unknown as Interfaces.CarrierEntry['make'] extends () => infer R ? R : never },
    ];

    /** @class       TrackingMulti
     *  @public
     *  @description AriannA TrackingMulti component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-tracking-multi', {}, {
        shadow: false,
        Attributes: ['tracking-number', 'carrier', 'show-input', 'locale'],
    })
    export class TrackingMulti extends HTMLDivElement
    {
        public static readonly Styles = TrackingMulti.DefaultSheet();
        /** Canonical AriannA public DOM identity. */
        private readonly _AriannaIdentity = (() =>
        {
            const type = 'TrackingMulti';
            for(const cls of Array.from(this.classList))
            {
                if(cls.startsWith('__real-')) this.classList.remove(cls);
            }
            this.classList.add(type);

            const counters = globalThis as typeof globalThis & { __AriannaComponentIds?: Record<string, number> };
            const ids = counters.__AriannaComponentIds ??= Object.create(null);
            const n = ids[type] = (ids[type] ?? 0) + 1;
            this.id = `${type}-${n}`;
            return true;
        })();

        constructor()
        {
            super();
            if(!this.candidates$) this.candidates$ = signal<Types.CarrierId[]>([]);
            if(!this.pending$) this.pending$ = signal<TrackingEvent[] | null>(null);
            if(this._activeTracker === undefined) this._activeTracker = null;
            this.classList.add('TrackingMulti');
        }

        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible template slot installed by @Component. */
        declare template: unknown;

        /** @name        candidates$
         *  @public
         *  @type        {TrackingMulti.Types.Signal<TrackingMulti.Types.CarrierId[]>}
         *  @description Component member for candidates$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare candidates$: Types.Signal<Types.CarrierId[]>;

        /** @name        pending$
         *  @public
         *  @type        {TrackingMulti.Types.Signal<TrackingEvent[] | null>}
         *  @description Component member for pending$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare pending$: Types.Signal<TrackingEvent[] | null>;

        /** @name        _activeTracker
         *  @public
         *  @type        {(HTMLElement & {
            setTrackingNumber(n: string): unknown;
            setEvents(events: TrackingEvent[]): unknown;
        }) | null}
         *  @description Component member for active Tracker.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        _activeTracker: (HTMLElement & {
            /** @name        setTrackingNumber
             *  @public
             *  @type        {unknown}
             *  @description Component member for set Tracking Number.
             *  @param       {string} n Parameter.
             *  @returns     {unknown} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            setTrackingNumber(n: string): unknown;

            /** @name        setEvents
             *  @public
             *  @type        {unknown}
             *  @description Component member for set Events.
             *  @param       {TrackingEvent[]} events Parameter.
             *  @returns     {unknown} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            setEvents(events: TrackingEvent[]): unknown;
        }) | null = null;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {TrackingMulti.Interfaces.TrackingMultiOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.TrackingMultiOptions = {})
        {
            if(!this.candidates$) this.candidates$ = signal<Types.CarrierId[]>([]);
            if(!this.pending$) this.pending$ = signal<TrackingEvent[] | null>(null);
            if(this._activeTracker === undefined) this._activeTracker = null;
            if(this.dataset.ariannaFolderReady === 'true') return;
            /** @name        numberAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned numberAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const numberAttr = this.signal().attribute('tracking-number');

            /** @name        carrierAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned carrierAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const carrierAttr = this.signal().attribute('carrier');
            this.showInput = () => this.getAttribute('show-input') !== 'false';
            this.inputVal = () => numberAttr.Get() ?? '';
            this.hasMultiple = () => {
                /** @name        cands
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cands value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cands = this.candidates$.Get();

                /** @name        forced
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned forced value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const forced = carrierAttr.Get();
                return cands.length > 1 && !forced;
            };
            this.candidatesList = (): Array<{
                /** @name        id
                 *  @public
                 *  @type        {TrackingMulti.Types.CarrierId}
                 *  @description Component member for id.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                id: Types.CarrierId;

                /** @name        name
                 *  @public
                 *  @type        {string}
                 *  @description Component member for name.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                name: string;

                /** @name        selected
                 *  @public
                 *  @type        {boolean}
                 *  @description Component member for selected.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                selected: boolean;
            }> => {
                /** @name        sel
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sel value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sel = carrierAttr.Get();
                return this.candidates$.Get().map((id: any) => ({
                    id, name: CARRIERS.find(c => c.id === id)!.name,
                    selected: sel === id,
                }));
            };
            this.activeCarrier = () => carrierAttr.Get() as Types.CarrierId | null;
            // ── Handlers ────────────────────────────────────────────────────
            this.onInput = (e: Event) => {
                this.setAttribute('tracking-number', (e.target as HTMLInputElement).value);
            };
            this.onTrack = () => {
                this._detect();
            };
            this.onKeyDown = (e: Event) => {
                if ((e as KeyboardEvent).key === 'Enter')
                    this._detect();
            };
            this.onCandidatePick = (e: Event) => {
                /** @name        btn
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned btn value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const btn = e.currentTarget as HTMLButtonElement;

                /** @name        id
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned id value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const id = btn.dataset.id as Types.CarrierId;
                if (id)
                    this.setCarrier(id);
            };
            this.template = html `
            <div class="ar-trkm">
                <div class="ar-trkm__inputrow" a-if="this.showInput()">
                    <input type="text" class="ar-trkm__input"
                           placeholder="Tracking number"
                           :value="this.inputVal()"
                           @input="this.onInput"
                           @keydown="this.onKeyDown"/>
                    <button type="button" class="ar-trkm__track" @click="this.onTrack">Track</button>
                </div>
                <div class="ar-trkm__picker" a-if="this.hasMultiple()">
                    <div class="ar-trkm__picker-msg">
                        ⚠ Multiple carriers match this number
                    </div>
                    <div class="ar-trkm__picker-options">
                        <button type="button" a-for="c in this.candidatesList()"
                                class="ar-trkm__cand"
                                :data-id="c.id"
                                @click="this.onCandidatePick">{{ c.name }}</button>
                    </div>
                </div>
                <div class="ar-trkm__mount" data-r="mount"></div>
            </div>
        `;
            MountShipmentTemplate(this);
            this.dataset.ariannaFolderReady = 'true';
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {TrackingMulti.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = TrackingMulti.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        setTrackingNumber
         *  @public
         *  @type        {this}
         *  @description Component member for set Tracking Number.
         *  @param       {string} n Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setTrackingNumber(n: string): this
        {
            this.setAttribute('tracking-number', n);
            this._detect();
            return this;
        }

        /** @name        getTrackingNumber
         *  @public
         *  @type        {string}
         *  @description Component member for get Tracking Number.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getTrackingNumber(): string { return this.getAttribute('tracking-number') ?? ''; }

        /** @name        setCarrier
         *  @public
         *  @type        {this}
         *  @description Component member for set Carrier.
         *  @param       {TrackingMulti.Types.CarrierId} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setCarrier(id: Types.CarrierId): this
        {
            this.setAttribute('carrier', id);
            this._mountActive();
            return this;
        }

        /** @name        getCarrier
         *  @public
         *  @type        {TrackingMulti.Types.CarrierId | null}
         *  @description Component member for get Carrier.
         *  @returns     {TrackingMulti.Types.CarrierId | null} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getCarrier(): Types.CarrierId | null
        {
            return (this.getAttribute('carrier') as Types.CarrierId | null);
        }

        /** @name        setEvents
         *  @public
         *  @type        {this}
         *  @description Component member for set Events.
         *  @param       {TrackingEvent[]} events Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setEvents(events: TrackingEvent[]): this
        {
            if (this._activeTracker)
            {
                this._activeTracker.setEvents(events);
            }
            else
            {
                this.pending$.Set(events);
            }
            return this;
        }

        /** Currently-mounted inner tracker, if any. */
        getActive(): HTMLElement | null { return this._activeTracker; }
        // ── Internal ─────────────────────────────────────────────────────────────
        /** @name        _detect
         *  @public
         *  @type        {void}
         *  @description Component member for detect.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        _detect(): void
        {
            /** @name        n
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned n value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const n = (this.getAttribute('tracking-number') ?? '').trim();
            if (!n)
            {
                this.candidates$.Set([]);
                return;
            }

            /** @name        matches
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned matches value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const matches = CARRIERS.filter(c => c.pattern.test(n)).map(c => c.id);
            this.candidates$.Set(matches);
            // If forced carrier set, keep it; else if exactly one match, use it
            /** @name        forced
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned forced value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const forced = this.getAttribute('carrier') as Types.CarrierId | null;
            if (!forced)
            {
                if (matches.length === 1)
                {
                    this.setCarrier(matches[0]!);
                }
                else if (matches.length === 0)
                {
                    this.removeAttribute('carrier');
                    this._unmountActive();
                }
            }
            else
            {
                this._mountActive();
            }
            this.dispatchEvent(new CustomEvent('arianna:carrier-detected', {
                bubbles: true,
                detail: { carrier: this.getAttribute('carrier'), candidates: matches },
            }));
        }

        /** @name        _mountActive
         *  @public
         *  @type        {void}
         *  @description Component member for mount Active.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        _mountActive(): void
        {
            /** @name        host
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned host value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const host = this.querySelector<HTMLElement>('[data-r="mount"]');
            if (!host)
                return;
            this._unmountActive();

            /** @name        id
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned id value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const id = this.getAttribute('carrier') as Types.CarrierId | null;
            if (!id)
                return;

            /** @name        entry
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned entry value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const entry = CARRIERS.find(c => c.id === id);
            if (!entry)
                return;

            /** @name        tracker
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tracker value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tracker = entry.make() as HTMLElement & {
                /** @name        setTrackingNumber
                 *  @public
                 *  @type        {unknown}
                 *  @description Component member for set Tracking Number.
                 *  @param       {string} n Parameter.
                 *  @returns     {unknown} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                setTrackingNumber(n: string): unknown;

                /** @name        setEvents
                 *  @public
                 *  @type        {unknown}
                 *  @description Component member for set Events.
                 *  @param       {TrackingEvent[]} events Parameter.
                 *  @returns     {unknown} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                setEvents(events: TrackingEvent[]): unknown;
            };

            /** @name        num
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned num value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const num = this.getAttribute('tracking-number');
            if (num)
                tracker.setTrackingNumber(num);

            /** @name        loc
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned loc value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const loc = this.getAttribute('locale');
            if (loc)
                (tracker as HTMLElement).setAttribute('locale', loc);
            host.appendChild(tracker);
            this._activeTracker = tracker;
            // Flush pending events if any
            /** @name        pending
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned pending value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const pending = this.pending$.Get();
            if (pending)
            {
                queueMicrotask(() => {
                    tracker.setEvents(pending);
                    this.pending$.Set(null);
                });
            }
        }

        /** @name        _unmountActive
         *  @public
         *  @type        {void}
         *  @description Component member for unmount Active.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        _unmountActive(): void
        {
            if (this._activeTracker)
            {
                this._activeTracker.remove();
                this._activeTracker = null;
            }
        }

        /** @name        onCreated
         *  @public
         *  @type        {void}
         *  @description Component member for on Created.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onCreated() { }

        /** @name        onBeforeMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeMount() { }

        /** @name        onMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onMount()
        {
            // Initial detection if number provided via attribute
            if (this.getAttribute('tracking-number'))
            {
                queueMicrotask(() => this._detect());
            }
        }

        /** @name        onBeforeUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUpdate() { }

        /** @name        onUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUpdate() { }

        /** @name        onBeforeUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUnmount() { }

        /** @name        onUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUnmount()
        {
            this._unmountActive();
        }

        /** @name        showInput
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show Input.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showInput: () => boolean = () => true;

        /** @name        inputVal
         *  @private
         *  @type        {() => string}
         *  @description Component member for input Val.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private inputVal: () => string = () => '';

        /** @name        hasMultiple
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Multiple.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasMultiple: () => boolean = () => false;

        /** @name        candidatesList
         *  @private
         *  @type        {() => Array<{
            id: TrackingMulti.Types.CarrierId;
            name: string;
            selected: boolean;
        }>}
         *  @description Component member for candidates List.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private candidatesList: () => Array<{
            /** @name        id
             *  @public
             *  @type        {TrackingMulti.Types.CarrierId}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: Types.CarrierId;

            /** @name        name
             *  @public
             *  @type        {string}
             *  @description Component member for name.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            name: string;

            /** @name        selected
             *  @public
             *  @type        {boolean}
             *  @description Component member for selected.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            selected: boolean;
        }> = () => [];

        /** @name        activeCarrier
         *  @private
         *  @type        {() => TrackingMulti.Types.CarrierId | null}
         *  @description Component member for active Carrier.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private activeCarrier: () => Types.CarrierId | null = () => null;

        /** @name        onInput
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Input.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onInput: (e: Event) => void = () => { };

        /** @name        onTrack
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Track.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onTrack: (e: Event) => void = () => { };

        /** @name        onKeyDown
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Key Down.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onKeyDown: (e: Event) => void = () => { };

        /** @name        onCandidatePick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Candidate Pick.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onCandidatePick: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {TrackingMulti.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {TrackingMulti.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule('.TrackingMulti', {
                    BoxSizing: 'border-box',
                    MaxWidth: '100%',
                    MinWidth: '0',
                    display: 'block',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '13px',
                    color: 'var(--arianna-text, var(--text, #1c1e21))',
                    maxWidth: '480px',
                }),
                new Rule('.ar-trkm', {
                    display: 'flex', flexDirection: 'column', gap: '10px',
                }),
                new Rule('.ar-trkm__inputrow', {
                    display: 'flex', gap: '8px',
                }),
                new Rule('.ar-trkm__input', {
                    flex: '1',
                    background: 'var(--arianna-bg, var(--bg, #fff))',
                    border: '1px solid var(--arianna-border, var(--border, #e6e8eb))',
                    color: 'var(--arianna-text, var(--text, #1c1e21))',
                    padding: '9px 12px',
                    font: '13px ui-monospace, monospace',
                    borderRadius: '6px',
                }),
                new Rule('.ar-trkm__input:focus', {
                    outline: 'none',
                    borderColor: 'var(--arianna-primary, var(--accent, #e40c88))',
                }),
                new Rule('.ar-trkm__track', {
                    padding: '9px 16px',
                    background: 'var(--arianna-primary, var(--accent, #e40c88))',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                }),
                new Rule('.ar-trkm__track:hover', { background: 'var(--arianna-primary-hover, #1858c4)' }),
                new Rule('.ar-trkm__picker', {
                    background: 'var(--arianna-bg-3, var(--bg3, #f6f7f9))',
                    border: '1px solid var(--arianna-border, var(--border, #e6e8eb))',
                    borderRadius: '6px',
                    padding: '10px 12px',
                }),
                new Rule('.ar-trkm__picker-msg', {
                    fontSize: '12px',
                    color: 'var(--arianna-muted, var(--muted, #687079))',
                    marginBottom: '8px',
                }),
                new Rule('.ar-trkm__picker-options', {
                    display: 'flex', gap: '6px', flexWrap: 'wrap',
                }),
                new Rule('.ar-trkm__cand', {
                    padding: '5px 10px',
                    background: 'var(--arianna-bg, var(--bg, #fff))',
                    border: '1px solid var(--arianna-border, var(--border, #e6e8eb))',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                }),
                new Rule('.ar-trkm__cand:hover', {
                    borderColor: 'var(--arianna-primary, var(--accent, #e40c88))',
                    color: 'var(--arianna-primary, var(--accent, #e40c88))',
                }),
            ]);
        }
    }
}
export default TrackingMulti;
