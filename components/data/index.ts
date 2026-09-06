/**
 * @module components/data
 * @description Canonical AriannA Data barrel. TreeView is implemented here;
 *              Table is exposed through its Data compatibility surface while
 *              the implementation remains canonical in Layout.
 */
export { TreeView } from './TreeView.ts';
export type { TreeNode, TreeViewOptions } from './TreeView.ts';
export { Table, TableClass } from './Table.ts';
export type {
    Row,
    SortDir,
    SortState,
    SelectMode,
    TableColumn,
    TableOptions,
    FetchParams,
    FetchResult,
    WasmProcessor,
} from './Table.ts';

import TreeView from './TreeView.ts';
import Table from './Table.ts';

export const DataComponents = { TreeView, Table };
export default DataComponents;
