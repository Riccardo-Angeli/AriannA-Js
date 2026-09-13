/**
 * @module components/payments/HostedPayment
 * @description Backward-compatible generic hosted-payment button. New provider
 * components extend PaymentButton directly.
 */
import { Component } from '../../core/index.ts';
import { PaymentButton } from './PaymentButton.ts';
import { PaymentProviders, type PaymentProviderConfig } from './Providers.ts';

export namespace HostedPayment
{
    export type HostedPaymentOptions=PaymentButton.Interfaces.PaymentButtonOptions;
    export type PaymentRequest=PaymentButton.Interfaces.PaymentRequest;
    export type PaymentResult=PaymentButton.Interfaces.PaymentResult;

    const Providers=new WeakMap<HTMLElement,PaymentProviderConfig|null>();

    @Component('arianna-hosted-payment',PaymentButton.Styles,{Shadow:false,Attributes:['theme','provider','amount','currency','reference','customer-email','label','target','mode','disabled']})
    export class HostedPayment extends PaymentButton.PaymentButton
    {
        protected get Provider():PaymentProviderConfig|null
        {
            return Providers.get(this)??PaymentProviders.Get(this.getAttribute('provider'))??null;
        }
        public setProvider(provider:PaymentProviderConfig):this{Providers.set(this,provider);this.setAttribute('provider',provider.id);if(this.isConnected)this.onConnected();return this;}
        public getProvider():PaymentProviderConfig|null{return this.Provider;}
    }
}

export type HostedPaymentOptions=HostedPayment.HostedPaymentOptions;
export type PaymentRequest=HostedPayment.PaymentRequest;
export type PaymentResult=HostedPayment.PaymentResult;
export default HostedPayment.HostedPayment;
