/**
 * @module    components/layout
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Barrel — all 10 layout components (Batch 4 of the Component 2.0 migration).
 * Importing this module side-effect-registers all 11 custom elements (10
 * layout + Tab co-located inside Tabs.ts) so the tags become available in
 * HTML markup, plus re-exports the classes and types for JS usage.
 *
 * Tags registered:
 *   arianna-card, arianna-drawer, arianna-modal, arianna-panel,
 *   arianna-splitter, arianna-tabs, arianna-tab,
 *   arianna-accordion, arianna-dock, arianna-window, arianna-table
 *
 * Some layout components use modifiers internally:
 *   • Accordion (resizable mode) → <arianna-resizer>
 *   • Window                      → <arianna-mover> + <arianna-resizer>
 * Make sure the modifiers/2D barrel is imported alongside this one when
 * mounting those components.
 */

export { Card }      from './Card.ts';
export { Drawer }    from './Drawer.ts';
export { Modal }     from './Modal.ts';
export { Panel }     from './Panel.ts';
export { Splitter }  from './Splitter.ts';
export { Tabs, Tab } from './Tabs.ts';
export { Accordion } from './Accordion.ts';
export { Dock }      from './Dock.ts';
export { WindowComponent } from './Window.ts';
export { Table }     from './Table.ts';

export type { CardOptions }                 from './Card.ts';
export type { DrawerOptions }               from './Drawer.ts';
export type { ModalOptions }                from './Modal.ts';
export type { PanelOptions }                from './Panel.ts';
export type { SplitterOptions }             from './Splitter.ts';
export type { TabsOptions, TabOptions }     from './Tabs.ts';
export type {
    AccordionItem, AccordionOptions, AccordionIconStyle,
} from './Accordion.ts';
export type { DockItem, DockOptions, DockStyle } from './Dock.ts';
export type {
    WindowOptions, WindowStyle, WindowMenuItem,
} from './Window.ts';
export type {
    Row, SortDir, SortState, SelectMode,
    TableColumn, TableOptions,
} from './Table.ts';
