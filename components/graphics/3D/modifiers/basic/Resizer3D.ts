import type { Canvas3D } from '../../Canvas3D.ts';
import { attachTransformControls, type TransformControls } from '../standard/TransformGizmo3D.ts';
/** 3D counterpart of Resizer: edits mesh scale on three axes. */
import { Modifier3D as Base } from '../Base.ts';
import { Component, Templates } from '../../../../../core/index.ts';  const html=Templates.Template.Html;
export namespace Resizer3D
{
    export type Axis='x'|'y'|'z'|'xy'|'xz'|'yz'|'all';
    export interface Options{x?:number;y?:number;z?:number;uniform?:number;axis?:Axis;min?:number;max?:number;disabled?:boolean;}
    export type Callback=(mesh:Base.Interfaces.MeshLike,scale:Base.Interfaces.Vec3Like)=>void;
    export class Resizer3D extends Base.Modifier3D
    {
        /** Compose controls on an already connected canvas; destroy releases all listeners. */
        public attachControls(canvas:Canvas3D.Canvas3D):TransformControls {
            const controls=attachTransformControls(canvas,this.mesh as Canvas3D.Mesh3,'scale',v=>this.setScale(v.x,v.y,v.z));
            this.cleanups.push(()=>controls.destroy());return controls;
        }

        public axis:Axis='all';public min=0.001;public max=Number.POSITIVE_INFINITY;
        private value:Partial<Base.Interfaces.Vec3Like>={};private callbacks=new Set<Callback>();
        constructor(mesh:Base.Interfaces.MeshLike=Base.Modifier3D.UNBOUND_MESH,options:Options={}){super(mesh);this.axis=options.axis??'all';this.min=Math.max(0,options.min??.001);this.max=Math.max(this.min,options.max??Infinity);const u=options.uniform;this.value={x:u??options.x,y:u??options.y,z:u??options.z};if(options.disabled)this.disable();}
        private allows(a:'x'|'y'|'z'):boolean{return this.axis==='all'||this.axis===a||this.axis.includes(a);}
        private clamp(v:number):number{return Math.max(this.min,Math.min(this.max,v));}
        public setScale(x:number,y=x,z=x):this{this.value={x,y,z};return this.apply();}
        public resizeBy(x=1,y=x,z=x):this{return this.setScale(this.mesh.scale.x*x,this.mesh.scale.y*y,this.mesh.scale.z*z);}
        public onResize(callback:Callback):this{this.callbacks.add(callback);return this;}
        public apply():this{if(!this.enabled)return this;for(const a of ['x','y','z'] as const)if(this.allows(a))this.mesh.scale[a]=this.clamp(this.value[a]??this.mesh.scale[a]);this.mesh.updateMatrix?.();for(const cb of this.callbacks)cb(this.mesh,{...this.mesh.scale});return this;}
    }
    @Component('arianna-resizer-3d',{}, {Shadow:false,Attributes:['viewport','for','enabled','disabled','x','y','z','uniform','axis','min','max']})
    export class Resizer3DElement extends Base.Modifier3DElement
    {public template=html``;protected createModifier(mesh:Base.Interfaces.MeshLike):Base.Modifier3D{const n=(a:string,f:number)=>{const v=Number(this.getAttribute(a)??f);return Number.isFinite(v)?v:f;},u=this.hasAttribute('uniform')?n('uniform',1):undefined;return new Resizer3D(mesh,{x:n('x',mesh.scale.x),y:n('y',mesh.scale.y),z:n('z',mesh.scale.z),uniform:u,axis:(this.getAttribute('axis')??'all') as Axis,min:n('min',.001),max:n('max',Infinity)});}}
}
export type Resizer3DOptions=Resizer3D.Options;export default Resizer3D.Resizer3D;
