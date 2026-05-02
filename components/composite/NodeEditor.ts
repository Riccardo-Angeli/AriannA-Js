/**
 * @module    NodeEditor
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 *
 * Generic JSON-schema-driven node-graph editor. Domain-agnostic: works for
 * dataflow, audio routing, AI agent orchestration, video pipelines,
 * server-side workflow composition, etc. Linguaggio-agnostico.
 *
 * Layout: palette (left, draggable items) + canvas (right, free-place nodes).
 * Wires use Manhattan routing (right-angle, Unreal-Blueprint style).
 *
 * @example
 *   const editor = new NodeEditor('#root', {
 *     schemas: [
 *       { type: 'source.timer', name: 'Timer', category: 'Source',
 *         color: '#3b82f6', icon: '⏱',
 *         inputs:  [],
 *         outputs: [{ id: 'tick', type: 'number', label: 'tick' }] },
 *       { type: 'sink.log', name: 'Console', category: 'Sink',
 *         color: '#64748b',
 *         inputs:  [{ id: 'in', type: 'any', label: 'in' }],
 *         outputs: [] },
 *     ],
 *   });
 *
 *   editor.on('graph-change', () => console.log(editor.export()));
 *   editor.on('run-state', s  => console.log('state:', s.state));
 *
 *   // Programmatic graph build
 *   const a = editor.addNode('source.timer', 60, 60);
 *   const b = editor.addNode('sink.log', 320, 60);
 *   editor.addWire(a.id, 'tick', b.id, 'in');
 */

import { Control, type CtrlOptions } from '../core/Control.ts';

// ── Public types ────────────────────────────────────────────────────────────

export interface PortSpec {
    id     : string;
    type   : string;        // free-form: 'number', 'audio', 'json', 'any', custom…
    label? : string;
}

export interface ParamSpec {
    id        : string;
    type      : 'number' | 'string' | 'boolean' | 'enum';
    label?    : string;
    default?  : unknown;
    min?      : number;
    max?      : number;
    options?  : string[];   // for 'enum'
}

export interface NodeSchema {
    type      : string;             // FQN, e.g. 'audio.filter', 'ai.llm'
    name      : string;             // display name
    category  : string;             // palette grouping
    color?    : string;             // accent color
    icon?     : string;             // emoji or short text (1-2 chars)
    inputs    : PortSpec[];
    outputs   : PortSpec[];
    params?   : ParamSpec[];
    /** Optional description shown as tooltip in palette. */
    description? : string;
}

export interface NodeInstance {
    id        : string;
    type      : string;
    x         : number;
    y         : number;
    schema    : NodeSchema;
    /** Param values, keyed by param id. */
    params?   : Record<string, unknown>;
}

export type WireStatus =
    | 'connected-ok'
    | 'connected-warn'
    | 'connected-error';

export interface WireInstance {
    id           : string;
    srcNodeId    : string;
    srcPortId    : string;
    srcType      : string;
    dstNodeId    : string;
    dstPortId    : string;
    dstType      : string;
    status       : WireStatus;
}

export type RunState = 'idle' | 'running' | 'paused';

/** User-pluggable type compatibility check. */
export type TypeCheckFn = (
    srcType: string,
    dstType: string,
) => 'ok' | 'warn' | 'error';

export interface NodeEditorOptions extends CtrlOptions {
    /** Available node schemas — used to populate the palette. */
    schemas?       : NodeSchema[];
    /** Initial graph (nodes + wires) to load on mount. */
    initialGraph?  : ExportedGraph;
    /** Show the palette panel. Default true. */
    showPalette?   : boolean;
    /** Show the toolbar. Default true. */
    showToolbar?   : boolean;
    /** Show the floating inspector. Default true. */
    showInspector? : boolean;
    /** Custom type compatibility function. */
    typeCheck?     : TypeCheckFn;
    /** Width/height — defaults to 100% of container. */
    width?         : string;
    height?        : string;
}

export interface ExportedGraph {
    nodes : Array<{ id: string; type: string; x: number; y: number; params?: Record<string, unknown> }>;
    wires : Array<{
        from: { node: string; port: string };
        to:   { node: string; port: string };
    }>;
}

// ── Default type compatibility ──────────────────────────────────────────────

