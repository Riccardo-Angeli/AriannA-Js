/** Independent tool-window bar shared by Dockable panels in one workspace. */
import { Component, Templates } from '../../core/index.ts';
export type ToolBarPosition='top'|'bottom'|'left'|'right';
export interface ToolBarOptions {container?:HTMLElement;position?:ToolBarPosition;theme?:'dark'|'light';}
export interface ToolBarItem {id:string;title:string;icon?:string;minimize:()=>void;restore:()=>void;minimized:()=>boolean;}
const bars=new WeakMap<HTMLElement,ToolBar>();
const sides:ToolBarPosition[]=['top','bottom','left','right'];
namespace Implementation {
@Component('arianna-tool-bar',{}, {Shadow:false,Attributes:['position','theme'],Properties:['Position','Items']})
export class ToolBar extends HTMLElement {
    public template=Templates.Template.Html``;
    private entries=new Map<string,{item:ToolBarItem;button:HTMLButtonElement}>();
    private container:HTMLElement|null=null;
    private side:ToolBarPosition='left';
    private automatic=false;
    private closeMenu:(()=>void)|null=null;
    private buttons:HTMLDivElement|null=null;
    private menuButton:HTMLButtonElement|null=null;
    private originalPosition:string|null=null;
    private layoutKey:string|null=null;
    private tabKeys=new WeakMap<HTMLButtonElement,string>();
    constructor(options:ToolBarOptions={}){super();this.configure(options);}
    public static For(container:HTMLElement,options:Omit<ToolBarOptions,'container'>={}):ToolBar {
        const existing=bars.get(container);if(existing)return existing;
        const bar=new ToolBar();bar.automatic=true;bar.configure({...options,container});return bar;
    }
    public configure(options:ToolBarOptions):this {
        if(options.position!==undefined&&!sides.includes(options.position))throw new TypeError('Invalid ToolBar position');
        if(options.theme&&this.getAttribute('theme')!==options.theme)this.setAttribute('theme',options.theme);
        if(options.position){this.side=options.position;if(this.getAttribute('position')!==options.position)this.setAttribute('position',options.position);}
        if(options.container)this.attach(options.container);else if(this.container)this.layout();return this;
    }
    public onMount():void {if(!this.container&&this.parentElement)this.attach(this.parentElement);}
    public onUnmount():void {this.destroy();}
    public onAttributeChanged(name:string):void {if(name!=='position'&&name!=='theme')return;if(name==='position'){const value=this.getAttribute(name) as ToolBarPosition;if(sides.includes(value))this.side=value;}if(this.container)this.layout();}
    public attach(container:HTMLElement):this {
        if(this.container===container){this.layout();return this;}
        if(this.container)throw new Error('Detach ToolBar before changing workspace');
        if(bars.has(container)&&bars.get(container)!==this)throw new Error('This workspace already has a ToolBar');
        const value=this.getAttribute('position') as ToolBarPosition;if(sides.includes(value))this.side=value;
        if(this.getAttribute('position')!==this.side)this.setAttribute('position',this.side);this.container=container;bars.set(container,this);
        if(getComputedStyle(container).position==='static'){this.originalPosition=container.style.position;container.style.position='relative';}
        this.className='ToolBar';container.append(this);this.build();this.layout();return this;
    }
    public get Position():ToolBarPosition{return this.side;}
    public set Position(value:ToolBarPosition){if(!sides.includes(value))throw new TypeError('Invalid ToolBar position');this.side=value;if(this.getAttribute('position')!==value)this.setAttribute('position',value);this.closeMenu?.();this.layout();}
    /** Snapshot preserves insertion order. Entries contain the panel callbacks. */
    public get Items():ReadonlyArray<ToolBarItem>{return Array.from(this.entries.values(),entry=>entry.item);}
    public get Insets():{top:number;bottom:number;left:number;right:number}{return{top:this.side==='top'?34:0,bottom:this.side==='bottom'?34:0,left:this.side==='left'?34:0,right:this.side==='right'?34:0};}
    public register(item:ToolBarItem):this {
        if(!this.container)throw new Error('Attach ToolBar to a workspace first');
        const prior=this.entries.get(item.id);if(prior){prior.item=item;this.refresh();return this;}
        const button=this.ownerDocument.createElement('button');button.type='button';button.className='ToolBar-Tab';button.textContent=item.title;button.setAttribute('aria-label',item.title);button.title=item.title;
        button.onclick=()=>{const current=this.entries.get(item.id)?.item;if(!current)return;current.minimized()?current.restore():current.minimize();this.refresh();};
        this.entries.set(item.id,{item,button});this.buttons!.append(button);this.refresh();return this;
    }
    public unregister(id:string):this {const entry=this.entries.get(id);if(entry){entry.button.onclick=null;entry.button.remove();this.entries.delete(id);}if(this.automatic&&!this.entries.size)this.destroy();return this;}
    public minimizeAll():this {for(const entry of this.entries.values())entry.item.minimize();this.refresh();return this;}
    public restoreAll():this {for(const entry of this.entries.values())entry.item.restore();this.refresh();return this;}
    public refresh():void {const light=this.getAttribute('theme')==='light';for(const {item,button}of this.entries.values()){const active=!item.minimized(),key=JSON.stringify([active,light,item.title,item.icon]);if(this.tabKeys.get(button)===key)continue;this.tabKeys.set(button,key);if(button.getAttribute('aria-pressed')!==String(active))button.setAttribute('aria-pressed',String(active));button.setAttribute('aria-label',item.title);button.textContent=item.title;button.title=item.title+(active?' · Minimize':' · Restore');Object.assign(button.style,{background:active?'linear-gradient(180deg,#ff4dad,#e40c88,#b90769)':'transparent',color:active?'white':light?'#30343a':'#bcc5ce'});}}

