/**
 * @module    components/modifiers/2D/Base
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Modifier2D — base custom element for 2D behavior modifiers.
 *
 * # The Modifier pattern
 *
 * A modifier is a custom element with NO visual chrome of its own. It is
 * placed declaratively as a child of any host element and modifies the
 * host's behavior (drag, resize, rotate, etc).
 *
 * @example
 *   <arianna-window>
 *     <arianna-resizer handles="se,sw,ne,nw"></arianna-resizer>
 *     <arianna-mover></arianna-mover>
 *     <div>content here</div>
 *   </arianna-window>
 *
 *   <arianna-accordion>
 *     <arianna-resizer handles="e,w"></arianna-resizer>
 *     <!-- sections -->
 *   </arianna-accordion>
 *
 * # How modifiers find their target
 *
 *   The default target is `this.parentElement`. Subclasses can override
 *   `resolveTarget()` to use a different rule (e.g. `closest('[data-resizable]')`).
 *
 * # Lifecycle
 *
 *   - `onMount()`     — modifier is in the DOM with a parent. Call `applyTo(target)`.
 *   - `onUnmount()`   — cleanup all listeners and DOM mutations.
 *
 * # Auto-hide
 *
 *   Modifier hosts use `display: contents` so they take no layout space and
 *   leave the parent's flex/grid intact. The handles they inject as DOM
 *   children of the target ARE visible — that's the whole point.
 *
 * # Per-element state
 *
 *   Concrete modifiers typically hold state per-target via WeakMap keyed on
 *   the HTMLElement, plus a cleanup function array attached to this instance.
 *
 * # Events
 *
 *   Modifiers dispatch `arianna:<modifier>-<event>` from the target so they
 *   bubble naturally up through the parent (window/accordion/etc).
 */

import { Component } from '../../../core/Component.ts';

export interface ModifierContext
{
    /** The element the modifier acts on. */
    target : HTMLElement;
    /** The modifier custom element host (this). */
    host   : HTMLElement;
}

/**
 * Resolve a target from a string selector, an HTMLElement, or a render()-style
 * helper. Mostly used by tests / non-declarative usage of modifiers.
 */
export function resolveTargets(input: string | HTMLElement | HTMLElement[] | { render(): Element }): HTMLElement[]
{
    const inputs = Array.isArray(input) ? input : [input];
    const result: HTMLElement[] = [];
    for (const t of inputs) {
        if (typeof t === 'string') {
            document.querySelectorAll<HTMLElement>(t).forEach(el => result.push(el));
        } else if (t instanceof HTMLElement) {
            result.push(t);
        } else if (typeof (t as { render(): Element }).render === 'function') {
            const el = (t as { render(): Element }).render();
            if (el instanceof HTMLElement) result.push(el);
        }
    }
    return result;
}

/**
 * Base class for declarative 2D modifiers.
 *
 * Subclasses MUST:
 *   - Define their tag via the `Component('arianna-xxx', ...)` factory
 *   - Implement `applyTo(target)` to set up their behavior on the target
 *   - Push cleanup functions into `this.cleanups` to be auto-called on unmount
 */
export class Modifier2D extends Component('arianna-modifier-2d', HTMLElement, {}, {
    attrs : ['enabled'],
    shadow: false,
})
{
    /** Currently attached cleanup callbacks. Run on unmount. */
    protected cleanups: Array<() => void> = [];

    /** The element this modifier modifies. Defaults to parentElement. */
    protected target: HTMLElement | null = null;

    build(_opts: object = {})
    {
        // No template — modifiers are pure-behavior, zero chrome.
        // The host element collapses with display:contents.
    }

    /**
     * Resolve the target element this modifier operates on. Default is the
     * parent element. Override in subclasses to pick a different ancestor
     * (e.g. `closest('[data-resizable]')`).
     */
    protected resolveTarget(): HTMLElement | null
    {
        return this.parentElement;
    }

    /**
     * Override in subclasses. Wire up behavior on the given target. Push any
     * cleanup callbacks into `this.cleanups`.
     */
    protected applyTo(_target: HTMLElement): void
    {
        // Subclass override
    }

    /** Programmatic enable. */
    enable(): this  { this.removeAttribute('disabled'); return this; }

    /** Programmatic disable. Listeners stay attached but become no-ops. */
    disable(): this { this.setAttribute('disabled', ''); return this; }

    /** Whether this modifier is currently active. */
    get isEnabled(): boolean { return !this.hasAttribute('disabled'); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount() {
        // Hide the host element itself — it's pure behavior, no chrome.
        this.style.display = 'contents';
        // Resolve target lazily; if attached after parent renders, this works.
        // Schedule on microtask so parent has finished mounting children first.
        queueMicrotask(() => {
            this.target = this.resolveTarget();
            if (this.target) this.applyTo(this.target);
        });
    }
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount() {
        // Run all cleanup functions
        for (const fn of this.cleanups) {
            try { fn(); } catch (e) { console.warn('[Modifier2D] cleanup error', e); }
        }
        this.cleanups = [];
        this.target = null;
    }

    get enabled(): boolean  { return !this.hasAttribute('disabled'); }
    set enabled(v: boolean) { v ? this.removeAttribute('disabled') : this.setAttribute('disabled', ''); }
}

export default Modifier2D;
