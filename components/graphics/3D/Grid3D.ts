/** Independent oriented 3D construction grid and snap target. */
import { Component, Templates } from '../../../core/index.ts';
const html=Templates.Template.Html;
export namespace Grid3D
{
    export interface Vec3{x:number;y:number;z:number;}
    export type Plane='xy'|'xz'|'yz'|'custom';
    export interface Options{enabled?:boolean;plane?:Plane;origin?:Vec3;axisU?:Vec3;axisV?:Vec3;stepU?:number;stepV?:number;subdivisions?:number;majorEvery?:number;size?:number;infinite?:boolean;stepX?:number;stepY?:number;stepZ?:number;kind?:'lines'|'dotted';snapX?:boolean;snapY?:boolean;snapZ?:boolean;snapStepX?:number;snapStepY?:number;snapStepZ?:number;}
    export interface Hit{point:Vec3;distance:number;u:number;v:number;major:boolean;}
    export interface CanvasTarget extends HTMLElement{rendersGrid?:boolean;selectionSurface?:HTMLCanvasElement;canvas?:HTMLCanvasElement;camera?:{position:Vec3};projectWorld(point:Vec3):{x:number;y:number;z:number;visible:boolean};onFrame?(callback:(dt:number)=>void):()=>void;useGrid?(grid:Grid3D|null):unknown;setGrid?(options:Partial<Options>):unknown;setSnap?(options:Record<string,boolean>):unknown;}
    const v=(x=0,y=0,z=0):Vec3=>({x,y,z}),add=(a:Vec3,b:Vec3)=>v(a.x+b.x,a.y+b.y,a.z+b.z),scale=(a:Vec3,k:number)=>v(a.x*k,a.y*k,a.z*k),sub=(a:Vec3,b:Vec3)=>v(a.x-b.x,a.y-b.y,a.z-b.z),dot=(a:Vec3,b:Vec3)=>a.x*b.x+a.y*b.y+a.z*b.z,len=(a:Vec3)=>Math.hypot(a.x,a.y,a.z),norm=(a:Vec3)=>{const l=len(a)||1;return scale(a,1/l);};
    const axes=(plane:Plane):[Vec3,Vec3]=>plane==='xy'?[v(1,0,0),v(0,1,0)]:plane==='yz'?[v(0,1,0),v(0,0,1)]:[v(1,0,0),v(0,0,1)];
    const Defaults:Required<Options>={enabled:true,plane:'xz',origin:v(),axisU:v(1,0,0),axisV:v(0,0,1),stepU:1,stepV:1,subdivisions:10,majorEvery:10,size:10,infinite:true,stepX:1,stepY:1,stepZ:1,kind:'lines',snapX:true,snapY:true,snapZ:true,snapStepX:0,snapStepY:0,snapStepZ:0};
    const States=new WeakMap<HTMLElement,Required<Options>>(),Attachments=new WeakMap<HTMLElement,{canvas:CanvasTarget;overlay:HTMLCanvasElement|null;unsub:(()=>void)|null}>();
    const state=(h:HTMLElement)=>{let s=States.get(h);if(!s){s={...Defaults,origin:{...Defaults.origin},axisU:{...Defaults.axisU},axisV:{...Defaults.axisV}};States.set(h,s);}return s;};
    @Component('arianna-grid-3d',{}, {Shadow:false,Attributes:['enabled','plane','step-u','step-v','subdivisions','major-every','size','infinite','step-x','step-y','step-z','kind','snap-x','snap-y','snap-z','snap-step-x','snap-step-y','snap-step-z'],Properties:['options']})
    export class Grid3D extends HTMLElement
    {
        public template=html``;
        constructor(options:Options={}){super();this.options=options;}
        public onCreated():void{this.style.display='none';}
        public onConnected():void{for(const name of ['enabled','plane','step-u','step-v','subdivisions','major-every','size','infinite','step-x','step-y','step-z','kind','snap-x','snap-y','snap-z','snap-step-x','snap-step-y','snap-step-z'])if(this.hasAttribute(name))this.onAttributeChanged(name);}
        public onAttributeChanged(name:string):void{const keys:Record<string,keyof Options>={'enabled':'enabled','plane':'plane','step-u':'stepU','step-v':'stepV','step-x':'stepX','step-y':'stepY','step-z':'stepZ','kind':'kind','subdivisions':'subdivisions','major-every':'majorEvery','size':'size','infinite':'infinite','snap-x':'snapX','snap-y':'snapY','snap-z':'snapZ','snap-step-x':'snapStepX','snap-step-y':'snapStepY','snap-step-z':'snapStepZ'};const key=keys[name],value=this.getAttribute(name);if(!key||value===null)return;this.configure({[key]:['enabled','infinite','snapX','snapY','snapZ'].includes(key)?value!=='false':key==='plane'||key==='kind'?value:Number(value)});}
        public onUnmount():void{this.detach();}
        public get options():Required<Options>{const s=state(this);return{...s,origin:{...s.origin},axisU:{...s.axisU},axisV:{...s.axisV}};}
        public set options(o:Options){const s=state(this);Object.assign(s,o);if(o.origin)s.origin={...o.origin};if(o.axisU)s.axisU=norm(o.axisU);if(o.axisV)s.axisV=norm(o.axisV);if(o.plane&&o.plane!=='custom')[s.axisU,s.axisV]=axes(o.plane);
            if(o.stepU!==undefined)s[s.plane==='yz'?'stepY':'stepX']=o.stepU;if(o.stepV!==undefined)s[s.plane==='xy'?'stepY':'stepZ']=o.stepV;
            for(const key of ['stepX','stepY','stepZ'] as const)s[key]=Math.max(.0001,Number(s[key])||1);
            if(s.plane!=='custom'){s.stepU=s[s.plane==='yz'?'stepY':'stepX'];s.stepV=s[s.plane==='xy'?'stepY':'stepZ'];}
            for(const key of ['snapStepX','snapStepY','snapStepZ'] as const)s[key]=Math.max(0,Number(s[key])||0);s.stepU=Math.max(.0001,Number(s.stepU)||1);s.stepV=Math.max(.0001,Number(s.stepV)||1);s.subdivisions=Math.max(1,Math.round(Number(s.subdivisions)||1));s.majorEvery=Math.max(1,Math.round(Number(s.majorEvery)||1));s.size=Math.max(1,Number(s.size)||10);if(!['lines','dotted'].includes(s.kind))s.kind='lines';Attachments.get(this)?.canvas.useGrid?.(this);this.draw();}
        public setPlane(plane:Plane|{origin:Vec3;axisU:Vec3;axisV:Vec3}):this{this.options=typeof plane==='string'?{plane}:{plane:'custom',...plane};return this;}
        public configure(options:Options):this{this.options=options;return this;}
        public get Controls():HTMLElement{const bar=document.createElement('header');bar.style.cssText='display:flex;gap:5px;align-items:center;padding:5px;background:linear-gradient(180deg,#363b40,#25292d);color:white;font:11px system-ui';for(const axis of ['X','Y','Z'] as const){const key=axis==='X'?'stepX':axis==='Y'?'stepY':'stepZ',label=document.createElement('label');label.textContent='Spacing '+axis+' ';const input=document.createElement('input');input.type='number';input.min='.0001';input.value=String(this.options[key]);input.style.width='44px';input.onchange=()=>{this.configure({[key]:Number(input.value)});Attachments.get(this)?.canvas.setGrid?.({[key]:Number(input.value)});};label.append(input);bar.append(label);const snap=axis==='X'?'snapX':axis==='Y'?'snapY':'snapZ',button=document.createElement('button');button.type='button';button.textContent='Snap '+axis;button.setAttribute('aria-pressed',String(this.options[snap]));button.onclick=()=>{this.configure({[snap]:!this.options[snap]});button.setAttribute('aria-pressed',String(this.options[snap]));Attachments.get(this)?.canvas.setSnap?.({[axis.toLowerCase()]:this.options[snap]});};bar.append(button);const snapLabel=document.createElement('label');snapLabel.textContent='Snap step '+axis+' ';const snapInput=document.createElement('input');snapInput.type='number';snapInput.min='.0001';snapInput.dataset.snapStep=axis.toLowerCase();snapInput.setAttribute('aria-label','Snap spacing '+axis);const snapStep=axis==='X'?'snapStepX':axis==='Y'?'snapStepY':'snapStepZ';snapInput.value=String(this.options[snapStep]||this.options[key]/this.options.subdivisions);snapInput.style.width='44px';snapInput.onchange=()=>this.configure({[snapStep]:Number(snapInput.value)});snapLabel.append(snapInput);bar.append(snapLabel);}const kind=document.createElement('select');for(const value of ['lines','dotted'] as const){const option=document.createElement('option');option.value=value;option.textContent=value;kind.append(option);}kind.value=this.options.kind;kind.onchange=()=>{this.configure({kind:kind.value as 'lines'|'dotted'});Attachments.get(this)?.canvas.setGrid?.({kind:this.options.kind});};bar.append(kind);for(const control of bar.querySelectorAll<HTMLElement>('button,input,select')){control.style.cssText+=';height:25px;border:1px solid #15181a;border-radius:4px;background:linear-gradient(180deg,#444a50,#30353a);color:white;text-shadow:0 -1px 1px #0009;';if(control.tagName==='BUTTON'){const paint=()=>{control.style.background=control.getAttribute('aria-pressed')==='true'?'linear-gradient(180deg,#ff4dad,#e40c88,#b90769)':'linear-gradient(180deg,#444a50,#30353a)';};paint();const button=control as HTMLButtonElement,click=button.onclick;button.onclick=e=>{click?.call(button,e);paint();};}}return bar;}
        public attach(canvas:CanvasTarget):this
        {
            this.detach();let overlay:HTMLCanvasElement|null=null,unsub:(()=>void)|null=null;
            if(!canvas.rendersGrid){overlay=document.createElement('canvas');overlay.dataset.grid3d='';overlay.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1';canvas.appendChild(overlay);unsub=canvas.onFrame?.(()=>this.draw())??null;}
            Attachments.set(this,{canvas,overlay,unsub});canvas.useGrid?.(this);this.draw();return this;
        }
        public detach():this{const a=Attachments.get(this);a?.unsub?.();a?.overlay?.remove();a?.canvas.useGrid?.(null);Attachments.delete(this);return this;}
        public nearest(point:Vec3):Hit
        {
            const s=state(this),d=sub(point,s.origin),du=(s.plane==='yz'?s.snapStepY:s.snapStepX)||s.stepU/s.subdivisions,dv=(s.plane==='xy'?s.snapStepY:s.snapStepZ)||s.stepV/s.subdivisions,u=Math.round(dot(d,s.axisU)/du),vv=Math.round(dot(d,s.axisV)/dv),p=add(s.origin,add(scale(s.axisU,u*du),scale(s.axisV,vv*dv)));
            return{point:p,distance:len(sub(p,point)),u,v:vv,major:u%s.majorEvery===0&&vv%s.majorEvery===0};
        }
        public project(point:Vec3):Vec3{const s=state(this),p={...point};if(s.plane==='custom')return this.nearest(point).point;for(const axis of ['x','y','z'] as const){const enabled=s[axis==='x'?'snapX':axis==='y'?'snapY':'snapZ'],step=s[axis==='x'?'snapStepX':axis==='y'?'snapStepY':'snapStepZ']||s[axis==='x'?'stepX':axis==='y'?'stepY':'stepZ']/s.subdivisions;if(enabled)p[axis]=s.origin[axis]+Math.round((point[axis]-s.origin[axis])/step)*step;}return p;}
        private draw():void {
            const a=Attachments.get(this);if(!a?.overlay)return;
            const r=(a.canvas.selectionSurface??a.canvas).getBoundingClientRect(),dpr=Math.min(2,globalThis.devicePixelRatio||1),c=a.overlay;
            const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(c.width!==w)c.width=w;if(c.height!==h)c.height=h;
            const ctx=c.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,w,h);this.drawOn(ctx,r.width,r.height,dpr);
        }
        /** Canvas3D calls this after its background and before opaque geometry. */
        public drawOn(ctx:CanvasRenderingContext2D,width:number,height:number,dpr=1):void {
            const a=Attachments.get(this),s=state(this);if(!a||!s.enabled||width<=0||height<=0)return;
            const surface=a.canvas,near=.080001;
            const extent=s.infinite?Math.max(s.size,len(surface.camera?.position??v())*2):s.size;
            const limit=s.kind==='dotted'?32:120,baseU=s.stepU/s.subdivisions,baseV=s.stepV/s.subdivisions;
            const strideU=Math.max(1,Math.ceil(extent/(limit*baseU))),strideV=Math.max(1,Math.ceil(extent/(limit*baseV))),du=baseU*strideU,dv=baseV*strideV;
            const countU=Math.min(limit,Math.ceil(extent/du)),countV=Math.min(limit,Math.ceil(extent/dv));
            const light=surface.getAttribute('theme')==='light',minor=light?'rgba(28,36,44,.22)':'rgba(170,180,190,.20)',major=light?'rgba(90,40,75,.38)':'rgba(228,12,136,.42)';
            ctx.save();ctx.scale(dpr,dpr);
            // Clip in 3D at the near plane, then in 2D to the viewport. Never
            // send behind-camera or unbounded projected coordinates to Canvas.
            const line=(first:Vec3,last:Vec3,isMajor:boolean)=>{
                let p=surface.projectWorld(first),q=surface.projectWorld(last);
                if(p.z<near&&q.z<near)return;
                if(p.z<near){const t=(near-p.z)/(q.z-p.z);first=add(first,scale(sub(last,first),t));p=surface.projectWorld(first);}
                if(q.z<near){const t=(near-q.z)/(p.z-q.z);last=add(last,scale(sub(first,last),t));q=surface.projectWorld(last);}
                if(![p.x,p.y,q.x,q.y].every(Number.isFinite))return;
                const dx=q.x-p.x,dy=q.y-p.y;let begin=0,end=1;
                for(const [d,n] of [[-dx,p.x],[dx,width-p.x],[-dy,p.y],[dy,height-p.y]]){
                    if(Math.abs(d)<1e-12){if(n<0)return;continue;}const t=n/d;
                    if(d<0){if(t>end)return;begin=Math.max(begin,t);}else{if(t<begin)return;end=Math.min(end,t);}
                }
                ctx.beginPath();ctx.moveTo(p.x+begin*dx,p.y+begin*dy);ctx.lineTo(p.x+end*dx,p.y+end*dy);ctx.strokeStyle=isMajor?major:minor;ctx.lineWidth=isMajor?1:.65;ctx.stroke();
            };
            if(s.kind==='dotted'){
                for(let u=-countU;u<=countU;u++)for(let w=-countV;w<=countV;w++){
                    const p=surface.projectWorld(add(s.origin,add(scale(s.axisU,u*du),scale(s.axisV,w*dv))));if(p.z<near||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.y<0||p.x>width||p.y>height)continue;
                    ctx.fillStyle=(u*strideU)%(s.majorEvery*s.subdivisions)===0&&(w*strideV)%(s.majorEvery*s.subdivisions)===0?major:minor;ctx.beginPath();ctx.arc(p.x,p.y,1.1,0,Math.PI*2);ctx.fill();
                }
            }else{
                for(let i=-countV;i<=countV;i++)line(add(s.origin,add(scale(s.axisU,-countU*du),scale(s.axisV,i*dv))),add(s.origin,add(scale(s.axisU,countU*du),scale(s.axisV,i*dv))),(i*strideV)%(s.majorEvery*s.subdivisions)===0);
                for(let i=-countU;i<=countU;i++)line(add(s.origin,add(scale(s.axisV,-countV*dv),scale(s.axisU,i*du))),add(s.origin,add(scale(s.axisV,countV*dv),scale(s.axisU,i*du))),(i*strideU)%(s.majorEvery*s.subdivisions)===0);
            }
            ctx.restore();
        }
    }
}
export default Grid3D.Grid3D;
export type Grid3DOptions=Grid3D.Options;
export type Grid3DHit=Grid3D.Hit;
