/**
 * @module components/shipments/Create
 * @author Riccardo Angeli
 * @version 2.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 */

import { MountShipmentTemplate } from './Base.ts';
import type { ShipmentProviderConfig } from './Providers.ts';

declare const Component: any;
declare const Css: any;
declare const Reactivity: any;
declare const Templates: any;

export namespace ShipmentCreate
{
    export interface Address
    {
        country: string;
        postalCode: string;
        city: string;
        address1: string;
        address2?: string;
        name?: string;
        phone?: string;
        email?: string;
    }

    export interface Parcel
    {
        weightKg: number;
        lengthCm?: number;
        widthCm?: number;
        heightCm?: number;
        content?: string;
    }

    export interface Request
    {
        provider: string;
        from: Address;
        to: Address;
        parcel: Parcel;
        service?: string;
        reference?: string;
    }

    export interface Result
    {
        shipmentId?: string;
        trackingNumber?: string;
        labelUrl?: string;
        price?: number;
        currency?: string;
        raw?: unknown;
    }

    const signal = Reactivity.CreateSignal as <T = unknown>(value?: T) => any;
    export const html = Templates.Template.Html;

    @Component('arianna-shipment-create', {}, {
        shadow: false,
        Attributes: ['api-url', 'create-api-url', 'api-token', 'locale'],
    })
    export class ShipmentCreate extends HTMLElement
    {
        public static readonly Styles = ShipmentCreate.DefaultSheet();
        declare template: unknown;
        declare provider$: any;
        declare busy$: any;
        declare status$: any;
        declare result$: any;

