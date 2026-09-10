import { Component, Css, Templates } from '../../core/index.ts';

const html = Templates.Template.Html;
const { Rule, Stylesheet } = Css;
type Stylesheet = Css.Stylesheet;

export interface MenuItem {
    id?: string;
    label?: string;
    icon?: string;
    shortcut?: string;
    disabled?: boolean;
    danger?: boolean;
    separator?: boolean;
}

export interface MenuOptions {
    items?: MenuItem[];
    theme?: 'dark' | 'light';
}

interface MenuState {
    items: MenuItem[];
    built: boolean;
    open: boolean;
    outside: ((event: PointerEvent) => void) | null;
    keydown: ((event: KeyboardEvent) => void) | null;
    opener: HTMLElement | null;
}

const States = new WeakMap<HTMLElement, MenuState>();

const StateOf = (host: HTMLElement): MenuState => {
    let state = States.get(host);
    if (!state) {
        state = {
            items: [],
            built: false,
            open: false,
            outside: null,
            keydown: null,
            opener: null,
        };
        States.set(host, state);
    }
    return state;
};

export const Styles: Stylesheet = new Stylesheet([
    new Rule('.Menu', {
        '--arianna-bg': '#17181c',
        '--arianna-bg-3': '#24262b',
        '--arianna-text': '#e6e8eb',
        '--arianna-muted': '#9aa0aa',
        '--arianna-border': '#303238',
        '--arianna-danger': '#ef5350',
        background: 'var(--arianna-bg)',
        border: '1px solid var(--arianna-border)',
        borderRadius: '8px',
        boxShadow: '0 10px 30px rgba(0,0,0,.28)',
        color: 'var(--arianna-text)',
        display: 'none',
        flexDirection: 'column',
        fontFamily: 'var(--arianna-font, system-ui, sans-serif)',
        minWidth: '190px',
        overflow: 'hidden',
        padding: '4px 0',
        position: 'fixed',
        zIndex: '3000',
    }),
    new Rule('.Menu[theme="light"]', {
        '--arianna-bg': '#ffffff',
        '--arianna-bg-3': '#f3f3f5',
        '--arianna-text': '#1c1e21',
        '--arianna-muted': '#626873',
        '--arianna-border': '#e2e2e6',
    }),
    new Rule('.Menu-Item', {
        alignItems: 'center',
        background: 'transparent',
        border: '0',
        color: 'var(--arianna-text)',
        cursor: 'pointer',
        display: 'flex',
        font: 'inherit',
        fontSize: '.82rem',
        gap: '8px',
        minHeight: '32px',
        padding: '7px 12px',
        textAlign: 'left',
        width: '100%',
    }),
    new Rule('.Menu-Item:hover:not(:disabled)', {
        background: 'var(--arianna-bg-3)',
    }),
    new Rule('.Menu-Item-Danger', { color: 'var(--arianna-danger)' }),
    new Rule('.Menu-Item:disabled', {
        cursor: 'not-allowed',
        opacity: '.42',
    }),
    new Rule('.Menu-Icon', {
        flexShrink: '0',
        textAlign: 'center',
        width: '18px',
    }),
    new Rule('.Menu-Label', { flex: '1' }),
    new Rule('.Menu-Shortcut', {
        color: 'var(--arianna-muted)',
        fontSize: '.72rem',
    }),
    new Rule('.Menu-Separator', {
        background: 'var(--arianna-border)',
        height: '1px',
        margin: '4px 0',
    }),
]);

@Component('arianna-menu', Styles, {
    Shadow: false,
    Attributes: ['theme', 'items'],
    Properties: ['items'],
})
export class Menu extends HTMLElement {
    declare template: unknown;

    public onCreated(): void {
        if (this.isConnected) this.onConnected();
    }

    public onConnected(options: MenuOptions = {}): void {
        const state = StateOf(this);

        this.classList.add('Menu');
        if (!this.hasAttribute('theme'))
            this.setAttribute('theme', options.theme ?? 'dark');

        if (options.items)
            state.items = [...options.items];

        const encoded = this.getAttribute('items');
        if (!state.items.length && encoded) {
            try {
                const value = JSON.parse(encoded);
                if (Array.isArray(value))
                    state.items = value;
            }
            catch {}
        }

        state.built = true;
        this.Render();

        /*
         * Do not portal from onConnected().
         * Moving a connected AriannA node can trigger another promotion/connect
         * cycle. If onConnected() also hides the menu, openAt() immediately loses
         * the popup after portaling to <body>.
         */
        this.style.display = state.open ? 'flex' : 'none';

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = Styles;
    }

