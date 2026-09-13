/**
 * @module components/animations/CurveEditor
 * @version 2.0.0
 */
import { Component, Css, Templates } from '../../core/index.ts';

const html = Templates.Template.Html;
const SVG_NS = 'http://www.w3.org/2000/svg';

export namespace CurveEditor
{
    export namespace Interfaces
    {
        export interface CurvePoint
        {
            frame: number;
            value: number;
            selected?: boolean;
            interp?: 'constant' | 'linear' | 'bezier' | string;
            hIn?: [number, number];
            hOut?: [number, number];
        }

        export interface CurveSample
        {
            track?: Element;
            channel?: string;
            group?: string;
            points: CurvePoint[];
        }

        export interface CurveEditorOptions
        {
            width?: number;
            height?: number;
            channel?: string;
            samples?: CurveSample[];
        }
    }

    export const Styles = new Css.Stylesheet([
        new Css.Rule('.CurveEditor', {
            Background: '#181b1e', Border: '1px solid #15181a', BorderRadius: '8px',
            BoxSizing: 'border-box', Color: '#dde1e4', Display: 'block', MinHeight: '260px',
            MinWidth: '0', Overflow: 'hidden', Width: '100%'
        }),
        new Css.Rule('.CurveEditor-Toolbar', {
            AlignItems: 'center', Background: 'linear-gradient(180deg,#363b40 0%,#25292d 100%)',
            BorderBottom: '1px solid #0f1113', Display: 'flex', Gap: '7px', Height: '38px',
            Padding: '5px 8px'
        }),
        new Css.Rule('.CurveEditor-Button, .CurveEditor-Select', {
            Appearance: 'none', Background: '#303439', Border: '1px solid #15181a', BorderRadius: '4px',
            Color: '#dde1e4', Font: '11px/1 var(--arianna-font, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif)',
            Height: '26px', Outline: 'none'
        }),
        new Css.Rule('.CurveEditor-Button', { Cursor: 'pointer', MinWidth: '28px', Padding: '0 7px' }),
        new Css.Rule('.CurveEditor-Select', { Cursor: 'pointer', MinWidth: '94px', Padding: '0 24px 0 8px' }),
        new Css.Rule('.CurveEditor-Color', {
            Border: '1px solid rgba(255,255,255,.25)', BorderRadius: '50%', Height: '12px', Width: '12px'
        }),
        new Css.Rule('.CurveEditor-Color[data-group="position"]', { Background: '#4b9ee9' }),
        new Css.Rule('.CurveEditor-Color[data-group="rotation"]', { Background: '#e69a45' }),
        new Css.Rule('.CurveEditor-Color[data-group="scale"]', { Background: '#42bd50' }),
        new Css.Rule('.CurveEditor-Canvas', { Background: '#202428', Display: 'block', Height: 'calc(100% - 38px)', MinHeight: '220px' }),
        new Css.Rule('.CurveEditor-Svg', { Display: 'block', Height: '100%', Overflow: 'visible', Width: '100%' }),
        new Css.Rule('.CurveEditor-Grid', { Stroke: '#383d42', StrokeWidth: '1' }),
        new Css.Rule('.CurveEditor-Axis', { Stroke: '#737b83', StrokeWidth: '1' }),
        new Css.Rule('.CurveEditor-Label', {
            Fill: '#9ca4ab', FontFamily: 'var(--arianna-font, system-ui, sans-serif)', FontSize: '10px'
        }),
        new Css.Rule('.CurveEditor-Curve', { Fill: 'none', StrokeWidth: '2' }),
        new Css.Rule('.CurveEditor-Key', {
            Cursor: 'pointer', Stroke: '#dfe3e7', StrokeWidth: '1.2'
        }),
        new Css.Rule('.CurveEditor-Key[data-selected="true"]', { Stroke: '#ef8d2f', StrokeWidth: '2.4' }),
        new Css.Rule('.CurveEditor-HandleLine', { Opacity: '.55', StrokeWidth: '1' }),
        new Css.Rule('.CurveEditor-Handle', { Stroke: '#ffffff', StrokeWidth: '1' }),
        new Css.Rule('.CurveEditor-Playhead', { Stroke: '#e24d47', StrokeWidth: '1.8' }),

        new Css.Rule('.CurveEditor[theme="light"]', { Background: '#eef0f2', BorderColor: '#b9bec3', Color: '#25292d' }),
        new Css.Rule('.CurveEditor[theme="light"] .CurveEditor-Toolbar', { Background: 'linear-gradient(180deg,#f9fafb,#dfe3e6)', BorderBottomColor: '#b9bec3' }),
        new Css.Rule('.CurveEditor[theme="light"] .CurveEditor-Button, .CurveEditor[theme="light"] .CurveEditor-Select', { Background: '#fff', BorderColor: '#b9bec3', Color: '#383e43' }),
        new Css.Rule('.CurveEditor[theme="light"] .CurveEditor-Color', { BorderColor: 'rgba(0,0,0,.14)' }),
        new Css.Rule('.CurveEditor[theme="light"] .CurveEditor-Canvas', { Background: '#fafafa' }),
        new Css.Rule('.CurveEditor[theme="light"] .CurveEditor-Grid', { Stroke: '#dedfe1' }),
        new Css.Rule('.CurveEditor[theme="light"] .CurveEditor-Axis', { Stroke: '#c8ccd0' }),
        new Css.Rule('.CurveEditor[theme="light"] .CurveEditor-Label', { Fill: '#697077' }),
        new Css.Rule('.CurveEditor[theme="light"] .CurveEditor-Key', { Stroke: '#4a5158' }),
        new Css.Rule('.CurveEditor[theme="light"] .CurveEditor-Handle', { Stroke: '#383e43' }),
    ]);

