import { Component, Css, Templates } from '../../../core/index.ts';
import Dockable from '../../../../../../../../Downloads/Graphics-Seven-Fixes/components/graphics/2D/modifiers/Dockable.ts';
import Mover from './modifiers/Mover.ts';
import Resizer from './modifiers/Resizer.ts';
const interactionCleanup=new WeakMap<object,Set<()=>void>>();
import type { Canvas2D } from './Canvas2D.ts';
type Factory=(options:Record<string,number|string>)=>SVGElement;
const registry=new Map<string,Factory>();
const n=(o:Record<string,number|string>,key:string,fallback:number)=>Number.isFinite(Number(o[key]))?Number(o[key]):fallback;
const shape=(tag:string,attrs:Record<string,string|number>)=>{const el=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,String(v));return el;};
registry.set('rectangle',o=>shape('rect',{x:n(o,'x',30),y:n(o,'y',30),width:n(o,'width',120),height:n(o,'height',80)}));
registry.set('roundedRectangle',o=>shape('rect',{x:n(o,'x',30),y:n(o,'y',30),width:n(o,'width',120),height:n(o,'height',80),rx:n(o,'radius',12)}));
registry.set('circle',o=>shape('circle',{cx:n(o,'x',110),cy:n(o,'y',100),r:n(o,'radius',50)}));
registry.set('ellipse',o=>shape('ellipse',{cx:n(o,'x',110),cy:n(o,'y',100),rx:n(o,'radiusX',65),ry:n(o,'radiusY',40)}));
registry.set('line',o=>shape('line',{x1:n(o,'x',30),y1:n(o,'y',30),x2:n(o,'x2',160),y2:n(o,'y2',120)}));
for(const name of ['triangle','polygon','star'])registry.set(name,o=>{const sides=name==='triangle'?3:Math.max(3,Math.min(128,Math.round(n(o,'sides',5)))),count=name==='star'?sides*2:sides,cx=n(o,'x',110),cy=n(o,'y',100),radius=n(o,'radius',60);return shape('polygon',{points:Array.from({length:count},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/count,r=name==='star'&&i%2?n(o,'innerRadius',radius*.45):radius;return (cx+Math.cos(a)*r)+','+(cy+Math.sin(a)*r);}).join(' ')});});
registry.set('polyline',o=>shape('polyline',{points:String(o.points??'30,120 70,40 120,95 170,30')}));
registry.set('bezier',o=>shape('path',{d:String(o.d??'M30 120 C60 10 140 10 180 120')}));
registry.set('path',o=>shape('path',{d:String(o.d??'M30 120 L80 30 L150 120 Z')}));
registry.set('arc',o=>shape('path',{d:String(o.d??'M40 110 A60 60 0 0 1 160 110')}));
registry.set('sector',o=>shape('path',{d:String(o.d??'M100 100 L160 100 A60 60 0 0 0 100 40 Z')}));
registry.set('ring',o=>{const x=n(o,'x',100),y=n(o,'y',100),r=n(o,'radius',60),inner=n(o,'innerRadius',35);return shape('path',{'fill-rule':'evenodd',d:`M${x-r} ${y}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0 M${x-inner} ${y}a${inner} ${inner} 0 1 0 ${2*inner} 0a${inner} ${inner} 0 1 0 ${-2*inner} 0`});});
registry.set('text',o=>{const el=shape('text',{x:n(o,'x',30),y:n(o,'y',70),'font-size':n(o,'fontSize',28)});el.textContent=String(o.text??'Text');return el;});
registry.set('image',o=>shape('image',{x:n(o,'x',30),y:n(o,'y',30),width:n(o,'width',120),height:n(o,'height',80),href:String(o.src??'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80"%3E%3Crect width="120" height="80" fill="%237b9fc4"/%3E%3C/svg%3E')}));

