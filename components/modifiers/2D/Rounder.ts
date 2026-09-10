/**
 * @module components/modifiers/2D/Rounder
 * @description Border-radius modifier with uniform or independent corner controls.
 */

import { Component, Templates } from '../../../core/index.ts';
import * as Base from './Base.ts';

export namespace Rounder
{
    export namespace Types
    {
        export type Corner='top-left'|'top-right'|'bottom-left'|'bottom-right';
    }
    export type Corner=Types.Corner;
    export namespace Interfaces
    {
        export interface RounderOptions
        {
            r?:number;
            radius?:number;
            topLeft?:number;
            topRight?:number;
            bottomLeft?:number;
            bottomRight?:number;
            max?:number;
            handleColor?:string;
            corners?:Types.Corner[];
            disabled?:boolean;
        }
    }
    export type RoundCallback=(element:HTMLElement,radius:number,corner:Corner|'all')=>void;
    const html=Templates.Template.Html;
    const Corners:Corner[]=['top-left','top-right','bottom-left','bottom-right'];
    const attrToCorner:Record<string,Corner>={topLeft:'top-left',topRight:'top-right',bottomLeft:'bottom-left',bottomRight:'bottom-right'};

    function position(corner:Corner):string
    {
        switch(corner){
            case'top-left':return'top:7px;left:7px;cursor:nwse-resize;';
            case'top-right':return'top:7px;right:7px;cursor:nesw-resize;';
            case'bottom-left':return'bottom:7px;left:7px;cursor:nesw-resize;';
            case'bottom-right':return'bottom:7px;right:7px;cursor:nwse-resize;';
        }
    }

    @Component('arianna-rounder',{}, {
        Shadow:false,
        Attributes:['r','radius','top-left','top-right','bottom-left','bottom-right','max','handle-color','corners','disabled'],
    })
    export class Rounder extends Base.Modifier2D.Modifier2D
    {
        public template=html``;
        protected EventName='round';
        public max=100;
        public handleColor='#e40c88';
        public corners:Corner[]=[...Corners];
        private state:Record<Corner,number>={'top-left':0,'top-right':0,'bottom-left':0,'bottom-right':0};
        private perCorner=false;
        private readonly callbacks=new Set<RoundCallback>();

        constructor(target?:Base.Modifier2D.Types.TargetInput,options:Interfaces.RounderOptions={})
        {
            super();
            this.configure(options);
            if(target!==undefined)this.attach(target);
        }

        private configure(options:Interfaces.RounderOptions):void
        {
            const uniform=options.r??options.radius;
            if(uniform!==undefined) for(const c of Corners)this.state[c]=Math.max(0,uniform);
            for(const [name,corner] of Object.entries(attrToCorner))
            {
                const value=options[name as keyof Interfaces.RounderOptions];
                if(typeof value==='number'){this.state[corner]=Math.max(0,value);this.perCorner=true;}
            }
            if(options.max!==undefined)this.max=Math.max(0,options.max);
            if(options.handleColor)this.handleColor=options.handleColor;
            if(options.corners)this.corners=[...options.corners];
            if(options.disabled)this.disable();
        }

        private syncAttributes():void
        {
            const max=this.getAttribute('max');if(max!==null&&Number.isFinite(+max))this.max=Math.max(0,+max);
            this.handleColor=this.getAttribute('handle-color')??this.handleColor;
            const selected=this.getAttribute('corners');
            if(selected){const cs=selected.split(',').map(x=>x.trim()).filter((x):x is Corner=>Corners.includes(x as Corner));if(cs.length)this.corners=cs;}
            const uniformRaw=this.getAttribute('r')??this.getAttribute('radius');
            if(uniformRaw!==null&&Number.isFinite(+uniformRaw)){for(const c of Corners)this.state[c]=Math.max(0,+uniformRaw);}
            for(const c of Corners)
            {
                const raw=this.getAttribute(c);
                if(raw!==null&&Number.isFinite(+raw)){this.state[c]=Math.max(0,+raw);this.perCorner=true;}
            }
        }

        protected applyTo(target:HTMLElement):void
        {
            this.syncAttributes();
            if(getComputedStyle(target).position==='static')target.style.position='relative';
            this.render(target);
            if(this.perCorner)
            {
                for(const corner of this.corners)this.addCornerHandle(target,corner);
            }
            else this.addUniformHandle(target);
        }

        private render(target:HTMLElement):void
        {
            target.style.borderRadius=`${this.state['top-left']}px ${this.state['top-right']}px ${this.state['bottom-right']}px ${this.state['bottom-left']}px`;
        }

