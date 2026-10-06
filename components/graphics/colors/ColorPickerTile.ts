import {Component} from '../../../core/index.ts';
import {ColorPickerAdapter} from './ColorPickerAdapter.ts';
import {PickerStyles} from './PickerUI.ts';
import type {PickerGeometry} from './ColorSpacePickerBase.ts';
export namespace ColorPickerTile {
 export namespace Interfaces { export interface ColorPickerTileOptions {value?:string;color?:string;theme?:'dark'|'light';geometry?:PickerGeometry;palette?:string[];} }
 export const Styles=PickerStyles;
 @Component('arianna-color-picker-tile',Styles,{Shadow:false,Attributes:['value','color','theme','geometry'],Properties:['palette']})
 export class ColorPickerTile extends ColorPickerAdapter {protected get DefaultGeometry():PickerGeometry{return 'swatches';}}
}
export type ColorPickerTileOptions=ColorPickerTile.Interfaces.ColorPickerTileOptions;
export default ColorPickerTile.ColorPickerTile;
