/**
 * @module components/layout/Dock
 * @version 2.0.0
 */

import { Component, Css, Templates } from '../../core/index.ts';
import MoverComponent from '../graphics/2D/modifiers/Mover.ts';

const html = Templates.Template.Html;

export namespace Dock
{
    export namespace Types
    {
        export type DockStyle = 'macos' | 'windows' | 'linux';
        export type DockPosition = 'floating' | 'right' | 'left' | 'top' | 'bottom';
        export type DockTheme = 'dark' | 'light';
    }

    export namespace Interfaces
    {
        export interface DockItem
        {
            id: string;
            label: string;
            icon: string;
            running?: boolean;
            active?: boolean;
            badge?: number;
            separator?: boolean;
            meta?: unknown;
        }

        export interface DockOptions
        {
            style?: Types.DockStyle;
            variant?: Types.DockStyle;
            position?: Types.DockPosition;
            theme?: Types.DockTheme;
            items?: DockItem[];
            tray?: DockItem[];
            magnify?: number;
            startLabel?: string;
        }
    }

    export const Styles =
        new Css.Stylesheet([
            /* ── Base / dark default ─────────────────────────────────────── */
            new Css.Rule('.Dock', {
                AlignItems: 'center',
                Background: '#202124',
                Border: '1px solid #303238',
                BoxSizing: 'border-box',
                Color: '#e8eaed',
                Display: 'flex',
                FontFamily: 'var(--arianna-font, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif)',
                Gap: '4px',
                Height: '48px',
                MaxWidth: '100%',
                MinWidth: '0',
                Overflow: 'visible',
                Padding: '4px 6px',
                ZIndex: '20',
            }),
new Css.Rule('.Dock-Track', {
                AlignItems: 'center',
                Display: 'flex',
                Flex: '1 1 auto',
                Gap: '4px',
                Height: '100%',
                JustifyContent: 'center',
                MinWidth: '0',
            }),

            new Css.Rule('.Dock-Item, .Dock-Start', {
                AlignItems: 'center',
                Appearance: 'none',
                Background: 'transparent',
                Border: '0',
                BorderRadius: '6px',
                BoxSizing: 'border-box',
                Color: 'inherit',
                Cursor: 'pointer',
                Display: 'flex',
                Flex: '0 0 auto',
                Height: '38px',
                JustifyContent: 'center',
                MinWidth: '38px',
                Padding: '4px',
                Position: 'relative',
                Transition: 'background .12s ease, transform .14s ease',
            }),

            new Css.Rule('.Dock-Item:hover, .Dock-Start:hover', {
                Background: 'rgba(255,255,255,.08)',
            }),

            new Css.Rule('.Dock-Item-Active', {
                Background: 'rgba(255,255,255,.10)',
                BoxShadow: 'inset 0 -2px 0 #e40c88',
            }),

            new Css.Rule('.Dock-Icon', {
                AlignItems: 'center',
                Display: 'flex',
                FontSize: '20px',
                Height: '24px',
                JustifyContent: 'center',
                LineHeight: '1',
                PointerEvents: 'none',
                Width: '24px',
            }),

            new Css.Rule('.Dock-Icon img, .Dock-Icon svg', {
                Display: 'block',
                Height: '100%',
                PointerEvents: 'none',
                Width: '100%',
            }),

            new Css.Rule('.Dock-Dot', {
                Background: '#60a5fa',
                BorderRadius: '999px',
                Bottom: '1px',
                Display: 'none',
                Height: '3px',
                Left: '50%',
                Position: 'absolute',
                Transform: 'translateX(-50%)',
                Width: '14px',
            }),

            new Css.Rule('.Dock-Item-Running .Dock-Dot', {
                Display: 'block',
            }),

            new Css.Rule('.Dock-Badge', {
                AlignItems: 'center',
                Background: '#e40c88',
                Border: '1px solid rgba(255,255,255,.78)',
                BorderRadius: '999px',
                Color: '#fff',
                Display: 'flex',
                FontSize: '9px',
                FontWeight: '700',
                Height: '16px',
                JustifyContent: 'center',
                MinWidth: '16px',
                Padding: '0 3px',
                Position: 'absolute',
                Right: '-2px',
                Top: '-2px',
            }),

            new Css.Rule('.Dock-Tooltip', {
                Background: '#111216',
                Border: '1px solid #303238',
                BorderRadius: '5px',
                Bottom: 'calc(100% + 8px)',
                Color: '#f4f5f6',
                FontSize: '11px',
                Opacity: '0',
                Padding: '4px 7px',
                PointerEvents: 'none',
                Position: 'absolute',
                Transition: 'opacity .12s ease',
                WhiteSpace: 'nowrap',
            }),

            new Css.Rule('.Dock-Item:hover .Dock-Tooltip', {
                Opacity: '1',
            }),

            new Css.Rule('.Dock-Sep', {
                Background: '#45474e',
                Height: '28px',
                Margin: '0 3px',
                Width: '1px',
            }),

            new Css.Rule('.Dock-Tray', {
                AlignItems: 'center',
                BorderLeft: '1px solid rgba(255,255,255,.06)',
                Display: 'flex',
                Flex: '0 0 auto',
                Gap: '2px',
                Height: '100%',
                PaddingLeft: '5px',
            }),

            new Css.Rule('.Dock-Clock', {
                AlignItems: 'flex-end',
                Color: '#d4d7dc',
                Display: 'flex',
                FlexDirection: 'column',
                FontSize: '10px',
                LineHeight: '1.2',
                Padding: '0 5px',
                WhiteSpace: 'nowrap',
            }),

            new Css.Rule('.Dock-Start-Icon', {
                AlignItems: 'center',
                Color: '#60a5fa',
                Display: 'flex',
                Height: '20px',
                JustifyContent: 'center',
                Width: '20px',
            }),

            new Css.Rule('.Dock-Start-Label', {
                FontSize: '11px',
                MarginLeft: '4px',
            }),

            /* ── Windows 11 taskbar ───────────────────────────────────── */
            new Css.Rule('.Dock.Windows', {
                Background: 'linear-gradient(180deg,#242529 0%,#1d1e22 100%)',
                Border: '1px solid #303238',
                BorderRadius: '0',
                BoxShadow: '0 -8px 28px rgba(0,0,0,.18)',
                Height: '48px',
                Padding: '4px 8px',
                Width: '100%',
            }),

            new Css.Rule('.Dock.Windows .Dock-Track', {
                JustifyContent: 'center',
            }),

            new Css.Rule('.Dock.Windows .Dock-Tooltip', {
                Display: 'none',
            }),

            new Css.Rule('.Dock.Windows .Dock-Item-Active', {
                Background: 'rgba(96,165,250,.12)',
                BoxShadow: 'inset 0 -2px 0 #60a5fa',
            }),

            /* ── Ubuntu / GNOME Dock ────────────────────────────────────── */
            new Css.Rule('.Dock.Linux', {
                Background: 'linear-gradient(180deg,#383236 0%,#282428 100%)',
                Border: '1px solid rgba(255,255,255,.10)',
                BorderRadius: '12px',
                BoxShadow: '0 14px 34px rgba(0,0,0,.34)',
                Height: '52px',
                Padding: '5px 7px',
                Width: '100%',
            }),

            new Css.Rule('.Dock.Linux .Dock-Track', {
                Gap: '5px',
                JustifyContent: 'center',
            }),

            new Css.Rule('.Dock.Linux .Dock-Item, .Dock.Linux .Dock-Start', {
                BorderRadius: '8px',
                Height: '40px',
                MinWidth: '40px',
            }),

            new Css.Rule('.Dock.Linux .Dock-Item:hover, .Dock.Linux .Dock-Start:hover', {
                Background: 'rgba(255,255,255,.09)',
            }),

            new Css.Rule('.Dock.Linux .Dock-Item-Active', {
                Background: 'rgba(233,84,32,.16)',
                BoxShadow: 'inset 0 -2px 0 #e95420',
            }),

            new Css.Rule('.Dock.Linux .Dock-Start-Icon', {
                Color: '#e95420',
            }),

            new Css.Rule('.Dock.Linux .Dock-Dot', {
                Background: '#e95420',
                Height: '3px',
                Width: '18px',
            }),

            new Css.Rule('.Dock.Linux .Dock-Tray', {
                Display: 'none',
            }),

            new Css.Rule('.Dock.Linux .Dock-Tooltip', {
                Background: '#211d20',
                BorderColor: '#494047',
            }),

            new Css.Rule('.Dock.Linux[position="left"] .Dock-Dot', {
                Bottom: 'auto',
                Height: '18px',
                Left: '0',
                Top: '50%',
                Transform: 'translateY(-50%)',
                Width: '3px',
            }),

            new Css.Rule('.Dock.Linux[position="right"] .Dock-Dot', {
                Bottom: 'auto',
                Height: '18px',
                Left: 'auto',
                Right: '0',
                Top: '50%',
                Transform: 'translateY(-50%)',
                Width: '3px',
            }),

            /* ── macOS ─────────────────────────────────────────────────── */
            new Css.Rule('.Dock.Mac', {
                BackdropFilter: 'blur(18px) saturate(140%)',
                Background: 'rgba(32,33,36,.78)',
                Border: '1px solid rgba(255,255,255,.12)',
                BorderRadius: '17px',
                BoxShadow: '0 16px 36px rgba(0,0,0,.38)',
                Height: '58px',
                Padding: '6px 8px',
                Width: 'max-content',
            }),

            new Css.Rule('.Dock.Mac .Dock-Track', {
                Gap: '7px',
            }),

            new Css.Rule('.Dock.Mac .Dock-Item', {
                BorderRadius: '11px',
                Height: '44px',
                MinWidth: '44px',
                TransformOrigin: '50% 100%',
            }),

            new Css.Rule('.Dock.Mac .Dock-Item:hover', {
                Transform: 'translateY(-5px) scale(var(--Dock-Magnify, 1.18))',
            }),

            new Css.Rule('.Dock.Mac .Dock-Icon', {
                FontSize: '28px',
                Height: '34px',
                Width: '34px',
            }),

            /* ── Position modes, local to direct parent ─────────────────── */
            new Css.Rule('.Dock[position="floating"]', {
                Position: 'absolute',
                Width: 'max-content',
            }),

            new Css.Rule('.Dock[position="bottom"], .Dock:not([position])', {
                Bottom: '0',
                Left: '0',
                Position: 'absolute',
                Right: '0',
                Width: '100%',
            }),

            new Css.Rule('.Dock[position="top"]', {
                Left: '0',
                Position: 'absolute',
                Right: '0',
                Top: '0',
                Width: '100%',
            }),

            new Css.Rule('.Dock[position="left"], .Dock[position="right"]', {
                FlexDirection: 'column',
                Height: '100%',
                Padding: '6px 4px',
                Position: 'absolute',
                Top: '0',
                Width: '52px',
            }),

            new Css.Rule('.Dock[position="left"]', {
                Left: '0',
            }),

            new Css.Rule('.Dock[position="right"]', {
                Right: '0',
            }),

            new Css.Rule('.Dock[position="left"] .Dock-Track, .Dock[position="right"] .Dock-Track', {
                FlexDirection: 'column',
                Height: 'auto',
                JustifyContent: 'center',
                Width: '100%',
            }),

            new Css.Rule('.Dock[position="left"] .Dock-Tray, .Dock[position="right"] .Dock-Tray', {
                BorderLeft: '0',
                BorderTop: '1px solid rgba(255,255,255,.06)',
                FlexDirection: 'column',
                Height: 'auto',
                Padding: '5px 0 0',
                Width: '100%',
            }),

            new Css.Rule('.Dock[position="left"] .Dock-Clock, .Dock[position="right"] .Dock-Clock', {
                Display: 'none',
            }),

            new Css.Rule('.Dock.Linux[position="left"], .Dock.Linux[position="right"]', {
                BorderRadius: '0 12px 12px 0',
                Height: '100%',
                Width: '56px',
            }),

            new Css.Rule('.Dock.Linux[position="right"]', {
                BorderRadius: '12px 0 0 12px',
            }),

            new Css.Rule('.Dock.Linux[position="top"], .Dock.Linux[position="bottom"]', {
                BorderRadius: '12px',
                Height: '52px',
            }),

            /* ── Light theme ────────────────────────────────────────────── */
            new Css.Rule('.Dock[theme="light"]', {
                Background: '#f4f4f6',
                BorderColor: '#d8d9de',
                Color: '#202124',
            }),

            new Css.Rule('.Dock[theme="light"] .Dock-Item:hover, .Dock[theme="light"] .Dock-Start:hover, .Dock[theme="light"] .Dock-Item-Active', {
                Background: 'rgba(0,0,0,.07)',
            }),

            new Css.Rule('.Dock[theme="light"] .Dock-Tray', {
                BorderLeftColor: 'rgba(0,0,0,.10)',
            }),

            new Css.Rule('.Dock[theme="light"] .Dock-Clock', {
                Color: '#44474d',
            }),

            new Css.Rule('.Dock.Windows[theme="light"]', {
                Background: 'linear-gradient(180deg,#fafafd 0%,#eceef2 100%)',
                BorderColor: '#d6d8de',
                Color: '#202124',
            }),

            new Css.Rule('.Dock.Linux[theme="light"]', {
                Background: 'linear-gradient(180deg,#f3efef 0%,#e7e1e4 100%)',
                BorderColor: '#d5cdd1',
                Color: '#2b2729',
            }),

            new Css.Rule('.Dock.Mac[theme="light"]', {
                Background: 'rgba(244,244,246,.82)',
                BorderColor: 'rgba(0,0,0,.10)',
            }),
        ]);

