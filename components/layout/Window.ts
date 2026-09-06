/**
 * @module    components/layout/Window
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description Native AriannA desktop-style Window.
 */

import { Component, Css } from '../../core/index.ts';
import '../modifiers/2D/Mover.ts';
import '../modifiers/2D/Resizer.ts';

export namespace WindowComponent
{
    export namespace Types
    {
        export type WindowStyle = 'windows' | 'macos' | 'linux';

        export interface Geometry
        {
            x: number;
            y: number;
            width: number;
            height: number;
            zIndex: string;
        }
    }

    export namespace Interfaces
    {
        export interface WindowMenuItem
        {
            id: string;
            label: string;

            items?: Array<{
                id: string;
                label: string;
                shortcut?: string;
                disabled?: boolean;
            }>;
        }

        export interface WindowOptions
        {
            /** Backward-compatible public style selector. */
            style?: Types.WindowStyle;

            /** Current declarative variant selector. */
            variant?: Types.WindowStyle;
            title?: string;
            x?: number;
            y?: number;
            width?: number;
            height?: number;
            minWidth?: number;
            minHeight?: number;
            resizable?: boolean;
            chrome?: boolean;
        }
    }

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.WindowComponent', {
            Background: '#18191c',
            Border: '1px solid rgba(255,255,255,.13)',
            BorderRadius: '10px',
            BoxShadow: '0 26px 68px rgba(0,0,0,.58), 0 8px 22px rgba(0,0,0,.38)',
            BoxSizing: 'border-box',
            Color: '#f2f3f5',
            Display: 'flex',
            FlexDirection: 'column',
            FontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Ubuntu,system-ui,sans-serif',
            Height: '205px',
            MinHeight: '120px',
            MinWidth: '200px',
            Overflow: 'hidden',
            Position: 'absolute',
            Top: '12px',
            Width: 'calc((100% - 48px) / 3)',
            ZIndex: '100',
        }),

        /* Three canonical initial Stage positions — no Playground JavaScript. */
        new Css.Rule('.WindowComponent.Windows', {
            Left: '12px',
        }),

        new Css.Rule('.WindowComponent.Mac', {
            Left: 'calc(24px + ((100% - 48px) / 3))',
        }),

        new Css.Rule('.WindowComponent.Linux', {
            Left: 'auto',
            Right: '12px',
        }),

        new Css.Rule('.WindowComponent[focused]', {
            BoxShadow: '0 32px 82px rgba(0,0,0,.70), 0 12px 30px rgba(0,0,0,.46)',
        }),

        /*
         * Compatibility with the legacy Resizer currently used by the bundle.
         * Its handles receive the pink background inline, so opacity is the
         * correct non-destructive override: invisible, but pointer-active.
         */
        new Css.Rule('.WindowComponent > .ar-resizer-handle', {
            Opacity: '0',
            PointerEvents: 'auto',
        }),

        /*
         * Full Window: fills the Stage and is guaranteed to be topmost.
         * Inline geometry written by maximize() mirrors this rule so the state
         * remains correct even if another skin overrides normal Window geometry.
         */
        new Css.Rule('.WindowComponent[maximized]', {
            Border: '0',
            BorderRadius: '0',
            Bottom: '0',
            Height: '100%',
            Left: '0',
            Right: '0',
            Top: '0',
            Width: '100%',
            ZIndex: '2147483647',
        }),

        /*
         * Minimize remains INSIDE the Stage as a compact desktop task item.
         * The body/menu disappear; the title bar stays usable and clicking the
         * maximize control restores it.
         */
        new Css.Rule('.WindowComponent[minimized]', {
            Bottom: '10px',
            Height: '36px',
            Left: '10px',
            MinHeight: '36px',
            Right: 'auto',
            Top: 'auto',
            Width: '170px',
            ZIndex: '2147483646',
        }),

        new Css.Rule('.WindowComponent[minimized] .WindowComponent-Body, .WindowComponent[minimized] .WindowComponent-Menu', {
            Display: 'none',
        }),

        new Css.Rule('.WindowComponent[minimized] .WindowComponent-Titlebar', {
            BorderBottom: '0',
            Height: '36px',
            MinHeight: '36px',
        }),

        new Css.Rule('.WindowComponent-Titlebar', {
            AlignItems: 'center',
            Cursor: 'move',
            Display: 'flex',
            Flex: '0 0 auto',
            Height: '38px',
            MinHeight: '38px',
            Padding: '0 10px',
            Position: 'relative',
            UserSelect: 'none',
        }),

        new Css.Rule('.WindowComponent-Title', {
            Flex: '1 1 auto',
            FontSize: '12px',
            FontWeight: '600',
            MinWidth: '0',
            Overflow: 'hidden',
            PointerEvents: 'none',
            TextOverflow: 'ellipsis',
            WhiteSpace: 'nowrap',
        }),

        new Css.Rule('.WindowComponent-Traffic', {
            AlignItems: 'center',
            Display: 'none',
            Flex: '0 0 auto',
            Gap: '8px',
            MarginRight: 'auto',
        }),

        new Css.Rule('.WindowComponent-Btn', {
            Appearance: 'none',
            Border: '0',
            BorderRadius: '50%',
            BoxSizing: 'border-box',
            Cursor: 'pointer',
            Height: '12px',
            MinHeight: '12px',
            MinWidth: '12px',
            Padding: '0',
            Width: '12px',
        }),

        new Css.Rule('.WindowComponent-Chrome', {
            AlignItems: 'stretch',
            AlignSelf: 'stretch',
            Display: 'none',
            Flex: '0 0 auto',
            MarginLeft: 'auto',
        }),

        new Css.Rule('.WindowComponent-Chrome-Btn', {
            AlignItems: 'center',
            Appearance: 'none',
            Background: 'transparent',
            Border: '0',
            Color: 'inherit',
            Cursor: 'pointer',
            Display: 'inline-flex',
            Font: 'inherit',
            Height: '100%',
            JustifyContent: 'center',
            Margin: '0',
            Padding: '0',
        }),

        new Css.Rule('.WindowComponent-Menu', {
            Background: '#202124',
            BorderBottom: '1px solid rgba(255,255,255,.07)',
            Color: '#d8dade',
            Flex: '0 0 auto',
        }),

        new Css.Rule('.WindowComponent-Menu:empty', {
            Display: 'none',
        }),

        new Css.Rule('.WindowComponent-Body', {
            Background: '#18191c',
            Color: '#e8eaed',
            Flex: '1 1 auto',
            MinHeight: '0',
            Overflow: 'auto',
            Padding: '12px',
            Position: 'relative',
        }),

        /* macOS */
        new Css.Rule('.WindowComponent.Mac', {
            Background: '#1e1f22',
            BorderColor: 'rgba(255,255,255,.14)',
            BorderRadius: '11px',
        }),

        new Css.Rule('.WindowComponent.Mac .WindowComponent-Titlebar', {
            Background: 'linear-gradient(180deg,#36373b 0%,#292a2e 100%)',
            BorderBottom: '1px solid #18191c',
            JustifyContent: 'center',
        }),

        new Css.Rule('.WindowComponent.Mac .WindowComponent-Traffic', {
            Display: 'flex',
        }),

        new Css.Rule('.WindowComponent.Mac .WindowComponent-Title', {
            FontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif',
            Left: '70px',
            Position: 'absolute',
            Right: '70px',
            TextAlign: 'center',
        }),

        new Css.Rule('.WindowComponent.Mac .WindowComponent-Btn-Close', {
            Background: '#ff5f57',
            Border: '1px solid #e0443e',
        }),

        new Css.Rule('.WindowComponent.Mac .WindowComponent-Btn-Minimize', {
            Background: '#febc2e',
            Border: '1px solid #d89e24',
        }),

        new Css.Rule('.WindowComponent.Mac .WindowComponent-Btn-Maximize', {
            Background: '#28c840',
            Border: '1px solid #1fa934',
        }),

        new Css.Rule('.WindowComponent.Mac .WindowComponent-Btn:hover', {
            Filter: 'brightness(1.14)',
        }),

        new Css.Rule('.WindowComponent.Mac .WindowComponent-Body', {
            Background: '#1e1f22',
            Color: '#ededf0',
        }),

        /* Windows 11 */
        new Css.Rule('.WindowComponent.Windows', {
            Background: '#202020',
            BorderColor: '#3b3b3b',
            BorderRadius: '8px',
        }),

        new Css.Rule('.WindowComponent.Windows .WindowComponent-Titlebar', {
            Background: 'linear-gradient(180deg,#272727,#202020)',
            BorderBottom: '1px solid #303030',
            Height: '40px',
            MinHeight: '40px',
            Padding: '0 0 0 12px',
        }),

        new Css.Rule('.WindowComponent.Windows .WindowComponent-Title', {
            FontFamily: '"Segoe UI Variable","Segoe UI",sans-serif',
            FontWeight: '400',
        }),

        new Css.Rule('.WindowComponent.Windows .WindowComponent-Chrome', {
            Display: 'flex',
        }),

        new Css.Rule('.WindowComponent.Windows .WindowComponent-Chrome-Btn', {
            FontFamily: '"Segoe UI Symbol","Segoe UI",sans-serif',
            FontSize: '13px',
            LineHeight: '1',
            Width: '46px',
        }),

        new Css.Rule('.WindowComponent.Windows .WindowComponent-Chrome-Btn:hover', {
            Background: '#353535',
        }),

        new Css.Rule('.WindowComponent.Windows .WindowComponent-Chrome-Btn-Close:hover', {
            Background: '#c42b1c',
            Color: '#ffffff',
        }),

        new Css.Rule('.WindowComponent.Windows .WindowComponent-Body', {
            Background: '#202020',
            Color: '#f3f3f3',
        }),

        /* Ubuntu / GNOME */
        new Css.Rule('.WindowComponent.Linux', {
            Background: '#1f1f1f',
            BorderColor: '#414141',
            BorderRadius: '9px',
        }),

        new Css.Rule('.WindowComponent.Linux .WindowComponent-Titlebar', {
            Background: 'linear-gradient(180deg,#35302f,#292424)',
            BorderBottom: '1px solid #4a403d',
            Height: '40px',
            MinHeight: '40px',
            Padding: '0 8px 0 12px',
        }),

        new Css.Rule('.WindowComponent.Linux .WindowComponent-Title', {
            FontFamily: 'Ubuntu,Cantarell,"Noto Sans",sans-serif',
            FontSize: '13px',
        }),

        new Css.Rule('.WindowComponent.Linux .WindowComponent-Chrome', {
            AlignItems: 'center',
            Display: 'flex',
            Gap: '6px',
        }),

        new Css.Rule('.WindowComponent.Linux .WindowComponent-Chrome-Btn', {
            Background: '#403a38',
            Border: '1px solid #55504d',
            BorderRadius: '50%',
            FontFamily: 'Ubuntu,Cantarell,sans-serif',
            FontSize: '10px',
            Height: '24px',
            Width: '24px',
        }),

        new Css.Rule('.WindowComponent.Linux .WindowComponent-Chrome-Btn:hover', {
            Background: '#514947',
        }),

        new Css.Rule('.WindowComponent.Linux .WindowComponent-Chrome-Btn-Close', {
            Background: '#e95420',
            BorderColor: '#f06a3b',
            Color: '#ffffff',
        }),

        new Css.Rule('.WindowComponent.Linux .WindowComponent-Chrome-Btn-Close:hover', {
            Background: '#f15d2a',
        }),

        new Css.Rule('.WindowComponent.Linux .WindowComponent-Body', {
            Background: '#1f1f1f',
            Color: '#f6f5f4',
        }),
    ]);

    let ZIndex = 100;

    @Component('arianna-window', Styles, {
        Shadow: false,
        Attributes: [
            'variant',
            'title',
            'x',
            'y',
            'width',
            'height',
            'min-width',
            'min-height',
            'resizable',
            'chrome',
            'focused',
            'maximized',
            'minimized',
        ],
    })
    export class WindowComponent extends HTMLElement
    {
        public static readonly Styles = Styles;

        public Mover     : HTMLElement | null = null;
        public Resizer   : HTMLElement | null = null;
        public Rotator   : HTMLElement | null = null;
        public Reflector : HTMLElement | null = null;
        public Rounder   : HTMLElement | null = null;
        public Skewer    : HTMLElement | null = null;

        private Geometry: Types.Geometry | null = null;
        private Built = false;

        onConnected(): void
        {
            this.ensureStage();
            this.normalizeVariant();
            this.classList.add('WindowComponent');

            if(!this.Built)
            {
                this.build();
                this.Built = true;
            }

            this.applyExplicitGeometry();
            this.installModifiers();

            this.addEventListener(
                'pointerdown',
                this.onFocus,
                true
            );

            this.addEventListener(
                'arianna:move-start',
                this.onMoveStart
            );
        }

        onDisconnected(): void
        {
            this.removeEventListener(
                'pointerdown',
                this.onFocus,
                true
            );

            this.removeEventListener(
                'arianna:move-start',
                this.onMoveStart
            );

            this.Mover?.remove();
            this.Resizer?.remove();

            this.Mover = null;
            this.Resizer = null;
        }

        onAttributeChanged(name:string): void
        {
            if(!this.isConnected)
                return;

            if(name === 'variant')
                this.normalizeVariant();

            if(
                name === 'x' ||
                name === 'y' ||
                name === 'width' ||
                name === 'height'
            )
                this.applyExplicitGeometry();

            if(name === 'resizable')
                this.installModifiers();
        }

        /**
         * The Window's direct parent is its Stage.
         * Make it the containing block and clipping boundary for every Window,
         * Mover and Resizer operation.
         */
        private ensureStage(): HTMLElement | null
        {
            const stage =
                this.parentElement;

            if(!stage)
                return null;

            const computed =
                getComputedStyle(stage);

            if(computed.position === 'static')
                stage.style.position = 'relative';

            stage.style.overflow = 'hidden';

            return stage;
        }

        private normalizeVariant(): void
        {
            const explicit =
                this.getAttribute('variant')?.toLowerCase();

            let variant: Types.WindowStyle;

            if(
                explicit === 'windows' ||
                explicit === 'macos' ||
                explicit === 'linux'
            )
                variant = explicit;
            else if(this.classList.contains('Windows'))
                variant = 'windows';
            else if(this.classList.contains('Linux'))
                variant = 'linux';
            else
                variant = 'macos';

            this.classList.toggle(
                'Windows',
                variant === 'windows'
            );

            this.classList.toggle(
                'Mac',
                variant === 'macos'
            );

            this.classList.toggle(
                'Linux',
                variant === 'linux'
            );

            if(this.getAttribute('variant') !== variant)
                this.setAttribute('variant', variant);
        }

        private build(): void
        {
            /*
             * Capture application content BEFORE replacing children.
             * Markup stays simple:
             *
             * <arianna-window class="WindowComponent Windows" title="...">
             *     <div slot="body">...</div>
             * </arianna-window>
             */
            const children =
                Array.from(this.childNodes);

            const bodyNodes =
                children.filter(
                    node =>
                        !(node instanceof HTMLElement) ||
                        node.getAttribute('slot') !== 'menu'
                );

            const menuNodes =
                children.filter(
                    node =>
                        node instanceof HTMLElement &&
                        node.getAttribute('slot') === 'menu'
                );

            this.replaceChildren();

            const titlebar =
                document.createElement('div');

            titlebar.className =
                'WindowComponent-Titlebar';

            const traffic =
                document.createElement('div');

            traffic.className =
                'WindowComponent-Traffic';

            const macClose =
                this.button(
                    'WindowComponent-Btn WindowComponent-Btn-Close',
                    '',
                    'Close',
                    () => this.close()
                );

            const macMinimize =
                this.button(
                    'WindowComponent-Btn WindowComponent-Btn-Minimize',
                    '',
                    'Minimize',
                    () => this.minimize()
                );

            const macMaximize =
                this.button(
                    'WindowComponent-Btn WindowComponent-Btn-Maximize',
                    '',
                    'Maximize',
                    () => this.toggleMaximize()
                );

            traffic.append(
                macClose,
                macMinimize,
                macMaximize
            );

            const title =
                document.createElement('span');

            title.className =
                'WindowComponent-Title';

            title.textContent =
                this.getAttribute('title') ?? '';

            const chrome =
                document.createElement('div');

            chrome.className =
                'WindowComponent-Chrome';

            chrome.append(
                this.button(
                    'WindowComponent-Chrome-Btn WindowComponent-Chrome-Btn-Minimize',
                    '─',
                    'Minimize',
                    () => this.minimize()
                ),

                this.button(
                    'WindowComponent-Chrome-Btn WindowComponent-Chrome-Btn-Maximize',
                    '□',
                    'Maximize',
                    () => this.toggleMaximize()
                ),

                this.button(
                    'WindowComponent-Chrome-Btn WindowComponent-Chrome-Btn-Close',
                    '×',
                    'Close',
                    () => this.close()
                )
            );

            titlebar.append(
                traffic,
                title,
                chrome
            );

            const menu =
                document.createElement('div');

            menu.className =
                'WindowComponent-Menu';

            for(const node of menuNodes)
            {
                if(node instanceof HTMLElement)
                    node.removeAttribute('slot');

                menu.appendChild(node);
            }

            const body =
                document.createElement('div');

            body.className =
                'WindowComponent-Body';

            for(const node of bodyNodes)
            {
                if(node instanceof HTMLElement)
                    node.removeAttribute('slot');

                body.appendChild(node);
            }

            this.append(
                titlebar,
                menu,
                body
            );
        }

        private button(
            className: string,
            text: string,
            label: string,
            action: () => void
        ): HTMLButtonElement
        {
            const button =
                document.createElement('button');

            button.type =
                'button';

            button.className =
                className;

            button.textContent =
                text;

            button.setAttribute(
                'aria-label',
                label
            );

            /*
             * The titlebar is the Mover handle. Buttons live inside it, so their
             * pointer-down must not bubble to Mover or the browser suppresses
             * the subsequent click while beginning a drag.
             */
            button.addEventListener(
                'pointerdown',
                event =>
                {
                    event.stopPropagation();
                }
            );

            button.addEventListener(
                'click',
                event =>
                {
                    event.stopPropagation();
                    action();
                }
            );

            return button;
        }

        /**
         * Use the real Modifier2D components directly.
         *
         * Because Window is Shadow:false, arianna-mover can resolve the titlebar
         * through handle-selector and both modifiers naturally target their
         * parentElement (this Window).
         */
        /**
         * Dynamic modifiers normally mount through AriannA's lifecycle.
         * If the observer has not mounted one by the next frame, invoke its
         * public lifecycle hook once so it binds to this Window.
         */
        private activateModifier(modifier: HTMLElement): void
        {
            requestAnimationFrame(
                () =>
                {
                    const instance =
                        modifier as HTMLElement & {
                            target?: HTMLElement | null;
                            onMount?: () => void;
                        };

                    if(
                        instance.target !== this &&
                        typeof instance.onMount === 'function'
                    )
                        instance.onMount();
                }
            );
        }

        private installModifiers(): void
        {
            if(!this.Mover)
            {
                const mover =
                    document.createElement('arianna-mover');

                mover.setAttribute(
                    'handle-selector',
                    '.WindowComponent-Titlebar'
                );

                mover.setAttribute(
                    'axis',
                    'both'
                );

                mover.setAttribute(
                    'bounds',
                    'parent'
                );

                this.appendChild(mover);
                this.Mover = mover;
                this.activateModifier(mover);
            }

            const resizable =
                this.getAttribute('resizable') !== 'false';

            if(resizable && !this.Resizer)
            {
                const resizer =
                    document.createElement('arianna-resizer');

                /*
                 * Compatibility with both Resizer generations:
                 * - legacy Resizer accepts n/ne/e/se/s/sw/w/nw
                 * - current Resizer normalizes these aliases to the complete
                 *   North/NorthEast/... direction names internally.
                 */
                resizer.setAttribute(
                    'handles',
                    'n,ne,e,se,s,sw,w,nw'
                );

                resizer.setAttribute(
                    'min-width',
                    this.getAttribute('min-width') ?? '200'
                );

                resizer.setAttribute(
                    'min-height',
                    this.getAttribute('min-height') ?? '120'
                );

                resizer.setAttribute(
                    'allow-cross',
                    'false'
                );

                this.appendChild(resizer);
                this.Resizer = resizer;
                this.activateModifier(resizer);
            }

            if(!resizable && this.Resizer)
            {
                this.Resizer.remove();
                this.Resizer = null;
            }
        }

        private applyExplicitGeometry(): void
        {
            if(this.hasAttribute('maximized'))
                return;

            const x =
                this.numberAttribute('x');

            const y =
                this.numberAttribute('y');

            const width =
                this.numberAttribute('width');

            const height =
                this.numberAttribute('height');

            if(x !== null)
            {
                this.style.left = `${x}px`;
                this.style.right = 'auto';
            }

            if(y !== null)
            {
                this.style.top = `${y}px`;
                this.style.bottom = 'auto';
            }

            if(width !== null)
                this.style.width = `${width}px`;

            if(height !== null)
                this.style.height = `${height}px`;
        }

        private numberAttribute(name:string): number | null
        {
            const source =
                this.getAttribute(name);

            if(source === null || source.trim() === '')
                return null;

            const value =
                Number(source);

            return Number.isFinite(value)
                ? value
                : null;
        }

        private saveGeometry(): void
        {
            this.Geometry =
            {
                x: this.offsetLeft,
                y: this.offsetTop,
                width: this.offsetWidth,
                height: this.offsetHeight,
                zIndex: this.style.zIndex,
            };
        }

        private restoreGeometry(): void
        {
            if(!this.Geometry)
                return;

            this.style.left =
                `${this.Geometry.x}px`;

            this.style.top =
                `${this.Geometry.y}px`;

            this.style.right =
                'auto';

            this.style.bottom =
                'auto';

            this.style.width =
                `${this.Geometry.width}px`;

            this.style.height =
                `${this.Geometry.height}px`;

            this.style.zIndex =
                this.Geometry.zIndex;

            this.Geometry =
                null;
        }

        /**
         * TOPMOST strictly inside this Window's direct parent.
         * Parser-safe prototype methods: no class-field initializer required.
         */
        private onFocus(): void
        {
            if(this.hasAttribute('maximized'))
                return;

            const parent =
                this.parentElement;

            if(!parent)
                return;

            for(const sibling of Array.from(parent.children))
            {
                if(
                    !(sibling instanceof HTMLElement) ||
                    !sibling.classList.contains('WindowComponent')
                )
                    continue;

                sibling.removeAttribute('focused');

                if(
                    sibling !== this &&
                    !sibling.hasAttribute('maximized')
                )
                {
                    sibling.style.setProperty(
                        'z-index',
                        '100'
                    );
                }
            }

            this.style.setProperty(
                'z-index',
                '101'
            );

            this.setAttribute(
                'focused',
                ''
            );

            ZIndex =
                101;
        }

        private onMoveStart(): void
        {
            this.onFocus();
        }

        focusWindow(): this
        {
            this.onFocus();
            return this;
        }

        minimize(): this
        {
            if(this.hasAttribute('minimized'))
                return this;

            if(this.hasAttribute('maximized'))
                this.restore();

            this.saveGeometry();

            this.setAttribute(
                'minimized',
                ''
            );

            /*
             * Explicit values mirror Styles and guarantee Stage-local geometry
             * even when a custom skin changes the default classes.
             */
            this.style.left = '10px';
            this.style.right = 'auto';
            this.style.top = 'auto';
            this.style.bottom = '10px';
            this.style.width = '170px';
            this.style.height = '36px';
            this.style.zIndex = '2147483646';

            this.dispatchEvent(
                new CustomEvent(
                    'arianna:minimize',
                    {
                        bubbles: true,
                        detail: { target:this },
                    }
                )
            );

            return this;
        }

        maximize(): this
        {
            if(this.hasAttribute('maximized'))
                return this;

            if(this.hasAttribute('minimized'))
                this.restore();

            this.saveGeometry();

            this.removeAttribute(
                'minimized'
            );

            this.setAttribute(
                'maximized',
                ''
            );

            this.style.left = '0';
            this.style.top = '0';
            this.style.right = '0';
            this.style.bottom = '0';
            this.style.width = '100%';
            this.style.height = '100%';
            this.style.zIndex = '2147483647';

            this.dispatchEvent(
                new CustomEvent(
                    'arianna:maximize',
                    {
                        bubbles: true,
                        detail: { target:this },
                    }
                )
            );

            return this;
        }

        restore(): this
        {
            const wasMinimized =
                this.hasAttribute('minimized');

            const wasMaximized =
                this.hasAttribute('maximized');

            this.removeAttribute(
                'minimized'
            );

            this.removeAttribute(
                'maximized'
            );

            this.style.bottom = 'auto';

            this.restoreGeometry();

            this.dispatchEvent(
                new CustomEvent(
                    'arianna:restore',
                    {
                        bubbles: true,
                        detail:
                        {
                            target:this,
                            from:
                                wasMaximized
                                    ? 'maximized'
                                    : wasMinimized
                                        ? 'minimized'
                                        : 'normal',
                        },
                    }
                )
            );

            return this;
        }

        toggleMaximize(): this
        {
            return this.hasAttribute('maximized') ||
                   this.hasAttribute('minimized')
                ? this.restore()
                : this.maximize();
        }

        close(): this
        {
            this.dispatchEvent(
                new CustomEvent(
                    'arianna:close',
                    {
                        bubbles: true,
                        detail: { target:this },
                    }
                )
            );

            this.remove();

            return this;
        }

        moveTo(x:number, y:number): this
        {
            const stage =
                this.ensureStage();

            let nextX = x;
            let nextY = y;

            if(stage)
            {
                nextX =
                    Math.max(
                        0,
                        Math.min(
                            stage.clientWidth - this.offsetWidth,
                            nextX
                        )
                    );

                nextY =
                    Math.max(
                        0,
                        Math.min(
                            stage.clientHeight - this.offsetHeight,
                            nextY
                        )
                    );
            }

            this.style.left =
                `${Math.round(nextX)}px`;

            this.style.top =
                `${Math.round(nextY)}px`;

            this.style.right =
                'auto';

            this.style.bottom =
                'auto';

            return this;
        }

        resizeTo(width:number, height:number): this
        {
            const stage =
                this.ensureStage();

            let nextWidth =
                Math.max(
                    this.numberAttribute('min-width') ?? 200,
                    width
                );

            let nextHeight =
                Math.max(
                    this.numberAttribute('min-height') ?? 120,
                    height
                );

            if(stage)
            {
                nextWidth =
                    Math.min(
                        nextWidth,
                        stage.clientWidth - this.offsetLeft
                    );

                nextHeight =
                    Math.min(
                        nextHeight,
                        stage.clientHeight - this.offsetTop
                    );
            }

            this.style.width =
                `${Math.round(nextWidth)}px`;

            this.style.height =
                `${Math.round(nextHeight)}px`;

            return this;
        }

        get variant(): Types.WindowStyle
        {
            return (
                this.getAttribute('variant') ??
                'macos'
            ) as Types.WindowStyle;
        }

        set variant(value:Types.WindowStyle)
        {
            this.setAttribute(
                'variant',
                value
            );
        }

        get title(): string
        {
            return this.getAttribute('title') ?? '';
        }

        set title(value:string)
        {
            this.setAttribute(
                'title',
                value
            );

            const element =
                this.querySelector<HTMLElement>(
                    '.WindowComponent-Title'
                );

            if(element)
                element.textContent = value;
        }

        get maximized(): boolean
        {
            return this.hasAttribute('maximized');
        }

        get minimized(): boolean
        {
            return this.hasAttribute('minimized');
        }
    }
}

export const WindowClass =
    WindowComponent.WindowComponent;

/*
 * Public compatibility exports.
 * layout/index.ts imports these names directly from ./Window.ts.
 */
export type WindowStyle =
    WindowComponent.Types.WindowStyle;

export type WindowOptions =
    WindowComponent.Interfaces.WindowOptions;

export type WindowMenuItem =
    WindowComponent.Interfaces.WindowMenuItem;

export default
    WindowComponent.WindowComponent;
