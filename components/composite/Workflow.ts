/**
 * @module components/composite/Workflow
 * @author Riccardo Angeli
 * @version 2.3.1
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 * @description Schema-driven dockable workflow editor with typed ports and arithmetic graph execution.
 */
import { Component, Css, Templates } from '../../core/index.ts';
import Canvas2D from '../graphics/2D/Canvas2D.ts';
import Grid2D from '../graphics/2D/Grid2D.ts';
import SelectionRectangle from '../graphics/SelectionRectangle.ts';
import Dockable from '../graphics/2D/modifiers/Dockable.ts';
import ToolBar from '../layout/ToolBar.ts';

const html = Templates.Template.Html;

export namespace NodeEditor
{
    export namespace Types
    {
        export type Operation = 'ai' | 'module' | 'input' | 'output' | 'number' | 'result' | 'add' | 'subtract' | 'multiply' | 'divide' | 'modulo' | 'power' | 'root' | 'log' | 'exp' | 'string' | 'boolean' | 'if' | 'equal' | 'less' | 'and' | 'not' | 'range' | 'repeat' | 'sum' | 'concat' | 'upper' | 'lower' | 'replace' | 'split' | 'join' | 'url' | 'url-query' | 'encode' | 'decode';
        export type Value = null | number | string | boolean | Value[] | { [key:string]:Value };
        export type Theme = 'dark' | 'light';
        export type WireStatus = 'connected-ok' | 'connected-warn' | 'connected-error';
        export type RunState = 'idle' | 'running' | 'paused';
        export type TypeCheckFn = (srcType: string, dstType: string) => WireStatus | null;
    }

    export namespace Interfaces
    {
        export interface PortSpec { id: string; type: string; label?: string; }

        export interface ParamSpec
        {
            id: string;
            type: 'number' | 'string' | 'boolean' | 'enum';
            label?: string;
            default?: unknown;
            min?: number;
            max?: number;
            options?: string[];
        }

        export interface NodeSchema
        {
            type: string;
            name: string;
            category: string;
            color?: string;
            icon?: string;
            inputs: PortSpec[];
            outputs: PortSpec[];
            params?: ParamSpec[];
            description?: string;
            /** Optional execution contract; the catalog remains application supplied. */
            operation?: Types.Operation;
        }

        export interface Graph { nodes:NodeInstance[]; wires:WireInstance[]; }
        export interface Clipboard extends Graph {format:'arianna-workflow-selection';version:1;}

        export interface NodeInstance
        {
            id: string;
            type: string;
            x: number;
            y: number;
            schema: NodeSchema;
            params?: Record<string, unknown>;
            graph?: Graph;
        }

        export interface WireInstance
        {
            id: string;
            srcNodeId: string;
            srcPortId: string;
            srcType: string;
            dstNodeId: string;
            dstPortId: string;
            dstType: string;
            status: Types.WireStatus;
        }

        export interface NodeEditorOptions
        {
            schemas?: NodeSchema[];
            typeCheck?: Types.TypeCheckFn;
            theme?: Types.Theme;
            nodes?: NodeInstance[];
            wires?: WireInstance[];
        }
    }

