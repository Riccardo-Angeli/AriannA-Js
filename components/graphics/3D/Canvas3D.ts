/**
 * @module components/graphics/3D/Canvas3D
 * @author Riccardo Angeli
 * @version 3.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 *
 * @description
 * Generic AriannA 3D viewport. Canvas3D owns only scene/camera/rendering/orbit/view
 * behavior. It NEVER seeds demo geometry. Applications and Playground examples add
 * meshes explicitly through addMesh()/scene.add().
 */
import { Component, Css, Templates } from '../../../core/index.ts';
import type { SelectionRectangleDetail } from '../SelectionRectangle.ts';
export namespace CanvasSelection
{
    export interface Vec3{x:number;y:number;z:number;}
    export type Mode='vertex'|'edge'|'polygon'|'face'|'object';
    export type Operation='replace'|'add'|'subtract'|'toggle';
    export interface Geometry{vertices:Vec3[];indices:number[];faceIds?:number[];}
    export interface Mesh{geometry:Geometry;visible:boolean;userData:Record<string,unknown>;}
    export interface Ray{origin:Vec3;direction:Vec3;}
    export interface CanvasTarget extends HTMLElement
    {
        selectionSurface:HTMLCanvasElement;getMeshes():ReadonlyArray<Mesh>;
        rayFromClient(clientX:number,clientY:number):Ray;
        localToWorld(point:Vec3,mesh:Mesh):Vec3;
        projectWorld(point:Vec3):{x:number;y:number;z:number;visible:boolean};
        onFrame?(callback:(dt:number)=>void):()=>void;
    }
    export interface Item
    {
        key:string;mode:Mode;mesh:Mesh;objectId:string;vertexIndices:number[];
        edge?:[number,number];polygonIndices:number[];faceId?:number;point:Vec3;
    }
    export interface Result{mode:Mode;items:Item[];objects:Mesh[];vertices:Item[];edges:Item[];polygons:Item[];faces:Item[];source:CanvasSelection;}
    export interface Options{canvas?:CanvasTarget;mode?:Mode;enabled?:boolean;backfaces?:'exclude'|'include';faceAngle?:number;}
    export interface ModifierTarget{bindMesh?(mesh:Mesh):unknown;apply?():unknown;selection?:Result;}