    @Component('arianna-dock', Styles, {
        Shadow: false,
        Attributes: ['variant', 'position', 'theme', 'magnify', 'start-label'],
    })
    export class Dock extends HTMLElement
    {
        public static readonly Styles = Styles;
        public template = html``;

        private _items?: Interfaces.DockItem[];
        private _tray?: Interfaces.DockItem[];
        private _clockTimer?: number;

        /** Active only while position="floating". */
        public Mover: MoverComponent | null = null;

        private _floatingGeometryReady = false;

        constructor(options: Interfaces.DockOptions = {})
        {
            super();

            const variant = options.variant ?? options.style;
            if(variant) this.variant = variant;
            if(options.position) this.position = options.position;
            if(options.theme) this.theme = options.theme;
            if(options.magnify != null) this.magnify = options.magnify;
            if(options.startLabel != null) this.setAttribute('start-label', options.startLabel);
            if(options.items) this._items = options.items;
            if(options.tray) this._tray = options.tray;
        }

        public get items(): Interfaces.DockItem[]
        {
            return this._items ?? [];
        }

        public set items(value: Interfaces.DockItem[])
        {
            this._items = Array.isArray(value) ? value : [];
            if(this.isConnected) this.Render();
        }

        public get tray(): Interfaces.DockItem[]
        {
            return this._tray ?? [];
        }

