/**
 * @module components/automotive/Cockpit
 * @version 2.0.0
 * @description Full automotive digital instrument cluster with AriannA visual language.
 */
import { Component, Css, Templates } from '../../core/index.ts';

export namespace Cockpit {
    export namespace Types {
        export type Theme = 'dark' | 'light';
        export type Gear = 'P' | 'R' | 'N' | 'D' | 'S' | 'B' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8' | string;
        export type DriveMode = 'eco' | 'comfort' | 'normal' | 'sport' | 'sport+' | 'snow' | 'sand' | 'mud' | 'rock' | 'trail' | 'custom' | string;
        export type Severity = 'info' | 'success' | 'warning' | 'danger' | 'critical';
        export type LaneState = 'none' | 'detected' | 'warning' | 'intervening';
        export type AdasStatus = 'off' | 'standby' | 'active' | 'limited' | 'fault';
    }

    export namespace Interfaces {
        export interface VehicleIdentity { make?: string; model?: string; trim?: string; modelYear?: number; vin?: string; powertrain?: 'ice' | 'mhev' | 'hev' | 'phev' | 'bev' | 'hydrogen'; drivetrain?: 'fwd' | 'rwd' | 'awd' | '4wd'; }
        export interface Motion { speed?: number; speedUnit?: 'km/h' | 'mph'; rpm?: number; rpmMax?: number; gear?: Types.Gear; acceleration?: number; lateralG?: number; longitudinalG?: number; yawRate?: number; heading?: number; altitude?: number; pitch?: number; roll?: number; odometer?: number; tripA?: number; tripB?: number; averageSpeed?: number; }
        export interface Powertrain { engineRunning?: boolean; engineTemp?: number; oilTemp?: number; oilPressure?: number; transmissionTemp?: number; torque?: number; torqueUnit?: 'Nm' | 'lb-ft'; power?: number; powerUnit?: 'kW' | 'hp'; boost?: number; boostUnit?: 'bar' | 'psi'; throttle?: number; regen?: number; motorFrontPower?: number; motorRearPower?: number; inverterTemp?: number; }
        export interface Energy { fuelLevel?: number; fuelRange?: number; fuelConsumption?: number; fuelConsumptionUnit?: 'l/100km' | 'mpg'; batterySoc?: number; batteryRange?: number; batteryPower?: number; batteryTemp?: number; batteryVoltage?: number; charging?: boolean; chargingPower?: number; chargingLimit?: number; chargingTimeRemaining?: number; chargePortOpen?: boolean; energyConsumption?: number; energyConsumptionUnit?: 'kWh/100km' | 'Wh/km' | 'mi/kWh'; }
        export interface Tire { position: 'FL' | 'FR' | 'RL' | 'RR'; pressure?: number; pressureUnit?: 'bar' | 'psi' | 'kPa'; temperature?: number; warning?: boolean; }
        export interface Chassis { steeringAngle?: number; brakePressure?: number; brakeTempFront?: number; brakeTempRear?: number; suspensionFront?: number; suspensionRear?: number; rideHeight?: number; absActive?: boolean; escActive?: boolean; tractionActive?: boolean; hillDescentActive?: boolean; differentialLockFront?: boolean; differentialLockCenter?: boolean; differentialLockRear?: boolean; tires?: Tire[]; }
        export interface Adas { cruise?: Types.AdasStatus; cruiseSetSpeed?: number; adaptiveCruise?: Types.AdasStatus; followingDistance?: number; laneKeep?: Types.AdasStatus; laneDeparture?: Types.LaneState; leftLane?: Types.LaneState; rightLane?: Types.LaneState; blindSpotLeft?: boolean; blindSpotRight?: boolean; forwardCollision?: Types.AdasStatus; emergencyBraking?: Types.AdasStatus; trafficSignRecognition?: boolean; speedLimit?: number; driverAttention?: Types.AdasStatus; handsOnWheel?: boolean; parkingSensors?: Types.AdasStatus; parkAssist?: Types.AdasStatus; rearCrossTraffic?: Types.AdasStatus; nightVision?: Types.AdasStatus; autonomousLevel?: 0 | 1 | 2 | 3 | 4 | 5; }
        export interface Navigation { active?: boolean; street?: string; instruction?: string; maneuver?: string; distanceToManeuver?: number; remainingDistance?: number; eta?: string; arrivalTime?: string; speedLimit?: number; latitude?: number; longitude?: number; compass?: string; }
        export interface Climate { ambientTemp?: number; cabinTemp?: number; driverTemp?: number; passengerTemp?: number; fanSpeed?: number; auto?: boolean; ac?: boolean; recirculation?: boolean; defrostFront?: boolean; defrostRear?: boolean; heatedSeatDriver?: number; heatedSeatPassenger?: number; ventilatedSeatDriver?: number; ventilatedSeatPassenger?: number; heatedSteeringWheel?: boolean; airQuality?: number; }
        export interface Occupants { driverPresent?: boolean; passengerPresent?: boolean; rearLeftPresent?: boolean; rearRightPresent?: boolean; driverBelt?: boolean; passengerBelt?: boolean; rearLeftBelt?: boolean; rearRightBelt?: boolean; childLock?: boolean; }
        export interface Body { doorFL?: boolean; doorFR?: boolean; doorRL?: boolean; doorRR?: boolean; hood?: boolean; trunk?: boolean; parkingBrake?: boolean; autoHold?: boolean; windowsOpen?: boolean; sunroofOpen?: boolean; headlights?: 'off' | 'auto' | 'position' | 'low' | 'high'; highBeamAssist?: boolean; fogFront?: boolean; fogRear?: boolean; turnLeft?: boolean; turnRight?: boolean; hazards?: boolean; wipers?: 'off' | 'auto' | 'intermittent' | 'low' | 'high'; washerLow?: boolean; }
        export interface Media { source?: string; title?: string; artist?: string; album?: string; artwork?: string; playing?: boolean; volume?: number; }
        export interface Phone { connected?: boolean; name?: string; signal?: number; battery?: number; roaming?: boolean; callActive?: boolean; caller?: string; }
        export interface Connectivity { online?: boolean; gps?: boolean; wifi?: boolean; cellular?: boolean; bluetooth?: boolean; carplay?: boolean; androidAuto?: boolean; otaUpdateAvailable?: boolean; serviceDueKm?: number; serviceDueDays?: number; }
        export interface Warning { id: string; label: string; severity?: Types.Severity; icon?: string; detail?: string; dismissible?: boolean; }
        export interface Gauge { id: string; label: string; value: number; min?: number; max?: number; unit?: string; tone?: Types.Severity; }
        export interface Indicator { id: string; label: string; icon?: string; active?: boolean; tone?: Types.Severity; }
        export interface Metric { id: string; label: string; value: string | number; unit?: string; }
        export interface CockpitState { identity?: VehicleIdentity; motion?: Motion; powertrain?: Powertrain; energy?: Energy; chassis?: Chassis; adas?: Adas; navigation?: Navigation; climate?: Climate; occupants?: Occupants; body?: Body; media?: Media; phone?: Phone; connectivity?: Connectivity; warnings?: Warning[]; gauges?: Gauge[]; indicators?: Indicator[]; metrics?: Metric[]; driveMode?: Types.DriveMode; ready?: boolean; connected?: boolean; timestamp?: number; }
        export interface CockpitOptions extends CockpitState { theme?: Types.Theme; title?: string; unit?: 'km/h' | 'mph'; }
    }