    const add=(a:Vec3,b:Vec3):Vec3=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z}),sub=(a:Vec3,b:Vec3):Vec3=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z}),scale=(a:Vec3,k:number):Vec3=>({x:a.x*k,y:a.y*k,z:a.z*k}),dot=(a:Vec3,b:Vec3)=>a.x*b.x+a.y*b.y+a.z*b.z,cross=(a:Vec3,b:Vec3):Vec3=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x}),norm=(a:Vec3)=>scale(a,1/(Math.hypot(a.x,a.y,a.z)||1));
    interface Hit{mesh:Mesh;triangle:number;indices:[number,number,number];point:Vec3;distance:number;bary:[number,number,number];}
    interface State{canvas:CanvasTarget|null;mode:Mode;enabled:boolean;backfaces:'exclude'|'include';faceAngle:number;selected:Map<string,Item>;cleanup:(()=>void)|null;overlay:HTMLCanvasElement|null;down:{x:number;y:number}|null;unsub:(()=>void)|null;cancel?:()=>void;}
    const States=new WeakMap<EventTarget,State>();
    const state=(h:EventTarget)=>{let s=States.get(h);if(!s){s={canvas:null,mode:'object',enabled:true,backfaces:'exclude',faceAngle:1,selected:new Map(),cleanup:null,overlay:null,down:null,unsub:null};States.set(h,s);}return s;};

    const treeToggle=()=>{const caret=document.createElement('span');caret.className='Selection3DWindow-Toggle';caret.setAttribute('aria-hidden','true');return caret;};
    const treeHeading=(heading:HTMLElement,mode:Mode,text:string)=>{const icon=document.createElement('span');icon.dataset.topologyIcon=mode;const label=document.createElement('span');label.textContent=text;heading.replaceChildren(treeToggle(),icon,label);};
    const WindowModes:[Mode,string][]=[['object','Object'],['face','Faces'],['polygon','Polygons'],['edge','Edges'],['vertex','Vertex']];
    type WindowTopology={edges:Array<[number,number]>;faces:number[][];vertices:number;indices:number;angle:number};
    type WindowRow={root:HTMLDetailsElement;label:HTMLButtonElement;geometry:Geometry;vertices:number;indices:number};
    interface WindowState{panel:HTMLElement|null;tree:HTMLElement|null;status:HTMLElement|null;rows:Map<Mesh,WindowRow>;topology:WeakMap<Geometry,WindowTopology>;elapsed:number;}
    const Windows=new WeakMap<EventTarget,WindowState>();
    const windowState=(h:EventTarget):WindowState=>{let s=Windows.get(h);if(!s){s={panel:null,tree:null,status:null,rows:new Map(),topology:new WeakMap(),elapsed:0};Windows.set(h,s);}return s;};
    const windowOperation=(e:MouseEvent):Operation=>e.ctrlKey||e.metaKey?'toggle':e.shiftKey?'add':'replace';

    export class CanvasSelection extends EventTarget
    {
        constructor(options:Options={}){super();const s=state(this);if(options.mode)s.mode=options.mode;if(options.enabled!==undefined)s.enabled=options.enabled;if(options.backfaces)s.backfaces=options.backfaces;if(options.faceAngle!==undefined)s.faceAngle=options.faceAngle;if(options.canvas)this.attach(options.canvas);}
        public onUnmount():void{this.detach();}
        public get enabled():boolean{return state(this).enabled;}
        public set enabled(value:boolean){const s=state(this);s.enabled=!!value;s.cancel?.();s.down=null;if(s.canvas)s.canvas.selectionSurface.dataset.selection3dActive=String(s.enabled);}
        public get mode():Mode{return state(this).mode;}
        public set mode(value:Mode){this.setMode(value);}
        public get canvas():CanvasTarget|null{return state(this).canvas;}
        public set canvas(value:CanvasTarget|null){value?this.attach(value):this.detach();}
        public get selection():Result{return this.result();}
        public setMode(mode:Mode):this{if(!['vertex','edge','polygon','face','object'].includes(mode))throw new TypeError('Invalid CanvasSelection mode');state(this).mode=mode;this.clear();this.dispatchEvent(new CustomEvent('arianna:selection-3d-mode',{bubbles:true,composed:true,detail:{mode,source:this}}));return this;}
        public attach(canvas:CanvasTarget):this
        {
            this.detach();const s=state(this),surface=canvas.selectionSurface;s.canvas=canvas;surface.dataset.selection3dActive=String(s.enabled);
            const overlay=document.createElement('canvas');overlay.dataset.selection3d='';overlay.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3';canvas.appendChild(overlay);s.overlay=overlay;
            let box:HTMLDivElement|null=null,pointer:number|null=null;
            const removeBox=()=>{box?.remove();box=null;};
            const bounds=(x:number,y:number)=>{const r=surface.getBoundingClientRect();return{left:Math.max(0,Math.min(r.width,Math.min(s.down!.x,x)-r.left)),top:Math.max(0,Math.min(r.height,Math.min(s.down!.y,y)-r.top)),right:Math.max(0,Math.min(r.width,Math.max(s.down!.x,x)-r.left)),bottom:Math.max(0,Math.min(r.height,Math.max(s.down!.y,y)-r.top))};};
            const down=(e:PointerEvent)=>{if(!s.enabled||e.button!==0||pointer!==null)return;pointer=e.pointerId;s.down={x:e.clientX,y:e.clientY};surface.setPointerCapture(e.pointerId);};
            const move=(e:PointerEvent)=>{if(pointer!==e.pointerId||!s.down||!s.enabled)return;if(Math.hypot(e.clientX-s.down.x,e.clientY-s.down.y)<=4)return;
                if(!box){box=document.createElement('div');box.className='Canvas3D-SelectionRectangle';box.style.cssText='position:fixed;pointer-events:none;z-index:2147483646;border:1px solid #e40c88;background:#e40c8822;box-sizing:border-box';surface.ownerDocument.body.appendChild(box);}
                const r=bounds(e.clientX,e.clientY),screen=surface.getBoundingClientRect();Object.assign(box.style,{left:(screen.left+r.left)+'px',top:(screen.top+r.top)+'px',width:(r.right-r.left)+'px',height:(r.bottom-r.top)+'px'});
            };
            const cancel=()=>{const id=pointer;pointer=null;s.down=null;removeBox();if(id!==null&&surface.hasPointerCapture(id))surface.releasePointerCapture(id);};
            const up=(e:PointerEvent)=>{if(pointer!==e.pointerId||!s.down)return;
                if(s.enabled){const op=e.altKey?'subtract':e.ctrlKey||e.metaKey?'toggle':e.shiftKey?'add':'replace';
                    if(Math.hypot(e.clientX-s.down.x,e.clientY-s.down.y)>4){
                        const rect=bounds(e.clientX,e.clientY),detail={mode:'3d',rect,rule:e.clientX>=s.down.x?'contain':'intersect',operation:op} as SelectionRectangleDetail;
                        this.selectRectangle(detail,op);
                        canvas.dispatchEvent(new CustomEvent('arianna:selection-rectangle',{detail:{...detail,source:this},bubbles:true}));
                    }else this.selectAt(e.clientX,e.clientY,op);
                }cancel();
            };
            s.cancel=cancel;
            const key=(e:KeyboardEvent)=>{if(e.key==='Escape')cancel();};
            const rectangle=(e:Event)=>{const detail=(e as CustomEvent<Omit<SelectionRectangleDetail,'source'>&{source?:unknown}>).detail;if(detail?.mode==='3d'&&detail.source!==this&&s.enabled)this.selectRectangle(detail as SelectionRectangleDetail);};
            surface.addEventListener('pointerdown',down);surface.addEventListener('pointermove',move);surface.addEventListener('pointerup',up);surface.addEventListener('pointercancel',cancel);surface.addEventListener('lostpointercapture',cancel);surface.ownerDocument.addEventListener('keydown',key);canvas.addEventListener('arianna:selection-rectangle',rectangle);
            s.cleanup=()=>{cancel();s.cancel=undefined;delete surface.dataset.selection3dActive;surface.removeEventListener('pointerdown',down);surface.removeEventListener('pointermove',move);surface.removeEventListener('pointerup',up);surface.removeEventListener('pointercancel',cancel);surface.removeEventListener('lostpointercapture',cancel);surface.ownerDocument.removeEventListener('keydown',key);canvas.removeEventListener('arianna:selection-rectangle',rectangle);};
            s.unsub=canvas.onFrame?.((dt)=>{this.draw();const ui=Windows.get(this);if(ui?.panel?.isConnected){ui.elapsed+=dt;if(ui.elapsed>=.5){ui.elapsed=0;this.refreshWindow();}}})??null;this.draw();return this;
        }
        public detach():this{const s=state(this);s.cleanup?.();s.unsub?.();s.overlay?.remove();s.cleanup=null;s.unsub=null;s.overlay=null;s.canvas=null;s.down=null;const ui=Windows.get(this);if(ui){ui.panel?.remove();ui.rows.clear();ui.tree?.replaceChildren();ui.topology=new WeakMap();ui.elapsed=0;}return this;}
        public clear():this{state(this).selected.clear();this.changed();return this;}
        public selectAt(clientX:number,clientY:number,operation:Operation='replace'):Result
        {
            const s=state(this),canvas=s.canvas;if(!canvas)return this.result();const hit=this.pick(canvas.rayFromClient(clientX,clientY));if(!hit){if(operation==='replace')this.clear();return this.result();}this.apply([this.item(hit)],operation);return this.result();
        }
        public selectRectangle(detail:SelectionRectangleDetail,operation:Operation=detail.operation):Result
        {
            const s=state(this),canvas=s.canvas;if(!canvas)return this.result();const rect=detail.rect,items:Item[]=[];
            for(const mesh of canvas.getMeshes())
            {
                if(!mesh.visible)continue;const g=mesh.geometry,inside=(i:number)=>{const p=canvas.projectWorld(canvas.localToWorld(g.vertices[i],mesh));return p.visible&&p.x>=rect.left&&p.x<=rect.right&&p.y>=rect.top&&p.y<=rect.bottom;};
                if(s.mode==='object'){if(g.vertices.length&&(detail.rule==='contain'?g.vertices.every((_,i)=>inside(i)):g.vertices.some((_,i)=>inside(i))))items.push(this.objectItem(mesh));continue;}
                if(s.mode==='vertex'){g.vertices.forEach((_,i)=>{if(inside(i))items.push(this.vertexItem(mesh,i));});continue;}
                for(let t=0;t<g.indices.length/3;t++){const ids=g.indices.slice(t*3,t*3+3),flags=ids.map(inside),accepted=detail.rule==='contain'?flags.every(Boolean):flags.some(Boolean);if(!accepted)continue;const hit={mesh,triangle:t,indices:ids as [number,number,number],point:this.center(mesh,ids),distance:0,bary:[1/3,1/3,1/3] as [number,number,number]};items.push(this.item(hit));}
            }
            this.apply(this.unique(items),operation??detail.operation);return this.result();
        }
        /** Optional UI: creation is explicit and never runs during Canvas3D startup. */
        public get Window():HTMLElement {
            const ui=windowState(this);if(ui.panel)return ui.panel;
            const panel=document.createElement('section');panel.className='Selection3DWindow';panel.setAttribute('role','region');panel.setAttribute('aria-label','Selection scene graph');
            panel.style.cssText='position:absolute;left:12px;top:56px;width:248px;height:320px;min-width:190px;min-height:130px;max-width:calc(100% - 24px);max-height:calc(100% - 68px);z-index:35;display:flex;flex-direction:column;resize:both;overflow:hidden;box-sizing:border-box;border:1px solid #111417;border-radius:7px;background:#292d31;color:#e5e8ea;box-shadow:0 8px 25px #0005;font:11px/1.5 system-ui';
            const style=document.createElement('style');style.textContent=`
.Selection3DWindow-Tree{padding:6px 8px!important;overflow:auto}.Selection3DWindow-Tree details{margin:2px 0 2px 8px;border-left:1px solid #87909b35;padding-left:6px}.Selection3DWindow-Tree summary{padding:5px 3px;cursor:pointer;border-radius:4px}.Selection3DWindow-Tree summary:hover{background:#e40c881a}.Selection3DWindow-Tree .Selection3DWindow-Row{display:flex;align-items:center;gap:7px;width:100%;text-align:left;border:0;background:transparent;padding:5px 8px;border-radius:4px}.Selection3DWindow-Tree [data-topology-icon]::before{content:"";display:inline-block;width:16px;height:16px;margin-right:7px;vertical-align:middle;background:currentColor;mask-position:center;mask-size:contain;mask-repeat:no-repeat;-webkit-mask-position:center;-webkit-mask-size:contain;-webkit-mask-repeat:no-repeat}
.Selection3DWindow-Tree [data-topology-icon="object"]::before{mask-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M3%207l9-5%209%205v10l-9%205-9-5zM3%207l9%205%209-5M12%2012v10%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.7%22%20stroke-linejoin%3D%22round%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E");-webkit-mask-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M3%207l9-5%209%205v10l-9%205-9-5zM3%207l9%205%209-5M12%2012v10%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.7%22%20stroke-linejoin%3D%22round%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E")}
.Selection3DWindow-Tree [data-topology-icon="vertex"]::before{mask-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M12%203v4M12%2017v4M3%2012h4M17%2012h4M12%208a4%204%200%201%200%200%208%204%204%200%200%200%200-8%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.7%22%20stroke-linejoin%3D%22round%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E");-webkit-mask-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M12%203v4M12%2017v4M3%2012h4M17%2012h4M12%208a4%204%200%201%200%200%208%204%204%200%200%200%200-8%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.7%22%20stroke-linejoin%3D%22round%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E")}
.Selection3DWindow-Tree [data-topology-icon="edge"]::before{mask-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M5%2018L19%206M3%2016h4v4H3zM17%204h4v4h-4z%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.7%22%20stroke-linejoin%3D%22round%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E");-webkit-mask-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M5%2018L19%206M3%2016h4v4H3zM17%204h4v4h-4z%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.7%22%20stroke-linejoin%3D%22round%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E")}
.Selection3DWindow-Tree [data-topology-icon="polygon"]::before{mask-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M4%2018L10%204l11%2014z%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.7%22%20stroke-linejoin%3D%22round%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E");-webkit-mask-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M4%2018L10%204l11%2014z%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.7%22%20stroke-linejoin%3D%22round%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E")}
.Selection3DWindow-Tree [data-topology-icon="face"]::before{mask-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M3%207l14-3%204%2013-14%203zM3%207l18%2010%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.7%22%20stroke-linejoin%3D%22round%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E");-webkit-mask-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M3%207l14-3%204%2013-14%203zM3%207l18%2010%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.7%22%20stroke-linejoin%3D%22round%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E")}
.Selection3DWindow *{box-sizing:border-box}.Selection3DWindow header{display:flex;align-items:center;gap:5px;height:32px;min-height:32px;padding:4px 6px 4px 10px;background:linear-gradient(180deg,#3a3f44,#2b3034);cursor:move;touch-action:none;user-select:none}.Selection3DWindow header strong{margin-right:auto}.Selection3DWindow button{appearance:none;cursor:pointer;font:600 10px/1.4 system-ui;border:1px solid #171a1d;border-radius:4px;background:linear-gradient(180deg,#42484d,#2e3337);color:inherit;min-height:24px;padding:3px 6px;box-shadow:inset 0 1px 0 #ffffff18}.Selection3DWindow button:hover{border-color:#e40c88}.Selection3DWindow button[data-selected="true"]{background:linear-gradient(180deg,#ff4dad,#e40c88,#b90769)!important;color:#fff!important;border-color:#e40c88}.Selection3DWindow button:disabled{opacity:.45;cursor:default}.Selection3DWindow .Selection3DWindow-Modes{display:flex;gap:3px;flex-wrap:wrap;padding:6px;border-bottom:1px solid #0002}.Selection3DWindow .Selection3DWindow-Tree{flex:1;min-height:0;overflow:auto;padding:5px 8px}.Selection3DWindow details details{margin-left:12px}.Selection3DWindow summary{cursor:pointer;white-space:nowrap}.Selection3DWindow .Selection3DWindow-Row{border-color:transparent;background:transparent;box-shadow:none;text-align:left;max-width:100%;overflow:hidden;text-overflow:ellipsis;vertical-align:middle}.Selection3DWindow details details .Selection3DWindow-Row{display:block;width:100%}.Selection3DWindow footer{font-size:10px;padding:4px 8px;border-top:1px solid #0002}.Selection3DWindow[data-minimized="true"]{height:32px!important;min-height:32px!important;resize:none}.Selection3DWindow[data-minimized="true"]>nav,.Selection3DWindow[data-minimized="true"]>div,.Selection3DWindow[data-minimized="true"]>footer{display:none}.Selection3DWindow[data-theme="light"]{background:#eef0f2!important;color:#25292d!important;border-color:#b8bdc2!important}.Selection3DWindow[data-theme="light"] header{background:linear-gradient(180deg,#f9fbfc,#e0e4e7)}.Selection3DWindow[data-theme="light"] button{background:linear-gradient(180deg,#f9fbfc,#e0e4e7);border-color:#b8bdc2}.Selection3DWindow[data-theme="light"] .Selection3DWindow-Row{background:transparent;border-color:transparent}

.Selection3DWindow .Selection3DWindow-Tree details{margin:0;padding:0;border:0}
.Selection3DWindow .Selection3DWindow-Tree details>details{margin-left:23px}
.Selection3DWindow .Selection3DWindow-Tree summary{display:flex;align-items:center;gap:0;list-style:none;min-height:30px;padding:3px 0;white-space:nowrap}
.Selection3DWindow .Selection3DWindow-Tree summary::-webkit-details-marker{display:none}
.Selection3DWindow .Selection3DWindow-Tree summary::marker{content:""}
.Selection3DWindow-Toggle{display:inline-block;width:0;height:0;border-top:4px solid transparent;border-bottom:4px solid transparent;border-left:5px solid currentColor;margin:0 8px 0 4px;flex:0 0 auto;transform-origin:2px 4px}
.Selection3DWindow details[open]>summary>.Selection3DWindow-Toggle{transform:rotate(90deg)}
.Selection3DWindow .Selection3DWindow-Tree summary>.Selection3DWindow-Row{display:inline-flex;width:auto;min-width:0;flex:1;align-items:center;gap:0;padding:0;margin:0}
.Selection3DWindow .Selection3DWindow-Tree details>button.Selection3DWindow-Row{display:flex;align-items:center;gap:0;margin:0;padding:5px 0 5px 40px;width:100%}
.Selection3DWindow .Selection3DWindow-Tree [data-topology-icon]::before{flex:0 0 16px;margin-right:7px}
`;
            const header=document.createElement('header'),title=document.createElement('strong');title.textContent='Selection';header.append(title);
            const button=(text:string,title:string,action:()=>void)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.title=title;b.setAttribute('aria-label',title);b.onclick=action;return b;};
            header.append(button('↻','Refresh scene',()=>this.refreshWindow(true)),button('—','Minimize / restore',()=>{panel.dataset.minimized=String(panel.dataset.minimized!=='true');}));
            const modes=document.createElement('nav');modes.className='Selection3DWindow-Modes';modes.setAttribute('aria-label','Selection level');
            for(const [mode,label]of WindowModes){const b=button(label,label,()=>this.setMode(mode));b.dataset.mode=mode;modes.append(b);}
            modes.append(button('Clear','Clear selection',()=>this.clear()));
            const tree=document.createElement('div');tree.className='Selection3DWindow-Tree';tree.setAttribute('aria-label','Scene objects');const status=document.createElement('footer');status.setAttribute('aria-live','polite');
            panel.append(style,header,modes,tree,status);ui.panel=panel;ui.tree=tree;ui.status=status;
            // Panel-only movement: it cannot intercept mesh interactions on the canvas.
            let drag:null|{id:number;x:number;y:number;left:number;top:number;scaleX:number;scaleY:number}=null;
            header.addEventListener('pointerdown',e=>{if(e.button!==0||(e.target as Element).closest('button'))return;const parent=panel.offsetParent as HTMLElement|null;if(!parent)return;const r=parent.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:panel.offsetLeft,top:panel.offsetTop,scaleX:r.width/Math.max(1,parent.offsetWidth),scaleY:r.height/Math.max(1,parent.offsetHeight)};header.setPointerCapture(e.pointerId);e.preventDefault();e.stopPropagation();});
            header.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const parent=panel.offsetParent as HTMLElement;if(!parent)return;panel.style.left=Math.max(0,Math.min(parent.clientWidth-panel.offsetWidth,drag.left+(e.clientX-drag.x)/drag.scaleX))+'px';panel.style.top=Math.max(0,Math.min(parent.clientHeight-32,drag.top+(e.clientY-drag.y)/drag.scaleY))+'px';e.stopPropagation();});
            const end=(e:PointerEvent)=>{if(!drag||drag.id!==e.pointerId)return;drag=null;try{header.releasePointerCapture(e.pointerId);}catch{}};header.addEventListener('pointerup',end);header.addEventListener('pointercancel',end);header.addEventListener('lostpointercapture',()=>{drag=null;});
            this.refreshWindow();return panel;
        }
        /** Refresh explicitly after an in-place topology edit. No observer or extra animation loop. */
        public refreshWindow(force=false):void {
            const ui=windowState(this),canvas=state(this).canvas;if(!ui.panel||!ui.tree)return;
            if(force){ui.topology=new WeakMap();ui.rows.clear();ui.tree.replaceChildren();}
            const theme=canvas?.getAttribute('theme')==='light'?'light':'dark';if(ui.panel.dataset.theme!==theme)ui.panel.dataset.theme=theme;
            const meshes=canvas?.getMeshes()??[];let pruned=false;for(const[key,item]of state(this).selected)if(!meshes.includes(item.mesh)||!item.mesh.visible||item.vertexIndices.some(i=>!item.mesh.geometry.vertices[i])){state(this).selected.delete(key);pruned=true;}if(pruned)this.changed();
            for(const [mesh,row]of ui.rows)if(!meshes.includes(mesh)){row.root.remove();ui.rows.delete(mesh);}
            for(const mesh of meshes){let row=ui.rows.get(mesh);const g=mesh.geometry;
                if(row&&(row.geometry!==g||row.vertices!==g.vertices.length||row.indices!==g.indices.length)){row.root.remove();ui.rows.delete(mesh);ui.topology.delete(g);row=undefined;}
                if(!row){const root=document.createElement('details'),summary=document.createElement('summary'),label=document.createElement('button');label.type='button';label.className='Selection3DWindow-Row';label.dataset.topologyIcon='object';label.onclick=e=>{e.preventDefault();this.select(mesh,'object',0,windowOperation(e));};summary.append(treeToggle(),label);root.append(summary);ui.tree.append(root);row={root,label,geometry:g,vertices:g.vertices.length,indices:g.indices.length};ui.rows.set(mesh,row);
                    let loaded=false;root.addEventListener('toggle',()=>{if(!root.open||loaded)return;loaded=true;
                        for(const [mode,title]of WindowModes.filter(([mode])=>mode!=='object')){const group=document.createElement('details'),heading=document.createElement('summary');treeHeading(heading,mode,title);group.append(heading);root.append(group);let offset=0,built=false;
                            group.addEventListener('toggle',()=>{if(!group.open||built)return;built=true;
                                const count=this.elementCount(mesh,mode);treeHeading(heading,mode,`${title} (${count})`);
                                const more=document.createElement('button');more.type='button';more.textContent='Next 100';
                                const page=()=>{more.remove();for(let i=offset;i<Math.min(offset+100,count);i++){const index=i,b=document.createElement('button');b.type='button';b.className='Selection3DWindow-Row';b.dataset.topologyIcon=mode;b.textContent=`${title} ${index}`;const item=this.windowItem(mesh,mode,index);b.dataset.key=item.key;b.onclick=e=>this.select(mesh,mode,index,windowOperation(e));group.append(b);}offset+=100;if(offset<count)group.append(more);this.syncWindowSelection();};more.onclick=page;page();
                            });
                        }
                    });
                }
                const name=String(mesh.userData.name??mesh.userData.id??`Object ${meshes.indexOf(mesh)}`);if(row.label.textContent!==name)row.label.textContent=name;if(row.label.disabled===mesh.visible)row.label.disabled=!mesh.visible;
            }
            this.syncWindowSelection();
        }
        public select(mesh:Mesh,mode:Mode='object',index=0,operation:Operation='replace'):Result {
            if(!state(this).canvas?.getMeshes().includes(mesh)||!mesh.visible)return this.result();
            const count=this.elementCount(mesh,mode);if(!Number.isInteger(index)||index<0||index>=count)throw new RangeError('CanvasSelection element index out of range');
            if(state(this).mode!==mode)this.setMode(mode);this.apply([this.windowItem(mesh,mode,index)],operation);return this.result();
        }
        public elementCount(mesh:Mesh,mode:Mode):number {const g=mesh.geometry;return mode==='object'?1:mode==='vertex'?g.vertices.length:mode==='polygon'?Math.floor(g.indices.length/3):mode==='edge'?this.windowTopology(mesh).edges.length:this.windowTopology(mesh).faces.length;}
        private windowItem(mesh:Mesh,mode:Mode,index:number):Item {
            if(mode==='object')return this.objectItem(mesh);if(mode==='vertex')return this.vertexItem(mesh,index);
            if(mode==='polygon'){const ids=mesh.geometry.indices.slice(index*3,index*3+3);return this.make(mesh,mode,ids,[index],this.center(mesh,ids),`p:${index}`);}
            if(mode==='edge'){const edge=this.windowTopology(mesh).edges[index];return this.make(mesh,mode,[...edge],[],this.center(mesh,edge),`e:${edge.join('-')}`,edge);}
            const polygons=this.windowTopology(mesh).faces[index],ids=[...new Set(polygons.flatMap(t=>mesh.geometry.indices.slice(t*3,t*3+3)))],id=mesh.geometry.faceIds?.[polygons[0]]??polygons[0];return this.make(mesh,mode,ids,polygons,this.center(mesh,ids),`f:${id}`,undefined,id);
        }
        private windowTopology(mesh:Mesh):WindowTopology {
            const ui=windowState(this),g=mesh.geometry,cached=ui.topology.get(g);if(cached&&cached.vertices===g.vertices.length&&cached.indices===g.indices.length&&cached.angle===state(this).faceAngle)return cached;
            const adjacency=new Map<string,number[]>(),edges:Array<[number,number]>=[],keys:string[][]=[],normals:Vec3[]=[],faces:number[][]=[],visited=new Set<number>(),explicit=new Map<number,number[]>();
            for(let t=0;t<g.indices.length/3;t++){const ids=g.indices.slice(t*3,t*3+3),[a,b,c]=ids.map(i=>g.vertices[i]);if(!a||!b||!c)throw new Error('Invalid triangle indices');normals.push(norm(cross(sub(b,a),sub(c,a))));const triangleKeys:string[]=[];for(const pair of [[ids[0],ids[1]],[ids[1],ids[2]],[ids[2],ids[0]]]){pair.sort((a,b)=>a-b);const key=pair.join('-');triangleKeys.push(key);const list=adjacency.get(key);if(list)list.push(t);else{adjacency.set(key,[t]);edges.push(pair as [number,number]);}}keys.push(triangleKeys);if(g.faceIds?.[t]!==undefined){const id=g.faceIds[t],list=explicit.get(id);if(list)list.push(t);else explicit.set(id,[t]);}}
            if(g.faceIds?.length===Math.floor(g.indices.length/3)){for(const group of explicit.values())faces.push(group);}
            else{const threshold=Math.cos(state(this).faceAngle*Math.PI/180);for(let t=0;t<keys.length;t++){if(visited.has(t))continue;const group=[t];visited.add(t);for(let n=0;n<group.length;n++)for(const key of keys[group[n]])for(const next of adjacency.get(key)??[]){if(visited.has(next)||dot(normals[t],normals[next])<threshold)continue;visited.add(next);group.push(next);}faces.push(group.sort((a,b)=>a-b));}}
            const value={edges,faces,vertices:g.vertices.length,indices:g.indices.length,angle:state(this).faceAngle};ui.topology.set(g,value);return value;
        }
        private syncWindowSelection():void {
            const ui=windowState(this);if(!ui.panel)return;const selected=this.result(),keys=new Set(selected.items.map(i=>i.key));
            for(const b of ui.panel.querySelectorAll<HTMLElement>('[data-mode]')){const active=String(b.dataset.mode===selected.mode);if(b.dataset.selected!==active)b.dataset.selected=active;}
            for(const [mesh,row]of ui.rows){const active=String(selected.objects.includes(mesh));if(row.label.dataset.selected!==active)row.label.dataset.selected=active;for(const b of row.root.querySelectorAll<HTMLElement>('[data-key]')){const active=String(keys.has(b.dataset.key!));if(b.dataset.selected!==active)b.dataset.selected=active;}}
            const text=`${selected.items.length} selected · ${WindowModes.find(([mode])=>mode===selected.mode)?.[1]??selected.mode}`;if(ui.status&&ui.status.textContent!==text)ui.status.textContent=text;
        }

        /** Connect programmatic modifiers without importing their implementation. */
        public bindModifier(modifier:ModifierTarget,modes:Mode[]=['object','face','polygon']):()=>void
        {
            const update=()=>{const result=this.result();modifier.selection=result;if(!modes.includes(result.mode)||!result.items[0])return;modifier.bindMesh?.(result.items[0].mesh);modifier.apply?.();};
            this.addEventListener('arianna:selection-3d-change',update);update();return()=>this.removeEventListener('arianna:selection-3d-change',update);
        }
        private pick(ray:Ray):Hit|null
        {
            const s=state(this),canvas=s.canvas;if(!canvas)return null;let best:Hit|null=null;
            for(const mesh of canvas.getMeshes())if(mesh.visible){const g=mesh.geometry;for(let t=0;t<g.indices.length/3;t++){const ids=g.indices.slice(t*3,t*3+3) as [number,number,number],a=canvas.localToWorld(g.vertices[ids[0]],mesh),b=canvas.localToWorld(g.vertices[ids[1]],mesh),c=canvas.localToWorld(g.vertices[ids[2]],mesh),edge1=sub(b,a),edge2=sub(c,a),p=cross(ray.direction,edge2),det=dot(edge1,p);if(s.backfaces==='exclude'&&det<=1e-8||Math.abs(det)<1e-8)continue;const inv=1/det,tv=sub(ray.origin,a),u=dot(tv,p)*inv;if(u<0||u>1)continue;const q=cross(tv,edge1),v=dot(ray.direction,q)*inv;if(v<0||u+v>1)continue;const distance=dot(edge2,q)*inv;if(distance<0||best&&distance>=best.distance)continue;best={mesh,triangle:t,indices:ids,point:add(ray.origin,scale(ray.direction,distance)),distance,bary:[1-u-v,u,v]};}}return best;
        }
        private item(hit:Hit):Item
        {
            const mode=state(this).mode;if(mode==='object')return this.objectItem(hit.mesh);if(mode==='vertex'){let n=0;if(hit.bary[1]>hit.bary[n])n=1;if(hit.bary[2]>hit.bary[n])n=2;return this.vertexItem(hit.mesh,hit.indices[n]);}
            if(mode==='edge'){let n=0;if(hit.bary[1]<hit.bary[n])n=1;if(hit.bary[2]<hit.bary[n])n=2;const edge:[number,number]=n===0?[hit.indices[1],hit.indices[2]]:n===1?[hit.indices[0],hit.indices[2]]:[hit.indices[0],hit.indices[1]],ids=[...edge].sort((a,b)=>a-b);return this.make(hit.mesh,mode,ids,[hit.triangle],hit.point,`e:${ids.join('-')}`,edge);}
            if(mode==='polygon')return this.make(hit.mesh,mode,[...hit.indices],[hit.triangle],hit.point,`p:${hit.triangle}`);
            const polygons=this.facePolygons(hit.mesh,hit.triangle),vertices=[...new Set(polygons.flatMap(t=>hit.mesh.geometry.indices.slice(t*3,t*3+3)))],faceId=hit.mesh.geometry.faceIds?.[hit.triangle]??polygons[0];return this.make(hit.mesh,mode,vertices,polygons,this.center(hit.mesh,vertices),`f:${faceId}`,undefined,faceId);
        }
        private facePolygons(mesh:Mesh,start:number):number[]
        {
            const g=mesh.geometry,explicit=g.faceIds?.[start];if(explicit!==undefined)return g.faceIds!.flatMap((id,i)=>id===explicit?[i]:[]);const ids=(t:number)=>g.indices.slice(t*3,t*3+3),normal=(t:number)=>{const a=g.vertices[g.indices[t*3]],b=g.vertices[g.indices[t*3+1]],c=g.vertices[g.indices[t*3+2]];return norm(cross(sub(b,a),sub(c,a)));},base=normal(start),limit=Math.cos(state(this).faceAngle*Math.PI/180),found=new Set([start]),queue=[start];while(queue.length){const current=queue.shift()!,a=ids(current);for(let t=0;t<g.indices.length/3;t++){if(found.has(t)||ids(t).filter(i=>a.includes(i)).length<2||dot(base,normal(t))<limit)continue;found.add(t);queue.push(t);}}return[...found].sort((a,b)=>a-b);
        }
        private objectId(mesh:Mesh):string{return String(mesh.userData.id??mesh.userData.name??`mesh-${state(this).canvas?.getMeshes().indexOf(mesh)??0}`);}
        private make(mesh:Mesh,mode:Mode,vertexIndices:number[],polygonIndices:number[],point:Vec3,suffix:string,edge?:[number,number],faceId?:number):Item{const objectId=this.objectId(mesh);return{key:`${objectId}:${suffix}`,mode,mesh,objectId,vertexIndices,polygonIndices,point,edge,faceId};}
        private objectItem(mesh:Mesh):Item{return this.make(mesh,'object',mesh.geometry.vertices.map((_,i)=>i),mesh.geometry.indices.map((_,i)=>i).filter(i=>i%3===0).map(i=>i/3),this.center(mesh,mesh.geometry.vertices.map((_,i)=>i)),'object');}
        private vertexItem(mesh:Mesh,index:number):Item{return this.make(mesh,'vertex',[index],[],state(this).canvas!.localToWorld(mesh.geometry.vertices[index],mesh),`v:${index}`);}
        private center(mesh:Mesh,indices:number[]):Vec3{const canvas=state(this).canvas!,points=indices.map(i=>canvas.localToWorld(mesh.geometry.vertices[i],mesh));return scale(points.reduce(add,{x:0,y:0,z:0}),1/Math.max(1,points.length));}
        private unique(items:Item[]):Item[]{return[...new Map(items.map(item=>[item.key,item])).values()];}
        private apply(items:Item[],operation:Operation):void{const selected=state(this).selected;if(operation==='replace')selected.clear();for(const item of items){if(operation==='subtract')selected.delete(item.key);else if(operation==='toggle'&&selected.has(item.key))selected.delete(item.key);else selected.set(item.key,item);}this.changed();}
        private result():Result{const s=state(this),items=[...s.selected.values()];return{mode:s.mode,items,objects:[...new Set(items.map(i=>i.mesh))],vertices:items.filter(i=>i.mode==='vertex'),edges:items.filter(i=>i.mode==='edge'),polygons:items.filter(i=>i.mode==='polygon'),faces:items.filter(i=>i.mode==='face'),source:this};}
        private changed():void{this.draw();this.syncWindowSelection();this.dispatchEvent(new CustomEvent('arianna:selection-3d-change',{bubbles:true,composed:true,detail:this.result()}));}
        private draw():void
        {
            const s=state(this),canvas=s.canvas,overlay=s.overlay;if(!canvas||!overlay)return;const rect=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));if(overlay.width!==w)overlay.width=w;if(overlay.height!==h)overlay.height=h;const ctx=overlay.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,w,h);ctx.save();ctx.scale(dpr,dpr);ctx.strokeStyle='#ff45aa';ctx.fillStyle='#e40c88';ctx.lineWidth=2;
            for(const item of s.selected.values()){const points=item.vertexIndices.map(i=>canvas.projectWorld(canvas.localToWorld(item.mesh.geometry.vertices[i],item.mesh))).filter(p=>p.visible);if(item.mode==='vertex')for(const p of points){ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fill();}else if(item.mode==='edge'&&points.length===2){ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);ctx.lineTo(points[1].x,points[1].y);ctx.stroke();}else for(const polygon of item.polygonIndices){const ids=item.mesh.geometry.indices.slice(polygon*3,polygon*3+3),p=ids.map(i=>canvas.projectWorld(canvas.localToWorld(item.mesh.geometry.vertices[i],item.mesh)));if(p.some(x=>!x.visible))continue;ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);ctx.lineTo(p[1].x,p[1].y);ctx.lineTo(p[2].x,p[2].y);ctx.closePath();ctx.fillStyle='rgba(228,12,136,.25)';ctx.fill();ctx.stroke();}}ctx.restore();
        }
    }
}

