/** @module components/maps/AppleMap */
import { Component, Css } from '../../core/index.ts';

export interface LatLng { lat:number; lng:number; }
export type MapProvider = 'google' | 'osm' | 'apple' | 'maplibre';

const ATTRIBUTES=['center-lat','center-lng','zoom','marker','label','address','aspect-ratio','mapkit-token'] as const;
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


type BrowserWindow=Window & typeof globalThis & { mapkit?:any; ARIANNA_MAPKIT_TOKEN?:string; __ariannaMapKitLoaded?:()=>void; };
const Browser=():BrowserWindow=>window as BrowserWindow;
let loader:Promise<any>|null=null;

function loadMapKit(token:string): Promise<any> {
    if(Browser().mapkit) return Promise.resolve(Browser().mapkit);
    if(loader) return loader;
    loader=new Promise((resolve,reject)=>{
        const done=()=>Browser().mapkit ? resolve(Browser().mapkit) : reject(new Error('MapKit JS loaded without mapkit global'));
        const existing=document.querySelector<HTMLScriptElement>('script[data-arianna-mapkit]');
        if(existing){
            if(Browser().mapkit){ done(); return; }
            existing.addEventListener('load',done,{once:true});
            existing.addEventListener('error',()=>reject(new Error('MapKit JS failed to load')),{once:true});
            return;
        }
        const script=document.createElement('script');
        script.dataset.ariannaMapkit='true';
        script.src='https://cdn.apple-mapkit.com/mk/6.x.x/mapkit.core.js';
        script.crossOrigin='anonymous';
        script.dataset.libraries='map';
        script.dataset.callback='__ariannaMapKitLoaded';
        Browser().__ariannaMapKitLoaded=done;
        script.onerror=()=>reject(new Error('MapKit JS failed to load'));
        document.head.appendChild(script);
    });
    return loader.then((mapkit:any)=>{ try { mapkit.init({authorizationCallback:(done:(value:string)=>void)=>done(token)}); } catch {} return mapkit; });
}

