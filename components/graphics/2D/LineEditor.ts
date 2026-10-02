/**
 * @module components/graphics/2D/LineEditor
 * @author Riccardo Angeli
 * @version 2.3.1
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 *
 * @description
 * Canvas-independent line / polyline / spline behaviour.
 * Usage: const editor = new LineEditor({ canvas, stroke: { color:'#e40c88', width:2 } });
 * Canvas implements Interfaces.CanvasTarget; no Canvas2D or Window implementation is imported.
 * Use attach(canvas), detach(), dispose(); the canvas and other layers are never removed.
 * A single active LineEditor per surface prevents conflicting drawing gestures.
 * Icons.Add/Move/Curve/Draw/Default accept CSS cursor values (including url(...) cursors).
 *
 * Behaviour:
 *  - Points: vertex and tangent glyphs appear only in point-editing mode.
 *    Segments/Spline and Pen/Freehand display the path without vertex glyphs.
 *  - Select: anchor selection, Shift additive selection, marquee rectangle, drag selection.
 *  - Pen: drawing tool. First click sets a start point, pointer movement previews one straight
 *         segment, second release commits it. Drag-and-release also creates one segment.
 *         A fresh press on empty space starts another independent path.
 *         The centre of an open endpoint starts one connected segment; its rim moves that point.
 *  - The selected tool persists between gestures. Select restores marquee selection.
 *  - Freehand: hold, draw sampled points, release to commit one independent path.
 *  - Curve: drag a segment midpoint to bend it, or edit tangents explicitly.
 *           Constant / Linear / Bezier interpolation and draggable in/out tangents are preserved.
 *           The midpoint bend glyph appears only in Curve mode; selected tangents are always draggable.
 *  - Corners: select one or more interior anchors, then call fillet(amount),
 *             chamfer(amount), scallop(amount), or clearCorner().
 *  - editCorner(type, amount): apply to selection and drag corner diamonds to adjust.
 *  - outline/inline(distance): add an equidistant copy, flattening curves within 0.25 units.
 *  - Delete: click a point to delete it, or drag a rectangle to delete every enclosed point.
 */
import { Component, Css, Templates } from '../../../core/index.ts';

const html = Templates.Template.Html;
const SVG_NS = 'http://www.w3.org/2000/svg';

export namespace LineEditor
{
    export namespace Types
    {
        export type Mode = 'select' | 'pen' | 'freehand' | 'curve' | 'delete' | 'add';
        export type Interpolation = 'constant' | 'linear' | 'bezier';
        export type HandleMode = 'corner' | 'smooth' | 'symmetric';
        export type CornerType = 'none' | 'fillet' | 'chamfer' | 'scallop';
        export type SelectionLevel = 'points' | 'segments' | 'spline';
    }

    export namespace Interfaces
    {
        export interface Vec2 { x: number; y: number; }
        export interface Vec3 { x:number; y:number; z:number; }
        export interface Plane3D { origin:Vec3; u:Vec3; v:Vec3; }

        /** Interpolation describes the segment LEAVING this anchor. */
        export interface Anchor
        {
            p: Vec2;
            /** Starts an independent path; never connects to the preceding anchor. */
            breakBefore?: boolean;
            /** Per-spline closure on its first anchor; falls back to the closed attribute. */
            pathClosed?:boolean;
            in?: Vec2;
            out?: Vec2;
            interpolation?: Types.Interpolation;
            mode?: Types.HandleMode;
            /** Optional non-destructive corner treatment for CAD / spline workflows. */
            corner?: { type:Types.CornerType; amount:number };
            /** Source geometry retained for interactive offset adjustment. */
            offsetSource?: {anchors:Anchor[];distance:number};
        }

        export interface CanvasTarget {
            readonly drawingSurface:SVGSVGElement;
            createDrawingLayer():SVGGElement;
            removeDrawingLayer(layer:SVGGElement):void;
        }
        export interface StrokeOptions {
            color:string; width:number; opacity:number;
            lineCap:'butt'|'round'|'square'; lineJoin:'miter'|'round'|'bevel';
            dashArray:number[]; dashOffset:number; miterLimit:number;
        }
        export interface CursorIcons { Default:string; Draw:string; Add:string; Move:string; Curve:string; }
        export interface SnapOptions {
            Enabled:boolean;Vertices:boolean;Endpoints:boolean;Intersections:boolean;Edges:boolean;
            Grid:boolean;Close:boolean;Connect:boolean;Distance:number;GridSize:number;
        }
        export type SnapInput=Partial<SnapOptions> & Partial<{
            enabled:boolean;vertices:boolean;points:boolean;endpoints:boolean;intersections:boolean;
            edges:boolean;grid:boolean;close:boolean;connect:boolean;distance:number;gridSize:number;
        }>;
        export interface SnapFolder {
            sub(name:keyof SnapOptions|string,value:unknown):SnapFolder;
            set(name:keyof SnapOptions|string,value:unknown):SnapFolder;
            get(name:keyof SnapOptions|string):unknown;
            up():LineEditor;
        }
        export interface ToolGroup {label:string;tools:ToolDescriptor[];}
        export interface LineEditorOptions
        {
            canvas?:CanvasTarget;
            stroke?:Partial<StrokeOptions>;
            Icons?:Partial<CursorIcons>;
            anchors?: Anchor[];
            closed?: boolean;
            mode?: Types.Mode;
            interpolation?: Types.Interpolation;
            theme?: 'dark' | 'light';
            plane?: Plane3D;
            snapDistance?:number;
            snap?:SnapInput;
            Snap?:SnapInput;
        }
        export interface ToolDescriptor {id:string;label:string;icon?:string;shortcut?:string;}
        export interface ToolsTarget {
            tools?:ToolDescriptor[];
            setTools(tools:ToolDescriptor[]):unknown;
            setTool?(id:string):unknown;
            getTool?():string|null;
            addEventListener(type:string,listener:EventListenerOrEventListenerObject):void;
            removeEventListener(type:string,listener:EventListenerOrEventListenerObject):void;
        }
    }

    interface DragState
    {
        kind: 'offset' | 'corner' | 'anchor' | 'handle-in' | 'handle-out' | 'marquee' | 'segment' | 'bend' | 'freehand';
        segmentIndex?: number;
        pointerId: number;
        start: Interfaces.Vec2;
        current: Interfaces.Vec2;
        anchorIndex?: number;
        origin?: Interfaces.Anchor[];
        additive?: boolean;
        offset?:{source:Interfaces.Anchor[];distance:number;first:number;count:number;selection:number[]};
    }

    interface State
    {
        anchors: Interfaces.Anchor[];
        selected: Set<number>;
        mode: Types.Mode;
        interpolation: Types.Interpolation;
        preview: Interfaces.Vec2 | null;
        hovered: number | null;
        hoveredSegment: number | null;
        selectedSegment:number|null;
        selectionLevel:Types.SelectionLevel;
        snapTarget:Interfaces.Vec2|null;
        cornerTool:Types.CornerType;
        cornerAmount:number;
        offsetTool?:number;
        activeTool:string;
        penStart: number | null;
        penDirection: 'append' | 'prepend';
        penSeedCreated: boolean;
        penPointer?: {id:number; start:Interfaces.Vec2; commit:boolean};
        drag: DragState | null;
        marquee: { a: Interfaces.Vec2; b: Interfaces.Vec2 } | null;
        plane: Interfaces.Plane3D;
        snapHit:SnapHit|null;
    }

    interface SnapHit {point:Interfaces.Vec2;kind:'vertex'|'edge'|'intersection'|'grid';index?:number;t?:number;}
    const DEFAULT: Interfaces.Anchor[] = [];
    const Runtime = new WeakMap<HTMLElement, State>();

    const stateOf = (host: HTMLElement): State =>
    {
        let state = Runtime.get(host);
        if(!state)
        {
            state = {
                anchors: structuredClone(DEFAULT),
                selected: new Set(),
                mode: 'pen',
                interpolation: 'linear',
                preview: null,
                hovered: null,
                hoveredSegment: null,
                selectedSegment: null,
                selectionLevel:'points',
                snapTarget:null,
                snapHit:null,
                cornerTool:'none',
                cornerAmount:12,
                activeTool:'',
                penStart: null,
                penDirection: 'append',
                penSeedCreated: false,
                drag: null,
                marquee: null,
                plane: {origin:{x:0,y:0,z:0},u:{x:1,y:0,z:0},v:{x:0,y:1,z:0}}
            };
            Runtime.set(host, state);
        }
        return state;
    };

    const clamp = (value:number, min:number, max:number):number =>
        Math.max(min, Math.min(max, value));

    const CURVE_CURSOR=`url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M3 19Q12 0 21 19" fill="none" stroke="white" stroke-width="5"/><path d="M3 19Q12 0 21 19" fill="none" stroke="black" stroke-width="2"/></svg>')}") 12 12, crosshair`;
    const DEFAULT_STROKE:Interfaces.StrokeOptions={color:'#8a62ef',width:2.2,opacity:1,lineCap:'round',lineJoin:'round',dashArray:[],dashOffset:0,miterLimit:4};
    const ADD_CURSOR=`url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M3 2L3 17L7 13L10 20L13 18L9 11L15 11Z" fill="white" stroke="black"/><path d="M18 2V10M14 6H22" stroke="white" stroke-width="4"/><path d="M18 2V10M14 6H22" stroke="black" stroke-width="2"/></svg>')}") 3 2, crosshair`;
    const DEFAULT_ICONS:Interfaces.CursorIcons={Default:'default',Draw:'crosshair',Add:ADD_CURSOR,Move:'move',Curve:CURVE_CURSOR};
    interface Attachment {
        canvas:Interfaces.CanvasTarget|null; layer:SVGGElement|null; cleanup:(()=>void)|null;
        stroke:Interfaces.StrokeOptions; icons:Interfaces.CursorIcons; cursor:keyof Interfaces.CursorIcons;
        snapDistance:number;snap:Interfaces.SnapOptions;toolMenu:HTMLElement|null; window:HTMLElement|null; toolsCleanup:(()=>void)|null;
    }
    const Attachments=new WeakMap<HTMLElement,Attachment>();
    const ActiveSurfaces=new WeakMap<SVGSVGElement,LineEditor>();
    function attachment(host:LineEditor):Attachment {
        let a=Attachments.get(host);
        if(!a) {
            a={canvas:null,layer:null,cleanup:null,stroke:structuredClone(DEFAULT_STROKE),icons:{...DEFAULT_ICONS},cursor:'Default',snapDistance:7,snap:{Enabled:true,Vertices:true,Endpoints:true,Intersections:true,Edges:false,Grid:false,Close:true,Connect:true,Distance:7,GridSize:20},toolMenu:null,window:null,toolsCleanup:null};
            Attachments.set(host,a);
            const canonical=(key:string)=>({points:'Vertices',gridsize:'GridSize'}[key.toLowerCase()]??Object.keys(a!.snap).find(k=>k.toLowerCase()===key.toLowerCase()));
            a.snap=new Proxy(a.snap,{
                get(target,key){const name=typeof key==='string'?canonical(key):undefined;return Reflect.get(target,name??key);},
                set(target,key,value){
                    const name=typeof key==='string'?canonical(key):undefined;if(!name)throw new TypeError('Unknown Snap property: '+String(key));
                    if(name==='Distance'||name==='GridSize'){if(typeof value!=='number'||!Number.isFinite(value)||value<0||(name==='GridSize'&&value===0))throw new TypeError('Invalid Snap '+name);}
                    else if(typeof value!=='boolean')throw new TypeError('Snap '+name+' must be boolean');
                    Reflect.set(target,name,value);if(name==='Distance')a!.snapDistance=value as number;
                    const state=stateOf(host);state.snapTarget=null;state.snapHit=null;host.refreshSnap();return true;
                }
            });
            a.icons=new Proxy(a.icons,{set(target,key,value){
                if(!(key in DEFAULT_ICONS)||typeof value!=='string'||!value.trim())throw new TypeError('Invalid cursor icon');
                Reflect.set(target,key,value);host.refreshCursor();return true;
            }});
        }
        return a;
    }
    export const Styles = new Css.Stylesheet([new Css.Rule('arianna-line-editor',{Display:'none'})]);

    @Component('arianna-line-editor', Styles, {
        Shadow: false,
        Attributes: ['mode','closed','interpolation','canvas','stroke','snap-distance','snap'],
        Properties: ['anchors','canvas','stroke','Icons','Window','snapDistance','Snap','ToolMenu']
    })
    export class LineEditor extends HTMLElement
    {
        public static readonly Styles = Styles;
        public get template() { return html``; }

        private _svg?: SVGSVGElement;
        constructor(options:Interfaces.LineEditorOptions={}) {
            super();
            if(options.anchors) this.anchors=options.anchors;
            if(options.closed!==undefined) this.closed=options.closed;
            if(options.mode) this.setMode(options.mode);
            if(options.interpolation) stateOf(this).interpolation=options.interpolation;
            if(options.stroke) this.stroke=options.stroke;
            if(options.Icons) this.Icons=options.Icons;
            if(options.plane) stateOf(this).plane=structuredClone(options.plane);
            if(options.snapDistance!==undefined)this.snapDistance=options.snapDistance;
            if(options.snap??options.Snap)this.Snap=(options.snap??options.Snap)!;
            if(options.canvas) this.attach(options.canvas);
        }
        public onCreated():void { if(this.isConnected)this.onConnected(); }
        public onConnected():void {
            this.style.display='none';
            const selector=this.getAttribute('canvas');
            if(selector) {
                const canvas=document.querySelector(selector) as unknown as Interfaces.CanvasTarget|null;
                if(!canvas)throw new Error('LineEditor canvas target not found: '+selector);
                this.attach(canvas);
            } else {
                // Structural attachment: no dependency on the Canvas2D implementation.
                let parent=this.parentElement;
                while(parent) {
                    if(typeof (parent as any).createDrawingLayer==='function') {this.attach(parent as unknown as Interfaces.CanvasTarget);break;}
                    parent=parent.parentElement;
                }
            }
            const stroke=this.getAttribute('stroke');if(stroke)this.stroke=JSON.parse(stroke);
            const snap=this.getAttribute('snap');if(snap)this.Snap=JSON.parse(snap);
            const mode=this.getAttribute('mode');if(mode)this.setMode(mode as Types.Mode);
        }
        public onAttributeChanged(name:string):void {
            if(name==='canvas'&&this.isConnected)this.onConnected();
            else if(name==='stroke') { const value=this.getAttribute('stroke');if(value)this.stroke=JSON.parse(value); }
            else if(name==='snap'){const value=this.getAttribute('snap');if(value)this.Snap=JSON.parse(value);}
            else if(name==='closed')this.Draw();
            else if(name==='snap-distance') {
                const value=Number(this.getAttribute('snap-distance'));
                if(Number.isFinite(value))this.Snap.Distance=Math.max(0,value);
            }
            else if(name==='mode') {
                const value=this.getAttribute('mode') as Types.Mode;
                if(['select','pen','freehand','curve','delete','add'].includes(value)&&stateOf(this).mode!==value)this.setMode(value);
            }
        }
        public onUnmount():void { this.detach(); }
        public onDisconnected():void { this.detach(); }
        public get canvas():Interfaces.CanvasTarget|null { return attachment(this).canvas; }
        public set canvas(value:Interfaces.CanvasTarget|null) { value?this.attach(value):this.detach(); }
        public get stroke():Interfaces.StrokeOptions { return structuredClone(attachment(this).stroke); }
        public set stroke(value:Partial<Interfaces.StrokeOptions>) {
            const next={...attachment(this).stroke,...value};
            if(typeof next.color!=='string'||!Number.isFinite(next.width)||next.width<0||!Number.isFinite(next.opacity)||next.opacity<0||next.opacity>1||
                !['butt','round','square'].includes(next.lineCap)||!['miter','round','bevel'].includes(next.lineJoin)||
                !Array.isArray(next.dashArray)||next.dashArray.some(v=>!Number.isFinite(v)||v<0)||!Number.isFinite(next.dashOffset)||!Number.isFinite(next.miterLimit)||next.miterLimit<1)
                throw new TypeError('Invalid stroke options');
            attachment(this).stroke=structuredClone(next);this.Draw();
            this.dispatchEvent(new CustomEvent('arianna:stroke-change',{detail:{stroke:this.stroke,source:this}}));
        }
        public get Icons():Interfaces.CursorIcons { return attachment(this).icons; }
        public set Icons(value:Partial<Interfaces.CursorIcons>) { Object.assign(attachment(this).icons,value); }
        public get snapDistance():number { return attachment(this).snapDistance; }
        public set snapDistance(value:number) {
            const next=Math.max(0,Number(value)||0);this.Snap.Distance=next;
            if(this.getAttribute('snap-distance')!==String(next))this.setAttribute('snap-distance',String(next));
        }
        /** Stable property folder; PascalCase and lower-case constructor keys share one state. */
        public get Snap():Interfaces.SnapOptions {return attachment(this).snap;}
        public set Snap(value:Interfaces.SnapInput) {
            if(!value||typeof value!=='object')throw new TypeError('Snap requires an options object');
            Object.assign(attachment(this).snap,value);
        }
        public refreshSnap():void {this.Draw();}
        public set(name:'Snap'):Interfaces.SnapFolder;
        public set(name:string,value:unknown):this;
        public set(name:string,value?:unknown):any {
            if(name.toLowerCase()==='snap') {
                if(arguments.length>1){this.Snap=value as Interfaces.SnapInput;return this;}
                const host=this;const folder:Interfaces.SnapFolder={
                    sub(key,value){Reflect.set(host.Snap,key,value);return folder;},
                    set(key,value){Reflect.set(host.Snap,key,value);return folder;},
                    get(key){return Reflect.get(host.Snap,key);},up(){return host;}
                };return folder;
            }
            const inherited=Reflect.get(Object.getPrototypeOf(LineEditor.prototype),'set',this);
            if(typeof inherited==='function')return inherited.call(this,name,value);
            if(name in this)Reflect.set(this,name,value);else this.setAttribute(name,String(value));return this;
        }

