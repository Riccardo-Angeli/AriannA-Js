/** @module components/graphics/colors/CIEUVWColorPicker */
import { Component } from '../../../core/index.ts';
import { ColorSpacePickerBase, ColorSpacePickerStyles, type PickerConfig } from './ColorSpacePickerBase.ts';

@Component('arianna-cieuvw-color-picker',ColorSpacePickerStyles,{Shadow:false,Attributes:['value','color','alpha','theme']})
export class CIEUVWColorPicker extends ColorSpacePickerBase {
    public static readonly Styles=ColorSpacePickerStyles;
    protected readonly Config:PickerConfig={
        space:'uvw', title:'CIE UVW Color Picker', geometry:'plane',
        channels:[
            {key:'U',label:'U*',min:-120,max:180,step:0.1,unit:'',decimals:1},
            {key:'V',label:'V*',min:-150,max:120,step:0.1,unit:'',decimals:1},
            {key:'W',label:'W*',min:-17,max:83,step:0.1,unit:'',decimals:1}
        ],
        plane:['U','V']
    };
}
export default CIEUVWColorPicker;
