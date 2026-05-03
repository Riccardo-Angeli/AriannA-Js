/**
 * @module    arianna-audio
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * AriannA audio components — MIDI editors, transport players, mixer
 * channel strips, multi-track editors. All Web Audio-based, all
 * connect/disconnect routable via the AudioComponent base class.
 *
 * @example
 *   import {
 *     PianoRoll, AudioPlayer, VideoPlayer,
 *     ChannelStrip, AudioTrackEditor, VideoTrackEditor,
 *   } from 'ariannajs/components/audio';
 */

export { PianoRoll }            from './PianoRoll.ts';
export { AudioPlayer }          from './AudioPlayer.ts';
export { VideoPlayer }          from '../../../../../../files/VideoPlayer.ts';
export { ChannelStrip }         from './ChannelStrip.ts';
export { AudioTrackEditor }     from './AudioTrackEditor.ts';
export { VideoTrackEditor }     from '../../../../../../files/VideoTrackEditor.ts';
export { AudioEditor }          from './AudioEditor.ts';

export type {
    PianoRollNote, PianoRollOptions, ExportedSequence,
    MidiEvent, Tool, RunState,
} from './PianoRoll.ts';

export type { AudioPlayerOptions }      from './AudioPlayer.ts';
export type { VideoPlayerOptions }      from '../../../../../../files/VideoPlayer.ts';
export type {
    ChannelStripOptions, EQBand, EQBandSettings,
} from './ChannelStrip.ts';
export type {
    AudioTrack, AudioClip, AudioTrackEditorOptions,
} from './AudioTrackEditor.ts';
export type {
    VideoTrack, VideoClip, VideoSource,
    VideoTrackEditorOptions, ExportedProject,
} from '../../../../../../files/VideoTrackEditor.ts';
export type { AudioEditorOptions } from './AudioEditor.ts';
