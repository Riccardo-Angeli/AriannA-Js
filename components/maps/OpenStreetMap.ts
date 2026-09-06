/** @module components/maps/OpenStreetMap */
import { Component, Css } from '../../core/index.ts';

export interface LatLng { lat:number; lng:number; }
export type MapProvider = 'google' | 'osm' | 'apple' | 'maplibre';

const ATTRIBUTES=['center-lat','center-lng','zoom','marker','label','address','aspect-ratio','layer'] as const;
const OBSERVED=new Set<string>(ATTRIBUTES);

function centerLat(host:Element): number {
    const value=Number.parseFloat(host.getAttribute('center-lat') ?? '');
    return Number.isFinite(value) ? value : 41.8902102;
}

function centerLng(host:Element): number {
    const value=Number.parseFloat(host.getAttribute('center-lng') ?? '');
    return Number.isFinite(value) ? value : 12.4922309;
}

function zoom(host:Element): number {
    const value=Number.parseInt(host.getAttribute('zoom') ?? '13',10);
    return Math.max(1,Math.min(20,Number.isFinite(value) ? value : 13));
}

function marker(host:Element): boolean {
    return host.hasAttribute('marker') && host.getAttribute('marker') !== 'false';
}

function aspectRatio(host:Element): string {
    return host.getAttribute('aspect-ratio')?.trim() || '16/8';
}

function renderKey(host:Element): string {
    return ATTRIBUTES.map(name => `${name}=${host.getAttribute(name) ?? ''}`).join('|');
}

function ensureIdentity(host:HTMLElement,type:string): void {
    for(const cls of Array.from(host.classList))
        if(cls.startsWith('__real-')) host.classList.remove(cls);

    if(!host.classList.contains(type)) host.classList.add(type);
}

function frame(host:HTMLElement,type:string,provider:string,openUrl:string): HTMLDivElement {
    host.replaceChildren();

    const stage=document.createElement('div');
    stage.className=`${type}-Stage`;
    stage.style.aspectRatio=aspectRatio(host);

    const chrome=document.createElement('div');
    chrome.className=`${type}-Chrome`;

    const badge=document.createElement('span');
    badge.className=`${type}-Badge`;
    badge.textContent=provider;

    const open=document.createElement('a');
    open.className=`${type}-Open`;
    open.href=openUrl;
    open.target='_blank';
    open.rel='noopener';
    open.textContent='Open ↗';

    chrome.append(badge,open);
    host.appendChild(stage);
    host.appendChild(chrome);
    return stage;
}

function iframe(stage:HTMLElement,type:string,src:string,sandbox?:string): HTMLIFrameElement {
    const element=document.createElement('iframe');
    element.className=`${type}-Iframe`;
    element.src=src;
    element.loading='lazy';
    element.referrerPolicy='no-referrer-when-downgrade';
    element.allowFullscreen=true;
    element.setAttribute('frameborder','0');
    if(sandbox) element.setAttribute('sandbox',sandbox);
    stage.replaceChildren(element);
    return element;
}

function fallback(stage:HTMLElement,type:string,title:string,message:string,code?:string): HTMLDivElement {
    const box=document.createElement('div');
    box.className=`${type}-Fallback`;

    const icon=document.createElement('div');
    icon.className=`${type}-Fallback-Icon`;
    icon.textContent='⌖';

    const strong=document.createElement('strong');
    strong.textContent=title;

    const detail=document.createElement('span');
    detail.textContent=message;

    box.append(icon,strong,detail);
    if(code){
        const snippet=document.createElement('code');
        snippet.textContent=code;
        box.appendChild(snippet);
    }
    stage.replaceChildren(box);
    return box;
}


