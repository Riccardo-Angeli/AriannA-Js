/**
 * @module    components/automotive/Cockpit
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description Full automotive digital cockpit surface for AriannA. The state contract
 *              intentionally covers ICE, hybrid and EV vehicles, ADAS, navigation,
 *              occupants, chassis, energy, climate, media, phone and diagnostics.
 */

import { Component, Css, Templates } from '../../core/index.ts';

export namespace Cockpit
{
    export namespace Types
    {
        export type Theme = 'dark' | 'light';
        export type Gear = 'P' | 'R' | 'N' | 'D' | 'S' | 'B' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | string;
        export type DriveMode = 'eco' | 'comfort' | 'normal' | 'sport' | 'sport+' | 'snow' | 'sand' | 'mud' | 'rock' | 'trail' | 'custom' | string;
        export type Severity = 'info' | 'success' | 'warning' | 'danger' | 'critical';
        export type LaneState = 'none' | 'detected' | 'warning' | 'intervening';
        export type AdasStatus = 'off' | 'standby' | 'active' | 'limited' | 'fault';
    }

    export namespace Interfaces
    {
        export interface VehicleIdentity
        {
            make?: string; model?: string; trim?: string; modelYear?: number; vin?: string;
            powertrain?: 'ice' | 'mhev' | 'hev' | 'phev' | 'bev' | 'hydrogen';
            drivetrain?: 'fwd' | 'rwd' | 'awd' | '4wd';
        }
        export interface Motion
        {
            speed?: number; speedUnit?: 'km/h' | 'mph'; rpm?: number; rpmMax?: number; gear?: Types.Gear;
            acceleration?: number; lateralG?: number; longitudinalG?: number; yawRate?: number;
            heading?: number; altitude?: number; pitch?: number; roll?: number;
            odometer?: number; tripA?: number; tripB?: number; averageSpeed?: number;
        }
        export interface Powertrain
        {
            engineRunning?: boolean; engineTemp?: number; oilTemp?: number; oilPressure?: number;
            transmissionTemp?: number; torque?: number; torqueUnit?: 'Nm' | 'lb-ft'; power?: number; powerUnit?: 'kW' | 'hp';
            boost?: number; boostUnit?: 'bar' | 'psi'; throttle?: number; regen?: number;
            motorFrontPower?: number; motorRearPower?: number; inverterTemp?: number;
        }
        export interface Energy
        {
            fuelLevel?: number; fuelRange?: number; fuelConsumption?: number; fuelConsumptionUnit?: 'l/100km' | 'mpg';
            batterySoc?: number; batteryRange?: number; batteryPower?: number; batteryTemp?: number; batteryVoltage?: number;
            charging?: boolean; chargingPower?: number; chargingLimit?: number; chargingTimeRemaining?: number; chargePortOpen?: boolean;
            energyConsumption?: number; energyConsumptionUnit?: 'kWh/100km' | 'Wh/km' | 'mi/kWh';
        }
        export interface Tire
        {
            position: 'FL' | 'FR' | 'RL' | 'RR'; pressure?: number; pressureUnit?: 'bar' | 'psi' | 'kPa'; temperature?: number; warning?: boolean;
        }
        export interface Chassis
        {
            steeringAngle?: number; brakePressure?: number; brakeTempFront?: number; brakeTempRear?: number;
            suspensionFront?: number; suspensionRear?: number; rideHeight?: number;
            absActive?: boolean; escActive?: boolean; tractionActive?: boolean; hillDescentActive?: boolean;
            differentialLockFront?: boolean; differentialLockCenter?: boolean; differentialLockRear?: boolean;
            tires?: Tire[];
        }
        export interface Adas
        {
            cruise?: Types.AdasStatus; cruiseSetSpeed?: number; adaptiveCruise?: Types.AdasStatus; followingDistance?: number;
            laneKeep?: Types.AdasStatus; laneDeparture?: Types.LaneState; leftLane?: Types.LaneState; rightLane?: Types.LaneState;
            blindSpotLeft?: boolean; blindSpotRight?: boolean; forwardCollision?: Types.AdasStatus; emergencyBraking?: Types.AdasStatus;
            trafficSignRecognition?: boolean; speedLimit?: number; driverAttention?: Types.AdasStatus; handsOnWheel?: boolean;
            parkingSensors?: Types.AdasStatus; parkAssist?: Types.AdasStatus; rearCrossTraffic?: Types.AdasStatus;
            nightVision?: Types.AdasStatus; autonomousLevel?: 0 | 1 | 2 | 3 | 4 | 5;
        }
        export interface Navigation
        {
            active?: boolean; street?: string; instruction?: string; maneuver?: string; distanceToManeuver?: number;
            remainingDistance?: number; eta?: string; arrivalTime?: string; speedLimit?: number;
            latitude?: number; longitude?: number; compass?: string;
        }
        export interface Climate
        {
            ambientTemp?: number; cabinTemp?: number; driverTemp?: number; passengerTemp?: number;
            fanSpeed?: number; auto?: boolean; ac?: boolean; recirculation?: boolean; defrostFront?: boolean; defrostRear?: boolean;
            heatedSeatDriver?: number; heatedSeatPassenger?: number; ventilatedSeatDriver?: number; ventilatedSeatPassenger?: number;
            heatedSteeringWheel?: boolean; airQuality?: number;
        }
        export interface Occupants
        {
            driverPresent?: boolean; passengerPresent?: boolean; rearLeftPresent?: boolean; rearRightPresent?: boolean;
            driverBelt?: boolean; passengerBelt?: boolean; rearLeftBelt?: boolean; rearRightBelt?: boolean;
            childLock?: boolean;
        }
        export interface Body
        {
            doorFL?: boolean; doorFR?: boolean; doorRL?: boolean; doorRR?: boolean; hood?: boolean; trunk?: boolean;
            parkingBrake?: boolean; autoHold?: boolean; windowsOpen?: boolean; sunroofOpen?: boolean;
            headlights?: 'off' | 'auto' | 'position' | 'low' | 'high'; highBeamAssist?: boolean;
            fogFront?: boolean; fogRear?: boolean; turnLeft?: boolean; turnRight?: boolean; hazards?: boolean;
            wipers?: 'off' | 'auto' | 'intermittent' | 'low' | 'high'; washerLow?: boolean;
        }
        export interface Media
        {
            source?: string; title?: string; artist?: string; album?: string; artwork?: string; playing?: boolean; volume?: number;
        }
        export interface Phone
        {
            connected?: boolean; name?: string; signal?: number; battery?: number; roaming?: boolean; callActive?: boolean; caller?: string;
        }
        export interface Connectivity
        {
            online?: boolean; gps?: boolean; wifi?: boolean; cellular?: boolean; bluetooth?: boolean; carplay?: boolean; androidAuto?: boolean;
            otaUpdateAvailable?: boolean; serviceDueKm?: number; serviceDueDays?: number;
        }
        export interface Warning
        {
            id: string; label: string; severity?: Types.Severity; icon?: string; detail?: string; dismissible?: boolean;
        }
        export interface Gauge
        {
            id: string; label: string; value: number; min?: number; max?: number; unit?: string; tone?: Types.Severity;
        }
        export interface Indicator
        {
            id: string; label: string; icon?: string; active?: boolean; tone?: Types.Severity;
        }
        export interface Metric
        {
            id: string; label: string; value: string | number; unit?: string;
        }
        export interface CockpitState
        {
            identity?: VehicleIdentity;
            motion?: Motion;
            powertrain?: Powertrain;
            energy?: Energy;
            chassis?: Chassis;
            adas?: Adas;
            navigation?: Navigation;
            climate?: Climate;
            occupants?: Occupants;
            body?: Body;
            media?: Media;
            phone?: Phone;
            connectivity?: Connectivity;
            warnings?: Warning[];
            gauges?: Gauge[];
            indicators?: Indicator[];
            metrics?: Metric[];
            driveMode?: Types.DriveMode;
            ready?: boolean;
            connected?: boolean;
            timestamp?: number;
        }
        export interface CockpitOptions extends CockpitState
        {
            theme?: Types.Theme;
            title?: string;
            unit?: 'km/h' | 'mph';
        }
    }

