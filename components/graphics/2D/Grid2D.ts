/** Independent 2D reference grid and grid projection target. */
import { Component, Templates } from '../../../core/index.ts';
const html=Templates.Template.Html;

export namespace Grid2D
{
    export interface Vec2{x:number;y:number;}
    export type Kind='cartesian'|'isometric'|'polar'|'dotted';
    export interface Options
    {
        theme?:'auto'|'dark'|'light';enabled?:boolean;kind?:Kind;origin?:Vec2;stepX?:number;stepY?:number;
        subdivisions?:number;majorEvery?:number;minorOpacity?:number;majorOpacity?:number;dotRadius?:number;majorDotRadius?:number;
        background?:string;infinite?:boolean;snapX?:boolean;snapY?:boolean;snapStepX?:number;snapStepY?:number;
    }
    export interface Hit{point:Vec2;distance:number;u:number;v:number;major:boolean;}
    export interface CanvasTarget{world:HTMLElement;navigation?:'none'|'pan'|'zoom'|'tilt';setNavigation?(mode:'none'|'pan'|'zoom'|'tilt'):unknown;viewport?:{panX:number;panY:number;zoom:number};drawingSurface?:SVGSVGElement;selectionSurface?:HTMLElement;useGrid?(grid:Grid2D|null):unknown;getGrid?():unknown;setGrid?(value:boolean|Record<string,unknown>):unknown;setSnap?(value:Record<string,unknown>):unknown;addEventListener?(...args:Parameters<HTMLElement['addEventListener']>):void;}

    const Defaults:Required<Options>={background:'transparent',theme:'auto',enabled:true,kind:'cartesian',origin:{x:0,y:0},stepX:20,stepY:20,subdivisions:4,majorEvery:5,minorOpacity:.10,majorOpacity:.22,dotRadius:1,majorDotRadius:1.6,infinite:true,snapX:true,snapY:true,snapStepX:0,snapStepY:0};
    const States=new WeakMap<HTMLElement,Required<Options>>();
    const state=(host:HTMLElement)=>{let s=States.get(host);if(!s){s={...Defaults,origin:{...Defaults.origin}};States.set(host,s);}return s;};
    const ExplicitOpacity=new WeakMap<HTMLElement,Set<string>>();
    const ThemeObservers=new WeakMap<HTMLElement,MutationObserver>();
    const Views=new WeakMap<HTMLElement,{controller:AbortController;resize:ResizeObserver|null}>();
    // Light defaults preserve the minor/major hierarchy with comparable Dark contrast.
    const LightDefaults={minorOpacity:.153,majorOpacity:.321};
    let sequence=0;
    const NativeViews=new WeakMap<HTMLElement,{group:SVGGElement;rect:SVGRectElement;background:SVGRectElement;pattern:SVGPatternElement;minor:SVGPatternElement;key:string;id:string}>();
    const ForeignObjects=new WeakMap<HTMLElement,SVGForeignObjectElement>();
    const Overlays=new WeakMap<HTMLElement,HTMLElement>();
    const Targets=new WeakMap<HTMLElement,{canvas:CanvasTarget;previous?:unknown}>();

