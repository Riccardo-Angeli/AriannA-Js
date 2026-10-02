/**
 * @module components/video/VideoPart
 * @version 2.0.0
 * @description DaVinci-style video clip for AriannA 2.0. Prototype-promotion safe.
 */
import { Component, Css, Templates, Real } from '../../core/index.ts';

export type VideoTheme = 'dark' | 'light';

export interface VideoPartOptions {
    id?: string;
    start?: number;
    length?: number;
    duration?: number;
    sourceStart?: number;
    sourceIn?: number;
    src?: string;
    source?: string;
    label?: string;
    name?: string;
    color?: string;
    theme?: VideoTheme;
    speed?: number;
    opacity?: number;
    fadeIn?: number;
    fadeOut?: number;
    volume?: number;
    muted?: boolean;
    locked?: boolean;
    poster?: string;
    frames?: string[];
}

export interface VideoPartSnapshot {
    id: string;
    start: number;
    length: number;
    duration: number;
    sourceStart: number;
    sourceIn: number;
    src: string;
    source: string;
    label: string;
    name: string;
    color: string;
    theme: VideoTheme;
    speed: number;
    opacity: number;
    fadeIn: number;
    fadeOut: number;
    volume: number;
    muted: boolean;
    locked: boolean;
    poster: string;
    frames: string[];
}

const html = Templates.Template.Html;
const Runtime = new WeakMap<HTMLElement, { bound: boolean; frames: string[] }>();
const VideoPartReactiveAttributes = new Set([
    'start','length','duration','source-start','source-in','src','source',
    'label','name','color','theme','speed','opacity','fade-in','fade-out','volume','muted',
    'locked','poster','frames','pixels-per-second','snap','framerate'
]);

function runtimeFor(element: HTMLElement): { bound: boolean; frames: string[] } {
    let state = Runtime.get(element);
    if(!state) {
        state = { bound: false, frames: [] };
        Runtime.set(element, state);
    }
    return state;
}

