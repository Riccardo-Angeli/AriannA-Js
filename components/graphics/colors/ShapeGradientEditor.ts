/** Shared live gradient studio, initial tab: shape. */
import {Component} from '../../../core/index.ts';
import type {GradientStop,RGBA} from './GradientEditor.ts';
import {GradientPickerBase,type GradientMode} from './GradientPickerBase.ts';
import {PickerStyles} from './PickerUI.ts';
export namespace ShapeGradientEditor {
 export interface ShapeStop{x:number;y:number;color:RGBA;radius?:number;}
 export interface ShapeGradientEditorOptions{points?:ShapeStop[];width?:number;height?:number;theme?:'dark'|'light';}

 export const Styles=PickerStyles;
 @Component('arianna-shape-gradient-editor',Styles,{Shadow:false,Attributes:['theme','angle','cx','cy','shape','size','interp','interpolation'],Properties:['stops','points','mode']})
 export class ShapeGradientEditor extends GradientPickerBase { protected get DefaultMode():GradientMode{return 'shape';} }
}

export type ShapeStop=ShapeGradientEditor.ShapeStop;export type ShapeGradientEditorOptions=ShapeGradientEditor.ShapeGradientEditorOptions;export default ShapeGradientEditor.ShapeGradientEditor;
