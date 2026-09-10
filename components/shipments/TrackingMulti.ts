/**
 * @module components/shipments/TrackingMulti
 * @author Riccardo Angeli
 * @version 2.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 */

import { DHLTracker } from './DHLTracker.ts';
import { UPSTracker } from './UPSTracker.ts';
import { FedExTracker } from './FedExTracker.ts';
import { BRTTracker } from './BRTTracker.ts';
import { GLSTracker } from './GLSTracker.ts';
import { PosteItalianeTracker } from './PosteItalianeTracker.ts';
import { ShipmentProviders, type ShipmentProviderId } from './Providers.ts';
import type { TrackingEvent } from './Tracker.ts';
import { MountShipmentTemplate } from './Base.ts';

declare const Component: any;
declare const Css: any;
declare const Reactivity: any;
declare const Templates: any;

export namespace TrackingMulti
{
    export namespace Types
    {
        export type CarrierId = ShipmentProviderId;
    }

    export namespace Interfaces
    {
        export interface TrackingMultiOptions
        {
            trackingNumber?: string;
            carrier?: Types.CarrierId;
            showInput?: boolean;
            locale?: string;
            mode?: 'create' | 'track';
            apiUrl?: string;
            trackApiUrl?: string;
            createApiUrl?: string;
            apiToken?: string;
            events?: TrackingEvent[];
        }

        export interface CarrierEntry
        {
            id: Types.CarrierId;
            name: string;
            logo: string;
            pattern: RegExp;
            make: () => HTMLElement & {
                setTrackingNumber(value: string): unknown;
                setEvents(events: TrackingEvent[]): unknown;
                setMode?(mode: 'create' | 'track'): unknown;
            };
        }
    }

    const signal = Reactivity.CreateSignal as <T = unknown>(value?: T) => any;
    export const html = Templates.Template.Html;
    const cast = <T extends HTMLElement>(value: T) => value as unknown as Interfaces.CarrierEntry['make'] extends () => infer R ? R : never;

    export const CARRIERS: readonly Interfaces.CarrierEntry[] = Object.freeze([
        { id:'dhl', name:'DHL', logo:ShipmentProviders.DHL.logo ?? '', pattern:ShipmentProviders.DHL.pattern!, make:() => cast(new DHLTracker.DHLTracker()) },
        { id:'ups', name:'UPS', logo:ShipmentProviders.UPS.logo ?? '', pattern:ShipmentProviders.UPS.pattern!, make:() => cast(new UPSTracker.UPSTracker()) },
        { id:'fedex', name:'FedEx', logo:ShipmentProviders.FedEx.logo ?? '', pattern:ShipmentProviders.FedEx.pattern!, make:() => cast(new FedExTracker.FedExTracker()) },
        { id:'brt', name:'BRT', logo:ShipmentProviders.BRT.logo ?? '', pattern:ShipmentProviders.BRT.pattern!, make:() => cast(new BRTTracker.BRTTracker()) },
        { id:'poste-italiane', name:'Poste Italiane', logo:ShipmentProviders.PosteItaliane.logo ?? '', pattern:ShipmentProviders.PosteItaliane.pattern!, make:() => cast(new PosteItalianeTracker.PosteItalianeTracker()) },
        { id:'gls', name:'GLS', logo:ShipmentProviders.GLS.logo ?? '', pattern:ShipmentProviders.GLS.pattern!, make:() => cast(new GLSTracker.GLSTracker()) },
    ]);

    @Component('arianna-tracking-multi', {}, {
        shadow: false,
        Attributes: ['tracking-number','carrier','show-input','locale','mode','api-url','track-api-url','create-api-url','api-token'],
    })
    export class TrackingMulti extends HTMLElement
    {
        public static readonly Styles = TrackingMulti.DefaultSheet();
        declare template: unknown;
        declare candidates$: any;
        private _activeTracker: (HTMLElement & { setTrackingNumber(value:string):unknown; setEvents(events:TrackingEvent[]):unknown; setMode?(mode:'create'|'track'):unknown }) | null = null;
        private _pendingEvents: TrackingEvent[] = [];

