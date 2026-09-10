/**
 * @module components/graphics/2D/LineEditor
 * @author Riccardo Angeli
 * @version 2.1.0
 * @copyright Riccardo Angeli 2012-2026 All Rights Reserved
 * @license MIT / Commercial (dual license)
 *
 * @description
 * Production-oriented 2D line / polyline / spline editor.
 *
 * Behaviour:
 *  - Select: anchor selection, Shift additive selection, marquee rectangle, drag selection.
 *  - Pen: drawing tool. First click sets a start point, pointer movement previews one straight
 *         segment, second click commits that segment and finishes the Pen operation.
 *         Selecting an open endpoint before choosing Pen continues the existing path.
 *  - Curve: point-edit mode entered explicitly, or by clicking an already-selected anchor.
 *           Constant / Linear / Bezier interpolation and draggable in/out tangents are preserved.
 *  - Delete: click a point to delete it, or drag a rectangle to delete every enclosed point.
 */
import { Component, Css, Templates } from '../../../core/index.ts';

const html = Templates.Template.Html;
const SVG_NS = 'http://www.w3.org/2000/svg';

export namespace LineEditor
{
    export namespace Types
    {
        export type Mode = 'select' | 'pen' | 'curve' | 'delete';
        export type Interpolation = 'constant' | 'linear' | 'bezier';
        export type HandleMode = 'corner' | 'smooth' | 'symmetric';
    }

    export namespace Interfaces
    {
        export interface Vec2 { x: number; y: number; }

        /** Interpolation describes the segment LEAVING this anchor. */
        export interface Anchor
        {
            p: Vec2;
            in?: Vec2;
            out?: Vec2;
            interpolation?: Types.Interpolation;
            mode?: Types.HandleMode;
        }

        export interface LineEditorOptions
        {
            anchors?: Anchor[];
            closed?: boolean;
            mode?: Types.Mode;
            interpolation?: Types.Interpolation;
            theme?: 'dark' | 'light';
        }
    }

    interface DragState
    {
        kind: 'anchor' | 'handle-in' | 'handle-out' | 'marquee';
        pointerId: number;
        start: Interfaces.Vec2;
        current: Interfaces.Vec2;
        anchorIndex?: number;
        origin?: Interfaces.Anchor[];
        additive?: boolean;
    }

    interface State
    {
        anchors: Interfaces.Anchor[];
        selected: Set<number>;
        mode: Types.Mode;
        interpolation: Types.Interpolation;
        preview: Interfaces.Vec2 | null;
        hovered: number | null;
        penStart: number | null;
        penDirection: 'append' | 'prepend';
        penSeedCreated: boolean;
        drag: DragState | null;
        marquee: { a: Interfaces.Vec2; b: Interfaces.Vec2 } | null;
    }

    const DEFAULT: Interfaces.Anchor[] = [
        { p:{x:74,y:210},  out:{x:48,y:-95}, interpolation:'bezier', mode:'smooth' },
        { p:{x:230,y:126}, in:{x:-66,y:54}, out:{x:64,y:38}, interpolation:'bezier', mode:'smooth' },
        { p:{x:390,y:190}, in:{x:-58,y:-66}, out:{x:55,y:-48}, interpolation:'bezier', mode:'smooth' },
        { p:{x:540,y:82},  in:{x:-70,y:56}, interpolation:'linear', mode:'smooth' }
    ];

    const Runtime = new WeakMap<HTMLElement, State>();

    const stateOf = (host: HTMLElement): State =>
    {
        let state = Runtime.get(host);
        if(!state)
        {
            state = {
                anchors: structuredClone(DEFAULT),
                selected: new Set([0]),
                mode: 'select',
                interpolation: 'bezier',
                preview: null,
                hovered: null,
                penStart: null,
                penDirection: 'append',
                penSeedCreated: false,
                drag: null,
                marquee: null
            };
            Runtime.set(host, state);
        }
        return state;
    };

    const clamp = (value:number, min:number, max:number):number =>
        Math.max(min, Math.min(max, value));

