/**
 * @module components/payments/Providers
 * @author Riccardo Angeli
 * @version 2.1.1
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 *
 * @description Canonical payment-provider registry used by AriannA payment components.
 * Brand marks belong to provider definitions; there is intentionally no separate Logos module.
 */

function esc(text: string): string
{
    return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function Wordmark(label: string, opts: { color?: string; accent?: string; bg?: string; border?: string; italic?: boolean; w?: number; h?: number } = {}): string
{
    const color = opts.color ?? '#111827';
    const accent = opts.accent ?? '';
    const bg = opts.bg ?? 'transparent';
    const border = opts.border ?? 'transparent';
    const italic = opts.italic ? 'italic' : 'normal';
    const w = opts.w ?? 156;
    const h = opts.h ?? 32;
    const safe = esc(label);
    const accentSvg = accent ? `<circle cx="16" cy="16" r="6" fill="${accent}"/>` : '';
    const x = accent ? 28 : 8;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safe}"><rect x="1" y="1" width="${w-2}" height="${h-2}" rx="8" fill="${bg}" stroke="${border}"/><g><${'text'} x="${x}" y="21" font-family="Arial,Helvetica,sans-serif" font-size="16" font-weight="700" font-style="${italic}" fill="${color}">${safe}</${'text'}></g></svg>`;
}

function DuoWordmark(left: string, right: string, opts: { leftColor: string; rightColor: string; bg?: string; border?: string; accent?: string; w?: number } ): string
{
    const bg = opts.bg ?? 'transparent';
    const border = opts.border ?? 'transparent';
    const accent = opts.accent ? `<circle cx="16" cy="16" r="6" fill="${opts.accent}"/>` : '';
    const w = opts.w ?? 168;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 32" role="img" aria-label="${esc(left+' '+right)}"><rect x="1" y="1" width="${w-2}" height="30" rx="8" fill="${bg}" stroke="${border}"/>${accent}<text x="${opts.accent ? 28 : 8}" y="21" font-family="Arial Black,Arial,sans-serif" font-size="16" font-weight="900" fill="${opts.leftColor}">${esc(left)}</text><text x="${(opts.accent ? 28 : 8) + len(left)*10 - 2}" y="21" font-family="Arial Black,Arial,sans-serif" font-size="16" font-weight="900" fill="${opts.rightColor}">${esc(right)}</text></svg>`;
}

function len(text: string): number { return text.length; }

function Pill(label: string, bg: string, fg = '#ffffff', border = 'transparent'): string
{
    const safe = esc(label);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 32" role="img" aria-label="${safe}"><rect x="1" y="1" width="118" height="30" rx="15" fill="${bg}" stroke="${border}"/><text x="60" y="21" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="15" font-weight="700" fill="${fg}">${safe}</text></svg>`;
}

function TwoCircleCards(): string
{
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 32" role="img" aria-label="Credit and debit cards"><rect x="2" y="6" width="34" height="20" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h32" stroke="currentColor" stroke-width="3"/><circle cx="60" cy="16" r="10" fill="#EB001B"/><circle cx="72" cy="16" r="10" fill="#F79E1B" fill-opacity=".92"/></svg>`;
}

function PixGlyph(): string
{
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 32" role="img" aria-label="Pix"><rect x="1" y="1" width="118" height="30" rx="8" fill="#ffffff" stroke="#DDE3E8"/><path d="M27 16l8-8c2-2 5-2 7 0l4 4-5 5-4-4c-.5-.5-1.3-.5-1.8 0L31 17l4.2 4.2c.5.5 1.3.5 1.8 0l4-4 5 5-4 4c-2 2-5 2-7 0l-8-8zm21.2-4.2 4-4c2-2 5-2 7 0l8 8-8 8c-2 2-5 2-7 0l-4-4 5-5 4 4c.5.5 1.3.5 1.8 0L63 16l-4.2-4.2c-.5-.5-1.3-.5-1.8 0l-4 4-4.8-4.8z" fill="#32BCAD"/><text x="76" y="21" font-family="Arial Black,Arial,sans-serif" font-size="15" font-weight="800" fill="#32BCAD">PIX</text></svg>`;
}

export type PaymentProviderId =
    | 'applePay' | 'googlePay' | 'card' | 'paypal' | 'stripe' | 'satispay' | 'nexi' | 'alipay'
    | 'wechatPay' | 'amazonPay' | 'klarna' | 'sofort' | 'adyen' | 'worldline' | 'checkoutCom'
    | 'sumup' | 'mollie' | 'twint' | 'ideal' | 'bancontact' | 'blik' | 'trustly' | 'wero'
    | 'sepa' | 'pix' | 'upi' | 'mercadoPago' | 'mpesa' | 'cashApp';

