export interface PositionOptions { HighAccuracy?: boolean; Timeout?: number; MaximumAge?: number; }
export class Geolocation
{
    static Current(options: PositionOptions = {}): Promise<GeolocationPosition>
    {
        return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: options.HighAccuracy, timeout: options.Timeout, maximumAge: options.MaximumAge }));
    }
    static Watch(callback: PositionCallback, error?: PositionErrorCallback, options: PositionOptions = {}): () => void
    {
        const id = navigator.geolocation.watchPosition(callback, error, { enableHighAccuracy: options.HighAccuracy, timeout: options.Timeout, maximumAge: options.MaximumAge });
        return () => navigator.geolocation.clearWatch(id);
    }
}

