// components/maps/GoogleMaps.ts — re-export façade for tree-shaking.
//
// The implementation lives in MapEmbed.ts alongside its OSM/Apple/Bing
// siblings. This file is a thin re-export so consumers can:
//   import { GoogleMap } from 'arianna/components/maps/GoogleMaps';
export { GoogleMap } from './MapEmbed';
export type { LatLng, MapEmbedOptions, MapProvider } from './MapEmbed';
