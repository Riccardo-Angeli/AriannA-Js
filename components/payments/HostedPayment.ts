/**
 * @module components/payments/HostedPayment
 * @author Riccardo Angeli
 * @version 2.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 */

import { MountPaymentTemplate } from './Base.ts';
import type { PaymentProviderConfig } from './Providers.ts';

declare const Component: any;
declare const Css: any;
declare const Reactivity: any;
declare const Templates: any;

export namespace HostedPayment
{
    export interface HostedPaymentOptions
    {
        amount?: number;
        currency?: string;
        reference?: string;
        checkoutUrl?: string;
        apiUrl?: string;
        apiToken?: string;
        returnUrl?: string;
        customerEmail?: string;
        target?: '_self' | '_blank';
    }

    export interface PaymentRequest
    {
        provider: string;
        amount: number;
        currency: string;
        reference?: string;
        returnUrl?: string;
        customerEmail?: string;
    }

    export interface PaymentResult
    {
        status?: string;
        transactionId?: string;
        redirectUrl?: string;
        checkoutUrl?: string;
        paymentUrl?: string;
        qrUrl?: string;
        message?: string;
        [key: string]: unknown;
    }

    const signal = Reactivity.CreateSignal as <T = unknown>(value?: T) => any;
    export const html = Templates.Template.Html;

    @Component('arianna-hosted-payment', {}, {
        shadow:false,
        Attributes:['amount','currency','reference','checkout-url','api-url','api-token','return-url','customer-email','target']
    })
    export class HostedPayment extends HTMLElement
    {
        public static readonly Styles = HostedPayment.DefaultSheet();
        declare template: unknown;
        declare provider$: any;
        declare busy$: any;
        declare status$: any;
        declare result$: any;

        private readonly _AriannaIdentity = (() => {
            const type = 'HostedPayment';
            for(const cls of Array.from(this.classList)) if(cls.startsWith('__real-')) this.classList.remove(cls);
            this.classList.add(type);
            const g = globalThis as typeof globalThis & { __AriannaComponentIds?: Record<string, number> };
            const ids = g.__AriannaComponentIds ??= Object.create(null);
            this.id = `${type}-${ids[type] = (ids[type] ?? 0) + 1}`;
            return true;
        })();

        constructor()
        {
            super();
            if(!this.provider$) this.provider$ = signal<PaymentProviderConfig | null>(null);
            if(!this.busy$) this.busy$ = signal(false);
            if(!this.status$) this.status$ = signal('');
            if(!this.result$) this.result$ = signal<PaymentResult | null>(null);
        }

        onConnected()
        {
            if(!this.provider$) this.provider$ = signal<PaymentProviderConfig | null>(null);
            if(!this.busy$) this.busy$ = signal(false);
            if(!this.status$) this.status$ = signal('');
            if(!this.result$) this.result$ = signal<PaymentResult | null>(null);
            if(this.dataset.ariannaFolderReady === 'true') return;

            (this as any).logoHtml = () => this.provider$.Get()?.logo ?? '';
            (this as any).providerName = () => this.provider$.Get()?.name ?? 'Payment';
            (this as any).providerColor = () => `--ar-payment-provider:${this.provider$.Get()?.color ?? 'var(--arianna-primary)'};--ar-payment-contrast:${this.provider$.Get()?.contrast ?? '#fff'}`;
            const amountText = () => {
                const value = Number(this.getAttribute('amount') ?? '0');
                const currency = this.getAttribute('currency') || 'EUR';
                try { return new Intl.NumberFormat(undefined,{style:'currency',currency}).format(value || 0); }
                catch { return `${currency} ${(value || 0).toFixed(2)}`; }
            };
            (this as any).amountText = amountText;
            (this as any).payLabel = () => this.busy$.Get() ? 'Processing…' : `Pay ${amountText()}`;
            (this as any).statusText = () => this.status$.Get();
            (this as any).hasStatus = () => !!this.status$.Get();
            (this as any).hasResult = () => !!this.result$.Get();
            (this as any).resultId = () => this.result$.Get()?.transactionId ?? '';
            (this as any).apiNote = () => {
                const provider = this.provider$.Get();
                if(!provider) return '';
                if(provider.deprecated && provider.replacement) return `${provider.name} is retained only for compatibility; new integrations should use ${provider.replacement}.`;
                if(provider.api.serverProxyRequired) return `${provider.name}: configure api-url to your merchant server adapter. Provider credentials never belong in browser code.`;
                return provider.api.note ?? '';
            };
            (this as any).onPay = () => { void this.pay(); };
            (this as any).onPortal = () => this.openProviderSite();

            this.template = html `
            <section class="ar-hosted-payment" :style="this.providerColor()">
                <header class="ar-payment-header">
                    <span class="ar-payment-logo" a-if="this.logoHtml()" a-html="this.logoHtml()"></span>
                    <strong class="ar-payment-name">{{ this.providerName() }}</strong>
                </header>
                <div class="ar-hosted-payment__body">
                    <div class="ar-hosted-payment__hero">
                        <div class="ar-hosted-payment__art">
                            <span class="ar-hosted-payment__artlogo" a-if="this.logoHtml()" a-html="this.logoHtml()"></span>
                        </div>
                        <div class="ar-hosted-payment__summary">
                            <div class="ar-hosted-payment__amount">{{ this.amountText() }}</div>
                    <div class="ar-hosted-payment__note">{{ this.apiNote() }}</div>
                        </div>
                    </div>
                    <div class="ar-hosted-payment__status" a-if="this.hasStatus()">{{ this.statusText() }}</div>
                    <div class="ar-hosted-payment__result" a-if="this.hasResult()">
                        <span a-if="this.resultId()">Transaction: <strong>{{ this.resultId() }}</strong></span>
                    </div>
                    <div class="ar-hosted-payment__actions">
                        <button type="button" class="ar-payment-secondary" @click="this.onPortal">Provider</button>
                        <button type="button" class="ar-payment-primary" :disabled="this.busy$.Get()" @click="this.onPay">{{ this.payLabel() }}</button>
                    </div>
                </div>
            </section>`;

            MountPaymentTemplate(this);
            this.dataset.ariannaFolderReady = 'true';
            (this as any).Sheet = HostedPayment.DefaultSheet();
        }

