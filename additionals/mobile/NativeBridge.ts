export interface MobileNativeAdapter
{
    Invoke<T = unknown>(command: string, payload?: Record<string, unknown>): Promise<T>;
    IsAvailable?(command?: string): boolean;
}

type TauriInternals = { invoke?: <T>(command: string, payload?: Record<string, unknown>) => Promise<T> };

export class NativeBridge
{
    static #adapter: MobileNativeAdapter | null = null;

    static Use(adapter: MobileNativeAdapter | null): void { this.#adapter = adapter; }

    static Available(command?: string): boolean
    {
        if(this.#adapter) return this.#adapter.IsAvailable?.(command) ?? true;
        // A Tauri runtime alone does not prove that the mobile plugin is installed.
        // Register its supported commands through Use(adapter) before reporting availability.
        return false;
    }

    static async Invoke<T = unknown>(command: string, payload: Record<string, unknown> = {}): Promise<T>
    {
        if(this.#adapter) return this.#adapter.Invoke<T>(command, payload);
        const invoke = (globalThis as typeof globalThis & { __TAURI_INTERNALS__?: TauriInternals }).__TAURI_INTERNALS__?.invoke;
        if(!invoke) throw new Error(`Native mobile command is unavailable: ${command}`);
        return invoke<T>(`plugin:arianna-mobile|${command}`, payload);
    }
}

