/**
 * @module    components/payments/CreditCard
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Credit / debit card form with live validation (number Luhn-check, expiry,
 * CVV) and a 3D card preview that updates in real time as the user types.
 * Detects card brand (Visa / Mastercard / Amex / Discover / Maestro / Diners
 * / JCB / UnionPay / CartesBancaires / Mada) from the BIN prefix.
 *
 * SECURITY NOTE: this widget renders a form locally and emits the card data
 * on `arianna:payment-success`. For PCI-DSS compliance most apps should
 * instead embed a hosted-fields iframe from their PSP (Stripe.js Elements,
 * Adyen Web Drop-in, Braintree Hosted Fields, etc). This widget is suitable
 * for: (a) demos / mockups, (b) merchants whose PSP accepts raw cards
 * server-to-server and who have completed SAQ-D, or (c) integrations using
 * a payment vault on the merchant's own infrastructure.
 *
 * @example HTML
 *   <arianna-credit-card amount="99.00" currency="EUR" save-option></arianna-credit-card>
 *
 * Events:
 *   arianna:payment-success  detail: { method: 'card', card: CardData }
 *   arianna:payment-error    detail: { method: 'card', message: string }
 *   arianna:card-change      detail: { card: Partial<CardData>, valid: boolean }
 *
 * Attrs: amount, currency, save-option, holder-name-required
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export type CardBrand =
    | 'visa' | 'mastercard' | 'amex' | 'discover' | 'maestro'
    | 'diners' | 'jcb' | 'unionpay' | 'cartesbancaires' | 'mada' | 'unknown';

export interface CardData {
    number     : string;
    holder?    : string;
    expMonth   : number;
    expYear    : number;
    cvv        : string;
    brand      : CardBrand;
    save?      : boolean;
}

export interface CreditCardOptions {
    amount             : number;
    currency           : string;
    saveOption?        : boolean;
    holderNameRequired?: boolean;
}

interface CardFormState {
    number   : string;
    holder   : string;
    expMonth : string;
    expYear  : string;
    cvv      : string;
    save     : boolean;
    flipped  : boolean;
}

// ── Brand detection (BIN-based) ────────────────────────────────────────────

const BRAND_PATTERNS: Array<{ brand: CardBrand; re: RegExp; lengths: number[]; cvvLen: number }> = [
    { brand: 'amex',            re: /^3[47]/,             lengths: [15], cvvLen: 4 },
    { brand: 'mastercard',      re: /^(5[1-5]|2[2-7])/,   lengths: [16], cvvLen: 3 },
    { brand: 'visa',            re: /^4/,                 lengths: [13, 16, 19], cvvLen: 3 },
    { brand: 'discover',        re: /^6(?:011|5)/,        lengths: [16], cvvLen: 3 },
    { brand: 'diners',          re: /^3(?:0[0-5]|[68])/,  lengths: [14, 16, 19], cvvLen: 3 },
    { brand: 'jcb',             re: /^35/,                lengths: [16, 19], cvvLen: 3 },
    { brand: 'unionpay',        re: /^62/,                lengths: [16, 17, 18, 19], cvvLen: 3 },
    { brand: 'maestro',         re: /^(50|5[6-9]|6)/,     lengths: [12, 13, 14, 15, 16, 17, 18, 19], cvvLen: 3 },
    { brand: 'cartesbancaires', re: /^4[0-9]{5}/,         lengths: [16], cvvLen: 3 },
    { brand: 'mada',            re: /^(440533|446672)/,   lengths: [16], cvvLen: 3 },
];

function detectBrand(num: string): { brand: CardBrand; lengths: number[]; cvvLen: number } {
    const stripped = num.replace(/\D/g, '');
    for (const p of BRAND_PATTERNS) {
        if (p.re.test(stripped)) return { brand: p.brand, lengths: p.lengths, cvvLen: p.cvvLen };
    }
    return { brand: 'unknown', lengths: [13, 14, 15, 16, 17, 18, 19], cvvLen: 3 };
}

function luhnCheck(num: string): boolean {
    const s = num.replace(/\D/g, '');
    if (s.length < 12) return false;
    let sum = 0, alt = false;
    for (let i = s.length - 1; i >= 0; i--) {
        let n = parseInt(s[i]!, 10);
        if (alt) { n *= 2; if (n > 9) n -= 9; }
        sum += n;
        alt = !alt;
    }
    return sum % 10 === 0;
}

function formatCardNumber(num: string, brand: CardBrand): string {
    const s = num.replace(/\D/g, '').slice(0, 19);
    if (brand === 'amex') {
        // 4-6-5
        return s.replace(/^(\d{4})(\d{0,6})(\d{0,5}).*$/, (_m, a, b, c) =>
            [a, b, c].filter(Boolean).join(' '));
    }
    return s.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export class CreditCard extends Component('arianna-credit-card', HTMLElement, {}, {
    attrs : ['amount', 'currency', 'save-option', 'holder-name-required'],
    shadow: false,
})
{
    form$: Signal<CardFormState> = signal<CardFormState>({
        number: '', holder: '', expMonth: '', expYear: '', cvv: '',
        save: false, flipped: false,
    });

    build(_opts: CreditCardOptions = {} as CreditCardOptions)
    {
        const amountAttr = this.attrSignal('amount');
        const currencyAttr = this.attrSignal('currency');

        this.brandInfo = () => detectBrand(this.form$.get().number);
        this.brand     = (): CardBrand => this.brandInfo().brand;

        this.numberDisplay = () => {
            const f = this.form$.get();
            return formatCardNumber(f.number, this.brand());
        };
        this.cvvMaxLen = () => this.brandInfo().cvvLen;
        this.numberMaxLen = () => {
            const info = this.brandInfo();
            const maxRaw = Math.max(...info.lengths);
            // Add space chars for formatting
            return info.brand === 'amex'
                ? maxRaw + 2
                : maxRaw + Math.floor(maxRaw / 4);
        };

        this.cardPreviewCls = () => 'ar-cc__preview ar-cc__preview--' + this.brand()
            + (this.form$.get().flipped ? ' ar-cc__preview--flipped' : '');

        this.previewNumber = () => this.numberDisplay() || '•••• •••• •••• ••••';
        this.previewHolder = () => this.form$.get().holder.toUpperCase() || 'CARDHOLDER NAME';
        this.previewExp    = () => {
            const f = this.form$.get();
            return (f.expMonth || 'MM') + '/' + (f.expYear || 'YY');
        };
        this.previewBrand  = () => this.brand().toUpperCase();
        this.previewCvv    = () => this.form$.get().cvv || '•••';

        this.valid = () => {
            const f = this.form$.get();
            const info = this.brandInfo();
            const numRaw = f.number.replace(/\D/g, '');
            if (!info.lengths.includes(numRaw.length)) return false;
            if (!luhnCheck(numRaw)) return false;
            const m = parseInt(f.expMonth, 10);
            const y = parseInt(f.expYear, 10);
            if (!(m >= 1 && m <= 12)) return false;
            if (!(y >= 0 && y <= 99)) return false;
            if (f.cvv.length !== info.cvvLen) return false;
            if (this.hasAttribute('holder-name-required') && !f.holder.trim()) return false;
            return true;
        };

        this.payLabel = () => {
            const a = parseFloat(amountAttr.get() ?? '0') || 0;
            const c = currencyAttr.get() ?? 'EUR';
            return `Pay ${c} ${a.toFixed(2)}`;
        };

        // ── Handlers ────────────────────────────────────────────────────
        this.onNumber = (e: Event) => {
            const v = (e.target as HTMLInputElement).value;
            const cur = this.form$.get();
            this.form$.set({ ...cur, number: v.replace(/\D/g, '').slice(0, 19) });
            this.#fireChange();
        };
        this.onHolder = (e: Event) => {
            const cur = this.form$.get();
            this.form$.set({ ...cur, holder: (e.target as HTMLInputElement).value });
            this.#fireChange();
        };
        this.onExpMonth = (e: Event) => {
            const v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 2);
            const cur = this.form$.get();
            this.form$.set({ ...cur, expMonth: v });
            this.#fireChange();
        };
        this.onExpYear = (e: Event) => {
            const v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 2);
            const cur = this.form$.get();
            this.form$.set({ ...cur, expYear: v });
            this.#fireChange();
        };
        this.onCvv = (e: Event) => {
            const v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, this.cvvMaxLen());
            const cur = this.form$.get();
            this.form$.set({ ...cur, cvv: v });
            this.#fireChange();
        };
        this.onCvvFocus = () => {
            this.form$.set({ ...this.form$.get(), flipped: true });
        };
        this.onCvvBlur = () => {
            this.form$.set({ ...this.form$.get(), flipped: false });
        };
        this.onSave = (e: Event) => {
            this.form$.set({ ...this.form$.get(), save: (e.target as HTMLInputElement).checked });
        };
        this.onSubmit = () => { void this.pay(); };

        this.template = html`
            <div class="ar-cc">
                <div :class="this.cardPreviewCls()">
                    <div class="ar-cc__preview-face ar-cc__preview-front">
                        <div class="ar-cc__preview-brand">{{ this.previewBrand() }}</div>
                        <div class="ar-cc__preview-chip">▦</div>
                        <div class="ar-cc__preview-number">{{ this.previewNumber() }}</div>
                        <div class="ar-cc__preview-row">
                            <div>
                                <div class="ar-cc__preview-meta">HOLDER</div>
                                <div class="ar-cc__preview-holder">{{ this.previewHolder() }}</div>
                            </div>
                            <div>
                                <div class="ar-cc__preview-meta">EXP</div>
                                <div class="ar-cc__preview-exp">{{ this.previewExp() }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="ar-cc__preview-face ar-cc__preview-back">
                        <div class="ar-cc__preview-strip"></div>
                        <div class="ar-cc__preview-cvv-box">{{ this.previewCvv() }}</div>
                    </div>
                </div>
                <div class="ar-cc__form">
                    <label class="ar-cc__field">
                        <span>Card number</span>
                        <input type="text" inputmode="numeric" autocomplete="cc-number"
                               :value="this.numberDisplay()"
                               @input="this.onNumber"/>
                    </label>
                    <label class="ar-cc__field">
                        <span>Cardholder</span>
                        <input type="text" autocomplete="cc-name"
                               :value="this.form$.get().holder"
                               @input="this.onHolder"/>
                    </label>
                    <div class="ar-cc__row">
                        <label class="ar-cc__field">
                            <span>Month</span>
                            <input type="text" inputmode="numeric" autocomplete="cc-exp-month" placeholder="MM"
                                   :value="this.form$.get().expMonth"
                                   @input="this.onExpMonth"/>
                        </label>
                        <label class="ar-cc__field">
                            <span>Year</span>
                            <input type="text" inputmode="numeric" autocomplete="cc-exp-year" placeholder="YY"
                                   :value="this.form$.get().expYear"
                                   @input="this.onExpYear"/>
                        </label>
                        <label class="ar-cc__field">
                            <span>CVV</span>
                            <input type="text" inputmode="numeric" autocomplete="cc-csc"
                                   :value="this.form$.get().cvv"
                                   @input="this.onCvv"
                                   @focus="this.onCvvFocus"
                                   @blur="this.onCvvBlur"/>
                        </label>
                    </div>
                    <label class="ar-cc__save" a-if="this.hasAttribute('save-option')">
                        <input type="checkbox" :checked="this.form$.get().save" @change="this.onSave"/>
                        <span>Save this card for future payments</span>
                    </label>
                    <button type="button" class="ar-cc__pay"
                            :disabled="!this.valid()"
                            @click="this.onSubmit">{{ this.payLabel() }}</button>
                </div>
            </div>
        `;

        this.Sheet = CreditCard.DefaultSheet();
    }

    async pay(): Promise<void> {
        if (!this.valid()) {
            this.dispatchEvent(new CustomEvent('arianna:payment-error', {
                bubbles: true, detail: { method: 'card', message: 'Invalid card details' },
            }));
            return;
        }
        const f = this.form$.get();
        const card: CardData = {
            number   : f.number.replace(/\D/g, ''),
            holder   : f.holder.trim() || undefined,
            expMonth : parseInt(f.expMonth, 10),
            expYear  : 2000 + parseInt(f.expYear, 10),
            cvv      : f.cvv,
            brand    : this.brand(),
            save     : f.save,
        };
        this.dispatchEvent(new CustomEvent('arianna:payment-success', {
            bubbles: true, detail: { method: 'card', card },
        }));
    }

    getCard(): Partial<CardData> {
        const f = this.form$.get();
        return {
            number  : f.number,
            holder  : f.holder,
            expMonth: parseInt(f.expMonth, 10),
            expYear : f.expYear ? 2000 + parseInt(f.expYear, 10) : 0,
            cvv     : f.cvv,
            brand   : this.brand(),
            save    : f.save,
        };
    }

    #fireChange(): void {
        this.dispatchEvent(new CustomEvent('arianna:card-change', {
            bubbles: true, detail: { card: this.getCard(), valid: this.valid() },
        }));
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    private brandInfo     : () => { brand: CardBrand; lengths: number[]; cvvLen: number } = () => ({ brand: 'unknown', lengths: [16], cvvLen: 3 });
    private brand         : () => CardBrand = () => 'unknown';
    private numberDisplay : () => string = () => '';
    private cvvMaxLen     : () => number = () => 3;
    private numberMaxLen  : () => number = () => 19;
    private cardPreviewCls: () => string = () => 'ar-cc__preview';
    private previewNumber : () => string = () => '•••• •••• •••• ••••';
    private previewHolder : () => string = () => 'CARDHOLDER NAME';
    private previewExp    : () => string = () => 'MM/YY';
    private previewBrand  : () => string = () => 'CARD';
    private previewCvv    : () => string = () => '•••';
    private valid         : () => boolean = () => false;
    private payLabel      : () => string = () => 'Pay';
    private onNumber      : (e: Event) => void = () => {};
    private onHolder      : (e: Event) => void = () => {};
    private onExpMonth    : (e: Event) => void = () => {};
    private onExpYear     : (e: Event) => void = () => {};
    private onCvv         : (e: Event) => void = () => {};
    private onCvvFocus    : (e: Event) => void = () => {};
    private onCvvBlur     : (e: Event) => void = () => {};
    private onSave        : (e: Event) => void = () => {};
    private onSubmit      : (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    display: 'inline-block',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '13px',
                    color: 'var(--arianna-text, #1f2328)',
                }),
                new Rule('.ar-cc', {
                    display: 'flex', flexDirection: 'column', gap: '14px',
                    padding: '14px',
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 8px)',
                    width: '320px',
                }),
                new Rule('.ar-cc__preview', {
                    position: 'relative',
                    width: '100%', aspectRatio: '1.586',
                    perspective: '1000px',
                    transformStyle: 'preserve-3d',
                }),
                new Rule('.ar-cc__preview-face', {
                    position: 'absolute', inset: '0',
                    borderRadius: '10px',
                    padding: '16px',
                    color: '#fff',
                    backfaceVisibility: 'hidden',
                    transition: 'transform 0.5s',
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                }),
                new Rule('.ar-cc__preview-front', {
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'space-between',
                }),
                new Rule('.ar-cc__preview--visa .ar-cc__preview-front',       { background: 'linear-gradient(135deg, #1a1f71 0%, #1e3c8f 100%)' }),
                new Rule('.ar-cc__preview--mastercard .ar-cc__preview-front', { background: 'linear-gradient(135deg, #eb001b 0%, #f79e1b 100%)' }),
                new Rule('.ar-cc__preview--amex .ar-cc__preview-front',       { background: 'linear-gradient(135deg, #2671b9 0%, #006fcf 100%)' }),
                new Rule('.ar-cc__preview--discover .ar-cc__preview-front',   { background: 'linear-gradient(135deg, #ff6000 0%, #ff8c00 100%)' }),
                new Rule('.ar-cc__preview--maestro .ar-cc__preview-front',    { background: 'linear-gradient(135deg, #0099df 0%, #ed0006 100%)' }),
                new Rule('.ar-cc__preview-back', {
                    transform: 'rotateY(180deg)',
                    display: 'flex', flexDirection: 'column',
                }),
                new Rule('.ar-cc__preview--flipped .ar-cc__preview-front', { transform: 'rotateY(180deg)' }),
                new Rule('.ar-cc__preview--flipped .ar-cc__preview-back',  { transform: 'rotateY(360deg)' }),
                new Rule('.ar-cc__preview-brand', { fontSize: '11px', fontWeight: '700', letterSpacing: '0.15em' }),
                new Rule('.ar-cc__preview-chip', { fontSize: '24px', color: '#ffd700' }),
                new Rule('.ar-cc__preview-number', { fontSize: '18px', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.08em' }),
                new Rule('.ar-cc__preview-row', { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }),
                new Rule('.ar-cc__preview-meta', { fontSize: '9px', opacity: '0.7', letterSpacing: '0.1em' }),
                new Rule('.ar-cc__preview-holder', { fontSize: '12px', letterSpacing: '0.05em' }),
                new Rule('.ar-cc__preview-exp', { fontSize: '12px', fontFamily: 'ui-monospace, monospace' }),
                new Rule('.ar-cc__preview-strip', { marginTop: '16px', height: '34px', background: '#000' }),
                new Rule('.ar-cc__preview-cvv-box', {
                    marginTop: '12px', alignSelf: 'flex-end',
                    background: '#fff', color: '#000',
                    padding: '4px 12px', borderRadius: '3px',
                    fontFamily: 'ui-monospace, monospace',
                    minWidth: '60px', textAlign: 'right',
                }),
                new Rule('.ar-cc__form', { display: 'flex', flexDirection: 'column', gap: '10px' }),
                new Rule('.ar-cc__field', { display: 'flex', flexDirection: 'column', gap: '4px' }),
                new Rule('.ar-cc__field span', {
                    fontSize: '10px', textTransform: 'uppercase',
                    color: 'var(--arianna-muted, #6e6b62)',
                    letterSpacing: '0.06em',
                }),
                new Rule('.ar-cc__field input', {
                    background: 'var(--arianna-bg, #fff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    color: 'var(--arianna-text, #1f2328)',
                    padding: '8px 10px',
                    font: '13px ui-monospace, monospace',
                    borderRadius: '4px',
                }),
                new Rule('.ar-cc__field input:focus', {
                    outline: 'none',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-cc__row', { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }),
                new Rule('.ar-cc__save', { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }),
                new Rule('.ar-cc__pay', {
                    marginTop: '4px',
                    padding: '11px',
                    background: 'var(--arianna-primary, #1f6feb)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                }),
                new Rule('.ar-cc__pay:hover:not(:disabled)', { background: 'var(--arianna-primary-hover, #1858c4)' }),
                new Rule('.ar-cc__pay:disabled', { opacity: '0.4', cursor: 'not-allowed' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'CreditCard', {
        value: CreditCard, writable: false, enumerable: false, configurable: false,
    });
}

export default CreditCard;
