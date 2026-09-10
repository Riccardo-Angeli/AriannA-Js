/**
 * @module components/modifiers/2D/Skewer
 * @description 2D skew modifier supporting drag and programmatic X/Y control.
 */

import { Component, Templates } from '../../../core/index.ts';
import * as Base from './Base.ts';

export namespace Skewer
{
    export namespace Types { export type Axis='x'|'y'|'both'; }
    export namespace Interfaces
    {
        export interface SkewerOptions
        {
            axis?: Types.Axis;
            maxAngle?: number;
            handleColor?: string;
            disabled?: boolean;
        }
    }
    export type SkewCallback=(element:HTMLElement,skewX:number,skewY:number)=>void;
    const html=Templates.Template.Html;

    @Component('arianna-skewer',{}, {
        Shadow:false,
        Attributes:['axis','max-angle','handle-color','disabled'],
    })
    export class Skewer extends Base.Modifier2D.Modifier2D
    {
        public template=html``;
        protected EventName='skew';
        public axis:Types.Axis='both';
        public maxAngle=45;
        public handleColor='#e40c88';
        private skew:[number,number]=[0,0];
        private readonly callbacks=new Set<SkewCallback>();

        constructor(target?:Base.Modifier2D.Types.TargetInput,options:Interfaces.SkewerOptions={})
        {
            super();
            if(options.axis) this.axis=options.axis;
            if(options.maxAngle!==undefined) this.maxAngle=Math.abs(options.maxAngle);
            if(options.handleColor) this.handleColor=options.handleColor;
            if(options.disabled) this.disable();
            if(target!==undefined) this.attach(target);
        }

        private syncAttributes():void
        {
            const a=this.getAttribute('axis'); if(a==='x'||a==='y'||a==='both') this.axis=a;
            const m=this.getAttribute('max-angle'); if(m!==null && Number.isFinite(+m)) this.maxAngle=Math.abs(+m);
            this.handleColor=this.getAttribute('handle-color')??this.handleColor;
        }

        protected applyTo(target:HTMLElement):void
        {
            this.syncAttributes();
            if(getComputedStyle(target).position==='static') target.style.position='relative';
            target.style.transformOrigin ||= 'center';
            const handle=document.createElement('div');
            handle.className='ar-skewer-handle';
            handle.style.cssText=`position:absolute;right:-8px;bottom:-8px;width:14px;height:14px;background:${this.handleColor};border-radius:50%;cursor:crosshair;z-index:9999;touch-action:none;box-shadow:0 0 0 2px rgba(255,255,255,.75);`;
            target.appendChild(handle);
            let pid=-1,sx=0,sy=0,startX=0,startY=0;
            const move=(e:PointerEvent)=>{
                if(e.pointerId!==pid||!this.isEnabled)return;
                const dx=(e.clientX-sx)/4,dy=(e.clientY-sy)/4;
                const nx=this.axis==='y'?startX:Math.max(-this.maxAngle,Math.min(this.maxAngle,startX+dx));
                const ny=this.axis==='x'?startY:Math.max(-this.maxAngle,Math.min(this.maxAngle,startY+dy));
                this.applySkew(target,nx,ny,false,pid);
            };
            const up=(e:PointerEvent)=>{
                if(e.pointerId!==pid)return;
                try{handle.releasePointerCapture(pid);}catch{}
                handle.removeEventListener('pointermove',move); handle.removeEventListener('pointerup',up); handle.removeEventListener('pointercancel',up);
                this.End({skewX:this.skew[0],skewY:this.skew[1],pointerId:pid},target); pid=-1;
            };
            const down=(e:PointerEvent)=>{
                if(!this.isEnabled||e.button!==0)return;
                e.preventDefault();e.stopPropagation();pid=e.pointerId;sx=e.clientX;sy=e.clientY;[startX,startY]=this.skew;
                this.Start({skewX:startX,skewY:startY,pointerId:pid},target);
                try{handle.setPointerCapture(pid);}catch{}
                handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',up);handle.addEventListener('pointercancel',up);
            };
            handle.addEventListener('pointerdown',down);
            this.cleanups.push(()=>{handle.removeEventListener('pointerdown',down);handle.remove();});
        }

        private applySkew(target:HTMLElement,x:number,y:number,programmatic:boolean,pointerId?:number):void
        {
            this.skew=[x,y];
            target.style.transform=`skew(${x}deg, ${y}deg)`;
            this.Change({skewX:x,skewY:y,programmatic,pointerId},target);
            for(const cb of this.callbacks) cb(target,x,y);
        }

        public onSkew(callback:SkewCallback):this{this.callbacks.add(callback);return this;}
        public setSkew(x:number,y:number):this
        {
            const nx=this.axis==='y'?this.skew[0]:Math.max(-this.maxAngle,Math.min(this.maxAngle,x));
            const ny=this.axis==='x'?this.skew[1]:Math.max(-this.maxAngle,Math.min(this.maxAngle,y));
            for(const target of this.targets) this.applySkew(target,nx,ny,true);
            return this;
        }
        public reset():this{return this.setSkew(0,0);}
        public getSkew():readonly[number,number]{return [...this.skew] as [number,number];}
    }
}

export type SkewerAxis=Skewer.Types.Axis;
export type SkewerOptions=Skewer.Interfaces.SkewerOptions;
export default Skewer.Skewer;
