/**
 * @module    components/layout/Panel
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Panel — content container with optional header, toolbar, and collapsible
 * body. Lighter than Card; intended for in-page sectioning rather than
 * floating surfaces.
 *
 * @example JS
 *   const p = new Panel();
 *   p.title       = 'Filters';
 *   p.collapsible = true;
 *   document.body.append(p);
 *
 * @example HTML
 *   <arianna-panel title="Details" collapsible>
 *     <div slot="toolbar"><button>Edit</button></div>
 *     <p>Body content</p>
 *   </arianna-panel>
 *
 * Events:
 *   - arianna:toggle   detail: { collapsed }
 *
 * Slots:  default — body content; toolbar — header right side
 * Attrs:  title, collapsible, collapsed
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface PanelOptions {
    title?       : string;
    collapsible? : boolean;
    collapsed?   : boolean;
}

export class Panel extends Component('arianna-panel', HTMLElement, {}, {
    attrs : ['title', 'collapsible', 'collapsed'],
    shadow: false,
})
{
    build(_opts: PanelOptions = {})
    {
        const title = this.attrSignal('title');

        this.hasTitle      = () => !!title.get();
        this.titleText     = () => title.get() ?? '';
        this.isCollapsible = () => this.hasAttribute('collapsible');
        this.isCollapsed   = () => this.hasAttribute('collapsed');
        this.hasHeader     = () => this.hasTitle() || this.isCollapsible();
        this.toggleIcon    = () => this.isCollapsed() ? '▸' : '▾';

        this.onToggle = () => {
            const wasCollapsed = this.isCollapsed();
            if (wasCollapsed) this.removeAttribute('collapsed');
            else              this.setAttribute('collapsed', '');
            this.dispatchEvent(new CustomEvent('arianna:toggle', {
                bubbles: true, detail: { collapsed: !wasCollapsed },
            }));
        };

        this.template = html`
            <div class="ar-panel__header" a-if="this.hasHeader()">
                <span class="ar-panel__title" a-if="this.hasTitle()">{{ this.titleText() }}</span>
                <div class="ar-panel__toolbar"><slot name="toolbar"></slot></div>
                <button class="ar-panel__toggle"
                        a-if="this.isCollapsible()"
                        @click="this.onToggle">{{ this.toggleIcon() }}</button>
            </div>
            <div class="ar-panel__body" a-if="!this.isCollapsed()">
                <slot></slot>
            </div>
        `;

        this.Sheet = Panel.DefaultSheet();
    }

    /** Programmatically toggle collapse state. */
    toggle(): void { this.onToggle(); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get title(): string  { return this.getAttribute('title') ?? ''; }
    set title(v: string) { v ? this.setAttribute('title', v) : this.removeAttribute('title'); }

    get collapsible(): boolean  { return this.hasAttribute('collapsible'); }
    set collapsible(v: boolean) { v ? this.setAttribute('collapsible', '') : this.removeAttribute('collapsible'); }

    get collapsed(): boolean  { return this.hasAttribute('collapsed'); }
    set collapsed(v: boolean) { v ? this.setAttribute('collapsed', '') : this.removeAttribute('collapsed'); }

    private hasTitle     : () => boolean = () => false;
    private titleText    : () => string  = () => '';
    private isCollapsible: () => boolean = () => false;
    private isCollapsed  : () => boolean = () => false;
    private hasHeader    : () => boolean = () => false;
    private toggleIcon   : () => string  = () => '▾';
    private onToggle     : () => void    = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    background  : 'var(--arianna-bg, #ffffff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    display     : 'block',
                    overflow    : 'hidden',
                }),
                new Rule('.ar-panel__header', {
                    alignItems  : 'center',
                    background  : 'var(--arianna-bg-3, #f3f3f3)',
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    display     : 'flex',
                    gap         : '8px',
                    padding     : '8px 14px',
                }),
                new Rule('.ar-panel__title',   { flex: '1', fontSize: '0.85rem', fontWeight: '600' }),
                new Rule('.ar-panel__toolbar', { display: 'flex', gap: '6px', alignItems: 'center' }),
                new Rule('.ar-panel__toolbar:empty', { display: 'none' }),
                new Rule('.ar-panel__toggle', {
                    background: 'none',
                    border    : 'none',
                    color     : 'var(--arianna-muted, #8b949e)',
                    cursor    : 'pointer',
                    fontSize  : '0.75rem',
                    padding   : '2px',
                }),
                new Rule('.ar-panel__body', { padding: '14px' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Panel', {
        value: Panel, writable: false, enumerable: false, configurable: false,
    });
}

export default Panel;
