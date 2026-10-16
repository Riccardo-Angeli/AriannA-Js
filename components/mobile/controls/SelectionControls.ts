import { Component } from '../../../core/index.ts';
import { MobileElement,MobileStyles,type AttributeOptions } from '../core/Base.ts';

abstract class CheckControl extends MobileElement
{
    protected get Type():'checkbox'|'radio'{return this.localName==='arianna-mobile-radio'?'radio':'checkbox'}
    constructor(options:AttributeOptions={}){super();this.Apply(options)}
    onConnected(){this.Initialize();this.Render()}
    onAttributeChanged(name:string,old:string|null,value:string|null){if(this.AttributeChanged(name,old,value,['checked','label','name','value','disabled']))this.Render()}
    private Render(){const label=document.createElement('label'),input=document.createElement('input');label.style.cssText='display:flex;align-items:center;gap:9px;min-height:40px';input.type=this.Type;input.name=this.getAttribute('name')??'';input.value=this.getAttribute('value')??'on';input.checked=this.hasAttribute('checked');input.disabled=this.hasAttribute('disabled');input.onchange=()=>{this.toggleAttribute('checked',input.checked);this.Emit('arianna:change',{Checked:input.checked,Value:input.value})};label.append(input,document.createTextNode(this.getAttribute('label')??''));this.replaceChildren(label)}
}
@Component('arianna-mobile-checkbox',MobileStyles,{Shadow:false,Attributes:['checked','label','name','value','disabled','theme','platform']}) export class MobileCheckbox extends CheckControl{}
@Component('arianna-mobile-radio',MobileStyles,{Shadow:false,Attributes:['checked','label','name','value','disabled','theme','platform']}) export class MobileRadio extends CheckControl{}
