/** @module components/payments/ApplePay
 * @description ApplePay single-button payment component. Credentials/configuration are supplied by the application.
 */
import { Component } from '../../core/index.ts';
import { PaymentButton } from './PaymentButton.ts';
import { PaymentProviders } from './Providers.ts';

export namespace ApplePay
{
    export namespace Types { export type Mode=PaymentButton.Types.PaymentMode; }
    export namespace Interfaces { export type ApplePayOptions=PaymentButton.Interfaces.PaymentButtonOptions; }
    export const Provider=PaymentProviders.ApplePay;

    @Component('arianna-apple-pay',PaymentButton.Styles,{Shadow:false,Attributes:['theme','amount','currency','reference','customer-email','label','target','mode','disabled']})
    export class ApplePay extends PaymentButton.PaymentButton
    {
        protected get Provider(){return Provider;}
    }
}

export default ApplePay;