export namespace AppleMap {
export const Styles = new Css.Stylesheet([
    new Css.Rule('.AppleMap', {
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
    new Css.Rule('.AppleMap-Stage', {
        Background:'var(--arianna-bg-2,#f6f7f9)',
        MinHeight:'260px',
        Overflow:'hidden',
        Position:'relative',
        Width:'100%'
    }),
    new Css.Rule('.AppleMap-Iframe', {
        Border:'0', Display:'block', Height:'100%', Inset:'0', Position:'absolute', Width:'100%'
    }),
    new Css.Rule('.AppleMap-Chrome', {
        AlignItems:'center',
        Background:'var(--arianna-bg,#ffffff)',
        BorderTop:'1px solid var(--arianna-border,#d8d8d8)',
        Display:'flex',
        Flex:'0 0 auto',
        JustifyContent:'space-between',
        MinHeight:'36px',
        Padding:'5px 10px'
    }),
    new Css.Rule('.AppleMap-Badge', {
        Background:'transparent',
        Border:'1px solid var(--arianna-border,#d8d8d8)',
        BorderRadius:'999px',
        Color:'var(--arianna-muted,#6e6b62)',
        Font:'600 10px ui-monospace,SFMono-Regular,Menlo,monospace',
        LetterSpacing:'.06em',
        Padding:'3px 8px',
        TextTransform:'uppercase'
    }),
    new Css.Rule('.AppleMap-Open', {
        Background:'transparent',
        Border:'1px solid var(--arianna-border,#d8d8d8)',
        BorderRadius:'var(--arianna-radius,6px)',
        Color:'var(--arianna-text,#1f2328)',
        Font:'500 11px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        Padding:'5px 9px',
        TextDecoration:'none',
        Transition:'border-color .18s ease,color .18s ease,background .18s ease'
    }),
    new Css.Rule('.AppleMap-Open:hover', {
        Background:'var(--arianna-bg-2,#f6f7f9)',
        BorderColor:'var(--arianna-primary,#e40c88)',
        Color:'var(--arianna-primary,#e40c88)'
    }),
    new Css.Rule('.AppleMap-Fallback', {
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
    new Css.Rule('.AppleMap-Fallback-Icon', {
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
    new Css.Rule('.AppleMap-Fallback strong', {
        Color:'var(--arianna-text,#1f2328)', FontSize:'14px'
    }),
    new Css.Rule('.AppleMap-Fallback code', {
        Background:'var(--arianna-bg,#ffffff)',
        Border:'1px solid var(--arianna-border,#d8d8d8)',
        BorderRadius:'var(--arianna-radius,6px)',
        Color:'var(--arianna-text,#1f2328)',
        Padding:'6px 8px'
    })
]);

    @Component('arianna-apple-map', Styles, { Attributes:[...ATTRIBUTES], Shadow:false })
    export class AppleMap extends HTMLElement {
        public static readonly Styles=Styles;
        declare private instance:any;
        declare private renderVersion:number;
        declare private lastRenderKey:string | undefined;

        onConnected(): void { this.instance ??= null; this.renderVersion ??= 0; this.lastRenderKey ??= undefined; void this.render(); }
        onDisconnected(): void { ++this.renderVersion; try { this.instance?.destroy?.(); } catch {} this.instance=null; this.lastRenderKey=undefined; }
        onAttributeChanged(name:string): void { if(this.isConnected && OBSERVED.has(name.toLowerCase())) void this.render(); }

        getProvider(): MapProvider { return 'apple'; }
        getCenter(): LatLng { return {lat:centerLat(this),lng:centerLng(this)}; }
        getZoom(): number { return zoom(this); }
        setLocation(center:LatLng): this { this.setAttribute('center-lat',String(center.lat)); this.setAttribute('center-lng',String(center.lng)); return this; }
        setZoom(value:number): this { this.setAttribute('zoom',String(value)); return this; }
        reload(): this { void this.render(true); return this; }

        private token(): string { return this.getAttribute('mapkit-token')?.trim() || Browser().ARIANNA_MAPKIT_TOKEN || ''; }
        private openUrl(): string { const address=this.getAttribute('address')?.trim(); if(address) return `https://maps.apple.com/?q=${encodeURIComponent(address)}`; return `https://maps.apple.com/?ll=${centerLat(this)},${centerLng(this)}&z=${zoom(this)}`; }

        private async render(force=false): Promise<void> {
            const key=renderKey(this);
            if(!force && key===this.lastRenderKey && this.firstElementChild) return;
            const version=++this.renderVersion;
            ensureIdentity(this,'AppleMap');
            const stage=frame(this,'AppleMap','APPLE MAPS',this.openUrl());
            const token=this.token();
            if(!token){
                try { this.instance?.destroy?.(); } catch {}
                this.instance=null;
                fallback(stage,'AppleMap','Apple Maps','MapKit JS requires an Apple Maps token.','window.ARIANNA_MAPKIT_TOKEN = "…"');
                this.lastRenderKey=key;
                return;
            }
            const host=document.createElement('div');
            host.className='AppleMap-MapKit-Host';
            Object.assign(host.style,{position:'absolute',inset:'0'});
            stage.replaceChildren(host);
            try {
                const mapkit=await loadMapKit(token);
                if(!this.isConnected || version!==this.renderVersion) return;
                const center=new mapkit.Coordinate(centerLat(this),centerLng(this));
                const span=Math.max(.002,1/Math.pow(2,zoom(this)-7));
                const region=new mapkit.CoordinateRegion(center,new mapkit.CoordinateSpan(span,span));
                try { this.instance?.destroy?.(); } catch {}
                this.instance=new mapkit.Map(host,{region,showsCompass:mapkit.FeatureVisibility?.Adaptive,showsZoomControl:true});
                if(marker(this) && mapkit.MarkerAnnotation){
                    const annotation=new mapkit.MarkerAnnotation(center,{title:this.getAttribute('label')||''});
                    this.instance.addAnnotation?.(annotation);
                }
                this.lastRenderKey=key;
            } catch(error) {
                if(version!==this.renderVersion) return;
                fallback(stage,'AppleMap','Apple Maps',error instanceof Error?error.message:String(error));
                this.lastRenderKey=key;
            }
        }
    }
}

export const AppleMapClass=AppleMap.AppleMap;
export default AppleMap.AppleMap;
