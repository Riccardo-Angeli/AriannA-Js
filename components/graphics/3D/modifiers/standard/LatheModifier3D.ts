/**
 * @module components/graphics/3D/modifiers/LatheModifier3D
 * @author Riccardo Angeli
 * @version 1.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 *
 * @description
 * Generic surface/solid-of-revolution modifier. The modifier never creates a demo
 * profile: callers provide a 2D profile explicitly (or through mesh.userData.profile2D).
 */
import { Component, Templates } from '../../../../../core/index.ts';
import { Modifier3D as Modifier3DNamespace } from '../Base.ts';

import {ParametricModifierElement} from './ParametricModifier3D.ts';
import {budget,finite} from './GeometryKernel3D.ts';

const html=Templates.Template.Html;

export namespace LatheModifier3D
{
    export namespace Interfaces
    {
        export interface ProfilePoint { x:number; y:number; }
        export interface LatheOptions
        {
            profile?:ProfilePoint[];
            axis?:'x'|'y'|'z';
            angle?:number;
            segments?:number;
            startAngle?:number;
            centered?:boolean;
            cap?:boolean;
            flip?:boolean;
        }
    }

    const Profiles=new WeakMap<HTMLElement,Interfaces.ProfilePoint[]>();

    @Component('arianna-lathe',{}, {
        Shadow:false,
        Attributes:['disabled','viewport','for','axis','angle','segments','start-angle','flip','enabled','centered','cap','angle-deg','start-angle-deg'],
        Properties:['profile'],
    })
    export class LatheModifierElement extends ParametricModifierElement
    {
        public override sourceFields=['profile'] as const;
        public template=html``;

        public get profile():Interfaces.ProfilePoint[]
        {
            return structuredClone(Profiles.get(this)??[]);
        }
        public set profile(value:Interfaces.ProfilePoint[])
        {
            Profiles.set(this,Array.isArray(value)?structuredClone(value):[]);
            if(this.isConnected)this.refreshModifier();
        }
        public setProfile(value:Interfaces.ProfilePoint[]):this{this.profile=value;return this;}
        public getProfile():Interfaces.ProfilePoint[]{return this.profile;}

        protected createModifier(mesh:Modifier3DNamespace.Interfaces.MeshLike):Modifier3DNamespace.Modifier3D|null
        {
            const direct=this.readOptions().profile??Profiles.get(this);
            const embedded=mesh.userData['profile2D'];
            const profile=(direct?.length?direct:(Array.isArray(embedded)?embedded:[])) as Interfaces.ProfilePoint[];
            if(profile.length<2)return null;
            const axis=(this.getAttribute('axis')??'y') as 'x'|'y'|'z';
            const angle=this.hasAttribute('angle-deg')?Number(this.getAttribute('angle-deg'))*Math.PI/180:Number(this.getAttribute('angle')??Math.PI*2);
            const segments=Math.max(3,Math.round(Number(this.getAttribute('segments')??48)||48));
            const startAngle=this.hasAttribute('start-angle-deg')?Number(this.getAttribute('start-angle-deg'))*Math.PI/180:Number(this.getAttribute('start-angle')??0);
            const flip=this.hasAttribute('flip')&&this.getAttribute('flip')!=='false';
            return new LatheModifier3D(mesh,profile,{axis,angle,segments,startAngle,flip,centered:this.getAttribute('centered')!=='false',cap:this.getAttribute('cap')!=='false'});
        }
    }

    export class LatheModifier3D extends Modifier3DNamespace.Modifier3D
    {
        private profile:Interfaces.ProfilePoint[];
        private axis:'x'|'y'|'z';
        private angle:number;
        private segments:number;
        private startAngle:number;
        private flip:boolean;
        private centered:boolean;
        private cap:boolean;

        constructor(mesh:Modifier3DNamespace.Interfaces.MeshLike,profile:Interfaces.ProfilePoint[],options:Interfaces.LatheOptions={})
        {
            super(mesh);
            this.profile=structuredClone(profile);
            this.axis=options.axis??'y';
            this.angle=Math.max(0,Math.min(Math.PI*2,options.angle??Math.PI*2));
            this.segments=Math.max(3,Math.min(128,Math.round(options.segments??48)));
            this.startAngle=options.startAngle??0;
            this.flip=Boolean(options.flip);this.centered=options.centered??true;this.cap=options.cap??true;
        }

        setProfile(profile:Interfaces.ProfilePoint[]):this{this.profile=structuredClone(profile);return this;}
        setAxis(axis:'x'|'y'|'z'):this{this.axis=axis;return this;}
        setAngle(angle:number):this{this.angle=Math.max(0,Math.min(Math.PI*2,angle));return this;}
        setSegments(segments:number):this{this.segments=Math.max(3,Math.min(128,Math.round(segments)));return this;}

