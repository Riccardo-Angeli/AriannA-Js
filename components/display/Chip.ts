/**
 * @module    components/display/Chip
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Chip (display variant) — compact label chip with optional avatar text, icon,
 * and delete button. For selectable/filter chips, use `components/inputs/Chip`.
 *
 * @example JS
 *   const chip = new Chip();
 *   chip.label  = 'AriannA';
 *   chip.variant = 'primary';
 *
 * @example HTML
 *   <arianna-chip variant="success" deletable label="Tag"></arianna-chip>
 *   <arianna-chip>Free-text content</arianna-chip>
 *
 * Events:
 *   - arianna:delete  user clicked the delete button — detail: { label }
 *
 * Slots:
 *   default — chip content (used when `label` attr not set)
 *
 * Attrs:  variant, size, deletable, label, icon, avatar
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface ChipOptions {
    variant?   : 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
    deletable? : boolean;
    size?      : 'sm' | 'md' | 'lg';
    label?     : string;
    icon?      : string;
    avatar?    : string;
}

export class Chip extends Component('arianna-chip', HTMLElement, {}, {
    attrs : ['variant', 'size', 'deletable', 'label', 'icon', 'avatar'],
    shadow: false,
})
{
    build(_opts: ChipOptions = {})
    {
        const label     = this.attrSignal('label');
        const icon      = this.attrSignal('icon');
        const avatar    = this.attrSignal('avatar');

        this.hasAvatar = () => !!avatar.get();
        this.hasIcon   = () => !!icon.get() && !avatar.get();
        this.hasLabel  = () => !!label.get();
        this.isDeletable = () => this.hasAttribute('deletable');
        this.avatarText  = () => (avatar.get() ?? '').slice(0, 2).toUpperCase();
        this.iconText    = () => icon.get() ?? '';
        this.labelText   = () => label.get() ?? '';

        this.onDelete = (e: Event) => {
            e.stopPropagation();
            this.dispatchEvent(new CustomEvent('arianna:delete', {
                bubbles: true, detail: { label: this.labelText() },
            }));
        };

        this.template = html`
            <span class="ar-chip__avatar" a-if="this.hasAvatar()">{{ this.avatarText() }}</span>
            <span class="ar-chip__icon"   a-if="this.hasIcon()">{{ this.iconText() }}</span>
            <span class="ar-chip__label"  a-if="this.hasLabel()">{{ this.labelText() }}</span>
            <span class="ar-chip__label"  a-if="!this.hasLabel()"><slot></slot></span>
            <button class="ar-chip__delete" a-if="this.isDeletable()" @click="this.onDelete" aria-label="Remove">✕</button>
        `;

        this.Sheet = Chip.DefaultSheet();
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

    get size(): string  { return this.getAttribute('size') ?? 'md'; }
    set size(v: string) { this.setAttribute('size', v); }

    get deletable(): boolean  { return this.hasAttribute('deletable'); }
    set deletable(v: boolean) { v ? this.setAttribute('deletable', '') : this.removeAttribute('deletable'); }

    get label(): string  { return this.getAttribute('label') ?? ''; }
    set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }

    get icon(): string  { return this.getAttribute('icon') ?? ''; }
    set icon(v: string) { v ? this.setAttribute('icon', v) : this.removeAttribute('icon'); }

    get avatar(): string  { return this.getAttribute('avatar') ?? ''; }
    set avatar(v: string) { v ? this.setAttribute('avatar', v) : this.removeAttribute('avatar'); }

    private hasAvatar  : () => boolean = () => false;
    private hasIcon    : () => boolean = () => false;
    private hasLabel   : () => boolean = () => false;
    private isDeletable: () => boolean = () => false;
    private avatarText : () => string  = () => '';
    private iconText   : () => string  = () => '';
    private labelText  : () => string  = () => '';
    private onDelete   : (e: Event) => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    alignItems  : 'center',
                    borderRadius: '16px',
                    display     : 'inline-flex',
                    gap         : '5px',
                    fontWeight  : '500',
                    whiteSpace  : 'nowrap',
                    background  : 'var(--arianna-bg-3, #f3f3f3)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    color       : 'var(--arianna-text, #1f2328)',
                }),
                new Rule(':root[variant="primary"]', { background: 'rgba(31,111,235,0.15)',  border: '1px solid var(--arianna-primary, #1f6feb)', color: 'var(--arianna-primary, #1f6feb)' }),
                new Rule(':root[variant="success"]', { background: 'rgba(46,160,67,0.15)',   border: '1px solid var(--arianna-success, #2ea043)', color: 'var(--arianna-success, #2ea043)' }),
                new Rule(':root[variant="warning"]', { background: 'rgba(210,153,34,0.15)',  border: '1px solid var(--arianna-warning, #d29922)', color: 'var(--arianna-warning, #d29922)' }),
                new Rule(':root[variant="danger"]',  { background: 'rgba(207,34,46,0.15)',   border: '1px solid var(--arianna-danger, #cf222e)',  color: 'var(--arianna-danger, #cf222e)' }),
                new Rule(':root[variant="info"]',    { background: 'rgba(77,208,225,0.15)',  border: '1px solid var(--arianna-info, #4dd0e1)',    color: 'var(--arianna-info, #4dd0e1)' }),
                new Rule(':root[size="sm"]', { fontSize: '0.72rem', padding: '2px 8px' }),
                new Rule(':root[size="md"]', { fontSize: '0.78rem', padding: '3px 10px' }),
                new Rule(':root[size="lg"]', { fontSize: '0.85rem', padding: '5px 14px' }),
                new Rule(':root:not([size])', { fontSize: '0.78rem', padding: '3px 10px' }),
                new Rule('.ar-chip__avatar', {
                    alignItems   : 'center',
                    background   : 'currentColor',
                    borderRadius : '50%',
                    color        : 'var(--arianna-bg, #ffffff)',
                    display      : 'flex',
                    flexShrink   : '0',
                    fontSize     : '0.65rem',
                    fontWeight   : '700',
                    height       : '18px',
                    justifyContent: 'center',
                    width        : '18px',
                }),
                new Rule('.ar-chip__icon', { flexShrink: '0' }),
                new Rule('.ar-chip__delete', {
                    background: 'none',
                    border    : 'none',
                    color     : 'currentColor',
                    cursor    : 'pointer',
                    fontSize  : '0.7rem',
                    lineHeight: '1',
                    opacity   : '0.7',
                    padding   : '0',
                }),
                new Rule('.ar-chip__delete:hover', { opacity: '1' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Chip', {
        value: Chip, writable: false, enumerable: false, configurable: false,
    });
}

export default Chip;
