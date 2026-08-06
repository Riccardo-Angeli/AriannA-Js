import { Component, Components, Css, Templates } from '../../core/index.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
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
 * Attributes:  title, sticky
 */
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;
export interface HeaderOptions {
    title?: string;
    sticky?: boolean;
}
@Component('arianna-header', {}, {
    Attributes: ['title', 'sticky'],
})
export class Header extends HTMLElement {
    /** Compiler-visible AriannA binding factory installed by @Component. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    onConnected(_opts: HeaderOptions = {}) {
        const title = this.signal().attribute('title');
        this.hasTitle = () => !!title.Get();
        this.titleText = () => title.Get() ?? '';
        this.template = html `
            <div class="ar-header__inner">
                <div class="ar-header__logo"><slot name="logo"></slot></div>
                <span class="ar-header__title" a-if="this.hasTitle()">{{ this.titleText() }}</span>
                <div class="ar-header__spacer"></div>
                <div class="ar-header__actions"><slot name="actions"></slot></div>
            </div>
        `;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = Header.DefaultSheet();
    }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    get title(): string { return this.getAttribute('title') ?? ''; }
    set title(v: string) { v ? this.setAttribute('title', v) : this.removeAttribute('title'); }
    get sticky(): boolean { return this.hasAttribute('sticky'); }
    set sticky(v: boolean) { v ? this.setAttribute('sticky', '') : this.removeAttribute('sticky'); }
    private hasTitle: () => boolean = () => false;
    private titleText: () => string = () => '';
    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                background: 'var(--arianna-bg, #ffffff)',
                borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                display: 'block',
            }),
            new Rule(':host([sticky])', {
                position: 'sticky',
                top: '0',
                zIndex: '100',
            }),
            new Rule('.ar-header__inner', {
                alignItems: 'center',
                display: 'flex',
                gap: '12px',
                height: '52px',
                margin: '0 auto',
                maxWidth: '100%',
                padding: '0 16px',
            }),
            new Rule('.ar-header__logo', {
                display: 'flex',
                alignItems: 'center',
            }),
            new Rule('.ar-header__logo:empty', { display: 'none' }),
            new Rule('.ar-header__title', {
                fontSize: '0.95rem',
                fontWeight: '700',
                whiteSpace: 'nowrap',
            }),
            new Rule('.ar-header__spacer', { flex: '1' }),
            new Rule('.ar-header__actions', {
                alignItems: 'center',
                display: 'flex',
                gap: '8px',
            }),
            new Rule('.ar-header__actions:empty', { display: 'none' }),
        ]);
    }
}
/* ──────────────────────────────────────────────────────────────────────────
 * Header namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace Header {
    export namespace Interfaces {
        export interface Options extends HeaderOptions {
        }
    }
}
export default Header;