        /** Closest parameter on a segment. Cubics use bounded sampling plus local refinement. */
        private ProjectSegment(index:number,point:Interfaces.Vec2):{point:Interfaces.Vec2;t:number;distance:number}|null {
            const state=stateOf(this),next=this.NextIndex(index);if(next===null)return null;
            const a=state.anchors[index],b=state.anchors[next];let t=0;
            const square=(p:Interfaces.Vec2)=>(p.x-point.x)**2+(p.y-point.y)**2;
            if((a.interpolation??'linear')==='linear') {
                const x=b.p.x-a.p.x,y=b.p.y-a.p.y;t=clamp(((point.x-a.p.x)*x+(point.y-a.p.y)*y)/(x*x+y*y||1),0,1);
            } else {
                let best=Infinity,step=0;for(let k=0;k<=64;k++){const d=square(this.SegmentPoint(index,k/64)!);if(d<best){best=d;step=k;}}
                let low=Math.max(0,(step-1)/64),high=Math.min(1,(step+1)/64);
                for(let k=0;k<28;k++){const x=low+(high-low)/3,y=high-(high-low)/3;if(square(this.SegmentPoint(index,x)!)<square(this.SegmentPoint(index,y)!))high=y;else low=x;}
                t=(low+high)/2;
            }
            const projected=this.SegmentPoint(index,t)!;return{point:projected,t,distance:Math.hypot(projected.x-point.x,projected.y-point.y)};
        }
        private NearestSegment(point:Interfaces.Vec2,radius?:number):(SnapHit&{index:number;t:number})|null {
            const state=stateOf(this);let best=radius??this.HitRadius(10),result:(SnapHit&{index:number;t:number})|null=null;
            for(let index=0;index<state.anchors.length;index++) {
                const projected=this.ProjectSegment(index,point);if(!projected||projected.distance>best)continue;
                best=projected.distance;result={point:projected.point,index,t:projected.t,kind:'edge'};
            }return result;
        }
        /** Arm + without inserting anything until a canvas click supplies the location. */
        public beginAdd():this {this.setSelectionLevel('points');return this.setMode('add');}
        public addPointAt(point:Interfaces.Vec2):this {
            if(this.NearestAnchor(point,this.HitRadius(10))>=0)return this;
            const hit=this.NearestSegment(point);if(!hit||hit.t<1e-5||hit.t>1-1e-5)return this;
            return this.addPoint(hit.index,hit.t);
        }
        private FindSnap(point:Interfaces.Vec2,excluded=new Set<number>()):SnapHit|null {
            const snap=this.Snap,state=stateOf(this);if(!snap.Enabled||snap.Distance<=0)return null;
            const radius=this.HitRadius(snap.Distance);let best=radius,result:SnapHit|null=null;
            const priority={vertex:0,intersection:1,edge:2,grid:3};
            const offer=(hit:SnapHit)=>{const d=Math.hypot(hit.point.x-point.x,hit.point.y-point.y);if(d<best-1e-8||(d<=best+1e-8&&(!result||priority[hit.kind]<priority[result.kind]))){best=d;result=hit;}};
            state.anchors.forEach((anchor,index)=>{
                if(excluded.has(index))return;
                const endpoint=this.PreviousIndex(index)===null||this.NextIndex(index)===null;
                if((endpoint&&snap.Endpoints)||snap.Vertices)offer({point:{...anchor.p},kind:'vertex',index});
            });
            if(snap.Grid) {
                const size=snap.GridSize;offer({kind:'grid',point:{x:Math.round(point.x/size)*size,y:Math.round(point.y/size)*size}});
            }
            // Only fragments near the pointer can contribute a nearby intersection.
            // This avoids a quadratic scan of every edge on each pointer move.
            const fragments:Array<{a:Interfaces.Vec2;b:Interfaces.Vec2;index:number;next:number}>=[];
            if(snap.Edges||snap.Intersections)for(let index=0;index<state.anchors.length;index++) {
                const next=this.NextIndex(index);if(next===null||excluded.has(index)||excluded.has(next))continue;
                const projected=this.ProjectSegment(index,point);if(!projected||projected.distance>radius*1.5)continue;
                if(snap.Edges)offer({point:projected.point,kind:'edge',index,t:projected.t});
                if(!snap.Intersections)continue;
                const curved=(state.anchors[index].interpolation??'linear')!=='linear',steps=curved?32:1;
                let a=this.SegmentPoint(index,0)!;
                for(let k=1;k<=steps;k++){
                    const b=this.SegmentPoint(index,k/steps)!;
                    const near=point.x>=Math.min(a.x,b.x)-radius&&point.x<=Math.max(a.x,b.x)+radius&&point.y>=Math.min(a.y,b.y)-radius&&point.y<=Math.max(a.y,b.y)+radius;
                    if(near)fragments.push({a,b,index,next});a=b;
                }
            }
            for(let i=0;i<fragments.length;i++)for(let j=i+1;j<fragments.length;j++) {
                const a=fragments[i],b=fragments[j];if(a.index===b.index||a.index===b.next||a.next===b.index||a.next===b.next)continue;
                const intersection=this.LineIntersection(a.a,a.b,b.a,b.b);if(intersection)offer({point:intersection,kind:'intersection'});
            }
            return result;
        }
        private SnapDrawing(point:Interfaces.Vec2):Interfaces.Vec2 {
            const state=stateOf(this),excluded=new Set<number>();if(state.penStart!==null)excluded.add(state.penStart);else if(state.mode==='freehand'&&state.anchors.length)excluded.add(state.anchors.length-1);
            state.snapHit=this.FindSnap(point,excluded);state.snapTarget=state.snapHit?.point??null;
            return state.snapHit?{...state.snapHit.point}:point;
        }

        public refreshCursor():void { const a=attachment(this);if(this._svg)this._svg.style.cursor=a.icons[a.cursor]; }
        private Cursor(kind:keyof Interfaces.CursorIcons):void { attachment(this).cursor=kind;this.refreshCursor(); }
        public attach(canvas:Interfaces.CanvasTarget):this {
            if(!canvas||typeof canvas.createDrawingLayer!=='function'||typeof canvas.removeDrawingLayer!=='function')throw new TypeError('LineEditor requires a CanvasTarget');
            const svg=canvas.drawingSurface;
            if(ActiveSurfaces.has(svg)&&ActiveSurfaces.get(svg)!==this)throw new Error('This canvas already has an active LineEditor');
            if(attachment(this).canvas===canvas&&this._svg===svg)return this;
            this.detach();
            const a=attachment(this),layer=canvas.createDrawingLayer();
            a.canvas=canvas;a.layer=layer;this._svg=svg;layer.setAttribute('data-line-layer','');
            ActiveSurfaces.set(svg,this);
            const oldCursor=svg.style.cursor, oldTabindex=svg.getAttribute('tabindex');
            svg.setAttribute('tabindex','0');
            const listeners:Array<[string,EventListener]>=[];
            const bind=(name:string,handler:EventListener)=>{svg.addEventListener(name,handler);listeners.push([name,handler]);};
            bind('pointerdown',((e:PointerEvent)=>this.OnPointerDown(e)) as EventListener);
            bind('pointermove',((e:PointerEvent)=>this.OnPointerMove(e)) as EventListener);
            bind('pointerup',((e:PointerEvent)=>this.OnPointerUp(e)) as EventListener);
            bind('pointercancel',((e:PointerEvent)=>this.OnPointerUp(e)) as EventListener);
            bind('pointerleave',((e:PointerEvent)=>this.OnPointerLeave(e)) as EventListener);
            bind('keydown',((e:KeyboardEvent)=>this.OnKeyDown(e)) as EventListener);
            a.cleanup=()=>{for(const [name,fn] of listeners)svg.removeEventListener(name,fn);svg.style.cursor=oldCursor;if(oldTabindex===null)svg.removeAttribute('tabindex');else svg.setAttribute('tabindex',oldTabindex);ActiveSurfaces.delete(svg);};
            this.Draw();this.Cursor('Default');return this;
        }
        /** Remove only this behaviour's layer/listeners. The canvas and foreign content survive. */
        public detach():this {
            const a=attachment(this),state=stateOf(this);
            if(state.drag?.origin)state.anchors=state.drag.origin;
            if(state.drag&&this._svg?.hasPointerCapture(state.drag.pointerId))this._svg.releasePointerCapture(state.drag.pointerId);
            if(state.penPointer&&this._svg?.hasPointerCapture(state.penPointer.id))this._svg.releasePointerCapture(state.penPointer.id);
            state.penPointer=undefined;
            state.drag=null;state.preview=null;state.penStart=null;state.marquee=null;state.hoveredSegment=null;
            a.cleanup?.();a.cleanup=null;
            if(a.layer&&a.canvas)a.canvas.removeDrawingLayer(a.layer);
            a.canvas=null;a.layer=null;this._svg=undefined;return this;
        }
        public dispose():void { this.detach();const a=attachment(this);a.toolsCleanup?.();a.toolsCleanup=null;a.window?.remove();a.window=null;a.toolMenu?.remove();a.toolMenu=null; }
        private Bounds():{width:number;height:number} {
            const box=this._svg?.viewBox.baseVal;
            return {width:box?.width||520,height:box?.height||300};
        }

        public get anchors(): Interfaces.Anchor[]
        {
            return structuredClone(stateOf(this).anchors);
        }

        public set anchors(value: Interfaces.Anchor[])
        {
            const state = stateOf(this);
            state.anchors = Array.isArray(value) ? structuredClone(value) : [];
            state.selected = new Set(state.anchors.length ? [0] : []);
            state.selectedSegment = null;
            state.snapTarget = null;
            state.hovered = null;
            state.hoveredSegment = null;
            this.Draw();
            this.RefreshWindow();

        }

        /** Closure of the selected spline, independent from other paths in this behaviour. */
        public get closed():boolean {
            const state=stateOf(this),index=state.selected.values().next().value??state.penStart??0;
            return this.PathClosed(index);
        }
        public set closed(value:boolean) {
            const state=stateOf(this);for(const anchor of state.anchors)delete anchor.pathClosed;
            this.toggleAttribute('closed',Boolean(value));this.Draw();this.EmitChange();
        }
        private PathStart(index:number):number {const anchors=stateOf(this).anchors;while(index>0&&!anchors[index]?.breakBefore)index--;return index;}
        private PathIndices(index:number):number[]{const first=this.PathStart(index),last=this.PathEnd(index);return Array.from({length:last-first+1},(_,i)=>first+i);}
        private PathEnd(index:number):number {const anchors=stateOf(this).anchors;while(index+1<anchors.length&&!anchors[index+1].breakBefore)index++;return index;}
        private PathClosed(index:number):boolean {return stateOf(this).anchors[this.PathStart(index)]?.pathClosed??this.hasAttribute('closed');}
        private FreezePathClosures():void {
            const state=stateOf(this);for(let i=0;i<state.anchors.length;i++)if(i===0||state.anchors[i].breakBefore)state.anchors[i].pathClosed??=this.hasAttribute('closed');
            this.removeAttribute('closed');
        }

        public setMode(value: Types.Mode | 'edit'): this
        {
            const state = stateOf(this);
            if(!['select','pen','freehand','curve','delete','add','edit'].includes(value))throw new TypeError('Invalid LineEditor mode');
            // Tool changes cancel only unfinished work and release any captured pointer.
            if(state.drag?.origin)state.anchors=state.drag.origin;
            if(state.penSeedCreated&&state.penStart!==null)state.anchors.splice(state.penStart,1);
            const pointer=state.penPointer?.id??state.drag?.pointerId;
            if(pointer!==undefined&&this._svg?.hasPointerCapture(pointer))this._svg.releasePointerCapture(pointer);
            state.penPointer=undefined;
            state.cornerTool='none';state.offsetTool=undefined;
            state.mode = value === 'edit' ? 'select' : value;
            state.preview = null;
            state.hovered = null;
            state.hoveredSegment = null;
            state.drag = null;
            state.marquee = null;
            state.penStart = null;
            state.penSeedCreated = false;
            state.snapTarget = null;

            /*
             * Pen is armed only by an actual pointer press.
             * Merely selecting the tool must not start from a previously selected anchor.
             */
            this.setAttribute('mode', state.mode);
            this.Cursor(state.mode==='freehand'?'Draw':'Default');
            this.Draw();
            this.dispatchEvent(new CustomEvent('arianna:line-mode-change',{detail:{mode:state.mode,source:this}}));
            this.EmitChange();

            return this;
        }

        public getMode(): Types.Mode { return stateOf(this).mode; }

        public setInterpolation(value: Types.Interpolation): this
        {
            const state = stateOf(this);
            state.interpolation = value;
            this.setAttribute('interpolation', value);

            // Interpolation belongs to the outgoing segment, but converting a selected
            // vertex must also convert its incoming segment and expose both tangents.
            const indices=this.SelectedIndices();
            const segments=new Set<number>();
            for(const index of indices) {
                segments.add(index);
                if(state.selectionLevel==='points') {const previous=this.PreviousIndex(index);if(previous!==null)segments.add(previous);}
                if(value==='bezier')state.anchors[index].corner=undefined;
            }
            for(const index of segments) {
                const anchor=state.anchors[index],nextIndex=this.NextIndex(index);if(!anchor)continue;
                const previous=anchor.interpolation??'linear';anchor.interpolation=value;
                if(value==='bezier' && nextIndex!==null) {
                    const next=state.anchors[nextIndex];anchor.corner=undefined;next.corner=undefined;
                    if(previous!=='bezier') {anchor.out=this.DefaultHandle(index,'out');next.in=this.DefaultHandle(nextIndex,'in');}
                    else {anchor.out??=this.DefaultHandle(index,'out');next.in??=this.DefaultHandle(nextIndex,'in');}
                    anchor.mode='corner';next.mode??='corner';
                }
            }

            this.Draw();

            this.EmitChange();
            return this;
        }

        public getInterpolation(): Types.Interpolation
        {
            return stateOf(this).interpolation;
        }

