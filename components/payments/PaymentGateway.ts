/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/payments/PaymentGateway
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Compound widget — presents *all* enabled payment methods in a single
 * checkout UI, lets the user pick one, and forwards the appropriate event
 * up to the merchant. The single integration point most apps want.
 *
 *   ┌─────────────────────────────────────┐
 *   │ Choose how to pay                   │
 *   ├─────────────────────────────────────┤
 *   │ ◉ Apple Pay         [    Pay    ]   │
 *   │ ○ Google Pay                        │
 *   │ ○ Credit / Debit Card                │
 *   │ ○ PayPal                            │
 *   │ ○ Stripe                            │
 *   │ ○ Satispay                          │
 *   │ ○ Nexi                              │
 *   │ ○ Alipay                            │
 *   └─────────────────────────────────────┘
 *
 * Methods are configured programmatically via `setMethods()` (the merchant
 * supplies per-method config — keys, merchant ids, redirect URLs).
 * Events from any selected underlying widget bubble up; `arianna:payment-*`
 * events propagate naturally because the inner widgets dispatch with
 * `bubbles: true`.
 *
 * @example HTML
 *   <arianna-payment-gateway amount="99.00" currency="EUR" title="Pay now"></arianna-payment-gateway>
 *
 * @example JS
 *   const pg = new PaymentGateway();
 *   pg.setMethods({
 *     applePay : { merchantId: 'merchant.com.example', countryCode: 'IT' },
 *     googlePay: { merchantId: '01234567', merchantName: 'X', countryCode: 'IT',
 *                  gateway: 'stripe', gatewayMerchantId: 'acct_1' },
 *     card     : { saveOption: true },
 *     paypal   : { clientId: 'AYxxx' },
 *     stripe   : { publishableKey: 'pk_test_...', clientSecret: '...',
 *                  returnUrl: 'https://...' },
 *     satispay : { redirectUrl: 'https://online.satispay.com/pay/xxx' },
 *     nexi     : { redirectUrl: 'https://ecommerce.nexi.it/ecomm/...' },
 *     alipay   : { mode: 'redirect', redirectUrl: 'https://openapi.alipay.com/...' },
 *   });
 *
 * Events: re-dispatches all `arianna:payment-success/error/cancel/redirect`
 *         from inner widgets, plus `arianna:method-select` when the user
 *         picks a method.
 *
 * Attributes: amount, currency, title
 */
/* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
   members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
   `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
   not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
   returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
   Map, Effect" with the same name printed twice. */