        public set tray(value: Interfaces.DockItem[])
        {
            this._tray = Array.isArray(value) ? value : [];
            if(this.isConnected) this.Render();
        }

        public get variant(): Types.DockStyle
        {
            const value = this.getAttribute('variant');
            return value === 'windows' || value === 'linux' ? value : 'macos';
        }

        public set variant(value: Types.DockStyle)
        {
            this.setAttribute('variant', value);
        }

        public get position(): Types.DockPosition
        {
            const value = this.getAttribute('position') as Types.DockPosition | null;
            return value ?? (this.variant === 'macos' ? 'floating' : 'bottom');
        }

        public set position(value: Types.DockPosition)
        {
            const allowed: Types.DockPosition[] =
            [
                'floating',
                'right',
                'left',
                'top',
                'bottom'
            ];

            const next =
                allowed.includes(value)
                    ? value
                    : 'bottom';

            const previous =
                this.position;

            /*
             * Do not depend on Component attribute-observer timing.
             * Position is an imperative layout operation and must complete
             * synchronously when a Dropdown changes it.
             */
            this.setAttribute(
                'position',
                next
            );

            this._floatingGeometryReady =
                false;

            if(this.isConnected)
                this.SyncMover();

            if(previous !== next)
            {
                this.dispatchEvent(
                    new CustomEvent(
                        'arianna:position-change',
                        {
                            bubbles: true,
                            composed: true,
                            detail:
                            {
                                position: next,
                                previous
                            }
                        }
                    )
                );
            }
        }