        /** Local 2D drawing plane used when the same spline is consumed in 3D. */
        public setPlane(plane: Interfaces.Plane3D): this
        {
            const normalize=(v:Interfaces.Vec3):Interfaces.Vec3=>{const l=Math.hypot(v.x,v.y,v.z)||1;return{x:v.x/l,y:v.y/l,z:v.z/l};};
            const u=normalize(plane.u),v=normalize(plane.v);
            stateOf(this).plane={origin:{...plane.origin},u,v};
            this.dispatchEvent(new CustomEvent('arianna:line-plane-change',{bubbles:true,detail:{plane:this.getPlane(),source:this}}));
            return this;
        }

        public getPlane(): Interfaces.Plane3D
        {
            return structuredClone(stateOf(this).plane);
        }

        /** Map a local LineEditor coordinate onto its arbitrary 3D construction plane. */
        public pointTo3D(point:Interfaces.Vec2): Interfaces.Vec3
        {
            const p=stateOf(this).plane;
            return {
                x:p.origin.x+p.u.x*point.x+p.v.x*point.y,
                y:p.origin.y+p.u.y*point.x+p.v.y*point.y,
                z:p.origin.z+p.u.z*point.x+p.v.z*point.y
            };
        }

        public to3DAnchors(): Interfaces.Vec3[]
        {
            return stateOf(this).anchors.map(anchor=>this.pointTo3D(anchor.p));
        }

        /** Profile form consumed by CAD-style tools such as RevolveModifier. */
        public getProfile2D(): Interfaces.Vec2[]
        {
            return stateOf(this).anchors.map(anchor=>({...anchor.p}));
        }

        /** Current sub-object level used by the tree window and the canvas. */
        public get selectionLevel():Types.SelectionLevel{return stateOf(this).selectionLevel;}
        public setSelectionLevel(level:Types.SelectionLevel):this
        {
            if(!['points','segments','spline'].includes(level))throw new TypeError('Invalid LineEditor selection level');
            this.setMode('select');
            const state=stateOf(this);state.selectionLevel=level;state.selectedSegment=null;
            if(level==='spline'&&state.anchors.length)state.selected=new Set(this.PathIndices(state.selected.values().next().value??0));
            this.Draw();this.RefreshWindow();
            this.dispatchEvent(new CustomEvent('arianna:line-selection-level',{bubbles:true,composed:true,detail:{level,source:this}}));
            return this;
        }

        public selectAll():this
        {
            const state=stateOf(this);state.selected=new Set(state.anchors.map((_,index)=>index));
            this.Draw();this.RefreshWindow();return this;
        }

        /** Split the active segment without changing its visible Bézier shape. */
        public addPoint(segmentIndex?:number,t=.5):this
        {
            const state=stateOf(this);
            segmentIndex??=state.selectedSegment??state.hoveredSegment??0;
            const next=this.NextIndex(segmentIndex);
            if(next===null)return this;
            const insertion=next<=segmentIndex?segmentIndex+1:next;
            const a=state.anchors[segmentIndex],b=state.anchors[next],u=clamp(Number(t)||.5,.001,.999);
            const point=this.SegmentPoint(segmentIndex,u);if(!point)return this;
            if((a.interpolation??'linear')==='bezier')
            {
                const p0=a.p,p1={x:a.p.x+(a.out??this.DefaultHandle(segmentIndex,'out')).x,y:a.p.y+(a.out??this.DefaultHandle(segmentIndex,'out')).y};
                const p2={x:b.p.x+(b.in??this.DefaultHandle(next,'in')).x,y:b.p.y+(b.in??this.DefaultHandle(next,'in')).y},p3=b.p;
                const mix=(x:Interfaces.Vec2,y:Interfaces.Vec2,k:number):Interfaces.Vec2=>({x:x.x+(y.x-x.x)*k,y:x.y+(y.y-x.y)*k});
                const q0=mix(p0,p1,u),q1=mix(p1,p2,u),q2=mix(p2,p3,u),r0=mix(q0,q1,u),r1=mix(q1,q2,u),s=mix(r0,r1,u);
                a.out={x:q0.x-p0.x,y:q0.y-p0.y};b.in={x:q2.x-p3.x,y:q2.y-p3.y};
                state.anchors.splice(insertion,0,{p:s,in:{x:r0.x-s.x,y:r0.y-s.y},out:{x:r1.x-s.x,y:r1.y-s.y},interpolation:'bezier',mode:'smooth'});
            }
            else state.anchors.splice(insertion,0,{p:point,interpolation:a.interpolation??'linear',mode:'corner'});
            state.selected=new Set([insertion]);state.selectedSegment=null;
            this.Draw();this.EmitChange();return this;
        }

        /** Merge selected vertices into their centroid. */
        public weld(distance=Infinity):this
        {
            const state=stateOf(this),indices=this.SelectedIndices();if(indices.length<2)return this;
            const points=indices.map(index=>state.anchors[index].p),max=Math.max(...points.flatMap((p,i)=>points.slice(i+1).map(q=>Math.hypot(p.x-q.x,p.y-q.y))),0);
            if(max>Math.max(0,distance))return this;
            const centroid={x:points.reduce((sum,p)=>sum+p.x,0)/points.length,y:points.reduce((sum,p)=>sum+p.y,0)/points.length};
            const keep=indices[0];state.anchors[keep].p=centroid;
            state.anchors=this.FilterAnchors(new Set(indices.slice(1)));state.selected=new Set([keep]);
            if(state.anchors.length<3)this.removeAttribute('closed');
            this.Draw();this.EmitChange();return this;
        }

        /** Join two selected open endpoints. Flat storage keeps the joined path declarative. */
        public connect():this
        {
            const state=stateOf(this),selected=this.SelectedIndices();if(selected.length!==2)return this;
            const [a,b]=selected.sort((x,y)=>x-y);
            const endpoint=(index:number)=>this.PreviousIndex(index)===null||this.NextIndex(index)===null;
            if(!endpoint(a)||!endpoint(b))return this;
            if(b===a+1)state.anchors[b].breakBefore=false;
            else
            {
                const first=state.anchors[a],second=state.anchors[b];
                const joined={...second,breakBefore:false};state.anchors.splice(b,1);state.anchors.splice(a+1,0,joined);first.interpolation??='linear';
            }
            state.selected=new Set([a,a+1]);state.selectedSegment=a;
            this.Draw();this.EmitChange();return this;
        }

        public makeFirst():this
        {
            const state=stateOf(this),index=this.SelectedIndices()[0];if(index===undefined||!state.anchors.length)return this;
            let first=index;while(first>0&&!state.anchors[first].breakBefore)first--;
            let last=index;while(last<state.anchors.length-1&&!state.anchors[last+1].breakBefore)last++;
            const path=state.anchors.slice(first,last+1);const local=index-first;
            if(local===0)return this;
            if(this.closed)state.anchors.splice(first,path.length,...path.slice(local),...path.slice(0,local));
            else if(local===path.length-1)
            {
                const startsPath=path[0].breakBefore;
                const reversed=[...path].reverse().map((anchor,i)=>({
                    ...anchor,
                    in:anchor.out?{...anchor.out}:undefined,
                    out:anchor.in?{...anchor.in}:undefined,
                    breakBefore:i===0?startsPath:false
                }));
                state.anchors.splice(first,path.length,...reversed);
            }
            else return this;
            state.anchors[first].breakBefore=first>0;state.selected=new Set([first]);
            this.Draw();this.EmitChange();return this;
        }

        public smooth():this
        {
            this.setSelectionLevel('points');this.setMode('curve');
            const state=stateOf(this),indices=this.SelectedIndices().length?this.SelectedIndices():state.anchors.map((_,index)=>index);
            for(const index of indices)
            {
                const anchor=state.anchors[index],previous=this.PreviousIndex(index),next=this.NextIndex(index);if(!anchor||previous===null||next===null)continue;
                const before=state.anchors[previous].p,after=state.anchors[next].p,dx=after.x-before.x,dy=after.y-before.y,length=Math.hypot(dx,dy)||1;
                const inLength=Math.hypot(anchor.p.x-before.x,anchor.p.y-before.y)/3,outLength=Math.hypot(after.x-anchor.p.x,after.y-anchor.p.y)/3;
                anchor.in={x:-dx/length*inLength,y:-dy/length*inLength};anchor.out={x:dx/length*outLength,y:dy/length*outLength};
                anchor.corner=undefined;anchor.interpolation='bezier';anchor.mode='smooth';
                state.anchors[previous].interpolation='bezier';
            }
            this.Draw();this.EmitChange();return this;
        }

        public bezier():this{this.setSelectionLevel('points');this.setMode('curve');return this.setInterpolation('bezier');}