        setProvider(provider: PaymentProviderConfig): this
        {
            this.provider$.Set(provider);
            this.style.setProperty('--ar-payment-provider', provider.color);
            this.style.setProperty('--ar-payment-contrast', provider.contrast ?? '#fff');
            return this;
        }

        getProvider(): PaymentProviderConfig | null { return this.provider$.Get(); }
        setAmount(amount: number): this { this.setAttribute('amount', String(amount)); return this; }
        getAmount(): number { return Number(this.getAttribute('amount') ?? '0') || 0; }
        setCurrency(currency: string): this { this.setAttribute('currency', currency); return this; }
        getCurrency(): string { return this.getAttribute('currency') || 'EUR'; }
        setReference(reference: string): this { this.setAttribute('reference', reference); return this; }

        getRequest(): PaymentRequest | null
        {
            const provider = this.provider$.Get();
            if(!provider) return null;
            return {
                provider:provider.id,
                amount:this.getAmount(),
                currency:this.getCurrency(),
                reference:this.getAttribute('reference') || undefined,
                returnUrl:this.getAttribute('return-url') || undefined,
                customerEmail:this.getAttribute('customer-email') || undefined,
            };
        }

        private endpoint(provider: PaymentProviderConfig): string
        {
            const raw = (this.getAttribute('api-url') ?? '').trim();
            if(!raw) return '';
            if(raw.includes('{provider}') || raw.includes('{operation}'))
                return raw.replaceAll('{provider}',encodeURIComponent(provider.id)).replaceAll('{operation}','pay');
            return `${raw.replace(/\/$/,'')}/${encodeURIComponent(provider.id)}/pay`;
        }

