/**
 * @module    components/display/Badge
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Badge — small counter or status indicator. Modes: filled label, or empty dot.
 *
 * @example JS
 *   const b = new Badge();
 *   b.label   = 'New';
 *   b.variant = 'success';
 *
 * @example HTML
 *   <arianna-badge variant="primary">3</arianna-badge>
 *   <arianna-badge variant="danger" dot></arianna-badge>
 *
 * Events: (none)
 * Slots:  default — badge content (text/number); ignored when `dot` is set
 * Attrs:  variant, dot, label
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface BadgeOptions {
    variant? : 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
    dot?     : boolean;
    label?   : string;
}

export class Badge extends Component('arianna-badge', HTMLElement, {}, {
    attrs : ['variant', 'dot', 'label'],
    shadow: false,
})
{
    build(_opts: BadgeOptions = {})
    {
        const label = this.attrSignal('label');
        const dot   = this.attrSignal('dot');

        this.isDot      = () => dot.get() !== null && dot.get() !== undefined;
        this.labelText  = () => label.get() ?? '';
        this.hasLabel   = () => !this.isDot() && !!label.get();
        this.hasSlotted = () => !this.isDot() && !label.get();

        this.template = html`
            <span a-if="this.hasLabel()">{{ this.labelText() }}</span>
            <slot a-if="this.hasSlotted()"></slot>
        `;

        this.Sheet = Badge.DefaultSheet();
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get variant(): string  { return this.getAttribute('variant') ?? 'default'; }
    set variant(v: string) { this.setAttribute('variant', v); }

    get label(): string  { return this.getAttribute('label') ?? ''; }
    set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }

    get dot(): boolean  { return this.hasAttribute('dot'); }
    set dot(v: boolean) { v ? this.setAttribute('dot', '') : this.removeAttribute('dot'); }

    private isDot     : () => boolean = () => false;
    private labelText : () => string  = () => '';
    private hasLabel  : () => boolean = () => false;
    private hasSlotted: () => boolean = () => false;

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    alignItems  : 'center',
                    borderRadius: '10px',
                    display     : 'inline-flex',
                    fontSize    : '0.72rem',
                    fontWeight  : '600',
                    padding     : '2px 8px',
                    whiteSpace  : 'nowrap',
                    background  : 'var(--arianna-bg-3, #f3f3f3)',
                    color       : 'var(--arianna-text, #1f2328)',
                }),
                new Rule(':root[variant="primary"]', { background: 'var(--arianna-primary, #1f6feb)',           color: '#fff' }),
                new Rule(':root[variant="success"]', { background: 'var(--arianna-success, #2ea043)',           color: '#fff' }),
                new Rule(':root[variant="warning"]', { background: 'var(--arianna-warning, #d29922)',           color: '#000' }),
                new Rule(':root[variant="danger"]',  { background: 'var(--arianna-danger, #cf222e)',            color: '#fff' }),
                new Rule(':root[variant="info"]',    { background: 'var(--arianna-info, #4dd0e1)',              color: '#000' }),
                new Rule(':root[dot]', {
                    borderRadius: '50%',
                    height      : '8px',
                    minWidth    : '8px',
                    padding     : '0',
                    width       : '8px',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Badge', {
        value: Badge, writable: false, enumerable: false, configurable: false,
    });
}

export default Badge;