    export const Styles = new Css.Stylesheet([
        new Css.Rule('arianna-line-editor,.LineEditor',{
            Background:'#202428',Border:'1px solid #111417',BorderRadius:'7px',
            BoxSizing:'border-box',Color:'#e4e8eb',Display:'block',
            FontFamily:'var(--arianna-font,system-ui,sans-serif)',Height:'430px',
            MaxWidth:'100%',MinWidth:'0',Overflow:'hidden',Width:'100%'
        }),
        new Css.Rule('.LineEditor-Shell',{
            Display:'grid',GridTemplateColumns:'minmax(0,1fr) 190px',
            GridTemplateRows:'40px 1fr',Height:'100%'
        }),
        new Css.Rule('.LineEditor-Toolbar',{
            AlignItems:'center',Background:'linear-gradient(180deg,#373c41,#292d31)',
            BorderBottom:'1px solid #111417',Display:'flex',Gap:'5px',
            GridColumn:'1 / span 2',Padding:'6px 8px'
        }),
        new Css.Rule('.LineEditor-Button',{
            Appearance:'none',Background:'linear-gradient(180deg,#41474c,#2d3237)',
            Border:'1px solid #15181a',BorderRadius:'3px',Color:'#c7ced3',
            Cursor:'pointer',Font:'700 9px/1 system-ui',Height:'26px',Padding:'0 8px'
        }),
        new Css.Rule('.LineEditor-Button[data-active="true"]',{
            BorderColor:'#e40c88',Color:'#ff6dbb'
        }),
        new Css.Rule('.LineEditor-Button:disabled',{Opacity:'.45',Cursor:'default'}),
        new Css.Rule('.LineEditor-Stage',{
            BackgroundColor:'#1b1f22',
            BackgroundImage:'linear-gradient(to right,rgba(151,160,169,.12) 1px,transparent 1px),linear-gradient(to bottom,rgba(151,160,169,.12) 1px,transparent 1px)',
            BackgroundSize:'24px 24px',Overflow:'hidden',Position:'relative',
            TouchAction:'none'
        }),
        new Css.Rule('.LineEditor-Svg',{Height:'100%',Width:'100%',TouchAction:'none',UserSelect:'none'}),
        new Css.Rule('.LineEditor-Path',{Fill:'none',Stroke:'#8a62ef',StrokeWidth:'2.2',PointerEvents:'none'}),
        new Css.Rule('.LineEditor-Preview',{
            Fill:'none',Stroke:'#8a62ef',StrokeDasharray:'5 4',
            StrokeOpacity:'.82',StrokeWidth:'1.5',PointerEvents:'none'
        }),
        new Css.Rule('.LineEditor-HandleLine',{
            Stroke:'#8e98a1',StrokeWidth:'1',StrokeDasharray:'2 2',Opacity:'.78',PointerEvents:'none'
        }),
        new Css.Rule('.LineEditor-Anchor',{
            Cursor:'move',Fill:'#fff',Stroke:'#e40c88',StrokeWidth:'2'
        }),
        new Css.Rule('.LineEditor-Anchor[data-selected="true"]',{Fill:'#e40c88',Stroke:'#fff'}),
        new Css.Rule('.LineEditor-Anchor[data-first="true"]',{StrokeWidth:'3'}),
        new Css.Rule('.LineEditor-Handle',{
            Cursor:'crosshair',Fill:'#1b1f22',Stroke:'#9b8cff',StrokeWidth:'1.5'
        }),
        new Css.Rule('.LineEditor-Marquee',{
            Fill:'rgba(228,12,136,.10)',Stroke:'#e40c88',StrokeWidth:'1',
            StrokeDasharray:'5 3',PointerEvents:'none'
        }),
        new Css.Rule('.LineEditor-Side',{
            Background:'#24282c',BorderLeft:'1px solid #111417',
            Display:'grid',Gap:'8px',Padding:'10px',AlignContent:'start'
        }),
        new Css.Rule('.LineEditor-SideTitle',{FontSize:'10px',FontWeight:'800'}),
        new Css.Rule('.LineEditor-Field',{
            Background:'#171b1e',Border:'1px solid #3b4146',BorderRadius:'3px',
            Color:'#e4e8eb',Font:'9px ui-monospace,monospace',Padding:'6px'
        }),
        new Css.Rule('.LineEditor-Hint',{Color:'#8e979f',FontSize:'8px',LineHeight:'1.45'}),
        new Css.Rule('arianna-line-editor[theme="light"],.LineEditor[theme="light"]',{
            Background:'#eef0f2',BorderColor:'#b9bec3',Color:'#25292d'
        }),
        new Css.Rule('arianna-line-editor[theme="light"] .LineEditor-Toolbar',{
            Background:'linear-gradient(180deg,#fff,#e1e4e7)',BorderBottomColor:'#b9bec3'
        }),
        new Css.Rule('arianna-line-editor[theme="light"] .LineEditor-Button',{
            Background:'linear-gradient(180deg,#fff,#e2e5e8)',BorderColor:'#bec4c9',Color:'#4a5259'
        }),
        new Css.Rule('arianna-line-editor[theme="light"] .LineEditor-Stage',{
            BackgroundColor:'#fafafa',
            BackgroundImage:'linear-gradient(to right,#e1e3e5 1px,transparent 1px),linear-gradient(to bottom,#e1e3e5 1px,transparent 1px)'
        }),
        new Css.Rule('arianna-line-editor[theme="light"] .LineEditor-Side',{
            Background:'#f4f5f6',BorderLeftColor:'#c1c6cb'
        }),
        new Css.Rule('arianna-line-editor[theme="light"] .LineEditor-Field',{
            Background:'#fff',BorderColor:'#c4cacf',Color:'#30373d'
        })
    ]);

    @Component('arianna-line-editor', Styles, {
        Shadow: false,
        Attributes: ['theme','mode','closed','interpolation'],
        Properties: ['anchors']
    })
    export class LineEditor extends HTMLElement
    {
        public static readonly Styles = Styles;
        public template = html``;

        private _svg?: SVGSVGElement;
        private _stage?: HTMLDivElement;
        private _side?: HTMLElement;
        private _toolbar?: HTMLElement;
        private _bound = false;

        public onCreated(): void
        {
            if(this.isConnected) this.onConnected();
        }

        public onConnected(): void
        {
            const state = stateOf(this);

            this.classList.add('LineEditor');
            if(!this.hasAttribute('theme')) this.setAttribute('theme','dark');
            if(!this.hasAttribute('tabindex')) this.tabIndex = 0;

            const attrMode = this.getAttribute('mode');
            if(attrMode === 'edit') state.mode = 'select'; // legacy compatibility
            else if(attrMode === 'select' || attrMode === 'pen' || attrMode === 'curve' || attrMode === 'delete')
                state.mode = attrMode;

            const interpolation = this.getAttribute('interpolation') as Types.Interpolation | null;
            if(interpolation === 'constant' || interpolation === 'linear' || interpolation === 'bezier')
                state.interpolation = interpolation;

            this.Build();
            this.Draw();
            this.RenderInspector();
        }

