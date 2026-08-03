/**
 * @module    components/navigation/Breadcrumb
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Breadcrumb — hierarchical navigation trail with separators between items.
 * Last item is rendered as plain text (current page), others as links.
 *
 * @example JS
 *   const b = new Breadcrumb();
 *   b.items = [
 *     { label: 'Home', href: '/' },
 *     { label: 'Docs', href: '/docs' },
 *     { label: 'API' },
 *   ];
 *
 * @example HTML
 *   <arianna-breadcrumb separator=">"></arianna-breadcrumb>
 *
 * Events:
 *   - arianna:click   detail: { item }
 *
 * Slots:  (none — programmatic items only)
 * Attrs:  separator
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

export interface BreadcrumbItem {
    label : string;
    href?  : string;
    icon?  : string;
}

export interface BreadcrumbOptions {
    separator? : string;
    items?     : BreadcrumbItem[];
}

export class Breadcrumb extends Component('arianna-breadcrumb', HTMLElement, {}, {
    attrs : ['separator'],
})
{
    items$: Signal<BreadcrumbItem[]> = signal<BreadcrumbItem[]>([]);

    build(_opts: BreadcrumbOptions = {})
    {
        this.setAttribute('role', 'navigation');
        this.setAttribute('aria-label', 'Breadcrumb');

        const sep = this.attributeSignal('separator');

        this.allItems   = () => this.items$.Get();
        this.separator  = () => sep.Get() ?? '/';
        this.isLast     = (i: number) => i === this.items$.Get().length - 1;
        this.notLast    = (i: number) => i < this.items$.Get().length - 1;
        this.onItemClick = (item: BreadcrumbItem, e: Event) => {
            e.preventDefault();
            this.dispatchEvent(new CustomEvent('arianna:click', {
                bubbles: true, detail: { item },
            }));
        };

        this.template = html`
            <ol class="ar-breadcrumb__list">
                <li class="ar-breadcrumb__item" a-for="(item, i) in this.allItems()">
                    <span class="ar-breadcrumb__icon" a-if="item.icon">{{ item.icon }}</span>
                    <span class="ar-breadcrumb__current" a-if="this.isLast(i)" aria-current="page">{{ item.label }}</span>
                    <a class="ar-breadcrumb__link"
                       a-if="this.notLast(i)"
                       :href="item.href"
                       @click="(e) => this.onItemClick(item, e)">{{ item.label }}</a>
                    <span class="ar-breadcrumb__sep"
                          a-if="this.notLast(i)"
                          aria-hidden="true">{{ this.separator() }}</span>
                </li>
            </ol>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = Breadcrumb.DefaultSheet();
    }

    set items(v: BreadcrumbItem[]) { this.items$.Set(v ?? []); }
    get items(): BreadcrumbItem[]  { return this.items$.Get(); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    private allItems   : () => BreadcrumbItem[] = () => [];
    private separator  : () => string = () => '/';
    private isLast     : (i: number) => boolean = () => false;
    private notLast    : (i: number) => boolean = () => false;
    private onItemClick: (i: BreadcrumbItem, e: Event) => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', { display: 'block' }),
                new Rule('.ar-breadcrumb__list', {
                    display : 'flex',
                    flexWrap: 'wrap',
                    gap     : '2px',
                    listStyle: 'none',
                    margin  : '0',
                    padding : '0',
                }),
                new Rule('.ar-breadcrumb__item', {
                    alignItems: 'center',
                    display   : 'flex',
                    gap       : '4px',
                    fontSize  : '0.82rem',
                }),
                new Rule('.ar-breadcrumb__link', {
                    color         : 'var(--arianna-primary, #1f6feb)',
                    textDecoration: 'none',
                }),
                new Rule('.ar-breadcrumb__link:hover', { textDecoration: 'underline' }),
                new Rule('.ar-breadcrumb__current', { color: 'var(--arianna-muted, #8b949e)' }),
                new Rule('.ar-breadcrumb__sep',     { color: 'var(--arianna-dim, #a0a0a0)', padding: '0 2px' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Breadcrumb', {
        value: Breadcrumb, writable: false, enumerable: false, configurable: false,
    });
}

export default Breadcrumb;
