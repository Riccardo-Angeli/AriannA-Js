import { Component } from '../../../core/index.ts'; import { MobileElement, MobileStyles, type AttributeOptions } from '../core/Base.ts';
export interface SheetAction{Id:string;Label:string;Destructive?:boolean;Disabled?:boolean} export interface ActionSheetOptions extends AttributeOptions{Title?:string;Actions?:SheetAction[]}
@Component('arianna-action-sheet',MobileStyles,{Shadow:false,Attributes:['open','title','theme']})
export class ActionSheet extends MobileElement
{
    Actions:SheetAction[]=[];constructor(options:ActionSheetOptions={}){super();this.Actions=options.Actions??[];this.Apply({Title:options.Title,Theme:options.Theme})}
    onConnected(){this.Initialize();this.Render()} onAttributeChanged(name:string,old:string|null,value:string|null){if(this.AttributeChanged(name,old,value,['open','title','theme']))this.Render();}
    Open(){this.setAttribute('open','');this.Render()} Close(){this.removeAttribute('open');this.Render()}
    protected Render(){this.hidden=!this.hasAttribute('open');this.classList.add('MobilePanel');this.style.cssText+='position:fixed;left:12px;right:12px;bottom:max(12px,env(safe-area-inset-bottom));z-index:1000';const title=document.createElement('strong');title.textContent=this.getAttribute('title')??'';const list=document.createElement('div');list.style.cssText='display:grid;gap:8px;margin-top:10px';for(const action of (this.Actions??[])){const b=document.createElement('button');b.className='MobileButton';b.textContent=action.Label;b.disabled=action.Disabled??false;if(action.Destructive)b.style.background='#c93645';b.onclick=()=>{this.Emit('arianna:action',{Id:action.Id});this.Close()};list.append(b)}this.replaceChildren(title,list)}
}
@Component('arianna-bottom-sheet',MobileStyles,{Shadow:false,Attributes:['open','title','theme']})
export class BottomSheet extends ActionSheet{}

