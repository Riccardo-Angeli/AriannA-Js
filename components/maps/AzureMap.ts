/**
 * @module    components/maps/AzureMap
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * AzureMap — Microsoft Azure Maps embed using the static-render REST endpoint
 * `atlas.microsoft.com/map/static`. Renders a non-interactive PNG inside the
 * iframe-equivalent (we use a same-origin `<img>` because Azure does not
 * publish an iframe-embed endpoint of its own).
 *
 * # Auth
 *
 *   Azure Maps requires a `subscription-key` query parameter (free tier
 *   available — see https://azure.microsoft.com/products/azure-maps).
 *   Pass it via the `api-key` attribute.
 *
 *   For an interactive experience use the Azure Maps Web SDK directly;
 *   AriannA may add `<arianna-azure-map-interactive>` in a second pass when
 *   we wire the SDK loader (similar to MapKit JS in AppleMap).
 *
 * # Status (verified May 2026)
 *
 *   • Azure Maps Web SDK v3 is current; v1 retires 19 Sep 2026.
 *   • Static-render endpoint stable, used here.
 *   • Bing Maps free tier retired 30 Jun 2025 — AzureMap is the successor.
 *
 * @example HTML
 *   <arianna-azure-map api-key="YOUR_KEY"
 *                       center-lat="40.7128" center-lng="-74.0060"
 *                       zoom="13"></arianna-azure-map>
 *
 * Attrs (inherited + own):
 *   center-lat, center-lng, zoom, marker, aspect-ratio, label, address,
 *   api-key, style ('road' | 'satellite' | 'satellite_road_labels' | 'night'),
 *   tileset ('microsoft.base.road' | etc.)
 */

import { MapEmbed, type MapProvider } from './MapEmbed.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';

export class AzureMap extends (Component('arianna-azure-map', HTMLElement, {}, {
    attrs : [
        'center-lat', 'center-lng', 'zoom', 'marker', 'label', 'address',
        'aspect-ratio', 'api-key', 'style', 'tileset',
    ],
}) as unknown as typeof MapEmbed)
{
    getProvider(): MapProvider { return 'azure'; }

    protected getEmbedUrl(): string
    {
        // Returned only as fallback for the standard template path; we override
        // the template in build() to render via <img> because Azure has no
        // iframe-safe public embed URL.
        return 'about:blank';
    }

    protected getOpenUrl(): string
    {
        // Azure Maps has no "open in app" URL; deep-link to the Bing successor
        // (which still has a working map view via search).
        return `https://www.bing.com/maps?cp=${this.centerLatNum()}~${this.centerLngNum()}&lvl=${this.zoomNum()}`;
    }

    /** Build the static-render image URL. */
    #imageSrc(): string
    {
        const apiKey = this.getAttribute('api-key');
        if (!apiKey) return '';

        const lat = this.centerLatNum();
        const lng = this.centerLngNum();
        const zoom = this.zoomNum();
        const mapStyle = this.getAttribute('style') ?? 'road';
        const tileset  = this.getAttribute('tileset') ?? `microsoft.base.${mapStyle}`;

        // Size — large enough for a typical 16:9 stage on desktop
        const w = 1024, h = 576;

        const params = new URLSearchParams({
            'api-version'       : '2024-04-01',
            'tilesetId'         : tileset,
            'subscription-key'  : apiKey,
            'zoom'              : String(zoom),
            'center'            : `${lng},${lat}`,
            'width'             : String(w),
            'height'            : String(h),
        });

        if (this.hasMarker()) {
            // Pin marker syntax for Azure: `default|sc{scale}|co{hex}||lat,lng`
            params.set('pins', `default|sc1||${lng} ${lat}`);
        }

        return `https://atlas.microsoft.com/map/static?${params.toString()}`;
    }

    /** Override build to render an <img> rather than an iframe. */
    build(_opts: object = {}): void
    {
        const centerLat   = this.attrSignal('center-lat');
        const centerLng   = this.attrSignal('center-lng');
        const aspectRatio = this.attrSignal('aspect-ratio');
        const apiKey      = this.attrSignal('api-key');

        this.centerLatNum  = () => parseFloat(centerLat.get() ?? '51.4779');
        this.centerLngNum  = () => parseFloat(centerLng.get() ?? '-0.0015');
        this.zoomNum       = () => parseInt(this.getAttribute('zoom') ?? '13', 10) || 13;
        this.hasMarker     = () => this.getAttribute('marker') !== 'false';
        this.stageStyle    = () => `aspect-ratio: ${aspectRatio.get() ?? '16/9'}`;
        this.providerBadge = () => 'AZURE';
        this.openHref      = () => this.getOpenUrl();

        this.hasApiKey = () => !!apiKey.get();
        this.notHasApiKey = () => !apiKey.get();
        this.imgSrc    = () => this.#imageSrc();

        this.template = html`
            <div class="ar-map__stage" :style="this.stageStyle()">
                <img class="ar-map__iframe"
                     a-if="this.hasApiKey()"
                     :src="this.imgSrc()"
                     alt="Map"
                     style="width:100%; height:100%; object-fit:cover; display:block;"/>
                <div class="ar-map__fallback" a-if="this.notHasApiKey()">
                    <svg width="48" height="48" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <div>Azure Maps requires an API key.<br>
                         Pass <code>api-key="..."</code> from your Azure subscription.</div>
                    <a href="https://azure.microsoft.com/products/azure-maps/"
                       target="_blank" rel="noopener">Get a key ↗</a>
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

    // Template helpers added by AzureMap
    protected hasApiKey    : () => boolean = () => false;
    protected notHasApiKey : () => boolean = () => true;
    protected imgSrc       : () => string = () => '';
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'AzureMap', {
        value: AzureMap, writable: false, enumerable: false, configurable: false,
    });
}

export default AzureMap;