    @Component('arianna-grid-2d',{}, {Shadow:false,Attributes:['theme','enabled','kind','step-x','step-y','subdivisions','major-every','dot-radius','major-dot-radius','infinite','snap-x','snap-y','snap-step-x','snap-step-y'],Properties:['options']})
    export class Grid2D extends HTMLElement
    {
        public template=html``;
        constructor(options:Options={}){super();this.options=options;}
        public onCreated():void{this.style.display='none';}
        public onConnected():void{for(const name of ['theme','enabled','kind','step-x','step-y','subdivisions','major-every','dot-radius','major-dot-radius','infinite','snap-x','snap-y','snap-step-x','snap-step-y'])if(this.hasAttribute(name))this.onAttributeChanged(name);}
        public onUnmount():void{this.detach();}
        public get options():Required<Options>{
            const s=state(this),explicit=ExplicitOpacity.get(this),theme=this.Theme();
            return {...s,origin:{...s.origin},minorOpacity:theme==='light'&&!explicit?.has('minorOpacity')?LightDefaults.minorOpacity:s.minorOpacity,majorOpacity:theme==='light'&&!explicit?.has('majorOpacity')?LightDefaults.majorOpacity:s.majorOpacity};
        }
        private Theme():'dark'|'light'{const s=state(this);if(s.theme!=='auto')return s.theme;const host=Targets.get(this)?.canvas.world.closest('[theme]');return host?.getAttribute('theme')==='light'?'light':'dark';}
        public set options(value:Options){const s=state(this);let explicit=ExplicitOpacity.get(this);if(!explicit){explicit=new Set();ExplicitOpacity.set(this,explicit);}for(const key of ['minorOpacity','majorOpacity'] as const)if(value[key]!==undefined)explicit.add(key);Object.assign(s,Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined)));if(value.origin)s.origin={...value.origin};this.NormalizeOptions();Targets.get(this)?.canvas.useGrid?.(this);this.render();}
        public configure(value:Options):this{this.options=value;return this;}
        /** Optional independent header; Canvas2D already exposes the same controls. */
        public get Controls():HTMLElement {const bar=document.createElement('header');bar.className='Grid2D-Toolbar';bar.style.cssText='display:flex;align-items:center;gap:5px;padding:5px;background:linear-gradient(180deg,#363b40,#25292d);color:white;font:11px system-ui';
            const toggle=document.createElement('button');toggle.type='button';toggle.textContent='Grid';toggle.dataset.role='grid';toggle.setAttribute('aria-pressed',String(this.options.enabled));toggle.onclick=()=>{this.configure({enabled:!this.options.enabled});toggle.setAttribute('aria-pressed',String(this.options.enabled));Targets.get(this)?.canvas.setGrid?.({enabled:this.options.enabled});};bar.append(toggle);const pan=document.createElement('button');pan.type='button';pan.textContent='Pan';pan.dataset.role='pan';pan.setAttribute('aria-pressed',String(Targets.get(this)?.canvas.navigation==='pan'));pan.onclick=()=>{const canvas=Targets.get(this)?.canvas;if(canvas?.setNavigation){canvas.setNavigation(canvas.navigation==='pan'?'none':'pan');pan.setAttribute('aria-pressed',String(canvas.navigation==='pan'));}};bar.append(pan);
            for(const axis of ['X','Y'] as const){const label=document.createElement('label');label.textContent='Spacing '+axis+' ';const input=document.createElement('input');input.type='number';input.min='.1';input.value=String(this.options[axis==='X'?'stepX':'stepY']);input.style.width='48px';input.onchange=()=>{const value={ [axis==='X'?'stepX':'stepY']:Number(input.value)};this.configure(value);Targets.get(this)?.canvas.setGrid?.(value);};label.append(input);bar.append(label);const button=document.createElement('button');button.type='button';button.textContent='Snap '+axis;const key=axis==='X'?'snapX':'snapY';button.setAttribute('aria-pressed',String(this.options[key]));button.onclick=()=>{this.configure({[key]:!this.options[key]});button.setAttribute('aria-pressed',String(this.options[key]));Targets.get(this)?.canvas.setSnap?.({[axis.toLowerCase()]:this.options[key]});};bar.append(button);const snapLabel=document.createElement('label');snapLabel.textContent='Snap step '+axis+' ';const snapInput=document.createElement('input');snapInput.type='number';snapInput.min='.1';snapInput.dataset.snapStep=axis.toLowerCase();snapInput.setAttribute('aria-label','Snap spacing '+axis);const stepKey=axis==='X'?'snapStepX':'snapStepY';snapInput.value=String(this.options[stepKey]||this.options[axis==='X'?'stepX':'stepY']/this.options.subdivisions);snapInput.style.width='48px';snapInput.onchange=()=>this.configure({[stepKey]:Number(snapInput.value)});snapLabel.append(snapInput);bar.append(snapLabel);}
            const style=document.createElement('select');style.setAttribute('aria-label','Grid style');for(const [value,label]of [['cartesian','Lines'],['dotted','Dotted'],['polar','Polar'],['isometric','Isometric']]){const option=document.createElement('option');option.value=value;option.textContent=label;style.append(option);}style.value=this.options.kind;style.onchange=()=>{this.configure({kind:style.value as Kind});Targets.get(this)?.canvas.setGrid?.({kind:style.value});};bar.append(style);for(const control of bar.querySelectorAll<HTMLElement>('button,input,select')){control.style.cssText+=';height:25px;border:1px solid #15181a;border-radius:4px;background:linear-gradient(180deg,#444a50,#30353a);color:white;text-shadow:0 -1px 1px #0009;';if(control.tagName==='BUTTON'){const paint=()=>{control.style.background=control.getAttribute('aria-pressed')==='true'?'linear-gradient(180deg,#ff4dad,#e40c88,#b90769)':'linear-gradient(180deg,#444a50,#30353a)';};paint();const button=control as HTMLButtonElement,click=button.onclick;button.onclick=e=>{click?.call(button,e);paint();};}}return bar;}
        public attach(canvas:CanvasTarget):this
        {
            this.detach();const previous=canvas.getGrid?.();canvas.setGrid?.(false);Targets.set(this,{canvas,previous});
            const overlay=document.createElement('div');overlay.dataset.grid2d='';
            overlay.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:0;transform-origin:0 0';
            const drawing=canvas.drawingSurface;
            if(drawing){
                const ns='http://www.w3.org/2000/svg',group=document.createElementNS(ns,'g'),defs=document.createElementNS(ns,'defs'),pattern=document.createElementNS(ns,'pattern'),minor=document.createElementNS(ns,'pattern'),rect=document.createElementNS(ns,'rect'),background=document.createElementNS(ns,'rect'),id='arianna-grid-'+(++sequence);
                group.setAttribute('data-grid2d','');group.style.pointerEvents='none';pattern.id=id;minor.id=id+'-minor';for(const item of [pattern,minor])item.setAttribute('patternUnits','userSpaceOnUse');defs.append(minor,pattern);group.append(defs,background,rect);drawing.prepend(group);NativeViews.set(this,{group,rect,background,pattern,minor,key:'',id});
            }else canvas.world.prepend(overlay);
            Overlays.set(this,overlay);
            const controller=new AbortController();canvas.addEventListener?.('arianna:viewport',()=>this.render(),{signal:controller.signal});const surface=canvas.selectionSurface??canvas.world;
            const resize=typeof ResizeObserver==='function'?new ResizeObserver(()=>this.render()):null;resize?.observe(surface);Views.set(this,{controller,resize});
            const host=canvas.world.closest('[theme]');
            if(host&&typeof MutationObserver==='function'){const observer=new MutationObserver(()=>this.render());observer.observe(host,{attributes:true,attributeFilter:['theme']});ThemeObservers.set(this,observer);}
            canvas.useGrid?.(this);this.render();return this;
        }
        public detach():this{Views.get(this)?.controller.abort();Views.get(this)?.resize?.disconnect();Views.delete(this);ThemeObservers.get(this)?.disconnect();ThemeObservers.delete(this);const target=Targets.get(this);target?.canvas.useGrid?.(null);NativeViews.get(this)?.group.remove();NativeViews.delete(this);ForeignObjects.get(this)?.remove();ForeignObjects.delete(this);Overlays.get(this)?.remove();Overlays.delete(this);if(target?.previous&&target.canvas.setGrid)target.canvas.setGrid(target.previous as Record<string,unknown>);Targets.delete(this);return this;}
        public nearest(point:Vec2):Hit
        {
            const s=state(this),sx=s.snapStepX||s.stepX/s.subdivisions,sy=s.snapStepY||s.stepY/s.subdivisions;
            if(s.kind==='polar')
            {
                const dx=point.x-s.origin.x,dy=point.y-s.origin.y,r=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);
                const rr=Math.round(r/sx)*sx,aa=Math.round(angle/(Math.PI/12))*(Math.PI/12);
                const p={x:s.origin.x+Math.cos(aa)*rr,y:s.origin.y+Math.sin(aa)*rr};
                return{point:p,distance:Math.hypot(p.x-point.x,p.y-point.y),u:rr,v:aa,major:Math.round(rr/s.stepX)%s.majorEvery===0};
            }
            const dx=(point.x-s.origin.x)/sx,dy=(point.y-s.origin.y)/sy;
            const u=Math.round(s.kind==='isometric'?dx+dy:dx),v=Math.round(s.kind==='isometric'?dy-dx:dy);
            const p=s.kind==='isometric'
                ?{x:s.origin.x+(u-v)*sx*.5,y:s.origin.y+(u+v)*sy*.5}
                :{x:s.origin.x+u*sx,y:s.origin.y+v*sy};
            return{point:p,distance:Math.hypot(p.x-point.x,p.y-point.y),u,v,major:u%s.majorEvery===0&&v%s.majorEvery===0};
        }
        public project(point:Vec2):Vec2{const p=this.nearest(point).point,s=this.options;return {x:s.snapX?p.x:point.x,y:s.snapY?p.y:point.y};}
        public onAttributeChanged(name:string):void {
            const attrs:Record<string,keyof Options>={'theme':'theme','enabled':'enabled','kind':'kind','step-x':'stepX','step-y':'stepY','subdivisions':'subdivisions','major-every':'majorEvery','dot-radius':'dotRadius','major-dot-radius':'majorDotRadius','infinite':'infinite','snap-x':'snapX','snap-y':'snapY','snap-step-x':'snapStepX','snap-step-y':'snapStepY'};
            const key=attrs[name],value=this.getAttribute(name);if(!key||value===null)return;
            this.configure({[key]:['enabled','infinite','snapX','snapY'].includes(key)?value!=='false':key==='kind'||key==='theme'?value:Number(value)});
        }
        private NormalizeOptions():void{const s=state(this);s.snapStepX=Math.max(0,Number(s.snapStepX)||0);s.snapStepY=Math.max(0,Number(s.snapStepY)||0);if(!['auto','dark','light'].includes(s.theme))s.theme='auto';s.stepX=Math.max(.0001,Number(s.stepX)||20);s.stepY=Math.max(.0001,Number(s.stepY)||s.stepX);s.subdivisions=Math.max(1,Math.round(Number(s.subdivisions)||1));s.majorEvery=Math.max(1,Math.round(Number(s.majorEvery)||1));s.dotRadius=Math.max(.25,Number(s.dotRadius)||1);s.majorDotRadius=Math.max(.25,Number(s.majorDotRadius)||1.6);if(!['cartesian','dotted','polar','isometric'].includes(s.kind))s.kind='cartesian';}
        /** SVG patterns stay in drawing coordinates; no foreignObject/CSS paint dependency. */
        private RenderNative(view:NonNullable<ReturnType<typeof NativeViews.get>>):void {
            const s=this.options,canvas=Targets.get(this)?.canvas,svg=canvas?.drawingSurface;if(!svg)return;
            const box=svg.viewBox.baseVal;let x=box.x,y=box.y,width=box.width||520,height=box.height||300;
            if(s.infinite){const surface=canvas.selectionSurface??canvas.world,bounds=surface.getBoundingClientRect(),matrix=svg.getScreenCTM();if(matrix){try{const inverse=matrix.inverse(),points=[[bounds.left,bounds.top],[bounds.right,bounds.top],[bounds.left,bounds.bottom],[bounds.right,bounds.bottom]].map(([cx,cy])=>{const p=svg.createSVGPoint();p.x=cx;p.y=cy;return p.matrixTransform(inverse);});x=Math.floor(Math.min(...points.map(p=>p.x)))-s.stepX*2;y=Math.floor(Math.min(...points.map(p=>p.y)))-s.stepY*2;width=Math.ceil(Math.max(...points.map(p=>p.x))-x+s.stepX*2);height=Math.ceil(Math.max(...points.map(p=>p.y))-y+s.stepY*2);}catch{}}}
            for(const rect of [view.rect,view.background])for(const [key,value]of Object.entries({x,y,width,height})){const text=String(value);if(rect.getAttribute(key)!==text)rect.setAttribute(key,text);}
            const visible=s.enabled?'':'none';if(view.rect.style.display!==visible)view.rect.style.display=visible;if(view.background.getAttribute('fill')!==s.background)view.background.setAttribute('fill',s.background);const backgroundDisplay=s.background==='transparent'?'none':'';if(view.background.style.display!==backgroundDisplay)view.background.style.display=backgroundDisplay;
            const theme=this.Theme(),key=JSON.stringify([theme,s.kind,s.stepX,s.stepY,s.subdivisions,s.majorEvery,s.minorOpacity,s.majorOpacity,s.origin,s.dotRadius,s.majorDotRadius,...(s.kind==='polar'?[x,y,width,height]:[])]);if(view.key===key)return;view.key=key;
            const ns='http://www.w3.org/2000/svg',make=(tag:string,attrs:Record<string,string|number>)=>{const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
            const color=theme==='light'?'0,0,0':'255,255,255',minor=`rgba(${color},${s.minorOpacity})`,major=`rgba(${color},${s.majorOpacity})`,sx=s.stepX/s.subdivisions,sy=s.stepY/s.subdivisions,mx=s.stepX*s.majorEvery,my=s.stepY*s.majorEvery;
            view.pattern.replaceChildren();view.minor.replaceChildren();for(const [pattern,w,h]of [[view.pattern,mx,my],[view.minor,sx,sy]] as const){pattern.setAttribute('width',String(w));pattern.setAttribute('height',String(h));pattern.setAttribute('x',String(s.origin.x));pattern.setAttribute('y',String(s.origin.y));}
            if(s.kind==='dotted'){view.minor.append(make('circle',{cx:sx/2,cy:sy/2,r:s.dotRadius,fill:minor}));view.pattern.append(make('rect',{width:mx,height:my,fill:`url(#${view.id}-minor)`}),make('circle',{cx:mx/2,cy:my/2,r:s.majorDotRadius,fill:major}));}
            else if(s.kind==='isometric'){view.minor.append(make('path',{d:`M 0 0 L ${sx} ${sy} M 0 ${sy} L ${sx} 0`,stroke:minor,'stroke-width':1,fill:'none'}));view.pattern.append(make('rect',{width:mx,height:my,fill:`url(#${view.id}-minor)`}));}
            else if(s.kind==='polar'){view.pattern.setAttribute('x',String(x));view.pattern.setAttribute('y',String(y));view.pattern.setAttribute('width',String(width));view.pattern.setAttribute('height',String(height));const cx=s.origin.x-x,cy=s.origin.y-y,radius=Math.max(...[[0,0],[width,0],[0,height],[width,height]].map(([px,py])=>Math.hypot(px-cx,py-cy))),stride=Math.max(1,Math.ceil(radius/sx/512)),step=sx*stride;for(let i=1;i<=Math.ceil(radius/step);i++)view.pattern.append(make('circle',{cx,cy,r:i*step,fill:'none',stroke:(i*stride)%(s.subdivisions*s.majorEvery)?minor:major,'stroke-width':1}));for(let i=0;i<24;i++){const a=i*Math.PI/12;view.pattern.append(make('path',{d:`M ${cx} ${cy} L ${cx+Math.cos(a)*radius} ${cy+Math.sin(a)*radius}`,stroke:minor,fill:'none'}));}}
            else {view.minor.append(make('path',{d:`M ${sx} 0 H 0 V ${sy}`,fill:'none',stroke:minor,'stroke-width':1}));view.pattern.append(make('rect',{width:mx,height:my,fill:`url(#${view.id}-minor)`}),make('path',{d:`M ${mx} 0 H 0 V ${my}`,fill:'none',stroke:major,'stroke-width':1}));}
            // Dots are located at the same intersections used by project().
            if(s.kind==='dotted'){view.minor.setAttribute('x',String(s.origin.x-sx/2));view.minor.setAttribute('y',String(s.origin.y-sy/2));view.pattern.setAttribute('x',String(s.origin.x-mx/2));view.pattern.setAttribute('y',String(s.origin.y-my/2));}
            view.rect.setAttribute('fill',`url(#${view.id})`);
        }
        private render():void
        {
            const s=this.options,native=NativeViews.get(this);if(native){this.RenderNative(native);return;}const el=Overlays.get(this);if(!el)return;el.hidden=!s.enabled;
            const target=Targets.get(this)?.canvas;let left=0,top=0;el.style.inset='0';el.style.width='auto';el.style.height='auto';const foreign=ForeignObjects.get(this);
            if(foreign){const box=target?.drawingSurface?.viewBox.baseVal;left=box?.x??0;top=box?.y??0;foreign.style.display=s.enabled?'':'none';foreign.setAttribute('x',String(box?.x??0));foreign.setAttribute('y',String(box?.y??0));foreign.setAttribute('width',String(box?.width||520));foreign.setAttribute('height',String(box?.height||300));}
            if(s.infinite&&target){const surface=target.selectionSurface??target.world,box=surface.getBoundingClientRect(),svg=target.drawingSurface,matrix=svg?.getScreenCTM();
                if(svg&&matrix){const inv=matrix.inverse(),points=[[box.left,box.top],[box.right,box.top],[box.left,box.bottom],[box.right,box.bottom]].map(([x,y])=>{const p=svg.createSVGPoint();p.x=x;p.y=y;return p.matrixTransform(inv);});left=Math.floor(Math.min(...points.map(p=>p.x)))-s.stepX*2;top=Math.floor(Math.min(...points.map(p=>p.y)))-s.stepY*2;el.style.inset='auto';el.style.left=left+'px';el.style.top=top+'px';el.style.width=Math.ceil(Math.max(...points.map(p=>p.x))-left+s.stepX*2)+'px';el.style.height=Math.ceil(Math.max(...points.map(p=>p.y))-top+s.stepY*2)+'px';}
            }else{el.style.inset='0';el.style.width='auto';el.style.height='auto';}
            if(foreign&&el.style.inset==='auto'){foreign.setAttribute('x',String(left));foreign.setAttribute('y',String(top));foreign.setAttribute('width',String(parseFloat(el.style.width)));foreign.setAttribute('height',String(parseFloat(el.style.height)));el.style.inset='0';el.style.width='auto';el.style.height='auto';}
            const minorX=s.stepX/s.subdivisions,minorY=s.stepY/s.subdivisions;
            const rgb=this.Theme()==='light'?'0,0,0':'255,255,255';
            const minor=`rgba(${rgb},${s.minorOpacity})`,major=`rgba(${rgb},${s.majorOpacity})`;
            el.dataset.gridTheme=this.Theme();
            if(s.kind==='dotted') {
                const majorX=s.stepX*s.majorEvery,majorY=s.stepY*s.majorEvery;
                el.style.backgroundImage=`radial-gradient(circle,${major} ${s.majorDotRadius}px,transparent ${s.majorDotRadius+.3}px),radial-gradient(circle,${minor} ${s.dotRadius}px,transparent ${s.dotRadius+.3}px)`;
                el.style.backgroundSize=`${majorX}px ${majorY}px,${minorX}px ${minorY}px`;
                el.style.backgroundPosition=`${s.origin.x-left-majorX/2}px ${s.origin.y-top-majorY/2}px,${s.origin.x-left-minorX/2}px ${s.origin.y-top-minorY/2}px`;
                return;
            }
            if(s.kind==='polar'){el.style.backgroundImage=`repeating-radial-gradient(circle at ${s.origin.x-left}px ${s.origin.y-top}px,transparent 0 ${minorX-1}px,${minor} ${minorX}px),repeating-conic-gradient(from 0deg at ${s.origin.x-left}px ${s.origin.y-top}px,transparent 0 14.7deg,${minor} 15deg)`;el.style.backgroundSize='100% 100%';el.style.backgroundPosition='0 0';return;}
            else if(s.kind==='isometric')el.style.backgroundImage=`linear-gradient(30deg,transparent 49.5%,${minor} 50%,transparent 50.5%),linear-gradient(150deg,transparent 49.5%,${minor} 50%,transparent 50.5%)`;
            else el.style.backgroundImage=`linear-gradient(to right,${minor} 1px,transparent 1px),linear-gradient(to bottom,${minor} 1px,transparent 1px),linear-gradient(to right,${major} 1px,transparent 1px),linear-gradient(to bottom,${major} 1px,transparent 1px)`;
            el.style.backgroundSize=s.kind==='cartesian'?`${minorX}px ${minorY}px,${minorX}px ${minorY}px,${s.stepX*s.majorEvery}px ${s.stepY*s.majorEvery}px,${s.stepX*s.majorEvery}px ${s.stepY*s.majorEvery}px`:`${s.stepX}px ${s.stepY}px`;
            el.style.backgroundPosition=`${s.origin.x-left}px ${s.origin.y-top}px`;
        }
    }
}
export default Grid2D.Grid2D;
export type Grid2DOptions=Grid2D.Options;
export type Grid2DHit=Grid2D.Hit;
