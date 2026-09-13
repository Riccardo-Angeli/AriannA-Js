/** @module components/payments/MercadoPago
 * @description MercadoPago single-button payment component. Credentials/configuration are supplied by the application.
 */
import { Component } from '../../core/index.ts';
import { PaymentButton } from './PaymentButton.ts';
import { PaymentProviders } from './Providers.ts';

export namespace MercadoPago
{
    export namespace Types { export type Mode=PaymentButton.Types.PaymentMode; }
    export namespace Interfaces { export type MercadoPagoOptions=PaymentButton.Interfaces.PaymentButtonOptions; }
    export const Provider=PaymentProviders.MercadoPago;

    @Component('arianna-mercado-pago',PaymentButton.Styles,{Shadow:false,Attributes:['theme','amount','currency','reference','customer-email','label','target','mode','disabled']})
    export class MercadoPago extends PaymentButton.PaymentButton
    {
        protected get Provider(){return Provider;}
    }
}

export default MercadoPago;
