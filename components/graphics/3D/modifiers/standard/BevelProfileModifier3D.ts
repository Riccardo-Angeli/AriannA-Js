/** @module BevelProfileModifier3D @author Riccardo Angeli @license MIT / Commercial (dual license) */
import {Component,Templates} from '../../../../../core/index.ts';
import {Modifier3D as B} from '../Base.ts';
import {ParametricModifier3D,ParametricModifierElement} from './ParametricModifier3D.ts';
import {deform,mirror,relax,subdivide,extrude,sweep,surface,type Options} from './GeometryKernel3D.ts';
B.RegisterPanelSchema('arianna-bevel-profile',{title:'BevelProfile',subtitle:'Local-space geometry',controls:[{"attr": "cap", "label": "Caps", "type": "toggle", "value": true}]});
export namespace BevelProfileModifier3D {
 export type ModifierOptions=Options;
 export class BevelProfileModifier3D extends ParametricModifier3D {
  constructor(mesh:B.Interfaces.MeshLike,options:Options={}){super(mesh,options,(g,o)=>{if(!o.bevelProfile?.length)throw new Error("Supply bevelProfile: outline x / height y");return extrude(o);});}
 }
 @Component('arianna-bevel-profile',{},{Shadow:false,Attributes:["disabled", "viewport", "for", "enabled", "profile", "path", "sections", "levels", "bevel-profile", "angle-deg", "direction-deg", "twist-deg", "cap"],Properties:['options']})
 export class BevelProfileModifierElement extends ParametricModifierElement {
  public override sourceFields=['profile'] as const;
  public template=Templates.Template.Html``;
  protected createModifier(mesh:B.Interfaces.MeshLike):B.Modifier3D{
   const options=this.readOptions();
   if(!options.profile&&Array.isArray(mesh.userData.profile2D))options.profile=mesh.userData.profile2D as Options['profile'];
   if(!options.path&&Array.isArray(mesh.userData.path3D))options.path=mesh.userData.path3D as Options['path'];
   if(!options.sections&&Array.isArray(mesh.userData.sections3D))options.sections=mesh.userData.sections3D as Options['sections'];
   return new BevelProfileModifier3D(mesh,options);
  }
 }
}
export default BevelProfileModifier3D.BevelProfileModifier3D;