        public get theme(): Types.DockTheme
        {
            return this.getAttribute('theme') === 'light' ? 'light' : 'dark';
        }

        public set theme(value: Types.DockTheme)
        {
            this.setAttribute('theme', value);
        }

        public get magnify(): number
        {
            const value = Number(this.getAttribute('magnify'));
            return Number.isFinite(value) && value > 0 ? value : 1.18;
        }

        public set magnify(value: number)
        {
            this.setAttribute('magnify', String(value));
        }

        public onConnected(): void
        {
            this.EnsureParent();
            this.NormalizeIdentity();

            if(!this.hasAttribute('theme'))
                this.setAttribute('theme', 'dark');

            if(!this.hasAttribute('position'))
                this.setAttribute('position', this.variant === 'macos' ? 'floating' : 'bottom');

            this.style.setProperty('--Dock-Magnify', String(this.magnify));

            this.addEventListener(
                'click',
                this.OnDockClick
            );

            this.Render();
            this.StartClock();
        }

        public onDisconnected(): void
        {
            if(this._clockTimer)
                window.clearInterval(this._clockTimer);

            this._clockTimer = undefined;

            this.Mover?.remove();
            this.Mover = null;
            this._floatingGeometryReady = false;

            this.removeEventListener(
                'click',
                this.OnDockClick
            );
        }

