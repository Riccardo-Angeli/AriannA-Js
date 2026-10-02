/** Generic editable automation lanes shared by audio and video timelines. */
import { Component, Css, Templates } from '../../core/index.ts';
const html=Templates.Template.Html;

export type AutomationCurve='linear'|'bezier'|'step';
export interface AutomationTangent{time:number;value:number;}
export interface AutomationPoint{id?:string;time:number;value:number;curve?:AutomationCurve;in?:AutomationTangent;out?:AutomationTangent;}
export interface AutomationBinding
{
    target?:unknown;
    path?:string;
    set?:(value:number,time:number,lane:AutomationLane)=>void;
}
export interface AutomationLane
{
    id:string;label?:string;parameter?:string;color?:string;min:number;max:number;defaultValue?:number;
    enabled?:boolean;visible?:boolean;points:AutomationPoint[];binding?:AutomationBinding;
}

const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
const clonePoint=(point:AutomationPoint):AutomationPoint=>({...point,in:point.in?{...point.in}:undefined,out:point.out?{...point.out}:undefined});
const cloneLane=(lane:AutomationLane):AutomationLane=>({...lane,points:lane.points.map(clonePoint),binding:lane.binding?{...lane.binding}:undefined});

export class AutomationLaneCollection extends Map<string,AutomationLane>
{
    constructor(lanes:Iterable<AutomationLane>=[]){super();this.replace(lanes);}
    public replace(lanes:Iterable<AutomationLane>):this{this.clear();for(const lane of lanes)this.upsert(lane);return this;}
    public upsert(lane:AutomationLane):AutomationLane
    {
        if(!lane?.id?.trim())throw new TypeError('[Automation] lane.id is required');
        const value=cloneLane({...lane,id:lane.id.trim(),min:Number(lane.min),max:Number(lane.max)});
        if(!Number.isFinite(value.min)||!Number.isFinite(value.max)||value.max<=value.min)throw new RangeError(`[Automation] invalid range for "${value.id}"`);
        value.points=value.points.map((p,index)=>({...p,id:p.id??`${value.id}-${index}`,time:Math.max(0,Number(p.time)||0),value:clamp(Number(p.value)||0,value.min,value.max),curve:p.curve??'linear'})).sort((a,b)=>a.time-b.time);
        this.set(value.id,value);return value;
    }
    public snapshot():AutomationLane[]{return[...this.values()].map(cloneLane);}
    public setCurve(laneId:string,point:string|number,curve:AutomationCurve):this
    {
        const lane=this.get(laneId),index=typeof point==='number'?point:lane?.points.findIndex(p=>p.id===point)??-1;if(!lane||!lane.points[index])return this;lane.points[index].curve=curve;return this;
    }
    public setTangents(laneId:string,point:string|number,tangents:{in?:AutomationTangent;out?:AutomationTangent}):this
    {
        const lane=this.get(laneId),index=typeof point==='number'?point:lane?.points.findIndex(p=>p.id===point)??-1;if(!lane||!lane.points[index])return this;lane.points[index].in=tangents.in?{...tangents.in}:undefined;lane.points[index].out=tangents.out?{...tangents.out}:undefined;return this;
    }
    public valueAt(id:string,time:number):number
    {
        const lane=this.get(id);if(!lane)return Number.NaN;const points=lane.points;
        if(!points.length)return lane.defaultValue??lane.min;if(time<=points[0].time)return points[0].value;
        const b=points.findIndex(point=>point.time>=time);if(b<0)return points[points.length-1].value;
        const a=points[b-1],next=points[b],span=Math.max(1e-9,next.time-a.time),t=clamp((time-a.time)/span,0,1);
        if(a.curve==='step')return a.value;
        if(a.curve!=='bezier')return a.value+(next.value-a.value)*t;
        const p0=a.value,p1=a.value+(a.out?.value??0),p2=next.value+(next.in?.value??0),p3=next.value,u=1-t;
        return u*u*u*p0+3*u*u*t*p1+3*u*t*t*p2+t*t*t*p3;
    }
    public apply(time:number):this
    {
        for(const lane of this.values())
        {
            if(lane.enabled===false)continue;const value=this.valueAt(lane.id,time),binding=lane.binding;if(!binding||!Number.isFinite(value))continue;
            if(binding.set){binding.set(value,time,lane);continue;}
            let target=binding.target as Record<string,unknown>|null|undefined;const parts=(binding.path??lane.parameter??lane.id).split('.').filter(Boolean);
            for(const key of parts.slice(0,-1))target=target?.[key] as Record<string,unknown>|null|undefined;
            const key=parts.at(-1);const current=key?target?.[key]:target;
            if(current&&typeof current==='object'&&'setValueAtTime' in current)
                (current as AudioParam).setValueAtTime(value,time);
            else if(target&&key)target[key]=value;
        }
        return this;
    }
}

