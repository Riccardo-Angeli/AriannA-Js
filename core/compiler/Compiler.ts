import { ParseTemplate } from './Parser.ts';
import { Analyze } from './Analyzer.ts';
import { Transform } from './Transform.ts';
import { Optimize } from './Optimizer.ts';
import { Generate } from './Generator.ts';
export interface CompileOptions { templateRef?:string; }
export interface CompileResult { code:string; compiled:number; promoted:number; dynamic:number; }
export function Compile(source:string, options:CompileOptions={}):CompileResult{
 const sites=Analyze(source);const edits:{s:number;e:number;r:string}[]=[];const defs:string[]=[];let compiled=0,promoted=0,dynamic=0;
 for(const site of sites){if(!site.promotable){dynamic++;continue;}const ir=Optimize(Transform(ParseTemplate(site.text)));const name=`__AR_TEMPLATE_${compiled++}`;defs.push(`const ${name} = ${Generate(ir,options.templateRef)};`);edits.push({s:site.start,e:site.end,r:name});if(site.kind==='instance')promoted++;}
 let code=source;edits.sort((a,b)=>b.s-a.s).forEach(x=>code=code.slice(0,x.s)+x.r+code.slice(x.e));if(defs.length){let p=0;const matches=[...code.matchAll(/^import[\s\S]*?;\s*$/gm)];if(matches.length){const m=matches.at(-1)!;p=m.index!+m[0].length;}code=code.slice(0,p)+'\n/* AriannA compiler: shared compiled templates (instance templates promoted when safe). */\n'+defs.join('\n')+'\n'+code.slice(p);}return{code,compiled,promoted,dynamic};
}
