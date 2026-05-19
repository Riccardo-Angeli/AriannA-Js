/**
 * @module    components/finance/AlertBadge
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * AlertBadge — pill badge with 4 severity levels. Renders text + optional
 * sublabel. Colors map to AriannA tokens with sane fallbacks.
 *
 * @example HTML
 *   <arianna-alert-badge level="warning" text="High volatility" sublabel="last hour"></arianna-alert-badge>
 *
 * Attrs: text, sublabel, level ('neutral' | 'info' | 'warning' | 'danger')
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export type AlertLevel = 'neutral' | 'info' | 'warning' | 'danger';

export interface AlertBadgeOptions {
    text?     : string;
    sublabel? : string;
    level?    : AlertLevel;
}

export class AlertBadge extends Component('arianna-alert-badge', HTMLElement, {}, {
    attrs : ['text', 'sublabel', 'level'],
})
{
    build(_opts: AlertBadgeOptions = {})
    {
        const text     = this.attrSignal('text');
        const sublabel = this.attrSignal('sublabel');

        this.textVal     = () => text.get() ?? '';
        this.subVal      = () => sublabel.get() ?? '';
        this.hasSub      = () => !!sublabel.get();

        this.template = html`
            <span class="ar-alert__main">{{ this.textVal() }}</span>
            <span class="ar-alert__sub" a-if="this.hasSub()">{{ this.subVal() }}</span>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = AlertBadge.DefaultSheet();
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get level(): AlertLevel  { return (this.getAttribute('level') ?? 'neutral') as AlertLevel; }
    set level(v: AlertLevel) { this.setAttribute('level', v); }

    get text(): string  { return this.getAttribute('text') ?? ''; }
    set text(v: string) { this.setAttribute('text', v); }

    private textVal: () => string  = () => '';
    private subVal : () => string  = () => '';
    private hasSub : () => boolean = () => false;

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    alignItems   : 'center',
                    background   : 'var(--arianna-bg-3, #f3f3f3)',
                    borderRadius : '4px',
                    display      : 'inline-flex',
                    fontFamily   : 'inherit',
                    gap          : '6px',
                    padding      : '4px 10px',
                }),
                new Rule(':host .ar-alert__main', {
                    color     : 'var(--arianna-muted, #6e6b62)',
                    fontSize  : '13px',
                    fontWeight: '600',
                }),
                new Rule(':host .ar-alert__sub', {
                    color   : 'var(--arianna-muted, #6e6b62)',
                    fontSize: '11px',
                }),

                // ── Level palettes ──────────────────────────────────────────
                new Rule(':host([level="neutral"])', {
                    background: 'var(--arianna-bg-3, #f3f3f3)',
                }),
                new Rule(':host([level="neutral"]) .ar-alert__main', {
                    color: 'var(--arianna-muted, #6e6b62)',
                }),

                new Rule(':host([level="info"])', {
                    background: 'rgba(31,111,235,0.10)',
                }),
                new Rule(':host([level="info"]) .ar-alert__main', {
                    color: 'var(--arianna-primary, #1f6feb)',
                }),

                new Rule(':host([level="warning"])', {
                    background: 'rgba(245,166,35,0.15)',
                }),
                new Rule(':host([level="warning"]) .ar-alert__main', {
                    color: 'var(--arianna-warning, #f5a623)',
                }),

                new Rule(':host([level="danger"])', {
                    background: 'rgba(207,34,46,0.12)',
                }),
                new Rule(':host([level="danger"]) .ar-alert__main', {
                    color: 'var(--arianna-danger, #cf222e)',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'AlertBadge', {
        value: AlertBadge, writable: false, enumerable: false, configurable: false,
    });
}

export default AlertBadge;
