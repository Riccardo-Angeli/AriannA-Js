/**
 * @module      additionals/spreadsheet/Worksheet
 * @author      Riccardo Angeli
 * @version     0.1.0
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 *
 * @description Sparse worksheet with incremental dependency tracking and recalculation.
 */

import type { SpreadsheetTypes } from './Types.ts';
import { SpreadsheetAddress } from './Address.ts';
import { CellStore } from './CellStore.ts';
import { DependencyGraph } from './DependencyGraph.ts';
import { Formula } from './Formula.ts';

export class Worksheet implements SpreadsheetTypes.FormulaContext
{
    readonly Name: string;
    readonly Cells = new CellStore();
    readonly Dependencies = new DependencyGraph();
    readonly #formulas = new Map<number, Formula.Node>();
    #revision = 0;

    constructor(name: string)
    {
        if(!name.trim())
        {
            throw new Error('Worksheet name cannot be empty.');
        }

        this.Name = name;
    }

    Get(address: SpreadsheetTypes.CellAddress | string): SpreadsheetTypes.CellValue
    {
        const resolved = typeof address === 'string' ? SpreadsheetAddress.Parse(address) : address;
        return this.Cells.Get(resolved)?.Value ?? null;
    }

    GetCell(address: SpreadsheetTypes.CellAddress | string): SpreadsheetTypes.Cell | undefined
    {
        const resolved = typeof address === 'string' ? SpreadsheetAddress.Parse(address) : address;
        return this.Cells.Get(resolved);
    }

    Set(address: SpreadsheetTypes.CellAddress | string, value: SpreadsheetTypes.CellValue | string): void
    {
        const resolved = typeof address === 'string' ? SpreadsheetAddress.Parse(address) : address;
        const key = SpreadsheetAddress.Key(resolved);
        const cell = this.Cells.Ensure(resolved);

        cell.Raw = value;
        cell.Revision = ++this.#revision;

        if(typeof value === 'string' && value.startsWith('='))
        {
            try
            {
                const formula = new Formula.Parser(value).Parse();
                this.#formulas.set(key, formula);
                this.Dependencies.Set(key, Formula.Dependencies(formula));
                cell.Formula = value;
            }
            catch(error)
            {
                this.#formulas.delete(key);
                this.Dependencies.Remove(key);
                cell.Formula = value;
                cell.Value =
                {
                    Error: true,
                    Code: '#VALUE!',
                    Message: error instanceof Error ? error.message : String(error)
                };

                this.RecalculateDependents(key);
                return;
            }
        }
        else
        {
            this.#formulas.delete(key);
            this.Dependencies.Remove(key);
            cell.Formula = null;
            cell.Value = value as SpreadsheetTypes.CellValue;
        }

        this.RecalculateFrom(key);
    }

    Clear(address: SpreadsheetTypes.CellAddress | string): void
    {
        const resolved = typeof address === 'string' ? SpreadsheetAddress.Parse(address) : address;
        const key = SpreadsheetAddress.Key(resolved);

        this.Dependencies.Remove(key);
        this.#formulas.delete(key);
        this.Cells.Delete(resolved);
        this.RecalculateDependents(key);
    }

    *Range(range: SpreadsheetTypes.CellRange): IterableIterator<SpreadsheetTypes.CellValue>
    {
        const normalized = SpreadsheetAddress.NormalizeRange(range);

        for(let row = normalized.Start.Row; row <= normalized.End.Row; row++)
        {
            for(let column = normalized.Start.Column; column <= normalized.End.Column; column++)
            {
                yield this.Get({ Row: row, Column: column });
            }
        }
    }

    private RecalculateFrom(changed: number): void
    {
        const affected = [changed, ...this.Dependencies.Affected(changed)];
        const { Order, Cycles } = this.Dependencies.Topological(affected);

        for(const cellKey of Cycles)
        {
            const cell = this.Cells.Get(SpreadsheetAddress.FromKey(cellKey));

            if(cell)
            {
                cell.Value = { Error: true, Code: '#CYCLE!' };
                cell.Revision = ++this.#revision;
            }
        }

        for(const cellKey of Order)
        {
            this.EvaluateCell(cellKey);
        }
    }

    private RecalculateDependents(changed: number): void
    {
        const affected = this.Dependencies.Affected(changed);
        const { Order, Cycles } = this.Dependencies.Topological(affected);

        for(const cellKey of Cycles)
        {
            const cell = this.Cells.Get(SpreadsheetAddress.FromKey(cellKey));

            if(cell)
            {
                cell.Value = { Error: true, Code: '#CYCLE!' };
                cell.Revision = ++this.#revision;
            }
        }

        for(const cellKey of Order)
        {
            this.EvaluateCell(cellKey);
        }
    }

    private EvaluateCell(key: number): void
    {
        const formula = this.#formulas.get(key);

        if(!formula)
        {
            return;
        }

        const cell = this.Cells.Get(SpreadsheetAddress.FromKey(key));

        if(!cell)
        {
            return;
        }

        cell.Value = Formula.Evaluate(formula, this);
        cell.Revision = ++this.#revision;
    }
}

export default Worksheet;
