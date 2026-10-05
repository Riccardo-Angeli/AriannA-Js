/** @module SurfaceModifier3D @author Riccardo Angeli @license MIT / Commercial (dual license) */
import {Component,Templates} from '../../../../../core/index.ts';
import {Modifier3D as B} from '../Base.ts';
import {ParametricModifier3D,ParametricModifierElement} from './ParametricModifier3D.ts';
import {deform,mirror,relax,subdivide,extrude,sweep,surface,type Options} from './GeometryKernel3D.ts';
B.RegisterPanelSchema('arianna-surface',{title:'Surface',subtitle:'Local-space geometry',controls:[{"attr": "samples", "label": "Section samples", "type": "range", "value": 24, "min": 3, "max": 128, "step": 1}, {"attr": "steps", "label": "Steps", "type": "range", "value": 2, "min": 1, "max": 16, "step": 1}, {"attr": "closed", "label": "Closed sections", "type": "toggle", "value": true}, {"attr": "flip", "label": "Flip normals", "type": "toggle", "value": false}]});
export namespace SurfaceModifier3D {
 export type ModifierOptions=Options;
 export class SurfaceModifier3D extends ParametricModifier3D {
  constructor(mesh:B.Interfaces.MeshLike,options:Options={}){super(mesh,options,(g,o)=>surface(o));}
 }
 @Component('arianna-surface',{},{Shadow:false,Attributes:["disabled", "viewport", "for", "enabled", "profile", "path", "sections", "levels", "bevel-profile", "angle-deg", "direction-deg", "twist-deg", "samples", "steps", "closed", "flip"],Properties:['options']})
 export class SurfaceModifierElement extends ParametricModifierElement {
  public override sourceFields=['sections'] as const;
  public template=Templates.Template.Html``;
  protected createModifier(mesh:B.Interfaces.MeshLike):B.Modifier3D{
   const options=this.readOptions();
   if(!options.profile&&Array.isArray(mesh.userData.profile2D))options.profile=mesh.userData.profile2D as Options['profile'];
   if(!options.path&&Array.isArray(mesh.userData.path3D))options.path=mesh.userData.path3D as Options['path'];
   if(!options.sections&&Array.isArray(mesh.userData.sections3D))options.sections=mesh.userData.sections3D as Options['sections'];
   return new SurfaceModifier3D(mesh,options);
  }
 }
}
export default SurfaceModifier3D.SurfaceModifier3D;
