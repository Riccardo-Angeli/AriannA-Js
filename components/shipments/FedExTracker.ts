/**
 * @module    components/shipments/FedExTracker
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * FedExTracker — concrete tracker for FedEx shipments. Tracking numbers
 * are 12-digit (Express), 15-digit (Ground), or 20-digit (SmartPost) all
 * numeric. Brand colours FedEx Purple #4d148c + Orange #ff6600.
 *
 *   <arianna-fedex-tracker tracking-number="123456789012"></arianna-fedex-tracker>
 *
 * Composes a base `Tracker` internally. Custom tag `arianna-fedex-tracker`.
 *
 * Events: bubble through unchanged
 * Attrs:  tracking-number, locale
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Tracker, type CarrierConfig, type TrackingEvent } from './Tracker.ts';

const FEDEX: CarrierConfig = {
    id        : 'fedex',
    name      : 'FedEx',
    color     : '#4d148c',
    publicUrl : 'https://www.fedex.com/fedextrack/?trknbr={n}',
    pattern   : /^(\d{12}|\d{15}|\d{20})$/,
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 22"><rect width="80" height="22" rx="3" fill="#4d148c"/><text x="40" y="16" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="900" fill="#fff" letter-spacing="0.5">Fed<tspan fill="#ff6600">Ex</tspan></text></svg>`,
};

export interface FedExTrackerOptions {
    trackingNumber? : string;
    events?         : TrackingEvent[];
    locale?         : string;
}

export class FedExTracker extends Component('arianna-fedex-tracker', HTMLElement, {}, {
    attrs : ['tracking-number', 'locale'],
})
{
    #inner: Tracker | null = null;

    build(_opts: FedExTrackerOptions = {}) {
        this.template = html`<div class="ar-carrier-host" data-r="host"></div>`;
    }

    static get carrier(): CarrierConfig { return FEDEX; }
    get carrier(): CarrierConfig { return FEDEX; }

    setTrackingNumber(n: string): this {
        this.setAttribute('tracking-number', n);
        if (this.#inner) this.#inner.setTrackingNumber(n);
        return this;
    }
    getTrackingNumber(): string { return this.getAttribute('tracking-number') ?? ''; }

    setEvents(events: TrackingEvent[]): this {
        if (this.#inner) this.#inner.setEvents(events);
        return this;
    }
    getEvents(): TrackingEvent[] { return this.#inner?.getEvents() ?? []; }

    validateNumber(n: string): boolean {
        return FEDEX.pattern ? FEDEX.pattern.test(n) : n.length > 0;
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount() {
        const host = this.querySelector<HTMLElement>('[data-r="host"]');
        if (!host) return;
        const inner = new Tracker();
        inner.setCarrier(FEDEX);
        const n = this.getAttribute('tracking-number');
        if (n) inner.setTrackingNumber(n);
        const loc = this.getAttribute('locale');
        if (loc) inner.setAttribute('locale', loc);
        host.appendChild(inner);
        this.#inner = inner;
    }
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount() { this.#inner = null; }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'FedExTracker', {
        value: FedExTracker, writable: false, enumerable: false, configurable: false,
    });
}

export default FedExTracker;
