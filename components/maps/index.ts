/**
 * @module    components/maps
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Barrel — map embedder components (verified working May 2026).
 * Importing this module side-effect-registers 6 custom-element tags so the
 * tags become available in HTML markup, plus re-exports the classes and
 * shared types.
 *
 * # Tags registered
 *
 *   arianna-google-map     ✅  no key needed; opt-in API key for advanced modes
 *   arianna-osm-map        ✅  OpenStreetMap; no key
 *   arianna-apple-map      ⚠   fallback card by default; MapKit JS via JWT
 *   arianna-bing-map       ⚠   DEPRECATED (free tier retired 30 Jun 2025)
 *   arianna-azure-map      ✅  Microsoft Azure Maps; API key required
 *   arianna-maplibre-map   ✅  MapLibre GL JS (OSS); no key by default
 *
 * # Provider matrix
 *
 * | Provider     | Key needed | Interactive | Notes                          |
 * |--------------|------------|-------------|--------------------------------|
 * | google       | optional   | yes (iframe)| Public endpoint works no-key   |
 * | osm          | no         | yes (iframe)| Free tile usage policy applies |
 * | apple        | JWT*       | yes via SDK | *Card-only without token       |
 * | bing         | no         | yes (iframe)| Deprecated; use azure          |
 * | azure        | yes        | static img  | Use SDK for interactive        |
 * | maplibre     | no         | yes (WebGL) | Recommended for new projects   |
 *
 * # Recommendation for new code
 *
 *   For simple embeds:        `<arianna-osm-map>` or `<arianna-google-map>`
 *   For commercial sites:     `<arianna-google-map api-key="...">`
 *   For full interactive OSS: `<arianna-maplibre-map>`
 *   Avoid:                    `<arianna-bing-map>` (use azure or maplibre)
 */

export { MapEmbed }       from './MapEmbed.ts';
export { GoogleMap }      from './GoogleMap.ts';
export { OpenStreetMap }  from './OpenStreetMap.ts';
export { AppleMap }       from './AppleMap.ts';
export { AzureMap }       from './AzureMap.ts';
export { MapLibreMap }    from './MapLibreMap.ts';

export type {
    LatLng, MapProvider, MapEmbedOptions,
} from './MapEmbed.ts';
