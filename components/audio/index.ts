/**
 * @module    components/audio
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Audio component barrel.
 */

import { AudioComponent as AudioComponentModule } from './AudioComponent.ts';
import { TransportBar as TransportBarModule } from './TransportBar.ts';
import { AudioPlayer as AudioPlayerModule } from './AudioPlayer.ts';
import { ChannelStrip as ChannelStripModule } from './ChannelStrip.ts';
import { AudioEditor as AudioEditorModule } from './AudioEditor.ts';
import { PianoRoll as PianoRollModule } from './PianoRoll.ts';
import { AudioTrackEditor as AudioTrackEditorModule } from './AudioTrackEditor.ts';

export const AudioComponent = AudioComponentModule.AudioComponent;
export const TransportBar = TransportBarModule.TransportBar;
export const AudioPlayer = AudioPlayerModule.AudioPlayer;
export const ChannelStrip = ChannelStripModule.ChannelStrip;
export const AudioEditor = AudioEditorModule.AudioEditor;
export const PianoRoll = PianoRollModule.PianoRoll;
export const AudioTrackEditor = AudioTrackEditorModule.AudioTrackEditor;
export const AudioTrack = AudioTrackEditorModule.AudioTrack;
export const AudioPart = AudioTrackEditorModule.AudioPart;

export type AudioComponentOptions = AudioComponentModule.AudioComponentOptions;
export type TransportBarOptions = TransportBarModule.Interfaces.TransportBarOptions;
export type AudioPlayerOptions = AudioPlayerModule.Interfaces.AudioPlayerOptions;
export type ChannelStripOptions = ChannelStripModule.Interfaces.ChannelStripOptions;
export type AudioEditorOptions = AudioEditorModule.Interfaces.AudioEditorOptions;
export type PianoRollOptions = PianoRollModule.Interfaces.PianoRollOptions;
export type PianoNote = PianoRollModule.Interfaces.PianoNote;
export type AudioTrackEditorOptions = AudioTrackEditorModule.Interfaces.AudioTrackEditorOptions;
export type AudioTrackOptions = AudioTrackEditorModule.Interfaces.AudioTrackOptions;
export type AudioPartOptions = AudioTrackEditorModule.Interfaces.AudioPartOptions;
