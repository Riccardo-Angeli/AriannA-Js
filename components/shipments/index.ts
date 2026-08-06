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
import { Tracker as TrackerModule } from './Tracker.ts';
import { DHLTracker as DHLTrackerModule } from './DHLTracker.ts';
import { UPSTracker as UPSTrackerModule } from './UPSTracker.ts';
import { FedExTracker as FedExTrackerModule } from './FedExTracker.ts';
import { BRTTracker as BRTTrackerModule } from './BRTTracker.ts';
import { TrackingMulti as TrackingMultiModule } from './TrackingMulti.ts';

export const Tracker = TrackerModule.Tracker;
export type TrackingEventKind = TrackerModule.TrackingEventKind;
export type TrackingEvent = TrackerModule.TrackingEvent;
export type CarrierConfig = TrackerModule.CarrierConfig;
export type TrackerOptions = TrackerModule.TrackerOptions;

export const DHLTracker = DHLTrackerModule.DHLTracker;
export type DHLTrackerOptions = DHLTrackerModule.Interfaces.DHLTrackerOptions;

export const UPSTracker = UPSTrackerModule.UPSTracker;
export type UPSTrackerOptions = UPSTrackerModule.Interfaces.UPSTrackerOptions;

export const FedExTracker = FedExTrackerModule.FedExTracker;
export type FedExTrackerOptions = FedExTrackerModule.Interfaces.FedExTrackerOptions;

export const BRTTracker = BRTTrackerModule.BRTTracker;
export type BRTTrackerOptions = BRTTrackerModule.Interfaces.BRTTrackerOptions;

export const TrackingMulti = TrackingMultiModule.TrackingMulti;
export type CarrierId = TrackingMultiModule.Types.CarrierId;
export type TrackingMultiOptions = TrackingMultiModule.Interfaces.TrackingMultiOptions;
