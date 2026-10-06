import {Definitions,MedicalDocument,readJSON,restRequest,type Schema,type RestRequest} from './Definitions.ts';
export {MedicalDocument,type MappingRule} from './Definitions.ts';
/** FHIR R5 definitions and payload builder; official definitions are loaded explicitly. */
export class Fhir extends Definitions{
 static readonly Version='5.0.0';
 constructor(schema:Schema){super(schema,'resourceType');}
 static async load(schemaURL:string,fetcher:typeof fetch=fetch):Promise<Fhir>{return new Fhir(await readJSON(schemaURL,fetcher));}
 resources():string[]{return this.types().filter(t=>this.definitions[t].properties?.resourceType?.const===t);}
 reference(resource:Record<string,any>,display?:string){if(!resource.resourceType||!resource.id)throw new Error('Reference requires resourceType and id');return{reference:resource.resourceType+'/'+resource.id,...(display?{display}:{})};}
 coding(system:string,code:string,display?:string){return{system,code,...(display?{display}:{})};}
 codeableConcept(system:string,code:string,display?:string,text?:string){return{coding:[this.coding(system,code,display)],...(text?{text}:{})};}
 quantity(value:number,unit:string,system='http://unitsofmeasure.org',code=unit){return{value,unit,system,code};}
 identifier(system:string,value:string){return{system,value};}
 extension(url:string,valueType:string,value:unknown){if(!/^[A-Z][A-Za-z0-9]*$/.test(valueType))throw new Error('Use a FHIR choice suffix, e.g. String or Quantity');return{url,['value'+valueType]:structuredClone(value)};}
 bundle(resources:Record<string,any>[],type='collection'):MedicalDocument{return this.create('Bundle',{type,entry:resources.map(resource=>({resource:structuredClone(resource)}))});}
 document(composition:Record<string,any>,resources:Record<string,any>[],identifier:{system:string;value:string},timestamp:string,baseURL:string):MedicalDocument{
  if(!/^https?:\/\//.test(baseURL))throw new Error('Document bundle requires an absolute resource baseURL');
  return this.create('Bundle',{type:'document',identifier,timestamp,entry:[composition,...resources].map(resource=>({...(resource.id?{fullUrl:baseURL.replace(/\/$/,'')+'/'+resource.resourceType+'/'+resource.id}:{}),resource:structuredClone(resource)}))});
 }
 transaction(entries:{resource?:Record<string,any>;method:string;url:string;fullUrl?:string;headers?:Record<string,string>}[]):MedicalDocument{return this.create('Bundle',{type:'transaction',entry:entries.map(e=>({...(e.resource?{resource:structuredClone(e.resource)}:{}),...(e.fullUrl?{fullUrl:e.fullUrl}:{}),request:{method:e.method,url:e.url,...e.headers}}))});}
 request(base:string,resource:string,method='GET',data?:unknown,id?:string):RestRequest{
  if(resource&&!this.resources().includes(resource))throw new Error('Unknown FHIR resource '+resource);
  return restRequest(base,resource+(id?'/'+encodeURIComponent(id):''),method,data,'application/fhir+json');
 }
 search(base:string,resource:string,params:Record<string,string|string[]>):RestRequest{const request=this.request(base,resource);const q=new URLSearchParams();for(const [key,v]of Object.entries(params))for(const value of Array.isArray(v)?v:[v])q.append(key,value);request.url+='?'+q;return request;}
 operation(base:string,name:string,parameters?:unknown,resource?:string,id?:string):RestRequest{if(!/^[A-Za-z][\w-]*$/.test(name))throw new Error('Invalid operation name');return restRequest(base,(resource?encodeURIComponent(resource)+'/':'')+(id?encodeURIComponent(id)+'/':'')+'$'+name,parameters===undefined?'GET':'POST',parameters,'application/fhir+json');}
 graphqlRequest(base:string,query:string,variables:Record<string,unknown>={},resource?:string,id?:string):RestRequest{return restRequest(base,(resource&&id?encodeURIComponent(resource)+'/'+encodeURIComponent(id)+'/':'')+'$graphql','POST',{query,variables});}
}
export default Fhir;