const SelectionEngine=CanvasSelection.CanvasSelection;
type SelectionMode=CanvasSelection.Mode;
const html=Templates.Template.Html;
const TextureCache=new WeakMap<HTMLElement,Map<string,HTMLImageElement>>();
const Selections=new WeakMap<HTMLElement,InstanceType<typeof SelectionEngine>>();

export namespace Canvas3D
{
    export interface Vec3 { x:number; y:number; z:number; }
    export interface Geometry3 { vertices:Vec3[]; normals:Vec3[]; indices:number[];faceIds?:number[];uvs?:Array<{x:number;y:number}|[number,number]>; clone():Geometry3; }
    export interface Material3 { kind?:string;color?:string;roughness?:number;metalness?:number;opacity?:number;emissive?:string;wireframe?:boolean;texture?:{data:string}; }
    export interface Mesh3 { geometry:Geometry3; position:Vec3; rotation:Vec3; scale:Vec3; visible:boolean; userData:Record<string,unknown>; updateMatrix?():void; }
    export interface Scene3 { children:Mesh3[]; add(obj:Mesh3):void; remove(obj:Mesh3):void; }
    export interface Camera3 { position:Vec3; }
    export interface Ray3 { origin:Vec3;direction:Vec3; }
    export type ViewPreset='perspective'|'front'|'right'|'top';
    export interface GridOptions{enabled:boolean;x:boolean;y:boolean;z:boolean;stepX:number;stepY:number;stepZ:number;kind:'lines'|'dotted'|'polar'|'isometric';}
    export interface SnapOptions{enabled:boolean;toGrid:boolean;x:boolean;y:boolean;z:boolean;stepX:number;stepY:number;stepZ:number;}
    type GridProvider={options?:Partial<GridOptions>&{snapX?:boolean;snapY?:boolean;snapZ?:boolean;snapStepX?:number;snapStepY?:number;snapStepZ?:number};configure(options:Partial<GridOptions>&{snapX?:boolean;snapY?:boolean;snapZ?:boolean;snapStepX?:number;snapStepY?:number;snapStepZ?:number}):unknown;project?(point:Vec3):Vec3;drawOn?(ctx:CanvasRenderingContext2D,width:number,height:number,dpr:number):void};
    const Settings=new WeakMap<HTMLElement,{grid:GridOptions;snap:SnapOptions;provider:GridProvider|null;attributesInitialized:boolean}>();
    const settings=(host:HTMLElement)=>{let value=Settings.get(host);if(!value){value={grid:{enabled:true,x:false,y:true,z:false,stepX:1,stepY:1,stepZ:1,kind:'lines'},snap:{enabled:true,toGrid:true,x:true,y:true,z:true,stepX:0,stepY:0,stepZ:0},provider:null,attributesInitialized:false};Settings.set(host,value);}return value;};