    const html = Templates.Template.Html;
    const State = new WeakMap<HTMLElement, Interfaces.CockpitState>();

    export const Styles = new Css.Stylesheet([
        new Css.Rule('arianna-cockpit,.AriannaCockpit', {
            '--Cockpit-Accent':'#e40c88', '--Cockpit-Blue':'#4d9de0', '--Cockpit-Green':'#72d572',
            Background:'radial-gradient(ellipse at 50% 55%,#171b22 0,#090b0e 56%,#020304 100%)', Border:'1px solid #272c33', BorderRadius:'16px', BoxSizing:'border-box', Color:'#f4f7fa', Display:'block', FontFamily:'var(--arianna-font,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif)', MinWidth:'0', Overflow:'hidden', Width:'100%'
        }),
        new Css.Rule('.Cockpit-Cluster', { AspectRatio:'2.45 / 1', Display:'grid', GridTemplateRows:'38px minmax(0,1fr) 44px', MinHeight:'330px', Padding:'12px 18px 10px', Position:'relative' }),
        new Css.Rule('.Cockpit-TopLine', { AlignItems:'center', Display:'grid', GridTemplateColumns:'1fr auto 1fr', Position:'relative', ZIndex:'5' }),
        new Css.Rule('.Cockpit-WarningIcons', { AlignItems:'center', Display:'flex', Gap:'12px', JustifyContent:'flex-end' }),
        new Css.Rule('.Cockpit-WarningIcon', { Color:'#ff4255', FontSize:'18px', FontWeight:'800', TextShadow:'0 0 8px rgba(255,66,85,.32)' }),
        new Css.Rule('.Cockpit-TopValue', { Font:'700 16px/1 ui-monospace,SFMono-Regular,Menlo,monospace', LetterSpacing:'.02em' }),
        new Css.Rule('.Cockpit-TopCenter', { AlignItems:'center', Display:'flex', Gap:'26px', JustifyContent:'center' }),
        new Css.Rule('.Cockpit-Main', { AlignItems:'center', Display:'grid', Gap:'12px', GridTemplateColumns:'minmax(220px,1fr) minmax(220px,.86fr) minmax(220px,1fr)', MinHeight:'0' }),
        new Css.Rule('.Cockpit-Dial', { AlignItems:'center', AspectRatio:'1', Display:'grid', JustifyItems:'center', Margin:'0 auto', MaxHeight:'315px', MaxWidth:'315px', Position:'relative', Width:'92%' }),
        new Css.Rule('.Cockpit-DialOuter', { Background:'conic-gradient(from 218deg,#2a3139 0deg,#2a3139 35deg,var(--Dial-Color,var(--Cockpit-Blue)) 36deg,var(--Dial-Color,var(--Cockpit-Blue)) var(--Dial-Angle,170deg),#30363d var(--Dial-Angle,170deg),#30363d 274deg,transparent 275deg)', BorderRadius:'50%', Filter:'drop-shadow(0 4px 14px rgba(0,0,0,.65))', Inset:'0', Position:'absolute' }),
        new Css.Rule('.Cockpit-DialOuter::before', { Background:'radial-gradient(circle,#171c22 0 56%,#080a0d 57% 65%,transparent 66%)', BorderRadius:'50%', Content:'""', Inset:'8px', Position:'absolute' }),
        new Css.Rule('.Cockpit-DialTicks', { Background:'repeating-conic-gradient(from 218deg,rgba(255,255,255,.9) 0deg 1deg,transparent 1deg 10deg)', BorderRadius:'50%', Inset:'20px', Mask:'radial-gradient(circle,transparent 0 76%,#000 77%)', Opacity:'.72', Position:'absolute' }),
        new Css.Rule('.Cockpit-DialInner', { AlignItems:'center', Display:'grid', Inset:'16%', JustifyItems:'center', Position:'absolute', TextAlign:'center' }),
        new Css.Rule('.Cockpit-DialValue', { Color:'var(--Dial-Value,#fff)', Font:'300 clamp(46px,6vw,82px)/.88 var(--arianna-font,system-ui,sans-serif)', LetterSpacing:'-.06em', TextShadow:'0 0 20px color-mix(in srgb,var(--Dial-Color,var(--Cockpit-Blue)) 30%,transparent)' }),
        new Css.Rule('.Cockpit-DialUnit', { Color:'#a8b2bc', Font:'700 10px/1 var(--arianna-font,system-ui,sans-serif)', LetterSpacing:'.05em', MarginTop:'7px' }),
        new Css.Rule('.Cockpit-Gear', { Color:'var(--Cockpit-Accent)', Font:'850 24px/1 var(--arianna-font,system-ui,sans-serif)', MarginTop:'10px' }),
        new Css.Rule('.Cockpit-DialSub', { Color:'#aeb7c0', Font:'700 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace', MarginTop:'8px' }),
        new Css.Rule('.Cockpit-MiniArc', { Bottom:'14%', Color:'#9ba5ae', Display:'flex', Font:'700 8px/1 var(--arianna-font,system-ui,sans-serif)', JustifyContent:'space-between', Left:'19%', Position:'absolute', Right:'19%' }),
        new Css.Rule('.Cockpit-Center', { AlignItems:'center', Display:'grid', GridTemplateRows:'auto minmax(0,1fr) auto', Height:'100%', JustifyItems:'stretch', MinWidth:'0' }),
        new Css.Rule('.Cockpit-CenterStatus', { AlignItems:'center', Color:'#e4e9ee', Display:'flex', Font:'700 10px/1 var(--arianna-font,system-ui,sans-serif)', Gap:'9px', JustifyContent:'center', MinHeight:'24px' }),
        new Css.Rule('.Cockpit-CarZone', { AlignItems:'center', Background:'radial-gradient(ellipse at center,rgba(228,12,136,.16),transparent 60%)', Display:'grid', GridTemplateColumns:'1fr 96px 1fr', MinHeight:'190px', Position:'relative' }),
        new Css.Rule('.Cockpit-Car', { Background:'linear-gradient(180deg,#f8fafc,#cbd3da)', Border:'2px solid #8d969e', BorderRadius:'28px 28px 18px 18px', BoxShadow:'0 0 22px rgba(228,12,136,.22)', Height:'132px', Margin:'auto', Position:'relative', Width:'62px' }),
        new Css.Rule('.Cockpit-Car::before', { Background:'#171b20', BorderRadius:'18px 18px 7px 7px', Content:'""', Height:'37px', Left:'8px', Position:'absolute', Right:'8px', Top:'24px' }),
        new Css.Rule('.Cockpit-Car::after', { Background:'#182027', BorderRadius:'4px 4px 12px 12px', Bottom:'16px', Content:'""', Height:'31px', Left:'9px', Position:'absolute', Right:'9px' }),
        new Css.Rule('.Cockpit-Tires', { Display:'grid', Gap:'28px', GridTemplateRows:'1fr 1fr' }),
        new Css.Rule('.Cockpit-Tires[data-side="left"]', { TextAlign:'right' }),
        new Css.Rule('.Cockpit-Tire', { Color:'#aeb7c0', Font:'650 9px/1.25 ui-monospace,SFMono-Regular,Menlo,monospace', WhiteSpace:'nowrap' }),
        new Css.Rule('.Cockpit-Tire strong', { Color:'#f3f6f9', Display:'block', FontSize:'10px' }),
        new Css.Rule('.Cockpit-Tire[data-warning="true"] strong', { Color:'#ffb13c' }),
        new Css.Rule('.Cockpit-CenterMode', { Color:'var(--Cockpit-Accent)', Font:'800 10px/1 var(--arianna-font,system-ui,sans-serif)', LetterSpacing:'.12em', TextAlign:'center', TextTransform:'uppercase' }),
        new Css.Rule('.Cockpit-Bottom', { AlignItems:'center', BorderTop:'1px solid rgba(255,255,255,.06)', Display:'grid', Gap:'14px', GridTemplateColumns:'1fr auto 1fr', PaddingTop:'7px' }),
        new Css.Rule('.Cockpit-BottomMetrics', { Display:'flex', Gap:'16px' }),
        new Css.Rule('.Cockpit-Metric', { Color:'#929ca6', Font:'700 8px/1 var(--arianna-font,system-ui,sans-serif)', TextTransform:'uppercase' }),
        new Css.Rule('.Cockpit-Metric strong', { Color:'#edf2f6', Font:'700 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace', MarginLeft:'5px', TextTransform:'none' }),
        new Css.Rule('.Cockpit-Ready', { Color:'var(--Cockpit-Green)', Font:'850 10px/1 var(--arianna-font,system-ui,sans-serif)', LetterSpacing:'.14em' }),
        new Css.Rule('arianna-cockpit[theme="light"],.AriannaCockpit[theme="light"]', { Background:'radial-gradient(ellipse at 50% 55%,#fff 0,#e9edf1 58%,#d8dde2 100%)', BorderColor:'#bac2ca', Color:'#1f272e' }),
        new Css.Rule('arianna-cockpit[theme="light"] .Cockpit-DialOuter::before', { Background:'radial-gradient(circle,#f8fafb 0 56%,#dce2e7 57% 65%,transparent 66%)' }),
        new Css.Rule('arianna-cockpit[theme="light"] .Cockpit-DialTicks', { Background:'repeating-conic-gradient(from 218deg,rgba(35,45,55,.72) 0deg 1deg,transparent 1deg 10deg)' }),
        new Css.Rule('arianna-cockpit[theme="light"] .Cockpit-DialValue', { Color:'#1d252c' }),
        new Css.Rule('arianna-cockpit[theme="light"] .Cockpit-DialUnit,arianna-cockpit[theme="light"] .Cockpit-DialSub,arianna-cockpit[theme="light"] .Cockpit-Tire,arianna-cockpit[theme="light"] .Cockpit-Metric', { Color:'#65717b' }),
        new Css.Rule('arianna-cockpit[theme="light"] .Cockpit-Tire strong,arianna-cockpit[theme="light"] .Cockpit-Metric strong', { Color:'#20282f' }),
        new Css.Rule('arianna-cockpit[theme="light"] .Cockpit-Car', { Background:'linear-gradient(180deg,#fff,#bfc7ce)', BorderColor:'#78838c' }),
        new Css.Rule('arianna-cockpit[theme="light"] .Cockpit-Bottom', { BorderTopColor:'rgba(30,40,50,.10)' })
    ]);

