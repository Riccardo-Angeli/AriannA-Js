/** @module components/graphics/2D/Strokes */
import { Component, Css, Templates } from '../../../core/index.ts';
import Mover from './modifiers/Mover.ts';
import Resizer from './modifiers/Resizer.ts';

const html=Templates.Template.Html;

export namespace Strokes
{
    export namespace Types
    {
        export type Cap='butt'|'round'|'square';
        export type Join='miter'|'round'|'bevel';
        export type Align='center'|'inside'|'outside';
        export type Unit='px'|'pt'|'mm';
        export type Arrowhead=string;
        export type Profile=string;
        export type DashFit='exact'|'corners';
        export type ArrowAlign='tip'|'extend';
    }

    export namespace Interfaces
    {
        export interface LineTool{id:string;label:string;icon?:string;}
        /** Multipliers of the full stroke width on either side of the centreline. */
        export interface WidthPoint { t:number; left:number; right:number; }
        export interface WidthProfile { id:string; label:string; points:WidthPoint[]; interpolation?:'linear'|'smooth'; }
        export interface MarkerShape {
            tag:'path'|'circle'|'ellipse'|'rect'|'polygon'|'polyline';
            attributes:Record<string,string|number>;
            fill?:'stroke'|'none'; stroke?:'stroke'|'none'; strokeWidth?:number;
        }
        /** Geometry faces +X. tip and base are alignment anchors in viewBox coordinates. */
        export interface ArrowheadDefinition { id:string;label:string;viewBox:[number,number,number,number];tip:[number,number];base:[number,number];shapes:MarkerShape[]; }
        export interface PresetLibrary { version:1;profiles:WidthProfile[];arrowheads:ArrowheadDefinition[]; }
        export interface StrokeStyle
        {
            color:string;width:number;unit:Types.Unit;cap:Types.Cap;join:Types.Join;
            align:Types.Align;dash:number[];dashOffset:number;miterLimit:number;
            arrowStart:Types.Arrowhead;arrowEnd:Types.Arrowhead;
            arrowScaleStart:number;arrowScaleEnd:number;profile:Types.Profile;
            dashFit:Types.DashFit;arrowAlign:Types.ArrowAlign;linkScales:boolean;flipAlong:boolean;flipAcross:boolean;
        }
        export interface StrokesOptions extends Partial<StrokeStyle>{theme?:'dark'|'light';presets?:PresetLibrary;}
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
    interface State{style:Interfaces.StrokeStyle;target:Interfaces.StrokeTarget|null;effects:Element[];savedStyle:string|null;uid:string;dashCache?:number[];connected?:boolean;resizing?:boolean;resizeWidth?:string|null;
        profiles:Map<string,Interfaces.WidthProfile>;arrows:Map<string,Interfaces.ArrowheadDefinition>;popup:HTMLElement|null;popupAbort:AbortController|null;observer:MutationObserver|null;frame:number|null;savedStroke:unknown;}
    const Motion=new WeakMap<HTMLElement,{mover:InstanceType<typeof Mover>;resizer:InstanceType<typeof Resizer>;controller:AbortController}>();
    let sequence=0;
    const States=new WeakMap<HTMLElement,State>();
    const S=(host:HTMLElement):State=>{let state=States.get(host);if(!state){state={style:structuredClone(DEFAULT),target:null,effects:[],savedStyle:null,uid:'arianna-stroke-'+(++sequence),profiles:new Map(),arrows:new Map(),popup:null,popupAbort:null,observer:null,frame:null,savedStroke:undefined};States.set(host,state);}return state;};
    const NumberValue=(value:unknown,fallback:number,min=-Infinity,max=Infinity):number=>{const n=value===null||value===undefined||value===''?NaN:Number(value);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;};
    const ParseDash=(value:string|null):number[]=>value?.split(/[ ,]+/).map(Number).filter(n=>Number.isFinite(n)&&n>=0)??[];
    const PixelWidth=(style:Interfaces.StrokeStyle):number=>style.width*(style.unit==='pt'?96/72:style.unit==='mm'?96/25.4:1);

