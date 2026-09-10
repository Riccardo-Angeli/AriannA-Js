/**
 * @module components/payments/PaymentGateway
 * @author Riccardo Angeli
 * @version 2.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 *
 * @description Unified AriannA payment-method gateway. CreditCard.ts is consumed as-is.
 */

import { ApplePay } from './ApplePay.ts';
import { GooglePay } from './GooglePay.ts';
import { CreditCard } from './CreditCard.ts';
import { PayPal } from './PayPal.ts';
import { Stripe } from './Stripe.ts';
import { Satispay } from './Satispay.ts';
import { Nexi } from './Nexi.ts';
import { AliPay } from './AliPay.ts';
import { WeChatPay } from './WeChatPay.ts';
import { AmazonPay } from './AmazonPay.ts';
import { Klarna } from './Klarna.ts';
import { Sofort } from './Sofort.ts';
import { Adyen } from './Adyen.ts';
import { Worldline } from './Worldline.ts';
import { CheckoutCom } from './CheckoutCom.ts';
import { SumUp } from './SumUp.ts';
import { Mollie } from './Mollie.ts';
import { TWINT } from './TWINT.ts';
import { Ideal } from './Ideal.ts';
import { Bancontact } from './Bancontact.ts';
import { BLIK } from './BLIK.ts';
import { Trustly } from './Trustly.ts';
import { Wero } from './Wero.ts';
import { SEPA } from './SEPA.ts';
import { Pix } from './Pix.ts';
import { UPI } from './UPI.ts';
import { MercadoPago } from './MercadoPago.ts';
import { MPesa } from './MPesa.ts';
import { CashApp } from './CashApp.ts';
import { HostedPayment } from './HostedPayment.ts';
import { PaymentProviders, type PaymentProviderId } from './Providers.ts';
import { MountPaymentTemplate } from './Base.ts';

declare const Component: any;
declare const Css: any;
declare const Reactivity: any;
declare const Templates: any;

export namespace PaymentGateway
{
    export namespace Types
    {
        export type PaymentMethodId = PaymentProviderId;
        export type Signal<T> = any;
        export type Stylesheet = any;
    }

    export namespace Interfaces
    {
        export interface PaymentGatewayMethodConfig
        {
            applePay?: Partial<ApplePay.Interfaces.ApplePayOptions>;
            googlePay?: Partial<GooglePay.Interfaces.GooglePayOptions>;
            card?: Partial<CreditCard.Interfaces.CreditCardOptions>;
            paypal?: Partial<PayPal.Interfaces.PayPalOptions>;
            stripe?: Partial<Stripe.Interfaces.StripeOptions>;
            satispay?: Partial<Satispay.Interfaces.SatispayOptions>;
            nexi?: Partial<Nexi.Interfaces.NexiOptions>;
            alipay?: Partial<AliPay.Interfaces.AliPayOptions>;
            wechatPay?: Partial<HostedPayment.HostedPaymentOptions>;
            amazonPay?: Partial<HostedPayment.HostedPaymentOptions>;
            klarna?: Partial<HostedPayment.HostedPaymentOptions>;
            sofort?: Partial<HostedPayment.HostedPaymentOptions>;
            adyen?: Partial<HostedPayment.HostedPaymentOptions>;
            worldline?: Partial<HostedPayment.HostedPaymentOptions>;
            checkoutCom?: Partial<HostedPayment.HostedPaymentOptions>;
            sumup?: Partial<HostedPayment.HostedPaymentOptions>;
            mollie?: Partial<HostedPayment.HostedPaymentOptions>;
            twint?: Partial<HostedPayment.HostedPaymentOptions>;
            ideal?: Partial<HostedPayment.HostedPaymentOptions>;
            bancontact?: Partial<HostedPayment.HostedPaymentOptions>;
            blik?: Partial<HostedPayment.HostedPaymentOptions>;
            trustly?: Partial<HostedPayment.HostedPaymentOptions>;
            wero?: Partial<HostedPayment.HostedPaymentOptions>;
            sepa?: Partial<HostedPayment.HostedPaymentOptions>;
            pix?: Partial<HostedPayment.HostedPaymentOptions>;
            upi?: Partial<HostedPayment.HostedPaymentOptions>;
            mercadoPago?: Partial<HostedPayment.HostedPaymentOptions>;
            mpesa?: Partial<HostedPayment.HostedPaymentOptions>;
            cashApp?: Partial<HostedPayment.HostedPaymentOptions>;
        }

        export interface PaymentGatewayOptions
        {
            methods?: PaymentGatewayMethodConfig;
            initial?: Types.PaymentMethodId;
            order?: Types.PaymentMethodId[];
            amount?: number;
            currency?: string;
            title?: string;
        }
    }