        /** Data-only tool groups can also be consumed by an application-owned toolbox. */
        public getToolGroups():Interfaces.ToolGroup[] {
            return [
                {label:'Points',tools:[
                    {id:'line-points',label:'Select points',icon:'•'},
                    {id:'line-add',label:'Add point',icon:'+',shortcut:'+'},
                    {id:'line-delete',label:'Delete points',icon:'−'},
                    {id:'line-weld',label:'Weld',icon:'⋈'},{id:'line-connect',label:'Connect',icon:'⌇'},
                    {id:'line-make-first',label:'Make First',icon:'1'},
                    {id:'line-fillet',label:'Fillet',icon:'⌒'},{id:'line-chamfer',label:'Chamfer',icon:'◇'},
                    {id:'line-scallop',label:'Scallop',icon:'◡'},
                    {id:'line-smooth',label:'Smooth',icon:'∿'},{id:'line-bezier',label:'Bézier',icon:'⌁'},
                    {id:'line-corner',label:'Corner',icon:'∠'}]},
                {label:'Edges',tools:[
                    {id:'line-segments',label:'Select edges',icon:'—'},
                    {id:'line-draw',label:'Guided line',icon:'╱'},
                    {id:'line-freehand',label:'Freehand',icon:'✎'},
                    {id:'line-curve',label:'Edit tangents',icon:'⌒'},
                    {id:'line-linear',label:'Linear',icon:'╱'}]},
                {label:'Spline',tools:[
                    {id:'line-spline',label:'Select spline',icon:'⌁'},
                    {id:'line-close',label:'Close / Open',icon:'⟳'},
                    {id:'line-outline',label:'Outline',icon:'⊕'},
                    {id:'line-inline',label:'Inline',icon:'⊖'}]}
            ];
        }
        public getToolSubset():Interfaces.ToolDescriptor[] {return this.getToolGroups().flatMap(group=>group.tools);}
        public useTool(id:string,amount=12):this {
            const actions:Record<string,()=>unknown>={
                'line-points':()=>this.setSelectionLevel('points'),'line-segments':()=>this.setSelectionLevel('segments'),'line-spline':()=>this.setSelectionLevel('spline'),
                'line-add':()=>this.beginAdd(),'line-delete':()=>{this.setSelectionLevel('points');this.setMode('delete');},
                'line-draw':()=>this.setMode('pen'),'line-freehand':()=>this.setMode('freehand'),
                'line-curve':()=>{this.setSelectionLevel('points');this.setMode('curve');},
                'line-weld':()=>this.weld(),'line-connect':()=>this.connect(),'line-make-first':()=>this.makeFirst(),
                'line-fillet':()=>this.editCorner('fillet',amount),'line-chamfer':()=>this.editCorner('chamfer',amount),'line-scallop':()=>this.editCorner('scallop',amount),
                'line-smooth':()=>this.smooth(),'line-bezier':()=>this.bezier(),
                'line-linear':()=>this.setInterpolation('linear'),
                'line-corner':()=>{this.setSelectionLevel('points');this.setInterpolation('linear');for(const index of this.SelectedIndices()){const a=stateOf(this).anchors[index];a.in=undefined;a.out=undefined;a.corner=undefined;a.mode='corner';}this.Draw();this.EmitChange();},
                'line-outline':()=>this.beginOffset(1),'line-inline':()=>this.beginOffset(-1),'line-close':()=>this.closed?this.openPath():this.closePath()
            };
            if(!actions[id])throw new TypeError('Unknown LineEditor tool: '+id);
            actions[id]();stateOf(this).activeTool=id;this.RefreshToolMenu();
            this.dispatchEvent(new CustomEvent('arianna:line-tool',{bubbles:true,composed:true,detail:{id,source:this}}));return this;
        }
        /** Independent floating flyout: no canvas or toolbox is owned by LineEditor. */
        public get ToolMenu():HTMLElement {
            const a=attachment(this);if(a.toolMenu)return a.toolMenu;
            const menu=document.createElement('section');menu.className='LineEditor-ToolMenu';menu.hidden=true;menu.tabIndex=-1;
            menu.setAttribute('role','menu');menu.setAttribute('aria-label','Line tools');
            menu.style.cssText='position:fixed;z-index:10001;width:250px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:auto;background:#292d31;color:#e4e8eb;border:1px solid #111417;border-radius:7px;padding:5px;box-shadow:0 18px 48px #0009;font:11px/1.3 system-ui';
            const style=document.createElement('style');style.textContent='.LineEditor-ToolMenu[hidden]{display:none}.LineEditor-ToolMenu h4{margin:5px 2px 3px;padding:5px 7px;background:#202428;color:#929ca6;font-size:9px;text-transform:uppercase;letter-spacing:.06em}.LineEditor-ToolMenu button{display:flex;gap:10px;align-items:center;width:100%;border:1px solid transparent;border-radius:3px;background:transparent;color:#e4e8eb;text-align:left;padding:5px 7px;font:11px system-ui;cursor:pointer}.LineEditor-ToolMenu button:hover,.LineEditor-ToolMenu button:focus-visible{background:#3b4147;outline:none;border-color:#e40c88}.LineEditor-ToolMenu button[data-active="true"]{background:#e40c8833;color:#ff83c4}.LineEditor-ToolMenu button:disabled{opacity:.35;cursor:default}.LineEditor-ToolMenu .LineEditor-ToolIcon{width:18px;font-size:15px;text-align:center}.LineEditor-ToolMenu kbd{margin-left:auto;color:#929ca6;font-size:9px}';menu.append(style);
            for(const group of this.getToolGroups()) {
                const heading=document.createElement('h4');heading.textContent=group.label;menu.append(heading);
                for(const tool of group.tools) {
                    const button=document.createElement('button');button.type='button';button.dataset.lineTool=tool.id;button.setAttribute('role','menuitem');
                    const icon=document.createElement('span');icon.className='LineEditor-ToolIcon';icon.textContent=tool.icon??'';
                    const label=document.createElement('span');label.textContent=tool.label;button.append(icon,label);
                    if(tool.shortcut){const shortcut=document.createElement('kbd');shortcut.textContent=tool.shortcut;button.append(shortcut);}
                    menu.append(button);
                }
            }
            a.toolMenu=menu;this.RefreshToolMenu();return menu;
        }
        private RefreshToolMenu():void {
            const menu=attachment(this).toolMenu;if(!menu)return;const state=stateOf(this);
            for(const button of menu.querySelectorAll<HTMLButtonElement>('[data-line-tool]')) {
                button.dataset.active=String(button.dataset.lineTool===state.activeTool);
                const id=button.dataset.lineTool;
                button.disabled=id==='line-weld'?state.selected.size<2:id==='line-connect'?state.selected.size!==2:id==='line-make-first'?state.selected.size!==1:
                    ['line-fillet','line-chamfer','line-scallop'].includes(id!)?state.anchors.length<3:
                    ['line-smooth','line-bezier','line-corner'].includes(id!)?state.selected.size===0:
                    ['line-outline','line-inline','line-close'].includes(id!)?state.anchors.length<3:false;
            }
        }
        /** Bind the standard toolbox's Line button; its original tool list is left intact. */
        public addToolsTo(tools:Interfaces.ToolsTarget,options:{button?:string}={}):this {
            const a=attachment(this);a.toolsCleanup?.();const buttonId=options.button??'line';
            const listener=((event:CustomEvent)=>{
                const id=event.detail?.tool?.id;if(!id)return;
                if(id.startsWith('line-')){this.useTool(id);return;}
                if(id==='direct')this.setSelectionLevel('points');
                else if(id==='curve'){this.setSelectionLevel('points');this.setMode('curve');}
                else if(['line','pen'].includes(id))this.setMode('pen');
                else if(['pencil','brush'].includes(id))this.setMode('freehand');
                else if(id==='eraser')this.setMode('delete');else this.setMode('select');
                stateOf(this).activeTool='';this.RefreshToolMenu();
            }) as EventListener;
            tools.addEventListener('arianna:tool',listener);
            if(!(tools instanceof HTMLElement)){a.toolsCleanup=()=>tools.removeEventListener('arianna:tool',listener);return this;}
            const menu=this.ToolMenu;document.body.append(menu);const control=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
            const clear=()=>{if(timer!==undefined)clearTimeout(timer);timer=undefined;};
            const button=()=>tools.querySelector<HTMLButtonElement>('[data-line-menu-host]');
            const decorate=()=>{
                const index=tools.tools?.findIndex(tool=>tool.id===buttonId)??-1;
                const host=tools.querySelectorAll<HTMLButtonElement>('.Tools2D-Tool')[index];
                if(host){host.dataset.lineMenuHost='';host.setAttribute('aria-haspopup','menu');host.setAttribute('aria-expanded',String(!menu.hidden));host.title='Line · Points / Edges / Spline';}
            };
            const close=(focus=false)=>{clear();menu.hidden=true;button()?.setAttribute('aria-expanded','false');if(focus)button()?.focus({preventScroll:true});};
            const open=()=>{
                clear();decorate();const host=button();if(!host)return;this.RefreshToolMenu();menu.hidden=false;
                const rect=host.getBoundingClientRect(),width=menu.offsetWidth,height=menu.offsetHeight;
                let left=rect.right+8;if(left+width>innerWidth-12)left=rect.left-width-8;
                menu.style.left=Math.max(12,Math.min(left,innerWidth-width-12))+'px';menu.style.top=Math.max(12,Math.min(rect.top,innerHeight-height-12))+'px';host.setAttribute('aria-expanded','true');
            };
            const scheduleClose=()=>{clear();timer=setTimeout(()=>close(),180);};
            tools.addEventListener('pointerover',event=>{if((event.target as Element).closest('[data-line-menu-host]'))open();},{signal:control.signal});
            tools.addEventListener('pointerout',event=>{if((event.target as Element).closest('[data-line-menu-host]'))scheduleClose();},{signal:control.signal});
            tools.addEventListener('focusin',event=>{if((event.target as Element).closest('[data-line-menu-host]'))open();},{signal:control.signal});
            tools.addEventListener('keydown',event=>{
                if((event.target as Element).closest('[data-line-menu-host]')&&['ArrowRight','ArrowDown'].includes(event.key)){event.preventDefault();open();menu.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();}
            },{signal:control.signal});
            menu.addEventListener('pointerenter',clear,{signal:control.signal});menu.addEventListener('pointerleave',scheduleClose,{signal:control.signal});
            menu.addEventListener('click',event=>{
                const selected=(event.target as Element).closest<HTMLButtonElement>('[data-line-tool]');if(!selected||selected.disabled)return;
                const id=selected.dataset.lineTool!;tools.setTool?.(buttonId);this.useTool(id);close();this._svg?.focus({preventScroll:true});
            },{signal:control.signal});
            menu.addEventListener('keydown',event=>{
                if(event.key==='Escape'){event.preventDefault();close(true);return;}
                if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;event.preventDefault();
                const buttons=[...menu.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')],index=buttons.indexOf(document.activeElement as HTMLButtonElement);
                const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[next]?.focus();
            },{signal:control.signal});
            document.addEventListener('pointerdown',event=>{const path=event.composedPath();if(!path.includes(menu)&&!path.includes(tools))close();},{signal:control.signal});
            document.addEventListener('keydown',event=>{if(event.key==='+'&&!(event.target as Element).closest('input,textarea,select,[contenteditable="true"]')&&(document.activeElement===this._svg||tools.contains(document.activeElement)||menu.contains(document.activeElement))){event.preventDefault();tools.setTool?.(buttonId);this.useTool('line-add');close();}},{signal:control.signal});
            const observer=new MutationObserver(decorate);observer.observe(tools,{childList:true,subtree:true});decorate();
            a.toolsCleanup=()=>{clear();observer.disconnect();control.abort();tools.removeEventListener('arianna:tool',listener);menu.remove();};return this;
        }

        /** Lazily-created, independent spline command window. Append it wherever required. */
        public get Window():HTMLElement
        {
            const a=attachment(this);if(a.window)return a.window;
            const panel=document.createElement('section');panel.className='LineEditorWindow';panel.dataset.dock='float';
            panel.innerHTML=`<header class="LineEditorWindow-Header">
  <span><b>Line</b><small>Spline Editor</small></span>
  <span class="LineEditorWindow-HeaderActions"><button type="button" data-window="dock" title="Float / dock">⇥</button><button type="button" data-window="minimize" title="Minimize">—</button></span>
</header>
<div class="LineEditorWindow-Body">
  <nav class="LineEditorWindow-Tree" aria-label="Line sub-objects">
    <button type="button" data-level="spline">▾ Line</button>
    <button type="button" data-level="points">　• Points</button>
    <button type="button" data-level="segments">　— Segments</button>
    <button type="button" data-level="spline">　⌁ Spline</button>
  </nav>
  <div class="LineEditorWindow-Commands">
    <div class="LineEditorWindow-Status" data-role="status"></div>
    <label class="LineEditorWindow-Amount">Amount <input data-role="amount" type="number" min="0" step="1" value="12"></label>
    <div class="LineEditorWindow-Group" data-group="topology">
      <strong>Topology</strong><span>
        <button type="button" data-action="add">Add</button><button type="button" data-action="weld">Weld</button>
        <button type="button" data-action="connect">Connect</button><button type="button" data-action="make-first">Make First</button>
      </span>
    </div>
    <div class="LineEditorWindow-Group" data-group="geometry">
      <strong>Geometry</strong><span>
        <button type="button" data-action="fillet">Fillet</button><button type="button" data-action="chamfer">Chamfer</button>
        <button type="button" data-action="scallop">Scallop</button><button type="button" data-action="smooth">Smooth</button>
        <button type="button" data-action="bezier">Bézier</button><button type="button" data-action="clear-corner">Clear corner</button>
      </span>
    </div>
    <div class="LineEditorWindow-Group" data-group="spline">
      <strong>Spline</strong><span><button type="button" data-action="outline">Outline</button><button type="button" data-action="inline">Inline</button><button type="button" data-action="close">Close</button><button type="button" data-action="delete">Delete</button></span>
    </div>
  </div>
</div>`;
            panel.style.cssText='position:absolute;z-index:35;top:50px;right:12px;width:318px;min-width:260px;min-height:190px;max-height:calc(100% - 64px);resize:both;overflow:auto;box-sizing:border-box;border:1px solid #111417;border-radius:8px;background:#292d31;color:#e4e8eb;box-shadow:0 18px 48px #0007;font:11px/1.35 system-ui,sans-serif';
            const style=document.createElement('style');style.textContent=`
.LineEditorWindow *{box-sizing:border-box}.LineEditorWindow-Header{height:36px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 7px 6px 10px;background:linear-gradient(180deg,#3a3f44,#2b3034);border-bottom:1px solid #111417;cursor:move;user-select:none}.LineEditorWindow-Header>span:first-child{display:grid}.LineEditorWindow-Header b{font-size:11px}.LineEditorWindow-Header small{color:#8f979f;font-size:8px}.LineEditorWindow button{appearance:none;border:1px solid #171a1d;border-radius:4px;background:linear-gradient(180deg,#42484d,#2e3337);color:#dce1e4;min-height:24px;padding:4px 7px;font:700 9px/1 system-ui;cursor:pointer}.LineEditorWindow button:hover,.LineEditorWindow button[data-active="true"]{border-color:#e40c88;color:#fff}.LineEditorWindow button:disabled{opacity:.35;cursor:not-allowed;border-color:#171a1d}.LineEditorWindow-HeaderActions{display:flex;gap:3px}.LineEditorWindow-HeaderActions button{min-width:25px}.LineEditorWindow-Body{display:grid;grid-template-columns:100px minmax(0,1fr);min-height:154px}.LineEditorWindow-Tree{padding:7px 5px;background:#202428;border-right:1px solid #111417;display:grid;align-content:start;gap:2px}.LineEditorWindow-Tree button{border-color:transparent;background:transparent;text-align:left;font-weight:600}.LineEditorWindow-Commands{min-width:0;padding:8px;display:grid;align-content:start;gap:8px}.LineEditorWindow-Status{color:#99a2aa;font:9px ui-monospace,monospace}.LineEditorWindow-Amount{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:6px;color:#9da6ad;font-size:9px}.LineEditorWindow-Amount input{min-width:0;width:100%;border:1px solid #454b50;border-radius:4px;background:#171b1e;color:#eef1f3;padding:4px;font:10px ui-monospace,monospace}.LineEditorWindow-Group{display:grid;gap:4px}.LineEditorWindow-Group strong{color:#8f989f;font-size:8px;text-transform:uppercase}.LineEditorWindow-Group span{display:flex;flex-wrap:wrap;gap:4px}.LineEditorWindow[data-minimized="true"]{width:210px!important;min-height:0!important;height:36px!important;resize:none;overflow:hidden}.LineEditorWindow[data-minimized="true"] .LineEditorWindow-Body{display:none}.LineEditorWindow[data-dock="left"]{left:12px;right:auto}.LineEditorWindow[data-dock="right"]{left:auto;right:12px}`;
            panel.prepend(style);
            panel.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(button=>button.onclick=()=>this.setSelectionLevel(button.dataset.level as Types.SelectionLevel));
            const amount=()=>Math.max(0,Number((panel.querySelector('[data-role="amount"]') as HTMLInputElement).value)||0);
            const actions:Record<string,()=>unknown>={add:()=>this.beginAdd(),weld:()=>this.weld(),connect:()=>this.connect(),'make-first':()=>this.makeFirst(),fillet:()=>this.editCorner('fillet',amount()),chamfer:()=>this.editCorner('chamfer',amount()),scallop:()=>this.editCorner('scallop',amount()),'clear-corner':()=>{this.setMode('select');this.clearCorner();},outline:()=>this.beginOffset(1),inline:()=>this.beginOffset(-1),smooth:()=>this.smooth(),bezier:()=>this.bezier(),close:()=>this.closed?this.openPath():this.closePath(),delete:()=>this.deleteSelection()};
            panel.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button=>button.onclick=()=>actions[button.dataset.action!]?.());
            panel.querySelector<HTMLInputElement>('[data-role="amount"]')!.oninput=()=>{
                const state=stateOf(this);state.cornerAmount=amount();
                if(state.cornerTool!=='none')this.setCorner(state.cornerTool,state.cornerAmount);
            };
            panel.querySelector<HTMLButtonElement>('[data-window="minimize"]')!.onclick=()=>{panel.dataset.minimized=String(panel.dataset.minimized!=='true');};
            panel.querySelector<HTMLButtonElement>('[data-window="dock"]')!.onclick=()=>{
                const next=panel.dataset.dock==='float'?'right':panel.dataset.dock==='right'?'left':'float';panel.dataset.dock=next;
                if(next==='float'){panel.style.left='';panel.style.right='12px';panel.style.top='50px';}
            };
            const header=panel.querySelector('.LineEditorWindow-Header') as HTMLElement;let pointer=-1,startX=0,startY=0,startLeft=0,startTop=0;
            header.addEventListener('pointerdown',event=>{if((event.target as Element).closest('button'))return;pointer=event.pointerId;startX=event.clientX;startY=event.clientY;startLeft=panel.offsetLeft;startTop=panel.offsetTop;panel.dataset.dock='float';panel.style.left=`${startLeft}px`;panel.style.right='auto';header.setPointerCapture(pointer);});
            header.addEventListener('pointermove',event=>{if(event.pointerId!==pointer)return;panel.style.left=`${Math.max(0,startLeft+event.clientX-startX)}px`;panel.style.top=`${Math.max(0,startTop+event.clientY-startY)}px`;});
            const release=(event:PointerEvent)=>{if(event.pointerId!==pointer)return;try{header.releasePointerCapture(pointer);}catch{}pointer=-1;};header.addEventListener('pointerup',release);header.addEventListener('pointercancel',release);
            a.window=panel;this.RefreshWindow();return panel;
        }

        private RefreshWindow():void
        {
            this.RefreshToolMenu();
            const panel=attachment(this).window;if(!panel)return;const state=stateOf(this),selected=this.SelectedIndices();
            panel.querySelectorAll<HTMLButtonElement>('[data-level]').forEach(button=>button.dataset.active=String(button.dataset.level===state.selectionLevel));
            const status=panel.querySelector('[data-role="status"]');if(status)status.textContent=`${state.anchors.length} points · ${selected.length} selected · ${this.closed?'closed':'open'}${state.cornerTool!=='none'?' · '+state.cornerTool+' · drag diamond':''}`;
            const close=panel.querySelector<HTMLButtonElement>('[data-action="close"]');if(close)close.textContent=this.closed?'Open':'Close';
            const segmentReady=state.selectedSegment!==null||state.hoveredSegment!==null;
            const enabled:Record<string,boolean>={outline:state.anchors.length>1,inline:state.anchors.length>1,'clear-corner':selected.length>0,add:state.anchors.length>1,weld:selected.length>1,connect:selected.length===2,'make-first':selected.length===1,fillet:state.anchors.length>2,chamfer:state.anchors.length>2,scallop:state.anchors.length>2,smooth:selected.length>0,bezier:selected.length>0,close:state.anchors.length>=3,delete:selected.length>0};
            panel.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button=>{button.disabled=!enabled[button.dataset.action!];button.dataset.active=String(button.dataset.action===state.cornerTool || (button.dataset.action==='bezier' && state.mode==='curve'));});
        }

        /** Apply a non-destructive corner treatment to explicit anchor indices. */
        public setCornerAt(indices:number|number[], type:Types.CornerType, amount=12): this
        {
            if(!['none','fillet','chamfer','scallop'].includes(type))
                throw new TypeError('Invalid corner type');
            const state=stateOf(this);
            const value=Math.max(0,Number(amount)||0);
            const changed:number[]=[];
            const targets=[...new Set(Array.isArray(indices)?indices:[indices])]
                .filter(index=>Number.isInteger(index)&&index>=0&&index<state.anchors.length);
            for(const index of targets)
            {
                const anchor=state.anchors[index];
                if(!anchor)continue;
                anchor.corner=type==='none'?undefined:{type,amount:value};
                changed.push(index);
            }
            this.Draw();this.EmitChange();
            this.dispatchEvent(new CustomEvent('arianna:line-corner-change',{
                bubbles:true,composed:true,
                detail:{type,amount:value,indices:changed,source:this}
            }));
            return this;
        }

        /** Apply a non-destructive corner treatment to the selected anchors. */
        public setCorner(type:Types.CornerType, amount=12): this
        {
            return this.setCornerAt(this.SelectedIndices(),type,amount);
        }

        /** Arm a corner operation; pointer down applies it and pointer up restores movement. */
        public editCorner(type:Exclude<Types.CornerType,'none'>,amount=12):this {
            if(!['fillet','chamfer','scallop'].includes(type))throw new TypeError('Invalid corner tool');
            this.setSelectionLevel('points');const state=stateOf(this);state.cornerTool=type;
            state.cornerAmount=Math.max(0,Number(amount)||0);
            this.Draw();this.RefreshWindow();return this;
        }

        private CornerDirection(index:number):Interfaces.Vec2|null {
            const state=stateOf(this),pi=this.PreviousIndex(index),ni=this.NextIndex(index);
            if(pi===null||ni===null)return null;
            const p=state.anchors[index].p,a=state.anchors[pi].p,b=state.anchors[ni].p;
            const la=Math.hypot(a.x-p.x,a.y-p.y),lb=Math.hypot(b.x-p.x,b.y-p.y);if(la<1e-8||lb<1e-8)return null;
            const x=(a.x-p.x)/la+(b.x-p.x)/lb,y=(a.y-p.y)/la+(b.y-p.y)/lb,l=Math.hypot(x,y);
            return l<1e-8?null:{x:x/l,y:y/l};
        }

