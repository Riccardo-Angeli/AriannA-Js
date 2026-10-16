export interface ConnectivityState { Online: boolean; Type?: string; Downlink?: number; EffectiveType?: string; }
type NetworkInformation = { type?: string; downlink?: number; effectiveType?: string; addEventListener(type: string, listener: EventListener): void; removeEventListener(type: string, listener: EventListener): void; };
export class Connectivity
{
    static State(): ConnectivityState { const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection; return { Online: navigator.onLine, Type: connection?.type, Downlink: connection?.downlink, EffectiveType: connection?.effectiveType }; }
    static Observe(callback: (state: ConnectivityState) => void): () => void
    {
        const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection; const listener = () => callback(this.State());
        addEventListener('online', listener); addEventListener('offline', listener); connection?.addEventListener('change', listener); listener();
        return () => { removeEventListener('online', listener); removeEventListener('offline', listener); connection?.removeEventListener('change', listener); };
    }
}

