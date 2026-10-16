import { Component } from '../../../core/index.ts';import { MobileElement,MobileStyles,type AttributeOptions } from '../core/Base.ts';
export interface MobileListItem{Id:string;Title:string;Subtitle?:string;Icon?:string;Accessory?:string;Disabled?:boolean}
@Component('arianna-mobile-list',MobileStyles,{Shadow:false,Attributes:['selected','theme','platform']})
export class MobileList extends MobileElement
{
    Items:MobileListItem[]=[];constructor(o:AttributeOptions&{Items?:MobileListItem[]}={}){super();this.Items=o.Items??[];this.Apply(o)}onConnected(){this.Initialize();this.Render()}
    set Data(items:MobileListItem[]){this.Items=items;this.Render()}get Data(){return this.Items??[]}
    private Render(){this.style.cssText+='display:grid;overflow:auto';this.replaceChildren(...(this.Items??[]).map(item=>{const row=document.createElement('button');row.type='button';row.disabled=!!item.Disabled;row.style.cssText='display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:12px;background:transparent;color:var(--mobile-text);border:0;border-bottom:1px solid var(--mobile-border);text-align:left';const icon=document.createElement('span'),text=document.createElement('span'),accessory=document.createElement('span');icon.textContent=item.Icon??'';text.innerHTML=`<strong></strong><small style="display:block;color:var(--mobile-muted)"></small>`;(text.querySelector('strong')!).textContent=item.Title;(text.querySelector('small')!).textContent=item.Subtitle??'';accessory.textContent=item.Accessory??'›';row.append(icon,text,accessory);row.onclick=()=>{this.setAttribute('selected',item.Id);this.Emit('arianna:select',{Item:item})};return row}))}
}
