/**
 * @module    components/video/VideoTrackEditor
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description Professional NLE timeline inspired by the interaction model of
 *              modern edit pages: cross-track clip drag, trims, snapping,
 *              blade/split, selection, clipboard, zoom and a draggable playhead.
 */

import { Component, Css, Templates } from '../../core/index.ts';
import { VideoPart } from './VideoPart.ts';
import type { VideoPartOptions } from './VideoPart.ts';
import { VideoTrack } from './VideoTrack.ts';
import type { VideoTrackOptions } from './VideoTrack.ts';

export interface VideoClip
{
    id?: string;
    track?: number;
    start?: number;
    duration?: number;
    length?: number;
    source?: string;
    src?: string;
    sourceStart?: number;
    name?: string;
    label?: string;
    color?: string;
    speed?: number;
    opacity?: number;
    volume?: number;
    muted?: boolean;
    locked?: boolean;
}

export interface VideoTrackEditorOptions
{
    theme?: 'dark' | 'light';
    duration?: number;
    tracks?: number;
    pixelsPerSecond?: number;
    snap?: number;
    playhead?: number;
    framerate?: number;
    title?: string;
    magneticSnap?: boolean;
    trackHeight?: number;
    clips?: VideoClip[];
}

export namespace VideoTrackEditor
{
    export const html = Templates.Template.Html;

