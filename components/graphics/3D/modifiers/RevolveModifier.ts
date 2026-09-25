/**
 * @module components/graphics/3D/modifiers/RevolveModifier
 * @author Riccardo Angeli
 * @version 1.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 *
 * @description
 * Generic surface/solid-of-revolution modifier. The modifier never creates a demo
 * profile: callers provide a 2D profile explicitly (or through mesh.userData.profile2D).
 */
import { Component, Templates } from '../../../../core/index.ts';
import { Modifier3D as Modifier3DNamespace } from './Base.ts';

const html=Templates.Template.Html;

export namespace RevolveModifier
{
    export namespace Interfaces
    {
        export interface ProfilePoint { x:number; y:number; }
        export interface RevolveOptions
        {
            profile?:ProfilePoint[];
            axis?:'x'|'y'|'z';
            angle?:number;
            segments?:number;
            startAngle?:number;
            flip?:boolean;
        }
    }

    const Profiles=new WeakMap<HTMLElement,Interfaces.ProfilePoint[]>();

    @Component('arianna-revolve',{}, {
        Shadow:false,
        Attributes:['disabled','viewport','for','axis','angle','segments','start-angle','flip','enabled'],
        Properties:['profile'],
    })
    export class RevolveModifierElement extends Modifier3DNamespace.Modifier3DElement
    {
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
            const direct=Profiles.get(this);
            const embedded=mesh.userData['profile2D'];
            const profile=(direct?.length?direct:(Array.isArray(embedded)?embedded:[])) as Interfaces.ProfilePoint[];
            if(profile.length<2)return null;
            const axis=(this.getAttribute('axis')??'y') as 'x'|'y'|'z';
            const angle=Math.max(0,Number(this.getAttribute('angle')??Math.PI*2)||Math.PI*2);
            const segments=Math.max(3,Math.round(Number(this.getAttribute('segments')??48)||48));
            const startAngle=Number(this.getAttribute('start-angle')??0)||0;
            const flip=this.hasAttribute('flip')&&this.getAttribute('flip')!=='false';
            return new RevolveModifier(mesh,profile,{axis,angle,segments,startAngle,flip});
        }
    }

    export class RevolveModifier extends Modifier3DNamespace.Modifier3D
    {
        private profile:Interfaces.ProfilePoint[];
        private axis:'x'|'y'|'z';
        private angle:number;
        private segments:number;
        private startAngle:number;
        private flip:boolean;

        constructor(mesh:Modifier3DNamespace.Interfaces.MeshLike,profile:Interfaces.ProfilePoint[],options:Interfaces.RevolveOptions={})
        {
            super(mesh);
            this.profile=structuredClone(profile);
            this.axis=options.axis??'y';
            this.angle=Math.max(0,options.angle??Math.PI*2);
            this.segments=Math.max(3,Math.round(options.segments??48));
            this.startAngle=options.startAngle??0;
            this.flip=Boolean(options.flip);
        }

        setProfile(profile:Interfaces.ProfilePoint[]):this{this.profile=structuredClone(profile);return this;}
        setAxis(axis:'x'|'y'|'z'):this{this.axis=axis;return this;}
        setAngle(angle:number):this{this.angle=Math.max(0,angle);return this;}
        setSegments(segments:number):this{this.segments=Math.max(3,Math.round(segments));return this;}

        apply():this
        {
            if(!this.enabled||this.profile.length<2)return this;
            const full=Math.abs(this.angle-Math.PI*2)<1e-4;
            const rings=full?this.segments:this.segments+1;
            const vertices:Modifier3DNamespace.Interfaces.Vec3Like[]=[];
            const normals:Modifier3DNamespace.Interfaces.Vec3Like[]=[];
            const indices:number[]=[];
            const count=this.profile.length;

            const point=(radius:number,height:number,theta:number):Modifier3DNamespace.Interfaces.Vec3Like=>
            {
                const c=Math.cos(theta),s=Math.sin(theta),r=this.flip?-radius:radius;
                if(this.axis==='x')return{x:height,y:r*c,z:r*s};
                if(this.axis==='z')return{x:r*c,y:r*s,z:height};
                return{x:r*c,y:height,z:r*s};
            };

            for(let ring=0;ring<rings;ring++)
            {
                const t=full?ring/this.segments:ring/(rings-1);
                const theta=this.startAngle+this.angle*t;
                for(const p of this.profile)
                {
                    vertices.push(point(p.x,p.y,theta));
                    normals.push({x:0,y:0,z:0});
                }
            }

            const ringPairs=full?rings:rings-1;
            for(let ring=0;ring<ringPairs;ring++)
            {
                const next=(ring+1)%rings;
                for(let j=0;j<count-1;j++)
                {
                    const a=ring*count+j,b=next*count+j,c=next*count+j+1,d=ring*count+j+1;
                    if(this.flip)indices.push(a,c,b,a,d,c);else indices.push(a,b,c,a,c,d);
                }
            }

            const geometry:Modifier3DNamespace.Interfaces.Geometry3Like={
                vertices,normals,indices,
                clone(){return{vertices:this.vertices.map(v=>({...v})),normals:this.normals.map(n=>({...n})),indices:[...this.indices],clone:this.clone};}
            };
            Modifier3DNamespace._recomputeNormals(geometry);
            this.mesh.geometry=geometry;
            return this;
        }
    }
}

export type RevolveProfilePoint=RevolveModifier.Interfaces.ProfilePoint;
export type RevolveOptions=RevolveModifier.Interfaces.RevolveOptions;
export const RevolveModifierElement=RevolveModifier.RevolveModifierElement;
export default RevolveModifier.RevolveModifier;
