/**
 * @module components/shipments
 * @author Riccardo Angeli
 * @version 2.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 *
 * Shipment applications with a common Create / Track shell.
 * DHL, UPS and FedEx have documented carrier APIs and are intended to be
 * connected through a server-side merchant proxy. BRT, Poste Italiane and
 * GLS fall back to their official web flows unless an authenticated api-url
 * is explicitly supplied by the application.
 */

import { Tracker as TrackerModule } from './Tracker.ts';
import { ShipmentCreate as ShipmentCreateModule } from './Create.ts';
import { CarrierShipment as CarrierShipmentModule } from './Carrier.ts';
import { ShipmentProviders as ShipmentProvidersModule } from './Providers.ts';
import { DHLTracker as DHLTrackerModule } from './DHLTracker.ts';
import { UPSTracker as UPSTrackerModule } from './UPSTracker.ts';
import { FedExTracker as FedExTrackerModule } from './FedExTracker.ts';
import { BRTTracker as BRTTrackerModule } from './BRTTracker.ts';
import { PosteItalianeTracker as PosteItalianeTrackerModule } from './PosteItalianeTracker.ts';
import { GLSTracker as GLSTrackerModule } from './GLSTracker.ts';
import { TrackingMulti as TrackingMultiModule } from './TrackingMulti.ts';

export const Tracker = TrackerModule.Tracker;
export type TrackingEventKind = TrackerModule.TrackingEventKind;
export type TrackingEvent = TrackerModule.TrackingEvent;
export type CarrierConfig = TrackerModule.CarrierConfig;
export type TrackerOptions = TrackerModule.TrackerOptions;

export const ShipmentCreate = ShipmentCreateModule.ShipmentCreate;
export type ShipmentAddress = ShipmentCreateModule.Address;
export type ShipmentParcel = ShipmentCreateModule.Parcel;
export type ShipmentCreateRequest = ShipmentCreateModule.Request;
export type ShipmentCreateResult = ShipmentCreateModule.Result;

export const CarrierShipment = CarrierShipmentModule.CarrierShipment;
export type ShipmentMode = CarrierShipmentModule.Mode;

export const ShipmentProviders = ShipmentProvidersModule;
export type { ShipmentProviderId, ShipmentOperation, ShipmentApiCapability, ShipmentProviderConfig } from './Providers.ts';

export const DHLTracker = DHLTrackerModule.DHLTracker;
export type DHLTrackerOptions = DHLTrackerModule.Interfaces.DHLTrackerOptions;

export const UPSTracker = UPSTrackerModule.UPSTracker;
export type UPSTrackerOptions = UPSTrackerModule.Interfaces.UPSTrackerOptions;

export const FedExTracker = FedExTrackerModule.FedExTracker;
export type FedExTrackerOptions = FedExTrackerModule.Interfaces.FedExTrackerOptions;

export const BRTTracker = BRTTrackerModule.BRTTracker;
export type BRTTrackerOptions = BRTTrackerModule.Interfaces.BRTTrackerOptions;

export const PosteItalianeTracker = PosteItalianeTrackerModule.PosteItalianeTracker;
export type PosteItalianeTrackerOptions = PosteItalianeTrackerModule.Interfaces.PosteItalianeTrackerOptions;

export const GLSTracker = GLSTrackerModule.GLSTracker;
export type GLSTrackerOptions = GLSTrackerModule.Interfaces.GLSTrackerOptions;

export const TrackingMulti = TrackingMultiModule.TrackingMulti;
export type CarrierId = TrackingMultiModule.Types.CarrierId;
export type TrackingMultiOptions = TrackingMultiModule.Interfaces.TrackingMultiOptions;
