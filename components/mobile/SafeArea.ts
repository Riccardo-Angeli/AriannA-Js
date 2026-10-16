import { Component } from '../../core/index.ts'; import { MobileElement, MobileStyles, type AttributeOptions } from './Base.ts';
export interface SafeAreaOptions extends AttributeOptions { Top?: boolean; Right?: boolean; Bottom?: boolean; Left?: boolean; }
@Component('arianna-safe-area',MobileStyles,{Shadow:false,Attributes:['top','right','bottom','left','theme']})
export class SafeArea extends MobileElement
{
    constructor(options: SafeAreaOptions={}) { super(); this.Apply(options); }
    onConnected(){this.Initialize();this.style.paddingTop=this.hasAttribute('top')?'env(safe-area-inset-top)':'';this.style.paddingRight=this.hasAttribute('right')?'env(safe-area-inset-right)':'';this.style.paddingBottom=this.hasAttribute('bottom')?'env(safe-area-inset-bottom)':'';this.style.paddingLeft=this.hasAttribute('left')?'env(safe-area-inset-left)':'';}
    onAttributeChanged(){if(this.isConnected)this.onConnected();}
}

