import { NativeBridge } from './NativeBridge.ts';
export type MediaKind = 'image' | 'video' | 'audio' | 'any';
export interface MediaAsset { Name: string; Type: string; Size: number; File?: File; Uri?: string; }
export class MediaLibrary
{
    static async Pick(kind: MediaKind = 'any', multiple = false): Promise<MediaAsset[]>
    {
        if(NativeBridge.Available())
        {
            try { return await NativeBridge.Invoke<MediaAsset[]>('media_pick', { kind, multiple }); } catch { /* Browser fallback. */ }
        }
        const accept = kind === 'any' ? '*/*' : `${kind}/*`;
        return new Promise(resolve => { const input = document.createElement('input'); input.type = 'file'; input.accept = accept; input.multiple = multiple; input.onchange = () => resolve([...input.files ?? []].map(File => ({ Name: File.name, Type: File.type, Size: File.size, File }))); input.oncancel = () => resolve([]); input.click(); });
    }
    static async Save(blob: Blob, name: string): Promise<void>
    {
        if(NativeBridge.Available()) { try { await NativeBridge.Invoke('media_save', { name, bytes: [...new Uint8Array(await blob.arrayBuffer())], mime: blob.type }); return; } catch { /* Download fallback. */ } }
        const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url));
    }
}

