/**
 * @module    components/maps/MapEmbed
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * MapEmbed — abstract base for the AriannA map embedder family.
 *
 * # Provider state (verified May 2026)
 *
 *   • GoogleMap    — works without API key via `/maps?q=...&output=embed`.
 *                    Official Maps Embed API supported too (with key) for
 *                    advanced modes: place / view / directions / streetview / search.
 *   • OpenStreetMap — works via `openstreetmap.org/export/embed.html`. No key.
 *   • AppleMap     — Apple Maps has NO public iframe-embed product. The web
 *                    URL `maps.apple.com/?ll=...` is a deep-link, not an
 *                    embeddable iframe; many third-party guides incorrectly
 *                    suggest otherwise. AppleMap therefore renders a styled
 *                    deep-link fallback card by default. For a true embed
 *                    you must integrate MapKit JS (requires a developer JWT);
 *                    pass `mapkit-token` to opt in.
 *   • BingMap      — DEPRECATED. Bing Maps for Enterprise was retired for
 *                    free tier on 30 Jun 2025, enterprise EOL 30 Jun 2028.
 *                    Class still exists for backward compatibility but
 *                    console-warns and recommends AzureMap as replacement.
 *   • AzureMap     — Microsoft's current platform. Free tier needs a
 *                    subscription key but uses standard `atlas.microsoft.com`
 *                    REST tile endpoints — we render via static map URL.
 *
 * Each provider extends MapEmbed and shares `.setLocation()`, `.setZoom()`,
 * `.setMarker()`, `.reload()`, `.getProvider()`. Subclasses implement
 * `embedUrl()` + optionally override `openUrl()`.
 *
 * # The custom-element shape
 *
 * Concrete subclasses register their own tag (e.g. `arianna-google-map`).
 * `MapEmbed` itself does NOT register a tag — it's an abstract bag.
 *
 * @example
 *   <arianna-google-map center-lat="51.5072" center-lng="-0.1276" zoom="13" marker></arianna-google-map>
 *   <arianna-osm-map address="Eiffel Tower, Paris" zoom="15"></arianna-osm-map>
 *   <arianna-apple-map center-lat="40.7128" center-lng="-74.0060"></arianna-apple-map>
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface LatLng { lat: number; lng: number; }

export type MapProvider =
    | 'google' | 'osm' | 'apple' | 'bing' | 'azure' | 'maplibre';

export interface MapEmbedOptions {
    center?     : LatLng;
    zoom?       : number;
    marker?     : boolean;
    label?      : string;
    address?    : string;
    aspectRatio?: string;
}

const DEFAULT_CENTER: LatLng = { lat: 51.4779, lng: -0.0015 };  // Greenwich

/**
 * Helper used by subclasses. Builds the abstract MapEmbed Component definition
 * with the unified attribute set. Concrete subclasses pass their own tag.
 */
export function _mapEmbedBase(tag: string) {
    return Component(tag, HTMLElement, {}, {
        attrs : [
            'center-lat', 'center-lng', 'zoom', 'marker', 'label', 'address',
            'aspect-ratio', 'api-key', 'mapkit-token',
        ],
        shadow: false,
    });
}

/**
 * MapEmbed — base class. Subclasses MUST override `getProvider()` and
 * `embedUrl()`; may override `openUrl()` and `build()` for fallback states.
 */
export abstract class MapEmbed extends _mapEmbedBase('arianna-map-embed')
{
    build(_opts: MapEmbedOptions = {})
    {
        const centerLat   = this.attrSignal('center-lat');
        const centerLng   = this.attrSignal('center-lng');
        const zoom        = this.attrSignal('zoom');
        const aspectRatio = this.attrSignal('aspect-ratio');

        this.centerLatNum = () => parseFloat(centerLat.get() ?? String(DEFAULT_CENTER.lat));
        this.centerLngNum = () => parseFloat(centerLng.get() ?? String(DEFAULT_CENTER.lng));
        this.zoomNum      = () => parseInt(zoom.get() ?? '13', 10) || 13;
        this.hasMarker    = () => this.getAttribute('marker') !== 'false';

        this.stageStyle = () => {
            const ar = aspectRatio.get() ?? '16/9';
            return `aspect-ratio: ${ar}`;
        };

        this.providerBadge = () => this.getProvider().toUpperCase();

        // Build URLs reactively — getEmbedUrl/getOpenUrl read attrs lazily,
        // so any attribute change triggers a re-render.
        this.iframeSrc = () => this.getEmbedUrl();
        this.openHref  = () => this.getOpenUrl();

        this.template = html`
            <div class="ar-map__stage" :style="this.stageStyle()">
                <iframe class="ar-map__iframe"
                        :src="this.iframeSrc()"
                        frameborder="0"
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                        allowfullscreen></iframe>
            </div>
            <div class="ar-map__chrome">
                <span class="ar-map__badge">{{ this.providerBadge() }}</span>
                <a class="ar-map__open"
                   :href="this.openHref()"
                   target="_blank"
                   rel="noopener">Open ↗</a>
            </div>
        `;

        this.Sheet = MapEmbed.DefaultSheet();
    }

    // ── Subclass contract ────────────────────────────────────────────────────

    /** Provider identifier — must be unique per concrete subclass. */
    abstract getProvider(): MapProvider;

    /** Builds the iframe `src` URL from the current attributes. */
    protected abstract getEmbedUrl(): string;

    /** Public link in new tab. Default: Google Maps coords URL. */
    protected getOpenUrl(): string {
        return `https://www.google.com/maps/@${this.centerLatNum()},${this.centerLngNum()},${this.zoomNum()}z`;
    }

    // ── Programmatic API (shared) ────────────────────────────────────────────

