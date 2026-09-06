/**
 * @module    components/layout/Modal
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA Modal component module.
 */

declare const Component: any;
declare const Components: any;
declare namespace Components { type Binding<T> = any; }
declare const Css: any;
declare namespace Css { type Rule = any; type Stylesheet = any; }
declare const Templates: any;



/** @namespace   Modal
 *  @public
 *  @description Namespace containing Modal contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace Modal
{
    /** @namespace   Types
     *  @public
     *  @description Namespace containing Types contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Types
    {
        /** @name        Rule
         *  @public
         *  @type        {Css.Rule}
         *  @description Type alias for Rule.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Rule = Css.Rule;

        /** @name        Stylesheet
         *  @public
         *  @type        {Css.Stylesheet}
         *  @description Type alias for Stylesheet.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export type Stylesheet = Css.Stylesheet;
    }

    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   ModalOptions
         *  @public
         *  @description ModalOptions contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface ModalOptions
        {
            /** @name        title
             *  @public
             *  @type        {string}
             *  @description Component member for title.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            title?: string;

            /** @name        open
             *  @public
             *  @type        {boolean}
             *  @description Component member for open.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            open?: boolean;

            /** @name        size
             *  @public
             *  @type        {'sm' | 'md' | 'lg' | 'xl'}
             *  @description Component member for size.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            size?: 'sm' | 'md' | 'lg' | 'xl';

            /** @name        dismissable
             *  @public
             *  @type        {boolean}
             *  @description Component member for dismissable.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            dismissable?: boolean;
        }
    }

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const html = Templates.Template.Html;

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export const { Rule, Stylesheet } = Css;

    /** @class       Modal
     *  @public
     *  @description AriannA Modal component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    
    /** Default class-driven light-DOM stylesheet; installed synchronously by @Component. */
    export function ModalDefaultSheet(): Types.Stylesheet
    {
        return new Stylesheet([
            new Rule('arianna-modal', {
                BoxSizing: 'border-box',
                Display: 'none',
                Inset: '0',
                MaxWidth: '100%',
                MinWidth: '0',
                Position: 'fixed',
                ZIndex: '2000',
            }),

            new Rule('arianna-modal[open]', {
                Display: 'block',
            }),

            new Rule('.ar-modal__backdrop', {
                BackdropFilter: 'blur(8px)',
                Background: 'rgba(5,6,8,.68)',
                Inset: '0',
                Position: 'absolute',
                WebkitBackdropFilter: 'blur(8px)',
            }),

            new Rule('.ar-modal__dialog', {
                Background: 'linear-gradient(180deg,#1d1e23 0%,#17181c 100%)',
                Border: '1px solid #34363d',
                BorderRadius: '10px',
                BoxShadow: '0 28px 86px rgba(0,0,0,.56), 0 0 0 1px rgba(255,255,255,.02)',
                Color: '#e7e9ed',
                Left: '50%',
                MaxHeight: '92vh',
                MaxWidth: '92vw',
                Overflow: 'hidden',
                Position: 'absolute',
                Top: '50%',
                Transform: 'translate(-50%, -50%)',
                Width: '420px',
            }),

            new Rule('arianna-modal[size="sm"] .ar-modal__dialog', {
                Width: '320px',
            }),

            new Rule('arianna-modal[size="md"] .ar-modal__dialog', {
                Width: '420px',
            }),

            new Rule('arianna-modal[size="lg"] .ar-modal__dialog', {
                Width: '640px',
            }),

            new Rule('arianna-modal[size="xl"] .ar-modal__dialog', {
                Width: '880px',
            }),

            new Rule('.ar-modal__header', {
                Background: 'linear-gradient(180deg,#36373b 0%,#292a2e 100%)',
                BorderBottom: '1px solid #34363d',
                BoxShadow: 'inset 0 2px 0 #e40c88',
                Color: '#f2f3f5',
                FontWeight: '650',
                Padding: '12px 16px',
            }),

            new Rule('.ar-modal__header:empty', {
                Display: 'none',
            }),

            new Rule('.ar-modal__body', {
                Background: '#17181c',
                Color: '#b0b5be',
                Overflow: 'auto',
                Padding: '15px 16px',
            }),

            new Rule('.ar-modal__footer', {
                AlignItems: 'center',
                Background: '#1a1b1f',
                BorderTop: '1px solid #303238',
                Display: 'flex',
                Gap: '8px',
                JustifyContent: 'flex-end',
                Padding: '10px 16px',
            }),

            new Rule('.ar-modal__footer:empty', {
                Display: 'none',
            }),

            new Rule('.ar-modal__footer button', {
                Appearance: 'none',
                Background: '#25272c',
                Border: '1px solid #3a3d45',
                BorderRadius: '6px',
                Color: '#dfe2e7',
                Cursor: 'pointer',
                Padding: '7px 11px',
            }),

            new Rule('.ar-modal__footer button:hover', {
                Background: '#2d3036',
                BorderColor: '#555963',
                Color: '#ffffff',
            }),

            new Rule('.ar-modal__footer button:last-child', {
                Background: '#e40c88',
                BorderColor: '#e40c88',
                Color: '#ffffff',
            }),

            new Rule('.ar-modal__footer button:last-child:hover', {
                Background: '#f01898',
                BorderColor: '#f01898',
            }),

            /* Explicit Light */
            new Rule('arianna-modal[theme="light"] .ar-modal__backdrop', {
                Background: 'rgba(20,22,26,.30)',
            }),

            new Rule('arianna-modal[theme="light"] .ar-modal__dialog', {
                Background: '#ffffff',
                BorderColor: '#dedfe4',
                BoxShadow: '0 28px 76px rgba(0,0,0,.22)',
                Color: '#1c1e21',
            }),

            new Rule('arianna-modal[theme="light"] .ar-modal__header', {
                Background: 'linear-gradient(180deg,#ffffff 0%,#f2f2f5 100%)',
                BorderBottomColor: '#e3e4e8',
                Color: '#1c1e21',
            }),

            new Rule('arianna-modal[theme="light"] .ar-modal__body', {
                Background: '#ffffff',
                Color: '#545a64',
            }),

            new Rule('arianna-modal[theme="light"] .ar-modal__footer', {
                Background: '#f7f7f9',
                BorderTopColor: '#e3e4e8',
            }),

            new Rule('arianna-modal[theme="light"] .ar-modal__footer button:not(:last-child)', {
                Background: '#f0f1f3',
                BorderColor: '#d7d9df',
                Color: '#292c31',
            }),

            new Rule('arianna-modal arianna-button .ar-btn__native', {
                Background: '#25272c',
                Border: '1px solid #3a3d45',
                Color: '#dfe2e7',
            }),

            new Rule('arianna-modal arianna-button[variant="primary"] .ar-btn__native', {
                Background: '#e40c88',
                Border: '1px solid #e40c88',
                Color: '#ffffff',
            }),

            new Rule('arianna-modal arianna-button[variant="danger"] .ar-btn__native', {
                Background: '#c83d4a',
                Border: '1px solid #c83d4a',
                Color: '#ffffff',
            }),

            new Rule('arianna-modal[theme="light"] arianna-button .ar-btn__native', {
                Background: '#f0f1f3',
                Border: '1px solid #d7d9df',
                Color: '#292c31',
            }),

            new Rule('arianna-modal[theme="light"] arianna-button[variant="primary"] .ar-btn__native', {
                Background: '#e40c88',
                Border: '1px solid #e40c88',
                Color: '#ffffff',
            }),

        ]);
    }

