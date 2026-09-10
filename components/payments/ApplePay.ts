/**
 * @module    components/payments/ApplePay
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA ApplePay component module.
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


/** @namespace   ApplePay
 *  @public
 *  @description Namespace containing ApplePay contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace ApplePay
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

        /** @name        ApplePayNetwork
         *  @public
         *  @type        {'visa' | 'masterCard' | 'amex' | 'discover' | 'maestro' | 'jcb' | 'cartesBancaires' | 'unionPay' | 'mada' | 'electron'}
         *  @description Type alias for ApplePayNetwork.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type ApplePayNetwork = 'visa' | 'masterCard' | 'amex' | 'discover' | 'maestro' | 'jcb' | 'cartesBancaires' | 'unionPay' | 'mada' | 'electron';

        /** @name        ApplePayMerchantCapability
         *  @public
         *  @type        {'supports3DS' | 'supportsCredit' | 'supportsDebit' | 'supportsEMV'}
         *  @description Type alias for ApplePayMerchantCapability.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type ApplePayMerchantCapability = 'supports3DS' | 'supportsCredit' | 'supportsDebit' | 'supportsEMV';

        /** @name        ApplePayButtonStyle
         *  @public
         *  @type        {'black' | 'white' | 'white-outline'}
         *  @description Type alias for ApplePayButtonStyle.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type ApplePayButtonStyle = 'black' | 'white' | 'white-outline';

        /** @name        ApplePayButtonType
         *  @public
         *  @type        {'plain' | 'buy' | 'donate' | 'check-out' | 'subscribe' | 'reload'}
         *  @description Type alias for ApplePayButtonType.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type ApplePayButtonType = 'plain' | 'buy' | 'donate' | 'check-out' | 'subscribe' | 'reload';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   ApplePayOptions
         *  @public
         *  @description ApplePayOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ApplePayOptions
        {
            /** @name        merchantId
             *  @public
             *  @type        {string}
             *  @description Component member for merchant Id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            merchantId: string;

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

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label?: string;

            /** @name        supportedNetworks
             *  @public
             *  @type        {ApplePay.Types.ApplePayNetwork[]}
             *  @description Component member for supported Networks.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            supportedNetworks?: Types.ApplePayNetwork[];

            /** @name        merchantCapabilities
             *  @public
             *  @type        {ApplePay.Types.ApplePayMerchantCapability[]}
             *  @description Component member for merchant Capabilities.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            merchantCapabilities?: Types.ApplePayMerchantCapability[];

            /** @name        forceShow
             *  @public
             *  @type        {boolean}
             *  @description Component member for force Show.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            forceShow?: boolean;

            /** @name        buttonStyle
             *  @public
             *  @type        {ApplePay.Types.ApplePayButtonStyle}
             *  @description Component member for button Style.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            buttonStyle?: Types.ApplePayButtonStyle;

            /** @name        buttonType
             *  @public
             *  @type        {ApplePay.Types.ApplePayButtonType}
             *  @description Component member for button Type.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            buttonType?: Types.ApplePayButtonType;
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

    /** @name        APPLE_LOGO_SVG
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned APPLE_LOGO_SVG value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const APPLE_LOGO_SVG = PaymentProviders.ApplePay.logo;

    /** @class       ApplePay
     *  @public
     *  @description AriannA ApplePay component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-apple-pay', {}, {
        shadow: false,
        Attributes: [
            'merchant-id', 'country-code', 'currency', 'amount', 'label',
            'supported-networks', 'merchant-capabilities',
            'force-show', 'button-style', 'button-type',
        ],
    })
    export class ApplePay extends HTMLElement
    {
        public static readonly Styles = ApplePay.DefaultSheet();
        /** Canonical AriannA public DOM identity. */
        private readonly _AriannaIdentity = (() =>
        {
            const type = 'ApplePay';
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
            this.classList.add('ApplePay');
        }

        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        available$
         *  @public
         *  @type        {ApplePay.Types.Signal<boolean>}
         *  @description Component member for available$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare available$: Types.Signal<boolean>;

        /** @name        busy$
         *  @public
         *  @type        {ApplePay.Types.Signal<boolean>}
         *  @description Component member for busy$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare busy$: Types.Signal<boolean>;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {ApplePay.Interfaces.ApplePayOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.ApplePayOptions = {} as Interfaces.ApplePayOptions)
        {
            if(!this.available$) this.available$ = signal<boolean>(false);
            if(!this.busy$) this.busy$ = signal<boolean>(false);
            if(this.dataset.ariannaFolderReady === 'true') return;
            (this as any).APPLE_LOGO_SVG = APPLE_LOGO_SVG;
            (this as any).PAYMENT_PROVIDER = PaymentProviders.ApplePay;
            (this as any).PAYMENT_PROVIDER_LOGO = PaymentProviders.ApplePay.logo;
            (this as any).PAYMENT_PROVIDER_NAME = PaymentProviders.ApplePay.name;
            this.style.setProperty('--ar-payment-provider', PaymentProviders.ApplePay.color);
            this.style.setProperty('--ar-payment-contrast', PaymentProviders.ApplePay.contrast ?? '#fff');
            /** @name        styleAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned styleAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const styleAttr = this.signal().attribute('button-style');

            /** @name        typeAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned typeAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const typeAttr = this.signal().attribute('button-type');
            this.btnCls = () => {
                /** @name        style
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned style value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const style = styleAttr.Get() ?? 'black';

                /** @name        kind
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned kind value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const kind = typeAttr.Get() ?? 'plain';
                return `ar-applepay__btn ar-applepay__btn--${style} ar-applepay__btn--${kind}`
                    + (this.busy$.Get() ? ' ar-applepay__btn--busy' : '');
            };
            this.btnLabel = () => {
                /** @name        kind
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned kind value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const kind = typeAttr.Get() ?? 'plain';
                switch (kind)
                {
                    case 'buy': return 'Buy with';
                    case 'donate': return 'Donate with';
                    case 'check-out': return 'Check out with';
                    case 'subscribe': return 'Subscribe with';
                    case 'reload': return 'Reload with';
                    default: return 'Pay with';
                }
            };
            this.visible = () => this.available$.Get() || this.hasAttribute('force-show');
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
                    a-if="this.visible()"
                    @click="this.onClick">
                <span class="ar-applepay__logo" a-html="this.APPLE_LOGO_SVG"></span>
                <span class="ar-applepay__label">{{ this.btnLabel() }} Pay</span>
            </button>
            <div class="ar-applepay__fallback" a-if="!this.visible()">
                Apple Pay isn't available on this device.
            </div>
        
                </div>
            </section>
        `;
            MountPaymentTemplate(this);
            this.dataset.ariannaFolderReady = 'true';
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {ApplePay.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = ApplePay.DefaultSheet();
        }

        /** Programmatically open the Apple Pay sheet. */
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

                /** @name        label
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned label value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const label = this.getAttribute('label') ?? 'Total';

                /** @name        networks
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned networks value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const networks = (this.getAttribute('supported-networks') ?? 'visa,masterCard,amex').split(',').map(s => s.trim()).filter(Boolean);

                /** @name        caps
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned caps value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const caps = (this.getAttribute('merchant-capabilities') ?? 'supports3DS').split(',').map(s => s.trim()).filter(Boolean);

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
                    throw new Error('PaymentRequest API not available');

                /** @name        methodData
                 *  @public
                 *  @type        {PaymentMethodData[]}
                 *  @description Namespace-owned methodData value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const methodData: PaymentMethodData[] = [{
                        supportedMethods: 'https://apple.com/apple-pay',
                        data: {
                            version: 3,
                            merchantIdentifier: merchantId,
                            merchantCapabilities: caps,
                            supportedNetworks: networks,
                            countryCode,
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
                    total: { label, amount: { currency, value: amount.toFixed(2) } },
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
                    bubbles: true, detail: { method: 'applePay', token: resp.details },
                }));
            }
            catch (err)
            {
                if (err instanceof DOMException && err.name === 'AbortError')
                {
                    this.dispatchEvent(new CustomEvent('arianna:payment-cancel', {
                        bubbles: true, detail: { method: 'applePay' },
                    }));
                }
                else
                {
                    this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                        bubbles: true,
                        detail: { method: 'applePay', message: err instanceof Error ? err.message : String(err) },
                    }));
                }
            }
            finally
            {
                this.busy$.Set(false);
            }
        }

        /** True if PaymentRequest or ApplePaySession is available on this device. */
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
                /** @name        ApplePaySession
                 *  @public
                 *  @type        {{
                    canMakePayments(): boolean;
                }}
                 *  @description Component member for Apple Pay Session.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                ApplePaySession?: {
                    /** @name        canMakePayments
                     *  @public
                     *  @type        {boolean}
                     *  @description Component member for can Make Payments.
                     *  @returns     {boolean} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    canMakePayments(): boolean;
                };
            };
            if (w.ApplePaySession?.canMakePayments)
                return w.ApplePaySession.canMakePayments();
            if (typeof (window as unknown as {
                /** @name        PaymentRequest
                 *  @public
                 *  @type        {unknown}
                 *  @description Component member for Payment Request.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                PaymentRequest?: unknown;
            }).PaymentRequest !== 'undefined')
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
            this.available$.Set(await ApplePay.isAvailable());
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
        private btnCls: () => string = () => 'ar-applepay__btn ar-applepay__btn--black ar-applepay__btn--plain';

        /** @name        btnLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for btn Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private btnLabel: () => string = () => 'Pay with';

        /** @name        visible
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for visible.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private visible: () => boolean = () => false;

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
         *  @type        {ApplePay.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {ApplePay.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule('.ApplePay', {
                    BoxSizing: 'border-box',
                    MaxWidth: '100%',
                    MinWidth: '0', display: 'inline-block' }),
                new Rule('.ar-applepay__btn', {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    minWidth: '160px',
                    minHeight: '44px',
                    padding: '0 18px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    font: '600 14px -apple-system, "SF Pro Display", system-ui, sans-serif',
                    letterSpacing: '0.2px',
                    transition: 'opacity 0.15s',
                }),
                new Rule('.ar-applepay__btn:hover', { opacity: '0.9' }),
                new Rule('.ar-applepay__btn--busy', { opacity: '0.6', cursor: 'wait' }),
                new Rule('.ar-applepay__btn--black', {
                    background: '#000', color: '#fff',
                }),
                new Rule('.ar-applepay__btn--white', {
                    background: '#fff', color: '#000',
                    border: '1px solid #e6e8eb',
                }),
                new Rule('.ar-applepay__btn--white-outline', {
                    background: '#fff', color: '#000',
                    border: '1.5px solid #000',
                }),
                new Rule('.ar-applepay__logo', {
                    display: 'inline-flex',
                    width: '18px', height: '18px',
                }),
                new Rule('.ar-applepay__logo svg', { width: '100%', height: '100%' }),
                new Rule('.ar-applepay__fallback', {
                    fontSize: '12px',
                    color: 'var(--arianna-muted, var(--muted, #687079))',
                    padding: '8px',
                }),
            ]);
        }
    }
}
export default ApplePay;
