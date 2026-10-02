/**
 * True solid fillet modifier.
 *
 * The generated surface is the boundary of an inward-offset convex polyhedron
 * dilated by a sphere: planar inset faces, cylindrical edge patches and
 * spherical vertex patches. A box therefore receives quarter cylinders on its
 * edges and one spherical octant on every corner; it is not merely subdivided
 * or displaced along its (possibly stale) vertex normals.
 */
import { Modifier3D as Base } from './Base.ts';

declare const Component:any;
declare const Templates:any;
const html=Templates.Template.Html;

export namespace Rounder3D
{
    type Vec3=Base.Interfaces.Vec3Like;
    type Geometry=Base.Interfaces.Geometry3Like;
    interface Triangle{a:number;b:number;c:number;normal:Vec3;d:number;face:number;}
    interface Face{normal:Vec3;d:number;vertices:Set<number>;triangles:number[];}
    interface Edge{a:number;b:number;triangles:number;faces:Set<number>;}

    export interface Options
    {
        radius?:number;
        segments?:number;
        /** Coplanarity tolerance in radians. */
        angleTolerance?:number;
        disabled?:boolean;
    }

    const add=(a:Vec3,b:Vec3):Vec3=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
    const sub=(a:Vec3,b:Vec3):Vec3=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z});
    const scale=(a:Vec3,s:number):Vec3=>({x:a.x*s,y:a.y*s,z:a.z*s});
    const dot=(a:Vec3,b:Vec3):number=>a.x*b.x+a.y*b.y+a.z*b.z;
    const cross=(a:Vec3,b:Vec3):Vec3=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
    const length=(a:Vec3):number=>Math.hypot(a.x,a.y,a.z);
    const normal=(a:Vec3):Vec3=>{const l=length(a)||1;return scale(a,1/l);};
    const clamp=(v:number,a:number,b:number):number=>Math.max(a,Math.min(b,v));
    const edgeKey=(a:number,b:number):string=>a<b?`${a}:${b}`:`${b}:${a}`;
    const average=(points:Vec3[]):Vec3=>points.length?scale(points.reduce(add,{x:0,y:0,z:0}),1/points.length):{x:0,y:0,z:0};

    const planeIntersection=(normals:[Vec3,Vec3,Vec3],distances:[number,number,number]):Vec3|null=>
    {
        const [a,b,c]=normals,[da,db,dc]=distances,bc=cross(b,c),denominator=dot(a,bc);
        if(Math.abs(denominator)<1e-8)return null;
        return scale(add(add(scale(bc,da),scale(cross(c,a),db)),scale(cross(a,b),dc)),1/denominator);
    };

    const sphericalDirection=(a:Vec3,b:Vec3,t:number):Vec3=>
    {
        const cosine=clamp(dot(a,b),-1,1),angle=Math.acos(cosine),sine=Math.sin(angle);
        if(angle<1e-7||Math.abs(sine)<1e-7)return normal(add(scale(a,1-t),scale(b,t)));
        return normal(add(scale(a,Math.sin((1-t)*angle)/sine),scale(b,Math.sin(t*angle)/sine)));
    };

    /** Weld coincident positions so imported meshes with one vertex per face
     *  still expose their real solid topology. */
    const weld=(geometry:Geometry):{vertices:Vec3[];indices:number[];epsilon:number}=>
    {
        const vertices=geometry.vertices,minimum={x:Infinity,y:Infinity,z:Infinity},maximum={x:-Infinity,y:-Infinity,z:-Infinity};
        for(const p of vertices){minimum.x=Math.min(minimum.x,p.x);minimum.y=Math.min(minimum.y,p.y);minimum.z=Math.min(minimum.z,p.z);maximum.x=Math.max(maximum.x,p.x);maximum.y=Math.max(maximum.y,p.y);maximum.z=Math.max(maximum.z,p.z);}
        const epsilon=Math.max(1,length(sub(maximum,minimum)))*1e-6,map=new Map<string,number>(),out:Vec3[]=[],remap:number[]=[];
        for(let i=0;i<vertices.length;i++)
        {
            const p=vertices[i],key=`${Math.round(p.x/epsilon)}:${Math.round(p.y/epsilon)}:${Math.round(p.z/epsilon)}`;
            let index=map.get(key);if(index===undefined){index=out.length;out.push({...p});map.set(key,index);}remap[i]=index;
        }
        return{vertices:out,indices:geometry.indices.map(index=>remap[index]),epsilon};
    };

    const roundedGeometry=(source:Geometry,requestedRadius:number,segments:number,angleTolerance:number):Geometry|null=>
    {
        const welded=weld(source),vertices=welded.vertices,indices=welded.indices;
        if(vertices.length<4||indices.length<12||indices.length%3!==0)return null;
        const solidCenter=average(vertices),triangles:Triangle[]=[];

        for(let i=0;i<indices.length;i+=3)
        {
            let a=indices[i],b=indices[i+1],c=indices[i+2];
            if(a===b||b===c||c===a)continue;
            let n=normal(cross(sub(vertices[b],vertices[a]),sub(vertices[c],vertices[a])));
            if(length(n)<1e-8)continue;
            const center=scale(add(add(vertices[a],vertices[b]),vertices[c]),1/3);
            if(dot(n,sub(center,solidCenter))<0){[b,c]=[c,b];n=scale(n,-1);}
            triangles.push({a,b,c,normal:n,d:dot(n,vertices[a]),face:-1});
        }
        if(triangles.length<4)return null;

        const triangleEdges=new Map<string,number[]>();
        triangles.forEach((triangle,index)=>{
            for(const [a,b] of [[triangle.a,triangle.b],[triangle.b,triangle.c],[triangle.c,triangle.a]])
            {const key=edgeKey(a,b),list=triangleEdges.get(key);if(list)list.push(index);else triangleEdges.set(key,[index]);}
        });

        /* Merge only adjacent coplanar triangles. Equal planes belonging to
           disconnected solids must never become one face. */
        const cosineTolerance=Math.cos(Math.max(1e-6,angleTolerance)),faces:Face[]=[];
        for(let seed=0;seed<triangles.length;seed++)
        {
            if(triangles[seed].face>=0)continue;
            const id=faces.length,face:Face={normal:{x:0,y:0,z:0},d:0,vertices:new Set(),triangles:[]},queue=[seed];triangles[seed].face=id;
            while(queue.length)
            {
                const index=queue.pop()!,triangle=triangles[index];face.triangles.push(index);face.normal=add(face.normal,triangle.normal);face.d+=triangle.d;face.vertices.add(triangle.a).add(triangle.b).add(triangle.c);
                for(const [a,b] of [[triangle.a,triangle.b],[triangle.b,triangle.c],[triangle.c,triangle.a]])for(const neighbour of triangleEdges.get(edgeKey(a,b))??[])
                {
                    const candidate=triangles[neighbour];
                    if(candidate.face<0&&dot(triangle.normal,candidate.normal)>=cosineTolerance&&Math.abs(triangle.d-candidate.d)<=welded.epsilon*8){candidate.face=id;queue.push(neighbour);}
                }
            }
            face.normal=normal(face.normal);face.d/=Math.max(1,face.triangles.length);faces.push(face);
        }

        /* Reject concave/open/non-manifold input instead of silently corrupting
           it. Rounder3D currently guarantees closed convex trihedral solids. */
        for(const face of faces)for(const point of vertices)if(dot(face.normal,point)>face.d+welded.epsilon*12)return null;
        const topology=new Map<string,Edge>();
        triangles.forEach(triangle=>{
            for(const [a,b] of [[triangle.a,triangle.b],[triangle.b,triangle.c],[triangle.c,triangle.a]])
            {const key=edgeKey(a,b);let edge=topology.get(key);if(!edge){edge={a:Math.min(a,b),b:Math.max(a,b),triangles:0,faces:new Set()};topology.set(key,edge);}edge.triangles++;edge.faces.add(triangle.face);}
        });
        if([...topology.values()].some(edge=>edge.triangles!==2))return null;
        const solidEdges=[...topology.values()].filter(edge=>edge.faces.size===2);
        if(!solidEdges.length||solidEdges.some(edge=>edge.faces.size!==2))return null;

        const incident=vertices.map(()=>new Set<number>());
        faces.forEach((face,id)=>face.vertices.forEach(vertex=>incident[vertex].add(id)));
        const used=new Set(indices),centers:Vec3[]=vertices.map(point=>({...point}));
        if([...used].some(vertex=>incident[vertex].size!==3))return null;

        const minimumEdge=Math.min(...solidEdges.map(edge=>length(sub(vertices[edge.a],vertices[edge.b]))));
        const radius=clamp(requestedRadius,0,Math.max(0,minimumEdge*.49));
        if(radius<=welded.epsilon)return Base._cloneGeom(source);
        for(const vertex of used)
        {
            const ids=[...incident[vertex]] as [number,number,number],planes=ids.map(id=>faces[id]);
            const center=planeIntersection([planes[0].normal,planes[1].normal,planes[2].normal],[planes[0].d-radius,planes[1].d-radius,planes[2].d-radius]);
            if(!center)return null;centers[vertex]=center;
        }

        const output:Geometry={vertices:[],normals:[],indices:[],clone(){return Base._cloneGeom(this);}},vertexCache=new Map<string,number>(),outputEpsilon=welded.epsilon*16;
        const addVertex=(point:Vec3,n:Vec3):number=>
        {
            /* Adjacent patches meet tangentially. Reusing their boundary
               vertices keeps the resulting solid index-manifold instead of
               producing merely coincident visual seams. */
            const key=`${Math.round(point.x/outputEpsilon)}:${Math.round(point.y/outputEpsilon)}:${Math.round(point.z/outputEpsilon)}`,existing=vertexCache.get(key),unit=normal(n);
            if(existing!==undefined){output.normals[existing]=normal(add(output.normals[existing],unit));return existing;}
            const index=output.vertices.length;output.vertices.push(point);output.normals.push(unit);vertexCache.set(key,index);return index;
        };
        const addTriangle=(a:number,b:number,c:number,expected:Vec3):void=>
        {
            const actual=cross(sub(output.vertices[b],output.vertices[a]),sub(output.vertices[c],output.vertices[a]));
            if(dot(actual,expected)<0)output.indices.push(a,c,b);else output.indices.push(a,b,c);
        };

        /* Original planar faces, inset by the fillet radius. */
        faces.forEach(face=>
        {
            const points=[...face.vertices].map(vertex=>({vertex,point:add(centers[vertex],scale(face.normal,radius))})),center=average(points.map(item=>item.point));
            const helper=Math.abs(face.normal.y)<.85?{x:0,y:1,z:0}:{x:1,y:0,z:0},u=normal(cross(helper,face.normal)),v=cross(face.normal,u);
            points.sort((a,b)=>Math.atan2(dot(sub(a.point,center),v),dot(sub(a.point,center),u))-Math.atan2(dot(sub(b.point,center),v),dot(sub(b.point,center),u)));
            const polygon=points.map(item=>addVertex(item.point,face.normal));
            for(let i=1;i<polygon.length-1;i++)addTriangle(polygon[0],polygon[i],polygon[i+1],face.normal);
        });

        /* Cylindrical patches between every pair of adjacent planar faces. */
        for(const edge of solidEdges)
        {
            const [faceA,faceB]=[...edge.faces].map(id=>faces[id]),rows:number[][]=[];
            for(let step=0;step<=segments;step++)
            {
                const direction=sphericalDirection(faceA.normal,faceB.normal,step/segments);
                rows.push([addVertex(add(centers[edge.a],scale(direction,radius)),direction),addVertex(add(centers[edge.b],scale(direction,radius)),direction)]);
            }
            for(let step=0;step<segments;step++)
            {
                const a=rows[step][0],b=rows[step][1],c=rows[step+1][1],d=rows[step+1][0],expected=normal(add(output.normals[a],output.normals[d]));
                addTriangle(a,b,c,expected);addTriangle(a,c,d,expected);
            }
        }

        /* Spherical triangular patches. On a box these are the eight spherical
           octants requested by the solid fillet operation. */
        for(const vertex of used)
        {
            const faceNormals=[...incident[vertex]].map(id=>faces[id].normal) as [Vec3,Vec3,Vec3],rows:number[][]=[];
            for(let i=0;i<=segments;i++)
            {
                const row:number[]=[],towardThird=i/segments,left=sphericalDirection(faceNormals[0],faceNormals[2],towardThird),right=sphericalDirection(faceNormals[1],faceNormals[2],towardThird),width=segments-i;
                for(let j=0;j<=segments-i;j++)
                {
                    /* Nested spherical interpolation makes all three patch
                       boundaries bit-compatible with the adjacent cylinders. */
                    const direction=width===0?faceNormals[2]:sphericalDirection(left,right,j/width);
                    row.push(addVertex(add(centers[vertex],scale(direction,radius)),direction));
                }
                rows.push(row);
            }
            for(let i=0;i<segments;i++)for(let j=0;j<rows[i+1].length;j++)
            {
                const a=rows[i][j],b=rows[i][j+1],c=rows[i+1][j],expected=normal(add(add(output.normals[a],output.normals[b]),output.normals[c]));addTriangle(a,b,c,expected);
                if(j<rows[i+1].length-1){const d=rows[i+1][j+1],expected2=normal(add(add(output.normals[b],output.normals[d]),output.normals[c]));addTriangle(b,d,c,expected2);}
            }
        }
        return output;
    };

    export class Rounder3D extends Base.Modifier3D
    {
        public radius=.05;
        public segments=3;
        public angleTolerance=1e-3;
        public supported=true;
        private source:Geometry;

        constructor(mesh:Base.Interfaces.MeshLike=Base.Modifier3D.UNBOUND_MESH,options:Options={})
        {
            super(mesh);this.source=Base._cloneGeom(mesh.geometry);this.radius=Math.max(0,options.radius??.05);this.segments=clamp(Math.floor(options.segments??3),1,32);this.angleTolerance=Math.max(1e-6,options.angleTolerance??1e-3);if(options.disabled)this.disable();
        }
        public override bindMesh(mesh:Base.Interfaces.MeshLike):this{super.bindMesh(mesh);this.source=Base._cloneGeom(mesh.geometry);return this;}
        public setRadius(radius:number):this{this.radius=Math.max(0,radius);return this.apply();}
        public setSegments(segments:number):this{this.segments=clamp(Math.floor(segments),1,32);return this.apply();}
        public apply():this
        {
            if(!this.enabled)return this;const geometry=roundedGeometry(this.source,this.radius,this.segments,this.angleTolerance);this.supported=geometry!==null;
            this.mesh.geometry=geometry??Base._cloneGeom(this.source);
            if(!geometry)console.warn('[Rounder3D] Solid fillet requires a closed, convex, manifold mesh with three incident faces per corner.');
            return this;
        }
    }

    @Component('arianna-rounder-3d',{}, {Shadow:false,Attributes:['viewport','for','enabled','disabled','radius','segments','angle-tolerance']})
    export class Rounder3DElement extends Base.Modifier3DElement
    {
        public template=html``;
        protected createModifier(mesh:Base.Interfaces.MeshLike):Base.Modifier3D
        {
            const number=(name:string,fallback:number)=>{const value=Number(this.getAttribute(name));return Number.isFinite(value)?value:fallback;};
            return new Rounder3D(mesh,{radius:number('radius',.05),segments:number('segments',3),angleTolerance:number('angle-tolerance',1e-3)});
        }
    }
}

export type Rounder3DOptions=Rounder3D.Options;
export default Rounder3D.Rounder3D;
