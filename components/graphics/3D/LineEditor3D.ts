/** LineEditor adapter: browser pointer → camera ray → construction plane.
 * Existing 2D LineEditor remains independent and unchanged.
 * @author Riccardo Angeli @license MIT / Commercial (dual license)
 */
import LineEditor,{type LineEditorOptions} from '../2D/LineEditor.ts';
import type {Canvas3D} from './Canvas3D.ts';
import {add,sub,mul,dot,cross,norm,type V,type P} from './modifiers/standard/GeometryKernel3D.ts';
export interface ConstructionPlane3D {origin:V;u:V;v:V;}
export interface SplineSource3D {id:string;name:string;closed:boolean;getPath3D():V[];getProfile2D():P[];}
const sources=new WeakMap<object,Map<string,SplineSource3D>>();
export function registerSpline3D(canvas:object,source:SplineSource3D):()=>void{let map=sources.get(canvas);if(!map){map=new Map();sources.set(canvas,map);}if(map.has(source.id))throw new Error('Duplicate spline id: '+source.id);map.set(source.id,source);return()=>{if(map!.get(source.id)===source)map!.delete(source.id);};}
export function getSplines3D(canvas:object):ReadonlyArray<SplineSource3D>{return [...(sources.get(canvas)?.values()??[])];}

