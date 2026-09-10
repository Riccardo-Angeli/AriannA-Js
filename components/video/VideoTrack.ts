/**
 * @module components/video/VideoTrack
 * @version 2.0.0
 * @description DaVinci-style standalone video track for AriannA 2.0.
 */
import { Component, Css, Templates, Real } from '../../core/index.ts';
import { applyVideoPartOptions, EnsureVideoPartVisual } from './VideoPart.ts';
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
}

export interface VideoTrackSnapshot {
    index: number;
    name: string;
    color: string;
    theme: VideoTheme;
    locked: boolean;
    visible: boolean;
    parts: VideoPartSnapshot[];
}

const html = Templates.Template.Html;
const Runtime = new WeakMap<HTMLElement, { bound: boolean; observer?: MutationObserver }>();

function numberValue(value: unknown, fallback = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function boolAttribute(element: Element, name: string, value: boolean): void {
    element.toggleAttribute(name, !!value);
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
}

export const VideoTrackStyles = new Css.Stylesheet([
    new Css.Rule('arianna-video-track,.VideoTrack', {
        '--VideoTrack-Color': '#4d9de0',
        Background: '#20252a', BorderBottom: '1px solid #0e1114', BoxSizing: 'border-box', Color: '#d8dee4', Display: 'grid',
        GridTemplateColumns: '154px minmax(0,1fr)', MinHeight: '82px', Position: 'relative', Width: '100%'
    }),
    new Css.Rule('.VideoTrack-Header', {
        Background: 'linear-gradient(180deg,#31373d,#252a2f)', BorderRight: '1px solid #111417', Display: 'grid', Gap: '4px',
        GridTemplateColumns: '5px minmax(0,1fr) auto', GridTemplateRows: 'auto auto', Padding: '6px 6px 6px 0', Position: 'relative', ZIndex: '2'
    }),
    new Css.Rule('.VideoTrack-Color', { AlignSelf: 'stretch', Background: 'var(--VideoTrack-Color)', BorderRadius: '0 1px 1px 0', GridRow: '1 / span 2' }),
    new Css.Rule('.VideoTrack-Name', { Font: '750 10px/1 var(--arianna-font,system-ui,sans-serif)', MinWidth: '0', Overflow: 'hidden', Padding: '3px 0 0 5px', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap' }),
    new Css.Rule('.VideoTrack-Buttons', { Display: 'flex', Gap: '2px' }),
    new Css.Rule('.VideoTrack-Button', { Appearance: 'none', Background: 'linear-gradient(180deg,#464c52,#30353a)', Border: '1px solid #15181b', BorderRadius: '2px', Color: '#b4bdc5', Cursor: 'pointer', Font: '700 8px/1 var(--arianna-font,system-ui,sans-serif)', Height: '19px', Padding: '0', Width: '22px' }),
    new Css.Rule('.VideoTrack-Button[data-active="true"]', { Background: '#e40c88', BorderColor: '#8f0754', Color: '#fff' }),
    new Css.Rule('.VideoTrack-Button[data-action="lock"][data-active="true"]', { Background: '#d7a23d', BorderColor: '#93691e', Color: '#191207' }),
    new Css.Rule('.VideoTrack-Meta', { Color: '#7e8892', Font: '8px/1 var(--arianna-font,system-ui,sans-serif)', GridColumn: '2', PaddingLeft: '5px' }),
    new Css.Rule('.VideoTrack-Lane', {
        BackgroundColor: '#1b2025', BackgroundImage: 'linear-gradient(to right,rgba(160,170,180,.12) 1px,transparent 1px)',
        BackgroundSize: 'var(--VideoTrack-Pps,36px) 100%', MinHeight: '82px', Overflow: 'hidden', Position: 'relative', Width: '100%'
    }),
    new Css.Rule('arianna-video-track[hidden-track] .VideoTrack-Lane,.VideoTrack[hidden-track] .VideoTrack-Lane', { Opacity: '.24' }),
    new Css.Rule('arianna-video-track[locked] .VideoTrack-Lane,.VideoTrack[locked] .VideoTrack-Lane', { BackgroundColor: '#171b1f' }),
    new Css.Rule('arianna-video-track[theme="light"],.VideoTrack[theme="light"],arianna-video-track-editor[theme="light"] arianna-video-track', { Background: '#e5e8eb', BorderBottomColor: '#bcc2c8', Color: '#2d353d' }),
    new Css.Rule('arianna-video-track[theme="light"] .VideoTrack-Header,arianna-video-track-editor[theme="light"] .VideoTrack-Header', { Background: 'linear-gradient(180deg,#fbfcfd,#e1e5e8)', BorderRightColor: '#c0c6cb' }),
    new Css.Rule('arianna-video-track[theme="light"] .VideoTrack-Button,arianna-video-track-editor[theme="light"] .VideoTrack-Button', { Background: 'linear-gradient(180deg,#fff,#e4e7ea)', BorderColor: '#bbc1c6', Color: '#4a545e' }),
    new Css.Rule('arianna-video-track[theme="light"] .VideoTrack-Button[data-action="visible"][data-active="true"]', { Background: '#e40c88', BorderColor: '#8f0754', Color: '#fff' }),
    new Css.Rule('arianna-video-track[theme="light"] .VideoTrack-Button[data-action="lock"][data-active="true"]', { Background: '#d7a23d', BorderColor: '#93691e', Color: '#191207' }),
    new Css.Rule('arianna-video-track[theme="light"] .VideoTrack-Lane,arianna-video-track-editor[theme="light"] .VideoTrack-Lane', { BackgroundColor: '#f1f3f5', BackgroundImage: 'linear-gradient(to right,rgba(71,79,86,.10) 1px,transparent 1px)' })
]);

@Component('arianna-video-track', VideoTrackStyles, {
    Shadow: false,
    Attributes: ['index','name','color','theme','locked','hidden-track','height','pixels-per-second','snap','framerate']
})
export class VideoTrackElement extends HTMLElement {
    public static readonly Styles = VideoTrackStyles;
    public template = html``;

    public onCreated(): void { if(this.isConnected) this.onConnected(); }

    public onConnected(): void {
        this.classList.add('VideoTrack');
        if(!this.hasAttribute('theme')) {
            const parentTheme = this.closest('arianna-video-track-editor')?.getAttribute('theme');
            this.setAttribute('theme', parentTheme === 'light' ? 'light' : 'dark');
        }
        this.style.setProperty('--VideoTrack-Color', this.color);
        this.renderTrack();
        this.syncDimensions();
        this.syncChildren();
        this.bindTrack();
        this.refresh();
    }

    public onAttributeChanged(name: string): void {
        if(!this.isConnected) return;
        if(name === 'color') this.style.setProperty('--VideoTrack-Color', this.color);
        if(name === 'height' || name === 'pixels-per-second' || name === 'snap' || name === 'framerate') this.syncDimensions();
        if(name === 'theme') this.syncChildren();
        this.refresh();
    }

    public onUnmount(): void {
        Runtime.get(this)?.observer?.disconnect();
    }

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

    public get parts(): VideoPart[] {
        const lane = this.querySelector('.VideoTrack-Lane') ?? this;
        return Array.from(lane.querySelectorAll<VideoPart>(':scope > arianna-video-part'));
    }

    public setOptions(options: VideoTrackOptions): this { applyOptions(this, options); return this; }

    public addPart(partOrOptions: VideoPart | VideoPartOptions = {}): VideoPart {
        const isElement = typeof HTMLElement !== 'undefined' && partOrOptions instanceof HTMLElement;
        const part = isElement
            ? this.ensureVideoPart(partOrOptions as unknown as HTMLElement)
            : new Real('arianna-video-part').render() as VideoPart;
        if(!isElement) applyVideoPartOptions(part, partOrOptions as VideoPartOptions);
        part.setAttribute('theme', this.theme);
        this.applyTimingToPart(part);
        const lane = this.querySelector<HTMLElement>('.VideoTrack-Lane');
        (lane ?? this).appendChild(part);
        EnsureVideoPartVisual(part as unknown as HTMLElement);
        queueMicrotask(() => { this.syncChildren(); this.refresh(); });
        this.emit('arianna:video-track-change', { kind: 'add', part });
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
            parts: this.parts.map(part => typeof part.snapshot === 'function' ? part.snapshot() : {
                id: part.id || '', start: numberValue(part.getAttribute('start'), 0), length: numberValue(part.getAttribute('length'), 1), duration: numberValue(part.getAttribute('length'), 1),
                sourceStart: numberValue(part.getAttribute('source-start'), 0), sourceIn: numberValue(part.getAttribute('source-start'), 0),
                src: part.getAttribute('src') || '', source: part.getAttribute('src') || '', label: part.getAttribute('label') || 'Video', name: part.getAttribute('label') || 'Video',
                color: part.getAttribute('color') || '#4d9de0', theme: this.theme, speed: 1, opacity: 1, volume: 1, muted: false, locked: false
            })
        };
    }

    private renderTrack(): void {
        if(this.querySelector(':scope > .VideoTrack-Header')) return;
        const existingParts = Array.from(this.querySelectorAll<HTMLElement>(':scope > arianna-video-part'))
            .map(part => this.ensureVideoPart(part));
        const header = document.createElement('div');
        header.className = 'VideoTrack-Header';
        const stripe = document.createElement('span');
        stripe.className = 'VideoTrack-Color';
        const name = document.createElement('span');
        name.className = 'VideoTrack-Name';
        const buttons = document.createElement('span');
        buttons.className = 'VideoTrack-Buttons';
        buttons.append(this.button('V', 'visible', 'Track visibility'), this.button('L', 'lock', 'Lock track'));
        const meta = document.createElement('span');
        meta.className = 'VideoTrack-Meta';
        header.append(stripe, name, buttons, meta);
        const lane = document.createElement('div');
        lane.className = 'VideoTrack-Lane';
        existingParts.forEach(part => lane.appendChild(part));
        this.replaceChildren(header, lane);
    }

    private ensureVideoPart(part: HTMLElement): VideoPart {
        EnsureVideoPartVisual(part);
        return part as unknown as VideoPart;
    }

    private bindTrack(): void {
        const state = Runtime.get(this) ?? { bound: false };
        if(state.bound) return;
        state.bound = true;
        Runtime.set(this, state);

        this.addEventListener('click', event => {
            const button = (event.target as HTMLElement).closest('.VideoTrack-Button') as HTMLButtonElement | null;
            if(!button) return;
            event.stopPropagation();
            if(button.dataset.action === 'lock') this.locked = !this.locked;
            if(button.dataset.action === 'visible') this.visible = !this.visible;
            this.refresh();
            this.emit('arianna:video-track-change', { kind: button.dataset.action });
        });

        const lane = this.querySelector<HTMLElement>('.VideoTrack-Lane');
        if(lane && typeof MutationObserver !== 'undefined') {
            state.observer?.disconnect();
            state.observer = new MutationObserver(() => { this.syncChildren(); this.refresh(); });
            state.observer.observe(lane, { childList: true });
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
            button.dataset.active = String(button.dataset.action === 'lock' ? this.locked : !this.visible);
        });
    }

    private syncDimensions(): void {
        const height = Math.max(48, numberValue(this.getAttribute('height'), 82));
        this.style.minHeight = `${height}px`;
        this.style.setProperty('--VideoTrack-Pps', `${this.pixelsPerSecond}px`);
        const lane = this.querySelector<HTMLElement>('.VideoTrack-Lane');
        if(lane) lane.style.minHeight = `${height}px`;
        this.syncChildren();
    }

    private syncChildren(): void {
        this.parts.forEach(part => {
            part.setAttribute('theme', this.theme);
            this.applyTimingToPart(part);
            EnsureVideoPartVisual(part as unknown as HTMLElement);
        });
    }

    private applyTimingToPart(part: HTMLElement): void {
        part.setAttribute('pixels-per-second', String(this.pixelsPerSecond));
        const editor = this.closest('arianna-video-track-editor');
        const snap = editor?.getAttribute('snap') ?? this.getAttribute('snap');
        const framerate = editor?.getAttribute('framerate') ?? this.getAttribute('framerate');
        if(snap != null) part.setAttribute('snap', snap);
        if(framerate != null) part.setAttribute('framerate', framerate);
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

/* Direct construction follows the same synchronous AriannA path as Real. */
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
