import { Component } from '../../../core/index.ts'; import { MobileElement, MobileStyles, type AttributeOptions } from '../core/Base.ts';
export interface NavigationBarOptions extends AttributeOptions { Title?: string; Back?: boolean; }
@Component('arianna-navigation-bar',MobileStyles,{Shadow:false,Attributes:['title','back','theme']})
export class NavigationBar extends MobileElement
{
    private Actions: Node[]=[];
    private Captured=false;
    constructor(options: NavigationBarOptions={}){super();this.Apply(options)}
    onConnected(){this.Initialize();if(!this.Captured){this.Actions=[...this.childNodes];this.Captured=true}this.Render()} onAttributeChanged(name:string,old:string|null,value:string|null){if(this.AttributeChanged(name,old,value,['title','back','theme']))this.Render();}
    private Render(){this.classList.add('MobileBar');const back=document.createElement('button');back.className='MobileButton';back.textContent='‹';back.hidden=!this.hasAttribute('back');back.onclick=()=>this.Emit('arianna:back');const title=document.createElement('strong');title.textContent=this.getAttribute('title')??'';title.style.cssText='flex:1;text-align:center';const actions=document.createElement('span');actions.style.minWidth='36px';actions.append(...(this.Actions??[]));this.replaceChildren(back,title,actions)}
}

