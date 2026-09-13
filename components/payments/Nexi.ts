/** @module components/payments/Nexi
 * @description Nexi single-button payment component. Credentials/configuration are supplied by the application.
 */
import { Component } from '../../core/index.ts';
import { PaymentButton } from './PaymentButton.ts';
import { PaymentProviders } from './Providers.ts';

export namespace Nexi
{
    export namespace Types { export type Mode=PaymentButton.Types.PaymentMode; }
    export namespace Interfaces { export type NexiOptions=PaymentButton.Interfaces.PaymentButtonOptions; }
    export const Provider=PaymentProviders.Nexi;

    @Component('arianna-nexi',PaymentButton.Styles,{Shadow:false,Attributes:['theme','amount','currency','reference','customer-email','label','target','mode','disabled']})
    export class Nexi extends PaymentButton.PaymentButton
    {
        protected get Provider(){return Provider;}
    }
}

export default Nexi;
