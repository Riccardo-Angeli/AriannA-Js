/**
 * @module      additionals/spreadsheet/Address
 * @author      Riccardo Angeli
 * @version     0.1.0
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 *
 * @description Zero-allocation helpers for spreadsheet A1 addresses and ranges.
 */

import type { SpreadsheetTypes } from './Types.ts';

export namespace SpreadsheetAddress
{
    export const MaxRows = 1_048_576;
    export const MaxColumns = 16_384;

    export function Key(address: SpreadsheetTypes.CellAddress): number
    {
        return address.Row * MaxColumns + address.Column;
    }

    export function FromKey(key: number): SpreadsheetTypes.CellAddress
    {
        return {
            Row: Math.floor(key / MaxColumns),
            Column: key % MaxColumns
        };
    }

    export function ColumnName(column: number): string
    {
        if(column < 0 || column >= MaxColumns)
        {
            throw new RangeError(`Column out of range: ${column}`);
        }

        let value = column + 1;
        let result = '';

        while(value > 0)
        {
            value--;
            result = String.fromCharCode(65 + value % 26) + result;
            value = Math.floor(value / 26);
        }

        return result;
    }

    export function ColumnIndex(name: string): number
    {
        const text = name.trim().toUpperCase();

        if(!/^[A-Z]+$/.test(text))
        {
            throw new Error(`Invalid spreadsheet column: ${name}`);
        }

        let result = 0;

        for(let index = 0; index < text.length; index++)
        {
            result = result * 26 + (text.charCodeAt(index) - 64);
        }

        result--;

        if(result < 0 || result >= MaxColumns)
        {
            throw new RangeError(`Column out of range: ${name}`);
        }

        return result;
    }

    export function Parse(value: string): SpreadsheetTypes.CellAddress
    {
        const match = /^\$?([A-Za-z]+)\$?(\d+)$/.exec(value.trim());

        if(!match)
        {
            throw new Error(`Invalid A1 address: ${value}`);
        }

        const row = Number(match[2]) - 1;
        const column = ColumnIndex(match[1]);

        if(row < 0 || row >= MaxRows)
        {
            throw new RangeError(`Row out of range: ${match[2]}`);
        }

        return { Row: row, Column: column };
    }

    export function Format(address: SpreadsheetTypes.CellAddress): string
    {
        return `${ColumnName(address.Column)}${address.Row + 1}`;
    }

    export function ParseRange(value: string): SpreadsheetTypes.CellRange
    {
        const parts = value.split(':');

        if(parts.length === 1)
        {
            const address = Parse(parts[0]);
            return { Start: address, End: address };
        }

        if(parts.length !== 2)
        {
            throw new Error(`Invalid A1 range: ${value}`);
        }

        const first = Parse(parts[0]);
        const second = Parse(parts[1]);

        return NormalizeRange({ Start: first, End: second });
    }

    export function NormalizeRange(range: SpreadsheetTypes.CellRange): SpreadsheetTypes.CellRange
    {
        return {
            Start:
            {
                Row: Math.min(range.Start.Row, range.End.Row),
                Column: Math.min(range.Start.Column, range.End.Column)
            },
            End:
            {
                Row: Math.max(range.Start.Row, range.End.Row),
                Column: Math.max(range.Start.Column, range.End.Column)
            }
        };
    }
}

export default SpreadsheetAddress;
