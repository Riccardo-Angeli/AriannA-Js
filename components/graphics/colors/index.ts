/**
 * @module    components/graphics/colors
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Barrel — colour suite. Importing this module side-effect-registers 7
 * custom-element tags + re-exports the classes and shared types.
 *
 * # Tags registered
 *
 *   arianna-color-picker-pro      ColorPicker (HSL+RGB integrated)
 *   arianna-color-picker-square   ColorPickerSquare (Photoshop-style)
 *   arianna-color-picker-tile     ColorPickerTile (palette grid)
 *   arianna-color-picker-wheel    ColorPickerWheel (HSL hue ring)
 *   arianna-linear-gradient-editor
 *   arianna-radial-gradient-editor
 *   arianna-shape-gradient-editor (freeform mesh)
 *
 * Shared math (`parseHex`, `rgbToHex`, `rgbToHsl`, `hslToRgb`) lives in
 * `ColorPicker.ts` and is re-exported here for downstream use.
 */

export { ColorPicker, parseHex, rgbToHex, rgbToHsl, hslToRgb } from './ColorPicker.ts';
export type { RGB, HSL, Color, ColorPickerOptions } from './ColorPicker.ts';

export { ColorPickerSquare } from './ColorPickerSquare.ts';
export type { ColorPickerSquareOptions } from './ColorPickerSquare.ts';

export { ColorPickerTile } from './ColorPickerTile.ts';
export type { ColorPickerTileOptions } from './ColorPickerTile.ts';

export { ColorPickerWheel } from './ColorPickerWheel.ts';
export type { ColorPickerWheelOptions } from './ColorPickerWheel.ts';

export {
    makeStopState, stopsToCss, sampleAt, sortStops, clamp01,
    colorFieldHex, parseColorString, DEFAULT_STOPS,
} from './GradientEditor.ts';
export type { RGBA, GradientStop, GradientEditorOptions } from './GradientEditor.ts';

export { LinearGradientEditor } from './LinearGradientEditor.ts';
export type { GradientInterp, LinearGradientEditorOptions } from './LinearGradientEditor.ts';

export { RadialGradientEditor } from './RadialGradientEditor.ts';
export type { RadialShape, RadialSize, RadialGradientEditorOptions } from './RadialGradientEditor.ts';

export { ShapeGradientEditor } from './ShapeGradientEditor.ts';
export type { ShapeStop, ShapeGradientEditorOptions } from './ShapeGradientEditor.ts';