function attributeFrames(element: HTMLElement): string[] {
    const value = element.getAttribute('frames')?.trim();
    if(!value) return [];
    try {
        const parsed = JSON.parse(value);
        if(Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {}
    return value.split('|').map(item => item.trim()).filter(Boolean);
}

function syncFilmstrip(element: HTMLElement): void {
    const state = runtimeFor(element);
    const frames = state.frames.length ? state.frames : attributeFrames(element);
    const poster = element.getAttribute('poster') || '';
    const sources = frames.length ? frames : poster ? [poster] : [];
    const nodes = Array.from(element.querySelectorAll<HTMLElement>(':scope > .VideoPart-Filmstrip > .VideoPart-Frame'));
    nodes.forEach((node, index) => {
        const source = sources.length ? sources[index % sources.length]! : '';
        node.style.backgroundImage = source ? `url(${JSON.stringify(source)})` : '';
    });
}

function numberValue(value: unknown, fallback = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function numberAttribute(element: Element, name: string, fallback: number): number {
    return numberValue(element.getAttribute(name), fallback);
}

function boolAttribute(element: Element, name: string, value: boolean): void {
    element.toggleAttribute(name, !!value);
}

export function applyVideoPartOptions(element: HTMLElement, options: VideoPartOptions = {}): void {
    if(options.id != null) element.id = String(options.id);
    if(options.start != null) element.setAttribute('start', String(options.start));
    const length = options.length ?? options.duration;
    if(length != null) element.setAttribute('length', String(length));
    const sourceStart = options.sourceStart ?? options.sourceIn;
    if(sourceStart != null) element.setAttribute('source-start', String(sourceStart));
    const source = options.src ?? options.source;
    if(source != null) element.setAttribute('src', String(source));
    const label = options.label ?? options.name;
    if(label != null) element.setAttribute('label', String(label));
    if(options.color != null) element.setAttribute('color', String(options.color));
    if(options.theme != null) element.setAttribute('theme', options.theme === 'light' ? 'light' : 'dark');
    if(options.speed != null) element.setAttribute('speed', String(options.speed));
    if(options.opacity != null) element.setAttribute('opacity', String(options.opacity));
    if(options.fadeIn != null) element.setAttribute('fade-in', String(options.fadeIn));
    if(options.fadeOut != null) element.setAttribute('fade-out', String(options.fadeOut));
    if(options.volume != null) element.setAttribute('volume', String(options.volume));
    if(options.muted != null) boolAttribute(element, 'muted', options.muted);
    if(options.locked != null) boolAttribute(element, 'locked', options.locked);
    if(options.poster != null) element.setAttribute('poster', String(options.poster));
    if(options.frames != null) {
        runtimeFor(element).frames = options.frames.map(String).filter(Boolean);
        syncFilmstrip(element);
    }
}

export const VideoPartStyles = new Css.Stylesheet([
    new Css.Rule('arianna-video-part,.VideoPart', {
        '--VideoPart-Color': '#4d9de0',
        Background: 'color-mix(in srgb,var(--VideoPart-Color) 72%,#11161b)',
        Border: '1px solid color-mix(in srgb,var(--VideoPart-Color) 72%,#050709)',
        BorderRadius: '3px', Bottom: '4px', BoxSizing: 'border-box', Color: '#f7f9fb', Cursor: 'grab',
        MinWidth: '14px', Overflow: 'hidden', Position: 'absolute', Top: '4px', TouchAction: 'none', UserSelect: 'none'
    }),
    new Css.Rule('.VideoPart-Label', {
        Background: 'linear-gradient(180deg,rgba(7,9,12,.94),rgba(7,9,12,.55))', Color: '#fff', Font: '700 9px/1 var(--arianna-font,system-ui,sans-serif)',
        Height: '18px', Left: '0', Overflow: 'hidden', Padding: '4px 7px', Position: 'absolute', Right: '0', TextOverflow: 'ellipsis', Top: '0', WhiteSpace: 'nowrap', ZIndex: '4'
    }),
    new Css.Rule('.VideoPart-Filmstrip', { Bottom: '7px', Display: 'flex', Gap: '1px', Left: '0', Overflow: 'hidden', Position: 'absolute', Right: '0', Top: '18px' }),
    new Css.Rule('.VideoPart-Frame', { Background: 'linear-gradient(135deg,#36434e,#171d23)', BackgroundPosition: 'center', BackgroundRepeat: 'no-repeat', BackgroundSize: 'cover', BorderRight: '1px solid rgba(0,0,0,.35)', Flex: '1 0 48px', MinWidth: '36px' }),
    new Css.Rule('.VideoPart-Fade', { Bottom: '7px', PointerEvents: 'none', Position: 'absolute', Top: '18px', ZIndex: '3' }),
    new Css.Rule('.VideoPart-Fade[data-side="in"]', { Background: 'linear-gradient(90deg,rgba(0,0,0,.96),rgba(0,0,0,0))', Left: '0' }),
    new Css.Rule('.VideoPart-Fade[data-side="out"]', { Background: 'linear-gradient(270deg,rgba(0,0,0,.96),rgba(0,0,0,0))', Right: '0' }),
    new Css.Rule('.VideoPart-AudioBand', { Background: 'repeating-linear-gradient(to right,rgba(255,255,255,.08) 0 2px,rgba(255,255,255,.42) 2px 3px,rgba(255,255,255,.08) 3px 7px)', Bottom: '2px', Height: '4px', Left: '3px', Opacity: '.72', PointerEvents: 'none', Position: 'absolute', Right: '3px', ZIndex: '3' }),
    new Css.Rule('.VideoPart-Handle', { Bottom: '0', Cursor: 'ew-resize', Position: 'absolute', Top: '0', Width: '8px', ZIndex: '7' }),
    new Css.Rule('.VideoPart-Handle[data-side="left"]', { Left: '0' }),
    new Css.Rule('.VideoPart-Handle[data-side="right"]', { Right: '0' }),
    new Css.Rule('.VideoPart-Handle:hover', { Background: 'rgba(255,255,255,.24)' }),
    new Css.Rule('arianna-video-part[selected],.VideoPart[selected]', { BoxShadow: 'inset 0 0 0 2px #fff,0 0 0 1px #000,0 3px 12px rgba(0,0,0,.55)' }),
    new Css.Rule('arianna-video-part[data-dragging="true"],.VideoPart[data-dragging="true"]', { Cursor: 'grabbing', Opacity: '.72' }),
    new Css.Rule('arianna-video-part[locked],.VideoPart[locked]', { Cursor: 'not-allowed', Filter: 'grayscale(.35)', Opacity: '.65' }),
    new Css.Rule('arianna-video-part[theme="light"],.VideoPart[theme="light"],arianna-video-track[theme="light"] arianna-video-part,arianna-video-track-editor[theme="light"] arianna-video-part', {
        Background: 'color-mix(in srgb,var(--VideoPart-Color) 52%,#fff)', BorderColor: 'color-mix(in srgb,var(--VideoPart-Color) 48%,#aab2ba)', Color: '#20272d'
    }),
    new Css.Rule('arianna-video-part[theme="light"] .VideoPart-Label,.VideoPart[theme="light"] .VideoPart-Label,arianna-video-track[theme="light"] .VideoPart-Label,arianna-video-track-editor[theme="light"] .VideoPart-Label', {
        Background: 'linear-gradient(180deg,rgba(255,255,255,.96),rgba(241,244,246,.80))', Color: '#20272d'
    })
]);


/**
 * Render/bind the canonical VideoPart surface on a raw <arianna-video-part> host.
 * VideoTrackEditor normally reaches the same surface through AriannA promotion.
 * Standalone VideoTrack can encounter its child while that promotion is still
 * pending, so this local helper makes the SAME clip visible and draggable now.
 * No observer, no polling, no reinsert loop.
 */

function ApplyCriticalVideoPartLayout(element: HTMLElement): void {
    const label = element.querySelector<HTMLElement>(':scope > .VideoPart-Label');
    const strip = element.querySelector<HTMLElement>(':scope > .VideoPart-Filmstrip');
    const audio = element.querySelector<HTMLElement>(':scope > .VideoPart-AudioBand');
    const left = element.querySelector<HTMLElement>(':scope > .VideoPart-Handle[data-side="left"]');
    const right = element.querySelector<HTMLElement>(':scope > .VideoPart-Handle[data-side="right"]');
    const fadeIn = element.querySelector<HTMLElement>(':scope > .VideoPart-Fade[data-side="in"]');
    const fadeOut = element.querySelector<HTMLElement>(':scope > .VideoPart-Fade[data-side="out"]');

    /*
     * These are geometry/interaction invariants, not theme skin.
     * Keeping them inline makes a VideoPart fully usable inside a standalone
     * VideoTrack even when the Playground/runtime has not emitted the child's
     * component stylesheet yet. VideoTrackEditor no longer gets a privileged
     * rendering path.
     */
    element.style.boxSizing = 'border-box';
    element.style.borderRadius = '3px';
    element.style.border = `1px solid color-mix(in srgb,var(--VideoPart-Color) 72%,#050709)`;
    element.style.background = `color-mix(in srgb,var(--VideoPart-Color) 72%,#11161b)`;
    element.style.color = '#f7f9fb';
    element.style.cursor = element.hasAttribute('locked') ? 'not-allowed' : 'grab';

    if(label) {
        label.style.position = 'absolute';
        label.style.left = '0';
        label.style.right = '0';
        label.style.top = '0';
        label.style.height = '18px';
        label.style.padding = '4px 7px';
        label.style.boxSizing = 'border-box';
        label.style.overflow = 'hidden';
        label.style.whiteSpace = 'nowrap';
        label.style.textOverflow = 'ellipsis';
        label.style.zIndex = '4';
        label.style.font = '700 9px/1 var(--arianna-font,system-ui,sans-serif)';
        label.style.background = 'linear-gradient(180deg,rgba(7,9,12,.94),rgba(7,9,12,.55))';
        label.style.color = '#fff';
        label.style.pointerEvents = 'none';
    }

    if(strip) {
        strip.style.position = 'absolute';
        strip.style.left = '0';
        strip.style.right = '0';
        strip.style.top = '18px';
        strip.style.bottom = '7px';
        strip.style.display = 'flex';
        strip.style.gap = '1px';
        strip.style.overflow = 'hidden';

        strip.querySelectorAll<HTMLElement>(':scope > .VideoPart-Frame').forEach(frame => {
            frame.style.flex = '1 0 48px';
            frame.style.minWidth = '36px';
            frame.style.background = 'linear-gradient(135deg,#36434e,#171d23)';
            frame.style.backgroundPosition = 'center';
            frame.style.backgroundRepeat = 'no-repeat';
            frame.style.backgroundSize = 'cover';
            frame.style.borderRight = '1px solid rgba(0,0,0,.35)';
        });
    }

    if(audio) {
        audio.style.position = 'absolute';
        audio.style.left = '3px';
        audio.style.right = '3px';
        audio.style.bottom = '2px';
        audio.style.height = '4px';
        audio.style.opacity = '.72';
        audio.style.pointerEvents = 'none';
        audio.style.zIndex = '3';
        audio.style.background = 'repeating-linear-gradient(to right,rgba(255,255,255,.08) 0 2px,rgba(255,255,255,.42) 2px 3px,rgba(255,255,255,.08) 3px 7px)';
    }

    const styleFade = (fade: HTMLElement | null, side: 'in' | 'out'): void => {
        if(!fade) return;
        fade.style.position = 'absolute';
        fade.style.top = '18px';
        fade.style.bottom = '7px';
        fade.style.pointerEvents = 'none';
        fade.style.zIndex = '3';
        fade.style[side === 'in' ? 'left' : 'right'] = '0';
        fade.style.background = side === 'in'
            ? 'linear-gradient(90deg,rgba(0,0,0,.96),rgba(0,0,0,0))'
            : 'linear-gradient(270deg,rgba(0,0,0,.96),rgba(0,0,0,0))';
    };
    styleFade(fadeIn, 'in');
    styleFade(fadeOut, 'out');

    const styleHandle = (handle: HTMLElement | null, side: 'left' | 'right'): void => {
        if(!handle) return;
        handle.style.position = 'absolute';
        handle.style.top = '0';
        handle.style.bottom = '0';
        handle.style.width = '9px';
        handle.style.zIndex = '8';
        handle.style.cursor = 'ew-resize';
        handle.style.touchAction = 'none';
        if(side === 'left') {
            handle.style.left = '0';
            handle.style.borderLeft = '2px solid rgba(255,255,255,.42)';
        } else {
            handle.style.right = '0';
            handle.style.borderRight = '2px solid rgba(255,255,255,.42)';
        }
    };

    styleHandle(left, 'left');
    styleHandle(right, 'right');
}

export function EnsureVideoPartVisual(element: HTMLElement): void {
    const state = runtimeFor(element);

    element.classList.add('VideoPart');
    if(!element.hasAttribute('theme')) {
        const theme = element.closest('arianna-video-track,arianna-video-track-editor')?.getAttribute('theme');
        element.setAttribute('theme', theme === 'light' ? 'light' : 'dark');
    }
    if(!element.hasAttribute('tabindex')) element.tabIndex = 0;

    let label = element.querySelector<HTMLElement>(':scope > .VideoPart-Label');
    let strip = element.querySelector<HTMLElement>(':scope > .VideoPart-Filmstrip');
    if(!label || !strip) {
        label = document.createElement('div');
        label.className = 'VideoPart-Label';
        strip = document.createElement('div');
        strip.className = 'VideoPart-Filmstrip';
        for(let index = 0; index < 8; index++) {
            const frame = document.createElement('span');
            frame.className = 'VideoPart-Frame';
            strip.appendChild(frame);
        }
        const audio = document.createElement('span');
        audio.className = 'VideoPart-AudioBand';
        const fadeIn = document.createElement('span');
        fadeIn.className = 'VideoPart-Fade';
        fadeIn.dataset.side = 'in';
        const fadeOut = document.createElement('span');
        fadeOut.className = 'VideoPart-Fade';
        fadeOut.dataset.side = 'out';
        const left = document.createElement('span');
        left.className = 'VideoPart-Handle';
        left.dataset.side = 'left';
        const right = document.createElement('span');
        right.className = 'VideoPart-Handle';
        right.dataset.side = 'right';
        element.replaceChildren(label, strip, audio, fadeIn, fadeOut, left, right);
    }

    const ownerEditor = element.closest('arianna-video-track-editor');
    const ownerTrack = element.closest('arianna-video-track');
    const timingOwner = ownerEditor ?? ownerTrack ?? element;
    const pps = Math.max(1, numberAttribute(timingOwner, 'pixels-per-second', numberAttribute(element, 'pixels-per-second', 36)));
    const fps = Math.max(1, numberAttribute(timingOwner, 'framerate', 25));
    const minimum = Math.max(.04, 1 / fps);
    const start = Math.max(0, numberAttribute(element, 'start', 0));
    const length = Math.max(minimum, numberAttribute(element, 'length', numberAttribute(element, 'duration', 1)));
    const color = element.getAttribute('color') || '#4d9de0';

    element.style.setProperty('--VideoPart-Color', color);
    element.style.position = 'absolute';
    element.style.display = 'block';
    element.style.top = '4px';
    element.style.bottom = '4px';
    element.style.left = `${start * pps}px`;
    element.style.width = `${Math.max(14, length * pps)}px`;
    element.style.minWidth = '14px';
    element.style.overflow = 'hidden';
    element.style.touchAction = 'none';
    element.style.userSelect = 'none';
    element.style.opacity = String(clamp(numberAttribute(element, 'opacity', 1), 0, 1));
    const fadeIn = clamp(numberAttribute(element, 'fade-in', 0), 0, length);
    const fadeOut = clamp(numberAttribute(element, 'fade-out', 0), 0, length);
    const fadeInNode = element.querySelector<HTMLElement>(':scope > .VideoPart-Fade[data-side="in"]');
    const fadeOutNode = element.querySelector<HTMLElement>(':scope > .VideoPart-Fade[data-side="out"]');
    if(fadeInNode) { fadeInNode.style.width = `${fadeIn * pps}px`; fadeInNode.hidden = fadeIn <= 0; }
    if(fadeOutNode) { fadeOutNode.style.width = `${fadeOut * pps}px`; fadeOutNode.hidden = fadeOut <= 0; }
    label.textContent = element.getAttribute('label') || element.getAttribute('name') || 'Video';
    ApplyCriticalVideoPartLayout(element);
    syncFilmstrip(element);

    const emit = (type: string, detail: Record<string, unknown> = {}): void => {
        element.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: { ...detail, part: element, source: element } }));
    };
    const snapTime = (value: number): number => {
        const editor = element.closest('arianna-video-track-editor');
        const track = element.closest('arianna-video-track');
        if(editor?.getAttribute('magnetic-snap') === 'false') return Math.max(0, value);
        const owner = editor ?? track ?? element;
        const explicit = numberAttribute(owner, 'snap', 0);
        const milliseconds = numberAttribute(owner, 'snap-ms', 0);
        const localFps = Math.max(1, numberAttribute(owner, 'framerate', 25));
        const step = explicit > 0 ? explicit : milliseconds > 0 ? milliseconds / 1000 : 1 / localFps;
        return Math.max(0, Math.round(value / step) * step);
    };
    const select = (): void => {
        const editor = element.closest('arianna-video-track-editor');
        editor?.querySelectorAll('arianna-video-part[selected]').forEach(node => { if(node !== element) node.removeAttribute('selected'); });
        element.setAttribute('selected', '');
        element.focus();
        emit('arianna:video-part-select');
    };

    if(!state.bound) {
        state.bound = true;
        element.addEventListener('click', event => { event.stopPropagation(); select(); });
        element.addEventListener('pointerdown', (event: PointerEvent) => {
            if(event.button !== 0 || element.hasAttribute('locked') || element.closest('arianna-video-track[locked]')) return;
            const target = event.target as HTMLElement;
            const handle = target.closest('.VideoPart-Handle') as HTMLElement | null;
            const mode = handle?.dataset.side === 'left' ? 'left' : handle?.dataset.side === 'right' ? 'right' : 'move';
            const editor = element.closest('arianna-video-track-editor');
            const track = element.closest('arianna-video-track');
            const owner = editor ?? track ?? element;
            const localPps = Math.max(1, numberAttribute(owner, 'pixels-per-second', 36));
            const minLength = Math.max(.04, 1 / Math.max(1, numberAttribute(owner, 'framerate', 25)));
            const initial = {
                x: event.clientX,
                start: Math.max(0, numberAttribute(element, 'start', 0)),
                length: Math.max(minLength, numberAttribute(element, 'length', numberAttribute(element, 'duration', 1))),
                sourceStart: Math.max(0, numberAttribute(element, 'source-start', numberAttribute(element, 'source-in', 0))),
                speed: Math.max(.05, numberAttribute(element, 'speed', 1))
            };
            select();
            event.preventDefault();
            event.stopPropagation();
            element.dataset.dragging = 'true';
            try { element.setPointerCapture(event.pointerId); } catch {}

            const move = (moveEvent: PointerEvent): void => {
                if(moveEvent.pointerId !== event.pointerId) return;
                const delta = (moveEvent.clientX - initial.x) / localPps;
                if(mode === 'move') {
                    element.setAttribute('start', String(snapTime(Math.max(0, initial.start + delta))));
                    const lane = document.elementsFromPoint(moveEvent.clientX, moveEvent.clientY)
                        .map(node => node.closest?.('.VideoTrack-Lane')).find(Boolean) as HTMLElement | undefined;
                    if(lane && lane !== element.parentElement) lane.appendChild(element);
                } else if(mode === 'right') {
                    element.setAttribute('length', String(Math.max(minLength, snapTime(initial.length + delta))));
                } else {
                    const proposed = snapTime(Math.max(0, initial.start + delta));
                    const maximumStart = initial.start + initial.length - minLength;
                    const nextStart = Math.min(proposed, maximumStart);
                    const shift = nextStart - initial.start;
                    element.setAttribute('start', String(nextStart));
                    element.setAttribute('length', String(initial.length - shift));
                    element.setAttribute('source-start', String(Math.max(0, initial.sourceStart + shift * initial.speed)));
                }
                EnsureVideoPartVisual(element);
                emit('arianna:video-part-change', { mode });
            };
            const finish = (finishEvent: PointerEvent): void => {
                if(finishEvent.pointerId !== event.pointerId) return;
                window.removeEventListener('pointermove', move, true);
                window.removeEventListener('pointerup', finish, true);
                window.removeEventListener('pointercancel', finish, true);
                delete element.dataset.dragging;
                try { element.releasePointerCapture(event.pointerId); } catch {}
                emit('arianna:video-part-commit', { mode });
            };
            window.addEventListener('pointermove', move, true);
            window.addEventListener('pointerup', finish, true);
            window.addEventListener('pointercancel', finish, true);
        });
    }

}