    @Component('arianna-curve-editor', Styles, {
        Shadow: false,
        Attributes: ['width', 'height', 'channel'],
        Properties: ['samples']
    })
    export class CurveEditor extends HTMLElement
    {
        public static readonly Styles = Styles;
        public template = html``;

        private _samples?: Interfaces.CurveSample[];
        private _bound?: Element;
        private _playhead?: number;
        private _svg?: SVGSVGElement;
        private _resize?: ResizeObserver;
        private _showHandles?: boolean;
        private _drag?: { sample: number; point: number; kind: 'point' | 'hIn' | 'hOut'; pointerId: number } | null;
        private _view?: {
            left: number; top: number; plotW: number; plotH: number;
            fMin: number; fMax: number; vMin: number; vMax: number;
        };

        constructor(options: Interfaces.CurveEditorOptions = {})
        {
            super();
            this.EnsureState();
            if(options.width != null) this.setAttribute('width', String(options.width));
            if(options.height != null) this.setAttribute('height', String(options.height));
            if(options.channel) this.setAttribute('channel', options.channel);
            if(options.samples) this._samples = options.samples;
        }

        public get samples(): Interfaces.CurveSample[]
        {
            this.EnsureState();
            return this._samples ?? [];
        }

        public set samples(value: Interfaces.CurveSample[])
        {
            this.EnsureState();
            this._samples = Array.isArray(value) ? value : [];
            if(this.isConnected) this.Redraw();
        }

        public onConnected(): void
        {
            this.EnsureState();
            this.classList.add('CurveEditor');
            if(!this.hasAttribute('channel')) this.setAttribute('channel', 'Channel');
            if(!this.hasAttribute('height')) this.setAttribute('height', '300');
            if(!this.hasAttribute('tabindex')) this.tabIndex = 0;
            this.Render();
        }

        public onCreated(): void
        {
            requestAnimationFrame(() => { if(this.isConnected) this.onConnected(); });
        }

        public onUnmount(): void { this._resize?.disconnect(); }

        public bindEditor(editor: Element): this
        {
            this.EnsureState();
            this._bound = editor;
            editor.addEventListener('arianna:keyframe-editor-update', () => this.Refresh());
            editor.addEventListener('arianna:keyframe-editor-playhead', event =>
            {
                const frame = (event as CustomEvent<{ frame: number }>).detail?.frame;
                if(Number.isFinite(frame))
                {
                    this._playhead = frame;
                    this.Redraw();
                }
            });
            this.Refresh();
            return this;
        }

        private EnsureState(): void
        {
            if(!Array.isArray(this._samples)) this._samples = [];
            if(typeof this._playhead !== 'number' || !Number.isFinite(this._playhead)) this._playhead = 0;
            if(typeof this._showHandles !== 'boolean') this._showHandles = true;
            if(this._drag === undefined) this._drag = null;
        }

