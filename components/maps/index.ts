// components/maps/index.ts — public surface of the Maps component group.
// Iframe-based map embedders with a unified API. Four providers swap
// transparently — Apple shows a deep-link fallback on non-Apple platforms.

export { MapEmbed, GoogleMap, OpenStreetMap, AppleMap, BingMap } from './MapEmbed';
export type { LatLng, MapEmbedOptions, MapProvider } from './MapEmbed';
