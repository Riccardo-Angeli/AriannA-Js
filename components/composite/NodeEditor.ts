/**
 * @module    components/composite/NodeEditor
 * @author    Riccardo Angeli
 * @copyright Riccardo Angeli 2012-2026
 *
 * NodeEditor — generic JSON-schema-driven node-graph editor.
 *
 * Domain-agnostic: works for dataflow, audio routing, AI agent orchestration,
 * video pipelines, server-side workflow composition. Linguaggio-agnostico.
 *
 * Layout: palette (left, draggable schema items) + canvas (right, free-place
 * nodes connected by wires). Wires use Manhattan routing (right-angle,
 * Unreal-Blueprint style).
 *
 *   <arianna-node-editor></arianna-node-editor>
 *
 *   const ed = new NodeEditor();
 *   ed.append(document.body);
 *   ed.setSchemas([
 *     { type: 'source.timer', name: 'Timer', category: 'Source',
 *       color: '#3b82f6', icon: '⏱',
 *       inputs: [], outputs: [{ id: 'tick', type: 'number', label: 'tick' }] },
 *     { type: 'sink.log',  name: 'Console', category: 'Sink',
 *       color: '#64748b',
 *       inputs: [{ id: 'in', type: 'any', label: 'in' }], outputs: [] },
 *   ]);
 *   const a = ed.addNode('source.timer', 60,  60);
 *   const b = ed.addNode('sink.log',    320, 60);
 *   ed.addWire(a.id, 'tick', b.id, 'in');
 *
 * Events:
 *   arianna:graph-change     { source }
 *   arianna:node-add         { node }
 *   arianna:node-remove      { node }
 *   arianna:wire-add         { wire }
 *   arianna:wire-remove      { wire }
 *   arianna:node-param-edit  { node, paramId, value }
 *   arianna:run-state        { state: 'idle'|'running'|'paused' }
 */

import { Component } from '../../core/Component.ts';
import { signal, effect, type Signal } from '../../core/Observable.ts';
import { Stylesheet } from '../../core/Stylesheet.ts';
import { Rule } from '../../core/Rule.ts';

export interface PortSpec {
    id     : string;
    type   : string;
    label? : string;
}

export interface ParamSpec {
    id        : string;
    type      : 'number' | 'string' | 'boolean' | 'enum';
    label?    : string;
    default?  : unknown;
    min?      : number;
    max?      : number;
    options?  : string[];
}

export interface NodeSchema {
    type        : string;
    name        : string;
    category    : string;
    color?      : string;
    icon?       : string;
    inputs      : PortSpec[];
    outputs     : PortSpec[];
    params?     : ParamSpec[];
    description?: string;
}

export interface NodeInstance {
    id     : string;
    type   : string;
    x      : number;
    y      : number;
    schema : NodeSchema;
    params?: Record<string, unknown>;
}

export type WireStatus = 'connected-ok' | 'connected-warn' | 'connected-error';

export interface WireInstance {
    id        : string;
    srcNodeId : string;
    srcPortId : string;
    srcType   : string;
    dstNodeId : string;
    dstPortId : string;
    dstType   : string;
    status    : WireStatus;
}

export type RunState = 'idle' | 'running' | 'paused';

export type TypeCheckFn = (srcType: string, dstType: string) => WireStatus | null;

