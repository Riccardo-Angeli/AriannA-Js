#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import ts from '/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js';

const args=process.argv.slice(2); const input=args[0];
if(!input){ console.error('usage: arianna-compile <input.ts> [-o output.ts] [--runtime-import path]'); process.exit(2); }
const oi=args.indexOf('-o'); const ri=args.indexOf('--runtime-import');
const output=oi>=0?args[oi+1]:input.replace(/\.ts$/,'.compiled.ts');
const runtimeImport=ri>=0?args[ri+1]:null;
const tr=args.indexOf('--template-ref'); const templateRef=tr>=0?args[tr+1]:'Templates.Template';
const source=fs.readFileSync(input,'utf8');

function esc(s){return JSON.stringify(s)}
function parseAttrs(src){
  const out=[]; let i=0;
  while(i<src.length){ while(/\s/.test(src[i]||''))i++; if(i>=src.length)break;
    let n=''; while(i<src.length && !/[\s=]/.test(src[i]))n+=src[i++]; while(/\s/.test(src[i]||''))i++;
    let v=''; if(src[i]==='='){ i++; while(/\s/.test(src[i]||''))i++; const q=src[i]; if(q==='"'||q==="'"){i++; while(i<src.length&&src[i]!==q)v+=src[i++]; i++;} else while(i<src.length&&!/\s/.test(src[i]))v+=src[i++]; }
    out.push([n,v]);
  } return out;
}
function tagEnd(html,start){
  let q=null;
  for(let j=start+1;j<html.length;j++){
    const c=html[j];
    if(q){ if(c===q && html[j-1] !== '\\') q=null; }
    else if(c==='"' || c==="'") q=c;
    else if(c==='>') return j;
  }
  return -1;
}
function parseHtml(html){
  const root={type:'root',children:[]}; const stack=[root]; let i=0;
  const voids=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  while(i<html.length){
    if(html.startsWith('<!--',i)){ const e=html.indexOf('-->',i+4); stack.at(-1).children.push({type:'raw',html:html.slice(i,e<0?html.length:e+3)}); i=e<0?html.length:e+3; continue; }
    if(html[i]!=='<'){ let e=html.indexOf('<',i); if(e<0)e=html.length; stack.at(-1).children.push({type:'text',text:html.slice(i,e)}); i=e; continue; }
    if(html.startsWith('</',i)){ const e=tagEnd(html,i); stack.pop(); i=e+1; continue; }
    const e=tagEnd(html,i); if(e<0)break; let inside=html.slice(i+1,e); const self=/\/\s*$/.test(inside); inside=inside.replace(/\/\s*$/,'');
    const m=inside.match(/^([^\s]+)([\s\S]*)$/); if(!m){i=e+1;continue;} const tag=m[1];
    if(tag.startsWith('!')){ stack.at(-1).children.push({type:'raw',html:html.slice(i,e+1)}); i=e+1;continue; }
    const node={type:'el',tag,attrs:parseAttrs(m[2]||''),children:[]}; stack.at(-1).children.push(node); i=e+1;
    if(!self&&!voids.has(tag.toLowerCase()))stack.push(node);
  }
  return root;
}
function interpExpr(text, aliases){
  const re=/\{\{\s*([\s\S]+?)\s*\}\}/g; let m,last=0,parts=[];
  while((m=re.exec(text))){ if(m.index>last)parts.push(esc(text.slice(last,m.index))); parts.push(`String(${expr(m[1],aliases)} ?? '')`); last=re.lastIndex; }
  if(last<text.length)parts.push(esc(text.slice(last))); return parts.length?parts.join('+'):esc(text);
}
function expr(x,aliases){
  let y=x.trim();
  for(const a of aliases){ const r=new RegExp(`(?<![.$\\w])${a.replace(/[$]/g,'\\$&')}(?![\\w$])`,'g'); y=y.replace(r,`scope.${a}`); }
  return `(function(){return (${y});}).call(ctx)`;
}
function compileTree(root, aliases=[]){
  let html=''; const ops=[];
  function emit(node,path,localAliases){
    if(node.type==='raw'){ html+=node.html; return; }
    if(node.type==='text'){
      if(/\{\{/.test(node.text)){ html+='<!--ar:t-->'; ops.push({src:`{k:'text',p:${JSON.stringify(path)},e:(ctx,scope)=>${interpExpr(node.text,localAliases)}}`}); }
      else html+=node.text; return;
    }
    const amap=new Map(node.attrs); const forv=amap.get('a-for'); const ifv=amap.get('a-if');
    if(forv||ifv){
      html+=`<!--ar:s-->`;
      const clone={...node,attrs:node.attrs.filter(([n])=>n!==(forv?'a-for':'a-if')),children:node.children};
      if(forv){
        const mm=forv.match(/^\s*([\w$]+)(?:\s*,\s*([\w$]+))?\s+in\s+([\s\S]+)$/); if(!mm) throw new Error(`Bad a-for: ${forv}`);
        const item=mm[1], index=mm[2]; const child=compileTree({type:'root',children:[clone]},[...localAliases,item,...(index?[index]:[])]);
        const key=amap.get('a-key')||amap.get(':key');
        ops.push({src:`{k:'for',p:${JSON.stringify(path)},item:${esc(item)},${index?`index:${esc(index)},`:''}e:(ctx,scope)=>${expr(mm[3],localAliases)},${key?`key:(ctx,scope)=>${expr(key,[...localAliases,item,...(index?[index]:[])])},`:''}c:${child.src}}`});
      } else {
        const child=compileTree({type:'root',children:[clone]},localAliases);
        ops.push({src:`{k:'if',p:${JSON.stringify(path)},e:(ctx,scope)=>${expr(ifv,localAliases)},c:${child.src}}`});
      } return;
    }
    html+=`<${node.tag}`;
    for(const [n,v] of node.attrs){
      if(n.startsWith(':')||n.startsWith('@')||n==='a-html'||n==='a-key')continue;
      html+=v===''?` ${n}`:` ${n}=${esc(v)}`;
    }
    html+='>';
    const opPath=path;
    for(const [n,v] of node.attrs){
      if(n.startsWith(':'))ops.push({src:`{k:'attr',p:${JSON.stringify(opPath)},n:${esc(n.slice(1))},e:(ctx,scope)=>${expr(v,localAliases)}}`});
      else if(n.startsWith('@'))ops.push({src:`{k:'event',p:${JSON.stringify(opPath)},n:${esc(n.slice(1))},e:(ctx,scope)=>${expr(v,localAliases)}}`});
      else if(n==='a-html')ops.push({src:`{k:'html',p:${JSON.stringify(opPath)},e:(ctx,scope)=>${expr(v,localAliases)}}`});
    }
    let ci=0; for(const c of node.children){ emit(c,[...path,ci],localAliases); ci++; }
    if(!['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'].includes(node.tag.toLowerCase())) html+=`</${node.tag}>`;
  }
  let idx=0; for(const n of root.children){ emit(n,[idx],aliases); idx++; }
  return {html,ops,src:`{html:${esc(html)},ops:[${ops.map(o=>o.src).join(',')} ]}`};
}

const sf=ts.createSourceFile(input,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const edits=[]; const defs=[]; let count=0;
function visit(n){
  if(ts.isTaggedTemplateExpression(n) && n.tag.getText(sf)==='html' && ts.isNoSubstitutionTemplateLiteral(n.template)){
    const tree=parseHtml(n.template.text); const c=compileTree(tree); const name=`__AR_TEMPLATE_${count++}`; defs.push(`const ${name}=${templateRef}.Compiled(${c.src});`); edits.push({s:n.getStart(sf),e:n.end,r:name});
  } else if(ts.isTaggedTemplateExpression(n) && n.tag.getText(sf)==='html' && ts.isTemplateExpression(n.template)) {
    // Dynamic JS substitutions cannot be safely precompiled yet; leave unchanged.
  }
  ts.forEachChild(n,visit);
}
visit(sf);
let out=source; edits.sort((a,b)=>b.s-a.s).forEach(x=>{out=out.slice(0,x.s)+x.r+out.slice(x.e)});
if(defs.length){
  const inject=`\n/* AriannA compiler: shared compiled templates; safe instance templates are promoted automatically. */\n${defs.join('\n')}\n`;
  let p=0; const matches=[...out.matchAll(/^import[\s\S]*?;\s*$/gm)]; if(matches.length){const m=matches.at(-1); p=m.index+m[0].length;}
  out=out.slice(0,p)+inject+out.slice(p);
}
fs.mkdirSync(path.dirname(output),{recursive:true}); fs.writeFileSync(output,out);
console.log(JSON.stringify({input,output,compiledTemplates:defs.length,templateRef,promotion:'safe no-substitution html templates are shared'},null,2));
