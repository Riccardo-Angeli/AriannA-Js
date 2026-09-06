/**
 * @module components/layout/Accordion
 * @version 2.0.0
 */
import { Component, Css, Templates } from '../../core/index.ts';

const html = Templates.Template.Html;

export namespace Accordion
{
    export namespace Types
    {
        export type Theme = 'dark' | 'light';
        export type Icon = 'chevron' | 'plus' | 'arrow' | 'none';
    }

    export namespace Interfaces
    {
        export interface AccordionItem
        {
            id?: string;
            title: string;
            content?: string;
            open?: boolean;
            disabled?: boolean;
            children?: AccordionItem[];
            data?: unknown;
        }

        export interface AccordionOptions
        {
            items?: AccordionItem[];
            multiple?: boolean;
            animated?: boolean;
            icon?: Types.Icon;
            theme?: Types.Theme;
        }
    }

    export const Styles = new Css.Stylesheet([
        new Css.Rule('arianna-accordion', {
            BoxSizing: 'border-box', Color: '#e7e9ed', Display: 'flex',
            FlexDirection: 'column', FontFamily: 'var(--arianna-font, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif)',
            Gap: '7px', MaxWidth: '100%', MinWidth: '0', Width: '100%'
        }),
        new Css.Rule('.Accordion-Panel', {
            Background: '#17181c', Border: '1px solid #303238', BorderRadius: '8px',
            BoxSizing: 'border-box', Overflow: 'hidden', Width: '100%'
        }),
        new Css.Rule('.Accordion-Header', {
            AlignItems: 'center',
            Appearance: 'none',
            Background: 'linear-gradient(180deg,#36373b 0%,#292a2e 100%)',
            Border: '0',
            BoxSizing: 'border-box',
            Color: '#f1f2f4',
            Cursor: 'pointer',
            Display: 'flex',
            Font: 'inherit',
            FontSize: '.86rem',
            FontWeight: '650',
            JustifyContent: 'space-between',
            MinHeight: '42px',
            Outline: 'none',
            Padding: '10px 14px',
            TextAlign: 'left',
            Width: '100%'
        }),
        new Css.Rule('.Accordion-Header:hover', {
            Background: 'linear-gradient(180deg,#3b3c41 0%,#2e2f34 100%)'
        }),
        new Css.Rule('.Accordion-Header[aria-expanded="true"]', {
            Background: 'linear-gradient(180deg,#37383d 0%,#2a2b30 100%)',
            BoxShadow: 'inset 2px 0 0 #e40c88'
        }),
        new Css.Rule('.Accordion-Header:focus-visible', { BoxShadow: 'inset 0 0 0 2px #e40c88' }),
        new Css.Rule('.Accordion-Title', { Flex: '1 1 auto', MinWidth: '0' }),
        new Css.Rule('.Accordion-Icon', {
            Color: '#e40c88',
            Flex: '0 0 auto',
            MarginLeft: '12px',
        }),
        new Css.Rule('.Accordion-Icon[data-icon="chevron"]', {
            BorderBottom: '1.5px solid currentColor',
            BorderRight: '1.5px solid currentColor',
            BoxSizing: 'border-box',
            Height: '7px',
            Transform: 'rotate(-45deg)',
            Transition: 'transform .16s ease',
            Width: '7px'
        }),
        new Css.Rule('.Accordion-Header[aria-expanded="true"] .Accordion-Icon[data-icon="chevron"]', {
            Transform: 'rotate(45deg)'
        }),
        new Css.Rule('.Accordion-Body', {
            Background: '#141519',
            BorderTop: '1px solid transparent',
            BoxSizing: 'border-box',
            Color: '#a9afb8',
            FontSize: '.82rem',
            LineHeight: '1.55',
            MaxHeight: '0',
            Opacity: '0',
            Overflow: 'hidden',
            Padding: '0 14px',
            Transition: 'max-height .20s ease, opacity .16s ease, padding .20s ease, border-color .20s ease'
        }),
        new Css.Rule('.Accordion-Body[data-open="true"]', {
            BorderTopColor: '#282a30',
            MaxHeight: '720px',
            Opacity: '1',
            Padding: '12px 14px 14px'
        }),
        new Css.Rule('.Accordion-Header:disabled', { Cursor: 'not-allowed', Opacity: '.45' }),
        new Css.Rule('.Accordion-Nested', {
            BorderLeft: '1px solid #363840', Display: 'flex', FlexDirection: 'column',
            Gap: '6px', Margin: '10px 0 0 8px', PaddingLeft: '10px'
        }),

        new Css.Rule('.Accordion[theme="light"]', { Color: '#1c1e21' }),
        new Css.Rule('.Accordion[theme="light"] .Accordion-Panel', {
            Background: '#fff', BorderColor: '#e2e2e6'
        }),
        new Css.Rule('.Accordion[theme="light"] .Accordion-Header', {
            Background: 'linear-gradient(180deg,#ffffff 0%,#f2f2f5 100%)',
            Color: '#1c1e21'
        }),
        new Css.Rule('.Accordion[theme="light"] .Accordion-Header:hover', {
            Background: 'linear-gradient(180deg,#ffffff 0%,#ececf0 100%)'
        }),
        new Css.Rule('.Accordion[theme="light"] .Accordion-Header[aria-expanded="true"]', {
            Background: 'linear-gradient(180deg,#fbfbfc 0%,#ededf1 100%)'
        }),
        new Css.Rule('.Accordion[theme="light"] .Accordion-Body', {
            Background: '#fafafb', BorderTopColor: '#ededf0', Color: '#626873'
        })
    ]);

