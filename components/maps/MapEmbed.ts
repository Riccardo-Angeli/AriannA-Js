// components/maps/MapEmbed.ts
//
// MapEmbed family — iframe-based map embedders with a unified API.
// Each provider builds its own embed URL from a common set of options
// (center, zoom, marker), so apps can swap providers transparently.
//
// Providers:
//   • GoogleMap        — embed.google.com (no API key for the basic embed)
//   • OpenStreetMap    — openstreetmap.org/export/embed.html
//   • AppleMap         — maps.apple.com (renders only on Apple platforms;
//                        elsewhere shows a deep-link fallback card)
//   • BingMap          — bing.com/maps/embed (Microsoft Maps)
//
// All four extend MapEmbed and share .setLocation(), .setZoom(),
// .setMarker(), .reload(), .getProvider().

import { Control } from '../core/Control';

// ── Local typed view of the Control base class ──────────────────────────────
// We don't depend on Control's own TS typings here (which vary across the
// project tree); we declare the runtime contract we know exists, then cast
// `this` to it whenever we touch an inherited member. Zero runtime cost.
type ControlBase = Control & {
    el        : HTMLElement;
    _get<T = unknown>(key: string, fallback?: T): T;
    _emit(type: string, detail?: unknown, ev?: Event): void;
    _build(): void;
};

export interface LatLng { lat: number; lng: number; }

export interface MapEmbedOptions {
    /** Map center; default Greenwich (51.4779, -0.0015). */
    center?  : LatLng;
    /** Zoom level (1–20); default 13. */
    zoom?    : number;
    /** Place a marker at `center`. */
    marker?  : boolean;
    /** Optional text label shown over the marker (provider-dependent). */
    label?   : string;
    /** Optional human address (some providers prefer it to lat/lng). */
    address? : string;
    /** Aspect ratio; default '16/9'. Use 'square' or e.g. '4/3'. */
    aspectRatio?: string;
    /** Extra CSS class on the root. */
    class?   : string;
}

export type MapProvider = 'google' | 'osm' | 'apple' | 'bing';

export abstract class MapEmbed extends Control {
    protected _iframe!: HTMLIFrameElement;
    protected _center : LatLng;
    protected _zoom   : number;
    protected _marker : boolean;

    constructor(container: HTMLElement | string, opts: MapEmbedOptions) {
        super(container as HTMLElement, 'div', {
            center     : { lat: 51.4779, lng: -0.0015 },
            zoom       : 13,
            marker     : true,
            aspectRatio: '16/9',
            ...opts,
        });
        const self = this as unknown as ControlBase;
        this._center = self._get<LatLng>('center', { lat: 51.4779, lng: -0.0015 });
        this._zoom   = self._get<number>('zoom', 13);
        this._marker = self._get<boolean>('marker', true);
        self.el.className = `ar-map ar-map--${this.getProvider()}${opts.class ? ' ' + opts.class : ''}`;
        this._injectStyles();
        this._build();
    }

    // ── Abstract — each provider builds its own URL ────────────────────────
    abstract getProvider(): MapProvider;
    protected abstract _embedUrl(): string;

    // ── Public API ─────────────────────────────────────────────────────────
    setLocation(center: LatLng): this { this._center = { ...center }; this._refresh(); return this; }
    setZoom(z: number)         : this { this._zoom = Math.max(1, Math.min(20, z)); this._refresh(); return this; }
    setMarker(on: boolean)     : this { this._marker = on; this._refresh(); return this; }
    reload()                   : this { this._refresh(); return this; }
    getCenter()                : LatLng { return { ...this._center }; }
    getZoom()                  : number { return this._zoom; }

    // ── Build + refresh ────────────────────────────────────────────────────
    _build(): void {
        const self = this as unknown as ControlBase;
        const aspect = self._get<string>('aspectRatio', '16/9');
        self.el.innerHTML = `
<div class="ar-map__stage" style="aspect-ratio:${aspect}">
  <iframe class="ar-map__iframe"
          data-r="iframe"
          frameborder="0"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen></iframe>
</div>
<div class="ar-map__chrome">
  <span class="ar-map__badge">${this.getProvider().toUpperCase()}</span>
  <a class="ar-map__open" data-r="open" target="_blank" rel="noopener">Open ↗</a>
</div>`;
        this._iframe = self.el.querySelector('[data-r="iframe"]') as HTMLIFrameElement;
        this._refresh();
    }

    protected _refresh(): void {
        if (!this._iframe) return;
        const self = this as unknown as ControlBase;
        this._iframe.src = this._embedUrl();
        const open = self.el.querySelector('[data-r="open"]') as HTMLAnchorElement | null;
        if (open) open.href = this._openUrl();
    }

    /** Public link in a new tab; subclasses may override. */
    protected _openUrl(): string {
        const { lat, lng } = this._center;
        return `https://www.google.com/maps/@${lat},${lng},${this._zoom}z`;
    }

