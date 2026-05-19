/**
 * @module    components/payments/Nexi
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Nexi (XPay) redirect button. Italian market leader for online card
 * payments. Merchant server creates a transaction via Nexi's XPay API,
 * receives a `redirect_url`, and the widget redirects the user there.
 * Confirmation is delivered via Nexi webhook (server-side).
 *
 * @example HTML
 *   <arianna-nexi redirect-url="https://ecommerce.nexi.it/ecomm/JResp.do?…"
 *                 amount="49.90" currency="EUR"></arianna-nexi>
 *
 * Events:
 *   arianna:payment-redirect  detail: { method: 'nexi', url: string }
 *   arianna:payment-error     detail: { method: 'nexi', message: string }
 *
 * Attrs: redirect-url, amount, currency, target
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface NexiOptions {
    redirectUrl : string;
    amount      : number;
    currency    : string;
    target?     : '_blank' | '_self';
}

export class Nexi extends Component('arianna-nexi', HTMLElement, {}, {
    attrs : ['redirect-url', 'amount', 'currency', 'target'],
})
{
    build(_opts: NexiOptions = {} as NexiOptions)
    {
        const amountAttr = this.attrSignal('amount');
        const currencyAttr = this.attrSignal('currency');

        this.btnLabel = () => {
            const a = parseFloat(amountAttr.get() ?? '0') || 0;
            const c = currencyAttr.get() ?? 'EUR';
            return `Pay ${c} ${a.toFixed(2)} with Nexi`;
        };

        this.onClick = () => { void this.pay(); };

        this.template = html`
            <button type="button" class="ar-nexi__btn" @click="this.onClick">
                <span class="ar-nexi__logo">nexi</span>
                <span>{{ this.btnLabel() }}</span>
            </button>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = Nexi.DefaultSheet();
    }

    async pay(): Promise<void> {
        const url = this.getAttribute('redirect-url');
        if (!url) {
            this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                bubbles: true, detail: { method: 'nexi', message: 'Missing redirect-url' },
            }));
            return;
        }
        this.dispatchEvent(new CustomEvent('arianna:payment-redirect', {
            bubbles: true, detail: { method: 'nexi', url },
        }));
        const target = (this.getAttribute('target') ?? '_self') as '_blank' | '_self';
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

    private btnLabel: () => string = () => 'Pay with Nexi';
    private onClick : (e: Event) => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', { display: 'inline-block' }),
                new Rule('.ar-nexi__btn', {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    minWidth: '200px',
                    minHeight: '44px',
                    padding: '0 18px',
                    background: '#0e2c5e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    font: '600 14px -apple-system, system-ui, sans-serif',
                    transition: 'background 0.15s',
                }),
                new Rule('.ar-nexi__btn:hover', { background: '#0a2148' }),
                new Rule('.ar-nexi__logo', {
                    background: '#fff',
                    color: '#0e2c5e',
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontWeight: '900',
                    fontStyle: 'italic',
                    fontSize: '13px',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Nexi', {
        value: Nexi, writable: false, enumerable: false, configurable: false,
    });
}

export default Nexi;
