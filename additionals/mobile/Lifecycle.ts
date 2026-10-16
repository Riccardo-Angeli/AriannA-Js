export type LifecycleState = 'active' | 'inactive' | 'hidden';
export class Lifecycle
{
    static State(): LifecycleState { return document.hidden ? 'hidden' : document.hasFocus() ? 'active' : 'inactive'; }
    static Observe(callback: (state: LifecycleState) => void): () => void { const listener = () => callback(this.State()); document.addEventListener('visibilitychange', listener); addEventListener('focus', listener); addEventListener('blur', listener); listener(); return () => { document.removeEventListener('visibilitychange', listener); removeEventListener('focus', listener); removeEventListener('blur', listener); }; }
}

