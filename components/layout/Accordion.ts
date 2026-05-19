/**
 * @module    components/layout/Accordion
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Accordion — collapsible content sections with smooth animated reveal.
 * Dedicated with love to Arianna. ♡
 *
 * # Modes
 *   single   (default) — opening one section closes the others
 *   multiple           — sections open independently
 *
 * # Icon styles
 *   chevron (rotating), plus (toggling), arrow (rotating), none
 *
 * # Animation — important
 *   Opening uses `max-height` from 0 → measured natural height (read in the
 *   next frame) with `cubic-bezier(0.4, 0, 0.2, 1)` over 320ms, plus opacity
 *   fade and a 2px translateY ease for the content. After the open transition
 *   completes, `max-height` is set to `none` so dynamic content can grow
 *   freely. On close: snap to measured pixel height, then animate to 0.
 *
 *   The icon rotates/morphs in parallel. There is NO `display:none` toggle,
 *   no jumpcut.
 *
 * # Optional horizontal resize
 *   When `resizable` is set, an internal `<arianna-resizer handles="e">`
 *   child is rendered, letting the user widen/narrow the entire Accordion
 *   panel. Persists nothing by default; listen for `arianna:resize` to do so.
 *
 * @example JS
 *   const a = new Accordion();
 *   a.items = [
 *     { id: 'intro', title: 'Introduction', content: '<p>Hello</p>', open: true },
 *     { id: 'usage', title: 'Usage',        content: '<p>Easy</p>' },
 *     { id: 'api',   title: 'API',          content: '<p>Strong</p>' },
 *   ];
 *   a.addEventListener('arianna:open',  e => console.log(e.detail.id));
 *   a.addEventListener('arianna:close', e => console.log(e.detail.id));
 *
 * @example HTML
 *   <arianna-accordion multiple icon="plus" resizable>
 *   </arianna-accordion>
 *   <!-- then set .items = [...] in JS -->
 *
 * Events:
 *   - arianna:open    detail: { id, item }
 *   - arianna:close   detail: { id, item }
 *   - arianna:toggle  detail: { id, item, open }
 *   - arianna:add     detail: { id, item }
 *   - arianna:remove  detail: { id }
 *   - arianna:resize  (bubbles from internal arianna-resizer when resizable)
 *
 * Slots:  (none — programmatic items only)
 *
 * Attrs:
 *   multiple, animated, icon ('chevron' | 'plus' | 'arrow' | 'none'),
 *   borderless, resizable, min-width, max-width
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export type AccordionIconStyle = 'chevron' | 'plus' | 'arrow' | 'none';

export interface AccordionItem {
    id        : string;
    title     : string;
    content   : string;
    open?     : boolean;
    disabled? : boolean;
}

export interface AccordionOptions {
    items?      : AccordionItem[];
    multiple?   : boolean;
    animated?   : boolean;
    icon?       : AccordionIconStyle;
    borderless? : boolean;
    resizable?  : boolean;
}

const TRANSITION = 'cubic-bezier(0.4, 0, 0.2, 1)';
const DURATION   = 320; // ms

interface PanelView {
    item     : AccordionItem;
    isOpen   : boolean;
    headerCls: string;
    bodyCls  : string;
}

export class Accordion extends Component('arianna-accordion', HTMLElement, {}, {
    attrs : ['multiple', 'animated', 'icon', 'borderless', 'resizable', 'min-width', 'max-width'],
})
{
    items$    : Signal<AccordionItem[]>     = signal<AccordionItem[]>([]);
    openIds$  : Signal<Set<string>>         = signal<Set<string>>(new Set());

    build(_opts: AccordionOptions = {})
    {
        const icon = this.attrSignal('icon');

        this.isMultiple    = () => this.hasAttribute('multiple');
        this.isAnimated    = () => this.getAttribute('animated') !== 'false';
        this.isResizable   = () => this.hasAttribute('resizable');
        this.iconStyle     = () => (icon.get() ?? 'chevron') as AccordionIconStyle;
        this.minW          = () => parseInt(this.getAttribute('min-width') ?? '180', 10) || 180;
        this.maxW          = () => parseInt(this.getAttribute('max-width') ?? '900', 10) || 900;
        this.resizerHandles = () => 'e';

        this.panels = (): PanelView[] => {
            const open = this.openIds$.get();
            return this.items$.get().map(item => {
                const isOpen = open.has(item.id);
                return {
                    item,
                    isOpen,
                    headerCls: 'ar-accordion__header'
                        + (isOpen          ? ' ar-accordion__header--open'     : '')
                        + (item.disabled   ? ' ar-accordion__header--disabled' : ''),
                    bodyCls:   'ar-accordion__body'
                        + (isOpen          ? ' ar-accordion__body--open'       : ''),
                };
            });
        };

        this.iconHtml = (isOpen: boolean): string => {
            const style = this.iconStyle();
            switch (style) {
                case 'chevron':
                    return `<span class="ar-accordion__icon ar-accordion__icon--chevron" style="transform:rotate(${isOpen ? 90 : 0}deg)">›</span>`;
                case 'arrow':
                    return `<span class="ar-accordion__icon ar-accordion__icon--arrow" style="transform:rotate(${isOpen ? 90 : 0}deg)">→</span>`;
                case 'plus':
                    return `<span class="ar-accordion__icon ar-accordion__icon--plus">${isOpen ? '−' : '+'}</span>`;
                case 'none':
                default:
                    return '';
            }
        };

        this.onHeaderClick = (item: AccordionItem) => {
            if (item.disabled) return;
            this.toggle(item.id);
        };

        this.template = html`
            <div class="ar-accordion__panel" a-for="p in this.panels()" :data-id="p.item.id">
                <button :class="p.headerCls"
                        :disabled="p.item.disabled"
                        :aria-expanded="String(p.isOpen)"
                        @click="(e) => this.onHeaderClick(p.item)">
                    <span class="ar-accordion__title" a-html="p.item.title"></span>
                    <span a-html="this.iconHtml(p.isOpen)"></span>
                </button>
                <div :class="p.bodyCls" role="region">
                    <div class="ar-accordion__content" a-html="p.item.content"></div>
                </div>
            </div>

            <arianna-resizer a-if="this.isResizable()"
                             :handles="this.resizerHandles()"
                             :min-width="String(this.minW())"
                             :max-width="String(this.maxW())"
                             allow-cross="false"></arianna-resizer>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = Accordion.DefaultSheet();
    }

    // ── Public API (preserves legacy fluent surface) ─────────────────────────

    set items(v: AccordionItem[]) {
        const fullItems = v.map(i => ({ open: false, disabled: false, ...i }));
        this.items$.set(fullItems);

        // Build initial open set from items[].open
        let open = new Set<string>(fullItems.filter(i => i.open && !i.disabled).map(i => i.id));
        // Enforce single mode
        if (!this.isMultiple() && open.size > 1) {
            const first = [...open][0];
            open = new Set([first]);
        }
        this.openIds$.set(open);
    }
    get items(): AccordionItem[] { return this.items$.get(); }

    open(id: string): this {
        const item = this.items$.get().find(i => i.id === id);
        if (!item || item.disabled || this.openIds$.get().has(id)) return this;

        const newOpen = this.isMultiple() ? new Set(this.openIds$.get()) : new Set<string>();
        newOpen.add(id);
        this.openIds$.set(newOpen);

        this.#animateOpen(id);
        this.dispatchEvent(new CustomEvent('arianna:open', {
            bubbles: true, detail: { id, item },
        }));
        return this;
    }

    close(id: string): this {
        const item = this.items$.get().find(i => i.id === id);
        if (!item || item.disabled || !this.openIds$.get().has(id)) return this;

        // Snapshot pixel height BEFORE removing from open set so the CSS
        // transition has a defined "from" value rather than "auto" → 0.
        this.#animateClose(id);

        const newOpen = new Set(this.openIds$.get());
        newOpen.delete(id);
        this.openIds$.set(newOpen);

        this.dispatchEvent(new CustomEvent('arianna:close', {
            bubbles: true, detail: { id, item },
        }));
        return this;
    }

    toggle(id: string): this {
        const wasOpen = this.openIds$.get().has(id);
        const result = wasOpen ? this.close(id) : this.open(id);
        const item = this.items$.get().find(i => i.id === id);
        this.dispatchEvent(new CustomEvent('arianna:toggle', {
            bubbles: true, detail: { id, item, open: !wasOpen },
        }));
        return result;
    }

    openAll(): this {
        const all = new Set<string>(
            this.items$.get().filter(i => !i.disabled).map(i => i.id),
        );
        this.openIds$.set(all);
        return this;
    }

    closeAll(): this {
        this.openIds$.set(new Set());
        return this;
    }

    isOpen(id: string): boolean { return this.openIds$.get().has(id); }

    openItems(): string[] { return [...this.openIds$.get()]; }

    addItem(item: AccordionItem, index?: number): this {
        const full = { open: false, disabled: false, ...item };
        const items = [...this.items$.get()];
        if (index !== undefined && index >= 0 && index < items.length) {
            items.splice(index, 0, full);
        } else {
            items.push(full);
        }
        this.items$.set(items);

        if (full.open && !full.disabled) {
            const open = this.isMultiple() ? new Set(this.openIds$.get()) : new Set<string>();
            open.add(full.id);
            this.openIds$.set(open);
        }
        this.dispatchEvent(new CustomEvent('arianna:add', {
            bubbles: true, detail: { id: item.id, item: full },
        }));
        return this;
    }

    removeItem(id: string): this {
        const items = this.items$.get().filter(i => i.id !== id);
        this.items$.set(items);
        const open = new Set(this.openIds$.get());
        open.delete(id);
        this.openIds$.set(open);
        this.dispatchEvent(new CustomEvent('arianna:remove', {
            bubbles: true, detail: { id },
        }));
        return this;
    }

    setContent(id: string, contentHtml: string): this {
        const items = this.items$.get().map(i =>
            i.id === id ? { ...i, content: contentHtml } : i,
        );
        this.items$.set(items);
        return this;
    }

    setTitle(id: string, titleHtml: string): this {
        const items = this.items$.get().map(i =>
            i.id === id ? { ...i, title: titleHtml } : i,
        );
        this.items$.set(items);
        return this;
    }

    enable(id: string): this {
        const items = this.items$.get().map(i =>
            i.id === id ? { ...i, disabled: false } : i,
        );
        this.items$.set(items);
        return this;
    }

    disable(id: string): this {
        const items = this.items$.get().map(i =>
            i.id === id ? { ...i, disabled: true } : i,
        );
        this.items$.set(items);
        const open = new Set(this.openIds$.get());
        open.delete(id);
        this.openIds$.set(open);
        return this;
    }

    // ── Animation engine ─────────────────────────────────────────────────────

    /**
     * Open animation: 0 → measured height → 'none'.
     *
     * The signal-driven template re-renders the body with the `--open` class
     * on the next microtask; we wait one rAF so layout has flushed, measure
     * scrollHeight, set max-height to that exact value, then on transitionend
     * remove the inline max-height so dynamic content can later grow.
     */
    #animateOpen(id: string): void {
        if (!this.isAnimated()) return;

        // Wait for template patch
        requestAnimationFrame(() => {
            const body = this.querySelector<HTMLElement>(
                `.ar-accordion__panel[data-id="${id}"] > .ar-accordion__body`,
            );
            if (!body) return;

            const target = body.scrollHeight;
            body.style.maxHeight = '0px';
            // force reflow
            void body.offsetHeight;
            body.style.maxHeight = target + 'px';

            const onEnd = (e: TransitionEvent) => {
                if (e.propertyName !== 'max-height') return;
                body.style.maxHeight = 'none';
                body.removeEventListener('transitionend', onEnd);
            };
            body.addEventListener('transitionend', onEnd);
        });
    }

    /**
     * Close animation: 'none' → snapshot px → 0.
     *
     * We must capture scrollHeight BEFORE the state flips to closed (because
     * after the flip the body has `max-height:0` from CSS and the template
     * re-render). We do it synchronously before the state flip in `close()`.
     */
    #animateClose(id: string): void {
        if (!this.isAnimated()) return;

        const body = this.querySelector<HTMLElement>(
            `.ar-accordion__panel[data-id="${id}"] > .ar-accordion__body`,
        );
        if (!body) return;

        const current = body.scrollHeight;
        body.style.maxHeight = current + 'px';
        // force reflow before signal-driven re-render kicks in
        void body.offsetHeight;
        // Next frame: the template patch may have replaced the body node;
        // re-query and animate down.
        requestAnimationFrame(() => {
            const b = this.querySelector<HTMLElement>(
                `.ar-accordion__panel[data-id="${id}"] > .ar-accordion__body`,
            );
            if (!b) return;
            b.style.maxHeight = current + 'px';
            void b.offsetHeight;
            b.style.maxHeight = '0px';
            const onEnd = (e: TransitionEvent) => {
                if (e.propertyName !== 'max-height') return;
                b.style.maxHeight = '';
                b.removeEventListener('transitionend', onEnd);
            };
            b.addEventListener('transitionend', onEnd);
        });
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    // ── Attr getters/setters ─────────────────────────────────────────────────

    get multiple(): boolean  { return this.hasAttribute('multiple'); }
    set multiple(v: boolean) { v ? this.setAttribute('multiple', '') : this.removeAttribute('multiple'); }

    get animated(): boolean  { return this.getAttribute('animated') !== 'false'; }
    set animated(v: boolean) { this.setAttribute('animated', v ? 'true' : 'false'); }

    get icon(): AccordionIconStyle  { return (this.getAttribute('icon') ?? 'chevron') as AccordionIconStyle; }
    set icon(v: AccordionIconStyle) { this.setAttribute('icon', v); }

    get borderless(): boolean  { return this.hasAttribute('borderless'); }
    set borderless(v: boolean) { v ? this.setAttribute('borderless', '') : this.removeAttribute('borderless'); }

    get resizable(): boolean  { return this.hasAttribute('resizable'); }
    set resizable(v: boolean) { v ? this.setAttribute('resizable', '') : this.removeAttribute('resizable'); }

    // ── Template helpers (set in build) ──────────────────────────────────────

    private isMultiple    : () => boolean = () => false;
    private isAnimated    : () => boolean = () => true;
    private isResizable   : () => boolean = () => false;
    private iconStyle     : () => AccordionIconStyle = () => 'chevron';
    private minW          : () => number  = () => 180;
    private maxW          : () => number  = () => 900;
    private resizerHandles: () => string  = () => 'e';
    private panels        : () => PanelView[] = () => [];
    private iconHtml      : (isOpen: boolean) => string = () => '';
    private onHeaderClick : (item: AccordionItem) => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    display      : 'flex',
                    flexDirection: 'column',
                    width        : '100%',
                    position     : 'relative',
                    color        : 'var(--arianna-text, #1f2328)',
                }),
                new Rule('.ar-accordion__panel', {
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    overflow    : 'hidden',
                    marginBottom: '4px',
                    background  : 'var(--arianna-bg, #ffffff)',
                }),
                new Rule(':host([borderless]) .ar-accordion__panel', { border: 'none', borderRadius: '0' }),
                new Rule('.ar-accordion__header', {
                    alignItems   : 'center',
                    background   : 'var(--arianna-bg-3, #f3f3f3)',
                    border       : 'none',
                    color        : 'var(--arianna-text, #1f2328)',
                    cursor       : 'pointer',
                    display      : 'flex',
                    font         : 'inherit',
                    fontSize     : '0.85rem',
                    fontWeight   : '600',
                    gap          : '8px',
                    justifyContent: 'space-between',
                    padding      : '12px 16px',
                    textAlign    : 'left',
                    transition   : `background 0.2s ${TRANSITION}`,
                    width        : '100%',
                }),
                new Rule('.ar-accordion__header:hover:not(.ar-accordion__header--disabled)', {
                    background: 'var(--arianna-bg-4, #ebebeb)',
                }),
                new Rule('.ar-accordion__header--disabled', {
                    cursor: 'not-allowed', opacity: '0.5',
                }),
                new Rule('.ar-accordion__title', { flex: '1' }),

                // Icon — smooth rotation / cross-fade
                new Rule('.ar-accordion__icon', {
                    color     : 'var(--arianna-muted, #8b949e)',
                    display   : 'inline-block',
                    fontSize  : '0.9em',
                    lineHeight: '1',
                    transition: `transform 0.28s ${TRANSITION}`,
                }),
                new Rule('.ar-accordion__icon--plus',  { fontSize: '1.1em', fontWeight: '400' }),

                // Body — the heart of the animation
                new Rule('.ar-accordion__body', {
                    maxHeight : '0',
                    overflow  : 'hidden',
                    background: 'var(--arianna-bg, #ffffff)',
                    // Animate max-height (set in JS) + opacity + small Y nudge
                    transition: `max-height ${DURATION}ms ${TRANSITION},`
                              + ` opacity ${DURATION}ms ${TRANSITION},`
                              + ` transform ${DURATION}ms ${TRANSITION}`,
                    opacity   : '0',
                    transform : 'translateY(-2px)',
                }),
                new Rule('.ar-accordion__body--open', {
                    opacity  : '1',
                    transform: 'translateY(0)',
                    // max-height set inline via JS during animation, then 'none'
                }),
                new Rule('.ar-accordion__content', {
                    padding   : '14px 16px',
                    lineHeight: '1.5',
                }),

                // Reduced motion accessibility
                new Rule('@media (prefers-reduced-motion: reduce)', {
                    '.ar-accordion__body, .ar-accordion__icon, .ar-accordion__header': {
                        transition: 'none',
                    },
                } as never),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Accordion', {
        value: Accordion, writable: false, enumerable: false, configurable: false,
    });
}

export default Accordion;
