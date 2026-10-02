/**
 * @module components/video/VideoTrack
 * @version 2.0.0
 * @description DaVinci-style video track. Owns VideoPart children exactly as AudioTrack owns AudioPart children.
 */

/** Two independent scale controls. Native viewport scrollbars remain responsible for panning. */
function syncTimelineScales(host: HTMLElement, xAttribute: string, x: number, yAttribute: string, y: number, nested = false): void {
    let controls = host.querySelector<HTMLElement>(':scope > .Timeline-ScaleControls');
    if(nested) { controls?.remove(); host.style.paddingBottom = ''; host.style.paddingRight = ''; return; }
    host.style.position = 'relative';
    host.style.paddingBottom = '30px'; host.style.paddingRight = '30px';
    if(!controls) {
        controls = document.createElement('div'); controls.className = 'Timeline-ScaleControls';
        controls.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:25';
        const make = (axis: string, attribute: string, min: number, max: number) => {
            const input = document.createElement('input'); input.type = 'range';
            input.dataset.axis = axis; input.min = String(min); input.max = String(max); input.step = '1';
            input.setAttribute('aria-label', axis === 'x' ? 'Horizontal timeline scale' : 'Vertical track height');
            input.title = axis === 'x' ? 'Horizontal zoom' : 'Track height';
            input.style.cssText = 'position:absolute;pointer-events:auto;accent-color:#e40c88;margin:0;cursor:pointer;touch-action:none;';
            input.style.cssText += axis === 'x' ? 'right:34px;bottom:4px;width:112px;height:22px' : 'right:4px;bottom:34px;width:22px;height:80px;max-height:calc(100% - 38px);writing-mode:vertical-lr;direction:rtl';
            if(axis === 'y') input.setAttribute('aria-orientation','vertical');
            input.addEventListener('pointerdown', event => event.stopPropagation());
            input.addEventListener('keydown', event => event.stopPropagation());
            input.addEventListener('input', () => host.setAttribute(attribute,input.value));
            controls!.appendChild(input);
        };
        make('x',xAttribute, xAttribute === 'beat-px' ? 8 : 10, xAttribute === 'beat-px' ? 160 : 240);
        make('y',yAttribute,48,240);
        host.appendChild(controls);
    }
    for(const [axis,value] of [['x',x],['y',y]] as const) {
        const input=controls.querySelector<HTMLInputElement>(`[data-axis="${axis}"]`)!;
        input.min=String(Math.min(Number(input.min),value)); input.max=String(Math.max(Number(input.max),value));
        input.value=String(value); input.setAttribute('aria-valuetext',`${Math.round(value)} pixels`);
    }
}
import { Component, Css, Templates, Real } from '../../core/index.ts';
import { AutomationLaneCollection, AutomationOverlay } from '../timeline/Automation.ts';
import type { AutomationLane } from '../timeline/Automation.ts';
import { VideoPart as VideoPartConstructor, EnsureVideoPartVisual } from './VideoPart.ts';
import type { VideoPart, VideoPartOptions, VideoPartSnapshot, VideoTheme } from './VideoPart.ts';

export interface VideoTrackOptions {
    index?: number;
    name?: string;
    color?: string;
    theme?: VideoTheme;
    locked?: boolean;
    visible?: boolean;
    height?: number;
    pixelsPerSecond?: number;
    snap?: number;
    framerate?: number;
    automations?: AutomationLane[];
    editMode?: VideoTrackEditMode;
    activeAutomation?: string;
    automationRead?: boolean;
    automationWrite?: boolean;
    parts?: VideoTrackPartInput[];
}

export type VideoTrackEditMode = 'parts' | 'automation-select' | 'automation-draw';

export interface VideoTrackSnapshot {
    index: number;
    name: string;
    color: string;
    theme: VideoTheme;
    locked: boolean;
    visible: boolean;
    automations: AutomationLane[];
    parts: VideoPartSnapshot[];
}

const html = Templates.Template.Html;
const Runtime = new WeakMap<HTMLElement, { bound: boolean }>();
const VideoTrackReactiveAttributes = new Set([
    'index','name','color','theme','locked','hidden-track','height',
    'pixels-per-second','snap','framerate','edit-mode','active-automation',
    'automation-read','automation-write'
]);

export type VideoTrackPartInput = VideoPart | VideoPartOptions;

function isVideoPartElement(value: unknown): value is VideoPart {
    return typeof HTMLElement !== 'undefined'
        && value instanceof HTMLElement
        && value.localName === 'arianna-video-part';
}

