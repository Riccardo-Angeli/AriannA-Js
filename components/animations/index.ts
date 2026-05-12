/**
 * @module    components/animations
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * Components for hand-keyed animation. Lives next to audio/video/composite/
 * graphics/etc. under components/, exposing UI widgets that drive arbitrary
 * objects via the IKeyframeTarget contract.
 *
 *   import { KeyframeEditor } from 'arianna/components/animations';
 */

export { KeyframeEditor } from "./KeyframeEditor.ts";

export type {
  EasingName,
  EasingDef,
  WrapMode,
  Keyframe,
  Property,
  NodeTrack,
  Clip,
  IKeyframeTarget,
  KeyframeEditorState,
  KeyframeEditorOptions,
} from "./KeyframeEditor.ts";
