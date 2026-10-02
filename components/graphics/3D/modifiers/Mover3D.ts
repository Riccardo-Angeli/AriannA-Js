/** Mesh translation modifier with an integrated snap policy and XYZ gizmo. */
import { Modifier3D as Base } from './Base.ts';

declare const Component:any;
declare const Templates:any;
const html=Templates.Template.Html;

export namespace Mover3D
{
    export interface Vec3{x:number;y:number;z:number;}
    export type Axis='x'|'y'|'z'|'xy'|'xz'|'yz'|'xyz'|'all';
    export type TargetType='grid'|'vertex'|'edge'|'midpoint'|'faceCenter'|'axis'|'angle';
    export interface SnapProvider{nearest(point:Vec3):{point:Vec3;distance:number;targetId?:string|number}|null;}
    export interface SnapResult{point:Vec3;type:TargetType;targetId?:string|number;distance:number;snapped:boolean;source?:unknown;}
    export interface Options
    {
        x?:number;y?:number;z?:number;axis?:Axis;
        snapX?:number;snapY?:number;snapZ?:number;disabled?:boolean;
        snapEnabled?:boolean;snapDistance?:number;distanceUnit?:'screen-px'|'world';angleStep?:number;
        targets?:Partial<Record<TargetType,boolean>>;priority?:TargetType[];grid?:SnapProvider;
    }
    export type Callback=(mesh:Base.Interfaces.MeshLike,position:Base.Interfaces.Vec3Like)=>void;

    const DefaultTargets:Record<TargetType,boolean>={grid:true,vertex:true,edge:true,midpoint:true,faceCenter:true,axis:true,angle:true};
    const DefaultPriority:TargetType[]=['vertex','midpoint','edge','faceCenter','axis','grid','angle'];

    export class Mover3D extends Base.Modifier3D
    {
        public axis:Axis='all';public snapX=0;public snapY=0;public snapZ=0;
        public worldPerPixel=1;public snapEnabled=true;public snapDistance=8;public distanceUnit:'screen-px'|'world'='screen-px';public angleStep=15;
        public targets:Record<TargetType,boolean>={...DefaultTargets};public priority:TargetType[]=[...DefaultPriority];
        private position:Partial<Base.Interfaces.Vec3Like>;private callbacks=new Set<Callback>();
        private providers=new Map<TargetType,Set<SnapProvider>>();