        public onAttributeChanged(name: string): void
        {
            if(!this.isConnected)
                return;

            if(name === 'magnify')
                this.style.setProperty('--Dock-Magnify', String(this.magnify));

            if(name === 'variant')
                this.NormalizeIdentity();

            if(name === 'variant' || name === 'theme' || name === 'start-label')
                this.Render();

            if(name === 'position')
            {
                this._floatingGeometryReady =
                    false;

                this.SyncMover();
            }
        }

        private NormalizeIdentity(): void
        {
            this.classList.add('Dock');
            this.classList.remove('Mac', 'Windows', 'Linux');

            this.classList.add(
                this.variant === 'macos'
                    ? 'Mac'
                    : this.variant === 'windows'
                        ? 'Windows'
                        : 'Linux'
            );
        }

        private EnsureParent(): void
        {
            const parent = this.parentElement;
            if(!parent) return;

            if(getComputedStyle(parent).position === 'static')
                parent.style.position = 'relative';
        }

        private StartClock(): void
        {
            if(this._clockTimer)
                window.clearInterval(this._clockTimer);

            this._clockTimer = window.setInterval(() =>
            {
                const time = this.querySelector<HTMLElement>('.Dock-Time');
                const date = this.querySelector<HTMLElement>('.Dock-Date');

                if(time) time.textContent = this.ClockTime();
                if(date) date.textContent = this.ClockDate();
            }, 30000);
        }

        private Render(): void
        {
            this.NormalizeIdentity();

            if(this.variant === 'macos')
                this.RenderMac();
            else
                this.RenderTaskbar();

            this.SyncMover();
        }

        private RenderMac(): void
        {
            const track = document.createElement('div');
            track.className = 'Dock-Track Dock-Track-Mac';

            for(const item of this.items)
            {
                if(item.separator)
                {
                    const separator = document.createElement('span');
                    separator.className = 'Dock-Sep';
                    track.append(separator);
                    continue;
                }

                track.append(this.Item(item, true));
            }

            this.replaceChildren(track);
        }

