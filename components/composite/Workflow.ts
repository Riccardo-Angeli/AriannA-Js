/**
 * @module components/composite/Workflow
 * @author Riccardo Angeli
 * @version 2.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 * @description n8n-inspired schema-driven AriannA workflow editor.
 */
import { Component, Css, Templates } from '../../core/index.ts';
const html=Templates.Template.Html;

export namespace NodeEditor
{
    export namespace Types
    {
        export type Theme='dark'|'light';
        export type WireStatus='connected-ok'|'connected-warn'|'connected-error';
        export type RunState='idle'|'running'|'paused';
        export type TypeCheckFn=(srcType:string,dstType:string)=>WireStatus|null;
    }
    export namespace Interfaces
    {
        export interface PortSpec{id:string;type:string;label?:string;}
        export interface ParamSpec{id:string;type:'number'|'string'|'boolean'|'enum';label?:string;default?:unknown;min?:number;max?:number;options?:string[];}
        export interface NodeSchema{type:string;name:string;category:string;color?:string;icon?:string;inputs:PortSpec[];outputs:PortSpec[];params?:ParamSpec[];description?:string;}
        export interface NodeInstance{id:string;type:string;x:number;y:number;schema:NodeSchema;params?:Record<string,unknown>;}
        export interface WireInstance{id:string;srcNodeId:string;srcPortId:string;srcType:string;dstNodeId:string;dstPortId:string;dstType:string;status:Types.WireStatus;}
        export interface NodeEditorOptions{schemas?:NodeSchema[];typeCheck?:Types.TypeCheckFn;theme?:Types.Theme;nodes?:NodeInstance[];wires?:WireInstance[];}
    }

    const demoSchemas:Interfaces.NodeSchema[]=[
        {type:'trigger',name:'Manual trigger',category:'Trigger',color:'#f26c5e',icon:'▶',inputs:[],outputs:[{id:'out',type:'json'}],description:'Starts the workflow manually.'},
        {type:'filter',name:'Filter data',category:'Transform',color:'#8b5cf6',icon:'⌁',inputs:[{id:'in',type:'json'}],outputs:[{id:'out',type:'json'}],description:'Keeps matching items.'},
        {type:'agent',name:'AI Agent',category:'AI',color:'#e40c88',icon:'✦',inputs:[{id:'in',type:'json'}],outputs:[{id:'out',type:'json'}],description:'Runs an AriannA agent.'},
        {type:'mail',name:'Send message',category:'Action',color:'#2aa7a1',icon:'✉',inputs:[{id:'in',type:'json'}],outputs:[{id:'out',type:'json'}],description:'Sends the final result.'}
    ];

