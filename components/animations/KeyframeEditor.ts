/**
 * @module components/animations/KeyframeEditor
 * @version 2.0.0
 */
import { Component, Css, Templates } from '../../core/index.ts';
import { AnimTrack } from './AnimTrack.ts';

const html = Templates.Template.Html;

export namespace KeyframeEditor
{
    export namespace Interfaces
    {
        export interface TrackDefinition extends AnimTrack.Interfaces.AnimTrackOptions
        {
            folder?: string;
        }

        export interface KeyframeEditorOptions
        {
            frameStart?: number;
            frameEnd?: number;
            current?: number;
            framePx?: number;
            frameStep?: number;
            trackHeight?: number;
            autoChannels?: boolean;
            tracks?: TrackDefinition[];
        }
    }

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.KeyframeEditor', {
            '--KeyframeEditor-HeadWidth': '164px', '--Animation-Playhead': '#e24d47',
            Background: '#181b1e', Border: '1px solid #15181a', BorderRadius: '8px',
            BoxSizing: 'border-box', Color: '#dde1e5', Display: 'block',
            FontFamily: 'var(--arianna-font, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif)',
            FontSize: '12px', MinHeight: '260px', MinWidth: '0', Overflow: 'hidden',
            Position: 'relative', UserSelect: 'none', Width: '100%'
        }),
        new Css.Rule('.KeyframeEditor-Toolbar', {
            AlignItems: 'center', Background: 'linear-gradient(180deg,#363b40 0%,#25292d 100%)',
            BorderBottom: '1px solid #0f1113', Display: 'flex', Gap: '5px', MinHeight: '38px',
            Padding: '5px 7px', Position: 'relative', ZIndex: '5'
        }),
        new Css.Rule('.KeyframeEditor-Button', {
            AlignItems: 'center', Appearance: 'none', Background: '#303439', Border: '1px solid #15181a',
            BorderRadius: '4px', Color: '#dde1e5', Cursor: 'pointer', Display: 'inline-flex',
            Font: '12px/1 var(--arianna-font, system-ui, sans-serif)', Height: '26px',
            JustifyContent: 'center', MinWidth: '28px', Padding: '0 7px'
        }),
        new Css.Rule('.KeyframeEditor-Button:hover', { Background: '#383d42', BorderColor: '#52585e' }),
        new Css.Rule('.KeyframeEditor[playing] .KeyframeEditor-PlayButton', {
            Background: '#303439', BorderColor: '#4b9ee9'
        }),
        new Css.Rule('.KeyframeEditor-Spacer', { Flex: '1 1 auto' }),
        new Css.Rule('.KeyframeEditor-FrameBox', {
            AlignItems: 'center', Background: '#171a1d', Border: '1px solid #15181a', BorderRadius: '4px',
            Display: 'inline-flex', Height: '26px', Overflow: 'hidden'
        }),
        new Css.Rule('.KeyframeEditor-FrameLabel', { Color: '#a8afb6', Padding: '0 7px' }),
        new Css.Rule('.KeyframeEditor-FrameInput', {
            Appearance: 'textfield', Background: '#0d0f11', Border: '0', BorderLeft: '1px solid #15181a',
            Color: '#ffffff', Font: '600 12px/1 var(--arianna-font, system-ui, sans-serif)', Height: '100%',
            Outline: 'none', Padding: '0 7px', TextAlign: 'center', Width: '58px'
        }),
        new Css.Rule('.KeyframeEditor-Range', {
            AlignItems: 'center', Background: '#303439', Border: '1px solid #15181a', BorderRadius: '4px',
            Color: '#b9c0c6', Display: 'inline-flex', Gap: '5px', Height: '26px', Padding: '0 7px'
        }),
        new Css.Rule('.KeyframeEditor-Range strong', { Color: '#ffffff', FontWeight: '600' }),

        new Css.Rule('.KeyframeEditor-Ruler', {
            Background: '#202428', BorderBottom: '1px solid #15181a', Display: 'grid',
            GridTemplateColumns: 'var(--KeyframeEditor-HeadWidth) minmax(0,1fr)', Height: '27px',
            Position: 'relative', ZIndex: '3'
        }),
        new Css.Rule('.KeyframeEditor-RulerCorner', {
            Background: '#272b2f', BorderRight: '1px solid #0f1113'
        }),
        new Css.Rule('.KeyframeEditor-RulerLane', {
            BackgroundImage: 'linear-gradient(to right, rgba(115,124,133,.20) 1px, transparent 1px)',
            BackgroundSize: '20% 100%', Position: 'relative'
        }),
        new Css.Rule('.KeyframeEditor-Tick', {
            Color: '#8e979f', FontSize: '10px', Position: 'absolute', Top: '7px', Transform: 'translateX(-50%)'
        }),

        new Css.Rule('.KeyframeEditor-Body', {
            Background: '#171a1d', MaxHeight: '430px', MinHeight: '190px', Overflow: 'auto', Position: 'relative'
        }),
        new Css.Rule('.KeyframeEditor-Folder', {
            Display: 'grid', GridTemplateColumns: 'var(--KeyframeEditor-HeadWidth) minmax(0,1fr)',
            Height: '28px', Position: 'relative'
        }),
        new Css.Rule('.KeyframeEditor-FolderName', {
            AlignItems: 'center', Background: '#292d31', BorderBottom: '1px solid #15181a',
            BorderRight: '1px solid #0f1113', Color: '#eef1f4', Display: 'flex', FontWeight: '650',
            Gap: '7px', Padding: '0 8px'
        }),
        new Css.Rule('.KeyframeEditor-FolderArrow', { Color: '#d9dde0', FontSize: '12px' }),
        new Css.Rule('.KeyframeEditor-FolderLane', {
            BackgroundColor: '#202428',
            BackgroundImage: 'linear-gradient(to right, rgba(151,160,169,.16) 1px, transparent 1px)',
            BackgroundSize: '20% 100%', BorderBottom: '1px solid #15181a'
        }),
        new Css.Rule('.KeyframeEditor .AnimTrack', {
            GridTemplateColumns: 'var(--KeyframeEditor-HeadWidth) minmax(0,1fr)', MinHeight: '28px'
        }),
        new Css.Rule('.KeyframeEditor .AnimTrack-Header', { Background: '#24282c' }),
        new Css.Rule('.KeyframeEditor .AnimTrack-Lane', { MinHeight: '28px' }),

        new Css.Rule('.KeyframeEditor-Playhead', {
            Background: 'var(--Animation-Playhead)', Bottom: '0', BoxShadow: '0 0 8px rgba(228,74,69,.18)',
            PointerEvents: 'none', Position: 'absolute', Top: '38px', Width: '2px', ZIndex: '8'
        }),
        new Css.Rule('.KeyframeEditor-Playhead::before', {
            Background: 'var(--Animation-Playhead)', BorderRadius: '2px 2px 0 0', Content: '""',
            Height: '6px', Left: '-3px', Position: 'absolute', Top: '0', Width: '8px'
        }),

        new Css.Rule('.KeyframeEditor[theme="light"]', { Background: '#eef0f2', BorderColor: '#b9bec3', Color: '#2b3035' }),
        new Css.Rule('.KeyframeEditor[theme="light"] .KeyframeEditor-Toolbar', { Background: 'linear-gradient(180deg,#f9fafb,#dfe3e6)', BorderBottomColor: '#b9bec3' }),
        new Css.Rule('.KeyframeEditor[theme="light"] .KeyframeEditor-Button', { Background: '#fff', BorderColor: '#b9bec3', Color: '#383e43' }),
        new Css.Rule('.KeyframeEditor[theme="light"] .KeyframeEditor-Button:hover', { Background: '#e1e4e7', BorderColor: '#b9bec3' }),
        new Css.Rule('.KeyframeEditor[theme="light"][playing] .KeyframeEditor-PlayButton', { Background: '#d8f0ff', BorderColor: '#4b9ee9' }),
        new Css.Rule('.KeyframeEditor[theme="light"] .KeyframeEditor-FrameBox', { Background: '#fff', BorderColor: '#c1c6cb' }),
        new Css.Rule('.KeyframeEditor[theme="light"] .KeyframeEditor-FrameLabel', { Color: '#697077' }),
        new Css.Rule('.KeyframeEditor[theme="light"] .KeyframeEditor-FrameInput', { Background: '#fff', BorderLeftColor: '#c1c6cb', Color: '#30363b' }),
        new Css.Rule('.KeyframeEditor[theme="light"] .KeyframeEditor-Range', { Background: '#f8f9fa', BorderColor: '#c1c6cb', Color: '#5f666d' }),
        new Css.Rule('.KeyframeEditor[theme="light"] .KeyframeEditor-Range strong', { Color: '#30353a' }),
        new Css.Rule('.KeyframeEditor[theme="light"] .KeyframeEditor-Ruler', { Background: '#e4e7e9', BorderBottomColor: '#c3c8cc' }),
        new Css.Rule('.KeyframeEditor[theme="light"] .KeyframeEditor-RulerCorner', { Background: '#e5e7e9', BorderRightColor: '#c0c5c9' }),
        new Css.Rule('.KeyframeEditor[theme="light"] .KeyframeEditor-RulerLane', { BackgroundImage: 'linear-gradient(to right,#dedfe1 1px,transparent 1px)' }),
        new Css.Rule('.KeyframeEditor[theme="light"] .KeyframeEditor-Tick', { Color: '#697077' }),
        new Css.Rule('.KeyframeEditor[theme="light"] .KeyframeEditor-Body', { Background: '#fafafa' }),
        new Css.Rule('.KeyframeEditor[theme="light"] .KeyframeEditor-FolderName', { Background: '#e5e8ea', BorderBottomColor: '#bdc2c6', BorderRightColor: '#bcc1c5', Color: '#2d3237' }),
        new Css.Rule('.KeyframeEditor[theme="light"] .KeyframeEditor-FolderArrow', { Color: '#555c62' }),
        new Css.Rule('.KeyframeEditor[theme="light"] .KeyframeEditor-FolderLane', { BackgroundColor: '#fafafa', BackgroundImage: 'linear-gradient(to right,#e2e4e6 1px,transparent 1px)', BorderBottomColor: '#bdc2c6' }),
        new Css.Rule('.KeyframeEditor[theme="light"] .AnimTrack-Header', { Background: '#f7f8f9' }),
    ]);

    @Component('arianna-keyframe-editor', Styles, {
        Shadow: false,
        Attributes: ['frame-start', 'frame-end', 'current', 'frame-px', 'frame-step', 'track-height', 'auto-channels'],
        Properties: ['tracks']
    })
    export class KeyframeEditor extends HTMLElement
    {
        public static readonly Styles = Styles;
        public template = html``;

        private _tracks?: Interfaces.TrackDefinition[];
        private _playing?: boolean;
        private _raf?: number;
        private _lastTime?: number;
        private _fps?: number;
        private _resize?: ResizeObserver;
        private _bound?: boolean;

        constructor(options: Interfaces.KeyframeEditorOptions = {})
        {
            super();
            this.EnsureState();
            if(options.frameStart != null) this.setAttribute('frame-start', String(options.frameStart));
            if(options.frameEnd != null) this.setAttribute('frame-end', String(options.frameEnd));
            if(options.current != null) this.setAttribute('current', String(options.current));
            if(options.framePx != null) this.setAttribute('frame-px', String(options.framePx));
            if(options.frameStep != null) this.setAttribute('frame-step', String(options.frameStep));
            if(options.trackHeight != null) this.setAttribute('track-height', String(options.trackHeight));
            if(options.autoChannels != null) this.toggleAttribute('auto-channels', options.autoChannels);
            if(options.tracks) this._tracks = options.tracks.slice();
        }

        public get tracks(): Interfaces.TrackDefinition[]
        {
            this.EnsureState();
            const rendered = Array.from(this.querySelectorAll('arianna-anim-track, .AnimTrack')).map(track => ({
                name: track.getAttribute('name') ?? undefined,
                channel: track.getAttribute('channel') ?? undefined,
                group: (track.getAttribute('group') as AnimTrack.Types.ChannelGroup | null) ?? undefined,
                folder: track.getAttribute('folder') ?? undefined,
                muted: track.hasAttribute('muted'),
                locked: track.hasAttribute('locked'),
                hidden: track.hasAttribute('hidden'),
                keyframes: (track as AnimTrack.AnimTrack).keyframes
            }));
            return rendered.length ? rendered : (this._tracks ?? []).slice();
        }

        public set tracks(value: Interfaces.TrackDefinition[])
        {
            this.EnsureState();
            this._tracks = Array.isArray(value) ? value.slice() : [];
            if(this.isConnected) this.Render();
        }

        public get current(): number { return Number(this.getAttribute('current') ?? 0) || 0; }
        public set current(value: number) { this.setFrame(value); }

        public onConnected(): void
        {
            this.EnsureState();
            this.classList.add('KeyframeEditor');
            if(!this.hasAttribute('tabindex')) this.tabIndex = 0;
            if(!this.hasAttribute('frame-start')) this.setAttribute('frame-start', '0');
            if(!this.hasAttribute('frame-end')) this.setAttribute('frame-end', '240');
            if(!this.hasAttribute('current')) this.setAttribute('current', '24');
            if(!this.hasAttribute('frame-step')) this.setAttribute('frame-step', '50');
            this.Render();
        }

        public onCreated(): void
        {
            if(this.isConnected) this.onConnected();
        }

        public render(): HTMLElement
        {
            return this;
        }

        public onUnmount(): void
        {
            this.pause();
            this._resize?.disconnect();
        }

        public addTrack(track: AnimTrack.AnimTrack): this
        {
            const body = this.querySelector<HTMLElement>(':scope > .KeyframeEditor-Body');
            if(!body) return this;
            this.ConfigureTrack(track);
            body.append(track);
            track.onConnected?.();
            this.UpdatePlayhead();
            this.EmitUpdate();
            return this;
        }

        public setFrame(frame: number): this
        {
            const start = this.FrameStart();
            const end = this.FrameEnd();
            const value = Math.max(start, Math.min(end, Math.round(frame)));
            this.setAttribute('current', String(value));
            const input = this.querySelector<HTMLInputElement>(':scope > .KeyframeEditor-Toolbar .KeyframeEditor-FrameInput');
            if(input && input.value !== String(value)) input.value = String(value);
            this.UpdatePlayhead();
            this.UpdateHotKeyframes();
            this.dispatchEvent(new CustomEvent('arianna:keyframe-editor-playhead', {
                bubbles: true, composed: true, detail: { frame: value, source: this }
            }));
            return this;
        }

        public togglePlay(): void { this.EnsureState(); this._playing ? this.pause() : this.play(); }

        public play(): void
        {
            this.EnsureState();
            if(this._playing) return;
            this._playing = true;
            this.setAttribute('playing', '');
            this._lastTime = performance.now();
            const tick = (time: number) =>
            {
                if(!this._playing) return;
                if(time - (this._lastTime ?? 0) >= 1000 / (this._fps ?? 24))
                {
                    this._lastTime = time;
                    const next = this.current >= this.FrameEnd() ? this.FrameStart() : this.current + 1;
                    this.setFrame(next);
                }
                this._raf = requestAnimationFrame(tick);
            };
            this._raf = requestAnimationFrame(tick);
            this.dispatchEvent(new CustomEvent('arianna:keyframe-editor-play', {
                bubbles: true, composed: true, detail: { source: this }
            }));
        }

        public pause(): void
        {
            this.EnsureState();
            if(!this._playing) return;
            this._playing = false;
            this.removeAttribute('playing');
            if(this._raf) cancelAnimationFrame(this._raf);
            this._raf = 0;
            this.dispatchEvent(new CustomEvent('arianna:keyframe-editor-pause', {
                bubbles: true, composed: true, detail: { source: this }
            }));
        }

        public setFps(fps: number): this
        {
            this.EnsureState();
            this._fps = Math.max(1, fps);
            return this;
        }

        private Render(): void
        {
            this.EnsureState();
            const markupTracks = Array.from(this.children)
                .filter(node => node instanceof HTMLElement && (node.matches('arianna-anim-track') || node.classList.contains('AnimTrack'))) as AnimTrack.AnimTrack[];
            const definitions = (this._tracks?.length ?? 0)
                ? (this._tracks ?? [])
                : markupTracks.length
                    ? []
                    : this.hasAttribute('auto-channels')
                        ? this.DefaultTracks()
                        : [];

            const toolbar = this.Toolbar();
            const ruler = this.Ruler();
            const body = document.createElement('div');
            body.className = 'KeyframeEditor-Body';

            const tracks = definitions.length
                ? definitions.map(definition => this.Track(definition))
                : markupTracks;

            const folders = new Map<string, AnimTrack.AnimTrack[]>();
            for(const track of tracks)
            {
                this.ConfigureTrack(track);
                const folder = track.getAttribute('folder') || this.FolderName(track.getAttribute('group'));
                if(!folders.has(folder)) folders.set(folder, []);
                folders.get(folder)!.push(track);
            }

            for(const [folder, children] of folders)
            {
                body.append(this.Folder(folder));
                children.forEach(track =>
                {
                    body.append(track);
                    track.onConnected?.();
                });
            }

            const playhead = document.createElement('div');
            playhead.className = 'KeyframeEditor-Playhead';

            this.replaceChildren(toolbar, ruler, body, playhead);

            for(const track of tracks)
            {
                track.onConnected?.();
                track.PositionKeyframes?.();
            }

            const scrubFrame = (clientX: number, lane: HTMLElement): void =>
            {
                const rect = lane.getBoundingClientRect();
                if(rect.width <= 0) return;
                const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                this.setFrame(this.FrameStart() + ratio * (this.FrameEnd() - this.FrameStart()));
            };

            const rulerLane = ruler.querySelector<HTMLElement>('.KeyframeEditor-RulerLane');
            if(rulerLane)
            {
                let scrubbing = false;
                rulerLane.addEventListener('pointerdown', event =>
                {
                    scrubbing = true;
                    rulerLane.setPointerCapture?.(event.pointerId);
                    scrubFrame(event.clientX, rulerLane);
                    this.focus();
                });
                rulerLane.addEventListener('pointermove', event =>
                {
                    if(scrubbing) scrubFrame(event.clientX, rulerLane);
                });
                const finish = (event: PointerEvent) =>
                {
                    if(!scrubbing) return;
                    scrubbing = false;
                    try { rulerLane.releasePointerCapture?.(event.pointerId); } catch { /* no-op */ }
                };
                rulerLane.addEventListener('pointerup', finish);
                rulerLane.addEventListener('pointercancel', finish);
            }

            body.addEventListener('click', event =>
            {
                const target = event.target as HTMLElement;
                const lane = target.closest('.AnimTrack-Lane') as HTMLElement | null;
                if(!lane || target.closest('arianna-keyframe, .Keyframe')) return;
                const rect = lane.getBoundingClientRect();
                if(rect.width <= 0) return;
                const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
                this.setFrame(this.FrameStart() + ratio * (this.FrameEnd() - this.FrameStart()));
            });

            if(!this._bound)
            {
                this._bound = true;
                this.addEventListener('arianna:track-update', () => this.EmitUpdate());
                this.addEventListener('arianna:keyframe-select', () => this.EmitUpdate());
                this.addEventListener('keydown', event =>
                {
                    const target = event.target as HTMLElement | null;
                    if(target?.matches('input,select,textarea')) return;
                    if(event.code === 'Space')
                    {
                        event.preventDefault();
                        this.togglePlay();
                    }
                    else if(event.key === 'ArrowLeft')
                    {
                        event.preventDefault();
                        this.setFrame(this.current - (event.shiftKey ? 10 : 1));
                    }
                    else if(event.key === 'ArrowRight')
                    {
                        event.preventDefault();
                        this.setFrame(this.current + (event.shiftKey ? 10 : 1));
                    }
                    else if(event.key === 'Home')
                    {
                        event.preventDefault();
                        this.setFrame(this.FrameStart());
                    }
                    else if(event.key === 'End')
                    {
                        event.preventDefault();
                        this.setFrame(this.FrameEnd());
                    }
                });
            }

            this._resize?.disconnect();
            if(typeof ResizeObserver !== 'undefined')
            {
                this._resize = new ResizeObserver(() => this.UpdatePlayhead());
                this._resize.observe(this);
            }

            requestAnimationFrame(() =>
            {
                this.querySelectorAll<AnimTrack.AnimTrack>('arianna-anim-track').forEach(track => track.PositionKeyframes?.());
                this.UpdatePlayhead();
                this.UpdateHotKeyframes();
            });
        }

        private Toolbar(): HTMLElement
        {
            const toolbar = document.createElement('div');
            toolbar.className = 'KeyframeEditor-Toolbar';

            const first = this.Button('⏮', 'First');
            const play = this.Button('▶', 'Play');
            play.classList.add('KeyframeEditor-PlayButton');
            const next = this.Button('⏭', 'Next');
            const last = this.Button('⏭|', 'Last');
            const previous = this.Button('↢', 'Previous');

            first.addEventListener('click', () => this.setFrame(this.FrameStart()));
            previous.addEventListener('click', () => this.setFrame(this.current - 1));
            play.addEventListener('click', () => this.togglePlay());
            next.addEventListener('click', () => this.setFrame(this.current + 1));
            last.addEventListener('click', () => this.setFrame(this.FrameEnd()));

            const frameBox = document.createElement('label');
            frameBox.className = 'KeyframeEditor-FrameBox';
            const frameLabel = document.createElement('span');
            frameLabel.className = 'KeyframeEditor-FrameLabel';
            frameLabel.textContent = '↔';
            const input = document.createElement('input');
            input.className = 'KeyframeEditor-FrameInput';
            input.type = 'number';
            input.value = String(this.current);
            input.addEventListener('change', () => this.setFrame(Number(input.value)));
            frameBox.append(frameLabel, input);

            const spacer = document.createElement('span');
            spacer.className = 'KeyframeEditor-Spacer';

            const range = document.createElement('span');
            range.className = 'KeyframeEditor-Range';
            range.innerHTML = `Start <strong>${this.FrameStart()}</strong>&nbsp;&nbsp; End <strong>${this.FrameEnd()}</strong>`;

            toolbar.append(first, previous, play, next, last, frameBox, spacer, range);
            return toolbar;
        }

        private Ruler(): HTMLElement
        {
            const ruler = document.createElement('div');
            ruler.className = 'KeyframeEditor-Ruler';
            const corner = document.createElement('div');
            corner.className = 'KeyframeEditor-RulerCorner';
            const lane = document.createElement('div');
            lane.className = 'KeyframeEditor-RulerLane';

            const start = this.FrameStart();
            const end = this.FrameEnd();
            const step = Math.max(1, Number(this.getAttribute('frame-step') ?? 50) || 50);
            for(let frame = start; frame <= end; frame += step)
            {
                const tick = document.createElement('span');
                tick.className = 'KeyframeEditor-Tick';
                tick.textContent = String(frame);
                tick.style.left = `${((frame - start) / Math.max(1, end - start)) * 100}%`;
                lane.append(tick);
            }
            ruler.append(corner, lane);
            return ruler;
        }

        private Folder(name: string): HTMLElement
        {
            const row = document.createElement('div');
            row.className = 'KeyframeEditor-Folder';
            const label = document.createElement('div');
            label.className = 'KeyframeEditor-FolderName';
            const arrow = document.createElement('span');
            arrow.className = 'KeyframeEditor-FolderArrow';
            arrow.textContent = '⌄';
            const text = document.createElement('span');
            text.textContent = name;
            label.append(arrow, text);
            const lane = document.createElement('div');
            lane.className = 'KeyframeEditor-FolderLane';
            row.append(label, lane);
            return row;
        }


        private Track(definition: Interfaces.TrackDefinition): AnimTrack.AnimTrack
        {
            const track = new AnimTrack.AnimTrack();
            if(definition.name) track.setAttribute('name', definition.name);
            if(definition.channel) track.setAttribute('channel', definition.channel);
            if(definition.group) track.setAttribute('group', definition.group);
            if(definition.folder) track.setAttribute('folder', definition.folder);
            if(definition.muted != null) track.toggleAttribute('muted', definition.muted);
            if(definition.locked != null) track.toggleAttribute('locked', definition.locked);
            if(definition.hidden != null) track.toggleAttribute('hidden', definition.hidden);
            if(definition.keyframes) track.keyframes = definition.keyframes;
            return track;
        }

        private ConfigureTrack(track: AnimTrack.AnimTrack): void
        {
            track.setAttribute('frame-start', String(this.FrameStart()));
            track.setAttribute('frame-end', String(this.FrameEnd()));
            track.classList.remove('AnimTrack-Standalone');
        }

        private UpdatePlayhead(): void
        {
            const playhead = this.querySelector<HTMLElement>(':scope > .KeyframeEditor-Playhead');
            const rulerLane = this.querySelector<HTMLElement>(':scope > .KeyframeEditor-Ruler > .KeyframeEditor-RulerLane');
            if(!playhead || !rulerLane) return;
            const host = this.getBoundingClientRect();
            const lane = rulerLane.getBoundingClientRect();
            const ratio = (this.current - this.FrameStart()) / Math.max(1, this.FrameEnd() - this.FrameStart());
            playhead.style.left = `${lane.left - host.left + ratio * lane.width}px`;
        }

        private UpdateHotKeyframes(): void
        {
            for(const keyframe of Array.from(this.querySelectorAll('arianna-keyframe, .Keyframe')))
            {
                const frame = Number(keyframe.getAttribute('frame') ?? 0) || 0;
                keyframe.toggleAttribute('hot', frame === this.current);
            }
        }

        private EmitUpdate(): void
        {
            this.dispatchEvent(new CustomEvent('arianna:keyframe-editor-update', {
                bubbles: true, composed: true, detail: { editor: this, source: this }
            }));
        }

        private Button(text: string, title: string): HTMLButtonElement
        {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'KeyframeEditor-Button';
            button.textContent = text;
            button.title = title;
            return button;
        }

        private EnsureState(): void
        {
            if(!Array.isArray(this._tracks)) this._tracks = [];
            if(typeof this._playing !== 'boolean') this._playing = false;
            if(typeof this._raf !== 'number') this._raf = 0;
            if(typeof this._lastTime !== 'number') this._lastTime = 0;
            if(typeof this._fps !== 'number' || !Number.isFinite(this._fps) || this._fps <= 0) this._fps = 24;
            if(typeof this._bound !== 'boolean') this._bound = false;
        }

        private FrameStart(): number { return Number(this.getAttribute('frame-start') ?? 0) || 0; }
        private FrameEnd(): number { return Number(this.getAttribute('frame-end') ?? 240) || 240; }

        private FolderName(group: string | null): string
        {
            if(group === 'rotation') return 'Rotation';
            if(group === 'scale') return 'Scale';
            if(group === 'position') return 'Cube';
            return 'Custom';
        }

        private DefaultTracks(): Interfaces.TrackDefinition[]
        {
            return [
                { folder: 'Cube', name: 'X Location', channel: 'loc-x', group: 'position' },
                { folder: 'Cube', name: 'Y Location', channel: 'loc-y', group: 'position' },
                { folder: 'Cube', name: 'Z Location', channel: 'loc-z', group: 'position' },
                { folder: 'Rotation', name: 'X Rotation', channel: 'rot-x', group: 'rotation' },
                { folder: 'Rotation', name: 'Y Rotation', channel: 'rot-y', group: 'rotation' },
                { folder: 'Scale', name: 'X Scale', channel: 'scale-x', group: 'scale' },
                { folder: 'Scale', name: 'Y Scale', channel: 'scale-y', group: 'scale' },
                { folder: 'Scale', name: 'Z Scale', channel: 'scale-z', group: 'scale' }
            ];
        }
    }
}

export type KeyframeEditorOptions = KeyframeEditor.Interfaces.KeyframeEditorOptions;
export type KeyframeEditorTrack = KeyframeEditor.Interfaces.TrackDefinition;
export default KeyframeEditor.KeyframeEditor;