const defaultTypeCheck: TypeCheckFn = (srcType, dstType) => {
    if (srcType === dstType)                        return 'ok';
    if (srcType === 'any' || dstType === 'any')     return 'ok';
    // Common implicit conversions
    if (srcType === 'number' && dstType === 'string') return 'warn';
    if (srcType === 'string' && dstType === 'number') return 'warn';
    if (srcType === 'json'   && dstType === 'string') return 'warn';
    return 'error';
};

// ── Implementation ──────────────────────────────────────────────────────────

interface WireDragState {
    srcPortEl   : HTMLElement;
    srcDir      : 'in' | 'out';
    srcPos      : { x: number; y: number };
    cursor      : { x: number; y: number };
    hoverTarget : HTMLElement | null;
}

export class NodeEditor extends Control<NodeEditorOptions> {
    // Internal state
    private _nodes      : NodeInstance[] = [];
    private _wires      : WireInstance[] = [];
    private _nextId     = 1;
    private _runState   : RunState = 'idle';
    private _typeCheck  : TypeCheckFn;

    // DOM refs
    private _elPalette!  : HTMLElement;
    private _elCanvas!   : HTMLElement;
    private _elWires!    : SVGSVGElement;
    private _elInspector?: HTMLElement;
    private _elStatus!   : HTMLElement;

    // Drag state
    private _wireDrag    : WireDragState | null = null;
    private _resizeObs?  : ResizeObserver;

    constructor(container: string | HTMLElement | null, opts: NodeEditorOptions = {}) {
        super(container, 'div', {
            schemas       : [],
            showPalette   : true,
            showToolbar   : true,
            showInspector : true,
            width         : '100%',
            height        : '100%',
            ...opts,
        });

        this._typeCheck = opts.typeCheck ?? defaultTypeCheck;
        this.el.className = `ar-nodeed${opts.class ? ' ' + opts.class : ''}`;
        this.el.style.cssText = `width:${opts.width ?? '100%'};height:${opts.height ?? '100%'}`;

        this._injectStyles();
        this._buildShell();

        // ResizeObserver for wire redraw
        this._resizeObs = new ResizeObserver(() => this._redrawWires());
        this._resizeObs.observe(this.el);
        this._gc(() => this._resizeObs?.disconnect());

        // Initial graph
        if (opts.initialGraph) {
            queueMicrotask(() => this._loadGraph(opts.initialGraph!));
        }
    }

    // ── Public API ──────────────────────────────────────────────────────────

    /** Add a node by schema type. Returns the created instance. */
    addNode(schemaType: string, x: number, y: number): NodeInstance | null {
        const schema = this._schemas().find(s => s.type === schemaType);
        if (!schema) {
            console.warn(`NodeEditor: unknown schema type '${schemaType}'`);
            return null;
        }
        const id = `n${this._nextId++}`;
        const node: NodeInstance = { id, type: schemaType, x, y, schema, params: {} };
        this._nodes.push(node);
        this._renderNode(node);
        this._refreshInspector();
        this._emit('graph-change', { reason: 'add-node', node });
        return node;
    }

    /** Remove a node by id. Cascades: also removes incoming/outgoing wires. */
    removeNode(id: string): void {
        this._nodes = this._nodes.filter(n => n.id !== id);
        this._wires = this._wires.filter(w => w.srcNodeId !== id && w.dstNodeId !== id);
        this._elCanvas.querySelector(`#${CSS.escape(id)}`)?.remove();
        this._redrawWires();
        this._refreshInspector();
        this._emit('graph-change', { reason: 'remove-node', id });
    }

    /** Connect two ports. Returns the wire if connection was made. */
    addWire(srcNodeId: string, srcPortId: string, dstNodeId: string, dstPortId: string): WireInstance | null {
        const srcNode = this._nodes.find(n => n.id === srcNodeId);
        const dstNode = this._nodes.find(n => n.id === dstNodeId);
        if (!srcNode || !dstNode) return null;

        const srcPort = srcNode.schema.outputs.find(p => p.id === srcPortId);
        const dstPort = dstNode.schema.inputs.find(p => p.id === dstPortId);
        if (!srcPort || !dstPort) return null;

        // Avoid duplicates: input ports take only one wire
        this._wires = this._wires.filter(w =>
            !(w.dstNodeId === dstNodeId && w.dstPortId === dstPortId));

        const compat = this._typeCheck(srcPort.type, dstPort.type);
        const status: WireStatus =
            compat === 'ok'   ? 'connected-ok'   :
            compat === 'warn' ? 'connected-warn' :
                                'connected-error';

        const wire: WireInstance = {
            id: `w${this._nextId++}`,
            srcNodeId, srcPortId, srcType: srcPort.type,
            dstNodeId, dstPortId, dstType: dstPort.type,
            status,
        };
        this._wires.push(wire);
        this._updatePortStatus();
        this._redrawWires();
        this._refreshInspector();
        this._emit('graph-change', { reason: 'add-wire', wire });
        return wire;
    }

