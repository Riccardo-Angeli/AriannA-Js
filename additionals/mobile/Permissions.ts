import { NativeBridge } from './NativeBridge.ts';

export type MobilePermission = 'camera' | 'microphone' | 'geolocation' | 'notifications' | 'nfc' | 'biometrics' | 'photos';
export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export class Permissions
{
    static async Query(name: MobilePermission): Promise<PermissionState>
    {
        if(NativeBridge.Available())
        {
            try { return await NativeBridge.Invoke<PermissionState>('permission_query', { name }); } catch { /* Web fallback. */ }
        }
        if(name === 'notifications' && 'Notification' in globalThis) return Notification.permission === 'default' ? 'prompt' : Notification.permission;
        if(!navigator.permissions) return 'unsupported';
        try { return (await navigator.permissions.query({ name: name as PermissionName })).state; }
        catch { return 'unsupported'; }
    }

    static async Request(name: MobilePermission): Promise<PermissionState>
    {
        if(name === 'notifications' && 'Notification' in globalThis)
        {
            const permission = await Notification.requestPermission();
            return permission === 'default' ? 'prompt' : permission;
        }
        if(name === 'camera' || name === 'microphone')
        {
            try
            {
                const stream = await navigator.mediaDevices.getUserMedia({ video: name === 'camera', audio: name === 'microphone' });
                stream.getTracks().forEach(track => track.stop());
                return 'granted';
            }
            catch(error) { return error instanceof DOMException && error.name === 'NotAllowedError' ? 'denied' : 'unsupported'; }
        }
        if(NativeBridge.Available())
        {
            try { return await NativeBridge.Invoke<PermissionState>('permission_request', { name }); } catch { /* Continue. */ }
        }
        return this.Query(name);
    }
}

