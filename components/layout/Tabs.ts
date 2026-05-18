/**
 * @module    components/layout/Tabs
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Tabs / Tab — tabbed navigation. Two co-located custom elements:
 *
 *   • `arianna-tabs`  — parent, owns the active index, renders header strip
 *                       (tab triggers projected via `slot="header"`) and body
 *                       region (panel projected via default slot).
 *   • `arianna-tab`   — child trigger; registers with the nearest
 *                       `arianna-tabs` ancestor via `def.bus`.
 *
 * The parent listens for child clicks and updates its `active` attribute.
 * Children read the parent's active state to highlight themselves.
 *
 * @example JS
 *   const tabs = new Tabs();
 *   tabs.active = 0;
 *   document.body.append(tabs);
 *   // header
 *   for (const label of ['One', 'Two', 'Three']) {
 *     const t = new Tab(); t.label = label; t.slot = 'header'; tabs.append(t);
 *   }
 *   // body
 *   const body = document.createElement('div'); body.textContent = 'Active body';
 *   tabs.append(body);
 *
 * @example HTML
 *   <arianna-tabs active="0">
 *     <arianna-tab slot="header" label="Overview"></arianna-tab>
 *     <arianna-tab slot="header" label="Detail"></arianna-tab>
 *     <arianna-tab slot="header" label="Logs" disabled></arianna-tab>
 *     <section>Body for the currently-active tab</section>
 *   </arianna-tabs>
 *
 * Events:
 *   - arianna:tab-select   (child) detail: { source }
 *   - arianna:change       (parent) detail: { active, source }
 *
 * Slots:  header (tab triggers), default (panel body)
 * Attrs:  Tab    → label, disabled, active
 *         Tabs   → active
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface TabsOptions { active?: number; }
export interface TabOptions  { label?: string; disabled?: boolean; active?: boolean; }

// ─────────────────────────────────────────────────────────────────────────────
//  Tab (child, registers into parent's children bus)
// ─────────────────────────────────────────────────────────────────────────────

export class Tab extends Component('arianna-tab', HTMLElement, {}, {
    attrs : ['label', 'disabled', 'active'],
    shadow: false,
    bus   : 'arianna-tabs',
})
{
    build(_opts: TabOptions = {})
    {
        const label = this.attrSignal('label');

        this.labelText = () => label.get() ?? '';
        this.hasLabel  = () => !!label.get();
        this.onClick   = () => {
            if (this.hasAttribute('disabled')) return;
            this.dispatchEvent(new CustomEvent('arianna:tab-select', {
                bubbles: true, detail: { source: this },
            }));
        };

        this.template = html`
            <span a-if="this.hasLabel()" @click="this.onClick">{{ this.labelText() }}</span>
            <span a-if="!this.hasLabel()" @click="this.onClick"><slot></slot></span>
        `;

        this.Sheet = Tab.DefaultSheet();
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get label(): string  { return this.getAttribute('label') ?? ''; }
    set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }

    get disabled(): boolean  { return this.hasAttribute('disabled'); }
    set disabled(v: boolean) { v ? this.setAttribute('disabled', '') : this.removeAttribute('disabled'); }

    get active(): boolean  { return this.hasAttribute('active'); }
    set active(v: boolean) { v ? this.setAttribute('active', '') : this.removeAttribute('active'); }

    private labelText: () => string  = () => '';
    private hasLabel : () => boolean = () => false;
    private onClick  : () => void    = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    cursor      : 'pointer',
                    display     : 'inline-block',
                    padding     : '8px 14px',
                    borderBottom: '2px solid transparent',
                    color       : 'var(--arianna-text, #1f2328)',
                    transition  : 'all 0.15s ease',
                    userSelect  : 'none',
                    fontSize    : '0.85rem',
                }),
                new Rule(':root:hover', { color: 'var(--arianna-primary, #1f6feb)' }),
                new Rule(':root[active]', {
                    borderBottomColor: 'var(--arianna-primary, #1f6feb)',
                    color            : 'var(--arianna-primary, #1f6feb)',
                    fontWeight       : '600',
                }),
                new Rule(':root[disabled]', { cursor: 'not-allowed', opacity: '0.45' }),
            ]
        );
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Tabs (parent, owns the active index)
// ─────────────────────────────────────────────────────────────────────────────

export class Tabs extends Component('arianna-tabs', HTMLElement, {}, {
    attrs : ['active'],
    shadow: false,
})
{
    build(_opts: TabsOptions = {})
    {
        // Listen for child triggers (event bubbles up from arianna-tab clicks)
        this.addEventListener('arianna:tab-select', (e: Event) => {
            const ev = e as CustomEvent<{ source: Tab }>;
            const source = ev.detail?.source;
            if (!source) return;
            const triggers = Array.from(this.querySelectorAll('arianna-tab'));
            const idx = triggers.indexOf(source);
            if (idx >= 0) {
                this.setAttribute('active', String(idx));
                this.#syncChildren();
                this.dispatchEvent(new CustomEvent('arianna:change', {
                    bubbles: true, detail: { active: idx, source: this },
                }));
            }
        });

        this.template = html`
            <header class="ar-tabs__header"><slot name="header"></slot></header>
            <section class="ar-tabs__body"><slot></slot></section>
        `;

        // Initial sync (deferred so children mount first)
        setTimeout(() => this.#syncChildren(), 0);

        this.Sheet = Tabs.DefaultSheet();
    }

    /** Propagate the parent's `active` index down to children's `[active]` attr. */
    #syncChildren(): void
    {
        const i = parseInt(this.getAttribute('active') ?? '0', 10) || 0;
        const triggers = Array.from(this.querySelectorAll('arianna-tab'));
        triggers.forEach((t, idx) => {
            if (idx === i) t.setAttribute('active', '');
            else           t.removeAttribute('active');
        });
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount() {
        // Re-sync after mount in case children attached during build
        this.#syncChildren();
    }
    onBeforeUpdate()  {}
    onUpdate() {
        this.#syncChildren();
    }
    onBeforeUnmount() {}
    onUnmount()       {}

    get active(): number  { return parseInt(this.getAttribute('active') ?? '0', 10); }
    set active(v: number) { this.setAttribute('active', String(v)); this.#syncChildren(); }

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', { display: 'block' }),
                new Rule('.ar-tabs__header', {
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    display     : 'flex',
                    gap         : '4px',
                }),
                new Rule('.ar-tabs__body', { padding: '12px 0' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Tab',  { value: Tab,  writable: false, enumerable: false, configurable: false });
    Object.defineProperty(window, 'Tabs', { value: Tabs, writable: false, enumerable: false, configurable: false });
}

export default Tabs;