    public onAttributeChanged(name: string): void {
        const state = StateOf(this);
        if (!state.built) return;

        if (name === 'items') {
            const encoded = this.getAttribute('items');
            if (encoded) {
                try {
                    const value = JSON.parse(encoded);
                    if (Array.isArray(value))
                        state.items = value;
                }
                catch {}
            }
        }

        this.Render();
    }

    private Render(): void {
        const state = StateOf(this);
        if (!state.built) return;

        const fragment = document.createDocumentFragment();

        for (const item of state.items) {
            if (item.separator) {
                const separator = document.createElement('div');
                separator.className = 'Menu-Separator';
                fragment.appendChild(separator);
                continue;
            }

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'Menu-Item' + (item.danger ? ' Menu-Item-Danger' : '');
            button.disabled = !!item.disabled;

            if (item.icon) {
                const icon = document.createElement('span');
                icon.className = 'Menu-Icon';
                icon.textContent = item.icon;
                button.appendChild(icon);
            }

            const label = document.createElement('span');
            label.className = 'Menu-Label';
            label.textContent = item.label ?? '';
            button.appendChild(label);

            if (item.shortcut) {
                const shortcut = document.createElement('span');
                shortcut.className = 'Menu-Shortcut';
                shortcut.textContent = item.shortcut;
                button.appendChild(shortcut);
            }

            button.addEventListener('click', event => {
                event.stopPropagation();
                if (item.disabled) return;

                this.dispatchEvent(new CustomEvent('arianna:select', {
                    bubbles: true,
                    detail: { id: item.id, item },
                }));

                this.close();
            });

            fragment.appendChild(button);
        }

        this.replaceChildren(fragment);
    }

    public openAt(x: number, y: number, opener: HTMLElement | null = null): this {
        const state = StateOf(this);
        state.opener = opener;
        state.open = true;

        /*
         * Portal only when opening. Mark the state OPEN before moving so that a
         * reconnect/onConnected cycle cannot hide the popup again.
         */
        if (this.parentElement !== document.body)
            document.body.appendChild(this);

        this.style.display = 'flex';
        this.style.visibility = 'hidden';

        const width = this.offsetWidth || 190;
        const height = this.offsetHeight || 160;

        this.style.left = Math.max(8, Math.min(x, window.innerWidth - width - 8)) + 'px';
        this.style.top = Math.max(8, Math.min(y, window.innerHeight - height - 8)) + 'px';
        this.style.visibility = '';

        this.RemoveGlobalListeners();

        state.outside = event => {
            const target = event.target as Node;
            if (!this.contains(target) && target !== state.opener && !state.opener?.contains(target))
                this.close();
        };

        state.keydown = event => {
            if (event.key === 'Escape') {
                event.preventDefault();
                this.close();
                state.opener?.focus?.();
            }
        };

        queueMicrotask(() => {
            if (state.outside)
                document.addEventListener('pointerdown', state.outside, true);
            if (state.keydown)
                document.addEventListener('keydown', state.keydown, true);
        });

        this.dispatchEvent(new CustomEvent('arianna:open', { bubbles: true }));
        return this;
    }

    public openBelow(anchor: HTMLElement): this {
        const rect = anchor.getBoundingClientRect();
        return this.openAt(rect.left, rect.bottom + 4, anchor);
    }

    public toggleBelow(anchor: HTMLElement): this {
        return StateOf(this).open
            ? this.close()
            : this.openBelow(anchor);
    }

    public close(): this {
        const state = StateOf(this);
        state.open = false;
        this.style.display = 'none';
        this.RemoveGlobalListeners();
        this.dispatchEvent(new CustomEvent('arianna:close', { bubbles: true }));
        state.opener = null;
        return this;
    }

    private RemoveGlobalListeners(): void {
        const state = StateOf(this);

        if (state.outside)
            document.removeEventListener('pointerdown', state.outside, true);
        if (state.keydown)
            document.removeEventListener('keydown', state.keydown, true);

        state.outside = null;
        state.keydown = null;
    }

    public onUnmount(): void {
        this.RemoveGlobalListeners();
    }

    public set items(value: MenuItem[]) {
        const state = StateOf(this);
        state.items = Array.isArray(value) ? [...value] : [];
        this.Render();
    }

    public get items(): MenuItem[] {
        return [...StateOf(this).items];
    }

    public static readonly Styles = Styles;
    public static DefaultSheet(): Stylesheet { return Styles; }
}

export namespace Menu {
    export namespace Interfaces {
        export interface Item extends MenuItem {}
        export interface Options extends MenuOptions {}
    }
}

export default Menu;
