/** @module SweepModifier3D @author Riccardo Angeli @license MIT / Commercial (dual license) */
import {Component,Templates} from '../../../../../core/index.ts';
import {Modifier3D as B} from '../Base.ts';
import {ParametricModifier3D,ParametricModifierElement} from './ParametricModifier3D.ts';
import {deform,mirror,relax,subdivide,extrude,sweep,surface,type Options} from './GeometryKernel3D.ts';
B.RegisterPanelSchema('arianna-sweep',{title:'Sweep',subtitle:'Local-space geometry',controls:[{"attr": "cap", "label": "Caps", "type": "toggle", "value": true}, {"attr": "closed-path", "label": "Closed path", "type": "toggle", "value": false}, {"attr": "twist", "label": "Twist (rad)", "type": "range", "value": 0, "min": -6.28, "max": 6.28, "step": 0.01}]});
export namespace SweepModifier3D {
 export type ModifierOptions=Options;
 export class SweepModifier3D extends ParametricModifier3D {
  constructor(mesh:B.Interfaces.MeshLike,options:Options={}){super(mesh,options,(g,o)=>sweep(o));}
 }
 @Component('arianna-sweep',{},{Shadow:false,Attributes:["disabled", "viewport", "for", "enabled", "profile", "path", "sections", "levels", "bevel-profile", "angle-deg", "direction-deg", "twist-deg", "cap", "closed-path", "twist"],Properties:['options']})
 export class SweepModifierElement extends ParametricModifierElement {
  public override sourceFields=['path','profile'] as const;
  public template=Templates.Template.Html``;
  protected createModifier(mesh:B.Interfaces.MeshLike):B.Modifier3D{
   const options=this.readOptions();
   if(!options.profile&&Array.isArray(mesh.userData.profile2D))options.profile=mesh.userData.profile2D as Options['profile'];
   if(!options.path&&Array.isArray(mesh.userData.path3D))options.path=mesh.userData.path3D as Options['path'];
   if(!options.sections&&Array.isArray(mesh.userData.sections3D))options.sections=mesh.userData.sections3D as Options['sections'];
   return new SweepModifier3D(mesh,options);
  }
 }
}
export default SweepModifier3D.SweepModifier3D;
