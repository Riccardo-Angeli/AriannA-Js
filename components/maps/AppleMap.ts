/**
 * @module    components/maps/AppleMap
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA AppleMap component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';
import { MapEmbed, type MapProvider } from './MapEmbed.ts';

declare global
{
    interface Window
    {
        mapkit?: AppleMap.Interfaces.MapKitGlobal;
    }
}

/** @namespace   AppleMap
 *  @public
 *  @description Namespace containing AppleMap contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace AppleMap
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
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** MapKit JS global injected by the SDK once loaded. */
        export interface MapKitGlobal
        {
            /** @name        init
             *  @public
             *  @type        {void}
             *  @description Component member for init.
             *  @param       {{
                authorizationCallback: (done: (token: string) => void) => void;
            }} opts Parameter.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            init(opts: {
                /** @name        authorizationCallback
                 *  @public
                 *  @type        {(done: (token: string) => void) => void}
                 *  @description Component member for authorization Callback.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                authorizationCallback: (done: (token: string) => void) => void;
            }): void;

            /** @name        Map
             *  @public
             *  @type        {new (el: HTMLElement, opts?: object) => {
                center: {
                    latitude: number;
                    longitude: number;
                };
                showsCompass: string;
                mapType: string;
                cameraDistance: number;
                setCenterAnimated(c: {
                    latitude: number;
                    longitude: number;
                }): void;
                addAnnotation(a: object): void;
                destroy?(): void;
            }}
             *  @description Component member for Map.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Map: new (el: HTMLElement, opts?: object) => {
                /** @name        center
                 *  @public
                 *  @type        {{
                    latitude: number;
                    longitude: number;
                }}
                 *  @description Component member for center.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                center: {
                    /** @name        latitude
                     *  @public
                     *  @type        {number}
                     *  @description Component member for latitude.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    latitude: number;

                    /** @name        longitude
                     *  @public
                     *  @type        {number}
                     *  @description Component member for longitude.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    longitude: number;
                };

                /** @name        showsCompass
                 *  @public
                 *  @type        {string}
                 *  @description Component member for shows Compass.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                showsCompass: string;

                /** @name        mapType
                 *  @public
                 *  @type        {string}
                 *  @description Component member for map Type.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                mapType: string;

                /** @name        cameraDistance
                 *  @public
                 *  @type        {number}
                 *  @description Component member for camera Distance.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                cameraDistance: number;

                /** @name        setCenterAnimated
                 *  @public
                 *  @type        {void}
                 *  @description Component member for set Center Animated.
                 *  @param       {{
                    latitude: number;
                    longitude: number;
                }} c Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                setCenterAnimated(c: {
                    /** @name        latitude
                     *  @public
                     *  @type        {number}
                     *  @description Component member for latitude.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    latitude: number;

                    /** @name        longitude
                     *  @public
                     *  @type        {number}
                     *  @description Component member for longitude.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    longitude: number;
                }): void;

                /** @name        addAnnotation
                 *  @public
                 *  @type        {void}
                 *  @description Component member for add Annotation.
                 *  @param       {object} a Parameter.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                addAnnotation(a: object): void;

                /** @name        destroy
                 *  @public
                 *  @type        {void}
                 *  @description Component member for destroy.
                 *  @returns     {void} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                destroy?(): void;
            };

            /** @name        MarkerAnnotation
             *  @public
             *  @type        {new (coord: object, opts?: object) => object}
             *  @description Component member for Marker Annotation.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            MarkerAnnotation: new (coord: object, opts?: object) => object;

            /** @name        Coordinate
             *  @public
             *  @type        {new (lat: number, lng: number) => object}
             *  @description Component member for Coordinate.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            Coordinate: new (lat: number, lng: number) => object;
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

    /** @name        MAPKIT_CDN
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned MAPKIT_CDN value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const MAPKIT_CDN = 'https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js';

    /** @name        mapKitLoadPromise
     *  @public
     *  @type        {Promise<AppleMap.Interfaces.MapKitGlobal> | null}
     *  @description Namespace-owned mapKitLoadPromise value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export let mapKitLoadPromise: Promise<Interfaces.MapKitGlobal> | null = null;
    export function loadMapKit(token: string): Promise<Interfaces.MapKitGlobal> {
        if (typeof window === 'undefined')
            return Promise.reject(new Error('No window'));
        if (window.mapkit)
        {
            // Re-init token if it changed (mapkit caches per-page).
            window.mapkit.init({ authorizationCallback: done => done(token) });
            return Promise.resolve(window.mapkit);
        }
        if (mapKitLoadPromise)
            return mapKitLoadPromise;
        mapKitLoadPromise = new Promise<Interfaces.MapKitGlobal>((resolve, reject) => {
            /** @name        script
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned script value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const script = document.createElement('script');
            script.src = MAPKIT_CDN;
            script.crossOrigin = 'anonymous';
            script.async = true;
            script.onload = () => {
                /** @name        mk
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned mk value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const mk = window.mapkit;
                if (!mk)
                {
                    reject(new Error('MapKit script loaded but window.mapkit is undefined'));
                    return;
                }
                try
                {
                    mk.init({ authorizationCallback: done => done(token) });
                    resolve(mk);
                }
                catch (e)
                {
                    reject(e);
                }
            };
            script.onerror = () => reject(new Error('Failed to load MapKit JS'));
            document.head.appendChild(script);
        });
        return mapKitLoadPromise;
    }

    /** @name        LoadMapKit
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned LoadMapKit value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function LoadMapKit
    (
        ...args: Parameters<typeof loadMapKit>
    ): ReturnType<typeof loadMapKit>
    {
        return loadMapKit(...args);
    }

    /** @class       AppleMap
     *  @public
     *  @description AriannA AppleMap component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-apple-map', {}, {
        Attributes: [
            'center-lat', 'center-lng', 'zoom', 'marker', 'label', 'address',
            'aspect-ratio', 'mapkit-token', 'map-type',
        ],
    })
    export class AppleMap extends MapEmbed.MapEmbed
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** The live MapKit instance, when MapKit JS path is active. */
        #mapkitInstance: {
            /** @name        destroy
             *  @public
             *  @type        {void}
             *  @description Component member for destroy.
             *  @returns     {void} Result.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            destroy?(): void;
        } | null = null;

        /** @name        getProvider
         *  @public
         *  @type        {MapProvider}
         *  @description Component member for get Provider.
         *  @returns     {MapProvider} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getProvider(): MapProvider { return 'apple'; }

        /** @name        getEmbedUrl
         *  @protected
         *  @type        {string}
         *  @description Component member for get Embed Url.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected getEmbedUrl(): string
        {
            // Returned only for the iframe `src` of the standard MapEmbed template;
            // we override the whole template in onConnected() to swap to fallback / MapKit.
            return 'about:blank';
        }

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

            /** @name        address
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned address value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const address = this.getAttribute('address');

            /** @name        params
             *  @public
             *  @type        {string[]}
             *  @description Namespace-owned params value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const params: string[] = [`ll=${lat},${lng}`, `z=${this.zoomNum()}`];
            if (address)
                params.push(`q=${encodeURIComponent(address)}`);
            return `https://maps.apple.com/?${params.join('&')}`;
        }

        /**
         * Override the standard build to support three states:
         *   - MapKit token present → load MapKit JS into a `<div>`
         *   - Else → render the styled fallback card
         */
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

            /** @name        tokenSig
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tokenSig value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tokenSig = this.signal().attribute('mapkit-token');
            this.centerLatNum = () => parseFloat(centerLat.Get() ?? '51.4779');
            this.centerLngNum = () => parseFloat(centerLng.Get() ?? '-0.0015');
            this.zoomNum = () => parseInt(this.getAttribute('zoom') ?? '13', 10) || 13;
            this.hasMarker = () => this.getAttribute('marker') !== 'false';
            this.stageStyle = () => `aspect-ratio: ${aspectRatio.Get() ?? '16/9'}`;
            this.providerBadge = () => 'APPLE';
            this.openHref = () => this.getOpenUrl();
            this.hasToken = () => !!tokenSig.Get();
            this.notHasToken = () => !tokenSig.Get();
            this.openInAppleMapsHref = () => this.getOpenUrl();
            this.template = html `
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
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {AppleMap.Types.Stylesheet | null}
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
        onMount()
        {
            /** @name        token
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned token value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const token = this.getAttribute('mapkit-token');
            if (token)
                this.#initMapKit(token);
        }

        /** @name        onUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUpdate()
        {
            /** @name        token
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned token value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const token = this.getAttribute('mapkit-token');
            if (token && !this.#mapkitInstance)
                this.#initMapKit(token);
        }

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
            if (this.#mapkitInstance && typeof this.#mapkitInstance.destroy === 'function')
            {
                try
                {
                    this.#mapkitInstance.destroy();
                }
                catch { /* ignore */ }
            }
            this.#mapkitInstance = null;
        }

        /** @name        #initMapKit
         *  @public
         *  @type        {void}
         *  @description Component member for init Map Kit.
         *  @param       {string} token Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #initMapKit(token: string): void
        {
            // Defer until template renders the host div
            queueMicrotask(() => {
                /** @name        host
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned host value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const host = this.querySelector<HTMLDivElement>('.ar-map__mapkit-host');
                if (!host)
                    return;
                loadMapKit(token)
                    .then(mk => {
                    /** @name        map
                     *  @public
                     *  @type        {inferred}
                     *  @description Namespace-owned map value.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    const map = new mk.Map(host, {
                        center: new mk.Coordinate(this.centerLatNum(), this.centerLngNum()),
                        mapType: this.getAttribute('map-type') ?? 'standard',
                    });
                    if (this.hasMarker())
                    {
                        /** @name        coord
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned coord value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const coord = new mk.Coordinate(this.centerLatNum(), this.centerLngNum());

                        /** @name        ann
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned ann value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
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
        /** @name        hasToken
         *  @protected
         *  @type        {() => boolean}
         *  @description Component member for has Token.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected hasToken: () => boolean = () => false;

        /** @name        notHasToken
         *  @protected
         *  @type        {() => boolean}
         *  @description Component member for not Has Token.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected notHasToken: () => boolean = () => true;

        /** @name        openInAppleMapsHref
         *  @protected
         *  @type        {() => string}
         *  @description Component member for open In Apple Maps Href.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected openInAppleMapsHref: () => string = () => '#';
    }
}
export default AppleMap;