    export const Styles=new Css.Stylesheet([
        new Css.Rule('.NodeEditor',{Background:'#202428',Border:'1px solid #121517',BorderRadius:'8px',BoxSizing:'border-box',Color:'#e5e8ea',Display:'block',FontFamily:'var(--arianna-font,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif)',Height:'560px',MaxWidth:'100%',MinWidth:'0',Overflow:'hidden',Width:'100%'}),
        new Css.Rule('.NodeEditor-Shell',{Display:'grid',GridTemplateRows:'48px 1fr',Height:'100%',MinHeight:'0'}),
        new Css.Rule('.NodeEditor-Toolbar',{AlignItems:'center',Background:'linear-gradient(180deg,#363b40,#25292d)',BorderBottom:'1px solid #111417',Display:'flex',Gap:'5px',Padding:'6px 8px'}),
        new Css.Rule('.NodeEditor-Title',{FontSize:'11px',FontWeight:'760',MarginRight:'5px'}),
        new Css.Rule('.NodeEditor-State',{Color:'#8d969e',Font:'9px/1 var(--arianna-font,system-ui,sans-serif)',MarginRight:'auto'}),
        new Css.Rule('.NodeEditor-Button',{Appearance:'none',Background:'linear-gradient(180deg,#444a50,#30353a)',Border:'1px solid #15181a',BorderRadius:'4px',Color:'#dce0e3',Cursor:'pointer',Font:'700 9px/1 var(--arianna-font,system-ui,sans-serif)',Height:'27px',Padding:'0 9px'}),
        new Css.Rule('.NodeEditor-Button:hover',{Background:'linear-gradient(180deg,#51585e,#383d42)'}),
        new Css.Rule('.NodeEditor-Button[data-kind="run"]',{Background:'linear-gradient(180deg,#38c477,#1f9e5b)',BorderColor:'#187b46',Color:'#fff'}),
        new Css.Rule('.NodeEditor-Button[data-kind="stop"]',{Background:'linear-gradient(180deg,#ef5360,#c93845)',BorderColor:'#9d2631',Color:'#fff'}),
        new Css.Rule('.NodeEditor-Body',{Display:'grid',GridTemplateColumns:'54px 1fr 220px',MinHeight:'0'}),
        new Css.Rule('.NodeEditor-Rail',{AlignItems:'center',Background:'#22262a',BorderRight:'1px solid #111417',Display:'flex',FlexDirection:'column',Gap:'7px',Padding:'8px 0'}),
        new Css.Rule('.NodeEditor-RailButton',{AlignItems:'center',Appearance:'none',Background:'#2d3237',Border:'1px solid #3c4248',BorderRadius:'6px',Color:'#aeb6bd',Cursor:'pointer',Display:'flex',FontSize:'13px',Height:'31px',JustifyContent:'center',Width:'34px'}),
        new Css.Rule('.NodeEditor-RailButton[data-active="true"]',{Background:'rgba(228,12,136,.18)',BorderColor:'#e40c88',Color:'#ff67b7'}),
        new Css.Rule('.NodeEditor-Workspace',{BackgroundColor:'#1b1f22',BackgroundImage:'radial-gradient(circle,#3a4045 1px,transparent 1px)',BackgroundSize:'20px 20px',Overflow:'hidden',Position:'relative'}),
        new Css.Rule('.NodeEditor-Workspace::after',{Background:'radial-gradient(circle at 50% 45%,transparent 0 45%,rgba(0,0,0,.18) 100%)',Content:'""',Inset:'0',PointerEvents:'none',Position:'absolute'}),
        new Css.Rule('.NodeEditor-Wires',{Height:'100%',Inset:'0',Overflow:'visible',PointerEvents:'none',Position:'absolute',Width:'100%',ZIndex:'1'}),
        new Css.Rule('.NodeEditor-Wire',{Fill:'none',Stroke:'#4eb0a5',StrokeWidth:'2'}),
        new Css.Rule('.NodeEditor-Wire[data-status="connected-warn"]',{Stroke:'#d7aa39'}),
        new Css.Rule('.NodeEditor-Wire[data-status="connected-error"]',{Stroke:'#e45656'}),
        new Css.Rule('.NodeEditor-Node',{Background:'#2a2f33',Border:'1px solid #43494e',BorderRadius:'10px',BoxShadow:'0 7px 18px rgba(0,0,0,.28)',MinWidth:'174px',Position:'absolute',UserSelect:'none',ZIndex:'2'}),
        new Css.Rule('.NodeEditor-Node[data-selected="true"]',{BorderColor:'#e40c88',BoxShadow:'0 0 0 2px rgba(228,12,136,.16),0 8px 20px rgba(0,0,0,.32)'}),
        new Css.Rule('.NodeEditor-NodeHeader',{AlignItems:'center',Display:'grid',Gap:'8px',GridTemplateColumns:'32px 1fr auto',Padding:'9px 10px 7px'}),
        new Css.Rule('.NodeEditor-NodeIcon',{AlignItems:'center',Background:'var(--node-color,#e40c88)',BorderRadius:'8px',BoxShadow:'inset 0 1px 0 rgba(255,255,255,.22)',Color:'#fff',Display:'flex',FontSize:'13px',Height:'30px',JustifyContent:'center',Width:'30px'}),
        new Css.Rule('.NodeEditor-NodeName',{FontSize:'10px',FontWeight:'760'}),
        new Css.Rule('.NodeEditor-NodeType',{Color:'#8f979f',FontSize:'8px',MarginTop:'2px'}),
        new Css.Rule('.NodeEditor-NodeMenu',{Color:'#8f979f',FontSize:'14px'}),
        new Css.Rule('.NodeEditor-NodeBody',{BorderTop:'1px solid #3a4045',Color:'#aab1b7',FontSize:'8.5px',LineHeight:'1.35',Padding:'7px 10px 9px'}),
        new Css.Rule('.NodeEditor-Port',{AlignItems:'center',Display:'flex',FontSize:'8px',Gap:'5px',Position:'absolute',Top:'50%',Transform:'translateY(-50%)'}),
        new Css.Rule('.NodeEditor-Port[data-side="in"]',{Left:'-7px'}),new Css.Rule('.NodeEditor-Port[data-side="out"]',{Right:'-7px'}),
        new Css.Rule('.NodeEditor-PortDot',{Background:'#202428',Border:'2px solid #4eb0a5',BorderRadius:'50%',BoxShadow:'0 0 0 2px #1b1f22',Height:'9px',Width:'9px'}),
        new Css.Rule('.NodeEditor-Add',{AlignItems:'center',Appearance:'none',Background:'#2a2f33',Border:'1px solid #4a5056',BorderRadius:'50%',Color:'#c8ced3',Cursor:'pointer',Display:'flex',FontSize:'16px',Height:'34px',JustifyContent:'center',Position:'absolute',Width:'34px',ZIndex:'3'}),
        new Css.Rule('.NodeEditor-Inspector',{Background:'#24282c',BorderLeft:'1px solid #111417',Display:'grid',GridTemplateRows:'44px 1fr',MinHeight:'0'}),
        new Css.Rule('.NodeEditor-InspectorHeader',{AlignItems:'center',Background:'linear-gradient(180deg,#33383d,#292d31)',BorderBottom:'1px solid #15181a',Display:'flex',FontSize:'10px',FontWeight:'760',Padding:'0 11px'}),
        new Css.Rule('.NodeEditor-InspectorBody',{OverflowY:'auto',Padding:'10px'}),
        new Css.Rule('.NodeEditor-SectionTitle',{Color:'#7f8890',FontSize:'8px',FontWeight:'800',LetterSpacing:'.09em',Margin:'9px 0 6px',TextTransform:'uppercase'}),
        new Css.Rule('.NodeEditor-Info',{Background:'#1c2024',Border:'1px solid #353a40',BorderRadius:'6px',FontSize:'9px',LineHeight:'1.4',Padding:'8px'}),
        new Css.Rule('.NodeEditor-Param',{Display:'grid',Gap:'4px',MarginBottom:'8px'}),
        new Css.Rule('.NodeEditor-Param label',{Color:'#8f979f',FontSize:'8px'}),
        new Css.Rule('.NodeEditor-Input',{Appearance:'none',Background:'#171b1e',Border:'1px solid #40464c',BorderRadius:'4px',Color:'#e0e4e7',Font:'9px/1.2 var(--arianna-font,system-ui,sans-serif)',Outline:'none',Padding:'7px'}),
        new Css.Rule('.NodeEditor-Input:focus',{BorderColor:'#e40c88',BoxShadow:'0 0 0 2px rgba(228,12,136,.13)'}),
        new Css.Rule('.NodeEditor[theme="light"]',{Background:'#eef0f2',BorderColor:'#b9bec3',Color:'#25292d'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Toolbar,.NodeEditor[theme="light"] .NodeEditor-InspectorHeader',{Background:'linear-gradient(180deg,#f9fafb,#dfe3e6)',BorderColor:'#b9bec3'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Button',{Background:'linear-gradient(180deg,#fff,#e1e4e7)',BorderColor:'#b9bec3',Color:'#383e43'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Rail,.NodeEditor[theme="light"] .NodeEditor-Inspector',{Background:'#e5e8ea',BorderColor:'#bcc1c5'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-RailButton',{Background:'#fff',BorderColor:'#c2c7cb',Color:'#596169'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Workspace',{BackgroundColor:'#fafafa',BackgroundImage:'radial-gradient(circle,#d1d5d8 1px,transparent 1px)'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Node',{Background:'#fff',BorderColor:'#c6cbd0',BoxShadow:'0 6px 16px rgba(0,0,0,.12)'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-NodeBody',{BorderTopColor:'#e2e4e6',Color:'#626970'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Info,.NodeEditor[theme="light"] .NodeEditor-Input',{Background:'#fff',BorderColor:'#c5cacf',Color:'#30363b'})
    ]);

    @Component('arianna-node-editor',Styles,{Shadow:false,Attributes:['theme','state'],Properties:['schemas','nodes','wires']})
    export class NodeEditor extends HTMLDivElement
    {
        public static readonly Styles=Styles; public template=html``;
        private _schemas:Interfaces.NodeSchema[]=structuredClone(demoSchemas);
        private _nodes:Interfaces.NodeInstance[]=[]; private _wires:Interfaces.WireInstance[]=[];
        private _state:Types.RunState='idle'; private _selected:string|null=null; private _typeCheck:Types.TypeCheckFn=(a,b)=>a===b?'connected-ok':'connected-warn';
        private _drag:{id:string;dx:number;dy:number}|null=null;

        private EnsureState():void
        {
            if(!Array.isArray(this._schemas)) this._schemas=structuredClone(demoSchemas);
            if(!Array.isArray(this._nodes)) this._nodes=[];
            if(!Array.isArray(this._wires)) this._wires=[];
            if(this._state!=='idle'&&this._state!=='running'&&this._state!=='paused') this._state='idle';
            if(typeof this._selected!=='string'&&this._selected!==null) this._selected=null;
            if(typeof this._typeCheck!=='function') this._typeCheck=(a,b)=>a===b?'connected-ok':'connected-warn';
            if(this._drag===undefined) this._drag=null;
        }

        constructor(options:Interfaces.NodeEditorOptions={})
        {
            super(); if(options.theme)this.setAttribute('theme',options.theme); if(options.schemas)this._schemas=options.schemas;if(options.typeCheck)this._typeCheck=options.typeCheck;if(options.nodes)this._nodes=options.nodes;if(options.wires)this._wires=options.wires;
        }
        public onCreated():void{requestAnimationFrame(()=>{if(this.isConnected)this.onConnected();});}
        public onConnected():void{this.EnsureState();this.classList.add('NodeEditor');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');if(this._nodes.length===0&&this._schemas.length>0)this.Seed();this.Render();}
        public get schemas(){this.EnsureState();return this._schemas;} public set schemas(v:Interfaces.NodeSchema[]){this.EnsureState();this._schemas=Array.isArray(v)?v:[];if(this.isConnected)this.Render();}
        public get nodes(){this.EnsureState();return this._nodes;} public set nodes(v:Interfaces.NodeInstance[]){this.EnsureState();this._nodes=Array.isArray(v)?v:[];if(this.isConnected)this.Render();}
        public get wires(){this.EnsureState();return this._wires;} public set wires(v:Interfaces.WireInstance[]){this.EnsureState();this._wires=Array.isArray(v)?v:[];if(this.isConnected)this.Render();}
        public setSchemas(s:Interfaces.NodeSchema[]):this{this.schemas=s;return this;}
        public setTypeCheck(fn:Types.TypeCheckFn):this{this.EnsureState();if(typeof fn==='function')this._typeCheck=fn;return this;}
        public setRunState(s:Types.RunState):this{this.EnsureState();this._state=s;this.setAttribute('state',s);if(this.isConnected)this.Render();return this;}
        public addNode(type:string,x:number,y:number,id=`node-${Date.now()}-${Math.random().toString(36).slice(2,6)}`):Interfaces.NodeInstance
        {this.EnsureState();const schema=this._schemas.find(s=>s.type===type)??this._schemas[0];if(!schema)throw new Error('NodeEditor: no node schema available');const n:Interfaces.NodeInstance={id,type:schema.type,x,y,schema,params:Object.fromEntries((schema.params??[]).map(p=>[p.id,p.default]))};this._nodes=[...this._nodes,n];if(this.isConnected)this.Render();return n;}
        public removeNode(id:string):void{this.EnsureState();this._nodes=this._nodes.filter(n=>n.id!==id);this._wires=this._wires.filter(w=>w.srcNodeId!==id&&w.dstNodeId!==id);if(this._selected===id)this._selected=null;if(this.isConnected)this.Render();}
        public addWire(srcNodeId:string,srcPortId:string,dstNodeId:string,dstPortId:string):Interfaces.WireInstance|null
        {this.EnsureState();const s=this._nodes.find(n=>n.id===srcNodeId),d=this._nodes.find(n=>n.id===dstNodeId);if(!s||!d)return null;const sp=(s.schema.outputs??[]).find(p=>p.id===srcPortId),dp=(d.schema.inputs??[]).find(p=>p.id===dstPortId);if(!sp||!dp)return null;const status=this._typeCheck(sp.type,dp.type)??'connected-error';const w:Interfaces.WireInstance={id:`wire-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,srcNodeId,srcPortId,srcType:sp.type,dstNodeId,dstPortId,dstType:dp.type,status};this._wires=[...this._wires,w];if(this.isConnected)this.Render();return w;}
        public removeWire(id:string):void{this.EnsureState();this._wires=this._wires.filter(w=>w.id!==id);if(this.isConnected)this.Render();}
        public export(){this.EnsureState();return {nodes:structuredClone(this._nodes),wires:structuredClone(this._wires),state:this._state};}

        private Seed():void
        {
            this.EnsureState();
            if(this._schemas.length===0)return;
            const positions=[{x:86,y:115},{x:330,y:210},{x:572,y:106},{x:786,y:255}];
            this._nodes=this._schemas.slice(0,4).map((schema,index)=>({id:`n${index+1}`,type:schema.type,x:positions[index].x,y:positions[index].y,schema,params:Object.fromEntries((schema.params??[]).map(p=>[p.id,p.default]))}));
            this._wires=[];
            for(let index=0;index<this._nodes.length-1;index++)
            {
                const src=this._nodes[index],dst=this._nodes[index+1];
                const sp=src.schema.outputs?.[0],dp=dst.schema.inputs?.[0];
                if(!sp||!dp)continue;
                this._wires.push({id:`w${index+1}`,srcNodeId:src.id,srcPortId:sp.id,srcType:sp.type,dstNodeId:dst.id,dstPortId:dp.id,dstType:dp.type,status:this._typeCheck(sp.type,dp.type)??'connected-error'});
            }
            this._selected=this._nodes[Math.min(2,this._nodes.length-1)]?.id??null;
        }

        private Render():void
        {
            this.EnsureState();
            const shell=document.createElement('section');shell.className='NodeEditor-Shell';
            const tb=document.createElement('header');tb.className='NodeEditor-Toolbar';tb.innerHTML=`<div class="NodeEditor-Title">AriannA Workflow</div><div class="NodeEditor-State">— ${this._state}</div>`;
            const run=document.createElement('button');run.className='NodeEditor-Button';run.dataset.kind='run';run.textContent='▶ Run';run.onclick=()=>this.setRunState('running');const pause=document.createElement('button');pause.className='NodeEditor-Button';pause.textContent='Ⅱ Pause';pause.onclick=()=>this.setRunState('paused');const stop=document.createElement('button');stop.className='NodeEditor-Button';stop.dataset.kind='stop';stop.textContent='■ Stop';stop.onclick=()=>this.setRunState('idle');const clear=document.createElement('button');clear.className='NodeEditor-Button';clear.textContent='Clear';clear.onclick=()=>{this._nodes=[];this._wires=[];this._selected=null;this.Render();};const exp=document.createElement('button');exp.className='NodeEditor-Button';exp.textContent='Export JSON';exp.onclick=()=>this.dispatchEvent(new CustomEvent('arianna:export',{bubbles:true,composed:true,detail:this.export()}));tb.append(run,pause,stop,clear,exp);
            const body=document.createElement('div');body.className='NodeEditor-Body';const rail=document.createElement('aside');rail.className='NodeEditor-Rail';for(const [i,ico] of ['⌖','＋','⌕','▦','⚙'].entries()){const b=document.createElement('button');b.className='NodeEditor-RailButton';b.dataset.active=String(i===0);b.textContent=ico;if(i===1)b.onclick=()=>{const schema=this._schemas[Math.min(2,this._schemas.length-1)];if(schema)this.addNode(schema.type,260,140);};rail.append(b);}
            const ws=document.createElement('div');ws.className='NodeEditor-Workspace';const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','NodeEditor-Wires');
            const centers=new Map(this._nodes.map(n=>[n.id,{x:n.x+174,y:n.y+54}]));for(const w of this._wires){const s=centers.get(w.srcNodeId),d=centers.get(w.dstNodeId);if(!s||!d)continue;const p=document.createElementNS('http://www.w3.org/2000/svg','path');const sx=s.x,sy=s.y,dx=d.x-174,dy=d.y;const bend=Math.max(60,Math.abs(dx-sx)*.42);p.setAttribute('d',`M ${sx} ${sy} C ${sx+bend} ${sy}, ${dx-bend} ${dy}, ${dx} ${dy}`);p.setAttribute('class','NodeEditor-Wire');p.setAttribute('data-status',w.status);svg.append(p);}ws.append(svg);
            for(const n of this._nodes){const el=document.createElement('article');el.className='NodeEditor-Node';el.dataset.nodeId=n.id;el.dataset.selected=String(n.id===this._selected);el.style.left=`${n.x}px`;el.style.top=`${n.y}px`;el.style.setProperty('--node-color',n.schema.color||'#e40c88');el.innerHTML=`<header class="NodeEditor-NodeHeader"><span class="NodeEditor-NodeIcon">${n.schema.icon||'◆'}</span><div><div class="NodeEditor-NodeName">${n.schema.name}</div><div class="NodeEditor-NodeType">${n.schema.category}</div></div><span class="NodeEditor-NodeMenu">⋮</span></header><div class="NodeEditor-NodeBody">${n.schema.description||'Workflow node'}</div>`;if((n.schema.inputs??[]).length){const port=document.createElement('span');port.className='NodeEditor-Port';port.dataset.side='in';port.innerHTML='<span class="NodeEditor-PortDot"></span>';el.append(port);}if((n.schema.outputs??[]).length){const port=document.createElement('span');port.className='NodeEditor-Port';port.dataset.side='out';port.innerHTML='<span class="NodeEditor-PortDot"></span>';el.append(port);}el.addEventListener('pointerdown',e=>{this._selected=n.id;el.dataset.selected='true';const r=el.getBoundingClientRect();this._drag={id:n.id,dx:e.clientX-r.left,dy:e.clientY-r.top};el.setPointerCapture(e.pointerId);});el.addEventListener('pointermove',e=>{if(!this._drag||this._drag.id!==n.id)return;const r=ws.getBoundingClientRect();n.x=Math.max(5,e.clientX-r.left-this._drag.dx);n.y=Math.max(5,e.clientY-r.top-this._drag.dy);el.style.left=`${n.x}px`;el.style.top=`${n.y}px`;});el.addEventListener('pointerup',()=>{if(this._drag?.id===n.id){this._drag=null;this.Render();}});ws.append(el);}
            const add=document.createElement('button');add.className='NodeEditor-Add';add.textContent='＋';add.style.left='28px';add.style.bottom='26px';add.onclick=()=>{const schema=this._schemas[0];if(schema)this.addNode(schema.type,120,150);};ws.append(add);
            const inspector=document.createElement('aside');inspector.className='NodeEditor-Inspector';const ih=document.createElement('div');ih.className='NodeEditor-InspectorHeader';ih.textContent='Node';const ib=document.createElement('div');ib.className='NodeEditor-InspectorBody';const sel=this._nodes.find(n=>n.id===this._selected);if(sel){ib.innerHTML=`<div class="NodeEditor-SectionTitle">Selected node</div><div class="NodeEditor-Info"><strong>${sel.schema.name}</strong><br>${sel.schema.description||''}<br><br>ID: ${sel.id}</div><div class="NodeEditor-SectionTitle">Parameters</div>`;for(const p of sel.schema.params??[{id:'label',type:'string' as const,label:'Label',default:sel.schema.name}]){const row=document.createElement('div');row.className='NodeEditor-Param';const label=document.createElement('label');label.textContent=p.label||p.id;const input=document.createElement('input');input.className='NodeEditor-Input';input.value=String(sel.params?.[p.id]??p.default??'');input.onchange=()=>{(sel.params??={})[p.id]=input.value;};row.append(label,input);ib.append(row);}}else ib.innerHTML='<div class="NodeEditor-Info">Select a node to inspect its properties.</div>';inspector.append(ih,ib);body.append(rail,ws,inspector);shell.append(tb,body);this.replaceChildren(shell);
        }
    }
}
export type NodeEditorOptions=NodeEditor.Interfaces.NodeEditorOptions;export type NodeSchema=NodeEditor.Interfaces.NodeSchema;export type NodeInstance=NodeEditor.Interfaces.NodeInstance;export type WireInstance=NodeEditor.Interfaces.WireInstance;export type PortSpec=NodeEditor.Interfaces.PortSpec;export type ParamSpec=NodeEditor.Interfaces.ParamSpec;export type RunState=NodeEditor.Types.RunState;export type WireStatus=NodeEditor.Types.WireStatus;export type TypeCheckFn=NodeEditor.Types.TypeCheckFn;
/** Canonical public name for the workflow editor. The legacy NodeEditor namespace/tag remains compatible. */
export const Workflow = NodeEditor.NodeEditor;
export type WorkflowOptions = NodeEditor.Interfaces.NodeEditorOptions;

export default Workflow;
