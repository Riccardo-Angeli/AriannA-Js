/**
 * @module    components/audio
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * Audio widgets — built on a shared Web Audio graph through the
 * `AudioComponent` abstract base.
 *
 *   • AudioComponent    — abstract base (shared AudioContext + connect/disconnect)
 *   • TransportBar      — play/pause/seek UI (no audio of its own)
 *   • AudioPlayer       — file player with TransportBar (HTMLMediaElement → MediaElementSource)
 *   • ChannelStrip      — gain / pan / mute / solo with VU meter
 *   • AudioEditor       — single-buffer waveform editor (zoom, crop, fade)
 *   • PianoRoll         — MIDI piano roll editor
 *   • AudioTrackEditor  — multi-track DAW-style timeline (also exports AudioTrack + AudioPart)
 *
 *   import { AudioComponent, AudioPlayer, ChannelStrip } from 'arianna/components/audio';
 *
 *   await AudioComponent.resume();    // unlock after user gesture
 *   const player = new AudioPlayer({ src: 'song.mp3' });
 *   const strip  = new ChannelStrip({ name: 'Master' });
 *   player.connect(strip).connect(AudioComponent.context.destination);
 *   player.append(document.body);
 *   strip.append(document.body);
 */

export { AudioComponent } from './AudioComponent.ts';
export type { AudioComponentOptions } from './AudioComponent.ts';

export { TransportBar } from './TransportBar.ts';
export type { TransportBarOptions } from './TransportBar.ts';

export { AudioPlayer } from './AudioPlayer.ts';
export type { AudioPlayerOptions } from './AudioPlayer.ts';

export { ChannelStrip } from './ChannelStrip.ts';
export type { ChannelStripOptions } from './ChannelStrip.ts';

export { AudioEditor } from './AudioEditor.ts';
export type { AudioEditorOptions } from './AudioEditor.ts';

export { PianoRoll } from './PianoRoll.ts';
export type { PianoRollOptions, PianoNote } from './PianoRoll.ts';

export { AudioTrackEditor, AudioTrack, AudioPart } from './AudioTrackEditor.ts';
export type {
    AudioTrackEditorOptions,
    AudioTrackOptions,
    AudioPartOptions,
} from './AudioTrackEditor.ts';