    /** Remove a wire by id. */
    removeWire(id: string): void {
        this._wires = this._wires.filter(w => w.id !== id);
        this._updatePortStatus();
        this._redrawWires();
        this._refreshInspector();
        this._emit('graph-change', { reason: 'remove-wire', id });
    }

    /** Update wire status (from the runtime — error/warn after run). */
    setWireStatus(id: string, status: WireStatus): void {
        const w = this._wires.find(x => x.id === id);
        if (!w) return;
        w.status = status;
        this._updatePortStatus();
        this._redrawWires();
    }

    /** Clear all nodes and wires. */
    clear(): void {
        this._nodes = [];
        this._wires = [];
        this._elCanvas.innerHTML = '';
        this._redrawWires();
        this._refreshInspector();
        this._emit('graph-change', { reason: 'clear' });
    }

    /** Export the current graph as serializable JSON. */
    export(): ExportedGraph {
        return {
            nodes: this._nodes.map(n => ({
                id: n.id, type: n.type, x: n.x, y: n.y, params: n.params,
            })),
            wires: this._wires.map(w => ({
                from: { node: w.srcNodeId, port: w.srcPortId },
                to:   { node: w.dstNodeId, port: w.dstPortId },
            })),
        };
    }

    /** Replace the current graph with the given one. */
    load(graph: ExportedGraph): void {
        this.clear();
        this._loadGraph(graph);
    }

    /** Set the run state (idle/running/paused) — emits 'run-state' event. */
    setRunState(s: RunState): void {
        this._runState = s;
        this._refreshStatus();
        this._refreshInspector();
        this._emit('run-state', { state: s });
    }

    getRunState(): RunState { return this._runState; }
    getNodes()    : readonly NodeInstance[] { return this._nodes; }
    getWires()    : readonly WireInstance[] { return this._wires; }

    // ── Internal ────────────────────────────────────────────────────────────

    private _schemas(): NodeSchema[] {
        return this._get<NodeSchema[]>('schemas', []);
    }

    private _loadGraph(g: ExportedGraph): void {
        const idMap: Record<string, string> = {};
        for (const n of g.nodes) {
            const created = this.addNode(n.type, n.x, n.y);
            if (created) {
                idMap[n.id] = created.id;
                if (n.params) created.params = { ...n.params };
            }
        }
        // Wait for layout before placing wires
        queueMicrotask(() => {
            for (const w of g.wires) {
                const srcId = idMap[w.from.node];
                const dstId = idMap[w.to.node];
                if (srcId && dstId) this.addWire(srcId, w.from.port, dstId, w.to.port);
            }
        });
    }

    protected _build(): void {
        // No-op — we built the shell once in constructor; updates are surgical.
    }

