/**
 * @module    components/payments/AliPay
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA AliPay component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   AliPay
 *  @public
 *  @description Namespace containing AliPay contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace AliPay
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
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

        /** @name        AliPayMode
         *  @public
         *  @type        {'redirect' | 'qr-code'}
         *  @description Type alias for AliPayMode.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type AliPayMode = 'redirect' | 'qr-code';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   AliPayOptions
         *  @public
         *  @description AliPayOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface AliPayOptions
        {
            /** @name        mode
             *  @public
             *  @type        {AliPay.Types.AliPayMode}
             *  @description Component member for mode.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            mode?: Types.AliPayMode;

            /** @name        redirectUrl
             *  @public
             *  @type        {string}
             *  @description Component member for redirect Url.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            redirectUrl?: string;

            /** @name        qrUrl
             *  @public
             *  @type        {string}
             *  @description Component member for qr Url.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            qrUrl?: string;

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

            /** @name        target
             *  @public
             *  @type        {'_blank' | '_self'}
             *  @description Component member for target.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            target?: '_blank' | '_self';
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

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @name        ALIPAY_LOGO
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned ALIPAY_LOGO value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const ALIPAY_LOGO = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#00a0e9"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-family="-apple-system, sans-serif" font-weight="700" font-size="11">支</text></svg>`;

    /** @class       AliPay
     *  @public
     *  @description AriannA AliPay component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-alipay', {}, {
        Attributes: ['mode', 'redirect-url', 'qr-url', 'amount', 'currency', 'target'],
    })
    export class AliPay extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {AliPay.Interfaces.AliPayOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.AliPayOptions = {} as Interfaces.AliPayOptions)
        {
            /** @name        modeAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned modeAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const modeAttr = this.signal().attribute('mode');

            /** @name        amountAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned amountAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const amountAttr = this.signal().attribute('amount');

            /** @name        currencyAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned currencyAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const currencyAttr = this.signal().attribute('currency');

            /** @name        qrUrlAttr
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned qrUrlAttr value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const qrUrlAttr = this.signal().attribute('qr-url');
            this.isQrMode = () => modeAttr.Get() === 'qr-code';
            this.btnLabel = () => {
                /** @name        a
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned a value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const a = parseFloat(amountAttr.Get() ?? '0') || 0;

                /** @name        c
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned c value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const c = currencyAttr.Get() ?? 'CNY';
                return `Pay ${c} ${a.toFixed(2)} with Alipay`;
            };
            this.qrImgSrc = () => {
                /** @name        url
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned url value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const url = qrUrlAttr.Get() ?? '';
                // Use Google Chart API to render QR if URL doesn't point to an image
                if (/\.(png|jpe?g|gif|svg)(\?|$)/i.test(url))
                    return url;
                return url
                    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`
                    : '';
            };
            this.onClick = () => { void this.pay(); };
            this.template = html `
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
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {AliPay.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = AliPay.DefaultSheet();
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
            /** @name        url
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned url value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const url = this.getAttribute('redirect-url');
            if (!url)
            {
                this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                    bubbles: true, detail: { method: 'alipay', message: 'Missing redirect-url' },
                }));
                return;
            }
            this.dispatchEvent(new CustomEvent('arianna:payment-redirect', {
                bubbles: true, detail: { method: 'alipay', url },
            }));

            /** @name        target
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned target value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const target = (this.getAttribute('target') ?? '_self') as '_blank' | '_self';
            if (target === '_self')
                window.location.href = url;
            else
                window.open(url, '_blank', 'noopener');
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

        /** @name        isQrMode
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Qr Mode.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isQrMode: () => boolean = () => false;

        /** @name        btnLabel
         *  @private
         *  @type        {() => string}
         *  @description Component member for btn Label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private btnLabel: () => string = () => 'Pay with Alipay';

        /** @name        qrImgSrc
         *  @private
         *  @type        {() => string}
         *  @description Component member for qr Img Src.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private qrImgSrc: () => string = () => '';

        /** @name        onClick
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onClick: (e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {AliPay.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {AliPay.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', { display: 'inline-block' }),
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
            ]);
        }
    }
}
export default AliPay;
