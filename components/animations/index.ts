/**
 * @module components/animations
 * @version 2.0.0
 *
 * Blender-style Action Editor / Dope Sheet + F-Curves + onion-skinning.
 * Keyframes use the canonical AriannA round marker.
 */
export { Keyframe } from './Keyframe.ts';
export type { KeyframeOptions, KeyframeInterpolation } from './Keyframe.ts';

export { AnimTrack } from './AnimTrack.ts';
export type { AnimTrackOptions, ChannelGroup } from './AnimTrack.ts';

export { KeyframeEditor } from './KeyframeEditor.ts';
export type { KeyframeEditorOptions, KeyframeEditorTrack } from './KeyframeEditor.ts';

export { CurveEditor } from './CurveEditor.ts';
export type { CurveEditorOptions, CurveSample, CurvePoint } from './CurveEditor.ts';

export { OnionStage } from './OnionStage.ts';
export type { OnionStageOptions, SnapshotProvider } from './OnionStage.ts';
