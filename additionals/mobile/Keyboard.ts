export interface KeyboardMetrics { Visible: boolean; Height: number; }
export class Keyboard
{
    static Metrics(): KeyboardMetrics { const viewport = visualViewport; const height = viewport ? Math.max(0, innerHeight - viewport.height - viewport.offsetTop) : 0; return { Visible: height > 80, Height: height }; }
    static Observe(callback: (metrics: KeyboardMetrics) => void): () => void
    {
        const listener = () => callback(this.Metrics()); visualViewport?.addEventListener('resize', listener); visualViewport?.addEventListener('scroll', listener); listener();
        return () => { visualViewport?.removeEventListener('resize', listener); visualViewport?.removeEventListener('scroll', listener); };
    }
    static Hide(): void { if(document.activeElement instanceof HTMLElement) document.activeElement.blur(); }
}

