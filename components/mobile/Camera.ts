import { Component } from '../../core/index.ts';import { Camera as CameraService,type CameraFacing } from '../../additionals/mobile/Camera.ts';import { MobileElement,MobileStyles,type AttributeOptions } from './Base.ts';
export interface CameraOptions extends AttributeOptions{Facing?:CameraFacing;Audio?:boolean}
@Component('arianna-camera',MobileStyles,{Shadow:false,Attributes:['facing','audio','open','theme']})
export class Camera extends MobileElement
{
    #camera:CameraService;#video=document.createElement('video');constructor(o:CameraOptions={}){super();this.Apply(o);this.#camera=new CameraService({Facing:o.Facing,Audio:o.Audio})}
    onConnected(){this.Initialize();this.#video.autoplay=true;this.#video.muted=true;this.#video.playsInline=true;this.#video.style.cssText='display:block;width:100%;height:100%;object-fit:cover;border-radius:12px;background:#050506';this.replaceChildren(this.#video);if(this.hasAttribute('open'))void this.Open()}onUnmount(){void this.Close()}
    async Open(){await this.#camera.Open(this.#video);this.setAttribute('open','');this.Emit('arianna:open')}async Close(){await this.#camera.Close();this.removeAttribute('open');this.Emit('arianna:close')}async Switch(){await this.#camera.Switch(this.#video);this.setAttribute('facing',this.#camera.Facing)}async Capture(){const photo=await this.#camera.Photo(this.#video);this.Emit('arianna:capture',photo);return photo}
}

