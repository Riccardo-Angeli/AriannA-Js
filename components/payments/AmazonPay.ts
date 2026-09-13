/** @module components/payments/AmazonPay
 * @description AmazonPay single-button payment component. Credentials/configuration are supplied by the application.
 */
import { Component } from '../../core/index.ts';
import { PaymentButton } from './PaymentButton.ts';
import { PaymentProviders } from './Providers.ts';

export namespace AmazonPay
{
    export namespace Types { export type Mode=PaymentButton.Types.PaymentMode; }
    export namespace Interfaces { export type AmazonPayOptions=PaymentButton.Interfaces.PaymentButtonOptions; }
    export const Provider=PaymentProviders.AmazonPay;

    @Component('arianna-amazon-pay',PaymentButton.Styles,{Shadow:false,Attributes:['theme','amount','currency','reference','customer-email','label','target','mode','disabled']})
    export class AmazonPay extends PaymentButton.PaymentButton
    {
        protected get Provider(){return Provider;}
    }
}

export default AmazonPay;