        async pay(): Promise<void>
        {
            const provider = this.provider$.Get();
            const request = this.getRequest();
            if(!provider || !request) { this.status$.Set('Payment provider is not configured.'); return; }
            if(request.amount <= 0) { this.status$.Set('Amount must be greater than zero.'); return; }

            if(provider.deprecated && provider.replacement)
            {
                this.dispatchEvent(new CustomEvent('arianna:payment-deprecated',{bubbles:true,detail:{provider:provider.id,replacement:provider.replacement}}));
            }

            const endpoint = this.endpoint(provider);
            const checkout = (this.getAttribute('checkout-url') ?? '').trim();
            if(!endpoint)
            {
                if(checkout) { this.openUrl(checkout); return; }
                this.status$.Set(`No merchant API endpoint configured for ${provider.name}.`);
                this.dispatchEvent(new CustomEvent('arianna:payment-unconfigured',{bubbles:true,detail:{provider:provider.id}}));
                return;
            }

            this.busy$.Set(true);
            this.status$.Set('');
            this.result$.Set(null);
            this.dispatchEvent(new CustomEvent('arianna:payment-start',{bubbles:true,detail:request}));

            try
            {
                const headers: Record<string,string> = {'Content-Type':'application/json','Accept':'application/json'};
                const token = (this.getAttribute('api-token') ?? '').trim();
                if(token) headers.Authorization = `Bearer ${token}`;
                const response = await fetch(endpoint,{method:'POST',headers,credentials:'same-origin',body:JSON.stringify(request)});
                if(!response.ok) throw new Error(`Payment API ${response.status} ${response.statusText}`);
                const result = await response.json() as PaymentResult;
                this.result$.Set(result);
                this.status$.Set(result.message ?? result.status ?? 'Payment session created.');
                const url = result.redirectUrl ?? result.checkoutUrl ?? result.paymentUrl;
                this.dispatchEvent(new CustomEvent('arianna:payment-session',{bubbles:true,detail:{provider:provider.id,result}}));
                if(url) this.openUrl(url);
            }
            catch(error)
            {
                const message = error instanceof Error ? error.message : String(error);
                this.status$.Set(message);
                this.dispatchEvent(new CustomEvent('arianna:payment-error',{bubbles:true,detail:{provider:provider.id,error}}));
            }
            finally { this.busy$.Set(false); }
        }

        openProviderSite(): void
        {
            const provider = this.provider$.Get();
            const url = provider?.website || provider?.api.docs;
            if(url) this.openUrl(url);
        }

        private openUrl(url: string): void
        {
            const target = (this.getAttribute('target') as '_self'|'_blank'|null) ?? '_blank';
            this.dispatchEvent(new CustomEvent('arianna:payment-redirect',{bubbles:true,detail:{provider:this.provider$.Get()?.id ?? null,url,target}}));
            if(target === '_self') window.location.assign(url);
            else window.open(url,'_blank','noopener');
        }

        static DefaultSheet(): any
        {
            const Rule = Css.Rule;
            return new Css.Stylesheet([
                new Rule('.HostedPayment',{display:'block',maxWidth:'520px',fontFamily:'-apple-system,system-ui,sans-serif',color:'var(--arianna-text)'}),
                new Rule('.ar-hosted-payment',{overflow:'hidden',border:'1px solid var(--arianna-border)',borderRadius:'12px',background:'var(--arianna-bg)'}),
                new Rule('.ar-hosted-payment__body',{display:'grid',gap:'12px',padding:'16px'}),
                new Rule('.ar-hosted-payment__hero',{display:'grid',gridTemplateColumns:'minmax(0,1fr) auto',gap:'14px',alignItems:'center',padding:'14px',border:'1px solid var(--arianna-border)',borderRadius:'12px',background:'linear-gradient(135deg,color-mix(in srgb,var(--ar-payment-provider) 16%,var(--arianna-bg)) 0%, var(--arianna-bg-2) 100%)'}),
                new Rule('.ar-hosted-payment__art',{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'88px',borderRadius:'12px',background:'radial-gradient(circle at 30% 30%, color-mix(in srgb,var(--ar-payment-provider) 18%, #ffffff) 0%, transparent 52%), linear-gradient(135deg,var(--arianna-bg) 0%, var(--arianna-bg-2) 100%)',border:'1px solid var(--arianna-border)',padding:'12px'}),
                new Rule('.ar-hosted-payment__artlogo',{display:'inline-flex',alignItems:'center',justifyContent:'center',minWidth:'132px',minHeight:'38px'}),
                new Rule('.ar-hosted-payment__artlogo img,.ar-hosted-payment__artlogo svg',{display:'block',maxWidth:'132px',maxHeight:'38px',width:'auto',height:'auto'}),
                new Rule('.ar-hosted-payment__summary',{display:'grid',gap:'8px',minWidth:'150px'}),
                new Rule('.ar-hosted-payment__amount',{fontSize:'24px',fontWeight:'750',letterSpacing:'-.02em'}),
                new Rule('.ar-hosted-payment__note',{color:'var(--arianna-muted)',fontSize:'11px',lineHeight:'1.45'}),
                new Rule('.ar-hosted-payment__status',{borderRadius:'7px',background:'var(--arianna-bg-3)',padding:'9px 10px',fontSize:'11px'}),
                new Rule('.ar-hosted-payment__result',{fontSize:'11px',color:'var(--arianna-muted)'}),
                new Rule('.ar-hosted-payment__actions',{display:'flex',justifyContent:'flex-end',gap:'8px'}),
            ]);
        }
    }
}

export default HostedPayment;
