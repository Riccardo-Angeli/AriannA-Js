/**
 * @module    components/display/Snackbar
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Snackbar — toast notification with auto-dismiss + optional action + manual
 * close. Position is configurable; multiple snackbars at the same position
 * stack in a shared fixed container.
 *
 * @example JS
 *   // Static shorthand
 *   Snackbar.show('Saved!', { variant: 'success' });
 *
 *   // Instance
 *   const s = new Snackbar();
 *   s.message = 'Error occurred';
 *   s.variant = 'danger';
 *   s.show();
 *
 * @example HTML — placed inside a position container (rare; usually use .show)
 *   <arianna-snackbar variant="info" message="Welcome" duration="4000"></arianna-snackbar>
 *
 * Events:
 *   - arianna:show
 *   - arianna:hide
 *   - arianna:action
 *
 * Slots:
 *   default — content (replaces `message` when present)
 *
 * Attrs:  message, variant, duration, position, action
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export type SnackbarPosition = 'top-left' | 'top-center' | 'top-right'
                              | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface SnackbarOptions {
    message?  : string;
    variant?  : 'default' | 'success' | 'warning' | 'danger' | 'info';
    duration? : number;
    position? : SnackbarPosition;
    action?   : string;
}

function getContainer(pos: string): HTMLElement
{
    const id = 'ar-snack-container-' + pos;
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.className = 'ar-snackbar-container ar-snackbar-container--' + pos;
        document.body.appendChild(el);
        // Style injected inline once per container
        Object.assign(el.style, {
            display       : 'flex',
            flexDirection : 'column',
            gap           : '8px',
            pointerEvents : 'none',
            position      : 'fixed',
            zIndex        : '5000',
            padding       : '12px',
            maxWidth      : '400px',
        });
        applyContainerPosition(el, pos);
    }
    return el;
}

function applyContainerPosition(el: HTMLElement, pos: string): void
{
    const s = el.style;
    s.top = s.bottom = s.left = s.right = '';
    s.transform = '';
    if (pos.startsWith('top-'))    s.top    = '0';
    if (pos.startsWith('bottom-')) s.bottom = '0';
    if (pos.endsWith('-left'))   s.left  = '0';
    if (pos.endsWith('-right'))  s.right = '0';
    if (pos.endsWith('-center')) { s.left = '50%'; s.transform = 'translateX(-50%)'; }
}

export class Snackbar extends Component('arianna-snackbar', HTMLElement, {}, {
    attrs : ['message', 'variant', 'duration', 'position', 'action'],
    shadow: false,
})
{
    #timer: number = 0;

    build(_opts: SnackbarOptions = {})
    {
        const message = this.attrSignal('message');
        const action  = this.attrSignal('action');

        this.style.display = 'none';

        this.messageText = () => message.get() ?? '';
        this.hasMessage  = () => !!message.get();
        this.actionText  = () => action.get() ?? '';
        this.hasAction   = () => !!action.get();

        this.onActionClick = () => {
            this.dispatchEvent(new CustomEvent('arianna:action', { bubbles: true, detail: {} }));
            this.hide();
        };
        this.onCloseClick = () => this.hide();

        this.template = html`
            <span class="ar-snackbar__msg" a-if="this.hasMessage()">{{ this.messageText() }}</span>
            <span class="ar-snackbar__msg" a-if="!this.hasMessage()"><slot></slot></span>
            <button class="ar-snackbar__action" a-if="this.hasAction()" @click="this.onActionClick">{{ this.actionText() }}</button>
            <button class="ar-snackbar__close" @click="this.onCloseClick" aria-label="Close">✕</button>
        `;

        this.Sheet = Snackbar.DefaultSheet();
    }

    show(): this
    {
        // Move to the right position container if needed
        const pos = (this.getAttribute('position') ?? 'bottom-center') as SnackbarPosition;
        const container = getContainer(pos);
        if (this.parentElement !== container) container.appendChild(this);

        this.style.display = '';
        setTimeout(() => this.classList.add('ar-snackbar--on'), 10);
        const durAttr = this.getAttribute('duration');
        const dur = durAttr !== null ? parseInt(durAttr, 10) : 4000;
        if (dur > 0) this.#timer = window.setTimeout(() => this.hide(), dur);
        this.dispatchEvent(new CustomEvent('arianna:show', { bubbles: true, detail: {} }));
        return this;
    }

    hide(): this
    {
        clearTimeout(this.#timer);
        this.classList.remove('ar-snackbar--on');
        setTimeout(() => {
            this.style.display = 'none';
            this.dispatchEvent(new CustomEvent('arianna:hide', { bubbles: true, detail: {} }));
        }, 280);
        return this;
    }

    /** Shorthand: create + show a snackbar in one call. */
    static show(message: string, opts: Omit<SnackbarOptions, 'message'> = {}): Snackbar
    {
        const s = new Snackbar();
        s.message = message;
        if (opts.variant)  s.variant  = opts.variant;
        if (opts.duration !== undefined) s.duration = opts.duration;
        if (opts.position) s.position = opts.position;
        if (opts.action)   s.action   = opts.action;
        s.show();
        return s;
    }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       { clearTimeout(this.#timer); }

    get message(): string  { return this.getAttribute('message') ?? ''; }
    set message(v: string) { v ? this.setAttribute('message', v) : this.removeAttribute('message'); }

    get variant(): string  { return this.getAttribute('variant') ?? 'default'; }
    set variant(v: string) { this.setAttribute('variant', v); }

    get duration(): number  { return parseInt(this.getAttribute('duration') ?? '4000', 10); }
    set duration(v: number) { this.setAttribute('duration', String(v)); }

    get position(): SnackbarPosition  { return (this.getAttribute('position') ?? 'bottom-center') as never; }
    set position(v: SnackbarPosition) { this.setAttribute('position', v); }

    get action(): string  { return this.getAttribute('action') ?? ''; }
    set action(v: string) { v ? this.setAttribute('action', v) : this.removeAttribute('action'); }

    private messageText  : () => string = () => '';
    private hasMessage   : () => boolean = () => false;
    private actionText   : () => string = () => '';
    private hasAction    : () => boolean = () => false;
    private onActionClick: () => void = () => {};
    private onCloseClick : () => void = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    alignItems   : 'center',
                    borderRadius : 'var(--arianna-radius, 6px)',
                    boxShadow    : '0 6px 20px rgba(0,0,0,0.18)',
                    display      : 'flex',
                    gap          : '10px',
                    opacity      : '0',
                    padding      : '10px 14px',
                    pointerEvents: 'all',
                    transform    : 'translateY(6px)',
                    transition   : 'opacity 0.25s, transform 0.25s',
                    minWidth     : '220px',
                    background   : 'var(--arianna-bg-3, #f3f3f3)',
                    border       : '1px solid var(--arianna-border, #d8d8d8)',
                    color        : 'var(--arianna-text, #1f2328)',
                }),
                new Rule(':root.ar-snackbar--on', { opacity: '1', transform: 'none' }),
                new Rule(':root[variant="success"]', { background: 'var(--arianna-success, #2ea043)', color: '#fff' }),
                new Rule(':root[variant="warning"]', { background: 'var(--arianna-warning, #d29922)', color: '#000' }),
                new Rule(':root[variant="danger"]',  { background: 'var(--arianna-danger,  #cf222e)', color: '#fff' }),
                new Rule(':root[variant="info"]',    { background: 'var(--arianna-info,    #4dd0e1)', color: '#000' }),
                new Rule('.ar-snackbar__msg',    { flex: '1', fontSize: '0.82rem' }),
                new Rule('.ar-snackbar__action', { background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit', fontSize: '0.78rem', fontWeight: '600', textDecoration: 'underline' }),
                new Rule('.ar-snackbar__close',  { background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '0.8rem', opacity: '0.7', padding: '0' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Snackbar', {
        value: Snackbar, writable: false, enumerable: false, configurable: false,
    });
}

export default Snackbar;
