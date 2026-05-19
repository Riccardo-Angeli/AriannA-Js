/**
 * @module    components/display/Banner
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Banner — full-width alert / informational bar with optional icon, action
 * button, and dismiss control.
 *
 * @example JS
 *   const b = new Banner();
 *   b.variant     = 'warning';
 *   b.message     = 'Session expires in 5 minutes.';
 *   b.action      = 'Renew';
 *   b.addEventListener('arianna:action', () => renewSession());
 *
 * @example HTML
 *   <arianna-banner variant="info" message="Welcome back" action="View"></arianna-banner>
 *
 * Events:
 *   - arianna:action   user clicked the action button
 *   - arianna:dismiss  user dismissed the banner (host hidden)
 *
 * Slots:
 *   default — replaces `message` if provided
 *
 * Attrs:  variant, dismissible, icon, message, action
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface BannerOptions {
    variant?     : 'default' | 'info' | 'success' | 'warning' | 'danger';
    dismissible? : boolean;
    icon?        : string;
    message?     : string;
    action?      : string;
}

export class Banner extends Component('arianna-banner', HTMLElement, {}, {
    attrs : ['variant', 'dismissible', 'icon', 'message', 'action'],
})
{
    build(_opts: BannerOptions = {})
    {
        this.setAttribute('role', 'alert');

        const icon    = this.attrSignal('icon');
        const message = this.attrSignal('message');
        const action  = this.attrSignal('action');

        this.iconText      = () => icon.get() ?? '';
        this.messageText   = () => message.get() ?? '';
        this.actionText    = () => action.get() ?? '';
        this.hasIcon       = () => !!icon.get();
        this.hasMessage    = () => !!message.get();
        this.hasAction     = () => !!action.get();
        this.isDismissible = () => this.getAttribute('dismissible') !== 'false';

        this.onAction = () => {
            this.dispatchEvent(new CustomEvent('arianna:action', { bubbles: true, detail: {} }));
        };
        this.onDismiss = () => {
            this.style.display = 'none';
            this.dispatchEvent(new CustomEvent('arianna:dismiss', { bubbles: true, detail: {} }));
        };

        this.template = html`
            <span class="ar-banner__icon" a-if="this.hasIcon()">{{ this.iconText() }}</span>
            <span class="ar-banner__msg" a-if="this.hasMessage()">{{ this.messageText() }}</span>
            <span class="ar-banner__msg" a-if="!this.hasMessage()"><slot></slot></span>
            <button class="ar-banner__action" a-if="this.hasAction()" @click="this.onAction">{{ this.actionText() }}</button>
            <button class="ar-banner__close"  a-if="this.isDismissible()" @click="this.onDismiss" aria-label="Dismiss">✕</button>
        `;

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = Banner.DefaultSheet();
    }

    /** Programmatic dismiss (mirrors the user clicking the close button). */
    dismiss(): void { this.onDismiss(); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get variant(): string  { return this.getAttribute('variant') ?? 'default'; }
    set variant(v: string) { this.setAttribute('variant', v); }

    get dismissible(): boolean  { return this.getAttribute('dismissible') !== 'false'; }
    set dismissible(v: boolean) { this.setAttribute('dismissible', v ? 'true' : 'false'); }

    get icon(): string  { return this.getAttribute('icon') ?? ''; }
    set icon(v: string) { v ? this.setAttribute('icon', v) : this.removeAttribute('icon'); }

    get message(): string  { return this.getAttribute('message') ?? ''; }
    set message(v: string) { v ? this.setAttribute('message', v) : this.removeAttribute('message'); }

    get action(): string  { return this.getAttribute('action') ?? ''; }
    set action(v: string) { v ? this.setAttribute('action', v) : this.removeAttribute('action'); }

    private iconText     : () => string  = () => '';
    private messageText  : () => string  = () => '';
    private actionText   : () => string  = () => '';
    private hasIcon      : () => boolean = () => false;
    private hasMessage   : () => boolean = () => false;
    private hasAction    : () => boolean = () => false;
    private isDismissible: () => boolean = () => true;
    private onAction     : () => void    = () => {};
    private onDismiss    : () => void    = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    alignItems: 'center',
                    display   : 'flex',
                    gap       : '10px',
                    padding   : '10px 16px',
                    fontSize  : '0.83rem',
                    color     : 'var(--arianna-text, #1f2328)',
                    background    : 'var(--arianna-bg-3, #f3f3f3)',
                    borderBottom  : '1px solid var(--arianna-border, #d8d8d8)',
                }),
                new Rule(':host([variant="info"])',    { background: 'rgba(77,208,225,0.12)',  borderBottom: '1px solid var(--arianna-info, #4dd0e1)' }),
                new Rule(':host([variant="success"])', { background: 'rgba(46,160,67,0.12)',   borderBottom: '1px solid var(--arianna-success, #2ea043)' }),
                new Rule(':host([variant="warning"])', { background: 'rgba(210,153,34,0.12)',  borderBottom: '1px solid var(--arianna-warning, #d29922)' }),
                new Rule(':host([variant="danger"])',  { background: 'rgba(207,34,46,0.12)',   borderBottom: '1px solid var(--arianna-danger, #cf222e)' }),
                new Rule('.ar-banner__msg',    { flex: '1' }),
                new Rule('.ar-banner__icon',   { flexShrink: '0' }),
                new Rule('.ar-banner__action', {
                    background    : 'none',
                    border        : 'none',
                    color         : 'var(--arianna-primary, #1f6feb)',
                    cursor        : 'pointer',
                    font          : 'inherit',
                    fontSize      : '0.78rem',
                    fontWeight    : '600',
                    textDecoration: 'underline',
                }),
                new Rule('.ar-banner__close',  {
                    background: 'none',
                    border    : 'none',
                    color     : 'var(--arianna-muted, #8b949e)',
                    cursor    : 'pointer',
                    fontSize  : '0.85rem',
                    marginLeft: 'auto',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Banner', {
        value: Banner, writable: false, enumerable: false, configurable: false,
    });
}

export default Banner;
