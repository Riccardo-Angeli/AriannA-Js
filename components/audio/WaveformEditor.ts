/**
 * @module components/audio/WaveformEditor
 * @version 2.0.0
 * @author Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license MIT / Commercial (dual license)
 *
 * WaveLab-style destructive single-file waveform editor.
 */
import { Component, Css, Templates } from '../../core/index.ts';
import { AudioComponent as AudioComponentModule } from './AudioComponent.ts';

const html = Templates.Template.Html;

export namespace WaveformEditor
{
    export namespace Types
    {
        export type Theme = 'dark' | 'light';
        export type Selection = { start: number; end: number };
        export type Samples = Float32Array<ArrayBuffer>;
        export type Snapshot = { sampleRate: number; channels: Samples[] };
    }

    export namespace Interfaces
    {
        export interface WaveformEditorOptions extends AudioComponentModule.AudioComponentOptions
        {
            src?: string;
            width?: number;
            height?: number;
            waveColor?: string;
            selectionColor?: string;
            theme?: Types.Theme;
            name?: string;
            zoom?: number;
        }
    }

    type Tool = 'select' | 'draw';
    const ZOOM_MIN = 1;
    const ZOOM_MAX = 12;
    const ZOOM_DEFAULT = (ZOOM_MIN + ZOOM_MAX) / 2;

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.WaveformEditor', {
            Background: '#181b1e', Border: '1px solid #0b0d0f', BorderRadius: '5px',
            BoxShadow: 'inset 0 1px 0 rgba(255,255,255,.04),0 2px 8px rgba(0,0,0,.32)',
            BoxSizing: 'border-box', Color: '#dde1e4', Display: 'grid',
            FontFamily: 'var(--arianna-font,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif)',
            GridTemplateRows: '38px minmax(430px,1fr)', MinHeight: '468px', Overflow: 'hidden', Width: '100%'
        }),
        new Css.Rule('.WaveformEditor-Toolbar', {
            AlignItems: 'center', Background: 'linear-gradient(180deg,#363b40,#25292d)', BorderBottom: '1px solid #0e1012',
            Display: 'flex', Gap: '4px', MinWidth: '0', OverflowX: 'auto', Padding: '5px 7px'
        }),
        new Css.Rule('.WaveformEditor-Button', {
            Appearance: 'none', Background: 'linear-gradient(180deg,#464b50,#303439)', Border: '1px solid #15181a', BorderRadius: '3px',
            BoxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)', Color: '#dce0e3', Cursor: 'pointer',
            Flex: '0 0 auto', Font: '600 10px/1 var(--arianna-font,system-ui,sans-serif)', Height: '26px', Padding: '0 8px'
        }),
        new Css.Rule('.WaveformEditor-Button:hover', { Background: 'linear-gradient(180deg,#52585e,#383d42)' }),
        new Css.Rule('.WaveformEditor-Button[data-active="true"]', { Background: '#e40c88', BorderColor: '#a50962', Color: '#fff' }),
        new Css.Rule('.WaveformEditor-Button:disabled', { Cursor: 'default', Opacity: '.35' }),
        new Css.Rule('.WaveformEditor-Title', {
            Color: '#9ca4ab', Flex: '0 0 auto', FontSize: '10px', FontWeight: '700', LetterSpacing: '.06em', MarginRight: '4px', TextTransform: 'uppercase'
        }),
        new Css.Rule('.WaveformEditor-Separator', { Background: '#15181a', Height: '20px', Margin: '0 2px', Width: '1px' }),
        new Css.Rule('.WaveformEditor-Fill', { Flex: '1 1 auto', MinWidth: '8px' }),
        new Css.Rule('.WaveformEditor-Body', { Display: 'grid', GridTemplateColumns: 'minmax(0,1fr)', MinHeight: '430px', MinWidth: '0' }),
        new Css.Rule('.WaveformEditor-Main', { Display: 'grid', GridTemplateRows: 'minmax(0,1fr) 30px', MinWidth: '0', Overflow: 'hidden' }),
        new Css.Rule('.WaveformEditor-CanvasWrap', { Background: '#202428', Cursor: 'crosshair', MinHeight: '0', Overflow: 'hidden', Position: 'relative' }),
        new Css.Rule('.WaveformEditor[data-tool="draw"] .WaveformEditor-CanvasWrap', { Cursor: 'cell' }),
        new Css.Rule('.WaveformEditor-Canvas', { Display: 'block', Height: '100%', Width: '100%' }),
        new Css.Rule('.WaveformEditor-Ruler', {
            BackgroundImage: 'repeating-linear-gradient(to right,rgba(151,160,169,.20) 0 1px,transparent 1px 8.333%)',
            Bottom: '0', Left: '0', PointerEvents: 'none', Position: 'absolute', Right: '0', Top: '0'
        }),
        new Css.Rule('.WaveformEditor-Selection', {
            Background: 'rgba(228,12,136,.18)', BorderLeft: '1px solid #e40c88', BorderRight: '1px solid #e40c88',
            Bottom: '0', PointerEvents: 'none', Position: 'absolute', Top: '0'
        }),
        new Css.Rule('.WaveformEditor-Playhead', { Background: '#e24d47', Bottom: '0', PointerEvents: 'none', Position: 'absolute', Top: '0', Width: '1px' }),
        new Css.Rule('.WaveformEditor-ChannelLine', { Background: 'rgba(255,255,255,.06)', Height: '1px', Left: '0', PointerEvents: 'none', Position: 'absolute', Right: '0', Top: '50%' }),
        new Css.Rule('.WaveformEditor-Status', {
            AlignItems: 'center', Background: '#23272b', BorderTop: '1px solid #0f1113', Color: '#7e878f', Display: 'flex',
            Font: '9px/1 ui-monospace,SFMono-Regular,Menlo,monospace', Gap: '10px', MinWidth: '0', Padding: '0 8px'
        }),
        new Css.Rule('.WaveformEditor-StatusText', { MinWidth: '0', Overflow: 'hidden', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap' }),
        new Css.Rule('.WaveformEditor-StatusFill', { Flex: '1 1 auto' }),
        new Css.Rule('.WaveformEditor-Scroll', { AccentColor: '#e40c88', Cursor: 'pointer', Flex: '0 1 180px', MaxWidth: '180px', MinWidth: '70px' }),
        new Css.Rule('.WaveformEditor-Density', { AlignItems: 'center', Display: 'flex', Flex: '0 0 auto', Gap: '5px' }),
        new Css.Rule('.WaveformEditor-DensityLabel', { Color: '#9aa2a9', Font: '700 8px/1 var(--arianna-font,system-ui,sans-serif)', LetterSpacing: '.04em', TextTransform: 'uppercase' }),
        new Css.Rule('.WaveformEditor-DensityInput', { AccentColor: '#e40c88', Cursor: 'pointer', Width: '112px' }),
        new Css.Rule('.WaveformEditor-DensityValue', { Color: '#c3c9ce', MinWidth: '28px', TextAlign: 'right' }),

        new Css.Rule('.WaveformEditor[theme="light"]', {
            Background: '#eef0f2', BorderColor: '#b9bec3', BoxShadow: 'inset 0 1px 0 #fff,0 2px 8px rgba(0,0,0,.11)', Color: '#25292d'
        }),
        new Css.Rule('.WaveformEditor[theme="light"] .WaveformEditor-Toolbar', { Background: 'linear-gradient(180deg,#f9fafb,#dfe3e6)', BorderBottomColor: '#b9bec3' }),
        new Css.Rule('.WaveformEditor[theme="light"] .WaveformEditor-Button', { Background: 'linear-gradient(180deg,#fff,#e1e4e7)', BorderColor: '#b9bec3', Color: '#383e43' }),
        new Css.Rule('.WaveformEditor[theme="light"] .WaveformEditor-Separator', { Background: '#b9bec3' }),
        new Css.Rule('.WaveformEditor[theme="light"] .WaveformEditor-CanvasWrap', { Background: '#fafafa' }),
        new Css.Rule('.WaveformEditor[theme="light"] .WaveformEditor-Ruler', { BackgroundImage: 'repeating-linear-gradient(to right,#e0e2e4 0 1px,transparent 1px 8.333%)' }),
        new Css.Rule('.WaveformEditor[theme="light"] .WaveformEditor-ChannelLine', { Background: 'rgba(0,0,0,.08)' }),
        new Css.Rule('.WaveformEditor[theme="light"] .WaveformEditor-Status', { Background: '#e4e7e9', BorderTopColor: '#c3c8cc', Color: '#626a71' }),
        new Css.Rule('.WaveformEditor[theme="light"] .WaveformEditor-DensityLabel', { Color: '#697178' }),
        new Css.Rule('.WaveformEditor[theme="light"] .WaveformEditor-DensityValue', { Color: '#394047' })
    ]);

    @Component('arianna-waveform-editor', Styles, {
        Shadow: false,
        Attributes: ['src', 'width', 'height', 'wave-color', 'selection-color', 'theme', 'name', 'zoom']
    })
    export class WaveformEditor extends AudioComponentModule.AudioComponent
    {
        public static readonly Styles = Styles;
        public static readonly tag = 'arianna-waveform-editor';
        public template = html``;

        private Buffer?: AudioBuffer;
        private Clipboard?: Types.Snapshot;
        private readonly UndoStack: Types.Snapshot[] = [];
        private readonly RedoStack: Types.Snapshot[] = [];
        private Canvas?: HTMLCanvasElement;
        private CanvasWrap?: HTMLElement;
        private Selection?: HTMLElement;
        private Playhead?: HTMLElement;
        private StatusText?: HTMLElement;
        private DensityInput?: HTMLInputElement;
        private DensityValue?: HTMLElement;
        private ScrollInput?: HTMLInputElement;
        private FileInput?: HTMLInputElement;
        private PlayButton?: HTMLButtonElement;
        private OutputGain?: GainNode;
        private OutputPan?: StereoPannerNode;
        private Source?: AudioBufferSourceNode;
        private Raf = 0;
        private StartedAt = 0;
        private Current = 0;
        private PlaybackStart = 0;
        private PlaybackEnd = 1;
        private Start = .18;
        private End = .58;
        private Zoom = ZOOM_DEFAULT;
        private Tool: Tool = 'select';
        private Scroll = 0;
        private LoadedName = 'Audio';
        private Resize?: ResizeObserver;

        constructor(options: Interfaces.WaveformEditorOptions = {})
        {
            super(options);
            this.EnsureState();
            if(options.src) this.setAttribute('src', options.src);
            if(options.width != null) this.setAttribute('width', String(options.width));
            if(options.height != null) this.setAttribute('height', String(options.height));
            if(options.waveColor) this.setAttribute('wave-color', options.waveColor);
            if(options.selectionColor) this.setAttribute('selection-color', options.selectionColor);
            if(options.theme) this.setAttribute('theme', options.theme);
            if(options.name) { this.setAttribute('name', options.name); this.LoadedName = options.name; }
            if(options.zoom != null) this.setAttribute('zoom', String(options.zoom));
        }

        public onConnected(): void
        {
            this.EnsureState();
            super.onConnected();
            this.classList.add('WaveformEditor');
            if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
            if(this.hasAttribute('width')) this.style.width = `${Number(this.getAttribute('width')) || 860}px`;
            if(this.hasAttribute('height')) this.style.minHeight = `${Number(this.getAttribute('height')) || 468}px`;
            if(!this.hasAttribute('zoom')) this.setAttribute('zoom', String(ZOOM_DEFAULT));
            this.Zoom = this.Clamp(Number(this.getAttribute('zoom') ?? ZOOM_DEFAULT), ZOOM_MIN, ZOOM_MAX);
            this.dataset.tool = this.Tool;
            this.Render();
            this.EnsureAudioRuntime();
            this.SyncTheme();
            this.SyncZoomControls();
            this.Draw();
            const src = this.getAttribute('src');
            if(src) void this.setSource(src);
        }

        public onCreated(): void
        {
            requestAnimationFrame(() => { if(this.isConnected) this.onConnected(); });
        }

        public onAttributeChanged(name: string): void
        {
            if(!this.isConnected) return;
            if(name === 'src')
            {
                const src = this.getAttribute('src');
                if(src) void this.setSource(src);
            }
            else if(name === 'zoom')
            {
                const zoom = Number(this.getAttribute('zoom') ?? ZOOM_DEFAULT);
                if(Number.isFinite(zoom) && Math.abs(zoom - this.Zoom) > .0001)
                {
                    this.Zoom = this.Clamp(zoom, ZOOM_MIN, ZOOM_MAX);
                    this.SyncZoomControls();
                    this.SyncSelection();
                    this.Draw();
                }
            }
            else if(name === 'theme')
            {
                this.SyncTheme();
                this.Draw();
            }
        }

        /** Markup-first promotion can bypass native field initializers. */
        private EnsureState(): void
        {
            const self = this as unknown as {
                UndoStack?: Types.Snapshot[]; RedoStack?: Types.Snapshot[]; Raf?: number; StartedAt?: number;
                Current?: number; PlaybackStart?: number; PlaybackEnd?: number;
                Start?: number; End?: number; Zoom?: number; Scroll?: number; LoadedName?: string; Tool?: Tool;
            };
            if(!Array.isArray(self.UndoStack)) self.UndoStack = [];
            if(!Array.isArray(self.RedoStack)) self.RedoStack = [];
            if(!Number.isFinite(self.Raf)) self.Raf = 0;
            if(!Number.isFinite(self.StartedAt)) self.StartedAt = 0;
            if(!Number.isFinite(self.Current)) self.Current = 0;
            if(!Number.isFinite(self.PlaybackStart)) self.PlaybackStart = 0;
            if(!Number.isFinite(self.PlaybackEnd)) self.PlaybackEnd = 1;
            if(!Number.isFinite(self.Start)) self.Start = .18;
            if(!Number.isFinite(self.End)) self.End = .58;
            if(!Number.isFinite(self.Zoom) || (self.Zoom ?? 0) < ZOOM_MIN) self.Zoom = ZOOM_DEFAULT;
            if(!Number.isFinite(self.Scroll)) self.Scroll = 0;
            if(typeof self.LoadedName !== 'string' || !self.LoadedName) self.LoadedName = this.getAttribute('name') || 'Audio';
            if(self.Tool !== 'select' && self.Tool !== 'draw') self.Tool = 'select';
        }

        /** Ensure prototype-promoted instances have a usable shared Web Audio graph. */
        private EnsureAudioRuntime(): void
        {
            // Prototype promotion can bypass AudioComponent field initializers.
            // Bind the shared context directly through the protected field: this
            // keeps declaration emit valid and does not depend on a private/base
            // lifecycle helper having run first.
            if(!this._audioCtx)
                this._audioCtx = AudioComponentModule.AudioComponent.context;

            if(!this.OutputGain || !this.OutputPan || !this._input || !this._output)
                this._buildAudioGraph();
        }

        protected _buildAudioGraph(): void
        {
            if(!this._audioCtx)
                this._audioCtx = AudioComponentModule.AudioComponent.context;

            if(this.OutputGain && this.OutputPan)
            {
                this._input = this.OutputGain;
                this._output = this.OutputPan;
                return;
            }

            this.OutputGain = this._audioCtx.createGain();
            this.OutputPan = this._audioCtx.createStereoPanner();
            this.OutputGain.gain.value = 1;
            this.OutputPan.pan.value = 0;
            this.OutputGain.connect(this.OutputPan);
            this.OutputPan.connect(this._audioCtx.destination);
            this._input = this.OutputGain;
            this._output = this.OutputPan;
        }

        public async loadFile(source: File | string | ArrayBuffer): Promise<AudioBuffer>
        {
            this.EnsureAudioRuntime();
            let data: ArrayBuffer;
            if(typeof source === 'string')
            {
                const response = await fetch(source);
                if(!response.ok) throw new Error(`Unable to load audio: ${response.status}`);
                data = await response.arrayBuffer();
                this.LoadedName = this.NameFromUrl(source);
            }
            else if(source instanceof File)
            {
                data = await source.arrayBuffer();
                this.LoadedName = source.name;
            }
            else data = source;

            const buffer = await this._audioCtx.decodeAudioData(data.slice(0));
            this.setBuffer(buffer, false);
            return buffer;
        }

        public async setSource(url: string): Promise<void>
        {
            if(this.getAttribute('src') !== url) this.setAttribute('src', url);
            try
            {
                await this.loadFile(url);
                this.Emit('arianna:waveform-load', { src: url, duration: this.Buffer?.duration ?? 0 });
            }
            catch(error)
            {
                if(this.StatusText) this.StatusText.textContent = 'source unavailable · use Load';
                this.Draw();
                this.Emit('arianna:waveform-error', { error });
            }
        }

        public setBuffer(buffer: AudioBuffer, pushUndo = false): void
        {
            if(pushUndo && this.Buffer) this.PushUndo();
            else if(!pushUndo) { this.UndoStack.length = 0; this.RedoStack.length = 0; }
            this.Buffer = buffer;
            this.Start = 0;
            this.End = Math.min(1, Math.max(.001, (1 / this.Zoom) * .42));
            this.Current = 0;
            this.Scroll = 0;
            this.UpdateScrollBounds();
            this.UpdateStatus();
            this.SyncSelection();
            this.Draw();
        }

        public getBuffer(): AudioBuffer | null { return this.Buffer ?? null; }

        public getSelection(): Types.Selection
        {
            return { start: this.Start, end: this.End };
        }

        public setSelection(start: number, end: number): void
        {
            this.Start = this.Clamp(Math.min(start, end), 0, 1);
            this.End = this.Clamp(Math.max(start, end), 0, 1);
            this.SyncSelection();
            this.UpdateStatus();
            this.Emit('arianna:waveform-selection', { start: this.Start, end: this.End });
        }

        public selectAll(): void { this.setSelection(0, 1); }

        public get currentTime(): number
        {
            return this.Buffer ? this.Current * this.Buffer.duration : 0;
        }

        public get playing(): boolean { return Boolean(this.Source); }

        public get Density(): number { return this.Zoom; }
        public set Density(value: number) { this.setZoom(value); }
        public get density(): number { return this.Zoom; }
        public set density(value: number) { this.setZoom(value); }

        public setTool(tool: Tool): this
        {
            this.Tool = tool;
            this.dataset.tool = tool;
            this.querySelectorAll<HTMLElement>('.WaveformEditor-Button[data-tool]').forEach(button =>
                button.dataset.active = String(button.dataset.tool === tool));
            this.Emit('arianna:waveform-tool', { tool });
            return this;
        }

        public seek(seconds: number): void
        {
            if(!this.Buffer) return;
            const wasPlaying = this.playing;
            this.Current = this.Clamp(seconds / Math.max(.001, this.Buffer.duration), 0, 1);
            this.SyncPlayhead();
            this.UpdateStatus();
            this.Emit('arianna:waveform-seek', { current: this.currentTime });
            if(wasPlaying) void this.StartPlayback(this.Current, this.PlaybackEnd);
        }

        public async play(): Promise<void>
        {
            if(!this.Buffer) return;
            if(this.Current >= 1) this.Current = 0;
            await this.StartPlayback(this.Current, 1);
        }

        public pause(): void
        {
            if(!this.Source) return;
            this.UpdateCurrentFromClock();
            this.StopSource(false);
            this.Emit('arianna:waveform-pause', { current: this.currentTime });
        }

        public togglePlayback(): void
        {
            if(this.playing) this.pause();
            else void this.play();
        }

        public async playSelection(): Promise<void>
        {
            if(!this.Buffer) return;
            this.Current = this.Start;
            await this.StartPlayback(this.Start, this.End);
        }

        public stop(): void
        {
            this.StopSource(false);
            this.Current = 0;
            this.SyncPlayhead();
            this.UpdateStatus();
            this.Emit('arianna:waveform-stop', { current: 0 });
        }

        private async StartPlayback(startNormalized: number, endNormalized: number): Promise<void>
        {
            if(!this.Buffer) return;
            this.EnsureAudioRuntime();
            // This executes from the toolbar's user gesture. Resume the exact
            // context used by the editor, not merely an unrelated shared handle.
            if(this._audioCtx.state !== 'running')
                await this._audioCtx.resume().catch(() => undefined);
            this.StopSource(false);

            const start = this.Clamp(startNormalized, 0, 1);
            const end = this.Clamp(Math.max(start + .000001, endNormalized), 0, 1);
            const startSeconds = start * this.Buffer.duration;
            const duration = Math.max(.01, (end - start) * this.Buffer.duration);

            const source = this._audioCtx.createBufferSource();
            source.buffer = this.Buffer;
            const audibleInput = this.OutputGain ?? this._input;
            if(audibleInput) source.connect(audibleInput);
            else source.connect(this._audioCtx.destination);

            this.Current = start;
            this.PlaybackStart = start;
            this.PlaybackEnd = end;
            this.StartedAt = performance.now();
            this.Source = source;
            if(this.PlayButton)
            {
                this.PlayButton.textContent = '❚❚';
                this.PlayButton.dataset.active = 'true';
            }
            source.onended = () =>
            {
                if(this.Source !== source) return;
                this.Current = this.PlaybackEnd;
                this.Source = undefined;
                if(this.PlayButton)
                {
                    this.PlayButton.textContent = '▶';
                    this.PlayButton.dataset.active = 'false';
                }
                if(this.Raf) cancelAnimationFrame(this.Raf);
                this.Raf = 0;
                this.SyncPlayhead();
                this.UpdateStatus();
                this.Emit('arianna:waveform-stop', { current: this.currentTime });
            };
            source.start(0, startSeconds, Math.min(duration, Math.max(.01, this.Buffer.duration - startSeconds)));
            this.AnimatePlayhead(duration);
            this.Emit('arianna:waveform-play', { start: startSeconds, duration });
        }

        private StopSource(clearHandler = true): void
        {
            const source = this.Source;
            if(source)
            {
                if(clearHandler) source.onended = null;
                else source.onended = null;
                try { source.stop(); } catch {}
            }
            this.Source = undefined;
            if(this.PlayButton)
            {
                this.PlayButton.textContent = '▶';
                this.PlayButton.dataset.active = 'false';
            }
            if(this.Raf) cancelAnimationFrame(this.Raf);
            this.Raf = 0;
            this.SyncPlayhead();
        }

        public copy(): void
        {
            if(!this.Buffer) return;
            const { start, end } = this.SelectionSamples();
            if(end <= start) return;
            this.Clipboard = this.SnapshotRange(start, end);
            this.Emit('arianna:waveform-copy', { start, end });
        }

        public cut(): void
        {
            if(!this.Buffer) return;
            this.copy();
            this.deleteSelection();
            this.Emit('arianna:waveform-cut');
        }

        public paste(): void
        {
            if(!this.Buffer || !this.Clipboard) return;
            this.PushUndo();
            const current = this.Buffer;
            const selection = this.SelectionSamples();
            const insertAt = selection.start;
            const removeCount = Math.max(0, selection.end - selection.start);
            const clipLength = this.Clipboard.channels[0]?.length ?? 0;
            const nextLength = Math.max(1, current.length - removeCount + clipLength);
            const next = this._audioCtx.createBuffer(current.numberOfChannels, nextLength, current.sampleRate);

            for(let channel = 0; channel < current.numberOfChannels; channel++)
            {
                const source = current.getChannelData(channel);
                const destination = next.getChannelData(channel);
                destination.set(source.subarray(0, insertAt), 0);
                const clip = this.Clipboard.channels[Math.min(channel, this.Clipboard.channels.length - 1)];
                if(clip) destination.set(clip, insertAt);
                destination.set(source.subarray(selection.end), insertAt + clipLength);
            }

            this.Buffer = next;
            this.Start = insertAt / next.length;
            this.End = Math.min(1, (insertAt + clipLength) / next.length);
            this.AfterEdit('paste');
        }

        public deleteSelection(): void
        {
            if(!this.Buffer) return;
            const selection = this.SelectionSamples();
            if(selection.end <= selection.start) return;
            this.PushUndo();
            const current = this.Buffer;
            const removeCount = selection.end - selection.start;
            const nextLength = Math.max(1, current.length - removeCount);
            const next = this._audioCtx.createBuffer(current.numberOfChannels, nextLength, current.sampleRate);
            for(let channel = 0; channel < current.numberOfChannels; channel++)
            {
                const source = current.getChannelData(channel);
                const destination = next.getChannelData(channel);
                destination.set(source.subarray(0, selection.start), 0);
                destination.set(source.subarray(selection.end), selection.start);
            }
            this.Buffer = next;
            this.Start = Math.min(1, selection.start / next.length);
            this.End = this.Start;
            this.AfterEdit('delete');
        }

        public cropSelection(): void
        {
            if(!this.Buffer) return;
            const selection = this.SelectionSamples();
            if(selection.end <= selection.start) return;
            this.PushUndo();
            const snapshot = this.SnapshotRange(selection.start, selection.end);
            this.Buffer = this.BufferFromSnapshot(snapshot);
            this.Start = 0;
            this.End = 1;
            this.AfterEdit('crop');
        }

        public fade(kind: 'in' | 'out'): void
        {
            if(!this.Buffer) return;
            const selection = this.SelectionSamples();
            if(selection.end <= selection.start) return;
            this.PushUndo();
            const span = Math.max(1, selection.end - selection.start - 1);
            for(let channel = 0; channel < this.Buffer.numberOfChannels; channel++)
            {
                const data = this.Buffer.getChannelData(channel);
                for(let i = selection.start; i < selection.end; i++)
                {
                    const t = (i - selection.start) / span;
                    data[i] *= kind === 'in' ? t : 1 - t;
                }
            }
            this.AfterEdit(kind === 'in' ? 'fade-in' : 'fade-out');
        }

        public normalize(targetDb = -1): void
        {
            if(!this.Buffer) return;
            const selection = this.SelectionSamples();
            if(selection.end <= selection.start) return;
            let peak = 0;
            for(let channel = 0; channel < this.Buffer.numberOfChannels; channel++)
            {
                const data = this.Buffer.getChannelData(channel);
                for(let i = selection.start; i < selection.end; i++) peak = Math.max(peak, Math.abs(data[i] ?? 0));
            }
            if(peak <= 0) return;
            this.PushUndo();
            const target = Math.pow(10, targetDb / 20);
            const gain = target / peak;
            this.ApplyGainLinear(gain, selection.start, selection.end);
            this.AfterEdit('normalize');
        }

        public gain(db: number): void
        {
            if(!this.Buffer) return;
            const selection = this.SelectionSamples();
            if(selection.end <= selection.start) return;
            this.PushUndo();
            this.ApplyGainLinear(Math.pow(10, db / 20), selection.start, selection.end);
            this.AfterEdit('gain', { db });
        }

        public reverse(): void
        {
            if(!this.Buffer) return;
            const selection = this.SelectionSamples();
            if(selection.end <= selection.start) return;
            this.PushUndo();
            for(let channel = 0; channel < this.Buffer.numberOfChannels; channel++)
            {
                const data = this.Buffer.getChannelData(channel);
                let left = selection.start;
                let right = selection.end - 1;
                while(left < right)
                {
                    const value = data[left];
                    data[left] = data[right];
                    data[right] = value;
                    left++; right--;
                }
            }
            this.AfterEdit('reverse');
        }

        public insertSilence(durationSeconds = 1): void
        {
            if(!this.Buffer) return;
            this.PushUndo();
            const current = this.Buffer;
            const selection = this.SelectionSamples();
            const at = selection.start;
            const removeCount = Math.max(0, selection.end - selection.start);
            const silenceLength = Math.max(1, Math.round(durationSeconds * current.sampleRate));
            const nextLength = Math.max(1, current.length - removeCount + silenceLength);
            const next = this._audioCtx.createBuffer(current.numberOfChannels, nextLength, current.sampleRate);
            for(let channel = 0; channel < current.numberOfChannels; channel++)
            {
                const source = current.getChannelData(channel);
                const destination = next.getChannelData(channel);
                destination.set(source.subarray(0, at), 0);
                destination.set(source.subarray(selection.end), at + silenceLength);
            }
            this.Buffer = next;
            this.Start = at / next.length;
            this.End = (at + silenceLength) / next.length;
            this.AfterEdit('silence', { durationSeconds });
        }

        public undo(): void
        {
            if(!this.Buffer || this.UndoStack.length === 0) return;
            this.RedoStack.push(this.SnapshotBuffer(this.Buffer));
            const snapshot = this.UndoStack.pop();
            if(!snapshot) return;
            this.Buffer = this.BufferFromSnapshot(snapshot);
            this.AfterHistory('undo');
        }

        public redo(): void
        {
            if(!this.Buffer || this.RedoStack.length === 0) return;
            this.UndoStack.push(this.SnapshotBuffer(this.Buffer));
            const snapshot = this.RedoStack.pop();
            if(!snapshot) return;
            this.Buffer = this.BufferFromSnapshot(snapshot);
            this.AfterHistory('redo');
        }

        public setZoom(value: number): void
        {
            this.Zoom = this.Clamp(value, ZOOM_MIN, ZOOM_MAX);
            if(this.getAttribute('zoom') !== String(this.Zoom)) this.setAttribute('zoom', String(this.Zoom));
            this.Scroll = this.Clamp(this.Scroll, 0, this.MaxScroll());
            this.SyncZoomControls();
            this.SyncSelection();
            this.Draw();
            this.Emit('arianna:waveform-zoom', { zoom: this.Zoom, scroll: this.Scroll });
        }

        private Render(): void
        {
            // WaveformEditor is a single-file editor; it must not embed a mixer ChannelStrip.
            this.querySelectorAll('arianna-channel-strip, .ChannelStrip')
                .forEach(node => node.remove());
            if(this.querySelector(':scope > .WaveformEditor-Toolbar')) return;
            this.tabIndex = this.tabIndex >= 0 ? this.tabIndex : 0;

            const toolbar = document.createElement('div'); toolbar.className = 'WaveformEditor-Toolbar';
            const title = document.createElement('span'); title.className = 'WaveformEditor-Title'; title.textContent = 'Waveform Editor';
            const selectTool = this.Button('Select'); selectTool.dataset.tool = 'select'; selectTool.dataset.active = String(this.Tool === 'select');
            const drawTool = this.Button('Pencil'); drawTool.dataset.tool = 'draw'; drawTool.dataset.active = String(this.Tool === 'draw');
            const load = this.Button('+ Load');
            const back = this.Button('◀◀'); back.title = 'Back 5 seconds';
            const play = this.Button('▶');
            this.PlayButton = play;
            const stop = this.Button('■');
            const forward = this.Button('▶▶'); forward.title = 'Forward 5 seconds';
            const sep1 = this.Separator();
            const cut = this.Button('Cut');
            const copy = this.Button('Copy');
            const paste = this.Button('Paste');
            const del = this.Button('Del');
            const crop = this.Button('Crop');
            const sep2 = this.Separator();
            const fadeIn = this.Button('Fade In');
            const fadeOut = this.Button('Fade Out');
            const normalize = this.Button('Normalize');
            const gain = this.Button('+3 dB');
            const reverse = this.Button('Reverse');
            const silence = this.Button('Silence');
            const sep3 = this.Separator();
            const undo = this.Button('↶');
            const redo = this.Button('↷');
            const fill = document.createElement('span'); fill.className = 'WaveformEditor-Fill';
            toolbar.append(title, selectTool, drawTool, load, back, play, stop, forward, sep1, cut, copy, paste, del, crop, sep2, fadeIn, fadeOut, normalize, gain, reverse, silence, sep3, undo, redo, fill);

            this.FileInput = document.createElement('input');
            this.FileInput.type = 'file';
            this.FileInput.accept = 'audio/*';
            this.FileInput.hidden = true;
            toolbar.append(this.FileInput);

            const body = document.createElement('div'); body.className = 'WaveformEditor-Body';
            const main = document.createElement('div'); main.className = 'WaveformEditor-Main';
            this.CanvasWrap = document.createElement('div'); this.CanvasWrap.className = 'WaveformEditor-CanvasWrap';
            this.Canvas = document.createElement('canvas'); this.Canvas.className = 'WaveformEditor-Canvas';
            const ruler = document.createElement('div'); ruler.className = 'WaveformEditor-Ruler';
            const channelLine = document.createElement('div'); channelLine.className = 'WaveformEditor-ChannelLine';
            this.Selection = document.createElement('div'); this.Selection.className = 'WaveformEditor-Selection';
            this.Playhead = document.createElement('div'); this.Playhead.className = 'WaveformEditor-Playhead';
            this.CanvasWrap.append(this.Canvas, ruler, channelLine, this.Selection, this.Playhead);

            const status = document.createElement('div'); status.className = 'WaveformEditor-Status';
            this.StatusText = document.createElement('span'); this.StatusText.className = 'WaveformEditor-StatusText';
            const statusFill = document.createElement('span'); statusFill.className = 'WaveformEditor-StatusFill';
            this.ScrollInput = document.createElement('input');
            this.ScrollInput.className = 'WaveformEditor-Scroll';
            this.ScrollInput.type = 'range'; this.ScrollInput.min = '0'; this.ScrollInput.max = '1000'; this.ScrollInput.step = '1'; this.ScrollInput.value = '0';
            const density = document.createElement('label'); density.className = 'WaveformEditor-Density';
            const densityLabel = document.createElement('span'); densityLabel.className = 'WaveformEditor-DensityLabel'; densityLabel.textContent = 'Density';
            this.DensityInput = document.createElement('input'); this.DensityInput.className = 'WaveformEditor-DensityInput';
            this.DensityInput.type = 'range'; this.DensityInput.min = String(ZOOM_MIN); this.DensityInput.max = String(ZOOM_MAX); this.DensityInput.step = '0.25';
            this.DensityValue = document.createElement('span'); this.DensityValue.className = 'WaveformEditor-DensityValue';
            density.append(densityLabel, this.DensityInput, this.DensityValue);
            status.append(this.StatusText, statusFill, this.ScrollInput, density);
            main.append(this.CanvasWrap, status);
            body.append(main);
            // Component children belong to add(); append() is AriannA's
            // single-parent operation and must never be used as DOM append here.
            this.add(toolbar, body);

            selectTool.addEventListener('click', () => this.setTool('select'));
            drawTool.addEventListener('click', () => this.setTool('draw'));

            load.addEventListener('click', () => this.FileInput?.click());
            this.FileInput.addEventListener('change', () =>
            {
                const file = this.FileInput?.files?.[0];
                if(file) void this.loadFile(file).then(() => this.Emit('arianna:waveform-load', { file })).catch(error => this.Emit('arianna:waveform-error', { error }));
                if(this.FileInput) this.FileInput.value = '';
            });
            play.addEventListener('click', async () =>
            {
                if(this.playing) this.pause();
                else await this.play();
            });
            stop.addEventListener('click', () => this.stop());
            back.addEventListener('click', () => this.seek(this.currentTime - 5));
            forward.addEventListener('click', () => this.seek(this.currentTime + 5));
            cut.addEventListener('click', () => this.cut());
            copy.addEventListener('click', () => this.copy());
            paste.addEventListener('click', () => this.paste());
            del.addEventListener('click', () => this.deleteSelection());
            crop.addEventListener('click', () => this.cropSelection());
            fadeIn.addEventListener('click', () => this.fade('in'));
            fadeOut.addEventListener('click', () => this.fade('out'));
            normalize.addEventListener('click', () => this.normalize(-1));
            gain.addEventListener('click', () => this.gain(3));
            reverse.addEventListener('click', () => this.reverse());
            silence.addEventListener('click', () => this.insertSilence(1));
            undo.addEventListener('click', () => this.undo());
            redo.addEventListener('click', () => this.redo());

            this.CanvasWrap.addEventListener('pointerdown', event => this.BeginCanvasInteraction(event));
            this.CanvasWrap.addEventListener('wheel', event => this.OnWheel(event), { passive: false });
            this.DensityInput.addEventListener('input', () => this.setZoom(Number(this.DensityInput?.value ?? 1)));
            this.ScrollInput.addEventListener('input', () =>
            {
                this.Scroll = this.MaxScroll() * (Number(this.ScrollInput?.value ?? 0) / 1000);
                this.SyncSelection();
                this.Draw();
            });
            this.addEventListener('keydown', event => this.OnKeyDown(event));

            if(typeof ResizeObserver !== 'undefined')
            {
                this.Resize = new ResizeObserver(() => { this.SyncSelection(); this.Draw(); });
                this.Resize.observe(this.CanvasWrap);
            }
            this.UpdateStatus();
            this.SyncSelection();
        }

        private OnKeyDown(event: KeyboardEvent): void
        {
            const modifier = event.metaKey || event.ctrlKey;
            const key = event.key.toLowerCase();
            if(modifier && key === 'z') { event.preventDefault(); event.shiftKey ? this.redo() : this.undo(); return; }
            if(modifier && key === 'c') { event.preventDefault(); this.copy(); return; }
            if(modifier && key === 'x') { event.preventDefault(); this.cut(); return; }
            if(modifier && key === 'v') { event.preventDefault(); this.paste(); return; }
            if(modifier && key === 'a') { event.preventDefault(); this.selectAll(); return; }
            if(event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); this.deleteSelection(); return; }
            if(event.code === 'Space') { event.preventDefault(); this.togglePlayback(); }
        }

        private BeginCanvasInteraction(event: PointerEvent): void
        {
            if(this.Tool === 'draw') this.BeginSampleEdit(event);
            else this.BeginSelection(event);
        }

        private BeginSampleEdit(event: PointerEvent): void
        {
            if(!this.Buffer || !this.CanvasWrap) return;
            event.preventDefault();
            this.focus();
            this.PushUndo();

            const rect = this.CanvasWrap.getBoundingClientRect();
            const buffer = this.Buffer;
            const channels = Math.max(1, buffer.numberOfChannels);
            let lastSample = -1;
            let lastValue = 0;
            let lastChannel = -1;

            const apply = (pointer: PointerEvent): void =>
            {
                const normalized = this.PositionFromClientX(pointer.clientX, rect);
                const sample = this.Clamp(Math.round(normalized * (buffer.length - 1)), 0, buffer.length - 1);
                const localY = this.Clamp(pointer.clientY - rect.top, 0, Math.max(1, rect.height - 1));
                const laneHeight = rect.height / channels;
                const channel = this.Clamp(Math.floor(localY / Math.max(1, laneHeight)), 0, channels - 1);
                const laneY = localY - channel * laneHeight;
                const value = this.Clamp(1 - (laneY / Math.max(1, laneHeight)) * 2, -1, 1);
                const data = buffer.getChannelData(channel);

                if(lastSample >= 0 && lastChannel === channel && lastSample !== sample)
                {
                    const from = Math.min(lastSample, sample);
                    const to = Math.max(lastSample, sample);
                    for(let index = from; index <= to; index++)
                    {
                        const ratio = (index - lastSample) / (sample - lastSample);
                        data[index] = this.Clamp(lastValue + (value - lastValue) * ratio, -1, 1);
                    }
                }
                else
                {
                    data[sample] = value;
                }

                lastSample = sample;
                lastValue = value;
                lastChannel = channel;
                this.Start = normalized;
                this.End = normalized;
                this.SyncSelection();
                this.Draw();
            };

            apply(event);
            const pointerId = event.pointerId;
            const move = (pointer: PointerEvent): void =>
            {
                if(pointer.pointerId !== pointerId) return;
                apply(pointer);
            };
            const up = (pointer: PointerEvent): void =>
            {
                if(pointer.pointerId !== pointerId) return;
                window.removeEventListener('pointermove', move, true);
                window.removeEventListener('pointerup', up, true);
                window.removeEventListener('pointercancel', up, true);
                this.AfterEdit('pencil');
            };
            window.addEventListener('pointermove', move, true);
            window.addEventListener('pointerup', up, true);
            window.addEventListener('pointercancel', up, true);
        }

        private BeginSelection(event: PointerEvent): void
        {
            if(!this.CanvasWrap) return;
            const wasPlaying = this.playing;
            this.focus();
            const rect = this.CanvasWrap.getBoundingClientRect();
            const initial = this.PositionFromClientX(event.clientX, rect);
            this.Start = initial;
            this.End = initial;
            this.Current = initial;
            this.SyncSelection();
            this.SyncPlayhead();
            const move = (moveEvent: PointerEvent): void =>
            {
                const value = this.PositionFromClientX(moveEvent.clientX, rect);
                this.Start = Math.min(initial, value);
                this.End = Math.max(initial, value);
                this.SyncSelection();
                this.UpdateStatus();
            };
            const up = (): void =>
            {
                window.removeEventListener('pointermove', move);
                window.removeEventListener('pointerup', up);
                this.Current = this.Start;
                this.SyncPlayhead();
                if(wasPlaying) void this.StartPlayback(this.Current, 1);
                this.Emit('arianna:waveform-selection', { start: this.Start, end: this.End });
            };
            window.addEventListener('pointermove', move);
            window.addEventListener('pointerup', up);
        }

        private OnWheel(event: WheelEvent): void
        {
            event.preventDefault();
            if(event.shiftKey || event.altKey)
            {
                const max = this.MaxScroll();
                this.Scroll = this.Clamp(this.Scroll + (event.deltaY > 0 ? .04 : -.04) / this.Zoom, 0, max);
                this.UpdateScrollBounds();
                this.SyncSelection();
                this.Draw();
                return;
            }
            const factor = event.deltaY > 0 ? .85 : 1.18;
            this.setZoom(this.Zoom * factor);
        }

        private NudgeSelection(seconds: number): void
        {
            if(!this.Buffer) return;
            const delta = seconds / this.Buffer.duration;
            const width = this.End - this.Start;
            let start = this.Clamp(this.Start + delta, 0, Math.max(0, 1 - width));
            let end = start + width;
            if(end > 1) { end = 1; start = Math.max(0, 1 - width); }
            this.setSelection(start, end);
        }

        private PushUndo(): void
        {
            if(!this.Buffer) return;
            this.UndoStack.push(this.SnapshotBuffer(this.Buffer));
            while(this.UndoStack.length > 50) this.UndoStack.shift();
            this.RedoStack.length = 0;
        }

        private SnapshotBuffer(buffer: AudioBuffer): Types.Snapshot
        {
            const channels: Types.Samples[] = [];
            for(let channel = 0; channel < buffer.numberOfChannels; channel++)
            {
                const source = buffer.getChannelData(channel);
                const copy: Types.Samples = new Float32Array(source.length);
                copy.set(source);
                channels.push(copy);
            }
            return { sampleRate: buffer.sampleRate, channels };
        }

        private SnapshotRange(start: number, end: number): Types.Snapshot
        {
            if(!this.Buffer) return { sampleRate: this._audioCtx.sampleRate, channels: [] };
            const channels: Types.Samples[] = [];
            const length = Math.max(0, end - start);
            for(let channel = 0; channel < this.Buffer.numberOfChannels; channel++)
            {
                const source = this.Buffer.getChannelData(channel).subarray(start, end);
                const copy: Types.Samples = new Float32Array(length);
                copy.set(source);
                channels.push(copy);
            }
            return { sampleRate: this.Buffer.sampleRate, channels };
        }

        private BufferFromSnapshot(snapshot: Types.Snapshot): AudioBuffer
        {
            const length = Math.max(1, snapshot.channels[0]?.length ?? 1);
            const buffer = this._audioCtx.createBuffer(Math.max(1, snapshot.channels.length), length, snapshot.sampleRate);
            snapshot.channels.forEach((channel, index) => buffer.getChannelData(index).set(channel));
            return buffer;
        }

        private SelectionSamples(): { start: number; end: number }
        {
            if(!this.Buffer) return { start: 0, end: 0 };
            const start = this.Clamp(Math.floor(this.Start * this.Buffer.length), 0, this.Buffer.length);
            const end = this.Clamp(Math.ceil(this.End * this.Buffer.length), start, this.Buffer.length);
            return { start, end };
        }

        private ApplyGainLinear(gain: number, start: number, end: number): void
        {
            if(!this.Buffer) return;
            for(let channel = 0; channel < this.Buffer.numberOfChannels; channel++)
            {
                const data = this.Buffer.getChannelData(channel);
                for(let i = start; i < end; i++) data[i] = this.Clamp((data[i] ?? 0) * gain, -1, 1);
            }
        }

        private AfterEdit(kind: string, detail: Record<string, unknown> = {}): void
        {
            this.Scroll = this.Clamp(this.Scroll, 0, this.MaxScroll());
            this.UpdateScrollBounds();
            this.SyncSelection();
            this.UpdateStatus();
            this.Draw();
            this.Emit('arianna:waveform-change', { kind, ...detail });
        }

        private AfterHistory(kind: string): void
        {
            this.Start = 0;
            this.End = Math.min(1, .4);
            this.Scroll = 0;
            this.UpdateScrollBounds();
            this.SyncSelection();
            this.UpdateStatus();
            this.Draw();
            this.Emit('arianna:waveform-change', { kind });
        }

        private Button(text: string): HTMLButtonElement
        {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'WaveformEditor-Button';
            button.textContent = text;
            return button;
        }

        private Separator(): HTMLElement
        {
            const separator = document.createElement('span');
            separator.className = 'WaveformEditor-Separator';
            return separator;
        }

        private SyncSelection(): void
        {
            const viewStart = this.Scroll;
            const viewWidth = 1 / this.Zoom;
            const viewEnd = viewStart + viewWidth;
            if(this.Selection)
            {
                const left = this.Clamp((this.Start - viewStart) / viewWidth, 0, 1);
                const right = this.Clamp((this.End - viewStart) / viewWidth, 0, 1);
                this.Selection.style.display = this.End < viewStart || this.Start > viewEnd ? 'none' : 'block';
                this.Selection.style.left = `${left * 100}%`;
                this.Selection.style.width = `${Math.max(0, right - left) * 100}%`;
                this.Selection.style.background = this.getAttribute('selection-color') || 'rgba(228,12,136,.18)';
            }
            if(this.Playhead)
            {
                const position = this.Clamp((this.Current - viewStart) / viewWidth, 0, 1);
                this.Playhead.style.left = `${position * 100}%`;
            }
        }

        private SyncZoomControls(): void
        {
            if(this.DensityInput) this.DensityInput.value = String(this.Zoom);
            if(this.DensityValue) this.DensityValue.textContent = `${this.Zoom.toFixed(this.Zoom < 10 ? 1 : 0)}×`;
            this.UpdateScrollBounds();
        }

        private UpdateScrollBounds(): void
        {
            const max = this.MaxScroll();
            this.Scroll = this.Clamp(this.Scroll, 0, max);
            if(this.ScrollInput)
            {
                this.ScrollInput.disabled = max <= 0;
                this.ScrollInput.value = max <= 0 ? '0' : String(Math.round((this.Scroll / max) * 1000));
            }
        }

        private UpdateStatus(): void
        {
            if(!this.StatusText) return;
            if(!this.Buffer)
            {
                this.StatusText.textContent = `${this.LoadedName} · loading…`;
                return;
            }
            const selectionSeconds = Math.max(0, this.End - this.Start) * this.Buffer.duration;
            this.StatusText.textContent = `${this.LoadedName} · ${this.Buffer.numberOfChannels}ch · ${this.Buffer.sampleRate}Hz · ${this.Buffer.duration.toFixed(2)}s · cursor ${this.currentTime.toFixed(2)}s · sel ${selectionSeconds.toFixed(2)}s`;
        }

        private SyncTheme(): void
        {
            /* Theme is expressed by the host attribute and stylesheet selectors. */
        }

        private Draw(): void
        {
            if(!this.Canvas) return;
            const rect = this.Canvas.getBoundingClientRect();
            const scale = Math.max(1, devicePixelRatio || 1);
            const width = Math.max(1, Math.floor(rect.width * scale));
            const height = Math.max(1, Math.floor(rect.height * scale));
            if(this.Canvas.width !== width) this.Canvas.width = width;
            if(this.Canvas.height !== height) this.Canvas.height = height;
            const context = this.Canvas.getContext('2d');
            if(!context) return;

            const light = this.Theme() === 'light';
            context.fillStyle = light ? '#fafafa' : '#202428';
            context.fillRect(0, 0, width, height);
            const wave = this.getAttribute('wave-color') || '#e40c88';
            const buffer = this.Buffer;

            if(!buffer)
            {
                context.strokeStyle = light ? '#c9ced3' : '#41484e';
                context.lineWidth = Math.max(1, scale * .5);
                context.beginPath();
                context.moveTo(0, height / 2);
                context.lineTo(width, height / 2);
                context.stroke();
                return;
            }

            const channels = Math.max(1, buffer.numberOfChannels);
            const laneHeight = height / channels;
            const viewStartSample = Math.floor(this.Scroll * buffer.length);
            const visibleSamples = Math.max(1, Math.floor(buffer.length / this.Zoom));
            const samplesPerPixel = visibleSamples / width;

            for(let channel = 0; channel < channels; channel++)
            {
                const data = buffer.getChannelData(channel);
                const top = channel * laneHeight;
                const middle = top + laneHeight / 2;
                context.strokeStyle = light ? '#d9dde0' : '#41484e';
                context.lineWidth = Math.max(1, scale * .5);
                context.beginPath(); context.moveTo(0, middle); context.lineTo(width, middle); context.stroke();
                context.fillStyle = wave;

                for(let x = 0; x < width; x++)
                {
                    const s0 = Math.min(data.length - 1, Math.floor(viewStartSample + x * samplesPerPixel));
                    const s1 = Math.min(data.length, Math.max(s0 + 1, Math.floor(viewStartSample + (x + 1) * samplesPerPixel)));
                    if(s0 >= data.length) break;
                    let min = 1;
                    let max = -1;
                    if(s1 - s0 <= 1)
                    {
                        const value = data[s0] ?? 0;
                        min = value; max = value;
                    }
                    else
                    {
                        for(let i = s0; i < s1; i++)
                        {
                            const value = data[i] ?? 0;
                            if(value < min) min = value;
                            if(value > max) max = value;
                        }
                    }
                    const amplitude = laneHeight * .44;
                    const y0 = middle - max * amplitude;
                    const y1 = middle - min * amplitude;
                    context.fillRect(x, y0, Math.max(1, scale), Math.max(1, y1 - y0));
                }
            }
        }

        private AnimatePlayhead(duration: number): void
        {
            const tick = (): void =>
            {
                if(!this.Source || !this.Buffer) return;
                const elapsed = (performance.now() - this.StartedAt) / 1000;
                const normalizedDelta = elapsed / Math.max(.001, this.Buffer.duration);
                this.Current = this.Clamp(this.PlaybackStart + normalizedDelta, this.PlaybackStart, this.PlaybackEnd);
                this.SyncPlayhead();
                this.UpdateStatus();
                if(elapsed < duration && this.Source) this.Raf = requestAnimationFrame(tick);
            };
            this.Raf = requestAnimationFrame(tick);
        }

        private UpdateCurrentFromClock(): void
        {
            if(!this.Source || !this.Buffer) return;
            const elapsed = (performance.now() - this.StartedAt) / 1000;
            this.Current = this.Clamp(this.PlaybackStart + elapsed / Math.max(.001, this.Buffer.duration), this.PlaybackStart, this.PlaybackEnd);
            this.SyncPlayhead();
        }

        private SyncPlayhead(): void
        {
            if(!this.Playhead) return;
            const viewWidth = 1 / this.Zoom;
            const left = ((this.Current - this.Scroll) / viewWidth) * 100;
            const visible = this.Current >= this.Scroll && this.Current <= this.Scroll + viewWidth;
            this.Playhead.style.display = visible ? 'block' : 'none';
            this.Playhead.style.left = `${this.Clamp(left, 0, 100)}%`;
        }

        private PositionFromClientX(clientX: number, rect: DOMRect): number
        {
            const local = this.Clamp((clientX - rect.left) / Math.max(1, rect.width), 0, 1);
            return this.Clamp(this.Scroll + local / this.Zoom, 0, 1);
        }

        private MaxScroll(): number { return Math.max(0, 1 - 1 / this.Zoom); }
        private Theme(): Types.Theme { return this.getAttribute('theme') === 'light' ? 'light' : 'dark'; }
        private Clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, value)); }
        private NameFromUrl(url: string): string
        {
            const tail = url.split('/').pop()?.split('?')[0] || 'Audio';
            return decodeURIComponent(tail) || 'Audio';
        }

        private Emit(type: string, detail: Record<string, unknown> = {}): void
        {
            this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: { ...detail, source: this } }));
        }

        public onUnmount(): void
        {
            this.stop();
            this.Resize?.disconnect();
            this.Resize = undefined;
            super.onUnmount();
        }
    }
}

export type WaveformEditorOptions = WaveformEditor.Interfaces.WaveformEditorOptions;
export default WaveformEditor;
