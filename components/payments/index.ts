/**
 * @module    components/payments
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Payment component barrel. Runtime classes and contracts are exported from
 * their canonical component namespaces.
 */

import { ApplePay as ApplePayModule } from './ApplePay.ts';
import { GooglePay as GooglePayModule } from './GooglePay.ts';
import { CreditCard as CreditCardModule } from './CreditCard.ts';
import { PayPal as PayPalModule } from './PayPal.ts';
import { Stripe as StripeModule } from './Stripe.ts';
import { Satispay as SatispayModule } from './Satispay.ts';
import { Nexi as NexiModule } from './Nexi.ts';
import { AliPay as AliPayModule } from './AliPay.ts';
import { PaymentGateway as PaymentGatewayModule } from './PaymentGateway.ts';

export const ApplePay = ApplePayModule.ApplePay;
export const GooglePay = GooglePayModule.GooglePay;
export const CreditCard = CreditCardModule.CreditCard;
export const PayPal = PayPalModule.PayPal;
export const Stripe = StripeModule.Stripe;
export const Satispay = SatispayModule.Satispay;
export const Nexi = NexiModule.Nexi;
export const AliPay = AliPayModule.AliPay;
export const PaymentGateway = PaymentGatewayModule.PaymentGateway;

export type ApplePayNetwork = ApplePayModule.Types.ApplePayNetwork;
export type ApplePayMerchantCapability = ApplePayModule.Types.ApplePayMerchantCapability;
export type ApplePayButtonStyle = ApplePayModule.Types.ApplePayButtonStyle;
export type ApplePayButtonType = ApplePayModule.Types.ApplePayButtonType;
export type ApplePayOptions = ApplePayModule.Interfaces.ApplePayOptions;

export type GooglePayEnvironment = GooglePayModule.Types.GooglePayEnvironment;
export type GooglePayButtonColor = GooglePayModule.Types.GooglePayButtonColor;
export type GooglePayButtonType = GooglePayModule.Types.GooglePayButtonType;
export type GooglePayOptions = GooglePayModule.Interfaces.GooglePayOptions;

export type CardBrand = CreditCardModule.Types.CardBrand;
export type CardData = CreditCardModule.Interfaces.CardData;
export type CreditCardOptions = CreditCardModule.Interfaces.CreditCardOptions;
export type PayPalOptions = PayPalModule.Interfaces.PayPalOptions;
export type StripeOptions = StripeModule.Interfaces.StripeOptions;
export type SatispayOptions = SatispayModule.Interfaces.SatispayOptions;
export type NexiOptions = NexiModule.Interfaces.NexiOptions;
export type AliPayMode = AliPayModule.Types.AliPayMode;
export type AliPayOptions = AliPayModule.Interfaces.AliPayOptions;
export type PaymentMethodId = PaymentGatewayModule.Types.PaymentMethodId;
export type PaymentGatewayMethodConfig = PaymentGatewayModule.Interfaces.PaymentGatewayMethodConfig;
export type PaymentGatewayOptions = PaymentGatewayModule.Interfaces.PaymentGatewayOptions;