@Component('arianna-modal', ModalDefaultSheet(), {
        Attributes: ['title', 'open', 'size', 'dismissable', 'theme'],
    })
    export class Modal extends HTMLDivElement
    {
        /** Embedded component icon used by WYSIWYG palettes and drag/drop panels. */
        static readonly Icon = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 9h16" stroke="currentColor" stroke-width="2"/></svg>`;
        /** Canonical named default styles. Use e.g. Component.Styles['Disabled']. */
        static readonly Styles = Object.freeze
        (
            {
                Default:
                new Rule('arianna-modal', {
                BoxSizing: 'border-box',
                MaxWidth: '100%',
                MinWidth: '0',
                Display: 'none',
                Position: 'fixed',
                Inset: '0',
                ZIndex: '1000',
                }),
                Open:
                new Rule('arianna-modal[open]', { display: 'block' }),
                Backdrop:
                new Rule('.ar-modal__backdrop', {
                Background: 'rgba(10,10,14,.58)',
                BackdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                Position: 'absolute',
                Inset: '0',
                }),
                Dialog:
                new Rule('.ar-modal__dialog', {
                Background: 'var(--arianna-bg, var(--bg, #ffffff))',
                Border: '1px solid color-mix(in srgb, var(--arianna-primary, #e40c88) 28%, var(--arianna-border, #e6e8eb))',
                BorderRadius: 'var(--arianna-radius, 12px)',
                BoxShadow: '0 24px 80px rgba(0,0,0,.38), 0 0 0 1px rgba(255,255,255,.025)',
                Color: 'var(--arianna-text, var(--text, #1c1e21))',
                Left: '50%',
                MaxWidth: '92vw',
                MaxHeight: '92vh',
                Overflow: 'auto',
                Position: 'absolute',
                Top: '50%',
                Transform: 'translate(-50%, -50%)',
                Width: '420px',
                }),
                SizeSmDialog:
                new Rule('arianna-modal[size="sm"] .ar-modal__dialog', { width: '320px' }),
                SizeMdDialog:
                new Rule('arianna-modal[size="md"] .ar-modal__dialog', { width: '420px' }),
                SizeLgDialog:
                new Rule('arianna-modal[size="lg"] .ar-modal__dialog', { width: '640px' }),
                SizeXlDialog:
                new Rule('arianna-modal[size="xl"] .ar-modal__dialog', { width: '880px' }),
                Header:
                new Rule('.ar-modal__header', {
                Background: 'linear-gradient(180deg, color-mix(in srgb, var(--arianna-primary, #e40c88) 7%, var(--arianna-bg, #fff)), var(--arianna-bg, #fff))',
                BorderBottom: '1px solid var(--arianna-border, var(--border, #e6e8eb))',
                BoxShadow: 'inset 0 3px 0 var(--arianna-primary, #e40c88)',
                FontWeight: '650',
                Padding: '12px 16px',
                }),
                HeaderEmpty:
                new Rule('.ar-modal__header:empty', { display: 'none' }),
                Body:
                new Rule('.ar-modal__body', { padding: '14px 16px' }),
                Footer:
                new Rule('.ar-modal__footer', {
                BorderTop: '1px solid var(--arianna-border, var(--border, #e6e8eb))',
                Padding: '10px 16px',
                TextAlign: 'right',
                }),
                FooterEmpty:
                new Rule('.ar-modal__footer:empty', { display: 'none' }),
            }
        );


        /** Embedded component icon. */
        get Icon(): string { return Modal.Icon; }

        /** Canonical AriannA public DOM identity. */
        private readonly _AriannaIdentity = (() =>
        {
            const type = 'Modal';
            for(const cls of Array.from(this.classList))
            {
                if(cls.startsWith('__real-')) this.classList.remove(cls);
            }
            this.classList.add(type);

            const counters = globalThis as typeof globalThis & { __AriannaComponentIds?: Record<string, number> };
            const ids = counters.__AriannaComponentIds ??= Object.create(null);
            const n = ids[type] = (ids[type] ?? 0) + 1;
            this.id = `${type}-${n}`;
            return true;
        })();

        constructor()
        {
            super();
            this.classList.add('Modal');
        }

        /** Compiler-visible AriannA binding factory installed by @Component. */
        declare signal: <T>(initial?: T) => Components.Binding<T>;

        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {Modal.Interfaces.ModalOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: Interfaces.ModalOptions = {})
        {
            this.classList.add('Modal');
            if(this.childNodes.length === 0)
            {
                requestAnimationFrame(() => this.onConnected(_opts));
                return;
            }

            if(this.dataset.ariannaModalReady === 'true') return;
            this.dataset.ariannaModalReady = 'true';

            const authored =
                Array.from(this.childNodes);

            const footerNodes =
                authored.filter
                (
                    node =>
                        node instanceof HTMLElement &&
                        node.getAttribute('slot') === 'footer'
                );

            const headerNodes =
                authored.filter
                (
                    node =>
                        node instanceof HTMLElement &&
                        node.getAttribute('slot') === 'header'
                );

            const bodyNodes =
                authored.filter
                (
                    node =>
                        !footerNodes.includes(node as HTMLElement) &&
                        !headerNodes.includes(node as HTMLElement)
                );

            const backdrop = document.createElement('div');
            backdrop.className = 'ar-modal__backdrop';

            const dialog = document.createElement('div');
            dialog.className = 'ar-modal__dialog';
            dialog.setAttribute('role', 'dialog');
            dialog.setAttribute('aria-modal', 'true');

            const header = document.createElement('header');
            header.className = 'ar-modal__header';

            if(headerNodes.length)
            {
                for(const node of headerNodes)
                {
                    (node as HTMLElement).removeAttribute('slot');
                    header.appendChild(node);
                }
            }
            else
            {
                header.textContent = this.getAttribute('title') ?? '';
            }

            const body = document.createElement('section');
            body.className = 'ar-modal__body';
            for(const node of bodyNodes) body.appendChild(node);

            const footer = document.createElement('footer');
            footer.className = 'ar-modal__footer';
            for(const node of footerNodes)
            {
                (node as HTMLElement).removeAttribute('slot');
                footer.appendChild(node);
            }

            backdrop.addEventListener
            (
                'click',
                () =>
                {
                    if(this.getAttribute('dismissable') !== 'false') this.close();
                }
            );

            this.addEventListener
            (
                'click',
                event =>
                {
                    const target = event.target as HTMLElement | null;
                    if(target?.closest('[data-modal-close]')) this.close();
                }
            );

            dialog.append(header, body, footer);
            this.replaceChildren(backdrop, dialog);
        }

        /** @name        open
         *  @public
         *  @type        {this}
         *  @description Component member for open.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        open(): this
        {
            if(!this.querySelector('.ar-modal__dialog'))
            {
                this.dataset.ariannaModalReady='false';
                this.onConnected();
            }

            this.setAttribute('open', '');
            this.dispatchEvent(new CustomEvent('arianna:open', { bubbles: true, detail: { source: this } }));
            return this;
        }

        /** @name        close
         *  @public
         *  @type        {this}
         *  @description Component member for close.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        close(): this
        {
            this.removeAttribute('open');
            this.dispatchEvent(new CustomEvent('arianna:close', { bubbles: true, detail: { source: this } }));
            return this;
        }

        /** @name        isOpen
         *  @public
         *  @type        {boolean}
         *  @description Component member for is Open.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get isOpen(): boolean { return this.hasAttribute('open'); }

        /** @name        onCreated
         *  @public
         *  @type        {void}
         *  @description Component member for on Created.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onCreated()
        {
            requestAnimationFrame(() =>
            {
                if(this.isConnected) this.onConnected?.();
            });
        }

        /** @name        onBeforeMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeMount() { }

        /** @name        onMount
         *  @public
         *  @type        {void}
         *  @description Component member for on Mount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onMount() { }

        /** @name        onBeforeUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUpdate() { }

        /** @name        onUpdate
         *  @public
         *  @type        {void}
         *  @description Component member for on Update.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUpdate() { }

        /** @name        onBeforeUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Before Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onBeforeUnmount() { }

        /** @name        onUnmount
         *  @public
         *  @type        {void}
         *  @description Component member for on Unmount.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onUnmount() { }

        /** @name        title
         *  @public
         *  @type        {string}
         *  @description Component member for title.
         *  @returns     {string} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get title(): string { return this.getAttribute('title') ?? ''; }

        /** @name        title
         *  @public
         *  @type        {void}
         *  @description Component member for title.
         *  @param       {string} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set title(v: string) { v ? this.setAttribute('title', v) : this.removeAttribute('title'); }

        /** @name        size
         *  @public
         *  @type        {'sm' | 'md' | 'lg' | 'xl'}
         *  @description Component member for size.
         *  @returns     {'sm' | 'md' | 'lg' | 'xl'} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get size(): 'sm' | 'md' | 'lg' | 'xl' { return (this.getAttribute('size') ?? 'md') as never; }

        /** @name        size
         *  @public
         *  @type        {void}
         *  @description Component member for size.
         *  @param       {'sm' | 'md' | 'lg' | 'xl'} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set size(v: 'sm' | 'md' | 'lg' | 'xl') { this.setAttribute('size', v); }

        /** @name        dismissable
         *  @public
         *  @type        {boolean}
         *  @description Component member for dismissable.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get dismissable(): boolean { return this.getAttribute('dismissable') !== 'false'; }

        /** @name        dismissable
         *  @public
         *  @type        {void}
         *  @description Component member for dismissable.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set dismissable(v: boolean) { this.setAttribute('dismissable', v ? 'true' : 'false'); }

        /** @name        hasTitle
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for has Title.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private hasTitle: () => boolean = () => false;

        /** @name        titleText
         *  @private
         *  @type        {() => string}
         *  @description Component member for title Text.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private titleText: () => string = () => '';

        /** @name        onBackdrop
         *  @private
         *  @type        {() => void}
         *  @description Component member for on Backdrop.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onBackdrop: () => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Modal.Types.Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Modal.Types.Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Types.Stylesheet
        { return ModalDefaultSheet(); }
    }
}
export const ModalClass = Modal.Modal;
export default Modal.Modal;

export type ModalOptions = Modal.Interfaces.ModalOptions;
