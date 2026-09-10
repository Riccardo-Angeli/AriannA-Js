/**
 * @module    components/payments/GooglePay
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA GooglePay component module.
 */


import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

import { MountPaymentTemplate } from './Base.ts';
import { PaymentProviders } from './Providers.ts';
declare const Component: any;
declare const Components: any;
declare namespace Components { type Binding<T> = any; }
declare const Css: any;
declare namespace Css { type Rule = any; type Stylesheet = any; }
declare const Reactivity: any;
declare namespace Reactivity { type Signal<T> = any; type Effect = any; }
declare const Templates: any;


/** @namespace   GooglePay
 *  @public
 *  @description Namespace containing GooglePay contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace GooglePay
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Signal
         *  @public
         *  @type        {SchemaInterfaces.Reactivity.Signal<T>}
         *  @description Type alias for Signal.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;

        /** @name        Rule
         *  @public
         *  @type        {Css.Rule}
         *  @description Type alias for Rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Rule = Css.Rule;

        /** @name        Stylesheet
         *  @public
         *  @type        {Css.Stylesheet}
         *  @description Type alias for Stylesheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Stylesheet = Css.Stylesheet;

        /** @name        GooglePayEnvironment
         *  @public
         *  @type        {'TEST' | 'PRODUCTION'}
         *  @description Type alias for GooglePayEnvironment.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type GooglePayEnvironment = 'TEST' | 'PRODUCTION';

        /** @name        GooglePayButtonColor
         *  @public
         *  @type        {'default' | 'black' | 'white'}
         *  @description Type alias for GooglePayButtonColor.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type GooglePayButtonColor = 'default' | 'black' | 'white';

        /** @name        GooglePayButtonType
         *  @public
         *  @type        {'buy' | 'book' | 'checkout' | 'donate' | 'order' | 'pay' | 'plain' | 'subscribe'}
         *  @description Type alias for GooglePayButtonType.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type GooglePayButtonType = 'buy' | 'book' | 'checkout' | 'donate' | 'order' | 'pay' | 'plain' | 'subscribe';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   GooglePayOptions
         *  @public
         *  @description GooglePayOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface GooglePayOptions
        {
            /** @name        merchantId
             *  @public
             *  @type        {string}
             *  @description Component member for merchant Id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            merchantId: string;

            /** @name        merchantName
             *  @public
             *  @type        {string}
             *  @description Component member for merchant Name.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            merchantName: string;

            /** @name        countryCode
             *  @public
             *  @type        {string}
             *  @description Component member for country Code.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            countryCode: string;

            /** @name        currency
             *  @public
             *  @type        {string}
             *  @description Component member for currency.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            currency: string;

            /** @name        amount
             *  @public
             *  @type        {number}
             *  @description Component member for amount.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            amount: number;

            /** @name        gateway
             *  @public
             *  @type        {string}
             *  @description Component member for gateway.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            gateway: string;

            /** @name        gatewayMerchantId
             *  @public
             *  @type        {string}
             *  @description Component member for gateway Merchant Id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            gatewayMerchantId: string;

            /** @name        environment
             *  @public
             *  @type        {GooglePay.Types.GooglePayEnvironment}
             *  @description Component member for environment.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            environment?: Types.GooglePayEnvironment;

            /** @name        buttonColor
             *  @public
             *  @type        {GooglePay.Types.GooglePayButtonColor}
             *  @description Component member for button Color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            buttonColor?: Types.GooglePayButtonColor;

            /** @name        buttonType
             *  @public
             *  @type        {GooglePay.Types.GooglePayButtonType}
             *  @description Component member for button Type.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            buttonType?: Types.GooglePayButtonType;

            /** @name        supportedNetworks
             *  @public
             *  @type        {string[]}
             *  @description Component member for supported Networks.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            supportedNetworks?: string[];

            /** @name        supportedAuthMethods
             *  @public
             *  @type        {Array<'PAN_ONLY' | 'CRYPTOGRAM_3DS'>}
             *  @description Component member for supported Auth Methods.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            supportedAuthMethods?: Array<'PAN_ONLY' | 'CRYPTOGRAM_3DS'>;
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
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    /** @name        signal
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned signal value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const signal = Reactivity.CreateSignal as <T = unknown>(initial?: T) => any;

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @name        GPAY_LOGO
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned GPAY_LOGO value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const GPAY_LOGO = PaymentProviders.GooglePay.logo;

    /** @class       GooglePay
     *  @public
     *  @description AriannA GooglePay component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-google-pay', {}, {
        shadow: false,
        Attributes: [
            'merchant-id', 'merchant-name', 'country-code', 'currency', 'amount',
            'gateway', 'gateway-merchant-id', 'environment',
            'button-color', 'button-type', 'supported-networks', 'supported-auth-methods',
        ],
    })
    export class GooglePay extends HTMLElement
    {
        public static readonly Styles = GooglePay.DefaultSheet();
        /** Canonical AriannA public DOM identity. */
        private readonly _AriannaIdentity = (() =>
        {
            const type = 'GooglePay';
            for(const cls of Array.from(this.classList))
            {
                if(cls.startsWith('__real-')) this.classList.remove(cls);
            }
            this.classList.add(type);

            const counters = globalThis as typeof globalThis & { __AriannaComponentIds?: Record<string, number> };
            const ids = counters.__AriannaComponentIds ??= Object.create(null);
            const n = ids[type] = (ids[type] ?? 0) + 1;
            this.id = `${type}-${n}`;
            return true;
        })();

        constructor()
        {
            super();
            if(!this.available$) this.available$ = signal<boolean>(false);
            if(!this.busy$) this.busy$ = signal<boolean>(false);
            this.classList.add('GooglePay');
        }

        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        available$
         *  @public
         *  @type        {GooglePay.Types.Signal<boolean>}
         *  @description Component member for available$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare available$: Types.Signal<boolean>;

        /** @name        busy$
         *  @public
         *  @type        {GooglePay.Types.Signal<boolean>}
         *  @description Component member for busy$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare busy$: Types.Signal<boolean>;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {GooglePay.Interfaces.GooglePayOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.GooglePayOptions = {} as Interfaces.GooglePayOptions)
        {
            if(!this.available$) this.available$ = signal<boolean>(false);
            if(!this.busy$) this.busy$ = signal<boolean>(false);
            if(this.dataset.ariannaFolderReady === 'true') return;
            (this as any).GPAY_LOGO = GPAY_LOGO;
            (this as any).PAYMENT_PROVIDER = PaymentProviders.GooglePay;
            (this as any).PAYMENT_PROVIDER_LOGO = PaymentProviders.GooglePay.logo;
            (this as any).PAYMENT_PROVIDER_NAME = PaymentProviders.GooglePay.name;
            this.style.setProperty('--ar-payment-provider', PaymentProviders.GooglePay.color);
            this.style.setProperty('--ar-payment-contrast', PaymentProviders.GooglePay.contrast ?? '#fff');
            /** @name        colorAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned colorAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const colorAttr = this.signal().attribute('button-color');

            /** @name        typeAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned typeAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const typeAttr = this.signal().attribute('button-type');
            this.btnCls = () => {
                /** @name        color
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned color value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const color = colorAttr.Get() ?? 'default';

                /** @name        kind
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned kind value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const kind = typeAttr.Get() ?? 'pay';
                return `ar-gpay__btn ar-gpay__btn--${color} ar-gpay__btn--${kind}`
                    + (this.busy$.Get() ? ' ar-gpay__btn--busy' : '');
            };
            this.btnLabel = () => {
                /** @name        kind
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned kind value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const kind = typeAttr.Get() ?? 'pay';
                switch (kind)
                {
                    case 'buy': return 'Buy with';
                    case 'book': return 'Book with';
                    case 'checkout': return 'Checkout with';
                    case 'donate': return 'Donate with';
                    case 'order': return 'Order with';
                    case 'subscribe': return 'Subscribe with';
                    case 'plain': return '';
                    default: return 'Pay with';
                }
            };
            this.onClick = () => { void this.pay(); };
            this.template = html `
            <section class="ar-payment-provider">
                <header class="ar-payment-header">
                    <span class="ar-payment-logo" a-html="this.PAYMENT_PROVIDER_LOGO"></span>
                    <strong class="ar-payment-name">{{ this.PAYMENT_PROVIDER_NAME }}</strong>
                </header>
                <div class="ar-payment-body">
            <button type="button"
                    :class="this.btnCls()"
                    a-if="this.available$.Get()"
                    @click="this.onClick">
                <span class="ar-gpay__label">{{ this.btnLabel() }}</span>
                <span class="ar-gpay__logo" a-html="this.GPAY_LOGO"></span>
            </button>
            <div class="ar-gpay__fallback" a-if="!this.available$.Get()">
                Google Pay isn't available on this device.
            </div>
        
                </div>
            </section>
        `;
            MountPaymentTemplate(this);
            this.dataset.ariannaFolderReady = 'true';
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {GooglePay.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = GooglePay.DefaultSheet();
        }

        /** @name        pay
         *  @public
         *  @type        {Promise<void>}
         *  @description Component member for pay.
         *  @returns     {Promise<void>} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        async pay(): Promise<void>
        {
            if (this.busy$.Get())
                return;
            this.busy$.Set(true);
            try
            {
                /** @name        merchantId
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned merchantId value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const merchantId = this.getAttribute('merchant-id') ?? '';

                /** @name        merchantName
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned merchantName value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const merchantName = this.getAttribute('merchant-name') ?? '';

                /** @name        countryCode
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned countryCode value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const countryCode = this.getAttribute('country-code') ?? 'US';

                /** @name        currency
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned currency value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const currency = this.getAttribute('currency') ?? 'USD';

                /** @name        amount
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned amount value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const amount = parseFloat(this.getAttribute('amount') ?? '0') || 0;

                /** @name        gateway
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned gateway value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const gateway = this.getAttribute('gateway') ?? '';

                /** @name        gatewayMerchantId
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned gatewayMerchantId value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const gatewayMerchantId = this.getAttribute('gateway-merchant-id') ?? '';

                /** @name        environment
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned environment value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const environment = (this.getAttribute('environment') ?? 'TEST') as Types.GooglePayEnvironment;

                /** @name        networks
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned networks value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const networks = (this.getAttribute('supported-networks') ?? 'VISA,MASTERCARD,AMEX')
                    .split(',').map(s => s.trim()).filter(Boolean);

                /** @name        authMethods
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned authMethods value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const authMethods = (this.getAttribute('supported-auth-methods') ?? 'PAN_ONLY,CRYPTOGRAM_3DS')
                    .split(',').map(s => s.trim()).filter(Boolean);

                /** @name        w
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned w value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const w = window as unknown as {
                    /** @name        google
                     *  @public
                     *  @type        {{
                        payments?: {
                            api?: {
                                PaymentsClient: new (cfg: {
                                    environment: string;
                                }) => unknown;
                            };
                        };
                    }}
                     *  @description Component member for google.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    google?: {
                        /** @name        payments
                         *  @public
                         *  @type        {{
                            api?: {
                                PaymentsClient: new (cfg: {
                                    environment: string;
                                }) => unknown;
                            };
                        }}
                         *  @description Component member for payments.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        payments?: {
                            /** @name        api
                             *  @public
                             *  @type        {{
                                PaymentsClient: new (cfg: {
                                    environment: string;
                                }) => unknown;
                            }}
                             *  @description Component member for api.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            api?: {
                                /** @name        PaymentsClient
                                 *  @public
                                 *  @type        {new (cfg: {
                                    environment: string;
                                }) => unknown}
                                 *  @description Component member for Payments Client.
                                 *  @author      Riccardo Angeli
                                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                                 *  @license     MIT / Commercial (dual license) */
                                PaymentsClient: new (cfg: {
                                    /** @name        environment
                                     *  @public
                                     *  @type        {string}
                                     *  @description Component member for environment.
                                     *  @author      Riccardo Angeli
                                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                                     *  @license     MIT / Commercial (dual license) */
                                    environment: string;
                                }) => unknown;
                            };
                        };
                    };
                };
                if (w.google?.payments?.api?.PaymentsClient)
                {
                    /** @name        client
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned client value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const client = new w.google.payments.api.PaymentsClient({ environment }) as {
                        /** @name        loadPaymentData
                         *  @public
                         *  @type        {Promise<unknown>}
                         *  @description Component member for load Payment Data.
                         *  @param       {unknown} req Parameter.
                         *  @returns     {Promise<unknown>} Result.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        loadPaymentData(req: unknown): Promise<unknown>;
                    };

                    /** @name        paymentDataRequest
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned paymentDataRequest value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const paymentDataRequest = {
                        apiVersion: 2, apiVersionMinor: 0,
                        allowedPaymentMethods: [{
                                type: 'CARD',
                                parameters: { allowedAuthMethods: authMethods, allowedCardNetworks: networks },
                                tokenizationSpecification: {
                                    type: 'PAYMENT_GATEWAY',
                                    parameters: { gateway, gatewayMerchantId },
                                },
                            }],
                        merchantInfo: { merchantId, merchantName },
                        transactionInfo: {
                            countryCode, currencyCode: currency,
                            totalPriceStatus: 'FINAL',
                            totalPrice: amount.toFixed(2),
                        },
                    };

                    /** @name        data
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned data value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const data = await client.loadPaymentData(paymentDataRequest);
                    this.dispatchEvent(new CustomEvent('arianna:payment-success', {
                        bubbles: true, detail: { method: 'googlePay', token: data },
                    }));
                }
                else
                {
                    // PaymentRequest fallback
                    /** @name        PR
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned PR value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const PR = (window as unknown as {
                        /** @name        PaymentRequest
                         *  @public
                         *  @type        {typeof PaymentRequest}
                         *  @description Component member for Payment Request.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        PaymentRequest?: typeof PaymentRequest;
                    }).PaymentRequest;
                    if (typeof PR !== 'function')
                        throw new Error('Google Pay API and PaymentRequest both unavailable');

                    /** @name        methodData
                     *  @public
                     *  @type        {PaymentMethodData[]}
                     *  @description Namespace-owned methodData value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const methodData: PaymentMethodData[] = [{
                            supportedMethods: 'https://google.com/pay',
                            data: {
                                environment, apiVersion: 2,
                                merchantInfo: { merchantId, merchantName },
                                allowedPaymentMethods: [{
                                        type: 'CARD',
                                        parameters: { allowedAuthMethods: authMethods, allowedCardNetworks: networks },
                                        tokenizationSpecification: {
                                            type: 'PAYMENT_GATEWAY',
                                            parameters: { gateway, gatewayMerchantId },
                                        },
                                    }],
                            },
                        }];

                    /** @name        details
                     *  @public
                     *  @type        {PaymentDetailsInit}
                     *  @description Namespace-owned details value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const details: PaymentDetailsInit = {
                        total: { label: merchantName || 'Total', amount: { currency, value: amount.toFixed(2) } },
                    };

                    /** @name        req
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned req value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const req = new PR(methodData, details);

                    /** @name        resp
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned resp value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const resp = await req.show();
                    await resp.complete('success');
                    this.dispatchEvent(new CustomEvent('arianna:payment-success', {
                        bubbles: true, detail: { method: 'googlePay', token: resp.details },
                    }));
                }
            }
            catch (err)
            {
                if (err instanceof DOMException && err.name === 'AbortError')
                {
                    this.dispatchEvent(new CustomEvent('arianna:payment-cancel', {
                        bubbles: true, detail: { method: 'googlePay' },
                    }));
                }
                else
                {
                    this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                        bubbles: true,
                        detail: { method: 'googlePay', message: err instanceof Error ? err.message : String(err) },
                    }));
                }
            }
            finally
            {
                this.busy$.Set(false);
            }
        }

        /** @name        isAvailable
         *  @public
         *  @static
         *  @type        {Promise<boolean>}
         *  @description Component member for is Available.
         *  @returns     {Promise<boolean>} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static async isAvailable(): Promise<boolean>
        {
            if (typeof window === 'undefined')
                return false;

            /** @name        w
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned w value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const w = window as unknown as {
                /** @name        google
                 *  @public
                 *  @type        {{
                    payments?: {
                        api?: unknown;
                    };
                }}
                 *  @description Component member for google.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                google?: {
                    /** @name        payments
                     *  @public
                     *  @type        {{
                        api?: unknown;
                    }}
                     *  @description Component member for payments.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    payments?: {
                        /** @name        api
                         *  @public
                         *  @type        {unknown}
                         *  @description Component member for api.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        api?: unknown;
                    };
                };

                /** @name        PaymentRequest
                 *  @public
                 *  @type        {unknown}
                 *  @description Component member for Payment Request.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                PaymentRequest?: unknown;
            };
            if (w.google?.payments?.api)
                return true;
            if (typeof w.PaymentRequest !== 'undefined')
                return true;
            return false;
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
        async onMount()
        {
            this.available$.Set(await GooglePay.isAvailable());
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
        onUnmount() { }

        /** @name        btnCls
         *  @private
         *  @type        {() => string}
         *  @description Component member for btn Cls.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private btnCls: () => string = () => 'ar-gpay__btn ar-gpay__btn--default ar-gpay__btn--pay';

        /** @name        btnLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for btn Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private btnLabel: () => string = () => 'Pay with';

        /** @name        onClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onClick: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {GooglePay.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {GooglePay.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule('.GooglePay', {
                    BoxSizing: 'border-box',
                    MaxWidth: '100%',
                    MinWidth: '0', display: 'inline-block' }),
                new Rule('.ar-gpay__btn', {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    minWidth: '160px',
                    minHeight: '44px',
                    padding: '0 18px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    font: '500 14px "Google Sans", "Roboto", system-ui, sans-serif',
                    transition: 'opacity 0.15s',
                }),
                new Rule('.ar-gpay__btn:hover', { opacity: '0.9' }),
                new Rule('.ar-gpay__btn--busy', { opacity: '0.6', cursor: 'wait' }),
                new Rule('.ar-gpay__btn--default, .ar-gpay__btn--black', {
                    background: '#000', color: '#fff',
                }),
                new Rule('.ar-gpay__btn--white', {
                    background: '#fff', color: '#3c4043',
                    border: '1px solid #e6e8eb',
                }),
                new Rule('.ar-gpay__logo', { display: 'inline-flex', height: '18px' }),
                new Rule('.ar-gpay__logo svg', { height: '100%' }),
                new Rule('.ar-gpay__fallback', {
                    fontSize: '12px',
                    color: 'var(--arianna-muted, var(--muted, #687079))',
                    padding: '8px',
                }),
            ]);
        }
    }
}
export default GooglePay;
