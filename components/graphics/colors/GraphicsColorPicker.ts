/**
 * @module components/graphics/colors/GraphicsColorPicker
 * @author Riccardo Angeli
 * @version 2.1.0
 */
import { Component, Css, Templates } from '../../../core/index.ts';
const html=Templates.Template.Html;

export namespace GraphicsColorPicker
{
    export namespace Types { export type Theme='dark'|'light'; }
    export namespace Interfaces
    {
        export interface RGB{r:number;g:number;b:number;}
        export interface HSL{h:number;s:number;l:number;}
        export interface Color extends RGB,HSL{a:number;hex:string;}
        export interface ColorPickerOptions{value?:string;alpha?:boolean;theme?:Types.Theme;history?:string[];}
        export interface PickerState{color:Color;history:string[];}
    }

    export const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
    export function parseHexRgba(value:string):{r:number;g:number;b:number;a:number}
    {
        let v=String(value||'').trim().replace(/^#/,''); if(v.length===3||v.length===4)v=v.split('').map(c=>c+c).join('');
        if(!/^[\da-f]{6,8}$/i.test(v))return{r:147,g:190,b:230,a:1};
        return{r:parseInt(v.slice(0,2),16),g:parseInt(v.slice(2,4),16),b:parseInt(v.slice(4,6),16),a:v.length===8?parseInt(v.slice(6,8),16)/255:1};
    }
    export function rgbToHex(r:number,g:number,b:number):string{return'#'+[r,g,b].map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('').toUpperCase();}
    export function rgbToHsl(r:number,g:number,b:number):Interfaces.HSL
    {r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;const l=(max+min)/2;const s=d===0?0:d/(1-Math.abs(2*l-1));if(d){if(max===r)h=60*(((g-b)/d)%6);else if(max===g)h=60*((b-r)/d+2);else h=60*((r-g)/d+4);}if(h<0)h+=360;return{h,s:s*100,l:l*100};}
    export function hslToRgb(h:number,s:number,l:number):Interfaces.RGB
    {h=((h%360)+360)%360;s=clamp(s,0,100)/100;l=clamp(l,0,100)/100;const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let rr=0,gg=0,bb=0;if(h<60){rr=c;gg=x}else if(h<120){rr=x;gg=c}else if(h<180){gg=c;bb=x}else if(h<240){gg=x;bb=c}else if(h<300){rr=x;bb=c}else{rr=c;bb=x}return{r:(rr+m)*255,g:(gg+m)*255,b:(bb+m)*255};}

    const color=(hex:string):Interfaces.Color=>{const p=parseHexRgba(hex),h=rgbToHsl(p.r,p.g,p.b);return{...p,...h,hex:rgbToHex(p.r,p.g,p.b)}};
    const swatches=['#E40C88','#FF4EA9','#9B5CF6','#4F46E5','#3489D8','#2AA7A1','#35B875','#F1C43D','#F28C3C','#EF5360','#FFFFFF','#111315'];

    export const Styles=new Css.Stylesheet([
        new Css.Rule('.GraphicsColorPicker',{Background:'#202428',Border:'1px solid #121517',BorderRadius:'8px',BoxSizing:'border-box',Color:'#e5e8ea',Display:'block',FontFamily:'var(--arianna-font,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif)',MaxWidth:'100%',MinWidth:'280px',Overflow:'hidden',Width:'330px'}),
        new Css.Rule('.GraphicsColorPicker-Header',{AlignItems:'center',Background:'linear-gradient(180deg,#363b40,#25292d)',BorderBottom:'1px solid #111417',Display:'flex',FontSize:'10px',FontWeight:'760',JustifyContent:'space-between',Padding:'8px 10px'}),
        new Css.Rule('.GraphicsColorPicker-Body',{Display:'grid',Gap:'9px',Padding:'10px'}),
        new Css.Rule('.GraphicsColorPicker-SL',{Background:'linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsla(var(--hue,325),100%,50%,0)),hsl(var(--hue,325),100%,50%)',Border:'1px solid #0e1012',BorderRadius:'5px',BoxShadow:'inset 0 0 0 1px rgba(255,255,255,.06)',Cursor:'crosshair',Height:'155px',Position:'relative'}),
        new Css.Rule('.GraphicsColorPicker-Cursor',{Border:'2px solid #fff',BorderRadius:'50%',BoxShadow:'0 0 0 1px #000,0 1px 4px rgba(0,0,0,.5)',Height:'12px',Position:'absolute',Transform:'translate(-50%,-50%)',Width:'12px'}),
        new Css.Rule('.GraphicsColorPicker-Hue',{Appearance:'none',Background:'linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)',Border:'1px solid #111417',BorderRadius:'999px',Height:'10px',Margin:'0',Width:'100%'}),
        new Css.Rule('.GraphicsColorPicker-Alpha',{Appearance:'none',Background:'linear-gradient(90deg,transparent,var(--color,#e40c88)),repeating-conic-gradient(#aaa 0 25%,#fff 0 50%) 0/8px 8px',Border:'1px solid #111417',BorderRadius:'999px',Height:'10px',Margin:'0',Width:'100%'}),
        new Css.Rule('.GraphicsColorPicker-Fields',{Display:'grid',Gap:'5px',GridTemplateColumns:'1.5fr repeat(4,1fr)'}),
        new Css.Rule('.GraphicsColorPicker-Field',{Display:'grid',Gap:'3px'}),
        new Css.Rule('.GraphicsColorPicker-Field label',{Color:'#8a9299',FontSize:'7px',TextAlign:'center',TextTransform:'uppercase'}),
        new Css.Rule('.GraphicsColorPicker-Input',{Appearance:'none',Background:'#181c20',Border:'1px solid #3b4147',BorderRadius:'4px',BoxSizing:'border-box',Color:'#e1e5e8',Font:'9px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace',MinWidth:'0',Outline:'none',Padding:'6px 4px',TextAlign:'center',Width:'100%'}),
        new Css.Rule('.GraphicsColorPicker-Input:focus',{BorderColor:'#e40c88',BoxShadow:'0 0 0 2px rgba(228,12,136,.14)'}),
        new Css.Rule('.GraphicsColorPicker-PreviewRow',{AlignItems:'center',Display:'grid',Gap:'8px',GridTemplateColumns:'42px 1fr'}),
        new Css.Rule('.GraphicsColorPicker-Preview',{Background:'var(--color,#e40c88)',Border:'1px solid #0e1012',BorderRadius:'5px',BoxShadow:'inset 0 1px 0 rgba(255,255,255,.2)',Height:'32px'}),
        new Css.Rule('.GraphicsColorPicker-Section',{BorderTop:'1px solid #343a40',PaddingTop:'8px'}),
        new Css.Rule('.GraphicsColorPicker-SectionTitle',{Color:'#8f979f',FontSize:'8px',FontWeight:'750',MarginBottom:'6px'}),
        new Css.Rule('.GraphicsColorPicker-Swatches',{Display:'grid',Gap:'4px',GridTemplateColumns:'repeat(8,1fr)'}),
        new Css.Rule('.GraphicsColorPicker-Swatch',{Appearance:'none',Background:'var(--swatch)',Border:'1px solid rgba(255,255,255,.15)',BorderRadius:'3px',Cursor:'pointer',Height:'22px',Padding:'0'}),
        new Css.Rule('.GraphicsColorPicker[theme="light"]',{Background:'#eef0f2',BorderColor:'#b9bec3',Color:'#25292d'}),
        new Css.Rule('.GraphicsColorPicker[theme="light"] .GraphicsColorPicker-Header',{Background:'linear-gradient(180deg,#f9fafb,#dfe3e6)',BorderBottomColor:'#b9bec3'}),
        new Css.Rule('.GraphicsColorPicker[theme="light"] .GraphicsColorPicker-Input',{Background:'#fff',BorderColor:'#c1c6cb',Color:'#30363b'}),
        new Css.Rule('.GraphicsColorPicker[theme="light"] .GraphicsColorPicker-Section',{BorderTopColor:'#c8cdd1'}),
        new Css.Rule('.GraphicsColorPicker[theme="light"] .GraphicsColorPicker-Field label,.GraphicsColorPicker[theme="light"] .GraphicsColorPicker-SectionTitle',{Color:'#666e75'})
    ]);

    @Component('arianna-color-picker-pro',Styles,{Shadow:false,Attributes:['value','alpha','theme']})
    export class GraphicsColorPicker extends HTMLDivElement
    {
        public static readonly Styles=Styles; public template=html``; private _color=color('#E40C88'); private _history:string[]=[];
        constructor(options:Interfaces.ColorPickerOptions={}){super();if(options.theme)this.setAttribute('theme',options.theme);if(options.alpha===false)this.setAttribute('alpha','false');if(options.value)this._color=color(options.value);if(options.history)this._history=[...options.history];}
        public onCreated():void{requestAnimationFrame(()=>{if(this.isConnected)this.onConnected();});}
        public onConnected():void{this.classList.add('GraphicsColorPicker');if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');const v=this.getAttribute('value');if(v)this._color=color(v);this.Render();}
        public get value(){return this._color.hex;} public set value(v:string){this._color=color(v);this.setAttribute('value',this._color.hex);if(this.isConnected)this.Render();}
        public get Color():Interfaces.Color{return{...this._color};}
        private Emit(){this.setAttribute('value',this._color.hex);this.style.setProperty('--color',this._color.hex);this.dispatchEvent(new CustomEvent('arianna:change',{bubbles:true,composed:true,detail:{value:this._color.hex,color:this.Color}}));}
        private SetHSL(h:number,s:number,l:number){const rgb=hslToRgb(h,s,l);this._color={...rgb,h,s,l,a:this._color.a,hex:rgbToHex(rgb.r,rgb.g,rgb.b)};this.Emit();this.Render();}
        public getColor():Interfaces.Color{return {...this._color};}public setColor(c:string|Partial<Interfaces.RGB>|Partial<Interfaces.HSL>|{hex?:string;alpha?:number}):this{if(typeof c==='string'){this.value=c;return this;}const alpha=('alpha' in c&&typeof c.alpha==='number')?c.alpha:undefined;if('hex' in c&&c.hex){this._color=color(c.hex);}else if('r' in c||'g' in c||'b' in c){const rgb:Interfaces.RGB={r:('r' in c&&typeof c.r==='number')?c.r:this._color.r,g:('g' in c&&typeof c.g==='number')?c.g:this._color.g,b:('b' in c&&typeof c.b==='number')?c.b:this._color.b};const h=rgbToHsl(rgb.r,rgb.g,rgb.b);this._color={...rgb,...h,a:this._color.a,hex:rgbToHex(rgb.r,rgb.g,rgb.b)};}else if('h' in c||'s' in c||'l' in c){const hsl:Interfaces.HSL={h:('h' in c&&typeof c.h==='number')?c.h:this._color.h,s:('s' in c&&typeof c.s==='number')?c.s:this._color.s,l:('l' in c&&typeof c.l==='number')?c.l:this._color.l};const rgb=hslToRgb(hsl.h,hsl.s,hsl.l);this._color={...rgb,...hsl,a:this._color.a,hex:rgbToHex(rgb.r,rgb.g,rgb.b)};}if(alpha!==undefined)this._color.a=clamp(alpha,0,1);this.Emit();if(this.isConnected)this.Render();return this;}public onBeforeMount(){}public onMount(){}public onBeforeUpdate(){}public onUpdate(){}public onBeforeUnmount(){}public onUnmount(){}private Render():void
        {
            this.style.setProperty('--hue',String(this._color.h));this.style.setProperty('--color',this._color.hex);const root=document.createElement('section');
            const head=document.createElement('header');head.className='GraphicsColorPicker-Header';head.innerHTML='<span>Color Picker</span><span>↻</span>';
            const body=document.createElement('div');body.className='GraphicsColorPicker-Body';const sl=document.createElement('div');sl.className='GraphicsColorPicker-SL';const cur=document.createElement('span');cur.className='GraphicsColorPicker-Cursor';cur.style.left=`${this._color.s}%`;cur.style.top=`${100-this._color.l}%`;sl.append(cur);sl.onpointerdown=e=>{const r=sl.getBoundingClientRect();this.SetHSL(this._color.h,clamp((e.clientX-r.left)/r.width*100,0,100),clamp(100-(e.clientY-r.top)/r.height*100,0,100));};
            const hue=document.createElement('input');hue.type='range';hue.className='GraphicsColorPicker-Hue';hue.min='0';hue.max='360';hue.value=String(this._color.h);hue.oninput=()=>this.SetHSL(Number(hue.value),this._color.s,this._color.l);
            const alpha=document.createElement('input');alpha.type='range';alpha.className='GraphicsColorPicker-Alpha';alpha.min='0';alpha.max='100';alpha.value=String(this._color.a*100);alpha.oninput=()=>{this._color.a=Number(alpha.value)/100;this.Emit();};
            const preview=document.createElement('div');preview.className='GraphicsColorPicker-PreviewRow';preview.innerHTML='<div class="GraphicsColorPicker-Preview"></div>';const fields=document.createElement('div');fields.className='GraphicsColorPicker-Fields';const specs:[string,string][]=[['Hex',this._color.hex],['R',String(Math.round(this._color.r))],['G',String(Math.round(this._color.g))],['B',String(Math.round(this._color.b))],['A',String(Math.round(this._color.a*100))]];for(const [label,val]of specs){const f=document.createElement('div');f.className='GraphicsColorPicker-Field';const l=document.createElement('label');l.textContent=label;const i=document.createElement('input');i.className='GraphicsColorPicker-Input';i.value=val;i.onchange=()=>{if(label==='Hex')this.value=i.value;else{const rgb={r:this._color.r,g:this._color.g,b:this._color.b};if(label==='R')rgb.r=Number(i.value);if(label==='G')rgb.g=Number(i.value);if(label==='B')rgb.b=Number(i.value);if(label==='A')this._color.a=clamp(Number(i.value)/100,0,1);const h=rgbToHsl(rgb.r,rgb.g,rgb.b);this._color={...rgb,...h,a:this._color.a,hex:rgbToHex(rgb.r,rgb.g,rgb.b)};this.Emit();this.Render();}};f.append(l,i);fields.append(f);}preview.append(fields);
            const sec=document.createElement('div');sec.className='GraphicsColorPicker-Section';const title=document.createElement('div');title.className='GraphicsColorPicker-SectionTitle';title.textContent='Saved colors';const sw=document.createElement('div');sw.className='GraphicsColorPicker-Swatches';for(const c of swatches){const b=document.createElement('button');b.className='GraphicsColorPicker-Swatch';b.style.setProperty('--swatch',c);b.title=c;b.onclick=()=>{this._history=[this._color.hex,...this._history.filter(x=>x!==this._color.hex)].slice(0,12);this.value=c;};sw.append(b);}sec.append(title,sw);
            body.append(sl,hue);if(this.getAttribute('alpha')!=='false')body.append(alpha);body.append(preview,sec);root.append(head,body);this.replaceChildren(root);
        }
    }
}
export const parseHexRgba=GraphicsColorPicker.parseHexRgba;export const rgbToHex=GraphicsColorPicker.rgbToHex;export const rgbToHsl=GraphicsColorPicker.rgbToHsl;export const hslToRgb=GraphicsColorPicker.hslToRgb;
export type RGB=GraphicsColorPicker.Interfaces.RGB;export type HSL=GraphicsColorPicker.Interfaces.HSL;export type Color=GraphicsColorPicker.Interfaces.Color;export type ColorPickerOptions=GraphicsColorPicker.Interfaces.ColorPickerOptions;
export default GraphicsColorPicker.GraphicsColorPicker;
