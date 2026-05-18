/**
 * @module    components/shipments/BRTTracker
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * BRTTracker — concrete tracker for BRT (Bartolini) shipments, Italy's
 * largest national courier. Tracking numbers (Numero Spedizione, NSP) are
 * typically 10-12 digit numeric strings. Brand colour BRT Red #e30613.
 *
 *   <arianna-brt-tracker tracking-number="123456789012"></arianna-brt-tracker>
 *
 * Composes a base `Tracker` internally. Custom tag `arianna-brt-tracker`.
 *
 * Events: bubble through unchanged
 * Attrs:  tracking-number, locale
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Tracker, type CarrierConfig, type TrackingEvent } from './Tracker.ts';

const BRT: CarrierConfig = {
    id        : 'brt',
    name      : 'BRT',
    color     : '#e30613',
    publicUrl : 'https://vas.brt.it/vas/sped_det_show.hsm?referer=sped_numspe_par.htm&Nspedizione={n}',
    pattern   : /^\d{10,12}$/,
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 22"><rect width="64" height="22" rx="3" fill="#e30613"/><text x="32" y="16" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="900" fill="#fff" letter-spacing="1">BRT</text></svg>`,
};

export interface BRTTrackerOptions {
    trackingNumber? : string;
    events?         : TrackingEvent[];
    locale?         : string;
}

export class BRTTracker extends Component('arianna-brt-tracker', HTMLElement, {}, {
    attrs : ['tracking-number', 'locale'],
    shadow: false,
})
{
    #inner: Tracker | null = null;

    build(_opts: BRTTrackerOptions = {}) {
        this.template = html`<div class="ar-carrier-host" data-r="host"></div>`;
    }

    static get carrier(): CarrierConfig { return BRT; }
    get carrier(): CarrierConfig { return BRT; }

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
        return BRT.pattern ? BRT.pattern.test(n) : n.length > 0;
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount() {
        const host = this.querySelector<HTMLElement>('[data-r="host"]');
        if (!host) return;
        const inner = new Tracker();
        inner.setCarrier(BRT);
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
    Object.defineProperty(window, 'BRTTracker', {
        value: BRTTracker, writable: false, enumerable: false, configurable: false,
    });
}

export default BRTTracker;
