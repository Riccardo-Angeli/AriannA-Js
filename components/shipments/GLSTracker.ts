/**
 * @module components/shipments/GLSTracker
 * @author Riccardo Angeli
 * @version 2.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 */

import { CarrierShipment } from './Carrier.ts';
import { ShipmentProviders, type ShipmentProviderConfig } from './Providers.ts';
import type { TrackingEvent } from './Tracker.ts';
import { MountShipmentTemplate } from './Base.ts';

declare const Component: any;
declare const Templates: any;

export namespace GLSTracker
{
    export namespace Interfaces
    {
        export interface GLSTrackerOptions
        {
            trackingNumber?: string;
            events?: TrackingEvent[];
            locale?: string;
            mode?: CarrierShipment.Mode;
            apiUrl?: string;
            trackApiUrl?: string;
            createApiUrl?: string;
            apiToken?: string;
        }
    }

    export const html = Templates.Template.Html;
    export const GLS: ShipmentProviderConfig = ShipmentProviders.GLS;

    @Component('arianna-gls-tracker', {}, {
        shadow: false,
        Attributes: ['mode', 'tracking-number', 'locale', 'api-url', 'track-api-url', 'create-api-url', 'api-token'],
    })
    export class GLSTracker extends HTMLElement
    {
        declare template: unknown;
        private _inner: CarrierShipment.CarrierShipment | null = null;

        private readonly _AriannaIdentity = (() => {
            const type = 'GLSTracker';
            for(const name of Array.from(this.classList)) if(name.startsWith('__real-')) this.classList.remove(name);
            this.classList.add(type);
            const g = globalThis as typeof globalThis & { __AriannaComponentIds?: Record<string, number> };
            const ids = g.__AriannaComponentIds ??= Object.create(null);
            const n = ids[type] = (ids[type] ?? 0) + 1;
            this.id = `${type}-${n}`;
            return true;
        })();

        static get carrier(): ShipmentProviderConfig { return GLS; }
        get carrier(): ShipmentProviderConfig { return GLS; }

        onConnected()
        {
            if(this.dataset.ariannaFolderReady === 'true') return;
            this.template = html `<div class="ar-carrier-host" data-r="host"></div>`;
            MountShipmentTemplate(this);
            this.dataset.ariannaFolderReady = 'true';
        }

        onMount()
        {
            const host = this.querySelector<HTMLElement>('[data-r="host"]');
            if(!host) return;
            const inner = new CarrierShipment.CarrierShipment();
            inner.setProvider(GLS);
            for(const attribute of ['mode','tracking-number','locale','api-url','track-api-url','create-api-url','api-token'])
            {
                const value = this.getAttribute(attribute);
                if(value != null) inner.setAttribute(attribute, value);
            }
            host.append(inner);
            this._inner = inner;
            const mode = (this.getAttribute('mode') ?? '').toLowerCase();
            if(mode === 'create' || mode === 'track') inner.setMode(mode);
        }

        setMode(mode: CarrierShipment.Mode): this { this.setAttribute('mode', mode); this._inner?.setMode(mode); return this; }
        getMode(): CarrierShipment.Mode { return this._inner?.getMode() ?? ((this.getAttribute('mode') === 'create') ? 'create' : 'track'); }
        setTrackingNumber(value: string): this { this.setAttribute('tracking-number', value); this._inner?.setTrackingNumber(value); return this; }
        getTrackingNumber(): string { return this._inner?.getTrackingNumber() ?? this.getAttribute('tracking-number') ?? ''; }
        setEvents(events: TrackingEvent[]): this { this._inner?.setEvents(events); return this; }
        getEvents(): TrackingEvent[] { return this._inner?.getEvents() ?? []; }
        validateNumber(value: string): boolean { return GLS.pattern ? GLS.pattern.test(value) : value.trim().length > 0; }
        onUnmount() { this._inner = null; }
    }
}

export default GLSTracker;
