/**
 * @module    components/maps/MapEmbed
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA MapEmbed component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';

/** @namespace   MapEmbed
 *  @public
 *  @description Namespace containing MapEmbed contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace MapEmbed
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Rule
         *  @public
         *  @type        {Css.Rule}
         *  @description Type alias for Rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Rule = Css.Rule;

        /** @name        Stylesheet
         *  @public
         *  @type        {Css.Stylesheet}
         *  @description Type alias for Stylesheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Stylesheet = Css.Stylesheet;

        /** @name        MapProvider
         *  @public
         *  @type        {'google' | 'osm' | 'apple' | 'bing' | 'azure' | 'maplibre'}
         *  @description Type alias for MapProvider.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type MapProvider = 'google' | 'osm' | 'apple' | 'bing' | 'azure' | 'maplibre';
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   LatLng
         *  @public
         *  @description LatLng contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface LatLng
        {
            /** @name        lat
             *  @public
             *  @type        {number}
             *  @description Component member for lat.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            lat: number;

            /** @name        lng
             *  @public
             *  @type        {number}
             *  @description Component member for lng.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            lng: number;
        }

        /** @interface   MapEmbedOptions
         *  @public
         *  @description MapEmbedOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface MapEmbedOptions
        {
            /** @name        center
             *  @public
             *  @type        {MapEmbed.Interfaces.LatLng}
             *  @description Component member for center.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            center?: Interfaces.LatLng;

            /** @name        zoom
             *  @public
             *  @type        {number}
             *  @description Component member for zoom.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            zoom?: number;

            /** @name        marker
             *  @public
             *  @type        {boolean}
             *  @description Component member for marker.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            marker?: boolean;

            /** @name        label
             *  @public
             *  @type        {string}
             *  @description Component member for label.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            label?: string;

            /** @name        address
             *  @public
             *  @type        {string}
             *  @description Component member for address.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            address?: string;

            /** @name        aspectRatio
             *  @public
             *  @type        {string}
             *  @description Component member for aspect Ratio.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            aspectRatio?: string;
        }
    }

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @name        DEFAULT_CENTER
     *  @public
     *  @type        {MapEmbed.Interfaces.LatLng}
     *  @description Namespace-owned DEFAULT_CENTER value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const DEFAULT_CENTER: Interfaces.LatLng = { lat: 51.4779, lng: -0.0015 }; // Greenwich
    /**
     * Helper used by subclasses. Builds the abstract MapEmbed Component definition
     * with the unified attribute set. Concrete subclasses pass their own tag.
     */
    /**
     * MapEmbed — base class. Subclasses MUST override `getProvider()` and
     * `embedUrl()`; may override `openUrl()` and `onConnected()` for fallback states.
     */
    @Component('arianna-map-embed', {}, {
        Attributes: [
            'center-lat', 'center-lng', 'zoom', 'marker', 'label', 'address',
            'aspect-ratio', 'api-key', 'mapkit-token',
        ],
    })
    export abstract class MapEmbed extends HTMLElement
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {MapEmbed.Interfaces.MapEmbedOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.MapEmbedOptions = {})
        {
            /** @name        centerLat
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned centerLat value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const centerLat = this.signal().attribute('center-lat');

            /** @name        centerLng
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned centerLng value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const centerLng = this.signal().attribute('center-lng');

            /** @name        zoom
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned zoom value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const zoom = this.signal().attribute('zoom');

            /** @name        aspectRatio
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned aspectRatio value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const aspectRatio = this.signal().attribute('aspect-ratio');
            this.centerLatNum = () => parseFloat(centerLat.Get() ?? String(DEFAULT_CENTER.lat));
            this.centerLngNum = () => parseFloat(centerLng.Get() ?? String(DEFAULT_CENTER.lng));
            this.zoomNum = () => parseInt(zoom.Get() ?? '13', 10) || 13;
            this.hasMarker = () => this.getAttribute('marker') !== 'false';
            this.stageStyle = () => {
                /** @name        ar
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned ar value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const ar = aspectRatio.Get() ?? '16/9';
                return `aspect-ratio: ${ar}`;
            };
            this.providerBadge = () => this.getProvider().toUpperCase();
            // Build URLs reactively — getEmbedUrl/getOpenUrl read attributes lazily,
            // so any attribute change triggers a re-render.
            this.iframeSrc = () => this.getEmbedUrl();
            this.openHref = () => this.getOpenUrl();
            this.template = html `
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
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {MapEmbed.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = MapEmbed.DefaultSheet();
        }
        // ── Subclass contract ────────────────────────────────────────────────────
        /** Provider identifier — must be unique per concrete subclass. */
        abstract getProvider(): Types.MapProvider;

        /** Builds the iframe `src` URL from the current attributes. */
        protected abstract getEmbedUrl(): string;

        /** Public link in new tab. Default: Google Maps coords URL. */
        protected getOpenUrl(): string
        {
            return `https://www.google.com/maps/@${this.centerLatNum()},${this.centerLngNum()},${this.zoomNum()}z`;
        }
        // ── Programmatic API (shared) ────────────────────────────────────────────
        /** @name        setLocation
         *  @public
         *  @type        {this}
         *  @description Component member for set Location.
         *  @param       {MapEmbed.Interfaces.LatLng} center Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setLocation(center: Interfaces.LatLng): this
        {
            this.setAttribute('center-lat', String(center.lat));
            this.setAttribute('center-lng', String(center.lng));
            return this;
        }

        /** @name        setZoom
         *  @public
         *  @type        {this}
         *  @description Component member for set Zoom.
         *  @param       {number} z Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setZoom(z: number): this
        {
            this.setAttribute('zoom', String(Math.max(1, Math.min(20, z))));
            return this;
        }

        /** @name        setMarker
         *  @public
         *  @type        {this}
         *  @description Component member for set Marker.
         *  @param       {boolean} on Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        setMarker(on: boolean): this
        {
            this.setAttribute('marker', on ? 'true' : 'false');
            return this;
        }

        /** @name        reload
         *  @public
         *  @type        {this}
         *  @description Component member for reload.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        reload(): this
        {
            /** @name        iframe
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned iframe value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const iframe = this.querySelector<HTMLIFrameElement>('iframe.ar-map__iframe');
            if (iframe)
                iframe.src = this.getEmbedUrl();
            return this;
        }

        /** @name        getCenter
         *  @public
         *  @type        {MapEmbed.Interfaces.LatLng}
         *  @description Component member for get Center.
         *  @returns     {MapEmbed.Interfaces.LatLng} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getCenter(): Interfaces.LatLng { return { lat: this.centerLatNum(), lng: this.centerLngNum() }; }

        /** @name        getZoom
         *  @public
         *  @type        {number}
         *  @description Component member for get Zoom.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getZoom(): number { return this.zoomNum(); }

        /** @name        onCreated
         *  @public
         *  @type        {void}
         *  @description Component member for on Created.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onCreated() { }

        /** @name        onBeforeMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeMount() { }

        /** @name        onMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onMount() { }

        /** @name        onBeforeUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUpdate() { }

        /** @name        onUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUpdate() { }

        /** @name        onBeforeUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUnmount() { }

        /** @name        onUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUnmount() { }
        // ── Attr getters/setters (typed) ────────────────────────────────────────
        /** @name        centerLat
         *  @public
         *  @type        {number}
         *  @description Component member for center Lat.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get centerLat(): number { return this.centerLatNum(); }

        /** @name        centerLat
         *  @public
         *  @type        {void}
         *  @description Component member for center Lat.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set centerLat(v: number) { this.setAttribute('center-lat', String(v)); }

        /** @name        centerLng
         *  @public
         *  @type        {number}
         *  @description Component member for center Lng.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get centerLng(): number { return this.centerLngNum(); }

        /** @name        centerLng
         *  @public
         *  @type        {void}
         *  @description Component member for center Lng.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set centerLng(v: number) { this.setAttribute('center-lng', String(v)); }

        /** @name        zoom
         *  @public
         *  @type        {number}
         *  @description Component member for zoom.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get zoom(): number { return this.zoomNum(); }

        /** @name        zoom
         *  @public
         *  @type        {void}
         *  @description Component member for zoom.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set zoom(v: number) { this.setAttribute('zoom', String(v)); }

        /** @name        marker
         *  @public
         *  @type        {boolean}
         *  @description Component member for marker.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get marker(): boolean { return this.hasMarker(); }

        /** @name        marker
         *  @public
         *  @type        {void}
         *  @description Component member for marker.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set marker(v: boolean) { this.setAttribute('marker', v ? 'true' : 'false'); }

        /** @name        address
         *  @public
         *  @type        {string}
         *  @description Component member for address.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get address(): string { return this.getAttribute('address') ?? ''; }

        /** @name        address
         *  @public
         *  @type        {void}
         *  @description Component member for address.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set address(v: string) { v ? this.setAttribute('address', v) : this.removeAttribute('address'); }

        /** @name        label
         *  @public
         *  @type        {string}
         *  @description Component member for label.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get label(): string { return this.getAttribute('label') ?? ''; }

        /** @name        label
         *  @public
         *  @type        {void}
         *  @description Component member for label.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }

        /** @name        apiKey
         *  @public
         *  @type        {string}
         *  @description Component member for api Key.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get apiKey(): string { return this.getAttribute('api-key') ?? ''; }

        /** @name        apiKey
         *  @public
         *  @type        {void}
         *  @description Component member for api Key.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set apiKey(v: string) { v ? this.setAttribute('api-key', v) : this.removeAttribute('api-key'); }
        // ── Template helpers (set in build) ─────────────────────────────────────
        /** @name        centerLatNum
         *  @protected
         *  @type        {() => number}
         *  @description Component member for center Lat Num.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected centerLatNum: () => number = () => DEFAULT_CENTER.lat;

        /** @name        centerLngNum
         *  @protected
         *  @type        {() => number}
         *  @description Component member for center Lng Num.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected centerLngNum: () => number = () => DEFAULT_CENTER.lng;

        /** @name        zoomNum
         *  @protected
         *  @type        {() => number}
         *  @description Component member for zoom Num.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected zoomNum: () => number = () => 13;

        /** @name        hasMarker
         *  @protected
         *  @type        {() => boolean}
         *  @description Component member for has Marker.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected hasMarker: () => boolean = () => true;

        /** @name        stageStyle
         *  @protected
         *  @type        {() => string}
         *  @description Component member for stage Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected stageStyle: () => string = () => '';

        /** @name        providerBadge
         *  @protected
         *  @type        {() => string}
         *  @description Component member for provider Badge.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected providerBadge: () => string = () => '';

        /** @name        iframeSrc
         *  @protected
         *  @type        {() => string}
         *  @description Component member for iframe Src.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected iframeSrc: () => string = () => 'about:blank';

        /** @name        openHref
         *  @protected
         *  @type        {() => string}
         *  @description Component member for open Href.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected openHref: () => string = () => '#';

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {MapEmbed.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {MapEmbed.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 8px)',
                    color: 'var(--arianna-text, #1f2328)',
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '12px',
                    overflow: 'hidden',
                    position: 'relative',
                }),
                new Rule('.ar-map__stage', {
                    background: 'var(--arianna-bg-4, #ebebeb)',
                    minHeight: '200px',
                    position: 'relative',
                }),
                new Rule('.ar-map__iframe', {
                    border: '0',
                    display: 'block',
                    height: '100%',
                    left: '0',
                    position: 'absolute',
                    top: '0',
                    width: '100%',
                }),
                new Rule('.ar-map__chrome', {
                    alignItems: 'center',
                    background: 'var(--arianna-bg, #ffffff)',
                    borderTop: '1px solid var(--arianna-border, #d8d8d8)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                }),
                new Rule('.ar-map__badge', {
                    border: '1px solid var(--arianna-primary, #1f6feb)',
                    borderRadius: '10px',
                    color: 'var(--arianna-primary, #1f6feb)',
                    font: '10px ui-monospace, monospace',
                    letterSpacing: '0.08em',
                    padding: '2px 8px',
                    textTransform: 'uppercase',
                }),
                new Rule('.ar-map__open', {
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '3px',
                    color: 'var(--arianna-text, #1f2328)',
                    font: '11px sans-serif',
                    padding: '3px 8px',
                    textDecoration: 'none',
                    transition: 'background 0.14s ease',
                }),
                new Rule('.ar-map__open:hover', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
                // Fallback card (used by AppleMap when MapKit token absent + by BingMap)
                new Rule('.ar-map__fallback', {
                    alignItems: 'center',
                    color: 'var(--arianna-muted, #6e6b62)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    height: '100%',
                    justifyContent: 'center',
                    padding: '24px',
                    position: 'absolute',
                    inset: '0',
                    textAlign: 'center',
                }),
                new Rule('.ar-map__fallback svg', { opacity: '0.4' }),
                new Rule('.ar-map__fallback a', {
                    color: 'var(--arianna-primary, #1f6feb)',
                    fontWeight: '600',
                    textDecoration: 'none',
                }),
                new Rule('.ar-map__fallback a:hover', { textDecoration: 'underline' }),
                // Deprecation banner (used by BingMap)
                new Rule('.ar-map__deprecation', {
                    background: 'var(--arianna-warning-bg, #fff8e1)',
                    borderBottom: '1px solid var(--arianna-warning, #f5a623)',
                    color: 'var(--arianna-warning-text, #7a4a00)',
                    fontSize: '11px',
                    padding: '6px 10px',
                    textAlign: 'center',
                }),
                new Rule('@media (max-width: 600px)', {
                    '.ar-map__stage': { minHeight: '160px' },
                    '.ar-map__chrome': { padding: '4px 8px' },
                    '.ar-map__badge': { fontSize: '9px', padding: '1px 6px' },
                } as never),
            ]);
        }
    }
}

export type MapProvider = MapEmbed.Types.MapProvider;
