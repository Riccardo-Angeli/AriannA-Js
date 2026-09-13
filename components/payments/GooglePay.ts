/** @module components/payments/GooglePay
 * @description GooglePay single-button payment component. Credentials/configuration are supplied by the application.
 */
import { Component } from '../../core/index.ts';
import { PaymentButton } from './PaymentButton.ts';
import { PaymentProviders } from './Providers.ts';

export namespace GooglePay
{
    export namespace Types { export type Mode=PaymentButton.Types.PaymentMode; }
    export namespace Interfaces { export type GooglePayOptions=PaymentButton.Interfaces.PaymentButtonOptions; }
    export const Provider=PaymentProviders.GooglePay;

    @Component('arianna-google-pay',PaymentButton.Styles,{Shadow:false,Attributes:['theme','amount','currency','reference','customer-email','label','target','mode','disabled']})
    export class GooglePay extends PaymentButton.PaymentButton
    {
        protected get Provider(){return Provider;}
    }
}

export default GooglePay;
