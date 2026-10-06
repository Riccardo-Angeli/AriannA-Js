import {Definitions,MedicalDocument,readJSON,restRequest,type Schema,type RestRequest} from './Definitions.ts';
export {MedicalDocument,type MappingRule} from './Definitions.ts';
/** Construction against the supplied openEHR RM schema; no terminology guesses. */
export class OpenEHR extends Definitions{
 constructor(schema:Schema){super(schema,'_type');}
 static async load(schemaURL:string,fetcher:typeof fetch=fetch):Promise<OpenEHR>{return new OpenEHR(await readJSON(schemaURL,fetcher));}
 text(value:string){return{_type:'DV_TEXT',value};}
 code(value:string,terminology_id:string,code_string:string){return{_type:'DV_CODED_TEXT',value,defining_code:{terminology_id:{value:terminology_id},code_string}};}
 quantity(magnitude:number,units:string){return{_type:'DV_QUANTITY',magnitude,units};}
 dateTime(value:string){return{_type:'DV_DATE_TIME',value};}
 element(archetype_node_id:string,name:string,value:unknown){return{_type:'ELEMENT',archetype_node_id,name:this.text(name),value:structuredClone(value)};}
 composition(templateId:string,values:Record<string,any>):MedicalDocument{return this.create('COMPOSITION',{...values,archetype_details:{...values.archetype_details,template_id:{value:templateId}}});}
 /** Bind exact RM JSON paths. Template constraints and canonical values remain caller-owned. */
 fromTemplate(type:string,template:Record<string,any>,values:Record<string,unknown>):MedicalDocument{const document=this.create(type,template);for(const [path,value]of Object.entries(values))document.set(path,value);return document;}
 request(base:string,path:string,method='GET',data?:unknown):RestRequest{return restRequest(base,path,method,data);}
 commit(base:string,ehrId:string,composition:MedicalDocument|Record<string,any>,versionUid?:string):RestRequest{
  const request=this.request(base,'ehr/'+encodeURIComponent(ehrId)+'/composition'+(versionUid?'/'+encodeURIComponent(versionUid.split('::')[0]):''),versionUid?'PUT':'POST',composition instanceof MedicalDocument?composition.toJSON():composition);
  request.headers.Prefer='return=representation';if(versionUid)request.headers['If-Match']='W/"'+versionUid+'"';return request;
 }
 query(base:string,aql:string,query_parameters:Record<string,unknown>={}):RestRequest{return this.request(base,'query/aql','POST',{q:aql,query_parameters});}
 /** Application GraphQL facade descriptor, NOT an openEHR-defined endpoint. */
 graphqlRequest(endpoint:string,query:string,variables:Record<string,unknown>={}):RestRequest{if(!/^https?:\/\//.test(endpoint))throw new Error('Absolute GraphQL URL required');return{url:endpoint,method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({query,variables})};}
}
export default OpenEHR;