/** Exact ray/plane hit; null for parallel rays or a plane behind the camera. */
export function rayPlanePoint3D(ray:{origin:V;direction:V},plane:ConstructionPlane3D):V|null{
 const normal=cross(plane.u,plane.v),den=dot(ray.direction,normal);if(Math.abs(den)<1e-7)return null;const t=dot(sub(plane.origin,ray.origin),normal)/den;return t>0?add(ray.origin,mul(ray.direction,t)):null;
}
export class LineEditor3D implements SplineSource3D {
 public readonly Editor:LineEditor;
 public readonly id:string;
 public name:string;
 private plane:ConstructionPlane3D;
 private readonly svg:SVGSVGElement;
 private readonly overlay:SVGSVGElement;
 private readonly layer:SVGGElement;
 private readonly control=new AbortController();
 private readonly stopFrame:()=>void;
 private readonly unregister:()=>void;
 private readonly observer:MutationObserver;
 private hitTargets:Array<{node:SVGPathElement;original:SVGGeometryElement}>=[];
 private samples:P[]=[];private signature='';private dirty=true;private lastCamera='';
 private active=true;private capture:number|null=null;private disposed=false;
 private readonly units=100;
 constructor(private readonly canvas:Canvas3D.Canvas3D,options:LineEditorOptions&{id?:string;name?:string;plane?:ConstructionPlane3D}={}){
  this.id=options.id??'spline-'+Math.random().toString(36).slice(2);this.name=options.name??this.id;
  this.plane=this.normalized(options.plane??{origin:{x:0,y:0,z:0},u:{x:1,y:0,z:0},v:{x:0,y:0,z:1}});
  const ns='http://www.w3.org/2000/svg';this.svg=document.createElementNS(ns,'svg');this.svg.setAttribute('width','4000');this.svg.setAttribute('height','4000');this.svg.setAttribute('viewBox','-2000 -2000 4000 4000');
  // Off-screen, not display:none: SVG hit calibration and path sampling remain valid.
  this.svg.style.cssText='position:fixed;left:-10000px;top:-10000px;width:4000px;height:4000px;pointer-events:none;';document.body.append(this.svg);
  this.layer=document.createElementNS(ns,'g');this.svg.append(this.layer);
  this.overlay=document.createElementNS(ns,'svg');this.overlay.style.cssText='position:absolute;pointer-events:none;z-index:8;overflow:hidden;';canvas.appendChild(this.overlay);
  const surface=canvas.selectionSurface;
  this.svg.setPointerCapture=(id:number)=>{this.capture=id;surface.setPointerCapture(id);};this.svg.releasePointerCapture=(id:number)=>{this.capture=null;if(surface.hasPointerCapture(id))surface.releasePointerCapture(id);};this.svg.hasPointerCapture=(id:number)=>surface.hasPointerCapture(id);
  this.Editor=new LineEditor({...options,mode:options.mode??'pen',canvas:{drawingSurface:this.svg,createDrawingLayer:()=>this.layer,removeDrawingLayer:()=>this.layer.remove()}});
  const signal=this.control.signal;
  for(const kind of ['pointerdown','pointermove','pointerup','pointercancel'])surface.addEventListener(kind,event=>this.forward(event as PointerEvent),{capture:true,signal});
  surface.addEventListener('keydown',event=>{if(this.active)this.svg.dispatchEvent(new KeyboardEvent('keydown',event));},{signal});
  this.observer=new MutationObserver(()=>{this.dirty=true;canvas.invalidate();});this.observer.observe(this.layer,{subtree:true,attributes:true,childList:true});
  this.stopFrame=canvas.onFrame(()=>this.render());this.unregister=registerSpline3D(canvas,this);this.render();
 }
 private normalized(p:ConstructionPlane3D):ConstructionPlane3D{const u=norm(p.u),v=norm(sub(p.v,mul(u,dot(u,p.v))));return{origin:{...p.origin},u,v};}
 public setPlane(p:ConstructionPlane3D):this{this.plane=this.normalized(p);this.dirty=true;this.canvas.invalidate();return this;}
 public getPlane():ConstructionPlane3D{return structuredClone(this.plane);}
 public setEnabled(enabled:boolean):this{this.active=enabled;this.canvas.selectionSurface.style.cursor=enabled?'crosshair':'';return this;}
 public get closed():boolean{return this.Editor.closed||this.Editor.anchors[0]?.pathClosed===true;}
 public getProfile2D():P[]{this.sample();return this.samples.map(p=>({x:p.x/this.units,y:p.y/this.units}));}
 public getPath3D():V[]{return this.getProfile2D().map(p=>add(this.plane.origin,add(mul(this.plane.u,p.x),mul(this.plane.v,p.y))));}
 private sample():void{
  const path=this.layer.querySelector<SVGPathElement>('.LineEditor-Path'),d=path?.getAttribute('d')??'';if(d===this.signature)return;this.signature=d;this.samples=[];
  if(!path||!d)return;
  if((d.match(/M/gi)??[]).length>1)throw new Error('Use one connected spline per scene source');
  const length=path.getTotalLength();if(!length)return;const count=Math.min(512,Math.max(2,Math.ceil(length/8)));
  this.samples=Array.from({length:count},(_,i)=>{const p=path.getPointAtLength(length*i/(this.closed?count:count-1));return{x:p.x,y:p.y};});
 }
 private forward(event:PointerEvent):void{
  if(!this.active||event.button>0||event.altKey)return;
  const hit=rayPlanePoint3D(this.canvas.rayFromClient(event.clientX,event.clientY),this.plane);if(!hit)return;const local=sub(hit,this.plane.origin),rect=this.svg.getBoundingClientRect();
  event.preventDefault();event.stopImmediatePropagation();
  const hitNode=[...this.hitTargets].reverse().find(({node})=>{const r=node.getBoundingClientRect();return event.clientX>=r.left-4&&event.clientX<=r.right+4&&event.clientY>=r.top-4&&event.clientY<=r.bottom+4;});
  (hitNode?.original??this.svg).dispatchEvent(new PointerEvent(event.type,{bubbles:true,cancelable:true,clientX:rect.left+2000+dot(local,this.plane.u)*this.units,clientY:rect.top+2000+dot(local,this.plane.v)*this.units,pointerId:event.pointerId,pointerType:event.pointerType,button:event.button,buttons:event.buttons,shiftKey:event.shiftKey,ctrlKey:event.ctrlKey,metaKey:event.metaKey,pressure:event.pressure,isPrimary:event.isPrimary}));
  this.canvas.selectionSurface.style.cursor=this.svg.style.cursor;this.dirty=true;this.canvas.invalidate();
 }
 private render():void{
  if(this.disposed)return;const rect=this.canvas.selectionSurface.getBoundingClientRect(),host=this.canvas.getBoundingClientRect(),p=this.plane;
  const probe=[p.origin,add(p.origin,p.u),add(p.origin,p.v)].map(v=>this.canvas.projectWorld(v));const key=JSON.stringify([rect.width,rect.height,rect.left-host.left,rect.top-host.top,probe]);if(!this.dirty&&key===this.lastCamera)return;this.lastCamera=key;this.dirty=false;
  this.overlay.style.left=rect.left-host.left+'px';this.overlay.style.top=rect.top-host.top+'px';this.overlay.setAttribute('width',String(rect.width));this.overlay.setAttribute('height',String(rect.height));
  const project=(x:number,y:number)=>this.canvas.projectWorld(add(p.origin,add(mul(p.u,x/this.units),mul(p.v,y/this.units))));
  this.hitTargets=[];
  const fragment=document.createDocumentFragment(),ns='http://www.w3.org/2000/svg';
  for(const original of this.layer.querySelectorAll<SVGGeometryElement>('path,circle,line')){
   if(original.closest('[data-line-coordinates]'))continue;const node=document.createElementNS(ns,'path');for(const name of ['stroke','stroke-width','stroke-dasharray','fill','opacity'])if(original.hasAttribute(name))node.setAttribute(name,original.getAttribute(name)!);
   node.setAttribute('vector-effect','non-scaling-stroke');const style=getComputedStyle(original);node.setAttribute('stroke',original.getAttribute('stroke')??style.stroke);node.setAttribute('fill',original.getAttribute('fill')??style.fill);
   if(original.tagName==='circle'){const c=project(Number(original.getAttribute('cx')),Number(original.getAttribute('cy')));if(!c.visible)continue;const r=Math.min(5,Number(original.getAttribute('r'))||3);node.setAttribute('d',`M${c.x-r},${c.y}a${r},${r} 0 1 0 ${r*2},0a${r},${r} 0 1 0 ${-r*2},0`);}
   else{let len=0;try{len=original.getTotalLength();}catch{continue;}if(!len)continue;const n=Math.min(512,Math.max(2,Math.ceil(len/8)));let d='',pen=false;for(let i=0;i<=n;i++){const q=original.getPointAtLength(len*i/n),v=project(q.x,q.y);if(!v.visible){pen=false;continue;}d+=(pen?'L':'M')+v.x+','+v.y;pen=true;}node.setAttribute('d',d);}
   if(original.closest('.LineEditor-Anchor,.LineEditor-Handle,.LineEditor-CornerHandle,.LineEditor-OffsetHandle'))this.hitTargets.push({node,original});
   fragment.append(node);
  }
  this.overlay.replaceChildren(fragment);
 }
 public dispose():void{if(this.disposed)return;this.disposed=true;this.control.abort();this.observer.disconnect();this.stopFrame();this.unregister();this.Editor.dispose();if(this.capture!==null&&this.canvas.selectionSurface.hasPointerCapture(this.capture))this.canvas.selectionSurface.releasePointerCapture(this.capture);this.svg.remove();this.overlay.remove();this.canvas.selectionSurface.style.cursor='';}
}

export default LineEditor3D;