    interface RuntimeState
    {
        scene:Scene3;
        camera:Camera3;
        canvas?:HTMLCanvasElement;
        ctx:CanvasRenderingContext2D|null;
        meshes:Map<string,Mesh3>;
        frameCallbacks:Set<(dt:number)=>void>;
        raf:number;
        last:number;
        resizeObserver:ResizeObserver|null;
        yaw:number;
        pitch:number;
        distance:number;
        dragging:boolean;
        px:number;
        py:number;
        started:boolean;
        wiredCanvas?:HTMLCanvasElement;
        behaviours:Set<HTMLElement>;
        controls?:AbortController;
    }

    const cloneGeometry=(g:Geometry3):Geometry3=>({vertices:g.vertices.map(v=>({...v})),normals:g.normals.map(v=>({...v})),indices:[...g.indices],faceIds:g.faceIds?[...g.faceIds]:undefined,clone(){return cloneGeometry(this);}});
    const norm=(v:Vec3):Vec3=>{const l=Math.hypot(v.x,v.y,v.z)||1;return{x:v.x/l,y:v.y/l,z:v.z/l};};
    const sub=(a:Vec3,b:Vec3):Vec3=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
    const cross=(a:Vec3,b:Vec3):Vec3=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
    const dot=(a:Vec3,b:Vec3)=>a.x*b.x+a.y*b.y+a.z*b.z;

