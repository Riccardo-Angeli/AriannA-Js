import type { IR } from './Transform.ts';
export interface OptimizedIR extends IR { static:boolean; }
export function Optimize(ir:IR):OptimizedIR{
 return {...ir, static:ir.ops.length===0};
}
