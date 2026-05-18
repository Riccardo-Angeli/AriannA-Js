/**
 * @module    components/animations
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * Animation widgets — Blender-style Action Editor / Dope Sheet + F-Curves
 * + onion-skinning overlay.
 *
 *   • Keyframe         — single key on a track (◆ diamond)
 *   • AnimTrack        — one channel row (X Location, W Quaternion Rotation, …)
 *   • KeyframeEditor   — root container with toolbar, ruler, playhead, tracks
 *   • CurveEditor      — F-Curve panel (cyan position / orange rotation)
 *   • OnionStage       — past/future ghost overlay synced with playhead
 *
 *   import { KeyframeEditor, AnimTrack, Keyframe, CurveEditor } from 'arianna/components/animations';
 *
 *   const ed = new KeyframeEditor({ frameStart: 0, frameEnd: 240, autoChannels: true });
 *   ed.append(document.body);
 *
 *   const ce = new CurveEditor();
 *   ce.append(document.body);
 *   ce.bindEditor((ed as unknown as { render(): HTMLElement }).render());
 *
 *   // Add keyframes programmatically:
 *   const trX = ed.querySelector("arianna-anim-track[channel='loc-x']") as HTMLElement;
 *   if (trX) trX.appendChild(new Keyframe({ frame: 24, value: 5 }));
 */

export { Keyframe }         from './Keyframe.ts';
export type { KeyframeOptions, KeyframeInterpolation } from './Keyframe.ts';

export { AnimTrack }        from './AnimTrack.ts';
export type { AnimTrackOptions, ChannelGroup }        from './AnimTrack.ts';

export { KeyframeEditor }   from './KeyframeEditor.ts';
export type { KeyframeEditorOptions }                 from './KeyframeEditor.ts';

export { CurveEditor }      from './CurveEditor.ts';
export type { CurveEditorOptions }                    from './CurveEditor.ts';

export { OnionStage }       from './OnionStage.ts';
export type { OnionStageOptions, SnapshotProvider }   from './OnionStage.ts';
