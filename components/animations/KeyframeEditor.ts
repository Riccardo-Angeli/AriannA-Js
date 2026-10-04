/**
 * @module components/animations/KeyframeEditor
 * @author Riccardo Angeli
 * @version 2.1.1
 * @license MIT / Commercial (dual license)
 * Independent property animation editor. Times are frames; tangents are relative
 * [deltaFrame, deltaValue]. Bindings remain outside serialized project data.
 */
import { Component, Css } from '../../core/index.ts';

export namespace KeyframeEditor {
    export namespace Types {
        export type Value = number | string | boolean;
        export type Interpolation = 'constant' | 'linear' | 'bezier';
        export type Extrapolation = 'hold' | 'linear' | 'repeat' | 'pingpong';
        export type View = 'sheet' | 'curves';
    }
    export namespace Interfaces {
        export interface Key {
            id?: string; frame: number; value: Types.Value;
            interpolation?: Types.Interpolation;
            handleIn?: [number, number]; handleOut?: [number, number];
            selected?: boolean;
        }
        export interface Node {
            id: string; name?: string; label?: string; channel?: string; property?: string;
            color?: string; expanded?: boolean; locked?: boolean; muted?: boolean; hidden?: boolean;
            min?: number; max?: number; defaultValue?: Types.Value;
            extrapolation?: Types.Extrapolation; keyframes?: Key[]; children?: Node[];
            metadata?: Record<string, unknown>;
        }
        export interface Tree {
            nodes: Node[]; frameStart?: number; frameEnd?: number; current?: number;
            fps?: number; framePx?: number; frameStep?: number; trackHeight?: number;
            theme?: 'dark' | 'light'; view?: Types.View; snap?: boolean; loop?: boolean;
        }
        /** Compatible with the existing AnimTrack definitions. */
        export interface TrackDefinition extends Partial<Node> {
            folder?: string; group?: 'position' | 'rotation' | 'scale' | 'custom';
        }
        export interface KeyframeEditorOptions extends Partial<Omit<Tree, 'nodes'>> {
            tree?: Tree; Tree?: Tree; tracks?: TrackDefinition[]; autoChannels?: boolean;
            height?: number;
        }
        export interface Selection { channel: string; key: string; }
        export interface Binding { get?: () => Types.Value; set: (value: Types.Value, frame: number) => void; }
        export interface Clipboard { format: 'arianna-keyframes'; version: 1; items: { channel: string; key: Key }[]; }
    }
    type Channel = { node: Interfaces.Node; depth: number; locked: boolean; muted: boolean };
    type Row = Channel & { folder: boolean };
    type State = {
        tree: Interfaces.Tree; initialized: boolean; ingest: boolean; writing: boolean;
        selected: Set<string>; active: string | null; collapsed: Set<string>;
        bindings: Map<string, Interfaces.Binding>; history: string[]; future: string[];
        clipboard: Interfaces.Clipboard | null; view: AbortController | null;
        gesture: AbortController | null; rollback: string | null; raf: number | null;
        created: number | null; lastTime: number; playing: boolean;
        scrollX: number; scrollY: number; urls: Set<string>; timers: Set<ReturnType<typeof setTimeout>>;
        epoch: number; error: string; graphLimits: [number,number] | null; scrollRaf: number | null;
        resize: ResizeObserver | null; menu: AbortController | null;
        resizeWidth?:number; resizeHeight?:number;
    };
    const states = new WeakMap<object, State>();
    const svgNS = 'http://www.w3.org/2000/svg';
    let sequence = 0;
    const uid = () => 'key-' + Date.now().toString(36) + '-' + (++sequence).toString(36);
    const finite = (v: unknown, label: string): number => {
        if(typeof v !== 'number' || !Number.isFinite(v)) throw new TypeError(label + ' must be finite');
        return v;
    };
    const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
    const token = (channel: string, key: string) => JSON.stringify([channel, key]);
    const cubic = (a: number, b: number, c: number, d: number, t: number) => {
        const u = 1-t; return u*u*u*a + 3*u*u*t*b + 3*u*t*t*c + t*t*t*d;
    };
    /** One interpolation implementation for preview, export and external playback. */
    export function Sample(keys: readonly Interfaces.Key[], frame: number, extrapolation: Types.Extrapolation = 'hold'): Types.Value | undefined {
        finite(frame, 'Frame'); if(!keys.length) return undefined;
        const first = keys[0], last = keys[keys.length-1];
        const duration = last.frame-first.frame;
        if(duration>0 && (frame<first.frame || frame>last.frame)) {
            if(extrapolation==='repeat' || extrapolation==='pingpong') {
                const cycle = Math.floor((frame-first.frame)/duration);
                const offset = ((frame-first.frame)%duration+duration)%duration;
                frame = first.frame + (extrapolation==='pingpong' && Math.abs(cycle)%2===1 ? duration-offset : offset);
            } else if(extrapolation==='linear' && keys.length>1) {
                const a = frame<first.frame ? first : keys[keys.length-2];
                const b = frame<first.frame ? keys[1] : last;
                if(typeof a.value==='number' && typeof b.value==='number')
                    return a.value + (b.value-a.value)*(frame-a.frame)/(b.frame-a.frame);
            }
        }
        if(frame<=first.frame) return first.value;
        if(frame>=last.frame) return last.value;
        let lo=0, hi=keys.length-1;
        while(hi-lo>1) { const m=(lo+hi)>>1; if(keys[m].frame<=frame) lo=m; else hi=m; }
        const a=keys[lo], b=keys[hi]; if(frame===a.frame) return a.value;
        if(a.interpolation==='constant' || typeof a.value!=='number' || typeof b.value!=='number') return a.value;
        const span=b.frame-a.frame;
        if(a.interpolation!=='bezier') return a.value+(b.value-a.value)*(frame-a.frame)/span;
        const out=a.handleOut??[span/3,(b.value-a.value)/3];
        const input=b.handleIn??[-span/3,-(b.value-a.value)/3];
        let x1=clamp(a.frame+out[0],a.frame,b.frame), x2=clamp(b.frame+input[0],a.frame,b.frame);
        // Monotonic time handles are necessary to invert x(t) without discontinuities.
        if(x1>x2) x1=x2=(x1+x2)/2;
        let l=0,r=1;
        for(let i=0;i<42;i++) { const t=(l+r)/2; if(cubic(a.frame,x1,x2,b.frame,t)<frame) l=t; else r=t; }
        return cubic(a.value,a.value+out[1],b.value+input[1],b.value,(l+r)/2);
    }
    const defaults = (): Interfaces.Tree => ({nodes:[],frameStart:0,frameEnd:240,current:0,fps:24,framePx:6,frameStep:24,trackHeight:32,theme:'dark',view:'sheet',snap:true,loop:true});
    function normalize(input: Interfaces.Tree): Interfaces.Tree {
        if(!input || !Array.isArray(input.nodes)) throw new TypeError('Tree.nodes must be an array');
        const tree = {...defaults(),...structuredClone(input)};
        const start=finite(tree.frameStart,'frameStart'), end=finite(tree.frameEnd,'frameEnd');
        if(end<=start) throw new RangeError('frameEnd must be greater than frameStart');
        tree.current=clamp(finite(tree.current,'current'),start,end);
        tree.fps=clamp(finite(tree.fps,'fps'),1,240); tree.framePx=clamp(finite(tree.framePx,'framePx'),.1,100);
        tree.frameStep=Math.max(.001,finite(tree.frameStep,'frameStep')); tree.trackHeight=clamp(finite(tree.trackHeight,'trackHeight'),24,80);
        if(!['sheet','curves'].includes(tree.view!)) throw new TypeError('Invalid view');
        if(!['dark','light'].includes(tree.theme!)) throw new TypeError('Invalid theme');
        tree.snap=tree.snap!==false; tree.loop=tree.loop!==false;
        const ids=new Set<string>(); let count=0, keyCount=0;
        const visit=(nodes: Interfaces.Node[],depth:number) => {
            if(depth>32) throw new RangeError('Maximum tree depth is 32');
            for(const n of nodes) {
                if(++count>2000) throw new RangeError('Maximum 2000 property nodes');
                if(typeof n.id!=='string'||!n.id||ids.has(n.id)) throw new TypeError('Property IDs must be unique');
                ids.add(n.id);
                if(n.min!=null) finite(n.min,'min'); if(n.max!=null) finite(n.max,'max');
                if(n.defaultValue!=null&&typeof n.defaultValue==='number')finite(n.defaultValue,'defaultValue');
                if(n.min!=null&&n.max!=null&&n.min>n.max) throw new RangeError('min exceeds max');
                if(n.extrapolation&&!['hold','linear','repeat','pingpong'].includes(n.extrapolation)) throw new TypeError('Invalid extrapolation');
                const names=new Set<string>(); const frames=new Set<number>();
                if(n.keyframes!=null&&!Array.isArray(n.keyframes)) throw new TypeError('keyframes must be an array');
                for(const k of n.keyframes??[]) {
                    if(++keyCount>50000) throw new RangeError('Maximum 50000 keyframes');
                    finite(k.frame,'Key frame'); if(frames.has(k.frame)) throw new RangeError('A channel cannot contain duplicate frames'); frames.add(k.frame);
                    if(typeof k.value==='number') finite(k.value,'Key value');
                    else if(typeof k.value!=='string'&&typeof k.value!=='boolean') throw new TypeError('Key value must be number, string or boolean');
                    k.id=k.id??uid(); if(typeof k.id!=='string'||!k.id||names.has(k.id)) throw new TypeError('Key IDs must be nonempty and unique in a channel'); names.add(k.id);
                    k.interpolation=k.interpolation??'linear';
                    if(!['constant','linear','bezier'].includes(k.interpolation)) throw new TypeError('Invalid interpolation');
                    for(const h of [k.handleIn,k.handleOut]) if(h) { if(h.length!==2) throw new TypeError('Tangent requires two numbers'); h.forEach(v=>finite(v,'Tangent')); }
                }
                n.keyframes?.sort((a,b)=>a.frame-b.frame);
                if(n.children) {if(!Array.isArray(n.children))throw new TypeError('children must be an array');visit(n.children,depth+1);}
            }
        };
        visit(tree.nodes,0); return tree;
    }
    export const Styles = new Css.Stylesheet([
        new Css.Rule('.KeyframeEditor', { '--kf-bg':'#25292d','--kf-field':'#1b1f22','--kf-border':'#111417','--kf-text':'#dce0e3','--kf-muted':'#9ea6ad','--kf-grid':'#ffffff22',
            Background:'var(--kf-bg)',Color:'var(--kf-text)',Border:'1px solid var(--kf-border)',BorderRadius:'8px',Width:'100%',MinWidth:'0',Height:'560px',MinHeight:'360px',BoxSizing:'border-box',Display:'grid',GridTemplateRows:'auto minmax(0,1fr) auto',Overflow:'hidden',Font:'12px system-ui,sans-serif',Position:'relative',UserSelect:'none' }),
        new Css.Rule('.KeyframeEditor[theme="light"]', {'--kf-bg':'#eef0f2','--kf-field':'#ffffff','--kf-border':'#b9bec3','--kf-text':'#25292d','--kf-muted':'#626a71','--kf-grid':'#00000028'}),
        new Css.Rule('.KeyframeEditor .kf-toolbar', {Display:'flex',FlexWrap:'wrap',AlignItems:'center',Gap:'5px',Padding:'6px 8px',MinHeight:'38px',BoxSizing:'border-box',Background:'linear-gradient(180deg,#363b40,#25292d)',BorderBottom:'1px solid var(--kf-border)'}),
        new Css.Rule('.KeyframeEditor[theme="light"] .kf-toolbar',{Background:'linear-gradient(180deg,#fff,#e1e4e7)'}),
        new Css.Rule('.KeyframeEditor button, .KeyframeEditor select, .KeyframeEditor input',{Font:'inherit',Color:'var(--kf-text)',Background:'var(--kf-field)',Border:'1px solid var(--kf-border)',BorderRadius:'3px',Height:'25px',BoxSizing:'border-box',Padding:'0 7px',MinWidth:'0'}),
        new Css.Rule('.KeyframeEditor button',{Cursor:'pointer',Background:'linear-gradient(180deg,#444a50,#30353a)'}),
        new Css.Rule('.KeyframeEditor[theme="light"] button',{Background:'linear-gradient(180deg,#f9fbfc,#e0e4e7)'}),
        new Css.Rule('.KeyframeEditor button[aria-pressed="true"]',{Background:'linear-gradient(180deg,#ff4dad,#e40c88 55%,#b90769)',Color:'#fff',BorderColor:'#e40c88'}),
        new Css.Rule('.KeyframeEditor button:disabled',{Opacity:'.4',Cursor:'default'}),
        new Css.Rule('.KeyframeEditor button[data-action="play"][aria-pressed="true"]',{Background:'var(--kf-field)',Color:'#9aff63',TextShadow:'0 0 8px #83ff42'}),
        new Css.Rule('.KeyframeEditor .kf-number',{Width:'68px'}),
        new Css.Rule('.KeyframeEditor .kf-viewport',{Overflow:'auto',MinHeight:'0',Position:'relative',TouchAction:'none'}),
        new Css.Rule('.KeyframeEditor .kf-content',{Position:'relative',MinWidth:'100%',MinHeight:'100%'}),
        new Css.Rule('.KeyframeEditor .kf-header, .KeyframeEditor .kf-row',{Display:'grid',GridTemplateColumns:'220px minmax(0,1fr)',Height:'32px'}),
        new Css.Rule('.KeyframeEditor .kf-header',{Position:'sticky',Top:'0',ZIndex:'6',Background:'var(--kf-bg)',BorderBottom:'1px solid var(--kf-border)'}),
        new Css.Rule('.KeyframeEditor .kf-name',{Position:'sticky',Left:'0',ZIndex:'5',Display:'flex',AlignItems:'center',Gap:'5px',Padding:'0 7px',Background:'var(--kf-bg)',BorderRight:'1px solid var(--kf-border)',BorderBottom:'1px solid var(--kf-border)',Overflow:'hidden',BoxSizing:'border-box'}),
        new Css.Rule('.KeyframeEditor .kf-name[data-active="true"]',{BoxShadow:'inset 3px 0 #e40c88',Background:'color-mix(in srgb,var(--kf-bg),#e40c88 14%)'}),
        new Css.Rule('.KeyframeEditor .kf-name .kf-label',{Flex:'1',Overflow:'hidden',TextOverflow:'ellipsis',WhiteSpace:'nowrap',Cursor:'pointer'}),
        new Css.Rule('.KeyframeEditor .kf-name button',{Padding:'0 3px',MinWidth:'20px',Height:'21px'}),
        new Css.Rule('.KeyframeEditor .kf-lanes',{Position:'absolute',Left:'220px',Top:'32px',Overflow:'visible',TouchAction:'none'}),
        new Css.Rule('.KeyframeEditor .kf-grid',{Stroke:'var(--kf-grid)',StrokeWidth:'1'}),
        new Css.Rule('.KeyframeEditor .kf-tick',{Position:'absolute',Top:'8px',Color:'var(--kf-muted)',FontSize:'10px'}),
        new Css.Rule('.KeyframeEditor .kf-key',{Cursor:'move',Stroke:'var(--kf-text)',StrokeWidth:'1.2'}),
        new Css.Rule('.KeyframeEditor .kf-key[data-selected="true"]',{Stroke:'#e40c88',StrokeWidth:'3',Fill:'#ff8ecc'}),
        new Css.Rule('.KeyframeEditor .kf-handle',{Cursor:'crosshair',Fill:'var(--kf-bg)',Stroke:'#e40c88',StrokeWidth:'2'}),
        new Css.Rule('.KeyframeEditor .kf-playhead',{Position:'absolute',Width:'2px',Top:'0',Bottom:'0',Background:'#ff526b',PointerEvents:'none',ZIndex:'4'}),
        new Css.Rule('.KeyframeEditor .kf-inspector',{Display:'flex',AlignItems:'center',FlexWrap:'wrap',Gap:'7px',Padding:'7px 8px',BorderTop:'1px solid var(--kf-border)',MinHeight:'32px'}),
        new Css.Rule('.KeyframeEditor .kf-status',{Color:'var(--kf-muted)',MarginLeft:'auto'}),
        new Css.Rule('.KeyframeEditor .kf-lasso',{Fill:'#e40c8822',Stroke:'#e40c88',StrokeWidth:'1',PointerEvents:'none'}),
        new Css.Rule('.KeyframeEditor .kf-menu',{Position:'absolute',ZIndex:'20',Display:'grid',Gap:'4px',Padding:'8px',Border:'1px solid var(--kf-border)',BorderRadius:'6px',Background:'var(--kf-bg)',BoxShadow:'0 8px 24px #0005'})
    ]);

