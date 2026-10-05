/** 3D counterpart of Skewer: applies three independent shear angles to geometry. */
import { Modifier3D as Base } from '../Base.ts';
import { Component, Templates } from '../../../../../core/index.ts';  const html=Templates.Template.Html;
export namespace Skewer3D
{
    export interface Options{x?:number;y?:number;z?:number;maxAngle?:number;disabled?:boolean;}
    export class Skewer3D extends Base.Modifier3D
    {
        public x=0;public y=0;public z=0;public maxAngle=45;
        private source:Base.Interfaces.Geometry3Like;
        constructor(mesh:Base.Interfaces.MeshLike=Base.Modifier3D.UNBOUND_MESH,options:Options={}){super(mesh);this.source=Base._cloneGeom(mesh.geometry);this.maxAngle=Math.abs(options.maxAngle??45);this.x=options.x??0;this.y=options.y??0;this.z=options.z??0;if(options.disabled)this.disable();}
        public override bindMesh(mesh:Base.Interfaces.MeshLike):this{super.bindMesh(mesh);this.source=Base._cloneGeom(mesh.geometry);return this;}
        private clamp(v:number):number{return Math.max(-this.maxAngle,Math.min(this.maxAngle,v));}
        public setSkew(x:number,y:number,z:number):this{this.x=x;this.y=y;this.z=z;return this.apply();}
        public reset():this{return this.setSkew(0,0,0);}
        public apply():this
        {
            if(!this.enabled)return this;const tx=Math.tan(this.clamp(this.x)*Math.PI/180),ty=Math.tan(this.clamp(this.y)*Math.PI/180),tz=Math.tan(this.clamp(this.z)*Math.PI/180),g=Base._cloneGeom(this.source);
            g.vertices=g.vertices.map(v=>({x:v.x+tx*v.y,y:v.y+ty*v.z,z:v.z+tz*v.x}));Base._recomputeNormals(g);this.mesh.geometry=g;this.mesh.updateMatrix?.();return this;
        }
    }
    @Component('arianna-skewer-3d',{}, {Shadow:false,Attributes:['viewport','for','enabled','disabled','x','y','z','max-angle']})
    export class Skewer3DElement extends Base.Modifier3DElement
    {public template=html``;protected createModifier(mesh:Base.Interfaces.MeshLike):Base.Modifier3D{const n=(a:string,f=0)=>{const v=Number(this.getAttribute(a));return Number.isFinite(v)?v:f;};return new Skewer3D(mesh,{x:n('x'),y:n('y'),z:n('z'),maxAngle:n('max-angle',45)});}}
}
export type Skewer3DOptions=Skewer3D.Options;export default Skewer3D.Skewer3D;
