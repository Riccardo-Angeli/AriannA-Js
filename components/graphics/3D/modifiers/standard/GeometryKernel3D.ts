/** Bounded, deterministic geometry operations. Coordinates and distances are local-space.
 * @author Riccardo Angeli @license MIT / Commercial (dual license)
 */
import {Modifier3D as B} from '../Base.ts';
export type V = B.Interfaces.Vec3Like;
export type P = {x:number;y:number};
export type G = B.Interfaces.Geometry3Like;
export interface Options {
 axis?:'x'|'y'|'z'; angle?:number; direction?:number; lower?:number; upper?:number; limits?:boolean;
 amount?:number; outline?:number; curve?:number; bias?:number; symmetric?:boolean; radial?:number;
 iterations?:number; factor?:number; boundaries?:boolean;
 seed?:number; scale?:number; strength?:V; octaves?:number; roughness?:number; phase?:number;
 offset?:number; copy?:boolean; profile?:P[]; path?:V[]; sections?:V[][];
 closed?:boolean; closedPath?:boolean; cap?:boolean; segments?:number; twist?:number;
 levels?:Array<{height:number;outline:number}>; bevelProfile?:P[];
 samples?:number; steps?:number; flip?:boolean;
}
export const MAX_VERTICES=120000, MAX_TRIANGLES=160000;
const EPS=1e-9;
export const add=(a:V,b:V):V=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
export const sub=(a:V,b:V):V=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
export const mul=(a:V,t:number):V=>({x:a.x*t,y:a.y*t,z:a.z*t});
export const dot=(a:V,b:V)=>a.x*b.x+a.y*b.y+a.z*b.z;
export const cross=(a:V,b:V):V=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
export const length=(a:V)=>Math.hypot(a.x,a.y,a.z);
export const norm=(a:V):V=>{const n=length(a);if(n<EPS)throw new RangeError('Degenerate direction');return mul(a,1/n);};
export const mix=(a:V,b:V,t:number)=>add(mul(a,1-t),mul(b,t));
export function finite(n:number,name='parameter'):number{if(!Number.isFinite(n))throw new RangeError(name+' must be finite');return n;}
export function count(n:number,min:number,max:number):number{finite(n);if(n<min||n>max)throw new RangeError(`Count must be ${min}…${max}`);return Math.floor(n);}
export function budget(vertices:number,triangles:number):void{if(vertices>MAX_VERTICES||triangles>MAX_TRIANGLES)throw new RangeError('Geometry budget exceeded; reduce samples/iterations');}
export function geometry(vertices:V[],indices:number[],uvs?:P[]):G {
 budget(vertices.length,indices.length/3);
 for(const v of vertices){finite(v.x,'vertex.x');finite(v.y,'vertex.y');finite(v.z,'vertex.z');}
 for(const i of indices)if(!Number.isInteger(i)||i<0||i>=vertices.length)throw new RangeError('Invalid vertex index');
 const g:G={vertices,normals:[],indices,uvs,clone(){return B._cloneGeom(this);}};B._recomputeNormals(g);return g;
}
function axes(axis:Options['axis']='y'):['x'|'y'|'z','x'|'y'|'z','x'|'y'|'z']{return axis==='x'?['x','y','z']:axis==='z'?['z','x','y']:['y','z','x'];}
function range(g:G,a:'x'|'y'|'z',o:Options):[number,number]{let lo=Infinity,hi=-Infinity;for(const p of g.vertices){lo=Math.min(lo,p[a]);hi=Math.max(hi,p[a]);}if(o.limits){lo=finite(o.lower??lo);hi=finite(o.upper??hi);}if(hi<lo)throw new RangeError('Upper limit must be ≥ lower limit');return [lo,hi];}
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export function deform(g:G,kind:'bend'|'twist'|'taper'|'squeeze'|'push'|'noise',o:Options):G {
 const out=B._cloneGeom(g),[a,b,c]=axes(o.axis);if(!g.vertices.length)return out;
 const [lo,hi]=range(g,a,o),span=Math.max(EPS,hi-lo),mid=(lo+hi)/2;
 const angle=finite(o.angle??0),amount=finite(o.amount??0),curve=finite(o.curve??0);
 if(kind==='push'&&out.normals.length!==out.vertices.length)B._recomputeNormals(out);
 const direction=finite(o.direction??0),cs=Math.cos(direction),sn=Math.sin(direction);
 for(let i=0;i<g.vertices.length;i++) {
  const v=g.vertices[i],p=out.vertices[i],h=clamp(v[a],lo,hi),t=(h-lo)/span;
  if(kind==='bend'&&Math.abs(angle)>EPS&&span>EPS){
   const k=angle/span,theta=(h-lo)*k,x=v[b]*cs+v[c]*sn,y=-v[b]*sn+v[c]*cs;
   // Tangent continuation outside limits avoids kinks and discontinuities.
   const d=v[a]-h,nx=(1-Math.cos(theta))/k+x*Math.cos(theta)+d*Math.sin(theta);
   p[a]=lo+Math.sin(theta)/k-x*Math.sin(theta)+d*Math.cos(theta);
   p[b]=nx*cs-y*sn;p[c]=nx*sn+y*cs;
  } else if(kind==='twist') {
   const power=Math.pow(2,clamp(finite(o.bias??0),-100,100)/25),theta=angle*Math.pow(t,power);
   p[b]=v[b]*Math.cos(theta)-v[c]*Math.sin(theta);p[c]=v[b]*Math.sin(theta)+v[c]*Math.cos(theta);
  } else if(kind==='taper') {
   const u=o.symmetric?Math.abs(2*t-1):t,s=1+amount*u+curve*4*u*(1-u);p[b]*=s;p[c]*=s;
  } else if(kind==='squeeze') {
   const u=2*t-1,envelope=Math.pow(Math.max(0,1-u*u),Math.max(.1,1+curve));
   const s=Math.exp(clamp((o.radial??amount)*envelope,-10,10));p[b]*=s;p[c]*=s;
   p[a]=v[a]+(h-mid)*amount*envelope;
  } else if(kind==='push') {const n=out.normals[i]??{x:0,y:0,z:0};out.vertices[i]=add(v,mul(n,amount));}
  else if(kind==='noise') {
   const scale=finite(o.scale??1);if(scale<=0)throw new RangeError('Noise scale must be positive');
   const strength=o.strength??{x:amount,y:amount,z:amount},oct=count(o.octaves??1,1,8),rough=clamp(finite(o.roughness??.5),0,1),phase=finite(o.phase??0);
   for(const [axis,shift] of [['x',0],['y',317],['z',631]] as const){let amp=1,freq=1,value=0,total=0;for(let j=0;j<oct;j++){value+=amp*noise(v.x/scale*freq+phase,v.y/scale*freq,v.z/scale*freq,(o.seed??1)+shift);total+=amp;amp*=rough;freq*=2;}p[axis]+=finite(strength[axis])*value/total;}
  }
 }
 B._recomputeNormals(out);return out;
}
function noise(x:number,y:number,z:number,seed:number):number{
 const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z),fade=(t:number)=>t*t*t*(t*(t*6-15)+10),u=fade(x-ix),v=fade(y-iy),w=fade(z-iz);
 const hash=(a:number,b:number,c:number)=>{let n=Math.imul(a,374761393)^Math.imul(b,668265263)^Math.imul(c,2147483647)^(seed|0);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/2147483647.5-1;};
 let r=0;for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let c=0;c<2;c++)r+=hash(ix+a,iy+b,iz+c)*(a?u:1-u)*(b?v:1-v)*(c?w:1-w);return r;
}
export function mirror(g:G,o:Options):G{
 const a=o.axis??'x',offset=finite(o.offset??0),v=o.copy?g.vertices.map(p=>({...p})):[],n=v.length;
 v.push(...g.vertices.map(p=>({...p,[a]:2*offset-p[a]})));const indices=o.copy?[...g.indices]:[];
 for(let i=0;i<g.indices.length;i+=3)indices.push(n+g.indices[i],n+g.indices[i+2],n+g.indices[i+1]);
 const uv=g.uvs?.map(p=>Array.isArray(p)?{x:p[0],y:p[1]}:{...p});return geometry(v,indices,uv?(o.copy?[...uv,...uv.map(p=>({...p}))]:uv):undefined);
}
const edgeKey=(a:number,b:number)=>a<b?a+':'+b:b+':'+a;
export function subdivide(input:G,o:Options,smooth=false):G{
 let g=B._cloneGeom(input);const iterations=count(o.iterations??1,0,6);budget(g.vertices.length+g.indices.length*Math.pow(4,iterations)/3,g.indices.length/3*Math.pow(4,iterations));
 for(let iteration=0;iteration<iterations;iteration++){
  const edges=new Map<string,{a:number;b:number;op:number[];index:number}>(),neighbors=g.vertices.map(()=>new Set<number>());
  for(let i=0;i<g.indices.length;i+=3){const f=g.indices.slice(i,i+3);for(let j=0;j<3;j++){const a=f[j],b=f[(j+1)%3],c=f[(j+2)%3],key=edgeKey(a,b);let e=edges.get(key);if(!e){e={a,b,op:[],index:0};edges.set(key,e);}e.op.push(c);if(e.op.length>2)throw new RangeError('Subdivision requires a manifold mesh');neighbors[a].add(b);neighbors[b].add(a);}}
  const boundary=g.vertices.map(()=>[] as number[]);for(const e of edges.values())if(e.op.length===1){boundary[e.a].push(e.b);boundary[e.b].push(e.a);}
  const vertices=g.vertices.map((p,i)=>{
   if(!smooth)return {...p};const b=boundary[i];if(b.length){if(o.boundaries===false||b.length!==2)return {...p};return add(mul(p,.75),mul(add(g.vertices[b[0]],g.vertices[b[1]]),.125));}
   const ns=[...neighbors[i]],n=ns.length;if(n<3)return {...p};const beta=(5/8-Math.pow(3/8+Math.cos(2*Math.PI/n)/4,2))/n;return add(mul(p,1-n*beta),mul(ns.reduce((v,j)=>add(v,g.vertices[j]),{x:0,y:0,z:0}),beta));
  });
  const uvs=g.uvs?.map(p=>Array.isArray(p)?{x:p[0],y:p[1]}:{...p});
  for(const e of edges.values()){e.index=vertices.length;vertices.push(smooth&&e.op.length===2?add(mul(add(g.vertices[e.a],g.vertices[e.b]),.375),mul(add(g.vertices[e.op[0]],g.vertices[e.op[1]]),.125)):mix(g.vertices[e.a],g.vertices[e.b],.5));if(uvs){const a=uvs[e.a],b=uvs[e.b];uvs.push({x:(a.x+b.x)/2,y:(a.y+b.y)/2});}}
  const idx:number[]=[];for(let i=0;i<g.indices.length;i+=3){const [a,b,c]=g.indices.slice(i,i+3),ab=edges.get(edgeKey(a,b))!.index,bc=edges.get(edgeKey(b,c))!.index,ca=edges.get(edgeKey(c,a))!.index;idx.push(a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca);}g=geometry(vertices,idx,uvs);
 }
 return g;
}
export function relax(g:G,o:Options):G{
 const out=B._cloneGeom(g),neighbors=g.vertices.map(()=>new Set<number>()),edges=new Map<string,number>();
 for(let i=0;i<g.indices.length;i+=3)for(let j=0;j<3;j++){const a=g.indices[i+j],b=g.indices[i+(j+1)%3];neighbors[a].add(b);neighbors[b].add(a);const k=edgeKey(a,b);edges.set(k,(edges.get(k)??0)+1);}
 const boundary=new Set<number>();for(const[k,n]of edges)if(n===1)k.split(':').forEach(v=>boundary.add(+v));const f=clamp(finite(o.factor??.3),-1,1);
 for(let step=0;step<count(o.iterations??1,0,50);step++){const old=out.vertices;out.vertices=old.map((p,i)=>{if(!neighbors[i].size||(o.boundaries!==false&&boundary.has(i)))return {...p};const average=mul([...neighbors[i]].reduce((a,j)=>add(a,old[j]),{x:0,y:0,z:0}),1/neighbors[i].size);return mix(p,average,f);});}B._recomputeNormals(out);return out;
}
const turn=(a:P,b:P,c:P)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
export function profile(points:P[]):P[]{
 if(points.length>2048)throw new RangeError('Profile has too many points');let p=points.map(v=>({x:finite(v.x),y:finite(v.y)}));
 if(p.length>1&&Math.hypot(p[0].x-p.at(-1)!.x,p[0].y-p.at(-1)!.y)<EPS)p.pop();
 if(p.length<3)throw new RangeError('A closed profile requires at least three points');
 for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];if(Math.hypot(a.x-b.x,a.y-b.y)<EPS)throw new RangeError('Duplicate profile points');for(let j=i+2;j<p.length;j++){if(i===0&&j===p.length-1)continue;const c=p[j],d=p[(j+1)%p.length];if(turn(a,b,c)*turn(a,b,d)<0&&turn(c,d,a)*turn(c,d,b)<0)throw new RangeError('Self-intersecting profile');}}
 const area=p.reduce((s,a,i)=>s+a.x*p[(i+1)%p.length].y-a.y*p[(i+1)%p.length].x,0);if(Math.abs(area)<EPS)throw new RangeError('Profile area is zero');if(area<0)p.reverse();return p;
}
export function triangulate(p:P[]):number[]{
 const active=p.map((_,i)=>i),out:number[]=[];let guard=p.length*p.length;
 while(active.length>3&&guard-->0){let found=false;for(let j=0;j<active.length;j++){const a=active[(j+active.length-1)%active.length],b=active[j],c=active[(j+1)%active.length];if(turn(p[a],p[b],p[c])<=EPS)continue;const occupied=active.some(k=>k!==a&&k!==b&&k!==c&&turn(p[a],p[b],p[k])>=-EPS&&turn(p[b],p[c],p[k])>=-EPS&&turn(p[c],p[a],p[k])>=-EPS);if(occupied)continue;out.push(a,b,c);active.splice(j,1);found=true;break;}if(!found)throw new RangeError('Profile cannot be triangulated; remove collinear or overlapping edges');}
 if(active.length===3)out.push(...active);return out;
}
export function offsetProfile(p:P[],distance:number):P[]{
 const result=p.map((b,i)=>{const a=p[(i+p.length-1)%p.length],c=p[(i+1)%p.length],ab={x:b.x-a.x,y:b.y-a.y},bc={x:c.x-b.x,y:c.y-b.y},l=Math.hypot(ab.x,ab.y),m=Math.hypot(bc.x,bc.y),n={x:ab.y/l,y:-ab.x/l},q={x:bc.y/m,y:-bc.x/m},den=1+n.x*q.x+n.y*q.y;if(den<EPS)throw new RangeError('Offset has a reversing corner');return{x:b.x+distance*(n.x+q.x)/den,y:b.y+distance*(n.y+q.y)/den};});
 // Reject collapsed/inverted rings rather than silently creating bad triangles.
 for(let i=0;i<p.length;i++){const j=(i+1)%p.length;if((result[j].x-result[i].x)*(p[j].x-p[i].x)+(result[j].y-result[i].y)*(p[j].y-p[i].y)<=EPS)throw new RangeError('Offset collapsed an edge');}
 const checked=profile(result);if(turn(result[0],result[1],result[2])*turn(checked[0],checked[1],checked[2])<0)throw new RangeError('Offset collapsed the profile');return result;
}
export function extrude(o:Options):G{
 const p=profile(o.profile??[]),segments=count(o.segments??1,1,256),amount=finite(o.amount??1);
 const levels=o.bevelProfile?.map(v=>({height:v.y,outline:v.x}))??o.levels??Array.from({length:segments+1},(_,i)=>({height:amount*i/segments,outline:0}));
 if(levels.length<2||levels.length>512)throw new RangeError('Extrusion requires 2…512 levels');budget(p.length*levels.length,(p.length*2)*(levels.length-1)+2*(p.length-2));
 const vertices:V[]=[],uvs:P[]=[],indices:number[]=[],n=p.length;
 for(let j=0;j<levels.length;j++){const l=levels[j],ring=offsetProfile(p,finite(l.outline));for(let i=0;i<n;i++){vertices.push({x:ring[i].x,y:finite(l.height),z:-ring[i].y});uvs.push({x:i/n,y:j/(levels.length-1)});}}
 for(let j=0;j<levels.length-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=b+n,d=a+n;indices.push(a,b,d,b,c,d);}
 if(o.cap!==false){const cap=triangulate(p),end=(levels.length-1)*n;for(let i=0;i<cap.length;i+=3){const[a,b,c]=cap.slice(i,i+3);indices.push(c,b,a,end+a,end+b,end+c);}}
 if(levels.at(-1)!.height<levels[0].height)for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
 return geometry(vertices,indices,uvs);
}
function rotate(v:V,axis:V,angle:number):V{return add(add(mul(v,Math.cos(angle)),mul(cross(axis,v),Math.sin(angle))),mul(axis,dot(axis,v)*(1-Math.cos(angle))));}
export function sweep(o:Options):G {
 const p=profile(o.profile??[]),path=(o.path??[]).map(v=>({...v}));if(path.length<2||path.length>4096)throw new RangeError('Path requires 2…4096 samples');
 if(o.closedPath&&length(sub(path[0],path.at(-1)!))<EPS)path.pop();for(let i=1;i<path.length;i++)if(length(sub(path[i],path[i-1]))<EPS)throw new RangeError('Duplicate path samples');
 const n=p.length,m=path.length;budget(n*m,2*n*m+2*n);const tangents=path.map((_,i)=>norm(o.closedPath?sub(path[(i+1)%m],path[(i+m-1)%m]):i===0?sub(path[1],path[0]):i===m-1?sub(path[i],path[i-1]):sub(path[i+1],path[i-1])));
 const frames:V[]=[];let u=norm(cross(Math.abs(tangents[0].y)<.9?{x:0,y:1,z:0}:{x:1,y:0,z:0},tangents[0]));
 for(let i=0;i<m;i++){if(i){const axis=cross(tangents[i-1],tangents[i]),s=length(axis),c=dot(tangents[i-1],tangents[i]);if(c<-.999999)throw new RangeError('Path reverses direction');if(s>EPS)u=rotate(u,mul(axis,1/s),Math.atan2(s,c));}frames.push(u);}
 let correction=0;if(o.closedPath){const axis=cross(tangents[m-1],tangents[0]),s=length(axis);const end=s>EPS?rotate(u,mul(axis,1/s),Math.atan2(s,dot(tangents[m-1],tangents[0]))):u;correction=Math.atan2(dot(cross(end,frames[0]),tangents[0]),dot(end,frames[0]));}
 const vertices:V[]=[],indices:number[]=[],uvs:P[]=[];
 for(let j=0;j<m;j++){const t=j/(o.closedPath?m:m-1),u=rotate(frames[j],tangents[j],(finite(o.twist??0)+correction)*t),v=cross(tangents[j],u);for(let i=0;i<n;i++){vertices.push(add(path[j],add(mul(u,p[i].x),mul(v,p[i].y))));uvs.push({x:i/n,y:t});}}
 for(let j=0;j<(o.closedPath?m:m-1);j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,d=((j+1)%m)*n+i,c=((j+1)%m)*n+(i+1)%n;indices.push(a,b,d,b,c,d);}
 if(o.cap!==false&&!o.closedPath){const caps=triangulate(p);for(let i=0;i<caps.length;i+=3){const[a,b,c]=caps.slice(i,i+3);indices.push(c,b,a,(m-1)*n+a,(m-1)*n+b,(m-1)*n+c);}}return geometry(vertices,indices,uvs);
}
export function resample(points:V[],samples:number,closed:boolean):V[]{
 if(points.length<2)throw new RangeError('A section needs at least two points');const p=points.map(v=>({...v}));if(closed&&length(sub(p[0],p.at(-1)!))>EPS)p.push({...p[0]});const distances=[0];for(let i=1;i<p.length;i++)distances.push(distances[i-1]+length(sub(p[i],p[i-1])));const total=distances.at(-1)!;if(total<EPS)throw new RangeError('Zero-length section');let j=0;return Array.from({length:samples},(_,i)=>{const d=total*i/(closed?samples:samples-1);while(j<p.length-2&&distances[j+1]<d)j++;return mix(p[j],p[j+1],(d-distances[j])/Math.max(EPS,distances[j+1]-distances[j]));});
}
export function sectionGrid(o:Options):V[][]{
 const sections=o.sections??[];if(sections.length<2||sections.length>128)throw new RangeError('Select 2…128 ordered sections');const samples=count(o.samples??32,3,512);return sections.map(p=>resample(p,samples,o.closed!==false));
}
/** Surface of an ordered CrossSection cage. Bilinear cells, not arbitrary patch reconstruction. */
export function surface(o:Options):G{
 const grid=sectionGrid(o),samples=grid[0].length,steps=count(o.steps??1,1,32),rows:V[][]=[];
 budget((grid.length-1)*steps*samples+samples,2*(grid.length-1)*steps*samples);
 for(let j=0;j<grid.length-1;j++)for(let t=0;t<steps;t++)rows.push(grid[j].map((p,i)=>mix(p,grid[j+1][i],t/steps)));rows.push(grid.at(-1)!);
 const indices:number[]=[];for(let j=0;j<rows.length-1;j++)for(let i=0;i<(o.closed===false?samples-1:samples);i++){const a=j*samples+i,b=j*samples+(i+1)%samples,c=b+samples,d=a+samples;indices.push(a,d,b,b,d,c);}if(o.flip)for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];return geometry(rows.flat(),indices,rows.flatMap((r,j)=>r.map((_,i)=>({x:i/samples,y:j/(rows.length-1)}))));
}
