/**
 * @module    components/payments/PayPal
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA PayPal component module.
 */

import { Component, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @namespace   PayPal
 *  @public
 *  @description Namespace containing PayPal contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace PayPal
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
        /** @interface   PayPalOptions
         *  @public
         *  @description PayPalOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface PayPalOptions
        {
            /** @name        clientId
             *  @public
             *  @type        {string}
             *  @description Component member for client Id.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            clientId: string;

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

            /** @name        intent
             *  @public
             *  @type        {'capture' | 'authorize'}
             *  @description Component member for intent.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            intent?: 'capture' | 'authorize';

            /** @name        redirectUrl
             *  @public
             *  @type        {string}
             *  @description Component member for redirect Url.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            redirectUrl?: string;

            /** @name        buttonStyle
             *  @public
             *  @type        {'paypal' | 'checkout' | 'pay'}
             *  @description Component member for button Style.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            buttonStyle?: 'paypal' | 'checkout' | 'pay';

            /** @name        buttonColor
             *  @public
             *  @type        {'gold' | 'blue' | 'silver' | 'white' | 'black'}
             *  @description Component member for button Color.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            buttonColor?: 'gold' | 'blue' | 'silver' | 'white' | 'black';

            /** @name        buttonShape
             *  @public
             *  @type        {'rect' | 'pill'}
             *  @description Component member for button Shape.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            buttonShape?: 'rect' | 'pill';
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
    export const signal = Reactivity.CreateSignal;

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @name        SDK_BASE
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned SDK_BASE value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const SDK_BASE = 'https://www.paypal.com/sdk/js';

    /** @name        sdkLoadPromise
     *  @public
     *  @type        {Promise<unknown> | null}
     *  @description Namespace-owned sdkLoadPromise value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export let sdkLoadPromise: Promise<unknown> | null = null;
    export function loadPayPalSDK(clientId: string, currency: string, intent: string): Promise<unknown> {
        if (sdkLoadPromise)
            return sdkLoadPromise;

        /** @name        url
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned url value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const url = `${SDK_BASE}?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=${encodeURIComponent(intent)}`;
        sdkLoadPromise = new Promise((resolve, reject) => {
            /** @name        w
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned w value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const w = window as unknown as {
                /** @name        paypal
                 *  @public
                 *  @type        {unknown}
                 *  @description Component member for paypal.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                paypal?: unknown;
            };
            if (w.paypal)
            {
                resolve(w.paypal);
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
            s.src = url;
            s.async = true;
            s.onload = () => resolve((window as unknown as {
                /** @name        paypal
                 *  @public
                 *  @type        {unknown}
                 *  @description Component member for paypal.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                paypal?: unknown;
            }).paypal);
            s.onerror = () => reject(new Error('PayPal SDK failed to load'));
            document.head.appendChild(s);
        });
        return sdkLoadPromise;
    }

    /** @name        LoadPayPalSDK
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned LoadPayPalSDK value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function LoadPayPalSDK
    (
        clientId : string,
        currency : string,
        intent   : string
    ): Promise<unknown>
    {
        return loadPayPalSDK(clientId, currency, intent);
    }

    /** @class       PayPal
     *  @public
     *  @description AriannA PayPal component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-paypal', {}, {
        Attributes: ['client-id', 'amount', 'currency', 'intent', 'redirect-url', 'button-style', 'button-color', 'button-shape'],
    })
    export class PayPal extends HTMLElement
    {
        /** Compiler-visible template slot installed by the Component decorator. */
        declare template: unknown;

        /** @name        sdkLoaded$
         *  @public
         *  @type        {PayPal.Types.Signal<boolean>}
         *  @description Component member for sdk Loaded$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        sdkLoaded$: Types.Signal<boolean> = signal<boolean>(false);

        /** @name        sdkError$
         *  @public
         *  @type        {PayPal.Types.Signal<string | null>}
         *  @description Component member for sdk Error$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        sdkError$: Types.Signal<string | null> = signal<string | null>(null);

        /** @name        busy$
         *  @public
         *  @type        {PayPal.Types.Signal<boolean>}
         *  @description Component member for busy$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        busy$: Types.Signal<boolean> = signal<boolean>(false);

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {PayPal.Interfaces.PayPalOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.PayPalOptions = {} as Interfaces.PayPalOptions)
        {
            this.fallbackVisible = () => !this.sdkLoaded$.Get();
            this.fallbackLabel = () => this.sdkError$.Get()
                ? 'Open PayPal'
                : 'Loading PayPal…';
            this.onFallback = () => {
                /** @name        url
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned url value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const url = this.getAttribute('redirect-url');
                if (url)
                    window.open(url, '_blank', 'noopener');
                else
                    void this.pay();
            };
            this.template = html `
            <div class="ar-pp">
                <div class="ar-pp__mount" data-r="mount"></div>
                <button type="button" class="ar-pp__fallback"
                        a-if="this.fallbackVisible()"
                        @click="this.onFallback">
                    <span class="ar-pp__logo">PayPal</span>
                    <span>{{ this.fallbackLabel() }}</span>
                </button>
            </div>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {PayPal.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = PayPal.DefaultSheet();
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
                /** @name        url
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned url value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const url = this.getAttribute('redirect-url');
                if (url)
                {
                    window.open(url, '_blank', 'noopener');
                    // We don't know the outcome — leave it to the merchant's webhook
                    return;
                }
                throw new Error('No PayPal SDK loaded and no redirect-url provided');
            }
            catch (err)
            {
                this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                    bubbles: true,
                    detail: { method: 'paypal', message: err instanceof Error ? err.message : String(err) },
                }));
            }
            finally
            {
                this.busy$.Set(false);
            }
        }

        /** @name        #mountSDKButtons
         *  @public
         *  @type        {Promise<void>}
         *  @description Component member for mount SDKButtons.
         *  @returns     {Promise<void>} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        async #mountSDKButtons(): Promise<void>
        {
            /** @name        clientId
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned clientId value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const clientId = this.getAttribute('client-id');
            if (!clientId)
                return;

            /** @name        currency
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned currency value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const currency = this.getAttribute('currency') ?? 'EUR';

            /** @name        intent
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned intent value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const intent = (this.getAttribute('intent') ?? 'capture') as 'capture' | 'authorize';

            /** @name        amount
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned amount value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const amount = parseFloat(this.getAttribute('amount') ?? '0') || 0;

            /** @name        style
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned style value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const style = this.getAttribute('button-style') ?? 'paypal';

            /** @name        color
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned color value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const color = this.getAttribute('button-color') ?? 'gold';

            /** @name        shape
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned shape value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const shape = this.getAttribute('button-shape') ?? 'rect';
            try
            {
                /** @name        paypal
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned paypal value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const paypal = await loadPayPalSDK(clientId, currency, intent) as {
                    /** @name        Buttons
                     *  @public
                     *  @type        {{
                        render(host: HTMLElement): Promise<void>;
                    }}
                     *  @description Component member for Buttons.
                     *  @param       {unknown} cfg Parameter.
                     *  @returns     {{
                        render(host: HTMLElement): Promise<void>;
                    }} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    Buttons(cfg: unknown):
                    {
                        /** @name        render
                         *  @public
                         *  @type        {Promise<void>}
                         *  @description Component member for render.
                         *  @param       {HTMLElement} host Parameter.
                         *  @returns     {Promise<void>} Result.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        render(host: HTMLElement): Promise<void>;
                    };
                };

                /** @name        host
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned host value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const host = this.querySelector<HTMLElement>('[data-r="mount"]');
                if (!host)
                    return;

                /** @name        buttons
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned buttons value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const buttons = paypal.Buttons({
                    style: { layout: 'vertical', color, shape, label: style },
                    createOrder: (_data: unknown, actions: {
                        /** @name        order
                         *  @public
                         *  @type        {{
                            create(o: unknown): unknown;
                        }}
                         *  @description Component member for order.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        order: {
                            /** @name        create
                             *  @public
                             *  @type        {unknown}
                             *  @description Component member for create.
                             *  @param       {unknown} o Parameter.
                             *  @returns     {unknown} Result.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            create(o: unknown): unknown;
                        };
                    }) => actions.order.create({
                        intent: intent.toUpperCase(),
                        purchase_units: [{ amount: { currency_code: currency, value: amount.toFixed(2) } }],
                    }),
                    onApprove: async (data: {
                        /** @name        orderID
                         *  @public
                         *  @type        {string}
                         *  @description Component member for order ID.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        orderID: string;

                        /** @name        payerID
                         *  @public
                         *  @type        {string}
                         *  @description Component member for payer ID.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        payerID?: string;
                    }, actions: {
                        /** @name        order
                         *  @public
                         *  @type        {{
                            capture(): Promise<unknown>;
                        }}
                         *  @description Component member for order.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        order: {
                            /** @name        capture
                             *  @public
                             *  @type        {Promise<unknown>}
                             *  @description Component member for capture.
                             *  @returns     {Promise<unknown>} Result.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            capture(): Promise<unknown>;
                        };
                    }) => {
                        try
                        {
                            /** @name        captureData
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned captureData value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const captureData = await actions.order.capture();
                            this.dispatchEvent(new CustomEvent('arianna:payment-success', {
                                bubbles: true,
                                detail: {
                                    method: 'paypal',
                                    orderId: data.orderID,
                                    payerId: data.payerID ?? '',
                                    capture: captureData,
                                },
                            }));
                        }
                        catch (err)
                        {
                            this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                                bubbles: true,
                                detail: { method: 'paypal', message: err instanceof Error ? err.message : String(err) },
                            }));
                        }
                    },
                    onCancel: () => {
                        this.dispatchEvent(new CustomEvent('arianna:payment-cancel', {
                            bubbles: true, detail: { method: 'paypal' },
                        }));
                    },
                    onError: (err: unknown) => {
                        this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                            bubbles: true,
                            detail: { method: 'paypal', message: err instanceof Error ? err.message : String(err) },
                        }));
                    },
                });
                await buttons.render(host);
                this.sdkLoaded$.Set(true);
            }
            catch (err)
            {
                this.sdkError$.Set(err instanceof Error ? err.message : String(err));
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
            await this.#mountSDKButtons();
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

        /** @name        fallbackVisible
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for fallback Visible.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private fallbackVisible: () => boolean = () => true;

        /** @name        fallbackLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for fallback Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private fallbackLabel: () => string = () => 'Loading PayPal…';

        /** @name        onFallback
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Fallback.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onFallback: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {PayPal.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {PayPal.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', { display: 'inline-block', minWidth: '200px' }),
                new Rule('.ar-pp__mount', { display: 'block' }),
                new Rule('.ar-pp__fallback', {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    minWidth: '200px',
                    minHeight: '44px',
                    padding: '0 18px',
                    background: '#ffc439',
                    color: '#003087',
                    border: 'none',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    font: 'italic 700 16px "Helvetica Neue", Arial, sans-serif',
                }),
                new Rule('.ar-pp__fallback:hover', { background: '#f5b730' }),
                new Rule('.ar-pp__logo', { fontStyle: 'italic', fontWeight: '900' }),
            ]);
        }
    }
}
export default PayPal;
