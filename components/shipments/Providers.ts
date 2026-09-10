/**
 * @module components/shipments/Providers
 * @author Riccardo Angeli
 * @version 2.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 */

import type { CarrierConfig } from './Tracker.ts';


/**
 * Brand marks are referenced directly as SVG assets from the corresponding
 * Wikimedia Commons file endpoint.  No separate Logos registry/file is used:
 * the mark belongs to the provider definition that consumes it.
 */
function SvgLogo(file: string, label: string): string
{
    const url = `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file).replaceAll('%2F', '/')}`;
    return `<img src="${url}" alt="${label}" role="img" loading="eager" decoding="async"/>`;
}

export type ShipmentProviderId = 'dhl' | 'ups' | 'fedex' | 'brt' | 'poste-italiane' | 'gls';
export type ShipmentOperation = 'create' | 'track' | 'quote' | 'pickup';

export interface ShipmentApiCapability
{
    documented: boolean;
    browserSafe: boolean;
    serverProxyRequired: boolean;
    docs?: string;
    note?: string;
}

export interface ShipmentProviderConfig extends CarrierConfig
{
    id: ShipmentProviderId;
    createUrl?: string;
    api: Partial<Record<ShipmentOperation, ShipmentApiCapability>>;
}

/**
 * API policy:
 * - DHL, UPS and FedEx expose documented shipping/tracking APIs but credentials
 *   belong on a server. AriannA therefore calls the merchant's configurable
 *   proxy endpoint rather than placing carrier credentials in browser code.
 * - BRT, GLS Italia and Poste Italiane expose public create/track web flows,
 *   but no open developer API was found in their public documentation during
 *   the 2026-09-09 review. Their API flags remain false; the UI falls back to
 *   the official public portal until an authenticated contract/API is supplied.
 */
export namespace ShipmentProviders
{
    export const DHL: ShipmentProviderConfig = {
        id: 'dhl',
        name: 'DHL',
        color: '#D40511',
        publicUrl: 'https://www.dhl.com/global-en/home/tracking.html?tracking-id={n}',
        createUrl: 'https://mydhl.express.dhl/',
        pattern: /^(\d{10,11}|[A-Z]{3}\d{7})$/i,
        logo: SvgLogo('DHL_Logo.svg', 'DHL'),
        api: {
            track: { documented: true, browserSafe: false, serverProxyRequired: true, docs: 'https://developer.dhl.com/api-reference/dhl-express-mydhl-api' },
            create: { documented: true, browserSafe: false, serverProxyRequired: true, docs: 'https://developer.dhl.com/api-reference/dhl-express-mydhl-api' },
            quote: { documented: true, browserSafe: false, serverProxyRequired: true, docs: 'https://developer.dhl.com/api-reference/dhl-express-mydhl-api' },
            pickup: { documented: true, browserSafe: false, serverProxyRequired: true, docs: 'https://developer.dhl.com/api-reference/dhl-express-mydhl-api' },
        },
    };

    export const UPS: ShipmentProviderConfig = {
        id: 'ups',
        name: 'UPS',
        color: '#351C15',
        publicUrl: 'https://www.ups.com/track?tracknum={n}',
        createUrl: 'https://www.ups.com/ship',
        pattern: /^1Z[0-9A-Z]{16}$/i,
        logo: SvgLogo('United_Parcel_Service_logo_2014.svg', 'UPS'),
        api: {
            track: { documented: true, browserSafe: false, serverProxyRequired: true, docs: 'https://developer.ups.com/get-started' },
            create: { documented: true, browserSafe: false, serverProxyRequired: true, docs: 'https://developer.ups.com/get-started' },
            quote: { documented: true, browserSafe: false, serverProxyRequired: true, docs: 'https://developer.ups.com/get-started' },
            pickup: { documented: true, browserSafe: false, serverProxyRequired: true, docs: 'https://developer.ups.com/get-started' },
        },
    };

