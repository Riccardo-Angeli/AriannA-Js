/**
 * @module    components/maps/AzureMap
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA AzureMap component module.
 */

import { Component, Components, Css, Templates } from '../../core/index.ts';
import { MapEmbed, type MapProvider } from './MapEmbed.ts';

/** @namespace   AzureMap
 *  @public
 *  @description Namespace containing AzureMap contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace AzureMap
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

    /** @class       AzureMap
     *  @public
     *  @description AriannA AzureMap component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-azure-map', {}, {
        Attributes: [
            'center-lat', 'center-lng', 'zoom', 'marker', 'label', 'address',
            'aspect-ratio', 'api-key', 'style', 'tileset',
        ],
    })
    export class AzureMap extends MapEmbed.MapEmbed
    {
        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        getProvider
         *  @public
         *  @type        {MapProvider}
         *  @description Component member for get Provider.
         *  @returns     {MapProvider} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getProvider(): MapProvider { return 'azure'; }

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
            // Returned only as fallback for the standard template path; we override
            // the template in onConnected() to render via <img> because Azure has no
            // iframe-safe public embed URL.
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
            // Azure Maps has no "open in app" URL; deep-link to the Bing successor
            // (which still has a working map view via search).
            return `https://www.bing.com/maps?cp=${this.centerLatNum()}~${this.centerLngNum()}&lvl=${this.zoomNum()}`;
        }

        /** Build the static-render image URL. */
        #imageSrc(): string
        {
            /** @name        apiKey
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned apiKey value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const apiKey = this.getAttribute('api-key');
            if (!apiKey)
                return '';

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

            /** @name        zoom
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned zoom value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const zoom = this.zoomNum();

            /** @name        mapStyle
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned mapStyle value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const mapStyle = this.getAttribute('style') ?? 'road';

            /** @name        tileset
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tileset value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tileset = this.getAttribute('tileset') ?? `microsoft.base.${mapStyle}`;
            // Size — large enough for a typical 16:9 stage on desktop
            /** @name        w
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned w value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const w = 1024, h = 576;

            /** @name        params
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned params value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const params = new URLSearchParams({
                'api-version': '2024-04-01',
                'tilesetId': tileset,
                'subscription-key': apiKey,
                'zoom': String(zoom),
                'center': `${lng},${lat}`,
                'width': String(w),
                'height': String(h),
            });
            if (this.hasMarker())
            {
                // Pin marker syntax for Azure: `default|sc{scale}|co{hex}||lat,lng`
                params.set('pins', `default|sc1||${lng} ${lat}`);
            }
            return `https://atlas.microsoft.com/map/static?${params.toString()}`;
        }

        /** Override build to render an <img> rather than an iframe. */
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

            /** @name        apiKey
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned apiKey value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const apiKey = this.signal().attribute('api-key');
            this.centerLatNum = () => parseFloat(centerLat.Get() ?? '51.4779');
            this.centerLngNum = () => parseFloat(centerLng.Get() ?? '-0.0015');
            this.zoomNum = () => parseInt(this.getAttribute('zoom') ?? '13', 10) || 13;
            this.hasMarker = () => this.getAttribute('marker') !== 'false';
            this.stageStyle = () => `aspect-ratio: ${aspectRatio.Get() ?? '16/9'}`;
            this.providerBadge = () => 'AZURE';
            this.openHref = () => this.getOpenUrl();
            this.hasApiKey = () => !!apiKey.Get();
            this.notHasApiKey = () => !apiKey.Get();
            this.imgSrc = () => this.#imageSrc();
            this.template = html `
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
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {AzureMap.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = MapEmbed.MapEmbed.DefaultSheet();
        }
        // Template helpers added by AzureMap
        /** @name        hasApiKey
         *  @protected
         *  @type        {() => boolean}
         *  @description Component member for has Api Key.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected hasApiKey: () => boolean = () => false;

        /** @name        notHasApiKey
         *  @protected
         *  @type        {() => boolean}
         *  @description Component member for not Has Api Key.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected notHasApiKey: () => boolean = () => true;

        /** @name        imgSrc
         *  @protected
         *  @type        {() => string}
         *  @description Component member for img Src.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        protected imgSrc: () => string = () => '';
    }
}
export default AzureMap;
