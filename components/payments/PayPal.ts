/**
 * @module    components/payments/PayPal
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * PayPal Smart Button widget. Loads PayPal's Smart Buttons SDK
 * (https://www.paypal.com/sdk/js?client-id=…) on demand and mounts the
 * official button into this widget's content area.
 *
 * REQUIREMENTS for live PayPal:
 *   • A PayPal business account
 *   • A client-id from the PayPal Developer dashboard
 *
 * When the SDK isn't available (network blocked, etc), the widget renders
 * a fallback "Open PayPal" button that follows `redirect-url` if provided.
 *
 * @example HTML
 *   <arianna-paypal client-id="AYxxx" amount="99.00" currency="EUR"></arianna-paypal>
 *
 * Events:
 *   arianna:payment-success  detail: { method: 'paypal', orderId: string, payerId: string }
 *   arianna:payment-error    detail: { method: 'paypal', message: string }
 *   arianna:payment-cancel   detail: { method: 'paypal' }
 *
 * Attrs: client-id, amount, currency, intent, redirect-url, button-style, button-color, button-shape
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface PayPalOptions {
    clientId      : string;
    amount        : number;
    currency      : string;
    intent?       : 'capture' | 'authorize';
    redirectUrl?  : string;
    buttonStyle?  : 'paypal' | 'checkout' | 'pay';
    buttonColor?  : 'gold' | 'blue' | 'silver' | 'white' | 'black';
    buttonShape?  : 'rect' | 'pill';
}

const SDK_BASE = 'https://www.paypal.com/sdk/js';
let sdkLoadPromise: Promise<unknown> | null = null;

function loadPayPalSDK(clientId: string, currency: string, intent: string): Promise<unknown> {
    if (sdkLoadPromise) return sdkLoadPromise;
    const url = `${SDK_BASE}?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=${encodeURIComponent(intent)}`;
    sdkLoadPromise = new Promise((resolve, reject) => {
        const w = window as unknown as { paypal?: unknown };
        if (w.paypal) { resolve(w.paypal); return; }
        const s = document.createElement('script');
        s.src = url;
        s.async = true;
        s.onload = () => resolve((window as unknown as { paypal?: unknown }).paypal);
        s.onerror = () => reject(new Error('PayPal SDK failed to load'));
        document.head.appendChild(s);
    });
    return sdkLoadPromise;
}

export class PayPal extends Component('arianna-paypal', HTMLElement, {}, {
    attrs : ['client-id', 'amount', 'currency', 'intent', 'redirect-url', 'button-style', 'button-color', 'button-shape'],
    shadow: false,
})
{
    sdkLoaded$: Signal<boolean> = signal<boolean>(false);
    sdkError$ : Signal<string | null> = signal<string | null>(null);
    busy$     : Signal<boolean> = signal<boolean>(false);

    build(_opts: PayPalOptions = {} as PayPalOptions)
    {
        this.fallbackVisible = () => !this.sdkLoaded$.get();
        this.fallbackLabel = () => this.sdkError$.get()
            ? 'Open PayPal'
            : 'Loading PayPal…';

        this.onFallback = () => {
            const url = this.getAttribute('redirect-url');
            if (url) window.open(url, '_blank', 'noopener');
            else void this.pay();
        };

        this.template = html`
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

        this.Sheet = PayPal.DefaultSheet();
    }

    async pay(): Promise<void> {
        if (this.busy$.get()) return;
        this.busy$.set(true);
        try {
            const url = this.getAttribute('redirect-url');
            if (url) {
                window.open(url, '_blank', 'noopener');
                // We don't know the outcome — leave it to the merchant's webhook
                return;
            }
            throw new Error('No PayPal SDK loaded and no redirect-url provided');
        } catch (err) {
            this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                bubbles: true,
                detail: { method: 'paypal', message: err instanceof Error ? err.message : String(err) },
            }));
        } finally {
            this.busy$.set(false);
        }
    }

    async #mountSDKButtons(): Promise<void> {
        const clientId = this.getAttribute('client-id');
        if (!clientId) return;
        const currency = this.getAttribute('currency') ?? 'EUR';
        const intent   = (this.getAttribute('intent') ?? 'capture') as 'capture' | 'authorize';
        const amount   = parseFloat(this.getAttribute('amount') ?? '0') || 0;
        const style    = this.getAttribute('button-style') ?? 'paypal';
        const color    = this.getAttribute('button-color') ?? 'gold';
        const shape    = this.getAttribute('button-shape') ?? 'rect';

        try {
            const paypal = await loadPayPalSDK(clientId, currency, intent) as {
                Buttons(cfg: unknown): { render(host: HTMLElement): Promise<void> };
            };
            const host = this.querySelector<HTMLElement>('[data-r="mount"]');
            if (!host) return;
            const buttons = paypal.Buttons({
                style: { layout: 'vertical', color, shape, label: style },
                createOrder: (_data: unknown, actions: { order: { create(o: unknown): unknown } }) =>
                    actions.order.create({
                        intent: intent.toUpperCase(),
                        purchase_units: [{ amount: { currency_code: currency, value: amount.toFixed(2) } }],
                    }),
                onApprove: async (data: { orderID: string; payerID?: string }, actions: { order: { capture(): Promise<unknown> } }) => {
                    try {
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
                    } catch (err) {
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
            this.sdkLoaded$.set(true);
        } catch (err) {
            this.sdkError$.set(err instanceof Error ? err.message : String(err));
        }
    }

    onCreated()       {}
    onBeforeMount()   {}
    async onMount() {
        await this.#mountSDKButtons();
    }
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    private fallbackVisible: () => boolean = () => true;
    private fallbackLabel  : () => string = () => 'Loading PayPal…';
    private onFallback     : (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', { display: 'inline-block', minWidth: '200px' }),
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
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'PayPal', {
        value: PayPal, writable: false, enumerable: false, configurable: false,
    });
}

export default PayPal;