    export interface MethodMeta
    {
        id: Types.PaymentMethodId;
        label: string;
        icon: string;
        tag: string;
        kind: string;
        deprecated?: boolean;
    }

    const signal = Reactivity.CreateSignal as <T = unknown>(value?: T) => any;
    export const html = Templates.Template.Html;
    export const { Rule, Stylesheet } = Css;

    const TAGS: Record<Types.PaymentMethodId,string> = {
        applePay:'arianna-apple-pay', googlePay:'arianna-google-pay', card:'arianna-credit-card', paypal:'arianna-paypal',
        stripe:'arianna-stripe', satispay:'arianna-satispay', nexi:'arianna-nexi', alipay:'arianna-alipay',
        wechatPay:'arianna-wechat-pay', amazonPay:'arianna-amazon-pay', klarna:'arianna-klarna', sofort:'arianna-sofort',
        adyen:'arianna-adyen', worldline:'arianna-worldline', checkoutCom:'arianna-checkout-com', sumup:'arianna-sumup',
        mollie:'arianna-mollie', twint:'arianna-twint', ideal:'arianna-ideal', bancontact:'arianna-bancontact', blik:'arianna-blik',
        trustly:'arianna-trustly', wero:'arianna-wero', sepa:'arianna-sepa', pix:'arianna-pix', upi:'arianna-upi',
        mercadoPago:'arianna-mercado-pago', mpesa:'arianna-mpesa', cashApp:'arianna-cash-app'
    };

    export const METHOD_META: MethodMeta[] = PaymentProviders.All.map(provider => ({
        id:provider.id, label:provider.name, icon:provider.logo, tag:TAGS[provider.id], kind:provider.kind, deprecated:provider.deprecated
    }));

    export function DefaultMethods(): Interfaces.PaymentGatewayMethodConfig
    {
        return {
            applePay:{ countryCode:'IT', supportedNetworks:['visa','masterCard'], merchantCapabilities:['supports3DS'], buttonStyle:'black', buttonType:'plain', forceShow:false },
            googlePay:{ merchantName:'AriannA', countryCode:'IT', environment:'TEST', buttonColor:'default', buttonType:'pay', supportedNetworks:['VISA','MASTERCARD'], supportedAuthMethods:['PAN_ONLY','CRYPTOGRAM_3DS'] },
            card:{ saveOption:true, holderNameRequired:true },
            paypal:{ intent:'capture', buttonColor:'gold', buttonShape:'rect' },
            stripe:{ locale:'auto', appearanceTheme:'stripe' },
            satispay:{ target:'_blank' }, nexi:{ target:'_blank' }, alipay:{ mode:'redirect', target:'_blank' },
            wechatPay:{target:'_blank'}, amazonPay:{target:'_blank'}, klarna:{target:'_blank'}, sofort:{target:'_blank'},
            adyen:{target:'_blank'}, worldline:{target:'_blank'}, checkoutCom:{target:'_blank'}, sumup:{target:'_blank'}, mollie:{target:'_blank'},
            twint:{target:'_blank'}, ideal:{target:'_blank'}, bancontact:{target:'_blank'}, blik:{target:'_blank'}, trustly:{target:'_blank'},
            wero:{target:'_blank'}, sepa:{target:'_blank'}, pix:{target:'_blank'}, upi:{target:'_blank'}, mercadoPago:{target:'_blank'},
            mpesa:{target:'_blank'}, cashApp:{target:'_blank'}
        };
    }

    @Component('arianna-payment-gateway', {}, { shadow:false, Attributes:['amount','currency','title','api-url','api-token','return-url','customer-email'] })
    export class PaymentGateway extends HTMLElement
    {
        public static readonly Styles = PaymentGateway.DefaultSheet();
        declare template: unknown;
        declare methods$: Types.Signal<Interfaces.PaymentGatewayMethodConfig>;
        declare selected$: Types.Signal<Types.PaymentMethodId | null>;
        private _instances: Partial<Record<Types.PaymentMethodId,HTMLElement>> = {};
        private _order: Types.PaymentMethodId[] = METHOD_META.map(method => method.id);
        private methodList: () => Array<MethodMeta & { selected:boolean; cls:string }> = () => [];

        private readonly _AriannaIdentity = (() => {
            const type='PaymentGateway';
            for(const cls of Array.from(this.classList)) if(cls.startsWith('__real-')) this.classList.remove(cls);
            this.classList.add(type);
            const g=globalThis as typeof globalThis & {__AriannaComponentIds?:Record<string,number>};
            const ids=g.__AriannaComponentIds ??= Object.create(null);
            this.id=`${type}-${ids[type]=(ids[type]??0)+1}`;
            return true;
        })();