    const Runtime=new WeakMap<HTMLElement,RuntimeState>();
    const State=(host:HTMLElement):RuntimeState=>
    {
        let s=Runtime.get(host);
        if(!s)
        {
            const scene:Scene3={children:[],add(obj){if(!scene.children.includes(obj))scene.children.push(obj);},remove(obj){const i=scene.children.indexOf(obj);if(i>=0)scene.children.splice(i,1);}};
            s={scene,camera:{position:{x:3.5,y:2.5,z:4.5}},ctx:null,meshes:new Map(),frameCallbacks:new Set(),raf:0,last:0,resizeObserver:null,yaw:.72,pitch:.42,distance:4.6,dragging:false,px:0,py:0,started:false,behaviours:new Set()};
            Runtime.set(host,s);
        }
        return s;
    };

    export const Styles=new Css.Stylesheet([
        new Css.Rule('arianna-canvas-3d,.Canvas3D',{Background:'#13161a',Border:'1px solid #30363d',BorderRadius:'10px',BoxSizing:'border-box',Display:'block',Height:'520px',MaxWidth:'100%',MinHeight:'260px',MinWidth:'0',Overflow:'hidden',Position:'relative',Width:'100%'}),
        new Css.Rule('.Canvas3D-Canvas',{Cursor:'grab',Display:'block',Height:'100%',TouchAction:'none',Width:'100%'}),
        new Css.Rule('.Canvas3D-Canvas:active',{Cursor:'grabbing'}),
        new Css.Rule('.Canvas3D-Toolbar',{Color:'#e5e8ea',AlignItems:'center',BackdropFilter:'blur(12px)',Background:'rgba(26,30,35,.82)',Border:'1px solid rgba(255,255,255,.10)',BorderRadius:'7px',Display:'flex',Gap:'4px',Left:'12px',Padding:'5px',Position:'absolute',Top:'12px',ZIndex:'12',MaxWidth:'calc(100% - 24px)',OverflowX:'auto'}),
        new Css.Rule('.Canvas3D-Button',{Appearance:'none',Background:'#292e34',Border:'1px solid #454c54',BorderRadius:'5px',Color:'#c9d0d6',Cursor:'pointer',Font:'700 9px/1 system-ui',Height:'25px',Padding:'0 8px'}),
        new Css.Rule('.Canvas3D-Button[data-active="true"]',{BorderColor:'#e40c88',Color:'#fff',Background:'linear-gradient(180deg,#f344a4,#ce0879)',BoxShadow:'inset 0 1px 0 #ffffff35,0 1px 3px #0004'}),
        new Css.Rule('.Canvas3D-Input',{Height:'25px',BoxSizing:'border-box',Background:'#25292d',Color:'#e5e8ea',ColorScheme:'dark',Border:'1px solid #15181a',BorderRadius:'3px'}),
        new Css.Rule('.Canvas3D[theme="light"] .Canvas3D-Toolbar',{Color:'#25292d'}),
        new Css.Rule('.Canvas3D[theme="light"] .Canvas3D-Input',{Background:'#fff',Color:'#25292d',ColorScheme:'light',BorderColor:'#b8bdc2'}),
        new Css.Rule('.Canvas3D[theme] .Canvas3D-Button[data-active="true"]',{Color:'#fff',Background:'linear-gradient(180deg,#ff4dad,#e40c88,#b90769)'}),
        new Css.Rule('.Canvas3D-Axes',{Bottom:'12px',Color:'#8d969e',Font:'9px ui-monospace,monospace',Position:'absolute',Right:'12px',ZIndex:'10'}),
        new Css.Rule('arianna-canvas-3d[theme="light"],.Canvas3D[theme="light"]',{Background:'#eef1f4',BorderColor:'#c4cbd1'}),
        new Css.Rule('arianna-canvas-3d[theme="light"] .Canvas3D-Toolbar',{Background:'rgba(255,255,255,.86)',BorderColor:'rgba(0,0,0,.12)'}),
        new Css.Rule('arianna-canvas-3d[theme="light"] .Canvas3D-Button',{Background:'#f4f5f6',BorderColor:'#c5cbd0',Color:'#3b4248'}),
    ]);

    @Component('arianna-canvas-3d',Styles,{Shadow:false,Attributes:['theme','color','orbit','zoom','yaw','pitch','view','show-toolbar','grid-x','grid-y','grid-z','grid-step-x','grid-step-y','grid-step-z','grid-kind','show-grid','snap','snap-to-grid','snap-x','snap-y','snap-z','snap-step-x','snap-step-y','snap-step-z'],Properties:['grid','snap']})
    export class Canvas3D extends HTMLElement
    {
        public static readonly Styles=Styles;
        public template=html``;

        public get scene():Scene3{return State(this).scene;}
        public get camera():Camera3{return State(this).camera;}
        public get rendersGrid():boolean{return true;}
        public get canvas():HTMLCanvasElement|undefined{return State(this).canvas;}

        public onCreated():void{if(this.isConnected)this.onConnected();}
        public onMount():void{this.onConnected();}
        public onConnected():void
        {
            const s=State(this);
            this.classList.add('Canvas3D');
            if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');
            if(!this.hasAttribute('view'))this.setAttribute('view','perspective');
            if(!settings(this).attributesInitialized){this.readGridAttributes();settings(this).attributesInitialized=true;}if(s.started){this.syncToolbar();return;}

            s.yaw=this.numberAttr('yaw',.72);s.pitch=this.numberAttr('pitch',.42);s.distance=this.numberAttr('zoom',4.6);
            this.applyView(this.getView(),false);

            const canvas=document.createElement('canvas');canvas.className='Canvas3D-Canvas';
            const toolbar=this.buildToolbar();
            const axes=document.createElement('div');axes.className='Canvas3D-Axes';axes.textContent='X · Y · Z';
            this.replaceChildren(canvas,toolbar,axes,...s.behaviours);
            s.canvas=canvas;s.ctx=canvas.getContext('2d');s.started=true;

            this.wireOrbit();
            s.resizeObserver=new ResizeObserver(()=>this.resize());s.resizeObserver.observe(this);this.resize();
            s.last=performance.now();s.raf=requestAnimationFrame(t=>this.loop(t));
            this.syncToolbar();this.buildSelectionBar();this.Selection.enabled=false;
            s.controls=new AbortController();
            this.addEventListener('arianna:toolbar-layout',event=>{
                const inset=(event as CustomEvent).detail?.insets??{top:0,bottom:0,left:0,right:0};
                toolbar.style.top=inset.top+'px';toolbar.style.left=inset.left+'px';toolbar.style.right=inset.right+'px';
                const footer=this.querySelector<HTMLElement>('.Canvas3D-TransformFooter');if(footer){footer.style.bottom=inset.bottom+'px';footer.style.left=inset.left+'px';footer.style.right=inset.right+'px';}
                const selection=this.querySelector<HTMLElement>('.Canvas3D-SelectionBar');if(selection){selection.style.bottom=(inset.bottom+42)+'px';selection.style.left=(inset.left+12)+'px';}
            },{signal:s.controls.signal});
            for(const behaviour of s.behaviours)(behaviour as HTMLElement&{attach?:(canvas:Canvas3D)=>unknown}).attach?.(this);
        }
        public onUnmount():void
        {
            for(const image of TextureCache.get(this)?.values()??[]){image.onload=null;image.onerror=null;image.src='';}TextureCache.delete(this);this.dispatchEvent(new Event('arianna:canvas-dispose'));Selections.get(this)?.detach();Selections.delete(this);
            const s=State(this);s.controls?.abort();for(const behaviour of s.behaviours)(behaviour as HTMLElement&{detach?:()=>unknown}).detach?.();cancelAnimationFrame(s.raf);s.resizeObserver?.disconnect();s.resizeObserver=null;s.frameCallbacks.clear();s.canvas=undefined;s.ctx=null;s.wiredCanvas=undefined;s.meshes.clear();s.scene.children.length=0;s.started=false;
        }
        public onAttributeChanged(name?:string):void
        {
            this.readGridAttributes(name);const s=State(this);if(!s.started)return;
            if(name==='view')this.applyView(this.getView(),false);
            if(name==='yaw')s.yaw=this.numberAttr('yaw',s.yaw);
            if(name==='pitch')s.pitch=this.numberAttr('pitch',s.pitch);
            if(name==='zoom')s.distance=this.numberAttr('zoom',s.distance);
            this.syncToolbar();
        }

