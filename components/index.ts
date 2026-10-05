/**
 * @module    components
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * AriannA Components 2.0 — top-level barrel.
 *
 * # Folder map (17 modules)
 *
 *   animations/   — Blender-style Action Editor + F-Curves + Onion
 *   audio/        — Web Audio widgets
 *   automotive/   — digital automotive cockpit
 *   charts/       — generic SVG charts (bar/line/pie)             ← canonical LineChart
 *   composite/    — Workflow (Daedalus), Chat, CodeEditor
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
 *   graphics/2D/modifiers/ — 2D modifiers
 *   graphics/3D/modifiers/ — 3D modifiers
 *   navigation/   — header, sidebar, menu, etc.
 *   project/      — Kanban / project work surfaces
 *   video/        — VideoPlayer + NLE timeline / tracks / parts
 *
 * The AriannA component surface (`signal().attribute`, `fire`, `render`, `Sheet`,
 * `template`, lifecycle hooks) is declared by the `AriannaElement` interface
 * in `core/Components.ts` itself — the factory's return type uses it, so
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
export * from './automotive/index.ts';
export * from './charts/index.ts'; // canonical LineChart
export * from './composite/index.ts';
export * from './display/index.ts'; // canonical Chip
export * from './layout/index.ts'; // canonical Table (also exposed via data/Table re-export)
export * from './maps/index.ts';
// Modifiers now live under graphics/{2D,3D}/modifiers, but remain top-level exports.
export * from './graphics/2D/modifiers/index.ts';
export * from './graphics/3D/modifiers/index.ts';
export * from './navigation/index.ts';
export * from './project/index.ts';
export * from './timeline/index.ts';
export * from './video/index.ts';
// data — Table is already exported by layout/ (canonical source); we only
// re-export what's unique to data here.
export { TreeView } from './data/TreeView.ts';
export type { TreeNode, TreeViewOptions } from './data/TreeView.ts';
// ── finance — alias LineChart, re-export everything else ───────────────────
export { CandlestickChart, DepthChart, HeatmapChart, PortfolioDonut, PnLChart, RiskGauge, OrderBook, Screener, Sparkline, AlertBadge, FinanceLineChart, } from './finance/index.ts';
// ── inputs — alias Chip, canonical ColorPicker, re-export everything else ──
export { Button, Switch, Checkbox, Radio, TextField, SearchBar, Dropdown, Rating, FileUpload, TimePicker, ColorPicker, RangeSlider, Calendar, DatePicker, RichTextEditor, InputChip, } from './inputs/index.ts';
// ── graphics — alias ColorPicker, re-export everything else ────────────────
export { 
// 2D
Canvas2D, Grid2D, SelectionRectangle, LineEditor, Align, Layer, Layers, Strokes, Tools2D,
// 3D
Canvas3D, SceneGraph3D, LineEditor3D, SceneLineEditor3D, getSplines3D, registerSpline3D, Primitives2D, Primitives3D, Csg, MaterialsEditor3D, MaterialsLibrary3D, Modifiers3DEditor,
// colors (canonical inputs/ColorPicker — aliasing this one)
ColorPickerSquare, ColorPickerTile, ColorPickerWheel, LinearGradientEditor, RadialGradientEditor, ShapeGradientEditor, GraphicsColorPicker, RGBColorPicker, HSLColorPicker, HSVColorPicker, OKHSLColorPicker, OKHSVColorPicker, CMYKColorPicker, XYZColorPicker, CIELABColorPicker, CIELUVColorPicker, CIEUVWColorPicker, } from './graphics/index.ts';
// Re-export the colour utility functions (not classes)
export { parseHexRgba, rgbToHex, rgbToHsl, hslToRgb } from './graphics/colors/GraphicsColorPicker.ts';
