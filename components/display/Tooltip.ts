/**
 * @module    components/display/Tooltip
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Tooltip component module.
 */

import { Component, Css, Templates } from '../../core/index.ts';

/** @namespace   Tooltip
 *  @public
 *  @description Namespace containing Tooltip contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Tooltip
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Rule
         *  @public
         *  @type        {Css.Rule}
         *  @description Type alias for Rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Rule = Css.Rule;

        /** @name        Stylesheet
         *  @public
         *  @type        {Css.Stylesheet}
         *  @description Type alias for Stylesheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Stylesheet = Css.Stylesheet;
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   TooltipOptions
         *  @public
         *  @description TooltipOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface TooltipOptions
        {
            /** @name        text
             *  @public
             *  @type        {string}
             *  @description Component member for text.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            text?: string;

            /** @name        position
             *  @public
             *  @type        {'top' | 'bottom' | 'left' | 'right'}
             *  @description Component member for position.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            position?: 'top' | 'bottom' | 'left' | 'right';

            /** @name        delay
             *  @public
             *  @type        {number}
             *  @description Component member for delay.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            delay?: number;
        }
    }

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @class       Tooltip
     *  @public
     *  @description AriannA Tooltip component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-tooltip', {}, {
        Attributes: ['text', 'position', 'delay'],
    })
    export class Tooltip extends HTMLElement
    {
        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        #tipEl
         *  @public
         *  @type        {HTMLElement | null}
         *  @description Component member for tip El.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #tipEl: HTMLElement | null = null;

        /** @name        #timer
         *  @public
         *  @type        {unknown}
         *  @description Component member for timer.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #timer = 0;

        /** @name        #onEnter
         *  @public
         *  @type        {unknown}
         *  @description Component member for on Enter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #onEnter = () => { };

        /** @name        #onLeave
         *  @public
         *  @type        {unknown}
         *  @description Component member for on Leave.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #onLeave = () => { };

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Tooltip.Interfaces.TooltipOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.TooltipOptions = {})
        {
            // The tooltip element lives in document.body to escape stacking contexts
            /** @name        tip
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tip value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tip = document.createElement('div');
            tip.className = 'ar-tooltip ar-tooltip--' + (this.getAttribute('position') ?? 'top');
            tip.textContent = this.getAttribute('text') ?? '';
            document.body.appendChild(tip);
            this.#tipEl = tip;
            // Re-style tip on attr changes
            /** @name        sync
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned sync value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const sync = () => {
                tip.className = 'ar-tooltip ar-tooltip--' + (this.getAttribute('position') ?? 'top');
                tip.textContent = this.getAttribute('text') ?? '';
            };
            this.addEventListener('arianna:attr-text', sync);
            this.addEventListener('arianna:attr-position', sync);
            this.#onEnter = () => {
                clearTimeout(this.#timer);

                /** @name        d
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned d value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const d = parseInt(this.getAttribute('delay') ?? '180', 10) || 180;
                this.#timer = window.setTimeout(() => {
                    this.#place();
                    this.#tipEl?.classList.add('ar-tooltip--on');
                }, d);
            };
            this.#onLeave = () => {
                clearTimeout(this.#timer);
                this.#tipEl?.classList.remove('ar-tooltip--on');
            };
            this.addEventListener('mouseenter', this.#onEnter);
            this.addEventListener('mouseleave', this.#onLeave);
            this.template = html `<slot></slot>`;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Tooltip.Types.Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Types.Stylesheet | null;
            }).Sheet = Tooltip.DefaultSheet();
        }

        /** @name        #place
         *  @public
         *  @type        {void}
         *  @description Component member for place.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #place(): void
        {
            if (!this.#tipEl)
                return;

            /** @name        r
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned r value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const r = this.getBoundingClientRect();

            /** @name        pos
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned pos value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const pos = this.getAttribute('position') ?? 'top';

            /** @name        tw
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned tw value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const tw = this.#tipEl.offsetWidth || 120;

            /** @name        th
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned th value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const th = this.#tipEl.offsetHeight || 28;
            this.#tipEl.style.left = (r.left + r.width / 2 - tw / 2) + 'px';
            this.#tipEl.style.top = pos === 'bottom' ? (r.bottom + 6) + 'px' : (r.top - th - 6) + 'px';
            if (pos === 'left')
            {
                this.#tipEl.style.left = (r.left - tw - 6) + 'px';
                this.#tipEl.style.top = (r.top + r.height / 2 - th / 2) + 'px';
            }
            if (pos === 'right')
            {
                this.#tipEl.style.left = (r.right + 6) + 'px';
                this.#tipEl.style.top = (r.top + r.height / 2 - th / 2) + 'px';
            }
        }

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
        onMount() { }

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
            clearTimeout(this.#timer);
            this.#tipEl?.remove();
            this.#tipEl = null;
        }

        /** Attach a tooltip to any existing element programmatically. */
        static attach(el: HTMLElement, text: string, opts: Omit<Interfaces.TooltipOptions, 'text'> = {}): Tooltip
        {
            /** @name        host
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned host value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const host = document.createElement('arianna-tooltip') as unknown as Tooltip;
            host.style.display = 'contents';
            host.text = text;
            if (opts.position)
                host.position = opts.position;
            if (opts.delay !== undefined)
                host.delay = opts.delay;
            el.parentElement?.insertBefore(host, el);
            host.appendChild(el);
            return host;
        }

        /** @name        text
         *  @public
         *  @type        {string}
         *  @description Component member for text.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get text(): string { return this.getAttribute('text') ?? ''; }

        /** @name        text
         *  @public
         *  @type        {void}
         *  @description Component member for text.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set text(v: string) { v ? this.setAttribute('text', v) : this.removeAttribute('text'); }

        /** @name        position
         *  @public
         *  @type        {'top' | 'bottom' | 'left' | 'right'}
         *  @description Component member for position.
         *  @returns     {'top' | 'bottom' | 'left' | 'right'} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get position(): 'top' | 'bottom' | 'left' | 'right' { return (this.getAttribute('position') ?? 'top') as never; }

        /** @name        position
         *  @public
         *  @type        {void}
         *  @description Component member for position.
         *  @param       {'top' | 'bottom' | 'left' | 'right'} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set position(v: 'top' | 'bottom' | 'left' | 'right') { this.setAttribute('position', v); }

        /** @name        delay
         *  @public
         *  @type        {number}
         *  @description Component member for delay.
         *  @returns     {number} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get delay(): number { return parseInt(this.getAttribute('delay') ?? '180', 10); }

        /** @name        delay
         *  @public
         *  @type        {void}
         *  @description Component member for delay.
         *  @param       {number} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set delay(v: number) { this.setAttribute('delay', String(v)); }

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Tooltip.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Tooltip.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', { display: 'contents' }),
                new Rule('.ar-tooltip', {
                    background: 'var(--arianna-bg-3, #1f2328)',
                    border: '1px solid var(--arianna-border, #30363d)',
                    borderRadius: 'var(--arianna-radius-sm, 4px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                    color: 'var(--arianna-text, #f0f6fc)',
                    fontSize: '0.74rem',
                    maxWidth: '220px',
                    opacity: '0',
                    padding: '4px 8px',
                    pointerEvents: 'none',
                    position: 'fixed',
                    transition: 'opacity 0.14s',
                    whiteSpace: 'pre-wrap',
                    zIndex: '9000',
                }),
                new Rule('.ar-tooltip--on', { opacity: '1' }),
            ]);
        }
    }
}
export default Tooltip;

export type TooltipOptions = Tooltip.Interfaces.TooltipOptions;
