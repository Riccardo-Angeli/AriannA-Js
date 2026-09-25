/**
 * @module components/graphics/2D/LineEditor
 * @author Riccardo Angeli
 * @version 2.1.0
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
 *  - Select: anchor selection, Shift additive selection, marquee rectangle, drag selection.
 *  - Pen: drawing tool. First click sets a start point, pointer movement previews one straight
 *         segment, second release commits it. Drag-and-release also creates one segment.
 *         A fresh press on empty space starts another independent path.
 *         The centre of an open endpoint starts one connected segment; its rim moves that point.
 *  - The selected tool persists between gestures. Select restores marquee selection.
 *  - Freehand: hold, draw sampled points, release to commit one independent path.
 *  - Curve: drag a segment midpoint to bend it, or edit tangents explicitly.
 *           Constant / Linear / Bezier interpolation and draggable in/out tangents are preserved.
 *  - Delete: click a point to delete it, or drag a rectangle to delete every enclosed point.
 */
import { Component, Css, Templates } from '../../../core/index.ts';

const html = Templates.Template.Html;
const SVG_NS = 'http://www.w3.org/2000/svg';

export namespace LineEditor
{
    export namespace Types
    {
        export type Mode = 'select' | 'pen' | 'freehand' | 'curve' | 'delete';
        export type Interpolation = 'constant' | 'linear' | 'bezier';
        export type HandleMode = 'corner' | 'smooth' | 'symmetric';
        export type CornerType = 'none' | 'fillet' | 'chamfer' | 'scallop';
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
            in?: Vec2;
            out?: Vec2;
            interpolation?: Types.Interpolation;
            mode?: Types.HandleMode;
            /** Optional non-destructive corner treatment for CAD / spline workflows. */
            corner?: { type:Types.CornerType; amount:number };
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
        }
    }

    interface DragState
    {
        kind: 'anchor' | 'handle-in' | 'handle-out' | 'marquee' | 'segment' | 'bend' | 'freehand';
        segmentIndex?: number;
        pointerId: number;
        start: Interfaces.Vec2;
        current: Interfaces.Vec2;
        anchorIndex?: number;
        origin?: Interfaces.Anchor[];
        additive?: boolean;
    }

    interface State
    {
        anchors: Interfaces.Anchor[];
        selected: Set<number>;
        mode: Types.Mode;
        interpolation: Types.Interpolation;
        preview: Interfaces.Vec2 | null;
        hovered: number | null;
        penStart: number | null;
        penDirection: 'append' | 'prepend';
        penSeedCreated: boolean;
        penPointer?: {id:number; start:Interfaces.Vec2; commit:boolean};
        drag: DragState | null;
        marquee: { a: Interfaces.Vec2; b: Interfaces.Vec2 } | null;
        plane: Interfaces.Plane3D;
    }

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
    const DEFAULT_ICONS:Interfaces.CursorIcons={Default:'default',Draw:'crosshair',Add:'crosshair',Move:'move',Curve:CURVE_CURSOR};
    interface Attachment {
        canvas:Interfaces.CanvasTarget|null; layer:SVGGElement|null; cleanup:(()=>void)|null;
        stroke:Interfaces.StrokeOptions; icons:Interfaces.CursorIcons; cursor:keyof Interfaces.CursorIcons;
    }
    const Attachments=new WeakMap<HTMLElement,Attachment>();
    const ActiveSurfaces=new WeakMap<SVGSVGElement,LineEditor>();
    function attachment(host:LineEditor):Attachment {
        let a=Attachments.get(host);
        if(!a) {
            a={canvas:null,layer:null,cleanup:null,stroke:structuredClone(DEFAULT_STROKE),icons:{...DEFAULT_ICONS},cursor:'Default'};
            Attachments.set(host,a);
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
        Attributes: ['mode','closed','interpolation','canvas','stroke'],
        Properties: ['anchors','canvas','stroke','Icons']
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
            if(options.stroke) this.stroke=options.stroke;
            if(options.Icons) this.Icons=options.Icons;
            if(options.plane) stateOf(this).plane=structuredClone(options.plane);
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
            const mode=this.getAttribute('mode');if(mode)this.setMode(mode as Types.Mode);
        }
        public onAttributeChanged(name:string):void {
            if(name==='canvas'&&this.isConnected)this.onConnected();
            else if(name==='stroke') { const value=this.getAttribute('stroke');if(value)this.stroke=JSON.parse(value); }
            else if(name==='closed')this.Draw();
            else if(name==='mode') {
                const value=this.getAttribute('mode') as Types.Mode;
                if(['select','pen','freehand','curve','delete'].includes(value)&&stateOf(this).mode!==value)this.setMode(value);
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
            state.drag=null;state.preview=null;state.penStart=null;state.marquee=null;
            a.cleanup?.();a.cleanup=null;
            if(a.layer&&a.canvas)a.canvas.removeDrawingLayer(a.layer);
            a.canvas=null;a.layer=null;this._svg=undefined;return this;
        }
        public dispose():void { this.detach(); }
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
            this.Draw();

        }

        public get closed(): boolean { return this.hasAttribute('closed'); }

        public set closed(value: boolean)
        {
            this.toggleAttribute('closed', Boolean(value));
            this.Draw();
            this.EmitChange();
        }

        public setMode(value: Types.Mode | 'edit'): this
        {
            const state = stateOf(this);
            if(!['select','pen','freehand','curve','delete','edit'].includes(value))throw new TypeError('Invalid LineEditor mode');
            // Tool changes cancel only unfinished work and release any captured pointer.
            if(state.drag?.origin)state.anchors=state.drag.origin;
            if(state.penSeedCreated&&state.penStart!==null)state.anchors.splice(state.penStart,1);
            const pointer=state.penPointer?.id??state.drag?.pointerId;
            if(pointer!==undefined&&this._svg?.hasPointerCapture(pointer))this._svg.releasePointerCapture(pointer);
            state.penPointer=undefined;
            state.mode = value === 'edit' ? 'select' : value;
            state.preview = null;
            state.hovered = null;
            state.drag = null;
            state.marquee = null;
            state.penStart = null;
            state.penSeedCreated = false;

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

            /*
             * Illustrator-compatible rule: changing interpolation MUST NOT change
             * the visible path.  A Linear → Bezier conversion therefore seeds
             * collinear one-third handles, which describe the exact same straight
             * segment.  Curvature appears only after the user edits a tangent.
             */
            const indices = this.SelectedIndices();
            for(const index of indices)
            {
                const anchor = state.anchors[index];
                if(!anchor) continue;
                const previous = anchor.interpolation ?? 'linear';
                anchor.interpolation = value;

                if(value === 'bezier' && previous !== 'bezier')
                {
                    anchor.mode ??= 'corner';
                    const nextIndex = this.NextIndex(index);
                    if(nextIndex !== null)
                    {
                        const next = state.anchors[nextIndex];
                        const dx = next.p.x-anchor.p.x;
                        const dy = next.p.y-anchor.p.y;
                        anchor.out = {x:dx/3,y:dy/3};
                        next.in = {x:-dx/3,y:-dy/3};
                    }
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

        /** Apply a non-destructive corner treatment to the selected anchors. */
        public setCorner(type:Types.CornerType, amount=12): this
        {
            const state=stateOf(this);
            const value=Math.max(0,Number(amount)||0);
            for(const index of this.SelectedIndices())
            {
                const anchor=state.anchors[index];
                if(!anchor)continue;
                anchor.corner=type==='none'?undefined:{type,amount:value};
            }
            this.Draw();this.EmitChange();
            return this;
        }

        public clearCorner(): this { return this.setCorner('none',0); }

        public closePath(): this
        {
            if(stateOf(this).anchors.length >= 3)
            {
                this.setAttribute('closed','');
                stateOf(this).preview = null;
                stateOf(this).penStart = null;
                stateOf(this).penSeedCreated = false;
                this.Draw();
                this.EmitChange();

            }
            return this;
        }

        public openPath(): this
        {
            this.removeAttribute('closed');
            this.Draw();
            this.EmitChange();

            return this;
        }

        public clear(): this
        {
            const state = stateOf(this);
            state.anchors = [];
            state.selected.clear();
            state.preview = null;
            state.hovered = null;
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
            let start=true;const result:Interfaces.Anchor[]=[];
            stateOf(this).anchors.forEach((anchor,index)=>{
                start ||= !!anchor.breakBefore;
                if(remove.has(index))return;
                result.push({...anchor,breakBefore:result.length>0&&start});start=false;
            });
            return result;
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
            if(!this.closed)return null;
            let first=index;while(first>0&&!anchors[first].breakBefore)first--;
            return first===index?null:first;
        }

        private PreviousIndex(index:number):number|null
        {
            const anchors=stateOf(this).anchors,n=anchors.length;if(!n)return null;
            if(index>0&&!anchors[index].breakBefore)return index-1;
            if(!this.closed)return null;
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

        private CornerGeometry(index:number):{entry:Interfaces.Vec2;exit:Interfaces.Vec2;type:Types.CornerType;c1?:Interfaces.Vec2;c2?:Interfaces.Vec2}|null
        {
            const state=stateOf(this),anchor=state.anchors[index],corner=anchor?.corner;
            if(!anchor||!corner||corner.type==='none'||corner.amount<=0)return null;
            const pi=this.PreviousIndex(index),ni=this.NextIndex(index);if(pi===null||ni===null)return null;
            const prev=state.anchors[pi].p,next=state.anchors[ni].p,b=anchor.p;
            const v1={x:prev.x-b.x,y:prev.y-b.y},v2={x:next.x-b.x,y:next.y-b.y};
            const l1=Math.hypot(v1.x,v1.y),l2=Math.hypot(v2.x,v2.y);if(l1<1e-6||l2<1e-6)return null;
            const u1={x:v1.x/l1,y:v1.y/l1},u2={x:v2.x/l2,y:v2.y/l2};
            const d=Math.min(corner.amount,l1*.45,l2*.45);
            const entry={x:b.x+u1.x*d,y:b.y+u1.y*d};
            const exit={x:b.x+u2.x*d,y:b.y+u2.y*d};
            if(corner.type==='chamfer')return{entry,exit,type:'chamfer'};
            const h=d*.5522847498;
            if(corner.type==='fillet')
                return{entry,exit,type:'fillet',c1:{x:entry.x-u1.x*h,y:entry.y-u1.y*h},c2:{x:exit.x-u2.x*h,y:exit.y-u2.y*h}};
            return{entry,exit,type:'scallop',c1:{x:entry.x+u1.x*h,y:entry.y+u1.y*h},c2:{x:exit.x+u2.x*h,y:exit.y+u2.y*h}};
        }

        public toSVGPath(): string
        {
            const anchors=stateOf(this).anchors;if(!anchors.length)return '';
            const corner=(i:number)=>this.CornerGeometry(i);
            const absoluteControl=(anchor:Interfaces.Anchor,index:number,kind:'in'|'out')=>{const off=anchor[kind]??this.DefaultHandle(index,kind);return{x:anchor.p.x+off.x,y:anchor.p.y+off.y};};
            const segment=(fromIndex:number,start:Interfaces.Vec2,end:Interfaces.Vec2,toIndex:number):string=>
            {
                const from=anchors[fromIndex],to=anchors[toIndex];
                const interpolation=from.interpolation??'linear';
                if(interpolation==='constant')return ` H ${end.x} V ${end.y}`;
                if(interpolation==='linear')return ` L ${end.x} ${end.y}`;
                const c1=absoluteControl(from,fromIndex,'out'),c2=absoluteControl(to,toIndex,'in');
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
                if(this.closed&&last-first>=2) {
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

        private NearestHandle(point: Interfaces.Vec2, radius=8):
            { index:number; kind:'in'|'out' } | null
        {
            const state = stateOf(this);
            if(state.mode !== 'curve') return null;

            let found: {index:number;kind:'in'|'out'} | null = null;
            let best = radius * radius;

            for(const index of this.SelectedIndices())
            {
                const anchor = state.anchors[index];
                if(!anchor || (anchor.interpolation ?? 'bezier') !== 'bezier') continue;

                for(const kind of ['in','out'] as const)
                {
                    const offset = anchor[kind];
                    if(!offset) continue;

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
        private Hit(point:Interfaces.Vec2):{kind:'connect'|'anchor'|'bend'|'segment';index:number}|null {
            const state=stateOf(this), anchors=state.anchors, radius=this.HitRadius(10);
            const index=this.NearestAnchor(point,radius);
            if(index>=0) {
                const p=anchors[index].p;
                const centre=Math.hypot(point.x-p.x,point.y-p.y)<=this.HitRadius(4);
                return {kind:centre&&!this.closed&&(this.PreviousIndex(index)===null||this.NextIndex(index)===null)?'connect':'anchor',index};
            }
            let best=radius, result:{kind:'bend'|'segment';index:number}|null=null;
            const count=this.closed?anchors.length:anchors.length-1;
            for(let i=0;i<count;i++) {
                const j=this.NextIndex(i);if(j===null)continue;
                const a=anchors[i],b=anchors[j];
                const out=a.out??this.DefaultHandle(i,'out'), incoming=b.in??this.DefaultHandle(j,'in');
                const at=(t:number):Interfaces.Vec2=>{
                    if(a.interpolation==='constant') {
                        const horizontal=Math.abs(b.p.x-a.p.x),vertical=Math.abs(b.p.y-a.p.y),distance=t*(horizontal+vertical);
                        return distance<=horizontal?{x:a.p.x+Math.sign(b.p.x-a.p.x)*distance,y:a.p.y}:{x:b.p.x,y:a.p.y+Math.sign(b.p.y-a.p.y)*(distance-horizontal)};
                    }
                    if(a.interpolation!=='bezier')return{x:a.p.x+(b.p.x-a.p.x)*t,y:a.p.y+(b.p.y-a.p.y)*t};
                    const u=1-t;
                    return{x:u*u*u*a.p.x+3*u*u*t*(a.p.x+out.x)+3*u*t*t*(b.p.x+incoming.x)+t*t*t*b.p.x,
                        y:u*u*u*a.p.y+3*u*u*t*(a.p.y+out.y)+3*u*t*t*(b.p.y+incoming.y)+t*t*t*b.p.y};
                };
                const middle=at(.5); let previous=at(0);
                for(let step=1;step<=64;step++) {
                    const current=at(step/64),vx=current.x-previous.x,vy=current.y-previous.y;
                    const t=clamp(((point.x-previous.x)*vx+(point.y-previous.y)*vy)/(vx*vx+vy*vy||1),0,1);
                    const distance=Math.hypot(point.x-previous.x-t*vx,point.y-previous.y-t*vy);
                    if(distance<best){best=distance;result={kind:Math.hypot(point.x-middle.x,point.y-middle.y)<=radius?'bend':'segment',index:i};}
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
            const point = this.Point(event);
            const target = event.target as Element;

            const anchorNode = target.closest?.('.LineEditor-Anchor') as SVGCircleElement | null;
            const handleNode = target.closest?.('.LineEditor-Handle') as SVGCircleElement | null;
            const nearest = anchorNode
                ? Number(anchorNode.dataset.index)
                : this.NearestAnchor(point, this.HitRadius(10));

            const hit = this.Hit(point);
            if(state.mode==='freehand') {
                event.preventDefault();
                const origin=structuredClone(state.anchors);
                state.anchors.push({p:point,breakBefore:state.anchors.length>0,interpolation:'linear',mode:'corner'});
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
                if(this.closed)this.removeAttribute('closed');

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
                    state.anchors.push({p:point,breakBefore:index>0,interpolation:'linear',mode:'corner'});
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

            if(handleNode && state.mode === 'curve')
            {
                event.preventDefault();

                const index = Number(handleNode.dataset.index);
                const kind = handleNode.dataset.kind === 'in' ? 'handle-in' : 'handle-out';

                state.drag = {
                    kind,
                    pointerId:event.pointerId,
                    start:point,
                    current:point,
                    anchorIndex:index,
                    origin:structuredClone(state.anchors)
                };

                this._svg.setPointerCapture(event.pointerId);
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
                    state.selected = new Set([index]);
                }

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
                state.selected=new Set([index,next]);
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

        private CommitPen(point:Interfaces.Vec2):void
        {
                const state=stateOf(this);
                const startIndex = state.penStart;
                if(startIndex===null)return;
                const startAnchor = state.anchors[startIndex];
                if(!startAnchor) return;

                /*
                 * The second press of a browser double-click lands on the point just
                 * committed by the first press. Do not manufacture a zero-length point;
                 * leave the origin armed until a distinct endpoint is supplied.
                 */
                if(Math.hypot(point.x-startAnchor.p.x,point.y-startAnchor.p.y)<this.HitRadius(2))
                    return;

                if(state.penDirection === 'prepend')
                {
                    /*
                     * Prepending: the NEW anchor owns the linear segment leaving it.
                     */
                    state.anchors.splice(startIndex,0,{
                        breakBefore:startAnchor.breakBefore,
                        p: point,
                        interpolation: 'linear',
                        mode: 'corner'
                    });
                    startAnchor.breakBefore=false;
                    state.selected = new Set([startIndex]);
                }
                else
                {
                    /*
                     * Appending: interpolation belongs to the anchor the new segment
                     * leaves. Pen always creates straight segments.
                     */
                    startAnchor.interpolation = 'linear';
                    startAnchor.mode = 'corner';
                    startAnchor.out = undefined;

                    state.anchors.splice(startIndex+1,0,{
                        p: point,
                        interpolation: 'linear',
                        mode: 'corner'
                    });

                    const committed = startIndex+1;
                    state.selected = new Set([committed]);
                    state.penStart = committed;
                }

                // Release commits exactly ONE segment, then returns to neutral editing.
                state.preview = null;
                state.penStart = null;
                state.penSeedCreated = false;
                // Keep the selected drawing tool; the next press starts a fresh cycle.
                this.Cursor('Default');

                this.Draw();


                this.EmitChange();
                return;
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
                const hovered = this.NearestAnchor(point, this.HitRadius(10));
                const hit=this.Hit(point);
                this.Cursor(state.penStart!==null?'Draw':hit?.kind==='connect'&&state.mode==='pen'?'Add':hit?.kind==='bend'?'Curve':hit?'Move':state.mode==='freehand'?'Draw':'Default');
                const nextHovered = hovered >= 0 ? hovered : null;
                if(nextHovered !== state.hovered)
                {
                    state.hovered = nextHovered;
                    this.Draw();
                }

                /* Pen rubber-band exists only after the first point/endpoint is armed. */
                if(state.mode === 'pen' && state.penStart !== null && !this.closed)
                {
                    state.preview = point;
                    this.Draw();
                }
                return;
            }

            if(drag.pointerId !== event.pointerId) return;
            drag.current = point;

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
                    // Clamp one common delta so dragging cannot change the segment's shape.
                    dx=clamp(dx,-Math.min(origin[index].p.x,origin[next].p.x),this.Bounds().width-Math.max(origin[index].p.x,origin[next].p.x));
                    dy=clamp(dy,-Math.min(origin[index].p.y,origin[next].p.y),this.Bounds().height-Math.max(origin[index].p.y,origin[next].p.y));
                    for(const i of [index,next])state.anchors[i].p={x:origin[i].p.x+dx,y:origin[i].p.y+dy};
                }
                this.Draw();return;
            }

            if(drag.kind === 'anchor')
            {
                const origin = drag.origin!;
                const dx = point.x - drag.start.x;
                const dy = point.y - drag.start.y;

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
                    if(pen.commit||Math.hypot(point.x-pen.start.x,point.y-pen.start.y)>this.HitRadius(3))this.CommitPen(point);
                }
                return;
            }
            const drag = state.drag;
            if(!drag || drag.pointerId !== event.pointerId) return;

            if(event.type === 'pointercancel' && drag.origin) state.anchors=drag.origin;
            else if(drag.kind==='freehand') {
                this.SampleFreehand(this.Point(event),true);
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

            state.drag = null;
            state.marquee = null;
            this.Cursor('Default');

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
                else this.Draw();
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
            svg.replaceChildren();
            const style=document.createElementNS(SVG_NS,'style');
            style.textContent=`[data-line-layer] .LineEditor-Path{pointer-events:none}
[data-line-layer] .LineEditor-Preview{fill:none;stroke:#8a62ef;stroke-width:1.5;stroke-dasharray:5 4;pointer-events:none}
[data-line-layer] .LineEditor-HandleLine{stroke:#8e98a1;stroke-width:1;stroke-dasharray:2 2;pointer-events:none}
[data-line-layer] .LineEditor-Handle{fill:white;stroke:#e40c88;stroke-width:1;cursor:inherit}
[data-line-layer] .LineEditor-Anchor{fill:white;stroke:#e40c88;stroke-width:2;cursor:inherit}
[data-line-layer] .LineEditor-Anchor[data-selected="true"]{fill:#e40c88;stroke:white}
[data-line-layer] .LineEditor-Marquee{fill:#e40c881a;stroke:#e40c88;stroke-width:1;stroke-dasharray:5 3;pointer-events:none}`;
            svg.appendChild(style);

            const path = document.createElementNS(SVG_NS,'path');
            path.setAttribute('class','LineEditor-Path');
            path.setAttribute('d',this.toSVGPath());
            const stroke=this.stroke;
            for(const [key,value] of Object.entries({fill:'none',stroke:stroke.color,'stroke-width':stroke.width,'stroke-opacity':stroke.opacity,
                'stroke-linecap':stroke.lineCap,'stroke-linejoin':stroke.lineJoin,'stroke-dasharray':stroke.dashArray.join(' '),
                'stroke-dashoffset':stroke.dashOffset,'stroke-miterlimit':stroke.miterLimit}))path.setAttribute(key,String(value));
            svg.appendChild(path);

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

            const showHandles = state.mode === 'curve';

            state.anchors.forEach((anchor,index) =>
            {
                const selected = state.selected.has(index);

                // Same conceptual rule as CurveEditor: selected Bézier keys expose in/out tangents.
                if(showHandles && selected && (anchor.interpolation ?? 'bezier') === 'bezier')
                {
                    for(const kind of ['in','out'] as const)
                    {
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
        }

        private EmitChange(): void
        {
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
export type LineEditorOptions = LineEditor.Interfaces.LineEditorOptions;

export const LineEditorComponent = LineEditor.LineEditor;
export default LineEditor.LineEditor;

export type CanvasTarget = LineEditor.Interfaces.CanvasTarget;
export type StrokeOptions = LineEditor.Interfaces.StrokeOptions;
export type CursorIcons = LineEditor.Interfaces.CursorIcons;
