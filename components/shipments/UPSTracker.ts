/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/shipments/UPSTracker
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * UPSTracker — concrete tracker for UPS shipments. UPS tracking numbers are
 * very recognisable: they almost always start with `1Z` followed by 16
 * alphanumeric characters. Brand colour UPS Brown #644117 + Yellow #ffcc00.
 *
 *   <arianna-ups-tracker tracking-number="1Z999AA10123456784"></arianna-ups-tracker>
 *
 * Composes a base `Tracker` internally. Custom tag `arianna-ups-tracker`.
 *
 * Events: bubble through unchanged
 * Attributes:  tracking-number, locale
 */
import { Component, Templates } from '../../core/index.ts';
import { Tracker, type CarrierConfig, type TrackingEvent } from './Tracker.ts';
const html = Templates.Template.Html;
const UPS: CarrierConfig = {
    id: 'ups',
    name: 'UPS',
    color: '#644117',
    publicUrl: 'https://www.ups.com/track?tracknum={n}',
    pattern: /^1Z[0-9A-Z]{16}$/i,
    logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 22"><rect width="64" height="22" rx="3" fill="#644117"/><text x="32" y="16" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="900" fill="#ffcc00" letter-spacing="1">UPS</text></svg>`,
};
export interface UPSTrackerOptions {
    trackingNumber?: string;
    events?: TrackingEvent[];
    locale?: string;
}
@Component('arianna-ups-tracker', {}, {
    Attributes: ['tracking-number', 'locale'],
})
export class UPSTracker extends HTMLElement {
    /** Compiler-visible template slot installed by @Component. */
    declare template: unknown;
    #inner: Tracker | null = null;
    onConnected(_opts: UPSTrackerOptions = {}) {
        this.template = html `<div class="ar-carrier-host" data-r="host"></div>`;
    }
    static get carrier(): CarrierConfig { return UPS; }
    get carrier(): CarrierConfig { return UPS; }
    setTrackingNumber(n: string): this {
        this.setAttribute('tracking-number', n);
        if (this.#inner)
            this.#inner.setTrackingNumber(n);
        return this;
    }
    getTrackingNumber(): string { return this.getAttribute('tracking-number') ?? ''; }
    setEvents(events: TrackingEvent[]): this {
        if (this.#inner)
            this.#inner.setEvents(events);
        return this;
    }
    getEvents(): TrackingEvent[] { return this.#inner?.getEvents() ?? []; }
    validateNumber(n: string): boolean {
        return UPS.pattern ? UPS.pattern.test(n) : n.length > 0;
    }
    onCreated() { }
    onBeforeMount() { }
    onMount() {
        const host = this.querySelector<HTMLElement>('[data-r="host"]');
        if (!host)
            return;
        const inner = new Tracker();
        inner.setCarrier(UPS);
        const n = this.getAttribute('tracking-number');
        if (n)
            inner.setTrackingNumber(n);
        const loc = this.getAttribute('locale');
        if (loc)
            inner.setAttribute('locale', loc);
        host.appendChild(inner);
        this.#inner = inner;
    }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { this.#inner = null; }
}
/* ──────────────────────────────────────────────────────────────────────────
 * UPSTracker namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace UPSTracker {
    export namespace Interfaces {
        export interface Options extends UPSTrackerOptions {
        }
    }
}
export default UPSTracker;