    const symmetric=(id:string,label:string,fn:(t:number)=>number):Interfaces.WidthProfile=>({id,label,interpolation:'linear',points:Array.from({length:65},(_,i)=>{const t=i/64,w=fn(t)/2;return {t,left:w,right:w};})});
    const BuiltProfiles:Interfaces.WidthProfile[]=[
        symmetric('uniform','Uniforme',()=>1),
        symmetric('width-1','Profilo 1 · fusiforme',t=>Math.sin(Math.PI*t)),
        symmetric('width-2','Profilo 2 · doppio lobo',t=>Math.sin(Math.PI*t)*(.16+.84*Math.abs(Math.cos(Math.PI*t)))),
        {id:'width-3',label:'Profilo 3 · plateau',interpolation:'linear',points:[{t:0,left:0,right:0},{t:.12,left:.5,right:.5},{t:.88,left:.5,right:.5},{t:1,left:0,right:0}]},
        symmetric('width-4','Profilo 4 · cuneo',t=>1-t),
        symmetric('width-5','Profilo 5 · goccia',t=>Math.pow(t,.85)*Math.pow(1-t,.28)/.529),
        {id:'width-6',label:'Profilo 6 · arco asimmetrico',interpolation:'linear',points:Array.from({length:65},(_,i)=>({t:i/64,left:Math.sin(Math.PI*i/64),right:0}))},
        symmetric('taper-start','Taper start',t=>t),symmetric('taper-end','Taper end',t=>1-t)
    ];
    const pathShape=(d:string,open=false):Interfaces.MarkerShape=>({tag:'path',attributes:{d},fill:open?'none':'stroke',stroke:open?'stroke':'none',strokeWidth:open?1:0});
    const arrow=(id:string,label:string,shapes:Interfaces.MarkerShape[],tip:[number,number]=[10,5],base:[number,number]=[0,5]):Interfaces.ArrowheadDefinition=>({id,label,viewBox:[0,0,10,10],tip,base,shapes});
    /** Native vector equivalents; no Illustrator binary assets or application dependency. */
    const BuiltArrows:Interfaces.ArrowheadDefinition[]=[
        arrow('none','Nessuno',[]),
        ...[
            ['M0 0L10 5L0 10L3 5Z',false],['M0 2L10 5L0 8L3 5Z',false],['M0 3L10 5L0 7L3 5Z',false],
            ['M0 0Q2 5 10 5Q2 5 0 10L3 5Z',false],['M0 2L10 5L0 8L2 5Z',false],['M1 0L10 5L1 10Z',false],
            ['M1 2L10 5L1 8Z',false],['M0 0L10 5L0 10Z',false],['M1 0L10 5L1 10',true],['M1 2L10 5L1 8',true],
            ['M0 0L6 5L0 10M4 0L10 5L4 10',true],['M0 2L6 5L0 8M4 2L10 5L4 8',true],
            ['M0 0L10 5L0 10L0 7L6 5L0 3Z',false],['M0 0L10 5L0 10L5 5Z',false],['M0 0L10 5L0 5Z',false],
            ['M0 5L10 5L0 10Z',false],['M0 0L10 5L0 5',true],['M0 5L10 5L0 10',true],
            ['M0 1L8 5L0 9L2 5Z M7 1H9V9H7Z',false],['M0 0L10 5L0 10L3 5Z M0 0L5 0L5 10L0 10Z',false],
        ].map(([d,open],i)=>arrow('arrow-'+(i+1),'Freccia '+(i+1),[pathShape(d as string,open as boolean)])),
        arrow('arrow-21','21 · Disco',[{tag:'circle',attributes:{cx:5,cy:5,r:4},fill:'stroke'}],[9,5]),
        arrow('arrow-22','22 · Anello',[{tag:'circle',attributes:{cx:5,cy:5,r:4},fill:'none',stroke:'stroke',strokeWidth:1}],[9,5]),
        arrow('arrow-23','23 · Disco con punto',[{tag:'circle',attributes:{cx:5,cy:5,r:4},fill:'none',stroke:'stroke',strokeWidth:1},{tag:'circle',attributes:{cx:5,cy:5,r:1.5},fill:'stroke'}],[9,5]),
        arrow('arrow-24','24 · Quadrato',[{tag:'rect',attributes:{x:1,y:1,width:8,height:8},fill:'stroke'}],[9,5]),
        arrow('arrow-25','25 · Quadrato aperto',[{tag:'rect',attributes:{x:1,y:1,width:8,height:8},fill:'none',stroke:'stroke',strokeWidth:1}],[9,5]),
        arrow('arrow-26','26 · Rombo',[pathShape('M0 5L5 0L10 5L5 10Z')]),
        arrow('arrow-27','27 · Rombo aperto',[pathShape('M0 5L5 0L10 5L5 10Z',true)]),
        arrow('arrow-28','28 · Barra',[pathShape('M8 0V10',true)],[8,5],[8,5]),
        arrow('arrow-29','29 · Doppia barra',[pathShape('M4 0V10M8 0V10',true)],[8,5],[4,5]),
        arrow('arrow-30','30 · Tripla barra',[pathShape('M2 0V10M5 0V10M8 0V10',true)],[8,5],[2,5]),
        arrow('arrow-31','31 · Croce',[pathShape('M1 1L9 9M1 9L9 1',true)],[9,5]),
        arrow('arrow-32','32 · Plus',[pathShape('M1 5H9M5 1V9',true)],[9,5]),
        arrow('arrow-33','33 · Stella',[pathShape('M5 0L6.2 3.5L10 3.5L7 5.8L8 10L5 7.5L2 10L3 5.8L0 3.5L3.8 3.5Z')]),
        arrow('arrow-34','34 · Esagono',[pathShape('M0 5L2.5 .7H7.5L10 5L7.5 9.3H2.5Z')]),
        arrow('arrow-35','35 · Cerchio e barra',[{tag:'circle',attributes:{cx:3.5,cy:5,r:3},fill:'none',stroke:'stroke',strokeWidth:1},pathShape('M8 0V10',true)],[8,5]),
        arrow('arrow-36','36 · Zampa a tre punte',[pathShape('M0 5L10 0M0 5H10M0 5L10 10',true)]),
        arrow('arrow-37','37 · Coda piumata',[pathShape('M0 5L5 0M0 5L5 10M4 5L9 0M4 5L9 10',true)],[9,5]),
        arrow('arrow-38','38 · Semicerchio',[pathShape('M5 0A5 5 0 0 1 5 10Z')],[10,5],[5,5]),
        arrow('arrow-39','39 · Gancio',[pathShape('M0 5H6Q10 5 10 1Q10 0 8 0',true)],[10,5]),
        arrow('arrow','Arrow',[pathShape('M1 1L9 5L1 9Z')],[9,5],[1,5]),
        arrow('open-arrow','Open arrow',[pathShape('M1 1L9 5L1 9',true)],[9,5],[1,5]),
        arrow('circle','Circle',[{tag:'circle',attributes:{cx:5,cy:5,r:3.5},fill:'stroke'}],[8.5,5]),
        arrow('square','Square',[{tag:'rect',attributes:{x:2,y:2,width:6,height:6},fill:'stroke'}],[8,5])
    ];
    const ProfileById=(host:HTMLElement,id:string)=>S(host).profiles.get(id)??BuiltProfiles.find(p=>p.id===id);
    const ArrowById=(host:HTMLElement,id:string)=>S(host).arrows.get(id)??BuiltArrows.find(p=>p.id===id);
    export function SampleProfile(profile:Interfaces.WidthProfile,t:number):{left:number;right:number} {
        t=Math.max(0,Math.min(1,t));const ps=profile.points;if(!ps.length)return {left:.5,right:.5};
        let i=1;while(i<ps.length-1&&ps[i].t<t)i++;const a=ps[i-1],b=ps[i]??a;
        let f=(t-a.t)/(b.t-a.t||1);f=Math.max(0,Math.min(1,f));if(profile.interpolation==='smooth')f=f*f*(3-2*f);
        return {left:a.left+(b.left-a.left)*f,right:a.right+(b.right-a.right)*f};
    }
    const validId=(id:string)=>typeof id==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/.test(id);
    const num=(v:unknown)=>typeof v==='number'&&Number.isFinite(v);
    function ValidateProfile(p:Interfaces.WidthProfile):Interfaces.WidthProfile {
        if(!p||!validId(p.id)||typeof p.label!=='string'||!Array.isArray(p.points)||p.points.length<2||p.points.length>256)throw new TypeError('Invalid width profile');
        if(p.interpolation&&!['linear','smooth'].includes(p.interpolation))throw new TypeError('Invalid profile interpolation');
        let last=-1;for(const point of p.points){if(!num(point.t)||point.t<=last||point.t<0||point.t>1||!num(point.left)||!num(point.right)||point.left<0||point.right<0||point.left>16||point.right>16)throw new RangeError('Invalid profile point');last=point.t;}
        if(p.points[0].t!==0||p.points.at(-1)!.t!==1)throw new RangeError('Profile must span t=0 to t=1');return structuredClone(p);
    }
    function ValidateArrow(a:Interfaces.ArrowheadDefinition):Interfaces.ArrowheadDefinition {
        if(!a||!validId(a.id)||typeof a.label!=='string'||!Array.isArray(a.viewBox)||a.viewBox.length!==4||!a.viewBox.every(num)||a.viewBox[2]<=0||a.viewBox[3]<=0||!Array.isArray(a.tip)||!Array.isArray(a.base)||a.tip.length!==2||a.base.length!==2||!a.tip.every(num)||!a.base.every(num)||!Array.isArray(a.shapes)||a.shapes.length>64)throw new TypeError('Invalid arrowhead definition');
        const allowed:Record<string,string[]>={path:['d'],circle:['cx','cy','r'],ellipse:['cx','cy','rx','ry'],rect:['x','y','width','height','rx','ry'],polygon:['points'],polyline:['points']};
        for(const shape of a.shapes){if(!allowed[shape.tag]||!shape.attributes)throw new TypeError('Invalid marker primitive');
            if(shape.fill&&!['stroke','none'].includes(shape.fill)||shape.stroke&&!['stroke','none'].includes(shape.stroke))throw new TypeError('Invalid marker paint');
            if(shape.strokeWidth!=null&&(!num(shape.strokeWidth)||shape.strokeWidth<0||shape.strokeWidth>32))throw new TypeError('Invalid marker stroke width');
            for(const [key,v]of Object.entries(shape.attributes)){if(!allowed[shape.tag].includes(key))throw new TypeError('Unsupported marker attribute '+key);if(typeof v==='number'&&!num(v))throw new TypeError('Invalid geometry');if(typeof v!=='number'&&typeof v!=='string')throw new TypeError('Invalid geometry');if(String(v).length>10000)throw new RangeError('Marker geometry too large');if(key==='d'&&!/^[\s0-9eE.,+\-MmLlHhVvCcSsQqTtAaZz]*$/.test(String(v)))throw new TypeError('Invalid path commands');if(key==='points'&&!/^[\s0-9eE.,+\-]*$/.test(String(v)))throw new TypeError('Invalid points');}
        }return structuredClone(a);
    }

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
        new Css.Rule('arianna-strokes,.Strokes',{Background:'#25292d',Border:'1px solid #111417',BorderRadius:'8px',BoxSizing:'border-box',Color:'#dce0e3',Display:'block',FontFamily:'system-ui,sans-serif',Overflow:'hidden',Width:'365px',Position:'relative',MinWidth:'365px',MinHeight:'32px',ColorScheme:'dark'}),
        new Css.Rule('arianna-strokes[floating],.Strokes[floating]',{BoxShadow:'0 12px 32px #0006',Position:'absolute',Right:'16px',Top:'16px',ZIndex:'35',Resize:'none',MinWidth:'365px',MinHeight:'30px',Overflow:'auto'}),
        new Css.Rule('.Strokes-Chrome',{Height:'20px',Background:'linear-gradient(180deg,#363b40,#25292d)',BorderBottom:'1px solid #111417',Display:'flex',JustifyContent:'flex-end'}),
        new Css.Rule('.Strokes-Header',{AlignItems:'center',Background:'linear-gradient(180deg,#363b40,#25292d)',BorderBottom:'1px solid #111417',Display:'flex',FontSize:'12px',FontWeight:'700',Height:'36px',Flex:'0 0 36px',BoxSizing:'border-box',Padding:'6px 7px 6px 10px',Gap:'8px'}),
        new Css.Rule('arianna-strokes[floating] .Strokes-Header',{Cursor:'grab',TouchAction:'none',UserSelect:'none'}),
        new Css.Rule('.Strokes-WindowButton',{Appearance:'none',Background:'linear-gradient(180deg,#42484d,#2e3337)',Border:'1px solid #171a1d',BorderRadius:'4px',Color:'inherit',Cursor:'pointer',Height:'24px',MinWidth:'25px',Padding:'0 5px',FontSize:'11px',TextShadow:'0 -1px 1px #0008',BoxShadow:'inset 0 1px 0 #ffffff18'}),
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
        new Css.Rule('.Strokes-DashHead label',{Display:'inline-flex',AlignItems:'center',Gap:'6px',Cursor:'pointer',WhiteSpace:'nowrap'}),
        new Css.Rule('.Strokes-Check',{AccentColor:'#e40c88',Margin:'0',Width:'13px',Height:'13px',Flex:'0 0 13px',Cursor:'pointer'}),
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
        new Css.Rule('arianna-strokes[minimized],.Strokes[minimized]',{MinHeight:'36px',MaxHeight:'36px',Overflow:'hidden'}),
        new Css.Rule('arianna-strokes[theme="light"],.Strokes[theme="light"]',{Background:'#eef0f2',BorderColor:'#b9bec3',Color:'#25292d',ColorScheme:'light'}),
        new Css.Rule('arianna-strokes[theme="light"] .Strokes-WindowButton,.Strokes[theme="light"] .Strokes-WindowButton',{Background:'linear-gradient(180deg,#f9fbfc,#e0e4e7)',BorderColor:'#b8bdc2',Color:'#25292d',TextShadow:'0 1px 1px #fff9'}),
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
        ,new Css.Rule('.Strokes-PresetButton',{Display:'flex',AlignItems:'center',Gap:'4px',Width:'100%',Height:'28px',BorderRadius:'3px',Border:'1px solid #15181a',Background:'#1b1f22',Color:'#dce0e3',Padding:'2px 5px',Cursor:'pointer',MinWidth:'0'})
        ,new Css.Rule('.Strokes-PresetButton svg',{Width:'100%',Height:'20px',Display:'block'})
        ,new Css.Rule('.Strokes[theme="light"] .Strokes-PresetButton,arianna-strokes[theme="light"] .Strokes-PresetButton',{Background:'#fff',Color:'#25292d',BorderColor:'#b8bdc2'})
        ,new Css.Rule('.Strokes-PresetMenu',{Position:'fixed',ZIndex:'100000',BoxSizing:'border-box',Display:'grid',Gap:'2px',Padding:'5px',MaxHeight:'360px',OverflowY:'auto',Background:'#25292d',Color:'#dce0e3',Border:'1px solid #111417',BorderRadius:'5px',BoxShadow:'0 12px 32px #0006',Font:'12px system-ui'})
        ,new Css.Rule('.Strokes-PresetMenu[theme="light"]',{Background:'#eef0f2',Color:'#25292d',BorderColor:'#b9bec3'})
        ,new Css.Rule('.Strokes-PresetOption',{Display:'flex',AlignItems:'center',Gap:'8px',MinHeight:'36px',Width:'100%',BoxSizing:'border-box',Padding:'5px',Background:'transparent',Color:'inherit',Border:'1px solid transparent',BorderRadius:'3px',Cursor:'pointer',Font:'inherit',TextAlign:'left'})
        ,new Css.Rule('.Strokes-PresetOption svg',{Width:'96px',Height:'23px',Flex:'0 0 auto'})
        ,new Css.Rule('.Strokes-PresetOption[aria-selected="true"],.Strokes-PresetOption:hover',{Background:'linear-gradient(180deg,#ff4dad,#e40c88,#b90769)',Color:'#fff',BorderColor:'#e40c88'})
        ,new Css.Rule('.Strokes-PresetOption:focus-visible,.Strokes-PresetButton:focus-visible',{Outline:'2px solid #e40c88',OutlineOffset:'-2px'})
    ]);

    @Component('arianna-strokes',Styles,{Shadow:false,Attributes:['theme','color','width','unit','cap','join','align','dash','dash-offset','miter-limit','arrow-start','arrow-end','arrow-scale-start','arrow-scale-end','profile','floating','minimized','dash-fit','arrow-align','link-scales','flip-along','flip-across'],Properties:['stroke','presets']})
    export class Strokes extends HTMLElement
    {
        public static readonly Styles=Styles;
        public template=html``;

        public constructor(options:Interfaces.StrokesOptions={})
        {
            super();
            const {theme,presets,...stroke}=options;if(presets)this.ImportPresets(presets);S(this).style={...S(this).style,...stroke,dash:Array.isArray(options.dash)?[...options.dash]:[]};this.Normalize();
            if(theme)this.setAttribute('theme',theme);
        }

        public onCreated():void{if(this.isConnected)this.onConnected();}
        public onConnected():void
        {
            this.classList.add('Strokes');
            if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');
            if(!S(this).connected){this.ReadAttributes();S(this).connected=true;}this.Render();this.Apply();
        }
        public onAttributeChanged(name?:string):void{if(!name||!['theme','color','width','unit','cap','join','align','dash','dash-offset','miter-limit','arrow-start','arrow-end','arrow-scale-start','arrow-scale-end','profile','floating','minimized','dash-fit','arrow-align','link-scales','flip-along','flip-across'].includes(name))return;if(name==='width'&&(S(this).resizing||!this.hasAttribute('width')||Number(this.getAttribute('width'))===S(this).style.width))return;if(name==='minimized'){this.ClosePresetMenu();const motion=Motion.get(this);if(motion){this.hasAttribute('minimized')?motion.resizer.disable():motion.resizer.enable();}return;}if(!this.isConnected)return;this.ReadAttributes(name);this.Render();this.Apply();}

        public get Profiles():Interfaces.WidthProfile[]{return structuredClone([...BuiltProfiles,...S(this).profiles.values()]);}
        public get Arrowheads():Interfaces.ArrowheadDefinition[]{return structuredClone([...BuiltArrows,...S(this).arrows.values()]);}
        public get presets():Interfaces.PresetLibrary{return this.ExportPresets();}
        public set presets(value:Interfaces.PresetLibrary){this.ImportPresets(value);}
        public RegisterProfile(definition:Interfaces.WidthProfile,replace=false):this {
            const p=ValidateProfile(definition),s=S(this);if(BuiltProfiles.some(b=>b.id===p.id)||s.profiles.has(p.id)&&!replace)throw new Error('Profile ID already exists: '+p.id);
            if(s.profiles.size>=128&&!s.profiles.has(p.id))throw new RangeError('Maximum 128 custom profiles');s.profiles.set(p.id,p);this.Render();this.Apply();this.EmitPresets();return this;
        }
        public RegisterArrowhead(definition:Interfaces.ArrowheadDefinition,replace=false):this {
            const a=ValidateArrow(definition),s=S(this);if(BuiltArrows.some(b=>b.id===a.id)||s.arrows.has(a.id)&&!replace)throw new Error('Arrowhead ID already exists: '+a.id);
            if(s.arrows.size>=128&&!s.arrows.has(a.id))throw new RangeError('Maximum 128 custom arrowheads');s.arrows.set(a.id,a);this.Render();this.Apply();this.EmitPresets();return this;
        }
        public RemoveProfile(id:string):this {if(BuiltProfiles.some(p=>p.id===id))throw new Error('Built-in profiles cannot be removed');S(this).profiles.delete(id);if(S(this).style.profile===id)S(this).style.profile='uniform';this.Render();this.Apply();this.EmitPresets();return this;}
        public RemoveArrowhead(id:string):this {if(BuiltArrows.some(p=>p.id===id))throw new Error('Built-in arrowheads cannot be removed');const s=S(this);s.arrows.delete(id);if(s.style.arrowStart===id)s.style.arrowStart='none';if(s.style.arrowEnd===id)s.style.arrowEnd='none';this.Render();this.Apply();this.EmitPresets();return this;}
        public ResetPresets():this {return this.ImportPresets({version:1,profiles:[],arrowheads:[]});}
        public ExportPresets():Interfaces.PresetLibrary {return structuredClone({version:1,profiles:[...S(this).profiles.values()],arrowheads:[...S(this).arrows.values()]});}
        public ImportPresets(value:Interfaces.PresetLibrary|string):this {
            const v=typeof value==='string'?JSON.parse(value):value;
            if(!v||v.version!==1||!Array.isArray(v.profiles)||!Array.isArray(v.arrowheads)||v.profiles.length>128||v.arrowheads.length>128)throw new TypeError('Invalid preset library');
            const profiles=new Map<string,Interfaces.WidthProfile>(),arrows=new Map<string,Interfaces.ArrowheadDefinition>();
            for(const p of v.profiles){const checked=ValidateProfile(p);if(profiles.has(p.id)||BuiltProfiles.some(b=>b.id===p.id))throw new Error('Duplicate or built-in profile ID');profiles.set(p.id,checked);}
            for(const a of v.arrowheads){const checked=ValidateArrow(a);if(arrows.has(a.id)||BuiltArrows.some(b=>b.id===a.id))throw new Error('Duplicate or built-in arrowhead ID');arrows.set(a.id,checked);}
            const s=S(this);s.profiles=profiles;s.arrows=arrows;if(!ProfileById(this,s.style.profile))s.style.profile='uniform';if(!ArrowById(this,s.style.arrowStart))s.style.arrowStart='none';if(!ArrowById(this,s.style.arrowEnd))s.style.arrowEnd='none';this.Render();this.Apply();this.EmitPresets();return this;
        }
        public Refresh():this {this.Apply();return this;}
        private EmitPresets():void {this.dispatchEvent(new CustomEvent('arianna:stroke-presets-change',{bubbles:true,composed:true,detail:this.ExportPresets()}));}

        public get stroke():Interfaces.StrokeStyle{return structuredClone(S(this).style);}
        public set stroke(value:Partial<Interfaces.StrokeStyle>){this.setStroke(value);}
        public getStroke():Interfaces.StrokeStyle{return this.stroke;}
        public setStroke(value:Partial<Interfaces.StrokeStyle>):this
        {
            if(value.profile&&!ProfileById(this,value.profile))throw new Error('Unknown width profile '+value.profile);
            for(const id of [value.arrowStart,value.arrowEnd])if(id&&!ArrowById(this,id))throw new Error('Unknown arrowhead '+id);
            const state=S(this);state.style={...state.style,...value,dash:Array.isArray(value.dash)?value.dash.map(v=>Math.max(0,Number(v)||0)):state.style.dash};
            this.Normalize();this.Render();this.Apply();this.Emit();return this;
        }
        /** Bind without importing the drawing component. LineEditor.stroke and SVG elements are both supported. */
        public bind(target:Interfaces.StrokeTarget):this{
            this.unbind();const state=S(this);state.target=target;state.savedStyle=target.getAttribute('style');state.savedStroke='stroke'in target?structuredClone(target.stroke):undefined;this.Render();this.Apply();
            if(typeof MutationObserver!=='undefined'&&target instanceof SVGElement){state.observer=new MutationObserver(()=>{if(state.frame===null)state.frame=requestAnimationFrame(()=>{state.frame=null;if(state.target===target)this.Apply();});});state.observer.observe(target,{attributes:true,attributeFilter:['d','points','transform','x','y','x1','x2','y1','y2','cx','cy','r','rx','ry','width','height']});}return this;
        }
        public unbind():this{
            const state=S(this);state.observer?.disconnect();state.observer=null;if(state.frame!==null)cancelAnimationFrame(state.frame);state.frame=null;this.ClosePresetMenu();this.ClearEffects();
            if(state.target){if('stroke'in state.target)state.target.stroke=state.savedStroke as Interfaces.StrokeTarget['stroke'];state.savedStyle===null?state.target.removeAttribute('style'):state.target.setAttribute('style',state.savedStyle);}
            state.target=null;state.savedStyle=null;return this;
        }
        public onUnmount():void{this.ReleaseMotion();this.unbind();}
        public onDisconnected():void{this.onUnmount();S(this).connected=false;}
        private ClearEffects():void{for(const node of S(this).effects.splice(0))node.remove();}
        private Normalize():void{
            const s=S(this).style;s.width=NumberValue(s.width,3,.01,1000);s.miterLimit=NumberValue(s.miterLimit,10,1,1000);
            if(!ProfileById(this,s.profile))s.profile='uniform';if(!ArrowById(this,s.arrowStart))s.arrowStart='none';if(!ArrowById(this,s.arrowEnd))s.arrowEnd='none';
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
            if(!changed||changed==='arrow-start')s.arrowStart=one('arrow-start',this.Arrowheads.map(a=>a.id),s.arrowStart);
            if(!changed||changed==='arrow-end')s.arrowEnd=one('arrow-end',this.Arrowheads.map(a=>a.id),s.arrowEnd);
            if(!changed||changed==='arrow-scale-start')s.arrowScaleStart=NumberValue(this.getAttribute('arrow-scale-start'),s.arrowScaleStart,1,1000);
            if(!changed||changed==='arrow-scale-end')s.arrowScaleEnd=NumberValue(this.getAttribute('arrow-scale-end'),s.arrowScaleEnd,1,1000);
            if(!changed||changed==='profile')s.profile=one('profile',this.Profiles.map(p=>p.id),s.profile);
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
                target.stroke={...current,...s,width:PixelWidth(s),lineCap:s.cap,lineJoin:s.join,dashArray:[...s.dash],dashOffset:s.dashOffset,miterLimit:s.miterLimit,...{profileDefinition:structuredClone(ProfileById(this,s.profile)),arrowStartDefinition:structuredClone(ArrowById(this,s.arrowStart)),arrowEndDefinition:structuredClone(ArrowById(this,s.arrowEnd))}};
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
                const definition=ProfileById(this,s.profile)!;
                const sides=(t:number)=>{const sample=SampleProfile(definition,s.flipAlong?1-t:t),scale=PixelWidth(s)*(closed&&s.align!=='center'?2:1);return s.flipAcross?{left:sample.right*scale,right:sample.left*scale}:{left:sample.left*scale,right:sample.right*scale};};
                const profile=(t:number)=>{const width=sides(t);return width.left+width.right;};
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
                    if(to<=from)continue;const count=Math.max(2,Math.min(2048,Math.floor(8192/Math.max(1,periods.length))-1,Math.ceil((to-from)/2))),left:string[]=[],right:string[]=[];
                    for(let i=0;i<=count;i++){
                        const distance=from+(to-from)*i/count,point=target.getPointAtLength(distance);
                        const prev=target.getPointAtLength(Math.max(0,distance-.2)),next=target.getPointAtLength(Math.min(length,distance+.2));
                        const dx=next.x-prev.x,dy=next.y-prev.y,norm=Math.hypot(dx,dy)||1,nx=-dy/norm,ny=dx/norm,width=sides(distance/length);
                        left.push((point.x+nx*width.left)+','+(point.y+ny*width.left));
                        right.push((point.x-nx*width.right)+','+(point.y-ny*width.right));
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
                const definition=ArrowById(this,kind)!;
                const id=uid+'-'+side,extent=Math.max(.01,PixelWidth(s))*3*scale/100,anchor=s.arrowAlign==='tip'?definition.tip:definition.base;
                const node=make('marker',{id,viewBox:definition.viewBox.join(' '),markerUnits:'userSpaceOnUse',markerWidth:extent*definition.viewBox[2]/definition.viewBox[3],markerHeight:extent,refX:anchor[0],refY:anchor[1],orient:'auto-start-reverse',overflow:'visible'});
                this.MarkerShapes(node,definition,s.color);defs.append(node);return 'url(#'+id+')';
            };
            element.style.markerStart=marker('start',s.arrowStart,s.arrowScaleStart);element.style.markerEnd=marker('end',s.arrowEnd,s.arrowScaleEnd);
        }

        private MarkerShapes(parent:SVGElement,definition:Interfaces.ArrowheadDefinition,color:string):void
        {
            for(const shape of definition.shapes){
                const node=this.ownerDocument.createElementNS('http://www.w3.org/2000/svg',shape.tag);
                for(const [key,value] of Object.entries(shape.attributes))node.setAttribute(key,String(value));
                node.setAttribute('fill',shape.fill==='none'?'none':color);
                node.setAttribute('stroke',shape.stroke==='stroke'?color:'none');
                node.setAttribute('stroke-width',String(shape.strokeWidth??1));parent.append(node);
            }
        }

        private Preview(kind:'profile'|'arrowStart'|'arrowEnd',id:string):SVGSVGElement
        {
            const doc=this.ownerDocument,svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');
            svg.setAttribute('viewBox','0 0 120 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
            const path=doc.createElementNS(svg.namespaceURI!,'path');path.setAttribute('fill','currentColor');
            if(kind==='profile'){
                const definition=ProfileById(this,id)!;
                const left:string[]=[],right:string[]=[];
                for(let i=0;i<=64;i++){const t=i/64,w=SampleProfile(definition,t),x=10+t*100;left.push(x+','+(12-w.left*18));right.push(x+','+(12+w.right*18));}
                path.setAttribute('d','M'+left.join('L')+'L'+right.reverse().join('L')+'Z');svg.append(path);
            }else {
                path.setAttribute('d','M10 12H110');path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.8');svg.append(path);
                if(id!=='none'){
                    const definition=ArrowById(this,id)!,group=doc.createElementNS('http://www.w3.org/2000/svg','g'),scale=18/definition.viewBox[3];
                    group.setAttribute('transform',`translate(${kind==='arrowStart'?10:110} 12) rotate(${kind==='arrowStart'?180:0}) scale(${scale}) translate(${-definition.tip[0]} ${-definition.tip[1]})`);
                    this.MarkerShapes(group,definition,'currentColor');svg.append(group);
                }
            }
            return svg;
        }

        private ClosePresetMenu():void
        {
            const state=S(this);state.popupAbort?.abort();state.popupAbort=null;state.popup?.remove();state.popup=null;
            for(const button of Array.from(this.querySelectorAll('.Strokes-PresetButton')))button.setAttribute('aria-expanded','false');
        }

        private PresetPicker(kind:'profile'|'arrowStart'|'arrowEnd'):HTMLButtonElement
        {
            const doc=this.ownerDocument,state=S(this),id=state.style[kind],button=doc.createElement('button');
            button.type='button';button.className='Strokes-PresetButton';button.dataset.control=kind;button.dataset.value=id;
            const definition=kind==='profile'?ProfileById(this,id)!:ArrowById(this,id)!;
            button.title=definition.label;button.setAttribute('aria-label',(kind==='profile'?'Width profile: ':kind==='arrowStart'?'Start arrowhead: ':'End arrowhead: ')+definition.label);
            button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');button.append(this.Preview(kind,id));
            const chevron=doc.createElement('span');chevron.textContent='▾';button.append(chevron);
            const open=()=>{
                if(button.getAttribute('aria-expanded')==='true'){this.ClosePresetMenu();return;}
                this.ClosePresetMenu();const menu=doc.createElement('div'),controller=new AbortController();state.popup=menu;state.popupAbort=controller;
                menu.className='Strokes-PresetMenu';menu.setAttribute('theme',this.getAttribute('theme')??'dark');menu.setAttribute('role','listbox');menu.setAttribute('aria-label',button.getAttribute('aria-label')!);
                const entries=kind==='profile'?this.Profiles:this.Arrowheads,options:HTMLButtonElement[]=[];
                for(const entry of entries){
                    const option=doc.createElement('button');option.type='button';option.className='Strokes-PresetOption';option.setAttribute('role','option');option.setAttribute('aria-selected',String(entry.id===id));option.dataset.preset=entry.id;
                    const label=doc.createElement('span');label.textContent=entry.label;option.append(this.Preview(kind,entry.id),label);
                    option.onclick=()=>{this.setStroke({[kind]:entry.id});this.querySelector<HTMLButtonElement>(`[data-control="${kind}"]`)?.focus();};menu.append(option);options.push(option);
                }
                doc.body.append(menu);button.setAttribute('aria-expanded','true');
                const rect=button.getBoundingClientRect(),view=doc.defaultView,width=Math.min(310,Math.max(120,(view?.innerWidth??800)-16));menu.style.width=width+'px';
                const height=Math.min(360,Math.max(80,(view?.innerHeight??600)-16));menu.style.maxHeight=height+'px';
                menu.style.left=Math.max(8,Math.min(rect.left,(view?.innerWidth??800)-width-8))+'px';
                menu.style.top=Math.max(8,Math.min(rect.bottom+4,(view?.innerHeight??600)-Math.min(height,entries.length*38+10)-8))+'px';
                const selected=options.find(option=>option.dataset.preset===id)??options[0];selected?.focus();selected?.scrollIntoView({block:'nearest'});
                const signal=controller.signal;
                doc.addEventListener('pointerdown',event=>{if(!menu.contains(event.target as Node)&&!button.contains(event.target as Node))this.ClosePresetMenu();},{capture:true,signal});
                view?.addEventListener('resize',()=>this.ClosePresetMenu(),{signal});
                doc.addEventListener('scroll',event=>{if(!menu.contains(event.target as Node))this.ClosePresetMenu();},{capture:true,signal});
                menu.addEventListener('keydown',event=>{
                    if(event.key==='Escape'){event.preventDefault();this.ClosePresetMenu();button.focus();return;}
                    const index=options.indexOf(doc.activeElement as HTMLButtonElement),next=event.key==='ArrowDown'?Math.min(options.length-1,index+1):event.key==='ArrowUp'?Math.max(0,index-1):event.key==='Home'?0:event.key==='End'?options.length-1:-1;
                    if(next>=0){event.preventDefault();options[next].focus();options[next].scrollIntoView({block:'nearest'});}
                    if(event.key==='Tab')this.ClosePresetMenu();
                },{signal});
            };
            button.onclick=open;button.onkeydown=event=>{if(event.key==='ArrowDown'){event.preventDefault();open();}};return button;
        }

        private Emit():void
        {
            const detail={...this.stroke,pixelWidth:PixelWidth(S(this).style),source:this};
            this.dispatchEvent(new CustomEvent('arianna:stroke-change',{bubbles:true,composed:true,detail}));
            this.dispatchEvent(new CustomEvent('arianna:change',{bubbles:true,composed:true,detail}));
        }

        private Render():void
        {
            this.ClosePresetMenu();if(!this.isConnected)return;this.ReleaseMotion();
            this.style.setProperty('--strokes-icon-cut',this.getAttribute('theme')==='light'?'#eef0f2':'#292d31');
            const s=S(this).style,doc=this.ownerDocument,root=doc.createElement('section');root.style.cssText='position:relative;display:flex;flex-direction:column;height:100%;min-height:0';
            const chrome=doc.createElement('div');chrome.className='Strokes-Chrome';
            const minimize=doc.createElement('button');minimize.type='button';minimize.className='Strokes-WindowButton';minimize.textContent='−';minimize.title='Collapse / expand panel';minimize.setAttribute('aria-label',minimize.title);minimize.onclick=()=>this.toggleAttribute('minimized');chrome.append(minimize);const close=doc.createElement('button');close.type='button';close.className='Strokes-WindowButton';close.textContent='×';close.title='Close panel';close.setAttribute('aria-label','Close panel');close.onclick=()=>{this.style.display='none';};chrome.append(close);
            close.addEventListener('click',()=>this.ClosePresetMenu());
            const header=doc.createElement('header');header.className='Strokes-Header';
            const title=doc.createElement('span');title.textContent='Strokes';header.append(title);
            const menuButton=doc.createElement('button');menuButton.type='button';menuButton.textContent='☰';menuButton.className='Strokes-WindowButton';menuButton.title='Panel options';menuButton.setAttribute('aria-label','Panel options');menuButton.style.marginLeft='auto';menuButton.onclick=()=>{const old=root.querySelector('.Strokes-PanelMenu');if(old){old.remove();return;}const list=doc.createElement('div');list.className='Strokes-PanelMenu';for(const [text,action] of [['Reset stroke',()=>this.setStroke(structuredClone(DEFAULT))],['Dark',()=>this.setAttribute('theme','dark')],['Light',()=>this.setAttribute('theme','light')]] as const){const item=doc.createElement('button');item.type='button';item.textContent=text;item.onclick=()=>{list.remove();action();};list.append(item);}root.append(list);};chrome.style.cssText='display:flex;align-items:center;gap:3px;margin-left:auto;background:none;border:0;height:24px';chrome.prepend(menuButton);header.append(chrome);
            const body=doc.createElement('div');body.className='Strokes-Body';body.style.cssText='flex:1 1 auto;min-height:0;overflow:auto';
            const row=(label:string,control:HTMLElement)=>{const node=doc.createElement('div');node.className='Strokes-Row';const caption=doc.createElement('span');caption.className='Strokes-Label';caption.textContent=label;node.append(caption,control);body.append(node);return node;};
            const divider=()=>{const node=doc.createElement('div');node.className='Strokes-Divider';body.append(node);};
            const update=(value:Partial<Interfaces.StrokeStyle>)=>this.setStroke(value);
            const number=(key:string,label:string,value:number,min:number,step:number,change:(n:number)=>void,max=1000)=>{
                const input=doc.createElement('input');input.type='number';input.className='Strokes-Number';input.dataset.control=key;input.setAttribute('aria-label',label);input.title=label;input.value=String(value);input.min=String(min);input.max=String(max);input.step=String(step);input.onchange=()=>change(NumberValue(input.value,value,min,max));return input;
            };
            const paths:Record<string,string>={
                butt:'M10 5H21V19H10Z',round:'M10 5H21V19H10A7 7 0 0 1 10 5Z',square:'M3 5H21V19H3Z',
                miter:'M4 21V4H21V10H10V21Z',roundjoin:'M4 21V10A6 6 0 0 1 10 4H21V10H10V21Z',bevel:'M4 21V10L10 4H21V10H10V21Z',
                center:'M5 20V5H20M8 20V8H20M3 20V3H20',inside:'M5 20V5H20M8 20V8H20M11 20V11H20',outside:'M9 20V9H20M6 20V6H20M3 20V3H20',
                exact:'M3 5H8M12 5H17M21 5H23M3 19H8M12 19H17M21 19H23M3 5V9M3 13V19',corners:'M3 10V5H8M12 5H17M21 5H23V10M3 14V19H8M12 19H17M21 19H23V14',
                tip:'M3 12H20M15 7L20 12L15 17M20 3V21',extend:'M3 12H23M18 7L23 12L18 17M17 3V21',
                along:'M3 7H21M3 7L7 3M3 7L7 11M21 17H3M21 17L17 13M21 17L17 21',across:'M7 3V21M7 3L3 7M7 3L11 7M17 21V3M17 21L13 17M17 21L21 17',
                swap:'M3 7H21L16 3M21 17H3L8 21',link:'M10 8L14 4Q20 1 22 7L17 12M14 16L10 20Q4 23 2 17L7 12M8 16L16 8'
            };
            const button=(key:string,label:string,icon:string,active:boolean,action:()=>void)=>{
                const node=doc.createElement('button');node.type='button';node.className='Strokes-Button';node.dataset.control=key;node.dataset.active=String(active);node.title=label;node.setAttribute('aria-label',label);node.setAttribute('aria-pressed',String(active));
                const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
                const silhouette=['butt','round','square','miter','roundjoin','bevel'].includes(icon);
                const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',paths[icon]??paths.center);path.setAttribute('fill',silhouette?'currentColor':'none');path.setAttribute('stroke',silhouette?'none':'currentColor');path.setAttribute('stroke-width','2');svg.append(path);
                if(['butt','round','square'].includes(icon)){
                    path.setAttribute('fill','currentColor');path.setAttribute('stroke','none');const center=doc.createElementNS('http://www.w3.org/2000/svg','path');center.setAttribute('d','M10 12H24');center.setAttribute('stroke','var(--strokes-icon-cut,#292d31)');center.setAttribute('stroke-width','1.5');center.setAttribute('fill','none');svg.append(center);
                    const guides=doc.createElementNS('http://www.w3.org/2000/svg','path');guides.setAttribute('d','M10 2V22');guides.setAttribute('fill','none');guides.setAttribute('stroke','currentColor');guides.setAttribute('stroke-width','1');guides.setAttribute('stroke-dasharray','none');guides.setAttribute('opacity','.8');svg.append(guides);const endpoint=doc.createElementNS('http://www.w3.org/2000/svg','rect');endpoint.setAttribute('x','8.5');endpoint.setAttribute('y','10.5');endpoint.setAttribute('width','3');endpoint.setAttribute('height','3');endpoint.setAttribute('fill','var(--strokes-icon-cut,#292d31)');svg.append(endpoint);
                }
                node.append(svg);node.onclick=action;return node;
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
            const arrows=doc.createElement('div');arrows.className='Strokes-Arrows';arrows.append(this.PresetPicker('arrowStart'),this.PresetPicker('arrowEnd'),button('swap','Swap arrowheads and scales','swap',false,()=>update({arrowStart:s.arrowEnd,arrowEnd:s.arrowStart,arrowScaleStart:s.arrowScaleEnd,arrowScaleEnd:s.arrowScaleStart})));row('Arrowheads:',arrows);
            const scales=doc.createElement('div');scales.className='Strokes-Scale';
            const start=number('arrowScaleStart','Start scale (%)',s.arrowScaleStart,1,1,n=>update({arrowScaleStart:n,...(s.linkScales?{arrowScaleEnd:n}:{})}));
            const end=number('arrowScaleEnd','End scale (%)',s.arrowScaleEnd,1,1,n=>update({arrowScaleEnd:n,...(s.linkScales?{arrowScaleStart:n}:{})}));
            start.value=s.arrowScaleStart+'%';end.value=s.arrowScaleEnd+'%';start.onchange=()=>{const n=NumberValue(parseFloat(start.value),s.arrowScaleStart,1,1000);update({arrowScaleStart:n,...(s.linkScales?{arrowScaleEnd:n}:{})});};end.onchange=()=>{const n=NumberValue(parseFloat(end.value),s.arrowScaleEnd,1,1000);update({arrowScaleEnd:n,...(s.linkScales?{arrowScaleStart:n}:{})});};start.type='text';end.type='text';start.disabled=s.arrowStart==='none';end.disabled=s.arrowEnd==='none';scales.append(start,end,button('linkScales','Link arrowhead scales','link',s.linkScales,()=>update({linkScales:!s.linkScales,...(!s.linkScales?{arrowScaleEnd:s.arrowScaleStart}:{})})));row('Scale:',scales);
            const arrowAlign=buttons('arrowAlign',s.arrowAlign,[['tip','Align arrow tip to endpoint','tip'],['extend','Extend arrow beyond endpoint','extend']],arrowAlign=>update({arrowAlign}));for(const node of Array.from(arrowAlign.children))(node as HTMLButtonElement).disabled=s.arrowStart==='none'&&s.arrowEnd==='none';row('Align:',arrowAlign);divider();
            const profile=doc.createElement('div');profile.className='Strokes-Profile';profile.append(this.PresetPicker('profile'),button('flipAlong','Flip along path','along',s.flipAlong,()=>update({flipAlong:!s.flipAlong})),button('flipAcross','Flip across path','across',s.flipAcross,()=>update({flipAcross:!s.flipAcross})));for(const node of Array.from(profile.querySelectorAll('button[data-control^="flip"]')))(node as HTMLButtonElement).disabled=s.profile==='uniform';row('Profile:',profile);
            root.append(header,body);this.replaceChildren(root);this.InstallMotion(header);
        }

        private ReleaseMotion():void {const motion=Motion.get(this);if(!motion)return;Motion.delete(this);motion.controller.abort();motion.mover.destroy();motion.resizer.destroy();this.EndPanelResize();}
        private EndPanelResize():void {const state=S(this);if(!state.resizing)return;const width=state.resizeWidth;if(width===null||width===undefined)this.removeAttribute('width');else if(this.getAttribute('width')!==width)this.setAttribute('width',width);state.resizing=false;state.resizeWidth=undefined;}
        private InstallMotion(header:HTMLElement):void {
            header.style.cursor='grab';header.style.touchAction='none';header.style.userSelect='none';
            for(const button of header.querySelectorAll('button,input,select'))button.addEventListener('pointerdown',event=>event.stopPropagation());
            const controller=new AbortController();this.addEventListener('arianna:resize-start',event=>{if(event.target!==this)return;const state=S(this);state.resizeWidth=this.getAttribute('width');state.resizing=true;},{signal:controller.signal});this.addEventListener('arianna:resize-end',event=>{if(event.target===this)this.EndPanelResize();},{signal:controller.signal});
            const mover=new Mover();mover.handleSelector='.Strokes-Header';mover.bounds='none';mover.attach(this);
            const resizer=new Resizer(undefined,{minWidth:365,minHeight:80,allowCross:false,handleColor:'transparent'});resizer.attach(this);
            for(const handle of this.querySelectorAll<HTMLElement>('.Resizer-Handle')){handle.style.opacity='0';handle.style.zIndex='1000';}
            if(this.hasAttribute('minimized'))resizer.disable();Motion.set(this,{mover,resizer,controller});
        }

    }
}

export type LineTool=Strokes.Interfaces.LineTool;
export type StrokeStyle=Strokes.Interfaces.StrokeStyle;
export type StrokesOptions=Strokes.Interfaces.StrokesOptions;
export type WidthProfile=Strokes.Interfaces.WidthProfile;
export type WidthPoint=Strokes.Interfaces.WidthPoint;
export type ArrowheadDefinition=Strokes.Interfaces.ArrowheadDefinition;
export type MarkerShape=Strokes.Interfaces.MarkerShape;
export type PresetLibrary=Strokes.Interfaces.PresetLibrary;
export default Strokes.Strokes;
