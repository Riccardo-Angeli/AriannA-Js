import { Component } from '../../../core/index.ts';import { IdentityCardReader as Reader,type IdentityCardData } from '../../../additionals/mobile/IdentityCardReader.ts';import { MobileElement,MobileStyles,type AttributeOptions } from '../core/Base.ts';
export interface IdentityCardReaderOptions extends AttributeOptions{CAN?:string;MRZ?:string;ReadPortrait?:boolean}
@Component('arianna-identity-card-reader',MobileStyles,{Shadow:false,Attributes:['can','mrz','read-portrait','theme']})
export class IdentityCardReader extends MobileElement
{
    constructor(o:IdentityCardReaderOptions={}){super();this.Apply(o)}onConnected(){this.Initialize();this.Render()}
    onAttributeChanged(name:string,old:string|null,value:string|null){if(this.AttributeChanged(name,old,value,['can','mrz','read-portrait']))this.Render()}
    private Render(){this.classList.add('MobilePanel');const title=document.createElement('strong');title.textContent='Identity Card';const can=document.createElement('input');can.className='MobileField';can.placeholder='CAN';can.inputMode='numeric';can.value=this.getAttribute('can')??'';can.maxLength=6;const mrz=document.createElement('textarea');mrz.className='MobileField';mrz.placeholder='MRZ: 3 lines × 30 characters';mrz.value=this.getAttribute('mrz')??'';mrz.rows=3;const read=document.createElement('button');read.className='MobileButton';read.textContent='Read card';const status=document.createElement('output');read.onclick=async()=>{read.disabled=true;status.textContent='Reading…';try{const data=await this.Read(can.value,mrz.value);status.textContent=data.ChecksValid?'MRZ checks valid':'Read — check digits invalid'}catch(error){status.textContent=error instanceof Error?error.message:String(error)}finally{read.disabled=false}};this.replaceChildren(title,can,mrz,read,status)}
    async Read(CAN?:string,MRZ?:string):Promise<IdentityCardData>{const data=await Reader.Read({CAN,MRZ,ReadPortrait:this.hasAttribute('read-portrait')});this.Emit('arianna:identity',{Data:data});return data}
}

