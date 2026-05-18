/**
 * @module    components/layout/Modal
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 * @license   MIT / Commercial (dual license)
 *
 * Modal — dialog overlay with backdrop. Hosts arbitrary slot content; an
 * optional `title` attribute renders an auto-generated header. Backdrop
 * click dismisses unless `dismissable="false"` is set.
 *
 * @example JS
 *   const m = new Modal();
 *   m.title = 'Confirm';
 *   m.size  = 'lg';
 *   document.body.append(m);
 *   m.append(someBody);
 *   m.open();
 *
 * @example HTML
 *   <arianna-modal title="Settings" size="md">
 *     <p slot="body">Modal body goes here</p>
 *     <button slot="footer">OK</button>
 *   </arianna-modal>
 *
 * Events:
 *   - arianna:open
 *   - arianna:close
 *
 * Slots:  default / body, footer (optional), header (overrides title attr)
 * Attrs:  title, open, size, dismissable
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { Sheet } from '../../core/Sheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface ModalOptions {
    title?       : string;
    open?        : boolean;
    size?        : 'sm' | 'md' | 'lg' | 'xl';
    dismissable? : boolean;
}

export class Modal extends Component('arianna-modal', HTMLElement, {}, {
    attrs : ['title', 'open', 'size', 'dismissable'],
    shadow: false,
})
{
    build(_opts: ModalOptions = {})
    {
        const title = this.attrSignal('title');

        this.hasTitle      = () => !!title.get();
        this.titleText     = () => title.get() ?? '';
        this.onBackdrop    = () => {
            if (this.getAttribute('dismissable') !== 'false') this.close();
        };

        this.template = html`
            <div class="ar-modal__backdrop" @click="this.onBackdrop"></div>
            <div class="ar-modal__dialog">
                <header class="ar-modal__header" a-if="this.hasTitle()">{{ this.titleText() }}</header>
                <header class="ar-modal__header"><slot name="header"></slot></header>
                <section class="ar-modal__body"><slot></slot></section>
                <footer class="ar-modal__footer"><slot name="footer"></slot></footer>
            </div>
        `;

        this.Sheet = Modal.DefaultSheet();
    }

    open(): this
    {
        this.setAttribute('open', '');
        this.dispatchEvent(new CustomEvent('arianna:open', { bubbles: true, detail: { source: this } }));
        return this;
    }

    close(): this
    {
        this.removeAttribute('open');
        this.dispatchEvent(new CustomEvent('arianna:close', { bubbles: true, detail: { source: this } }));
        return this;
    }

    get isOpen(): boolean { return this.hasAttribute('open'); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    get title(): string  { return this.getAttribute('title') ?? ''; }
    set title(v: string) { v ? this.setAttribute('title', v) : this.removeAttribute('title'); }

    get size(): 'sm' | 'md' | 'lg' | 'xl' { return (this.getAttribute('size') ?? 'md') as never; }
    set size(v: 'sm' | 'md' | 'lg' | 'xl') { this.setAttribute('size', v); }

    get dismissable(): boolean  { return this.getAttribute('dismissable') !== 'false'; }
    set dismissable(v: boolean) { this.setAttribute('dismissable', v ? 'true' : 'false'); }

    private hasTitle    : () => boolean = () => false;
    private titleText   : () => string  = () => '';
    private onBackdrop  : () => void    = () => {};

    static DefaultSheet(): Sheet
    {
        return new Sheet(
[
                new Rule(':root', {
                    display : 'none',
                    position: 'fixed',
                    inset   : '0',
                    zIndex  : '1000',
                }),
                new Rule(':root[open]', { display: 'block' }),
                new Rule('.ar-modal__backdrop', {
                    background: 'rgba(0,0,0,0.45)',
                    position  : 'absolute',
                    inset     : '0',
                }),
                new Rule('.ar-modal__dialog', {
                    background  : 'var(--arianna-bg, #ffffff)',
                    borderRadius: 'var(--arianna-radius, 10px)',
                    boxShadow   : '0 16px 48px rgba(0,0,0,0.30)',
                    color       : 'var(--arianna-text, #1f2328)',
                    left        : '50%',
                    maxWidth    : '92vw',
                    maxHeight   : '92vh',
                    overflow    : 'auto',
                    position    : 'absolute',
                    top         : '50%',
                    transform   : 'translate(-50%, -50%)',
                    width       : '420px',
                }),
                new Rule(':root[size="sm"] .ar-modal__dialog', { width: '320px' }),
                new Rule(':root[size="md"] .ar-modal__dialog', { width: '420px' }),
                new Rule(':root[size="lg"] .ar-modal__dialog', { width: '640px' }),
                new Rule(':root[size="xl"] .ar-modal__dialog', { width: '880px' }),
                new Rule('.ar-modal__header', {
                    borderBottom: '1px solid var(--arianna-border, #d8d8d8)',
                    fontWeight  : '600',
                    padding     : '12px 16px',
                }),
                new Rule('.ar-modal__header:empty', { display: 'none' }),
                new Rule('.ar-modal__body',         { padding: '14px 16px' }),
                new Rule('.ar-modal__footer', {
                    borderTop  : '1px solid var(--arianna-border, #d8d8d8)',
                    padding    : '10px 16px',
                    textAlign  : 'right',
                }),
                new Rule('.ar-modal__footer:empty', { display: 'none' }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'Modal', {
        value: Modal, writable: false, enumerable: false, configurable: false,
    });
}

export default Modal;
