/** @module components/graphics/colors/CMYKColorPicker */
import { Component } from '../../../core/index.ts';
import { ColorSpacePickerBase, ColorSpacePickerStyles, type PickerConfig } from './ColorSpacePickerBase.ts';

const Config:PickerConfig={space:'cmyk',title:'CMYK Color Picker',geometry:'plane',channels:[{key:'c',label:'C',min:0,max:100,step:.1,unit:'%',decimals:1},{key:'m',label:'M',min:0,max:100,step:.1,unit:'%',decimals:1},{key:'y',label:'Y',min:0,max:100,step:.1,unit:'%',decimals:1},{key:'k',label:'K',min:0,max:100,step:.1,unit:'%',decimals:1}],plane:['c','m']};

@Component('arianna-cmyk-color-picker',ColorSpacePickerStyles,{Shadow:false,Attributes:['value','color','alpha','theme']})
export class CMYKColorPicker extends ColorSpacePickerBase {
    public static readonly Styles=ColorSpacePickerStyles;
    protected get Config():PickerConfig { return Config; }
}

export default CMYKColorPicker;