    @Component('arianna-keyframe-editor', Styles, {
        Shadow:false,
        Attributes:['theme','frame-start','frame-end','current','fps','frame-px','frame-step','track-height','view','snap','loop','auto-channels'],
        Properties:['Tree','tree','tracks']
    })
    export class KeyframeEditor extends HTMLElement {
        public static readonly Styles=Styles;
        // Imperative editor: a blank template would consume declarative input
        // before onConnected can parse it on native construction paths.
        public template:null=null;
        private state():State {
            let s=states.get(this);
            if(!s) {s={tree:defaults(),initialized:false,ingest:false,writing:false,selected:new Set(),active:null,collapsed:new Set(),bindings:new Map(),history:[],future:[],clipboard:null,view:null,gesture:null,rollback:null,raf:null,created:null,lastTime:0,playing:false,scrollX:0,scrollY:0,urls:new Set(),timers:new Set(),epoch:0,error:'',graphLimits:null,scrollRaf:null,resize:null,menu:null};states.set(this,s);}
            return s;
        }
        constructor(options:Interfaces.KeyframeEditorOptions={}) {
            super(); const {Tree,tree,tracks,height,autoChannels,...settings}=options;
            if(Tree||tree)this.Tree={...settings,...(Tree??tree)!};
            else {this.state().tree=normalize({...defaults(),...settings,nodes:[]});if(tracks)this.tracks=tracks;}
            if(autoChannels)this.setAttribute('auto-channels','');
            if(height!=null)this.style.height=Math.max(360,height)+'px';
        }
        public get Tree():Interfaces.Tree {return structuredClone(this.state().tree);}
        public set Tree(tree:Interfaces.Tree) {
            const next=normalize(tree),s=this.state();this.cancelGesture();this.pause();
            s.tree=next;s.initialized=true;s.selected.clear();s.collapsed.clear();
            for(const r of this.allRows())if(r.node.expanded===false)s.collapsed.add(r.node.id);
            s.active=this.channels()[0]?.node.id??null;s.history=[];s.future=[];this.reflect();this.draw();
        }
        public get tree():Interfaces.Tree {return this.Tree;}
        public set tree(v:Interfaces.Tree){this.Tree=v;}
        public get tracks():Interfaces.TrackDefinition[]{return this.channels().map(c=>structuredClone(c.node));}
        public set tracks(items:Interfaces.TrackDefinition[]) {
            const folders=new Map<string,Interfaces.Node>();const nodes:Interfaces.Node[]=[];
            items.forEach((t,i)=>{const n={...structuredClone(t),id:t.id??'track-'+i};if(t.folder){let f=folders.get(t.folder);if(!f){f={id:'folder-'+folders.size,name:t.folder,children:[]};folders.set(t.folder,f);nodes.push(f);}f.children!.push(n);}else nodes.push(n);});
            this.Tree={...this.state().tree,nodes};
        }
        public get current():number{return this.state().tree.current!;}
        public set current(frame:number){this.setFrame(frame);}
        public get Current():number{return this.current;}
        public set Current(frame:number){this.setFrame(frame);}
        public get FrameRate():number{return this.state().tree.fps!;}
        public set FrameRate(v:number){this.setFps(v);}
        public get height():number{return parseFloat(this.style.height)||560;}
        public set height(value:number){this.style.height=Math.max(360,finite(value,'height'))+'px';}
        public get Selected():Interfaces.Selection[]{return [...this.state().selected].map(t=>{const [channel,key]=JSON.parse(t);return {channel,key};});}
        public get Playing():boolean{return this.state().playing;}
        public get Values():Record<string,Types.Value>{return this.Evaluate();}
        public onCreated():void {
            const s=this.state();if(s.created!=null)cancelAnimationFrame(s.created);
            s.created=requestAnimationFrame(()=>{s.created=null;if(this.isConnected&&!this.querySelector('.kf-viewport'))this.onConnected();});
        }
        public onConnected():void {
            const s=this.state();if(!this.classList.contains('KeyframeEditor'))this.classList.add('KeyframeEditor');if(!this.hasAttribute('tabindex'))this.tabIndex=0;
            if(!s.initialized)this.ingestMarkup();this.readAttributes();this.reflect();this.draw();
            if(!s.resize&&typeof ResizeObserver!=='undefined'){s.resize=new ResizeObserver(entries=>{const box=entries.find(entry=>entry.target===this)?.contentRect;if(!box||box.width===s.resizeWidth&&box.height===s.resizeHeight)return;s.resizeWidth=box.width;s.resizeHeight=box.height;if(s.scrollRaf==null)s.scrollRaf=requestAnimationFrame(()=>{s.scrollRaf=null;if(this.isConnected&&!s.gesture)this.draw();});});s.resize.observe(this);}
        }
        public render():HTMLElement {if(this.isConnected&&!this.querySelector('.kf-viewport'))this.onConnected();return this;}
        public onAttributeChanged(name:string):void {
            const s=this.state();if(s.writing||s.ingest||!this.isConnected)return;
            // Core's MutationObserver runs after reflect() has released writing.
            // Ignore reflected values and unrelated class/style/DOM notifications.
            const numeric:Record<string,number|undefined>={'frame-start':s.tree.frameStart,'frame-end':s.tree.frameEnd,current:s.tree.current,fps:s.tree.fps,'frame-px':s.tree.framePx,'frame-step':s.tree.frameStep,'track-height':s.tree.trackHeight};
            const value=this.getAttribute(name);
            if(Object.prototype.hasOwnProperty.call(numeric,name)){
                if(value===null||Number(value)===numeric[name])return;
            }else if(name==='theme'||name==='view'){
                if(value===null||value===s.tree[name])return;
            }else if(name==='snap'||name==='loop'){
                if(value===null||(value!=='false')===s.tree[name])return;
            }else return;
            try {if(name==='current'){this.setFrame(Number(this.getAttribute(name)??0));return;}this.readAttributes();this.draw();}
            catch(e){this.error(e);}
        }
        public onDisconnected():void {
            const s=this.state();this.pause();this.cancelGesture();s.view?.abort();s.view=null;
            s.resize?.disconnect();s.resize=null;s.resizeWidth=undefined;s.resizeHeight=undefined;s.menu?.abort();s.menu=null;
            if(s.created!=null)cancelAnimationFrame(s.created);s.created=null;
            if(s.scrollRaf!=null)cancelAnimationFrame(s.scrollRaf);s.scrollRaf=null;
            s.epoch++;for(const t of s.timers)clearTimeout(t);s.timers.clear();for(const u of s.urls)URL.revokeObjectURL(u);s.urls.clear();
        }
        public onUnmount():void {this.onDisconnected();}
        public dispose():void {this.onDisconnected();this.state().bindings.clear();}
        private ingestMarkup():void {
            const s=this.state();s.ingest=true;
            try {
                const json=Array.from(this.children).find(c=>c.tagName==='SCRIPT'&&c.getAttribute('type')==='application/json');
                if(json){s.tree=normalize(JSON.parse(json.textContent??'{}'));}
                else {
                    const visit=(el:Element,i:number):Interfaces.Node=>({
                        id:el.getAttribute('id')??el.getAttribute('channel')??'markup-'+i,
                        name:el.getAttribute('name')??el.getAttribute('label')??'Property',
                        channel:el.getAttribute('channel')??undefined,property:el.getAttribute('property')??undefined,
                        color:el.getAttribute('color')??undefined,locked:el.hasAttribute('locked'),muted:el.hasAttribute('muted'),hidden:el.hasAttribute('hidden'),
                        keyframes:Array.from(el.children).filter(k=>k.matches('arianna-keyframe')).map(k=>({frame:Number(k.getAttribute('frame')??0),value:Number(k.getAttribute('value')??0),interpolation:(k.getAttribute('interpolation')??'linear') as Types.Interpolation})),
                        children:Array.from(el.children).filter(c=>c.matches('arianna-anim-track,[data-keyframe-node]')).map((c,j)=>visit(c,i*100+j+1))
                    });
                    const nodes=Array.from(this.children).filter(c=>c.matches('arianna-anim-track,[data-keyframe-node]')).map(visit);
                    if(!nodes.length&&this.hasAttribute('auto-channels'))for(const group of ['position','rotation','scale'])nodes.push({id:group,name:group,children:['x','y','z'].map(axis=>({id:group+'.'+axis,name:axis.toUpperCase(),channel:group+'.'+axis,keyframes:[]}))});
                    s.tree=normalize({...s.tree,nodes});
                }
                s.initialized=true;s.active=this.channels()[0]?.node.id??null;
                for(const r of this.allRows())if(r.node.expanded===false)s.collapsed.add(r.node.id);
            }finally{s.ingest=false;}
        }
        private readAttributes():void {
            const s=this.state(),t=this.Tree;
            for(const [attr,prop]of [['frame-start','frameStart'],['frame-end','frameEnd'],['fps','fps'],['frame-px','framePx'],['frame-step','frameStep'],['track-height','trackHeight'],['current','current']] as const)
                if(this.hasAttribute(attr))t[prop]=Number(this.getAttribute(attr));
            if(this.hasAttribute('theme'))t.theme=this.getAttribute('theme')==='light'?'light':'dark';
            if(this.hasAttribute('view'))t.view=this.getAttribute('view') as Types.View;
            for(const k of ['snap','loop'] as const)if(this.hasAttribute(k))t[k]=this.getAttribute(k)!=='false';
            s.tree=normalize(t);
        }
        private reflect():void {
            const s=this.state();s.writing=true;
            try {for(const [attr,value]of Object.entries({theme:s.tree.theme,'frame-start':s.tree.frameStart,'frame-end':s.tree.frameEnd,current:s.tree.current,fps:s.tree.fps,'frame-px':s.tree.framePx,'frame-step':s.tree.frameStep,'track-height':s.tree.trackHeight,view:s.tree.view,snap:s.tree.snap,loop:s.tree.loop})){const text=String(value);if(this.getAttribute(attr)!==text)this.setAttribute(attr,text);}}
            finally{s.writing=false;}
        }
        private allRows():Row[] {
            const rows:Row[]=[];
            const visit=(nodes:Interfaces.Node[],depth:number,locked:boolean,muted:boolean)=>nodes.forEach(node=>{const row={node,depth,locked:locked||!!node.locked,muted:muted||!!node.muted,folder:!!node.children?.length};rows.push(row);if(node.children)visit(node.children,depth+1,row.locked,row.muted);});
            visit(this.state().tree.nodes,0,false,false);return rows;
        }
        private channels():Channel[]{return this.allRows().filter(r=>!r.folder||r.node.keyframes?.length);}
        private rows():Row[] {
            const out:Row[]=[];const s=this.state();
            const visit=(nodes:Interfaces.Node[],depth:number,locked:boolean,muted:boolean)=>nodes.forEach(node=>{if(node.hidden)return;const row={node,depth,locked:locked||!!node.locked,muted:muted||!!node.muted,folder:!!node.children?.length};out.push(row);if(node.children&&!s.collapsed.has(node.id))visit(node.children,depth+1,row.locked,row.muted);});
            visit(s.tree.nodes,0,false,false);return out;
        }
        private channel(id:string):Channel {const c=this.channels().find(c=>c.node.id===id);if(!c)throw new Error('Unknown channel '+id);return c;}
        private event(name:string,detail:unknown):void {this.dispatchEvent(new CustomEvent('arianna:keyframe-editor-'+name,{bubbles:true,composed:true,detail}));}
        private error(e:unknown):void {const message=e instanceof Error?e.message:String(e);this.state().error=message;const status=this.querySelector('.kf-status');if(status)status.textContent=message;this.event('error',{message});}
        private snapshot():string {return JSON.stringify(this.state().tree);}
        private record(before:string):void {const s=this.state();if(before!==this.snapshot()){s.history.push(before);if(s.history.length>100)s.history.shift();s.future=[];this.event('change',{tree:this.Tree,selected:this.Selected});}}
        private mutate(fn:()=>void):this {
            const before=this.snapshot();try{fn();this.state().tree=normalize(this.state().tree);this.record(before);this.state().error='';this.draw();this.Apply();return this;}
            catch(e){this.state().tree=JSON.parse(before);this.draw();throw e;}
        }
        public Evaluate(frame?:number):Record<string,Types.Value> {
            frame??=this.current;
            finite(frame,'Frame');const values:Record<string,Types.Value>=Object.create(null);
            for(const c of this.channels())if(!c.muted){const value=Sample(c.node.keyframes??[],frame,c.node.extrapolation)??c.node.defaultValue;if(value!==undefined)values[c.node.id]=typeof value==='number'?clamp(value,c.node.min??-Infinity,c.node.max??Infinity):value;}
            return values;
        }
        public Bind(channel:string,binding:Interfaces.Binding|((value:Types.Value,frame:number)=>void)):this {
            this.channel(channel);this.state().bindings.set(channel,typeof binding==='function'?{set:binding}:binding);return this;
        }
        public Unbind(channel?:string):this {if(channel)this.state().bindings.delete(channel);else this.state().bindings.clear();return this;}
        /** Explicit safe object path binding; functions and forbidden prototype paths are rejected. */
        public BindProperty(channel:string,target:object,path:string):this {
            const parts=path.split('.');if(parts.some(p=>!p||['__proto__','constructor','prototype'].includes(p)))throw new TypeError('Invalid property path');
            const parent=()=>{let obj:any=target;for(const p of parts.slice(0,-1)){obj=obj[p];if(!obj||typeof obj!=='object')throw new TypeError('Missing property '+p);}return obj;};
            parent();return this.Bind(channel,{get:()=>parent()[parts.at(-1)!],set:v=>{parent()[parts.at(-1)!]=v;}});
        }
        public Apply(frame?:number):Record<string,Types.Value> {
            frame??=this.current;
            const values=this.Evaluate(frame);
            for(const [id,b]of this.state().bindings)if(Object.prototype.hasOwnProperty.call(values,id)){try{b.set(values[id],frame);}catch(e){this.error(e);}}
            this.event('sample',{frame,seconds:frame/this.FrameRate,values});return values;
        }
        public setFrame(frame:number):this {
            const s=this.state();s.tree.current=clamp(finite(frame,'Frame'),s.tree.frameStart!,s.tree.frameEnd!);this.reflect();this.updatePlayhead();this.Apply();
            this.event('playhead',{frame:this.current,source:this});return this;
        }
        public SeekSeconds(seconds:number):this {return this.setFrame(finite(seconds,'Seconds')*this.FrameRate);}
        public setFps(fps:number):this {this.state().tree.fps=clamp(finite(fps,'fps'),1,240);this.reflect();this.draw();return this;}
        public play():void {
            const s=this.state();if(s.playing||!this.isConnected)return;this.cancelGesture();
            if(this.current>=s.tree.frameEnd!)this.setFrame(s.tree.frameStart!);
            s.playing=true;s.lastTime=performance.now();this.toggleAttribute('playing',true);this.updateTransport();this.event('play',{source:this});
            const tick=(now:number)=>{s.raf=null;if(!s.playing||!this.isConnected)return;
                const next=this.current+(now-s.lastTime)*s.tree.fps!/1000;s.lastTime=now;
                if(next>=s.tree.frameEnd!){if(s.tree.loop)this.setFrame(s.tree.frameStart!+(next-s.tree.frameStart!)%(s.tree.frameEnd!-s.tree.frameStart!));else{this.setFrame(s.tree.frameEnd!);this.pause();return;}}
                else this.setFrame(next);if(s.playing)s.raf=requestAnimationFrame(tick);
            };s.raf=requestAnimationFrame(tick);
        }
        public pause():void {const s=this.state(),was=s.playing;s.playing=false;if(s.raf!=null)cancelAnimationFrame(s.raf);s.raf=null;this.removeAttribute('playing');this.updateTransport();if(was)this.event('pause',{source:this});}
        public Stop():void {this.pause();this.setFrame(this.state().tree.frameStart!);}
        public togglePlay():void {this.Playing?this.pause():this.play();}
        public Select(selection:Interfaces.Selection[],add=false):this {
            const s=this.state();if(!add)s.selected.clear();for(const {channel,key}of selection)if(this.channel(channel).node.keyframes?.some(k=>k.id===key))s.selected.add(token(channel,key));
            this.draw();this.event('selection',{selected:this.Selected});return this;
        }
        public AddKey(channel:string,frame?:number,value?:Types.Value):this {
            frame??=this.current;
            const c=this.channel(channel);if(c.locked)return this;
            const bound=this.state().bindings.get(channel);const v=value??bound?.get?.()??this.Evaluate(frame)[channel]??c.node.defaultValue??0;
            return this.mutate(()=>{const keys=c.node.keyframes??(c.node.keyframes=[]),existing=keys.find(k=>Math.abs(k.frame-frame)<1e-8);if(existing)existing.value=v;else{const k={id:uid(),frame:finite(frame,'Frame'),value:v,interpolation:'linear' as const};keys.push(k);this.state().selected=new Set([token(channel,k.id)]);}});
        }
        public DeleteSelected():this {return this.mutate(()=>{for(const c of this.channels())if(!c.locked)c.node.keyframes=(c.node.keyframes??[]).filter(k=>!this.state().selected.has(token(c.node.id,k.id!)));this.state().selected.clear();});}
        public SetInterpolation(interpolation:Types.Interpolation):this {return this.mutate(()=>{for(const c of this.channels())if(!c.locked)for(const k of c.node.keyframes??[])if(this.state().selected.has(token(c.node.id,k.id!)))k.interpolation=interpolation;});}
        public SetTangents(mode:'auto'|'flat'|'ease'):this {return this.mutate(()=>{for(const c of this.channels())if(!c.locked){const ks=c.node.keyframes??[];ks.forEach((k,i)=>{if(typeof k.value!=='number'||!this.state().selected.has(token(c.node.id,k.id!)))return;const prev=ks[i-1]??k,next=ks[i+1]??k;const slope=mode==='auto'&&typeof prev.value==='number'&&typeof next.value==='number'&&next.frame>prev.frame?(next.value-prev.value)/(next.frame-prev.frame):0;const a=(k.frame-prev.frame)/3,b=(next.frame-k.frame)/3;k.handleIn=[-a,-a*slope];k.handleOut=[b,b*slope];k.interpolation='bezier';});}});}
        public Undo():this {const s=this.state();this.cancelGesture();const prev=s.history.pop();if(prev){s.future.push(this.snapshot());s.tree=JSON.parse(prev);s.selected.clear();this.reflect();this.draw();this.Apply();this.event('change',{tree:this.Tree});}return this;}
        public Redo():this {const s=this.state();const next=s.future.pop();if(next){s.history.push(this.snapshot());s.tree=JSON.parse(next);s.selected.clear();this.reflect();this.draw();this.Apply();this.event('change',{tree:this.Tree});}return this;}
        public Copy():Interfaces.Clipboard {const items:Interfaces.Clipboard['items']=[];for(const c of this.channels())for(const k of c.node.keyframes??[])if(this.state().selected.has(token(c.node.id,k.id!)))items.push({channel:c.node.id,key:structuredClone(k)});return this.state().clipboard={format:'arianna-keyframes',version:1,items};}
        public Cut():this {this.Copy();return this.DeleteSelected();}
        public Paste(data?:Interfaces.Clipboard|null,frame?:number):this {
            if(data===undefined)data=this.state().clipboard;frame??=this.current;
            if(!data?.items.length)return this;if(data.format!=='arianna-keyframes'||data.version!==1)throw new TypeError('Invalid clipboard');
            const first=Math.min(...data.items.map(i=>i.key.frame));
            return this.mutate(()=>{this.state().selected.clear();for(const item of data.items){const c=this.channels().find(c=>c.node.id===item.channel);if(!c||c.locked)continue;const k={...structuredClone(item.key),id:uid(),frame:item.key.frame-first+frame};const keys=c.node.keyframes??(c.node.keyframes=[]);c.node.keyframes=keys.filter(old=>old.frame!==k.frame);c.node.keyframes.push(k);this.state().selected.add(token(c.node.id,k.id));}});
        }
        public Export():Interfaces.Tree {return this.Tree;}
        public Import(data:string|Interfaces.Tree):this {this.Tree=typeof data==='string'?JSON.parse(data):data;return this;}
        public Download():void {
            const s=this.state(),url=URL.createObjectURL(new Blob([JSON.stringify(this.Export(),null,2)],{type:'application/json'}));s.urls.add(url);
            const a=document.createElement('a');a.href=url;a.download='arianna-keyframes.json';document.body.append(a);a.click();a.remove();
            const timer=setTimeout(()=>{URL.revokeObjectURL(url);s.urls.delete(url);s.timers.delete(timer);},1000);s.timers.add(timer);
        }
        public addTrack(track:HTMLElement):this {
            const definition=(track as any).keyframes??Array.from(track.querySelectorAll('arianna-keyframe')).map(k=>({frame:Number(k.getAttribute('frame')),value:Number(k.getAttribute('value'))}));
            this.tracks=[...this.tracks,{id:track.id||'track-'+uid(),name:track.getAttribute('name')??'Property',channel:track.getAttribute('channel')??undefined,keyframes:definition}];return this;
        }
        private button(label:string,action:string,title=label):HTMLButtonElement {const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.action=action;b.title=title;return b;}
        private element(tag:string,className:string):HTMLElement {const e=document.createElement(tag);e.className=className;return e;}
        private svg(tag:string,attrs:Record<string,string|number>):SVGElement {const e=document.createElementNS(svgNS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,String(v)));return e;}
        private width():number {const t=this.state().tree;return Math.min(200000,Math.max(600,(t.frameEnd!-t.frameStart!)*t.framePx!));}
        private x(frame:number):number {const t=this.state().tree;return (frame-t.frameStart!)/(t.frameEnd!-t.frameStart!)*this.width();}
        private frame(x:number):number {const t=this.state().tree;const f=t.frameStart!+x/this.width()*(t.frameEnd!-t.frameStart!);return t.snap?Math.round(f):f;}
        private range(c:Channel):[number,number] {
            if(this.state().graphLimits && this.state().active===c.node.id)return this.state().graphLimits!;
            const values=(c.node.keyframes??[]).filter(k=>typeof k.value==='number').map(k=>k.value as number);
            const min=values.length?Math.min(...values):0,max=values.length?Math.max(...values):1,pad=Math.max(.1,(max-min)*.15);
            return [c.node.min??min-pad,c.node.max??max+pad];
        }
        private graphY(value:number,c:Channel,height:number):number {const [a,b]=this.range(c);return 20+(b-value)/(b-a||1)*(height-40);}
        private graphValue(y:number,c:Channel,height:number):number {const [a,b]=this.range(c);return b-(y-20)/(height-40)*(b-a||1);}
        private draw():void {
            if(!this.isConnected)return;const s=this.state();const old=this.querySelector<HTMLElement>('.kf-viewport');if(old){s.scrollX=old.scrollLeft;s.scrollY=old.scrollTop;}
            s.view?.abort();s.menu?.abort();s.menu=null;s.view=new AbortController();const signal=s.view.signal;
            if(!this.classList.contains('KeyframeEditor'))this.classList.add('KeyframeEditor');const toolbar=this.element('div','kf-toolbar');
            for(const [label,a,title]of [['▶','play','Play / pause · Space'],['■','stop','Stop'],['◀','previous','Previous keyframe'],['▶|','next','Next keyframe'],['Sheet','sheet','Dope Sheet'],['Curves','curves','Curve Editor'],['Snap','snap','Snap to frames'],['Loop','loop','Loop playback'],['+ Key','add','Add key to active property'],['−','delete','Delete selected keys'],['Undo','undo','Undo'],['Redo','redo','Redo'],['Copy','copy','Copy selected keys'],['Paste','paste','Paste at playhead'],['Fit','fit','Fit timeline'],['Import','import','Import JSON'],['Export','export','Export JSON']])toolbar.append(this.button(label,a,title));
            for(const [name,v,label]of [['current',this.current,'Frame'],['start',s.tree.frameStart!,'Start'],['end',s.tree.frameEnd!,'End'],['fps',this.FrameRate,'FPS'],['zoom',s.tree.framePx!,'Pixels/frame']] as const){const l=this.element('label','');l.textContent=label+' ';const input=document.createElement('input');input.type='number';input.className='kf-number';input.dataset.setting=name;input.value=String(v);input.step=name==='zoom'?'.5':'1';l.append(input);toolbar.append(l);}
            const file=document.createElement('input');file.type='file';file.accept='.json,application/json';file.hidden=true;file.dataset.file='true';toolbar.append(file);
            const viewport=this.element('div','kf-viewport'),content=this.element('div','kf-content'),header=this.element('div','kf-header');content.style.width=this.width()+220+'px';
            const corner=this.element('div','kf-name');corner.textContent='Properties';const ruler=this.element('div','');ruler.style.position='relative';ruler.dataset.ruler='true';header.append(corner,ruler);content.append(header);
            const visible=this.rows(),height=s.tree.view==='curves'?Math.max(320,this.clientHeight-150):Math.max(80,visible.length*s.tree.trackHeight!);
            for(const row of visible){const el=this.element('div','kf-row');el.style.height=s.tree.trackHeight+'px';const name=this.element('div','kf-name');name.dataset.active=String(s.active===row.node.id);name.style.paddingLeft=7+row.depth*12+'px';name.dataset.channel=row.node.id;
                if(row.folder){const b=this.button(s.collapsed.has(row.node.id)?'▸':'▾','folder');b.dataset.channel=row.node.id;name.append(b);}
                const label=this.element('span','kf-label');label.textContent=row.node.name??row.node.label??row.node.channel??row.node.id;label.title=row.node.property??row.node.id;name.append(label);
                for(const [text,action,pressed]of [['M','mute',row.muted],['L','lock',row.locked]] as const){const b=this.button(text,action);b.dataset.channel=row.node.id;b.setAttribute('aria-pressed',String(pressed));name.append(b);}el.append(name);content.append(el);
            }
            content.style.minHeight=height+32+'px';const svg=this.svg('svg',{width:this.width(),height,class:'kf-lanes',viewBox:`0 0 ${this.width()} ${height}`});svg.setAttribute('aria-label',s.tree.view==='curves'?'Curve Editor':'Keyframe timeline');
            const step=Math.max(s.tree.frameStep!,Math.ceil((s.tree.frameEnd!-s.tree.frameStart!)/400));
            // A bounded index also terminates at very large frame numbers where
            // floating point addition may otherwise leave frame unchanged.
            for(let index=0;index<=400;index++){const frame=s.tree.frameStart!+index*step;if(frame>s.tree.frameEnd!)break;const x=this.x(frame);svg.append(this.svg('line',{x1:x,x2:x,y1:0,y2:height,class:'kf-grid'}));const tick=this.element('span','kf-tick');tick.style.left=x+'px';tick.textContent=String(Math.round(frame*100)/100);ruler.append(tick);}
            const left=s.scrollX-20,right=s.scrollX+Math.max(600,(old?.clientWidth??1000)-220)+20;
            if(s.tree.view==='sheet')visible.forEach((row,i)=>{svg.append(this.svg('line',{x1:0,x2:this.width(),y1:(i+1)*s.tree.trackHeight!,y2:(i+1)*s.tree.trackHeight!,class:'kf-grid'}));if(row.folder&&!row.node.keyframes?.length)return;
                if((i+1)*s.tree.trackHeight!<s.scrollY-32||i*s.tree.trackHeight!>s.scrollY+(old?.clientHeight??600))return;
                for(const k of row.node.keyframes??[])if(k.frame>=s.tree.frameStart!&&k.frame<=s.tree.frameEnd!&&this.x(k.frame)>=left&&this.x(k.frame)<=right){const key=this.svg('path',{d:'M0 -5 L5 0 L0 5 L-5 0Z',transform:`translate(${this.x(k.frame)},${(i+.5)*s.tree.trackHeight!})`,fill:row.node.color??'#4d9de0',class:'kf-key','data-channel':row.node.id,'data-key':k.id!,'data-selected':String(s.selected.has(token(row.node.id,k.id!)))});svg.append(key);}});
            else {
                const c=this.channels().find(c=>c.node.id===s.active&&!c.node.hidden);
                if(c){const [min,max]=this.range(c);for(let i=0;i<=8;i++){const y=20+i*(height-40)/8;svg.append(this.svg('line',{x1:0,x2:this.width(),y1:y,y2:y,class:'kf-grid'}));const text=this.svg('text',{x:8,y:y-3,fill:'var(--kf-muted)','font-size':10});text.textContent=String(Math.round((max-(max-min)*i/8)*1000)/1000);svg.append(text);}
                    const keys=c.node.keyframes??[];
                    let d='';for(let i=0;i<keys.length;i++){
                        const a=keys[i],b=keys[i+1];if(typeof a.value!=='number')continue;
                        if(!i||typeof keys[i-1].value!=='number')d+=`M ${this.x(a.frame)} ${this.graphY(a.value,c,height)} `;
                        if(!b||typeof b.value!=='number')continue;
                        if(a.interpolation==='constant')d+=`H ${this.x(b.frame)} V ${this.graphY(b.value,c,height)} `;
                        else if(a.interpolation==='bezier'){
                            const span=b.frame-a.frame,out=a.handleOut??[span/3,(b.value-a.value)/3],input=b.handleIn??[-span/3,-(b.value-a.value)/3];
                            let f1=clamp(a.frame+out[0],a.frame,b.frame),f2=clamp(b.frame+input[0],a.frame,b.frame);if(f1>f2)f1=f2=(f1+f2)/2;
                            d+=`C ${this.x(f1)} ${this.graphY(a.value+out[1],c,height)}, ${this.x(f2)} ${this.graphY(b.value+input[1],c,height)}, ${this.x(b.frame)} ${this.graphY(b.value,c,height)} `;
                        }else d+=`L ${this.x(b.frame)} ${this.graphY(b.value,c,height)} `;
                    }
                    if(d)svg.append(this.svg('path',{d,stroke:c.node.color??'#4d9de0',fill:'none','stroke-width':2,'pointer-events':'none'}));
                    for(const k of keys)if(typeof k.value==='number'&&this.x(k.frame)>=left&&this.x(k.frame)<=right){
                        const x=this.x(k.frame),y=this.graphY(k.value,c,height),selected=s.selected.has(token(c.node.id,k.id!));
                        if(selected)for(const side of ['handleIn','handleOut'] as const){const i=keys.indexOf(k),n=side==='handleIn'?keys[i-1]:keys[i+1];if(!n||typeof n.value!=='number')continue;const h=k[side]??[(n.frame-k.frame)/3,(n.value-k.value)/3];const hx=this.x(k.frame+h[0]),hy=this.graphY(k.value+h[1],c,height);
                            svg.append(this.svg('line',{x1:x,y1:y,x2:hx,y2:hy,stroke:'#e40c88','stroke-width':1}));svg.append(this.svg('circle',{cx:hx,cy:hy,r:4,class:'kf-handle','data-channel':c.node.id,'data-key':k.id!,'data-handle':side}));}
                        svg.append(this.svg('circle',{cx:x,cy:y,r:5,fill:c.node.color??'#4d9de0',class:'kf-key','data-channel':c.node.id,'data-key':k.id!,'data-selected':String(selected)}));
                    }
                }
            }
            content.append(svg);const playhead=this.element('div','kf-playhead');content.append(playhead);viewport.append(content);
            const inspector=this.inspector();this.replaceChildren(toolbar,viewport,inspector);viewport.scrollLeft=s.scrollX;viewport.scrollTop=s.scrollY;this.updatePlayhead();this.updateTransport();
            this.addEventListener('click',e=>this.handleClick(e),{signal});
            this.addEventListener('change',e=>this.change(e),{signal});
            this.addEventListener('keydown',e=>this.keydown(e),{signal});
            this.addEventListener('contextmenu',e=>this.menu(e),{signal});
            viewport.addEventListener('scroll',()=>{if(s.scrollX===viewport.scrollLeft&&s.scrollY===viewport.scrollTop)return;s.scrollX=viewport.scrollLeft;s.scrollY=viewport.scrollTop;if(s.scrollRaf==null)s.scrollRaf=requestAnimationFrame(()=>{s.scrollRaf=null;if(this.isConnected&&!s.gesture)this.draw();});},{signal});
            svg.addEventListener('pointerdown',e=>this.pointer(e as PointerEvent,svg,height,visible),{signal});
            ruler.addEventListener('pointerdown',e=>this.scrub(e,ruler),{signal});
            svg.addEventListener('dblclick',e=>{try{const p=this.local(e as MouseEvent,svg);const row=s.tree.view==='sheet'?visible[Math.floor(p.y/s.tree.trackHeight!)]:this.channels().find(c=>c.node.id===s.active);if(!row||('folder'in row&&row.folder))return;s.active=row.node.id;this.AddKey(row.node.id,this.frame(p.x),s.tree.view==='curves'?this.graphValue(p.y,row,height):undefined);}catch(err){this.error(err);}},{signal});
        }
        private inspector():HTMLElement {
            const bar=this.element('div','kf-inspector'),s=this.state(),sel=this.Selected[0],c=sel?this.channel(sel.channel):null,k=c?.node.keyframes?.find(k=>k.id===sel?.key);
            if(k){for(const [prop,value]of [['frame',k.frame],['value',k.value]] as const){const label=this.element('label','');label.textContent=prop+' ';const input=document.createElement('input');input.type=typeof value==='number'?'number':'text';input.step='any';input.className='kf-number';input.value=String(value);input.dataset.edit=prop;label.append(input);bar.append(label);}
                const interpolation=document.createElement('select');interpolation.dataset.edit='interpolation';for(const mode of ['constant','linear','bezier']){const o=document.createElement('option');o.value=mode;o.textContent=mode;interpolation.append(o);}interpolation.value=k.interpolation??'linear';bar.append(interpolation);
                for(const mode of ['auto','flat','ease'])bar.append(this.button(mode,mode,'Bézier '+mode+' tangents'));
            }
            if(s.active){const c=this.channel(s.active);const select=document.createElement('select');select.dataset.edit='extrapolation';select.title='Extrapolation';for(const mode of ['hold','linear','repeat','pingpong']){const o=document.createElement('option');o.value=mode;o.textContent=mode;select.append(o);}select.value=c.node.extrapolation??'hold';bar.append(select);}
            const status=this.element('span','kf-status');status.textContent=s.error||`${s.selected.size} selected · ${this.channels().length} properties · double click adds a key`;bar.append(status);return bar;
        }
        private updatePlayhead():void {
            const p=this.querySelector<HTMLElement>('.kf-playhead');if(p)p.style.left=220+this.x(this.current)+'px';
            const i=this.querySelector<HTMLInputElement>('input[data-setting="current"]');if(i&&i!==document.activeElement)i.value=String(Math.round(this.current*1000)/1000);
        }
        private updateTransport():void {
            const s=this.state();for(const b of Array.from(this.querySelectorAll<HTMLButtonElement>('button[data-action]'))){const a=b.dataset.action;const active=a==='play'?s.playing:a==='sheet'||a==='curves'?s.tree.view===a:a==='snap'?s.tree.snap:a==='loop'?s.tree.loop:false;
                if(['play','sheet','curves','snap','loop'].includes(a??''))b.setAttribute('aria-pressed',String(active));if(a==='undo')b.disabled=!s.history.length;if(a==='redo')b.disabled=!s.future.length;}
        }
        private handleClick(e:Event):void {
            if((e.target as Element).closest('.KeyframeEditor')!==this)return;
            const target=e.target as Element,b=target.closest<HTMLButtonElement>('button[data-action]');
            try {
                if(!b){const name=target.closest<HTMLElement>('.kf-name[data-channel]');if(name){const row=this.allRows().find(r=>r.node.id===name.dataset.channel);if(row&&!row.folder){this.state().active=row.node.id;this.draw();}}return;}
                const s=this.state(),a=b.dataset.action!;this.focus({preventScroll:true});
                if(a==='folder'){const id=b.dataset.channel!;s.collapsed.has(id)?s.collapsed.delete(id):s.collapsed.add(id);this.draw();}
                else if(a==='mute'||a==='lock'){const node=this.allRows().find(r=>r.node.id===b.dataset.channel)!.node;this.mutate(()=>{if(a==='mute')node.muted=!node.muted;else node.locked=!node.locked;});}
                else if(a==='play')this.togglePlay();else if(a==='stop')this.Stop();
                else if(a==='sheet'||a==='curves'){s.tree.view=a;this.reflect();this.draw();}
                else if(a==='snap'||a==='loop'){s.tree[a]=!s.tree[a];this.reflect();this.updateTransport();}
                else if(a==='add'&&s.active)this.AddKey(s.active);
                else if(a==='delete')this.DeleteSelected();else if(a==='undo')this.Undo();else if(a==='redo')this.Redo();
                else if(a==='copy')this.Copy();else if(a==='cut')this.Cut();else if(a==='paste')this.Paste();
                else if(a==='auto'||a==='flat'||a==='ease')this.SetTangents(a);
                else if(['constant','linear','bezier'].includes(a))this.SetInterpolation(a as Types.Interpolation);
                else if(a==='export')this.Download();else if(a==='import')this.querySelector<HTMLInputElement>('input[data-file]')?.click();
                else if(a==='fit'){const vp=this.querySelector<HTMLElement>('.kf-viewport');s.tree.framePx=Math.max(.1,((vp?.clientWidth??1000)-240)/(s.tree.frameEnd!-s.tree.frameStart!));s.scrollX=0;this.reflect();this.draw();}
                else if(a==='previous'||a==='next'){const frames=this.channels().flatMap(c=>(c.node.keyframes??[]).map(k=>k.frame));const possible=frames.filter(f=>a==='previous'?f<this.current:f>this.current);this.setFrame(possible.length?(a==='previous'?Math.max(...possible):Math.min(...possible)):(a==='previous'?s.tree.frameStart!:s.tree.frameEnd!));}
            }catch(err){this.error(err);}
        }
        private async change(e:Event):Promise<void> {
            const input=e.target as HTMLInputElement;if(input.closest('.KeyframeEditor')!==this)return;const s=this.state();
            try {
                if(input.dataset.file){const file=input.files?.[0],epoch=s.epoch;if(file){const data=await file.text();if(s.epoch===epoch&&this.isConnected)this.Import(data);}return;}
                if(input.dataset.setting==='current')this.setFrame(Number(input.value));
                else if(input.dataset.setting==='fps')this.setFps(Number(input.value));
                else if(input.dataset.setting==='start'||input.dataset.setting==='end'){const tree=this.Tree;tree[input.dataset.setting==='start'?'frameStart':'frameEnd']=Number(input.value);s.tree=normalize(tree);this.reflect();this.draw();}
                else if(input.dataset.setting==='zoom'){s.tree.framePx=clamp(finite(Number(input.value),'Zoom'),.1,100);this.reflect();this.draw();}
                else if(input.dataset.edit==='interpolation')this.SetInterpolation(input.value as Types.Interpolation);
                else if(input.dataset.edit==='extrapolation'&&s.active)this.mutate(()=>{this.channel(s.active!).node.extrapolation=input.value as Types.Extrapolation;});
                else if(input.dataset.edit){const selected=this.Selected[0];if(!selected)return;const c=this.channel(selected.channel);if(c.locked)return;const key=c.node.keyframes!.find(k=>k.id===selected.key)!;
                    this.mutate(()=>{if(input.dataset.edit==='frame')key.frame=finite(Number(input.value),'Frame');else key.value=typeof key.value==='number'?finite(Number(input.value),'Value'):typeof key.value==='boolean'?input.value==='true':input.value;});}
            }catch(err){this.error(err);}
        }
        private keydown(e:KeyboardEvent):void {
            if((e.target as Element).closest('.KeyframeEditor')!==this||(e.target as Element).closest('input,textarea,select,[contenteditable="true"]'))return;
            const mod=e.ctrlKey||e.metaKey;
            try{if(e.key==='Escape'){this.cancelGesture();this.state().selected.clear();this.draw();}
                else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();this.DeleteSelected();}
                else if(e.code==='Space'){e.preventDefault();this.togglePlay();}
                else if(mod&&e.key.toLowerCase()==='a'){e.preventDefault();this.Select(this.channels().flatMap(c=>(c.node.keyframes??[]).map(k=>({channel:c.node.id,key:k.id!}))));}
                else if(mod&&['c','x','v','z','y'].includes(e.key.toLowerCase())){e.preventDefault();const k=e.key.toLowerCase();if(k==='c')this.Copy();if(k==='x')this.Cut();if(k==='v')this.Paste();if(k==='z')e.shiftKey?this.Redo():this.Undo();if(k==='y')this.Redo();}
                else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();this.setFrame(this.current+(e.key==='ArrowLeft'?-1:1));}
            }catch(err){this.error(err);}
        }
        private local(e:MouseEvent,svg:SVGElement):{x:number;y:number} {const r=svg.getBoundingClientRect();return {x:(e.clientX-r.left)*this.width()/(r.width||this.width()),y:(e.clientY-r.top)*Number(svg.getAttribute('height'))/(r.height||Number(svg.getAttribute('height')))};}
        private cancelGesture():void {const s=this.state();s.gesture?.abort();s.gesture=null;s.graphLimits=null;if(s.rollback){s.tree=JSON.parse(s.rollback);s.rollback=null;}}
        private gesture(e:PointerEvent,move:(e:PointerEvent)=>void,finish:()=>void,cancel:()=>void):void {
            const s=this.state();s.gesture?.abort();const controller=new AbortController();s.gesture=controller;
            const signal=controller.signal,id=e.pointerId;
            const done=(event:PointerEvent,aborted:boolean)=>{if(event.pointerId!==id)return;controller.abort();s.gesture=null;aborted?cancel():finish();};
            window.addEventListener('pointermove',event=>{if(event.pointerId===id)move(event);},{signal});
            window.addEventListener('pointerup',event=>done(event,false),{signal});window.addEventListener('pointercancel',event=>done(event,true),{signal});
            window.addEventListener('blur',()=>{controller.abort();s.gesture=null;cancel();},{once:true,signal});
        }
        private scrub(e:PointerEvent,ruler:HTMLElement):void {
            if(e.button!==0)return;e.preventDefault();this.focus({preventScroll:true});this.pause();
            const seek=(event:PointerEvent)=>{const r=ruler.getBoundingClientRect();this.setFrame(this.frame(event.clientX-r.left));};seek(e);this.gesture(e,seek,()=>{},()=>{});
        }
        private pointer(e:PointerEvent,svg:SVGElement,height:number,rows:Row[]):void {
            if(e.button!==0)return;e.preventDefault();this.focus({preventScroll:true});this.pause();this.cancelGesture();
            const s=this.state(),target=(e.target as Element).closest<SVGElement>('[data-key]'),origin=this.local(e,svg);
            // Keep gesture coordinates stable even when SVG nodes are redrawn or detached.
            const bounds=svg.getBoundingClientRect(),logicalWidth=this.width();
            const local=(event:MouseEvent)=>({x:(event.clientX-bounds.left)*logicalWidth/(bounds.width||logicalWidth),y:(event.clientY-bounds.top)*height/(bounds.height||height)});
            if(target){const c=this.channel(target.dataset.channel!),k=c.node.keyframes!.find(k=>k.id===target.dataset.key)!;if(c.locked)return;
                const t=token(c.node.id,k.id!);if(e.shiftKey||e.ctrlKey||e.metaKey){s.selected.has(t)?s.selected.delete(t):s.selected.add(t);}else if(!s.selected.has(t))s.selected=new Set([t]);
                s.active=c.node.id;if(!s.selected.has(t)){this.draw();return;}const before=this.snapshot();s.rollback=before;
                const originals=this.channels().flatMap(ch=>(ch.node.keyframes??[]).filter(key=>!ch.locked&&s.selected.has(token(ch.node.id,key.id!))).map(key=>({ch,key,frame:key.frame,value:key.value})));
                const range=this.range(c),valueDelta=(dy:number)=>-dy/(height-40)*(range[1]-range[0]);s.graphLimits=range;
                const side=target.dataset.handle as 'handleIn'|'handleOut'|undefined;
                const graph=s.tree.view==='curves';
                this.gesture(e,event=>{const p=local(event);let df=this.frame(p.x)-this.frame(origin.x);if(event.shiftKey)df=0;
                    if(side&&typeof k.value==='number'){k[side]=[side==='handleIn'?Math.min(0,this.frame(p.x)-k.frame):Math.max(0,this.frame(p.x)-k.frame),this.graphValue(p.y,c,height)-k.value];k.interpolation='bezier';}
                    else {const low=Math.max(...originals.map(o=>s.tree.frameStart!-o.frame)),high=Math.min(...originals.map(o=>s.tree.frameEnd!-o.frame));df=clamp(df,low,high);for(const o of originals){o.key.frame=o.frame+df;if(graph&&typeof o.value==='number')o.key.value=clamp(o.value+valueDelta(p.y-origin.y),o.ch.node.min??-Infinity,o.ch.node.max??Infinity);}}
                    for(const o of originals)o.ch.node.keyframes?.sort((a,b)=>a.frame-b.frame);
                    this.draw();this.Apply();
                },()=>{s.rollback=null;s.graphLimits=null;try{s.tree=normalize(s.tree);this.record(before);this.draw();this.Apply();}catch(err){s.tree=JSON.parse(before);this.draw();this.Apply();this.error(err);}},()=>{s.tree=JSON.parse(before);s.rollback=null;s.graphLimits=null;this.draw();this.Apply();});
                this.draw();this.event('selection',{selected:this.Selected});
            }else{
                const previous=new Set(s.selected);if(!e.shiftKey)s.selected.clear();const lasso=this.svg('rect',{x:origin.x,y:origin.y,width:0,height:0,class:'kf-lasso'});svg.append(lasso);
                this.gesture(e,event=>{const p=this.local(event,svg),x=Math.min(origin.x,p.x),y=Math.min(origin.y,p.y),w=Math.abs(p.x-origin.x),h=Math.abs(p.y-origin.y);for(const [a,v]of Object.entries({x,y,width:w,height:h}))lasso.setAttribute(a,String(v));s.selected=e.shiftKey?new Set(previous):new Set();
                    const channels=s.tree.view==='sheet'?rows.filter(r=>!r.folder):this.channels().filter(c=>c.node.id===s.active);
                    for(const c of channels)for(const k of c.node.keyframes??[]){const ky=s.tree.view==='sheet'?(rows.findIndex(r=>r.node.id===c.node.id)+.5)*s.tree.trackHeight!:typeof k.value==='number'?this.graphY(k.value,c,height):-Infinity,kx=this.x(k.frame);if(kx>=x&&kx<=x+w&&ky>=y&&ky<=y+h)s.selected.add(token(c.node.id,k.id!));}
                },()=>{this.draw();this.event('selection',{selected:this.Selected});},()=>{s.selected=previous;this.draw();});
            }
        }
        private menu(e:MouseEvent):void {
            if((e.target as Element).closest('.KeyframeEditor')!==this||(e.target as Element).closest('input,select'))return;e.preventDefault();
            this.state().menu?.abort();this.querySelector('.kf-menu')?.remove();const key=(e.target as Element).closest<SVGElement>('[data-key]');if(key)this.Select([{channel:key.dataset.channel!,key:key.dataset.key!}]);
            const menu=this.element('div','kf-menu');menu.setAttribute('role','menu');for(const [label,action]of [['Copy','copy'],['Cut','cut'],['Paste','paste'],['Delete','delete'],['Constant','constant'],['Linear','linear'],['Bézier','bezier']])menu.append(this.button(label,action));
            const r=this.getBoundingClientRect();menu.style.left=clamp(e.clientX-r.left,0,Math.max(0,r.width-160))+'px';menu.style.top=clamp(e.clientY-r.top,0,Math.max(0,r.height-230))+'px';this.append(menu);menu.querySelector('button')?.focus();
            const controller=new AbortController();this.state().menu=controller;const signal=controller.signal;
            const dismiss=()=>{menu.remove();controller.abort();if(this.state().menu===controller)this.state().menu=null;};
            window.addEventListener('pointerdown',event=>{if(!menu.contains(event.target as Node))dismiss();},{signal});
            window.addEventListener('resize',dismiss,{signal});
            menu.addEventListener('click',dismiss,{signal});menu.addEventListener('keydown',event=>{
                if(event.key==='Escape'){event.preventDefault();dismiss();this.focus();}
                else if(['ArrowUp','ArrowDown','Home','End'].includes(event.key)){event.preventDefault();const buttons=Array.from(menu.querySelectorAll<HTMLButtonElement>('button'));const i=buttons.indexOf(document.activeElement as HTMLButtonElement);const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[next]?.focus();}
            },{signal});
        }
    }
}
export type KeyframeEditorOptions=KeyframeEditor.Interfaces.KeyframeEditorOptions;
export type KeyframeEditorTrack=KeyframeEditor.Interfaces.TrackDefinition;
export type KeyframeTree=KeyframeEditor.Interfaces.Tree;
export type KeyframeProperty=KeyframeEditor.Interfaces.Node;
export type KeyframeData=KeyframeEditor.Interfaces.Key;
export default KeyframeEditor.KeyframeEditor;
