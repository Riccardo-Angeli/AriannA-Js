/**
 * @module components/audio/AudioPart
 * @version 2.0.0
 * @description Canonical standalone export of the AudioPart implementation owned by AudioTrackEditor.
 *              No second drag implementation is installed here: the exact move/resize path used by
 *              AudioTrackEditor is therefore also the one used by standalone AudioPart/AudioTrack.
 */
import { AudioTrackEditor } from './AudioTrackEditor.ts';

export import AudioPart = AudioTrackEditor.AudioPart;
export type AudioPartOptions = AudioTrackEditor.Interfaces.AudioPartOptions;

export default AudioPart;
