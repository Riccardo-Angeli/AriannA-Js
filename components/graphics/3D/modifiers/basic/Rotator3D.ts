import type { Canvas3D } from '../../Canvas3D.ts';
import { attachTransformControls, type TransformControls } from '../standard/TransformGizmo3D.ts';
/** 3D counterpart of Rotator. Public angles are degrees; mesh rotation is radians. */
import { Modifier3D as Base } from '../Base.ts';
import { Component, Templates } from '../../../../../core/index.ts';  const html=Templates.Template.Html;
export namespace Rotator3D
{
    export type Axis='x'|'y'|'z'|'all';
    export interface Options{x?:number;y?:number;z?:number;angle?:number;axis?:Axis;snap?:number;disabled?:boolean;}
    export type Callback=(mesh:Base.Interfaces.MeshLike,degrees:Base.Interfaces.Vec3Like)=>void;
    export class Rotator3D extends Base.Modifier3D
    {
        /** Compose controls on an already connected canvas; destroy releases all listeners. */
        public attachControls(canvas:Canvas3D.Canvas3D):TransformControls {
            const controls=attachTransformControls(canvas,this.mesh as Canvas3D.Mesh3,'rotate',v=>this.setRotation(v.x,v.y,v.z));
            this.cleanups.push(()=>controls.destroy());return controls;
        }

        public axis:Axis='all';public snap=0;private angles:Partial<Base.Interfaces.Vec3Like>={};private callbacks=new Set<Callback>();
        constructor(mesh:Base.Interfaces.MeshLike=Base.Modifier3D.UNBOUND_MESH,options:Options={}){super(mesh);this.axis=options.axis??'all';this.snap=Math.max(0,options.snap??0);this.angles={x:options.x,y:options.y,z:options.z};if(options.angle!==undefined&&this.axis!=='all')this.angles[this.axis]=options.angle;if(options.disabled)this.disable();}
        private q(v:number):number{return this.snap>0?Math.round(v/this.snap)*this.snap:v;}
        public setRotation(x:number,y:number,z:number):this{this.angles={x,y,z};return this.apply();}
        public rotateBy(x=0,y=0,z=0):this{const d=180/Math.PI;return this.setRotation(this.mesh.rotation.x*d+x,this.mesh.rotation.y*d+y,this.mesh.rotation.z*d+z);}
        public onRotate(callback:Callback):this{this.callbacks.add(callback);return this;}
        public apply():this{if(!this.enabled)return this;const out={x:this.mesh.rotation.x*180/Math.PI,y:this.mesh.rotation.y*180/Math.PI,z:this.mesh.rotation.z*180/Math.PI};for(const a of ['x','y','z'] as const)if(this.axis==='all'||this.axis===a){out[a]=this.q(this.angles[a]??out[a]);this.mesh.rotation[a]=out[a]*Math.PI/180;}this.mesh.updateMatrix?.();for(const cb of this.callbacks)cb(this.mesh,out);return this;}
    }
    @Component('arianna-rotator-3d',{}, {Shadow:false,Attributes:['viewport','for','enabled','disabled','x','y','z','angle','axis','snap']})
    export class Rotator3DElement extends Base.Modifier3DElement
    {public template=html``;protected createModifier(mesh:Base.Interfaces.MeshLike):Base.Modifier3D{const d=180/Math.PI,n=(a:string,f:number)=>{const v=Number(this.getAttribute(a)??f);return Number.isFinite(v)?v:f;};return new Rotator3D(mesh,{x:n('x',mesh.rotation.x*d),y:n('y',mesh.rotation.y*d),z:n('z',mesh.rotation.z*d),angle:this.hasAttribute('angle')?n('angle',0):undefined,axis:(this.getAttribute('axis')??'all') as Axis,snap:n('snap',0)});}}
}
export type Rotator3DOptions=Rotator3D.Options;export default Rotator3D.Rotator3D;
