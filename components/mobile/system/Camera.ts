import { Component } from '../../../core/index.ts';import { Camera as CameraService,type CameraFacing } from '../../../additionals/mobile/Camera.ts';import { MobileElement,MobileStyles,type AttributeOptions } from '../core/Base.ts';
export interface CameraOptions extends AttributeOptions{Facing?:CameraFacing;Audio?:boolean}
@Component('arianna-camera',MobileStyles,{Shadow:false,Attributes:['facing','audio','open','theme']})
export class Camera extends MobileElement
{
    private CameraService?:CameraService;private VideoElement?:HTMLVideoElement;get Service(){return this.CameraService??=new CameraService({Facing:(this.getAttribute('facing')??'environment')as CameraFacing,Audio:this.hasAttribute('audio')})}get Video(){return this.VideoElement??=document.createElement('video')}constructor(o:CameraOptions={}){super();this.Apply(o);this.CameraService=new CameraService({Facing:o.Facing,Audio:o.Audio})}
    onConnected(){this.Initialize();this.Video.autoplay=true;this.Video.muted=true;this.Video.playsInline=true;this.Video.style.cssText='display:block;width:100%;height:100%;object-fit:cover;border-radius:12px;background:#050506';this.replaceChildren(this.Video);if(this.hasAttribute('open'))void this.Open()}onUnmount(){void this.Close()}
    async Open(){await this.Service.Open(this.Video);this.setAttribute('open','');this.Emit('arianna:open')}async Close(){await this.Service.Close();this.removeAttribute('open');this.Emit('arianna:close')}async Switch(){await this.Service.Switch(this.Video);this.setAttribute('facing',this.Service.Facing)}async Capture(){const photo=await this.Service.Photo(this.Video);this.Emit('arianna:capture',photo);return photo}
}
