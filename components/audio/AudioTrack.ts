/**
 * @module components/audio/AudioTrack
 * @version 2.0.2
 * @description Standalone AudioTrack integration. Keeps the canonical runtime
 *              class owned by AudioTrackEditor while making M/S/R controls
 *              deterministic in both dark and light themes and loading the
 *              standalone AudioPart drag integration.
 */
import './AudioPart.ts';
import { AudioTrackEditor } from './AudioTrackEditor.ts';

const PrototypePatched = Symbol.for('AriannA.AudioTrack.PrototypePatched.2.0.2');
const ButtonBound      = Symbol.for('AriannA.AudioTrack.ButtonBound.2.0.2');

type TrackPrototype = AudioTrackEditor.AudioTrack & {
    [PrototypePatched]?: boolean;
};

type TrackButton = HTMLButtonElement & {
    [ButtonBound]?: boolean;
};

function Emit(track: AudioTrackEditor.AudioTrack, type: string, detail: Record<string, unknown>): void
{
    track.dispatchEvent(new CustomEvent(type, {
        bubbles: true,
        composed: true,
        detail: { ...detail, track, source: track }
    }));
}

function IsLight(track: AudioTrackEditor.AudioTrack): boolean
{
    return track.getAttribute('theme') === 'light' ||
        !!track.closest('.AudioTrackEditor[theme="light"], arianna-audio-track-editor[theme="light"]');
}

function PaintButton(button: HTMLButtonElement, action: string, active: boolean, light: boolean): void
{
    button.dataset.active = String(active);
    button.setAttribute('aria-pressed', String(active));

    // The original stylesheet has equal-specificity light rules after the
    // generic active rules. Inline active colours make the state unambiguous
    // without changing the public DOM contract, and are cleared when inactive.
    if(!active)
    {
        button.style.removeProperty('background');
        button.style.removeProperty('border-color');
        button.style.removeProperty('color');
        return;
    }

    if(action === 'mute')
    {
        button.style.background = '#e2aa2f';
        button.style.borderColor = '#a87612';
        button.style.color = '#201a08';
    }
    else if(action === 'solo')
    {
        button.style.background = '#6fc358';
        button.style.borderColor = '#3c882a';
        button.style.color = '#0d2208';
    }
    else if(action === 'record')
    {
        button.style.background = '#d9564d';
        button.style.borderColor = '#96332d';
        button.style.color = '#ffffff';
    }

    // Keep the branch explicit: light theme is the case that previously hid
    // the active state. Dark receives the same canonical active colours.
    void light;
}

function SyncButtons(track: AudioTrackEditor.AudioTrack): void
{
    const light = IsLight(track);
    const mute = track.querySelector<HTMLButtonElement>(':scope > .AudioTrack-Header [data-action="mute"]');
    const solo = track.querySelector<HTMLButtonElement>(':scope > .AudioTrack-Header [data-action="solo"]');
    const record = track.querySelector<HTMLButtonElement>(':scope > .AudioTrack-Header [data-action="record"]');

    if(mute) PaintButton(mute, 'mute', track.hasAttribute('muted'), light);
    if(solo) PaintButton(solo, 'solo', track.hasAttribute('soloed'), light);
    if(record) PaintButton(record, 'record', record.dataset.active === 'true', light);
}

function InstallControls(track: AudioTrackEditor.AudioTrack): void
{
    const header = track.querySelector<HTMLElement>(':scope > .AudioTrack-Header');
    const buttons = track.querySelector<HTMLElement>(':scope > .AudioTrack-Header > .AudioTrack-Buttons');

    // Explicit hit surface: Safari/WebKit can otherwise resolve the light lane
    // above the compact control row when elements overlap by a pixel.
    if(header)
    {
        header.style.position = 'relative';
        header.style.zIndex = '20';
        header.style.pointerEvents = 'auto';
    }
    if(buttons)
    {
        buttons.style.position = 'relative';
        buttons.style.zIndex = '21';
        buttons.style.pointerEvents = 'auto';
    }

    for(const raw of Array.from(track.querySelectorAll<HTMLButtonElement>(':scope > .AudioTrack-Header .AudioTrack-Button')))
    {
        const button = raw as TrackButton;
        button.style.pointerEvents = 'auto';
        button.disabled = false;
        if(Object.prototype.hasOwnProperty.call(button, ButtonBound)) continue;
        Object.defineProperty(button, ButtonBound, { value: true, configurable: true });

        button.addEventListener('click', (event: MouseEvent): void =>
        {
            event.preventDefault();
            event.stopImmediatePropagation();

            const action = button.dataset.action;
            if(action === 'mute')
            {
                track.toggleAttribute('muted');
                SyncButtons(track);
                Emit(track, 'arianna:track-mute', { muted: track.hasAttribute('muted') });
            }
            else if(action === 'solo')
            {
                track.toggleAttribute('soloed');
                SyncButtons(track);
                Emit(track, 'arianna:track-solo', { soloed: track.hasAttribute('soloed') });
            }
            else if(action === 'record')
            {
                const active = button.dataset.active !== 'true';
                button.dataset.active = String(active);
                SyncButtons(track);
                Emit(track, 'arianna:track-record', { recording: active });
            }
        }, true);
    }

    SyncButtons(track);
}

const Prototype = AudioTrackEditor.AudioTrack.prototype as TrackPrototype & {
    onConnected(): void;
    onAttributeChanged?(name: string): void;
};

if(!Object.prototype.hasOwnProperty.call(Prototype, PrototypePatched))
{
    Object.defineProperty(Prototype, PrototypePatched, { value: true, configurable: true });

    const Connected = Prototype.onConnected;
    const AttributeChanged = Prototype.onAttributeChanged;

    Prototype.onConnected = function(this: AudioTrackEditor.AudioTrack): void
    {
        Connected.call(this);
        InstallControls(this);

        this.querySelectorAll<AudioTrackEditor.AudioPart>(':scope > .AudioTrack-Lane > arianna-audio-part, :scope > .AudioTrack-Lane > .AudioPart')
            .forEach(part => part.onConnected?.());
    };

    Prototype.onAttributeChanged = function(this: AudioTrackEditor.AudioTrack, name: string): void
    {
        AttributeChanged?.call(this, name);
        if(name === 'muted' || name === 'soloed' || name === 'theme') InstallControls(this);
    };
}

if(typeof document !== 'undefined')
{
    queueMicrotask(() =>
    {
        document.querySelectorAll<AudioTrackEditor.AudioTrack>('arianna-audio-track, .AudioTrack')
            .forEach(track => InstallControls(track));
    });
}

export import AudioTrack = AudioTrackEditor.AudioTrack;
export type AudioTrackOptions = AudioTrackEditor.Interfaces.AudioTrackOptions;

export default AudioTrack;
