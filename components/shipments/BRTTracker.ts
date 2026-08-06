/**
 * @module    components/shipments/BRTTracker
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA BRTTracker component module.
 */

import { Component, Templates } from '../../core/index.ts';
import { Tracker, type CarrierConfig, type TrackingEvent } from './Tracker.ts';

/** @namespace   BRTTracker
 *  @public
 *  @description Namespace containing BRTTracker contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace BRTTracker
{
    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   BRTTrackerOptions
         *  @public
         *  @description BRTTrackerOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface BRTTrackerOptions
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

    /** @name        BRT
     *  @public
     *  @type        {CarrierConfig}
     *  @description Namespace-owned BRT value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const BRT: CarrierConfig = {
        id: 'brt',
        name: 'BRT',
        color: '#e30613',
        publicUrl: 'https://vas.brt.it/vas/sped_det_show.hsm?referer=sped_numspe_par.htm&Nspedizione={n}',
        pattern: /^\d{10,12}$/,
        logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 22"><rect width="64" height="22" rx="3" fill="#e30613"/><text x="32" y="16" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="900" fill="#fff" letter-spacing="1">BRT</text></svg>`,
    };

    /** @class       BRTTracker
     *  @public
     *  @description AriannA BRTTracker component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-brt-tracker', {}, {
        Attributes: ['tracking-number', 'locale'],
    })
    export class BRTTracker extends HTMLElement
    {
        /** Compiler-visible template slot installed by the Component decorator. */
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
         *  @param       {BRTTracker.Interfaces.BRTTrackerOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.BRTTrackerOptions = {})
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
        static get carrier(): CarrierConfig { return BRT; }

        /** @name        carrier
         *  @public
         *  @type        {CarrierConfig}
         *  @description Component member for carrier.
         *  @returns     {CarrierConfig} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get carrier(): CarrierConfig { return BRT; }

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
        getEvents(): TrackingEvent[] { return this.#inner?.getEvents() ?? []; }

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
            return BRT.pattern ? BRT.pattern.test(n) : n.length > 0;
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
            inner.setCarrier(BRT);

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
        onUnmount() { this.#inner = null; }
    }
}
export default BRTTracker;
