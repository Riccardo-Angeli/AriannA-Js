/**
 * @module    components/inputs/Chip
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Chip — selectable filter chip group. NOT the display Chip — this one
 * supports multi-select with optional removable badges.
 *
 * @example JS
 *   const c = new Chip();
 *   c.options  = ['React', 'Vue', 'Angular', 'AriannA'];
 *   c.selected = ['AriannA'];
 *   c.addEventListener('arianna:change', e => console.log(e.detail.selected));
 *
 * @example HTML
 *   <arianna-chip multiple></arianna-chip>
 *
 * Events: arianna:change  detail: { selected }
 * Attrs:  multiple, removable, disabled
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface ChipOptions {
    options?   : string[];
    selected?  : string[];
    multiple?  : boolean;
    removable? : boolean;
    disabled?  : boolean;
}

interface ChipView {
    label : string;
    on    : boolean;
    cls   : string;
}

export class Chip extends Component('arianna-chip', HTMLElement, {}, {
    attrs : ['multiple', 'removable', 'disabled'],
    shadow: false,
})
{
    options$ : Signal<string[]>     = signal<string[]>([]);
    selected$: Signal<Set<string>>  = signal<Set<string>>(new Set());

    build(_opts: ChipOptions = {})
    {
        this.isMultiple  = () => this.getAttribute('multiple') !== 'false';
        this.isRemovable = () => this.hasAttribute('removable');

        this.chips = (): ChipView[] => {
            const opts = this.options$.get();
            const sel  = this.selected$.get();
            return opts.map(label => {
                const on = sel.has(label);
                return {
                    label,
                    on,
                    cls : 'ar-chip' + (on ? ' ar-chip--on' : ''),
                };
            });
        };

        this.onChipClick = (label: string) => {
            const cur = new Set(this.selected$.get());
            if (cur.has(label)) {
                cur.delete(label);
            } else {
                if (!this.isMultiple()) cur.clear();
                cur.add(label);
            }
            this.selected$.set(cur);
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { selected: [...cur] },
            }));
        };

        this.onRemoveClick = (label: string, e: Event) => {
            e.stopPropagation();
            const cur = new Set(this.selected$.get());
            cur.delete(label);
            this.selected$.set(cur);
            this.dispatchEvent(new CustomEvent('arianna:change', {
                bubbles: true, detail: { selected: [...cur] },
            }));
        };

        this.shouldShowRemove = (chip: ChipView) => this.isRemovable() && chip.on;

        this.template = html`
            <button :class="c.cls"
                    a-for="c in this.chips()"
                    @click="(e) => this.onChipClick(c.label)">
                <span>{{ c.label }}</span>
                <span class="ar-chip__remove"
                      a-if="this.shouldShowRemove(c)"
                      @click="(e) => this.onRemoveClick(c.label, e)"> ✕</span>
            </button>
        `;

        this.Sheet = Chip.DefaultSheet();
    }

    set options(v: string[]) { this.options$.set(v ?? []); }
    get options(): string[]  { return this.options$.get(); }

    set selected(v: string[]) { this.selected$.set(new Set(v ?? [])); }
    get selected(): string[]  { return [...this.selected$.get()]; }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    private isMultiple     : () => boolean = () => true;
    private isRemovable    : () => boolean = () => false;
    private chips          : () => ChipView[] = () => [];
    private onChipClick    : (label: string) => void = () => {};
    private onRemoveClick  : (label: string, e: Event) => void = () => {};
    private shouldShowRemove: (c: ChipView) => boolean = () => false;

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', { display: 'flex', flexWrap: 'wrap', gap: '6px' }),
                new Rule('.ar-chip', {
                    alignItems  : 'center',
                    background  : 'var(--arianna-bg, #ffffff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: '16px',
                    color       : 'var(--arianna-text, #1f2328)',
                    cursor      : 'pointer',
                    display     : 'inline-flex',
                    font        : 'inherit',
                    fontSize    : '0.78rem',
                    gap         : '4px',
                    padding     : '4px 12px',
                    transition  : 'all 0.18s ease',
                    userSelect  : 'none',
                }),
                new Rule('.ar-chip:hover', {
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    color      : 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-chip--on', {
                    background : 'rgba(31,111,235,0.10)',
                    borderColor: 'var(--arianna-primary, #1f6feb)',
                    color      : 'var(--arianna-primary, #1f6feb)',
                }),
                new Rule('.ar-chip__remove', { cursor: 'pointer', opacity: '0.7' }),
                new Rule('.ar-chip__remove:hover', { opacity: '1' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'InputChip', { value: Chip, writable: false, enumerable: false, configurable: false });
}

export default Chip;
