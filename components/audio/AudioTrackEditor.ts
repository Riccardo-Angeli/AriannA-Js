/**
 * @module components/audio/AudioTrackEditor
 * @version 2.0.0
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
import { Component, Css, Templates } from '../../core/index.ts';
import { AutomationLaneCollection, AutomationOverlay } from '../timeline/Automation.ts';
import type { AutomationLane } from '../timeline/Automation.ts';

const html = Templates.Template.Html;

const AudioPartWaveformCache = new Map<string, Promise<string>>();
const AudioPartBufferCache = new Map<string, Promise<AudioBuffer>>();

async function AudioPartBuffer(src: string, context: AudioContext): Promise<AudioBuffer>
{
    const key = new URL(src, document.baseURI).href;
    const cached = AudioPartBufferCache.get(key);
    if(cached) return cached;

    const promise = fetch(key).then(async response =>
    {
        if(!response.ok) throw new Error(`Unable to load audio: ${response.status}`);
        const bytes = await response.arrayBuffer();
        return context.decodeAudioData(bytes.slice(0));
    });
    AudioPartBufferCache.set(key, promise);
    try { return await promise; }
    catch(error) { AudioPartBufferCache.delete(key); throw error; }
}

async function AudioPartWaveformImage(src: string): Promise<string>
{
    const key = new URL(src, document.baseURI).href;
    const cached = AudioPartWaveformCache.get(key);
    if(cached) return cached;

    const promise = (async (): Promise<string> =>
    {
        const response = await fetch(key);
        if(!response.ok) throw new Error(`Unable to load audio waveform: ${response.status}`);
        const bytes = await response.arrayBuffer();

        const Constructor = window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if(!Constructor) return '';

        const context = new Constructor();
        try
        {
            const buffer = await context.decodeAudioData(bytes.slice(0));
            const canvas = document.createElement('canvas');
            canvas.width = 1200;
            canvas.height = 42;
            const graphics = canvas.getContext('2d');
            if(!graphics) return '';

            graphics.clearRect(0, 0, canvas.width, canvas.height);
            graphics.fillStyle = 'rgba(22,24,26,.64)';
            const middle = canvas.height / 2;
            const amplitude = canvas.height * .45;
            const channels = Math.max(1, buffer.numberOfChannels);

            for(let x = 0; x < canvas.width; x++)
            {
                const from = Math.floor((x / canvas.width) * buffer.length);
                const to = Math.max(from + 1, Math.floor(((x + 1) / canvas.width) * buffer.length));
                let min = 1;
                let max = -1;

                for(let channel = 0; channel < channels; channel++)
                {
                    const data = buffer.getChannelData(channel);
                    const step = Math.max(1, Math.floor((to - from) / 48));
                    for(let sample = from; sample < to && sample < data.length; sample += step)
                    {
                        const value = data[sample] ?? 0;
                        if(value < min) min = value;
                        if(value > max) max = value;
                    }
                }

                if(min > max) { min = 0; max = 0; }
                const y0 = middle - max * amplitude;
                const y1 = middle - min * amplitude;
                graphics.fillRect(x, y0, 1, Math.max(1, y1 - y0));
            }

            return canvas.toDataURL('image/png');
        }
        finally
        {
            try { await context.close(); } catch {}
        }
    })();

    AudioPartWaveformCache.set(key, promise);
    try { return await promise; }
    catch(error)
    {
        AudioPartWaveformCache.delete(key);
        throw error;
    }
}

export namespace AudioTrackEditor
{
    export namespace Types
    {
        export type Theme = 'dark' | 'light';
        export type EditMode = 'parts' | 'automation-select' | 'automation-draw';
    }

    export namespace Interfaces
    {
        export interface AudioPartOptions
        {
            start?: number;
            length?: number;
            label?: string;
            src?: string;
            color?: string;
            theme?: Types.Theme;
        }

        export interface AudioTrackOptions
        {
            name?: string;
            muted?: boolean;
            soloed?: boolean;
            color?: string;
            theme?: Types.Theme;
            beatPx?: number;
            trackHeight?: number;
            snap?: number;
            automations?: AutomationLane[];
            editMode?: Types.EditMode;
            activeAutomation?: string;
            automationRead?: boolean;
            automationWrite?: boolean;
        }

        export interface AudioTrackEditorOptions
        {
            tracks?: number;
            bars?: number;
            beatsPerBar?: number;
            beatPx?: number;
            trackHeight?: number;
            bpm?: number;
            theme?: Types.Theme;
            editMode?: Types.EditMode;
        }
    }

    export const AudioPartStyles = new Css.Stylesheet([
        new Css.Rule('.AudioPart', {
            '--AudioPart-Color': '#df756d',
            Background: 'color-mix(in srgb, var(--AudioPart-Color) 82%, #202328)',
            Border: '1px solid color-mix(in srgb, var(--AudioPart-Color) 68%, #111)', BorderRadius: '2px',
            Bottom: '5px', BoxShadow: 'inset 0 1px 0 rgba(255,255,255,.16),0 1px 2px rgba(0,0,0,.32)',
            BoxSizing: 'border-box', Color: '#201b1b', Cursor: 'grab', MinWidth: '12px', Overflow: 'hidden', Position: 'absolute', Top: '5px', TouchAction: 'none', UserSelect: 'none'
        }),
        new Css.Rule('.AudioPart-Label', {
            Color: 'rgba(20,22,24,.78)', Font: '700 9px/1 var(--arianna-font,system-ui,sans-serif)', Left: '5px', Overflow: 'hidden', Position: 'absolute', Right: '5px', TextOverflow: 'ellipsis', Top: '4px', WhiteSpace: 'nowrap', ZIndex: '2'
        }),
        new Css.Rule('.AudioPart-Waveform', {
            BackgroundImage: 'repeating-linear-gradient(to right,transparent 0 4px,rgba(30,31,33,.46) 4px 5px,transparent 5px 8px)',
            BackgroundPosition: 'center', BackgroundRepeat: 'no-repeat', BackgroundSize: '100% 100%',
            Bottom: '4px', Left: '4px', Opacity: '.84', Position: 'absolute', Right: '4px', Top: '15px'
        }),
        new Css.Rule('.AudioPart-DragPreview', {
            BorderColor: 'rgba(255,255,255,.92)', BoxShadow: '0 0 0 2px rgba(228,12,136,.72),0 8px 20px rgba(0,0,0,.42)',
            Opacity: '.9', PointerEvents: 'none', ZIndex: '40'
        }),
        new Css.Rule('.AudioPart[data-dragging="true"]', { Opacity: '.18' }),
        new Css.Rule('.AudioPart[selected]', {
            BoxShadow: 'inset 0 0 0 2px rgba(255,255,255,.72),0 0 0 1px #111,0 2px 6px rgba(0,0,0,.38)'
        }),
        new Css.Rule('.AudioPart-Resize', {
            Bottom: '0', Cursor: 'ew-resize', Position: 'absolute', Top: '0', Width: '7px', ZIndex: '4'
        }),
        new Css.Rule('.AudioPart-Resize[data-side="left"]', { Left: '0' }),
        new Css.Rule('.AudioPart-Resize[data-side="right"]', { Right: '0' }),
        new Css.Rule('.AudioPart-Resize:hover', { Background: 'rgba(255,255,255,.22)' }),
        new Css.Rule('arianna-audio-part[theme="light"], .AudioPart[theme="light"], arianna-audio-track[theme="light"] .AudioPart, .AudioTrack[theme="light"] .AudioPart, arianna-audio-track-editor[theme="light"] .AudioPart, .AudioTrackEditor[theme="light"] .AudioPart', {
            Background: 'var(--AudioPart-Color)',
            BorderColor: 'color-mix(in srgb, var(--AudioPart-Color) 82%, #5f666c)',
            BoxShadow: 'inset 0 1px 0 rgba(255,255,255,.46),0 1px 2px rgba(0,0,0,.13)', Color: '#202428'
        }),
        new Css.Rule('arianna-audio-track[data-edit-mode^="automation"] .AudioPart, .AudioTrack[data-edit-mode^="automation"] .AudioPart', {
            Background: 'color-mix(in srgb, var(--AudioPart-Color) 80%, #ffffff)',
            BorderColor: 'color-mix(in srgb, var(--AudioPart-Color) 70%, #8f969d)',
            Filter: 'saturate(.88)', Opacity: '1'
        })
    ]);

    @Component('arianna-audio-part', AudioPartStyles, {
        Shadow: false,
        Attributes: ['start', 'length', 'label', 'src', 'color', 'theme']
    })
    export class AudioPart extends HTMLElement
    {
        public static readonly Styles = AudioPartStyles;
        public template = html``;

        private _bound?: boolean;

        constructor(options: Interfaces.AudioPartOptions = {})
        {
            super();
            if(options.start != null) this.setAttribute('start', String(options.start));
            if(options.length != null) this.setAttribute('length', String(options.length));
            if(options.label) this.setAttribute('label', options.label);
            if(options.src) this.setAttribute('src', options.src);
            if(options.color) this.setAttribute('color', options.color);
            if(options.theme) this.setAttribute('theme', options.theme);
        }

        public onCreated(): void
        {
            if(this.isConnected) this.onConnected();
        }

        public onConnected(): void
        {
            this.classList.add('AudioPart');
            this.style.setProperty('--AudioPart-Color', this.getAttribute('color') || '#df756d');
            if(!this.hasAttribute('tabindex')) this.tabIndex = 0;
            this.Render();
            this.Position();
            this.BindInteraction();
            void this.EnsureWaveform();
        }

        public onAttributeChanged(name: string): void
        {
            if(!this.isConnected) return;
            if(name === 'start' || name === 'length') this.Position();
            else if(name === 'label')
            {
                const label = this.querySelector<HTMLElement>(':scope > .AudioPart-Label');
                if(label) label.textContent = this.getAttribute('label') || 'Audio';
            }
            else if(name === 'color')
                this.style.setProperty('--AudioPart-Color', this.getAttribute('color') || '#df756d');
            else if(name === 'src')
                void this.EnsureWaveform();
        }

        public get start(): number
        {
            const value = Number(this.getAttribute('start') ?? 0);
            return Number.isFinite(value) ? Math.max(0, value) : 0;
        }
        public set start(value: number)
        {
            this.setAttribute('start', String(Math.max(0, value)));
            this.Position();
        }

        public get length(): number
        {
            const value = Number(this.getAttribute('length') ?? 4);
            return Number.isFinite(value) ? Math.max(.125, value) : 4;
        }
        public set length(value: number)
        {
            this.setAttribute('length', String(Math.max(.125, value)));
            this.Position();
        }

        public snapshot(): Interfaces.AudioPartOptions
        {
            return {
                start: this.start,
                length: this.length,
                label: this.getAttribute('label') ?? undefined,
                src: this.getAttribute('src') ?? undefined,
                color: this.getAttribute('color') ?? undefined,
                theme: (this.getAttribute('theme') as Types.Theme | null) ?? undefined
            };
        }

        private Render(): void
        {
            if(this.querySelector(':scope > .AudioPart-Label')) return;
            const label = document.createElement('span');
            label.className = 'AudioPart-Label';
            label.textContent = this.getAttribute('label') || 'Audio';

            const waveform = document.createElement('span');
            waveform.className = 'AudioPart-Waveform';

            const left = document.createElement('span');
            left.className = 'AudioPart-Resize';
            left.dataset.side = 'left';
            left.title = 'Trim start';

            const right = document.createElement('span');
            right.className = 'AudioPart-Resize';
            right.dataset.side = 'right';
            right.title = 'Trim end';

            this.append(label, waveform, left, right);
        }

        private async EnsureWaveform(): Promise<void>
        {
            const waveform = this.querySelector<HTMLElement>(':scope > .AudioPart-Waveform');
            const src = this.getAttribute('src')?.trim();
            if(!waveform || !src) return;

            const token = new URL(src, document.baseURI).href;
            waveform.dataset.source = token;

            try
            {
                const image = await AudioPartWaveformImage(src);
                if(!image || waveform.dataset.source !== token || !this.isConnected) return;
                waveform.style.backgroundImage = `url("${image}")`;
                waveform.dataset.ready = 'true';
            }
            catch
            {
                if(waveform.dataset.source === token)
                {
                    waveform.removeAttribute('data-ready');
                    waveform.style.removeProperty('background-image');
                }
            }
        }

        private BindInteraction(): void
        {
            if(this._bound) return;
            this._bound = true;

            type DragState = {
                mode: 'move' | 'resize-left' | 'resize-right';
                pointerId: number;
                x: number;
                start: number;
                length: number;
                grabBeat: number;
            };

            let drag: DragState | null = null;
            let preview: HTMLDivElement | null = null;
            let previewLane: HTMLElement | null = null;
            let previewStart = 0;

            const clearPreview = (): void =>
            {
                preview?.remove();
                preview = null;
                previewLane = null;
                this.removeAttribute('data-dragging');
            };

            const laneAt = (event: PointerEvent): HTMLElement | null =>
            {
                const editor = this.closest('arianna-audio-track-editor, .AudioTrackEditor') as HTMLElement | null;

                // Standalone AudioPart / AudioTrack examples have no editor owner.
                // In that mode the current lane is the valid horizontal drag surface.
                if(!editor)
                {
                    const lane = this.closest('.AudioTrack-Lane') as HTMLElement | null;
                    if(!lane) return null;
                    const rect = lane.getBoundingClientRect();
                    return event.clientY >= rect.top - 28 && event.clientY <= rect.bottom + 28
                        ? lane
                        : null;
                }

                for(const element of document.elementsFromPoint(event.clientX, event.clientY))
                {
                    const lane = element.closest?.('.AudioTrack-Lane') as HTMLElement | null;
                    if(lane && editor.contains(lane)) return lane;
                }

                let best: HTMLElement | null = null;
                let bestDistance = Number.POSITIVE_INFINITY;
                for(const lane of Array.from(editor.querySelectorAll<HTMLElement>('.AudioTrack-Lane')))
                {
                    const rect = lane.getBoundingClientRect();
                    const distance =
                        event.clientY < rect.top ? rect.top - event.clientY :
                        event.clientY > rect.bottom ? event.clientY - rect.bottom : 0;
                    if(distance < bestDistance)
                    {
                        best = lane;
                        bestDistance = distance;
                    }
                }
                return bestDistance <= 28 ? best : null;
            };

            const ensurePreview = (): HTMLDivElement =>
            {
                if(preview) return preview;

                preview = document.createElement('div');
                preview.className = 'AudioPart AudioPart-DragPreview';
                preview.setAttribute('aria-hidden', 'true');
                preview.style.setProperty('--AudioPart-Color', this.getAttribute('color') || '#df756d');

                const label = document.createElement('span');
                label.className = 'AudioPart-Label';
                label.textContent = this.getAttribute('label') || 'Audio';

                const waveform = document.createElement('span');
                waveform.className = 'AudioPart-Waveform';
                const sourceWaveform = this.querySelector<HTMLElement>(':scope > .AudioPart-Waveform');
                if(sourceWaveform?.style.backgroundImage)
                {
                    waveform.style.backgroundImage = sourceWaveform.style.backgroundImage;
                    waveform.dataset.ready = 'true';
                }

                preview.append(label, waveform);
                return preview;
            };

            const updateMovePreview = (event: PointerEvent): void =>
            {
                if(!drag || drag.mode !== 'move') return;
                const lane = laneAt(event);
                if(!lane)
                {
                    preview?.remove();
                    preview = null;
                    previewLane = null;
                    return;
                }

                const beatPx = this.BeatPx();
                const laneRect = lane.getBoundingClientRect();
                const raw = (event.clientX - laneRect.left) / beatPx - drag.grabBeat;

                const editor = this.closest('arianna-audio-track-editor, .AudioTrackEditor') as HTMLElement | null;
                const totalBeats = editor
                    ? (Number(editor.getAttribute('bars') ?? 16) || 16) * (Number(editor.getAttribute('beats-per-bar') ?? 4) || 4)
                    : Math.max(drag.length, Math.max(laneRect.width,lane.scrollWidth) / beatPx);
                const maxStart = Math.max(0, totalBeats - drag.length);

                previewStart = Math.max(0, Math.min(maxStart, this.Snap(raw)));
                previewLane = lane;

                const ghost = ensurePreview();
                ghost.style.position = 'absolute';
                ghost.style.width = `${Math.max(10, drag.length * beatPx)}px`;
                ghost.style.zIndex = '80';

                if(editor)
                {
                    // Editor mode: ghost lives above all lanes so cross-track drag is never clipped.
                    const editorRect = editor.getBoundingClientRect();
                    if(ghost.parentElement !== editor) editor.appendChild(ghost);
                    ghost.style.left = `${laneRect.left - editorRect.left + previewStart * beatPx}px`;
                    ghost.style.top = `${laneRect.top - editorRect.top + 5}px`;
                    ghost.style.bottom = 'auto';
                    ghost.style.height = `${Math.max(10, laneRect.height - 10)}px`;
                }
                else
                {
                    // Standalone AudioTrack mode: keep the preview inside the current lane.
                    if(ghost.parentElement !== lane) lane.append(ghost);
                    ghost.style.left = `${previewStart * beatPx}px`;
                    ghost.style.top = '5px';
                    ghost.style.bottom = '5px';
                    ghost.style.height = 'auto';
                }

                this.setAttribute('data-dragging', 'true');
            };

            const move = (event: PointerEvent): void =>
            {
                if(!drag || drag.pointerId !== event.pointerId) return;
                const beatPx = this.BeatPx();
                const delta = this.Snap((event.clientX - drag.x) / beatPx);

                if(drag.mode === 'move')
                {
                    const editor = this.closest('arianna-audio-track-editor, .AudioTrackEditor');
                    if(editor)
                    {
                        updateMovePreview(event);
                    }
                    else
                    {
                        // Standalone AudioPart/AudioTrack: move the REAL part live.
                        // This is deliberately independent of the editor-level ghost path and
                        // works reliably in Safari/WebKit as well as Chromium/Firefox.
                        const lane = this.closest('.AudioTrack-Lane') as HTMLElement | null;
                        const laneRect = lane?.getBoundingClientRect();
                        const totalBeats = laneRect ? Math.max(drag.length, Math.max(laneRect.width,lane?.scrollWidth??0) / beatPx) : Number.POSITIVE_INFINITY;
                        const maxStart = Number.isFinite(totalBeats) ? Math.max(0, totalBeats - drag.length) : Number.POSITIVE_INFINITY;
                        this.start = Math.max(0, Math.min(maxStart, this.Snap(drag.start + delta)));
                        this.Emit('arianna:audio-part-change', { mode: 'move' });
                    }
                }
                else if(drag.mode === 'resize-right')
                {
                    this.length = Math.max(.125, drag.length + delta);
                    this.Emit('arianna:audio-part-change', { mode: drag.mode });
                }
                else
                {
                    const end = drag.start + drag.length;
                    const nextStart = Math.max(0, Math.min(end - .125, drag.start + delta));
                    this.start = nextStart;
                    this.length = Math.max(.125, end - nextStart);
                    this.Emit('arianna:audio-part-change', { mode: drag.mode });
                }
            };

            const finish = (event: PointerEvent): void =>
            {
                if(!drag || drag.pointerId !== event.pointerId) return;

                const state = drag;
                drag = null;
                window.removeEventListener('pointermove', move, true);
                window.removeEventListener('pointerup', finish, true);
                window.removeEventListener('pointercancel', finish, true);
                this.style.cursor = '';
                try { this.releasePointerCapture(event.pointerId); } catch {}

                const cancelled = event.type === 'pointercancel';
                if(cancelled)
                {
                    this.start = state.start;
                    this.length = state.length;
                }
                else if(state.mode === 'move' && previewLane)
                {
                    previewLane.append(this);
                    this.start = previewStart;
                    this.onConnected?.();
                    this.Emit('arianna:audio-part-change', { mode: 'move' });
                }

                clearPreview();
                this.Emit('arianna:audio-part-commit', { mode: state.mode, cancelled });
            };

            this.addEventListener('click', event =>
            {
                event.stopPropagation();
                this.Select();
            });

            this.addEventListener('pointerdown', event =>
            {
                if(event.button !== 0) return;
                const track=this.closest('arianna-audio-track, .AudioTrack');
                if((track?.getAttribute('edit-mode')??'parts')!=='parts')return;

                const target = event.target as HTMLElement;
                const handle = target.closest('.AudioPart-Resize') as HTMLElement | null;
                const mode: DragState['mode'] =
                    handle?.dataset.side === 'left' ? 'resize-left' :
                    handle?.dataset.side === 'right' ? 'resize-right' : 'move';

                const beatPx = this.BeatPx();
                const rect = this.getBoundingClientRect();
                drag = {
                    mode,
                    pointerId: event.pointerId,
                    x: event.clientX,
                    start: this.start,
                    length: this.length,
                    grabBeat: Math.max(0, (event.clientX - rect.left) / beatPx)
                };

                this.Select();
                this.style.cursor = mode === 'move' ? 'grabbing' : 'ew-resize';
                event.preventDefault();
                event.stopPropagation();
                try { this.setPointerCapture(event.pointerId); } catch {}

                window.addEventListener('pointermove', move, true);
                window.addEventListener('pointerup', finish, true);
                window.addEventListener('pointercancel', finish, true);

                if(mode === 'move' && this.closest('arianna-audio-track-editor, .AudioTrackEditor')) updateMovePreview(event);
            });

            this.addEventListener('keydown', event =>
            {
                const primary = event.metaKey || event.ctrlKey;
                if(primary && event.key.toLowerCase() === 'c')
                {
                    event.preventDefault();
                    this.Emit('arianna:audio-part-copy');
                }
                else if(primary && event.key.toLowerCase() === 'x')
                {
                    event.preventDefault();
                    this.Emit('arianna:audio-part-cut');
                }
                else if(primary && event.key.toLowerCase() === 'v')
                {
                    event.preventDefault();
                    this.Emit('arianna:audio-part-paste');
                }
                else if(event.key === 'Delete' || event.key === 'Backspace')
                {
                    event.preventDefault();
                    this.Emit('arianna:audio-part-delete');
                }
                else if(event.key === 'ArrowLeft' || event.key === 'ArrowRight')
                {
                    event.preventDefault();
                    this.start = Math.max(0, this.start + (event.key === 'ArrowLeft' ? -.25 : .25) * (event.shiftKey ? 4 : 1));
                    this.Emit('arianna:audio-part-change', { mode: 'nudge' });
                }
            });
        }

        private Select(): void
        {
            const editor = this.closest('arianna-audio-track-editor, .AudioTrackEditor');
            editor?.querySelectorAll('arianna-audio-part, .AudioPart').forEach(part => part.toggleAttribute('selected', part === this));
            this.setAttribute('selected', '');
            this.focus();
            this.Emit('arianna:audio-part-select');
        }

        private BeatPx(): number
        {
            const editor = this.closest('arianna-audio-track-editor, .AudioTrackEditor');
            const track = this.closest('arianna-audio-track, .AudioTrack');
            const value = Number(editor?.getAttribute('beat-px') ?? track?.getAttribute('beat-px') ?? 28);
            return Number.isFinite(value) && value > 0 ? value : 28;
        }

        private Snap(value: number): number
        {
            const editor = this.closest('arianna-audio-track-editor, .AudioTrackEditor');
            const track = this.closest('arianna-audio-track, .AudioTrack');
            const snap = Number(editor?.getAttribute('snap') ?? track?.getAttribute('snap') ?? .25);
            const step = Number.isFinite(snap) && snap > 0 ? snap : .25;
            return Math.round(value / step) * step;
        }

        private Position(): void
        {
            const beatPx = this.BeatPx();
            this.style.left = `${this.start * beatPx}px`;
            this.style.width = `${Math.max(10, this.length * beatPx)}px`;
        }

        private Emit(type: string, detail: Record<string, unknown> = {}): void
        {
            this.dispatchEvent(new CustomEvent(type, {
                bubbles: true, composed: true,
                detail: { ...detail, part: this, source: this }
            }));
        }
    }

    export const AudioTrackStyles = new Css.Stylesheet([
        new Css.Rule('.AudioTrack', {
            '--AudioTrack-Color': '#df756d',
            Background: '#23272b', BorderBottom: '1px solid #101214', BoxSizing: 'border-box', Color: '#d9dde1',
            Display: 'grid', FontFamily: 'var(--arianna-font,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif)', GridTemplateColumns: '150px minmax(0,1fr)', MinHeight: '64px', Width: '100%'
        }),
        new Css.Rule('.AudioTrack-Header', {
            AlignItems: 'center', Background: 'linear-gradient(180deg,#30353a,#262a2e)', BorderRight: '1px solid #111315', Display: 'grid', Gap: '4px', GridTemplateColumns: '5px 1fr auto', Padding: '5px 6px 5px 0'
        }),
        new Css.Rule('.AudioTrack-Color', { AlignSelf: 'stretch', Background: 'var(--AudioTrack-Color)', BorderRadius: '0 1px 1px 0', GridRow: '1 / span 3' }),
        new Css.Rule('.AudioTrack-Name', { FontSize: '10px', FontWeight: '700', MinWidth: '0', Overflow: 'hidden', PaddingLeft: '4px', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap' }),
        new Css.Rule('.AudioTrack-Buttons', { Display: 'flex', Gap: '2px' }),
        new Css.Rule('.AudioTrack-Button', {
            Appearance: 'none', Background: 'linear-gradient(180deg,#41464b,#2d3135)', Border: '1px solid #151719', BorderRadius: '2px', Color: '#aeb6bd', Cursor: 'pointer', Font: '700 8px/1 var(--arianna-font,system-ui,sans-serif)', Height: '18px', Padding: '0', Width: '19px'
        }),
        new Css.Rule('.AudioTrack-Button[data-active="true"][data-action="mute"]', { Background: '#e2aa2f', BorderColor: '#a87612', Color: '#201a08' }),
        new Css.Rule('.AudioTrack-Button[data-active="true"][data-action="solo"]', { Background: '#6fc358', BorderColor: '#3c882a', Color: '#0d2208' }),
        new Css.Rule('.AudioTrack-Button[data-active="true"][data-action="record"]', { Background: '#d9564d', BorderColor: '#96332d', Color: '#fff' }),
        new Css.Rule('.AudioTrack-Button[data-active="true"][data-action="automation"], .AudioTrack-Button[data-active="true"][data-action="automation-read"]', { Background: '#4d9de0', BorderColor: '#266b9e', Color: '#fff' }),
        new Css.Rule('.AudioTrack-Button[data-active="true"][data-action="automation-write"]', { Background: '#d9564d', BorderColor: '#96332d', Color: '#fff' }),
        new Css.Rule('.AudioTrack-AutomationControls', { AlignItems: 'center', Display: 'grid', Gap: '2px', GridColumn: '2 / span 2', GridTemplateColumns: '19px minmax(42px,1fr) 19px 19px', MarginLeft: '4px', MinWidth: '0' }),
        new Css.Rule('.AudioTrack-AutomationSelect', { Appearance: 'none', Background: '#202428', Border: '1px solid #151719', BorderRadius: '2px', Color: '#cbd1d5', Font: '600 8px/1 var(--arianna-font,system-ui,sans-serif)', Height: '18px', MinWidth: '0', Padding: '0 15px 0 5px' }),
        new Css.Rule('.AudioTrack-Meter', { Background: '#0d1012', Border: '1px solid #0a0b0c', BorderRadius: '1px', GridColumn: '2 / span 1', Height: '5px', MarginLeft: '4px', Overflow: 'hidden', Position: 'relative' }),
        new Css.Rule('.AudioTrack-MeterFill', { Background: 'linear-gradient(to right,#42bd50,#b5cd3c,#d59b31)', Bottom: '0', Left: '0', Position: 'absolute', Top: '0', Width: '0%' }),
        new Css.Rule('.AudioTrack-Lane', {
            BackgroundColor: '#1e2226', BackgroundImage: 'linear-gradient(to right,rgba(151,160,169,.16) 1px,transparent 1px)', BackgroundSize: 'var(--AudioTrackEditor-BeatPx,28px) 100%', MinHeight: '64px', Overflow: 'hidden', Position: 'relative'
        }),
        new Css.Rule('.AudioTrack[data-edit-mode="parts"] .AudioTrack-Automation', { Display: 'none', Opacity: '0', PointerEvents: 'none' }),
        new Css.Rule('.AudioTrack[data-edit-mode^="automation"] .AudioTrack-Automation', { Opacity: '1', PointerEvents: 'auto' }),
        new Css.Rule('.AudioTrack[data-silenced="true"] .AudioTrack-Lane', { Opacity: '.42' }),
        new Css.Rule('arianna-audio-track[theme="light"], .AudioTrack[theme="light"], arianna-audio-track-editor[theme="light"] .AudioTrack, .AudioTrackEditor[theme="light"] .AudioTrack', { Background: '#e5e8ea', BorderBottomColor: '#bdc2c6', Color: '#2d3237' }),
        new Css.Rule('arianna-audio-track[theme="light"] .AudioTrack-Header, .AudioTrack[theme="light"] .AudioTrack-Header, arianna-audio-track-editor[theme="light"] .AudioTrack-Header, .AudioTrackEditor[theme="light"] .AudioTrack-Header', { Background: 'linear-gradient(180deg,#f7f8f9,#d9dde0)', BorderRightColor: '#bcc1c5' }),
        new Css.Rule('arianna-audio-track[theme="light"] .AudioTrack-Button, .AudioTrack[theme="light"] .AudioTrack-Button, arianna-audio-track-editor[theme="light"] .AudioTrack-Button, .AudioTrackEditor[theme="light"] .AudioTrack-Button', { Background: 'linear-gradient(180deg,#fff,#dfe2e5)', BorderColor: '#b8bdc2', Color: '#555c62' }),
        new Css.Rule('arianna-audio-track[theme="light"] .AudioTrack-AutomationSelect, .AudioTrack[theme="light"] .AudioTrack-AutomationSelect, arianna-audio-track-editor[theme="light"] .AudioTrack-AutomationSelect, .AudioTrackEditor[theme="light"] .AudioTrack-AutomationSelect', { Background: '#fff', BorderColor: '#b8bdc2', Color: '#343a40' }),
        new Css.Rule('arianna-audio-track[theme="light"] .AudioTrack-Button[data-active="true"][data-action="mute"], .AudioTrack[theme="light"] .AudioTrack-Button[data-active="true"][data-action="mute"], arianna-audio-track-editor[theme="light"] .AudioTrack-Button[data-active="true"][data-action="mute"], .AudioTrackEditor[theme="light"] .AudioTrack-Button[data-active="true"][data-action="mute"]', { Background: '#e2aa2f', BorderColor: '#a87612', Color: '#201a08' }),
        new Css.Rule('arianna-audio-track[theme="light"] .AudioTrack-Button[data-active="true"][data-action="solo"], .AudioTrack[theme="light"] .AudioTrack-Button[data-active="true"][data-action="solo"], arianna-audio-track-editor[theme="light"] .AudioTrack-Button[data-active="true"][data-action="solo"], .AudioTrackEditor[theme="light"] .AudioTrack-Button[data-active="true"][data-action="solo"]', { Background: '#6fc358', BorderColor: '#3c882a', Color: '#0d2208' }),
        new Css.Rule('arianna-audio-track[theme="light"] .AudioTrack-Button[data-active="true"][data-action="record"], .AudioTrack[theme="light"] .AudioTrack-Button[data-active="true"][data-action="record"], arianna-audio-track-editor[theme="light"] .AudioTrack-Button[data-active="true"][data-action="record"], .AudioTrackEditor[theme="light"] .AudioTrack-Button[data-active="true"][data-action="record"]', { Background: '#d9564d', BorderColor: '#96332d', Color: '#fff' }),
        new Css.Rule('arianna-audio-track[theme="light"] .AudioTrack-Button[data-active="true"][data-action="automation"], .AudioTrack[theme="light"] .AudioTrack-Button[data-active="true"][data-action="automation"], arianna-audio-track-editor[theme="light"] .AudioTrack-Button[data-active="true"][data-action="automation"], .AudioTrackEditor[theme="light"] .AudioTrack-Button[data-active="true"][data-action="automation"], arianna-audio-track[theme="light"] .AudioTrack-Button[data-active="true"][data-action="automation-read"], .AudioTrack[theme="light"] .AudioTrack-Button[data-active="true"][data-action="automation-read"], arianna-audio-track-editor[theme="light"] .AudioTrack-Button[data-active="true"][data-action="automation-read"], .AudioTrackEditor[theme="light"] .AudioTrack-Button[data-active="true"][data-action="automation-read"]', { Background: '#4d9de0', BorderColor: '#266b9e', Color: '#fff' }),
        new Css.Rule('arianna-audio-track[theme="light"] .AudioTrack-Button[data-active="true"][data-action="automation-write"], .AudioTrack[theme="light"] .AudioTrack-Button[data-active="true"][data-action="automation-write"], arianna-audio-track-editor[theme="light"] .AudioTrack-Button[data-active="true"][data-action="automation-write"], .AudioTrackEditor[theme="light"] .AudioTrack-Button[data-active="true"][data-action="automation-write"]', { Background: '#d9564d', BorderColor: '#96332d', Color: '#fff' }),
        new Css.Rule('arianna-audio-track[theme="light"] .AudioTrack-Lane, .AudioTrack[theme="light"] .AudioTrack-Lane, arianna-audio-track-editor[theme="light"] .AudioTrack-Lane, .AudioTrackEditor[theme="light"] .AudioTrack-Lane', { BackgroundColor: '#fafafa', BackgroundImage: 'linear-gradient(to right,#e2e4e6 1px,transparent 1px)' })
    ]);

    @Component('arianna-audio-track', AudioTrackStyles, {
        Shadow: false,
        Attributes: ['name', 'muted', 'soloed', 'color', 'theme', 'beat-px', 'snap', 'track-height', 'edit-mode', 'active-automation', 'automation-read', 'automation-write']
    })
    export class AudioTrack extends HTMLElement
    {
        public static readonly Styles = AudioTrackStyles;
        public template = html``;

        private Lane?: HTMLElement;
        private MeterFill?: HTMLElement;
        private GainNode?: GainNode;
        private PanNode?:StereoPannerNode;
        private Analyser?: AnalyserNode;
        private AudioContextRef?:AudioContext;
        private AudioEnabled=true;
        private LastAutomationTime=0;
        private ControlsBound?: boolean;
        private AutomationCollection=new AutomationLaneCollection();
        private AutomationView?:AutomationOverlay;
        private AutomationSelect?:HTMLSelectElement;

        /** Markup upgrades replace the prototype of an existing element and do
         * not execute TypeScript class-field initializers. Keep automation state
         * valid for both `new AudioTrack()` and declarative custom elements. */
        private EnsureAutomationState():void
        {
            if(!(this.AutomationCollection instanceof AutomationLaneCollection))
                this.AutomationCollection=new AutomationLaneCollection();
            if(typeof this.AudioEnabled!=='boolean')this.AudioEnabled=true;
            if(!Number.isFinite(this.LastAutomationTime))this.LastAutomationTime=0;
        }

        constructor(options: Interfaces.AudioTrackOptions = {})
        {
            super();
            this.EnsureAutomationState();
            if(options.name) this.setAttribute('name', options.name);
            if(options.muted) this.setAttribute('muted', '');
            if(options.soloed) this.setAttribute('soloed', '');
            if(options.color) this.setAttribute('color', options.color);
            if(options.theme) this.setAttribute('theme', options.theme);
            if(options.beatPx != null) this.setAttribute('beat-px', String(options.beatPx));
            if(options.trackHeight != null) this.setAttribute('track-height', String(options.trackHeight));
            if(options.snap != null) this.setAttribute('snap', String(options.snap));
            if(options.automations) this.automations=options.automations;
            if(options.editMode) this.editMode=options.editMode;
            if(options.activeAutomation) this.activeAutomation=options.activeAutomation;
            if(options.automationRead != null) this.automationRead=options.automationRead;
            if(options.automationWrite != null) this.automationWrite=options.automationWrite;
        }

        public onCreated(): void
        {
            this.EnsureAutomationState();
            if(this.isConnected) this.onConnected();
        }

        public onConnected(): void
        {
            this.EnsureAutomationState();
            this.classList.add('AudioTrack');
            if(!this.hasAttribute('edit-mode')) this.setAttribute('edit-mode','parts');
            if(!this.hasAttribute('automation-read')) this.setAttribute('automation-read','false');
            if(!this.hasAttribute('automation-write')) this.setAttribute('automation-write','false');
            this.style.setProperty('--AudioTrack-Color', this.getAttribute('color') || '#df756d');
            this.ApplyGrid();
            this.Render();
            this.BindControls();
            this.Sync();
            this.SyncScale();
            this.SyncAutomation();
        }

        public onAttributeChanged(name: string): void
        {
            if(!this.isConnected) return;

            if(name === 'name')
            {
                const label = this.querySelector<HTMLElement>(':scope > .AudioTrack-Header > .AudioTrack-Name');
                if(label) label.textContent = this.getAttribute('name') || 'Audio';
            }
            else if(name === 'color')
            {
                this.style.setProperty('--AudioTrack-Color', this.getAttribute('color') || '#df756d');
            }
            else if(name === 'track-height') this.SyncScale();
            else if(name === 'beat-px')
            {
                this.SyncScale();
                this.ApplyGrid();
                this.querySelectorAll<HTMLElement>(':scope > .AudioTrack-Lane > arianna-audio-part, :scope > .AudioTrack-Lane > .AudioPart')
                    .forEach(part => (part as AudioPart).onConnected?.());
                this.SyncAutomation();
            }
            else if(name === 'muted' || name === 'soloed')
            {
                this.Sync();
            }
            else if(name === 'edit-mode' || name === 'active-automation' || name === 'automation-read' || name === 'automation-write')
            {
                this.SyncAutomation();
            }
        }

        public get beatPx(): number
        {
            const value = Number(this.getAttribute('beat-px') ?? 28);
            return Number.isFinite(value) && value > 0 ? value : 28;
        }
        public set beatPx(value: number)
        {
            this.setAttribute('beat-px', String(Math.max(1, value)));
        }

        public get snap(): number
        {
            const value = Number(this.getAttribute('snap') ?? .25);
            return Number.isFinite(value) && value > 0 ? value : .25;
        }
        public set snap(value: number)
        {
            this.setAttribute('snap', String(Math.max(.001, value)));
        }

        public get editMode():Types.EditMode
        {
            const value=this.getAttribute('edit-mode');
            return value==='automation-select'||value==='automation-draw'?value:'parts';
        }
        public set editMode(value:Types.EditMode)
        {
            this.setAttribute('edit-mode',value==='automation-select'||value==='automation-draw'?value:'parts');
        }
        public get activeAutomation():string
        {
            this.EnsureAutomationState();
            const requested=this.getAttribute('active-automation')?.trim();
            return requested&&this.AutomationCollection.has(requested)?requested:(this.AutomationCollection.keys().next().value??'');
        }
        public set activeAutomation(value:string)
        {
            const id=String(value??'').trim();
            if(id)this.setAttribute('active-automation',id);else this.removeAttribute('active-automation');
        }
        public get automationRead():boolean{return this.getAttribute('automation-read')==='true';}
        public set automationRead(value:boolean){this.setAttribute('automation-read',String(!!value));}
        public get automationWrite():boolean{return this.getAttribute('automation-write')==='true';}
        public set automationWrite(value:boolean){this.setAttribute('automation-write',String(!!value));}
        public setEditMode(value:Types.EditMode):this{this.editMode=value;return this;}
        public selectAutomation(id:string,edit=true):this
        {
            this.activeAutomation=id;
            if(edit&&this.editMode==='parts')this.editMode='automation-select';
            this.SyncAutomation();
            return this;
        }

        public addPart(part: AudioPart): this
        {
            this.Render();
            this.Lane?.append(part);
            part.onConnected?.();
            this.SyncAutomation();
            return this;
        }

        /** Ordered, keyed automation data shared with video tracks and external processors. */
        public get automation():AutomationLaneCollection{this.EnsureAutomationState();return this.AutomationCollection;}
        public set automation(value:AutomationLaneCollection){this.AutomationCollection=value instanceof AutomationLaneCollection?value:new AutomationLaneCollection();this.SyncAutomation();}
        public get automations():AutomationLane[]{this.EnsureAutomationState();return this.AutomationCollection.snapshot();}
        public set automations(value:AutomationLane[]){this.EnsureAutomationState();this.AutomationCollection.replace(value??[]);this.SyncAutomation();}
        public setAutomationLanes(value:AutomationLane[]):this{this.automations=value;return this;}
        public addAutomationLane(value:AutomationLane):this{this.EnsureAutomationState();this.AutomationCollection.upsert(value);this.SyncAutomation();return this;}
        public removeAutomationLane(id:string):this{this.EnsureAutomationState();this.AutomationCollection.delete(id);this.SyncAutomation();return this;}
        public applyAutomation(time:number):this
        {
            this.EnsureAutomationState();
            this.LastAutomationTime=Math.max(0,Number(time)||0);
            if(this.automationRead)this.AutomationCollection.apply(this.LastAutomationTime);
            this.syncAudioGain();
            this.syncAudioPan();
            return this;
        }
        public automationValue(id:string,time?:number):number{return this.AutomationCollection.valueAt(id,time??this.LastAutomationTime);}
        public snapshot():Interfaces.AudioTrackOptions
        {
            return{name:this.getAttribute('name')??undefined,muted:this.hasAttribute('muted'),soloed:this.hasAttribute('soloed'),color:this.getAttribute('color')??undefined,theme:(this.getAttribute('theme') as Types.Theme|null)??undefined,beatPx:this.beatPx,trackHeight:this.trackHeight,snap:this.snap,automations:this.automations,editMode:this.editMode,activeAutomation:this.activeAutomation||undefined,automationRead:this.automationRead,automationWrite:this.automationWrite};
        }
        public addAudioAutomationPresets(duration=16):this
        {
            this.EnsureAutomationState();
            const presets:AutomationLane[]=[
                {id:'volume',label:'Volume',parameter:'volume',color:'#f5d547',min:0,max:1,defaultValue:1,points:[{time:0,value:1},{time:duration,value:1}]},
                {id:'gain',label:'Gain',parameter:'gain',color:'#7bc96f',min:0,max:2,defaultValue:1,points:[{time:0,value:1},{time:duration,value:1}]},
                {id:'pan',label:'Pan',parameter:'pan',color:'#4d9de0',min:-1,max:1,defaultValue:0,points:[{time:0,value:0},{time:duration,value:0}]},
                {id:'pitch',label:'Pitch',parameter:'pitch',color:'#d987e8',min:-24,max:24,defaultValue:0,points:[{time:0,value:0},{time:duration,value:0}]},
            ];
            for(const lane of presets)if(!this.AutomationCollection.has(lane.id))this.AutomationCollection.upsert(lane);
            this.SyncAutomation();return this;
        }

        public ensureAudio(context: AudioContext, destination: AudioNode): AudioNode
        {
            this.EnsureAutomationState();
            this.AudioContextRef=context;
            if(!this.GainNode)
            {
                this.GainNode = context.createGain();
                this.Analyser = context.createAnalyser();
                this.Analyser.fftSize = 256;
                if(typeof context.createStereoPanner==='function')
                {
                    this.PanNode=context.createStereoPanner();
                    this.GainNode.connect(this.PanNode);
                    this.PanNode.connect(this.Analyser);
                }
                else this.GainNode.connect(this.Analyser);
                this.Analyser.connect(destination);
            }
            this.syncAudioGain();
            this.syncAudioPan();
            return this.GainNode;
        }

        public setAudioEnabled(enabled: boolean): void
        {
            this.AudioEnabled=enabled;
            this.syncAudioGain();
        }

        public meterLevel(): number
        {
            if(!this.Analyser || this.hasAttribute('muted')) return 0;
            const data = new Uint8Array(this.Analyser.fftSize);
            this.Analyser.getByteTimeDomainData(data);
            let sum = 0;
            for(const value of data)
            {
                const sample = (value - 128) / 128;
                sum += sample * sample;
            }
            const rms = Math.sqrt(sum / Math.max(1, data.length));
            return rms < .002 ? 0 : Math.min(1, rms * 5.25);
        }

        public setMeter(level: number): void
        {
            if(this.MeterFill) this.MeterFill.style.width = `${Math.max(0, Math.min(1, level)) * 100}%`;
        }

        public get trackHeight(): number { return Math.max(48,Math.min(240,Number(this.getAttribute('track-height')) || 64)); }
        public set trackHeight(value: number) { this.setAttribute('track-height',String(value)); }
        private SyncScale(): void {
            const nested=!!this.closest('arianna-audio-track-editor');
            syncTimelineScales(this,'beat-px',this.beatPx,'track-height',this.trackHeight,nested);
            this.style.minWidth='0';
            if(this.Lane) {
                this.Lane.style.height=`${this.trackHeight}px`; this.Lane.style.minHeight='0';
                this.Lane.style.overflow=nested?'hidden':'auto';
                this.Lane.style.scrollbarGutter='stable';
            }
        }

        private ApplyGrid(): void
        {
            this.style.setProperty('--AudioTrackEditor-BeatPx', `${this.beatPx}px`);
        }

        private syncAudioGain(): void
        {
            if(!this.GainNode)return;
            const read=this.automationRead;
            const volume=read?this.AutomationCollection.valueAt('volume',this.LastAutomationTime):1;
            const gain=read?this.AutomationCollection.valueAt('gain',this.LastAutomationTime):1;
            const level=(Number.isFinite(volume)?volume:1)*(Number.isFinite(gain)?gain:1);
            const value=this.AudioEnabled&&!this.hasAttribute('muted')?Math.max(0,level):0;
            if(this.AudioContextRef)this.GainNode.gain.setTargetAtTime(value,this.AudioContextRef.currentTime,.005);
            else this.GainNode.gain.value=value;
        }

        private syncAudioPan():void
        {
            if(!this.PanNode)return;
            const value=this.automationRead?this.AutomationCollection.valueAt('pan',this.LastAutomationTime):0;
            const pan=Number.isFinite(value)?Math.max(-1,Math.min(1,value)):0;
            if(this.AudioContextRef)this.PanNode.pan.setTargetAtTime(pan,this.AudioContextRef.currentTime,.005);
            else this.PanNode.pan.value=pan;
        }

        private Render(): void
        {
            if(this.querySelector(':scope > .AudioTrack-Header')) return;
            const parts = Array.from(this.querySelectorAll(':scope > arianna-audio-part'));

            const header = document.createElement('div'); header.className = 'AudioTrack-Header';
            const color = document.createElement('span'); color.className = 'AudioTrack-Color';
            const name = document.createElement('span'); name.className = 'AudioTrack-Name'; name.textContent = this.getAttribute('name') || 'Audio';
            const buttons = document.createElement('span'); buttons.className = 'AudioTrack-Buttons';
            const mute = this.Button('M', 'mute'); const solo = this.Button('S', 'solo'); const record = this.Button('R', 'record'); buttons.append(mute, solo, record);
            const meter = document.createElement('span'); meter.className = 'AudioTrack-Meter'; this.MeterFill = document.createElement('span'); this.MeterFill.className = 'AudioTrack-MeterFill'; this.MeterFill.style.width = '0%'; meter.append(this.MeterFill);
            const automationControls=document.createElement('span');automationControls.className='AudioTrack-AutomationControls';
            const automation=this.Button('⌁','automation');automation.title='Toggle parts / automation editing';
            this.AutomationSelect=document.createElement('select');this.AutomationSelect.className='AudioTrack-AutomationSelect';this.AutomationSelect.title='Automation parameter';this.AutomationSelect.setAttribute('aria-label','Automation parameter');
            const read=this.Button('R','automation-read');read.title='Read automation';
            const write=this.Button('W','automation-write');write.title='Write automation';
            automationControls.append(automation,this.AutomationSelect,read,write);
            header.append(color, name, buttons, meter,automationControls);

            this.Lane = document.createElement('div'); this.Lane.className = 'AudioTrack-Lane';
            parts.forEach(part => this.Lane?.append(part));
            this.append(header, this.Lane);
            parts.forEach(part => (part as AudioPart).onConnected?.());
            this.SyncAutomation();
        }

        private SyncAutomation():void
        {
            this.EnsureAutomationState();
            this.dataset.editMode=this.editMode;
            if(!this.Lane)return;
            if(!this.AutomationCollection.size)
            {
                this.AutomationView?.remove();this.AutomationView=undefined;
                this.SyncAutomationControls();
                return;
            }
            let active=this.activeAutomation;
            if(!active||!this.AutomationCollection.has(active))
            {
                active=this.AutomationCollection.keys().next().value??'';
                if(active&&this.getAttribute('active-automation')!==active)this.setAttribute('active-automation',active);
            }
            for(const lane of this.AutomationCollection.values())
            {
                lane.visible=lane.id===active;
            }
            const automationVisible=this.editMode!=='parts';
            if(!automationVisible)
            {
                // Waveform mode owns the lane completely. Detaching the overlay,
                // rather than merely making it transparent, guarantees that it can
                // never intercept the first drag after mounting or a theme change.
                if(this.AutomationView)
                {
                    this.AutomationView.style.display='none';
                    this.AutomationView.style.pointerEvents='none';
                    this.AutomationView.style.opacity='0';
                    this.AutomationView.setAttribute('aria-hidden','true');
                    this.AutomationView.remove();
                }
                this.SyncAutomationControls();
                return;
            }
            if(!this.AutomationView)
            {
                this.AutomationView=new AutomationOverlay();
                this.AutomationView.classList.add('AudioTrack-Automation');
                this.AutomationView.addEventListener('dblclick',event=>
                {
                    if(this.editMode!=='automation-draw')
                    {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                    }
                },true);
            }
            if(this.AutomationView.parentElement!==this.Lane)this.Lane.append(this.AutomationView);
            const duration=Math.max(1,this.Lane.scrollWidth/this.beatPx);
            this.AutomationView.collection=this.AutomationCollection;
            this.AutomationView.configure({scale:this.beatPx,duration,snap:this.snap,active});
            this.AutomationView.style.display='block';
            this.AutomationView.style.pointerEvents='auto';
            this.AutomationView.style.opacity='1';
            this.AutomationView.setAttribute('aria-hidden','false');
            this.SyncAutomationControls();
        }

        private SyncAutomationControls():void
        {
            const select=this.AutomationSelect??this.querySelector<HTMLSelectElement>('.AudioTrack-AutomationSelect');
            if(select)
            {
                const active=this.activeAutomation;
                const signature=[...this.AutomationCollection.values()].map(lane=>`${lane.id}:${lane.label??lane.parameter??lane.id}`).join('|');
                if(select.dataset.signature!==signature)
                {
                    select.replaceChildren(...[...this.AutomationCollection.values()].map(lane=>
                    {
                        const option=document.createElement('option');option.value=lane.id;option.textContent=lane.label??lane.parameter??lane.id;return option;
                    }));
                    select.dataset.signature=signature;
                }
                select.disabled=!this.AutomationCollection.size;
                if(active)select.value=active;
            }
            this.querySelector<HTMLButtonElement>('[data-action="automation"]')?.setAttribute('data-active',String(this.editMode!=='parts'));
            this.querySelector<HTMLButtonElement>('[data-action="automation-read"]')?.setAttribute('data-active',String(this.automationRead));
            this.querySelector<HTMLButtonElement>('[data-action="automation-write"]')?.setAttribute('data-active',String(this.automationWrite));
        }

        private BindControls(): void
        {
            if(this.ControlsBound) return;
            this.ControlsBound = true;

            // Delegation is intentionally host-level instead of being tied to Render().
            // Markup-first upgrades and repeated onConnected() calls can reuse an existing
            // header; controls must remain live regardless of theme or render timing.
            this.addEventListener('click', event =>
            {
                const target = event.target as Element | null;
                const button = target?.closest?.('.AudioTrack-Button') as HTMLButtonElement | null;
                if(!button || !this.contains(button)) return;

                event.preventDefault();
                event.stopPropagation();

                const action = button.dataset.action;
                if(action === 'mute')
                {
                    this.toggleAttribute('muted');
                    this.Sync();
                    this.Emit('arianna:track-mute', { muted: this.hasAttribute('muted') });
                }
                else if(action === 'solo')
                {
                    this.toggleAttribute('soloed');
                    this.Sync();
                    this.Emit('arianna:track-solo', { soloed: this.hasAttribute('soloed') });
                }
                else if(action === 'record')
                {
                    const active = button.dataset.active !== 'true';
                    button.dataset.active = String(active);
                    this.Emit('arianna:track-record', { recording: active });
                }
                else if(action === 'automation')
                {
                    this.editMode=this.editMode==='parts'?'automation-select':'parts';
                    this.Emit('arianna:track-edit-mode',{editMode:this.editMode});
                }
                else if(action === 'automation-read')
                {
                    this.automationRead=!this.automationRead;
                    this.Emit('arianna:automation-read',{read:this.automationRead});
                }
                else if(action === 'automation-write')
                {
                    this.automationWrite=!this.automationWrite;
                    this.Emit('arianna:automation-write',{write:this.automationWrite});
                }
            });
            this.addEventListener('change',event=>
            {
                const select=(event.target as Element|null)?.closest?.('.AudioTrack-AutomationSelect') as HTMLSelectElement|null;
                if(!select||!this.contains(select))return;
                event.stopPropagation();
                this.selectAutomation(select.value,true);
                this.Emit('arianna:automation-select',{laneId:select.value,editMode:this.editMode});
            });
        }

        private Button(text: string, action: string): HTMLButtonElement
        {
            const button = document.createElement('button'); button.type = 'button'; button.className = 'AudioTrack-Button'; button.dataset.action = action; button.dataset.active = 'false'; button.textContent = text; return button;
        }

        private Sync(): void
        {
            this.querySelector<HTMLButtonElement>('[data-action="mute"]')?.setAttribute('data-active', String(this.hasAttribute('muted')));
            this.querySelector<HTMLButtonElement>('[data-action="solo"]')?.setAttribute('data-active', String(this.hasAttribute('soloed')));
            this.SyncAutomationControls();
            this.syncAudioGain();
        }

        private Emit(type: string, detail: Record<string, unknown> = {}): void { this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: { ...detail, track: this, source: this } })); }
    }

    export const AudioTrackEditorStyles = new Css.Stylesheet([
        new Css.Rule('.AudioTrackEditor', {
            '--AudioTrackEditor-BeatPx': '28px',
            Background: '#171a1d', Border: '1px solid #090b0d', BorderRadius: '5px', BoxShadow: 'inset 0 1px 0 rgba(255,255,255,.04),0 2px 8px rgba(0,0,0,.34)',
            BoxSizing: 'border-box', Color: '#dce0e3', Display: 'grid', FontFamily: 'var(--arianna-font,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif)', GridTemplateRows: '38px 24px minmax(260px,1fr)', MinHeight: '360px', Overflow: 'hidden', Position: 'relative', Width: '100%'
        }),
        new Css.Rule('.AudioTrackEditor-Toolbar', { AlignItems: 'center', Background: 'linear-gradient(180deg,#373c41,#272b2f)', BorderBottom: '1px solid #0f1113', Display: 'flex', Gap: '4px', Padding: '5px 7px' }),
        new Css.Rule('.AudioTrackEditor-Button', { Appearance: 'none', Background: 'linear-gradient(180deg,#464b50,#303439)', Border: '1px solid #15181a', BorderRadius: '3px', Color: '#dce0e3', Cursor: 'pointer', Font: '600 10px/1 var(--arianna-font,system-ui,sans-serif)', Height: '26px', MinWidth: '27px', Padding: '0 7px' }),
        new Css.Rule('.AudioTrackEditor-Button[data-active="true"]', { Background: '#4d98dd', BorderColor: '#246da9', Color: '#fff' }),
        new Css.Rule('.AudioTrackEditor-Time', { Background: '#111416', Border: '1px solid #0b0d0e', BorderRadius: '3px', Color: '#cae8fb', Font: '600 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace', MarginLeft: '4px', Padding: '7px 9px' }),
        new Css.Rule('.AudioTrackEditor-Fill', { Flex: '1 1 auto' }),
        new Css.Rule('.AudioTrackEditor-Ruler', { Background: '#292d31', BorderBottom: '1px solid #101214', Display: 'grid', GridTemplateColumns: '150px minmax(0,1fr)' }),
        new Css.Rule('.AudioTrackEditor-Corner', { BorderRight: '1px solid #111315' }),
        new Css.Rule('.AudioTrackEditor-RulerLane', { Color: '#929aa2', Cursor: 'ew-resize', Font: '9px/1 ui-monospace,SFMono-Regular,Menlo,monospace', Overflow: 'hidden', Position: 'relative', TouchAction: 'none', UserSelect: 'none' }),
        new Css.Rule('.AudioTrackEditor-Tick', { BorderLeft: '1px solid #535a61', Bottom: '0', Position: 'absolute', Top: '0' }),
        new Css.Rule('.AudioTrackEditor-TickLabel', { Left: '3px', Position: 'absolute', Top: '6px' }),
        new Css.Rule('.AudioTrackEditor-Body', { AlignItems: 'stretch', Display: 'flex', FlexDirection: 'column', MinHeight: '0', Overflow: 'auto', Position: 'relative', Width: '100%' }),
        new Css.Rule('.AudioTrackEditor-Playhead', { Background: '#e24d47', Bottom: '0', Left: '150px', PointerEvents: 'none', Position: 'absolute', Top: '0', Width: '1px', ZIndex: '10' }),
        new Css.Rule('.AudioTrackEditor-Playhead::before', { Background: '#e24d47', Content: '""', Height: '7px', Left: '-3px', Position: 'absolute', Top: '0', Width: '7px' }),
        new Css.Rule('arianna-audio-track-editor[theme="light"], .AudioTrackEditor[theme="light"]', { Background: '#eef0f2', BorderColor: '#b9bec3', BoxShadow: 'inset 0 1px 0 #fff,0 2px 8px rgba(0,0,0,.11)', Color: '#2b3035' }),
        new Css.Rule('arianna-audio-track-editor[theme="light"] .AudioTrackEditor-Toolbar, .AudioTrackEditor[theme="light"] .AudioTrackEditor-Toolbar', { Background: 'linear-gradient(180deg,#f9fafb,#dfe3e6)', BorderBottomColor: '#b9bec3' }),
        new Css.Rule('arianna-audio-track-editor[theme="light"] .AudioTrackEditor-Button, .AudioTrackEditor[theme="light"] .AudioTrackEditor-Button', { Background: 'linear-gradient(180deg,#fff,#e1e4e7)', BorderColor: '#b9bec3', Color: '#383e43' }),
        new Css.Rule('arianna-audio-track-editor[theme="light"] .AudioTrackEditor-Time, .AudioTrackEditor[theme="light"] .AudioTrackEditor-Time', { Background: '#fff', BorderColor: '#c1c6cb', Color: '#2f5368' }),
        new Css.Rule('arianna-audio-track-editor[theme="light"] .AudioTrackEditor-Ruler, .AudioTrackEditor[theme="light"] .AudioTrackEditor-Ruler', { Background: '#e4e7e9', BorderBottomColor: '#c3c8cc' }),
        new Css.Rule('arianna-audio-track-editor[theme="light"] .AudioTrackEditor-Corner, .AudioTrackEditor[theme="light"] .AudioTrackEditor-Corner', { BorderRightColor: '#c0c5c9' }),
        new Css.Rule('arianna-audio-track-editor[theme="light"] .AudioTrackEditor-RulerLane, .AudioTrackEditor[theme="light"] .AudioTrackEditor-RulerLane', { Color: '#697077' }),
        new Css.Rule('arianna-audio-track-editor[theme="light"] .AudioTrackEditor-Body, .AudioTrackEditor[theme="light"] .AudioTrackEditor-Body', { Background: '#f5f6f7' }),
        new Css.Rule('arianna-audio-track-editor[theme="light"] .AudioTrackEditor-Button[data-active="true"], .AudioTrackEditor[theme="light"] .AudioTrackEditor-Button[data-active="true"]', { Background: '#4d98dd', BorderColor: '#246da9', Color: '#fff' })
    ]);

    @Component('arianna-audio-track-editor', AudioTrackEditorStyles, {
        Shadow: false,
        Attributes: ['tracks', 'bars', 'beats-per-bar', 'beat-px', 'bpm', 'snap', 'theme', 'track-height', 'edit-mode']
    })
    export class AudioTrackEditor extends HTMLElement
    {
        public static readonly Styles = AudioTrackEditorStyles;
        public template = html``;

        private BeatPx?: number;
        private Bars?: number;
        private BeatsPerBar?: number;
        private PlayheadValue?: number;
        private Body?: HTMLElement;
        private Playhead?: HTMLElement;
        private Time?: HTMLElement;
        private _selectedPart?: AudioPart;
        private _clipboard?: Interfaces.AudioPartOptions;
        private _bound?: boolean;
        private Bpm = 120;
        private Context?: AudioContext;
        private Master?: GainNode;
        private ActiveSources:{source:AudioBufferSourceNode;track:AudioTrack}[] = [];
        private Playing = false;
        private PlaybackStartedAt = 0;
        private PlaybackStartBeat = 0;
        private PlaybackRaf = 0;
        private SeekingFromRuler = false;
        private PlayButton?: HTMLButtonElement;
        private PartsToolButton?:HTMLButtonElement;
        private AutomationToolButton?:HTMLButtonElement;
        private AutomationDrawButton?:HTMLButtonElement;

        constructor(options: Interfaces.AudioTrackEditorOptions = {})
        {
            super();
            this.EnsureState();
            if(options.tracks != null) this.setAttribute('tracks', String(options.tracks));
            if(options.bars != null) this.setAttribute('bars', String(options.bars));
            if(options.beatsPerBar != null) this.setAttribute('beats-per-bar', String(options.beatsPerBar));
            if(options.beatPx != null) this.setAttribute('beat-px', String(options.beatPx));
            if(options.trackHeight != null) this.setAttribute('track-height', String(options.trackHeight));
            if(options.bpm != null) this.setAttribute('bpm', String(options.bpm));
            if(options.theme) this.setAttribute('theme', options.theme);
            if(options.editMode) this.editMode=options.editMode;
        }

        public onCreated(): void
        {
            requestAnimationFrame(() => { if(this.isConnected) this.onConnected(); });
        }

        public onConnected(): void
        {
            this.EnsureState();
            this.classList.add('AudioTrackEditor');
            // Keep every editor overlay anchored to the component itself even when
            // the scoped stylesheet has not flushed yet during a prototype-promotion drain.
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
            if(!this.hasAttribute('snap')) this.setAttribute('snap', '.25');
            if(!this.hasAttribute('edit-mode')) this.setAttribute('edit-mode','parts');
            if(!this.hasAttribute('tabindex')) this.tabIndex = 0;
            this.BeatPx = Number(this.getAttribute('beat-px') ?? 28) || 28;
            this.Bars = Number(this.getAttribute('bars') ?? 16) || 16;
            this.BeatsPerBar = Number(this.getAttribute('beats-per-bar') ?? 4) || 4;
            this.Bpm = Math.max(20, Math.min(400, Number(this.getAttribute('bpm') ?? 120) || 120));
            this.style.setProperty('--AudioTrackEditor-BeatPx', `${this.BeatPx}px`);
            this.Render();
            this.SyncScale();
            this.ApplyTheme();
            this.SyncMix();
        }

        public onAttributeChanged(name: string): void
        {
            if(!this.isConnected) return;

            if(name === 'theme')
            {
                this.ApplyTheme();
            }
            else if(name === 'beat-px')
            {
                this.BeatPx = Number(this.getAttribute('beat-px') ?? 28) || 28;
                this.style.setProperty('--AudioTrackEditor-BeatPx', `${this.BeatPx}px`);
                for(const track of this.tracks)
                {
                    track.setAttribute('beat-px', String(this.BeatPx));
                    track.querySelectorAll<AudioPart>('arianna-audio-part, .AudioPart').forEach(part => part.onConnected?.());
                }
                this.SyncScale();
                this.setPlayhead(this.PlayheadValue ?? 0);
            }
            else if(name === 'track-height') this.SyncScale();
            else if(name === 'snap')
            {
                const snap = this.getAttribute('snap') || '.25';
                for(const track of this.tracks) track.setAttribute('snap', snap);
            }
            else if(name === 'edit-mode') this.SyncEditMode();
        }

        public get editMode():Types.EditMode
        {
            const value=this.getAttribute('edit-mode');
            return value==='automation-select'||value==='automation-draw'?value:'parts';
        }
        public set editMode(value:Types.EditMode)
        {
            this.setAttribute('edit-mode',value==='automation-select'||value==='automation-draw'?value:'parts');
        }
        public setEditMode(value:Types.EditMode):this{this.editMode=value;this.SyncEditMode();return this;}

        private SyncEditMode():void
        {
            const mode=this.editMode;
            for(const track of this.tracks)if(track.getAttribute('edit-mode')!==mode)track.setAttribute('edit-mode',mode);
            if(this.PartsToolButton)this.PartsToolButton.dataset.active=String(mode==='parts');
            if(this.AutomationToolButton)this.AutomationToolButton.dataset.active=String(mode==='automation-select');
            if(this.AutomationDrawButton)this.AutomationDrawButton.dataset.active=String(mode==='automation-draw');
            this.dataset.editMode=mode;
            this.dispatchEvent(new CustomEvent('arianna:editor-edit-mode',{bubbles:true,composed:true,detail:{editMode:mode,source:this}}));
        }

        public get trackHeight(): number { return Math.max(48,Math.min(240,Number(this.getAttribute('track-height')) || 64)); }
        public set trackHeight(value: number) { this.setAttribute('track-height',String(value)); }
        private SyncScale(): void {
            if(!this.Body) return;
            const px=this.BeatPx??28, total=(this.Bars??16)*(this.BeatsPerBar??4)*px;
            syncTimelineScales(this,'beat-px',px,'track-height',this.trackHeight);
            this.Body.style.height='300px'; this.Body.style.minHeight='0'; this.Body.style.overflow='auto';
            this.Body.style.scrollbarGutter='stable';
            for(const track of this.tracks) {
                if(track.getAttribute('track-height')!==String(this.trackHeight)) track.setAttribute('track-height',String(this.trackHeight));
                track.style.flex='0 0 auto'; track.style.width=`${150+total}px`; track.style.minWidth='100%';
            }
            const ruler=this.querySelector<HTMLElement>('.AudioTrackEditor-RulerLane');
            if(ruler) {
                ruler.style.width=`${total}px`; ruler.style.transform=`translateX(${-this.Body.scrollLeft}px)`;
                Array.from(ruler.children).forEach((tick,index)=>(tick as HTMLElement).style.left=`${index*(this.BeatsPerBar??4)*px}px`);
            }
            const rulerHost=this.querySelector<HTMLElement>('.AudioTrackEditor-Ruler');
            if(rulerHost) rulerHost.style.overflow='hidden';
        }

        public setPlayhead(beats: number): this
        {
            this.EnsureState();
            const total = (this.Bars ?? 16) * (this.BeatsPerBar ?? 4);
            this.PlayheadValue = Math.max(0, Math.min(total, beats));
            if(this.Playhead) this.Playhead.style.left = `${150 + this.PlayheadValue * (this.BeatPx ?? 28)}px`;
            if(this.Time) this.Time.textContent = `${Math.floor(this.PlayheadValue / (this.BeatsPerBar ?? 4)) + 1}.${Math.floor(this.PlayheadValue % (this.BeatsPerBar ?? 4)) + 1}`;
            for(const track of this.tracks)if(typeof track.applyAutomation==='function')track.applyAutomation(this.PlayheadValue);
            this.dispatchEvent(new CustomEvent('arianna:editor-playhead', { bubbles: true, composed: true, detail: { beat: this.PlayheadValue, source: this } }));
            return this;
        }

        private SeekToBeat(beats: number): void
        {
            this.setPlayhead(beats);
            if(!this.Playing) return;

            // Re-anchor synchronously so UpdatePlaybackPosition() follows the seek
            // immediately, even before the async WebAudio reschedule has completed.
            if(this.Context)
            {
                this.PlaybackStartBeat = this.PlayheadValue ?? 0;
                this.PlaybackStartedAt = this.Context.currentTime;
            }
            void this.Reschedule();
        }

        public get playing(): boolean { return this.Playing; }
        public get bpm(): number { return this.Bpm; }
        public set bpm(value: number)
        {
            this.Bpm = Math.max(20, Math.min(400, Number.isFinite(value) ? value : 120));
            this.setAttribute('bpm', String(this.Bpm));
            if(this.Playing) void this.Reschedule();
        }

        public async play(): Promise<void>
        {
            if(this.Playing) return;
            await this.EnsureAudio();
            this.Playing = true;
            if(this.PlayButton) { this.PlayButton.dataset.active = 'true'; this.PlayButton.textContent = '❚❚'; }
            await this.Reschedule();
            this.dispatchEvent(new CustomEvent('arianna:track-editor-play', { bubbles: true, composed: true, detail: { source: this } }));
        }

        public pause(): void
        {
            if(!this.Playing) return;
            this.UpdatePlaybackPosition();
            this.Playing = false;
            this.StopSources();
            if(this.PlayButton) { this.PlayButton.dataset.active = 'false'; this.PlayButton.textContent = '▶'; }
            this.ZeroMeters();
            this.dispatchEvent(new CustomEvent('arianna:track-editor-pause', { bubbles: true, composed: true, detail: { source: this } }));
        }

        public stop(): void
        {
            this.Playing = false;
            this.StopSources();
            if(this.PlayButton) { this.PlayButton.dataset.active = 'false'; this.PlayButton.textContent = '▶'; }
            this.setPlayhead(0);
            this.ZeroMeters();
            this.dispatchEvent(new CustomEvent('arianna:track-editor-stop', { bubbles: true, composed: true, detail: { source: this } }));
        }

        public togglePlayback(): void
        {
            if(this.Playing) this.pause();
            else void this.play();
        }

        public get tracks(): AudioTrack[]
        {
            return Array.from(this.querySelectorAll('arianna-audio-track, .AudioTrack')) as AudioTrack[];
        }

        public copySelectedPart(): this
        {
            if(this._selectedPart?.isConnected) this._clipboard = this._selectedPart.snapshot();
            return this;
        }

        public cutSelectedPart(): this
        {
            if(!this._selectedPart?.isConnected) return this;
            this._clipboard = this._selectedPart.snapshot();
            const part = this._selectedPart;
            this._selectedPart = undefined;
            part.remove();
            this.EmitEdit('cut', part);
            return this;
        }

        public deleteSelectedPart(): this
        {
            if(!this._selectedPart?.isConnected) return this;
            const part = this._selectedPart;
            this._selectedPart = undefined;
            part.remove();
            this.EmitEdit('delete', part);
            return this;
        }

        public pastePart(track?: AudioTrack): AudioPart | null
        {
            const clip = this._clipboard;
            if(!clip) return null;
            const target = track ?? (this._selectedPart?.closest('arianna-audio-track, .AudioTrack') as AudioTrack | null) ?? this.tracks[0];
            if(!target) return null;

            const part = document.createElement('arianna-audio-part') as AudioPart;
            part.setAttribute('start', String(this.PlayheadValue ?? 0));
            part.setAttribute('length', String(clip.length ?? 4));
            if(clip.label) part.setAttribute('label', clip.label);
            if(clip.src) part.setAttribute('src', clip.src);
            if(clip.color) part.setAttribute('color', clip.color);
            const lane = target.querySelector<HTMLElement>(':scope > .AudioTrack-Lane');
            if(lane) lane.append(part);
            else target.appendChild(part);
            requestAnimationFrame(() =>
            {
                part.onConnected?.();
                part.setAttribute('selected', '');
                this.SelectPart(part);
            });
            this.EmitEdit('paste', part);
            return part;
        }

        private ApplyTheme(): void
        {
            const theme: Types.Theme = this.getAttribute('theme') === 'light' ? 'light' : 'dark';
            this.classList.add('AudioTrackEditor');
            const beatPx = String(this.BeatPx ?? (Number(this.getAttribute('beat-px') ?? 28) || 28));
            const snap = this.getAttribute('snap') || '.25';

            // Make theme/grid inheritance explicit on the nested component hosts.
            // This avoids relying on stylesheet injection order and makes the
            // standalone AudioTrack/AudioPart light rules work identically inside
            // the editor and outside it.
            for(const track of this.tracks)
            {
                track.classList.add('AudioTrack');
                if(track.getAttribute('theme') !== theme) track.setAttribute('theme', theme);
                if(track.getAttribute('beat-px') !== beatPx) track.setAttribute('beat-px', beatPx);
                if(track.getAttribute('snap') !== snap) track.setAttribute('snap', snap);

                for(const part of track.querySelectorAll<AudioPart>('arianna-audio-part, .AudioPart'))
                {
                    part.classList.add('AudioPart');
                    if(part.getAttribute('theme') !== theme) part.setAttribute('theme', theme);
                }
            }
        }

        private EnsureState(): void
        {
            if(typeof this.BeatPx !== 'number' || !Number.isFinite(this.BeatPx) || this.BeatPx <= 0) this.BeatPx = 28;
            if(typeof this.Bars !== 'number' || !Number.isFinite(this.Bars) || this.Bars <= 0) this.Bars = 16;
            if(typeof this.BeatsPerBar !== 'number' || !Number.isFinite(this.BeatsPerBar) || this.BeatsPerBar <= 0) this.BeatsPerBar = 4;
            if(typeof this.PlayheadValue !== 'number' || !Number.isFinite(this.PlayheadValue)) this.PlayheadValue = 0;
            if(typeof this._bound !== 'boolean') this._bound = false;
            if(!Array.isArray(this.ActiveSources)) this.ActiveSources = [];
            if(typeof this.Playing !== 'boolean') this.Playing = false;
            if(!Number.isFinite(this.Bpm) || this.Bpm <= 0) this.Bpm = 120;
            if(!Number.isFinite(this.PlaybackRaf)) this.PlaybackRaf = 0;
        }

        private Render(): void
        {
            this.EnsureState();
            if(this.querySelector(':scope > .AudioTrackEditor-Toolbar')) return;

            const existing = Array.from(this.children)
                .filter(node => node instanceof HTMLElement && (node.matches('arianna-audio-track') || node.classList.contains('AudioTrack'))) as AudioTrack[];
            const requested = Math.max(existing.length, Number(this.getAttribute('tracks') ?? 0) || 0);
            const colors = ['#dc746d','#e69a45','#d2c640','#77bd54','#42b59c','#4b99da','#7a7edb','#ad71c8'];
            for(let index = existing.length; index < requested; index++)
            {
                const track = document.createElement('arianna-audio-track') as AudioTrack;
                track.setAttribute('name', `Audio ${index + 1}`);
                track.setAttribute('color', colors[index % colors.length]);
                existing.push(track);
            }

            const toolbar = document.createElement('div');
            toolbar.className = 'AudioTrackEditor-Toolbar';
            const start = this.Button('⏮', 'Start');
            const back = this.Button('◀◀', 'Previous beat');
            const play = this.Button('▶', 'Play');
            this.PlayButton = play;
            const stop = this.Button('■', 'Stop');
            const forward = this.Button('▶▶', 'Next beat');
            play.dataset.active = 'false';

            this.Time = document.createElement('span');
            this.Time.className = 'AudioTrackEditor-Time';
            this.Time.textContent = '1.1';

            this.PartsToolButton=this.Button('↖','Edit audio parts');
            this.PartsToolButton.setAttribute('aria-label','Edit audio parts');
            this.AutomationToolButton=this.Button('⌁','Select automation points');
            this.AutomationToolButton.setAttribute('aria-label','Select automation points');
            this.AutomationDrawButton=this.Button('✎','Draw automation points');
            this.AutomationDrawButton.setAttribute('aria-label','Draw automation points');

            const cut = this.Button('✂', 'Cut part');
            const copy = this.Button('⧉', 'Copy part');
            const paste = this.Button('⎘', 'Paste part');

            const fill = document.createElement('span');
            fill.className = 'AudioTrackEditor-Fill';
            const zoomOut = this.Button('−', 'Zoom out');
            const zoomIn = this.Button('+', 'Zoom in');
            toolbar.append(start, back, play, stop, forward, this.Time,this.PartsToolButton,this.AutomationToolButton,this.AutomationDrawButton, cut, copy, paste, fill, zoomOut, zoomIn);

            const ruler = document.createElement('div');
            ruler.className = 'AudioTrackEditor-Ruler';
            const corner = document.createElement('div');
            corner.className = 'AudioTrackEditor-Corner';
            const lane = document.createElement('div');
            lane.className = 'AudioTrackEditor-RulerLane';
            const totalWidth = (this.Bars ?? 16) * (this.BeatsPerBar ?? 4) * (this.BeatPx ?? 28);
            lane.style.width = `${totalWidth}px`;
            for(let bar = 0; bar <= (this.Bars ?? 16); bar++)
            {
                const tick = document.createElement('span');
                tick.className = 'AudioTrackEditor-Tick';
                tick.style.left = `${bar * (this.BeatsPerBar ?? 4) * (this.BeatPx ?? 28)}px`;
                const label = document.createElement('span');
                label.className = 'AudioTrackEditor-TickLabel';
                label.textContent = String(bar + 1);
                tick.append(label);
                lane.append(tick);
            }
            ruler.append(corner, lane);

            this.Body = document.createElement('div');
            this.Body.className = 'AudioTrackEditor-Body';
            this.Body.addEventListener('scroll',()=>{const ruler=this.querySelector<HTMLElement>('.AudioTrackEditor-RulerLane');if(ruler)ruler.style.transform=`translateX(${-this.Body!.scrollLeft}px)`;});
            existing.forEach(track => this.Body?.append(track));

            this.Playhead = document.createElement('div');
            this.Playhead.className = 'AudioTrackEditor-Playhead';
            // The playhead belongs to the arrangement body, not to document flow.
            // Body is already position:relative, so left/top/bottom can never escape
            // the AudioTrackEditor even if the host stylesheet is installed a frame later.
            this.Playhead.style.position = 'absolute';
            this.Playhead.style.top = '0';
            this.Playhead.style.bottom = '0';
            this.Playhead.style.pointerEvents = 'none';
            this.Body.append(this.Playhead);
            this.replaceChildren(toolbar, ruler, this.Body);

            start.addEventListener('click', () => this.SeekToBeat(0));
            back.addEventListener('click', () => this.SeekToBeat((this.PlayheadValue ?? 0) - 1));
            forward.addEventListener('click', () => this.SeekToBeat((this.PlayheadValue ?? 0) + 1));
            play.addEventListener('click', () => this.togglePlayback());
            stop.addEventListener('click', () => this.stop());
            cut.addEventListener('click', () => this.cutSelectedPart());
            copy.addEventListener('click', () => this.copySelectedPart());
            paste.addEventListener('click', () => this.pastePart());
            this.PartsToolButton.addEventListener('click',()=>this.setEditMode('parts'));
            this.AutomationToolButton.addEventListener('click',()=>this.setEditMode('automation-select'));
            this.AutomationDrawButton.addEventListener('click',()=>this.setEditMode('automation-draw'));
            zoomIn.addEventListener('click', () => this.Zoom(4));
            zoomOut.addEventListener('click', () => this.Zoom(-4));

            const seekFromRulerPointer = (clientX: number): void =>
            {
                const rect = lane.getBoundingClientRect();
                const total = (this.Bars ?? 16) * (this.BeatsPerBar ?? 4);
                const beat = Math.max(0, Math.min(total, (clientX - rect.left) / (this.BeatPx ?? 28)));
                this.setPlayhead(beat);

                // While PLAY is running, move the playback clock anchor immediately.
                // This prevents the RAF loop from snapping the red marker back to the
                // old time while the user is dragging the ruler.
                if(this.Playing && this.Context)
                {
                    this.PlaybackStartBeat = this.PlayheadValue ?? beat;
                    this.PlaybackStartedAt = this.Context.currentTime;
                }
            };

            lane.addEventListener('pointerdown', event =>
            {
                if(event.button !== 0) return;
                event.preventDefault();
                event.stopPropagation();

                this.SeekingFromRuler = true;
                seekFromRulerPointer(event.clientX);
                this.focus();
                try { lane.setPointerCapture(event.pointerId); } catch {}

                const move = (moveEvent: PointerEvent): void =>
                {
                    if(moveEvent.pointerId !== event.pointerId) return;
                    seekFromRulerPointer(moveEvent.clientX);
                };

                const finish = (finishEvent: PointerEvent): void =>
                {
                    if(finishEvent.pointerId !== event.pointerId) return;
                    window.removeEventListener('pointermove', move, true);
                    window.removeEventListener('pointerup', finish, true);
                    window.removeEventListener('pointercancel', finish, true);
                    try { lane.releasePointerCapture(event.pointerId); } catch {}
                    this.SeekingFromRuler = false;

                    // At release, restart the actual audio sources from the new point.
                    if(this.Playing) void this.Reschedule();
                };

                window.addEventListener('pointermove', move, true);
                window.addEventListener('pointerup', finish, true);
                window.addEventListener('pointercancel', finish, true);
            });

            this.Body.addEventListener('pointerdown', event =>
            {
                const target = event.target as Element;
                if(target.closest('arianna-audio-part, .AudioPart') || target.closest('.AudioTrack-Header') || target.closest('.AudioTrack-Automation')) return;
                const laneTarget = target.closest('.AudioTrack-Lane') as HTMLElement | null;
                if(!laneTarget) return;
                const track=laneTarget.closest('arianna-audio-track, .AudioTrack') as AudioTrack|null;
                if((track?.getAttribute('edit-mode')??this.editMode)!=='parts')return;
                const rect = laneTarget.getBoundingClientRect();
                const beat = Math.max(0, (event.clientX - rect.left) / (this.BeatPx ?? 28));
                this.SeekToBeat(beat);
                this.focus();
            });

            if(!this._bound)
            {
                this._bound = true;
                this.addEventListener('arianna:track-mute', () => this.SyncMix());
                this.addEventListener('arianna:track-solo', () => this.SyncMix());
                this.addEventListener('arianna:audio-part-select', event =>
                {
                    const part = (event as CustomEvent<{ part?: AudioPart }>).detail?.part;
                    if(part) this.SelectPart(part);
                });
                this.addEventListener('arianna:audio-part-copy', () => this.copySelectedPart());
                this.addEventListener('arianna:audio-part-cut', () => this.cutSelectedPart());
                this.addEventListener('arianna:audio-part-delete', () => this.deleteSelectedPart());
                this.addEventListener('arianna:audio-part-paste', () => this.pastePart());
                this.addEventListener('keydown', event =>
                {
                    const target = event.target as HTMLElement | null;
                    if(target && target !== this && target.matches('input,textarea,select')) return;
                    const primary = event.metaKey || event.ctrlKey;
                    if(event.key==='Escape'&&this.editMode!=='parts'){event.preventDefault();this.setEditMode('parts');}
                    else if(primary && event.key.toLowerCase() === 'c') { event.preventDefault(); this.copySelectedPart(); }
                    else if(primary && event.key.toLowerCase() === 'x') { event.preventDefault(); this.cutSelectedPart(); }
                    else if(primary && event.key.toLowerCase() === 'v') { event.preventDefault(); this.pastePart(); }
                    else if(event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); this.deleteSelectedPart(); }
                });
            }

            // Establish waveform/parts mode before the first paint. This keeps the
            // parts draggable and prevents automation controls from flashing active.
            this.SyncEditMode();
            requestAnimationFrame(() =>
            {
                this.ApplyTheme();
                this.querySelectorAll<AudioPart>('arianna-audio-part, .AudioPart').forEach(part => part.onConnected?.());
                this.SyncMix();
                this.SyncEditMode();
                this.setPlayhead(this.PlayheadValue ?? 0);
            });
        }

        private SelectPart(part: AudioPart): void
        {
            this._selectedPart = part;
            this.querySelectorAll('arianna-audio-part, .AudioPart').forEach(candidate => candidate.toggleAttribute('selected', candidate === part));
        }

        private Button(text: string, title = ''): HTMLButtonElement
        {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'AudioTrackEditor-Button';
            button.textContent = text;
            if(title) button.title = title;
            return button;
        }

        private Zoom(delta: number): void
        {
            this.EnsureState();
            this.BeatPx = Math.max(8, Math.min(160, (this.BeatPx ?? 28) + delta));
            this.setAttribute('beat-px', String(this.BeatPx));
            this.style.setProperty('--AudioTrackEditor-BeatPx', `${this.BeatPx}px`);
            for(const part of this.querySelectorAll<AudioPart>('arianna-audio-part, .AudioPart')) part.onConnected?.();
            const ruler = this.querySelector<HTMLElement>('.AudioTrackEditor-RulerLane');
            if(ruler)
            {
                ruler.style.width = `${(this.Bars ?? 16) * (this.BeatsPerBar ?? 4) * this.BeatPx}px`;
                Array.from(ruler.children).forEach((tick, index) => (tick as HTMLElement).style.left = `${index * (this.BeatsPerBar ?? 4) * this.BeatPx!}px`);
            }
            this.SyncScale();
            this.setPlayhead(this.PlayheadValue ?? 0);
        }

        private SyncMix(): void
        {
            const tracks = this.tracks;
            const anySolo = tracks.some(track => track.hasAttribute('soloed'));
            for(const track of tracks)
            {
                const silent = track.hasAttribute('muted') || (anySolo && !track.hasAttribute('soloed'));
                track.dataset.silenced = String(silent);
                track.setAttribute('aria-muted', String(silent));

                /*
                 * During an AriannA markup-first observer drain the editor host can
                 * be upgraded before its nested <arianna-audio-track> children.
                 * At that point the child is still a plain HTMLElement, therefore
                 * calling AudioTrack methods would abort the whole drain and leave
                 * following editors (notably the Light example) unupgraded.
                 *
                 * Muted/solo state is already reflected declaratively above. The
                 * actual GainNode update is applied as soon as the child prototype
                 * is available, and Render() schedules a post-drain SyncMix().
                 */
                if(typeof track.setAudioEnabled === 'function')
                    track.setAudioEnabled(!silent);
            }
        }

        private async EnsureAudio(): Promise<AudioContext>
        {
            if(!this.Context)
            {
                const Constructor = window.AudioContext ||
                    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
                if(!Constructor) throw new Error('Web Audio is not available');
                this.Context = new Constructor();
                this.Master = this.Context.createGain();
                this.Master.connect(this.Context.destination);
            }
            if(this.Context.state === 'suspended') await this.Context.resume();
            for(const track of this.tracks)
            {
                const audioTrack = track as AudioTrack & {
                    ensureAudio?: (context: AudioContext, destination: AudioNode) => AudioNode;
                };
                if(typeof audioTrack.ensureAudio === 'function')
                    audioTrack.ensureAudio(this.Context, this.Master!);
            }
            this.SyncMix();
            return this.Context;
        }

        private SecondsPerBeat(): number { return 60 / Math.max(1, this.Bpm); }

        private async Reschedule(): Promise<void>
        {
            const context = await this.EnsureAudio();
            this.StopSources();
            if(!this.Playing) return;

            const startBeat = this.PlayheadValue ?? 0;
            this.PlaybackStartBeat = startBeat;
            this.PlaybackStartedAt = context.currentTime;
            const secondsPerBeat = this.SecondsPerBeat();
            const startSeconds = startBeat * secondsPerBeat;
            const tokenPlaying = this.Playing;

            const jobs: Promise<void>[] = [];
            for(const track of this.tracks)
            {
                const audioTrack = track as AudioTrack & {
                    ensureAudio?: (context: AudioContext, destination: AudioNode) => AudioNode;
                };
                const input = typeof audioTrack.ensureAudio === 'function'
                    ? audioTrack.ensureAudio(context, this.Master!)
                    : this.Master!;

                for(const part of Array.from(track.querySelectorAll<AudioPart>(':scope > .AudioTrack-Lane > arianna-audio-part, :scope > .AudioTrack-Lane > .AudioPart')))
                {
                    const src = part.getAttribute('src')?.trim();
                    if(!src) continue;

                    // Attributes are the canonical timing source. Reading them directly
                    // also makes playback work while a markup child is waiting for its
                    // prototype promotion in the same observer drain.
                    const startBeatValue = Math.max(0, Number(part.getAttribute('start') ?? 0) || 0);
                    const lengthBeatValue = Math.max(.125, Number(part.getAttribute('length') ?? 1) || 1);
                    const partStart = startBeatValue * secondsPerBeat;
                    const partEnd = (startBeatValue + lengthBeatValue) * secondsPerBeat;
                    if(partEnd <= startSeconds) continue;

                    jobs.push((async () =>
                    {
                        const buffer = await AudioPartBuffer(src, context);
                        if(!this.Playing || !tokenPlaying) return;
                        const when = context.currentTime + Math.max(0, partStart - startSeconds);
                        const offset = Math.max(0, startSeconds - partStart);
                        if(offset >= buffer.duration) return;
                        const requested = Math.max(.01, partEnd - Math.max(startSeconds, partStart));
                        const duration = Math.min(requested, buffer.duration - offset);
                        if(duration <= 0) return;
                        const source = context.createBufferSource();
                        source.buffer = buffer;
                        const pitch=audioTrack.automationRead?audioTrack.automationValue('pitch',startBeatValue):Number.NaN;
                        source.playbackRate.value=Number.isFinite(pitch)?Math.pow(2,pitch/12):1;
                        source.connect(input);
                        source.start(when, offset, duration);
                        const active={source,track:audioTrack};
                        this.ActiveSources.push(active);
                        source.onended = () =>
                        {
                            const index = this.ActiveSources.indexOf(active);
                            if(index >= 0) this.ActiveSources.splice(index, 1);
                        };
                    })());
                }
            }
            await Promise.allSettled(jobs);
            this.StartPlaybackLoop();
        }

        private StopSources(): void
        {
            for(const {source} of this.ActiveSources.splice(0))
            {
                source.onended = null;
                try { source.stop(); } catch {}
                try { source.disconnect(); } catch {}
            }
            if(this.PlaybackRaf) cancelAnimationFrame(this.PlaybackRaf);
            this.PlaybackRaf = 0;
        }

        private UpdatePlaybackPosition(): void
        {
            if(!this.Playing || !this.Context || this.SeekingFromRuler) return;
            const elapsed = this.Context.currentTime - this.PlaybackStartedAt;
            this.setPlayhead(this.PlaybackStartBeat + elapsed / this.SecondsPerBeat());
        }

        private StartPlaybackLoop(): void
        {
            if(this.PlaybackRaf) cancelAnimationFrame(this.PlaybackRaf);
            const tick = (): void =>
            {
                if(!this.Playing || !this.Context)
                {
                    this.ZeroMeters();
                    return;
                }
                this.UpdatePlaybackPosition();
                for(const active of this.ActiveSources)
                {
                    const pitch=active.track.automationRead?active.track.automationValue('pitch',this.PlayheadValue??0):Number.NaN;
                    const rate=Number.isFinite(pitch)?Math.pow(2,pitch/12):1;
                    active.source.playbackRate.setTargetAtTime(rate,this.Context.currentTime,.01);
                }
                for(const track of this.tracks)
                {
                    const meterTrack = track as AudioTrack & {
                        meterLevel?: () => number;
                        setMeter?: (level: number) => void;
                    };
                    const level = typeof meterTrack.meterLevel === 'function'
                        ? meterTrack.meterLevel()
                        : 0;
                    if(typeof meterTrack.setMeter === 'function') meterTrack.setMeter(level);
                }
                const total = (this.Bars ?? 16) * (this.BeatsPerBar ?? 4);
                if((this.PlayheadValue ?? 0) >= total)
                {
                    this.stop();
                    return;
                }
                this.PlaybackRaf = requestAnimationFrame(tick);
            };
            this.PlaybackRaf = requestAnimationFrame(tick);
        }

        private ZeroMeters(): void
        {
            for(const track of this.tracks)
            {
                const meterTrack = track as AudioTrack & { setMeter?: (level: number) => void };
                if(typeof meterTrack.setMeter === 'function') meterTrack.setMeter(0);
            }
        }

        public onUnmount(): void
        {
            this.StopSources();
            this.ZeroMeters();
        }

        private EmitEdit(kind: string, part: AudioPart): void
        {
            this.dispatchEvent(new CustomEvent('arianna:audio-edit', {
                bubbles: true, composed: true, detail: { kind, part, source: this }
            }));
        }
    }
}

export default AudioTrackEditor;