        /** Register a caller-owned mesh with this viewport. */
        public addMesh(id:string,mesh:Mesh3):Mesh3
        {
            const key=String(id||'').trim();if(!key)throw new Error('[Canvas3D] addMesh requires a non-empty id');
            const s=State(this),existing=s.meshes.get(key);if(existing&&existing!==mesh)s.scene.remove(existing);
            mesh.userData??={};mesh.userData.id=key;
            if(mesh.userData.__ariannaInitialGeometry===undefined)mesh.userData.__ariannaInitialGeometry=mesh.geometry.clone();
            if(mesh.userData.__ariannaInitialTransform===undefined)mesh.userData.__ariannaInitialTransform={position:{...mesh.position},rotation:{...mesh.rotation},scale:{...mesh.scale},visible:mesh.visible};
            s.meshes.set(key,mesh);s.scene.add(mesh);return mesh;
        }
        public removeMesh(source:string|Mesh3):this
        {
            const s=State(this),mesh=typeof source==='string'?s.meshes.get(source)??null:source;if(!mesh)return this;
            s.scene.remove(mesh);for(const [id,item] of [...s.meshes])if(item===mesh)s.meshes.delete(id);return this;
        }
        public clearMeshes():this{const s=State(this);s.scene.children.length=0;s.meshes.clear();return this;}
        public findMesh(id:string):Mesh3|null{return State(this).meshes.get(id)??null;}
        public getMeshes():ReadonlyArray<Mesh3>{return [...State(this).scene.children];}
        public cloneMesh(source:string|Mesh3):Mesh3|null
        {
            const mesh=typeof source==='string'?this.findMesh(source):source;if(!mesh)return null;
            return {geometry:mesh.geometry.clone(),position:{...mesh.position},rotation:{...mesh.rotation},scale:{...mesh.scale},visible:mesh.visible,userData:{...mesh.userData}};
        }
        public resetMesh(source:string|Mesh3):this
        {
            const mesh=typeof source==='string'?this.findMesh(source):source;if(!mesh)return this;
            const initialGeometry=mesh.userData.__ariannaInitialGeometry as Geometry3|undefined;
            const initial=mesh.userData.__ariannaInitialTransform as {position:Vec3;rotation:Vec3;scale:Vec3;visible:boolean}|undefined;
            if(initialGeometry)mesh.geometry=initialGeometry.clone();
            if(initial){mesh.position={...initial.position};mesh.rotation={...initial.rotation};mesh.scale={...initial.scale};mesh.visible=initial.visible;}
            delete mesh.userData['_arianna_opacity'];return this;
        }
        public onFrame(cb:(dt:number)=>void):()=>void{const s=State(this);s.frameCallbacks.add(cb);return()=>s.frameCallbacks.delete(cb);}
        public get grid():GridOptions{return {...settings(this).grid};}public set grid(value:Partial<GridOptions>){this.setGrid(value);}
        public get snap():SnapOptions{return {...settings(this).snap};}public set snap(value:Partial<SnapOptions>){this.setSnap(value);}
        public getGrid():GridOptions{return this.grid;}public getSnap():SnapOptions{return this.snap;}
        public setGrid(value:Partial<GridOptions>|boolean):this{const s=settings(this);if(typeof value==='boolean')s.grid.enabled=value;else Object.assign(s.grid,value);for(const key of ['stepX','stepY','stepZ'] as const)s.grid[key]=Math.max(.0001,Number(s.grid[key])||1);s.provider?.configure(s.grid);this.syncToolbar();this.dispatchEvent(new CustomEvent('arianna:grid-change',{bubbles:true,composed:true,detail:{...s.grid,source:this}}));return this;}
        public setSnap(value:Partial<SnapOptions>|boolean):this{const s=settings(this);if(typeof value==='boolean')s.snap.enabled=value;else Object.assign(s.snap,value);for(const key of ['stepX','stepY','stepZ'] as const)s.snap[key]=Math.max(0,Number(s.snap[key])||0);s.provider?.configure({snapX:s.snap.x,snapY:s.snap.y,snapZ:s.snap.z,snapStepX:s.snap.stepX,snapStepY:s.snap.stepY,snapStepZ:s.snap.stepZ});this.syncToolbar();this.dispatchEvent(new CustomEvent('arianna:snap-change',{bubbles:true,composed:true,detail:{...s.snap,source:this}}));return this;}
        public useGrid(provider:GridProvider|null):this{const s=settings(this);s.provider=provider;if(provider?.options)for(const key of ['enabled','x','y','z','stepX','stepY','stepZ','kind'] as const)if(provider.options[key]!==undefined)(s.grid as any)[key]=provider.options[key];if(provider?.options){s.snap.x=provider.options.snapX??s.snap.x;s.snap.y=provider.options.snapY??s.snap.y;s.snap.z=provider.options.snapZ??s.snap.z;s.snap.stepX=provider.options.snapStepX??s.snap.stepX;s.snap.stepY=provider.options.snapStepY??s.snap.stepY;s.snap.stepZ=provider.options.snapStepZ??s.snap.stepZ;}this.syncToolbar();return this;}
        public snapPoint(point:Vec3):Vec3{const {grid,snap,provider}=settings(this),out={...point},projected=provider?.project?.(point);if(snap.enabled&&snap.toGrid)for(const axis of ['x','y','z'] as const){const key=axis==='x'?'stepX':axis==='y'?'stepY':'stepZ',step=snap[key]||grid[key];if(snap[axis])out[axis]=projected?.[axis]??Math.round(point[axis]/step)*step;}return out;}
        public invalidate():void{/* Continuous render loop: retained for modifier viewport contract. */}

        /** Add independent behaviours such as Grid3D, Selection3D and SelectionRectangle. */
        public add(...behaviours:HTMLElement[]):this
        {
            const s=State(this);
            for(const behaviour of behaviours){s.behaviours.add(behaviour);if(s.started){this.appendChild(behaviour);(behaviour as HTMLElement&{attach?:(canvas:Canvas3D)=>unknown}).attach?.(this);}}
            return this;
        }
        public removeBehaviour(behaviour:HTMLElement):this{State(this).behaviours.delete(behaviour);(behaviour as HTMLElement&{detach?:()=>unknown}).detach?.();behaviour.remove();return this;}
        public get selectionSurface():HTMLCanvasElement{const canvas=State(this).canvas;if(!canvas)throw new Error('[Canvas3D] connect the canvas before attaching selection behaviours');return canvas;}

        public localToWorld(point:Vec3,mesh:Mesh3):Vec3{return this.transform(point,mesh);}
        public projectWorld(point:Vec3):{x:number;y:number;z:number;visible:boolean}
        {
            /* Selection rectangles are expressed in selectionSurface-local
             * coordinates, not in coordinates of the whole Canvas3D host
             * (which also contains toolbars/status UI). */
            const s=State(this),rect=this.selectionSurface.getBoundingClientRect();this.updateCamera();const basis=this.cameraBasis(),rel=sub(point,s.camera.position),z=dot(rel,basis.forward),focal=rect.height*.82;
            return{x:rect.width/2+focal*dot(rel,basis.right)/Math.max(.0001,z),y:rect.height/2-focal*dot(rel,basis.up)/Math.max(.0001,z),z,visible:z>.0001};
        }
        public rayFromClient(clientX:number,clientY:number):Ray3
        {
            const s=State(this),rect=this.selectionSurface.getBoundingClientRect();this.updateCamera();const basis=this.cameraBasis(),focal=rect.height*.82,x=clientX-rect.left-rect.width/2,y=clientY-rect.top-rect.height/2;
            return{origin:{...s.camera.position},direction:norm({x:basis.forward.x+basis.right.x*x/focal-basis.up.x*y/focal,y:basis.forward.y+basis.right.y*x/focal-basis.up.y*y/focal,z:basis.forward.z+basis.right.z*x/focal-basis.up.z*y/focal})};
        }
        public createSelectionVolume(rect:{left:number;top:number;right:number;bottom:number}):{rays:Ray3[]}
        {
            const bounds=this.selectionSurface.getBoundingClientRect();return{rays:[[rect.left,rect.top],[rect.right,rect.top],[rect.right,rect.bottom],[rect.left,rect.bottom]].map(([x,y])=>this.rayFromClient(bounds.left+x,bounds.top+y))};
        }

        /** Lazily created selection behavior, shared by floating controls and SceneGraph3D. */
        public get Selection():InstanceType<typeof SelectionEngine>{
            let value=Selections.get(this);if(!value){value=new SelectionEngine();value.attach(this);Selections.set(this,value);}return value;
        }
        private buildSelectionBar():void {
            const bar=document.createElement('nav');bar.className='Canvas3D-Toolbar Canvas3D-SelectionBar';bar.style.cssText='top:auto;bottom:42px;left:12px;padding:3px;gap:3px';bar.setAttribute('aria-label','Selection');
            const modes:[SelectionMode,string][]=[['vertex','Vertex'],['edge','Edges'],['polygon','Polygons'],['face','Faces'],['object','Object']];
            for(const [mode,title] of modes){const b=document.createElement('button');b.type='button';b.className='Canvas3D-Button';b.textContent=title;b.style.cssText='height:22px;padding:0 6px;font-size:9px';b.onclick=()=>{this.Selection.enabled=true;this.Selection.setMode(mode);for(const other of bar.querySelectorAll('button'))other.dataset.active=String(other===b);};bar.append(b);}
            const orbit=document.createElement('button');orbit.type='button';orbit.className='Canvas3D-Button';orbit.textContent='Orbit';orbit.onclick=()=>{if(Selections.has(this))this.Selection.enabled=false;for(const b of bar.querySelectorAll('button'))b.dataset.active=String(b===orbit);};bar.append(orbit);this.appendChild(bar);
        }

        public getView():ViewPreset
        {
            const v=this.getAttribute('view');return v==='front'||v==='right'||v==='top'?v:'perspective';
        }
        public setView(view:ViewPreset):this
        {
            if(this.getAttribute('view')!==view)this.setAttribute('view',view);else this.applyView(view,false);
            return this;
        }
        public resetView():this{return this.setView('perspective');}

