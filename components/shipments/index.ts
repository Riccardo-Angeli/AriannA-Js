/**
 * @module    components/shipments
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Barrel — shipment-tracking widgets. Importing this module side-effect-
 * registers 6 custom-element tags + re-exports their classes and types.
 *
 * # Tags registered
 *
 *   arianna-tracker          Tracker        (base — works with any CarrierConfig)
 *   arianna-dhl-tracker      DHLTracker     (DHL pre-bound carrier)
 *   arianna-ups-tracker      UPSTracker     (UPS pre-bound carrier)
 *   arianna-fedex-tracker    FedExTracker   (FedEx pre-bound carrier)
 *   arianna-brt-tracker      BRTTracker     (BRT pre-bound carrier)
 *   arianna-tracking-multi   TrackingMulti  (auto-detect carrier from number)
 *
 * # Common event surface
 *
 *   arianna:tracking-portal   detail: { carrier: string, url: string }
 *   arianna:tracking-event    detail: { event: TrackingEvent }
 *   arianna:carrier-detected  detail: { carrier, candidates }   (TrackingMulti only)
 *
 * All events bubble. Subscribe at the page root for a unified callback:
 *
 *   document.addEventListener('arianna:tracking-portal', e =>
 *     analytics.track('portal_open', { carrier: e.detail.carrier }));
 *
 * # API access
 *
 * Live carrier APIs require server-side credentials (DHL Tracking API key,
 * UPS OAuth, FedEx API client, BRT auth) that must NEVER ship to the
 * browser. The widgets expect the merchant server to fetch, normalise, and
 * feed events via `setEvents()`. As an escape hatch, the widgets can also
 * operate in pure "link" mode — only the public tracking URL is exposed via
 * the "Track on <carrier> →" button.
 */

export { Tracker } from './Tracker.ts';
export type {
    TrackingEventKind, TrackingEvent, CarrierConfig, TrackerOptions,
} from './Tracker.ts';

export { DHLTracker }   from './DHLTracker.ts';
export type { DHLTrackerOptions } from './DHLTracker.ts';

export { UPSTracker }   from './UPSTracker.ts';
export type { UPSTrackerOptions } from './UPSTracker.ts';

export { FedExTracker } from './FedExTracker.ts';
export type { FedExTrackerOptions } from './FedExTracker.ts';

export { BRTTracker }   from './BRTTracker.ts';
export type { BRTTrackerOptions } from './BRTTracker.ts';

export { TrackingMulti } from './TrackingMulti.ts';
export type { CarrierId, TrackingMultiOptions } from './TrackingMulti.ts';
