import { NativeBridge } from './NativeBridge.ts';
export interface BiometricResult { Success: boolean; Method?: 'face' | 'fingerprint' | 'device'; Error?: string; }
export class Biometrics
{
    static get Available(): boolean { return NativeBridge.Available('biometric_authenticate'); }
    static async Authenticate(reason = 'Confirm your identity'): Promise<BiometricResult>
    {
        if(!this.Available) return { Success: false, Error: 'Native biometric adapter unavailable' };
        return NativeBridge.Invoke<BiometricResult>('biometric_authenticate', { reason });
    }
}

