import { Component } from '../../core/index.ts'; import { MobileElement, MobileStyles } from './Base.ts';
@Component('arianna-keyboard-avoiding-view',MobileStyles,{Shadow:false,Attributes:['theme']})
export class KeyboardAvoidingView extends MobileElement
{
    #dispose?:()=>void;onConnected(){this.Initialize();const viewport=visualViewport;const update=()=>{const h=viewport?Math.max(0,innerHeight-viewport.height-viewport.offsetTop):0;this.style.paddingBottom=`${h}px`;this.style.transition='padding-bottom .18s ease';this.toggleAttribute('keyboard-visible',h>80)};viewport?.addEventListener('resize',update);viewport?.addEventListener('scroll',update);this.#dispose=()=>{viewport?.removeEventListener('resize',update);viewport?.removeEventListener('scroll',update)};update()}onUnmount(){this.#dispose?.()}
}

