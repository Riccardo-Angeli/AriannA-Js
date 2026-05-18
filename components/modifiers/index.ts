/**
 * @module    components/modifiers
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * AriannA Modifiers — top-level barrel.
 *
 * Re-exports the 2D and 3D modifier surfaces. Importing this file
 * side-effect-registers all 22 declarative custom elements (6 in 2D, 16 in
 * 3D) plus exposes the programmatic classes and the shared base types.
 *
 * # Two families
 *
 *   2D — DOM-behavior modifiers. Drop as children of any host element to
 *        modify its behavior (resize handles, drag, rotate, flip, round,
 *        skew). They target `this.parentElement`.
 *
 *   3D — Three.ts mesh modifiers. Drop as children of `<arianna-viewport-3d>`
 *        next to a target `<arianna-mesh>` to apply geometry, animation,
 *        camera-driven, or pointer-driven behaviors.
 *
 * # Usage
 *
 *   // Side-effect import: registers all custom-element tags
 *   import 'arianna/components/modifiers';
 *
 *   // Named imports for programmatic use
 *   import {
 *       Modifiers2D, Modifiers3D,
 *       Resizer, Mover,                     // 2D class form
 *       TwistModifier, BendModifier,        // 3D class form
 *   } from 'arianna/components/modifiers';
 *
 * # Declarative example combining both families
 *
 *   <arianna-window>
 *     <arianna-resizer handles="se,sw,ne,nw"></arianna-resizer>
 *     <arianna-mover handle-selector=".titlebar"></arianna-mover>
 *     <div class="titlebar">My 3D Editor</div>
 *     <arianna-viewport-3d>
 *       <arianna-mesh id="m1" geometry="box"></arianna-mesh>
 *       <arianna-twist for="m1" angle="1.57"></arianna-twist>
 *       <arianna-bend  for="m1" angle="0.5" axis="z"></arianna-bend>
 *     </arianna-viewport-3d>
 *   </arianna-window>
 *
 * Tags registered when this barrel is imported:
 *
 *   2D family (6):
 *     arianna-resizer, arianna-mover, arianna-rotator,
 *     arianna-reflector, arianna-rounder, arianna-skewer
 *
 *   3D family (16 — 15 modifiers + 1 base):
 *     arianna-modifier-3d, arianna-bend, arianna-twist, arianna-bevel,
 *     arianna-inflate, arianna-decimate, arianna-subdivision, arianna-smooth,
 *     arianna-mirror, arianna-snap, arianna-wave, arianna-billboard,
 *     arianna-fade, arianna-lod, arianna-drag, arianna-array
 */

// ── 2D modifiers ──────────────────────────────────────────────────────────────

export * from './2D/index.ts';
export { default as Modifiers2D } from './2D/index.ts';

// ── 3D modifiers ──────────────────────────────────────────────────────────────

export * from './3D/index.ts';
export { default as Modifiers3D } from './3D/index.ts';

// ── Convenience combined bundle ───────────────────────────────────────────────

import Modifiers2DBundle from './2D/index.ts';
import Modifiers3DBundle from './3D/index.ts';

export const Modifiers = {
    ...Modifiers2DBundle,
    ...Modifiers3DBundle,
};
export default Modifiers;
