/** @module components/graphics/colors/RGBColorPicker */
import { Component } from '../../../core/index.ts';
import { ColorSpacePickerBase, ColorSpacePickerStyles, type PickerConfig } from './ColorSpacePickerBase.ts';

const Config:PickerConfig={space:'rgb',title:'RGB Color Picker',geometry:'plane',channels:[{key:'r',label:'R',min:0,max:255,step:1,decimals:0},{key:'g',label:'G',min:0,max:255,step:1,decimals:0},{key:'b',label:'B',min:0,max:255,step:1,decimals:0}],plane:['r','g']};

@Component('arianna-rgb-color-picker',ColorSpacePickerStyles,{Shadow:false,Attributes:['value','color','alpha','theme','geometry','space']})
export class RGBColorPicker extends ColorSpacePickerBase {
    public static readonly Styles=ColorSpacePickerStyles;
    protected get Config():PickerConfig { return Config; }
}

export default RGBColorPicker;
