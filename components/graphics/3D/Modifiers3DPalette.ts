/**
 * @module components/graphics/3D/Modifiers3DPalette
 * @author Riccardo Angeli
 * @version 2.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 *
 * @description Stack controller for the concrete modifiers in graphics/3D/modifiers.
 * The palette owns stack state only; each modifier remains an independent floating
 * component/window and applies itself to Canvas3D via viewport="..." + for="<mesh-id>".
 */
import { Component, Css, Templates } from '../../../core/index.ts';
const html=Templates.Template.Html;

export namespace Modifiers3DPalette
{
    export namespace Types
    {
        export type ModifierKind='array'|'bend'|'bevel'|'billboard'|'decimate'|'drag'|'fade'|'inflate'|'lod'|'mirror'|'smooth'|'snap'|'subdivision'|'twist'|'wave';
    }
    export namespace Interfaces
    {
        export interface ModifierEntry{id:string;kind:Types.ModifierKind;enabled:boolean;params:Record<string,number|string|boolean>;}
        export interface Modifiers3DPaletteOptions{stack?:ModifierEntry[];theme?:'dark'|'light';}
    }

    export const ModifierTags:Readonly<Record<Types.ModifierKind,string>>=Object.freeze({
        array:'arianna-array',bend:'arianna-bend',bevel:'arianna-bevel',billboard:'arianna-billboard',decimate:'arianna-decimate',drag:'arianna-drag',fade:'arianna-fade',inflate:'arianna-inflate',lod:'arianna-lod',mirror:'arianna-mirror',smooth:'arianna-smooth',snap:'arianna-snap',subdivision:'arianna-subdivision',twist:'arianna-twist',wave:'arianna-wave'
    });

    const DEFAULT_PARAMS:Readonly<Record<Types.ModifierKind,Record<string,number|string|boolean>>>=Object.freeze({
        array:{count:5,type:'linear','offset-x':1.25,'offset-y':0,'offset-z':0,radius:2.4,axis:'y'},
        bend:{angle:1.35,axis:'y'},
        bevel:{amount:.12,segments:2},
        billboard:{'lock-x':false,'lock-y':false,'lock-z':false},
        decimate:{ratio:.45},
        drag:{plane:'xz'},
        fade:{near:3.5,far:8},
        inflate:{amount:.18},
        lod:{near:4.5,mid:7,far:11},
        mirror:{axis:'x',merge:true,threshold:.001},
        smooth:{iterations:2,factor:.4},
        snap:{'pos-grid':.5,'rot-grid-deg':15},
        subdivision:{iterations:1},
        twist:{angle:2.4,axis:'y'},
        wave:{amplitude:.25,frequency:4,axis:'y',direction:'x',animate:true},
    });


    const NUMERIC_RANGES:Readonly<Record<string,{min:number;max:number;step:number}>>=Object.freeze({
        'array.count':{min:1,max:20,step:1},'array.offset-x':{min:-5,max:5,step:.05},'array.offset-y':{min:-5,max:5,step:.05},'array.offset-z':{min:-5,max:5,step:.05},'array.radius':{min:0,max:10,step:.05},
        'bend.angle':{min:-6.28,max:6.28,step:.01},'bevel.amount':{min:0,max:1,step:.01},'bevel.segments':{min:1,max:8,step:1},'decimate.ratio':{min:.05,max:1,step:.01},
        'fade.near':{min:0,max:20,step:.1},'fade.far':{min:0,max:40,step:.1},'inflate.amount':{min:-1,max:1,step:.01},'lod.near':{min:0,max:30,step:.1},'lod.mid':{min:0,max:30,step:.1},'lod.far':{min:0,max:30,step:.1},
        'mirror.threshold':{min:0,max:.1,step:.0001},'smooth.iterations':{min:1,max:10,step:1},'smooth.factor':{min:0,max:1,step:.01},'snap.pos-grid':{min:.01,max:5,step:.01},'snap.rot-grid-deg':{min:1,max:90,step:1},
        'subdivision.iterations':{min:0,max:4,step:1},'twist.angle':{min:-6.28,max:6.28,step:.01},'wave.amplitude':{min:0,max:2,step:.01},'wave.frequency':{min:.1,max:20,step:.05},
    });
    const NumericRange=(kind:Types.ModifierKind,key:string,value:number):{min:number;max:number;step:number}=>NUMERIC_RANGES[`${kind}.${key}`]??{min:value<0?-100:0,max:Math.max(100,Math.abs(value)*2),step:Number.isInteger(value)?1:.01};

