import {Component} from '../../../core/index.ts';
import {ColorPickerAdapter} from './ColorPickerAdapter.ts';
import {PickerStyles} from './PickerUI.ts';
import type {PickerGeometry} from './ColorSpacePickerBase.ts';
export namespace ColorPickerSquare {
 export namespace Interfaces { export interface ColorPickerSquareOptions {value?:string;color?:string;theme?:'dark'|'light';geometry?:PickerGeometry;palette?:string[];} }
 export const Styles=PickerStyles;
 @Component('arianna-color-picker-square',Styles,{Shadow:false,Attributes:['value','color','theme','geometry'],Properties:['palette']})
 export class ColorPickerSquare extends ColorPickerAdapter {protected get DefaultGeometry():PickerGeometry{return 'square';}}
}
export type ColorPickerSquareOptions=ColorPickerSquare.Interfaces.ColorPickerSquareOptions;
export default ColorPickerSquare.ColorPickerSquare;
