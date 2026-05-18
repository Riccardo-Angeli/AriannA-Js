/**
 * @module    components/payments
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Barrel — payment widgets. Importing this module side-effect-registers
 * 9 custom-element tags + re-exports their classes and types.
 *
 * # Tags registered
 *
 *   arianna-apple-pay         ApplePay        (PaymentRequest + ApplePaySession)
 *   arianna-google-pay        GooglePay       (Google Pay JS API + PaymentRequest fallback)
 *   arianna-credit-card       CreditCard      (form with live preview + Luhn + brand detect)
 *   arianna-paypal            PayPal          (Smart Buttons SDK)
 *   arianna-stripe            Stripe          (Payment Element with client-secret)
 *   arianna-satispay          Satispay        (redirect button)
 *   arianna-nexi              Nexi            (redirect button)
 *   arianna-alipay            AliPay          (redirect or QR-code)
 *   arianna-payment-gateway   PaymentGateway  (compound widget — orchestrates the 8 above)
 *
 * # Common event surface
 *
 * Every widget dispatches `arianna:payment-*` events that bubble. Subscribe
 * on the gateway or on the page root for a unified callback:
 *
 *   document.addEventListener('arianna:payment-success', e => {
 *     const { method, ...payload } = e.detail;
 *     api.confirm(method, payload);
 *   });
 *
 * Events:
 *   arianna:payment-success   detail: { method, ...method-specific payload }
 *   arianna:payment-error     detail: { method, message }
 *   arianna:payment-cancel    detail: { method }
 *   arianna:payment-redirect  detail: { method, url }  (Satispay/Nexi/AliPay)
 *   arianna:card-change       detail: { card, valid }  (CreditCard only)
 *   arianna:method-select     detail: { method }       (PaymentGateway only)
 */

export { ApplePay } from './ApplePay.ts';
export type {
    ApplePayNetwork, ApplePayMerchantCapability,
    ApplePayButtonStyle, ApplePayButtonType, ApplePayOptions,
} from './ApplePay.ts';

export { GooglePay } from './GooglePay.ts';
export type {
    GooglePayEnvironment, GooglePayButtonColor, GooglePayButtonType, GooglePayOptions,
} from './GooglePay.ts';

export { CreditCard } from './CreditCard.ts';
export type { CardBrand, CardData, CreditCardOptions } from './CreditCard.ts';

export { PayPal } from './PayPal.ts';
export type { PayPalOptions } from './PayPal.ts';

export { Stripe } from './Stripe.ts';
export type { StripeOptions } from './Stripe.ts';

export { Satispay } from './Satispay.ts';
export type { SatispayOptions } from './Satispay.ts';

export { Nexi } from './Nexi.ts';
export type { NexiOptions } from './Nexi.ts';

export { AliPay } from './AliPay.ts';
export type { AliPayMode, AliPayOptions } from './AliPay.ts';

export { PaymentGateway } from './PaymentGateway.ts';
export type {
    PaymentMethodId, PaymentGatewayMethodConfig, PaymentGatewayOptions,
} from './PaymentGateway.ts';
