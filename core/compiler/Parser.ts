export type Attr = [string,string];
export type AstNode = {type:'root';children:AstNode[]} | {type:'raw';html:string} | {type:'text';text:string} | {type:'el';tag:string;attrs:Attr[];children:AstNode[]};

function parseAttrs(src:string):Attr[]{
 const out:Attr[]=[]; let i=0;
 while(i<src.length){ while(/\s/.test(src[i]||''))i++; if(i>=src.length)break; let n=''; while(i<src.length&&!/[\s=]/.test(src[i]))n+=src[i++]; while(/\s/.test(src[i]||''))i++; let v=''; if(src[i]==='='){i++;while(/\s/.test(src[i]||''))i++;const q=src[i];if(q==='"'||q==="'"){i++;while(i<src.length&&src[i]!==q)v+=src[i++];i++;}else while(i<src.length&&!/\s/.test(src[i]))v+=src[i++];} out.push([n,v]); }
 return out;
}
function tagEnd(html:string,start:number):number{let q:string|null=null;for(let j=start+1;j<html.length;j++){const c=html[j];if(q){if(c===q&&html[j-1]!=='\\')q=null;}else if(c==='"'||c==="'")q=c;else if(c==='>')return j;}return -1;}
export function ParseTemplate(html:string):AstNode{
 const root:AstNode={type:'root',children:[]}; const stack:any[]=[root]; let i=0; const voids=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
 while(i<html.length){ if(html.startsWith('<!--',i)){const e=html.indexOf('-->',i+4);stack.at(-1).children.push({type:'raw',html:html.slice(i,e<0?html.length:e+3)});i=e<0?html.length:e+3;continue;} if(html[i]!=='<'){let e=html.indexOf('<',i);if(e<0)e=html.length;stack.at(-1).children.push({type:'text',text:html.slice(i,e)});i=e;continue;} if(html.startsWith('</',i)){const e=tagEnd(html,i);stack.pop();i=e+1;continue;} const e=tagEnd(html,i);if(e<0)break;let inside=html.slice(i+1,e);const self=/\/\s*$/.test(inside);inside=inside.replace(/\/\s*$/,'');const m=inside.match(/^([^\s]+)([\s\S]*)$/);if(!m){i=e+1;continue;}const tag=m[1];if(tag.startsWith('!')){stack.at(-1).children.push({type:'raw',html:html.slice(i,e+1)});i=e+1;continue;}const node:any={type:'el',tag,attrs:parseAttrs(m[2]||''),children:[]};stack.at(-1).children.push(node);i=e+1;if(!self&&!voids.has(tag.toLowerCase()))stack.push(node); }
 return root;
}
