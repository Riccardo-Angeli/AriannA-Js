import { NativeBridge } from './NativeBridge.ts';
export interface MobileNotification { Title: string; Body?: string; Tag?: string; Data?: Record<string, unknown>; }
export class Notifications
{
    static async Permission(): Promise<NotificationPermission>
    {
        if(typeof Notification === 'undefined') return 'denied';
        return Notification.permission === 'default' ? Notification.requestPermission() : Notification.permission;
    }
    static async Show(value: MobileNotification): Promise<void>
    {
        if(NativeBridge.Available()) { try { await NativeBridge.Invoke('notification_show', { ...value }); return; } catch { /* Web fallback. */ } }
        if(typeof Notification === 'undefined') throw new Error('Notifications are unavailable: install a native mobile adapter');
        if(await this.Permission() !== 'granted') throw new Error('Notification permission denied');
        new Notification(value.Title, { body: value.Body, tag: value.Tag, data: value.Data });
    }
}

