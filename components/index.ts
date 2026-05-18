/**
 * @module    components
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * AriannA Components 2.0 — top-level barrel.
 *
 * # Folder map (16 modules)
 *
 *   animations/   — Blender-style Action Editor + F-Curves + Onion
 *   audio/        — Web Audio widgets
 *   charts/       — generic SVG charts (bar/line/pie)             ← canonical LineChart
 *   composite/    — NodeEditor (Daedalus), Chat
 *   data/         — tree view
 *   display/      — atomic visual surfaces                         ← canonical Chip
 *   finance/      — finance-specialized charts + screener
 *                   (LineChart re-exported as FinanceLineChart)
 *   graphics/     — 2D + 3D graphics + colors
 *                   (ColorPicker re-exported as GraphicsColorPicker)
 *   inputs/       — forms, pickers, calendars                      ← canonical ColorPicker
 *                   (Chip re-exported as InputChip)
 *   layout/       — containers, panels, windows, table
 *   maps/         — multi-provider maps
 *   modifiers/    — 2D + 3D modifiers
 *   navigation/   — header, sidebar, menu, etc.
 *   payments/     — gateway + providers
 *   shipments/    — shipment trackers
 *   video/        — VideoPlayer
 *
 * The AriannA component surface (`attrSignal`, `fire`, `render`, `Sheet`,
 * `template`, lifecycle hooks) is declared by the `AriannaElement` interface
 * in `core/Component.ts` itself — the factory's return type uses it, so
 * subclasses inherit the surface automatically with no separate ambient
 * declaration file needed.
 *
 * Name conflicts resolved by aliasing the non-canonical export:
 *
 *   LineChart      canonical: charts/                  alias: FinanceLineChart       (finance/)
 *   Chip           canonical: display/                 alias: InputChip              (inputs/)
 *   ColorPicker    canonical: inputs/                  alias: GraphicsColorPicker    (graphics/colors/)
 */

// Modules without name conflicts — bulk re-export.
export * from './animations/index.ts';
export * from './audio/index.ts';
export * from './charts/index.ts';              // canonical LineChart
export * from './composite/index.ts';
export * from './data/index.ts';
export * from './display/index.ts';             // canonical Chip
export * from './layout/index.ts';
export * from './maps/index.ts';
export * from './modifiers/index.ts';
export * from './navigation/index.ts';
export * from './payments/index.ts';
export * from './shipments/index.ts';
export * from './video/index.ts';

// ── finance — alias LineChart, re-export everything else ───────────────────
export {
    CandlestickChart,
    DepthChart,
    HeatmapChart,
    PortfolioDonut,
    PnLChart,
    RiskGauge,
    OrderBook,
    Screener,
    Sparkline,
    LineChart as FinanceLineChart,
} from './finance/index.ts';

// ── inputs — alias Chip, canonical ColorPicker, re-export everything else ──
export {
    Button,
    Switch,
    Checkbox,
    Radio,
    TextField,
    SearchBar,
    Dropdown,
    Rating,
    FileUpload,
    TimePicker,
    ColorPicker,
    RangeSlider,
    Calendar,
    DatePicker,
    RichTextEditor,
    Chip as InputChip,
} from './inputs/index.ts';

// ── graphics — alias ColorPicker, re-export everything else ────────────────
export {
    // 2D
    Canvas2D,
    BezierEditor,
    LayersPanel,
    LinesPalette2D,
    ToolsPalette,
    // 3D
    CameraViewer3D,
    MaterialsPalette,
    Modifiers3DPalette,
    // colors (canonical inputs/ColorPicker — aliasing this one)
    ColorPickerSquare,
    ColorPickerTile,
    ColorPickerWheel,
    LinearGradientEditor,
    RadialGradientEditor,
    ShapeGradientEditor,
    ColorPicker as GraphicsColorPicker,
} from './graphics/index.ts';

// Re-export the colour utility functions (not classes)
export { parseHex, rgbToHex, rgbToHsl, hslToRgb } from './graphics/colors/ColorPicker.ts';
