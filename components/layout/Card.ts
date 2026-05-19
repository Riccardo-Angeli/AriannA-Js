/**
 * @module    components/layout/Card
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Card — container with optional header / body / footer slots. Supports an
 * elevation tier (0..3) and an optional interactive (clickable) mode.
 *
 * Three layout strategies (in order of precedence):
 *   1. Children with `slot="header"`, `slot="body"`, `slot="footer"` →
 *      projected into the corresponding slot regions.
 *   2. No slotted children + `title` attribute set → an automatic header
 *      with the title text is generated.
 *   3. Otherwise the children render into the default body slot.
 *
 * @example JS
 *   const c = new Card();
 *   c.title       = 'Welcome';
 *   c.elevation   = 2;
 *   c.interactive = true;
 *   document.body.append(c);
 *
 * @example HTML
 *   <arianna-card title="Settings" elevation="2">
 *     <p slot="body">Body content</p>
 *     <button slot="footer">Save</button>
 *   </arianna-card>
 *
 * Events:
 *   - arianna:click   fired when `interactive` and the card is clicked
 *
 * Slots:  header, body (default), footer
 * Attrs:  title, elevation, interactive
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface CardOptions {
    title?       : string;
    elevation?   : 0 | 1 | 2 | 3;
    interactive? : boolean;
}

export class Card extends Component('arianna-card', HTMLElement, {}, {
    attrs : ['title', 'elevation', 'interactive'],
})
{
    build(_opts: CardOptions = {})
    {
        const title = this.attrSignal('title');

        this.hasTitle      = () => !!title.get();
        this.titleText     = () => title.get() ?? '';
        this.isInteractive = () => this.hasAttribute('interactive');
        this.onCardClick   = () => {
            if (!this.isInteractive()) return;
            this.dispatchEvent(new CustomEvent('arianna:click', {
                bubbles: true, detail: { source: this },
            }));
        };

        this.template = html`
            <header class="ar-card__header" a-if="this.hasTitle()">{{ this.titleText() }}</header>
            <header class="ar-card__header"><slot name="header"></slot></header>
            <section class="ar-card__body" @click="this.onCardClick"><slot></slot></section>
            <footer class="ar-card__footer"><slot name="footer"></slot></footer>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = Card.DefaultSheet();
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get title(): string  { return this.getAttribute('title') ?? ''; }
    set title(v: string) { v ? this.setAttribute('title', v) : this.removeAttribute('title'); }

    get elevation(): number  { return parseInt(this.getAttribute('elevation') ?? '0', 10); }
    set elevation(v: number) { this.setAttribute('elevation', String(v)); }

    get interactive(): boolean  { return this.hasAttribute('interactive'); }
    set interactive(v: boolean) { v ? this.setAttribute('interactive', '') : this.removeAttribute('interactive'); }

    private hasTitle     : () => boolean = () => false;
    private titleText    : () => string = () => '';
    private isInteractive: () => boolean = () => false;
    private onCardClick  : () => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    background  : 'var(--arianna-bg, #ffffff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 8px)',
                    color       : 'var(--arianna-text, #1f2328)',
                    display     : 'block',
                    overflow    : 'hidden',
                    padding     : '0',
                }),
                new Rule(':host([elevation="1"])', { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }),
                new Rule(':host([elevation="2"])', { boxShadow: '0 2px 6px rgba(0,0,0,0.10)' }),
                new Rule(':host([elevation="3"])', { boxShadow: '0 6px 18px rgba(0,0,0,0.14)' }),
                new Rule(':host([interactive])',       { cursor: 'pointer', transition: 'transform 0.15s' }),
                new Rule(':host([interactive]):hover', { transform: 'translateY(-1px)' }),
                new Rule('.ar-card__header', {
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    fontWeight  : '600',
                    padding     : '10px 14px',
                }),
                new Rule('.ar-card__header:empty', { display: 'none' }),
                new Rule('.ar-card__body',   { padding: '12px 14px' }),
                new Rule('.ar-card__footer', {
                    borderTop: '1px solid var(--arianna-border, #d8d8d8)',
                    padding  : '10px 14px',
                }),
                new Rule('.ar-card__footer:empty', { display: 'none' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Card', {
        value: Card, writable: false, enumerable: false, configurable: false,
    });
}

export default Card;