        public get anchors(): Interfaces.Anchor[]
        {
            return structuredClone(stateOf(this).anchors);
        }

        public set anchors(value: Interfaces.Anchor[])
        {
            const state = stateOf(this);
            state.anchors = Array.isArray(value) ? structuredClone(value) : [];
            state.selected = new Set(state.anchors.length ? [0] : []);
            this.Draw();
            this.RenderInspector();
        }

        public get closed(): boolean { return this.hasAttribute('closed'); }

        public set closed(value: boolean)
        {
            this.toggleAttribute('closed', Boolean(value));
            this.Draw();
            this.EmitChange();
        }

        public setMode(value: Types.Mode | 'edit'): this
        {
            const state = stateOf(this);
            state.mode = value === 'edit' ? 'select' : value;
            state.preview = null;
            state.hovered = null;
            state.drag = null;
            state.marquee = null;
            state.penStart = null;
            state.penSeedCreated = false;

            /*
             * Pen is armed only by an actual pointer press.
             * Merely selecting the tool must not start from a previously selected anchor.
             */
            this.setAttribute('mode', state.mode);
            this.SyncToolbar();
            this.Draw();
            this.RenderInspector();
            return this;
        }

        public getMode(): Types.Mode { return stateOf(this).mode; }

        public setInterpolation(value: Types.Interpolation): this
        {
            const state = stateOf(this);
            state.interpolation = value;
            this.setAttribute('interpolation', value);

            const indices = this.SelectedIndices();
            for(const index of indices)
            {
                const anchor = state.anchors[index];
                if(!anchor) continue;

                anchor.interpolation = value;

                if(value === 'bezier')
                {
                    anchor.mode ??= 'smooth';
                    anchor.in ??= {x:-35,y:0};
                    anchor.out ??= {x:35,y:0};
                }
            }

            this.Draw();
            this.RenderInspector();
            this.EmitChange();
            return this;
        }

        public getInterpolation(): Types.Interpolation
        {
            return stateOf(this).interpolation;
        }

        public closePath(): this
        {
            if(stateOf(this).anchors.length >= 3)
            {
                this.setAttribute('closed','');
                stateOf(this).preview = null;
                stateOf(this).penStart = null;
                stateOf(this).penSeedCreated = false;
                this.Draw();
                this.EmitChange();
                this.SyncToolbar();
            }
            return this;
        }

        public openPath(): this
        {
            this.removeAttribute('closed');
            this.Draw();
            this.EmitChange();
            this.SyncToolbar();
            return this;
        }

        public clear(): this
        {
            const state = stateOf(this);
            state.anchors = [];
            state.selected.clear();
            state.preview = null;
            state.hovered = null;
            state.penStart = null;
            state.penSeedCreated = false;
            state.drag = null;
            state.marquee = null;
            this.removeAttribute('closed');
            this.Draw();
            this.RenderInspector();
            this.EmitChange();
            this.SyncToolbar();
            return this;
        }

        public deleteSelection(): this
        {
            const state = stateOf(this);
            const remove = state.selected;
            if(!remove.size) return this;

            state.anchors = state.anchors.filter((_, index) => !remove.has(index));
            state.selected.clear();

            if(state.anchors.length)
                state.selected.add(Math.min(state.anchors.length - 1, 0));

            if(state.anchors.length < 3)
                this.removeAttribute('closed');

            this.Draw();
            this.RenderInspector();
            this.SyncToolbar();
            this.EmitChange();
            return this;
        }

        public addAnchor(anchor: Interfaces.Anchor): this
        {
            const state = stateOf(this);
            const copy = structuredClone(anchor);
            copy.interpolation ??= state.interpolation;
            copy.mode ??= copy.interpolation === 'bezier' ? 'smooth' : 'corner';

            state.anchors.push(copy);
            state.selected = new Set([state.anchors.length - 1]);

            this.Draw();
            this.RenderInspector();
            this.SyncToolbar();
            this.EmitChange();
            return this;
        }

        public removeAnchor(index: number): this
        {
            const state = stateOf(this);
            state.anchors = state.anchors.filter((_, i) => i !== index);

            const next = new Set<number>();
            for(const selected of state.selected)
            {
                if(selected < index) next.add(selected);
                else if(selected > index) next.add(selected - 1);
            }
            state.selected = next;

            if(state.anchors.length < 3)
                this.removeAttribute('closed');

            this.Draw();
            this.RenderInspector();
            this.SyncToolbar();
            this.EmitChange();
            return this;
        }

        public setAnchors(value: Interfaces.Anchor[]): this
        {
            this.anchors = value;
            this.EmitChange();
            return this;
        }

        public getAnchors(): Interfaces.Anchor[] { return this.anchors; }

