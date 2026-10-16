import { Component } from '../../../core/index.ts';import { MobileElement,MobileStyles,type AttributeOptions } from '../core/Base.ts';
export interface DialogAction{Id:string;Label:string;Role?:'default'|'cancel'|'destructive'}
@Component('arianna-mobile-dialog',MobileStyles,{Shadow:false,Attributes:['open','title','message','modal','theme','platform']})
export class MobileDialog extends MobileElement
{
    Actions:DialogAction[]=[];constructor(o:AttributeOptions&{Actions?:DialogAction[]}={}){super();this.Actions=o.Actions??[];this.Apply(o)}onConnected(){this.Initialize();this.Render()}onAttributeChanged(name:string,old:string|null,value:string|null){if(this.AttributeChanged(name,old,value,['open','title','message']))this.Render()}
    Open(){this.setAttribute('open','')}Close(){this.removeAttribute('open')}
    private Render(){this.hidden=!this.hasAttribute('open');this.classList.add('MobilePanel');this.style.cssText+='position:fixed;inset:50% auto auto 50%;transform:translate(-50%,-50%);z-index:1100;min-width:min(360px,calc(100vw - 32px))';const title=document.createElement('strong'),message=document.createElement('p'),actions=document.createElement('div');title.textContent=this.getAttribute('title')??'';message.textContent=this.getAttribute('message')??'';actions.style.cssText='display:flex;justify-content:flex-end;gap:8px';for(const item of this.Actions??[]){const button=document.createElement('button');button.className='MobileButton';button.textContent=item.Label;if(item.Role==='destructive')button.style.background='#c93645';button.onclick=()=>{this.Emit('arianna:action',{Id:item.Id});this.Close()};actions.append(button)}this.replaceChildren(title,message,actions)}
}
@Component('arianna-mobile-alert',MobileStyles,{Shadow:false,Attributes:['open','title','message','theme','platform']})export class MobileAlert extends MobileDialog{}
