/** Granular 2D snap policy. It owns no canvas and renders nothing. */
import { Component, Templates } from '../../../../core/index.ts';
const html=Templates.Template.Html;
export namespace Snappable2D
{
    export interface Vec2{x:number;y:number;}
    export type TargetType='grid'|'point'|'vertex'|'edge'|'midpoint'|'axis';
    export interface Candidate{point:Vec2;type:TargetType;targetId?:string|number;distance?:number;}
    export interface Provider{nearest(point:Vec2):{point:Vec2;distance:number;targetId?:string|number}|null;}
    export interface Options{enabled?:boolean;distance?:number;distanceUnit?:'screen-px'|'world';targets?:Partial<Record<TargetType,boolean>>;priority?:TargetType[];grid?:Provider;}
    export interface Result extends Candidate{snapped:boolean;source?:unknown;}
    const Defaults={enabled:true,distance:8,distanceUnit:'screen-px' as const,targets:{grid:true,point:true,vertex:true,edge:true,midpoint:true,axis:true},priority:['vertex','point','midpoint','edge','axis','grid'] as TargetType[]};
    const States=new WeakMap<HTMLElement,{options:typeof Defaults;providers:Map<TargetType,Set<Provider>>}>();
    const state=(h:HTMLElement)=>{let s=States.get(h);if(!s){s={options:{...Defaults,targets:{...Defaults.targets},priority:[...Defaults.priority]},providers:new Map()};States.set(h,s);}return s;};
    @Component('arianna-snappable-2d',{}, {Shadow:false,Properties:['options']})
    export class Snappable2D extends HTMLElement
    {
        public template=html``;
        constructor(options:Options={}){super();const{grid,...policy}=options;this.options=policy;if(grid)this.addProvider('grid',grid);}
        public onCreated():void{this.style.display='none';}
        public get options():Options{const o=state(this).options;return{...o,targets:{...o.targets},priority:[...o.priority]};}
        public set options(v:Options){const{grid,...policy}=v,o=state(this).options;Object.assign(o,policy);if(v.targets)o.targets={...o.targets,...v.targets};if(v.priority)o.priority=[...v.priority];o.distance=Math.max(0,Number(o.distance)||0);if(grid)this.addProvider('grid',grid);}
        public addProvider(type:TargetType,provider:Provider):this{const p=state(this).providers;let set=p.get(type);if(!set)p.set(type,set=new Set());set.add(provider);return this;}
        public removeProvider(type:TargetType,provider:Provider):this{state(this).providers.get(type)?.delete(provider);return this;}
        public snap(point:Vec2,zoom=1):Result
        {
            const s=state(this),o=s.options;if(!o.enabled)return{point:{...point},type:'point',distance:0,snapped:false};
            const limit=o.distanceUnit==='screen-px'?o.distance/Math.max(.0001,zoom):o.distance;
            let best:{candidate:Candidate;source:Provider;rank:number}|null=null;
            for(const [type,providers] of s.providers)if(o.targets[type]!==false)for(const provider of providers)
            {
                const hit=provider.nearest(point);if(!hit)continue;const distance=hit.distance??Math.hypot(hit.point.x-point.x,hit.point.y-point.y);if(distance>limit)continue;
                const rank=o.priority.indexOf(type),candidate={...hit,type,distance};
                if(!best||distance<best.candidate.distance!-.0001||(Math.abs(distance-best.candidate.distance!)<.0001&&rank<best.rank))best={candidate,source:provider,rank};
            }
            return best?{...best.candidate,snapped:true,source:best.source}:{point:{...point},type:'point',distance:0,snapped:false};
        }
    }
}
export default Snappable2D.Snappable2D;
export type Snappable2DOptions=Snappable2D.Options;
export type SnapResult2D=Snappable2D.Result;
