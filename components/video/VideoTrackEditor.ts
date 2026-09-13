/**
 * @module components/video/VideoTrackEditor
 * @version 2.0.0
 * @description AriannA nonlinear video editor with DaVinci-style tracks, clip drag/trim, transport and preview.
 */
import { Component, Css, Templates, Real } from '../../core/index.ts';
import './VideoPart.ts';
import './VideoTrack.ts';
import type { VideoPart, VideoPartSnapshot } from './VideoPart.ts';
import type { VideoTrack } from './VideoTrack.ts';

export interface VideoClip {
    id: string;
    track: number;
    start: number;
    duration: number;
    source: string;
    name: string;
    sourceIn?: number;
    color?: string;
    opacity?: number;
    speed?: number;
    volume?: number;
    muted?: boolean;
    locked?: boolean;
}

export interface VideoTrackEditorOptions {
    theme?: 'dark' | 'light';
    duration?: number;
    tracks?: number;
    pixelsPerSecond?: number;
    snap?: number;
    snapMs?: number;
    framerate?: number;
    title?: string;
    source?: string;
}

export interface VideoProjectSnapshot {
    duration: number;
    tracks: number;
    pixelsPerSecond: number;
    framerate: number;
    playhead: number;
    clips: VideoClip[];
}

const html = Templates.Template.Html;
const HeaderWidth = 154;

type RuntimeState = {
    bound: boolean;
    playing: boolean;
    raf: number;
    playStartedAt: number;
    playStartedFrom: number;
    playhead: number;
    selectedId: string | null;
    clips: VideoClip[];
    viewer?: HTMLVideoElement;
    viewerClipId?: string;
    timeline?: HTMLElement;
    content?: HTMLElement;
    playheadNode?: HTMLElement;
    timeNode?: HTMLElement;
    range?: HTMLInputElement;
    playButton?: HTMLButtonElement;
    draggingPlayhead: boolean;
};

const Runtime = new WeakMap<HTMLElement, RuntimeState>();

function stateFor(element: HTMLElement): RuntimeState {
    let state = Runtime.get(element);
    if(!state) {
        state = { bound: false, playing: false, raf: 0, playStartedAt: 0, playStartedFrom: 0, playhead: 0, selectedId: null, clips: [], draggingPlayhead: false };
        Runtime.set(element, state);
    }
    return state;
}

function numberValue(value: unknown, fallback = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, value)); }

function applyOptions(element: HTMLElement, options: VideoTrackEditorOptions = {}): void {
    if(options.theme) element.setAttribute('theme', options.theme);
    if(options.duration != null) element.setAttribute('duration', String(options.duration));
    if(options.tracks != null) element.setAttribute('tracks', String(options.tracks));
    if(options.pixelsPerSecond != null) element.setAttribute('pixels-per-second', String(options.pixelsPerSecond));
    if(options.snap != null) element.setAttribute('snap', String(options.snap));
    if(options.snapMs != null) element.setAttribute('snap-ms', String(options.snapMs));
    if(options.framerate != null) element.setAttribute('framerate', String(options.framerate));
    if(options.title) element.setAttribute('title', options.title);
    if(options.source) element.setAttribute('source', options.source);
}

