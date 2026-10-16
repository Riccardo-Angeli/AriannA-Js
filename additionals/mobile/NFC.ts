import { NativeBridge } from './NativeBridge.ts';
export interface NFCRecord { Type: string; Data: string | Uint8Array; Id?: string; }
type NDEFReaderLike = { scan(options?: { signal?: AbortSignal }): Promise<void>; write(message: unknown): Promise<void>; onreading: ((event: { serialNumber?: string; message: { records: Array<{ recordType: string; data?: DataView; id?: string }> } }) => void) | null; };
export class NFC
{
    static get Available(): boolean { return 'NDEFReader' in globalThis || NativeBridge.Available('nfc_scan'); }
    static async Scan(signal?: AbortSignal): Promise<NFCRecord[]>
    {
        if('NDEFReader' in globalThis)
        {
            const reader = new (globalThis as typeof globalThis & { NDEFReader: new () => NDEFReaderLike }).NDEFReader();
            await reader.scan({ signal });
            return new Promise((resolve, reject) => { signal?.addEventListener('abort', () => reject(signal.reason), { once: true }); reader.onreading = event => resolve(event.message.records.map(record => ({ Type: record.recordType, Id: record.id, Data: record.data ? new Uint8Array(record.data.buffer, record.data.byteOffset, record.data.byteLength) : '' }))); });
        }
        return NativeBridge.Invoke<NFCRecord[]>('nfc_scan');
    }
    static async Write(records: NFCRecord[]): Promise<void>
    {
        if('NDEFReader' in globalThis) { const reader = new (globalThis as typeof globalThis & { NDEFReader: new () => NDEFReaderLike }).NDEFReader(); await reader.write({ records }); return; }
        await NativeBridge.Invoke('nfc_write', { records });
    }
}

