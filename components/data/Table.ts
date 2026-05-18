/**
 * @module    components/data/Table
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Table — re-exports the canonical `components/layout/Table` so consumers
 * who import from the data-oriented namespace get the same implementation.
 *
 * The v1.x layout had two parallel copies (one under data/, one under
 * layout/) of effectively the same component. In v2 there is a single
 * source of truth and this file is the thin import-bridge that keeps the
 * historical path working.
 */

export { Table, default } from '../layout/Table.ts';
export type {
    Row, SortDir, SortState, SelectMode,
    TableColumn, TableOptions,
} from '../layout/Table.ts';
