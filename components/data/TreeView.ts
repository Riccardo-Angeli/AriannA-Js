/**
 * @module    components/data/TreeView
 * @author    Riccardo Angeli
 * @version   2.0.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license   MIT / Commercial (dual license)
 *
 * @description AriannA TreeView component module.
 */

import { Component, Css, Reactivity, Templates } from '../../core/index.ts';
import type { Interfaces as SchemaInterfaces } from '../../core/definitions/Interfaces.ts';

/** @namespace   TreeView
 *  @public
 *  @description Namespace containing TreeView contracts and implementation.
 *  @author      Riccardo Angeli
 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
 *  @license     MIT / Commercial (dual license) */
export namespace TreeView
{
    /** @namespace   Interfaces
     *  @public
     *  @description Namespace containing Interfaces contracts and implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export namespace Interfaces
    {
        /** @interface   TreeNodeContract
         *  @public
         *  @description TreeNodeContract contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface TreeNodeContract extends TreeNode
        {
        }

        /** @interface   Options
         *  @public
         *  @description Options contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface Options extends TreeViewOptions
        {
        }

        /** @interface   NodeStateContract
         *  @public
         *  @description NodeStateContract contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface NodeStateContract extends NodeState
        {
        }

        /** @interface   FlatRowContract
         *  @public
         *  @description FlatRowContract contract for this component.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        export interface FlatRowContract extends FlatRow
        {
        }
    }

    /** @name        html
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned html value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const html = Templates.Template.Html;

    /**
     * @convention AriannA component namespace merge
     * Types: <Component>.Types · Interfaces: <Component>.Interfaces · helpers: <Component>.*
     */
    /**
     * @module    components/data/TreeView
     * @author    Riccardo Angeli
     * @copyright Riccardo Angeli 2012-2026
     * @license   MIT / Commercial (dual license)
     *
     * TreeView — hierarchical tree control with expand/collapse, single/multi
     * selection, checkboxes, badges, lazy children loading, search filter,
     * drag-and-drop, and keyboard navigation (arrow keys + Enter).
     *
     * @example JS
     *   const tree = new TreeView();
     *   tree.selectable = 'single';
     *   tree.nodes = [
     *     { id: '1', label: 'Root', children: [
     *       { id: '1.1', label: 'Child A', icon: '📄' },
     *       { id: '1.2', label: 'Child B', lazy: true },
     *     ]},
     *   ];
     *   tree.addEventListener('arianna:select', e => console.log(e.detail.node));
     *   tree.addEventListener('arianna:load',   e => fetchChildren(e.detail.node).then(e.detail.resolve));
     *   tree.addEventListener('arianna:drop',   e => move(e.detail.sourceId, e.detail.targetId));
     *
     * @example HTML
     *   <arianna-tree-view selectable="multi" checkboxes searchable draggable></arianna-tree-view>
     *
     * Events:
     *   - arianna:select   detail: { node, selected }
     *   - arianna:expand   detail: { node }
     *   - arianna:collapse detail: { node }
     *   - arianna:check    detail: { node, checked }
     *   - arianna:load     detail: { node, resolve(children) }   (lazy nodes)
     *   - arianna:drop     detail: { sourceId, targetId }
     *
     * Slots:  (none)
     *
     * Attributes:
     *   selectable ('none' | 'single' | 'multi'), checkboxes, icons, badges,
     *   indent, row-height, draggable, keyboard, expand-on-select, searchable,
     *   class
     */
    /* Reactive.ts replaced Observables, and it is not a rename: the factory is `CreateSignal`, the
       members went PascalCase (`Get` / `Set`), and `CreateEffect` returns an Effect OBJECT where the old
       `effect` returned its own disposer — hence the wrapper. The type alias points at the CONTRACT and
       not at `Reactivity.Signal`, which is the richer class the module also exports: `CreateSignal`
       returns the contract, so aliasing the class yields "Type 'SchemaInterfaces.Reactivity.Signal<T>' is missing … Source, Mutate,
       Map, Effect" with the same name printed twice. */
    const signal = Reactivity.CreateSignal;