        constructor(mesh:Base.Interfaces.MeshLike=Base.Modifier3D.UNBOUND_MESH,options:Options={})
        {
            super(mesh);this.position={x:options.x,y:options.y,z:options.z};this.axis=options.axis??'all';
            this.snapX=Math.max(0,options.snapX??0);this.snapY=Math.max(0,options.snapY??0);this.snapZ=Math.max(0,options.snapZ??0);
            this.snapEnabled=options.snapEnabled??true;this.snapDistance=Math.max(0,options.snapDistance??8);this.distanceUnit=options.distanceUnit??'screen-px';this.angleStep=Math.max(.001,options.angleStep??15);
            this.targets={...DefaultTargets,...options.targets};this.priority=options.priority?[...options.priority]:[...DefaultPriority];
            if(options.grid)this.addSnapProvider('grid',options.grid);if(options.disabled)this.disable();
        }
        private allows(axis:'x'|'y'|'z'):boolean{return this.axis==='all'||this.axis==='xyz'||this.axis===axis||this.axis.includes(axis);}
        private quantize(value:number,step:number):number{return step>0?Math.round(value/step)*step:value;}
        public addSnapProvider(type:TargetType,provider:SnapProvider):this{let set=this.providers.get(type);if(!set)this.providers.set(type,set=new Set());set.add(provider);return this;}
        public removeSnapProvider(type:TargetType,provider:SnapProvider):this{this.providers.get(type)?.delete(provider);return this;}
        public snapPoint(point:Vec3,worldPerPixel=1):SnapResult
        {
            if(!this.snapEnabled)return{point:{...point},type:'grid',distance:0,snapped:false};
            const limit=this.distanceUnit==='screen-px'?this.snapDistance*Math.max(.000001,worldPerPixel):this.snapDistance;
            let best:{result:SnapResult;rank:number}|null=null;
            for(const [type,providers] of this.providers)if(this.targets[type]!==false)for(const provider of providers)
            {
                let hit=provider.nearest(point);if(!hit)continue;
                // A grid snaps within its plane; preserve distance above/below it.
                const plane=(provider as SnapProvider&{options?:{origin:Vec3;axisU:Vec3;axisV:Vec3}}).options;
                if(type==='grid'&&plane?.origin&&plane.axisU&&plane.axisV){
                    const u=plane.axisU,v=plane.axisV,n={x:u.y*v.z-u.z*v.y,y:u.z*v.x-u.x*v.z,z:u.x*v.y-u.y*v.x},l=Math.hypot(n.x,n.y,n.z)||1;
                    const height=((point.x-plane.origin.x)*n.x+(point.y-plane.origin.y)*n.y+(point.z-plane.origin.z)*n.z)/(l*l),p={x:hit.point.x+n.x*height,y:hit.point.y+n.y*height,z:hit.point.z+n.z*height};
                    hit={...hit,point:p,distance:Math.hypot(p.x-point.x,p.y-point.y,p.z-point.z)};
                }
                if(hit.distance>limit)continue;
                const rank=this.priority.indexOf(type),result:SnapResult={...hit,type,distance:hit.distance,snapped:true,source:provider};
                if(!best||hit.distance<best.result.distance-.0001||(Math.abs(hit.distance-best.result.distance)<.0001&&rank<best.rank))best={result,rank};
            }
            return best?.result??{point:{...point},type:'grid',distance:0,snapped:false};
        }
        public snapAngle(degrees:number):number{return!this.snapEnabled||this.targets.angle===false?degrees:Math.round(degrees/this.angleStep)*this.angleStep;}
        public setPosition(x:number,y:number,z:number,worldPerPixel=1):this{this.position=this.snapPoint({x,y,z},worldPerPixel).point;return this.apply();}
        public moveBy(x=0,y=0,z=0,worldPerPixel=1):this{return this.setPosition(this.mesh.position.x+x,this.mesh.position.y+y,this.mesh.position.z+z,worldPerPixel);}
        public onMove(callback:Callback):this{this.callbacks.add(callback);return this;}
        public apply():this
        {
            if(!this.enabled)return this;const p=this.mesh.position,requested={x:this.position.x??p.x,y:this.position.y??p.y,z:this.position.z??p.z},snapped=this.snapPoint(requested,this.worldPerPixel).point;
            if(this.allows('x'))p.x=this.quantize(snapped.x,this.snapX);
            if(this.allows('y'))p.y=this.quantize(snapped.y,this.snapY);
            if(this.allows('z'))p.z=this.quantize(snapped.z,this.snapZ);
            this.mesh.updateMatrix?.();for(const callback of this.callbacks)callback(this.mesh,{...p});return this;
        }
    }

    type GizmoViewport=Base.Interfaces.Viewport3DLike&HTMLElement&{
        localToWorld(point:Vec3,mesh:Base.Interfaces.MeshLike):Vec3;
        projectWorld(point:Vec3):{x:number;y:number;z:number;visible:boolean};selectionSurface:HTMLCanvasElement;
    };
    type ScreenPoint={x:number;y:number;visible:boolean};type AxisName='x'|'y'|'z';

    @Component('arianna-mover-3d',{}, {Shadow:false,Attributes:['viewport','for','enabled','disabled','x','y','z','axis','snap-x','snap-y','snap-z','snap-enabled','snap-distance','snap-unit','angle-step','gizmo-size']})
    export class Mover3DElement extends Base.Modifier3DElement
    {
        public template=html``;private gizmo:SVGSVGElement|null=null;private groups?:Map<AxisName,SVGGElement>;
        private providers?:Map<TargetType,Set<SnapProvider>>;
        private drag:null|{axis:AxisName;pointerId:number;startClient:{x:number;y:number};startWorld:Vec3;screen:{x:number;y:number};worldLength:number}=null;

