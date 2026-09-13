/**
 * @module components/graphics/colors/ColorSpacePickerBase
 * @description Shared production UI/runtime for AriannA dedicated colour-space pickers.
 * Every picker exposes the same canonical colour, simultaneous conversions, channel
 * sliders + numeric values, alpha, Web/CSS forms and an appropriate visual surface.
 */
import { Css, Templates } from '../../../core/index.ts';
import {
    parseHex, rgbToHex, convertAll, fromRgb, toRgb, clamp, clamp01,
    type RGB, type ColorConversions, type ColorSpace,
} from '../../../additionals/Colors.ts';

const html=Templates.Template.Html;
export type PickerGeometry='wheel'|'square'|'plane';
export interface PickerChannel { key:string; label:string; min:number; max:number; step:number; unit?:string; decimals?:number; }
export interface PickerConfig {
    space:ColorSpace;
    title:string;
    geometry:PickerGeometry;
    channels:PickerChannel[];
    plane?:[string,string];
    hue?:string;
    saturation?:string;
    lightness?:string;
    value?:string;
}
interface State { rgb:RGB; alpha:number; internalAttributeWrite:boolean; }
const States=new WeakMap<HTMLElement,State>();
const Drawing=new WeakSet<HTMLCanvasElement>();
const S=(el:HTMLElement):State=>{let s=States.get(el);if(!s){s={rgb:parseHex('#E40C88')!,alpha:1,internalAttributeWrite:false};States.set(el,s);}return s;};

const fmt=(n:number,d=2):string=>{if(!Number.isFinite(n))return'0';const p=10**d;return String(Math.round(n*p)/p);};
const esc=(s:string):string=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const wrapDegrees=(n:number):number=>((n%360)+360)%360;