    @Component('arianna-cockpit', Styles, {
        Shadow: false,
        Attributes: ['theme','title','speed','unit','gear','mode','range','power','rpm','connected','ready','time','ambient-temp','fuel-level','odometer']
    })
    export class Cockpit extends HTMLElement {
        public static readonly Styles = Styles;
        public template = html``;

        constructor(options: Interfaces.CockpitOptions = {}) {
            super();
            if(options.theme) this.setAttribute('theme', options.theme);
            if(options.title) this.setAttribute('title', options.title);
            if(options.unit) this.setAttribute('unit', options.unit);
            State.set(this, this.mergeState(this.defaultState(), options));
        }

        public onCreated(): void { if(this.isConnected) this.onConnected(); }
        public onConnected(): void { this.classList.add('AriannaCockpit'); if(!this.hasAttribute('theme')) this.setAttribute('theme','dark'); this.applyAttributes(); this.render(); }
        public onAttributeChanged(): void { if(!this.isConnected) return; this.applyAttributes(); this.render(); }

        public get state(): Interfaces.CockpitState { return this.clone(this.ensureState()); }
        public set state(value: Interfaces.CockpitState) { State.set(this, this.mergeState(this.defaultState(), value ?? {})); if(this.isConnected) this.render(); }
        public setState(value: Partial<Interfaces.CockpitState>): this { State.set(this, this.mergeState(this.ensureState(), value)); if(this.isConnected) this.render(); this.emit('arianna:cockpit-state',{state:this.state}); return this; }
        public updateTelemetry(value: Partial<Interfaces.CockpitState>): this { return this.setState(value); }
        public get speed(): number { return this.ensureState().motion?.speed ?? 0; }
        public set speed(value: number) { this.setState({motion:{...(this.ensureState().motion ?? {}),speed:this.number(value,0)}}); }
        public get gear(): Types.Gear { return this.ensureState().motion?.gear ?? 'P'; }
        public set gear(value: Types.Gear) { this.setState({motion:{...(this.ensureState().motion ?? {}),gear:value}}); }
        public get driveMode(): Types.DriveMode { return this.ensureState().driveMode ?? 'comfort'; }
        public set driveMode(value: Types.DriveMode) { this.setState({driveMode:value}); }