        public onConnected():void{super.onConnected();queueMicrotask(()=>this.ensureGizmo());}
        protected needsFrameUpdate():boolean{return true;}
        protected createModifier(mesh:Base.Interfaces.MeshLike):Base.Modifier3D
        {
            const number=(name:string,fallback=0)=>{const raw=this.getAttribute(name),value=raw===null?NaN:Number(raw);return Number.isFinite(value)?value:fallback;};
            const mover=new Mover3D(mesh,{x:number('x',mesh.position.x),y:number('y',mesh.position.y),z:number('z',mesh.position.z),axis:(this.getAttribute('axis')??'all') as Axis,snapX:number('snap-x'),snapY:number('snap-y'),snapZ:number('snap-z'),snapEnabled:this.getAttribute('snap-enabled')!=='false',snapDistance:number('snap-distance',8),distanceUnit:this.getAttribute('snap-unit')==='world'?'world':'screen-px',angleStep:number('angle-step',15)});
            const viewport=this.viewport as GizmoViewport|null;
            if(viewport?.projectWorld){const a=viewport.projectWorld(mesh.position),lengths=(['x','y','z'] as const).map(axis=>{const end={...mesh.position};end[axis]+=1;const b=viewport.projectWorld(end);return Math.hypot(b.x-a.x,b.y-a.y);});mover.worldPerPixel=1/Math.max(1,...lengths);}
            for(const [type,providers] of this.ProviderMap())for(const provider of providers)mover.addSnapProvider(type,provider);return mover;
        }
        private ProviderMap():Map<TargetType,Set<SnapProvider>>{return this.providers??=new Map();}
        private GroupMap():Map<AxisName,SVGGElement>{return this.groups??=new Map();}
        public addSnapProvider(type:TargetType,provider:SnapProvider):this{const providers=this.ProviderMap();let set=providers.get(type);if(!set)providers.set(type,set=new Set());set.add(provider);(this.getModifier() as Mover3D|null)?.addSnapProvider(type,provider);return this;}
        public removeSnapProvider(type:TargetType,provider:SnapProvider):this{this.ProviderMap().get(type)?.delete(provider);(this.getModifier() as Mover3D|null)?.removeSnapProvider(type,provider);return this;}
        public snap(point:Vec3,worldPerPixel=1):SnapResult{return(this.getModifier() as Mover3D|null)?.snapPoint(point,worldPerPixel)??{point:{...point},type:'grid',distance:0,snapped:false};}
        public snapAngle(degrees:number):number{return(this.getModifier() as Mover3D|null)?.snapAngle(degrees)??degrees;}
        protected onFrame(dt:number):void{super.onFrame(dt);this.drawGizmo();}

