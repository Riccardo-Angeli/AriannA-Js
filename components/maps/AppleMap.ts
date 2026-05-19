/**
 * @module    components/maps/AppleMap
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * AppleMap — Apple Maps surface with two render paths:
 *
 *   1. **Fallback card (default)** — a styled "Open in Apple Maps" card
 *      that deep-links to `maps.apple.com/?ll=...`. Apple Maps does NOT
 *      publish an iframe-embed endpoint (despite many third-party guides
 *      suggesting otherwise — `maps.apple.com/?...` is a deep-link that
 *      opens the native app on iOS/iPadOS/macOS, NOT an embeddable URL).
 *      Verified May 2026: the legacy iframe approach returns an "open in
 *      app" page on Apple platforms and a redirect on others.
 *
 *   2. **MapKit JS (opt-in)** — pass `mapkit-token` (a developer JWT) to
 *      load the MapKit JS SDK and render a real interactive Apple Maps
 *      surface. Requires:
 *        • Apple Developer Program membership
 *        • A Maps ID registered in your account
 *        • A private key (.p8) used to sign a short-lived JWT server-side
 *        • The signed JWT injected into the page as `mapkit-token` attr
 *
 *      Quotas (per Apple Developer membership):
 *        - 250 000 map initializations / day
 *        - 25 000 service calls / day
 *
 *      Docs: https://developer.apple.com/maps/web/
 *
 * @example HTML — fallback card path (no key needed)
 *   <arianna-apple-map center-lat="40.7128" center-lng="-74.0060"
 *                       address="Statue of Liberty"></arianna-apple-map>
 *
 * @example HTML — interactive MapKit JS path
 *   <arianna-apple-map center-lat="40.7128" center-lng="-74.0060"
 *                       mapkit-token="eyJhbGciOiJFUzI1NiIsImtpZCI6..."></arianna-apple-map>
 *
 * @example JS — refresh token after rotation
 *   const m = document.querySelector('arianna-apple-map');
 *   m.setAttribute('mapkit-token', newJwt);
 *
 * Attrs (inherited + own):
 *   center-lat, center-lng, zoom, marker, address, aspect-ratio, label,
 *   mapkit-token, map-type ('standard' | 'hybrid' | 'satellite' | 'mutedStandard')
 */

import { MapEmbed, type MapProvider } from './MapEmbed.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';

/** MapKit JS global injected by the SDK once loaded. */
interface MapKitGlobal {
    init(opts: { authorizationCallback: (done: (token: string) => void) => void }): void;
    Map: new (el: HTMLElement, opts?: object) => {
        center        : { latitude: number; longitude: number };
        showsCompass  : string;
        mapType       : string;
        cameraDistance: number;
        setCenterAnimated(c: { latitude: number; longitude: number }): void;
        addAnnotation(a: object): void;
        destroy?(): void;
    };
    MarkerAnnotation : new (coord: object, opts?: object) => object;
    Coordinate       : new (lat: number, lng: number) => object;
}

declare global {
    interface Window { mapkit?: MapKitGlobal }
}

const MAPKIT_CDN = 'https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js';
let mapKitLoadPromise: Promise<MapKitGlobal> | null = null;

function loadMapKit(token: string): Promise<MapKitGlobal>
{
    if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
    if (window.mapkit) {
        // Re-init token if it changed (mapkit caches per-page).
        window.mapkit.init({ authorizationCallback: done => done(token) });
        return Promise.resolve(window.mapkit);
    }
    if (mapKitLoadPromise) return mapKitLoadPromise;

    mapKitLoadPromise = new Promise<MapKitGlobal>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = MAPKIT_CDN;
        script.crossOrigin = 'anonymous';
        script.async = true;
        script.onload = () => {
            const mk = window.mapkit;
            if (!mk) { reject(new Error('MapKit script loaded but window.mapkit is undefined')); return; }
            try {
                mk.init({ authorizationCallback: done => done(token) });
                resolve(mk);
            } catch (e) {
                reject(e);
            }
        };
        script.onerror = () => reject(new Error('Failed to load MapKit JS'));
        document.head.appendChild(script);
    });
    return mapKitLoadPromise;
}