        private ensureState(): Interfaces.CockpitState { let state=State.get(this); if(!state){state=this.defaultState();State.set(this,state);} return state; }

        private applyAttributes(): void {
            const state=this.ensureState();
            const motion={...(state.motion ?? {})};
            if(this.hasAttribute('speed')) motion.speed=this.number(this.getAttribute('speed'),motion.speed ?? 0);
            if(this.hasAttribute('unit')) motion.speedUnit=this.getAttribute('unit')==='mph'?'mph':'km/h';
            if(this.hasAttribute('gear')) motion.gear=this.getAttribute('gear')||'P';
            if(this.hasAttribute('rpm')) motion.rpm=this.number(this.getAttribute('rpm'),motion.rpm ?? 0);
            if(this.hasAttribute('odometer')) motion.odometer=this.number(this.getAttribute('odometer'),motion.odometer ?? 0);
            const energy={...(state.energy ?? {})};
            if(this.hasAttribute('range')) energy.fuelRange=this.number(this.getAttribute('range'),energy.fuelRange ?? 0);
            if(this.hasAttribute('fuel-level')) energy.fuelLevel=this.number(this.getAttribute('fuel-level'),energy.fuelLevel ?? 0);
            const climate={...(state.climate ?? {})};
            if(this.hasAttribute('ambient-temp')) climate.ambientTemp=this.number(this.getAttribute('ambient-temp'),climate.ambientTemp ?? 20);
            State.set(this,this.mergeState(state,{motion,energy,climate,driveMode:this.getAttribute('mode')||state.driveMode,connected:this.hasAttribute('connected')?true:state.connected,ready:this.hasAttribute('ready')?true:state.ready}));
        }

