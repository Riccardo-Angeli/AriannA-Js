/** @module components/graphics/colors/CIEUVWColorPicker */
import { Component } from '../../../core/index.ts';
import { ColorSpacePickerBase, ColorSpacePickerStyles, type PickerConfig } from './ColorSpacePickerBase.ts';

const Config:PickerConfig={space:'uvw',title:'CIE UVW Color Picker',geometry:'plane',channels:[{key:'U',label:'U*',min:-120,max:180,step:.1,decimals:1},{key:'V',label:'V*',min:-150,max:120,step:.1,decimals:1},{key:'W',label:'W*',min:-17,max:83,step:.1,decimals:1}],plane:['U','V']};

@Component('arianna-cieuvw-color-picker',ColorSpacePickerStyles,{Shadow:false,Attributes:['value','color','alpha','theme','geometry','space']})
export class CIEUVWColorPicker extends ColorSpacePickerBase {
    public static readonly Styles=ColorSpacePickerStyles;
    protected get Config():PickerConfig { return Config; }
}

export default CIEUVWColorPicker;
