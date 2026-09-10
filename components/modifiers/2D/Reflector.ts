/**
 * @module components/modifiers/2D/Reflector
 * @description Flip X / Y modifier with animated scale reflection.
 */

import { Component, Templates } from '../../../core/index.ts';
import * as Base from './Base.ts';

export namespace Reflector
{
    export namespace Types{export type Axis='x'|'y'|'both';}
    export namespace Interfaces
    {
        export interface ReflectorOptions{axis?:Types.Axis;handleColor?:string;animate?:boolean;controls?:boolean;disabled?:boolean;}
    }
    const html=Templates.Template.Html;

    @Component('arianna-reflector',{}, {
        Shadow:false,
        Attributes:['axis','handle-color','animate','controls','disabled'],
    })
    export class Reflector extends Base.Modifier2D.Modifier2D
    {
        public template=html``;
        protected EventName='reflect';
        public axis:Types.Axis='x';
        public handleColor='#e40c88';
        public animateEnabled=true;
        public controls=true;
        private state={x:false,y:false};

        constructor(target?:Base.Modifier2D.Types.TargetInput,options:Interfaces.ReflectorOptions={})
        {
            super();
            if(options.axis)this.axis=options.axis;if(options.handleColor)this.handleColor=options.handleColor;if(options.animate!==undefined)this.animateEnabled=options.animate;if(options.controls!==undefined)this.controls=options.controls;if(options.disabled)this.disable();if(target!==undefined)this.attach(target);
        }

        private syncAttributes():void
        {
            const a=this.getAttribute('axis');if(a==='x'||a==='y'||a==='both')this.axis=a;
            this.handleColor=this.getAttribute('handle-color')??this.handleColor;
            const anim=this.getAttribute('animate');if(anim!==null)this.animateEnabled=anim!=='false';
            const controls=this.getAttribute('controls');if(controls!==null)this.controls=controls!=='false';
        }

        protected applyTo(target:HTMLElement):void
        {
            this.syncAttributes();if(getComputedStyle(target).position==='static')target.style.position='relative';if(this.animateEnabled)target.style.transition='transform .3s ease';
            if(!this.controls)return;
            const make=(label:string,position:string,axis:'x'|'y')=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.className='ar-reflector-btn';b.dataset.axis=axis;b.style.cssText=`position:absolute;${position}padding:4px 10px;border:1px solid ${this.handleColor};background:#fff;color:#222;border-radius:4px;cursor:pointer;font:600 11px system-ui;z-index:9999;white-space:nowrap;`;const click=()=>{if(this.isEnabled)this.perform(target,axis,false);};b.addEventListener('click',click);target.appendChild(b);this.cleanups.push(()=>{b.removeEventListener('click',click);b.remove();});};
            if(this.axis==='x'||this.axis==='both')make('Flip X','left:50%;bottom:-34px;transform:translateX(-105%);','x');
            if(this.axis==='y'||this.axis==='both')make('Flip Y','left:50%;bottom:-34px;transform:translateX(5%);','y');
        }

        private perform(target:HTMLElement,axis:'x'|'y',programmatic:boolean):void
        {
            this.Start({...this.state,axis,programmatic},target);this.state[axis]=!this.state[axis];target.style.transform=`scale(${this.state.x?-1:1},${this.state.y?-1:1})`;const data={...this.state,axis,programmatic};this.Change(data,target);this.End(data,target);
        }
        public flipX():this{for(const target of this.targets)this.perform(target,'x',true);return this;}
        public flipY():this{for(const target of this.targets)this.perform(target,'y',true);return this;}
        public reset():this{this.state={x:false,y:false};for(const target of this.targets){target.style.transform='';this.Change({...this.state,programmatic:true},target);}return this;}
        public getState():{x:boolean;y:boolean}{return{...this.state};}
    }
}

export type ReflectorAxis=Reflector.Types.Axis;
export type ReflectorOptions=Reflector.Interfaces.ReflectorOptions;
export default Reflector.Reflector;
