import { Component, Components, Css, Templates } from '../../core/index.ts';
const html = Templates.Template.Html;
/**
 * @convention AriannA component namespace merge
 * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
 */
/**
 * @module    components/display/Divider
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Divider — horizontal or vertical separator with optional centred label.
 *
 * @example JS
 *   const d = new Divider();
 *   d.label = 'OR';
 *
 * @example HTML
 *   <arianna-divider></arianna-divider>
 *   <arianna-divider orientation="vertical"></arianna-divider>
 *   <arianna-divider variant="dashed" label="Section"></arianna-divider>
 *
 * Events: (none)
 * Slots:  default — alternative to `label` attribute
 * Attributes:  orientation, variant, label
 */
const { Rule, Stylesheet } = Css;
type Rule = Css.Rule;
type Stylesheet = Css.Stylesheet;
export interface DividerOptions {
    orientation?: 'horizontal' | 'vertical';
    variant?: 'solid' | 'dashed' | 'dotted';
    label?: string;
}
@Component('arianna-divider', {}, {
    Attributes: ['orientation', 'variant', 'label'],
})
export class Divider extends HTMLElement {
    /** Compiler-visible AriannA binding factory installed by @Component. */
    declare signal: <T>(initial?: T) => Components.Binding<T>;
    /** Compiler-visible AriannA template slot installed by @Component. */
    declare template: unknown;
    onConnected(_opts: DividerOptions = {}) {
        this.setAttribute('role', 'separator');
        const label = this.signal().attribute('label');
        this.hasLabel = () => !!label.Get();
        this.labelText = () => label.Get() ?? '';
        this.template = html `
            <span class="ar-divider__line"></span>
            <span class="ar-divider__label" a-if="this.hasLabel()">{{ this.labelText() }}</span>
            <span class="ar-divider__line"  a-if="this.hasLabel()"></span>
        `;
        (this as unknown as {
            Sheet: Stylesheet | null;
        }).Sheet = Divider.DefaultSheet();
    }
    onCreated() { }
    onBeforeMount() { }
    onMount() { }
    onBeforeUpdate() { }
    onUpdate() { }
    onBeforeUnmount() { }
    onUnmount() { }
    get orientation(): 'horizontal' | 'vertical' { return (this.getAttribute('orientation') ?? 'horizontal') as never; }
    set orientation(v: 'horizontal' | 'vertical') { this.setAttribute('orientation', v); }
    get variant(): 'solid' | 'dashed' | 'dotted' { return (this.getAttribute('variant') ?? 'solid') as never; }
    set variant(v: 'solid' | 'dashed' | 'dotted') { this.setAttribute('variant', v); }
    get label(): string { return this.getAttribute('label') ?? ''; }
    set label(v: string) { v ? this.setAttribute('label', v) : this.removeAttribute('label'); }
    private hasLabel: () => boolean = () => false;
    private labelText: () => string = () => '';
    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
            }),
            new Rule(':host([orientation="horizontal"])', { width: '100%' }),
            new Rule(':host(:not([orientation]))', { width: '100%' }),
            new Rule(':host([orientation="vertical"])', {
                alignSelf: 'stretch',
                flexDirection: 'column',
                width: 'auto',
            }),
            new Rule('.ar-divider__line', {
                borderTop: '1px solid var(--arianna-border, #d8d8d8)',
                flex: '1',
            }),
            new Rule(':host([orientation="vertical"]) .ar-divider__line', {
                borderTop: 'none',
                borderLeft: '1px solid var(--arianna-border, #d8d8d8)',
                flex: '1',
            }),
            new Rule(':host([variant="dashed"]) .ar-divider__line', { borderStyle: 'dashed' }),
            new Rule(':host([variant="dotted"]) .ar-divider__line', { borderStyle: 'dotted' }),
            new Rule('.ar-divider__label', {
                color: 'var(--arianna-muted, #8b949e)',
                fontSize: '0.78rem',
                whiteSpace: 'nowrap',
            }),
        ]);
    }
}
/* ──────────────────────────────────────────────────────────────────────────
 * Divider namespace — public component contracts and module helpers.
 * ────────────────────────────────────────────────────────────────────────── */
export namespace Divider {
    export namespace Interfaces {
        export interface Options extends DividerOptions {
        }
    }
}
export default Divider;