        private defaultState(): Interfaces.CockpitState {
            return {
                identity:{make:'AriannA',model:'GT',trim:'Touring',modelYear:2026,powertrain:'ice',drivetrain:'awd'},
                motion:{speed:0,speedUnit:'km/h',rpm:700,rpmMax:8000,gear:'P',odometer:31518,tripA:248.3,heading:28,altitude:118},
                powertrain:{engineRunning:true,engineTemp:91,oilTemp:96,oilPressure:2.4,transmissionTemp:82,power:12,powerUnit:'kW',torque:84,torqueUnit:'Nm'},
                energy:{fuelLevel:72,fuelRange:610,fuelConsumption:7.4,fuelConsumptionUnit:'l/100km'},
                chassis:{tires:[{position:'FL',pressure:2.48,pressureUnit:'bar',temperature:49},{position:'FR',pressure:2.48,pressureUnit:'bar',temperature:50},{position:'RL',pressure:2.58,pressureUnit:'bar',temperature:44},{position:'RR',pressure:2.48,pressureUnit:'bar',temperature:43}]},
                adas:{laneKeep:'standby',adaptiveCruise:'standby',speedLimit:90,handsOnWheel:true,autonomousLevel:2},
                navigation:{active:false,compass:'N'}, climate:{ambientTemp:34,cabinTemp:22,driverTemp:21,passengerTemp:21,auto:true,ac:true},
                occupants:{driverPresent:true,driverBelt:true}, body:{parkingBrake:true,autoHold:false,headlights:'auto'}, connectivity:{online:true,gps:true,cellular:true,bluetooth:true},
                driveMode:'comfort',ready:true,connected:true,warnings:[],indicators:[],metrics:[]
            };
        }

