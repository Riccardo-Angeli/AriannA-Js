/**
 * @module      additionals/spreadsheet/Types
 * @author      Riccardo Angeli
 * @version     0.1.0
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 *
 * @description Canonical structural contracts for the AriannA Spreadsheet engine.
 */

export namespace SpreadsheetTypes
{
    export type Scalar = string | number | boolean | Date | null;
    export type CellValue = Scalar | SpreadsheetError;

    export type SpreadsheetErrorCode =
        '#DIV/0!' |
        '#VALUE!' |
        '#REF!' |
        '#NAME?' |
        '#NUM!' |
        '#N/A' |
        '#CYCLE!';

    export interface SpreadsheetError
    {
        readonly Error: true;
        readonly Code: SpreadsheetErrorCode;
        readonly Message?: string;
    }

    export interface CellAddress
    {
        readonly Row: number;
        readonly Column: number;
    }

    export interface CellRange
    {
        readonly Start: CellAddress;
        readonly End: CellAddress;
    }

    export interface Cell
    {
        Raw: CellValue | string;
        Value: CellValue;
        Formula: string | null;
        Revision: number;
    }

    export interface FormulaContext
    {
        Get(address: CellAddress): CellValue;
        Range(range: CellRange): Iterable<CellValue>;
    }
}

export default SpreadsheetTypes;
