import { Component, Components, Css, Templates } from '../../core/index.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
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
 * Attributes:  variant, dot, label
 */
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;
export interface BadgeOptions {
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
    dot?: boolean;
    label?: string;
}
@Component('arianna-badge', {}, {
    Attributes: ['variant', 'dot', 'label'],
})
export class Badge extends HTMLElement {
    /** Compiler-visible AriannA binding factory installed by @Component. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    onConnected(_opts: BadgeOptions = {}) {
        const label = this.signal().attribute('label');
        const dot = this.signal().attribute('dot');
        this.isDot = () => dot.Get() !== null && dot.Get() !== undefined;
        this.labelText = () => label.Get() ?? '';
        this.hasLabel = () => !this.isDot() && !!label.Get();
        this.hasSlotted = () => !this.isDot() && !label.Get();
        this.template = html `
            <span a-if="this.hasLabel()">{{ this.labelText() }}</span>
            <slot a-if="this.hasSlotted()"></slot>
        `;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = Badge.DefaultSheet();
    }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    get variant(): string { return this.getAttribute('variant') ?? 'default'; }
    set variant(v: string) { this.setAttribute('variant', v); }
    get label(): string { return this.getAttribute('label') ?? ''; }
    set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }
    get dot(): boolean { return this.hasAttribute('dot'); }
    set dot(v: boolean) { v ? this.setAttribute('dot', '') : this.removeAttribute('dot'); }
    private isDot: () => boolean = () => false;
    private labelText: () => string = () => '';
    private hasLabel: () => boolean = () => false;
    private hasSlotted: () => boolean = () => false;
    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                alignItems: 'center',
                borderRadius: '10px',
                display: 'inline-flex',
                fontSize: '0.72rem',
                fontWeight: '600',
                padding: '2px 8px',
                whiteSpace: 'nowrap',
                background: 'var(--arianna-bg-3, #f3f3f3)',
                color: 'var(--arianna-text, #1f2328)',
            }),
            new Rule(':host([variant="primary"])', { background: 'var(--arianna-primary, #1f6feb)', color: '#fff' }),
            new Rule(':host([variant="success"])', { background: 'var(--arianna-success, #2ea043)', color: '#fff' }),
            new Rule(':host([variant="warning"])', { background: 'var(--arianna-warning, #d29922)', color: '#000' }),
            new Rule(':host([variant="danger"])', { background: 'var(--arianna-danger, #cf222e)', color: '#fff' }),
            new Rule(':host([variant="info"])', { background: 'var(--arianna-info, #4dd0e1)', color: '#000' }),
            new Rule(':host([dot])', {
                borderRadius: '50%',
                height: '8px',
                minWidth: '8px',
                padding: '0',
                width: '8px',
            }),
        ]);
    }
}
/* ──────────────────────────────────────────────────────────────────────────
 * Badge namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace Badge {
    export namespace Interfaces {
        export interface Options extends BadgeOptions {
        }
    }
}
export default Badge;
