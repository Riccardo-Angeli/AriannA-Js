/**
 * @module    components/modifiers/2D/Base
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Base component module.
 */

import { Component } from '../../../core/index.ts';

/** @namespace   Modifier2D
 *  @public
 *  @description Namespace containing Modifier2D contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Modifier2D
{
    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   ModifierContext
         *  @public
         *  @description ModifierContext contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ModifierContext
        {
            /** The element the modifier acts on. */
            target: HTMLElement;

            /** The modifier custom element host (this). */
            host: HTMLElement;
        }
    }

    /**
     * Resolve a target from a string selector, an HTMLElement, or a render()-style
     * helper. Mostly used by tests / non-declarative usage of modifiers.
     */
    export function resolveTargets(input: string | HTMLElement | HTMLElement[] | {
        /** @name        render
         *  @public
         *  @type        {Element}
         *  @description Component member for render.
         *  @returns     {Element} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        render(): Element;
    }): HTMLElement[] {
        /** @name        inputs
         *  @public
         *  @type        {inferred}
         *  @description Namespace-owned inputs value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const inputs = Array.isArray(input) ? input : [input];

        /** @name        result
         *  @public
         *  @type        {HTMLElement[]}
         *  @description Namespace-owned result value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        const result: HTMLElement[] = [];
        for (const t of inputs)
        {
            if (typeof t === 'string')
            {
                document.querySelectorAll<HTMLElement>(t).forEach(el => result.push(el));
            }
            else if (t instanceof HTMLElement)
            {
                result.push(t);
            }
            else if (typeof (t as {
                /** @name        render
                 *  @public
                 *  @type        {Element}
                 *  @description Component member for render.
                 *  @returns     {Element} Result.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                render(): Element;
            }).render === 'function') {
                /** @name        el
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned el value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const el = (t as {
                    /** @name        render
                     *  @public
                     *  @type        {Element}
                     *  @description Component member for render.
                     *  @returns     {Element} Result.
                     *  @author      Riccardo Angeli
                     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                     *  @license     MIT / Commercial (dual license) */
                    render(): Element;
                }).render();
                if (el instanceof HTMLElement)
                    result.push(el);
            }
        }
        return result;
    }

    /** @name        ResolveTargets
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned ResolveTargets value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export function ResolveTargets(...args: Parameters<typeof resolveTargets>): ReturnType<typeof resolveTargets>
    {
        return resolveTargets(...args);
    }

    /**
     * Base class for declarative 2D modifiers.
     *
     * Subclasses MUST:
     *   - Define their tag via the `Component('arianna-xxx', ...)` factory
     *   - Implement `applyTo(target)` to set up their behavior on the target
     *   - Push cleanup functions into `this.cleanups` to be auto-called on unmount
     */
    @Component('arianna-modifier-2d', {}, {
        Attributes: ['enabled'],
    })
    export class Modifier2D extends HTMLElement
    {
        /** Currently attached cleanup callbacks. Run on unmount. */
        protected cleanups: Array<() => void> = [];

        /** The element this modifier modifies. Defaults to parentElement. */
        protected target: HTMLElement | null = null;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {object} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: object = {})
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
        enable(): this { this.removeAttribute('disabled'); return this; }

        /** Programmatic disable. Listeners stay attached but become no-ops. */
        disable(): this { this.setAttribute('disabled', ''); return this; }

        /** Whether this modifier is currently active. */
        get isEnabled(): boolean { return !this.hasAttribute('disabled'); }

        /** @name        onCreated
         *  @public
         *  @type        {void}
         *  @description Component member for on Created.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onCreated() { }

        /** @name        onBeforeMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeMount() { }

        /** @name        onMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onMount()
        {
            // Hide the host element itself — it's pure behavior, no chrome.
            this.style.display = 'contents';
            // Resolve target lazily; if attached after parent renders, this works.
            // Schedule on microtask so parent has finished mounting children first.
            queueMicrotask(() => {
                this.target = this.resolveTarget();
                if (this.target)
                    this.applyTo(this.target);
            });
        }

        /** @name        onBeforeUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUpdate() { }

        /** @name        onUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUpdate() { }

        /** @name        onBeforeUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUnmount() { }

        /** @name        onUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUnmount()
        {
            // Run all cleanup functions
            for (const fn of this.cleanups)
            {
                try
                {
                    fn();
                }
                catch (e)
                {
                    console.warn('[Modifier2D] cleanup error', e);
                }
            }
            this.cleanups = [];
            this.target = null;
        }

        /** @name        enabled
         *  @public
         *  @type        {boolean}
         *  @description Component member for enabled.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get enabled(): boolean { return !this.hasAttribute('disabled'); }

        /** @name        enabled
         *  @public
         *  @type        {void}
         *  @description Component member for enabled.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set enabled(v: boolean) { v ? this.removeAttribute('disabled') : this.setAttribute('disabled', ''); }
    }
}
export default Modifier2D;