    protected _injectStyles(): void {
        if (document.getElementById('ar-map-styles')) return;
        const s = document.createElement('style');
        s.id = 'ar-map-styles';
        s.textContent = `
.ar-map { position:relative; display:flex; flex-direction:column; background:#1e1e1e; border:1px solid #333; border-radius:8px; overflow:hidden; color:#d4d4d4; font:12px -apple-system,system-ui,sans-serif; }
.ar-map__stage { position:relative; background:#0d0d0d; min-height:200px; }
.ar-map__iframe { width:100%; height:100%; border:0; display:block; }
.ar-map__chrome { display:flex; align-items:center; justify-content:space-between; padding:6px 10px; background:#161616; border-top:1px solid #333; }
.ar-map__badge  { font:10px ui-monospace,monospace; letter-spacing:.08em; color:#e40c88; text-transform:uppercase; padding:2px 8px; border:1px solid rgba(228,12,136,.4); border-radius:10px; }
.ar-map__open   { font:11px sans-serif; color:#d4d4d4; text-decoration:none; padding:3px 8px; border:1px solid #333; border-radius:3px; }
.ar-map__open:hover { background:#2a2a2a; }
.ar-map__fallback { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:24px; text-align:center; color:#888; }
.ar-map__fallback a { color:#e40c88; text-decoration:none; font-weight:600; }
@media (max-width: 600px) {
  .ar-map__stage { min-height:160px; }
  .ar-map__chrome { padding:4px 8px; }
  .ar-map__badge  { font-size:9px; padding:1px 6px; }
}
`;
        document.head.appendChild(s);
    }
}

// ──────────────────────────────────────────────────────────────────────────
// GoogleMap — uses google.com/maps?output=embed (no API key required)
// ──────────────────────────────────────────────────────────────────────────
export class GoogleMap extends MapEmbed {
    getProvider(): MapProvider { return 'google'; }
    protected _embedUrl(): string {
        const { lat, lng } = this._center;
        const q = (this as unknown as ControlBase)._get<string>('address', '');
        const query = q ? encodeURIComponent(q) : `${lat},${lng}`;
        return `https://www.google.com/maps?q=${query}&z=${this._zoom}&output=embed`;
    }
    protected _openUrl(): string {
        const { lat, lng } = this._center;
        return `https://www.google.com/maps/@${lat},${lng},${this._zoom}z`;
    }
}

// ──────────────────────────────────────────────────────────────────────────
// OpenStreetMap — openstreetmap.org/export/embed.html
// ──────────────────────────────────────────────────────────────────────────
export class OpenStreetMap extends MapEmbed {
    getProvider(): MapProvider { return 'osm'; }
    protected _embedUrl(): string {
        const { lat, lng } = this._center;
        const span = 0.6 / Math.pow(2, this._zoom - 8);
        const bbox = `${lng - span},${lat - span / 2},${lng + span},${lat + span / 2}`;
        const layer = 'mapnik';
        const marker = this._marker ? `&marker=${lat}%2C${lng}` : '';
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=${layer}${marker}`;
    }
    protected _openUrl(): string {
        const { lat, lng } = this._center;
        return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${this._zoom}/${lat}/${lng}`;
    }
}

// ──────────────────────────────────────────────────────────────────────────
// AppleMap — Apple Maps web embed (Apple platforms only).
// On non-Apple browsers the iframe is replaced with a deep-link fallback card.
// ──────────────────────────────────────────────────────────────────────────
export class AppleMap extends MapEmbed {
    getProvider(): MapProvider { return 'apple'; }

    _build(): void {
        super._build();
        if (!this._isAppleCapable()) {
            const self = this as unknown as ControlBase;
            const stage = self.el.querySelector('.ar-map__stage') as HTMLElement | null;
            if (stage) {
                stage.innerHTML = `
<div class="ar-map__fallback">
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:.4">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
  <div>Apple Maps embeds render only on Apple platforms.</div>
  <a data-r="open-fb" target="_blank" rel="noopener">Open in Apple Maps</a>
</div>`;
                const fb = stage.querySelector('[data-r="open-fb"]') as HTMLAnchorElement | null;
                if (fb) fb.href = this._openUrl();
            }
        }
    }

    protected _embedUrl(): string {
        const { lat, lng } = this._center;
        const q = (this as unknown as ControlBase)._get<string>('address', '');
        const params: string[] = [`ll=${lat},${lng}`, `z=${this._zoom}`, 't=m'];
        if (q) params.push(`q=${encodeURIComponent(q)}`);
        return `https://maps.apple.com/?${params.join('&')}`;
    }
    protected _openUrl(): string { return this._embedUrl(); }

    private _isAppleCapable(): boolean {
        if (typeof navigator === 'undefined') return false;
        return /(Macintosh|iPhone|iPad|iPod)/.test(navigator.userAgent);
    }
}

// ──────────────────────────────────────────────────────────────────────────
// BingMap — Microsoft Bing Maps embed (no API key for basic map)
// ──────────────────────────────────────────────────────────────────────────
export class BingMap extends MapEmbed {
    getProvider(): MapProvider { return 'bing'; }
    protected _embedUrl(): string {
        const { lat, lng } = this._center;
        return `https://www.bing.com/maps/embed?h=400&w=600&cp=${lat}~${lng}&lvl=${this._zoom}&typ=d&sty=r&src=SHELL&FORM=MBEDV8`;
    }
    protected _openUrl(): string {
        const { lat, lng } = this._center;
        return `https://www.bing.com/maps?cp=${lat}~${lng}&lvl=${this._zoom}`;
    }
}
