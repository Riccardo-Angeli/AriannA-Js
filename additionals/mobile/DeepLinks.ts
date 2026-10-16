export class DeepLinks
{
    static Current(): URL { return new URL(location.href); }
    static Observe(callback: (url: URL) => void): () => void { const listener = () => callback(this.Current()); addEventListener('hashchange', listener); addEventListener('popstate', listener); return () => { removeEventListener('hashchange', listener); removeEventListener('popstate', listener); }; }
    static Open(url: string | URL): void { location.href = String(url); }
}

