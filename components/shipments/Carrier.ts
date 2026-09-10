/**
 * @module components/shipments/Carrier
 * @author Riccardo Angeli
 * @version 2.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 */

import { Tracker } from './Tracker.ts';
import { ShipmentCreate } from './Create.ts';
import { MountShipmentTemplate } from './Base.ts';
import type { ShipmentProviderConfig } from './Providers.ts';

declare const Component: any;
declare const Css: any;
declare const Reactivity: any;
declare const Templates: any;

export namespace CarrierShipment
{
    export type Mode = 'create' | 'track';
    const signal = Reactivity.CreateSignal as <T = unknown>(value?: T) => any;
    export const html = Templates.Template.Html;

    @Component('arianna-carrier-shipment', {}, {
        shadow: false,
        Attributes: ['mode', 'tracking-number', 'locale', 'api-url', 'track-api-url', 'create-api-url', 'api-token'],
    })
    export class CarrierShipment extends HTMLElement
    {
        public static readonly Styles = CarrierShipment.DefaultSheet();
        declare template: unknown;
        declare provider$: any;
        declare mode$: any;
        private _child: Tracker.Tracker | ShipmentCreate.ShipmentCreate | null = null;

        private readonly _AriannaIdentity = (() => {
            const type = 'CarrierShipment';
            for(const cls of Array.from(this.classList)) if(cls.startsWith('__real-')) this.classList.remove(cls);
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
            if(!this.provider$) this.provider$ = signal<ShipmentProviderConfig | null>(null);
            if(!this.mode$) this.mode$ = signal<Mode>('track');
        }

        onConnected()
        {
            if(!this.provider$) this.provider$ = signal<ShipmentProviderConfig | null>(null);
            if(!this.mode$) this.mode$ = signal<Mode>('track');
            if(this.dataset.ariannaFolderReady === 'true') return;

            const mode = (this.getAttribute('mode') ?? '').toLowerCase();
            if(mode === 'create' || mode === 'track') this.mode$.Set(mode);
            else this.setAttribute('mode', 'track');

            (this as any).logoHtml = () => this.provider$.Get()?.logo ?? '';
            (this as any).providerName = () => this.provider$.Get()?.name ?? 'Shipment';
            (this as any).headerStyle = () => {
                const provider = this.provider$.Get();
                const color = provider?.color;
                const contrast = provider?.id === 'poste-italiane' ? '#171717' : '#ffffff';
                return color ? `--ar-carrier:${color};--ar-carrier-contrast:${contrast}` : '--ar-carrier-contrast:#ffffff';
            };
            (this as any).onCreateMode = () => this.setMode('create');
            (this as any).onTrackMode = () => this.setMode('track');

            this.template = html `
            <section class="ar-carrier" :style="this.headerStyle()">
                <header class="ar-carrier__header">
                    <span class="ar-carrier__logo" a-if="this.logoHtml()" a-html="this.logoHtml()"></span>
                    <strong class="ar-carrier__name">{{ this.providerName() }}</strong>
                    <nav class="ar-carrier__tabs" aria-label="Shipment actions">
                        <button type="button" class="ar-carrier__tab ar-carrier__tab--create" @click="this.onCreateMode">Create</button>
                        <button type="button" class="ar-carrier__tab ar-carrier__tab--track" @click="this.onTrackMode">Track</button>
                    </nav>
                </header>
                <div class="ar-carrier__body" data-r="body"></div>
            </section>`;

            MountShipmentTemplate(this);
            this.dataset.ariannaFolderReady = 'true';
            (this as any).Sheet = CarrierShipment.DefaultSheet();
            queueMicrotask(() => this.renderMode());
        }

        setProvider(provider: ShipmentProviderConfig): this
        {
            this.provider$.Set(provider);
            queueMicrotask(() => this.renderMode());
            return this;
        }

        getProvider(): ShipmentProviderConfig | null
        {
            return this.provider$.Get();
        }

        setMode(mode: Mode): this
        {
            this.mode$.Set(mode);
            this.setAttribute('mode', mode);
            this.renderMode();
            this.dispatchEvent(new CustomEvent('arianna:shipment-mode', { bubbles: true, detail: { provider: this.provider$.Get()?.id ?? null, mode } }));
            return this;
        }

        getMode(): Mode
        {
            return this.mode$.Get();
        }

        setTrackingNumber(value: string): this
        {
            this.setAttribute('tracking-number', value);
            if(this._child instanceof Tracker.Tracker) this._child.setTrackingNumber(value);
            return this;
        }

        getTrackingNumber(): string
        {
            return this.getAttribute('tracking-number') ?? '';
        }

        setEvents(events: Tracker.TrackingEvent[]): this
        {
            if(this._child instanceof Tracker.Tracker) this._child.setEvents(events);
            return this;
        }

        getEvents(): Tracker.TrackingEvent[]
        {
            return this._child instanceof Tracker.Tracker ? this._child.getEvents() : [];
        }

        private copyAttribute(target: HTMLElement, name: string, targetName = name): void
        {
            const value = this.getAttribute(name);
            if(value != null) target.setAttribute(targetName, value);
        }

        private renderMode(): void
        {
            if(this.dataset.ariannaFolderReady !== 'true') return;
            const provider = this.provider$.Get();
            const mount = this.querySelector<HTMLElement>('[data-r="body"]');
            if(!provider || !mount) return;

            this._child?.remove();
            this._child = null;
            mount.replaceChildren();

            if(this.mode$.Get() === 'create')
            {
                const create = new ShipmentCreate.ShipmentCreate();
                create.setProvider(provider);
                this.copyAttribute(create, 'api-url');
                this.copyAttribute(create, 'create-api-url');
                this.copyAttribute(create, 'api-token');
                this.copyAttribute(create, 'locale');
                mount.append(create);
                this._child = create;
                return;
            }

            const tracker = new Tracker.Tracker();
            tracker.setCarrier(provider);
            tracker.setAttribute('hide-header', 'true');
            const number = this.getAttribute('tracking-number');
            if(number) tracker.setTrackingNumber(number);
            const trackApi = this.getAttribute('track-api-url');
            if(trackApi) tracker.setAttribute('api-url', trackApi);
            else this.copyAttribute(tracker, 'api-url');
            this.copyAttribute(tracker, 'api-token');
            this.copyAttribute(tracker, 'locale');
            mount.append(tracker);
            this._child = tracker;
        }

        static DefaultSheet(): any
        {
            const Rule = Css.Rule;
            return new Css.Stylesheet([
                new Rule('.CarrierShipment', { display:'block', maxWidth:'760px', color:'var(--arianna-text)', fontFamily:'-apple-system,system-ui,sans-serif' }),
                new Rule('.ar-carrier', { overflow:'hidden', border:'1px solid var(--arianna-border)', borderRadius:'12px', background:'var(--arianna-bg)' }),
                new Rule('.ar-carrier__header', { display:'flex', alignItems:'center', gap:'12px', minHeight:'58px', padding:'10px 12px 10px 16px', background:'var(--arianna-bg-2)', borderBottom:'1px solid var(--arianna-border)', borderLeft:'4px solid var(--ar-carrier,var(--arianna-primary))' }),
                new Rule('.ar-carrier__logo', { display:'inline-flex', alignItems:'center', justifyContent:'flex-start', width:'104px', height:'34px', flexShrink:'0' }),
                new Rule('.ar-carrier__logo img, .ar-carrier__logo svg', { display:'block', maxWidth:'104px', maxHeight:'34px', width:'auto', height:'auto', objectFit:'contain' }),
                new Rule('.ar-carrier__name', { fontSize:'14px', flex:'1', minWidth:'0' }),
                new Rule('.ar-carrier__tabs', { display:'inline-grid', gridTemplateColumns:'repeat(2,minmax(72px,1fr))', alignItems:'center', gap:'4px', padding:'3px', border:'1px solid var(--arianna-border)', borderRadius:'10px', background:'var(--arianna-bg-3)' }),
                new Rule('.ar-carrier__tab', { appearance:'none', minHeight:'32px', border:'1px solid transparent', borderRadius:'7px', background:'var(--arianna-bg)', color:'var(--arianna-muted)', cursor:'pointer', padding:'7px 14px', font:'inherit', fontSize:'12px', lineHeight:'1', fontWeight:'700', letterSpacing:'.01em', transition:'background .14s ease,border-color .14s ease,color .14s ease,box-shadow .14s ease,transform .14s ease' }),
                new Rule('.ar-carrier__tab:hover', { borderColor:'var(--ar-carrier,var(--arianna-primary))', color:'var(--arianna-text)' }),
                new Rule('.ar-carrier__tab:focus-visible', { outline:'2px solid var(--ar-carrier,var(--arianna-primary))', outlineOffset:'2px' }),
                new Rule('.ar-carrier__tab:active', { transform:'translateY(1px)' }),
                new Rule('.CarrierShipment[mode="create"] .ar-carrier__tab--create, .CarrierShipment[mode="track"] .ar-carrier__tab--track', { background:'var(--ar-carrier,var(--arianna-primary))', borderColor:'var(--ar-carrier,var(--arianna-primary))', color:'var(--ar-carrier-contrast,#fff)', boxShadow:'0 1px 3px rgba(0,0,0,.22)' }),
                new Rule('.ar-carrier__body', { padding:'12px' }),
                new Rule('.ar-carrier__body > .Tracker, .ar-carrier__body > .ShipmentCreate', { maxWidth:'none' }),
            ]);
        }
    }
}

export default CarrierShipment;