        private numberAttr(name:string,fallback:number):number{const n=parseFloat(this.getAttribute(name)??String(fallback));return Number.isFinite(n)?n:fallback;}
        private updateCamera():void{const s=State(this),cp=Math.cos(s.pitch);s.camera.position={x:s.distance*Math.sin(s.yaw)*cp,y:s.distance*Math.sin(s.pitch),z:s.distance*Math.cos(s.yaw)*cp};}
        private cameraBasis():{forward:Vec3;right:Vec3;up:Vec3}{const s=State(this),forward=norm(sub({x:0,y:0,z:0},s.camera.position)),right=norm(cross(forward,{x:0,y:1,z:0}));return{forward,right,up:cross(right,forward)};}
        private applyView(view:ViewPreset,reflect=true):void
        {
            const s=State(this);
            if(view==='front'){s.yaw=0;s.pitch=0;}
            else if(view==='right'){s.yaw=Math.PI/2;s.pitch=0;}
            else if(view==='top'){s.yaw=0;s.pitch=1.24;}
            else{s.yaw=.72;s.pitch=.42;}
            if(reflect&&this.getAttribute('view')!==view)this.setAttribute('view',view);
            this.syncToolbar();
        }
        private buildToolbar():HTMLElement
        {
            const bar=document.createElement('div');bar.className='Canvas3D-Toolbar';
            for(const view of ['perspective','front','right','top'] as ViewPreset[])
            {
                const b=document.createElement('button');b.type='button';b.className='Canvas3D-Button';b.dataset.view=view;b.textContent=view==='perspective'?'Perspective':view[0].toUpperCase()+view.slice(1);b.onclick=()=>this.setView(view);bar.appendChild(b);
            }
            const reset=document.createElement('button');reset.type='button';reset.className='Canvas3D-Button';reset.textContent='Reset View';reset.onclick=()=>this.resetView();bar.appendChild(reset);
            bar.style.cssText='top:0;left:0;right:0;max-width:100%;border-radius:0;flex-wrap:wrap';
            const s=settings(this);
            bar.style.gap='8px';bar.style.padding='6px 10px';
            for(const group of ['grid','snap'] as const){
                const box=document.createElement('div');box.dataset.controlGroup=group;box.style.cssText='display:flex;align-items:center;gap:8px;flex:0 0 auto;margin-left:12px;padding-left:12px;border-left:1px solid #8885';
                const toggle=document.createElement('button');toggle.type='button';toggle.className='Canvas3D-Button';toggle.textContent=group==='grid'?'Grid':'Snap';toggle.dataset[group+'Toggle']='true';toggle.onclick=()=>group==='grid'?this.setGrid(!s.grid.enabled):this.setSnap(!s.snap.enabled);box.appendChild(toggle);
                for(const axis of ['x','y','z'] as const){
                    const key=axis==='x'?'stepX':axis==='y'?'stepY':'stepZ',pair=document.createElement('div');pair.style.cssText='display:flex;align-items:center;gap:5px';
                    const button=document.createElement('button');button.type='button';button.className='Canvas3D-Button';button.textContent=axis.toUpperCase();button.dataset[group==='grid'?'gridEnabledAxis':'snapAxis']=axis;button.setAttribute('aria-label',group+' '+axis.toUpperCase());button.title=group==='grid'?'Grid plane normal to '+axis.toUpperCase():'Snap '+axis.toUpperCase();button.onclick=()=>group==='grid'?this.setGrid({[axis]:!s.grid[axis]}):this.setSnap({[axis]:!s.snap[axis]});
                    const input=document.createElement('input');input.type='number';input.min='.0001';input.step='.1';input.className='Canvas3D-Input';input.style.width='52px';input.setAttribute('aria-label',group+' spacing '+axis.toUpperCase());input.dataset[group==='grid'?'gridAxis':'snapStep']=axis;input.onchange=()=>group==='grid'?this.setGrid({[key]:Number(input.value)}):this.setSnap({[key]:Number(input.value)});pair.append(button,input);box.appendChild(pair);
                }
                if(group==='grid'){
                    const kind=document.createElement('select');kind.className='Canvas3D-Button';kind.dataset.gridKind='true';kind.setAttribute('aria-label','Grid style');for(const value of ['lines','dotted','polar','isometric'] as const){const option=document.createElement('option');option.value=value;option.textContent=value[0].toUpperCase()+value.slice(1);kind.appendChild(option);}kind.onchange=()=>this.setGrid({kind:kind.value as GridOptions['kind']});box.appendChild(kind);
                }else{
                    const button=document.createElement('button');button.type='button';button.className='Canvas3D-Button';button.textContent='Snap to Grid';button.dataset.snapToGrid='true';button.onclick=()=>this.setSnap({toGrid:!s.snap.toGrid});box.appendChild(button);
                }
                bar.appendChild(box);
            }
            return bar;
        }
        private readGridAttributes(changed?:string):void{const s=settings(this),has=(name:string)=>!changed||changed===name;for(const axis of ['x','y','z'] as const){if(has('grid-'+axis)&&this.hasAttribute('grid-'+axis))s.grid[axis]=this.getAttribute('grid-'+axis)!=='false';const name='grid-step-'+axis;if(has(name)&&this.hasAttribute(name))s.grid[axis==='x'?'stepX':axis==='y'?'stepY':'stepZ']=Math.max(.0001,Number(this.getAttribute(name))||1);if(has('snap-'+axis)&&this.hasAttribute('snap-'+axis))s.snap[axis]=this.getAttribute('snap-'+axis)!=='false';const step='snap-step-'+axis;if(has(step)&&this.hasAttribute(step))s.snap[axis==='x'?'stepX':axis==='y'?'stepY':'stepZ']=Math.max(0,Number(this.getAttribute(step))||0);}if(has('show-grid')&&this.hasAttribute('show-grid'))s.grid.enabled=this.getAttribute('show-grid')!=='false';if(has('snap')&&this.hasAttribute('snap'))s.snap.enabled=this.getAttribute('snap')!=='false';if(has('snap-to-grid')&&this.hasAttribute('snap-to-grid'))s.snap.toGrid=this.getAttribute('snap-to-grid')!=='false';const kind=this.getAttribute('grid-kind');if(has('grid-kind')&&(kind==='lines'||kind==='dotted'||kind==='polar'||kind==='isometric'))s.grid.kind=kind;if(!changed||changed.startsWith('grid-')||changed==='show-grid'||changed.startsWith('snap-'))s.provider?.configure({...s.grid,snapX:s.snap.x,snapY:s.snap.y,snapZ:s.snap.z,snapStepX:s.snap.stepX,snapStepY:s.snap.stepY,snapStepZ:s.snap.stepZ});}
        private syncToolbar():void
        {
            const bar=this.querySelector<HTMLElement>('.Canvas3D-Toolbar');if(!bar)return;
            bar.style.display=this.getAttribute('show-toolbar')==='false'?'none':'flex';
            const current=this.getView();bar.querySelectorAll<HTMLElement>('[data-view]').forEach(b=>b.dataset.active=String(b.dataset.view===current));
            const s=settings(this);for(const [selector,value] of [['[data-snap-toggle]',s.snap.enabled],['[data-snap-to-grid]',s.snap.toGrid]] as const){const button=bar.querySelector<HTMLElement>(selector);if(button){button.dataset.active=String(value);button.setAttribute('aria-pressed',String(value));}}for(const input of bar.querySelectorAll<HTMLInputElement>('[data-grid-axis]'))if(document.activeElement!==input)input.value=String(s.grid[input.dataset.gridAxis==='x'?'stepX':input.dataset.gridAxis==='y'?'stepY':'stepZ']);for(const input of bar.querySelectorAll<HTMLInputElement>('[data-snap-step]'))if(document.activeElement!==input){const key=input.dataset.snapStep==='x'?'stepX':input.dataset.snapStep==='y'?'stepY':'stepZ';input.value=String(s.snap[key]||s.grid[key]);}const kind=bar.querySelector<HTMLSelectElement>('[data-grid-kind]');if(kind&&document.activeElement!==kind)kind.value=s.grid.kind;for(const button of bar.querySelectorAll<HTMLElement>('[data-snap-axis]')){const axis=button.dataset.snapAxis as 'x'|'y'|'z';button.dataset.active=String(s.snap[axis]);button.setAttribute('aria-pressed',String(s.snap[axis]));}for(const button of bar.querySelectorAll<HTMLElement>('[data-grid-enabled-axis]')){const axis=button.dataset.gridEnabledAxis as 'x'|'y'|'z';button.dataset.active=String(s.grid[axis]);button.setAttribute('aria-pressed',String(s.grid[axis]));}const grid=bar.querySelector<HTMLElement>('[data-grid-toggle]');if(grid){grid.dataset.active=String(s.grid.enabled);grid.setAttribute('aria-pressed',String(s.grid.enabled));}
        }
        private resize():void
        {
            const canvas=State(this).canvas;if(!canvas)return;const dpr=Math.min(2,window.devicePixelRatio||1),r=this.getBoundingClientRect();const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;
        }
        private wireOrbit():void
        {
            const s=State(this),c=s.canvas;if(!c||s.wiredCanvas===c)return;s.wiredCanvas=c;
            c.addEventListener('pointerdown',e=>{if(this.getAttribute('orbit')==='false'||c.dataset.selection3dActive==='true')return;s.dragging=true;s.px=e.clientX;s.py=e.clientY;c.setPointerCapture(e.pointerId);});
            c.addEventListener('pointermove',e=>{if(!s.dragging||this.getAttribute('orbit')==='false')return;s.yaw+=(e.clientX-s.px)*.009;s.pitch=Math.max(-1.25,Math.min(1.25,s.pitch+(e.clientY-s.py)*.009));s.px=e.clientX;s.py=e.clientY;if(this.getAttribute('view')!=='perspective')this.setAttribute('view','perspective');});
            const up=()=>s.dragging=false;c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
            c.addEventListener('wheel',e=>{e.preventDefault();s.distance=Math.max(2.2,Math.min(12,s.distance*Math.exp(e.deltaY*.0012)));},{passive:false});
        }
        private loop(time:number):void
        {
            const s=State(this);if(!s.started)return;const dt=Math.min(.05,Math.max(0,(time-s.last)/1000));s.last=time;
            for(const cb of [...s.frameCallbacks]){try{cb(dt);}catch(error){console.warn('[Canvas3D] frame callback',error);}}
            this.render();s.raf=requestAnimationFrame(t=>this.loop(t));
        }
        private transform(v:Vec3,m:Mesh3):Vec3
        {
            let x=v.x*m.scale.x,y=v.y*m.scale.y,z=v.z*m.scale.z;
            let c=Math.cos(m.rotation.x),s=Math.sin(m.rotation.x);[y,z]=[y*c-z*s,y*s+z*c];c=Math.cos(m.rotation.y);s=Math.sin(m.rotation.y);[x,z]=[x*c+z*s,-x*s+z*c];c=Math.cos(m.rotation.z);s=Math.sin(m.rotation.z);[x,y]=[x*c-y*s,x*s+y*c];
            return{x:x+m.position.x,y:y+m.position.y,z:z+m.position.z};
        }
        private color(hex:string,shade:number,alpha:number):string
        {
            const h=hex.replace('#','');const n=parseInt(h.length===3?h.split('').map(x=>x+x).join(''):h,16);const r=(n>>16)&255,g=(n>>8)&255,b=n&255;const k=Math.max(.18,Math.min(1.35,shade));return`rgba(${Math.round(r*k)},${Math.round(g*k)},${Math.round(b*k)},${Math.max(0,Math.min(1,alpha))})`;
        }
        private normalColor(normal:Vec3):string
        {
            const channel=(value:number)=>Math.max(0,Math.min(255,Math.round((value*.5+.5)*255))).toString(16).padStart(2,'0');
            return`#${channel(normal.x)}${channel(normal.y)}${channel(normal.z)}`;
        }
        private materialShade(material:Material3,diffuse:number):number
        {
            const kind=material.kind??'standard',roughness=Math.max(0,Math.min(1,Number(material.roughness??.45))),metalness=Math.max(0,Math.min(1,Number(material.metalness??.15)));
            if(kind==='basic'||kind==='normal'||kind==='wireframe')return 1;
            const lit=.34+.66*Math.max(0,diffuse),soft=.55+(.45*lit),shade=lit*(1-roughness*.38)+soft*(roughness*.38)+metalness*.12;
            return kind==='toon'?Math.round(shade*4)/4:shade;
        }
        /** Standalone grid: no external Grid3D is required. Work is bounded per frame. */
        private drawDefaultGrid(ctx:CanvasRenderingContext2D,w:number,h:number,dpr:number):void {
            const g=settings(this).grid,s=State(this),basis=this.cameraBasis(),focal=h*.82;
            const project=(p:Vec3)=>{const r=sub(p,s.camera.position),z=dot(r,basis.forward);return {x:w/2+focal*dot(r,basis.right)/Math.max(.08,z),y:h/2-focal*dot(r,basis.up)/Math.max(.08,z),z};};
            const line=(a:Vec3,b:Vec3)=>{let A=project(a),B=project(b);const near=.081;if(A.z<near&&B.z<near)return;if(A.z<near){const t=(near-A.z)/(B.z-A.z);A=project({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t});}else if(B.z<near){const t=(near-B.z)/(A.z-B.z);B=project({x:b.x+(a.x-b.x)*t,y:b.y+(a.y-b.y)*t,z:b.z+(a.z-b.z)*t});}ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);};
            const extent=Math.max(6,s.distance*2),light=this.getAttribute('theme')==='light';
            ctx.save();ctx.strokeStyle=light?'rgba(60,76,94,.28)':'rgba(174,192,211,.28)';ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=dpr*.75;ctx.beginPath();
            for(const normal of ['x','y','z'] as const){
                if(!g[normal])continue;
                const [a,b]=normal==='x'?['y','z'] as const:normal==='y'?['x','z'] as const:['x','y'] as const;
                const steps={x:g.stepX,y:g.stepY,z:g.stepZ},rawA=steps[a],rawB=steps[b];
                // Decimate densely spaced grids by integer multiples, retaining alignment.
                const da=rawA*Math.max(1,Math.ceil(extent/(rawA*24))),db=rawB*Math.max(1,Math.ceil(extent/(rawB*24)));
                const point=(u:number,v:number):Vec3=>{const p={x:0,y:0,z:0};p[a]=g.kind==='isometric'?u+v*.5:u;p[b]=g.kind==='isometric'?v*Math.sqrt(3)/2:v;return p;};
                if(g.kind==='dotted'){
                    for(let i=-Math.floor(extent/da);i<=extent/da;i++)for(let j=-Math.floor(extent/db);j<=extent/db;j++){const p=project(point(i*da,j*db));if(p.z>.08&&p.x>=0&&p.x<=w&&p.y>=0&&p.y<=h)ctx.fillRect(p.x-dpr*.7,p.y-dpr*.7,dpr*1.4,dpr*1.4);}
                }else if(g.kind==='polar'){
                    const step=Math.max(da,db);for(let r=step;r<=extent;r+=step)for(let k=0;k<64;k++){const t=k*Math.PI/32,n=(k+1)*Math.PI/32;line(point(r*Math.cos(t),r*Math.sin(t)),point(r*Math.cos(n),r*Math.sin(n)));}
                    for(let k=0;k<12;k++){const t=k*Math.PI/6;line(point(0,0),point(extent*Math.cos(t),extent*Math.sin(t)));}
                }else{
                    for(let i=-Math.floor(extent/da);i<=extent/da;i++)line(point(i*da,-extent),point(i*da,extent));
                    for(let j=-Math.floor(extent/db);j<=extent/db;j++)line(point(-extent,j*db),point(extent,j*db));
                    if(g.kind==='isometric')for(let k=-48;k<=48;k++){const c=k*Math.max(da,db),lo=Math.max(-extent,c-extent),hi=Math.min(extent,c+extent);if(lo<=hi)line(point(lo,c-lo),point(hi,c-hi));}
                }
            }
            ctx.stroke();ctx.restore();
        }
        private texture(data?:string):HTMLImageElement|null{
            if(!data||!/^data:image\/(png|jpeg);base64,/.test(data))return null;
            let cache=TextureCache.get(this);if(!cache){cache=new Map();TextureCache.set(this,cache);}
            let image=cache.get(data);if(!image){if(cache.size>=64){const first=cache.keys().next().value;if(first)cache.delete(first);}image=document.createElement('img');cache.set(data,image);image.src=data;}
            return image.complete&&image.naturalWidth>0?image:null;
        }
        private drawTexture(ctx:CanvasRenderingContext2D,image:HTMLImageElement,points:{x:number;y:number}[],uv:{x:number;y:number}[],alpha:number):void{
            const u=uv.map(p=>({x:p.x*image.naturalWidth,y:(1-p.y)*image.naturalHeight})),a=u[1].x-u[0].x,b=u[1].y-u[0].y,c=u[2].x-u[0].x,d=u[2].y-u[0].y,det=a*d-b*c;if(Math.abs(det)<1e-8)return;
            const px=points[1].x-points[0].x,py=points[1].y-points[0].y,qx=points[2].x-points[0].x,qy=points[2].y-points[0].y;
            const A=(px*d-qx*b)/det,B=(py*d-qy*b)/det,C=(qx*a-px*c)/det,D=(qy*a-py*c)/det;
            ctx.save();ctx.clip();ctx.globalAlpha=Math.max(0,Math.min(1,alpha));ctx.transform(A,B,C,D,points[0].x-A*u[0].x-C*u[0].y,points[0].y-B*u[0].x-D*u[0].y);ctx.drawImage(image,0,0);ctx.restore();
        }
        private render():void
        {
            const s=State(this),canvas=s.canvas,ctx=s.ctx;if(!canvas||!ctx)return;const w=canvas.width,h=canvas.height,dpr=Math.min(2,window.devicePixelRatio||1);
            const light=this.getAttribute('theme')==='light';const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,light?'#f5f7f9':'#20252b');grad.addColorStop(1,light?'#dfe4e8':'#111418');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
            this.updateCamera();const grid=settings(this);if(grid.grid.enabled){if(grid.provider?.drawOn)grid.provider.drawOn(ctx,w/dpr,h/dpr,dpr);else this.drawDefaultGrid(ctx,w,h,dpr);}const {forward,right,up}=this.cameraBasis(),focal=(h/dpr)*.82*dpr;
            type Tri={p:[{x:number;y:number;z:number},{x:number;y:number;z:number},{x:number;y:number;z:number}];depth:number;shade:number;color:string;alpha:number;wireframe:boolean;texture:HTMLImageElement|null;uv:{x:number;y:number}[]};const tris:Tri[]=[];
            for(const mesh of s.scene.children){if(!mesh.visible)continue;const g=mesh.geometry,material=(mesh.userData.material??{}) as Material3,opacity=Number(mesh.userData['_arianna_opacity']??1)*Number(material.opacity??1),fallback=String(mesh.userData.color??this.getAttribute('color')??'#8f9aa6'),base=String(material.color??fallback),wireframe=Boolean(material.wireframe||material.kind==='wireframe'),texture=this.texture(material.texture?.data);const bounds={min:{x:Infinity,y:Infinity,z:Infinity},max:{x:-Infinity,y:-Infinity,z:-Infinity}};if(texture)for(const v of g.vertices)for(const axis of ['x','y','z'] as const){bounds.min[axis]=Math.min(bounds.min[axis],v[axis]);bounds.max[axis]=Math.max(bounds.max[axis],v[axis]);}const projected=g.vertices.map(v=>{const world=this.transform(v,mesh),rel=sub(world,s.camera.position),z=dot(rel,forward);return{x:w/2+focal*dot(rel,right)/Math.max(.08,z),y:h/2-focal*dot(rel,up)/Math.max(.08,z),z,world};});for(let i=0;i<g.indices.length;i+=3){const ia=g.indices[i],ib=g.indices[i+1],ic=g.indices[i+2],a=projected[ia],b=projected[ib],c=projected[ic];if(!a||!b||!c||a.z<=.08||b.z<=.08||c.z<=.08)continue;const wa=a.world,wb=b.world,wc=c.world,n=norm(cross(sub(wb,wa),sub(wc,wa))),ld=norm({x:-.45,y:.75,z:.6}),diffuse=Math.max(0,dot(n,ld)),shade=this.materialShade(material,diffuse),color=material.kind==='normal'?this.normalColor(n):base;const uv=texture?(()=>{const localNormal=cross(sub(g.vertices[ib],g.vertices[ia]),sub(g.vertices[ic],g.vertices[ia])),axes:('x'|'y'|'z')[]=Math.abs(localNormal.x)>Math.abs(localNormal.y)&&Math.abs(localNormal.x)>Math.abs(localNormal.z)?['z','y']:Math.abs(localNormal.y)>Math.abs(localNormal.z)?['x','z']:['x','y'];return [ia,ib,ic].map(j=>((value)=>Array.isArray(value)?{x:value[0],y:value[1]}:value)(g.uvs?.[j])??{x:(g.vertices[j][axes[0]]-bounds.min[axes[0]])/(bounds.max[axes[0]]-bounds.min[axes[0]]||1),y:(g.vertices[j][axes[1]]-bounds.min[axes[1]])/(bounds.max[axes[1]]-bounds.min[axes[1]]||1)});})():[];tris.push({texture,uv,p:[a,b,c],depth:(a.z+b.z+c.z)/3,shade,color,alpha:opacity,wireframe});}}
            tris.sort((a,b)=>b.depth-a.depth);ctx.lineJoin='round';for(const tri of tris){ctx.beginPath();ctx.moveTo(tri.p[0].x,tri.p[0].y);ctx.lineTo(tri.p[1].x,tri.p[1].y);ctx.lineTo(tri.p[2].x,tri.p[2].y);ctx.closePath();if(!tri.wireframe){ctx.fillStyle=this.color(tri.color,tri.shade,tri.alpha);ctx.fill();if(tri.texture)this.drawTexture(ctx,tri.texture,tri.p,tri.uv,tri.alpha);}ctx.strokeStyle=tri.wireframe?this.color(tri.color,1,tri.alpha):(light?'rgba(35,40,45,.10)':'rgba(255,255,255,.055)');ctx.lineWidth=(tri.wireframe?1.15:.7)*dpr;ctx.stroke();}
        }
    }
}
export type Canvas3DMesh=Canvas3D.Mesh3;
export type Canvas3DGeometry=Canvas3D.Geometry3;
export type Canvas3DViewPreset=Canvas3D.ViewPreset;
export default Canvas3D.Canvas3D;

// Re-exported by the existing graphics/3D/index.ts export-star.
export { SceneGraph3D } from './SceneGraph3D.ts';
export type { SceneGraphOptions } from './SceneGraph3D.ts';
