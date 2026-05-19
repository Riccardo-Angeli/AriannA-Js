/**
 * @module    components/display/Tooltip
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Tooltip — hover-triggered floating label. Two usage modes:
 *   1. Attach to an existing element via Tooltip.attach(el, text, opts)
 *   2. Wrap children in `<arianna-tooltip text="...">child</arianna-tooltip>`
 *
 * The floating tip element is appended to `document.body` (fixed positioning)
 * and follows the host element on hover.
 *
 * @example JS
 *   Tooltip.attach(myButton, 'Save document');
 *
 * @example HTML
 *   <arianna-tooltip text="Help" position="top">
 *     <button>?</button>
 *   </arianna-tooltip>
 *
 * Events: (none)
 * Slots:  default — the element(s) the tooltip is attached to
 * Attrs:  text, position, delay
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface TooltipOptions {
    text?     : string;
    position? : 'top' | 'bottom' | 'left' | 'right';
    delay?    : number;
}

export class Tooltip extends Component('arianna-tooltip', HTMLElement, {}, {
    attrs : ['text', 'position', 'delay'],
})
{
    #tipEl: HTMLElement | null = null;
    #timer = 0;
    #onEnter = () => {};
    #onLeave = () => {};

    build(_opts: TooltipOptions = {})
    {
        // The tooltip element lives in document.body to escape stacking contexts
        const tip = document.createElement('div');
        tip.className = 'ar-tooltip ar-tooltip--' + (this.getAttribute('position') ?? 'top');
        tip.textContent = this.getAttribute('text') ?? '';
        document.body.appendChild(tip);
        this.#tipEl = tip;

        // Re-style tip on attr changes
        const sync = () => {
            tip.className = 'ar-tooltip ar-tooltip--' + (this.getAttribute('position') ?? 'top');
            tip.textContent = this.getAttribute('text') ?? '';
        };
        this.addEventListener('arianna:attr-text',     sync);
        this.addEventListener('arianna:attr-position', sync);

        this.#onEnter = () => {
            clearTimeout(this.#timer);
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

        this.template = html`<slot></slot>`;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = Tooltip.DefaultSheet();
    }

    #place(): void
    {
        if (!this.#tipEl) return;
        const r   = this.getBoundingClientRect();
        const pos = this.getAttribute('position') ?? 'top';
        const tw  = this.#tipEl.offsetWidth  || 120;
        const th  = this.#tipEl.offsetHeight || 28;
        this.#tipEl.style.left = (r.left + r.width / 2 - tw / 2) + 'px';
        this.#tipEl.style.top  = pos === 'bottom' ? (r.bottom + 6) + 'px' : (r.top - th - 6) + 'px';
        if (pos === 'left')  {
            this.#tipEl.style.left = (r.left - tw - 6) + 'px';
            this.#tipEl.style.top  = (r.top + r.height / 2 - th / 2) + 'px';
        }
        if (pos === 'right') {
            this.#tipEl.style.left = (r.right + 6) + 'px';
            this.#tipEl.style.top  = (r.top + r.height / 2 - th / 2) + 'px';
        }
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount() {
        clearTimeout(this.#timer);
        this.#tipEl?.remove();
        this.#tipEl = null;
    }

    /** Attach a tooltip to any existing element programmatically. */
    static attach(el: HTMLElement, text: string, opts: Omit<TooltipOptions, 'text'> = {}): Tooltip
    {
        const host = document.createElement('arianna-tooltip') as unknown as Tooltip;
        host.style.display = 'contents';
        host.text = text;
        if (opts.position) host.position = opts.position;
        if (opts.delay !== undefined) host.delay = opts.delay;
        el.parentElement?.insertBefore(host, el);
        host.appendChild(el);
        return host;
    }

    get text(): string  { return this.getAttribute('text') ?? ''; }
    set text(v: string) { v ? this.setAttribute('text', v) : this.removeAttribute('text'); }

    get position(): 'top' | 'bottom' | 'left' | 'right' { return (this.getAttribute('position') ?? 'top') as never; }
    set position(v: 'top' | 'bottom' | 'left' | 'right') { this.setAttribute('position', v); }

    get delay(): number  { return parseInt(this.getAttribute('delay') ?? '180', 10); }
    set delay(v: number) { this.setAttribute('delay', String(v)); }

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', { display: 'contents' }),
                new Rule('.ar-tooltip', {
                    background  : 'var(--arianna-bg-3, #1f2328)',
                    border      : '1px solid var(--arianna-border, #30363d)',
                    borderRadius: 'var(--arianna-radius-sm, 4px)',
                    boxShadow   : '0 2px 8px rgba(0,0,0,0.18)',
                    color       : 'var(--arianna-text, #f0f6fc)',
                    fontSize    : '0.74rem',
                    maxWidth    : '220px',
                    opacity     : '0',
                    padding     : '4px 8px',
                    pointerEvents: 'none',
                    position    : 'fixed',
                    transition  : 'opacity 0.14s',
                    whiteSpace  : 'pre-wrap',
                    zIndex      : '9000',
                }),
                new Rule('.ar-tooltip--on', { opacity: '1' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Tooltip', {
        value: Tooltip, writable: false, enumerable: false, configurable: false,
    });
}

export default Tooltip;
