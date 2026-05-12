/**
 * @module    components
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * Top-level barrel for all component modules.
 *
 * The repository layout has six classes that exist under more than one
 * sub-folder. TypeScript treats every duplicate `export *` as an ambiguity
 * (TS2308) so this barrel does NOT use `export *` for the conflicting
 * modules. Instead each colliding name has one canonical home and the
 * other location is re-exported under an alias:
 *
 *     Chip            → inputs/Chip            (display/Chip            → DisplayChip)
 *     ColorPicker     → graphics/colors        (inputs/ColorPicker      → InputColorPicker)
 *     LineChart       → finance                (charts/LineChart        → BasicLineChart)
 *     RichTextEditor  → layout/RichTextEditor  (inputs/RichTextEditor   → InputRichTextEditor)
 *     Table           → data/Table             (layout/Table            → LayoutTable)
 *     Base            → (none — modifiers/2D and modifiers/3D use the
 *                       names `Modifier2D` and `Modifier3D` internally)
 *
 * Modules with no name collisions use `export *`. The chat/ folder is empty
 * and has no barrel; the real Chat widget lives in composite/.
 */

// ── Conflict-free modules — flat re-export ──────────────────────────────────

export * from './animations/index.ts';
export * from './audio/index.ts';
export * from './composite/index.ts';
export * from './graphics/2D/index.ts';
export * from './graphics/3D/index.ts';
export * from './maps/index.ts';
export * from './modifiers/index.ts';
export * from './navigation/index.ts';
export * from './payments/index.ts';
export * from './shipments/index.ts';
export * from './video/index.ts';

// ── core ────────────────────────────────────────────────────────────────────
// Control / Theme / Animation utilities.

export { Control } from './core/Control.ts';
export type { CtrlOptions, CtrlListener } from './core/Control.ts';
export { Theme } from './core/Theme.ts';
export type { ThemeMode, ThemeTokens } from './core/Theme.ts';
export * from './core/Animation.ts';

// ── charts ─────────────────────────────────────────────────────────────────
// LineChart collides with finance/LineChart. The finance one is canonical;
// the basic one is re-exported as `BasicLineChart`.

export { BarChart } from './charts/BarChart.ts';
export { PieChart } from './charts/PieChart.ts';
export { LineChart as BasicLineChart } from './charts/LineChart.ts';

// ── finance — canonical LineChart ──────────────────────────────────────────

export * from './finance/index.ts';

// ── data ───────────────────────────────────────────────────────────────────
// Table collides with layout/Table. The data one is canonical; the layout
// container is re-exported as `LayoutTable` further below.

export { Table }    from './data/Table.ts';
export { TreeView } from './data/TreeView.ts';

// ── display ────────────────────────────────────────────────────────────────
// Chip collides with inputs/Chip. The inputs one is canonical (interactive
// form chip); the display one is re-exported as `DisplayChip`.

export { Avatar }           from './display/Avatar.ts';
export { Badge }            from './display/Badge.ts';
export { Banner }           from './display/Banner.ts';
export { Chip as DisplayChip } from './display/Chip.ts';
export { Divider }          from './display/Divider.ts';
export { Icon }             from './display/Icon.ts';
export { List }             from './display/List.ts';
export { ProgressBar }      from './display/ProgressBar.ts';
export { ProgressCircular } from './display/ProgressCircular.ts';
export { Skeleton }         from './display/Skeleton.ts';
export { Snackbar }         from './display/Snackbar.ts';
export { Tag }              from './display/Tag.ts';
export { Tooltip }          from './display/Tooltip.ts';

// ── inputs ─────────────────────────────────────────────────────────────────
// Canonical Chip; ColorPicker and RichTextEditor collide with other folders
// and get re-exported with aliases.

export { Button }       from './inputs/Button.ts';
export { Calendar }     from './inputs/Calendar.ts';
export type { CalendarView, CalendarEvent, CalendarOptions } from './inputs/Calendar.ts';
export { Checkbox }     from './inputs/Checkbox.ts';
export { Chip }         from './inputs/Chip.ts';
export { ColorPicker as InputColorPicker } from './inputs/ColorPicker.ts';
export { DatePicker }   from './inputs/DatePicker.ts';
export { Dropdown }     from './inputs/Dropdown.ts';
export { FileUpload }   from './inputs/FileUpload.ts';
export { Radio }        from './inputs/Radio.ts';
export { RangeSlider }  from './inputs/RangeSlider.ts';
export { Rating }       from './inputs/Rating.ts';
export { RichTextEditor as InputRichTextEditor } from './inputs/RichTextEditor.ts';
export { SearchBar }    from './inputs/SearchBar.ts';
export { Switch }       from './inputs/Switch.ts';
export { TextField }    from './inputs/TextField.ts';
export { TimePicker }   from './inputs/TimePicker.ts';

// ── layout ─────────────────────────────────────────────────────────────────
// Canonical RichTextEditor; Table is aliased to LayoutTable.

export { Accordion } from './layout/Accordion.ts';
export { Card }      from './layout/Card.ts';
export { Dock }      from './layout/Dock.ts';
export type { DockStyle, DockItem, DockOptions } from './layout/Dock.ts';
export { Drawer }    from './layout/Drawer.ts';
export { Modal }     from './layout/Modal.ts';
export { Panel }     from './layout/Panel.ts';
export { Splitter }  from './layout/Splitter.ts';
export { Table as LayoutTable } from './layout/Table.ts';
export { Tabs }      from './layout/Tabs.ts';
export { Window }    from './layout/Window.ts';
export type { WindowStyle, WindowOptions, WindowMenuItem } from './layout/Window.ts';

// ── graphics/colors ────────────────────────────────────────────────────────
// Canonical ColorPicker (the original simple picker, kept for compat) plus
// the full picker / gradient family.

export * from './graphics/colors/index.ts';
