/**
 * @module    components/maps/GoogleMap
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * GoogleMap — Apple-friendly Google Maps embed with two modes:
 *
 *   • No API key (default) — uses the public `google.com/maps?q=…&output=embed`
 *     endpoint, free, unmetered, no Cloud project required. Supports a
 *     single marker at center (or address).
 *
 *   • API key (opt-in via `api-key` attr) — uses the official Maps Embed API
 *     `google.com/maps/embed/v1/{mode}` URL. Free with unlimited usage but
 *     requires a Cloud project + key. Supports modes: place, view,
 *     directions, streetview, search.
 *
 * @example HTML
 *   <!-- No-key path -->
 *   <arianna-google-map address="Eiffel Tower, Paris" zoom="14"></arianna-google-map>
 *
 *   <!-- With Maps Embed API key -->
 *   <arianna-google-map api-key="AIza..."
 *                       mode="place"
 *                       address="Eiffel Tower"
 *                       zoom="15"></arianna-google-map>
 *
 * @example JS
 *   const m = new GoogleMap();
 *   m.setLocation({ lat: 48.8584, lng: 2.2945 });
 *   m.setZoom(15);
 *   document.body.append(m);
 *
 * Attrs (inherited + own):
 *   center-lat, center-lng, zoom, marker, address, aspect-ratio, label,
 *   api-key, mode ('place' | 'view' | 'directions' | 'streetview' | 'search')
 */

import { MapEmbed, type MapProvider } from './MapEmbed.ts';
import { Component } from '../../core/Component.ts';

export class GoogleMap extends (Component('arianna-google-map', HTMLElement, {}, {
    attrs : [
        'center-lat', 'center-lng', 'zoom', 'marker', 'label', 'address',
        'aspect-ratio', 'api-key', 'mode',
    ],
}) as unknown as typeof MapEmbed)
{
    getProvider(): MapProvider { return 'google'; }

    protected getEmbedUrl(): string
    {
        const apiKey = this.getAttribute('api-key');
        if (apiKey) return this.#officialEmbedUrl(apiKey);
        return this.#publicEmbedUrl();
    }

    /**
     * Official Maps Embed API. Requires a project key but is free with
     * unlimited usage. Supports place, view, directions, streetview, search.
     */
    #officialEmbedUrl(apiKey: string): string
    {
        const mode    = (this.getAttribute('mode') ?? 'place');
        const lat     = this.centerLatNum();
        const lng     = this.centerLngNum();
        const zoom    = this.zoomNum();
        const address = this.getAttribute('address') ?? '';

        const base = `https://www.google.com/maps/embed/v1/${mode}?key=${encodeURIComponent(apiKey)}`;
        switch (mode) {
            case 'place':
                return `${base}&q=${encodeURIComponent(address || `${lat},${lng}`)}&zoom=${zoom}`;
            case 'view':
                return `${base}&center=${lat},${lng}&zoom=${zoom}`;
            case 'streetview':
                return `${base}&location=${lat},${lng}`;
            case 'search':
                return `${base}&q=${encodeURIComponent(address)}`;
            case 'directions': {
                // Caller can pass `origin` and `destination` as data attrs
                const origin = this.getAttribute('origin') ?? '';
                const dest   = this.getAttribute('destination') ?? address;
                return `${base}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}`;
            }
            default:
                return `${base}&q=${encodeURIComponent(address || `${lat},${lng}`)}`;
        }
    }

    /**
     * Public no-key embed. Still works (verified May 2026). Limited to a
     * single map view; the `output=embed` parameter tells Google to render
     * the iframe-safe variant.
     */
    #publicEmbedUrl(): string
    {
        const lat     = this.centerLatNum();
        const lng     = this.centerLngNum();
        const zoom    = this.zoomNum();
        const address = this.getAttribute('address') ?? '';
        const q = address ? encodeURIComponent(address) : `${lat},${lng}`;
        return `https://www.google.com/maps?q=${q}&z=${zoom}&output=embed`;
    }

    protected getOpenUrl(): string
    {
        const lat = this.centerLatNum();
        const lng = this.centerLngNum();
        const address = this.getAttribute('address');
        if (address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        return `https://www.google.com/maps/@${lat},${lng},${this.zoomNum()}z`;
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'GoogleMap', {
        value: GoogleMap, writable: false, enumerable: false, configurable: false,
    });
}

export default GoogleMap;