        /** Flatten the actual rendered path, including Bézier segments and corner treatments.
         * Bounded adaptive subdivision: at most ten levels per cubic. */
        private FlattenPath(tolerance=.25):Interfaces.Vec2[][] {
            const tokens=this.toSVGPath().match(/[MLCHVZ]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi)??[];
            const paths:Interfaces.Vec2[][]=[];let path:Interfaces.Vec2[]=[],current={x:0,y:0},i=0;
            const number=()=>Number(tokens[i++]);const point=()=>({x:number(),y:number()});
            const push=(p:Interfaces.Vec2)=>{if(!path.length||Math.hypot(p.x-current.x,p.y-current.y)>1e-8)path.push(p);current=p;};
            const mix=(a:Interfaces.Vec2,b:Interfaces.Vec2)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
            const cubic=(a:Interfaces.Vec2,b:Interfaces.Vec2,c:Interfaces.Vec2,d:Interfaces.Vec2,depth=0):void=>{
                const chord=Math.hypot(d.x-a.x,d.y-a.y);
                const distance=(p:Interfaces.Vec2)=>chord>1e-8?Math.abs((d.x-a.x)*(a.y-p.y)-(a.x-p.x)*(d.y-a.y))/chord:Math.hypot(p.x-a.x,p.y-a.y);
                const excess=Math.hypot(b.x-a.x,b.y-a.y)+Math.hypot(c.x-b.x,c.y-b.y)+Math.hypot(d.x-c.x,d.y-c.y)-chord;
                if(depth>=10||(Math.max(distance(b),distance(c))<=tolerance&&excess<=tolerance)){push(d);return;}
                const ab=mix(a,b),bc=mix(b,c),cd=mix(c,d),abc=mix(ab,bc),bcd=mix(bc,cd),mid=mix(abc,bcd);
                cubic(a,ab,abc,mid,depth+1);cubic(mid,bcd,cd,d,depth+1);
            };
            while(i<tokens.length) {
                const command=tokens[i++].toUpperCase();
                if(command==='M'){if(path.length)paths.push(path);path=[];push(point());}
                else if(command==='L')push(point());
                else if(command==='H')push({x:number(),y:current.y});
                else if(command==='V')push({x:current.x,y:number()});
                else if(command==='C'){const a={...current},b=point(),c=point(),d=point();cubic(a,b,c,d);}
                else if(command==='Z'&&path.length>1){if(Math.hypot(current.x-path[0].x,current.y-path[0].y)<1e-8)path.pop();}
            }
            if(path.length)paths.push(path);return paths;
        }

        /** Return independent offset anchors without changing the source.
         * Closed paths: positive = outside, negative = inside, regardless of winding.
         * Open paths: positive = left of the directed path, negative = right.
         * Curved segments are sampled to tolerance; sharp joins use a limited miter/bevel.
         * Large offsets of concave/self-intersecting paths can self-intersect, as raw offsets do;
         * this method intentionally does not perform a Boolean union or delete loops. */
        public getOffsetAnchors(distance:number,tolerance=.25):Interfaces.Anchor[] {
            if(!Number.isFinite(distance)||!Number.isFinite(tolerance)||tolerance<=0)throw new TypeError('Invalid offset distance/tolerance');
            const paths=this.FlattenPath(tolerance),result:Interfaces.Anchor[]=[];
            // Offset only paths touched by the selection, or all paths if nothing is selected.
            const state=stateOf(this);let first=0;
            for(const points of paths) {
                const pathStart=first;let last=first;while(last+1<state.anchors.length&&!state.anchors[last+1].breakBefore)last++;
                const selected=!state.selected.size||[...state.selected].some(index=>index>=first&&index<=last);first=last+1;
                if(!selected||points.length<2)continue;
                const closed=this.PathClosed(pathStart)&&points.length>2,n=points.length;
                const area=closed?points.reduce((sum,p,index)=>{const q=points[(index+1)%n];return sum+p.x*q.y-q.x*p.y;},0):0;
                const shift=closed?distance*(area>=0?-1:1):distance;
                const edges:Array<{u:Interfaces.Vec2;n:Interfaces.Vec2}>=[];
                for(let j=0;j<(closed?n:n-1);j++) {
                    const a=points[j],b=points[(j+1)%n],l=Math.hypot(b.x-a.x,b.y-a.y)||1;
                    const u={x:(b.x-a.x)/l,y:(b.y-a.y)/l};edges.push({u,n:{x:-u.y,y:u.x}});
                }
                const outline:Interfaces.Vec2[]=[];
                for(let j=0;j<n;j++) {
                    const p=points[j],before=edges[(j-1+edges.length)%edges.length],after=edges[j%edges.length];
                    if(!closed&&(j===0||j===n-1)){const normal=j===0?after.n:before.n;outline.push({x:p.x+normal.x*shift,y:p.y+normal.y*shift});continue;}
                    const a={x:p.x+before.n.x*shift,y:p.y+before.n.y*shift},b={x:p.x+after.n.x*shift,y:p.y+after.n.y*shift};
                    const cross=before.u.x*after.u.y-before.u.y*after.u.x;
                    if(Math.abs(cross)<1e-8){outline.push(a);continue;}
                    const t=((b.x-a.x)*after.u.y-(b.y-a.y)*after.u.x)/cross;
                    const intersection={x:a.x+before.u.x*t,y:a.y+before.u.y*t};
                    if(Math.hypot(intersection.x-p.x,intersection.y-p.y)<=Math.max(1e-8,Math.abs(shift)*4))outline.push(intersection);
                    else outline.push(a,b);
                }
                outline.forEach((p,index)=>result.push({p,interpolation:'linear',mode:'corner',pathClosed:index===0?closed:undefined,breakBefore:index===0&&result.length>0}));
            }
            return result;
        }

        /** Add an offset as a new editable spline; never replace the source. */
        public offset(distance:number,tolerance=.25):this {
            if(!Number.isFinite(distance))throw new TypeError('Invalid offset distance');
            if(Math.abs(distance)<1e-8)return this;
            const copy=this.getOffsetAnchors(distance,tolerance);if(!copy.length)return this;
            const state=stateOf(this),first=state.anchors.length;
            const roots=[...new Set((state.selected.size?[...state.selected]:state.anchors.map((_,i)=>i)).map(i=>this.PathStart(i)))];
            if(roots.length===1)copy[0].offsetSource={anchors:structuredClone(this.PathIndices(roots[0]).map(i=>state.anchors[i])),distance};
            copy[0].breakBefore=first>0;
            this.setMode('select');state.anchors.push(...copy);state.selected=new Set(copy.map((_,index)=>first+index));state.selectionLevel='spline';
            this.Draw();this.EmitChange();return this;
        }
        public outline(distance=12):this{return this.offset(Math.abs(distance));}
        public inline(distance=12):this{return this.offset(-Math.abs(distance));}

        /** Arm the midpoint offset glyph without creating geometry until pointer down. */
        public beginOffset(direction:1|-1=1):this {
            if(direction!==1&&direction!==-1)throw new TypeError('Invalid offset direction');
            this.setSelectionLevel('spline');this.setMode('select');stateOf(this).offsetTool=direction;this.Draw();return this;
        }
        private FinishGesture():void {
            const state=stateOf(this);state.drag=null;state.cornerTool='none';state.offsetTool=undefined;
            state.activeTool='';this.setMode('select');this.Cursor('Default');this.RefreshToolMenu();
        }
        private OffsetGlyphs():Array<{root:number;segment:number;point:Interfaces.Vec2}> {
            const state=stateOf(this);if(state.selectionLevel!=='spline')return[];
            const roots=[...new Set([...state.selected].map(i=>this.PathStart(i)))];
            return roots.filter(root=>state.offsetTool!==undefined||!!state.anchors[root]?.offsetSource).flatMap(root=>
                this.PathIndices(root).filter(i=>this.NextIndex(i)!==null).map(segment=>({root,segment,point:this.SegmentPoint(segment,.5)!})));
        }
        private StartOffsetGesture(point:Interfaces.Vec2,event:PointerEvent):boolean {
            const state=stateOf(this),glyph=this.OffsetGlyphs().find(g=>Math.hypot(g.point.x-point.x,g.point.y-point.y)<=this.HitRadius(7));
            if(!glyph)return false;
            const data=state.anchors[glyph.root].offsetSource;
            const source=structuredClone(data?.anchors??this.PathIndices(glyph.root).map(i=>state.anchors[i]));
            source[0].breakBefore=false;source[0].pathClosed??=this.PathClosed(glyph.root);for(const a of source)delete a.offsetSource;
            const origin=structuredClone(state.anchors);
            state.drag={kind:'offset',pointerId:event.pointerId,start:point,current:point,origin,
                offset:{source,distance:data?.distance??0,first:data?glyph.root:origin.length,count:data?this.PathIndices(glyph.root).length:0,selection:[...state.selected]}};
            event.preventDefault();this._svg!.setPointerCapture(event.pointerId);this.Cursor('Move');return true;
        }
        private UpdateOffsetGesture(point:Interfaces.Vec2):void {
            const state=stateOf(this),drag=state.drag!,data=drag.offset!,saved=state.anchors,selected=state.selected;
            const distance=data.distance+(drag.start.y-point.y);
            let copy:Interfaces.Anchor[];
            try {state.anchors=structuredClone(data.source);state.selected=new Set(state.anchors.map((_,i)=>i));copy=this.getOffsetAnchors(distance);}
            finally {state.anchors=saved;state.selected=selected;}
            if(!copy.length)return;
            state.anchors=structuredClone(drag.origin!);copy[0].breakBefore=data.first>0;
            copy[0].offsetSource={anchors:structuredClone(data.source),distance};
            state.anchors.splice(data.first,data.count,...copy);state.selected=new Set(copy.map((_,i)=>data.first+i));
            state.selectionLevel='spline';this.Draw();
        }
        /** Keep a derived offset's reference geometry aligned when the result is moved. */
        private TranslateOffsetSources(origin:Interfaces.Anchor[]):void {
            const state=stateOf(this);
            for(const index of new Set(this.SelectedIndices().map(i=>this.PathStart(i)))) {
                const old=origin[index],now=state.anchors[index];if(!old?.offsetSource||!now?.offsetSource)continue;
                const dx=now.p.x-old.p.x,dy=now.p.y-old.p.y;
                const indices=this.PathIndices(index);
                if(!indices.every(i=>Math.abs(state.anchors[i].p.x-origin[i].p.x-dx)<1e-7&&Math.abs(state.anchors[i].p.y-origin[i].p.y-dy)<1e-7)){delete now.offsetSource;continue;}
                now.offsetSource=structuredClone(old.offsetSource);
                for(const anchor of now.offsetSource.anchors){anchor.p.x+=dx;anchor.p.y+=dy;}
            }
        }

        /** Round the selected corners. Amount is the trim distance in canvas units. */
        public fillet(amount=12): this { return this.setCorner('fillet',amount); }

        /** Cut the selected corners with a straight bevel. */
        public chamfer(amount=12): this { return this.setCorner('chamfer',amount); }

        /** Create an inward/concave rounded corner on the selected anchors. */
        public scallop(amount=12): this { return this.setCorner('scallop',amount); }

        public clearCorner(): this { return this.setCorner('none',0); }

        public closePath():this {
            const state=stateOf(this),index=state.selected.values().next().value??state.penStart??state.anchors.length-1;
            const first=this.PathStart(index),last=this.PathEnd(index);
            if(last-first>=2){this.FreezePathClosures();state.anchors[first].pathClosed=true;state.preview=null;state.penStart=null;state.penSeedCreated=false;this.Draw();this.EmitChange();}
            return this;
        }
        public openPath():this {
            const state=stateOf(this),index=state.selected.values().next().value??0;
            this.FreezePathClosures();if(state.anchors.length)state.anchors[this.PathStart(index)].pathClosed=false;
            this.Draw();this.EmitChange();return this;
        }

        public clear(): this
        {
            const state = stateOf(this);
            state.anchors = [];
            state.selected.clear();
            state.preview = null;
            state.hovered = null;
            state.hoveredSegment = null;
            state.selectedSegment = null;
            state.snapTarget = null;
            state.penStart = null;
            state.penSeedCreated = false;
            state.drag = null;
            state.marquee = null;
            this.removeAttribute('closed');
            this.Draw();

            this.EmitChange();

            return this;
        }

        private FilterAnchors(remove:Set<number>):Interfaces.Anchor[] {
            const state=stateOf(this),result:Interfaces.Anchor[]=[];
            for(let first=0;first<state.anchors.length;) {
                const last=this.PathEnd(first),closed=this.PathClosed(first),path=state.anchors.slice(first,last+1).filter((_,i)=>!remove.has(first+i)).map(anchor=>({...anchor,breakBefore:false,pathClosed:undefined}));
                if(path.length){path[0].breakBefore=result.length>0;path[0].pathClosed=closed&&path.length>=3;result.push(...path);}first=last+1;
            }return result;
        }

        public deleteSelection(): this
        {
            const state = stateOf(this);
            const remove = state.selected;
            if(!remove.size) return this;

            state.anchors = this.FilterAnchors(remove);
            state.selected.clear();

            if(state.anchors.length)
                state.selected.add(Math.min(state.anchors.length - 1, 0));

            if(state.anchors.length < 3)
                this.removeAttribute('closed');

            this.Draw();


            this.EmitChange();
            return this;
        }

        public addAnchor(anchor: Interfaces.Anchor): this
        {
            const state = stateOf(this);
            const copy = structuredClone(anchor);
            copy.interpolation ??= state.interpolation;
            copy.mode ??= copy.interpolation === 'bezier' ? 'smooth' : 'corner';

            state.anchors.push(copy);
            state.selected = new Set([state.anchors.length - 1]);

            this.Draw();


            this.EmitChange();
            return this;
        }

        public removeAnchor(index: number): this
        {
            const state = stateOf(this);
            state.anchors = this.FilterAnchors(new Set([index]));

            const next = new Set<number>();
            for(const selected of state.selected)
            {
                if(selected < index) next.add(selected);
                else if(selected > index) next.add(selected - 1);
            }
            state.selected = next;

            if(state.anchors.length < 3)
                this.removeAttribute('closed');

            this.Draw();


            this.EmitChange();
            return this;
        }

        public setAnchors(value: Interfaces.Anchor[]): this
        {
            this.anchors = value;
            this.EmitChange();
            return this;
        }

        public getAnchors(): Interfaces.Anchor[] { return this.anchors; }

        private NextIndex(index:number):number|null
        {
            const anchors=stateOf(this).anchors,n=anchors.length;if(!n)return null;
            if(index<n-1&&!anchors[index+1].breakBefore)return index+1;
            if(!this.PathClosed(index))return null;
            let first=index;while(first>0&&!anchors[first].breakBefore)first--;
            return first===index?null:first;
        }

        private PreviousIndex(index:number):number|null
        {
            const anchors=stateOf(this).anchors,n=anchors.length;if(!n)return null;
            if(index>0&&!anchors[index].breakBefore)return index-1;
            if(!this.PathClosed(index))return null;
            let last=index;while(last<n-1&&!anchors[last+1].breakBefore)last++;
            return last===index?null:last;
        }

        private DefaultHandle(index:number,kind:'in'|'out'):Interfaces.Vec2
        {
            const state=stateOf(this),anchor=state.anchors[index];
            if(!anchor)return{x:0,y:0};
            if(kind==='out')
            {
                const ni=this.NextIndex(index);if(ni===null)return{x:0,y:0};
                const next=state.anchors[ni];return{x:(next.p.x-anchor.p.x)/3,y:(next.p.y-anchor.p.y)/3};
            }
            const pi=this.PreviousIndex(index);if(pi===null)return{x:0,y:0};
            const prev=state.anchors[pi];return{x:(prev.p.x-anchor.p.x)/3,y:(prev.p.y-anchor.p.y)/3};
        }