        private readonly _AriannaIdentity = (() => {
            const type = 'TrackingMulti';
            for(const name of Array.from(this.classList)) if(name.startsWith('__real-')) this.classList.remove(name);
            this.classList.add(type);
            const g = globalThis as typeof globalThis & { __AriannaComponentIds?: Record<string, number> };
            const ids = g.__AriannaComponentIds ??= Object.create(null);
            const n = ids[type] = (ids[type] ?? 0) + 1;
            this.id = `${type}-${n}`;
            return true;
        })();

        constructor()
        {
            super();
            if(!this.candidates$) this.candidates$ = signal<Types.CarrierId[]>([]);
        }

        onConnected()
        {
            if(!this.candidates$) this.candidates$ = signal<Types.CarrierId[]>([]);
            if(this.dataset.ariannaFolderReady === 'true') return;

            (this as any).showInput = () => this.getAttribute('show-input') !== 'false';
            (this as any).logos = () => CARRIERS.map(c => ({ id:c.id, name:c.name, logo:c.logo }));
            (this as any).candidateList = () => this.candidates$.Get().map((id: Types.CarrierId) => {
                const entry = CARRIERS.find(c => c.id === id)!;
                return { id, name:entry.name, logo:entry.logo };
            });
            (this as any).hasCandidates = () => this.candidates$.Get().length > 1;
            (this as any).onInput = (event: Event) => this.setTrackingNumber((event.target as HTMLInputElement).value);
            (this as any).onDetect = () => this.detectAndMount();
            (this as any).onCandidate = (event: Event) => {
                const id = (event.currentTarget as HTMLElement).dataset.carrier as Types.CarrierId | undefined;
                if(id) this.setCarrier(id);
            };

            this.template = html `
            <section class="ar-trkm">
                <header class="ar-trkm__header">
                    <strong>Shipments</strong>
                    <span class="ar-trkm__logos" a-for="p in this.logos()">
                        <span class="ar-trkm__brand" :title="p.name" a-html="p.logo"></span>
                    </span>
                </header>
                <div class="ar-trkm__inputrow" a-if="this.showInput()">
                    <input type="text" placeholder="Tracking number" :value="this.getTrackingNumber()" @input="this.onInput"/>
                    <button type="button" @click="this.onDetect">Detect carrier</button>
                </div>
                <div class="ar-trkm__candidates" a-if="this.hasCandidates()">
                    <button type="button" a-for="c in this.candidateList()" :data-carrier="c.id" @click="this.onCandidate">
                        <span class="ar-trkm__candlogo" a-html="c.logo"></span><span>{{ c.name }}</span>
                    </button>
                </div>
                <div class="ar-trkm__mount" data-r="mount"></div>
            </section>`;

            MountShipmentTemplate(this);
            this.dataset.ariannaFolderReady = 'true';
            (this as any).Sheet = TrackingMulti.DefaultSheet();
            queueMicrotask(() => {
                const carrier = this.getAttribute('carrier') as Types.CarrierId | null;
                if(carrier) this.mountCarrier(carrier);
                else if(this.getTrackingNumber()) this.detectAndMount();
            });
        }

        setTrackingNumber(value: string): this
        {
            this.setAttribute('tracking-number', value);
            this._activeTracker?.setTrackingNumber(value);
            return this;
        }

        getTrackingNumber(): string
        {
            return this.getAttribute('tracking-number') ?? '';
        }

        setCarrier(id: Types.CarrierId): this
        {
            if(!CARRIERS.some(c => c.id === id)) return this;
            this.setAttribute('carrier', id);
            this.candidates$.Set([]);
            this.mountCarrier(id);
            return this;
        }

        getCarrier(): Types.CarrierId | null
        {
            const id = this.getAttribute('carrier') as Types.CarrierId | null;
            return id && CARRIERS.some(c => c.id === id) ? id : null;
        }

        setEvents(events: TrackingEvent[]): this
        {
            this._pendingEvents = events.map(event => ({ ...event }));
            this._activeTracker?.setEvents(this._pendingEvents);
            return this;
        }

        getActive(): HTMLElement | null
        {
            return this._activeTracker;
        }