        private addUniformHandle(target:HTMLElement):void
        {
            const handle=document.createElement('div');
            handle.className='ar-rounder-handle';
            handle.dataset.corner='all';
            handle.style.cssText=`position:absolute;top:7px;left:7px;width:12px;height:12px;background:${this.handleColor};border-radius:50%;cursor:ew-resize;z-index:9999;touch-action:none;box-shadow:0 0 0 2px rgba(255,255,255,.75);`;
            target.appendChild(handle);
            let pid=-1,startX=0,startRadius=0;
            const move=(e:PointerEvent)=>{
                if(e.pointerId!==pid)return;
                const r=Math.max(0,Math.min(this.max,startRadius+(e.clientX-startX)/2));
                for(const c of Corners)this.state[c]=r;
                this.render(target);this.Change({radius:r,corner:'all',pointerId:pid},target);for(const cb of this.callbacks)cb(target,r,'all');
            };
            const up=(e:PointerEvent)=>{if(e.pointerId!==pid)return;try{handle.releasePointerCapture(pid);}catch{}handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',up);handle.removeEventListener('pointercancel',up);this.End({radius:this.state['top-left'],corner:'all',pointerId:pid},target);pid=-1;};
            const down=(e:PointerEvent)=>{if(!this.isEnabled||e.button!==0)return;e.preventDefault();e.stopPropagation();pid=e.pointerId;startX=e.clientX;startRadius=this.state['top-left'];this.Start({radius:startRadius,corner:'all',pointerId:pid},target);try{handle.setPointerCapture(pid);}catch{}handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',up);handle.addEventListener('pointercancel',up);};
            handle.addEventListener('pointerdown',down);
            this.cleanups.push(()=>{handle.removeEventListener('pointerdown',down);handle.remove();});
        }

        private addCornerHandle(target:HTMLElement,corner:Corner):void
        {
            const handle=document.createElement('div');
            handle.className='ar-rounder-handle';handle.dataset.corner=corner;
            handle.style.cssText=`position:absolute;${position(corner)}width:12px;height:12px;background:${this.handleColor};border-radius:50%;z-index:9999;touch-action:none;box-shadow:0 0 0 2px rgba(255,255,255,.75);`;
            target.appendChild(handle);
            let pid=-1,startY=0,startRadius=0;
            const move=(e:PointerEvent)=>{if(e.pointerId!==pid)return;const r=Math.max(0,Math.min(this.max,startRadius+(e.clientY-startY)/2));this.state[corner]=r;this.render(target);this.Change({radius:r,corner,pointerId:pid},target);for(const cb of this.callbacks)cb(target,r,corner);};
            const up=(e:PointerEvent)=>{if(e.pointerId!==pid)return;try{handle.releasePointerCapture(pid);}catch{}handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',up);handle.removeEventListener('pointercancel',up);this.End({radius:this.state[corner],corner,pointerId:pid},target);pid=-1;};
            const down=(e:PointerEvent)=>{if(!this.isEnabled||e.button!==0)return;e.preventDefault();e.stopPropagation();pid=e.pointerId;startY=e.clientY;startRadius=this.state[corner];this.Start({radius:startRadius,corner,pointerId:pid},target);try{handle.setPointerCapture(pid);}catch{}handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',up);handle.addEventListener('pointercancel',up);};
            handle.addEventListener('pointerdown',down);this.cleanups.push(()=>{handle.removeEventListener('pointerdown',down);handle.remove();});
        }

        public onRound(callback:RoundCallback):this{this.callbacks.add(callback);return this;}
        public setRadius(radius:number):this
        {
            const r=Math.max(0,Math.min(this.max,radius));for(const c of Corners)this.state[c]=r;this.perCorner=false;
            for(const target of this.targets){this.render(target);this.Change({radius:r,corner:'all',programmatic:true},target);for(const cb of this.callbacks)cb(target,r,'all');}
            return this;
        }
        public setCorner(corner:Corner,radius:number):this
        {
            const r=Math.max(0,Math.min(this.max,radius));this.state[corner]=r;this.perCorner=true;
            for(const target of this.targets){this.render(target);this.Change({radius:r,corner,programmatic:true},target);for(const cb of this.callbacks)cb(target,r,corner);}
            return this;
        }
        public setCorners(values:Partial<Record<Corner,number>>):this{for(const [corner,radius] of Object.entries(values))if(typeof radius==='number')this.setCorner(corner as Corner,radius);return this;}
        public getCorners():Readonly<Record<Corner,number>>{return{...this.state};}
    }
}

export type RounderCorner=Rounder.Types.Corner;
export type RounderOptions=Rounder.Interfaces.RounderOptions;
export default Rounder.Rounder;
