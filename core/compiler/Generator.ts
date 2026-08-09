import type { OptimizedIR } from './Optimizer.ts';
export function Generate(ir:OptimizedIR, templateRef='Templates.Template'):string{
 return `${templateRef}.Compiled({html:${JSON.stringify(ir.html)},ops:[${ir.ops.join(',')}],static:${ir.static}})`;
}
