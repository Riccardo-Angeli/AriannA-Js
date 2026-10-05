import { Component,Css,Templates } from '../../../../core/index.ts';
import Images,{type ImageAsset,type Tiling} from '../../../../additionals/Images.ts';
import MaterialsEditor3D,{type MaterialDef} from './MaterialsEditor3D.ts';
import type {Canvas3D} from '../Canvas3D.ts';
export interface LibraryMaterial {id:string;name:string;material:MaterialDef;}
export interface MaterialLibraryDocument {version:1;materials:LibraryMaterial[];assets:ImageAsset[];}
const xmlEscape=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const parseXML=(s:string)=>{if(/<!DOCTYPE|<!ENTITY/i.test(s))throw new Error('External entities are not supported');const doc=new DOMParser().parseFromString(s,'application/xml');if(doc.querySelector('parsererror'))throw new Error('Invalid XML');return doc;};
const defaults:Tiling={repeatX:1,repeatY:1,offsetX:0,offsetY:0,rotation:0,wrap:'repeat'};
const Styles=new Css.Stylesheet([
 new Css.Rule('arianna-materials-library-3d,.MaterialsLibrary3D',{Display:'block',Background:'#292d31',Color:'#e4e8eb',Border:'1px solid #15191d',BorderRadius:'8px',Padding:'10px',BoxSizing:'border-box',Font:'11px system-ui',Width:'660px',Height:'540px',MinWidth:'450px',MinHeight:'300px',Resize:'both',Overflow:'auto'}),
 new Css.Rule('.MaterialsLibrary3D header',{Background:'linear-gradient(180deg,#3a3f44,#2b3034)',Padding:'8px 10px',BorderBottom:'1px solid #111417',FontWeight:'800'}),
 new Css.Rule('.MaterialsLibrary3D[theme="light"] header',{Background:'linear-gradient(180deg,#fff,#e1e4e7)',BorderBottomColor:'#b9bec3'}),
 new Css.Rule('.MaterialsLibrary3D header,.MaterialsLibrary3D .actions',{Display:'flex',FlexWrap:'wrap',Gap:'5px',AlignItems:'center',MarginBottom:'8px'}),
 new Css.Rule('.MaterialsLibrary3D button,.MaterialsLibrary3D input,.MaterialsLibrary3D select',{Background:'linear-gradient(180deg,#41484e,#292f35)',Border:'1px solid #15191d',Color:'inherit',BorderRadius:'4px',Padding:'6px',Font:'inherit',MinWidth:'0'}),
 new Css.Rule('.MaterialsLibrary3D .library-work',{Display:'grid',GridTemplateColumns:'100px minmax(160px,1fr) 150px',Gap:'10px',MinHeight:'220px'}),
 new Css.Rule('.MaterialsLibrary3D nav',{Display:'flex',FlexDirection:'column',Gap:'5px',BorderRight:'1px solid #68717a',PaddingRight:'8px'}),
 new Css.Rule('.MaterialsLibrary3D button[aria-pressed="true"]',{Background:'linear-gradient(180deg,#ff53ad,#ba096b)',Color:'#fff'}),
 new Css.Rule('.MaterialsLibrary3D .library-center',{MinWidth:'0',Display:'grid',GridTemplateRows:'auto 1fr',Gap:'9px'}),
 new Css.Rule('.MaterialsLibrary3D .library-details',{OverflowWrap:'anywhere',FontSize:'10px',LineHeight:'1.7',BorderLeft:'1px solid #68717a',PaddingLeft:'8px'}),
 new Css.Rule('.MaterialsLibrary3D .materials',{Display:'grid',GridTemplateColumns:'repeat(3,minmax(0,1fr))',Gap:'7px'}),
 new Css.Rule('.MaterialsLibrary3D .material',{Cursor:'grab',Padding:'6px',TextAlign:'center',Border:'1px solid #68717a',BorderRadius:'5px',Overflow:'hidden'}),
 new Css.Rule('.MaterialsLibrary3D .material[aria-selected="true"]',{BorderColor:'#ff4dad',BoxShadow:'0 0 0 1px #e40c88'}),
 new Css.Rule('.MaterialsLibrary3D[theme="light"]',{Background:'#edf0f2',Color:'#25292d',BorderColor:'#bbc2c8'}),
 new Css.Rule('.MaterialsLibrary3D[theme="light"] button,.MaterialsLibrary3D[theme="light"] input,.MaterialsLibrary3D[theme="light"] select',{Background:'linear-gradient(180deg,#fff,#e0e5e9)',BorderColor:'#b7bec5'})
]);
@Component('arianna-materials-library-3d',Styles,{Shadow:false,Attributes:['theme','for'],Properties:['Editor','canvas']})
export class MaterialsLibrary3D extends HTMLElement {
 public template=Templates.Template.Html``;
 readonly Images=new Images();
 readonly Materials=new Map<string,LibraryMaterial>();
 public canvas:Canvas3D.Canvas3D|null=null;
 private editor:InstanceType<typeof MaterialsEditor3D>=new MaterialsEditor3D();
 private ownsEditor=true;
 private tilingRevisions=new Map<string,number>();
 private selected:string|null=null;
 private generation=0;
 private error='';
 private filter='';
 private category='All';
 constructor(options:{canvas?:Canvas3D.Canvas3D;editor?:InstanceType<typeof MaterialsEditor3D>;presets?:boolean}={}){super();this.canvas=options.canvas??null;if(options.editor)this.Editor=options.editor;else this.editor.library=this;if(options.presets!==false)this.presets();}
 public get Editor():InstanceType<typeof MaterialsEditor3D>{return this.editor;}
 public set Editor(editor:InstanceType<typeof MaterialsEditor3D>){if(this.editor?.library===this)this.editor.library=null;if(this.ownsEditor)this.editor.onUnmount();this.ownsEditor=false;this.editor=editor;editor.library=this;editor.refreshUI();this.refresh();}
 public onCreated():void{if(this.isConnected)this.onConnected();}
 public onConnected():void{this.classList.add('MaterialsLibrary3D');this.editor.library=this;this.refresh();}
 public onUnmount():void{++this.generation;if(this.ownsEditor)this.editor.onUnmount();}
 public dispose():void{this.onUnmount();if(this.editor.library===this)this.editor.library=null;this.Images.dispose();this.Materials.clear();this.tilingRevisions.clear();}
 public bind(canvas:Canvas3D.Canvas3D|null,editor?:InstanceType<typeof MaterialsEditor3D>):this{this.canvas=canvas;if(editor)this.Editor=editor;this.editor.bind(canvas);this.refresh();return this;}
 private viewport():Canvas3D.Canvas3D|null{return this.canvas??document.getElementById(this.getAttribute('for')||'') as Canvas3D.Canvas3D|null;}
 public addMaterial(material:MaterialDef,name='Material',id:string=crypto.randomUUID()):LibraryMaterial{this.validate(material);const record={id,name:String(name),material:structuredClone(material)};this.Materials.set(id,record);this.selected=id;this.refresh();this.changed();return record;}
 public removeMaterial(id:string):boolean{const ok=this.Materials.delete(id);if(this.selected===id)this.selected=null;this.refresh();this.changed();return ok;}
 public rename(id:string,name:string):void{const r=this.Materials.get(id);if(!r)throw new Error('Unknown material');r.name=String(name);this.refresh();this.changed();}
 public duplicate(id:string):LibraryMaterial{const r=this.Materials.get(id);if(!r)throw new Error('Unknown material');return this.addMaterial(r.material,r.name+' copy');}
 public select(id:string):void{if(!this.Materials.has(id))throw new Error('Unknown material');this.selected=id;this.refresh();}
 public edit(id:string):void{const r=this.Materials.get(id);if(!r)throw new Error('Unknown material');this.editor.material=structuredClone(r.material);this.select(id);}
 public apply(id:string,mesh:Canvas3D.Mesh3):void{const r=this.Materials.get(id);if(!r)throw new Error('Unknown material');mesh.userData.material=structuredClone(r.material);this.viewport()?.invalidate();this.dispatchEvent(new CustomEvent('arianna:material-apply',{bubbles:true,detail:{material:r,mesh}}));}
 private validate(m:MaterialDef):void{if(!m||!['basic','lambert','phong','standard','physical','toon','normal','wireframe'].includes(m.kind)||typeof m.color!=='string')throw new TypeError('Invalid material');for(const key of ['roughness','metalness','opacity'] as const)if(m[key]!==undefined&&(!Number.isFinite(m[key])||m[key]!<0||m[key]!>1))throw new TypeError('Invalid '+key);if(m.texture&&!/^data:image\/(png|jpeg);base64,/.test(m.texture.data))throw new Error('Invalid embedded texture');}
 private changed():void{this.dispatchEvent(new CustomEvent('arianna:materials-change',{bubbles:true,detail:{source:this}}));}
 public toDocument():MaterialLibraryDocument{return structuredClone({version:1,materials:[...this.Materials.values()],assets:[...this.Images.Assets.values()]});}
 public serialize(format:'json'|'xml'='json'):string{const json=JSON.stringify(this.toDocument(),null,2);return format==='json'?json:'<?xml version="1.0" encoding="UTF-8"?>\n<materials-library version="1"><data encoding="json">'+xmlEscape(json)+'</data></materials-library>';}
 public deserialize(text:string,format:'json'|'xml'='json',replace=false):void{
  const doc=JSON.parse(format==='json'?text:parseXML(text).querySelector('materials-library > data')?.textContent||'null') as MaterialLibraryDocument;
  if(doc?.version!==1||!Array.isArray(doc.materials)||!Array.isArray(doc.assets)||doc.materials.length>10000)throw new Error('Invalid material library document');
  const assets=new Images(),records=new Map<string,LibraryMaterial>();for(const a of doc.assets)assets.add(a);
  for(const r of doc.materials){if(typeof r.id!=='string'||typeof r.name!=='string'||records.has(r.id))throw new Error('Invalid material identity');this.validate(r.material);for(const map of Object.values(r.material.maps??{}))if(!assets.Assets.has(map.assetId)&&!this.Images.Assets.has(map.assetId))throw new Error('Missing texture asset '+map.assetId);records.set(r.id,structuredClone(r));}
  if(replace){this.Materials.clear();this.Images.Assets.clear();}for(const a of assets.Assets.values())this.Images.add(a);for(const [id,r]of records)this.Materials.set(id,r);this.refresh();this.changed();
 }
 public save(format:'json'|'xml'='json',filename='MaterialsLibrary3D',id?:string):void{let text=this.serialize(format);if(id){const material=this.Materials.get(id);if(!material)throw new Error('Unknown material');const assets=new Set(Object.values(material.material.maps??{}).map(m=>m.assetId)),json=JSON.stringify({version:1,materials:[material],assets:[...this.Images.Assets.values()].filter(a=>assets.has(a.id))},null,2);text=format==='json'?json:'<?xml version="1.0"?><materials-library version="1"><data encoding="json">'+xmlEscape(json)+'</data></materials-library>';}const blob=new Blob([text],{type:format==='json'?'application/json':'application/xml'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename+'.'+format;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 public async import(file:File,resources:File[]=[]):Promise<void>{
  if(file.size>64*1024*1024)throw new Error('File exceeds 64 MB');const ext=file.name.split('.').pop()!.toLowerCase(),generation=this.generation;
  if(ext==='json'||ext==='xml'){const text=await file.text();if(generation===this.generation)this.deserialize(text,ext);return;}
  if(ext==='mtlx'){const text=await file.text();if(generation===this.generation)await this.importMaterialX(text,resources);return;}
  if(!['png','jpg','jpeg','tif','tiff'].includes(ext))throw new Error('Unsupported asset '+ext);
  const asset=await this.Images.import(file);if(generation!==this.generation)return;
  this.addMaterial({kind:'standard',color:'#ffffff',roughness:.6,metalness:0,opacity:1,maps:{baseColor:{assetId:asset.id,tiling:{...defaults}}},texture:{data:asset.data}},file.name);
 }
 public async setTiling(id:string,tiling:Partial<Tiling>,role='baseColor'):Promise<void>{const r=this.Materials.get(id),map=r?.material.maps?.[role];if(!r||!map)throw new Error('Material has no '+role+' texture');const key=id+':'+role,revision=(this.tilingRevisions.get(key)??0)+1;this.tilingRevisions.set(key,revision);const next={...defaults,...map.tiling,...tiling},generation=this.generation,canvas=await this.Images.tile(map.assetId,next);if(generation!==this.generation||this.Materials.get(id)!==r||this.tilingRevisions.get(key)!==revision)return;map.tiling=next;if(role==='baseColor')r.material.texture={data:canvas.toDataURL('image/png')};this.refresh();this.changed();}
 public async importMaterialX(text:string,resources:File[]=[]):Promise<void>{
  const generation=this.generation,doc=parseXML(text);if(doc.documentElement.tagName!=='materialx')throw new Error('Not a MaterialX document');
  const shaders=[...doc.querySelectorAll('standard_surface')];if(!shaders.length)throw new Error('MaterialX import supports standard_surface shaders');
  for(const shader of shaders){const m:MaterialDef={kind:'physical',color:'#cccccc',roughness:.5,metalness:0,opacity:1,materialX:text,warnings:[]};
   for(const input of [...shader.children].filter(e=>e.tagName==='input')){
    const name=input.getAttribute('name'),value=input.getAttribute('value'),node=input.getAttribute('nodename');
    if(value!==null){const values=value.split(/[,\s]+/).filter(Boolean).map(Number);if(!values.length||!values.every(Number.isFinite)){m.warnings!.push('Unmapped input: '+name);continue;}if(name==='base_color'&&values.length===3)m.color='#'+values.map(n=>Math.round(Math.max(0,Math.min(1,n))*255).toString(16).padStart(2,'0')).join('');else if(name==='metalness')m.metalness=values[0];else if(name==='specular_roughness')m.roughness=values[0];else if(name==='opacity')m.opacity=values.length===3?values.reduce((a,b)=>a+b,0)/3:values[0];else m.warnings!.push('Parameter preserved but not rendered: '+name);}
    if(value===null&&!node)m.warnings!.push('Unsupported graph input: '+name);
    if(node){const image=[...doc.querySelectorAll('image,tiledimage')].find(e=>e.getAttribute('name')===node);const path=image?[...image.children].find(e=>e.getAttribute('name')==='file')?.getAttribute('value'):null;
     const matches=path?resources.filter(f=>f.name===path.split(/[\\/]/).pop()):[];if(matches.length===1){const asset=await this.Images.import(matches[0]),role=name==='base_color'?'baseColor':String(name);(m.maps??={})[role]={assetId:asset.id,tiling:{...defaults}};if(role==='baseColor')m.texture={data:asset.data};else m.warnings!.push('Texture retained as metadata: '+role);}else m.warnings!.push('Unresolved node/resource: '+node+(path?' ('+path+')':''));}
   }if(generation!==this.generation)return;this.addMaterial(m,shader.getAttribute('name')||'MaterialX');
  }
 }
 private presets():void{for(const [name,color,metalness,roughness,opacity]of [['Chrome','#cbd1d8',1,.12,1],['Gold','#dfb44b',1,.25,1],['Copper','#b86e48',1,.3,1],['Steel','#8995a1',1,.4,1],['Plastic','#e40c88',0,.35,1],['Rubber','#25282c',0,.9,1],['Ceramic','#f0ede4',0,.18,1],['Glass','#b6e0ee',0,.05,.3],['Concrete','#8b8984',0,.95,1],['Wood','#9b643c',0,.72,1],['Fabric','#5d6899',0,.98,1],['Matte white','#eeeeee',0,1,1]] as [string,string,number,number,number][]){const id='preset-'+name.toLowerCase().replace(/ /g,'-');this.Materials.set(id,{id,name,material:{kind:'standard',color,metalness,roughness,opacity}});}}
 public refresh():void{
  if(!this.isConnected)return;this.replaceChildren();const title=document.createElement('header');title.textContent='MaterialsLibrary3D';this.appendChild(title);
  title.style.cursor='move';title.style.touchAction='none';let drag:{id:number;x:number;y:number;left:number;top:number}|null=null;
  title.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:this.offsetLeft,top:this.offsetTop};this.style.position='absolute';this.style.right='auto';this.style.left=drag.left+'px';this.style.top=drag.top+'px';title.setPointerCapture(e.pointerId);};
  title.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;const parent=this.offsetParent as HTMLElement|null;this.style.left=Math.max(0,Math.min(Math.max(0,(parent?.clientWidth??Infinity)-this.offsetWidth),drag.left+e.clientX-drag.x))+'px';this.style.top=Math.max(0,Math.min(Math.max(0,(parent?.clientHeight??Infinity)-this.offsetHeight),drag.top+e.clientY-drag.y))+'px';};
  title.onpointerup=title.onpointercancel=e=>{if(drag?.id===e.pointerId){try{title.releasePointerCapture(e.pointerId);}catch{}drag=null;}};
  const actions=document.createElement('div');actions.className='actions';this.appendChild(actions);
  const button=(text:string,fn:()=>unknown)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=()=>{try{Promise.resolve(fn()).catch(e=>{this.error=String(e.message||e);this.refresh();});}catch(e){this.error=String(e);this.refresh();}};actions.appendChild(b);};
  button('Save from editor',()=>this.addMaterial(this.editor.material,'Material'));button('JSON',()=>this.save('json'));button('XML',()=>this.save('xml'));
  const picker=document.createElement('input');picker.type='file';picker.multiple=true;picker.accept='.json,.xml,.mtlx,.png,.jpg,.jpeg,.tif,.tiff';picker.hidden=true;
  picker.onchange=async()=>{const files=[...picker.files??[]];try{for(const file of files.filter(f=>/\.(json|xml|mtlx)$/i.test(f.name)))await this.import(file,files);if(!files.some(f=>/\.mtlx$/i.test(f.name)))for(const file of files.filter(f=>/\.(png|jpe?g|tiff?)$/i.test(f.name)))await this.import(file);this.error='';}catch(e){this.error=String(e);}this.refresh();};this.appendChild(picker);button('Import',()=>picker.click());
  const selected=this.selected&&this.Materials.get(this.selected);if(selected){button('Save material JSON',()=>this.save('json',selected.name,selected.id));button('Save material XML',()=>this.save('xml',selected.name,selected.id));button('Edit',()=>this.edit(selected.id));button('Duplicate',()=>this.duplicate(selected.id));button('Delete',()=>this.removeMaterial(selected.id));const rename=document.createElement('input');rename.value=selected.name;rename.setAttribute('aria-label','Material name');rename.onchange=()=>this.rename(selected.id,rename.value);actions.appendChild(rename);
   const map=selected.material.maps?.baseColor;if(map){for(const key of ['repeatX','repeatY','offsetX','offsetY','rotation'] as const){const label=document.createElement('label');label.textContent=key;const field=document.createElement('input');field.type='number';field.step='.1';field.value=String(map.tiling?.[key]??defaults[key]);field.style.width='50px';field.onchange=()=>{this.setTiling(selected.id,{[key]:Number(field.value)}).catch(e=>{this.error=String(e);this.refresh();});};label.appendChild(field);actions.appendChild(label);}const wrap=document.createElement('select');for(const name of ['repeat','mirror','clamp']){const o=document.createElement('option');o.value=name;o.textContent=name;wrap.appendChild(o);}wrap.value=map.tiling?.wrap??'repeat';wrap.onchange=()=>{this.setTiling(selected.id,{wrap:wrap.value as Tiling['wrap']}).catch(e=>{this.error=String(e);this.refresh();});};actions.appendChild(wrap);}}
  const work=document.createElement('div');work.className='library-work';this.appendChild(work);
  const categories=document.createElement('nav');categories.setAttribute('aria-label','Material categories');work.appendChild(categories);
  for(const category of ['All','Textured','Metal','Transparent','Other']){const b=document.createElement('button');b.type='button';b.textContent=category;b.setAttribute('aria-pressed',String(category===this.category));b.onclick=()=>{this.category=category;this.refresh();};categories.appendChild(b);}
  const center=document.createElement('div');center.className='library-center';work.appendChild(center);
  const search=document.createElement('input');search.placeholder='Search materials';search.setAttribute('aria-label','Search materials');search.value=this.filter;center.appendChild(search);
  const cards=document.createElement('div');cards.className='materials';cards.setAttribute('role','listbox');cards.setAttribute('aria-label','Materials');center.appendChild(cards);
  const details=document.createElement('aside');details.className='library-details';work.appendChild(details);
  if(selected){const name=document.createElement('strong');name.textContent=selected.name;details.appendChild(name);for(const [key,value]of Object.entries(selected.material)){if(['texture','materialX'].includes(key))continue;const line=document.createElement('div');line.textContent=key+': '+(typeof value==='object'?JSON.stringify(value):String(value));details.appendChild(line);}}else details.textContent='Select a material';
  const visible=(r:LibraryMaterial)=>r.name.toLowerCase().includes(this.filter.toLowerCase())&&(this.category==='All'||(this.category==='Textured'?!!r.material.texture:this.category==='Metal'?(r.material.metalness??0)>=.5:this.category==='Transparent'?(r.material.opacity??1)<1:!r.material.texture&&(r.material.metalness??0)<.5&&(r.material.opacity??1)>=1));
  search.oninput=()=>{this.filter=search.value;for(const card of Array.from(cards.children) as HTMLElement[]){const record=this.Materials.get(card.dataset.id!);card.hidden=!record||!visible(record);}};
this.editor.setDragViewport(this.viewport());
  for(const r of this.Materials.values()){const card=document.createElement('div');card.className='material';card.dataset.id=r.id;card.hidden=!visible(r);card.setAttribute('role','option');card.tabIndex=0;card.setAttribute('aria-selected',String(r.id===this.selected));const swatch=document.createElement('div');swatch.style.cssText='height:45px;width:45px;margin:0 auto 5px;border-radius:50%;box-shadow:inset -7px -8px 10px #0007';swatch.style.background='radial-gradient(circle at 32% 25%,#fff,'+r.material.color+' 28%,#111 94%)';if(r.material.texture)swatch.style.backgroundImage='url("'+r.material.texture.data+'")';const label=document.createElement('div');label.textContent=r.name;card.append(swatch,label);card.onclick=()=>this.select(r.id);card.onkeydown=e=>{if(e.key==='Enter')this.edit(r.id);};card.ondblclick=()=>this.edit(r.id);this.editor.attachMaterialDrag(card,()=>r.material);cards.appendChild(card);}
  const status=document.createElement('div');status.setAttribute('role','status');status.textContent=this.error||(selected?selected.material.warnings?.join(' · '):'')||'Drag a material onto a mesh. Double click to edit.';this.appendChild(status);
 }
}
export default MaterialsLibrary3D;
