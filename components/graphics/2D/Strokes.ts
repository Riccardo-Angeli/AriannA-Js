/** @module components/graphics/2D/Strokes */
import { Component, Css, Templates } from '../../../core/index.ts';

const html=Templates.Template.Html;

export namespace Strokes
{
    export namespace Types
    {
        export type Cap='butt'|'round'|'square';
        export type Join='miter'|'round'|'bevel';
        export type Align='center'|'inside'|'outside';
        export type Unit='px'|'pt'|'mm';
        export type Arrowhead='none'|'arrow'|'open-arrow'|'circle'|'square';
        export type Profile='uniform'|'width-1'|'width-2'|'taper-start'|'taper-end';
        export type DashFit='exact'|'corners';
        export type ArrowAlign='tip'|'extend';
    }

    export namespace Interfaces
    {
        export interface LineTool{id:string;label:string;icon?:string;}
        export interface StrokeStyle
        {
            color:string;width:number;unit:Types.Unit;cap:Types.Cap;join:Types.Join;
            align:Types.Align;dash:number[];dashOffset:number;miterLimit:number;
            arrowStart:Types.Arrowhead;arrowEnd:Types.Arrowhead;
            arrowScaleStart:number;arrowScaleEnd:number;profile:Types.Profile;
            dashFit:Types.DashFit;arrowAlign:Types.ArrowAlign;linkScales:boolean;flipAlong:boolean;flipAcross:boolean;
        }
        export interface StrokesOptions extends Partial<StrokeStyle>{theme?:'dark'|'light';}
        export interface StrokeTarget extends Element
        {
            stroke?:Partial<{color:string;width:number;opacity:number;lineCap:Types.Cap;lineJoin:Types.Join;dashArray:number[];dashOffset:number;miterLimit:number}>;
        }
    }

    const DEFAULT:Interfaces.StrokeStyle={
        color:'#42b9d6',width:1,unit:'pt',cap:'butt',join:'miter',align:'center',dash:[],dashOffset:0,miterLimit:10,
        arrowStart:'none',arrowEnd:'none',arrowScaleStart:100,arrowScaleEnd:100,profile:'uniform',
        dashFit:'exact',arrowAlign:'tip',linkScales:false,flipAlong:false,flipAcross:false
    };
    interface State{style:Interfaces.StrokeStyle;target:Interfaces.StrokeTarget|null;effects:Element[];savedStyle:string|null;uid:string;dashCache?:number[];connected?:boolean;}
    let sequence=0;
    const States=new WeakMap<HTMLElement,State>();
    const S=(host:HTMLElement):State=>{let state=States.get(host);if(!state){state={style:structuredClone(DEFAULT),target:null,effects:[],savedStyle:null,uid:'arianna-stroke-'+(++sequence)};States.set(host,state);}return state;};
    const NumberValue=(value:unknown,fallback:number,min=-Infinity,max=Infinity):number=>{const n=value===null||value===undefined||value===''?NaN:Number(value);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;};
    const ParseDash=(value:string|null):number[]=>value?.split(/[ ,]+/).map(Number).filter(n=>Number.isFinite(n)&&n>=0)??[];
    const PixelWidth=(style:Interfaces.StrokeStyle):number=>style.width*(style.unit==='pt'?96/72:style.unit==='mm'?96/25.4:1);

