/**
 * @module components/audio/AudioTrack
 * @version 2.0.0
 * @description Canonical standalone export of the AudioTrack implementation owned by AudioTrackEditor.
 *              beatPx / beat-px and trackHeight / track-height control the independent X/Y sliders.
 *              editMode / edit-mode switches safely between AudioPart editing and a fully hideable automation overlay.
 *              activeAutomation selects the visible automation lane without discarding the others.
 *              Its child AudioParts use exactly the same horizontal drag implementation as the editor.
 */
import { AudioTrackEditor } from './AudioTrackEditor.ts';

export import AudioTrack = AudioTrackEditor.AudioTrack;
export type AudioTrackOptions = AudioTrackEditor.Interfaces.AudioTrackOptions;
export type AudioTrackEditMode = AudioTrackEditor.Types.EditMode;

export default AudioTrack;
