import { Component, Components, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
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
 * Attributes:  separator
 */
/* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
   members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
   `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
   not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
   returns the contract, so aliasing the class yields "Type 'Signal<T>' is missing … Source, Mutate,
   Map, Effect" with the same name printed twice. */
const signal = Reactivity.CreateSignal;
type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;
export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: string;
}
export interface BreadcrumbOptions {
    separator?: string;
    items?: BreadcrumbItem[];
}

export const Styles: Stylesheet = (() =>
{
        return new Stylesheet([
            new Rule('.Breadcrumb', {
                '--arianna-bg': '#17181c',
                '--arianna-bg-2': '#1d1e23',
                '--arianna-bg-3': '#24262b',
                '--arianna-text': '#e6e8eb',
                '--arianna-muted': '#9aa0aa',
                '--arianna-dim': '#6f7580',
                '--arianna-border': '#303238',
                '--arianna-primary': '#e40c88',
                '--arianna-success': '#26a69a',
                '--arianna-warning': '#f5a623',
                '--arianna-danger': '#ef5350',
                '--bg': '#17181c',
                '--bg3': '#24262b',
                '--text': '#e6e8eb',
                '--muted': '#9aa0aa',
                '--border': '#303238',
                '--accent': '#e40c88',
            }),
            new Rule('.Breadcrumb[theme="light"]', {
                '--arianna-bg': '#ffffff',
                '--arianna-bg-2': '#fbfbfc',
                '--arianna-bg-3': '#f3f3f5',
                '--arianna-text': '#1c1e21',
                '--arianna-muted': '#626873',
                '--arianna-dim': '#8a8f98',
                '--arianna-border': '#e2e2e6',
                '--arianna-primary': '#e40c88',
                '--arianna-success': '#168a78',
                '--arianna-warning': '#b66c00',
                '--arianna-danger': '#c93645',
                '--bg': '#ffffff',
                '--bg3': '#f3f3f5',
                '--text': '#1c1e21',
                '--muted': '#626873',
                '--border': '#e2e2e6',
                '--accent': '#e40c88',
            }),
            new Rule('.Breadcrumb', { display: 'block' }),
            new Rule('.Breadcrumb-List', {
                display: 'flex',
                flexWrap: 'wrap',
                gap: '2px',
                listStyle: 'none',
                margin: '0',
                padding: '0',
            }),
            new Rule('.Breadcrumb-Item', {
                alignItems: 'center',
                display: 'flex',
                gap: '4px',
                fontSize: '0.82rem',
            }),
            new Rule('.Breadcrumb-Link', {
                color: 'var(--arianna-primary, #1f6feb)',
                textDecoration: 'none',
            }),
            new Rule('.Breadcrumb-Link:hover', { textDecoration: 'underline' }),
            new Rule('.Breadcrumb-Current', { color: 'var(--arianna-muted, #8b949e)' }),
            new Rule('.Breadcrumb-Separator', { color: 'var(--arianna-dim, #a0a0a0)', padding: '0 2px' }),
        ]);
    
})();

@Component('arianna-breadcrumb', Styles, {
    Shadow: false,
    Attributes: ['separator', 'theme', 'items'],
    Properties: ['items'],
})
export class Breadcrumb extends HTMLElement {
    /** Compiler-visible AriannA binding factory installed by @Component. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    private _itemsSignal?: Signal<BreadcrumbItem[]>;
    public get items$(): Signal<BreadcrumbItem[]>
    {
        this._itemsSignal ??= signal<BreadcrumbItem[]>([]);
        return this._itemsSignal;
    }
    onConnected(_opts: BreadcrumbOptions = {}) {
        this.classList.add('Breadcrumb');
        if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
        this.setAttribute('role', 'navigation');
        this.setAttribute('aria-label', 'Breadcrumb');
        const sep = this.signal().attribute('separator');
        this.allItems = () => this.items$.Get();
        this.separator = () => sep.Get() ?? '/';
        this.isLast = (i: number) => i === this.items$.Get().length - 1;
        this.notLast = (i: number) => i < this.items$.Get().length - 1;
        this.onItemClick = (item: BreadcrumbItem, e: Event) => {
            e.preventDefault();
            this.dispatchEvent(new CustomEvent('arianna:click', {
                bubbles: true, detail: { item },
            }));
        };
        this.template = html `
            <ol class="Breadcrumb-List">
                <li class="Breadcrumb-Item" a-for="(item, i) in this.allItems()">
                    <span class="Breadcrumb-Icon" a-if="item.icon">{{ item.icon }}</span>
                    <span class="Breadcrumb-Current" a-if="this.isLast(i)" aria-current="page">{{ item.label }}</span>
                    <a class="Breadcrumb-Link"
                       a-if="this.notLast(i)"
                       :href="item.href"
                       @click="(e) => this.onItemClick(item, e)">{{ item.label }}</a>
                    <span class="Breadcrumb-Separator"
                          a-if="this.notLast(i)"
                          aria-hidden="true">{{ this.separator() }}</span>
                </li>
            </ol>
        `;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = Styles;
    }
    set items(v: BreadcrumbItem[]) { this.items$.Set(v ?? []); }
    get items(): BreadcrumbItem[] { return this.items$.Get(); }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    private allItems: () => BreadcrumbItem[] = () => [];
    private separator: () => string = () => '/';
    private isLast: (i: number) => boolean = () => false;
    private notLast: (i: number) => boolean = () => false;
    private onItemClick: (i: BreadcrumbItem, e: Event) => void = () => { };
    public static readonly Styles = Styles;
    static DefaultSheet(): Stylesheet { return Styles; }
}
/* ──────────────────────────────────────────────────────────────────────────
 * Breadcrumb namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace Breadcrumb {
    export namespace Interfaces {
        export interface Item extends BreadcrumbItem {
        }
        export interface Options extends BreadcrumbOptions {
        }
    }
}
export default Breadcrumb;