@Component('arianna-video-part', VideoPartStyles, {
    Shadow: false,
    Attributes: ['start','length','duration','source-start','source-in','src','source','label','name','color','theme','speed','opacity','fade-in','fade-out','volume','muted','locked','poster','frames','pixels-per-second','snap','framerate']
})
export class VideoPartElement extends HTMLElement {
    public static readonly Styles = VideoPartStyles;
    public template = html``;

    public onCreated(): void { if(this.isConnected) this.onConnected(); }

    public onConnected(): void {
        this.classList.add('VideoPart');
        if(!this.hasAttribute('theme')) {
            const parentTheme = this.closest('arianna-video-track,arianna-video-track-editor')?.getAttribute('theme');
            this.setAttribute('theme', parentTheme === 'light' ? 'light' : 'dark');
        }
        if(!this.hasAttribute('tabindex')) this.tabIndex = 0;
        this.renderClip();
        this.syncVisuals();
        this.bindClip();
    }

    public onAttributeChanged(name: string): void {
        if(!this.isConnected) return;
        if(!VideoPartReactiveAttributes.has(name)) return;
        this.syncVisuals();
    }

    public get start(): number { return Math.max(0, numberAttribute(this, 'start', 0)); }
    public set start(value: number) { this.setAttribute('start', String(Math.max(0, numberValue(value, 0)))); }
    public get length(): number { return Math.max(this.minimumLength(), numberAttribute(this, 'length', numberAttribute(this, 'duration', 1))); }
    public set length(value: number) { this.setAttribute('length', String(Math.max(this.minimumLength(), numberValue(value, 1)))); }
    public get duration(): number { return this.length; }
    public set duration(value: number) { this.length = value; }
    public get sourceStart(): number { return Math.max(0, numberAttribute(this, 'source-start', numberAttribute(this, 'source-in', 0))); }
    public set sourceStart(value: number) { this.setAttribute('source-start', String(Math.max(0, numberValue(value, 0)))); }
    public get sourceIn(): number { return this.sourceStart; }
    public set sourceIn(value: number) { this.sourceStart = value; }
    public get src(): string { return this.getAttribute('src') || this.getAttribute('source') || ''; }
    public set src(value: string) { value ? this.setAttribute('src', value) : this.removeAttribute('src'); }
    public get source(): string { return this.src; }
    public set source(value: string) { this.src = value; }
    public get label(): string { return this.getAttribute('label') || this.getAttribute('name') || 'Video'; }
    public set label(value: string) { this.setAttribute('label', value || 'Video'); }
    public get name(): string { return this.label; }
    public set name(value: string) { this.label = value; }
    public get color(): string { return this.getAttribute('color') || '#4d9de0'; }
    public set color(value: string) { this.setAttribute('color', value || '#4d9de0'); }
    public get theme(): VideoTheme { return this.getAttribute('theme') === 'light' ? 'light' : 'dark'; }
    public set theme(value: VideoTheme) { this.setAttribute('theme', value === 'light' ? 'light' : 'dark'); }
    public get speed(): number { return Math.max(.05, numberAttribute(this, 'speed', 1)); }
    public set speed(value: number) { this.setAttribute('speed', String(Math.max(.05, numberValue(value, 1)))); }
    public get opacity(): number { return clamp(numberAttribute(this, 'opacity', 1), 0, 1); }
    public set opacity(value: number) { this.setAttribute('opacity', String(clamp(numberValue(value, 1), 0, 1))); }
    public get fadeIn(): number { return clamp(numberAttribute(this, 'fade-in', 0), 0, this.length); }
    public set fadeIn(value: number) { this.setAttribute('fade-in', String(clamp(numberValue(value, 0), 0, this.length))); }
    public get fadeOut(): number { return clamp(numberAttribute(this, 'fade-out', 0), 0, this.length); }
    public set fadeOut(value: number) { this.setAttribute('fade-out', String(clamp(numberValue(value, 0), 0, this.length))); }
    public get volume(): number { return clamp(numberAttribute(this, 'volume', 1), 0, 1); }
    public set volume(value: number) { this.setAttribute('volume', String(clamp(numberValue(value, 1), 0, 1))); }
    public get muted(): boolean { return this.hasAttribute('muted'); }
    public set muted(value: boolean) { boolAttribute(this, 'muted', value); }
    public get locked(): boolean { return this.hasAttribute('locked'); }
    public set locked(value: boolean) { boolAttribute(this, 'locked', value); }
    public get poster(): string { return this.getAttribute('poster') || ''; }
    public set poster(value: string) { value ? this.setAttribute('poster', value) : this.removeAttribute('poster'); }
    public get frames(): string[] { return [...(runtimeFor(this).frames.length ? runtimeFor(this).frames : attributeFrames(this))]; }
    public set frames(value: string[]) { runtimeFor(this).frames = (Array.isArray(value) ? value : []).map(String).filter(Boolean); syncFilmstrip(this); }

