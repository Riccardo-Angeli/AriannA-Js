export type MobilePlatformName = 'ios' | 'android' | 'web' | 'desktop';

export class Platform
{
    static get Name(): MobilePlatformName
    {
        const ua = navigator.userAgent;
        if(/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
        if(/Android/i.test(ua)) return 'android';
        if(matchMedia('(pointer: coarse)').matches) return 'web';
        return 'desktop';
    }
    static get IsIOS(): boolean { return this.Name === 'ios'; }
    static get IsAndroid(): boolean { return this.Name === 'android'; }
    static get IsMobile(): boolean { return this.IsIOS || this.IsAndroid || matchMedia('(pointer: coarse)').matches; }
    static get IsTauri(): boolean { return '__TAURI_INTERNALS__' in globalThis; }
    static get Standalone(): boolean { return matchMedia('(display-mode: standalone)').matches; }
}