        private Render(): void
        {
            this.EnsureState();

            const toolbar = document.createElement('div');
            toolbar.className = 'CurveEditor-Toolbar';

            const menu = document.createElement('button');
            menu.type = 'button';
            menu.className = 'CurveEditor-Button';
            menu.textContent = '◧';
            menu.title = 'Channels';

            const channel = document.createElement('select');
            channel.className = 'CurveEditor-Select';
            channel.dataset.role = 'channel';

            for(const group of ['position', 'rotation', 'scale'])
            {
                const dot = document.createElement('span');
                dot.className = 'CurveEditor-Color';
                dot.dataset.group = group;
                toolbar.append(dot);
            }

            const interpolation = document.createElement('select');
            interpolation.className = 'CurveEditor-Select';
            interpolation.dataset.role = 'interpolation';
            ['Auto', 'Bezier', 'Linear', 'Constant'].forEach(label =>
            {
                const item = document.createElement('option');
                item.textContent = label;
                item.value = label.toLowerCase();
                interpolation.append(item);
            });

            const handles = document.createElement('button');
            handles.type = 'button';
            handles.className = 'CurveEditor-Button';
            handles.textContent = '⑂';
            handles.title = 'Bezier handles';
            handles.dataset.active = String(this._showHandles);

            toolbar.insertBefore(menu, toolbar.firstChild);
            toolbar.insertBefore(channel, toolbar.children[1] ?? null);
            toolbar.append(interpolation, handles);

            const canvas = document.createElement('div');
            canvas.className = 'CurveEditor-Canvas';
            const svg = document.createElementNS(SVG_NS, 'svg');
            svg.classList.add('CurveEditor-Svg');
            canvas.append(svg);
            this._svg = svg;

            this.replaceChildren(toolbar, canvas);
            this.RefreshChannelOptions();

            channel.addEventListener('change', () =>
            {
                this.setAttribute('channel', channel.value);
                this.Redraw();
            });

            interpolation.addEventListener('change', () =>
            {
                const value = interpolation.value === 'auto' ? 'bezier' : interpolation.value;
                for(const sample of this._samples ?? [])
                {
                    for(const point of sample.points)
                    {
                        if(!point.selected) continue;
                        point.interp = value;
                        const source = (point as Interfaces.CurvePoint & { source?: Element }).source;
                        source?.setAttribute('interpolation', value);
                    }
                }
                this.EmitChange('interpolation');
                this.Redraw();
            });

            handles.addEventListener('click', () =>
            {
                this._showHandles = !this._showHandles;
                handles.dataset.active = String(this._showHandles);
                this.Redraw();
            });

            svg.addEventListener('pointerdown', event => this.PointerDown(event));
            svg.addEventListener('pointermove', event => this.PointerMove(event));
            svg.addEventListener('pointerup', event => this.PointerUp(event));
            svg.addEventListener('pointercancel', event => this.PointerUp(event));
            svg.addEventListener('dblclick', event => this.AddPointAt(event));

            this._resize?.disconnect();
            if(typeof ResizeObserver !== 'undefined')
            {
                this._resize = new ResizeObserver(() => this.Redraw());
                this._resize.observe(canvas);
            }
            requestAnimationFrame(() => this.Redraw());
        }

        private RefreshChannelOptions(): void
        {
            const select = this.querySelector<HTMLSelectElement>('.CurveEditor-Select[data-role="channel"]');
            if(!select) return;
            const current = this.getAttribute('channel') ?? '';
            const channels = Array.from(new Set((this._samples ?? []).map(sample => sample.channel).filter((value): value is string => Boolean(value))));
            if(!channels.length) channels.push(current || 'Channel');
            select.replaceChildren(...channels.map(name =>
            {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                option.selected = name === current || (!current && name === channels[0]);
                return option;
            }));
            if(!select.value && channels[0]) select.value = channels[0];
        }

        private Refresh(): void
        {
            this.EnsureState();
            if(!this._bound) return;
            const samples: Interfaces.CurveSample[] = [];
            for(const track of Array.from(this._bound.querySelectorAll('arianna-anim-track, .AnimTrack')))
            {
                if(track.hasAttribute('hidden')) continue;
                const points = Array.from(track.querySelectorAll('arianna-keyframe, .Keyframe')).map(keyframe =>
                {
                    const point: Interfaces.CurvePoint & { source?: Element } = {
                        frame: Number(keyframe.getAttribute('frame') ?? 0) || 0,
                        value: Number(keyframe.getAttribute('value') ?? 0) || 0,
                        selected: keyframe.hasAttribute('selected'),
                        interp: keyframe.getAttribute('interpolation') ?? 'bezier',
                        hIn: [-16, 0],
                        hOut: [16, 0],
                        source: keyframe
                    };
                    return point;
                }).sort((a, b) => a.frame - b.frame);
                if(points.length) samples.push({
                    track,
                    channel: track.getAttribute('name') ?? undefined,
                    group: track.getAttribute('group') ?? 'custom',
                    points
                });
            }
            this._samples = samples;
            this.RefreshChannelOptions();
            this.Redraw();
        }

