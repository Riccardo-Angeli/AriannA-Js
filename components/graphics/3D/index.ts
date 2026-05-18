/**
 * @module    components/graphics/3D
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Barrel — 3D editor UI primitives. Importing this module side-effect-registers
 * 3 custom-element tags + re-exports the classes and shared types used by
 * Wires, Daedalus, and any AriannA 3D editor.
 *
 * # Tags registered
 *
 *   arianna-camera-viewer-3d        CameraViewer3D (4-pane viewport)
 *   arianna-materials-palette       MaterialsPalette (PBR + classic kinds)
 *   arianna-modifiers-3d-palette    Modifiers3DPalette (modifier stack)
 *
 * These widgets do NOT include a renderer — they own UI, state, and
 * interaction. The renderer (three.js / WebGPU / SVG) is the consumer's
 * responsibility; mount it into the surfaces exposed by these widgets and
 * subscribe to their events.
 *
 * Heavier 3D geometry primitives (modifier classes themselves, viewports)
 * are slated for the standalone `arianna-viewport-3d` enterprise package,
 * roadmapped in `3D_ENTERPRISE_ROADMAP.md`.
 */

export { CameraViewer3D } from './CameraViewer3D.ts';
export type {
    PaneId, ProjectionKind, Vec3, Camera, Pane, CameraViewer3DOptions,
} from './CameraViewer3D.ts';

export { MaterialsPalette } from './MaterialsPalette.ts';
export type {
    MaterialKind, MaterialDef, MaterialsPaletteOptions,
} from './MaterialsPalette.ts';

export { Modifiers3DPalette } from './Modifiers3DPalette.ts';
export type {
    ModifierKind, ModifierEntry, Modifiers3DPaletteOptions,
} from './Modifiers3DPalette.ts';