export type PaymentProviderKind = 'wallet' | 'psp' | 'bank' | 'card' | 'mobile-money' | 'bnpl';

export interface PaymentApiCapability
{
    documented: boolean;
    browserSafe: boolean;
    serverProxyRequired: boolean;
    docs?: string;
    note?: string;
}

export interface PaymentProviderConfig
{
    id: PaymentProviderId;
    name: string;
    kind: PaymentProviderKind;
    color: string;
    contrast?: string;
    logo: string;
    website?: string;
    deprecated?: boolean;
    replacement?: PaymentProviderId;
    api: PaymentApiCapability;
}

export namespace PaymentProviders
{
    export const ApplePay: PaymentProviderConfig = {
        id:'applePay', name:'Apple Pay', kind:'wallet', color:'#111111', contrast:'#ffffff',
        logo: Wordmark(' Pay',{color:'#111111',bg:'#ffffff',border:'#d9dde3'}), website:'https://www.apple.com/apple-pay/',
        api:{ documented:true, browserSafe:true, serverProxyRequired:true, docs:'https://developer.apple.com/apple-pay/', note:'Apple Pay JS is browser-facing; merchant validation and payment processing remain server-side.' }
    };
    export const GooglePay: PaymentProviderConfig = {
        id:'googlePay', name:'Google Pay', kind:'wallet', color:'#4285F4', contrast:'#ffffff',
        logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 32" role="img" aria-label="Google Pay"><rect x="1" y="1" width="158" height="30" rx="8" fill="#fff" stroke="#d9dde3"/><text x="12" y="21" font-family="Arial,Helvetica,sans-serif" font-size="16" font-weight="700"><tspan fill="#4285F4">G</tspan><tspan fill="#DB4437">o</tspan><tspan fill="#F4B400">o</tspan><tspan fill="#4285F4">g</tspan><tspan fill="#0F9D58">l</tspan><tspan fill="#DB4437">e</tspan><tspan fill="#5F6368"> Pay</tspan></text></svg>`, website:'https://pay.google.com/',
        api:{ documented:true, browserSafe:true, serverProxyRequired:true, docs:'https://developers.google.com/pay/api/web/overview', note:'Google Pay Web API is browser-facing; gateway/token processing remains server-side.' }
    };
    export const Card: PaymentProviderConfig = {
        id:'card', name:'Credit / Debit Card', kind:'card', color:'#e40c88', contrast:'#ffffff',
        logo: TwoCircleCards(),
        api:{ documented:false, browserSafe:false, serverProxyRequired:true, note:'Card tokenization/processing is supplied by the selected acquirer/PSP. CreditCard.ts intentionally remains transport-agnostic.' }
    };
    export const PayPal: PaymentProviderConfig = {
        id:'paypal', name:'PayPal', kind:'wallet', color:'#003087', contrast:'#ffffff',
        logo: DuoWordmark('Pay','Pal',{leftColor:'#003087',rightColor:'#009CDE',bg:'#ffffff',border:'#d9dde3'}), website:'https://www.paypal.com/',
        api:{ documented:true, browserSafe:true, serverProxyRequired:true, docs:'https://developer.paypal.com/docs/checkout/', note:'PayPal JS SDK is browser-facing; order creation/capture belongs on the server.' }
    };
    export const Stripe: PaymentProviderConfig = {
        id:'stripe', name:'Stripe', kind:'psp', color:'#635BFF', contrast:'#ffffff',
        logo: Wordmark('stripe',{color:'#635BFF',bg:'#ffffff',border:'#d9dde3'}), website:'https://stripe.com/',
        api:{ documented:true, browserSafe:true, serverProxyRequired:true, docs:'https://docs.stripe.com/payments', note:'Stripe.js/Elements are browser-facing; PaymentIntent creation and secret operations belong on the server.' }
    };
    export const Satispay: PaymentProviderConfig = {
        id:'satispay', name:'Satispay', kind:'wallet', color:'#F9423A', contrast:'#ffffff',
        logo: Wordmark('SATISPAY',{color:'#F9423A',bg:'#ffffff',border:'#d9dde3'}), website:'https://www.satispay.com/',
        api:{ documented:true, browserSafe:false, serverProxyRequired:true, docs:'https://developers.satispay.com/', note:'Use merchant-server APIs to create payment flows; browser receives only checkout/redirect data.' }
    };
    export const Nexi: PaymentProviderConfig = {
        id:'nexi', name:'Nexi', kind:'psp', color:'#001E62', contrast:'#ffffff',
        logo: Wordmark('nexi',{color:'#001E62',bg:'#ffffff',border:'#d9dde3'}), website:'https://www.nexi.it/',
        api:{ documented:true, browserSafe:false, serverProxyRequired:true, docs:'https://developer.nexi.it/', note:'Nexi/XPay credentials and order creation belong on the merchant server.' }
    };
    export const AliPay: PaymentProviderConfig = {
        id:'alipay', name:'Alipay', kind:'wallet', color:'#1677FF', contrast:'#ffffff',
        logo: Wordmark('Alipay',{color:'#1677FF',bg:'#ffffff',border:'#d9dde3'}), website:'https://global.alipay.com/',
        api:{ documented:true, browserSafe:false, serverProxyRequired:true, docs:'https://global.alipay.com/docs/ac/ams/start', note:'Alipay merchant signing and payment creation belong on the server.' }
    };
    export const WeChatPay: PaymentProviderConfig = {
        id:'wechatPay', name:'WeChat Pay', kind:'wallet', color:'#07C160', contrast:'#ffffff',
        logo: Wordmark('WeChat Pay',{color:'#171717',accent:'#07C160',bg:'#ffffff',border:'#d9dde3'}), website:'https://pay.weixin.qq.com/',
        api:{ documented:true, browserSafe:false, serverProxyRequired:true, docs:'https://pay.weixin.qq.com/doc/global/v3/en/', note:'API v3 signing and credentials belong on the merchant server.' }
    };
    export const AmazonPay: PaymentProviderConfig = {
        id:'amazonPay', name:'Amazon Pay', kind:'wallet', color:'#111827', contrast:'#ffffff',
        logo: Wordmark('amazon pay',{color:'#111827',bg:'#ffffff',border:'#d9dde3'}), website:'https://pay.amazon.com/',
        api:{ documented:true, browserSafe:true, serverProxyRequired:true, docs:'https://developer.amazon.com/docs/amazon-pay/intro.html', note:'Checkout.js is browser-facing; checkout session creation and signing remain server-side.' }
    };
    export const Klarna: PaymentProviderConfig = {
        id:'klarna', name:'Klarna', kind:'bnpl', color:'#FFB3C7', contrast:'#111111',
        logo: Pill('Klarna','#FFB3C7','#111111','#e38aa8'), website:'https://www.klarna.com/',
        api:{ documented:true, browserSafe:true, serverProxyRequired:true, docs:'https://docs.klarna.com/', note:'Klarna client SDKs are browser-facing; session/order creation requires merchant server credentials.' }
    };
    export const Sofort: PaymentProviderConfig = {
        id:'sofort', name:'SOFORT · legacy', kind:'bank', color:'#E6007E', contrast:'#ffffff',
        logo: Wordmark('SOFORT',{color:'#E6007E',bg:'#ffffff',border:'#d9dde3',italic:true}), website:'https://www.klarna.com/', deprecated:true, replacement:'klarna',
        api:{ documented:false, browserSafe:false, serverProxyRequired:true, docs:'https://docs.klarna.com/', note:'Standalone SOFORT was discontinued in 2025. Keep only as a compatibility alias that routes to Klarna.' }
    };
    export const Adyen: PaymentProviderConfig = {
        id:'adyen', name:'Adyen', kind:'psp', color:'#0ABF53', contrast:'#ffffff',
        logo: Wordmark('adyen',{color:'#0ABF53',bg:'#ffffff',border:'#d9dde3'}), website:'https://www.adyen.com/',
        api:{ documented:true, browserSafe:true, serverProxyRequired:true, docs:'https://docs.adyen.com/online-payments/', note:'Adyen Web is browser-facing; payment/session creation is server-side.' }
    };
    export const Worldline: PaymentProviderConfig = {
        id:'worldline', name:'Worldline', kind:'psp', color:'#00A8A8', contrast:'#ffffff',
        logo: Wordmark('worldline',{color:'#00A8A8',bg:'#ffffff',border:'#d9dde3'}), website:'https://worldline.com/',
        api:{ documented:true, browserSafe:false, serverProxyRequired:true, docs:'https://docs.direct.worldline-solutions.com/', note:'Hosted checkout/API creation uses merchant credentials on the server.' }
    };
    export const CheckoutCom: PaymentProviderConfig = {
        id:'checkoutCom', name:'Checkout.com', kind:'psp', color:'#111111', contrast:'#ffffff',
        logo: Wordmark('Checkout.com',{color:'#111111',bg:'#ffffff',border:'#d9dde3'}), website:'https://www.checkout.com/',
        api:{ documented:true, browserSafe:true, serverProxyRequired:true, docs:'https://www.checkout.com/docs/', note:'Flow/Frames can render client-side; payment/session creation and secret keys belong server-side.' }
    };
    export const SumUp: PaymentProviderConfig = {
        id:'sumup', name:'SumUp', kind:'psp', color:'#111111', contrast:'#ffffff',
        logo: Wordmark('SumUp',{color:'#111111',bg:'#ffffff',border:'#d9dde3'}), website:'https://www.sumup.com/',
        api:{ documented:true, browserSafe:true, serverProxyRequired:true, docs:'https://developer.sumup.com/', note:'Checkout creation and merchant credentials belong on the server; browser uses checkout/widget data.' }
    };
    export const Mollie: PaymentProviderConfig = {
        id:'mollie', name:'Mollie', kind:'psp', color:'#000000', contrast:'#ffffff',
        logo: Wordmark('Mollie',{color:'#111111',accent:'#00AEEF',bg:'#ffffff',border:'#d9dde3'}), website:'https://www.mollie.com/',
        api:{ documented:true, browserSafe:false, serverProxyRequired:true, docs:'https://docs.mollie.com/', note:'Mollie API keys are server credentials; browser receives payment redirect/status data.' }
    };
    export const Twint: PaymentProviderConfig = {
        id:'twint', name:'TWINT', kind:'wallet', color:'#111111', contrast:'#ffffff',
        logo: Wordmark('TWINT',{color:'#111111',accent:'#FF5F00',bg:'#ffffff',border:'#d9dde3'}), website:'https://www.twint.ch/',
        api:{ documented:true, browserSafe:false, serverProxyRequired:true, docs:'https://www.twint.ch/en/business-customers/', note:'Merchant integration is normally provided through an acquiring/PSP contract.' }
    };
    export const Ideal: PaymentProviderConfig = {
        id:'ideal', name:'iDEAL', kind:'bank', color:'#CC0066', contrast:'#ffffff',
        logo: Wordmark('iDEAL',{color:'#CC0066',bg:'#ffffff',border:'#d9dde3'}), website:'https://www.ideal.nl/',
        api:{ documented:true, browserSafe:false, serverProxyRequired:true, docs:'https://docs.ideal.nl/', note:'Use an iDEAL acquirer/CPSP or PSP server integration.' }
    };
    export const Bancontact: PaymentProviderConfig = {
        id:'bancontact', name:'Bancontact', kind:'bank', color:'#005498', contrast:'#ffffff',
        logo: Wordmark('Bancontact',{color:'#005498',bg:'#ffffff',border:'#d9dde3'}), website:'https://www.bancontact.com/',
        api:{ documented:true, browserSafe:false, serverProxyRequired:true, note:'Merchant integration is normally exposed by an acquiring PSP; keep credentials server-side.' }
    };
    export const Blik: PaymentProviderConfig = {
        id:'blik', name:'BLIK', kind:'bank', color:'#111111', contrast:'#ffffff',
        logo: Wordmark('BLIK',{color:'#111111',accent:'#E6002D',bg:'#ffffff',border:'#d9dde3'}), website:'https://blik.com/',
        api:{ documented:true, browserSafe:false, serverProxyRequired:true, note:'Merchant API access is contract/acquirer based; payment authorization belongs on the server.' }
    };
    export const Trustly: PaymentProviderConfig = {
        id:'trustly', name:'Trustly', kind:'bank', color:'#1C1C1C', contrast:'#ffffff',
        logo: Wordmark('Trustly',{color:'#1C1C1C',bg:'#ffffff',border:'#d9dde3'}), website:'https://www.trustly.com/',
        api:{ documented:true, browserSafe:false, serverProxyRequired:true, docs:'https://docs.trustly.com/', note:'Order initialization/signing belongs on the merchant server.' }
    };
    export const Wero: PaymentProviderConfig = {
        id:'wero', name:'Wero', kind:'bank', color:'#5B2EFF', contrast:'#ffffff',
        logo: Wordmark('wero',{color:'#5B2EFF',bg:'#ffffff',border:'#d9dde3'}), website:'https://wero-wallet.eu/',
        api:{ documented:false, browserSafe:false, serverProxyRequired:true, note:'Wero merchant rollout is PSP/bank integrated; no universal unauthenticated browser API is assumed.' }
    };
    export const Sepa: PaymentProviderConfig = {
        id:'sepa', name:'SEPA', kind:'bank', color:'#003399', contrast:'#ffffff',
        logo: Wordmark('SEPA',{color:'#003399',accent:'#FFCC00',bg:'#ffffff',border:'#d9dde3'}), website:'https://www.europeanpaymentscouncil.eu/',
        api:{ documented:false, browserSafe:false, serverProxyRequired:true, note:'SEPA Credit Transfer/Instant/Direct Debit are schemes; implementation is supplied by the selected bank/PSP API.' }
    };
    export const Pix: PaymentProviderConfig = {
        id:'pix', name:'Pix', kind:'bank', color:'#32BCAD', contrast:'#111111',
        logo: PixGlyph(), website:'https://www.bcb.gov.br/estabilidadefinanceira/pix',
        api:{ documented:true, browserSafe:false, serverProxyRequired:true, note:'Pix merchant integration is provided through Brazilian PSP/bank APIs; credentials and charge creation remain server-side.' }
    };
    export const Upi: PaymentProviderConfig = {
        id:'upi', name:'UPI', kind:'bank', color:'#F36F21', contrast:'#ffffff',
        logo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 32" role="img" aria-label="UPI"><rect x="1" y="1" width="130" height="30" rx="8" fill="#fff" stroke="#d9dde3"/><text x="12" y="21" font-family="Arial Black,Arial,sans-serif" font-size="16" font-weight="900"><tspan fill="#005CAB">UP</tspan><tspan fill="#F36F21">I</tspan></text><path d="M88 10l10 6-10 6" fill="none" stroke="#59B947" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M70 16h27" stroke="#59B947" stroke-width="3" stroke-linecap="round"/></svg>`, website:'https://www.npci.org.in/what-we-do/upi/product-overview',
        api:{ documented:true, browserSafe:false, serverProxyRequired:true, note:'UPI merchant integration is exposed by participating banks/PSPs, not as a credential-free browser API.' }
    };
    export const MercadoPago: PaymentProviderConfig = {
        id:'mercadoPago', name:'Mercado Pago', kind:'wallet', color:'#009EE3', contrast:'#ffffff',
        logo: Wordmark('Mercado Pago',{color:'#009EE3',bg:'#ffffff',border:'#d9dde3'}), website:'https://www.mercadopago.com/',
        api:{ documented:true, browserSafe:true, serverProxyRequired:true, docs:'https://www.mercadopago.com/developers/', note:'Checkout bricks/SDKs are browser-facing; preference/payment creation with credentials belongs server-side.' }
    };
    export const MPesa: PaymentProviderConfig = {
        id:'mpesa', name:'M-Pesa', kind:'mobile-money', color:'#57A635', contrast:'#ffffff',
        logo: Wordmark('M-PESA',{color:'#57A635',bg:'#ffffff',border:'#d9dde3'}), website:'https://www.safaricom.co.ke/personal/m-pesa',
        api:{ documented:true, browserSafe:false, serverProxyRequired:true, docs:'https://developer.safaricom.co.ke/', note:'Daraja OAuth and payment requests must be executed on the merchant server.' }
    };
    export const CashApp: PaymentProviderConfig = {
        id:'cashApp', name:'Cash App Pay', kind:'wallet', color:'#00D64F', contrast:'#111111',
        logo: Wordmark('Cash App Pay',{color:'#00A63B',bg:'#ffffff',border:'#d9dde3'}), website:'https://cash.app/',
        api:{ documented:true, browserSafe:true, serverProxyRequired:true, docs:'https://developers.cash.app/', note:'Cash App Pay client integration pairs with merchant-server payment processing.' }
    };

    export const All: readonly PaymentProviderConfig[] = Object.freeze([
        ApplePay, GooglePay, Card, PayPal, Stripe, Satispay, Nexi, AliPay,
        WeChatPay, AmazonPay, Klarna, Sofort, Adyen, Worldline, CheckoutCom,
        SumUp, Mollie, Twint, Ideal, Bancontact, Blik, Trustly, Wero,
        Sepa, Pix, Upi, MercadoPago, MPesa, CashApp,
    ]);

    export function Get(id: string | null | undefined): PaymentProviderConfig | undefined
    {
        if(!id) return undefined;
        return All.find(provider => provider.id.toLowerCase() === id.trim().toLowerCase());
    }
}

export default PaymentProviders;
