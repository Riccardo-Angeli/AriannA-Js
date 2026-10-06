/** Compatibility adapter for the original string-valued pickers. */
import {Templates} from '../../../core/index.ts';
import HSVColorPicker from './HSVColorPicker.ts';
import {PickerStyles,installPickerStyle} from './PickerUI.ts';
import type {PickerGeometry} from './ColorSpacePickerBase.ts';
interface State{child?:HSVColorPicker;value:string;palette?:string[];geometry?:PickerGeometry;}
const states=new WeakMap<object,State>();
const state=(o:object):State=>{let s=states.get(o);if(!s){s={value:'#E40C88'};states.set(o,s);}return s;};
export abstract class ColorPickerAdapter extends HTMLElement{
 public static readonly Styles=PickerStyles;public template=Templates.Template.Html``;
 protected abstract get DefaultGeometry():PickerGeometry;
 public get value():string{return (state(this).child?.value||state(this).value).slice(0,7).toUpperCase();}
 public set value(v:string){this.setColor(v);}
 public get geometry():PickerGeometry{return state(this).geometry||(this.getAttribute('geometry') as PickerGeometry)||this.DefaultGeometry;}
 public set geometry(v:PickerGeometry){state(this).geometry=v;if(state(this).child)state(this).child!.geometry=v;}
 public get palette():string[]{return state(this).child?.palette||[...(state(this).palette||[])];}
 public set palette(v:string[]){state(this).palette=[...v];if(state(this).child)state(this).child!.palette=v;}
 public getRecent():string[]{return state(this).child?.getRecent()||[];}
 public getColor():string{return this.value;}
 public setColor(v:string):this{const s=state(this);s.value=v;if(s.child)s.child.setColor(v);return this;}
 public onCreated():void{if(this.isConnected)this.onConnected();}
 public onConnected():void{installPickerStyle(this);const s=state(this);if(!s.child){const child=new HSVColorPicker();s.child=child;child.setAttribute('label',this.DefaultGeometry==='ring'?'Colour Wheel':this.DefaultGeometry==='square'?'Colour Square':'Swatches');child.geometry=this.geometry;child.setColor(this.getAttribute('value')||this.getAttribute('color')||s.value);if(s.palette)child.palette=s.palette;child.addEventListener('arianna:change',e=>{e.stopPropagation();s.value=child.value;this.dispatchEvent(new CustomEvent('arianna:change',{bubbles:true,composed:true,detail:{value:this.value,source:this}}));});this.appendChild(child);}s.child.setAttribute('theme',this.getAttribute('theme')||'dark');s.child.style.cssText='width:100%;border:0;border-radius:0';}
 public onAttributeChanged(n:string):void{const s=state(this);if(n==='value'||n==='color')this.setColor(this.getAttribute(n)||'#E40C88');else if(n==='theme')s.child?.setAttribute('theme',this.getAttribute(n)||'dark');else if(n==='geometry'&&s.child)s.child.geometry=this.geometry;}
}