    private build():void {
        const doc=this.ownerDocument;this.buttons=doc.createElement('div');this.buttons.className='ToolBar-Items';this.buttons.style.cssText='display:flex;gap:3px;flex:1;min-width:0;min-height:0;overflow:auto;scrollbar-width:thin';
        this.menuButton=doc.createElement('button');this.menuButton.type='button';this.menuButton.textContent='⋮';this.menuButton.title='Tool window bar options';this.menuButton.setAttribute('aria-label','Tool window bar options');this.menuButton.setAttribute('aria-haspopup','menu');this.menuButton.setAttribute('aria-expanded','false');this.menuButton.style.cssText='flex:0 0 26px;width:26px;height:26px;border:1px solid #15181a;border-radius:4px;font:700 18px system-ui;cursor:pointer';
        const style=doc.createElement('style');style.textContent='.ToolBar .ToolBar-Tab{flex:0 0 110px;width:110px;height:26px;min-width:110px;padding:0 8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:0;border-radius:4px;font:600 11px system-ui;cursor:pointer}.ToolBar[position=left] .ToolBar-Tab,.ToolBar[position=right] .ToolBar-Tab{writing-mode:vertical-rl;flex-basis:110px;width:26px;min-width:26px;height:110px;padding:8px 0}.ToolBar button:focus-visible{outline:2px solid #e40c88;outline-offset:-2px}';
        this.append(style,this.buttons,this.menuButton);this.menuButton.onclick=()=>this.closeMenu?this.closeMenu():this.openMenu();
    }
    private layout():void {
        if(!this.container||!this.buttons||!this.menuButton)return;
        const vertical=this.side==='left'||this.side==='right',light=this.getAttribute('theme')==='light';
        const area=this.container.getBoundingClientRect(),canvas=this.container.matches('.Canvas2D,arianna-canvas-2d')?this.container:this.container.querySelector<HTMLElement>('.Canvas2D,arianna-canvas-2d'),stage=canvas?.querySelector<HTMLElement>('.Canvas2D-Stage'),rect=stage?.getBoundingClientRect();const top=rect&&area.height>0?Math.max(0,rect.top-area.top):0,bottom=rect&&area.height>0?Math.max(0,area.bottom-rect.bottom):0;
        const key=this.side+'|'+light+'|'+(this.container===this.ownerDocument.body)+'|'+top+'|'+bottom;if(this.layoutKey===key){this.refresh();return;}this.layoutKey=key;
        this.style.cssText='box-sizing:border-box;position:'+(this.container===this.ownerDocument.body?'fixed':'absolute')+';display:flex;gap:3px;padding:3px;z-index:100001;overflow:hidden;border:1px solid '+(light?'#bfc3c9':'#44474e')+';background:'+(light?'#e5e7eb':'#25292d')+';border-radius:5px';
        Object.assign(this.style,{flexDirection:vertical?'column':'row',left:this.side==='right'?'auto':'0px',right:this.side==='left'?'auto':'0px',top:this.side==='bottom'?'auto':top+'px',bottom:this.side==='top'?'auto':bottom+'px',width:vertical?'34px':'auto',height:vertical?'auto':'34px'});
        this.buttons.style.flexDirection=vertical?'column':'row';Object.assign(this.menuButton.style,{background:light?'linear-gradient(180deg,#f9fbfc,#e0e4e7)':'linear-gradient(180deg,#444a50,#30353a)',color:light?'#30343a':'white',borderColor:light?'#bfc3c9':'#15181a'});this.refresh();
        this.container.dispatchEvent(new CustomEvent('arianna:toolbar-layout',{detail:{bar:this,position:this.side,insets:this.Insets}}));
    }
    private openMenu():void {
        this.closeMenu?.();const doc=this.ownerDocument,light=this.getAttribute('theme')==='light',menu=doc.createElement('div');menu.setAttribute('role','menu');menu.className='ToolBar-Menu';menu.style.cssText='position:fixed;z-index:2147483647;display:grid;gap:3px;padding:5px;border:1px solid #555961;border-radius:6px;background:'+(light?'#eef0f2':'#292d31')+';box-shadow:0 12px 32px #0008';
        const previous=doc.activeElement as HTMLElement|null;const controller=new AbortController();
        const close=()=>{controller.abort();menu.remove();this.menuButton?.setAttribute('aria-expanded','false');this.closeMenu=null;if(previous?.isConnected)previous.focus({preventScroll:true});};this.closeMenu=close;
        const actions:[string,()=>void,boolean][]=[...sides.map(side=>['Bar '+side[0].toUpperCase()+side.slice(1),()=>{this.Position=side;},this.side===side] as [string,()=>void,boolean]),['Minimize all',()=>this.minimizeAll(),false],['Restore all',()=>this.restoreAll(),false]];
        const buttons=actions.map(([title,action,active])=>{const button=doc.createElement('button');button.type='button';button.textContent=title;button.setAttribute('role',title.startsWith('Bar ')?'menuitemradio':'menuitem');if(title.startsWith('Bar '))button.setAttribute('aria-checked',String(active));button.style.cssText='text-align:left;padding:7px 12px;border:0;border-radius:4px;cursor:pointer;color:'+(active?'white':light?'#30343a':'white')+';background:'+(active?'linear-gradient(180deg,#ff4dad,#e40c88,#b90769)':light?'#e0e4e7':'#343a3f');button.onclick=()=>{action();close();};menu.append(button);return button;});
        doc.body.append(menu);const anchor=this.menuButton!.getBoundingClientRect(),rect=menu.getBoundingClientRect(),view=doc.defaultView;menu.style.left=Math.max(0,Math.min(anchor.left,(view?.innerWidth??1000)-rect.width))+'px';menu.style.top=Math.max(0,Math.min(anchor.bottom,(view?.innerHeight??800)-rect.height))+'px';this.menuButton!.setAttribute('aria-expanded','true');
        doc.addEventListener('pointerdown',event=>{if(!menu.contains(event.target as Node)&&!this.menuButton!.contains(event.target as Node))close();},{capture:true,signal:controller.signal});
        doc.addEventListener('keydown',event=>{if(event.key==='Escape'||event.key==='Tab')close();else if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();const i=buttons.indexOf(doc.activeElement as HTMLButtonElement);buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();}},{capture:true,signal:controller.signal});doc.addEventListener('scroll',close,{capture:true,signal:controller.signal});view?.addEventListener('resize',close,{signal:controller.signal});buttons[0].focus();
    }
    public destroy():void {this.closeMenu?.();for(const {button}of this.entries.values())button.onclick=null;this.entries.clear();if(this.menuButton)this.menuButton.onclick=null;const parent=this.container;if(parent){bars.delete(parent);if(this.originalPosition!==null&&parent.style.position==='relative')parent.style.position=this.originalPosition;this.container=null;this.remove();parent.dispatchEvent(new CustomEvent('arianna:toolbar-layout'));}this.buttons=null;this.menuButton=null;this.layoutKey=null;this.tabKeys=new WeakMap();this.originalPosition=null;this.replaceChildren();}
}
}
export type ToolBar=Implementation.ToolBar;

// Named/default exports share the same options-preserving constructor.
// Preserve constructor options when Core allocates the decorated custom element.
const AllocateToolBar=Implementation.ToolBar;
const ToolBarConstructor=new Proxy(AllocateToolBar,{construct(constructor,args,newTarget){const instance=Reflect.construct(constructor,[],newTarget===ToolBarConstructor?constructor:newTarget) as ToolBar;instance.configure(args[0]??{});return instance;}});
export const ToolBar=ToolBarConstructor;
export default ToolBar;