export interface NodeEditorOptions {
    schemas?  : NodeSchema[];
    typeCheck?: TypeCheckFn;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const NODE_WIDTH  = 180;
const PORT_HEIGHT = 18;

export class NodeEditor extends Component('arianna-node-editor', HTMLElement, {}, {
    attrs : [],
})
{
    readonly schemas$: Signal<NodeSchema[]>    = signal<NodeSchema[]>([]);
    readonly nodes$  : Signal<NodeInstance[]>  = signal<NodeInstance[]>([]);
    readonly wires$  : Signal<WireInstance[]>  = signal<WireInstance[]>([]);
    readonly runState$: Signal<RunState>       = signal<RunState>('idle' as RunState);

    #typeCheck: TypeCheckFn = (srcType, dstType) =>
        (srcType === dstType || srcType === 'any' || dstType === 'any') ? 'connected-ok' : 'connected-error';

    #palette? : HTMLDivElement;
    #canvas?  : HTMLDivElement;
    #svg?     : SVGSVGElement;
    #idCounter = 0;

    constructor(opts: NodeEditorOptions = {}) {
        super(opts as never);
        if (opts.schemas)   this.schemas$.set(opts.schemas);
        if (opts.typeCheck) this.#typeCheck = opts.typeCheck;
    }

    build(): void {
        const self = this as unknown as {
            render(): HTMLElement;
            fire(t: string, init?: CustomEventInit): void;
            Sheet: Stylesheet | null;
        };
        const root = self.render();
        if (root.querySelector('.ne-wrap')) return;

        const wrap = document.createElement('div');
        wrap.className = 'ne-wrap';

        // Palette
        const palette = document.createElement('div');
        palette.className = 'ne-palette';
        this.#palette = palette;

        // Canvas
        const canvas = document.createElement('div');
        canvas.className = 'ne-canvas';
        this.#canvas = canvas;
        const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
        svg.setAttribute('class', 'ne-svg');
        canvas.appendChild(svg);
        this.#svg = svg;

        wrap.append(palette, canvas);
        root.appendChild(wrap);

        // Render palette
        effect(() => this.#renderPalette());
        // Render nodes
        effect(() => { this.nodes$.get(); this.#renderNodes(); this.#renderWires(); });
        // Render wires
        effect(() => { this.wires$.get(); this.#renderWires(); });

        // Drop on canvas → spawn node
        canvas.addEventListener('dragover', e => e.preventDefault());
        canvas.addEventListener('drop', (e: DragEvent) => {
            e.preventDefault();
            const type = e.dataTransfer?.getData('arianna/node-schema');
            if (!type) return;
            const r = canvas.getBoundingClientRect();
            this.addNode(type, e.clientX - r.left, e.clientY - r.top);
        });

        self.Sheet = NodeEditor.DefaultSheet();
    }

    #renderPalette(): void {
        const palette = this.#palette;
        if (!palette) return;
        palette.innerHTML = '';
        const schemas = this.schemas$.get();
        // Group by category
        const groups: Record<string, NodeSchema[]> = {};
        for (const s of schemas) {
            (groups[s.category] ??= []).push(s);
        }
        for (const cat of Object.keys(groups)) {
            const h = document.createElement('div');
            h.className = 'ne-pal-cat';
            h.textContent = cat;
            palette.appendChild(h);
            for (const s of groups[cat] ?? []) {
                const it = document.createElement('div');
                it.className = 'ne-pal-item';
                it.draggable = true;
                if (s.color) it.style.borderLeftColor = s.color;
                if (s.description) it.title = s.description;
                const icon = document.createElement('span');
                icon.className = 'ne-pal-icon';
                icon.textContent = s.icon ?? '';
                if (s.color) icon.style.background = s.color;
                const name = document.createElement('span');
                name.className = 'ne-pal-name';
                name.textContent = s.name;
                it.append(icon, name);
                it.addEventListener('dragstart', (e: DragEvent) => {
                    e.dataTransfer?.setData('arianna/node-schema', s.type);
                });
                palette.appendChild(it);
            }
        }
    }

    #renderNodes(): void {
        const canvas = this.#canvas;
        const svg    = this.#svg;
        if (!canvas || !svg) return;
        Array.from(canvas.querySelectorAll('.ne-node')).forEach(n => n.remove());
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };

        for (const n of this.nodes$.peek()) {
            const div = document.createElement('div');
            div.className = 'ne-node';
            div.style.left  = n.x + 'px';
            div.style.top   = n.y + 'px';
            div.dataset.nodeId = n.id;
            if (n.schema.color) div.style.borderTopColor = n.schema.color;

            // Header
            const hdr = document.createElement('div');
            hdr.className = 'ne-node-hdr';
            if (n.schema.color) hdr.style.background = n.schema.color;
            const icon = document.createElement('span');
            icon.className = 'ne-node-icon';
            icon.textContent = n.schema.icon ?? '';
            const name = document.createElement('span');
            name.className = 'ne-node-name';
            name.textContent = n.schema.name;
            const close = document.createElement('button');
            close.type = 'button';
            close.className = 'ne-node-close';
            close.textContent = '×';
            close.addEventListener('click', e => {
                e.stopPropagation();
                this.removeNode(n.id);
            });
            hdr.append(icon, name, close);

            // Body — inputs (left), outputs (right), params
            const body = document.createElement('div');
            body.className = 'ne-node-body';
            const ports = document.createElement('div');
            ports.className = 'ne-node-ports';
            const inCol = document.createElement('div');
            inCol.className = 'ne-node-col ne-node-col-in';
            for (const p of n.schema.inputs) {
                const row = this.#buildPortRow(n, p, 'in');
                inCol.appendChild(row);
            }
            const outCol = document.createElement('div');
            outCol.className = 'ne-node-col ne-node-col-out';
            for (const p of n.schema.outputs) {
                const row = this.#buildPortRow(n, p, 'out');
                outCol.appendChild(row);
            }
            ports.append(inCol, outCol);

            const params = document.createElement('div');
            params.className = 'ne-node-params';
            for (const sp of (n.schema.params ?? [])) {
                const row = this.#buildParamRow(n, sp);
                params.appendChild(row);
            }

            body.append(ports, params);
            div.append(hdr, body);

            // Drag node
            let dragX = 0, dragY = 0, origX = 0, origY = 0;
            hdr.addEventListener('pointerdown', (e: PointerEvent) => {
                hdr.setPointerCapture(e.pointerId);
                dragX = e.clientX; dragY = e.clientY;
                origX = n.x; origY = n.y;
            });
            hdr.addEventListener('pointermove', (e: PointerEvent) => {
                if (e.buttons === 0) return;
                n.x = Math.max(0, origX + (e.clientX - dragX));
                n.y = Math.max(0, origY + (e.clientY - dragY));
                div.style.left = n.x + 'px';
                div.style.top  = n.y + 'px';
                this.#renderWires();
            });
            hdr.addEventListener('pointerup', (e: PointerEvent) => {
                hdr.releasePointerCapture(e.pointerId);
                self.fire('arianna:graph-change', { detail: { source: this }, bubbles: true });
            });

            canvas.appendChild(div);
        }
    }

    #buildPortRow(node: NodeInstance, port: PortSpec, side: 'in' | 'out'): HTMLDivElement {
        const row = document.createElement('div');
        row.className = 'ne-port-row ne-port-' + side;
        const dot = document.createElement('span');
        dot.className = 'ne-port-dot';
        dot.dataset.nodeId = node.id;
        dot.dataset.portId = port.id;
        dot.dataset.portSide = side;
        dot.dataset.portType = port.type;
        const lbl = document.createElement('span');
        lbl.className = 'ne-port-label';
        lbl.textContent = port.label ?? port.id;
        if (side === 'in') row.append(dot, lbl);
        else                row.append(lbl, dot);

        // Wire creation: drag from out → in
        if (side === 'out') {
            dot.addEventListener('pointerdown', (e: PointerEvent) => {
                e.stopPropagation();
                this.#startWireDrag(node, port, e);
            });
        }
        return row;
    }

    #buildParamRow(node: NodeInstance, sp: ParamSpec): HTMLDivElement {
        const row = document.createElement('div');
        row.className = 'ne-param-row';
        const lbl = document.createElement('label');
        lbl.className = 'ne-param-label';
        lbl.textContent = sp.label ?? sp.id;

        let input: HTMLInputElement | HTMLSelectElement;
        node.params ??= {};
        const cur = node.params[sp.id] ?? sp.default;

        if (sp.type === 'enum' && sp.options) {
            input = document.createElement('select');
            for (const o of sp.options) {
                const opt = document.createElement('option');
                opt.value = o; opt.textContent = o;
                input.appendChild(opt);
            }
            input.value = String(cur ?? '');
        } else if (sp.type === 'boolean') {
            input = document.createElement('input');
            input.type = 'checkbox';
            (input as HTMLInputElement).checked = !!cur;
        } else if (sp.type === 'number') {
            input = document.createElement('input');
            input.type = 'number';
            if (sp.min != null) (input as HTMLInputElement).min = String(sp.min);
            if (sp.max != null) (input as HTMLInputElement).max = String(sp.max);
            input.value = String(cur ?? '');
        } else {
            input = document.createElement('input');
            input.type = 'text';
            input.value = String(cur ?? '');
        }
        input.className = 'ne-param-input';
        input.addEventListener('change', () => {
            const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
            const v: unknown = sp.type === 'boolean' ? (input as HTMLInputElement).checked
                : sp.type === 'number' ? parseFloat(input.value)
                : input.value;
            node.params![sp.id] = v;
            self.fire('arianna:node-param-edit', { detail: { node, paramId: sp.id, value: v, source: this }, bubbles: true });
        });
        row.append(lbl, input);
        return row;
    }

    #startWireDrag(srcNode: NodeInstance, srcPort: PortSpec, startEv: PointerEvent): void {
        const canvas = this.#canvas, svg = this.#svg;
        if (!canvas || !svg) return;
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('class', 'ne-wire ne-wire-dragging');
        svg.appendChild(path);

        const r = canvas.getBoundingClientRect();
        const srcDot = canvas.querySelector<HTMLElement>(
            `.ne-port-dot[data-node-id="${srcNode.id}"][data-port-id="${srcPort.id}"][data-port-side="out"]`);
        const srcRect = srcDot?.getBoundingClientRect();
        if (!srcRect) { path.remove(); return; }
        const sx = srcRect.left - r.left + srcRect.width / 2;
        const sy = srcRect.top  - r.top  + srcRect.height / 2;

        const onMove = (e: PointerEvent) => {
            const tx = e.clientX - r.left;
            const ty = e.clientY - r.top;
            path.setAttribute('d', this.#manhattan(sx, sy, tx, ty));
        };
        const onUp = (e: PointerEvent) => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup',   onUp);
            path.remove();
            const tgt = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
            if (tgt?.classList.contains('ne-port-dot') && tgt.dataset.portSide === 'in') {
                this.addWire(srcNode.id, srcPort.id, tgt.dataset.nodeId ?? '', tgt.dataset.portId ?? '');
            }
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup',   onUp);
        onMove(startEv);
    }

    #renderWires(): void {
        const canvas = this.#canvas, svg = this.#svg;
        if (!canvas || !svg) return;
        Array.from(svg.querySelectorAll('.ne-wire:not(.ne-wire-dragging)')).forEach(w => w.remove());

        const r = canvas.getBoundingClientRect();
        for (const w of this.wires$.peek()) {
            const sDot = canvas.querySelector<HTMLElement>(
                `.ne-port-dot[data-node-id="${w.srcNodeId}"][data-port-id="${w.srcPortId}"][data-port-side="out"]`);
            const tDot = canvas.querySelector<HTMLElement>(
                `.ne-port-dot[data-node-id="${w.dstNodeId}"][data-port-id="${w.dstPortId}"][data-port-side="in"]`);
            if (!sDot || !tDot) continue;
            const sR = sDot.getBoundingClientRect();
            const tR = tDot.getBoundingClientRect();
            const sx = sR.left - r.left + sR.width / 2;
            const sy = sR.top  - r.top  + sR.height / 2;
            const tx = tR.left - r.left + tR.width / 2;
            const ty = tR.top  - r.top  + tR.height / 2;
            const path = document.createElementNS(SVG_NS, 'path');
            path.setAttribute('d', this.#manhattan(sx, sy, tx, ty));
            path.setAttribute('class', 'ne-wire ne-wire-' + w.status);
            path.addEventListener('dblclick', () => this.removeWire(w.id));
            svg.appendChild(path);
        }
    }

    #manhattan(sx: number, sy: number, tx: number, ty: number): string {
        const dx = tx - sx;
        const mx = sx + dx * 0.5;
        return `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ty} L ${tx} ${ty}`;
    }