    const DEFAULT:Interfaces.ModifierEntry[]=[];
    interface State{stack:Interfaces.ModifierEntry[];activeId:string|null;}
    const States=new WeakMap<HTMLElement,State>();
    const S=(e:HTMLElement):State=>{let s=States.get(e);if(!s){s={stack:structuredClone(DEFAULT),activeId:null};States.set(e,s);}return s;};

    export const Styles=new Css.Stylesheet([
        new Css.Rule('arianna-modifiers-3d-palette,.Modifiers3DPalette',{Background:'#292d31',Border:'1px solid #111417',BorderRadius:'7px',BoxSizing:'border-box',Color:'#e4e8eb',Display:'block',FontFamily:'var(--arianna-font,system-ui,sans-serif)',Overflow:'hidden',Width:'320px'}),
        new Css.Rule('.Modifiers3DPalette-Header',{AlignItems:'center',Background:'linear-gradient(180deg,#3a3f44,#2b3034)',BorderBottom:'1px solid #111417',Display:'flex',FontSize:'11px',FontWeight:'800',JustifyContent:'space-between',Padding:'8px 10px'}),
        new Css.Rule('.Modifiers3DPalette-List',{Display:'grid',Gap:'5px',MaxHeight:'390px',Overflow:'auto',Padding:'8px'}),
        new Css.Rule('.Modifiers3DPalette-Item',{Background:'#202428',Border:'1px solid #141719',BorderRadius:'4px',Display:'grid',Gap:'6px',Padding:'7px'}),
        new Css.Rule('.Modifiers3DPalette-Item[data-active="true"]',{BorderColor:'#e40c88'}),
        new Css.Rule('.Modifiers3DPalette-Top',{AlignItems:'center',Display:'grid',Gap:'5px',GridTemplateColumns:'18px minmax(0,1fr) auto'}),
        new Css.Rule('.Modifiers3DPalette-Name',{Cursor:'pointer',FontSize:'9px',FontWeight:'750',TextTransform:'capitalize'}),
        new Css.Rule('.Modifiers3DPalette-Button',{Appearance:'none',Background:'linear-gradient(180deg,#40464b,#2d3236)',Border:'1px solid #15181a',BorderRadius:'3px',Color:'#cbd1d5',Cursor:'pointer',Font:'700 9px/1 system-ui',Height:'24px',MinWidth:'26px'}),
        new Css.Rule('.Modifiers3DPalette-Params',{Display:'grid',Gap:'5px',GridTemplateColumns:'82px 1fr',AlignItems:'start'}),
        new Css.Rule('.Modifiers3DPalette-Label',{Color:'#8e979f',FontSize:'8px',PaddingTop:'6px'}),
        new Css.Rule('.Modifiers3DPalette-ControlStack',{Display:'grid',Gap:'4px',MinWidth:'0'}),
        new Css.Rule('.Modifiers3DPalette-Input',{Background:'#171b1e',Border:'1px solid #3b4146',BorderRadius:'3px',Color:'#e4e8eb',Font:'9px system-ui',Padding:'5px',MinWidth:'0'}),
        new Css.Rule('.Modifiers3DPalette-Range',{Appearance:'none',Background:'transparent',Height:'12px',Margin:'0',Padding:'0',Width:'100%',AccentColor:'#e40c88'}),
        new Css.Rule('.Modifiers3DPalette-Range::-webkit-slider-runnable-track',{Background:'#111417',Border:'1px solid #3a4045',BorderRadius:'999px',Height:'4px'}),
        new Css.Rule('.Modifiers3DPalette-Range::-webkit-slider-thumb',{Appearance:'none',Background:'#fff',Border:'1px solid rgba(0,0,0,.35)',BorderRadius:'50%',Height:'10px',MarginTop:'-4px',Width:'10px'}),
        new Css.Rule('.Modifiers3DPalette-Footer',{BorderTop:'1px solid #111417',Display:'grid',Gap:'5px',GridTemplateColumns:'1fr auto',Padding:'8px'}),
        new Css.Rule('arianna-modifiers-3d-palette[theme="light"],.Modifiers3DPalette[theme="light"]',{Background:'#eef0f2',BorderColor:'#b9bec3',Color:'#25292d'}),
        new Css.Rule('arianna-modifiers-3d-palette[theme="light"] .Modifiers3DPalette-Header',{Background:'linear-gradient(180deg,#fff,#e1e4e7)',BorderBottomColor:'#b9bec3'}),
        new Css.Rule('arianna-modifiers-3d-palette[theme="light"] .Modifiers3DPalette-Item',{Background:'#fff',BorderColor:'#c4c9ce'}),
        new Css.Rule('arianna-modifiers-3d-palette[theme="light"] .Modifiers3DPalette-Input',{Background:'#fff',BorderColor:'#c1c6cb',Color:'#30363b'}),
    ]);