const signal = Reactivity.CreateSignal;
type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;
import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import { ApplePay } from './ApplePay.ts';
import { GooglePay } from './GooglePay.ts';
import { CreditCard } from './CreditCard.ts';
import { PayPal } from './PayPal.ts';
import { Stripe } from './Stripe.ts';
import { Satispay } from './Satispay.ts';
import { Nexi } from './Nexi.ts';
import { AliPay } from './AliPay.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/schema/Interfaces.ts';
const html = Templates.Template.Html;
export type PaymentMethodId = 'applePay' | 'googlePay' | 'card' | 'paypal' | 'stripe' | 'satispay' | 'nexi' | 'alipay';
export interface PaymentGatewayMethodConfig {
    applePay?: Partial<{
        merchantId: string;
        countryCode: string;
        supportedNetworks: string[];
        merchantCapabilities: string[];
        buttonStyle: string;
        buttonType: string;
        forceShow: boolean;
    }>;
    googlePay?: Partial<{
        merchantId: string;
        merchantName: string;
        countryCode: string;
        gateway: string;
        gatewayMerchantId: string;
        environment: string;
        buttonColor: string;
        buttonType: string;
        supportedNetworks: string[];
        supportedAuthMethods: string[];
    }>;
    card?: Partial<{
        saveOption: boolean;
        holderNameRequired: boolean;
    }>;
    paypal?: Partial<{
        clientId: string;
        intent: string;
        redirectUrl: string;
        buttonStyle: string;
        buttonColor: string;
        buttonShape: string;
    }>;
    stripe?: Partial<{
        publishableKey: string;
        clientSecret: string;
        returnUrl: string;
        locale: string;
        appearanceTheme: string;
    }>;
    satispay?: Partial<{
        redirectUrl: string;
        target: string;
    }>;
    nexi?: Partial<{
        redirectUrl: string;
        target: string;
    }>;
    alipay?: Partial<{
        mode: string;
        redirectUrl: string;
        qrUrl: string;
        target: string;
    }>;
}
export interface PaymentGatewayOptions {
    amount: number;
    currency: string;
    methods: PaymentGatewayMethodConfig;
    initial?: PaymentMethodId;
    title?: string;
    order?: PaymentMethodId[];
}
const METHOD_META: Array<{
    id: PaymentMethodId;
    label: string;
    icon: string;
}> = [
    { id: 'applePay', label: 'Apple Pay', icon: '' },
    { id: 'googlePay', label: 'Google Pay', icon: 'G' },
    { id: 'card', label: 'Credit / Debit Card', icon: '▣' },
    { id: 'paypal', label: 'PayPal', icon: 'P' },
    { id: 'stripe', label: 'Stripe', icon: 'S' },
    { id: 'satispay', label: 'Satispay', icon: '◉' },
    { id: 'nexi', label: 'Nexi', icon: 'n' },
    { id: 'alipay', label: 'Alipay', icon: '支' },
];
@Component('arianna-payment-gateway', {}, {
    Attributes: ['amount', 'currency', 'title'],
})
export class PaymentGateway extends HTMLElement {
    /** Compiler-visible binding factory installed by the Component decorator. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible template slot installed by the Component decorator. */
    declare template: unknown;
    methods$: Signal<PaymentGatewayMethodConfig> = signal<PaymentGatewayMethodConfig>({});
    selected$: Signal<PaymentMethodId | null> = signal<PaymentMethodId | null>(null);
    // Cached widget instances — created lazily when a method is selected
    #instances: Partial<Record<PaymentMethodId, Element>> = {};
    onConnected(_opts: PaymentGatewayOptions = {} as PaymentGatewayOptions) {
        const titleAttr = this.signal().attribute('title');
        this.headerTitle = () => titleAttr.Get() ?? 'Choose how to pay';
        this.methodList = (): Array<{
            id: PaymentMethodId;
            label: string;
            icon: string;
            cls: string;
            selected: boolean;
        }> => {
            const cfg = this.methods$.Get();
            const sel = this.selected$.Get();
            return METHOD_META
                .filter(m => cfg[m.id])
                .map(m => ({
                id: m.id,
                label: m.label,
                icon: m.icon,
                selected: sel === m.id,
                cls: 'ar-pg__row' + (sel === m.id ? ' ar-pg__row--selected' : ''),
            }));
        };
        this.onRowClick = (e: Event) => {
            const row = e.currentTarget as HTMLElement;
            const id = row.dataset.method as PaymentMethodId;
            if (id)
                this.selectMethod(id);
        };
        this.template = html `
            <div class="ar-pg">
                <div class="ar-pg__title">{{ this.headerTitle() }}</div>
                <div class="ar-pg__list">
                    <div a-for="m in this.methodList()"
                         :class="m.cls"
                         :data-method="m.id"
                         @click="this.onRowClick">
                        <div class="ar-pg__head">
                            <span class="ar-pg__radio">
                                <span a-if="m.selected">●</span>
                            </span>
                            <span class="ar-pg__icon">{{ m.icon }}</span>
                            <span class="ar-pg__label">{{ m.label }}</span>
                        </div>
                        <div class="ar-pg__mount" :data-mount="m.id" a-if="m.selected"></div>
                    </div>
                </div>
            </div>
        `;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = PaymentGateway.DefaultSheet();
    }
    // ── Public API ───────────────────────────────────────────────────────────
    setMethods(cfg: PaymentGatewayMethodConfig): this {
        this.methods$.Set({ ...cfg });
        // Pick first method as initial if none selected yet
        if (!this.selected$.Get()) {
            const first = METHOD_META.find(m => cfg[m.id]);
            if (first)
                this.selectMethod(first.id);
        }
        return this;
    }
    getMethods(): PaymentGatewayMethodConfig { return { ...this.methods$.Get() }; }
    selectMethod(id: PaymentMethodId): this {
        this.selected$.Set(id);
        this.dispatchEvent(new CustomEvent('arianna:method-select', {
            bubbles: true, detail: { method: id },
        }));
        // Mount the underlying widget lazily after DOM update
        queueMicrotask(() => this.#mountMethod(id));
        return this;
    }
    getSelected(): PaymentMethodId | null { return this.selected$.Get(); }
    /** Programmatically trigger payment on the currently-selected method. */
    async pay(): Promise<void> {
        const sel = this.selected$.Get();
        if (!sel)
            return;
        const inst = this.#instances[sel];
        if (!inst)
            return;
        const w = inst as {
            pay?(): Promise<void> | void;
        };
        if (typeof w.pay === 'function')
            await w.pay();
    }
    // ── Internal ─────────────────────────────────────────────────────────────
    #mountMethod(id: PaymentMethodId): void {
        const host = this.querySelector<HTMLElement>(`[data-mount="${id}"]`);
        if (!host)
            return;
        if (host.children.length > 0)
            return; // already mounted
        const amount = parseFloat(this.getAttribute('amount') ?? '0') || 0;
        const currency = this.getAttribute('currency') ?? 'EUR';
        const cfg = this.methods$.Get();
        let el: Element | null = null;
        switch (id) {
            case 'applePay': {
                const c = cfg.applePay ?? {};
                const ap = new ApplePay();
                if (c.merchantId)
                    ap.setAttribute('merchant-id', c.merchantId);
                if (c.countryCode)
                    ap.setAttribute('country-code', c.countryCode);
                ap.setAttribute('currency', currency);
                ap.setAttribute('amount', String(amount));
                if (c.supportedNetworks)
                    ap.setAttribute('supported-networks', c.supportedNetworks.join(','));
                if (c.merchantCapabilities)
                    ap.setAttribute('merchant-capabilities', c.merchantCapabilities.join(','));
                if (c.buttonStyle)
                    ap.setAttribute('button-style', c.buttonStyle);
                if (c.buttonType)
                    ap.setAttribute('button-type', c.buttonType);
                if (c.forceShow)
                    ap.setAttribute('force-show', '');
                el = ap;
                break;
            }
            case 'googlePay': {
                const c = cfg.googlePay ?? {};
                const gp = new GooglePay();
                if (c.merchantId)
                    gp.setAttribute('merchant-id', c.merchantId);
                if (c.merchantName)
                    gp.setAttribute('merchant-name', c.merchantName);
                if (c.countryCode)
                    gp.setAttribute('country-code', c.countryCode);
                gp.setAttribute('currency', currency);
                gp.setAttribute('amount', String(amount));
                if (c.gateway)
                    gp.setAttribute('gateway', c.gateway);
                if (c.gatewayMerchantId)
                    gp.setAttribute('gateway-merchant-id', c.gatewayMerchantId);
                if (c.environment)
                    gp.setAttribute('environment', c.environment);
                if (c.buttonColor)
                    gp.setAttribute('button-color', c.buttonColor);
                if (c.buttonType)
                    gp.setAttribute('button-type', c.buttonType);
                el = gp;
                break;
            }
            case 'card': {
                const c = cfg.card ?? {};
                const cc = new CreditCard();
                cc.setAttribute('amount', String(amount));
                cc.setAttribute('currency', currency);
                if (c.saveOption)
                    cc.setAttribute('save-option', '');
                if (c.holderNameRequired)
                    cc.setAttribute('holder-name-required', '');
                el = cc;
                break;
            }
            case 'paypal': {
                const c = cfg.paypal ?? {};
                const pp = new PayPal();
                if (c.clientId)
                    pp.setAttribute('client-id', c.clientId);
                pp.setAttribute('amount', String(amount));
                pp.setAttribute('currency', currency);
                if (c.intent)
                    pp.setAttribute('intent', c.intent);
                if (c.redirectUrl)
                    pp.setAttribute('redirect-url', c.redirectUrl);
                if (c.buttonStyle)
                    pp.setAttribute('button-style', c.buttonStyle);
                if (c.buttonColor)
                    pp.setAttribute('button-color', c.buttonColor);
                if (c.buttonShape)
                    pp.setAttribute('button-shape', c.buttonShape);
                el = pp;
                break;
            }
            case 'stripe': {
                const c = cfg.stripe ?? {};
                const st = new Stripe();
                if (c.publishableKey)
                    st.setAttribute('publishable-key', c.publishableKey);
                if (c.clientSecret)
                    st.setAttribute('client-secret', c.clientSecret);
                if (c.returnUrl)
                    st.setAttribute('return-url', c.returnUrl);
                if (c.locale)
                    st.setAttribute('locale', c.locale);
                if (c.appearanceTheme)
                    st.setAttribute('appearance-theme', c.appearanceTheme);
                el = st;
                break;
            }
            case 'satispay': {
                const c = cfg.satispay ?? {};
                const sp = new Satispay();
                if (c.redirectUrl)
                    sp.setAttribute('redirect-url', c.redirectUrl);
                sp.setAttribute('amount', String(amount));
                sp.setAttribute('currency', currency);
                if (c.target)
                    sp.setAttribute('target', c.target);
                el = sp;
                break;
            }
            case 'nexi': {
                const c = cfg.nexi ?? {};
                const nx = new Nexi();
                if (c.redirectUrl)
                    nx.setAttribute('redirect-url', c.redirectUrl);
                nx.setAttribute('amount', String(amount));
                nx.setAttribute('currency', currency);
                if (c.target)
                    nx.setAttribute('target', c.target);
                el = nx;
                break;
            }
            case 'alipay': {
                const c = cfg.alipay ?? {};
                const ap = new AliPay();
                if (c.mode)
                    ap.setAttribute('mode', c.mode);
                if (c.redirectUrl)
                    ap.setAttribute('redirect-url', c.redirectUrl);
                if (c.qrUrl)
                    ap.setAttribute('qr-url', c.qrUrl);
                ap.setAttribute('amount', String(amount));
                ap.setAttribute('currency', currency);
                if (c.target)
                    ap.setAttribute('target', c.target);
                el = ap;
                break;
            }
        }
        if (el) {
            host.appendChild(el);
            this.#instances[id] = el;
        }
    }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    private headerTitle: () => string = () => 'Choose how to pay';
    private methodList: () => Array<{
        id: PaymentMethodId;
        label: string;
        icon: string;
        cls: string;
        selected: boolean;
    }> = () => [];
    private onRowClick: (e: Event) => void = () => { };
    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                display: 'block',
                fontFamily: '-apple-system, system-ui, sans-serif',
                fontSize: '13px',
                color: 'var(--arianna-text, #1f2328)',
                maxWidth: '480px',
            }),
            new Rule('.ar-pg', {
                display: 'flex', flexDirection: 'column',
                background: 'var(--arianna-bg, #fff)',
                border: '1px solid var(--arianna-border, #d8d8d8)',
                borderRadius: 'var(--arianna-radius, 8px)',
                overflow: 'hidden',
            }),
            new Rule('.ar-pg__title', {
                padding: '14px 18px',
                background: 'var(--arianna-bg-3, #f3f3f3)',
                borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                fontWeight: '600',
                fontSize: '14px',
            }),
            new Rule('.ar-pg__list', { display: 'flex', flexDirection: 'column' }),
            new Rule('.ar-pg__row', {
                display: 'flex', flexDirection: 'column',
                borderBottom: '1px solid var(--arianna-bg-3, #f3f3f3)',
                cursor: 'pointer',
                transition: 'background 0.1s',
            }),
            new Rule('.ar-pg__row:hover', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
            new Rule('.ar-pg__row--selected', {
                background: 'rgba(31,111,235,0.04)',
                cursor: 'default',
            }),
            new Rule('.ar-pg__head', {
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 18px',
            }),
            new Rule('.ar-pg__radio', {
                width: '18px', height: '18px',
                border: '2px solid var(--arianna-muted, #6e6b62)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px',
                color: 'var(--arianna-primary, #1f6feb)',
            }),
            new Rule('.ar-pg__row--selected .ar-pg__radio', {
                borderColor: 'var(--arianna-primary, #1f6feb)',
            }),
            new Rule('.ar-pg__icon', {
                fontSize: '16px', fontWeight: '700',
                width: '20px', textAlign: 'center',
            }),
            new Rule('.ar-pg__label', { flex: '1' }),
            new Rule('.ar-pg__mount', { padding: '0 18px 16px 50px' }),
        ]);
    }
}
/* ──────────────────────────────────────────────────────────────────────────
 * PaymentGateway namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace PaymentGateway {
    export namespace Types {
        export type PaymentMethodIdType = PaymentMethodId;
    }
    export namespace Interfaces {
        export interface MethodConfig extends PaymentGatewayMethodConfig {
        }
        export interface Options extends PaymentGatewayOptions {
        }
    }
}
export default PaymentGateway;