    // ── Public API ────────────────────────────────────────────────────────

    setSchemas(s: NodeSchema[]): this { this.schemas$.set(s); return this; }

    addNode(type: string, x: number, y: number, id?: string): NodeInstance {
        const schema = this.schemas$.peek().find(s => s.type === type);
        if (!schema) throw new Error(`Unknown node schema: ${type}`);
        const node: NodeInstance = {
            id    : id ?? this.#nextId('n'),
            type,
            x, y,
            schema,
            params: {},
        };
        // Defaults
        for (const sp of (schema.params ?? [])) {
            if (sp.default != null) node.params![sp.id] = sp.default;
        }
        this.nodes$.set([...this.nodes$.peek(), node]);
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        self.fire('arianna:node-add',     { detail: { node, source: this }, bubbles: true });
        self.fire('arianna:graph-change', { detail: { source: this }, bubbles: true });
        return node;
    }

    removeNode(id: string): void {
        const node = this.nodes$.peek().find(n => n.id === id);
        if (!node) return;
        // Remove dependent wires
        const remainingWires = this.wires$.peek().filter(w => w.srcNodeId !== id && w.dstNodeId !== id);
        this.wires$.set(remainingWires);
        this.nodes$.set(this.nodes$.peek().filter(n => n.id !== id));
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        self.fire('arianna:node-remove',  { detail: { node, source: this }, bubbles: true });
        self.fire('arianna:graph-change', { detail: { source: this }, bubbles: true });
    }

