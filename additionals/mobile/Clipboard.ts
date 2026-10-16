export class Clipboard
{
    static WriteText(value: string): Promise<void> { return navigator.clipboard.writeText(value); }
    static ReadText(): Promise<string> { return navigator.clipboard.readText(); }
    static async WriteBlob(blob: Blob): Promise<void> { await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]); }
}