    public setOptions(options: VideoPartOptions): this { applyVideoPartOptions(this, options); return this; }

    public snapshot(): VideoPartSnapshot {
        return {
            id: this.id || '', start: this.start, length: this.length, duration: this.length,
            sourceStart: this.sourceStart, sourceIn: this.sourceStart, src: this.src, source: this.src,
            label: this.label, name: this.label, color: this.color, theme: this.theme,
            speed: this.speed, opacity: this.opacity, fadeIn: this.fadeIn, fadeOut: this.fadeOut,
            volume: this.volume, muted: this.muted, locked: this.locked,
            poster: this.poster, frames: this.frames
        };
    }

    public split(at: number): VideoPart | null {
        const minimum = this.minimumLength();
        const cut = clamp(numberValue(at, this.start + this.length / 2), this.start + minimum, this.start + this.length - minimum);
        if(cut <= this.start || cut >= this.start + this.length) return null;
        const original = this.snapshot();
        const leftLength = cut - this.start;
        const rightLength = this.start + this.length - cut;
        this.length = leftLength;
        this.fadeOut = 0;
        const right = document.createElement('arianna-video-part') as VideoPart;
        applyVideoPartOptions(right, {
            ...original,
            id: '',
            start: cut,
            length: rightLength,
            sourceStart: original.sourceStart + leftLength * original.speed,
            fadeIn: 0,
            fadeOut: original.fadeOut
        });
        this.parentElement?.insertBefore(right, this.nextSibling);
        this.emit('arianna:video-part-split', { left: this, right, at: cut });
        return right;
    }