        apply():this
        {
            if(!this.enabled||this.profile.length<2)return this;
            finite(this.angle);finite(this.startAngle);finite(this.segments);if(this.profile.length>2048)throw new RangeError('Lathe profile exceeds 2048 points');budget((this.profile.length+2)*this.segments,2*(this.profile.length+2)*this.segments);
            for(const point of this.profile){finite(point.x);finite(point.y);if(point.x<0)throw new RangeError('Lathe radius must be nonnegative');}
            const full=Math.abs(this.angle-Math.PI*2)<1e-6,segments=Math.max(3,Math.min(128,Math.round(this.segments))),profile=this.profile.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)).map(p=>({x:Math.max(0,p.x),y:p.y}));
            if(profile.length<2)return this;
            if(this.cap&&profile[0].x>1e-8)profile.unshift({x:0,y:profile[0].y});
            if(this.cap&&profile.at(-1)!.x>1e-8)profile.push({x:0,y:profile.at(-1)!.y});
            const offset=this.centered?(Math.min(...profile.map(p=>p.y))+Math.max(...profile.map(p=>p.y)))/2:0;
            const vertices:Modifier3DNamespace.Interfaces.Vec3Like[]=[],indices:number[]=[],cache=new Map<string,number>(),rings:number[][]=[];
            const point=(radius:number,height:number,theta:number):Modifier3DNamespace.Interfaces.Vec3Like=>{
                const c=Math.cos(theta),s=Math.sin(theta),h=height-offset;
                if(this.axis==='x')return{x:h,y:radius*c,z:radius*s};
                if(this.axis==='z')return{x:radius*c,y:radius*s,z:h};
                return{x:radius*c,y:h,z:radius*s};
            };
            const vertex=(p:Modifier3DNamespace.Interfaces.Vec3Like)=>{const key=[p.x,p.y,p.z].map(n=>Math.round(n*1e8)).join(':');let id=cache.get(key);if(id===undefined){id=vertices.length;vertices.push(p);cache.set(key,id);}return id;};
            const triangle=(a:number,b:number,c:number)=>{if(a!==b&&b!==c&&c!==a)indices.push(a,b,c);};
            const ringCount=full?segments:segments+1;
            for(let i=0;i<ringCount;i++)rings.push(profile.map(p=>vertex(point(p.x,p.y,this.startAngle+this.angle*i/segments))));
            for(let i=0;i<segments;i++){const next=(i+1)%ringCount;for(let j=0;j<profile.length-1;j++){const a=rings[i][j],b=rings[next][j],c=rings[next][j+1],d=rings[i][j+1];triangle(a,b,c);triangle(a,c,d);}}
            if(!full&&this.cap){
                // Ear clipping closes each radial cut even for a concave profile.
                const polygon=profile.map((_,i)=>i);let area=0;for(let i=0;i<profile.length;i++){const a=profile[i],b=profile[(i+1)%profile.length];area+=a.x*b.y-b.x*a.y;}const sign=area>=0?1:-1;
                const turn=(a:number,b:number,c:number)=>(profile[b].x-profile[a].x)*(profile[c].y-profile[a].y)-(profile[b].y-profile[a].y)*(profile[c].x-profile[a].x);
                const capTriangles:number[][]=[];let guard=polygon.length*polygon.length;
                while(polygon.length>3&&guard-->0){let found=false;for(let i=0;i<polygon.length;i++){const a=polygon[(i+polygon.length-1)%polygon.length],b=polygon[i],c=polygon[(i+1)%polygon.length];if(turn(a,b,c)*sign<=1e-10)continue;const inside=polygon.some(p=>p!==a&&p!==b&&p!==c&&turn(a,b,p)*sign>=-1e-10&&turn(b,c,p)*sign>=-1e-10&&turn(c,a,p)*sign>=-1e-10);if(inside)continue;capTriangles.push([a,b,c]);polygon.splice(i,1);found=true;break;}if(!found)break;}
                if(polygon.length===3)capTriangles.push([...polygon]);
                for(const [a,b,c] of capTriangles){triangle(rings[0][a],rings[0][b],rings[0][c]);triangle(rings[ringCount-1][a],rings[ringCount-1][c],rings[ringCount-1][b]);}
            }
            // Orient a closed generated solid outward, independently of profile order.
            let volume=0;for(let i=0;i<indices.length;i+=3){const a=vertices[indices[i]],b=vertices[indices[i+1]],c=vertices[indices[i+2]];volume+=a.x*(b.y*c.z-b.z*c.y)+a.y*(b.z*c.x-b.x*c.z)+a.z*(b.x*c.y-b.y*c.x);}
            if((volume<0)!==this.flip)for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
            const geometry:Modifier3DNamespace.Interfaces.Geometry3Like={vertices,normals:[],indices,clone(){return Modifier3DNamespace._cloneGeom(this);}};
            Modifier3DNamespace._recomputeNormals(geometry);this.mesh.geometry=geometry;return this;
        }

    }
}

export type LatheProfilePoint=LatheModifier3D.Interfaces.ProfilePoint;
export type LatheOptions=LatheModifier3D.Interfaces.LatheOptions;
export const LatheModifierElement=LatheModifier3D.LatheModifierElement;
export default LatheModifier3D.LatheModifier3D;
