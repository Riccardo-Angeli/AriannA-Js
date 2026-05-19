/**
 * @module    components/payments/ApplePay
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Apple Pay button + sheet integration. Wraps the W3C `PaymentRequest` API
 * (cross-browser Apple Pay method `https://apple.com/apple-pay`) and falls
 * back to native `ApplePaySession` on Safari when available.
 *
 * The button follows Apple's Human Interface Guidelines (rounded, black with
 * white wordmark). The widget hides itself when the device cannot pay,
 * unless `force-show` is set.
 *
 * REQUIREMENTS for live Apple Pay:
 *   • HTTPS
 *   • Domain associated with `merchant-id` in the Apple Developer portal
 *   • `apple-developer-merchantid-domain-association` file at well-known URL
 *
 * The widget does NOT perform any backend handshake — once the user approves
 * the sheet, the token is forwarded via `arianna:payment-success` for the
 * merchant's own server to forward to its PSP.
 *
 * @example HTML
 *   <arianna-apple-pay merchant-id="merchant.com.example" country-code="IT"
 *                      currency="EUR" amount="99.00"
 *                      label="AriannA Pro license"></arianna-apple-pay>
 *
 * Events:
 *   arianna:payment-success  detail: { method: 'applePay', token: unknown }
 *   arianna:payment-error    detail: { method: 'applePay', message: string }
 *   arianna:payment-cancel   detail: { method: 'applePay' }
 *
 * Attrs: merchant-id, country-code, currency, amount, label,
 *        supported-networks (CSV), merchant-capabilities (CSV),
 *        force-show, button-style, button-type
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export type ApplePayNetwork =
    | 'visa' | 'masterCard' | 'amex' | 'discover' | 'maestro'
    | 'jcb'  | 'cartesBancaires' | 'unionPay' | 'mada' | 'electron';

export type ApplePayMerchantCapability =
    'supports3DS' | 'supportsCredit' | 'supportsDebit' | 'supportsEMV';

export type ApplePayButtonStyle = 'black' | 'white' | 'white-outline';
export type ApplePayButtonType  =
    'plain' | 'buy' | 'donate' | 'check-out' | 'subscribe' | 'reload';

export interface ApplePayOptions {
    merchantId           : string;
    countryCode          : string;
    currency             : string;
    amount               : number;
    label?               : string;
    supportedNetworks?   : ApplePayNetwork[];
    merchantCapabilities?: ApplePayMerchantCapability[];
    forceShow?           : boolean;
    buttonStyle?         : ApplePayButtonStyle;
    buttonType?          : ApplePayButtonType;
}

const APPLE_LOGO_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M16.365 12.5c.02-2.21 1.81-3.27 1.89-3.32-1.03-1.5-2.63-1.71-3.2-1.73-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.18-1.54 2.66-.39 6.6 1.11 8.76.74 1.06 1.61 2.25 2.74 2.21 1.1-.04 1.52-.71 2.85-.71 1.34 0 1.71.71 2.88.69 1.19-.02 1.94-1.07 2.67-2.14.84-1.23 1.18-2.42 1.2-2.48-.03-.01-2.3-.88-2.32-3.5z"/><path fill="currentColor" d="M14.32 6.32c.61-.74 1.02-1.76.91-2.78-.88.04-1.94.59-2.57 1.33-.56.65-1.06 1.7-.93 2.7.98.08 1.98-.5 2.59-1.25z"/></svg>`;

export class ApplePay extends Component('arianna-apple-pay', HTMLElement, {}, {
    attrs : [
        'merchant-id', 'country-code', 'currency', 'amount', 'label',
        'supported-networks', 'merchant-capabilities',
        'force-show', 'button-style', 'button-type',
    ],
})
{
    available$: Signal<boolean> = signal<boolean>(false);
    busy$     : Signal<boolean> = signal<boolean>(false);

    build(_opts: ApplePayOptions = {} as ApplePayOptions)
    {
        const styleAttr = this.attrSignal('button-style');
        const typeAttr  = this.attrSignal('button-type');

        this.btnCls = () => {
            const style = styleAttr.get() ?? 'black';
            const kind  = typeAttr.get()  ?? 'plain';
            return `ar-applepay__btn ar-applepay__btn--${style} ar-applepay__btn--${kind}`
                + (this.busy$.get() ? ' ar-applepay__btn--busy' : '');
        };

        this.btnLabel = () => {
            const kind = typeAttr.get() ?? 'plain';
            switch (kind) {
                case 'buy':       return 'Buy with';
                case 'donate':    return 'Donate with';
                case 'check-out': return 'Check out with';
                case 'subscribe': return 'Subscribe with';
                case 'reload':    return 'Reload with';
                default:          return 'Pay with';
            }
        };

        this.visible = () => this.available$.get() || this.hasAttribute('force-show');

        this.onClick = () => { void this.pay(); };

        this.template = html`
            <button type="button"
                    :class="this.btnCls()"
                    a-if="this.visible()"
                    @click="this.onClick">
                <span class="ar-applepay__logo">${APPLE_LOGO_SVG}</span>
                <span class="ar-applepay__label">{{ this.btnLabel() }} Pay</span>
            </button>
            <div class="ar-applepay__fallback" a-if="!this.visible()">
                Apple Pay isn't available on this device.
            </div>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = ApplePay.DefaultSheet();
    }

    /** Programmatically open the Apple Pay sheet. */
    async pay(): Promise<void> {
        if (this.busy$.get()) return;
        this.busy$.set(true);
        try {
            const merchantId  = this.getAttribute('merchant-id') ?? '';
            const countryCode = this.getAttribute('country-code') ?? 'US';
            const currency    = this.getAttribute('currency')     ?? 'USD';
            const amount      = parseFloat(this.getAttribute('amount') ?? '0') || 0;
            const label       = this.getAttribute('label') ?? 'Total';
            const networks    = (this.getAttribute('supported-networks') ?? 'visa,masterCard,amex').split(',').map(s => s.trim()).filter(Boolean);
            const caps        = (this.getAttribute('merchant-capabilities') ?? 'supports3DS').split(',').map(s => s.trim()).filter(Boolean);

            const PR = (window as unknown as { PaymentRequest?: typeof PaymentRequest }).PaymentRequest;
            if (typeof PR !== 'function') throw new Error('PaymentRequest API not available');

            const methodData: PaymentMethodData[] = [{
                supportedMethods: 'https://apple.com/apple-pay',
                data: {
                    version: 3,
                    merchantIdentifier   : merchantId,
                    merchantCapabilities : caps,
                    supportedNetworks    : networks,
                    countryCode,
                },
            }];
            const details: PaymentDetailsInit = {
                total: { label, amount: { currency, value: amount.toFixed(2) } },
            };
            const req = new PR(methodData, details);
            const resp = await req.show();
            await resp.complete('success');
            this.dispatchEvent(new CustomEvent('arianna:payment-success', {
                bubbles: true, detail: { method: 'applePay', token: resp.details },
            }));
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                this.dispatchEvent(new CustomEvent('arianna:payment-cancel', {
                    bubbles: true, detail: { method: 'applePay' },
                }));
            } else {
                this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                    bubbles: true,
                    detail: { method: 'applePay', message: err instanceof Error ? err.message : String(err) },
                }));
            }
        } finally {
            this.busy$.set(false);
        }
    }

    /** True if PaymentRequest or ApplePaySession is available on this device. */
    static async isAvailable(): Promise<boolean> {
        if (typeof window === 'undefined') return false;
        const w = window as unknown as { ApplePaySession?: { canMakePayments(): boolean } };
        if (w.ApplePaySession?.canMakePayments) return w.ApplePaySession.canMakePayments();
        if (typeof (window as unknown as { PaymentRequest?: unknown }).PaymentRequest !== 'undefined') return true;
        return false;
    }

    onCreated()       {}
    onBeforeMount()   {}
    async onMount()   {
        this.available$.set(await ApplePay.isAvailable());
    }
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    private btnCls  : () => string  = () => 'ar-applepay__btn ar-applepay__btn--black ar-applepay__btn--plain';
    private btnLabel: () => string  = () => 'Pay with';
    private visible : () => boolean = () => false;
    private onClick : (e: Event) => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', { display: 'inline-block' }),
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
                    border: '1px solid #d8d8d8',
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
                    color: 'var(--arianna-muted, #6e6b62)',
                    padding: '8px',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'ApplePay', {
        value: ApplePay, writable: false, enumerable: false, configurable: false,
    });
}

export default ApplePay;
