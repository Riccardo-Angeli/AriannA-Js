import { NativeBridge,type MobileNativeAdapter } from '../NativeBridge.ts';

export type TauriInvoke = <T>(command:string,payload?:Record<string,unknown>)=>Promise<T>;

export const MobileCommands = new Set([
    'permission_query','permission_request','haptic_impact','biometric_authenticate',
    'camera_focus','camera_torch','media_pick','media_save','notification_show',
    'orientation_lock','orientation_unlock','keyboard_hide','nfc_scan','nfc_write',
    'share_open','identity_card_read'
]);

export class TauriMobileAdapter implements MobileNativeAdapter
{
    constructor(private readonly InvokeFunction:TauriInvoke,private readonly Commands:ReadonlySet<string>=MobileCommands){}
    IsAvailable(command?:string):boolean{return command ? this.Commands.has(command) : this.Commands.size>0}
    Invoke<T>(command:string,payload:Record<string,unknown>={}):Promise<T>
    {
        if(!this.IsAvailable(command))return Promise.reject(new Error(`Unsupported AriannA mobile command: ${command}`));
        return this.InvokeFunction<T>(`plugin:arianna-mobile|${command}`,payload);
    }
    static Install(invoke?:TauriInvoke,commands?:Iterable<string>):TauriMobileAdapter
    {
        const actual=invoke??(globalThis as typeof globalThis&{__TAURI_INTERNALS__?:{invoke?:TauriInvoke}}).__TAURI_INTERNALS__?.invoke;
        if(!actual)throw new Error('Tauri invoke is unavailable');
        const adapter=new TauriMobileAdapter(actual,commands?new Set(commands):MobileCommands);NativeBridge.Use(adapter);return adapter;
    }
}
