/**
 * @module    components/shipments/TrackingMulti
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Multi-carrier shipment tracker. Given a tracking number, it auto-detects
 * the most likely carrier by matching against each carrier's regex and
 * mounts the corresponding subcomponent. When multiple carriers match
 * (which happens with ambiguous numeric formats), it presents a small picker.
 *
 *   ┌──────────────────────────────────────┐
 *   │ Tracking number                      │
 *   │ [123456789012345        ] [Track]    │
 *   ├──────────────────────────────────────┤
 *   │ ⚠ Multiple carriers match this number│
 *   │   ◯ FedEx   ◯ DHL                   │
 *   ├──────────────────────────────────────┤
 *   │  …mounted DHLTracker / FedExTracker… │
 *   └──────────────────────────────────────┘
 *
 * @example HTML
 *   <arianna-tracking-multi tracking-number="1Z999AA10123456784"></arianna-tracking-multi>
 *
 * @example JS
 *   const t = new TrackingMulti();
 *   t.setTrackingNumber('1Z999AA10123456784');   // auto-detected as UPS
 *   t.addEventListener('arianna:carrier-detected', e =>
 *     console.log('Carrier:', e.detail.carrier));
 *   t.setEvents(await api.fetchEvents(t.getCarrier(), t.getTrackingNumber()));
 *
 * Events:
 *   arianna:carrier-detected  detail: { carrier: CarrierId | null, candidates: CarrierId[] }
 *   (plus inner tracker events bubble through naturally)
 *
 * Attrs: tracking-number, carrier (force), show-input, locale
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

import { DHLTracker }   from './DHLTracker.ts';
import { UPSTracker }   from './UPSTracker.ts';
import { FedExTracker } from './FedExTracker.ts';
import { BRTTracker }   from './BRTTracker.ts';
import type { TrackingEvent } from './Tracker.ts';

export type CarrierId = 'dhl' | 'ups' | 'fedex' | 'brt';

interface CarrierEntry {
    id      : CarrierId;
    name    : string;
    pattern : RegExp;
    make    : () => HTMLElement & {
        setTrackingNumber(n: string): unknown;
        setEvents(events: TrackingEvent[]): unknown;
    };
}

const CARRIERS: CarrierEntry[] = [
    { id: 'ups',   name: 'UPS',   pattern: /^1Z[0-9A-Z]{16}$/i,           make: () => new UPSTracker()   as unknown as CarrierEntry['make'] extends () => infer R ? R : never },
    { id: 'fedex', name: 'FedEx', pattern: /^(\d{12}|\d{15}|\d{20})$/,    make: () => new FedExTracker() as unknown as CarrierEntry['make'] extends () => infer R ? R : never },
    { id: 'dhl',   name: 'DHL',   pattern: /^(\d{10,11}|[A-Z]{3}\d{7})$/i, make: () => new DHLTracker()   as unknown as CarrierEntry['make'] extends () => infer R ? R : never },
    { id: 'brt',   name: 'BRT',   pattern: /^\d{10,12}$/,                  make: () => new BRTTracker()   as unknown as CarrierEntry['make'] extends () => infer R ? R : never },
];

export interface TrackingMultiOptions {
    trackingNumber? : string;
    carrier?        : CarrierId;
    showInput?      : boolean;
    locale?         : string;
    events?         : TrackingEvent[];
}

export class TrackingMulti extends Component('arianna-tracking-multi', HTMLElement, {}, {
    attrs : ['tracking-number', 'carrier', 'show-input', 'locale'],
    shadow: false,
})
{
    candidates$: Signal<CarrierId[]> = signal<CarrierId[]>([]);
    pending$   : Signal<TrackingEvent[] | null> = signal<TrackingEvent[] | null>(null);

    #activeTracker: (HTMLElement & { setTrackingNumber(n: string): unknown; setEvents(events: TrackingEvent[]): unknown }) | null = null;

    build(_opts: TrackingMultiOptions = {})
    {
        const numberAttr  = this.attrSignal('tracking-number');
        const carrierAttr = this.attrSignal('carrier');

        this.showInput = () => this.getAttribute('show-input') !== 'false';
        this.inputVal  = () => numberAttr.get() ?? '';

        this.hasMultiple = () => {
            const cands = this.candidates$.get();
            const forced = carrierAttr.get();
            return cands.length > 1 && !forced;
        };

        this.candidatesList = (): Array<{ id: CarrierId; name: string; selected: boolean }> => {
            const sel = carrierAttr.get();
            return this.candidates$.get().map(id => ({
                id, name: CARRIERS.find(c => c.id === id)!.name,
                selected: sel === id,
            }));
        };

        this.activeCarrier = () => carrierAttr.get() as CarrierId | null;

        // ── Handlers ────────────────────────────────────────────────────
        this.onInput = (e: Event) => {
            this.setAttribute('tracking-number', (e.target as HTMLInputElement).value);
        };
        this.onTrack = () => {
            this.#detect();
        };
        this.onKeyDown = (e: Event) => {
            if ((e as KeyboardEvent).key === 'Enter') this.#detect();
        };
        this.onCandidatePick = (e: Event) => {
            const btn = e.currentTarget as HTMLButtonElement;
            const id = btn.dataset.id as CarrierId;
            if (id) this.setCarrier(id);
        };

        this.template = html`
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

        this.Sheet = TrackingMulti.DefaultSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    setTrackingNumber(n: string): this {
        this.setAttribute('tracking-number', n);
        this.#detect();
        return this;
    }
    getTrackingNumber(): string { return this.getAttribute('tracking-number') ?? ''; }

    setCarrier(id: CarrierId): this {
        this.setAttribute('carrier', id);
        this.#mountActive();
        return this;
    }
    getCarrier(): CarrierId | null {
        return (this.getAttribute('carrier') as CarrierId | null);
    }

    setEvents(events: TrackingEvent[]): this {
        if (this.#activeTracker) {
            this.#activeTracker.setEvents(events);
        } else {
            this.pending$.set(events);
        }
        return this;
    }

    /** Currently-mounted inner tracker, if any. */
    getActive(): HTMLElement | null { return this.#activeTracker; }

    // ── Internal ─────────────────────────────────────────────────────────────

    #detect(): void {
        const n = (this.getAttribute('tracking-number') ?? '').trim();
        if (!n) { this.candidates$.set([]); return; }
        const matches = CARRIERS.filter(c => c.pattern.test(n)).map(c => c.id);
        this.candidates$.set(matches);
        // If forced carrier set, keep it; else if exactly one match, use it
        const forced = this.getAttribute('carrier') as CarrierId | null;
        if (!forced) {
            if (matches.length === 1) {
                this.setCarrier(matches[0]!);
            } else if (matches.length === 0) {
                this.removeAttribute('carrier');
                this.#unmountActive();
            }
        } else {
            this.#mountActive();
        }
        this.dispatchEvent(new CustomEvent('arianna:carrier-detected', {
            bubbles: true,
            detail: { carrier: this.getAttribute('carrier'), candidates: matches },
        }));
    }

    #mountActive(): void {
        const host = this.querySelector<HTMLElement>('[data-r="mount"]');
        if (!host) return;
        this.#unmountActive();
        const id = this.getAttribute('carrier') as CarrierId | null;
        if (!id) return;
        const entry = CARRIERS.find(c => c.id === id);
        if (!entry) return;
        const tracker = entry.make() as HTMLElement & {
            setTrackingNumber(n: string): unknown;
            setEvents(events: TrackingEvent[]): unknown;
        };
        const num = this.getAttribute('tracking-number');
        if (num) tracker.setTrackingNumber(num);
        const loc = this.getAttribute('locale');
        if (loc) (tracker as HTMLElement).setAttribute('locale', loc);
        host.appendChild(tracker);
        this.#activeTracker = tracker;
        // Flush pending events if any
        const pending = this.pending$.get();
        if (pending) {
            queueMicrotask(() => {
                tracker.setEvents(pending);
                this.pending$.set(null);
            });
        }
    }

    #unmountActive(): void {
        if (this.#activeTracker) {
            this.#activeTracker.remove();
            this.#activeTracker = null;
        }
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount() {
        // Initial detection if number provided via attribute
        if (this.getAttribute('tracking-number')) {
            queueMicrotask(() => this.#detect());
        }
    }
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount() {
        this.#unmountActive();
    }

    private showInput      : () => boolean = () => true;
    private inputVal       : () => string = () => '';
    private hasMultiple    : () => boolean = () => false;
    private candidatesList : () => Array<{ id: CarrierId; name: string; selected: boolean }> = () => [];
    private activeCarrier  : () => CarrierId | null = () => null;
    private onInput        : (e: Event) => void = () => {};
    private onTrack        : (e: Event) => void = () => {};
    private onKeyDown      : (e: Event) => void = () => {};
    private onCandidatePick: (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    display: 'block',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '13px',
                    color: 'var(--arianna-text, #1f2328)',
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
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    padding: '9px 12px',
                    font: '13px ui-monospace, monospace',
                    borderRadius: '6px',
                }),
                new Rule('.ar-trkm__input:focus', {
                    outline: 'none',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-trkm__track', {
                    padding: '9px 16px',
                    background: 'var(--arianna-primary, #1f6feb)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                }),
                new Rule('.ar-trkm__track:hover', { background: 'var(--arianna-primary-hover, #1858c4)' }),
                new Rule('.ar-trkm__picker', {
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                }),
                new Rule('.ar-trkm__picker-msg', {
                    fontSize: '12px',
                    color: 'var(--arianna-muted, #6e6b62)',
                    marginBottom: '8px',
                }),
                new Rule('.ar-trkm__picker-options', {
                    display: 'flex', gap: '6px', flexWrap: 'wrap',
                }),
                new Rule('.ar-trkm__cand', {
                    padding: '5px 10px',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                }),
                new Rule('.ar-trkm__cand:hover', {
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    color: 'var(--arianna-primary, #1f6feb)',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'TrackingMulti', {
        value: TrackingMulti, writable: false, enumerable: false, configurable: false,
    });
}

export default TrackingMulti;