        private ActiveSamples(): Interfaces.CurveSample[]
        {
            const selected = this.getAttribute('channel');
            const all = this._samples ?? [];
            const filtered = selected ? all.filter(sample => sample.channel === selected) : all;
            return filtered.length ? filtered : all;
        }

        private Redraw(): void
        {
            this.EnsureState();
            const svg = this._svg;
            if(!svg) return;
            svg.replaceChildren();

            const canvas = svg.parentElement;
            const width = Number(this.getAttribute('width') ?? 0) || canvas?.clientWidth || 640;
            const height = Number(this.getAttribute('height') ?? 0) || canvas?.clientHeight || 300;
            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

            const samples = this.ActiveSamples();
            if(!samples.length) return;

            const left = 46, right = 14, top = 14, bottom = 28;
            const plotW = Math.max(1, width - left - right);
            const plotH = Math.max(1, height - top - bottom);
            const points = samples.flatMap(sample => sample.points);
            let fMin = Math.min(...points.map(point => point.frame));
            let fMax = Math.max(...points.map(point => point.frame));
            let vMin = Math.min(...points.map(point => point.value));
            let vMax = Math.max(...points.map(point => point.value));
            if(fMin === fMax) { fMin -= 1; fMax += 1; }
            if(vMin === vMax) { vMin -= 1; vMax += 1; }
            const fPad = Math.max(1, (fMax - fMin) * .04);
            const vPad = Math.max(1, (vMax - vMin) * .12);
            fMin -= fPad; fMax += fPad; vMin -= vPad; vMax += vPad;
            this._view = { left, top, plotW, plotH, fMin, fMax, vMin, vMax };

            const x = (frame: number) => left + ((frame - fMin) / (fMax - fMin)) * plotW;
            const y = (value: number) => top + plotH - ((value - vMin) / (vMax - vMin)) * plotH;

            for(let i = 0; i <= 5; i++)
            {
                const gx = left + plotW * i / 5;
                const gy = top + plotH * i / 5;
                this.Line(svg, gx, top, gx, top + plotH, 'CurveEditor-Grid');
                this.Line(svg, left, gy, left + plotW, gy, 'CurveEditor-Grid');

                const tx = this.Text(svg, gx, height - 8, String(Math.round(fMin + (fMax - fMin) * i / 5)));
                tx.setAttribute('text-anchor', 'middle');
                const ty = this.Text(svg, left - 9, gy + 3, this.Format(vMax - (vMax - vMin) * i / 5));
                ty.setAttribute('text-anchor', 'end');
            }
            this.Line(svg, left, top + plotH, left + plotW, top + plotH, 'CurveEditor-Axis');
            this.Line(svg, left, top, left, top + plotH, 'CurveEditor-Axis');

            for(const sample of samples)
            {
                const sourceSampleIndex = (this._samples ?? []).indexOf(sample);
                if(!sample.points.length || sourceSampleIndex < 0) continue;
                const color = this.Color(sample.group);
                const path = document.createElementNS(SVG_NS, 'path');
                path.classList.add('CurveEditor-Curve');
                path.setAttribute('stroke', color);
                let d = '';
                sample.points.forEach((point, index) =>
                {
                    const px = x(point.frame), py = y(point.value);
                    if(index === 0) d = `M ${px} ${py}`;
                    else
                    {
                        const previous = sample.points[index - 1];
                        if((point.interp ?? 'bezier') === 'constant') d += ` H ${px} V ${py}`;
                        else if((point.interp ?? 'bezier') === 'linear') d += ` L ${px} ${py}`;
                        else
                        {
                            const h1 = previous.hOut ?? [16, 0];
                            const h2 = point.hIn ?? [-16, 0];
                            d += ` C ${x(previous.frame + h1[0])} ${y(previous.value + h1[1])} ${x(point.frame + h2[0])} ${y(point.value + h2[1])} ${px} ${py}`;
                        }
                    }
                });
                path.setAttribute('d', d);
                svg.append(path);

                sample.points.forEach((point, pointIndex) =>
                {
                    if(this._showHandles && point.selected && (point.interp ?? 'bezier') === 'bezier')
                    {
                        this.Handle(svg, x, y, point, point.hIn ?? [-16, 0], color, sourceSampleIndex, pointIndex, 'hIn');
                        this.Handle(svg, x, y, point, point.hOut ?? [16, 0], color, sourceSampleIndex, pointIndex, 'hOut');
                    }
                    const key = document.createElementNS(SVG_NS, 'circle');
                    key.classList.add('CurveEditor-Key');
                    key.dataset.selected = String(Boolean(point.selected));
                    key.dataset.sample = String(sourceSampleIndex);
                    key.dataset.point = String(pointIndex);
                    key.dataset.kind = 'point';
                    key.setAttribute('cx', String(x(point.frame)));
                    key.setAttribute('cy', String(y(point.value)));
                    key.setAttribute('r', point.selected ? '4.5' : '3.8');
                    key.setAttribute('fill', color);
                    svg.append(key);
                });
            }

            if((this._playhead ?? 0) >= fMin && (this._playhead ?? 0) <= fMax)
                this.Line(svg, x(this._playhead ?? 0), top, x(this._playhead ?? 0), top + plotH, 'CurveEditor-Playhead');
        }

