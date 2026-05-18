/**
 * @module    components/graphics/2D
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Barrel — 2D editor primitives. Importing this module side-effect-registers
 * 5 custom-element tags + re-exports the classes and shared types used by
 * Wires, Daedalus, and any AriannA 2D vector editor.
 *
 * # Tags registered
 *
 *   arianna-canvas-2d          Canvas2D (infinite pan/zoom viewport)
 *   arianna-bezier-editor      BezierEditor (cubic Bézier path editor)
 *   arianna-layers-panel       LayersPanel (Illustrator-style layer manager)
 *   arianna-lines-palette-2d   LinesPalette2D (profile-creation tools)
 *   arianna-tools-palette      ToolsPalette (generic select/pan/zoom etc.)
 *
 * The colour suite (`colors/`) is exposed from `components/graphics`
 * directly — not re-exported here — since it is logically peer-level.
 */

export { Canvas2D } from './Canvas2D.ts';
export type { Vec2, Canvas2DOptions } from './Canvas2D.ts';

export { BezierEditor } from './BezierEditor.ts';
export type { Anchor, BezierMode, BezierEditorOptions } from './BezierEditor.ts';

export { LayersPanel } from './LayersPanel.ts';
export type { Layer } from './LayersPanel.ts';

export { LinesPalette2D } from './LinesPalette2D.ts';
export type { LineTool, LinesPalette2DOptions } from './LinesPalette2D.ts';

export { ToolsPalette } from './ToolsPalette.ts';
export type { PaletteTool, ToolsPaletteOptions } from './ToolsPalette.ts';