    private renderClip(): void {
        if(this.querySelector(':scope > .VideoPart-Label')) return;
        const label = document.createElement('div');
        label.className = 'VideoPart-Label';
        const strip = document.createElement('div');
        strip.className = 'VideoPart-Filmstrip';
        for(let index = 0; index < 8; index++) {
            const frame = document.createElement('span');
            frame.className = 'VideoPart-Frame';
            strip.appendChild(frame);
        }
        const audio = document.createElement('span');
        audio.className = 'VideoPart-AudioBand';
        const fadeIn = document.createElement('span');
        fadeIn.className = 'VideoPart-Fade';
        fadeIn.dataset.side = 'in';
        const fadeOut = document.createElement('span');
        fadeOut.className = 'VideoPart-Fade';
        fadeOut.dataset.side = 'out';
        const left = document.createElement('span');
        left.className = 'VideoPart-Handle';
        left.dataset.side = 'left';
        const right = document.createElement('span');
        right.className = 'VideoPart-Handle';
        right.dataset.side = 'right';
        this.replaceChildren(label, strip, audio, fadeIn, fadeOut, left, right);
    }

    private syncVisuals(): void {
        this.style.setProperty('--VideoPart-Color', this.color);
        this.style.left = `${this.start * this.pixelsPerSecond()}px`;
        this.style.width = `${Math.max(14, this.length * this.pixelsPerSecond())}px`;
        this.style.opacity = String(this.opacity);
        const fadeIn = this.querySelector<HTMLElement>(':scope > .VideoPart-Fade[data-side="in"]');
        const fadeOut = this.querySelector<HTMLElement>(':scope > .VideoPart-Fade[data-side="out"]');
        if(fadeIn) { fadeIn.style.width = `${this.fadeIn * this.pixelsPerSecond()}px`; fadeIn.hidden = this.fadeIn <= 0; }
        if(fadeOut) { fadeOut.style.width = `${this.fadeOut * this.pixelsPerSecond()}px`; fadeOut.hidden = this.fadeOut <= 0; }
        const label = this.querySelector<HTMLElement>('.VideoPart-Label');
        if(label) label.textContent = this.label;
        ApplyCriticalVideoPartLayout(this);
        syncFilmstrip(this);
    }

