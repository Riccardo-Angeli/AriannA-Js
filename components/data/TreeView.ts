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
 * Attrs:
 *   selectable ('none' | 'single' | 'multi'), checkboxes, icons, badges,
 *   indent, row-height, draggable, keyboard, expand-on-select, searchable,
 *   class
 */

import { Component } from '../../core/Component.ts';
import { html }      from '../../core/Template.ts';
import { signal }    from '../../core/Observable.ts';
import type { Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule }      from '../../core/Rule.ts';

export interface TreeNode {
    id          : string;
    label       : string;
    icon?       : string;
    badge?      : string | number;
    children?   : TreeNode[];
    lazy?       : boolean;
    expanded?   : boolean;
    selected?   : boolean;
    checked?    : boolean;
    selectable? : boolean;
    data?       : unknown;
    class?      : string;
}

export interface TreeViewOptions {
    nodes?          : TreeNode[];
    selectable?     : 'none' | 'single' | 'multi';
    checkboxes?     : boolean;
    icons?          : boolean;
    badges?         : boolean;
    indent?         : number;
    rowHeight?      : number;
    draggable?      : boolean;
    keyboard?       : boolean;
    expandOnSelect? : boolean;
    searchable?     : boolean;
}

/** Internal node state record (the "NS" of legacy). */
interface NodeState {
    node     : TreeNode;
    expanded : boolean;
    selected : boolean;
    checked  : boolean;
    loading  : boolean;
    loaded   : boolean;
    depth    : number;
    parent   : NodeState | null;
    children : NodeState[];
    visible  : boolean;
}

/** Flattened row used for rendering. */
interface FlatRow {
    state       : NodeState;
    hasChildren : boolean;
    arrow       : string;
    rowCls      : string;
    rowStyle    : string;
    indentPx    : number;
}