const Runtime=new WeakMap<AutomationOverlay,{collection:AutomationLaneCollection;scale:number;duration:number;snap:number;active:string|null;built:boolean}>();
const state=(host:AutomationOverlay)=>{let s=Runtime.get(host);if(!s){s={collection:new AutomationLaneCollection(),scale:40,duration:16,snap:.01,active:null,built:false};Runtime.set(host,s);}return s;};

export const AutomationStyles=new Css.Stylesheet([
    new Css.Rule('arianna-automation-overlay,.AutomationOverlay',{Bottom:'0',Display:'block',Left:'0',Overflow:'hidden',PointerEvents:'auto',Position:'absolute',Right:'0',Top:'0',ZIndex:'12'}),
    new Css.Rule('.AutomationOverlay-Svg',{Display:'block',Height:'100%',Overflow:'visible',Width:'100%'}),
    new Css.Rule('.AutomationOverlay-Line',{Fill:'none',PointerEvents:'stroke',StrokeWidth:'2'}),
    new Css.Rule('.AutomationOverlay-Point',{Cursor:'move',PointerEvents:'all',Stroke:'#111',StrokeWidth:'1.5'}),
    new Css.Rule('.AutomationOverlay-HandleLine',{PointerEvents:'none',StrokeWidth:'1',StrokeDasharray:'3 2'}),
    new Css.Rule('.AutomationOverlay-Handle',{Cursor:'crosshair',PointerEvents:'all',Stroke:'#111',StrokeWidth:'1'}),
    new Css.Rule('.AutomationOverlay-Label',{Fill:'#e8edf2',Font:'700 9px system-ui',PointerEvents:'none'}),
]);

