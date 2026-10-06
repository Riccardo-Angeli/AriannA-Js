/** Schema-driven document construction. No clinical validation or terminology inference. */
export type Json= null|boolean|number|string|Json[]|{[key:string]:Json};
export type Schema=Record<string,any>;
export interface MappingRule {from?:string;to:string;value?:unknown;default?:unknown;transform?:(value:any,source:any)=>unknown;}
const forbidden=new Set(['__proto__','prototype','constructor']);
export function pathParts(path:string):string[]{
 const parts=path===''?[]:path.startsWith('/')?path.slice(1).split('/').map(p=>p.replace(/~1/g,'/').replace(/~0/g,'~')):path.replace(/\[(\d+)\]/g,'.$1').split('.');
 if(parts.some(p=>!p||forbidden.has(p)))throw new Error('Unsafe/empty document path');return parts;
}
export function getValue(object:any,path:string):any{return pathParts(path).reduce((o,p)=>o!=null&&Object.prototype.hasOwnProperty.call(o,p)?o[p]:undefined,object);}
export function setValue(object:any,path:string,value:unknown):void{
 const parts=pathParts(path);if(!parts.length)throw new Error('Use create to replace the document root');let at=object;
 for(let i=0;i<parts.length;i++){const key=parts[i];if(/^\d+$/.test(key)&&Number(key)>100000)throw new Error('Array index exceeds construction limit');if(i===parts.length-1){at[key]=structuredClone(value);return;}
  const array=/^\d+$/.test(parts[i+1]);if(at[key]===undefined)at[key]=array?[]:{};
  if(at[key]===null||typeof at[key]!=='object')throw new Error('Path crosses scalar: '+parts.slice(0,i+1).join('.'));at=at[key];
 }
}
export class MedicalDocument<T extends Record<string,any>=Record<string,any>>{
 constructor(private readonly data:T){}
 set(path:string,value:unknown):this{setValue(this.data,path,value);return this;}
 get(path:string):unknown{return structuredClone(getValue(this.data,path));}
 append(path:string,value:unknown):this{const current=getValue(this.data,path);if(current===undefined)this.set(path,[]);const list=getValue(this.data,path);if(!Array.isArray(list))throw new Error('Expected array: '+path);list.push(structuredClone(value));return this;}
 toJSON():T{return structuredClone(this.data);}
 toString(space=2):string{return JSON.stringify(this.data,null,space);}
}
export class Definitions {
 readonly definitions:Record<string,Schema>;
 constructor(readonly schema:Schema,readonly discriminator?:'resourceType'|'_type'){this.definitions=schema.definitions??schema.$defs??{};}
 register(type:string,schema:Schema):this{if(!/^[A-Za-z][A-Za-z0-9_]*$/.test(type)||forbidden.has(type))throw new Error('Invalid definition name');this.definitions[type]=structuredClone(schema);return this;}
 types():string[]{return Object.keys(this.definitions).sort();}
 definition(type:string):Schema{const d=this.definitions[type];if(!d)throw new Error('Unknown schema type '+type);return structuredClone(d);}
 fields(type:string){const d=this.definition(type);return Object.entries(d.properties??{}).map(([name,schema])=>({name,required:(d.required??[]).includes(name),schema:structuredClone(schema)}));}
 create(type:string,values:Record<string,any>={}):MedicalDocument{
  const schema=this.definition(type),data=structuredClone(values);
  if(this.discriminator==='_type')data._type=type;
  if(this.discriminator==='resourceType'&&schema.properties?.resourceType?.const===type)data.resourceType=type;
  return new MedicalDocument(data);
 }
 map(type:string,source:unknown,rules:MappingRule[],initial:Record<string,any>={}):MedicalDocument{
  const result=this.create(type,initial);
  for(const rule of rules){let value=Object.prototype.hasOwnProperty.call(rule,'value')?rule.value:rule.from===undefined?undefined:getValue(source,rule.from);
   if(value===undefined)value=rule.default;if(rule.transform)value=rule.transform(value,source);if(value!==undefined)result.set(rule.to,value);
  }return result;
 }
 compile(type:string,rules:MappingRule[],initial:Record<string,any>={}){this.definition(type);const copy=rules.map(r=>({...r}));return(source:unknown)=>this.map(type,source,copy,initial).toJSON();}
 mapMany(type:string,records:unknown[],rules:MappingRule[]):Record<string,any>[]{const fn=this.compile(type,rules);return records.map(fn);}
 /** REST/JSON payload: unknown extension fields are preserved, not silently stripped. */
 serialize(document:MedicalDocument|Record<string,any>,space=0):string{return JSON.stringify(document instanceof MedicalDocument?document.toJSON():document,null,space);}
 deserialize(json:string):MedicalDocument{const data=JSON.parse(json);if(!data||Array.isArray(data)||typeof data!=='object')throw new Error('Expected a JSON document');return new MedicalDocument(data);}
}
export async function readJSON(url:string,fetcher:typeof fetch=fetch):Promise<Schema>{const response=await fetcher(url);if(!response.ok)throw new Error('Schema HTTP '+response.status);return response.json();}
export interface RestRequest{url:string;method:string;headers:Record<string,string>;body?:string;}
export function restRequest(base:string,path:string,method:string,data?:unknown,media='application/json'):RestRequest{
 if(!/^https?:\/\//.test(base))throw new Error('Absolute HTTP(S) base URL required');
 return{url:base.replace(/\/$/,'')+'/'+path.replace(/^\//,''),method,headers:{Accept:media,...(data===undefined?{}:{'Content-Type':media})},...(data===undefined?{}:{body:JSON.stringify(data)})};
}
