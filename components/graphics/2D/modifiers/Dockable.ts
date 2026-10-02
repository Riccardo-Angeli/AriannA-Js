/**
 * @module components/graphics/2D/modifiers/Dockable
 * Independent dock/float wrapper. Does not change the wrapped component API.
 * const dockable = new Dockable(myComponent, { container: workspace });
 * dockable.dock('right'); dockable.float(); dockable.destroy();
 */
import { Component, Templates } from '../../../../core/index.ts';
import * as Base from './Base.ts';
import Mover from './Mover.ts';

export namespace Dockable
{
    export type Position = 'top' | 'left' | 'bottom' | 'right' | 'float';
    export interface Options {
        container?: HTMLElement;
        position?: Position;
        title?: string;
        width?: number;
        height?: number;
        theme?: 'dark' | 'light';
        dockWidth?: number;
        dockHeight?: number;
    }
    interface SavedStyle { key:string; value:string; priority:string; }
    interface Record {
        target:HTMLElement; frame:HTMLDivElement; marker:Comment;
        parent:HTMLElement; mover:InstanceType<typeof Mover>;
        menuButton:HTMLButtonElement; mode:Position; floating:{x:number;y:number;width:number;height:number};
        original:SavedStyle[]; releaseParent:()=>void;
    }
    interface Runtime {
        options:Options; records:Map<HTMLElement,Record>; closeMenu:(()=>void)|null;
    }
    const states=new WeakMap<HTMLElement,Runtime>();
    const owners=new WeakMap<HTMLElement,HTMLElement>();
    const parents=new WeakMap<HTMLElement,{count:number;value:string;priority:string}>();
    const positions:Position[]=['top','bottom','right','left','float'];
    let menuSequence=0;
    let dismissMenu:(()=>void)|null=null;
    function state(owner:HTMLElement):Runtime {
        let value=states.get(owner);
        if(!value){value={options:{},records:new Map(),closeMenu:null};states.set(owner,value);}
        return value;
    }
    function valid(value:unknown):value is Position {return positions.includes(value as Position);}
    function size(value:unknown,fallback:number):number {
        const number=Number(value);return Number.isFinite(number)&&number>0?number:fallback;
    }
    function positionParent(parent:HTMLElement):()=>void {
        if(parent===parent.ownerDocument.body)return ()=>{};
        let record=parents.get(parent);
        if(!record&&getComputedStyle(parent).position==='static') {
            record={count:0,value:parent.style.getPropertyValue('position'),priority:parent.style.getPropertyPriority('position')};
            parents.set(parent,record);parent.style.setProperty('position','relative');
        }
        if(!record)return ()=>{};
        record.count++;
        return ()=>{
            if(--record.count!==0)return;
            if(parent.style.position==='relative') {
                record.value?parent.style.setProperty('position',record.value,record.priority):parent.style.removeProperty('position');
            }
            parents.delete(parent);
        };
    }
    @Component('arianna-dockable',{}, {
        Shadow:false,Attributes:['position','title','theme','disabled'],Properties:['Position','Wrapper','Button'],
    })
    export class Dockable extends Base.Modifier2D.Modifier2D
    {
        public template=Templates.Template.Html``;
        protected get EventName():string{return 'dock';}
        constructor(target?:Base.ModifierTargetInput,options:Options={}) {
            super();state(this).options={...options};
            if(options.position!==undefined&&!valid(options.position))throw new TypeError('Invalid Dockable position');
            if(target)this.attach(target);
        }
        private firstRecord():Record|undefined {return state(this).records.get(this.target!)??state(this).records.values().next().value;}
        /** Explicit configuration works for both constructor and markup-created instances. */
        public configure(options:Options):this {
            if(options.position!==undefined&&!valid(options.position))throw new TypeError('Invalid Dockable position');
            Object.assign(state(this).options,options);
            for(const record of state(this).records.values())this.place(record,options.position??record.mode);
            return this;
        }
        public attach(input:Base.ModifierTargetInput,options?:Options):this {
            if(options)this.configure(options);
            super.attach(input);return this;
        }
        /** Actual wrapper for the first target; null before attach. */
        public get Wrapper():HTMLElement|null {return this.firstRecord()?.frame??null;}
        public get Button():HTMLButtonElement|null {return this.firstRecord()?.menuButton??null;}
        public get Position():Position {return this.firstRecord()?.mode??state(this).options.position??'float';}
        public set Position(value:Position) {this.dock(value);}
        public dock(position:Position,target?:HTMLElement):this {
            if(!valid(position))throw new TypeError('Dockable position must be top, left, bottom, right or float');
            const runtime=state(this);runtime.options.position=position;
            for(const record of runtime.records.values()) {
                if(target&&record.target!==target)continue;
                if(record.mode===position)continue;
                if(record.mode==='float')this.captureFloating(record);
                this.Start({position,previous:record.mode},record.target);
                this.place(record,position);
                this.Change({position,wrapper:record.frame},record.target);
                this.End({position,wrapper:record.frame},record.target);
            }
            runtime.closeMenu?.();return this;
        }
        public float(target?:HTMLElement):this{return this.dock('float',target);}
        public onMount():void {
            const options=state(this).options;
            const position=this.getAttribute('position');
            if(valid(position))options.position=position;
            options.title=this.getAttribute('title')??options.title;
            options.theme=this.getAttribute('theme')==='light'?'light':options.theme;
            super.onMount();
        }
        protected applyTo(target:HTMLElement):void {
            const runtime=state(this);
            if(runtime.records.has(target))return;
            if(owners.has(target))throw new Error('This component already has a Dockable wrapper');
            const parent=runtime.options.container??this.containerFor(target);
            if(!(parent instanceof HTMLElement)||parent===target||target.contains(parent))throw new Error('Dockable requires an independent container');
            const doc=target.ownerDocument,rect=target.getBoundingClientRect(),area=parent.getBoundingClientRect();
            const viewport=parent===doc.body;
            const marker=doc.createComment('Dockable: original position');target.before(marker);
            const frame=doc.createElement('div');frame.className='Dockable-Frame';
            const light=runtime.options.theme==='light';
            frame.style.cssText='box-sizing:border-box;display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden;z-index:40;border:1px solid '+(light?'#bfc3c9':'#44474e')+';border-radius:7px;background:'+(light?'#f1f2f4':'#202226')+';color:'+(light?'#30343a':'#e5e8ed')+';box-shadow:0 12px 32px #0006';
            const header=doc.createElement('div');header.className='Dockable-Handle';
            header.style.cssText='box-sizing:border-box;flex:0 0 28px;display:flex;align-items:center;padding:0 9px;border-bottom:1px solid '+(light?'#bfc3c9':'#44474e')+';background:'+(light?'#e5e7eb':'#2a2d32')+';font:700 11px system-ui;user-select:none;touch-action:none';
            const title=doc.createElement('span');title.textContent=runtime.options.title??target.getAttribute('aria-label')??target.getAttribute('title')??target.tagName.toLowerCase();
            title.style.cssText='flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
            const menuButton=doc.createElement('button');menuButton.type='button';menuButton.className='Dockable-MenuButton';menuButton.textContent='⋮';
            menuButton.title='Dock / Float';menuButton.setAttribute('aria-label','Docking options');menuButton.setAttribute('aria-haspopup','menu');menuButton.setAttribute('aria-expanded','false');
            menuButton.style.cssText='flex:0 0 24px;width:24px;height:22px;margin-left:8px;padding:0;border:1px solid '+(light?'#bfc3c9':'#555961')+';border-radius:4px;background:'+(light?'#f1f2f4':'#343a3f')+';color:inherit;font:700 17px/1 system-ui;cursor:pointer;touch-action:manipulation';
            header.append(title,menuButton);
            const original=['width','height','flex','min-width','min-height','position','left','right','top','bottom','margin','overflow'].map(key=>({key,value:target.style.getPropertyValue(key),priority:target.style.getPropertyPriority(key)}));
            target.style.setProperty('position','relative');
            for(const key of ['left','right','top','bottom'])target.style.setProperty(key,'auto');
            target.style.setProperty('margin','0');target.style.setProperty('width','100%');target.style.setProperty('height','0');
            target.style.setProperty('overflow','auto');target.style.setProperty('flex','1 1 auto');target.style.setProperty('min-width','0');target.style.setProperty('min-height','0');
            frame.dataset.theme=light?'light':'dark';
            frame.append(header,target);parent.append(frame);
            const mover=new Mover();mover.handleSelector='.Dockable-Handle';mover.bounds=viewport?'viewport':'parent';mover.attach(frame);
            const record:Record={target,frame,marker,parent,mover,menuButton,mode:'float',original,releaseParent:positionParent(parent),floating:{
                x:viewport?rect.left:rect.left-area.left-parent.clientLeft+parent.scrollLeft,
                y:viewport?rect.top:rect.top-area.top-parent.clientTop+parent.scrollTop,
                width:size(runtime.options.width,rect.width||320),height:size(runtime.options.height,(rect.height||220)+28),
            }};
            runtime.records.set(target,record);owners.set(target,this);
            const context=(event:MouseEvent)=>{
                if(!this.isEnabled||(event.target as Element)?.closest('.Dockable-Frame')!==frame)return;
                event.preventDefault();event.stopPropagation();this.menu(record,event.clientX,event.clientY);
            };
            const stopMove=(event:PointerEvent)=>event.stopPropagation();
            const openMenu=(event:MouseEvent)=>{
                event.stopPropagation();if(!this.isEnabled)return;
                if(menuButton.getAttribute('aria-expanded')==='true'){runtime.closeMenu?.();return;}
                const rect=menuButton.getBoundingClientRect();this.menu(record,rect.left,rect.bottom);
            };
            menuButton.addEventListener('pointerdown',stopMove);
            menuButton.addEventListener('click',openMenu);
            const end=()=>this.captureFloating(record);
            frame.addEventListener('contextmenu',context);frame.addEventListener('arianna:move-end',end);
            const observer=typeof ResizeObserver==='function'?new ResizeObserver(()=>{if(record.mode!=='float')this.place(record,record.mode);}):null;observer?.observe(parent);
            this.cleanups.push(()=>{
                observer?.disconnect();runtime.closeMenu?.();menuButton.removeEventListener('pointerdown',stopMove);menuButton.removeEventListener('click',openMenu);mover.destroy();frame.removeEventListener('contextmenu',context);frame.removeEventListener('arianna:move-end',end);
                // Restore the component only if it still belongs to this wrapper.
                if(target.parentElement===frame) {
                    if(marker.parentNode)marker.replaceWith(target);else parent.append(target);
                    for(const saved of original)saved.value?target.style.setProperty(saved.key,saved.value,saved.priority):target.style.removeProperty(saved.key);
                }
                marker.remove();frame.remove();record.releaseParent();runtime.records.delete(target);owners.delete(target);
            });
            menuButton.disabled=!this.isEnabled;this.place(record,runtime.options.position??'float');
        }
        private captureFloating(record:Record):void {
            if(record.mode!=='float')return;
            record.floating.x=parseFloat(record.frame.style.left)||0;record.floating.y=parseFloat(record.frame.style.top)||0;
            record.floating.width=record.frame.offsetWidth||record.floating.width;record.floating.height=record.frame.offsetHeight||record.floating.height;
        }
        private place(record:Record,position:Position):void {
            record.mode=position;const style=record.frame.style,f=record.floating;
            record.frame.dataset.position=position;
            style.position=record.parent===record.target.ownerDocument.body?'fixed':'absolute';
            style.left='auto';style.top='auto';style.right='auto';style.bottom='auto';style.width='auto';style.height='auto';style.resize=position==='float'?'both':'none';
            const view=record.target.ownerDocument.defaultView;
            const width=record.parent===record.target.ownerDocument.body?(view?.innerWidth??Infinity):(record.parent.clientWidth||Infinity);
            const height=record.parent===record.target.ownerDocument.body?(view?.innerHeight??Infinity):(record.parent.clientHeight||Infinity);
            const options=state(this).options;
            if(position==='float') {const w=Math.min(f.width,width),h=Math.min(f.height,height);style.left=Math.max(0,Math.min(f.x,width-w))+'px';style.top=Math.max(0,Math.min(f.y,height-h))+'px';style.width=w+'px';style.height=h+'px';if(this.isEnabled)record.mover.enable();else record.mover.disable();}
            else {
                record.mover.disable();
                if(position==='top'||position==='bottom') {style.left='0';style.right='0';style[position]='0';style.height=Math.min(size(options.dockHeight,f.height),height)+'px';}
                else {style.top='0';style.bottom='0';style[position]='0';style.width=Math.min(size(options.dockWidth,f.width),width)+'px';}
            }
            (record.frame.firstElementChild as HTMLElement).style.cursor=position==='float'?'grab':'default';
        }
        private menu(record:Record,x:number,y:number):void {
            dismissMenu?.();const runtime=state(this),doc=record.target.ownerDocument;
            const menu=doc.createElement('div');menu.className='Dockable-Menu';menu.id='dockable-menu-'+(++menuSequence);record.menuButton.setAttribute('aria-controls',menu.id);record.menuButton.setAttribute('aria-expanded','true');menu.setAttribute('role','menu');menu.setAttribute('aria-label','Dock');
            menu.style.cssText='position:fixed;z-index:2147483647;min-width:140px;padding:4px;display:grid;gap:2px;background:#292d31;color:#e4e8eb;border:1px solid #44474e;border-radius:6px;box-shadow:0 12px 32px #0008';
            const light=runtime.options.theme==='light';if(light){menu.style.background='#eef0f2';menu.style.color='#25292d';menu.style.borderColor='#b9bec3';}
            const previous=doc.activeElement as HTMLElement|null;
            const buttons=positions.map(position=>{
                const button=doc.createElement('button');button.type='button';button.setAttribute('role','menuitemradio');button.setAttribute('aria-checked',String(record.mode===position));
                button.textContent=position==='float'?'Float':'Dock '+position[0].toUpperCase()+position.slice(1);
                button.style.cssText='text-align:left;border:0;border-radius:4px;padding:7px 10px;font:11px system-ui;cursor:pointer;color:white;background:'+(record.mode===position?'linear-gradient(180deg,#ff4dad,#e40c88,#b90769)':(light?'linear-gradient(180deg,#f9fbfc,#e0e4e7)':'linear-gradient(180deg,#444a50,#30353a)'));
                if(light&&record.mode!==position)button.style.color='#25292d';
                button.onclick=()=>this.dock(position,record.target);menu.append(button);return button;
            });
            const close=()=>{
                menu.remove();record.menuButton.setAttribute('aria-expanded','false');record.menuButton.removeAttribute('aria-controls');doc.removeEventListener('pointerdown',outside,true);doc.removeEventListener('keydown',key,true);
                doc.defaultView?.removeEventListener('resize',close);doc.removeEventListener('scroll',close,true);
                if(runtime.closeMenu===close)runtime.closeMenu=null;if(dismissMenu===close)dismissMenu=null;
                if(previous?.isConnected)previous.focus({preventScroll:true});
            };
            const outside=(event:Event)=>{if(!menu.contains(event.target as Node)&&!record.menuButton.contains(event.target as Node))close();};
            const key=(event:KeyboardEvent)=>{
                if(event.key==='Escape'){event.preventDefault();close();return;}
                if(event.key==='Tab'){close();return;}
                if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
                    event.preventDefault();const current=buttons.indexOf(doc.activeElement as HTMLButtonElement);
                    const index=event.key==='Home'?0:event.key==='End'?buttons.length-1:(current+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;
                    buttons[index].focus();
                }
            };
            doc.body.append(menu);const rect=menu.getBoundingClientRect();
            menu.style.left=Math.max(0,Math.min(x,(doc.defaultView?.innerWidth??x+rect.width)-rect.width))+'px';
            menu.style.top=Math.max(0,Math.min(y,(doc.defaultView?.innerHeight??y+rect.height)-rect.height))+'px';
            runtime.closeMenu=close;dismissMenu=close;
            doc.addEventListener('pointerdown',outside,true);doc.addEventListener('keydown',key,true);doc.addEventListener('scroll',close,true);doc.defaultView?.addEventListener('resize',close);
            buttons[positions.indexOf(record.mode)].focus();
        }
        public enable():this {
            super.enable();for(const record of state(this).records.values()){record.menuButton.disabled=false;if(record.mode==='float')record.mover.enable();}return this;
        }
        public disable():this {
            super.disable();state(this).closeMenu?.();for(const record of state(this).records.values()){record.menuButton.disabled=true;record.mover.disable();}return this;
        }
        public destroy():this {state(this).closeMenu?.();super.destroy();return this;}
    }
}
// AriannA may allocate decorated elements without forwarding constructor arguments.
// Keep the public constructor contract by attaching after allocation as well.
const AllocateDockable=Dockable.Dockable;
Dockable.Dockable=new Proxy(AllocateDockable,{
    construct(constructor,args,newTarget) {
        const instance=Reflect.construct(constructor,[],newTarget===Dockable.Dockable?constructor:newTarget) as InstanceType<typeof AllocateDockable>;
        instance.configure(args[1]??{});
        if(args[0])instance.attach(args[0]);
        return instance;
    }
});
export default Dockable.Dockable;
export type DockPosition=Dockable.Position;
export type DockableOptions=Dockable.Options;