        private PointerDown(event: PointerEvent): void
        {
            this.EnsureState();
            const target = event.target as SVGElement | null;
            const interactive = target?.closest('.CurveEditor-Key, .CurveEditor-Handle') as SVGElement | null;
            if(!interactive)
            {
                const point = this.EventToData(event);
                if(point)
                {
                    this._playhead = Math.round(point.frame);
                    this.dispatchEvent(new CustomEvent('arianna:curve-playhead', {
                        bubbles: true, composed: true, detail: { frame: this._playhead, source: this }
                    }));
                    this.Redraw();
                }
                return;
            }

            const sampleIndex = Number(interactive.dataset.sample);
            const pointIndex = Number(interactive.dataset.point);
            const kind = (interactive.dataset.kind ?? 'point') as 'point' | 'hIn' | 'hOut';
            if(!Number.isInteger(sampleIndex) || !Number.isInteger(pointIndex)) return;
            const sample = this._samples?.[sampleIndex];
            const point = sample?.points[pointIndex];
            if(!sample || !point) return;

            if(kind === 'point')
            {
                for(const current of this._samples ?? [])
                    for(const candidate of current.points)
                        candidate.selected = candidate === point || (event.shiftKey && Boolean(candidate.selected));
                const interpolation = this.querySelector<HTMLSelectElement>('.CurveEditor-Select[data-role="interpolation"]');
                if(interpolation) interpolation.value = (point.interp ?? 'bezier') === 'bezier' ? 'bezier' : String(point.interp);
            }

            this._drag = { sample: sampleIndex, point: pointIndex, kind, pointerId: event.pointerId };
            this._svg?.setPointerCapture?.(event.pointerId);
            event.preventDefault();
            this.focus();
            this.Redraw();
        }

        private PointerMove(event: PointerEvent): void
        {
            const drag = this._drag;
            if(!drag || drag.pointerId !== event.pointerId) return;
            const sample = this._samples?.[drag.sample];
            const point = sample?.points[drag.point];
            const data = this.EventToData(event);
            if(!sample || !point || !data) return;

            if(drag.kind === 'point')
            {
                point.frame = Math.round(data.frame);
                point.value = Math.round(data.value * 1000) / 1000;
                const source = (point as Interfaces.CurvePoint & { source?: Element }).source;
                source?.setAttribute('frame', String(point.frame));
                source?.setAttribute('value', String(point.value));
            }
            else
            {
                const offset: [number, number] = [
                    Math.round((data.frame - point.frame) * 100) / 100,
                    Math.round((data.value - point.value) * 1000) / 1000
                ];
                if(drag.kind === 'hIn') point.hIn = offset;
                else point.hOut = offset;
            }
            this.Redraw();
            this.EmitChange('drag');
        }

        private PointerUp(event: PointerEvent): void
        {
            if(!this._drag || this._drag.pointerId !== event.pointerId) return;
            try { this._svg?.releasePointerCapture?.(event.pointerId); } catch { /* no-op */ }
            this._drag = null;
            this.EmitChange('commit');
        }