    /** Only graph composition primitives are built in; applications supply their operand catalog. */
    export const IOSchemas:Interfaces.NodeSchema[]=[
        {type:'empty',name:'Empty',category:'',operation:'module',icon:'□',color:'#a56de2',inputs:[{id:'in',type:'number',label:'In'}],outputs:[{id:'out',type:'number',label:'Out'}]},
        {type:'input',name:'Input',category:'Inputs',operation:'input',icon:'→',color:'#4d93e6',inputs:[],outputs:[{id:'out',type:'number'}],params:[{id:'portId',type:'string',label:'External input ID',default:'in'},{id:'portType',type:'enum',label:'Type',default:'number',options:['number','float','integer','string','boolean','array','any']},{id:'value',type:'number',label:'Preview value',default:0}]},
        {type:'output',name:'Output',category:'Outputs',operation:'output',icon:'←',color:'#82be4c',inputs:[{id:'value',type:'number'}],outputs:[],params:[{id:'portId',type:'string',label:'External output ID',default:'out'},{id:'portType',type:'enum',label:'Type',default:'number',options:['number','float','integer','string','boolean','array','any']}]}
    ];
    /** Bounded, local execution modules shared by every theme and creation path. */
    export const UtilitySchemas:Interfaces.NodeSchema[]=[
        {type:'number',name:'Number',category:'Inputs',operation:'number',icon:'1',color:'#4d93e6',inputs:[],outputs:[{id:'out',type:'number'}],params:[{id:'value',type:'string',label:'Number',default:'0'},{id:'numberType',type:'enum',default:'number',options:['number','float','integer']}]},
        {type:'string',name:'String',category:'Strings',operation:'string',icon:'Aa',inputs:[],outputs:[{id:'out',type:'string'}],params:[{id:'value',type:'string',default:'Hello'}]},
        {type:'boolean',name:'Boolean',category:'Conditionals',operation:'boolean',icon:'⊤',inputs:[],outputs:[{id:'out',type:'boolean'}],params:[{id:'value',type:'boolean',default:true}]},
        ...([['if','If', ['boolean','any','any'],'any'],['equal','Equals',['any','any'],'boolean'],['less','Less than',['number','number'],'boolean'],['and','And',['boolean','boolean'],'boolean'],['not','Not',['boolean'],'boolean'],
            ['range','Range',['number','number'],'array'],['repeat','Repeat',['any','number'],'array'],['sum','Sum array',['array'],'number'],
            ['concat','Concatenate',['string','string'],'string'],['upper','Uppercase',['string'],'string'],['lower','Lowercase',['string'],'string'],['replace','Replace',['string','string','string'],'string'],['split','Split',['string','string'],'array'],['join','Join',['array','string'],'string'],
            ['url','URL',['string','string'],'string'],['url-query','Query parameter',['string','string'],'string'],['encode','URL encode',['string'],'string'],['decode','URL decode',['string'],'string']
        ] as Array<[Types.Operation,string,string[],string]>).map(([operation,name,inputs,output])=>({type:operation,name,operation,category:['if','equal','less','and','not'].includes(operation)?'Conditionals':['range','repeat','sum'].includes(operation)?'Loops':['url','url-query','encode','decode'].includes(operation)?'Web':'Strings',icon:name[0],color:'#4d93e6',inputs:inputs.map((type,i)=>({id:'in'+i,type,label:operation==='if'?['Condition','Then','Else'][i]:operation==='repeat'?['Value','Count'][i]:operation==='range'?['Start','End (exclusive)'][i]:'Input '+(i+1)})),outputs:[{id:'out',type:output}]}))
    ];
    export type AIProvider='openai'|'claude'|'gemini';
    export interface AIResponse {provider:AIProvider;model:string;text:string;response:Types.Value;}
    export interface AIRequest {provider:AIProvider;model:string;prompt:string;instructions:string;maxTokens:number;endpoint?:string;}
    export type AITransport=(request:AIRequest,context:{apiKey:string;signal:AbortSignal;nodeId:string})=>Promise<AIResponse>;
    export const AISchemas:Interfaces.NodeSchema[]=(['openai','claude','gemini'] as AIProvider[]).map(provider=>({
        type:'ai-'+provider,name:provider==='openai'?'OpenAI':provider==='claude'?'Claude':'Gemini',category:'AI',operation:'ai',icon:'✦',color:'#e40c88',
        inputs:[{id:'prompt',label:'Prompt',type:'string'}],outputs:[{id:'out',label:'Text',type:'string'},{id:'response',label:'Response JSON',type:'any'}],
        params:[{id:'provider',label:'Provider',type:'enum',default:provider,options:['openai','claude','gemini']},{id:'model',label:'Model ID',type:'string',default:''},{id:'prompt',label:'Prompt (when unconnected)',type:'string',default:'Reply with a short greeting.'},{id:'instructions',label:'System instructions',type:'string',default:''},{id:'maxTokens',label:'Maximum output tokens',type:'number',default:1024,min:1,max:65536},{id:'timeout',label:'Timeout (seconds)',type:'number',default:60,min:1,max:300},{id:'endpoint',label:'Endpoint override / proxy',type:'string',default:''}]
    }));
    export const ResultSchemas:Interfaces.NodeSchema[]=['Text','Image','Video','Audio','Spreadsheet','PDF','Doc','JSON'].map(format=>({type:'result-'+format.toLowerCase(),name:format,category:'Results',operation:'result',icon:format==='Text'?'Aa':format[0],color:'#71bd59',inputs:[{id:'value',type:'any',label:format==='Image'||format==='Video'||format==='Audio'?'Asset URL / descriptor':'Value'}],outputs:[],params:[{id:'format',type:'enum',label:'Format',default:format.toLowerCase(),options:['text','image','video','audio','spreadsheet','pdf','doc','json']},{id:'filename',type:'string',label:'Download filename',default:'result'}]}));
    interface AIState {owner:NodeEditor;keys:Map<string,string>;cache:Map<string,{signature:string;value:AIResponse}>;pending:Map<string,AbortController>;transport:AITransport|null;}
    const aiStates=new WeakMap<HTMLElement,AIState>();
    function Abortable<T>(promise:Promise<T>,signal:AbortSignal):Promise<T> {return new Promise((resolve,reject)=>{const abort=()=>{signal.removeEventListener('abort',abort);reject(signal.reason??new DOMException('Cancelled','AbortError'));};if(signal.aborted){abort();return;}signal.addEventListener('abort',abort,{once:true});promise.then(value=>{signal.removeEventListener('abort',abort);if(signal.aborted)reject(signal.reason);else resolve(value);},error=>{signal.removeEventListener('abort',abort);reject(error);});});}
    const resultValues=new WeakMap<Element,Types.Value|undefined>();
    const executions=new WeakMap<HTMLElement,Promise<unknown>>();
    const AIEndpoints={openai:'https://api.openai.com/v1/responses',claude:'https://api.anthropic.com/v1/messages',gemini:'https://generativelanguage.googleapis.com/v1beta/models/'};
    const XML=(value:unknown)=>String(value??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const TextValue=(value:Types.Value|undefined):string=>value===undefined?'':typeof value==='string'?value:JSON.stringify(value,null,2);
    /** Provider-native JSON contracts. No SDK, global state or automatic retries. */
    export function BuildAIRequest(request:AIRequest,key:string):{url:string;headers:Record<string,string>;body:Record<string,unknown>} {
        const {provider,model,prompt,instructions,maxTokens}=request;
        if(!['openai','claude','gemini'].includes(provider))throw new Error('Select an AI provider');
        if(!model.trim())throw new Error('Enter a model ID available to your account');
        if(!prompt.trim())throw new Error('Enter or connect a prompt');
        if(!Number.isInteger(maxTokens)||maxTokens<1||maxTokens>65536)throw new Error('Maximum tokens must be between 1 and 65536');
        const headers:Record<string,string>={'Content-Type':'application/json'};
        let url:string,body:Record<string,unknown>;
        if(provider==='openai'){url=AIEndpoints.openai;if(key)headers.Authorization='Bearer '+key;body={model,input:prompt,max_output_tokens:maxTokens,store:false};if(instructions)body.instructions=instructions;}
        else if(provider==='claude'){url=AIEndpoints.claude;if(key)headers['x-api-key']=key;headers['anthropic-version']='2023-06-01';headers['anthropic-dangerous-direct-browser-access']='true';body={model,max_tokens:maxTokens,messages:[{role:'user',content:prompt}]};if(instructions)body.system=instructions;}
        else {url=AIEndpoints.gemini+encodeURIComponent(model.replace(/^models\//,''))+':generateContent';if(key)headers['x-goog-api-key']=key;body={contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:maxTokens}};if(instructions)body.systemInstruction={parts:[{text:instructions}]};}
        if(request.endpoint){const endpoint=new URL(request.endpoint,typeof location==='undefined'?'http://localhost':location.href);if(endpoint.username||endpoint.password)throw new Error('Endpoint cannot contain credentials');if(endpoint.protocol!=='https:'&&!(endpoint.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(endpoint.hostname)))throw new Error('Endpoint must use HTTPS (HTTP is allowed on localhost)');url=endpoint.href;}
        return {url,headers,body};
    }
    export function ParseAIResponse(provider:AIProvider,model:string,data:any):AIResponse {
        if(!data||typeof data!=='object')throw new Error('Provider returned an invalid JSON response');
        let text='';
        if(provider==='openai')text=typeof data.output_text==='string'?data.output_text:(data.output??[]).flatMap((item:any)=>item.content??[]).filter((part:any)=>part.type==='output_text').map((part:any)=>part.text??'').join('\n');
        else if(provider==='claude')text=(data.content??[]).filter((part:any)=>part.type==='text').map((part:any)=>part.text??'').join('\n');
        else text=(data.candidates?.[0]?.content?.parts??[]).filter((part:any)=>typeof part.text==='string'&&!part.thought).map((part:any)=>part.text).join('\n');
        if(!text)throw new Error('Provider returned no text: '+String(data.promptFeedback?.blockReason??data.candidates?.[0]?.finishReason??data.stop_reason??data.status??'empty response'));
        return {provider,model,text,response:data as Types.Value};
    }
    /** Uncompressed ZIP writer for interoperable OOXML files; no external dependency. */
    function ZipFiles(files:Record<string,string>):Uint8Array {
        const enc=new TextEncoder(),chunks:Uint8Array[]=[],directory:Uint8Array[]=[];let offset=0;
        const crc=(bytes:Uint8Array)=>{let n=0xffffffff;for(const byte of bytes){n^=byte;for(let i=0;i<8;i++)n=(n>>>1)^((n&1)?0xedb88320:0);}return (n^0xffffffff)>>>0;};
        for(const [name,text]of Object.entries(files)){const filename=enc.encode(name),bytes=enc.encode(text),checksum=crc(bytes);const header=new Uint8Array(30+filename.length),v=new DataView(header.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(12,33,true);v.setUint32(14,checksum,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,filename.length,true);header.set(filename,30);chunks.push(header,bytes);
            const central=new Uint8Array(46+filename.length),c=new DataView(central.buffer);c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x800,true);c.setUint16(14,33,true);c.setUint32(16,checksum,true);c.setUint32(20,bytes.length,true);c.setUint32(24,bytes.length,true);c.setUint16(28,filename.length,true);c.setUint32(42,offset,true);central.set(filename,46);directory.push(central);offset+=header.length+bytes.length;
        }
        const size=directory.reduce((n,a)=>n+a.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,directory.length,true);v.setUint16(10,directory.length,true);v.setUint32(12,size,true);v.setUint32(16,offset,true);const out=new Uint8Array(offset+size+22);let at=0;for(const chunk of [...chunks,...directory,end]){out.set(chunk,at);at+=chunk.length;}return out;
    }
    function Rows(value:Types.Value|undefined):unknown[][] {
        if(typeof value==='string'){try{return Rows(JSON.parse(value));}catch{return value.split(/\r?\n/).slice(0,10000).map(line=>line.split('\t'));}}
        if(!Array.isArray(value))return [[TextValue(value)]];
        if(value.length>10000)throw new Error('Spreadsheet is limited to 10000 rows');
        if(value.every(row=>row&&typeof row==='object'&&!Array.isArray(row))){const keys=[...new Set(value.flatMap(row=>Object.keys(row as object)))];return[keys,...value.map(row=>keys.map(k=>(row as Record<string,unknown>)[k]??''))];}
        return value.map(row=>Array.isArray(row)?row:[row]);
    }
    /** Result viewers consume data; media generation remains a separate application capability. */
    export function ResultDocument(format:string,value:Types.Value|undefined):{bytes:Uint8Array;mime:string;extension:string} {
        const text=TextValue(value),enc=new TextEncoder(),rels='http://schemas.openxmlformats.org/package/2006/relationships';
        if(text.length>4000000)throw new Error('Result export exceeds 4 million characters');
        if(format==='doc')return {bytes:ZipFiles({'[Content_Types].xml':'<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>','_rels/.rels':`<Relationships xmlns="${rels}"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,'word/document.xml':'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+text.split(/\r?\n/).map(line=>'<w:p><w:r><w:t xml:space="preserve">'+XML(line)+'</w:t></w:r></w:p>').join('')+'<w:sectPr/></w:body></w:document>'}),mime:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',extension:'docx'};
        if(format==='spreadsheet'){
            const rows=Rows(value);if(rows.some(row=>row.length>512))throw new Error('Spreadsheet is limited to 512 columns');if(rows.reduce((count,row)=>count+row.length,0)>100000)throw new Error('Spreadsheet export is limited to 100000 cells');
            const column=(index:number)=>{let s='';for(index++;index;index=Math.floor((index-1)/26))s=String.fromCharCode(65+(index-1)%26)+s;return s;};
            const sheet='<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'+rows.map((row,i)=>'<row r="'+(i+1)+'">'+row.map((cell,j)=>{const id=column(j)+(i+1);return typeof cell==='number'&&Number.isFinite(cell)?`<c r="${id}"><v>${cell}</v></c>`:`<c r="${id}" t="inlineStr"><is><t xml:space="preserve">${XML(typeof cell==='object'?JSON.stringify(cell):cell)}</t></is></c>`;}).join('')+'</row>').join('')+'</sheetData></worksheet>';
            return {bytes:ZipFiles({'[Content_Types].xml':'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>','_rels/.rels':`<Relationships xmlns="${rels}"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,'xl/workbook.xml':'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Result" sheetId="1" r:id="rId1"/></sheets></workbook>','xl/_rels/workbook.xml.rels':`<Relationships xmlns="${rels}"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,'xl/worksheets/sheet1.xml':sheet}),mime:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',extension:'xlsx'};
        }
        if(format==='pdf'){
            // Bounded text PDF with WinAnsi Helvetica; unsupported Unicode glyphs become '?'.
            const lines=text.replace(/[^\x20-\xff\r\n\t]/g,'?').split(/\r?\n/).flatMap(line=>line.match(/.{1,88}/g)??['']);if(lines.length>4500)throw new Error('Text PDF is limited to 100 pages');
            const pages=Math.max(1,Math.ceil(lines.length/45)),objects:string[]=['<< /Type /Catalog /Pages 2 0 R >>','', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'];
            objects[1]='<< /Type /Pages /Count '+pages+' /Kids ['+Array.from({length:pages},(_,i)=>(4+i*2)+' 0 R').join(' ')+'] >>';
            for(let i=0;i<pages;i++){const stream='BT /F1 11 Tf 48 790 Td 16 TL '+lines.slice(i*45,i*45+45).map((line,j)=>(j?'T* ':'')+'('+line.replace(/[\\()]/g,'\\$&')+') Tj').join('\n')+' ET';objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5+i*2} 0 R >>`,`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);}
            let pdf='%PDF-1.4\n',offsets=[0];objects.forEach((obj,i)=>{offsets.push(pdf.length);pdf+=(i+1)+' 0 obj\n'+obj+'\nendobj\n';});const xref=pdf.length;pdf+='xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';return{bytes:Uint8Array.from(pdf,c=>c.charCodeAt(0)),mime:'application/pdf',extension:'pdf'};
        }
        return {bytes:enc.encode(text),mime:format==='json'?'application/json':'text/plain;charset=utf-8',extension:format==='json'?'json':'txt'};
    }

    const Catalog=(schemas:Interfaces.NodeSchema[])=>[...schemas,...[...IOSchemas,...UtilitySchemas,...AISchemas,...ResultSchemas].filter(b=>!schemas.some(s=>s.type===b.type))].map(s=>({...s,category:s.operation==='module'?'':s.operation==='output'?'Outputs':s.operation==='result'?'Results':['number','input','string','boolean'].includes(s.operation??'')?'Inputs':s.category}));
    const ModuleWindowEditors=new WeakMap<HTMLElement,NodeEditor>();
    const WorkspaceEditors=new WeakMap<Element,NodeEditor>();
    const EmptyGraph=():Interfaces.Graph=>({nodes:IOSchemas.slice(1).map((schema,i)=>({id:i?'module-output':'module-input',type:schema.type,x:i?370:40,y:100,schema:structuredClone(schema),params:Object.fromEntries((schema.params??[]).map(p=>[p.id,p.default]))})),wires:[]});

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.NodeEditor', {
            Background: '#202428', Border: '1px solid #121517', BorderRadius: '8px',
            BoxSizing: 'border-box', Color: '#e5e8ea', Display: 'block',
            FontFamily: 'var(--arianna-font,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif)',
            Height: '640px', MaxWidth: '100%', MinWidth: '0', Overflow: 'hidden', Width: '100%'
        }),
        new Css.Rule('.NodeEditor-Shell', {
            Display:'grid', GridTemplateColumns:'minmax(0,1fr)', GridTemplateRows:'36px 40px minmax(0,1fr) 20px', Width:'100%', Height:'100%', MinWidth:'0', MinHeight:'0'
        }),
        new Css.Rule('.NodeEditor-Toolbar', {
            AlignItems: 'center', Background: 'linear-gradient(180deg,#363b40,#25292d)',
            BorderBottom: '1px solid #111417', Display: 'flex', Gap: '4px', Padding: '5px 7px', OverflowX:'auto'
        }),
        new Css.Rule('.NodeEditor-Title', { FontSize: '11px', FontWeight: '760', MarginRight: '5px' }),
        new Css.Rule('.NodeEditor-State', {
            Color: '#8d969e', Font: '9px/1 var(--arianna-font,system-ui,sans-serif)', MarginRight: 'auto'
        }),
        new Css.Rule('.NodeEditor-Button', {
            Appearance: 'none', Background: 'linear-gradient(180deg,#444a50,#30353a)',
            Border: '1px solid #15181a', BorderRadius: '3px', Color: '#dce0e3',
            Cursor: 'pointer', Font: '700 9px/1 var(--arianna-font,system-ui,sans-serif)',
            Height: '25px', Padding: '0 7px', FlexShrink:'0'
        }),
        new Css.Rule('.NodeEditor-Button:disabled', { Opacity: '.45', Cursor: 'default' }),
        new Css.Rule('.NodeEditor-Button[data-active="true"]:disabled', {Opacity:'1'}),
        new Css.Rule('.NodeEditor-Button:hover', { Background: 'linear-gradient(180deg,#51585e,#383d42)' }),
        new Css.Rule('.NodeEditor-Button[data-active="true"]', {
            Background:'linear-gradient(180deg,#ff4dad 0%,#e40c88 55%,#b90769 100%)',
            BorderColor:'#e40c88',Color:'#fff',BoxShadow:'inset 0 1px 0 #ffffff35,0 1px 3px #0004'
        }),
        new Css.Rule('.NodeEditor-Button:focus-visible,.NodeEditor-Input:focus-visible,.NodeEditor-PaletteSearch:focus-visible', {Outline:'2px solid #e40c88',OutlineOffset:'2px'}),

        /*
         * Playground-like LEFT PANE | WORKSPACE | INSPECTOR
         */
        new Css.Rule('.NodeEditor-Body', {
            Display: 'grid', GridTemplateColumns: '190px minmax(0,1fr) 190px', OverflowX:'auto', MinHeight: '0'
        }),
        new Css.Rule('.NodeEditor-Palette', {
            Background: '#1b1e22', BorderRight: '1px solid #111417', Display: 'grid',
            GridTemplateRows: '42px 39px minmax(0,1fr)', MinHeight: '0', MinWidth: '0'
        }),
        new Css.Rule('.NodeEditor-PaletteHeader', { Flex:'0 0 auto',
            AlignItems: 'center', Background: '#202429', BorderBottom: '1px solid #101316',
            Display: 'flex', Gap: '8px', Padding: '0 11px'
        }),
        new Css.Rule('.NodeEditor-PaletteTitle', {
            Color: '#c7cdd2', Font: '800 9px/1 var(--arianna-font,system-ui,sans-serif)',
            LetterSpacing: '.08em', TextTransform: 'uppercase'
        }),
        new Css.Rule('.NodeEditor-PaletteCount', {
            Background: '#111418', Border: '1px solid #343a40', BorderRadius: '9px',
            Color: '#89939c', Font: '700 8px/1 var(--arianna-font,system-ui,sans-serif)',
            MarginLeft: 'auto', MinWidth: '20px', Padding: '3px 5px', TextAlign: 'center'
        }),
        new Css.Rule('.NodeEditor-PaletteSearchWrap', { Flex:'0 0 auto',
            AlignItems: 'center', BorderBottom: '1px solid #111417', Display: 'flex', Padding: '6px 8px'
        }),
        new Css.Rule('.NodeEditor-PaletteSearch', {
            Appearance: 'none', Background: '#121519', Border: '1px solid #343a40',
            BorderRadius: '5px', BoxSizing: 'border-box', Color: '#e4e7ea',
            Font: '9px/1.2 var(--arianna-font,system-ui,sans-serif)', Height: '27px',
            Outline: 'none', Padding: '0 8px', Width: '100%'
        }),
        new Css.Rule('.NodeEditor-PaletteSearch:focus', {
            BorderColor: '#e40c88', BoxShadow: '0 0 0 2px rgba(228,12,136,.12)'
        }),
        new Css.Rule('.NodeEditor-PaletteBody', {
            MinHeight: '0', Flex:'1 1 0', OverflowY: 'auto', Padding: '5px 6px 10px'
        }),
        new Css.Rule('.NodeEditor-PaletteCategory', { MarginTop: '4px' }),
        new Css.Rule('.NodeEditor-PaletteCategoryHeader', {
            AlignItems: 'center', Color: '#89929a', Display: 'flex',
            Font: '800 8px/1 var(--arianna-font,system-ui,sans-serif)',
            LetterSpacing: '.04em', Padding: '7px 5px 5px', TextTransform: 'uppercase'
        }),
        new Css.Rule('.NodeEditor-PaletteCategoryCount', {
            Color: '#626b73', FontWeight: '700', MarginLeft: 'auto'
        }),
        new Css.Rule('.NodeEditor-Module', {
            AlignItems: 'center', Background: '#22272c', Border: '1px solid transparent',
            BorderRadius: '5px', Cursor: 'grab', Display: 'grid', Gap: '8px',
            GridTemplateColumns: '29px minmax(0,1fr)', MarginBottom: '3px',
            Padding: '6px', UserSelect: 'none'
        }),
        new Css.Rule('.NodeEditor-Module:hover', {
            Background: '#292f34', BorderColor: '#444b52'
        }),
        new Css.Rule('.NodeEditor-Module[data-dragging="true"]', {
            BorderColor: '#e40c88', BoxShadow: '0 0 0 2px rgba(228,12,136,.12)', Opacity: '.72'
        }),
        new Css.Rule('.NodeEditor-ModuleIcon', {
            AlignItems: 'center', Background: 'var(--module-color,#e40c88)', BorderRadius: '5px',
            Color: '#fff', Display: 'flex', Font: '800 10px/1 var(--arianna-font,system-ui,sans-serif)',
            Height: '27px', JustifyContent: 'center', Overflow: 'hidden', Width: '27px'
        }),
        new Css.Rule('.NodeEditor-ModuleName', {
            Color: '#dce1e5', Font: '720 9px/1.15 var(--arianna-font,system-ui,sans-serif)',
            Overflow: 'hidden', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap'
        }),
        new Css.Rule('.NodeEditor-ModuleDescription', {
            Color: '#78828b', Font: '8px/1.25 var(--arianna-font,system-ui,sans-serif)',
            MarginTop: '2px', Overflow: 'hidden', TextOverflow: 'ellipsis', WhiteSpace: 'nowrap'
        }),
        new Css.Rule('.NodeEditor-PaletteEmpty', {
            Color: '#77818a', Font: '9px/1.4 var(--arianna-font,system-ui,sans-serif)',
            Padding: '14px 8px', TextAlign: 'center'
        }),

        new Css.Rule('.NodeEditor-Workspace', {
            BackgroundColor: '#1b1f22',
            BackgroundImage: 'radial-gradient(circle,#3a4045 1px,transparent 1px)',
            BackgroundSize: '20px 20px', MinWidth: '260px', Overflow: 'auto', Position: 'relative'
        }),
        new Css.Rule('.NodeEditor-Workspace[data-drag-over="true"]', {
            BoxShadow: 'inset 0 0 0 2px #e40c88'
        }),
        new Css.Rule('.NodeEditor-Workspace::after', {
            Background: 'radial-gradient(circle at 50% 45%,transparent 0 45%,rgba(0,0,0,.18) 100%)',
            Content: '""', Inset: '0', PointerEvents: 'none', Position: 'absolute'
        }),
        new Css.Rule('.NodeEditor-Wires', {
            Height: '100%', Inset: '0', Overflow: 'visible', PointerEvents: 'none',
            Position: 'absolute', Width: '100%', ZIndex: '1'
        }),
        new Css.Rule('.NodeEditor-Wire', { Fill: 'none', Stroke: '#fff', StrokeWidth: '2',StrokeLinejoin:'round',StrokeLinecap:'round' }),
        new Css.Rule('.NodeEditor-Wire[data-status="connected-warn"]', { Stroke: '#fff' }),
        new Css.Rule('.NodeEditor-Wire[data-status="connected-error"]', { Stroke: '#fff' }),
        new Css.Rule('.NodeEditor-Node', {
            Background: '#2a2f33', Border: '1px solid #43494e', BorderRadius: '10px',
            BoxShadow: '0 7px 18px rgba(0,0,0,.28)', Width:'174px', MinWidth: '174px', BoxSizing:'border-box',
            Position: 'absolute', UserSelect: 'none', ZIndex: '2'
        }),
        new Css.Rule('.NodeEditor-Node[data-selected="true"]', {
            BorderColor: '#e40c88',
            BoxShadow: '0 0 0 2px rgba(228,12,136,.16),0 8px 20px rgba(0,0,0,.32)'
        }),
        new Css.Rule('.NodeEditor-NodeHeader', {
            AlignItems: 'center', Display: 'grid', Gap: '8px',
            GridTemplateColumns: '32px 1fr auto', Padding: '9px 10px 7px'
        }),
        new Css.Rule('.NodeEditor-NodeIcon', {
            AlignItems: 'center', Background: 'var(--node-color,#e40c88)', BorderRadius: '8px',
            BoxShadow: 'inset 0 1px 0 rgba(255,255,255,.22)', Color: '#fff',
            Display: 'flex', FontSize: '13px', Height: '30px', JustifyContent: 'center', Width: '30px'
        }),
        new Css.Rule('.NodeEditor-NodeName', { FontSize: '10px', FontWeight: '760' }),
        new Css.Rule('.NodeEditor-NodeType', { Color: '#8f979f', FontSize: '8px', MarginTop: '2px' }),
        new Css.Rule('.NodeEditor-NodeMenu', { Color: '#8f979f', FontSize: '14px' }),
        new Css.Rule('.NodeEditor-NodeBody', {
            BorderTop: '1px solid #3a4045', Color: '#aab1b7', FontSize: '8.5px',
            LineHeight: '1.35', Padding: '7px 10px 9px'
        }),
        new Css.Rule('.NodeEditor-Port', {
            AlignItems: 'center', Display: 'flex', FontSize: '8px', Gap: '5px',
            Position: 'absolute', Top: '50%', Transform: 'translateY(-50%)'
        }),
        new Css.Rule('.NodeEditor-Port[data-side="in"]', { Left: '-7px' }),
        new Css.Rule('.NodeEditor-Port[data-side="out"]', { Right: '-7px' }),
        new Css.Rule('.NodeEditor-PortDot', {
            Background: '#202428', Border: '2px solid #4eb0a5', BorderRadius: '50%',
            BoxShadow: '0 0 0 2px #1b1f22', Height: '9px', Width: '9px'
        }),
        new Css.Rule('.NodeEditor-Add', {
            AlignItems: 'center', Appearance: 'none', Background: '#2a2f33',
            Border: '1px solid #4a5056', BorderRadius: '50%', Color: '#c8ced3',
            Cursor: 'pointer', Display: 'flex', FontSize: '16px', Height: '34px',
            JustifyContent: 'center', Position: 'absolute', Width: '34px', ZIndex: '3'
        }),

        new Css.Rule('.NodeEditor-Inspector', {
            Background: '#24282c', BorderLeft: '1px solid #111417', Display: 'grid',
            GridTemplateRows: '44px 1fr', MinHeight: '0'
        }),
        new Css.Rule('.NodeEditor-InspectorHeader', { Flex:'0 0 36px',
            AlignItems: 'center', Background: 'linear-gradient(180deg,#33383d,#292d31)',
            BorderBottom: '1px solid #15181a', Display: 'flex', FontSize: '10px',
            FontWeight: '760', Padding: '0 11px'
        }),
        new Css.Rule('.NodeEditor-InspectorBody', { OverflowY: 'auto', Padding: '10px' }),
        new Css.Rule('.NodeEditor-SectionTitle', {
            Color: '#7f8890', FontSize: '8px', FontWeight: '800',
            LetterSpacing: '.09em', Margin: '9px 0 6px', TextTransform: 'uppercase'
        }),
        new Css.Rule('.NodeEditor-Info', {
            Background: '#1c2024', Border: '1px solid #353a40', BorderRadius: '6px',
            FontSize: '9px', LineHeight: '1.4', Padding: '8px'
        }),
        new Css.Rule('.NodeEditor-Param', { Display: 'grid', Gap: '4px', MarginBottom: '8px' }),
        new Css.Rule('.NodeEditor-Param label', { Color: '#8f979f', FontSize: '8px' }),
        new Css.Rule('.NodeEditor-Input', {
            Appearance: 'none', Background: '#171b1e', Border: '1px solid #40464c',
            BorderRadius: '4px', Color: '#e0e4e7',
            Font: '9px/1.2 var(--arianna-font,system-ui,sans-serif)',
            Outline: 'none', Padding: '7px'
        }),
        new Css.Rule('.NodeEditor-Input:focus', {
            BorderColor: '#e40c88', BoxShadow: '0 0 0 2px rgba(228,12,136,.13)'
        }),

        new Css.Rule('.NodeEditor[theme="light"]', {
            Background: '#eef0f2', BorderColor: '#b9bec3', Color: '#25292d'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Toolbar,.NodeEditor[theme="light"] .NodeEditor-InspectorHeader', {
            Background: 'linear-gradient(180deg,#fff,#e1e4e7)', BorderColor: '#b9bec3'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Button', {
            Background: 'linear-gradient(180deg,#f9fbfc,#e0e4e7)', BorderColor: '#b8bdc2', Color: '#25292d'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Palette', {
            Background: '#f4f5f6', BorderColor: '#bcc1c5'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteHeader', {
            Background: '#e8ebed', BorderColor: '#c6cacf'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteTitle', { Color: '#4b545c' }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteCount', {
            Background: '#fff', BorderColor: '#c6cbd0', Color: '#667079'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteSearchWrap', { BorderColor: '#c7ccd0' }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteSearch', {
            Background: '#fff', BorderColor: '#c6cbd0', Color: '#30363b'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PaletteCategoryHeader', { Color: '#6e7881' }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Module', {
            Background: '#fff', BorderColor: '#d7dbde'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Module:hover', {
            Background: '#f7f8f9', BorderColor: '#aeb5bb'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-ModuleName', { Color: '#333a40' }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-ModuleDescription', { Color: '#7a838b' }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Workspace', {
            BackgroundColor: '#fafafa',
            BackgroundImage: 'radial-gradient(circle,#c6cacd 1px,transparent 1px)'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Node', {
            Background: '#fff', BorderColor: '#c6cbd0', BoxShadow: '0 6px 16px rgba(0,0,0,.12)'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-NodeBody', {
            BorderTopColor: '#e2e4e6', Color: '#626970'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Inspector', {
            Background: '#e5e8ea', BorderColor: '#bcc1c5'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Info,.NodeEditor[theme="light"] .NodeEditor-Input', {
            Background: '#fff', BorderColor: '#c5cacf', Color: '#30363b'
        }),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Button[data-active="true"]', {Background:'linear-gradient(180deg,#ff4dad 0%,#e40c88 55%,#b90769 100%)',BorderColor:'#e40c88',Color:'#fff'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-State,.NodeEditor[theme="light"] .NodeEditor-SectionTitle,.NodeEditor[theme="light"] .NodeEditor-Param label', {Color:'#626a71'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-PortDot', {Background:'#fff',BoxShadow:'0 0 0 2px #eef0f2'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Add', {Background:'linear-gradient(180deg,#f9fbfc,#e0e4e7)',BorderColor:'#b8bdc2',Color:'#25292d'}),
        new Css.Rule('.NodeEditor[state="running"] .NodeEditor-Wire,.NodeEditor[state="paused"] .NodeEditor-Wire', {StrokeDasharray:'none'}),
        new Css.Rule('.NodeEditor[state="running"] .NodeEditor-Workspace', {BoxShadow:'inset 0 0 0 1px #e40c8855'})
,

        new Css.Rule('.NodeEditor-Body',{Display:'block',Position:'relative',Overflow:'hidden',MinWidth:'0'}),
        new Css.Rule('.NodeEditor-Viewport',{Position:'absolute',Inset:'0',MinWidth:'0',MinHeight:'0'}),
        new Css.Rule('.NodeEditor .NodeEditor-Canvas',{Width:'100%',Height:'100%',MinHeight:'0',Border:'0',BorderRadius:'0'}),
        new Css.Rule('.NodeEditor .NodeEditor-Canvas .Canvas2D-Artboard',{Width:'100%',Height:'100%',Background:'transparent',Border:'0',BoxShadow:'none'}),
        new Css.Rule('.NodeEditor .NodeEditor-Canvas .Canvas2D-World',{Overflow:'visible'}),
        new Css.Rule('.NodeEditor .NodeEditor-Workspace,.NodeEditor[theme="light"] .NodeEditor-Workspace',{Background:'none',Position:'absolute',Inset:'0',Overflow:'visible',MinWidth:'0',PointerEvents:'none'}),
        new Css.Rule('.NodeEditor .NodeEditor-Node',{PointerEvents:'auto',Overflow:'visible',Transform:'scale(.8)',TransformOrigin:'0 0'}),
        new Css.Rule('.NodeEditor .NodeEditor-NodeBody',{Padding:'8px 24px 12px',MinHeight:'52px',BoxSizing:'border-box'}),
        new Css.Rule('.NodeEditor .NodeEditor-Port',{Appearance:'none',Position:'absolute',Transform:'none',Width:'12px',Height:'5.25px',Padding:'0',Border:'1px solid #15181a',Background:'linear-gradient(180deg,#858c92,#414950)',BoxShadow:'inset 0 1px 2px #0007,0 1px 1px #0005',Cursor:'crosshair',ZIndex:'3',BoxSizing:'border-box'}),
        new Css.Rule('.NodeEditor .NodeEditor-Port[data-side="in"]',{Left:'-4px',Right:'auto',BorderRadius:'4px 0 0 4px'}),
        new Css.Rule('.NodeEditor .NodeEditor-Port[data-side="out"]',{Right:'-4px',Left:'auto',BorderRadius:'0 4px 4px 0'}),
        new Css.Rule('.NodeEditor .NodeEditor-Port[data-status="connected-ok"]',{Background:'linear-gradient(180deg,#ecffb7 0%,#b1ef38 38%,#6ab800 75%,#3b6e00)',BoxShadow:'0 0 5px #a5f72a99,inset 0 1px 2px #fff9'}),
        new Css.Rule('.NodeEditor .NodeEditor-Port[data-status="connected-warn"]',{Background:'linear-gradient(180deg,#eadb88,#b69a14 40%,#786300)',BoxShadow:'0 0 5px #c2a32377,inset 0 1px 2px #fff7'}),
        new Css.Rule('.NodeEditor .NodeEditor-Port[data-status="connected-error"]',{Background:'linear-gradient(180deg,#ffc0b8,#ff4545 40%,#a90707)',BoxShadow:'0 0 5px #ff333399,inset 0 1px 2px #fff8'}),
        new Css.Rule('.NodeEditor .NodeEditor-Port[data-pending="true"]',{Outline:'2px solid #e40c88',OutlineOffset:'-2px'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Wire',{Stroke:'#4b545e',Filter:'none'}),
        new Css.Rule('.NodeEditor .NodeEditor-Wire',{Stroke:'var(--workflow-wire,#fff)',StrokeWidth:'2',Filter:'drop-shadow(0 1px 1px #0008)',PointerEvents:'none',Cursor:'pointer'}),
        new Css.Rule('.NodeEditor .NodeEditor-Wire[data-preview="true"]',{StrokeDasharray:'none',PointerEvents:'none'}),
        new Css.Rule('.NodeEditor .NodeEditor-Button[data-active="true"],.NodeEditor[theme="light"] .NodeEditor-Button[data-active="true"]',{Background:'linear-gradient(180deg,#444a50,#30353a)',BorderColor:'#15181a',Color:'#dce0e3',BoxShadow:'none'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-Button[data-active="true"]',{Background:'linear-gradient(180deg,#f9fbfc,#e0e4e7)',BorderColor:'#b8bdc2',Color:'#25292d'}),
        new Css.Rule('.NodeEditor .NodeEditor-Button:disabled',{Opacity:'1'}),
        new Css.Rule('.NodeEditor .NodeEditor-Button[data-kind="run"][data-active="true"] .NodeEditor-ControlGlyph',{Color:'#adff2f',TextShadow:'0 0 4px #afff32,0 0 10px #80ee44'}),
        new Css.Rule('.NodeEditor .NodeEditor-Button[data-kind="stop"][data-active="true"] .NodeEditor-ControlGlyph',{Color:'#ff4545',TextShadow:'0 0 4px #ff4545,0 0 10px #ff2222'}),
        new Css.Rule('.NodeEditor .NodeEditor-PaletteCategoryHeader',{Appearance:'none',Width:'100%',Border:'0',Background:'transparent',Cursor:'pointer',TextAlign:'left'}),
        new Css.Rule('.NodeEditor .NodeEditor-Palette,.NodeEditor .NodeEditor-Inspector',{Width:'100%',Height:'auto',Flex:'1 1 0',MinHeight:'0',BoxSizing:'border-box',Display:'flex',FlexDirection:'column',Overflow:'hidden'}),
        new Css.Rule('.NodeEditor .NodeEditor-Input',{Width:'100%',BoxSizing:'border-box',MinWidth:'0',MarginBottom:'4px'}),
        new Css.Rule('.NodeEditor[theme="dark"] .NodeEditor-NodeName',{Color:'#e5e8ea'}),
        new Css.Rule('.NodeEditor[theme="light"] .NodeEditor-NodeName',{Color:'#25292d'}),
        new Css.Rule('.NodeEditor .Canvas2D-Toolbar label',{Color:'#e5e8ea'}),
        new Css.Rule('.NodeEditor[theme="light"] .Canvas2D-Toolbar label',{Color:'#25292d'}),
        new Css.Rule('.NodeEditor .NodeEditor-Button',{TextShadow:'0 -1px 1px #0009',BoxShadow:'inset 0 1px 0 #ffffff18,0 1px 2px #0004'}),
        new Css.Rule('.NodeEditor .NodeEditor-Result',{Display:'block',FontSize:'22px',TextAlign:'center',Color:'inherit',Padding:'4px 0'}),
        new Css.Rule('.NodeEditor .NodeEditor-Base',{Appearance:'none',Color:'inherit',Background:'transparent',Border:'1px solid #8886',BorderRadius:'3px',Cursor:'text',Padding:'2px 5px',MarginBottom:'4px'}),
        new Css.Rule('.NodeEditor .NodeEditor-Error',{Color:'#eb9d42',FontSize:'9px',MarginTop:'4px'}),
        new Css.Rule('.NodeEditor [hidden]',{Display:'none'}),
        new Css.Rule('.NodeEditor [data-grid2d]',{Filter:'none'}),
        new Css.Rule('.NodeEditor .NodeEditor-Wire[data-selected="true"]',{Stroke:'#fff',Filter:'drop-shadow(0 0 3px #e40c88) drop-shadow(0 1px 1px #0008)'}),
        new Css.Rule('.NodeEditor .NodeEditor-WireHit',{Fill:'none',Stroke:'transparent',StrokeWidth:'10',StrokeDasharray:'none',PointerEvents:'stroke',Cursor:'pointer'}),
        new Css.Rule('.NodeEditor-WireMenu',{Position:'fixed',ZIndex:'2147483647',MinWidth:'170px',MaxWidth:'calc(100vw - 16px)',Padding:'4px',Display:'grid',Gap:'2px',Background:'#292d31',Color:'#e4e8eb',Border:'1px solid #44474e',BorderRadius:'6px',BoxShadow:'0 12px 32px #0008',Font:'11px/1.3 var(--arianna-font,system-ui,sans-serif)'}),
        new Css.Rule('.NodeEditor-WireMenu button',{Appearance:'none',TextAlign:'left',Border:'0',BorderRadius:'4px',Padding:'7px 10px',Font:'inherit',Cursor:'pointer',Color:'inherit',Background:'transparent'}),
        new Css.Rule('.NodeEditor-WireMenu button:hover,.NodeEditor-WireMenu button:focus-visible',{Outline:'none',Background:'linear-gradient(180deg,#ff4dad,#e40c88,#b90769)',Color:'#fff'}),
        new Css.Rule('.NodeEditor-WireMenu[data-theme="light"]',{Background:'#eef0f2',Color:'#25292d',BorderColor:'#b9bec3'}),
        new Css.Rule('.NodeEditor-Toolbar',{FlexWrap:'wrap',FlexShrink:'0',MinHeight:'40px'}),
        new Css.Rule('.NodeEditor-Button',{FlexShrink:'0',MinHeight:'26px'}),
        new Css.Rule('.NodeEditor-Port[data-hover="true"]',{Filter:'brightness(1.25)',BoxShadow:'0 0 7px currentColor'}),
        new Css.Rule('.NodeEditor-WireMenuInfo',{Padding:'6px 10px',Color:'inherit',Opacity:'.75',FontSize:'10px',OverflowWrap:'anywhere',BorderBottom:'1px solid #8885'})
    
    ]);

    interface Runtime {
        reconnect?:{id:string;side:'in'|'out';point:{x:number;y:number}};cancelReconnect?:()=>void;snap?:ReturnType<Canvas2D['getSnap']>;
        canvas:Canvas2D|null; grid:Grid2D|null; docks:Dockable[];bar:InstanceType<typeof ToolBar>|null;barPosition:'top'|'bottom'|'left'|'right';
        probes:HTMLElement[];wireFrame:number|null;
        dockPositions:Array<'left'|'right'|'top'|'bottom'|'float'>;
        dockRects:Array<{left:string;top:string;width:string;height:string}>;
        viewport:ReturnType<Canvas2D['getViewport']>|null;
        controller:AbortController|null; resize:ResizeObserver|null;
        collapsed:Set<string>; values:Map<string,Types.Value>; errors:Map<string,string>;
        selection:SelectionRectangle|null; selectedNodes:Set<string>; selectedWires:Set<string>; syncingSelection:boolean; pasteCount:number;
        modules:Map<string,{editor:NodeEditor;window:HTMLElement;restore:()=>void;close:(save?:boolean)=>void}>; bindings:Record<string,Types.Value>|null; outputs:Map<string,Map<string,Types.Value>>;
        selectedWire:string|null; closeMenu:(()=>void)|null;
        pending:{node:string;port:string}|null; hoverPort:HTMLElement|null; pointerScreen:{x:number;y:number}|null; pointer:{x:number;y:number}|null;
        frame:number|null; urls:Set<string>; timers:Set<ReturnType<typeof setTimeout>>;
    }
    let clipboard:Interfaces.Clipboard|null=null;
    let sequence=0;const Unique=(prefix:string)=>`${prefix}-${Date.now()}-${++sequence}-${Math.random().toString(36).slice(2,7)}`;
    const runtimes=new WeakMap<HTMLElement,Runtime>();
    const moduleHosts=new WeakMap<HTMLElement,{minimize:()=>void;toggleMaximize:()=>void;close:()=>void}>();
    const normalizedCatalogs=new WeakMap<HTMLElement,Interfaces.NodeSchema[]>();

    // Additive rules preserve the established Dark/Light AriannA palette.
    @Component('arianna-node-editor',Styles, {
        Shadow:false,Attributes:['theme','state'],Properties:['schemas','nodes','wires']
    })
    export class NodeEditor extends HTMLDivElement {
        public static readonly Styles=Styles;
        public template=html``;
        private _schemas:Interfaces.NodeSchema[]=[];
        private _nodes:Interfaces.NodeInstance[]=[];
        private _wires:Interfaces.WireInstance[]=[];
        private _state:Types.RunState='idle';
        private _selected:string|null=null;
        private _typeCheck:Types.TypeCheckFn=(a,b)=>this.CheckType(a,b);
        private _runController:AbortController|null=null;

        private runtime():Runtime {
            let r=runtimes.get(this);
            if(!r){r={canvas:null,grid:null,docks:[],bar:null,barPosition:'bottom',probes:[],wireFrame:null,dockPositions:['left','right'],dockRects:[],viewport:null,controller:null,resize:null,collapsed:new Set(),values:new Map(),errors:new Map(),selection:null,selectedNodes:new Set(),selectedWires:new Set(),syncingSelection:false,pasteCount:0,modules:new Map(),bindings:null,outputs:new Map(),selectedWire:null,closeMenu:null,pending:null,hoverPort:null,pointerScreen:null,pointer:null,frame:null,urls:new Set(),timers:new Set()};runtimes.set(this,r);}return r;
        }
        private EnsureState():void {
            if(!Array.isArray(this._schemas))this._schemas=[];if(normalizedCatalogs.get(this)!==this._schemas){this._schemas=Catalog(this._schemas);normalizedCatalogs.set(this,this._schemas);}
            if(!Array.isArray(this._nodes))this._nodes=[];
            if(!Array.isArray(this._wires))this._wires=[];
            if(!['idle','running','paused'].includes(this._state))this._state='idle';
            if(typeof this._selected!=='string')this._selected=null;
            if(typeof this._typeCheck!=='function')this._typeCheck=(a,b)=>this.CheckType(a,b);
        }
        constructor(options:Interfaces.NodeEditorOptions={}) {
            super();if(options.theme)this.setAttribute('theme',options.theme);
            this._schemas=options.schemas??[];this._nodes=structuredClone(options.nodes??[]);this._wires=structuredClone(options.wires??[]);
            if(options.typeCheck)this._typeCheck=options.typeCheck;
        }
        public onCreated():void {
            const r=this.runtime();if(r.frame!==null)cancelAnimationFrame(r.frame);
            r.frame=requestAnimationFrame(()=>{r.frame=null;if(this.isConnected&&!this.OwnElement('.NodeEditor-Shell'))this.onConnected();});
        }
        public onConnected():void {this.EnsureState();this.classList.add('NodeEditor');if(!this.hasAttribute('tabindex'))this.tabIndex=0;if(!this.hasAttribute('theme'))this.setAttribute('theme','dark');this.Render();}
        public onAttributeChanged(name:string):void {
            if(name==='state'){const value=this.getAttribute('state'),next=value==='running'||value==='paused'?value:'idle';if(next!==this._state)this.setRunState(next);}
            else if(name==='theme'&&this.isConnected)this.Render();
        }
        public onDisconnected():void {const r=this.runtime();for(const item of [...r.modules.values()])item.close(false);this.Stop();if(r.frame!==null)cancelAnimationFrame(r.frame);r.frame=null;this.DisposeView();for(const t of r.timers)clearTimeout(t);r.timers.clear();for(const u of r.urls)URL.revokeObjectURL(u);r.urls.clear();const ai=this.AIState();if(ai.owner===this){ai.keys.clear();ai.cache.clear();}}
        public onUnmount():void {this.onDisconnected();}
        public get schemas():Interfaces.NodeSchema[]{this.EnsureState();return this._schemas;}
        public set schemas(v:Interfaces.NodeSchema[]){this.EnsureState();this._schemas=Catalog(Array.isArray(v)?v:[]);normalizedCatalogs.set(this,this._schemas);if(this.isConnected)this.Render();}
        public get nodes():Interfaces.NodeInstance[]{this.EnsureState();return this._nodes;}
        public set nodes(v:Interfaces.NodeInstance[]){this.EnsureState();this._nodes=(Array.isArray(v)?v:[]).map(n=>structuredClone(n));if(this.isConnected)this.Render();}
        public get wires():Interfaces.WireInstance[]{this.EnsureState();return this._wires;}
        public set wires(v:Interfaces.WireInstance[]){this.EnsureState();this._wires=structuredClone(Array.isArray(v)?v:[]);this.Revalidate();if(this.isConnected)this.Render();}
        public setSchemas(v:Interfaces.NodeSchema[]):this{this.schemas=v;return this;}
        public setTypeCheck(fn:Types.TypeCheckFn):this{this._typeCheck=fn;this.Revalidate();this.Refresh();return this;}
        public get Canvas():Canvas2D|null{return this.runtime().canvas;}
        public get Grid():Grid2D|null{return this.runtime().grid;}
        public get Panels():readonly Dockable[]{return this.runtime().docks;}
        public get Results():ReadonlyMap<string,Types.Value>{return new Map(this.runtime().values);}
        public get Errors():ReadonlyMap<string,string>{return new Map(this.runtime().errors);}
        public get runState():Types.RunState{this.EnsureState();return this._state;}
        public get RunSignal():AbortSignal|null{return this._runController?.signal??null;}
        public setRunState(state:Types.RunState):this {
            this.EnsureState();if(!['idle','running','paused'].includes(state))throw new TypeError('Invalid Workflow state: '+state);
            const previous=this._state;
            if(state==='running'&&(!this._runController||this._runController.signal.aborted))this._runController=new AbortController();
            if(state==='idle'||state==='paused'){this._runController?.abort(new DOMException('Workflow stopped.','AbortError'));this._runController=null;this.runtime().pending=null;}
            this._state=state;if(this.getAttribute('state')!==state)this.setAttribute('state',state);this.UpdateRunControls();
            if(previous!==state)this.dispatchEvent(new CustomEvent('arianna:workflow-state',{bubbles:true,composed:true,detail:{state,previous,signal:this.RunSignal,source:this}}));
            return this;
        }
        public Run():this {if(this.runState==='running'&&executions.has(this))return this;this.setRunState('running');if(this.HasAI(this._nodes)){const signal=this.RunSignal??undefined;const task=this.EvaluateAsync(signal).catch(error=>{if(!signal?.aborted){this.runtime().errors.set('workflow',error instanceof Error?error.message:String(error));this.Refresh();}});executions.set(this,task);void task.finally(()=>{if(executions.get(this)===task)executions.delete(this);});}else this.Evaluate();return this;}
        private HasAI(nodes:Interfaces.NodeInstance[]):boolean{return nodes.some(n=>n.schema.operation==='ai'||n.graph&&this.HasAI(n.graph.nodes));}
        public Pause():this{return this.setRunState('paused');}
        public Stop():this{this.CancelAI();this.setRunState('idle');this.UpdatePorts();this.RenderWires();return this;}
        private UpdateRunControls():void {
            const status=this.OwnElement('.NodeEditor-State');if(status)status.textContent='— '+this._state;
            for(const kind of ['run','pause','stop']){const b=this.OwnElement<HTMLButtonElement>(`.NodeEditor-Button[data-kind="${kind}"]`);if(!b)continue;const active=kind==='run'?this._state==='running':kind==='stop'?this._state==='idle':this._state==='paused';b.dataset.active=String(active);b.setAttribute('aria-pressed',String(active));b.disabled=kind==='pause'&&this._state!=='running';}
        }
        private ParseValue(value:unknown,type:string):Types.Value {
            if(type==='string')return String(value??'');if(type==='boolean')return value===true||value==='true';
            if(type==='array'){const data=typeof value==='string'?JSON.parse(value):value;if(!Array.isArray(data))throw new Error('Array required');return data;}
            if(type==='any')return typeof value==='number'||typeof value==='boolean'||Array.isArray(value)?value:String(value??'');
            return Number(value);
        }
        private CheckType(a:string,b:string):Types.WireStatus {
            const numeric=['number','float','integer'];return a===b||b==='any'||(numeric.includes(a)&&numeric.includes(b))?'connected-ok':a==='any'?'connected-warn':'connected-error';
        }
        public addNode(type:string,x:number,y:number,id=`node-${Date.now()}-${Math.random().toString(36).slice(2,8)}`):Interfaces.NodeInstance {
            this.EnsureState();const schema=this._schemas.find(s=>s.type===type);if(!schema)throw new Error('Workflow: unknown schema '+type);
            if(this._nodes.some(n=>n.id===id))throw new Error('Workflow: duplicate node '+id);
            const node:Interfaces.NodeInstance={id,type,x,y,schema:structuredClone(schema),params:Object.fromEntries((schema.params??[]).map(p=>[p.id,p.default]))};if(schema.operation==='module')node.graph=EmptyGraph();if(schema.operation==='input'||schema.operation==='output'){const base=String(node.params?.portId??(schema.operation==='input'?'in':'out'));let portId=base,index=2;while(this._nodes.some(n=>n.schema.operation===schema.operation&&n.params?.portId===portId))portId=base+index++;(node.params??={}).portId=portId;}this._nodes.push(node);this.Changed(true);return node;
        }
        public removeNode(id:string):void {
            this.EnsureState();this.runtime().modules.get(id)?.close(false);this._nodes=this._nodes.filter(n=>n.id!==id);this._wires=this._wires.filter(w=>w.srcNodeId!==id&&w.dstNodeId!==id);this.runtime().selectedNodes.delete(id);if(this._selected===id)this._selected=null;this.Changed(true);
        }
        public addWire(srcNodeId:string,srcPortId:string,dstNodeId:string,dstPortId:string):Interfaces.WireInstance|null {
            this.EnsureState();const src=this._nodes.find(n=>n.id===srcNodeId),dst=this._nodes.find(n=>n.id===dstNodeId);
            const a=src?.schema.outputs.find(p=>p.id===srcPortId),b=dst?.schema.inputs.find(p=>p.id===dstPortId);
            if(!a||!b||srcNodeId===dstNodeId)return null;
            if(this.ConnectionStatus(srcNodeId,srcPortId,dstNodeId,dstPortId)==='connected-error')return null;
            this._wires=this._wires.filter(w=>!(w.dstNodeId===dstNodeId&&w.dstPortId===dstPortId));
            const wire={id:`wire-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,srcNodeId,srcPortId,dstNodeId,dstPortId,srcType:a.type,dstType:b.type,status:this._typeCheck(a.type,b.type)??'connected-error'};
            this._wires.push(wire);this.runtime().pending=null;this.Changed();return wire;
        }
        /** Atomic endpoint replacement. Invalid drops leave the original wire intact. */
        public ReconnectWire(id:string,side:'in'|'out',nodeId:string,portId:string):boolean {
            const w=this.wires.find(w=>w.id===id);if(!w)return false;
            const src=side==='out'?nodeId:w.srcNodeId,sp=side==='out'?portId:w.srcPortId,dst=side==='in'?nodeId:w.dstNodeId,dp=side==='in'?portId:w.dstPortId;
            if(this.ConnectionStatus(src,sp,dst,dp,id)!=='connected-ok')return false;
            const source=this.nodes.find(n=>n.id===src)!.schema.outputs.find(p=>p.id===sp)!,target=this.nodes.find(n=>n.id===dst)!.schema.inputs.find(p=>p.id===dp)!;
            Object.assign(w,{srcNodeId:src,srcPortId:sp,dstNodeId:dst,dstPortId:dp,srcType:source.type,dstType:target.type,status:'connected-ok'});this.Changed();return true;
        }
        private StartReconnect(id:string,side:'in'|'out',event:MouseEvent):void {
            if(event.button!==0)return;event.preventDefault();event.stopPropagation();
            const r=this.runtime(),wire=this.wires.find(w=>w.id===id);if(!wire)return;r.cancelReconnect?.();r.pending=null;
            const control=new AbortController();let hovered:HTMLElement|null=null;
            const clearHover=()=>{if(hovered){delete hovered.dataset.reconnectStatus;hovered.style.removeProperty('box-shadow');hovered=null;}};
            const candidate=(x:number,y:number)=>{const port=this.ownerDocument.elementFromPoint(x,y)?.closest<HTMLElement>('.NodeEditor-Port');return port?.closest('.NodeEditor')===this&&port.dataset.side===side?port:null;};
            const status=(p:HTMLElement)=>this.ConnectionStatus(side==='out'?p.dataset.nodeId!:wire.srcNodeId,side==='out'?p.dataset.portId!:wire.srcPortId,side==='in'?p.dataset.nodeId!:wire.dstNodeId,side==='in'?p.dataset.portId!:wire.dstPortId,id);
            const finish=()=>{control.abort();clearHover();r.reconnect=undefined;r.cancelReconnect=undefined;this.RenderWires();};r.cancelReconnect=finish;
            const move=(e:MouseEvent)=>{clearHover();r.reconnect={id,side,point:this.LocalPoint(e.clientX,e.clientY)};hovered=candidate(e.clientX,e.clientY);if(hovered){const state=status(hovered);hovered.dataset.reconnectStatus=state;hovered.style.setProperty('box-shadow','0 0 8px 3px '+(state==='connected-ok'?'#9eff32':state==='connected-warn'?'#b99a16':'#ff4040'));}this.RenderWires();};
            r.controller?.signal.addEventListener('abort',finish,{once:true,signal:control.signal});
            this.ownerDocument.addEventListener('pointermove',move,{capture:true,signal:control.signal});
            // The first click picks up an endpoint; mouseup must NOT finish it.
            // A subsequent click on a compatible port commits the replacement.
            this.ownerDocument.addEventListener('pointerdown',e=>{
                if(e.button!==0)return;const target=candidate(e.clientX,e.clientY);
                const hit=this.ownerDocument.elementFromPoint(e.clientX,e.clientY);
                if(!hit||hit.closest('.NodeEditor')!==this)return;
                e.preventDefault();e.stopImmediatePropagation();
                if(target&&status(target)==='connected-ok'){const node=target.dataset.nodeId!,port=target.dataset.portId!;finish();this.ReconnectWire(id,side,node,port);}
                else move(e);
                // Suppress the following native click so a source port cannot
                // start a second, unrelated connection after reconnection.
                const block=(click:MouseEvent)=>{click.preventDefault();click.stopImmediatePropagation();};
                this.ownerDocument.addEventListener('click',block,{capture:true,once:true,signal:r.controller?.signal});
            },{capture:true,signal:control.signal});
            this.ownerDocument.addEventListener('pointercancel',finish,{once:true,signal:control.signal});
            this.ownerDocument.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish();}},{capture:true,signal:control.signal});
            this.ownerDocument.defaultView?.addEventListener('blur',finish,{once:true,signal:control.signal});move(event);
        }
        public removeWire(id:string):void{this._wires=this.wires.filter(w=>w.id!==id);const r=this.runtime();if(r.selectedWire===id)r.selectedWire=null;r.closeMenu?.();this.Changed();}
        public AddInput(id:string):PortSpec|null {
            const node=this.nodes.find(n=>n.id===id);if(!node||!node.schema.operation||!['add','subtract','multiply','divide','modulo','power','root','concat','and'].includes(node.schema.operation))return null;
            let i=node.schema.inputs.length+1;while(node.schema.inputs.some(p=>p.id==='input-'+i))i++;
            const port={id:'input-'+i,type:'number',label:'Input '+i};node.schema.inputs.push(port);this.Changed(true);return port;
        }
        /** Remove an optional operand input, and its connections, atomically. */
        public RemoveInput(id:string,portId?:string):PortSpec|null {
            const node=this.nodes.find(n=>n.id===id);if(!node||!node.schema.operation||!['add','subtract','multiply','divide','modulo','power','root','concat','and'].includes(node.schema.operation))return null;
            const minimum=Math.max(1,this.schemas.find(s=>s.type===node.type)?.inputs.length??(['add','subtract'].includes(node.schema.operation)?2:1));
            if(node.schema.inputs.length<=minimum)return null;
            const index=portId===undefined?node.schema.inputs.length-1:node.schema.inputs.findIndex(p=>p.id===portId);if(index<0)return null;
            const [port]=node.schema.inputs.splice(index,1),r=this.runtime();
            const removed=this.wires.filter(w=>w.dstNodeId===id&&w.dstPortId===port.id);
            this._wires=this.wires.filter(w=>!removed.includes(w));for(const w of removed){r.selectedWires.delete(w.id);if(r.selectedWire===w.id)r.selectedWire=null;}
            this.Changed(true);return port;
        }
        public RenameNode(id:string,name:string):this {
            const node=this.nodes.find(n=>n.id===id),value=String(name).trim();if(node&&value){node.schema.name=value;this.Changed();this.dispatchEvent(new CustomEvent('arianna:workflow-rename',{bubbles:true,composed:true,detail:{id,name:value}}));}return this;
        }
        public SetParameter(id:string,key:string,value:unknown):this {
            if(key==='apiKey')return this.SetAPIKey(id,String(value??''));
            if(this.nodes.find(n=>n.id===id)?.schema.operation==='ai'){this.CancelAI(id);this.AIState().cache.delete(id);}
            const node=this.nodes.find(n=>n.id===id);if(!node)return this;const previousPortId=String(node.params?.portId??'in');(node.params??={})[key]=value;
            const preview=this.runtime().bindings;if(node.schema.operation==='input'&&preview){if(key==='value')preview[String(node.params?.portId??'in')]=this.ParseValue(value,String(node.params?.portType??'number'));if(key==='portId'){preview[String(value)]=preview[previousPortId]??this.ParseValue(node.params?.value??0,String(node.params?.portType??'number'));if(String(value)!==previousPortId)delete preview[previousPortId];}}
            if(key==='numberType'&&node.schema.operation==='number')for(const port of node.schema.outputs)port.type=String(value);
            if(key==='portType'&&(node.schema.operation==='input'||node.schema.operation==='output'))for(const port of node.schema.operation==='input'?node.schema.outputs:node.schema.inputs)port.type=String(value);
            this.Changed();return this;
        }
        private Revalidate():void {
            for(const w of this._wires){const a=this._nodes.find(n=>n.id===w.srcNodeId)?.schema.outputs.find(p=>p.id===w.srcPortId),b=this._nodes.find(n=>n.id===w.dstNodeId)?.schema.inputs.find(p=>p.id===w.dstPortId);w.srcType=a?.type??'';w.dstType=b?.type??'';w.status=a&&b?(this._typeCheck(a.type,b.type)??'connected-error'):'connected-error';}
        }
        private Changed(render=false):void {
            const r=this.runtime();if(r.selectedWire&&!this._wires.some(w=>w.id===r.selectedWire)){r.selectedWire=null;r.closeMenu?.();}
            this.Revalidate();this.runtime().errors.clear();if(this.runState==='running')this.Evaluate();
            else this.Refresh();if(render&&this.isConnected)this.Render();
            this.dispatchEvent(new CustomEvent('arianna:workflow-change',{bubbles:true,composed:true,detail:this.export()}));
        }
        /** Execute independently addressed output ports, including nested custom modules. */
        public Evaluate():ReadonlyMap<string,Types.Value> {
            this.EnsureState();this.Revalidate();const r=this.runtime();r.values.clear();r.errors.clear();r.outputs.clear();let steps=0;
            const engine=(graph:Interfaces.Graph,bindings:Record<string,()=>Types.Value>|null,depth:number)=>{
                if(depth>32)throw new Error('Module nesting limit (32)');
                const memo=new Map<string,Types.Value>(),visiting=new Set<string>();
                const children=new Map<string,ReturnType<typeof engine>>();
                const read=(id:string,portId?:string):Types.Value=>{
                    if(++steps>10000)throw new Error('Workflow execution limit (10000)');
                    const node=graph.nodes.find(n=>n.id===id);if(!node)throw new Error('Missing source '+id);
                    const port=portId??node.schema.outputs[0]?.id??'',key=JSON.stringify([id,port]);
                    if(memo.has(key))return memo.get(key)!;if(visiting.has(key))throw new Error('Cycle detected');visiting.add(key);
                    const input=(i:number):Types.Value=>{
                        const p=node.schema.inputs[i];if(!p)throw new Error('Missing input');const w=graph.wires.find(w=>w.dstNodeId===id&&w.dstPortId===p.id);
                        if(!w){if(i===1&&['log','exp'].includes(node.schema.operation??''))return Number(node.params?.base??(node.schema.operation==='log'?10:Math.E));throw new Error('Connect '+(p.label??p.id));}
                        const source=graph.nodes.find(n=>n.id===w.srcNodeId)?.schema.outputs.find(p=>p.id===w.srcPortId);
                        if(!source||this._typeCheck(source.type,p.type)==='connected-error'||this._typeCheck(source.type,p.type)===null)throw new Error('Invalid connection type');
                        return read(w.srcNodeId,w.srcPortId);
                    };
                    try {
                        const op=node.schema.operation;let value:Types.Value;
                        if(op==='ai'){const wire=graph.wires.find(w=>w.dstNodeId===id&&w.dstPortId==='prompt');value=this.AIValue(node,wire?TextValue(input(0)):String(node.params?.prompt??''),port);}
                        else if(op==='string')value=String(node.params?.value??'');
                        else if(op==='boolean')value=node.params?.value===true||node.params?.value==='true';
                        else if(op==='if')value=input(0)?input(1):input(2);
                        else if(op==='number'||op==='input'){
                            const boundary=String(node.params?.portId??'in');
                            if(op==='input'&&bindings){const binding=bindings[boundary];if(!binding)throw new Error('Connect input '+boundary);value=binding();}
                            else {const raw=String(node.params?.value??(op==='input'?0:'')).trim();if(!raw&&op==='number')throw new Error('Enter a number');value=op==='input'?this.ParseValue(raw,String(node.params?.portType??'number')):Number(raw);}
                            if((node.params?.numberType??node.params?.portType)==='integer'&&!Number.isInteger(value))throw new Error('Integer required');
                        }else if(op==='module'){
                            const inner=node.graph;if(!inner)throw new Error('Empty module has no graph');
                            let child=children.get(id);if(!child){const bound:Record<string,()=>Types.Value>=Object.create(null);node.schema.inputs.forEach((p,i)=>bound[p.id]=()=>input(i));child=engine(inner,bound,depth+1);children.set(id,child);}
                            const out=inner.nodes.find(n=>n.schema.operation==='output'&&String(n.params?.portId??'out')===port);if(!out)throw new Error('Missing module output '+port);value=child.read(out.id);
                        }else {
                            const raw=node.schema.inputs.map((_,i)=>input(i));if(!raw.length)throw new Error('No inputs');const values=raw.map(Number),[a,b]=values;
                            const count=(n:number)=>{if(!Number.isInteger(n)||n<0||n>1000)throw new Error('Loop count must be an integer between 0 and 1000');return n;};
                            switch(op){
                                case 'result':case 'output':value=raw[0];break;
                                case 'equal':value=JSON.stringify(raw[0])===JSON.stringify(raw[1]);break;
                                case 'less':value=a<b;break;case 'and':value=raw.every(Boolean);break;case 'not':value=!raw[0];break;
                                case 'range':if(!Number.isInteger(a)||!Number.isInteger(b))throw new Error('Integer range required');value=Array.from({length:count(Math.max(0,b-a))},(_,i)=>a+i);break;
                                case 'repeat':value=Array.from({length:count(b)},()=>structuredClone(raw[0]));break;
                                case 'sum':if(!Array.isArray(raw[0]))throw new Error('Array required');value=raw[0].reduce<number>((sum,v)=>sum+Number(v),0);break;
                                case 'concat':value=raw.map(String).join('');break;case 'upper':value=String(raw[0]).toUpperCase();break;case 'lower':value=String(raw[0]).toLowerCase();break;
                                case 'replace':value=String(raw[0]).split(String(raw[1])).join(String(raw[2]));break;case 'split':value=String(raw[0]).split(String(raw[1]));break;
                                case 'join':if(!Array.isArray(raw[0]))throw new Error('Array required');value=raw[0].join(String(raw[1]));break;
                                case 'url':value=new URL(String(raw[0]),String(raw[1])).href;break;case 'url-query':value=new URL(String(raw[0])).searchParams.get(String(raw[1]))??'';break;
                                case 'encode':value=encodeURIComponent(String(raw[0]));break;case 'decode':value=decodeURIComponent(String(raw[0]));break;
                                case 'add':value=values.reduce((x,y)=>x+y);break;
                                case 'subtract':value=values.reduce((x,y)=>x-y);break;
                                case 'multiply':value=values.reduce((x,y)=>x*y);break;
                                case 'divide':value=values.reduce((x,y)=>{if(y===0)throw new Error('Division by zero');return x/y;});break;
                                case 'modulo':value=values.reduce((x,y)=>{if(y===0)throw new Error('Modulo by zero');return x%y;});break;
                                case 'power':value=values.reduce((x,y)=>Math.pow(x,y));break;
                                case 'root':value=values.reduce((x,y)=>{if(y===0)throw new Error('Root degree cannot be zero');return x<0&&Number.isInteger(y)&&Math.abs(y%2)===1?-Math.pow(-x,1/y):Math.pow(x,1/y);});break;
                                case 'log':if(a<=0||b<=0||b===1)throw new Error('Logarithm domain / base');value=Math.log(a)/Math.log(b);for(const base of values.slice(2)){if(base<=0||base===1||value<=0)throw new Error('Logarithm domain / base');value=Math.log(value)/Math.log(base);}break;
                                case 'exp':value=Math.pow(b,a);for(const base of values.slice(2))value=Math.pow(base,value);break;
                                default:throw new Error('No numeric operation declared');
                            }
                        }
                        if(typeof value==='number'&&!Number.isFinite(value))throw new Error('Non-finite result');memo.set(key,value);return value;
                    }finally{visiting.delete(key);}
                };
                return {read};
            };
            const bindings=r.bindings?Object.fromEntries(Object.entries(r.bindings).map(([k,v])=>[k,()=>v])):null;
            const run=engine({nodes:this._nodes,wires:this._wires},bindings,0);
            for(const node of this._nodes.filter(n=>n.schema.operation)){
                const ports=node.schema.outputs.length?node.schema.outputs.map(p=>p.id):[''];
                for(const port of ports)try{const value=run.read(node.id,port);let out=r.outputs.get(node.id);if(!out){out=new Map();r.outputs.set(node.id,out);}out.set(port,value);if(port===ports[0])r.values.set(node.id,value);}catch(error){r.errors.set(node.id,error instanceof Error?error.message:String(error));}
            }
            for(const w of this._wires)if(w.status!=='connected-error'&&(r.errors.has(w.srcNodeId)||r.errors.has(w.dstNodeId)))w.status='connected-warn';
            this.Refresh();this.dispatchEvent(new CustomEvent('arianna:workflow-result',{bubbles:true,composed:true,detail:{values:new Map(r.values),outputs:this.Outputs,errors:new Map(r.errors)}}));return new Map(r.values);
        }
        public async EvaluateAsync(signal?:AbortSignal,targetId?:string):Promise<ReadonlyMap<string,Types.Value>> {
            this.EnsureState();this.Revalidate();const r=this.runtime();r.values.clear();r.errors.clear();r.outputs.clear();let steps=0;const requests=new Map<string,Promise<AIResponse>>();
            const engine=(graph:Interfaces.Graph,bindings:Record<string,()=>Types.Value|Promise<Types.Value>>|null,depth:number)=>{
                if(depth>32)throw new Error('Module nesting limit (32)');
                const memo=new Map<string,Types.Value>(),visiting=new Set<string>();
                const children=new Map<string,ReturnType<typeof engine>>();
                const read=async(id:string,portId?:string):Promise<Types.Value>=>{
                    if(signal?.aborted)throw signal.reason??new DOMException('Stopped','AbortError');
                    if(++steps>10000)throw new Error('Workflow execution limit (10000)');
                    const node=graph.nodes.find(n=>n.id===id);if(!node)throw new Error('Missing source '+id);
                    const port=portId??node.schema.outputs[0]?.id??'',key=JSON.stringify([id,port]);
                    if(memo.has(key))return memo.get(key)!;if(visiting.has(key))throw new Error('Cycle detected');visiting.add(key);
                    const input=async(i:number):Promise<Types.Value>=>{
                        const p=node.schema.inputs[i];if(!p)throw new Error('Missing input');const w=graph.wires.find(w=>w.dstNodeId===id&&w.dstPortId===p.id);
                        if(!w){if(i===1&&['log','exp'].includes(node.schema.operation??''))return Number(node.params?.base??(node.schema.operation==='log'?10:Math.E));throw new Error('Connect '+(p.label??p.id));}
                        const source=graph.nodes.find(n=>n.id===w.srcNodeId)?.schema.outputs.find(p=>p.id===w.srcPortId);
                        if(!source||this._typeCheck(source.type,p.type)==='connected-error'||this._typeCheck(source.type,p.type)===null)throw new Error('Invalid connection type');
                        return read(w.srcNodeId,w.srcPortId);
                    };
                    try {
                        const op=node.schema.operation;let value:Types.Value;
                        if(op==='ai'){const wire=graph.wires.find(w=>w.dstNodeId===id&&w.dstPortId==='prompt');const prompt=wire?TextValue(await input(0)):String(node.params?.prompt??'');const requestKey=node.id+'|'+JSON.stringify(this.AIConfig(node,prompt));let task=requests.get(requestKey);if(!task){task=this.RequestAI(node,prompt,signal);requests.set(requestKey,task);}const reply=await task;value=port==='response'?reply.response:reply.text;}
                        else if(op==='string')value=String(node.params?.value??'');
                        else if(op==='boolean')value=node.params?.value===true||node.params?.value==='true';
                        else if(op==='if')value=await input(0)?await input(1):await input(2);
                        else if(op==='number'||op==='input'){
                            const boundary=String(node.params?.portId??'in');
                            if(op==='input'&&bindings){const binding=bindings[boundary];if(!binding)throw new Error('Connect input '+boundary);value=await binding();}
                            else {const raw=String(node.params?.value??(op==='input'?0:'')).trim();if(!raw&&op==='number')throw new Error('Enter a number');value=op==='input'?this.ParseValue(raw,String(node.params?.portType??'number')):Number(raw);}
                            if((node.params?.numberType??node.params?.portType)==='integer'&&!Number.isInteger(value))throw new Error('Integer required');
                        }else if(op==='module'){
                            const inner=node.graph;if(!inner)throw new Error('Empty module has no graph');
                            let child=children.get(id);if(!child){const bound:Record<string,()=>Types.Value|Promise<Types.Value>>=Object.create(null);node.schema.inputs.forEach((p,i)=>bound[p.id]=()=>input(i));child=engine(inner,bound,depth+1);children.set(id,child);}
                            const out=inner.nodes.find(n=>n.schema.operation==='output'&&String(n.params?.portId??'out')===port);if(!out)throw new Error('Missing module output '+port);value=await child.read(out.id);
                        }else {
                            const raw:Types.Value[]=[];for(let i=0;i<node.schema.inputs.length;i++)raw.push(await input(i));if(!raw.length)throw new Error('No inputs');const values=raw.map(Number),[a,b]=values;
                            const count=(n:number)=>{if(!Number.isInteger(n)||n<0||n>1000)throw new Error('Loop count must be an integer between 0 and 1000');return n;};
                            switch(op){
                                case 'result':case 'output':value=raw[0];break;
                                case 'equal':value=JSON.stringify(raw[0])===JSON.stringify(raw[1]);break;
                                case 'less':value=a<b;break;case 'and':value=raw.every(Boolean);break;case 'not':value=!raw[0];break;
                                case 'range':if(!Number.isInteger(a)||!Number.isInteger(b))throw new Error('Integer range required');value=Array.from({length:count(Math.max(0,b-a))},(_,i)=>a+i);break;
                                case 'repeat':value=Array.from({length:count(b)},()=>structuredClone(raw[0]));break;
                                case 'sum':if(!Array.isArray(raw[0]))throw new Error('Array required');value=raw[0].reduce<number>((sum,v)=>sum+Number(v),0);break;
                                case 'concat':value=raw.map(String).join('');break;case 'upper':value=String(raw[0]).toUpperCase();break;case 'lower':value=String(raw[0]).toLowerCase();break;
                                case 'replace':value=String(raw[0]).split(String(raw[1])).join(String(raw[2]));break;case 'split':value=String(raw[0]).split(String(raw[1]));break;
                                case 'join':if(!Array.isArray(raw[0]))throw new Error('Array required');value=raw[0].join(String(raw[1]));break;
                                case 'url':value=new URL(String(raw[0]),String(raw[1])).href;break;case 'url-query':value=new URL(String(raw[0])).searchParams.get(String(raw[1]))??'';break;
                                case 'encode':value=encodeURIComponent(String(raw[0]));break;case 'decode':value=decodeURIComponent(String(raw[0]));break;
                                case 'add':value=values.reduce((x,y)=>x+y);break;
                                case 'subtract':value=values.reduce((x,y)=>x-y);break;
                                case 'multiply':value=values.reduce((x,y)=>x*y);break;
                                case 'divide':value=values.reduce((x,y)=>{if(y===0)throw new Error('Division by zero');return x/y;});break;
                                case 'modulo':value=values.reduce((x,y)=>{if(y===0)throw new Error('Modulo by zero');return x%y;});break;
                                case 'power':value=values.reduce((x,y)=>Math.pow(x,y));break;
                                case 'root':value=values.reduce((x,y)=>{if(y===0)throw new Error('Root degree cannot be zero');return x<0&&Number.isInteger(y)&&Math.abs(y%2)===1?-Math.pow(-x,1/y):Math.pow(x,1/y);});break;
                                case 'log':if(a<=0||b<=0||b===1)throw new Error('Logarithm domain / base');value=Math.log(a)/Math.log(b);for(const base of values.slice(2)){if(base<=0||base===1||value<=0)throw new Error('Logarithm domain / base');value=Math.log(value)/Math.log(base);}break;
                                case 'exp':value=Math.pow(b,a);for(const base of values.slice(2))value=Math.pow(base,value);break;
                                default:throw new Error('No numeric operation declared');
                            }
                        }
                        if(typeof value==='number'&&!Number.isFinite(value))throw new Error('Non-finite result');memo.set(key,value);return value;
                    }finally{visiting.delete(key);}
                };
                return {read};
            };
            const bindings=r.bindings?Object.fromEntries(Object.entries(r.bindings).map(([k,v])=>[k,()=>v])):null;
            const run=engine({nodes:this._nodes,wires:this._wires},bindings,0);
            for(const node of this._nodes.filter(n=>n.schema.operation&&(!targetId||n.id===targetId))){
                const ports=node.schema.outputs.length?node.schema.outputs.map(p=>p.id):[''];
                for(const port of ports)try{const value=await run.read(node.id,port);if(signal?.aborted)throw signal.reason;let out=r.outputs.get(node.id);if(!out){out=new Map();r.outputs.set(node.id,out);}out.set(port,value);if(port===ports[0])r.values.set(node.id,value);}catch(error){if(signal?.aborted)throw error;r.errors.set(node.id,error instanceof Error?error.message:String(error));break;}
            }
            for(const w of this._wires)if(w.status!=='connected-error'&&(r.errors.has(w.srcNodeId)||r.errors.has(w.dstNodeId)))w.status='connected-warn';
            if(targetId){const error=r.errors.get(targetId);this.Evaluate();if(error){r.errors.set(targetId,error);this.Refresh();}return new Map(r.values);}
            this.Refresh();this.dispatchEvent(new CustomEvent('arianna:workflow-result',{bubbles:true,composed:true,detail:{values:new Map(r.values),outputs:this.Outputs,errors:new Map(r.errors)}}));return new Map(r.values);
        }
        private AIState():AIState {let state=aiStates.get(this);if(!state){state={owner:this,keys:new Map(),cache:new Map(),pending:new Map(),transport:null};aiStates.set(this,state);}return state;}
        /** Credentials are deliberately absent from nodes, JSON exports and clipboard payloads. */
        public SetAPIKey(id:string,key:string):this {const state=this.AIState();state.pending.get(id)?.abort();key=String(key).trim();if(key)state.keys.set(id,key);else state.keys.delete(id);state.cache.delete(id);return this;}
        public SetAITransport(transport:AITransport|null):this {this.AIState().transport=transport;this.AIState().cache.clear();return this;}
        private AIConfig(node:Interfaces.NodeInstance,prompt:string):AIRequest {
            const p=node.params??{};return{provider:String(p.provider??node.type.replace(/^ai-/,'')) as AIProvider,model:String(p.model??'').trim(),prompt,instructions:String(p.instructions??''),maxTokens:Number(p.maxTokens??1024),endpoint:String(p.endpoint??'').trim()||undefined};
        }
        private AIValue(node:Interfaces.NodeInstance,prompt:string,port:string):Types.Value {
            const config=this.AIConfig(node,prompt),cached=this.AIState().cache.get(node.id);if(!cached||cached.signature!==JSON.stringify(config))throw new Error('AI response pending: select this module and click Test, or press Play');
            return port==='response'?cached.value.response:cached.value.text;
        }
        private async RequestAI(node:Interfaces.NodeInstance,prompt:string,signal?:AbortSignal,force=false):Promise<AIResponse> {
            const state=this.AIState(),request=this.AIConfig(node,prompt),signature=JSON.stringify(request),cached=state.cache.get(node.id);if(!force&&cached?.signature===signature)return cached.value;
            if(signal?.aborted)throw signal.reason??new DOMException('Stopped','AbortError');
            const apiKey=state.keys.get(node.id)??'';if(!apiKey&&!state.transport&&!request.endpoint)throw new Error('Enter your API key in the Inspector');
            const contract=BuildAIRequest(request,apiKey),control=new AbortController();state.pending.get(node.id)?.abort();state.pending.set(node.id,control);
            const abort=()=>control.abort(signal?.reason);signal?.addEventListener('abort',abort,{once:true});const timeout=Number(node.params?.timeout??60);if(!Number.isFinite(timeout)||timeout<1||timeout>300){state.pending.delete(node.id);signal?.removeEventListener('abort',abort);throw new Error('Timeout must be between 1 and 300 seconds');}
            const timer=setTimeout(()=>control.abort(new DOMException('AI request timed out','TimeoutError')),timeout*1000);
            this.dispatchEvent(new CustomEvent('arianna:workflow-ai-state',{bubbles:true,composed:true,detail:{nodeId:node.id,state:'running'}}));
            try {
                let value:AIResponse;
                if(state.transport)value=await Abortable(state.transport(request,{apiKey,signal:control.signal,nodeId:node.id}),control.signal);
                else {
                    let response:Response;try{response=await fetch(contract.url,{method:'POST',headers:contract.headers,body:JSON.stringify(contract.body),signal:control.signal,credentials:'omit',redirect:'error'});}catch(error){if(control.signal.aborted)throw control.signal.reason;throw new Error('AI connection failed. Check network/CORS or configure a same-origin proxy endpoint.');}
                    let text='';const reader=response.body?.getReader();if(reader){const decoder=new TextDecoder();let bytes=0;try{while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>8388608)throw new Error('AI response exceeds 8 MiB');text+=decoder.decode(part.value,{stream:true});}text+=decoder.decode();}finally{await reader.cancel();reader.releaseLock();}}else text=await response.text();
                    if(text.length>8388608)throw new Error('AI response exceeds 8 MiB');let data:any;try{data=JSON.parse(text);}catch{throw new Error('AI endpoint returned non-JSON data (HTTP '+response.status+')');}
                    if(!response.ok){let message=String(data.error?.message??data.message??response.statusText).slice(0,600);if(apiKey)message=message.split(apiKey).join('[redacted]');throw new Error('AI HTTP '+response.status+': '+message);}
                    value=ParseAIResponse(request.provider,request.model,data);
                }
                if(control.signal.aborted)throw control.signal.reason;
                if(typeof value?.text!=='string')throw new Error('AI transport must return text and response');
                state.cache.set(node.id,{signature,value});this.dispatchEvent(new CustomEvent('arianna:workflow-ai-state',{bubbles:true,composed:true,detail:{nodeId:node.id,state:'complete',text:value.text}}));return value;
            }catch(error){this.dispatchEvent(new CustomEvent('arianna:workflow-ai-state',{bubbles:true,composed:true,detail:{nodeId:node.id,state:control.signal.aborted?'cancelled':'error'}}));throw error;}
            finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);if(state.pending.get(node.id)===control)state.pending.delete(node.id);}
        }
        /** Test is a real provider request. A connected prompt takes precedence over the Inspector fallback. */
        public async TestAI(id:string):Promise<AIResponse> {
            const node=this.nodes.find(n=>n.id===id&&n.schema.operation==='ai');if(!node)throw new Error('Unknown AI module');
            // Evaluate upstream AI dependencies too, but refresh only this module's response.
            this.AIState().cache.delete(id);await this.EvaluateAsync(undefined,id);
            const value=this.AIState().cache.get(id)?.value;if(!value)throw new Error(this.runtime().errors.get(id)??'AI test did not complete');return value;
        }
        public CancelAI(id?:string):this {const state=this.AIState();for(const [key,controller]of state.pending)if(id===undefined||key===id)controller.abort(new DOMException('AI request cancelled','AbortError'));return this;}
        private ResultView(node:Interfaces.NodeInstance,value:Types.Value|undefined):HTMLElement {
            const root=document.createElement('div');root.style.cssText='max-height:160px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.5 system-ui';const format=String(node.params?.format??'text');
            if(value===undefined){root.textContent='—';return root;}
            if(['image','video','audio'].includes(format)){
                const descriptor=value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,Types.Value>:null;let url=String(descriptor?.url??descriptor?.src??value);
                try{const parsed=new URL(url,typeof location==='undefined'?'http://localhost':location.href);if(!['https:','http:','blob:'].includes(parsed.protocol)&&!(parsed.protocol==='data:'&&url.startsWith('data:'+format+'/')))throw new Error();}catch{root.textContent='Connect a '+format+' URL or {url, mime} descriptor';return root;}
                if(format==='image'){const image=document.createElement('img');image.src=url;image.alt='Workflow result';image.loading='lazy';image.style.cssText='max-width:100%;max-height:150px;object-fit:contain';root.append(image);}
                else {const media=document.createElement(format) as HTMLMediaElement;media.src=url;media.controls=true;media.preload='none';media.style.cssText='width:100%;max-height:150px';root.append(media);}return root;
            }
            if(format==='spreadsheet'){try{const table=document.createElement('table');for(const row of Rows(value).slice(0,30)){const tr=document.createElement('tr');for(const cell of row.slice(0,12)){const td=document.createElement('td');td.textContent=typeof cell==='object'?JSON.stringify(cell):String(cell??'');td.style.cssText='padding:3px 6px;border:1px solid #89929a66';tr.append(td);}table.append(tr);}root.append(table);}catch(error){root.textContent=error instanceof Error?error.message:String(error);}return root;}
            root.textContent=TextValue(value).slice(0,16000);return root;
        }
        public async DownloadResult(id:string):Promise<void> {
            const node=this.nodes.find(n=>n.id===id&&n.schema.operation==='result');if(!node)throw new Error('Select a Result module');const value=this.runtime().values.get(id);if(value===undefined)throw new Error('Connect a value and press Play first');
            const format=String(node.params?.format??'text');if(['image','video','audio'].includes(format)){
                const descriptor=value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,Types.Value>:null,url=String(descriptor?.url??descriptor?.src??value);const parsed=new URL(url,typeof location==='undefined'?'http://localhost':location.href);if(!['https:','http:','blob:'].includes(parsed.protocol)&&!(parsed.protocol==='data:'&&url.startsWith('data:'+format+'/')))throw new Error('Unsupported media URL');
                const response=await fetch(url,{signal:this.runtime().controller?.signal});if(!response.ok)throw new Error('Media HTTP '+response.status);const blob=await response.blob();const mime=blob.type.split(';')[0],extensions:Record<string,string>={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/svg+xml':'svg','video/mp4':'mp4','video/webm':'webm','audio/wav':'wav','audio/mpeg':'mp3','audio/ogg':'ogg','audio/mp4':'m4a'};this.SaveBlob(blob,String(node.params?.filename??'result')+'.'+(extensions[mime]??'bin'));return;
            }
            const file=ResultDocument(format,value);this.SaveBlob(new Blob([Uint8Array.from(file.bytes).buffer],{type:file.mime}),String(node.params?.filename??'result').replace(/\.[a-z0-9]+$/i,'')+'.'+file.extension);
        }
        private SaveBlob(blob:Blob,filename:string):void {
            const r=this.runtime(),url=URL.createObjectURL(blob);r.urls.add(url);const link=document.createElement('a');link.href=url;link.download=filename.replace(/[\\/<>:"|?*\u0000-\u001f]/g,'_');link.hidden=true;this.ownerDocument.body.append(link);link.click();link.remove();const timer=setTimeout(()=>{URL.revokeObjectURL(url);r.urls.delete(url);r.timers.delete(timer);},1500);r.timers.add(timer);
        }
        private FillAIInspector(body:HTMLElement,node:Interfaces.NodeInstance):void {
            const row=document.createElement('label');row.className='NodeEditor-Param';row.textContent='API key (session only)';const key=document.createElement('input');key.className='NodeEditor-Input';key.type='password';key.autocomplete='off';key.spellcheck=false;key.value=this.AIState().keys.get(node.id)??'';key.setAttribute('aria-label','API key');key.oninput=()=>this.SetAPIKey(node.id,key.value);row.append(key);body.append(row);
            const hint=document.createElement('p');hint.className='NodeEditor-Info';hint.textContent='Enter a model ID from your provider account. Test sends a real request. Key is excluded from JSON. Use a proxy endpoint if required by CORS.';body.append(hint);
            const actions=document.createElement('div');actions.style.cssText='display:flex;gap:6px;flex-wrap:wrap';const test=document.createElement('button'),cancel=document.createElement('button');for(const b of [test,cancel]){b.type='button';b.className='NodeEditor-Button';}test.textContent='Test';cancel.textContent='Cancel';cancel.onclick=()=>this.CancelAI(node.id);actions.append(test,cancel);body.append(actions);
            const status=document.createElement('output');status.className='NodeEditor-Info';status.style.whiteSpace='pre-wrap';body.append(status);
            const cached=this.AIState().cache.get(node.id)?.value;if(cached)status.textContent=cached.text.slice(0,12000);
            const details=document.createElement('details'),summary=document.createElement('summary'),pre=document.createElement('pre');summary.textContent='Response JSON';pre.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;max-height:240px;overflow:auto';pre.textContent=cached?TextValue(cached.response).slice(0,24000):'Run Test to inspect the provider response.';details.append(summary,pre);body.append(details);
            test.onclick=async()=>{test.disabled=true;status.textContent='Testing…';try{const value=await this.TestAI(node.id);status.textContent='Connected · '+value.model+'\n'+value.text.slice(0,12000);pre.textContent=TextValue(value.response).slice(0,24000);}catch(error){status.textContent=error instanceof Error?error.message:String(error);}finally{test.disabled=false;}};
        }

        public get Outputs():ReadonlyMap<string,ReadonlyMap<string,Types.Value>>{return new Map([...this.runtime().outputs].map(([id,ports])=>[id,new Map(ports)]));}
        private CleanGraph(graph:Interfaces.Graph):Interfaces.Graph {const copy=structuredClone(graph);const visit=(nodes:Interfaces.NodeInstance[])=>{for(const node of nodes){if(node.params)for(const key of ['apiKey','api_key','authorization','secret'])delete node.params[key];if(node.graph)visit(node.graph.nodes);}};visit(copy.nodes);return copy;}
        public export(){this.EnsureState();return {...this.CleanGraph({nodes:this._nodes,wires:this._wires}),state:this._state};}
        public ExportJSON(filename='workflow.json'):this {
            const data=this.export(),event=new CustomEvent('arianna:export',{bubbles:true,composed:true,cancelable:true,detail:data});if(!this.dispatchEvent(event))return this;
            const r=this.runtime(),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}));r.urls.add(url);
            const link=document.createElement('a');link.href=url;link.download=filename;link.style.display='none';document.body.appendChild(link);link.click();link.remove();
            const timer=setTimeout(()=>{URL.revokeObjectURL(url);r.urls.delete(url);r.timers.delete(timer);},1500);r.timers.add(timer);return this;
        }
        public get Selection():SelectionRectangle|null{return this.runtime().selection;}
        public get SelectedNodes():readonly Interfaces.NodeInstance[]{return this.nodes.filter(n=>this.runtime().selectedNodes.has(n.id));}
        public get SelectedWires():readonly Interfaces.WireInstance[]{return this.wires.filter(w=>this.runtime().selectedWires.has(w.id));}
        private PaintSelection():void {
            const r=this.runtime();for(const el of this.OwnElements<HTMLElement>('.NodeEditor-Node'))el.dataset.selected=String(r.selectedNodes.has(el.dataset.nodeId!));
            for(const selector of ['.NodeEditor-Wire','.NodeEditor-WireHit'])for(const el of this.OwnElements<HTMLElement>(selector)){const selected=r.selectedWires.has(el.dataset.wireId!);el.dataset.selected=String(selected);if(selector==='.NodeEditor-WireHit')el.setAttribute('aria-pressed',String(selected));}
        }
        private SyncSelection():void {
            const r=this.runtime();this.PaintSelection();if(!r.selection||r.syncingSelection)return;r.syncingSelection=true;
            try{const elements=[...this.OwnElements<HTMLElement>('.NodeEditor-Node')].filter(e=>r.selectedNodes.has(e.dataset.nodeId!));elements.push(...[...this.OwnElements<HTMLElement>('.NodeEditor-WireHit')].filter(e=>r.selectedWires.has(e.dataset.wireId!)));r.selection.select(elements);}finally{r.syncingSelection=false;}
        }
        public SelectNodes(ids:Iterable<string>,operation:'replace'|'add'|'subtract'|'toggle'='replace'):this {
            const r=this.runtime();r.closeMenu?.();if(operation==='replace'){r.selectedNodes.clear();r.selectedWires.clear();r.selectedWire=null;}
            for(const id of ids)if(this.nodes.some(n=>n.id===id)){if(operation==='subtract'||operation==='toggle'&&r.selectedNodes.has(id))r.selectedNodes.delete(id);else r.selectedNodes.add(id);}
            this._selected=[...r.selectedNodes][0]??null;this.SyncSelection();this.FillInspector();return this;
        }
        public ClearSelection():this {const r=this.runtime();r.closeMenu?.();r.selectedNodes.clear();r.selectedWires.clear();r.selectedWire=null;this._selected=null;this.SyncSelection();this.FillInspector();return this;}
        public DeleteSelection():this {
            const r=this.runtime(),ids=new Set(r.selectedNodes),wireIds=new Set(r.selectedWires);if(r.selectedWire)wireIds.add(r.selectedWire);
            for(const id of ids)r.modules.get(id)?.close(false);
            this._nodes=this.nodes.filter(n=>!ids.has(n.id));this._wires=this.wires.filter(w=>!wireIds.has(w.id)&&!ids.has(w.srcNodeId)&&!ids.has(w.dstNodeId));this.ClearSelection();this.Changed(true);if(this.isConnected)this.focus({preventScroll:true});return this;
        }
        /** Shared in-app clipboard works on file:// and without browser clipboard permission. */
        public Copy():Interfaces.Clipboard|null {
            const r=this.runtime(),nodes=this.SelectedNodes,ids=new Set(nodes.map(n=>n.id));
            const wires=this.wires.filter(w=>ids.has(w.srcNodeId)&&ids.has(w.dstNodeId)||!nodes.length&&r.selectedWires.has(w.id));
            if(!nodes.length&&!wires.length)return null;
            clipboard={format:'arianna-workflow-selection',version:1,...this.CleanGraph({nodes:[...nodes],wires})};r.pasteCount=0;
            this.dispatchEvent(new CustomEvent('arianna:workflow-copy',{bubbles:true,composed:true,detail:structuredClone(clipboard)}));return structuredClone(clipboard);
        }
        public Cut():Interfaces.Clipboard|null {const data=this.Copy();if(data)this.DeleteSelection();return data;}
        public Paste(data:Interfaces.Clipboard|null=clipboard,position?:{x:number;y:number}):Interfaces.NodeInstance[] {
            if(!data||data.format!=='arianna-workflow-selection'||data.version!==1)return [];
            const r=this.runtime(),copy=structuredClone(data),mapping=new Map<string,string>();
            const offset=24*(++r.pasteCount),left=copy.nodes.length?Math.min(...copy.nodes.map(n=>n.x)):0,top=copy.nodes.length?Math.min(...copy.nodes.map(n=>n.y)):0;
            for(const node of copy.nodes){const old=node.id;node.id=Unique('node');mapping.set(old,node.id);node.x+=position?position.x-left:offset;node.y+=position?position.y-top:offset;
                if(node.schema.operation==='input'||node.schema.operation==='output'){let id=String(node.params?.portId??(node.schema.operation==='input'?'in':'out')),base=id,i=2;while([...this.nodes,...copy.nodes.filter(n=>n!==node)].some(n=>n.schema.operation===node.schema.operation&&n.params?.portId===id))id=base+i++;(node.params??={}).portId=id;}}
            this._nodes.push(...copy.nodes);
            for(const wire of copy.wires){const src=mapping.get(wire.srcNodeId)??(!copy.nodes.length?wire.srcNodeId:''),dst=mapping.get(wire.dstNodeId)??(!copy.nodes.length?wire.dstNodeId:'');if(!src||!dst||!this.nodes.some(n=>n.id===src)||!this.nodes.some(n=>n.id===dst))continue;
                this._wires=this._wires.filter(w=>w.dstNodeId!==dst||w.dstPortId!==wire.dstPortId);this._wires.push({...wire,id:Unique('wire'),srcNodeId:src,dstNodeId:dst});}
            this.SelectNodes(copy.nodes.map(n=>n.id));this.Changed(true);if(this.isConnected)this.focus({preventScroll:true});return copy.nodes;
        }
        /** Bind internal Input/Output nodes to stable external port IDs. */
        public SetModuleGraph(id:string,graph:Interfaces.Graph):this {
            const node=this.nodes.find(n=>n.id===id&&n.schema.operation==='module');if(!node)throw new Error('Unknown custom module '+id);
            const copy=structuredClone(graph),ports=(op:'input'|'output'):Interfaces.PortSpec[]=>{
                const result=copy.nodes.filter(n=>n.schema.operation===op).map(n=>{
                    const portId=String(n.params?.portId??(op==='input'?'in':'out')).trim();if(!portId)throw new Error('An IO port needs an ID');
                    const incoming=copy.wires.find(w=>w.dstNodeId===n.id&&w.dstPortId===n.schema.inputs[0]?.id),source=incoming&&copy.nodes.find(n=>n.id===incoming.srcNodeId)?.schema.outputs.find(p=>p.id===incoming.srcPortId);
                    return {id:portId,label:portId,type:op==='output'&&source?source.type:String(n.params?.portType??'number')};
                });if(new Set(result.map(p=>p.id)).size!==result.length)throw new Error('Duplicate '+op+' port IDs');return result;
            };
            const inputs=ports('input'),outputs=ports('output'),portsChanged=JSON.stringify([node.schema.inputs,node.schema.outputs])!==JSON.stringify([inputs,outputs]);node.graph=copy;node.schema.inputs=inputs;node.schema.outputs=outputs;
            this._wires=this.wires.filter(w=>w.srcNodeId!==id||outputs.some(p=>p.id===w.srcPortId)).filter(w=>w.dstNodeId!==id||inputs.some(p=>p.id===w.dstPortId));
            this.Changed(portsChanged);if(!portsChanged)this.FillInspector();return this;
        }
        public OpenModule(id:string):NodeEditor {
            const node=this.nodes.find(n=>n.id===id&&n.schema.operation==='module');if(!node)throw new Error('Unknown custom module '+id);
            const r=this.runtime(),existing=r.modules.get(id);if(existing){existing.restore();existing.editor.focus({preventScroll:true});return existing.editor;}
            this.Evaluate();
            const doc=this.ownerDocument,theme=this.getAttribute('theme')==='light'?'light':'dark',panel=doc.createElement('section');
            panel.style.cssText='display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto;width:100%;height:100%;gap:0;min-width:0;min-height:0;box-sizing:border-box;flex:1 1 0';
            const error=doc.createElement('span');error.style.color='#e85d54';error.style.font='11px system-ui';
            const child=new NodeEditor();child.setAttribute('theme',theme);child.classList.add('NodeEditor');child.style.setProperty('height','100%','important');child.style.setProperty('min-height','0','important');child.style.setProperty('width','100%','important');
            child.schemas=structuredClone(this.schemas);const graph=structuredClone(node.graph??EmptyGraph());child.nodes=graph.nodes;child.wires=graph.wires;const bound:Record<string,Types.Value>=Object.create(null);for(const input of graph.nodes.filter(n=>n.schema.operation==='input')){const pid=String(input.params?.portId??'in'),wire=this.wires.find(w=>w.dstNodeId===id&&w.dstPortId===pid);bound[pid]=(wire?r.outputs.get(wire.srcNodeId)?.get(wire.srcPortId):undefined)??this.ParseValue(input.params?.value??0,String(input.params?.portType??'number'));}if(Object.keys(bound).length)child.runtime().bindings=bound;panel.append(child,error);
            const host=this.OwnElement<HTMLElement>('.NodeEditor-Body');if(!host)throw new Error('Mount Workflow before opening a module');
            // OLD: direct Workflow instance in a floating Dockable panel.
            // Keep the current Workflow shell; no Window template/adoption layer.
            host.append(panel);
            const dock=new Dockable();dock.attach(panel,{container:host,title:node.schema.name,position:'float',theme,width:Math.max(360,Math.min(1000,host.clientWidth-40)),height:Math.max(300,Math.min(720,host.clientHeight-40)),respectCanvas:false,onMinimize:()=>{try{this.SetModuleGraph(id,{nodes:child.nodes,wires:child.wires});this.Evaluate();error.textContent='';}catch(e){error.textContent=e instanceof Error?e.message:String(e);}}});
            const win=dock.Wrapper;if(!win){dock.destroy();panel.remove();throw new Error('[Workflow] Empty floating panel was not created');}
            win.classList.add('NodeEditor-ModuleWindow');win.style.left='20px';win.style.top='20px';win.style.zIndex='100000';
            // The single visible header is rendered by Workflow(6), including
            // its padding/icons. Dockable retains its Mover and Resizer.
            const dockHeader=win.querySelector<HTMLElement>(':scope > .Dockable-Handle');if(dockHeader)dockHeader.style.display='none';
            const controller=new AbortController(),bar=dock.Bar??ToolBar.For(host,{theme,position:r.barPosition});r.bar=bar;
            const restore=()=>{dock.restore();win.style.zIndex='100000';};
            let closed=false;const close=(commit=true)=>{
                if(closed)return;
                if(commit){try{for(const item of [...child.runtime().modules.values()])item.close(true);if(child.runtime().modules.size)throw new Error('Resolve the open nested module before closing.');const data=child.export();this.SetModuleGraph(id,{nodes:data.nodes,wires:data.wires});this.Evaluate();}catch(e){error.textContent=e instanceof Error?e.message:String(e);return;}}
                closed=true;moduleHosts.delete(child);ModuleWindowEditors.delete(win);r.modules.delete(id);controller.abort();child.onUnmount();dock.destroy();panel.remove();if(this.isConnected)this.focus({preventScroll:true});
            };
            moduleHosts.set(child,{minimize:()=>dock.minimize(),toggleMaximize:()=>dock.maximize(),close:()=>close(true)});
            r.modules.set(id,{editor:child,window:win,restore,close});ModuleWindowEditors.set(win,child); // Child owns its complete catalog, viewport and drop target.
            child.addEventListener('arianna:workflow-change',event=>{
                if(event.target!==child||closed)return;event.stopPropagation();
                try{this.SetModuleGraph(id,{nodes:child.nodes,wires:child.wires});error.textContent='';}
                catch(cause){error.textContent=cause instanceof Error?cause.message:String(cause);}
            },{signal:controller.signal});
            aiStates.set(child,this.AIState());child.onConnected();child.Evaluate();child.Fit();return child;
        }
        public CloseModule(id:string,save=true):this{this.runtime().modules.get(id)?.close(save);return this;}
        private MathLabel(schema:Interfaces.NodeSchema,base?:number):Element {
            const ns='http://www.w3.org/1998/Math/MathML',make=(tag:string,text?:string)=>{const el=document.createElementNS(ns,tag);if(text!==undefined)el.textContent=text;return el;};
            const math=make('math');math.setAttribute('aria-label',schema.name);const op=schema.operation;
            const symbols:Record<string,string>={add:'+',subtract:'−',multiply:'×',divide:'÷',modulo:'mod',number:'123',result:'=',module:'□',input:'→',output:'←'};
            if(op==='power'||op==='exp'){const sup=make('msup');sup.append(make('mi',op==='power'?'x':String(base??Math.E)),make('mi',op==='power'?'y':'x'));math.appendChild(sup);}
            else if(op==='root'){const root=make('mroot');root.append(make('mi','x'),make('mi','y'));math.appendChild(root);}
            else if(op==='log'){const row=make('mrow'),sub=make('msub');sub.append(make('mi','log'),make('mn',String(base??10)));row.append(sub,make('mi','x'));math.appendChild(row);}
            else math.appendChild(make(op==='number'?'mn':'mo',symbols[op??'']??schema.icon??'◆'));
            return math;
        }
        private ValueLabel(value:Types.Value|undefined):Element {
            const math=document.createElementNS('http://www.w3.org/1998/Math/MathML','math'),mn=document.createElementNS(math.namespaceURI,'mn');mn.textContent=value===undefined?'—':typeof value==='number'?String(Number(value.toPrecision(12))):value&&typeof value==='object'?JSON.stringify(value):String(value);math.appendChild(mn);return math;
        }
        private CreatePalette(workspace: HTMLElement): HTMLElement
        {
            const palette = document.createElement('aside');
            palette.className = 'NodeEditor-Palette';

            const header = document.createElement('div');
            header.className = 'NodeEditor-PaletteHeader';

            const title = document.createElement('span');
            title.className = 'NodeEditor-PaletteTitle';
            title.textContent = 'Modules';

            const count = document.createElement('span');
            count.className = 'NodeEditor-PaletteCount';
            count.textContent = String(this._schemas.length);

            header.append(title, count);

            const searchWrap = document.createElement('div');
            searchWrap.className = 'NodeEditor-PaletteSearchWrap';

            const search = document.createElement('input');
            search.className = 'NodeEditor-PaletteSearch';
            search.type = 'search';
            search.placeholder = 'Filter modules…';
            search.autocomplete = 'off';
            search.spellcheck = false;

            searchWrap.appendChild(search);

            const body = document.createElement('div');
            body.className = 'NodeEditor-PaletteBody';

            const categories = new Map<string, Interfaces.NodeSchema[]>();

            for(const schema of this._schemas)
            {
                const category = schema.operation==='module'?'':schema.category || 'Other';
                const list = categories.get(category) ?? [];
                list.push(schema);
                categories.set(category, list);
            }

            for(const [categoryName, schemas] of [...categories].sort(([a],[b])=>{const order=['','Inputs','Outputs','Results','AI'];const rank=(c:string)=>{const i=order.indexOf(c);return i<0?order.length:i;};return rank(a)-rank(b);}))
            {
                const category = document.createElement('section');
                category.className = 'NodeEditor-PaletteCategory';
                category.dataset.category = categoryName.toLowerCase();

                const categoryHeader = document.createElement('button');
                categoryHeader.type='button';
                categoryHeader.className = 'NodeEditor-PaletteCategoryHeader';

                const categoryLabel = document.createElement('span');
                categoryLabel.textContent = (this.runtime().collapsed.has(categoryName)?'▸ ':'▾ ')+categoryName;

                const categoryCount = document.createElement('span');
                categoryCount.className = 'NodeEditor-PaletteCategoryCount';
                categoryCount.textContent = String(schemas.length);

                categoryHeader.append(categoryLabel, categoryCount);
                if(categoryName)category.appendChild(categoryHeader);
                const list=document.createElement('div');list.hidden=!!categoryName&&this.runtime().collapsed.has(categoryName);
                categoryHeader.setAttribute('aria-expanded',String(!list.hidden));
                categoryHeader.onclick=()=>{list.hidden=!list.hidden;categoryLabel.textContent=(list.hidden?'▸ ':'▾ ')+categoryName;categoryHeader.setAttribute('aria-expanded',String(!list.hidden));if(list.hidden)this.runtime().collapsed.add(categoryName);else this.runtime().collapsed.delete(categoryName);};
                category.appendChild(list);

                for(const schema of schemas)
                {
                    const module = document.createElement('div');
                    module.className = 'NodeEditor-Module';
                    module.draggable = true;
                    this.BindModuleDrag(module,schema.type);
                    module.tabIndex = 0;
                    module.setAttribute('role', 'button');
                    module.dataset.schemaType = schema.type;
                    module.dataset.search = `${schema.name} ${schema.category} ${schema.description ?? ''}`.toLowerCase();
                    module.style.setProperty('--module-color', schema.color || '#e40c88');
                    module.title = `Drag ${schema.name} onto the workflow`;

                    const icon = document.createElement('span');
                    icon.className = 'NodeEditor-ModuleIcon';
                    icon.appendChild(this.MathLabel(schema));

                    const info = document.createElement('div');

                    const name = document.createElement('div');
                    name.className = 'NodeEditor-ModuleName';
                    name.textContent = schema.name;

                    const description = document.createElement('div');
                    description.className = 'NodeEditor-ModuleDescription';
                    description.textContent = schema.description || schema.category;

                    info.append(name, description);
                    module.append(icon, info);

                    module.addEventListener('dragstart', (event: DragEvent) =>
                    {
                        if(!event.dataTransfer) return;
                        event.stopPropagation();event.dataTransfer.effectAllowed = 'copy';
                        event.dataTransfer.setData('application/x-arianna-workflow-node', schema.type);
                        event.dataTransfer.setData('text/plain', schema.type);
                        module.dataset.dragging = 'true';
                    });

                    module.addEventListener('dragend', () =>
                    {
                        delete module.dataset.dragging;
                        delete workspace.dataset.dragOver;
                    });

                    module.addEventListener('dblclick', () =>
                    {
                        const rect = workspace.getBoundingClientRect();
                        const p=this.LocalPoint(rect.left+rect.width/2,rect.top+rect.height/2);
                        const x=p.x-87,y=p.y-40;
                        this.addNode(schema.type, x, y);
                    });

                    module.addEventListener('keydown', (event: KeyboardEvent) =>
                    {
                        if(event.key !== 'Enter' && event.key !== ' ') return;
                        event.preventDefault();
                        const rect = workspace.getBoundingClientRect();
                        this.addNode(
                            schema.type,
                            this.LocalPoint(rect.left+rect.width/2,rect.top+rect.height/2).x-87,
                            this.LocalPoint(rect.left+rect.width/2,rect.top+rect.height/2).y-40
                        );
                    });

                    list.appendChild(module);
                }

                body.appendChild(category);
            }

            const empty = document.createElement('div');
            empty.className = 'NodeEditor-PaletteEmpty';
            empty.textContent = 'No modules match.';
            empty.hidden = true;
            body.appendChild(empty);

            search.addEventListener('input', () =>
            {
                const query = search.value.trim().toLowerCase();
                let totalVisible = 0;

                body.querySelectorAll<HTMLElement>('.NodeEditor-PaletteCategory').forEach(category =>
                {
                    let categoryVisible = 0;

                    category.querySelectorAll<HTMLElement>('.NodeEditor-Module').forEach(module =>
                    {
                        const visible = !query || (module.dataset.search ?? '').includes(query);
                        module.hidden = !visible;
                        if(visible) categoryVisible++;
                    });

                    category.hidden = categoryVisible === 0;
                    totalVisible += categoryVisible;

                    const categoryCount = category.querySelector<HTMLElement>('.NodeEditor-PaletteCategoryCount');
                    if(categoryCount) categoryCount.textContent = String(categoryVisible);
                });

                count.textContent = String(totalVisible);
                empty.hidden = totalVisible !== 0;
            });

            palette.append(header, searchWrap, body);
            return palette;
        }


        /** Measure the HTML world plane, avoiding SVG screen-CTM/CSS-transform differences. */
        private WorldBasis():{x:number;y:number;a:number;b:number;c:number;d:number;det:number}|null {
            const probes=this.runtime().probes;if(probes.length!==3)return null;
            const [o,x,y]=probes.map(p=>p.getBoundingClientRect());
            const a=(x.left-o.left)/100,b=(x.top-o.top)/100,c=(y.left-o.left)/100,d=(y.top-o.top)/100,det=a*d-b*c;
            return Number.isFinite(det)&&Math.abs(det)>1e-10?{x:o.left,y:o.top,a,b,c,d,det}:null;
        }
        private LocalPoint(x:number,y:number,basis?:{x:number;y:number;a:number;b:number;c:number;d:number;det:number}|null):{x:number;y:number} {
            if(basis===undefined)basis=this.WorldBasis();
            if(basis){const dx=x-basis.x,dy=y-basis.y;return{x:(basis.d*dx-basis.c*dy)/basis.det,y:(basis.a*dy-basis.b*dx)/basis.det};}
            const canvas=this.runtime().canvas;if(!canvas)return{x,y};
            const rect=canvas.world.getBoundingClientRect(),zoom=canvas.getViewport().zoom||1;
            return{x:(x-rect.left)/zoom,y:(y-rect.top)/zoom};
        }
        private RefreshViewportWires():void {
            const r=this.runtime();
            const refresh=()=>{if(r.pending&&r.pointerScreen)this.PreviewConnection(r.pointerScreen.x,r.pointerScreen.y);else this.RenderWires();};
            refresh();
        }
        private ConnectionStatus(src:string,srcPort:string,dst:string,dstPort:string,ignoreId?:string):Types.WireStatus {
            const source=this.nodes.find(n=>n.id===src)?.schema.outputs.find(p=>p.id===srcPort),target=this.nodes.find(n=>n.id===dst)?.schema.inputs.find(p=>p.id===dstPort);
            if(!source||!target||src===dst)return 'connected-error';
            const seen=new Set<string>(),stack=[dst];while(stack.length){const id=stack.pop()!;if(id===src)return 'connected-error';if(seen.has(id))continue;seen.add(id);for(const w of this.wires)if(w.id!==ignoreId&&w.srcNodeId===id&&!(w.dstNodeId===dst&&w.dstPortId===dstPort))stack.push(w.dstNodeId);}
            const type=this._typeCheck(source.type,target.type)??'connected-error';
            return type==='connected-ok'&&this.wires.some(w=>w.id!==ignoreId&&w.dstNodeId===dst&&w.dstPortId===dstPort)?'connected-warn':type;
        }
        private PreviewConnection(x:number,y:number):void {
            const r=this.runtime();r.pointerScreen={x,y};r.pointer=this.LocalPoint(x,y);r.hoverPort=r.pending?this.InputPortAt(x,y):null;this.UpdatePorts();this.RenderWires();
        }
        private InputPortAt(x:number,y:number):HTMLElement|null {
            const direct=this.ownerDocument.elementFromPoint(x,y)?.closest<HTMLElement>('.NodeEditor-Port');
            if(direct?.dataset.side==='in'&&direct.closest('.NodeEditor')===this)return direct;
            // Screen-space tolerance stays usable even at a very small zoom.
            let best:HTMLElement|null=null,distance=Infinity;
            for(const port of this.OwnElements<HTMLElement>('.NodeEditor-Port[data-side="in"]')){
                if(port.closest('.NodeEditor')!==this)continue;
                const box=port.getBoundingClientRect();if(!box.width||!box.height||x<box.left-6||x>box.right+6||y<box.top-6||y>box.bottom+6)continue;
                const d=Math.hypot(x-(box.left+box.right)/2,y-(box.top+box.bottom)/2);if(d<distance){distance=d;best=port;}
            }return best;
        }
        private DisposeView():void {
            const r=this.runtime();if(r.wireFrame!==null)cancelAnimationFrame(r.wireFrame);r.wireFrame=null;r.probes=[];r.closeMenu?.();r.controller?.abort();r.controller=null;r.pending=null;r.hoverPort=null;r.pointer=null;r.pointerScreen=null;r.selection?.detach();r.selection=null;r.resize?.disconnect();r.resize=null;
            if(r.canvas){r.viewport=r.canvas.getViewport();r.snap=r.canvas.getSnap();}
            for(const [i,d] of r.docks.entries()){r.dockPositions[i]=d.Position;const w=d.Wrapper;if(w&&d.Position==='float')r.dockRects[i]={left:w.style.left,top:w.style.top,width:w.style.width,height:w.style.height};d.destroy();}
            for(const panel of this.OwnElements<HTMLElement>('.NodeEditor-Palette,.NodeEditor-Inspector'))panel.remove();
            r.barPosition=r.bar?.Position??r.barPosition;r.bar=null;
            r.docks=[];r.grid?.detach();r.grid=null;r.canvas?.onUnmount();r.canvas=null;
        }
        private UpdateInsets():void {
            const r=this.runtime(),viewport=this.OwnElement<HTMLElement>('.NodeEditor-Viewport');if(!viewport)return;
            const barInsets=r.bar?.Insets??{top:0,bottom:0,left:0,right:0};
            // Keep Canvas controls full width. Only the drawing stage is inset by panels.
            for(const pos of ['top','bottom','left','right'] as const)if(viewport.style[pos]!==barInsets[pos]+'px')viewport.style[pos]=barInsets[pos]+'px';
            const stage=r.canvas?.querySelector<HTMLElement>('.Canvas2D-Stage');
            const stageInsets={top:0,bottom:0,left:0,right:0};
            for(const dock of r.docks){const pos=dock.Position,w=dock.Wrapper;if(!w)continue;
                if(pos!=='float'&&!dock.Minimized)stageInsets[pos]=Math.max(stageInsets[pos],pos==='left'||pos==='right'?w.offsetWidth:w.offsetHeight);
            }
            if(stage){for(const pos of ['top','bottom','left','right'] as const){const key='margin-'+pos,value=stageInsets[pos]+'px';if(stage.style.getPropertyValue(key)!==value)stage.style.setProperty(key,value);}stage.style.minWidth='0';}
            const world=r.canvas?.world,svg=r.canvas?.drawingSurface;if(world&&svg){const box=`0 0 ${Math.max(1,world.clientWidth)} ${Math.max(1,world.clientHeight)}`;if(svg.getAttribute('viewBox')!==box)svg.setAttribute('viewBox',box);}this.RefreshViewportWires();
        }
        /** Pointer drag avoids native HTML DnD restrictions in floating/nested windows. */
        private BindModuleDrag(module:HTMLElement,type:string):void {
            module.style.touchAction='none';
            module.addEventListener('dragstart',(event:DragEvent)=>{
                if(!event.dataTransfer)return;event.stopPropagation();
                event.dataTransfer.effectAllowed='copy';
                event.dataTransfer.setData('application/x-arianna-workflow-node',type);
                event.dataTransfer.setData('text/plain',type);
            },{signal:this.runtime().controller?.signal});
            module.addEventListener('pointerdown',event=>{
                if(event.button!==0)return;
                if(event.pointerType==='mouse')return;
                event.preventDefault();event.stopPropagation();
                const doc=this.ownerDocument,control=new AbortController(),start={x:event.clientX,y:event.clientY};let ghost:HTMLElement|null=null,moved=false;
                const cleanup=()=>{control.abort();ghost?.remove();delete module.dataset.dragging;};
                this.runtime().controller?.signal.addEventListener('abort',cleanup,{once:true,signal:control.signal});doc.addEventListener('keydown',key=>{if(key.key==='Escape'){key.preventDefault();cleanup();}},{capture:true,signal:control.signal});doc.defaultView?.addEventListener('blur',cleanup,{signal:control.signal});
                const destination=(x:number,y:number):NodeEditor|null=>{
                    const hit=doc.elementFromPoint(x,y);if(!hit)return null;
                    for(let element:Element|null=hit;element;element=element.parentElement){const editor=WorkspaceEditors.get(element);if(editor)return editor;}
                    const win=hit.closest<HTMLElement>('.NodeEditor-ModuleWindow');return win?ModuleWindowEditors.get(win)??null:null;
                };
                doc.addEventListener('pointermove',move=>{if(move.pointerId!==event.pointerId)return;if(!moved&&Math.hypot(move.clientX-start.x,move.clientY-start.y)<5)return;moved=true;move.preventDefault();
                    if(!ghost){ghost=doc.createElement('div');ghost.textContent=module.querySelector('.NodeEditor-ModuleName')?.textContent??type;ghost.style.cssText='position:fixed;z-index:2147483647;pointer-events:none;padding:8px 12px;border:1px solid #e40c88;border-radius:6px;background:linear-gradient(180deg,#3a3f44,#25292d);color:white;box-shadow:0 5px 18px #0008;font:600 11px system-ui';doc.body.append(ghost);module.dataset.dragging='true';}
                    ghost.style.left=(move.clientX+12)+'px';ghost.style.top=(move.clientY+12)+'px';ghost.style.borderColor=destination(move.clientX,move.clientY)?'#adff2f':'#e40c88';
                },{capture:true,signal:control.signal});
                doc.addEventListener('pointerup',up=>{if(up.pointerId!==event.pointerId)return;const editor=moved?destination(up.clientX,up.clientY):null;cleanup();if(!editor)return;up.preventDefault();up.stopPropagation();const point=editor.LocalPoint(up.clientX,up.clientY),node=editor.addNode(type,point.x-87,point.y-30);editor.SelectNodes([node.id]);},{capture:true,signal:control.signal});
                doc.addEventListener('pointercancel',cancel=>{if(cancel.pointerId===event.pointerId)cleanup();},{capture:true,signal:control.signal});
            },{signal:this.runtime().controller?.signal});
        }
        private BindWorkspaceDrop(target:HTMLElement,signal?:AbortSignal):void {
            const options={signal:signal??this.runtime().controller?.signal};
            target.addEventListener('dragover',(event:DragEvent)=>{if(event.dataTransfer){event.preventDefault();event.dataTransfer.dropEffect='copy';event.stopPropagation();}},options);
            target.addEventListener('drop',(event:DragEvent)=>{
                const type=event.dataTransfer?.getData('application/x-arianna-workflow-node')||event.dataTransfer?.getData('text/plain');
                if(!type||!this._schemas.some(schema=>schema.type===type))return;
                event.preventDefault();event.stopPropagation();
                const point=this.LocalPoint(event.clientX,event.clientY),node=this.addNode(type,point.x-87,point.y-30);
                this.SelectNodes([node.id]);
            },options);
        }

        private WirePath(points:Array<{x:number;y:number}>,radius=8):string {
            const clean=points.filter((p,i)=>!i||p.x!==points[i-1].x||p.y!==points[i-1].y);if(!clean.length)return '';let path=`M ${clean[0].x} ${clean[0].y}`;
            for(let i=1;i<clean.length-1;i++){const a=clean[i-1],b=clean[i],c=clean[i+1],before=Math.hypot(b.x-a.x,b.y-a.y),after=Math.hypot(c.x-b.x,c.y-b.y),r=Math.min(radius,before/2,after/2);if(!r||(b.x-a.x)*(c.y-b.y)===(b.y-a.y)*(c.x-b.x)){path+=` L ${b.x} ${b.y}`;continue;}path+=` L ${b.x+(a.x-b.x)*r/before} ${b.y+(a.y-b.y)*r/before} Q ${b.x} ${b.y} ${b.x+(c.x-b.x)*r/after} ${b.y+(c.y-b.y)*r/after}`;}
            const end=clean[clean.length-1];return path+` L ${end.x} ${end.y}`;
        }
        private RenderWires():void {
            const r=this.runtime();if(!this.isConnected||!r.controller||r.controller.signal.aborted||r.wireFrame!==null)return;
            r.wireFrame=requestAnimationFrame(()=>{r.wireFrame=null;if(this.isConnected&&!r.controller?.signal.aborted)this.RenderWiresNow();});
        }
        private RenderWiresNow():void {
            const r=this.runtime(),workspace=this.OwnElement<HTMLElement>('.NodeEditor-Workspace'),svg=workspace?.querySelector<SVGSVGElement>('.NodeEditor-Wires');if(!workspace||!svg)return;svg.replaceChildren();
            const width=Math.max(r.canvas?.world.clientWidth??1,...this._nodes.map(n=>n.x+230)),height=Math.max(r.canvas?.world.clientHeight??1,...this._nodes.map(n=>n.y+240));
            // One SVG user unit equals one untransformed CSS pixel of this workspace.
            svg.setAttribute('width',String(width));svg.setAttribute('height',String(height));svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.setAttribute('preserveAspectRatio','none');
            for(const [key,value]of Object.entries({width:width+'px',height:height+'px','max-width':'none','max-height':'none',transform:'none',zoom:'1',left:'0px',top:'0px',right:'auto',bottom:'auto',padding:'0',margin:'0',border:'0','box-sizing':'content-box'}))svg.style.setProperty(key,value,'important');
            const basis=this.WorldBasis();
            const positions=new Map<string,{x:number;y:number}>();for(const element of workspace.querySelectorAll<HTMLElement>('.NodeEditor-Port')){const box=element.getBoundingClientRect();positions.set(JSON.stringify([element.dataset.nodeId,element.dataset.portId,element.dataset.side]),this.LocalPoint((box.left+box.right)/2,(box.top+box.bottom)/2,basis));}
            const portPoint=(id:string,port:string,side:'in'|'out')=>{
                // The DOM port is authoritative: node scale, port size, zoom,
                // pan and tilt must never be duplicated as numeric offsets.
                return positions.get(JSON.stringify([id,port,side]))??null;
            };
            const draw=(a:{x:number;y:number},b:{x:number;y:number},id?:string,status?:string)=>{
                const points=b.x-a.x>=32?[a,{x:(a.x+b.x)/2,y:a.y},{x:(a.x+b.x)/2,y:b.y},b]:[a,{x:a.x+24,y:a.y},{x:a.x+24,y:Math.max(a.y,b.y)+80},{x:b.x-24,y:Math.max(a.y,b.y)+80},{x:b.x-24,y:b.y},b];
                const group=document.createElementNS('http://www.w3.org/2000/svg','g');svg.append(group);
                const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('class','NodeEditor-Wire');path.setAttribute('d',this.WirePath(points));
                if(id){
                    path.dataset.wireId=id;path.dataset.status=status;path.dataset.selected=String(r.selectedWire===id);
                    // Invisible hit area makes a 2px wire easy to select without changing its appearance.
                    const hit=document.createElementNS('http://www.w3.org/2000/svg','path');hit.setAttribute('class','NodeEditor-WireHit');hit.setAttribute('d',this.WirePath(points));hit.dataset.wireId=id;hit.dataset.selectable='wire';hit.setAttribute('role','button');hit.setAttribute('aria-label','Select connection '+id);hit.setAttribute('aria-pressed',String(r.selectedWire===id));
                    for(const element of [hit,path]){
                        element.addEventListener('pointerdown',e=>{e.stopPropagation();});
                        element.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey){this.focus({preventScroll:true});this.PaintSelection();return;}this.SelectWire(id);});
                        element.addEventListener('dblclick',e=>{e.preventDefault();e.stopPropagation();this.removeWire(id);});
                        element.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();this.SelectWire(id);this.OpenWireMenu(id,e.clientX,e.clientY);});
                    }
                    group.append(hit,path);
                    const controls=document.createElementNS('http://www.w3.org/2000/svg','g');controls.setAttribute('class','NodeEditor-WireControls');controls.style.opacity='0';controls.style.pointerEvents='none';
                    const button=(x:number,y:number,label:string,glyph:string,action:(e:MouseEvent)=>void)=>{
                        const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('transform',`translate(${x} ${y})`);g.setAttribute('role','button');g.setAttribute('aria-label',label);g.setAttribute('tabindex','0');g.style.cursor='pointer';
                        const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');circle.setAttribute('r','8');circle.setAttribute('fill',this.getAttribute('theme')==='light'?'#f5f6f8':'#292d32');circle.setAttribute('stroke','#e40c88');
                        circle.setAttribute('cx','0');circle.setAttribute('cy','0');circle.style.pointerEvents='inherit';
                        const icon=document.createElementNS('http://www.w3.org/2000/svg','path');icon.setAttribute('d',glyph==='×'?'M-3 -3L3 3M3 -3L-3 3':'M-3 0A3 3 0 1 0 3 0A3 3 0 1 0 -3 0');icon.setAttribute('fill','none');icon.setAttribute('stroke','#e40c88');icon.setAttribute('stroke-width','1.5');icon.setAttribute('stroke-linecap','round');icon.style.pointerEvents='none';g.append(circle,icon);
                        g.addEventListener('pointerdown',e=>{e.preventDefault();e.stopImmediatePropagation();});
                        g.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();action(e);});controls.append(g);return g;
                    };
                    // Midpoint of the routed polyline, including backward connections.
                    let length=0;for(let i=1;i<points.length;i++)length+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);let remaining=length/2,mid=a;
                    for(let i=1;i<points.length;i++){const p=points[i-1],q=points[i],n=Math.hypot(q.x-p.x,q.y-p.y);if(remaining<=n&&n){mid={x:p.x+(q.x-p.x)*remaining/n,y:p.y+(q.y-p.y)*remaining/n};break;}remaining-=n;}
                    const del=button(mid.x,mid.y,'Delete connection','×',e=>{e.preventDefault();e.stopPropagation();if(e.button===0)this.removeWire(id);});del.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.removeWire(id);}});
                    button(a.x+14,a.y,'Reconnect source','○',e=>this.StartReconnect(id,'out',e));button(b.x-14,b.y,'Reconnect destination','○',e=>this.StartReconnect(id,'in',e));group.append(controls);
                    const show=()=>{controls.style.opacity='1';controls.style.pointerEvents='auto';};group.addEventListener('pointerenter',show);group.addEventListener('focusin',show);group.addEventListener('pointerleave',()=>{controls.style.opacity='0';controls.style.pointerEvents='none';});
                }else{path.dataset.preview='true';group.append(path);}
            };
            for(const w of this._wires){const a=portPoint(w.srcNodeId,w.srcPortId,'out'),b=portPoint(w.dstNodeId,w.dstPortId,'in');if(a&&b){const drag=r.reconnect?.id===w.id?r.reconnect:null;if(drag)draw(drag.side==='out'?drag.point:a,drag.side==='in'?drag.point:b);else draw(a,b,w.id,w.status);}}
            if(r.pending&&r.pointer){const a=portPoint(r.pending.node,r.pending.port,'out');if(a)draw(a,r.pointer);}this.SyncSelection();
        }
        /** Selection belongs to the editor instance; keyboard actions never affect another Workflow. */
        public get SelectedWire():Interfaces.WireInstance|null {
            return this.wires.find(w=>w.id===this.runtime().selectedWire)??null;
        }
        public SelectWire(id:string|null):this {
            const r=this.runtime();r.closeMenu?.();r.selectedWire=id&&this.wires.some(w=>w.id===id)?id:null;
            if(r.selectedWire){r.selectedNodes.clear();r.selectedWires=new Set([r.selectedWire]);this._selected=null;r.pending=null;this.FillInspector();this.focus({preventScroll:true});}else r.selectedWires.clear();this.SyncSelection();
            for(const selector of ['.NodeEditor-Wire','.NodeEditor-WireHit'])for(const el of this.OwnElements<SVGElement>(selector)){
                const selected=el.dataset.wireId===r.selectedWire;el.dataset.selected=String(selected);
                if(selector==='.NodeEditor-WireHit')el.setAttribute('aria-pressed',String(selected));
            }
            return this;
        }
        private HandleWireKey(event:KeyboardEvent):void {
            const target=event.target as HTMLElement|null;
            if(target?.closest('.NodeEditor')!==this&&target!==this)return;
            if(target?.isContentEditable||target?.closest('input,textarea,select,[contenteditable="true"],[contenteditable=""]'))return;
            const r=this.runtime(),command=event.ctrlKey||event.metaKey,key=event.key.toLowerCase();
            if(command&&['a','c','x','v'].includes(key)){event.preventDefault();event.stopPropagation();if(key==='a')this.SelectNodes(this.nodes.map(n=>n.id));else if(key==='c')this.Copy();else if(key==='x')this.Cut();else this.Paste();return;}
            if(event.key==='Escape'){r.cancelReconnect?.();r.closeMenu?.();r.pending=null;this.ClearSelection();this.Refresh();return;}
            if(['Delete','Del','Backspace'].includes(event.key)&&(r.selectedNodes.size||r.selectedWires.size||r.selectedWire)){event.preventDefault();event.stopPropagation();this.DeleteSelection();}
        }
        private OpenWireMenu(id:string,x:number,y:number):void {
            const r=this.runtime();r.closeMenu?.();const wire=this.wires.find(w=>w.id===id);if(!wire)return;
            const doc=this.ownerDocument,view=doc.defaultView,menu=doc.createElement('div');menu.className='NodeEditor-WireMenu';menu.dataset.theme=this.getAttribute('theme')==='light'?'light':'dark';menu.setAttribute('role','menu');menu.setAttribute('aria-label','Connection options');
            const info=doc.createElement('div');info.className='NodeEditor-WireMenuInfo';info.textContent=`${wire.srcNodeId}.${wire.srcPortId} → ${wire.dstNodeId}.${wire.dstPortId} · ${wire.status}`;menu.appendChild(info);
            const control=new AbortController();
            const close=(restore=false)=>{control.abort();menu.remove();if(r.closeMenu===dismiss)r.closeMenu=null;if(restore&&this.isConnected)this.focus({preventScroll:true});};
            const dismiss=()=>close(false);r.closeMenu=dismiss;
            const focusNode=(nodeId:string)=>{close();this.SelectNodes([nodeId]);this.focus({preventScroll:true});};
            const entries:Array<[string,()=>void]>=[
                ['Delete connection',()=>{close(true);this.removeWire(id);}],
                ['Select source node',()=>focusNode(wire.srcNodeId)],
                ['Select destination node',()=>focusNode(wire.dstNodeId)]
            ];
            const buttons=entries.map(([label,action])=>{const b=doc.createElement('button');b.type='button';b.textContent=label;b.setAttribute('role','menuitem');b.onclick=action;menu.appendChild(b);return b;});
            doc.body.appendChild(menu);const rect=menu.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(x,(view?.innerWidth??800)-rect.width-8))+'px';menu.style.top=Math.max(8,Math.min(y,(view?.innerHeight??600)-rect.height-8))+'px';buttons[0].focus();
            doc.addEventListener('pointerdown',e=>{if(!menu.contains(e.target as Node))close();},{capture:true,signal:control.signal});
            menu.addEventListener('keydown',e=>{
                if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);return;}
                if(e.key==='Delete'||e.key==='Del'||e.key==='Backspace'){e.preventDefault();e.stopPropagation();close(true);this.removeWire(id);return;}
                if(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='Home'||e.key==='End'){
                    e.preventDefault();const i=buttons.indexOf(doc.activeElement as HTMLButtonElement);const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowDown'?1:buttons.length-1))%buttons.length;buttons[next].focus();
                }else if(e.key==='Tab')close();
            },{signal:control.signal});
            doc.addEventListener('scroll',dismiss,{capture:true,signal:control.signal});view?.addEventListener('resize',dismiss,{signal:control.signal});
        }
        private UpdatePorts():void {
            const r=this.runtime();for(const el of this.OwnElements<HTMLElement>('.NodeEditor-Port')){
                const node=el.dataset.nodeId!,port=el.dataset.portId!,side=el.dataset.side;
                const wires=this._wires.filter(w=>side==='in'?w.dstNodeId===node&&w.dstPortId===port:w.srcNodeId===node&&w.srcPortId===port);
                const status=wires.some(w=>w.status==='connected-error')?'connected-error':wires.some(w=>w.status==='connected-warn')?'connected-warn':wires.length?'connected-ok':'unconnected';
                const hover=r.pending&&r.hoverPort===el?this.ConnectionStatus(r.pending.node,r.pending.port,node,port):null;
                const nextStatus=hover??status,nextHover=String(!!hover),nextPending=String(side==='out'&&r.pending?.node===node&&r.pending?.port===port);if(el.dataset.status!==nextStatus)el.dataset.status=nextStatus;if(el.dataset.hover!==nextHover)el.dataset.hover=nextHover;if(el.dataset.pending!==nextPending)el.dataset.pending=nextPending;
                el.title=(side==='in'?'Input ':'Output ')+port+' · '+status+(r.errors.has(node)?' · '+r.errors.get(node):'');
            }
        }
        private Refresh():void {
            const r=this.runtime();this.UpdatePorts();this.RenderWires();
            for(const el of this.OwnElements<HTMLElement>('.NodeEditor-Result')){const value=r.values.get(el.dataset.resultId!),node=this._nodes.find(n=>n.id===el.dataset.resultId);if(!resultValues.has(el)||resultValues.get(el)!==value){if(node?.schema.operation==='result')el.replaceChildren(this.ResultView(node,value));else el.replaceChildren(this.ValueLabel(value));resultValues.set(el,value);}}
            for(const el of this.OwnElements<HTMLElement>('.NodeEditor-Error')){el.textContent=r.errors.get(el.dataset.errorId!)??'';}
        }
        private MakeNode(node:Interfaces.NodeInstance):HTMLElement {
            const el=document.createElement('article');el.className='NodeEditor-Node';el.dataset.nodeId=node.id;el.dataset.selectable='node';el.dataset.selected=String(this.runtime().selectedNodes.has(node.id));el.style.left=node.x+'px';el.style.top=node.y+'px';el.style.setProperty('--node-color',node.schema.color??'#e40c88');
            const header=document.createElement('header');header.className='NodeEditor-NodeHeader';const icon=document.createElement('span');icon.className='NodeEditor-NodeIcon';icon.appendChild(this.MathLabel(node.schema,Number(node.params?.base??(node.schema.operation==='log'?10:Math.E))));const name=document.createElement('div');name.className='NodeEditor-NodeName';name.textContent=node.schema.name;header.append(icon,name);el.appendChild(header);
            name.title='Click to rename';name.tabIndex=0;name.setAttribute('role','button');name.setAttribute('aria-label','Rename module');
            const rename=(event:Event)=>{event.stopPropagation();this.SelectNodes([node.id]);if(name.querySelector('input'))return;const input=document.createElement('input');input.className='NodeEditor-Input';input.value=node.schema.name;input.setAttribute('aria-label','Module name');name.replaceChildren(input);let done=false;
                const finish=(save=true)=>{if(done)return;done=true;const value=input.value.trim();if(save&&value)this.RenameNode(node.id,value);name.textContent=node.schema.name;};
                input.onblur=()=>finish();input.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();finish();}else if(e.key==='Escape'){e.preventDefault();finish(false);}};input.focus();input.select();};
            name.onclick=rename;name.onpointerdown=e=>{e.stopPropagation();this.SelectNodes([node.id],e.shiftKey?'add':'replace');};name.onkeydown=e=>{if(e.key==='Enter'||e.key==='F2')rename(e);};
            const op=node.schema.operation;if(op==='module')el.addEventListener('dblclick',event=>{if((event.target as Element).closest('.NodeEditor-Port'))return;event.preventDefault();event.stopPropagation();this.OpenModule(node.id);});
            if(op==='module'){const open=document.createElement('button');open.type='button';open.className='NodeEditor-Button NodeEditor-Open';open.textContent='Open';open.style.cssText='display:block;margin:12px auto 8px';open.onpointerdown=e=>e.stopPropagation();open.onclick=e=>{e.stopPropagation();this.OpenModule(node.id);};el.append(open);}
            if(op==='result'){const preview=document.createElement('output');preview.className='NodeEditor-Result';preview.dataset.resultId=node.id;preview.style.cssText='display:block;margin:28px 16px 8px;max-height:160px;overflow:auto';preview.append(this.ResultView(node,this.runtime().values.get(node.id)));el.append(preview);}
            el.style.minHeight=Math.max(108,80+Math.max(node.schema.inputs.length,node.schema.outputs.length)*22)+'px';
            for(const side of ['in','out'] as const)for(const [i,port] of (side==='in'?node.schema.inputs:node.schema.outputs).entries()){
                const button=document.createElement('button');button.type='button';button.className='NodeEditor-Port';button.dataset.nodeId=node.id;button.dataset.portId=port.id;button.dataset.side=side;button.style.top=(62.5+i*22)+'px';button.setAttribute('aria-label',`${node.schema.name} ${side} ${port.label??port.id}`);
                button.onpointerdown=e=>{e.stopPropagation();if(e.button!==0||side!=='out')return;const r=this.runtime();r.pending={node:node.id,port:port.id};this.PreviewConnection(e.clientX,e.clientY);button.dataset.suppressClick='true';let moved=false;const gesture=new AbortController();r.controller?.signal.addEventListener('abort',()=>gesture.abort(),{once:true,signal:gesture.signal});
                    document.addEventListener('pointermove',move=>{if(move.pointerId===e.pointerId){moved ||= Math.hypot(move.clientX-e.clientX,move.clientY-e.clientY)>3;this.PreviewConnection(move.clientX,move.clientY);}},{signal:gesture.signal});
                    document.addEventListener('pointerup',up=>{if(up.pointerId!==e.pointerId)return;gesture.abort();const target=this.InputPortAt(up.clientX,up.clientY);if(moved&&target&&this.ConnectionStatus(node.id,port.id,target.dataset.nodeId!,target.dataset.portId!)==='connected-ok')this.addWire(node.id,port.id,target.dataset.nodeId!,target.dataset.portId!);this.PreviewConnection(up.clientX,up.clientY);},{signal:gesture.signal});
                    document.addEventListener('pointercancel',()=>{gesture.abort();r.pending=null;r.hoverPort=null;this.Refresh();},{once:true,signal:gesture.signal});};
                button.onpointerenter=e=>{if(this.runtime().pending)this.PreviewConnection(e.clientX,e.clientY);};
                button.onpointerleave=()=>{const r=this.runtime();if(r.hoverPort===button){r.hoverPort=null;this.UpdatePorts();}};
                button.onclick=e=>{e.stopPropagation();if(button.dataset.suppressClick){delete button.dataset.suppressClick;return;}const r=this.runtime();if(side==='out')r.pending=r.pending?.node===node.id&&r.pending.port===port.id?null:{node:node.id,port:port.id};else if(r.pending&&this.ConnectionStatus(r.pending.node,r.pending.port,node.id,port.id)==='connected-ok')this.addWire(r.pending.node,r.pending.port,node.id,port.id);this.Refresh();};
                button.oncontextmenu=e=>{e.preventDefault();e.stopPropagation();this._wires=this._wires.filter(w=>side==='in'?!(w.dstNodeId===node.id&&w.dstPortId===port.id):!(w.srcNodeId===node.id&&w.srcPortId===port.id));this.Changed();};el.appendChild(button);
            }
            el.addEventListener('pointerdown',e=>{
                if(e.button!==0||(e.target as Element).closest('button,input,select,math'))return;e.stopPropagation();this.runtime().closeMenu?.();
                const r=this.runtime();if(!r.selectedNodes.has(node.id)){if(e.ctrlKey||e.metaKey||e.altKey)return;this.SelectNodes([node.id],e.shiftKey?'add':'replace');}this.focus({preventScroll:true});
                const p=this.LocalPoint(e.clientX,e.clientY),starts=new Map(this.nodes.filter(n=>this.runtime().selectedNodes.has(n.id)).map(n=>[n.id,{x:n.x,y:n.y}])),start={x:node.x,y:node.y};el.setPointerCapture(e.pointerId);
                const gesture=new AbortController();this.runtime().controller?.signal.addEventListener('abort',()=>gesture.abort(),{once:true,signal:gesture.signal});
                el.addEventListener('pointermove',move=>{if(move.pointerId!==e.pointerId)return;const q=this.LocalPoint(move.clientX,move.clientY);let next={x:start.x+q.x-p.x,y:start.y+q.y-p.y};const c=this.runtime().canvas;if(c?.getSnap().enabled)next=c.snapPoint(next);const dx=next.x-start.x,dy=next.y-start.y;for(const n of this.nodes){const origin=starts.get(n.id);if(!origin)continue;n.x=origin.x+dx;n.y=origin.y+dy;}for(const item of this.OwnElements<HTMLElement>('.NodeEditor-Node')){const n=this.nodes.find(n=>n.id===item.dataset.nodeId);if(n){item.style.left=n.x+'px';item.style.top=n.y+'px';}}this.RenderWires();},{signal:gesture.signal});
                const end=()=>{gesture.abort();if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);};el.addEventListener('pointerup',end,{signal:gesture.signal});el.addEventListener('pointercancel',end,{signal:gesture.signal});
            });return el;
        }
        private NodeControls(node:Interfaces.NodeInstance):HTMLElement {
            const el=document.createElement('div'),icon=document.createElement('span');
            const body=document.createElement('div');body.className='NodeEditor-NodeBody';const op=node.schema.operation;
            if(op==='string'||op==='boolean'){const input=document.createElement('input');input.className='NodeEditor-Input';input.type=op==='boolean'?'checkbox':'text';input.value=String(node.params?.value??'');input.checked=node.params?.value===true;input.setAttribute('aria-label',op);input.onchange=()=>this.SetParameter(node.id,'value',op==='boolean'?input.checked:input.value);body.append(input);}
            else if(op==='number'){
                const input=document.createElement('input');input.type='text';input.inputMode='decimal';input.className='NodeEditor-Input';input.value=String(node.params?.value??'0');input.setAttribute('aria-label','Number');input.addEventListener('input',()=>this.SetParameter(node.id,'value',input.value));
                const select=document.createElement('select');select.className='NodeEditor-Input';select.setAttribute('aria-label','Number type');for(const type of ['number','float','integer']){const o=document.createElement('option');o.value=type;o.textContent=type;select.appendChild(o);}select.value=String(node.params?.numberType??'number');select.onchange=()=>this.SetParameter(node.id,'numberType',select.value);body.append(input,select);
            }else if(op==='result'||op==='output'){const result=document.createElement('output');result.className='NodeEditor-Result';result.dataset.resultId=node.id;result.appendChild(op==='result'?this.ResultView(node,this.runtime().values.get(node.id)):this.ValueLabel(this.runtime().values.get(node.id)));body.appendChild(result);}
            else if(op==='module'){
                const open=document.createElement('button');open.type='button';open.className='NodeEditor-Button';open.textContent='Open content';open.onclick=()=>this.OpenModule(node.id);body.appendChild(open);
                const count=document.createElement('div');count.textContent=`${node.graph?.nodes.length??0} modules · double-click to edit`;body.appendChild(count);
                el.addEventListener('dblclick',event=>{if((event.target as Element).closest('input,select,.NodeEditor-Port'))return;event.preventDefault();event.stopPropagation();this.OpenModule(node.id);});
            }else if(op==='input'){
                const preview=document.createElement('input');preview.className='NodeEditor-Input';preview.type='text';preview.value=String(this.runtime().bindings?.[String(node.params?.portId??'in')]??node.params?.value??0);preview.setAttribute('aria-label','Input preview value');preview.oninput=()=>this.SetParameter(node.id,'value',preview.value);body.appendChild(preview);
            }
            else if(op){
                if(op==='log'||op==='exp'){
                    const base=document.createElement('button');base.type='button';base.className='NodeEditor-Base';base.title='Click to edit the base (replaces a wired base)';base.appendChild(this.MathLabel(node.schema,Number(node.params?.base??(op==='log'?10:Math.E))));
                    base.onclick=()=>{const input=document.createElement('input');input.type='number';input.className='NodeEditor-Input';input.value=String(node.params?.base??(op==='log'?10:Math.E));input.setAttribute('aria-label','Base');base.replaceWith(input);input.focus();const commit=()=>{const port=node.schema.inputs[1];if(port)this._wires=this._wires.filter(w=>w.dstNodeId!==node.id||w.dstPortId!==port.id);this.SetParameter(node.id,'base',Number(input.value));this.Render();};input.onchange=commit;input.onkeydown=e=>{if(e.key==='Enter')commit();if(e.key==='Escape')this.Render();};};body.appendChild(base);icon.style.cursor='text';icon.title=base.title;icon.onclick=()=>base.click();
                }
                if(['add','subtract','multiply','divide','modulo','power','root','concat','and'].includes(op)){const add=document.createElement('button');add.type='button';add.className='NodeEditor-Button';add.textContent='+ input';add.title='Add another input (left associative)';add.setAttribute('aria-label','Add input');add.onclick=()=>this.AddInput(node.id);
                const remove=document.createElement('button');remove.type='button';remove.className='NodeEditor-Button';remove.textContent='− input';remove.title='Remove last optional input and its connections';remove.setAttribute('aria-label','Remove input');remove.disabled=node.schema.inputs.length<=Math.max(1,this.schemas.find(s=>s.type===node.type)?.inputs.length??(['add','subtract'].includes(op)?2:1));remove.onclick=()=>this.RemoveInput(node.id);body.append(add,remove);}
            }else body.textContent=node.schema.description??'Workflow node';
            if(op==='input'||op==='output'){
                const port=document.createElement('input');port.className='NodeEditor-Input';port.value=String(node.params?.portId??(op==='input'?'in':'out'));port.setAttribute('aria-label','External port ID');port.title='Port ID exposed on the parent module';port.onchange=()=>this.SetParameter(node.id,'portId',port.value.trim());body.appendChild(port);
            }
            const error=document.createElement('div');error.className='NodeEditor-Error';error.dataset.errorId=node.id;body.appendChild(error);
            return body;
        }
        private OwnElements<T extends Element=Element>(selector:string):T[] {return Array.from(this.querySelectorAll<T>(selector)).filter(element=>element.closest('.NodeEditor')===this);}
        private OwnElement<T extends Element=Element>(selector:string):T|null {return this.OwnElements<T>(selector)[0]??null;}
        private FillInspector():void {
            const body=this.runtime().docks[1]?.Wrapper?.querySelector<HTMLElement>('.NodeEditor-InspectorBody')??this.OwnElement<HTMLElement>('.NodeEditor-InspectorBody');if(!body)return;body.replaceChildren();const node=this._nodes.find(n=>n.id===this._selected);
            const info=document.createElement('div');info.className='NodeEditor-Info';info.textContent=this.runtime().selectedNodes.size>1?`${this.runtime().selectedNodes.size} modules selected · ${[...this.runtime().selectedNodes].join(', ')}`:node?`${node.schema.name} · ${node.id}`:'Select a node. Connect output → input by click or drag. Double-click a wire to remove it.';body.appendChild(info);if(!node)return;
            body.append(this.NodeControls(node));
            for(const param of node.schema.params??[]){if(['value','numberType','base','portId'].includes(param.id)&&['number','string','boolean','input','output','log','exp'].includes(node.schema.operation??''))continue;const row=document.createElement('label');row.className='NodeEditor-Param';row.textContent=param.label??param.id;const input=param.type==='enum'?document.createElement('select'):document.createElement('input');input.className='NodeEditor-Input';input.setAttribute('aria-label',param.label??param.id);if(input instanceof HTMLInputElement){input.type=param.type==='boolean'?'checkbox':param.type==='number'?'number':'text';input.checked=Boolean(node.params?.[param.id]??param.default);}else for(const value of param.options??[]){const option=document.createElement('option');option.value=String(value);option.textContent=String(value);input.append(option);}input.value=String(node.params?.[param.id]??param.default??'');input.onchange=()=>{this.SetParameter(node.id,param.id,param.type==='boolean'?(input as HTMLInputElement).checked:param.type==='number'?Number(input.value):input.value);if(node.schema.operation==='result')this.Render();};row.appendChild(input);body.appendChild(row);}
            if(node.schema.operation==='ai')this.FillAIInspector(body,node);
            if(node.schema.operation==='result'){const download=document.createElement('button');download.type='button';download.className='NodeEditor-Button';download.textContent='Download';const error=document.createElement('output');error.className='NodeEditor-Info';download.onclick=async()=>{download.disabled=true;try{await this.DownloadResult(node.id);error.textContent='';}catch(e){error.textContent=e instanceof Error?e.message:String(e);}finally{download.disabled=false;}};body.append(download,error);}
            const del=document.createElement('button');del.type='button';del.className='NodeEditor-Button';del.textContent='Remove node';del.onclick=()=>this.removeNode(node.id);body.appendChild(del);
        }
        public Fit():this {
            const canvas=this.runtime().canvas;if(!canvas||!this._nodes.length)return this;const world=canvas.world;
            const x=Math.min(...this._nodes.map(n=>n.x)),y=Math.min(...this._nodes.map(n=>n.y)),right=Math.max(...this._nodes.map(n=>n.x+174)),bottom=Math.max(...this._nodes.map(n=>n.y+180));
            const zoom=Math.max(.1,Math.min(1,(world.clientWidth-50)/(right-x),(world.clientHeight-50)/(bottom-y)));canvas.setZoom(zoom);canvas.panTo((world.clientWidth/2-(x+right)/2)*zoom,(world.clientHeight/2-(y+bottom)/2)*zoom);return this;
        }
        /** One chrome renderer for both main and nested Workflows. */
        private MountChrome(shell:HTMLElement,theme:string):void {
            shell.querySelector(':scope > .NodeEditor-Chrome')?.remove();
            const hostWindow=moduleHosts.get(this);
            const chrome=document.createElement('header');chrome.className='NodeEditor-Chrome';if(hostWindow)chrome.classList.add('Dockable-Handle');
            chrome.style.cssText='grid-column:1 / -1;grid-row:1;display:flex;justify-content:flex-end;align-items:center;gap:4px;padding:6px 7px;height:36px;min-height:36px;box-sizing:border-box;background:'+(theme==='dark'?'linear-gradient(180deg,#363b40,#25292d)':'linear-gradient(180deg,#f9fbfc,#e0e4e7)');
            const glyphs=[['Minimize','M7 18H17'],['Maximize / Restore','M5 5H19V19H5Z'],['Close','M6 6L18 18M18 6L6 18']];
            glyphs.forEach(([label,path],index)=>{const button=document.createElement('button');button.type='button';button.title=label;button.setAttribute('aria-label',label);button.className='NodeEditor-Button';button.style.cssText='display:grid;place-items:center;width:25px;height:23px;padding:2px;box-sizing:border-box';
                const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width',index===1?'11.9':'17');svg.setAttribute('height',index===1?'11.9':'17');const line=document.createElementNS('http://www.w3.org/2000/svg','path');line.setAttribute('d',path);line.setAttribute('fill','none');line.setAttribute('stroke','currentColor');line.setAttribute('stroke-width','1.6');svg.append(line);button.append(svg);
                button.onpointerdown=event=>event.stopPropagation();
                button.onclick=()=>{
                    if(hostWindow){if(index===0)hostWindow.minimize();else if(index===1)hostWindow.toggleMaximize();else hostWindow.close();return;}
                    if(index===0){const collapsed=shell.dataset.collapsed!=='true';shell.dataset.collapsed=String(collapsed);for(const child of Array.from(shell.children))if(child!==chrome)(child as HTMLElement).style.visibility=collapsed?'hidden':'';if(collapsed){this.dataset.expandedHeight=this.style.height;this.style.setProperty('height','36px','important');}else{this.style.removeProperty('height');if(this.dataset.expandedHeight)this.style.height=this.dataset.expandedHeight;}button.setAttribute('aria-pressed',String(collapsed));}
                    else if(index===1){if(this.dataset.maximized==='true'){this.style.cssText=this.dataset.restoreStyle??'';delete this.dataset.maximized;}else{this.dataset.restoreStyle=this.style.cssText;this.dataset.maximized='true';const parent=this.parentElement;if(parent&&getComputedStyle(parent).position==='static')parent.style.position='relative';Object.assign(this.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:'100000'});}this.UpdateInsets();}
                    else{this.Stop();this.onUnmount();this.remove();}
                };chrome.append(button);
            });shell.prepend(chrome);
        }
        private Render():void {
            this.EnsureState();for(const [id,item] of [...this.runtime().modules])if(!this._nodes.some(n=>n.id===id))item.close(false);this.DisposeView();const r=this.runtime();r.controller=new AbortController();const theme=this.getAttribute('theme')==='light'?'light':'dark';
            const existingShell=this.OwnElement<HTMLElement>(':scope > .NodeEditor-Shell');const shell=existingShell??document.createElement('section');shell.className='NodeEditor-Shell';shell.style.cssText='display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:36px 40px minmax(0,1fr) 20px;width:100%;max-width:100%;height:100%;min-width:0;min-height:0;box-sizing:border-box;overflow:hidden';const toolbar=document.createElement('header');toolbar.className='NodeEditor-Toolbar';toolbar.style.cssText='grid-column:1 / -1;grid-row:2;flex-wrap:nowrap;overflow-x:auto;width:100%;max-width:100%;min-width:0;box-sizing:border-box;margin:0;position:relative;left:auto;right:auto';const title=document.createElement('div');title.className='NodeEditor-Title';title.textContent='AriannA Workflow';const state=document.createElement('div');state.className='NodeEditor-State';toolbar.append(title,state);
            const actions:[string,string,string,()=>unknown][]=[['run','▶','Play',()=>this.Run()],['pause','Ⅱ','Pause',()=>this.Pause()],['stop','■','Stop',()=>this.Stop()],['fit','⌖','Fit',()=>this.Fit()],['copy','','Copy',()=>this.Copy()],['cut','','Cut',()=>this.Cut()],['paste','','Paste',()=>this.Paste()],['delete','','Delete',()=>this.DeleteSelection()],['clear','','Clear',()=>{this.Stop();this._nodes=[];this._wires=[];this._selected=null;for(const item of [...r.modules.values()])item.close(false);r.values.clear();r.errors.clear();r.selectedWire=null;r.selectedNodes.clear();r.selectedWires.clear();this.Render();}],['export','','Export JSON',()=>this.ExportJSON()]];
            for(const [kind,glyph,label,action] of actions){const b=document.createElement('button');b.type='button';b.className='NodeEditor-Button';b.dataset.kind=kind;const span=document.createElement('span');span.className='NodeEditor-ControlGlyph';span.textContent=glyph;b.append(span,document.createTextNode(' '+label));b.onclick=action;toolbar.appendChild(b);}
            const body=existingShell?.querySelector<HTMLElement>(':scope > .NodeEditor-Body')??document.createElement('div');body.className='NodeEditor-Body';body.style.cssText='position:relative;display:block;grid-column:1 / -1;grid-row:3;width:100%;min-height:0;min-width:0;overflow:hidden';body.querySelector<HTMLElement>(':scope > .NodeEditor-Viewport')?.remove();const viewport=document.createElement('div');viewport.className='NodeEditor-Viewport';WorkspaceEditors.set(viewport,this);r.controller.signal.addEventListener('abort',()=>WorkspaceEditors.delete(viewport),{once:true});body.insertBefore(viewport,body.firstChild);
            if(existingShell)existingShell.querySelector<HTMLElement>(':scope > .NodeEditor-Toolbar')?.replaceWith(toolbar);else {const footer=document.createElement('footer');footer.className='NodeEditor-Footer';footer.textContent='Workflow';footer.style.cssText='height:20px;box-sizing:border-box;padding:3px 8px;font:10px system-ui;background:'+ (theme==='dark'?'#25292d':'#e4e7e9');shell.append(toolbar,body,footer);this.replaceChildren(shell);}
            // Header/footer belong to the shell, not the viewport inset by the docks.
            const footer=shell.querySelector<HTMLElement>(':scope > .NodeEditor-Footer');if(footer)footer.style.cssText='grid-column:1 / -1;grid-row:4;width:100%;max-width:100%;min-width:0;height:20px;box-sizing:border-box;margin:0;position:relative;left:auto;right:auto;padding:3px 8px;font:10px system-ui;background:'+(theme==='dark'?'#25292d':'#e4e7e9');
            this.MountChrome(shell,theme);
            r.bar=ToolBar.For(body,{theme,position:r.barPosition});body.addEventListener('arianna:toolbar-layout',()=>this.UpdateInsets(),{signal:r.controller.signal});
            const canvas=new Canvas2D();canvas.setAttribute('theme',theme);canvas.classList.add('NodeEditor-Canvas');canvas.style.setProperty('height','100%','important');canvas.style.setProperty('min-height','0','important');
            // Explicit defaults also apply to an Empty module mounted outside
            // the main editor, where playground CSS variables are not inherited.
            canvas.style.setProperty('--workflow-wire',theme==='dark'?'#fff':'#4b545e');
            for(const [key,value] of Object.entries(theme==='dark'?{'--arianna-text':'#e5e8ea','--arianna-text-muted':'#9ea6ad','--arianna-surface-2':'#25292d','--arianna-surface-3':'#363b40','--arianna-button-top':'#444a50','--arianna-button-bottom':'#30353a','--arianna-border':'#15181a'}:{'--arianna-text':'#25292d','--arianna-text-muted':'#626a71','--arianna-surface-2':'#e4e7e9','--arianna-surface-3':'#f9fbfc','--arianna-button-top':'#f9fbfc','--arianna-button-bottom':'#e0e4e7','--arianna-border':'#b8bdc2'}))canvas.style.setProperty(key,value);canvas.style.setProperty('--arianna-artboard',theme==='dark'?'#1b1f22':'#f6f7f9');canvas.style.setProperty('--arianna-canvas-bg',theme==='dark'?'#1b1f22':'#eef0f2');viewport.appendChild(canvas);r.canvas=canvas;
            viewport.addEventListener('pointerdown',event=>{const port=(event.target as Element).closest('.NodeEditor-Port,.NodeEditor-NodeName,.NodeEditor-WireControls,button,input,select,textarea');if(port?.closest('.NodeEditor')===this&&event.button===0){if(canvas.navigation!=='none')canvas.setNavigation('none');if(r.selection){r.selection.options={enabled:false};queueMicrotask(()=>{if(!r.controller?.signal.aborted&&r.selection)r.selection.options={enabled:canvas.navigation==='none'};});}}},{capture:true,signal:r.controller?.signal});
            void canvas.world;if(r.snap)canvas.setSnap(r.snap);
            const snapButton=canvas.querySelector<HTMLButtonElement>('[data-role="snap"]');if(snapButton){snapButton.textContent='Snap to Grid';snapButton.title='Snap to Grid';const toolbar=snapButton.parentElement;for(const role of ['snap-y','snap-x']){const axis=canvas.querySelector<HTMLButtonElement>('[data-role="'+role+'"]');if(axis&&toolbar)toolbar.insertBefore(axis,snapButton.nextSibling);}}
            const canvasShell=canvas.querySelector<HTMLElement>('.Canvas2D-Shell');if(canvasShell)canvasShell.style.gridTemplateRows='38px minmax(0,1fr)';
            const canvasStatus=canvas.querySelector<HTMLElement>('.Canvas2D-Status');if(canvasStatus)canvasStatus.style.display='none';
            const world=canvas.world;canvas.drawingSurface.style.pointerEvents='none';canvas.drawingSurface.setAttribute('viewBox',`0 0 ${Math.max(1,world.clientWidth)} ${Math.max(1,world.clientHeight)}`);const grid=new Grid2D();grid.configure({theme,background:theme==='dark'?'#1b1f22':'#f6f7f9',kind:'dotted',subdivisions:1,stepX:20,stepY:20,majorEvery:5,...(theme==='dark'?{minorOpacity:.12,majorOpacity:.22}:{minorOpacity:.18,majorOpacity:.3})});grid.attach(canvas);canvas.useGrid(grid);canvas.setGrid({enabled:true,size:20,subdivisions:1});r.grid=grid;
            if(r.viewport){canvas.setZoom(r.viewport.zoom);canvas.panTo(r.viewport.panX,r.viewport.panY);canvas.setTilt(r.viewport.tilt);}
            const workspace=document.createElement('div');workspace.className='NodeEditor-Workspace';
            r.probes=[[0,0],[100,0],[0,100]].map(([x,y])=>{const probe=document.createElement('span');probe.setAttribute('aria-hidden','true');probe.dataset.workflowProbe='true';probe.style.cssText=`position:absolute!important;left:${x}px!important;top:${y}px!important;width:0!important;height:0!important;padding:0!important;margin:0!important;border:0!important;transform:none!important;pointer-events:none!important;visibility:hidden!important`;workspace.append(probe);return probe;});
            const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','NodeEditor-Wires');svg.style.maxWidth='none';svg.style.maxHeight='none';workspace.appendChild(svg);for(const node of this._nodes)workspace.appendChild(this.MakeNode(node));world.appendChild(workspace);this.BindWorkspaceDrop(viewport);
            canvas.addEventListener('arianna:viewport',()=>this.RefreshViewportWires(),{signal:r.controller.signal});
            viewport.addEventListener('pointermove',e=>{if(r.pending)this.PreviewConnection(e.clientX,e.clientY);});
            const selection=new SelectionRectangle();selection.options={mode:'2d',activation:'always',directionSensitive:false,rule:'intersect'};r.selection=selection;
            selection.addEventListener('arianna:selection-change',()=>{if(r.syncingSelection)return;r.selectedNodes.clear();r.selectedWires.clear();for(const item of selection.selected){const element=item as HTMLElement;if(element.dataset.nodeId)r.selectedNodes.add(element.dataset.nodeId);else if(element.dataset.wireId)r.selectedWires.add(element.dataset.wireId);}r.selectedWire=[...r.selectedWires][0]??null;this._selected=[...r.selectedNodes][0]??null;r.pending=null;this.PaintSelection();this.FillInspector();},{signal:r.controller.signal});
            canvas.selectionSurface.addEventListener('pointerdown',event=>{if(!(event.target as Element).closest('button,input,select,textarea,[contenteditable="true"]'))this.focus({preventScroll:true});},{capture:true,signal:r.controller.signal});
            selection.attach(canvas);this.SyncSelection();
            const navigation=()=>{selection.options={enabled:canvas.navigation==='none'};};canvas.addEventListener('arianna:navigation-change',navigation,{signal:r.controller.signal});navigation();
            const palette=this.CreatePalette(viewport),inspector=document.createElement('aside');inspector.className='NodeEditor-Inspector';const ih=document.createElement('div');ih.className='NodeEditor-InspectorHeader';ih.textContent='Node';const ib=document.createElement('div');ib.className='NodeEditor-InspectorBody';ib.style.cssText='flex:1 1 0;min-height:0;overflow:auto;display:block';inspector.append(ih,ib);
            for(const [i,panel] of [palette,inspector].entries()){
                body.appendChild(panel);panel.style.setProperty('height','auto','important');panel.style.setProperty('min-height','0','important');const dock=new Dockable();dock.attach(panel,{container:body,respectCanvas:false,contentInsets:{top:38},title:i===0?'Modules':'Inspector',theme,position:r.dockPositions[i]??(i===0?'left':'right'),width:190,height:360,dockWidth:190,dockHeight:180});r.docks.push(dock);const firstWindow=body.querySelector<HTMLElement>(':scope > .NodeEditor-ModuleWindow');if(firstWindow&&dock.Wrapper)body.insertBefore(dock.Wrapper,firstWindow);const rect=r.dockRects[i];if(dock.Position==='float'&&rect&&dock.Wrapper)Object.assign(dock.Wrapper.style,rect);
                for(const event of ['arianna:dock-end','arianna:dock-change'])panel.addEventListener(event,()=>this.UpdateInsets(),{signal:r.controller.signal});
                const grip=dock.Wrapper?.querySelector<HTMLElement>('.Dockable-ResizeGrip');if(grip){grip.style.zIndex='1000';grip.style.pointerEvents='auto';}
            }
            this.addEventListener('keydown',e=>this.HandleWireKey(e),{signal:r.controller.signal});
            const syncGridCoordinates=()=>{const box=`0 0 ${Math.max(1,world.clientWidth)} ${Math.max(1,world.clientHeight)}`;if(canvas.drawingSurface.getAttribute('viewBox')!==box){canvas.drawingSurface.setAttribute('viewBox',box);grid.configure({});}};r.resize=typeof ResizeObserver==='function'?new ResizeObserver(()=>{if(!r.controller||r.controller.signal.aborted)return;this.UpdateInsets();syncGridCoordinates();}):null;r.resize?.observe(body);r.resize?.observe(world);for(const d of r.docks)if(d.Wrapper)r.resize?.observe(d.Wrapper);
            this.UpdateInsets();syncGridCoordinates();this.FillInspector();this.UpdateRunControls();this.Refresh();this.SyncSelection();
        }
    }

}

export type NodeEditorOptions = NodeEditor.Interfaces.NodeEditorOptions;
export type NodeSchema = NodeEditor.Interfaces.NodeSchema;
export type NodeInstance = NodeEditor.Interfaces.NodeInstance;
export type WireInstance = NodeEditor.Interfaces.WireInstance;
export type PortSpec = NodeEditor.Interfaces.PortSpec;
export type ParamSpec = NodeEditor.Interfaces.ParamSpec;
export type RunState = NodeEditor.Types.RunState;
export type WireStatus = NodeEditor.Types.WireStatus;
export type TypeCheckFn = NodeEditor.Types.TypeCheckFn;

/** Canonical public name for the workflow editor. The legacy NodeEditor namespace/tag remains compatible. */
export const Workflow = NodeEditor.NodeEditor;
export type WorkflowOptions = NodeEditor.Interfaces.NodeEditorOptions;

export default Workflow;

export type WorkflowGraph=NodeEditor.Interfaces.Graph;
export type WorkflowClipboard=NodeEditor.Interfaces.Clipboard;