const html=Templates.Template.Html;
const styles=new Css.Stylesheet([
 new Css.Rule('arianna-primitives-2d,.Primitives2D',{Display:'flex',FlexWrap:'nowrap',Overflow:'auto',AlignItems:'center',Gap:'5px',Padding:'6px',Background:'linear-gradient(180deg,#363b40,#25292d)',Color:'#eef1f4',Border:'1px solid #15191d',BorderRadius:'6px',Font:'11px system-ui'}),
 new Css.Rule('.Primitives2D button,.Primitives2D input,.Primitives2D select',{Background:'linear-gradient(180deg,#454c53,#30363c)',Color:'inherit',Border:'1px solid #161a1e',BorderRadius:'4px',Padding:'5px 7px',MinHeight:'27px',Font:'inherit'}),
 new Css.Rule('.Primitives2D button:hover',{Background:'linear-gradient(180deg,#ff4dad,#e40c88,#b90769)',Color:'#fff',Cursor:'pointer'}),
 new Css.Rule('.Primitives2D[theme="light"]',{Background:'linear-gradient(180deg,#fafbfc,#e0e4e7)',Color:'#25292d',BorderColor:'#b8bec4'}),
 new Css.Rule('.Primitives2D[theme="light"] button,.Primitives2D[theme="light"] input,.Primitives2D[theme="light"] select',{Background:'linear-gradient(180deg,#fff,#e5e8eb)',Color:'#25292d',BorderColor:'#bcc2c8'})
]);
@Component('arianna-primitives-2d',styles,{Shadow:false,Attributes:['theme','for'],Properties:['canvas']})
export class Primitives2D extends HTMLElement {
 public template=html``;
 public canvas:Canvas2D.Canvas2D|null=null;
 public Dock:InstanceType<typeof Dockable>|null=null;
 private dockHost:HTMLElement|null=null;
 public dock(container:HTMLElement,position:'top'|'bottom'|'left'|'right'|'float'='top'):this{
  if(container===this||this.contains(container))throw new Error('Primitives2D requires an independent dock container');
  if(this.Dock&&this.dockHost===container){this.Dock.dock(position);return this;}
  this.Dock?.destroy();if(!this.parentElement)container.appendChild(this);
  this.dockHost=container;this.Dock=new Dockable();
  this.Dock.attach(this,{container,position,title:'Primitives2D',theme:this.getAttribute('theme')==='light'?'light':'dark',width:720,height:64,dockWidth:220,dockHeight:64,minWidth:180,minHeight:64,barPosition:'left',respectCanvas:true});
  return this;
 }
 public dispose():void{for(const release of interactionCleanup.get(this)??[])release();interactionCleanup.delete(this);this.Dock?.destroy();this.Dock=null;this.dockHost=null;this.canvas=null;}
 public options:Record<string,number|string>={};
 constructor(options:{canvas?:Canvas2D.Canvas2D;theme?:'dark'|'light'}={}){super();this.canvas=options.canvas??null;if(options.theme)this.setAttribute('theme',options.theme);}
 public onCreated():void{if(this.isConnected)this.onConnected();}
 public onConnected():void{this.classList.add('Primitives2D');this.refresh();}
 public onAttributeChanged(name:string):void{if(name==='for')this.canvas=null;}
 public bind(canvas:Canvas2D.Canvas2D|null):this{this.canvas=canvas;return this;}
 private resolve():Canvas2D.Canvas2D|null{return this.canvas??(this.getAttribute('for')?document.getElementById(this.getAttribute('for')!):null) as Canvas2D.Canvas2D|null;}
 public refresh():this{
  this.replaceChildren();this.setAttribute('role','toolbar');this.setAttribute('aria-label','Primitives2D');
  for(const name of this.names()){
   const button=document.createElement('button');button.type='button';button.style.cssText='flex:0 0 24px;width:24px;height:24px;min-height:24px;padding:3px;display:flex;align-items:center;justify-content:center';button.setAttribute('aria-label',name);const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 220 180');icon.setAttribute('width','14');icon.setAttribute('height','14');icon.setAttribute('aria-hidden','true');const preview=registry.get(name)!({});preview.setAttribute('fill',name==='text'?'currentColor':'none');preview.setAttribute('stroke','currentColor');preview.setAttribute('stroke-width','1.2');preview.setAttribute('vector-effect','non-scaling-stroke');icon.appendChild(preview);button.appendChild(icon);button.title='Create '+name;button.onclick=()=>{try{this.create(name,this.options);}catch(error){this.dispatchEvent(new CustomEvent('arianna:primitive-error',{bubbles:true,detail:{error,name}}));}};this.appendChild(button);
  }return this;
 }
 public names():string[]{return [...registry.keys()];}
 public static register(name:string,create:Factory):void{registry.set(name,create);}
 public create(name:string,options:Record<string,number|string>={}):SVGElement{
  const factory=registry.get(name);if(!factory)throw new RangeError('Unknown primitive: '+name);
  const element=factory(options);element.setAttribute('fill',String(options.fill??'#e40c88'));element.setAttribute('stroke',String(options.stroke??'#ff8bcf'));element.setAttribute('stroke-width',String(options.strokeWidth??2));
  if(['line','polyline','bezier','arc','path'].includes(name))element.setAttribute('fill','none');
  const canvas=this.resolve();if(canvas){
   const surface=canvas.drawingSurface;surface.appendChild(element);
   let box={x:0,y:0,width:120,height:80};try{const bounds=(element as SVGGraphicsElement).getBBox();box={x:bounds.x-3,y:bounds.y-3,width:Math.max(12,bounds.width+6),height:Math.max(12,bounds.height+6)};}catch{}
   const foreign=document.createElementNS('http://www.w3.org/2000/svg','foreignObject');foreign.setAttribute('width','1');foreign.setAttribute('height','1');foreign.style.cssText='overflow:visible;pointer-events:none';
   const origin=document.createElement('div');origin.style.cssText='position:relative;width:1px;height:1px;overflow:visible;pointer-events:none';
   const wrapper=document.createElement('div');wrapper.className='Primitive2D-Object';wrapper.style.cssText='position:absolute;pointer-events:auto;touch-action:none;left:'+box.x+'px;top:'+box.y+'px;width:'+box.width+'px;height:'+box.height+'px';
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',[box.x,box.y,box.width,box.height].join(' '));svg.setAttribute('preserveAspectRatio','none');svg.style.cssText='display:block;width:100%;height:100%;overflow:visible';svg.appendChild(element);wrapper.appendChild(svg);origin.appendChild(wrapper);foreign.appendChild(origin);surface.appendChild(foreign);
   const mover=new Mover();mover.bounds='none';mover.attach(wrapper);const resizer=new Resizer(undefined,{minWidth:12,minHeight:12});resizer.attach(wrapper);
   let cleanups=interactionCleanup.get(this);if(!cleanups){cleanups=new Set();interactionCleanup.set(this,cleanups);}cleanups.add(()=>{mover.destroy();resizer.destroy();foreign.remove();});
  }
  this.dispatchEvent(new CustomEvent('arianna:primitive-create',{bubbles:true,composed:true,detail:{name,element,canvas,source:this}}));return element;
 }

}
export default Primitives2D;