export const ColorSpacePickerStyles=new Css.Stylesheet([
    new Css.Rule('.AriannaColorSpacePicker',{Background:'var(--acp-bg,#171a1d)',Border:'1px solid var(--acp-border,#3a4046)',BorderRadius:'10px',BoxSizing:'border-box',Color:'var(--acp-text,#eef1f4)',Display:'block',FontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',MaxWidth:'100%',Overflow:'hidden',Width:'520px'}),
    new Css.Rule('.acp-head',{AlignItems:'center',Background:'var(--acp-bg2,#202428)',BorderBottom:'1px solid var(--acp-border,#3a4046)',Display:'flex',Gap:'12px',Padding:'10px 12px'}),
    new Css.Rule('.acp-head strong',{Flex:'1',FontSize:'12px',FontWeight:'800'}),
    new Css.Rule('.acp-chip',{BackgroundImage:'linear-gradient(45deg,#777 25%,transparent 25%),linear-gradient(-45deg,#777 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#777 75%),linear-gradient(-45deg,transparent 75%,#777 75%)',BackgroundPosition:'0 0,0 5px,5px -5px,-5px 0',BackgroundSize:'10px 10px',Border:'1px solid var(--acp-border,#3a4046)',BorderRadius:'6px',Height:'28px',Overflow:'hidden',Position:'relative',Width:'70px'}),
    new Css.Rule('.acp-chip-color',{Inset:'0',Position:'absolute'}),
    new Css.Rule('.acp-body',{Display:'grid',Gap:'10px',Padding:'11px'}),
    new Css.Rule('.acp-main',{AlignItems:'start',Display:'grid',Gap:'12px',GridTemplateColumns:'230px minmax(0,1fr)'}),
    new Css.Rule('.acp-canvas-wrap',{AlignItems:'center',Background:'var(--acp-bg2,#202428)',Border:'1px solid var(--acp-border,#3a4046)',BorderRadius:'8px',Display:'flex',Height:'230px',JustifyContent:'center',Overflow:'hidden',Position:'relative',Width:'230px'}),
    new Css.Rule('.acp-canvas',{Cursor:'crosshair',Display:'block',Height:'230px',TouchAction:'none',Width:'230px'}),
    new Css.Rule('.acp-cursor',{Border:'2px solid #fff',BorderRadius:'50%',BoxShadow:'0 0 0 1px #000,0 2px 7px rgba(0,0,0,.55)',Height:'10px',PointerEvents:'none',Position:'absolute',Transform:'translate(-50%,-50%)',Width:'10px'}),
    new Css.Rule('.acp-sliders',{Display:'grid',Gap:'7px'}),
    new Css.Rule('.acp-slider-row',{AlignItems:'center',Display:'grid',Gap:'6px',GridTemplateColumns:'32px minmax(74px,1fr) 72px 26px'}),
    new Css.Rule('.acp-slider-row label',{Color:'var(--acp-muted,#9aa2aa)',Font:'800 9px ui-monospace,SFMono-Regular,Menlo,monospace'}),
    new Css.Rule('.acp-range',{Appearance:'none',WebkitAppearance:'none',Background:'var(--range-bg,#333)',Border:'1px solid var(--acp-border,#3a4046)',BorderRadius:'999px',Cursor:'pointer',Height:'8px',Margin:'0',MinWidth:'0',Padding:'0',Width:'100%'}),
    new Css.Rule('.acp-range::-webkit-slider-runnable-track',{Background:'transparent',Border:'0',BorderRadius:'999px',Height:'8px'}),
    new Css.Rule('.acp-range::-webkit-slider-thumb',{Appearance:'none',WebkitAppearance:'none',Background:'#fff',Border:'1px solid rgba(0,0,0,.38)',BorderRadius:'50%',BoxShadow:'0 1px 2px rgba(0,0,0,.35)',Cursor:'grab',Height:'11px',MarginTop:'-2px',Width:'11px'}),
    new Css.Rule('.acp-range::-moz-range-track',{Background:'transparent',Border:'0',BorderRadius:'999px',Height:'8px'}),
    new Css.Rule('.acp-range::-moz-range-thumb',{Background:'#fff',Border:'1px solid rgba(0,0,0,.38)',BorderRadius:'50%',BoxShadow:'0 1px 2px rgba(0,0,0,.35)',Cursor:'grab',Height:'11px',Width:'11px'}),
    new Css.Rule('.acp-number',{Background:'var(--acp-bg,#171a1d)',Border:'1px solid var(--acp-border,#3a4046)',BorderRadius:'5px',BoxSizing:'border-box',Color:'var(--acp-text,#eef1f4)',Font:'9px ui-monospace,SFMono-Regular,Menlo,monospace',MinWidth:'0',Padding:'5px 5px',Width:'72px'}),
    new Css.Rule('.acp-unit',{Color:'var(--acp-muted,#9aa2aa)',FontSize:'8px'}),
    new Css.Rule('.acp-alpha',{BorderTop:'1px solid var(--acp-border,#3a4046)',MarginTop:'2px',PaddingTop:'8px'}),
    new Css.Rule('.acp-conversions',{Border:'1px solid var(--acp-border,#3a4046)',BorderRadius:'8px',Overflow:'hidden'}),
    new Css.Rule('.acp-conversions-head',{Background:'var(--acp-bg2,#202428)',BorderBottom:'1px solid var(--acp-border,#3a4046)',Color:'var(--acp-muted,#9aa2aa)',Font:'800 8px ui-monospace,SFMono-Regular,Menlo,monospace',LetterSpacing:'.06em',Padding:'7px 8px',TextTransform:'uppercase'}),
    new Css.Rule('.acp-conversion-grid',{Display:'grid',GridTemplateColumns:'repeat(2,minmax(0,1fr))'}),
    new Css.Rule('.acp-conversion',{BorderBottom:'1px solid var(--acp-border,#3a4046)',Display:'grid',Gap:'2px',MinWidth:'0',Padding:'6px 8px'}),
    new Css.Rule('.acp-conversion:nth-child(odd)',{BorderRight:'1px solid var(--acp-border,#3a4046)'}),
    new Css.Rule('.acp-conversion b',{Color:'var(--acp-muted,#9aa2aa)',Font:'800 8px ui-monospace,SFMono-Regular,Menlo,monospace'}),
    new Css.Rule('.acp-conversion code',{Color:'var(--acp-text,#eef1f4)',Font:'8.5px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace',Overflow:'hidden',TextOverflow:'ellipsis',WhiteSpace:'nowrap'}),
    new Css.Rule('.acp-web',{Background:'var(--acp-bg2,#202428)',Display:'grid',Gap:'3px',GridColumn:'1/-1',Padding:'7px 8px'}),
    new Css.Rule('.acp-web code',{Color:'var(--acp-text,#eef1f4)',Font:'8.5px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace',OverflowWrap:'anywhere'}),
    new Css.Rule('.AriannaColorSpacePicker[theme="light"]',{Background:'#f5f6f7',BorderColor:'#bcc2c7',Color:'#25292d'}),
    new Css.Rule('.AriannaColorSpacePicker[theme="light"] .acp-head,.AriannaColorSpacePicker[theme="light"] .acp-conversions-head,.AriannaColorSpacePicker[theme="light"] .acp-web,.AriannaColorSpacePicker[theme="light"] .acp-canvas-wrap',{Background:'#fff'}),
    new Css.Rule('.AriannaColorSpacePicker[theme="light"] .acp-number',{Background:'#fff',Color:'#25292d'}),
]);

function applyTheme(host:HTMLElement):void {
    if(!host.hasAttribute('theme')) host.setAttribute('theme','dark');
    const light=host.getAttribute('theme')==='light';
    const vars=light
        ? {'--acp-bg':'#f5f6f7','--acp-bg2':'#ffffff','--acp-border':'#bcc2c7','--acp-text':'#25292d','--acp-muted':'#6a7279'}
        : {'--acp-bg':'#171a1d','--acp-bg2':'#202428','--acp-border':'#3a4046','--acp-text':'#eef1f4','--acp-muted':'#9aa2aa'};
    for(const [k,v] of Object.entries(vars)) host.style.setProperty(k,v);
}

function withAlpha(space:ColorSpace,value:any,alpha:number):any {
    const v={...value};
    if(space==='lab'||space==='oklab') v.alpha=alpha; else v.a=alpha;
    return v;
}

export abstract class ColorSpacePickerBase extends HTMLElement {
    public template=html``;
    protected abstract get Config():PickerConfig;

    public onCreated():void { if(this.isConnected) this.onConnected(); }
    public onConnected():void {
        this.classList.add('AriannaColorSpacePicker');
        applyTheme(this);
        const raw=this.getAttribute('value')||this.getAttribute('color');
        if(raw){const p=parseHex(raw);if(p){S(this).rgb={r:p.r,g:p.g,b:p.b,a:p.a};S(this).alpha=p.a??1;}}
        if(this.hasAttribute('alpha')) S(this).alpha=clamp01(Number(this.getAttribute('alpha')));
        this.Render();
    }
    public onAttributeChanged(name:string):void {
        if(!this.isConnected||S(this).internalAttributeWrite) return;
        if(name==='theme'){applyTheme(this);this.Render();return;}
        if(name==='value'||name==='color'){
            const p=parseHex(this.getAttribute(name)||'');
            if(p){S(this).rgb={r:p.r,g:p.g,b:p.b,a:p.a};S(this).alpha=p.a??S(this).alpha;this.Render();}
            return;
        }
        if(name==='alpha') { S(this).alpha=clamp01(Number(this.getAttribute('alpha'))); this.Render(); }
    }

    public get value():string { return rgbToHex({...S(this).rgb,a:S(this).alpha},true); }
    public set value(v:string) { this.setColor(v); }
    public getColor():RGB { return {...S(this).rgb,a:S(this).alpha}; }
    public getConversions():ColorConversions { return convertAll(this.getColor()); }
    public getSpaceValues():any { return fromRgb(this.Config.space,this.getColor()); }

    private writeAttributes():void {
        const s=S(this); s.internalAttributeWrite=true;
        try { this.setAttribute('value',rgbToHex({...s.rgb,a:s.alpha},true)); this.setAttribute('alpha',String(s.alpha)); }
        finally { s.internalAttributeWrite=false; }
    }
    public setColor(value:string|RGB):this {
        const rgb=typeof value==='string'?parseHex(value):value;
        if(!rgb) return this;
        S(this).rgb={r:clamp(rgb.r,0,255),g:clamp(rgb.g,0,255),b:clamp(rgb.b,0,255),a:rgb.a};
        if(rgb.a!=null) S(this).alpha=clamp01(rgb.a);
        this.writeAttributes(); this.Render(); this.Emit(); return this;
    }
    public setSpaceValues(patch:Record<string,number>):this {
        const current=this.getSpaceValues(); Object.assign(current,patch);
        const rgb=toRgb(this.Config.space,withAlpha(this.Config.space,current,S(this).alpha));
        S(this).rgb={r:clamp(rgb.r,0,255),g:clamp(rgb.g,0,255),b:clamp(rgb.b,0,255),a:S(this).alpha};
        this.writeAttributes(); this.Render(); this.Emit(); return this;
    }
    public setAlpha(value:number):this {
        S(this).alpha=clamp01(value); this.writeAttributes(); this.Render(); this.Emit(); return this;
    }

    private Emit():void {
        this.dispatchEvent(new CustomEvent('arianna:change',{bubbles:true,composed:true,detail:{space:this.Config.space,value:this.value,color:this.getColor(),spaceValues:this.getSpaceValues(),conversions:this.getConversions(),source:this}}));
    }

    private rangeGradient(channel:PickerChannel,current:any):string {
        const stops:string[]=[];
        for(let i=0;i<=12;i++){
            const v=channel.min+(channel.max-channel.min)*i/12;
            const p={...current,[channel.key]:v};
            const rgb=toRgb(this.Config.space,withAlpha(this.Config.space,p,1));
            stops.push(`rgb(${Math.round(clamp(rgb.r,0,255))} ${Math.round(clamp(rgb.g,0,255))} ${Math.round(clamp(rgb.b,0,255))}) ${i/12*100}%`);
        }
        return `linear-gradient(90deg,${stops.join(',')})`;
    }

    private conversionRows(c:ColorConversions):Array<[string,string]> {
        const a=clamp01(c.srgba.a);
        return [
            ['HEX',c.web.hex],
            ['sRGBA',`${fmt(c.srgba.r/255,4)}, ${fmt(c.srgba.g/255,4)}, ${fmt(c.srgba.b/255,4)}, ${fmt(a,4)}`],
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
        ];
    }

    private TrackPointer(start:PointerEvent, apply:(event:PointerEvent)=>void):void {
        const pointerId=start.pointerId;
        const move=(event:PointerEvent):void=>{ if(event.pointerId===pointerId) apply(event); };
        const stop=(event:PointerEvent):void=>{
            if(event.pointerId!==pointerId) return;
            window.removeEventListener('pointermove',move,true);
            window.removeEventListener('pointerup',stop,true);
            window.removeEventListener('pointercancel',stop,true);
        };
        apply(start);
        window.addEventListener('pointermove',move,true);
        window.addEventListener('pointerup',stop,true);
        window.addEventListener('pointercancel',stop,true);
    }

    private RangePointerValue(event:PointerEvent,rect:DOMRect,min:number,max:number,step:number):number {
        const t=clamp01((event.clientX-rect.left)/Math.max(1,rect.width));
        const raw=min+(max-min)*t;
        if(!(step>0)) return clamp(raw,min,max);
        const snapped=min+Math.round((raw-min)/step)*step;
        return clamp(snapped,min,max);
    }

    private Render():void {
        const cfg=this.Config,current=this.getSpaceValues(),conv=this.getConversions();
        const root=document.createElement('section');
        const head=document.createElement('header');head.className='acp-head';
        const title=document.createElement('strong');title.textContent=cfg.title;
        const chip=document.createElement('span');chip.className='acp-chip';
        const chipColor=document.createElement('span');chipColor.className='acp-chip-color';chipColor.style.background=conv.web.rgba;chip.appendChild(chipColor);
        head.append(title,chip);

        const body=document.createElement('div');body.className='acp-body';
        const main=document.createElement('div');main.className='acp-main';
        const cw=document.createElement('div');cw.className='acp-canvas-wrap';
        const canvas=document.createElement('canvas');canvas.className='acp-canvas';canvas.width=230;canvas.height=230;canvas.setAttribute('aria-label',`${cfg.title} visual picker`);
        const cursor=document.createElement('span');cursor.className='acp-cursor';cw.append(canvas,cursor);main.appendChild(cw);

        const sliders=document.createElement('div');sliders.className='acp-sliders';
        for(const ch of cfg.channels){
            const row=document.createElement('div');row.className='acp-slider-row';
            const lab=document.createElement('label');lab.textContent=ch.label;
            const range=document.createElement('input');range.type='range';range.min=String(ch.min);range.max=String(ch.max);range.step=String(ch.step);range.value=String(Number(current[ch.key]??ch.min));range.className='acp-range';range.style.setProperty('--range-bg',this.rangeGradient(ch,current));
            const num=document.createElement('input');num.type='number';num.min=String(ch.min);num.max=String(ch.max);num.step=String(ch.step);num.value=fmt(Number(current[ch.key]??ch.min),ch.decimals??2);num.className='acp-number';
            const unit=document.createElement('span');unit.className='acp-unit';unit.textContent=ch.unit??'';
            const apply=(raw:string)=>{const n=Number(raw);if(Number.isFinite(n))this.setSpaceValues({[ch.key]:clamp(n,ch.min,ch.max)});};
            range.oninput=()=>apply(range.value);
            range.onpointerdown=(event)=>{
                event.preventDefault();
                const rect=range.getBoundingClientRect();
                this.TrackPointer(event,(pointer)=>apply(String(this.RangePointerValue(pointer,rect,ch.min,ch.max,ch.step))));
            };
            num.onchange=()=>apply(num.value);row.append(lab,range,num,unit);sliders.appendChild(row);
        }
        const alpha=document.createElement('div');alpha.className='acp-slider-row acp-alpha';
        const al=document.createElement('label');al.textContent='A';
        const ar=document.createElement('input');ar.type='range';ar.min='0';ar.max='1';ar.step='.001';ar.value=String(S(this).alpha);ar.className='acp-range';ar.style.setProperty('--range-bg',`linear-gradient(90deg,rgba(0,0,0,0),${conv.web.hex})`);
        const an=document.createElement('input');an.type='number';an.min='0';an.max='1';an.step='.001';an.value=fmt(S(this).alpha,3);an.className='acp-number';
        const au=document.createElement('span');au.className='acp-unit';
        ar.oninput=()=>this.setAlpha(Number(ar.value));
        ar.onpointerdown=(event)=>{
            event.preventDefault();
            const rect=ar.getBoundingClientRect();
            this.TrackPointer(event,(pointer)=>this.setAlpha(this.RangePointerValue(pointer,rect,0,1,.001)));
        };
        an.onchange=()=>this.setAlpha(Number(an.value));alpha.append(al,ar,an,au);sliders.append(alpha);main.appendChild(sliders);body.appendChild(main);

        const conversions=document.createElement('section');conversions.className='acp-conversions';
        const chead=document.createElement('div');chead.className='acp-conversions-head';chead.textContent='Simultaneous conversions';
        const grid=document.createElement('div');grid.className='acp-conversion-grid';
        for(const [label,val] of this.conversionRows(conv)){
            const row=document.createElement('div');row.className='acp-conversion';row.innerHTML=`<b>${esc(label)}</b><code title="${esc(val)}">${esc(val)}</code>`;grid.appendChild(row);
        }
        const web=document.createElement('div');web.className='acp-web';
        web.innerHTML=`<code><b>WEB</b> ${esc(conv.web.hex)} · ${esc(conv.web.hexa)} · web-safe ${esc(conv.web.webSafe)}</code><code>${esc(conv.web.rgb)} · ${esc(conv.web.rgba)}</code><code>${esc(conv.web.hsl)} · ${esc(conv.web.hsla)}</code><code>${esc(conv.web.cssSrgb)}</code>`;
        grid.appendChild(web);conversions.append(chead,grid);body.appendChild(conversions);root.append(head,body);this.replaceChildren(root);

        this.positionCursor(cursor,current);this.draw(canvas,current);
        canvas.onpointerdown=(event)=>{
            event.preventDefault();
            const rect=canvas.getBoundingClientRect();
            this.TrackPointer(event,(pointer)=>this.pickCanvasRect(rect,pointer));
        };
    }

    private positionCursor(cursor:HTMLElement,current:any):void {
        const cfg=this.Config;let x=.5,y=.5;
        if(cfg.geometry==='wheel'){
            const h=Number(current[cfg.hue!])/360,s=clamp01(Number(current[cfg.saturation!])/100),ang=h*Math.PI*2-Math.PI/2;
            x=.5+Math.cos(ang)*s*.47;y=.5+Math.sin(ang)*s*.47;
        } else if(cfg.geometry==='square') {
            x=clamp01(Number(current[cfg.saturation!])/100);y=1-clamp01(Number(current[cfg.value!])/100);
        } else if(cfg.plane) {
            const a=cfg.channels.find(c=>c.key===cfg.plane![0])!,b=cfg.channels.find(c=>c.key===cfg.plane![1])!;
            x=(Number(current[a.key])-a.min)/(a.max-a.min);y=1-(Number(current[b.key])-b.min)/(b.max-b.min);
        }
        cursor.style.left=`${clamp01(x)*100}%`;cursor.style.top=`${clamp01(y)*100}%`;
    }

    private pickCanvasRect(r:DOMRect,e:PointerEvent):void {
        const cfg=this.Config,x=clamp01((e.clientX-r.left)/Math.max(1,r.width)),y=clamp01((e.clientY-r.top)/Math.max(1,r.height)),patch:Record<string,number>={};
        if(cfg.geometry==='wheel'){
            const dx=x-.5,dy=y-.5,rad=Math.min(1,Math.hypot(dx,dy)/.47);patch[cfg.hue!]=wrapDegrees(Math.atan2(dy,dx)*180/Math.PI+90);patch[cfg.saturation!]=rad*100;
        } else if(cfg.geometry==='square') {
            patch[cfg.saturation!]=x*100;patch[cfg.value!]=(1-y)*100;
        } else if(cfg.plane) {
            const a=cfg.channels.find(c=>c.key===cfg.plane![0])!,b=cfg.channels.find(c=>c.key===cfg.plane![1])!;patch[a.key]=a.min+x*(a.max-a.min);patch[b.key]=b.min+(1-y)*(b.max-b.min);
        }
        this.setSpaceValues(patch);
    }

    private draw(canvas:HTMLCanvasElement,current:any):void {
        if(Drawing.has(canvas))return;Drawing.add(canvas);
        requestAnimationFrame(()=>{
            try{
                if(!canvas.isConnected)return;
                const ctx=canvas.getContext('2d');if(!ctx)return;const w=canvas.width,h=canvas.height,img=ctx.createImageData(w,h),cfg=this.Config;
                for(let py=0;py<h;py++)for(let px=0;px<w;px++){
                    const x=px/(w-1),y=py/(h-1),v={...current};let visible=true;
                    if(cfg.geometry==='wheel'){
                        const dx=x-.5,dy=y-.5,rad=Math.hypot(dx,dy)/.47;if(rad>1)visible=false;else{v[cfg.hue!]=wrapDegrees(Math.atan2(dy,dx)*180/Math.PI+90);v[cfg.saturation!]=rad*100;}
                    } else if(cfg.geometry==='square') {
                        v[cfg.saturation!]=x*100;v[cfg.value!]=(1-y)*100;
                    } else if(cfg.plane) {
                        const a=cfg.channels.find(c=>c.key===cfg.plane![0])!,b=cfg.channels.find(c=>c.key===cfg.plane![1])!;v[a.key]=a.min+x*(a.max-a.min);v[b.key]=b.min+(1-y)*(b.max-b.min);
                    }
                    const i=(py*w+px)*4;if(!visible){img.data[i+3]=0;continue;}
                    const rgb=toRgb(cfg.space,withAlpha(cfg.space,v,1));img.data[i]=clamp(Math.round(rgb.r),0,255);img.data[i+1]=clamp(Math.round(rgb.g),0,255);img.data[i+2]=clamp(Math.round(rgb.b),0,255);img.data[i+3]=255;
                }
                ctx.putImageData(img,0,0);
            } finally { Drawing.delete(canvas); }
        });
    }
}
