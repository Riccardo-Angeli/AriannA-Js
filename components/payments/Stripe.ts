/**
 * @module    components/payments/Stripe
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Stripe component module.
 */


import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

import { MountPaymentTemplate } from './Base.ts';
import { PaymentProviders } from './Providers.ts';
declare const Component: any;
declare const Css: any;
declare namespace Css { type Rule = any; type Stylesheet = any; }
declare const Reactivity: any;
declare namespace Reactivity { type Signal<T> = any; type Effect = any; }
declare const Templates: any;


/** @namespace   Stripe
 *  @public
 *  @description Namespace containing Stripe contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Stripe
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
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   StripeOptions
         *  @public
         *  @description StripeOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface StripeOptions
        {
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
            locale?: string;

            /** @name        appearanceTheme
             *  @public
             *  @type        {'stripe' | 'flat' | 'night'}
             *  @description Component member for appearance Theme.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            appearanceTheme?: 'stripe' | 'flat' | 'night';
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

    /** @name        SDK_URL
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned SDK_URL value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const SDK_URL = 'https://js.stripe.com/v3/';

    /** @name        sdkLoadPromise
     *  @public
     *  @type        {Promise<unknown> | null}
     *  @description Namespace-owned sdkLoadPromise value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export let sdkLoadPromise: Promise<unknown> | null = null;
    export function loadStripeSDK(): Promise<unknown> {
        if (sdkLoadPromise)
            return sdkLoadPromise;
        sdkLoadPromise = new Promise((resolve, reject) => {
            /** @name        w
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned w value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const w = window as unknown as {
                /** @name        Stripe
                 *  @public
                 *  @type        {unknown}
                 *  @description Component member for Stripe.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Stripe?: unknown;
            };
            if (w.Stripe)
            {
                resolve(w.Stripe);
                return;
            }

            /** @name        s
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s = document.createElement('script');
            s.src = SDK_URL;
            s.async = true;
            s.onload = () => resolve((window as unknown as {
                /** @name        Stripe
                 *  @public
                 *  @type        {unknown}
                 *  @description Component member for Stripe.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Stripe?: unknown;
            }).Stripe);
            s.onerror = () => reject(new Error('Stripe SDK failed to load'));
            document.head.appendChild(s);
        });
        return sdkLoadPromise;
    }

    /** @name        LoadStripeSDK
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned LoadStripeSDK value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function LoadStripeSDK(): Promise<unknown>
    {
        return loadStripeSDK();
    }

    /** @class       Stripe
     *  @public
     *  @description AriannA Stripe component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const STRIPE_LOGO = PaymentProviders.Stripe.logo;

    @Component('arianna-stripe', {}, {
        shadow: false,
        Attributes: ['publishable-key', 'client-secret', 'return-url', 'locale', 'appearance-theme'],
    })
    export class Stripe extends HTMLElement
    {
        public static readonly Styles = Stripe.DefaultSheet();
        /** Canonical AriannA public DOM identity. */
        private readonly _AriannaIdentity = (() =>
        {
            const type = 'Stripe';
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
            if(!this.ready$) this.ready$ = signal<boolean>(false);
            if(!this.error$) this.error$ = signal<string | null>(null);
            if(!this.busy$) this.busy$ = signal<boolean>(false);
            if(this._stripe === undefined) this._stripe = null;
            if(this._elements === undefined) this._elements = null;
            this.classList.add('Stripe');
        }

        /** Compiler-visible template slot installed by the Component decorator. */
        declare template: unknown;

        /** @name        ready$
         *  @public
         *  @type        {Stripe.Types.Signal<boolean>}
         *  @description Component member for ready$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare ready$: Types.Signal<boolean>;

        /** @name        error$
         *  @public
         *  @type        {Stripe.Types.Signal<string | null>}
         *  @description Component member for error$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare error$: Types.Signal<string | null>;

        /** @name        busy$
         *  @public
         *  @type        {Stripe.Types.Signal<boolean>}
         *  @description Component member for busy$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare busy$: Types.Signal<boolean>;

        /** @name        _stripe
         *  @public
         *  @type        {unknown}
         *  @description Component member for stripe.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare _stripe: unknown;

        /** @name        _elements
         *  @public
         *  @type        {unknown}
         *  @description Component member for elements.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        declare _elements: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Stripe.Interfaces.StripeOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.StripeOptions = {} as Interfaces.StripeOptions)
        {
            if(!this.ready$) this.ready$ = signal<boolean>(false);
            if(!this.error$) this.error$ = signal<string | null>(null);
            if(!this.busy$) this.busy$ = signal<boolean>(false);
            if(this._stripe === undefined) this._stripe = null;
            if(this._elements === undefined) this._elements = null;
            if(this.dataset.ariannaFolderReady === 'true') return;
            (this as any).STRIPE_LOGO = STRIPE_LOGO;
            (this as any).PAYMENT_PROVIDER = PaymentProviders.Stripe;
            (this as any).PAYMENT_PROVIDER_LOGO = PaymentProviders.Stripe.logo;
            (this as any).PAYMENT_PROVIDER_NAME = PaymentProviders.Stripe.name;
            this.style.setProperty('--ar-payment-provider', PaymentProviders.Stripe.color);
            this.style.setProperty('--ar-payment-contrast', PaymentProviders.Stripe.contrast ?? '#fff');
            this.statusMsg = () => this.error$.Get() ?? (this.ready$.Get() ? '' : 'Loading Stripe…');
            this.payDisabled = () => !this.ready$.Get() || this.busy$.Get();
            this.payLabel = () => this.busy$.Get() ? 'Processing…' : 'Pay';
            this.onPay = () => { void this.pay(); };
            this.template = html `
            <section class="ar-payment-provider">
                <header class="ar-payment-header">
                    <span class="ar-payment-logo" a-html="this.PAYMENT_PROVIDER_LOGO"></span>
                    <strong class="ar-payment-name">{{ this.PAYMENT_PROVIDER_NAME }}</strong>
                </header>
                <div class="ar-payment-body">
            <div class="ar-stripe">
                <div class="ar-stripe__brand" a-html="this.STRIPE_LOGO"></div>
                <div class="ar-stripe__mount" data-r="mount"></div>
                <div class="ar-stripe__status" a-if="this.statusMsg()">{{ this.statusMsg() }}</div>
                <button type="button" class="ar-stripe__pay"
                        :disabled="this.payDisabled()"
                        @click="this.onPay">{{ this.payLabel() }}</button>
            </div>
        
                </div>
            </section>
        `;
            MountPaymentTemplate(this);
            this.dataset.ariannaFolderReady = 'true';
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Stripe.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Stripe.DefaultSheet();
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
            if (!this.ready$.Get() || this.busy$.Get())
                return;
            this.busy$.Set(true);
            try
            {
                /** @name        stripe
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned stripe value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const stripe = this._stripe as {
                    /** @name        confirmPayment
                     *  @public
                     *  @type        {Promise<{
                        error?: {
                            message?: string;
                        };
                        paymentIntent?: unknown;
                    }>}
                     *  @description Component member for confirm Payment.
                     *  @param       {{
                        elements: unknown;
                        confirmParams: {
                            return_url: string;
                        };
                        redirect?: 'if_required' | 'always';
                    }} opts Parameter.
                     *  @returns     {Promise<{
                        error?: {
                            message?: string;
                        };
                        paymentIntent?: unknown;
                    }>} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    confirmPayment(opts: {
                        /** @name        elements
                         *  @public
                         *  @type        {unknown}
                         *  @description Component member for elements.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        elements: unknown;

                        /** @name        confirmParams
                         *  @public
                         *  @type        {{
                            return_url: string;
                        }}
                         *  @description Component member for confirm Params.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        confirmParams: {
                            /** @name        return_url
                             *  @public
                             *  @type        {string}
                             *  @description Component member for return_url.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            return_url: string;
                        };

                        /** @name        redirect
                         *  @public
                         *  @type        {'if_required' | 'always'}
                         *  @description Component member for redirect.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        redirect?: 'if_required' | 'always';
                    }): Promise<{
                        /** @name        error
                         *  @public
                         *  @type        {{
                            message?: string;
                        }}
                         *  @description Component member for error.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        error?: {
                            /** @name        message
                             *  @public
                             *  @type        {string}
                             *  @description Component member for message.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            message?: string;
                        };

                        /** @name        paymentIntent
                         *  @public
                         *  @type        {unknown}
                         *  @description Component member for payment Intent.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        paymentIntent?: unknown;
                    }>;
                };

                /** @name        result
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned result value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const result = await stripe.confirmPayment({
                    elements: this._elements,
                    confirmParams: { return_url: this.getAttribute('return-url') ?? window.location.href },
                    redirect: 'if_required',
                });
                if (result.error)
                {
                    this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                        bubbles: true,
                        detail: { method: 'stripe', message: result.error.message ?? 'Stripe confirmation failed' },
                    }));
                }
                else
                {
                    this.dispatchEvent(new CustomEvent('arianna:payment-success', {
                        bubbles: true,
                        detail: { method: 'stripe', paymentIntent: result.paymentIntent },
                    }));
                }
            }
            catch (err)
            {
                this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                    bubbles: true,
                    detail: { method: 'stripe', message: err instanceof Error ? err.message : String(err) },
                }));
            }
            finally
            {
                this.busy$.Set(false);
            }
        }

        /** @name        _initStripe
         *  @public
         *  @type        {Promise<void>}
         *  @description Component member for init Stripe.
         *  @returns     {Promise<void>} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        async _initStripe(): Promise<void>
        {
            /** @name        pk
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned pk value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const pk = this.getAttribute('publishable-key');

            /** @name        cs
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned cs value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const cs = this.getAttribute('client-secret');
            if (!pk || !cs)
            {
                this.error$.Set('Missing publishable-key or client-secret');
                return;
            }
            try
            {
                /** @name        StripeCtor
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned StripeCtor value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const StripeCtor = await loadStripeSDK() as (key: string, opts?: unknown) => unknown;
                this._stripe = StripeCtor(pk, {
                    locale: this.getAttribute('locale') ?? 'auto',
                });

                /** @name        stripe
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned stripe value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const stripe = this._stripe as {
                    /** @name        elements
                     *  @public
                     *  @type        {{
                        create(type: string, opts?: unknown):
                        {
                            mount(selOrEl: HTMLElement | string): void;
                        };
                    }}
                     *  @description Component member for elements.
                     *  @param       {unknown} opts Parameter.
                     *  @returns     {{
                        create(type: string, opts?: unknown):
                        {
                            mount(selOrEl: HTMLElement | string): void;
                        };
                    }} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    elements(opts: unknown):
                    {
                        /** @name        create
                         *  @public
                         *  @type        {{
                            mount(selOrEl: HTMLElement | string): void;
                        }}
                         *  @description Component member for create.
                         *  @param       {string} type Parameter.
                         *  @param       {unknown} opts Parameter.
                         *  @returns     {{
                            mount(selOrEl: HTMLElement | string): void;
                        }} Result.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        create(type: string, opts?: unknown):
                        {
                            /** @name        mount
                             *  @public
                             *  @type        {void}
                             *  @description Component member for mount.
                             *  @param       {HTMLElement | string} selOrEl Parameter.
                             *  @returns     {void} Result.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            mount(selOrEl: HTMLElement | string): void;
                        };
                    };
                };
                this._elements = stripe.elements({
                    clientSecret: cs,
                    appearance: { theme: (this.getAttribute('appearance-theme') ?? 'stripe') as 'stripe' | 'flat' | 'night' },
                });

                /** @name        paymentEl
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned paymentEl value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const paymentEl = (this._elements as {
                    /** @name        create
                     *  @public
                     *  @type        {{
                        mount(selOrEl: HTMLElement | string): void;
                    }}
                     *  @description Component member for create.
                     *  @param       {string} type Parameter.
                     *  @param       {unknown} opts Parameter.
                     *  @returns     {{
                        mount(selOrEl: HTMLElement | string): void;
                    }} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    create(type: string, opts?: unknown):
                    {
                        /** @name        mount
                         *  @public
                         *  @type        {void}
                         *  @description Component member for mount.
                         *  @param       {HTMLElement | string} selOrEl Parameter.
                         *  @returns     {void} Result.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        mount(selOrEl: HTMLElement | string): void;
                    };
                }).create('payment');

                /** @name        host
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned host value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const host = this.querySelector<HTMLElement>('[data-r="mount"]');
                if (host)
                {
                    paymentEl.mount(host);
                    this.ready$.Set(true);
                }
            }
            catch (err)
            {
                this.error$.Set(err instanceof Error ? err.message : String(err));
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
        async onMount()
        {
            await this._initStripe();
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

        /** @name        statusMsg
         *  @private
         *  @type        {() => string}
         *  @description Component member for status Msg.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private statusMsg: () => string = () => '';

        /** @name        payDisabled
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for pay Disabled.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private payDisabled: () => boolean = () => true;

        /** @name        payLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for pay Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private payLabel: () => string = () => 'Pay';

        /** @name        onPay
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Pay.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onPay: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Stripe.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Stripe.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule('.Stripe', {
                    BoxSizing: 'border-box',
                    MaxWidth: '100%',
                    MinWidth: '0',
                    display: 'block',
                    width: '100%', maxWidth: '420px',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '13px',
                    color: 'var(--arianna-text, var(--text, #1c1e21))',
                }),
                new Rule('.ar-stripe', {
                    boxSizing: 'border-box',
                    display: 'flex', flexDirection: 'column', gap: '12px',
                    width: '100%', maxWidth: '100%', overflow: 'hidden',
                    padding: '14px',
                    background: 'var(--arianna-bg, var(--bg, #fff))',
                    border: '1px solid var(--arianna-border, var(--border, #e6e8eb))',
                    borderRadius: 'var(--arianna-radius, 8px)',
                }),
                new Rule('.ar-stripe__mount', { minHeight: '60px', minWidth: '0', maxWidth: '100%', overflow: 'hidden' }),
                new Rule('.ar-stripe__status', {
                    fontSize: '11px',
                    color: 'var(--arianna-muted, var(--muted, #687079))',
                    textAlign: 'center',
                }),
                new Rule('.ar-stripe__pay', {
                    padding: '11px',
                    background: '#635bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                }),
                new Rule('.ar-stripe__pay:hover:not(:disabled)', { background: '#5a52e8' }),
                new Rule('.ar-stripe__pay:disabled', { opacity: '0.4', cursor: 'not-allowed' }),
            ]);
        }
    }
}
export default Stripe;
