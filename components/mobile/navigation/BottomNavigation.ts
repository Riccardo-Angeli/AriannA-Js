import { Component } from '../../../core/index.ts'; import { MobileElement, MobileStyles, type AttributeOptions } from '../core/Base.ts';
export interface BottomNavigationItem { Id:string; Label:string; Icon?:string; }
export interface BottomNavigationOptions extends AttributeOptions { Items?: BottomNavigationItem[]; Selected?: string; }
@Component('arianna-bottom-navigation',MobileStyles,{Shadow:false,Attributes:['selected','theme']})
export class BottomNavigation extends MobileElement
{
    Items:BottomNavigationItem[]=[];constructor(options:BottomNavigationOptions={}){super();this.Items=options.Items??[];this.Apply({Selected:options.Selected,Theme:options.Theme})}
    onConnected(){this.Initialize();this.Render()} onAttributeChanged(name:string,old:string|null,value:string|null){if(this.AttributeChanged(name,old,value,['selected','theme']))this.Render();}
    private Render(){this.classList.add('MobileBar');this.style.cssText+='padding-bottom:max(8px,env(safe-area-inset-bottom));justify-content:space-around';this.replaceChildren(...(this.Items??[]).map(item=>{const b=document.createElement('button');b.className='MobileButton';b.dataset.id=item.Id;b.style.background=item.Id===this.Selected?'linear-gradient(135deg,var(--mobile-primary),#ff58b2)':'transparent';b.style.color=item.Id===this.Selected?'#fff':'var(--mobile-muted)';b.textContent=[item.Icon,item.Label].filter(Boolean).join(' ');b.onclick=()=>{this.Selected=item.Id;this.Emit('arianna:change',{Id:item.Id});};return b}))}
    get Selected(){return this.getAttribute('selected')??''}set Selected(v:string){this.setAttribute('selected',v)}
}

