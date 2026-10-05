import { Component, Css, Templates } from '../../../core/index.ts';
import Dockable from '../2D/modifiers/Dockable.ts';
import Three from '../../../additionals/Three.ts';
import type { Canvas3D } from './Canvas3D.ts';
let sequence=0;
const html=Templates.Template.Html;
const styles=new Css.Stylesheet([
 new Css.Rule('arianna-primitives-3d,.Primitives3D',{Display:'flex',FlexWrap:'nowrap',AlignItems:'center',Gap:'5px',Padding:'6px',Background:'linear-gradient(180deg,#363b40,#25292d)',Color:'#eef1f4',Border:'1px solid #15191d',BorderRadius:'6px',Font:'11px system-ui',BoxSizing:'border-box',Overflow:'auto',AlignContent:'flex-start'}),
 new Css.Rule('.Primitives3D button,.Primitives3D input,.Primitives3D select',{Background:'linear-gradient(180deg,#454c53,#30363c)',Color:'inherit',Border:'1px solid #161a1e',BorderRadius:'4px',Padding:'5px 7px',MinHeight:'27px',Font:'inherit'}),
 new Css.Rule('.Primitives3D button:hover',{Background:'linear-gradient(180deg,#ff4dad,#e40c88,#b90769)',Color:'#fff',Cursor:'pointer'}),
 new Css.Rule('.Primitives3D[theme="light"]',{Background:'linear-gradient(180deg,#fafbfc,#e0e4e7)',Color:'#25292d',BorderColor:'#b8bec4'}),
 new Css.Rule('.Primitives3D[theme="light"] button,.Primitives3D[theme="light"] input,.Primitives3D[theme="light"] select',{Background:'linear-gradient(180deg,#fff,#e5e8eb)',Color:'#25292d',BorderColor:'#bcc2c8'})
]);
@Component('arianna-primitives-3d',styles,{Shadow:false,Attributes:['theme','for'],Properties:['canvas']})
export class Primitives3D extends HTMLElement {
 public template=html``;
 public canvas:Canvas3D.Canvas3D|null=null;
 public Dock:InstanceType<typeof Dockable>|null=null;
 private dockCleanup:(()=>void)|null=null;
 private dockHost:HTMLElement|null=null;
 public dock(container:HTMLElement,position:'top'|'bottom'|'left'|'right'|'float'='top'):this{
  if(container===this||this.contains(container))throw new Error('Primitives3D requires an independent dock container');
  if(this.Dock&&this.dockHost===container){this.Dock.dock(position);return this;}
  this.dockCleanup?.();this.dockCleanup=null;this.Dock?.destroy();if(!this.parentElement)container.appendChild(this);this.dockHost=container;
  this.Dock=new Dockable();this.Dock.attach(this,{container,position,title:'Primitives3D',theme:this.getAttribute('theme')==='light'?'light':'dark',width:720,height:64,dockHeight:64,dockWidth:220,minWidth:194,minHeight:64,barPosition:'left',respectCanvas:true});
  const bars=['.Canvas3D-Toolbar','.Canvas3D-TransformFooter','.Canvas3D-SelectionBar'].map(selector=>container.querySelector<HTMLElement>(selector));let last='';
  const update=()=>{const top=(bars[0]?.offsetTop??0)+(bars[0]?.offsetHeight??0)+6,bottom=Math.max(bars[1]?.offsetHeight??0,bars[2]?container.clientHeight-bars[2].offsetTop:0)+6,key=top+':'+bottom;if(key===last)return;last=key;this.Dock?.configure({contentInsets:{top,bottom}});};
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(update):null;for(const bar of bars)if(bar)observer?.observe(bar);container.addEventListener('arianna:toolbar-layout',update);this.dockCleanup=()=>{observer?.disconnect();container.removeEventListener('arianna:toolbar-layout',update);};update();return this;
 }
 public dispose():void{this.cancelPlacement();this.dockCleanup?.();this.dockCleanup=null;this.Dock?.destroy();this.Dock=null;this.dockHost=null;this.canvas=null;}
 public options:Record<string,number|string>={};
 private placement:AbortController|null=null;
 private restorePlacement:(()=>void)|null=null;
 public cancelPlacement():this{this.placement?.abort();this.placement=null;this.restorePlacement?.();this.restorePlacement=null;for(const button of this.querySelectorAll<HTMLButtonElement>('[data-primitive]')){button.setAttribute('aria-pressed','false');button.style.background='';}return this;}
 public arm(name:string):this{
  this.cancelPlacement();const canvas=this.resolve();if(!canvas)throw new Error('Bind Primitives3D to Canvas3D before drawing');
  const surface=canvas.selectionSurface,control=new AbortController(),cursor=surface.style.cursor,selection=canvas.Selection,enabled=selection.enabled;
  this.placement=control;selection.enabled=false;surface.style.cursor='crosshair';
  let mesh:Canvas3D.Mesh3|null=null,start:Canvas3D.Vec3|null=null,pointer:number|null=null;
  this.restorePlacement=()=>{surface.style.cursor=cursor;selection.enabled=enabled;if(pointer!==null&&surface.hasPointerCapture(pointer))surface.releasePointerCapture(pointer);};
  const hit=(e:PointerEvent):Canvas3D.Vec3|null=>{const ray=canvas.rayFromClient(e.clientX,e.clientY);if(Math.abs(ray.direction.y)<1e-7)return null;const t=-ray.origin.y/ray.direction.y;if(t<=0)return null;return canvas.snapPoint({x:ray.origin.x+t*ray.direction.x,y:0,z:ray.origin.z+t*ray.direction.z});};
  const stop=(e:PointerEvent)=>{e.preventDefault();e.stopImmediatePropagation();};
  surface.addEventListener('pointerdown',e=>{if(e.button!==0||mesh)return;const point=hit(e);if(!point)return;stop(e);start=point;pointer=e.pointerId;mesh=this.create(name,this.options,point);surface.setPointerCapture(e.pointerId);},{capture:true,signal:control.signal});
  surface.addEventListener('pointermove',e=>{if(!mesh||!start||e.pointerId!==pointer)return;stop(e);const point=hit(e);if(!point)return;const size=Math.max(.05,Math.hypot(point.x-start.x,point.z-start.z));mesh.scale={x:size,y:size,z:size};canvas.invalidate();},{capture:true,signal:control.signal});
  const finish=(e:PointerEvent)=>{if(e.pointerId!==pointer)return;stop(e);this.cancelPlacement();};
  surface.addEventListener('pointerup',finish,{capture:true,signal:control.signal});surface.addEventListener('pointercancel',finish,{capture:true,signal:control.signal});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')this.cancelPlacement();},{signal:control.signal});
  canvas.addEventListener('arianna:canvas-dispose',()=>this.cancelPlacement(),{once:true,signal:control.signal});
  for(const button of this.querySelectorAll<HTMLButtonElement>('[data-primitive]')){const active=button.dataset.primitive===name;button.setAttribute('aria-pressed',String(active));if(active)button.style.background='linear-gradient(180deg,#ff4dad,#e40c88,#b90769)';}
  return this;
 }

