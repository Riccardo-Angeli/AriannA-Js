/** @module components/graphics/colors/ColorSpacePickerBase */
import { Css, Templates } from '../../../core/index.ts';
import {
    parseHex, rgbToHex, convertAll, fromRgb, toRgb, clamp, clamp01,
    type RGB, type ColorConversions, type ColorSpace,
} from '../../../additionals/Colors.ts';

const html=Templates.Template.Html;
export type PickerGeometry='wheel'|'square'|'plane';
export interface PickerChannel { key:string; label:string; min:number; max:number; step:number; unit?:string; decimals?:number; }
export interface PickerConfig { space:ColorSpace; title:string; geometry:PickerGeometry; channels:PickerChannel[]; plane?:[string,string]; hue?:string; saturation?:string; lightness?:string; value?:string; }
interface State { rgb:RGB; alpha:number; }
const States=new WeakMap<HTMLElement,State>();
const S=(el:HTMLElement):State=>{let s=States.get(el);if(!s){s={rgb:parseHex('#E40C88')!,alpha:1};States.set(el,s);}return s;};

const fmt=(n:number,d=2):string=>{if(!Number.isFinite(n))return'0';const p=Math.pow(10,d);return String(Math.round(n*p)/p);};
const escape=(s:string):string=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

export const ColorSpacePickerStyles=new Css.Stylesheet([
    new Css.Rule('.AriannaColorSpacePicker',{Background:'var(--arianna-bg,#171a1d)',Border:'1px solid var(--arianna-border,#3a4046)',BorderRadius:'12px',BoxSizing:'border-box',Color:'var(--arianna-text,#eef1f4)',Display:'block',FontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',Overflow:'hidden',Width:'430px',MaxWidth:'100%'}),
    new Css.Rule('.acp-head',{AlignItems:'center',Background:'var(--arianna-bg-2,#202428)',BorderBottom:'1px solid var(--arianna-border,#3a4046)',Display:'flex',Gap:'12px',Padding:'11px 13px'}),
    new Css.Rule('.acp-head strong',{Flex:'1',FontSize:'13px'}),
    new Css.Rule('.acp-chip',{Border:'1px solid rgba(255,255,255,.24)',BorderRadius:'8px',BoxShadow:'inset 0 0 0 1px rgba(0,0,0,.16)',Height:'28px',Width:'62px'}),
    new Css.Rule('.acp-body',{Display:'grid',Gap:'12px',Padding:'12px'}),
    new Css.Rule('.acp-main',{AlignItems:'start',Display:'grid',Gap:'12px',GridTemplateColumns:'220px minmax(0,1fr)'}),
    new Css.Rule('.acp-canvas-wrap',{AlignItems:'center',Background:'var(--arianna-bg-2,#202428)',Border:'1px solid var(--arianna-border,#3a4046)',BorderRadius:'10px',Display:'flex',Height:'220px',JustifyContent:'center',Overflow:'hidden',Position:'relative',Width:'220px'}),
    new Css.Rule('.acp-canvas',{Cursor:'crosshair',Height:'220px',ImageRendering:'auto',TouchAction:'none',Width:'220px'}),
    new Css.Rule('.acp-cursor',{Border:'2px solid #fff',BorderRadius:'50%',BoxShadow:'0 0 0 1px #000,0 2px 8px rgba(0,0,0,.6)',Height:'12px',PointerEvents:'none',Position:'absolute',Transform:'translate(-50%,-50%)',Width:'12px'}),
    new Css.Rule('.acp-sliders',{Display:'grid',Gap:'7px'}),
    new Css.Rule('.acp-slider-row',{AlignItems:'center',Display:'grid',Gap:'6px',GridTemplateColumns:'34px minmax(70px,1fr) 66px 28px'}),
    new Css.Rule('.acp-slider-row label',{Color:'var(--arianna-muted,#9aa2aa)',Font:'700 10px ui-monospace,SFMono-Regular,Menlo,monospace'}),
    new Css.Rule('.acp-range',{Appearance:'none',Background:'var(--range-bg,#333)',Border:'1px solid var(--arianna-border,#3a4046)',BorderRadius:'999px',Cursor:'pointer',Height:'10px',Margin:'0',MinWidth:'0',Padding:'0',Width:'100%'}),
    new Css.Rule('.acp-number',{Background:'var(--arianna-bg,#171a1d)',Border:'1px solid var(--arianna-border,#3a4046)',BorderRadius:'6px',BoxSizing:'border-box',Color:'var(--arianna-text,#eef1f4)',Font:'10px ui-monospace,SFMono-Regular,Menlo,monospace',MinWidth:'0',Padding:'6px 5px',Width:'66px'}),
    new Css.Rule('.acp-unit',{Color:'var(--arianna-muted,#9aa2aa)',FontSize:'9px'}),
    new Css.Rule('.acp-alpha',{BorderTop:'1px solid var(--arianna-border,#3a4046)',MarginTop:'2px',PaddingTop:'7px'}),
    new Css.Rule('.acp-conversions',{Border:'1px solid var(--arianna-border,#3a4046)',BorderRadius:'10px',Overflow:'hidden'}),
    new Css.Rule('.acp-conversions-head',{Background:'var(--arianna-bg-2,#202428)',BorderBottom:'1px solid var(--arianna-border,#3a4046)',Color:'var(--arianna-muted,#9aa2aa)',Font:'800 9px ui-monospace,SFMono-Regular,Menlo,monospace',LetterSpacing:'.06em',Padding:'7px 9px',TextTransform:'uppercase'}),
    new Css.Rule('.acp-conversion-grid',{Display:'grid',GridTemplateColumns:'repeat(2,minmax(0,1fr))'}),
    new Css.Rule('.acp-conversion',{BorderBottom:'1px solid var(--arianna-border,#3a4046)',Display:'grid',Gap:'3px',MinWidth:'0',Padding:'7px 9px'}),
    new Css.Rule('.acp-conversion:nth-child(odd)',{BorderRight:'1px solid var(--arianna-border,#3a4046)'}),
    new Css.Rule('.acp-conversion b',{Color:'var(--arianna-muted,#9aa2aa)',Font:'800 8px ui-monospace,SFMono-Regular,Menlo,monospace',TextTransform:'uppercase'}),
    new Css.Rule('.acp-conversion code',{Color:'var(--arianna-text,#eef1f4)',Font:'9px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace',Overflow:'hidden',TextOverflow:'ellipsis',WhiteSpace:'nowrap'}),
    new Css.Rule('.acp-web',{Background:'var(--arianna-bg-2,#202428)',Display:'grid',Gap:'4px',GridColumn:'1/-1',Padding:'8px 9px'}),
    new Css.Rule('.acp-web code',{Color:'var(--arianna-text,#eef1f4)',Font:'9px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace'}),
    new Css.Rule('.AriannaColorSpacePicker[theme="light"]',{Background:'#f5f6f7',BorderColor:'#bcc2c7',Color:'#25292d'}),
    new Css.Rule('.AriannaColorSpacePicker[theme="light"] .acp-head,.AriannaColorSpacePicker[theme="light"] .acp-conversions-head,.AriannaColorSpacePicker[theme="light"] .acp-web,.AriannaColorSpacePicker[theme="light"] .acp-canvas-wrap',{Background:'#fff'}),
    new Css.Rule('.AriannaColorSpacePicker[theme="light"] .acp-number',{Background:'#fff',Color:'#25292d'}),
]);

function theme(host:HTMLElement):void {
    if(!host.hasAttribute('theme'))host.setAttribute('theme','dark');
    const light=host.getAttribute('theme')==='light';
    const vars=light?{'--arianna-bg':'#f5f6f7','--arianna-bg-2':'#ffffff','--arianna-border':'#bcc2c7','--arianna-text':'#25292d','--arianna-muted':'#6a7279'}:{'--arianna-bg':'#171a1d','--arianna-bg-2':'#202428','--arianna-border':'#3a4046','--arianna-text':'#eef1f4','--arianna-muted':'#9aa2aa'};
    for(const[k,v]of Object.entries(vars))host.style.setProperty(k,v);
}

function spaceAlpha(space:ColorSpace,value:any,alpha:number):any {
    const v={...value}; if(space==='lab'||space==='oklab')v.alpha=alpha;else v.a=alpha; return v;
}

export abstract class ColorSpacePickerBase extends HTMLElement {
    public template=html``;
    protected abstract readonly Config:PickerConfig;
    private drawing=false;
    public onCreated():void{if(this.isConnected)this.onConnected();}
    public onConnected():void{this.classList.add('AriannaColorSpacePicker');theme(this);const raw=this.getAttribute('value')||this.getAttribute('color');if(raw){const p=parseHex(raw);if(p){S(this).rgb=p;S(this).alpha=p.a??1;}}if(this.hasAttribute('alpha'))S(this).alpha=clamp01(Number(this.getAttribute('alpha')));this.Render();}
    public onAttributeChanged(name:string):void{if(!this.isConnected)return;if(name==='theme'){theme(this);this.Render();return;}if(name==='value'||name==='color'){const p=parseHex(this.getAttribute(name)||'');if(p){S(this).rgb=p;S(this).alpha=p.a??S(this).alpha;this.Render();}}if(name==='alpha'){S(this).alpha=clamp01(Number(this.getAttribute('alpha')));this.Render();}}
    public get value():string{return rgbToHex({...S(this).rgb,a:S(this).alpha});}
    public set value(v:string){this.setColor(v);}
    public getColor():RGB{return{...S(this).rgb,a:S(this).alpha};}
    public getConversions():ColorConversions{return convertAll(this.getColor());}
    public getSpaceValues():any{return fromRgb(this.Config.space,this.getColor());}
    public setColor(value:string|RGB):this{const rgb=typeof value==='string'?parseHex(value):value;if(!rgb)return this;S(this).rgb={r:rgb.r,g:rgb.g,b:rgb.b,a:rgb.a};if(rgb.a!=null)S(this).alpha=clamp01(rgb.a);this.setAttribute('value',rgbToHex(S(this).rgb));this.Render();this.Emit();return this;}
    public setSpaceValues(patch:Record<string,number>):this{const current=this.getSpaceValues();Object.assign(current,patch);const rgb=toRgb(this.Config.space,spaceAlpha(this.Config.space,current,S(this).alpha));S(this).rgb={r:rgb.r,g:rgb.g,b:rgb.b,a:S(this).alpha};this.setAttribute('value',rgbToHex(S(this).rgb));this.Render();this.Emit();return this;}
    private Emit():void{this.dispatchEvent(new CustomEvent('arianna:change',{bubbles:true,composed:true,detail:{space:this.Config.space,value:this.value,color:this.getColor(),spaceValues:this.getSpaceValues(),conversions:this.getConversions(),source:this}}));}
    private rangeGradient(channel:PickerChannel,current:any):string{const stops:string[]=[];for(let i=0;i<=10;i++){const v=channel.min+(channel.max-channel.min)*i/10;const p={...current,[channel.key]:v};const rgb=toRgb(this.Config.space,spaceAlpha(this.Config.space,p,S(this).alpha));stops.push(`rgb(${Math.round(rgb.r)} ${Math.round(rgb.g)} ${Math.round(rgb.b)}) ${i*10}%`);}return`linear-gradient(90deg,${stops.join(',')})`;}
    private conversionRows(c:ColorConversions):Array<[string,string]>{return[
        ['sRGBA',`rgba(${Math.round(c.srgba.r)}, ${Math.round(c.srgba.g)}, ${Math.round(c.srgba.b)}, ${fmt(c.srgba.a,3)})`],
        ['RGB',`${fmt(c.rgb.r,0)}, ${fmt(c.rgb.g,0)}, ${fmt(c.rgb.b,0)}`],
        ['HSL',`${fmt(c.hsl.h,1)}°, ${fmt(c.hsl.s,1)}%, ${fmt(c.hsl.l,1)}%`],
        ['HSV',`${fmt(c.hsv.h,1)}°, ${fmt(c.hsv.s,1)}%, ${fmt(c.hsv.v,1)}%`],
        ['OKHSL',`${fmt(c.okhsl.h,1)}°, ${fmt(c.okhsl.s,1)}%, ${fmt(c.okhsl.l,1)}%`],
        ['OKHSV',`${fmt(c.okhsv.h,1)}°, ${fmt(c.okhsv.s,1)}%, ${fmt(c.okhsv.v,1)}%`],
        ['CMYK',`${fmt(c.cmyk.c,1)}%, ${fmt(c.cmyk.m,1)}%, ${fmt(c.cmyk.y,1)}%, ${fmt(c.cmyk.k,1)}%`],
        ['CIE 1931 XYZ',`${fmt(c.xyz.X,3)}, ${fmt(c.xyz.Y,3)}, ${fmt(c.xyz.Z,3)}`],
        ['CIELAB',`${fmt(c.lab.L,2)}, ${fmt(c.lab.a,2)}, ${fmt(c.lab.b,2)}`],
        ['CIELUV',`${fmt(c.luv.L,2)}, ${fmt(c.luv.u,2)}, ${fmt(c.luv.v,2)}`],
        ['CIEUVW',`${fmt(c.uvw.U,2)}, ${fmt(c.uvw.V,2)}, ${fmt(c.uvw.W,2)}`],
        ['OKLab',`${fmt(c.oklab.L,4)}, ${fmt(c.oklab.a,4)}, ${fmt(c.oklab.b,4)}`],
        ['OKLCH',`${fmt(c.oklch.L,4)}, ${fmt(c.oklch.C,4)}, ${fmt(c.oklch.h,1)}°`],
    ];}
    private Render():void {
        const cfg=this.Config,current=this.getSpaceValues(),conv=this.getConversions(),root=document.createElement('section');
        const head=document.createElement('header');head.className='acp-head';const title=document.createElement('strong');title.textContent=cfg.title;const chip=document.createElement('span');chip.className='acp-chip';chip.style.background=conv.web.hex;head.append(title,chip);
        const body=document.createElement('div');body.className='acp-body';const main=document.createElement('div');main.className='acp-main';
        const cw=document.createElement('div');cw.className='acp-canvas-wrap';const canvas=document.createElement('canvas');canvas.className='acp-canvas';canvas.width=128;canvas.height=128;const cursor=document.createElement('span');cursor.className='acp-cursor';cw.append(canvas,cursor);main.appendChild(cw);
        const sliders=document.createElement('div');sliders.className='acp-sliders';
        for(const ch of cfg.channels){const row=document.createElement('div');row.className='acp-slider-row';const lab=document.createElement('label');lab.textContent=ch.label;const range=document.createElement('input');range.type='range';range.min=String(ch.min);range.max=String(ch.max);range.step=String(ch.step);range.value=String(Number(current[ch.key]??ch.min));range.className='acp-range';range.style.setProperty('--range-bg',this.rangeGradient(ch,current));const num=document.createElement('input');num.type='number';num.min=String(ch.min);num.max=String(ch.max);num.step=String(ch.step);num.value=fmt(Number(current[ch.key]??ch.min),ch.decimals??2);num.className='acp-number';const unit=document.createElement('span');unit.className='acp-unit';unit.textContent=ch.unit??'';const apply=(raw:string)=>{const v=clamp(Number(raw),ch.min,ch.max);this.setSpaceValues({[ch.key]:v});};range.oninput=()=>apply(range.value);num.onchange=()=>apply(num.value);row.append(lab,range,num,unit);sliders.appendChild(row);}
        const alpha=document.createElement('div');alpha.className='acp-slider-row acp-alpha';const al=document.createElement('label');al.textContent='A';const ar=document.createElement('input');ar.type='range';ar.min='0';ar.max='1';ar.step='.001';ar.value=String(S(this).alpha);ar.className='acp-range';ar.style.setProperty('--range-bg',`linear-gradient(90deg,transparent,${conv.web.hex})`);const an=document.createElement('input');an.type='number';an.min='0';an.max='1';an.step='.001';an.value=fmt(S(this).alpha,3);an.className='acp-number';const au=document.createElement('span');au.className='acp-unit';const setA=(v:string)=>{S(this).alpha=clamp01(Number(v));this.setAttribute('alpha',String(S(this).alpha));this.Render();this.Emit();};ar.oninput=()=>setA(ar.value);an.onchange=()=>setA(an.value);alpha.append(al,ar,an,au);sliders.append(alpha);main.appendChild(sliders);body.appendChild(main);
        const conversions=document.createElement('section');conversions.className='acp-conversions';const chead=document.createElement('div');chead.className='acp-conversions-head';chead.textContent='Simultaneous conversions';const grid=document.createElement('div');grid.className='acp-conversion-grid';for(const[label,val]of this.conversionRows(conv)){const row=document.createElement('div');row.className='acp-conversion';row.innerHTML=`<b>${escape(label)}</b><code title="${escape(val)}">${escape(val)}</code>`;grid.appendChild(row);}const web=document.createElement('div');web.className='acp-web';web.innerHTML=`<code><b>WEB</b> ${escape(conv.web.hex)} · ${escape(conv.web.hexa)} · web-safe ${escape(conv.web.webSafe)}</code><code>${escape(conv.web.rgba)}</code><code>${escape(conv.web.cssSrgb)}</code>`;grid.appendChild(web);conversions.append(chead,grid);body.appendChild(conversions);root.append(head,body);this.replaceChildren(root);
        this.positionCursor(cursor,current);this.draw(canvas,current);canvas.onpointerdown=(e)=>{canvas.setPointerCapture?.(e.pointerId);const move=(ev:PointerEvent)=>this.pickCanvas(canvas,ev);this.pickCanvas(canvas,e);canvas.onpointermove=move;canvas.onpointerup=canvas.onpointercancel=()=>{canvas.onpointermove=null;};};
    }
    private positionCursor(cursor:HTMLElement,current:any):void{const cfg=this.Config;let x=.5,y=.5;if(cfg.geometry==='wheel'){const h=Number(current[cfg.hue!])/360,s=clamp01(Number(current[cfg.saturation!])/100),ang=h*Math.PI*2-Math.PI/2;x=.5+Math.cos(ang)*s*.47;y=.5+Math.sin(ang)*s*.47;}else if(cfg.geometry==='square'){x=clamp01(Number(current[cfg.saturation!])/100);y=1-clamp01(Number(current[cfg.value!])/100);}else if(cfg.plane){const a=cfg.channels.find(c=>c.key===cfg.plane![0])!,b=cfg.channels.find(c=>c.key===cfg.plane![1])!;x=(Number(current[a.key])-a.min)/(a.max-a.min);y=1-(Number(current[b.key])-b.min)/(b.max-b.min);}cursor.style.left=`${clamp01(x)*100}%`;cursor.style.top=`${clamp01(y)*100}%`;}
    private pickCanvas(canvas:HTMLCanvasElement,e:PointerEvent):void{const cfg=this.Config,r=canvas.getBoundingClientRect(),x=clamp01((e.clientX-r.left)/r.width),y=clamp01((e.clientY-r.top)/r.height),patch:Record<string,number>={};if(cfg.geometry==='wheel'){const dx=x-.5,dy=y-.5,rad=Math.min(1,Math.hypot(dx,dy)/.47);patch[cfg.hue!]=wrap(Math.atan2(dy,dx)+Math.PI/2)*180/Math.PI;patch[cfg.saturation!]=rad*100;}else if(cfg.geometry==='square'){patch[cfg.saturation!]=x*100;patch[cfg.value!]=(1-y)*100;}else if(cfg.plane){const a=cfg.channels.find(c=>c.key===cfg.plane![0])!,b=cfg.channels.find(c=>c.key===cfg.plane![1])!;patch[a.key]=a.min+x*(a.max-a.min);patch[b.key]=b.min+(1-y)*(b.max-b.min);}this.setSpaceValues(patch);}
    private draw(canvas:HTMLCanvasElement,current:any):void{if(this.drawing)return;this.drawing=true;requestAnimationFrame(()=>{try{const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;const w=canvas.width,h=canvas.height,img=ctx.createImageData(w,h),cfg=this.Config;for(let py=0;py<h;py++)for(let px=0;px<w;px++){const x=px/(w-1),y=py/(h-1),v={...current};let visible=true;if(cfg.geometry==='wheel'){const dx=x-.5,dy=y-.5,rad=Math.hypot(dx,dy)/.47;if(rad>1){visible=false;}else{v[cfg.hue!]=wrap(Math.atan2(dy,dx)+Math.PI/2)*180/Math.PI;v[cfg.saturation!]=rad*100;}}else if(cfg.geometry==='square'){v[cfg.saturation!]=x*100;v[cfg.value!]=(1-y)*100;}else if(cfg.plane){const a=cfg.channels.find(c=>c.key===cfg.plane![0])!,b=cfg.channels.find(c=>c.key===cfg.plane![1])!;v[a.key]=a.min+x*(a.max-a.min);v[b.key]=b.min+(1-y)*(b.max-b.min);}const i=(py*w+px)*4;if(!visible){img.data[i+3]=0;continue;}const rgb=toRgb(cfg.space,spaceAlpha(cfg.space,v,1));img.data[i]=clamp(Math.round(rgb.r),0,255);img.data[i+1]=clamp(Math.round(rgb.g),0,255);img.data[i+2]=clamp(Math.round(rgb.b),0,255);img.data[i+3]=255;}ctx.putImageData(img,0,0);}finally{this.drawing=false;} });}
}
function wrap(rad:number):number{const tau=Math.PI*2;return((rad%tau)+tau)%tau;}
