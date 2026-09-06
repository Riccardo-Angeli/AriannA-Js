/**
 * @module      components/layout/Card
 * @description AriannA Card — light-DOM, class-driven, fluent component.
 * @author      Riccardo Angeli
 * @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 * @license     MIT / Commercial (dual license)
 */

/* Runtime symbols are published by AriannA Core before arianna-components is evaluated. */
declare const Component: any;
declare const Css: any;

export namespace Card
{
    export namespace Types
    {
        export type Elevation = 0 | 1 | 2 | 3;
    }

    export namespace Interfaces
    {
        export interface CardOptions
        {
            title?: string;
            elevation?: Types.Elevation;
            interactive?: boolean;
        }
    }

    export type CardOptions = Interfaces.CardOptions;

    export const CardStyleMap = Object.freeze
    (
        {
            Self   : 'Card',
            Header : 'Card-header',
            Body   : 'Card-body',
            Footer : 'Card-footer'
        }
    );

    export function CardDefaultSheet()
    {
        return new Css.Stylesheet
        (
            [
                new Css.Rule('arianna-card',
                {
                    Background    : 'var(--arianna-bg, #fff)',
                    Border        : '1px solid var(--arianna-border, #e2e2e6)',
                    BorderRadius  : '8px',
                    BoxSizing     : 'border-box',
                    Color         : 'var(--arianna-text, #1c1e21)',
                    Display       : 'block',
                    FontFamily    : 'var(--arianna-font, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif)',
                    MaxWidth      : '100%',
                    MinWidth      : '0',
                    Overflow      : 'hidden',
                    Width         : '100%'
                }),
                new Css.Rule('arianna-card[elevation="1"]', { BoxShadow: '0 1px 3px rgba(0,0,0,.08)' }),
                new Css.Rule('arianna-card[elevation="2"]', { BoxShadow: '0 3px 10px rgba(0,0,0,.10)' }),
                new Css.Rule('arianna-card[elevation="3"]', { BoxShadow: '0 8px 24px rgba(0,0,0,.14)' }),
                new Css.Rule('arianna-card[interactive]',
                {
                    Cursor     : 'pointer',
                    Transition : 'border-color .15s ease, box-shadow .15s ease, transform .15s ease'
                }),
                new Css.Rule('arianna-card[interactive]:hover',
                {
                    BorderColor : 'var(--arianna-primary, #e40c88)',
                    Transform   : 'translateY(-1px)'
                }),
                new Css.Rule('.Card-header',
                {
                    Background   : 'var(--arianna-surface-soft, #fafafb)',
                    BorderBottom : '1px solid var(--arianna-border, #e2e2e6)',
                    BoxSizing    : 'border-box',
                    FontSize     : '.82rem',
                    FontWeight   : '650',
                    Padding      : '10px 14px'
                }),
                new Css.Rule('.Card-body',
                {
                    BoxSizing  : 'border-box',
                    Color      : 'var(--arianna-muted, #666)',
                    FontSize   : '.80rem',
                    LineHeight : '1.55',
                    Padding    : '12px 14px'
                }),
                new Css.Rule('.Card-footer',
                {
                    BorderTop : '1px solid var(--arianna-border, #e2e2e6)',
                    BoxSizing : 'border-box',
                    Padding   : '10px 14px'
                })

                ,
                new Css.Rule('arianna-card:not([theme="light"]), .Card:not([theme="light"])',
                {
                    Background : '#17181c',
                    BorderColor: '#303238',
                    Color      : '#e6e8eb'
                }),
                new Css.Rule('arianna-card:not([theme="light"]) .Card-header, .Card:not([theme="light"]) .Card-header',
                {
                    Background        : '#1d1e23',
                    BorderBottomColor : '#303238',
                    BoxShadow         : 'inset 0 2px 0 #e40c88',
                    Color             : '#f1f2f4'
                }),
                new Css.Rule('arianna-card:not([theme="light"]) .Card-body, .Card:not([theme="light"]) .Card-body',
                {
                    Background : '#17181c',
                    Color      : '#a9afb8'
                }),
                new Css.Rule('arianna-card:not([theme="light"]) .Card-footer, .Card:not([theme="light"]) .Card-footer',
                {
                    Background     : '#1a1b1f',
                    BorderTopColor : '#303238'
                })

            ]
        );
    }