        constructor()
        {
            super();
            if(!this.methods$) this.methods$=signal<Interfaces.PaymentGatewayMethodConfig>(DefaultMethods());
            if(!this.selected$) this.selected$=signal<Types.PaymentMethodId|null>(null);
        }

        onConnected(options: Interfaces.PaymentGatewayOptions = {})
        {
            if(!this.methods$) this.methods$=signal<Interfaces.PaymentGatewayMethodConfig>(DefaultMethods());
            if(!this.selected$) this.selected$=signal<Types.PaymentMethodId|null>(null);
            if(this.dataset.ariannaFolderReady==='true') return;
            if(options.methods) this.methods$.Set({...options.methods});
            if(options.order) this._order=[...options.order];
            if(options.amount != null) this.setAttribute('amount',String(options.amount));
            if(options.currency) this.setAttribute('currency',options.currency);
            if(options.title) this.setAttribute('title',options.title);

            (this as any).headerTitle=()=>this.getAttribute('title')||'Payment methods';
            this.methodList=()=>{
                const cfg=this.methods$.Get() as Record<string,unknown>;
                const selected=this.selected$.Get();
                return this._order
                    .map(id=>METHOD_META.find(meta=>meta.id===id))
                    .filter((meta): meta is MethodMeta => !!meta && cfg[meta.id] !== undefined)
                    .map(meta=>({ ...meta, selected:meta.id===selected, cls:`ar-pg__row${meta.id===selected?' ar-pg__row--selected':''}${meta.deprecated?' ar-pg__row--deprecated':''}` }));
            };
            (this as any).onRowClick=(event:Event)=>{
                const row=(event.target as Element).closest<HTMLElement>('[data-method]');
                const id=row?.dataset.method as Types.PaymentMethodId|undefined;
                if(id) this.selectMethod(id);
            };

            this.template=html `
            <section class="ar-pg">
                <header class="ar-pg__titlebar">
                    <strong class="ar-pg__title">{{ this.headerTitle() }}</strong>
                    <span class="ar-pg__count">{{ this.methodList().length }} methods</span>
                </header>
                <div class="ar-pg__list">
                    <div a-for="m in this.methodList()" :class="m.cls" :data-method="m.id" @click="this.onRowClick">
                        <div class="ar-pg__head">
                            <span class="ar-pg__radio"><span a-if="m.selected">●</span></span>
                            <span class="ar-pg__icon" a-html="m.icon"></span>
                            <span class="ar-pg__label">{{ m.label }}</span>
                            <span class="ar-pg__kind">{{ m.kind }}</span>
                        </div>
                        <div class="ar-pg__mount" :data-mount="m.id" a-if="m.selected"></div>
                    </div>
                </div>
            </section>`;

            MountPaymentTemplate(this);
            this.dataset.ariannaFolderReady='true';
            (this as any).Sheet=PaymentGateway.DefaultSheet();

            const requested=options.initial;
            const first=requested && (this.methods$.Get() as any)[requested] !== undefined
                ? requested
                : this.methodList()[0]?.id;
            if(first) queueMicrotask(()=>this.selectMethod(first));
        }

        setMethods(config: Interfaces.PaymentGatewayMethodConfig): this
        {
            Object.values(this._instances).forEach(instance=>instance?.remove());
            this._instances={};
            this.methods$.Set({...config});
            const selected=this.selected$.Get();
            if(selected && (config as any)[selected]===undefined) this.selected$.Set(null);
            queueMicrotask(()=>{
                const first=this.methodList()[0]?.id;
                if(!this.selected$.Get() && first) this.selectMethod(first);
            });
            return this;
        }

        getMethods(): Interfaces.PaymentGatewayMethodConfig { return {...this.methods$.Get()}; }
        setOrder(order: Types.PaymentMethodId[]): this { this._order=[...order]; return this; }
        getOrder(): Types.PaymentMethodId[] { return [...this._order]; }

        selectMethod(id: Types.PaymentMethodId): this
        {
            if((this.methods$.Get() as any)[id]===undefined) return this;
            this.selected$.Set(id);
            this.dispatchEvent(new CustomEvent('arianna:payment-method',{bubbles:true,detail:{id,provider:PaymentProviders.Get(id)}}));
            queueMicrotask(()=>this._mountMethod(id));
            return this;
        }

        getSelected(): Types.PaymentMethodId|null { return this.selected$.Get(); }

        getSelectedComponent(): HTMLElement|null
        {
            const selected=this.selected$.Get();
            return selected ? this._instances[selected] ?? null : null;
        }

        async pay(): Promise<unknown>
        {
            const component=this.getSelectedComponent() as (HTMLElement & {pay?:()=>unknown})|null;
            if(!component) return undefined;
            if(typeof component.pay==='function') return await component.pay();
            return undefined;
        }

