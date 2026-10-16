import { NativeBridge } from './NativeBridge.ts';
export type HapticStyle = 'selection' | 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
export class Haptics
{
    static async Impact(style: HapticStyle = 'medium'): Promise<void>
    {
        if(NativeBridge.Available()) { await NativeBridge.Invoke('haptic_impact', { style }); return; }
        navigator.vibrate?.(style === 'heavy' ? 35 : style === 'medium' ? 20 : 10);
    }
}

