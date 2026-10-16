import { Component } from '../../../core/index.ts';import { MobileElement,MobileStyles,type AttributeOptions } from '../core/Base.ts';
@Component('arianna-mobile-text-field',MobileStyles,{Shadow:false,Attributes:['label','value','placeholder','type','multiline','disabled','theme','platform']})
export class MobileTextField extends MobileElement
{
    constructor(o:AttributeOptions={}){super();this.Apply(o)} onConnected(){this.Initialize();this.Render()}
    onAttributeChanged(name:string,old:string|null,value:string|null){if(this.AttributeChanged(name,old,value,['label','placeholder','type','multiline','disabled']))this.Render()}
    private Render(){const label=document.createElement('label');label.style.cssText='display:grid;gap:5px';if(this.hasAttribute('label')){const caption=document.createElement('span');caption.textContent=this.getAttribute('label');label.append(caption)}const input=this.hasAttribute('multiline')?document.createElement('textarea'):document.createElement('input');input.className='MobileField';if(input instanceof HTMLInputElement)input.type=this.getAttribute('type')??'text';input.placeholder=this.getAttribute('placeholder')??'';input.value=this.getAttribute('value')??'';input.disabled=this.hasAttribute('disabled');input.oninput=()=>{this.setAttribute('value',input.value);this.Emit('arianna:input',{Value:input.value})};input.onchange=()=>this.Emit('arianna:change',{Value:input.value});label.append(input);this.replaceChildren(label)}
    get Value(){return this.getAttribute('value')??''}set Value(value:string){this.setAttribute('value',value)}
}