        private _mountMethod(id: Types.PaymentMethodId): void
        {
            const host=this.querySelector<HTMLElement>(`[data-mount="${id}"]`);
            if(!host) return;
            host.replaceChildren();

            const meta=METHOD_META.find(method=>method.id===id);
            if(!meta) return;
            const component=document.createElement(meta.tag) as HTMLElement;
            this._instances[id]=component;

            const amount=this.getAttribute('amount') ?? '0';
            const currency=this.getAttribute('currency') ?? 'EUR';
            component.setAttribute('amount',amount);
            component.setAttribute('currency',currency);
            this.copyCommon(component,'api-url');
            this.copyCommon(component,'api-token');
            this.copyCommon(component,'return-url');
            this.copyCommon(component,'customer-email');

            const config=(this.methods$.Get() as Record<string,Record<string,unknown>|undefined>)[id] ?? {};
            for(const [key,value] of Object.entries(config)) this.applyOption(component,key,value);

            host.append(component);
        }

        private copyCommon(target: HTMLElement,name:string): void
        {
            const value=this.getAttribute(name);
            if(value != null) target.setAttribute(name,value);
        }

        private applyOption(target: HTMLElement,key:string,value:unknown): void
        {
            if(value===undefined || value===null) return;
            const attr=key.replace(/[A-Z]/g,match=>`-${match.toLowerCase()}`);
            if(typeof value==='boolean')
            {
                if(value) target.setAttribute(attr,''); else target.removeAttribute(attr);
                return;
            }
            if(Array.isArray(value)) { target.setAttribute(attr,value.join(',')); return; }
            if(typeof value==='object')
            {
                try { (target as any)[key]=value; } catch {}
                return;
            }
            target.setAttribute(attr,String(value));
        }

        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule('.PaymentGateway',{boxSizing:'border-box',display:'block',maxWidth:'720px',minWidth:'0',fontFamily:'-apple-system,system-ui,sans-serif',fontSize:'13px',color:'var(--arianna-text)'}),
                new Rule('.ar-pg',{overflow:'hidden',border:'1px solid var(--arianna-border)',borderRadius:'12px',background:'var(--arianna-bg)'}),
                new Rule('.ar-pg__titlebar',{display:'flex',alignItems:'center',gap:'10px',padding:'14px 18px',background:'var(--arianna-bg-2)',borderBottom:'1px solid var(--arianna-border)'}),
                new Rule('.ar-pg__title',{flex:'1',fontSize:'14px'}),
                new Rule('.ar-pg__count',{color:'var(--arianna-muted)',fontSize:'11px'}),
                new Rule('.ar-pg__list',{display:'flex',flexDirection:'column'}),
                new Rule('.ar-pg__row',{display:'flex',flexDirection:'column',borderBottom:'1px solid var(--arianna-border)',cursor:'pointer',transition:'background .12s ease'}),
                new Rule('.ar-pg__row:last-child',{borderBottom:'0'}),
                new Rule('.ar-pg__row:hover',{background:'var(--arianna-bg-3)'}),
                new Rule('.ar-pg__row--selected',{background:'color-mix(in srgb,var(--arianna-primary) 7%,var(--arianna-bg))',cursor:'default'}),
                new Rule('.ar-pg__row--deprecated',{opacity:'.7'}),
                new Rule('.ar-pg__head',{display:'flex',alignItems:'center',gap:'12px',minHeight:'52px',padding:'8px 16px'}),
                new Rule('.ar-pg__radio',{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'18px',height:'18px',flex:'0 0 18px',border:'2px solid var(--arianna-muted)',borderRadius:'50%',color:'var(--arianna-primary)',fontSize:'13px'}),
                new Rule('.ar-pg__row--selected .ar-pg__radio',{borderColor:'var(--arianna-primary)'}),
                new Rule('.ar-pg__icon',{display:'inline-flex',alignItems:'center',justifyContent:'flex-start',width:'128px',height:'36px',flex:'0 0 128px',overflow:'hidden'}),
                new Rule('.ar-pg__icon img,.ar-pg__icon svg',{display:'block',maxWidth:'128px',maxHeight:'34px',width:'auto',height:'auto',objectFit:'contain'}),
                new Rule('.ar-pg__label',{flex:'1',minWidth:'0',fontWeight:'650'}),
                new Rule('.ar-pg__kind',{border:'1px solid var(--arianna-border)',borderRadius:'999px',padding:'3px 7px',color:'var(--arianna-muted)',fontSize:'9px',textTransform:'uppercase',letterSpacing:'.04em'}),
                new Rule('.ar-pg__mount',{padding:'0 16px 16px 48px'}),
                new Rule('.ar-pg__mount > *',{maxWidth:'none'}),
            ]);
        }
    }
}

export default PaymentGateway;
