/** 3D counterpart of Reflector: reflects the object transform on selected axes. */
import { Modifier3D as Base } from './Base.ts';
declare const Component:any; declare const Templates:any; const html=Templates.Template.Html;
export namespace Reflector3D
{
    export type Axis='x'|'y'|'z'|'xy'|'xz'|'yz'|'xyz';
    export interface Options{axis?:Axis;disabled?:boolean;}
    export class Reflector3D extends Base.Modifier3D
    {
        public axis:Axis='x';constructor(mesh:Base.Interfaces.MeshLike=Base.Modifier3D.UNBOUND_MESH,options:Options={}){super(mesh);this.axis=options.axis??'x';if(options.disabled)this.disable();}
        public reflect(axis?:Axis):this{if(axis)this.axis=axis;return this.apply();}
        public reset():this{for(const a of ['x','y','z'] as const)this.mesh.scale[a]=Math.abs(this.mesh.scale[a]);this.mesh.updateMatrix?.();return this;}
        public apply():this{if(!this.enabled)return this;for(const a of ['x','y','z'] as const)this.mesh.scale[a]=Math.abs(this.mesh.scale[a])*(this.axis.includes(a)?-1:1);this.mesh.updateMatrix?.();return this;}
    }
    @Component('arianna-reflector-3d',{}, {Shadow:false,Attributes:['viewport','for','enabled','disabled','axis']})
    export class Reflector3DElement extends Base.Modifier3DElement
    {public template=html``;protected createModifier(mesh:Base.Interfaces.MeshLike):Base.Modifier3D{return new Reflector3D(mesh,{axis:(this.getAttribute('axis')??'x') as Axis});}}
}
export type Reflector3DAxis=Reflector3D.Axis;export type Reflector3DOptions=Reflector3D.Options;export default Reflector3D.Reflector3D;
