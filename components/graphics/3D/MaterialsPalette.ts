/** @module components/graphics/3D/MaterialsPalette */
import { Component, Css, Templates } from '../../../core/index.ts';
const html=Templates.Template.Html;
export namespace MaterialsPalette
{
    export namespace Types{export type MaterialKind='basic'|'lambert'|'phong'|'standard'|'physical'|'toon'|'normal'|'wireframe';}
    export namespace Interfaces
    {
        export interface MaterialDef{kind:Types.MaterialKind;color?:string;emissive?:string;opacity?:number;metalness?:number;roughness?:number;clearcoat?:number;transmission?:number;ior?:number;shininess?:number;side?:'front'|'back'|'double';flatShading?:boolean;wireframe?:boolean;}
        export interface MaterialsPaletteOptions{kind?:Types.MaterialKind;theme?:'dark'|'light';}
    }
    const DEFAULTS:Record<Types.MaterialKind,Interfaces.MaterialDef>={
        basic:{kind:'basic',color:'#8a8f95',opacity:1},lambert:{kind:'lambert',color:'#5aa3d9',opacity:1},phong:{kind:'phong',color:'#d18b42',shininess:55,opacity:1},standard:{kind:'standard',color:'#8f61d6',metalness:.25,roughness:.38,opacity:1},physical:{kind:'physical',color:'#e7e9eb',metalness:.7,roughness:.2,clearcoat:.8,transmission:.08,ior:1.45,opacity:1},toon:{kind:'toon',color:'#55bd8d',opacity:1},normal:{kind:'normal',color:'#8d79d9',opacity:1},wireframe:{kind:'wireframe',color:'#e40c88',wireframe:true,opacity:1}
    };
    export const Styles=new Css.Stylesheet([
        new Css.Rule('.MaterialsPalette',{Background:'#202428',Border:'1px solid #121517',BorderRadius:'8px',BoxSizing:'border-box',Color:'#e5e8ea',Display:'block',FontFamily:'var(--arianna-font,system-ui,sans-serif)',Overflow:'hidden',Width:'330px'}),
        new Css.Rule('.MaterialsPalette-Header',{AlignItems:'center',Background:'linear-gradient(180deg,#363b40,#25292d)',BorderBottom:'1px solid #121517',Display:'flex',FontSize:'10px',FontWeight:'800',Height:'34px',Padding:'0 10px'}),
        new Css.Rule('.MaterialsPalette-Body',{Display:'grid',Gap:'10px',Padding:'10px'}),
        new Css.Rule('.MaterialsPalette-Preview',{AlignItems:'center',Background:'radial-gradient(circle at 50% 42%,#363d43,#191d21 70%)',Border:'1px solid #15191c',BorderRadius:'6px',Display:'flex',Height:'135px',JustifyContent:'center',Position:'relative'}),
        new Css.Rule('.MaterialsPalette-Sphere',{Background:'radial-gradient(circle at 32% 27%,rgba(255,255,255,.95) 0 3%,var(--mat,#8f61d6) 13%,color-mix(in srgb,var(--mat,#8f61d6),#000 45%) 68%,#050607 100%)',BorderRadius:'50%',BoxShadow:'0 18px 28px rgba(0,0,0,.42)',Height:'92px',Width:'92px'}),
        new Css.Rule('.MaterialsPalette-Kinds',{Display:'grid',Gap:'4px',GridTemplateColumns:'repeat(4,1fr)'}),
        new Css.Rule('.MaterialsPalette-Kind',{Appearance:'none',Background:'linear-gradient(180deg,#444a50,#30353a)',Border:'1px solid #15181a',BorderRadius:'4px',Color:'#cfd4d8',Cursor:'pointer',Font:'600 8px/1 system-ui',Height:'29px',Padding:'0 3px'}),
        new Css.Rule('.MaterialsPalette-Kind[data-active="true"]',{BorderColor:'#e40c88',BoxShadow:'inset 0 -2px 0 #e40c88',Color:'#fff'}),
        new Css.Rule('.MaterialsPalette-Section',{Background:'#252a2f',Border:'1px solid #171b1e',BorderRadius:'5px',Display:'grid',Gap:'7px',Padding:'8px'}),
        new Css.Rule('.MaterialsPalette-Row',{AlignItems:'center',Display:'grid',FontSize:'8px',Gap:'7px',GridTemplateColumns:'82px 1fr 38px'}),
        new Css.Rule('.MaterialsPalette-Range',{AccentColor:'#e40c88',Height:'14px',MinWidth:'0',Width:'100%'}),
        new Css.Rule('.MaterialsPalette-Value',{Background:'#171b1e',Border:'1px solid #3b4146',BorderRadius:'3px',Color:'#dfe3e6',Font:'8px ui-monospace,monospace',Padding:'4px',TextAlign:'right'}),
        new Css.Rule('.MaterialsPalette-Color',{Appearance:'none',Background:'transparent',Border:'0',Height:'25px',Padding:'0',Width:'100%'}),
        new Css.Rule('.MaterialsPalette[theme="light"]',{Background:'#eef0f2',BorderColor:'#b9bec3',Color:'#25292d'}),new Css.Rule('.MaterialsPalette[theme="light"] .MaterialsPalette-Header',{Background:'linear-gradient(180deg,#f9fafb,#dfe3e6)',BorderBottomColor:'#b9bec3'}),new Css.Rule('.MaterialsPalette[theme="light"] .MaterialsPalette-Preview',{Background:'radial-gradient(circle at 50% 42%,#fff,#d9dde0 72%)',BorderColor:'#c1c6ca'}),new Css.Rule('.MaterialsPalette[theme="light"] .MaterialsPalette-Kind',{Background:'linear-gradient(180deg,#fff,#e1e4e7)',BorderColor:'#b9bec3',Color:'#383e43'}),new Css.Rule('.MaterialsPalette[theme="light"] .MaterialsPalette-Section',{Background:'#f8f9fa',BorderColor:'#cbd0d4'}),new Css.Rule('.MaterialsPalette[theme="light"] .MaterialsPalette-Value',{Background:'#fff',BorderColor:'#c1c6cb',Color:'#30363b'})
    ]);
    @Component('arianna-materials-palette',Styles,{Shadow:false,Attributes:['theme','kind'],Properties:['material']})
    export class MaterialsPalette extends HTMLDivElement
    {
        public static readonly Styles=Styles;public template=html``;private _material:Interfaces.MaterialDef=structuredClone(DEFAULTS.standard);
        constructor(o:Interfaces.MaterialsPaletteOptions={}){super();if(o.theme)this.setAttribute('theme',o.theme);if(o.kind)this._material=structuredClone(DEFAULTS[o.kind]);}
        public onCreated(){requestAnimationFrame(()=>{if(this.isConnected)this.onConnected();});}
        public onConnected(_opts:Interfaces.MaterialsPaletteOptions={}){this.classList.add('MaterialsPalette');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');this.Render();}
        public onAttributeChanged(name:string){if(name==='kind'){const k=this.getAttribute('kind') as Types.MaterialKind;if(k&&DEFAULTS[k])this._material=structuredClone(DEFAULTS[k]);}if(this.isConnected)this.Render();}
        public get material(){return this._material;}public set material(v:Interfaces.MaterialDef){this._material={...v};if(this.isConnected)this.Render();}
        public setKind(kind:Types.MaterialKind):this{this._material=structuredClone(DEFAULTS[kind]);this.setAttribute('kind',kind);this.Render();return this;}
        public setParam(param:keyof Interfaces.MaterialDef,value:string|number|boolean):this{(this._material as any)[param]=value;if(this.isConnected)this.Render();this.dispatchEvent(new CustomEvent('arianna:material-change',{bubbles:true,composed:true,detail:this.getMaterial()}));return this;}
        public getMaterial():Interfaces.MaterialDef{return {...this._material};}
        public setMaterial(m:Interfaces.MaterialDef):this{this.material=m;return this;}
        public onBeforeMount(){} public onMount(){} public onBeforeUpdate(){} public onUpdate(){} public onBeforeUnmount(){} public onUnmount(){}
        private Render(){const root=document.createElement('section'),h=document.createElement('header');h.className='MaterialsPalette-Header';h.textContent='Materials';const body=document.createElement('div');body.className='MaterialsPalette-Body';const preview=document.createElement('div');preview.className='MaterialsPalette-Preview';const sphere=document.createElement('div');sphere.className='MaterialsPalette-Sphere';sphere.style.setProperty('--mat',this._material.color||'#8f61d6');preview.append(sphere);const kinds=document.createElement('div');kinds.className='MaterialsPalette-Kinds';for(const k of Object.keys(DEFAULTS) as Types.MaterialKind[]){const b=document.createElement('button');b.className='MaterialsPalette-Kind';b.dataset.active=String(this._material.kind===k);b.textContent=k;b.onclick=()=>this.setKind(k);kinds.append(b);}const sec=document.createElement('div');sec.className='MaterialsPalette-Section';const colorRow=document.createElement('label');colorRow.className='MaterialsPalette-Row';colorRow.innerHTML='<span>Base Color</span>';const ci=document.createElement('input');ci.className='MaterialsPalette-Color';ci.type='color';ci.value=this._material.color||'#8f61d6';ci.oninput=()=>this.setParam('color',ci.value);colorRow.append(ci,document.createElement('span'));sec.append(colorRow);for(const [key,label,min,max,step] of [['metalness','Metalness',0,1,.01],['roughness','Roughness',0,1,.01],['clearcoat','Clearcoat',0,1,.01],['opacity','Opacity',0,1,.01]] as [keyof Interfaces.MaterialDef,string,number,number,number][]){const row=document.createElement('label');row.className='MaterialsPalette-Row';const l=document.createElement('span');l.textContent=label;const r=document.createElement('input');r.className='MaterialsPalette-Range';r.type='range';r.min=String(min);r.max=String(max);r.step=String(step);r.value=String((this._material[key] as number|undefined)??(key==='opacity'?1:0));const v=document.createElement('span');v.className='MaterialsPalette-Value';v.textContent=Number(r.value).toFixed(2);r.oninput=()=>{v.textContent=Number(r.value).toFixed(2);this.setParam(key,Number(r.value));};row.append(l,r,v);sec.append(row);}body.append(preview,kinds,sec);root.append(h,body);this.replaceChildren(root);}
    }
}
export type MaterialKind=MaterialsPalette.Types.MaterialKind;export type MaterialDef=MaterialsPalette.Interfaces.MaterialDef;export type MaterialsPaletteOptions=MaterialsPalette.Interfaces.MaterialsPaletteOptions;export default MaterialsPalette.MaterialsPalette;