export namespace OpenStreetMap {
export const Styles = new Css.Stylesheet([
    new Css.Rule('.OpenStreetMap', {
        Background:'var(--arianna-bg,#ffffff)',
        Border:'1px solid var(--arianna-border,#d8d8d8)',
        BorderRadius:'var(--arianna-radius,6px)',
        BoxSizing:'border-box',
        Color:'var(--arianna-text,#1f2328)',
        Display:'flex',
        FlexDirection:'column',
        FontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        FontSize:'12px',
        MinHeight:'300px',
        Overflow:'hidden',
        Position:'relative',
        Width:'100%'
    }),
    new Css.Rule('.OpenStreetMap-Stage', {
        Background:'var(--arianna-bg-2,#f6f7f9)',
        MinHeight:'260px',
        Overflow:'hidden',
        Position:'relative',
        Width:'100%'
    }),
    new Css.Rule('.OpenStreetMap-Iframe', {
        Border:'0', Display:'block', Height:'100%', Inset:'0', Position:'absolute', Width:'100%'
    }),
    new Css.Rule('.OpenStreetMap-Chrome', {
        AlignItems:'center',
        Background:'var(--arianna-bg,#ffffff)',
        BorderTop:'1px solid var(--arianna-border,#d8d8d8)',
        Display:'flex',
        Flex:'0 0 auto',
        JustifyContent:'space-between',
        MinHeight:'36px',
        Padding:'5px 10px'
    }),
    new Css.Rule('.OpenStreetMap-Badge', {
        Background:'transparent',
        Border:'1px solid var(--arianna-border,#d8d8d8)',
        BorderRadius:'999px',
        Color:'var(--arianna-muted,#6e6b62)',
        Font:'600 10px ui-monospace,SFMono-Regular,Menlo,monospace',
        LetterSpacing:'.06em',
        Padding:'3px 8px',
        TextTransform:'uppercase'
    }),
    new Css.Rule('.OpenStreetMap-Open', {
        Background:'transparent',
        Border:'1px solid var(--arianna-border,#d8d8d8)',
        BorderRadius:'var(--arianna-radius,6px)',
        Color:'var(--arianna-text,#1f2328)',
        Font:'500 11px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        Padding:'5px 9px',
        TextDecoration:'none',
        Transition:'border-color .18s ease,color .18s ease,background .18s ease'
    }),
    new Css.Rule('.OpenStreetMap-Open:hover', {
        Background:'var(--arianna-bg-2,#f6f7f9)',
        BorderColor:'var(--arianna-primary,#e40c88)',
        Color:'var(--arianna-primary,#e40c88)'
    }),
    new Css.Rule('.OpenStreetMap-Fallback', {
        AlignItems:'center',
        Background:'var(--arianna-bg-2,#f6f7f9)',
        Color:'var(--arianna-muted,#6e6b62)',
        Display:'flex',
        FlexDirection:'column',
        Gap:'9px',
        Height:'100%',
        Inset:'0',
        JustifyContent:'center',
        Padding:'28px',
        Position:'absolute',
        TextAlign:'center'
    }),
    new Css.Rule('.OpenStreetMap-Fallback-Icon', {
        AlignItems:'center',
        Background:'var(--arianna-bg,#ffffff)',
        Border:'1px solid var(--arianna-border,#d8d8d8)',
        BorderRadius:'var(--arianna-radius,6px)',
        Color:'var(--arianna-primary,#e40c88)',
        Display:'flex',
        FontSize:'28px',
        Height:'52px',
        JustifyContent:'center',
        Width:'52px'
    }),
    new Css.Rule('.OpenStreetMap-Fallback strong', {
        Color:'var(--arianna-text,#1f2328)', FontSize:'14px'
    }),
    new Css.Rule('.OpenStreetMap-Fallback code', {
        Background:'var(--arianna-bg,#ffffff)',
        Border:'1px solid var(--arianna-border,#d8d8d8)',
        BorderRadius:'var(--arianna-radius,6px)',
        Color:'var(--arianna-text,#1f2328)',
        Padding:'6px 8px'
    })
]);

    @Component('arianna-osm-map', Styles, { Attributes:[...ATTRIBUTES], Shadow:false })
    export class OpenStreetMap extends HTMLElement {
        public static readonly Styles=Styles;
        declare private rendering:boolean;
        declare private lastRenderKey:string | undefined;

        onConnected(): void { this.rendering ??= false; this.lastRenderKey ??= undefined; this.render(); }
        onDisconnected(): void { this.rendering=false; }
        onAttributeChanged(name:string): void { if(this.isConnected && OBSERVED.has(name.toLowerCase())) this.render(); }

        getProvider(): MapProvider { return 'osm'; }
        getCenter(): LatLng { return {lat:centerLat(this),lng:centerLng(this)}; }
        getZoom(): number { return zoom(this); }
        setLocation(center:LatLng): this { this.setAttribute('center-lat',String(center.lat)); this.setAttribute('center-lng',String(center.lng)); return this; }
        setZoom(value:number): this { this.setAttribute('zoom',String(value)); return this; }
        reload(): this { this.render(true); return this; }

        private openUrl(): string {
            const lat=centerLat(this), lng=centerLng(this);
            return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom(this)}/${lat}/${lng}`;
        }

        private render(force=false): void {
            if(this.rendering) return;
            const key=renderKey(this);
            if(!force && key===this.lastRenderKey && this.firstElementChild) return;
            this.rendering=true;
            try {
                ensureIdentity(this,'OpenStreetMap');
                const stage=frame(this,'OpenStreetMap','OPENSTREETMAP',this.openUrl());
                const lat=centerLat(this), lng=centerLng(this), z=zoom(this);
                const span=0.6/Math.pow(2,z-8);
                const params=new URLSearchParams({bbox:[lng-span,lat-span/2,lng+span,lat+span/2].join(','),layer:this.getAttribute('layer')?.trim()||'mapnik'});
                if(marker(this)) params.set('marker',`${lat},${lng}`);
                iframe(stage,'OpenStreetMap',`https://www.openstreetmap.org/export/embed.html?${params.toString()}`,'allow-scripts allow-same-origin allow-popups');
                this.lastRenderKey=key;
            } finally { this.rendering=false; }
        }
    }
}

export const OpenStreetMapClass=OpenStreetMap.OpenStreetMap;
export default OpenStreetMap.OpenStreetMap;
