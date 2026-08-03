/**
 * @module    components/display/Tag
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Tag — group of small bordered labels. Optionally removable.
 *
 * @example JS
 *   const t = new Tag();
 *   t.items = ['TypeScript', 'AriannA', 'Rust'];
 *   t.removable = true;
 *   t.addEventListener('arianna:remove', e => console.log(e.detail.item));
 *
 * @example HTML
 *   <arianna-tag removable></arianna-tag>
 *   <!-- then set .items = [...] in JS -->
 *
 * Events:
 *   - arianna:remove   detail: { item }
 *
 * Slots:  (none)
 * Attrs:  removable
 */

import { Component } from '../../core/Components.ts';
import { html }      from '../../core/Template.ts';
import { Reactivity } from '../../core/Reactive.ts';

/* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
   members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
   `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
   not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
   returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
   Map, Effect" with the same name printed twice. */
const signal = Reactivity.CreateSignal;
type Signal<T> = Reactivity.Types.SignalContract<T>;
import { Css } from '../../core/Css.ts';
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;

export interface TagOptions {
    removable? : boolean;
    items?     : string[];
}

export class Tag extends Component('arianna-tag', HTMLElement, {}, {
    attrs : ['removable'],
})
{
    items$: Signal<string[]> = signal<string[]>([]);

    build(_opts: TagOptions = {})
    {
        this.allItems    = () => this.items$.Get();
        this.isRemovable = () => this.hasAttribute('removable');
        this.onRemove    = (item: string) => {
            this.items$.Set(this.items$.Get().filter(i => i !== item));
            this.dispatchEvent(new CustomEvent('arianna:remove', { bubbles: true, detail: { item } }));
        };

        this.template = html`
            <span class="ar-tag" a-for="item in this.allItems()">
                {{ item }}
                <button class="ar-tag__remove"
                        a-if="this.isRemovable()"
                        @click="(e) => this.onRemove(item)"
                        aria-label="Remove">✕</button>
            </span>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = Tag.DefaultSheet();
    }

    set items(v: string[]) { this.items$.Set(v ?? []); }
    get items(): string[]  { return this.items$.Get(); }

    /** Add a single item to the list. */
    addItem(item: string): void { this.items$.Set([...this.items$.Get(), item]); }
    /** Remove a single item from the list (matches by string equality). */
    removeItem(item: string): void { this.items$.Set(this.items$.Get().filter(i => i !== item)); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get removable(): boolean  { return this.hasAttribute('removable'); }
    set removable(v: boolean) { v ? this.setAttribute('removable', '') : this.removeAttribute('removable'); }

    private allItems   : () => string[] = () => [];
    private isRemovable: () => boolean  = () => false;
    private onRemove   : (item: string) => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', { display: 'flex', flexWrap: 'wrap', gap: '6px' }),
                new Rule('.ar-tag', {
                    alignItems  : 'center',
                    background  : 'var(--arianna-bg-3, #f3f3f3)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius-sm, 4px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    display     : 'inline-flex',
                    fontSize    : '0.75rem',
                    gap         : '4px',
                    padding     : '2px 8px',
                }),
                new Rule('.ar-tag__remove', {
                    background: 'none',
                    border    : 'none',
                    color     : 'var(--arianna-muted, #8b949e)',
                    cursor    : 'pointer',
                    fontSize  : '0.7rem',
                    lineHeight: '1',
                    padding   : '0',
                }),
                new Rule('.ar-tag__remove:hover', { color: 'var(--arianna-danger, #cf222e)' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Tag', {
        value: Tag, writable: false, enumerable: false, configurable: false,
    });
}

export default Tag;