 constructor(options:{canvas?:Canvas3D.Canvas3D;theme?:'dark'|'light'}={}){super();this.canvas=options.canvas??null;if(options.theme)this.setAttribute('theme',options.theme);}
 public onCreated():void{if(this.isConnected)this.onConnected();}
 public onConnected():void{this.classList.add('Primitives3D');this.refresh();}
 public onAttributeChanged(name:string):void{if(name==='for')this.canvas=null;}
 public bind(canvas:Canvas3D.Canvas3D|null):this{this.canvas=canvas;return this;}
 private resolve():Canvas3D.Canvas3D|null{return this.canvas??(this.getAttribute('for')?document.getElementById(this.getAttribute('for')!):null) as Canvas3D.Canvas3D|null;}
 public refresh():this{
  this.replaceChildren();this.setAttribute('role','toolbar');this.setAttribute('aria-label','Primitives3D');
  const groups=new Map<string,HTMLElement>();
  for(const title of ['3D','2D']){const group=document.createElement('div');group.setAttribute('role','group');group.setAttribute('aria-label',title+' primitives');group.style.cssText='display:flex;align-items:center;gap:5px;flex:0 0 auto;padding-right:10px';if(title==='2D'){group.style.borderLeft='1px solid #78818b66';group.style.paddingLeft='10px';}const label=document.createElement('span');label.textContent=title;label.style.cssText='font:700 10px system-ui;padding:0 4px';group.appendChild(label);groups.set(title,group);this.appendChild(group);}
  for(const name of this.names()){
   const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Create '+name);const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('width','14');icon.setAttribute('height','14');icon.setAttribute('aria-hidden','true');icon.style.cssText='display:block;flex:none';const path=document.createElementNS(icon.namespaceURI,'path');const paths:Record<string,string>={plane:'M3 16 9 6 22 9 16 19Z',box:'M3 7 12 3 21 7 21 17 12 22 3 17Z M3 7 12 12 21 7 M12 12V22',sphere:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M3 12h18 M12 3c-6 4-6 14 0 18 6-4 6-14 0-18',cylinder:'M4 6c0-4 16-4 16 0s-16 4-16 0V18c0 4 16 4 16 0V6',cone:'M12 3 3 19c0 4 18 4 18 0Z M3 19c0-4 18-4 18 0',torus:'M22 12a10 7 0 1 1-20 0 10 7 0 0 1 20 0 M17 12a5 3 0 1 1-10 0 5 3 0 0 1 10 0',circle:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',ring:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',capsule:'M6 8a6 6 0 0 1 12 0v8a6 6 0 0 1-12 0Z M6 8c0 3 12 3 12 0',tetrahedron:'M12 3 2 20 22 20Z M12 3v12L2 20 M12 15 22 20',octahedron:'M12 2 2 12 12 22 22 12Z M2 12h20 M12 2v20',icosahedron:'M8 2 18 4 23 13 15 22 4 20 1 9Z M8 2 6 12 18 4 16 15 23 13 M6 12 4 20 M6 12 16 15 15 22'};path.setAttribute('d',paths[name]||paths.box);path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.5');path.setAttribute('stroke-linejoin','round');icon.appendChild(path);button.style.cssText='display:flex;align-items:center;justify-content:center;width:24px;height:24px;min-width:24px;min-height:24px;padding:3px';button.appendChild(icon);button.dataset.primitive=name;button.title='Create '+name;button.onclick=()=>{try{this.arm(name);}catch(error){this.dispatchEvent(new CustomEvent('arianna:primitive-error',{bubbles:true,detail:{error,name}}));}};groups.get(['plane','circle','ring'].includes(name)?'2D':'3D')!.appendChild(button);
  }return this;
 }
 public names():string[]{return ['plane','box','sphere','cylinder','cone','torus','circle','ring','capsule','tetrahedron','octahedron','icosahedron'];}
 public create(name:string,options:Record<string,number|string>={},position:Canvas3D.Vec3={x:0,y:0,z:0}):Canvas3D.Mesh3{
  const numeric:Record<string,number>={};for(const [key,value]of Object.entries(options)){const n=Number(value);if(Number.isFinite(n))numeric[key]=n;}
  const data=Three.Primitives.create(name,numeric),vertices:Canvas3D.Vec3[]=[],normals:Canvas3D.Vec3[]=[];
  for(let i=0;i<data.positions.length;i+=3)vertices.push({x:data.positions[i],y:data.positions[i+1],z:data.positions[i+2]});
  for(let i=0;i<data.normals.length;i+=3)normals.push({x:data.normals[i],y:data.normals[i+1],z:data.normals[i+2]});
  const uvs=Array.from({length:data.uvs.length/2},(_,i)=>({x:data.uvs[i*2],y:data.uvs[i*2+1]}));
  const geometry:Canvas3D.Geometry3={vertices,normals,uvs,indices:Array.from(data.indices),clone(){return{...this,vertices:this.vertices.map(p=>({...p})),normals:this.normals.map(p=>({...p})),indices:[...this.indices]};}};
  const mesh:Canvas3D.Mesh3={geometry,position:{...position},rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1},visible:true,userData:{name,color:'#7b9fc4',primitive:name,csgSelectable:!['plane','circle','ring'].includes(name)}};
  const canvas=this.resolve();if(canvas){canvas.addMesh('primitive-'+(++sequence),mesh);canvas.invalidate();}
  this.dispatchEvent(new CustomEvent('arianna:primitive-create',{bubbles:true,composed:true,detail:{name,mesh,canvas,source:this}}));return mesh;
 }
 public static register(descriptor:Three.PrimitiveDescriptor3D):void{Three.Primitives.register(descriptor);}

}
export default Primitives3D;
