/**
 * @module    components/payments/GooglePay
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Google Pay button + sheet integration. Uses Google's official Pay JS API
 * (`https://pay.google.com/gp/p/js/pay.js`) when available; otherwise falls
 * back to the cross-browser W3C `PaymentRequest` with the Google Pay
 * payment method (`https://google.com/pay`).
 *
 * REQUIREMENTS for live Google Pay:
 *   • HTTPS
 *   • Google Pay business account + merchant identifier
 *   • Gateway integration (Stripe / Adyen / Braintree / etc.) configured
 *     in the Google Pay & Wallet Console
 *
 * @example HTML
 *   <arianna-google-pay merchant-id="01234567" merchant-name="My Shop"
 *                       country-code="IT" currency="EUR" amount="99.00"
 *                       gateway="stripe" gateway-merchant-id="acct_1"></arianna-google-pay>
 *
 * Events:
 *   arianna:payment-success  detail: { method: 'googlePay', token: unknown }
 *   arianna:payment-error    detail: { method: 'googlePay', message: string }
 *   arianna:payment-cancel   detail: { method: 'googlePay' }
 *
 * Attrs: merchant-id, merchant-name, country-code, currency, amount,
 *        gateway, gateway-merchant-id, environment, button-color, button-type
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export type GooglePayEnvironment = 'TEST' | 'PRODUCTION';
export type GooglePayButtonColor = 'default' | 'black' | 'white';
export type GooglePayButtonType  =
    'buy' | 'book' | 'checkout' | 'donate' | 'order' | 'pay' | 'plain' | 'subscribe';

export interface GooglePayOptions {
    merchantId        : string;
    merchantName      : string;
    countryCode       : string;
    currency          : string;
    amount            : number;
    gateway           : string;
    gatewayMerchantId : string;
    environment?      : GooglePayEnvironment;
    buttonColor?      : GooglePayButtonColor;
    buttonType?       : GooglePayButtonType;
    supportedNetworks?: string[];
    supportedAuthMethods?: Array<'PAN_ONLY' | 'CRYPTOGRAM_3DS'>;
}

const GPAY_LOGO = `<svg viewBox="0 0 40 16" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><path d="M18.93 1.79v3.4h2.1c.5 0 .92-.17 1.25-.51.34-.34.51-.74.51-1.19 0-.45-.17-.84-.51-1.18-.33-.34-.74-.52-1.25-.52h-2.1zm0 4.51v3.94H17.8V.68h3.21c.81 0 1.5.27 2.07.82.59.55.88 1.21.88 2 0 .8-.29 1.47-.88 2.01-.57.54-1.26.79-2.07.79h-2.08zM27.4 8.07c0 .43.18.79.55 1.08.37.29.8.43 1.29.43.7 0 1.31-.26 1.85-.78.54-.51.81-1.12.81-1.82-.4-.32-.97-.48-1.7-.48-.53 0-.97.13-1.32.38-.36.26-.54.6-.54.99zm1.46-4.41c1.04 0 1.86.28 2.46.83.6.55.9 1.31.9 2.27v4.58h-1.07V10.5h-.05c-.46.69-1.08 1.04-1.86 1.04-.66 0-1.21-.2-1.65-.6-.45-.4-.67-.89-.67-1.49 0-.63.24-1.13.71-1.5.48-.37 1.11-.56 1.91-.56.68 0 1.24.13 1.68.39v-.27c0-.49-.19-.91-.58-1.25-.39-.34-.84-.51-1.36-.51-.78 0-1.4.33-1.85.99l-.99-.62c.68-.97 1.68-1.46 3.02-1.46zM39 3.94l-4.43 10.18h-1.18l1.65-3.56-2.92-6.62h1.23l2.11 5.09h.02l2.05-5.09z"/><path d="M14.32 6.16c0-.34-.03-.67-.08-.99H7.32v1.88h3.93c-.16.91-.66 1.69-1.42 2.21v1.82h2.3c1.34-1.24 2.12-3.07 2.12-5.24z"/><path d="M7.32 13.32c1.92 0 3.54-.63 4.71-1.71l-2.3-1.82c-.64.43-1.46.68-2.41.68-1.85 0-3.42-1.25-3.98-2.93h-2.37v1.88c1.18 2.35 3.59 3.9 6.35 3.9z" fill="#34a853"/><path d="M3.34 7.54c-.14-.43-.22-.88-.22-1.35 0-.47.08-.92.22-1.35V2.96H.97C.46 3.96.18 5.07.18 6.19s.28 2.23.79 3.23z" fill="#fabb05"/><path d="M7.32 1.91c1.05 0 1.99.36 2.73 1.06l2.03-2.03C10.85.46 9.25-.16 7.32-.16 4.56-.16 2.15 1.39.97 3.74L3.34 5.62c.56-1.68 2.13-2.93 3.98-2.93z" fill="#e94235"/></g></svg>`;

export class GooglePay extends Component('arianna-google-pay', HTMLElement, {}, {
    attrs : [
        'merchant-id', 'merchant-name', 'country-code', 'currency', 'amount',
        'gateway', 'gateway-merchant-id', 'environment',
        'button-color', 'button-type', 'supported-networks', 'supported-auth-methods',
    ],
    shadow: false,
})
{
    available$: Signal<boolean> = signal<boolean>(false);
    busy$     : Signal<boolean> = signal<boolean>(false);

    build(_opts: GooglePayOptions = {} as GooglePayOptions)
    {
        const colorAttr = this.attrSignal('button-color');
        const typeAttr  = this.attrSignal('button-type');

        this.btnCls = () => {
            const color = colorAttr.get() ?? 'default';
            const kind  = typeAttr.get()  ?? 'pay';
            return `ar-gpay__btn ar-gpay__btn--${color} ar-gpay__btn--${kind}`
                + (this.busy$.get() ? ' ar-gpay__btn--busy' : '');
        };
        this.btnLabel = () => {
            const kind = typeAttr.get() ?? 'pay';
            switch (kind) {
                case 'buy':       return 'Buy with';
                case 'book':      return 'Book with';
                case 'checkout':  return 'Checkout with';
                case 'donate':    return 'Donate with';
                case 'order':     return 'Order with';
                case 'subscribe': return 'Subscribe with';
                case 'plain':     return '';
                default:          return 'Pay with';
            }
        };

        this.onClick = () => { void this.pay(); };

        this.template = html`
            <button type="button"
                    :class="this.btnCls()"
                    a-if="this.available$.get()"
                    @click="this.onClick">
                <span class="ar-gpay__label">{{ this.btnLabel() }}</span>
                <span class="ar-gpay__logo">${GPAY_LOGO}</span>
            </button>
            <div class="ar-gpay__fallback" a-if="!this.available$.get()">
                Google Pay isn't available on this device.
            </div>
        `;

        this.Sheet = GooglePay.DefaultSheet();
    }

    async pay(): Promise<void> {
        if (this.busy$.get()) return;
        this.busy$.set(true);
        try {
            const merchantId        = this.getAttribute('merchant-id')         ?? '';
            const merchantName      = this.getAttribute('merchant-name')       ?? '';
            const countryCode       = this.getAttribute('country-code')        ?? 'US';
            const currency          = this.getAttribute('currency')            ?? 'USD';
            const amount            = parseFloat(this.getAttribute('amount') ?? '0') || 0;
            const gateway           = this.getAttribute('gateway')             ?? '';
            const gatewayMerchantId = this.getAttribute('gateway-merchant-id') ?? '';
            const environment       = (this.getAttribute('environment') ?? 'TEST') as GooglePayEnvironment;
            const networks          = (this.getAttribute('supported-networks') ?? 'VISA,MASTERCARD,AMEX')
                                        .split(',').map(s => s.trim()).filter(Boolean);
            const authMethods       = (this.getAttribute('supported-auth-methods') ?? 'PAN_ONLY,CRYPTOGRAM_3DS')
                                        .split(',').map(s => s.trim()).filter(Boolean);

            const w = window as unknown as { google?: { payments?: { api?: { PaymentsClient: new (cfg: { environment: string }) => unknown } } } };
            if (w.google?.payments?.api?.PaymentsClient) {
                const client = new w.google.payments.api.PaymentsClient({ environment }) as {
                    loadPaymentData(req: unknown): Promise<unknown>;
                };
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
                const data = await client.loadPaymentData(paymentDataRequest);
                this.dispatchEvent(new CustomEvent('arianna:payment-success', {
                    bubbles: true, detail: { method: 'googlePay', token: data },
                }));
            } else {
                // PaymentRequest fallback
                const PR = (window as unknown as { PaymentRequest?: typeof PaymentRequest }).PaymentRequest;
                if (typeof PR !== 'function') throw new Error('Google Pay API and PaymentRequest both unavailable');
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
                const details: PaymentDetailsInit = {
                    total: { label: merchantName || 'Total', amount: { currency, value: amount.toFixed(2) } },
                };
                const req = new PR(methodData, details);
                const resp = await req.show();
                await resp.complete('success');
                this.dispatchEvent(new CustomEvent('arianna:payment-success', {
                    bubbles: true, detail: { method: 'googlePay', token: resp.details },
                }));
            }
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                this.dispatchEvent(new CustomEvent('arianna:payment-cancel', {
                    bubbles: true, detail: { method: 'googlePay' },
                }));
            } else {
                this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                    bubbles: true,
                    detail: { method: 'googlePay', message: err instanceof Error ? err.message : String(err) },
                }));
            }
        } finally {
            this.busy$.set(false);
        }
    }

    static async isAvailable(): Promise<boolean> {
        if (typeof window === 'undefined') return false;
        const w = window as unknown as { google?: { payments?: { api?: unknown } }; PaymentRequest?: unknown };
        if (w.google?.payments?.api) return true;
        if (typeof w.PaymentRequest !== 'undefined') return true;
        return false;
    }

    onCreated()       {}
    onBeforeMount()   {}
    async onMount()   {
        this.available$.set(await GooglePay.isAvailable());
    }
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    private btnCls  : () => string  = () => 'ar-gpay__btn ar-gpay__btn--default ar-gpay__btn--pay';
    private btnLabel: () => string  = () => 'Pay with';
    private onClick : (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', { display: 'inline-block' }),
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
                    border: '1px solid #d8d8d8',
                }),
                new Rule('.ar-gpay__logo', { display: 'inline-flex', height: '18px' }),
                new Rule('.ar-gpay__logo svg', { height: '100%' }),
                new Rule('.ar-gpay__fallback', {
                    fontSize: '12px',
                    color: 'var(--arianna-muted, #6e6b62)',
                    padding: '8px',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'GooglePay', {
        value: GooglePay, writable: false, enumerable: false, configurable: false,
    });
}

export default GooglePay;
