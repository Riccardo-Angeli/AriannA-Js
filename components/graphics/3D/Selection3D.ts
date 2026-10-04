/** Topology-aware 3D selection behaviour, independent from tools and modifiers. */
import { Component, Templates } from '../../../core/index.ts';
import type { SelectionRectangleDetail } from '../SelectionRectangle.ts';
const html=Templates.Template.Html;

export namespace Selection3D
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
    export interface Result{mode:Mode;items:Item[];objects:Mesh[];vertices:Item[];edges:Item[];polygons:Item[];faces:Item[];source:Selection3D;}
    export interface Options{canvas?:CanvasTarget;mode?:Mode;enabled?:boolean;backfaces?:'exclude'|'include';faceAngle?:number;}
    export interface ModifierTarget{bindMesh?(mesh:Mesh):unknown;apply?():unknown;selection?:Result;}

    const add=(a:Vec3,b:Vec3):Vec3=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z}),sub=(a:Vec3,b:Vec3):Vec3=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z}),scale=(a:Vec3,k:number):Vec3=>({x:a.x*k,y:a.y*k,z:a.z*k}),dot=(a:Vec3,b:Vec3)=>a.x*b.x+a.y*b.y+a.z*b.z,cross=(a:Vec3,b:Vec3):Vec3=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x}),norm=(a:Vec3)=>scale(a,1/(Math.hypot(a.x,a.y,a.z)||1));
    interface Hit{mesh:Mesh;triangle:number;indices:[number,number,number];point:Vec3;distance:number;bary:[number,number,number];}
    interface State{canvas:CanvasTarget|null;mode:Mode;enabled:boolean;backfaces:'exclude'|'include';faceAngle:number;selected:Map<string,Item>;cleanup:(()=>void)|null;overlay:HTMLCanvasElement|null;down:{x:number;y:number}|null;unsub:(()=>void)|null;}
    const States=new WeakMap<HTMLElement,State>();
    const state=(h:HTMLElement)=>{let s=States.get(h);if(!s){s={canvas:null,mode:'object',enabled:true,backfaces:'exclude',faceAngle:1,selected:new Map(),cleanup:null,overlay:null,down:null,unsub:null};States.set(h,s);}return s;};

    const WindowModes:[Mode,string][]=[['object','Object'],['face','Faces'],['polygon','Triangles'],['edge','Edges'],['vertex','Points']];
    type WindowTopology={edges:Array<[number,number]>;faces:number[][];vertices:number;indices:number;angle:number};
    type WindowRow={root:HTMLDetailsElement;label:HTMLButtonElement;geometry:Geometry;vertices:number;indices:number};
    interface WindowState{panel:HTMLElement|null;tree:HTMLElement|null;status:HTMLElement|null;rows:Map<Mesh,WindowRow>;topology:WeakMap<Geometry,WindowTopology>;elapsed:number;}
    const Windows=new WeakMap<HTMLElement,WindowState>();
    const windowState=(h:HTMLElement):WindowState=>{let s=Windows.get(h);if(!s){s={panel:null,tree:null,status:null,rows:new Map(),topology:new WeakMap(),elapsed:0};Windows.set(h,s);}return s;};
    const windowOperation=(e:MouseEvent):Operation=>e.ctrlKey||e.metaKey?'toggle':e.shiftKey?'add':'replace';

    @Component('arianna-selection-3d',{}, {Shadow:false,Attributes:['mode','enabled','backfaces','face-angle'],Properties:['canvas','selection']})
    export class Selection3D extends HTMLElement
    {
        public template=html``;
        constructor(options:Options={}){super();const s=state(this);if(options.mode)s.mode=options.mode;if(options.enabled!==undefined)s.enabled=options.enabled;if(options.backfaces)s.backfaces=options.backfaces;if(options.faceAngle!==undefined)s.faceAngle=options.faceAngle;if(options.canvas)this.attach(options.canvas);}
        public onCreated():void{this.style.display='none';}
        public onUnmount():void{this.detach();}
        public get mode():Mode{return state(this).mode;}
        public set mode(value:Mode){this.setMode(value);}
        public get canvas():CanvasTarget|null{return state(this).canvas;}
        public set canvas(value:CanvasTarget|null){value?this.attach(value):this.detach();}
        public get selection():Result{return this.result();}
        public setMode(mode:Mode):this{if(!['vertex','edge','polygon','face','object'].includes(mode))throw new TypeError('Invalid Selection3D mode');state(this).mode=mode;this.setAttribute('mode',mode);this.clear();this.dispatchEvent(new CustomEvent('arianna:selection-3d-mode',{bubbles:true,composed:true,detail:{mode,source:this}}));return this;}
        public attach(canvas:CanvasTarget):this
        {
            this.detach();const s=state(this),surface=canvas.selectionSurface;s.canvas=canvas;surface.dataset.selection3dActive='true';
            const overlay=document.createElement('canvas');overlay.dataset.selection3d='';overlay.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3';canvas.appendChild(overlay);s.overlay=overlay;
            const down=(e:PointerEvent)=>{if(!s.enabled||e.button!==0)return;s.down={x:e.clientX,y:e.clientY};};
            const up=(e:PointerEvent)=>{if(!s.enabled||!s.down)return;const d=Math.hypot(e.clientX-s.down.x,e.clientY-s.down.y);s.down=null;if(d<=4)this.selectAt(e.clientX,e.clientY,e.altKey?'subtract':e.ctrlKey||e.metaKey?'toggle':e.shiftKey?'add':'replace');};
            const rectangle=(e:Event)=>{const detail=(e as CustomEvent<SelectionRectangleDetail>).detail;if(detail?.mode==='3d')this.selectRectangle(detail);};
            surface.addEventListener('pointerdown',down);surface.addEventListener('pointerup',up);canvas.addEventListener('arianna:selection-rectangle',rectangle);
            s.cleanup=()=>{delete surface.dataset.selection3dActive;surface.removeEventListener('pointerdown',down);surface.removeEventListener('pointerup',up);canvas.removeEventListener('arianna:selection-rectangle',rectangle);};
            s.unsub=canvas.onFrame?.((dt)=>{this.draw();const ui=Windows.get(this);if(ui?.panel?.isConnected){ui.elapsed+=dt;if(ui.elapsed>=.5){ui.elapsed=0;this.refreshWindow();}}})??null;this.draw();return this;
        }
        public detach():this{const s=state(this);s.cleanup?.();s.unsub?.();s.overlay?.remove();s.cleanup=null;s.unsub=null;s.overlay=null;s.canvas=null;s.down=null;const ui=Windows.get(this);if(ui){ui.panel?.remove();ui.rows.clear();ui.tree?.replaceChildren();ui.topology=new WeakMap();ui.elapsed=0;}return this;}
        public clear():this{state(this).selected.clear();this.changed();return this;}
        public selectAt(clientX:number,clientY:number,operation:Operation='replace'):Result
        {
            const s=state(this),canvas=s.canvas;if(!canvas)return this.result();const hit=this.pick(canvas.rayFromClient(clientX,clientY));if(!hit){if(operation==='replace')this.clear();return this.result();}this.apply([this.item(hit)],operation);return this.result();
        }
        public selectRectangle(detail:SelectionRectangleDetail):Result
        {
            const s=state(this),canvas=s.canvas;if(!canvas)return this.result();const rect=detail.rect,items:Item[]=[];
            for(const mesh of canvas.getMeshes())
            {
                if(!mesh.visible)continue;const g=mesh.geometry,inside=(i:number)=>{const p=canvas.projectWorld(canvas.localToWorld(g.vertices[i],mesh));return p.visible&&p.x>=rect.left&&p.x<=rect.right&&p.y>=rect.top&&p.y<=rect.bottom;};
                if(s.mode==='object'){if(g.vertices.some((_,i)=>inside(i)))items.push(this.objectItem(mesh));continue;}
                if(s.mode==='vertex'){g.vertices.forEach((_,i)=>{if(inside(i))items.push(this.vertexItem(mesh,i));});continue;}
                for(let t=0;t<g.indices.length/3;t++){const ids=g.indices.slice(t*3,t*3+3),flags=ids.map(inside),accepted=detail.rule==='contain'?flags.every(Boolean):flags.some(Boolean);if(!accepted)continue;const hit={mesh,triangle:t,indices:ids as [number,number,number],point:this.center(mesh,ids),distance:0,bary:[1/3,1/3,1/3] as [number,number,number]};items.push(this.item(hit));}
            }
            this.apply(this.unique(items),detail.operation);return this.result();
        }
        /** Optional UI: creation is explicit and never runs during Canvas3D startup. */
        public get Window():HTMLElement {
            const ui=windowState(this);if(ui.panel)return ui.panel;
            const panel=document.createElement('section');panel.className='Selection3DWindow';panel.setAttribute('role','region');panel.setAttribute('aria-label','Selection scene graph');
            panel.style.cssText='position:absolute;left:12px;top:56px;width:248px;height:320px;min-width:190px;min-height:130px;max-width:calc(100% - 24px);max-height:calc(100% - 68px);z-index:35;display:flex;flex-direction:column;resize:both;overflow:hidden;box-sizing:border-box;border:1px solid #111417;border-radius:7px;background:#292d31;color:#e5e8ea;box-shadow:0 8px 25px #0005;font:11px/1.5 system-ui';
            const style=document.createElement('style');style.textContent=`
.Selection3DWindow *{box-sizing:border-box}.Selection3DWindow header{display:flex;align-items:center;gap:5px;height:32px;min-height:32px;padding:4px 6px 4px 10px;background:linear-gradient(180deg,#3a3f44,#2b3034);cursor:move;touch-action:none;user-select:none}.Selection3DWindow header strong{margin-right:auto}.Selection3DWindow button{appearance:none;cursor:pointer;font:600 10px/1.4 system-ui;border:1px solid #171a1d;border-radius:4px;background:linear-gradient(180deg,#42484d,#2e3337);color:inherit;min-height:24px;padding:3px 6px;box-shadow:inset 0 1px 0 #ffffff18}.Selection3DWindow button:hover{border-color:#e40c88}.Selection3DWindow button[data-selected="true"]{background:linear-gradient(180deg,#ff4dad,#e40c88,#b90769)!important;color:#fff!important;border-color:#e40c88}.Selection3DWindow button:disabled{opacity:.45;cursor:default}.Selection3DWindow .Selection3DWindow-Modes{display:flex;gap:3px;flex-wrap:wrap;padding:6px;border-bottom:1px solid #0002}.Selection3DWindow .Selection3DWindow-Tree{flex:1;min-height:0;overflow:auto;padding:5px 8px}.Selection3DWindow details details{margin-left:12px}.Selection3DWindow summary{cursor:pointer;white-space:nowrap}.Selection3DWindow .Selection3DWindow-Row{border-color:transparent;background:transparent;box-shadow:none;text-align:left;max-width:100%;overflow:hidden;text-overflow:ellipsis;vertical-align:middle}.Selection3DWindow details details .Selection3DWindow-Row{display:block;width:100%}.Selection3DWindow footer{font-size:10px;padding:4px 8px;border-top:1px solid #0002}.Selection3DWindow[data-minimized="true"]{height:32px!important;min-height:32px!important;resize:none}.Selection3DWindow[data-minimized="true"]>nav,.Selection3DWindow[data-minimized="true"]>div,.Selection3DWindow[data-minimized="true"]>footer{display:none}.Selection3DWindow[data-theme="light"]{background:#eef0f2!important;color:#25292d!important;border-color:#b8bdc2!important}.Selection3DWindow[data-theme="light"] header{background:linear-gradient(180deg,#f9fbfc,#e0e4e7)}.Selection3DWindow[data-theme="light"] button{background:linear-gradient(180deg,#f9fbfc,#e0e4e7);border-color:#b8bdc2}.Selection3DWindow[data-theme="light"] .Selection3DWindow-Row{background:transparent;border-color:transparent}
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
                if(!row){const root=document.createElement('details'),summary=document.createElement('summary'),label=document.createElement('button');label.type='button';label.className='Selection3DWindow-Row';label.onclick=e=>{e.preventDefault();this.select(mesh,'object',0,windowOperation(e));};summary.append(label);root.append(summary);ui.tree.append(root);row={root,label,geometry:g,vertices:g.vertices.length,indices:g.indices.length};ui.rows.set(mesh,row);
                    let loaded=false;root.addEventListener('toggle',()=>{if(!root.open||loaded)return;loaded=true;
                        for(const [mode,title]of WindowModes.filter(([mode])=>mode!=='object')){const group=document.createElement('details'),heading=document.createElement('summary');heading.textContent=title;group.append(heading);root.append(group);let offset=0,built=false;
                            group.addEventListener('toggle',()=>{if(!group.open||built)return;built=true;
                                const count=this.elementCount(mesh,mode);heading.textContent=`${title} (${count})`;
                                const more=document.createElement('button');more.type='button';more.textContent='Next 100';
                                const page=()=>{more.remove();for(let i=offset;i<Math.min(offset+100,count);i++){const index=i,b=document.createElement('button');b.type='button';b.className='Selection3DWindow-Row';b.textContent=`${title} ${index}`;const item=this.windowItem(mesh,mode,index);b.dataset.key=item.key;b.onclick=e=>this.select(mesh,mode,index,windowOperation(e));group.append(b);}offset+=100;if(offset<count)group.append(more);this.syncWindowSelection();};more.onclick=page;page();
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
            const count=this.elementCount(mesh,mode);if(!Number.isInteger(index)||index<0||index>=count)throw new RangeError('Selection3D element index out of range');
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
            const text=`${selected.items.length} selected · ${selected.mode}`;if(ui.status&&ui.status.textContent!==text)ui.status.textContent=text;
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
export default Selection3D.Selection3D;
export type Selection3DMode=Selection3D.Mode;
export type Selection3DResult=Selection3D.Result;
export type Selection3DItem=Selection3D.Item;
