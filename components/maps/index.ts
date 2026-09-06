/** @module components/maps */
export { default as GoogleMap } from './GoogleMap.ts';
export { default as OpenStreetMap } from './OpenStreetMap.ts';
export { default as AppleMap } from './AppleMap.ts';
export { default as MapLibreMap } from './MapLibreMap.ts';

export { default as GoogleMaps } from './GoogleMap.ts';
export { default as OpenStreetMaps } from './OpenStreetMap.ts';
export { default as AppleMaps } from './AppleMap.ts';
export { default as MapLibreMaps } from './MapLibreMap.ts';

export interface LatLng { lat:number; lng:number; }
export interface MapOptions { center?:LatLng; zoom?:number; marker?:boolean; label?:string; address?:string; aspectRatio?:string; }
export type MapProvider = 'google' | 'osm' | 'apple' | 'maplibre';