        private render(): void {
            const s=this.ensureState(); const motion=s.motion ?? {}; const energy=s.energy ?? {}; const tires=s.chassis?.tires ?? []; const climate=s.climate ?? {}; const powertrain=s.powertrain ?? {};
            const speed=Math.max(0,motion.speed ?? 0); const rpm=Math.max(0,motion.rpm ?? 0); const rpmMax=Math.max(1000,motion.rpmMax ?? 8000);
            const speedPct=clamp(speed/260,0,1); const rpmPct=clamp(rpm/rpmMax,0,1);
            const cluster=document.createElement('div'); cluster.className='Cockpit-Cluster';

            const top=document.createElement('div'); top.className='Cockpit-TopLine';
            const leftWarn=document.createElement('div'); leftWarn.className='Cockpit-WarningIcons'; leftWarn.style.justifyContent='flex-start';
            if(s.body?.parkingBrake){const x=document.createElement('span');x.className='Cockpit-WarningIcon';x.textContent='Ⓟ';leftWarn.appendChild(x);} if(s.occupants?.driverPresent&&!s.occupants?.driverBelt){const x=document.createElement('span');x.className='Cockpit-WarningIcon';x.textContent='♟';leftWarn.appendChild(x);}
            const center=document.createElement('div'); center.className='Cockpit-TopCenter'; const time=document.createElement('span');time.className='Cockpit-TopValue';time.textContent=this.getAttribute('time')||'17:24'; const temp=document.createElement('span');temp.className='Cockpit-TopValue';temp.textContent=`${Math.round(climate.ambientTemp ?? 20)}°C`; center.append(time,temp);
            const rightWarn=document.createElement('div');rightWarn.className='Cockpit-WarningIcons'; if(s.body?.doorFL||s.body?.doorFR||s.body?.doorRL||s.body?.doorRR){const x=document.createElement('span');x.className='Cockpit-WarningIcon';x.textContent='▯';rightWarn.appendChild(x);} top.append(leftWarn,center,rightWarn); cluster.appendChild(top);

            const main=document.createElement('div'); main.className='Cockpit-Main';
            main.append(this.dial('speed',speedPct,String(Math.round(speed)),motion.speedUnit||'km/h',String(motion.gear||'P'),`C  ${Math.round(powertrain.engineTemp ?? 90)}°`, '#4d9de0'));
            main.append(this.centerVehicle(tires,s));
            main.append(this.dial('rpm',rpmPct,(rpm/1000).toFixed(1),'×1000 r/min',`ODO ${Math.round(motion.odometer ?? 0)} km`,`E     F  ${Math.round(energy.fuelLevel ?? 0)}%`, '#e40c88'));
            cluster.appendChild(main);

            const bottom=document.createElement('div'); bottom.className='Cockpit-Bottom';
            const metricsLeft=document.createElement('div');metricsLeft.className='Cockpit-BottomMetrics';metricsLeft.append(this.metric('Trip',`${motion.tripA ?? 0} km`),this.metric('Range',`${energy.fuelRange ?? energy.batteryRange ?? 0} km`));
            const ready=document.createElement('div');ready.className='Cockpit-Ready';ready.textContent=s.ready?'READY':'STANDBY';
            const metricsRight=document.createElement('div');metricsRight.className='Cockpit-BottomMetrics';metricsRight.style.justifyContent='flex-end';metricsRight.append(this.metric('Mode',String(s.driveMode||'normal')),this.metric('Fuel',`${Math.round(energy.fuelLevel ?? 0)}%`));
            bottom.append(metricsLeft,ready,metricsRight); cluster.appendChild(bottom);
            this.replaceChildren(cluster);
        }

