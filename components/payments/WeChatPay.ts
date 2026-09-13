/** @module components/payments/WeChatPay
 * @description WeChatPay single-button payment component. Credentials/configuration are supplied by the application.
 */
import { Component } from '../../core/index.ts';
import { PaymentButton } from './PaymentButton.ts';
import { PaymentProviders } from './Providers.ts';

export namespace WeChatPay
{
    export namespace Types { export type Mode=PaymentButton.Types.PaymentMode; }
    export namespace Interfaces { export type WeChatPayOptions=PaymentButton.Interfaces.PaymentButtonOptions; }
    export const Provider=PaymentProviders.WeChatPay;

    @Component('arianna-wechat-pay',PaymentButton.Styles,{Shadow:false,Attributes:['theme','amount','currency','reference','customer-email','label','target','mode','disabled']})
    export class WeChatPay extends PaymentButton.PaymentButton
    {
        protected get Provider(){return Provider;}
    }
}

export default WeChatPay;