    export const FedEx: ShipmentProviderConfig = {
        id: 'fedex',
        name: 'FedEx',
        color: '#4D148C',
        publicUrl: 'https://www.fedex.com/fedextrack/?trknbr={n}',
        createUrl: 'https://www.fedex.com/en-it/shipping-tools.html',
        pattern: /^(\d{12}|\d{15}|\d{20})$/,
        logo: SvgLogo('FedEx_Corporation_-_2016_Logo.svg', 'FedEx'),
        api: {
            track: { documented: true, browserSafe: false, serverProxyRequired: true, docs: 'https://developer.fedex.com/api/it-it/catalog/track.html' },
            create: { documented: true, browserSafe: false, serverProxyRequired: true, docs: 'https://developer.fedex.com/api/it-it/home.html' },
            quote: { documented: true, browserSafe: false, serverProxyRequired: true, docs: 'https://developer.fedex.com/api/it-it/home.html' },
        },
    };

    export const BRT: ShipmentProviderConfig = {
        id: 'brt',
        name: 'BRT',
        color: '#E4003B',
        publicUrl: 'https://vas.brt.it/vas/sped_det_show.hsm?referer=sped_numspe_par.htm&Nspedizione={n}',
        createUrl: 'https://www.brt.it/it/come-spedire-online/',
        pattern: /^\d{10,12}$/,
        logo: SvgLogo('Logo_BRT.svg', 'BRT'),
        api: {
            track: { documented: false, browserSafe: false, serverProxyRequired: false, note: 'No open public developer API documented on brt.it; use api-url only with a merchant BRT integration.' },
            create: { documented: false, browserSafe: false, serverProxyRequired: false, note: 'Public online shipping flow is available; no open developer API documented on brt.it.' },
        },
    };

    export const PosteItaliane: ShipmentProviderConfig = {
        id: 'poste-italiane',
        name: 'Poste Italiane',
        color: '#F5D400',
        publicUrl: 'https://www.poste.it/cerca/index.html',
        createUrl: 'https://postedeliveryweb-retail.poste.it/postedeliveryweb/retail',
        pattern: /^(?:[A-Z]{2}\d{9}[A-Z]{2}|[A-Z0-9]{10,16})$/i,
        logo: SvgLogo('Logo_Poste_Italiane_(senza_sfondo).svg', 'Poste Italiane'),
        api: {
            track: { documented: false, browserSafe: false, serverProxyRequired: false, note: 'Public Cerca Spedizioni exists; no open public parcel-tracking developer API was found.' },
            create: { documented: false, browserSafe: false, serverProxyRequired: false, note: 'Poste Delivery Web exists; no open public parcel-creation developer API was found.' },
        },
    };

    export const GLS: ShipmentProviderConfig = {
        id: 'gls',
        name: 'GLS',
        color: '#10226B',
        publicUrl: 'https://gls-group.com/IT/it/servizi-online/ricerca-spedizioni.html?match={n}',
        createUrl: 'https://gls-group.com/IT/it/servizi-online/prenota-ritiro/',
        pattern: /^[A-Z0-9]{8,20}$/i,
        logo: SvgLogo('GLS_Logo_2021.svg', 'GLS'),
        api: {
            track: { documented: false, browserSafe: false, serverProxyRequired: false, note: 'GLS Italia exposes public tracking; no open public developer API was found on the public site.' },
            create: { documented: false, browserSafe: false, serverProxyRequired: false, note: 'GLS Italia exposes pickup/online services; no open public developer API was found on the public site.' },
        },
    };

    export const All: readonly ShipmentProviderConfig[] = Object.freeze([
        DHL, UPS, FedEx, BRT, PosteItaliane, GLS,
    ]);

    export function Get(id: string | null | undefined): ShipmentProviderConfig | undefined
    {
        if(!id) return undefined;
        const key = id.trim().toLowerCase();
        return All.find(provider => provider.id === key);
    }
}

export default ShipmentProviders;
