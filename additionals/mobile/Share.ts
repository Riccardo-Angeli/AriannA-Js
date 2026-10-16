import { NativeBridge } from './NativeBridge.ts';
export interface ShareData { Title?: string; Text?: string; Url?: string; Files?: File[]; }
export class Share
{
    static async Open(data: ShareData): Promise<void>
    {
        const native: globalThis.ShareData = { title: data.Title, text: data.Text, url: data.Url, files: data.Files };
        if(navigator.share && (!native.files?.length || navigator.canShare?.(native))) { await navigator.share(native); return; }
        if(NativeBridge.Available()) { await NativeBridge.Invoke('share_open', { title: data.Title, text: data.Text, url: data.Url }); return; }
        if(data.Url || data.Text) await navigator.clipboard.writeText([data.Text, data.Url].filter(Boolean).join('\n'));
    }
}