    /** Straight segment boundaries for corner-aware dash placement. Curves use length fitting. */
    function StraightPoints(target:SVGGeometryElement):Array<{x:number;y:number}>|null {
        const tag=target.tagName.toLowerCase();
        if(tag==='polygon'||tag==='polyline'){
            const numbers=(target.getAttribute('points')??'').match(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi)?.map(Number)??[];
            if(numbers.length<4||numbers.length%2)return null;
            const points=[];for(let i=0;i<numbers.length;i+=2)points.push({x:numbers[i],y:numbers[i+1]});if(tag==='polygon')points.push({...points[0]});return points;
        }
        if(tag!=='path')return null;
        const data=target.getAttribute('d')??'';if(/[ACQST]/i.test(data))return null;
        const tokens=data.match(/[MLHVZmlhvz]|[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi)??[];
        let command='',index=0,x=0,y=0;const points:Array<{x:number;y:number}>=[];
        while(index<tokens.length&&points.length<4096){
            if(/^[a-z]$/i.test(tokens[index]))command=tokens[index++];
            const relative=command===command.toLowerCase(),op=command.toUpperCase();
            if(op==='Z'){if(points.length)points.push({...points[0]});command='';continue;}
            if(!['M','L','H','V'].includes(op)||index>=tokens.length)return null;
            const a=Number(tokens[index++]);if(!Number.isFinite(a))return null;
            if(op==='H')x=relative?x+a:a;
            else if(op==='V')y=relative?y+a:a;
            else {const b=Number(tokens[index++]);if(!Number.isFinite(b))return null;x=relative?x+a:a;y=relative?y+b:b;if(op==='M'){if(points.length)return null;command=relative?'l':'L';}}
            points.push({x,y});
        }
        return points.length>1?points:null;
    }

    export const Styles=new Css.Stylesheet([
        new Css.Rule('arianna-strokes,.Strokes',{Background:'#25292d',Border:'1px solid #111417',BorderRadius:'8px',BoxSizing:'border-box',Color:'#dce0e3',Display:'block',FontFamily:'system-ui,sans-serif',Overflow:'hidden',Width:'365px',ColorScheme:'dark'}),
        new Css.Rule('arianna-strokes[floating],.Strokes[floating]',{BoxShadow:'0 12px 32px #0006',Position:'absolute',Right:'16px',Top:'16px',ZIndex:'35',Resize:'both',MinWidth:'365px',MinHeight:'30px',Overflow:'auto'}),
        new Css.Rule('.Strokes-Chrome',{Height:'20px',Background:'linear-gradient(180deg,#363b40,#25292d)',BorderBottom:'1px solid #111417',Display:'flex',JustifyContent:'flex-end'}),
        new Css.Rule('.Strokes-Header',{AlignItems:'center',Background:'linear-gradient(180deg,#363b40,#25292d)',BorderBottom:'1px solid #111417',Display:'flex',FontSize:'12px',FontWeight:'700',Height:'27px',Padding:'0 7px',Gap:'6px'}),
        new Css.Rule('arianna-strokes[floating] .Strokes-Header',{Cursor:'grab',TouchAction:'none',UserSelect:'none'}),
        new Css.Rule('.Strokes-WindowButton',{Appearance:'none',Background:'transparent',Border:'0',Color:'inherit',Cursor:'pointer',Height:'18px',Padding:'0 4px',FontSize:'12px'}),
        new Css.Rule('.Strokes-Body',{Display:'grid',Gap:'13.5px',Padding:'12px 9px 12px'}),
        new Css.Rule('.Strokes-Row',{AlignItems:'center',Display:'grid',Gap:'6px',GridTemplateColumns:'94px minmax(0,1fr)'}),
        new Css.Rule('.Strokes-Label',{Color:'#dce0e3',FontSize:'12px',TextAlign:'right'}),
        new Css.Rule('.Strokes-Control,.Strokes-Select,.Strokes-Number',{Background:'#1b1f22',Border:'1px solid #15181a',BorderRadius:'3px',BoxSizing:'border-box',Color:'#dce0e3',Font:'12px/1.2 system-ui',Height:'28px',MinWidth:'0',Padding:'2px 4px',Width:'100%'}),
        new Css.Rule('.Strokes-Control:disabled,.Strokes-Select:disabled,.Strokes-Number:disabled,.Strokes-Button:disabled',{Opacity:'.38',Cursor:'default'}),
        new Css.Rule('.Strokes-Weight',{Display:'grid',Gap:'0',GridTemplateColumns:'19px 83px 25px',Width:'127px'}),
        new Css.Rule('.Strokes-Buttons',{Display:'flex',Gap:'3px'}),
        new Css.Rule('.Strokes-Button',{Appearance:'none',Background:'linear-gradient(180deg,#444a50,#30353a)',Border:'1px solid #15181a',BorderRadius:'3px',Color:'#dce0e3',Cursor:'pointer',Height:'28px',Width:'35px',Padding:'2px',Flex:'0 0 auto',FontWeight:'700'}),
        new Css.Rule('.Strokes-Button svg',{Display:'block',Width:'100%',Height:'100%'}),
        new Css.Rule('.Strokes-Button[data-active="true"]',{Background:'linear-gradient(180deg,#ff4dad 0%,#e40c88 55%,#b90769 100%)',BorderColor:'#e40c88',BoxShadow:'inset 0 1px 0 #ffffff35,0 1px 3px #0004',Color:'#fff'}),
        new Css.Rule('.Strokes-Button:hover:not(:disabled)',{BorderColor:'#dce0e3'}),
        new Css.Rule('.Strokes-Steppers',{Display:'grid',GridTemplateRows:'1fr 1fr'}),
        new Css.Rule('.Strokes-Steppers button',{Appearance:'none',Border:'1px solid #15181a',Background:'linear-gradient(180deg,#444a50,#30353a)',Color:'#dce0e3',Font:'8px/1 system-ui',Padding:'0',Cursor:'pointer'}),
        new Css.Rule('.Strokes-Weight input',{Appearance:'textfield'}),
        new Css.Rule('.Strokes-Weight input::-webkit-inner-spin-button',{Appearance:'none'}),
        new Css.Rule('.Strokes-DashHead .Strokes-Button',{Width:'60px'}),
        new Css.Rule('.Strokes-DashHead .Strokes-Buttons',{Gap:'1px'}),
        new Css.Rule('.Strokes-Corner',{Display:'flex',AlignItems:'center',Gap:'5px'}),
        new Css.Rule('.Strokes-Limit',{Display:'flex',AlignItems:'center',Gap:'4px',FontSize:'10px',MarginLeft:'auto'}),
        new Css.Rule('.Strokes-Limit input',{Width:'57px'}),
        new Css.Rule('.Strokes-DashHead',{AlignItems:'center',Display:'flex',Gap:'5px',FontSize:'12px'}),
        new Css.Rule('.Strokes-DashHead .Strokes-Buttons',{MarginLeft:'auto'}),
        new Css.Rule('.Strokes-Check',{AccentColor:'#e40c88',Margin:'0'}),
        new Css.Rule('.Strokes-DashGrid',{Display:'grid',Gap:'4px',GridTemplateColumns:'repeat(6,minmax(0,1fr))'}),
        new Css.Rule('.Strokes-DashCell',{Display:'grid',Gap:'4px',TextAlign:'center',FontSize:'12px',Color:'#aeb6bd'}),
        new Css.Rule('.Strokes-DashCell input',{Padding:'2px',TextAlign:'center'}),
        new Css.Rule('.Strokes-Arrows',{Display:'grid',Gap:'5px',GridTemplateColumns:'1fr 1fr 28px'}),
        new Css.Rule('.Strokes-Arrows button,.Strokes-Scale button,.Strokes-Profile button',{Width:'28px'}),
        new Css.Rule('.Strokes-Scale',{Display:'grid',Gap:'5px',GridTemplateColumns:'1fr 1fr 28px'}),
        new Css.Rule('.Strokes-Profile',{Display:'grid',Gap:'3px',GridTemplateColumns:'minmax(0,1fr) 28px 28px'}),
        new Css.Rule('.Strokes-Divider',{BorderTop:'1px solid #111417',BorderBottom:'1px solid #ffffff0d',Height:'0',Margin:'0'}),
        new Css.Rule('.Strokes-Color',{Appearance:'none',Border:'0',Background:'transparent',Width:'20px',Height:'17px',Padding:'0',Cursor:'pointer',MarginLeft:'auto'}),
        new Css.Rule('arianna-strokes[minimized] .Strokes-Body,.Strokes[minimized] .Strokes-Body',{Display:'none'}),
        new Css.Rule('arianna-strokes[theme="light"],.Strokes[theme="light"]',{Background:'#eef0f2',BorderColor:'#b9bec3',Color:'#25292d',ColorScheme:'light'}),
        new Css.Rule('arianna-strokes[theme="light"] .Strokes-Header',{Background:'linear-gradient(180deg,#fff,#e1e4e7)',BorderBottomColor:'#b9bec3'}),
        new Css.Rule('arianna-strokes[theme="light"] .Strokes-Label,arianna-strokes[theme="light"] .Strokes-DashCell,.Strokes[theme="light"] .Strokes-Label,.Strokes[theme="light"] .Strokes-DashCell',{Color:'#4c5359'}),
        new Css.Rule('arianna-strokes[theme="light"] .Strokes-Chrome,.Strokes[theme="light"] .Strokes-Chrome,.Strokes[theme="light"] .Strokes-Header',{Background:'linear-gradient(180deg,#fff,#e1e4e7)',BorderBottomColor:'#b9bec3'}),
        new Css.Rule('arianna-strokes[theme="light"] .Strokes-Control,arianna-strokes[theme="light"] .Strokes-Select,arianna-strokes[theme="light"] .Strokes-Number,.Strokes[theme="light"] .Strokes-Control,.Strokes[theme="light"] .Strokes-Select,.Strokes[theme="light"] .Strokes-Number',{Background:'#fff',BorderColor:'#b8bdc2',Color:'#25292d'}),
        new Css.Rule('arianna-strokes[theme="light"] .Strokes-Button,.Strokes[theme="light"] .Strokes-Button,arianna-strokes[theme="light"] .Strokes-Steppers button,.Strokes[theme="light"] .Strokes-Steppers button',{Background:'linear-gradient(180deg,#f9fbfc,#e0e4e7)',BorderColor:'#b8bdc2',Color:'#25292d'}),
        new Css.Rule('arianna-strokes[theme="light"] .Strokes-Button[data-active="true"],.Strokes[theme="light"] .Strokes-Button[data-active="true"]',{Background:'linear-gradient(180deg,#ff4dad 0%,#e40c88 55%,#b90769 100%)',BorderColor:'#e40c88',Color:'#fff'}),
        new Css.Rule('arianna-strokes[theme="light"] .Strokes-Divider,.Strokes[theme="light"] .Strokes-Divider',{BorderTopColor:'#c3c8cc',BorderBottomColor:'#fff'}),
        new Css.Rule('.Strokes-Button:focus-visible,.Strokes-WindowButton:focus-visible,.Strokes-Control:focus-visible,.Strokes-Select:focus-visible,.Strokes-Number:focus-visible',{Outline:'2px solid #e40c88',OutlineOffset:'2px'}),
        new Css.Rule('.Strokes-PanelMenu',{Position:'absolute',Right:'8px',Top:'45px',ZIndex:'5',Display:'grid',Gap:'3px',Background:'#25292d',Border:'1px solid #111417',BorderRadius:'4px',Padding:'5px',BoxShadow:'0 8px 24px #0005'}),
        new Css.Rule('.Strokes-PanelMenu button',{Appearance:'none',Background:'linear-gradient(180deg,#444a50,#30353a)',Border:'1px solid #15181a',BorderRadius:'3px',Color:'#dce0e3',Font:'700 11px system-ui',Padding:'6px 10px',Cursor:'pointer',TextAlign:'left'}),
        new Css.Rule('.Strokes-PanelMenu button:hover,.Strokes-WindowButton:hover',{Background:'linear-gradient(180deg,#ff4dad,#e40c88,#b90769)',Color:'#fff'}),
        new Css.Rule('arianna-strokes[theme="light"] .Strokes-PanelMenu,.Strokes[theme="light"] .Strokes-PanelMenu',{Background:'#eef0f2',BorderColor:'#b9bec3'}),
        new Css.Rule('arianna-strokes[theme="light"] .Strokes-PanelMenu button,.Strokes[theme="light"] .Strokes-PanelMenu button',{Background:'linear-gradient(180deg,#f9fbfc,#e0e4e7)',BorderColor:'#b8bdc2',Color:'#25292d'}),
        new Css.Rule('arianna-strokes[theme="light"] .Strokes-PanelMenu button:hover,.Strokes[theme="light"] .Strokes-PanelMenu button:hover',{Background:'linear-gradient(180deg,#ff4dad,#e40c88,#b90769)',BorderColor:'#e40c88',Color:'#fff'})
    ]);

    @Component('arianna-strokes',Styles,{Shadow:false,Attributes:['theme','color','width','unit','cap','join','align','dash','dash-offset','miter-limit','arrow-start','arrow-end','arrow-scale-start','arrow-scale-end','profile','floating','minimized','dash-fit','arrow-align','link-scales','flip-along','flip-across'],Properties:['stroke']})
    export class Strokes extends HTMLElement
    {
        public static readonly Styles=Styles;
        public template=html``;

        public constructor(options:Interfaces.StrokesOptions={})
        {
            super();
            const {theme,...stroke}=options;S(this).style={...S(this).style,...stroke,dash:Array.isArray(options.dash)?[...options.dash]:[]};
            if(theme)this.setAttribute('theme',theme);
        }

        public onCreated():void{if(this.isConnected)this.onConnected();}
        public onConnected():void
        {
            this.classList.add('Strokes');
            if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');
            if(!S(this).connected){this.ReadAttributes();S(this).connected=true;}this.Render();this.Apply();
        }
        public onAttributeChanged(name?:string):void{if(name==='minimized'||!this.isConnected)return;this.ReadAttributes(name);this.Render();this.Apply();}

        public get stroke():Interfaces.StrokeStyle{return structuredClone(S(this).style);}
        public set stroke(value:Partial<Interfaces.StrokeStyle>){this.setStroke(value);}
        public getStroke():Interfaces.StrokeStyle{return this.stroke;}
        public setStroke(value:Partial<Interfaces.StrokeStyle>):this
        {
            const state=S(this);state.style={...state.style,...value,dash:Array.isArray(value.dash)?value.dash.map(v=>Math.max(0,Number(v)||0)):state.style.dash};
            this.Normalize();this.Render();this.Apply();this.Emit();return this;
        }
        /** Bind without importing the drawing component. LineEditor.stroke and SVG elements are both supported. */
        public bind(target:Interfaces.StrokeTarget):this{
            this.unbind();const state=S(this);state.target=target;state.savedStyle=target.getAttribute('style');this.Render();this.Apply();return this;
        }
        public unbind():this{
            const state=S(this);this.ClearEffects();
            if(state.target){state.savedStyle===null?state.target.removeAttribute('style'):state.target.setAttribute('style',state.savedStyle);}
            state.target=null;state.savedStyle=null;return this;
        }
        public onUnmount():void{this.unbind();}
        private ClearEffects():void{for(const node of S(this).effects.splice(0))node.remove();}
        private Normalize():void{
            const s=S(this).style;s.width=NumberValue(s.width,3,.01,1000);s.miterLimit=NumberValue(s.miterLimit,10,1,1000);
            s.arrowScaleStart=NumberValue(s.arrowScaleStart,100,1,1000);s.arrowScaleEnd=NumberValue(s.arrowScaleEnd,100,1,1000);
            s.dash=s.dash.slice(0,6).map(n=>NumberValue(n,0,0,1000));if(!s.dash.some(n=>n>0))s.dash=[];
        }

        private ReadAttributes(changed?:string):void
        {
            const s=S(this).style,one=<T extends string>(name:string,allowed:readonly T[],fallback:T):T=>{const value=this.getAttribute(name) as T|null;return value&&allowed.includes(value)?value:fallback;};
            if(!changed||changed==='color')s.color=this.getAttribute('color')||s.color;
            if(!changed||changed==='width')s.width=NumberValue(this.getAttribute('width'),s.width,.01,1000);
            if(!changed||changed==='unit')s.unit=one('unit',['px','pt','mm'] as const,s.unit);
            if(!changed||changed==='cap')s.cap=one('cap',['butt','round','square'] as const,s.cap);
            if(!changed||changed==='join')s.join=one('join',['miter','round','bevel'] as const,s.join);
            if(!changed||changed==='align')s.align=one('align',['center','inside','outside'] as const,s.align);
            if(!changed||changed==='dash'){if(this.hasAttribute('dash'))s.dash=ParseDash(this.getAttribute('dash'));else if(changed==='dash')s.dash=[];}
            if(!changed||changed==='dash-offset')s.dashOffset=NumberValue(this.getAttribute('dash-offset'),s.dashOffset);
            if(!changed||changed==='miter-limit')s.miterLimit=NumberValue(this.getAttribute('miter-limit'),s.miterLimit,1,1000);
            if(!changed||changed==='arrow-start')s.arrowStart=one('arrow-start',['none','arrow','open-arrow','circle','square'] as const,s.arrowStart);
            if(!changed||changed==='arrow-end')s.arrowEnd=one('arrow-end',['none','arrow','open-arrow','circle','square'] as const,s.arrowEnd);
            if(!changed||changed==='arrow-scale-start')s.arrowScaleStart=NumberValue(this.getAttribute('arrow-scale-start'),s.arrowScaleStart,1,1000);
            if(!changed||changed==='arrow-scale-end')s.arrowScaleEnd=NumberValue(this.getAttribute('arrow-scale-end'),s.arrowScaleEnd,1,1000);
            if(!changed||changed==='profile')s.profile=one('profile',['uniform','width-1','width-2','taper-start','taper-end'] as const,s.profile);
            if(!changed||changed==='dash-fit')s.dashFit=one('dash-fit',['exact','corners'] as const,s.dashFit);if(!changed||changed==='arrow-align')s.arrowAlign=one('arrow-align',['tip','extend'] as const,s.arrowAlign);
            for(const [attr,key] of [['link-scales','linkScales'],['flip-along','flipAlong'],['flip-across','flipAcross']] as const)
                if(!changed||changed===attr){if(this.hasAttribute(attr))s[key]=this.getAttribute(attr)!=='false';else if(changed===attr)s[key]=false;}
            this.Normalize();
        }

        private Apply():void
        {
            this.ClearEffects();const target=S(this).target;if(!target)return;const s=S(this).style;
            if('stroke' in target) {
                const current=target.stroke&&typeof target.stroke==='object'?target.stroke:{};
                target.stroke={...current,...s,width:PixelWidth(s),lineCap:s.cap,lineJoin:s.join,dashArray:[...s.dash],dashOffset:s.dashOffset,miterLimit:s.miterLimit};
                return;
            }
            const element=target as unknown as SVGElement;
            element.style.stroke=s.color;element.style.strokeWidth=String(PixelWidth(s));element.style.strokeLinecap=s.cap;
            element.style.strokeLinejoin=s.join;element.style.strokeMiterlimit=String(s.miterLimit);
            element.style.strokeDasharray=s.dash.join(' ');element.style.strokeDashoffset=String(s.dashOffset);
            element.style.markerStart='none';element.style.markerEnd='none';element.style.clipPath='none';element.style.mask='none';
            if(typeof SVGGeometryElement==='undefined'||!(target instanceof SVGGeometryElement)||!target.ownerSVGElement)return;
            const svg=target.ownerSVGElement,doc=target.ownerDocument,ns='http://www.w3.org/2000/svg';
            const make=<K extends keyof SVGElementTagNameMap>(name:K,attrs:Record<string,string|number>={})=>{
                const node=doc.createElementNS(ns,name);for(const [key,value] of Object.entries(attrs))node.setAttribute(key,String(value));return node;
            };
            const uid=S(this).uid,defs=make('defs');svg.prepend(defs);S(this).effects.push(defs);
            const length=target.getTotalLength(),unit=s.unit==='pt'?96/72:s.unit==='mm'?96/25.4:1;
            let dash=s.dash.map(n=>n*unit);if(dash.length%2)dash=[...dash,...dash];
            const corners=s.dashFit==='corners'&&dash.length?StraightPoints(target):null;
            if(!corners&&s.dashFit==='corners'&&dash.length&&length>0){const cycle=dash.reduce((a,b)=>a+b,0);if(cycle>0){const k=length/(Math.max(1,Math.round(length/cycle))*cycle);dash=dash.map(n=>n*k);}}
            element.style.strokeDasharray=dash.join(' ');element.style.strokeDashoffset=String(s.dashOffset*unit);
            const tag=target.tagName.toLowerCase(),closed=['rect','circle','ellipse','polygon'].includes(tag)||(tag==='path'&&/[zZ]\s*$/.test(target.getAttribute('d')??''));
            let visible:SVGElement=element;
            if(s.profile!=='uniform'&&length>0) {
                const group=make('g',{'data-stroke-profile':s.profile,'pointer-events':'none'});
                const transform=target.getAttribute('transform');if(transform)group.setAttribute('transform',transform);
                const profile=(t:number)=>{
                    t=s.flipAlong?1-t:t;
                    const factor=s.profile==='width-1'?Math.sin(Math.PI*t):s.profile==='width-2'?.25+.75*Math.pow(Math.sin(Math.PI*t),2):s.profile==='taper-start'?t:1-t;
                    return Math.max(.002,factor)*PixelWidth(s)*(closed&&s.align!=='center'?2:1);
                };
                const periods:number[][]=[];
                if(!dash.length||corners)periods.push([0,length]);
                else {
                    const cycle=dash.reduce((a,b)=>a+b,0);
                    let offset=((s.dashOffset*unit)%cycle+cycle)%cycle,index=0;
                    while(index<dash.length-1&&offset>=dash[index]){offset-=dash[index++];}
                    let distance=-offset,guard=0;
                    while(distance<length&&guard++<4096&&periods.length<2048){const end=distance+dash[index%dash.length];if(index%2===0&&end>0&&end>distance)periods.push([Math.max(0,distance),Math.min(length,end)]);distance=end;index++;}
                }
                for(const [from,to] of periods){
                    if(to<=from)continue;const count=Math.max(2,Math.min(2048,Math.ceil((to-from)/2))),left:string[]=[],right:string[]=[];
                    for(let i=0;i<=count;i++){
                        const distance=from+(to-from)*i/count,point=target.getPointAtLength(distance);
                        const prev=target.getPointAtLength(Math.max(0,distance-.2)),next=target.getPointAtLength(Math.min(length,distance+.2));
                        const dx=next.x-prev.x,dy=next.y-prev.y,norm=Math.hypot(dx,dy)||1,nx=-dy/norm,ny=dx/norm,width=profile(distance/length);
                        // The second profile is asymmetric; the Across control mirrors it.
                        const bias=s.profile==='width-2'?(s.flipAcross?-.3:.3):0;
                        left.push((point.x+nx*width*(.5+bias))+','+(point.y+ny*width*(.5+bias)));
                        right.push((point.x-nx*width*(.5-bias))+','+(point.y-ny*width*(.5-bias)));
                    }
                    const ribbon=make('path',{d:'M'+left.join(' L')+' L'+right.reverse().join(' L')+' Z',fill:s.color});group.append(ribbon);
                    if(!closed&&s.cap==='round')for(const distance of [from,to]){const point=target.getPointAtLength(distance);group.append(make('circle',{cx:point.x,cy:point.y,r:profile(distance/length)/2,fill:s.color}));}
                    if(!closed&&s.cap==='square')for(const distance of [from,to]){
                        const point=target.getPointAtLength(distance),a=target.getPointAtLength(Math.max(0,distance-.2)),b=target.getPointAtLength(Math.min(length,distance+.2)),w=profile(distance/length);
                        group.append(make('rect',{x:point.x-w/2,y:point.y-w/2,width:w,height:w,fill:s.color,transform:'rotate('+(Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI)+' '+point.x+' '+point.y+')'}));
                    }
                }
                target.after(group);S(this).effects.push(group);element.style.stroke='none';visible=group;
            }
            if(corners&&dash.length) {
                const box=target.getBBox(),pad=PixelWidth(s)*12+10;
                const mask=make('mask',{id:uid+'-dash-fit',maskUnits:'userSpaceOnUse',x:box.x-pad,y:box.y-pad,width:box.width+2*pad,height:box.height+2*pad,'mask-type':'luminance'});
                mask.append(make('rect',{x:box.x-pad,y:box.y-pad,width:box.width+2*pad,height:box.height+2*pad,fill:'black'}));
                const cycle=dash.reduce((a,b)=>a+b,0);
                for(let i=1;i<corners.length;i++){
                    const a=corners[i-1],b=corners[i],segment=Math.hypot(b.x-a.x,b.y-a.y);if(!segment)continue;
                    const factor=segment/(Math.max(1,Math.round(segment/cycle))*cycle),pattern=dash.map(n=>n*factor);
                    mask.append(make('path',{d:'M'+a.x+' '+a.y+' L'+b.x+' '+b.y,fill:'none',stroke:'white','stroke-width':PixelWidth(s)*4,'stroke-linecap':s.cap,'stroke-dasharray':pattern.join(' '),'stroke-dashoffset':pattern[0]/2+s.dashOffset*unit}));
                }
                defs.append(mask);
                const group=make('g',{'pointer-events':'none'});
                if(visible===element){
                    const copy=target.cloneNode(false) as SVGGeometryElement;copy.removeAttribute('id');copy.removeAttribute('transform');copy.style.fill='none';copy.style.stroke=s.color;copy.style.strokeWidth=String(PixelWidth(s)*(closed&&s.align!=='center'?2:1));copy.style.strokeDasharray='none';copy.style.markerStart='none';copy.style.markerEnd='none';copy.style.mask='url(#'+uid+'-dash-fit)';
                    group.append(copy);element.style.stroke='none';
                    const transform=target.getAttribute('transform');if(transform)group.setAttribute('transform',transform);
                }else {visible.removeAttribute('transform');visible.style.mask='url(#'+uid+'-dash-fit)';group.append(visible);const transform=target.getAttribute('transform');if(transform)group.setAttribute('transform',transform);}
                target.after(group);S(this).effects.push(group);visible=group;
            }
            if(closed&&s.align!=='center') {
                if(visible===element){
                    const group=make('g',{'pointer-events':'none'}),copy=target.cloneNode(false) as SVGGeometryElement;
                    copy.removeAttribute('id');copy.removeAttribute('transform');copy.style.fill='none';copy.style.strokeWidth=String(2*PixelWidth(s));
                    const transform=target.getAttribute('transform');if(transform)group.setAttribute('transform',transform);
                    group.append(copy);target.after(group);S(this).effects.push(group);element.style.stroke='none';visible=group;
                }
                const shape=target.cloneNode(false) as SVGGeometryElement;shape.removeAttribute('id');shape.removeAttribute('style');shape.removeAttribute('transform');shape.setAttribute('stroke','none');shape.setAttribute('fill-rule',target.getAttribute('fill-rule')??'nonzero');
                if(s.align==='inside'){
                    const clip=make('clipPath',{id:uid+'-clip',clipPathUnits:'userSpaceOnUse'});shape.setAttribute('fill','#fff');clip.append(shape);defs.append(clip);visible.style.clipPath='url(#'+uid+'-clip)';
                }else {
                    const box=target.getBBox(),pad=PixelWidth(s)*12+10;
                    const mask=make('mask',{id:uid+'-mask',maskUnits:'userSpaceOnUse',x:box.x-pad,y:box.y-pad,width:box.width+2*pad,height:box.height+2*pad,'mask-type':'luminance'});
                    mask.append(make('rect',{x:box.x-pad,y:box.y-pad,width:box.width+2*pad,height:box.height+2*pad,fill:'white'}));shape.setAttribute('fill','black');mask.append(shape);defs.append(mask);visible.style.mask='url(#'+uid+'-mask)';
                }
                if(s.profile==='uniform')element.style.strokeWidth=String(2*PixelWidth(s));
            }
            const marker=(side:'start'|'end',kind:Types.Arrowhead,scale:number)=>{
                if(kind==='none')return 'none';
                const id=uid+'-'+side,extent=Math.max(1,PixelWidth(s))*3*scale/100;
                const node=make('marker',{id,viewBox:'0 0 10 10',markerUnits:'userSpaceOnUse',markerWidth:extent,markerHeight:extent,refX:s.arrowAlign==='tip'?9:1,refY:5,orient:'auto-start-reverse',overflow:'visible'});
                const shape=kind==='circle'?make('circle',{cx:5,cy:5,r:3.5}):kind==='square'?make('rect',{x:2,y:2,width:6,height:6}):make('path',{d:kind==='open-arrow'?'M1 1 L9 5 L1 9':'M1 1 L9 5 L1 9 Z'});
                shape.setAttribute('fill',kind==='open-arrow'?'none':s.color);shape.setAttribute('stroke',s.color);shape.setAttribute('stroke-width','1');node.append(shape);defs.append(node);return 'url(#'+id+')';
            };
            element.style.markerStart=marker('start',s.arrowStart,s.arrowScaleStart);element.style.markerEnd=marker('end',s.arrowEnd,s.arrowScaleEnd);
        }

        private Emit():void
        {
            const detail={...this.stroke,pixelWidth:PixelWidth(S(this).style),source:this};
            this.dispatchEvent(new CustomEvent('arianna:stroke-change',{bubbles:true,composed:true,detail}));
            this.dispatchEvent(new CustomEvent('arianna:change',{bubbles:true,composed:true,detail}));
        }

        private Render():void
        {
            const s=S(this).style,doc=this.ownerDocument,root=doc.createElement('section');root.style.position='relative';
            const chrome=doc.createElement('div');chrome.className='Strokes-Chrome';
            const minimize=doc.createElement('button');minimize.type='button';minimize.className='Strokes-WindowButton';minimize.textContent='«';minimize.title='Collapse / expand panel';minimize.setAttribute('aria-label',minimize.title);minimize.onclick=()=>this.toggleAttribute('minimized');chrome.append(minimize);const close=doc.createElement('button');close.type='button';close.className='Strokes-WindowButton';close.textContent='×';close.title='Close panel';close.setAttribute('aria-label','Close panel');close.onclick=()=>{this.style.display='none';};chrome.append(close);
            const header=doc.createElement('header');header.className='Strokes-Header';
            const title=doc.createElement('span');title.textContent='↕ Stroke';header.append(title);
            const menuButton=doc.createElement('button');menuButton.type='button';menuButton.textContent='☰';menuButton.className='Strokes-WindowButton';menuButton.title='Panel options';menuButton.setAttribute('aria-label','Panel options');menuButton.style.marginLeft='auto';menuButton.onclick=()=>{const old=root.querySelector('.Strokes-PanelMenu');if(old){old.remove();return;}const list=doc.createElement('div');list.className='Strokes-PanelMenu';for(const [text,action] of [['Reset stroke',()=>this.setStroke(structuredClone(DEFAULT))],['Dark',()=>this.setAttribute('theme','dark')],['Light',()=>this.setAttribute('theme','light')]] as const){const item=doc.createElement('button');item.type='button';item.textContent=text;item.onclick=()=>{list.remove();action();};list.append(item);}root.append(list);};header.append(menuButton);
            const body=doc.createElement('div');body.className='Strokes-Body';
            const row=(label:string,control:HTMLElement)=>{const node=doc.createElement('div');node.className='Strokes-Row';const caption=doc.createElement('span');caption.className='Strokes-Label';caption.textContent=label;node.append(caption,control);body.append(node);return node;};
            const divider=()=>{const node=doc.createElement('div');node.className='Strokes-Divider';body.append(node);};
            const update=(value:Partial<Interfaces.StrokeStyle>)=>this.setStroke(value);
            const number=(key:string,label:string,value:number,min:number,step:number,change:(n:number)=>void,max=1000)=>{
                const input=doc.createElement('input');input.type='number';input.className='Strokes-Number';input.dataset.control=key;input.setAttribute('aria-label',label);input.title=label;input.value=String(value);input.min=String(min);input.max=String(max);input.step=String(step);input.onchange=()=>change(NumberValue(input.value,value,min,max));return input;
            };
            const select=<T extends string>(key:string,label:string,value:T,values:readonly [T,string][],change:(value:T)=>void)=>{
                const input=doc.createElement('select');input.className='Strokes-Select';input.dataset.control=key;input.setAttribute('aria-label',label);input.title=label;
                for(const [id,text] of values){const option=doc.createElement('option');option.value=id;option.textContent=text;option.selected=id===value;input.append(option);}input.onchange=()=>change(input.value as T);return input;
            };
            const paths:Record<string,string>={
                butt:'M5 5V19M19 5V19M6 10H18V14H6Z',round:'M5 5V19M19 5V19M8 10H16A2 2 0 0 1 16 14H8A2 2 0 0 1 8 10Z',square:'M7 5V19M17 5V19M4 10H20V14H4Z',
                miter:'M5 20V5H20M9 20V9H20',roundjoin:'M5 20V10Q5 5 10 5H20M9 20V12Q9 9 12 9H20',bevel:'M5 20V10L10 5H20M9 20V12L12 9H20',
                center:'M5 20V5H20M8 20V8H20M3 20V3H20',inside:'M5 20V5H20M8 20V8H20M11 20V11H20',outside:'M9 20V9H20M6 20V6H20M3 20V3H20',
                exact:'M3 5H8M12 5H17M21 5H23M3 19H8M12 19H17M21 19H23M3 5V9M3 13V19',corners:'M3 10V5H8M12 5H17M21 5H23V10M3 14V19H8M12 19H17M21 19H23V14',
                tip:'M3 12H20M15 7L20 12L15 17M20 3V21',extend:'M3 12H23M18 7L23 12L18 17M17 3V21',
                along:'M3 7H21M3 7L7 3M3 7L7 11M21 17H3M21 17L17 13M21 17L17 21',across:'M7 3V21M7 3L3 7M7 3L11 7M17 21V3M17 21L13 17M17 21L21 17',
                swap:'M3 7H21L16 3M21 17H3L8 21',link:'M10 8L14 4Q20 1 22 7L17 12M14 16L10 20Q4 23 2 17L7 12M8 16L16 8'
            };
            const button=(key:string,label:string,icon:string,active:boolean,action:()=>void)=>{
                const node=doc.createElement('button');node.type='button';node.className='Strokes-Button';node.dataset.control=key;node.dataset.active=String(active);node.title=label;node.setAttribute('aria-label',label);node.setAttribute('aria-pressed',String(active));
                const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
                const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',paths[icon]??paths.center);path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','2');svg.append(path);node.append(svg);node.onclick=action;return node;
            };
            const buttons=<T extends string>(key:string,value:T,items:readonly [T,string,string][],change:(value:T)=>void)=>{
                const group=doc.createElement('div');group.className='Strokes-Buttons';for(const [id,label,icon] of items)group.append(button(key+'-'+id,label,icon,id===value,()=>change(id)));return group;
            };
            const weight=doc.createElement('div');weight.className='Strokes-Weight';
            const steppers=doc.createElement('div');steppers.className='Strokes-Steppers';
            for(const [text,delta,label] of [['▴',.25,'Increase weight'],['▾',-.25,'Decrease weight']] as const){const step=doc.createElement('button');step.type='button';step.textContent=text;step.setAttribute('aria-label',label);step.onclick=()=>update({width:Math.max(.01,s.width+delta)});steppers.append(step);}
            const weightInput=doc.createElement('input');weightInput.className='Strokes-Number';weightInput.dataset.control='width';weightInput.setAttribute('aria-label','Weight');weightInput.value=s.width+' '+s.unit;
            weightInput.onchange=()=>{const match=weightInput.value.trim().match(/^([\d.]+)\s*(pt|px|mm)?$/);if(match)update({width:NumberValue(match[1],s.width,.01,1000),unit:(match[2] as Types.Unit)||s.unit});else weightInput.value=s.width+' '+s.unit;};
            const weights=doc.createElement('select');weights.className='Strokes-Select';weights.dataset.control='weightPreset';weights.setAttribute('aria-label','Weight presets');
            const prompt=doc.createElement('option');prompt.value='';prompt.textContent='';weights.append(prompt);for(const value of [.25,.5,.75,1,2,3,4,5,6,8,10,12,16,20,30,40]){const option=doc.createElement('option');option.value=String(value);option.textContent=value+' '+s.unit;weights.append(option);}weights.onchange=()=>{if(weights.value)update({width:Number(weights.value)});};
            weight.append(steppers,weightInput,weights);row('Weight:',weight);
            row('Cap:',buttons('cap',s.cap,[['butt','Butt cap','butt'],['round','Round cap','round'],['square','Projecting cap','square']],cap=>update({cap})));
            const corner=doc.createElement('div');corner.className='Strokes-Corner';corner.append(buttons('join',s.join,[['miter','Miter join','miter'],['round','Round join','roundjoin'],['bevel','Bevel join','bevel']],join=>update({join})));
            const limit=doc.createElement('label');limit.className='Strokes-Limit';limit.textContent='Limit:';const limitInput=number('miterLimit','Miter limit',s.miterLimit,1,.25,n=>update({miterLimit:n}));limitInput.disabled=s.join!=='miter';const multiplier=doc.createElement('span');multiplier.textContent='×';limit.append(limitInput,multiplier);corner.append(limit);row('Corner:',corner);
            const alignButtons=buttons('align',s.align,[['center','Align stroke to center','center'],['inside','Align stroke to inside (closed shapes)','inside'],['outside','Align stroke to outside (closed shapes)','outside']],align=>update({align}));const bound=S(this).target;const closed=!!bound&&(['rect','circle','ellipse','polygon'].includes(bound.tagName.toLowerCase())||/[zZ]\s*$/.test(bound.getAttribute('d')??''));for(const node of Array.from(alignButtons.children))(node as HTMLButtonElement).disabled=(node as HTMLElement).dataset.control!=='align-center'&&!closed;row('Align Stroke:',alignButtons);
            divider();
            const dashHead=doc.createElement('div');dashHead.className='Strokes-DashHead';const check=doc.createElement('input');check.type='checkbox';check.className='Strokes-Check';check.dataset.control='dashed';check.setAttribute('aria-label','Dashed Line');check.checked=s.dash.length>0;
            check.onchange=()=>{if(!check.checked)S(this).dashCache=[...s.dash];update({dash:check.checked?(S(this).dashCache??[12,6]):[]});};
            const caption=doc.createElement('label');caption.textContent='Dashed Line';caption.prepend(check);dashHead.append(caption);
            const fit=buttons('dashFit',s.dashFit,[['exact','Preserve exact dash and gap lengths','exact'],['corners','Fit dash cycle to path length','corners']],dashFit=>update({dashFit}));for(const node of Array.from(fit.children))(node as HTMLButtonElement).disabled=!check.checked;dashHead.append(fit);body.append(dashHead);
            const dashGrid=doc.createElement('div');dashGrid.className='Strokes-DashGrid';const dash=[...(s.dash.length?s.dash:S(this).dashCache??[12,6])];while(dash.length<6)dash.push(0);
            dash.slice(0,6).forEach((value,index)=>{const cell=doc.createElement('label');cell.className='Strokes-DashCell';const label=index%2?'gap':'dash';const input=number('dash-'+index,label+' '+(Math.floor(index/2)+1),value,0,.25,n=>{dash[index]=n;update({dash});});input.disabled=!check.checked;if(!check.checked&&!S(this).dashCache)input.value='';const text=doc.createElement('span');text.textContent=label;cell.append(input,text);dashGrid.append(cell);});body.append(dashGrid);
            divider();
            const arrowValues:readonly [Types.Arrowhead,string][]=[['none','━━━━━━━━'],['arrow','━━━━▶'],['open-arrow','━━━━❯'],['circle','━━━━●'],['square','━━━━■']];
            const arrows=doc.createElement('div');arrows.className='Strokes-Arrows';arrows.append(select('arrowStart','Start arrowhead',s.arrowStart,arrowValues.map(([id,label])=>[id,id==='none'?label:id==='arrow'?'◀━━━━':id==='open-arrow'?'❮━━━━':id==='circle'?'●━━━━':'■━━━━'] as [Types.Arrowhead,string]),arrowStart=>update({arrowStart})),select('arrowEnd','End arrowhead',s.arrowEnd,arrowValues,arrowEnd=>update({arrowEnd})),button('swap','Swap arrowheads and scales','swap',false,()=>update({arrowStart:s.arrowEnd,arrowEnd:s.arrowStart,arrowScaleStart:s.arrowScaleEnd,arrowScaleEnd:s.arrowScaleStart})));row('Arrowheads:',arrows);
            const scales=doc.createElement('div');scales.className='Strokes-Scale';
            const start=number('arrowScaleStart','Start scale (%)',s.arrowScaleStart,1,1,n=>update({arrowScaleStart:n,...(s.linkScales?{arrowScaleEnd:n}:{})}));
            const end=number('arrowScaleEnd','End scale (%)',s.arrowScaleEnd,1,1,n=>update({arrowScaleEnd:n,...(s.linkScales?{arrowScaleStart:n}:{})}));
            start.value=s.arrowScaleStart+'%';end.value=s.arrowScaleEnd+'%';start.onchange=()=>{const n=NumberValue(parseFloat(start.value),s.arrowScaleStart,1,1000);update({arrowScaleStart:n,...(s.linkScales?{arrowScaleEnd:n}:{})});};end.onchange=()=>{const n=NumberValue(parseFloat(end.value),s.arrowScaleEnd,1,1000);update({arrowScaleEnd:n,...(s.linkScales?{arrowScaleStart:n}:{})});};start.type='text';end.type='text';start.disabled=s.arrowStart==='none';end.disabled=s.arrowEnd==='none';scales.append(start,end,button('linkScales','Link arrowhead scales','link',s.linkScales,()=>update({linkScales:!s.linkScales,...(!s.linkScales?{arrowScaleEnd:s.arrowScaleStart}:{})})));row('Scale:',scales);
            const arrowAlign=buttons('arrowAlign',s.arrowAlign,[['tip','Align arrow tip to endpoint','tip'],['extend','Extend arrow beyond endpoint','extend']],arrowAlign=>update({arrowAlign}));for(const node of Array.from(arrowAlign.children))(node as HTMLButtonElement).disabled=s.arrowStart==='none'&&s.arrowEnd==='none';row('Align:',arrowAlign);divider();
            const profiles:readonly [Types.Profile,string][]=[['uniform','━━ Uniform'],['width-1','Width profile 1'],['width-2','Width profile 2'],['taper-start','Taper start'],['taper-end','Taper end']];
            const profile=doc.createElement('div');profile.className='Strokes-Profile';profile.append(select('profile','Width profile',s.profile,profiles,profile=>update({profile})),button('flipAlong','Flip along path','along',s.flipAlong,()=>update({flipAlong:!s.flipAlong})),button('flipAcross','Flip across path (asymmetric profile 2)','across',s.flipAcross,()=>update({flipAcross:!s.flipAcross})));for(const node of Array.from(profile.querySelectorAll('button')))(node as HTMLButtonElement).disabled=s.profile==='uniform';row('Profile:',profile);
            root.append(chrome,header,body);this.replaceChildren(root);if(this.hasAttribute('floating'))this.BindFloating(header);
        }

        private BindFloating(header:HTMLElement):void
        {
            let pointer=-1,startX=0,startY=0,startLeft=0,startTop=0;
            header.addEventListener('pointerdown',event=>{if((event.target as Element).closest('button'))return;pointer=event.pointerId;startX=event.clientX;startY=event.clientY;startLeft=this.offsetLeft;startTop=this.offsetTop;this.style.left=`${startLeft}px`;this.style.right='auto';this.style.top=`${startTop}px`;header.setPointerCapture(pointer);event.preventDefault();});
            header.addEventListener('pointermove',event=>{if(event.pointerId!==pointer)return;const parent=this.offsetParent as HTMLElement|null,maxX=Math.max(0,(parent?.clientWidth??Infinity)-this.offsetWidth),maxY=Math.max(0,(parent?.clientHeight??Infinity)-this.offsetHeight);this.style.left=`${Math.max(0,Math.min(maxX,startLeft+event.clientX-startX))}px`;this.style.top=`${Math.max(0,Math.min(maxY,startTop+event.clientY-startY))}px`;});
            const release=(event:PointerEvent)=>{if(event.pointerId!==pointer)return;try{header.releasePointerCapture(pointer);}catch{}pointer=-1;};header.addEventListener('pointerup',release);header.addEventListener('pointercancel',release);
        }
    }
}

export type LineTool=Strokes.Interfaces.LineTool;
export type StrokeStyle=Strokes.Interfaces.StrokeStyle;
export type StrokesOptions=Strokes.Interfaces.StrokesOptions;
export default Strokes.Strokes;