        private readonly _AriannaIdentity = (() => {
            const type = 'ShipmentCreate';
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
            if(!this.busy$) this.busy$ = signal(false);
            if(!this.status$) this.status$ = signal('');
            if(!this.result$) this.result$ = signal<Result | null>(null);
        }

        onConnected()
        {
            if(!this.provider$) this.provider$ = signal<ShipmentProviderConfig | null>(null);
            if(!this.busy$) this.busy$ = signal(false);
            if(!this.status$) this.status$ = signal('');
            if(!this.result$) this.result$ = signal<Result | null>(null);
            if(this.dataset.ariannaFolderReady === 'true') return;

            (this as any).createLabel = () => this.busy$.Get() ? 'Creating…' : 'Create shipment';
            (this as any).statusText = () => this.status$.Get();
            (this as any).hasStatus = () => !!this.status$.Get();
            (this as any).hasResult = () => !!this.result$.Get();
            (this as any).resultTracking = () => this.result$.Get()?.trackingNumber ?? '';
            (this as any).resultLabel = () => this.result$.Get()?.labelUrl ?? '';
            (this as any).apiNote = () => {
                const p = this.provider$.Get();
                if(!p) return '';
                const capability = p.api.create;
                if(capability?.documented)
                    return `${p.name} shipping API is documented; browser credentials are intentionally not stored here. Configure create-api-url/api-url to your server adapter.`;
                return `${p.name}: no open public create API is configured. Create falls back to the official provider portal unless create-api-url/api-url is supplied.`;
            };
            (this as any).onCreate = () => { void this.createShipment(); };
            (this as any).onPortal = () => this.openCreatePortal();

            this.template = html `
            <div class="ar-shc">
                <div class="ar-shc__grid ar-shc__grid--2">
                    <section class="ar-shc__card">
                        <h3>From</h3>
                        <div class="ar-shc__grid ar-shc__grid--2">
                            <label><span>Country</span><input data-field="from.country" value="IT" autocomplete="country-code"/></label>
                            <label><span>Postal code</span><input data-field="from.postalCode" autocomplete="postal-code"/></label>
                        </div>
                        <label><span>City</span><input data-field="from.city" autocomplete="address-level2"/></label>
                        <label><span>Address</span><input data-field="from.address1" autocomplete="street-address"/></label>
                    </section>
                    <section class="ar-shc__card">
                        <h3>To</h3>
                        <div class="ar-shc__grid ar-shc__grid--2">
                            <label><span>Country</span><input data-field="to.country" value="IT" autocomplete="country-code"/></label>
                            <label><span>Postal code</span><input data-field="to.postalCode" autocomplete="postal-code"/></label>
                        </div>
                        <label><span>City</span><input data-field="to.city" autocomplete="address-level2"/></label>
                        <label><span>Address</span><input data-field="to.address1" autocomplete="street-address"/></label>
                    </section>
                </div>

                <section class="ar-shc__card">
                    <h3>Parcel</h3>
                    <div class="ar-shc__grid ar-shc__grid--4">
                        <label><span>Weight · kg</span><input data-field="parcel.weightKg" inputmode="decimal" placeholder="2"/></label>
                        <label><span>Length · cm</span><input data-field="parcel.lengthCm" inputmode="decimal" placeholder="20"/></label>
                        <label><span>Width · cm</span><input data-field="parcel.widthCm" inputmode="decimal" placeholder="15"/></label>
                        <label><span>Height · cm</span><input data-field="parcel.heightCm" inputmode="decimal" placeholder="10"/></label>
                    </div>
                    <div class="ar-shc__grid ar-shc__grid--2">
                        <label><span>Contents</span><input data-field="parcel.content" placeholder="Goods"/></label>
                        <label><span>Reference</span><input data-field="reference" placeholder="Order / reference"/></label>
                    </div>
                </section>

                <div class="ar-shc__note">{{ this.apiNote() }}</div>
                <div class="ar-shc__status" a-if="this.hasStatus()">{{ this.statusText() }}</div>
                <div class="ar-shc__result" a-if="this.hasResult()">
                    <span a-if="this.resultTracking()">Tracking: <strong>{{ this.resultTracking() }}</strong></span>
                    <a a-if="this.resultLabel()" :href="this.resultLabel()" target="_blank" rel="noopener">Open label</a>
                </div>
                <div class="ar-shc__actions">
                    <button type="button" class="ar-shc__secondary" @click="this.onPortal">Official portal</button>
                    <button type="button" class="ar-shc__primary" :disabled="this.busy$.Get()" @click="this.onCreate">{{ this.createLabel() }}</button>
                </div>
            </div>`;

            MountShipmentTemplate(this);
            this.dataset.ariannaFolderReady = 'true';
            (this as any).Sheet = ShipmentCreate.DefaultSheet();
        }

        setProvider(provider: ShipmentProviderConfig): this
        {
            this.provider$.Set(provider);
            return this;
        }

        getProvider(): ShipmentProviderConfig | null
        {
            return this.provider$.Get();
        }

        private value(path: string): string
        {
            return this.querySelector<HTMLInputElement>(`[data-field="${path}"]`)?.value.trim() ?? '';
        }

        private number(path: string): number | undefined
        {
            const raw = this.value(path).replace(',', '.');
            if(!raw) return undefined;
            const n = Number(raw);
            return Number.isFinite(n) ? n : undefined;
        }

        getRequest(): Request | null
        {
            const provider = this.provider$.Get();
            if(!provider) return null;
            const request: Request = {
                provider: provider.id,
                from: {
                    country: this.value('from.country') || 'IT',
                    postalCode: this.value('from.postalCode'),
                    city: this.value('from.city'),
                    address1: this.value('from.address1'),
                },
                to: {
                    country: this.value('to.country') || 'IT',
                    postalCode: this.value('to.postalCode'),
                    city: this.value('to.city'),
                    address1: this.value('to.address1'),
                },
                parcel: {
                    weightKg: this.number('parcel.weightKg') ?? 0,
                    lengthCm: this.number('parcel.lengthCm'),
                    widthCm: this.number('parcel.widthCm'),
                    heightCm: this.number('parcel.heightCm'),
                    content: this.value('parcel.content') || undefined,
                },
                reference: this.value('reference') || undefined,
            };
            return request;
        }

        private resolveEndpoint(provider: ShipmentProviderConfig): string
        {
            const explicit = (this.getAttribute('create-api-url') ?? '').trim();
            if(explicit) return explicit.replaceAll('{carrier}', encodeURIComponent(provider.id));
            const root = (this.getAttribute('api-url') ?? '').trim();
            if(!root) return '';
            if(root.includes('{operation}') || root.includes('{carrier}'))
                return root
                    .replaceAll('{operation}', 'create')
                    .replaceAll('{carrier}', encodeURIComponent(provider.id));
            return `${root.replace(/\/$/, '')}/${encodeURIComponent(provider.id)}/create`;
        }

        async createShipment(): Promise<void>
        {
            const provider = this.provider$.Get();
            const request = this.getRequest();
            if(!provider || !request)
            {
                this.status$.Set('Select a shipment provider.');
                return;
            }
            if(!request.from.postalCode || !request.to.postalCode || !request.from.address1 || !request.to.address1 || request.parcel.weightKg <= 0)
            {
                this.status$.Set('Origin, destination, postal codes and parcel weight are required.');
                return;
            }

            const endpoint = this.resolveEndpoint(provider);
            if(!endpoint)
            {
                this.status$.Set('No create API endpoint configured. Opening the official provider portal.');
                this.dispatchEvent(new CustomEvent('arianna:shipment-create-request', { bubbles: true, detail: { provider: provider.id, request, api: false } }));
                this.openCreatePortal();
                return;
            }

            this.busy$.Set(true);
            this.status$.Set('');
            this.result$.Set(null);
            try
            {
                const headers: Record<string, string> = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
                const token = (this.getAttribute('api-token') ?? '').trim();
                if(token) headers.Authorization = `Bearer ${token}`;
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers,
                    credentials: 'same-origin',
                    body: JSON.stringify(request),
                });
                if(!response.ok) throw new Error(`Shipment API ${response.status} ${response.statusText}`);
                const raw = await response.json() as any;
                const result: Result = {
                    shipmentId: raw?.shipmentId ?? raw?.shipment_id ?? raw?.id,
                    trackingNumber: raw?.trackingNumber ?? raw?.tracking_number ?? raw?.tracking,
                    labelUrl: raw?.labelUrl ?? raw?.label_url ?? raw?.label,
                    price: typeof raw?.price === 'number' ? raw.price : undefined,
                    currency: raw?.currency,
                    raw,
                };
                this.result$.Set(result);
                this.status$.Set('Shipment created.');
                this.dispatchEvent(new CustomEvent('arianna:shipment-created', { bubbles: true, detail: { provider: provider.id, request, result } }));
            }
            catch(error)
            {
                const message = error instanceof Error ? error.message : String(error);
                this.status$.Set(message);
                this.dispatchEvent(new CustomEvent('arianna:shipment-create-error', { bubbles: true, detail: { provider: provider.id, request, message } }));
            }
            finally
            {
                this.busy$.Set(false);
            }
        }