    private _buildShell(): void {
        const showPalette   = this._get('showPalette', true);
        const showToolbar   = this._get('showToolbar', true);
        const showInspector = this._get('showInspector', true);

        // Grid layout: optional toolbar row, optional palette column, canvas
        const cols = showPalette ? '200px 1fr' : '1fr';
        const rows = showToolbar ? '44px 1fr' : '1fr';
        this.el.style.display = 'grid';
        this.el.style.gridTemplateColumns = cols;
        this.el.style.gridTemplateRows    = rows;

        // ── Toolbar ─────────────────────────────────────────────────
        if (showToolbar) {
            const tb = this._el('div', 'ar-nodeed__toolbar', this.el);
            tb.style.gridColumn = showPalette ? '1 / 3' : '1';

            const title = this._el('h3', 'ar-nodeed__title', tb);
            title.textContent = 'NodeEditor';

            this._elStatus = this._el('span', 'ar-nodeed__status', tb);
            this._elStatus.textContent = '— idle';

            const spacer = this._el('div', 'ar-nodeed__spacer', tb);
            spacer.style.flex = '1';

            const mkBtn = (label: string, kind: string, click: () => void) => {
                const b = this._el('button', `ar-nodeed__btn ${kind}`, tb) as HTMLButtonElement;
                b.type = 'button';
                b.textContent = label;
                b.addEventListener('click', click);
                return b;
            };
            mkBtn('▶ Play',  'play',  () => this.setRunState('running'));
            mkBtn('‖ Pause', 'pause', () => this.setRunState('paused'));
            mkBtn('■ Stop',  'stop',  () => this.setRunState('idle'));

            const sep = this._el('div', '', tb);
            sep.style.width = '14px';

            mkBtn('Clear all',   '', () => {
                if (confirm('Clear all nodes and wires?')) this.clear();
            });
            mkBtn('Export JSON', '', () => {
                const blob = new Blob([JSON.stringify(this.export(), null, 2)],
                                      { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'graph.json';
                a.click();
                setTimeout(() => URL.revokeObjectURL(a.href), 0);
            });
        }

        // ── Palette ─────────────────────────────────────────────────
        if (showPalette) {
            this._elPalette = this._el('div', 'ar-nodeed__palette', this.el);
            this._buildPalette();
        }

        // ── Canvas wrap (with SVG wires overlay + inspector) ────────
        const wrap = this._el('div', 'ar-nodeed__canvas-wrap', this.el);
        this._elCanvas = this._el('div', 'ar-nodeed__canvas', wrap);

        const ns = 'http://www.w3.org/2000/svg';
        this._elWires = document.createElementNS(ns, 'svg') as SVGSVGElement;
        this._elWires.classList.add('ar-nodeed__wires');
        wrap.appendChild(this._elWires);

        if (showInspector) {
            this._elInspector = this._el('div', 'ar-nodeed__inspector', wrap);
            this._refreshInspector();
        }

        // Drop on canvas
        this._on(wrap, 'dragover', (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        });
        this._on(wrap, 'drop', (e: DragEvent) => {
            e.preventDefault();
            const type = e.dataTransfer?.getData('application/x-arianna-node');
            if (!type) return;
            const rect = wrap.getBoundingClientRect();
            this.addNode(type, e.clientX - rect.left - 80, e.clientY - rect.top - 16);
        });
    }

    private _buildPalette(): void {
        this._elPalette.innerHTML = '';
        const cats: Record<string, NodeSchema[]> = {};
        for (const s of this._schemas()) {
            if (!cats[s.category]) cats[s.category] = [];
            cats[s.category].push(s);
        }
        for (const [cat, items] of Object.entries(cats)) {
            const t = this._el('div', 'ar-nodeed__cat-title', this._elPalette);
            t.textContent = cat;
            for (const s of items) {
                const row = this._el('div', 'ar-nodeed__pal-item', this._elPalette);
                (row as HTMLElement).draggable = true;
                if (s.description) row.title = s.description;
                row.innerHTML =
                    `<span class="ar-nodeed__pal-icon" style="color:${s.color || '#888'}">${s.icon || '◆'}</span>` +
                    `<span>${s.name}</span>`;
                row.addEventListener('dragstart', (e: DragEvent) => {
                    e.dataTransfer?.setData('application/x-arianna-node', s.type);
                    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
                });
            }
        }
    }

    private _renderNode(node: NodeInstance): void {
        const s = node.schema;
        const el = this._el('div', 'ar-nodeed__node', this._elCanvas);
        el.id = node.id;
        el.style.left = node.x + 'px';
        el.style.top  = node.y + 'px';

        // Header
        const hd = this._el('div', 'ar-nodeed__node-hd', el);
        hd.innerHTML =
            `<span class="ar-nodeed__n-color" style="background:${s.color || '#888'}"></span>` +
            `<span>${s.icon || '◆'}</span>` +
            `<span>${s.name}</span>`;

        // Close
        const closeBtn = this._el('button', 'ar-nodeed__node-close', el) as HTMLButtonElement;
        closeBtn.type = 'button';
        closeBtn.textContent = '×';
        closeBtn.title = 'Delete node';
        closeBtn.addEventListener('click', e => {
            e.stopPropagation();
            this.removeNode(node.id);
        });

        // Body — input ports left, output ports right
        const body  = this._el('div', 'ar-nodeed__node-body', el);
        const rows  = Math.max(s.inputs.length, s.outputs.length);
        for (let i = 0; i < rows; i++) {
            const row = this._el('div', 'ar-nodeed__node-row', body);
            const inWrap  = this._el('div', '', row);
            inWrap.style.cssText = 'display:flex;align-items:center;gap:6px;flex:1';
            const outWrap = this._el('div', '', row);
            outWrap.style.cssText = 'display:flex;align-items:center;gap:6px;flex:1;justify-content:flex-end';

            const inSpec  = s.inputs[i];
            const outSpec = s.outputs[i];

            if (inSpec) {
                const port = this._createPort(node.id, inSpec, 'in');
                const lbl  = this._el('span', 'ar-nodeed__port-lbl', inWrap);
                inWrap.insertBefore(port, lbl);
                lbl.textContent = inSpec.label || inSpec.id;
            }
            if (outSpec) {
                const lbl  = this._el('span', 'ar-nodeed__port-lbl', outWrap);
                lbl.textContent = outSpec.label || outSpec.id;
                const port = this._createPort(node.id, outSpec, 'out');
                outWrap.appendChild(port);
            }
        }

        // Drag header to move node
        hd.addEventListener('pointerdown', (e: PointerEvent) => {
            if (e.button !== 0) return;
            e.preventDefault();
            const startX = e.clientX, startY = e.clientY;
            const startLeft = node.x, startTop = node.y;
            (hd as HTMLElement).setPointerCapture(e.pointerId);

            const onMove = (ev: PointerEvent) => {
                node.x = startLeft + (ev.clientX - startX);
                node.y = startTop  + (ev.clientY - startY);
                el.style.left = node.x + 'px';
                el.style.top  = node.y + 'px';
                this._redrawWires();
            };
            const onUp = () => {
                hd.removeEventListener('pointermove', onMove);
                hd.removeEventListener('pointerup',   onUp);
                this._emit('graph-change', { reason: 'move-node', id: node.id });
            };
            hd.addEventListener('pointermove', onMove);
            hd.addEventListener('pointerup',   onUp);
        });
    }

    private _createPort(nodeId: string, portSpec: PortSpec, dir: 'in' | 'out'): HTMLElement {
        const p = document.createElement('div');
        p.className = `ar-nodeed__port ${dir}`;
        p.dataset.nodeId = nodeId;
        p.dataset.portId = portSpec.id;
        p.dataset.dir    = dir;
        p.dataset.type   = portSpec.type;
        p.title = `${portSpec.label || portSpec.id}: ${portSpec.type}`;

        p.addEventListener('pointerdown', (e: PointerEvent) => {
            if (e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();
            this._startWireDrag(p, e);
        });
        return p;
    }

    // ── Wire dragging ───────────────────────────────────────────────────────

    private _startWireDrag(srcPortEl: HTMLElement, e: PointerEvent): void {
        const srcRect = srcPortEl.getBoundingClientRect();
        const wrapRect = this._elCanvas.parentElement!.getBoundingClientRect();
        this._wireDrag = {
            srcPortEl,
            srcDir: srcPortEl.dataset.dir as 'in' | 'out',
            srcPos: {
                x: srcRect.left + srcRect.width / 2 - wrapRect.left,
                y: srcRect.top  + srcRect.height / 2 - wrapRect.top,
            },
            cursor: { x: e.clientX - wrapRect.left, y: e.clientY - wrapRect.top },
            hoverTarget: null,
        };

        const onMove = (ev: PointerEvent) => this._onWireDrag(ev);
        const onUp   = ()                  => {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup',   onUp);
            this._onWireDrop();
        };
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup',   onUp);
        this._redrawWires();
    }

    private _onWireDrag(e: PointerEvent): void {
        if (!this._wireDrag) return;
        const wrapRect = this._elCanvas.parentElement!.getBoundingClientRect();
        this._wireDrag.cursor.x = e.clientX - wrapRect.left;
        this._wireDrag.cursor.y = e.clientY - wrapRect.top;

        // Hover detection: temporarily disable wires overlay
        const prevPE = (this._elWires as unknown as HTMLElement).style.pointerEvents;
        (this._elWires as unknown as HTMLElement).style.pointerEvents = 'none';
        const elUnder = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
        (this._elWires as unknown as HTMLElement).style.pointerEvents = prevPE;

        // Clear previous hover
        this.el.querySelectorAll('.ar-nodeed__port.hover-target').forEach(p =>
            p.classList.remove('hover-target'));

        if (elUnder?.classList.contains('ar-nodeed__port') && elUnder !== this._wireDrag.srcPortEl) {
            const dstDir   = elUnder.dataset.dir;
            const sameNode = elUnder.dataset.nodeId === this._wireDrag.srcPortEl.dataset.nodeId;
            if (this._wireDrag.srcDir !== dstDir && !sameNode) {
                elUnder.classList.add('hover-target');
                this._wireDrag.hoverTarget = elUnder;
            } else {
                this._wireDrag.hoverTarget = null;
            }
        } else {
            this._wireDrag.hoverTarget = null;
        }
        this._redrawWires();
    }

    private _onWireDrop(): void {
        if (!this._wireDrag) return;
        const target = this._wireDrag.hoverTarget;
        if (target) {
            // Always orient: src = output, dst = input
            let srcEl: HTMLElement, dstEl: HTMLElement;
            if (this._wireDrag.srcDir === 'out') {
                srcEl = this._wireDrag.srcPortEl; dstEl = target;
            } else {
                srcEl = target; dstEl = this._wireDrag.srcPortEl;
            }
            this.addWire(
                srcEl.dataset.nodeId!, srcEl.dataset.portId!,
                dstEl.dataset.nodeId!, dstEl.dataset.portId!,
            );
        }
        this.el.querySelectorAll('.ar-nodeed__port.hover-target').forEach(p =>
            p.classList.remove('hover-target'));
        this._wireDrag = null;
        this._redrawWires();
    }

    // ── Wire rendering (Manhattan routing) ──────────────────────────────────

    private _portCenter(nodeId: string, portId: string): { x: number; y: number } | null {
        const p = this.el.querySelector<HTMLElement>(
            `#${CSS.escape(nodeId)} .ar-nodeed__port[data-port-id="${CSS.escape(portId)}"]`);
        if (!p) return null;
        const r = p.getBoundingClientRect();
        const wr = this._elCanvas.parentElement!.getBoundingClientRect();
        return { x: r.left + r.width / 2 - wr.left, y: r.top + r.height / 2 - wr.top };
    }

    private _manhattanPath(srcX: number, srcY: number, dstX: number, dstY: number): string {
        const M = 24;
        const sx2  = srcX + M;
        const dx2  = dstX - M;
        const midX = (sx2 + dx2) / 2;
        return `M ${srcX} ${srcY} L ${sx2} ${srcY} L ${midX} ${srcY} L ${midX} ${dstY} L ${dx2} ${dstY} L ${dstX} ${dstY}`;
    }

    private _statusColor(status: WireStatus): string {
        switch (status) {
            case 'connected-ok':    return '#16a34a';
            case 'connected-warn':  return '#f59e0b';
            case 'connected-error': return '#dc2626';
        }
    }

    private _redrawWires(): void {
        // Clear and resize
        while (this._elWires.firstChild) this._elWires.removeChild(this._elWires.firstChild);
        const wrap = this._elCanvas.parentElement!;
        this._elWires.setAttribute('width',  String(wrap.clientWidth));
        this._elWires.setAttribute('height', String(wrap.clientHeight));

        // Existing wires
        for (const w of this._wires) {
            const src = this._portCenter(w.srcNodeId, w.srcPortId);
            const dst = this._portCenter(w.dstNodeId, w.dstPortId);
            if (!src || !dst) continue;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', this._manhattanPath(src.x, src.y, dst.x, dst.y));
            path.setAttribute('stroke', this._statusColor(w.status));
            path.classList.add('editable');
            path.dataset.wireId = w.id;
            path.addEventListener('contextmenu', (e: Event) => {
                e.preventDefault();
                this.removeWire(w.id);
            });
            path.addEventListener('mouseenter', () => path.setAttribute('stroke-width', '3.5'));
            path.addEventListener('mouseleave', () => path.setAttribute('stroke-width', '2'));
            this._elWires.appendChild(path);
        }

        // Drag preview
        if (this._wireDrag) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const fromOut = this._wireDrag.srcDir === 'out';
            const sx = this._wireDrag.srcPos.x, sy = this._wireDrag.srcPos.y;
            const dx = this._wireDrag.cursor.x, dy = this._wireDrag.cursor.y;
            path.setAttribute('d', this._manhattanPath(
                fromOut ? sx : dx, fromOut ? sy : dy,
                fromOut ? dx : sx, fromOut ? dy : sy,
            ));
            path.setAttribute('stroke', this._wireDrag.hoverTarget ? '#eab308' : '#999');
            path.setAttribute('stroke-dasharray', '4 4');
            this._elWires.appendChild(path);
        }
    }

    private _updatePortStatus(): void {
        this.el.querySelectorAll('.ar-nodeed__port').forEach(p => {
            p.classList.remove('connected-ok', 'connected-warn', 'connected-error');
        });
        for (const w of this._wires) {
            const src = this.el.querySelector(
                `#${CSS.escape(w.srcNodeId)} .ar-nodeed__port[data-port-id="${CSS.escape(w.srcPortId)}"]`);
            const dst = this.el.querySelector(
                `#${CSS.escape(w.dstNodeId)} .ar-nodeed__port[data-port-id="${CSS.escape(w.dstPortId)}"]`);
            src?.classList.add(w.status);
            dst?.classList.add(w.status);
        }
    }

    // ── Status & inspector ──────────────────────────────────────────────────

    private _refreshStatus(): void {
        if (!this._elStatus) return;
        const map: Record<RunState, [string, string]> = {
            idle    : ['— idle',    '#888'],
            running : ['— running', '#16a34a'],
            paused  : ['— paused',  '#eab308'],
        };
        const [txt, color] = map[this._runState];
        this._elStatus.textContent = txt;
        this._elStatus.style.color = color;
    }

    private _refreshInspector(): void {
        if (!this._elInspector) return;
        this._elInspector.innerHTML =
            `<div class="ar-nodeed__ins-ttl">Inspector</div>` +
            `<div><span class="ar-nodeed__ins-k">Nodes</span>` +
                `<span class="ar-nodeed__ins-v">${this._nodes.length}</span></div>` +
            `<hr>` +
            `<div><span class="ar-nodeed__ins-k">Wires</span>` +
                `<span class="ar-nodeed__ins-v">${this._wires.length}</span></div>` +
            `<hr>` +
            `<div><span class="ar-nodeed__ins-k">State</span>` +
                `<span class="ar-nodeed__ins-v">${this._runState}</span></div>` +
            `<div class="ar-nodeed__ins-help">Drag from palette. Click a port (LED) to start a wire. Right-click a wire to delete.</div>`;
    }

    // ── Stylesheet (auto-injected once) ─────────────────────────────────────

    private _injectStyles(): void {
        if (document.getElementById('ar-nodeed-styles')) return;
        const style = document.createElement('style');
        style.id = 'ar-nodeed-styles';
        style.textContent = `
.ar-nodeed { font: 13px -apple-system, system-ui, sans-serif; color: #222; overflow: hidden; }
.ar-nodeed__toolbar { background: #1e1e1e; color: #d4d4d4; display: flex; align-items: center; padding: 0 16px; gap: 10px; border-bottom: 1px solid #333; }
.ar-nodeed__title { font-size: 13px; margin: 0; font-weight: 500; color: #e40c88; }
.ar-nodeed__status { font: 11px ui-monospace, monospace; color: #888; margin-left: 8px; }
.ar-nodeed__btn { background: transparent; border: 1px solid #444; color: #d4d4d4; padding: 4px 12px; font: 12px sans-serif; border-radius: 3px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
.ar-nodeed__btn:hover { background: #2a2a2a; }
.ar-nodeed__btn.play  { background: #16a34a; border-color: #16a34a; color: #fff; }
.ar-nodeed__btn.play:hover  { background: #15803d; }
.ar-nodeed__btn.stop  { background: #dc2626; border-color: #dc2626; color: #fff; }
.ar-nodeed__btn.stop:hover  { background: #b91c1c; }
.ar-nodeed__btn.pause { background: #eab308; border-color: #eab308; color: #1f1f1f; }
.ar-nodeed__btn.pause:hover { background: #ca8a04; }

.ar-nodeed__palette { background: #f0f0f0; border-right: 1px solid #ddd; padding: 12px 0; overflow-y: auto; }
.ar-nodeed__cat-title { font: 600 11px sans-serif; text-transform: uppercase; letter-spacing: 0.5px; color: #666; padding: 8px 14px 4px; }
.ar-nodeed__pal-item { padding: 8px 14px; cursor: grab; font: 13px sans-serif; user-select: none; display: flex; align-items: center; gap: 8px; border-left: 3px solid transparent; transition: background 0.15s, border-left-color 0.15s; }
.ar-nodeed__pal-item:hover { background: #fff; border-left-color: #e40c88; }
.ar-nodeed__pal-item:active { cursor: grabbing; }
.ar-nodeed__pal-icon { width: 18px; text-align: center; }

.ar-nodeed__canvas-wrap { position: relative; overflow: hidden; background-color: #fff; background-image: linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px); background-size: 20px 20px; }
.ar-nodeed__canvas { position: absolute; inset: 0; }
.ar-nodeed__wires { position: absolute; inset: 0; pointer-events: none; }
.ar-nodeed__wires path { fill: none; stroke-width: 2; pointer-events: stroke; }
.ar-nodeed__wires path.editable { cursor: pointer; }

.ar-nodeed__node { position: absolute; background: #fff; border: 1.5px solid #d4d4d4; border-radius: 6px; min-width: 160px; font: 12px sans-serif; user-select: none; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
.ar-nodeed__node-hd { background: #f3f3f3; padding: 6px 28px 6px 10px; border-bottom: 1px solid #e2e2e2; cursor: move; font-weight: 600; border-radius: 4px 4px 0 0; display: flex; align-items: center; gap: 6px; }
.ar-nodeed__n-color { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.ar-nodeed__node-close { position: absolute; right: 4px; top: 4px; width: 18px; height: 18px; border: 0; background: transparent; font: 14px monospace; color: #999; cursor: pointer; border-radius: 3px; }
.ar-nodeed__node-close:hover { background: #fee; color: #dc2626; }
.ar-nodeed__node-body { padding: 8px 10px; }
.ar-nodeed__node-row { display: flex; align-items: center; margin: 3px 0; position: relative; gap: 8px; justify-content: space-between; }

.ar-nodeed__port { width: 12px; height: 12px; border-radius: 50%; background: #dc2626; border: 2px solid #fff; box-shadow: 0 0 0 1px #999; cursor: crosshair; flex-shrink: 0; transition: background 0.12s, box-shadow 0.12s; }
.ar-nodeed__port.in  { margin-left: -16px; }
.ar-nodeed__port.out { margin-right: -16px; }
.ar-nodeed__port:hover { box-shadow: 0 0 0 1px #eab308, 0 0 6px rgba(234, 179, 8, 0.5); }
.ar-nodeed__port.hover-target { background: #eab308; box-shadow: 0 0 0 2px #eab308, 0 0 8px rgba(234, 179, 8, 0.6); }
.ar-nodeed__port.connected-ok    { background: #16a34a; box-shadow: 0 0 0 1px #16a34a; }
.ar-nodeed__port.connected-warn  { background: #f59e0b; box-shadow: 0 0 0 1px #f59e0b; }
.ar-nodeed__port.connected-error { background: #dc2626; box-shadow: 0 0 0 1px #dc2626; animation: ar-nodeed-blink 0.8s infinite alternate; }
@keyframes ar-nodeed-blink {
    from { box-shadow: 0 0 0 1px #dc2626, 0 0 4px rgba(220, 38, 38, 0.4); }
    to   { box-shadow: 0 0 0 2px #dc2626, 0 0 12px rgba(220, 38, 38, 0.8); }
}
.ar-nodeed__port-lbl { font: 11px sans-serif; color: #555; }

.ar-nodeed__inspector { position: absolute; right: 12px; bottom: 12px; width: 260px; max-height: 60vh; background: #1e1e1e; color: #d4d4d4; border-radius: 6px; padding: 10px 12px; font: 11px ui-monospace, monospace; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); overflow-y: auto; }
.ar-nodeed__ins-ttl { color: #c3e88d; font-weight: 600; margin-bottom: 4px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
.ar-nodeed__ins-k { color: #6cb6ff; display: inline-block; width: 80px; }
.ar-nodeed__ins-v { color: #ffab40; }
.ar-nodeed__inspector hr { border: 0; border-top: 1px solid #333; margin: 6px 0; }
.ar-nodeed__ins-help { color: #888; margin-top: 8px; }
`;
        document.head.appendChild(style);
    }
}