export class TreeView extends Component('arianna-tree-view', HTMLElement, {}, {
    attrs : [
        'selectable', 'checkboxes', 'icons', 'badges',
        'indent', 'row-height', 'draggable', 'keyboard',
        'expand-on-select', 'searchable',
    ],
})
{
    roots$  : Signal<NodeState[]>      = signal<NodeState[]>([]);
    query$  : Signal<string>           = signal<string>('');
    /** Bump to force a re-render after internal NodeState mutation. */
    tick$   : Signal<number>           = signal<number>(0);

    #map   = new Map<string, NodeState>();
    #focus : NodeState | null = null;

    build(_opts: TreeViewOptions = {})
    {
        this.setAttribute('role', 'tree');
        this.tabIndex = 0;

        this.isSearchable = () => this.getAttribute('searchable') !== 'false';
        this.searchValue  = () => this.query$.get();
        this.showCheckboxes = () => this.hasAttribute('checkboxes');
        this.showIcons      = () => this.getAttribute('icons')  !== 'false';
        this.showBadges     = () => this.getAttribute('badges') !== 'false';
        this.indentPx       = () => parseInt(this.getAttribute('indent') ?? '20', 10) || 20;
        this.rowHeightPx    = () => parseInt(this.getAttribute('row-height') ?? '32', 10) || 32;
        this.isDraggable    = () => this.hasAttribute('draggable');

        this.rows = (): FlatRow[] => {
            // Tick$ read forces re-render when internal mutation calls bump().
            void this.tick$.get();
            const q = this.query$.get();
            const out: FlatRow[] = [];
            const walk = (states: NodeState[]) => {
                for (const s of states) {
                    // Filter: show if matches OR has a descendant that matches.
                    if (q) {
                        s.visible = this.#nodeMatchesQuery(s, q);
                    } else {
                        s.visible = true;
                    }
                    if (!s.visible) continue;
                    const hasChildren = (s.node.children?.length ?? 0) > 0 || !!s.node.lazy;
                    out.push({
                        state      : s,
                        hasChildren,
                        arrow      : hasChildren ? (s.loading ? '⟳' : (s.expanded ? '▾' : '▸')) : '',
                        rowCls     : 'ar-tree__row' + (s.selected ? ' ar-tree__row--on' : ''),
                        rowStyle   : `padding-left: ${s.depth * this.indentPx() + 8}px; height: ${this.rowHeightPx()}px`,
                        indentPx   : s.depth * this.indentPx() + 8,
                    });
                    if (s.expanded && s.children.length) walk(s.children);
                }
            };
            walk(this.roots$.get());
            return out;
        };

        // Event handlers (set before template registration)
        this.onArrowClick = (r: FlatRow, e: Event) => {
            e.stopPropagation();
            if (!r.hasChildren) return;
            if (r.state.expanded) this.#collapse(r.state);
            else                  this.#expand(r.state);
        };
        this.onCheckChange = (r: FlatRow, e: Event) => {
            e.stopPropagation();
            this.#setChecked(r.state, (e.target as HTMLInputElement).checked);
        };
        this.onRowClick = (r: FlatRow) => {
            if (r.state.node.selectable === false) return;
            const mode = (this.getAttribute('selectable') ?? 'single') as 'none' | 'single' | 'multi';
            if (mode === 'none') return;
            if (mode === 'single') this.#clearSel();
            this.#setSel(r.state, !r.state.selected);
            this.#focus = r.state;
            if (this.hasAttribute('expand-on-select') && r.hasChildren) {
                if (r.state.expanded) this.#collapse(r.state);
                else                  this.#expand(r.state);
            }
            this.dispatchEvent(new CustomEvent('arianna:select', {
                bubbles: true, detail: { node: r.state.node, selected: r.state.selected },
            }));
        };
        this.onSearchInput = (e: Event) => {
            this.query$.set((e.target as HTMLInputElement).value.toLowerCase().trim());
        };

        // Drag & drop handlers — attached only when draggable attr is set
        this.onDragStart = (r: FlatRow, e: Event) => {
            (e as DragEvent).dataTransfer?.setData('text/plain', r.state.node.id);
        };
        this.onDragOver = (e: Event) => { e.preventDefault(); };
        this.onDrop = (r: FlatRow, e: Event) => {
            e.preventDefault();
            const src = (e as DragEvent).dataTransfer?.getData('text/plain');
            if (src && src !== r.state.node.id) {
                this.dispatchEvent(new CustomEvent('arianna:drop', {
                    bubbles: true, detail: { sourceId: src, targetId: r.state.node.id },
                }));
            }
        };

        // Keyboard navigation
        this.addEventListener('keydown', (ev: Event) => {
            const e = ev as KeyboardEvent;
            if (this.getAttribute('keyboard') === 'false') return;
            const flat = this.rows();
            const idx = this.#focus ? flat.findIndex(r => r.state === this.#focus) : -1;
            switch (e.key) {
                case 'ArrowDown': {
                    e.preventDefault();
                    const n = flat[idx + 1];
                    if (n) this.#focus = n.state;
                    this.#bump();
                    break;
                }
                case 'ArrowUp': {
                    e.preventDefault();
                    const n = flat[idx - 1];
                    if (n) this.#focus = n.state;
                    this.#bump();
                    break;
                }
                case 'ArrowRight': {
                    e.preventDefault();
                    if (this.#focus && !this.#focus.expanded) this.#expand(this.#focus);
                    break;
                }
                case 'ArrowLeft': {
                    e.preventDefault();
                    if (this.#focus?.expanded) this.#collapse(this.#focus);
                    else if (this.#focus?.parent) { this.#focus = this.#focus.parent; this.#bump(); }
                    break;
                }
                case 'Enter':
                case ' ': {
                    e.preventDefault();
                    if (this.#focus) {
                        const mode = (this.getAttribute('selectable') ?? 'single') as 'none' | 'single' | 'multi';
                        if (mode !== 'none') {
                            if (mode === 'single') this.#clearSel();
                            this.#setSel(this.#focus, !this.#focus.selected);
                            this.dispatchEvent(new CustomEvent('arianna:select', {
                                bubbles: true,
                                detail : { node: this.#focus.node, selected: this.#focus.selected },
                            }));
                        }
                    }
                    break;
                }
            }
        });

        this.template = html`
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

        (this as unknown as { Sheet: Stylesheet | null }).Sheet = TreeView.DefaultSheet();
    }

    // ── Public API ───────────────────────────────────────────────────────────

    set nodes(v: TreeNode[]) {
        this.#map.clear();
        const states = (v ?? []).map(n => this.#makeState(n, null, 0));
        this.roots$.set(states);
    }
    get nodes(): TreeNode[] { return this.roots$.get().map(s => s.node); }

    expand(id: string): this   { const s = this.#map.get(id); if (s && !s.expanded) this.#expand(s);   return this; }
    collapse(id: string): this { const s = this.#map.get(id); if (s &&  s.expanded) this.#collapse(s); return this; }
    expandAll(): this   { this.#map.forEach(s => { if (!s.expanded) this.#expand(s); });   return this; }
    collapseAll(): this { this.#map.forEach(s => { if ( s.expanded) this.#collapse(s); }); return this; }

    select(id: string): this {
        const s = this.#map.get(id);
        if (!s || s.node.selectable === false) return this;
        if ((this.getAttribute('selectable') ?? 'single') === 'single') this.#clearSel();
        this.#setSel(s, true);
        return this;
    }
    deselect(id: string): this { const s = this.#map.get(id); if (s) this.#setSel(s, false); return this; }
    getSelected(): TreeNode[]  { return [...this.#map.values()].filter(s => s.selected).map(s => s.node); }

    check(id: string, value = true): this { const s = this.#map.get(id); if (s) this.#setChecked(s, value); return this; }
    getChecked(): TreeNode[]              { return [...this.#map.values()].filter(s => s.checked).map(s => s.node); }

    search(q: string): this { this.query$.set(q.toLowerCase().trim()); return this; }

    // ── Internal helpers ─────────────────────────────────────────────────────

    #makeState(node: TreeNode, parent: NodeState | null, depth: number): NodeState {
        const s: NodeState = {
            node,
            expanded : node.expanded ?? false,
            selected : node.selected ?? false,
            checked  : node.checked ?? false,
            loading  : false,
            loaded   : !node.lazy,
            depth,
            parent,
            children : [],
            visible  : true,
        };
        this.#map.set(node.id, s);
        if (node.children) {
            s.children = node.children.map(c => this.#makeState(c, s, depth + 1));
        }
        return s;
    }

    #expand(s: NodeState): void {
        if (s.node.lazy && !s.loaded) {
            s.loading = true;
            this.#bump();
            let resolved = false;
            const resolve = (children: TreeNode[]) => {
                if (resolved) return;
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

    #collapse(s: NodeState): void {
        s.expanded = false;
        this.#bump();
        this.dispatchEvent(new CustomEvent('arianna:collapse', {
            bubbles: true, detail: { node: s.node },
        }));
    }

    #clearSel(): void {
        this.#map.forEach(s => {
            if (s.selected) s.selected = false;
        });
    }

    #setSel(s: NodeState, v: boolean): void {
        s.selected = v;
        this.#bump();
    }

    #setChecked(s: NodeState, v: boolean): void {
        s.checked = v;
        s.node.checked = v;
        this.#bump();
        this.dispatchEvent(new CustomEvent('arianna:check', {
            bubbles: true, detail: { node: s.node, checked: v },
        }));
    }

    #nodeMatchesQuery(s: NodeState, q: string): boolean {
        if (s.node.label.toLowerCase().includes(q)) return true;
        return s.children.some(c => this.#nodeMatchesQuery(c, q));
    }

    /** Bump the tick signal to force a template re-render. */
    #bump(): void { this.tick$.set(this.tick$.get() + 1); }

    onCreated()       {}
    onBeforeMount()   {}
    onMount()         {}
    onBeforeUpdate()  {}
    onUpdate()        {}
    onBeforeUnmount() {}
    onUnmount()       {}

    // ── Attr getters / setters ───────────────────────────────────────────────

    get selectable(): 'none' | 'single' | 'multi'  { return (this.getAttribute('selectable') ?? 'single') as never; }
    set selectable(v: 'none' | 'single' | 'multi') { this.setAttribute('selectable', v); }

    get checkboxes(): boolean  { return this.hasAttribute('checkboxes'); }
    set checkboxes(v: boolean) { v ? this.setAttribute('checkboxes', '') : this.removeAttribute('checkboxes'); }

    get draggable(): boolean  { return this.hasAttribute('draggable'); }
    set draggable(v: boolean) { v ? this.setAttribute('draggable', '') : this.removeAttribute('draggable'); }

    get searchable(): boolean  { return this.getAttribute('searchable') !== 'false'; }
    set searchable(v: boolean) { this.setAttribute('searchable', v ? 'true' : 'false'); }

    // ── Template helpers (set in build) ──────────────────────────────────────

    private isSearchable  : () => boolean = () => true;
    private searchValue   : () => string = () => '';
    private showCheckboxes: () => boolean = () => false;
    private showIcons     : () => boolean = () => true;
    private showBadges    : () => boolean = () => true;
    private indentPx      : () => number = () => 20;
    private rowHeightPx   : () => number = () => 32;
    private isDraggable   : () => boolean = () => false;
    private rows          : () => FlatRow[] = () => [];
    private onArrowClick  : (r: FlatRow, e: Event) => void = () => {};
    private onCheckChange : (r: FlatRow, e: Event) => void = () => {};
    private onRowClick    : (r: FlatRow) => void = () => {};
    private onSearchInput : (e: Event) => void = () => {};
    private onDragStart   : (r: FlatRow, e: Event) => void = () => {};
    private onDragOver    : (e: Event) => void = () => {};
    private onDrop        : (r: FlatRow, e: Event) => void = () => {};

    static DefaultSheet(): Stylesheet
    {
        return new Stylesheet(
[
                new Rule(':host', {
                    background : 'transparent',
                    color      : 'var(--arianna-text, #1f2328)',
                    display    : 'block',
                    fontSize   : '0.82rem',
                    outline    : 'none',
                    overflowY  : 'auto',
                    userSelect : 'none',
                }),
                new Rule('.ar-tree__search', {
                    background  : 'var(--arianna-bg, #ffffff)',
                    border      : '1px solid var(--arianna-border, #d8d8d8)',
                    borderRadius: 'var(--arianna-radius, 6px)',
                    boxSizing   : 'border-box',
                    color       : 'var(--arianna-text, #1f2328)',
                    font        : 'inherit',
                    fontSize    : '0.82rem',
                    margin      : '4px 8px',
                    outline     : 'none',
                    padding     : '4px 8px',
                    width       : 'calc(100% - 16px)',
                }),
                new Rule('.ar-tree__search:focus', { borderColor: 'var(--arianna-primary, #1f6feb)' }),
                new Rule('.ar-tree__list', {
                    listStyle: 'none', margin: '0', padding: '0',
                }),
                new Rule('.ar-tree__node', { listStyle: 'none' }),
                new Rule('.ar-tree__row', {
                    alignItems  : 'center',
                    borderRadius: '4px',
                    boxSizing   : 'border-box',
                    cursor      : 'pointer',
                    display     : 'flex',
                    gap         : '6px',
                    transition  : 'background 0.14s ease',
                }),
                new Rule('.ar-tree__row:hover', { background: 'var(--arianna-bg-3, #f3f3f3)' }),
                new Rule('.ar-tree__row--on', {
                    background: 'var(--arianna-primary, #1f6feb)',
                    color     : '#ffffff',
                }),
                new Rule('.ar-tree__arrow', {
                    color     : 'var(--arianna-muted, #6e6b62)',
                    flexShrink: '0',
                    fontSize  : '0.7rem',
                    textAlign : 'center',
                    width     : '14px',
                }),
                new Rule('.ar-tree__row--on .ar-tree__arrow', { color: '#ffffff' }),
                new Rule('.ar-tree__cb',    { flexShrink: '0', margin: '0' }),
                new Rule('.ar-tree__icon',  { flexShrink: '0' }),
                new Rule('.ar-tree__label', {
                    flex        : '1',
                    overflow    : 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace  : 'nowrap',
                }),
                new Rule('.ar-tree__badge', {
                    background  : 'var(--arianna-warning, #f5a623)',
                    borderRadius: '8px',
                    color       : '#000000',
                    flexShrink  : '0',
                    fontSize    : '0.65rem',
                    padding     : '1px 5px',
                }),
            ]
        );
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'TreeView', { value: TreeView, writable: false, enumerable: false, configurable: false });
}

export default TreeView;
