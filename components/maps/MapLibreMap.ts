/** @module components/maps/MapLibreMap */
import { Component, Css } from '../../core/index.ts';

export interface LatLng { lat:number; lng:number; }
export type MapProvider = 'google' | 'osm' | 'apple' | 'maplibre';
export const MapTypes={Standard:'standard',Satellite:'satellite',Hybrid:'hybrid',Terrain:'terrain'} as const;
export type MapType=typeof MapTypes[keyof typeof MapTypes];

const ATTRIBUTES=['center-lat','center-lng','zoom','marker','label','address','aspect-ratio','style-url','bearing','pitch','type','imagery-url','imagery-attribution','labels-url','labels-attribution','terrain-style-url'] as const;
const OBSERVED=new Set<string>(ATTRIBUTES);

function mapType(host:Element): MapType {
    const value=(host.getAttribute('type')||MapTypes.Standard).trim().toLowerCase();
    return value===MapTypes.Satellite || value===MapTypes.Hybrid || value===MapTypes.Terrain ? value : MapTypes.Standard;
}

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


type BrowserWindow=Window & typeof globalThis & { maplibregl?:any };
const Browser=():BrowserWindow=>window as BrowserWindow;
let loader:Promise<any>|null=null;

function defaultStyle(): Record<string,unknown> {
    return {version:8,sources:{osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap contributors'}},layers:[{id:'osm',type:'raster',source:'osm'}]};
}

function imageryStyle(host:Element): Record<string,unknown> | string {
    const styleUrl=host.getAttribute('style-url')?.trim();
    if(styleUrl) return styleUrl;
    if(mapType(host)===MapTypes.Terrain){
        const terrain=host.getAttribute('terrain-style-url')?.trim();
        if(terrain) return terrain;
    }
    const imagery=host.getAttribute('imagery-url')?.trim();
    if((mapType(host)===MapTypes.Satellite || mapType(host)===MapTypes.Hybrid) && imagery){
        const labels=host.getAttribute('labels-url')?.trim();
        const sources:Record<string,unknown>={imagery:{type:'raster',tiles:[imagery],tileSize:256,attribution:host.getAttribute('imagery-attribution')?.trim()||''}};
        const layers:Array<Record<string,unknown>>=[{id:'imagery',type:'raster',source:'imagery'}];
        if(mapType(host)===MapTypes.Hybrid && labels){
            sources.labels={type:'raster',tiles:[labels],tileSize:256,attribution:host.getAttribute('labels-attribution')?.trim()||''};
            layers.push({id:'labels',type:'raster',source:'labels'});
        }
        return {version:8,sources,layers};
    }
    return defaultStyle();
}

function loadMapLibre(): Promise<any> {
    if(Browser().maplibregl) return Promise.resolve(Browser().maplibregl);
    if(loader) return loader;
    loader=new Promise((resolve,reject)=>{
        if(!document.querySelector('link[data-arianna-maplibre]')){
            const link=document.createElement('link');
            link.rel='stylesheet'; link.href='https://unpkg.com/maplibre-gl@5.7.1/dist/maplibre-gl.css'; link.dataset.ariannaMaplibre='true'; document.head.appendChild(link);
        }
        const done=()=>Browser().maplibregl ? resolve(Browser().maplibregl) : reject(new Error('MapLibre loaded without maplibregl global'));
        const existing=document.querySelector<HTMLScriptElement>('script[data-arianna-maplibre]');
        if(existing){
            if(Browser().maplibregl){ done(); return; }
            existing.addEventListener('load',done,{once:true});
            existing.addEventListener('error',()=>reject(new Error('MapLibre failed to load')),{once:true});
            return;
        }
        const script=document.createElement('script');
        script.src='https://unpkg.com/maplibre-gl@5.7.1/dist/maplibre-gl.js'; script.dataset.ariannaMaplibre='true'; script.onload=done; script.onerror=()=>reject(new Error('MapLibre failed to load')); document.head.appendChild(script);
    });
    return loader;
}

export namespace MapLibreMap {
export const Styles = new Css.Stylesheet([
    new Css.Rule('.MapLibreMap', {
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
    new Css.Rule('.MapLibreMap-Stage', {
        Background:'var(--arianna-bg-2,#f6f7f9)',
        MinHeight:'260px',
        Overflow:'hidden',
        Position:'relative',
        Width:'100%'
    }),
    new Css.Rule('.MapLibreMap-Iframe', {
        Border:'0', Display:'block', Height:'100%', Inset:'0', Position:'absolute', Width:'100%'
    }),
    new Css.Rule('.MapLibreMap-Chrome', {
        AlignItems:'center',
        Background:'var(--arianna-bg,#ffffff)',
        BorderTop:'1px solid var(--arianna-border,#d8d8d8)',
        Display:'flex',
        Flex:'0 0 auto',
        JustifyContent:'space-between',
        MinHeight:'36px',
        Padding:'5px 10px'
    }),
    new Css.Rule('.MapLibreMap-Badge', {
        Background:'transparent',
        Border:'1px solid var(--arianna-border,#d8d8d8)',
        BorderRadius:'999px',
        Color:'var(--arianna-muted,#6e6b62)',
        Font:'600 10px ui-monospace,SFMono-Regular,Menlo,monospace',
        LetterSpacing:'.06em',
        Padding:'3px 8px',
        TextTransform:'uppercase'
    }),
    new Css.Rule('.MapLibreMap-Open', {
        Background:'transparent',
        Border:'1px solid var(--arianna-border,#d8d8d8)',
        BorderRadius:'var(--arianna-radius,6px)',
        Color:'var(--arianna-text,#1f2328)',
        Font:'500 11px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        Padding:'5px 9px',
        TextDecoration:'none',
        Transition:'border-color .18s ease,color .18s ease,background .18s ease'
    }),
    new Css.Rule('.MapLibreMap-Open:hover', {
        Background:'var(--arianna-bg-2,#f6f7f9)',
        BorderColor:'var(--arianna-primary,#e40c88)',
        Color:'var(--arianna-primary,#e40c88)'
    }),
    new Css.Rule('.MapLibreMap-Fallback', {
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
    new Css.Rule('.MapLibreMap-Fallback-Icon', {
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
    new Css.Rule('.MapLibreMap-Fallback strong', {
        Color:'var(--arianna-text,#1f2328)', FontSize:'14px'
    }),
    new Css.Rule('.MapLibreMap-Fallback code', {
        Background:'var(--arianna-bg,#ffffff)',
        Border:'1px solid var(--arianna-border,#d8d8d8)',
        BorderRadius:'var(--arianna-radius,6px)',
        Color:'var(--arianna-text,#1f2328)',
        Padding:'6px 8px'
    })
]);
    export const MapStyles = new Css.Stylesheet([
        new Css.Rule('.MapLibreMap-Map',{Height:'100%',Position:'absolute',Width:'100%'}),
        new Css.Rule('.MapLibreMap .maplibregl-map',{Height:'100%',Position:'absolute',Width:'100%'}),
        new Css.Rule('.MapLibreMap .maplibregl-canvas',{Outline:'none'})
    ]);

    @Component('arianna-maplibre-map', new Css.Stylesheet([...Styles.Rules,...MapStyles.Rules]), { Attributes:[...ATTRIBUTES], Shadow:false })
    export class MapLibreMap extends HTMLElement {
        public static readonly Styles=new Css.Stylesheet([...Styles.Rules,...MapStyles.Rules]);
        declare private instance:any;
        declare private renderVersion:number;
        declare private lastRenderKey:string | undefined;

        onConnected(): void { this.instance ??= null; this.renderVersion ??= 0; this.lastRenderKey ??= undefined; void this.render(); }
        onDisconnected(): void { ++this.renderVersion; try { this.instance?.remove?.(); } catch {} this.instance=null; this.lastRenderKey=undefined; }
        onAttributeChanged(name:string): void { if(this.isConnected && OBSERVED.has(name.toLowerCase())) void this.render(); }

        getProvider(): MapProvider { return 'maplibre'; }
        getCenter(): LatLng { return {lat:centerLat(this),lng:centerLng(this)}; }
        getZoom(): number { return zoom(this); }
        get Type(): MapType { return mapType(this); }
        set Type(value:MapType) { this.setAttribute('type',value); }
        setLocation(center:LatLng): this { this.setAttribute('center-lat',String(center.lat)); this.setAttribute('center-lng',String(center.lng)); return this; }
        setZoom(value:number): this { this.setAttribute('zoom',String(value)); return this; }
        reload(): this { void this.render(true); return this; }

        private openUrl(): string { return `https://www.openstreetmap.org/#map=${zoom(this)}/${centerLat(this)}/${centerLng(this)}`; }
        private async render(force=false): Promise<void> {
            const key=renderKey(this);
            if(!force && key===this.lastRenderKey && this.firstElementChild) return;
            const version=++this.renderVersion;
            ensureIdentity(this,'MapLibreMap');
            const stage=frame(this,'MapLibreMap','MAPLIBRE',this.openUrl());
            const suppliedStyle=this.getAttribute('style-url')?.trim();
            const suppliedImagery=this.getAttribute('imagery-url')?.trim();
            const suppliedTerrain=this.getAttribute('terrain-style-url')?.trim();
            if((this.Type===MapTypes.Satellite || this.Type===MapTypes.Hybrid) && !suppliedStyle && !suppliedImagery){
                try { this.instance?.remove?.(); } catch {}
                this.instance=null;
                fallback(stage,'MapLibreMap','Photographic source required','Set imagery-url or style-url to a licensed imagery source.','map.Type = "satellite"');
                this.lastRenderKey=key;
                return;
            }
            if(this.Type===MapTypes.Terrain && !suppliedStyle && !suppliedTerrain){
                try { this.instance?.remove?.(); } catch {}
                this.instance=null;
                fallback(stage,'MapLibreMap','Terrain style required','Set terrain-style-url or style-url.','map.Type = "terrain"');
                this.lastRenderKey=key;
                return;
            }
            const host=document.createElement('div'); host.className='MapLibreMap-Map'; stage.replaceChildren(host);
            try {
                const gl=await loadMapLibre();
                if(!this.isConnected || version!==this.renderVersion) return;
                try { this.instance?.remove?.(); } catch {}
                this.instance=new gl.Map({container:host,style:imageryStyle(this),center:[centerLng(this),centerLat(this)],zoom:zoom(this),bearing:Number(this.getAttribute('bearing')||0),pitch:Number(this.getAttribute('pitch')||0)});
                this.instance.addControl?.(new gl.NavigationControl(),'top-right');
                if(marker(this) && gl.Marker) new gl.Marker({color:'#e40c88'}).setLngLat([centerLng(this),centerLat(this)]).addTo(this.instance);
                this.lastRenderKey=key;
            } catch(error) {
                if(version!==this.renderVersion) return;
                fallback(stage,'MapLibreMap','MapLibre',error instanceof Error?error.message:String(error));
                this.lastRenderKey=key;
            }
        }
    }
}

export const MapLibreMapClass=MapLibreMap.MapLibreMap;
export default MapLibreMap.MapLibreMap;
