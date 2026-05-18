/**
 * @module    components/payments/Satispay
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Satispay redirect button. Satispay does NOT expose a browser SDK — the
 * merchant's server creates a payment via the Satispay Business API, gets
 * back a `redirect_url`, and the widget opens that URL in a new tab or
 * in-place. On return the merchant's server confirms outcome via webhook.
 *
 * The widget renders a branded button. Confirmation of payment is NEVER
 * obtained client-side — `arianna:payment-success` is not emitted by this
 * widget; merchants subscribe to Satispay webhooks server-side.
 *
 * @example HTML
 *   <arianna-satispay redirect-url="https://online.satispay.com/pay/xxx"
 *                     amount="9.90" currency="EUR"></arianna-satispay>
 *
 * Events:
 *   arianna:payment-redirect  detail: { method: 'satispay', url: string }
 *   arianna:payment-error     detail: { method: 'satispay', message: string }
 *
 * Attrs: redirect-url, amount, currency, target (_blank | _self)
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface SatispayOptions {
    redirectUrl : string;
    amount      : number;
    currency    : string;
    target?     : '_blank' | '_self';
}

const SATISPAY_LOGO = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11" fill="#ff3a44"/><circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>`;

export class Satispay extends Component('arianna-satispay', HTMLElement, {}, {
    attrs : ['redirect-url', 'amount', 'currency', 'target'],
    shadow: false,
})
{
    build(_opts: SatispayOptions = {} as SatispayOptions)
    {
        const amountAttr = this.attrSignal('amount');
        const currencyAttr = this.attrSignal('currency');

        this.btnLabel = () => {
            const a = parseFloat(amountAttr.get() ?? '0') || 0;
            const c = currencyAttr.get() ?? 'EUR';
            return `Pay ${c} ${a.toFixed(2)} with Satispay`;
        };

        this.onClick = () => { void this.pay(); };

        this.template = html`
            <button type="button" class="ar-satispay__btn" @click="this.onClick">
                <span class="ar-satispay__logo">${SATISPAY_LOGO}</span>
                <span>{{ this.btnLabel() }}</span>
            </button>
        `;

        this.Sheet = Satispay.DefaultSheet();
    }

    async pay(): Promise<void> {
        const url = this.getAttribute('redirect-url');
        if (!url) {
            this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                bubbles: true, detail: { method: 'satispay', message: 'Missing redirect-url' },
            }));
            return;
        }
        this.dispatchEvent(new CustomEvent('arianna:payment-redirect', {
            bubbles: true, detail: { method: 'satispay', url },
        }));
        const target = (this.getAttribute('target') ?? '_blank') as '_blank' | '_self';
        if (target === '_self') window.location.href = url;
        else window.open(url, '_blank', 'noopener');
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    private btnLabel: () => string = () => 'Pay with Satispay';
    private onClick : (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', { display: 'inline-block' }),
                new Rule('.ar-satispay__btn', {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    minWidth: '200px',
                    minHeight: '44px',
                    padding: '0 18px',
                    background: '#ff3a44',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    font: '600 14px -apple-system, system-ui, sans-serif',
                    transition: 'background 0.15s',
                }),
                new Rule('.ar-satispay__btn:hover', { background: '#e0333c' }),
                new Rule('.ar-satispay__logo', {
                    display: 'inline-flex',
                    width: '22px', height: '22px',
                }),
                new Rule('.ar-satispay__logo svg', { width: '100%', height: '100%' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Satispay', {
        value: Satispay, writable: false, enumerable: false, configurable: false,
    });
}

export default Satispay;