        private dial(kind:string,pct:number,value:string,unit:string,sub:string,mini:string,color:string):HTMLElement {
            const dial=document.createElement('div');dial.className='Cockpit-Dial';dial.dataset.kind=kind;dial.style.setProperty('--Dial-Color',color);dial.style.setProperty('--Dial-Angle',`${36+pct*238}deg`);
            const outer=document.createElement('div');outer.className='Cockpit-DialOuter';const ticks=document.createElement('div');ticks.className='Cockpit-DialTicks';const inner=document.createElement('div');inner.className='Cockpit-DialInner';
            const v=document.createElement('div');v.className='Cockpit-DialValue';v.textContent=value;const u=document.createElement('div');u.className='Cockpit-DialUnit';u.textContent=unit;const s=document.createElement('div');s.className=kind==='speed'?'Cockpit-Gear':'Cockpit-DialSub';s.textContent=sub;inner.append(v,u,s);const arc=document.createElement('div');arc.className='Cockpit-MiniArc';arc.textContent=mini;dial.append(outer,ticks,inner,arc);return dial;
        }

        private centerVehicle(tires:Interfaces.Tire[],state:Interfaces.CockpitState):HTMLElement {
            const center=document.createElement('div');center.className='Cockpit-Center';const status=document.createElement('div');status.className='Cockpit-CenterStatus';status.textContent=state.adas?.laneKeep==='active'?'LANE ASSIST · ACTIVE':'VEHICLE STATUS';
            const zone=document.createElement('div');zone.className='Cockpit-CarZone';const left=document.createElement('div');left.className='Cockpit-Tires';left.dataset.side='left';const right=document.createElement('div');right.className='Cockpit-Tires';right.dataset.side='right';
            const by=(pos:Interfaces.Tire['position'])=>tires.find(t=>t.position===pos);left.append(this.tire(by('FL')),this.tire(by('RL')));right.append(this.tire(by('FR')),this.tire(by('RR')));const car=document.createElement('div');car.className='Cockpit-Car';zone.append(left,car,right);const mode=document.createElement('div');mode.className='Cockpit-CenterMode';mode.textContent=String(state.driveMode||'normal');center.append(status,zone,mode);return center;
        }