        /** Parameter at a travelled trim distance along the underlying segment. */
        private TrimParameter(index:number,distance:number,fromEnd:boolean):number {
            const sampleCount=64;let previous=this.SegmentPoint(index,fromEnd?1:0)!,travelled=0;
            for(let k=1;k<=sampleCount;k++) {
                const t=fromEnd?1-k/sampleCount:k/sampleCount,p=this.SegmentPoint(index,t)!;
                const length=Math.hypot(p.x-previous.x,p.y-previous.y);
                if(travelled+length>=distance) {
                    const ratio=length>1e-8?(distance-travelled)/length:0;
                    return fromEnd?1-(k-1+ratio)/sampleCount:(k-1+ratio)/sampleCount;
                }
                travelled+=length;previous=p;
            }
            return fromEnd?0:1;
        }

        private CornerGeometry(index:number):{entry:Interfaces.Vec2;exit:Interfaces.Vec2;type:Types.CornerType;c1?:Interfaces.Vec2;c2?:Interfaces.Vec2;entryT?:number;exitT?:number}|null
        {
            const state=stateOf(this),anchor=state.anchors[index],corner=anchor?.corner;
            if(!anchor||!corner||corner.type==='none'||corner.amount<=0)return null;
            const pi=this.PreviousIndex(index),ni=this.NextIndex(index);if(pi===null||ni===null)return null;
            const prev=state.anchors[pi].p,next=state.anchors[ni].p,b=anchor.p;
            const v1={x:prev.x-b.x,y:prev.y-b.y},v2={x:next.x-b.x,y:next.y-b.y};
            const l1=Math.hypot(v1.x,v1.y),l2=Math.hypot(v2.x,v2.y);if(l1<1e-6||l2<1e-6)return null;
            const u1={x:v1.x/l1,y:v1.y/l1},u2={x:v2.x/l2,y:v2.y/l2};
            const d=Math.min(corner.amount,l1*.45,l2*.45);
            const entryT=this.TrimParameter(pi,d,true),exitT=this.TrimParameter(index,d,false);
            const entry=this.SegmentPoint(pi,entryT)!,exit=this.SegmentPoint(index,exitT)!;
            const parameters={entryT,exitT};
            if(corner.type==='chamfer')return{entry,exit,...parameters,type:'chamfer'};
            const theta=Math.acos(clamp(u1.x*u2.x+u1.y*u2.y,-1,1));
            if(theta<1e-5 || Math.PI-theta<1e-5)return null;
            if(corner.type==='fillet') {
                const radius=d*Math.tan(theta/2),h=4/3*radius*Math.tan((Math.PI-theta)/4);
                const tangent=(segment:number,t:number)=>{const a=this.SegmentPoint(segment,Math.max(0,t-.0001))!,b=this.SegmentPoint(segment,Math.min(1,t+.0001))!,l=Math.hypot(b.x-a.x,b.y-a.y)||1;return{x:(b.x-a.x)/l,y:(b.y-a.y)/l};};
                const incoming=tangent(pi,entryT),outgoing=tangent(index,exitT);
                return{entry,exit,...parameters,type:'fillet',c1:{x:entry.x+incoming.x*h,y:entry.y+incoming.y*h},c2:{x:exit.x-outgoing.x*h,y:exit.y-outgoing.y*h}};
            }
            // Concave circular cut, centred on the original vertex. Unlike an
            // overshooting fillet this cannot loop outside the corner.
            const direction=Math.sign(u1.x*u2.y-u1.y*u2.x)||1;
            const h=4/3*d*Math.tan(theta/4);
            return{entry,exit,...parameters,type:'scallop',
                c1:{x:entry.x-u1.y*direction*h,y:entry.y+u1.x*direction*h},
                c2:{x:exit.x+u2.y*direction*h,y:exit.y-u2.x*direction*h}};
        }

        public toSVGPath(): string
        {
            const anchors=stateOf(this).anchors;if(!anchors.length)return '';
            const geometry=new Map<number,ReturnType<LineEditor['CornerGeometry']>>();
            const corner=(i:number)=>{if(!geometry.has(i))geometry.set(i,this.CornerGeometry(i));return geometry.get(i)!;};
            const absoluteControl=(anchor:Interfaces.Anchor,index:number,kind:'in'|'out')=>{const off=anchor[kind]??this.DefaultHandle(index,kind);return{x:anchor.p.x+off.x,y:anchor.p.y+off.y};};
            const segment=(fromIndex:number,start:Interfaces.Vec2,end:Interfaces.Vec2,toIndex:number):string=>
            {
                const from=anchors[fromIndex],to=anchors[toIndex];
                const interpolation=from.interpolation??'linear';
                if(interpolation==='constant')return ` H ${end.x} V ${end.y}`;
                if(interpolation==='linear')return ` L ${end.x} ${end.y}`;
                const mix=(a:Interfaces.Vec2,b:Interfaces.Vec2,t:number)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
                const split=(points:Interfaces.Vec2[],t:number):[Interfaces.Vec2[],Interfaces.Vec2[]]=>{
                    const [a,b,c,d]=points,ab=mix(a,b,t),bc=mix(b,c,t),cd=mix(c,d,t),abc=mix(ab,bc,t),bcd=mix(bc,cd,t),middle=mix(abc,bcd,t);
                    return [[a,ab,abc,middle],[middle,bcd,cd,d]];
                };
                let points=[from.p,absoluteControl(from,fromIndex,'out'),absoluteControl(to,toIndex,'in'),to.p];
                const begin=corner(fromIndex)?.exitT??0,finish=corner(toIndex)?.entryT??1;
                if(begin>0)points=split(points,begin)[1];
                if(finish<1)points=split(points,clamp((finish-begin)/(1-begin),0,1))[0];
                const c1=points[1],c2=points[2];
                return ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
            };
            const drawCorner=(g:ReturnType<typeof corner>):string=>{if(!g)return '';if(g.type==='chamfer')return ` L ${g.exit.x} ${g.exit.y}`;return ` C ${g.c1!.x} ${g.c1!.y}, ${g.c2!.x} ${g.c2!.y}, ${g.exit.x} ${g.exit.y}`;};

            let d='';
            for(let first=0;first<anchors.length;) {
                let last=first;while(last+1<anchors.length&&!anchors[last+1].breakBefore)last++;
                const start=corner(first)?.exit??anchors[first].p;
                let current={...start};d+=`M ${current.x} ${current.y}`;
                for(let i=first;i<last;i++) {
                    const next=i+1,g=corner(next),end=g?.entry??anchors[next].p;
                    d+=segment(i,current,end,next);current={...end};
                    if(g){d+=drawCorner(g);current={...g.exit};}
                }
                if(this.PathClosed(first)&&last-first>=2) {
                    const g=corner(first),end=g?.entry??anchors[first].p;
                    d+=segment(last,current,end,first)+drawCorner(g)+' Z';
                }
                first=last+1;
            }
            return d;
        }


        private Point(event: PointerEvent): Interfaces.Vec2
        {
            const svg = this._svg!;
            const matrix=svg.getScreenCTM();
            if(matrix) {
                const point=svg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;
                const local=point.matrixTransform(matrix.inverse()),box=svg.viewBox.baseVal;
                return{x:clamp(local.x,box.x,box.x+box.width),y:clamp(local.y,box.y,box.y+box.height)};
            }
            const rect=svg.getBoundingClientRect(),bounds=this.Bounds();
            return{x:clamp((event.clientX-rect.left)/Math.max(1,rect.width)*bounds.width,0,bounds.width),
                y:clamp((event.clientY-rect.top)/Math.max(1,rect.height)*bounds.height,0,bounds.height)};
        }

        private SelectedIndices(): number[]
        {
            return [...stateOf(this).selected].sort((a,b)=>a-b);
        }

        private NearestAnchor(point: Interfaces.Vec2, radius=9): number
        {
            const anchors = stateOf(this).anchors;
            let found = -1;
            let best = radius * radius;

            anchors.forEach((anchor,index) =>
            {
                const dx = point.x - anchor.p.x;
                const dy = point.y - anchor.p.y;
                const distance = dx*dx + dy*dy;
                if(distance <= best)
                {
                    best = distance;
                    found = index;
                }
            });
            return found;
        }

        /** Sub-object glyphs are exclusively for point editing, never drawing or spline selection. */
        private PointsVisible():boolean {
            const state=stateOf(this);
            return state.selectionLevel==='points' && state.mode!=='pen' && state.mode!=='freehand';
        }

        private NearestHandle(point: Interfaces.Vec2, radius=8):
            { index:number; kind:'in'|'out' } | null
        {
            const state = stateOf(this);
            if(!this.PointsVisible()||state.mode==='delete')return null;

            let found: {index:number;kind:'in'|'out'} | null = null;
            let best = radius * radius;

            for(const index of this.SelectedIndices())
            {
                const anchor = state.anchors[index];
                if(!anchor || ((anchor.interpolation??'linear')!=='bezier'&&!anchor.in&&!anchor.out))continue;

                for(const kind of ['in','out'] as const)
                {
                    if(kind==='in'&&this.PreviousIndex(index)===null)continue;
                    if(kind==='out'&&this.NextIndex(index)===null)continue;
                    const offset = anchor[kind]??this.DefaultHandle(index,kind);

                    const x = anchor.p.x + offset.x;
                    const y = anchor.p.y + offset.y;
                    const dx = point.x - x;
                    const dy = point.y - y;
                    const distance = dx*dx + dy*dy;

                    if(distance <= best)
                    {
                        best = distance;
                        found = { index, kind };
                    }
                }
            }
            return found;
        }

        private HitRadius(pixels:number):number {
            const matrix=this._svg?.getScreenCTM();
            return matrix ? pixels / Math.max(.01,Math.hypot(matrix.a,matrix.b)) : pixels;
        }

        private LineIntersection(a:Interfaces.Vec2,b:Interfaces.Vec2,c:Interfaces.Vec2,d:Interfaces.Vec2):Interfaces.Vec2|null
        {
            const r={x:b.x-a.x,y:b.y-a.y},s={x:d.x-c.x,y:d.y-c.y},cross=(u:Interfaces.Vec2,v:Interfaces.Vec2)=>u.x*v.y-u.y*v.x;
            const denominator=cross(r,s);if(Math.abs(denominator)<1e-7)return null;
            const ca={x:c.x-a.x,y:c.y-a.y},t=cross(ca,s)/denominator,u=cross(ca,r)/denominator;
            return t>=0&&t<=1&&u>=0&&u<=1?{x:a.x+t*r.x,y:a.y+t*r.y}:null;
        }

        private SnapTranslation(origin:Interfaces.Anchor[],moving:number[],dx:number,dy:number):{dx:number;dy:number;target:Interfaces.Vec2|null} {
            const excluded=new Set(moving);let best=Infinity,target:Interfaces.Vec2|null=null,adjustX=0,adjustY=0;
            for(const index of moving){const p=origin[index]?.p;if(!p)continue;const hit=this.FindSnap({x:p.x+dx,y:p.y+dy},excluded);if(!hit)continue;
                const x=hit.point.x-p.x-dx,y=hit.point.y-p.y-dy,d=Math.hypot(x,y);if(d<best){best=d;adjustX=x;adjustY=y;target=hit.point;}}
            return{dx:dx+adjustX,dy:dy+adjustY,target};
        }

        private SegmentPoint(index:number,t:number):Interfaces.Vec2|null
        {
            const anchors=stateOf(this).anchors,j=this.NextIndex(index);
            if(j===null)return null;
            const a=anchors[index],b=anchors[j];
            if(!a||!b)return null;
            if((a.interpolation??'linear')==='constant')
            {
                const horizontal=Math.abs(b.p.x-a.p.x),vertical=Math.abs(b.p.y-a.p.y),distance=t*(horizontal+vertical);
                return distance<=horizontal
                    ? {x:a.p.x+Math.sign(b.p.x-a.p.x)*distance,y:a.p.y}
                    : {x:b.p.x,y:a.p.y+Math.sign(b.p.y-a.p.y)*(distance-horizontal)};
            }
            if((a.interpolation??'linear')!=='bezier')
                return{x:a.p.x+(b.p.x-a.p.x)*t,y:a.p.y+(b.p.y-a.p.y)*t};
            const out=a.out??this.DefaultHandle(index,'out'),incoming=b.in??this.DefaultHandle(j,'in'),u=1-t;
            return{
                x:u*u*u*a.p.x+3*u*u*t*(a.p.x+out.x)+3*u*t*t*(b.p.x+incoming.x)+t*t*t*b.p.x,
                y:u*u*u*a.p.y+3*u*u*t*(a.p.y+out.y)+3*u*t*t*(b.p.y+incoming.y)+t*t*t*b.p.y
            };
        }
        private Hit(point:Interfaces.Vec2):{kind:'connect'|'anchor'|'bend'|'segment';index:number}|null {
            const state=stateOf(this), anchors=state.anchors, radius=this.HitRadius(10);
            const index=this.PointsVisible()||state.mode==='pen'?this.NearestAnchor(point,radius):-1;
            if(index>=0) {
                const p=anchors[index].p;
                const centre=Math.hypot(point.x-p.x,point.y-p.y)<=this.HitRadius(4);
                return {kind:centre&&state.mode==='pen'&&(this.PreviousIndex(index)===null||this.NextIndex(index)===null)?'connect':'anchor',index};
            }
            let best=radius, result:{kind:'bend'|'segment';index:number}|null=null;
            const count=anchors.length;
            for(let i=0;i<count;i++) {
                const j=this.NextIndex(i);if(j===null)continue;
                const at=(t:number):Interfaces.Vec2=>this.SegmentPoint(i,t)!;
                const middle=at(.5); let previous=at(0);
                for(let step=1;step<=64;step++) {
                    const current=at(step/64),vx=current.x-previous.x,vy=current.y-previous.y;
                    const t=clamp(((point.x-previous.x)*vx+(point.y-previous.y)*vy)/(vx*vx+vy*vy||1),0,1);
                    const distance=Math.hypot(point.x-previous.x-t*vx,point.y-previous.y-t*vy);
                    if(distance<best){best=distance;result={kind:this.PointsVisible()&&state.mode==='curve'&&Math.hypot(point.x-middle.x,point.y-middle.y)<=radius?'bend':'segment',index:i};}
                    previous=current;
                }
            }
            return result;
        }