    private bindClip(): void {
        const state = runtimeFor(this);
        if(state.bound) return;
        state.bound = true;
        Runtime.set(this, state);

        this.addEventListener('click', event => {
            event.stopPropagation();
            this.selectClip();
        });

        this.addEventListener('pointerdown', (event: PointerEvent) => {
            if(event.button !== 0 || this.locked || this.closest('arianna-video-track[locked]')) return;
            const target = event.target as HTMLElement;
            const handle = target.closest('.VideoPart-Handle') as HTMLElement | null;
            const mode = handle?.dataset.side === 'left' ? 'left' : handle?.dataset.side === 'right' ? 'right' : 'move';
            const initial = { x: event.clientX, start: this.start, length: this.length, sourceStart: this.sourceStart };
            this.selectClip();
            event.preventDefault();
            event.stopPropagation();
            this.dataset.dragging = 'true';
            try { this.setPointerCapture(event.pointerId); } catch {}

            const move = (moveEvent: PointerEvent): void => {
                if(moveEvent.pointerId !== event.pointerId) return;
                const delta = (moveEvent.clientX - initial.x) / this.pixelsPerSecond();
                if(mode === 'move') {
                    this.start = this.snapTime(Math.max(0, initial.start + delta));
                    const lane = document.elementsFromPoint(moveEvent.clientX, moveEvent.clientY)
                        .map(element => element.closest?.('.VideoTrack-Lane'))
                        .find(Boolean) as HTMLElement | undefined;
                    if(lane && lane !== this.parentElement) lane.appendChild(this);
                } else if(mode === 'right') {
                    this.length = Math.max(this.minimumLength(), this.snapTime(initial.length + delta));
                } else {
                    const nextStart = this.snapTime(Math.max(0, initial.start + delta));
                    const maximumStart = initial.start + initial.length - this.minimumLength();
                    const start = Math.min(nextStart, maximumStart);
                    const shift = start - initial.start;
                    this.start = start;
                    this.length = initial.length - shift;
                    this.sourceStart = Math.max(0, initial.sourceStart + shift * this.speed);
                }
                this.emit('arianna:video-part-change', { mode });
            };

            const finish = (finishEvent: PointerEvent): void => {
                if(finishEvent.pointerId !== event.pointerId) return;
                window.removeEventListener('pointermove', move, true);
                window.removeEventListener('pointerup', finish, true);
                window.removeEventListener('pointercancel', finish, true);
                delete this.dataset.dragging;
                try { this.releasePointerCapture(event.pointerId); } catch {}
                this.emit('arianna:video-part-commit', { mode });
            };

            window.addEventListener('pointermove', move, true);
            window.addEventListener('pointerup', finish, true);
            window.addEventListener('pointercancel', finish, true);
        });

        this.addEventListener('keydown', (event: KeyboardEvent) => {
            if(event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                const direction = event.key === 'ArrowLeft' ? -1 : 1;
                this.start = Math.max(0, this.start + direction * (event.shiftKey ? 1 : this.frameDuration()));
                this.emit('arianna:video-part-change', { mode: 'nudge' });
            }
            if(event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault();
                this.emit('arianna:video-part-delete');
            }
        });
    }

