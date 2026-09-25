/** Granular 3D snap policy, independent from Grid3D and Selection3D. */
import { Component, Templates } from '../../../../core/index.ts';
const html=Templates.Template.Html;
export namespace Snappable3D
{
    export interface Vec3{x:number;y:number;z:number;}
    export type TargetType='grid'|'vertex'|'edge'|'midpoint'|'faceCenter'|'axis'|'angle';
    export interface Provider{nearest(point:Vec3):{point:Vec3;distance:number;targetId?:string|number}|null;}
    export interface Options{enabled?:boolean;distance?:number;distanceUnit?:'screen-px'|'world';angleStep?:number;targets?:Partial<Record<TargetType,boolean>>;priority?:TargetType[];grid?:Provider;}
    export interface Result{point:Vec3;type:TargetType;targetId?:string|number;distance:number;snapped:boolean;source?:unknown;}
    const Defaults={enabled:true,distance:8,distanceUnit:'screen-px' as const,angleStep:15,targets:{grid:true,vertex:true,edge:true,midpoint:true,faceCenter:true,axis:true,angle:true},priority:['vertex','midpoint','edge','faceCenter','axis','grid','angle'] as TargetType[]};
    const States=new WeakMap<HTMLElement,{options:typeof Defaults;providers:Map<TargetType,Set<Provider>>}>(),state=(h:HTMLElement)=>{let s=States.get(h);if(!s){s={options:{...Defaults,targets:{...Defaults.targets},priority:[...Defaults.priority]},providers:new Map()};States.set(h,s);}return s;};
    @Component('arianna-snappable-3d',{}, {Shadow:false,Properties:['options']})
    export class Snappable3D extends HTMLElement
    {
        public template=html``;
        constructor(options:Options={}){super();const{grid,...policy}=options;this.options=policy;if(grid)this.addProvider('grid',grid);}
        public onCreated():void{this.style.display='none';}
        public get options():Options{const o=state(this).options;return{...o,targets:{...o.targets},priority:[...o.priority]};}
        public set options(v:Options){const{grid,...policy}=v,o=state(this).options;Object.assign(o,policy);if(v.targets)o.targets={...o.targets,...v.targets};if(v.priority)o.priority=[...v.priority];o.distance=Math.max(0,Number(o.distance)||0);o.angleStep=Math.max(.001,Number(o.angleStep)||15);if(grid)this.addProvider('grid',grid);}
        public addProvider(type:TargetType,provider:Provider):this{const p=state(this).providers;let set=p.get(type);if(!set)p.set(type,set=new Set());set.add(provider);return this;}
        public removeProvider(type:TargetType,provider:Provider):this{state(this).providers.get(type)?.delete(provider);return this;}
        public snap(point:Vec3,worldPerPixel=1):Result
        {
            const s=state(this),o=s.options;if(!o.enabled)return{point:{...point},type:'grid',distance:0,snapped:false};const limit=o.distanceUnit==='screen-px'?o.distance*Math.max(.000001,worldPerPixel):o.distance;let best:{result:Result;rank:number}|null=null;
            for(const [type,providers] of s.providers)if(o.targets[type]!==false)for(const provider of providers){const h=provider.nearest(point);if(!h||h.distance>limit)continue;const rank=o.priority.indexOf(type),result={...h,type,distance:h.distance,snapped:true,source:provider};if(!best||h.distance<best.result.distance-.0001||(Math.abs(h.distance-best.result.distance)<.0001&&rank<best.rank))best={result,rank};}
            return best?.result??{point:{...point},type:'grid',distance:0,snapped:false};
        }
        public snapAngle(degrees:number):number{const o=state(this).options;return!o.enabled||o.targets.angle===false?degrees:Math.round(degrees/o.angleStep)*o.angleStep;}
    }
}
export default Snappable3D.Snappable3D;
export type Snappable3DOptions=Snappable3D.Options;
export type SnapResult3D=Snappable3D.Result;