        private RenderTaskbar(): void
        {
            const startItem =
                this.items.find(item => item.id === 'start');

            const start = document.createElement('button');
            start.type = 'button';
            start.className = [
                'Dock-Start',
                startItem?.active
                    ? 'Dock-Item-Active'
                    : ''
            ].filter(Boolean).join(' ');

            if(startItem)
                start.dataset.dockItemId = startItem.id;

            start.title = startItem?.label ?? 'Start';
            start.setAttribute('aria-label', start.title);

            const startIcon = document.createElement('span');
            startIcon.className = 'Dock-Start-Icon';
            startIcon.innerHTML =
                startItem?.icon && startItem.icon !== '⊞'
                    ? this.IconHtml(startItem.icon)
                    : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></svg>';

            start.append(startIcon);

            const label = this.getAttribute('start-label');
            if(label)
            {
                const text = document.createElement('span');
                text.className = 'Dock-Start-Label';
                text.textContent = label;
                start.append(text);
            }
const track = document.createElement('div');
            track.className = 'Dock-Track Dock-Track-Taskbar';

            for(const item of this.items)
            {
                if(item.id === 'start')
                    continue;

                if(item.separator)
                {
                    const separator = document.createElement('span');
                    separator.className = 'Dock-Sep';
                    track.append(separator);
                    continue;
                }

                track.append(this.Item(item, false));
            }

            const tray = document.createElement('div');
            tray.className = 'Dock-Tray';

            for(const item of this.tray)
                tray.append(this.Item(item, false, true));

            const clock = document.createElement('div');
            clock.className = 'Dock-Clock';

            const time = document.createElement('span');
            time.className = 'Dock-Time';
            time.textContent = this.ClockTime();

            const date = document.createElement('span');
            date.className = 'Dock-Date';
            date.textContent = this.ClockDate();

            clock.append(time, date);
            tray.append(clock);

            this.replaceChildren(start, track, tray);
        }

        private Item(
            item: Interfaces.DockItem,
            tooltip: boolean,
            tray = false
        ): HTMLButtonElement
        {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = [
                'Dock-Item',
                item.active ? 'Dock-Item-Active' : '',
                item.running ? 'Dock-Item-Running' : '',
                tray ? 'Dock-Item-Tray' : '',
            ].filter(Boolean).join(' ');

            button.dataset.dockItemId = item.id;

            if(tray)
                button.dataset.dockTray = 'true';

            button.title = item.label;
            button.setAttribute('aria-label', item.label);

            const icon = document.createElement('span');
            icon.className = 'Dock-Icon';
            icon.innerHTML = this.IconHtml(item.icon);
            button.append(icon);

            if(typeof item.badge === 'number' && item.badge > 0)
            {
                const badge = document.createElement('span');
                badge.className = 'Dock-Badge';
                badge.textContent = item.badge > 99 ? '99+' : String(item.badge);
                button.append(badge);
            }

            const dot = document.createElement('span');
            dot.className = 'Dock-Dot';
            dot.setAttribute('aria-hidden', 'true');
            button.append(dot);

            if(tooltip)
            {
                const tip = document.createElement('span');
                tip.className = 'Dock-Tooltip';
                tip.textContent = item.label;
                button.append(tip);
            }
button.addEventListener('contextmenu', event =>
            {
                event.preventDefault();

                this.dispatchEvent(new CustomEvent('arianna:item-context', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        id: item.id,
                        item: { ...item },
                        x: event.clientX,
                        y: event.clientY
                    }
                }));
            });

