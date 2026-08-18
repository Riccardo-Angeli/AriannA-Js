/**
 * @module      additionals/spreadsheet/CellStore
 * @author      Riccardo Angeli
 * @version     0.1.0
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 *
 * @description Sparse cell storage. Logical worksheet size is independent from allocated cell count.
 */

import type { SpreadsheetTypes } from './Types.ts';
import { SpreadsheetAddress } from './Address.ts';

export class CellStore
{
    readonly #cells = new Map<number, SpreadsheetTypes.Cell>();

    get Size(): number
    {
        return this.#cells.size;
    }

    Get(address: SpreadsheetTypes.CellAddress): SpreadsheetTypes.Cell | undefined
    {
        return this.#cells.get(SpreadsheetAddress.Key(address));
    }

    Ensure(address: SpreadsheetTypes.CellAddress): SpreadsheetTypes.Cell
    {
        const key = SpreadsheetAddress.Key(address);
        let cell = this.#cells.get(key);

        if(!cell)
        {
            cell =
            {
                Raw: null,
                Value: null,
                Formula: null,
                Revision: 0
            };

            this.#cells.set(key, cell);
        }

        return cell;
    }

    Delete(address: SpreadsheetTypes.CellAddress): boolean
    {
        return this.#cells.delete(SpreadsheetAddress.Key(address));
    }

    Clear(): void
    {
        this.#cells.clear();
    }

    *Entries(): IterableIterator<[SpreadsheetTypes.CellAddress, SpreadsheetTypes.Cell]>
    {
        for(const [key, cell] of this.#cells)
        {
            yield [SpreadsheetAddress.FromKey(key), cell];
        }
    }

    *Range(range: SpreadsheetTypes.CellRange): IterableIterator<SpreadsheetTypes.Cell>
    {
        const normalized = SpreadsheetAddress.NormalizeRange(range);

        for(let row = normalized.Start.Row; row <= normalized.End.Row; row++)
        {
            for(let column = normalized.Start.Column; column <= normalized.End.Column; column++)
            {
                const cell = this.Get({ Row: row, Column: column });

                if(cell)
                {
                    yield cell;
                }
            }
        }
    }
}

export default CellStore;