    private selectClip(): void {
        const editor = this.closest('arianna-video-track-editor');
        editor?.querySelectorAll('arianna-video-part[selected]').forEach(node => { if(node !== this) node.removeAttribute('selected'); });
        this.setAttribute('selected', '');
        this.focus();
        this.emit('arianna:video-part-select');
    }

    private pixelsPerSecond(): number {
        const editor = this.closest('arianna-video-track-editor');
        const track = this.closest('arianna-video-track');
        return Math.max(1, numberAttribute(editor ?? track ?? this, 'pixels-per-second', 36));
    }

    private frameDuration(): number {
        const editor = this.closest('arianna-video-track-editor');
        return 1 / Math.max(1, numberAttribute(editor ?? this, 'framerate', 25));
    }

    private minimumLength(): number { return Math.max(.04, this.frameDuration()); }

    private snapTime(value: number): number {
        const editor = this.closest('arianna-video-track-editor');
        if(editor?.getAttribute('magnetic-snap') === 'false') return Math.max(0, value);
        const explicit = numberAttribute(editor ?? this, 'snap', 0);
        const milliseconds = numberAttribute(editor ?? this, 'snap-ms', 0);
        const step = explicit > 0 ? explicit : milliseconds > 0 ? milliseconds / 1000 : this.frameDuration();
        return Math.max(0, Math.round(value / step) * step);
    }

    private emit(type: string, detail: Record<string, unknown> = {}): void {
        this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: { ...detail, part: this, source: this } }));
    }
}

/** Public instance type of the AriannA-upgraded video part element. */
export type VideoPart = VideoPartElement;

type VideoPartConstructor = {
    new(options?: VideoPartOptions): VideoPartElement;
    readonly prototype: VideoPartElement;
    readonly Styles: Css.Stylesheet;
};

/*
 * Direct construction must use AriannA's synchronous creation path. Calling
 * the native HTMLElement subclass constructor directly is illegal in browsers
 * because AriannA intentionally does not register W3C customElements.
 */
export const VideoPart = new Proxy(
    VideoPartElement as unknown as VideoPartConstructor,
    {
        construct(_target, args): VideoPartElement {
            const element = new Real('arianna-video-part').render() as VideoPartElement;
            applyVideoPartOptions(element, (args[0] ?? {}) as VideoPartOptions);
            return element;
        }
    }
) as VideoPartConstructor;

export const VideoPartComponent = VideoPart;
export default VideoPart;