    addWire(srcNodeId: string, srcPortId: string, dstNodeId: string, dstPortId: string): WireInstance | null {
        const src = this.nodes$.peek().find(n => n.id === srcNodeId);
        const dst = this.nodes$.peek().find(n => n.id === dstNodeId);
        if (!src || !dst) return null;
        const sPort = src.schema.outputs.find(p => p.id === srcPortId);
        const dPort = dst.schema.inputs.find( p => p.id === dstPortId);
        if (!sPort || !dPort) return null;
        const status = this.#typeCheck(sPort.type, dPort.type) ?? 'connected-error';
        // Disconnect any existing wire on the destination port (single-in semantics)
        const existing = this.wires$.peek().filter(w => !(w.dstNodeId === dstNodeId && w.dstPortId === dstPortId));
        const wire: WireInstance = {
            id        : this.#nextId('w'),
            srcNodeId, srcPortId, srcType: sPort.type,
            dstNodeId, dstPortId, dstType: dPort.type,
            status,
        };
        this.wires$.set([...existing, wire]);
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        self.fire('arianna:wire-add',     { detail: { wire, source: this }, bubbles: true });
        self.fire('arianna:graph-change', { detail: { source: this }, bubbles: true });
        return wire;
    }

    removeWire(id: string): void {
        const w = this.wires$.peek().find(x => x.id === id);
        if (!w) return;
        this.wires$.set(this.wires$.peek().filter(x => x.id !== id));
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        self.fire('arianna:wire-remove',  { detail: { wire: w, source: this }, bubbles: true });
        self.fire('arianna:graph-change', { detail: { source: this }, bubbles: true });
    }