function numberValue(value: unknown, fallback = 0): number {
    if(value == null || (typeof value === 'string' && value.trim() === '')) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function boolAttribute(element: Element, name: string, value: boolean): void {
    element.toggleAttribute(name, !!value);
}

function setAttributeIfChanged(element: Element, name: string, value: string): void {
    if(element.getAttribute(name) !== value) element.setAttribute(name, value);
}

function applyOptions(element: HTMLElement, options: VideoTrackOptions = {}): void {
    if(options.index != null) element.setAttribute('index', String(options.index));
    if(options.name != null) element.setAttribute('name', String(options.name));
    if(options.color != null) element.setAttribute('color', String(options.color));
    if(options.theme != null) element.setAttribute('theme', options.theme === 'light' ? 'light' : 'dark');
    if(options.locked != null) boolAttribute(element, 'locked', options.locked);
    if(options.visible != null) boolAttribute(element, 'hidden-track', !options.visible);
    if(options.height != null) element.setAttribute('height', String(options.height));
    if(options.pixelsPerSecond != null) element.setAttribute('pixels-per-second', String(options.pixelsPerSecond));
    if(options.snap != null) element.setAttribute('snap', String(options.snap));
    if(options.framerate != null) element.setAttribute('framerate', String(options.framerate));
    if(options.automations != null) (element as VideoTrack).automations = options.automations;
    if(options.editMode != null) (element as VideoTrack).editMode = options.editMode;
    if(options.activeAutomation != null) (element as VideoTrack).activeAutomation = options.activeAutomation;
    if(options.automationRead != null) (element as VideoTrack).automationRead = options.automationRead;
    if(options.automationWrite != null) (element as VideoTrack).automationWrite = options.automationWrite;
    if(options.parts != null) (element as VideoTrack).parts = options.parts;
}

/** Lightweight, dependency-free timecode view owned by one VideoTrack. */
export class VideoTrackTimecode {
    private Host: HTMLElement;
    private Position = 0;
    private IsDropFrame = false;

    public constructor(host: HTMLElement) { this.Host = host; }

    public get FrameRate(): number { return Math.max(1, numberValue(this.Host.getAttribute('framerate'), 25)); }
    public set FrameRate(value: number) { this.Host.setAttribute('framerate', String(Math.max(1, numberValue(value, 25)))); }
    public get DropFrame(): boolean { return this.IsDropFrame && (Math.abs(this.FrameRate - 29.97) < .02 || Math.abs(this.FrameRate - 59.94) < .02); }
    public set DropFrame(value: boolean) { this.IsDropFrame = !!value; }
    public get Frame(): number { return this.Position; }
    public set Frame(value: number) { this.Position = Math.max(0, Math.round(numberValue(value, 0))); }
    public get Seconds(): number { return this.Frame / this.FrameRate; }
    public set Seconds(value: number) { this.Frame = Math.round(Math.max(0, numberValue(value, 0)) * this.FrameRate); }
    public get Text(): string { return this.Format(this.Frame); }
    public get Csv(): string {
        const parts = Array.from(this.Host.querySelectorAll<HTMLElement>('.VideoTrack-Lane > arianna-video-part'));
        return ['Id,Label,StartFrame,EndFrame,In,Out', ...parts.map((part, index) => {
            const start = Math.round(numberValue(part.getAttribute('start'), 0) * this.FrameRate);
            const end = start + Math.round(numberValue(part.getAttribute('length'), 1) * this.FrameRate);
            return `${JSON.stringify(part.id || `clip-${index + 1}`)},${JSON.stringify(part.getAttribute('label') || 'Video')},${start},${end},${this.Format(start)},${this.Format(end)}`;
        })].join('\n');
    }
    public get Json(): string {
        return JSON.stringify({ FrameRate: this.FrameRate, DropFrame: this.DropFrame, Frame: this.Frame, Text: this.Text }, null, 2);
    }

    public Format(frame = this.Frame): string {
        const nominal = Math.max(1, Math.round(this.FrameRate));
        let count = Math.max(0, Math.round(frame));
        if(this.DropFrame) {
            const drop = nominal === 60 ? 4 : 2;
            const perMinute = nominal * 60 - drop;
            const perTenMinutes = nominal * 600 - drop * 9;
            const blocks = Math.floor(count / perTenMinutes);
            const remainder = count % perTenMinutes;
            count += drop * 9 * blocks;
            if(remainder > drop) count += drop * Math.floor((remainder - drop) / perMinute);
        }
        const ff = count % nominal;
        const totalSeconds = Math.floor(count / nominal);
        const ss = totalSeconds % 60;
        const mm = Math.floor(totalSeconds / 60) % 60;
        const hh = Math.floor(totalSeconds / 3600) % 24;
        const pad = (value: number): string => String(value).padStart(2, '0');
        return `${pad(hh)}:${pad(mm)}:${pad(ss)}${this.DropFrame ? ';' : ':'}${pad(ff)}`;
    }
}

export const VideoTrackStyles = new Css.Stylesheet([
    new Css.Rule('arianna-video-track,.VideoTrack', {
        '--VideoTrack-Color': '#4d9de0',
        Background: '#20252a', BorderBottom: '1px solid #0e1114', BoxSizing: 'border-box', Color: '#d8dee4', Display: 'grid',
        GridTemplateColumns: '154px minmax(0,1fr)', MinHeight: '82px', Position: 'relative', Width: '100%'
    }),
    new Css.Rule('.VideoTrack-Header', {
        Background: 'linear-gradient(180deg,#31373d,#252a2f)', BorderRight: '1px solid #111417', Display: 'grid', Gap: '4px',
        GridTemplateColumns: '5px minmax(0,1fr) auto', GridTemplateRows: 'auto auto auto', Padding: '6px 6px 6px 0', Position: 'relative', ZIndex: '2'
    }),
    new Css.Rule('.VideoTrack-Color', { AlignSelf: 'stretch', Background: 'var(--VideoTrack-Color)', BorderRadius: '0 1px 1px 0', GridRow: '1 / span 3' }),
    new Css.Rule('.VideoTrack-Name', { Font: '750 10px/1 var(--arianna-font,system-ui,sans-serif)', MinWidth: '0', Overflow: 'hidden', Padding: '3px 0 0 5px', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap' }),
    new Css.Rule('.VideoTrack-Buttons', { Display: 'flex', Gap: '2px' }),
    new Css.Rule('.VideoTrack-Button', { Appearance: 'none', Background: 'linear-gradient(180deg,#464c52,#30353a)', Border: '1px solid #15181b', BorderRadius: '2px', Color: '#b4bdc5', Cursor: 'pointer', Font: '700 8px/1 var(--arianna-font,system-ui,sans-serif)', Height: '19px', Padding: '0', Width: '22px' }),
    new Css.Rule('.VideoTrack-Button[data-active="true"]', { Background: '#e40c88', BorderColor: '#8f0754', Color: '#fff' }),
    new Css.Rule('.VideoTrack-Button[data-action="lock"][data-active="true"]', { Background: '#d7a23d', BorderColor: '#93691e', Color: '#191207' }),
    new Css.Rule('.VideoTrack-Meta', { Color: '#7e8892', Font: '8px/1 var(--arianna-font,system-ui,sans-serif)', GridColumn: '2', PaddingLeft: '5px' }),
    new Css.Rule('.VideoTrack-AutomationControls', { AlignItems: 'center', Display: 'grid', Gap: '2px', GridColumn: '2 / span 2', GridTemplateColumns: '19px minmax(42px,1fr) 19px 19px', MarginLeft: '4px', MinWidth: '0' }),
    new Css.Rule('.VideoTrack-AutomationSelect', { Appearance: 'none', Background: '#202428', Border: '1px solid #151719', BorderRadius: '2px', Color: '#cbd1d5', Font: '600 8px/1 var(--arianna-font,system-ui,sans-serif)', Height: '18px', MinWidth: '0', Padding: '0 15px 0 5px' }),
    new Css.Rule('.VideoTrack-AutomationControls .VideoTrack-Button', { Height: '18px', Width: '19px' }),
    new Css.Rule('.VideoTrack-Button[data-active="true"][data-action="automation"],.VideoTrack-Button[data-active="true"][data-action="automation-read"]', { Background: '#4d9de0', BorderColor: '#266b9e', Color: '#fff' }),
    new Css.Rule('.VideoTrack-Button[data-active="true"][data-action="automation-write"]', { Background: '#d9564d', BorderColor: '#96332d', Color: '#fff' }),
    new Css.Rule('.VideoTrack-Lane', {
        BackgroundColor: '#1b2025', BackgroundImage: 'linear-gradient(to right,rgba(160,170,180,.12) 1px,transparent 1px)',
        BackgroundSize: 'var(--VideoTrack-Pps,36px) 100%', MinHeight: '82px', Overflow: 'hidden', Position: 'relative', Width: '100%'
    }),
    new Css.Rule('arianna-video-track[hidden-track] .VideoTrack-Lane,.VideoTrack[hidden-track] .VideoTrack-Lane', { Opacity: '.24' }),
    new Css.Rule('arianna-video-track[locked] .VideoTrack-Lane,.VideoTrack[locked] .VideoTrack-Lane', { BackgroundColor: '#171b1f' }),
    new Css.Rule('arianna-video-track[data-edit-mode="parts"] .VideoTrack-Automation,.VideoTrack[data-edit-mode="parts"] .VideoTrack-Automation', { Display: 'none', Opacity: '0', PointerEvents: 'none' }),
    new Css.Rule('arianna-video-track[data-edit-mode^="automation"] arianna-video-part,.VideoTrack[data-edit-mode^="automation"] arianna-video-part', { Filter: 'saturate(.88)', Opacity: '.54', PointerEvents: 'none' }),
    new Css.Rule('arianna-video-track[theme="light"],.VideoTrack[theme="light"],arianna-video-track-editor[theme="light"] arianna-video-track', { Background: '#e5e8eb', BorderBottomColor: '#bcc2c8', Color: '#2d353d' }),
    new Css.Rule('arianna-video-track[theme="light"] .VideoTrack-Header,arianna-video-track-editor[theme="light"] .VideoTrack-Header', { Background: 'linear-gradient(180deg,#fbfcfd,#e1e5e8)', BorderRightColor: '#c0c6cb' }),
    new Css.Rule('arianna-video-track[theme="light"] .VideoTrack-Button,arianna-video-track-editor[theme="light"] .VideoTrack-Button', { Background: 'linear-gradient(180deg,#fff,#e4e7ea)', BorderColor: '#bbc1c6', Color: '#4a545e' }),
    new Css.Rule('arianna-video-track[theme="light"] .VideoTrack-AutomationSelect,arianna-video-track-editor[theme="light"] .VideoTrack-AutomationSelect', { Background: '#fff', BorderColor: '#b8bdc2', Color: '#343a40' }),
    new Css.Rule('arianna-video-track[theme="light"] .VideoTrack-Button[data-action="visible"][data-active="true"]', { Background: '#e40c88', BorderColor: '#8f0754', Color: '#fff' }),
    new Css.Rule('arianna-video-track[theme="light"] .VideoTrack-Button[data-action="lock"][data-active="true"]', { Background: '#d7a23d', BorderColor: '#93691e', Color: '#191207' }),
    new Css.Rule('arianna-video-track[theme="light"] .VideoTrack-Lane,arianna-video-track-editor[theme="light"] .VideoTrack-Lane', { BackgroundColor: '#f1f3f5', BackgroundImage: 'linear-gradient(to right,rgba(71,79,86,.10) 1px,transparent 1px)' })
]);

@Component('arianna-video-track', VideoTrackStyles, {
    Shadow: false,
    Attributes: ['index','name','color','theme','locked','hidden-track','height','pixels-per-second','snap','framerate','edit-mode','active-automation','automation-read','automation-write']
})
export class VideoTrackElement extends HTMLElement {
    public static readonly Styles = VideoTrackStyles;
    public template = html``;
    private AutomationCollection=new AutomationLaneCollection();
    private AutomationView?:AutomationOverlay;
    private AutomationSelect?:HTMLSelectElement;
    private LastAutomationTime=0;
    private TimecodeState?:VideoTrackTimecode;

    /** Promotion-safe state for declarative <arianna-video-track> elements. */
    private ensureAutomationState(): void {
        if(!(this.AutomationCollection instanceof AutomationLaneCollection))
            this.AutomationCollection = new AutomationLaneCollection();
        if(!Number.isFinite(this.LastAutomationTime)) this.LastAutomationTime=0;
    }

    public onCreated(): void { this.ensureAutomationState(); this.initialize(); }

    public onConnected(): void {
        this.initialize();
    }

    private initialize(): void {
        this.ensureAutomationState();
        this.classList.add('VideoTrack');
        if(!this.hasAttribute('edit-mode')) this.setAttribute('edit-mode','parts');
        if(!this.hasAttribute('automation-read')) this.setAttribute('automation-read','false');
        if(!this.hasAttribute('automation-write')) this.setAttribute('automation-write','false');
        if(!this.hasAttribute('theme')) {
            const parentTheme = this.closest('arianna-video-track-editor')?.getAttribute('theme');
            this.setAttribute('theme', parentTheme === 'light' ? 'light' : 'dark');
        }
        this.style.setProperty('--VideoTrack-Color', this.color);
        this.applyCriticalLayout();
        this.renderTrack();
        this.syncDimensions();
        this.syncChildren();
        this.bindTrack();
        this.refresh();
        this.syncAutomation();
    }

    public onAttributeChanged(name: string): void {
        if(!this.isConnected) return;
        if(!VideoTrackReactiveAttributes.has(name)) return;
        if(name === 'color') this.style.setProperty('--VideoTrack-Color', this.color);
        if(name === 'height' || name === 'pixels-per-second' || name === 'snap' || name === 'framerate') this.syncDimensions();
        if(name === 'edit-mode' || name === 'active-automation' || name === 'automation-read' || name === 'automation-write') this.syncAutomation();
        if(name === 'theme') this.syncChildren();
        this.refresh();
    }

    public onUnmount(): void {}

    public get index(): number { return Math.max(0, Math.floor(numberValue(this.getAttribute('index'), 0))); }
    public set index(value: number) { this.setAttribute('index', String(Math.max(0, Math.floor(numberValue(value, 0))))); }
    public get name(): string { return this.getAttribute('name') || `Video ${this.index + 1}`; }
    public set name(value: string) { this.setAttribute('name', value || `Video ${this.index + 1}`); }
    public get color(): string { return this.getAttribute('color') || '#4d9de0'; }
    public set color(value: string) { this.setAttribute('color', value || '#4d9de0'); }
    public get theme(): VideoTheme { return this.getAttribute('theme') === 'light' ? 'light' : 'dark'; }
    public set theme(value: VideoTheme) { this.setAttribute('theme', value === 'light' ? 'light' : 'dark'); }
    public get locked(): boolean { return this.hasAttribute('locked'); }
    public set locked(value: boolean) { boolAttribute(this, 'locked', value); }
    public get visible(): boolean { return !this.hasAttribute('hidden-track'); }
    public set visible(value: boolean) { boolAttribute(this, 'hidden-track', !value); }
    public get pixelsPerSecond(): number { return Math.max(1, numberValue(this.getAttribute('pixels-per-second'), numberValue(this.closest('arianna-video-track-editor')?.getAttribute('pixels-per-second'), 36))); }
    public set pixelsPerSecond(value: number) { this.setAttribute('pixels-per-second', String(Math.max(1, numberValue(value, 36)))); }
    public get framerate(): number { return Math.max(1, numberValue(this.getAttribute('framerate'), numberValue(this.closest('arianna-video-track-editor')?.getAttribute('framerate'), 25))); }
    public set framerate(value: number) { this.setAttribute('framerate', String(Math.max(1, numberValue(value, 25)))); }
    public get Timecode():VideoTrackTimecode { return this.TimecodeState ??= new VideoTrackTimecode(this); }
    public get editMode():VideoTrackEditMode { const value=this.getAttribute('edit-mode'); return value==='automation-select'||value==='automation-draw'?value:'parts'; }
    public set editMode(value:VideoTrackEditMode) { this.setAttribute('edit-mode',value==='automation-select'||value==='automation-draw'?value:'parts'); }
    public setEditMode(value:VideoTrackEditMode):this { this.editMode=value; return this; }
    public get activeAutomation():string { this.ensureAutomationState(); const requested=this.getAttribute('active-automation')?.trim(); return requested&&this.AutomationCollection.has(requested)?requested:(this.AutomationCollection.keys().next().value??''); }
    public set activeAutomation(value:string) { const id=String(value??'').trim(); if(id)this.setAttribute('active-automation',id);else this.removeAttribute('active-automation'); }
    public get automationRead():boolean { return this.getAttribute('automation-read')==='true'; }
    public set automationRead(value:boolean) { this.setAttribute('automation-read',String(!!value)); }
    public get automationWrite():boolean { return this.getAttribute('automation-write')==='true'; }
    public set automationWrite(value:boolean) { this.setAttribute('automation-write',String(!!value)); }

    public get parts(): VideoPart[] {
        const lane = this.querySelector('.VideoTrack-Lane') ?? this;
        return Array.from(lane.querySelectorAll<VideoPart>(':scope > arianna-video-part'));
    }

    public set parts(value: VideoTrackPartInput[]) {
        const parts = Array.isArray(value) ? [...value] : [];
        this.clear();
        parts.forEach(part => this.addPart(part));
    }

    public setOptions(options: VideoTrackOptions): this { applyOptions(this, options); return this; }

    public get automation():AutomationLaneCollection{this.ensureAutomationState();return this.AutomationCollection;}
    public set automation(value:AutomationLaneCollection){this.AutomationCollection=value instanceof AutomationLaneCollection?value:new AutomationLaneCollection();this.syncAutomation();}
    public get automations():AutomationLane[]{this.ensureAutomationState();return this.AutomationCollection.snapshot();}
    public set automations(value:AutomationLane[]){this.ensureAutomationState();this.AutomationCollection.replace(value??[]);this.syncAutomation();}
    public setAutomationLanes(value:AutomationLane[]):this{this.automations=value;return this;}
    public addAutomationLane(value:AutomationLane):this{this.ensureAutomationState();this.AutomationCollection.upsert(value);this.syncAutomation();return this;}
    public removeAutomationLane(id:string):this{this.ensureAutomationState();this.AutomationCollection.delete(id);this.syncAutomation();return this;}
    public selectAutomation(id:string,edit=true):this { this.activeAutomation=id; if(edit&&this.editMode==='parts')this.editMode='automation-select'; this.syncAutomation(); return this; }
    public applyAutomation(time:number):this{
        this.ensureAutomationState();
        this.LastAutomationTime=Math.max(0,Number(time)||0);
        this.Timecode.Seconds=this.LastAutomationTime;
        if(this.automationRead)this.AutomationCollection.apply(this.LastAutomationTime);
        const automationOpacity=this.automationRead&&this.AutomationCollection.has('opacity')
            ? Math.max(0,Math.min(1,this.AutomationCollection.valueAt('opacity',this.LastAutomationTime)))
            : 1;
        for(const part of this.parts){
            const clipOpacity=Math.max(0,Math.min(1,numberValue(part.getAttribute('opacity'),1)));
            part.style.opacity=String(clipOpacity*automationOpacity);
        }
        return this;
    }
    public automationValue(id:string,time=this.LastAutomationTime):number { this.ensureAutomationState(); return this.AutomationCollection.valueAt(id,time); }
    public addVideoAutomationPresets(duration=12):this {
        const presets:AutomationLane[]=[
            {id:'opacity',label:'Opacity',parameter:'opacity',color:'#f5d547',min:0,max:1,defaultValue:1,points:[{time:0,value:1},{time:duration,value:1}]},
            {id:'zoom',label:'Zoom',parameter:'zoom',color:'#7bc96f',min:.1,max:4,defaultValue:1,points:[{time:0,value:1},{time:duration,value:1}]},
            {id:'position.x',label:'Position X',parameter:'position.x',color:'#4d9de0',min:-1,max:1,defaultValue:0,points:[{time:0,value:0},{time:duration,value:0}]},
            {id:'position.y',label:'Position Y',parameter:'position.y',color:'#9d6ed1',min:-1,max:1,defaultValue:0,points:[{time:0,value:0},{time:duration,value:0}]},
            {id:'rotation',label:'Rotation',parameter:'rotation',color:'#e1a33f',min:-180,max:180,defaultValue:0,points:[{time:0,value:0},{time:duration,value:0}]},
            {id:'blur',label:'Blur',parameter:'blur',color:'#53c5c8',min:0,max:40,defaultValue:0,points:[{time:0,value:0},{time:duration,value:0}]},
            {id:'plugin.mix',label:'Plugin Mix',parameter:'plugin.mix',color:'#e40c88',min:0,max:1,defaultValue:0,points:[{time:0,value:0},{time:duration,value:0}]}
        ];
        for(const lane of presets)if(!this.AutomationCollection.has(lane.id))this.AutomationCollection.upsert(lane);
        this.syncAutomation(); return this;
    }

    public addPart(partOrOptions: VideoTrackPartInput = {}): VideoPart {
        /*
         * Same ownership model as AudioTrack:
         * VideoTrack owns VideoPart children, VideoTrackEditor owns VideoTrack children.
         * A part is always mounted into this track's lane and is synchronously promoted
         * through the canonical VideoPart constructor path before its visual is synced.
         */
        const part = isVideoPartElement(partOrOptions)
            ? partOrOptions
            : new VideoPartConstructor(partOrOptions as VideoPartOptions);

        const lane = this.ensureLane();
        lane.appendChild(part);
        this.mountPart(part, lane);

        this.refresh();

        this.emit('arianna:video-track-change', { kind: 'add', part });
        this.syncAutomation();
        return part;
    }

    public removePart(partOrId: VideoPart | string): this {
        const part = typeof partOrId === 'string' ? this.parts.find(candidate => candidate.id === partOrId) : partOrId;
        if(part) {
            part.remove();
            this.refresh();
            this.emit('arianna:video-track-change', { kind: 'remove', part });
        }
        return this;
    }

    public clear(): this {
        this.parts.forEach(part => part.remove());
        this.refresh();
        this.emit('arianna:video-track-change', { kind: 'clear' });
        return this;
    }

    public snapshot(): VideoTrackSnapshot {
        return {
            index: this.index,
            name: this.name,
            color: this.color,
            theme: this.theme,
            locked: this.locked,
            visible: this.visible,
            automations: this.automations,
            parts: this.parts.map(part => typeof part.snapshot === 'function' ? part.snapshot() : {
                id: part.id || '', start: numberValue(part.getAttribute('start'), 0), length: numberValue(part.getAttribute('length'), 1), duration: numberValue(part.getAttribute('length'), 1),
                sourceStart: numberValue(part.getAttribute('source-start'), 0), sourceIn: numberValue(part.getAttribute('source-start'), 0),
                src: part.getAttribute('src') || '', source: part.getAttribute('src') || '', label: part.getAttribute('label') || 'Video', name: part.getAttribute('label') || 'Video',
                color: part.getAttribute('color') || '#4d9de0', theme: this.theme, speed: 1,
                opacity: numberValue(part.getAttribute('opacity'), 1),
                fadeIn: numberValue(part.getAttribute('fade-in'), 0), fadeOut: numberValue(part.getAttribute('fade-out'), 0),
                volume: 1, muted: false, locked: false,
                poster: part.getAttribute('poster') || '', frames: []
            })
        };
    }

    private renderTrack(): void {
        if(this.querySelector(':scope > .VideoTrack-Header')) {
            this.syncChildren();
            return;
        }

        /*
         * IMPORTANT:
         * Capture declarative <arianna-video-part> children BEFORE replacing
         * the track surface, exactly like AudioTrack captures AudioPart children.
         * Do not render/promote them until they are inside the final lane: their
         * timing/theme owner is the VideoTrack, not the temporary parser position.
         */
        const existingParts = Array.from(
            this.querySelectorAll<HTMLElement>(':scope > arianna-video-part')
        );

        const header = document.createElement('div');
        header.className = 'VideoTrack-Header';

        const stripe = document.createElement('span');
        stripe.className = 'VideoTrack-Color';

        const name = document.createElement('span');
        name.className = 'VideoTrack-Name';

        const buttons = document.createElement('span');
        buttons.className = 'VideoTrack-Buttons';
        buttons.append(
            this.button('V', 'visible', 'Track visibility'),
            this.button('L', 'lock', 'Lock track')
        );

        const meta = document.createElement('span');
        meta.className = 'VideoTrack-Meta';

        const automationControls=document.createElement('span');
        automationControls.className='VideoTrack-AutomationControls';
        const automation=this.button('⌁','automation','Toggle clips / automation editing');
        this.AutomationSelect=document.createElement('select');
        this.AutomationSelect.className='VideoTrack-AutomationSelect';
        this.AutomationSelect.title='Video automation parameter';
        this.AutomationSelect.setAttribute('aria-label','Video automation parameter');
        const read=this.button('R','automation-read','Read automation');
        const write=this.button('W','automation-write','Write automation');
        automationControls.append(automation,this.AutomationSelect,read,write);

        header.append(stripe, name, buttons, meta,automationControls);

        const lane = document.createElement('div');
        lane.className = 'VideoTrack-Lane';

        this.replaceChildren(header, lane);

        existingParts.forEach(part => {
            lane.appendChild(part);
            this.mountPart(part, lane);
        });
        if(!this.AutomationCollection.size)this.addVideoAutomationPresets();
        this.syncAutomation();
    }

    private ensureLane(): HTMLElement {
        this.renderTrack();
        let lane = this.querySelector<HTMLElement>(':scope > .VideoTrack-Lane');
        if(!lane) {
            lane = document.createElement('div');
            lane.className = 'VideoTrack-Lane';
            this.appendChild(lane);
        }
        return lane;
    }

    private mountPart(raw: HTMLElement, lane = this.ensureLane()): VideoPart {
        if(raw.parentElement !== lane)
            lane.appendChild(raw);

        // Existing nodes are promoted in place by AriannA's document observer.
        // `new Real(raw)` merely creates another facade for the same node, so
        // doing it on every child synchronization leaks facades and amplifies
        // lifecycle/attribute work without changing the node's prototype.
        const part = raw as VideoPart;

        setAttributeIfChanged(part, 'theme', this.theme);
        this.applyTimingToPart(part);
        EnsureVideoPartVisual(part as unknown as HTMLElement);

        return part;
    }

    private bindTrack(): void {
        const state = Runtime.get(this) ?? { bound: false };
        Runtime.set(this, state);

        if(!state.bound) {
            state.bound = true;
            this.addEventListener('click', event => {
                const button = (event.target as HTMLElement).closest('.VideoTrack-Button') as HTMLButtonElement | null;
                if(!button) return;
                event.stopPropagation();
                if(button.dataset.action === 'lock') this.locked = !this.locked;
                if(button.dataset.action === 'visible') this.visible = !this.visible;
                if(button.dataset.action === 'automation') this.editMode=this.editMode==='parts'?'automation-select':'parts';
                if(button.dataset.action === 'automation-read') this.automationRead=!this.automationRead;
                if(button.dataset.action === 'automation-write') this.automationWrite=!this.automationWrite;
                this.refresh();
                this.emit('arianna:video-track-change', { kind: button.dataset.action });
            });
            this.addEventListener('change',event=>{
                const select=(event.target as Element|null)?.closest?.('.VideoTrack-AutomationSelect') as HTMLSelectElement|null;
                if(select)this.selectAutomation(select.value,true);
            });
        }
    }

    private button(text: string, action: string, title: string): HTMLButtonElement {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'VideoTrack-Button';
        button.dataset.action = action;
        button.title = title;
        button.textContent = text;
        return button;
    }

    private refresh(): void {
        const name = this.querySelector<HTMLElement>('.VideoTrack-Name');
        const meta = this.querySelector<HTMLElement>('.VideoTrack-Meta');
        if(name) name.textContent = this.name;
        if(meta) meta.textContent = `V${this.index + 1} · ${this.parts.length} clip${this.parts.length === 1 ? '' : 's'}`;
        this.querySelectorAll<HTMLButtonElement>('.VideoTrack-Button').forEach(button => {
            const action=button.dataset.action;
            button.dataset.active = String(action==='lock'?this.locked:action==='visible'?!this.visible:action==='automation'?this.editMode!=='parts':action==='automation-read'?this.automationRead:action==='automation-write'?this.automationWrite:false);
        });
        this.syncAutomationControls();
    }

    private syncDimensions(): void {
        const height = Math.max(48, numberValue(this.getAttribute('height'), 82));
        this.style.minHeight = `${height}px`;
        this.style.setProperty('--VideoTrack-Pps', `${this.pixelsPerSecond}px`);
        const lane = this.querySelector<HTMLElement>('.VideoTrack-Lane');
        if(lane) {
            lane.style.position = 'relative';
            lane.style.display = 'block';
            lane.style.width = '100%';
            lane.style.minHeight = '0'; lane.style.height = `${height}px`;
            lane.style.overflow = this.closest('arianna-video-track-editor') ? 'hidden' : 'auto';
            lane.style.scrollbarGutter = 'stable';
        }
        this.syncChildren();
        this.syncAutomation();
        syncTimelineScales(this,'pixels-per-second',this.pixelsPerSecond,'height',height,!!this.closest('arianna-video-track-editor'));
    }

    private applyCriticalLayout(): void {
        this.style.position = 'relative';
        this.style.display = 'grid';
        this.style.gridTemplateColumns = '154px minmax(0,1fr)';
        this.style.width = '100%';
        this.style.boxSizing = 'border-box';
    }

    private syncChildren(): void {
        const lane = this.querySelector<HTMLElement>(':scope > .VideoTrack-Lane');
        if(!lane) return;

        // Public/declarative additions may arrive after the track has rendered.
        // Move them into the lane without cloning: VideoPart remains the unit.
        const directParts = Array.from(
            this.querySelectorAll<HTMLElement>(':scope > arianna-video-part')
        );
        directParts.forEach(part => lane.appendChild(part));

        const parts = Array.from(
            lane.querySelectorAll<HTMLElement>(':scope > arianna-video-part')
        );
        parts.forEach(part => this.mountPart(part, lane));
    }

    private applyTimingToPart(part: HTMLElement): void {
        setAttributeIfChanged(part, 'pixels-per-second', String(this.pixelsPerSecond));
        const editor = this.closest('arianna-video-track-editor');
        const snap = editor?.getAttribute('snap') ?? this.getAttribute('snap');
        const framerate = editor?.getAttribute('framerate') ?? this.getAttribute('framerate');
        if(snap != null) setAttributeIfChanged(part, 'snap', snap);
        if(framerate != null) setAttributeIfChanged(part, 'framerate', framerate);
    }

    private syncAutomation():void
    {
        this.ensureAutomationState();
        const lane=this.querySelector<HTMLElement>(':scope > .VideoTrack-Lane');if(!lane)return;
        if(!this.AutomationCollection.size){this.AutomationView?.remove();this.AutomationView=undefined;this.syncAutomationControls();return;}
        const active=this.activeAutomation;
        for(const laneValue of this.AutomationCollection.values())laneValue.visible=laneValue.id===active;
        if(this.editMode==='parts'){
            this.AutomationView?.remove();this.AutomationView=undefined;this.syncAutomationControls();return;
        }
        if(!this.AutomationView){this.AutomationView=new AutomationOverlay();this.AutomationView.classList.add('VideoTrack-Automation');}
        if(this.AutomationView.parentElement!==lane)lane.append(this.AutomationView);
        const duration=Math.max(1,lane.scrollWidth/this.pixelsPerSecond);
        this.AutomationView.collection=this.AutomationCollection;
        this.AutomationView.configure({scale:this.pixelsPerSecond,duration,snap:Math.max(.001,numberValue(this.getAttribute('snap'),.04)),active});
        this.syncAutomationControls();
    }

    private syncAutomationControls():void
    {
        const select=this.AutomationSelect??this.querySelector<HTMLSelectElement>('.VideoTrack-AutomationSelect');
        if(select){
            const signature=[...this.AutomationCollection.values()].map(lane=>`${lane.id}:${lane.label??lane.parameter??lane.id}`).join('|');
            if(select.dataset.signature!==signature){
                select.replaceChildren(...[...this.AutomationCollection.values()].map(lane=>{const option=document.createElement('option');option.value=lane.id;option.textContent=lane.label??lane.parameter??lane.id;return option;}));
                select.dataset.signature=signature;
            }
            select.value=this.activeAutomation;
            select.disabled=!this.AutomationCollection.size;
        }
        this.querySelector<HTMLButtonElement>('[data-action="automation"]')?.setAttribute('data-active',String(this.editMode!=='parts'));
        this.querySelector<HTMLButtonElement>('[data-action="automation-read"]')?.setAttribute('data-active',String(this.automationRead));
        this.querySelector<HTMLButtonElement>('[data-action="automation-write"]')?.setAttribute('data-active',String(this.automationWrite));
    }

    private emit(type: string, detail: Record<string, unknown> = {}): void {
        this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: { ...detail, track: this, source: this } }));
    }
}

/** Public instance type of the AriannA-upgraded video track element. */
export type VideoTrack = VideoTrackElement;

type VideoTrackConstructor = {
    new(options?: VideoTrackOptions): VideoTrackElement;
    readonly prototype: VideoTrackElement;
    readonly Styles: Css.Stylesheet;
};

/** Direct construction uses AriannA's synchronous element creation path. */
export const VideoTrack = new Proxy(
    VideoTrackElement as unknown as VideoTrackConstructor,
    {
        construct(_target, args): VideoTrackElement {
            const element = new Real('arianna-video-track').render() as VideoTrackElement;
            applyOptions(element, (args[0] ?? {}) as VideoTrackOptions);
            return element;
        }
    }
) as VideoTrackConstructor;

export const VideoTrackComponent = VideoTrack;
export default VideoTrack;