    /** @name        { Rule, Stylesheet }
     *  @public
     *  @type        {inferred}
     *  @description Namespace-owned { Rule, Stylesheet } value.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    const { Rule, Stylesheet } = Css;

    /** @interface   TreeNode
     *  @public
     *  @description TreeNode contract for this component.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface TreeNode
    {
        /** @name        id
         *  @public
         *  @type        {string}
         *  @description Component member for id.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        id: string;

        /** @name        label
         *  @public
         *  @type        {string}
         *  @description Component member for label.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        label: string;

        /** @name        icon
         *  @public
         *  @type        {string}
         *  @description Component member for icon.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        icon?: string;

        /** @name        badge
         *  @public
         *  @type        {string | number}
         *  @description Component member for badge.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        badge?: string | number;

        /** @name        children
         *  @public
         *  @type        {TreeNode[]}
         *  @description Component member for children.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        children?: TreeNode[];

        /** @name        lazy
         *  @public
         *  @type        {boolean}
         *  @description Component member for lazy.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        lazy?: boolean;

        /** @name        expanded
         *  @public
         *  @type        {boolean}
         *  @description Component member for expanded.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        expanded?: boolean;

        /** @name        selected
         *  @public
         *  @type        {boolean}
         *  @description Component member for selected.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        selected?: boolean;

        /** @name        checked
         *  @public
         *  @type        {boolean}
         *  @description Component member for checked.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        checked?: boolean;

        /** @name        selectable
         *  @public
         *  @type        {boolean}
         *  @description Component member for selectable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        selectable?: boolean;

        /** @name        data
         *  @public
         *  @type        {unknown}
         *  @description Component member for data.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        data?: unknown;

        /** @name        class
         *  @public
         *  @type        {string}
         *  @description Component member for class.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        class?: string;
    }

    /** @interface   TreeViewOptions
     *  @public
     *  @description TreeViewOptions contract for this component.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    export interface TreeViewOptions
    {
        /** @name        nodes
         *  @public
         *  @type        {TreeNode[]}
         *  @description Component member for nodes.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        nodes?: TreeNode[];

        /** @name        selectable
         *  @public
         *  @type        {'none' | 'single' | 'multi'}
         *  @description Component member for selectable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        selectable?: 'none' | 'single' | 'multi';

        /** @name        checkboxes
         *  @public
         *  @type        {boolean}
         *  @description Component member for checkboxes.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        checkboxes?: boolean;

        /** @name        icons
         *  @public
         *  @type        {boolean}
         *  @description Component member for icons.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        icons?: boolean;

        /** @name        badges
         *  @public
         *  @type        {boolean}
         *  @description Component member for badges.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        badges?: boolean;

        /** @name        indent
         *  @public
         *  @type        {number}
         *  @description Component member for indent.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        indent?: number;

        /** @name        rowHeight
         *  @public
         *  @type        {number}
         *  @description Component member for row Height.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        rowHeight?: number;

        /** @name        draggable
         *  @public
         *  @type        {boolean}
         *  @description Component member for draggable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        draggable?: boolean;

        /** @name        keyboard
         *  @public
         *  @type        {boolean}
         *  @description Component member for keyboard.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        keyboard?: boolean;

        /** @name        expandOnSelect
         *  @public
         *  @type        {boolean}
         *  @description Component member for expand On Select.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        expandOnSelect?: boolean;

        /** @name        searchable
         *  @public
         *  @type        {boolean}
         *  @description Component member for searchable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        searchable?: boolean;
    }

    /** Internal node state record (the "NS" of legacy). */
    interface NodeState
    {
        /** @name        node
         *  @public
         *  @type        {TreeNode}
         *  @description Component member for node.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        node: TreeNode;

        /** @name        expanded
         *  @public
         *  @type        {boolean}
         *  @description Component member for expanded.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        expanded: boolean;

        /** @name        selected
         *  @public
         *  @type        {boolean}
         *  @description Component member for selected.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        selected: boolean;

        /** @name        checked
         *  @public
         *  @type        {boolean}
         *  @description Component member for checked.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        checked: boolean;

        /** @name        loading
         *  @public
         *  @type        {boolean}
         *  @description Component member for loading.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        loading: boolean;

        /** @name        loaded
         *  @public
         *  @type        {boolean}
         *  @description Component member for loaded.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        loaded: boolean;

        /** @name        depth
         *  @public
         *  @type        {number}
         *  @description Component member for depth.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        depth: number;

        /** @name        parent
         *  @public
         *  @type        {NodeState | null}
         *  @description Component member for parent.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        parent: NodeState | null;

        /** @name        children
         *  @public
         *  @type        {NodeState[]}
         *  @description Component member for children.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        children: NodeState[];

        /** @name        visible
         *  @public
         *  @type        {boolean}
         *  @description Component member for visible.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        visible: boolean;
    }

    /** Flattened row used for rendering. */
    interface FlatRow
    {
        /** @name        state
         *  @public
         *  @type        {NodeState}
         *  @description Component member for state.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        state: NodeState;

        /** @name        hasChildren
         *  @public
         *  @type        {boolean}
         *  @description Component member for has Children.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        hasChildren: boolean;

        /** @name        arrow
         *  @public
         *  @type        {string}
         *  @description Component member for arrow.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        arrow: string;

        /** @name        rowCls
         *  @public
         *  @type        {string}
         *  @description Component member for row Cls.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        rowCls: string;

        /** @name        rowStyle
         *  @public
         *  @type        {string}
         *  @description Component member for row Style.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        rowStyle: string;

        /** @name        indentPx
         *  @public
         *  @type        {number}
         *  @description Component member for indent Px.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        indentPx: number;
    }

    /** @class       TreeView
     *  @public
     *  @description AriannA TreeView component implementation.
     *  @author      Riccardo Angeli
     *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
     *  @license     MIT / Commercial (dual license) */
    @Component('arianna-tree-view', {}, {
        Attributes: [
            'selectable', 'checkboxes', 'icons', 'badges',
            'indent', 'row-height', 'draggable', 'keyboard',
            'expand-on-select', 'searchable',
        ],
    })
    export class TreeView extends HTMLElement
    {
        /** Compiler-visible AriannA template slot installed by @Component. */
        declare template: unknown;

