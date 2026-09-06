/**
 * @module components/audio
 * @version 2.0.0
 */
import { AudioComponent as AudioComponentModule } from './AudioComponent.ts';
import { TransportBar as TransportBarModule } from './TransportBar.ts';
import { AudioPlayer as AudioPlayerModule } from './AudioPlayer.ts';
import { ChannelStrip as ChannelStripModule } from './ChannelStrip.ts';
import { WaveformEditor as WaveformEditorModule } from './WaveformEditor.ts';
import { PianoRoll as PianoRollModule } from './PianoRoll.ts';
import { AudioTrackEditor as AudioTrackEditorModule } from './AudioTrackEditor.ts';
import AudioPartClass from './AudioPart.ts';
import AudioTrackClass from './AudioTrack.ts';

export const AudioComponent = AudioComponentModule.AudioComponent;
export const TransportBar = TransportBarModule.TransportBar;
export const AudioPlayer = AudioPlayerModule.AudioPlayer;
export const ChannelStrip = ChannelStripModule.ChannelStrip;
export const WaveformEditor = WaveformEditorModule.WaveformEditor;
export const PianoRoll = PianoRollModule.PianoRoll;
export const AudioTrackEditor = AudioTrackEditorModule.AudioTrackEditor;
export const AudioTrack = AudioTrackClass;
export const AudioPart = AudioPartClass;

export type AudioComponentOptions = AudioComponentModule.AudioComponentOptions;
export type TransportBarOptions = TransportBarModule.Interfaces.TransportBarOptions;
export type AudioPlayerOptions = AudioPlayerModule.Interfaces.AudioPlayerOptions;
export type ChannelStripOptions = ChannelStripModule.Interfaces.ChannelStripOptions;
export type WaveformEditorOptions = WaveformEditorModule.Interfaces.WaveformEditorOptions;
export type PianoRollOptions = PianoRollModule.Interfaces.PianoRollOptions;
export type PianoNote = PianoRollModule.Interfaces.PianoNote;
export type AudioTrackEditorOptions = AudioTrackEditorModule.Interfaces.AudioTrackEditorOptions;
export type AudioTrackOptions = AudioTrackEditorModule.Interfaces.AudioTrackOptions;
export type AudioPartOptions = AudioTrackEditorModule.Interfaces.AudioPartOptions;
