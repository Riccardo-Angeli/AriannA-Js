import { NativeBridge } from './NativeBridge.ts';

export interface IdentityCardData
{
    DocumentType: string; IssuingCountry: string; DocumentNumber: string; Surname: string; GivenNames: string;
    Nationality: string; BirthDate: string; Sex: string; ExpiryDate: string; OptionalData: string;
    Portrait?: Uint8Array; Source: 'mrz' | 'nfc'; ChecksValid: boolean;
}
export interface IdentityCardReadOptions { CAN?: string; MRZ?: string; ReadPortrait?: boolean; Signal?: AbortSignal; }

const values = (text: string) => [...text].reduce((sum, char, index) => sum + ('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(char) < 0 ? 0 : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(char)) * [7, 3, 1][index % 3], 0) % 10;
const date = (raw: string, expiry = false) => { const year = Number(raw.slice(0, 2)); const full = (expiry ? year >= 70 : year > new Date().getFullYear() % 100) ? 1900 + year : 2000 + year; return `${full.toString().padStart(4, '0')}-${raw.slice(2, 4)}-${raw.slice(4, 6)}`; };

export class IdentityCardReader
{
    static ParseMRZ(input: string): IdentityCardData
    {
        const lines = input.toUpperCase().replace(/[^A-Z0-9<\n]/g, '').split(/\n+/).filter(Boolean);
        if(lines.length !== 3 || lines.some(line => line.length !== 30)) throw new Error('Expected an ICAO TD1 MRZ: three lines of 30 characters');
        const [a, b, c] = lines; const names = c.split('<<');
        const documentNumber = a.slice(5, 14); const birth = b.slice(0, 6); const expiry = b.slice(8, 14);
        const composite = a.slice(5, 30) + b.slice(0, 7) + b.slice(8, 15) + b.slice(18, 29);
        return {
            DocumentType: a.slice(0, 2).replaceAll('<', ''), IssuingCountry: a.slice(2, 5).replaceAll('<', ''), DocumentNumber: documentNumber.replaceAll('<', ''),
            Surname: (names[0] ?? '').replaceAll('<', ' ').trim(), GivenNames: (names[1] ?? '').replaceAll('<', ' ').trim(), Nationality: b.slice(15, 18).replaceAll('<', ''),
            BirthDate: date(birth), Sex: b[7] === '<' ? '' : b[7], ExpiryDate: date(expiry, true), OptionalData: (a.slice(15, 30) + b.slice(18, 29)).replaceAll('<', '').trim(), Source: 'mrz',
            ChecksValid: values(documentNumber) === Number(a[14]) && values(birth) === Number(b[6]) && values(expiry) === Number(b[14]) && values(composite) === Number(b[29])
        };
    }

    static async Read(options: IdentityCardReadOptions): Promise<IdentityCardData>
    {
        if(options.Signal?.aborted) throw options.Signal.reason;
        if(options.MRZ && !NativeBridge.Available('identity_card_read')) return this.ParseMRZ(options.MRZ);
        if(!NativeBridge.Available('identity_card_read')) throw new Error('CIE NFC reading requires the AriannA native mobile adapter');
        const result = await NativeBridge.Invoke<IdentityCardData>('identity_card_read', { can: options.CAN, mrz: options.MRZ, readPortrait: options.ReadPortrait ?? false });
        if(options.Signal?.aborted) throw options.Signal.reason;
        return result;
    }
}

