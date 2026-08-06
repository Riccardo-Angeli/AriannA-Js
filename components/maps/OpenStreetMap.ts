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
@Component('arianna-osm-map', {}, {
    Attributes: [
        'center-lat', 'center-lng', 'zoom', 'marker', 'label', 'address',
        'aspect-ratio', 'layer',
    ],
})
export class OpenStreetMap extends MapEmbed {
    getProvider(): MapProvider { return 'osm'; }
    protected getEmbedUrl(): string {
        const lat = this.centerLatNum();
        const lng = this.centerLngNum();
        const zoom = this.zoomNum();
        const layer = this.getAttribute('layer') ?? 'mapnik';
        // Span heuristic: smaller numbers = tighter bbox = higher visual zoom
        const span = 0.6 / Math.pow(2, zoom - 8);
        const bbox = `${lng - span},${lat - span / 2},${lng + span},${lat + span / 2}`;
        const marker = this.hasMarker() ? `&marker=${lat}%2C${lng}` : '';
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=${layer}${marker}`;
    }
    protected getOpenUrl(): string {
        const lat = this.centerLatNum();
        const lng = this.centerLngNum();
        return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${this.zoomNum()}/${lat}/${lng}`;
    }
}
/* ──────────────────────────────────────────────────────────────────────────
 * OpenStreetMap namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace OpenStreetMap {
}
export default OpenStreetMap;
