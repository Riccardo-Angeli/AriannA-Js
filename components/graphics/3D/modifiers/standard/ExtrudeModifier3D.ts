/** @module ExtrudeModifier3D @author Riccardo Angeli @license MIT / Commercial (dual license) */
import {Component,Templates} from '../../../../../core/index.ts';
import {Modifier3D as B} from '../Base.ts';
import {ParametricModifier3D,ParametricModifierElement} from './ParametricModifier3D.ts';
import {deform,mirror,relax,subdivide,extrude,sweep,surface,type Options} from './GeometryKernel3D.ts';
B.RegisterPanelSchema('arianna-extrude',{title:'Extrude',subtitle:'Local-space geometry',controls:[{"attr": "amount", "label": "Height", "type": "range", "value": 1, "min": -5, "max": 5, "step": 0.01}, {"attr": "segments", "label": "Segments", "type": "range", "value": 1, "min": 1, "max": 64, "step": 1}, {"attr": "cap", "label": "Caps", "type": "toggle", "value": true}]});
export namespace ExtrudeModifier3D {
 export type ModifierOptions=Options;
 export class ExtrudeModifier3D extends ParametricModifier3D {
  constructor(mesh:B.Interfaces.MeshLike,options:Options={}){super(mesh,options,(g,o)=>extrude(o));}
 }
 @Component('arianna-extrude',{},{Shadow:false,Attributes:["disabled", "viewport", "for", "enabled", "profile", "path", "sections", "levels", "bevel-profile", "angle-deg", "direction-deg", "twist-deg", "amount", "segments", "cap"],Properties:['options']})
 export class ExtrudeModifierElement extends ParametricModifierElement {
  public override sourceFields=['profile'] as const;
  public template=Templates.Template.Html``;
  protected createModifier(mesh:B.Interfaces.MeshLike):B.Modifier3D{
   const options=this.readOptions();
   if(!options.profile&&Array.isArray(mesh.userData.profile2D))options.profile=mesh.userData.profile2D as Options['profile'];
   if(!options.path&&Array.isArray(mesh.userData.path3D))options.path=mesh.userData.path3D as Options['path'];
   if(!options.sections&&Array.isArray(mesh.userData.sections3D))options.sections=mesh.userData.sections3D as Options['sections'];
   return new ExtrudeModifier3D(mesh,options);
  }
 }
}
export default ExtrudeModifier3D.ExtrudeModifier3D;
