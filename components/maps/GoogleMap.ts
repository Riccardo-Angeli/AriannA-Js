/** @module components/maps/GoogleMap */
import { Component, Css } from '../../core/index.ts';

export interface LatLng { lat:number; lng:number; }
export type MapProvider = 'google' | 'osm' | 'apple' | 'maplibre';
export const MapTypes={Standard:'standard',Satellite:'satellite',Hybrid:'hybrid',Terrain:'terrain'} as const;
export type MapType=typeof MapTypes[keyof typeof MapTypes];

const ATTRIBUTES=['center-lat','center-lng','zoom','marker','label','address','aspect-ratio','api-key','mode','origin','destination','type'] as const;
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

type BrowserWindow=Window & typeof globalThis & { google?:any; __ariannaGoogleMapsLoaded?:()=>void; };
const Browser=():BrowserWindow=>window as BrowserWindow;
let loader:Promise<any>|null=null;

function loadGoogleMaps(key:string): Promise<any> {
    if(Browser().google?.maps) return Promise.resolve(Browser().google);
    if(loader) return loader;
    loader=new Promise((resolve,reject)=>{
        const done=()=>Browser().google?.maps ? resolve(Browser().google) : reject(new Error('Google Maps loaded without google.maps'));
        const existing=document.querySelector<HTMLScriptElement>('script[data-arianna-google-maps]');
        if(existing){
            if(Browser().google?.maps){ done(); return; }
            existing.addEventListener('load',done,{once:true});
            existing.addEventListener('error',()=>reject(new Error('Google Maps failed to load')),{once:true});
            return;
        }
        Browser().__ariannaGoogleMapsLoaded=done;
        const script=document.createElement('script');
        script.dataset.ariannaGoogleMaps='true';
        script.src=`https://maps.googleapis.com/maps/api/js?${new URLSearchParams({key,callback:'__ariannaGoogleMapsLoaded',loading:'async',v:'weekly'}).toString()}`;
        script.async=true;
        script.onerror=()=>reject(new Error('Google Maps failed to load'));
        document.head.appendChild(script);
    });
    return loader;
}


