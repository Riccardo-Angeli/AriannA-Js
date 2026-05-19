/**
 * @module    components/payments/Stripe
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Stripe Payment Element widget. Loads Stripe.js
 * (https://js.stripe.com/v3/) on demand and mounts the unified Payment
 * Element using a `client-secret` that the merchant's server obtains via
 * the `/v1/payment_intents` REST endpoint.
 *
 * The Payment Element supports cards, SEPA debit, iDEAL, Bancontact,
 * Sofort, Klarna, Afterpay and many other methods automatically — what
 * shows up depends on the PaymentIntent's `payment_method_types` and the
 * Stripe account's region settings.
 *
 * REQUIREMENTS:
 *   • Stripe account + publishable key
 *   • A PaymentIntent created server-side, its `client_secret` passed in
 *   • A `return-url` for confirmation on 3DS challenges
 *
 * @example HTML
 *   <arianna-stripe publishable-key="pk_test_..."
 *                   client-secret="pi_..._secret_..."
 *                   return-url="https://shop.example.com/return"></arianna-stripe>
 *
 * Events:
 *   arianna:payment-success  detail: { method: 'stripe', paymentIntent: unknown }
 *   arianna:payment-error    detail: { method: 'stripe', message: string }
 *
 * Attrs: publishable-key, client-secret, return-url, locale, appearance-theme
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface StripeOptions {
    publishableKey   : string;
    clientSecret     : string;
    returnUrl        : string;
    locale?          : string;
    appearanceTheme? : 'stripe' | 'flat' | 'night';
}

const SDK_URL = 'https://js.stripe.com/v3/';
let sdkLoadPromise: Promise<unknown> | null = null;

function loadStripeSDK(): Promise<unknown> {
    if (sdkLoadPromise) return sdkLoadPromise;
    sdkLoadPromise = new Promise((resolve, reject) => {
        const w = window as unknown as { Stripe?: unknown };
        if (w.Stripe) { resolve(w.Stripe); return; }
        const s = document.createElement('script');
        s.src = SDK_URL;
        s.async = true;
        s.onload = () => resolve((window as unknown as { Stripe?: unknown }).Stripe);
        s.onerror = () => reject(new Error('Stripe SDK failed to load'));
        document.head.appendChild(s);
    });
    return sdkLoadPromise;
}

export class Stripe extends Component('arianna-stripe', HTMLElement, {}, {
    attrs : ['publishable-key', 'client-secret', 'return-url', 'locale', 'appearance-theme'],
})
{
    ready$: Signal<boolean> = signal<boolean>(false);
    error$: Signal<string | null> = signal<string | null>(null);
    busy$ : Signal<boolean> = signal<boolean>(false);

    #stripe: unknown = null;
    #elements: unknown = null;

    build(_opts: StripeOptions = {} as StripeOptions)
    {
        this.statusMsg = () => this.error$.get() ?? (this.ready$.get() ? '' : 'Loading Stripe…');
        this.payDisabled = () => !this.ready$.get() || this.busy$.get();
        this.payLabel = () => this.busy$.get() ? 'Processing…' : 'Pay';

        this.onPay = () => { void this.pay(); };

        this.template = html`
            <div class="ar-stripe">
                <div class="ar-stripe__mount" data-r="mount"></div>
                <div class="ar-stripe__status" a-if="this.statusMsg()">{{ this.statusMsg() }}</div>
                <button type="button" class="ar-stripe__pay"
                        :disabled="this.payDisabled()"
                        @click="this.onPay">{{ this.payLabel() }}</button>
            </div>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = Stripe.DefaultSheet();
    }

    async pay(): Promise<void> {
        if (!this.ready$.get() || this.busy$.get()) return;
        this.busy$.set(true);
        try {
            const stripe = this.#stripe as {
                confirmPayment(opts: { elements: unknown; confirmParams: { return_url: string }; redirect?: 'if_required' | 'always' }): Promise<{ error?: { message?: string }; paymentIntent?: unknown }>;
            };
            const result = await stripe.confirmPayment({
                elements: this.#elements,
                confirmParams: { return_url: this.getAttribute('return-url') ?? window.location.href },
                redirect: 'if_required',
            });
            if (result.error) {
                this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                    bubbles: true,
                    detail: { method: 'stripe', message: result.error.message ?? 'Stripe confirmation failed' },
                }));
            } else {
                this.dispatchEvent(new CustomEvent('arianna:payment-success', {
                    bubbles: true,
                    detail: { method: 'stripe', paymentIntent: result.paymentIntent },
                }));
            }
        } catch (err) {
            this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                bubbles: true,
                detail: { method: 'stripe', message: err instanceof Error ? err.message : String(err) },
            }));
        } finally {
            this.busy$.set(false);
        }
    }

    async #initStripe(): Promise<void> {
        const pk = this.getAttribute('publishable-key');
        const cs = this.getAttribute('client-secret');
        if (!pk || !cs) {
            this.error$.set('Missing publishable-key or client-secret');
            return;
        }
        try {
            const StripeCtor = await loadStripeSDK() as (key: string, opts?: unknown) => unknown;
            this.#stripe = StripeCtor(pk, {
                locale: this.getAttribute('locale') ?? 'auto',
            });
            const stripe = this.#stripe as {
                elements(opts: unknown): {
                    create(type: string, opts?: unknown): { mount(selOrEl: HTMLElement | string): void };
                };
            };
            this.#elements = stripe.elements({
                clientSecret: cs,
                appearance: { theme: (this.getAttribute('appearance-theme') ?? 'stripe') as 'stripe' | 'flat' | 'night' },
            });
            const paymentEl = (this.#elements as {
                create(type: string, opts?: unknown): { mount(selOrEl: HTMLElement | string): void };
            }).create('payment');
            const host = this.querySelector<HTMLElement>('[data-r="mount"]');
            if (host) {
                paymentEl.mount(host);
                this.ready$.set(true);
            }
        } catch (err) {
            this.error$.set(err instanceof Error ? err.message : String(err));
        }
    }

    onCreated()       {}
    onBeforeMount()   {}
    async onMount() {
        await this.#initStripe();
    }
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    private statusMsg  : () => string = () => '';
    private payDisabled: () => boolean = () => true;
    private payLabel   : () => string = () => 'Pay';
    private onPay      : (e: Event) => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    display: 'block',
                    width: '100%', maxWidth: '420px',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '13px',
                    color: 'var(--arianna-text, #1f2328)',
                }),
                new Rule('.ar-stripe', {
                    display: 'flex', flexDirection: 'column', gap: '12px',
                    padding: '14px',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 8px)',
                }),
                new Rule('.ar-stripe__mount', { minHeight: '60px' }),
                new Rule('.ar-stripe__status', {
                    fontSize: '11px',
                    color: 'var(--arianna-muted, #6e6b62)',
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
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Stripe', {
        value: Stripe, writable: false, enumerable: false, configurable: false,
    });
}

export default Stripe;
