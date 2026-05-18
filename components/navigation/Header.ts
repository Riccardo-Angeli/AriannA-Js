/**
 * @module    components/navigation/Header
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Header — application top bar with logo / title / actions slots and optional
 * sticky positioning.
 *
 * @example JS
 *   const h = new Header();
 *   h.title = 'AriannA';
 *   h.sticky = true;
 *
 * @example HTML
 *   <arianna-header sticky title="My App">
 *     <img slot="logo" src="/logo.svg" alt="logo">
 *     <button slot="actions">Sign in</button>
 *   </arianna-header>
 *
 * Events: (none)
 * Slots:  logo, actions (default ignored when title attr present)
 * Attrs:  title, sticky
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface HeaderOptions {
    title?  : string;
    sticky? : boolean;
}

export class Header extends Component('arianna-header', HTMLElement, {}, {
    attrs : ['title', 'sticky'],
    shadow: false,
})
{
    build(_opts: HeaderOptions = {})
    {
        const title = this.attrSignal('title');

        this.hasTitle  = () => !!title.get();
        this.titleText = () => title.get() ?? '';

        this.template = html`
            <div class="ar-header__inner">
                <div class="ar-header__logo"><slot name="logo"></slot></div>
                <span class="ar-header__title" a-if="this.hasTitle()">{{ this.titleText() }}</span>
                <div class="ar-header__spacer"></div>
                <div class="ar-header__actions"><slot name="actions"></slot></div>
            </div>
        `;

        this.Sheet = Header.DefaultSheet();
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

    get sticky(): boolean  { return this.hasAttribute('sticky'); }
    set sticky(v: boolean) { v ? this.setAttribute('sticky', '') : this.removeAttribute('sticky'); }

    private hasTitle : () => boolean = () => false;
    private titleText: () => string  = () => '';

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    background  : 'var(--arianna-bg, #ffffff)',
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    display     : 'block',
                }),
                new Rule(':root[sticky]', {
                    position: 'sticky',
                    top     : '0',
                    zIndex  : '100',
                }),
                new Rule('.ar-header__inner', {
                    alignItems: 'center',
                    display   : 'flex',
                    gap       : '12px',
                    height    : '52px',
                    margin    : '0 auto',
                    maxWidth  : '100%',
                    padding   : '0 16px',
                }),
                new Rule('.ar-header__logo', {
                    display    : 'flex',
                    alignItems : 'center',
                }),
                new Rule('.ar-header__logo:empty', { display: 'none' }),
                new Rule('.ar-header__title', {
                    fontSize  : '0.95rem',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                }),
                new Rule('.ar-header__spacer', { flex: '1' }),
                new Rule('.ar-header__actions', {
                    alignItems: 'center',
                    display   : 'flex',
                    gap       : '8px',
                }),
                new Rule('.ar-header__actions:empty', { display: 'none' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Header', {
        value: Header, writable: false, enumerable: false, configurable: false,
    });
}

export default Header;
