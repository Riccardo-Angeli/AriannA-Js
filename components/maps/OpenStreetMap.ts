/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/maps/OpenStreetMap
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * OpenStreetMap — OSM iframe embed via `openstreetmap.org/export/embed.html`.
 * Free, no key required. Standard Mapnik tile layer; supports a single
 * marker via the `marker` attribute.
 *
 * Bounding-box conversion from zoom: `span = 0.6 / 2^(zoom - 8)`. Empirically
 * matches the OSM tile sizes well enough for the common 10-18 zoom band.
 *
 * @example HTML
 *   <arianna-osm-map center-lat="48.8584" center-lng="2.2945" zoom="15" marker></arianna-osm-map>
 *
 * Attributes (inherited): center-lat, center-lng, zoom, marker, aspect-ratio,
 *                    layer ('mapnik' | 'cyclemap' | 'transportmap' | 'hot')
 */
import { Component } from '../../core/index.ts';
import { MapEmbed, type MapProvider } from './MapEmbed.ts';

/** @namespace   OpenStreetMap
 *  @public
 *  @description Namespace containing OpenStreetMap contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace OpenStreetMap
{
    /** @class       OpenStreetMap
     *  @public
     *  @description AriannA OpenStreetMap component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-osm-map', {}, {
        Attributes: [
            'center-lat', 'center-lng', 'zoom', 'marker', 'label', 'address',
            'aspect-ratio', 'layer',
        ],
    })
    export class OpenStreetMap extends MapEmbed.MapEmbed
    {
        /** @name        getProvider
         *  @public
         *  @type        {MapProvider}
         *  @description Component member for get Provider.
         *  @returns     {MapProvider} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getProvider(): MapProvider { return 'osm'; }

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

            /** @name        layer
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned layer value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const layer = this.getAttribute('layer') ?? 'mapnik';
            // Span heuristic: smaller numbers = tighter bbox = higher visual zoom
            /** @name        span
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned span value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const span = 0.6 / Math.pow(2, zoom - 8);

            /** @name        bbox
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned bbox value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const bbox = `${lng - span},${lat - span / 2},${lng + span},${lat + span / 2}`;

            /** @name        marker
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned marker value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const marker = this.hasMarker() ? `&marker=${lat}%2C${lng}` : '';
            return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=${layer}${marker}`;
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
            return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${this.zoomNum()}/${lat}/${lng}`;
        }
    }
}
export default OpenStreetMap;