        private OnPointerDown(event: PointerEvent): void
        {
            if(event.button !== 0 || !this._svg) return;
            this._svg.focus({preventScroll:true});

            const state = stateOf(this);
            const raw=this.Point(event);
            const point=state.mode==='pen'?this.SnapDrawing(raw):raw;
            const target = event.target as Element;
            if(state.mode==='add' && this.NearestAnchor(point,this.HitRadius(10))<0 && !this.NearestHandle(point,this.HitRadius(8))){
                event.preventDefault();this.addPointAt(point);this.Cursor('Default');return;
            }


            const anchorNode = target.closest?.('.LineEditor-Anchor') as SVGCircleElement | null;
            const handleNode = target.closest?.('.LineEditor-Handle') as SVGCircleElement | null;
            const nearest = anchorNode
                ? Number(anchorNode.dataset.index)
                : (this.PointsVisible()||state.mode==='pen'?this.NearestAnchor(point, this.HitRadius(10)):-1);

            const tangent=handleNode?{index:Number(handleNode.dataset.index),kind:handleNode.dataset.kind==='in'?'in' as const:'out' as const}:this.NearestHandle(point,this.HitRadius(8));
            if(tangent && state.mode!=='delete' && state.mode!=='freehand') {
                event.preventDefault();state.drag={kind:tangent.kind==='in'?'handle-in':'handle-out',pointerId:event.pointerId,start:point,current:point,anchorIndex:tangent.index,origin:structuredClone(state.anchors)};
                this._svg.setPointerCapture(event.pointerId);this.Cursor('Move');return;
            }
            const cornerNode=target.closest?.('.LineEditor-CornerHandle') as SVGElement|null;
            if((state.cornerTool!=='none' && nearest>=0) || cornerNode) {
                const index=cornerNode?Number(cornerNode.dataset.index):nearest;
                if(this.PreviousIndex(index)!==null&&this.NextIndex(index)!==null) {
                    event.preventDefault();if(!state.selected.has(index))state.selected=new Set([index]);
                    const origin=structuredClone(state.anchors);
                    if(state.cornerTool==='none')state.cornerAmount=state.anchors[index].corner?.amount??state.cornerAmount;
                    state.cornerTool=state.cornerTool!=='none'?state.cornerTool:state.anchors[index].corner?.type??'none';
                    this.setCorner(state.cornerTool,state.cornerAmount);
                    state.drag={kind:'corner',pointerId:event.pointerId,start:point,current:point,anchorIndex:index,origin};
                    this._svg.setPointerCapture(event.pointerId);this.Cursor('Move');return;
                }
            }
            if(this.StartOffsetGesture(point,event))return;
            const hit = this.Hit(point);
            state.hoveredSegment=hit?.kind==='bend'?hit.index:null;
            if(state.mode==='freehand') {
                event.preventDefault();
                this.FreezePathClosures();
                const origin=structuredClone(state.anchors);
                state.anchors.push({p:point,breakBefore:state.anchors.length>0,pathClosed:false,interpolation:'linear',mode:'corner'});
                state.selected=new Set([state.anchors.length-1]);
                state.drag={kind:'freehand',pointerId:event.pointerId,start:point,current:point,origin};
                this.removeAttribute('closed');this._svg.setPointerCapture(event.pointerId);
                this.Cursor('Draw');this.Draw();return;
            }
            if((state.mode==='pen'&&(state.penStart!==null||!hit)) || (hit?.kind==='connect'&&state.mode==='pen')) {
                state.penPointer={id:event.pointerId,start:point,commit:state.penStart!==null};
                this._svg.setPointerCapture(event.pointerId);
            }
            // The centre of an OPEN endpoint arms one additional segment. Its rim moves the point.
            if(state.penStart === null && hit?.kind === 'connect' && state.mode === 'pen') {
                event.preventDefault();
                state.mode = 'pen'; this.setAttribute('mode','pen');
                state.penStart = hit.index; state.penDirection = this.PreviousIndex(hit.index)===null && this.NextIndex(hit.index)!==null ? 'prepend' : 'append';
                state.penSeedCreated = false; state.preview = {...state.anchors[hit.index].p};
                state.selected = new Set([hit.index]);
                this.Draw();
                this.Cursor('Draw'); return;
            }
            // Guided drawing keeps its tool selected while existing geometry stays editable.
            if(state.mode === 'pen' && (state.penStart!==null || !hit))
            {
                event.preventDefault();
                this.FreezePathClosures();

                if(state.penStart === null)
                {
                    /*
                     * Continue only when the user explicitly presses an OPEN endpoint.
                     * Previous selection alone never arms Pen.
                     */
                    if(nearest >= 0 && (this.PreviousIndex(nearest)===null||this.NextIndex(nearest)===null))
                    {
                        state.selected = new Set([nearest]);
                        state.penStart = nearest;
                        state.penDirection =
                            this.PreviousIndex(nearest)===null && this.NextIndex(nearest)!==null
                                ? 'prepend'
                                : 'append';
                        state.penSeedCreated = false;
                        state.preview = point;

                        this.Draw();


                        return;
                    }

                    // Preserve earlier paths; start a disconnected, editable path.
                    const index=state.anchors.length;
                    state.anchors.push({p:point,breakBefore:index>0,pathClosed:false,interpolation:'linear',mode:'corner'});
                    state.selected = new Set([index]);
                    state.penStart = index;
                    state.penDirection = 'append';
                    state.penSeedCreated = true;
                    state.preview = point;
                    this.removeAttribute('closed');

                    this.Draw();


                    this.EmitChange();
                    return;
                }

                // The second press arms the commit; release finishes this cycle.
                return;
            }


            if(nearest >= 0)
            {
                event.preventDefault();
                const index = nearest;

                if(state.mode === 'delete')
                {
                    this.removeAnchor(index);
                    return;
                }

                if(event.shiftKey)
                {
                    if(state.selected.has(index)) state.selected.delete(index);
                    else state.selected.add(index);
                }
                else
                {
                    state.selected = state.selectionLevel==='spline'
                        ? new Set(this.PathIndices(index))
                        : new Set([index]);
                }
                state.selectedSegment=null;

                const origin = structuredClone(state.anchors);
                state.drag = {
                    kind:'anchor',
                    pointerId:event.pointerId,
                    start:point,
                    current:point,
                    anchorIndex:index,
                    origin
                };

                this._svg.setPointerCapture(event.pointerId);
                this.Draw();


                return;
            }

            if(hit && (hit.kind === 'bend' || hit.kind === 'segment') && state.mode !== 'delete') {
                event.preventDefault();
                const index=hit.index, next=this.NextIndex(index)!;
                state.selectedSegment=index;
                state.selected=state.selectionLevel==='spline'
                    ? new Set(this.PathIndices(index))
                    : new Set([index,next]);
                const origin=structuredClone(state.anchors);
                if(hit.kind==='bend') {
                    // Store the two original tangents once. At t=.5 each contributes 3/8.
                    origin[index].out ??= this.DefaultHandle(index,'out');
                    origin[next].in ??= this.DefaultHandle(next,'in');
                }
                state.drag={kind:hit.kind,pointerId:event.pointerId,start:point,current:point,origin,segmentIndex:index};
                this._svg.setPointerCapture(event.pointerId);
                this.Cursor(hit.kind==='bend'?'Curve':'Move');
                this.Draw();return;
            }

            /* Blank-space drag = marquee selection. In Delete mode it is delete-rectangle. */
            event.preventDefault();
            if(!event.shiftKey && state.mode !== 'delete')
                state.selected.clear();

            state.hovered = null;
            state.selectedSegment = null;
            state.marquee = { a:point, b:point };
            state.drag = {
                kind:'marquee',
                pointerId:event.pointerId,
                start:point,
                current:point,
                additive:event.shiftKey
            };
            this._svg.setPointerCapture(event.pointerId);
            this.Draw();


        }

        private ReversePath(path:Interfaces.Anchor[]):Interfaces.Anchor[] {
            return [...path].reverse().map((anchor,index)=>({...anchor,
                in:anchor.out?{...anchor.out}:undefined,out:anchor.in?{...anchor.in}:undefined,
                interpolation:path[path.length-2-index]?.interpolation??'linear',
                breakBefore:false,pathClosed:index===0?path[0].pathClosed:undefined}));
        }
        private CommitPen(raw:Interfaces.Vec2):void {
            const state=stateOf(this),startIndex=state.penStart;if(startIndex===null)return;
            const start=state.anchors[startIndex];if(!start)return;
            const point=this.SnapDrawing(raw),hit=state.snapHit;
            if(Math.hypot(point.x-start.p.x,point.y-start.p.y)<this.HitRadius(2))return;
            const first=this.PathStart(startIndex),last=this.PathEnd(startIndex);
            const finish=()=>{state.penStart=null;state.preview=null;state.penSeedCreated=false;state.snapTarget=null;state.snapHit=null;this.Cursor('Default');this.Draw();this.EmitChange();};
            if(hit?.kind==='vertex'&&hit.index!==undefined) {
                const target=hit.index;
                const opposite=state.penDirection==='prepend'?last:first;
                if(this.Snap.Close&&target===opposite&&last-first>=2) {
                    this.FreezePathClosures();state.anchors[first].pathClosed=true;state.selected=new Set([first]);finish();return;
                }
                if(this.Snap.Connect&&this.PathStart(target)!==first&&!this.PathClosed(target)&&
                    (this.PreviousIndex(target)===null||this.NextIndex(target)===null)) {
                    this.FreezePathClosures();const targetFirst=this.PathStart(target),targetLast=this.PathEnd(target);
                    let source=structuredClone(state.anchors.slice(first,last+1)),destination=structuredClone(state.anchors.slice(targetFirst,targetLast+1));
                    if(state.penDirection==='prepend')source=this.ReversePath(source);
                    if(target===targetLast)destination=this.ReversePath(destination);
                    source[source.length-1].interpolation='linear';source[source.length-1].out=undefined;
                    destination[0].breakBefore=false;delete destination[0].pathClosed;
                    const joined=[...source,...destination];joined[0].pathClosed=false;
                    const paths:Interfaces.Anchor[][]=[];
                    for(let index=0;index<state.anchors.length;) {
                        const end=this.PathEnd(index);if(index===first)paths.push(joined);else if(index!==targetFirst)paths.push(state.anchors.slice(index,end+1));index=end+1;
                    }
                    let selected=0;state.anchors=[];
                    for(const path of paths){path[0].breakBefore=state.anchors.length>0;if(path===joined)selected=state.anchors.length+path.length-1;state.anchors.push(...path);}
                    state.selected=new Set([selected]);finish();return;
                }
            }
            if(state.penDirection==='prepend') {
                state.anchors.splice(startIndex,0,{p:point,breakBefore:start.breakBefore,pathClosed:start.pathClosed,interpolation:'linear',mode:'corner'});
                start.breakBefore=false;delete start.pathClosed;state.selected=new Set([startIndex]);
            } else {
                start.interpolation='linear';start.out=undefined;
                state.anchors.splice(startIndex+1,0,{p:point,interpolation:'linear',mode:'corner'});state.selected=new Set([startIndex+1]);
            }
            finish();
        }

        private OnPointerMove(event: PointerEvent): void
        {
            if(!this._svg) return;
            const state = stateOf(this);
            const point = this.Point(event);

            const drag = state.drag;

            /* Mouse-over preselection: visually select the closest anchor without changing selection state. */
            if(!drag)
            {
                if(state.mode==='add'){this.Cursor(this.NearestAnchor(point,this.HitRadius(10))>=0||this.NearestHandle(point,this.HitRadius(8))?'Move':this.NearestSegment(point)?'Add':'Default');return;}

                const hovered = this.PointsVisible()?this.NearestAnchor(point, this.HitRadius(10)):-1;
                const hit=this.Hit(point);
                const tangent=this.NearestHandle(point,this.HitRadius(8));
                this.Cursor(this.OffsetGlyphs().some(g=>Math.hypot(g.point.x-point.x,g.point.y-point.y)<=this.HitRadius(7))?'Move':tangent?'Move':state.cornerTool!=='none'&&hit?'Move':state.penStart!==null?'Draw':hit?.kind==='connect'&&state.mode==='pen'?'Add':hit?.kind==='bend'?'Curve':hit?'Move':state.mode==='freehand'?'Draw':'Default');
                const nextHovered = hovered >= 0 ? hovered : null;
                const nextSegment = hit?.kind==='bend' ? hit.index : null;
                if(nextHovered !== state.hovered || nextSegment !== state.hoveredSegment)
                {
                    state.hovered = nextHovered;
                    state.hoveredSegment = nextSegment;
                    this.Draw();
                }

                /* Pen rubber-band exists only after the first point/endpoint is armed. */
                if(state.mode === 'pen' && state.penStart !== null && !this.closed)
                {
                    state.preview = this.SnapDrawing(point);
                    this.Draw();
                }
                return;
            }

            if(drag.pointerId !== event.pointerId) return;
            drag.current = point;

            if(drag.kind==='offset'){this.UpdateOffsetGesture(point);return;}
            if(drag.kind==='corner') {
                const index=drag.anchorIndex!,direction=this.CornerDirection(index);
                if(direction) {
                    const p=state.anchors[index].p;
                    const amount=Math.max(0,(point.x-p.x)*direction.x+(point.y-p.y)*direction.y);
                    state.cornerAmount=amount;this.setCorner(state.cornerTool,amount);
                    const input=attachment(this).window?.querySelector<HTMLInputElement>('[data-role="amount"]');
                    if(input)input.value=String(Math.round(amount*100)/100);
                }
                return;
            }
            if(drag.kind==='freehand') {
                const samples=typeof event.getCoalescedEvents==='function'?event.getCoalescedEvents():[];
                for(const sample of samples.length?samples:[event])this.SampleFreehand(this.Point(sample));
                this.Draw();return;
            }

            if(drag.kind === 'handle-in' || drag.kind === 'handle-out')
            {
                const index = drag.anchorIndex!;
                const anchor = state.anchors[index];
                if(!anchor) return;

                const kind = drag.kind === 'handle-in' ? 'in' : 'out';
                this.SetHandle(index, kind, point);
                this.Draw();

                return;
            }

            if(drag.kind === 'segment' || drag.kind === 'bend') {
                const index=drag.segmentIndex!, next=this.NextIndex(index)!, origin=drag.origin!;
                let dx=point.x-drag.start.x,dy=point.y-drag.start.y;
                if(drag.kind==='bend') {
                    const a=state.anchors[index],b=state.anchors[next];
                    a.interpolation='bezier'; a.mode='corner'; b.mode='corner';
                    a.out={x:origin[index].out!.x+dx*4/3,y:origin[index].out!.y+dy*4/3};
                    b.in={x:origin[next].in!.x+dx*4/3,y:origin[next].in!.y+dy*4/3};
                } else {
                    // Clamp one common delta so dragging cannot change the segment/spline shape.
                    const moving=state.selectionLevel==='spline'?this.SelectedIndices():[index,next];
                    dx=clamp(dx,-Math.min(...moving.map(i=>origin[i].p.x)),this.Bounds().width-Math.max(...moving.map(i=>origin[i].p.x)));
                    dy=clamp(dy,-Math.min(...moving.map(i=>origin[i].p.y)),this.Bounds().height-Math.max(...moving.map(i=>origin[i].p.y)));
                    const snapped=this.SnapTranslation(origin,moving,dx,dy);dx=snapped.dx;dy=snapped.dy;state.snapTarget=snapped.target;
                    for(const i of moving)state.anchors[i].p={x:origin[i].p.x+dx,y:origin[i].p.y+dy};
                }
                this.Draw();return;
            }

            if(drag.kind === 'anchor')
            {
                const origin = drag.origin!;
                let dx = point.x - drag.start.x;
                let dy = point.y - drag.start.y;
                const moving=this.SelectedIndices();const snapped=this.SnapTranslation(origin,moving,dx,dy);dx=snapped.dx;dy=snapped.dy;state.snapTarget=snapped.target;

                for(const index of this.SelectedIndices())
                {
                    const source = origin[index];
                    const anchor = state.anchors[index];
                    if(!source || !anchor) continue;

                    anchor.p = {
                        x: clamp(source.p.x + dx, 0, this.Bounds().width),
                        y: clamp(source.p.y + dy, 0, this.Bounds().height)
                    };
                }

                this.Draw();

                return;
            }

            if(drag.kind === 'marquee')
            {
                state.marquee = { a:drag.start, b:point };

                const x1 = Math.min(drag.start.x,point.x);
                const x2 = Math.max(drag.start.x,point.x);
                const y1 = Math.min(drag.start.y,point.y);
                const y2 = Math.max(drag.start.y,point.y);

                if(state.mode !== 'delete')
                {
                    const next = drag.additive ? new Set(state.selected) : new Set<number>();
                    state.anchors.forEach((anchor,index) =>
                    {
                        if(anchor.p.x >= x1 && anchor.p.x <= x2 && anchor.p.y >= y1 && anchor.p.y <= y2)
                            next.add(index);
                    });
                    state.selected = next;
                }

                this.Draw();


            }
        }

        private SampleFreehand(point:Interfaces.Vec2,final=false):void {
            const state=stateOf(this),last=state.anchors[state.anchors.length-1];
            if(!last||Math.hypot(point.x-last.p.x,point.y-last.p.y)<this.HitRadius(final ? 0.25 : 2))return;
            state.anchors.push({p:point,interpolation:'linear',mode:'corner'});
            state.selected=new Set([state.anchors.length-1]);
        }

