/**
 * @module      additionals/spreadsheet/Workbook
 * @author      Riccardo Angeli
 * @version     0.1.0
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 *
 * @description Workbook container for sparse AriannA worksheets.
 */

import { Worksheet } from './Worksheet.ts';

export class Workbook
{
    readonly #sheets = new Map<string, Worksheet>();
    #active: string | null = null;

    get Active(): Worksheet | null
    {
        return this.#active ? this.#sheets.get(this.#active) ?? null : null;
    }

    get Names(): readonly string[]
    {
        return Array.from(this.#sheets.keys());
    }

    Add(name: string): Worksheet
    {
        const key = name.trim();

        if(!key)
        {
            throw new Error('Worksheet name cannot be empty.');
        }

        if(this.#sheets.has(key))
        {
            throw new Error(`Worksheet already exists: ${key}`);
        }

        const sheet = new Worksheet(key);
        this.#sheets.set(key, sheet);
        this.#active ??= key;

        return sheet;
    }

    Get(name: string): Worksheet | undefined
    {
        return this.#sheets.get(name);
    }

    Activate(name: string): Worksheet
    {
        const sheet = this.#sheets.get(name);

        if(!sheet)
        {
            throw new Error(`Unknown worksheet: ${name}`);
        }

        this.#active = name;
        return sheet;
    }

    Remove(name: string): boolean
    {
        const removed = this.#sheets.delete(name);

        if(removed && this.#active === name)
        {
            this.#active = this.#sheets.keys().next().value ?? null;
        }

        return removed;
    }
}

export default Workbook;
