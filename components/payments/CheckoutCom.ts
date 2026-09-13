/** @module components/payments/CheckoutCom
 * @description CheckoutCom single-button payment component. Credentials/configuration are supplied by the application.
 */
import { Component } from '../../core/index.ts';
import { PaymentButton } from './PaymentButton.ts';
import { PaymentProviders } from './Providers.ts';

export namespace CheckoutCom
{
    export namespace Types { export type Mode=PaymentButton.Types.PaymentMode; }
    export namespace Interfaces { export type CheckoutComOptions=PaymentButton.Interfaces.PaymentButtonOptions; }
    export const Provider=PaymentProviders.CheckoutCom;

    @Component('arianna-checkout-com',PaymentButton.Styles,{Shadow:false,Attributes:['theme','amount','currency','reference','customer-email','label','target','mode','disabled']})
    export class CheckoutCom extends PaymentButton.PaymentButton
    {
        protected get Provider(){return Provider;}
    }
}

export default CheckoutCom;
