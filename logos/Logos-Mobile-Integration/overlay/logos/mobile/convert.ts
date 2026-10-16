import {mappings} from './registries.js';
import type {IRNode,MobileDocument,Platform,DeviceFamily,Translation,Diagnostic,Mapping} from './types.js';
const tag='logos.mobile.origin';
function transform(node:IRNode,platform:Platform,family:DeviceFamily,direction:'export'|'import',path:string,diagnostics:Diagnostic[]):IRNode{
 const matched:Mapping|undefined=mappings.find(m=>m.platform===platform&&m.family.includes(family)&&(direction==='export'?m.semantic===node.type:m.native===node.type));
 const name=matched?(direction==='export'?matched.native:matched.semantic):node.type;
 if(!matched){diagnostics.push({code:'UNMAPPED',severity:'warning',path,message:`Unmapped ${platform} symbol ${node.type}; preserved as extension`});}
 else if(matched.fidelity!=='exact'){diagnostics.push({code:'ADAPTED',severity:'info',path,message:`${matched.id} requires platform conformance validation`});}
 // preserve original source semantics on export for a verified lossless import of *our own* documents.
 const extensions={...node.extensions,...(direction==='export'?{[tag]:node.type}:{})};
 const restored=direction==='import'&&typeof extensions[tag]==='string'?extensions[tag] as string:name;
 if(direction==='import')delete extensions[tag];
 return {type:restored, ...(node.props?{props:structuredClone(node.props)}:{}), ...(node.children?{children:node.children.map((n,i)=>transform(n,platform,family,direction,`${path}.children[${i}]`,diagnostics))}:{}), ...(Object.keys(extensions).length?{extensions}: {})};
}
export function convert(document:MobileDocument,platform:Platform,direction:'export'|'import'):Translation{
 if(document.format!=='logos-mobile/1')throw new Error('Unsupported Logos Mobile document');
 const diagnostics:Diagnostic[]=[];
 const root=transform(document.root,platform,document.device,direction,'root',diagnostics);
 return {document:{...structuredClone(document),root},diagnostics,lossless:direction==='import'&&!diagnostics.some(d=>d.code==='UNMAPPED')};
}
export function roundTrip(document:MobileDocument,platform:Platform):{equal:boolean;diagnostics:readonly Diagnostic[]}{
 const exported=convert(document,platform,'export');const imported=convert(exported.document,platform,'import');
 return {equal:JSON.stringify(imported.document)===JSON.stringify(document),diagnostics:[...exported.diagnostics,...imported.diagnostics]};
}
