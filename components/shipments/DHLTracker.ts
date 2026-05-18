/**
 * @module    components/shipments/DHLTracker
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * DHLTracker — concrete tracker for DHL Express shipments. Brand colour
 * DHL Yellow #ffcc00 / DHL Red #d40511. Tracking number patterns vary
 * widely; common forms are 10-11 digit waybills and 3-letter+7-digit AWB.
 *
 *   <arianna-dhl-tracker tracking-number="1234567890"></arianna-dhl-tracker>
 *
 *   const t = new DHLTracker();
 *   t.setTrackingNumber('1234567890');
 *   t.setEvents(eventsFromServer);
 *
 * Composes a base `Tracker` instance internally. Subscribes to its events
 * and re-dispatches them. The custom tag is `arianna-dhl-tracker`.
 *
 * Events: bubble through unchanged from inner Tracker
 *         (arianna:tracking-portal, arianna:tracking-event)
 * Attrs: tracking-number, locale
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Tracker, type CarrierConfig, type TrackingEvent } from './Tracker.ts';

const DHL: CarrierConfig = {
    id        : 'dhl',
    name      : 'DHL',
    color     : '#ffcc00',
    publicUrl : 'https://www.dhl.com/global-en/home/tracking.html?tracking-id={n}',
    pattern   : /^(\d{10,11}|[A-Z]{3}\d{7})$/i,
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 22"><rect width="64" height="22" rx="3" fill="#ffcc00"/><text x="32" y="16" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="900" fill="#d40511" letter-spacing="1">DHL</text></svg>`,
};

export interface DHLTrackerOptions {
    trackingNumber? : string;
    events?         : TrackingEvent[];
    locale?         : string;
}

export class DHLTracker extends Component('arianna-dhl-tracker', HTMLElement, {}, {
    attrs : ['tracking-number', 'locale'],
    shadow: false,
})
{
    #inner: Tracker | null = null;

    build(_opts: DHLTrackerOptions = {})
    {
        this.template = html`<div class="ar-carrier-host" data-r="host"></div>`;
    }

    static get carrier(): CarrierConfig { return DHL; }
    get carrier(): CarrierConfig { return DHL; }

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
    getEvents(): TrackingEvent[] {
        return this.#inner?.getEvents() ?? [];
    }

    validateNumber(n: string): boolean {
        return DHL.pattern ? DHL.pattern.test(n) : n.length > 0;
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount() {
        const host = this.querySelector<HTMLElement>('[data-r="host"]');
        if (!host) return;
        const inner = new Tracker();
        inner.setCarrier(DHL);
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
    onUnmount() {
        this.#inner = null;
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'DHLTracker', {
        value: DHLTracker, writable: false, enumerable: false, configurable: false,
    });
}

export default DHLTracker;