export const VideoTrackEditorStyles = new Css.Stylesheet([
    new Css.Rule('arianna-video-track-editor,.VideoTrackEditor', {
        '--VTE-Accent': '#e40c88', '--VTE-Blue': '#4d9de0', Background: '#111419', Border: '1px solid #262b31', BorderRadius: '7px', BoxSizing: 'border-box', Color: '#e8edf2', Display: 'block', FontFamily: 'var(--arianna-font,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif)', MinWidth: '0', Overflow: 'hidden', Width: '100%'
    }),
    new Css.Rule('.VideoTrackEditor-Shell', { Display: 'grid', GridTemplateRows: 'auto auto minmax(220px,1fr)', MinHeight: '520px' }),
    new Css.Rule('.VideoTrackEditor-ViewerBar', { Background: '#090b0e', BorderBottom: '1px solid #252a30', Display: 'grid', Gap: '8px', GridTemplateColumns: 'minmax(260px,1fr) minmax(220px,.46fr)', Padding: '8px' }),
    new Css.Rule('.VideoTrackEditor-Viewer', { AspectRatio: '16 / 9', Background: '#000', Border: '1px solid #242a30', BorderRadius: '4px', MinHeight: '180px', Overflow: 'hidden', Position: 'relative' }),
    new Css.Rule('.VideoTrackEditor-Viewer video', { Background: '#000', Height: '100%', ObjectFit: 'contain', Width: '100%' }),
    new Css.Rule('.VideoTrackEditor-ViewerBadge', { Background: 'rgba(0,0,0,.58)', BorderRadius: '3px', Bottom: '8px', Color: '#d9dfe5', Font: '700 9px/1 var(--arianna-font,system-ui,sans-serif)', Left: '8px', Padding: '5px 7px', Position: 'absolute' }),
    new Css.Rule('.VideoTrackEditor-Inspector', { Background: '#171b20', Border: '1px solid #282e35', BorderRadius: '4px', Display: 'grid', Gap: '7px', GridTemplateRows: 'auto 1fr', MinWidth: '0', Padding: '9px' }),
    new Css.Rule('.VideoTrackEditor-InspectorTitle', { Color: '#8d98a3', Font: '800 9px/1 var(--arianna-font,system-ui,sans-serif)', LetterSpacing: '.08em', TextTransform: 'uppercase' }),
    new Css.Rule('.VideoTrackEditor-InspectorBody', { Color: '#c8d0d8', Font: '10px/1.45 var(--arianna-font,system-ui,sans-serif)', WhiteSpace: 'pre-line' }),
    new Css.Rule('.VideoTrackEditor-Transport', { AlignItems: 'center', Background: 'linear-gradient(180deg,#30353b,#22272c)', BorderBottom: '1px solid #101316', Display: 'flex', Gap: '4px', MinWidth: '0', Padding: '6px 7px' }),
    new Css.Rule('.VideoTrackEditor-Tool', { Appearance: 'none', Background: 'linear-gradient(180deg,#474d53,#30353a)', Border: '1px solid #15181b', BorderRadius: '3px', Color: '#d7dde3', Cursor: 'pointer', Font: '750 10px/1 var(--arianna-font,system-ui,sans-serif)', Height: '26px', MinWidth: '28px', Padding: '0 7px' }),
    new Css.Rule('.VideoTrackEditor-Tool:hover', { Background: 'linear-gradient(180deg,#555c63,#383e44)' }),
    new Css.Rule('.VideoTrackEditor-Tool[data-active="true"]', { Background: 'var(--VTE-Accent)', BorderColor: '#85064d', Color: '#fff' }),
    new Css.Rule('.VideoTrackEditor-Tool[data-action="prev-edit"],.VideoTrackEditor-Tool[data-action="next-edit"]', { FontSize: '17px', FontWeight: '900', LineHeight: '1', Padding: '0 5px' }),
    new Css.Rule('.VideoTrackEditor-Tool[data-action="prev-frame"],.VideoTrackEditor-Tool[data-action="next-frame"]', { FontSize: '15px', FontWeight: '900', LineHeight: '1', Padding: '0 5px' }),
    new Css.Rule('arianna-video-track-editor:not([theme="light"]) .VideoTrackEditor-Tool[data-action="prev-edit"],arianna-video-track-editor:not([theme="light"]) .VideoTrackEditor-Tool[data-action="next-edit"],arianna-video-track-editor:not([theme="light"]) .VideoTrackEditor-Tool[data-action="prev-frame"],arianna-video-track-editor:not([theme="light"]) .VideoTrackEditor-Tool[data-action="next-frame"],.VideoTrackEditor:not([theme="light"]) .VideoTrackEditor-Tool[data-action="prev-edit"],.VideoTrackEditor:not([theme="light"]) .VideoTrackEditor-Tool[data-action="next-edit"],.VideoTrackEditor:not([theme="light"]) .VideoTrackEditor-Tool[data-action="prev-frame"],.VideoTrackEditor:not([theme="light"]) .VideoTrackEditor-Tool[data-action="next-frame"]', { Color: '#fff' }),
    new Css.Rule('.VideoTrackEditor-Separator', { Background: '#15181b', Height: '20px', Margin: '0 3px', Width: '1px' }),
    new Css.Rule('.VideoTrackEditor-Time', { Color: '#dce2e8', Font: '10px/1 ui-monospace,SFMono-Regular,Menlo,monospace', MinWidth: '96px', Padding: '0 5px', TextAlign: 'center' }),
    new Css.Rule('.VideoTrackEditor-Range', { AccentColor: 'var(--VTE-Accent)', Cursor: 'pointer', Flex: '1', Margin: '0 6px', MinWidth: '90px' }),
    new Css.Rule('.VideoTrackEditor-Timeline', { Background: '#161a1f', Overflow: 'auto', Position: 'relative' }),
    new Css.Rule('.VideoTrackEditor-Content', { MinHeight: '100%', Position: 'relative' }),
    new Css.Rule('.VideoTrackEditor-Ruler', { Background: '#252a30', BorderBottom: '1px solid #111418', Display: 'grid', GridTemplateColumns: `${HeaderWidth}px minmax(0,1fr)`, Height: '26px', Position: 'sticky', Top: '0', ZIndex: '12' }),
    new Css.Rule('.VideoTrackEditor-RulerGutter', { Background: '#292f35', BorderRight: '1px solid #111418' }),
    new Css.Rule('.VideoTrackEditor-RulerLane', { Cursor: 'ew-resize', Position: 'relative' }),
    new Css.Rule('.VideoTrackEditor-RulerTick', { BorderLeft: '1px solid rgba(180,190,200,.25)', Bottom: '0', Color: '#87919b', Font: '8px/1 ui-monospace,SFMono-Regular,Menlo,monospace', PaddingLeft: '3px', Position: 'absolute', Top: '0' }),
    new Css.Rule('.VideoTrackEditor-Tracks', { Position: 'relative' }),
    new Css.Rule('.VideoTrackEditor-Playhead', { Background: '#ff2c3e', Bottom: '0', Cursor: 'ew-resize', Position: 'absolute', Top: '0', Width: '2px', ZIndex: '30' }),
    new Css.Rule('.VideoTrackEditor-Playhead::before', { Background: '#ff2c3e', BorderRadius: '1px 1px 2px 2px', Content: '""', Height: '9px', Left: '-4px', Position: 'absolute', Top: '0', Width: '10px' }),
    new Css.Rule('arianna-video-track-editor[theme="light"],.VideoTrackEditor[theme="light"]', { Background: '#eef1f4', BorderColor: '#bcc3ca', Color: '#20272e' }),
    new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-ViewerBar', { Background: '#e4e8ec', BorderBottomColor: '#c4cad0' }),
    new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-Inspector', { Background: '#f8fafb', BorderColor: '#c9cfd5' }),
    new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-InspectorBody', { Color: '#424d57' }),
    new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-Transport', { Background: 'linear-gradient(180deg,#fff,#e2e6e9)', BorderBottomColor: '#bcc2c8' }),
    new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-Tool', { Background: 'linear-gradient(180deg,#fff,#e3e7ea)', BorderColor: '#b9c0c6', Color: '#414b54' }),
    new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-Time', { Color: '#37414a' }),
    new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-Timeline', { Background: '#f0f2f4' }),
    new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-Ruler', { Background: '#e1e5e8', BorderBottomColor: '#bcc2c8' }),
    new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-RulerGutter', { Background: '#e6e9ec', BorderRightColor: '#bcc2c8' }),
    new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-RulerTick', { BorderLeftColor: 'rgba(70,80,90,.20)', Color: '#66717b' })
]);

@Component('arianna-video-track-editor', VideoTrackEditorStyles, {
    Shadow: false,
    Attributes: ['theme','duration','time','tracks','pixels-per-second','snap','snap-ms','framerate','title','source','magnetic-snap']
})
class VideoTrackEditorElement extends HTMLElement {
    public static readonly Styles = VideoTrackEditorStyles;
    public template = html``;

    constructor(options: VideoTrackEditorOptions = {}) {
        super();
        applyOptions(this, options);
    }

    public onCreated(): void { if(this.isConnected) this.onConnected(); }

    public onConnected(): void {
        this.classList.add('VideoTrackEditor');
        if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
        if(!this.hasAttribute('duration')) this.setAttribute('duration', '12');
        if(!this.hasAttribute('tracks')) this.setAttribute('tracks', '3');
        if(!this.hasAttribute('pixels-per-second')) this.setAttribute('pixels-per-second', '54');
        if(!this.hasAttribute('framerate')) this.setAttribute('framerate', '25');
        if(!this.hasAttribute('snap')) this.setAttribute('snap', String(1 / this.framerate));
        this.render();
        this.bind();
        this.renderTimeline();
        this.syncPlayhead(false);
    }

    public onAttributeChanged(name: string): void {
        if(!this.isConnected) return;
        if(['duration','tracks','pixels-per-second','framerate','theme'].includes(name)) this.renderTimeline();
        if(name === 'time') this.playhead = numberValue(this.getAttribute('time'), this.playhead);
        this.syncPlayhead(false);
    }

    public onUnmount(): void { this.pause(); }

    public get theme(): 'dark' | 'light' { return this.getAttribute('theme') === 'light' ? 'light' : 'dark'; }
    public set theme(value: 'dark' | 'light') { this.setAttribute('theme', value === 'light' ? 'light' : 'dark'); }
    public get duration(): number { return Math.max(.1, numberValue(this.getAttribute('duration'), 12)); }
    public set duration(value: number) { this.setAttribute('duration', String(Math.max(.1, numberValue(value, 12)))); }
    public get trackCount(): number { return Math.max(1, Math.floor(numberValue(this.getAttribute('tracks'), 3))); }
    public set trackCount(value: number) { this.setAttribute('tracks', String(Math.max(1, Math.floor(numberValue(value, 3))))); }
    public get pixelsPerSecond(): number { return Math.max(10, numberValue(this.getAttribute('pixels-per-second'), 54)); }
    public set pixelsPerSecond(value: number) { this.setAttribute('pixels-per-second', String(Math.max(10, numberValue(value, 54)))); }
    public get framerate(): number { return Math.max(1, numberValue(this.getAttribute('framerate'), 25)); }
    public set framerate(value: number) { this.setAttribute('framerate', String(Math.max(1, numberValue(value, 25)))); }
    public get snap(): number { const explicit = numberValue(this.getAttribute('snap'), 0); const ms = numberValue(this.getAttribute('snap-ms'), 0); return explicit > 0 ? explicit : ms > 0 ? ms / 1000 : 1 / this.framerate; }
    public set snap(value: number) { const next = Math.max(1 / this.framerate, numberValue(value, 1 / this.framerate)); this.setAttribute('snap', String(next)); }
    public get playhead(): number { return stateFor(this).playhead; }
    public set playhead(value: number) { this.seek(value); }
    public get playing(): boolean { return stateFor(this).playing; }
    public get tracks(): VideoTrack[] { return Array.from(this.querySelectorAll<VideoTrack>('.VideoTrackEditor-Tracks > arianna-video-track')); }
    public set tracks(value: number | VideoTrack[]) { this.trackCount = Array.isArray(value) ? Math.max(1, value.length) : value; }
    public get clips(): VideoPart[] { return Array.from(this.querySelectorAll<VideoPart>('.VideoTrackEditor-Tracks arianna-video-part')); }

    public setOptions(options: VideoTrackEditorOptions): this { applyOptions(this, options); return this; }

    public setClips(clips: VideoClip[]): this {
        const state = stateFor(this);
        state.clips = (Array.isArray(clips) ? clips : []).map((clip, index) => this.normaliseClip(clip, index));
        const maxEnd = state.clips.reduce((max, clip) => Math.max(max, clip.start + clip.duration), 0);
        if(maxEnd > this.duration) this.duration = Math.ceil(maxEnd + 1);
        if(this.isConnected) this.renderTimeline();
        return this;
    }

    public getClips(): VideoClip[] { return stateFor(this).clips.map(clip => ({ ...clip })); }

    public addClip(clip: Partial<VideoClip>, track = clip.track ?? 0): VideoClip {
        const state = stateFor(this);
        const next = this.normaliseClip({ ...clip, track } as VideoClip, state.clips.length);
        state.clips.push(next);
        if(next.start + next.duration > this.duration) this.duration = Math.ceil(next.start + next.duration + 1);
        this.renderTimeline();
        this.emitChange('add', next);
        return { ...next };
    }

    public removeClip(id: string): this {
        const state = stateFor(this);
        state.clips = state.clips.filter(clip => clip.id !== id);
        if(state.selectedId === id) state.selectedId = null;
        this.renderTimeline();
        this.emitChange('remove', { id });
        return this;
    }

    public seek(time: number): this {
        const state = stateFor(this);
        state.playhead = clamp(numberValue(time, 0), 0, this.duration);
        if(this.getAttribute('time') !== String(state.playhead)) this.setAttribute('time', String(state.playhead));
        this.syncPlayhead(true);
        this.syncPreview(false);
        this.dispatchEvent(new CustomEvent('arianna:editor-time', { bubbles: true, composed: true, detail: { time: state.playhead, source: this } }));
        return this;
    }

    public getTime(): number { return this.playhead; }

    public play(): this {
        const state = stateFor(this);
        if(state.playing) return this;
        if(state.playhead >= this.duration - .001) state.playhead = 0;
        state.playing = true;
        state.playStartedAt = performance.now();
        state.playStartedFrom = state.playhead;
        if(state.playButton) { state.playButton.textContent = '❚❚'; state.playButton.dataset.active = 'true'; }
        this.syncPreview(true);
        const tick = (): void => {
            if(!state.playing) return;
            const next = state.playStartedFrom + (performance.now() - state.playStartedAt) / 1000;
            if(next >= this.duration) { this.seek(this.duration); this.pause(); return; }
            state.playhead = next;
            this.syncPlayhead(false);
            this.syncPreview(true);
            state.raf = requestAnimationFrame(tick);
        };
        state.raf = requestAnimationFrame(tick);
        this.emit('arianna:video-play', { time: state.playhead });
        return this;
    }

    public pause(): this {
        const state = stateFor(this);
        state.playing = false;
        if(state.raf) cancelAnimationFrame(state.raf);
        state.raf = 0;
        state.viewer?.pause();
        if(state.playButton) { state.playButton.textContent = '▶'; state.playButton.dataset.active = 'false'; }
        this.emit('arianna:video-pause', { time: state.playhead });
        return this;
    }

    public toggle(): this { return this.playing ? this.pause() : this.play(); }
    public stop(): this { this.pause(); return this.seek(0); }
    public previousFrame(): this { return this.seek(this.playhead - 1 / this.framerate); }
    public nextFrame(): this { return this.seek(this.playhead + 1 / this.framerate); }
    public previousEdit(): this { const edits = this.editPoints().filter(value => value < this.playhead - .001); return this.seek(edits.length ? edits[edits.length - 1]! : 0); }
    public nextEdit(): this { const next = this.editPoints().find(value => value > this.playhead + .001); return this.seek(next ?? this.duration); }

    public splitSelected(at?: number): VideoPart | null {
        const state = stateFor(this);
        const selected = state.selectedId ? this.querySelector<VideoPart>(`arianna-video-part[id="${CSS.escape(state.selectedId)}"]`) : null;
        if(!selected || typeof selected.split !== 'function') return null;
        const right = selected.split(at ?? this.playhead);
        this.syncModelFromDOM();
        return right;
    }

    public export(): VideoProjectSnapshot {
        return { duration: this.duration, tracks: this.trackCount, pixelsPerSecond: this.pixelsPerSecond, framerate: this.framerate, playhead: this.playhead, clips: this.getClips() };
    }

    private render(): void {
        if(this.querySelector(':scope > .VideoTrackEditor-Shell')) return;
        const state = stateFor(this);
        const shell = document.createElement('div'); shell.className = 'VideoTrackEditor-Shell';

        const viewerBar = document.createElement('div'); viewerBar.className = 'VideoTrackEditor-ViewerBar';
        const viewer = document.createElement('div'); viewer.className = 'VideoTrackEditor-Viewer';
        const video = document.createElement('video'); video.preload = 'auto'; video.playsInline = true; video.muted = true;
        const badge = document.createElement('span'); badge.className = 'VideoTrackEditor-ViewerBadge'; badge.textContent = 'PROGRAM';
        viewer.append(video, badge); state.viewer = video;
        const inspector = document.createElement('div'); inspector.className = 'VideoTrackEditor-Inspector';
        const inspectorTitle = document.createElement('div'); inspectorTitle.className = 'VideoTrackEditor-InspectorTitle'; inspectorTitle.textContent = this.getAttribute('title') || 'Inspector';
        const inspectorBody = document.createElement('div'); inspectorBody.className = 'VideoTrackEditor-InspectorBody'; inspectorBody.dataset.role = 'inspector'; inspectorBody.textContent = 'No clip selected';
        inspector.append(inspectorTitle, inspectorBody); viewerBar.append(viewer, inspector);

        const transport = document.createElement('div'); transport.className = 'VideoTrackEditor-Transport';
        transport.append(
            this.tool('«', 'prev-edit', 'Previous edit'),
            this.tool('‹', 'prev-frame', 'Previous frame')
        );
        const play = this.tool('▶', 'play', 'Play / Pause'); state.playButton = play; transport.appendChild(play);
        transport.append(
            this.tool('■', 'stop', 'Stop'),
            this.tool('›', 'next-frame', 'Next frame'),
            this.tool('»', 'next-edit', 'Next edit'),
            this.separator(),
            this.tool('✂', 'split', 'Split selected clip at playhead'),
            this.tool('⌫', 'delete', 'Delete selected clip'),
            this.separator()
        );
        const time = document.createElement('span'); time.className = 'VideoTrackEditor-Time'; state.timeNode = time;
        const range = document.createElement('input'); range.className = 'VideoTrackEditor-Range'; range.type = 'range'; range.min = '0'; range.step = String(1 / this.framerate); range.dataset.role = 'transport'; state.range = range;
        transport.append(time, range);

        const timeline = document.createElement('div'); timeline.className = 'VideoTrackEditor-Timeline'; state.timeline = timeline;
        const content = document.createElement('div'); content.className = 'VideoTrackEditor-Content'; state.content = content;
        timeline.appendChild(content);
        shell.append(viewerBar, transport, timeline);
        this.replaceChildren(shell);
    }

    private renderTimeline(): void {
        const state = stateFor(this);
        const content = state.content;
        if(!content) return;
        const width = HeaderWidth + this.duration * this.pixelsPerSecond;
        content.style.width = `${Math.max(720, width)}px`;

        const ruler = document.createElement('div'); ruler.className = 'VideoTrackEditor-Ruler';
        const gutter = document.createElement('div'); gutter.className = 'VideoTrackEditor-RulerGutter';
        const rulerLane = document.createElement('div'); rulerLane.className = 'VideoTrackEditor-RulerLane'; rulerLane.dataset.role = 'ruler';
        rulerLane.style.width = `${this.duration * this.pixelsPerSecond}px`;
        const step = this.duration <= 20 ? 1 : this.duration <= 60 ? 2 : 5;
        for(let second = 0; second <= this.duration + .001; second += step) {
            const tick = document.createElement('span'); tick.className = 'VideoTrackEditor-RulerTick'; tick.style.left = `${second * this.pixelsPerSecond}px`; tick.textContent = this.rulerLabel(second); rulerLane.appendChild(tick);
        }
        ruler.append(gutter, rulerLane);

        const tracks = document.createElement('div'); tracks.className = 'VideoTrackEditor-Tracks';
        for(let index = 0; index < this.trackCount; index++) {
            const track = document.createElement('arianna-video-track') as VideoTrack;
            track.setAttribute('index', String(index));
            track.setAttribute('name', `V${index + 1} · ${index === 0 ? 'Main' : index === 1 ? 'B-Roll' : 'Overlay'}`);
            track.setAttribute('theme', this.getAttribute('theme') === 'light' ? 'light' : 'dark');
            track.setAttribute('pixels-per-second', String(this.pixelsPerSecond));
            track.setAttribute('snap', String(this.snap));
            track.setAttribute('framerate', String(this.framerate));
            track.style.width = `${width}px`;
            const clips = state.clips.filter(clip => clip.track === index);
            clips.forEach(clip => {
                const part = document.createElement('arianna-video-part') as VideoPart;
                part.id = clip.id;
                part.setAttribute('start', String(clip.start));
                part.setAttribute('length', String(clip.duration));
                part.setAttribute('source-start', String(clip.sourceIn ?? 0));
                part.setAttribute('src', clip.source);
                part.setAttribute('label', clip.name);
                part.setAttribute('color', clip.color || this.clipColor(index));
                part.setAttribute('theme', this.getAttribute('theme') === 'light' ? 'light' : 'dark');
                part.setAttribute('pixels-per-second', String(this.pixelsPerSecond));
                part.setAttribute('framerate', String(this.framerate));
                part.setAttribute('snap', String(this.snap));
                if(clip.opacity != null) part.setAttribute('opacity', String(clip.opacity));
                if(clip.speed != null) part.setAttribute('speed', String(clip.speed));
                if(clip.volume != null) part.setAttribute('volume', String(clip.volume));
                if(clip.muted) part.setAttribute('muted', '');
                if(clip.locked) part.setAttribute('locked', '');
                if(state.selectedId === clip.id) part.setAttribute('selected', '');
                track.appendChild(part);
            });
            tracks.appendChild(track);
        }

        const playhead = document.createElement('div'); playhead.className = 'VideoTrackEditor-Playhead'; playhead.dataset.role = 'playhead'; state.playheadNode = playhead;
        content.replaceChildren(ruler, tracks, playhead);
        this.syncPlayhead(false);
        this.syncInspector();
        this.syncPreview(false);
    }

    private bind(): void {
        const state = stateFor(this);
        if(state.bound) return;
        state.bound = true;

        this.addEventListener('click', event => {
            const action = (event.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
            if(!action) return;
            const type = action.dataset.action;
            if(type === 'play') this.toggle();
            if(type === 'stop') this.stop();
            if(type === 'prev-frame') this.previousFrame();
            if(type === 'next-frame') this.nextFrame();
            if(type === 'prev-edit') this.previousEdit();
            if(type === 'next-edit') this.nextEdit();
            if(type === 'split') this.splitSelected();
            if(type === 'delete' && state.selectedId) this.removeClip(state.selectedId);
        });

        this.addEventListener('input', event => {
            const input = event.target as HTMLInputElement;
            if(input.dataset.role === 'transport') this.seek(Number(input.value));
        });

        this.addEventListener('arianna:video-part-select', event => {
            const part = (event as CustomEvent).detail?.part as VideoPart | undefined;
            state.selectedId = part?.id || null;
            this.syncInspector();
        });
        this.addEventListener('arianna:video-part-commit', () => this.syncModelFromDOM());
        this.addEventListener('arianna:video-part-change', () => this.syncModelFromDOM(false));
        this.addEventListener('arianna:video-part-delete', event => {
            const part = (event as CustomEvent).detail?.part as VideoPart | undefined;
            if(part?.id) this.removeClip(part.id);
        });
        this.addEventListener('arianna:video-part-split', () => this.syncModelFromDOM());

        this.addEventListener('pointerdown', (event: PointerEvent) => {
            const target = event.target as HTMLElement;
            if(!target.closest('.VideoTrackEditor-RulerLane,.VideoTrackEditor-Playhead,.VideoTrack-Lane')) return;
            if(target.closest('arianna-video-part')) return;
            state.draggingPlayhead = true;
            this.seekFromPointer(event.clientX);
            event.preventDefault();
            const move = (moveEvent: PointerEvent): void => { if(state.draggingPlayhead) this.seekFromPointer(moveEvent.clientX); };
            const finish = (): void => { state.draggingPlayhead = false; window.removeEventListener('pointermove', move, true); window.removeEventListener('pointerup', finish, true); window.removeEventListener('pointercancel', finish, true); };
            window.addEventListener('pointermove', move, true);
            window.addEventListener('pointerup', finish, true);
            window.addEventListener('pointercancel', finish, true);
        });

        this.addEventListener('keydown', event => {
            if(event.code === 'Space') { event.preventDefault(); this.toggle(); }
            if(event.key === 'ArrowLeft') { event.preventDefault(); event.shiftKey ? this.previousEdit() : this.previousFrame(); }
            if(event.key === 'ArrowRight') { event.preventDefault(); event.shiftKey ? this.nextEdit() : this.nextFrame(); }
        });
        if(!this.hasAttribute('tabindex')) this.tabIndex = 0;
    }

    private syncModelFromDOM(emit = true): void {
        const state = stateFor(this);
        const clips: VideoClip[] = [];
        this.tracks.forEach((track, trackIndex) => {
            const parts = Array.from(track.querySelectorAll<VideoPart>('.VideoTrack-Lane > arianna-video-part, :scope > arianna-video-part'));
            parts.forEach((part, index) => {
                const snapshot = typeof part.snapshot === 'function' ? part.snapshot() : this.partSnapshotFallback(part);
                clips.push({
                    id: snapshot.id || `clip-${trackIndex}-${index}`,
                    track: trackIndex,
                    start: snapshot.start,
                    duration: snapshot.length,
                    source: snapshot.src,
                    name: snapshot.label,
                    sourceIn: snapshot.sourceStart,
                    color: snapshot.color,
                    opacity: snapshot.opacity,
                    speed: snapshot.speed,
                    volume: snapshot.volume,
                    muted: snapshot.muted,
                    locked: snapshot.locked
                });
            });
        });
        state.clips = clips;
        this.syncInspector();
        if(emit) this.emitChange('edit', null);
    }

    private syncPlayhead(updatePreview: boolean): void {
        const state = stateFor(this);
        if(state.playheadNode) state.playheadNode.style.left = `${HeaderWidth + state.playhead * this.pixelsPerSecond}px`;
        if(state.timeNode) state.timeNode.textContent = this.formatTimecode(state.playhead);
        if(state.range) { state.range.max = String(this.duration); state.range.step = String(1 / this.framerate); state.range.value = String(state.playhead); }
        if(updatePreview) this.syncPreview(false);
    }

    private seekFromPointer(clientX: number): void {
        const state = stateFor(this);
        const timeline = state.timeline;
        if(!timeline) return;
        const rect = timeline.getBoundingClientRect();
        const x = clientX - rect.left + timeline.scrollLeft - HeaderWidth;
        const raw = Math.max(0, x / this.pixelsPerSecond);
        const snapped = this.getAttribute('magnetic-snap') === 'false' ? raw : Math.round(raw / this.snap) * this.snap;
        this.seek(snapped);
    }

    private syncPreview(playing: boolean): void {
        const state = stateFor(this);
        const video = state.viewer;
        if(!video) return;
        const active = state.clips
            .filter(clip => state.playhead >= clip.start && state.playhead < clip.start + clip.duration)
            .sort((a, b) => b.track - a.track)[0];
        if(!active) {
            if(!video.paused) video.pause();
            if(state.viewerClipId !== undefined || video.hasAttribute('src')) {
                state.viewerClipId = undefined;
                video.removeAttribute('src');
                video.load();
            }
            return;
        }
        const localTime = Math.max(0, (active.sourceIn ?? 0) + (state.playhead - active.start) * (active.speed ?? 1));
        if(state.viewerClipId !== active.id || video.getAttribute('src') !== active.source) {
            state.viewerClipId = active.id;
            video.src = active.source;
            video.load();
            const setTime = (): void => { try { video.currentTime = localTime; } catch {} if(playing) void video.play().catch(() => {}); };
            if(video.readyState >= 1) setTime(); else video.addEventListener('loadedmetadata', setTime, { once: true });
        } else {
            if(Math.abs(video.currentTime - localTime) > .18) { try { video.currentTime = localTime; } catch {} }
            if(playing && video.paused) void video.play().catch(() => {});
            if(!playing && !video.paused) video.pause();
        }
        video.muted = active.muted ?? true;
        video.volume = clamp(active.volume ?? 1, 0, 1);
        video.playbackRate = clamp(active.speed ?? 1, .25, 4);
    }

    private syncInspector(): void {
        const state = stateFor(this);
        const node = this.querySelector<HTMLElement>('[data-role="inspector"]');
        if(!node) return;
        const clip = state.clips.find(candidate => candidate.id === state.selectedId);
        if(!clip) { node.textContent = `Playhead  ${this.formatTimecode(state.playhead)}\n${state.clips.length} clips · ${this.trackCount} video tracks`; return; }
        node.textContent = `${clip.name}\nV${clip.track + 1} · ${this.formatTimecode(clip.start)} → ${this.formatTimecode(clip.start + clip.duration)}\nSource In ${this.formatTimecode(clip.sourceIn ?? 0)} · ${clip.duration.toFixed(2)} s`;
    }

    private editPoints(): number[] {
        const points = new Set<number>([0, this.duration]);
        stateFor(this).clips.forEach(clip => { points.add(clamp(clip.start, 0, this.duration)); points.add(clamp(clip.start + clip.duration, 0, this.duration)); });
        return Array.from(points).sort((a, b) => a - b);
    }

    private normaliseClip(clip: VideoClip, index: number): VideoClip {
        const duration = Math.max(1 / this.framerate, numberValue(clip.duration, 1));
        const track = clamp(Math.floor(numberValue(clip.track, 0)), 0, Math.max(0, this.trackCount - 1));
        return {
            id: clip.id || `clip-${Date.now().toString(36)}-${index}`,
            track,
            start: Math.max(0, numberValue(clip.start, 0)),
            duration,
            source: clip.source || this.getAttribute('source') || '',
            name: clip.name || `Clip ${index + 1}`,
            sourceIn: Math.max(0, numberValue(clip.sourceIn, 0)),
            color: clip.color || this.clipColor(track),
            opacity: clamp(numberValue(clip.opacity, 1), 0, 1),
            speed: Math.max(.05, numberValue(clip.speed, 1)),
            volume: clamp(numberValue(clip.volume, 1), 0, 1),
            muted: !!clip.muted,
            locked: !!clip.locked
        };
    }

    private partSnapshotFallback(part: HTMLElement): VideoPartSnapshot {
        const start = Math.max(0, numberValue(part.getAttribute('start'), 0));
        const length = Math.max(1 / this.framerate, numberValue(part.getAttribute('length'), 1));
        const sourceStart = Math.max(0, numberValue(part.getAttribute('source-start'), 0));
        const src = part.getAttribute('src') || '';
        const label = part.getAttribute('label') || 'Video';
        return { id: part.id, start, length, duration: length, sourceStart, sourceIn: sourceStart, src, source: src, label, name: label, color: part.getAttribute('color') || '#4d9de0', theme: this.getAttribute('theme') === 'light' ? 'light' : 'dark', speed: numberValue(part.getAttribute('speed'), 1), opacity: clamp(numberValue(part.getAttribute('opacity'), 1), 0, 1), volume: clamp(numberValue(part.getAttribute('volume'), 1), 0, 1), muted: part.hasAttribute('muted'), locked: part.hasAttribute('locked') };
    }

    private tool(text: string, action: string, title: string): HTMLButtonElement {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'VideoTrackEditor-Tool'; button.dataset.action = action; button.title = title; button.textContent = text; return button;
    }
    private separator(): HTMLElement { const separator = document.createElement('span'); separator.className = 'VideoTrackEditor-Separator'; return separator; }
    private clipColor(track: number): string { return ['#4d9de0','#e40c88','#7bc96f','#e1a33f','#9d6ed1'][track % 5]!; }
    private rulerLabel(seconds: number): string { const minutes = Math.floor(seconds / 60); const rest = Math.floor(seconds % 60); return `${String(minutes).padStart(2,'0')}:${String(rest).padStart(2,'0')}`; }
    private formatTimecode(seconds: number): string { const fps = Math.max(1, Math.round(this.framerate)); const totalFrames = Math.max(0, Math.round(seconds * fps)); const frames = totalFrames % fps; const totalSeconds = Math.floor(totalFrames / fps); const secs = totalSeconds % 60; const minutes = Math.floor(totalSeconds / 60) % 60; const hours = Math.floor(totalSeconds / 3600); return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}:${String(frames).padStart(2,'0')}`; }

    private emitChange(kind: string, subject: unknown): void {
        this.dispatchEvent(new CustomEvent('arianna:editor-change', { bubbles: true, composed: true, detail: { kind, subject, clips: this.getClips(), project: this.export(), source: this } }));
    }
    private emit(type: string, detail: Record<string, unknown> = {}): void { this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: { ...detail, editor: this, source: this } })); }
}

export namespace VideoTrackEditorNamespace {
    export type Options = VideoTrackEditorOptions;
    export type Clip = VideoClip;
    export type Project = VideoProjectSnapshot;
}

/** Public instance type of the upgraded AriannA element. */
export type VideoTrackEditor = VideoTrackEditorElement;

type VideoTrackEditorConstructor = {
    new(options?: VideoTrackEditorOptions): VideoTrackEditorElement;
    readonly prototype: VideoTrackEditorElement;
    readonly Styles: Css.Stylesheet;
};

/*
 * Direct construction must not fall through to the browser's native
 * `HTMLElement` constructor. AriannA creates/upgrades the element through
 * `Real`, then this public constructor returns that live component surface.
 */
export const VideoTrackEditor = new Proxy(
    VideoTrackEditorElement as unknown as VideoTrackEditorConstructor,
    {
        construct(_target, args): VideoTrackEditorElement {
            const element = new Real('arianna-video-track-editor').render() as VideoTrackEditorElement;
            applyOptions(element, (args[0] ?? {}) as VideoTrackEditorOptions);
            return element;
        }
    }
) as VideoTrackEditorConstructor;

/*
 * Playground Real/Component paths keep the Real facet in the local variable.
 * Bridge the two component-specific operations used by this editor to the
 * wrapped element without changing Core or the component DOM contract.
 */
const RealPrototype = Real.prototype as unknown as Record<PropertyKey, unknown>;
if(typeof RealPrototype.setClips !== 'function') {
    Object.defineProperty(Real.prototype, 'setClips', {
        configurable: true,
        writable: true,
        value(this: Real, clips: VideoClip[]): Real {
            const element = this.render() as Element & { setClips?: (value: VideoClip[]) => unknown };
            if(typeof element.setClips !== 'function') throw new TypeError('[arianna] setClips() is not available on this Real target.');
            element.setClips(clips);
            return this;
        }
    });
}
if(!Object.getOwnPropertyDescriptor(Real.prototype, 'playhead')) {
    const LocalPlayheads = new WeakMap<object, number>();
    Object.defineProperty(Real.prototype, 'playhead', {
        configurable: true,
        get(this: Real): number {
            const element = this.render() as Element & { playhead?: number };
            return typeof element.playhead === 'number' ? element.playhead : (LocalPlayheads.get(this) ?? 0);
        },
        set(this: Real, value: number): void {
            const element = this.render() as Element & { playhead?: number };
            if('playhead' in element) element.playhead = value;
            else LocalPlayheads.set(this, numberValue(value, 0));
        }
    });
}

export const VideoTrackEditorComponent = VideoTrackEditor;
export const VideoTimelineEditor = VideoTrackEditor;
export default VideoTrackEditor;