    setRunState(s: RunState): this {
        this.runState$.set(s);
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        self.fire('arianna:run-state', { detail: { state: s, source: this }, bubbles: true });
        return this;
    }

    /** Export graph as JSON. */
    export(): { nodes: NodeInstance[]; wires: WireInstance[] } {
        return { nodes: this.nodes$.peek(), wires: this.wires$.peek() };
    }

    /** Load graph from JSON (schemas must already be set). */
    import(g: { nodes: NodeInstance[]; wires: WireInstance[] }): this {
        this.nodes$.set(g.nodes);
        this.wires$.set(g.wires);
        const self = this as unknown as { fire(t: string, init?: CustomEventInit): void };
        self.fire('arianna:graph-change', { detail: { source: this }, bubbles: true });
        return this;
    }

    /** Override the wire compatibility checker. */
    setTypeCheck(fn: TypeCheckFn): this { this.#typeCheck = fn; return this; }

    #nextId(prefix: string): string { return `${prefix}-${++this.#idCounter}-${Date.now().toString(36)}`; }

    static DefaultSheet(): Stylesheet {
        return new Stylesheet([
            new Rule(':host', {
                background  : 'var(--ar-bg, #0d0d0d)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius, 5px)',
                color       : 'var(--ar-text, #e0e0e0)',
                display     : 'block',
                font        : 'var(--ar-font-size, 13px) var(--ar-font, ui-monospace, monospace)',
                height      : '480px',
                overflow    : 'hidden',
                position    : 'relative',
            }),
            new Rule(':host .ne-wrap', {
                display: 'grid',
                gridTemplateColumns: '180px 1fr',
                height: '100%',
            }),
            new Rule(':host .ne-palette', {
                background  : 'var(--ar-bg2, #161616)',
                borderRight : '1px solid var(--ar-border, #2a2a2a)',
                overflow    : 'auto',
                padding     : '6px',
            }),
            new Rule(':host .ne-pal-cat', {
                color       : 'var(--ar-muted, #888)',
                fontSize    : '0.66rem',
                letterSpacing: '0.1em',
                marginBottom: '4px',
                marginTop   : '8px',
                textTransform: 'uppercase',
            }),
            new Rule(':host .ne-pal-item', {
                alignItems  : 'center',
                background  : 'var(--ar-bg3, #1e1e1e)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderLeft  : '3px solid var(--ar-muted, #888)',
                borderRadius: 'var(--ar-radius-sm, 3px)',
                cursor      : 'grab',
                display     : 'flex',
                fontSize    : '0.74rem',
                gap         : '6px',
                marginBottom: '4px',
                padding     : '5px 6px',
            }),
            new Rule(':host .ne-pal-icon', {
                alignItems: 'center',
                background: 'var(--ar-muted, #888)',
                borderRadius: '2px',
                color     : '#000',
                display   : 'inline-flex',
                fontSize  : '0.74rem',
                height    : '18px',
                justifyContent: 'center',
                width     : '18px',
            }),
            new Rule(':host .ne-canvas', {
                background : `radial-gradient(circle, var(--ar-border, #2a2a2a) 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                overflow   : 'auto',
                position   : 'relative',
            }),
            new Rule(':host .ne-svg', {
                height   : '100%',
                left     : '0',
                pointerEvents: 'none',
                position : 'absolute',
                top      : '0',
                width    : '100%',
            }),
            new Rule(':host .ne-node', {
                background  : 'var(--ar-bg2, #161616)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius, 5px)',
                borderTop   : '3px solid var(--ar-primary, #7eb8f7)',
                boxShadow   : 'var(--ar-shadow, 0 2px 8px rgba(0,0,0,.4))',
                minWidth    : NODE_WIDTH + 'px',
                position    : 'absolute',
            }),
            new Rule(':host .ne-node-hdr', {
                alignItems: 'center',
                background: 'var(--ar-primary, #7eb8f7)',
                color     : '#000',
                cursor    : 'move',
                display   : 'flex',
                gap       : '6px',
                padding   : '4px 8px',
                userSelect: 'none',
            }),
            new Rule(':host .ne-node-icon', { fontSize: '0.85rem' }),
            new Rule(':host .ne-node-name', {
                flex      : '1',
                fontSize  : '0.78rem',
                fontWeight: '600',
            }),
            new Rule(':host .ne-node-close', {
                background  : 'transparent',
                border      : '0',
                borderRadius: '2px',
                color       : '#000',
                cursor      : 'pointer',
                font        : 'inherit',
                fontSize    : '0.95rem',
                lineHeight  : '1',
                padding     : '0 4px',
            }),
            new Rule(':host .ne-node-close:hover', { background: 'rgba(0,0,0,0.15)' }),
            new Rule(':host .ne-node-body', { padding: '6px' }),
            new Rule(':host .ne-node-ports', {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
            }),
            new Rule(':host .ne-node-col', { display: 'flex', flexDirection: 'column', gap: '2px' }),
            new Rule(':host .ne-node-col-out', { alignItems: 'flex-end' }),
            new Rule(':host .ne-port-row', {
                alignItems: 'center',
                display   : 'flex',
                fontSize  : '0.72rem',
                gap       : '4px',
                height    : PORT_HEIGHT + 'px',
            }),
            new Rule(':host .ne-port-out', { justifyContent: 'flex-end' }),
            new Rule(':host .ne-port-dot', {
                background  : 'var(--ar-bg3, #1e1e1e)',
                border      : '2px solid var(--ar-primary, #7eb8f7)',
                borderRadius: '50%',
                cursor      : 'pointer',
                display     : 'inline-block',
                height      : '10px',
                width       : '10px',
            }),
            new Rule(':host .ne-port-label', { color: 'var(--ar-muted, #aaa)' }),
            new Rule(':host .ne-node-params', { display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }),
            new Rule(':host .ne-param-row', { display: 'flex', flexDirection: 'column', gap: '2px' }),
            new Rule(':host .ne-param-label', { color: 'var(--ar-muted, #888)', fontSize: '0.65rem' }),
            new Rule(':host .ne-param-input', {
                background  : 'var(--ar-bg3, #1e1e1e)',
                border      : '1px solid var(--ar-border, #2a2a2a)',
                borderRadius: 'var(--ar-radius-sm, 3px)',
                color       : 'var(--ar-text, #e0e0e0)',
                font        : 'inherit',
                fontSize    : '0.72rem',
                padding     : '2px 4px',
            }),
            new Rule(':host .ne-wire', {
                fill        : 'none',
                pointerEvents: 'stroke',
                strokeWidth : '2',
            }),
            new Rule(':host .ne-wire-connected-ok',    { stroke: 'var(--ar-success, #4caf50)' }),
            new Rule(':host .ne-wire-connected-warn',  { stroke: 'var(--ar-warning, #ff9800)' }),
            new Rule(':host .ne-wire-connected-error', { stroke: 'var(--ar-danger,  #f44336)' }),
            new Rule(':host .ne-wire-dragging', {
                stroke         : 'var(--ar-primary, #7eb8f7)',
                strokeDasharray: '4 3',
            }),
        ]);
    }
}

if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'NodeEditor', {
        value: NodeEditor, writable: false, enumerable: false, configurable: false,
    });
}

export default NodeEditor;