        private allows(axis:AxisName):boolean{const mode=this.getAttribute('axis')??'all';return mode==='all'||mode==='xyz'||mode===axis||mode.includes(axis);}
        private ensureGizmo():void
        {
            if(this.gizmo?.isConnected)return;const viewport=this.viewport as GizmoViewport|null;if(!viewport?.projectWorld)return;
            let surface:HTMLCanvasElement|null=null;try{surface=viewport.selectionSurface;}catch{return;}if(!surface)return;
            const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('aria-label','Mover3D XYZ gizmo');svg.style.cssText='position:absolute;z-index:20;overflow:visible;pointer-events:none;touch-action:none;user-select:none';
            const colors:Record<AxisName,string>={x:'#ef4444',y:'#65c466',z:'#3b82f6'};
            for(const axis of ['x','y','z'] as AxisName[])
            {
                const group=document.createElementNS(ns,'g'),line=document.createElementNS(ns,'line'),arrow=document.createElementNS(ns,'polygon'),label=document.createElementNS(ns,'text');
                group.dataset.axis=axis;group.style.pointerEvents='all';group.style.cursor='grab';line.setAttribute('stroke',colors[axis]);line.setAttribute('stroke-width','4');line.setAttribute('stroke-linecap','round');line.style.pointerEvents='stroke';
                arrow.setAttribute('fill',colors[axis]);label.setAttribute('fill',colors[axis]);label.setAttribute('font-size','12');label.setAttribute('font-weight','800');label.setAttribute('font-family','system-ui,sans-serif');label.textContent=axis.toUpperCase();
                group.append(line,arrow,label);group.addEventListener('pointerdown',event=>this.beginDrag(axis,event));svg.appendChild(group);this.GroupMap().set(axis,group);
            }
            viewport.appendChild(svg);this.gizmo=svg;this.drawGizmo();
        }
        public override get selection():Base.Interfaces.SelectionLike|null{return super.selection;}
        public override set selection(value:Base.Interfaces.SelectionLike|null)
        {
            if(this.target&&value?.items.some(item=>item.mesh===this.target)){
                this.captureTarget();for(const axis of ['x','y','z'] as const)this.setAttribute(axis,String(this.target.position[axis]));
            }
            super.selection=value;
        }
        private projected(axis:AxisName):{origin:ScreenPoint;end:ScreenPoint;worldLength:number}|null
        {
            const viewport=this.viewport as GizmoViewport|null,target=this.target;if(!viewport||!target)return null;
            const worldLength=Math.max(.1,Number(this.getAttribute('gizmo-size'))||1.35),origin={...target.position};
            const indices=this.selection?.mode!=='object'?Array.from(new Set(this.selection?.items.filter(item=>item.mesh===target).flatMap(item=>item.vertexIndices)??[])):[];
            if(indices.length&&viewport.localToWorld){const points=indices.map(i=>target.geometry.vertices[i]).filter(Boolean).map(p=>viewport.localToWorld(p,target));if(points.length){origin.x=points.reduce((n,p)=>n+p.x,0)/points.length;origin.y=points.reduce((n,p)=>n+p.y,0)/points.length;origin.z=points.reduce((n,p)=>n+p.z,0)/points.length;}}
            const end={...origin};end[axis]+=worldLength;
            return{origin:viewport.projectWorld(origin),end:viewport.projectWorld(end),worldLength};
        }
        private drawGizmo():void
        {
            this.ensureGizmo();const viewport=this.viewport as GizmoViewport|null,svg=this.gizmo;if(!viewport||!svg||!this.target)return;
            svg.style.display=this.enabled&&this.target.visible&&this.getAttribute('gizmo-visible')!=='false'?'':'none';if(svg.style.display==='none')return;
            let surface:HTMLCanvasElement;try{surface=viewport.selectionSurface;}catch{return;}svg.style.left=`${surface.offsetLeft}px`;svg.style.top=`${surface.offsetTop}px`;svg.setAttribute('width',String(surface.clientWidth));svg.setAttribute('height',String(surface.clientHeight));svg.setAttribute('viewBox',`0 0 ${Math.max(1,surface.clientWidth)} ${Math.max(1,surface.clientHeight)}`);
            for(const axis of ['x','y','z'] as AxisName[])
            {
                const group=this.GroupMap().get(axis),projection=this.projected(axis);if(!group||!projection)continue;const{origin,end}=projection,visible=origin.visible&&end.visible&&this.allows(axis);group.style.display=visible?'':'none';if(!visible)continue;
                const dx=end.x-origin.x,dy=end.y-origin.y,length=Math.hypot(dx,dy)||1,ux=dx/length,uy=dy/length,px=-uy,py=ux,tipX=end.x,tipY=end.y,baseX=tipX-ux*13,baseY=tipY-uy*13;
                const line=group.children[0] as SVGLineElement,arrow=group.children[1] as SVGPolygonElement,label=group.children[2] as SVGTextElement;
                line.setAttribute('x1',String(origin.x));line.setAttribute('y1',String(origin.y));line.setAttribute('x2',String(baseX+ux*2));line.setAttribute('y2',String(baseY+uy*2));
                arrow.setAttribute('points',`${tipX},${tipY} ${baseX+px*6},${baseY+py*6} ${baseX-px*6},${baseY-py*6}`);label.setAttribute('x',String(tipX+ux*8+px*3));label.setAttribute('y',String(tipY+uy*8+py*3+4));
            }
        }
        private beginDrag(axis:AxisName,event:PointerEvent):void
        {
            if(event.button!==0||!this.target||!this.enabled)return;const projection=this.projected(axis);if(!projection)return;
            const dx=projection.end.x-projection.origin.x,dy=projection.end.y-projection.origin.y,length=Math.hypot(dx,dy);if(length<2)return;
            event.preventDefault();event.stopPropagation();const group=event.currentTarget as SVGGElement;group.style.cursor='grabbing';group.setPointerCapture(event.pointerId);
            this.drag={axis,pointerId:event.pointerId,startClient:{x:event.clientX,y:event.clientY},startWorld:{...this.target.position},screen:{x:dx/length,y:dy/length},worldLength:projection.worldLength};
            const move=(e:PointerEvent)=>this.moveDrag(e),end=(e:PointerEvent)=>{if(e.pointerId!==this.drag?.pointerId)return;group.style.cursor='grab';try{group.releasePointerCapture(e.pointerId);}catch{}group.removeEventListener('pointermove',move);group.removeEventListener('pointerup',end);group.removeEventListener('pointercancel',end);this.drag=null;};
            group.addEventListener('pointermove',move);group.addEventListener('pointerup',end);group.addEventListener('pointercancel',end);
        }
        private moveDrag(event:PointerEvent):void
        {
            const drag=this.drag;if(!drag||event.pointerId!==drag.pointerId)return;event.preventDefault();event.stopPropagation();const projection=this.projected(drag.axis);if(!projection)return;
            const pixels=Math.max(1,Math.hypot(projection.end.x-projection.origin.x,projection.end.y-projection.origin.y)),dx=event.clientX-drag.startClient.x,dy=event.clientY-drag.startClient.y,delta=(dx*drag.screen.x+dy*drag.screen.y)/pixels*drag.worldLength;
            this.setAttribute(drag.axis,String(drag.startWorld[drag.axis]+delta));
        }
        public onUnmount():void{this.gizmo?.remove();this.gizmo=null;this.GroupMap().clear();this.drag=null;super.onUnmount();}
    }
}

export const Mover3DElement=Mover3D.Mover3DElement;
export type Mover3DOptions=Mover3D.Options;
export type SnapProvider3D=Mover3D.SnapProvider;
export type SnapResult3D=Mover3D.SnapResult;
export type SnapTarget3D=Mover3D.TargetType;
export default Mover3D.Mover3D;