        public toSVGPath(): string
        {
            const anchors = stateOf(this).anchors;
            if(!anchors.length) return '';

            let d = `M ${anchors[0].p.x} ${anchors[0].p.y}`;

            const segment = (from: Interfaces.Anchor, to: Interfaces.Anchor): string =>
            {
                const interpolation = from.interpolation ?? 'bezier';

                if(interpolation === 'constant')
                    return ` H ${to.p.x} V ${to.p.y}`;

                if(interpolation === 'linear')
                    return ` L ${to.p.x} ${to.p.y}`;

                const c1 = {
                    x: from.p.x + (from.out?.x ?? 0),
                    y: from.p.y + (from.out?.y ?? 0)
                };
                const c2 = {
                    x: to.p.x + (to.in?.x ?? 0),
                    y: to.p.y + (to.in?.y ?? 0)
                };
                return ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${to.p.x} ${to.p.y}`;
            };

            for(let index = 1; index < anchors.length; index++)
                d += segment(anchors[index - 1], anchors[index]);

            if(this.closed && anchors.length > 1)
                d += segment(anchors[anchors.length - 1], anchors[0]) + ' Z';

            return d;
        }

        private Build(): void
        {
            if(this._svg && this.contains(this._svg)) return;

            const shell = document.createElement('section');
            shell.className = 'LineEditor-Shell';

            const toolbar = document.createElement('header');
            toolbar.className = 'LineEditor-Toolbar';
            this._toolbar = toolbar;

            for(const [mode, label] of [
                ['select','Select'],
                ['pen','Pen'],
                ['curve','Curve'],
                ['delete','Delete']
            ] as [Types.Mode,string][])
            {
                const button = document.createElement('button');
                button.className = 'LineEditor-Button';
                button.dataset.mode = mode;
                button.textContent = label;
                button.onclick = () => this.setMode(mode);
                toolbar.appendChild(button);
            }

            const deleteSelected = document.createElement('button');
            deleteSelected.className = 'LineEditor-Button';
            deleteSelected.dataset.action = 'delete-selected';
            deleteSelected.textContent = 'Delete selected';
            deleteSelected.onclick = () => this.deleteSelection();
            toolbar.appendChild(deleteSelected);

            const close = document.createElement('button');
            close.className = 'LineEditor-Button';
            close.dataset.action = 'close';
            close.onclick = () => this.closed ? this.openPath() : this.closePath();
            toolbar.appendChild(close);

            const clear = document.createElement('button');
            clear.className = 'LineEditor-Button';
            clear.textContent = 'Clear';
            clear.onclick = () => this.clear();
            toolbar.appendChild(clear);

            const stage = document.createElement('div');
            stage.className = 'LineEditor-Stage';
            this._stage = stage;

            const svg = document.createElementNS(SVG_NS,'svg');
            svg.setAttribute('class','LineEditor-Svg');
            svg.setAttribute('viewBox','0 0 620 340');
            svg.setAttribute('preserveAspectRatio','none');
            this._svg = svg;
            stage.appendChild(svg);

            const side = document.createElement('aside');
            side.className = 'LineEditor-Side';
            this._side = side;

            shell.append(toolbar, stage, side);
            this.replaceChildren(shell);

            if(!this._bound)
            {
                this._bound = true;
                svg.addEventListener('pointerdown', event => this.OnPointerDown(event));
                svg.addEventListener('pointermove', event => this.OnPointerMove(event));
                svg.addEventListener('pointerup', event => this.OnPointerUp(event));
                svg.addEventListener('pointercancel', event => this.OnPointerUp(event));
                svg.addEventListener('pointerleave', event => this.OnPointerLeave(event));
                svg.addEventListener('dblclick', event => this.OnDoubleClick(event));
                this.addEventListener('keydown', event => this.OnKeyDown(event));
            }

            this.SyncToolbar();
        }

        private SyncToolbar(): void
        {
            const state = stateOf(this);
            if(!this._toolbar) return;

            this._toolbar.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button =>
            {
                button.dataset.active = String(button.dataset.mode === state.mode);
            });

            const del = this._toolbar.querySelector<HTMLButtonElement>('[data-action="delete-selected"]');
            if(del) del.disabled = state.selected.size === 0;

            const close = this._toolbar.querySelector<HTMLButtonElement>('[data-action="close"]');
            if(close)
            {
                close.disabled = state.anchors.length < 3;
                close.textContent = this.closed ? 'Open' : 'Close';
            }
        }

        private Point(event: PointerEvent): Interfaces.Vec2
        {
            const svg = this._svg!;
            const rect = svg.getBoundingClientRect();

            return {
                x: clamp((event.clientX - rect.left) / Math.max(1,rect.width) * 620, 0, 620),
                y: clamp((event.clientY - rect.top) / Math.max(1,rect.height) * 340, 0, 340)
            };
        }

        private SelectedIndices(): number[]
        {
            return [...stateOf(this).selected].sort((a,b)=>a-b);
        }

        private NearestAnchor(point: Interfaces.Vec2, radius=9): number
        {
            const anchors = stateOf(this).anchors;
            let found = -1;
            let best = radius * radius;

            anchors.forEach((anchor,index) =>
            {
                const dx = point.x - anchor.p.x;
                const dy = point.y - anchor.p.y;
                const distance = dx*dx + dy*dy;
                if(distance <= best)
                {
                    best = distance;
                    found = index;
                }
            });
            return found;
        }

        private NearestHandle(point: Interfaces.Vec2, radius=8):
            { index:number; kind:'in'|'out' } | null
        {
            const state = stateOf(this);
            if(state.mode !== 'curve') return null;

            let found: {index:number;kind:'in'|'out'} | null = null;
            let best = radius * radius;

            for(const index of this.SelectedIndices())
            {
                const anchor = state.anchors[index];
                if(!anchor || (anchor.interpolation ?? 'bezier') !== 'bezier') continue;

                for(const kind of ['in','out'] as const)
                {
                    const offset = anchor[kind];
                    if(!offset) continue;

                    const x = anchor.p.x + offset.x;
                    const y = anchor.p.y + offset.y;
                    const dx = point.x - x;
                    const dy = point.y - y;
                    const distance = dx*dx + dy*dy;

                    if(distance <= best)
                    {
                        best = distance;
                        found = { index, kind };
                    }
                }
            }
            return found;
        }

        private OnPointerDown(event: PointerEvent): void
        {
            if(event.button !== 0 || !this._svg) return;
            this.focus({preventScroll:true});

            const state = stateOf(this);
            const point = this.Point(event);
            const target = event.target as Element;

            const anchorNode = target.closest?.('.LineEditor-Anchor') as SVGCircleElement | null;
            const handleNode = target.closest?.('.LineEditor-Handle') as SVGCircleElement | null;
            const nearest = anchorNode
                ? Number(anchorNode.dataset.index)
                : this.NearestAnchor(point, 9);

            /*
             * PEN = Illustrator-style point-to-point drawing.
             *
             * 1. MouseDown on empty space starts a fresh path and places point #1.
             * 2. MouseUp does NOTHING: the rubber-band remains active.
             * 3. PointerMove keeps previewing from the last committed point.
             * 4. Every later MouseDown commits the next point/segment and immediately
             *    arms that point as the origin of the following preview segment.
             * 5. Double-click ends the current path and exits Pen.
             *
             * This component edits one path at a time. Therefore starting Pen on empty
             * space while another path exists starts a fresh path. Clicking an open
             * endpoint instead continues that existing path.
             */
            if(state.mode === 'pen')
            {
                event.preventDefault();
                if(this.closed) return;

                if(state.penStart === null)
                {
                    /*
                     * Continue only when the user explicitly presses an OPEN endpoint.
                     * Previous selection alone never arms Pen.
                     */
                    if(nearest >= 0 && (nearest === 0 || nearest === state.anchors.length - 1))
                    {
                        state.selected = new Set([nearest]);
                        state.penStart = nearest;
                        state.penDirection =
                            nearest === 0 && state.anchors.length > 1
                                ? 'prepend'
                                : 'append';
                        state.penSeedCreated = false;
                        state.preview = point;

                        this.Draw();
                        this.RenderInspector();
                        this.SyncToolbar();
                        return;
                    }

                    /*
                     * Empty-space MouseDown starts a NEW path.
                     * LineEditor is intentionally a single-path editor, so the old path
                     * is replaced rather than silently connected to the new point.
                     */
                    state.anchors = [{
                        p: point,
                        interpolation: 'linear',
                        mode: 'corner'
                    }];
                    state.selected = new Set([0]);
                    state.penStart = 0;
                    state.penDirection = 'append';
                    state.penSeedCreated = true;
                    state.preview = point;
                    this.removeAttribute('closed');

                    this.Draw();
                    this.RenderInspector();
                    this.SyncToolbar();
                    this.EmitChange();
                    return;
                }

                const startIndex = state.penStart;
                const startAnchor = state.anchors[startIndex];
                if(!startAnchor) return;

                /*
                 * The second press of a browser double-click lands on the point just
                 * committed by the first press. Do not manufacture a zero-length point;
                 * the following dblclick event will finish the path.
                 */
                if(nearest === startIndex)
                    return;

                if(state.penDirection === 'prepend')
                {
                    /*
                     * Prepending: the NEW anchor owns the linear segment leaving it.
                     */
                    state.anchors.unshift({
                        p: point,
                        interpolation: 'linear',
                        mode: 'corner'
                    });
                    state.selected = new Set([0]);
                    state.penStart = 0;
                }
                else
                {
                    /*
                     * Appending: interpolation belongs to the anchor the new segment
                     * leaves. Pen always creates straight segments.
                     */
                    startAnchor.interpolation = 'linear';
                    startAnchor.mode = 'corner';
                    startAnchor.in = undefined;
                    startAnchor.out = undefined;

                    state.anchors.push({
                        p: point,
                        interpolation: 'linear',
                        mode: 'corner'
                    });

                    const committed = state.anchors.length - 1;
                    state.selected = new Set([committed]);
                    state.penStart = committed;
                }

                /*
                 * IMPORTANT: Pen REMAINS ACTIVE after committing a segment.
                 * MouseUp cannot terminate this state. The next PointerMove will simply
                 * move this preview away from the newly committed point.
                 */
                state.preview = point;
                state.penSeedCreated = false;

                this.Draw();
                this.RenderInspector();
                this.SyncToolbar();
                this.EmitChange();
                return;
            }

            if(handleNode && state.mode === 'curve')
            {
                event.preventDefault();

                const index = Number(handleNode.dataset.index);
                const kind = handleNode.dataset.kind === 'in' ? 'handle-in' : 'handle-out';

                state.drag = {
                    kind,
                    pointerId:event.pointerId,
                    start:point,
                    current:point,
                    anchorIndex:index
                };

                this._svg.setPointerCapture(event.pointerId);
                return;
            }

            if(nearest >= 0)
            {
                event.preventDefault();
                const index = nearest;

                if(state.mode === 'delete')
                {
                    this.removeAnchor(index);
                    return;
                }

                const wasSelected = state.selected.has(index);

                /* Clicking an already-selected anchor enters point/curve editing. */
                if(state.mode === 'select' && wasSelected && !event.shiftKey)
                {
                    state.selected = new Set([index]);
                    state.hovered = index;
                    state.mode = 'curve';
                    this.setAttribute('mode','curve');
                    this.Draw();
                    this.RenderInspector();
                    this.SyncToolbar();
                    return;
                }

                if(event.shiftKey)
                {
                    if(state.selected.has(index)) state.selected.delete(index);
                    else state.selected.add(index);
                }
                else if(!state.selected.has(index))
                {
                    state.selected = new Set([index]);
                }

                const origin = structuredClone(state.anchors);
                state.drag = {
                    kind:'anchor',
                    pointerId:event.pointerId,
                    start:point,
                    current:point,
                    anchorIndex:index,
                    origin
                };

                this._svg.setPointerCapture(event.pointerId);
                this.Draw();
                this.RenderInspector();
                this.SyncToolbar();
                return;
            }

            /* Blank-space drag = marquee selection. In Delete mode it is delete-rectangle. */
            event.preventDefault();
            if(!event.shiftKey && state.mode !== 'delete')
                state.selected.clear();

            state.hovered = null;
            state.marquee = { a:point, b:point };
            state.drag = {
                kind:'marquee',
                pointerId:event.pointerId,
                start:point,
                current:point,
                additive:event.shiftKey
            };
            this._svg.setPointerCapture(event.pointerId);
            this.Draw();
            this.RenderInspector();
            this.SyncToolbar();
        }

        private OnPointerMove(event: PointerEvent): void
        {
            if(!this._svg) return;
            const state = stateOf(this);
            const point = this.Point(event);

            const drag = state.drag;

            /* Mouse-over preselection: visually select the closest anchor without changing selection state. */
            if(!drag)
            {
                const hovered = this.NearestAnchor(point, 9);
                const nextHovered = hovered >= 0 ? hovered : null;
                if(nextHovered !== state.hovered)
                {
                    state.hovered = nextHovered;
                    this.Draw();
                }

                /* Pen rubber-band exists only after the first point/endpoint is armed. */
                if(state.mode === 'pen' && state.penStart !== null && !this.closed)
                {
                    state.preview = point;
                    this.Draw();
                }
                return;
            }

            if(drag.pointerId !== event.pointerId) return;
            drag.current = point;

            if(drag.kind === 'handle-in' || drag.kind === 'handle-out')
            {
                const index = drag.anchorIndex!;
                const anchor = state.anchors[index];
                if(!anchor) return;

                const kind = drag.kind === 'handle-in' ? 'in' : 'out';
                this.SetHandle(index, kind, point);
                this.Draw();
                this.RenderInspector();
                return;
            }

            if(drag.kind === 'anchor')
            {
                const origin = drag.origin!;
                const dx = point.x - drag.start.x;
                const dy = point.y - drag.start.y;

                for(const index of this.SelectedIndices())
                {
                    const source = origin[index];
                    const anchor = state.anchors[index];
                    if(!source || !anchor) continue;

                    anchor.p = {
                        x: clamp(source.p.x + dx, 0, 620),
                        y: clamp(source.p.y + dy, 0, 340)
                    };
                }

                this.Draw();
                this.RenderInspector();
                return;
            }

            if(drag.kind === 'marquee')
            {
                state.marquee = { a:drag.start, b:point };

                const x1 = Math.min(drag.start.x,point.x);
                const x2 = Math.max(drag.start.x,point.x);
                const y1 = Math.min(drag.start.y,point.y);
                const y2 = Math.max(drag.start.y,point.y);

                if(state.mode !== 'delete')
                {
                    const next = drag.additive ? new Set(state.selected) : new Set<number>();
                    state.anchors.forEach((anchor,index) =>
                    {
                        if(anchor.p.x >= x1 && anchor.p.x <= x2 && anchor.p.y >= y1 && anchor.p.y <= y2)
                            next.add(index);
                    });
                    state.selected = next;
                }

                this.Draw();
                this.RenderInspector();
                this.SyncToolbar();
            }
        }

        private OnPointerUp(event: PointerEvent): void
        {
            if(!this._svg) return;
            const state = stateOf(this);
            const drag = state.drag;
            if(!drag || drag.pointerId !== event.pointerId) return;

            if(drag.kind === 'marquee' && state.mode === 'delete' && state.marquee)
            {
                const {a,b} = state.marquee;
                const x1 = Math.min(a.x,b.x), x2 = Math.max(a.x,b.x);
                const y1 = Math.min(a.y,b.y), y2 = Math.max(a.y,b.y);

                const doomed = new Set<number>();
                state.anchors.forEach((anchor,index) =>
                {
                    if(anchor.p.x >= x1 && anchor.p.x <= x2 && anchor.p.y >= y1 && anchor.p.y <= y2)
                        doomed.add(index);
                });

                if(doomed.size)
                {
                    state.anchors = state.anchors.filter((_,index)=>!doomed.has(index));
                    state.selected.clear();
                    if(state.anchors.length < 3) this.removeAttribute('closed');
                }
            }

            state.drag = null;
            state.marquee = null;

            try
            {
                if(this._svg.hasPointerCapture(event.pointerId))
                    this._svg.releasePointerCapture(event.pointerId);
            }
            catch(_) {}

            this.Draw();
            this.RenderInspector();
            this.SyncToolbar();
            this.EmitChange();
        }

        private OnPointerLeave(_event: PointerEvent): void
        {
            const state = stateOf(this);
            state.hovered = null;

            /*
             * Do NOT cancel Pen on pointer leave. The active origin remains armed,
             * exactly as it does across MouseUp; when the pointer re-enters, the next
             * PointerMove resumes the rubber-band from the last committed point.
             */
            if(state.mode !== 'pen')
                state.preview = null;

            this.Draw();
        }

        private OnDoubleClick(event: MouseEvent): void
        {
            const state = stateOf(this);
            if(state.mode !== 'pen' || state.penStart === null)
                return;

            event.preventDefault();
            event.stopPropagation();

            /*
             * Browser dispatches dblclick after the second click sequence.
             * By then the first click of that pair has already committed the current
             * segment. We only finish; we never add another anchor here.
             */
            state.preview = null;
            state.penStart = null;
            state.penSeedCreated = false;
            state.hovered = null;

            this.setMode('select');
            this.EmitChange();
        }

        private OnKeyDown(event: KeyboardEvent): void
        {
            const state = stateOf(this);

            if(event.key === 'Delete' || event.key === 'Backspace')
            {
                if((event.target as HTMLElement).matches('input,select,textarea')) return;
                event.preventDefault();
                this.deleteSelection();
                return;
            }

            if(event.key === 'Escape')
            {
                state.drag = null;
                state.marquee = null;
                state.preview = null;

                if(state.mode === 'pen')
                {
                    if(state.penSeedCreated && state.penStart !== null && state.anchors.length === 1)
                    {
                        state.anchors = [];
                        state.selected.clear();
                    }
                    state.penStart = null;
                    state.penSeedCreated = false;
                    this.setMode('select');
                }
                else this.Draw();
                return;
            }

            if(event.key === 'Enter' && state.mode === 'pen')
            {
                event.preventDefault();
                state.preview = null;
                state.penStart = null;
                state.penSeedCreated = false;
                this.setMode('select');
                return;
            }

            if((event.key === 'c' || event.key === 'C') && !event.metaKey && !event.ctrlKey)
            {
                if(state.anchors.length >= 3)
                    this.closed ? this.openPath() : this.closePath();
            }
        }

        private SetHandle(index:number, kind:'in'|'out', point:Interfaces.Vec2): void
        {
            const state = stateOf(this);
            const anchor = state.anchors[index];
            if(!anchor) return;

            const offset = { x:point.x-anchor.p.x, y:point.y-anchor.p.y };
            anchor.interpolation = 'bezier';
            anchor.mode ??= 'smooth';
            anchor[kind] = offset;

            const opposite = kind === 'in' ? 'out' : 'in';

            if(anchor.mode === 'symmetric')
            {
                anchor[opposite] = {x:-offset.x,y:-offset.y};
            }
            else if(anchor.mode === 'smooth')
            {
                const old = anchor[opposite] ?? {x:-offset.x,y:-offset.y};
                const oldLength = Math.max(1,Math.hypot(old.x,old.y));
                const length = Math.max(.001,Math.hypot(offset.x,offset.y));
                anchor[opposite] = {
                    x:-(offset.x/length)*oldLength,
                    y:-(offset.y/length)*oldLength
                };
            }
        }

        private Draw(): void
        {
            const svg = this._svg;
            if(!svg) return;

            const state = stateOf(this);
            svg.replaceChildren();

            const path = document.createElementNS(SVG_NS,'path');
            path.setAttribute('class','LineEditor-Path');
            path.setAttribute('d',this.toSVGPath());
            svg.appendChild(path);

            if(state.mode === 'pen' && state.preview && state.penStart !== null && !this.closed)
            {
                const start = state.anchors[state.penStart];
                if(start)
                {
                    const preview = document.createElementNS(SVG_NS,'path');
                    preview.setAttribute('class','LineEditor-Preview');
                    preview.setAttribute('d',
                        `M ${start.p.x} ${start.p.y} L ${state.preview.x} ${state.preview.y}`);
                    svg.appendChild(preview);
                }
            }

            const showHandles = state.mode === 'curve';

            state.anchors.forEach((anchor,index) =>
            {
                const selected = state.selected.has(index);

                // Same conceptual rule as CurveEditor: selected Bézier keys expose in/out tangents.
                if(showHandles && selected && (anchor.interpolation ?? 'bezier') === 'bezier')
                {
                    anchor.in ??= {x:-35,y:0};
                    anchor.out ??= {x:35,y:0};

                    for(const kind of ['in','out'] as const)
                    {
                        const offset = anchor[kind]!;
                        const hx = anchor.p.x + offset.x;
                        const hy = anchor.p.y + offset.y;

                        const line = document.createElementNS(SVG_NS,'line');
                        line.setAttribute('class','LineEditor-HandleLine');
                        line.setAttribute('x1',String(anchor.p.x));
                        line.setAttribute('y1',String(anchor.p.y));
                        line.setAttribute('x2',String(hx));
                        line.setAttribute('y2',String(hy));
                        svg.appendChild(line);

                        const handle = document.createElementNS(SVG_NS,'circle');
                        handle.setAttribute('class','LineEditor-Handle');
                        handle.setAttribute('cx',String(hx));
                        handle.setAttribute('cy',String(hy));
                        handle.setAttribute('r','3');
                        handle.dataset.index = String(index);
                        handle.dataset.kind = kind;
                        svg.appendChild(handle);
                    }
                }

                const circle = document.createElementNS(SVG_NS,'circle');
                circle.setAttribute('class','LineEditor-Anchor');
                circle.setAttribute('cx',String(anchor.p.x));
                circle.setAttribute('cy',String(anchor.p.y));
                circle.setAttribute('r', index===0 && state.mode==='pen' ? '2.8' : '2.5');
                circle.dataset.index = String(index);
                circle.dataset.selected = String(selected || state.hovered === index);
                circle.dataset.first = String(index===0);
                svg.appendChild(circle);
            });

            if(state.marquee)
            {
                const {a,b} = state.marquee;
                const x = Math.min(a.x,b.x);
                const y = Math.min(a.y,b.y);
                const width = Math.abs(b.x-a.x);
                const height = Math.abs(b.y-a.y);

                const rect = document.createElementNS(SVG_NS,'rect');
                rect.setAttribute('class','LineEditor-Marquee');
                rect.setAttribute('x',String(x));
                rect.setAttribute('y',String(y));
                rect.setAttribute('width',String(width));
                rect.setAttribute('height',String(height));
                svg.appendChild(rect);
            }
        }

        private RenderInspector(): void
        {
            const side = this._side;
            if(!side) return;

            const state = stateOf(this);
            side.replaceChildren();

            const title = document.createElement('div');
            title.className = 'LineEditor-SideTitle';
            title.textContent =
                state.mode === 'curve'
                    ? 'Curve'
                    : `${state.selected.size} selected`;
            side.appendChild(title);

            const selected = this.SelectedIndices();
            const index = selected.length === 1 ? selected[0] : -1;
            const anchor = index >= 0 ? state.anchors[index] : undefined;

            if(anchor)
            {
                for(const [label,value,setter] of [
                    ['X',anchor.p.x,(v:number)=>anchor.p.x=v],
                    ['Y',anchor.p.y,(v:number)=>anchor.p.y=v]
                ] as [string,number,(value:number)=>void][])
                {
                    const input = document.createElement('input');
                    input.className = 'LineEditor-Field';
                    input.type = 'number';
                    input.title = label;
                    input.value = String(Math.round(value*10)/10);
                    input.onchange = () =>
                    {
                        setter(Number(input.value));
                        this.Draw();
                        this.EmitChange();
                    };
                    side.appendChild(input);
                }
            }

            if(anchor && state.anchors.length >= 3)
            {
                const close = document.createElement('button');
                close.type = 'button';
                close.className = 'LineEditor-Button';
                close.dataset.action = 'inspector-close';
                close.textContent = this.closed ? 'Open' : 'Close';
                close.title = this.closed ? 'Open path' : 'Close path';
                close.style.width = '100%';
                close.onclick = () =>
                {
                    this.closed ? this.openPath() : this.closePath();
                    this.RenderInspector();
                };
                side.appendChild(close);
            }

            /*
             * CurveEditor parity: same Constant / Linear / Bezier segment model.
             * When Curve mode is active, the selected key also exposes tangent mode.
             */
            if(state.mode === 'curve' && selected.length)
            {
                const interpolation = document.createElement('select');
                interpolation.className = 'LineEditor-Field';
                interpolation.title = 'Interpolation';
                interpolation.innerHTML =
                    '<option value="constant">Constant</option>' +
                    '<option value="linear">Linear</option>' +
                    '<option value="bezier">Bezier</option>';

                const first = state.anchors[selected[0]];
                interpolation.value = first?.interpolation ?? state.interpolation;
                interpolation.onchange = () =>
                    this.setInterpolation(interpolation.value as Types.Interpolation);
                side.appendChild(interpolation);

                if(selected.length === 1 && anchor &&
                   (anchor.interpolation ?? 'bezier') === 'bezier')
                {
                    const handles = document.createElement('select');
                    handles.className = 'LineEditor-Field';
                    handles.title = 'Tangents';
                    handles.innerHTML =
                        '<option value="corner">Corner</option>' +
                        '<option value="smooth">Smooth</option>' +
                        '<option value="symmetric">Symmetric</option>';
                    handles.value = anchor.mode ?? 'smooth';
                    handles.onchange = () =>
                    {
                        anchor.mode = handles.value as Types.HandleMode;
                        this.Draw();
                        this.EmitChange();
                    };
                    side.appendChild(handles);
                }
            }

            const hint = document.createElement('div');
            hint.className = 'LineEditor-Hint';

            if(state.mode === 'pen')
                hint.textContent =
                    'Pen: MouseDown places a point; MouseUp does not finish. Move to preview the next straight segment, MouseDown again to commit it and continue. Double-click finishes and exits Pen.';
            else if(state.mode === 'curve')
                hint.textContent =
                    'Curve: select points, choose Constant / Linear / Bezier exactly like CurveEditor, then drag the visible in/out tangents.';
            else if(state.mode === 'delete')
                hint.textContent =
                    'Delete: click one point, or drag a rectangle around many points to delete them together.';
            else
                hint.textContent =
                    'Select: click/Shift-click points, drag a selection rectangle, drag selected points together. Delete/Backspace removes selection.';

            side.appendChild(hint);
        }

        private EmitChange(): void
        {
            const detail = {
                anchors: this.getAnchors(),
                selected: this.SelectedIndices(),
                closed: this.closed,
                path: this.toSVGPath(),
                source: this
            };

            this.dispatchEvent(new CustomEvent('arianna:line-change',{
                bubbles:true, composed:true, detail
            }));

            this.dispatchEvent(new CustomEvent('arianna:change',{
                bubbles:true, composed:true, detail
            }));
        }
    }
}

export type Vec2 = LineEditor.Interfaces.Vec2;
export type Anchor = LineEditor.Interfaces.Anchor;
export type LineMode = LineEditor.Types.Mode;
export type LineInterpolation = LineEditor.Types.Interpolation;
export type HandleMode = LineEditor.Types.HandleMode;
export type LineEditorOptions = LineEditor.Interfaces.LineEditorOptions;

export const LineEditorComponent = LineEditor.LineEditor;
export default LineEditor.LineEditor;