        private tire(t?:Interfaces.Tire):HTMLElement { const node=document.createElement('div');node.className='Cockpit-Tire';node.dataset.warning=String(!!t?.warning);const p=document.createElement('strong');p.textContent=t?`${t.pressure?.toFixed(2) ?? '—'} ${t.pressureUnit ?? 'bar'}`:'—';const temp=document.createElement('span');temp.textContent=t?`${Math.round(t.temperature ?? 0)}°C`:'—';node.append(p,temp);return node; }
        private metric(label:string,value:string):HTMLElement { const node=document.createElement('span');node.className='Cockpit-Metric';node.textContent=label;const strong=document.createElement('strong');strong.textContent=value;node.appendChild(strong);return node; }
        private mergeState(base:Interfaces.CockpitState,patch:Partial<Interfaces.CockpitState>):Interfaces.CockpitState { const out={...base,...patch}; const nested:(keyof Interfaces.CockpitState)[]=['identity','motion','powertrain','energy','chassis','adas','navigation','climate','occupants','body','media','phone','connectivity'];for(const key of nested){const b=(base as any)[key],p=(patch as any)[key];if(b||p)(out as any)[key]={...(b??{}),...(p??{})};}if(patch.warnings)out.warnings=patch.warnings.slice();if(patch.gauges)out.gauges=patch.gauges.slice();if(patch.indicators)out.indicators=patch.indicators.slice();if(patch.metrics)out.metrics=patch.metrics.slice();return out; }
        private clone<T>(value:T):T { return typeof structuredClone==='function'?structuredClone(value):JSON.parse(JSON.stringify(value)); }
        private number(value:unknown,fallback=0):number { const parsed=Number(value);return Number.isFinite(parsed)?parsed:fallback; }
        private emit(type:string,detail:Record<string,unknown>={}):void { this.dispatchEvent(new CustomEvent(type,{bubbles:true,composed:true,detail:{...detail,cockpit:this,source:this}})); }
    }
}

function clamp(value:number,min:number,max:number):number { return Math.max(min,Math.min(max,value)); }

export const CockpitComponent = Cockpit.Cockpit;
export { CockpitComponent as AutomotiveCockpit };
export type CockpitOptions = Cockpit.Interfaces.CockpitOptions;
export type CockpitState = Cockpit.Interfaces.CockpitState;
export type CockpitGauge = Cockpit.Interfaces.Gauge;
export type CockpitIndicator = Cockpit.Interfaces.Indicator;
export type CockpitMetric = Cockpit.Interfaces.Metric;
export default Cockpit.Cockpit;