        private OnPointerUp(event: PointerEvent): void
        {
            if(!this._svg) return;
            const state = stateOf(this);
            const pen=state.penPointer;
            if(pen?.id===event.pointerId) {
                state.penPointer=undefined;
                if(this._svg.hasPointerCapture(event.pointerId))this._svg.releasePointerCapture(event.pointerId);
                if(event.type==='pointercancel') {
                    if(state.penSeedCreated&&state.penStart!==null)state.anchors.splice(state.penStart,1);
                    state.penStart=null;state.penSeedCreated=false;state.preview=null;
                    this.Cursor('Default');this.Draw();this.EmitChange();
                } else {
                    const point=this.Point(event);
                    if(pen.commit||Math.hypot(point.x-pen.start.x,point.y-pen.start.y)>this.HitRadius(3)){this.CommitPen(point);this.FinishGesture();}
                }
                return;
            }
            const drag = state.drag;
            if(!drag){if(state.mode!=='select'||state.cornerTool!=='none'||state.offsetTool!==undefined)this.FinishGesture();return;}
            if(drag.pointerId !== event.pointerId)return;

            if(event.type === 'pointercancel' && drag.origin){state.anchors=drag.origin;if(drag.offset)state.selected=new Set(drag.offset.selection);}
            else if(drag.kind==='freehand') {
                this.SampleFreehand(this.SnapDrawing(this.Point(event)),true);
                const first=drag.origin?.length??0;
                if(this.Snap.Close&&state.snapHit?.kind==='vertex'&&state.snapHit.index===first&&state.anchors.length-first>=4){state.anchors.pop();state.anchors[first].pathClosed=true;state.selected=new Set([first]);}
                if(state.anchors.length-(drag.origin?.length??0)<2)state.anchors=drag.origin!;
            }

            if(event.type !== 'pointercancel' && drag.kind === 'marquee' && state.mode === 'delete' && state.marquee)
            {
                const {a,b} = state.marquee;
                const x1 = Math.min(a.x,b.x), x2 = Math.max(a.x,b.x);
                const y1 = Math.min(a.y,b.y), y2 = Math.max(a.y,b.y);

                const doomed = new Set<number>();
                state.anchors.forEach((anchor,index) =>
                {
                    if(anchor.p.x >= x1 && anchor.p.x <= x2 && anchor.p.y >= y1 && anchor.p.y <= y2)
                        doomed.add(index);
                });

                if(doomed.size)
                {
                    state.anchors = this.FilterAnchors(doomed);
                    state.selected.clear();
                    if(state.anchors.length < 3) this.removeAttribute('closed');
                }
            }

            if(event.type!=='pointercancel'&&drag.origin&&['anchor','segment'].includes(drag.kind))this.TranslateOffsetSources(drag.origin);
            state.drag = null;
            state.marquee = null;
            state.snapTarget = null;state.snapHit=null;
            this.FinishGesture();

            try
            {
                if(this._svg.hasPointerCapture(event.pointerId))
                    this._svg.releasePointerCapture(event.pointerId);
            }
            catch(_) {}

            this.Draw();


            this.EmitChange();
        }

        private OnPointerLeave(_event: PointerEvent): void
        {
            const state = stateOf(this);
            state.hovered = null;
            state.hoveredSegment = null;

            /*
             * Do NOT cancel Pen on pointer leave. The active origin remains armed,
             * exactly as it does across MouseUp; when the pointer re-enters, the next
             * PointerMove resumes the rubber-band from the last committed point.
             */
            if(state.mode !== 'pen')
                state.preview = null;

            this.Draw();
        }

        private OnKeyDown(event: KeyboardEvent): void
        {
            const state = stateOf(this);

            if(event.key === 'Delete' || event.key === 'Backspace')
            {
                if((event.target as HTMLElement).matches('input,select,textarea')) return;
                event.preventDefault();
                this.deleteSelection();
                return;
            }

            if(event.key === 'Escape')
            {
                if(state.penPointer&&this._svg?.hasPointerCapture(state.penPointer.id))this._svg.releasePointerCapture(state.penPointer.id);
                state.penPointer=undefined;
                if(state.drag?.origin) state.anchors=state.drag.origin;
                if(state.drag && this._svg?.hasPointerCapture(state.drag.pointerId)) this._svg.releasePointerCapture(state.drag.pointerId);
                state.drag = null;
                state.marquee = null;
                state.preview = null;

                if(state.mode === 'pen')
                {
                    if(state.penSeedCreated && state.penStart !== null)
                    {
                        state.anchors.splice(state.penStart,1);
                        state.selected.clear();
                    }
                    state.penStart = null;
                    state.penSeedCreated = false;
                    this.setMode(state.mode);
                }
                else this.setMode('select');
                return;
            }

            if(event.key === 'Enter' && state.mode === 'pen')
            {
                event.preventDefault();
                state.preview = null;
                state.penStart = null;
                state.penSeedCreated = false;
                this.setMode(state.mode);
                return;
            }

            if((event.key === 'c' || event.key === 'C') && !event.metaKey && !event.ctrlKey)
            {
                if(state.anchors.length >= 3)
                    this.closed ? this.openPath() : this.closePath();
            }
        }

        private SetHandle(index:number, kind:'in'|'out', point:Interfaces.Vec2): void
        {
            const state = stateOf(this);
            const anchor = state.anchors[index];
            if(!anchor) return;

            const offset = { x:point.x-anchor.p.x, y:point.y-anchor.p.y };
            anchor.interpolation = 'bezier';
            anchor.mode ??= 'smooth';
            anchor[kind] = offset;
            if(kind==='in'){const previous=this.PreviousIndex(index);if(previous!==null)state.anchors[previous].interpolation='bezier';}

            const opposite = kind === 'in' ? 'out' : 'in';

            if(anchor.mode === 'symmetric')
            {
                anchor[opposite] = {x:-offset.x,y:-offset.y};
            }
            else if(anchor.mode === 'smooth')
            {
                const old = anchor[opposite] ?? {x:-offset.x,y:-offset.y};
                const oldLength = Math.max(1,Math.hypot(old.x,old.y));
                const length = Math.max(.001,Math.hypot(offset.x,offset.y));
                anchor[opposite] = {
                    x:-(offset.x/length)*oldLength,
                    y:-(offset.y/length)*oldLength
                };
            }
        }

        private Draw(): void
        {
            const svg = attachment(this).layer;
            if(!svg) return;
            const state = stateOf(this);
            const stroke=this.stroke;
            svg.replaceChildren();
            const style=document.createElementNS(SVG_NS,'style');
            style.textContent=`[data-line-layer] .LineEditor-Path{pointer-events:none}
[data-line-layer] .LineEditor-Preview{fill:none;stroke:#8a62ef;stroke-width:1.5;stroke-dasharray:5 4;pointer-events:none}
[data-line-layer] .LineEditor-HandleLine{stroke:#8e98a1;stroke-width:1;stroke-dasharray:2 2;pointer-events:none}
[data-line-layer] .LineEditor-Handle{fill:white;stroke:${stroke.color};stroke-width:1;cursor:inherit}
[data-line-layer] .LineEditor-BendGlyph{cursor:inherit;pointer-events:all}
[data-line-layer] .LineEditor-BendGlyphCircle{fill:#202428;stroke:#fff;stroke-width:1.25}
[data-line-layer] .LineEditor-BendGlyphCurve{fill:none;stroke:${stroke.color};stroke-width:1.6;stroke-linecap:round;pointer-events:none}
[data-line-layer] .LineEditor-Anchor{fill:white;stroke:${stroke.color};stroke-width:2;cursor:inherit}
[data-line-layer] .LineEditor-Anchor[data-selected="true"]{fill:${stroke.color};stroke:white}
[data-line-layer] .LineEditor-Marquee{fill:color-mix(in srgb,${stroke.color} 12%,transparent);stroke:${stroke.color};stroke-width:1;stroke-dasharray:5 3;pointer-events:none}
[data-line-layer] .LineEditor-SnapTarget{fill:none;stroke:${stroke.color};stroke-width:1.5;pointer-events:none}`;
            svg.appendChild(style);

            const path = document.createElementNS(SVG_NS,'path');
            path.setAttribute('class','LineEditor-Path');
            path.setAttribute('d',this.toSVGPath());
            for(const [key,value] of Object.entries({fill:'none',stroke:stroke.color,'stroke-width':stroke.width,'stroke-opacity':stroke.opacity,
                'stroke-linecap':stroke.lineCap,'stroke-linejoin':stroke.lineJoin,'stroke-dasharray':stroke.dashArray.join(' '),
                'stroke-dashoffset':stroke.dashOffset,'stroke-miterlimit':stroke.miterLimit}))path.setAttribute(key,String(value));
            svg.appendChild(path);

            if(this.PointsVisible() && state.hoveredSegment!==null && !state.drag && state.mode==='curve')
            {
                const middle=this.SegmentPoint(state.hoveredSegment,.5);
                if(middle)
                {
                    const glyph=document.createElementNS(SVG_NS,'g');
                    glyph.setAttribute('class','LineEditor-BendGlyph');
                    glyph.dataset.index=String(state.hoveredSegment);
                    const disc=document.createElementNS(SVG_NS,'circle');
                    disc.setAttribute('class','LineEditor-BendGlyphCircle');
                    disc.setAttribute('cx',String(middle.x));disc.setAttribute('cy',String(middle.y));disc.setAttribute('r','8');
                    const curve=document.createElementNS(SVG_NS,'path');
                    curve.setAttribute('class','LineEditor-BendGlyphCurve');
                    curve.setAttribute('d',`M ${middle.x-4.5} ${middle.y+2.5} Q ${middle.x} ${middle.y-5} ${middle.x+4.5} ${middle.y+2.5}`);
                    glyph.append(disc,curve);svg.appendChild(glyph);
                }
            }

            if(state.mode === 'pen' && state.preview && state.penStart !== null && !this.closed)
            {
                const start = state.anchors[state.penStart];
                if(start)
                {
                    const preview = document.createElementNS(SVG_NS,'path');
                    preview.setAttribute('class','LineEditor-Preview');
                    preview.style.stroke=this.stroke.color;preview.style.strokeWidth=String(this.stroke.width);preview.style.opacity=String(this.stroke.opacity);
                    preview.setAttribute('d',
                        `M ${start.p.x} ${start.p.y} L ${state.preview.x} ${state.preview.y}`);
                    svg.appendChild(preview);
                }
            }

            /* Once a Bézier segment is selected, its tangent glyphs stay visible
             * even if the bend was started from Select/Pen rather than Curve mode. */
            const showPoints=this.PointsVisible();
            const showHandles = showPoints && (state.mode==='curve'||state.selected.size>0);

            state.anchors.forEach((anchor,index) =>
            {
                if(!showPoints)return;
                const selected = state.selected.has(index);

                // Same conceptual rule as CurveEditor: selected Bézier keys expose in/out tangents.
                if(showHandles && selected && ((anchor.interpolation ?? 'linear') === 'bezier' || !!anchor.in || !!anchor.out))
                {
                    for(const kind of ['in','out'] as const)
                    {
                        if(kind==='in'&&this.PreviousIndex(index)===null)continue;
                        if(kind==='out'&&this.NextIndex(index)===null)continue;
                        const offset = anchor[kind] ?? this.DefaultHandle(index,kind);
                        const hx = anchor.p.x + offset.x;
                        const hy = anchor.p.y + offset.y;

                        const line = document.createElementNS(SVG_NS,'line');
                        line.setAttribute('class','LineEditor-HandleLine');
                        line.setAttribute('x1',String(anchor.p.x));
                        line.setAttribute('y1',String(anchor.p.y));
                        line.setAttribute('x2',String(hx));
                        line.setAttribute('y2',String(hy));
                        svg.appendChild(line);

                        const handle = document.createElementNS(SVG_NS,'circle');
                        handle.setAttribute('class','LineEditor-Handle');
                        handle.setAttribute('cx',String(hx));
                        handle.setAttribute('cy',String(hy));
                        handle.setAttribute('r','3');
                        handle.dataset.index = String(index);
                        handle.dataset.kind = kind;
                        svg.appendChild(handle);
                    }
                }

                if(selected && (state.cornerTool!=='none'||anchor.corner&&anchor.corner.type!=='none')) {
                    const direction=this.CornerDirection(index);
                    if(direction) {
                        const amount=anchor.corner?.amount??state.cornerAmount;
                        const x=anchor.p.x+direction.x*Math.max(14,amount),y=anchor.p.y+direction.y*Math.max(14,amount),r=this.HitRadius(6);
                        const handle=document.createElementNS(SVG_NS,'path');
                        handle.setAttribute('class','LineEditor-CornerHandle');handle.dataset.index=String(index);
                        handle.setAttribute('d',`M ${x} ${y-r} L ${x+r} ${y} L ${x} ${y+r} L ${x-r} ${y} Z`);
                        handle.setAttribute('fill',stroke.color);handle.setAttribute('stroke','white');handle.setAttribute('stroke-width','1');handle.style.cursor='move';svg.appendChild(handle);
                    }
                }
                const rim = document.createElementNS(SVG_NS,'circle');
                rim.setAttribute('class','LineEditor-AnchorRim');
                rim.setAttribute('cx',String(anchor.p.x)); rim.setAttribute('cy',String(anchor.p.y));
                rim.setAttribute('r','10'); rim.setAttribute('fill','transparent'); rim.style.cursor='inherit';
                svg.appendChild(rim);
                const circle = document.createElementNS(SVG_NS,'circle');
                circle.setAttribute('class','LineEditor-Anchor');
                circle.setAttribute('cx',String(anchor.p.x));
                circle.setAttribute('cy',String(anchor.p.y));
                circle.setAttribute('r','5');
                circle.dataset.index = String(index);
                circle.dataset.selected = String(selected || state.hovered === index);
                circle.dataset.first = String(index===0);
                svg.appendChild(circle);
            });

            for(const glyph of this.OffsetGlyphs()) {
                const {x,y}=glyph.point,r=this.HitRadius(5),node=document.createElementNS(SVG_NS,'path');
                node.setAttribute('class','LineEditor-OffsetHandle');node.dataset.index=String(glyph.root);
                node.setAttribute('d',`M ${x} ${y-r} L ${x+r} ${y} L ${x} ${y+r} L ${x-r} ${y} Z`);
                node.setAttribute('fill',stroke.color);node.setAttribute('stroke','white');node.setAttribute('stroke-width','1');node.style.cursor='ns-resize';svg.append(node);
            }
            if(state.marquee)
            {
                const {a,b} = state.marquee;
                const x = Math.min(a.x,b.x);
                const y = Math.min(a.y,b.y);
                const width = Math.abs(b.x-a.x);
                const height = Math.abs(b.y-a.y);

                const rect = document.createElementNS(SVG_NS,'rect');
                rect.setAttribute('class','LineEditor-Marquee');
                rect.setAttribute('x',String(x));
                rect.setAttribute('y',String(y));
                rect.setAttribute('width',String(width));
                rect.setAttribute('height',String(height));
                svg.appendChild(rect);
            }

            if(state.snapTarget)
            {
                const {x,y}=state.snapTarget;
                const marker=document.createElementNS(SVG_NS,'path');
                marker.setAttribute('class','LineEditor-SnapTarget');
                marker.setAttribute('d',`M ${x-7} ${y} H ${x+7} M ${x} ${y-7} V ${y+7} M ${x-4.5} ${y-4.5} L ${x+4.5} ${y+4.5} M ${x+4.5} ${y-4.5} L ${x-4.5} ${y+4.5}`);
                svg.appendChild(marker);
            }
            this.RefreshWindow();
        }

        private EmitChange(): void
        {
            this.RefreshWindow();
            const detail = {
                anchors: this.getAnchors(),
                selected: this.SelectedIndices(),
                closed: this.closed,
                stroke: this.stroke,
                canvas: this.canvas,
                path: this.toSVGPath(),
                source: this
            };

            this.dispatchEvent(new CustomEvent('arianna:line-change',{
                bubbles:true, composed:true, detail
            }));

            this.dispatchEvent(new CustomEvent('arianna:change',{
                bubbles:true, composed:true, detail
            }));
        }
    }
}

export type Vec2 = LineEditor.Interfaces.Vec2;
export type Anchor = LineEditor.Interfaces.Anchor;
export type LineMode = LineEditor.Types.Mode;
export type LineInterpolation = LineEditor.Types.Interpolation;
export type HandleMode = LineEditor.Types.HandleMode;
export type CornerType = LineEditor.Types.CornerType;
export type LineEditorOptions = LineEditor.Interfaces.LineEditorOptions;

export const LineEditorComponent = LineEditor.LineEditor;
export default LineEditor.LineEditor;

export type CanvasTarget = LineEditor.Interfaces.CanvasTarget;
export type StrokeOptions = LineEditor.Interfaces.StrokeOptions;
export type CursorIcons = LineEditor.Interfaces.CursorIcons;