    const html = Templates.Template.Html;

    export const Styles = new Css.Stylesheet([
        new Css.Rule('arianna-cockpit, .AriannaCockpit', {
            '--Cockpit-Accent': '#e40c88',
            Background: 'radial-gradient(circle at 50% 18%,#222831 0,#12161b 42%,#090b0e 100%)',
            Border: '1px solid #252b33', BorderRadius: '12px', BoxSizing: 'border-box', Color: '#eef3f8', Display: 'block',
            FontFamily: 'var(--arianna-font,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif)', MinWidth: '0', Overflow: 'hidden', Width: '100%'
        }),
        new Css.Rule('.Cockpit-Shell', { Display: 'grid', Gap: '10px', GridTemplateRows: 'auto auto auto', MinHeight: '420px', Padding: '12px' }),
        new Css.Rule('.Cockpit-Top', { AlignItems: 'center', Display: 'grid', Gap: '10px', GridTemplateColumns: 'minmax(120px,1fr) auto minmax(120px,1fr)' }),
        new Css.Rule('.Cockpit-Brand', { MinWidth: '0' }),
        new Css.Rule('.Cockpit-Eyebrow', { Color: '#7e8996', FontSize: '9px', FontWeight: '700', LetterSpacing: '.1em', TextTransform: 'uppercase' }),
        new Css.Rule('.Cockpit-Title', { FontSize: '14px', FontWeight: '750', MarginTop: '2px', Overflow: 'hidden', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap' }),
        new Css.Rule('.Cockpit-Mode', { Background: '#1c2128', Border: '1px solid #343b45', BorderRadius: '999px', Color: '#b7c1cc', FontSize: '9px', FontWeight: '750', LetterSpacing: '.07em', Padding: '5px 10px', TextTransform: 'uppercase' }),
        new Css.Rule('.Cockpit-Status', { AlignItems: 'center', Display: 'flex', Gap: '5px', JustifyContent: 'flex-end' }),
        new Css.Rule('.Cockpit-Dot', { Background: '#4fc270', BorderRadius: '50%', BoxShadow: '0 0 8px rgba(79,194,112,.6)', Height: '7px', Width: '7px' }),
        new Css.Rule('.Cockpit-StatusText', { Color: '#87929e', FontSize: '9px' }),
        new Css.Rule('.Cockpit-Main', { AlignItems: 'stretch', Display: 'grid', Gap: '10px', GridTemplateColumns: 'minmax(140px,.9fr) minmax(220px,1.35fr) minmax(140px,.9fr)' }),
        new Css.Rule('.Cockpit-Card', { Background: 'rgba(23,28,34,.78)', Border: '1px solid #2a313a', BorderRadius: '9px', BoxSizing: 'border-box', MinWidth: '0', Padding: '10px' }),
        new Css.Rule('.Cockpit-CardTitle', { Color: '#7f8a96', FontSize: '8px', FontWeight: '750', LetterSpacing: '.09em', MarginBottom: '8px', TextTransform: 'uppercase' }),
        new Css.Rule('.Cockpit-SpeedCard', { AlignItems: 'center', Display: 'grid', JustifyItems: 'center', MinHeight: '220px', Position: 'relative' }),
        new Css.Rule('.Cockpit-Ring', { AlignItems: 'center', AspectRatio: '1', Border: '8px solid #272d35', BorderRadius: '50%', BoxShadow: 'inset 0 0 28px rgba(0,0,0,.6),0 0 0 1px #3a414b', Display: 'grid', JustifyItems: 'center', MaxWidth: '210px', Position: 'relative', Width: '78%' }),
        new Css.Rule('.Cockpit-Ring::before', { Border: '4px solid var(--Cockpit-Accent)', BorderBottomColor: 'transparent', BorderLeftColor: 'transparent', BorderRadius: '50%', Content: '""', Inset: '-9px', Position: 'absolute', Transform: 'rotate(38deg)' }),
        new Css.Rule('.Cockpit-Speed', { Font: '300 clamp(42px,7vw,76px)/.9 var(--arianna-font,system-ui,sans-serif)', LetterSpacing: '-.06em' }),
        new Css.Rule('.Cockpit-SpeedUnit', { Color: '#8c97a3', FontSize: '10px', FontWeight: '700', LetterSpacing: '.08em', TextTransform: 'uppercase' }),
        new Css.Rule('.Cockpit-Gear', { Color: 'var(--Cockpit-Accent)', FontSize: '18px', FontWeight: '850', MarginTop: '6px' }),
        new Css.Rule('.Cockpit-GaugeRow', { Display: 'grid', Gap: '7px' }),
        new Css.Rule('.Cockpit-Gauge', { Display: 'grid', Gap: '4px' }),
        new Css.Rule('.Cockpit-GaugeHead', { AlignItems: 'baseline', Display: 'flex', Gap: '6px' }),
        new Css.Rule('.Cockpit-GaugeLabel', { Color: '#8e98a4', FontSize: '9px' }),
        new Css.Rule('.Cockpit-GaugeValue', { FontSize: '11px', FontWeight: '750', MarginLeft: 'auto' }),
        new Css.Rule('.Cockpit-Bar', { Background: '#0d1013', BorderRadius: '999px', Height: '5px', Overflow: 'hidden' }),
        new Css.Rule('.Cockpit-BarFill', { Background: 'linear-gradient(90deg,#4d9de0,var(--Cockpit-Accent))', BorderRadius: 'inherit', Height: '100%' }),
        new Css.Rule('.Cockpit-AdasCard', { Display: 'grid', GridTemplateRows: 'auto minmax(130px,1fr) auto' }),
        new Css.Rule('.Cockpit-Road', { Background: 'linear-gradient(180deg,#131820,#0c1015)', BorderRadius: '7px', MinHeight: '145px', Overflow: 'hidden', Position: 'relative' }),
        new Css.Rule('.Cockpit-Road::before, .Cockpit-Road::after', { BorderLeft: '2px solid rgba(224,231,239,.54)', Bottom: '-8%', Content: '""', Position: 'absolute', Top: '8%', Width: '1px' }),
        new Css.Rule('.Cockpit-Road::before', { Left: '33%', Transform: 'skewX(-10deg)' }),
        new Css.Rule('.Cockpit-Road::after', { Right: '33%', Transform: 'skewX(10deg)' }),
        new Css.Rule('.Cockpit-Car', { Background: '#dfe5ec', BorderRadius: '4px 4px 8px 8px', Bottom: '17px', BoxShadow: '0 0 14px rgba(228,12,136,.25)', Height: '34px', Left: '50%', Position: 'absolute', Transform: 'translateX(-50%)', Width: '20px' }),
        new Css.Rule('.Cockpit-Lead', { Background: '#49515b', BorderRadius: '3px', Height: '16px', Left: '50%', Position: 'absolute', Top: '34px', Transform: 'translateX(-50%)', Width: '28px' }),
        new Css.Rule('.Cockpit-SpeedLimit', { AlignItems: 'center', Background: '#fff', Border: '3px solid #df4d49', BorderRadius: '50%', Color: '#17191c', Display: 'flex', FontSize: '12px', FontWeight: '850', Height: '36px', JustifyContent: 'center', Position: 'absolute', Right: '9px', Top: '9px', Width: '36px' }),
        new Css.Rule('.Cockpit-AdasState', { AlignItems: 'center', Color: '#8f9aa6', Display: 'flex', FontSize: '9px', Gap: '7px', MarginTop: '7px' }),
        new Css.Rule('.Cockpit-AdasState strong', { Color: '#7bd18e', FontWeight: '750' }),
        new Css.Rule('.Cockpit-Nav', { Display: 'grid', Gap: '8px' }),
        new Css.Rule('.Cockpit-NavInstruction', { FontSize: '13px', FontWeight: '700', LineHeight: '1.25' }),
        new Css.Rule('.Cockpit-NavDistance', { Color: '#65b5ff', FontSize: '22px', FontWeight: '300' }),
        new Css.Rule('.Cockpit-NavMeta', { Color: '#8994a0', Display: 'flex', FontSize: '9px', Gap: '8px' }),
        new Css.Rule('.Cockpit-Tires', { Display: 'grid', Gap: '7px', GridTemplateColumns: 'repeat(2,1fr)' }),
        new Css.Rule('.Cockpit-Tire', { Background: '#12161b', Border: '1px solid #293039', BorderRadius: '6px', Padding: '7px' }),
        new Css.Rule('.Cockpit-Tire[data-warning="true"]', { BorderColor: '#e8a33d', BoxShadow: 'inset 0 0 0 1px rgba(232,163,61,.2)' }),
        new Css.Rule('.Cockpit-TirePos', { Color: '#737e8a', FontSize: '8px', FontWeight: '750' }),
        new Css.Rule('.Cockpit-TireValue', { FontSize: '12px', FontWeight: '720', MarginTop: '2px' }),
        new Css.Rule('.Cockpit-Bottom', { Display: 'grid', Gap: '8px', GridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr) minmax(0,1fr)' }),
        new Css.Rule('.Cockpit-Metrics', { Display: 'grid', Gap: '5px', GridTemplateColumns: 'repeat(3,minmax(0,1fr))' }),
        new Css.Rule('.Cockpit-Metric', { Background: 'rgba(15,18,22,.62)', BorderRadius: '6px', Padding: '7px' }),
        new Css.Rule('.Cockpit-MetricLabel', { Color: '#737f8b', FontSize: '8px' }),
        new Css.Rule('.Cockpit-MetricValue', { FontSize: '11px', FontWeight: '750', MarginTop: '2px', Overflow: 'hidden', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap' }),
        new Css.Rule('.Cockpit-Indicators', { AlignContent: 'start', Display: 'flex', FlexWrap: 'wrap', Gap: '5px' }),
        new Css.Rule('.Cockpit-Indicator', { Background: '#1a2026', Border: '1px solid #2d353e', BorderRadius: '4px', Color: '#6f7984', FontSize: '9px', Padding: '5px 7px' }),
        new Css.Rule('.Cockpit-Indicator[data-active="true"]', { Color: '#66d182' }),
        new Css.Rule('.Cockpit-Warnings', { Display: 'grid', Gap: '5px' }),
        new Css.Rule('.Cockpit-Warning', { Background: '#191d23', Border: '1px solid #303640', BorderLeft: '3px solid #d6a342', BorderRadius: '4px', FontSize: '9px', Padding: '6px 7px' }),
        new Css.Rule('.Cockpit-Warning[data-severity="danger"], .Cockpit-Warning[data-severity="critical"]', { BorderLeftColor: '#df554f', Color: '#ffc0bd' }),

        new Css.Rule('arianna-cockpit[theme="light"], .AriannaCockpit[theme="light"]', { Background: 'radial-gradient(circle at 50% 18%,#ffffff 0,#eef2f5 46%,#dfe4e8 100%)', BorderColor: '#bcc4cc', Color: '#1d252e' }),
        new Css.Rule('arianna-cockpit[theme="light"] .Cockpit-Card, .AriannaCockpit[theme="light"] .Cockpit-Card', { Background: 'rgba(255,255,255,.82)', BorderColor: '#cdd3d9' }),
        new Css.Rule('arianna-cockpit[theme="light"] .Cockpit-Mode, .AriannaCockpit[theme="light"] .Cockpit-Mode', { Background: '#f5f7f9', BorderColor: '#cbd1d7', Color: '#4d5965' }),
        new Css.Rule('arianna-cockpit[theme="light"] .Cockpit-Ring, .AriannaCockpit[theme="light"] .Cockpit-Ring', { BorderColor: '#d9dee3', BoxShadow: 'inset 0 0 22px rgba(60,70,80,.08),0 0 0 1px #bec5cc' }),
        new Css.Rule('arianna-cockpit[theme="light"] .Cockpit-Bar, .AriannaCockpit[theme="light"] .Cockpit-Bar', { Background: '#d8dde2' }),
        new Css.Rule('arianna-cockpit[theme="light"] .Cockpit-Road, .AriannaCockpit[theme="light"] .Cockpit-Road', { Background: 'linear-gradient(180deg,#edf2f6,#dce3e9)' }),
        new Css.Rule('arianna-cockpit[theme="light"] .Cockpit-Car, .AriannaCockpit[theme="light"] .Cockpit-Car', { Background: '#4f5964' }),
        new Css.Rule('arianna-cockpit[theme="light"] .Cockpit-Tire, .AriannaCockpit[theme="light"] .Cockpit-Tire', { Background: '#f8fafb', BorderColor: '#d1d7dc' }),
        new Css.Rule('arianna-cockpit[theme="light"] .Cockpit-Metric, .AriannaCockpit[theme="light"] .Cockpit-Metric', { Background: 'rgba(255,255,255,.72)' }),
        new Css.Rule('arianna-cockpit[theme="light"] .Cockpit-Indicator, .AriannaCockpit[theme="light"] .Cockpit-Indicator', { Background: '#f5f7f9', BorderColor: '#ccd2d8', Color: '#68737f' }),
        new Css.Rule('arianna-cockpit[theme="light"] .Cockpit-Warning, .AriannaCockpit[theme="light"] .Cockpit-Warning', { Background: '#fff', BorderColor: '#d4d9df' })
    ]);

    @Component('arianna-cockpit', Styles, {
        Shadow: false,
        Attributes: ['theme', 'title', 'speed', 'unit', 'gear', 'mode', 'range', 'power', 'rpm', 'connected', 'ready']
    })
    export class Cockpit extends HTMLElement
    {
        public static readonly Styles = Styles;
        public template = html``;
        private _state?: Interfaces.CockpitState;

        constructor(options: Interfaces.CockpitOptions = {})
        {
            super();
            if(options.theme) this.setAttribute('theme', options.theme);
            if(options.title) this.setAttribute('title', options.title);
            if(options.unit) this.setAttribute('unit', options.unit);
            this._state = this.MergeState(this.DefaultState(), options);
        }

        public onCreated(): void { if(this.isConnected) this.onConnected(); }
        public onConnected(): void
        {
            this.classList.add('AriannaCockpit');
            if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
            this.ApplyAttributes();
            this.Render();
        }
        public onAttributeChanged(): void
        {
            if(!this.isConnected) return;
            this.ApplyAttributes();
            this.Render();
        }

        public get state(): Interfaces.CockpitState { this.EnsureState(); return this.Clone(this._state!); }
        public set state(value: Interfaces.CockpitState) { this._state = this.MergeState(this.DefaultState(), value ?? {}); this.RenderIfConnected(); }
        public setState(value: Partial<Interfaces.CockpitState>): this { this.EnsureState(); this._state = this.MergeState(this._state!, value); this.RenderIfConnected(); this.Emit('arianna:cockpit-state', { state: this.state }); return this; }
        public updateTelemetry(value: Partial<Interfaces.CockpitState>): this { return this.setState(value); }

        public get gauges(): Interfaces.Gauge[] { this.EnsureState(); return [...(this._state!.gauges ?? [])]; }
        public set gauges(value: Interfaces.Gauge[]) { this.EnsureState(); this._state!.gauges = Array.isArray(value) ? value.slice() : []; this.RenderIfConnected(); }
        public get indicators(): Interfaces.Indicator[] { this.EnsureState(); return [...(this._state!.indicators ?? [])]; }
        public set indicators(value: Interfaces.Indicator[]) { this.EnsureState(); this._state!.indicators = Array.isArray(value) ? value.slice() : []; this.RenderIfConnected(); }
        public get metrics(): Interfaces.Metric[] { this.EnsureState(); return [...(this._state!.metrics ?? [])]; }
        public set metrics(value: Interfaces.Metric[]) { this.EnsureState(); this._state!.metrics = Array.isArray(value) ? value.slice() : []; this.RenderIfConnected(); }
        public get warnings(): Interfaces.Warning[] { this.EnsureState(); return [...(this._state!.warnings ?? [])]; }
        public set warnings(value: Interfaces.Warning[]) { this.EnsureState(); this._state!.warnings = Array.isArray(value) ? value.slice() : []; this.RenderIfConnected(); }

        public get speed(): number { this.EnsureState(); return this._state!.motion?.speed ?? 0; }
        public set speed(value: number) { this.SetNested('motion', { speed: this.Number(value, 0) }); }
        public get gear(): Types.Gear { this.EnsureState(); return this._state!.motion?.gear ?? 'P'; }
        public set gear(value: Types.Gear) { this.SetNested('motion', { gear: value }); }
        public get driveMode(): Types.DriveMode { this.EnsureState(); return this._state!.driveMode ?? 'comfort'; }
        public set driveMode(value: Types.DriveMode) { this.setState({ driveMode: value }); }

        private EnsureState(): void { if(!this._state) this._state = this.DefaultState(); }
        private RenderIfConnected(): void { if(this.isConnected) this.Render(); }

        private ApplyAttributes(): void
        {
            this.EnsureState();
            const motion: Interfaces.Motion = { ...(this._state!.motion ?? {}) };
            if(this.hasAttribute('speed')) motion.speed = this.Number(this.getAttribute('speed'), motion.speed ?? 0);
            if(this.hasAttribute('unit')) motion.speedUnit = this.getAttribute('unit') === 'mph' ? 'mph' : 'km/h';
            if(this.hasAttribute('gear')) motion.gear = this.getAttribute('gear') || 'P';
            if(this.hasAttribute('rpm')) motion.rpm = this.Number(this.getAttribute('rpm'), motion.rpm ?? 0);
            const energy: Interfaces.Energy = { ...(this._state!.energy ?? {}) };
            if(this.hasAttribute('range')) energy.batteryRange = this.Number(this.getAttribute('range'), energy.batteryRange ?? 0);
            const powertrain: Interfaces.Powertrain = { ...(this._state!.powertrain ?? {}) };
            if(this.hasAttribute('power')) powertrain.power = this.Number(this.getAttribute('power'), powertrain.power ?? 0);
            this._state = this.MergeState(this._state!, {
                motion, energy, powertrain,
                driveMode: this.getAttribute('mode') || this._state!.driveMode,
                connected: this.hasAttribute('connected') ? true : this._state!.connected,
                ready: this.hasAttribute('ready') ? true : this._state!.ready
            });
        }

        private DefaultState(): Interfaces.CockpitState
        {
            return {
                identity: { make: 'AriannA', model: 'GT', trim: 'E', modelYear: 2026, powertrain: 'bev', drivetrain: 'awd' },
                motion: { speed: 92, speedUnit: 'km/h', rpm: 0, rpmMax: 8000, gear: 'D', heading: 28, altitude: 118, odometer: 18427, tripA: 248.3, averageSpeed: 61 },
                powertrain: { power: 74, powerUnit: 'kW', torque: 312, torqueUnit: 'Nm', regen: 18, motorFrontPower: 22, motorRearPower: 52, inverterTemp: 48 },
                energy: { batterySoc: 82, batteryRange: 412, batteryPower: -18, batteryTemp: 31, charging: false, chargingLimit: 90, energyConsumption: 17.8, energyConsumptionUnit: 'kWh/100km' },
                chassis: { steeringAngle: 1.8, brakePressure: 0, escActive: false, tractionActive: false, tires: [
                    { position: 'FL', pressure: 2.4, pressureUnit: 'bar', temperature: 31 }, { position: 'FR', pressure: 2.4, pressureUnit: 'bar', temperature: 32 },
                    { position: 'RL', pressure: 2.5, pressureUnit: 'bar', temperature: 30 }, { position: 'RR', pressure: 2.5, pressureUnit: 'bar', temperature: 30 }
                ] },
                adas: { cruise: 'active', cruiseSetSpeed: 110, adaptiveCruise: 'active', followingDistance: 2, laneKeep: 'active', leftLane: 'detected', rightLane: 'detected', forwardCollision: 'standby', emergencyBraking: 'standby', trafficSignRecognition: true, speedLimit: 90, driverAttention: 'active', handsOnWheel: true, autonomousLevel: 2 },
                navigation: { active: true, street: 'A1 · Firenze', instruction: 'Continue straight', maneuver: 'straight', distanceToManeuver: 3200, remainingDistance: 74, eta: '48 min', arrivalTime: '17:12', speedLimit: 90, compass: 'NE' },
                climate: { ambientTemp: 18, cabinTemp: 21.5, driverTemp: 21, passengerTemp: 21, fanSpeed: 2, auto: true, ac: true, airQuality: 92 },
                occupants: { driverPresent: true, passengerPresent: true, driverBelt: true, passengerBelt: true },
                body: { parkingBrake: false, autoHold: true, headlights: 'auto', highBeamAssist: true, wipers: 'auto' },
                media: { source: 'Bluetooth', title: 'Summer', artist: 'Vivaldi', playing: true, volume: .52 },
                phone: { connected: true, name: 'iPhone', signal: 4, battery: 78 },
                connectivity: { online: true, gps: true, wifi: false, cellular: true, bluetooth: true, carplay: true },
                driveMode: 'comfort', ready: true, connected: true,
                gauges: [
                    { id: 'battery', label: 'Battery', value: 82, max: 100, unit: '%' },
                    { id: 'power', label: 'Power', value: 74, max: 220, unit: 'kW' },
                    { id: 'regen', label: 'Regen', value: 18, max: 100, unit: '%' }
                ],
                indicators: [
                    { id: 'ready', label: 'READY', active: true, tone: 'success' },
                    { id: 'lane', label: 'LANE', active: true, tone: 'success' },
                    { id: 'acc', label: 'ACC', active: true, tone: 'success' },
                    { id: 'lights', label: 'AUTO', active: true, tone: 'info' }
                ],
                metrics: [
                    { id: 'trip', label: 'Trip A', value: '248.3', unit: 'km' },
                    { id: 'cons', label: 'Consumption', value: '17.8', unit: 'kWh/100km' },
                    { id: 'odo', label: 'Odometer', value: '18,427', unit: 'km' }
                ],
                warnings: []
            };
        }

        private Render(): void
        {
            this.EnsureState();
            const s = this._state!;
            const motion = s.motion ?? {}; const energy = s.energy ?? {}; const adas = s.adas ?? {}; const nav = s.navigation ?? {};
            const title = this.getAttribute('title') || [s.identity?.make, s.identity?.model, s.identity?.trim].filter(Boolean).join(' ') || 'Cockpit';
            const shell = document.createElement('div'); shell.className = 'Cockpit-Shell';

            const top = document.createElement('div'); top.className = 'Cockpit-Top';
            const brand = document.createElement('div'); brand.className = 'Cockpit-Brand';
            const eyebrow = document.createElement('div'); eyebrow.className = 'Cockpit-Eyebrow'; eyebrow.textContent = s.identity?.powertrain === 'bev' ? 'Electric vehicle' : 'Vehicle';
            const titleNode = document.createElement('div'); titleNode.className = 'Cockpit-Title'; titleNode.textContent = title; brand.append(eyebrow, titleNode);
            const mode = document.createElement('div'); mode.className = 'Cockpit-Mode'; mode.textContent = s.driveMode || 'normal';
            const status = document.createElement('div'); status.className = 'Cockpit-Status'; const dot = document.createElement('span'); dot.className = 'Cockpit-Dot'; if(!s.connected) dot.style.background = '#7c848d'; const st = document.createElement('span'); st.className = 'Cockpit-StatusText'; st.textContent = s.connected ? (s.ready ? 'READY · ONLINE' : 'ONLINE') : 'OFFLINE'; status.append(dot, st); top.append(brand, mode, status); shell.append(top);

            const main = document.createElement('div'); main.className = 'Cockpit-Main';
            const gauges = this.Card('Power & energy'); const gaugeRow = document.createElement('div'); gaugeRow.className = 'Cockpit-GaugeRow'; (s.gauges ?? []).slice(0, 5).forEach(g => gaugeRow.append(this.GaugeNode(g))); gauges.append(gaugeRow);
            const speed = document.createElement('section'); speed.className = 'Cockpit-Card Cockpit-SpeedCard'; const ring = document.createElement('div'); ring.className = 'Cockpit-Ring'; const sp = document.createElement('div'); sp.className = 'Cockpit-Speed'; sp.textContent = String(Math.round(motion.speed ?? 0)); const unit = document.createElement('div'); unit.className = 'Cockpit-SpeedUnit'; unit.textContent = motion.speedUnit || 'km/h'; const gear = document.createElement('div'); gear.className = 'Cockpit-Gear'; gear.textContent = String(motion.gear || 'P'); ring.append(sp, unit, gear); speed.append(ring);
            const adasCard = document.createElement('section'); adasCard.className = 'Cockpit-Card Cockpit-AdasCard'; const adasTitle = document.createElement('div'); adasTitle.className = 'Cockpit-CardTitle'; adasTitle.textContent = 'Driver assistance'; const road = document.createElement('div'); road.className = 'Cockpit-Road'; const lead = document.createElement('span'); lead.className = 'Cockpit-Lead'; const car = document.createElement('span'); car.className = 'Cockpit-Car'; road.append(lead, car); if(adas.speedLimit ?? nav.speedLimit) { const sl = document.createElement('span'); sl.className = 'Cockpit-SpeedLimit'; sl.textContent = String(Math.round(adas.speedLimit ?? nav.speedLimit ?? 0)); road.append(sl); } const adasState = document.createElement('div'); adasState.className = 'Cockpit-AdasState'; adasState.innerHTML = `<span>ACC</span><strong>${(adas.adaptiveCruise || adas.cruise || 'off').toUpperCase()}</strong><span>Lane</span><strong>${(adas.laneKeep || 'off').toUpperCase()}</strong>`; adasCard.append(adasTitle, road, adasState);
            main.append(gauges, speed, adasCard); shell.append(main);

            const bottom = document.createElement('div'); bottom.className = 'Cockpit-Bottom';
            const navCard = this.Card('Navigation'); const navBox = document.createElement('div'); navBox.className = 'Cockpit-Nav'; const navDistance = document.createElement('div'); navDistance.className = 'Cockpit-NavDistance'; navDistance.textContent = nav.active ? this.Distance(nav.distanceToManeuver ?? 0) : '—'; const navInstruction = document.createElement('div'); navInstruction.className = 'Cockpit-NavInstruction'; navInstruction.textContent = nav.active ? (nav.instruction || nav.street || 'Navigation active') : 'No route'; const navMeta = document.createElement('div'); navMeta.className = 'Cockpit-NavMeta'; navMeta.textContent = nav.active ? `${nav.remainingDistance ?? 0} km · ${nav.eta || ''} · ${nav.compass || ''}` : ''; navBox.append(navDistance, navInstruction, navMeta); navCard.append(navBox);
            const tireCard = this.Card('Tyres'); const tires = document.createElement('div'); tires.className = 'Cockpit-Tires'; (s.chassis?.tires ?? []).slice(0,4).forEach(t => tires.append(this.TireNode(t))); tireCard.append(tires);
            const infoCard = this.Card('Vehicle'); const metrics = document.createElement('div'); metrics.className = 'Cockpit-Metrics'; (s.metrics ?? []).slice(0,6).forEach(m => metrics.append(this.MetricNode(m))); const indicators = document.createElement('div'); indicators.className = 'Cockpit-Indicators'; indicators.style.marginTop = '8px'; (s.indicators ?? []).slice(0,8).forEach(i => indicators.append(this.IndicatorNode(i))); infoCard.append(metrics, indicators);
            bottom.append(navCard, tireCard, infoCard); shell.append(bottom);

            if(s.warnings?.length)
            {
                const warningCard = this.Card('Warnings'); warningCard.style.gridColumn = '1 / -1'; const warnings = document.createElement('div'); warnings.className = 'Cockpit-Warnings'; s.warnings.slice(0,4).forEach(w => { const n = document.createElement('div'); n.className = 'Cockpit-Warning'; n.dataset.severity = w.severity || 'warning'; n.textContent = `${w.icon ? w.icon + ' ' : ''}${w.label}${w.detail ? ' · ' + w.detail : ''}`; warnings.append(n); }); warningCard.append(warnings); shell.append(warningCard);
            }

            this.replaceChildren(shell);
        }

        private Card(title: string): HTMLElement { const card = document.createElement('section'); card.className = 'Cockpit-Card'; const h = document.createElement('div'); h.className = 'Cockpit-CardTitle'; h.textContent = title; card.append(h); return card; }
        private GaugeNode(g: Interfaces.Gauge): HTMLElement { const node = document.createElement('div'); node.className = 'Cockpit-Gauge'; const head = document.createElement('div'); head.className = 'Cockpit-GaugeHead'; const label = document.createElement('span'); label.className = 'Cockpit-GaugeLabel'; label.textContent = g.label; const value = document.createElement('span'); value.className = 'Cockpit-GaugeValue'; value.textContent = `${this.Round(g.value)}${g.unit ? ' ' + g.unit : ''}`; head.append(label, value); const bar = document.createElement('div'); bar.className = 'Cockpit-Bar'; const fill = document.createElement('div'); fill.className = 'Cockpit-BarFill'; const min = g.min ?? 0, max = g.max ?? 100; fill.style.width = `${Math.max(0, Math.min(100, ((g.value - min) / Math.max(.0001, max - min)) * 100))}%`; bar.append(fill); node.append(head, bar); return node; }
        private TireNode(t: Interfaces.Tire): HTMLElement { const n = document.createElement('div'); n.className = 'Cockpit-Tire'; n.dataset.warning = String(!!t.warning); const p = document.createElement('div'); p.className = 'Cockpit-TirePos'; p.textContent = t.position; const v = document.createElement('div'); v.className = 'Cockpit-TireValue'; v.textContent = `${t.pressure ?? '—'} ${t.pressureUnit ?? 'bar'}`; n.append(p, v); return n; }
        private MetricNode(m: Interfaces.Metric): HTMLElement { const n = document.createElement('div'); n.className = 'Cockpit-Metric'; const l = document.createElement('div'); l.className = 'Cockpit-MetricLabel'; l.textContent = m.label; const v = document.createElement('div'); v.className = 'Cockpit-MetricValue'; v.textContent = `${m.value}${m.unit ? ' ' + m.unit : ''}`; n.append(l,v); return n; }
        private IndicatorNode(i: Interfaces.Indicator): HTMLElement { const n = document.createElement('span'); n.className = 'Cockpit-Indicator'; n.dataset.active = String(!!i.active); n.textContent = `${i.icon ? i.icon + ' ' : ''}${i.label}`; return n; }

        private SetNested<K extends 'motion' | 'powertrain' | 'energy'>(key: K, value: Record<string, unknown>): void { this.EnsureState(); const current = (this._state as any)[key] ?? {}; (this._state as any)[key] = { ...current, ...value }; this.RenderIfConnected(); }
        private MergeState(base: Interfaces.CockpitState, patch: Partial<Interfaces.CockpitState>): Interfaces.CockpitState
        {
            const out: Interfaces.CockpitState = { ...base, ...patch };
            const nested: (keyof Interfaces.CockpitState)[] = ['identity','motion','powertrain','energy','chassis','adas','navigation','climate','occupants','body','media','phone','connectivity'];
            for(const key of nested)
            {
                const b = (base as any)[key], p = (patch as any)[key];
                if(b || p) (out as any)[key] = { ...(b ?? {}), ...(p ?? {}) };
            }
            if(patch.warnings) out.warnings = patch.warnings.slice();
            if(patch.gauges) out.gauges = patch.gauges.slice();
            if(patch.indicators) out.indicators = patch.indicators.slice();
            if(patch.metrics) out.metrics = patch.metrics.slice();
            return out;
        }
        private Clone<T>(value: T): T { return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)); }
        private Number(value: unknown, fallback = 0): number { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
        private Round(value: number): string { return Math.abs(value) >= 100 ? String(Math.round(value)) : String(Math.round(value * 10) / 10); }
        private Distance(meters: number): string { return meters >= 1000 ? `${Math.round(meters / 100) / 10} km` : `${Math.max(0, Math.round(meters / 10) * 10)} m`; }
        private Emit(type: string, detail: Record<string, unknown> = {}): void { this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: { ...detail, cockpit: this, source: this } })); }
    }
}

export const CockpitComponent = Cockpit.Cockpit;
export { CockpitComponent as AutomotiveCockpit };
export type CockpitOptions = Cockpit.Interfaces.CockpitOptions;
export type CockpitState = Cockpit.Interfaces.CockpitState;
export type CockpitGauge = Cockpit.Interfaces.Gauge;
export type CockpitIndicator = Cockpit.Interfaces.Indicator;
export type CockpitMetric = Cockpit.Interfaces.Metric;
export default Cockpit.Cockpit;