            return button;
        }

        private SelectItem(id: string): void
        {
            if(!this._items)
                return;

            let changed = false;

            for(const item of this._items)
            {
                if(item.separator)
                    continue;

                const active =
                    item.id === id;

                if(Boolean(item.active) !== active)
                {
                    item.active = active;
                    changed = true;
                }
            }

            if(changed)
                this.Render();

            this.dispatchEvent(
                new CustomEvent(
                    'arianna:selection-change',
                    {
                        bubbles: true,
                        composed: true,
                        detail:
                        {
                            id,
                            item:
                                this._items.find(
                                    item =>
                                        item.id === id
                                ) ?? null
                        }
                    }
                )
            );
        }

        private OnDockClick(event: Event): void
        {
            const target =
                event.target;

            if(!(target instanceof Element))
                return;

            const button =
                target.closest<HTMLButtonElement>(
                    'button[data-dock-item-id]'
                );

            if(
                !button ||
                !this.contains(button)
            )
                return;

            event.stopPropagation();

            const id =
                button.dataset.dockItemId;

            if(!id)
                return;

            const tray =
                button.dataset.dockTray === 'true';

            const item =
                tray
                    ? this._tray?.find(
                        item =>
                            item.id === id
                    )
                    : this._items?.find(
                        item =>
                            item.id === id
                    );

            if(!item)
                return;

            if(!tray)
                this.SelectItem(id);

            this.dispatchEvent(
                new CustomEvent(
                    tray
                        ? 'arianna:tray-click'
                        : 'arianna:item-click',
                    {
                        bubbles: true,
                        composed: true,
                        detail:
                        {
                            id,
                            item: { ...item }
                        }
                    }
                )
            );

            if(
                !tray &&
                id === 'start'
            )
            {
                this.dispatchEvent(
                    new CustomEvent(
                        'arianna:start',
                        {
                            bubbles: true,
                            composed: true,
                            detail:
                            {
                                item: { ...item }
                            }
                        }
                    )
                );
            }
        }

        private ActivateModifier(
            modifier: MoverComponent
        ): void
        {
            requestAnimationFrame(
                () =>
                {
                    if(
                        modifier.target !== this &&
                        typeof modifier.onMount === 'function'
                    )
                        modifier.onMount();
                }
            );
        }

        private SyncMover(): void
        {
            if(this.position !== 'floating')
            {
                this.Mover?.remove();
                this.Mover = null;

                this._floatingGeometryReady = false;

                this.style.removeProperty('left');
                this.style.removeProperty('top');
                this.style.removeProperty('right');
                this.style.removeProperty('bottom');
                this.style.removeProperty('transform');
                this.style.removeProperty('cursor');

                return;
            }

            if(
                !this.Mover ||
                !this.Mover.isConnected
            )
            {
                /*
                 * Real Modifier2D instance. No selector is supplied:
                 * Mover already ignores interactive children, so icons remain
                 * clickable while dragging works from the Dock background.
                 */
                const mover =
                    new MoverComponent();

                mover.setAttribute(
                    'axis',
                    'both'
                );

                mover.setAttribute(
                    'bounds',
                    'parent'
                );

                this.appendChild(
                    mover
                );

                this.Mover =
                    mover;
            }

            requestAnimationFrame(
                () =>
                {
                    this.PrepareFloatingGeometry();

                    if(this.Mover)
                        this.ActivateModifier(
                            this.Mover
                        );
                }
            );
        }

        private PrepareFloatingGeometry(): void
        {
            if(
                this._floatingGeometryReady ||
                this.position !== 'floating'
            )
                return;

            const parent =
                this.parentElement;

            if(!parent)
                return;

            const x =
                Math.max(
                    0,
                    Math.round(
                        (
                            parent.clientWidth -
                            this.offsetWidth
                        ) / 2
                    )
                );

            const y =
                Math.max(
                    0,
                    Math.round(
                        parent.clientHeight -
                        this.offsetHeight -
                        12
                    )
                );

            this.style.left =
                `${x}px`;

            this.style.top =
                `${y}px`;

            this.style.right =
                'auto';

            this.style.bottom =
                'auto';

            this.style.transform =
                'none';

            this.setAttribute(
                'x',
                String(x)
            );

            this.setAttribute(
                'y',
                String(y)
            );

            this._floatingGeometryReady =
                true;
        }

        private IconHtml(icon: string): string
        {
            const value = String(icon ?? '').trim();

            if(/^<svg[\s>]/i.test(value))
                return value;

            if(/^(https?:|data:|blob:|\/|\.\/|\.\.\/)/i.test(value))
                return `<img src="${value}" alt="" draggable="false">`;

            return `<span aria-hidden="true">${value}</span>`;
        }

        private ClockTime(): string
        {
            return new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        private ClockDate(): string
        {
            return new Date().toLocaleDateString([], {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    }
}

export type DockStyle = Dock.Types.DockStyle;
export type DockPosition = Dock.Types.DockPosition;
export type DockTheme = Dock.Types.DockTheme;
export type DockItem = Dock.Interfaces.DockItem;
export type DockOptions = Dock.Interfaces.DockOptions;
export default Dock.Dock;
