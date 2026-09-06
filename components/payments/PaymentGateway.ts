/**
 * @module    components/payments/PaymentGateway
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA PaymentGateway component module.
 */


import { ApplePay } from './ApplePay.ts';
import { GooglePay } from './GooglePay.ts';
import { CreditCard } from './CreditCard.ts';
import { PayPal } from './PayPal.ts';
import { Stripe } from './Stripe.ts';
import { Satispay } from './Satispay.ts';
import { Nexi } from './Nexi.ts';
import { AliPay } from './AliPay.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

import { MountPaymentTemplate } from './Base.ts';
declare const Component: any;
declare const Components: any;
declare namespace Components { type Binding<T> = any; }
declare const Css: any;
declare namespace Css { type Rule = any; type Stylesheet = any; }
declare const Reactivity: any;
declare namespace Reactivity { type Signal<T> = any; type Effect = any; }
declare const Templates: any;


/** @namespace   PaymentGateway
 *  @public
 *  @description Namespace containing PaymentGateway contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace PaymentGateway
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

        /** @name        PaymentMethodId
         *  @public
         *  @type        {'applePay' | 'googlePay' | 'card' | 'paypal' | 'stripe' | 'satispay' | 'nexi' | 'alipay'}
         *  @description Type alias for PaymentMethodId.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type PaymentMethodId = 'applePay' | 'googlePay' | 'card' | 'paypal' | 'stripe' | 'satispay' | 'nexi' | 'alipay';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   PaymentGatewayMethodConfig
         *  @public
         *  @description PaymentGatewayMethodConfig contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface PaymentGatewayMethodConfig
        {
            /** @name        applePay
             *  @public
             *  @type        {Partial<{
                merchantId: string;
                countryCode: string;
                supportedNetworks: string[];
                merchantCapabilities: string[];
                buttonStyle: string;
                buttonType: string;
                forceShow: boolean;
            }>}
             *  @description Component member for apple Pay.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            applePay?: Partial<{
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

                /** @name        supportedNetworks
                 *  @public
                 *  @type        {string[]}
                 *  @description Component member for supported Networks.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                supportedNetworks: string[];

                /** @name        merchantCapabilities
                 *  @public
                 *  @type        {string[]}
                 *  @description Component member for merchant Capabilities.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                merchantCapabilities: string[];

                /** @name        buttonStyle
                 *  @public
                 *  @type        {string}
                 *  @description Component member for button Style.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                buttonStyle: string;

                /** @name        buttonType
                 *  @public
                 *  @type        {string}
                 *  @description Component member for button Type.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                buttonType: string;

                /** @name        forceShow
                 *  @public
                 *  @type        {boolean}
                 *  @description Component member for force Show.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                forceShow: boolean;
            }>;

            /** @name        googlePay
             *  @public
             *  @type        {Partial<{
                merchantId: string;
                merchantName: string;
                countryCode: string;
                gateway: string;
                gatewayMerchantId: string;
                environment: string;
                buttonColor: string;
                buttonType: string;
                supportedNetworks: string[];
                supportedAuthMethods: string[];
            }>}
             *  @description Component member for google Pay.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            googlePay?: Partial<{
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
                 *  @type        {string}
                 *  @description Component member for environment.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                environment: string;

                /** @name        buttonColor
                 *  @public
                 *  @type        {string}
                 *  @description Component member for button Color.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                buttonColor: string;

                /** @name        buttonType
                 *  @public
                 *  @type        {string}
                 *  @description Component member for button Type.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                buttonType: string;

                /** @name        supportedNetworks
                 *  @public
                 *  @type        {string[]}
                 *  @description Component member for supported Networks.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                supportedNetworks: string[];

                /** @name        supportedAuthMethods
                 *  @public
                 *  @type        {string[]}
                 *  @description Component member for supported Auth Methods.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                supportedAuthMethods: string[];
            }>;

            /** @name        card
             *  @public
             *  @type        {Partial<{
                saveOption: boolean;
                holderNameRequired: boolean;
            }>}
             *  @description Component member for card.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            card?: Partial<{
                /** @name        saveOption
                 *  @public
                 *  @type        {boolean}
                 *  @description Component member for save Option.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                saveOption: boolean;

                /** @name        holderNameRequired
                 *  @public
                 *  @type        {boolean}
                 *  @description Component member for holder Name Required.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                holderNameRequired: boolean;
            }>;

            /** @name        paypal
             *  @public
             *  @type        {Partial<{
                clientId: string;
                intent: string;
                redirectUrl: string;
                buttonStyle: string;
                buttonColor: string;
                buttonShape: string;
            }>}
             *  @description Component member for paypal.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            paypal?: Partial<{
                /** @name        clientId
                 *  @public
                 *  @type        {string}
                 *  @description Component member for client Id.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                clientId: string;

                /** @name        intent
                 *  @public
                 *  @type        {string}
                 *  @description Component member for intent.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                intent: string;

                /** @name        redirectUrl
                 *  @public
                 *  @type        {string}
                 *  @description Component member for redirect Url.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                redirectUrl: string;

                /** @name        buttonStyle
                 *  @public
                 *  @type        {string}
                 *  @description Component member for button Style.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                buttonStyle: string;

                /** @name        buttonColor
                 *  @public
                 *  @type        {string}
                 *  @description Component member for button Color.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                buttonColor: string;

                /** @name        buttonShape
                 *  @public
                 *  @type        {string}
                 *  @description Component member for button Shape.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                buttonShape: string;
            }>;

            /** @name        stripe
             *  @public
             *  @type        {Partial<{
                publishableKey: string;
                clientSecret: string;
                returnUrl: string;
                locale: string;
                appearanceTheme: string;
            }>}
             *  @description Component member for stripe.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            stripe?: Partial<{
                /** @name        publishableKey
                 *  @public
                 *  @type        {string}
                 *  @description Component member for publishable Key.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                publishableKey: string;

                /** @name        clientSecret
                 *  @public
                 *  @type        {string}
                 *  @description Component member for client Secret.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                clientSecret: string;

                /** @name        returnUrl
                 *  @public
                 *  @type        {string}
                 *  @description Component member for return Url.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                returnUrl: string;

                /** @name        locale
                 *  @public
                 *  @type        {string}
                 *  @description Component member for locale.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                locale: string;

                /** @name        appearanceTheme
                 *  @public
                 *  @type        {string}
                 *  @description Component member for appearance Theme.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                appearanceTheme: string;
            }>;

            /** @name        satispay
             *  @public
             *  @type        {Partial<{
                redirectUrl: string;
                target: string;
            }>}
             *  @description Component member for satispay.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            satispay?: Partial<{
                /** @name        redirectUrl
                 *  @public
                 *  @type        {string}
                 *  @description Component member for redirect Url.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                redirectUrl: string;

                /** @name        target
                 *  @public
                 *  @type        {string}
                 *  @description Component member for target.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                target: string;
            }>;

            /** @name        nexi
             *  @public
             *  @type        {Partial<{
                redirectUrl: string;
                target: string;
            }>}
             *  @description Component member for nexi.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            nexi?: Partial<{
                /** @name        redirectUrl
                 *  @public
                 *  @type        {string}
                 *  @description Component member for redirect Url.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                redirectUrl: string;

                /** @name        target
                 *  @public
                 *  @type        {string}
                 *  @description Component member for target.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                target: string;
            }>;

            /** @name        alipay
             *  @public
             *  @type        {Partial<{
                mode: string;
                redirectUrl: string;
                qrUrl: string;
                target: string;
            }>}
             *  @description Component member for alipay.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            alipay?: Partial<{
                /** @name        mode
                 *  @public
                 *  @type        {string}
                 *  @description Component member for mode.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                mode: string;

                /** @name        redirectUrl
                 *  @public
                 *  @type        {string}
                 *  @description Component member for redirect Url.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                redirectUrl: string;

                /** @name        qrUrl
                 *  @public
                 *  @type        {string}
                 *  @description Component member for qr Url.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                qrUrl: string;

                /** @name        target
                 *  @public
                 *  @type        {string}
                 *  @description Component member for target.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                target: string;
            }>;
        }

        /** @interface   PaymentGatewayOptions
         *  @public
         *  @description PaymentGatewayOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface PaymentGatewayOptions
        {
            /** @name        amount
             *  @public
             *  @type        {number}
             *  @description Component member for amount.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            amount: number;

            /** @name        currency
             *  @public
             *  @type        {string}
             *  @description Component member for currency.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            currency: string;

            /** @name        methods
             *  @public
             *  @type        {PaymentGateway.Interfaces.PaymentGatewayMethodConfig}
             *  @description Component member for methods.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            methods: Interfaces.PaymentGatewayMethodConfig;

            /** @name        initial
             *  @public
             *  @type        {PaymentGateway.Types.PaymentMethodId}
             *  @description Component member for initial.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            initial?: Types.PaymentMethodId;

            /** @name        title
             *  @public
             *  @type        {string}
             *  @description Component member for title.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            title?: string;

            /** @name        order
             *  @public
             *  @type        {PaymentGateway.Types.PaymentMethodId[]}
             *  @description Component member for order.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            order?: Types.PaymentMethodId[];
        }
    }
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

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;

    /** @name        METHOD_META
     *  @public
     *  @type        {Array<{
        id: PaymentGateway.Types.PaymentMethodId;
        label: string;
        icon: string;
    }>}
     *  @description Namespace-owned METHOD_META value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const METHOD_META: Array<{
        id: Types.PaymentMethodId;
        label: string;
        icon: string;
    }> = [
        { id: 'applePay', label: 'Apple Pay', icon: `<svg viewBox="0 0 66 24" aria-label="Apple Pay"><path fill="currentColor" d="M15.8 7.5c.9-1.1 1.5-2.6 1.3-4.1-1.3.1-2.9.9-3.8 2-.8.9-1.6 2.5-1.4 4 1.5.1 3-.8 3.9-1.9zM20.7 13.5c0-3.2 2.6-4.8 2.7-4.9-1.5-2.2-3.9-2.5-4.7-2.5-2-.2-3.9 1.2-4.9 1.2s-2.6-1.1-4.2-1.1c-2.2 0-4.2 1.3-5.3 3.2-2.3 3.9-.6 9.7 1.6 12.9 1.1 1.6 2.4 3.3 4 3.2 1.6-.1 2.2-1 4.2-1 2 0 2.5 1 4.2 1 1.8 0 2.9-1.6 3.9-3.1 1.2-1.8 1.7-3.6 1.8-3.7-.1 0-3.4-1.3-3.3-5.2z"/><text x="28" y="18" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="currentColor">Pay</text></svg>` },
        { id: 'googlePay', label: 'Google Pay', icon: `<svg viewBox="0 0 76 24" aria-label="Google Pay"><text x="3" y="18" font-family="Arial,sans-serif" font-size="15" font-weight="700"><tspan fill="#4285F4">G</tspan><tspan fill="currentColor"> Pay</tspan></text></svg>` },
        { id: 'card', label: 'Credit / Debit Card', icon: `<svg viewBox="0 0 42 28" aria-label="Card"><rect x="1" y="3" width="40" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 9h38" stroke="currentColor" stroke-width="3"/><rect x="6" y="16" width="10" height="3" rx="1" fill="currentColor"/></svg>` },
        { id: 'paypal', label: 'PayPal', icon: `<svg viewBox="0 0 64 24" aria-label="PayPal"><text x="2" y="18" font-family="Arial,sans-serif" font-size="15" font-style="italic" font-weight="800"><tspan fill="#003087">Pay</tspan><tspan fill="#009CDE">Pal</tspan></text></svg>` },
        { id: 'stripe', label: 'Stripe', icon: `<svg viewBox="0 0 58 24" aria-label="Stripe"><rect width="58" height="24" rx="5" fill="#635BFF"/><text x="29" y="17" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="800" fill="#fff">stripe</text></svg>` },
        { id: 'satispay', label: 'Satispay', icon: `<svg viewBox="0 0 70 24" aria-label="Satispay"><circle cx="12" cy="12" r="10" fill="#FF3A44"/><circle cx="12" cy="12" r="4" fill="#fff"/><text x="27" y="17" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="currentColor">Satispay</text></svg>` },
        { id: 'nexi', label: 'Nexi', icon: `<svg viewBox="0 0 58 24" aria-label="Nexi"><rect width="58" height="24" rx="5" fill="#081E5B"/><text x="29" y="17" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="800" fill="#fff">nexi</text></svg>` },
        { id: 'alipay', label: 'Alipay', icon: `<svg viewBox="0 0 64 24" aria-label="Alipay"><rect width="64" height="24" rx="5" fill="#1677FF"/><text x="32" y="17" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="800" fill="#fff">Alipay</text></svg>` },
    ];

    /** @class       PaymentGateway
     *  @public
     *  @description AriannA PaymentGateway component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-payment-gateway', {}, {
        shadow: false,
        Attributes: ['amount', 'currency', 'title'],
    })
    export class PaymentGateway extends HTMLDivElement
    {
        public static readonly Styles = PaymentGateway.DefaultSheet();
        /** Canonical AriannA public DOM identity. */
        private readonly _AriannaIdentity = (() =>
        {
            const type = 'PaymentGateway';
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
            if(!this.methods$) this.methods$ = signal<Interfaces.PaymentGatewayMethodConfig>({});
            if(!this.selected$) this.selected$ = signal<Types.PaymentMethodId | null>(null);
            if(!this._instances) this._instances = {};
            this.classList.add('PaymentGateway');
        }

        /** Compiler-visible binding factory installed by the Component decorator. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible template slot installed by the Component decorator. */
        declare template: unknown;

        /** @name        methods$
         *  @public
         *  @type        {PaymentGateway.Types.Signal<PaymentGateway.Interfaces.PaymentGatewayMethodConfig>}
         *  @description Component member for methods$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare methods$: Types.Signal<Interfaces.PaymentGatewayMethodConfig>;

        /** @name        selected$
         *  @public
         *  @type        {PaymentGateway.Types.Signal<PaymentGateway.Types.PaymentMethodId | null>}
         *  @description Component member for selected$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare selected$: Types.Signal<Types.PaymentMethodId | null>;
        // Cached widget instances — created lazily when a method is selected
        /** @name        _instances
         *  @public
         *  @type        {Partial<Record<PaymentGateway.Types.PaymentMethodId, Element>>}
         *  @description Component member for instances.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare _instances: Partial<Record<Types.PaymentMethodId, Element>>;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {PaymentGateway.Interfaces.PaymentGatewayOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.PaymentGatewayOptions = {} as Interfaces.PaymentGatewayOptions)
        {
            if(!this.methods$) this.methods$ = signal<Interfaces.PaymentGatewayMethodConfig>({});
            if(!this.selected$) this.selected$ = signal<Types.PaymentMethodId | null>(null);
            if(!this._instances) this._instances = {};
            if(this.dataset.ariannaFolderReady === 'true') return;
            /** @name        titleAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned titleAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const titleAttr = this.signal().attribute('title');
            this.headerTitle = () => titleAttr.Get() ?? 'Choose how to pay';
            this.methodList = (): Array<{
                /** @name        id
                 *  @public
                 *  @type        {PaymentGateway.Types.PaymentMethodId}
                 *  @description Component member for id.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                id: Types.PaymentMethodId;

                /** @name        label
                 *  @public
                 *  @type        {string}
                 *  @description Component member for label.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                label: string;

                /** @name        icon
                 *  @public
                 *  @type        {string}
                 *  @description Component member for icon.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                icon: string;

                /** @name        cls
                 *  @public
                 *  @type        {string}
                 *  @description Component member for cls.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                cls: string;

                /** @name        selected
                 *  @public
                 *  @type        {boolean}
                 *  @description Component member for selected.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                selected: boolean;
            }> => {
                /** @name        cfg
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned cfg value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const cfg = this.methods$.Get();

                /** @name        sel
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned sel value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const sel = this.selected$.Get();
                return METHOD_META.filter(m => cfg[m.id])
                    .map(m => ({
                    id: m.id,
                    label: m.label,
                    icon: m.icon,
                    selected: sel === m.id,
                    cls: 'ar-pg__row' + (sel === m.id ? ' ar-pg__row--selected' : ''),
                }));
            };
            this.onRowClick = (e: Event) => {
                /** @name        row
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned row value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const row = e.currentTarget as HTMLElement;

                /** @name        id
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned id value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const id = row.dataset.method as Types.PaymentMethodId;
                if (id)
                    this.selectMethod(id);
            };
            this.template = html `
            <div class="ar-pg">
                <div class="ar-pg__title">{{ this.headerTitle() }}</div>
                <div class="ar-pg__list">
                    <div a-for="m in this.methodList()"
                         :class="m.cls"
                         :data-method="m.id"
                         @click="this.onRowClick">
                        <div class="ar-pg__head">
                            <span class="ar-pg__radio">
                                <span a-if="m.selected">●</span>
                            </span>
                            <span class="ar-pg__icon" a-html="m.icon"></span>
                            <span class="ar-pg__label">{{ m.label }}</span>
                        </div>
                        <div class="ar-pg__mount" :data-mount="m.id" a-if="m.selected"></div>
                    </div>
                </div>
            </div>
        `;
            MountPaymentTemplate(this);
            this.dataset.ariannaFolderReady = 'true';
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {PaymentGateway.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = PaymentGateway.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        setMethods
         *  @public
         *  @type        {this}
         *  @description Component member for set Methods.
         *  @param       {PaymentGateway.Interfaces.PaymentGatewayMethodConfig} cfg Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setMethods(cfg: Interfaces.PaymentGatewayMethodConfig): this
        {
            this.methods$.Set({ ...cfg });
            // Pick first method as initial if none selected yet
            if (!this.selected$.Get())
            {
                /** @name        first
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned first value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const first = METHOD_META.find(m => cfg[m.id]);
                if (first)
                    this.selectMethod(first.id);
            }
            return this;
        }

        /** @name        getMethods
         *  @public
         *  @type        {PaymentGateway.Interfaces.PaymentGatewayMethodConfig}
         *  @description Component member for get Methods.
         *  @returns     {PaymentGateway.Interfaces.PaymentGatewayMethodConfig} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getMethods(): Interfaces.PaymentGatewayMethodConfig { return { ...this.methods$.Get() }; }

        /** @name        selectMethod
         *  @public
         *  @type        {this}
         *  @description Component member for select Method.
         *  @param       {PaymentGateway.Types.PaymentMethodId} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        selectMethod(id: Types.PaymentMethodId): this
        {
            this.selected$.Set(id);
            this.dispatchEvent(new CustomEvent('arianna:method-select', {
                bubbles: true, detail: { method: id },
            }));
            // Mount the underlying widget lazily after DOM update
            queueMicrotask(() => this._mountMethod(id));
            return this;
        }

        /** @name        getSelected
         *  @public
         *  @type        {PaymentGateway.Types.PaymentMethodId | null}
         *  @description Component member for get Selected.
         *  @returns     {PaymentGateway.Types.PaymentMethodId | null} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getSelected(): Types.PaymentMethodId | null { return this.selected$.Get(); }

        /** Programmatically trigger payment on the currently-selected method. */
        async pay(): Promise<void>
        {
            /** @name        sel
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sel value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sel = this.selected$.Get();
            if (!sel)
                return;

            /** @name        inst
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned inst value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const inst = this._instances[sel as Types.PaymentMethodId];
            if (!inst)
                return;

            /** @name        w
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned w value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const w = inst as {
                /** @name        pay
                 *  @public
                 *  @type        {Promise<void> | void}
                 *  @description Component member for pay.
                 *  @returns     {Promise<void> | void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                pay?(): Promise<void> | void;
            };
            if (typeof w.pay === 'function')
                await w.pay();
        }
        // ── Internal ─────────────────────────────────────────────────────────────
        /** @name        _mountMethod
         *  @public
         *  @type        {void}
         *  @description Component member for mount Method.
         *  @param       {PaymentGateway.Types.PaymentMethodId} id Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        _mountMethod(id: Types.PaymentMethodId): void
        {
            /** @name        host
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned host value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const host = this.querySelector<HTMLElement>(`[data-mount="${id}"]`);
            if (!host)
                return;
            if (host.children.length > 0)
                return; // already mounted
            /** @name        amount
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned amount value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const amount = parseFloat(this.getAttribute('amount') ?? '0') || 0;

            /** @name        currency
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned currency value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const currency = this.getAttribute('currency') ?? 'EUR';

            /** @name        cfg
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cfg value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cfg = this.methods$.Get();

            /** @name        el
             *  @public
             *  @type        {Element | null}
             *  @description Namespace-owned el value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            let el: Element | null = null;
            switch (id)
            {
                case 'applePay': {
                    /** @name        c
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned c value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const c = cfg.applePay ?? {};

                    /** @name        ap
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned ap value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const ap = new ApplePay.ApplePay();
                    if (c.merchantId)
                        ap.setAttribute('merchant-id', c.merchantId);
                    if (c.countryCode)
                        ap.setAttribute('country-code', c.countryCode);
                    ap.setAttribute('currency', currency);
                    ap.setAttribute('amount', String(amount));
                    if (c.supportedNetworks)
                        ap.setAttribute('supported-networks', c.supportedNetworks.join(','));
                    if (c.merchantCapabilities)
                        ap.setAttribute('merchant-capabilities', c.merchantCapabilities.join(','));
                    if (c.buttonStyle)
                        ap.setAttribute('button-style', c.buttonStyle);
                    if (c.buttonType)
                        ap.setAttribute('button-type', c.buttonType);
                    if (c.forceShow)
                        ap.setAttribute('force-show', '');
                    el = ap;
                    break;
                }
                case 'googlePay': {
                    /** @name        c
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned c value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const c = cfg.googlePay ?? {};

                    /** @name        gp
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned gp value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const gp = new GooglePay.GooglePay();
                    if (c.merchantId)
                        gp.setAttribute('merchant-id', c.merchantId);
                    if (c.merchantName)
                        gp.setAttribute('merchant-name', c.merchantName);
                    if (c.countryCode)
                        gp.setAttribute('country-code', c.countryCode);
                    gp.setAttribute('currency', currency);
                    gp.setAttribute('amount', String(amount));
                    if (c.gateway)
                        gp.setAttribute('gateway', c.gateway);
                    if (c.gatewayMerchantId)
                        gp.setAttribute('gateway-merchant-id', c.gatewayMerchantId);
                    if (c.environment)
                        gp.setAttribute('environment', c.environment);
                    if (c.buttonColor)
                        gp.setAttribute('button-color', c.buttonColor);
                    if (c.buttonType)
                        gp.setAttribute('button-type', c.buttonType);
                    el = gp;
                    break;
                }
                case 'card': {
                    /** @name        c
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned c value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const c = cfg.card ?? {};

                    /** @name        cc
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned cc value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const cc = new CreditCard.CreditCard();
                    cc.setAttribute('amount', String(amount));
                    cc.setAttribute('currency', currency);
                    if (c.saveOption)
                        cc.setAttribute('save-option', '');
                    if (c.holderNameRequired)
                        cc.setAttribute('holder-name-required', '');
                    el = cc;
                    break;
                }
                case 'paypal': {
                    /** @name        c
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned c value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const c = cfg.paypal ?? {};

                    /** @name        pp
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned pp value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const pp = new PayPal.PayPal();
                    if (c.clientId)
                        pp.setAttribute('client-id', c.clientId);
                    pp.setAttribute('amount', String(amount));
                    pp.setAttribute('currency', currency);
                    if (c.intent)
                        pp.setAttribute('intent', c.intent);
                    if (c.redirectUrl)
                        pp.setAttribute('redirect-url', c.redirectUrl);
                    if (c.buttonStyle)
                        pp.setAttribute('button-style', c.buttonStyle);
                    if (c.buttonColor)
                        pp.setAttribute('button-color', c.buttonColor);
                    if (c.buttonShape)
                        pp.setAttribute('button-shape', c.buttonShape);
                    el = pp;
                    break;
                }
                case 'stripe': {
                    /** @name        c
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned c value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const c = cfg.stripe ?? {};

                    /** @name        st
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned st value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const st = new Stripe.Stripe();
                    if (c.publishableKey)
                        st.setAttribute('publishable-key', c.publishableKey);
                    if (c.clientSecret)
                        st.setAttribute('client-secret', c.clientSecret);
                    if (c.returnUrl)
                        st.setAttribute('return-url', c.returnUrl);
                    if (c.locale)
                        st.setAttribute('locale', c.locale);
                    if (c.appearanceTheme)
                        st.setAttribute('appearance-theme', c.appearanceTheme);
                    el = st;
                    break;
                }
                case 'satispay': {
                    /** @name        c
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned c value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const c = cfg.satispay ?? {};

                    /** @name        sp
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned sp value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const sp = new Satispay.Satispay();
                    if (c.redirectUrl)
                        sp.setAttribute('redirect-url', c.redirectUrl);
                    sp.setAttribute('amount', String(amount));
                    sp.setAttribute('currency', currency);
                    if (c.target)
                        sp.setAttribute('target', c.target);
                    el = sp;
                    break;
                }
                case 'nexi': {
                    /** @name        c
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned c value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const c = cfg.nexi ?? {};

                    /** @name        nx
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned nx value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const nx = new Nexi.Nexi();
                    if (c.redirectUrl)
                        nx.setAttribute('redirect-url', c.redirectUrl);
                    nx.setAttribute('amount', String(amount));
                    nx.setAttribute('currency', currency);
                    if (c.target)
                        nx.setAttribute('target', c.target);
                    el = nx;
                    break;
                }
                case 'alipay': {
                    /** @name        c
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned c value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const c = cfg.alipay ?? {};

                    /** @name        ap
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned ap value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const ap = new AliPay.AliPay();
                    if (c.mode)
                        ap.setAttribute('mode', c.mode);
                    if (c.redirectUrl)
                        ap.setAttribute('redirect-url', c.redirectUrl);
                    if (c.qrUrl)
                        ap.setAttribute('qr-url', c.qrUrl);
                    ap.setAttribute('amount', String(amount));
                    ap.setAttribute('currency', currency);
                    if (c.target)
                        ap.setAttribute('target', c.target);
                    el = ap;
                    break;
                }
            }
            if (el)
            {
                host.appendChild(el);
                this._instances[id] = el;
            }
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
        onMount() { }

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

        /** @name        headerTitle
         *  @private
         *  @type        {() => string}
         *  @description Component member for header Title.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private headerTitle: () => string = () => 'Choose how to pay';

        /** @name        methodList
         *  @private
         *  @type        {() => Array<{
            id: PaymentGateway.Types.PaymentMethodId;
            label: string;
            icon: string;
            cls: string;
            selected: boolean;
        }>}
         *  @description Component member for method List.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private methodList: () => Array<{
            /** @name        id
             *  @public
             *  @type        {PaymentGateway.Types.PaymentMethodId}
             *  @description Component member for id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            id: Types.PaymentMethodId;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label: string;

            /** @name        icon
             *  @public
             *  @type        {string}
             *  @description Component member for icon.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            icon: string;

            /** @name        cls
             *  @public
             *  @type        {string}
             *  @description Component member for cls.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            cls: string;

            /** @name        selected
             *  @public
             *  @type        {boolean}
             *  @description Component member for selected.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            selected: boolean;
        }> = () => [];

        /** @name        onRowClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Row Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onRowClick: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {PaymentGateway.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {PaymentGateway.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule('.PaymentGateway', {
                    BoxSizing: 'border-box',
                    MaxWidth: '100%',
                    MinWidth: '0',
                    display: 'block',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '13px',
                    color: 'var(--arianna-text, var(--text, #1c1e21))',
                    maxWidth: '480px',
                }),
                new Rule('.ar-pg', {
                    display: 'flex', flexDirection: 'column',
                    background: 'var(--arianna-bg, var(--bg, #fff))',
                    border: '1px solid var(--arianna-border, var(--border, #e6e8eb))',
                    borderRadius: 'var(--arianna-radius, 8px)',
                    overflow: 'hidden',
                }),
                new Rule('.ar-pg__title', {
                    padding: '14px 18px',
                    background: 'var(--arianna-bg-3, var(--bg3, #f6f7f9))',
                    borderBottom: '1px solid var(--arianna-border, var(--border, #e6e8eb))',
                    fontWeight: '600',
                    fontSize: '14px',
                }),
                new Rule('.ar-pg__list', { display: 'flex', flexDirection: 'column' }),
                new Rule('.ar-pg__row', {
                    display: 'flex', flexDirection: 'column',
                    borderBottom: '1px solid var(--arianna-bg-3, var(--bg3, #f6f7f9))',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                }),
                new Rule('.ar-pg__row:hover', { background: 'var(--arianna-bg-3, var(--bg3, #f6f7f9))' }),
                new Rule('.ar-pg__row--selected', {
                    background: 'rgba(31,111,235,0.04)',
                    cursor: 'default',
                }),
                new Rule('.ar-pg__head', {
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 18px',
                }),
                new Rule('.ar-pg__radio', {
                    width: '18px', height: '18px',
                    border: '2px solid var(--arianna-muted, var(--muted, #687079))',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px',
                    color: 'var(--arianna-primary, var(--accent, #e40c88))',
                }),
                new Rule('.ar-pg__row--selected .ar-pg__radio', {
                    borderColor: 'var(--arianna-primary, var(--accent, #e40c88))',
                }),
                new Rule('.ar-pg__icon', {
                    fontSize: '16px', fontWeight: '700',
                    width: '20px', textAlign: 'center',
                }),
                new Rule('.ar-pg__label', { flex: '1' }),
                new Rule('.ar-pg__mount', { padding: '0 18px 16px 50px' }),
            ]);
        }
    }
}
export default PaymentGateway;
