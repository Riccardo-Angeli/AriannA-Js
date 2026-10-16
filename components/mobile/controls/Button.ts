import { Component } from '../../../core/index.ts';
import { MobileElement, MobileStyles, type AttributeOptions } from '../core/Base.ts';

export interface MobileButtonOptions extends AttributeOptions { Label?:string; Variant?:'filled'|'tonal'|'outlined'|'text'; Disabled?:boolean; }

@Component('arianna-mobile-button',MobileStyles,{Shadow:false,Attributes:['label','variant','disabled','theme','platform']})
export class MobileButton extends MobileElement
{
    constructor(options:MobileButtonOptions={}){super();this.Apply(options)}
    onConnected(){this.Initialize();this.Render()}
    onAttributeChanged(name:string,old:string|null,value:string|null){if(this.AttributeChanged(name,old,value,['label','variant','disabled']))this.Render()}
    private Render(){const button=document.createElement('button');button.type='button';button.className='MobileButton';button.textContent=this.getAttribute('label')??this.textContent??'Button';button.disabled=this.hasAttribute('disabled');button.dataset.variant=this.getAttribute('variant')??'filled';button.onclick=()=>this.Emit('arianna:press');this.replaceChildren(button)}
}

@Component('arianna-mobile-icon-button',MobileStyles,{Shadow:false,Attributes:['icon','label','disabled','theme','platform']})
export class MobileIconButton extends MobileElement
{
    constructor(options:AttributeOptions={}){super();this.Apply(options)}
    onConnected(){this.Initialize();const button=document.createElement('button');button.type='button';button.className='MobileButton';button.style.cssText='width:40px;height:40px;padding:0;border-radius:50%';button.textContent=this.getAttribute('icon')??'•';button.title=this.getAttribute('label')??'';button.disabled=this.hasAttribute('disabled');button.onclick=()=>this.Emit('arianna:press');this.replaceChildren(button)}
}

@Component('arianna-floating-action-button',MobileStyles,{Shadow:false,Attributes:['icon','label','extended','theme','platform']})
export class FloatingActionButton extends MobileElement
{
    constructor(options:AttributeOptions={}){super();this.Apply(options)}
    onConnected(){this.Initialize();const button=document.createElement('button');button.type='button';button.className='MobileButton';button.style.cssText='min-width:56px;height:56px;border-radius:18px;box-shadow:0 8px 22px rgba(0,0,0,.35)';button.textContent=[this.getAttribute('icon')??'+',this.hasAttribute('extended')?this.getAttribute('label'):null].filter(Boolean).join(' ');button.onclick=()=>this.Emit('arianna:press');this.replaceChildren(button)}
}
