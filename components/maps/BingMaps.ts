// components/maps/BingMaps.ts — re-export façade for Microsoft Bing Maps embedder.
// (Internally the class is exported as BingMap to match the provider name.)
export { BingMap } from './MapEmbed';
export type { LatLng, MapEmbedOptions, MapProvider } from './MapEmbed';
