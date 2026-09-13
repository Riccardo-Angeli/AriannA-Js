/** @module components/payments/Wero
 * @description Wero single-button payment component. Credentials/configuration are supplied by the application.
 */
import { Component } from '../../core/index.ts';
import { PaymentButton } from './PaymentButton.ts';
import { PaymentProviders } from './Providers.ts';

export namespace Wero
{
    export namespace Types { export type Mode=PaymentButton.Types.PaymentMode; }
    export namespace Interfaces { export type WeroOptions=PaymentButton.Interfaces.PaymentButtonOptions; }
    export const Provider=PaymentProviders.Wero;

    @Component('arianna-wero',PaymentButton.Styles,{Shadow:false,Attributes:['theme','amount','currency','reference','customer-email','label','target','mode','disabled']})
    export class Wero extends PaymentButton.PaymentButton
    {
        protected get Provider(){return Provider;}
    }
}

export default Wero;