    @Component
    (
        'arianna-card',
        CardDefaultSheet(),
        {
            Attributes: ['title', 'elevation', 'interactive']
        }
    )
    export class Card extends HTMLDivElement
    {
        /** Embedded component icon used by WYSIWYG palettes and drag/drop panels. */
        static readonly Icon = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 9h18" stroke="currentColor" stroke-width="2"/></svg>`;
        /** Canonical named default styles. Use e.g. Component.Styles['Disabled']. */
        static readonly Styles = Object.freeze
        (
            {
                Default:
                new Css.Rule('arianna-card',
                {
                Background    : 'var(--arianna-bg, #fff)',
                Border        : '1px solid var(--arianna-border, #e2e2e6)',
                BorderRadius  : '8px',
                BoxSizing     : 'border-box',
                Color         : 'var(--arianna-text, #1c1e21)',
                Display       : 'block',
                FontFamily    : 'var(--arianna-font, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif)',
                MaxWidth      : '100%',
                MinWidth      : '0',
                Overflow      : 'hidden',
                Width         : '100%'
                }),
                Elevation1:
                new Css.Rule('arianna-card[elevation="1"]', { BoxShadow: '0 1px 3px rgba(0,0,0,.08)' }),
                Elevation2:
                new Css.Rule('arianna-card[elevation="2"]', { BoxShadow: '0 3px 10px rgba(0,0,0,.10)' }),
                Elevation3:
                new Css.Rule('arianna-card[elevation="3"]', { BoxShadow: '0 8px 24px rgba(0,0,0,.14)' }),
                Interactive:
                new Css.Rule('arianna-card[interactive]',
                {
                Cursor     : 'pointer',
                Transition : 'border-color .15s ease, box-shadow .15s ease, transform .15s ease'
                }),
                InteractiveHover:
                new Css.Rule('arianna-card[interactive]:hover',
                {
                BorderColor : 'var(--arianna-primary, #e40c88)',
                Transform   : 'translateY(-1px)'
                }),
                Header:
                new Css.Rule('.Card-header',
                {
                Background   : 'var(--arianna-surface-soft, #fafafb)',
                BorderBottom : '1px solid var(--arianna-border, #e2e2e6)',
                BoxSizing    : 'border-box',
                FontSize     : '.82rem',
                FontWeight   : '650',
                Padding      : '10px 14px'
                }),
                Body:
                new Css.Rule('.Card-body',
                {
                BoxSizing  : 'border-box',
                Color      : 'var(--arianna-muted, #666)',
                FontSize   : '.80rem',
                LineHeight : '1.55',
                Padding    : '12px 14px'
                }),
                Footer:
                new Css.Rule('.Card-footer',
                {
                BorderTop : '1px solid var(--arianna-border, #e2e2e6)',
                BoxSizing : 'border-box',
                Padding   : '10px 14px'
                }),
            }
        );


        /** Embedded component icon. */
        get Icon(): string { return Card.Icon; }

        static StyleMap = CardStyleMap;
        static DefaultSheet = CardDefaultSheet;

        private _generatedHeader?: HTMLElement;
        private _clickInstalled = false;

        constructor(opts: Interfaces.CardOptions = {})
        {
            super();
            this.classList.add(CardStyleMap.Self);
            this.applyOptions(opts);
            this.installInteraction();
            this.syncTitle();
        }

        onConnected(): void
        {
            this.classList.add(CardStyleMap.Self);
            this.installInteraction();
            this.syncTitle();
        }

        get title(): string
        {
            return this.getAttribute('title') ?? '';
        }
        set title(value: string)
        {
            value ? this.setAttribute('title', value) : this.removeAttribute('title');
            this.syncTitle();
        }

        get elevation(): Types.Elevation
        {
            const value = Number(this.getAttribute('elevation') ?? 0);
            return (value >= 0 && value <= 3 ? value : 0) as Types.Elevation;
        }
        set elevation(value: Types.Elevation)
        {
            this.setAttribute('elevation', String(value));
        }

        get interactive(): boolean
        {
            return this.hasAttribute('interactive');
        }
        set interactive(value: boolean)
        {
            value ? this.setAttribute('interactive', '') : this.removeAttribute('interactive');
        }

        private applyOptions(opts: Interfaces.CardOptions): void
        {
            if(opts.title !== undefined) this.title = opts.title;
            if(opts.elevation !== undefined) this.elevation = opts.elevation;
            if(opts.interactive !== undefined) this.interactive = opts.interactive;
        }

        private installInteraction(): void
        {
            if(this._clickInstalled) return;
            this._clickInstalled = true;
            this.addEventListener('click', event =>
            {
                if(!this.interactive) return;
                this.dispatchEvent
                (
                    new CustomEvent
                    (
                        'arianna:click',
                        {
                            bubbles: true,
                            composed: true,
                            detail: { source: this, originalEvent: event }
                        }
                    )
                );
            });
        }

        /**
         * HTML-first Card support. The title attribute becomes a generated light-DOM
         * header while authored children remain ordinary portable HTML.
         */
        private syncTitle(): void
        {
            const title = this.title.trim();

            if(!title)
            {
                this._generatedHeader?.remove();
                this._generatedHeader = undefined;
                return;
            }

            let header = this._generatedHeader;
            if(!header || header.parentElement !== this)
            {
                header = document.createElement('header');
                header.className = CardStyleMap.Header;
                header.dataset.cardGenerated = 'title';
                this.prepend(header);
                this._generatedHeader = header;
            }
            header.textContent = title;

            for(const child of Array.from(this.children))
            {
                if(child === header) continue;
                if(!child.classList.contains(CardStyleMap.Footer) && !child.classList.contains(CardStyleMap.Body))
                    child.classList.add(CardStyleMap.Body);
            }
        }
    }
}

export type CardOptions = Card.Interfaces.CardOptions;
export type CardElevation = Card.Types.Elevation;
export const CardDefaultSheet = Card.CardDefaultSheet;
export const CardStyleMap = Card.CardStyleMap;
export const CardClass = Card.Card;
export default Card.Card;
