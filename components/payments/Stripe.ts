/** @module components/payments/Stripe
 * @description Stripe single-button payment component. Credentials/configuration are supplied by the application.
 */
import { Component } from '../../core/index.ts';
import { PaymentButton } from './PaymentButton.ts';
import { PaymentProviders } from './Providers.ts';

export namespace Stripe
{
    export namespace Types { export type Mode=PaymentButton.Types.PaymentMode; }
    export namespace Interfaces { export type StripeOptions=PaymentButton.Interfaces.PaymentButtonOptions; }
    export const Provider=PaymentProviders.Stripe;

    @Component('arianna-stripe',PaymentButton.Styles,{Shadow:false,Attributes:['theme','amount','currency','reference','customer-email','label','target','mode','disabled']})
    export class Stripe extends PaymentButton.PaymentButton
    {
        protected get Provider(){return Provider;}
    }
}

export default Stripe;
