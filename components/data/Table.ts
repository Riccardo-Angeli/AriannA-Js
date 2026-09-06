/**
 * @module components/data/Table
 * @description Data-facing compatibility surface for the canonical Layout Table.
 *              The implementation remains owned by components/layout/Table.ts.
 */
export { Table, TableClass } from '../layout/Table.ts';
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
} from '../layout/Table.ts';
export { default } from '../layout/Table.ts';
