/**
 * @module components/payments/Ideal
 * @author Riccardo Angeli
 * @version 2.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 */

import { HostedPayment } from './HostedPayment.ts';
import { PaymentProviders } from './Providers.ts';
declare const Component: any;

export namespace Ideal
{
    export type IdealOptions = HostedPayment.HostedPaymentOptions;
    export const Provider = PaymentProviders.Ideal;

    @Component('arianna-ideal', {}, { shadow:false, Attributes:['amount','currency','reference','checkout-url','api-url','api-token','return-url','customer-email','target'] })
    export class Ideal extends HostedPayment.HostedPayment
    {
        onConnected()
        {
            if(!this.getProvider()) this.setProvider(Provider);
            super.onConnected();
        }
    }
}

export default Ideal;
