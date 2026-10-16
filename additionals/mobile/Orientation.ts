import { NativeBridge } from './NativeBridge.ts';
export type OrientationMode = 'any' | 'natural' | 'landscape' | 'portrait' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary' | 'system';
type LockableOrientation = ScreenOrientation & { lock(mode: Exclude<OrientationMode, 'system'>): Promise<void> };
export class Orientation
{
    static async Lock(mode: OrientationMode): Promise<void>
    {
        if(mode === 'system') return this.Unlock();
        try { await (screen.orientation as LockableOrientation).lock(mode); }
        catch { if(NativeBridge.Available()) await NativeBridge.Invoke('orientation_lock', { mode }); else throw new Error('Orientation lock is unsupported'); }
    }
    static async Unlock(): Promise<void> { try { screen.orientation.unlock(); } catch { if(NativeBridge.Available()) await NativeBridge.Invoke('orientation_unlock'); } }
}

