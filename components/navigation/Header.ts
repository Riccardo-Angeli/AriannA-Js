import { Component, Css, Templates } from '../../core/index.ts';

const html = Templates.Template.Html;
const { Rule, Stylesheet } = Css;
type Stylesheet = Css.Stylesheet;

export interface HeaderOptions {
    title?: string;
    sticky?: boolean;
    theme?: 'dark' | 'light';
}

interface HeaderState {
    built: boolean;
    logo: Node[];
    actions: Node[];
    content: Node[];
    observer: MutationObserver | null;
    rendering: boolean;
}

const States = new WeakMap<HTMLElement, HeaderState>();

const StateOf = (host: HTMLElement): HeaderState => {
    let state = States.get(host);
    if (!state) {
        state = {
            built: false,
            logo: [],
            actions: [],
            content: [],
            observer: null,
            rendering: false,
        };
        States.set(host, state);
    }
    return state;
};

export const Styles: Stylesheet = new Stylesheet([
    new Rule('.Header', {
        '--arianna-bg': '#17181c',
        '--arianna-bg-3': '#24262b',
        '--arianna-text': '#e6e8eb',
        '--arianna-muted': '#9aa0aa',
        '--arianna-border': '#303238',
        '--arianna-primary': '#e40c88',
        background: 'var(--arianna-bg)',
        borderBottom: '1px solid var(--arianna-border)',
        boxSizing: 'border-box',
        color: 'var(--arianna-text)',
        display: 'block',
        fontFamily: 'var(--arianna-font, system-ui, sans-serif)',
        width: '100%',
    }),
    new Rule('.Header[theme="light"]', {
        '--arianna-bg': '#ffffff',
        '--arianna-bg-3': '#f3f3f5',
        '--arianna-text': '#1c1e21',
        '--arianna-muted': '#626873',
        '--arianna-border': '#e2e2e6',
    }),
    new Rule('.Header[sticky]', {
        position: 'sticky',
        top: '0',
        zIndex: '100',
    }),
    new Rule('.Header-Inner', {
        alignItems: 'center',
        boxSizing: 'border-box',
        display: 'flex',
        gap: '12px',
        height: '52px',
        minWidth: '0',
        padding: '0 16px',
        width: '100%',
    }),
    new Rule('.Header-Logo', {
        alignItems: 'center',
        display: 'flex',
        flexShrink: '0',
        fontWeight: '800',
        minWidth: '0',
    }),
    new Rule('.Header-Title', {
        fontSize: '.95rem',
        fontWeight: '700',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }),
    new Rule('.Header-Content', {
        alignItems: 'center',
        display: 'flex',
        gap: '8px',
        minWidth: '0',
    }),
    new Rule('.Header-Spacer', { flex: '1 1 auto' }),
    new Rule('.Header-Actions', {
        alignItems: 'center',
        display: 'flex',
        flexShrink: '0',
        gap: '8px',
    }),
    new Rule('.Header-Action', {
        background: 'var(--arianna-bg-3)',
        border: '1px solid var(--arianna-border)',
        borderRadius: '5px',
        color: 'var(--arianna-text)',
        cursor: 'pointer',
        font: 'inherit',
        padding: '5px 9px',
    }),
]);

@Component('arianna-header', Styles, {
    Shadow: false,
    Attributes: ['title', 'sticky', 'theme'],
})
export class Header extends HTMLElement {
    declare template: unknown;

    public onCreated(): void {
        if (this.isConnected) this.onConnected();
    }

    public onConnected(options: HeaderOptions = {}): void {
        const state = StateOf(this);

        this.classList.add('Header');
        if (!this.hasAttribute('theme'))
            this.setAttribute('theme', options.theme ?? 'dark');

        /*
         * Important for AriannA prototype promotion:
         * never rely on constructor-created instance fields.
         * Also collect light-DOM slot nodes every time onConnected is called,
         * so Real/Component/Direct can add content before OR after attachment.
         */
        this.CollectPendingChildren();

        if (options.title !== undefined)
            this.title = options.title;
        if (options.sticky !== undefined)
            this.sticky = options.sticky;

        state.built = true;
        this.Render();

        if (!state.observer) {
            state.observer = new MutationObserver(records => {
                if (state.rendering) return;

                let externalAddition = false;
                for (const record of records) {
                    for (const node of record.addedNodes) {
                        if (node instanceof Element && node.classList.contains('Header-Inner'))
                            continue;
                        externalAddition = true;
                    }
                }

                if (externalAddition) {
                    this.CollectPendingChildren();
                    this.Render();
                }
            });

            state.observer.observe(this, { childList: true });
        }

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = Styles;
    }

    public onAttributeChanged(): void {
        if (StateOf(this).built)
            this.Render();
    }

    public onUnmount(): void {
        const state = StateOf(this);
        state.observer?.disconnect();
        state.observer = null;
    }

    private CollectPendingChildren(): void {
        const state = StateOf(this);

        for (const node of [...this.childNodes]) {
            if (node instanceof Element && node.classList.contains('Header-Inner'))
                continue;

            if (node instanceof Element && node.getAttribute('slot') === 'logo') {
                if (!state.logo.includes(node))
                    state.logo.push(node);
            }
            else if (node instanceof Element && node.getAttribute('slot') === 'actions') {
                if (!state.actions.includes(node))
                    state.actions.push(node);
            }
            else if (!(node instanceof Text && !node.textContent?.trim())) {
                if (!state.content.includes(node))
                    state.content.push(node);
            }
        }
    }

    private Render(): void {
        const state = StateOf(this);
        if (!state.built) return;

        state.rendering = true;

        const inner = document.createElement('div');
        inner.className = 'Header-Inner';

        if (state.logo.length) {
            const logo = document.createElement('div');
            logo.className = 'Header-Logo';
            for (const node of state.logo)
                logo.appendChild(node);
            inner.appendChild(logo);
        }

        const title = this.title;
        if (title) {
            const titleNode = document.createElement('span');
            titleNode.className = 'Header-Title';
            titleNode.textContent = title;
            inner.appendChild(titleNode);
        }
        else if (state.content.length) {
            const content = document.createElement('div');
            content.className = 'Header-Content';
            for (const node of state.content)
                content.appendChild(node);
            inner.appendChild(content);
        }

        const spacer = document.createElement('div');
        spacer.className = 'Header-Spacer';
        inner.appendChild(spacer);

        if (state.actions.length) {
            const actions = document.createElement('div');
            actions.className = 'Header-Actions';
            for (const node of state.actions)
                actions.appendChild(node);
            inner.appendChild(actions);
        }

        this.replaceChildren(inner);
        state.rendering = false;
    }

    public get title(): string {
        return this.getAttribute('title') ?? '';
    }

    public set title(value: string) {
        value ? this.setAttribute('title', value) : this.removeAttribute('title');
    }

    public get sticky(): boolean {
        return this.hasAttribute('sticky');
    }

    public set sticky(value: boolean) {
        value ? this.setAttribute('sticky', '') : this.removeAttribute('sticky');
    }

    public static readonly Styles = Styles;
    public static DefaultSheet(): Stylesheet { return Styles; }
}

export namespace Header {
    export namespace Interfaces {
        export interface Options extends HeaderOptions {}
    }
}

export default Header;