        private AddPointAt(event: MouseEvent): void
        {
            if((event.target as Element | null)?.closest('.CurveEditor-Key, .CurveEditor-Handle')) return;
            const data = this.EventToData(event);
            const samples = this.ActiveSamples();
            const sample = samples[0];
            if(!data || !sample) return;
            for(const current of this._samples ?? []) for(const point of current.points) point.selected = false;
            const point: Interfaces.CurvePoint = {
                frame: Math.round(data.frame),
                value: Math.round(data.value * 1000) / 1000,
                interp: 'bezier',
                selected: true,
                hIn: [-16, 0],
                hOut: [16, 0]
            };
            sample.points.push(point);
            sample.points.sort((a, b) => a.frame - b.frame);
            this.EmitChange('add');
            this.Redraw();
        }

        private EventToData(event: MouseEvent | PointerEvent): { frame: number; value: number } | null
        {
            const svg = this._svg;
            const view = this._view;
            if(!svg || !view) return null;
            const rect = svg.getBoundingClientRect();
            if(rect.width <= 0 || rect.height <= 0) return null;
            const sx = (event.clientX - rect.left) * (svg.viewBox.baseVal.width / rect.width);
            const sy = (event.clientY - rect.top) * (svg.viewBox.baseVal.height / rect.height);
            const px = Math.max(view.left, Math.min(view.left + view.plotW, sx));
            const py = Math.max(view.top, Math.min(view.top + view.plotH, sy));
            const frame = view.fMin + ((px - view.left) / view.plotW) * (view.fMax - view.fMin);
            const value = view.vMax - ((py - view.top) / view.plotH) * (view.vMax - view.vMin);
            return { frame, value };
        }

        private EmitChange(kind: string): void
        {
            this.dispatchEvent(new CustomEvent('arianna:curve-change', {
                bubbles: true, composed: true,
                detail: { kind, samples: this._samples ?? [], source: this }
            }));
            this._bound?.dispatchEvent(new CustomEvent('arianna:keyframe-editor-update', {
                bubbles: true, composed: true, detail: { source: this }
            }));
        }

        private Handle(
            svg: SVGSVGElement,
            x: (frame: number) => number,
            y: (value: number) => number,
            point: Interfaces.CurvePoint,
            offset: [number, number],
            color: string,
            sampleIndex: number,
            pointIndex: number,
            kind: 'hIn' | 'hOut'
        ): void
        {
            const x1 = x(point.frame), y1 = y(point.value);
            const x2 = x(point.frame + offset[0]), y2 = y(point.value + offset[1]);
            const line = this.Line(svg, x1, y1, x2, y2, 'CurveEditor-HandleLine');
            line.setAttribute('stroke', color);
            const handle = document.createElementNS(SVG_NS, 'circle');
            handle.classList.add('CurveEditor-Handle');
            handle.dataset.sample = String(sampleIndex);
            handle.dataset.point = String(pointIndex);
            handle.dataset.kind = kind;
            handle.setAttribute('cx', String(x2));
            handle.setAttribute('cy', String(y2));
            handle.setAttribute('r', '3');
            handle.setAttribute('fill', color);
            svg.append(handle);
        }

        private Line(svg: SVGSVGElement, x1: number, y1: number, x2: number, y2: number, cls: string): SVGLineElement
        {
            const line = document.createElementNS(SVG_NS, 'line');
            line.classList.add(cls);
            line.setAttribute('x1', String(x1)); line.setAttribute('y1', String(y1));
            line.setAttribute('x2', String(x2)); line.setAttribute('y2', String(y2));
            svg.append(line);
            return line;
        }

        private Text(svg: SVGSVGElement, x: number, y: number, value: string): SVGTextElement
        {
            const text = document.createElementNS(SVG_NS, 'text');
            text.classList.add('CurveEditor-Label');
            text.setAttribute('x', String(x)); text.setAttribute('y', String(y));
            text.textContent = value;
            svg.append(text);
            return text;
        }

        private Color(group?: string): string
        {
            if(group === 'rotation') return '#e69a45';
            if(group === 'scale') return '#42bd50';
            if(group === 'position') return '#4b9ee9';
            return '#9ca4ab';
        }

        private Format(value: number): string
        {
            return Math.abs(value) >= 10 ? String(Math.round(value)) : value.toFixed(1).replace('.0', '');
        }
    }
}

export type CurveEditorOptions = CurveEditor.Interfaces.CurveEditorOptions;
export type CurveSample = CurveEditor.Interfaces.CurveSample;
export type CurvePoint = CurveEditor.Interfaces.CurvePoint;
export default CurveEditor.CurveEditor;