    export const Styles = new Css.Stylesheet([
        new Css.Rule('arianna-video-track-editor, .VideoTrackEditor', {
            '--VideoTrackEditor-Pps': '36px', '--VideoTrackEditor-Header': '138px',
            Background: '#14171a', Border: '1px solid #0b0c0e', BorderRadius: '5px',
            BoxShadow: '0 10px 28px rgba(0,0,0,.24)', BoxSizing: 'border-box', Color: '#dfe4e8',
            Display: 'block', FontFamily: 'var(--arianna-font,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif)',
            MinWidth: '0', Overflow: 'hidden', Position: 'relative', Width: '100%'
        }),
        new Css.Rule('.VideoTrackEditor-Shell', { Background: '#15181c', Display: 'grid', GridTemplateRows: '36px 25px minmax(170px,1fr) 23px', MinHeight: '300px', Width: '100%' }),
        new Css.Rule('.VideoTrackEditor-Toolbar', { AlignItems: 'center', Background: 'linear-gradient(180deg,#34383e,#25292e)', BorderBottom: '1px solid #0e1012', Display: 'flex', Gap: '4px', MinWidth: '0', Padding: '4px 6px' }),
        new Css.Rule('.VideoTrackEditor-Brand', { AlignItems: 'center', Display: 'inline-flex', FontSize: '9px', FontWeight: '800', Gap: '6px', LetterSpacing: '.04em', MarginRight: '5px', TextTransform: 'uppercase' }),
        new Css.Rule('.VideoTrackEditor-BrandDot', { Background: '#e40c88', BorderRadius: '50%', BoxShadow: '0 0 0 2px rgba(228,12,136,.18)', Height: '7px', Width: '7px' }),
        new Css.Rule('.VideoTrackEditor-Tool', { Appearance: 'none', Background: 'linear-gradient(180deg,#464b51,#30343a)', Border: '1px solid #17191c', BorderRadius: '3px', Color: '#bdc4cb', Cursor: 'pointer', Font: '700 9px/1 var(--arianna-font,system-ui,sans-serif)', Height: '25px', MinWidth: '27px', Padding: '0 7px' }),
        new Css.Rule('.VideoTrackEditor-Tool:hover', { Background: 'linear-gradient(180deg,#555b62,#3b4046)', Color: '#fff' }),
        new Css.Rule('.VideoTrackEditor-Tool[data-active="true"]', { Background: '#e40c88', BorderColor: '#a30561', Color: '#fff' }),
        new Css.Rule('.VideoTrackEditor-Separator', { Background: '#15171a', Height: '19px', Margin: '0 2px', Width: '1px' }),
        new Css.Rule('.VideoTrackEditor-Fill', { Flex: '1 1 auto', MinWidth: '4px' }),
        new Css.Rule('.VideoTrackEditor-Timecode', { Background: '#111418', Border: '1px solid #0b0d0f', BorderRadius: '3px', Color: '#e5e8eb', Font: '700 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace', Padding: '6px 8px', WhiteSpace: 'nowrap' }),
        new Css.Rule('.VideoTrackEditor-RulerRow', { Background: '#1c2024', BorderBottom: '1px solid #0c0e10', Display: 'grid', GridTemplateColumns: 'var(--VideoTrackEditor-Header) minmax(0,1fr)', MinWidth: '0' }),
        new Css.Rule('.VideoTrackEditor-RulerHead', { AlignItems: 'center', Background: '#262a2f', BorderRight: '1px solid #0f1113', Color: '#737d86', Display: 'flex', FontSize: '8px', Padding: '0 7px' }),
        new Css.Rule('.VideoTrackEditor-RulerViewport', { Overflow: 'hidden', Position: 'relative' }),
        new Css.Rule('.VideoTrackEditor-Ruler', { Height: '100%', MinWidth: '100%', Position: 'relative', Width: 'var(--VideoTrackEditor-TimelineWidth,100%)' }),
        new Css.Rule('.VideoTrackEditor-Tick', { BorderLeft: '1px solid #535a61', Bottom: '0', Color: '#7f8992', Font: '8px/1 ui-monospace,SFMono-Regular,Menlo,monospace', PaddingLeft: '3px', Position: 'absolute', Top: '8px', WhiteSpace: 'nowrap' }),
        new Css.Rule('.VideoTrackEditor-Tick[data-major="false"]', { BorderLeftColor: '#32373c', Top: '16px' }),
        new Css.Rule('.VideoTrackEditor-Body', { Background: '#181b1f', MinHeight: '0', Overflow: 'auto', Position: 'relative' }),
        new Css.Rule('.VideoTrackEditor-Tracks', { MinHeight: '100%', MinWidth: '100%', Position: 'relative', Width: 'max(100%, calc(var(--VideoTrackEditor-Header) + var(--VideoTrackEditor-TimelineWidth,0px)))' }),
        new Css.Rule('.VideoTrackEditor-Playhead', { BorderLeft: '1px solid #ef4a4a', Bottom: '0', Left: 'var(--VideoTrackEditor-Header)', PointerEvents: 'none', Position: 'absolute', Top: '0', Width: '0', ZIndex: '70' }),
        new Css.Rule('.VideoTrackEditor-Playhead::before', { Background: '#ef4a4a', ClipPath: 'polygon(0 0,100% 0,78% 100%,22% 100%)', Content: '""', Height: '9px', Left: '-5px', Position: 'absolute', Top: '0', Width: '10px' }),
        new Css.Rule('.VideoTrackEditor-Status', { AlignItems: 'center', Background: '#21252a', BorderTop: '1px solid #0d0f11', Color: '#7f8993', Display: 'flex', FontSize: '8px', Gap: '12px', Padding: '0 7px' }),
        new Css.Rule('.VideoTrackEditor-Status strong', { Color: '#b9c0c7', FontWeight: '650' }),
        new Css.Rule('.VideoTrackEditor-DropHint', { Background: 'rgba(228,12,136,.09)', Border: '1px dashed rgba(228,12,136,.5)', BorderRadius: '3px', Color: '#e98bc2', Display: 'none', FontSize: '9px', Padding: '8px', PointerEvents: 'none', Position: 'absolute', Right: '8px', Top: '8px', ZIndex: '90' }),
        new Css.Rule('.VideoTrackEditor[data-drag-over="true"] .VideoTrackEditor-DropHint', { Display: 'block' }),

        new Css.Rule('arianna-video-track-editor[theme="light"], .VideoTrackEditor[theme="light"]', { Background: '#eef1f3', BorderColor: '#bdc3c9', BoxShadow: '0 10px 24px rgba(30,38,46,.12)', Color: '#283039' }),
        new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-Shell, .VideoTrackEditor[theme="light"] .VideoTrackEditor-Shell', { Background: '#f6f7f8' }),
        new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-Toolbar, .VideoTrackEditor[theme="light"] .VideoTrackEditor-Toolbar', { Background: 'linear-gradient(180deg,#fff,#e3e6e9)', BorderBottomColor: '#b9c0c6' }),
        new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-Tool, .VideoTrackEditor[theme="light"] .VideoTrackEditor-Tool', { Background: 'linear-gradient(180deg,#fff,#e5e8eb)', BorderColor: '#bbc1c7', Color: '#505a63' }),
        new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-Timecode, .VideoTrackEditor[theme="light"] .VideoTrackEditor-Timecode', { Background: '#f7f8f9', BorderColor: '#c2c8ce', Color: '#2d353d' }),
        new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-RulerRow, .VideoTrackEditor[theme="light"] .VideoTrackEditor-RulerRow', { Background: '#e8ebee', BorderBottomColor: '#c0c6cc' }),
        new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-RulerHead, .VideoTrackEditor[theme="light"] .VideoTrackEditor-RulerHead', { Background: '#f4f5f6', BorderRightColor: '#c0c6cc', Color: '#717b84' }),
        new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-Tick, .VideoTrackEditor[theme="light"] .VideoTrackEditor-Tick', { BorderLeftColor: '#aab1b8', Color: '#65707a' }),
        new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-Body, .VideoTrackEditor[theme="light"] .VideoTrackEditor-Body', { Background: '#eef1f3' }),
        new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-Status, .VideoTrackEditor[theme="light"] .VideoTrackEditor-Status', { Background: '#e4e7ea', BorderTopColor: '#bcc2c8', Color: '#68737d' }),
        new Css.Rule('arianna-video-track-editor[theme="light"] .VideoTrackEditor-Status strong, .VideoTrackEditor[theme="light"] .VideoTrackEditor-Status strong', { Color: '#36404a' })
    ]);

    @Component('arianna-video-track-editor', Styles, {
        Shadow: false,
        Attributes: ['theme','duration','tracks','pixels-per-second','snap','playhead','framerate','title','magnetic-snap','track-height']
    })
    export class VideoTrackEditor extends HTMLElement
    {
        public static readonly Styles = Styles;
        public template = html``;

        private Body?: HTMLElement;
        private TracksHost?: HTMLElement;
        private RulerViewport?: HTMLElement;
        private Ruler?: HTMLElement;
        private PlayheadNode?: HTMLElement;
        private Timecode?: HTMLElement;
        private Bound?: boolean;
        private Clipboard?: VideoPartOptions;
        private ClipboardTrack?: number;
        private Tool: 'select' | 'blade' = 'select';

        constructor(options: VideoTrackEditorOptions = {})
        {
            super();
            if(options.theme) this.setAttribute('theme', options.theme);
            if(options.duration != null) this.setAttribute('duration', String(options.duration));
            if(options.tracks != null) this.setAttribute('tracks', String(options.tracks));
            if(options.pixelsPerSecond != null) this.setAttribute('pixels-per-second', String(options.pixelsPerSecond));
            if(options.snap != null) this.setAttribute('snap', String(options.snap));
            if(options.playhead != null) this.setAttribute('playhead', String(options.playhead));
            if(options.framerate != null) this.setAttribute('framerate', String(options.framerate));
            if(options.title) this.setAttribute('title', options.title);
            if(options.magneticSnap === false) this.setAttribute('magnetic-snap', 'false');
            if(options.trackHeight != null) this.setAttribute('track-height', String(options.trackHeight));
            if(options.clips) queueMicrotask(() => { if(this.isConnected) this.setClips(options.clips!); });
        }

        public onCreated(): void { if(this.isConnected) this.onConnected(); }

        public onConnected(): void
        {
            this.classList.add('VideoTrackEditor');
            if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
            if(!this.hasAttribute('duration')) this.setAttribute('duration', '30');
            if(!this.hasAttribute('tracks')) this.setAttribute('tracks', '3');
            if(!this.hasAttribute('pixels-per-second')) this.setAttribute('pixels-per-second', '36');
            if(!this.hasAttribute('snap')) this.setAttribute('snap', '0.1');
            if(!this.hasAttribute('framerate')) this.setAttribute('framerate', '25');
            if(!this.hasAttribute('playhead')) this.setAttribute('playhead', '0');
            if(!this.hasAttribute('track-height')) this.setAttribute('track-height', '74');
            if(!this.Tool) this.Tool = 'select';
            this.Render();
            this.Bind();
            this.EnsureTracks();
            this.Sync();
        }

        public onAttributeChanged(name: string): void
        {
            if(!this.isConnected) return;
            if(name === 'tracks') this.EnsureTracks();
            this.Sync();
        }

        public get duration(): number { return this.Number(this.getAttribute('duration'), 30, .1); }
        public set duration(value: number) { this.setAttribute('duration', String(Math.max(.1, Number(value) || .1))); }
        public get trackCount(): number { return Math.max(1, Math.floor(this.Number(this.getAttribute('tracks'), 3, 1))); }
        public set trackCount(value: number) { this.setAttribute('tracks', String(Math.max(1, Math.floor(Number(value) || 1)))); }
        public get pixelsPerSecond(): number { return this.Number(this.getAttribute('pixels-per-second'), 36, 2); }
        public set pixelsPerSecond(value: number) { this.setAttribute('pixels-per-second', String(Math.max(2, Number(value) || 36))); }
        public get snap(): number { return this.Number(this.getAttribute('snap'), .1, .001); }
        public set snap(value: number) { this.setAttribute('snap', String(Math.max(.001, Number(value) || .1))); }
        public get playhead(): number { return this.Number(this.getAttribute('playhead'), 0, 0); }
        public set playhead(value: number) { this.setAttribute('playhead', String(this.Clamp(Number(value) || 0, 0, this.duration))); }
        public get framerate(): number { return this.Number(this.getAttribute('framerate'), 25, 1); }
        public set framerate(value: number) { this.setAttribute('framerate', String(Math.max(1, Number(value) || 25))); }

        public get tracks(): VideoTrack.VideoTrack[]
        {
            return Array.from(this.querySelectorAll<VideoTrack.VideoTrack>(':scope .VideoTrackEditor-Tracks > arianna-video-track,:scope .VideoTrackEditor-Tracks > .VideoTrack'));
        }

        public get clips(): VideoPart.VideoPart[]
        {
            return Array.from(this.querySelectorAll<VideoPart.VideoPart>(':scope .VideoTrackEditor-Tracks arianna-video-part,:scope .VideoTrackEditor-Tracks .VideoPart'));
        }

        public setTracks(value: number | VideoTrackOptions[]): this
        {
            if(typeof value === 'number')
            {
                this.trackCount = value;
                this.EnsureTracks();
                return this;
            }
            this.Render();
            if(!this.TracksHost) return this;
            this.TracksHost.replaceChildren();
            value.forEach((options, index) => this.TracksHost!.appendChild(new VideoTrack.VideoTrack({ ...options, index })));
            this.setAttribute('tracks', String(Math.max(1, value.length)));
            this.tracks.forEach(track => track.onConnected?.());
            this.Sync();
            return this;
        }

        public addTrack(options: VideoTrackOptions = {}): VideoTrack.VideoTrack
        {
            this.Render();
            const index = this.tracks.length;
            const track = new VideoTrack.VideoTrack({ name: options.name ?? `Video ${index + 1}`, ...options, index });
            this.TracksHost?.appendChild(track);
            track.onConnected?.();
            this.setAttribute('tracks', String(index + 1));
            this.Sync();
            this.Emit('arianna:video-track-add', { track, index });
            return track;
        }

        public addClip(clip: VideoClip, trackIndex = clip.track ?? 0): VideoPart.VideoPart
        {
            this.EnsureTracks();
            while(this.tracks.length <= trackIndex) this.addTrack();
            const track = this.tracks[Math.max(0, Math.min(this.tracks.length - 1, trackIndex))];
            const part = new VideoPart.VideoPart(this.PartOptions(clip));
            track.addPart(part);
            this.Sync();
            this.Emit('arianna:video-clip-add', { clip: part, track: trackIndex });
            return part;
        }

        /** Compatibility with the pre-2.0 VideoTrackEditor API. */
        public setClips(clips: VideoClip[]): this
        {
            const list = Array.isArray(clips) ? clips : [];
            const count = Math.max(1, this.trackCount, ...list.map(clip => Math.max(0, Math.floor(Number(clip.track) || 0)) + 1));
            this.trackCount = count;
            this.EnsureTracks();
            this.tracks.forEach(track => track.parts.forEach(part => part.remove()));
            list.forEach(clip => this.addClip(clip, Math.max(0, Math.floor(Number(clip.track) || 0))));
            this.Sync();
            return this;
        }

        public removeClip(idOrPart: string | VideoPart.VideoPart): this
        {
            const part = typeof idOrPart === 'string' ? this.clips.find(item => item.id === idOrPart) : idOrPart;
            if(!part) return this;
            const snapshot = part.snapshot();
            part.remove();
            this.Emit('arianna:video-clip-remove', { clip: snapshot });
            return this;
        }

        public splitSelected(at?: number): VideoPart.VideoPart | null
        {
            const selected = this.SelectedPart();
            if(!selected) return null;
            const splitAt = at ?? this.playhead;
            const next = selected.split(splitAt);
            this.Sync();
            return next;
        }

        public deleteSelected(): this
        {
            const selected = this.SelectedPart();
            if(selected) this.removeClip(selected);
            return this;
        }

        public fit(): this
        {
            const viewport = this.Body?.clientWidth ?? this.clientWidth;
            const available = Math.max(120, viewport - 138 - 18);
            this.pixelsPerSecond = Math.max(2, available / Math.max(.1, this.duration));
            return this;
        }

        private Render(): void
        {
            if(this.querySelector(':scope > .VideoTrackEditor-Shell'))
            {
                this.CaptureNodes();
                return;
            }

            const existingTracks = Array.from(this.querySelectorAll<HTMLElement>(':scope > arianna-video-track,:scope > .VideoTrack'));
            const shell = document.createElement('div'); shell.className = 'VideoTrackEditor-Shell';

            const toolbar = document.createElement('div'); toolbar.className = 'VideoTrackEditor-Toolbar';
            const brand = document.createElement('span'); brand.className = 'VideoTrackEditor-Brand';
            const dot = document.createElement('span'); dot.className = 'VideoTrackEditor-BrandDot';
            const title = document.createElement('span'); title.textContent = this.getAttribute('title') || 'Edit timeline';
            brand.append(dot, title);
            toolbar.append(
                brand,
                this.ToolButton('↖', 'select', 'Selection'),
                this.ToolButton('✂', 'blade', 'Blade / split'),
                this.Separator(),
                this.ToolButton('◉', 'snap', 'Magnetic snapping'),
                this.ToolButton('│', 'split', 'Split selected clip at playhead'),
                this.ToolButton('⌫', 'delete', 'Delete selected clip'),
                this.Separator(),
                this.ToolButton('−', 'zoom-out', 'Zoom out'),
                this.ToolButton('+', 'zoom-in', 'Zoom in'),
                this.ToolButton('Fit', 'fit', 'Fit timeline')
            );
            const fill = document.createElement('span'); fill.className = 'VideoTrackEditor-Fill';
            const tc = document.createElement('span'); tc.className = 'VideoTrackEditor-Timecode'; tc.textContent = '00:00:00:00';
            toolbar.append(fill, tc); this.Timecode = tc;

            const rulerRow = document.createElement('div'); rulerRow.className = 'VideoTrackEditor-RulerRow';
            const rulerHead = document.createElement('div'); rulerHead.className = 'VideoTrackEditor-RulerHead'; rulerHead.textContent = 'TIMELINE';
            const rulerViewport = document.createElement('div'); rulerViewport.className = 'VideoTrackEditor-RulerViewport';
            const ruler = document.createElement('div'); ruler.className = 'VideoTrackEditor-Ruler'; rulerViewport.appendChild(ruler);
            rulerRow.append(rulerHead, rulerViewport); this.RulerViewport = rulerViewport; this.Ruler = ruler;

            const body = document.createElement('div'); body.className = 'VideoTrackEditor-Body';
            const tracks = document.createElement('div'); tracks.className = 'VideoTrackEditor-Tracks';
            existingTracks.forEach(track => tracks.appendChild(track));
            const playhead = document.createElement('div'); playhead.className = 'VideoTrackEditor-Playhead';
            const hint = document.createElement('div'); hint.className = 'VideoTrackEditor-DropHint'; hint.textContent = 'Drop video into timeline';
            body.append(tracks, playhead, hint); this.Body = body; this.TracksHost = tracks; this.PlayheadNode = playhead;

            const status = document.createElement('div'); status.className = 'VideoTrackEditor-Status';
            status.innerHTML = '<span>Tool <strong data-status="tool">Select</strong></span><span>Snap <strong data-status="snap">0.10 s</strong></span><span>Zoom <strong data-status="zoom">36 px/s</strong></span><span>Frame <strong data-status="frame">25 fps</strong></span>';
            shell.append(toolbar, rulerRow, body, status);
            this.appendChild(shell);
            existingTracks.forEach(track => (track as VideoTrack.VideoTrack).onConnected?.());
        }

        private CaptureNodes(): void
        {
            this.Body = this.querySelector<HTMLElement>(':scope > .VideoTrackEditor-Shell > .VideoTrackEditor-Body') ?? undefined;
            this.TracksHost = this.querySelector<HTMLElement>(':scope .VideoTrackEditor-Tracks') ?? undefined;
            this.RulerViewport = this.querySelector<HTMLElement>(':scope .VideoTrackEditor-RulerViewport') ?? undefined;
            this.Ruler = this.querySelector<HTMLElement>(':scope .VideoTrackEditor-Ruler') ?? undefined;
            this.PlayheadNode = this.querySelector<HTMLElement>(':scope .VideoTrackEditor-Playhead') ?? undefined;
            this.Timecode = this.querySelector<HTMLElement>(':scope .VideoTrackEditor-Timecode') ?? undefined;
        }

        private EnsureTracks(): void
        {
            this.Render();
            if(!this.TracksHost) return;
            const desired = this.trackCount;
            let current = this.tracks;
            while(current.length < desired)
            {
                const index = current.length;
                const color = ['#4f88c7','#5b9b68','#b77b45','#865ca9','#b45169'][index % 5];
                const track = new VideoTrack.VideoTrack({ index, name: `Video ${index + 1}`, color });
                this.TracksHost.appendChild(track); track.onConnected?.(); current = this.tracks;
            }
            while(current.length > desired)
            {
                const last = current.at(-1); if(!last) break;
                const previous = current.at(-2);
                if(previous) last.parts.forEach(part => previous.addPart(part));
                last.remove(); current = this.tracks;
            }
            current.forEach((track, index) => { track.index = index; if(!track.getAttribute('name')) track.name = `Video ${index + 1}`; });
        }

        private Sync(): void
        {
            this.Render();
            this.CaptureNodes();
            const pps = this.pixelsPerSecond;
            const timelineWidth = Math.max(1, Math.ceil(this.duration * pps));
            this.style.setProperty('--VideoTrackEditor-Pps', `${pps}px`);
            this.style.setProperty('--VideoTrackEditor-TimelineWidth', `${timelineWidth}px`);
            this.tracks.forEach(track =>
            {
                track.setAttribute('pixels-per-second', String(pps));
                track.setAttribute('snap', String(this.snap));
                track.setAttribute('height', String(this.Number(this.getAttribute('track-height'), 74, 40)));
                track.setAttribute('theme', this.getAttribute('theme') === 'light' ? 'light' : 'dark');
                const lane = track.querySelector<HTMLElement>(':scope > .VideoTrack-Lane');
                if(lane) lane.style.width = `${timelineWidth}px`;
                track.parts.forEach(part =>
                {
                    part.setAttribute('theme', this.getAttribute('theme') === 'light' ? 'light' : 'dark');
                    part.onConnected?.();
                });
            });
            if(this.Ruler) this.Ruler.style.width = `${timelineWidth}px`;
            this.DrawRuler();
            if(this.PlayheadNode) this.PlayheadNode.style.left = `calc(var(--VideoTrackEditor-Header) + ${this.playhead * pps}px)`;
            if(this.Timecode) this.Timecode.textContent = this.FormatTimecode(this.playhead);
            const title = this.querySelector<HTMLElement>('.VideoTrackEditor-Brand > span:last-child'); if(title) title.textContent = this.getAttribute('title') || 'Edit timeline';
            const snapButton = this.querySelector<HTMLButtonElement>('[data-action="snap"]'); if(snapButton) snapButton.dataset.active = String(this.getAttribute('magnetic-snap') !== 'false');
            const selectButton = this.querySelector<HTMLButtonElement>('[data-action="select"]'); if(selectButton) selectButton.dataset.active = String(this.Tool !== 'blade');
            const bladeButton = this.querySelector<HTMLButtonElement>('[data-action="blade"]'); if(bladeButton) bladeButton.dataset.active = String(this.Tool === 'blade');
            this.Status('tool', this.Tool === 'blade' ? 'Blade' : 'Select');
            this.Status('snap', `${this.snap.toFixed(this.snap < .1 ? 2 : 1)} s`);
            this.Status('zoom', `${Math.round(pps)} px/s`);
            this.Status('frame', `${Math.round(this.framerate)} fps`);
        }

        private Bind(): void
        {
            if(this.Bound) return; this.Bound = true;

            this.addEventListener('click', event =>
            {
                const button = (event.target as Element | null)?.closest?.('.VideoTrackEditor-Tool') as HTMLButtonElement | null;
                if(button)
                {
                    event.preventDefault(); event.stopPropagation(); this.HandleTool(button.dataset.action || ''); return;
                }
                if(this.Tool === 'blade')
                {
                    const part = (event.target as Element | null)?.closest?.('arianna-video-part,.VideoPart') as VideoPart.VideoPart | null;
                    if(part && this.contains(part))
                    {
                        const lane = part.closest('.VideoTrack-Lane') as HTMLElement | null;
                        if(lane)
                        {
                            const rect = lane.getBoundingClientRect();
                            const time = this.Clamp(this.SnapTime((event as MouseEvent).clientX - rect.left), 0, this.duration);
                            part.split(time); this.Sync(); event.preventDefault(); event.stopPropagation();
                        }
                    }
                }
            });

            this.addEventListener('arianna:video-part-delete', event =>
            {
                const part = (event as CustomEvent).detail?.part as VideoPart.VideoPart | undefined;
                if(part) this.removeClip(part); event.stopPropagation();
            });
            this.addEventListener('arianna:video-part-change', () => this.UpdatePlayheadOnly());
            this.addEventListener('arianna:video-part-commit', event => { this.Sync(); this.Emit('arianna:video-change', { detail: (event as CustomEvent).detail }); });
            this.addEventListener('arianna:video-part-select', event => { this.Emit('arianna:video-select', { part: (event as CustomEvent).detail?.part }); });

            this.addEventListener('keydown', event =>
            {
                const primary = event.metaKey || event.ctrlKey;
                if(primary && event.key.toLowerCase() === 'c') { const selected = this.SelectedPart(); if(selected) { this.Clipboard = selected.snapshot(); this.ClipboardTrack = this.TrackIndex(selected); } event.preventDefault(); }
                else if(primary && event.key.toLowerCase() === 'x') { const selected = this.SelectedPart(); if(selected) { this.Clipboard = selected.snapshot(); this.ClipboardTrack = this.TrackIndex(selected); this.removeClip(selected); } event.preventDefault(); }
                else if(primary && event.key.toLowerCase() === 'v') { if(this.Clipboard) { const pasted = this.addClip({ ...this.Clipboard, id: undefined, start: this.playhead }, this.ClipboardTrack ?? 0); pasted.setAttribute('selected',''); } event.preventDefault(); }
                else if(primary && event.key.toLowerCase() === 'b') { this.splitSelected(); event.preventDefault(); }
                else if((event.key === 'Delete' || event.key === 'Backspace') && this.SelectedPart()) { this.deleteSelected(); event.preventDefault(); }
                else if(event.key === 'ArrowLeft' || event.key === 'ArrowRight') { this.playhead = this.playhead + (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 1 : 1 / this.framerate); event.preventDefault(); }
            });

            const seekFromPointer = (event: PointerEvent | MouseEvent) =>
            {
                const viewport = this.RulerViewport; if(!viewport) return;
                const rect = viewport.getBoundingClientRect();
                const scroll = this.Body?.scrollLeft ?? 0;
                const x = event.clientX - rect.left + scroll;
                this.playhead = this.Clamp(this.SnapTime(x), 0, this.duration);
            };
            this.RulerViewport?.addEventListener('pointerdown', event =>
            {
                if(event.button !== 0) return; seekFromPointer(event); const id = event.pointerId;
                const move = (e: PointerEvent) => { if(e.pointerId === id) seekFromPointer(e); };
                const up = (e: PointerEvent) => { if(e.pointerId !== id) return; window.removeEventListener('pointermove', move, true); window.removeEventListener('pointerup', up, true); };
                window.addEventListener('pointermove', move, true); window.addEventListener('pointerup', up, true); event.preventDefault();
            });

            this.Body?.addEventListener('scroll', () =>
            {
                if(this.RulerViewport && this.Body) this.RulerViewport.scrollLeft = this.Body.scrollLeft;
            }, { passive: true });

            this.addEventListener('dragenter', event => { if((event as DragEvent).dataTransfer?.types.includes('Files')) this.dataset.dragOver = 'true'; });
            this.addEventListener('dragover', event => { if((event as DragEvent).dataTransfer?.types.includes('Files')) { event.preventDefault(); this.dataset.dragOver = 'true'; } });
            this.addEventListener('dragleave', event => { if(event.target === this) delete this.dataset.dragOver; });
            this.addEventListener('drop', event =>
            {
                const drag = event as DragEvent; delete this.dataset.dragOver; const file = drag.dataTransfer?.files?.[0];
                if(!file || !file.type.startsWith('video/')) return;
                event.preventDefault(); const src = URL.createObjectURL(file); const track = this.TrackFromPoint(drag.clientY) ?? 0;
                const lane = this.tracks[track]?.querySelector<HTMLElement>('.VideoTrack-Lane'); const rect = lane?.getBoundingClientRect();
                const start = rect ? this.Clamp(this.SnapTime(drag.clientX - rect.left), 0, this.duration) : this.playhead;
                this.addClip({ start, duration: Math.min(5, Math.max(.5, this.duration - start)), source: src, name: file.name }, track);
            });
        }

        private HandleTool(action: string): void
        {
            if(action === 'select' || action === 'blade') this.Tool = action;
            else if(action === 'snap') this.setAttribute('magnetic-snap', this.getAttribute('magnetic-snap') === 'false' ? 'true' : 'false');
            else if(action === 'split') this.splitSelected();
            else if(action === 'delete') this.deleteSelected();
            else if(action === 'zoom-in') this.pixelsPerSecond = Math.min(240, this.pixelsPerSecond * 1.25);
            else if(action === 'zoom-out') this.pixelsPerSecond = Math.max(2, this.pixelsPerSecond / 1.25);
            else if(action === 'fit') this.fit();
            this.Sync();
        }

        private DrawRuler(): void
        {
            const ruler = this.Ruler; if(!ruler) return; ruler.replaceChildren();
            const pps = this.pixelsPerSecond;
            const major = pps >= 100 ? .5 : pps >= 42 ? 1 : pps >= 18 ? 2 : 5;
            const minor = major / (pps >= 32 ? 5 : 2);
            for(let t = 0; t <= this.duration + .0001; t += minor)
            {
                const isMajor = Math.abs((t / major) - Math.round(t / major)) < .001;
                const tick = document.createElement('span'); tick.className = 'VideoTrackEditor-Tick'; tick.dataset.major = String(isMajor); tick.style.left = `${t * pps}px`; if(isMajor) tick.textContent = this.RulerLabel(t); ruler.appendChild(tick);
            }
        }

        private UpdatePlayheadOnly(): void
        {
            if(this.PlayheadNode) this.PlayheadNode.style.left = `calc(var(--VideoTrackEditor-Header) + ${this.playhead * this.pixelsPerSecond}px)`;
            if(this.Timecode) this.Timecode.textContent = this.FormatTimecode(this.playhead);
        }

        private PartOptions(clip: VideoClip): VideoPartOptions
        {
            return {
                id: clip.id, start: Number(clip.start) || 0,
                length: Math.max(.04, Number(clip.length ?? clip.duration) || 4),
                sourceStart: Math.max(0, Number(clip.sourceStart) || 0),
                src: clip.src ?? clip.source, label: clip.label ?? clip.name ?? 'Video', color: clip.color,
                theme: this.getAttribute('theme') === 'light' ? 'light' : 'dark', speed: clip.speed, opacity: clip.opacity,
                volume: clip.volume, muted: clip.muted, locked: clip.locked
            };
        }

        private SelectedPart(): VideoPart.VideoPart | null { return this.querySelector<VideoPart.VideoPart>(':scope arianna-video-part[selected],:scope .VideoPart[selected]'); }
        private TrackIndex(part: Element): number { const track = part.closest('arianna-video-track,.VideoTrack'); return Math.max(0, this.tracks.indexOf(track as VideoTrack.VideoTrack)); }
        private TrackFromPoint(y: number): number | null { const tracks = this.tracks; for(let i=0;i<tracks.length;i++){const r=tracks[i].getBoundingClientRect(); if(y>=r.top&&y<=r.bottom)return i;} return null; }
        private SnapTime(pixelX: number): number { const raw = pixelX / this.pixelsPerSecond; if(this.getAttribute('magnetic-snap') === 'false') return raw; return Math.round(raw / this.snap) * this.snap; }
        private ToolButton(text: string, action: string, title: string): HTMLButtonElement { const button=document.createElement('button'); button.type='button'; button.className='VideoTrackEditor-Tool'; button.dataset.action=action; button.title=title; button.textContent=text; return button; }
        private Separator(): HTMLElement { const node=document.createElement('span'); node.className='VideoTrackEditor-Separator'; return node; }
        private Status(name: string, value: string): void { const node=this.querySelector<HTMLElement>(`[data-status="${name}"]`); if(node) node.textContent=value; }
        private RulerLabel(seconds: number): string { const m=Math.floor(seconds/60),s=Math.floor(seconds%60); return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
        private FormatTimecode(seconds: number): string { const fps=Math.max(1,Math.round(this.framerate)); const totalFrames=Math.max(0,Math.round(seconds*fps)); const f=totalFrames%fps; const totalSeconds=Math.floor(totalFrames/fps); const s=totalSeconds%60; const m=Math.floor(totalSeconds/60)%60; const h=Math.floor(totalSeconds/3600); return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}:${String(f).padStart(2,'0')}`; }
        private Number(value: unknown, fallback: number, min = -Infinity): number { const n=Number(value); return Number.isFinite(n) ? Math.max(min,n) : fallback; }
        private Clamp(value: number, min: number, max: number): number { return Math.max(min,Math.min(max,value)); }
        private Emit(type: string, detail: Record<string,unknown> = {}): void { this.dispatchEvent(new CustomEvent(type,{bubbles:true,composed:true,detail:{...detail,editor:this,source:this}})); }
    }
}

export const VideoTrackEditorComponent = VideoTrackEditor.VideoTrackEditor;
export { VideoTrackEditorComponent as VideoTimelineEditor };
export default VideoTrackEditor.VideoTrackEditor;
