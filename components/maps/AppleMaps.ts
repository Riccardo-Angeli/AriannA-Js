// components/maps/AppleMaps.ts — re-export façade for Apple Maps embedder.
// Note: renders only on Apple platforms (Safari / iOS / iPadOS / macOS).
// On other browsers AppleMap shows a deep-link fallback card.
export { AppleMap } from './MapEmbed';
export type { LatLng, MapEmbedOptions, MapProvider } from './MapEmbed';