    @Component('arianna-modifiers-3d-palette',Styles,{Shadow:false,Attributes:['theme','active-id'],Properties:['stack']})
    export class Modifiers3DPalette extends HTMLElement
    {
        public static readonly Styles=Styles;public template=html``;
        public onCreated():void{if(this.isConnected)this.onConnected();}
        public onConnected():void{this.classList.add('Modifiers3DPalette');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');this.Render();}
        public onAttributeChanged(name?:string):void{if(name==='active-id')S(this).activeId=this.getAttribute('active-id');if(this.isConnected)this.Render();}
        public get stack():Interfaces.ModifierEntry[]{return structuredClone(S(this).stack);}
        public set stack(v:Interfaces.ModifierEntry[]){S(this).stack=Array.isArray(v)?structuredClone(v):[];this.Render();}
        public addModifier(kind:Types.ModifierKind):Interfaces.ModifierEntry
        {
            const id=`${kind}-${Date.now()}`;const x:Interfaces.ModifierEntry={id,kind,enabled:true,params:structuredClone(DEFAULT_PARAMS[kind])};S(this).stack.push(x);S(this).activeId=id;this.setAttribute('active-id',id);this.Render();this.Fire('add',id);return structuredClone(x);
        }
        public removeModifier(id:string):this{S(this).stack=S(this).stack.filter(x=>x.id!==id);if(S(this).activeId===id)S(this).activeId=null;this.Render();this.Fire('remove',id);return this;}
        public toggleEnable(id:string):this{const x=S(this).stack.find(x=>x.id===id);if(x){x.enabled=!x.enabled;this.Render();this.Fire('enable',id);}return this;}
        public moveModifier(id:string,dir:-1|1):this{const a=S(this).stack,i=a.findIndex(x=>x.id===id),j=i+dir;if(i>=0&&j>=0&&j<a.length){[a[i],a[j]]=[a[j],a[i]];this.Render();this.Fire('move',id);}return this;}
        public updateParam(id:string,key:string,value:number|string|boolean):this{const x=S(this).stack.find(x=>x.id===id);if(x){x.params[key]=value;this.Fire('param',id);}return this;}
        public setStack(v:Interfaces.ModifierEntry[]):this{this.stack=v;this.Fire('stack','');return this;}
        public getStack():Interfaces.ModifierEntry[]{return this.stack;}
        public selectModifier(id:string):this{if(!S(this).stack.some(x=>x.id===id))return this;S(this).activeId=id;if(this.getAttribute('active-id')!==id)this.setAttribute('active-id',id);this.Render();this.Fire('select',id);return this;}
        public getActiveId():string|null{return S(this).activeId;}
        public static tagFor(kind:Types.ModifierKind):string{return ModifierTags[kind];}
        private Fire(kind:string,id:string):void{this.dispatchEvent(new CustomEvent('arianna:modifiers-change',{bubbles:true,composed:true,detail:{kind,id,activeId:S(this).activeId,stack:this.getStack(),source:this}}));}
        private Render():void
        {
            const root=document.createElement('section'),head=document.createElement('header');head.className='Modifiers3DPalette-Header';head.innerHTML='<span>Modifiers</span><span>≡</span>';
            const list=document.createElement('div');list.className='Modifiers3DPalette-List';
            S(this).stack.forEach(x=>{
                const item=document.createElement('div');item.className='Modifiers3DPalette-Item';item.dataset.active=String(S(this).activeId===x.id);item.style.opacity=x.enabled?'1':'.55';
                const top=document.createElement('div');top.className='Modifiers3DPalette-Top';
                const check=document.createElement('input');check.type='checkbox';check.checked=x.enabled;check.onchange=()=>this.toggleEnable(x.id);
                const name=document.createElement('span');name.className='Modifiers3DPalette-Name';name.textContent=x.kind;name.onclick=()=>this.selectModifier(x.id);
                const actions=document.createElement('span');for(const [t,fn] of [['↑',()=>this.moveModifier(x.id,-1)],['↓',()=>this.moveModifier(x.id,1)],['×',()=>this.removeModifier(x.id)]] as [string,()=>void][]){const b=document.createElement('button');b.className='Modifiers3DPalette-Button';b.textContent=t;b.onclick=fn;actions.appendChild(b);}top.append(check,name,actions);
                const params=document.createElement('div');params.className='Modifiers3DPalette-Params';Object.entries(x.params).forEach(([k,v])=>{
                    const l=document.createElement('span');l.className='Modifiers3DPalette-Label';l.textContent=k;
                    const stack=document.createElement('span');stack.className='Modifiers3DPalette-ControlStack';
                    const inp=document.createElement('input');inp.className='Modifiers3DPalette-Input';
                    if(typeof v==='boolean'){
                        inp.type='checkbox';inp.checked=v;inp.onchange=()=>this.updateParam(x.id,k,inp.checked);stack.appendChild(inp);
                    }else if(typeof v==='number'){
                        const range=NumericRange(x.kind,k,v);inp.type='number';inp.value=String(v);inp.min=String(range.min);inp.max=String(range.max);inp.step=String(range.step);
                        const slider=document.createElement('input');slider.type='range';slider.className='Modifiers3DPalette-Range';slider.min=String(range.min);slider.max=String(range.max);slider.step=String(range.step);slider.value=String(v);
                        const commit=(raw:string)=>{const n=Number(raw);if(!Number.isFinite(n))return;inp.value=String(n);slider.value=String(n);this.updateParam(x.id,k,n);};
                        inp.oninput=()=>commit(inp.value);slider.oninput=()=>commit(slider.value);stack.append(inp,slider);
                    }else{
                        inp.value=String(v);inp.onchange=()=>this.updateParam(x.id,k,inp.value);stack.appendChild(inp);
                    }
                    params.append(l,stack);
                });
                item.append(top,params);list.appendChild(item);
            });
            const foot=document.createElement('footer');foot.className='Modifiers3DPalette-Footer';const select=document.createElement('select');select.className='Modifiers3DPalette-Input';(Object.keys(ModifierTags) as Types.ModifierKind[]).forEach(k=>{const o=document.createElement('option');o.value=k;o.textContent=k;select.appendChild(o);});const add=document.createElement('button');add.className='Modifiers3DPalette-Button';add.textContent='+ Add';add.onclick=()=>this.addModifier(select.value as Types.ModifierKind);foot.append(select,add);root.append(head,list,foot);this.replaceChildren(root);
        }
    }
}
export type ModifierKind=Modifiers3DPalette.Types.ModifierKind;
export type ModifierEntry=Modifiers3DPalette.Interfaces.ModifierEntry;
export type Modifiers3DPaletteOptions=Modifiers3DPalette.Interfaces.Modifiers3DPaletteOptions;
export const Modifier3DTags=Modifiers3DPalette.ModifierTags;
export default Modifiers3DPalette.Modifiers3DPalette;
