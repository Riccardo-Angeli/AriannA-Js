/**
 * @module    components/data/TreeView
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * TreeView — hierarchical tree control with expand/collapse, selection,
 * checkboxes, badges, lazy loading, search, drag/drop and keyboard navigation.
 */

import { Component, Css, Reactivity } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

export namespace TreeView
{
    export namespace Types
    {
        export type Signal<T> = SchemaInterfaces.Reactivity.Signal<T>;
        export type SelectMode = 'none' | 'single' | 'multi';
        export type Theme = 'dark' | 'light';
        export type Rule = Css.Rule;
        export type Stylesheet = Css.Stylesheet;
    }

    export namespace Interfaces
    {
        export interface TreeNode
        {
            id: string;
            label: string;
            icon?: string;
            badge?: string | number;
            children?: TreeNode[];
            lazy?: boolean;
            expanded?: boolean;
            selected?: boolean;
            checked?: boolean;
            selectable?: boolean;
            data?: unknown;
        }

        export interface TreeViewOptions
        {
            nodes?: TreeNode[];
            selectable?: Types.SelectMode;
            checkboxes?: boolean;
            icons?: boolean;
            badges?: boolean;
            indent?: number;
            rowHeight?: number;
            draggable?: boolean;
            keyboard?: boolean;
            expandOnSelect?: boolean;
            searchable?: boolean;
            theme?: Types.Theme;
        }
    }

    interface NodeState
    {
        node: Interfaces.TreeNode;
        expanded: boolean;
        selected: boolean;
        checked: boolean;
        loading: boolean;
        loaded: boolean;
        depth: number;
        parent: NodeState | null;
        children: NodeState[];
        visible: boolean;
    }

    interface FlatRow
    {
        state: NodeState;
        hasChildren: boolean;
        arrow: string;
    }