@Component('arianna-automation-overlay',AutomationStyles,{Shadow:false,Properties:['collection','lanes']})
export class AutomationOverlay extends HTMLElement
{
    public static readonly Styles=AutomationStyles;public template=html``;
    public onCreated():void{if(this.isConnected)this.onConnected();}
    public onConnected():void
    {
        this.classList.add('AutomationOverlay');
        /* Geometry must not depend on asynchronous stylesheet adoption: this
         * layer is intentionally drawn above AudioPart/VideoPart children. */
        Object.assign(this.style,{position:'absolute',left:'0',top:'0',bottom:'0',zIndex:'12',display:'block',overflow:'hidden',pointerEvents:'auto'});
        if(!state(this).built){state(this).built=true;this.addEventListener('dblclick',e=>this.addAt(e as MouseEvent));}
        this.render();
    }
    public get collection():AutomationLaneCollection{return state(this).collection;}
    public set collection(value:AutomationLaneCollection){state(this).collection=value;this.render();}
    public get lanes():AutomationLane[]{return this.collection.snapshot();}
    public set lanes(value:AutomationLane[]){this.collection=new AutomationLaneCollection(value);}
    public get activeLane():string|null{return state(this).active;}
    public set activeLane(value:string|null){state(this).active=value;this.render();}
    public configure(options:{scale?:number;duration?:number;snap?:number;active?:string}):this
    {const s=state(this);if(options.scale!=null)s.scale=Math.max(1,options.scale);if(options.duration!=null)s.duration=Math.max(.001,options.duration);if(options.snap!=null)s.snap=Math.max(.0001,options.snap);if(options.active!=null)s.active=options.active;this.render();return this;}
    public refresh():this{this.render();return this;}
    private pointXY(lane:AutomationLane,point:AutomationPoint,height:number):{x:number;y:number}
    {return{x:point.time*state(this).scale,y:(1-(point.value-lane.min)/(lane.max-lane.min))*height};}
    private path(lane:AutomationLane,height:number):string
    {
        if(!lane.points.length)return'';const points=lane.points,first=this.pointXY(lane,points[0],height);let d=`M ${first.x} ${first.y}`;
        for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],p=this.pointXY(lane,b,height);if(a.curve==='step')d+=` H ${p.x} V ${p.y}`;else if(a.curve==='bezier'){const aa=this.pointXY(lane,{...a,time:a.time+(a.out?.time??(b.time-a.time)/3),value:a.value+(a.out?.value??0)},height),bb=this.pointXY(lane,{...b,time:b.time+(b.in?.time??-(b.time-a.time)/3),value:b.value+(b.in?.value??0)},height);d+=` C ${aa.x} ${aa.y} ${bb.x} ${bb.y} ${p.x} ${p.y}`;}else d+=` L ${p.x} ${p.y}`;}return d;
    }
    private render():void
    {
        if(!this.isConnected)return;const s=state(this),height=Math.max(24,this.clientHeight||64),width=Math.max(this.clientWidth,s.duration*s.scale),ns='http://www.w3.org/2000/svg';
        /* Keep one CSS pixel equal to one timeline pixel. A 100%-wide SVG with a
         * wider viewBox compresses the curve and breaks point dragging whenever
         * the lane is horizontally zoomed/scrolled. */
        this.style.right='auto';this.style.width=`${width}px`;
        const svg=document.createElementNS(ns,'svg');svg.classList.add('AutomationOverlay-Svg');svg.style.width=`${width}px`;svg.setAttribute('width',String(width));svg.setAttribute('height',String(height));svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.setAttribute('preserveAspectRatio','none');
        for(const lane of s.collection.values())
        {
            if(lane.visible===false)continue;const color=lane.color??'#f5d547',path=document.createElementNS(ns,'path');path.classList.add('AutomationOverlay-Line');path.dataset.lane=lane.id;path.setAttribute('d',this.path(lane,height));path.setAttribute('stroke',color);path.addEventListener('pointerdown',()=>{s.active=lane.id;this.render();});svg.appendChild(path);
            lane.points.forEach((point,index)=>
            {
                if(point.curve!=='bezier'||index>=lane.points.length-1)return;const next=lane.points[index+1],span=next.time-point.time;
                const handles:[AutomationPoint,'in'|'out',AutomationTangent][]=[
                    [point,'out',point.out??{time:span/3,value:0}],
                    [next,'in',next.in??{time:-span/3,value:0}],
                ];
                for(const [anchor,kind,tangent] of handles){const a=this.pointXY(lane,anchor,height),h=this.pointXY(lane,{...anchor,time:anchor.time+tangent.time,value:anchor.value+tangent.value},height),line=document.createElementNS(ns,'line'),handle=document.createElementNS(ns,'circle');line.classList.add('AutomationOverlay-HandleLine');line.setAttribute('x1',String(a.x));line.setAttribute('y1',String(a.y));line.setAttribute('x2',String(h.x));line.setAttribute('y2',String(h.y));line.setAttribute('stroke',color);handle.classList.add('AutomationOverlay-Handle');handle.setAttribute('cx',String(h.x));handle.setAttribute('cy',String(h.y));handle.setAttribute('r','3.5');handle.setAttribute('fill',color);handle.addEventListener('pointerdown',e=>this.dragTangent(e,lane,anchor,kind,span));svg.append(line,handle);}
            });
            lane.points.forEach((point,index)=>{const p=this.pointXY(lane,point,height),circle=document.createElementNS(ns,'circle');circle.classList.add('AutomationOverlay-Point');circle.dataset.lane=lane.id;circle.dataset.index=String(index);circle.setAttribute('cx',String(p.x));circle.setAttribute('cy',String(p.y));circle.setAttribute('r','4');circle.setAttribute('fill',color);circle.addEventListener('pointerdown',e=>this.dragPoint(e,lane,index));circle.addEventListener('contextmenu',e=>{e.preventDefault();if(lane.points.length>1){lane.points.splice(index,1);this.changed(lane);}});svg.appendChild(circle);});
            const label=document.createElementNS(ns,'text');label.classList.add('AutomationOverlay-Label');label.setAttribute('x','6');label.setAttribute('y',String(12+[...s.collection.values()].indexOf(lane)*11));label.textContent=lane.label??lane.parameter??lane.id;svg.appendChild(label);
        }
        this.replaceChildren(svg);
    }
    private dragPoint(event:PointerEvent,lane:AutomationLane,index:number):void
    {
        event.preventDefault();event.stopPropagation();state(this).active=lane.id;const move=(e:PointerEvent)=>{const rect=this.getBoundingClientRect(),s=state(this),time=Math.max(0,Math.round(((e.clientX-rect.left)/s.scale)/s.snap)*s.snap),value=clamp(lane.max-(e.clientY-rect.top)/Math.max(1,rect.height)*(lane.max-lane.min),lane.min,lane.max);lane.points[index]={...lane.points[index],time,value};lane.points.sort((a,b)=>a.time-b.time);this.changed(lane,false);};const end=()=>{window.removeEventListener('pointermove',move,true);window.removeEventListener('pointerup',end,true);window.removeEventListener('pointercancel',end,true);this.changed(lane);};window.addEventListener('pointermove',move,true);window.addEventListener('pointerup',end,true);window.addEventListener('pointercancel',end,true);
    }
    private dragTangent(event:PointerEvent,lane:AutomationLane,point:AutomationPoint,kind:'in'|'out',span:number):void
    {
        event.preventDefault();event.stopPropagation();state(this).active=lane.id;const move=(e:PointerEvent)=>{const rect=this.getBoundingClientRect(),s=state(this),absoluteTime=(e.clientX-rect.left)/s.scale,absoluteValue=clamp(lane.max-(e.clientY-rect.top)/Math.max(1,rect.height)*(lane.max-lane.min),lane.min,lane.max),time=kind==='out'?clamp(absoluteTime-point.time,0,span):clamp(absoluteTime-point.time,-span,0),value=absoluteValue-point.value;point[kind]={time,value};this.changed(lane,false);};const end=()=>{window.removeEventListener('pointermove',move,true);window.removeEventListener('pointerup',end,true);window.removeEventListener('pointercancel',end,true);this.changed(lane);};window.addEventListener('pointermove',move,true);window.addEventListener('pointerup',end,true);window.addEventListener('pointercancel',end,true);
    }
    private addAt(event:MouseEvent):void
    {
        if((event.target as Element).closest('.AutomationOverlay-Point'))return;const s=state(this),lane=s.collection.get(s.active??'')??[...s.collection.values()].find(x=>x.visible!==false);if(!lane)return;const rect=this.getBoundingClientRect(),time=Math.max(0,Math.round(((event.clientX-rect.left)/s.scale)/s.snap)*s.snap),value=clamp(lane.max-(event.clientY-rect.top)/Math.max(1,rect.height)*(lane.max-lane.min),lane.min,lane.max);lane.points.push({id:`${lane.id}-${Date.now().toString(36)}`,time,value,curve:'linear'});lane.points.sort((a,b)=>a.time-b.time);this.changed(lane);
    }
    private changed(lane:AutomationLane,commit=true):void{this.render();this.dispatchEvent(new CustomEvent('arianna:automation-change',{bubbles:true,composed:true,detail:{lane:cloneLane(lane),lanes:this.lanes,commit,source:this}}));}
}

export default AutomationOverlay;
