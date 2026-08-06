/**
 * @module    components/maps/MapLibreMap
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA MapLibreMap component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';
import { MapEmbed, type MapProvider } from './MapEmbed.ts';

declare global
{
    interface Window
    {
        maplibregl?: MapLibreMap.Interfaces.MapLibreGlobal;
    }
}

/** @namespace   MapLibreMap
 *  @public
 *  @description Namespace containing MapLibreMap contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace MapLibreMap
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Stylesheet
         *  @public
         *  @type        {Css.Stylesheet}
         *  @description Type alias for Stylesheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Stylesheet = Css.Stylesheet;

        /** @name        MapLibreInstance
         *  @public
         *  @type        {{
            setCenter(c: [
                number,
                number
            ]): void;
            setZoom(z: number): void;
            remove(): void;
            on(event: string, cb: () => void): void;
            addControl(c: object, position?: string): void;
        }}
         *  @description Type alias for MapLibreInstance.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type MapLibreInstance = {
            /** @name        setCenter
             *  @public
             *  @type        {void}
             *  @description Component member for set Center.
             *  @param       {[
                number,
                number
            ]} c Parameter.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            setCenter(c: [
                number,
                number
            ]): void;

            /** @name        setZoom
             *  @public
             *  @type        {void}
             *  @description Component member for set Zoom.
             *  @param       {number} z Parameter.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            setZoom(z: number): void;

            /** @name        remove
             *  @public
             *  @type        {void}
             *  @description Component member for remove.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            remove(): void;

            /** @name        on
             *  @public
             *  @type        {void}
             *  @description Component member for on.
             *  @param       {string} event Parameter.
             *  @param       {() => void} cb Parameter.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            on(event: string, cb: () => void): void;

            /** @name        addControl
             *  @public
             *  @type        {void}
             *  @description Component member for add Control.
             *  @param       {object} c Parameter.
             *  @param       {string} position Parameter.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            addControl(c: object, position?: string): void;
        };
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   MapLibreGlobal
         *  @public
         *  @description MapLibreGlobal contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface MapLibreGlobal
        {
            /** @name        Map
             *  @public
             *  @type        {new (opts: {
                container: HTMLElement;
                style: string;
                center: [
                    number,
                    number
                ];
                zoom: number;
                bearing?: number;
                pitch?: number;
            }) => {
                setCenter(c: [
                    number,
                    number
                ]): void;
                setZoom(z: number): void;
                remove(): void;
                on(event: string, cb: () => void): void;
                addControl(c: object, position?: string): void;
            }}
             *  @description Component member for Map.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Map: new (opts: {
                /** @name        container
                 *  @public
                 *  @type        {HTMLElement}
                 *  @description Component member for container.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                container: HTMLElement;

                /** @name        style
                 *  @public
                 *  @type        {string}
                 *  @description Component member for style.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                style: string;

                /** @name        center
                 *  @public
                 *  @type        {[
                    number,
                    number
                ]}
                 *  @description Component member for center.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                center: [
                    number,
                    number
                ];

                /** @name        zoom
                 *  @public
                 *  @type        {number}
                 *  @description Component member for zoom.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                zoom: number;

                /** @name        bearing
                 *  @public
                 *  @type        {number}
                 *  @description Component member for bearing.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                bearing?: number;

                /** @name        pitch
                 *  @public
                 *  @type        {number}
                 *  @description Component member for pitch.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                pitch?: number;
            }) => {
                /** @name        setCenter
                 *  @public
                 *  @type        {void}
                 *  @description Component member for set Center.
                 *  @param       {[
                    number,
                    number
                ]} c Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                setCenter(c: [
                    number,
                    number
                ]): void;

                /** @name        setZoom
                 *  @public
                 *  @type        {void}
                 *  @description Component member for set Zoom.
                 *  @param       {number} z Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                setZoom(z: number): void;

                /** @name        remove
                 *  @public
                 *  @type        {void}
                 *  @description Component member for remove.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                remove(): void;

                /** @name        on
                 *  @public
                 *  @type        {void}
                 *  @description Component member for on.
                 *  @param       {string} event Parameter.
                 *  @param       {() => void} cb Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                on(event: string, cb: () => void): void;

                /** @name        addControl
                 *  @public
                 *  @type        {void}
                 *  @description Component member for add Control.
                 *  @param       {object} c Parameter.
                 *  @param       {string} position Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                addControl(c: object, position?: string): void;
            };

            /** @name        Marker
             *  @public
             *  @type        {new (opts?: {
                color?: string;
            }) => {
                setLngLat(c: [
                    number,
                    number
                ]): {
                    addTo(map: object): void;
                };
            }}
             *  @description Component member for Marker.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Marker: new (opts?: {
                /** @name        color
                 *  @public
                 *  @type        {string}
                 *  @description Component member for color.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                color?: string;
            }) => {
                /** @name        setLngLat
                 *  @public
                 *  @type        {{
                    addTo(map: object): void;
                }}
                 *  @description Component member for set Lng Lat.
                 *  @param       {[
                    number,
                    number
                ]} c Parameter.
                 *  @returns     {{
                    addTo(map: object): void;
                }} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                setLngLat(c: [
                    number,
                    number
                ]): {
                    /** @name        addTo
                     *  @public
                     *  @type        {void}
                     *  @description Component member for add To.
                     *  @param       {object} map Parameter.
                     *  @returns     {void} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    addTo(map: object): void;
                };
            };

            /** @name        NavigationControl
             *  @public
             *  @type        {new (opts?: object) => object}
             *  @description Component member for Navigation Control.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            NavigationControl: new (opts?: object) => object;
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

    /** @name        { Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Stylesheet } = Css;

    /** @name        MAPLIBRE_JS_CDN
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned MAPLIBRE_JS_CDN value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const MAPLIBRE_JS_CDN = 'https://unpkg.com/maplibre-gl@4/dist/maplibre-gl.js';

    /** @name        MAPLIBRE_CSS_CDN
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned MAPLIBRE_CSS_CDN value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const MAPLIBRE_CSS_CDN = 'https://unpkg.com/maplibre-gl@4/dist/maplibre-gl.css';

    /** @name        DEFAULT_STYLE
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned DEFAULT_STYLE value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const DEFAULT_STYLE = 'https://demotiles.maplibre.org/style.json';

    /** @name        mapLibrePromise
     *  @public
     *  @type        {Promise<MapLibreMap.Interfaces.MapLibreGlobal> | null}
     *  @description Namespace-owned mapLibrePromise value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export let mapLibrePromise: Promise<Interfaces.MapLibreGlobal> | null = null;
    export function loadMapLibre(): Promise<Interfaces.MapLibreGlobal> {
        if (typeof window === 'undefined')
            return Promise.reject(new Error('No window'));
        if (window.maplibregl)
            return Promise.resolve(window.maplibregl);
        if (mapLibrePromise)
            return mapLibrePromise;
        mapLibrePromise = new Promise<Interfaces.MapLibreGlobal>((resolve, reject) => {
            // Inject CSS
            if (!document.querySelector(`link[href="${MAPLIBRE_CSS_CDN}"]`))
            {
                /** @name        link
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned link value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = MAPLIBRE_CSS_CDN;
                document.head.appendChild(link);
            }
            // Inject JS
            /** @name        script
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned script value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const script = document.createElement('script');
            script.src = MAPLIBRE_JS_CDN;
            script.async = true;
            script.onload = () => {
                /** @name        mg
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned mg value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const mg = window.maplibregl;
                if (mg)
                    resolve(mg);
                else
                    reject(new Error('MapLibre script loaded but global is undefined'));
            };
            script.onerror = () => reject(new Error('Failed to load MapLibre GL JS'));
            document.head.appendChild(script);
        });
        return mapLibrePromise;
    }

    /** @name        LoadMapLibre
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned LoadMapLibre value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function LoadMapLibre
    (
        ...args: Parameters<typeof loadMapLibre>
    ): ReturnType<typeof loadMapLibre>
    {
        return loadMapLibre(...args);
    }

    /** @class       MapLibreMap
     *  @public
     *  @description AriannA MapLibreMap component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-maplibre-map', {}, {
        Attributes: [
            'center-lat', 'center-lng', 'zoom', 'marker', 'label', 'address',
            'aspect-ratio', 'style-url', 'bearing', 'pitch',
        ],
    })
    export class MapLibreMap extends MapEmbed.MapEmbed
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        #instance
         *  @public
         *  @type        {MapLibreMap.Types.MapLibreInstance | null}
         *  @description Component member for instance.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #instance: Types.MapLibreInstance | null = null;

        /** @name        getProvider
         *  @public
         *  @type        {MapProvider}
         *  @description Component member for get Provider.
         *  @returns     {MapProvider} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getProvider(): MapProvider { return 'maplibre'; }

        /** @name        getEmbedUrl
         *  @protected
         *  @type        {string}
         *  @description Component member for get Embed Url.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected getEmbedUrl(): string { return 'about:blank'; }

        /** @name        getOpenUrl
         *  @protected
         *  @type        {string}
         *  @description Component member for get Open Url.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected getOpenUrl(): string
        {
            /** @name        lat
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned lat value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const lat = this.centerLatNum();

            /** @name        lng
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned lng value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const lng = this.centerLngNum();
            return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${this.zoomNum()}/${lat}/${lng}`;
        }

        /** Override to render a MapLibre host div instead of an iframe. */
        onConnected(_opts: object = {}): void
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

            /** @name        aspectRatio
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned aspectRatio value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const aspectRatio = this.signal().attribute('aspect-ratio');
            this.centerLatNum = () => parseFloat(centerLat.Get() ?? '51.4779');
            this.centerLngNum = () => parseFloat(centerLng.Get() ?? '-0.0015');
            this.zoomNum = () => parseInt(this.getAttribute('zoom') ?? '13', 10) || 13;
            this.hasMarker = () => this.getAttribute('marker') !== 'false';
            this.stageStyle = () => `aspect-ratio: ${aspectRatio.Get() ?? '16/9'}`;
            this.providerBadge = () => 'MAPLIBRE';
            this.openHref = () => this.getOpenUrl();
            this.template = html `
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
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {MapLibreMap.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = MapEmbed.MapEmbed.DefaultSheet();
        }

        /** @name        onMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onMount() { this.#initMapLibre(); }

        /** @name        onUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUnmount()
        {
            if (this.#instance)
            {
                try
                {
                    this.#instance.remove();
                }
                catch { /* ignore */ }
                this.#instance = null;
            }
        }

        /** @name        #initMapLibre
         *  @public
         *  @type        {void}
         *  @description Component member for init Map Libre.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #initMapLibre(): void
        {
            queueMicrotask(() => {
                /** @name        host
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned host value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const host = this.querySelector<HTMLDivElement>('.ar-map__maplibre-host');
                if (!host)
                    return;
                loadMapLibre()
                    .then(mg => {
                    /** @name        styleUrl
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned styleUrl value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const styleUrl = this.getAttribute('style-url') ?? DEFAULT_STYLE;

                    /** @name        bearing
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned bearing value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const bearing = parseFloat(this.getAttribute('bearing') ?? '0') || 0;

                    /** @name        pitch
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned pitch value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const pitch = parseFloat(this.getAttribute('pitch') ?? '0') || 0;

                    /** @name        map
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned map value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const map = new mg.Map({
                        container: host,
                        style: styleUrl,
                        center: [this.centerLngNum(), this.centerLatNum()],
                        zoom: this.zoomNum(),
                        bearing,
                        pitch,
                    });
                    map.addControl(new mg.NavigationControl(), 'top-right');
                    if (this.hasMarker())
                    {
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
}
export default MapLibreMap;