    const signal = Reactivity.CreateSignal;

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.TreeView', {
            Background: '#171a1e',
            Border: '1px solid #0c0e10',
            BorderRadius: '6px',
            BoxShadow: 'inset 0 1px 0 rgba(255,255,255,.04), 0 2px 8px rgba(0,0,0,.30)',
            BoxSizing: 'border-box',
            Color: '#e7eaed',
            Display: 'block',
            FontFamily: 'var(--arianna-font, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif)',
            FontSize: '.82rem',
            MinWidth: '0',
            Outline: 'none',
            Overflow: 'hidden',
            UserSelect: 'none',
            Width: '100%'
        }),
        new Css.Rule('.TreeView-Search', {
            Background: '#111418',
            Border: '1px solid #343a40',
            BorderRadius: '5px',
            BoxSizing: 'border-box',
            Color: '#e7eaed',
            Font: 'inherit',
            FontSize: '.82rem',
            Margin: '8px',
            Outline: 'none',
            Padding: '7px 9px',
            Width: 'calc(100% - 16px)'
        }),
        new Css.Rule('.TreeView-Search:focus', {
            BorderColor: '#4c9be8',
            BoxShadow: '0 0 0 2px rgba(76,155,232,.16)'
        }),
        new Css.Rule('.TreeView-Search::placeholder', { Color: '#727b84' }),
        new Css.Rule('.TreeView-List', {
            ListStyle: 'none',
            Margin: '0',
            MaxHeight: '420px',
            OverflowY: 'auto',
            Padding: '5px 6px 7px'
        }),
        new Css.Rule('.TreeView-Node', { ListStyle: 'none', Margin: '0', Padding: '0' }),
        new Css.Rule('.TreeView-Row', {
            AlignItems: 'center',
            Border: '1px solid transparent',
            BorderRadius: '4px',
            BoxSizing: 'border-box',
            Color: '#cfd4d9',
            Cursor: 'pointer',
            Display: 'flex',
            Gap: '6px',
            MinWidth: '0',
            PaddingRight: '8px',
            Transition: 'background .12s ease, border-color .12s ease, color .12s ease'
        }),
        new Css.Rule('.TreeView-Row:hover', { Background: '#24292f' }),
        new Css.Rule('.TreeView-Row-Focus', { BorderColor: '#4c9be8' }),
        new Css.Rule('.TreeView-Row-Active', {
            Background: 'linear-gradient(180deg,#2f6da9 0%,#245c92 100%)',
            BorderColor: '#4c9be8',
            Color: '#ffffff'
        }),
        new Css.Rule('.TreeView-Row-Active:hover', {
            Background: 'linear-gradient(180deg,#3477b8 0%,#28659f 100%)'
        }),
        new Css.Rule('.TreeView-Arrow', {
            AlignItems: 'center',
            Color: '#8d969f',
            Display: 'inline-flex',
            Flex: '0 0 14px',
            FontSize: '.7rem',
            Height: '18px',
            JustifyContent: 'center',
            Width: '14px'
        }),
        new Css.Rule('.TreeView-Row-Active .TreeView-Arrow', { Color: '#ffffff' }),
        new Css.Rule('.TreeView-Checkbox', { AccentColor: '#4c9be8', FlexShrink: '0', Margin: '0' }),
        new Css.Rule('.TreeView-Icon', { FlexShrink: '0', Width: '16px' }),
        new Css.Rule('.TreeView-Label', {
            Flex: '1 1 auto',
            MinWidth: '0',
            Overflow: 'hidden',
            TextOverflow: 'ellipsis',
            WhiteSpace: 'nowrap'
        }),
        new Css.Rule('.TreeView-Badge', {
            Background: '#3b4249',
            Border: '1px solid #4a525b',
            BorderRadius: '999px',
            Color: '#d9dde1',
            FlexShrink: '0',
            FontSize: '.64rem',
            LineHeight: '1.3',
            Padding: '1px 6px'
        }),
        new Css.Rule('.TreeView-Loading', { Color: '#4c9be8' }),

        new Css.Rule('.TreeView[theme="light"]', {
            Background: '#f8f9fa',
            BorderColor: '#c9cdd1',
            BoxShadow: 'inset 0 1px 0 #fff, 0 2px 8px rgba(0,0,0,.10)',
            Color: '#24282c'
        }),
        new Css.Rule('.TreeView[theme="light"] .TreeView-Search', {
            Background: '#ffffff',
            BorderColor: '#c9cdd1',
            Color: '#24282c'
        }),
        new Css.Rule('.TreeView[theme="light"] .TreeView-Search::placeholder', { Color: '#858c93' }),
        new Css.Rule('.TreeView[theme="light"] .TreeView-Row', { Color: '#30353a' }),
        new Css.Rule('.TreeView[theme="light"] .TreeView-Row:hover', { Background: '#e9ecef' }),
        new Css.Rule('.TreeView[theme="light"] .TreeView-Row-Active', {
            Background: 'linear-gradient(180deg,#5aa8ee 0%,#3c8ed8 100%)',
            BorderColor: '#2f7fc8',
            Color: '#ffffff'
        }),
        new Css.Rule('.TreeView[theme="light"] .TreeView-Arrow', { Color: '#7a8188' }),
        new Css.Rule('.TreeView[theme="light"] .TreeView-Row-Active .TreeView-Arrow', { Color: '#ffffff' }),
        new Css.Rule('.TreeView[theme="light"] .TreeView-Badge', {
            Background: '#e7eaed',
            BorderColor: '#c9cdd1',
            Color: '#42484e'
        })
    ]);

    @Component('arianna-tree-view', Styles, {
        Shadow: false,
        Attributes: [
            'selectable', 'checkboxes', 'icons', 'badges', 'indent', 'row-height',
            'draggable', 'keyboard', 'expand-on-select', 'searchable', 'theme', 'nodes'
        ],
        Properties: ['nodes']
    })
    export class TreeView extends HTMLElement
    {
        public static readonly Styles = Styles;

        private _rootsSignal?: Types.Signal<NodeState[]>;
        private _querySignal?: Types.Signal<string>;
        private _tickSignal?: Types.Signal<number>;
        private _map?: Map<string, NodeState>;
        private _focus?: NodeState | null;
        private _keyHandler?: (event: KeyboardEvent) => void;
        private _rendering = false;

        public get roots$(): Types.Signal<NodeState[]>
        {
            this._rootsSignal ??= signal<NodeState[]>([]);
            return this._rootsSignal;
        }

        public get query$(): Types.Signal<string>
        {
            this._querySignal ??= signal<string>('');
            return this._querySignal;
        }

        public get tick$(): Types.Signal<number>
        {
            this._tickSignal ??= signal<number>(0);
            return this._tickSignal;
        }

        private get Map(): Map<string, NodeState>
        {
            this._map ??= new Map<string, NodeState>();
            return this._map;
        }

        constructor(options: Interfaces.TreeViewOptions = {})
        {
            super();

            if(options.nodes) this.nodes = options.nodes;
            if(options.selectable) this.selectable = options.selectable;
            if(options.checkboxes != null) this.checkboxes = options.checkboxes;
            if(options.icons != null) this.icons = options.icons;
            if(options.badges != null) this.badges = options.badges;
            if(options.indent != null) this.indent = options.indent;
            if(options.rowHeight != null) this.rowHeight = options.rowHeight;
            if(options.draggable != null) this.draggable = options.draggable;
            if(options.keyboard != null) this.keyboard = options.keyboard;
            if(options.expandOnSelect != null) this.expandOnSelect = options.expandOnSelect;
            if(options.searchable != null) this.searchable = options.searchable;
            if(options.theme) this.theme = options.theme;
        }

        public onConnected(): void
        {
            this.classList.add('TreeView');
            if(!this.hasAttribute('theme')) this.setAttribute('theme', 'dark');
            if(!this.hasAttribute('selectable')) this.setAttribute('selectable', 'single');
            if(!this.hasAttribute('searchable')) this.setAttribute('searchable', 'true');
            if(!this.hasAttribute('icons')) this.setAttribute('icons', 'true');
            if(!this.hasAttribute('badges')) this.setAttribute('badges', 'true');
            if(!this.hasAttribute('keyboard')) this.setAttribute('keyboard', 'true');

            this.setAttribute('role', 'tree');
            this.tabIndex = 0;
            this.InstallKeyboard();
            this.Render();
        }

        public onAttributeChanged(name: string): void
        {
            if(!this.isConnected || this._rendering) return;
            if(name === 'theme') return;
            this.Render();
        }

        public onDisconnected(): void
        {
            if(this._keyHandler)
            {
                this.removeEventListener('keydown', this._keyHandler);
                this._keyHandler = undefined;
            }
        }

        public onCreated(): void {}
        public onBeforeMount(): void {}
        public onMount(): void {}
        public onBeforeUpdate(): void {}
        public onUpdate(): void {}
        public onBeforeUnmount(): void {}
        public onUnmount(): void { this.onDisconnected(); }

        public get nodes(): Interfaces.TreeNode[]
        {
            return this.roots$.Get().map(state => state.node);
        }

        public set nodes(value: Interfaces.TreeNode[])
        {
            this.Map.clear();
            const states = (Array.isArray(value) ? value : [])
                .map(node => this.MakeState(node, null, 0));

            this.roots$.Set(states);
            this._focus = states[0] ?? null;
            this.Bump();
        }

        public get selectable(): Types.SelectMode
        {
            const value = this.getAttribute('selectable') ?? 'single';
            return value === 'none' || value === 'multi' ? value : 'single';
        }

        public set selectable(value: Types.SelectMode) { this.setAttribute('selectable', value); }

        public get checkboxes(): boolean { return this.hasAttribute('checkboxes'); }
        public set checkboxes(value: boolean) { this.toggleAttribute('checkboxes', value); }

        public get icons(): boolean { return this.getAttribute('icons') !== 'false'; }
        public set icons(value: boolean) { this.setAttribute('icons', String(value)); }

        public get badges(): boolean { return this.getAttribute('badges') !== 'false'; }
        public set badges(value: boolean) { this.setAttribute('badges', String(value)); }

        public get indent(): number { return this.indentPx(); }
        public set indent(value: number) { this.setAttribute('indent', String(value)); }

        public get rowHeight(): number { return this.rowHeightPx(); }
        public set rowHeight(value: number) { this.setAttribute('row-height', String(value)); }

        public get draggable(): boolean { return this.hasAttribute('draggable'); }
        public set draggable(value: boolean) { this.toggleAttribute('draggable', value); }

        public get keyboard(): boolean { return this.getAttribute('keyboard') !== 'false'; }
        public set keyboard(value: boolean) { this.setAttribute('keyboard', String(value)); }

        public get expandOnSelect(): boolean { return this.hasAttribute('expand-on-select'); }
        public set expandOnSelect(value: boolean) { this.toggleAttribute('expand-on-select', value); }

        public get searchable(): boolean { return this.getAttribute('searchable') !== 'false'; }
        public set searchable(value: boolean) { this.setAttribute('searchable', String(value)); }

        public get theme(): Types.Theme { return (this.getAttribute('theme') ?? 'dark') as Types.Theme; }
        public set theme(value: Types.Theme) { this.setAttribute('theme', value); }

        public expand(id: string): this
        {
            const state = this.Map.get(id);
            if(state && !state.expanded) this.ExpandState(state);
            return this;
        }

        public collapse(id: string): this
        {
            const state = this.Map.get(id);
            if(state?.expanded) this.CollapseState(state);
            return this;
        }

        public toggle(id: string): this
        {
            const state = this.Map.get(id);
            if(state) state.expanded ? this.CollapseState(state) : this.ExpandState(state);
            return this;
        }

        public expandAll(): this
        {
            for(const state of this.Map.values())
                if(!state.expanded && (!state.node.lazy || state.loaded)) state.expanded = true;

            this.Bump();
            return this;
        }

        public collapseAll(): this
        {
            for(const state of this.Map.values()) state.expanded = false;
            this.Bump();
            return this;
        }

        public select(id: string): this
        {
            const state = this.Map.get(id);
            if(!state || state.node.selectable === false || this.selectable === 'none') return this;

            if(this.selectable === 'single') this.ClearSelection();
            this.SetSelected(state, true);
            this._focus = state;
            return this;
        }

        public deselect(id: string): this
        {
            const state = this.Map.get(id);
            if(state) this.SetSelected(state, false);
            return this;
        }

        public getSelected(): Interfaces.TreeNode[]
        {
            return [...this.Map.values()]
                .filter(state => state.selected)
                .map(state => state.node);
        }

        public check(id: string, value: boolean = true): this
        {
            const state = this.Map.get(id);
            if(state) this.SetChecked(state, value);
            return this;
        }

        public getChecked(): Interfaces.TreeNode[]
        {
            return [...this.Map.values()]
                .filter(state => state.checked)
                .map(state => state.node);
        }

        public search(query: string): this
        {
            this.query$.Set(String(query ?? '').toLowerCase().trim());
            this.Bump();
            return this;
        }

        public clearSearch(): this { return this.search(''); }

        public isSearchable(): boolean { return this.searchable; }
        public searchValue(): string { return this.query$.Get(); }
        public showCheckboxes(): boolean { return this.checkboxes; }
        public showIcons(): boolean { return this.icons; }
        public showBadges(): boolean { return this.badges; }
        public indentPx(): number { return Math.max(0, parseInt(this.getAttribute('indent') ?? '20', 10) || 20); }
        public rowHeightPx(): number { return Math.max(22, parseInt(this.getAttribute('row-height') ?? '32', 10) || 32); }
        public isDraggable(): boolean { return this.draggable; }

        public rows(): FlatRow[]
        {
            void this.tick$.Get();

            const query = this.query$.Get();
            const output: FlatRow[] = [];

            const walk = (states: NodeState[]): void =>
            {
                for(const state of states)
                {
                    const matches = !query || this.NodeMatchesQuery(state, query);
                    state.visible = matches;
                    if(!matches) continue;

                    const hasChildren =
                        state.children.length > 0 ||
                        (state.node.children?.length ?? 0) > 0 ||
                        Boolean(state.node.lazy);

                    output.push({
                        state,
                        hasChildren,
                        arrow:
                            hasChildren
                                ? state.loading
                                    ? '⟳'
                                    : state.expanded
                                        ? '▾'
                                        : '▸'
                                : ''
                    });

                    if(state.children.length && (state.expanded || Boolean(query))) walk(state.children);
                }
            };

            walk(this.roots$.Get());
            return output;
        }

        public onArrowClick(row: FlatRow, event: Event): void
        {
            event.stopPropagation();
            if(!row.hasChildren) return;
            row.state.expanded ? this.CollapseState(row.state) : this.ExpandState(row.state);
        }

        public onCheckChange(row: FlatRow, event: Event): void
        {
            event.stopPropagation();
            this.SetChecked(row.state, Boolean((event.target as HTMLInputElement).checked));
        }

        public onRowClick(row: FlatRow): void
        {
            this._focus = row.state;

            if(row.state.node.selectable !== false && this.selectable !== 'none')
            {
                if(this.selectable === 'single')
                {
                    const alreadySelected = row.state.selected;
                    this.ClearSelection();
                    this.SetSelected(row.state, !alreadySelected);
                }
                else
                {
                    this.SetSelected(row.state, !row.state.selected);
                }

                this.dispatchEvent(new CustomEvent('arianna:select', {
                    bubbles: true,
                    detail: { node: row.state.node, selected: row.state.selected }
                }));
            }

            if(this.expandOnSelect && row.hasChildren)
                row.state.expanded ? this.CollapseState(row.state) : this.ExpandState(row.state);
            else
                this.Bump();
        }

        public onSearchInput(event: Event): void
        {
            this.search((event.target as HTMLInputElement).value);
        }

        public onDragStart(row: FlatRow, event: DragEvent): void
        {
            event.dataTransfer?.setData('text/plain', row.state.node.id);
            if(event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
        }

        public onDragOver(event: DragEvent): void
        {
            event.preventDefault();
            if(event.dataTransfer) event.dataTransfer.dropEffect = 'move';
        }

        public onDrop(row: FlatRow, event: DragEvent): void
        {
            event.preventDefault();
            const sourceId = event.dataTransfer?.getData('text/plain');

            if(sourceId && sourceId !== row.state.node.id)
            {
                this.dispatchEvent(new CustomEvent('arianna:drop', {
                    bubbles: true,
                    detail: { sourceId, targetId: row.state.node.id }
                }));
            }
        }

        private Render(): void
        {
            if(this._rendering) return;
            this._rendering = true;

            try
            {
                const nodes: Node[] = [];

                if(this.searchable)
                {
                    const search = document.createElement('input');
                    search.className = 'TreeView-Search';
                    search.type = 'search';
                    search.placeholder = 'Search…';
                    search.value = this.searchValue();
                    search.setAttribute('aria-label', 'Search tree');
                    search.addEventListener('input', event => this.onSearchInput(event));
                    search.addEventListener('keydown', event => event.stopPropagation());
                    nodes.push(search);
                }

                const list = document.createElement('ul');
                list.className = 'TreeView-List';
                list.setAttribute('role', 'group');

                for(const row of this.rows())
                {
                    const state = row.state;
                    const item = document.createElement('li');
                    item.className = 'TreeView-Node';
                    item.dataset.id = state.node.id;
                    item.setAttribute('role', 'treeitem');
                    item.setAttribute('aria-level', String(state.depth + 1));
                    item.setAttribute('aria-selected', String(state.selected));
                    if(row.hasChildren) item.setAttribute('aria-expanded', String(state.expanded));
                    item.draggable = this.draggable;

                    const line = document.createElement('div');
                    line.className =
                        'TreeView-Row' +
                        (state.selected ? ' TreeView-Row-Active' : '') +
                        (state === this._focus ? ' TreeView-Row-Focus' : '');
                    line.style.paddingLeft = `${state.depth * this.indentPx() + 8}px`;
                    line.style.height = `${this.rowHeightPx()}px`;
                    line.addEventListener('click', () => this.onRowClick(row));

                    const arrow = document.createElement('span');
                    arrow.className = 'TreeView-Arrow' + (state.loading ? ' TreeView-Loading' : '');
                    arrow.textContent = row.arrow;
                    arrow.setAttribute('aria-hidden', 'true');
                    arrow.addEventListener('click', event => this.onArrowClick(row, event));
                    line.append(arrow);

                    if(this.checkboxes)
                    {
                        const checkbox = document.createElement('input');
                        checkbox.className = 'TreeView-Checkbox';
                        checkbox.type = 'checkbox';
                        checkbox.checked = state.checked;
                        checkbox.setAttribute('aria-label', `Check ${state.node.label}`);
                        checkbox.addEventListener('change', event => this.onCheckChange(row, event));
                        checkbox.addEventListener('click', event => event.stopPropagation());
                        line.append(checkbox);
                    }

                    if(this.icons && state.node.icon)
                    {
                        const icon = document.createElement('span');
                        icon.className = 'TreeView-Icon';
                        icon.textContent = state.node.icon;
                        icon.setAttribute('aria-hidden', 'true');
                        line.append(icon);
                    }

                    const label = document.createElement('span');
                    label.className = 'TreeView-Label';
                    label.textContent = state.node.label;
                    line.append(label);

                    if(this.badges && state.node.badge !== undefined)
                    {
                        const badge = document.createElement('span');
                        badge.className = 'TreeView-Badge';
                        badge.textContent = String(state.node.badge);
                        line.append(badge);
                    }

                    item.addEventListener('dragstart', event => this.onDragStart(row, event));
                    item.addEventListener('dragover', event => this.onDragOver(event));
                    item.addEventListener('drop', event => this.onDrop(row, event));
                    item.append(line);
                    list.append(item);
                }

                nodes.push(list);
                this.replaceChildren(...nodes);
            }
            finally
            {
                this._rendering = false;
            }
        }

        private InstallKeyboard(): void
        {
            if(this._keyHandler) return;

            this._keyHandler = (event: KeyboardEvent): void =>
            {
                if(!this.keyboard) return;
                if(event.target instanceof HTMLInputElement) return;

                const rows = this.rows();
                if(!rows.length) return;

                let index = this._focus
                    ? rows.findIndex(row => row.state === this._focus)
                    : -1;

                switch(event.key)
                {
                    case 'ArrowDown':
                    {
                        event.preventDefault();
                        index = Math.min(rows.length - 1, index + 1);
                        this._focus = rows[index < 0 ? 0 : index].state;
                        this.Bump();
                        break;
                    }

                    case 'ArrowUp':
                    {
                        event.preventDefault();
                        index = index < 0 ? 0 : Math.max(0, index - 1);
                        this._focus = rows[index].state;
                        this.Bump();
                        break;
                    }

                    case 'Home':
                        event.preventDefault();
                        this._focus = rows[0].state;
                        this.Bump();
                        break;

                    case 'End':
                        event.preventDefault();
                        this._focus = rows[rows.length - 1].state;
                        this.Bump();
                        break;

                    case 'ArrowRight':
                        event.preventDefault();
                        if(this._focus && !this._focus.expanded) this.ExpandState(this._focus);
                        break;

                    case 'ArrowLeft':
                        event.preventDefault();
                        if(this._focus?.expanded) this.CollapseState(this._focus);
                        else if(this._focus?.parent)
                        {
                            this._focus = this._focus.parent;
                            this.Bump();
                        }
                        break;

                    case 'Enter':
                    case ' ':
                    {
                        event.preventDefault();
                        if(!this._focus || this._focus.node.selectable === false || this.selectable === 'none') break;

                        if(this.selectable === 'single')
                        {
                            const alreadySelected = this._focus.selected;
                            this.ClearSelection();
                            this.SetSelected(this._focus, !alreadySelected);
                        }
                        else
                        {
                            this.SetSelected(this._focus, !this._focus.selected);
                        }

                        this.dispatchEvent(new CustomEvent('arianna:select', {
                            bubbles: true,
                            detail: { node: this._focus.node, selected: this._focus.selected }
                        }));
                        break;
                    }
                }
            };

            this.addEventListener('keydown', this._keyHandler);
        }

        private MakeState
        (
            node: Interfaces.TreeNode,
            parent: NodeState | null,
            depth: number
        ): NodeState
        {
            const state: NodeState = {
                node,
                expanded: node.expanded ?? false,
                selected: node.selected ?? false,
                checked: node.checked ?? false,
                loading: false,
                loaded: !node.lazy || Boolean(node.children),
                depth,
                parent,
                children: [],
                visible: true
            };

            this.Map.set(node.id, state);

            if(node.children)
                state.children = node.children.map(child => this.MakeState(child, state, depth + 1));

            return state;
        }

        private ExpandState(state: NodeState): void
        {
            if(state.node.lazy && !state.loaded)
            {
                state.loading = true;
                this.Bump();
                let resolved = false;

                const resolve = (children: Interfaces.TreeNode[]): void =>
                {
                    if(resolved) return;
                    resolved = true;

                    state.children = (Array.isArray(children) ? children : [])
                        .map(child => this.MakeState(child, state, state.depth + 1));
                    state.node.children = Array.isArray(children) ? children : [];
                    state.loaded = true;
                    state.loading = false;
                    state.expanded = true;
                    this.Bump();

                    this.dispatchEvent(new CustomEvent('arianna:expand', {
                        bubbles: true,
                        detail: { node: state.node }
                    }));
                };

                this.dispatchEvent(new CustomEvent('arianna:load', {
                    bubbles: true,
                    detail: { node: state.node, resolve }
                }));
                return;
            }

            state.expanded = true;
            state.node.expanded = true;
            this.Bump();

            this.dispatchEvent(new CustomEvent('arianna:expand', {
                bubbles: true,
                detail: { node: state.node }
            }));
        }

        private CollapseState(state: NodeState): void
        {
            state.expanded = false;
            state.node.expanded = false;
            this.Bump();

            this.dispatchEvent(new CustomEvent('arianna:collapse', {
                bubbles: true,
                detail: { node: state.node }
            }));
        }

        private ClearSelection(): void
        {
            for(const state of this.Map.values())
            {
                state.selected = false;
                state.node.selected = false;
            }
        }

        private SetSelected(state: NodeState, value: boolean): void
        {
            state.selected = value;
            state.node.selected = value;
            this.Bump();
        }

        private SetChecked(state: NodeState, value: boolean): void
        {
            const apply = (current: NodeState): void =>
            {
                current.checked = value;
                current.node.checked = value;
                current.children.forEach(apply);
            };

            apply(state);

            let parent = state.parent;
            while(parent)
            {
                const checked = parent.children.length > 0 && parent.children.every(child => child.checked);
                parent.checked = checked;
                parent.node.checked = checked;
                parent = parent.parent;
            }

            this.Bump();

            this.dispatchEvent(new CustomEvent('arianna:check', {
                bubbles: true,
                detail: { node: state.node, checked: value }
            }));
        }

        private NodeMatchesQuery(state: NodeState, query: string): boolean
        {
            if(state.node.label.toLowerCase().includes(query)) return true;
            return state.children.some(child => this.NodeMatchesQuery(child, query));
        }

        private Bump(): void
        {
            this.tick$.Set(this.tick$.Get() + 1);
            if(this.isConnected) this.Render();
        }

        public static DefaultSheet(): Types.Stylesheet
        {
            return Styles;
        }
    }
}

export type TreeNode = TreeView.Interfaces.TreeNode;
export type TreeViewOptions = TreeView.Interfaces.TreeViewOptions;
export default TreeView.TreeView;
