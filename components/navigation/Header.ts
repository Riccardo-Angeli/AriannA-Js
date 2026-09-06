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

export const Styles: Stylesheet = (() =>
{
        return new Stylesheet([
            new Rule('.Header', {
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
            new Rule('.Header[theme="light"]', {
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
            new Rule('.Header', {
                background: 'var(--arianna-bg, #ffffff)',
                borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                display: 'block',
            }),
            new Rule('.Header[sticky]', {
                position: 'sticky',
                top: '0',
                zIndex: '100',
            }),
            new Rule('.Header-Inner', {
                alignItems: 'center',
                display: 'flex',
                gap: '12px',
                height: '52px',
                margin: '0 auto',
                maxWidth: '100%',
                padding: '0 16px',
            }),
            new Rule('.Header-Logo', {
                display: 'flex',
                alignItems: 'center',
            }),
            new Rule('.Header-Logo:empty', { display: 'none' }),
            new Rule('.Header-Title', {
                fontSize: '0.95rem',
                fontWeight: '700',
                whiteSpace: 'nowrap',
            }),
            new Rule('.Header-Spacer', { flex: '1' }),
            new Rule('.Header-Actions', {
                alignItems: 'center',
                display: 'flex',
                gap: '8px',
            }),
            new Rule('.Header-Actions:empty', { display: 'none' }),
        ]);
    
})();

@Component('arianna-header', Styles, {
    Shadow: false,
    Attributes: ['title', 'sticky', 'theme'],
})
export class Header extends HTMLElement {
    /** Compiler-visible AriannA binding factory installed by @Component. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    onConnected(_opts: HeaderOptions = {}) {
        this.classList.add('Header');
        if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
        const title = this.signal().attribute('title');
        this.hasTitle = () => !!title.Get();
        this.titleText = () => title.Get() ?? '';
        this.template = html `
            <div class="Header-Inner">
                <div class="Header-Logo"><slot name="logo"></slot></div>
                <span class="Header-Title" a-if="this.hasTitle()">{{ this.titleText() }}</span>
                <div class="Header-Spacer"></div>
                <div class="Header-Actions"><slot name="actions"></slot></div>
            </div>
        `;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = Styles;
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
    public static readonly Styles = Styles;
    static DefaultSheet(): Stylesheet { return Styles; }
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