export namespace GoogleMap {
export const Styles = new Css.Stylesheet([
    new Css.Rule('.GoogleMap', {
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
    new Css.Rule('.GoogleMap-Stage', {
        Background:'var(--arianna-bg-2,#f6f7f9)',
        MinHeight:'260px',
        Overflow:'hidden',
        Position:'relative',
        Width:'100%'
    }),
    new Css.Rule('.GoogleMap-Iframe', {
        Border:'0', Display:'block', Height:'100%', Inset:'0', Position:'absolute', Width:'100%'
    }),
    new Css.Rule('.GoogleMap-Map', {
        Height:'100%', Inset:'0', Position:'absolute', Width:'100%'
    }),
    new Css.Rule('.GoogleMap-Chrome', {
        AlignItems:'center',
        Background:'var(--arianna-bg,#ffffff)',
        BorderTop:'1px solid var(--arianna-border,#d8d8d8)',
        Display:'flex',
        Flex:'0 0 auto',
        JustifyContent:'space-between',
        MinHeight:'36px',
        Padding:'5px 10px'
    }),
    new Css.Rule('.GoogleMap-Badge', {
        Background:'transparent',
        Border:'1px solid var(--arianna-border,#d8d8d8)',
        BorderRadius:'999px',
        Color:'var(--arianna-muted,#6e6b62)',
        Font:'600 10px ui-monospace,SFMono-Regular,Menlo,monospace',
        LetterSpacing:'.06em',
        Padding:'3px 8px',
        TextTransform:'uppercase'
    }),
    new Css.Rule('.GoogleMap-Open', {
        Background:'transparent',
        Border:'1px solid var(--arianna-border,#d8d8d8)',
        BorderRadius:'var(--arianna-radius,6px)',
        Color:'var(--arianna-text,#1f2328)',
        Font:'500 11px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        Padding:'5px 9px',
        TextDecoration:'none',
        Transition:'border-color .18s ease,color .18s ease,background .18s ease'
    }),
    new Css.Rule('.GoogleMap-Open:hover', {
        Background:'var(--arianna-bg-2,#f6f7f9)',
        BorderColor:'var(--arianna-primary,#e40c88)',
        Color:'var(--arianna-primary,#e40c88)'
    }),
    new Css.Rule('.GoogleMap-Fallback', {
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
    new Css.Rule('.GoogleMap-Fallback-Icon', {
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
    new Css.Rule('.GoogleMap-Fallback strong', {
        Color:'var(--arianna-text,#1f2328)', FontSize:'14px'
    }),
    new Css.Rule('.GoogleMap-Fallback code', {
        Background:'var(--arianna-bg,#ffffff)',
        Border:'1px solid var(--arianna-border,#d8d8d8)',
        BorderRadius:'var(--arianna-radius,6px)',
        Color:'var(--arianna-text,#1f2328)',
        Padding:'6px 8px'
    })
]);

    @Component('arianna-google-map', Styles, { Attributes:[...ATTRIBUTES], Shadow:false })
    export class GoogleMap extends HTMLElement {
        public static readonly Styles=Styles;
        declare private instance:any;
        declare private renderVersion:number;
        declare private lastRenderKey:string | undefined;

        onConnected(): void { this.instance ??= null; this.renderVersion ??= 0; this.lastRenderKey ??= undefined; void this.render(); }
        onDisconnected(): void { ++this.renderVersion; this.instance=null; this.lastRenderKey=undefined; }
        onAttributeChanged(name:string): void { if(this.isConnected && OBSERVED.has(name.toLowerCase())) void this.render(); }

        getProvider(): MapProvider { return 'google'; }
        getCenter(): LatLng { return {lat:centerLat(this),lng:centerLng(this)}; }
        getZoom(): number { return zoom(this); }
        get Type(): MapType { return mapType(this); }
        set Type(value:MapType) { this.setAttribute('type',value); }
        setLocation(center:LatLng): this { this.setAttribute('center-lat',String(center.lat)); this.setAttribute('center-lng',String(center.lng)); return this; }
        setZoom(value:number): this { this.setAttribute('zoom',String(value)); return this; }
        reload(): this { void this.render(true); return this; }

        private openUrl(): string {
            const address=this.getAttribute('address')?.trim();
            if(address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
            return `https://www.google.com/maps/@${centerLat(this)},${centerLng(this)},${zoom(this)}z`;
        }

        private async render(force=false): Promise<void> {
            const key=renderKey(this);
            if(!force && key===this.lastRenderKey && this.firstElementChild) return;
            const version=++this.renderVersion;
            ensureIdentity(this,'GoogleMap');
            const stage=frame(this,'GoogleMap','GOOGLE',this.openUrl());
            const apiKey=this.getAttribute('api-key')?.trim()||'';
            const mode=(this.getAttribute('mode')??'place').toLowerCase();
            const interactiveType=this.Type!==MapTypes.Standard && (mode==='place'||mode==='view');
            if(!apiKey || !interactiveType){
                this.instance=null;
                iframe(stage,'GoogleMap',this.embedUrl());
                this.lastRenderKey=key;
                return;
            }
            const host=document.createElement('div');
            host.className='GoogleMap-Map';
            stage.replaceChildren(host);
            try {
                const google=await loadGoogleMaps(apiKey);
                if(!this.isConnected || version!==this.renderVersion) return;
                const center={lat:centerLat(this),lng:centerLng(this)};
                this.instance=new google.maps.Map(host,{center,zoom:zoom(this),mapTypeId:this.Type==='standard'?'roadmap':this.Type});
                if(marker(this) && google.maps.Marker) new google.maps.Marker({map:this.instance,position:center,title:this.getAttribute('label')||''});
                this.lastRenderKey=key;
            } catch(error) {
                if(version!==this.renderVersion) return;
                fallback(stage,'GoogleMap','Google Maps',error instanceof Error?error.message:String(error));
                this.lastRenderKey=key;
            }
        }

        private embedUrl(): string {
            const key=this.getAttribute('api-key')?.trim();
            if(key) return this.officialUrl(key);
            const address=this.getAttribute('address')?.trim();
            const query=address || `${centerLat(this)},${centerLng(this)}`;
            const codes:Record<MapType,string>={standard:'m',satellite:'k',hybrid:'h',terrain:'p'};
            return `https://www.google.com/maps?${new URLSearchParams({q:query,z:String(zoom(this)),t:codes[this.Type],output:'embed'}).toString()}`;
        }

        private officialUrl(key:string): string {
            const mode=(this.getAttribute('mode') ?? 'place').toLowerCase();
            const lat=centerLat(this), lng=centerLng(this), z=zoom(this);
            const address=this.getAttribute('address')?.trim() || `${lat},${lng}`;
            const params=new URLSearchParams({key});
            switch(mode){
                case 'view': params.set('center',`${lat},${lng}`); params.set('zoom',String(z)); break;
                case 'streetview': params.set('location',`${lat},${lng}`); break;
                case 'search': params.set('q',address); break;
                case 'directions': params.set('origin',this.getAttribute('origin')?.trim()||`${lat},${lng}`); params.set('destination',this.getAttribute('destination')?.trim()||address); break;
                default: params.set('q',address); params.set('zoom',String(z)); break;
            }
            return `https://www.google.com/maps/embed/v1/${mode}?${params.toString()}`;
        }
    }
}

export const GoogleMapClass=GoogleMap.GoogleMap;
export default GoogleMap.GoogleMap;
