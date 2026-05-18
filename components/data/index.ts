/**
 * @module    components/data
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Barrel — data-shaped widgets: surfaces that present collections of records.
 *   • Table     — tabular data (re-exports the canonical layout/Table)
 *   • TreeView  — hierarchical data
 *
 * Importing this module side-effect-registers `arianna-tree-view`
 * (the layout barrel already registers `arianna-table`).
 *
 * Tags registered:
 *   arianna-tree-view, (arianna-table via layout/Table re-export)
 */

export { Table }    from './Table.ts';
export { TreeView } from './TreeView.ts';

export type {
    Row, SortDir, SortState, SelectMode,
    TableColumn, TableOptions,
} from './Table.ts';

export type {
    TreeNode, TreeViewOptions,
} from './TreeView.ts';
