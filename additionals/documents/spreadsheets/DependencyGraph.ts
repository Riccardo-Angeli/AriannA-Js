/**
 * @module      additionals/spreadsheet/DependencyGraph
 * @author      Riccardo Angeli
 * @version     0.1.0
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 *
 * @description Incremental formula dependency graph keyed by compact numeric cell identifiers.
 */

export class DependencyGraph
{
    readonly #dependencies = new Map<number, Set<number>>();
    readonly #dependents = new Map<number, Set<number>>();

    Set(cell: number, dependencies: Iterable<number>): void
    {
        this.Remove(cell);

        const next = new Set<number>(dependencies);

        if(next.size === 0)
        {
            return;
        }

        this.#dependencies.set(cell, next);

        for(const dependency of next)
        {
            let dependents = this.#dependents.get(dependency);

            if(!dependents)
            {
                dependents = new Set<number>();
                this.#dependents.set(dependency, dependents);
            }

            dependents.add(cell);
        }
    }

    Remove(cell: number): void
    {
        const current = this.#dependencies.get(cell);

        if(!current)
        {
            return;
        }

        for(const dependency of current)
        {
            const dependents = this.#dependents.get(dependency);

            if(!dependents)
            {
                continue;
            }

            dependents.delete(cell);

            if(dependents.size === 0)
            {
                this.#dependents.delete(dependency);
            }
        }

        this.#dependencies.delete(cell);
    }

    Dependencies(cell: number): ReadonlySet<number>
    {
        return this.#dependencies.get(cell) ?? DependencyGraph.Empty;
    }

    Dependents(cell: number): ReadonlySet<number>
    {
        return this.#dependents.get(cell) ?? DependencyGraph.Empty;
    }

    Affected(cell: number): number[]
    {
        const result: number[] = [];
        const visited = new Set<number>();
        const queue = [cell];

        while(queue.length)
        {
            const current = queue.shift()!;

            for(const dependent of this.Dependents(current))
            {
                if(visited.has(dependent))
                {
                    continue;
                }

                visited.add(dependent);
                result.push(dependent);
                queue.push(dependent);
            }
        }

        return result;
    }

    Topological(cells: Iterable<number>): { Order: number[]; Cycles: Set<number> }
    {
        const selected = new Set(cells);
        const indegree = new Map<number, number>();

        for(const cell of selected)
        {
            let count = 0;

            for(const dependency of this.Dependencies(cell))
            {
                if(selected.has(dependency))
                {
                    count++;
                }
            }

            indegree.set(cell, count);
        }

        const queue: number[] = [];

        for(const [cell, degree] of indegree)
        {
            if(degree === 0)
            {
                queue.push(cell);
            }
        }

        const order: number[] = [];

        while(queue.length)
        {
            const current = queue.shift()!;
            order.push(current);

            for(const dependent of this.Dependents(current))
            {
                if(!selected.has(dependent))
                {
                    continue;
                }

                const next = (indegree.get(dependent) ?? 0) - 1;
                indegree.set(dependent, next);

                if(next === 0)
                {
                    queue.push(dependent);
                }
            }
        }

        const cycles = new Set<number>();

        for(const cell of selected)
        {
            if(!order.includes(cell))
            {
                cycles.add(cell);
            }
        }

        return { Order: order, Cycles: cycles };
    }

    static readonly Empty = new Set<number>();
}

export default DependencyGraph;