        /** @name        roots$
         *  @public
         *  @type        {SchemaInterfaces.Reactivity.Signal<NodeState[]>}
         *  @description Component member for roots$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        roots$: SchemaInterfaces.Reactivity.Signal<NodeState[]> = signal<NodeState[]>([]);

        /** @name        query$
         *  @public
         *  @type        {SchemaInterfaces.Reactivity.Signal<string>}
         *  @description Component member for query$.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        query$: SchemaInterfaces.Reactivity.Signal<string> = signal<string>('');

        /** Bump to force a re-render after internal NodeState mutation. */
        tick$: SchemaInterfaces.Reactivity.Signal<number> = signal<number>(0);

        /** @name        #map
         *  @public
         *  @type        {unknown}
         *  @description Component member for map.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #map = new Map<string, NodeState>();

        /** @name        #focus
         *  @public
         *  @type        {NodeState | null}
         *  @description Component member for focus.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #focus: NodeState | null = null;

        /** @name        onConnected
         *  @public
         *  @type        {void}
         *  @description Component member for on Connected.
         *  @param       {TreeViewOptions} _opts Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onConnected(_opts: TreeViewOptions = {})
        {
            this.setAttribute('role', 'tree');
            this.tabIndex = 0;
            this.isSearchable = () => this.getAttribute('searchable') !== 'false';
            this.searchValue = () => this.query$.Get();
            this.showCheckboxes = () => this.hasAttribute('checkboxes');
            this.showIcons = () => this.getAttribute('icons') !== 'false';
            this.showBadges = () => this.getAttribute('badges') !== 'false';
            this.indentPx = () => parseInt(this.getAttribute('indent') ?? '20', 10) || 20;
            this.rowHeightPx = () => parseInt(this.getAttribute('row-height') ?? '32', 10) || 32;
            this.isDraggable = () => this.hasAttribute('draggable');
            this.rows = (): FlatRow[] => {
                // Tick$ read forces re-render when internal mutation calls bump().
                void this.tick$.Get();

                /** @name        q
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned q value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const q = this.query$.Get();

                /** @name        out
                 *  @public
                 *  @type        {FlatRow[]}
                 *  @description Namespace-owned out value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const out: FlatRow[] = [];

                /** @name        walk
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned walk value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const walk = (states: NodeState[]) => {
                    for (const s of states)
                    {
                        // Filter: show if matches OR has a descendant that matches.
                        if (q)
                        {
                            s.visible = this.#nodeMatchesQuery(s, q);
                        }
                        else
                        {
                            s.visible = true;
                        }
                        if (!s.visible)
                            continue;

                        /** @name        hasChildren
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned hasChildren value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const hasChildren = (s.node.children?.length ?? 0) > 0 || !!s.node.lazy;
                        out.push({
                            state: s,
                            hasChildren,
                            arrow: hasChildren ? (s.loading ? '⟳' : (s.expanded ? '▾' : '▸')) : '',
                            rowCls: 'ar-tree__row' + (s.selected ? ' ar-tree__row--on' : ''),
                            rowStyle: `padding-left: ${s.depth * this.indentPx() + 8}px; height: ${this.rowHeightPx()}px`,
                            indentPx: s.depth * this.indentPx() + 8,
                        });
                        if (s.expanded && s.children.length)
                            walk(s.children);
                    }
                };
                walk(this.roots$.Get());
                return out;
            };
            // Event handlers (set before template registration)
            this.onArrowClick = (r: FlatRow, e: Event) => {
                e.stopPropagation();
                if (!r.hasChildren)
                    return;
                if (r.state.expanded)
                    this.#collapse(r.state);
                else
                    this.#expand(r.state);
            };
            this.onCheckChange = (r: FlatRow, e: Event) => {
                e.stopPropagation();
                this.#setChecked(r.state, (e.target as HTMLInputElement).checked);
            };
            this.onRowClick = (r: FlatRow) => {
                if (r.state.node.selectable === false)
                    return;

                /** @name        mode
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned mode value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const mode = (this.getAttribute('selectable') ?? 'single') as 'none' | 'single' | 'multi';
                if (mode === 'none')
                    return;
                if (mode === 'single')
                    this.#clearSel();
                this.#setSel(r.state, !r.state.selected);
                this.#focus = r.state;
                if (this.hasAttribute('expand-on-select') && r.hasChildren)
                {
                    if (r.state.expanded)
                        this.#collapse(r.state);
                    else
                        this.#expand(r.state);
                }
                this.dispatchEvent(new CustomEvent('arianna:select', {
                    bubbles: true, detail: { node: r.state.node, selected: r.state.selected },
                }));
            };
            this.onSearchInput = (e: Event) => {
                this.query$.Set((e.target as HTMLInputElement).value.toLowerCase().trim());
            };
            // Drag & drop handlers — attached only when draggable attr is set
            this.onDragStart = (r: FlatRow, e: Event) => {
                (e as DragEvent).dataTransfer?.setData('text/plain', r.state.node.id);
            };
            this.onDragOver = (e: Event) => { e.preventDefault(); };
            this.onDrop = (r: FlatRow, e: Event) => {
                e.preventDefault();

                /** @name        src
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned src value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const src = (e as DragEvent).dataTransfer?.getData('text/plain');
                if (src && src !== r.state.node.id)
                {
                    this.dispatchEvent(new CustomEvent('arianna:drop', {
                        bubbles: true, detail: { sourceId: src, targetId: r.state.node.id },
                    }));
                }
            };
            // Keyboard navigation
            this.addEventListener('keydown', (ev: Event) => {
                /** @name        e
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned e value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const e = ev as KeyboardEvent;
                if (this.getAttribute('keyboard') === 'false')
                    return;

                /** @name        flat
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned flat value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const flat = this.rows();

                /** @name        idx
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned idx value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const idx = this.#focus ? flat.findIndex(r => r.state === this.#focus) : -1;
                switch (e.key)
                {
                    case 'ArrowDown': {
                        e.preventDefault();

                        /** @name        n
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned n value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const n = flat[idx + 1];
                        if (n)
                            this.#focus = n.state;
                        this.#bump();
                        break;
                    }
                    case 'ArrowUp': {
                        e.preventDefault();

                        /** @name        n
                         *  @public
                         *  @type        {inferred}
                         *  @description Namespace-owned n value.
                         *  @author      Riccardo Angeli
                         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                         *  @license     MIT / Commercial (dual license) */
                        const n = flat[idx - 1];
                        if (n)
                            this.#focus = n.state;
                        this.#bump();
                        break;
                    }
                    case 'ArrowRight': {
                        e.preventDefault();
                        if (this.#focus && !this.#focus.expanded)
                            this.#expand(this.#focus);
                        break;
                    }
                    case 'ArrowLeft': {
                        e.preventDefault();
                        if (this.#focus?.expanded)
                            this.#collapse(this.#focus);
                        else if (this.#focus?.parent)
                        {
                            this.#focus = this.#focus.parent;
                            this.#bump();
                        }
                        break;
                    }
                    case 'Enter':
                    case ' ': {
                        e.preventDefault();
                        if (this.#focus)
                        {
                            /** @name        mode
                             *  @public
                             *  @type        {inferred}
                             *  @description Namespace-owned mode value.
                             *  @author      Riccardo Angeli
                             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                             *  @license     MIT / Commercial (dual license) */
                            const mode = (this.getAttribute('selectable') ?? 'single') as 'none' | 'single' | 'multi';
                            if (mode !== 'none')
                            {
                                if (mode === 'single')
                                    this.#clearSel();
                                this.#setSel(this.#focus, !this.#focus.selected);
                                this.dispatchEvent(new CustomEvent('arianna:select', {
                                    bubbles: true,
                                    detail: { node: this.#focus.node, selected: this.#focus.selected },
                                }));
                            }
                        }
                        break;
                    }
                }
            });
            this.template = html `
            <input class="ar-tree__search"
                   a-if="this.isSearchable()"
                   type="text"
                   placeholder="Search…"
                   :value="this.searchValue()"
                   @input="this.onSearchInput"/>
            <ul class="ar-tree__list" role="group">
                <li class="ar-tree__node"
                    a-for="r in this.rows()"
                    :data-id="r.state.node.id"
                    :draggable="this.isDraggable()"
                    @dragstart="(e) => this.onDragStart(r, e)"
                    @dragover="this.onDragOver"
                    @drop="(e) => this.onDrop(r, e)">
                    <div :class="r.rowCls"
                         :style="r.rowStyle"
                         @click="(e) => this.onRowClick(r)">
                        <span class="ar-tree__arrow"
                              @click="(e) => this.onArrowClick(r, e)">{{ r.arrow }}</span>
                        <input class="ar-tree__cb"
                               a-if="this.showCheckboxes()"
                               type="checkbox"
                               :checked="r.state.checked"
                               @change="(e) => this.onCheckChange(r, e)"
                               @click="(e) => e.stopPropagation()"/>
                        <span class="ar-tree__icon"
                              a-if="this.showIcons() && r.state.node.icon">{{ r.state.node.icon }}</span>
                        <span class="ar-tree__label">{{ r.state.node.label }}</span>
                        <span class="ar-tree__badge"
                              a-if="this.showBadges() && r.state.node.badge !== undefined">{{ r.state.node.badge }}</span>
                    </div>
                </li>
            </ul>
        `;
            (this as unknown as {
                /** @name        Sheet
                 *  @public
                 *  @type        {Stylesheet | null}
                 *  @description Component member for Sheet.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                Sheet: Css.Stylesheet | null;
            }).Sheet = TreeView.DefaultSheet();
        }
        // ── Public API ───────────────────────────────────────────────────────────
        /** @name        nodes
         *  @public
         *  @type        {void}
         *  @description Component member for nodes.
         *  @param       {TreeNode[]} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set nodes(v: TreeNode[])
        {
            this.#map.clear();

            /** @name        states
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned states value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const states = (v ?? []).map(n => this.#makeState(n, null, 0));
            this.roots$.Set(states);
        }

        /** @name        nodes
         *  @public
         *  @type        {TreeNode[]}
         *  @description Component member for nodes.
         *  @returns     {TreeNode[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get nodes(): TreeNode[] { return this.roots$.Get().map((s: any) => s.node); }

        /** @name        expand
         *  @public
         *  @type        {this}
         *  @description Component member for expand.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        expand(id: string): this
        {
            /** @name        s
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s = this.#map.get(id);
            if (s && !s.expanded)
                this.#expand(s);
            return this;
        }

        /** @name        collapse
         *  @public
         *  @type        {this}
         *  @description Component member for collapse.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        collapse(id: string): this
        {
            /** @name        s
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s = this.#map.get(id);
            if (s && s.expanded)
                this.#collapse(s);
            return this;
        }

        /** @name        expandAll
         *  @public
         *  @type        {this}
         *  @description Component member for expand All.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        expandAll(): this
        {
            this.#map.forEach(s => {
                if (!s.expanded)
                    this.#expand(s);
            });
            return this;
        }

        /** @name        collapseAll
         *  @public
         *  @type        {this}
         *  @description Component member for collapse All.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        collapseAll(): this
        {
            this.#map.forEach(s => {
                if (s.expanded)
                    this.#collapse(s);
            });
            return this;
        }

        /** @name        select
         *  @public
         *  @type        {this}
         *  @description Component member for select.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        select(id: string): this
        {
            /** @name        s
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s = this.#map.get(id);
            if (!s || s.node.selectable === false)
                return this;
            if ((this.getAttribute('selectable') ?? 'single') === 'single')
                this.#clearSel();
            this.#setSel(s, true);
            return this;
        }

        /** @name        deselect
         *  @public
         *  @type        {this}
         *  @description Component member for deselect.
         *  @param       {string} id Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        deselect(id: string): this
        {
            /** @name        s
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s = this.#map.get(id);
            if (s)
                this.#setSel(s, false);
            return this;
        }

        /** @name        getSelected
         *  @public
         *  @type        {TreeNode[]}
         *  @description Component member for get Selected.
         *  @returns     {TreeNode[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getSelected(): TreeNode[] { return [...this.#map.values()].filter(s => s.selected).map(s => s.node); }

        /** @name        check
         *  @public
         *  @type        {this}
         *  @description Component member for check.
         *  @param       {string} id Parameter.
         *  @param       {unknown} value Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        check(id: string, value = true): this
        {
            /** @name        s
             *  @public
             *  @type        {inferred}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s = this.#map.get(id);
            if (s)
                this.#setChecked(s, value);
            return this;
        }

        /** @name        getChecked
         *  @public
         *  @type        {TreeNode[]}
         *  @description Component member for get Checked.
         *  @returns     {TreeNode[]} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        getChecked(): TreeNode[] { return [...this.#map.values()].filter(s => s.checked).map(s => s.node); }

        /** @name        search
         *  @public
         *  @type        {this}
         *  @description Component member for search.
         *  @param       {string} q Parameter.
         *  @returns     {this} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        search(q: string): this { this.query$.Set(q.toLowerCase().trim()); return this; }
        // ── Internal helpers ─────────────────────────────────────────────────────
        /** @name        #makeState
         *  @public
         *  @type        {NodeState}
         *  @description Component member for make State.
         *  @param       {TreeNode} node Parameter.
         *  @param       {NodeState | null} parent Parameter.
         *  @param       {number} depth Parameter.
         *  @returns     {NodeState} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #makeState(node: TreeNode, parent: NodeState | null, depth: number): NodeState
        {
            /** @name        s
             *  @public
             *  @type        {NodeState}
             *  @description Namespace-owned s value.
             *  @author      Riccardo Angeli
             *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
             *  @license     MIT / Commercial (dual license) */
            const s: NodeState = {
                node,
                expanded: node.expanded ?? false,
                selected: node.selected ?? false,
                checked: node.checked ?? false,
                loading: false,
                loaded: !node.lazy,
                depth,
                parent,
                children: [],
                visible: true,
            };
            this.#map.set(node.id, s);
            if (node.children)
            {
                s.children = node.children.map(c => this.#makeState(c, s, depth + 1));
            }
            return s;
        }

        /** @name        #expand
         *  @public
         *  @type        {void}
         *  @description Component member for expand.
         *  @param       {NodeState} s Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #expand(s: NodeState): void
        {
            if (s.node.lazy && !s.loaded)
            {
                s.loading = true;
                this.#bump();

                /** @name        resolved
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned resolved value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                let resolved = false;

                /** @name        resolve
                 *  @public
                 *  @type        {inferred}
                 *  @description Namespace-owned resolve value.
                 *  @author      Riccardo Angeli
                 *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
                 *  @license     MIT / Commercial (dual license) */
                const resolve = (children: TreeNode[]) => {
                    if (resolved)
                        return;
                    resolved = true;
                    s.children = children.map(c => this.#makeState(c, s, s.depth + 1));
                    s.node.children = children;
                    s.loaded = true;
                    s.loading = false;
                    s.expanded = true;
                    this.#bump();
                    this.dispatchEvent(new CustomEvent('arianna:expand', {
                        bubbles: true, detail: { node: s.node },
                    }));
                };
                this.dispatchEvent(new CustomEvent('arianna:load', {
                    bubbles: true, detail: { node: s.node, resolve },
                }));
                return;
            }
            s.expanded = true;
            this.#bump();
            this.dispatchEvent(new CustomEvent('arianna:expand', {
                bubbles: true, detail: { node: s.node },
            }));
        }

        /** @name        #collapse
         *  @public
         *  @type        {void}
         *  @description Component member for collapse.
         *  @param       {NodeState} s Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #collapse(s: NodeState): void
        {
            s.expanded = false;
            this.#bump();
            this.dispatchEvent(new CustomEvent('arianna:collapse', {
                bubbles: true, detail: { node: s.node },
            }));
        }

        /** @name        #clearSel
         *  @public
         *  @type        {void}
         *  @description Component member for clear Sel.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #clearSel(): void
        {
            this.#map.forEach(s => {
                if (s.selected)
                    s.selected = false;
            });
        }

        /** @name        #setSel
         *  @public
         *  @type        {void}
         *  @description Component member for set Sel.
         *  @param       {NodeState} s Parameter.
         *  @param       {boolean} v Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #setSel(s: NodeState, v: boolean): void
        {
            s.selected = v;
            this.#bump();
        }

        /** @name        #setChecked
         *  @public
         *  @type        {void}
         *  @description Component member for set Checked.
         *  @param       {NodeState} s Parameter.
         *  @param       {boolean} v Parameter.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #setChecked(s: NodeState, v: boolean): void
        {
            s.checked = v;
            s.node.checked = v;
            this.#bump();
            this.dispatchEvent(new CustomEvent('arianna:check', {
                bubbles: true, detail: { node: s.node, checked: v },
            }));
        }

        /** @name        #nodeMatchesQuery
         *  @public
         *  @type        {boolean}
         *  @description Component member for node Matches Query.
         *  @param       {NodeState} s Parameter.
         *  @param       {string} q Parameter.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        #nodeMatchesQuery(s: NodeState, q: string): boolean
        {
            if (s.node.label.toLowerCase().includes(q))
                return true;
            return s.children.some(c => this.#nodeMatchesQuery(c, q));
        }

        /** Bump the tick signal to force a template re-render. */
        #bump(): void { this.tick$.Set(this.tick$.Get() + 1); }

        /** @name        onCreated
         *  @public
         *  @type        {void}
         *  @description Component member for on Created.
         *  @returns     {void} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        onCreated() { }

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
        // ── Attr getters / setters ───────────────────────────────────────────────
        /** @name        selectable
         *  @public
         *  @type        {'none' | 'single' | 'multi'}
         *  @description Component member for selectable.
         *  @returns     {'none' | 'single' | 'multi'} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get selectable(): 'none' | 'single' | 'multi' { return (this.getAttribute('selectable') ?? 'single') as never; }

        /** @name        selectable
         *  @public
         *  @type        {void}
         *  @description Component member for selectable.
         *  @param       {'none' | 'single' | 'multi'} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set selectable(v: 'none' | 'single' | 'multi') { this.setAttribute('selectable', v); }

        /** @name        checkboxes
         *  @public
         *  @type        {boolean}
         *  @description Component member for checkboxes.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get checkboxes(): boolean { return this.hasAttribute('checkboxes'); }

        /** @name        checkboxes
         *  @public
         *  @type        {void}
         *  @description Component member for checkboxes.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set checkboxes(v: boolean) { v ? this.setAttribute('checkboxes', '') : this.removeAttribute('checkboxes'); }

        /** @name        draggable
         *  @public
         *  @type        {boolean}
         *  @description Component member for draggable.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get draggable(): boolean { return this.hasAttribute('draggable'); }

        /** @name        draggable
         *  @public
         *  @type        {void}
         *  @description Component member for draggable.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set draggable(v: boolean) { v ? this.setAttribute('draggable', '') : this.removeAttribute('draggable'); }

        /** @name        searchable
         *  @public
         *  @type        {boolean}
         *  @description Component member for searchable.
         *  @returns     {boolean} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        get searchable(): boolean { return this.getAttribute('searchable') !== 'false'; }

        /** @name        searchable
         *  @public
         *  @type        {void}
         *  @description Component member for searchable.
         *  @param       {boolean} v Parameter.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        set searchable(v: boolean) { this.setAttribute('searchable', v ? 'true' : 'false'); }
        // ── Template helpers (set in build) ──────────────────────────────────────
        /** @name        isSearchable
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Searchable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isSearchable: () => boolean = () => true;

        /** @name        searchValue
         *  @private
         *  @type        {() => string}
         *  @description Component member for search Value.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private searchValue: () => string = () => '';

        /** @name        showCheckboxes
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show Checkboxes.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showCheckboxes: () => boolean = () => false;

        /** @name        showIcons
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show Icons.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showIcons: () => boolean = () => true;

        /** @name        showBadges
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for show Badges.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private showBadges: () => boolean = () => true;

        /** @name        indentPx
         *  @private
         *  @type        {() => number}
         *  @description Component member for indent Px.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private indentPx: () => number = () => 20;

        /** @name        rowHeightPx
         *  @private
         *  @type        {() => number}
         *  @description Component member for row Height Px.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private rowHeightPx: () => number = () => 32;

        /** @name        isDraggable
         *  @private
         *  @type        {() => boolean}
         *  @description Component member for is Draggable.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private isDraggable: () => boolean = () => false;

        /** @name        rows
         *  @private
         *  @type        {() => FlatRow[]}
         *  @description Component member for rows.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private rows: () => FlatRow[] = () => [];

        /** @name        onArrowClick
         *  @private
         *  @type        {(r: FlatRow, e: Event) => void}
         *  @description Component member for on Arrow Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onArrowClick: (r: FlatRow, e: Event) => void = () => { };

        /** @name        onCheckChange
         *  @private
         *  @type        {(r: FlatRow, e: Event) => void}
         *  @description Component member for on Check Change.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onCheckChange: (r: FlatRow, e: Event) => void = () => { };

        /** @name        onRowClick
         *  @private
         *  @type        {(r: FlatRow) => void}
         *  @description Component member for on Row Click.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onRowClick: (r: FlatRow) => void = () => { };

        /** @name        onSearchInput
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Search Input.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onSearchInput: (e: Event) => void = () => { };

        /** @name        onDragStart
         *  @private
         *  @type        {(r: FlatRow, e: Event) => void}
         *  @description Component member for on Drag Start.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onDragStart: (r: FlatRow, e: Event) => void = () => { };

        /** @name        onDragOver
         *  @private
         *  @type        {(e: Event) => void}
         *  @description Component member for on Drag Over.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onDragOver: (e: Event) => void = () => { };

        /** @name        onDrop
         *  @private
         *  @type        {(r: FlatRow, e: Event) => void}
         *  @description Component member for on Drop.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        private onDrop: (r: FlatRow, e: Event) => void = () => { };

        /** @name        DefaultSheet
         *  @public
         *  @static
         *  @type        {Stylesheet}
         *  @description Component member for Default Sheet.
         *  @returns     {Stylesheet} Result.
         *  @author      Riccardo Angeli
         *  @copyright   Riccardo Angeli 2012-2026 All Rights Reserved
         *  @license     MIT / Commercial (dual license) */
        static DefaultSheet(): Css.Stylesheet
        {
            return new Stylesheet([
                new Rule(':host', {
                    background: 'transparent',
                    color: 'var(--arianna-text, #1f2328)',
                    display: 'block',
                    fontSize: '0.82rem',
                    outline: 'none',
                    overflowY: 'auto',
                    userSelect: 'none',
                }),
                new Rule('.ar-tree__search', {
                    background: 'var(--arianna-bg, #ffffff)',
                    border: '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    boxSizing: 'border-box',
                    color: 'var(--arianna-text, #1f2328)',
                    font: 'inherit',
                    fontSize: '0.82rem',
                    margin: '4px 8px',
                    outline: 'none',
                    padding: '4px 8px',
                    width: 'calc(100% - 16px)',
                }),
                new Rule('.ar-tree__search:focus', { borderColor: 'var(--arianna-primary, #1f6feb)' }),
                new Rule('.ar-tree__list', {
                    listStyle: 'none', margin: '0', padding: '0',
                }),
                new Rule('.ar-tree__node', { listStyle: 'none' }),
                new Rule('.ar-tree__row', {
                    alignItems: 'center',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '6px',
                    transition: 'background 0.14s ease',
                }),
                new Rule('.ar-tree__row:hover', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
                new Rule('.ar-tree__row--on', {
                    background: 'var(--arianna-primary, #1f6feb)',
                    color: '#ffffff',
                }),
                new Rule('.ar-tree__arrow', {
                    color: 'var(--arianna-muted, #6e6b62)',
                    flexShrink: '0',
                    fontSize: '0.7rem',
                    textAlign: 'center',
                    width: '14px',
                }),
                new Rule('.ar-tree__row--on .ar-tree__arrow', { color: '#ffffff' }),
                new Rule('.ar-tree__cb', { flexShrink: '0', margin: '0' }),
                new Rule('.ar-tree__icon', { flexShrink: '0' }),
                new Rule('.ar-tree__label', {
                    flex: '1',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }),
                new Rule('.ar-tree__badge', {
                    background: 'var(--arianna-warning, #f5a623)',
                    borderRadius: '8px',
                    color: '#000000',
                    flexShrink: '0',
                    fontSize: '0.65rem',
                    padding: '1px 5px',
                }),
            ]);
        }
    }
}
export default TreeView;

export type TreeNode = TreeView.TreeNode;

export type TreeViewOptions = TreeView.TreeViewOptions;
