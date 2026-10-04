/**
 * @module components/graphics/2D/modifiers/Dockable
 * Independent dock/float wrapper. Does not change the wrapped component API.
 * const dockable = new Dockable(myComponent, { container: workspace });
 * dockable.dock('right'); dockable.float(); dockable.destroy();
 */
import { Component, Templates } from '../../../../core/index.ts';
import * as Base from './Base.ts';
import Mover from './Mover.ts';
import Resizer from './Resizer.ts';
import { ToolBar } from '../../../layout/ToolBar.ts';

export namespace Dockable
{
    export type Position = 'top' | 'left' | 'bottom' | 'right' | 'float';
    export interface Options {
        container?: HTMLElement;
        position?: Position;
        title?: string;
        icon?:string;
        barPosition?:'top'|'bottom'|'left'|'right';
        width?: number;
        height?: number;
        theme?: 'dark' | 'light';
        dockWidth?: number;
        dockHeight?: number;
        minWidth?:number;minHeight?:number;respectCanvas?:boolean;contentInsets?:{top?:number;bottom?:number;left?:number;right?:number};
        onMinimize?:()=>void;
        onClose?:()=>void;
    }
    interface SavedStyle { key:string; value:string; priority:string; }
    interface Record {
        target:HTMLElement; frame:HTMLDivElement; marker:Comment;
        parent:HTMLElement; mover:InstanceType<typeof Mover>;resizer:InstanceType<typeof Resizer>;maximized?:boolean;
        menuButton:HTMLButtonElement; pinButton?:HTMLButtonElement;lastDock?:Position;hasPinned?:boolean;grip?:HTMLDivElement; mode:Position; floating:{x:number;y:number;width:number;height:number};
        original:SavedStyle[]; releaseParent:()=>void;bar:InstanceType<typeof ToolBar>;barId:string;minimized:boolean;layoutKey?:string;layoutFrame?:number|null;closed?:boolean;
    }
    interface Runtime {
        options:Options; records:Map<HTMLElement,Record>; closeMenu:(()=>void)|null;
    }
    const states=new WeakMap<HTMLElement,Runtime>();
    const owners=new WeakMap<HTMLElement,HTMLElement>();
    const parents=new WeakMap<HTMLElement,{count:number;value:string;priority:string}>();
    const positions:Position[]=['top','bottom','right','left','float'];
    let menuSequence=0;
    let panelSequence=0;
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
        Shadow:false,Attributes:['position','title','theme','disabled'],Properties:['Position','Wrapper','Button','Bar','Minimized'],
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
        public get Bar():InstanceType<typeof ToolBar>|null{return this.firstRecord()?.bar??null;}
        public get Minimized():boolean{return this.firstRecord()?.minimized??false;}
        private minimizeRecord(record:Record):void {if(record.minimized)return;record.minimized=true;record.layoutKey=undefined;record.frame.hidden=true;record.frame.style.display='none';{if(record.mover.isEnabled)record.mover.disable();}{if(record.resizer.isEnabled)record.resizer.disable();}if(record.grip)record.grip.hidden=true;state(this).options.onMinimize?.();record.bar.refresh();}
        private restoreRecord(record:Record):void {if(!record.minimized)return;record.minimized=false;record.frame.hidden=false;record.frame.style.display='flex';record.maximized=false;record.layoutKey=undefined;this.place(record,record.mode);record.bar.refresh();}
        public minimize():this {for(const record of state(this).records.values())this.minimizeRecord(record);return this;}
        public restore():this {for(const record of state(this).records.values())this.restoreRecord(record);return this;}
        public maximize():this {const record=this.firstRecord();if(!record)return this;if(record.maximized){record.maximized=false;record.layoutKey=undefined;this.place(record,record.mode);}else{this.captureFloating(record);record.maximized=true;record.layoutKey=undefined;Object.assign(record.frame.style,{left:'0px',top:'0px',right:'0px',bottom:'0px',width:'100%',height:'100%'});{if(record.mover.isEnabled)record.mover.disable();}{if(record.resizer.isEnabled)record.resizer.disable();}}return this;}
        public get Button():HTMLButtonElement|null {return this.firstRecord()?.menuButton??null;}
        public get Position():Position {return this.firstRecord()?.mode??state(this).options.position??'float';}
        public set Position(value:Position) {this.dock(value);}
        public dock(position:Position,target?:HTMLElement):this {
            if(!valid(position))throw new TypeError('Dockable position must be top, left, bottom, right or float');
            const runtime=state(this);runtime.options.position=position;
            for(const record of runtime.records.values()) {
                if(target&&record.target!==target)continue;
                if(record.minimized)this.restoreRecord(record);
                if(record.mode===position&&!record.maximized)continue;
                if(record.maximized){record.maximized=false;record.layoutKey=undefined;this.place(record,record.mode);}
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
            frame.style.cssText='box-sizing:border-box;display:flex;flex-direction:column;min-width:'+size(runtime.options.minWidth,160)+'px;min-height:'+size(runtime.options.minHeight,100)+'px;overflow:hidden;z-index:40;border:1px solid '+(light?'#bfc3c9':'#44474e')+';border-radius:7px;background:'+(light?'#f1f2f4':'#202226')+';color:'+(light?'#30343a':'#e5e8ed')+';box-shadow:0 12px 32px #0006';
            const header=doc.createElement('div');header.className='Dockable-Handle';
            header.style.cssText='box-sizing:border-box;flex:0 0 28px;display:flex;align-items:center;justify-content:flex-end;padding:0 9px;border-bottom:1px solid '+(light?'#bfc3c9':'#44474e')+';background:'+(light?'#e5e7eb':'#2a2d32')+';font:700 11px system-ui;user-select:none;touch-action:none';
            const title=doc.createElement('span');title.textContent=runtime.options.title??target.getAttribute('aria-label')??target.getAttribute('title')??target.tagName.toLowerCase();
            title.style.cssText='flex:1 1 auto;margin-right:auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
            const menuButton=doc.createElement('button');menuButton.type='button';menuButton.className='Dockable-MenuButton';menuButton.textContent='⋮';
            menuButton.title='Dock / Float';menuButton.setAttribute('aria-label','Docking options');menuButton.setAttribute('aria-haspopup','menu');menuButton.setAttribute('aria-expanded','false');
            menuButton.style.cssText='flex:0 0 24px;width:24px;height:22px;margin-left:8px;padding:0;border:1px solid '+(light?'#bfc3c9':'#555961')+';border-radius:4px;background:'+(light?'#f1f2f4':'#343a3f')+';color:inherit;font:700 17px/1 system-ui;cursor:pointer;touch-action:manipulation';
            menuButton.style.background=light?'linear-gradient(180deg,#f9fbfc,#e0e4e7)':'linear-gradient(180deg,#444a50,#30353a)';menuButton.style.color=light?'#25292d':'#e5e8ea';menuButton.style.borderColor=light?'#b8bdc2':'#15181a';menuButton.style.textShadow=light?'0 1px 1px #fff9':'0 -1px 1px #0009';
            header.append(title,menuButton);
            for(const [glyph,label,action] of [['pin','Pin / Float',()=>{const record=state(this).records.get(target);if(!record)return;if(record.mode==='float'){const side=record.hasPinned?(record.lastDock??'left'):'left';record.hasPinned=true;this.dock(side,target);}else this.float(target);}],['−','Minimize',()=>this.minimize()]] as const){const button=doc.createElement('button');button.type='button';button.className='Dockable-WindowButton';if(glyph==='pin'){const icon=doc.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('width','14');icon.setAttribute('height','14');icon.setAttribute('aria-hidden','true');icon.style.verticalAlign='middle';const path=doc.createElementNS(icon.namespaceURI,'path');path.setAttribute('d','M9 3h6l-1 6 4 4v2H6v-2l4-4-1-6M12 15v6');path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.8');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');icon.append(path);button.append(icon);}else button.textContent=glyph;button.title=label;button.setAttribute('aria-label',label);button.style.cssText='width:24px;height:22px;margin-left:3px;border:1px solid #15181a;border-radius:4px;background:linear-gradient(180deg,#444a50,#30353a);color:#fff;text-shadow:0 -1px 1px #0009;cursor:pointer';button.style.background=menuButton.style.background;button.style.color=menuButton.style.color;button.style.borderColor=menuButton.style.borderColor;button.style.textShadow=menuButton.style.textShadow;button.style.boxShadow='inset 0 1px 0 #ffffff18,0 1px 2px #0004';button.onpointerdown=e=>e.stopPropagation();button.disabled=!this.isEnabled;button.onclick=e=>{e.stopPropagation();if(this.isEnabled)action();};header.append(button);}
            if(target.matches('arianna-tools-2d,.Tools2D,arianna-tools-palette,.ToolsPalette')){header.style.padding='0 2px';header.style.gap='2px';title.style.display='none';header.title=title.textContent??'Tools2D';for(const button of header.querySelectorAll<HTMLButtonElement>('button')){button.style.flex='0 0 20px';button.style.width='20px';button.style.marginLeft='0';button.style.padding='0';}}
            const original=['width','height','flex','min-width','min-height','position','left','right','top','bottom','margin','overflow'].map(key=>({key,value:target.style.getPropertyValue(key),priority:target.style.getPropertyPriority(key)}));
            target.style.setProperty('position','relative');
            for(const key of ['left','right','top','bottom'])target.style.setProperty(key,'auto');
            target.style.setProperty('margin','0');target.style.setProperty('width','100%');target.style.setProperty('height','auto','important');
            target.style.setProperty('overflow','auto');target.style.setProperty('flex','1 1 0px','important');target.style.setProperty('min-width','0');target.style.setProperty('min-height','0');
            frame.dataset.theme=light?'light':'dark';
            frame.append(header,target);parent.appendChild(frame);
            const mover=new Mover();mover.handleSelector='.Dockable-Handle';mover.bounds=viewport?'viewport':'parent';mover.attach(frame);
            const resizer=new Resizer(undefined,{minWidth:size(runtime.options.minWidth,160),minHeight:size(runtime.options.minHeight,100),allowCross:false,handleColor:'transparent'});resizer.attach(frame);for(const handle of frame.querySelectorAll<HTMLElement>('.Resizer-Handle'))handle.style.opacity='0';
            const bar=ToolBar.For(parent,{theme:runtime.options.theme,position:runtime.options.barPosition??'left'});
            const record:Record={bar,barId:'dockable-panel-'+(++panelSequence),minimized:false,target,frame,marker,parent,mover,resizer,menuButton,mode:'float',original,releaseParent:positionParent(parent),floating:{
                x:viewport?rect.left:rect.left-area.left-parent.clientLeft+parent.scrollLeft,
                y:viewport?rect.top:rect.top-area.top-parent.clientTop+parent.scrollTop,
                width:size(runtime.options.width,rect.width||320),height:size(runtime.options.height,(rect.height||220)+28),
            }};
            runtime.records.set(target,record);owners.set(target,this);
            bar.register({id:record.barId,title:title.textContent??'Panel',icon:runtime.options.icon,minimize:()=>this.minimizeRecord(record),restore:()=>this.restoreRecord(record),minimized:()=>record.minimized});
            const barLayout=()=>{if(!record.closed)this.place(record,record.mode);};parent.addEventListener('arianna:toolbar-layout',barLayout);this.cleanups.push(()=>parent.removeEventListener('arianna:toolbar-layout',barLayout));
            record.pinButton=header.querySelector<HTMLButtonElement>('[aria-label="Pin / Float"]')??undefined;
            const grip=doc.createElement('div');grip.className='Dockable-ResizeGrip';grip.style.cssText='position:absolute;z-index:10000;width:10px;height:100%;top:0;right:0;cursor:ew-resize;touch-action:none';frame.append(grip);record.grip=grip;
            const gripControl=new AbortController();let drag:{id:number;x:number;y:number;width:number;height:number}|null=null;
            grip.addEventListener('pointerdown',event=>{if(event.button!==0||!this.isEnabled||record.mode==='float'||record.minimized)return;event.preventDefault();event.stopPropagation();drag={id:event.pointerId,x:event.clientX,y:event.clientY,width:frame.offsetWidth||parseFloat(frame.style.width),height:frame.offsetHeight||parseFloat(frame.style.height)};try{grip.setPointerCapture(event.pointerId);}catch{}},{signal:gripControl.signal});
            doc.addEventListener('pointermove',event=>{if(!this.isEnabled||record.minimized||record.mode==='float'||!drag||event.pointerId!==drag.id)return;event.preventDefault();event.stopPropagation();const horizontal=record.mode==='left'||record.mode==='right',delta=horizontal?(event.clientX-drag.x)*(record.mode==='right'?-1:1):(event.clientY-drag.y)*(record.mode==='bottom'?-1:1),limit=parent===doc.body?(horizontal?(doc.defaultView?.innerWidth??parent.clientWidth):(doc.defaultView?.innerHeight??parent.clientHeight)):(horizontal?parent.clientWidth:parent.clientHeight);
                const length=Math.min(Math.max(horizontal?size(runtime.options.minWidth,160):size(runtime.options.minHeight,100),(horizontal?drag.width:drag.height)+delta),Math.max(horizontal?160:100,limit-100));this.configure(horizontal?{dockWidth:length}:{dockHeight:length});this.Change({position:record.mode,wrapper:frame,width:frame.offsetWidth,height:frame.offsetHeight},target);},{capture:true,signal:gripControl.signal});
            const release=(event:PointerEvent)=>{if(!drag||event.pointerId!==drag.id)return;drag=null;try{grip.releasePointerCapture(event.pointerId);}catch{}this.End({position:record.mode,wrapper:frame},target);};doc.addEventListener('pointerup',release,{capture:true,signal:gripControl.signal});doc.addEventListener('pointercancel',release,{capture:true,signal:gripControl.signal});
            this.cleanups.push(()=>gripControl.abort());
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
            frame.addEventListener('contextmenu',context);frame.addEventListener('arianna:move-end',end);frame.addEventListener('arianna:resize-end',end);
            const observer=typeof ResizeObserver==='function'?new ResizeObserver(()=>{if(record.closed||record.layoutFrame!=null||record.mode==='float'||record.minimized||record.maximized)return;record.layoutFrame=requestAnimationFrame(()=>{record.layoutFrame=null;if(!record.closed)this.place(record,record.mode);});}):null;observer?.observe(parent);
            this.cleanups.push(()=>{
                record.closed=true;if(record.layoutFrame!=null)cancelAnimationFrame(record.layoutFrame);record.layoutFrame=null;observer?.disconnect();runtime.closeMenu?.();menuButton.removeEventListener('pointerdown',stopMove);menuButton.removeEventListener('click',openMenu);mover.destroy();resizer.destroy();record.bar.unregister(record.barId);frame.removeEventListener('contextmenu',context);frame.removeEventListener('arianna:move-end',end);frame.removeEventListener('arianna:resize-end',end);
                // Restore the component only if it still belongs to this wrapper.
                if(target.parentElement===frame) {
                    if(marker.parentNode)marker.replaceWith(target);else parent.appendChild(target);
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
            if(record.closed)return;
            const options=state(this).options,barInset=record.bar.isConnected?record.bar.Insets:{left:0,right:0,top:0,bottom:0},inset={...barInset},view=record.target.ownerDocument.defaultView;
            const width=record.parent===record.target.ownerDocument.body?(view?.innerWidth??record.parent.clientWidth):(record.parent.clientWidth||Math.max(size(options.minWidth,160),record.floating.width)),height=record.parent===record.target.ownerDocument.body?(view?.innerHeight??record.parent.clientHeight):(record.parent.clientHeight||Math.max(size(options.minHeight,100),record.floating.height));
            const area=record.parent.getBoundingClientRect();
            const canvas=record.parent.matches('.Canvas2D,arianna-canvas-2d')?record.parent:record.parent.querySelector<HTMLElement>('.Canvas2D,arianna-canvas-2d');
            const stage=canvas?.querySelector<HTMLElement>('.Canvas2D-Stage');
            if(options.respectCanvas!==false&&stage&&area.height>0){const rect=stage.getBoundingClientRect();inset.top+=Math.max(0,rect.top-area.top);inset.bottom+=Math.max(0,area.bottom-rect.bottom);}
            for(const edge of ['top','bottom','left','right'] as const)inset[edge]+=Math.max(0,options.contentInsets?.[edge]??0);
            const key=JSON.stringify([position,record.minimized,record.maximized,this.isEnabled,options.theme,width,height,inset,record.floating,options.dockWidth,options.dockHeight,options.minWidth,options.minHeight]);if(record.layoutKey===key)return;record.layoutKey=key;
            if(position!=='float')record.lastDock=position;
            record.mode=position;if(record.pinButton){record.pinButton.setAttribute('aria-pressed',String(position!=='float'));record.pinButton.title=position==='float'?'Pin panel':'Float panel';record.pinButton.style.color=position==='float'?(state(this).options.theme==='light'?'#25292d':'#e5e8ea'):'#ff66b5';}
            if(record.grip){const horizontal=position==='left'||position==='right';record.grip.hidden=position==='float'||!!record.minimized||!!record.maximized;record.grip.style.setProperty('pointer-events','auto','important');record.grip.style.setProperty('z-index','10000','important');record.grip.dataset.edge=position==='left'?'right':position==='right'?'left':position==='top'?'bottom':position==='bottom'?'top':'all';Object.assign(record.grip.style,{left:position==='right'||!horizontal?'0':'auto',right:position==='left'||!horizontal?'0':'auto',top:position==='bottom'?'0':horizontal?'0':'auto',bottom:position==='top'?'0':'auto',width:horizontal?'10px':'100%',height:horizontal?'100%':'10px',cursor:horizontal?'ew-resize':'ns-resize'});}
            const style=record.frame.style,f=record.floating;
            record.frame.dataset.position=position;
            style.position=record.parent===record.target.ownerDocument.body?'fixed':'absolute';
            const geometry:{[key:string]:string}={left:'auto',top:'auto',right:'auto',bottom:'auto',width:'auto',height:'auto',resize:'none'};
            if(position==='float') {const w=Math.max(size(options.minWidth,160),Math.min(f.width,width-inset.left-inset.right)),h=Math.max(size(options.minHeight,100),Math.min(f.height,height-inset.top-inset.bottom));geometry.left=Math.max(inset.left,Math.min(f.x,width-inset.right-w))+'px';geometry.top=Math.max(inset.top,Math.min(f.y,height-inset.bottom-h))+'px';geometry.width=w+'px';geometry.height=h+'px';if(this.isEnabled&&!record.minimized&&!record.maximized){if(!record.mover.isEnabled)record.mover.enable();}else {if(record.mover.isEnabled)record.mover.disable();}}
            else {
                {if(record.mover.isEnabled)record.mover.disable();}
                if(position==='top'||position==='bottom') {geometry.left=inset.left+'px';geometry.right=inset.right+'px';geometry[position]=inset[position]+'px';geometry.height=Math.min(size(options.dockHeight,f.height),height-inset.top-inset.bottom)+'px';}
                else {geometry.top=inset.top+'px';geometry.bottom=inset.bottom+'px';geometry[position]=inset[position]+'px';geometry.width=Math.min(size(options.dockWidth,f.width),width-inset.left-inset.right)+'px';}
            }
            for(const [name,value]of Object.entries(geometry))if(style.getPropertyValue(name)!==value)style.setProperty(name,value);
            if(position==='float'&&this.isEnabled&&!record.minimized&&!record.maximized){if(!record.resizer.isEnabled)record.resizer.enable();}else {if(record.resizer.isEnabled)record.resizer.disable();}
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
            super.enable();for(const record of state(this).records.values()){record.menuButton.disabled=false;for(const button of record.frame.querySelectorAll<HTMLButtonElement>('.Dockable-WindowButton'))button.disabled=false;if(record.mode==='float'&&!record.minimized&&!record.maximized){{if(!record.mover.isEnabled)record.mover.enable();}{if(!record.resizer.isEnabled)record.resizer.enable();}}}return this;
        }
        public disable():this {
            super.disable();state(this).closeMenu?.();for(const record of state(this).records.values()){record.menuButton.disabled=true;for(const button of record.frame.querySelectorAll<HTMLButtonElement>('.Dockable-WindowButton'))button.disabled=true;{if(record.mover.isEnabled)record.mover.disable();}{if(record.resizer.isEnabled)record.resizer.disable();}}return this;
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