export class AppleMap extends (Component('arianna-apple-map', HTMLElement, {}, {
    attrs : [
        'center-lat', 'center-lng', 'zoom', 'marker', 'label', 'address',
        'aspect-ratio', 'mapkit-token', 'map-type',
    ],
}) as unknown as typeof MapEmbed)
{
    /** The live MapKit instance, when MapKit JS path is active. */
    #mapkitInstance: { destroy?(): void } | null = null;

    getProvider(): MapProvider { return 'apple'; }

    protected getEmbedUrl(): string
    {
        // Returned only for the iframe `src` of the standard MapEmbed template;
        // we override the whole template in build() to swap to fallback / MapKit.
        return 'about:blank';
    }

    protected getOpenUrl(): string
    {
        const lat = this.centerLatNum();
        const lng = this.centerLngNum();
        const address = this.getAttribute('address');
        const params: string[] = [`ll=${lat},${lng}`, `z=${this.zoomNum()}`];
        if (address) params.push(`q=${encodeURIComponent(address)}`);
        return `https://maps.apple.com/?${params.join('&')}`;
    }

    /**
     * Override the standard build to support three states:
     *   - MapKit token present → load MapKit JS into a `<div>`
     *   - Else → render the styled fallback card
     */
    build(_opts: object = {}): void
    {
        const centerLat   = this.attrSignal('center-lat');
        const centerLng   = this.attrSignal('center-lng');
        const aspectRatio = this.attrSignal('aspect-ratio');
        const tokenSig    = this.attrSignal('mapkit-token');

        this.centerLatNum = () => parseFloat(centerLat.get() ?? '51.4779');
        this.centerLngNum = () => parseFloat(centerLng.get() ?? '-0.0015');
        this.zoomNum      = () => parseInt(this.getAttribute('zoom') ?? '13', 10) || 13;
        this.hasMarker    = () => this.getAttribute('marker') !== 'false';

        this.stageStyle = () => `aspect-ratio: ${aspectRatio.get() ?? '16/9'}`;
        this.providerBadge = () => 'APPLE';
        this.openHref      = () => this.getOpenUrl();
        this.hasToken      = () => !!tokenSig.get();
        this.notHasToken   = () => !tokenSig.get();

        this.openInAppleMapsHref = () => this.getOpenUrl();

        this.template = html`
            <div class="ar-map__stage" :style="this.stageStyle()">
                <div class="ar-map__mapkit-host"
                     a-if="this.hasToken()"
                     style="width:100%; height:100%; position:absolute; inset:0;"></div>
                <div class="ar-map__fallback" a-if="this.notHasToken()">
                    <svg width="48" height="48" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <div>Apple Maps has no public iframe embed.<br>Click below to open the location in Apple Maps,
                         or pass <code>mapkit-token</code> for an interactive embed.</div>
                    <a :href="this.openInAppleMapsHref()"
                       target="_blank" rel="noopener">Open in Apple Maps ↗</a>
                </div>
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

    onMount() {
        const token = this.getAttribute('mapkit-token');
        if (token) this.#initMapKit(token);
    }

    onUpdate() {
        const token = this.getAttribute('mapkit-token');
        if (token && !this.#mapkitInstance) this.#initMapKit(token);
    }

    onUnmount() {
        if (this.#mapkitInstance && typeof this.#mapkitInstance.destroy === 'function') {
            try { this.#mapkitInstance.destroy(); } catch { /* ignore */ }
        }
        this.#mapkitInstance = null;
    }

    #initMapKit(token: string): void
    {
        // Defer until template renders the host div
        queueMicrotask(() => {
            const host = this.querySelector<HTMLDivElement>('.ar-map__mapkit-host');
            if (!host) return;
            loadMapKit(token)
                .then(mk => {
                    const map = new mk.Map(host, {
                        center  : new mk.Coordinate(this.centerLatNum(), this.centerLngNum()),
                        mapType : this.getAttribute('map-type') ?? 'standard',
                    });
                    if (this.hasMarker()) {
                        const coord = new mk.Coordinate(this.centerLatNum(), this.centerLngNum());
                        const ann = new mk.MarkerAnnotation(coord, {
                            title: this.getAttribute('label') ?? this.getAttribute('address') ?? '',
                        });
                        map.addAnnotation(ann);
                    }
                    this.#mapkitInstance = map;
                })
                .catch(err => {
                    console.warn('[AppleMap] MapKit JS init failed, keeping fallback card:', err);
                    // Remove the broken token so template falls back to card
                    this.removeAttribute('mapkit-token');
                });
        });
    }

    // ── Template helpers added by AppleMap ───────────────────────────────────
    protected hasToken      : () => boolean = () => false;
    protected notHasToken   : () => boolean = () => true;
    protected openInAppleMapsHref: () => string = () => '#';
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'AppleMap', {
        value: AppleMap, writable: false, enumerable: false, configurable: false,
    });
}

export default AppleMap;
