/**
 * @module    components/maps/MapLibreMap
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * MapLibreMap — open-source interactive map via MapLibre GL JS, the OSS fork
 * of Mapbox GL JS (BSD-licensed, no vendor lock-in, no API key required by
 * default).
 *
 * # Why MapLibre
 *
 *   • **No vendor lock-in** — uses MapLibre demo tiles by default; swap to
 *     any tile provider via the `style-url` attribute (OpenMapTiles, Maptiler,
 *     Stadia, your own tile server).
 *   • **No API key required** for the default demo style.
 *   • **WebGL hardware accel** — vector tiles, pinch-zoom, smooth pan.
 *   • **Active OSS community** — current 4.x as of May 2026.
 *
 * # The SDK loader
 *
 *   MapLibre GL JS is loaded lazily on first mount from the official CDN
 *   (`unpkg.com/maplibre-gl@4`). The loader is shared across instances:
 *   subsequent maps reuse the same script + CSS injection.
 *
 * # Default style
 *
 *   `https://demotiles.maplibre.org/style.json` — basic worldwide style,
 *   suitable for prototyping. Production apps should set their own tile
 *   provider via `style-url`.
 *
 * @example HTML
 *   <arianna-maplibre-map center-lat="40.7128" center-lng="-74.0060"
 *                          zoom="12"></arianna-maplibre-map>
 *
 * @example HTML — custom style
 *   <arianna-maplibre-map style-url="https://tiles.example.com/style.json"
 *                          center-lat="..." center-lng="..."></arianna-maplibre-map>
 *
 * Attrs (inherited + own):
 *   center-lat, center-lng, zoom, marker, aspect-ratio, label,
 *   style-url, bearing, pitch
 */

import { MapEmbed, type MapProvider } from './MapEmbed.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';

interface MapLibreGlobal {
    Map: new (opts: {
        container : HTMLElement;
        style     : string;
        center    : [number, number];
        zoom      : number;
        bearing?  : number;
        pitch?    : number;
    }) => {
        setCenter(c: [number, number]): void;
        setZoom(z: number): void;
        remove(): void;
        on(event: string, cb: () => void): void;
        addControl(c: object, position?: string): void;
    };
    Marker: new (opts?: { color?: string }) => {
        setLngLat(c: [number, number]): { addTo(map: object): void };
    };
    NavigationControl: new (opts?: object) => object;
}

declare global {
    interface Window { maplibregl?: MapLibreGlobal }
}

const MAPLIBRE_JS_CDN  = 'https://unpkg.com/maplibre-gl@4/dist/maplibre-gl.js';
const MAPLIBRE_CSS_CDN = 'https://unpkg.com/maplibre-gl@4/dist/maplibre-gl.css';
const DEFAULT_STYLE    = 'https://demotiles.maplibre.org/style.json';

let mapLibrePromise: Promise<MapLibreGlobal> | null = null;

function loadMapLibre(): Promise<MapLibreGlobal>
{
    if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
    if (window.maplibregl) return Promise.resolve(window.maplibregl);
    if (mapLibrePromise) return mapLibrePromise;

    mapLibrePromise = new Promise<MapLibreGlobal>((resolve, reject) => {
        // Inject CSS
        if (!document.querySelector(`link[href="${MAPLIBRE_CSS_CDN}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = MAPLIBRE_CSS_CDN;
            document.head.appendChild(link);
        }
        // Inject JS
        const script = document.createElement('script');
        script.src = MAPLIBRE_JS_CDN;
        script.async = true;
        script.onload = () => {
            const mg = window.maplibregl;
            if (mg) resolve(mg);
            else    reject(new Error('MapLibre script loaded but global is undefined'));
        };
        script.onerror = () => reject(new Error('Failed to load MapLibre GL JS'));
        document.head.appendChild(script);
    });
    return mapLibrePromise;
}

type MapLibreInstance = {
    setCenter(c: [number, number]): void;
    setZoom(z: number): void;
    remove(): void;
    on(event: string, cb: () => void): void;
    addControl(c: object, position?: string): void;
};

export class MapLibreMap extends (Component('arianna-maplibre-map', HTMLElement, {}, {
    attrs : [
        'center-lat', 'center-lng', 'zoom', 'marker', 'label', 'address',
        'aspect-ratio', 'style-url', 'bearing', 'pitch',
    ],
}) as unknown as typeof MapEmbed)
{
    #instance: MapLibreInstance | null = null;

    getProvider(): MapProvider { return 'maplibre'; }

    protected getEmbedUrl(): string { return 'about:blank'; }

    protected getOpenUrl(): string
    {
        const lat = this.centerLatNum();
        const lng = this.centerLngNum();
        return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${this.zoomNum()}/${lat}/${lng}`;
    }

    /** Override to render a MapLibre host div instead of an iframe. */
    build(_opts: object = {}): void
    {
        const centerLat   = this.attrSignal('center-lat');
        const centerLng   = this.attrSignal('center-lng');
        const aspectRatio = this.attrSignal('aspect-ratio');

        this.centerLatNum  = () => parseFloat(centerLat.get() ?? '51.4779');
        this.centerLngNum  = () => parseFloat(centerLng.get() ?? '-0.0015');
        this.zoomNum       = () => parseInt(this.getAttribute('zoom') ?? '13', 10) || 13;
        this.hasMarker     = () => this.getAttribute('marker') !== 'false';
        this.stageStyle    = () => `aspect-ratio: ${aspectRatio.get() ?? '16/9'}`;
        this.providerBadge = () => 'MAPLIBRE';
        this.openHref      = () => this.getOpenUrl();

        this.template = html`
            <div class="ar-map__stage" :style="this.stageStyle()">
                <div class="ar-map__maplibre-host"
                     style="width:100%; height:100%; position:absolute; inset:0;"></div>
            </div>
            <div class="ar-map__chrome">
                <span class="ar-map__badge">{{ this.providerBadge() }}</span>
                <a class="ar-map__open"
                   :href="this.openHref()"
                   target="_blank" rel="noopener">Open ↗</a>
            </div>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = MapEmbed.DefaultSheet();
    }

    onMount() { this.#initMapLibre(); }

    onUnmount() {
        if (this.#instance) {
            try { this.#instance.remove(); } catch { /* ignore */ }
            this.#instance = null;
        }
    }

    #initMapLibre(): void
    {
        queueMicrotask(() => {
            const host = this.querySelector<HTMLDivElement>('.ar-map__maplibre-host');
            if (!host) return;
            loadMapLibre()
                .then(mg => {
                    const styleUrl = this.getAttribute('style-url') ?? DEFAULT_STYLE;
                    const bearing  = parseFloat(this.getAttribute('bearing') ?? '0') || 0;
                    const pitch    = parseFloat(this.getAttribute('pitch')   ?? '0') || 0;

                    const map = new mg.Map({
                        container: host,
                        style    : styleUrl,
                        center   : [this.centerLngNum(), this.centerLatNum()],
                        zoom     : this.zoomNum(),
                        bearing,
                        pitch,
                    });
                    map.addControl(new mg.NavigationControl(), 'top-right');
                    if (this.hasMarker()) {
                        new mg.Marker({ color: '#1f6feb' })
                            .setLngLat([this.centerLngNum(), this.centerLatNum()])
                            .addTo(map);
                    }
                    this.#instance = map;
                })
                .catch(err => {
                    console.warn('[MapLibreMap] failed to load MapLibre GL JS:', err);
                });
        });
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'MapLibreMap', {
        value: MapLibreMap, writable: false, enumerable: false, configurable: false,
    });
}

export default MapLibreMap;
