/**
 * @module components/modifiers/2D/Rotator
 * @description Drag-to-rotate modifier with configurable angle snapping.
 */

import { Component, Templates } from '../../../core/index.ts';
import * as Base from './Base.ts';

export namespace Rotator
{
    export namespace Interfaces
    {
        export interface RotatorOptions
        {
            handleOffset?: number;
            handleColor?: string;
            handleSize?: number;
            snap?: number;
            disabled?: boolean;
        }
    }

    export type RotateCallback = (element: HTMLElement, angle: number) => void;
    const html = Templates.Template.Html;

    @Component('arianna-rotator', {}, {
        Shadow: false,
        Attributes: ['handle-offset','handle-color','handle-size','snap','disabled'],
    })
    export class Rotator extends Base.Modifier2D.Modifier2D
    {
        public template = html``;
        protected EventName = 'rotate';

        public handleOffset = 24;
        public handleColor = '#e40c88';
        public handleSize = 14;
        public snap = 0;
        private angle = 0;
        private readonly callbacks = new Set<RotateCallback>();

        constructor(target?: Base.Modifier2D.Types.TargetInput, options: Interfaces.RotatorOptions = {})
        {
            super();
            if(options.handleOffset !== undefined) this.handleOffset = options.handleOffset;
            if(options.handleColor !== undefined) this.handleColor = options.handleColor;
            if(options.handleSize !== undefined) this.handleSize = options.handleSize;
            if(options.snap !== undefined) this.snap = Math.max(0, options.snap);
            if(options.disabled) this.disable();
            if(target !== undefined) this.attach(target);
        }

        private syncAttributes(): void
        {
            const number = (name:string,current:number) => {
                const raw=this.getAttribute(name); if(raw===null) return current;
                const n=Number.parseFloat(raw); return Number.isFinite(n)?n:current;
            };
            this.handleOffset = number('handle-offset',this.handleOffset);
            this.handleSize = number('handle-size',this.handleSize);
            this.snap = Math.max(0,number('snap',this.snap));
            this.handleColor = this.getAttribute('handle-color') ?? this.handleColor;
        }

        protected applyTo(target: HTMLElement): void
        {
            this.syncAttributes();
            if(getComputedStyle(target).position === 'static') target.style.position='relative';
            target.style.transformOrigin ||= 'center';

            const line=document.createElement('div');
            line.className='ar-rotator-line';
            line.style.cssText=`position:absolute;top:-${this.handleOffset}px;left:50%;width:1px;height:${this.handleOffset}px;background:${this.handleColor};pointer-events:none;z-index:9998;`;
            target.appendChild(line);

            const handle=document.createElement('div');
            handle.className='ar-rotator-handle';
            handle.style.cssText=`position:absolute;top:-${this.handleOffset + this.handleSize/2}px;left:50%;transform:translate(-50%,-50%);width:${this.handleSize}px;height:${this.handleSize}px;background:${this.handleColor};border-radius:50%;cursor:grab;z-index:9999;touch-action:none;box-shadow:0 0 0 2px rgba(255,255,255,.75);`;
            target.appendChild(handle);

            let pointerId=-1;
            const onMove=(event:PointerEvent) => {
                if(event.pointerId!==pointerId || !this.isEnabled) return;
                const rect=target.getBoundingClientRect();
                const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
                let next=Math.atan2(event.clientY-cy,event.clientX-cx)*(180/Math.PI)+90;
                if(this.snap>0) next=Math.round(next/this.snap)*this.snap;
                this.angle=next;
                target.style.transform=`rotate(${next}deg)`;
                this.Change({angle:next,pointerId},target);
                for(const cb of this.callbacks) cb(target,next);
            };
            const onUp=(event:PointerEvent) => {
                if(event.pointerId!==pointerId) return;
                try{handle.releasePointerCapture(pointerId);}catch{}
                handle.removeEventListener('pointermove',onMove);
                handle.removeEventListener('pointerup',onUp);
                handle.removeEventListener('pointercancel',onUp);
                handle.style.cursor='grab';
                this.End({angle:this.angle,pointerId},target);
                pointerId=-1;
            };
            const onDown=(event:PointerEvent) => {
                if(!this.isEnabled || event.button!==0) return;
                event.preventDefault(); event.stopPropagation();
                pointerId=event.pointerId;
                handle.style.cursor='grabbing';
                try{handle.setPointerCapture(pointerId);}catch{}
                handle.addEventListener('pointermove',onMove);
                handle.addEventListener('pointerup',onUp);
                handle.addEventListener('pointercancel',onUp);
                this.Start({angle:this.angle,pointerId},target);
            };
            handle.addEventListener('pointerdown',onDown);
            this.cleanups.push(()=>{
                handle.removeEventListener('pointerdown',onDown);
                handle.removeEventListener('pointermove',onMove);
                handle.removeEventListener('pointerup',onUp);
                handle.removeEventListener('pointercancel',onUp);
                handle.remove(); line.remove();
            });
        }

        public onRotate(callback: RotateCallback): this { this.callbacks.add(callback); return this; }

        public setAngle(angle:number): this
        {
            this.angle = this.snap>0 ? Math.round(angle/this.snap)*this.snap : angle;
            for(const target of this.targets)
            {
                target.style.transform=`rotate(${this.angle}deg)`;
                this.Change({angle:this.angle,programmatic:true},target);
                for(const cb of this.callbacks) cb(target,this.angle);
            }
            return this;
        }

        public getAngle(): number { return this.angle; }
    }
}

export type RotatorOptions = Rotator.Interfaces.RotatorOptions;
export default Rotator.Rotator;