    setLocation(center: LatLng): this {
        this.setAttribute('center-lat', String(center.lat));
        this.setAttribute('center-lng', String(center.lng));
        return this;
    }
    setZoom(z: number): this {
        this.setAttribute('zoom', String(Math.max(1, Math.min(20, z))));
        return this;
    }
    setMarker(on: boolean): this {
        this.setAttribute('marker', on ? 'true' : 'false');
        return this;
    }
    reload(): this {
        const iframe = this.querySelector<HTMLIFrameElement>('iframe.ar-map__iframe');
        if (iframe) iframe.src = this.getEmbedUrl();
        return this;
    }
    getCenter(): LatLng { return { lat: this.centerLatNum(), lng: this.centerLngNum() }; }
    getZoom(): number   { return this.zoomNum(); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    // ── Attr getters/setters (typed) ────────────────────────────────────────

    get centerLat(): number  { return this.centerLatNum(); }
    set centerLat(v: number) { this.setAttribute('center-lat', String(v)); }

    get centerLng(): number  { return this.centerLngNum(); }
    set centerLng(v: number) { this.setAttribute('center-lng', String(v)); }

    get zoom(): number       { return this.zoomNum(); }
    set zoom(v: number)      { this.setAttribute('zoom', String(v)); }

    get marker(): boolean    { return this.hasMarker(); }
    set marker(v: boolean)   { this.setAttribute('marker', v ? 'true' : 'false'); }

    get address(): string    { return this.getAttribute('address') ?? ''; }
    set address(v: string)   { v ? this.setAttribute('address', v) : this.removeAttribute('address'); }

    get label(): string      { return this.getAttribute('label') ?? ''; }
    set label(v: string)     { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }

    get apiKey(): string     { return this.getAttribute('api-key') ?? ''; }
    set apiKey(v: string)    { v ? this.setAttribute('api-key', v) : this.removeAttribute('api-key'); }

    // ── Template helpers (set in build) ─────────────────────────────────────

    protected centerLatNum  : () => number = () => DEFAULT_CENTER.lat;
    protected centerLngNum  : () => number = () => DEFAULT_CENTER.lng;
    protected zoomNum       : () => number = () => 13;
    protected hasMarker     : () => boolean = () => true;
    protected stageStyle    : () => string = () => '';
    protected providerBadge : () => string = () => '';
    protected iframeSrc     : () => string = () => 'about:blank';
    protected openHref      : () => string = () => '#';

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    background  : 'var(--arianna-bg-3, #f3f3f3)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 8px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    display     : 'flex',
                    flexDirection: 'column',
                    fontFamily  : '-apple-system, system-ui, sans-serif',
                    fontSize    : '12px',
                    overflow    : 'hidden',
                    position    : 'relative',
                }),
                new Rule('.ar-map__stage', {
                    background: 'var(--arianna-bg-4, #ebebeb)',
                    minHeight : '200px',
                    position  : 'relative',
                }),
                new Rule('.ar-map__iframe', {
                    border: '0',
                    display: 'block',
                    height: '100%',
                    left  : '0',
                    position: 'absolute',
                    top   : '0',
                    width : '100%',
                }),
                new Rule('.ar-map__chrome', {
                    alignItems    : 'center',
                    background    : 'var(--arianna-bg, #ffffff)',
                    borderTop     : '1px solid var(--arianna-border, #d8d8d8)',
                    display       : 'flex',
                    justifyContent: 'space-between',
                    padding       : '6px 10px',
                }),
                new Rule('.ar-map__badge', {
                    border       : '1px solid var(--arianna-primary, #1f6feb)',
                    borderRadius : '10px',
                    color        : 'var(--arianna-primary, #1f6feb)',
                    font         : '10px ui-monospace, monospace',
                    letterSpacing: '0.08em',
                    padding      : '2px 8px',
                    textTransform: 'uppercase',
                }),
                new Rule('.ar-map__open', {
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '3px',
                    color       : 'var(--arianna-text, #1f2328)',
                    font        : '11px sans-serif',
                    padding     : '3px 8px',
                    textDecoration: 'none',
                    transition  : 'background 0.14s ease',
                }),
                new Rule('.ar-map__open:hover', { background: 'var(--arianna-bg-3, #f3f3f3)' }),

                // Fallback card (used by AppleMap when MapKit token absent + by BingMap)
                new Rule('.ar-map__fallback', {
                    alignItems    : 'center',
                    color         : 'var(--arianna-muted, #6e6b62)',
                    display       : 'flex',
                    flexDirection : 'column',
                    gap           : '10px',
                    height        : '100%',
                    justifyContent: 'center',
                    padding       : '24px',
                    position      : 'absolute',
                    inset         : '0',
                    textAlign     : 'center',
                }),
                new Rule('.ar-map__fallback svg', { opacity: '0.4' }),
                new Rule('.ar-map__fallback a', {
                    color        : 'var(--arianna-primary, #1f6feb)',
                    fontWeight   : '600',
                    textDecoration: 'none',
                }),
                new Rule('.ar-map__fallback a:hover', { textDecoration: 'underline' }),

                // Deprecation banner (used by BingMap)
                new Rule('.ar-map__deprecation', {
                    background : 'var(--arianna-warning-bg, #fff8e1)',
                    borderBottom: '1px solid var(--arianna-warning, #f5a623)',
                    color      : 'var(--arianna-warning-text, #7a4a00)',
                    fontSize   : '11px',
                    padding    : '6px 10px',
                    textAlign  : 'center',
                }),

                new Rule('@media (max-width: 600px)', {
                    '.ar-map__stage':  { minHeight: '160px' },
                    '.ar-map__chrome': { padding: '4px 8px' },
                    '.ar-map__badge':  { fontSize: '9px', padding: '1px 6px' },
                } as never),
            ]
        );
    }
}