        private detectAndMount(): void
        {
            const number = this.getTrackingNumber().trim();
            if(!number)
            {
                this.candidates$.Set([]);
                return;
            }
            const candidates = CARRIERS.filter(carrier => carrier.pattern.test(number)).map(carrier => carrier.id);
            this.candidates$.Set(candidates);
            if(candidates.length === 1)
            {
                this.setCarrier(candidates[0]);
                this.dispatchEvent(new CustomEvent('arianna:carrier-detected', { bubbles:true, detail:{ carrier:candidates[0], candidates:[...candidates] } }));
            }
            else
            {
                this.dispatchEvent(new CustomEvent('arianna:carrier-detected', { bubbles:true, detail:{ carrier:null, candidates:[...candidates] } }));
            }
        }

        private mountCarrier(id: Types.CarrierId): void
        {
            if(this.dataset.ariannaFolderReady !== 'true') return;
            const entry = CARRIERS.find(carrier => carrier.id === id);
            const mount = this.querySelector<HTMLElement>('[data-r="mount"]');
            if(!entry || !mount) return;

            this._activeTracker?.remove();
            const tracker = entry.make();
            tracker.setTrackingNumber(this.getTrackingNumber());
            if(this._pendingEvents.length) tracker.setEvents(this._pendingEvents);
            const mode = this.getAttribute('mode');
            if((mode === 'create' || mode === 'track') && tracker.setMode) tracker.setMode(mode);
            for(const attribute of ['locale','api-url','track-api-url','create-api-url','api-token'])
            {
                const value = this.getAttribute(attribute);
                if(value != null) tracker.setAttribute(attribute, value);
            }
            mount.replaceChildren(tracker);
            this._activeTracker = tracker;
        }

        onUnmount()
        {
            this._activeTracker = null;
        }

        static DefaultSheet(): any
        {
            const Rule = Css.Rule;
            return new Css.Stylesheet([
                new Rule('.TrackingMulti', { display:'block', maxWidth:'760px', color:'var(--arianna-text)', fontFamily:'-apple-system,system-ui,sans-serif' }),
                new Rule('.ar-trkm', { display:'grid', gap:'10px' }),
                new Rule('.ar-trkm__header', { display:'flex', alignItems:'center', gap:'12px', minHeight:'46px', padding:'8px 12px', border:'1px solid var(--arianna-border)', borderRadius:'10px', background:'var(--arianna-bg-2)' }),
                new Rule('.ar-trkm__header strong', { marginRight:'auto' }),
                new Rule('.ar-trkm__logos', { display:'contents' }),
                new Rule('.ar-trkm__brand', { display:'inline-flex', alignItems:'center', justifyContent:'center', width:'44px', height:'22px' }),
                new Rule('.ar-trkm__brand img, .ar-trkm__brand svg', { display:'block', maxWidth:'44px', maxHeight:'22px', width:'auto', height:'auto', objectFit:'contain' }),
                new Rule('.ar-trkm__inputrow', { display:'flex', gap:'8px' }),
                new Rule('.ar-trkm__inputrow input', { flex:'1', minWidth:'0', border:'1px solid var(--arianna-border)', borderRadius:'7px', background:'var(--arianna-bg)', color:'var(--arianna-text)', padding:'9px 10px' }),
                new Rule('.ar-trkm__inputrow button', { border:'0', borderRadius:'7px', background:'var(--arianna-primary)', color:'#fff', fontWeight:'700', padding:'0 14px', cursor:'pointer' }),
                new Rule('.ar-trkm__candidates', { display:'flex', flexWrap:'wrap', gap:'7px' }),
                new Rule('.ar-trkm__candidates button', { display:'inline-flex', alignItems:'center', gap:'7px', border:'1px solid var(--arianna-border)', borderRadius:'7px', background:'var(--arianna-bg-2)', color:'var(--arianna-text)', padding:'7px 10px', cursor:'pointer' }),
                new Rule('.ar-trkm__candlogo', { display:'inline-flex', alignItems:'center', width:'48px', height:'20px' }),
                new Rule('.ar-trkm__candlogo img, .ar-trkm__candlogo svg', { display:'block', maxWidth:'48px', maxHeight:'20px', width:'auto', height:'auto', objectFit:'contain' }),
            ]);
        }
    }
}

export default TrackingMulti;