        openCreatePortal(): void
        {
            const provider = this.provider$.Get();
            if(!provider?.createUrl) return;
            this.dispatchEvent(new CustomEvent('arianna:shipment-portal', { bubbles: true, detail: { provider: provider.id, operation: 'create', url: provider.createUrl } }));
            window.open(provider.createUrl, '_blank', 'noopener');
        }

        static DefaultSheet(): any
        {
            const Rule = Css.Rule;
            return new Css.Stylesheet([
                new Rule('.ShipmentCreate', { display:'block', color:'var(--arianna-text)', fontFamily:'-apple-system,system-ui,sans-serif' }),
                new Rule('.ar-shc', { display:'grid', gap:'12px' }),
                new Rule('.ar-shc__grid', { display:'grid', gap:'10px' }),
                new Rule('.ar-shc__grid--2', { gridTemplateColumns:'repeat(2,minmax(0,1fr))' }),
                new Rule('.ar-shc__grid--4', { gridTemplateColumns:'repeat(4,minmax(0,1fr))' }),
                new Rule('.ar-shc__card', { background:'var(--arianna-bg-2)', border:'1px solid var(--arianna-border)', borderRadius:'10px', padding:'14px', display:'grid', gap:'10px' }),
                new Rule('.ar-shc__card h3', { margin:'0', fontSize:'13px', fontWeight:'700' }),
                new Rule('.ar-shc label', { display:'grid', gap:'5px', color:'var(--arianna-muted)', fontSize:'11px' }),
                new Rule('.ar-shc input', { boxSizing:'border-box', width:'100%', border:'1px solid var(--arianna-border)', borderRadius:'7px', background:'var(--arianna-bg)', color:'var(--arianna-text)', padding:'9px 10px', font:'inherit', outline:'none' }),
                new Rule('.ar-shc input:focus', { borderColor:'var(--arianna-primary)', boxShadow:'0 0 0 2px color-mix(in srgb,var(--arianna-primary) 18%,transparent)' }),
                new Rule('.ar-shc__note', { color:'var(--arianna-muted)', fontSize:'11px', lineHeight:'1.45' }),
                new Rule('.ar-shc__status', { padding:'8px 10px', borderRadius:'7px', background:'var(--arianna-bg-3)', color:'var(--arianna-muted)', fontSize:'12px' }),
                new Rule('.ar-shc__result', { display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap', fontSize:'12px' }),
                new Rule('.ar-shc__result a', { color:'var(--arianna-primary)' }),
                new Rule('.ar-shc__actions', { display:'flex', justifyContent:'flex-end', gap:'8px' }),
                new Rule('.ar-shc button', { appearance:'none', borderRadius:'7px', padding:'9px 14px', fontWeight:'700', cursor:'pointer' }),
                new Rule('.ar-shc__primary', { border:'none', background:'var(--arianna-primary)', color:'#fff' }),
                new Rule('.ar-shc__secondary', { border:'1px solid var(--arianna-border)', background:'var(--arianna-bg-2)', color:'var(--arianna-text)' }),
                new Rule('.ar-shc button:disabled', { opacity:'.55', cursor:'wait' }),
            ]);
        }
    }
}

export default ShipmentCreate;
