/**
 * @module    components/shipments/DHLTracker
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA DHLTracker component module.
 */

import { Component, Templates } from '../../core/index.ts';
import { Tracker, type CarrierConfig, type TrackingEvent } from './Tracker.ts';

/** @namespace   DHLTracker
 *  @public
 *  @description Namespace containing DHLTracker contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace DHLTracker
{
    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   DHLTrackerOptions
         *  @public
         *  @description DHLTrackerOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface DHLTrackerOptions
        {
            /** @name        trackingNumber
             *  @public
             *  @type        {string}
             *  @description Component member for tracking Number.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            trackingNumber?: string;

            /** @name        events
             *  @public
             *  @type        {TrackingEvent[]}
             *  @description Component member for events.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            events?: TrackingEvent[];

            /** @name        locale
             *  @public
             *  @type        {string}
             *  @description Component member for locale.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            locale?: string;
        }
    }

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;

    /** @name        DHL
     *  @public
     *  @type        {CarrierConfig}
     *  @description Namespace-owned DHL value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const DHL: CarrierConfig = {
        id: 'dhl',
        name: 'DHL',
        color: '#ffcc00',
        publicUrl: 'https://www.dhl.com/global-en/home/tracking.html?tracking-id={n}',
        pattern: /^(\d{10,11}|[A-Z]{3}\d{7})$/i,
        logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 22"><rect width="64" height="22" rx="3" fill="#ffcc00"/><text x="32" y="16" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="900" fill="#d40511" letter-spacing="1">DHL</text></svg>`,
    };

    /** @class       DHLTracker
     *  @public
     *  @description AriannA DHLTracker component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-dhl-tracker', {}, {
        Attributes: ['tracking-number', 'locale'],
    })
    export class DHLTracker extends HTMLElement
    {
        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        #inner
         *  @public
         *  @type        {Tracker | null}
         *  @description Component member for inner.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #inner: Tracker.Tracker | null = null;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {DHLTracker.Interfaces.DHLTrackerOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.DHLTrackerOptions = {})
        {
            this.template = html `<div class="ar-carrier-host" data-r="host"></div>`;
        }

        /** @name        carrier
         *  @public
         *  @static
         *  @type        {CarrierConfig}
         *  @description Component member for carrier.
         *  @returns     {CarrierConfig} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static get carrier(): CarrierConfig { return DHL; }

        /** @name        carrier
         *  @public
         *  @type        {CarrierConfig}
         *  @description Component member for carrier.
         *  @returns     {CarrierConfig} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get carrier(): CarrierConfig { return DHL; }

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
            if (this.#inner)
                this.#inner.setTrackingNumber(n);
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
            if (this.#inner)
                this.#inner.setEvents(events);
            return this;
        }

        /** @name        getEvents
         *  @public
         *  @type        {TrackingEvent[]}
         *  @description Component member for get Events.
         *  @returns     {TrackingEvent[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getEvents(): TrackingEvent[]
        {
            return this.#inner?.getEvents() ?? [];
        }

        /** @name        validateNumber
         *  @public
         *  @type        {boolean}
         *  @description Component member for validate Number.
         *  @param       {string} n Parameter.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        validateNumber(n: string): boolean
        {
            return DHL.pattern ? DHL.pattern.test(n) : n.length > 0;
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
            /** @name        host
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned host value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const host = this.querySelector<HTMLElement>('[data-r="host"]');
            if (!host)
                return;

            /** @name        inner
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned inner value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const inner = new Tracker.Tracker();
            inner.setCarrier(DHL);

            /** @name        n
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned n value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const n = this.getAttribute('tracking-number');
            if (n)
                inner.setTrackingNumber(n);

            /** @name        loc
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned loc value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const loc = this.getAttribute('locale');
            if (loc)
                inner.setAttribute('locale', loc);
            host.appendChild(inner);
            this.#inner = inner;
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
            this.#inner = null;
        }
    }
}
export default DHLTracker;
