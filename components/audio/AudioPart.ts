/**
 * @module components/audio/AudioPart
 * @version 2.0.2
 * @description Standalone AudioPart integration for AriannA AudioTrack.
 *              The canonical runtime class remains AudioTrackEditor.AudioPart;
 *              this module installs the standalone horizontal drag behaviour
 *              that is intentionally bypassed when the part belongs to an
 *              AudioTrackEditor (where the editor owns cross-track preview).
 */
import { AudioTrackEditor } from './AudioTrackEditor.ts';

const PrototypePatched = Symbol.for('AriannA.AudioPart.PrototypePatched.2.0.2');
const InstanceBound    = Symbol.for('AriannA.AudioPart.StandaloneDragBound.2.0.2');

type PatchedPrototype = AudioTrackEditor.AudioPart & {
    [PrototypePatched]?: boolean;
};

type PatchedInstance = AudioTrackEditor.AudioPart & {
    [InstanceBound]?: boolean;
};

type DragRuntime = {
    PointerId : number;
    StartX    : number;
    StartBeat : number;
};

function Track(part: HTMLElement): HTMLElement | null
{
    return part.closest('arianna-audio-track, .AudioTrack') as HTMLElement | null;
}

function Lane(part: HTMLElement): HTMLElement | null
{
    return part.closest('.AudioTrack-Lane') as HTMLElement | null;
}

function BeatPixels(part: HTMLElement): number
{
    const track = Track(part);
    const value = Number(track?.getAttribute('beat-px') ?? 28);
    return Number.isFinite(value) && value > 0 ? value : 28;
}

function Snap(part: HTMLElement, value: number): number
{
    const track = Track(part);
    const raw = Number(track?.getAttribute('snap') ?? .25);
    const step = Number.isFinite(raw) && raw > 0 ? raw : .25;
    return Math.round(value / step) * step;
}

function NumberAttribute(element: Element, name: string, fallback: number): number
{
    const value = Number(element.getAttribute(name) ?? fallback);
    return Number.isFinite(value) ? value : fallback;
}

/** Install the true standalone drag path on one AudioPart instance. */
function InstallStandaloneDrag(part: AudioTrackEditor.AudioPart): void
{
    const host = part as PatchedInstance;

    // IMPORTANT: this must be an OWN instance flag. The previous implementation
    // reused the prototype patch symbol; because property lookup walks the
    // prototype chain every instance looked "already bound" and the drag handler
    // was never installed.
    if(Object.prototype.hasOwnProperty.call(host, InstanceBound)) return;
    Object.defineProperty(host, InstanceBound, { value: true, configurable: true });

    let drag: DragRuntime | null = null;

    const move = (event: PointerEvent): void =>
    {
        if(!drag || event.pointerId !== drag.PointerId) return;

        const lane = Lane(host);
        if(!lane) return;

        event.preventDefault();

        const beatPx = BeatPixels(host);
        const delta = (event.clientX - drag.StartX) / beatPx;
        const length = Math.max(.125, NumberAttribute(host, 'length', 4));
        const laneBeats = Math.max(length, lane.getBoundingClientRect().width / beatPx);
        const maxStart = Math.max(0, laneBeats - length);
        const next = Math.max(0, Math.min(maxStart, Snap(host, drag.StartBeat + delta)));

        // Move the real part, not a ghost. This is the same model used by the
        // editor after its preview resolves, and makes the standalone examples
        // visibly follow the pointer on every pointermove.
        host.start = next;

        host.dispatchEvent(new CustomEvent('arianna:audio-part-change', {
            bubbles: true,
            composed: true,
            detail: { mode: 'move', start: next, part: host, source: host }
        }));
    };

    const finish = (event: PointerEvent): void =>
    {
        if(!drag || event.pointerId !== drag.PointerId) return;

        const state = drag;
        drag = null;

        window.removeEventListener('pointermove', move, true);
        window.removeEventListener('pointerup', finish, true);
        window.removeEventListener('pointercancel', finish, true);

        host.style.cursor = '';
        host.removeAttribute('data-dragging');
        try { host.releasePointerCapture(state.PointerId); } catch {}

        host.dispatchEvent(new CustomEvent('arianna:audio-part-commit', {
            bubbles: true,
            composed: true,
            detail: {
                mode: 'move',
                cancelled: event.type === 'pointercancel',
                start: NumberAttribute(host, 'start', 0),
                part: host,
                source: host
            }
        }));
    };

    // Capture is intentional: in standalone mode this handler owns horizontal
    // move before the canonical AudioPart bubble listener starts its editor path.
    host.addEventListener('pointerdown', (event: PointerEvent): void =>
    {
        if(event.button !== 0) return;

        // Inside AudioTrackEditor the canonical editor path already works and
        // supports cross-track preview/drop. Never interfere with it.
        if(host.closest('arianna-audio-track-editor, .AudioTrackEditor')) return;

        const target = event.target as Element | null;
        if(target?.closest('.AudioPart-Resize')) return; // keep trim handles canonical

        const lane = Lane(host);
        if(!lane) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        drag = {
            PointerId : event.pointerId,
            StartX    : event.clientX,
            StartBeat : Math.max(0, NumberAttribute(host, 'start', 0))
        };

        host.setAttribute('selected', '');
        host.setAttribute('data-dragging', 'true');
        host.style.cursor = 'grabbing';
        host.focus();
        try { host.setPointerCapture(event.pointerId); } catch {}

        window.addEventListener('pointermove', move, true);
        window.addEventListener('pointerup', finish, true);
        window.addEventListener('pointercancel', finish, true);
    }, true);
}

const Prototype = AudioTrackEditor.AudioPart.prototype as PatchedPrototype & {
    onConnected(): void;
};

if(!Object.prototype.hasOwnProperty.call(Prototype, PrototypePatched))
{
    Object.defineProperty(Prototype, PrototypePatched, { value: true, configurable: true });
    const Connected = Prototype.onConnected;

    Prototype.onConnected = function(this: AudioTrackEditor.AudioPart): void
    {
        Connected.call(this);
        InstallStandaloneDrag(this);
    };
}

// Covers the rare case where this module is loaded after markup was already
// upgraded. It is harmless when the bundle is loaded normally before examples.
if(typeof document !== 'undefined')
{
    queueMicrotask(() =>
    {
        document.querySelectorAll<AudioTrackEditor.AudioPart>('arianna-audio-part, .AudioPart')
            .forEach(part => InstallStandaloneDrag(part));
    });
}

export import AudioPart = AudioTrackEditor.AudioPart;
export type AudioPartOptions = AudioTrackEditor.Interfaces.AudioPartOptions;

export default AudioPart;
