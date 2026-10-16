import { NativeBridge } from './NativeBridge.ts';

export type CameraFacing = 'user' | 'environment';
export interface CameraOptions { Facing?: CameraFacing; Audio?: boolean; Width?: number; Height?: number; FrameRate?: number; }
export interface CapturedPhoto { Blob: Blob; Width: number; Height: number; Type: string; }

export class Camera
{
    #stream: MediaStream | null = null;
    #options: Required<CameraOptions>;
    constructor(options: CameraOptions = {})
    {
        this.#options = { Facing: options.Facing ?? 'environment', Audio: options.Audio ?? false, Width: options.Width ?? 1920, Height: options.Height ?? 1080, FrameRate: options.FrameRate ?? 30 };
    }
    get Stream(): MediaStream | null { return this.#stream; }
    get Facing(): CameraFacing { return this.#options.Facing; }
    async Open(video?: HTMLVideoElement): Promise<MediaStream>
    {
        await this.Close();
        this.#stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: this.#options.Facing }, width: { ideal: this.#options.Width }, height: { ideal: this.#options.Height }, frameRate: { ideal: this.#options.FrameRate } }, audio: this.#options.Audio });
        if(video) { video.srcObject = this.#stream; video.muted = true; video.playsInline = true; await video.play(); }
        return this.#stream;
    }
    async Switch(video?: HTMLVideoElement): Promise<MediaStream>
    {
        this.#options.Facing = this.#options.Facing === 'environment' ? 'user' : 'environment';
        return this.Open(video);
    }
    async Photo(video: HTMLVideoElement, type = 'image/jpeg', quality = .92): Promise<CapturedPhoto>
    {
        if(!video.videoWidth) throw new Error('Camera preview is not ready');
        const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        canvas.getContext('2d', { alpha: false })!.drawImage(video, 0, 0);
        const BlobValue = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Camera capture failed')), type, quality));
        return { Blob: BlobValue, Width: canvas.width, Height: canvas.height, Type: BlobValue.type };
    }
    async Torch(enabled = true): Promise<void>
    {
        const track = this.#stream?.getVideoTracks()[0];
        if(!track) throw new Error('Camera is closed');
        try { await track.applyConstraints({ advanced: [{ torch: enabled } as MediaTrackConstraintSet] }); }
        catch { if(NativeBridge.Available()) await NativeBridge.Invoke('camera_torch', { enabled }); else throw new Error('Torch is unsupported'); }
    }
    async Focus(x = .5, y = .5): Promise<void>
    {
        if(NativeBridge.Available()) await NativeBridge.Invoke('camera_focus', { x, y });
    }
    async Close(): Promise<void> { this.#stream?.getTracks().forEach(track => track.stop()); this.#stream = null; }
    async Devices(): Promise<MediaDeviceInfo[]> { return (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind === 'videoinput'); }
}