    @Component('arianna-accordion', Styles, {
        Shadow: false,
        Attributes: ['multiple', 'animated', 'icon', 'theme', 'items'],
        Properties: ['items']
    })
    export class Accordion extends HTMLDivElement
    {
        public static readonly Styles = Styles;
        public template = html``;

        private _items: Interfaces.AccordionItem[] = [];

        constructor(options: Interfaces.AccordionOptions = {})
        {
            super();
            if(options.multiple != null) this.toggleAttribute('multiple', options.multiple);
            if(options.animated != null) this.setAttribute('animated', String(options.animated));
            if(options.icon) this.setAttribute('icon', options.icon);
            if(options.theme) this.setAttribute('theme', options.theme);
            if(options.items) this._items = options.items;
        }

        public get items(): Interfaces.AccordionItem[] { return this._items; }
        public set items(value: Interfaces.AccordionItem[])
        {
            this._items = Array.isArray(value) ? value : [];
            if(this.isConnected) this.Render();
        }

        public onConnected(): void
        {
            this.classList.add('Accordion');
            if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
            this.Render();
        }

        public onCreated(): void
        {
            requestAnimationFrame(() => { if(this.isConnected) this.onConnected(); });
        }

        private Render(): void
        {
            if(!Array.isArray(this._items) || this._items.length === 0) return;
            this.replaceChildren(...this._items.map((item, index) => this.Panel(item, `item-${index + 1}`)));
        }

        private Panel(item: Interfaces.AccordionItem, fallbackId: string): HTMLElement
        {
            const panel = document.createElement('section');
            panel.className = 'Accordion-Panel';
            panel.dataset.id = item.id || fallbackId;

            const header = document.createElement('button');
            header.type = 'button';
            header.className = 'Accordion-Header';
            header.disabled = Boolean(item.disabled);
            header.setAttribute('aria-expanded', String(Boolean(item.open)));

            const title = document.createElement('span');
            title.className = 'Accordion-Title';
            title.textContent = item.title;

            const icon = document.createElement('span');
            icon.className = 'Accordion-Icon';
            const kind = this.getAttribute('icon') || 'chevron';
            icon.dataset.icon = kind;
            icon.textContent = kind === 'none' || kind === 'chevron' ? '' : kind === 'plus' ? '+' : '→';

            const body = document.createElement('div');
            body.className = 'Accordion-Body';
            body.dataset.open = String(Boolean(item.open));
            body.innerHTML = item.content ?? '';

            if(item.children?.length)
            {
                const nested = document.createElement('div');
                nested.className = 'Accordion-Nested';
                item.children.forEach((child, index) => nested.append(this.Panel(child, `${panel.dataset.id}-${index + 1}`)));
                body.append(nested);
            }

            header.append(title, icon);
            panel.append(header, body);

            header.addEventListener('click', () =>
            {
                if(header.disabled) return;
                const open = header.getAttribute('aria-expanded') === 'true';

                if(!this.hasAttribute('multiple') && !open)
                {
                    /*
                     * Exclusive only among siblings at the SAME nesting level.
                     * Opening a child panel must never close its parent.
                     */
                    const container = panel.parentElement;

                    if(container)
                    {
                        for(const other of Array.from(container.children))
                        {
                            if(
                                other === panel ||
                                !(other instanceof HTMLElement) ||
                                !other.classList.contains('Accordion-Panel')
                            )
                                continue;

                            other
                                .querySelector(':scope > .Accordion-Header')
                                ?.setAttribute('aria-expanded', 'false');

                            const otherBody =
                                other.querySelector<HTMLElement>(
                                    ':scope > .Accordion-Body'
                                );

                            if(otherBody)
                                otherBody.dataset.open = 'false';
                        }
                    }
                }

                header.setAttribute('aria-expanded', String(!open));
                body.dataset.open = String(!open);

                this.dispatchEvent(new CustomEvent('arianna:change', {
                    bubbles: true, composed: true,
                    detail: { id: panel.dataset.id, item, open: !open }
                }));
            });

            return panel;
        }
    }
}

export type AccordionItem = Accordion.Interfaces.AccordionItem;
export type AccordionOptions = Accordion.Interfaces.AccordionOptions;
export default Accordion.Accordion;
