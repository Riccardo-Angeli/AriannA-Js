/**
 * @module    components/payments/AliPay
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Alipay payment widget. Supports two operating modes:
 *
 *   • `redirect` — opens the Alipay payment page (default for web flows)
 *   • `qr-code` — displays a QR code that the user scans with the Alipay app
 *
 * Either mode requires the merchant server to call Alipay's OpenAPI first
 * to obtain the redirect URL or QR code URL. Confirmation arrives via
 * Alipay webhook server-side.
 *
 * @example HTML
 *   <arianna-alipay mode="redirect"
 *                   redirect-url="https://openapi.alipay.com/gateway.do?…"
 *                   amount="100.00" currency="CNY"></arianna-alipay>
 *
 * @example QR code
 *   <arianna-alipay mode="qr-code"
 *                   qr-url="https://qr.alipay.com/xxx"
 *                   amount="100.00" currency="CNY"></arianna-alipay>
 *
 * Events:
 *   arianna:payment-redirect  detail: { method: 'alipay', url: string }
 *   arianna:payment-error     detail: { method: 'alipay', message: string }
 *
 * Attrs: mode, redirect-url, qr-url, amount, currency, target
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export type AliPayMode = 'redirect' | 'qr-code';

export interface AliPayOptions {
    mode?       : AliPayMode;
    redirectUrl?: string;
    qrUrl?      : string;
    amount      : number;
    currency    : string;
    target?     : '_blank' | '_self';
}

const ALIPAY_LOGO = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#00a0e9"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-family="-apple-system, sans-serif" font-weight="700" font-size="11">支</text></svg>`;

export class AliPay extends Component('arianna-alipay', HTMLElement, {}, {
    attrs : ['mode', 'redirect-url', 'qr-url', 'amount', 'currency', 'target'],
    shadow: false,
})
{
    build(_opts: AliPayOptions = {} as AliPayOptions)
    {
        const modeAttr = this.attrSignal('mode');
        const amountAttr = this.attrSignal('amount');
        const currencyAttr = this.attrSignal('currency');
        const qrUrlAttr = this.attrSignal('qr-url');

        this.isQrMode = () => modeAttr.get() === 'qr-code';

        this.btnLabel = () => {
            const a = parseFloat(amountAttr.get() ?? '0') || 0;
            const c = currencyAttr.get() ?? 'CNY';
            return `Pay ${c} ${a.toFixed(2)} with Alipay`;
        };

        this.qrImgSrc = () => {
            const url = qrUrlAttr.get() ?? '';
            // Use Google Chart API to render QR if URL doesn't point to an image
            if (/\.(png|jpe?g|gif|svg)(\?|$)/i.test(url)) return url;
            return url
                ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`
                : '';
        };

        this.onClick = () => { void this.pay(); };

        this.template = html`
            <div class="ar-alipay" a-if="!this.isQrMode()">
                <button type="button" class="ar-alipay__btn" @click="this.onClick">
                    <span class="ar-alipay__logo">${ALIPAY_LOGO}</span>
                    <span>{{ this.btnLabel() }}</span>
                </button>
            </div>
            <div class="ar-alipay ar-alipay--qr" a-if="this.isQrMode()">
                <img class="ar-alipay__qr" :src="this.qrImgSrc()" alt="Alipay QR code"/>
                <div class="ar-alipay__qr-hint">
                    Scan with the Alipay app to pay
                </div>
                <div class="ar-alipay__qr-amount">{{ this.btnLabel() }}</div>
            </div>
        `;

        this.Sheet = AliPay.DefaultSheet();
    }

    async pay(): Promise<void> {
        const url = this.getAttribute('redirect-url');
        if (!url) {
            this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                bubbles: true, detail: { method: 'alipay', message: 'Missing redirect-url' },
            }));
            return;
        }
        this.dispatchEvent(new CustomEvent('arianna:payment-redirect', {
            bubbles: true, detail: { method: 'alipay', url },
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

    private isQrMode: () => boolean = () => false;
    private btnLabel: () => string = () => 'Pay with Alipay';
    private qrImgSrc: () => string = () => '';
    private onClick : (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', { display: 'inline-block' }),
                new Rule('.ar-alipay__btn', {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    minWidth: '200px',
                    minHeight: '44px',
                    padding: '0 18px',
                    background: '#00a0e9',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    font: '600 14px -apple-system, system-ui, sans-serif',
                    transition: 'background 0.15s',
                }),
                new Rule('.ar-alipay__btn:hover', { background: '#0090d4' }),
                new Rule('.ar-alipay__logo', {
                    display: 'inline-flex',
                    width: '22px', height: '22px',
                }),
                new Rule('.ar-alipay__logo svg', { width: '100%', height: '100%' }),
                new Rule('.ar-alipay--qr', {
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 8px)',
                }),
                new Rule('.ar-alipay__qr', {
                    width: '180px', height: '180px',
                    display: 'block',
                }),
                new Rule('.ar-alipay__qr-hint', {
                    fontSize: '11px',
                    color: 'var(--arianna-muted, #6e6b62)',
                }),
                new Rule('.ar-alipay__qr-amount', {
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--arianna-text, #1f2328)',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'AliPay', {
        value: AliPay, writable: false, enumerable: false, configurable: false,
    });
}

export default AliPay;
