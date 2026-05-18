/**
 * @module    components/graphics
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Barrel — graphics editor primitives. Importing this module side-effect-registers
 * all 15 graphics custom elements across three sub-folders:
 *
 *   colors/  — 7 tags  (4 picker styles + 3 gradient editors)
 *   2D/      — 5 tags  (Canvas2D, BezierEditor, LayersPanel, two palettes)
 *   3D/      — 3 tags  (CameraViewer3D, MaterialsPalette, Modifiers3DPalette)
 *
 * Total: 15 graphics tags.
 *
 * This is the surface used by Wires (the line-art studio), Daedalus (the
 * visual composer), and any third-party AriannA app that needs design-time
 * graphics controls. Renderer choice is left to the consumer.
 */

export * from './colors/index.ts';
export * from './2D/index.ts';
export * from './3D/index.ts';
